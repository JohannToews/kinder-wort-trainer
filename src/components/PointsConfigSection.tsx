import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star, Save, Loader2, Info } from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

interface PointSetting {
  setting_key: string;
  value: string;
  description: string | null;
}

interface PointsConfigSectionProps {
  language: Language;
}

// Labels for each setting key (German + French + English)
const settingLabels: Record<string, Record<string, string>> = {
  stars_story_read:    { de: "Story gelesen", fr: "Histoire lue", en: "Story read" },
  stars_quiz_perfect:  { de: "Quiz perfekt (100%)", fr: "Quiz parfait (100%)", en: "Quiz perfect (100%)" },
  stars_quiz_passed:   { de: "Quiz bestanden (≥Schwelle)", fr: "Quiz réussi (≥seuil)", en: "Quiz passed (≥threshold)" },
  stars_quiz_failed:   { de: "Quiz nicht bestanden", fr: "Quiz échoué", en: "Quiz failed" },
  quiz_pass_threshold: { de: "Bestanden-Schwelle", fr: "Seuil de réussite", en: "Pass threshold" },
  weekly_bonus_3:      { de: "3 Stories/Woche", fr: "3 histoires/semaine", en: "3 stories/week" },
  weekly_bonus_5:      { de: "5 Stories/Woche", fr: "5 histoires/semaine", en: "5 stories/week" },
  weekly_bonus_7:      { de: "7 Stories/Woche", fr: "7 histoires/semaine", en: "7 stories/week" },
};

// Group settings into sections
const baseStarKeys = ["stars_story_read", "stars_quiz_perfect", "stars_quiz_passed", "stars_quiz_failed", "quiz_pass_threshold"];
const weeklyBonusKeys = ["weekly_bonus_3", "weekly_bonus_5", "weekly_bonus_7"];

const sectionTitles: Record<string, Record<string, string>> = {
  base:   { de: "⭐ Basis-Sterne", fr: "⭐ Étoiles de base", en: "⭐ Base Stars" },
  weekly: { de: "🎁 Wochen-Boni", fr: "🎁 Bonus hebdomadaire", en: "🎁 Weekly Bonuses" },
};

const weeklyNote: Record<string, string> = {
  de: "Nur der höchste Bonus wird vergeben (nicht kumulativ).",
  fr: "Seul le bonus le plus élevé est attribué (non cumulatif).",
  en: "Only the highest bonus is awarded (not cumulative).",
};

const PointsConfigSection = ({ language }: PointsConfigSectionProps) => {
  const t = useTranslations(language);
  const lang = language || "de";
  const [settings, setSettings] = useState<PointSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("point_settings" as any)
      .select("*")
      .order("setting_key");

    if (data) {
      setSettings(data as unknown as PointSetting[]);
    }
    if (error) {
      console.error("[PointsConfig] Error loading:", error);
    }
    setIsLoading(false);
  };

  const updateValue = (key: string, newValue: string) => {
    setSettings(prev =>
      prev.map(s => s.setting_key === key ? { ...s, value: String(Math.max(0, parseInt(newValue) || 0)) } : s)
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);

    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from("point_settings" as any)
          .update({ value: setting.value } as any)
          .eq("setting_key" as any, setting.setting_key);

        if (error) {
          console.error("Error saving setting:", error);
          toast.error(t.errorSaving);
          setIsSaving(false);
          return;
        }
      }

      toast.success(t.pointsConfigSaved);
    } catch (err) {
      console.error("Error:", err);
      toast.error(t.errorSaving);
    }

    setIsSaving(false);
  };

  const getLabel = (key: string): string => {
    return settingLabels[key]?.[lang] || settingLabels[key]?.de || key;
  };

  const getSuffix = (key: string): string => {
    if (key === "quiz_pass_threshold") return "%";
    return "";
  };

  if (isLoading) {
    return (
      <Card className="border-2 border-sunshine/50 mt-8">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const renderSettingRow = (setting: PointSetting) => (
    <div key={setting.setting_key} className="flex items-center gap-3">
      <Label className="text-sm font-medium text-[#2D1810] flex-1 min-w-0">
        {getLabel(setting.setting_key)}
      </Label>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          value={setting.value}
          onChange={(e) => updateValue(setting.setting_key, e.target.value)}
          className="w-20 text-center font-bold text-lg h-10 rounded-xl"
        />
        {getSuffix(setting.setting_key) && (
          <span className="text-sm text-muted-foreground font-medium">
            {getSuffix(setting.setting_key)}
          </span>
        )}
      </div>
    </div>
  );

  const baseSettings = settings.filter(s => baseStarKeys.includes(s.setting_key));
  const weeklySettings = settings.filter(s => weeklyBonusKeys.includes(s.setting_key));

  return (
    <Card className="border-2 border-sunshine/50 mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Star className="h-5 w-5 text-[#E8863A]" />
          {t.pointsConfiguration}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Base Stars */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base text-[#2D1810]">
            {sectionTitles.base[lang] || sectionTitles.base.de}
          </h3>
          <div className="space-y-2.5">
            {baseStarKeys.map(key => {
              const setting = baseSettings.find(s => s.setting_key === key);
              return setting ? renderSettingRow(setting) : null;
            })}
          </div>
        </div>

        {/* Section 2: Weekly Bonuses */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base text-[#2D1810]">
            {sectionTitles.weekly[lang] || sectionTitles.weekly.de}
          </h3>
          <div className="space-y-2.5">
            {weeklyBonusKeys.map(key => {
              const setting = weeklySettings.find(s => s.setting_key === key);
              return setting ? renderSettingRow(setting) : null;
            })}
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-orange-50 rounded-lg p-2.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[#E8863A]" />
            <span>{weeklyNote[lang] || weeklyNote.de}</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full h-12 rounded-xl text-base font-semibold bg-[#E8863A] hover:bg-[#D4752E] text-white transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {t.savePointsConfig}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsConfigSection;
