import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Theme type
// 主题类型
export type Theme = 'light' | 'dark';

// Theme context value type
// 主题上下文值类型
export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

// Storage key for theme preference
// 主题偏好存储键
const THEME_STORAGE_KEY = 'ticket_system_theme';

// Create theme context with undefined default
// 创建主题上下文，默认值为 undefined
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme provider props
// Theme provider 属性
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component
 * Provides theme state and toggle function to app
 *
 * ThemeProvider 组件
 * 为应用提供主题状态和切换函数
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Restore theme from localStorage on initial load
    // 初始加载时从 localStorage 恢复主题
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch (error) {
      console.error('Failed to restore theme from localStorage:', error);
    }
    // Default to light theme
    // 默认浅色主题
    return 'light';
  });

  // Save theme to localStorage whenever it changes
  // 主题变化时保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }, [theme]);

  // Apply theme to document element for CSS variable support
  // 应用主题到 document 元素以支持 CSS 变量
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /**
   * Toggle between light and dark themes
   * 切换浅色和深色主题
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextValue = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme hook
 * Access theme context from any component
 *
 * useTheme 钩子
 * 从任何组件访问主题上下文
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
