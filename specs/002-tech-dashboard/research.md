# Research: Futuristic Tech-Themed Dashboard UI

**Date**: 2026-02-26
**Feature**: 002-tech-dashboard

## Research Tasks

### 1. Ant Design Dark Theme Configuration

**Decision**: Use Ant Design 5.x ConfigProvider with `darkAlgorithm` as base, then customize tokens

**Rationale**:
- Ant Design 5.x has built-in dark mode support via `theme.algorithm`
- Token-based customization allows deep theming without CSS overrides
- Maintains component functionality while changing appearance

**Implementation Approach**:
```typescript
ConfigProvider with:
- algorithm: antdTheme.darkAlgorithm
- Custom tokens for colors, borderRadius, shadows
- CSS custom properties for effects not covered by tokens (glows, gradients)
```

**Alternatives Considered**:
- CSS-only overrides: Rejected - too fragile, harder to maintain
- Styled-components: Rejected - adds complexity, contradicts constitution principle of simplicity

---

### 2. Color Palette Design

**Decision**: Deep space dark theme with neon accents

**Primary Colors**:
| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Background | Deep Navy | #0a0e27 | Main background |
| Background Alt | Dark Purple | #1a1a2e | Card backgrounds |
| Surface | Midnight Blue | #16213e | Elevated surfaces |
| Primary Accent | Cyan | #00d4ff | Primary actions, highlights |
| Secondary Accent | Magenta | #ff006e | Warnings, high priority |
| Tertiary Accent | Electric Purple | #7b2cbf | Decorative elements |
| Success | Neon Green | #00ff88 | Completed status |
| Warning | Amber | #ffb703 | Processing status |
| Error | Hot Red | #ff4757 | Errors, high priority |

**Rationale**:
- Deep dark backgrounds reduce eye strain for data-heavy interfaces
- Neon accents create futuristic feel while maintaining readability
- Color contrast ratios verified for WCAG AA compliance

---

### 3. Glass-morphism Implementation

**Decision**: CSS backdrop-filter with fallback

**Implementation**:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

**Browser Support**: 95%+ global support for backdrop-filter

**Fallback**: Solid semi-transparent background for unsupported browsers

---

### 4. Glow Effects

**Decision**: CSS box-shadow with multiple layers

**Implementation Pattern**:
```css
/* Subtle glow */
.glow-cyan {
  box-shadow:
    0 0 5px rgba(0, 212, 255, 0.3),
    0 0 20px rgba(0, 212, 255, 0.2),
    0 0 40px rgba(0, 212, 255, 0.1);
}

/* Intense glow (hover) */
.glow-cyan:hover {
  box-shadow:
    0 0 10px rgba(0, 212, 255, 0.5),
    0 0 30px rgba(0, 212, 255, 0.3),
    0 0 60px rgba(0, 212, 255, 0.2);
}
```

**Performance**: Hardware-accelerated via GPU compositing

---

### 5. Animation Strategy

**Decision**: CSS-only animations, no JavaScript animation library

**Rationale**:
- Simpler implementation (constitution principle)
- Better performance (GPU accelerated)
- No additional dependencies

**Animation Types**:
1. **Pulse**: For status indicators
2. **Gradient Flow**: For background accents
3. **Fade In**: For page transitions
4. **Shimmer**: For loading states

**Timing**: 300-500ms for interactions, 2-3s for ambient animations

---

### 6. ECharts Dark Theme

**Decision**: Custom ECharts theme object matching overall design

**Key Chart Styling**:
- Background: Transparent
- Text: Light gray (#e0e0e0)
- Grid lines: Subtle dark lines
- Series colors: Neon palette (cyan, magenta, purple, green)
- Area gradients: Semi-transparent with theme colors
- Tooltip: Glass-morphism style

---

### 7. Status Badge System

**Decision**: Unified StatusBadge component with glow variants

**Status Mappings**:
| Status | Color | Glow Intensity |
|--------|-------|----------------|
| OPEN (Pending) | Amber (#ffb703) | Medium pulse |
| PROCESSING | Cyan (#00d4ff) | High animated |
| COMPLETED | Green (#00ff88) | Low static |
| HIGH Priority | Magenta (#ff006e) | High pulse |
| MEDIUM Priority | Cyan (#00d4ff) | Medium |
| LOW Priority | Gray (#6b7280) | None |

---

### 8. Typography

**Decision**: Inter font family with monospace for data

**Font Stack**:
- Primary: 'Inter', -apple-system, system-ui, sans-serif
- Monospace: 'JetBrains Mono', 'Fira Code', monospace (for IDs, code)

**Font Weights**:
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Rationale**: Inter has excellent readability on dark backgrounds and supports multilingual text

---

### 9. Component Customization Points

**Ant Design Components to Customize**:

| Component | Customization |
|-----------|---------------|
| Card | Glass background, subtle border glow |
| Button | Gradient backgrounds, glow on hover |
| Table | Dark rows, neon row highlights |
| Input | Glowing focus states, dark backgrounds |
| Select | Matching dark dropdown styling |
| Menu | Dark sidebar with active glow |
| Tag | Glowing variant for status |
| Spin | Custom futuristic spinner |
| Message | Glass-style toast notifications |

---

### 10. Performance Considerations

**Optimizations**:
1. CSS animations over JavaScript
2. Use `will-change` sparingly for animated elements
3. Avoid excessive blur (max 20px) for performance
4. Use `transform` and `opacity` for animations (GPU accelerated)
5. Lazy load fonts with `font-display: swap`

**Expected Impact**: <5% increase in initial load, no runtime performance impact

---

## Resolved Clarifications

No NEEDS CLARIFICATION markers from Technical Context - all decisions made with reasonable defaults based on:
- Industry best practices for dark theme dashboards
- Constitution principle of simplicity
- Browser compatibility requirements
- WCAG AA accessibility standards
