# Implementation Plan: 简单登录功能

**Branch**: `001-simple-login` | **Date**: 2025-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-simple-login/spec.md`

## Summary

为售后工单管理系统添加简单的登录功能。用户可以通过任意账号 + 固定密码(123456)登录系统，登录后在导航栏显示当前用户名。由于是简单版本，登录验证仅在前端进行，使用 localStorage 存储登录状态。

## Technical Context

**Language/Version**: TypeScript 5.x + React 19
**Primary Dependencies**: React Router v6, Ant Design 5.x
**Storage**: localStorage (浏览器本地存储)
**Testing**: Vitest (可选)
**Target Platform**: Web (现代浏览器)
**Project Type**: web-service (前后端分离，本功能仅涉及前端)
**Performance Goals**: 登录操作 < 10秒
**Constraints**: 纯前端验证，无后端认证
**Scale/Scope**: 单用户会话管理

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| AI 优先的数据基础 | ✅ 通过 | 登录功能不涉及工单数据结构，不影响 AI 集成能力 |
| 分层架构 | ✅ 通过 | 本功能纯前端实现，不涉及后端分层 |
| 双语支持 | ✅ 通过 | UI 文本使用中文，代码注释使用英文 |
| Docker 优先的基础设施 | ✅ 通过 | 无新基础设施依赖 |
| 简单优于抽象 | ✅ 通过 | 使用最简单的 localStorage + React Context，无额外状态管理库 |

**Gate 结果**: ✅ 所有原则通过，无需复杂度说明

## Project Structure

### Documentation (this feature)

```text
specs/001-simple-login/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
frontend/src/
├── components/
│   └── Layout.tsx           # 修改：添加用户名显示和退出按钮
├── contexts/
│   └── AuthContext.tsx      # 新增：认证上下文
├── pages/
│   └── Login.tsx            # 新增：登录页面
├── api/
│   └── client.ts            # 可能修改：添加认证拦截器（可选）
├── types/
│   └── auth.ts              # 新增：认证相关类型
├── App.tsx                  # 修改：添加登录路由和路由保护
└── main.tsx                 # 修改：包裹 AuthProvider
```

**Structure Decision**: 在现有前端结构基础上扩展，新增 `contexts/` 目录存放认证上下文，新增 `Login.tsx` 页面，修改 `Layout.tsx` 和 `App.tsx` 集成登录功能。

## Complexity Tracking

> 无宪法违反，此部分为空

## Implementation Phases

### Phase 1: 认证上下文和类型定义

1. 创建 `types/auth.ts` - 定义用户和认证状态类型
2. 创建 `contexts/AuthContext.tsx` - 实现认证上下文、localStorage 读写、登录/登出逻辑

### Phase 2: 登录页面

3. 创建 `pages/Login.tsx` - 登录表单 UI，调用 AuthContext 的登录方法

### Phase 3: 路由保护

4. 修改 `App.tsx` - 添加 `/login` 路由，实现路由保护（未登录重定向）
5. 修改 `main.tsx` - 在根组件包裹 AuthProvider

### Phase 4: 用户显示和退出

6. 修改 `components/Layout.tsx` - 在 Header 显示用户名和退出按钮

### Phase 5: 集成测试

7. 验证完整登录流程
8. 验证路由保护
9. 验证登录状态持久化
