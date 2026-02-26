# Data Model: 简单登录功能

**Date**: 2025-02-26
**Feature**: 001-simple-login

## 实体定义

### User (用户)

当前登录用户信息，仅存储于客户端。

```typescript
interface User {
  username: string;    // 用户名（登录时输入的任意非空字符串）
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户显示名称，登录时输入 |

### LoginCredentials (登录凭证)

登录时提交的数据结构。

```typescript
interface LoginCredentials {
  username: string;    // 任意非空字符串
  password: string;    // 必须为 "123456"
}
```

**验证规则**:
| 字段 | 验证规则 |
|------|----------|
| username | 必填，非空字符串 |
| password | 必填，必须等于 "123456" |

### AuthState (认证状态)

React Context 中的认证状态结构。

```typescript
interface AuthState {
  user: User | null;           // 当前用户，null 表示未登录
  isLoading: boolean;          // 加载状态（从 localStorage 恢复时）
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;  // 登录方法
  logout: () => void;                                          // 登出方法
}
```

## 状态流转

```
┌─────────────┐     login()      ┌─────────────┐
│  未登录     │ ──────────────► │   已登录    │
│  user: null │                  │ user: {...} │
└─────────────┘                  └─────────────┘
       ▲                                │
       │         logout()               │
       └────────────────────────────────┘
```

## 持久化存储

### localStorage Schema

**Key**: `auth_user`

**Value**: JSON stringified `User` object

```json
{
  "username": "张三"
}
```

**生命周期**:
- 写入: 登录成功时
- 读取: 应用初始化时（恢复登录状态）
- 删除: 登出时

## 关系图

```
┌──────────────────────────────────────────────────────────┐
│                    AuthContext                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  AuthState                                          │  │
│  │  - user: User | null                               │  │
│  │  - isLoading: boolean                              │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Actions                                            │  │
│  │  - login(credentials) → boolean                    │  │
│  │  - logout() → void                                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │    localStorage     │
              │  Key: "auth_user"   │
              │  Value: User JSON   │
              └─────────────────────┘
```

## 无后端数据

本功能为纯前端实现，不涉及：
- 数据库用户表
- 后端认证 API
- Token/Session 管理
