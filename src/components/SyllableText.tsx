import { useMemo } from "react";
import { hyphenateSync } from "hyphen/de";

// Colors for syllables (matching the screenshot - blue and reddish-brown)
const SYLLABLE_COLORS = ["#2563eb", "#92400e"]; // blue-600, amber-800

// Soft hyphen character used by hyphen library
const SOFT_HYPHEN = "\u00AD";

interface SyllableTextProps {
  text: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  dataPosition?: string;
}

/**
 * Splits a word into syllables and renders them with alternating colors
 */
export const SyllableText = ({ text, className = "", onClick, dataPosition }: SyllableTextProps) => {
  const syllabifiedContent = useMemo(() => {
    // Don't syllabify if it's just whitespace or punctuation
    if (/^\s+$/.test(text) || /^[.,!?;:'"«»\-–—]+$/.test(text)) {
      return <span>{text}</span>;
    }

    // Extract leading/trailing punctuation
    const leadingPunct = text.match(/^[.,!?;:'"«»\-–—\s]+/)?.[0] || "";
    const trailingPunct = text.match(/[.,!?;:'"«»\-–—\s]+$/)?.[0] || "";
    const cleanWord = text.slice(leadingPunct.length, text.length - (trailingPunct.length || undefined));

    if (!cleanWord) {
      return <span>{text}</span>;
    }

    // Hyphenate the word
    const hyphenatedWord = hyphenateSync(cleanWord);
    
    // Split by soft hyphen to get syllables
    const syllables = hyphenatedWord.split(SOFT_HYPHEN);

    if (syllables.length <= 1) {
      // Single syllable - just show with first color
      return (
        <span>
          {leadingPunct}
          <span style={{ color: SYLLABLE_COLORS[0] }}>{cleanWord}</span>
          {trailingPunct}
        </span>
      );
    }

    // Multiple syllables - alternate colors
    return (
      <span>
        {leadingPunct}
        {syllables.map((syllable, index) => (
          <span 
            key={index} 
            style={{ color: SYLLABLE_COLORS[index % SYLLABLE_COLORS.length] }}
          >
            {syllable}
          </span>
        ))}
        {trailingPunct}
      </span>
    );
  }, [text]);

  if (onClick) {
    return (
      <span 
        className={className} 
        onClick={onClick}
        data-position={dataPosition}
        data-word-clickable="true"
      >
        {syllabifiedContent}
      </span>
    );
  }

  return (
    <span className={className} data-position={dataPosition}>
      {syllabifiedContent}
    </span>
  );
};

/**
 * Utility function to check if syllable mode should be available
 * (only for German text)
 */
export const isSyllableModeSupported = (language: string): boolean => {
  return language.toLowerCase() === "de";
};

export default SyllableText;
