import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";

export type Theme = "dark" | "light";

const THEME_STORAGE_KEY = "jsonhero:theme";

type ThemeContextType = [
  Theme | undefined,
  Dispatch<SetStateAction<Theme | undefined>>
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const prefersLightMQ = "(prefers-color-scheme: light)";
const getPreferredTheme = () =>
  window.matchMedia(prefersLightMQ).matches ? "light" : "dark";

function getStoredTheme(): Theme | undefined {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return undefined;
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

export function ThemeProvider({
  children,
  themeOverride,
}: {
  children: ReactNode;
  themeOverride?: Theme;
}) {
  const [theme, setTheme] = useState<Theme | undefined>(() => {
    const stored = getStoredTheme();
    if (stored) return stored;

    if (typeof window !== "object") return;

    return getPreferredTheme();
  });

  const mountRun = useRef(false);

  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) return;
    storeTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={[themeOverride ?? theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

const clientThemeCode = `
;(() => {
  const key = "jsonhero:theme";
  const stored = (() => { try { return localStorage.getItem(key); } catch {} })();
  const theme = stored || (window.matchMedia(${JSON.stringify(prefersLightMQ)}).matches ? 'light' : 'dark');
  const cl = document.documentElement.classList;
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    console.warn(
      "Hi there, could you let us know you're seeing this message? Thanks!",
    );
  } else {
    cl.add(theme);
  }
})();
`;

export function NonFlashOfWrongThemeEls({ ssrTheme }: { ssrTheme: boolean }) {
  return (
    <>
      {ssrTheme ? null : (
        <script dangerouslySetInnerHTML={{ __html: clientThemeCode }} />
      )}
    </>
  );
}

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && ["light", "dark"].includes(value);
}
