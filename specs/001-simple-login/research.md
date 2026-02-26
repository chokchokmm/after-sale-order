# Research: 简单登录功能

**Date**: 2025-02-26
**Feature**: 001-simple-login

## 研究任务

### 1. React Context + localStorage 认证模式

**Decision**: 使用 React Context API + localStorage 实现简单认证

**Rationale**:
- 符合项目宪法"简单优于抽象"原则
- 无需引入额外状态管理库（Redux、Zustand 等）
- localStorage 提供持久化存储，浏览器关闭后状态保持
- React Context 足以处理简单的用户状态共享

**Alternatives Considered**:
- Redux Toolkit: 过于复杂，不适合简单登录场景
- Zustand: 轻量但引入新依赖，localStorage 仍需手动处理
- Session Storage: 不满足"浏览器关闭后保持状态"需求

### 2. React Router v6 路由保护模式

**Decision**: 使用包装组件（ProtectedRoute）实现路由保护

**Rationale**:
- React Router v6 推荐模式
- 代码简洁，易于理解
- 可复用于多个需要保护的路由

**Implementation Pattern**:
```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

**Alternatives Considered**:
- useNavigate 在每个组件中检查: 代码重复，难以维护
- 自定义 Router: 过度设计

### 3. Ant Design 登录表单最佳实践

**Decision**: 使用 Ant Design Form + Input 组件构建登录表单

**Rationale**:
- 与项目现有 UI 库一致
- 内置表单验证和错误提示
- 响应式布局支持

**Key Components**:
- `Form` - 表单容器
- `Form.Item` - 表单项（带标签和验证）
- `Input` - 账号输入框
- `Input.Password` - 密码输入框（自动密文显示）
- `Button` - 提交按钮
- `message` - 错误提示

### 4. localStorage 数据结构

**Decision**: 存储最小化用户信息

**Data Structure**:
```typescript
interface StoredUser {
  username: string;
  loginAt: string; // ISO timestamp
}
```

**Storage Key**: `auth_user`

**Rationale**:
- 仅存储必要信息
- ISO 格式时间戳便于调试和潜在扩展
- 简单 JSON 结构，易于读写

## 技术决策汇总

| 决策点 | 选择 | 原因 |
|--------|------|------|
| 状态管理 | React Context | 简单、无额外依赖 |
| 持久化 | localStorage | 浏览器关闭后保持状态 |
| 路由保护 | ProtectedRoute 包装组件 | React Router v6 推荐模式 |
| UI 组件 | Ant Design Form/Input | 项目统一 UI 库 |
| 密码显示 | Input.Password | 自动密文，内置切换按钮 |

## 无需澄清项

所有技术决策均基于规格说明和项目宪法做出，无 NEEDS CLARIFICATION 项。
