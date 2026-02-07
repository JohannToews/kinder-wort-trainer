-- Block 2.1: Learning Themes + Content Guardrails
-- Creates reference tables, config tables, and seed data for parental controls.

-- ============================================================
-- 1. learning_themes – Reference table for educational themes
-- ============================================================

CREATE TABLE IF NOT EXISTS public.learning_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key text NOT NULL UNIQUE,
  category text NOT NULL, -- 'social', 'emotional', 'character', 'cognitive'
  labels jsonb NOT NULL,  -- {"de": "Teilen & Großzügigkeit", "fr": "Partage et générosité", ...}
  descriptions jsonb NOT NULL, -- {"de": "Kind lernt zu teilen...", ...}
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 2. content_themes_by_level – What emotional themes are allowed per safety level
-- ============================================================

CREATE TABLE IF NOT EXISTS public.content_themes_by_level (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key text NOT NULL UNIQUE, -- e.g. 'divorce', 'pet_death', 'bullying'
  labels jsonb NOT NULL,         -- {"de": "Scheidung", "fr": "Divorce", ...}
  min_safety_level integer NOT NULL, -- minimum level where this is allowed (1-4), 0 = global exclusion
  min_age integer,               -- optional minimum age
  example_texts jsonb NOT NULL,  -- {"de": "Linas Eltern leben in zwei Häusern", ...}
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- 3. parent_learning_config – Per-kid learning theme preferences
-- ============================================================

CREATE TABLE IF NOT EXISTS public.parent_learning_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kid_profile_id uuid NOT NULL REFERENCES public.kid_profiles(id) ON DELETE CASCADE UNIQUE,
  active_themes text[] NOT NULL DEFAULT '{}',
  frequency integer NOT NULL DEFAULT 2, -- 1=occasional, 2=regular, 3=frequent
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT max_three_themes CHECK (array_length(active_themes, 1) <= 3 OR active_themes = '{}'),
  CONSTRAINT valid_frequency CHECK (frequency BETWEEN 1 AND 3)
);

-- ============================================================
-- 4. New fields on kid_profiles
-- ============================================================

ALTER TABLE public.kid_profiles
  ADD COLUMN IF NOT EXISTS content_safety_level integer NOT NULL DEFAULT 2;

-- Add CHECK constraint (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_safety_level'
  ) THEN
    ALTER TABLE public.kid_profiles
      ADD CONSTRAINT valid_safety_level CHECK (content_safety_level BETWEEN 1 AND 4);
  END IF;
END $$;

-- ============================================================
-- 5. New fields on stories (for future use, stay NULL for now)
-- ============================================================

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS learning_theme_applied text;

ALTER TABLE public.stories
  ADD COLUMN IF NOT EXISTS parent_prompt_text text;

-- ============================================================
-- 6. Set default content_safety_level based on age for existing profiles
-- ============================================================

UPDATE public.kid_profiles SET content_safety_level = 1 WHERE age IS NOT NULL AND age <= 5;
UPDATE public.kid_profiles SET content_safety_level = 2 WHERE age IS NOT NULL AND age BETWEEN 6 AND 9;
UPDATE public.kid_profiles SET content_safety_level = 3 WHERE age IS NOT NULL AND age >= 10;

-- ============================================================
-- 7. Seed: learning_themes (15 entries, 4 categories)
-- ============================================================

INSERT INTO public.learning_themes (theme_key, category, labels, descriptions, sort_order) VALUES

-- SOCIAL (4)
('sharing', 'social',
  '{"de": "Teilen & Großzügigkeit", "fr": "Partage et générosité", "en": "Sharing & generosity", "es": "Compartir y generosidad", "nl": "Delen & vrijgevigheid", "it": "Condivisione e generosità", "bs": "Dijeljenje i velikodušnost"}',
  '{"de": "Kind lernt, dass Teilen Freude bringt und Beziehungen stärkt.", "fr": "L''enfant apprend que partager apporte de la joie et renforce les liens.", "en": "Child learns that sharing brings joy and strengthens relationships.", "es": "El niño aprende que compartir trae alegría y fortalece las relaciones.", "nl": "Kind leert dat delen vreugde brengt en relaties versterkt.", "it": "Il bambino impara che condividere porta gioia e rafforza i legami.", "bs": "Dijete uči da dijeljenje donosi radost i jača odnose."}',
  1),

('empathy', 'social',
  '{"de": "Empathie & Perspektivwechsel", "fr": "Empathie et changement de perspective", "en": "Empathy & perspective-taking", "es": "Empatía y cambio de perspectiva", "nl": "Empathie & perspectief wisselen", "it": "Empatia e cambio di prospettiva", "bs": "Empatija i promjena perspektive"}',
  '{"de": "Kind lernt, sich in andere hineinzuversetzen und deren Gefühle zu verstehen.", "fr": "L''enfant apprend à se mettre à la place des autres et à comprendre leurs sentiments.", "en": "Child learns to put themselves in others'' shoes and understand their feelings.", "es": "El niño aprende a ponerse en el lugar de los demás y comprender sus sentimientos.", "nl": "Kind leert zich in anderen te verplaatsen en hun gevoelens te begrijpen.", "it": "Il bambino impara a mettersi nei panni degli altri e a capire i loro sentimenti.", "bs": "Dijete uči da se stavi u poziciju drugih i razumije njihova osjećanja."}',
  2),

('friendship', 'social',
  '{"de": "Freundschaft pflegen", "fr": "Cultiver l''amitié", "en": "Nurturing friendships", "es": "Cultivar la amistad", "nl": "Vriendschap onderhouden", "it": "Coltivare l''amicizia", "bs": "Njegovanje prijateljstva"}',
  '{"de": "Kind lernt, wie man gute Freundschaften aufbaut und pflegt.", "fr": "L''enfant apprend comment construire et entretenir de bonnes amitiés.", "en": "Child learns how to build and maintain good friendships.", "es": "El niño aprende a construir y mantener buenas amistades.", "nl": "Kind leert hoe je goede vriendschappen opbouwt en onderhoudt.", "it": "Il bambino impara come costruire e mantenere buone amicizie.", "bs": "Dijete uči kako graditi i održavati dobra prijateljstva."}',
  3),

('cooperation', 'social',
  '{"de": "Zusammenarbeit", "fr": "Coopération", "en": "Cooperation", "es": "Cooperación", "nl": "Samenwerking", "it": "Cooperazione", "bs": "Saradnja"}',
  '{"de": "Kind lernt, dass man zusammen mehr erreicht als allein.", "fr": "L''enfant apprend qu''on accomplit plus ensemble que seul.", "en": "Child learns that you achieve more together than alone.", "es": "El niño aprende que juntos se logra más que solo.", "nl": "Kind leert dat je samen meer bereikt dan alleen.", "it": "Il bambino impara che insieme si ottiene di più che da soli.", "bs": "Dijete uči da se zajedno postiže više nego samo."}',
  4),

-- EMOTIONAL (4)
('patience', 'emotional',
  '{"de": "Geduld & Warten können", "fr": "Patience et savoir attendre", "en": "Patience & learning to wait", "es": "Paciencia y saber esperar", "nl": "Geduld & leren wachten", "it": "Pazienza e saper aspettare", "bs": "Strpljenje i čekanje"}',
  '{"de": "Kind lernt, dass gute Dinge manchmal Zeit brauchen.", "fr": "L''enfant apprend que les bonnes choses prennent parfois du temps.", "en": "Child learns that good things sometimes take time.", "es": "El niño aprende que las cosas buenas a veces toman tiempo.", "nl": "Kind leert dat goede dingen soms tijd nodig hebben.", "it": "Il bambino impara che le cose buone a volte richiedono tempo.", "bs": "Dijete uči da dobre stvari ponekad zahtijevaju vrijeme."}',
  5),

('frustration', 'emotional',
  '{"de": "Umgang mit Frustration", "fr": "Gérer la frustration", "en": "Dealing with frustration", "es": "Manejar la frustración", "nl": "Omgaan met frustratie", "it": "Gestire la frustrazione", "bs": "Suočavanje s frustracijom"}',
  '{"de": "Kind lernt, mit Enttäuschungen und Rückschlägen umzugehen.", "fr": "L''enfant apprend à gérer les déceptions et les revers.", "en": "Child learns to cope with disappointments and setbacks.", "es": "El niño aprende a lidiar con decepciones y contratiempos.", "nl": "Kind leert omgaan met teleurstellingen en tegenslagen.", "it": "Il bambino impara a gestire delusioni e battute d''arresto.", "bs": "Dijete uči kako se nositi s razočarenjima i neuspjesima."}',
  6),

('courage', 'emotional',
  '{"de": "Mut & Schüchternheit überwinden", "fr": "Courage et surmonter la timidité", "en": "Courage & overcoming shyness", "es": "Valentía y superar la timidez", "nl": "Moed & verlegenheid overwinnen", "it": "Coraggio e superare la timidezza", "bs": "Hrabrost i prevazilaženje stidljivosti"}',
  '{"de": "Kind lernt, mutig zu sein und Neues auszuprobieren.", "fr": "L''enfant apprend à être courageux et à essayer de nouvelles choses.", "en": "Child learns to be brave and try new things.", "es": "El niño aprende a ser valiente y probar cosas nuevas.", "nl": "Kind leert moedig te zijn en nieuwe dingen te proberen.", "it": "Il bambino impara ad essere coraggioso e a provare cose nuove.", "bs": "Dijete uči biti hrabro i isprobavati nove stvari."}',
  7),

('anger_management', 'emotional',
  '{"de": "Umgang mit Wut", "fr": "Gérer la colère", "en": "Managing anger", "es": "Manejar la ira", "nl": "Omgaan met woede", "it": "Gestire la rabbia", "bs": "Upravljanje ljutnjom"}',
  '{"de": "Kind lernt, Wut zu erkennen und konstruktiv damit umzugehen.", "fr": "L''enfant apprend à reconnaître la colère et à la gérer de manière constructive.", "en": "Child learns to recognize anger and deal with it constructively.", "es": "El niño aprende a reconocer la ira y manejarla constructivamente.", "nl": "Kind leert woede te herkennen en er constructief mee om te gaan.", "it": "Il bambino impara a riconoscere la rabbia e a gestirla in modo costruttivo.", "bs": "Dijete uči prepoznati ljutnju i konstruktivno se nositi s njom."}',
  8),

-- CHARACTER (4)
('honesty', 'character',
  '{"de": "Ehrlichkeit", "fr": "Honnêteté", "en": "Honesty", "es": "Honestidad", "nl": "Eerlijkheid", "it": "Onestà", "bs": "Iskrenost"}',
  '{"de": "Kind lernt den Wert von Wahrheit und Aufrichtigkeit.", "fr": "L''enfant apprend la valeur de la vérité et de la sincérité.", "en": "Child learns the value of truth and sincerity.", "es": "El niño aprende el valor de la verdad y la sinceridad.", "nl": "Kind leert de waarde van waarheid en oprechtheid.", "it": "Il bambino impara il valore della verità e della sincerità.", "bs": "Dijete uči vrijednost istine i iskrenosti."}',
  9),

('independence', 'character',
  '{"de": "Selbstständigkeit", "fr": "Autonomie", "en": "Independence", "es": "Independencia", "nl": "Zelfstandigheid", "it": "Indipendenza", "bs": "Samostalnost"}',
  '{"de": "Kind lernt, Dinge selbst zu versuchen und eigene Entscheidungen zu treffen.", "fr": "L''enfant apprend à essayer des choses par lui-même et à prendre ses propres décisions.", "en": "Child learns to try things on their own and make their own decisions.", "es": "El niño aprende a intentar cosas por sí mismo y tomar sus propias decisiones.", "nl": "Kind leert dingen zelf te proberen en eigen beslissingen te nemen.", "it": "Il bambino impara a provare le cose da solo e a prendere le proprie decisioni.", "bs": "Dijete uči samo pokušavati stvari i donositi vlastite odluke."}',
  10),

('responsibility', 'character',
  '{"de": "Verantwortung übernehmen", "fr": "Prendre des responsabilités", "en": "Taking responsibility", "es": "Asumir responsabilidad", "nl": "Verantwoordelijkheid nemen", "it": "Assumersi responsabilità", "bs": "Preuzimanje odgovornosti"}',
  '{"de": "Kind lernt, für seine Handlungen und Versprechen einzustehen.", "fr": "L''enfant apprend à assumer ses actes et ses promesses.", "en": "Child learns to stand by their actions and promises.", "es": "El niño aprende a responder por sus actos y promesas.", "nl": "Kind leert om voor zijn daden en beloftes te staan.", "it": "Il bambino impara a rispondere delle proprie azioni e promesse.", "bs": "Dijete uči stajati iza svojih postupaka i obećanja."}',
  11),

('admitting_mistakes', 'character',
  '{"de": "Fehler eingestehen", "fr": "Admettre ses erreurs", "en": "Admitting mistakes", "es": "Admitir errores", "nl": "Fouten toegeven", "it": "Ammettere gli errori", "bs": "Priznavanje grešaka"}',
  '{"de": "Kind lernt, dass Fehler machen menschlich ist und man daraus lernen kann.", "fr": "L''enfant apprend que faire des erreurs est humain et qu''on peut en tirer des leçons.", "en": "Child learns that making mistakes is human and you can learn from them.", "es": "El niño aprende que cometer errores es humano y se puede aprender de ellos.", "nl": "Kind leert dat fouten maken menselijk is en dat je ervan kunt leren.", "it": "Il bambino impara che sbagliare è umano e che si può imparare dagli errori.", "bs": "Dijete uči da je griješenje ljudsko i da se iz grešaka može učiti."}',
  12),

-- COGNITIVE (3)
('curiosity', 'cognitive',
  '{"de": "Neugier & Fragen stellen", "fr": "Curiosité et poser des questions", "en": "Curiosity & asking questions", "es": "Curiosidad y hacer preguntas", "nl": "Nieuwsgierigheid & vragen stellen", "it": "Curiosità e fare domande", "bs": "Znatiželja i postavljanje pitanja"}',
  '{"de": "Kind lernt, dass Fragen stellen der erste Schritt zum Verstehen ist.", "fr": "L''enfant apprend que poser des questions est le premier pas vers la compréhension.", "en": "Child learns that asking questions is the first step to understanding.", "es": "El niño aprende que hacer preguntas es el primer paso para entender.", "nl": "Kind leert dat vragen stellen de eerste stap naar begrip is.", "it": "Il bambino impara che fare domande è il primo passo verso la comprensione.", "bs": "Dijete uči da je postavljanje pitanja prvi korak ka razumijevanju."}',
  13),

('problem_solving', 'cognitive',
  '{"de": "Problemlösung", "fr": "Résolution de problèmes", "en": "Problem solving", "es": "Resolución de problemas", "nl": "Probleemoplossing", "it": "Risoluzione dei problemi", "bs": "Rješavanje problema"}',
  '{"de": "Kind lernt, Herausforderungen systematisch anzugehen.", "fr": "L''enfant apprend à aborder les défis de manière systématique.", "en": "Child learns to approach challenges systematically.", "es": "El niño aprende a abordar desafíos de manera sistemática.", "nl": "Kind leert uitdagingen systematisch aan te pakken.", "it": "Il bambino impara ad affrontare le sfide in modo sistematico.", "bs": "Dijete uči sistematski pristupati izazovima."}',
  14),

('creativity', 'cognitive',
  '{"de": "Kreativität & Querdenken", "fr": "Créativité et pensée originale", "en": "Creativity & thinking outside the box", "es": "Creatividad y pensamiento original", "nl": "Creativiteit & anders denken", "it": "Creatività e pensiero originale", "bs": "Kreativnost i originalno razmišljanje"}',
  '{"de": "Kind lernt, eigene Ideen zu entwickeln und kreative Lösungen zu finden.", "fr": "L''enfant apprend à développer ses propres idées et à trouver des solutions créatives.", "en": "Child learns to develop own ideas and find creative solutions.", "es": "El niño aprende a desarrollar sus propias ideas y encontrar soluciones creativas.", "nl": "Kind leert eigen ideeën te ontwikkelen en creatieve oplossingen te vinden.", "it": "Il bambino impara a sviluppare le proprie idee e a trovare soluzioni creative.", "bs": "Dijete uči razvijati vlastite ideje i pronalaziti kreativna rješenja."}',
  15)

ON CONFLICT (theme_key) DO NOTHING;

-- ============================================================
-- 8. Seed: content_themes_by_level
-- ============================================================

INSERT INTO public.content_themes_by_level (theme_key, labels, min_safety_level, min_age, example_texts, sort_order) VALUES

-- Level 2: LEICHT
('friend_conflict', 
  '{"de": "Streit unter Freunden", "fr": "Dispute entre amis", "en": "Conflict between friends", "es": "Conflicto entre amigos", "nl": "Ruzie tussen vrienden", "it": "Litigio tra amici", "bs": "Svađa među prijateljima"}',
  2, NULL,
  '{"de": "Mia und Tom stritten sich um den letzten Keks, aber dann hatten sie eine Idee.", "fr": "Mia et Tom se disputaient le dernier biscuit, mais ils ont eu une idée.", "en": "Mia and Tom argued over the last cookie, but then they had an idea.", "es": "Mia y Tom discutieron por la última galleta, pero luego tuvieron una idea.", "nl": "Mia en Tom ruzieden om het laatste koekje, maar toen kregen ze een idee.", "it": "Mia e Tom litigavano per l''ultimo biscotto, ma poi ebbero un''idea.", "bs": "Mia i Tom su se svađali oko posljednjeg kolačića, ali su onda imali ideju."}',
  1),

('minor_sadness',
  '{"de": "Leichte Traurigkeit", "fr": "Légère tristesse", "en": "Minor sadness", "es": "Tristeza leve", "nl": "Licht verdriet", "it": "Leggera tristezza", "bs": "Blaga tuga"}',
  2, NULL,
  '{"de": "Als sein Luftballon davonflog, war Leo traurig – aber dann sah er den Regenbogen.", "fr": "Quand son ballon s''envola, Léo était triste – mais il vit l''arc-en-ciel.", "en": "When his balloon flew away, Leo was sad – but then he saw the rainbow.", "es": "Cuando su globo se fue volando, Leo estaba triste, pero luego vio el arcoíris.", "nl": "Toen zijn ballon wegvloog, was Leo verdrietig – maar toen zag hij de regenboog.", "it": "Quando il suo palloncino volò via, Leo era triste – ma poi vide l''arcobaleno.", "bs": "Kad mu je balon odletio, Leo je bio tužan – ali onda je ugledao dugu."}',
  2),

('minor_fear',
  '{"de": "Kurze Angstmomente", "fr": "Moments de peur passagers", "en": "Brief moments of fear", "es": "Momentos breves de miedo", "nl": "Korte angstmomenten", "it": "Brevi momenti di paura", "bs": "Kratki trenuci straha"}',
  2, NULL,
  '{"de": "Im dunklen Wald hörte sie ein Geräusch – es war nur ein kleines Eichhörnchen!", "fr": "Dans la forêt sombre, elle entendit un bruit – ce n''était qu''un petit écureuil !", "en": "In the dark forest she heard a noise – it was just a little squirrel!", "es": "En el bosque oscuro escuchó un ruido – ¡era solo una pequeña ardilla!", "nl": "In het donkere bos hoorde ze een geluid – het was maar een klein eekhoorntje!", "it": "Nella foresta buia sentì un rumore – era solo un piccolo scoiattolo!", "bs": "U tamnoj šumi čula je zvuk – to je bila samo mala vjeverica!"}',
  3),

('disappointment',
  '{"de": "Enttäuschung", "fr": "Déception", "en": "Disappointment", "es": "Decepción", "nl": "Teleurstelling", "it": "Delusione", "bs": "Razočarenje"}',
  2, NULL,
  '{"de": "Das Picknick fiel ins Wasser, aber zu Hause bauten sie eine Deckenburge.", "fr": "Le pique-nique a été annulé à cause de la pluie, mais ils ont construit un fort de couvertures.", "en": "The picnic was rained out, but at home they built a blanket fort.", "es": "El picnic se canceló por la lluvia, pero en casa construyeron un fuerte de mantas.", "nl": "De picknick viel in het water, maar thuis bouwden ze een dekensfort.", "it": "Il picnic è stato rovinato dalla pioggia, ma a casa hanno costruito un forte di coperte.", "bs": "Piknik je propao zbog kiše, ali su kod kuće napravili tvrđavu od deka."}',
  4),

-- Level 3: MITTEL
('divorce',
  '{"de": "Scheidung / Trennung", "fr": "Divorce / Séparation", "en": "Divorce / Separation", "es": "Divorcio / Separación", "nl": "Scheiding", "it": "Divorzio / Separazione", "bs": "Razvod / Razdvajanje"}',
  3, 6,
  '{"de": "Linas Eltern leben jetzt in zwei verschiedenen Häusern – aber beide haben sie genauso lieb.", "fr": "Les parents de Lina vivent maintenant dans deux maisons – mais tous deux l''aiment autant.", "en": "Lina''s parents now live in two different houses – but both love her just as much.", "es": "Los padres de Lina ahora viven en dos casas – pero ambos la quieren igual.", "nl": "Lina''s ouders wonen nu in twee huizen – maar allebei houden ze evenveel van haar.", "it": "I genitori di Lina ora vivono in due case diverse – ma entrambi la amano allo stesso modo.", "bs": "Linini roditelji sada žive u dva različita doma – ali oboje je vole jednako."}',
  5),

('moving',
  '{"de": "Umzug / Veränderung", "fr": "Déménagement / Changement", "en": "Moving / Change", "es": "Mudanza / Cambio", "nl": "Verhuizing / Verandering", "it": "Trasloco / Cambiamento", "bs": "Selidba / Promjena"}',
  3, NULL,
  '{"de": "Die neue Stadt war fremd, aber in der Schule wartete schon jemand mit einem Lächeln.", "fr": "La nouvelle ville était inconnue, mais à l''école quelqu''un l''attendait avec un sourire.", "en": "The new city was strange, but at school someone was waiting with a smile.", "es": "La nueva ciudad era extraña, pero en la escuela alguien esperaba con una sonrisa.", "nl": "De nieuwe stad was vreemd, maar op school stond iemand te wachten met een glimlach.", "it": "La nuova città era sconosciuta, ma a scuola qualcuno aspettava con un sorriso.", "bs": "Novi grad bio je nepoznat, ali u školi je neko čekao s osmijehom."}',
  6),

('bullying',
  '{"de": "Mobbing", "fr": "Harcèlement", "en": "Bullying", "es": "Acoso escolar", "nl": "Pesten", "it": "Bullismo", "bs": "Maltretiranje"}',
  3, 7,
  '{"de": "Niemand wollte neben ihr sitzen – bis ein neues Kind kam und sagte: Darf ich?", "fr": "Personne ne voulait s''asseoir à côté d''elle – jusqu''à ce qu''un nouvel élève dise : Je peux ?", "en": "Nobody wanted to sit next to her – until a new kid came and said: May I?", "es": "Nadie quería sentarse a su lado, hasta que un nuevo niño llegó y dijo: ¿Puedo?", "nl": "Niemand wilde naast haar zitten – tot een nieuw kind kwam en zei: Mag ik?", "it": "Nessuno voleva sedersi accanto a lei – finché un nuovo bambino arrivò e disse: Posso?", "bs": "Niko nije htio sjesti pored nje – dok nije došlo novo dijete i reklo: Smijem li?"}',
  7),

('loneliness',
  '{"de": "Einsamkeit", "fr": "Solitude", "en": "Loneliness", "es": "Soledad", "nl": "Eenzaamheid", "it": "Solitudine", "bs": "Usamljenost"}',
  3, NULL,
  '{"de": "Am Rand des Spielplatzes stand er allein – bis er merkte, dass der Igel auch allein war.", "fr": "Au bord du terrain de jeu, il était seul – jusqu''à ce qu''il remarque que le hérisson aussi.", "en": "At the edge of the playground he stood alone – until he noticed the hedgehog was alone too.", "es": "Al borde del patio estaba solo – hasta que notó que el erizo también.", "nl": "Aan de rand van de speeltuin stond hij alleen – tot hij merkte dat de egel ook alleen was.", "it": "Al bordo del parco giochi era solo – finché non notò che anche il riccio era solo.", "bs": "Na rubu igrališta stajao je sam – dok nije primijetio da je i jež sam."}',
  8),

('pet_death',
  '{"de": "Tod eines Haustieres", "fr": "Mort d''un animal", "en": "Death of a pet", "es": "Muerte de una mascota", "nl": "Dood van een huisdier", "it": "Morte di un animale domestico", "bs": "Smrt kućnog ljubimca"}',
  3, 7,
  '{"de": "Goldfisch Blubber schwamm nicht mehr – aber die Erinnerungen blieben für immer.", "fr": "Le poisson rouge Bubulle ne nageait plus – mais les souvenirs restaient pour toujours.", "en": "Goldfish Bubbles wasn''t swimming anymore – but the memories stayed forever.", "es": "El pez Burbuja ya no nadaba – pero los recuerdos quedaron para siempre.", "nl": "Goudvis Bubbel zwom niet meer – maar de herinneringen bleven voor altijd.", "it": "Il pesciolino Bollicina non nuotava più – ma i ricordi restavano per sempre.", "bs": "Zlatna ribica Mjehurić više nije plivala – ali sjećanja su ostala zauvijek."}',
  9),

('jealousy',
  '{"de": "Eifersucht", "fr": "Jalousie", "en": "Jealousy", "es": "Celos", "nl": "Jaloezie", "it": "Gelosia", "bs": "Ljubomora"}',
  3, NULL,
  '{"de": "Als das Baby kam, fühlte sich Max unsichtbar – bis Papa ihn zum Großer-Bruder-Abenteuer mitnahm.", "fr": "Quand le bébé est arrivé, Max se sentait invisible – jusqu''à ce que papa l''emmène à l''aventure des grands frères.", "en": "When the baby arrived, Max felt invisible – until Dad took him on a big brother adventure.", "es": "Cuando llegó el bebé, Max se sentía invisible, hasta que papá lo llevó a una aventura de hermano mayor.", "nl": "Toen de baby kwam, voelde Max zich onzichtbaar – tot papa hem meenam op een grote-broer-avontuur.", "it": "Quando arrivò il bebè, Max si sentiva invisibile – finché papà lo portò in un''avventura da fratello maggiore.", "bs": "Kad je beba stigla, Max se osjećao nevidljivim – dok ga tata nije poveo u avanturu velikog brata."}',
  10),

-- Level 4: OFFEN
('death',
  '{"de": "Tod (kindgerecht)", "fr": "Mort (adapté aux enfants)", "en": "Death (child-appropriate)", "es": "Muerte (adaptada a niños)", "nl": "Dood (kindvriendelijk)", "it": "Morte (adatta ai bambini)", "bs": "Smrt (prilagođeno djeci)"}',
  4, 8,
  '{"de": "Oma war nicht mehr da, aber jedes Mal wenn der Wind die Blätter tanzen ließ, dachte Mia an sie.", "fr": "Mamie n''était plus là, mais chaque fois que le vent faisait danser les feuilles, Mia pensait à elle.", "en": "Grandma was gone, but every time the wind made the leaves dance, Mia thought of her.", "es": "La abuela ya no estaba, pero cada vez que el viento hacía bailar las hojas, Mia pensaba en ella.", "nl": "Oma was er niet meer, maar elke keer als de wind de bladeren liet dansen, dacht Mia aan haar.", "it": "La nonna non c''era più, ma ogni volta che il vento faceva danzare le foglie, Mia pensava a lei.", "bs": "Bake više nije bilo, ali svaki put kad bi vjetar zaljuljao lišće, Mia je mislila na nju."}',
  11),

('war_flight',
  '{"de": "Krieg / Flucht", "fr": "Guerre / Fuite", "en": "War / Flight", "es": "Guerra / Huida", "nl": "Oorlog / Vlucht", "it": "Guerra / Fuga", "bs": "Rat / Bijeg"}',
  4, 9,
  '{"de": "Sie mussten ihr Zuhause verlassen, aber im Rucksack war das Lieblingsbuch – ein Stück Heimat.", "fr": "Ils ont dû quitter leur maison, mais dans le sac à dos il y avait le livre préféré – un morceau de chez soi.", "en": "They had to leave their home, but in the backpack was the favorite book – a piece of home.", "es": "Tuvieron que dejar su hogar, pero en la mochila estaba el libro favorito – un pedazo de hogar.", "nl": "Ze moesten hun huis verlaten, maar in de rugzak zat het lievelingsboek – een stukje thuis.", "it": "Dovettero lasciare la loro casa, ma nello zaino c''era il libro preferito – un pezzo di casa.", "bs": "Morali su napustiti dom, ali u ruksaku je bila omiljena knjiga – komadić doma."}',
  12),

('serious_illness',
  '{"de": "Schwere Krankheit", "fr": "Maladie grave", "en": "Serious illness", "es": "Enfermedad grave", "nl": "Ernstige ziekte", "it": "Malattia grave", "bs": "Teška bolest"}',
  4, 8,
  '{"de": "Papa war lange im Krankenhaus, aber jeden Tag malte sie ihm ein Bild – eines schöner als das andere.", "fr": "Papa était longtemps à l''hôpital, mais chaque jour elle lui dessinait une image – plus belle que la précédente.", "en": "Dad was in the hospital for a long time, but every day she drew him a picture – each one more beautiful.", "es": "Papá estuvo mucho tiempo en el hospital, pero cada día le dibujaba un cuadro, cada uno más bonito.", "nl": "Papa was lang in het ziekenhuis, maar elke dag tekende ze een plaatje – mooier dan het vorige.", "it": "Papà è stato a lungo in ospedale, ma ogni giorno lei gli disegnava un''immagine – una più bella dell''altra.", "bs": "Tata je dugo bio u bolnici, ali svaki dan mu je crtala sliku – jednu ljepšu od druge."}',
  13),

('complex_families',
  '{"de": "Komplexe Familienkonstellationen", "fr": "Configurations familiales complexes", "en": "Complex family structures", "es": "Estructuras familiares complejas", "nl": "Complexe familiestructuren", "it": "Strutture familiari complesse", "bs": "Složene porodične strukture"}',
  4, 8,
  '{"de": "Zwei Mamas, ein Papa weit weg, und trotzdem war da so viel Liebe.", "fr": "Deux mamans, un papa loin, et pourtant il y avait tant d''amour.", "en": "Two moms, a dad far away, and still so much love.", "es": "Dos mamás, un papá lejos, y aun así tanto amor.", "nl": "Twee mama''s, een papa ver weg, en toch zoveel liefde.", "it": "Due mamme, un papà lontano, eppure così tanto amore.", "bs": "Dvije mame, tata daleko, a ipak toliko ljubavi."}',
  14),

-- Global exclusions (min_safety_level = 0 means NEVER allowed)
('explicit_violence',
  '{"de": "Explizite Gewalt", "fr": "Violence explicite", "en": "Explicit violence", "es": "Violencia explícita", "nl": "Expliciet geweld", "it": "Violenza esplicita", "bs": "Eksplicitno nasilje"}',
  0, NULL,
  '{"de": "Wird in keiner Geschichte vorkommen.", "fr": "N''apparaîtra dans aucune histoire.", "en": "Will never appear in any story.", "es": "Nunca aparecerá en ninguna historia.", "nl": "Zal nooit in een verhaal voorkomen.", "it": "Non apparirà mai in nessuna storia.", "bs": "Nikada se neće pojaviti ni u jednoj priči."}',
  90),

('sexual_content',
  '{"de": "Sexuelle Inhalte", "fr": "Contenu sexuel", "en": "Sexual content", "es": "Contenido sexual", "nl": "Seksuele inhoud", "it": "Contenuto sessuale", "bs": "Seksualni sadržaj"}',
  0, NULL,
  '{"de": "Wird in keiner Geschichte vorkommen.", "fr": "N''apparaîtra dans aucune histoire.", "en": "Will never appear in any story.", "es": "Nunca aparecerá en ninguna historia.", "nl": "Zal nooit in een verhaal voorkomen.", "it": "Non apparirà mai in nessuna storia.", "bs": "Nikada se neće pojaviti ni u jednoj priči."}',
  91),

('suicide',
  '{"de": "Suizid", "fr": "Suicide", "en": "Suicide", "es": "Suicidio", "nl": "Zelfmoord", "it": "Suicidio", "bs": "Samoubistvo"}',
  0, NULL,
  '{"de": "Wird in keiner Geschichte vorkommen.", "fr": "N''apparaîtra dans aucune histoire.", "en": "Will never appear in any story.", "es": "Nunca aparecerá en ninguna historia.", "nl": "Zal nooit in een verhaal voorkomen.", "it": "Non apparirà mai in nessuna storia.", "bs": "Nikada se neće pojaviti ni u jednoj priči."}',
  92),

('drug_abuse',
  '{"de": "Drogenmissbrauch", "fr": "Abus de drogues", "en": "Drug abuse", "es": "Abuso de drogas", "nl": "Drugsmisbruik", "it": "Abuso di droghe", "bs": "Zloupotreba droga"}',
  0, NULL,
  '{"de": "Wird in keiner Geschichte vorkommen.", "fr": "N''apparaîtra dans aucune histoire.", "en": "Will never appear in any story.", "es": "Nunca aparecerá en ninguna historia.", "nl": "Zal nooit in een verhaal voorkomen.", "it": "Non apparirà mai in nessuna storia.", "bs": "Nikada se neće pojaviti ni u jednoj priči."}',
  93),

('unresolved_horror',
  '{"de": "Horror / Trauma ohne Auflösung", "fr": "Horreur / Trauma sans résolution", "en": "Horror / Unresolved trauma", "es": "Horror / Trauma sin resolución", "nl": "Horror / Onopgelost trauma", "it": "Orrore / Trauma irrisolto", "bs": "Horor / Neriješena trauma"}',
  0, NULL,
  '{"de": "Wird in keiner Geschichte vorkommen.", "fr": "N''apparaîtra dans aucune histoire.", "en": "Will never appear in any story.", "es": "Nunca aparecerá en ninguna historia.", "nl": "Zal nooit in een verhaal voorkomen.", "it": "Non apparirà mai in nessuna storia.", "bs": "Nikada se neće pojaviti ni u jednoj priči."}',
  94)

ON CONFLICT (theme_key) DO NOTHING;

-- ============================================================
-- 9. RLS Policies
-- ============================================================

-- learning_themes: read-only for everyone
ALTER TABLE public.learning_themes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "learning_themes_select" ON public.learning_themes;
CREATE POLICY "learning_themes_select" ON public.learning_themes FOR SELECT USING (true);

-- content_themes_by_level: read-only for everyone
ALTER TABLE public.content_themes_by_level ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "content_themes_select" ON public.content_themes_by_level;
CREATE POLICY "content_themes_select" ON public.content_themes_by_level FOR SELECT USING (true);

-- parent_learning_config: CRUD only for the user who owns the kid_profile
ALTER TABLE public.parent_learning_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_learning_config_select" ON public.parent_learning_config;
CREATE POLICY "parent_learning_config_select" ON public.parent_learning_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kid_profiles kp
      WHERE kp.id = parent_learning_config.kid_profile_id
    )
  );

DROP POLICY IF EXISTS "parent_learning_config_insert" ON public.parent_learning_config;
CREATE POLICY "parent_learning_config_insert" ON public.parent_learning_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kid_profiles kp
      WHERE kp.id = parent_learning_config.kid_profile_id
    )
  );

DROP POLICY IF EXISTS "parent_learning_config_update" ON public.parent_learning_config;
CREATE POLICY "parent_learning_config_update" ON public.parent_learning_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.kid_profiles kp
      WHERE kp.id = parent_learning_config.kid_profile_id
    )
  );

DROP POLICY IF EXISTS "parent_learning_config_delete" ON public.parent_learning_config;
CREATE POLICY "parent_learning_config_delete" ON public.parent_learning_config
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.kid_profiles kp
      WHERE kp.id = parent_learning_config.kid_profile_id
    )
  );

-- Auto-update updated_at on parent_learning_config
DROP TRIGGER IF EXISTS update_parent_learning_config_updated_at ON public.parent_learning_config;
CREATE TRIGGER update_parent_learning_config_updated_at
  BEFORE UPDATE ON public.parent_learning_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
