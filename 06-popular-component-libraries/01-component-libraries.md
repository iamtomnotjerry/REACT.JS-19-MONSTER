# Modern React Component Libraries: DaisyUI, Radix UI & Shadcn/ui 📦

When building modern React applications, writing every UI component (buttons, modals, dropdowns) from scratch is time-consuming. Component libraries speed up development. Today, the React ecosystem has shifted from heavy runtime component libraries (like Material UI or Chakra UI) toward lightweight, tailwind-integrated solutions: **DaisyUI**, **Radix UI**, and **Shadcn/ui**.

In this lesson, we will compare library paradigms and learn how to implement DaisyUI, Radix UI, and Shadcn/ui — including a live theme-switching example.

---

## 🌍 Concept & Overview

A component library is a pre-built toolbox of UI parts so you do not reinvent the same button or dialog in every project. But not all toolboxes work the same way. Some hand you finished, painted furniture (CSS-only). Some hand you the *mechanism* — hinges, locks, sliders that already work — and let you paint them however you like (headless). And some let you literally copy the blueprint into your own workshop so you fully own and can rebuild every joint (component copying).

> [!NOTE]
> **DaisyUI**, **Radix UI**, and **Shadcn/ui** are not really competitors that you must choose *between*. They live at different layers. DaisyUI is pure CSS. Radix UI is unstyled behavior. Shadcn/ui actually *combines* Radix UI (behavior) + Tailwind (styling) into copyable source files. Knowing the layer each one occupies is the real lesson.

> [!TIP]
> Shadcn/ui uses `class-variance-authority` (CVA) to define structured component states (variants, sizes). This allows you to scale component properties in a clean, type-safe manner.

> [!WARNING]
> DaisyUI is **CSS-only** — it ships zero JavaScript. That means interactive elements like modals, dropdowns, and accordions do **not** open and close by themselves. You must wire up React state (`useState`) or a CSS toggle yourself. Beginners often think DaisyUI is "broken" when a modal won't open; in reality it is working exactly as designed.

### A Real-World Metaphor 🏠

Think of furnishing a room:

| Approach | Real-world analogy | Library |
| :--- | :--- | :--- |
| CSS-only utility | Buy a finished, painted chair from the store | DaisyUI |
| Headless / unstyled | Buy a working recliner *mechanism* and upholster it yourself | Radix UI |
| Component copying | Get the full blueprint + parts, assemble it in your own workshop, then tweak any screw | Shadcn/ui |

---

## ⚡ 1. Library Paradigms: CSS-only vs Headless vs Component Copying

Understanding these three paradigms is key to choosing the right tool:

| Paradigm | How it Works | Examples | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **CSS-only Utility** | Pure CSS classes built on Tailwind. No React JS runtime. | DaisyUI | Extremely fast, small bundle size, framework agnostic. | Interactive elements (modals, dropdowns) require manual state toggling in React. |
| **Headless (Unstyled)** | React logic and accessibility are provided, styling is completely left to you. | Radix UI, Headless UI | Perfect accessibility (A11y), complete design freedom. | Must write all CSS/Tailwind classes from scratch. |
| **Component Copying** | A CLI builds components directly in your source folder using Radix primitives + Tailwind. | Shadcn/ui | Direct code ownership, 100% customizable, no npm package dependency. | Requires initial CLI setup and boilerplate code in your project. |

### How the layers stack

```text
┌─────────────────────────────────────────────┐
│  Shadcn/ui  (copy-paste source you own)       │
│  ┌───────────────────────┐  ┌──────────────┐ │
│  │  Radix UI primitives  │  │  Tailwind CSS │ │
│  │  (behavior + a11y)    │  │  (styling)    │ │
│  └───────────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────┘

DaisyUI  →  sits on top of Tailwind CSS, pure class names, no JS
```

---

## ⚡ 2. Working with DaisyUI

**DaisyUI** is a Tailwind CSS plugin. Instead of writing long Tailwind utility strings like `px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600`, you use semantically named component classes like `btn btn-primary`.

### Installation & Setup

1. Install DaisyUI as a dev dependency:
```bash
npm install -D daisyui@latest
```

2. Add DaisyUI to your `tailwind.config.js` plugins array:
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // Optionally configure daisyUI themes
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
```

### React Usage Example
Since DaisyUI is pure CSS, interactive components like modals require React state to toggle visibility:

```jsx
import React, { useState } from 'react';

export const DaisyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* DaisyUI Button classes */}
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      {/* Modal markup controlled by React state */}
      <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-slate-900 text-white">
          <h3 className="font-bold text-lg">Hello DaisyUI!</h3>
          <p className="py-4">This modal is styled using DaisyUI components and controlled via React useState.</p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 🎨 Live Theme Switching (DaisyUI `data-theme`)

One of DaisyUI's best features is built-in theming. Every DaisyUI theme is applied via the `data-theme` attribute on a wrapping element (commonly `<html>` or a top-level `<div>`). Because it is just an HTML attribute, switching themes at runtime is as simple as updating a React state value — no extra JS library needed.

```jsx
import React, { useState } from 'react';

// The themes you enabled in tailwind.config.js -> daisyui.themes
const THEMES = ['light', 'dark', 'cupcake'];

export const ThemeSwitcher = () => {
  // Current active DaisyUI theme, stored in React state
  const [theme, setTheme] = useState('light');

  return (
    // The data-theme attribute drives ALL DaisyUI colors below it
    <div data-theme={theme} className="min-h-screen p-8 bg-base-100 text-base-content">
      <h1 className="text-2xl font-bold mb-4">Current theme: {theme}</h1>

      {/* A simple dropdown to pick a theme */}
      <select
        className="select select-bordered mb-6"
        value={theme}
        onChange={(e) => setTheme(e.target.value)} // Update state -> data-theme re-renders
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* These components instantly recolor when the theme changes */}
      <div className="flex gap-2">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-accent">Accent</button>
      </div>
    </div>
  );
};
```

> [!TIP]
> To persist the chosen theme across page reloads, store it in `localStorage` and read it back inside a `useEffect` on mount. DaisyUI also offers a built-in `theme-controller` checkbox class if you prefer a CSS-only toggle with no React state at all.

---

## ⚡ 3. Working with Radix UI (Standalone)

**Radix UI** is a *headless* primitive library. It gives you fully accessible, keyboard-navigable, unstyled behavior — and you bring your own design. This is different from Shadcn/ui: with Radix you install the npm packages and use the primitives directly; with Shadcn you copy pre-styled wrappers around those same primitives.

Radix ships two things people commonly use:
- **Radix Themes** — an optional, styled, pre-built design system (`@radix-ui/themes`).
- **Radix Primitives** — the unstyled behavior building blocks (e.g. `@radix-ui/react-dialog`).

### Installation

```bash
# Option A: the full styled Radix Themes design system
npm install @radix-ui/themes

# Option B: a single unstyled primitive (you can install only what you need)
npm install @radix-ui/react-dialog
```

### Wrapping your app with Theme / ThemeProvider

If you use **Radix Themes**, you import its CSS once and wrap your application in a `<Theme>` provider. Everything inside inherits Radix tokens (colors, radius, spacing).

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css"; // Radix Themes base styles (import ONCE)
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Theme is Radix's provider: it sets color palette, radius, scaling, dark/light appearance */}
    <Theme accentColor="iris" radius="large" appearance="light">
      <App />
    </Theme>
  </React.StrictMode>
);
```

```tsx
// src/App.tsx — using Radix Themes pre-built components
import { Button, Card, Flex, Heading } from "@radix-ui/themes";

export default function App() {
  return (
    <Card size="3" style={{ maxWidth: 360, margin: "40px auto" }}>
      <Flex direction="column" gap="3">
        <Heading>Hello from the Radix theme</Heading>
        {/* Styled by Radix tokens defined in <Theme> */}
        <Button>Get Started</Button>
      </Flex>
    </Card>
  );
}
```

### Using a Radix Primitive directly (unstyled, you style it)

This is the part that makes Radix distinct from Shadcn: you consume the raw primitive and apply your own classes. The primitive handles focus trapping, `Esc` to close, ARIA roles, and scroll locking for you.

```tsx
// src/AlertDialogExample.tsx
import * as Dialog from "@radix-ui/react-dialog";

export const AlertDialogExample = () => {
  return (
    // Dialog.Root manages open/close state internally (no useState needed)
    <Dialog.Root>
      {/* Trigger is the button that opens the dialog */}
      <Dialog.Trigger className="btn btn-primary">Open Dialog</Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay = dimmed background. We style it ourselves with Tailwind */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        {/* Content = the dialog box. Radix handles focus + Esc + a11y automatically */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-lg font-bold">Confirm action</Dialog.Title>
          <Dialog.Description className="py-2 text-slate-600">
            This dialog is fully accessible out of the box — but every pixel of styling is yours.
          </Dialog.Description>
          <Dialog.Close className="btn mt-4">Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

> [!NOTE]
> Notice the Radix primitive needs **no `useState`** to open and close — the `Dialog.Root` owns that state internally. Contrast this with the DaisyUI modal above, where *you* tracked `isOpen` manually. That is the core trade-off: Radix gives you behavior for free; DaisyUI gives you styling for free.

---

## ⚡ 4. Working with Shadcn/ui

**Shadcn/ui** is not a dependency library. It is a collection of reusable components that you copy and paste into your apps. It uses **Radix UI** for accessible behavior (keyboard navigation, screen readers) and **Tailwind CSS** for styling.

### Installation

1. Run the initialization CLI in your project root:
```bash
npx shadcn@latest init
```
This CLI asks questions (TypeScript choice, Tailwind CSS file path, global variables) and creates `components.json`, initializes theme variables in `global.css`, and creates a `src/lib/utils.ts` file containing the `cn` helper.

2. Add a component (e.g. Button):
```bash
npx shadcn@latest add button
```
This downloads a file directly to `src/components/ui/button.tsx`.

### React Usage Example

Because the component file resides in your project source, you import it locally and can modify its code directly:

```tsx
// src/components/ui/button.tsx (created by shadcn CLI)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

In your application code:
```tsx
import { Button } from "@/components/ui/button";

export const App = () => {
  return (
    <div className="p-4 flex gap-2">
      <Button variant="default">Shadcn Button</Button>
      <Button variant="destructive" size="sm">Delete Account</Button>
    </div>
  );
};
```

> [!TIP]
> Shadcn/ui uses `class-variance-authority` (CVA) to define structured component states (variants, sizes). This allows you to scale component properties in a clean, type-safe manner.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. Why is Shadcn/ui not considered a standard npm library?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because you do not install it as an npm dependency module (e.g. it is not listed in `dependencies` of your package.json). Instead, you use a CLI tool to copy the source code of individual components directly into your own codebase (`src/components/ui/`). This gives you full ownership and edit capability over the component's internal logic and styles.
</details>

### 2. What is the role of Radix UI inside Shadcn/ui components, and how does using Radix *directly* differ?
<details>
  <summary><b>Reveal Answer</b></summary>

  Radix UI provides **headless primitives** that handle complex accessibility (A11y) standards, keyboard navigation controls, focus management, and semantic DOM structure. Shadcn/ui packages these accessible primitives and styles them using Tailwind CSS classes. When you use Radix UI **directly** (e.g. `@radix-ui/react-dialog`), you install the npm package yourself and apply your own styling to the unstyled primitive — there is no pre-styled wrapper. Shadcn simply does that styling step for you and hands you the resulting source file.
</details>

### 3. How does DaisyUI keep bundle sizes small compared to runtime JS libraries like Material UI?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI adds pure utility CSS rules to your Tailwind bundle. It does not contain runtime JavaScript engines, inline CSS objects, or rendering frameworks. Tailwind's build process purges unused CSS, leaving only the utilized classes in the final production stylesheet.
</details>

### 4. In DaisyUI, what attribute drives theme switching, and how do you change it at runtime in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `data-theme` attribute on a wrapping element controls every DaisyUI color token beneath it. To switch themes at runtime you store the active theme in React state (e.g. `const [theme, setTheme] = useState('light')`) and bind it to `data-theme={theme}`. Updating the state via an `onChange` handler re-renders the subtree with the new theme — no extra library required. You can persist it via `localStorage`.
</details>

### 5. When should you prefer DaisyUI over Radix/Shadcn, and what is the key trade-off?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI is ideal for fast prototyping, simple websites with minimal complex interaction, or projects where you want to style HTML elements (forms, layouts) immediately using clean, semantic CSS names. The key trade-off: DaisyUI gives you **styling for free but no behavior** (you wire up `useState` for modals/dropdowns yourself), whereas Radix/Shadcn give you **accessible behavior for free** (focus trapping, keyboard nav, ARIA) and are preferred for robust, highly interactive, accessibility-critical applications.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Build a Responsive DaisyUI Navbar with a Working Theme Switcher
1. Configure DaisyUI in a React test project and enable at least three themes (`light`, `dark`, `cupcake`) in `tailwind.config.js`.
2. Build a navbar using the `navbar`, `navbar-start`, `navbar-center`, and `navbar-end` classes from DaisyUI.
3. Add a theme-switching `<select>` (or dropdown) in `navbar-end` backed by `useState`, binding the chosen value to a `data-theme` attribute on the page wrapper (reuse the `ThemeSwitcher` pattern from Section 2).
4. **Bonus:** Persist the selected theme to `localStorage` and restore it on mount with `useEffect` so the choice survives a page refresh.

### 🛠️ Exercise 2: Use a Radix Primitive Directly (No Shadcn)
1. In a fresh React + TypeScript project, install only `@radix-ui/react-dialog` (do **not** run the shadcn CLI).
2. Build an accessible confirmation dialog using `Dialog.Root`, `Dialog.Trigger`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, and `Dialog.Close`, styling each part with your own Tailwind classes.
3. Verify the accessibility behavior you got for free: pressing `Esc` closes the dialog, focus is trapped inside while open, and focus returns to the trigger on close.
4. **Reflection:** Note how many lines of state-management code you wrote versus the DaisyUI modal in Section 2 — this is the headless-vs-CSS-only trade-off in practice.

### 🛠️ Exercise 3: Customizing a Shadcn/ui Component
1. Initialize shadcn (`npx shadcn@latest init`) and add a button (`npx shadcn@latest add button`).
2. Open the generated `src/components/ui/button.tsx` and add a custom variant `"outline-rainbow"` that renders a thin double border with a high-contrast gradient.
3. Render your custom variant alongside the default and destructive variants to confirm the CVA `variants` map picks it up type-safely.
