import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CharacterTile from "./CharacterTile";
import { LocationType, TimePeriod, SettingSelectionTranslations } from "./types";
import { cn } from "@/lib/utils";

// Location images
import deepseaImg from "@/assets/settings/deepsea.jpg";
import mountainsImg from "@/assets/settings/mountains.jpg";
import spaceImg from "@/assets/settings/space.jpg";
import castleImg from "@/assets/settings/castle.jpg";
import jungleImg from "@/assets/settings/jungle.jpg";
import homeImg from "@/assets/settings/home.jpg";
import surpriseBoxImg from "@/assets/characters/surprise-box.jpg";

// Timeline images
import dinosaursImg from "@/assets/timeline/dinosaurs.jpg";
import stoneageImg from "@/assets/timeline/stoneage.jpg";
import egyptImg from "@/assets/timeline/egypt.jpg";
import piratesImg from "@/assets/timeline/pirates.jpg";
import medievalImg from "@/assets/timeline/medieval.jpg";
import wildwestImg from "@/assets/timeline/wildwest.jpg";
import vintageImg from "@/assets/timeline/vintage.jpg";
import todayImg from "@/assets/timeline/today.jpg";
import nearfutureImg from "@/assets/timeline/nearfuture.jpg";
import farfutureImg from "@/assets/timeline/farfuture.jpg";

interface SettingSelectionScreenProps {
  translations: SettingSelectionTranslations;
  onComplete: (locations: LocationType[], timePeriod: TimePeriod) => void;
  onBack: () => void;
}

const MAX_LOCATIONS = 3;

const SettingSelectionScreen = ({
  translations,
  onComplete,
  onBack,
}: SettingSelectionScreenProps) => {
  const [selectedLocations, setSelectedLocations] = useState<LocationType[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimePeriod>("today");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(7); // "today" is index 7

  const locationTiles = [
    { type: "deepsea" as LocationType, image: deepseaImg, label: translations.deepsea },
    { type: "mountains" as LocationType, image: mountainsImg, label: translations.mountains },
    { type: "space" as LocationType, image: spaceImg, label: translations.space },
    { type: "magic" as LocationType, image: castleImg, label: translations.magicWorlds },
    { type: "nature" as LocationType, image: jungleImg, label: translations.nature },
    { type: "home" as LocationType, image: homeImg, label: translations.home },
    { type: "surprise" as LocationType, image: surpriseBoxImg, label: translations.surprise, badge: "⭐" },
  ];

  const timelineTiles = [
    { type: "dinosaurs" as TimePeriod, image: dinosaursImg, label: translations.dinosaurs, emoji: "🦕" },
    { type: "stoneage" as TimePeriod, image: stoneageImg, label: translations.stoneage, emoji: "🔥" },
    { type: "egypt" as TimePeriod, image: egyptImg, label: translations.egypt, emoji: "🏺" },
    { type: "pirates" as TimePeriod, image: piratesImg, label: translations.pirates, emoji: "🏴‍☠️" },
    { type: "medieval" as TimePeriod, image: medievalImg, label: translations.medieval, emoji: "🏰" },
    { type: "wildwest" as TimePeriod, image: wildwestImg, label: translations.wildwest, emoji: "🤠" },
    { type: "vintage" as TimePeriod, image: vintageImg, label: translations.vintage, emoji: "🚗" },
    { type: "today" as TimePeriod, image: todayImg, label: translations.today, emoji: "📱" },
    { type: "nearfuture" as TimePeriod, image: nearfutureImg, label: translations.nearfuture, emoji: "🤖" },
    { type: "farfuture" as TimePeriod, image: farfutureImg, label: translations.farfuture, emoji: "🚀" },
  ];

  const handleLocationClick = (type: LocationType) => {
    if (type === "surprise") {
      // Random selection
      const randomLocations = locationTiles
        .filter(t => t.type !== "surprise")
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 1)
        .map(t => t.type);
      setSelectedLocations(randomLocations);
      
      // Random time
      const randomTime = timelineTiles[Math.floor(Math.random() * timelineTiles.length)].type;
      setSelectedTime(randomTime);
      setCurrentTimeIndex(timelineTiles.findIndex(t => t.type === randomTime));
      
      toast.success("🎲 Zufällig ausgewählt!");
      return;
    }

    setSelectedLocations(prev => {
      if (prev.includes(type)) {
        return prev.filter(l => l !== type);
      }
      if (prev.length >= MAX_LOCATIONS) {
        toast.error(translations.maxLocations);
        return prev;
      }
      return [...prev, type];
    });
  };

  const handleTimeSelect = (type: TimePeriod, index: number) => {
    setSelectedTime(type);
    setCurrentTimeIndex(index);
    scrollToIndex(index);
  };

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const itemWidth = 140; // min-w-[140px]
    const containerWidth = container.offsetWidth;
    const scrollPosition = (index * itemWidth) - (containerWidth / 2) + (itemWidth / 2);
    
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth"
    });
  };

  const handlePrevTime = () => {
    const newIndex = Math.max(0, currentTimeIndex - 1);
    handleTimeSelect(timelineTiles[newIndex].type, newIndex);
  };

  const handleNextTime = () => {
    const newIndex = Math.min(timelineTiles.length - 1, currentTimeIndex + 1);
    handleTimeSelect(timelineTiles[newIndex].type, newIndex);
  };

  const handleContinue = () => {
    if (selectedLocations.length === 0) {
      toast.error("Bitte wähle mindestens einen Ort aus");
      return;
    }
    onComplete(selectedLocations, selectedTime);
  };

  // Initial scroll to center "today"
  useEffect(() => {
    setTimeout(() => scrollToIndex(currentTimeIndex), 100);
  }, []);

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base md:text-lg font-baloo font-bold flex-1">
            {translations.header}
          </h1>
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Part A: Location Selection */}
        <section className="space-y-4">
          <h2 className="text-lg font-baloo font-semibold text-center">
            {translations.locationHeader}
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {translations.maxLocations}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {locationTiles.map((tile) => (
              <CharacterTile
                key={tile.type}
                image={tile.image}
                label={tile.label}
                onClick={() => handleLocationClick(tile.type)}
                selected={selectedLocations.includes(tile.type)}
                badge={tile.badge}
              />
            ))}
          </div>
        </section>

        {/* Part B: Time Selection */}
        <section className="space-y-4">
          <h2 className="text-lg font-baloo font-semibold text-center">
            {translations.timeHeader}
          </h2>

          {/* Timeline Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevTime}
              disabled={currentTimeIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextTime}
              disabled={currentTimeIndex === timelineTiles.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm rounded-full shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-10 py-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {timelineTiles.map((tile, index) => (
                <button
                  key={tile.type}
                  onClick={() => handleTimeSelect(tile.type, index)}
                  className={cn(
                    "flex-shrink-0 min-w-[120px] snap-center flex flex-col items-center gap-2 p-3 rounded-2xl",
                    "transition-all duration-300 ease-out",
                    "hover:scale-105 active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedTime === tile.type
                      ? "scale-110 border-2 border-primary bg-primary/5 shadow-lg"
                      : "border-2 border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    <img
                      src={tile.image}
                      alt={tile.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 right-1 text-lg">
                      {tile.emoji}
                    </div>
                    {selectedTime === tile.type && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "font-baloo text-xs md:text-sm text-center font-medium whitespace-nowrap",
                    selectedTime === tile.type ? "text-primary" : "text-foreground"
                  )}>
                    {tile.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-1.5">
            {timelineTiles.map((tile, index) => (
              <button
                key={tile.type}
                onClick={() => handleTimeSelect(tile.type, index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  currentTimeIndex === index
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Continue Button */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-sm border-t border-border pb-safe">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <Button
            onClick={handleContinue}
            disabled={selectedLocations.length === 0}
            className="w-full h-14 rounded-2xl text-lg font-baloo bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {translations.continue} →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingSelectionScreen;
