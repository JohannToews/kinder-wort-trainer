import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Loader2,
  Headphones,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface StoryAudioPlayerProps {
  storyContent: string;
  storyTitle: string;
  isListeningMode: boolean;
  onModeChange: (listening: boolean) => void;
}

const StoryAudioPlayer = ({ 
  storyContent, 
  storyTitle,
  isListeningMode,
  onModeChange 
}: StoryAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasGeneratedAudio, setHasGeneratedAudio] = useState(false);

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Update time display
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const generateAudio = useCallback(async () => {
    if (hasGeneratedAudio && audioUrl) {
      // Already have audio, just play it
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            text: storyContent,
            language: "fr"
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Trop de demandes. Réessaie dans quelques instants.");
        }
        throw new Error("Erreur lors de la génération audio");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      // Clean up old URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      setAudioUrl(url);
      setHasGeneratedAudio(true);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storyContent, audioUrl, hasGeneratedAudio]);

  const handlePlayPause = async () => {
    if (!audioRef.current) {
      // First time - generate audio
      const success = await generateAudio();
      if (!success) return;
      
      // Wait for audio element to be ready
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-card rounded-2xl border-2 border-primary/20 overflow-hidden">
      {/* Mode Toggle Header */}
      <div className="flex border-b border-border">
        <button
          onClick={() => onModeChange(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors ${
            !isListeningMode 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-sm">Lire</span>
        </button>
        <button
          onClick={() => onModeChange(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors ${
            isListeningMode 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-muted-foreground hover:bg-muted/50"
          }`}
        >
          <Headphones className="h-4 w-4" />
          <span className="text-sm">Écouter</span>
        </button>
      </div>

      {/* Audio Player Controls */}
      {isListeningMode && (
        <div className="p-4 space-y-4">
          {/* Hidden audio element */}
          {audioUrl && (
            <audio ref={audioRef} src={audioUrl} preload="auto" />
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-3">
            {/* Rewind 15s */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRewind}
              disabled={isLoading || !audioUrl}
              className="h-10 w-10 rounded-full"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>

            {/* Play/Pause */}
            <Button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="h-14 w-14 rounded-full btn-primary-kid"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            {/* Mute */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              disabled={isLoading || !audioUrl}
              className="h-10 w-10 rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              disabled={isLoading || !audioUrl}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Loading Info */}
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground">
              Génération de l'audio en cours... ⏳
            </p>
          )}

          {/* First time hint */}
          {!hasGeneratedAudio && !isLoading && !error && (
            <p className="text-center text-sm text-muted-foreground">
              Appuie sur ▶️ pour écouter l'histoire
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryAudioPlayer;
