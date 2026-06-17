// Sun/moon button toggling chrome dark mode.

import { Moon, Sun } from "../components/ui/icons";
import { Button } from "../components/ui/button";

export function ThemeToggle(props: { theme: "light" | "dark"; onToggle: () => void }) {
  const dark = props.theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={props.onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
