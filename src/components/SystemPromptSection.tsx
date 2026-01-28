import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2, FileText, RefreshCw } from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

interface SystemPromptSectionProps {
  language: Language;
}

const SystemPromptSection = ({ language }: SystemPromptSectionProps) => {
  const t = useTranslations(language);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSystemPrompt();
  }, [language]);

  const loadSystemPrompt = async () => {
    setIsLoading(true);
    const promptKey = `system_prompt_${language}`;
    
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", promptKey)
      .maybeSingle();

    if (data && !error) {
      setSystemPrompt(data.value);
    } else {
      // Fallback to German if no prompt found
      const { data: fallbackData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "system_prompt_de")
        .maybeSingle();
      
      if (fallbackData) {
        setSystemPrompt(fallbackData.value);
      }
    }
    setIsLoading(false);
  };

  const saveSystemPrompt = async () => {
    setIsSaving(true);
    const promptKey = `system_prompt_${language}`;
    
    try {
      const { error } = await supabase.functions.invoke("manage-users", {
        body: {
          action: "updateSystemPrompt",
          promptKey,
          promptValue: systemPrompt,
        },
      });

      if (error) {
        console.error("Error saving system prompt:", error);
        toast.error(language === 'de' ? "Fehler beim Speichern" : 
                    language === 'fr' ? "Erreur lors de la sauvegarde" :
                    "Error saving");
      } else {
        toast.success(language === 'de' ? "System-Prompt gespeichert" : 
                      language === 'fr' ? "Prompt système sauvegardé" :
                      "System prompt saved");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error(language === 'de' ? "Fehler beim Speichern" : 
                  language === 'fr' ? "Erreur lors de la sauvegarde" :
                  "Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const getLanguageLabel = () => {
    const labels: Record<string, string> = {
      de: "Deutsch",
      en: "English",
      fr: "Français",
      es: "Español",
      nl: "Nederlands",
    };
    return labels[language] || language;
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            {language === 'de' ? 'System-Prompt' : 
             language === 'fr' ? 'Prompt Système' : 
             'System Prompt'}
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            ({getLanguageLabel()})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {language === 'de' 
            ? 'Dieser globale System-Prompt wird bei der Generierung aller Lesetexte verwendet. Er definiert die pädagogischen Richtlinien für verschiedene Schulklassen und Schwierigkeitsgrade.'
            : language === 'fr'
            ? 'Ce prompt système global est utilisé lors de la génération de tous les textes de lecture. Il définit les directives pédagogiques pour les différentes classes et niveaux de difficulté.'
            : 'This global system prompt is used when generating all reading texts. It defines the pedagogical guidelines for different school levels and difficulties.'}
        </p>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t.loading}</span>
          </div>
        ) : (
          <>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[400px] text-sm font-mono leading-relaxed"
              placeholder={language === 'de' ? "System-Prompt hier eingeben..." : 
                          language === 'fr' ? "Entrez le prompt système ici..." :
                          "Enter system prompt here..."}
            />

            <div className="flex items-center gap-3">
              <Button
                onClick={saveSystemPrompt}
                disabled={isSaving}
                className="btn-primary-kid"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === 'de' ? 'Speichern...' : 
                     language === 'fr' ? 'Sauvegarde...' : 
                     'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {language === 'de' ? 'Speichern' : 
                     language === 'fr' ? 'Sauvegarder' : 
                     'Save'}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={loadSystemPrompt}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === 'de' ? 'Neu laden' : 
                 language === 'fr' ? 'Recharger' : 
                 'Reload'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground italic">
              {language === 'de' 
                ? 'Hinweis: Änderungen am System-Prompt wirken sich auf alle zukünftig generierten Texte aus.'
                : language === 'fr'
                ? 'Note: Les modifications du prompt système affectent tous les textes générés à l\'avenir.'
                : 'Note: Changes to the system prompt affect all future generated texts.'}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemPromptSection;
