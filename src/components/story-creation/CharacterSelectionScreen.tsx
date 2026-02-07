import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Plus, Star, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CharacterTile from "./CharacterTile";
import NameInputModal from "./NameInputModal";
import FamilyMemberModal from "./FamilyMemberModal";
import SiblingInputModal from "./SiblingInputModal";
import SelectionSummary from "./SelectionSummary";
import {
  CharacterType,
  FamilyMember,
  SiblingGender,
  SelectedCharacter,
  CharacterSelectionTranslations,
} from "./types";

// Import images
import heroKidImg from "@/assets/characters/hero-kid.jpg";
import familyImg from "@/assets/characters/family.jpg";
import siblingsImg from "@/assets/characters/siblings.jpg";
import boysFriendsImg from "@/assets/characters/boys-friends.jpg";
import famousCharactersImg from "@/assets/characters/famous-characters.jpg";
import surpriseBoxImg from "@/assets/characters/surprise-box.jpg";
import momImg from "@/assets/characters/mom.jpg";
import dadImg from "@/assets/characters/dad.jpg";
import grandmaImg from "@/assets/characters/grandma.jpg";
import grandpaImg from "@/assets/characters/grandpa.jpg";

interface KidCharacterDB {
  id: string;
  name: string;
  role: string;
  age: number | null;
  relation: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  kid_profile_id: string;
}

interface CharacterSelectionScreenProps {
  translations: CharacterSelectionTranslations;
  kidProfileId?: string;
  kidName?: string;
  kidAge?: number | null;
  onComplete: (characters: SelectedCharacter[]) => void;
  onBack: () => void;
}

type ViewState = "main" | "family";

const CharacterSelectionScreen = ({
  translations,
  kidProfileId,
  kidName,
  kidAge,
  onComplete,
  onBack,
}: CharacterSelectionScreenProps) => {
  const [viewState, setViewState] = useState<ViewState>("main");
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  
  // Modal states
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameModalTarget, setNameModalTarget] = useState<{
    type: CharacterType;
    label: string;
  } | null>(null);
  
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [familyModalTarget, setFamilyModalTarget] = useState<{
    type: FamilyMember;
    label: string;
  } | null>(null);
  
  const [siblingModalOpen, setSiblingModalOpen] = useState(false);

  // Block 2.3d: Saved kid_characters
  const [savedCharacters, setSavedCharacters] = useState<KidCharacterDB[]>([]);
  const [addCharacterOpen, setAddCharacterOpen] = useState(false);
  const [newCharName, setNewCharName] = useState("");
  const [newCharRole, setNewCharRole] = useState<string>("friend");
  const [newCharAge, setNewCharAge] = useState("");
  const [newCharRelation, setNewCharRelation] = useState("");
  const [newCharDescription, setNewCharDescription] = useState("");

  // Load saved characters from DB
  useEffect(() => {
    if (!kidProfileId) return;
    const loadSavedCharacters = async () => {
      const { data, error } = await supabase
        .from('kid_characters')
        .select('*')
        .eq('kid_profile_id', kidProfileId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (data && !error) {
        setSavedCharacters(data as KidCharacterDB[]);
      }
    };
    loadSavedCharacters();
  }, [kidProfileId]);

  // "Ich" tile shows actual kid name + age
  const meLabel = kidName
    ? (kidAge ? `${kidName} (${kidAge})` : kidName)
    : translations.me;

  const mainTiles = [
    { type: "me" as CharacterType, image: heroKidImg, label: meLabel, badge: "\u2B50" },
    { type: "family" as CharacterType, image: familyImg, label: translations.family },
    { type: "siblings" as CharacterType, image: siblingsImg, label: translations.siblings },
    { type: "friends" as CharacterType, image: boysFriendsImg, label: translations.friends },
    { type: "famous" as CharacterType, image: famousCharactersImg, label: translations.famous },
    { type: "surprise" as CharacterType, image: surpriseBoxImg, label: translations.surprise, badge: "\u2B50" },
  ];

  const familyTiles = [
    { type: "mama" as FamilyMember, image: momImg, label: translations.mama },
    { type: "papa" as FamilyMember, image: dadImg, label: translations.papa },
    { type: "oma" as FamilyMember, image: grandmaImg, label: translations.oma },
    { type: "opa" as FamilyMember, image: grandpaImg, label: translations.opa },
  ];

  const openNameModal = (type: CharacterType, label: string) => {
    setNameModalTarget({ type, label });
    setNameModalOpen(true);
  };

  const openFamilyModal = (type: FamilyMember, label: string) => {
    setFamilyModalTarget({ type, label });
    setFamilyModalOpen(true);
  };

  const handleMainTileClick = (type: CharacterType) => {
    switch (type) {
      case "me":
        // Direct selection - use actual kid profile name and age
        const meName = kidName || translations.me;
        const meLabel = kidAge ? `${meName} (${kidAge})` : meName;
        const meCharacter: SelectedCharacter = {
          id: `me-${Date.now()}`,
          type: "me",
          name: meName,
          label: meLabel,
          age: kidAge || undefined,
        };
        setSelectedCharacters((prev) => [...prev, meCharacter]);
        toast.success(`✓ ${meName} ${translations.nameSaved}`);
        break;
      case "family":
        setViewState("family");
        break;
      case "siblings":
        setSiblingModalOpen(true);
        break;
      case "friends":
        openNameModal("friends", translations.friends);
        break;
      case "famous":
        openNameModal("famous", translations.famous);
        break;
      case "surprise":
        handleSurprise();
        break;
    }
  };

  const handleFamilyTileClick = (type: FamilyMember) => {
    const labels: Record<FamilyMember, string> = {
      mama: translations.mama,
      papa: translations.papa,
      oma: translations.oma,
      opa: translations.opa,
      other: translations.other,
    };
    
    // For mama, papa, oma, opa - toggle selection (multi-select)
    if (type !== "other") {
      const existingIndex = selectedCharacters.findIndex((c) => c.type === type);
      
      if (existingIndex >= 0) {
        // Already selected - remove it
        setSelectedCharacters((prev) => prev.filter((c) => c.type !== type));
      } else {
        // Not selected - add it
        const familyCharacter: SelectedCharacter = {
          id: `${type}-${Date.now()}`,
          type: type,
          name: labels[type],
          label: labels[type],
        };
        setSelectedCharacters((prev) => [...prev, familyCharacter]);
        toast.success(`✓ ${labels[type]} ${translations.nameSaved}`);
      }
      // Stay in family view for multi-select
    } else {
      // "Other" still opens name modal
      openFamilyModal(type, labels[type]);
    }
  };

  const handleSaveName = useCallback((name: string) => {
    if (!nameModalTarget) return;

    const newCharacter: SelectedCharacter = {
      id: `${nameModalTarget.type}-${Date.now()}`,
      type: nameModalTarget.type,
      name,
      label: nameModalTarget.label,
    };

    setSelectedCharacters((prev) => [...prev, newCharacter]);
    toast.success(`✓ ${name} ${translations.nameSaved}`);
  }, [nameModalTarget, translations.nameSaved]);

  const handleSaveFamilyMember = useCallback((name: string, useDefault: boolean) => {
    if (!familyModalTarget) return;

    const newCharacter: SelectedCharacter = {
      id: `${familyModalTarget.type}-${Date.now()}`,
      type: familyModalTarget.type,
      name,
      label: useDefault ? familyModalTarget.label : name,
    };

    setSelectedCharacters((prev) => [...prev, newCharacter]);
    toast.success(`✓ ${name} ${translations.nameSaved}`);
    
    // Return to main view
    setViewState("main");
  }, [familyModalTarget, translations.nameSaved]);

  const handleSaveSibling = useCallback((name: string, gender: SiblingGender, age: number) => {
    const genderLabel = gender === "brother" ? translations.brother : translations.sister;
    
    const newCharacter: SelectedCharacter = {
      id: `sibling-${Date.now()}`,
      type: gender,
      name,
      label: `${name} (${genderLabel}, ${age})`,
      age,
      gender,
    };

    setSelectedCharacters((prev) => [...prev, newCharacter]);
    toast.success(`✓ ${name} ${translations.nameSaved}`);
  }, [translations.brother, translations.sister, translations.nameSaved]);

  const handleRemoveCharacter = (id: string) => {
    setSelectedCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSurprise = () => {
    const surpriseCharacter: SelectedCharacter = {
      id: `surprise-${Date.now()}`,
      type: "surprise",
      name: "???",
      label: translations.surprise,
    };
    setSelectedCharacters([surpriseCharacter]);
    // Go directly to next screen
    onComplete([surpriseCharacter]);
  };

  const handleContinue = () => {
    // If in family view, go back to main view first
    if (viewState === "family") {
      setViewState("main");
      return;
    }
    // From main view, proceed directly to next screen
    onComplete(selectedCharacters);
  };

  const isSelected = (type: CharacterType | FamilyMember) => {
    return selectedCharacters.some((c) => c.type === type);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-2 md:py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={viewState === "main" ? onBack : () => setViewState("main")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base md:text-lg font-baloo font-bold flex-1">
            {translations.header}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-3xl mx-auto px-4 py-3 md:py-4">
        {viewState === "main" && (
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            {mainTiles.map((tile) => (
              <CharacterTile
                key={tile.type}
                image={tile.image}
                label={tile.label}
                onClick={() => handleMainTileClick(tile.type)}
                selected={isSelected(tile.type)}
                badge={tile.badge}
                size="small"
              />
            ))}
          </div>
        )}

        {viewState === "family" && (
          <div className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {familyTiles.map((tile) => (
                <CharacterTile
                  key={tile.type}
                  image={tile.image}
                  label={tile.label}
                  onClick={() => handleFamilyTileClick(tile.type)}
                  selected={isSelected(tile.type)}
                  size="small"
                />
              ))}
            </div>
            
            {/* Add More Button */}
            <Button
              variant="outline"
              className="w-full h-12 md:h-14 rounded-xl border-dashed border-2"
              onClick={() => openFamilyModal("other", translations.other)}
            >
              <Plus className="w-5 h-5 mr-2" />
              {translations.other}
            </Button>
          </div>
        )}
      </div>

      {/* Block 2.3d: Saved Characters Section */}
      {viewState === "main" && savedCharacters.length > 0 && (
        <div className="container max-w-3xl mx-auto px-4 pt-3">
          <div className="bg-card rounded-xl border border-border p-3 space-y-2">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground">
              {translations.savedCharactersLabel}
            </h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {savedCharacters.map((char) => {
                const charSelected = selectedCharacters.some(c => c.id === `saved-${char.id}`);
                const charLabel = [char.name, char.age ? `${char.age}` : null, char.relation].filter(Boolean).join(', ');
                return (
                  <Button
                    key={char.id}
                    variant={charSelected ? "default" : "outline"}
                    size="sm"
                    className="h-8 md:h-9 rounded-lg md:rounded-xl text-xs md:text-sm px-2.5"
                    onClick={() => {
                      if (charSelected) {
                        setSelectedCharacters(prev => prev.filter(c => c.id !== `saved-${char.id}`));
                      } else {
                        const newChar: SelectedCharacter = {
                          id: `saved-${char.id}`,
                          type: "friends",
                          name: char.name,
                          label: charLabel,
                          age: char.age || undefined,
                        };
                        setSelectedCharacters(prev => [...prev, newChar]);
                        toast.success(`\u2713 ${char.name} ${translations.nameSaved}`);
                      }
                    }}
                  >
                    {charLabel}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Block 2.3d: Add Character Button */}
      {viewState === "main" && kidProfileId && (
        <div className="container max-w-3xl mx-auto px-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-10 md:h-11 rounded-xl border-dashed border-2 text-xs md:text-sm"
            onClick={() => setAddCharacterOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {translations.addCharacter}
          </Button>
        </div>
      )}

      {/* Block 2.3d: Add Character Dialog */}
      <Dialog open={addCharacterOpen} onOpenChange={setAddCharacterOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-baloo">{translations.addCharacter}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">{translations.characterName} *</Label>
              <Input
                value={newCharName}
                onChange={(e) => setNewCharName(e.target.value)}
                maxLength={50}
                className="h-9 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">{translations.characterRole} *</Label>
              <Select value={newCharRole} onValueChange={setNewCharRole}>
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sibling">{translations.roleSibling}</SelectItem>
                  <SelectItem value="friend">{translations.roleFriend}</SelectItem>
                  <SelectItem value="known_figure">{translations.roleKnownFigure}</SelectItem>
                  <SelectItem value="custom">{translations.roleCustom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium">{translations.characterAge}</Label>
                <Input
                  type="number"
                  value={newCharAge}
                  onChange={(e) => setNewCharAge(e.target.value)}
                  min={0}
                  max={99}
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">{translations.characterRelation}</Label>
                <Input
                  value={newCharRelation}
                  onChange={(e) => setNewCharRelation(e.target.value)}
                  maxLength={50}
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium">{translations.characterDescription}</Label>
              <Input
                value={newCharDescription}
                onChange={(e) => setNewCharDescription(e.target.value)}
                maxLength={100}
                className="h-9 mt-1"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAddCharacterOpen(false);
                  setNewCharName("");
                  setNewCharRole("friend");
                  setNewCharAge("");
                  setNewCharRelation("");
                  setNewCharDescription("");
                }}
              >
                {translations.cancel}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!newCharName.trim()}
                onClick={async () => {
                  if (!kidProfileId || !newCharName.trim()) return;
                  const { data, error } = await supabase.from('kid_characters').insert({
                    kid_profile_id: kidProfileId,
                    name: newCharName.trim(),
                    role: newCharRole,
                    age: newCharAge ? parseInt(newCharAge) : null,
                    relation: newCharRelation.trim() || null,
                    description: newCharDescription.trim() || null,
                    is_active: true,
                    sort_order: savedCharacters.length,
                  }).select().single();
                  if (data && !error) {
                    setSavedCharacters(prev => [...prev, data as KidCharacterDB]);
                    toast.success(`\u2713 ${newCharName.trim()} ${translations.nameSaved}`);
                  } else {
                    console.error('Error saving character:', error);
                  }
                  setAddCharacterOpen(false);
                  setNewCharName("");
                  setNewCharRole("friend");
                  setNewCharAge("");
                  setNewCharRelation("");
                  setNewCharDescription("");
                }}
              >
                {translations.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selection Summary (Bottom Sheet) */}
      <SelectionSummary
        characters={selectedCharacters}
        onRemove={handleRemoveCharacter}
        onContinue={handleContinue}
        translations={translations}
      />

      {/* Name Input Modal (for me, friends, famous) */}
      <NameInputModal
        open={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        onSave={handleSaveName}
        characterLabel={nameModalTarget?.label || ""}
        translations={translations}
      />

      {/* Family Member Modal (for mama, papa, oma, opa, other) */}
      <FamilyMemberModal
        open={familyModalOpen}
        onClose={() => setFamilyModalOpen(false)}
        onSave={handleSaveFamilyMember}
        memberType={familyModalTarget?.type || "other"}
        defaultLabel={familyModalTarget?.label || ""}
        translations={translations}
      />

      {/* Sibling Input Modal */}
      <SiblingInputModal
        open={siblingModalOpen}
        onClose={() => setSiblingModalOpen(false)}
        onSave={handleSaveSibling}
        translations={translations}
      />
    </div>
  );
};

export default CharacterSelectionScreen;
