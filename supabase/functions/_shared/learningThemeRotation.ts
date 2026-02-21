/**
 * learningThemeRotation.ts – Block 2.3c
 * Determines whether a learning theme should be applied to the next story,
 * based on parent_learning_config frequency + round-robin rotation.
 */

export interface LearningThemeResult {
  themeKey: string;
  themeLabel: string;
  storyGuidance?: string;
}

/**
 * Check if a learning theme should be applied for this story.
 * Returns { themeKey, themeLabel } or null.
 */
export async function shouldApplyLearningTheme(
  kidProfileId: string,
  storyLanguage: string,
  supabaseClient: any
): Promise<LearningThemeResult | null> {
  try {
    // 1. Load parent_learning_config
    const { data: config } = await supabaseClient
      .from('parent_learning_config')
      .select('*')
      .eq('kid_profile_id', kidProfileId)
      .maybeSingle();

    if (!config || !config.active_themes || config.active_themes.length === 0) {
      return null;
    }

    const activeThemes: string[] = config.active_themes;
    const frequency: number = config.frequency || 2;

    // 2. Count stories since last learning theme
    const { data: countData } = await supabaseClient.rpc('count_stories_since_last_theme', {
      p_kid_profile_id: kidProfileId,
    });

    // If rpc doesn't exist, fall back to manual query
    let storiesSinceLastTheme: number;
    if (countData !== null && countData !== undefined) {
      storiesSinceLastTheme = typeof countData === 'number' ? countData : (countData?.[0]?.count ?? 0);
    } else {
      // Fallback: manual count
      const { data: lastThemeStory } = await supabaseClient
        .from('stories')
        .select('created_at')
        .eq('kid_profile_id', kidProfileId)
        .not('learning_theme_applied', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const sinceDate = lastThemeStory?.created_at || '1970-01-01T00:00:00Z';

      const { count } = await supabaseClient
        .from('stories')
        .select('id', { count: 'exact', head: true })
        .eq('kid_profile_id', kidProfileId)
        .gt('created_at', sinceDate)
        .is('learning_theme_applied', null);

      storiesSinceLastTheme = count || 0;
    }

    // 3. Decide if a learning theme should be applied
    // frequency 1 (occasional): every 4th story → storiesSince >= 3
    // frequency 2 (regular):    every 3rd story → storiesSince >= 2
    // frequency 3 (frequent):   every 2nd story → storiesSince >= 1
    const thresholds: Record<number, number> = { 1: 3, 2: 2, 3: 1 };
    const threshold = thresholds[frequency] ?? 2;

    if (storiesSinceLastTheme < threshold) {
      console.log(`[learningTheme] Not yet time (${storiesSinceLastTheme}/${threshold} stories since last theme)`);
      return null;
    }

    // 4. Round-Robin: pick next theme
    const { data: lastThemed } = await supabaseClient
      .from('stories')
      .select('learning_theme_applied')
      .eq('kid_profile_id', kidProfileId)
      .not('learning_theme_applied', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let selectedTheme: string;
    if (lastThemed?.learning_theme_applied) {
      const lastIdx = activeThemes.indexOf(lastThemed.learning_theme_applied);
      const nextIdx = (lastIdx + 1) % activeThemes.length;
      selectedTheme = activeThemes[nextIdx];
    } else {
      // No previous theme used → take the first one
      selectedTheme = activeThemes[0];
    }

    // 5. Load label for the selected theme (supports custom: prefix)
    let themeLabel: string;

    let storyGuidance: string | undefined;

    if (selectedTheme.startsWith('custom:')) {
      const customId = selectedTheme.replace('custom:', '');
      const { data: customData } = await supabaseClient
        .from('custom_learning_themes')
        .select('name, story_guidance')
        .eq('id', customId)
        .maybeSingle();

      themeLabel = customData?.name?.[storyLanguage]
        || customData?.name?.['en']
        || customData?.name?.['de']
        || selectedTheme;
      storyGuidance = customData?.story_guidance || undefined;
    } else {
      const { data: themeData } = await supabaseClient
        .from('learning_themes')
        .select('labels')
        .eq('theme_key', selectedTheme)
        .maybeSingle();

      themeLabel = themeData?.labels?.[storyLanguage]
        || themeData?.labels?.['en']
        || themeData?.labels?.['fr']
        || selectedTheme;
    }

    console.log(`[learningTheme] Applying theme: ${selectedTheme} (${themeLabel})${storyGuidance ? ' [custom]' : ''}`);

    return { themeKey: selectedTheme, themeLabel, storyGuidance };

  } catch (error) {
    console.error('[learningTheme] Error:', error);
    return null;
  }
}
