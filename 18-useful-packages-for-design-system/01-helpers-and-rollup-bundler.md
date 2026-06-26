# Design System Toolkit: Tokens, Helpers & Rollup Bundler 🛠️

When building a production-ready **React Design System**, writing components is only half the battle. A great design system also depends on a small set of specialized tools that work together to keep styling **consistent**, **flexible**, and **distributable**. In this lesson we walk through the four tools the instructor teaches, in order:

1. **Style Dictionary** — define design tokens once in JSON, then transform them into CSS, SCSS, and JavaScript outputs.
2. **clsx** — conditionally join class names without fragile string concatenation.
3. **CVA (`class-variance-authority`)** — define type-safe, structured component variants.
4. **Rollup** — bundle the finished library into ESM + CJS + type definitions.

## 📖 Concept & Overview

> [!NOTE]
> Think of a design system like a **professional kitchen**. **Style Dictionary** is the central pantry — one source of truth for every ingredient (colors, spacing, fonts). **clsx** is the line cook who decides which garnishes to plate based on the order. **CVA** is the standardized recipe card that guarantees every "medium spicy" dish tastes identical. And **Rollup** is the packaging line that boxes the finished meal so any customer (app) can reheat it cleanly. Each tool solves one job, and together they produce a reliable, repeatable result.

> [!TIP]
> You don't have to adopt all four tools at once. They are independent. But in a mature component library they reinforce each other: tokens feed your CSS, `clsx`/`tailwind-merge` resolve runtime class conflicts, CVA organizes variants, and Rollup ships it all.

Here is how the pieces fit together in the authoring-to-distribution pipeline:

| Stage | Tool | Input | Output |
| :--- | :--- | :--- | :--- |
| **1. Define** | Style Dictionary | `*.tokens.json` | CSS vars, SCSS vars, JS objects |
| **2. Compose** | clsx | conditions + strings | a single `className` string |
| **3. Standardize** | CVA | base + variant config | typed variant function |
| **4. Distribute** | Rollup | `src/index.ts` | `index.cjs`, `index.esm.js`, `index.d.ts` |

---

## 🎨 1. Style Dictionary — Your Single Source of Truth for Tokens

A **design token** is the smallest, named decision in a design system: a color, a spacing step, a font size, a font weight. Instead of scattering `#7c3aed` across 40 files, you name it once (`color.violet`) and reference the name everywhere.

**Style Dictionary** is a build system that lets designers and developers **define, organize, and manage design tokens in JSON**, then transform those tokens into many output formats — CSS variables, SCSS variables, JavaScript objects, and even Android and iOS formats.

### Why it matters

- **Centralized management** — tokens live in a single source of truth (JSON) that is easy to maintain and update.
- **Cross-platform** — one definition outputs CSS, SCSS, JS, and native formats.
- **Extensibility** — you can customize how tokens are processed (calculated values, custom transforms).
- **Automation** — transforming tokens into usable code becomes a single build command.

### Step 1: Install

```bash
# style-dictionary is the core engine; the utils package adds helper functions
npm install style-dictionary style-dictionary-utils
```

### Step 2: Define tokens as JSON

Create a `tokens/` folder. Files end in `.tokens.json` so the config can glob them.

```json
// tokens/color.tokens.json
{
  "color": {
    "violet": { "value": "#7c3aed" },
    "blue":   { "value": "#3b5aff" },
    "green":  { "value": "#1b9981" },
    "red":    { "value": "#ef4444" }
  }
}
```

You add more token files the same way — spacing and typography, for example:

```json
// tokens/spacing.tokens.json
{
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" }
  }
}
```

```json
// tokens/typography.tokens.json
{
  "font": {
    "size":   { "sm": { "value": "12px" }, "base": { "value": "16px" }, "lg": { "value": "20px" } },
    "weight": { "normal": { "value": "400" }, "medium": { "value": "500" }, "bold": { "value": "700" } }
  }
}
```

### Step 3: Configure Style Dictionary

Create `config.js` at the project root. The `source` glob picks up every token file, and each entry under `platforms` describes one output format.

```js
// config.js
export default {
  // Grab every token file in the tokens folder
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    // 1) CSS custom properties
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables', // emits :root { --color-violet: #7c3aed; ... }
        },
      ],
    },
    // 2) SCSS variables
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: 'variables.scss',
          format: 'scss/variables', // emits $color-violet: #7c3aed; ...
        },
      ],
    },
    // 3) JavaScript ES6 object
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6', // emits export const ColorViolet = '#7c3aed'; ...
        },
      ],
    },
  },
};
```

### Step 4: Add a build script and run it

```json
// package.json
{
  "scripts": {
    "build": "style-dictionary build"
  }
}
```

```bash
npm run build
```

After running, the `build/` folder contains all three formats generated from the same tokens:

```css
/* build/css/variables.css */
:root {
  --color-violet: #7c3aed;
  --color-blue: #3b5aff;
  --color-green: #1b9981;
  --color-red: #ef4444;
  --spacing-md: 16px;
  --font-size-base: 16px;
  --font-weight-bold: 700;
}
```

> [!TIP]
> Want an Android or iOS output too? Add another platform block with the appropriate `transformGroup` (e.g. `android`). One JSON source can power your web app, native apps, and documentation simultaneously — that is the real power of tokens.

---

## 🔗 2. clsx — Conditional Class Joining

`clsx` is a tiny utility for **conditionally joining class names**. It lets you add or remove CSS classes based on a condition without resorting to manual string concatenation or messy ternary soup.

### Install

```bash
npm install clsx
```

### The four argument styles `clsx` understands

```js
// src/index.js
import { clsx } from 'clsx';

// 1) Plain strings are concatenated
clsx('button', 'button-primary');
// -> "button button-primary"

// 2) Inline conditional expression
const isPrimary = true;
clsx('button', isPrimary && 'primary');
// -> "button primary"   (when false -> "button")

// 3) Arrays (falsy entries are dropped)
clsx(['button', 'button-primary', isPrimary && 'active']);
// -> "button button-primary active"

// 4) Objects: key is included only when its value is truthy
const isDisabled = false;
clsx({
  button: true,
  'button-primary': isPrimary,   // included
  'button-disabled': isDisabled, // dropped (false)
});
// -> "button button-primary"
```

> [!WARNING]
> `clsx` only **joins** strings — it has no idea what Tailwind utilities mean. If you pass `clsx('px-4', 'px-6')` you get the literal `"px-4 px-6"`, and the CSS source order decides the winner. To make the *last* class win for conflicting Tailwind utilities, pair `clsx` with `tailwind-merge` (see the `cn` helper below).

### The industry-standard `cn` helper

In real component libraries (a pattern popularized by `shadcn/ui`), `clsx` is combined with **`tailwind-merge`** to both join *and* de-conflict Tailwind classes:

```bash
npm install clsx tailwind-merge
```

```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// clsx builds the string; twMerge resolves conflicting Tailwind utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
cn('px-4 py-2 bg-red-500', 'px-6 bg-orange-600');
// Output: "py-2 px-6 bg-orange-600"
// px-4 and bg-red-500 were overwritten and removed — the last class wins.
```

| Utility | What it does | Tailwind-aware? |
| :--- | :--- | :--- |
| `clsx` | Joins strings/arrays/objects conditionally | ❌ No |
| `tailwind-merge` | Resolves conflicting Tailwind utilities (last wins) | ✅ Yes |
| `cn` (both combined) | Conditional join **and** conflict resolution | ✅ Yes |

> [!TIP]
> Always wrap a component's class list in `cn(...)` and forward the consumer's `className` last. That gives consumers full styling control while keeping your defaults sane.

---

## 🧬 3. CVA — Type-Safe Component Variants

**CVA** (`class-variance-authority`) is a utility that manages and applies conditional class names in a **structured, reusable, type-safe** way. It pairs beautifully with utility-first frameworks like Tailwind CSS, letting you define class variations based on component props or state while keeping styling consistent.

### Install

```bash
npm install class-variance-authority
```

### Define variants

You call `cva(baseClasses, config)`. The first argument is the always-applied base; `config.variants` describes each axis of variation; and `defaultVariants` fills in anything the consumer omits.

```tsx
// src/components/button-styles.ts
import { cva } from 'class-variance-authority';

export const buttonStyles = cva(
  // Base classes applied to every button
  'px-4 py-2 rounded-md focus:outline-none',
  {
    variants: {
      // Axis 1: color
      color: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-500 text-black',
      },
      // Axis 2: size
      size: {
        small: 'text-sm py-1 px-3',
        large: 'text-lg py-3 px-6',
      },
      // Axis 3: state
      state: {
        active: 'bg-blue-700',
        disabled: 'bg-gray-300 cursor-not-allowed',
      },
    },
    // Used when a prop is not passed
    defaultVariants: {
      color: 'primary',
      size: 'small',
    },
  }
);
```

### Use it inside a component (with full TypeScript safety)

```tsx
// src/components/Button.tsx
import { type ReactNode } from 'react';
import { buttonStyles } from './button-styles';

interface ButtonProps {
  color?: 'primary' | 'secondary'; // optional — falls back to defaultVariants
  size?: 'small' | 'large';
  state?: 'active' | 'disabled';
  children: ReactNode;
}

export const Button = ({ color, size, state, children }: ButtonProps) => {
  return (
    <button
      // buttonStyles() returns the resolved class string for these variants
      className={buttonStyles({ color, size, state })}
      disabled={state === 'disabled'}
    >
      {children}
    </button>
  );
};
```

```tsx
// src/App.tsx — consuming the variants
<div className="space-y-4">
  <Button color="primary" size="large" state="active">Primary Large Button</Button>
  <Button color="secondary" size="small">Secondary Small Button</Button>
  <Button color="primary" size="small" state="disabled">Disabled Button</Button>
</div>
```

> [!TIP]
> Because the variant keys are typed, your editor autocompletes `color="primary" | "secondary"` and flags typos at compile time. Combine CVA with the `cn` helper so consumers can still pass an extra `className` that overrides the variant output.

---

## ⚡ 4. Rollup — Bundling the Library

While **Vite** and **Webpack** are excellent for building *applications*, **Rollup** is the gold standard for bundling JavaScript *libraries* — it produces small, clean, tree-shakeable output in multiple module formats.

| Feature | Rollup | Webpack |
| :--- | :--- | :--- |
| **Primary Goal** | Bundling libraries / packages | Bundling web applications |
| **Output Formats** | ESM, CJS, UMD simultaneously | Optimized for single-page apps (SPA) |
| **Tree Shaking** | Extremely efficient static analysis | Good, but produces more wrapper code |
| **Bundle Size** | Minimal footprint, clean outputs | Includes module loaders and runtime code |

### Step 1: Install dependencies

```bash
npm install -D rollup rollup-plugin-peer-deps-external @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-postcss rollup-plugin-dts typescript postcss
```

### Step 2: Configure `rollup.config.mjs`

```javascript
// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

import packageJson from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(), // Prevents bundling react and react-dom
      resolve(),          // Locates third-party node_modules
      commonjs(),         // Converts CommonJS modules to ES6
      typescript({ tsconfig: './tsconfig.json' }),
      postcss({
        extensions: ['.css'],
        minimize: true,
        inject: true,     // Injects CSS styles directly into DOM
      }),
    ],
  },
  {
    // Bundle type definitions (.d.ts) into a single file
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
```

> [!WARNING]
> Failing to use `rollup-plugin-peer-deps-external` can cause your bundle to include a duplicate copy of React. When a consumer then imports your library, React will throw a "rules of hooks" violation error because multiple React instances are running in the same app.

### Step 3: Configure `package.json`

```json
{
  "name": "@my-company/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. What problem does Style Dictionary solve, and what is its single source of truth?
<details>
  <summary><b>Reveal Answer</b></summary>

  Style Dictionary solves the problem of duplicated, inconsistent design decisions scattered across a codebase. You define **design tokens** (colors, spacing, fonts) once in **JSON files** — the single source of truth — and Style Dictionary transforms them into many output formats (CSS variables, SCSS variables, JS objects, native formats) via a single build command. Update the token once, rebuild, and every platform stays in sync.
</details>

### 2. What does `tailwind-merge` do that `clsx` cannot do on its own?
<details>
  <summary><b>Reveal Answer</b></summary>

  `clsx` only concatenates string, array, and object arguments conditionally. It does not understand Tailwind utility syntax, so `clsx('px-4', 'px-6')` outputs `"px-4 px-6"`. `tailwind-merge` understands Tailwind-specific properties and overrides `px-4` in favor of `px-6` because they target the same CSS property (horizontal padding), ensuring the last class wins.
</details>

### 3. In CVA, what is the purpose of `defaultVariants`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `defaultVariants` specifies the variant values to apply when the consumer does not pass a given prop. For example, with `defaultVariants: { color: 'primary', size: 'small' }`, calling `buttonStyles({})` still returns the primary + small classes. This keeps optional props ergonomic and guarantees a sensible baseline appearance.
</details>

### 4. Why should we list React in `peerDependencies` instead of `dependencies` in a library?
<details>
  <summary><b>Reveal Answer</b></summary>

  Listing React under `dependencies` forces npm to install a dedicated copy of React inside the library's `node_modules`. This can result in two active React instances in the consumer's app, which breaks the rules of hooks. By placing React in `peerDependencies`, you require the host application to provide React, avoiding version mismatches and duplicate-instance errors.
</details>

### 5. What is the difference between Rollup's ESM and CJS output formats, and why ship both?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **ESM (ES Modules)** uses `import`/`export`. It is static, enabling modern bundlers to tree-shake unused code.
  - **CJS (CommonJS)** uses `require()`/`module.exports`. It is dynamic and is consumed by Node.js and older build systems.

  Shipping both (plus a bundled `.d.ts` via `rollup-plugin-dts`) maximizes compatibility: modern bundlers pick the tree-shakeable ESM build, while legacy tooling falls back to CJS.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Style Dictionary Token Pipeline
1. Create a folder `style-dict-demo`, run `npm init -y`, and `npm install style-dictionary style-dictionary-utils`.
2. Add a `tokens/color.tokens.json` with at least four colors (violet, blue, green, red) using the `{ "value": "#hex" }` shape.
3. Create `config.js` with **three** platforms (`css`, `scss`, `js`) as shown above, and add a `"build": "style-dictionary build"` script.
4. Run `npm run build` and confirm `build/css/variables.css`, `build/scss/variables.scss`, and `build/js/variables.js` are all generated from the same source.
5. **Stretch:** add a `tokens/spacing.tokens.json`, rebuild, and verify the spacing variables appear in all three outputs without touching `config.js`.

### 🛠️ Exercise 2: Build a Typed `Button` with CVA + `cn`
1. Scaffold a Vite React + TypeScript app and set up Tailwind CSS.
2. Install `class-variance-authority`, `clsx`, and `tailwind-merge`.
3. Create the `cn` helper in `src/utils/cn.ts`.
4. Create `buttonStyles` with `cva`, defining `color` (primary/secondary), `size` (small/large), and `state` (active/disabled) variants plus `defaultVariants`.
5. Build a `<Button>` component whose `className` is `cn(buttonStyles({ color, size, state }), className)` so consumers can still override styles.
6. Render three buttons in `App.tsx` (primary-large-active, secondary-small, primary-small-disabled) and confirm TypeScript autocompletes the variant props.

### 🛠️ Exercise 3: Rollup Compiling Lab
1. Create a minimal folder containing:
   - `src/components/Button.tsx`: a simple button component.
   - `src/index.ts`: exporting the button component.
2. Add `rollup.config.mjs` as outlined in Step 2 and the matching `package.json` entry points (`main`, `module`, `types`).
3. Run `npm run build` and inspect the `dist/` directory to verify the ESM bundle, CJS bundle, and a single bundled `index.d.ts` are all generated.
