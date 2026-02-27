---
title: refactor: 工单完成时才插入向量数据库
type: refactor
date: 2026-02-27
---

# refactor: 工单完成时才插入向量数据库

## Overview

修改工单向 Milvus 向量数据库插入数据的逻辑，改为只有在工单完成（状态变为 COMPLETED）时才插入 embedding 数据。移除创建工单和更新工单时的 embedding 插入逻辑，保持代码清晰完整。

## Problem Statement / Motivation

**当前问题：**
- 工单创建时立即插入向量数据，但此时工单可能还在处理中，没有处理详情
- 更新工单时也会更新向量数据，但只有完成的工单才有参考价值
- 向量搜索的目标是找到已完成的相似工单来提供处理建议，未完成的工单没有处理详情，无法提供参考

**改进目标：**
- 只有工单完成时（有完整的处理详情）才插入向量数据库
- 确保向量数据库中存储的都是有价值的已完成工单
- 减少不必要的 API 调用（智谱 AI embedding API）

## Proposed Solution

### 修改策略

1. **移除** `POST /tickets` 创建工单时的 embedding 插入逻辑
2. **移除** `PUT /tickets/{id}` 更新工单时的 embedding 插入逻辑
3. **添加** `POST /tickets/{id}/close` 关闭工单时的 embedding 插入逻辑

### 变更文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `backend/app/api/tickets.py` | 修改 | 移除创建/更新时的插入，添加关闭时的插入 |

## Technical Approach

### 1. 修改 `create_ticket` 端点

**文件：** `backend/app/api/tickets.py:32-45`

移除 embedding 插入代码块（第 36-44 行）：

```python
# 移除前
@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate):
    """Create a new ticket."""
    ticket = await ticket_service.create_ticket(ticket_data)
    # Store embedding for the new ticket (with category and system source)
    if ticket.id and ticket.description:
        await ai_service.store_ticket_embedding(
            ticket_id=ticket.id,
            description=ticket.description,
            category=ticket.category,
            system_source=ticket.systemSource,
            handle_type=ticket.handleType
        )
    return ticket

# 修改后
@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(ticket_data: TicketCreate):
    """Create a new ticket."""
    ticket = await ticket_service.create_ticket(ticket_data)
    return ticket
```

### 2. 修改 `update_ticket` 端点

**文件：** `backend/app/api/tickets.py:107-122`

移除 embedding 更新代码块（第 113-121 行）：

```python
# 移除前
@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: str, ticket_data: TicketUpdate):
    """Update a ticket."""
    ticket = await ticket_service.update_ticket(ticket_id, ticket_data)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    # Update embedding with all relevant fields
    if ticket.description:
        await ai_service.store_ticket_embedding(
            ticket_id=ticket_id,
            description=ticket.description,
            category=ticket.category,
            system_source=ticket.systemSource,
            handle_type=ticket.handleType
        )
    return ticket

# 修改后
@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: str, ticket_data: TicketUpdate):
    """Update a ticket."""
    ticket = await ticket_service.update_ticket(ticket_id, ticket_data)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket
```

### 3. 修改 `close_ticket` 端点

**文件：** `backend/app/api/tickets.py:125-131`

添加 embedding 插入逻辑：

```python
# 修改前
@router.post("/{ticket_id}/close", response_model=TicketResponse)
async def close_ticket(ticket_id: str):
    """Close a ticket."""
    ticket = await ticket_service.close_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket

# 修改后
@router.post("/{ticket_id}/close", response_model=TicketResponse)
async def close_ticket(ticket_id: str):
    """Close a ticket."""
    ticket = await ticket_service.close_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    # Store embedding when ticket is completed (has handle detail for future reference)
    if ticket.description:
        await ai_service.store_ticket_embedding(
            ticket_id=ticket_id,
            description=ticket.description,
            category=ticket.category,
            system_source=ticket.systemSource,
            handle_type=ticket.handleType
        )

    return ticket
```

## Acceptance Criteria

- [ ] 创建工单时不再插入向量数据
- [ ] 更新工单时不再更新向量数据
- [ ] 关闭工单（状态变为 COMPLETED）时插入向量数据
- [ ] 代码干净整洁，没有遗留的注释或无用代码
- [ ] 删除工单时仍然正常删除向量数据（现有逻辑保持不变）

## Success Metrics

- 向量数据库中只有 COMPLETED 状态的工单
- 减少不必要的智谱 AI API 调用
- 相似工单搜索结果更准确（都是有处理详情的工单）

## Dependencies & Risks

### Dependencies
- 无新依赖

### Risks
- **已存在的未完成工单**：如果后续完成，调用 close 接口会正常插入
- **历史数据**：已有的未完成工单 embedding 可以通过 `rebuild_embeddings.py` 脚本清理

## References & Research

### Internal References
- 向量插入核心方法: `backend/app/services/ai_service.py:85-111`
- Embedding 生成方法: `backend/app/services/ai_service.py:246-267`
- 关闭工单服务: `backend/app/services/ticket_service.py` (close_ticket 方法)

### Related Files
- `backend/scripts/rebuild_embeddings.py` - 批量重建 embedding 脚本（如需清理历史数据）
