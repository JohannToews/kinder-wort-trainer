import { useNavigate } from "react-router-dom";
import { useKidProfile } from "@/hooks/useKidProfile";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";
import { Settings, BarChart3 } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";

// ═══ Speech Bubble Component ═══
interface SpeechBubbleProps {
  children: React.ReactNode;
  variant?: "hero" | "tip";
}

const SpeechBubble = ({ children, variant = "hero" }: SpeechBubbleProps) => {
  const isHero = variant === "hero";
  
  return (
    <div className="relative">
      <div
        className={`
          relative rounded-[18px] px-5 py-3
          ${isHero 
            ? "bg-white shadow-[0_3px_16px_rgba(0,0,0,0.08)] animate-speech-bubble text-left" 
            : "bg-orange-50 border border-orange-100 text-center"
          }
        `}
        style={{
          animationDelay: isHero ? "0.1s" : "0s",
          animationFillMode: "both",
        }}
      >
        <span className={`font-nunito ${isHero ? "text-[20px] font-semibold" : "text-[13px] font-semibold"}`} style={{ color: "#2D1810" }}>
          {children}
        </span>
      </div>
      {/* Triangle pointing LEFT toward Fablino */}
      {isHero && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 -left-2"
          style={{
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderRight: "10px solid white",
          }}
        />
      )}
    </div>
  );
};

// ═══ Localized texts ═══

const GREETINGS: Record<string, { withName: (name: string) => string; withoutName: string }> = {
  fr: { withName: (n) => `Bonjour ${n} ! Envie d'une histoire ? 📖`, withoutName: "Bonjour ! Envie d'une histoire ? 📖" },
  de: { withName: (n) => `Hallo ${n}! Lust auf eine Geschichte? 📖`, withoutName: "Hallo! Lust auf eine Geschichte? 📖" },
  en: { withName: (n) => `Hi ${n}! Ready for a story? 📖`, withoutName: "Hi! Ready for a story? 📖" },
  es: { withName: (n) => `¡Hola ${n}! ¿Quieres un cuento? 📖`, withoutName: "¡Hola! ¿Quieres un cuento? 📖" },
  nl: { withName: (n) => `Hoi ${n}! Zin in een verhaal? 📖`, withoutName: "Hoi! Zin in een verhaal? 📖" },
  it: { withName: (n) => `Ciao ${n}! Voglia di una storia? 📖`, withoutName: "Ciao! Voglia di una storia? 📖" },
  bs: { withName: (n) => `Zdravo ${n}! Želiš li priču? 📖`, withoutName: "Zdravo! Želiš li priču? 📖" },
};

const UI_TEXTS: Record<string, { newStory: string; myStories: string; collection: string; stars: string; stories: string; quiz: string; stickers: string }> = {
  fr: { newStory: '📖 Nouvelle histoire', myStories: '📚 Mes histoires', collection: 'Ma collection 🏆', stars: 'Étoiles', stories: 'Histoires', quiz: 'Quiz', stickers: 'Voir tous les stickers →' },
  de: { newStory: '📖 Neue Geschichte starten', myStories: '📚 Meine Geschichten', collection: 'Meine Sammlung 🏆', stars: 'Sterne', stories: 'Geschichten', quiz: 'Quiz', stickers: 'Alle Sticker ansehen →' },
  en: { newStory: '📖 New story', myStories: '📚 My stories', collection: 'My collection 🏆', stars: 'Stars', stories: 'Stories', quiz: 'Quiz', stickers: 'See all stickers →' },
  es: { newStory: '📖 Nueva historia', myStories: '📚 Mis historias', collection: 'Mi colección 🏆', stars: 'Estrellas', stories: 'Historias', quiz: 'Quiz', stickers: 'Ver todos los stickers →' },
  nl: { newStory: '📖 Nieuw verhaal', myStories: '📚 Mijn verhalen', collection: 'Mijn verzameling 🏆', stars: 'Sterren', stories: 'Verhalen', quiz: 'Quiz', stickers: 'Alle stickers bekijken →' },
  it: { newStory: '📖 Nuova storia', myStories: '📚 Le mie storie', collection: 'La mia collezione 🏆', stars: 'Stelle', stories: 'Storie', quiz: 'Quiz', stickers: 'Vedi tutti gli sticker →' },
  bs: { newStory: '📖 Nova priča', myStories: '📚 Moje priče', collection: 'Moja kolekcija 🏆', stars: 'Zvjezdice', stories: 'Priče', quiz: 'Kviz', stickers: 'Pogledaj sve stikere →' },
};

const FABLINO_TIPS: Record<string, string[]> = {
  fr: [
    "Astuce : Plus tu lis, plus tu gagnes de stickers ! 🌟",
    "Le savais-tu ? Une histoire par jour fait de toi un pro ! 📚",
    "Astuce : Après chaque histoire, il y a un quiz ! Tu les réussis tous ? 💪",
  ],
  de: [
    "Tipp: Je mehr du liest, desto mehr Sticker sammelst du! 🌟",
    "Wusstest du? Jeden Tag eine Geschichte macht dich zum Leseprofi! 📚",
    "Tipp: Nach jeder Geschichte gibt es ein Quiz! Schaffst du alle? 💪",
  ],
  en: [
    "Tip: The more you read, the more stickers you collect! 🌟",
    "Did you know? A story every day makes you a reading pro! 📚",
    "Tip: After every story there's a quiz! Can you ace them all? 💪",
  ],
  es: [
    "Consejo: ¡Cuanto más leas, más stickers coleccionas! 🌟",
    "¿Sabías que? ¡Una historia al día te hace un experto lector! 📚",
    "Consejo: ¡Después de cada historia hay un quiz! ¿Los superas todos? 💪",
  ],
  nl: [
    "Tip: Hoe meer je leest, hoe meer stickers je verzamelt! 🌟",
    "Wist je dat? Elke dag een verhaal maakt je een leesexpert! 📚",
    "Tip: Na elk verhaal is er een quiz! Kun je ze allemaal halen? 💪",
  ],
  it: [
    "Suggerimento: Più leggi, più sticker collezioni! 🌟",
    "Lo sapevi? Una storia al giorno ti rende un esperto lettore! 📚",
    "Suggerimento: Dopo ogni storia c'è un quiz! Riesci a superarli tutti? 💪",
  ],
  bs: [
    "Savjet: Što više čitaš, više stikera skupiš! 🌟",
    "Jesi li znao/la? Priča svaki dan čini te profesionalcem! 📚",
    "Savjet: Nakon svake priče dolazi kviz! Možeš li sve riješiti? 💪",
  ],
};

// ═══ Main Component ═══
const HomeFablino = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    kidProfiles,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    hasMultipleProfiles,
    kidAppLanguage,
  } = useKidProfile();
  const { state: gamificationState } = useGamification();

  // Profile switcher dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  // Resolve language (fallback to 'de')
  const lang = kidAppLanguage || 'de';
  const greet = GREETINGS[lang] || GREETINGS['de'];
  const ui = UI_TEXTS[lang] || UI_TEXTS['de'];
  const tips = FABLINO_TIPS[lang] || FABLINO_TIPS['de'];

  // Random tip on each load (re-pick when language changes)
  const randomTip = useMemo(() => {
    return tips[Math.floor(Math.random() * tips.length)];
  }, [tips]);

  const kidName = selectedProfile?.name || "";
  const greeting = kidName ? greet.withName(kidName) : greet.withoutName;

  // Stats
  const stars = gamificationState?.stars ?? 0;
  const storiesCompleted = gamificationState?.storiesCompleted ?? 0;
  const quizzesPassed = gamificationState?.quizzesPassed ?? 0;

  return (
    <div 
      className="min-h-screen flex flex-col items-center font-nunito overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #FFF7ED 0%, #FEF3C7 50%, #EFF6FF 100%)",
      }}
    >
      <div className="w-full max-w-[480px] px-5 py-6 flex flex-col relative" style={{ minHeight: "100dvh" }}>

        {/* ═══ TOP BAR: Profile Switcher (left) + Admin Controls (right) ═══ */}
        <div className="flex items-center justify-between z-10 mb-1">
          {/* Profile Switcher (only if multiple kids) */}
          {hasMultipleProfiles ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(prev => !prev)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-[20px] bg-white border border-orange-100 transition-colors hover:bg-orange-50"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
              >
                <span className="font-nunito text-[14px] font-bold" style={{ color: "#92400E" }}>
                  {selectedProfile?.name || "Kind"} ▼
                </span>
              </button>

              {/* Dropdown */}
              {showProfileDropdown && (
                <div
                  className="absolute top-full left-0 mt-1 bg-white rounded-xl border border-orange-100 py-1 min-w-[160px] z-20"
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  {kidProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setSelectedProfileId(profile.id);
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-orange-50 transition-colors"
                    >
                      <span
                        className="font-nunito text-[14px] font-semibold flex-1"
                        style={{ color: profile.id === selectedProfileId ? "#FF8C42" : "#2D1810" }}
                      >
                        {profile.name}
                      </span>
                      {profile.id === selectedProfileId && (
                        <span className="text-[14px]" style={{ color: "#FF8C42" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div /> /* empty spacer */
          )}

          {/* Admin Controls */}
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate("/feedback-stats")}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-orange-100 hover:bg-orange-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-orange-400" />
              </button>
            )}
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm border border-orange-100 hover:bg-orange-50 transition-colors"
            >
              <Settings className="h-5 w-5 text-orange-400" />
            </button>
          </div>
        </div>

        {/* ═══ 1. FABLINO GREETING (Hero) — side by side ═══ */}
        <div className="flex items-center justify-center gap-4 pt-4 mb-3">
          {/* Mascot with gentle bounce */}
          <div 
            className="w-[130px] h-[130px] flex-shrink-0 flex items-center justify-center"
            style={{
              animation: "gentleBounce 2.2s ease-in-out infinite",
            }}
          >
            <img 
              src="/mascot/6_onboarding_vec.svg" 
              alt="Fablino Fuchs" 
              className="w-[130px] h-[130px] object-contain drop-shadow-lg"
            />
          </div>

          {/* Speech Bubble to the right */}
          <div className="flex-1 min-w-0">
            <SpeechBubble variant="hero">
              {greeting}
            </SpeechBubble>
          </div>
        </div>

        {/* ═══ 2. MAIN ACTIONS ═══ */}
        <div className="flex flex-col gap-3 mb-4">
          {/* Primary Button - New Story */}
          <button
            onClick={() => navigate("/create-story")}
            className="w-full py-4 px-6 rounded-2xl text-white font-extrabold text-[17px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #FF8C42, #FF6B00)",
              boxShadow: "0 4px 14px rgba(255,107,0,0.25)",
            }}
          >
            {ui.newStory}
          </button>

          {/* Secondary Button - My Stories */}
          <button
            onClick={() => navigate("/stories")}
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-[17px] border-2 transition-all duration-200 hover:bg-orange-50 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "white",
              borderColor: "#FF8C42",
              color: "#FF8C42",
            }}
          >
            {ui.myStories}
          </button>
        </div>

        {/* ═══ 3. GAMIFICATION CARD (dezent) ═══ */}
        <div className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-100">
          {/* Title */}
          <h3 className="font-extrabold text-[14px] mb-3" style={{ color: "#92400E" }}>
            {ui.collection}
          </h3>

          {/* Stats Row */}
          <div className="flex justify-between mb-4 text-[13px] font-semibold" style={{ color: "#2D1810" }}>
            <span>⭐ {stars} {ui.stars}</span>
            <span>📖 {storiesCompleted} {ui.stories}</span>
            <span>🎯 {quizzesPassed} {ui.quiz}</span>
          </div>

          {/* Sticker Preview */}
          <div className="flex justify-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-dashed flex items-center justify-center text-gray-400 text-[12px] font-bold"
                style={{ 
                  background: "#FFF7ED", 
                  borderColor: "#D1D5DB",
                }}
              >
                ?
              </div>
            ))}
          </div>

          {/* Link to all stickers */}
          <button 
            onClick={() => navigate("/sticker-buch")}
            className="w-full text-center font-bold text-[11px] hover:underline"
            style={{ color: "#FF8C42" }}
          >
            {ui.stickers}
          </button>
        </div>

        {/* ═══ 4. FABLINO TIP ═══ */}
        <div className="flex items-start gap-3 px-1 pb-3">
          {/* Small Fablino */}
          <img 
            src="/mascot/head_only.png" 
            alt="Fablino" 
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          {/* Tip bubble */}
          <div className="flex-1">
            <SpeechBubble variant="tip">
              {randomTip}
            </SpeechBubble>
          </div>
        </div>
      </div>

      {/* ═══ Custom Keyframes ═══ */}
      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        @keyframes speechBubbleIn {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-speech-bubble {
          animation: speechBubbleIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomeFablino;
