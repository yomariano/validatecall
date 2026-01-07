import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

// Single light theme with white background
const theme = {
    name: 'Light',
    description: 'Clean white background',
    colors: {
        primary: '#3b82f6',
        accent: '#1e40af',
        success: '#059669',
        warning: '#d97706',
        info: '#0284c7',
        gradientStart: '#3b82f6',
        gradientMid: '#1e40af',
        gradientEnd: '#1e3a8a',
    },
};

export function ThemeProvider({ children }) {
    useEffect(() => {
        const root = document.documentElement;

        // Apply theme colors as CSS custom properties
        root.style.setProperty('--color-primary', theme.colors.primary);
        root.style.setProperty('--color-accent', theme.colors.accent);
        root.style.setProperty('--color-success', theme.colors.success);
        root.style.setProperty('--color-warning', theme.colors.warning);
        root.style.setProperty('--color-info', theme.colors.info);
        root.style.setProperty('--color-gradient-start', theme.colors.gradientStart);
        root.style.setProperty('--color-gradient-mid', theme.colors.gradientMid);
        root.style.setProperty('--color-gradient-end', theme.colors.gradientEnd);
        root.style.setProperty('--color-ring', theme.colors.primary);

        // Update glow shadows
        root.style.setProperty('--shadow-glow', `0 0 15px ${theme.colors.primary}33`);
        root.style.setProperty('--shadow-glow-success', `0 0 15px ${theme.colors.success}33`);
        root.style.setProperty('--shadow-glow-warning', `0 0 15px ${theme.colors.warning}33`);
        root.style.setProperty('--shadow-glow-info', `0 0 15px ${theme.colors.info}33`);
    }, []);

    const value = {
        theme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
