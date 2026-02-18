-- ============================================================
-- Migration: Add 4 new image styles (Batch 2)
-- ============================================================

INSERT INTO public.image_styles
  (style_key, labels, description, imagen_prompt_snippet, age_groups, default_for_ages, age_modifiers, sort_order)
VALUES

-- === 3D ADVENTURE ===
(
  '3d_adventure',
  '{
    "de": "3D Abenteuer",
    "fr": "Aventure 3D",
    "en": "3D Adventure",
    "es": "Aventura 3D",
    "it": "Avventura 3D",
    "bs": "3D Avantura",
    "nl": "3D Avontuur"
  }'::jsonb,
  '{
    "de": "Pixar-artiger Look mit glatten Texturen und lebendigen Farben.",
    "fr": "Style Pixar avec des textures lisses et des couleurs vives.",
    "en": "Pixar-like look with smooth textures and vibrant colors.",
    "es": "Estilo Pixar con texturas suaves y colores vibrantes.",
    "it": "Stile Pixar con texture lisce e colori vivaci.",
    "bs": "Pixar stil s glatkim teksturama i živim bojama.",
    "nl": "Pixar-achtige look met gladde texturen en levendige kleuren."
  }'::jsonb,
  '3D rendered illustration, Pixar-style, smooth textures, cinematic lighting, vibrant saturated colors, rounded character designs, subsurface scattering on skin, soft ambient occlusion, professional 3D animation quality.',
  '{6-7, 8-9, 10-11}',
  '{}',
  '{
    "6-7": "Very round and simple character shapes, big expressive eyes, bright primary colors, friendly and non-threatening.",
    "8-9": "Expressive cartoon-proportioned characters, dynamic poses, rich detailed environments, warm lighting.",
    "10-11": "Sophisticated character design, realistic lighting, cinematic depth of field, detailed textures and environments."
  }'::jsonb,
  70
),

-- === PIXEL ART ===
(
  'pixel_art',
  '{
    "de": "Pixel-Art",
    "fr": "Pixel Art",
    "en": "Pixel Art",
    "es": "Pixel Art",
    "it": "Pixel Art",
    "bs": "Pixel Art",
    "nl": "Pixel Art"
  }'::jsonb,
  '{
    "de": "Retro-Gaming-Look im 16-Bit-Stil.",
    "fr": "Style rétro jeux vidéo en 16-bit.",
    "en": "Retro gaming look in 16-bit style.",
    "es": "Aspecto retro de videojuegos en estilo 16-bit.",
    "it": "Stile retro videogiochi in 16-bit.",
    "bs": "Retro gaming izgled u 16-bitnom stilu.",
    "nl": "Retro gaming-look in 16-bit stijl."
  }'::jsonb,
  'Pixel art illustration, retro 16-bit video game aesthetic, colorful sprite-style characters, crisp pixel edges, limited color palette per element, nostalgic SNES-era quality, clean pixel placement, vibrant backgrounds with pixel detail.',
  '{6-7, 8-9, 10-11}',
  '{}',
  '{
    "6-7": "Large chunky pixels, very simple shapes, bright rainbow colors, cute round characters, minimal detail.",
    "8-9": "16-bit sprite quality, recognizable character features, colorful detailed backgrounds, adventure game feel.",
    "10-11": "Detailed 16-bit art, complex pixel environments, RPG game aesthetic, atmospheric pixel shading, indie game quality."
  }'::jsonb,
  80
),

-- === BRICK BLOCK (Klötzchen-Welt) ===
(
  'brick_block',
  '{
    "de": "Klötzchen-Welt",
    "fr": "Monde en Briques",
    "en": "Brick World",
    "es": "Mundo de Bloques",
    "it": "Mondo di Mattoncini",
    "bs": "Svijet Kockica",
    "nl": "Blokjeswereld"
  }'::jsonb,
  '{
    "de": "Bunte 3D-Blöcke wie LEGO — kreativ und verspielt.",
    "fr": "Blocs 3D colorés style LEGO — créatif et ludique.",
    "en": "Colorful 3D bricks like LEGO — creative and playful.",
    "es": "Bloques 3D coloridos estilo LEGO — creativo y juguetón.",
    "it": "Mattoncini 3D colorati stile LEGO — creativo e giocoso.",
    "bs": "Šareni 3D blokovi poput LEGO-a — kreativno i razigrano.",
    "nl": "Kleurrijke 3D-blokjes zoals LEGO — creatief en speels."
  }'::jsonb,
  'Illustration made of colorful interlocking toy bricks, construction toy inspired 3D style, brick-built characters and environments, plastic texture, rounded studs visible on surfaces, playful and creative, bright primary colors.',
  '{6-7, 8-9, 10-11}',
  '{}',
  '{
    "6-7": "Very simple brick constructions, large chunky bricks, minimal detail, bright basic colors, friendly round faces.",
    "8-9": "Detailed brick-built characters, recognizable environments, standard brick size, creative constructions, cheerful atmosphere.",
    "10-11": "Complex brick engineering, detailed environments and vehicles, mechanical elements, impressive sophisticated builds."
  }'::jsonb,
  90
),

-- === VINTAGE RETRO (Ligne Claire) ===
(
  'vintage_retro',
  '{
    "de": "Retro",
    "fr": "Rétro",
    "en": "Retro",
    "es": "Retro",
    "it": "Retrò",
    "bs": "Retro",
    "nl": "Retro"
  }'::jsonb,
  '{
    "de": "Nostalgischer Look mit Ligne Claire, wie Tim und Struppi.",
    "fr": "Style nostalgique ligne claire, comme Tintin.",
    "en": "Nostalgic look with ligne claire, like Tintin.",
    "es": "Estilo nostálgico ligne claire, como Tintín.",
    "it": "Stile nostalgico ligne claire, come Tintin.",
    "bs": "Nostalgičan izgled s ligne claire, poput Tintina.",
    "nl": "Nostalgische look met ligne claire, zoals Kuifje."
  }'::jsonb,
  'Vintage retro illustration, classic European comic ligne claire style, clean uniform outlines, flat colors with subtle shading, muted warm color palette, mid-century illustration feel, clear line technique, nostalgic atmosphere.',
  '{6-7, 8-9, 10-11}',
  '{}',
  '{
    "6-7": "Very simple clean outlines, flat bright colors, rounded friendly characters, minimal backgrounds, cheerful retro feel.",
    "8-9": "Classic ligne claire, clear readable characters, detailed but clean environments, adventure comic feel, warm muted palette.",
    "10-11": "Highly detailed ligne claire, atmospheric environments, nuanced shading within clean lines, graphic novel quality, sophisticated vintage palette."
  }'::jsonb,
  100
)
ON CONFLICT (style_key) DO NOTHING;
