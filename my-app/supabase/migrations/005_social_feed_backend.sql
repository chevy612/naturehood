-- Supabase-native social feed backend. This replaces the Java service's
-- MongoDB collections, Redis sorted-set timelines, fan-out, and Pub/Sub SSE.

CREATE TABLE IF NOT EXISTS public.social_feed_settings (
  singleton                     boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  engagement_boost_hours        numeric NOT NULL DEFAULT 4 CHECK (engagement_boost_hours >= 0),
  affinity_boost_hours          numeric NOT NULL DEFAULT 1 CHECK (affinity_boost_hours >= 0),
  self_affinity                 numeric NOT NULL DEFAULT 0.6 CHECK (self_affinity BETWEEN 0 AND 1),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.social_feed_settings (singleton)
VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.social_posts (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content                       text,
  images                        text[] NOT NULL DEFAULT '{}',
  content_type                  text,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  like_count                    integer NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  comment_count                 integer NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  repost_count                  integer NOT NULL DEFAULT 0 CHECK (repost_count >= 0),
  deleted_at                    timestamptz,
  search_vector                 tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(content, ''))
  ) STORED,
  CONSTRAINT social_posts_content_or_image CHECK (
    coalesce(btrim(content), '') <> '' OR cardinality(images) > 0
  ),
  CONSTRAINT social_posts_content_length CHECK (content IS NULL OR char_length(content) <= 5000),
  CONSTRAINT social_posts_images_limit CHECK (cardinality(images) <= 4)
);

CREATE TABLE IF NOT EXISTS public.social_comments (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id                       uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  parent_comment_id             uuid REFERENCES public.social_comments(id) ON DELETE CASCADE,
  author_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content                       text NOT NULL CHECK (btrim(content) <> '' AND char_length(content) <= 300),
  images                        text[] NOT NULL DEFAULT '{}',
  content_type                  text,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  like_count                    integer NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  CONSTRAINT social_comments_images_limit CHECK (cardinality(images) <= 2)
);

CREATE TABLE IF NOT EXISTS public.social_post_likes (
  post_id                       uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id                       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.social_comment_likes (
  comment_id                    uuid NOT NULL REFERENCES public.social_comments(id) ON DELETE CASCADE,
  user_id                       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.social_follows (
  follower_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id                   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT social_follows_no_self_follow CHECK (follower_id <> followee_id)
);

CREATE TABLE IF NOT EXISTS public.social_notifications (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                          text NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'follow')),
  post_id                       uuid REFERENCES public.social_posts(id) ON DELETE CASCADE,
  comment_id                    uuid REFERENCES public.social_comments(id) ON DELETE CASCADE,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  read_at                        timestamptz
);

CREATE INDEX IF NOT EXISTS social_posts_author_created_idx
  ON public.social_posts (author_id, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS social_posts_created_idx
  ON public.social_posts (created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS social_posts_search_idx
  ON public.social_posts USING gin (search_vector)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS social_comments_post_parent_created_idx
  ON public.social_comments (post_id, parent_comment_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS social_comments_parent_created_idx
  ON public.social_comments (parent_comment_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS social_follows_followee_idx
  ON public.social_follows (followee_id, follower_id);
CREATE INDEX IF NOT EXISTS social_notifications_recipient_created_idx
  ON public.social_notifications (recipient_user_id, created_at DESC);

ALTER TABLE public.social_feed_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social feed settings are readable" ON public.social_feed_settings;
CREATE POLICY "social feed settings are readable"
  ON public.social_feed_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated users read active social posts" ON public.social_posts;
CREATE POLICY "authenticated users read active social posts"
  ON public.social_posts FOR SELECT TO authenticated USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "users create their own social posts" ON public.social_posts;
CREATE POLICY "users create their own social posts"
  ON public.social_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "users update their own social posts" ON public.social_posts;
CREATE POLICY "users update their own social posts"
  ON public.social_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "authenticated users read social comments" ON public.social_comments;
CREATE POLICY "authenticated users read social comments"
  ON public.social_comments FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.social_posts post
    WHERE post.id = social_comments.post_id AND post.deleted_at IS NULL
  ));
DROP POLICY IF EXISTS "users create their own social comments" ON public.social_comments;
CREATE POLICY "users create their own social comments"
  ON public.social_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.social_posts post
      WHERE post.id = social_comments.post_id AND post.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "users read their own post likes" ON public.social_post_likes;
CREATE POLICY "users read their own post likes"
  ON public.social_post_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "users create their own post likes" ON public.social_post_likes;
CREATE POLICY "users create their own post likes"
  ON public.social_post_likes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.social_posts post
      WHERE post.id = social_post_likes.post_id AND post.deleted_at IS NULL
    )
  );
DROP POLICY IF EXISTS "users delete their own post likes" ON public.social_post_likes;
CREATE POLICY "users delete their own post likes"
  ON public.social_post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users read their own comment likes" ON public.social_comment_likes;
CREATE POLICY "users read their own comment likes"
  ON public.social_comment_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "users create their own comment likes" ON public.social_comment_likes;
CREATE POLICY "users create their own comment likes"
  ON public.social_comment_likes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND EXISTS (
      SELECT 1
      FROM public.social_comments comment
      JOIN public.social_posts post ON post.id = comment.post_id
      WHERE comment.id = social_comment_likes.comment_id AND post.deleted_at IS NULL
    )
  );
DROP POLICY IF EXISTS "users delete their own comment likes" ON public.social_comment_likes;
CREATE POLICY "users delete their own comment likes"
  ON public.social_comment_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated users read social follows" ON public.social_follows;
CREATE POLICY "authenticated users read social follows"
  ON public.social_follows FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "users create their own social follows" ON public.social_follows;
CREATE POLICY "users create their own social follows"
  ON public.social_follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
DROP POLICY IF EXISTS "users delete their own social follows" ON public.social_follows;
CREATE POLICY "users delete their own social follows"
  ON public.social_follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

DROP POLICY IF EXISTS "users read their own social notifications" ON public.social_notifications;
CREATE POLICY "users read their own social notifications"
  ON public.social_notifications FOR SELECT TO authenticated USING (recipient_user_id = auth.uid());
DROP POLICY IF EXISTS "users update their own social notifications" ON public.social_notifications;
CREATE POLICY "users update their own social notifications"
  ON public.social_notifications FOR UPDATE TO authenticated
  USING (recipient_user_id = auth.uid()) WITH CHECK (recipient_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.social_validate_comment_parent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_post_id uuid;
BEGIN
  IF NEW.parent_comment_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT post_id INTO parent_post_id
  FROM public.social_comments
  WHERE id = NEW.parent_comment_id;

  IF parent_post_id IS NULL THEN
    RAISE EXCEPTION 'Parent comment not found: %', NEW.parent_comment_id;
  END IF;

  IF parent_post_id <> NEW.post_id THEN
    RAISE EXCEPTION 'Parent comment does not belong to post: %', NEW.post_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS social_validate_comment_parent_trigger ON public.social_comments;
CREATE TRIGGER social_validate_comment_parent_trigger
  BEFORE INSERT ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION public.social_validate_comment_parent();

CREATE OR REPLACE FUNCTION public.social_update_post_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSE
    UPDATE public.social_posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS social_post_like_count_trigger ON public.social_post_likes;
CREATE TRIGGER social_post_like_count_trigger
  AFTER INSERT OR DELETE ON public.social_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.social_update_post_like_count();

CREATE OR REPLACE FUNCTION public.social_update_comment_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSE
    UPDATE public.social_comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS social_comment_like_count_trigger ON public.social_comment_likes;
CREATE TRIGGER social_comment_like_count_trigger
  AFTER INSERT OR DELETE ON public.social_comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.social_update_comment_like_count();

CREATE OR REPLACE FUNCTION public.social_update_post_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSE
    UPDATE public.social_posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS social_post_comment_count_trigger ON public.social_comments;
CREATE TRIGGER social_post_comment_count_trigger
  AFTER INSERT OR DELETE ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION public.social_update_post_comment_count();

CREATE OR REPLACE FUNCTION public.social_create_notification_for_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id uuid;
BEGIN
  SELECT author_id INTO recipient_id FROM public.social_posts WHERE id = NEW.post_id;
  IF recipient_id IS NOT NULL AND recipient_id <> NEW.user_id THEN
    INSERT INTO public.social_notifications (recipient_user_id, actor_user_id, type, post_id)
    VALUES (recipient_id, NEW.user_id, 'like', NEW.post_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS social_post_like_notification_trigger ON public.social_post_likes;
CREATE TRIGGER social_post_like_notification_trigger
  AFTER INSERT ON public.social_post_likes
  FOR EACH ROW EXECUTE FUNCTION public.social_create_notification_for_post_like();

CREATE OR REPLACE FUNCTION public.social_create_notification_for_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id uuid;
  parent_author_id uuid;
BEGIN
  SELECT author_id INTO post_author_id FROM public.social_posts WHERE id = NEW.post_id;

  IF NEW.parent_comment_id IS NULL THEN
    IF post_author_id IS NOT NULL AND post_author_id <> NEW.author_id THEN
      INSERT INTO public.social_notifications (recipient_user_id, actor_user_id, type, post_id, comment_id)
      VALUES (post_author_id, NEW.author_id, 'comment', NEW.post_id, NEW.id);
    END IF;
    RETURN NULL;
  END IF;

  SELECT author_id INTO parent_author_id FROM public.social_comments WHERE id = NEW.parent_comment_id;
  IF parent_author_id IS NOT NULL AND parent_author_id <> NEW.author_id THEN
    INSERT INTO public.social_notifications (recipient_user_id, actor_user_id, type, post_id, comment_id)
    VALUES (parent_author_id, NEW.author_id, 'reply', NEW.post_id, NEW.id);
  END IF;

  IF post_author_id IS NOT NULL
     AND post_author_id <> NEW.author_id
     AND post_author_id IS DISTINCT FROM parent_author_id THEN
    INSERT INTO public.social_notifications (recipient_user_id, actor_user_id, type, post_id, comment_id)
    VALUES (post_author_id, NEW.author_id, 'comment', NEW.post_id, NEW.id);
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS social_comment_notification_trigger ON public.social_comments;
CREATE TRIGGER social_comment_notification_trigger
  AFTER INSERT ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION public.social_create_notification_for_comment();

CREATE OR REPLACE FUNCTION public.social_create_notification_for_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.social_notifications (recipient_user_id, actor_user_id, type)
  VALUES (NEW.followee_id, NEW.follower_id, 'follow');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS social_follow_notification_trigger ON public.social_follows;
CREATE TRIGGER social_follow_notification_trigger
  AFTER INSERT ON public.social_follows
  FOR EACH ROW EXECUTE FUNCTION public.social_create_notification_for_follow();

CREATE OR REPLACE FUNCTION public.social_guard_post_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Counter triggers perform nested updates. Direct user updates may only
  -- soft-delete their own active post, because no post-edit API exists.
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF OLD.author_id <> auth.uid()
     OR OLD.deleted_at IS NOT NULL
     OR NEW.deleted_at IS NULL
     OR NEW.author_id IS DISTINCT FROM OLD.author_id
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.images IS DISTINCT FROM OLD.images
     OR NEW.content_type IS DISTINCT FROM OLD.content_type
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.like_count IS DISTINCT FROM OLD.like_count
     OR NEW.comment_count IS DISTINCT FROM OLD.comment_count
     OR NEW.repost_count IS DISTINCT FROM OLD.repost_count THEN
    RAISE EXCEPTION 'Only soft deletion of an active post is allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS social_guard_post_update_trigger ON public.social_posts;
CREATE TRIGGER social_guard_post_update_trigger
  BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.social_guard_post_update();

CREATE OR REPLACE FUNCTION public.social_comment_dto(
  p_comment_id uuid,
  p_preview_limit integer DEFAULT 3
)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH comment_row AS (
    SELECT
      comment.*,
      (SELECT count(*) FROM public.social_comments child WHERE child.parent_comment_id = comment.id) AS reply_count
    FROM public.social_comments comment
    WHERE comment.id = p_comment_id
  ), preview_replies AS (
    SELECT public.social_comment_dto(child.id, p_preview_limit) AS value
    FROM public.social_comments child
    JOIN comment_row parent ON child.parent_comment_id = parent.id
    ORDER BY child.created_at ASC, child.id ASC
    LIMIT GREATEST(p_preview_limit, 0)
  )
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'id', row.id,
    'postId', row.post_id,
    'parentCommentId', row.parent_comment_id,
    'authorId', row.author_id,
    'content', row.content,
    'images', row.images,
    'contentType', row.content_type,
    'createdAt', row.created_at,
    'likeCount', row.like_count,
    'likedByMe', EXISTS (
      SELECT 1 FROM public.social_comment_likes liked
      WHERE liked.comment_id = row.id AND liked.user_id = auth.uid()
    ),
    'replyCount', row.reply_count,
    'replies', CASE
      WHEN row.reply_count = 0 THEN NULL
      ELSE COALESCE((SELECT jsonb_agg(value) FROM preview_replies), '[]'::jsonb)
    END
  ))
  FROM comment_row row;
$$;

CREATE OR REPLACE FUNCTION public.list_social_comments(
  p_post_id uuid,
  p_parent_comment_id uuid DEFAULT NULL,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (comment jsonb, created_at timestamptz, id uuid)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH page AS (
    SELECT comment.id, comment.created_at
    FROM public.social_comments comment
    WHERE comment.post_id = p_post_id
      AND comment.parent_comment_id IS NOT DISTINCT FROM p_parent_comment_id
      AND (
        p_cursor_created_at IS NULL
        OR (comment.created_at, comment.id) > (p_cursor_created_at, p_cursor_id)
      )
    ORDER BY comment.created_at ASC, comment.id ASC
    LIMIT LEAST(GREATEST(p_limit, 1), 51)
  )
  SELECT public.social_comment_dto(page.id), page.created_at, page.id
  FROM page;
$$;

CREATE OR REPLACE FUNCTION public.list_social_feed(
  p_cursor_score double precision DEFAULT NULL,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  content text,
  images text[],
  content_type text,
  created_at timestamptz,
  like_count integer,
  comment_count integer,
  repost_count integer,
  liked_by_me boolean,
  rank_score double precision
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH scored AS (
    SELECT
      post.*,
      EXISTS (
        SELECT 1 FROM public.social_post_likes liked
        WHERE liked.post_id = post.id AND liked.user_id = auth.uid()
      ) AS liked_by_me,
      extract(epoch FROM post.created_at) * 1000
        + LEAST(1.0, ln(1 + post.like_count + post.comment_count + post.repost_count) / ln(1001.0))
            * settings.engagement_boost_hours * 3600000
        + CASE
            WHEN post.author_id = auth.uid() THEN settings.self_affinity
            WHEN EXISTS (
              SELECT 1 FROM public.social_follows follow
              WHERE follow.follower_id = auth.uid() AND follow.followee_id = post.author_id
            ) THEN 1.0
            ELSE settings.self_affinity
          END * settings.affinity_boost_hours * 3600000 AS rank_score
    FROM public.social_posts post
    CROSS JOIN public.social_feed_settings settings
    WHERE post.deleted_at IS NULL
  )
  SELECT
    scored.id, scored.author_id, scored.content, scored.images, scored.content_type,
    scored.created_at, scored.like_count, scored.comment_count, scored.repost_count,
    scored.liked_by_me, scored.rank_score
  FROM scored
  WHERE p_cursor_score IS NULL
    OR (scored.rank_score, scored.created_at, scored.id) < (p_cursor_score, p_cursor_created_at, p_cursor_id)
  ORDER BY scored.rank_score DESC, scored.created_at DESC, scored.id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 51);
$$;

CREATE OR REPLACE FUNCTION public.list_social_user_posts(
  p_user_id uuid,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  content text,
  images text[],
  content_type text,
  created_at timestamptz,
  like_count integer,
  comment_count integer,
  repost_count integer,
  liked_by_me boolean
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    post.id, post.author_id, post.content, post.images, post.content_type,
    post.created_at, post.like_count, post.comment_count, post.repost_count,
    EXISTS (
      SELECT 1 FROM public.social_post_likes liked
      WHERE liked.post_id = post.id AND liked.user_id = auth.uid()
    ) AS liked_by_me
  FROM public.social_posts post
  WHERE post.author_id = p_user_id
    AND post.deleted_at IS NULL
    AND (
      p_cursor_created_at IS NULL
      OR (post.created_at, post.id) < (p_cursor_created_at, p_cursor_id)
    )
  ORDER BY post.created_at DESC, post.id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 51);
$$;

CREATE OR REPLACE FUNCTION public.search_social_posts(
  p_query text,
  p_cursor_rank real DEFAULT NULL,
  p_cursor_created_at timestamptz DEFAULT NULL,
  p_cursor_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  author_id uuid,
  content text,
  images text[],
  content_type text,
  created_at timestamptz,
  like_count integer,
  comment_count integer,
  repost_count integer,
  liked_by_me boolean,
  search_rank real
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH ranked AS (
    SELECT
      post.*,
      ts_rank(post.search_vector, websearch_to_tsquery('simple', p_query)) AS search_rank,
      EXISTS (
        SELECT 1 FROM public.social_post_likes liked
        WHERE liked.post_id = post.id AND liked.user_id = auth.uid()
      ) AS liked_by_me
    FROM public.social_posts post
    WHERE post.deleted_at IS NULL
      AND post.search_vector @@ websearch_to_tsquery('simple', p_query)
  )
  SELECT
    ranked.id, ranked.author_id, ranked.content, ranked.images, ranked.content_type,
    ranked.created_at, ranked.like_count, ranked.comment_count, ranked.repost_count,
    ranked.liked_by_me, ranked.search_rank
  FROM ranked
  WHERE p_cursor_rank IS NULL
    OR (ranked.search_rank, ranked.created_at, ranked.id) < (p_cursor_rank, p_cursor_created_at, p_cursor_id)
  ORDER BY ranked.search_rank DESC, ranked.created_at DESC, ranked.id DESC
  LIMIT LEAST(GREATEST(p_limit, 1), 51);
$$;

CREATE OR REPLACE FUNCTION public.toggle_social_post_like(p_post_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.social_posts post
    WHERE post.id = p_post_id AND post.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Post not found: %', p_post_id;
  END IF;

  DELETE FROM public.social_post_likes
  WHERE post_id = p_post_id AND user_id = auth.uid();

  IF FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.social_post_likes (post_id, user_id)
  VALUES (p_post_id, auth.uid());
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_social_comment_like(p_comment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.social_comments comment
    JOIN public.social_posts post ON post.id = comment.post_id
    WHERE comment.id = p_comment_id AND post.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Comment not found: %', p_comment_id;
  END IF;

  DELETE FROM public.social_comment_likes
  WHERE comment_id = p_comment_id AND user_id = auth.uid();

  IF FOUND THEN
    RETURN false;
  END IF;

  INSERT INTO public.social_comment_likes (comment_id, user_id)
  VALUES (p_comment_id, auth.uid());
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.follow_social_user(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'A user cannot follow themselves';
  END IF;

  INSERT INTO public.social_follows (follower_id, followee_id)
  VALUES (auth.uid(), p_user_id)
  ON CONFLICT (follower_id, followee_id) DO NOTHING;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.unfollow_social_user(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SET search_path = public
AS $$
  DELETE FROM public.social_follows
  WHERE follower_id = auth.uid() AND followee_id = p_user_id;
  SELECT false;
$$;

REVOKE ALL ON FUNCTION public.social_comment_dto(uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_social_comments(uuid, uuid, timestamptz, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_social_feed(double precision, timestamptz, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_social_user_posts(uuid, timestamptz, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.search_social_posts(text, real, timestamptz, uuid, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_social_post_like(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_social_comment_like(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.follow_social_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unfollow_social_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_social_comments(uuid, uuid, timestamptz, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_social_feed(double precision, timestamptz, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_social_user_posts(uuid, timestamptz, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_social_posts(text, real, timestamptz, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_social_post_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_social_comment_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.follow_social_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unfollow_social_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.social_comment_dto(uuid, integer) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'social_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_posts;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'social_notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.social_notifications;
  END IF;
END;
$$;
