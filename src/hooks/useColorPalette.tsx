import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const PALETTE_COLORS: Record<string, { primary: string; accent: string; bg: string }> = {
  sunshine: { primary: 'from-amber-400/30', accent: 'bg-amber-400/20', bg: 'from-amber-50 via-orange-50 to-yellow-50' },
  mint: { primary: 'from-emerald-400/30', accent: 'bg-emerald-400/20', bg: 'from-emerald-50 via-teal-50 to-green-50' },
  lavender: { primary: 'from-purple-400/30', accent: 'bg-purple-400/20', bg: 'from-purple-50 via-violet-50 to-fuchsia-50' },
  ocean: { primary: 'from-blue-500/30', accent: 'bg-blue-500/20', bg: 'from-blue-50 via-cyan-50 to-sky-50' },
  sunset: { primary: 'from-orange-400/30', accent: 'bg-orange-400/20', bg: 'from-orange-50 via-red-50 to-pink-50' },
  forest: { primary: 'from-green-600/30', accent: 'bg-green-600/20', bg: 'from-green-50 via-emerald-50 to-teal-50' },
  sky: { primary: 'from-sky-400/30', accent: 'bg-sky-400/20', bg: 'from-sky-50 via-blue-50 to-cyan-50' },
  berry: { primary: 'from-pink-600/30', accent: 'bg-pink-600/20', bg: 'from-pink-50 via-rose-50 to-fuchsia-50' },
  earth: { primary: 'from-amber-700/30', accent: 'bg-amber-700/20', bg: 'from-amber-50 via-orange-50 to-yellow-50' },
  candy: { primary: 'from-pink-400/30', accent: 'bg-pink-400/20', bg: 'from-pink-50 via-rose-50 to-fuchsia-50' },
  arctic: { primary: 'from-cyan-300/30', accent: 'bg-cyan-300/20', bg: 'from-cyan-50 via-sky-50 to-blue-50' },
  tropical: { primary: 'from-teal-500/30', accent: 'bg-teal-500/20', bg: 'from-teal-50 via-cyan-50 to-emerald-50' },
};

const DEFAULT_PALETTE = 'sunshine';

export interface ColorPaletteData {
  palette: string;
  colors: { primary: string; accent: string; bg: string };
  isLoading: boolean;
}

export const useColorPalette = (): ColorPaletteData => {
  const { user } = useAuth();
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPalette = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("kid_profiles")
        .select("color_palette")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.color_palette) {
        setPalette(data.color_palette);
      }
      setIsLoading(false);
    };

    loadPalette();
  }, [user]);

  return {
    palette,
    colors: PALETTE_COLORS[palette] || PALETTE_COLORS[DEFAULT_PALETTE],
    isLoading,
  };
};
