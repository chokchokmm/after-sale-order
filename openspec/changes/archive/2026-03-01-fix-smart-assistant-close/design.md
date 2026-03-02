## Context

智能客服组件（`SmartAssistant`）是一个浮动在页面右下角的聊天窗口，用户可以通过点击浮动按钮来打开/关闭聊天面板。

当前实现问题：
- 浮动按钮的 `onClick` 事件绑定的是 `handleOpen` 函数
- `handleOpen` 函数只实现了打开逻辑（`setIsOpen(true)`），没有处理关闭逻辑
- 当 `isOpen` 为 `true` 时，按钮显示关闭图标，但点击后仍然调用 `handleOpen`，导致无法关闭

## Goals / Non-Goals

**Goals:**
- 修复浮动按钮的点击逻辑，实现打开/关闭的切换功能
- 保持现有功能不变（打开时创建会话、消息发送等）

**Non-Goals:**
- 不改变组件的视觉样式
- 不修改 API 或后端逻辑
- 不添加新功能

## Decisions

### 1. 修改点击处理逻辑

**决策**: 将 `handleOpen` 函数改为 `handleToggle`，根据当前 `isOpen` 状态执行打开或关闭操作。

**原因**:
- 最小化代码改动
- 保持现有组件结构不变
- 逻辑清晰，易于理解和维护

**代码修改**:
```tsx
// 修改前
const handleOpen = async () => {
  setIsOpen(true);
  // ...
};

// 修改后
const handleToggle = async () => {
  if (isOpen) {
    setIsOpen(false);
    return;
  }
  setIsOpen(true);
  // ... 创建会话逻辑保持不变
};
```

### 2. 更新按钮的 onClick 绑定

将浮动按钮的 `onClick={handleOpen}` 改为 `onClick={handleToggle}`。

## Risks / Trade-offs

**风险**: 无显著风险。这是一个简单的逻辑修复，不涉及数据状态或 API 调用的变更。

**权衡**: 选择直接修改现有函数而非创建单独的 `handleClose` 函数，以减少代码量并保持逻辑内聚。
