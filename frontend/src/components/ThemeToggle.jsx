import { useTheme } from "../context/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
      <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`} aria-hidden="true" />
    </button>
  );
}
