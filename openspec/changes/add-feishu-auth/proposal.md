# Feishu OAuth 登录集成

## Why

当前系统使用固定密码（`123456`）进行认证，存在安全隐患：任何人知道密码即可登录，后端 API 完全无保护。集成飞书 OAuth 登录可以实现企业级身份认证，确保只有飞书企业成员才能访问系统，同时简化用户登录流程（无需记忆额外密码）。

## What Changes

- 新增飞书 OAuth 2.0 登录入口（"飞书登录"按钮）
- 新增飞书授权回调处理逻辑
- 新增后端认证服务，调用飞书 API 换取 access_token 和用户信息
- 扩展用户模型，支持存储飞书用户信息（open_id、头像、邮箱等）
- 保留原有用户名/密码登录作为备选方案

## Capabilities

### New Capabilities

- `feishu-auth`: 飞书 OAuth 2.0 登录功能，包括授权跳转、回调处理、token 交换、用户信息获取

### Modified Capabilities

无现有 capability 的需求变更。

## Impact

### 后端
- `backend/app/config.py` - 新增飞书配置项（App ID、App Secret、Redirect URI）
- `backend/app/services/feishu_auth_service.py` - 新增飞书 OAuth 服务
- `backend/app/api/auth.py` - 新增认证 API 端点
- `backend/app/main.py` - 注册认证路由
- `backend/.env.example` - 添加飞书配置示例

### 前端
- `frontend/src/pages/Login.tsx` - 添加飞书登录按钮
- `frontend/src/pages/FeishuCallback.tsx` - 新增飞书回调页面
- `frontend/src/contexts/AuthContext.tsx` - 添加飞书登录方法
- `frontend/src/types/auth.ts` - 扩展用户类型
- `frontend/src/App.tsx` - 添加回调路由
- `frontend/src/api/auth.ts` - 新增认证 API

### 外部依赖
- 飞书开放平台 API（https://open.feishu.cn）
- 需要在飞书开放平台创建企业自建应用并配置权限
