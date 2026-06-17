// Dark-mode toggle for the CHROME only (raw wireframe boxes are unaffected —
// they use fixed greys). Toggles `.dark` on <html> and persists the choice.

import { useCallback, useEffect, useState } from "react";

const KEY = "wfc:theme";

function read(): "light" | "dark" {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(read);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return { theme, toggle };
}
