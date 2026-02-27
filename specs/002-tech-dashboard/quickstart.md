# Quickstart: Futuristic Tech-Themed Dashboard UI

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend services running (for full functionality)

## Quick Start

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

## Visual Verification Checklist

### Dashboard Page
- [ ] Dark theme background visible
- [ ] Status cards have gradient backgrounds and glowing borders
- [ ] Charts use neon color palette
- [ ] Hover effects on interactive elements
- [ ] Smooth animations on data load

### Ticket List Page
- [ ] Table has dark background
- [ ] Row highlights on hover
- [ ] Status badges glow appropriately
- [ ] Filter controls have consistent styling

### Ticket Detail Page
- [ ] Cards use glass-morphism effect
- [ ] AI metadata section has distinctive styling
- [ ] Tags have colorful glow effects

### Ticket Form Page
- [ ] Input fields glow on focus
- [ ] AI feature buttons have distinctive styling
- [ ] Form validation has futuristic error states

### Login Page
- [ ] Centered card with glass effect
- [ ] Glowing input focus states
- [ ] Animated background elements (optional)

## Key Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | ConfigProvider with dark theme |
| `src/index.css` | Global theme CSS variables |
| `src/styles/theme.css` | CSS custom properties |
| `src/styles/animations.css` | Keyframe animations |
| `src/styles/glass-effects.css` | Glass-morphism utilities |
| `src/components/Layout.tsx` | Dark sidebar/header |
| `src/components/TechCard.tsx` | New: Reusable card component |
| `src/components/GlowButton.tsx` | New: Styled button |
| `src/components/StatusBadge.tsx` | New: Glowing badges |
| All page components | Theme integration |

## Color Reference

Quick reference for common colors:

```css
/* Backgrounds */
--bg-primary: #0a0e27;      /* Deep navy - main background */
--bg-secondary: #1a1a2e;    /* Dark purple - cards */
--bg-surface: #16213e;      /* Midnight - elevated surfaces */

/* Accents */
--accent-cyan: #00d4ff;     /* Primary actions */
--accent-magenta: #ff006e;  /* High priority/warnings */
--accent-green: #00ff88;    /* Success/completed */
--accent-amber: #ffb703;    /* Processing/pending */

/* Text */
--text-primary: #ffffff;    /* Headings */
--text-secondary: #a0a0b0;  /* Body text */
--text-muted: #6b7280;      /* Disabled/hints */
```

## Troubleshooting

### Theme not applying
- Clear browser cache
- Check that all CSS files are imported in `main.tsx`
- Verify ConfigProvider wraps the entire app

### Animations stuttering
- Check for excessive backdrop-filter usage
- Reduce blur values if needed
- Ensure `will-change` is used appropriately

### Colors look different
- Check browser color profile settings
- Verify CSS custom properties are defined
- Check for conflicting Ant Design token overrides
