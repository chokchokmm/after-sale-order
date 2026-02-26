# Tasks: 简单登录功能

**Input**: Design documents from `/specs/001-simple-login/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 未在规格中明确要求测试，因此不包含测试任务。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3）
- 描述中包含精确文件路径

## Path Conventions

- **Web app**: `frontend/src/` 路径

---

## Phase 1: Setup (项目设置)

**Purpose**: 创建必要的目录结构和类型定义

- [x] T001 创建 contexts 目录结构 `frontend/src/contexts/`
- [x] T002 [P] 创建认证类型定义 `frontend/src/types/auth.ts`

---

## Phase 2: Foundational (基础架构)

**Purpose**: 核心认证上下文，所有用户故事的依赖项

**⚠️ CRITICAL**: 此阶段必须完成后才能开始任何用户故事

- [x] T003 实现 AuthContext 上下文 `frontend/src/contexts/AuthContext.tsx`
- [x] T004 在 main.tsx 中包裹 AuthProvider `frontend/src/main.tsx`

**Checkpoint**: 基础认证架构就绪 - 可以开始用户故事实现

---

## Phase 3: User Story 1 - 用户登录系统 (Priority: P1) 🎯 MVP

**Goal**: 用户可以通过任意账号 + 固定密码(123456)登录系统，未登录用户被重定向到登录页

**Independent Test**: 访问系统任意页面 → 自动跳转登录页 → 输入账号和123456 → 登录成功跳转Dashboard

### Implementation for User Story 1

- [x] T005 [US1] 创建登录页面组件 `frontend/src/pages/Login.tsx`
- [x] T006 [US1] 创建 ProtectedRoute 路由保护组件 `frontend/src/components/ProtectedRoute.tsx`
- [x] T007 [US1] 修改 App.tsx 添加 /login 路由和路由保护 `frontend/src/App.tsx`

**Checkpoint**: 用户登录功能完整，可独立测试和演示

---

## Phase 4: User Story 2 - 查看当前登录用户 (Priority: P2)

**Goal**: 已登录用户可以在页面顶部导航栏看到当前登录的账号名称

**Independent Test**: 登录成功后，页面顶部导航栏显示用户名；刷新页面后用户名仍显示

### Implementation for User Story 2

- [x] T008 [US2] 修改 Layout.tsx 在 Header 显示用户名 `frontend/src/components/Layout.tsx`

**Checkpoint**: 用户身份显示功能完整，US1 和 US2 均可独立工作

---

## Phase 5: User Story 3 - 退出登录 (Priority: P3)

**Goal**: 已登录用户可以退出登录，清除登录状态并返回登录页

**Independent Test**: 点击退出按钮 → 跳转登录页 → 再次访问系统需重新登录

### Implementation for User Story 3

- [x] T009 [US3] 修改 Layout.tsx 添加退出登录按钮 `frontend/src/components/Layout.tsx`

**Checkpoint**: 所有用户故事完成，完整登录流程可独立测试

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨功能改进和验证

- [x] T010 验证完整登录流程（登录 → 显示用户名 → 退出）
- [x] T011 验证路由保护（未登录访问任意页面重定向到登录页）
- [x] T012 验证登录状态持久化（关闭浏览器重开后仍保持登录）
- [x] T013 [P] 更新类型导出文件 `frontend/src/types/index.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 全部依赖 Foundational 完成
  - 用户故事可并行进行（如有多人）
  - 或按优先级顺序进行（P1 → P2 → P3）
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational 完成后可开始 - 依赖 US1 的登录状态
- **User Story 3 (P3)**: Foundational 完成后可开始 - 依赖 US1 的登录状态

### Within Each User Story

- 组件实现 → 集成到现有组件 → 验证功能

### Parallel Opportunities

- T001 和 T002 可并行（不同文件）
- 用户故事 1、2、3 可并行（如果团队有多人）

---

## Parallel Example: Phase 1

```bash
# 可同时执行:
Task: "创建 contexts 目录结构 frontend/src/contexts/"
Task: "创建认证类型定义 frontend/src/types/auth.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL)
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 测试登录功能
5. 可部署/演示

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事独立增加价值

### Sequential Strategy (单人开发)

1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
2. 每个阶段完成后验证

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签将任务映射到特定用户故事
- 每个用户故事应可独立完成和测试
- 每个任务完成后提交
- 任何 checkpoint 处停止以独立验证故事
- 固定密码: 123456
- localStorage key: auth_user
