export type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeSettings = {
    theme?: ThemeMode;
};

const SETTINGS_KEY = 'ayra_settings';

const readThemeFromStorage = (): ThemeMode => {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return 'dark';

        const parsed = JSON.parse(raw) as ThemeSettings;
        return parsed.theme || 'dark';
    } catch {
        return 'dark';
    }
};

export const applyTheme = (theme: ThemeMode) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseLight = theme === 'light' || (theme === 'auto' && !prefersDark);
    document.documentElement.classList.toggle('light-theme', shouldUseLight);
};

export const initTheme = () => {
    const theme = readThemeFromStorage();
    applyTheme(theme);
};

export const updateTheme = (theme: ThemeMode) => {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        const current = raw ? JSON.parse(raw) : {};
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, theme }));
    } catch {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme }));
    }
    applyTheme(theme);
};
