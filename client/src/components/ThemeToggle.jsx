import { useCallback, useSyncExternalStore } from "react";
import { HiSun, HiMoon } from "react-icons/hi2";

const STORAGE_KEY = "smart-campus-theme";

function subscribe(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener("smart-campus-theme-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("smart-campus-theme-change", onChange);
  };
}

function getThemeSnapshot() {
  return document.documentElement.getAttribute("data-theme") || "light";
}

function getServerSnapshot() {
  return "light";
}

const ThemeToggle = () => {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getServerSnapshot
  );
  const isDark = theme === "dark";

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {
      /* ignore */
    }
    window.dispatchEvent(new Event("smart-campus-theme-change"));
  }, [isDark]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span className={`theme-toggle-track${isDark ? " is-dark" : ""}`}>
        <HiSun className="theme-toggle-icon theme-toggle-sun" aria-hidden />
        <span className="theme-toggle-thumb" aria-hidden />
        <HiMoon className="theme-toggle-icon theme-toggle-moon" aria-hidden />
      </span>
    </button>
  );
};

export default ThemeToggle;
