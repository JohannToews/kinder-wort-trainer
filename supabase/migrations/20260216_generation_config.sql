-- ============================================================
-- Migration: Granulare Generierungs-Konfiguration
-- Ersetzt die pauschale max_images_per_story durch eine
-- alters- und längenabhängige Matrix.
-- ============================================================

-- 1. generation_config Tabelle
create table if not exists generation_config (
  id uuid default gen_random_uuid() primary key,
  age_group text not null,              -- '6-7', '8-9', '10-11'
  story_length text not null,           -- 'short', 'medium', 'long', 'extra_long'

  -- Wortanzahl
  min_words integer not null,
  max_words integer not null,

  -- Bildanzahl
  scene_image_count integer not null,        -- Szenen-Bilder (OHNE Cover)
  include_cover boolean default true,        -- Cover-Bild ja/nein

  -- Labels für UI (mehrsprachig)
  length_labels jsonb not null,              -- {"de": "Kurz", "en": "Short", ...}
  length_description jsonb not null,         -- {"de": "~2-3 Min.", ...}

  -- Lesezeit-Schätzung
  estimated_reading_minutes integer not null,

  -- Steuerung
  is_active boolean default true,
  is_default boolean default false,          -- Welche Länge vorausgewählt?
  sort_order integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique(age_group, story_length)
);

-- Trigger für updated_at
create trigger update_generation_config_updated_at
  before update on generation_config
  for each row execute function update_updated_at_column();

-- RLS
alter table generation_config enable row level security;

create policy "Anyone can read generation_config"
  on generation_config for select using (true);

create policy "Admins can manage generation_config"
  on generation_config for all
  using (public.has_role(auth.uid(), 'admin'));

-- 2. Seed-Daten
insert into generation_config
  (age_group, story_length, min_words, max_words, scene_image_count, include_cover,
   length_labels, length_description, estimated_reading_minutes, is_default, sort_order)
values
-- === 6-7 Jahre ===
('6-7', 'short', 150, 250, 2, true,
  '{"de":"Kurz","fr":"Court","en":"Short","es":"Corto","it":"Breve","nl":"Kort","bs":"Kratko"}'::jsonb,
  '{"de":"~2-3 Min. Lesezeit","fr":"~2-3 min","en":"~2-3 min read","es":"~2-3 min","it":"~2-3 min","nl":"~2-3 min","bs":"~2-3 min"}'::jsonb,
  2, false, 1),

('6-7', 'medium', 250, 400, 3, true,
  '{"de":"Mittel","fr":"Moyen","en":"Medium","es":"Medio","it":"Medio","nl":"Gemiddeld","bs":"Srednje"}'::jsonb,
  '{"de":"~4-5 Min. Lesezeit","fr":"~4-5 min","en":"~4-5 min read","es":"~4-5 min","it":"~4-5 min","nl":"~4-5 min","bs":"~4-5 min"}'::jsonb,
  4, true, 2),

('6-7', 'long', 400, 600, 4, true,
  '{"de":"Lang","fr":"Long","en":"Long","es":"Largo","it":"Lungo","nl":"Lang","bs":"Dugo"}'::jsonb,
  '{"de":"~6-7 Min. Lesezeit","fr":"~6-7 min","en":"~6-7 min read","es":"~6-7 min","it":"~6-7 min","nl":"~6-7 min","bs":"~6-7 min"}'::jsonb,
  6, false, 3),

-- === 8-9 Jahre ===
('8-9', 'short', 250, 400, 2, true,
  '{"de":"Kurz","fr":"Court","en":"Short","es":"Corto","it":"Breve","nl":"Kort","bs":"Kratko"}'::jsonb,
  '{"de":"~3-4 Min. Lesezeit","fr":"~3-4 min","en":"~3-4 min read","es":"~3-4 min","it":"~3-4 min","nl":"~3-4 min","bs":"~3-4 min"}'::jsonb,
  3, false, 1),

('8-9', 'medium', 400, 650, 3, true,
  '{"de":"Mittel","fr":"Moyen","en":"Medium","es":"Medio","it":"Medio","nl":"Gemiddeld","bs":"Srednje"}'::jsonb,
  '{"de":"~5-6 Min. Lesezeit","fr":"~5-6 min","en":"~5-6 min read","es":"~5-6 min","it":"~5-6 min","nl":"~5-6 min","bs":"~5-6 min"}'::jsonb,
  5, true, 2),

('8-9', 'long', 650, 900, 4, true,
  '{"de":"Lang","fr":"Long","en":"Long","es":"Largo","it":"Lungo","nl":"Lang","bs":"Dugo"}'::jsonb,
  '{"de":"~7-8 Min. Lesezeit","fr":"~7-8 min","en":"~7-8 min read","es":"~7-8 min","it":"~7-8 min","nl":"~7-8 min","bs":"~7-8 min"}'::jsonb,
  7, false, 3),

('8-9', 'extra_long', 900, 1200, 5, true,
  '{"de":"Extra Lang","fr":"Très long","en":"Extra Long","es":"Extra largo","it":"Extra lungo","nl":"Extra lang","bs":"Ekstra dugo"}'::jsonb,
  '{"de":"~10-12 Min. Lesezeit","fr":"~10-12 min","en":"~10-12 min read","es":"~10-12 min","it":"~10-12 min","nl":"~10-12 min","bs":"~10-12 min"}'::jsonb,
  10, false, 4),

-- === 10-11 Jahre ===
('10-11', 'short', 350, 500, 2, true,
  '{"de":"Kurz","fr":"Court","en":"Short","es":"Corto","it":"Breve","nl":"Kort","bs":"Kratko"}'::jsonb,
  '{"de":"~3-4 Min. Lesezeit","fr":"~3-4 min","en":"~3-4 min read","es":"~3-4 min","it":"~3-4 min","nl":"~3-4 min","bs":"~3-4 min"}'::jsonb,
  3, false, 1),

('10-11', 'medium', 500, 800, 3, true,
  '{"de":"Mittel","fr":"Moyen","en":"Medium","es":"Medio","it":"Medio","nl":"Gemiddeld","bs":"Srednje"}'::jsonb,
  '{"de":"~5-6 Min. Lesezeit","fr":"~5-6 min","en":"~5-6 min read","es":"~5-6 min","it":"~5-6 min","nl":"~5-6 min","bs":"~5-6 min"}'::jsonb,
  5, true, 2),

('10-11', 'long', 800, 1100, 4, true,
  '{"de":"Lang","fr":"Long","en":"Long","es":"Largo","it":"Lungo","nl":"Lang","bs":"Dugo"}'::jsonb,
  '{"de":"~7-9 Min. Lesezeit","fr":"~7-9 min","en":"~7-9 min read","es":"~7-9 min","it":"~7-9 min","nl":"~7-9 min","bs":"~7-9 min"}'::jsonb,
  8, false, 3),

('10-11', 'extra_long', 1100, 1500, 5, true,
  '{"de":"Extra Lang","fr":"Très long","en":"Extra Long","es":"Extra largo","it":"Extra lungo","nl":"Extra lang","bs":"Ekstra dugo"}'::jsonb,
  '{"de":"~10-12 Min. Lesezeit","fr":"~10-12 min","en":"~10-12 min read","es":"~10-12 min","it":"~10-12 min","nl":"~10-12 min","bs":"~10-12 min"}'::jsonb,
  11, false, 4);

-- 3. Rate Limits Tabelle (separat von generation_config)
create table if not exists rate_limits_config (
  id uuid default gen_random_uuid() primary key,
  plan_type text unique not null,             -- 'free', 'premium', 'beta'
  max_stories_per_day integer not null,
  max_stories_per_kid_per_day integer,        -- Optional: pro Kind statt pro Account
  updated_at timestamptz default now()
);

create trigger update_rate_limits_config_updated_at
  before update on rate_limits_config
  for each row execute function update_updated_at_column();

alter table rate_limits_config enable row level security;

create policy "Anyone can read rate_limits_config"
  on rate_limits_config for select using (true);

create policy "Admins can manage rate_limits_config"
  on rate_limits_config for all
  using (public.has_role(auth.uid(), 'admin'));

insert into rate_limits_config (plan_type, max_stories_per_day, max_stories_per_kid_per_day) values
('free', 2, null),
('premium', 10, null),
('beta', 15, 5);

-- 4. story_length Spalte in stories (für Serien-Episoden)
alter table stories add column if not exists story_length text default 'medium';
