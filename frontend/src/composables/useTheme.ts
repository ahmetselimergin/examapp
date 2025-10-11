import { ref, computed, watch } from 'vue';

// Theme types
export type Theme = 'light' | 'dark' | 'auto';

// Global theme state
const currentTheme = ref<Theme>('light');
const systemPrefersDark = ref(false);

// Check system preference
const updateSystemPreference = () => {
  systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Initialize system preference
updateSystemPreference();

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateSystemPreference);
}

// Computed theme (resolves 'auto' to actual theme)
const resolvedTheme = computed(() => {
  if (currentTheme.value === 'auto') {
    return systemPrefersDark.value ? 'dark' : 'light';
  }
  return currentTheme.value;
});

// Apply theme to document
const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
};

// Load theme from localStorage
const loadTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('theme') as Theme;
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    return saved;
  }
  return 'light';
};

// Save theme to localStorage
const saveTheme = (theme: Theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
};

// Initialize theme
const initTheme = () => {
  const savedTheme = loadTheme();
  currentTheme.value = savedTheme;
  applyTheme(resolvedTheme.value);
};

// Watch for theme changes
watch(resolvedTheme, (newTheme) => {
  applyTheme(newTheme);
}, { immediate: false });

watch(currentTheme, (newTheme) => {
  saveTheme(newTheme);
}, { immediate: false });

export const useTheme = () => {
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme;
  };

  const toggleTheme = () => {
    if (currentTheme.value === 'light') {
      setTheme('dark');
    } else if (currentTheme.value === 'dark') {
      setTheme('auto');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme.value) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      case 'auto':
        return 'brightness_auto';
      default:
        return 'light_mode';
    }
  };

  const getThemeLabel = (t?: Function) => {
    if (!t) return currentTheme.value; // Fallback if no translation function
    
    switch (currentTheme.value) {
      case 'light':
        return t('settings.lightTheme');
      case 'dark':
        return t('settings.darkTheme');
      case 'auto':
        return t('settings.autoTheme');
      default:
        return t('settings.lightTheme');
    }
  };

  return {
    currentTheme: computed(() => currentTheme.value),
    resolvedTheme,
    systemPrefersDark: computed(() => systemPrefersDark.value),
    setTheme,
    toggleTheme,
    getThemeIcon,
    getThemeLabel,
    initTheme
  };
};
