import { useTheme } from "../Context/theme-context";
import Icon from "./Icon";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "oscuro" : "claro";

  return (
    <button
      type="button"
      className="theme-toggle icon-button"
      onClick={toggleTheme}
      aria-label={`Cambiar a tema ${nextTheme}`}
      title={`Cambiar a tema ${nextTheme}`}
    >
      <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
    </button>
  );
}
