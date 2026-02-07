// Translations for the application
export type Language = 'de' | 'fr' | 'en' | 'es' | 'nl' | 'it' | 'bs';

export interface Translations {
  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  loading: string;
  error: string;
  success: string;
  
  // Admin
  adminArea: string;
  newStory: string;
  title: string;
  coverImage: string;
  selectImage: string;
  readingText: string;
  saveStory: string;
  saving: string;
  existingStories: string;
  noStoriesYet: string;
  pointsConfig: string;
  levelConfig: string;
  settings: string;
  account: string;
  
  // Story Sub-tabs
  generator: string;
  editor: string;
  library: string;
  questionsReady: string;
  
  // Story Generator
  storyGenerator: string;
  generateNewStory: string;
  textType: string;
  fiction: string;
  nonFiction: string;
  textLanguage: string;
  globalLanguage: string;
  childAge: string;
  years: string;
  schoolLevel: string;
  difficulty: string;
  easy: string;
  medium: string;
  hard: string;
  textLength: string;
  short: string;
  long: string;
  systemPrompt: string;
  showSystemPrompt: string;
  hideSystemPrompt: string;
  savePrompt: string;
  generateStory: string;
  generating: string;
  storyTransferred: string;
  
  // Messages
  enterTitleAndText: string;
  imageUploadError: string;
  storySaveError: string;
  questionsCouldNotBeSaved: string;
  storyAndQuestionsSaved: string;
  generatingQuestions: string;
  questionsGenerationFailed: string;
  storyDeleted: string;
  deleteError: string;
  
  // Points Config
  pointsConfiguration: string;
  comprehensionQuestion: string;
  quizPerCorrectAnswer: string;
  storyRead: string;
  pointsNote: string;
  savePointsConfig: string;
  errorSaving: string;
  pointsConfigSaved: string;
  
  // Level Config
  levelConfiguration: string;
  defineLevels: string;
  fromPoints: string;
  saveLevelConfig: string;
  levelConfigSaved: string;
  
  // Kid Profile
  kidProfile: string;
  kidProfileDescription: string;
  kidName: string;
  kidAge: string;
  hobbies: string;
  hobbiesPlaceholder: string;
  colorPalette: string;
  generateCover: string;
  generatingCover: string;
  saveProfile: string;
  profileSaved: string;
  coverGenerated: string;
  addChild: string;
  schoolSystem: string;
  schoolClass: string;
  imageStyle: string;
  gender: string;
  age: string;
  genderMale: string;
  genderFemale: string;
  genderDiverse: string;
  
  // Image styles
  imageStyleCute: string;
  imageStyleWatercolor: string;
  imageStyleComic: string;
  imageStyleRealistic: string;
  imageStyleAnime: string;
  
  // Color palettes (8 distinct)
  paletteOcean: string;
  paletteSunset: string;
  paletteForest: string;
  paletteLavender: string;
  paletteSunshine: string;
  paletteCocoa: string;
  paletteRose: string;
  paletteMidnight: string;
  
  // Story status (shared by StorySelectPage, SeriesGrid)
  statusToRead: string;
  statusCompleted: string;
  statusAlreadyRead: string;
  
  // Story difficulty (shared)
  difficultyEasy: string;
  difficultyMedium: string;
  difficultyHard: string;
  
  // Story tabs
  tabFiction: string;
  tabNonFiction: string;
  tabSeries: string;
  
  // Series
  seriesEpisode: string;
  seriesNextEpisode: string;
  seriesNoSeries: string;
  seriesGenerating: string;
  seriesReadFirst: string;
  
  // Shared page labels
  noStoriesForProfile: string;
  addStory: string;
  chooseStory: string;
  noCategoryStories: string;
  allStoriesRead: string;
  noStoriesRead: string;
  
  // Toast messages (shared by CreateStoryPage, StorySelectPage)
  toastGeneratingStory: string;
  toastGenerationError: string;
  toastSaveError: string;
  toastStoryCreated: string;
  
  // Vocabulary manage
  vocabManageTitle: string;
  vocabManageAdd: string;
  vocabManageAddPlaceholder: string;
  vocabManageAdding: string;
  vocabManageEmpty: string;
  vocabManageDelete: string;
  vocabManageDeleteConfirm: string;
  vocabManageLearned: string;
  vocabManageNotLearned: string;
  vocabManageWords: string;
  vocabWord: string;
  vocabExplanation: string;
  vocabQuizLast3: string;
  vocabAddButton: string;
  vocabCreateStoryFirst: string;
  vocabEnterWord: string;
  vocabSaveError: string;
  vocabWordAdded: string;
  vocabWordAddedCorrected: string;
  vocabDeleteError: string;
  vocabWordRemoved: string;
  vocabAllWords: string;
}

const translations: Record<Language, Translations> = {
  de: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
    
    adminArea: 'Admin-Bereich',
    newStory: 'Neue Leseübung erstellen',
    title: 'Titel',
    coverImage: 'Titelbild',
    selectImage: 'Bild auswählen',
    readingText: 'Lesetext',
    saveStory: 'Geschichte speichern',
    saving: 'Speichere...',
    existingStories: 'Vorhandene Geschichten',
    noStoriesYet: 'Noch keine Geschichten vorhanden',
    pointsConfig: 'Punkte-Konfiguration',
    levelConfig: 'Level-Konfiguration',
    settings: 'Einstellungen',
    account: 'Konto',
    
    generator: 'Generator',
    editor: 'Bearbeiten',
    library: 'Bibliothek',
    questionsReady: 'Verständnisfragen bereit',
    
    storyGenerator: 'Geschichte generieren',
    generateNewStory: 'Neue Geschichte mit KI generieren',
    textType: 'Art des Textes',
    fiction: 'Fiktion',
    nonFiction: 'Sachgeschichte',
    textLanguage: 'Sprache des Textes',
    globalLanguage: 'Globale Sprache',
    childAge: 'Alter des Kindes',
    years: 'Jahre',
    schoolLevel: 'Schulstufe',
    difficulty: 'Schwierigkeit',
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Schwer',
    textLength: 'Textlänge',
    short: 'Kurz',
    long: 'Lang',
    systemPrompt: 'System-Prompt',
    showSystemPrompt: 'System-Prompt anzeigen',
    hideSystemPrompt: 'System-Prompt verbergen',
    savePrompt: 'Prompt speichern',
    generateStory: 'Geschichte generieren',
    generating: 'Generiere...',
    storyTransferred: 'Geschichte wurde in das Formular übernommen. Du kannst sie jetzt bearbeiten und speichern.',
    
    enterTitleAndText: 'Bitte Titel und Text eingeben',
    imageUploadError: 'Fehler beim Hochladen des Bildes',
    storySaveError: 'Fehler beim Speichern der Geschichte',
    questionsCouldNotBeSaved: 'Fragen konnten nicht gespeichert werden',
    storyAndQuestionsSaved: 'Geschichte und Fragen gespeichert! 🎉',
    generatingQuestions: 'Generiere Verständnisfragen...',
    questionsGenerationFailed: 'Fragen-Generierung fehlgeschlagen',
    storyDeleted: 'Geschichte gelöscht',
    deleteError: 'Fehler beim Löschen',
    
    pointsConfiguration: 'Punktekonfiguration',
    comprehensionQuestion: 'Verständnisfrage',
    quizPerCorrectAnswer: 'Quiz (pro richtige Antwort)',
    storyRead: 'Geschichte gelesen',
    pointsNote: 'Quiz-Punkte werden nur vergeben, wenn das Quiz insgesamt bestanden wird (4/5 oder 8/10).',
    savePointsConfig: 'Punktekonfiguration speichern',
    errorSaving: 'Fehler beim Speichern',
    pointsConfigSaved: 'Punktekonfiguration gespeichert! 🎯',
    
    levelConfiguration: 'Niveau-Konfiguration',
    defineLevels: 'Definiere die Niveaustufen und die benötigten Punkte.',
    fromPoints: 'Ab Punkte',
    saveLevelConfig: 'Niveau-Konfiguration speichern',
    levelConfigSaved: 'Niveau-Konfiguration gespeichert! ⭐',
    
    kidProfile: 'Kinderprofil',
    kidProfileDescription: 'Definiere das Profil des Kindes für personalisierte Inhalte.',
    kidName: 'Name des Kindes',
    kidAge: 'Alter',
    hobbies: 'Hobbies & Interessen',
    hobbiesPlaceholder: 'z.B. Fußball, Dinosaurier, Weltraum, Malen...',
    colorPalette: 'Farbpalette',
    generateCover: 'Titelbild generieren',
    generatingCover: 'Generiere Bild...',
    saveProfile: 'Profil speichern',
    profileSaved: 'Profil gespeichert! 🎨',
    coverGenerated: 'Titelbild wurde generiert! 🖼️',
    addChild: 'Kind hinzufügen',
    schoolSystem: 'Schule / App-Sprache',
    schoolClass: 'Schulklasse',
    imageStyle: 'Bild-Stil',
    gender: 'Geschlecht',
    age: 'Alter',
    genderMale: 'Junge',
    genderFemale: 'Mädchen',
    genderDiverse: 'Divers',
    
    imageStyleCute: 'Niedlich & verspielt',
    imageStyleWatercolor: 'Aquarell',
    imageStyleComic: 'Comic-Stil',
    imageStyleRealistic: 'Realistisch',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Ozean',
    paletteSunset: 'Sonnenuntergang',
    paletteForest: 'Wald',
    paletteLavender: 'Lavendel',
    paletteSunshine: 'Sonne',
    paletteCocoa: 'Kakao',
    paletteRose: 'Rosa',
    paletteMidnight: 'Mitternacht',
    
    statusToRead: 'Noch zu lesen',
    statusCompleted: 'Abgeschlossen',
    statusAlreadyRead: 'Bereits gelesen',
    difficultyEasy: 'Leicht',
    difficultyMedium: 'Mittel',
    difficultyHard: 'Schwer',
    tabFiction: 'Geschichten',
    tabNonFiction: 'Sachgeschichten',
    tabSeries: 'Serien',
    seriesEpisode: 'Episode',
    seriesNextEpisode: 'Nächste Episode',
    seriesNoSeries: 'Noch keine Serien',
    seriesGenerating: 'Wird erstellt...',
    seriesReadFirst: 'Erst lesen',
    noStoriesForProfile: 'Noch keine Geschichten',
    addStory: 'Geschichte hinzufügen',
    chooseStory: 'Wähle eine Geschichte',
    noCategoryStories: 'Keine Geschichten in dieser Kategorie',
    allStoriesRead: 'Alle Geschichten gelesen! 🎉',
    noStoriesRead: 'Noch keine Geschichten gelesen',
    toastGeneratingStory: 'Geschichte wird erstellt... 📚',
    toastGenerationError: 'Fehler bei der Generierung',
    toastSaveError: 'Geschichte erstellt, aber Speicherfehler',
    toastStoryCreated: 'Geschichte erstellt! 🎉',
    vocabManageTitle: 'Wörter verwalten',
    vocabManageAdd: 'Wort hinzufügen',
    vocabManageAddPlaceholder: 'Neues Wort eingeben...',
    vocabManageAdding: 'Wird hinzugefügt...',
    vocabManageEmpty: 'Noch keine Wörter gespeichert',
    vocabManageDelete: 'Löschen',
    vocabManageDeleteConfirm: 'Wort wirklich löschen?',
    vocabManageLearned: 'Gelernt',
    vocabManageNotLearned: 'Noch nicht gelernt',
    vocabManageWords: 'Wörter',
    vocabWord: 'Wort',
    vocabExplanation: 'Erklärung',
    vocabQuizLast3: 'Quiz (letzte 3)',
    vocabAddButton: 'Hinzufügen',
    vocabCreateStoryFirst: 'Bitte zuerst eine Geschichte erstellen',
    vocabEnterWord: 'Bitte Wort eingeben',
    vocabSaveError: 'Fehler beim Speichern',
    vocabWordAdded: 'Wort hinzugefügt',
    vocabWordAddedCorrected: 'hinzugefügt (korrigiert)',
    vocabDeleteError: 'Fehler beim Löschen',
    vocabWordRemoved: 'Wort entfernt',
    vocabAllWords: 'Alle Wörter',
  },
  
  en: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    adminArea: 'Admin Area',
    newStory: 'Create New Reading Exercise',
    title: 'Title',
    coverImage: 'Cover Image',
    selectImage: 'Select Image',
    readingText: 'Reading Text',
    saveStory: 'Save Story',
    saving: 'Saving...',
    existingStories: 'Existing Stories',
    noStoriesYet: 'No stories yet',
    pointsConfig: 'Points Configuration',
    levelConfig: 'Level Configuration',
    settings: 'Settings',
    account: 'Account',
    
    generator: 'Generator',
    editor: 'Edit',
    library: 'Library',
    questionsReady: 'comprehension questions ready',
    
    storyGenerator: 'Story Generator',
    generateNewStory: 'Generate New Story with AI',
    textType: 'Text Type',
    fiction: 'Fiction',
    nonFiction: 'Non-Fiction',
    textLanguage: 'Text Language',
    globalLanguage: 'Global Language',
    childAge: 'Child Age',
    years: 'years',
    schoolLevel: 'School Level',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    textLength: 'Text Length',
    short: 'Short',
    long: 'Long',
    systemPrompt: 'System Prompt',
    showSystemPrompt: 'Show System Prompt',
    hideSystemPrompt: 'Hide System Prompt',
    savePrompt: 'Save Prompt',
    generateStory: 'Generate Story',
    generating: 'Generating...',
    storyTransferred: 'Story has been transferred to the form. You can now edit and save it.',
    
    enterTitleAndText: 'Please enter title and text',
    imageUploadError: 'Error uploading image',
    storySaveError: 'Error saving story',
    questionsCouldNotBeSaved: 'Questions could not be saved',
    storyAndQuestionsSaved: 'Story and questions saved! 🎉',
    generatingQuestions: 'Generating comprehension questions...',
    questionsGenerationFailed: 'Question generation failed',
    storyDeleted: 'Story deleted',
    deleteError: 'Error deleting',
    
    pointsConfiguration: 'Points Configuration',
    comprehensionQuestion: 'Comprehension Question',
    quizPerCorrectAnswer: 'Quiz (per correct answer)',
    storyRead: 'Story Read',
    pointsNote: 'Quiz points are only awarded when the quiz is passed overall (4/5 or 8/10).',
    savePointsConfig: 'Save Points Configuration',
    errorSaving: 'Error saving',
    pointsConfigSaved: 'Points configuration saved! 🎯',
    
    levelConfiguration: 'Level Configuration',
    defineLevels: 'Define the levels and required points.',
    fromPoints: 'From Points',
    saveLevelConfig: 'Save Level Configuration',
    levelConfigSaved: 'Level configuration saved! ⭐',
    
    kidProfile: 'Kid Profile',
    kidProfileDescription: 'Define the child\'s profile for personalized content.',
    kidName: 'Child\'s Name',
    kidAge: 'Age',
    hobbies: 'Hobbies & Interests',
    hobbiesPlaceholder: 'e.g. Soccer, Dinosaurs, Space, Painting...',
    colorPalette: 'Color Palette',
    generateCover: 'Generate Cover Image',
    generatingCover: 'Generating image...',
    saveProfile: 'Save Profile',
    profileSaved: 'Profile saved! 🎨',
    coverGenerated: 'Cover image generated! 🖼️',
    addChild: 'Add child',
    schoolSystem: 'School / App Language',
    schoolClass: 'Grade',
    imageStyle: 'Image Style',
    gender: 'Gender',
    age: 'Age',
    genderMale: 'Boy',
    genderFemale: 'Girl',
    genderDiverse: 'Diverse',
    
    imageStyleCute: 'Cute & playful',
    imageStyleWatercolor: 'Watercolor',
    imageStyleComic: 'Comic style',
    imageStyleRealistic: 'Realistic',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Ocean',
    paletteSunset: 'Sunset',
    paletteForest: 'Forest',
    paletteLavender: 'Lavender',
    paletteSunshine: 'Sunshine',
    paletteCocoa: 'Cocoa',
    paletteRose: 'Rose',
    paletteMidnight: 'Midnight',
    
    statusToRead: 'To read',
    statusCompleted: 'Completed',
    statusAlreadyRead: 'Already read',
    difficultyEasy: 'Easy',
    difficultyMedium: 'Medium',
    difficultyHard: 'Hard',
    tabFiction: 'Stories',
    tabNonFiction: 'Non-Fiction',
    tabSeries: 'Series',
    seriesEpisode: 'Episode',
    seriesNextEpisode: 'Next Episode',
    seriesNoSeries: 'No series yet',
    seriesGenerating: 'Creating...',
    seriesReadFirst: 'Read first',
    noStoriesForProfile: 'No stories yet',
    addStory: 'Add a story',
    chooseStory: 'Choose a story',
    noCategoryStories: 'No stories in this category',
    allStoriesRead: 'All stories read! 🎉',
    noStoriesRead: 'No stories read yet',
    toastGeneratingStory: 'Creating story... 📚',
    toastGenerationError: 'Error generating story',
    toastSaveError: 'Story created, but save error',
    toastStoryCreated: 'Story created! 🎉',
    vocabManageTitle: 'Manage words',
    vocabManageAdd: 'Add word',
    vocabManageAddPlaceholder: 'Enter new word...',
    vocabManageAdding: 'Adding...',
    vocabManageEmpty: 'No words saved yet',
    vocabManageDelete: 'Delete',
    vocabManageDeleteConfirm: 'Really delete word?',
    vocabManageLearned: 'Learned',
    vocabManageNotLearned: 'Not learned yet',
    vocabManageWords: 'Words',
    vocabWord: 'Word',
    vocabExplanation: 'Explanation',
    vocabQuizLast3: 'Quiz (last 3)',
    vocabAddButton: 'Add',
    vocabCreateStoryFirst: 'Please create a story first',
    vocabEnterWord: 'Please enter a word',
    vocabSaveError: 'Error saving',
    vocabWordAdded: 'Word added',
    vocabWordAddedCorrected: 'added (corrected)',
    vocabDeleteError: 'Error deleting',
    vocabWordRemoved: 'Word removed',
    vocabAllWords: 'All words',
  },
  
  fr: {
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    
    adminArea: 'Zone Admin',
    newStory: 'Créer un nouvel exercice de lecture',
    title: 'Titre',
    coverImage: 'Image de couverture',
    selectImage: 'Choisir une image',
    readingText: 'Texte de lecture',
    saveStory: 'Sauvegarder l\'histoire',
    saving: 'Sauvegarde...',
    existingStories: 'Histoires existantes',
    noStoriesYet: 'Pas encore d\'histoires',
    pointsConfig: 'Configuration des points',
    levelConfig: 'Configuration des niveaux',
    settings: 'Paramètres',
    account: 'Compte',
    
    generator: 'Générateur',
    editor: 'Éditer',
    library: 'Bibliothèque',
    questionsReady: 'questions de compréhension prêtes',
    
    storyGenerator: 'Générateur d\'histoires',
    generateNewStory: 'Générer une nouvelle histoire avec l\'IA',
    textType: 'Type de texte',
    fiction: 'Fiction',
    nonFiction: 'Documentaire',
    textLanguage: 'Langue du texte',
    globalLanguage: 'Langue globale',
    childAge: 'Âge de l\'enfant',
    years: 'ans',
    schoolLevel: 'Niveau scolaire',
    difficulty: 'Difficulté',
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    textLength: 'Longueur du texte',
    short: 'Court',
    long: 'Long',
    systemPrompt: 'Prompt système',
    showSystemPrompt: 'Afficher le prompt système',
    hideSystemPrompt: 'Masquer le prompt système',
    savePrompt: 'Sauvegarder le prompt',
    generateStory: 'Générer l\'histoire',
    generating: 'Génération...',
    storyTransferred: 'L\'histoire a été transférée dans le formulaire. Vous pouvez maintenant la modifier et la sauvegarder.',
    
    enterTitleAndText: 'Veuillez entrer le titre et le texte',
    imageUploadError: 'Erreur lors du téléchargement de l\'image',
    storySaveError: 'Erreur lors de la sauvegarde de l\'histoire',
    questionsCouldNotBeSaved: 'Les questions n\'ont pas pu être sauvegardées',
    storyAndQuestionsSaved: 'Histoire et questions sauvegardées ! 🎉',
    generatingQuestions: 'Génération des questions de compréhension...',
    questionsGenerationFailed: 'Échec de la génération des questions',
    storyDeleted: 'Histoire supprimée',
    deleteError: 'Erreur lors de la suppression',
    
    pointsConfiguration: 'Configuration des points',
    comprehensionQuestion: 'Question de compréhension',
    quizPerCorrectAnswer: 'Quiz (par réponse correcte)',
    storyRead: 'Histoire lue',
    pointsNote: 'Les points de quiz ne sont attribués que si le quiz est réussi (4/5 ou 8/10).',
    savePointsConfig: 'Sauvegarder la configuration des points',
    errorSaving: 'Erreur lors de la sauvegarde',
    pointsConfigSaved: 'Configuration des points sauvegardée ! 🎯',
    
    levelConfiguration: 'Configuration des niveaux',
    defineLevels: 'Définissez les niveaux et les points requis.',
    fromPoints: 'À partir de',
    saveLevelConfig: 'Sauvegarder la configuration des niveaux',
    levelConfigSaved: 'Configuration des niveaux sauvegardée ! ⭐',
    
    kidProfile: 'Profil de l\'enfant',
    kidProfileDescription: 'Définissez le profil de l\'enfant pour un contenu personnalisé.',
    kidName: 'Prénom de l\'enfant',
    kidAge: 'Âge',
    hobbies: 'Loisirs & Intérêts',
    hobbiesPlaceholder: 'ex. Football, Dinosaures, Espace, Peinture...',
    colorPalette: 'Palette de couleurs',
    generateCover: 'Générer l\'image de couverture',
    generatingCover: 'Génération de l\'image...',
    saveProfile: 'Sauvegarder le profil',
    profileSaved: 'Profil sauvegardé ! 🎨',
    coverGenerated: 'Image de couverture générée ! 🖼️',
    addChild: 'Ajouter un enfant',
    schoolSystem: 'École / Langue App',
    schoolClass: 'Classe',
    imageStyle: 'Style d\'image',
    gender: 'Genre',
    age: 'Âge',
    genderMale: 'Garçon',
    genderFemale: 'Fille',
    genderDiverse: 'Autre',
    
    imageStyleCute: 'Mignon & ludique',
    imageStyleWatercolor: 'Aquarelle',
    imageStyleComic: 'Style BD',
    imageStyleRealistic: 'Réaliste',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Océan',
    paletteSunset: 'Coucher de soleil',
    paletteForest: 'Forêt',
    paletteLavender: 'Lavande',
    paletteSunshine: 'Soleil',
    paletteCocoa: 'Cacao',
    paletteRose: 'Rose',
    paletteMidnight: 'Minuit',
    
    statusToRead: 'À lire',
    statusCompleted: 'Terminée',
    statusAlreadyRead: 'Déjà lues',
    difficultyEasy: 'Facile',
    difficultyMedium: 'Moyen',
    difficultyHard: 'Difficile',
    tabFiction: 'Histoires',
    tabNonFiction: 'Documentaires',
    tabSeries: 'Séries',
    seriesEpisode: 'Épisode',
    seriesNextEpisode: 'Prochain épisode',
    seriesNoSeries: 'Pas encore de séries',
    seriesGenerating: 'Création...',
    seriesReadFirst: "Lire d'abord",
    noStoriesForProfile: "Pas encore d'histoires",
    addStory: 'Ajouter une histoire',
    chooseStory: 'Choisis une histoire',
    noCategoryStories: 'Aucune histoire dans cette catégorie',
    allStoriesRead: 'Toutes les histoires lues! 🎉',
    noStoriesRead: 'Aucune histoire lue',
    toastGeneratingStory: "Création de l'histoire... 📚",
    toastGenerationError: 'Erreur lors de la génération',
    toastSaveError: 'Histoire créée, mais erreur de sauvegarde',
    toastStoryCreated: 'Histoire créée! 🎉',
    vocabManageTitle: 'Gérer les mots',
    vocabManageAdd: 'Ajouter un mot',
    vocabManageAddPlaceholder: 'Entrer un nouveau mot...',
    vocabManageAdding: 'Ajout...',
    vocabManageEmpty: 'Aucun mot enregistré',
    vocabManageDelete: 'Supprimer',
    vocabManageDeleteConfirm: 'Vraiment supprimer le mot?',
    vocabManageLearned: 'Appris',
    vocabManageNotLearned: 'Pas encore appris',
    vocabManageWords: 'Mots',
    vocabWord: 'Mot',
    vocabExplanation: 'Explication',
    vocabQuizLast3: 'Quiz (3 derniers)',
    vocabAddButton: 'Ajouter',
    vocabCreateStoryFirst: "Veuillez d'abord créer une histoire",
    vocabEnterWord: 'Veuillez entrer un mot',
    vocabSaveError: "Erreur lors de l'enregistrement",
    vocabWordAdded: 'Mot ajouté',
    vocabWordAddedCorrected: 'ajouté (corrigé)',
    vocabDeleteError: 'Erreur lors de la suppression',
    vocabWordRemoved: 'Mot supprimé',
    vocabAllWords: 'Tous les mots',
  },
  
  es: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    adminArea: 'Área de Administración',
    newStory: 'Crear nuevo ejercicio de lectura',
    title: 'Título',
    coverImage: 'Imagen de portada',
    selectImage: 'Seleccionar imagen',
    readingText: 'Texto de lectura',
    saveStory: 'Guardar historia',
    saving: 'Guardando...',
    existingStories: 'Historias existentes',
    noStoriesYet: 'Aún no hay historias',
    pointsConfig: 'Configuración de puntos',
    levelConfig: 'Configuración de niveles',
    settings: 'Configuración',
    account: 'Cuenta',
    
    generator: 'Generador',
    editor: 'Editar',
    library: 'Biblioteca',
    questionsReady: 'preguntas de comprensión listas',
    
    storyGenerator: 'Generador de historias',
    generateNewStory: 'Generar nueva historia con IA',
    textType: 'Tipo de texto',
    fiction: 'Ficción',
    nonFiction: 'No ficción',
    textLanguage: 'Idioma del texto',
    globalLanguage: 'Idioma global',
    childAge: 'Edad del niño',
    years: 'años',
    schoolLevel: 'Nivel escolar',
    difficulty: 'Dificultad',
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    textLength: 'Longitud del texto',
    short: 'Corto',
    long: 'Largo',
    systemPrompt: 'Prompt del sistema',
    showSystemPrompt: 'Mostrar prompt del sistema',
    hideSystemPrompt: 'Ocultar prompt del sistema',
    savePrompt: 'Guardar prompt',
    generateStory: 'Generar historia',
    generating: 'Generando...',
    storyTransferred: 'La historia ha sido transferida al formulario. Ahora puedes editarla y guardarla.',
    
    enterTitleAndText: 'Por favor ingresa título y texto',
    imageUploadError: 'Error al subir la imagen',
    storySaveError: 'Error al guardar la historia',
    questionsCouldNotBeSaved: 'Las preguntas no pudieron guardarse',
    storyAndQuestionsSaved: '¡Historia y preguntas guardadas! 🎉',
    generatingQuestions: 'Generando preguntas de comprensión...',
    questionsGenerationFailed: 'Falló la generación de preguntas',
    storyDeleted: 'Historia eliminada',
    deleteError: 'Error al eliminar',
    
    pointsConfiguration: 'Configuración de puntos',
    comprehensionQuestion: 'Pregunta de comprensión',
    quizPerCorrectAnswer: 'Quiz (por respuesta correcta)',
    storyRead: 'Historia leída',
    pointsNote: 'Los puntos del quiz solo se otorgan cuando el quiz se aprueba (4/5 o 8/10).',
    savePointsConfig: 'Guardar configuración de puntos',
    errorSaving: 'Error al guardar',
    pointsConfigSaved: '¡Configuración de puntos guardada! 🎯',
    
    levelConfiguration: 'Configuración de niveles',
    defineLevels: 'Define los niveles y los puntos requeridos.',
    fromPoints: 'Desde puntos',
    saveLevelConfig: 'Guardar configuración de niveles',
    levelConfigSaved: '¡Configuración de niveles guardada! ⭐',
    
    kidProfile: 'Perfil del niño',
    kidProfileDescription: 'Define el perfil del niño para contenido personalizado.',
    kidName: 'Nombre del niño',
    kidAge: 'Edad',
    hobbies: 'Hobbies e intereses',
    hobbiesPlaceholder: 'ej. Fútbol, Dinosaurios, Espacio, Pintura...',
    colorPalette: 'Paleta de colores',
    generateCover: 'Generar imagen de portada',
    generatingCover: 'Generando imagen...',
    saveProfile: 'Guardar perfil',
    profileSaved: '¡Perfil guardado! 🎨',
    coverGenerated: '¡Imagen de portada generada! 🖼️',
    addChild: 'Añadir niño',
    schoolSystem: 'Escuela / Idioma App',
    schoolClass: 'Grado',
    imageStyle: 'Estilo de imagen',
    gender: 'Género',
    age: 'Edad',
    genderMale: 'Niño',
    genderFemale: 'Niña',
    genderDiverse: 'Diverso',
    
    imageStyleCute: 'Lindo & juguetón',
    imageStyleWatercolor: 'Acuarela',
    imageStyleComic: 'Estilo cómic',
    imageStyleRealistic: 'Realista',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Océano',
    paletteSunset: 'Atardecer',
    paletteForest: 'Bosque',
    paletteLavender: 'Lavanda',
    paletteSunshine: 'Sol',
    paletteCocoa: 'Cacao',
    paletteRose: 'Rosa',
    paletteMidnight: 'Medianoche',
    
    statusToRead: 'Por leer',
    statusCompleted: 'Completada',
    statusAlreadyRead: 'Ya leídas',
    difficultyEasy: 'Fácil',
    difficultyMedium: 'Medio',
    difficultyHard: 'Difícil',
    tabFiction: 'Historias',
    tabNonFiction: 'No Ficción',
    tabSeries: 'Series',
    seriesEpisode: 'Episodio',
    seriesNextEpisode: 'Siguiente episodio',
    seriesNoSeries: 'Aún no hay series',
    seriesGenerating: 'Creando...',
    seriesReadFirst: 'Leer primero',
    noStoriesForProfile: 'Aún no hay historias',
    addStory: 'Añadir historia',
    chooseStory: 'Elige una historia',
    noCategoryStories: 'No hay historias en esta categoría',
    allStoriesRead: '¡Todas las historias leídas! 🎉',
    noStoriesRead: 'Ninguna historia leída',
    toastGeneratingStory: 'Creando historia... 📚',
    toastGenerationError: 'Error al generar la historia',
    toastSaveError: 'Historia creada, pero error al guardar',
    toastStoryCreated: '¡Historia creada! 🎉',
    vocabManageTitle: 'Gestionar palabras',
    vocabManageAdd: 'Añadir palabra',
    vocabManageAddPlaceholder: 'Introducir nueva palabra...',
    vocabManageAdding: 'Añadiendo...',
    vocabManageEmpty: 'Aún no hay palabras guardadas',
    vocabManageDelete: 'Eliminar',
    vocabManageDeleteConfirm: '¿Realmente eliminar la palabra?',
    vocabManageLearned: 'Aprendida',
    vocabManageNotLearned: 'Aún no aprendida',
    vocabManageWords: 'Palabras',
    vocabWord: 'Palabra',
    vocabExplanation: 'Explicación',
    vocabQuizLast3: 'Quiz (últimos 3)',
    vocabAddButton: 'Añadir',
    vocabCreateStoryFirst: 'Primero crea una historia',
    vocabEnterWord: 'Introduce una palabra',
    vocabSaveError: 'Error al guardar',
    vocabWordAdded: 'Palabra añadida',
    vocabWordAddedCorrected: 'añadida (corregida)',
    vocabDeleteError: 'Error al eliminar',
    vocabWordRemoved: 'Palabra eliminada',
    vocabAllWords: 'Todas las palabras',
  },
  
  nl: {
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succes',
    
    adminArea: 'Admin Gebied',
    newStory: 'Nieuwe leesoefening maken',
    title: 'Titel',
    coverImage: 'Omslagafbeelding',
    selectImage: 'Afbeelding selecteren',
    readingText: 'Leestekst',
    saveStory: 'Verhaal opslaan',
    saving: 'Opslaan...',
    existingStories: 'Bestaande verhalen',
    noStoriesYet: 'Nog geen verhalen',
    pointsConfig: 'Puntenconfiguratie',
    levelConfig: 'Niveauconfiguratie',
    settings: 'Instellingen',
    account: 'Account',
    
    generator: 'Generator',
    editor: 'Bewerken',
    library: 'Bibliotheek',
    questionsReady: 'begripsvragen klaar',
    
    storyGenerator: 'Verhaalgenerator',
    generateNewStory: 'Nieuw verhaal genereren met AI',
    textType: 'Teksttype',
    fiction: 'Fictie',
    nonFiction: 'Non-fictie',
    textLanguage: 'Teksttaal',
    globalLanguage: 'Globale taal',
    childAge: 'Leeftijd kind',
    years: 'jaar',
    schoolLevel: 'Schoolniveau',
    difficulty: 'Moeilijkheid',
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',
    textLength: 'Tekstlengte',
    short: 'Kort',
    long: 'Lang',
    systemPrompt: 'Systeemprompt',
    showSystemPrompt: 'Systeemprompt tonen',
    hideSystemPrompt: 'Systeemprompt verbergen',
    savePrompt: 'Prompt opslaan',
    generateStory: 'Verhaal genereren',
    generating: 'Genereren...',
    storyTransferred: 'Verhaal is overgebracht naar het formulier. Je kunt het nu bewerken en opslaan.',
    
    enterTitleAndText: 'Voer titel en tekst in',
    imageUploadError: 'Fout bij uploaden afbeelding',
    storySaveError: 'Fout bij opslaan verhaal',
    questionsCouldNotBeSaved: 'Vragen konden niet worden opgeslagen',
    storyAndQuestionsSaved: 'Verhaal en vragen opgeslagen! 🎉',
    generatingQuestions: 'Begripsvragen genereren...',
    questionsGenerationFailed: 'Vragen genereren mislukt',
    storyDeleted: 'Verhaal verwijderd',
    deleteError: 'Fout bij verwijderen',
    
    pointsConfiguration: 'Puntenconfiguratie',
    comprehensionQuestion: 'Begripsvraag',
    quizPerCorrectAnswer: 'Quiz (per correct antwoord)',
    storyRead: 'Verhaal gelezen',
    pointsNote: 'Quizpunten worden alleen toegekend als de quiz wordt gehaald (4/5 of 8/10).',
    savePointsConfig: 'Puntenconfiguratie opslaan',
    errorSaving: 'Fout bij opslaan',
    pointsConfigSaved: 'Puntenconfiguratie opgeslagen! 🎯',
    
    levelConfiguration: 'Niveauconfiguratie',
    defineLevels: 'Definieer de niveaus en vereiste punten.',
    fromPoints: 'Vanaf punten',
    saveLevelConfig: 'Niveauconfiguratie opslaan',
    levelConfigSaved: 'Niveauconfiguratie opgeslagen! ⭐',
    
    kidProfile: 'Kindprofiel',
    kidProfileDescription: 'Definieer het profiel van het kind voor gepersonaliseerde inhoud.',
    kidName: 'Naam van het kind',
    kidAge: 'Leeftijd',
    hobbies: 'Hobby\'s & Interesses',
    hobbiesPlaceholder: 'bijv. Voetbal, Dinosaurussen, Ruimte, Schilderen...',
    colorPalette: 'Kleurenpalet',
    generateCover: 'Omslagafbeelding genereren',
    generatingCover: 'Afbeelding genereren...',
    saveProfile: 'Profiel opslaan',
    profileSaved: 'Profiel opgeslagen! 🎨',
    coverGenerated: 'Omslagafbeelding gegenereerd! 🖼️',
    addChild: 'Kind toevoegen',
    schoolSystem: 'School / App-taal',
    schoolClass: 'Groep',
    imageStyle: 'Afbeeldingsstijl',
    gender: 'Geslacht',
    age: 'Leeftijd',
    genderMale: 'Jongen',
    genderFemale: 'Meisje',
    genderDiverse: 'Divers',
    
    imageStyleCute: 'Schattig & speels',
    imageStyleWatercolor: 'Aquarel',
    imageStyleComic: 'Stripstijl',
    imageStyleRealistic: 'Realistisch',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Oceaan',
    paletteSunset: 'Zonsondergang',
    paletteForest: 'Bos',
    paletteLavender: 'Lavendel',
    paletteSunshine: 'Zon',
    paletteCocoa: 'Cacao',
    paletteRose: 'Roze',
    paletteMidnight: 'Middernacht',
    
    statusToRead: 'Te lezen',
    statusCompleted: 'Voltooid',
    statusAlreadyRead: 'Al gelezen',
    difficultyEasy: 'Makkelijk',
    difficultyMedium: 'Gemiddeld',
    difficultyHard: 'Moeilijk',
    tabFiction: 'Verhalen',
    tabNonFiction: 'Non-Fictie',
    tabSeries: 'Series',
    seriesEpisode: 'Aflevering',
    seriesNextEpisode: 'Volgende aflevering',
    seriesNoSeries: 'Nog geen series',
    seriesGenerating: 'Maken...',
    seriesReadFirst: 'Eerst lezen',
    noStoriesForProfile: 'Nog geen verhalen',
    addStory: 'Verhaal toevoegen',
    chooseStory: 'Kies een verhaal',
    noCategoryStories: 'Geen verhalen in deze categorie',
    allStoriesRead: 'Alle verhalen gelezen! 🎉',
    noStoriesRead: 'Nog geen verhalen gelezen',
    toastGeneratingStory: 'Verhaal maken... 📚',
    toastGenerationError: 'Fout bij genereren',
    toastSaveError: 'Verhaal gemaakt, maar opslagfout',
    toastStoryCreated: 'Verhaal gemaakt! 🎉',
    vocabManageTitle: 'Woorden beheren',
    vocabManageAdd: 'Woord toevoegen',
    vocabManageAddPlaceholder: 'Nieuw woord invoeren...',
    vocabManageAdding: 'Toevoegen...',
    vocabManageEmpty: 'Nog geen woorden opgeslagen',
    vocabManageDelete: 'Verwijderen',
    vocabManageDeleteConfirm: 'Woord echt verwijderen?',
    vocabManageLearned: 'Geleerd',
    vocabManageNotLearned: 'Nog niet geleerd',
    vocabManageWords: 'Woorden',
    vocabWord: 'Woord',
    vocabExplanation: 'Uitleg',
    vocabQuizLast3: 'Quiz (laatste 3)',
    vocabAddButton: 'Toevoegen',
    vocabCreateStoryFirst: 'Maak eerst een verhaal aan',
    vocabEnterWord: 'Voer een woord in',
    vocabSaveError: 'Fout bij opslaan',
    vocabWordAdded: 'Woord toegevoegd',
    vocabWordAddedCorrected: 'toegevoegd (gecorrigeerd)',
    vocabDeleteError: 'Fout bij verwijderen',
    vocabWordRemoved: 'Woord verwijderd',
    vocabAllWords: 'Alle woorden',
  },
  
  it: {
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    
    adminArea: 'Area Admin',
    newStory: 'Crea nuovo esercizio di lettura',
    title: 'Titolo',
    coverImage: 'Immagine di copertina',
    selectImage: 'Seleziona immagine',
    readingText: 'Testo di lettura',
    saveStory: 'Salva storia',
    saving: 'Salvataggio...',
    existingStories: 'Storie esistenti',
    noStoriesYet: 'Nessuna storia ancora',
    pointsConfig: 'Configurazione punti',
    levelConfig: 'Configurazione livelli',
    settings: 'Impostazioni',
    account: 'Account',
    
    generator: 'Generatore',
    editor: 'Editor',
    library: 'Biblioteca',
    questionsReady: 'domande di comprensione pronte',
    
    storyGenerator: 'Generatore di storie',
    generateNewStory: 'Genera nuova storia con IA',
    textType: 'Tipo di testo',
    fiction: 'Narrativa',
    nonFiction: 'Non-fiction',
    textLanguage: 'Lingua del testo',
    globalLanguage: 'Lingua globale',
    childAge: 'Età del bambino',
    years: 'anni',
    schoolLevel: 'Livello scolastico',
    difficulty: 'Difficoltà',
    easy: 'Facile',
    medium: 'Medio',
    hard: 'Difficile',
    textLength: 'Lunghezza testo',
    short: 'Breve',
    long: 'Lungo',
    systemPrompt: 'Prompt di sistema',
    showSystemPrompt: 'Mostra prompt di sistema',
    hideSystemPrompt: 'Nascondi prompt di sistema',
    savePrompt: 'Salva prompt',
    generateStory: 'Genera storia',
    generating: 'Generazione...',
    storyTransferred: 'La storia è stata trasferita nel modulo. Ora puoi modificarla e salvarla.',
    
    enterTitleAndText: 'Inserisci titolo e testo',
    imageUploadError: 'Errore nel caricamento immagine',
    storySaveError: 'Errore nel salvataggio storia',
    questionsCouldNotBeSaved: 'Le domande non sono state salvate',
    storyAndQuestionsSaved: 'Storia e domande salvate! 🎉',
    generatingQuestions: 'Generazione domande di comprensione...',
    questionsGenerationFailed: 'Generazione domande fallita',
    storyDeleted: 'Storia eliminata',
    deleteError: 'Errore durante eliminazione',
    
    pointsConfiguration: 'Configurazione punti',
    comprehensionQuestion: 'Domanda di comprensione',
    quizPerCorrectAnswer: 'Quiz (per risposta corretta)',
    storyRead: 'Storia letta',
    pointsNote: 'I punti del quiz vengono assegnati solo se il quiz viene superato (4/5 o 8/10).',
    savePointsConfig: 'Salva configurazione punti',
    errorSaving: 'Errore durante il salvataggio',
    pointsConfigSaved: 'Configurazione punti salvata! 🎯',
    
    levelConfiguration: 'Configurazione livelli',
    defineLevels: 'Definisci i livelli e i punti richiesti.',
    fromPoints: 'Da punti',
    saveLevelConfig: 'Salva configurazione livelli',
    levelConfigSaved: 'Configurazione livelli salvata! ⭐',
    
    kidProfile: 'Profilo bambino',
    kidProfileDescription: 'Definisci il profilo del bambino per contenuti personalizzati.',
    kidName: 'Nome del bambino',
    kidAge: 'Età',
    hobbies: 'Hobby e interessi',
    hobbiesPlaceholder: 'es. Calcio, Dinosauri, Spazio, Pittura...',
    colorPalette: 'Palette colori',
    generateCover: 'Genera immagine di copertina',
    generatingCover: 'Generazione immagine...',
    saveProfile: 'Salva profilo',
    profileSaved: 'Profilo salvato! 🎨',
    coverGenerated: 'Immagine di copertina generata! 🖼️',
    addChild: 'Aggiungi bambino',
    schoolSystem: 'Scuola / Lingua App',
    schoolClass: 'Classe',
    imageStyle: 'Stile immagine',
    gender: 'Genere',
    age: 'Età',
    genderMale: 'Ragazzo',
    genderFemale: 'Ragazza',
    genderDiverse: 'Altro',
    
    imageStyleCute: 'Carino & giocoso',
    imageStyleWatercolor: 'Acquerello',
    imageStyleComic: 'Stile fumetto',
    imageStyleRealistic: 'Realistico',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Oceano',
    paletteSunset: 'Tramonto',
    paletteForest: 'Foresta',
    paletteLavender: 'Lavanda',
    paletteSunshine: 'Sole',
    paletteCocoa: 'Cacao',
    paletteRose: 'Rosa',
    paletteMidnight: 'Mezzanotte',
    
    statusToRead: 'Da leggere',
    statusCompleted: 'Completata',
    statusAlreadyRead: 'Già lette',
    difficultyEasy: 'Facile',
    difficultyMedium: 'Medio',
    difficultyHard: 'Difficile',
    tabFiction: 'Storie',
    tabNonFiction: 'Non-fiction',
    tabSeries: 'Serie',
    seriesEpisode: 'Episodio',
    seriesNextEpisode: 'Prossimo episodio',
    seriesNoSeries: 'Nessuna serie ancora',
    seriesGenerating: 'Creazione...',
    seriesReadFirst: 'Leggere prima',
    noStoriesForProfile: 'Nessuna storia ancora',
    addStory: 'Aggiungi storia',
    chooseStory: 'Scegli una storia',
    noCategoryStories: 'Nessuna storia in questa categoria',
    allStoriesRead: 'Tutte le storie lette! 🎉',
    noStoriesRead: 'Nessuna storia letta',
    toastGeneratingStory: 'Creazione storia... 📚',
    toastGenerationError: 'Errore nella generazione',
    toastSaveError: 'Storia creata, ma errore di salvataggio',
    toastStoryCreated: 'Storia creata! 🎉',
    vocabManageTitle: 'Gestisci parole',
    vocabManageAdd: 'Aggiungi parola',
    vocabManageAddPlaceholder: 'Inserisci nuova parola...',
    vocabManageAdding: 'Aggiungendo...',
    vocabManageEmpty: 'Nessuna parola salvata',
    vocabManageDelete: 'Elimina',
    vocabManageDeleteConfirm: 'Eliminare davvero la parola?',
    vocabManageLearned: 'Imparata',
    vocabManageNotLearned: 'Non ancora imparata',
    vocabManageWords: 'Parole',
    vocabWord: 'Parola',
    vocabExplanation: 'Spiegazione',
    vocabQuizLast3: 'Quiz (ultimi 3)',
    vocabAddButton: 'Aggiungi',
    vocabCreateStoryFirst: 'Prima crea una storia',
    vocabEnterWord: 'Inserisci una parola',
    vocabSaveError: 'Errore nel salvataggio',
    vocabWordAdded: 'Parola aggiunta',
    vocabWordAddedCorrected: 'aggiunta (corretta)',
    vocabDeleteError: 'Errore nella cancellazione',
    vocabWordRemoved: 'Parola rimossa',
    vocabAllWords: 'Tutte le parole',
  },
  
  bs: {
    save: 'Sačuvaj',
    cancel: 'Otkaži',
    delete: 'Obriši',
    edit: 'Uredi',
    loading: 'Učitavanje...',
    error: 'Greška',
    success: 'Uspjeh',
    
    adminArea: 'Admin područje',
    newStory: 'Kreiraj novu vježbu čitanja',
    title: 'Naslov',
    coverImage: 'Naslovna slika',
    selectImage: 'Odaberi sliku',
    readingText: 'Tekst za čitanje',
    saveStory: 'Sačuvaj priču',
    saving: 'Čuvanje...',
    existingStories: 'Postojeće priče',
    noStoriesYet: 'Još nema priča',
    pointsConfig: 'Konfiguracija bodova',
    levelConfig: 'Konfiguracija nivoa',
    settings: 'Postavke',
    account: 'Račun',
    
    generator: 'Generator',
    editor: 'Uredi',
    library: 'Biblioteka',
    questionsReady: 'pitanja razumijevanja spremna',
    
    storyGenerator: 'Generator priča',
    generateNewStory: 'Generiši novu priču s AI',
    textType: 'Vrsta teksta',
    fiction: 'Fikcija',
    nonFiction: 'Poučni tekst',
    textLanguage: 'Jezik teksta',
    globalLanguage: 'Globalni jezik',
    childAge: 'Starost djeteta',
    years: 'godina',
    schoolLevel: 'Školski nivo',
    difficulty: 'Težina',
    easy: 'Lako',
    medium: 'Srednje',
    hard: 'Teško',
    textLength: 'Dužina teksta',
    short: 'Kratko',
    long: 'Dugo',
    systemPrompt: 'Sistemski prompt',
    showSystemPrompt: 'Prikaži sistemski prompt',
    hideSystemPrompt: 'Sakrij sistemski prompt',
    savePrompt: 'Sačuvaj prompt',
    generateStory: 'Generiši priču',
    generating: 'Generisanje...',
    storyTransferred: 'Priča je prenesena u formular. Sada je možeš urediti i sačuvati.',
    
    enterTitleAndText: 'Molimo unesite naslov i tekst',
    imageUploadError: 'Greška pri učitavanju slike',
    storySaveError: 'Greška pri čuvanju priče',
    questionsCouldNotBeSaved: 'Pitanja nisu mogla biti sačuvana',
    storyAndQuestionsSaved: 'Priča i pitanja sačuvani! 🎉',
    generatingQuestions: 'Generisanje pitanja razumijevanja...',
    questionsGenerationFailed: 'Generisanje pitanja neuspješno',
    storyDeleted: 'Priča obrisana',
    deleteError: 'Greška pri brisanju',
    
    pointsConfiguration: 'Konfiguracija bodova',
    comprehensionQuestion: 'Pitanje razumijevanja',
    quizPerCorrectAnswer: 'Kviz (po tačnom odgovoru)',
    storyRead: 'Priča pročitana',
    pointsNote: 'Bodovi kviza se dodjeljuju samo ako je kviz položen (4/5 ili 8/10).',
    savePointsConfig: 'Sačuvaj konfiguraciju bodova',
    errorSaving: 'Greška pri čuvanju',
    pointsConfigSaved: 'Konfiguracija bodova sačuvana! 🎯',
    
    levelConfiguration: 'Konfiguracija nivoa',
    defineLevels: 'Definiši nivoe i potrebne bodove.',
    fromPoints: 'Od bodova',
    saveLevelConfig: 'Sačuvaj konfiguraciju nivoa',
    levelConfigSaved: 'Konfiguracija nivoa sačuvana! ⭐',
    
    kidProfile: 'Profil djeteta',
    kidProfileDescription: 'Definiši profil djeteta za personalizirani sadržaj.',
    kidName: 'Ime djeteta',
    kidAge: 'Starost',
    hobbies: 'Hobiji i interesi',
    hobbiesPlaceholder: 'npr. Fudbal, Dinosaurusi, Svemir, Slikanje...',
    colorPalette: 'Paleta boja',
    generateCover: 'Generiši naslovnu sliku',
    generatingCover: 'Generisanje slike...',
    saveProfile: 'Sačuvaj profil',
    profileSaved: 'Profil sačuvan! 🎨',
    coverGenerated: 'Naslovna slika generisana! 🖼️',
    addChild: 'Dodaj dijete',
    schoolSystem: 'Škola / Jezik Aplikacije',
    schoolClass: 'Razred',
    imageStyle: 'Stil slike',
    gender: 'Spol',
    age: 'Starost',
    genderMale: 'Dječak',
    genderFemale: 'Djevojčica',
    genderDiverse: 'Drugo',
    
    imageStyleCute: 'Slatko & razigrano',
    imageStyleWatercolor: 'Akvarel',
    imageStyleComic: 'Strip stil',
    imageStyleRealistic: 'Realistično',
    imageStyleAnime: 'Anime/Manga',
    
    paletteOcean: 'Okean',
    paletteSunset: 'Zalazak sunca',
    paletteForest: 'Šuma',
    paletteLavender: 'Lavanda',
    paletteSunshine: 'Sunce',
    paletteCocoa: 'Kakao',
    paletteRose: 'Roze',
    paletteMidnight: 'Ponoć',
    
    statusToRead: 'Za čitanje',
    statusCompleted: 'Završeno',
    statusAlreadyRead: 'Već pročitano',
    difficultyEasy: 'Lako',
    difficultyMedium: 'Srednje',
    difficultyHard: 'Teško',
    tabFiction: 'Priče',
    tabNonFiction: 'Poučni tekstovi',
    tabSeries: 'Serije',
    seriesEpisode: 'Epizoda',
    seriesNextEpisode: 'Sljedeća epizoda',
    seriesNoSeries: 'Još nema serija',
    seriesGenerating: 'Kreiranje...',
    seriesReadFirst: 'Prvo pročitaj',
    noStoriesForProfile: 'Još nema priča',
    addStory: 'Dodaj priču',
    chooseStory: 'Odaberi priču',
    noCategoryStories: 'Nema priča u ovoj kategoriji',
    allStoriesRead: 'Sve priče pročitane! 🎉',
    noStoriesRead: 'Još nijedna priča pročitana',
    toastGeneratingStory: 'Kreiranje priče... 📚',
    toastGenerationError: 'Greška pri generisanju',
    toastSaveError: 'Priča kreirana, ali greška pri čuvanju',
    toastStoryCreated: 'Priča kreirana! 🎉',
    vocabManageTitle: 'Upravljaj riječima',
    vocabManageAdd: 'Dodaj riječ',
    vocabManageAddPlaceholder: 'Unesite novu riječ...',
    vocabManageAdding: 'Dodavanje...',
    vocabManageEmpty: 'Još nema sačuvanih riječi',
    vocabManageDelete: 'Obriši',
    vocabManageDeleteConfirm: 'Zaista obrisati riječ?',
    vocabManageLearned: 'Naučeno',
    vocabManageNotLearned: 'Još nije naučeno',
    vocabManageWords: 'Riječi',
    vocabWord: 'Riječ',
    vocabExplanation: 'Objašnjenje',
    vocabQuizLast3: 'Kviz (posljednja 3)',
    vocabAddButton: 'Dodaj',
    vocabCreateStoryFirst: 'Prvo kreirajte priču',
    vocabEnterWord: 'Unesite riječ',
    vocabSaveError: 'Greška pri čuvanju',
    vocabWordAdded: 'Riječ dodana',
    vocabWordAddedCorrected: 'dodana (ispravljena)',
    vocabDeleteError: 'Greška pri brisanju',
    vocabWordRemoved: 'Riječ uklonjena',
    vocabAllWords: 'Sve riječi',
  },
};

export const getTranslations = (lang: Language): Translations => {
  return translations[lang] || translations.de;
};

export const useTranslations = (lang: Language) => {
  return getTranslations(lang);
};
