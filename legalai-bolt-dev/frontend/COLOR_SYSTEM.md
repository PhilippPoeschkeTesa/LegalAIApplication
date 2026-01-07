# Centralized Color System

This project uses a centralized color management system to ensure consistent theming across light and dark modes.

## Usage

### In Components

```typescript
import { useColors } from '../lib/colors';
import { useTheme } from '../contexts/ThemeContext';

export function MyComponent() {
  const { isDark } = useTheme();
  const c = useColors(isDark);

  return (
    <div className={`${c.bg.primary} ${c.text.primary} ${c.border.primary}`}>
      <h1 className={c.text.primary}>Hello</h1>
      <p className={c.text.secondary}>World</p>
      <button className={`${c.button.secondary.bg} ${c.button.secondary.text} ${c.button.secondary.hover}`}>
        Click me
      </button>
    </div>
  );
}
```

## Available Color Classes

### Background Colors
- `c.bg.primary` - Main background (white/slate-900)
- `c.bg.secondary` - Secondary background (slate-50/slate-800)
- `c.bg.tertiary` - Tertiary background (slate-100/slate-800-50)
- `c.bg.elevated` - Elevated surfaces like cards
- `c.bg.hover` - Hover states

### Text Colors
- `c.text.primary` - Primary text (slate-900/white)
- `c.text.secondary` - Secondary text (slate-600/slate-300)
- `c.text.tertiary` - Tertiary text (slate-500/slate-400)
- `c.text.muted` - Muted text (slate-400/slate-500)

### Border Colors
- `c.border.primary` - Primary borders (slate-200/slate-700)
- `c.border.secondary` - Secondary borders (slate-300/slate-600)
- `c.border.hover` - Hover state borders

### Card Components
- `c.card.bg` - Card background
- `c.card.border` - Card borders
- `c.card.hover` - Card hover effects

### Input Components
- `c.input.bg` - Input background
- `c.input.border` - Input border
- `c.input.focus` - Input focus ring
- `c.input.text` - Input text color
- `c.input.placeholder` - Placeholder text

### Button Components
- `c.button.secondary.bg` - Secondary button background
- `c.button.secondary.border` - Secondary button border
- `c.button.secondary.text` - Secondary button text
- `c.button.secondary.hover` - Secondary button hover

### Message/Chat Components
- `c.message.assistant.bg` - Assistant message background
- `c.message.assistant.border` - Assistant message border
- `c.message.assistant.text` - Assistant message text

### Badge/Status Components
- `c.badge.info.*` - Info badges (blue)
- `c.badge.success.*` - Success badges (green)
- `c.badge.warning.*` - Warning badges (orange)
- `c.badge.error.*` - Error badges (red)

Each badge type has: `bg`, `text`, and `border` properties.

## Benefits

1. **Consistency** - All components use the same color definitions
2. **Maintainability** - Change colors in one place (`src/lib/colors.ts`)
3. **Theme Support** - Automatically adapts to light/dark mode
4. **Type Safety** - TypeScript ensures correct usage
5. **No Hardcoding** - Eliminates scattered color definitions

## Migration from Hardcoded Colors

Before:
```typescript
<div className={`${isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-slate-200'}`}>
```

After:
```typescript
<div className={`${c.bg.elevated} ${c.text.primary} ${c.border.primary}`}>
```

## Adding New Colors

To add new color definitions, edit `src/lib/colors.ts`:

1. Add to the `colors` object
2. Add to the `useColors` return object
3. Use throughout the app

This ensures all future color additions follow the same pattern.
