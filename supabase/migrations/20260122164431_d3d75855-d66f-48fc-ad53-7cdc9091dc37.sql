-- Add difficulty column to marked_words to track mastery level
ALTER TABLE public.marked_words 
ADD COLUMN difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('normal', 'easy'));