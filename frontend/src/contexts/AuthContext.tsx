import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  AuthUser,
  LoginCredentials,
  AuthContextValue,
} from '../types/auth';
import {
  AUTH_STORAGE_KEY,
  FIXED_PASSWORD,
} from '../types/auth';

// Create auth context with undefined default
// 创建认证上下文，默认值为 undefined
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Auth provider props
// Auth provider 属性
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Provides authentication state and actions to the app
 *
 * AuthProvider 组件
 * 为应用提供认证状态和操作
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on mount
  // 组件挂载时从 localStorage 恢复用户
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setUser(parsedUser);
      }
    } catch (error) {
      // If localStorage is corrupted, clear it
      // 如果 localStorage 数据损坏，清除它
      console.error('Failed to restore user from localStorage:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with credentials
   * Validates password against fixed value and stores user on success
   *
   * 使用凭证登录
   * 验证密码是否为固定值，成功时存储用户
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Validate password
    // 验证密码
    if (credentials.password !== FIXED_PASSWORD) {
      return false;
    }

    // Create user object
    // 创建用户对象
    const newUser: AuthUser = {
      username: credentials.username,
    };

    // Persist to localStorage
    // 持久化到 localStorage
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (error) {
      console.error('Failed to persist user to localStorage:', error);
      // Continue even if localStorage fails
      // 即使 localStorage 失败也继续
    }

    // Update state
    // 更新状态
    setUser(newUser);
    return true;
  };

  /**
   * Logout and clear state
   * Removes user from state and localStorage
   *
   * 退出登录并清除状态
   * 从状态和 localStorage 中移除用户
   */
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook
 * Access authentication context from any component
 *
 * useAuth 钩子
 * 从任何组件访问认证上下文
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
