-- Profile body metrics and demographics (canonical: weight_kg, height_cm).

alter table public.profiles
  add column if not exists weight_kg numeric,
  add column if not exists height_cm numeric,
  add column if not exists gender text,
  add column if not exists ethnicity text;

alter table public.profiles
  drop constraint if exists profiles_gender_check;
alter table public.profiles
  add constraint profiles_gender_check
  check (
    gender is null
    or gender in ('woman', 'man', 'non_binary', 'prefer_not_to_say')
  );

alter table public.profiles
  drop constraint if exists profiles_weight_kg_check;
alter table public.profiles
  add constraint profiles_weight_kg_check
  check (weight_kg is null or (weight_kg >= 20 and weight_kg <= 500));

alter table public.profiles
  drop constraint if exists profiles_height_cm_check;
alter table public.profiles
  add constraint profiles_height_cm_check
  check (height_cm is null or (height_cm >= 50 and height_cm <= 300));

alter table public.profiles
  drop constraint if exists profiles_ethnicity_check;
alter table public.profiles
  add constraint profiles_ethnicity_check
  check (
    ethnicity is null
    or char_length(ethnicity) <= 64
  );

grant select (weight_kg, height_cm, gender, ethnicity),
  update (weight_kg, height_cm, gender, ethnicity)
  on public.profiles to authenticated;
