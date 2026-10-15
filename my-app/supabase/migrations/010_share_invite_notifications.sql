-- Notify the viewer when a tracking invite is sent, and the athlete when
-- that invite is accepted or declined. Writes the mailbox row and sends
-- an Expo push to the recipient's registered devices.

create extension if not exists pg_net with schema extensions;

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
      'share_declined'::text
    ])
  );

create or replace function public.notify_athlete_share_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_recipient uuid;
  v_actor uuid;
  v_actor_name text;
  v_title text;
  v_body text;
  v_messages jsonb;
begin
  if tg_op = 'UPDATE' and old.status is not distinct from new.status then
    return new;
  end if;

  if new.status = 'pending'
     and (tg_op = 'INSERT' or old.status is distinct from 'pending') then
    v_type := 'share_invite';
    v_recipient := new.viewer_id;
    v_actor := new.athlete_id;
    v_title := 'Tracking invite';
  elsif new.status = 'accepted'
     and (tg_op = 'INSERT' or old.status is distinct from 'accepted') then
    v_type := 'share_accepted';
    v_recipient := new.athlete_id;
    v_actor := new.viewer_id;
    v_title := 'Invite accepted';
  elsif tg_op = 'UPDATE'
     and new.status = 'revoked'
     and old.status = 'pending'
     and auth.uid() = new.viewer_id then
    v_type := 'share_declined';
    v_recipient := new.athlete_id;
    v_actor := new.viewer_id;
    v_title := 'Invite declined';
  else
    return new;
  end if;

  select coalesce(nullif(p.name, ''), p.username, 'Someone')
    into v_actor_name
  from public.profiles p
  where p.id = v_actor;

  v_actor_name := coalesce(v_actor_name, 'Someone');

  if v_type = 'share_invite' then
    v_body := v_actor_name || ' shared their records with you';
  elsif v_type = 'share_accepted' then
    v_body := v_actor_name || ' accepted your sharing invite';
  else
    v_body := v_actor_name || ' declined your sharing invite';
  end if;

  insert into public.social_notifications (recipient_user_id, actor_user_id, type)
  values (v_recipient, v_actor, v_type);

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'to', t.expo_push_token,
        'title', v_title,
        'body', v_body,
        'sound', 'default',
        'data', jsonb_build_object(
          'type', v_type,
          'userId', v_actor::text,
          'athleteId', new.athlete_id::text
        )
      )
    ),
    '[]'::jsonb
  )
    into v_messages
  from public.push_tokens t
  where t.user_id = v_recipient
    and t.expo_push_token like 'ExponentPushToken[%';

  if v_messages <> '[]'::jsonb then
    begin
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        body := v_messages,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Accept', 'application/json'
        )
      );
    exception
      when others then
        raise warning 'share push failed: %', sqlerrm;
    end;
  end if;

  return new;
end;
$$;

revoke all on function public.notify_athlete_share_change() from public, anon, authenticated;

drop trigger if exists athlete_record_shares_notify on public.athlete_record_shares;

create trigger athlete_record_shares_notify
after insert or update of status on public.athlete_record_shares
for each row
execute function public.notify_athlete_share_change();
