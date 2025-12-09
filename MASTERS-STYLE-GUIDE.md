# Masters Broadcast Style Guide

This document captures the "filmic Masters broadcast" aesthetic applied to the ScoreCard component. Use this as a reference when transforming other components in the application.

## Design Philosophy

Inspired by CBS Masters Tournament broadcasts from Augusta National:
- **Warm Georgia afternoon light** - amber/gold accents
- **Deep Augusta greens** - muted, sophisticated greens
- **Analog softness** - film grain, vignette, nothing too crisp/digital
- **Translucency & depth** - layers that breathe, not flat solid colors
- **Elegant restraint** - "just a whisper" of effects, never overdone

---

## Color Palette

### Primary Background Gradient
```css
background:
  /* Warm highlight - top left, very subtle */
  radial-gradient(
    ellipse 120% 100% at 20% 10%,
    hsla(50, 85%, 70%, 0.12) 0%,
    hsla(50, 85%, 70%, 0) 45%
  ),
  /* Cool green accent - bottom right */
  radial-gradient(
    circle at 80% 90%,
    hsla(155, 40%, 18%, 0.20) 0%,
    hsla(155, 40%, 12%, 0) 60%
  ),
  /* Base gradient - deep greens */
  linear-gradient(
    145deg,
    hsl(150, 35%, 10%) 0%,
    hsl(152, 33%, 12%) 35%,
    hsl(149, 28%, 9%) 70%,
    hsl(152, 30%, 11%) 100%
  )
```

### Text Colors (Warm Amber Tints)
| Use Case | Class |
|----------|-------|
| Primary headings | `text-amber-50` |
| Secondary headings | `text-amber-100/90` |
| Body text | `text-amber-100/80` |
| Muted/secondary text | `text-amber-100/60` |
| Subtle text (captions) | `text-amber-100/50` |
| Subdued labels | `text-amber-200/50` |

### Border Colors
| Use Case | Class |
|----------|-------|
| Primary borders | `border-amber-900/30` |
| Subtle borders | `border-amber-900/20` |
| Accent borders (e.g., dividers) | `border-amber-700/40` |
| Separators | `bg-amber-900/30` |

### Icon Colors
```
text-amber-200/50
```

---

## Translucency Patterns

### Card/Panel Backgrounds
```
bg-slate-800/30 backdrop-blur-sm border border-amber-900/20
```

### Table Header Cells
```
bg-slate-800/50 backdrop-blur-[2px]
```

### Table Body Cells
```
bg-slate-800/40 backdrop-blur-[1px]
```

### Table Footer/Total Row
```
bg-slate-700/50 backdrop-blur-[2px]
```

### Tabs/Navigation
```
bg-slate-900/40 backdrop-blur-sm border border-slate-700/30
shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_2px_4px_rgba(0,0,0,0.3)]
```

---

## Muted Accent Colors (for badges, tee markers, etc.)

These are desaturated, darker versions that blend with the filmic aesthetic:

| Color | Class |
|-------|-------|
| Green | `bg-emerald-800/70` |
| Blue | `bg-blue-800/70` |
| Red | `bg-red-800/70` |
| Orange/Junior | `bg-amber-700/70` |
| Yellow/Gold | `bg-yellow-600/70` |
| White | `bg-slate-400/70` |
| Black | `bg-zinc-800/80` |
| Gray/Default | `bg-slate-600/70` |

Text on these backgrounds:
- Dark backgrounds: `text-amber-50/90`
- Light backgrounds (white, yellow): `text-slate-800` or `text-slate-900`

---

## Film Effects

### Film Grain Overlay
Add as first child inside the container:
```jsx
<div
  className="absolute inset-0 rounded-lg pointer-events-none opacity-[0.035] mix-blend-overlay"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
  }}
/>
```

### Vignette Effect
Add after film grain:
```jsx
<div
  className="absolute inset-0 rounded-lg pointer-events-none"
  style={{
    boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.3)",
  }}
/>
```

---

## Typography

### Headings
```
text-lg font-semibold tracking-wide text-amber-50
```

### Subtitles/Locations
```
text-xs tracking-wider uppercase text-amber-200/50
```

### Description/Editorial Text
```
text-xs text-amber-100/50 leading-relaxed italic
```

---

## Shadows

### Card Shadow
```
shadow-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)]
```

### Inner Highlight + Drop Shadow (for interactive elements)
```
shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_2px_4px_rgba(0,0,0,0.3)]
```

---

## Badges/Tags
```jsx
<Badge className="text-[10px] py-0 px-2 bg-emerald-900/50 text-amber-100/80 border border-emerald-800/30">
  {label}
</Badge>
```

---

## Modal/Overlay Backdrop
```
fixed inset-0 bg-black/70 backdrop-blur-sm
```

---

## Complete Example: Styled Container

```jsx
<div
  className="text-card-foreground rounded-lg p-4 relative shadow-2xl border border-slate-600/30"
  style={{
    background: `
      radial-gradient(ellipse 120% 100% at 20% 10%, hsla(50, 85%, 70%, 0.12) 0%, hsla(50, 85%, 70%, 0) 45%),
      radial-gradient(circle at 80% 90%, hsla(155, 40%, 18%, 0.20) 0%, hsla(155, 40%, 12%, 0) 60%),
      linear-gradient(145deg, hsl(150, 35%, 10%) 0%, hsl(152, 33%, 12%) 35%, hsl(149, 28%, 9%) 70%, hsl(152, 30%, 11%) 100%)
    `,
  }}
>
  {/* Film grain */}
  <div
    className="absolute inset-0 rounded-lg pointer-events-none opacity-[0.035] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />

  {/* Vignette */}
  <div
    className="absolute inset-0 rounded-lg pointer-events-none"
    style={{ boxShadow: "inset 0 0 80px 20px rgba(0,0,0,0.3)" }}
  />

  {/* Content */}
  <div className="relative z-10">
    {children}
  </div>
</div>
```

---

## Key Principles

1. **Opacity over solid colors** - Use `/70`, `/80` opacity variants
2. **Warm over cool** - Prefer amber tints over pure white/gray
3. **Blur for depth** - `backdrop-blur-[1px]` to `backdrop-blur-sm`
4. **Subtle borders** - `border-amber-900/20` to `/30`, never harsh
5. **Film texture** - Grain + vignette on major containers
6. **Elegant typography** - Letter-spacing, uppercase for labels, italic for editorial

---

## Files Modified

- `frontend/src/components/ScoreCard.tsx` - Reference implementation
