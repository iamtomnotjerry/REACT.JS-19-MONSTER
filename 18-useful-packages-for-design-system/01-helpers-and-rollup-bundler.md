# Styling Helpers & Rollup Bundler in Design Systems 🛠️

When building a production-ready **React Design System**, writing components is only half the battle. You must ensure that:
1. **Styling is flexible**: Consumers can easily override default styles without style conflicts.
2. **Distribution is optimized**: The library is compiled into a lightweight package supporting tree-shaking (ESM) and backwards compatibility (CJS).

In this lesson, we will cover class merging utility helpers (`clsx` + `tailwind-merge`) and bundling component libraries with **Rollup**.

---

## ⚡ 1. The Dynamic Styling Problem in Tailwind CSS

In standard React + Tailwind applications, we often write conditional classes:

```jsx
const Button = ({ variant, className }) => {
  const baseStyle = "px-4 py-2 rounded text-white font-medium";
  const variantStyle = variant === "danger" ? "bg-red-500" : "bg-blue-500";
  
  return <button className={`${baseStyle} ${variantStyle} ${className}`} {...props} />;
};
```

If a consumer uses this button and tries to customize it:
```jsx
<Button variant="danger" className="px-6 bg-orange-600" />
```

The resulting class list will contain both: `px-4 bg-red-500 px-6 bg-orange-600`.
Because of CSS source order in the compiled Tailwind file, **`bg-red-500` might win over `bg-orange-600`**, even though `bg-orange-600` was passed last!

### The Solution: `clsx` + `tailwind-merge`

To resolve this conflict cleanly:
- **`clsx`** (or `classnames`): A tiny utility for constructing `className` strings conditionally.
- **`tailwind-merge`**: A utility that overrides conflicting Tailwind CSS classes, ensuring that the last declared class wins.

We combine them to create the industry-standard `cn` helper (widely popularized by `shadcn/ui`):

```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### How `cn` Resolves Classes:
```typescript
cn("px-4 py-2 bg-red-500", "px-6 bg-orange-600");
// Output: "py-2 px-6 bg-orange-600"
// Notice: px-4 and bg-red-500 were successfully overwritten and removed!
```

> [!TIP]
> Always use the `cn` helper for wrapping class lists in component libraries to give consumers full styling control.

---

## ⚡ 2. Why Rollup for Bundling Libraries?

While **Vite** and **Webpack** are excellent for building web applications, **Rollup** is the gold standard for bundling JavaScript libraries. 

| Feature | Rollup | Webpack |
| :--- | :--- | :--- |
| **Primary Goal** | Bundling libraries / packages | Bundling web applications |
| **Output Formats** | Supports ESM, CJS, UMD simultaneously | Optimized for single-page apps (SPA) |
| **Tree Shaking** | Extremely efficient static analysis | Good, but produces more wrapper code |
| **Bundle Size** | Minimal footprint, clean outputs | Includes module loaders and runtime code |

---

## 📦 3. Setting Up Rollup for React & TypeScript

Let's walk through building a bundler pipeline for a component library.

### Step 1: Install Dependencies
Install Rollup and its essential plugins as dev dependencies:

```bash
npm install -D rollup rollup-plugin-peer-deps-external @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-postcss rollup-plugin-dts typescript postcss
```

### Step 2: Configure `rollup.config.mjs`
Create a configuration file to output both ES modules (`.esm.js`) and CommonJS (`.cjs.js`) versions of your library, along with TypeScript definitions:

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
> Failing to use `rollup-plugin-peer-deps-external` can cause your bundle to include duplicate copies of React. When a consumer imports your library, React will throw a "rules of hooks" violation error due to multiple React instances running in the same app.

### Step 3: Configure `package.json`
Configure your entry points and build scripts:

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

### 1. What does `tailwind-merge` do that `clsx` cannot do on its own?
<details>
  <summary><b>Reveal Answer</b></summary>

  `clsx` only concatenates string arguments conditionally. It does not understand Tailwind utility syntax. Therefore, if you pass `px-4 px-6`, `clsx` outputs `"px-4 px-6"`. `tailwind-merge` understands Tailwind-specific properties and overrides `px-4` in favor of `px-6` because they target the same CSS property (horizontal padding).
</details>

### 2. Why should we list React in `peerDependencies` instead of `dependencies` in a library?
<details>
  <summary><b>Reveal Answer</b></summary>

  Listing React under `dependencies` forces npm to install a dedicated instance of React inside the library's node_modules folder. This results in two active React instances in the consumer's app. By placing it in `peerDependencies`, you specify that the host application must provide React, avoiding version mismatches and React hooks errors.
</details>

### 3. What is the role of `rollup-plugin-dts` in a Rollup configuration?
<details>
  <summary><b>Reveal Answer</b></summary>

  It bundles all individual TypeScript declaration files (`.d.ts`) generated by the compiler into a single, clean `.d.ts` entry file. This simplifies type resolution for consumers importing components from your library.
</details>

### 4. What is the difference between ESM and CJS output formats?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **ESM (ES Modules)** uses `import` and `export` statements. It is static, enabling modern bundlers to perform tree-shaking (removing unused code).
  - **CJS (CommonJS)** uses `require()` and `module.exports`. It is dynamic and is primarily used by Node.js for legacy projects or older build systems.
</details>

### 5. Why is Rollup preferred over Vite/esbuild for library packaging if Vite is faster?
<details>
  <summary><b>Reveal Answer</b></summary>

  Although esbuild (used by Vite) is faster, Rollup provides highly optimized, clean tree-shaken bundles and has a robust ecosystem of plugins dedicated to complex library concerns, such as merging types (`dts`) and managing peer dependencies.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Build a `cn` Helper Sandbox
1. Initialize a mini Node project and install `clsx` and `tailwind-merge`.
2. Create a function `cn` that merges classes.
3. Test your function with the following inputs:
   - `cn("text-red-500 bg-black", "text-blue-500")` (Verify that `text-red-500` is removed).
   - `cn("p-4", false && "p-2", "p-8")` (Verify that boolean shortcuts work and `p-4` is overridden by `p-8`).

### 🛠️ Exercise 2: Rollup Compiling Lab
1. Create a minimal folder containing:
   - `src/components/Button.tsx`: A simple button component utilizing standard React.
   - `src/index.ts`: Exporting the button component.
2. Initialize Rollup configurations as outlined in Step 2.
3. Run `npm run build` and inspect the output `dist/` directory to verify that ESM and CJS bundles are successfully generated.
