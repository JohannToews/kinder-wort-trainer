import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getImmersiveLabels, t as tpl } from './labels';
import { FABLINO_TEAL } from './constants';

interface Question {
  id: string;
  question: string;
  expected_answer: string;
  options: string[] | null;
  order_index: number;
}

interface ImmersiveQuizFlowProps {
  storyId: string;
  storyLanguage: string;
  isMandatory: boolean;
  passThreshold: number;
  onComplete: (correctCount: number, totalCount: number) => void;
  onRetry: () => void;
}

// Quiz labels per language (reused from ComprehensionQuiz)
const quizLabels: Record<string, { bravo: string; notQuite: string; correct: string; wrong: string }> = {
  de: { bravo: 'Richtig!', notQuite: 'Leider falsch', correct: 'Richtig', wrong: 'Falsch' },
  fr: { bravo: 'Bravo !', notQuite: 'Pas tout à fait', correct: 'Correct', wrong: 'Incorrect' },
  en: { bravo: 'Correct!', notQuite: 'Not quite', correct: 'Correct', wrong: 'Wrong' },
  es: { bravo: '¡Correcto!', notQuite: 'No del todo', correct: 'Correcto', wrong: 'Incorrecto' },
  nl: { bravo: 'Goed!', notQuite: 'Niet helemaal', correct: 'Goed', wrong: 'Fout' },
  it: { bravo: 'Corretto!', notQuite: 'Non proprio', correct: 'Corretto', wrong: 'Sbagliato' },
  bs: { bravo: 'Tačno!', notQuite: 'Ne baš', correct: 'Tačno', wrong: 'Netačno' },
};

const AUTO_ADVANCE_MS = 1500;

/**
 * Renders quiz questions as individual reader-style pages within the Immersive Reader.
 *
 * Each question is a full "page":
 * - Question text at top
 * - Answer options as large buttons
 * - Visual feedback (green/red + shake) on tap
 * - Auto-advance after 1.5s
 *
 * For chapter stories: quiz is mandatory. If failed → retry callback.
 * For single stories: quiz is optional.
 */
const ImmersiveQuizFlow: React.FC<ImmersiveQuizFlowProps> = ({
  storyId,
  storyLanguage,
  isMandatory,
  passThreshold,
  onComplete,
  onRetry,
}) => {
  const labels = getImmersiveLabels(storyLanguage);
  const ql = quizLabels[storyLanguage] || quizLabels.en;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<{ correct: boolean }[]>([]);
  const [quizDone, setQuizDone] = useState(false);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      const { data } = await supabase
        .from('comprehension_questions')
        .select('*')
        .eq('story_id', storyId)
        .order('order_index');

      if (data && data.length > 0) {
        setQuestions(data as Question[]);
      }
      setIsLoading(false);
    };
    loadQuestions();
  }, [storyId]);

  // Shuffle options per question
  const currentQuestion = questions[currentIndex] || null;
  const shuffledOptions = useMemo(() => {
    if (!currentQuestion?.options) return [];
    const opts = [...currentQuestion.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentIndex, currentQuestion?.id]);

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: string) => {
    if (showFeedback || !currentQuestion) return;

    const isCorrect = answer === currentQuestion.expected_answer;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setResults(prev => [...prev, { correct: isCorrect }]);

    // Auto-advance after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Quiz complete
        const correctCount = [...results, { correct: isCorrect }].filter(r => r.correct).length;
        setQuizDone(true);

        const scorePercent = questions.length > 0
          ? (correctCount / questions.length) * 100
          : 0;
        const passed = scorePercent >= passThreshold;

        if (isMandatory && !passed) {
          // Don't call onComplete yet — show retry prompt
        } else {
          onComplete(correctCount, questions.length);
        }
      }
    }, AUTO_ADVANCE_MS);
  }, [showFeedback, currentQuestion, currentIndex, questions, results, passThreshold, isMandatory, onComplete]);

  // ── Loading ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: FABLINO_TEAL }} />
        <p className="text-muted-foreground text-sm">Loading quiz...</p>
      </div>
    );
  }

  // ── No questions ────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        No quiz questions available.
      </div>
    );
  }

  // ── Quiz failed (mandatory) — retry prompt ─────────────
  if (quizDone && isMandatory) {
    const correctCount = results.filter(r => r.correct).length;
    const scorePercent = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    const passed = scorePercent >= passThreshold;

    if (!passed) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-6">
          <div className="text-5xl">📖</div>
          <h2 className="text-xl font-bold">
            {tpl(labels.quizCorrect, { correct: correctCount, total: questions.length })}
          </h2>
          <p className="text-muted-foreground max-w-sm">
            {labels.quizNotPassed}
          </p>
          <Button
            onClick={onRetry}
            size="lg"
            className="mt-4"
            style={{ backgroundColor: FABLINO_TEAL }}
          >
            {labels.readAgain}
          </Button>
        </div>
      );
    }
  }

  // ── Question page ───────────────────────────────────────
  if (!currentQuestion) return null;

  const isCorrect = selectedAnswer === currentQuestion.expected_answer;

  return (
    <div className="flex flex-col min-h-[70vh] px-5 sm:px-8 py-8">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {questions.map((_, idx) => {
          const result = results[idx];
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={idx}
              className="h-3 w-3 rounded-full transition-all duration-300"
              style={{
                backgroundColor: result
                  ? result.correct ? '#16A34A' : '#EF4444'
                  : isCurrent ? FABLINO_TEAL : '#E5E7EB',
                transform: isCurrent ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          );
        })}
      </div>

      {/* Question */}
      <h2
        className="text-xl sm:text-2xl font-bold text-center mb-10 max-w-lg mx-auto leading-relaxed"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {currentQuestion.question}
      </h2>

      {/* Answer options */}
      <div className="flex flex-col gap-3 max-w-lg mx-auto w-full">
        {shuffledOptions.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === currentQuestion.expected_answer;

          let bgColor = 'transparent';
          let borderColor = 'hsl(var(--border))';
          let textColor = 'inherit';
          let shake = false;

          if (showFeedback) {
            if (isCorrectOption) {
              bgColor = '#DCFCE7';
              borderColor = '#16A34A';
              textColor = '#166534';
            } else if (isSelected && !isCorrectOption) {
              bgColor = '#FEE2E2';
              borderColor = '#EF4444';
              textColor = '#991B1B';
              shake = true;
            } else {
              bgColor = 'transparent';
              borderColor = '#E5E7EB';
              textColor = '#9CA3AF';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(option)}
              disabled={showFeedback}
              className={`w-full text-left py-4 px-5 rounded-xl border-2 transition-all duration-200 text-base font-medium ${
                shake ? 'animate-shake' : ''
              } ${!showFeedback ? 'hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]' : ''}`}
              style={{
                backgroundColor: bgColor,
                borderColor,
                color: textColor,
              }}
            >
              <span className="flex items-center gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-bold"
                  style={{ borderColor: showFeedback && isCorrectOption ? '#16A34A' : borderColor }}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {showFeedback && isCorrectOption && (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: '#16A34A' }} />
                )}
                {showFeedback && isSelected && !isCorrectOption && (
                  <XCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#EF4444' }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback text */}
      {showFeedback && (
        <p className={`text-center mt-6 text-lg font-semibold animate-in fade-in duration-300 ${
          isCorrect ? 'text-green-600' : 'text-red-500'
        }`}>
          {isCorrect ? ql.bravo : ql.notQuite}
        </p>
      )}
    </div>
  );
};

export default ImmersiveQuizFlow;
