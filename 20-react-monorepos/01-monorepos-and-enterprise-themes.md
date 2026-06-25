# Monorepos & Enterprise Themes in Modern React 🌲

In enterprise-scale development, companies rarely build single, isolated websites. Instead, they manage a suite of applications—such as a customer-facing web app, an admin dashboard, and a documentation portal—that must share components, utility libraries, and branding.

To solve this efficiency challenge, modern frontend engineering relies on **Monorepos** and **Dynamic Theme Providers**.

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

---

## 📁 2. Setting Up Workspaces (npm / pnpm / Yarn)

Workspaces are the core mechanism built into package managers to support monorepos. They link folders on your local disk together so they can reference each other directly.

### Folder Structure
```
my-enterprise-monorepo/
├── package.json (root configuration)
├── pnpm-workspace.yaml (if using pnpm)
├── apps/
│   ├── admin-dashboard/ (React app)
│   └── customer-portal/ (React app)
└── packages/
    ├── ui/ (Design System component library)
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

### 3. What is a "hydration flash", and how does it happen in theme providers?
<details>
  <summary><b>Reveal Answer</b></summary>

  A hydration flash (or theme flicker) happens in SSR applications when the server renders the default theme (e.g. Light) because it doesn't know the client's preferences. When the HTML loads, the screen renders Light, and then React executes the client-side code (`useEffect`) to read `localStorage` and swap to Dark. The sudden visual change from white to dark flashes the user.
</details>

### 4. How can we write Tailwind styles that adapt to custom CSS theme variables?
<details>
  <summary><b>Reveal Answer</b></summary>

  You map Tailwind's colors to CSS variables inside `tailwind.config.js`:
  ```javascript
  module.exports = {
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          background: 'var(--color-bg)',
        }
      }
    }
  }
  ```
  Now, using the class `bg-background` or `text-primary` will automatically swap colors when the underlying CSS variable changes.
</details>

### 5. Why do we need `private: true` in the root `package.json` of a monorepo?
<details>
  <summary><b>Reveal Answer</b></summary>

  It prevents the root workspace container project from being published to the public npm registry by mistake. A monorepo root is purely coordinator/configuration space rather than a publishable package.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Setup Workspaces Monorepo Setup
1. Create a root folder `react-monorepo-practice` containing a `package.json` with workspaces configured for `apps/*` and `packages/*`.
2. Inside `packages/`, create a folder `math-utils` with a package.json and an `index.js` exporting an `add` function.
3. Inside `apps/`, create a simple Node app or React app `my-app` that imports and calls the `add` function from the `math-utils` workspace.
4. Verify the link functions correctly by invoking the code.

### 🛠️ Exercise 2: Design system high-contrast theme challenge
1. Extend the CSS themes block to support a `high-contrast` theme.
2. The `high-contrast` theme must define:
   - `--color-bg: #000000;`
   - `--color-text: #ffff00;` (Bright yellow)
   - `--color-primary: #ffffff;`
3. Add a button in the `ThemeToggler` to activate the `high-contrast` mode and verify that all text blocks adjust properly.
