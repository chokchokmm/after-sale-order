---
title: feat: 添加创建人字段功能
type: feat
date: 2026-02-27
---

# 添加创建人字段功能

## Overview

为工单系统添加"创建人"(createdBy) 字段的完整支持，包括必填验证、自动填充、手动修改、列表展示和模糊搜索筛选。

## 关键发现

**`createdBy` 字段已存在于模型中**，但以下功能缺失：
- `TicketCreate` schema 不包含 `createdBy`，无法在创建时传递
- API 端点不接收 `createdBy` 参数
- 列表筛选不支持按创建人过滤
- 前端表单没有创建人输入字段
- 列表页没有创建人列和筛选器

## Problem Statement / Motivation

当前工单系统缺少创建人追踪功能，无法知道工单是由谁创建的。业务需要：
1. 追踪工单创建责任人
2. 按创建人筛选工单
3. 支持模糊搜索创建人

## Proposed Solution

采用分层实现方式：
1. **后端**：扩展 schema 和 API 支持创建人字段的创建、更新和筛选
2. **前端**：表单自动填充、列表展示、筛选器支持

## Technical Considerations

### 认证机制
当前系统使用简单的 localStorage 存储用户名，无 JWT 或 session。创建人字段通过请求体传递，不依赖后端认证。

### 现有数据处理
数据库中已存在 `createdBy` 为 null 的工单，需要：
- 显示时使用"未知"占位符
- 筛选时正确处理 null 值

### 模糊搜索
使用 MongoDB 的 `$regex` 实现大小写不敏感的模糊匹配。

## Acceptance Criteria

### 功能需求

- [ ] 创建人字段在新建工单表单中可见
- [ ] 创建人字段为必填项，验证不允许为空
- [ ] 登录用户自动填充创建人字段
- [ ] 用户可以手动修改创建人值
- [ ] 工单列表展示"创建人"列
- [ ] 筛选器支持按创建人模糊搜索
- [ ] 现有无创建人的工单显示"未知"

### 技术需求

- [ ] 后端 schema 包含 `createdBy` 字段
- [ ] API 支持创建人筛选参数
- [ ] TypeScript 类型定义完整
- [ ] 表单验证规则生效

## Implementation Plan

### Phase 1: Backend Schema & Service

#### 1.1 更新 Ticket Schema

**文件**: `backend/app/models/ticket.py`

```python
# TicketCreate 添加 createdBy (line ~69-80)
class TicketCreate(BaseModel):
    systemSource: TicketSystemSource
    category: TicketCategory
    description: str
    handleType: TicketHandleType
    priority: TicketPriority
    tags: List[str] = Field(default_factory=list)
    solutionTemplate: Optional[str] = None
    createdBy: Optional[str] = None  # 新增：创建人

# TicketUpdate 添加 createdBy (line ~82-94)
class TicketUpdate(BaseModel):
    systemSource: Optional[TicketSystemSource] = None
    category: Optional[TicketCategory] = None
    description: Optional[str] = None
    handleType: Optional[TicketHandleType] = None
    handleDetail: Optional[str] = None
    priority: Optional[TicketPriority] = None
    status: Optional[TicketStatus] = None
    tags: Optional[List[str]] = None
    solutionTemplate: Optional[str] = None
    createdBy: Optional[str] = None  # 新增：允许修改创建人
```

#### 1.2 更新 Ticket Service

**文件**: `backend/app/services/ticket_service.py`

```python
# get_tickets 方法添加 created_by 参数 (line ~73-113)
async def get_tickets(
    self,
    page: int = 1,
    page_size: int = 10,
    system_source: Optional[TicketSystemSource] = None,
    category: Optional[TicketCategory] = None,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    search: Optional[str] = None,
    created_by: Optional[str] = None  # 新增参数
) -> tuple[List[Ticket], int]:
    """Get tickets with filtering and pagination."""
    collection = await get_collection("tickets")

    filter_query: Dict[str, Any] = {}

    # ... 现有筛选条件 ...

    # 新增：创建人模糊搜索
    if created_by:
        filter_query["createdBy"] = {"$regex": created_by, "$options": "i"}

    # ... 其余代码不变 ...
```

#### 1.3 更新 Ticket API

**文件**: `backend/app/api/tickets.py`

```python
# get_tickets 端点添加 createdBy 参数 (line ~39-68)
@router.get("", response_model=TicketListResponse)
async def get_tickets(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(10, ge=1, le=100, description="Page size"),
    systemSource: Optional[TicketSystemSource] = Query(None, description="Filter by system source"),
    category: Optional[TicketCategory] = Query(None, description="Filter by category"),
    status: Optional[TicketStatus] = Query(None, description="Filter by status"),
    priority: Optional[TicketPriority] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in description"),
    createdBy: Optional[str] = Query(None, description="Filter by creator (fuzzy match)")  # 新增
):
    """Get tickets with filtering and pagination."""
    tickets, total = await ticket_service.get_tickets(
        page=page,
        page_size=pageSize,
        system_source=systemSource,
        category=category,
        status=status,
        priority=priority,
        search=search,
        created_by=createdBy  # 新增
    )
    # ...
```

### Phase 2: Frontend Types

#### 2.1 更新 TypeScript 类型定义

**文件**: `frontend/src/types/ticket.ts`

```typescript
// TicketCreate 接口 (line ~56-66)
export interface TicketCreate {
  systemSource: TicketSystemSource;
  category: TicketCategory;
  description: string;
  handleType: TicketHandleType;
  priority: TicketPriority;
  tags?: string[];
  solutionTemplate?: string;
  createdBy?: string;  // 新增
}

// TicketUpdate 接口 (line ~68-79)
export interface TicketUpdate {
  systemSource?: TicketSystemSource;
  category?: TicketCategory;
  description?: string;
  handleType?: TicketHandleType;
  handleDetail?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  tags?: string[];
  solutionTemplate?: string;
  createdBy?: string;  // 新增
}

// TicketListParams 接口 (line ~81-89)
export interface TicketListParams {
  page: number;
  pageSize: number;
  systemSource?: TicketSystemSource;
  category?: TicketCategory;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  createdBy?: string;  // 新增
}
```

### Phase 3: Frontend Form

#### 3.1 添加创建人输入字段

**文件**: `frontend/src/pages/TicketForm.tsx`

```typescript
// 导入 useAuth hook
import { useAuth } from "../contexts/AuthContext";

const TicketForm = () => {
  // 获取当前用户
  const { user } = useAuth();

  // 初始化时自动填充创建人
  useEffect(() => {
    if (!isEdit && user?.username) {
      form.setFieldsValue({ createdBy: user.username });
    }
  }, [user, isEdit, form]);

  // 在表单中添加创建人字段（在"来源系统"之前）
  <Form.Item
    label={<span className="tech-form-label">创建人</span>}
    name="createdBy"
    rules={[{ required: true, message: "请输入创建人" }]}
  >
    <Input
      placeholder="请输入创建人"
      className="tech-input"
    />
  </Form.Item>
}
```

### Phase 4: Frontend List

#### 4.1 添加创建人列

**文件**: `frontend/src/pages/TicketList.tsx`

```typescript
// columns 数组添加创建人列（在"状态"之后）
{
  title: "创建人",
  dataIndex: "createdBy",
  key: "createdBy",
  width: 100,
  render: (value) => (
    <span className="tech-creator-cell">
      {value || "未知"}
    </span>
  ),
}

// 添加筛选器（在筛选行中）
<Col span={4}>
  <Input
    placeholder="创建人"
    value={params.createdBy}
    onChange={(e) => handleFilterChange("createdBy", e.target.value || undefined)}
    allowClear
    className="tech-input"
  />
</Col>
```

## Dependencies & Risks

### Dependencies
- 无外部依赖
- 依赖现有 localStorage 认证机制

### Risks
- **数据一致性**：现有工单 `createdBy` 为 null，需前端处理显示
- **输入验证**：需防止空白字符串通过验证

## File Change Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `backend/app/models/ticket.py` | Modify | Add `createdBy` to `TicketCreate` and `TicketUpdate` |
| `backend/app/services/ticket_service.py` | Modify | Add `created_by` filter parameter |
| `backend/app/api/tickets.py` | Modify | Add `createdBy` query parameter |
| `frontend/src/types/ticket.ts` | Modify | Add `createdBy` to interfaces |
| `frontend/src/pages/TicketForm.tsx` | Modify | Add creator input field with auto-populate |
| `frontend/src/pages/TicketList.tsx` | Modify | Add creator column and filter |
| `frontend/src/api/tickets.ts` | Modify | Update API params type |

## Testing Checklist

- [ ] 新建工单：创建人自动填充当前用户名
- [ ] 新建工单：可手动修改创建人
- [ ] 新建工单：创建人为空时验证失败
- [ ] 编辑工单：创建人正确显示和可修改
- [ ] 列表页：创建人列正确显示
- [ ] 列表页：无创建人的工单显示"未知"
- [ ] 筛选：按创建人模糊搜索正常工作
- [ ] 筛选：大小写不敏感搜索正常工作

## References

- 现有模型: `backend/app/models/ticket.py:49-66`
- 现有筛选: `backend/app/services/ticket_service.py:73-113`
- 认证上下文: `frontend/src/contexts/AuthContext.tsx`
