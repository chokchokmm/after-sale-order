# Implementation Tasks: Feishu Auth

## 1. 后端配置

- [x] 1.1 在 `backend/app/config.py` 添加飞书配置项（feishu_app_id, feishu_app_secret, feishu_redirect_uri）
- [x] 1.2 更新 `backend/.env.example` 添加飞书配置示例

## 2. 后端服务层

- [x] 2.1 创建 `backend/app/services/feishu_auth_service.py` 飞书认证服务
- [x] 2.2 实现 `get_access_token(code)` 方法 - 用授权码换取 token
- [x] 2.3 实现 `get_user_info(access_token)` 方法 - 获取飞书用户信息

## 3. 后端 API 层

- [x] 3.1 创建 `backend/app/api/auth.py` 认证路由
- [x] 3.2 实现 `GET /api/auth/feishu` - 返回飞书授权 URL
- [x] 3.3 实现 `POST /api/auth/feishu/login` - 处理 code 换取用户信息
- [x] 3.4 在 `backend/app/main.py` 注册 auth 路由

## 4. 前端类型定义

- [x] 4.1 更新 `frontend/src/types/auth.ts` 扩展 AuthUser 接口（添加 avatar, email, feishuOpenId, loginType）
- [x] 4.2 创建 `frontend/src/api/auth.ts` 认证 API 调用

## 5. 前端认证上下文

- [x] 5.1 更新 `frontend/src/contexts/AuthContext.tsx` 添加 feishuLogin 方法
- [x] 5.2 更新 login 方法支持 loginType 字段

## 6. 前端页面

- [x] 6.1 创建 `frontend/src/pages/FeishuCallback.tsx` 飞书回调页面
- [x] 6.2 在 `frontend/src/App.tsx` 添加 `/auth/feishu/callback` 路由
- [x] 6.3 更新 `frontend/src/pages/Login.tsx` 添加飞书登录按钮

## 7. 测试验证（需要先配置飞书应用）

> **前置条件**：需要在飞书开放平台创建应用并获取 App ID 和 App Secret

- [ ] 7.1 启动前后端服务，验证原有登录功能正常
- [ ] 7.2 点击飞书登录按钮，验证跳转到飞书授权页
- [ ] 7.3 授权后验证回调处理和用户信息存储
- [ ] 7.4 验证登录状态在页面刷新后保持
