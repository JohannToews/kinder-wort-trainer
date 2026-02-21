/**
 * FablinoPageHeader – Reusable mascot + speech bubble header for story creation pages.
 * Fablino appears on every page with a contextual message, guiding the child like a conversation.
 * Uses the shared FablinoMascot + SpeechBubble components for consistent sizing.
 *
 * On mobile (<640px) the mascot automatically shrinks to `sm` to prevent overflow.
 *
 * showBackButton: When true, renders BackButton inline-left in the same row,
 * saving ~50px of vertical space.
 */
import { useEffect, useState } from "react";
import FablinoMascot, { FablinoSize } from "./FablinoMascot";
import SpeechBubble from "./SpeechBubble";
import BackButton from "./BackButton";

interface FablinoPageHeaderProps {
  mascotImage: string;
  message: string;
  mascotSize?: FablinoSize;
  showBackButton?: boolean;
  onBack?: () => void;
  backTo?: string;
}

function useIsMobile(breakpoint = 480) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

const FablinoPageHeader = ({
  mascotImage,
  message,
  mascotSize = "md",
  showBackButton = false,
  onBack,
  backTo,
}: FablinoPageHeaderProps) => {
  const isMobile = useIsMobile();
  const effectiveSize: FablinoSize = isMobile && mascotSize !== "sm" ? "sm" : mascotSize;

  return (
    <div className="flex flex-row items-center gap-2 px-0 py-2 sm:py-3 justify-start w-full self-start">
      {showBackButton && (
        <BackButton onClick={onBack} to={backTo} className="flex-shrink-0" />
      )}
      <FablinoMascot src={mascotImage} size={effectiveSize} />
      <div className="flex-1 min-w-0">
        <SpeechBubble>{message}</SpeechBubble>
      </div>
    </div>
  );
};

export default FablinoPageHeader;
