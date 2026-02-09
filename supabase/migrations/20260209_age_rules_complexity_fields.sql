-- Add complexity control fields to age_rules
ALTER TABLE age_rules ADD COLUMN max_characters INTEGER DEFAULT 2;
ALTER TABLE age_rules ADD COLUMN max_plot_twists INTEGER DEFAULT 1;
ALTER TABLE age_rules ADD COLUMN plot_complexity TEXT DEFAULT 'simple';

-- Gruppe 6-7 (alle Sprachen)
UPDATE age_rules
SET max_characters = 2,
    max_plot_twists = 1,
    plot_complexity = 'simple: ONE problem, ONE solution. Setup → single challenge → resolution. No cascading obstacles. No subplots.'
WHERE min_age = 6 AND max_age = 7;

-- Gruppe 8-9 (alle Sprachen)
UPDATE age_rules
SET max_characters = 3,
    max_plot_twists = 1,
    plot_complexity = 'moderate: ONE main problem with one minor complication allowed. Clear cause-and-effect. One twist maximum.'
WHERE min_age = 8 AND max_age = 9;

-- Gruppe 10-11 (alle Sprachen)
UPDATE age_rules
SET max_characters = 4,
    max_plot_twists = 2,
    plot_complexity = 'structured: One main plot thread. One subplot or secondary challenge allowed. Up to two twists. Clear resolution.'
WHERE min_age = 10 AND max_age = 11;

-- Gruppe 12-13 (alle Sprachen)
UPDATE age_rules
SET max_characters = 5,
    max_plot_twists = 2,
    plot_complexity = 'complex: Main plot with one subplot allowed. Character development expected. Two twists allowed. Nuanced resolution.'
WHERE min_age = 12 AND max_age = 13;
