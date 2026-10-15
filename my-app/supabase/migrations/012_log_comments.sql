-- Team tab: one shared comment thread per workout or meal log.
--
-- The Athlete (log owner) and every Coach with an accepted share whose scope covers the log
-- type read and write the same thread. Same shape as social_comments (text plus up to 3
-- images or 3 videos), but a sibling table: social_comments is bound to social_posts and its
-- RLS, counters and notification triggers all assume a post.
--
-- Revoking a share hides the thread from that Coach; rows stay for the Athlete.
-- Attachments reuse the post_images bucket and its own-folder upload policy (006).
-- Requires 009 to 011 (athlete_record_shares).

CREATE TABLE IF NOT EXISTS public.log_comments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type          text NOT NULL CHECK (log_type IN ('workout', 'meal')),
  log_id            uuid NOT NULL,
  athlete_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES public.log_comments(id) ON DELETE CASCADE,
  author_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           text NOT NULL DEFAULT '',
  images            text[] NOT NULL DEFAULT '{}',
  videos            text[] NOT NULL DEFAULT '{}',
  content_type      text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT log_comments_content_check CHECK (
    char_length(content) <= 5000
    AND (btrim(content) <> '' OR cardinality(images) > 0 OR cardinality(videos) > 0)
  ),
  CONSTRAINT log_comments_images_limit CHECK (cardinality(images) <= 3),
  CONSTRAINT log_comments_videos_limit CHECK (cardinality(videos) <= 3),
  CONSTRAINT log_comments_one_media_kind CHECK (cardinality(images) = 0 OR cardinality(videos) = 0)
);

CREATE INDEX IF NOT EXISTS log_comments_log_parent_created_idx
  ON public.log_comments (log_type, log_id, parent_comment_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS log_comments_parent_created_idx
  ON public.log_comments (parent_comment_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS log_comments_athlete_idx
  ON public.log_comments (athlete_id);
CREATE INDEX IF NOT EXISTS log_comments_author_idx
  ON public.log_comments (author_id);

-- ---------------------------------------------------------------------------
-- Validation: the athlete really owns the log; a reply's parent is on the same log.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_comments_validate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_deleted boolean := false;
  v_parent_type text;
  v_parent_log uuid;
BEGIN
  IF NEW.log_type IS NULL OR NEW.log_type NOT IN ('workout', 'meal') THEN
    RAISE EXCEPTION 'invalid_log_type' USING ERRCODE = '22023';
  END IF;

  IF NEW.log_type = 'workout' THEN
    SELECT user_id, is_deleted INTO v_owner, v_deleted
    FROM public.training_logs WHERE id = NEW.log_id;
  ELSE
    SELECT user_id INTO v_owner
    FROM public.meal_records WHERE meal_id = NEW.log_id;
  END IF;

  IF v_owner IS NULL OR v_deleted THEN
    RAISE EXCEPTION 'log_not_found' USING ERRCODE = 'P0002';
  END IF;
  IF v_owner <> NEW.athlete_id THEN
    RAISE EXCEPTION 'log_not_owned' USING ERRCODE = '42501';
  END IF;

  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT log_type, log_id INTO v_parent_type, v_parent_log
    FROM public.log_comments WHERE id = NEW.parent_comment_id;
    IF v_parent_type IS NULL
       OR v_parent_type <> NEW.log_type
       OR v_parent_log <> NEW.log_id THEN
      RAISE EXCEPTION 'parent_comment_invalid' USING ERRCODE = '22023';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS log_comments_validate_trigger ON public.log_comments;
CREATE TRIGGER log_comments_validate_trigger
  BEFORE INSERT ON public.log_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_comments_validate();

-- log_id is polymorphic (no FK), so clean up when the log itself is hard-deleted.
CREATE OR REPLACE FUNCTION public.log_comments_cleanup_workout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.log_comments WHERE log_type = 'workout' AND log_id = OLD.id;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_comments_cleanup_meal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.log_comments WHERE log_type = 'meal' AND log_id = OLD.meal_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS log_comments_cleanup_workout_trigger ON public.training_logs;
CREATE TRIGGER log_comments_cleanup_workout_trigger
  AFTER DELETE ON public.training_logs
  FOR EACH ROW EXECUTE FUNCTION public.log_comments_cleanup_workout();

DROP TRIGGER IF EXISTS log_comments_cleanup_meal_trigger ON public.meal_records;
CREATE TRIGGER log_comments_cleanup_meal_trigger
  AFTER DELETE ON public.meal_records
  FOR EACH ROW EXECUTE FUNCTION public.log_comments_cleanup_meal();

REVOKE ALL ON FUNCTION public.log_comments_validate() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_comments_cleanup_workout() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_comments_cleanup_meal() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.log_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "athlete and scoped coaches read log comments" ON public.log_comments;
CREATE POLICY "athlete and scoped coaches read log comments"
  ON public.log_comments FOR SELECT TO authenticated
  USING (
    athlete_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.athlete_record_shares s
      WHERE s.athlete_id = log_comments.athlete_id
        AND s.viewer_id = (SELECT auth.uid())
        AND s.status = 'accepted'
        AND (
          (log_comments.log_type = 'workout' AND s.share_workouts)
          OR (log_comments.log_type = 'meal' AND s.share_meals)
        )
    )
  );

DROP POLICY IF EXISTS "athlete and scoped coaches create log comments" ON public.log_comments;
CREATE POLICY "athlete and scoped coaches create log comments"
  ON public.log_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND (
      athlete_id = (SELECT auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.athlete_record_shares s
        WHERE s.athlete_id = log_comments.athlete_id
          AND s.viewer_id = (SELECT auth.uid())
          AND s.status = 'accepted'
          AND (
            (log_comments.log_type = 'workout' AND s.share_workouts)
            OR (log_comments.log_type = 'meal' AND s.share_meals)
          )
      )
    )
  );

DROP POLICY IF EXISTS "author or athlete deletes log comments" ON public.log_comments;
CREATE POLICY "author or athlete deletes log comments"
  ON public.log_comments FOR DELETE TO authenticated
  USING (author_id = (SELECT auth.uid()) OR athlete_id = (SELECT auth.uid()));

-- No edits in v1: no UPDATE policy and no UPDATE privilege.
REVOKE ALL ON public.log_comments FROM anon;
REVOKE ALL ON public.log_comments FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.log_comments TO authenticated;

-- ---------------------------------------------------------------------------
-- DTO + list RPCs. SECURITY INVOKER on purpose: RLS decides what each caller sees,
-- so an out-of-scope or revoked Coach gets an empty result.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_comment_dto(
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
      (SELECT count(*) FROM public.log_comments child WHERE child.parent_comment_id = comment.id) AS reply_count
    FROM public.log_comments comment
    WHERE comment.id = p_comment_id
  ), preview_replies AS (
    SELECT public.log_comment_dto(child.id, p_preview_limit) AS value
    FROM public.log_comments child
    JOIN comment_row parent ON child.parent_comment_id = parent.id
    ORDER BY child.created_at ASC, child.id ASC
    LIMIT GREATEST(p_preview_limit, 0)
  )
  SELECT jsonb_strip_nulls(jsonb_build_object(
    'id', row.id,
    'postId', row.log_id,
    'logType', row.log_type,
    'logId', row.log_id,
    'athleteId', row.athlete_id,
    'parentCommentId', row.parent_comment_id,
    'authorId', row.author_id,
    'content', row.content,
    'images', row.images,
    'videos', row.videos,
    'contentType', row.content_type,
    'createdAt', row.created_at,
    'likeCount', 0,
    'likedByMe', false,
    'replyCount', row.reply_count,
    'replies', CASE
      WHEN row.reply_count = 0 THEN NULL
      ELSE COALESCE((SELECT jsonb_agg(value) FROM preview_replies), '[]'::jsonb)
    END
  ))
  FROM comment_row row;
$$;

CREATE OR REPLACE FUNCTION public.list_log_comments(
  p_log_type text,
  p_log_id uuid,
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
    SELECT c.id, c.created_at
    FROM public.log_comments c
    WHERE c.log_type = p_log_type
      AND c.log_id = p_log_id
      AND c.parent_comment_id IS NOT DISTINCT FROM p_parent_comment_id
      AND (
        p_cursor_created_at IS NULL
        OR (c.created_at, c.id) > (p_cursor_created_at, p_cursor_id)
      )
    ORDER BY c.created_at ASC, c.id ASC
    LIMIT LEAST(GREATEST(p_limit, 1), 51)
  )
  SELECT public.log_comment_dto(page.id), page.created_at, page.id
  FROM page;
$$;

CREATE OR REPLACE FUNCTION public.log_comment_counts(
  p_log_type text,
  p_log_ids uuid[]
)
RETURNS TABLE (log_id uuid, comment_count bigint)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT c.log_id, count(*)::bigint
  FROM public.log_comments c
  WHERE c.log_type = p_log_type
    AND c.log_id = ANY (p_log_ids[1:200])
  GROUP BY c.log_id;
$$;

REVOKE ALL ON FUNCTION public.log_comment_dto(uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.list_log_comments(text, uuid, uuid, timestamptz, uuid, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_comment_counts(text, uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.log_comment_dto(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_log_comments(text, uuid, uuid, timestamptz, uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_comment_counts(text, uuid[]) TO authenticated;

NOTIFY pgrst, 'reload schema';
