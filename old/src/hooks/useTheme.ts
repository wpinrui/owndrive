import { useEffect } from "react";
import type { Theme } from "../types/settings";

/**
 * Detects system theme preference
 * Returns "dark" if unable to detect (default fallback)
 */
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  
  try {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch (e) {
    console.warn("Unable to detect system theme preference:", e);
  }
  
  return "dark"; // Default to dark if can't tell
};

/**
 * Gets the effective theme based on user preference
 */
const getEffectiveTheme = (themePreference: Theme | undefined): "light" | "dark" => {
  if (themePreference === "light") return "light";
  if (themePreference === "dark") return "dark";
  // themePreference === "auto" or undefined
  return getSystemTheme();
};

/**
 * Applies theme to the document
 */
const applyTheme = (theme: "light" | "dark") => {
  const root = document.documentElement;
  
  if (theme === "light") {
    root.classList.add("theme-light");
    root.classList.remove("theme-dark");
  } else {
    root.classList.add("theme-dark");
    root.classList.remove("theme-light");
  }
};

// Apply initial theme on module load (before React mounts)
if (typeof document !== "undefined") {
  const initialTheme = getSystemTheme();
  applyTheme(initialTheme);
}

/**
 * Hook to apply theme based on user settings
 */
export const useTheme = (themePreference: Theme | undefined) => {
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(themePreference);
    applyTheme(effectiveTheme);

    // If theme is "auto", listen for system preference changes
    if (themePreference === "auto" || !themePreference) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
      
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const newTheme = e.matches ? "light" : "dark";
        applyTheme(newTheme);
      };

      // Check if addEventListener is supported (modern browsers)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [themePreference]);
};

