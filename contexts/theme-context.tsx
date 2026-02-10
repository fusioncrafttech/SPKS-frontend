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

// Default theme – WhatsApp-style light chat background, no strong colours
const CHAT_BG_LIGHT = '#E5DDD5';   // WhatsApp-like warm light grey (chat bg)
const CHAT_BG_ALT = '#D1CBC3';    // Slightly darker for gradients/cards
const CARD_WHITE = '#FFFFFF';
const TEXT_DARK = '#111B21';
const TEXT_SECONDARY = '#667781';
const TEXT_MUTED = '#8696A0';
const BORDER_LIGHT = '#E9EDEF';
const INPUT_BG = '#F0F2F5';

// Dark theme neutrals
const BG_DARK = '#0B141A';
const CARD_DARK = '#1F2C34';
const BORDER_DARK = '#2A3942';

// Light theme – default like WhatsApp (light grey bg, white cards, grey text only)
export const lightColors = {
  background: CHAT_BG_LIGHT,
  card: CARD_WHITE,
  text: TEXT_DARK,
  textSecondary: TEXT_SECONDARY,
  textMuted: TEXT_MUTED,
  tint: TEXT_DARK,
  tintLight: TEXT_SECONDARY,
  border: BORDER_LIGHT,
  tabBar: CARD_WHITE,
  inputBg: INPUT_BG,
  danger: '#dc2626',
  success: TEXT_SECONDARY,
  statusBar: 'dark-content' as const,
  gradient1: [CHAT_BG_ALT, CHAT_BG_LIGHT] as [string, string],
  gradient2: [CHAT_BG_LIGHT, CHAT_BG_ALT] as [string, string],
  gradient3: [CHAT_BG_ALT, CHAT_BG_LIGHT] as [string, string],
  gradient4: [CHAT_BG_LIGHT, CHAT_BG_ALT] as [string, string],
  gradient5: [CHAT_BG_ALT, CHAT_BG_LIGHT] as [string, string],
};

// Dark theme – same default style, dark grey
export const darkColors = {
  background: BG_DARK,
  card: CARD_DARK,
  text: '#E9EDEF',
  textSecondary: '#8696A0',
  textMuted: '#667781',
  tint: '#E9EDEF',
  tintLight: '#8696A0',
  border: BORDER_DARK,
  tabBar: CARD_DARK,
  inputBg: BORDER_DARK,
  danger: '#f87171',
  success: '#8696A0',
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
