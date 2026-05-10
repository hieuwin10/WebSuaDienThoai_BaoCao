---
stepsCompleted: ['step-01-init', 'step-12-complete']
workflowType: 'architecture'
---

# Technical Architecture - Premium UI Upgrade

**Author:** Sieu chu nhiem
**Date:** 2026-05-10

## 1. Tech Stack & Libraries
The existing stack will be augmented with libraries focused on aesthetics and animations:
- **UI Framework**: React 19 (Existing)
- **Component Library**: Ant Design v6 (Existing) - We will heavily use Design Tokens for theme customization.
- **Animations**: `framer-motion` for smooth layout transitions and micro-animations.
- **Icons**: `lucide-react` (Existing).
- **Styling**: Vanilla CSS with CSS Variables and Ant Design's CSS-in-JS.

## 2. Design System & Tokens
We will override Ant Design tokens in `App.jsx` to create a premium look:
- **Primary Color**: Deep Teal or Indigo with high saturation.
- **Backgrounds**: Translucent backgrounds with `backdrop-filter: blur(10px)` for glassmorphism.
- **Border Radius**: Larger border radius (16px+) for a modern feel.
- **Typography**: Import 'Outfit' or 'Plus Jakarta Sans' from Google Fonts.

## 3. Architecture Decisions
### 3.1 Theme Management
- Implement a `ThemeContext` or use Ant Design's `ConfigProvider` to switch between Light and Dark themes dynamically.
- Store theme preference in `localStorage`.

### 3.2 Animation Strategy
- Use Framer Motion for page transitions (AnimatePresence).
- Use CSS transitions for simple hover effects to maintain performance.

### 3.3 Component Structure
- Create a `GlassCard` wrapper component to reuse glassmorphism styles.
- Create an `AnimatedPage` wrapper for page transition animations.
