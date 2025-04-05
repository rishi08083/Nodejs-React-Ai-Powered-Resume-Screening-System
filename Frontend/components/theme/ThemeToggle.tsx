// components/ThemeToggle.js
import { useTheme } from "../../lib/themeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-dark-surface dark:bg-light-surface text-dark-text-primary dark:text-light-text-primary"
      aria-label={`Toggle ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
