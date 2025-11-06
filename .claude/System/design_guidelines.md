# UI/UX Design Guidelines

**Last Updated:** 2025-11-06

---

## Overview

This document outlines the core UI/UX design patterns and principles used throughout the WorkoutApp. Following these guidelines ensures **consistency**, **predictability**, and a **cohesive user experience** across all pages and features.

---

## Core Design Values

### 1. **Consistency**
All pages should follow the same structural patterns, spacing, typography, and interaction behaviors to create a predictable experience.

### 2. **Mobile-First**
The app is designed for gym use on mobile devices. All layouts prioritize thumb-friendly interactions and single-hand usability.

### 3. **Visual Hierarchy**
Clear information hierarchy using size, color, and spacing to guide users' attention to the most important elements.

### 4. **Accessibility**
Dark mode support throughout, adequate contrast ratios, and readable font sizes for use in various lighting conditions.

### 5. **Delightful Interactions**
Smooth transitions, visual feedback, and engaging empty states to make the app enjoyable to use.

---

## Page Header Pattern

**All primary pages** (Home, History, Statistics) should use the **Centered Hero Header Pattern**:

```jsx
{/* Header */}
<div className="mb-8 text-center">
  <IconComponent size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Page Title</h1>
  <p className="text-gray-600 dark:text-gray-400 mt-2">Descriptive subtitle</p>
</div>
```

### Key Elements:

1. **Large Centered Icon** (48px)
   - Unique icon per page that represents the page's purpose
   - Color: `text-primary dark:text-blue-400`
   - Spacing: `mb-4` below icon
   - Position: Centered with `mx-auto`

2. **Page Title** (text-3xl)
   - Size: `text-3xl` (not text-2xl or other sizes)
   - Weight: `font-bold`
   - Color: `text-gray-900 dark:text-white`
   - Position: Centered

3. **Subtitle** (descriptive context)
   - Size: Default body text
   - Color: `text-gray-600 dark:text-gray-400`
   - Spacing: `mt-2` above subtitle
   - Purpose: Provides context or dynamic count

4. **Container Spacing**
   - Margin bottom: `mb-8` (consistent across all pages)
   - Alignment: `text-center`

### Examples by Page:

**Home Page:**
```jsx
<Dumbbell size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout Tracker</h1>
<p className="text-gray-600 dark:text-gray-400 mt-2">Track your progress, achieve your goals</p>
```

**History Page:**
```jsx
<Trophy size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workout History</h1>
<p className="text-gray-600 dark:text-gray-400 mt-2">
  {completedWorkouts.length} workout{completedWorkouts.length !== 1 ? 's' : ''} completed
</p>
```

**Statistics Page:**
```jsx
<TrendingUp size={48} className="mx-auto mb-4 text-primary dark:text-blue-400" />
<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Statistics</h1>
<p className="text-gray-600 dark:text-gray-400 mt-2">Track your strength progress</p>
```

---

## Empty State Pattern

Empty states should be **engaging and actionable**, not just informative.

```jsx
{/* Empty State */}
<div className="text-center py-12">
  <div className="bg-gradient-to-br from-primary/10 to-success/10 dark:from-primary/20 dark:to-success/20 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
    <IconComponent size={64} className="text-primary dark:text-blue-400" />
  </div>
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">State Title</h2>
  <p className="text-gray-600 dark:text-gray-400 mb-6">
    Helpful description of what's missing
  </p>
  <Button variant="primary" size="md" onClick={actionHandler}>
    Call to Action
  </Button>
</div>
```

### Key Elements:

1. **Decorative Icon Circle**
   - Size: `w-32 h-32`
   - Background: Gradient from primary to success color
   - Border radius: `rounded-full`
   - Inner icon: 64px size
   - Purpose: Creates visual interest

2. **State Title**
   - Size: `text-xl`
   - Weight: `font-semibold`
   - Spacing: `mb-2`

3. **Description**
   - Color: `text-gray-600 dark:text-gray-400`
   - Spacing: `mb-6` if followed by button

4. **Call-to-Action Button** (optional)
   - Variant: Usually `primary`
   - Size: `md`
   - Provides next action

---

## Typography Scale

### Headings
- **Page Titles:** `text-3xl font-bold` (mandatory for main pages)
- **Section Headers:** `text-xl font-semibold`
- **Card Titles:** `text-lg font-bold` or `font-semibold`
- **Empty State Titles:** `text-xl font-semibold`

### Body Text
- **Primary:** Default size (16px)
- **Secondary:** `text-sm` (14px)
- **Tertiary:** `text-xs` (12px)

### Font Weights
- **Bold:** Main titles, important numbers
- **Semibold:** Section headers, card titles
- **Medium:** `font-medium` for labels and emphasized text
- **Normal:** Body text, descriptions

---

## Color System

### Primary Colors
- **Primary:** `text-primary dark:text-blue-400`
  - Used for: Icons, links, important UI elements

- **Success:** `text-success dark:text-green-400`
  - Used for: Completed states, positive metrics, progress

- **Danger/Red:** `text-red-500 dark:text-red-400`
  - Used for: Delete actions, warnings

### Neutral Colors
- **Dark text:** `text-gray-900 dark:text-white`
  - Used for: Main headings, important text

- **Medium text:** `text-gray-600 dark:text-gray-400`
  - Used for: Subtitles, descriptions, secondary info

- **Light text:** `text-gray-500 dark:text-gray-500`
  - Used for: Placeholder text, tertiary info

### Background Colors
- **Page background:** Handled by Layout component
- **Card background:** `bg-white dark:bg-gray-800`
- **Border:** `border-gray-200 dark:border-gray-700`

---

## Spacing System

### Page-Level Spacing
- **Page padding:** `p-6`
- **Bottom padding (with nav):** `pb-24` (prevents content from being hidden behind bottom navigation)
- **Header section:** `mb-8` (after header, before content)

### Section Spacing
- **Between sections:** `mb-6` or `mb-8`
- **Section header margin:** `mb-4`

### Card Spacing
- **Card padding:** `p-4` or `p-5` (larger cards)
- **Card gap (vertical list):** `space-y-3` or `space-y-4`
- **Card gap (grid):** `gap-4`

---

## Card & Container Patterns

### Standard Card
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
  {/* Card content */}
</div>
```

### Highlighted/Active Card
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-2 border-primary dark:border-blue-400 p-5">
  {/* Card content */}
</div>
```

### Key Properties:
- **Background:** `bg-white dark:bg-gray-800`
- **Border radius:** `rounded-lg`
- **Border:** `border border-gray-200 dark:border-gray-700`
- **Shadow:** `shadow-sm` (default) or `shadow-md` (elevated)
- **Padding:** `p-4` or `p-5`

---

## Icon Usage

### Icon Sizes
- **Page header:** 48px
- **Empty state decoration:** 64px
- **Section icons:** 18-24px
- **Inline icons:** 16-20px
- **Small indicators:** 12-16px

### Icon Colors
Follow the color system:
- Primary elements: `text-primary dark:text-blue-400`
- Success states: `text-success dark:text-green-400`
- Neutral elements: `text-gray-600 dark:text-gray-400`

### Icon Library
- **Lucide React** is the primary icon library
- Icons should be semantic and recognizable
- Each page should have a unique representative icon

---

## Button Variants

The `Button.jsx` component provides standardized variants:

### Primary
- Use for: Main actions, CTAs
- Example: "Start Workout", "Create New Workout"

### Secondary
- Use for: Alternative actions
- Example: "Cancel", secondary options

### Success
- Use for: Confirmation actions
- Example: "Complete", "Finish"

### Danger
- Use for: Destructive actions
- Example: "Delete", "Remove"

### Ghost
- Use for: Minimal emphasis actions
- Example: Toolbar buttons, icons

---

## Interactive States

### Hover States
- Cards: `hover:bg-primary/5 dark:hover:bg-primary/10`
- Buttons: Defined in Button component
- Links: `hover:text-primary`

### Active/Selected States
- Use border color: `border-primary dark:border-blue-400`
- Use background tint: `bg-primary/10`
- Show visual indicators (icons, badges)

### Disabled States
- Reduced opacity: `opacity-50`
- No pointer: `cursor-not-allowed`
- Gray scale where appropriate

---

## Responsive Design

### Mobile-First Approach
- Default styles target mobile (320px+)
- Add breakpoints for larger screens when needed

### Common Breakpoints
- **sm:** 640px (large phones)
- **md:** 768px (tablets)
- **lg:** 1024px (small laptops)
- **xl:** 1280px (desktops)

### Layout Principles
- Single column on mobile
- Grid layouts use responsive columns: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Bottom navigation for primary navigation (mobile-friendly)

---

## Dark Mode Support

### Implementation
- Every component MUST support dark mode
- Use Tailwind's `dark:` variant for all color properties
- Test in both light and dark modes

### Color Pairings
Always pair light/dark colors:
```
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400
bg-white dark:bg-gray-800
border-gray-200 dark:border-gray-700
```

---

## Transition & Animation

### Standard Transitions
- Use: `transition-colors` for color changes
- Use: `transition-all` for multiple property changes
- Duration: Default (150-200ms) for most transitions

### Animation Use Cases
- Hover states
- Modal open/close
- Collapsible sections
- Loading states

### Performance
- Avoid animating layout properties (width, height)
- Prefer: opacity, transform, color

---

## Accessibility Considerations

### Contrast Ratios
- Ensure WCAG AA compliance minimum
- Test text on backgrounds in both light/dark mode
- Icons should have adequate contrast

### Interactive Elements
- Clickable areas should be at least 44x44px (mobile)
- Focus states visible for keyboard navigation
- Semantic HTML elements where possible

### Screen Readers
- Use semantic headings (h1, h2, h3)
- Provide alt text for meaningful images/icons
- Use ARIA labels when needed

---

## Component Reusability

### When to Create Shared Components
- Pattern is used 3+ times across the app
- Component has complex logic worth encapsulating
- Maintaining consistency is important

### Current Shared Components
- `Layout.jsx` - Page wrapper
- `NavBar.jsx` - Bottom navigation
- `Button.jsx` - Styled button
- `ExercisePersonalizationModal.jsx` - Customization modal
- `ExerciseSwitcherModal.jsx` - Exercise replacement modal

---

## Common Patterns Reference

### List with Section Headers
```jsx
<div className="mb-8">
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
    Section Title
  </h2>
  <div className="space-y-3">
    {items.map(item => (
      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        {/* Card content */}
      </div>
    ))}
  </div>
</div>
```

### Metric Display Cards
```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
    <Icon size={16} />
    <span className="text-sm">Label</span>
  </div>
  <p className="text-2xl font-bold text-gray-900 dark:text-white">
    Value
  </p>
</div>
```

---

## Design Checklist for New Features

When adding new pages or major features, ensure:

- [ ] Page uses centered hero header with 48px icon, text-3xl title, and subtitle
- [ ] Empty states use decorative circular background with engaging content
- [ ] All text has dark mode variants
- [ ] Cards use standard styling (bg-white dark:bg-gray-800, rounded-lg, etc.)
- [ ] Spacing follows system (mb-8 for headers, p-6 for pages, pb-24 for scrollable content)
- [ ] Icons use appropriate sizes and colors from the system
- [ ] Typography uses defined scale (text-3xl for titles, text-xl for sections)
- [ ] Interactive elements have hover and active states
- [ ] Component is mobile-first and responsive
- [ ] Contrast ratios are accessible

---

## Maintenance Notes

### When to Update These Guidelines
- New design patterns emerge and are used 2+ times
- Existing patterns are refined or improved
- User feedback indicates confusion or inconsistency
- Major redesigns or theme updates

### Communication
- Share these guidelines with all contributors
- Reference in code reviews
- Link to this document in relevant components

---

This design system ensures that **every page feels like part of the same app**, creating a cohesive and professional user experience.
