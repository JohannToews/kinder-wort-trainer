-- ============================================================
-- Migration: Image Styles Phase 1
-- Creates image_styles table with 6 seed styles + stories.image_style_key
-- ============================================================

-- 1. Create image_styles table
CREATE TABLE IF NOT EXISTS public.image_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style_key text UNIQUE NOT NULL,
  labels jsonb NOT NULL,
  description jsonb NOT NULL,
  imagen_prompt_snippet text NOT NULL,
  age_groups text[] NOT NULL,
  default_for_ages text[] DEFAULT '{}',
  age_modifiers jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  preview_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Trigger: auto-update updated_at
DROP TRIGGER IF EXISTS update_image_styles_updated_at ON public.image_styles;
CREATE TRIGGER update_image_styles_updated_at
  BEFORE UPDATE ON public.image_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. RLS: SELECT for all (same pattern as other rule tables)
ALTER TABLE public.image_styles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "image_styles_select" ON public.image_styles;
CREATE POLICY "image_styles_select" ON public.image_styles FOR SELECT USING (true);

-- 4. Seed 6 styles
INSERT INTO public.image_styles (
  style_key, labels, description, imagen_prompt_snippet,
  age_groups, default_for_ages, age_modifiers, sort_order
) VALUES
-- storybook_soft: Default for 6-7
(
  'storybook_soft',
  '{
    "de": "Bilderbuch (Sanft)",
    "fr": "Album illustré (Doux)",
    "en": "Picture Book (Soft)",
    "es": "Libro ilustrado (Suave)",
    "it": "Libro illustrato (Morbido)",
    "bs": "Slikovnica (Nježno)",
    "nl": "Prentenboek (Zacht)"
  }'::jsonb,
  '{
    "de": "Weiche, warme Farben wie in einem klassischen Bilderbuch. Rundliche Formen, sanfte Übergänge.",
    "fr": "Couleurs douces et chaudes comme dans un album classique. Formes arrondies, transitions fluides.",
    "en": "Soft, warm colours like a classic picture book. Rounded shapes, gentle transitions.",
    "es": "Colores suaves y cálidos como en un libro ilustrado clásico. Formas redondeadas, transiciones suaves.",
    "it": "Colori morbidi e caldi come in un classico libro illustrato. Forme arrotondate, transizioni delicate.",
    "bs": "Meke, tople boje kao u klasičnoj slikovnici. Zaobljeni oblici, nježni prijelazi.",
    "nl": "Zachte, warme kleuren zoals in een klassiek prentenboek. Ronde vormen, zachte overgangen."
  }'::jsonb,
  'Soft watercolor picture book illustration, gentle pastel tones, rounded friendly shapes, warm lighting, cozy atmosphere, hand-painted texture, children''s book art style.',
  '{6-7, 8-9}',
  '{6-7}',
  '{
    "6-7": "Extra simple composition, very large friendly characters, minimal background detail, extremely soft and safe feeling.",
    "8-9": "Slightly more background detail, characters can show more expression, still soft and warm."
  }'::jsonb,
  10
),
-- storybook_vibrant
(
  'storybook_vibrant',
  '{
    "de": "Bilderbuch (Leuchtend)",
    "fr": "Album illustré (Vibrant)",
    "en": "Picture Book (Vibrant)",
    "es": "Libro ilustrado (Vibrante)",
    "it": "Libro illustrato (Vibrante)",
    "bs": "Slikovnica (Živopisno)",
    "nl": "Prentenboek (Levendig)"
  }'::jsonb,
  '{
    "de": "Kräftige, leuchtende Farben voller Energie. Modern und fröhlich.",
    "fr": "Couleurs vives et énergiques. Moderne et joyeux.",
    "en": "Bold, vibrant colours full of energy. Modern and cheerful.",
    "es": "Colores vivos y vibrantes llenos de energía. Moderno y alegre.",
    "it": "Colori vivaci e vibranti pieni di energia. Moderno e allegro.",
    "bs": "Jarke, živopisne boje pune energije. Moderno i veselo.",
    "nl": "Felle, levendige kleuren vol energie. Modern en vrolijk."
  }'::jsonb,
  'Vibrant colorful children''s book illustration, bold saturated colors, dynamic compositions, modern cartoon style, cheerful and energetic, crisp clean lines, playful atmosphere.',
  '{6-7, 8-9}',
  '{}',
  '{
    "6-7": "Bright primary colors, very simple backgrounds, big cheerful characters with exaggerated expressions.",
    "8-9": "Rich color palette, more dynamic poses, characters show personality and attitude."
  }'::jsonb,
  20
),
-- manga_anime
(
  'manga_anime',
  '{
    "de": "Manga / Anime",
    "fr": "Manga / Anime",
    "en": "Manga / Anime",
    "es": "Manga / Anime",
    "it": "Manga / Anime",
    "bs": "Manga / Anime",
    "nl": "Manga / Anime"
  }'::jsonb,
  '{
    "de": "Japanischer Anime-Stil mit großen ausdrucksstarken Augen und dynamischen Posen.",
    "fr": "Style anime japonais avec de grands yeux expressifs et des poses dynamiques.",
    "en": "Japanese anime style with large expressive eyes and dynamic poses.",
    "es": "Estilo anime japonés con grandes ojos expresivos y poses dinámicas.",
    "it": "Stile anime giapponese con grandi occhi espressivi e pose dinamiche.",
    "bs": "Japanski anime stil s velikim izražajnim očima i dinamičnim pozama.",
    "nl": "Japanse anime-stijl met grote expressieve ogen en dynamische poses."
  }'::jsonb,
  'Anime-style children''s illustration, large expressive eyes, dynamic action poses, vibrant cel-shaded colors, manga-inspired composition, emotional expressions, Japanese animation aesthetic.',
  '{8-9, 10-11}',
  '{}',
  '{
    "8-9": "Cute chibi-influenced proportions, bright cheerful anime palette, fun action poses.",
    "10-11": "More mature anime proportions, dramatic lighting, cool confident character designs, cinematic angles."
  }'::jsonb,
  30
),
-- adventure_cartoon: Default for 8-9
(
  'adventure_cartoon',
  '{
    "de": "Abenteuer-Cartoon",
    "fr": "Dessin animé d''aventure",
    "en": "Adventure Cartoon",
    "es": "Dibujo de aventura",
    "it": "Cartone d''avventura",
    "bs": "Avanturistički crtani",
    "nl": "Avonturenstrip"
  }'::jsonb,
  '{
    "de": "Kühner, actionreicher Cartoon-Stil. Mutige Helden und spannende Szenen.",
    "fr": "Style cartoon audacieux et plein d''action. Héros courageux et scènes passionnantes.",
    "en": "Bold, action-packed cartoon style. Brave heroes and exciting scenes.",
    "es": "Estilo de dibujos animados audaz y lleno de acción. Héroes valientes y escenas emocionantes.",
    "it": "Stile cartoon audace e pieno di azione. Eroi coraggiosi e scene emozionanti.",
    "bs": "Hrabar, akcijski stil crtanog filma. Hrabri heroji i uzbudljive scene.",
    "nl": "Gedurfde, actievolle cartoonstijl. Dappere helden en spannende scènes."
  }'::jsonb,
  'Adventure cartoon illustration, bold outlines, dynamic action compositions, heroic character poses, exciting atmosphere, comic book influence, bright contrasting colors, confident character expressions.',
  '{8-9, 10-11}',
  '{8-9}',
  '{
    "8-9": "Fun adventure style, characters look capable and cool, bold colors, action-ready poses.",
    "10-11": "More detailed environments, characters with attitude and personality, dramatic compositions, cool factor high."
  }'::jsonb,
  40
),
-- graphic_novel: Default for 10-11
(
  'graphic_novel',
  '{
    "de": "Graphic Novel",
    "fr": "Roman graphique",
    "en": "Graphic Novel",
    "es": "Novela gráfica",
    "it": "Romanzo grafico",
    "bs": "Grafički roman",
    "nl": "Graphic novel"
  }'::jsonb,
  '{
    "de": "Filmischer Graphic-Novel-Stil mit dramatischer Beleuchtung und komplexen Emotionen.",
    "fr": "Style roman graphique cinématique avec éclairage dramatique et émotions complexes.",
    "en": "Cinematic graphic novel style with dramatic lighting and complex emotions.",
    "es": "Estilo de novela gráfica cinematográfica con iluminación dramática y emociones complejas.",
    "it": "Stile graphic novel cinematografico con illuminazione drammatica ed emozioni complesse.",
    "bs": "Kinematski stil grafičkog romana s dramatičnim osvjetljenjem i složenim emocijama.",
    "nl": "Filmische graphic novel-stijl met dramatische belichting en complexe emoties."
  }'::jsonb,
  'Graphic novel illustration style, cinematic compositions, dramatic lighting and shadows, semi-realistic characters with individual style, sophisticated color palette, atmospheric moody scenes, complex emotional expressions, visual storytelling.',
  '{10-11}',
  '{10-11}',
  '{
    "10-11": "Mature graphic novel aesthetic, characters look like real pre-teens with attitude, atmospheric moody lighting, cinematic compositions, cool and sophisticated."
  }'::jsonb,
  50
),
-- semi_realistic
(
  'semi_realistic',
  '{
    "de": "Semi-Realistisch",
    "fr": "Semi-réaliste",
    "en": "Semi-Realistic",
    "es": "Semi-realista",
    "it": "Semi-realistico",
    "bs": "Polu-realističan",
    "nl": "Semi-realistisch"
  }'::jsonb,
  '{
    "de": "Fast realistische Illustration mit künstlerischem Touch. Detailliert und atmosphärisch.",
    "fr": "Illustration presque réaliste avec une touche artistique. Détaillée et atmosphérique.",
    "en": "Near-realistic illustration with artistic touch. Detailed and atmospheric.",
    "es": "Ilustración casi realista con toque artístico. Detallada y atmosférica.",
    "it": "Illustrazione quasi realistica con tocco artistico. Dettagliata e atmosferica.",
    "bs": "Gotovo realistična ilustracija s umjetničkim dodirom. Detaljna i atmosferična.",
    "nl": "Bijna-realistische illustratie met artistieke toets. Gedetailleerd en sfeervol."
  }'::jsonb,
  'Semi-realistic digital illustration, realistic proportions with artistic stylization, detailed environments, atmospheric lighting, painterly texture, cinematic quality, young adult book illustration style.',
  '{10-11}',
  '{}',
  '{
    "10-11": "Young adult illustration aesthetic, realistic proportions, dramatic atmospheric lighting, sophisticated visual storytelling, mature and cool."
  }'::jsonb,
  60
)
ON CONFLICT (style_key) DO NOTHING;

-- 5. Add image_style_key column to stories table
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS image_style_key text;
