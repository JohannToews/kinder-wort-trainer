// Level name translations for the gamification system
export const levelTranslations: Record<string, Record<number, string>> = {
  de: {
    1: "Lesefuchs",
    2: "Geschichtenentdecker",
    3: "Bücherheld",
    4: "Lesemeister",
    5: "Geschichtenlegende"
  },
  fr: {
    1: "Petit Renard",
    2: "Explorateur d'histoires",
    3: "Héros des livres",
    4: "Maître lecteur",
    5: "Légende des histoires"
  },
  en: {
    1: "Reading Fox",
    2: "Story Explorer",
    3: "Book Hero",
    4: "Reading Master",
    5: "Story Legend"
  },
  es: {
    1: "Zorrito lector",
    2: "Explorador de historias",
    3: "Héroe de libros",
    4: "Maestro lector",
    5: "Leyenda de historias"
  },
  nl: {
    1: "Leesvos",
    2: "Verhaalontdekker",
    3: "Boekenheld",
    4: "Leesmeester",
    5: "Verhalenlegende"
  },
  bs: {
    1: "Lisica čitač",
    2: "Istraživač priča",
    3: "Heroj knjiga",
    4: "Majstor čitanja",
    5: "Legenda priča"
  },
  it: {
    1: "Volpe lettrice",
    2: "Esploratore di storie",
    3: "Eroe dei libri",
    4: "Maestro lettore",
    5: "Leggenda delle storie"
  }
};

export const getTranslatedLevelName = (levelNumber: number, language: string): string => {
  const translations = levelTranslations[language] || levelTranslations.de;
  return translations[levelNumber] || levelTranslations.de[levelNumber] || `Level ${levelNumber}`;
};
