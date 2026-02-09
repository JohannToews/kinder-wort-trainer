-- ============================================================
-- Split image_style_rules age group "4-6" into "4-5" + new "6"
-- 
-- Problem: 6-year-olds were getting "chibi-like, oversized heads"
-- styling meant for 4-5 year olds, resulting in overly babyish images.
-- ============================================================

-- Step 1: Rename existing "4-6" general row to "4-5"
UPDATE public.image_style_rules
SET age_group = '4-5',
    updated_at = now()
WHERE age_group = '4-6' AND theme_key IS NULL;

-- Step 2: Rename existing "4-6" educational row to "4-5"
UPDATE public.image_style_rules
SET age_group = '4-5',
    updated_at = now()
WHERE age_group = '4-6' AND theme_key = 'educational';

-- Step 3: Insert new age group "6" (general) with age-appropriate styling
INSERT INTO public.image_style_rules (
  age_group, theme_key, style_prompt, negative_prompt, color_palette, art_style,
  character_style, complexity_level, forbidden_elements
) VALUES (
  '6', NULL,
  'Modern children book illustration for early readers. Style similar to Pixar concept art or modern Usborne books. Warm inviting atmosphere with depth and detail.',
  'No scary images, no dark shadows, no violence, no text or letters, no chibi proportions, no oversized heads, no babyish style',
  'Rich warm tones, vibrant natural colors, soft atmospheric lighting',
  'Modern children book / Pixar concept art',
  'Natural proportions, expressive cartoon faces, confident curious poses, age-appropriate clothing with personality. Characters look like real 6-year-olds — curious, adventurous, capable. NOT chibi, NOT oversized heads, NOT babyish.',
  'Semi-detailed backgrounds with 4-5 elements, mild depth and perspective, warm natural lighting. Some environmental detail to make the world feel real. Clear focal point with supporting elements.',
  'Scary shadows, sharp teeth, blood, weapons, skeletons, dark scenes, chibi proportions, oversized heads, babyish style, overly simplistic flat colors'
);

-- Step 4: Insert new age group "6" (educational) with age-appropriate styling
INSERT INTO public.image_style_rules (
  age_group, theme_key, style_prompt, negative_prompt, color_palette, art_style,
  character_style, complexity_level, forbidden_elements
) VALUES (
  '6', 'educational',
  'Clear educational illustration for early readers. Accurate but artistic details. Modern children book style.',
  'No scary images, no dark shadows, no violence, no text or letters, no chibi proportions, no oversized heads',
  'Clear bright colors with good contrast for learning context',
  'Educational children book illustration',
  'Natural proportions, expressive faces showing curiosity and understanding. Characters look engaged and capable, not babyish.',
  'Semi-detailed backgrounds that support the educational content. Clear visual hierarchy. Warm natural lighting.',
  'Scary shadows, blood, weapons, dark scenes, chibi proportions, oversized heads, babyish style'
);
