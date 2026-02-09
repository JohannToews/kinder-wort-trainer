import { useNavigate } from "react-router-dom";
import { useKidProfile } from "@/hooks/useKidProfile";
import { useGamification } from "@/hooks/useGamification";
import { useMemo } from "react";

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
          relative rounded-[18px] px-5 py-3 text-center
          ${isHero 
            ? "bg-white shadow-[0_3px_16px_rgba(0,0,0,0.08)] animate-speech-bubble" 
            : "bg-orange-50 border border-orange-100"
          }
        `}
        style={{
          animationDelay: isHero ? "0.1s" : "0s",
          animationFillMode: "both",
        }}
      >
        <span className={`font-nunito font-semibold ${isHero ? "text-[15px]" : "text-[13px]"}`} style={{ color: "#2D1810" }}>
          {children}
        </span>
      </div>
      {/* Triangle pointing down */}
      {isHero && (
        <div 
          className="absolute left-1/2 -translate-x-1/2 -bottom-2"
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "10px solid white",
          }}
        />
      )}
    </div>
  );
};

// ═══ Fablino Tips ═══
const FABLINO_TIPS = [
  "Tipp: Je mehr du liest, desto mehr Sticker sammelst du! 🌟",
  "Wusstest du? Jeden Tag eine Geschichte macht dich zum Leseprofi! 📚",
  "Tipp: Nach jeder Geschichte gibt es ein Quiz! Schaffst du alle? 💪",
];

// ═══ Main Component ═══
const HomeFablino = () => {
  const navigate = useNavigate();
  const { selectedProfile } = useKidProfile();
  const { state: gamificationState } = useGamification();

  // Random tip on each load
  const randomTip = useMemo(() => {
    return FABLINO_TIPS[Math.floor(Math.random() * FABLINO_TIPS.length)];
  }, []);

  const kidName = selectedProfile?.name || "";
  const greeting = kidName ? `Hallo ${kidName}! Lust auf eine Geschichte? 📖` : "Hallo! Lust auf eine Geschichte? 📖";

  // Stats
  const stars = gamificationState?.stars ?? 0;
  const storiesCompleted = gamificationState?.storiesCompleted ?? 0;
  const quizzesPassed = 0; // Placeholder, could be loaded from user_results

  return (
    <div 
      className="min-h-screen flex flex-col items-center font-nunito overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #FFF7ED 0%, #FEF3C7 50%, #EFF6FF 100%)",
      }}
    >
      <div className="w-full max-w-[480px] px-5 py-6 flex flex-col" style={{ minHeight: "100dvh" }}>
        
        {/* ═══ 1. FABLINO GREETING (Hero) ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pt-4 pb-2">
          {/* Speech Bubble */}
          <SpeechBubble variant="hero">
            {greeting}
          </SpeechBubble>

          {/* Mascot with gentle bounce */}
          <div 
            className="w-[150px] h-[150px] flex items-center justify-center"
            style={{
              animation: "gentleBounce 2.2s ease-in-out infinite",
            }}
          >
            <img 
              src="/mascot/5_new_story.png" 
              alt="Fablino Fuchs" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
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
            📖 Neue Geschichte starten
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
            📚 Meine Geschichten
          </button>
        </div>

        {/* ═══ 3. GAMIFICATION CARD ═══ */}
        <div 
          className="bg-white rounded-2xl p-5 mb-4"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        >
          {/* Title */}
          <h3 className="font-extrabold text-[16px] mb-4" style={{ color: "#92400E" }}>
            Meine Sammlung 🏆
          </h3>

          {/* Stats Row */}
          <div className="flex justify-between mb-5 text-[14px] font-semibold" style={{ color: "#2D1810" }}>
            <span>⭐ {stars} Sterne</span>
            <span>📖 {storiesCompleted} Geschichten</span>
            <span>🎯 {quizzesPassed} Quiz</span>
          </div>

          {/* Sticker Preview */}
          <div className="flex justify-center gap-3 mb-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center text-gray-400 text-[14px] font-bold"
                style={{ 
                  background: "#F3F4F6", 
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
            className="w-full text-center font-bold text-[13px] hover:underline"
            style={{ color: "#FF8C42" }}
          >
            Alle Sticker ansehen →
          </button>
        </div>

        {/* ═══ 4. FABLINO TIP ═══ */}
        <div className="flex items-start gap-3 px-1 pb-4">
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
