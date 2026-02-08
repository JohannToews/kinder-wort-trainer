import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Settings, Sparkles, Star, Brain, Users, BarChart3, Hand } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useKidProfile } from "@/hooks/useKidProfile";
import { getTranslations } from "@/lib/translations";
import { useGamification } from "@/hooks/useGamification";
import FablinoReaction from "@/components/FablinoReaction";
import MigrationBanner from "@/components/MigrationBanner";

const Index = () => {
  const navigate = useNavigate();
  const { user, needsMigration } = useAuth();
  const { colors: paletteColors } = useColorPalette();
  const {
    kidProfiles,
    selectedProfileId,
    selectedProfile,
    setSelectedProfileId,
    hasMultipleProfiles,
    kidAppLanguage,
    isLoading,
  } = useKidProfile();

  const {
    state: gamification,
    isLoading: gamLoading,
    pendingLevelUp,
    clearPendingLevelUp,
  } = useGamification();

  const t = getTranslations(kidAppLanguage);
  const childName = selectedProfile?.name || '';

  // ═══ Fablino greeting logic ═══

  const getFablinoGreeting = (): string => {
    if (!gamification || !childName) {
      return t.fablinoWelcome.replace('{name}', childName);
    }

    // Already read today
    if (gamification.isStreakDay) {
      return t.fablinoAlreadyRead;
    }

    // Returning after a break (streak lost but has read before)
    if (gamification.currentStreak === 0 && gamification.storiesCompleted > 0) {
      return t.fablinoWelcomeBack.replace('{name}', childName);
    }

    // Active streak
    if (gamification.currentStreak > 0) {
      return t.fablinoStreak
        .replace('{days}', String(gamification.currentStreak))
        .replace('{name}', childName);
    }

    return t.fablinoWelcome.replace('{name}', childName);
  };

  const fablinoGreetingMessage = getFablinoGreeting();

  // ═══ Heading logic ═══

  const getHeading = (): string => {
    if (!childName) return 'Fablino';
    if (gamification?.currentStreak && gamification.currentStreak > 0 && !gamification.isStreakDay) {
      return t.fablinoStreak
        .replace('{days}', String(gamification.currentStreak))
        .replace('{name}', childName);
    }
    return t.fablinoWelcome.replace('{name}', childName);
  };

  // ═══ Level title translation ═══

  const getTranslatedLevelTitle = (titleKey: string): string => {
    const key = `level${titleKey.charAt(0).toUpperCase() + titleKey.slice(1)}` as keyof typeof t;
    return (t[key] as string) || titleKey;
  };

  // ═══ Loading state ═══

  if (isLoading || gamLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${paletteColors.bg} flex items-center justify-center`}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Star className="h-12 w-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${paletteColors.bg} overflow-hidden`}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-10 left-10 w-20 h-20 ${paletteColors.accent} rounded-full blur-2xl animate-bounce-soft`} />
        <div className={`absolute top-40 right-20 w-32 h-32 ${paletteColors.accent} rounded-full blur-3xl animate-bounce-soft`} style={{ animationDelay: "0.5s" }} />
        <div className={`absolute bottom-40 left-1/4 w-24 h-24 ${paletteColors.accent} rounded-full blur-2xl animate-bounce-soft`} style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative container max-w-lg mx-auto px-4 py-4 md:py-6 flex flex-col items-center min-h-screen">
        {/* Migration Banner */}
        {needsMigration && (
          <div className="w-full mb-4">
            <MigrationBanner language={kidAppLanguage} />
          </div>
        )}

        {/* Top Right Icons */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate("/feedback-stats")}
              className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
              title="Statistics"
            >
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => navigate("/words")}
            className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
            title={t.myWords}
          >
            <Hand className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border hover:bg-muted transition-colors"
            title="Settings"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Profile Selector (only when multiple kids) */}
        {hasMultipleProfiles && (
          <div className="flex items-center justify-center gap-2 mb-4 mt-12 w-full">
            {kidProfiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200
                  ${selectedProfileId === profile.id
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'bg-card/60 hover:bg-card/80'
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0
                  ${selectedProfileId === profile.id ? 'border-primary' : 'border-border'}
                `}>
                  {profile.cover_image_url ? (
                    <img
                      src={profile.cover_image_url}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className={`
                  text-sm font-medium whitespace-nowrap
                  ${selectedProfileId === profile.id ? 'text-primary' : 'text-muted-foreground'}
                `}>
                  {profile.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Profil + Gamification Header */}
        <div className={`flex items-center gap-4 w-full mb-6 ${hasMultipleProfiles ? '' : 'mt-14'}`}>
          {/* Profilbild */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
            {selectedProfile?.cover_image_url ? (
              <img
                src={selectedProfile.cover_image_url}
                alt={childName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-left">
            <h1 className="text-xl font-baloo font-bold text-foreground leading-tight">
              {getHeading()}
            </h1>
            {gamification && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                <span>⭐ {gamification.stars}</span>
                <span>📖 {getTranslatedLevelTitle(gamification.levelTitle)}</span>
                {gamification.currentStreak > 0 && (
                  <span>🔥 {gamification.currentStreak} {t.streak}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fablino Greeting Card */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl p-4 border border-border">
            <img
              src="/mascot/6_Onboarding.png"
              alt="Fablino"
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <p className="text-sm font-medium text-foreground">
              {fablinoGreetingMessage}
            </p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="w-full space-y-3 mb-4">
          {/* Neue Geschichte - Primary CTA */}
          <Card
            onClick={() => navigate("/create-story")}
            className="cursor-pointer border-2 border-primary hover:shadow-lg transition-all group touch-manipulation"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-baloo font-bold text-base">{t.generateNewStory}</h3>
              </div>
            </CardContent>
          </Card>

          {/* Meine Geschichten */}
          <Card
            onClick={() => navigate("/stories")}
            className="cursor-pointer border-2 border-border hover:border-primary/50 hover:shadow-md transition-all group touch-manipulation"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-baloo font-bold text-base">{t.chooseStory}</h3>
              </div>
            </CardContent>
          </Card>

          {/* Wörter-Quiz */}
          <Card
            onClick={() => navigate("/quiz")}
            className="cursor-pointer border-2 border-border hover:border-accent/50 hover:shadow-md transition-all group touch-manipulation"
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-baloo font-bold text-base">{t.vocabManageTitle}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Navigation */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Sticker-Buch */}
          <Card
            onClick={() => navigate("/sticker-buch")}
            className="cursor-pointer border-2 border-border hover:border-amber-400 hover:shadow-md transition-all group touch-manipulation"
          >
            <CardContent className="flex flex-col items-center p-4 text-center">
              <span className="text-2xl mb-2">📖</span>
              <h3 className="font-baloo font-bold text-sm">{t.stickerBook}</h3>
            </CardContent>
          </Card>

          {/* Meine Wörter */}
          <Card
            onClick={() => navigate("/meine-woerter")}
            className="cursor-pointer border-2 border-border hover:border-purple-400 hover:shadow-md transition-all group touch-manipulation"
          >
            <CardContent className="flex flex-col items-center p-4 text-center">
              <span className="text-2xl mb-2">📚</span>
              <h3 className="font-baloo font-bold text-sm">{t.myWords}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Level Up Overlay */}
        {pendingLevelUp && (
          <FablinoReaction
            type="levelUp"
            message={t.fablinoLevelUp.replace('{title}', getTranslatedLevelTitle(pendingLevelUp.title))}
            onClose={clearPendingLevelUp}
            buttonLabel={t.continueButton}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
