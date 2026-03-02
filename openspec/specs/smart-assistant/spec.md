# Smart Assistant

## Purpose

智能客服组件，提供浮动的聊天窗口帮助用户解决问题、查找相似工单和获取处理建议。

## Requirements

### Requirement: Floating button toggles chat panel visibility
The smart assistant floating button SHALL toggle the chat panel visibility when clicked. When the panel is closed, clicking the button opens it. When the panel is open, clicking the button closes it.

#### Scenario: Open chat panel from closed state
- **WHEN** chat panel is closed AND user clicks the floating button
- **THEN** system opens the chat panel AND creates a new chat session if none exists

#### Scenario: Close chat panel from open state
- **WHEN** chat panel is open AND user clicks the floating button (showing close icon)
- **THEN** system closes the chat panel without affecting the current session
