---
title: feat: 智能客服功能
type: feat
date: 2026-02-28
---

# 智能客服功能

## Overview

在工单表单页（新建模式）右下角添加智能客服入口，帮助内部售后人员在创建工单前自助解决问题。通过 AI 多轮对话引导用户描述问题，查询向量数据库中的相似已完成工单，生成智能推荐，减少不必要的工单创建。

## Problem Statement

当前系统在创建工单前没有自助解决问题的入口，售后人员遇到问题直接创建工单，可能导致：
- 重复问题多次创建工单
- 历史已解决的问题无法快速复用
- 工单量大，处理效率低

## Proposed Solution

添加智能客服功能，在用户创建工单前引导其描述问题，通过向量搜索匹配历史相似工单，提供解决方案参考。如果问题得到解决，记录"自助解决"事件；否则引导用户继续创建工单（预填充问题描述）。

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
├─────────────────────────────────────────────────────────────────┤
│  TicketForm (新建模式)                                           │
│  └── SmartAssistant (右下角悬浮)                                 │
│       ├── ChatPanel (对话面板)                                   │
│       │   ├── ChatMessage (消息列表)                             │
│       │   ├── ProblemSummary (问题确认)                          │
│       │   └── SearchResult (推荐结果 + 相似工单卡片)              │
│       └── ActionButtons (已解决/创建工单)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                  │
├─────────────────────────────────────────────────────────────────┤
│  /api/chat/sessions          POST   创建对话会话                 │
│  /api/chat/sessions/{id}     GET    获取对话历史                 │
│  /api/chat/sessions/{id}/messages  POST   发送消息               │
│  /api/chat/sessions/{id}/confirm   POST   确认问题，触发搜索     │
│  /api/chat/sessions/{id}/resolve   POST   标记已解决             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (chat_sessions, self_service_records)                  │
│  Milvus (向量搜索)                                               │
│  Zhipu AI (GLM-4-Flash)                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Model

#### ChatSession (对话会话)

```python
# backend/app/models/chat.py

class ChatStatus(str, Enum):
    COLLECTING = "collecting"      # 收集问题中
    CONFIRMING = "confirming"      # 等待用户确认
    SEARCHING = "searching"        # 搜索中
    RECOMMENDED = "recommended"    # 已推荐
    RESOLVED = "resolved"          # 已解决
    CANCELLED = "cancelled"        # 已取消

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SimilarTicket(BaseModel):
    id: str
    description: str
    handleDetail: str
    score: float

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    messages: List[ChatMessage] = Field(default_factory=list)
    problemSummary: Optional[str] = None      # AI 总结的问题描述
    status: ChatStatus = ChatStatus.COLLECTING
    similarTickets: List[SimilarTicket] = Field(default_factory=list)
    recommendation: Optional[str] = None       # AI 推荐的处理建议
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
```

#### SelfServiceRecord (自助解决记录)

```python
# backend/app/models/chat.py

class SelfServiceRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    userId: str
    problemSummary: str
    similarTicketIds: List[str] = Field(default_factory=list)
    resolvedAt: datetime = Field(default_factory=datetime.utcnow)
```

#### MongoDB TTL 索引

```javascript
// MongoDB shell
db.chat_sessions.createIndex(
  { "createdAt": 1 },
  { expireAfterSeconds: 86400 }  // 1天 = 24 * 60 * 60
)
```

### API Design

#### POST /api/chat/sessions

创建新对话会话

```typescript
// Request
{}

// Response
{
  "id": "uuid",
  "userId": "user123",
  "messages": [
    {
      "role": "assistant",
      "content": "你好！我是智能客服助手。请描述你遇到的问题，我会帮你查找解决方案。",
      "timestamp": "2026-02-28T10:00:00Z"
    }
  ],
  "status": "collecting",
  "createdAt": "2026-02-28T10:00:00Z"
}
```

#### POST /api/chat/sessions/{id}/messages

发送消息，获取 AI 回复

```typescript
// Request
{
  "content": "TMS系统登录后页面一直加载中"
}

// Response
{
  "message": {
    "role": "assistant",
    "content": "我来确认一下：你遇到的是 TMS 系统登录后页面无法正常显示的问题，对吗？能告诉我这种情况是什么时候开始的吗？",
    "timestamp": "2026-02-28T10:01:00Z"
  },
  "session": {
    "status": "collecting",
    "problemSummary": "TMS系统登录后页面一直加载中"
  }
}
```

当 AI 判断信息充分时：

```typescript
// Response (AI 判断信息充分)
{
  "message": {
    "role": "assistant",
    "content": "我理解了你的问题。让我确认一下：\n\n**问题描述**：TMS系统登录后页面一直加载中，从今天上午开始出现，已尝试清除缓存但无效。\n\n这个总结准确吗？",
    "timestamp": "2026-02-28T10:02:00Z"
  },
  "session": {
    "status": "confirming",
    "problemSummary": "TMS系统登录后页面一直加载中，从今天上午开始出现，已尝试清除缓存但无效"
  }
}
```

#### POST /api/chat/sessions/{id}/confirm

用户确认问题总结，触发搜索

```typescript
// Request
{
  "confirmed": true,
  "modification": null  // 如果用户要修改，传入修改内容
}

// Response
{
  "status": "recommended",
  "recommendation": "根据相似工单的处理经验，建议按以下步骤排查：\n\n1. 检查 TMS 服务器状态...\n2. 确认网络连接...\n3. 尝试...",
  "similarTickets": [
    {
      "id": "AS-20260225-01",
      "description": "TMS登录后白屏",
      "handleDetail": "清理浏览器缓存，重新登录...",
      "score": 0.89
    }
  ]
}
```

无相似工单时：

```typescript
// Response (无相似工单)
{
  "status": "recommended",
  "recommendation": "暂无相似的历史工单可参考，建议直接创建工单。",
  "similarTickets": []
}
```

#### POST /api/chat/sessions/{id}/resolve

标记为已解决

```typescript
// Request
{}

// Response
{
  "success": true,
  "message": "已记录自助解决"
}
```

### Frontend Components

#### SmartAssistant 主组件

```typescript
// frontend/src/components/SmartAssistant/SmartAssistant.tsx

interface SmartAssistantProps {
  onProblemResolved?: () => void;
  onCreateTicket?: (description: string) => void;
}

// 状态
const [isOpen, setIsOpen] = useState(false);
const [session, setSession] = useState<ChatSession | null>(null);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [inputValue, setInputValue] = useState('');
const [loading, setLoading] = useState(false);
```

#### 对话状态机

```
┌────────────┐  发送消息   ┌────────────┐
│ COLLECTING │ ──────────► │ COLLECTING │ (信息不充分，继续追问)
└────────────┘             └────────────┘
      │
      │ AI 判断信息充分
      ▼
┌────────────┐  用户确认   ┌────────────┐
│ CONFIRMING │ ──────────► │ SEARCHING  │
└────────────┘             └────────────┘
                                │
                                │ 搜索完成
                                ▼
                          ┌────────────┐
                          │ RECOMMENDED │
                          └────────────┘
                           │         │
              已解决        │         │ 创建工单
                           ▼         ▼
                    ┌──────────┐ ┌──────────┐
                    │ RESOLVED │ │ CANCELLED│
                    └──────────┘ └──────────┘
```

### Prompt Design

#### 对话引导 Prompt

```python
CHAT_PROMPT = """你是一个售后工单系统的智能客服助手。

你的任务是：
1. 引导用户描述他们遇到的问题
2. 收集必要的信息（问题现象、发生时间、已尝试的操作等）
3. 当信息充分时，总结问题并请用户确认

对话规则：
- 使用简洁友好的语言
- 如果用户描述不清晰，礼貌地追问
- 不要猜测或编造信息
- 当你认为信息充分时，用以下格式总结：
  **问题总结**：[总结内容]
  请用户确认这个总结是否准确

当前对话历史：
{conversation_history}

用户最新消息：{user_message}
"""
```

#### 推荐生成 Prompt

```python
RECOMMENDATION_PROMPT = """基于以下相似工单的处理经验，为用户生成问题解决建议。

用户问题：{problem_summary}

相似工单：
{similar_tickets}

要求：
1. 如果有相似工单，总结处理步骤，给出可操作的建议
2. 如果没有相似工单，回复"暂无相似的历史工单可参考，建议直接创建工单"
3. 不能编造解决方案
4. 使用简洁的列表格式

请生成建议：
"""
```

## Acceptance Criteria

### Functional Requirements

- [ ] 在新建工单页面右下角显示智能客服浮动按钮
- [ ] 点击按钮展开对话面板，显示欢迎消息
- [ ] 用户可以输入文字与 AI 多轮对话
- [ ] AI 能够判断问题描述是否充分
- [ ] AI 总结问题后，用户可以确认或修改
- [ ] 确认后搜索向量数据库，返回相似工单
- [ ] 展示 AI 推荐文字 + 相似工单卡片列表
- [ ] 相似工单卡片可点击，跳转到工单详情页
- [ ] 用户可以选择"已解决"，记录自助解决事件
- [ ] 用户可以选择"创建工单"，预填充问题描述到表单
- [ ] 无相似工单时，直接建议创建工单
- [ ] 对话历史保留 1 天，自动清理

### Non-Functional Requirements

- [ ] AI 响应时间 < 5 秒
- [ ] 对话面板 UI 复用现有科技风深色主题
- [ ] 支持移动端显示（响应式）

### Quality Gates

- [ ] 所有 API 端点有错误处理
- [ ] 前端有 loading 状态和错误提示
- [ ] MongoDB TTL 索引正确配置

## Success Metrics

1. **自助解决率**：自助解决数 / (自助解决数 + 创建工单数)
2. **平均对话轮次**：用户从开始到确认问题的平均消息数
3. **推荐点击率**：点击相似工单卡片的次数 / 展示次数

## Dependencies & Prerequisites

- MongoDB TTL 索引配置
- 现有 ai_service.py 的向量搜索能力
- 现有向量数据库中有已完成的工单数据

## Risk Analysis & Mitigation

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| AI 响应超时 | 中 | 用户体验差 | 设置超时保护，显示重试选项 |
| 向量库为空 | 低 | 无推荐结果 | 显示友好提示，建议创建工单 |
| 对话数据膨胀 | 低 | 存储成本 | TTL 索引自动清理 |

## Implementation Phases

### Phase 1: 后端基础

**目标**: 实现对话会话 API

**任务**:
- [ ] 创建 `backend/app/models/chat.py` - 数据模型
- [ ] 创建 `backend/app/api/chat.py` - API 路由
- [ ] 创建 `backend/app/services/chat_service.py` - 对话逻辑
- [ ] 配置 MongoDB TTL 索引
- [ ] 注册 chat 路由到 main.py

**验证**: API 端点可通过 Postman 测试

### Phase 2: AI 对话能力

**目标**: 实现 AI 多轮对话和推荐生成

**任务**:
- [ ] 实现对话引导 Prompt
- [ ] 实现信息充分性判断逻辑
- [ ] 实现问题总结生成
- [ ] 复用 find_similar_tickets() 搜索相似工单
- [ ] 实现推荐生成 Prompt

**验证**: 对话能够正确判断、总结、搜索、推荐

### Phase 3: 前端组件

**目标**: 实现智能客服 UI

**任务**:
- [ ] 创建 `SmartAssistant` 主组件
- [ ] 创建 `ChatPanel` 对话面板
- [ ] 创建 `ChatMessage` 消息组件
- [ ] 创建 `ProblemSummary` 确认卡片
- [ ] 创建 `SearchResult` 推荐结果
- [ ] 创建 `SimilarTicketCard` 工单卡片
- [ ] 创建 `chat.ts` API 调用
- [ ] 在 TicketForm (新建模式) 集成

**验证**: UI 交互完整，流程顺畅

### Phase 4: 仪表盘统计

**目标**: 在仪表盘展示自助解决统计

**任务**:
- [ ] 创建 `/api/stats/self-service` 端点
- [ ] 修改 Dashboard.tsx 添加统计卡片
- [ ] 展示自助解决数量和解决率

**验证**: 仪表盘显示统计数据

## Files to Create/Modify

### 新建文件

```
backend/app/models/chat.py          # 对话数据模型
backend/app/api/chat.py             # 对话 API 路由
backend/app/services/chat_service.py # 对话业务逻辑
frontend/src/api/chat.ts            # 前端 API 调用
frontend/src/components/SmartAssistant/SmartAssistant.tsx
frontend/src/components/SmartAssistant/ChatPanel.tsx
frontend/src/components/SmartAssistant/ChatMessage.tsx
frontend/src/components/SmartAssistant/ProblemSummary.tsx
frontend/src/components/SmartAssistant/SearchResult.tsx
frontend/src/components/SmartAssistant/SimilarTicketCard.tsx
frontend/src/components/SmartAssistant/index.ts
```

### 修改文件

```
backend/app/main.py                  # 注册 chat 路由
backend/app/api/tickets.py           # 添加自助解决统计端点
frontend/src/pages/TicketForm.tsx    # 集成智能客服组件
frontend/src/pages/Dashboard.tsx     # 添加统计卡片
frontend/src/types/chat.ts           # 新建类型定义
```

## References & Research

### Internal References

- AI 服务实现: `backend/app/services/ai_service.py`
- 向量搜索: `backend/app/services/ai_service.py:191-206` (find_similar_tickets)
- 智能推荐: `backend/app/services/ai_service.py` (generate_handling_recommendation)
- API 结构: `backend/app/api/tickets.py`
- 数据模型: `backend/app/models/ticket.py`
- 前端风格: `frontend/src/pages/Dashboard.tsx`
- 表单页面: `frontend/src/pages/TicketForm.tsx`

### Related Documents

- 头脑风暴: `docs/brainstorms/2026-02-28-smart-customer-service-brainstorm.md`
- 向量插入优化: `docs/plans/2026-02-27-refactor-embedding-insert-to-close-plan.md`
