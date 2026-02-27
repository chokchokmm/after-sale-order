# Implementation Plan: Futuristic Tech-Themed Dashboard UI

**Branch**: `002-tech-dashboard` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-tech-dashboard/spec.md`

## Summary

Transform the after-sales ticket management system frontend into a visually striking, futuristic tech-themed interface. The redesign focuses on dark theme aesthetics with neon accents, glass-morphism effects, glowing elements, and animated data visualizations across all pages (Dashboard, Ticket List, Ticket Detail, Ticket Form, Login).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19
**Primary Dependencies**: Ant Design 5.x, ECharts, Vite
**Storage**: N/A (frontend-only styling changes)
**Testing**: N/A (visual verification)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application frontend
**Performance Goals**: No significant performance degradation (<10% impact on load times)
**Constraints**: Must maintain WCAG AA contrast compliance, all existing functionality preserved
**Scale/Scope**: 5 pages (Dashboard, TicketList, TicketForm, TicketDetail, Login), 1 Layout component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| AI优先的数据基础 | ✅ PASS | Purely visual changes, no data model impact |
| 分层架构 | ✅ PASS | No backend changes required |
| 双语支持 | ✅ PASS | Existing Chinese UI preserved |
| Docker优先 | ✅ PASS | No infrastructure changes |
| 简单优于抽象 | ✅ PASS | CSS/theme customization, no new patterns |

**Gate Result**: ✅ ALL PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/002-tech-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - no data changes)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API changes)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── App.tsx                    # Theme configuration (ConfigProvider)
│   ├── index.css                  # Global styles
│   ├── styles/                    # NEW: Theme styles directory
│   │   ├── theme.css              # CSS custom properties for theme
│   │   ├── animations.css         # Keyframe animations
│   │   └── glass-effects.css      # Glass-morphism utilities
│   ├── components/
│   │   ├── Layout.tsx             # Redesigned sidebar/header
│   │   ├── TechCard.tsx           # NEW: Reusable glowing card
│   │   ├── GlowButton.tsx         # NEW: Styled button variant
│   │   └── StatusBadge.tsx        # NEW: Glowing status badges
│   └── pages/
│       ├── Dashboard.tsx          # Redesigned with tech theme
│       ├── TicketList.tsx         # Enhanced table styling
│       ├── TicketDetail.tsx       # Glass-morphism cards
│       ├── TicketForm.tsx         # Glowing form inputs
│       └── Login.tsx              # Futuristic login page
└── package.json
```

**Structure Decision**: Minimal new files - primarily CSS-based theming with Ant Design ConfigProvider customization. Adding 3 reusable components (TechCard, GlowButton, StatusBadge) and a styles directory for theme organization.

## Complexity Tracking

> No constitution violations - complexity tracking not required.

---

## Phase 0: Research Summary

See [research.md](./research.md) for detailed findings.

### Key Decisions

1. **Theme Approach**: CSS Custom Properties + Ant Design ConfigProvider (avoid CSS-in-JS for simplicity)
2. **Animation Library**: CSS-only animations (no additional dependencies)
3. **Glass Effect**: Backdrop-filter with CSS (well-supported in modern browsers)
4. **Color Palette**: Deep navy/purple background with neon cyan, magenta, lime accents
