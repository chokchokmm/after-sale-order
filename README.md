# 售后工单管理系统

一个基于 AI 驱动的现代化售后工单管理系统，为售后团队提供智能化的工单处理、相似问题推荐和解决方案建议。

## ✨ 核心特性

### 工单管理
- 📝 **完整的工单生命周期管理**：创建、编辑、查看、状态流转
- 🔍 **多维度筛选**：按来源系统、类型、状态、优先级筛选
- 📊 **实时统计**：工单概览、分类统计、趋势分析
- 🏷️ **智能标签**：AI 自动生成工单标签
- 📸 **截图上传**：支持工单截图附件上传
- 🔔 **实时通知**：工单创建和完成时自动发送飞书通知

### AI 智能功能
- 🤖 **智能客服助手**：基于历史工单的智能问答
- 🔎 **相似工单推荐**：利用向量搜索快速定位相似问题
- 💡 **处理方案建议**：基于历史解决方案的智能推荐
- 🎯 **向量检索**：使用 Milvus 向量数据库实现语义搜索

### 用户体验
- 🎨 **现代化 UI**：科技感设计风格，支持亮色/暗色主题
- 🔐 **飞书 OAuth 认证**：企业级身份认证
- 📱 **响应式设计**：适配多种屏幕尺寸
- ⚡ **实时更新**：流畅的交互体验

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 19 + TypeScript 5.9
- **构建工具**: Vite 7
- **UI 组件库**: Ant Design 6
- **图表库**: ECharts 6
- **路由**: React Router 7
- **HTTP 客户端**: Axios
- **主题**: 自定义科技风主题（亮色/暗色模式）

### 后端技术栈
- **框架**: FastAPI (Python)
- **数据库**: MongoDB 7.0
- **向量数据库**: Milvus 2.3
- **对象存储**: MinIO
- **AI 服务**: 智谱 AI (GLM-4-Flash, Embedding-3)
- **认证**: 飞书 OAuth

### 基础设施
- **容器化**: Docker Compose
- **日志**: 结构化日志系统
- **配置管理**: Pydantic Settings

## 📦 项目结构

```
after-sale-order/
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── main.py            # 应用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # MongoDB 连接
│   │   ├── logger.py          # 日志配置
│   │   ├── models/            # 数据模型
│   │   │   ├── ticket.py      # 工单模型
│   │   │   ├── user.py        # 用户模型
│   │   │   └── chat.py        # 聊天模型
│   │   ├── api/               # API 路由
│   │   │   ├── tickets.py     # 工单接口
│   │   │   ├── users.py       # 用户接口
│   │   │   ├── chat.py        # 智能客服接口
│   │   │   └── auth.py        # 认证接口
│   │   ├── services/          # 业务逻辑
│   │   │   ├── ticket_service.py      # 工单服务
│   │   │   ├── ai_service.py          # AI 服务
│   │   │   ├── chat_service.py        # 聊天服务
│   │   │   ├── storage_service.py     # 存储服务
│   │   │   ├── feishu_auth_service.py # 飞书认证
│   │   │   └── state_store.py         # 状态管理
│   │   └── schemas/           # Request/Response 模式
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── api/               # API 调用
│   │   │   ├── client.ts      # Axios 实例
│   │   │   ├── tickets.ts     # 工单 API
│   │   │   ├── auth.ts        # 认证 API
│   │   │   └── chat.ts        # 聊天 API
│   │   ├── components/        # 组件
│   │   │   ├── Layout.tsx             # 布局
│   │   │   ├── SmartAssistant/        # 智能客服
│   │   │   ├── ThemeToggle.tsx        # 主题切换
│   │   │   ├── GlowButton.tsx         # 霓虹按钮
│   │   │   ├── TechCard.tsx           # 科技卡片
│   │   │   ├── BentoCard.tsx          # Bento 卡片
│   │   │   └── StatusBadge.tsx        # 状态徽章
│   │   ├── pages/             # 页面
│   │   │   ├── Dashboard.tsx          # 仪表板
│   │   │   ├── TicketList.tsx         # 工单列表
│   │   │   ├── TicketForm.tsx         # 工单表单
│   │   │   ├── TicketDetail.tsx       # 工单详情
│   │   │   ├── Login.tsx              # 登录
│   │   │   └── FeishuCallback.tsx     # 飞书回调
│   │   ├── contexts/          # Context
│   │   │   ├── AuthContext.tsx        # 认证上下文
│   │   │   └── ThemeContext.tsx       # 主题上下文
│   │   ├── types/             # TypeScript 类型
│   │   ├── utils/             # 工具函数
│   │   ├── config/            # 配置
│   │   │   └── theme.ts               # 主题配置
│   │   ├── App.tsx            # 根组件
│   │   └── main.tsx           # 入口
│   └── package.json
│
└── docker-compose.yml          # Docker 服务编排
```

## 🚀 快速开始

### 前置要求

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- 智谱 AI API Key（可选，用于 AI 功能）
- 飞书应用（可选，用于 OAuth 认证）

### 1. 启动基础设施服务

```bash
# 启动 MongoDB、Milvus、MinIO、etcd
docker-compose up -d

# 查看服务状态
docker-compose ps
```

服务端口：
- MongoDB: 27017
- Milvus: 19530
- MinIO: 9000 (API), 9001 (Console)
- etcd: 2379

### 2. 配置后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 复制配置文件
cp .env.example .env

# 编辑 .env 文件，配置必要的环境变量
# 必需配置：
# - MONGODB_URL
# - ZHIPU_API_KEY (AI 功能)
# - FEISHU_APP_ID / FEISHU_APP_SECRET (OAuth 认证)
# - MINIO_ACCESS_KEY / MINIO_SECRET_KEY
```

### 3. 启动后端服务

```bash
# 开发模式（自动重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
python -m app.main
```

后端 API 文档：http://localhost:8000/docs

### 4. 配置前端

```bash
cd frontend

# 安装依赖
npm install

# 创建 .env.local 文件（可选）
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

### 5. 启动前端服务

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm run preview
```

前端应用：http://localhost:5173

## 📖 使用指南

### 认证登录

系统支持飞书 OAuth 认证：

1. 访问登录页面
2. 点击"飞书登录"按钮
3. 在飞书授权页面确认授权
4. 自动跳转回系统并完成登录

### 工单管理

#### 创建工单

1. 点击"新建工单"按钮
2. 填写工单信息：
   - **来源系统**：TMS（运输管理）、OMS（订单管理）、WMS（仓储管理）
   - **工单类型**：工单处理、系统故障
   - **问题描述**：详细描述遇到的问题
   - **处理类型**：产品、开发、产品+开发
   - **优先级**：
     - P0：系统崩溃，功能失效（立即处理）
     - P1：阻塞型 BUG（优先处理）
     - P2：非主流程 BUG（正常排期）
     - P3：优化问题（低优先级）
   - **截图**：上传问题截图（可选）
3. 系统自动：
   - 生成工单编号（格式：AS-YYYYMMDD-XX）
   - AI 生成标签
   - 搜索相似工单
   - 生成处理建议

#### 查看工单

- **列表视图**：支持筛选、搜索、分页
- **详情视图**：查看完整信息和处理建议
- **编辑**：修改工单信息和状态

### 智能客服

在工单列表页面右下角，点击智能客服图标：

1. 输入问题格式：`问题描述:您的问题内容`
2. 系统自动搜索相似工单
3. 基于历史工单给出处理建议
4. 可选择：
   - "问题已解决"：关闭助手
   - "创建工单"：自动跳转到工单创建页面

### 仪表板

查看实时统计数据：

- **工单概览**：总数、待处理、处理中、已完成
- **分类统计**：按类型、优先级分布
- **趋势分析**：工单创建趋势图

## 🔌 API 接口

### 工单相关

```http
POST   /api/tickets              # 创建工单
GET    /api/tickets              # 获取工单列表（支持筛选、分页）
GET    /api/tickets/:id          # 获取工单详情
PUT    /api/tickets/:id          # 更新工单
DELETE /api/tickets/:id          # 删除工单
GET    /api/tickets/stats        # 获取统计数据
POST   /api/tickets/:id/recommendation  # 获取处理建议
POST   /api/tickets/upload       # 上传截图
```

### 认证相关

```http
GET    /api/auth/feishu          # 获取飞书授权 URL
POST   /api/auth/feishu/login    # 飞书登录
```

### 智能客服

```http
POST   /api/chat/ask             # 智能问答
```

### 用户相关

```http
POST   /api/users                # 创建用户
GET    /api/users                # 获取用户列表
GET    /api/users/:id            # 获取用户详情
PUT    /api/users/:id            # 更新用户
```

## 🤖 AI 功能详解

### 向量搜索

系统使用 Milvus 向量数据库存储工单的向量表示：

1. **Embedding 生成**：使用智谱 AI Embedding-3 模型（1024 维）
2. **相似度计算**：基于余弦相似度
3. **搜索策略**：优先匹配已完成的工单

### 智能标签

基于工单描述自动生成 3-5 个标签：

- 问题类型
- 紧急程度
- 影响范围
- 涉及模块

### 处理建议

基于相似历史工单生成处理步骤：

1. 搜索相似度最高的 3 个已完成工单
2. 提取历史处理详情
3. 使用 GLM-4-Flash 生成结构化建议
4. 附带参考工单编号

## 🎨 主题系统

系统支持亮色/暗色主题切换：

- **科技风设计**：霓虹色彩、发光效果
- **自适应配色**：图表、组件自动适配主题
- **本地存储**：记住用户主题偏好

## ⚙️ 环境变量

### 后端环境变量

```bash
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=ticket_system

# 服务器
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# 日志
LOG_LEVEL=INFO
LOG_DIR=logs

# 智谱 AI
ZHIPU_API_KEY=your_api_key

# Milvus
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_COLLECTION=ticket_embeddings
MILVUS_TIMEOUT=60

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=ticket-screenshots
MINIO_SECURE=false
MINIO_URL_EXPIRY=3600

# 超时设置（秒）
EMBEDDING_TIMEOUT=30
LLM_TIMEOUT=60

# 飞书 OAuth
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_REDIRECT_URI=http://localhost:5173/auth/feishu/callback

# 飞书机器人通知（可选）
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/your-webhook-token
```

### 前端环境变量

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## 🧪 测试

### 后端测试

```bash
cd backend
pytest
```

### 前端测试

```bash
cd frontend
npm run lint
```

## 📊 性能优化

### 后端优化

- 异步 I/O（Motor + asyncio）
- 数据库索引优化
- 向量搜索缓存
- 超时控制

### 前端优化

- Vite 快速构建
- 组件懒加载
- 图表按需引入
- 主题样式缓存

## 🔒 安全特性

- 飞书 OAuth 认证
- CORS 跨域保护
- 环境变量配置
- 敏感信息加密

## 🛠️ 开发指南

### 代码规范

- **Python**: PEP 8
- **TypeScript**: ESLint
- **提交信息**: 约定式提交

### 分支管理

- `main`: 生产分支
- `feature/*`: 功能分支
- `bugfix/*`: 修复分支

## 🐛 故障排查

### 常见问题

1. **MongoDB 连接失败**
   - 检查 Docker 服务是否启动
   - 验证连接字符串

2. **AI 功能不可用**
   - 检查智谱 AI API Key
   - 验证网络连接

3. **飞书登录失败**
   - 检查应用配置
   - 验证回调 URL

4. **向量搜索超时**
   - 检查 Milvus 服务状态
   - 调整超时配置

### 日志查看

```bash
# 后端日志
cd backend
tail -f logs/app.log

# Docker 日志
docker-compose logs -f
```

## 📝 更新日志

### v1.0.0 (2026-03-05)
- ✨ 初始版本发布
- 🎉 完整的工单管理功能
- 🤖 AI 智能客服
- 🔐 飞书 OAuth 认证
- 🎨 科技风 UI 主题

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👥 联系方式

如有问题或建议，请创建 Issue 或联系开发团队。

---

**注意**: 当前版本为 v1.0.0，部分功能仍在持续优化中。如需生产部署，请确保配置所有必要的安全设置和环境变量。
