# Shadcn/ui: CLI, Ownership & Customization 🧩

In the previous lesson you met **DaisyUI** (CSS-only), **Radix UI** (headless behavior), and got a first taste of **Shadcn/ui**. This lesson zooms all the way in on Shadcn/ui — by far the most popular React UI toolkit today — and on the one idea that makes it genuinely different from every library before it: **you do not install Shadcn/ui as a dependency. You copy its source code into your own repository and own it forever.**

We will walk through exactly what `npx shadcn@latest init` writes to disk (`components.json`, the `cn()` helper, and CSS-variable theme tokens), what `npx shadcn@latest add button` downloads, how the generated `Button` is built from **CVA + Radix `Slot` + `cn()`**, how to customize it by editing the source directly and adding your own CVA variants, how theming works through CSS variables (light/dark), and finally how this "ownership" model compares to DaisyUI's "upgrade-via-npm" model.

> [!NOTE]
> The recorded course shows the instructor running the shadcn CLI, picking the **New York** style with the **neutral** base color, answering **yes** to CSS variables, and then adding `button`, `card`, `input`, `label`, and `select`. Everything in this written lesson is grounded in that walkthrough, but it is expanded with current best practices — including the React 19 / Tailwind v4 era where the CLI no longer asks you to hand-edit `tailwind.config.js`. Where a topic goes beyond what the video literally shows (e.g. the internals of the generated `Button`, custom CVA variants, dark-mode wiring), treat it as a deeper, accurate elaboration of the same flow.

---

## ⚡ 1. Concept & Overview: Ownership, Not Dependency

Almost every UI library you have used follows the same contract: you `npm install` a package, you `import { Button } from "the-library"`, and the actual source lives — sealed and uneditable — inside `node_modules/`. When the maintainers ship a fix, you bump the version and `npm install` again. You **rent** the components.

Shadcn/ui inverts this. There is no `@shadcn/ui` runtime package in your `dependencies`. Instead, a **CLI** reaches out to a registry, downloads the `.tsx` source of the component you asked for, and writes it directly into `src/components/ui/`. From that moment the file is *yours*: it is plain TypeScript + React in your repo, it shows up in your Git diffs, and you can edit a single class name or rip the whole thing apart. You **own** the components.

### 🏠 A Real-World Metaphor

| Model | Real-world analogy | What "upgrading" means |
| :--- | :--- | :--- |
| **Rented dependency** (MUI, Chakra, DaisyUI) | Leasing a fully furnished apartment. The landlord owns the sofa; you cannot saw the legs off, but if it breaks the landlord replaces it. | `npm update` — the landlord swaps the furniture; you do nothing. |
| **Owned source** (Shadcn/ui) | Buying the flat-pack furniture and assembling it in *your* home. The moment you screw it together it is yours — repaint it, drill new holes, swap the hinges. | You re-run the CLI for *new* pieces; for pieces you already own and edited, **you** decide whether to merge upstream changes. |

That single trade — give up automatic upgrades, gain total control — is the entire personality of Shadcn/ui. The rest of this lesson is mechanics.

> [!TIP]
> The most useful mental model: **Shadcn/ui is a recipe book and a code-delivery robot, not a kitchen appliance.** The robot (CLI) drops a finished, well-built dish (component source) onto your counter. After that, the dish is food on your plate — season it however you want.

---

## 🧩 2. What the CLI Writes: `init`

Setup begins with one command, run in the root of an existing React + TypeScript project (the course uses a Vite + React + TS app):

```bash
# Run inside your project root
npx shadcn@latest init
```

The init wizard asks a few questions. In the course the instructor picks the **New York** style, the **neutral** base color, and answers **yes** to CSS variables. On modern setups (Tailwind v4 + React 19) the prompts collapse to roughly:

```text
? Which style would you like to use?      › New York
? Which color would you like as base?     › Neutral
? Where is your global CSS file?          › src/index.css
? Do you want to use CSS variables?       › yes
```

> [!NOTE]
> In older Tailwind v3 setups (what the video records) you also had to make sure `tailwind.config.js` existed first, paste a `content` glob and the `@tailwind` directives into your CSS, and set `baseUrl` + `paths` in `tsconfig.json` so the `@/` alias resolves. With **Tailwind v4** the CLI handles the CSS wiring for you and there is no `tailwind.config.js` to hand-edit — config lives in CSS via `@theme`. The instructor hit a "No Tailwind CSS configuration found" error precisely because Tailwind was not set up *before* `init`; the fix was to configure Tailwind first, then re-run `init`.

### The three things `init` creates

```text
your-project/
├── components.json          ← (NEW) the CLI's config: style, aliases, paths
├── src/
│   ├── index.css            ← (EDITED) theme tokens added as CSS variables
│   ├── lib/
│   │   └── utils.ts         ← (NEW) the cn() helper
│   └── components/
│       └── ui/              ← (NEW, empty for now) future components land here
```

**1) `components.json`** — the manifest the CLI reads on every future `add`. It records your chosen style, whether you use CSS variables, your Tailwind CSS entry file, and the import aliases.

```json
// components.json — generated by `init`, read by every later `add`
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**2) `src/lib/utils.ts`** — the `cn()` helper. Every generated component imports this. It composes `clsx` (conditional class joining) with `tailwind-merge` (conflict resolution), so the *last* conflicting Tailwind class wins.

```typescript
// src/lib/utils.ts — created by `init`
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn = "class names". It does two jobs in one call:
//   1. clsx flattens arrays/objects/conditionals into a single string,
//      dropping falsy values: cn("a", false && "b", ["c"]) -> "a c"
//   2. twMerge then de-duplicates *conflicting* Tailwind utilities,
//      keeping the last one: cn("px-2", "px-4") -> "px-4"
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

> [!TIP]
> `cn()` is why a consumer can override a generated component's defaults safely. Because the component does `cn(buttonVariants({ variant }), className)`, your passed-in `className="bg-red-500"` lands *after* the variant's `bg-primary` and `tailwind-merge` keeps yours. No `!important`, no specificity wars.

**3) CSS-variable theme tokens** — `init` writes a palette of design tokens into your global CSS as CSS custom properties, with a separate set under a `.dark` selector. These are the named colors (`--primary`, `--background`, `--destructive`, …) that every generated component references through Tailwind classes like `bg-primary` and `text-primary-foreground`.

```css
/* src/index.css — tokens added by `init` (Tailwind v4 / oklch values) */
@import "tailwindcss";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);            /* page background          */
  --foreground: oklch(0.145 0 0);       /* default text             */
  --primary: oklch(0.205 0 0);          /* brand / primary surface  */
  --primary-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325); /* danger / delete       */
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);             /* focus ring               */
}

.dark {
  /* Same token NAMES, different VALUES. Toggling the `dark` class on
     <html> instantly re-skins every component that uses these tokens. */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);
}
```

---

## 🛠️ 3. Adding Components: `add`

With `init` done, you pull in components on demand. Each `add` downloads source files into `src/components/ui/` and installs any npm peer packages that component needs (e.g. the relevant `@radix-ui/*` primitive).

```bash
# Add one component
npx shadcn@latest add button

# Add several at once (the course adds these for a form)
npx shadcn@latest add card input label select
```

After running these, your tree looks like this — each file is real, editable source you now own:

```text
src/components/ui/
├── button.tsx     ← CVA + Radix Slot + cn()
├── card.tsx       ← Card, CardHeader, CardTitle, CardContent, CardFooter
├── input.tsx
├── label.tsx      ← wraps @radix-ui/react-label
└── select.tsx     ← wraps @radix-ui/react-select (full behavior, styled)
```

You import them with the `@/` alias (configured during init) and use them like any local component:

```tsx
// src/App.tsx — consuming owned components
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="p-8 flex gap-3">
      {/* "default" variant, "default" size come from defaultVariants */}
      <Button>Learn More</Button>
      <Button variant="destructive" size="sm">
        Delete Account
      </Button>
    </div>
  );
}
```

> [!WARNING]
> `add` is **idempotent only for new files** — if you re-run `add button` after editing `button.tsx`, the CLI will offer to **overwrite** your file and blow away your customizations. Because you own the source, treat `src/components/ui/*` like any hand-written code: commit it, and only re-run `add` for that component when you deliberately want to reset it. Newer CLI versions prompt before overwriting; don't muscle-memory your way through the confirmation.

---

## 🧩 4. Anatomy of the Generated `Button`

This is the payoff for understanding CVA in the library-building lesson. The `button.tsx` the CLI hands you combines three tools you already know:

- **CVA** (`class-variance-authority`) — declares the `variant`/`size` matrix and the defaults.
- **Radix `Slot`** (`@radix-ui/react-slot`) — the `asChild` mechanism that lets the Button *become* the element it wraps.
- **`cn()`** — merges the CVA output with any consumer-supplied `className`.

```tsx
// src/components/ui/button.tsx — exactly the kind of file `add button` writes
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1) CVA: base classes + the variant matrix. Every class references a
//    CSS-variable token (bg-primary, text-destructive-foreground, ...),
//    so theming is automatic.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
    "text-sm font-medium transition-colors focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none " +
    "disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2) Props = native <button> attributes + the CVA variant props (auto-derived)
//    + asChild. VariantProps<typeof buttonVariants> gives us a fully typed
//    `variant` and `size` union for free.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // 3) Slot magic: if asChild is true, render the CHILD element with our
    //    classes/ref/props merged onto it. Otherwise render a real <button>.
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Why `Slot` / `asChild` matters

`asChild` solves a real problem: you want a *link* that looks exactly like your Button without nesting an `<a>` inside a `<button>` (invalid HTML) and without copy-pasting all the button classes onto the anchor.

```tsx
import { Button } from "@/components/ui/button";

// WITHOUT asChild: renders <button>…</button> (a real button element)
<Button variant="outline">Plain button</Button>;

// WITH asChild: Slot MERGES the button's classes/props onto the <a>,
// so you get one <a> element that LOOKS like the button. No nested tags.
<Button asChild variant="link">
  <a href="/pricing">Go to pricing</a>
</Button>;
```

```text
asChild = false                     asChild = true
──────────────                      ─────────────
<Comp> resolves to "button"         <Comp> resolves to Slot
       │                                   │
       ▼                                   ▼
<button class="…btn classes…">      Slot clones its CHILD (<a>) and
  children                          merges class/ref/onClick onto it
</button>                                  │
                                           ▼
                                    <a class="…btn classes…" href="…">
```

> [!NOTE]
> `forwardRef` is present so parent components and Radix wrappers (tooltips, dropdown triggers) can attach a `ref` to the underlying DOM node — essential for focus management and positioning. Keep it when you customize.

---

## ⚡ 5. Customization: Edit the Source, Add CVA Variants

Because the file is yours, customization is just *editing code* — no theme-override API, no `styled()` wrapper, no prop drilling through a config object. The two everyday customizations are: tweak existing classes, and add a brand-new variant.

Here we add a `gradient` variant and an `xl` size directly to `buttonVariants`:

```tsx
// src/components/ui/button.tsx — your edits inside the existing CVA call
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
    "text-sm font-medium transition-colors focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none " +
    "disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // NEW: a custom gradient variant — fully owned, no upstream needed
        gradient:
          "bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white " +
          "shadow-md hover:from-fuchsia-500 hover:to-indigo-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // NEW: an extra-large size
        xl: "h-14 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

The instant you add `gradient` and `xl` to the maps, `VariantProps<typeof buttonVariants>` re-derives the prop unions, so TypeScript autocompletes — and type-checks — the new options with **zero** extra typing:

```tsx
// Both lines compile with full IntelliSense; a typo like variant="grandient"
// is a compile-time error because the union came straight from the CVA config.
<Button variant="gradient" size="xl">Upgrade now ✨</Button>;
<Button variant="gradient" size="sm">Small gradient</Button>;
```

> [!TIP]
> Prefer adding **new** variants over rewriting existing ones when you can. New keys are additive and won't surprise other components that rely on `default`/`outline`. If you must change a base class, do it in the `cva` base string so every variant inherits it consistently.

---

## 🧩 6. Theming with CSS Variables (Light / Dark)

The generated components never hardcode a hex color — they reference token classes (`bg-primary`, `text-foreground`, `border-border`). Those classes resolve to the CSS variables `init` wrote. To switch the whole app to dark mode you only flip **one class** on `<html>`; every component re-skins because the variable *values* under `.dark` take over.

Here is a complete, runnable theme toggle for React 19 with persistence:

```tsx
// src/components/ThemeToggle.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

// Read the saved theme (or fall back to the OS preference) — runs once.
function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  // Whenever theme changes: toggle the `dark` class on <html> and persist it.
  React.useEffect(() => {
    const root = document.documentElement; // the <html> element
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"} — click to switch
    </Button>
  );
}
```

```text
                 .dark class toggled on <html>
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                         ▼
  :root tokens                              .dark tokens
  --primary: near-black                     --primary: near-white
        │                                         │
        └──────────► bg-primary class ◄───────────┘
                          │
              every <Button>, <Card>, <Input>
              recolors at once — no re-render of
              token values, pure CSS cascade
```

> [!NOTE]
> This is conceptually identical to DaisyUI's `data-theme` toggle you saw in the previous lesson — both are "flip one attribute/class, the CSS cascade does the rest." The difference is *where the tokens live and who can change them*: DaisyUI's themes ship inside the npm plugin, while Shadcn's tokens live in **your** CSS file, so you can rename, add, or fully re-author a theme without touching any dependency.

---

## ⚡ 7. Shadcn/ui vs DaisyUI: Ownership & the Upgrade Story

Both sit on Tailwind, both theme via a CSS hook, both are popular — but they make opposite bets on ownership.

| Dimension | **DaisyUI** | **Shadcn/ui** |
| :--- | :--- | :--- |
| Distribution | `npm install daisyui` — lives in `node_modules` | CLI copies `.tsx` into `src/components/ui/` |
| What you get | Semantic CSS classes (`btn btn-primary`) | Full React component source you own |
| Behavior / a11y | None — CSS only; you wire `useState` for modals | Radix primitives bundle focus trap, keyboard, ARIA |
| Customization | Theme config + utility overrides; component internals are fixed | Edit the source line-by-line; add CVA variants freely |
| **Upgrade story** | `npm update daisyui` — fixes/new components arrive automatically | You re-run the CLI per component; **you** merge upstream changes manually |
| Bundle impact | Pure CSS, zero JS runtime | Ships the Radix JS the components use (only what you add) |
| Best when | Fast prototypes, content sites, you want hands-off upgrades | App UIs needing deep customization, strong a11y, full control |

> [!WARNING]
> The ownership model has a real cost: **there is no automatic upgrade.** If Shadcn fixes a bug in `dialog.tsx` upstream, your already-copied `dialog.tsx` does **not** change. You either re-run `add dialog` (overwriting your edits) or hand-port the fix. DaisyUI's `npm update` gives you fixes for free but won't let you reach inside a component's markup. Pick the trade deliberately: control vs. maintenance.

---

## 🧠 Test Your Knowledge

### 1. Why is Shadcn/ui *not* listed in your `package.json` dependencies?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because Shadcn/ui is not a runtime library you import from `node_modules` — it is a **CLI that copies source code into your repo**. Running `npx shadcn@latest add button` downloads `button.tsx` directly into `src/components/ui/`, where it becomes ordinary, editable code you own and commit. The only things that *do* land in `dependencies` are the supporting packages the components use (`class-variance-authority`, `clsx`, `tailwind-merge`, and specific `@radix-ui/*` primitives) — but the Shadcn components themselves are your source, not a package.
</details>

### 2. What three things does `npx shadcn@latest init` create, and what is each for?
<details>
  <summary><b>Reveal Answer</b></summary>

  1. **`components.json`** — the manifest recording your chosen style (e.g. New York), base color, CSS file path, whether you use CSS variables, and your import aliases (`@/components`, `@/lib/utils`). Every later `add` reads it.
  2. **`src/lib/utils.ts`** containing **`cn()`** — a helper that runs `clsx` (to flatten conditional class lists) then `tailwind-merge` (to resolve conflicting Tailwind utilities so the last one wins). Every generated component imports it.
  3. **CSS-variable theme tokens** added to your global CSS — named design tokens like `--primary`, `--background`, `--destructive` under `:root`, plus a matching set under `.dark`. Components reference these via classes like `bg-primary`.
</details>

### 3. In the generated `Button`, what do CVA, Radix `Slot`, and `cn()` each contribute?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **CVA** declares the variant matrix (`variant`, `size`) plus `defaultVariants`, and via `VariantProps<typeof buttonVariants>` auto-derives the typed `variant`/`size` props.
  - **Radix `Slot`** powers `asChild`: when `asChild` is true the component renders `Slot`, which merges the button's classes/ref/props onto its *child* element (e.g. an `<a>`) instead of rendering a real `<button>` — so you get a link styled like a button without invalid nested tags.
  - **`cn()`** merges the CVA-generated class string with any consumer `className`, using `tailwind-merge` so the consumer's override beats the variant default without specificity hacks.
</details>

### 4. How do you add a new `gradient` variant, and why is it instantly type-safe?
<details>
  <summary><b>Reveal Answer</b></summary>

  You add a `gradient` key inside the `variants.variant` object in the existing `cva(...)` call in `button.tsx` (the file you own), giving it the Tailwind classes you want. It is instantly type-safe because the Button's props extend `VariantProps<typeof buttonVariants>`, which re-derives the `variant` union *from the CVA config itself*. The moment `gradient` exists in the config, `variant="gradient"` autocompletes and a misspelling becomes a compile-time error — you never maintain a separate prop type.
</details>

### 5. Compared to DaisyUI, what is the upgrade trade-off you accept with Shadcn/ui?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI lives in `node_modules`, so `npm update daisyui` pulls bug fixes and new components automatically — but you cannot edit a component's internal markup/behavior. Shadcn/ui copies source into your repo, giving you total control to edit and add variants — but there is **no automatic upgrade**: an upstream fix to a component does not reach your already-copied file. You must re-run the CLI for that component (overwriting your edits) or hand-port the change. The trade is **control vs. maintenance**: Shadcn maximizes control at the cost of manual upkeep; DaisyUI maximizes hands-off upgrades at the cost of customizability.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Initialize Shadcn, add a Button, and ship a custom variant
1. In a fresh **Vite + React + TypeScript** project, set up Tailwind, then run `npx shadcn@latest init` (choose **New York**, **neutral**, CSS variables **yes**). Confirm `components.json`, `src/lib/utils.ts`, and the CSS tokens were created.
2. Run `npx shadcn@latest add button` and open `src/components/ui/button.tsx`. Locate the `buttonVariants` CVA call.
3. Add a `success` variant (`bg-emerald-600 text-white hover:bg-emerald-500`) and an `xl` size (`h-14 rounded-lg px-10 text-base`).
4. In `App.tsx`, render `<Button variant="success" size="xl">Saved ✓</Button>` next to a `<Button variant="destructive">Delete</Button>`. Confirm IntelliSense lists `success` and that a typo (`variant="sucess"`) fails the TypeScript build.

Starter:

```tsx
// src/App.tsx
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="min-h-screen grid place-items-center gap-4 p-8">
      {/* TODO: render your custom success/xl button + a destructive button */}
      <div className="flex gap-3">
        <Button>TODO</Button>
      </div>
    </main>
  );
}
```

### 🛠️ Exercise 2: Wire up a persistent light/dark theme toggle
1. Add the `ThemeToggle` component from Section 6 to your app.
2. Verify that clicking it toggles the `dark` class on `<html>` (inspect the element) and that the Button, plus any `Card`/`Input` you add, recolor instantly.
3. Reload the page — confirm the choice persists from `localStorage`. Then clear `localStorage` and confirm it falls back to your OS `prefers-color-scheme`.
4. **Reflection:** Add a `<Card>` (`npx shadcn@latest add card`) with some text and note that you wrote **zero** dark-mode classes on it — it themed automatically because it references `bg-card`/`text-card-foreground` tokens. Compare this to how DaisyUI's `data-theme` achieved the same effect in the previous lesson, and explain who owns the token values in each case.

```tsx
// src/App.tsx — Exercise 2 scaffold
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 flex flex-col gap-6">
      <ThemeToggle />
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        {/* TODO: add a <Card> here and confirm it themes with no extra classes */}
      </div>
    </main>
  );
}
```
