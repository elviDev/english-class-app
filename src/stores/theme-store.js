"use client";

import { create } from "zustand";

const STORAGE_KEY = "english-class-theme";

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

/**
 * The inline script in app/layout.js already applies the right theme to
 * the DOM before paint (no flash); this store just mirrors that into React
 * state afterwards so components can read/toggle it.
 */
export const useThemeStore = create((set, get) => ({
  theme: "light",

  hydrate: () => {
    const theme = readStoredTheme() || getSystemTheme();
    set({ theme });
  },

  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing or blocked storage: theme just won't persist.
    }
    set({ theme: next });
  },
}));

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)});if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`;
