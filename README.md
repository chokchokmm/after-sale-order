# 售后工单管理系统

为售后团队打造的工单管理系统，作为未来 AI 介入的数据基础。

## 技术栈

- **前端**: React + Vite + TypeScript + Ant Design
- **后端**: FastAPI (Python)
- **数据库**: MongoDB
- **部署**: Docker Compose

## 快速开始

### 1. 启动 MongoDB

```bash
docker-compose up -d
```

### 2. 启动后端服务

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 复制配置文件
cp .env.example .env

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端服务启动后，访问 http://localhost:8000/docs 查看 API 文档。

### 3. 启动前端服务

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

前端服务启动后，访问 http://localhost:5173

## 项目结构

```
try-first/
├── backend/                    # FastAPI 后端
│   ├── app/
│   │   ├── main.py            # FastAPI 应用入口
│   │   ├── config.py          # 配置管理
│   │   ├── database.py        # MongoDB 连接
│   │   ├── models/            # Pydantic 数据模型
│   │   ├── api/               # API 路由
│   │   ├── services/          # 业务逻辑
│   │   └── schemas/           # Request/Response Schema
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── api/               # API 调用
│   │   ├── components/        # 通用组件
│   │   ├── pages/             # 页面
│   │   ├── types/             # TypeScript 类型
│   │   └── utils/             # 工具函数
│   └── package.json
│
└── docker-compose.yml          # MongoDB 服务
```

## 功能特性

### 工单管理
- 创建、编辑、删除工单
- 工单列表（支持筛选、搜索、分页）
- 工单详情查看
- 工单状态管理（待处理、处理中、已关闭、已验证）

### 数据字段
- 来源系统（TMS、OMS、其他）
- 工单类型（票据处理、系统故障、成本优化）
- 处理类型（产品、开发、需求、紧急）
- 优先级（P0 系统崩溃/功能失效, P1 阻塞型BUG, P2 非主流程BUG, P3 优化问题）
- 标签和解决方案模板

### 预留 AI 扩展
- 关键词提取
- 相似工单推荐
- AI 解决方案建议

## API 端点

### 工单相关
- `POST /api/tickets` - 创建工单
- `GET /api/tickets` - 获取工单列表（支持筛选、分页）
- `GET /api/tickets/:id` - 获取工单详情
- `PUT /api/tickets/:id` - 更新工单
- `DELETE /api/tickets/:id` - 删除工单
- `POST /api/tickets/:id/close` - 关闭工单
- `GET /api/tickets/stats` - 获取统计数据

### 用户相关
- `POST /api/users` - 创建用户
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户

## 开发注意事项

- 当前版本未实现用户认证，所有功能开放访问
- MongoDB 默认连接地址：mongodb://localhost:27017
- 前端 API 地址通过环境变量配置：VITE_API_BASE_URL
