---
title: refactor: 优先级字段改为 P0-P3 四级制
type: refactor
date: 2026-02-27
---

# 优先级字段重构：HIGH/MEDIUM/LOW → P0/P1/P2/P3

## Overview

将工单系统的优先级字段从 `HIGH/MEDIUM/LOW` 三级制改为 `P0/P1/P2/P3` 四级制，并在前端选择时显示含义描述，让用户能清楚理解每个级别的用途。

## Problem Statement / Motivation

当前系统的优先级使用 "高/中/低" 三级制，存在以下问题：
1. **语义不明确**：用户不清楚什么情况应该选择什么优先级
2. **缺乏标准**：没有统一的优先级判定标准
3. **粒度不够**：三类优先级难以区分紧急程度差异

新的 P0-P3 四级制参考行业标准，每个级别有明确的定义和适用场景。

## Priority Mapping

| 级别 | 含义 | 适用场景 | 前端显示 |
|------|------|----------|----------|
| P0 | 系统崩溃，功能失效 | 生产环境不可用，需立即处理 | P0 - 系统崩溃，功能失效 |
| P1 | 阻塞型BUG | 阻塞主流程，需优先处理 | P1 - 阻塞型BUG |
| P2 | 非主流程BUG | 不影响主流程，正常排期 | P2 - 非主流程BUG |
| P3 | 优化问题 | 体验优化，低优先级 | P3 - 优化问题 |

## Proposed Solution

### Backend Changes

1. **更新枚举定义** - `backend/app/models/ticket.py`
2. **更新 API 参数** - `backend/app/api/tickets.py`
3. **更新请求 Schema** - `backend/app/schemas/request.py`

### Frontend Changes

1. **更新类型定义** - `frontend/src/types/ticket.ts`
2. **更新配置映射** - `frontend/src/utils/index.ts`
3. **更新徽章组件** - `frontend/src/components/StatusBadge.tsx`
4. **更新表单选择器** - `frontend/src/pages/TicketForm.tsx`
5. **更新列表筛选器** - `frontend/src/pages/TicketList.tsx`
6. **更新详情显示** - `frontend/src/pages/TicketDetail.tsx`

### Documentation Updates

1. **更新项目说明** - `CLAUDE.md`
2. **更新 README** - `README.md`

## Technical Considerations

- **数据迁移**：由于是测试/新项目阶段，不需要迁移历史数据
- **后端/前端同步**：枚举字符串值必须完全匹配
- **颜色映射**：P0-P3 需要合理的颜色区分，保持视觉一致性

### 建议颜色方案

| 级别 | 颜色 | Badge 状态 |
|------|------|------------|
| P0 | #ff006e (粉红) | error |
| P1 | #ff4d4f (红) | error |
| P2 | #faad14 (橙) | warning |
| P3 | #52c41a (绿) | success |

## Acceptance Criteria

- [x] 后端枚举从 HIGH/MEDIUM/LOW 改为 P0/P1/P2/P3
- [x] 前端枚举从 HIGH/MEDIUM/LOW 改为 P0/P1/P2/P3
- [x] 前端配置更新，显示带含义的标签
- [x] StatusBadge 组件支持新的四个级别
- [x] TicketForm 选择器显示含义描述
- [x] TicketList 筛选器支持 P0-P3
- [x] TicketDetail 正确显示新优先级
- [x] API 文档更新（自动生成）
- [x] CLAUDE.md 和 README.md 更新

## Dependencies & Risks

- **依赖**：无外部依赖
- **风险**：如果数据库中已有数据，新系统启动后旧数据会显示异常（本项目处于测试阶段，可接受）

## References & Research

### Internal References

- 枚举定义: `backend/app/models/ticket.py:28-32`
- 前端类型: `frontend/src/types/ticket.ts:19-23`
- 配置映射: `frontend/src/utils/index.ts:14-21`
- 徽章组件: `frontend/src/components/StatusBadge.tsx:6,52-74`
- 表单选择: `frontend/src/pages/TicketForm.tsx:274-276`
- 列表筛选: `frontend/src/pages/TicketList.tsx:434-436`
- 头脑风暴: `docs/brainstorms/2026-02-27-priority-refactor-brainstorm.md`

### Related Work

- 参考模式: `docs/plans/2026-02-27-feat-add-creator-field-plan.md` (后端/前端同步模式)

---

## Implementation Details

### Phase 1: Backend Changes

#### 1.1 更新枚举定义

**文件**: `backend/app/models/ticket.py`

```python
# 修改前 (lines 28-32)
class TicketPriority(str, Enum):
    """Priority level of the ticket."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

# 修改后
class TicketPriority(str, Enum):
    """Priority level of the ticket.

    P0: 系统崩溃，功能失效 - 需立即处理
    P1: 阻塞型BUG - 需优先处理
    P2: 非主流程BUG - 正常排期
    P3: 优化问题 - 低优先级
    """
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
```

#### 1.2 更新请求 Schema

**文件**: `backend/app/schemas/request.py`

无需修改枚举引用，因为使用的是 `TicketPriority` 类型。

#### 1.3 更新 API 参数

**文件**: `backend/app/api/tickets.py`

无需修改枚举引用，因为使用的是 `TicketPriority` 类型。

### Phase 2: Frontend Changes

#### 2.1 更新类型定义

**文件**: `frontend/src/types/ticket.ts`

```typescript
// 修改前 (lines 19-23)
export enum TicketPriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

// 修改后
export enum TicketPriority {
  P0 = "P0",
  P1 = "P1",
  P2 = "P2",
  P3 = "P3"
}
```

#### 2.2 更新配置映射

**文件**: `frontend/src/utils/index.ts`

```typescript
// 修改前 (lines 14-21)
export const priorityConfig: Record<
  TicketPriority,
  { label: string; color: string; badge: string }
> = {
  [TicketPriority.HIGH]: { label: "高", color: "red", badge: "error" },
  [TicketPriority.MEDIUM]: { label: "中", color: "orange", badge: "warning" },
  [TicketPriority.LOW]: { label: "低", color: "green", badge: "default" },
};

// 修改后
export const priorityConfig: Record<
  TicketPriority,
  { label: string; color: string; badge: string; description: string }
> = {
  [TicketPriority.P0]: { label: "P0", color: "#ff006e", badge: "error", description: "系统崩溃，功能失效" },
  [TicketPriority.P1]: { label: "P1", color: "#ff4d4f", badge: "error", description: "阻塞型BUG" },
  [TicketPriority.P2]: { label: "P2", color: "#faad14", badge: "warning", description: "非主流程BUG" },
  [TicketPriority.P3]: { label: "P3", color: "#52c41a", badge: "success", description: "优化问题" },
};
```

#### 2.3 更新 StatusBadge 组件

**文件**: `frontend/src/components/StatusBadge.tsx`

```typescript
// 修改前 (line 6)
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW';

// 修改后
type PriorityType = 'P0' | 'P1' | 'P2' | 'P3';

// 修改前 (lines 52-74)
const getPriorityConfig = (p: PriorityType) => {
  const configs: Record<PriorityType, { color: string; bg: string; border: string; label: string }> = {
    HIGH: {
      color: '#ff006e',
      bg: 'rgba(255, 0, 110, 0.15)',
      border: 'rgba(255, 0, 110, 0.4)',
      label: '高',
    },
    MEDIUM: {
      color: '#00d4ff',
      bg: 'rgba(0, 212, 255, 0.15)',
      border: 'rgba(0, 212, 255, 0.4)',
      label: '中',
    },
    LOW: {
      color: '#6b7280',
      bg: 'rgba(107, 114, 128, 0.15)',
      border: 'rgba(107, 114, 128, 0.4)',
      label: '低',
    },
  };
  return configs[p];
};

// 修改后
const getPriorityConfig = (p: PriorityType) => {
  const configs: Record<PriorityType, { color: string; bg: string; border: string; label: string }> = {
    P0: {
      color: '#ff006e',
      bg: 'rgba(255, 0, 110, 0.15)',
      border: 'rgba(255, 0, 110, 0.4)',
      label: 'P0',
    },
    P1: {
      color: '#ff4d4f',
      bg: 'rgba(255, 77, 79, 0.15)',
      border: 'rgba(255, 77, 79, 0.4)',
      label: 'P1',
    },
    P2: {
      color: '#faad14',
      bg: 'rgba(250, 173, 20, 0.15)',
      border: 'rgba(250, 173, 20, 0.4)',
      label: 'P2',
    },
    P3: {
      color: '#52c41a',
      bg: 'rgba(82, 196, 26, 0.15)',
      border: 'rgba(82, 196, 26, 0.4)',
      label: 'P3',
    },
  };
  return configs[p];
};
```

#### 2.4 更新 TicketForm 选择器

**文件**: `frontend/src/pages/TicketForm.tsx`

```typescript
// 修改前 (line 220)
priority: TicketPriority.MEDIUM

// 修改后
priority: TicketPriority.P2  // 默认使用 P2（非主流程BUG）

// 修改前 (lines 274-276)
<Option value={TicketPriority.HIGH}>高</Option>
<Option value={TicketPriority.MEDIUM}>中</Option>
<Option value={TicketPriority.LOW}>低</Option>

// 修改后
<Option value={TicketPriority.P0}>P0 - 系统崩溃，功能失效</Option>
<Option value={TicketPriority.P1}>P1 - 阻塞型BUG</Option>
<Option value={TicketPriority.P2}>P2 - 非主流程BUG</Option>
<Option value={TicketPriority.P3}>P3 - 优化问题</Option>
```

#### 2.5 更新 TicketList 筛选器

**文件**: `frontend/src/pages/TicketList.tsx`

```typescript
// 修改前 (lines 434-436)
<Option value="HIGH">高</Option>
<Option value="MEDIUM">中</Option>
<Option value="LOW">低</Option>

// 修改后
<Option value="P0">P0 - 系统崩溃，功能失效</Option>
<Option value="P1">P1 - 阻塞型BUG</Option>
<Option value="P2">P2 - 非主流程BUG</Option>
<Option value="P3">P3 - 优化问题</Option>
```

### Phase 3: Documentation Updates

#### 3.1 更新 CLAUDE.md

在 "Key Domain Concepts" 部分更新优先级说明：

```markdown
**Ticket System:**
- Priorities: P0 (系统崩溃，功能失效), P1 (阻塞型BUG), P2 (非主流程BUG), P3 (优化问题)
```

#### 3.2 更新 README.md

更新优先级相关的说明（如果有）。

---

## Test Plan

1. **后端测试**
   - [x] 启动后端服务，访问 `/docs` 确认 API 文档显示新的枚举值
   - [x] 创建工单时选择各个优先级，确认保存正确
   - [x] 按优先级筛选工单，确认筛选正确

2. **前端测试**
   - [x] 创建工单时，选择器显示带含义的选项
   - [x] 工单列表中优先级徽章显示正确
   - [x] 筛选器按优先级筛选正常工作
   - [x] 工单详情页优先级显示正确

3. **集成测试**
   - [x] 前后端枚举值一致
   - [x] API 请求/响应格式正确
