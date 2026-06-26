# Building a Complete Enterprise Design System 🏛️

In the previous sections you learned to *consume* existing component libraries like DaisyUI and Shadcn/ui. Now we flip the perspective and become the **authors** of a design system. Large companies do not pull random utility classes into each repository — they ship a single, versioned **source of truth** for color, spacing, radius, typography, and components, and every product team consumes it in exactly the same way.

In this lesson we build that system end-to-end as a **monorepo** using **Yarn workspaces**. We create three packages: `foundation` (design tokens), `reactjs` (components that consume the tokens), and `storybook` (living documentation). The glue that holds it all together is **Style Dictionary**, a tool that transforms platform-agnostic token JSON into real CSS, SCSS, JavaScript, and a branded **Tailwind preset** that every component then uses.

---

## ⚡ 1. Concept & Overview: One Source of Truth

A design system answers a simple but expensive question: *"What is our brand's exact warning yellow, and how do all 40 of our apps use it identically?"* If each team hardcodes `#FBBF24`, then the day the brand changes you must hunt through dozens of repositories. Instead, we define the value **once** as a token and generate everything else from it.

> [!NOTE]
> A **design token** is a named, platform-agnostic design decision stored as data (usually JSON). `color.warning.500 = "#F59E0B"` is a token. It is not CSS, not JS, not Swift — it is the *intent*, and tooling compiles it into each of those targets. This is what lets a web team, an iOS team, and a Figma plugin all stay perfectly in sync.

> [!TIP]
> The monorepo split is deliberate and dependency-driven. `foundation` knows nothing about React. `reactjs` depends on `foundation`. `storybook` depends on **both**. Drawing this dependency arrow correctly is the single most important architectural decision in the whole section — lower layers must never import upward.

---

## ⚡ 2. The Mental Model: A Factory Assembly Line 🏭

Think of the system as a factory that turns raw material into finished products:

```
  RAW MATERIAL              MACHINE                 FINISHED GOODS              SHOWROOM
 ┌────────────┐        ┌───────────────┐        ┌──────────────────┐        ┌───────────┐
 │ tokens/*.json │ ──▶ │ Style Dictionary │ ──▶ │ output.css        │ ──▶  │ Storybook │
 │ colors        │      │ (the compiler)  │      │ tokens.scss       │       │ (showroom │
 │ spacing       │      │                 │      │ tokens.js         │       │  of every │
 │ radius        │      │ reads JSON,     │      │ tdp.config.js     │       │  component│
 │ shadow        │      │ emits per-      │      │ (Tailwind preset) │       │  with the │
 │ opacity       │      │ platform code   │      │                   │       │  tokens)  │
 └────────────┘        └───────────────┘        └──────────────────┘        └───────────┘
   @company-ds/foundation                          @company-ds/reactjs         @company-ds/storybook
```

The raw JSON never ships to a browser. **Style Dictionary** is the machine that reads the JSON once and stamps out a CSS file, an SCSS file, a JS object, and a Tailwind preset. The React components are built using that Tailwind preset (so a developer writes `company-bg-warning-500`), and Storybook is the showroom where every finished component is displayed.

| Package | Alias | Depends on | Responsibility |
| :--- | :--- | :--- | :--- |
| `foundation` | `@company-ds/foundation` | — | Token JSON + Style Dictionary config + generated outputs + Tailwind preset |
| `reactjs` | `@company-ds/reactjs` | `foundation` | React components styled with the branded Tailwind classes |
| `storybook` | `@company-ds/storybook` (private) | `foundation` + `reactjs` | Visual documentation; imports the built `output.css` |

---

## ⚡ 3. Scaffolding the Monorepo with Yarn Workspaces 🛠️

We start from an empty folder and opt into modern Yarn (Berry), then create the package skeleton.

```bash
# Opt into the latest Yarn release (Berry, v4+) for this repo
yarn set version berry

# Create the three workspace packages
mkdir -p packages/foundation packages/reactjs packages/storybook

# Initialize each package's package.json
cd packages/foundation && yarn init -y && cd ../..
cd packages/reactjs    && yarn init -y && cd ../..
# Storybook is internal documentation — mark it private so it is never published
cd packages/storybook  && yarn init -y --private && cd ../..
```

Now tell the **root** `package.json` that everything under `packages/*` is a workspace, and give each package a scoped alias name.

```json
// package.json (root of the monorepo)
{
  "name": "company-design-system",
  "packageManager": "yarn@4.6.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

```json
// packages/foundation/package.json
{ "name": "@company-ds/foundation", "version": "1.0.0" }
```

```json
// packages/reactjs/package.json
{ "name": "@company-ds/reactjs", "version": "1.0.0" }
```

```json
// packages/storybook/package.json
{ "name": "@company-ds/storybook", "version": "1.0.0", "private": true }
```

> [!WARNING]
> The scoped names (`@company-ds/...`) are not cosmetic — the `yarn workspace <name> add ...` commands below target packages **by name**, not by folder. If you change the names, change every command to match. Pick your real brand prefix once and stay consistent.

Wire up the dependency arrows with workspace commands. Yarn links them with the `workspace:` protocol — no network install, just symlinks inside the repo.

```bash
# Storybook depends on BOTH other packages
yarn workspace @company-ds/storybook add @company-ds/foundation @company-ds/reactjs

# reactjs depends on the tokens in foundation
yarn workspace @company-ds/reactjs add @company-ds/foundation
```

---

## ⚡ 4. Shared TypeScript Configuration Across Packages

In a monorepo you write the strict compiler rules **once** at the root and let each package `extends` it, overriding only what is unique (its `baseUrl`, its `outDir`, its `jsx` mode).

```bash
# Install TypeScript at the root, then into each package as a dev dependency
yarn add -D typescript
yarn workspace @company-ds/foundation add -D typescript
yarn workspace @company-ds/reactjs   add -D typescript
yarn workspace @company-ds/storybook add -D typescript
```

```jsonc
// tsconfig.json (root) — the shared base every package inherits
{
  "compilerOptions": {
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "moduleResolution": "node",
    "isolatedModules": true,
    "downlevelIteration": true,
    "declaration": true,
    "removeComments": false,
    "sourceMap": true,
    "lib": ["esnext", "dom"],
    "baseUrl": ".",
    "paths": {
      // Resolve the scoped alias to each package's built lib folder
      "@company-ds/*": ["packages/*/lib"]
    },
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "noEmitOnError": true,
    "strictFunctionTypes": true
  },
  "exclude": ["node_modules", "**/*.test.*"]
}
```

```jsonc
// packages/reactjs/tsconfig.json — extends the root, adds React-specific options
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "outDir": "./lib",       // built JS + .d.ts land here
    "downlevelIteration": true,
    "target": "esnext",
    "jsx": "react-jsx",       // enable JSX in this package
    "module": "esnext",
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/*.test.*", "lib"]
}
```

> [!TIP]
> The `paths` mapping `"@company-ds/*": ["packages/*/lib"]` is what makes `import Button from "@company-ds/reactjs"` resolve to compiled output during type-checking. The `lib` folder is the *build artifact* — never edit it by hand; it is regenerated on every build.

---

## ⚡ 5. The `foundation` Package: Design Tokens as JSON 🎨

Inside `packages/foundation/src/tokens/` we author one JSON file per token category. These files are the **only** place a raw hex value or pixel number is allowed to live in the entire system.

```bash
yarn workspace @company-ds/foundation add -D style-dictionary
```

```json
// packages/foundation/src/tokens/colors.json
{
  "color": {
    "primary": {
      "50":  { "value": "#EFF6FF" },
      "100": { "value": "#DBEAFE" },
      "500": { "value": "#3B82F6" },
      "900": { "value": "#1E3A8A" },
      "950": { "value": "#172554" }
    },
    "warning": {
      "100": { "value": "#FEF3C7" },
      "500": { "value": "#F59E0B" },
      "900": { "value": "#78350F" }
    },
    "danger":  { "500": { "value": "#EF4444" } },
    "success": { "500": { "value": "#22C55E" } },
    "neutral": { "500": { "value": "#737373" } }
  }
}
```

```json
// packages/foundation/src/tokens/radius.json
{
  "radius": {
    "xs":   { "value": "2px" },
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "12px" },
    "xl":   { "value": "16px" },
    "full": { "value": "9999px" }
  }
}
```

```json
// packages/foundation/src/tokens/spacing.json
{
  "spacing": {
    "4":  { "value": "4px" },
    "8":  { "value": "8px" },
    "16": { "value": "16px" },
    "24": { "value": "24px" },
    "32": { "value": "32px" }
  }
}
```

```json
// packages/foundation/src/tokens/shadows.json
{
  "shadow": {
    "xs": { "value": "0 1px 2px rgba(0,0,0,0.05)" },
    "sm": { "value": "0 1px 3px rgba(0,0,0,0.1)" },
    "md": { "value": "0 4px 6px rgba(0,0,0,0.1)" },
    "lg": { "value": "0 10px 15px rgba(0,0,0,0.1)" }
  }
}
```

```json
// packages/foundation/src/tokens/opacities.json
{
  "opacity": {
    "opaque":           { "value": "1" },
    "semi-opaque":      { "value": "0.75" },
    "transparent":      { "value": "0.5" },
    "light-transparent":{ "value": "0.25" }
  }
}
```

---

## ⚡ 6. Style Dictionary: Compiling Tokens into Real Code

Style Dictionary reads every `*.json` token file and emits one output per **platform** we configure. We generate three targets: SCSS variables, CSS custom properties, and a JS object.

```js
// packages/foundation/style-dictionary.config.js
module.exports = {
  // Glob every token JSON file as the single source
  source: ["src/tokens/**/*.json"],
  platforms: {
    // 1) SCSS variables → lib/tokens/scss/tokens.scss
    scss: {
      transformGroup: "scss",
      buildPath: "lib/tokens/scss/",
      files: [
        { destination: "tokens.scss", format: "scss/variables" }
      ]
    },
    // 2) CSS custom properties → lib/tokens/css/tokens.css
    css: {
      transformGroup: "css",
      buildPath: "lib/tokens/css/",
      files: [
        { destination: "tokens.css", format: "css/variables" }
      ]
    },
    // 3) JS object → lib/tokens/js/tokens.js (consumed by the Tailwind preset)
    js: {
      transformGroup: "js",
      buildPath: "lib/tokens/js/",
      files: [
        { destination: "tokens.js", format: "javascript/module" }
      ]
    }
  }
};
```

```json
// packages/foundation/package.json — add the build scripts
{
  "name": "@company-ds/foundation",
  "version": "1.0.0",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "scripts": {
    "build:tokens": "style-dictionary build --config style-dictionary.config.js",
    "build": "yarn build:tokens && tsc"
  }
}
```

```bash
# Run the compiler from inside the foundation package
yarn workspace @company-ds/foundation build:tokens
```

The generated `tokens.css` will contain entries like the following — proof that the intent became real code:

```css
/* lib/tokens/css/tokens.css (GENERATED — do not edit) */
:root {
  --color-primary-500: #3B82F6;
  --color-warning-500: #F59E0B;
  --radius-md: 8px;
  --spacing-16: 16px;
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

> [!WARNING]
> Everything under `lib/` is **generated output**. Add it to `.gitignore` (or commit it deliberately as a release artifact), but **never hand-edit it** — the next `build:tokens` run will overwrite your changes. Edit the JSON in `src/tokens/` and rebuild.

---

## ⚡ 7. Generating a Branded Tailwind Preset 🧩

This is the payoff. We feed the compiled JS tokens into a Tailwind **preset** and add a **prefix** (your brand name). The prefix is why a developer writes `company-bg-warning-500` instead of plain `bg-warning-500` — it guarantees the design-system classes never collide with another team's Tailwind config.

```js
// packages/foundation/src/tdp.config.js  (Tailwind Design Preset)
// Require the JS object that Style Dictionary generated.
const tokens = require("./../lib/tokens/js/tokens.js");

// Style Dictionary nests tokens deeply; flatten the leaf "value"s into
// the flat { "warning-500": "#F59E0B" } shape Tailwind's theme expects.
function flattenValues(obj, prefix = "") {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const name = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === "object" && "value" in val) {
      acc[name] = val.value;          // leaf token → keep its value
    } else if (val && typeof val === "object") {
      Object.assign(acc, flattenValues(val, name)); // recurse into nesting
    }
    return acc;
  }, {});
}

module.exports = {
  // Brand prefix → classes become company-bg-..., company-rounded-..., etc.
  prefix: "company-",
  theme: {
    colors:       flattenValues(tokens.color),
    opacity:      flattenValues(tokens.opacity),
    borderRadius: flattenValues(tokens.radius),
    spacing:      flattenValues(tokens.spacing),
    boxShadow:    flattenValues(tokens.shadow),
    fontFamily: {
      sans: ["Inter", "sans-serif"]
    }
  },
  plugins: []
};
```

```json
// packages/foundation/src/index.ts re-exports tokens so they are importable too
```

```typescript
// packages/foundation/src/index.ts
import tokens from "./../lib/tokens/js/tokens.js";
export default tokens;
export { tokens };
```

After authoring the preset, build the whole foundation package so `reactjs` can consume the compiled output:

```bash
yarn workspace @company-ds/foundation build
```

---

## ⚡ 8. The `reactjs` Package: Components That Consume Tokens

Install React (and its types) as **dev** dependencies, but declare React as a **peer** dependency — the consuming app provides React, and your library must not bundle its own copy.

```bash
yarn workspace @company-ds/reactjs add -D react react-dom
yarn workspace @company-ds/reactjs add -D @types/react @types/react-dom
yarn workspace @company-ds/reactjs add -D tailwindcss
```

```json
// packages/reactjs/package.json — peerDependencies + build/watch scripts
{
  "name": "@company-ds/reactjs",
  "version": "1.0.0",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "scripts": {
    "build": "yarn build:css && tsc",
    "watch:css": "npx tailwindcss -i ./src/input.css -o ./lib/output.css --watch",
    "build:css": "npx tailwindcss -i ./src/input.css -o ./lib/output.css"
  }
}
```

The component package's Tailwind config simply applies the branded preset built in `foundation`:

```js
// packages/reactjs/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // Pull in the generated, branded preset from the foundation package
  presets: [require("@company-ds/foundation/lib/tdp.config.js")]
};
```

```css
/* packages/reactjs/src/input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Now a component is styled purely with branded token classes — no raw hex, no magic numbers:

```tsx
// packages/reactjs/src/button.tsx
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ children, ...props }: ButtonProps) {
  return (
    // Every class is a branded design-system token, e.g. company-bg-warning-500
    <button
      className="company-bg-warning-500 company-px-8 company-py-4 company-rounded-sm company-font-semibold"
      {...props}
    >
      {children}
    </button>
  );
}
```

```typescript
// packages/reactjs/src/index.ts — the package's public surface
export { default as Button } from "./button";
```

```bash
# Build the component package, then watch CSS while developing
yarn workspace @company-ds/reactjs build
yarn workspace @company-ds/reactjs watch:css
```

> [!NOTE]
> `peerDependencies` with `>=16.8.0` says "I need React 16.8 or newer (the hooks era), but the *consuming app* owns the actual install." This prevents the classic bug of two React copies ending up in one bundle, which breaks hooks at runtime.

---

## ⚡ 9. The `storybook` Package: Wiring the Showroom

Initialize Storybook inside the package, then make its preview import the **built** `output.css` so the showroom renders with the exact compiled styles a consumer would get.

```bash
cd packages/storybook
npx storybook@latest init   # choose React + Vite when prompted
cd ../..
```

The single most important Storybook wiring step is importing the compiled CSS in `preview.ts`.

```typescript
// packages/storybook/.storybook/preview.ts
import type { Preview } from "@storybook/react";

// Import the COMPILED stylesheet produced by `reactjs` build:css.
// This is why the branded classes (company-bg-warning-500) actually paint.
import "../../reactjs/lib/output.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } }
  }
};

export default preview;
```

```tsx
// packages/storybook/stories/button.stories.tsx
import { Button } from "@company-ds/reactjs";

export default {
  title: "Components/Button",
  component: Button
};

export const Primary = () => <Button variant="primary">Click me</Button>;
export const Secondary = () => <Button variant="secondary">Click me</Button>;
export const Danger = () => <Button variant="danger">Click me</Button>;
```

```bash
# Launch the living documentation
yarn workspace @company-ds/storybook storybook
```

> [!WARNING]
> If Storybook shows the button with **no styling**, the cause is almost always one of two things: (1) `preview.ts` is not importing `output.css`, or (2) `output.css` was never built/watched. Run `yarn workspace @company-ds/reactjs build:css` and confirm `lib/output.css` exists and is non-empty. A common third pitfall: `tailwind.config.js` must use CommonJS `module.exports` (not `export default`) so the preset `require()` resolves.

---

## ⚡ 10. The End-to-End Flow

```
 designer changes warning yellow
            │
            ▼
 edit src/tokens/colors.json   (the ONE place a hex lives)
            │  yarn workspace @company-ds/foundation build
            ▼
 Style Dictionary regenerates  tokens.css / tokens.scss / tokens.js
            │
            ▼
 tdp.config.js rebuilds the branded Tailwind preset
            │  yarn workspace @company-ds/reactjs build:css
            ▼
 output.css recompiles → every company-bg-warning-500 updates
            │
            ▼
 Storybook (and every consuming app) shows the new color — zero code edits
```

One JSON edit ripples through the entire organization. That is the entire value proposition of an enterprise design system: **change once, propagate everywhere, guaranteed.**

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. What exactly is a "design token," and why store it as JSON instead of CSS?
<details>
  <summary><b>Reveal Answer</b></summary>

  A design token is a named, **platform-agnostic** design decision stored as data, e.g. `color.warning.500 = "#F59E0B"`. Storing it as JSON (rather than directly as CSS) means the value is just *intent*, decoupled from any single platform. A tool like Style Dictionary can then compile that one JSON entry into CSS custom properties, SCSS variables, a JS object, iOS Swift, Android XML, etc. — keeping web, mobile, and design tooling perfectly synchronized from a single source of truth.
</details>

### 2. Why does `storybook` depend on both `foundation` and `reactjs`, while `foundation` depends on neither?
<details>
  <summary><b>Reveal Answer</b></summary>

  Dependencies must flow **downward only**. `foundation` is the lowest layer — pure tokens with zero knowledge of React or rendering, so it depends on nothing. `reactjs` consumes the compiled tokens/preset, so it depends on `foundation`. `storybook` is the showroom that documents the *components* (from `reactjs`) styled with the *tokens* (from `foundation`), so it must depend on both. If a lower layer ever imported an upper layer you would create a circular dependency and break the build.
</details>

### 3. What is the role of Style Dictionary in this architecture?
<details>
  <summary><b>Reveal Answer</b></summary>

  Style Dictionary is the **compiler / transformer**. It reads every `*.json` token file once (`source: ["src/tokens/**/*.json"]`) and, for each configured `platform`, emits a concrete artifact: `css/variables`, `scss/variables`, and `javascript/module`. It turns the abstract intent (JSON) into real, usable code for each target. The raw JSON never ships to a browser — only the generated `output.css`/`tokens.js` do.
</details>

### 4. Why add a brand prefix (e.g. `company-`) to the generated Tailwind classes?
<details>
  <summary><b>Reveal Answer</b></summary>

  The prefix is set in the Tailwind preset (`prefix: "company-"`), turning `bg-warning-500` into `company-bg-warning-500`. It namespaces every design-system utility class so they cannot collide with a consuming application's own Tailwind config or another library's classes. It also makes design-system usage self-documenting in the markup — anyone reading the JSX immediately sees which classes come from the official system.
</details>

### 5. Why is React declared as a `peerDependency` (`>=16.8.0`) in the `reactjs` package rather than a regular dependency?
<details>
  <summary><b>Reveal Answer</b></summary>

  A library should not bundle its own copy of React; the **consuming application** owns the React install. Declaring `react`/`react-dom` as `peerDependencies` says "I require React 16.8+ (the hooks era) but you supply it." This prevents the classic bug of two different React instances ending up in one bundle, which causes hooks to throw "Invalid hook call" errors at runtime. During development you still install React as a `devDependency` so the package can compile and run Storybook locally.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Add a Brand-New Token and Watch It Propagate
1. Open `packages/foundation/src/tokens/colors.json` and add a new color scale, e.g. `"brand": { "500": { "value": "#7C3AED" } }`.
2. Run `yarn workspace @company-ds/foundation build` and confirm the value appears in `lib/tokens/css/tokens.css` as `--color-brand-500`.
3. Rebuild the components with `yarn workspace @company-ds/reactjs build:css`.
4. In `button.tsx`, change the class to `company-bg-brand-500` and launch Storybook to confirm the new color paints — without ever touching a hex value in the component.

### 🧩 Exercise 2: Add a Second Platform Output (JSON for a Mobile Team)
1. In `style-dictionary.config.js`, add a fourth platform named `json` with `transformGroup: "js"`, `buildPath: "lib/tokens/json/"`, and a file `{ destination: "tokens.json", format: "json/flat" }`.
2. Run `yarn workspace @company-ds/foundation build:tokens`.
3. Inspect the generated `lib/tokens/json/tokens.json` — observe how the *same* source tokens are now also available in a flat JSON shape that a native iOS/Android team could consume.
4. Reflect: you added an entire new consumer platform without editing a single token value. Document in a comment why this proves the "single source of truth" benefit.
