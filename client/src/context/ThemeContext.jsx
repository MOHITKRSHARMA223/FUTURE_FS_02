import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

const THEMES = ['light', 'dark', 'midnight'];

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('crm-theme');
    if (saved && THEMES.includes(saved)) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('dark', 'midnight');
    // Add current theme class (light has no class)
    if (theme !== 'light') {
      root.classList.add(theme);
    }
    localStorage.setItem('crm-theme', theme);
  }, [theme]);

  const setTheme = (t) => {
    if (THEMES.includes(t)) setThemeState(t);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  };

  const isDark = theme === 'dark' || theme === 'midnight';

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
