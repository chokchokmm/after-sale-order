# Auth Context Contract

**Date**: 2025-02-26
**Feature**: 001-simple-login

## Overview

认证上下文提供全局认证状态和操作方法。所有需要访问用户信息或检查登录状态的组件都应使用此上下文。

## Usage

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return <Spin />;
  }

  if (!user) {
    return <Button onClick={() => login({ username: 'test', password: '123456' })}>
      Login
    </Button>;
  }

  return (
    <div>
      <span>Hello, {user.username}</span>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

## API

### useAuth Hook

Returns: `AuthContextValue`

```typescript
interface AuthContextValue {
  // State
  user: User | null;      // Current logged-in user, null if not logged in
  isLoading: boolean;     // True while restoring session from localStorage

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}
```

### login(credentials)

Authenticate user with credentials.

**Parameters**:
```typescript
interface LoginCredentials {
  username: string;  // Any non-empty string
  password: string;  // Must be "123456"
}
```

**Returns**: `Promise<boolean>`
- `true`: Login successful
- `false`: Login failed (wrong password)

**Side Effects**:
- On success: Updates `user` state, persists to localStorage
- On failure: Does not modify state

**Example**:
```tsx
const handleLogin = async () => {
  const success = await login({ username: 'admin', password: '123456' });
  if (success) {
    message.success('登录成功');
    navigate('/');
  } else {
    message.error('密码错误');
  }
};
```

### logout()

Clear authentication state and remove persisted data.

**Parameters**: None

**Returns**: `void`

**Side Effects**:
- Sets `user` to `null`
- Removes data from localStorage

**Example**:
```tsx
const handleLogout = () => {
  logout();
  navigate('/login');
};
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Empty username | Form validation error, login not called |
| Empty password | Form validation error, login not called |
| Wrong password | Returns `false`, no state change |
| localStorage unavailable | Gracefully degrades, session not persisted |

## Type Definitions

```typescript
// types/auth.ts

interface User {
  username: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}
```
