-- Notifications for log comments, plus notification housekeeping:
--   * new types log_comment (to the Athlete) and log_reply (to the parent comment's author)
--   * nullable log_comment_id FK
--   * partial index for unread lookups
--   * client UPDATE limited to read_at
--   * follow notifications deduped (same actor, still unread, within a day)
--   * EXECUTE revoked from clients on trigger functions
-- Requires 010 (share types in the check constraint) and 012 (log_comments).

ALTER TABLE public.social_notifications
  ADD COLUMN IF NOT EXISTS log_comment_id uuid
  REFERENCES public.log_comments(id) ON DELETE CASCADE;

ALTER TABLE public.social_notifications
  DROP CONSTRAINT IF EXISTS social_notifications_type_check;
ALTER TABLE public.social_notifications
  ADD CONSTRAINT social_notifications_type_check
  CHECK (
    type = ANY (ARRAY[
      'like'::text,
      'comment'::text,
      'reply'::text,
      'follow'::text,
      'share_invite'::text,
      'share_accepted'::text,
      'share_declined'::text,
      'log_comment'::text,
      'log_reply'::text
    ])
  );

CREATE INDEX IF NOT EXISTS social_notifications_recipient_unread_idx
  ON public.social_notifications (recipient_user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS social_notifications_log_comment_idx
  ON public.social_notifications (log_comment_id)
  WHERE log_comment_id IS NOT NULL;

-- Owners may only mark notifications read; type, actor and target stay immutable.
REVOKE UPDATE ON public.social_notifications FROM anon, authenticated;
GRANT UPDATE (read_at) ON public.social_notifications TO authenticated;

-- ---------------------------------------------------------------------------
-- Log comment notifications
--   log_comment: Athlete is told about any comment or reply by someone else
--                (unless the Athlete is the parent author and gets log_reply instead)
--   log_reply:   parent comment author, only while they still have access to the thread
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.log_comments_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_parent_author uuid;
BEGIN
  IF NEW.parent_comment_id IS NOT NULL THEN
    SELECT author_id INTO v_parent_author
    FROM public.log_comments WHERE id = NEW.parent_comment_id;

    IF v_parent_author IS NOT NULL
       AND v_parent_author <> NEW.author_id
       AND (
         v_parent_author = NEW.athlete_id
         OR EXISTS (
           SELECT 1 FROM public.athlete_record_shares s
           WHERE s.athlete_id = NEW.athlete_id
             AND s.viewer_id = v_parent_author
             AND s.status = 'accepted'
             AND (
               (NEW.log_type = 'workout' AND s.share_workouts)
               OR (NEW.log_type = 'meal' AND s.share_meals)
             )
         )
       ) THEN
      INSERT INTO public.social_notifications
        (recipient_user_id, actor_user_id, type, log_comment_id)
      VALUES (v_parent_author, NEW.author_id, 'log_reply', NEW.id);
    END IF;
  END IF;

  IF NEW.athlete_id <> NEW.author_id
     AND NEW.athlete_id IS DISTINCT FROM v_parent_author THEN
    INSERT INTO public.social_notifications
      (recipient_user_id, actor_user_id, type, log_comment_id)
    VALUES (NEW.athlete_id, NEW.author_id, 'log_comment', NEW.id);
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS log_comments_notify_trigger ON public.log_comments;
CREATE TRIGGER log_comments_notify_trigger
  AFTER INSERT ON public.log_comments
  FOR EACH ROW EXECUTE FUNCTION public.log_comments_notify();

-- ---------------------------------------------------------------------------
-- Follow dedupe: follow, unfollow, follow no longer stacks notifications.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.social_create_notification_for_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.social_notifications n
    WHERE n.recipient_user_id = NEW.followee_id
      AND n.actor_user_id = NEW.follower_id
      AND n.type = 'follow'
      AND n.read_at IS NULL
      AND n.created_at > now() - interval '1 day'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.social_notifications (recipient_user_id, actor_user_id, type)
  VALUES (NEW.followee_id, NEW.follower_id, 'follow');
  RETURN NULL;
END;
$$;

-- ---------------------------------------------------------------------------
-- Trigger functions are never meant to be called as RPCs.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  fn text;
  sig regprocedure;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.log_comments_notify()',
    'public.notify_athlete_share_change()',
    'public.social_create_notification_for_comment()',
    'public.social_create_notification_for_follow()',
    'public.social_create_notification_for_post_like()',
    'public.social_guard_post_update()',
    'public.social_update_comment_like_count()',
    'public.social_update_post_comment_count()',
    'public.social_update_post_like_count()',
    'public.social_validate_comment_parent()'
  ] LOOP
    sig := to_regprocedure(fn);
    IF sig IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
    END IF;
  END LOOP;
END
$$;

NOTIFY pgrst, 'reload schema';
