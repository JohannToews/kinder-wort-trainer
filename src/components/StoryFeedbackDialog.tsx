import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Language } from "@/lib/translations";

interface StoryFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  storyId: string;
  storyTitle: string;
  storyPrompt?: string;
  userId: string;
  kidProfileId?: string;
  kidName?: string;
  kidSchoolClass?: string;
  kidSchoolSystem?: string;
  language: Language;
}

const translations: Record<Language, {
  title: string;
  description: string;
  qualityLabel: string;
  weakestPartLabel: string;
  beginning: string;
  development: string;
  ending: string;
  reasonLabel: string;
  tooShort: string;
  tooShallow: string;
  tooRepetitive: string;
  skip: string;
  submit: string;
  thankYou: string;
}> = {
  de: {
    title: "Wie war die Geschichte?",
    description: "Dein Feedback hilft uns, bessere Geschichten zu erstellen!",
    qualityLabel: "Qualität der Geschichte",
    weakestPartLabel: "Welcher Teil war am schwächsten?",
    beginning: "Aufbau",
    development: "Entwicklung",
    ending: "Schluss",
    reasonLabel: "Grund",
    tooShort: "Zu kurz - mehr Inhalt gewünscht",
    tooShallow: "Zu flach - Beschreibungen oberflächlich",
    tooRepetitive: "Zu repetitiv",
    skip: "Überspringen",
    submit: "Absenden",
    thankYou: "Danke für dein Feedback!",
  },
  fr: {
    title: "Comment était l'histoire?",
    description: "Tes commentaires nous aident à créer de meilleures histoires!",
    qualityLabel: "Qualité de l'histoire",
    weakestPartLabel: "Quelle partie était la plus faible?",
    beginning: "Début",
    development: "Développement",
    ending: "Fin",
    reasonLabel: "Raison",
    tooShort: "Trop court - plus de contenu souhaité",
    tooShallow: "Trop superficiel - descriptions peu profondes",
    tooRepetitive: "Trop répétitif",
    skip: "Passer",
    submit: "Envoyer",
    thankYou: "Merci pour ton avis!",
  },
  en: {
    title: "How was the story?",
    description: "Your feedback helps us create better stories!",
    qualityLabel: "Story quality",
    weakestPartLabel: "Which part was weakest?",
    beginning: "Beginning",
    development: "Development",
    ending: "Ending",
    reasonLabel: "Reason",
    tooShort: "Too short - want more content",
    tooShallow: "Too shallow - descriptions superficial",
    tooRepetitive: "Too repetitive",
    skip: "Skip",
    submit: "Submit",
    thankYou: "Thanks for your feedback!",
  },
  es: {
    title: "¿Cómo fue la historia?",
    description: "¡Tus comentarios nos ayudan a crear mejores historias!",
    qualityLabel: "Calidad de la historia",
    weakestPartLabel: "¿Qué parte fue más débil?",
    beginning: "Inicio",
    development: "Desarrollo",
    ending: "Final",
    reasonLabel: "Razón",
    tooShort: "Demasiado corto - quiero más contenido",
    tooShallow: "Demasiado superficial",
    tooRepetitive: "Demasiado repetitivo",
    skip: "Saltar",
    submit: "Enviar",
    thankYou: "¡Gracias por tu opinión!",
  },
  nl: {
    title: "Hoe was het verhaal?",
    description: "Je feedback helpt ons betere verhalen te maken!",
    qualityLabel: "Kwaliteit van het verhaal",
    weakestPartLabel: "Welk deel was het zwakst?",
    beginning: "Begin",
    development: "Ontwikkeling",
    ending: "Einde",
    reasonLabel: "Reden",
    tooShort: "Te kort - meer inhoud gewenst",
    tooShallow: "Te oppervlakkig",
    tooRepetitive: "Te repetitief",
    skip: "Overslaan",
    submit: "Versturen",
    thankYou: "Bedankt voor je feedback!",
  },
  it: {
    title: "Com'era la storia?",
    description: "Il tuo feedback ci aiuta a creare storie migliori!",
    qualityLabel: "Qualità della storia",
    weakestPartLabel: "Quale parte era più debole?",
    beginning: "Inizio",
    development: "Sviluppo",
    ending: "Fine",
    reasonLabel: "Motivo",
    tooShort: "Troppo corto - più contenuto desiderato",
    tooShallow: "Troppo superficiale",
    tooRepetitive: "Troppo ripetitivo",
    skip: "Salta",
    submit: "Invia",
    thankYou: "Grazie per il tuo feedback!",
  },
};

const StoryFeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  storyId,
  storyTitle,
  storyPrompt,
  userId,
  kidProfileId,
  kidName,
  kidSchoolClass,
  kidSchoolSystem,
  language,
}: StoryFeedbackDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [weakestPart, setWeakestPart] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[language] || translations.fr;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error(language === 'de' ? 'Bitte wähle eine Bewertung' : 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("story_ratings").insert({
        user_id: userId,
        kid_profile_id: kidProfileId || null,
        story_id: storyId,
        story_title: storyTitle,
        story_prompt: storyPrompt || null,
        kid_name: kidName || null,
        kid_school_class: kidSchoolClass || null,
        kid_school_system: kidSchoolSystem || null,
        quality_rating: rating,
        weakest_part: weakestPart,
        weakness_reason: reason,
      });

      if (error) throw error;

      toast.success(t.thankYou);
      onSubmit();
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Error saving feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-baloo">{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.qualityLabel}</label>
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-sunshine text-sunshine"
                        : "text-muted-foreground/30"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Weakest Part */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.weakestPartLabel}</label>
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { value: "beginning", label: t.beginning },
                { value: "development", label: t.development },
                { value: "ending", label: t.ending },
              ].map((part) => (
                <Button
                  key={part.value}
                  type="button"
                  variant={weakestPart === part.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeakestPart(weakestPart === part.value ? null : part.value)}
                >
                  {part.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Reason */}
          {weakestPart && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.reasonLabel}</label>
              <div className="flex flex-col gap-2">
                {[
                  { value: "too_short", label: t.tooShort },
                  { value: "too_shallow", label: t.tooShallow },
                  { value: "too_repetitive", label: t.tooRepetitive },
                ].map((r) => (
                  <Button
                    key={r.value}
                    type="button"
                    variant={reason === r.value ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => setReason(reason === r.value ? null : r.value)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
            {t.skip}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            {t.submit}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryFeedbackDialog;
