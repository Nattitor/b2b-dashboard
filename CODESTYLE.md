# ✦ Nattitor | Personal Brand & Code Style

This document defines the **Design Signature** and **Engineering Standards** for all projects developed under the *Nattitor* brand. It serves as a manifesto for creating software that is technically excellent, brutally aesthetic, and highly performant.

---

## 1. Design Signature (Aesthetics)

### 1.1 The Vibe: "Brutalist Premium"
We reject generic, overly clean corporate templates. The Nattitor signature is **Dark Brutalism fused with Premium Glassmorphism**.
- **Dark Mode Default:** UIs are born in the dark. We use deep space blacks/blues, not flat grays.
- **Asymmetry:** Layouts should feel organic and slightly rebellious. We favor Bento Grids and asymmetrical spacing.
- **High Contrast Typography:** Massive, bold headings contrasted with technical, monospaced metadata.

### 1.2 Color Palette
- **Deep Void (Backgrounds):** `#0A0E17` (Slate 950 variant)
- **Vega Cyan (Primary Accent):** `#00E5FF` — Used for active states, hover effects, and primary CTAs.
- **Nebula Purple (Secondary Accent):** `#243870` — Used for deep glows, shadows, and subtle active states.
- **Terminal Green (Success):** `#10B981` — Used strictly for positive feedback (e.g., "Copied to clipboard").
- **Glass/Borders:** `rgba(255, 255, 255, 0.1)` — Borders are always subtle.

### 1.3 Typography
- **Headings & Display:** *Space Grotesk* (Font weight: 700/900). Massive, uppercase, tight tracking.
- **Body & UI:** *Inter*. Clean, highly readable.
- **Metadata & Code:** *JetBrains Mono* or default monospace for tags, pills, and technical data.

### 1.4 The "Glass Panel" Standard
Instead of stacking random Tailwind utilities, we use a strict architectural class for cards:
```css
.glass-panel {
  @apply bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl;
}
```

---

## 2. Interaction Design (UX/Motion)

### 2.1 The "No Fake Hover" Rule
Mobile devices do not have hover states. We explicitly disable hover effects on mobile using `md:hover:` to prevent "sticky hover" bugs. Interactions on touch devices rely on `active:scale-95` to provide immediate physical feedback.

### 2.2 Framer Motion Physics
We do not use linear, generic animations. We use heavy, industrial spring physics:
```typescript
// Nattitor Signature Spring
const spring = { type: "spring", stiffness: 350, damping: 25, mass: 0.5 };
```
- **Magnetic Elements:** Primary CTAs must "pull" toward the cursor to feel alive.
- **Micro-interactions:** Buttons scale down (`scale: 0.95`) when clicked.
- **Scroll Tracking:** Sections should reveal themselves smoothly using Intersection Observers.

---

## 3. Engineering Architecture

### 3.1 Next.js App Router (Server-First)
- **Server Components by Default:** All structural components (`layout.tsx`, `page.tsx`) must be Server Components.
- **Client Islands:** Use `"use client"` *only* on the specific leaf components that require `useState`, `framer-motion`, or DOM access.

### 3.2 Logic Extraction (SRP)
Visual components must be purely declarative. If a component has more than 10 lines of logic (e.g., filtering, translations, clipboard management), that logic **must** be extracted into a custom hook.
- ✅ `const { copy, copied } = useClipboard();`
- ❌ Putting `navigator.clipboard` inside the `Button.tsx` component.

### 3.3 State Management & i18n
- **Cookies over LocalStorage:** For critical state like Language (i18n) or Theme, we use Cookies. This allows the Next.js Server to read the state *before* rendering the HTML, entirely eliminating the "Hydration Mismatch" flicker.

### 3.4 Tailwind Best Practices
- Never use inline CSS (`style={{ ... }}`) unless strictly necessary for dynamic values calculated via JS (like `useTransform` en Framer Motion).
- Use `cn()` (clsx + tailwind-merge) para combinaciones dinámicas de clases para evitar conflictos.

---

## 4. The Golden Rule
> *"If it feels like a standard website, it's not a Nattitor project. It must feel like a native, premium software experience."*
