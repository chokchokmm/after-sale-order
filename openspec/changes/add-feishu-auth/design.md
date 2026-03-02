# 技术设计：飞书 OAuth 登录

## Context

### 当前状态
- 前端使用固定密码 `123456` + localStorage 存储用户名
- 后端无认证机制，所有 API 公开访问
- `X-Username` header 由前端发送，后端不验证
- 已有飞书 webhook 集成用于工单完成通知

### 约束
- 需要保持向后兼容，保留原有用户名/密码登录方式
- 飞书开放平台 API 文档：https://open.feishu.cn
- 授权码有效期 5 分钟，只能使用一次
- access_token 有效期 2 小时

## Goals / Non-Goals

**Goals:**
- 实现飞书 OAuth 2.0 登录流程
- 前端添加"飞书登录"按钮和回调页面
- 后端实现 token 交换和用户信息获取
- 扩展用户模型支持飞书用户信息

**Non-Goals:**
- 不实现 JWT/Session 认证（保持当前简单的 localStorage 方式）
- 不实现 token 刷新机制（每次登录重新授权）
- 不实现后端 API 权限控制（保持当前开放状态）

## Decisions

### 1. OAuth 流程实现位置

**决定：后端处理 token 交换**

前端只负责：
1. 跳转到飞书授权页
2. 接收回调中的 code
3. 把 code 发给后端

后端负责：
1. 用 code 换 access_token
2. 用 access_token 获取用户信息
3. 返回用户信息给前端

**理由：**
- App Secret 不能暴露在前端
- 便于后续扩展（如 token 刷新、用户绑定等）
- 符合 OAuth 2.0 安全最佳实践

**备选方案：** 前端直接调用飞书 API
- 优点：减少后端代码
- 缺点：App Secret 暴露，不安全

### 2. 用户信息存储

**决定：继续使用 localStorage，扩展字段**

```typescript
interface AuthUser {
  username: string;
  avatar?: string;
  email?: string;
  feishuOpenId?: string;
  loginType: 'password' | 'feishu';
}
```

**理由：**
- 保持与现有架构一致
- 无需引入 session/JWT
- 满足当前需求

### 3. 回调路由处理

**决定：前端路由处理回调**

回调 URL：`/auth/feishu/callback`

前端新建 `FeishuCallback.tsx` 页面：
1. 从 URL 提取 code 和 state
2. 调用后端 `/api/auth/feishu/login`
3. 更新 AuthContext
4. 跳转到首页

**理由：**
- 前端已有路由系统
- 用户体验更好（无页面刷新）
- 便于错误处理和状态管理

## Risks / Trade-offs

### Risk 1: App Secret 泄露
- **风险：** 环境变量配置不当导致 Secret 泄露
- **缓解：** 使用 `.env` 文件，添加到 `.gitignore`，生产环境使用安全配置

### Risk 2: 授权码过期
- **风险：** 用户在授权页停留过久，code 过期
- **缓解：** 前端显示友好错误提示，引导用户重新登录

### Risk 3: 飞书服务不可用
- **风险：** 飞书 API 故障导致无法登录
- **缓解：** 保留用户名/密码登录作为备选方案

### Trade-off: 无 token 刷新
- **取舍：** 不实现 refresh_token 机制
- **影响：** 用户每次登录都需要重新授权
- **理由：** 当前系统使用频率不高，简化实现

## Migration Plan

### 部署步骤

1. **飞书开放平台配置**
   - 创建企业自建应用
   - 配置重定向 URI
   - 获取 App ID 和 App Secret
   - 申请用户信息权限

2. **后端部署**
   - 添加环境变量配置
   - 部署新代码

3. **前端部署**
   - 部署新代码
   - 验证回调路由可访问

### 回滚策略

- 前端：隐藏飞书登录按钮，保留原有登录方式
- 后端：移除 auth 路由注册
- 配置：删除飞书相关环境变量

## Open Questions

1. **是否需要绑定已有用户？**
   - 如果用户先用密码登录，再用飞书登录，是否合并为同一用户？
   - 当前设计：不绑定，视为不同用户

2. **是否需要记录登录日志？**
   - 当前设计：不记录
   - 后续可扩展：添加登录历史表
