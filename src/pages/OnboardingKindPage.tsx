import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowRight } from "lucide-react";

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const LANGUAGES = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "nl", flag: "🇳🇱", label: "Nederlands" },
  { code: "it", flag: "🇮🇹", label: "Italiano" },
];

const OnboardingKindPage = () => {
  const [name, setName] = useState("");
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [readingLang, setReadingLang] = useState<string | null>(null);
  const [homeLangs, setHomeLangs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Guard: not logged in → /welcome
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/welcome", { replace: true });
    }
  }, [authLoading, isAuthenticated]);

  // Guard: already has kid profiles → /
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: kids } = await supabase
        .from("kid_profiles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      if (kids && kids.length > 0) {
        navigate("/", { replace: true });
      }
    })();
  }, [user]);

  const toggleHomeLang = (code: string) => {
    setHomeLangs((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Fehler", description: "Bitte einen Namen eingeben.", variant: "destructive" });
      return;
    }
    if (!selectedAge) {
      toast({ title: "Fehler", description: "Bitte ein Alter auswählen.", variant: "destructive" });
      return;
    }
    if (!readingLang) {
      toast({ title: "Fehler", description: "Bitte eine Lesesprache auswählen.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setIsLoading(true);
    try {
      // Map reading language to school_system (legacy field still used in app)
      const schoolSystem = readingLang;

      const { data: savedProfile, error } = await supabase
        .from("kid_profiles")
        .insert({
          user_id: user.id,
          name: name.trim().slice(0, 30),
          age: selectedAge,
          reading_language: readingLang,
          home_languages: homeLangs.length > 0 ? homeLangs : [readingLang],
          ui_language: readingLang,
          school_system: schoolSystem,
          school_class: getSchoolClass(selectedAge),
          difficulty_level: getDifficultyLevel(selectedAge),
          content_safety_level: 2,
          color_palette: "warm",
          hobbies: "",
          story_languages: [readingLang],
          explanation_language: homeLangs[0] || "de",
        })
        .select()
        .single();

      if (error) {
        console.error("Kid profile save error:", error);
        toast({ title: "Fehler", description: "Profil konnte nicht gespeichert werden.", variant: "destructive" });
        return;
      }

      // Navigate to story generation with profile id
      navigate(`/onboarding/story?kid=${savedProfile.id}`, { replace: true });
    } catch (err) {
      console.error(err);
      toast({ title: "Fehler", description: "Ein Fehler ist aufgetreten.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFECD2 100%)" }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#E8863A" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 overflow-y-auto" style={{ background: "linear-gradient(180deg, #FFF8F0 0%, #FFECD2 100%)" }}>
      {/* Progress */}
      <div className="w-full max-w-md mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 h-2 rounded-full" style={{ background: "#E8863A" }} />
          <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(232,134,58,0.2)" }} />
        </div>
        <p className="text-xs text-center" style={{ color: "rgba(45,24,16,0.5)" }}>Schritt 1 von 2</p>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/mascot/6_Onboarding.png"
          alt="Fablino"
          className="h-20 w-auto drop-shadow-md"
          style={{ animation: "gentleBounce 2.5s ease-in-out infinite" }}
        />
        <h1 className="text-2xl font-bold mt-3" style={{ color: "#E8863A" }}>
          Wer liest mit Fablino? 🦊
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(45,24,16,0.6)" }}>
          Erstelle ein Profil für dein Kind
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg px-6 py-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* A: Name */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Name des Kindes</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              placeholder="Vorname..."
              className="h-12 rounded-xl border-2 text-base"
              style={{ borderColor: "rgba(232,134,58,0.3)" }}
              autoComplete="off"
            />
          </div>

          {/* B: Alter */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Alter</Label>
            <div className="flex flex-wrap gap-2">
              {AGES.map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedAge(age)}
                  className="w-12 h-12 rounded-xl text-sm font-bold transition-all border-2"
                  style={{
                    background: selectedAge === age ? "#E8863A" : "transparent",
                    color: selectedAge === age ? "white" : "rgba(45,24,16,0.7)",
                    borderColor: selectedAge === age ? "#E8863A" : "rgba(232,134,58,0.25)",
                  }}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* C: Lesesprache */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Lesesprache 📚</Label>
            <p className="text-xs" style={{ color: "rgba(45,24,16,0.5)" }}>In welcher Sprache liest das Kind?</p>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setReadingLang(lang.code)}
                  className="flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all"
                  style={{
                    background: readingLang === lang.code ? "#E8863A" : "transparent",
                    color: readingLang === lang.code ? "white" : "rgba(45,24,16,0.75)",
                    borderColor: readingLang === lang.code ? "#E8863A" : "rgba(232,134,58,0.25)",
                  }}
                >
                  <span className="text-2xl mb-0.5">{lang.flag}</span>
                  <span className="text-xs font-medium leading-tight">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* D: Sprache zu Hause */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Sprache zu Hause</Label>
            <p className="text-xs" style={{ color: "rgba(45,24,16,0.5)" }}>In welcher Sprache sprecht ihr zu Hause? (optional)</p>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleHomeLang(lang.code)}
                  className="flex flex-col items-center py-2.5 px-1 rounded-xl border-2 transition-all"
                  style={{
                    background: homeLangs.includes(lang.code) ? "rgba(232,134,58,0.15)" : "transparent",
                    color: "rgba(45,24,16,0.75)",
                    borderColor: homeLangs.includes(lang.code) ? "#E8863A" : "rgba(232,134,58,0.2)",
                  }}
                >
                  <span className="text-2xl mb-0.5">{lang.flag}</span>
                  <span className="text-xs font-medium leading-tight">{lang.label}</span>
                </button>
              ))}
            </div>
            {homeLangs.length > 0 && (
              <button
                type="button"
                onClick={() => setHomeLangs([])}
                className="text-xs underline mt-1"
                style={{ color: "rgba(45,24,16,0.4)" }}
              >
                Auswahl löschen
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full font-semibold rounded-2xl text-white shadow-md"
            style={{ backgroundColor: "#E8863A", height: "52px", fontSize: "1rem" }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Weiter <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      <style>{`
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

// Helpers
function getSchoolClass(age: number): string {
  if (age <= 5) return "1";
  if (age <= 6) return "1";
  if (age <= 7) return "2";
  if (age <= 8) return "3";
  if (age <= 9) return "4";
  if (age <= 10) return "5";
  if (age <= 11) return "6";
  if (age <= 12) return "7";
  if (age <= 13) return "8";
  return "9";
}

function getDifficultyLevel(age: number): number {
  if (age <= 6) return 1;
  if (age <= 8) return 2;
  if (age <= 10) return 3;
  if (age <= 12) return 4;
  return 5;
}

export default OnboardingKindPage;
