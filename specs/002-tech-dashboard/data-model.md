# Data Model: Futuristic Tech-Themed Dashboard UI

**Status**: N/A

This feature is purely a frontend visual redesign. No data model changes are required.

## Existing Data Models (Unchanged)

The following data models remain unchanged:

- **Ticket**: Work order entity with status, priority, category fields
- **User**: User authentication entity
- **TicketStatistics**: Dashboard statistics aggregation

## Theme Configuration (New)

While not a traditional data model, the theme configuration can be represented as:

```typescript
interface ThemeConfig {
  colors: {
    // Backgrounds
    bgPrimary: string;      // #0a0e27
    bgSecondary: string;    // #1a1a2e
    bgSurface: string;      // #16213e

    // Accents
    accentCyan: string;     // #00d4ff
    accentMagenta: string;  // #ff006e
    accentGreen: string;    // #00ff88
    accentAmber: string;    // #ffb703
    accentPurple: string;   // #7b2cbf

    // Text
    textPrimary: string;    // #ffffff
    textSecondary: string;  // #a0a0b0
    textMuted: string;      // #6b7280
  };
  effects: {
    glowIntensity: 'none' | 'low' | 'medium' | 'high';
    glassBlur: number;      // 10px
    borderRadius: number;   // 16px
    transitionDuration: number; // 300ms
  };
}
```

This is implemented as CSS custom properties and Ant Design tokens, not a runtime data structure.
