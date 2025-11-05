# Design Guidelines: TYT/AYT Fizik Çözüm Platformu

## Design Approach

**System-Based Approach**: Material Design principles adapted for educational context, ensuring clarity, consistency, and efficiency. The platform prioritizes usability and content readability over decorative elements, aligning with student needs during exam preparation.

**Core Philosophy**: Clean, distraction-free interface that puts physics problems and solutions front and center. Every element serves a functional purpose in the learning journey.

## Typography System

**Font Families**:
- Primary: 'Inter' (via Google Fonts) - exceptional readability for UI elements and body text
- Monospace: 'JetBrains Mono' - for mathematical formulas, equations, and code-like content

**Type Scale**:
- Display/Hero: text-4xl to text-5xl, font-bold (landing hero only)
- Page Titles: text-3xl, font-bold
- Section Headers: text-2xl, font-semibold  
- Card Titles: text-xl, font-semibold
- Body Text: text-base, font-normal
- Small/Meta: text-sm, font-normal
- Captions: text-xs, font-medium

**Hierarchy Rules**:
- Problem questions: text-lg, font-medium, leading-relaxed for easy scanning
- Solution steps: text-base with generous line-height (leading-7)
- Mathematical expressions: Larger sizing (text-lg) in monospace for clarity
- Metadata (topic, difficulty): text-sm, font-medium, uppercase tracking

## Layout System

**Spacing Primitives**: Consistent use of Tailwind units: **2, 4, 6, 8, 12, 16, 20, 24**
- Micro spacing (between related elements): p-2, gap-2
- Standard spacing (form fields, cards): p-4, gap-4, m-4
- Section spacing: p-8, py-12, gap-8
- Major sections: py-16, py-20

**Container Strategy**:
- Maximum width: max-w-6xl for main content areas
- Form containers: max-w-md centered
- Problem display: max-w-4xl for optimal reading
- Admin tables: max-w-7xl for data density

**Grid System**:
- Single column on mobile (base)
- Two columns for side-by-side content on tablet (md:grid-cols-2)
- Admin dashboard: Up to 3-column layouts (lg:grid-cols-3) for user cards

## Component Library

### Authentication Pages (Register/Login)

**Layout**: Centered card approach with split-screen on desktop
- Mobile: Single centered card, max-w-md, p-8
- Desktop: Optional side panel with platform benefits/features illustration

**Form Structure**:
- Input fields with floating labels or top-aligned labels
- Clear field grouping with gap-6 between form groups
- Icon prefixes for username/password fields (Heroicons: user, lock)
- Password visibility toggle icon
- Prominent CTA button, w-full, py-3, rounded-lg
- Alternative action links (text-sm, underline) below primary CTA
- Error messages: text-sm, mt-2, with warning icon

### Main Problem Solving Interface

**Header/Navigation**:
- Sticky top bar (sticky top-0, z-50)
- Logo/brand on left
- User menu/avatar on right (dropdown with logout)
- Navigation breadcrumbs if multi-page
- Height: h-16, px-6

**Problem Input Section**:
- Card-based design with clear visual separation
- Image upload area: Dashed border card, min-h-48, rounded-lg
  - Drag-and-drop visual indicator
  - Or click to upload button
  - Preview thumbnail after upload
- Text input: Textarea, min-h-32, rounded-lg, p-4
- Submit button: Large, prominent, w-full md:w-auto, px-8, py-3

**Solution Display Area**:
- Structured card layout with clear sections
- Each solution component in distinct visual blocks:
  - Topic badge: Inline badge, rounded-full, px-4, py-1, text-sm
  - Problem summary card: p-6, rounded-lg, border
  - Given data section: List format with bullet points or icons
  - Solution steps: Numbered list, each step in p-4 card
  - Final answer: Highlighted box, p-6, border-2, rounded-lg

**State Management**:
- Loading state: Spinner with centered message
- Empty state: Centered icon + helpful text
- Error state: Alert box with icon, retry button

### Admin Panel

**Sidebar Navigation**:
- Fixed sidebar on desktop (w-64), collapsible on mobile
- Navigation items: py-3, px-4, rounded-md
- Active state: Distinct visual treatment
- Icons from Heroicons: users, chart-bar, cog

**User Management Table**:
- Responsive table with horizontal scroll on mobile
- Column headers: Sticky, font-semibold, text-sm
- Row height: h-16 for comfortable tap targets
- Actions column: Icon buttons grouped, gap-2
- Pagination controls at bottom

**User Cards (Mobile Alternative)**:
- On small screens, convert table to cards
- Each card: p-4, rounded-lg, border, gap-3
- User info: Avatar (w-12, h-12, rounded-full) + name/username stack
- Status badges: Inline, rounded-full
- Action buttons: Bottom of card, grid-cols-2

### Shared Components

**Buttons**:
- Primary: px-6, py-3, rounded-lg, font-semibold, transition
- Secondary: px-6, py-3, rounded-lg, border-2, font-semibold
- Icon-only: p-3, rounded-lg (for actions)
- Disabled state: opacity-50, cursor-not-allowed

**Cards**:
- Base: p-6, rounded-xl, border or shadow-md
- Hover state: shadow-lg, transition
- Compact variant: p-4, rounded-lg

**Badges**:
- Status badges: px-3, py-1, rounded-full, text-xs, font-medium
- Topic tags: px-4, py-2, rounded-lg, text-sm

**Modals/Dialogs**:
- Overlay: Fixed, inset-0, backdrop-blur
- Content: Centered, max-w-md, p-6, rounded-xl
- Header: pb-4, border-b
- Footer: pt-4, flex justify-end, gap-3

**Alerts/Notifications**:
- Fixed positioning: top-4, right-4
- Toast style: px-6, py-4, rounded-lg, shadow-lg
- Auto-dismiss with slide-out animation

## Icon System

**Library**: Heroicons (outline variant for most, solid for emphasis)

**Common Icons**:
- Authentication: user-circle, lock-closed, eye, eye-slash
- Actions: pencil, trash, check, x-mark
- Status: check-circle, exclamation-circle, information-circle
- Navigation: bars-3, chevron-right, arrow-left
- Upload: photo, document-text, arrow-up-tray

**Icon Sizing**:
- Small (inline with text): w-4, h-4
- Standard (buttons): w-5, h-5
- Large (empty states): w-16, h-16

## Accessibility Standards

- All form inputs: Proper labels, aria-labels, placeholder text
- Focus states: ring-2, ring-offset-2 on all interactive elements
- Keyboard navigation: Logical tab order throughout
- Color contrast: Ensure WCAG AA compliance (will be verified in implementation)
- Touch targets: Minimum 44x44px on mobile (py-3, px-4 achieves this)

## Responsive Breakpoints

- Mobile-first approach (base styles for mobile)
- Tablet: md: (768px) - Two-column layouts emerge
- Desktop: lg: (1024px) - Full multi-column, sidebar visible
- Large desktop: xl: (1280px) - Maximum content width constrains

## Animation Guidelines

**Minimal Animation Philosophy**: Animations used sparingly only where they enhance usability

**Allowed Animations**:
- Page transitions: Simple fade-in on mount
- Loading spinners: Subtle rotate animation
- Button interactions: Quick scale or shadow changes on hover/active
- Dropdown/modal: Slide-in from top (200ms ease-out)
- Toast notifications: Slide-in from right

**Forbidden**:
- Scroll-triggered animations
- Parallax effects
- Decorative animations without functional purpose

## Images

**Hero Section** (if landing page exists):
- Large hero image showing students studying physics or educational environment
- Minimum height: min-h-96 on desktop
- Image overlay: Dark gradient overlay for text contrast
- CTA button on hero: Blurred background (backdrop-blur-md), no hover background changes

**Additional Images**:
- Empty state illustrations: Centered, max-w-xs
- Avatar placeholders: Circular, w-12 or w-16
- No decorative images in main application interface - keep focused on functionality

## Platform-Specific Considerations

**Turkish Language Support**:
- Ensure proper UTF-8 encoding for Turkish characters (ş, ğ, ı, etc.)
- Text inputs support Turkish keyboard layout
- All interface text in Turkish

**Educational Context**:
- Clean, professional aesthetic appropriate for exam preparation
- No gamification elements that might seem frivolous
- Focus on efficiency - students have limited study time
- Clear visual hierarchy in solution displays for quick comprehension

## Critical Implementation Notes

- Forms validate on submit, show inline errors near fields
- Solution output preserves mathematical notation formatting
- Mobile interface prioritizes one-handed usability
- Admin panel includes confirmation modals for destructive actions
- All data tables include search/filter capabilities
- Session timeout warnings before automatic logout