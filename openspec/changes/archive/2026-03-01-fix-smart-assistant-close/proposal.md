## Why

智能客服组件的关闭按钮无法正常工作。用户点击关闭按钮时，聊天框并没有关闭，导致用户体验受损。这是因为浮动按钮的点击处理函数 `handleOpen` 只实现了打开逻辑，缺少关闭时的切换（toggle）逻辑。

## What Changes

- 修复 `SmartAssistant` 组件中浮动按钮的点击处理逻辑，添加关闭功能
- 当 `isOpen` 为 `true` 时，点击按钮应关闭聊天面板

## Capabilities

### New Capabilities

无

### Modified Capabilities

- `smart-assistant`: 修复关闭按钮功能，确保用户可以通过点击浮动按钮切换聊天面板的显示/隐藏状态

## Impact

- 前端组件：`frontend/src/components/SmartAssistant/SmartAssistant.tsx`
- 影响范围：仅影响智能客服组件的交互行为，不影响 API 或其他组件
