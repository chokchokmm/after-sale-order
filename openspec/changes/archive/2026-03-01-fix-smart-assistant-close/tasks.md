## 1. Fix Toggle Logic

- [x] 1.1 Rename `handleOpen` function to `handleToggle` in SmartAssistant.tsx
- [x] 1.2 Add close logic to `handleToggle`: when `isOpen` is true, set `isOpen` to false and return early
- [x] 1.3 Update floating button's `onClick` handler from `handleOpen` to `handleToggle`

## 2. Verification

- [x] 2.1 Test opening chat panel by clicking floating button
- [x] 2.2 Test closing chat panel by clicking floating button when panel is open
- [x] 2.3 Verify chat session is preserved when closing and reopening panel
