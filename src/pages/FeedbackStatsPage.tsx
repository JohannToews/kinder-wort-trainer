import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useColorPalette } from "@/hooks/useColorPalette";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Loader2, TrendingDown, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Language } from "@/lib/translations";

interface StoryRating {
  id: string;
  story_title: string;
  story_prompt: string | null;
  kid_name: string | null;
  kid_school_class: string | null;
  kid_school_system: string | null;
  quality_rating: number;
  weakest_part: string | null;
  weakness_reason: string | null;
  created_at: string;
}

const translations: Record<Language, {
  title: string;
  subtitle: string;
  totalRatings: string;
  avgRating: string;
  mostCommonIssue: string;
  storyTitle: string;
  child: string;
  rating: string;
  weakestPart: string;
  reason: string;
  date: string;
  noData: string;
  beginning: string;
  development: string;
  ending: string;
  tooShort: string;
  tooShallow: string;
  tooRepetitive: string;
  prompt: string;
}> = {
  de: {
    title: "Story-Feedback Statistiken",
    subtitle: "Übersicht aller Bewertungen",
    totalRatings: "Gesamtbewertungen",
    avgRating: "Durchschnitt",
    mostCommonIssue: "Häufigstes Problem",
    storyTitle: "Geschichte",
    child: "Kind",
    rating: "Bewertung",
    weakestPart: "Schwächster Teil",
    reason: "Grund",
    date: "Datum",
    noData: "Noch keine Bewertungen",
    beginning: "Aufbau",
    development: "Entwicklung",
    ending: "Schluss",
    tooShort: "Zu kurz",
    tooShallow: "Zu flach",
    tooRepetitive: "Zu repetitiv",
    prompt: "Prompt",
  },
  fr: {
    title: "Statistiques des retours",
    subtitle: "Aperçu de toutes les évaluations",
    totalRatings: "Évaluations totales",
    avgRating: "Moyenne",
    mostCommonIssue: "Problème le plus fréquent",
    storyTitle: "Histoire",
    child: "Enfant",
    rating: "Note",
    weakestPart: "Partie la plus faible",
    reason: "Raison",
    date: "Date",
    noData: "Pas encore d'évaluations",
    beginning: "Début",
    development: "Développement",
    ending: "Fin",
    tooShort: "Trop court",
    tooShallow: "Trop superficiel",
    tooRepetitive: "Trop répétitif",
    prompt: "Prompt",
  },
  en: {
    title: "Story Feedback Statistics",
    subtitle: "Overview of all ratings",
    totalRatings: "Total Ratings",
    avgRating: "Average",
    mostCommonIssue: "Most Common Issue",
    storyTitle: "Story",
    child: "Child",
    rating: "Rating",
    weakestPart: "Weakest Part",
    reason: "Reason",
    date: "Date",
    noData: "No ratings yet",
    beginning: "Beginning",
    development: "Development",
    ending: "Ending",
    tooShort: "Too short",
    tooShallow: "Too shallow",
    tooRepetitive: "Too repetitive",
    prompt: "Prompt",
  },
  es: {
    title: "Estadísticas de comentarios",
    subtitle: "Resumen de todas las valoraciones",
    totalRatings: "Valoraciones totales",
    avgRating: "Promedio",
    mostCommonIssue: "Problema más común",
    storyTitle: "Historia",
    child: "Niño",
    rating: "Valoración",
    weakestPart: "Parte más débil",
    reason: "Razón",
    date: "Fecha",
    noData: "Sin valoraciones aún",
    beginning: "Inicio",
    development: "Desarrollo",
    ending: "Final",
    tooShort: "Demasiado corto",
    tooShallow: "Demasiado superficial",
    tooRepetitive: "Demasiado repetitivo",
    prompt: "Prompt",
  },
  nl: {
    title: "Feedback Statistieken",
    subtitle: "Overzicht van alle beoordelingen",
    totalRatings: "Totale beoordelingen",
    avgRating: "Gemiddelde",
    mostCommonIssue: "Meest voorkomend probleem",
    storyTitle: "Verhaal",
    child: "Kind",
    rating: "Beoordeling",
    weakestPart: "Zwakste deel",
    reason: "Reden",
    date: "Datum",
    noData: "Nog geen beoordelingen",
    beginning: "Begin",
    development: "Ontwikkeling",
    ending: "Einde",
    tooShort: "Te kort",
    tooShallow: "Te oppervlakkig",
    tooRepetitive: "Te repetitief",
    prompt: "Prompt",
  },
  it: {
    title: "Statistiche feedback",
    subtitle: "Panoramica di tutte le valutazioni",
    totalRatings: "Valutazioni totali",
    avgRating: "Media",
    mostCommonIssue: "Problema più comune",
    storyTitle: "Storia",
    child: "Bambino",
    rating: "Valutazione",
    weakestPart: "Parte più debole",
    reason: "Motivo",
    date: "Data",
    noData: "Nessuna valutazione ancora",
    beginning: "Inizio",
    development: "Sviluppo",
    ending: "Fine",
    tooShort: "Troppo corto",
    tooShallow: "Troppo superficiale",
    tooRepetitive: "Troppo ripetitivo",
    prompt: "Prompt",
  },
};

const FeedbackStatsPage = () => {
  const { user } = useAuth();
  const { colors: paletteColors } = useColorPalette();
  const [ratings, setRatings] = useState<StoryRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const adminLang = (user?.adminLanguage || 'de') as Language;
  const t = translations[adminLang] || translations.de;

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    const { data, error } = await supabase
      .from("story_ratings")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setRatings(data);
    }
    setIsLoading(false);
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.quality_rating, 0) / ratings.length).toFixed(1)
    : "0";

  const getMostCommonIssue = () => {
    const issues: Record<string, number> = {};
    ratings.forEach((r) => {
      if (r.weakness_reason) {
        issues[r.weakness_reason] = (issues[r.weakness_reason] || 0) + 1;
      }
    });
    const sorted = Object.entries(issues).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  };

  const mostCommonIssue = getMostCommonIssue();

  const translateWeakestPart = (part: string | null) => {
    if (!part) return "-";
    switch (part) {
      case "beginning": return t.beginning;
      case "development": return t.development;
      case "ending": return t.ending;
      default: return part;
    }
  };

  const translateReason = (reason: string | null) => {
    if (!reason) return "-";
    switch (reason) {
      case "too_short": return t.tooShort;
      case "too_shallow": return t.tooShallow;
      case "too_repetitive": return t.tooRepetitive;
      default: return reason;
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-sunshine text-sunshine" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${paletteColors.bg} flex items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${paletteColors.bg}`}>
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <PageHeader title={t.title} backTo="/" />
        <p className="text-muted-foreground mb-6">{t.subtitle}</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.totalRatings}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{ratings.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.avgRating}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-sunshine text-sunshine" />
                <span className="text-2xl font-bold">{avgRating}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t.mostCommonIssue}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-cotton-candy" />
                <span className="text-lg font-medium">
                  {mostCommonIssue ? translateReason(mostCommonIssue) : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ratings Table */}
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t.noData}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.child}</TableHead>
                      <TableHead>{t.storyTitle}</TableHead>
                      <TableHead>{t.prompt}</TableHead>
                      <TableHead>{t.rating}</TableHead>
                      <TableHead>{t.weakestPart}</TableHead>
                      <TableHead>{t.reason}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratings.map((rating) => (
                      <TableRow key={rating.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(rating.created_at), "dd.MM.yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{rating.kid_name || "-"}</span>
                            {rating.kid_school_class && (
                              <span className="text-xs text-muted-foreground">
                                {rating.kid_school_class} ({rating.kid_school_system?.toUpperCase()})
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate" title={rating.story_title}>
                          {rating.story_title}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={rating.story_prompt || ""}>
                          {rating.story_prompt || "-"}
                        </TableCell>
                        <TableCell>{renderStars(rating.quality_rating)}</TableCell>
                        <TableCell>{translateWeakestPart(rating.weakest_part)}</TableCell>
                        <TableCell>{translateReason(rating.weakness_reason)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FeedbackStatsPage;
