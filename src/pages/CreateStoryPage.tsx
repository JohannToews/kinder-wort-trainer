import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKidProfile } from "@/hooks/useKidProfile";
import { useColorPalette } from "@/hooks/useColorPalette";
import { useAuth } from "@/hooks/useAuth";
import CharacterSelectionScreen from "@/components/story-creation/CharacterSelectionScreen";
import SettingSelectionScreen from "@/components/story-creation/SettingSelectionScreen";
import {
  SelectedCharacter,
  SpecialAttribute,
  LocationType,
  TimePeriod,
  characterSelectionTranslations,
  settingSelectionTranslations,
} from "@/components/story-creation/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Screen states for the wizard
type WizardScreen = "characters" | "setting" | "story-type";

const CreateStoryPage = () => {
  const navigate = useNavigate();
  const { kidAppLanguage, selectedProfile } = useKidProfile();
  const { user } = useAuth();
  const { colors: paletteColors } = useColorPalette();

  // Wizard state
  const [currentScreen, setCurrentScreen] = useState<WizardScreen>("characters");
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<SpecialAttribute[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<LocationType[]>([]);
  const [selectedTime, setSelectedTime] = useState<TimePeriod>("today");

  // Translations
  const characterTranslations = characterSelectionTranslations[kidAppLanguage] || characterSelectionTranslations.de;
  const settingTranslations = settingSelectionTranslations[kidAppLanguage] || settingSelectionTranslations.de;

  // Handle character selection complete
  const handleCharactersComplete = (
    characters: SelectedCharacter[],
    attributes: SpecialAttribute[]
  ) => {
    setSelectedCharacters(characters);
    setSelectedAttributes(attributes);
    setCurrentScreen("setting");
  };

  // Handle setting selection complete
  const handleSettingComplete = (
    locations: LocationType[],
    timePeriod: TimePeriod
  ) => {
    setSelectedLocations(locations);
    setSelectedTime(timePeriod);
    
    console.log("Locations:", locations);
    console.log("Time:", timePeriod);
    toast.success("Setting ausgewählt! 🌍");
    
    // Navigate to story-type screen (to be implemented)
    setCurrentScreen("story-type");
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentScreen === "characters") {
      navigate("/");
    } else if (currentScreen === "setting") {
      setCurrentScreen("characters");
    } else if (currentScreen === "story-type") {
      setCurrentScreen("setting");
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${paletteColors.bg}`}>
      {currentScreen === "characters" && (
        <CharacterSelectionScreen
          translations={characterTranslations}
          onComplete={handleCharactersComplete}
          onBack={handleBack}
        />
      )}

      {currentScreen === "setting" && (
        <SettingSelectionScreen
          translations={settingTranslations}
          onComplete={handleSettingComplete}
          onBack={handleBack}
        />
      )}

      {currentScreen === "story-type" && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <h2 className="text-2xl font-baloo mb-4">Screen 3: Story-Typ</h2>
            <p className="text-muted-foreground mb-4">
              Charaktere: {selectedCharacters.map(c => c.name).join(", ")}
            </p>
            <p className="text-muted-foreground mb-4">
              Orte: {selectedLocations.join(", ")}
            </p>
            <p className="text-muted-foreground mb-6">
              Zeit: {selectedTime}
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl"
            >
              Zurück zu Setting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStoryPage;
