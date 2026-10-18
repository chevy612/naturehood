-- One Expo push token == one app install. Reinstalls produced new device_ids
-- with the same token, so the same push was sent once per row.
delete from public.push_tokens t
using (
  select id,
         row_number() over (
           partition by expo_push_token
           order by updated_at desc nulls last, created_at desc nulls last, id
         ) as rn
  from public.push_tokens
) d
where t.id = d.id and d.rn > 1;

create unique index if not exists push_tokens_expo_push_token_key
  on public.push_tokens (expo_push_token);
