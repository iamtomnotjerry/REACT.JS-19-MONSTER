# DaisyUI & Radix UI: Styled Classes vs Headless Primitives 🎨

When you build a real React app you spend an astonishing amount of time on the same handful of widgets — buttons, cards, navbars, modals, dropdowns. Writing each one from raw Tailwind utility strings (`px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600 …`) is slow, inconsistent, and accessibility is usually an afterthought. Component libraries fix this, but they solve it in two fundamentally different ways.

This lesson focuses on the two libraries the instructor demonstrates back-to-back in the course: **DaisyUI** — a Tailwind plugin that hands you ready-made, semantically named CSS classes — and **Radix UI** — a set of headless, fully-accessible behavior primitives you style yourself. They sit at *opposite ends* of the same spectrum, and understanding why is the real lesson. (Shadcn/ui, which fuses Radix behavior with Tailwind styling into copyable source files, is covered separately in lesson 02.)

> [!NOTE]
> The instructor demonstrates installing DaisyUI into a Tailwind project, wiring it into the Tailwind config plugins, and toggling a DaisyUI modal; and separately scaffolding a Vite project with Radix and wrapping the app in Radix's `<Theme>` provider. Everything here is grounded in that demo. A few details are **net-new** beyond the recording — specifically the **Tailwind v4 CSS-first `@plugin` setup** for DaisyUI 5, the `localStorage`-persisted theme switcher, and the fully keyboard-navigable Radix `DropdownMenu` example. Those reflect current (2026) best practices and are called out where they appear.

---

## 🌍 Concept & Overview

A component library is a pre-built toolbox so you do not reinvent the same button in every project. But two toolboxes can be philosophically opposite.

**DaisyUI** hands you finished, painted furniture: you write `class="btn btn-primary"` and a styled button appears. It is *pure CSS* — zero JavaScript ships. That makes it tiny and framework-agnostic, but it also means anything *interactive* (a modal opening, a dropdown toggling) has no brain of its own. You supply the brain with React.

**Radix UI** hands you the opposite: a working *mechanism* with no paint. A Radix `Dialog` already traps focus, closes on `Esc`, restores focus to the trigger, sets every ARIA attribute, and locks body scroll — but it renders completely unstyled. You bring the Tailwind.

### A Real-World Metaphor 🏠

Think about furnishing a room:

| Approach | Real-world analogy | Library | What you get free | What you must add |
| :--- | :--- | :--- | :--- | :--- |
| CSS-only utility | Buy a finished, painted chair from the store | **DaisyUI** | Styling, themes, look-and-feel | Behavior — wire up `useState` for modals/dropdowns |
| Headless / unstyled | Buy a working recliner *mechanism* and upholster it yourself | **Radix UI** | Behavior + accessibility (focus, keyboard, ARIA) | Every pixel of styling |

The punchline: **DaisyUI gives you styling for free but no behavior; Radix gives you behavior for free but no styling.** They are not rivals — many production apps use *both*, DaisyUI for layout and quick widgets, Radix for the interactive bits that must be accessible.

### How the layers relate

```text
                Tailwind CSS  (utility classes)
                      │
        ┌─────────────┴──────────────┐
        ▼                            ▼
   DaisyUI                      (your hand-written
   (semantic classes:           Tailwind classes)
    btn, card, modal,                 ▲
    navbar, dropdown)                 │
        │                            │
   PURE CSS                     applied on top of
   no JavaScript                      │
                                      ▼
                                 Radix UI
                                 (headless behavior:
                                  focus trap, Esc,
                                  ARIA, keyboard nav)
                                 NO styling of its own
```

> [!WARNING]
> DaisyUI ships **zero JavaScript**. Interactive elements like modals, dropdowns, and accordions do **not** open and close by themselves. You must drive them with React state (`useState`) or a CSS toggle. Beginners often think DaisyUI is "broken" when a modal won't open — in reality it is working exactly as designed. Radix is the inverse: it has all the behavior and *no* styling, so a Radix dialog you forget to style looks like unstyled HTML.

---

## ⚡ 1. DaisyUI — Semantic Classes on Top of Tailwind

**DaisyUI** is a Tailwind CSS plugin. Instead of writing a long utility string for every button, you use one semantic class name. As the instructor puts it: "instead of writing all of these Tailwind CSS classes, you no longer have to — now you can use DaisyUI to only write a few classes and it will give you the same result."

```html
<!-- Without DaisyUI: a wall of utilities, repeated everywhere -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
  Click me
</button>

<!-- With DaisyUI: one semantic class, themed automatically -->
<button class="btn btn-primary">Click me</button>
```

Common DaisyUI component classes you will reach for constantly:

| Class family | Purpose | Example |
| :--- | :--- | :--- |
| `btn` | Buttons, with color modifiers | `btn btn-primary`, `btn btn-ghost`, `btn-sm` |
| `card` | Content cards | `card`, `card-body`, `card-title` |
| `navbar` | Top navigation bar | `navbar`, `navbar-start`, `navbar-center`, `navbar-end` |
| `modal` | Dialog box (needs React to toggle) | `modal`, `modal-box`, `modal-action`, `modal-open` |
| `dropdown` | Menu (needs React/CSS to toggle) | `dropdown`, `dropdown-content` |
| `select` / `input` | Form controls | `select select-bordered`, `input input-bordered` |

### 🛠️ Installation & Setup

The instructor's flow is: scaffold a Vite + Tailwind project, then add DaisyUI as a dev dependency and register it as a Tailwind plugin. There are **two** valid setups depending on your Tailwind version.

**Setup A — Tailwind v3 (`tailwind.config.js` plugins array):**

```bash
npm install -D daisyui@latest
```

```javascript
// tailwind.config.js — Tailwind v3 style
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  // Register DaisyUI as a Tailwind plugin
  plugins: [require("daisyui")],
  // Enable the themes you want available at runtime
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
```

**Setup B — Tailwind v4 + DaisyUI 5 (CSS-first, NET-NEW):**

> [!NOTE]
> This CSS-first form is **net-new** beyond the recording. Tailwind v4 dropped the JS config file in favor of configuration directly inside your CSS entry point. With DaisyUI 5 you register it with `@plugin` and declare themes with `@plugin "daisyui" { themes: ... }`. There is no `tailwind.config.js` at all.

```css
/* src/index.css — Tailwind v4 + DaisyUI 5 */
@import "tailwindcss";

/* Register the DaisyUI plugin and enable themes in one block */
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, cupcake;
}
```

Either way, once it is installed you can drop DaisyUI classes straight into JSX:

```tsx
// src/App.tsx — DaisyUI classes, no extra config needed in the component
export default function App() {
  return (
    <div className="p-8 flex flex-wrap gap-3">
      <button className="btn">Neutral</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-accent">Accent</button>
      <button className="btn btn-ghost">Ghost</button>
    </div>
  );
}
```

### 🧩 A DaisyUI Modal — Why It Needs `useState`

In the demo, the instructor copies the DaisyUI modal markup and discovers it only opens once React drives it. Because DaisyUI is pure CSS, the modal's open/closed state is just the presence or absence of the `modal-open` class — and *you* decide when that class is applied.

```tsx
// src/DaisyModal.tsx
import { useState } from "react";

export function DaisyModal() {
  // DaisyUI has no JS, so WE own the open/closed state.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      {/* The trigger button uses DaisyUI's btn classes */}
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      {/*
        The `modal-open` class is what actually makes the modal visible.
        We toggle it from React state — without this line nothing happens.
      */}
      <div className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello DaisyUI!</h3>
          <p className="py-4">
            This modal is styled by DaisyUI but opened/closed by React state.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

> [!WARNING]
> Notice what DaisyUI does **not** give you here: pressing `Esc` does not close this modal, focus is not trapped inside it, and clicking the dimmed backdrop does nothing — unless you wire all of that up yourself. That accessibility gap is exactly the problem Radix solves in the next section.

### 🎨 Live Theme Switching with `data-theme`

DaisyUI's signature feature is theming. Every theme is applied through a single HTML attribute — `data-theme` — on a wrapping element. Every DaisyUI color token (`bg-base-100`, `text-base-content`, `btn-primary`, …) beneath that element recolors automatically. Because it is *just an attribute*, switching themes at runtime is one React state update.

```tsx
// src/ThemeSwitcher.tsx
import { useState } from "react";

// These must match the themes you enabled in your DaisyUI config.
const THEMES = ["light", "dark", "cupcake"] as const;
type Theme = (typeof THEMES)[number];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    // The data-theme attribute drives EVERY DaisyUI color below it.
    <div
      data-theme={theme}
      className="min-h-screen p-8 bg-base-100 text-base-content"
    >
      <h1 className="text-2xl font-bold mb-4">Current theme: {theme}</h1>

      <select
        className="select select-bordered mb-6"
        value={theme}
        // Update state -> data-theme changes -> the subtree recolors instantly.
        onChange={(e) => setTheme(e.target.value as Theme)}
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-accent">Accent</button>
      </div>
    </div>
  );
}
```

> [!TIP]
> To make the choice survive a page reload (NET-NEW — not shown in the recording), persist it to `localStorage` and apply it to the document root. Putting `data-theme` on `<html>` themes the *entire* page, including portaled content that renders outside your component tree.

```tsx
// src/usePersistedTheme.ts — a reusable theme hook with persistence
import { useEffect, useState } from "react";

const THEMES = ["light", "dark", "cupcake"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "app-theme";

export function usePersistedTheme() {
  // Lazy initializer reads the saved theme ONCE on first render.
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved ?? "light";
  });

  // Whenever theme changes: apply it to <html> and persist it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme, themes: THEMES };
}
```

```tsx
// src/ThemePicker.tsx — consuming the persisted hook
import { usePersistedTheme } from "./usePersistedTheme";

export function ThemePicker() {
  const { theme, setTheme, themes } = usePersistedTheme();

  return (
    <select
      className="select select-bordered"
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
    >
      {themes.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
```

---

## ⚡ 2. Radix UI — Headless, Accessible Primitives

**Radix UI** is described in the course as "an open-source component library optimized for fast development, easy maintenance, and accessibility — just import and go." It ships two distinct things, and it is critical not to confuse them:

| Package | What it is | When to use |
| :--- | :--- | :--- |
| `@radix-ui/themes` | A **pre-styled** design system (Button, Card, Flex…) wrapped in a `<Theme>` provider | You want good-looking components fast with minimal styling work |
| `@radix-ui/react-*` (e.g. `react-dialog`, `react-dropdown-menu`) | **Headless primitives** — behavior + accessibility, zero styling | You want full design control and bring your own Tailwind |

The instructor demonstrates Radix **Themes**: scaffolding a Vite app, importing the Radix CSS once, and wrapping the app in `<Theme>`. The far more common production pattern — and the one that pairs with this lesson's "headless" theme — is using the **primitives** directly. We will cover both.

### 🛠️ Radix Themes (the instructor's demo)

```bash
# Scaffold a Vite + React project, then install Radix Themes
npm create vite@latest radix-demo -- --template react-ts
cd radix-demo
npm install
npm install @radix-ui/themes
```

```tsx
// src/main.tsx — import the CSS ONCE and wrap the app in <Theme>
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css"; // Radix Themes base styles — import exactly once
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <Theme> is Radix's provider: it sets the accent color, radius,
        scaling, and light/dark appearance for everything inside it. */}
    <Theme accentColor="iris" radius="large" appearance="light">
      <App />
    </Theme>
  </React.StrictMode>
);
```

```tsx
// src/App.tsx — using pre-built, pre-styled Radix Themes components
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";

export default function App() {
  return (
    <Card size="3" style={{ maxWidth: 360, margin: "40px auto" }}>
      <Flex direction="column" gap="3">
        <Heading>Hello from the Radix theme</Heading>
        <Text color="gray">Styled entirely by the tokens in &lt;Theme&gt;.</Text>
        <Button>Get Started</Button>
      </Flex>
    </Card>
  );
}
```

> [!NOTE]
> In the demo, after wrapping the app the instructor clears out the default `App.css` and `index.css` so Vite's starter styles stop fighting the Radix theme. If your Radix Themes app "doesn't look cool," leftover boilerplate CSS overriding the Radix tokens is the usual culprit.

### 🧩 Radix Primitives — Build an Accessible Dialog Styled with Tailwind

This is the headless workflow that makes Radix special. You install a single primitive and apply your *own* Tailwind classes. The primitive handles focus trapping, `Esc`-to-close, returning focus to the trigger, ARIA roles, and body scroll-locking — for free.

```bash
# Install only the primitive you need — each is a separate package
npm install @radix-ui/react-dialog
```

```tsx
// src/ConfirmDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";

export function ConfirmDialog() {
  return (
    // Dialog.Root owns the open/closed state INTERNALLY — no useState needed.
    <Dialog.Root>
      {/* Trigger is the button that opens the dialog. We style it with Tailwind. */}
      <Dialog.Trigger className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
        Delete account
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay = the dimmed backdrop. Radix renders it; we paint it. */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in" />

        {/* Content = the dialog box. Radix gives it focus trap + Esc + ARIA. */}
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          {/* Title and Description are wired to aria-labelledby/aria-describedby */}
          <Dialog.Title className="text-lg font-bold text-slate-900">
            Are you absolutely sure?
          </Dialog.Title>
          <Dialog.Description className="py-2 text-sm text-slate-600">
            This action cannot be undone. Your account and all data will be
            permanently removed.
          </Dialog.Description>

          <div className="mt-4 flex justify-end gap-2">
            {/* Dialog.Close closes the dialog from anywhere inside it */}
            <Dialog.Close className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
              Cancel
            </Dialog.Close>
            <Dialog.Close className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Yes, delete it
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

> [!NOTE]
> Look closely: there is **no `useState`** here. `Dialog.Root` owns the open state itself. Contrast this with the DaisyUI modal earlier where *you* tracked `isOpen` manually. That is the core trade-off restated — Radix gives behavior for free; DaisyUI gives styling for free.

### 🧩 A Fully Keyboard-Navigable DropdownMenu (NET-NEW)

> [!NOTE]
> This `DropdownMenu` example is **net-new** beyond the recording, included to show the accessibility payoff of headless primitives. The menu below supports arrow-key navigation, type-ahead, `Esc` to close, and `Enter`/`Space` to activate — all provided by Radix, none written by you.

```bash
npm install @radix-ui/react-dropdown-menu
```

```tsx
// src/UserMenu.tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type UserMenuProps = {
  // Typed callbacks so the parent decides what each action does.
  onProfile: () => void;
  onSettings: () => void;
  onSignOut: () => void;
};

export function UserMenu({ onProfile, onSettings, onSignOut }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded bg-slate-800 px-4 py-2 text-white">
        Account ▾
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/* Radix gives this menu: ↑/↓ to move, type-ahead, Esc to close,
            Enter/Space to select, and full focus management. */}
        <DropdownMenu.Content
          sideOffset={6}
          className="min-w-[200px] rounded-md border border-slate-200 bg-white p-1 shadow-lg"
        >
          <DropdownMenu.Item
            onSelect={onProfile}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100"
          >
            Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={onSettings}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100"
          >
            Settings
          </DropdownMenu.Item>

          {/* A visual separator with the correct ARIA role baked in */}
          <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />

          <DropdownMenu.Item
            onSelect={onSignOut}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

The `data-[highlighted]:` Tailwind selectors hook into Radix's data attributes: as the user arrows through the menu, Radix sets `data-highlighted` on the focused item and Tailwind styles it. You write *styling rules keyed to behavior states Radix manages* — that is the headless pattern in one sentence.

---

## ⚡ 3. CSS-only vs Headless — The Decision Table

| Dimension | DaisyUI (CSS-only) | Radix UI (Headless) |
| :--- | :--- | :--- |
| **What ships** | Pure CSS classes, zero JavaScript | React components, zero CSS |
| **Bundle cost** | Tiny — purged Tailwind CSS only | Small JS per primitive; no styles |
| **Styling** | Done for you (themed) | You write every class |
| **Behavior** | You wire it up (`useState`) | Done for you |
| **Accessibility** | Your responsibility | Built in (focus, ARIA, keyboard) |
| **Theming** | First-class via `data-theme` | Via your own classes / tokens |
| **Framework lock-in** | None (works in any HTML) | React-specific |
| **Best for** | Fast prototypes, marketing pages, layouts, quick widgets | Complex interactive UI where a11y matters: dialogs, menus, tooltips, comboboxes |

> [!TIP]
> The mature answer in 2026 is "both, at different layers." Use DaisyUI for the *static* skin of your app — navbars, cards, form layouts, buttons — and reach for Radix primitives the moment a widget needs real interactivity and accessibility (a modal, a dropdown, a tooltip). You can even style a Radix primitive *with* DaisyUI classes, since DaisyUI classes are just CSS.

---

## 🧠 Test Your Knowledge

Answer these to check your understanding. Click **Reveal Answer** to verify.

### 1. Why does a DaisyUI modal need React `useState`, while a Radix `Dialog` does not?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI is **pure CSS and ships zero JavaScript**. A DaisyUI modal is visible only when the `modal-open` class is present, and nothing in DaisyUI adds or removes that class — so *you* must own the open/closed state in React (`const [isOpen, setIsOpen] = useState(false)`) and conditionally apply `modal-open`. Radix's `Dialog.Root`, by contrast, is a stateful React component that manages its own open/closed state internally (and exposes `open`/`onOpenChange` props if you want to control it). That is the headless-vs-CSS-only trade-off: Radix gives behavior for free, DaisyUI gives styling for free.
</details>

### 2. What attribute drives DaisyUI theming, and how do you change it at runtime?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `data-theme` attribute on a wrapping element (commonly `<html>` or a top-level `<div>`) controls every DaisyUI color token beneath it. To switch themes at runtime you store the active theme in React state and bind it: `<div data-theme={theme}>`, updating `theme` from an `onChange` handler. Because it is just an HTML attribute change, the whole subtree recolors on the next render — no extra library required. Putting `data-theme` on `document.documentElement` (`<html>`) themes the entire page including portaled content, and persisting it to `localStorage` survives reloads.
</details>

### 3. What does it mean that Radix UI is "headless," and what do you get for free?
<details>
  <summary><b>Reveal Answer</b></summary>

  "Headless" means Radix provides **behavior and accessibility but no styling**. A Radix primitive renders unstyled DOM, and you apply your own Tailwind/CSS classes. For free you get: focus trapping (focus stays inside an open dialog), `Esc`-to-close, focus restoration to the trigger on close, correct ARIA roles and `aria-labelledby`/`aria-describedby` wiring, keyboard navigation (arrow keys, type-ahead in menus), and body scroll locking. Replicating all of this correctly by hand is genuinely hard, which is why headless libraries are the standard choice for accessible interactive components.
</details>

### 4. What is the difference between `@radix-ui/themes` and a package like `@radix-ui/react-dialog`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `@radix-ui/themes` is a **pre-styled design system** — it ships finished, good-looking components (`Button`, `Card`, `Flex`, …) plus a `<Theme>` provider that sets accent color, radius, and appearance. You import its CSS once and wrap your app in `<Theme>`. The `@radix-ui/react-*` packages (like `react-dialog`, `react-dropdown-menu`) are the **headless primitives** — behavior and accessibility only, completely unstyled, installed one at a time. Use Themes for speed; use the primitives when you want full design control and bring your own styling.
</details>

### 5. When would you reach for DaisyUI versus Radix, and can you use both?
<details>
  <summary><b>Reveal Answer</b></summary>

  Reach for **DaisyUI** for fast styling of static UI — navbars, cards, buttons, form layouts, marketing pages — where you want a polished look and built-in themes immediately and the interactivity is minimal. Reach for **Radix primitives** the moment a widget must be genuinely interactive *and* accessible: dialogs, dropdown menus, tooltips, comboboxes, popovers. And yes — you can absolutely use both in one app: DaisyUI for the skin/layout, Radix for the interactive accessible bits. Because DaisyUI classes are just CSS, you can even apply them to a Radix primitive's elements.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: DaisyUI Navbar with a Persisted Theme Switcher

**Goal:** Build a responsive navbar whose theme choice survives a page refresh.

**Tasks:**
1. Scaffold a Vite + React + Tailwind project and install DaisyUI. Enable at least three themes (`light`, `dark`, `cupcake`).
2. Build a navbar using `navbar`, `navbar-start`, `navbar-center`, and `navbar-end`.
3. Put a theme `<select>` in `navbar-end`, backed by the `usePersistedTheme` hook from this lesson.
4. **Bonus:** Add a DaisyUI `dropdown` for a "Profile / Settings / Logout" menu and toggle it with `useState` — observe firsthand that it has no keyboard navigation, motivating Exercise 2.

**Starter:**

```tsx
// src/Navbar.tsx — fill in the marked spots
import { usePersistedTheme } from "./usePersistedTheme";

export function Navbar() {
  const { theme, setTheme, themes } = usePersistedTheme();

  return (
    <div className="navbar bg-base-100 shadow">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl">MyApp</a>
      </div>

      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a>Home</a></li>
          <li><a>Docs</a></li>
        </ul>
      </div>

      <div className="navbar-end">
        {/* TODO: render a <select> bound to `theme` / `setTheme`,
            mapping over `themes` to produce <option>s. */}
      </div>
    </div>
  );
}
```

### 🛠️ Exercise 2: A Radix Dialog Styled with Tailwind — Prove the A11y

**Goal:** Build an accessible confirmation dialog with a Radix primitive (no Shadcn CLI) and verify the behavior you got for free.

**Tasks:**
1. Install only `@radix-ui/react-dialog`.
2. Build a dialog from `Dialog.Root`, `Dialog.Trigger`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, and `Dialog.Close`, styling each with your own Tailwind classes (start from `ConfirmDialog` above).
3. **Verify the free accessibility:** open the dialog and confirm that (a) `Tab` cycles only through elements *inside* the dialog (focus is trapped), (b) `Esc` closes it, and (c) focus returns to the trigger button on close. Try the same with the DaisyUI modal from Exercise 1's bonus — note that none of these work.
4. **Reflection:** Count the lines of state-management code you wrote for the Radix dialog (zero) versus the DaisyUI modal (`useState` + conditional class + manual close handlers). That difference *is* the headless-vs-CSS-only trade-off.

**Starter:**

```tsx
// src/DeleteConfirm.tsx — complete the Content section
import * as Dialog from "@radix-ui/react-dialog";

type DeleteConfirmProps = {
  itemName: string;
  onConfirm: () => void;
};

export function DeleteConfirm({ itemName, onConfirm }: DeleteConfirmProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded bg-red-600 px-4 py-2 text-white">
        Delete {itemName}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          {/* TODO:
              - Dialog.Title and Dialog.Description
              - a Cancel button (Dialog.Close)
              - a confirm button that calls onConfirm() then closes
                (wrap the confirm button in <Dialog.Close asChild> so it
                both fires onConfirm and dismisses the dialog) */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```
