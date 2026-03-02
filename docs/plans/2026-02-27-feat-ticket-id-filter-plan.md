---
title: 添加工单 ID 筛选功能
type: feat
date: 2026-02-27
---

# 添加工单 ID 筛选功能

## Overview

在工单列表页面添加工单 ID (ticketId) 筛选功能，允许用户通过工单 ID 快速定位特定工单。

## Problem Statement

当前工单列表的筛选项包括：描述搜索、创建人、来源系统、工单类型、状态、优先级。但缺少工单 ID 筛选，用户无法通过工单 ID（如 `AS-20260227-21`）快速查找工单。

## Proposed Solution

参考现有的 `createdBy` 筛选实现，添加工单 ID 精确匹配筛选。

## Technical Approach

### 修改文件

1. **后端 Service 层** - `backend/app/services/ticket_service.py`
   - `get_tickets()` 方法添加 `ticket_id` 参数
   - 添加 `filter_query["id"] = ticket_id` 精确匹配条件

2. **后端 API 层** - `backend/app/api/tickets.py`
   - `get_tickets()` 端点添加 `ticketId` Query 参数

3. **前端类型定义** - `frontend/src/types/ticket.ts`
   - `TicketListParams` 接口添加 `ticketId?: string`

4. **前端页面** - `frontend/src/pages/TicketList.tsx`
   - 筛选表单添加工单 ID 输入框

## Acceptance Criteria

- [ ] 后端支持 `ticketId` 查询参数
- [ ] 前端筛选表单显示工单 ID 输入框
- [ ] 输入工单 ID 后能正确筛选出对应工单
- [ ] 清空工单 ID 筛选后恢复完整列表

## Implementation

### backend/app/services/ticket_service.py

```python
# get_tickets 方法添加参数
async def get_tickets(
    self,
    page: int = 1,
    page_size: int = 10,
    system_source: Optional[TicketSystemSource] = None,
    category: Optional[TicketCategory] = None,
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    search: Optional[str] = None,
    created_by: Optional[str] = None,
    ticket_id: Optional[str] = None,  # 新增
) -> tuple[List[Ticket], int]:
    # ...
    filter_query: Dict[str, Any] = {}

    # 现有条件...

    # 新增工单 ID 筛选
    if ticket_id:
        filter_query["id"] = ticket_id
```

### backend/app/api/tickets.py

```python
@router.get("", response_model=TicketListResponse)
async def get_tickets(
    # ... 现有参数
    ticketId: Optional[str] = Query(None, description="Filter by ticket ID"),
):
    tickets, total = await ticket_service.get_tickets(
        # ... 现有参数
        ticket_id=ticketId,
    )
```

### frontend/src/types/ticket.ts

```typescript
export interface TicketListParams {
  page: number;
  pageSize: number;
  systemSource?: TicketSystemSource;
  category?: TicketCategory;
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  createdBy?: string;
  ticketId?: string;  // 新增
}
```

### frontend/src/pages/TicketList.tsx

```tsx
{/* 在筛选表单中添加，建议放在 search 旁边 */}
<Col span={3}>
  <Input
    placeholder="工单 ID"
    allowClear
    value={params.ticketId}
    onChange={(e) => handleFilterChange("ticketId", e.target.value || undefined)}
    className="tech-input"
  />
</Col>
```

## References

- 现有筛选实现: `frontend/src/pages/TicketList.tsx:357-440`
- 后端 Service: `backend/app/services/ticket_service.py:97-140`
- 后端 API: `backend/app/api/tickets.py:52-83`
