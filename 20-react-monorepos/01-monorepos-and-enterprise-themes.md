# Monorepos & Enterprise Themes in Modern React 🌲

In enterprise-scale development, companies rarely build single, isolated websites. Instead, they manage a suite of applications—such as a customer-facing web app, an admin dashboard, and a documentation portal—that must share components, utility libraries, and branding.

To solve this efficiency challenge, modern frontend engineering relies on **Monorepos** and **Dynamic Theme Providers**.

---

## 💡 Concept & Overview

A monorepo is not just "many folders in one repo." It is a deliberate architecture that lets multiple applications consume a **single source of truth** for components, utilities, and—critically for branding—**design tokens**. When the design team changes the brand primary color from blue to teal, you want that change to flow into every app from one place, not be copy-pasted across five repositories.

> [!NOTE]
> **The "single kitchen" metaphor.** Imagine a restaurant chain with five locations (your apps). A polyrepo is like giving each location its own private recipe book—when the head chef tweaks the signature sauce, someone must physically courier the new recipe to all five and hope nobody mistypes it. A monorepo is one central kitchen: every location pulls from the same shelf of ingredients (`packages/tokens`, `packages/ui`). Change the sauce once, and every plate served everywhere reflects it instantly.

> [!TIP]
> Design **tokens** are the atoms of a design system: named values for color, spacing, radius, shadow, and opacity. By storing them as plain **JSON**, they become platform-agnostic—the same `color.primary` can be compiled into CSS variables for the web, an Android XML resource, and an iOS Swift constant. This is exactly what tools like **Style Dictionary** automate.

> [!WARNING]
> The biggest enterprise mistake is hardcoding hex values (`#3b82f6`) directly in components. The moment branding changes, you face a fragile find-and-replace across thousands of files. Tokens add one layer of indirection (`var(--color-primary)`) so that visual identity lives in **data**, not scattered across **code**.

### Where each piece lives

| Layer | Package | Format | Consumed by |
| :--- | :--- | :--- | :--- |
| **Raw values** | `packages/tokens` | JSON | Style Dictionary, Tailwind preset |
| **CSS variables** | generated `theme.css` | CSS | every app's global stylesheet |
| **Components** | `packages/ui` | TSX | `apps/*` |
| **Type config** | `packages/tsconfig` | JSON | every package & app via `extends` |
| **Tailwind preset** | `packages/tailwind-preset` | JS | each app's `tailwind.config.js` |

```text
                 packages/tokens/*.json   (single source of truth)
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
 Style Dictionary   Tailwind preset    TypeScript types
        │                 │
        ▼                 ▼
   theme.css        tailwind.config
        │                 │
        └──────┬──────────┘
               ▼
        apps/admin · apps/portal  (consume identical brand)
```

---

## ⚡ 1. What is a Monorepo?

A **Monorepo (monolithic repository)** is a software development strategy where code for multiple, distinct projects is stored in the same version control repository. 

### Why Monorepos?
- **Shared Codebase**: Easily import shared UI libraries (`packages/ui`) or utilities (`packages/utils`) into your apps without publishing them to npm.
- **Single Dependency Source**: Manage dependencies across all packages in one place, ensuring React versions are aligned.
- **Atomic Commits**: Modify a component and update the apps that consume it in a single git commit.

### Monorepos vs Multi-repos

| Feature | Monorepo | Multi-repo (Polyrepo) |
| :--- | :--- | :--- |
| **Code Sharing** | Direct workspace imports (instant updates) | Must publish/install packages via npm |
| **Dependency Versioning** | Unified or coordinated easily | Often drifts, causing compatibility bugs |
| **Tooling & Setup** | Higher initial configuration cost | Simple, isolated project setups |

> [!TIP]
> In the course walkthrough, the instructor proves this benefit live: he introduces a bug into the shared `my-math` package (turning `add` into a subtraction) and the consuming `my-project` app reflects it **instantly** on the next run—no publish, no reinstall, no GitHub round-trip. That immediacy is the entire value proposition of workspaces.

---

## 📁 2. Setting Up Workspaces (npm / pnpm / Yarn)

Workspaces are the core mechanism built into package managers to support monorepos. They link folders on your local disk together so they can reference each other directly.

### Folder Structure
```
my-enterprise-monorepo/
├── package.json (root configuration)
├── tsconfig.base.json (shared TypeScript base — see §6)
├── pnpm-workspace.yaml (if using pnpm)
├── apps/
│   ├── admin-dashboard/ (React app)
│   └── customer-portal/ (React app)
└── packages/
    ├── ui/ (Design System component library)
    ├── tokens/ (Design tokens as JSON — see §5)
    ├── tailwind-preset/ (Tailwind config generated from tokens — see §7)
    └── tsconfig/ (Shared tsconfig base)
```

### Root Config (`package.json`)
If you are using **npm** or **Yarn**, you define workspaces in the root `package.json`:

```json
{
  "name": "my-enterprise-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

> [!NOTE]
> Following the Yarn workspaces demo in the course: you create a root `package.json` with `"private": true` and a `workspaces` array (the instructor groups everything under a single `packages/*` folder by convention). Each package is initialized with `yarn init -y`, given a scoped alias name (e.g. `@husan/my-math`), declared as a dependency in the consumer, and linked with a single `yarn install` at the root—which produces one shared `node_modules` with a symlink to the source.

### Importing the Shared UI Library
In `apps/admin-dashboard/package.json`, you import the local UI package:
```json
{
  "name": "admin-dashboard",
  "dependencies": {
    "@my-monorepo/ui": "workspace:*"
  }
}
```
Now, you can import components inside your dashboard app directly:
```typescript
import { Button } from '@my-monorepo/ui';
```

> [!TIP]
> Use **Turborepo** (`npx turbo build`) on top of workspaces to cache build outputs. If you haven't changed the code in `packages/ui`, Turborepo will replay the cached build instantly, slashing CI build times by up to 90%.

---

## 🎨 3. Enterprise-grade Themes with CSS Variables

An enterprise design system must support multiple themes (e.g. Light, Dark, High-Contrast, or multi-brand themes like Medical vs Corporate).

The most performant way to manage themes is by using **CSS Variables (Custom Properties)** and the HTML `data-theme` attribute.

### Step 1: Define Theme Tokens in CSS
Define variables under specific selector attributes rather than `:root`:

```css
/* src/styles/theme.css */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6; /* Blue */
}

[data-theme="dark"] {
  --color-bg: #0f172a; /* Slate 900 */
  --color-text: #f8fafc;
  --color-primary: #60a5fa; /* Light Blue */
}

[data-theme="brand-pink"] {
  --color-bg: #fff1f2;
  --color-text: #4c0519;
  --color-primary: #ec4899; /* Pink */
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s, color 0.3s;
}
```

> [!NOTE]
> The hardcoded CSS above is great for teaching, but in a real enterprise monorepo you would **not** type these values by hand. Instead they are **generated** from the JSON tokens in §5 by Style Dictionary (§5.1). The CSS file becomes a build artifact, never edited directly.

---

## ⚡ 4. Creating a Dynamic `ThemeProvider` in React

To handle theme swapping dynamically, manage state inside a Context Provider.

```tsx
// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'brand-pink';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial theme from localStorage or default to system preference
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme') as Theme;
    if (saved) return saved;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    // Apply theme attribute to the HTML root element
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
```

### Usage in Components:
```tsx
import { useTheme } from './context/ThemeContext';

export const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-4">
      <button 
        className="px-4 py-2 border rounded"
        onClick={() => setTheme('light')}
        disabled={theme === 'light'}
      >
        Light Mode
      </button>
      <button 
        className="px-4 py-2 border rounded bg-slate-800 text-white"
        onClick={() => setTheme('dark')}
        disabled={theme === 'dark'}
      >
        Dark Mode
      </button>
      <button 
        className="px-4 py-2 border rounded bg-pink-500 text-white"
        onClick={() => setTheme('brand-pink')}
        disabled={theme === 'brand-pink'}
      >
        Brand Pink
      </button>
    </div>
  );
};
```

> [!WARNING]
> When using Server-Side Rendering (SSR) frameworks like Next.js, reading from `localStorage` directly during the first render will cause a **Hydration Mismatch** error because the server doesn't have access to the browser's storage. To solve this, always defer local storage reads to `useEffect` or inject a blocking script in the `<head>` of your HTML to set the data-theme attribute before React boots up.

---

## 🎟️ 5. Design Tokens (`packages/tokens`)

Tokens are the single source of truth for your visual identity, stored as plain JSON so any platform can consume them. Group them by category: **colors, radius, spacing, shadows, opacity**.

```json
// packages/tokens/tokens.json
{
  "color": {
    "bg":        { "value": "#ffffff" },
    "text":      { "value": "#1a1a1a" },
    "primary":   { "value": "#3b82f6" },
    "secondary": { "value": "#64748b" },
    "danger":    { "value": "#ef4444" },
    "success":   { "value": "#22c55e" }
  },
  "radius": {
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "16px" },
    "full": { "value": "9999px" }
  },
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" },
    "xl": { "value": "40px" }
  },
  "shadow": {
    "sm": { "value": "0 1px 2px rgba(0,0,0,0.05)" },
    "md": { "value": "0 4px 6px rgba(0,0,0,0.10)" },
    "lg": { "value": "0 10px 25px rgba(0,0,0,0.15)" }
  },
  "opacity": {
    "disabled": { "value": "0.4" },
    "muted":    { "value": "0.6" },
    "full":     { "value": "1" }
  }
}
```

> [!NOTE]
> The nested `{ "value": ... }` shape is the **Style Dictionary** token format. The extra wrapper lets you attach metadata later (e.g. `"comment"`, `"deprecated"`) without breaking consumers.

### 5.1 Style Dictionary Config (brief)

**Style Dictionary** reads `tokens.json` and transforms it into platform-specific outputs. Install it as a dev dependency in `packages/tokens`, then add a config:

```js
// packages/tokens/style-dictionary.config.js
export default {
  source: ['tokens.json'], // input: the JSON above
  platforms: {
    // Output #1: CSS custom properties for the web
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'theme.css',
        format: 'css/variables', // emits :root { --color-primary: #3b82f6; ... }
        options: { outputReferences: true }
      }]
    },
    // Output #2: a JS module so the Tailwind preset can import raw values
    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{ destination: 'tokens.js', format: 'javascript/es6' }]
    }
  }
};
```

```bash
# Build all platform outputs from the single tokens.json source
npx style-dictionary build --config packages/tokens/style-dictionary.config.js
```

The generated `theme.css` replaces the hand-written CSS in §3—one source, many targets.

---

## 🧩 6. Cross-package TypeScript Config

In a monorepo, every package and app should share one TypeScript baseline so compiler options never drift. You define a **root base config** and have each package `extends` it.

```json
// tsconfig.base.json (at the monorepo root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx",
    "strict": true,            // enforce strict typing everywhere
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": true,       // emit .d.ts so other packages get types
    "baseUrl": "."
  }
}
```

Each package then keeps a tiny config that **extends** the base and only overrides what is local:

```json
// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json", // inherit all shared options
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```json
// apps/admin-dashboard/tsconfig.json
{
  "extends": "../../tsconfig.base.json", // same baseline as packages
  "compilerOptions": {
    "noEmit": true,            // the bundler emits, not tsc
    "paths": {
      "@my-monorepo/ui": ["../../packages/ui/src"],
      "@my-monorepo/tokens": ["../../packages/tokens/dist"]
    }
  },
  "include": ["src"]
}
```

> [!TIP]
> Pair this with **TypeScript Project References** (`"references": [{ "path": "../tokens" }]`) so `tsc --build` compiles packages in dependency order and caches unchanged ones—the TypeScript equivalent of Turborepo's incremental builds.

---

## 🌬️ 7. Tailwind Preset Generated from Tokens

A **Tailwind preset** is a shareable config fragment that every app's `tailwind.config.js` can pull in via the `presets` array. We build it from the same tokens so Tailwind utilities and CSS variables never disagree.

```js
// packages/tailwind-preset/index.js
// Import the JS tokens emitted by Style Dictionary (§5.1)
const tokens = require('@my-monorepo/tokens/dist/tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Map CSS variables so utilities follow the active data-theme
      colors: {
        background: 'var(--color-bg)',
        foreground: 'var(--color-text)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      // Static scales pulled straight from the token values
      borderRadius: {
        sm: tokens.RadiusSm,
        md: tokens.RadiusMd,
        lg: tokens.RadiusLg,
      },
      spacing: {
        xs: tokens.SpacingXs,
        sm: tokens.SpacingSm,
        md: tokens.SpacingMd,
        lg: tokens.SpacingLg,
        xl: tokens.SpacingXl,
      },
      boxShadow: {
        sm: tokens.ShadowSm,
        md: tokens.ShadowMd,
        lg: tokens.ShadowLg,
      },
      opacity: {
        disabled: tokens.OpacityDisabled,
        muted: tokens.OpacityMuted,
      },
    },
  },
};
```

Each app then consumes the preset in one line:

```js
// apps/admin-dashboard/tailwind.config.js
module.exports = {
  presets: [require('@my-monorepo/tailwind-preset')], // shared brand
  content: ['./src/**/*.{ts,tsx}'],
};
```

> [!NOTE]
> Notice the split: **colors** map to `var(--color-*)` so they react to the live `data-theme` (light/dark/brand), while **radius/spacing/shadow** are static scale values baked in at build time. Now `className="bg-background text-primary rounded-md shadow-lg p-md"` is fully token-driven across every app.

> [!TIP]
> **End-to-end build.** This lesson establishes the architecture and the individual config files. The complete, wired-up build—initializing the design system repo, generating the CSS, publishing the packages, and consuming them in a running app—is covered step-by-step in **§21 (Fullstack Project / Design System build)**. Use that section for the hands-on assembly rather than duplicating the pipeline here.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. How does npm workspace linkage differ from standard npm package resolution?
<details>
  <summary><b>Reveal Answer</b></summary>

  Standard packages are downloaded from the remote npm registry and stored inside `node_modules`. Workspaces create **symlinks** (symbolic links) on your local filesystem pointing directly to the source directory of the dependency package. Any edit in the dependency source code is reflected immediately in the consuming app without running npm publish or npm install commands.
</details>

### 2. What is the benefit of setting the theme attribute `data-theme` on the `<html>` or `<body>` element instead of React state class variables?
<details>
  <summary><b>Reveal Answer</b></summary>

  Setting `data-theme` on a parent DOM element allows CSS variables to propagate automatically down the DOM tree. Any nested CSS rule using `var(--color-bg)` immediately adapts to the selected theme. It also keeps your Tailwind configurations simple, as you can style components using theme selectors (e.g. `[data-theme="dark"] .card`).
</details>

### 3. Why store design tokens as JSON, and what does Style Dictionary do with them?
<details>
  <summary><b>Reveal Answer</b></summary>

  Storing tokens as plain **JSON** makes them platform-agnostic data rather than code tied to one framework. **Style Dictionary** reads that single `tokens.json` source and transforms it into many platform-specific outputs—CSS custom properties (`theme.css`) for the web, a JS module for the Tailwind preset, and even Android/iOS resources. One change to the JSON propagates everywhere on the next build, eliminating hardcoded hex values scattered across components.
</details>

### 4. In a monorepo, how do you keep TypeScript compiler options consistent across all packages?
<details>
  <summary><b>Reveal Answer</b></summary>

  You define a single `tsconfig.base.json` at the repository root with all shared `compilerOptions` (`strict`, `target`, `jsx`, `declaration`, etc.). Each package and app then has a tiny `tsconfig.json` that uses `"extends": "../../tsconfig.base.json"` and only overrides local settings like `outDir`, `rootDir`, or path aliases. This guarantees no compiler-option drift. Optionally, TypeScript **Project References** let `tsc --build` compile packages in dependency order with incremental caching.
</details>

### 5. In the Tailwind preset, why are colors mapped to `var(--color-*)` while radius and spacing use literal token values?
<details>
  <summary><b>Reveal Answer</b></summary>

  Colors must respond to the **runtime** theme switch driven by the `data-theme` attribute, so they point at CSS variables (`var(--color-primary)`) whose values change live when the theme changes—no rebuild needed. Radius, spacing, shadow, and opacity are part of the structural scale that does not change between light/dark/brand themes, so they are baked in as static literal values at **build time**, imported directly from the generated tokens module. Mapping a shared preset this way keeps every app's brand identical via a single `presets: [require('@my-monorepo/tailwind-preset')]` line.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Setup Workspaces Monorepo Setup
1. Create a root folder `react-monorepo-practice` containing a `package.json` with workspaces configured for `apps/*` and `packages/*`.
2. Inside `packages/`, create a folder `math-utils` with a package.json and an `index.js` exporting an `add` function.
3. Inside `apps/`, create a simple Node app or React app `my-app` that imports and calls the `add` function from the `math-utils` workspace.
4. Verify the link functions correctly by invoking the code.
5. **Add depth:** Introduce a deliberate bug in `math-utils` (change `add` to subtract), rerun `my-app` **without** reinstalling, and confirm the change is reflected instantly—proving the symlink behavior. Then add a `tsconfig.base.json` at the root and make both `math-utils` and `my-app` `extends` it.

### 🛠️ Exercise 2: Design system high-contrast theme challenge
1. Extend the CSS themes block to support a `high-contrast` theme.
2. The `high-contrast` theme must define:
   - `--color-bg: #000000;`
   - `--color-text: #ffff00;` (Bright yellow)
   - `--color-primary: #ffffff;`
3. Add a button in the `ThemeToggler` to activate the `high-contrast` mode and verify that all text blocks adjust properly.
4. **Add depth:** Add a matching `high-contrast` entry to `packages/tokens/tokens.json` and confirm that the colors flow through to Tailwind utilities (e.g. `bg-background text-foreground`) via the preset, not just raw CSS.

### 🛠️ Exercise 3: Tokens → Tailwind pipeline
1. Create `packages/tokens/tokens.json` using the colors/radius/spacing/shadows/opacity structure from §5.
2. Add the Style Dictionary config from §5.1 and run the build to generate `dist/theme.css` and `dist/tokens.js`.
3. Create `packages/tailwind-preset/index.js` that imports the generated tokens and maps colors to CSS variables while baking in radius/spacing/shadow scales.
4. Wire one app's `tailwind.config.js` to `presets: [require('@my-monorepo/tailwind-preset')]` and style a card with `bg-background text-foreground rounded-md shadow-md p-md`.
5. Change a single color in `tokens.json`, rebuild, and confirm every consuming app updates. (For the fully assembled end-to-end build, see **§21**.)
