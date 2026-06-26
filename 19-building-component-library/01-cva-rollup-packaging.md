# Building & Packaging a React Component Library with CVA + Rollup 📦

Up to now you have been a *consumer* of component libraries like DaisyUI and Shadcn/ui. In this lesson you flip roles and become the *author*: you will build your own publishable React component library from scratch. The toolchain is exactly the one professional design-system teams reach for — **React + TypeScript** for the components, **class-variance-authority (CVA)** for type-safe variants, **tailwind-merge** for conflict-free class composition, **Rollup** to bundle into both CommonJS and ESM (plus `.d.ts` type declarations), **Storybook** for visual testing, and **Vitest + React Testing Library** for unit testing.

By the end you will have a `Button` component with `variant`, `size`, and `disabled` variants, a `dist/` folder containing CJS, ESM, and typings, and the exact `package.json` fields needed to `npm publish` it so any app — yours or a teammate's — can `npm install` and import it.

---

## ⚡ 1. Concept & Overview: Why Build a Library?

A component library is a single, versioned package that holds your reusable UI. Instead of copy-pasting a `Button` into five different apps (and then fixing the same bug five times), you publish it once and every app installs the same source of truth. Update the package, bump the version, and every consumer upgrades with one `npm install`.

> [!NOTE]
> A **publishable** library is fundamentally different from an in-app component folder. It must ship *compiled, framework-agnostic output* (plain JS that any bundler understands) plus *type declarations* (`.d.ts`) so TypeScript consumers get autocomplete. It must also declare React as a **peer dependency** so the consuming app's single React copy is used — never bundle React inside your library.

> [!WARNING]
> The most common library-authoring bug is **bundling React**. If your `dist` includes its own copy of React, the consuming app ends up with *two* React instances and hooks crash with "Invalid hook call." The fix is the `rollup-plugin-peer-deps-external` plugin plus a `peerDependencies` entry — both covered below.

> [!TIP]
> Think of your library like a **canned-food factory**. Your kitchen (the `src/` TypeScript + JSX) is messy and uses tools the customer doesn't have. Rollup is the *canning line*: it cooks the recipe into a sealed can (`dist/`) that any kitchen can open — labeled with ingredients (`.d.ts` types) and stamped "requires a working stove" (React peer dependency).

---

## 🧩 2. Project Setup

Create a fresh folder, initialize Git and npm, then add React + TypeScript as dev tooling.

```bash
# Create and enter the project
mkdir my-components-library
cd my-components-library

# Initialize git and the package manifest
git init
npm init -y

# React + TypeScript live in devDependencies for a library
# (React itself becomes a *peer* dependency later — see package.json)
npm i -D react react-dom typescript @types/react @types/react-dom
```

Add a `.gitignore` so build artifacts and dependencies are not committed:

```bash
# .gitignore
node_modules
dist
.rollup.cache
```

Create the source folder structure. A clean library uses **barrel files** (`index.ts`) so consumers can `import { Button } from "my-components-library"` instead of deep paths.

```
my-components-library/
├── src/
│   ├── index.ts                     # root barrel: re-exports everything
│   └── components/
│       ├── index.ts                 # components barrel
│       └── button/
│           ├── index.ts             # button barrel
│           └── Button.tsx           # the actual component
├── package.json
├── tsconfig.json
└── rollup.config.js
```

Now initialize and configure TypeScript for a *distributable* package (note the emphasis on emitting declarations):

```bash
npx tsc --init
```

```json
// tsconfig.json — tuned for building a library, not running an app
{
  "compilerOptions": {
    "target": "ESNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "rootDir": ".",
    "jsx": "react",
    "module": "ESNext",
    "declaration": true,              // emit .d.ts type files
    "declarationDir": "types",        // where declarations go before bundling
    "sourceMap": true,
    "outDir": "dist",                 // build output
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "emitDeclarationOnly": true       // Rollup compiles JS; tsc only emits types
  }
}
```

> [!NOTE]
> `emitDeclarationOnly: true` is the key library setting. We let **Rollup** (via its TypeScript plugin) handle JavaScript compilation while `tsc` produces only the `.d.ts` files. This avoids two competing compilation pipelines emitting the same JavaScript.

---

## ⚡ 3. CVA — Type-Safe Variant Management (deep dive)

**class-variance-authority (CVA)** solves a real pain point: as a component grows, its `className` logic degenerates into a tangle of ternaries. CVA lets you declare your variants as a structured object and returns a function that maps props → class string.

```bash
npm i class-variance-authority tailwind-merge
```

Mentally, think of `cva()` as a lookup table:

```
cva( BASE_CLASSES , {
        variants: {                 <-- the dimensions a component varies along
          variant: { primary, secondary },
          size:    { sm, md, lg },
          disabled:{ true: "..." }
        },
        defaultVariants: { ... }    <-- values used when a prop is omitted
} )
        │
        ▼
  styleFn({ variant:"primary", size:"lg" })  ──►  "base primary-classes lg-classes"
```

Compare the "before CVA" and "with CVA" approaches:

| Aspect | Manual ternaries | CVA |
| :--- | :--- | :--- |
| Readability | `cn(base, v==='primary'&&'...', v==='secondary'&&'...')` — grows quadratically | Flat declarative object, one entry per option |
| Defaults | Scattered `?? 'primary'` fallbacks | `defaultVariants` block, one source |
| Type safety | Strings are untyped — typos compile fine | `VariantProps<typeof styleFn>` auto-derives prop types |
| Adding a size | Touch every ternary | Add one key to `size` |

Here is the Button's variant configuration. We store the result of `cva()` in `buttonStyles`:

```tsx
// src/components/button/Button.tsx
import React from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// buttonStyles is a function: pass it variant/size/disabled, get a class string
const buttonStyles = cva(
  // 1) BASE classes — always applied, regardless of variant
  "px-4 py-2 rounded focus:outline-none",
  {
    // 2) VARIANTS — each key is a dimension the button varies along
    variants: {
      variant: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-500 text-black",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      disabled: {
        true: "bg-gray-300 text-gray-600 cursor-not-allowed",
      },
    },
    // 3) DEFAULTS — used when the prop is not passed
    defaultVariants: {
      variant: "primary",
      size: "md",
      disabled: false,
    },
  }
);
```

---

## ⚡ 4. tailwind-merge — Resolving Class Conflicts

There is a subtle problem here: what if a consumer passes their own `className="bg-red-500"` to override your default `bg-blue-500`? Naively concatenating the strings gives `"bg-blue-500 ... bg-red-500"` — **both** classes end up in the string, and which one wins depends on CSS source order rather than author intent. That is fragile.

`tailwind-merge` understands Tailwind's class groups: when it sees two classes from the same group (two `bg-*`, two `text-*`, two `px-*`), it keeps **only the last one**. As a result, the consumer's override reliably wins.

```tsx
// Continuing Button.tsx — the component itself

// The component accepts native button attributes PLUS our variant props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  disabled,
  children,
  className,           // consumer-supplied overrides
  ...props             // rest: onClick, type, aria-*, etc.
}) => {
  // twMerge takes the CVA output FIRST, then className LAST so overrides win
  const mergedClassNames = twMerge(
    buttonStyles({ variant, size, disabled }),
    className
  );

  return (
    <button className={mergedClassNames} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

> [!TIP]
> Order matters inside `twMerge`. Put the library's generated classes first and the consumer's `className` last. `tailwind-merge` resolves conflicts left-to-right, so whatever appears later wins — exactly the "consumer overrides the library default" behavior you want.

Wire up the barrel files so the component is exported from the package root:

```ts
// src/components/button/index.ts
export { default } from "./Button";
```

```ts
// src/components/index.ts
export { default as Button } from "./button";
```

```ts
// src/index.ts — the package entry point
export * from "./components";
```

---

## 🛠️ 5. Rollup — Bundling to CJS + ESM + Types

**Rollup** is the bundler that turns `src/` into a shippable `dist/`. We install Rollup along with a set of plugins, each with one job.

```bash
npm i -D rollup \
  @rollup/plugin-node-resolve \
  @rollup/plugin-commonjs \
  @rollup/plugin-typescript \
  @rollup/plugin-terser \
  rollup-plugin-peer-deps-external \
  rollup-plugin-postcss \
  rollup-plugin-dts
```

What each plugin does:

| Plugin | Responsibility |
| :--- | :--- |
| `rollup-plugin-peer-deps-external` | Marks `peerDependencies` (React) as *external* so they are **not** bundled — prevents the double-React bug |
| `@rollup/plugin-node-resolve` | Lets Rollup find modules in `node_modules` (e.g. `tailwind-merge`) |
| `@rollup/plugin-commonjs` | Converts CommonJS deps to ESM so Rollup can process them |
| `@rollup/plugin-typescript` | Compiles `.tsx`/`.ts` to JavaScript during the build |
| `rollup-plugin-postcss` | Processes and inlines CSS imports (needed because we use Tailwind) |
| `@rollup/plugin-terser` | Minifies the output JS for smaller bundles |
| `rollup-plugin-dts` | A **second pass** that rolls all `.d.ts` files into a single `dist/index.d.ts` |

The config exports an **array of two builds**: the first emits both CJS and ESM JavaScript, and the second bundles the type declarations.

```js
// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

// We read our own package.json to reuse its output paths
import packageJson from "./package.json" assert { type: "json" };

export default [
  // ── Pass 1: bundle the JavaScript (dual CJS + ESM output) ──
  {
    input: "src/index.ts",            // single entry that re-exports everything
    output: [
      {
        file: packageJson.main,       // "dist/cjs/index.js" — for Node/CommonJS
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,     // "dist/esm/index.js" — for modern bundlers
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),             // keep React out of the bundle
      resolve(),                      // resolve node_modules imports
      commonjs(),                     // convert CJS deps to ESM
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss(),                      // handle Tailwind/CSS imports
      terser(),                       // minify
    ],
    // do not bundle these even if imported
    external: ["react", "react-dom"],
  },

  // ── Pass 2: roll all .d.ts files into one declaration file ──
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    // CSS imports have no types — tell dts to ignore them
    external: [/\.css$/],
  },
];
```

> [!WARNING]
> The two passes must run in order: Pass 1 (and `tsc`) must produce the intermediate `.d.ts` files **before** Pass 2 can bundle them. Rollup runs array entries sequentially, so a single `rollup -c` handles both — just make sure your `declarationDir`/types path matches the `input` of Pass 2.

---

## 🧩 6. package.json — Entry Points, Files & Peer Dependencies

The `package.json` is the contract that tells npm and consuming bundlers *where to find what*. These fields are what make your library actually importable once it is installed.

```json
{
  "name": "my-components-library",
  "version": "1.0.0",
  "description": "A reusable React component library",
  "type": "module",
  "main": "dist/cjs/index.js",        // CommonJS entry (require / older tooling)
  "module": "dist/esm/index.js",      // ESM entry (import / modern bundlers)
  "types": "dist/index.d.ts",         // TypeScript declarations entry
  "files": ["dist"],                  // ONLY ship the dist folder to npm
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "scripts": {
    "rollup": "rollup -c --bundleConfigAsCjs"
  },
  "keywords": ["react", "components", "ui"],
  "peerDependencies": {
    "react": "^18 || ^19",            // consumer must already have React 18+
    "react-dom": "^18 || ^19"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

| Field | Why it matters |
| :--- | :--- |
| `main` | Entry for CommonJS (`require`) and older toolchains |
| `module` | Entry for ESM (`import`); modern bundlers prefer this for tree-shaking |
| `types` | Where TypeScript finds declarations — without it, consumers get no autocomplete |
| `files` | Whitelist of what `npm publish` uploads; `["dist"]` keeps `src` and configs out of the package |
| `exports` | Modern, explicit map of entry points per condition (`import`/`require`/`types`) |
| `peerDependencies` | "You, the consumer, must provide React" — prevents bundling a second copy |

Now build:

```bash
npm run rollup
```

You will get a `dist/` folder containing `cjs/index.js`, `esm/index.js`, and `index.d.ts` — production-ready output. To ship it publicly:

```bash
npm login          # authenticate with your npm account
npm publish        # uploads only the dist folder (per "files")
```

---

## ⚡ 7. Visual Testing with Storybook (autodocs)

Storybook renders each component in isolation so you can eyeball every variant. Initialize it and choose the **Vite** builder when prompted.

```bash
npx storybook@latest init
# If it errors about a missing builder, install Vite + React explicitly:
npm i -D react react-dom vite
npm run storybook
```

Delete the demo stories Storybook generates and write your own. Crucially, import your Tailwind CSS in `.storybook/preview.ts` so the classes actually render:

```ts
// .storybook/preview.ts
import "../src/index.css";   // your Tailwind entry — without this, styles are missing
```

```tsx
// src/stories/Button.stories.tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],            // auto-generate a documentation page
};

export default meta;
type Story = StoryObj<typeof meta>;

// Each export becomes an interactive story in the Storybook sidebar
export const Primary: Story = {
  args: { variant: "primary", size: "md", children: "Primary Button" },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md", children: "Secondary Button" },
};

export const Small: Story = {
  args: { variant: "primary", size: "sm", children: "Small Button" },
};

export const Large: Story = {
  args: { variant: "primary", size: "lg", children: "Large Button" },
};

export const Disabled: Story = {
  args: { variant: "primary", size: "md", disabled: true, children: "Disabled Button" },
};
```

> [!TIP]
> The `tags: ["autodocs"]` line tells Storybook to auto-generate a Docs page that reads your TypeScript props and lists every prop, along with its type and default. It is free, always-accurate documentation for your library's consumers.

---

## 🛠️ 8. Unit Testing with Vitest + React Testing Library

Storybook proves a component *looks* right; unit tests prove it *behaves* right and guard against regressions. Install Vitest and the testing libraries:

```bash
npm i -D vitest @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom jsdom @vitejs/plugin-react @types/jest
```

Configure Vitest with the `jsdom` environment (a fake browser DOM) and a setup file:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",          // simulate a browser DOM in Node
    globals: true,                 // use describe/it/expect without imports
    setupFiles: "src/test/setup.ts",
  },
});
```

```ts
// src/test/setup.ts — extends expect() with DOM matchers like toHaveClass
import "@testing-library/jest-dom";
```

Add the script and the Vitest types to your configs:

```json
// package.json scripts
"test:ui": "vitest --ui"
```

```json
// tsconfig.json — so TS knows about expect/describe globals
"types": ["vitest/globals"]
```

Now write tests for the Button. The key matcher is `toHaveClass`, which asserts that the CVA mapping produced the right Tailwind classes:

```tsx
// src/test/components/Button.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Button from "../../components/button/Button";

describe("Button component", () => {
  it("should render a button with default styles", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveTextContent("Click Me");
    // defaultVariants → primary + md
    expect(button).toHaveClass("bg-blue-500");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("text-base");
    expect(button).not.toBeDisabled();
  });

  it("should render a button with secondary variant", () => {
    render(<Button variant="secondary">Click Me</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("bg-gray-500");
    expect(button).toHaveClass("text-black");
  });

  it("should render a button with small size", () => {
    render(<Button size="sm">Click Me</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-sm");
  });

  it("should render a disabled button", () => {
    render(<Button disabled>Click Me</Button>);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-gray-300");
    expect(button).toHaveClass("text-gray-600");
  });

  it("should merge custom className with default styles", () => {
    render(<Button className="custom-class">Click Me</Button>);
    const button = screen.getByRole("button");

    // both the override AND the surviving default are present
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-blue-500");
  });
});
```

Run it:

```bash
npm run test:ui
```

All five tests should pass — confirming that variants, sizes, the disabled state, and `tailwind-merge` composition all work. You now have a component that is *built*, *bundled*, *visually verified*, and *unit-tested*.

---

## 🧠 Test Your Knowledge

### 1. Why must React be a `peerDependency` rather than a regular `dependency` of your library?
<details>
  <summary><b>Reveal Answer</b></summary>

  React relies on internal singleton state (the hooks dispatcher). If your library bundles its own copy of React as a regular `dependency`, the consuming app ends up with **two React instances** — and any hook call from your components throws "Invalid hook call." Declaring React under `peerDependencies` tells npm "the consuming app must already provide React," so both the app and your library share the *same single* React instance. The `rollup-plugin-peer-deps-external` plugin enforces this at build time by marking peer dependencies as external (so they are not bundled).
</details>

### 2. What problem does `tailwind-merge` solve that plain string concatenation does not?
<details>
  <summary><b>Reveal Answer</b></summary>

  Plain concatenation can leave *conflicting* classes from the same Tailwind group in the final string (e.g. both `bg-blue-500` and `bg-red-500`). The winner is then decided by CSS source order rather than author intent — fragile and surprising. `tailwind-merge` understands Tailwind's class groups and keeps only the **last** class of each conflicting group. By passing the library's generated classes first and the consumer's `className` last, the consumer's override reliably wins.
</details>

### 3. Why does the Rollup config export an array of two configuration objects?
<details>
  <summary><b>Reveal Answer</b></summary>

  The two objects are two separate build passes. **Pass 1** bundles the actual JavaScript and emits both a CommonJS output (`dist/cjs/index.js`, for `require`/older tooling) and an ESM output (`dist/esm/index.js`, for modern tree-shaking bundlers). **Pass 2** uses `rollup-plugin-dts` to roll all the intermediate `.d.ts` files into a single `dist/index.d.ts` so TypeScript consumers get one clean declaration file. Rollup runs array entries in order, so Pass 1's type emit happens before Pass 2 consumes it.
</details>

### 4. What is the role of `defaultVariants` in a CVA configuration?
<details>
  <summary><b>Reveal Answer</b></summary>

  `defaultVariants` specifies which variant value is applied when the corresponding prop is **omitted** by the consumer. In our Button, `defaultVariants: { variant: "primary", size: "md", disabled: false }` means `<Button>Hi</Button>` renders as a primary, medium, enabled button without the consumer passing anything. It centralizes defaults in one place instead of scattering `?? "primary"` fallbacks throughout the component.
</details>

### 5. In `package.json`, what is the difference between `main`, `module`, and `types`, and why include all three?
<details>
  <summary><b>Reveal Answer</b></summary>

  `main` points to the CommonJS bundle (`dist/cjs/index.js`) used by `require()` and older toolchains. `module` points to the ESM bundle (`dist/esm/index.js`); modern bundlers prefer it because ESM enables tree-shaking. `types` points to the TypeScript declaration file (`dist/index.d.ts`) so TypeScript consumers get type-checking and autocomplete. Including all three (or the equivalent `exports` map) means your library works correctly whether it is imported via `require` or `import`, in JavaScript or TypeScript — maximizing compatibility across every consuming environment.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Add a `danger` variant and a `xl` size
1. In `Button.tsx`, extend the CVA config: add `danger: "bg-red-500 text-white"` to the `variant` map and `xl: "text-xl"` to the `size` map.
2. Update the `ButtonProps` interface union types to include the new options (`"danger"` and `"xl"`).
3. Add Storybook stories `Danger` and `ExtraLarge` exercising them, then verify visually with `npm run storybook`.
4. Add Vitest tests asserting `toHaveClass("bg-red-500")` and `toHaveClass("text-xl")`. Run `npm run test:ui` and confirm they pass.

### 🛠️ Exercise 2: Build, inspect, and locally consume the package
1. Run `npm run rollup` and open `dist/`. Confirm you have `cjs/index.js`, `esm/index.js`, and `index.d.ts`. Open `index.d.ts` and verify the `ButtonProps` type is present.
2. From the library folder run `npm pack` — this produces a `.tgz` containing exactly what `npm publish` would upload. List its contents and confirm only `dist` (no `src`) is included, honoring the `files` field.
3. In a separate test React app, run `npm i ../my-components-library/my-components-library-1.0.0.tgz`, then `import { Button } from "my-components-library"` and render `<Button variant="primary">Hello</Button>`. Confirm the styles appear and TypeScript autocompletes the `variant` prop — proving your published contract works end to end.
