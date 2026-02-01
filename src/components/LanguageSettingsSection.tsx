import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, Settings, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type LanguageCode = 'de' | 'fr' | 'en' | 'es' | 'nl';

interface LanguageSettingsSectionProps {
  language: LanguageCode;
}

const labels: Record<LanguageCode, {
  title: string;
  description: string;
  adminLanguage: string;
  adminDescription: string;
  appLanguage: string;
  appDescription: string;
  save: string;
  saved: string;
  error: string;
}> = {
  de: {
    title: "Spracheinstellungen",
    description: "Konfiguriere die Sprachen für Admin-Bereich und App",
    adminLanguage: "Admin-Sprache",
    adminDescription: "Sprache für den Admin-Bereich",
    appLanguage: "App-Sprache",
    appDescription: "Sprache für Home, Geschichten, Quiz etc.",
    save: "Speichern",
    saved: "Spracheinstellungen gespeichert",
    error: "Fehler beim Speichern",
  },
  en: {
    title: "Language Settings",
    description: "Configure languages for admin area and app",
    adminLanguage: "Admin Language",
    adminDescription: "Language for the admin area",
    appLanguage: "App Language",
    appDescription: "Language for home, stories, quiz etc.",
    save: "Save",
    saved: "Language settings saved",
    error: "Error saving settings",
  },
  fr: {
    title: "Paramètres de langue",
    description: "Configurer les langues pour l'administration et l'application",
    adminLanguage: "Langue Admin",
    adminDescription: "Langue pour la zone d'administration",
    appLanguage: "Langue App",
    appDescription: "Langue pour accueil, histoires, quiz etc.",
    save: "Enregistrer",
    saved: "Paramètres de langue enregistrés",
    error: "Erreur lors de l'enregistrement",
  },
  es: {
    title: "Configuración de idioma",
    description: "Configurar idiomas para el área de administración y la aplicación",
    adminLanguage: "Idioma Admin",
    adminDescription: "Idioma para el área de administración",
    appLanguage: "Idioma App",
    appDescription: "Idioma para inicio, historias, quiz etc.",
    save: "Guardar",
    saved: "Configuración de idioma guardada",
    error: "Error al guardar",
  },
  nl: {
    title: "Taalinstellingen",
    description: "Configureer talen voor admin-gebied en app",
    adminLanguage: "Admin-taal",
    adminDescription: "Taal voor het admin-gebied",
    appLanguage: "App-taal",
    appDescription: "Taal voor home, verhalen, quiz etc.",
    save: "Opslaan",
    saved: "Taalinstellingen opgeslagen",
    error: "Fout bij opslaan",
  },
};

const languageOptions = [
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'fr', label: '🇫🇷 Français' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'nl', label: '🇳🇱 Nederlands' },
];

const LanguageSettingsSection = ({ language }: LanguageSettingsSectionProps) => {
  const { user, login } = useAuth();
  const l = labels[language];
  
  const [adminLang, setAdminLang] = useState<LanguageCode>(user?.adminLanguage || 'de');
  const [appLang, setAppLang] = useState<LanguageCode>(user?.appLanguage || 'fr');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: {
          action: 'updateLanguages',
          userId: user.id,
          adminLanguage: adminLang,
          appLanguage: appLang,
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Update local user state
      const updatedUser = {
        ...user,
        adminLanguage: adminLang,
        appLanguage: appLang,
      };
      
      const token = sessionStorage.getItem('liremagie_session') || '';
      login(token, updatedUser);

      toast.success(l.saved);
    } catch (error) {
      console.error('Error saving language settings:', error);
      toast.error(l.error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {l.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{l.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Admin Language */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{l.adminLanguage}</p>
              <p className="text-xs text-muted-foreground">{l.adminDescription}</p>
            </div>
          </div>
          <Select value={adminLang} onValueChange={(v) => setAdminLang(v as LanguageCode)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* App Language */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Globe className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">{l.appLanguage}</p>
              <p className="text-xs text-muted-foreground">{l.appDescription}</p>
            </div>
          </div>
          <Select value={appLang} onValueChange={(v) => setAppLang(v as LanguageCode)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {l.save}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsSection;
