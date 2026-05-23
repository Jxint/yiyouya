create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid null,
  nickname text not null default 'Demo User',
  active_pet_id uuid null,
  preference_summary text,
  preference_tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  type text not null,
  personality text,
  avatar_url text,
  reference_image_url text,
  intimacy integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pets_type_check check (type in ('cat', 'panda', 'dragon'))
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_active_pet_id_fkey'
  ) then
    alter table public.users
      add constraint users_active_pet_id_fkey
      foreign key (active_pet_id)
      references public.pets(id)
      on delete set null;
  end if;
end;
$$;

create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  region text,
  description text,
  image_url text,
  tags jsonb not null default '[]'::jsonb,
  is_mock boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.travel_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  destination_id uuid null references public.destinations(id) on delete set null,
  destination_name text,
  location_text text,
  weather_text text,
  travel_index integer not null default 0,
  status text not null default 'planning',
  travel_plan jsonb not null default '{}'::jsonb,
  diary_entries jsonb not null default '[]'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  agent_raw_output jsonb not null default '{}'::jsonb,
  image_url text,
  image_prompt text,
  extracted_tags jsonb not null default '[]'::jsonb,
  mood text,
  mood_delta integer not null default 0,
  intimacy_delta integer not null default 0,
  feedback_text text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travel_records_status_check check (
    status in (
      'planning',
      'waiting_departure',
      'generating_first_stop',
      'active',
      'pregenerating_next',
      'ended'
    )
  )
);

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  travel_record_id uuid not null references public.travel_records(id) on delete cascade,
  feedback_text text,
  extracted_preferences jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_auth_user_id on public.users(auth_user_id);
create index if not exists idx_pets_user_id on public.pets(user_id);
create index if not exists idx_travel_records_user_id on public.travel_records(user_id);
create index if not exists idx_travel_records_pet_id on public.travel_records(pet_id);
create index if not exists idx_travel_records_created_at on public.travel_records(created_at desc);
create index if not exists idx_feedbacks_user_id on public.feedbacks(user_id);
create index if not exists idx_feedbacks_travel_record_id on public.feedbacks(travel_record_id);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_pets_updated_at on public.pets;
create trigger set_pets_updated_at
before update on public.pets
for each row
execute function public.set_updated_at();

drop trigger if exists set_travel_records_updated_at on public.travel_records;
create trigger set_travel_records_updated_at
before update on public.travel_records
for each row
execute function public.set_updated_at();

insert into public.users (
  id,
  auth_user_id,
  nickname,
  active_pet_id,
  preference_summary,
  preference_tags
)
values (
  '00000000-0000-0000-0000-000000000001',
  null,
  'Demo User',
  null,
  '喜欢轻松、有故事感、适合慢旅行的目的地。',
  '["慢旅行", "自然风光", "城市漫步"]'::jsonb
)
on conflict (id) do update set
  nickname = excluded.nickname,
  preference_summary = excluded.preference_summary,
  preference_tags = excluded.preference_tags,
  updated_at = now();

insert into public.pets (
  id,
  user_id,
  name,
  type,
  personality,
  avatar_url,
  reference_image_url,
  intimacy
)
values
(
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  'Mochi',
  'cat',
  '精致优雅、矜持清冷，擅长用细腻的白描记录风景。',
  '/mock-images/pet-cat.png',
  '/mock-images/pet-cat-reference.jpg',
  3
),
(
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000001',
  'Bamboo',
  'panda',
  '憨厚忠诚、热爱美食，擅长发现目的地里的烟火气。',
  '/mock-images/pet-panda.png',
  '/mock-images/pet-panda-reference.jpg',
  3
),
(
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000001',
  'Lumi',
  'dragon',
  '随性、精力充沛，喜欢冒险和把旅途讲成热闹故事。',
  '/mock-images/pet-dragon.png',
  '/mock-images/pet-dragon-reference.jpg',
  3
)
on conflict (id) do update set
  user_id = excluded.user_id,
  name = excluded.name,
  type = excluded.type,
  personality = excluded.personality,
  avatar_url = excluded.avatar_url,
  reference_image_url = excluded.reference_image_url,
  intimacy = excluded.intimacy,
  updated_at = now();

update public.users
set
  active_pet_id = '00000000-0000-0000-0000-000000000101',
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000001';

insert into public.destinations (
  id,
  name,
  country,
  region,
  description,
  image_url,
  tags,
  is_mock
)
values
(
  '00000000-0000-0000-0000-000000000201',
  '京都',
  '日本',
  '关西',
  '古寺、庭院、町屋与季节风物交织的慢旅行目的地。',
  '/mock-images/kyoto-cover.jpg',
  '["古寺", "庭院", "樱花", "慢旅行"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000202',
  '雷克雅未克',
  '冰岛',
  '首都区',
  '靠近极光、温泉与火山地貌的北境城市。',
  '/mock-images/reykjavik-cover.jpg',
  '["极光", "温泉", "火山", "北欧"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000203',
  '里斯本',
  '葡萄牙',
  '里斯本大区',
  '坡道、电车、海风与瓷砖墙构成的明亮城市。',
  '/mock-images/lisbon-cover.jpg',
  '["电车", "海风", "街巷", "咖啡"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000204',
  '清迈',
  '泰国',
  '泰北',
  '寺庙、夜市、山林与松弛生活感并存的城市。',
  '/mock-images/chiang-mai-cover.jpg',
  '["夜市", "寺庙", "山林", "美食"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000205',
  '布拉格',
  '捷克',
  '波希米亚',
  '红屋顶、石桥与旧城广场组成的童话感城市。',
  '/mock-images/prague-cover.jpg',
  '["旧城", "石桥", "红屋顶", "童话感"]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-000000000206',
  '皇后镇',
  '新西兰',
  '奥塔哥',
  '湖泊、雪山与户外路线环绕的自然旅行目的地。',
  '/mock-images/queenstown-cover.jpg',
  '["湖泊", "雪山", "徒步", "自然风光"]'::jsonb,
  true
)
on conflict (id) do update set
  name = excluded.name,
  country = excluded.country,
  region = excluded.region,
  description = excluded.description,
  image_url = excluded.image_url,
  tags = excluded.tags,
  is_mock = excluded.is_mock;

comment on table public.travel_records is 'MVP travel records. Complex agent outputs are intentionally stored as jsonb: travel_plan, diary_entries, messages, agent_raw_output. Agent schemas may include greeting_bubble, journal_content, extracted_tags, visual_scene_extraction, image_prompt, pet_reference_image, reply_text, user_sentiment, extracted_preferences, intimacy_bonus.';

-- Future RLS examples, intentionally not executed for MVP:
-- alter table public.users enable row level security;
-- alter table public.pets enable row level security;
-- alter table public.destinations enable row level security;
-- alter table public.travel_records enable row level security;
-- alter table public.feedbacks enable row level security;
--
-- create policy "users can read own profile"
-- on public.users for select
-- using (auth_user_id = auth.uid());
--
-- create policy "users can update own profile"
-- on public.users for update
-- using (auth_user_id = auth.uid())
-- with check (auth_user_id = auth.uid());
--
-- create policy "users can manage own pets"
-- on public.pets for all
-- using (
--   user_id in (
--     select id from public.users where auth_user_id = auth.uid()
--   )
-- )
-- with check (
--   user_id in (
--     select id from public.users where auth_user_id = auth.uid()
--   )
-- );
--
-- create policy "users can read mock destinations"
-- on public.destinations for select
-- using (is_mock = true);
--
-- create policy "users can manage own travel records"
-- on public.travel_records for all
-- using (
--   user_id in (
--     select id from public.users where auth_user_id = auth.uid()
--   )
-- )
-- with check (
--   user_id in (
--     select id from public.users where auth_user_id = auth.uid()
--   )
-- );
--
-- create policy "users can manage own feedbacks"
-- on public.feedbacks for all
-- using (
--   user_id in (
--     select id from public.users where auth_user_id = auth.uid()
--   )
-- )
-- with check (
--   user_id in (
--     select id from public.users where auth_user_id = auth.uid()
--   )
-- );
