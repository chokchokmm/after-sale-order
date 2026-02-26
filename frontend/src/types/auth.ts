/**
 * Authentication type definitions
 * 认证相关类型定义
 */

// Current logged-in user info
// 当前登录用户信息
export interface AuthUser {
  username: string;
}

// Login credentials submitted by user
// 用户提交的登录凭证
export interface LoginCredentials {
  username: string;
  password: string;
}

// Authentication context value
// 认证上下文值
export interface AuthContextValue {
  // State
  user: AuthUser | null;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

// localStorage key for persisting user
// 持久化用户的 localStorage 键
export const AUTH_STORAGE_KEY = 'auth_user';

// Fixed password for simple authentication
// 简单认证的固定密码
export const FIXED_PASSWORD = '123456';
