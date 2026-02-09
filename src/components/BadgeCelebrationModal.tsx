import { useState, useEffect } from "react";
import FablinoMascot from "./FablinoMascot";

export interface EarnedBadge {
  name: string;
  emoji: string;
}

interface BadgeCelebrationModalProps {
  badges: EarnedBadge[];
  onDismiss: () => void;
  language?: string;
}

const t: Record<string, { newSticker: string; wellDone: string; next: string; done: string }> = {
  de: { newSticker: "Neuer Sticker!", wellDone: "Super gemacht! 🎉", next: "Nächster Sticker →", done: "Weiter" },
  fr: { newSticker: "Nouveau sticker !", wellDone: "Bravo ! 🎉", next: "Sticker suivant →", done: "Continuer" },
  en: { newSticker: "New Sticker!", wellDone: "Well done! 🎉", next: "Next Sticker →", done: "Continue" },
  es: { newSticker: "¡Nuevo sticker!", wellDone: "¡Bien hecho! 🎉", next: "Siguiente sticker →", done: "Continuar" },
  nl: { newSticker: "Nieuwe sticker!", wellDone: "Goed gedaan! 🎉", next: "Volgende sticker →", done: "Verder" },
  it: { newSticker: "Nuovo sticker!", wellDone: "Ben fatto! 🎉", next: "Prossimo sticker →", done: "Continua" },
  bs: { newSticker: "Novi stiker!", wellDone: "Odlično! 🎉", next: "Sljedeći stiker →", done: "Nastavi" },
};

const BadgeCelebrationModal = ({ badges, onDismiss, language = 'de' }: BadgeCelebrationModalProps) => {
  const [visible, setVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const tr = t[language] || t.de;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  if (badges.length === 0) return null;
  const badge = badges[currentIdx];

  const handleContinue = () => {
    if (currentIdx < badges.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setVisible(false);
      setTimeout(onDismiss, 250);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-6"
      style={{
        background: visible ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        transition: "background 0.3s ease",
      }}
      onClick={handleContinue}
    >
      {/* Falling stars animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["⭐", "🌟", "✨", "⭐", "🌟", "✨"].map((star, i) => (
          <span
            key={i}
            className="absolute text-[24px]"
            style={{
              left: `${12 + i * 15}%`,
              animation: `confettiFall ${2 + i * 0.3}s ease-in ${i * 0.15}s infinite`,
              opacity: 0,
            }}
          >
            {star}
          </span>
        ))}
      </div>

      {/* Modal card */}
      <div
        className="relative bg-white rounded-[24px] max-w-[320px] w-full p-6 text-center"
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
          transform: visible ? "scale(1)" : "scale(0.5)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge emoji */}
        <div
          className="mx-auto mb-3"
          style={{ fontSize: 80, lineHeight: 1, animation: "badgePop 0.6s ease-out 0.3s both" }}
        >
          {badge.emoji}
        </div>

        <h2 className="font-fredoka text-[22px] font-bold mb-1" style={{ color: "#2D1810" }}>
          {tr.newSticker}
        </h2>

        <p className="font-nunito text-[18px] font-bold mb-2" style={{ color: "#F97316" }}>
          {badge.name}
        </p>

        {/* Fablino mini */}
        <div className="flex items-end justify-center gap-2 mt-3 mb-4">
          <FablinoMascot src="/mascot/6_Onboarding.png" size="sm" className="!max-h-[50px]" />
          <div className="bg-orange-50 rounded-xl px-3 py-2 relative" style={{ border: "1px solid #FDBA74" }}>
            <p className="text-[13px] font-semibold" style={{ color: "#92400E" }}>
              {tr.wellDone}
            </p>
            <div
              className="absolute -bottom-1.5 left-4"
              style={{
                width: 0, height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "7px solid #FFF7ED",
              }}
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          className="w-full py-3 rounded-xl font-bold text-white text-[16px] active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg, #FF8C42, #FF6B00)" }}
        >
          {currentIdx < badges.length - 1 ? tr.next : tr.done}
        </button>

        {badges.length > 1 && (
          <p className="text-[11px] font-medium mt-2" style={{ color: "#aaa" }}>
            {currentIdx + 1} / {badges.length}
          </p>
        )}
      </div>
    </div>
  );
};

export default BadgeCelebrationModal;
