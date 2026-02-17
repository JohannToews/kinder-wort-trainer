import React, { useMemo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import FablinoMascot from '@/components/FablinoMascot';
import { getImmersiveLabels, t as tpl } from './labels';
import { FABLINO_TEAL } from './constants';

interface LogActivityResult {
  total_stars?: number;
  stars_earned?: number;
  bonus_stars?: number;
  weekly_bonus?: number;
  current_streak?: number;
  weekly_stories_count?: number;
  new_badges?: Array<{ key: string; label: string; icon: string }>;
}

interface ImmersiveEndScreenProps {
  variant: 'single' | 'chapter' | 'series-complete';
  storyLanguage: string;

  // Gamification data from log_activity response
  activityResult?: LogActivityResult | null;
  quizResult?: { correctCount: number; totalCount: number; starsEarned: number } | null;

  // Chapter story info
  chapterNumber?: number;
  totalChapters?: number;

  // Callbacks
  onStartQuiz?: () => void;
  onNewStory?: () => void;
  onReadAgain?: () => void;
  onNextChapter?: () => void;
  onMyStories?: () => void;
  onNewChapterStory?: () => void;

  // State
  hasQuiz?: boolean;
  quizTaken?: boolean;
  isLoadingNextChapter?: boolean;
}

/**
 * End screen shown after the last page of a story (or after quiz).
 *
 * Three variants:
 * A) Single story: Stars, streak, quiz button, new story, read again
 * B) Chapter (episode 1 to N-1): Stars, streak, next chapter button
 * C) Series complete (last episode): Full series summary, badges, my stories
 */
const ImmersiveEndScreen: React.FC<ImmersiveEndScreenProps> = ({
  variant,
  storyLanguage,
  activityResult,
  quizResult,
  chapterNumber,
  totalChapters,
  onStartQuiz,
  onNewStory,
  onReadAgain,
  onNextChapter,
  onMyStories,
  onNewChapterStory,
  hasQuiz = false,
  quizTaken = false,
  isLoadingNextChapter = false,
}) => {
  const labels = getImmersiveLabels(storyLanguage);
  const [showStars, setShowStars] = useState(false);

  // Animate stars in after mount
  useEffect(() => {
    const timer = setTimeout(() => setShowStars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const starsEarned = activityResult?.stars_earned ?? quizResult?.starsEarned ?? 0;
  const totalStars = activityResult?.total_stars ?? 0;
  const currentStreak = activityResult?.current_streak ?? 0;
  const weeklyBonus = activityResult?.weekly_bonus ?? 0;
  const weeklyStoriesCount = activityResult?.weekly_stories_count ?? 0;

  // Mascot image based on context
  const mascotSrc = useMemo(() => {
    if (variant === 'series-complete') return '/mascot/1_happy_success.png';
    if (starsEarned >= 2) return '/mascot/1_happy_success.png';
    return '/mascot/1_happy_success.png';
  }, [variant, starsEarned]);

  // Title text
  const title = useMemo(() => {
    if (variant === 'series-complete') return labels.seriesComplete;
    if (variant === 'chapter') {
      return tpl(labels.chapterComplete, { number: chapterNumber || 1 });
    }
    return labels.wellDone;
  }, [variant, labels, chapterNumber]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-6 py-8 text-center">
      {/* Mascot */}
      <FablinoMascot
        src={mascotSrc}
        size="md"
        bounce={true}
        className="mb-4"
      />

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        {title}
      </h1>

      {/* Stars animation */}
      <div className={`transition-all duration-700 ease-out ${
        showStars ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-4 scale-75'
      }`}>
        {starsEarned > 0 && (
          <p className="text-2xl font-bold mb-1" style={{ color: '#F59E0B' }}>
            {tpl(labels.starsEarned, { count: starsEarned })}
          </p>
        )}
      </div>

      {/* Quiz result summary (if quiz was taken) */}
      {quizResult && (
        <p className="text-sm text-muted-foreground mb-2">
          {tpl(labels.quizCorrect, {
            correct: quizResult.correctCount,
            total: quizResult.totalCount,
          })}
        </p>
      )}

      {/* Streak */}
      {currentStreak > 1 && (
        <p className="text-lg font-semibold mb-1">
          {tpl(labels.streakDay, { count: currentStreak })}
        </p>
      )}

      {/* Weekly bonus */}
      {weeklyBonus > 0 && (
        <p className="text-sm text-muted-foreground mb-1">
          {tpl(labels.weeklyBonus, { count: weeklyBonus, stories: weeklyStoriesCount })}
        </p>
      )}

      {/* Total stars */}
      {totalStars > 0 && (
        <p className="text-sm text-muted-foreground mb-6">
          {tpl(labels.totalStars, { count: totalStars })}
        </p>
      )}

      {/* ── Action Buttons ─────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">

        {/* A) Single Story */}
        {variant === 'single' && (
          <>
            {/* Quiz button (prominent, if quiz not yet taken) */}
            {hasQuiz && !quizTaken && onStartQuiz && (
              <Button
                onClick={onStartQuiz}
                size="lg"
                className="w-full text-base font-bold py-5"
                style={{ backgroundColor: FABLINO_TEAL }}
              >
                {labels.startQuiz}
              </Button>
            )}

            {/* New Story */}
            {onNewStory && (
              <Button
                onClick={onNewStory}
                variant={hasQuiz && !quizTaken ? 'outline' : 'default'}
                size="lg"
                className="w-full text-base font-medium py-5"
                style={!hasQuiz || quizTaken ? { backgroundColor: FABLINO_TEAL } : {}}
              >
                {labels.newStory}
              </Button>
            )}

            {/* Read Again */}
            {onReadAgain && (
              <Button
                onClick={onReadAgain}
                variant="outline"
                size="lg"
                className="w-full text-base font-medium py-5"
              >
                {labels.readAgain}
              </Button>
            )}
          </>
        )}

        {/* B) Chapter (not last) */}
        {variant === 'chapter' && (
          <>
            {/* Next Chapter (primary) */}
            {onNextChapter && (
              <Button
                onClick={onNextChapter}
                disabled={isLoadingNextChapter}
                size="lg"
                className="w-full text-base font-bold py-5"
                style={{ backgroundColor: FABLINO_TEAL }}
              >
                {isLoadingNextChapter ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Loading...
                  </span>
                ) : (
                  labels.startNextChapter
                )}
              </Button>
            )}

            {/* Read Again */}
            {onReadAgain && (
              <Button
                onClick={onReadAgain}
                variant="outline"
                size="lg"
                className="w-full text-base font-medium py-5"
              >
                {labels.readAgain}
              </Button>
            )}
          </>
        )}

        {/* C) Series Complete */}
        {variant === 'series-complete' && (
          <>
            {/* My Stories (primary) */}
            {onMyStories && (
              <Button
                onClick={onMyStories}
                size="lg"
                className="w-full text-base font-bold py-5"
                style={{ backgroundColor: FABLINO_TEAL }}
              >
                {labels.myStories}
              </Button>
            )}

            {/* New chapter story (secondary) */}
            {onNewChapterStory && (
              <Button
                onClick={onNewChapterStory}
                variant="outline"
                size="lg"
                className="w-full text-base font-medium py-5"
              >
                {labels.startNewChapterStory}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImmersiveEndScreen;
