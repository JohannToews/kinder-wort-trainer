import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Wand2, Loader2, Sparkles } from "lucide-react";

interface GeneratedStory {
  title: string;
  content: string;
}

interface StoryGeneratorProps {
  onStoryGenerated: (story: GeneratedStory) => void;
}

const StoryGenerator = ({ onStoryGenerated }: StoryGeneratorProps) => {
  const [length, setLength] = useState<string>("medium");
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [description, setDescription] = useState("");
  const [childAge, setChildAge] = useState<number>(8);
  const [schoolLevel, setSchoolLevel] = useState<string>("3e primaire (CE2)");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Bitte gib eine kurze Beschreibung ein");
      return;
    }

    setIsGenerating(true);
    toast.info("Geschichte wird generiert... 🪄");

    try {
      const { data, error } = await supabase.functions.invoke("generate-story", {
        body: {
          length,
          difficulty,
          description,
          childAge,
          schoolLevel,
        },
      });

      if (error) {
        console.error("Generation error:", error);
        toast.error("Fehler bei der Generierung");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.title && data?.content) {
        toast.success("Geschichte erfolgreich generiert! ✨");
        onStoryGenerated(data);
      } else {
        toast.error("Ungültige Antwort vom Server");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Ein Fehler ist aufgetreten");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-primary" />
          Geschichte mit KI generieren
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Length */}
          <div className="space-y-2">
            <Label htmlFor="length">Länge</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger id="length">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Kurz (100-150 Wörter)</SelectItem>
                <SelectItem value="medium">Mittel (200-300 Wörter)</SelectItem>
                <SelectItem value="long">Lang (400-500 Wörter)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Schwierigkeitsgrad</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Einfach</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="difficult">Schwer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Child Age */}
          <div className="space-y-2">
            <Label htmlFor="age">Alter des Kindes</Label>
            <Input
              id="age"
              type="number"
              min={5}
              max={14}
              value={childAge}
              onChange={(e) => setChildAge(parseInt(e.target.value) || 8)}
            />
          </div>

          {/* School Level */}
          <div className="space-y-2">
            <Label htmlFor="school">Schulniveau</Label>
            <Select value={schoolLevel} onValueChange={setSchoolLevel}>
              <SelectTrigger id="school">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1e primaire (CP)">1e primaire (CP)</SelectItem>
                <SelectItem value="2e primaire (CE1)">2e primaire (CE1)</SelectItem>
                <SelectItem value="3e primaire (CE2)">3e primaire (CE2)</SelectItem>
                <SelectItem value="4e primaire (CM1)">4e primaire (CM1)</SelectItem>
                <SelectItem value="5e primaire (CM2)">5e primaire (CM2)</SelectItem>
                <SelectItem value="6e primaire">6e primaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Kurze Beschreibung (auf Deutsch)
          </Label>
          <Input
            id="description"
            placeholder="z.B. Eine Geschichte über einen mutigen kleinen Hund, der sich im Wald verirrt"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-base"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full btn-primary-kid"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generiere Geschichte...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Geschichte generieren
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoryGenerator;
