-- Athlete / Coach mode on the profile, and likes on log-comment threads.
--
-- team_mode is a view preference (which Team tabs the person sees). It is not
-- an authorization role. profiles privileges are column-level, so the new
-- column is granted explicitly.
--
-- Likes notify the log's Athlete (activity on their logs) and, when that is
-- someone else, the comment's author. log_type / log_id / athlete_id are
-- copied onto the notification so clients can open the comment thread without
-- a join that column grants would hide.

alter table public.profiles
  add column if not exists team_mode text not null default 'athlete';

alter table public.profiles
  drop constraint if exists profiles_team_mode_check;
alter table public.profiles
  add constraint profiles_team_mode_check
  check (team_mode in ('athlete', 'coach'));

grant select (team_mode), update (team_mode) on public.profiles to authenticated;

alter table public.social_notifications
  add column if not exists log_type text,
  add column if not exists log_id uuid,
  add column if not exists athlete_id uuid;

alter table public.social_notifications
  drop constraint if exists social_notifications_log_type_check;
alter table public.social_notifications
  add constraint social_notifications_log_type_check
  check (log_type is null or log_type in ('workout', 'meal'));

alter table public.social_notifications
  drop constraint if exists social_notifications_type_check;
alter table public.social_notifications
  add constraint social_notifications_type_check
  check (
    type = any (array[
      'like'::text,
      'comment'::text,
      'reply'::text,
      'follow'::text,
      'share_invite'::text,
      'share_accepted'::text,
      'share_declined'::text,
      'log_comment'::text,
      'log_reply'::text,
      'log_comment_like'::text
    ])
  );

grant select (log_type, log_id, athlete_id) on public.social_notifications to authenticated;

update public.social_notifications n
set
  log_type = c.log_type,
  log_id = c.log_id,
  athlete_id = c.athlete_id
from public.log_comments c
where n.log_comment_id = c.id
  and n.athlete_id is null;

-- ---------------------------------------------------------------------------
-- Log comment likes. Visibility matches the thread: Athlete, or a Coach whose
-- accepted share covers that log type. The subquery hits log_comments under
-- the caller's RLS, so a revoked Coach cannot see or add likes.
-- ---------------------------------------------------------------------------

create table if not exists public.log_comment_likes (
  comment_id uuid not null references public.log_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

alter table public.log_comment_likes enable row level security;

drop policy if exists "readers see likes on visible log comments" on public.log_comment_likes;
create policy "readers see likes on visible log comments"
  on public.log_comment_likes
  for select
  to authenticated
  using (
    exists (
      select 1 from public.log_comments c
      where c.id = log_comment_likes.comment_id
    )
  );

drop policy if exists "readers like visible log comments" on public.log_comment_likes;
create policy "readers like visible log comments"
  on public.log_comment_likes
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.log_comments c
      where c.id = log_comment_likes.comment_id
    )
  );

drop policy if exists "users remove their own log comment likes" on public.log_comment_likes;
create policy "users remove their own log comment likes"
  on public.log_comment_likes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.log_comment_likes from anon, PUBLIC;
grant select, insert, delete on public.log_comment_likes to authenticated;

-- ---------------------------------------------------------------------------
-- DTO: real like counts. SECURITY INVOKER so likedByMe is the caller.
-- ---------------------------------------------------------------------------

create or replace function public.log_comment_dto(
  p_comment_id uuid,
  p_preview_limit integer default 3
)
returns jsonb
language sql
stable
set search_path = public
as $$
  with comment_row as (
    select
      comment.*,
      (select count(*) from public.log_comments child where child.parent_comment_id = comment.id) as reply_count,
      (select count(*) from public.log_comment_likes liked where liked.comment_id = comment.id) as like_count,
      exists (
        select 1 from public.log_comment_likes liked
        where liked.comment_id = comment.id and liked.user_id = (select auth.uid())
      ) as liked_by_me
    from public.log_comments comment
    where comment.id = p_comment_id
  ), preview_replies as (
    select public.log_comment_dto(child.id, p_preview_limit) as value
    from public.log_comments child
    join comment_row parent on child.parent_comment_id = parent.id
    order by child.created_at asc, child.id asc
    limit greatest(p_preview_limit, 0)
  )
  select jsonb_strip_nulls(jsonb_build_object(
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
    'likeCount', row.like_count,
    'likedByMe', row.liked_by_me,
    'replyCount', row.reply_count,
    'replies', case
      when row.reply_count = 0 then null
      else coalesce((select jsonb_agg(value) from preview_replies), '[]'::jsonb)
    end
  ))
  from comment_row row;
$$;

create or replace function public.toggle_log_comment_like(p_comment_id uuid)
returns boolean
language plpgsql
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (select 1 from public.log_comments where id = p_comment_id) then
    raise exception 'comment_not_found';
  end if;

  delete from public.log_comment_likes
  where comment_id = p_comment_id and user_id = (select auth.uid());

  if found then
    return false;
  end if;

  insert into public.log_comment_likes (comment_id, user_id)
  values (p_comment_id, (select auth.uid()));
  return true;
end;
$$;

revoke all on function public.toggle_log_comment_like(uuid) from PUBLIC, anon;
grant execute on function public.toggle_log_comment_like(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Notifications carry the log target so a tap can open that comment thread.
-- ---------------------------------------------------------------------------

create or replace function public.log_comments_notify()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_parent_author uuid;
begin
  if new.parent_comment_id is not null then
    select author_id into v_parent_author
    from public.log_comments where id = new.parent_comment_id;

    if v_parent_author is not null
       and v_parent_author <> new.author_id
       and (
         v_parent_author = new.athlete_id
         or exists (
           select 1 from public.athlete_record_shares s
           where s.athlete_id = new.athlete_id
             and s.viewer_id = v_parent_author
             and s.status = 'accepted'
             and (
               (new.log_type = 'workout' and s.share_workouts)
               or (new.log_type = 'meal' and s.share_meals)
             )
         )
       ) then
      insert into public.social_notifications
        (recipient_user_id, actor_user_id, type, log_comment_id, log_type, log_id, athlete_id)
      values (v_parent_author, new.author_id, 'log_reply', new.id, new.log_type, new.log_id, new.athlete_id);
    end if;
  end if;

  if new.athlete_id <> new.author_id
     and new.athlete_id is distinct from v_parent_author then
    insert into public.social_notifications
      (recipient_user_id, actor_user_id, type, log_comment_id, log_type, log_id, athlete_id)
    values (new.athlete_id, new.author_id, 'log_comment', new.id, new.log_type, new.log_id, new.athlete_id);
  end if;

  return null;
end;
$$;

create or replace function public.log_comment_likes_notify()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_athlete uuid;
  v_author uuid;
  v_log_type text;
  v_log_id uuid;
begin
  select athlete_id, author_id, log_type, log_id
    into v_athlete, v_author, v_log_type, v_log_id
  from public.log_comments
  where id = new.comment_id;

  if v_athlete is not null and v_athlete <> new.user_id then
    insert into public.social_notifications
      (recipient_user_id, actor_user_id, type, log_comment_id, log_type, log_id, athlete_id)
    values (v_athlete, new.user_id, 'log_comment_like', new.comment_id, v_log_type, v_log_id, v_athlete);
  end if;

  if v_author is not null and v_author <> new.user_id and v_author is distinct from v_athlete then
    insert into public.social_notifications
      (recipient_user_id, actor_user_id, type, log_comment_id, log_type, log_id, athlete_id)
    values (v_author, new.user_id, 'log_comment_like', new.comment_id, v_log_type, v_log_id, v_athlete);
  end if;

  return null;
end;
$$;

drop trigger if exists log_comment_likes_notify_trigger on public.log_comment_likes;
create trigger log_comment_likes_notify_trigger
  after insert on public.log_comment_likes
  for each row execute function public.log_comment_likes_notify();

revoke all on function public.log_comments_notify() from PUBLIC, anon, authenticated;
revoke all on function public.log_comment_likes_notify() from PUBLIC, anon, authenticated;

notify pgrst, 'reload schema';
