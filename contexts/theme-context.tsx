import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: typeof lightColors | typeof darkColors;
}

const BG_LIGHT = '#EEF2FF';
const BG_LIGHT_ALT = '#E0E7FF';
const CARD_WHITE = '#FFFFFF';
const TEXT_DARK = '#1E1B4B';
const TEXT_SECONDARY = '#6366A8';
const TEXT_MUTED = '#8B8DB3';
const BORDER_LIGHT = '#E0E7FF';
const INPUT_BG = '#E8ECFF';

const BG_DARK = '#0B0A16';
const CARD_DARK = '#1C1833';
const BORDER_DARK = '#312E81';

export const lightColors = {
  background: BG_LIGHT,
  card: CARD_WHITE,
  text: TEXT_DARK,
  textSecondary: TEXT_SECONDARY,
  textMuted: TEXT_MUTED,
  tint: '#4338CA',
  tintLight: '#6366F1',
  border: BORDER_LIGHT,
  tabBar: CARD_WHITE,
  inputBg: INPUT_BG,
  danger: '#dc2626',
  success: '#059669',
  statusBar: 'dark-content' as const,
  gradient1: [BG_LIGHT_ALT, BG_LIGHT] as [string, string],
  gradient2: [BG_LIGHT, BG_LIGHT_ALT] as [string, string],
  gradient3: [BG_LIGHT_ALT, BG_LIGHT] as [string, string],
  gradient4: [BG_LIGHT, BG_LIGHT_ALT] as [string, string],
  gradient5: [BG_LIGHT_ALT, BG_LIGHT] as [string, string],
};

export const darkColors = {
  background: BG_DARK,
  card: CARD_DARK,
  text: '#EEF2FF',
  textSecondary: '#A5B4FC',
  textMuted: '#818CF8',
  tint: '#A5B4FC',
  tintLight: '#C7D2FE',
  border: BORDER_DARK,
  tabBar: CARD_DARK,
  inputBg: '#241F42',
  danger: '#f87171',
  success: '#34d399',
  statusBar: 'light-content' as const,
  gradient1: [CARD_DARK, BORDER_DARK] as [string, string],
  gradient2: [BORDER_DARK, CARD_DARK] as [string, string],
  gradient3: [CARD_DARK, BORDER_DARK] as [string, string],
  gradient4: [BORDER_DARK, CARD_DARK] as [string, string],
  gradient5: [CARD_DARK, BORDER_DARK] as [string, string],
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'appTheme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  const colors = theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      let saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== 'dark' && saved !== 'light') {
        const appSettings = await AsyncStorage.getItem('appSettings');
        if (appSettings) {
          const data = JSON.parse(appSettings);
          saved = data.darkMode ? 'dark' : 'light';
        }
      }
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      const appSettings = await AsyncStorage.getItem('appSettings');
      const data = appSettings ? JSON.parse(appSettings) : {};
      data.darkMode = mode === 'dark';
      await AsyncStorage.setItem('appSettings', JSON.stringify(data));
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [theme, setTheme]);

  const value: ThemeContextType = {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
    colors,
  };

  if (!isLoaded) {
    return (
      <ThemeContext.Provider value={{ ...value, theme: 'light', isDark: false, colors: lightColors } as ThemeContextType}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
