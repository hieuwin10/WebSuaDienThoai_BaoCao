---
stepsCompleted: ['step-01-init', 'step-12-complete']
workflowType: 'epics-and-stories'
---

# Epics and Stories - Premium UI Upgrade

**Author:** Sieu chu nhiem
**Date:** 2026-05-10

## Epic 1: Design System & Theme Setup
**Goal:** Establish the foundation for the premium look and feel.

### Story 1.1: Typography and Base Styles
- **Description:** Import 'Outfit' font and setup global CSS variables for gradients and glassmorphism.
- **Tasks:**
  - Update `index.html` to include Google Fonts.
  - Add CSS variables to `App.css`.
- **Acceptance Criteria:** Font applies correctly; variables are usable.

### Story 1.2: Dark Mode & Theme Switcher
- **Description:** Implement a toggle to switch between light and dark modes using Ant Design's ConfigProvider.
- **Tasks:**
  - Create Theme toggle component in Header.
  - Persist preference in localStorage.
- **Acceptance Criteria:** Smooth switching without page reload.

---

## Epic 2: Premium UI Components
**Goal:** Create reusable components with modern aesthetics.

### Story 2.1: Glassmorphism Wrapper (GlassCard)
- **Description:** Create a card component with blur background and thin border.
- **Tasks:**
  - Create `src/components/common/GlassCard.jsx`.
  - Apply backdrop-filter styles.
- **Acceptance Criteria:** Card looks like frosted glass on top of colorful backgrounds.

### Story 2.2: MainLayout Upgrade
- **Description:** Update Sidebar and Header to use glassmorphism and smooth hover effects.
- **Tasks:**
  - Modify `MainLayout.jsx`.
  - Add micro-animations to menu items.

---

## Epic 3: Feature Pages Upgrade
**Goal:** Apply the premium design to high-impact pages.

### Story 3.1: Dashboard Redesign
- **Description:** Upgrade the dashboard with animated charts and glass cards.
- **Tasks:**
  - Update `Dashboard.jsx`.
  - Add animations to Recharts.
- **Acceptance Criteria:** Dashboard looks premium and dynamic.
