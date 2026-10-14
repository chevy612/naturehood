-- Comments could store two images and 300 characters of text. Replies need
-- up to three images or three videos (never both), plus a meal and a workout
-- in the same payload posts already use. The longer content limit matches posts
-- so a workout log fits in the comment body.

ALTER TABLE public.social_comments
  ADD COLUMN IF NOT EXISTS videos text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.social_comments DROP CONSTRAINT social_comments_content_check;
ALTER TABLE public.social_comments ADD CONSTRAINT social_comments_content_check CHECK (
  char_length(content) <= 5000
  AND (
    btrim(content) <> ''
    OR cardinality(images) > 0
    OR cardinality(videos) > 0
  )
);

ALTER TABLE public.social_comments DROP CONSTRAINT social_comments_images_limit;
ALTER TABLE public.social_comments ADD CONSTRAINT social_comments_images_limit CHECK (cardinality(images) <= 3);

ALTER TABLE public.social_comments DROP CONSTRAINT IF EXISTS social_comments_videos_limit;
ALTER TABLE public.social_comments ADD CONSTRAINT social_comments_videos_limit CHECK (cardinality(videos) <= 3);

ALTER TABLE public.social_comments DROP CONSTRAINT IF EXISTS social_comments_one_media_kind;
ALTER TABLE public.social_comments ADD CONSTRAINT social_comments_one_media_kind CHECK (
  cardinality(images) = 0 OR cardinality(videos) = 0
);

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
    'videos', row.videos,
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
