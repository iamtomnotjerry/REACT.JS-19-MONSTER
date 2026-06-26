# Storybook: Isolated Component Development & Documentation 📖

When you build a button, an input, or a modal, you usually only get to *see* it after wiring it into a page, clicking through three routes, and forcing it into the right state. **Storybook** flips that around. It is an open-source tool for developing and testing UI components **in isolation** — outside your main application — so you can build, test, and showcase each piece of UI *before* it is ever integrated into the rest of the app.

In this lesson we build several stories from scratch: a button and an input, then a combined "combo" story. Along the way we cover **args**, the interactive **Controls** panel, **argTypes** for control types, story **nesting** and **renaming**, **parameters** (layout & backgrounds), the three levels of **decorators**, full **TypeScript** typing with `Meta` and `StoryObj`, **addons**, and finally **Autodocs** for auto-generated living documentation.

> [!NOTE]
> Storybook shines for **large, enterprise-scale applications and design systems** — where many people build many reusable components. For a tiny portfolio site you *can* use it, but the setup overhead rarely pays off. Reach for it when component reuse, visual consistency, and documentation actually matter.

---

## ⚡ 1. What Is Storybook & Why Use It?

Think of Storybook as a **photo studio for your components**. In a studio you place a single product against a clean backdrop, change the lighting, swap props, and shoot it from every angle — without the noise of the rest of the showroom. Storybook does the same for UI: it isolates one component and lets you exercise every visual state on demand.

It delivers four big benefits:

| Benefit | What it means | Why it matters |
| :--- | :--- | :--- |
| **Component isolation** | Build & test a component without running the whole app. | You focus on *one* component's behavior, not the entire routing/data layer. |
| **Visual testing** | A visual interface for viewing every state: themes, sizes, data inputs, disabled/loading. | Catches visual and behavioral bugs *early*, before integration. |
| **Living documentation** | Each "story" is a documented use case, auto-displayed in the UI. | Docs stay in sync as the component evolves. |
| **Addons** | Extensions for a11y checks, responsive testing, interaction testing, and more. | Extend Storybook to fit your team's workflow. |

> [!TIP]
> A **story** is a single, named, rendered example of a component in one specific state (e.g. `Primary`, `Disabled`, `Loading`). One component file typically owns *many* stories — one per visual "flavor".

---

## ⚡ 2. Installation & Initialization

Storybook is not limited to React — it also works with Svelte, Vue, and other frameworks. Start with any React app (Vite or Create React App), then initialize Storybook on top of it.

```bash
# 1. Create a fresh React + TypeScript project (Vite)
npm create vite@latest storybook-demos
#    → choose "React" then "TypeScript"
cd storybook-demos
npm install

# 2. Initialize Storybook inside the existing project
npx storybook@latest init
#    (the older shorthand `npx sb init` also works)
```

The `init` command inspects your project, installs the right Storybook packages, and scaffolds two things:

1. A **`.storybook/`** folder containing configuration files.
2. A **`src/stories/`** folder with example stories (Button, Header, Page) you can study, then delete.

Run it with:

```bash
npm run storybook
```

This boots the Storybook UI in your browser. You can build not just a simple button, but entire headers and even full pages — and document each one.


### The `.storybook/` configuration files

```text
.storybook/
├── main.ts      ← Setup & behavior config: where stories live, which addons load,
│                  bundler (Vite/Webpack) config, framework, etc.
└── preview.ts   ← Preview config: how stories are RENDERED & displayed in the UI
                   (global decorators, global parameters, backgrounds, etc.)
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Glob telling Storybook where to find your story files
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  // Default addons added by `init`
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
```

---

## ⚡ 3. Your First Story (CSF — Component Story Format)

Delete the generated `src/stories/` folder and recreate your own. Stories use **CSF (Component Story Format)**: a plain `.stories.tsx` file with a **default export** (metadata) and one or more **named exports** (the stories themselves).

First, a plain component (no TypeScript yet — we add types later so you can focus on the Storybook syntax):

```jsx
// src/stories/components/Button.jsx
const Button = (props) => {
  // Spread every prop straight onto the button for now
  return <button {...props}>Click me</button>;
};

export default Button;
```

Now its story file — note the file name pattern `Name.stories.tsx`:

```jsx
// src/stories/Button.stories.jsx
import Button from "./components/Button";

// The DEFAULT export = metadata about this set of stories
export default {
  title: "components/Button", // Where it appears in the sidebar tree
  component: Button,          // The component these stories exercise
};

// A NAMED export = one story (one "flavor" of the component)
export const Primary = () => <Button />;
```

> [!NOTE]
> The `title` controls the sidebar label and folder structure. The `component` tells Storybook which component these stories document. Each **named export** becomes a selectable story in the sidebar.

---

## ⚡ 4. Variations (Flavors) Without Copy-Paste

Make the component accept arbitrary props so each story can configure it differently — with no need to duplicate the component:

```jsx
// src/stories/components/Button.jsx
const Button = (props) => {
  // Spread all incoming props so each story can customize the button
  return <button {...props}>Button</button>;
};

export default Button;
```

```jsx
// src/stories/Button.stories.jsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
};

// Three "flavors" of the same component — driven purely by props
export const Primary = () => <Button variant="primary" />;
export const Secondary = () => <Button variant="secondary" />;
export const Danger = () => <Button variant="danger" />;
```

Each named export shows up as a separate variation under the `Button` entry in the sidebar — all from one component, each configured with different props.

---

## ⚡ 5. Args & the Controls Panel

Hard-coding props inside arrow functions is the **old way**. The **modern way** is to export an **object** with an `args` field. **Args** are the values of the props passed to your component. They let you:

- pass props to the component,
- control its behavior **interactively** in the UI,
- and document the component's props.

```tsx
// src/stories/components/Button.tsx
interface ButtonProps {
  label: string;
  primary?: boolean;            // optional
  onClick?: () => void;         // optional
}

const Button = ({ label, primary = false, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: primary ? "blue" : "gray",
        color: "white",
        padding: 10,
        border: "none",
        borderRadius: 5,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
```

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
};

// MODERN way: a story is an object with `args` (props for this story)
export const Primary = {
  args: {
    primary: true,
    label: "Label of button",
    onClick: () => console.log("You clicked me!"), // logs on click
  },
};
```

Open a story and click the **Controls** tab (or press `Alt + A`) to reveal the **Controls panel**. There you can flip `primary` on and off, retype `label`, and click the button to fire `onClick` — all live, with no code changes.

> [!TIP]
> The Controls panel is the heart of Storybook's interactivity. Args feed the panel; the panel feeds the component. Change a value and the rendered component re-renders instantly — perfect for testing every state in isolation.

---

## ⚡ 6. argTypes & Control Types

`args` set the *values*; **`argTypes`** tell Storybook *how each prop should be edited* in the Controls panel. They are metadata that map each prop to a specific control widget — a color picker, a dropdown, a number stepper, and so on.

```tsx
// src/stories/components/Button.tsx
interface ButtonProps {
  label: string;
  backgroundColor: string;
  size: "small" | "medium" | "large";
  borderRadius: number;
  fontSize: string;
  textColor: string;
}

const sizeStyles = {
  small: "5px 10px",
  medium: "10px 20px",
  large: "15px 30px",
};

const Button = ({
  label,
  backgroundColor,
  size,
  borderRadius,
  fontSize,
  textColor,
}: ButtonProps) => {
  return (
    <button
      style={{
        backgroundColor,
        padding: sizeStyles[size],
        borderRadius: `${borderRadius}px`,
        fontSize,
        color: textColor,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
```

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
  // argTypes = HOW each prop is edited in the Controls panel
  argTypes: {
    backgroundColor: { control: "color" }, // color picker
    size: {
      control: "select",                   // dropdown
      options: ["small", "medium", "large"],
    },
    label: {
      control: "text",                     // text input
      description: "Text displayed on the button",
    },
    borderRadius: {
      control: "number",                   // number stepper
      min: 0,
      max: 50,
      step: 1,
    },
  },
};

export const Primary = {
  args: {
    label: "Click me",
    backgroundColor: "#007BFF",
    size: "medium",
    borderRadius: 4,
    fontSize: "16px",
    textColor: "#FFF",
  },
};

export const Secondary = {
  args: {
    label: "Click me",
    backgroundColor: "#6c757d",
    size: "medium",
    borderRadius: 4,
    fontSize: "16px",
    textColor: "#FFF",
  },
};
```

Here's how the common control types map:

| `control` value | Widget shown | Best for |
| :--- | :--- | :--- |
| `"color"` | Color picker | hex / rgb props (e.g. `backgroundColor`) |
| `"select"` | Dropdown (needs `options`) | a fixed set of choices (e.g. `size`) |
| `"text"` | Text input | free-form strings (e.g. `label`) |
| `"number"` | Number stepper (`min` / `max` / `step`) | numeric props (e.g. `borderRadius`) |
| `"boolean"` | Toggle switch | true/false flags (e.g. `disabled`) |

---

## ⚡ 7. Story Organization: Nesting & Renaming

### 🧩 Nesting via forward slashes in `title`

The `title` string uses **forward slashes** to build a folder tree in the sidebar. Each `/` creates another nesting level:

```tsx
export default {
  title: "products/buttons", // → "products" folder → "buttons" subfolder
  component: Button,
};
// Sidebar: products ▸ buttons ▸ Primary
```

```tsx
export default {
  title: "special/products/buttons", // 3 levels deep
  component: Button,
};
```

### 🧩 Renaming a story with `storyName`

By default, a story's sidebar label is its export name. You can override it with **`storyName`** (an older but handy technique):

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
};

export const Primary = () => <Button variant="primary" />;
Primary.storyName = "Blue Button"; // sidebar shows "Blue Button"

export const Secondary = () => <Button variant="secondary" />;
Secondary.storyName = "Green Button";

export const Danger = () => <Button variant="danger" />;
Danger.storyName = "Red Button";
```

> [!NOTE]
> `storyName` only changes the **display label** — the export name still identifies the story in code. With the modern object syntax + `args` you rarely need it, but it's useful for human-friendly labels.

---

## ⚡ 8. Combo Stories (a Story Within a Story)

You're not limited to one component per story. To showcase several components together, render a small wrapper component instead of pointing at a single `component`:

```tsx
// src/stories/Combo.stories.tsx
import Input from "./components/Input";
import Button from "./components/Button";

export default {
  title: "combo/components",
};

// A custom component that combines several others
export const Combo = () => (
  <div>
    <Input placeholder="Enter whatever you prefer" size="20rem" />
    <Button primary label="Submit" />
  </div>
);
```

This is great for documenting how components look **next to each other** — a form layout, a toolbar, or a card with actions.

---

## ⚡ 9. Parameters: Look & Feel of the Canvas

**Parameters** change the look and feel of the Storybook *canvas* (the area where your component renders) and panels. Two common uses are centering the component and configuring background swatches.

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
  parameters: {
    layout: "centered", // center the component in the canvas
    controls: { expanded: true }, // show description + default columns in Controls
    backgrounds: {
      default: "light", // initially selected background
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#333333" },
        { name: "sky blue", value: "#00BCD4" },
        { name: "hot pink", value: "#FF69B4" },
      ],
    },
  },
};
```

`layout` accepts `"centered"`, `"fullscreen"`, or `"padded"` (default). The `backgrounds` toolbar lets you flip the canvas backdrop between your defined swatches to check contrast.

---

## ⚡ 10. Decorators: Three Levels of Wrapping

A **decorator** is a function that **wraps** a story, letting you inject extra layout, styling, or context (such as a theme provider or router) around the rendered component. It receives the `Story` and returns it wrapped in whatever you want.

There are **three levels**, from narrowest to widest scope:

| Level | Where defined | Applies to |
| :--- | :--- | :--- |
| **Variation** | On a single story export | Just that one story |
| **Local** | On the `default export` (meta) | Every story in that file |
| **Global** | In `.storybook/preview.ts` | Every story in the project |

### 🛠️ Variation-level (one story only)

```tsx
// Applies ONLY to this single story
export const Default = {
  args: { label: "Click me", color: "#007BFF", disabled: false },
  // variation-only decorator
  decorators: [
    (Story: any) => (
      <div style={{ padding: 20, backgroundColor: "#F0F0F0", borderRadius: 4 }}>
        <Story />
      </div>
    ),
  ],
};
```

### 🛠️ Local (whole file)

Move the decorator up to the default export so every story in the file gets it:

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
  // local decorator: applies to EVERY story in this file
  decorators: [
    (Story: any) => (
      <div style={{ padding: 20, backgroundColor: "#F0F0F0", borderRadius: 4 }}>
        <Story />
      </div>
    ),
  ],
};

export const Primary = { args: { label: "Click me", color: "#007BFF" } };
export const Secondary = { args: { label: "Click me", color: "#6c757d" } };
```

### 🛠️ Global (entire project)

Best practice: put reusable decorators in their own file, then register them in `preview.ts`. First, define the decorator separately:

```tsx
// .storybook/decorators.tsx
import React from "react";
import type { Decorator } from "@storybook/react";

// Convention: name reusable decorators "with…"
export const withBackgroundColor: Decorator = (StoryFn) => {
  return (
    <div style={{ padding: 20, backgroundColor: "#F0F0F0", borderRadius: 4 }}>
      <StoryFn />
    </div>
  );
};
```

Then register it globally in `preview.ts`:

```tsx
// .storybook/preview.ts
import { withBackgroundColor } from "./decorators";

// Global decorators apply to EVERY component in the project
export const decorators = [withBackgroundColor];
```

> [!WARNING]
> Decorators are scoped: a **local** decorator on `Button.stories.tsx` will *not* affect `Input.stories.tsx`. If you need the same wrapper everywhere, register it **globally** in `preview.ts` — don't copy-paste it into every file.

---

## ⚡ 11. TypeScript: `Meta` & `StoryObj`

Storybook ships two key types. Import them from `@storybook/react`:

- **`Meta<T>`** — types the **default export** (the metadata / initial values).
- **`StoryObj<T>`** — types each **named story** export (the variation objects).

```tsx
// src/stories/components/Button.tsx
export interface ButtonProps {
  label: string;
  onClick?: () => void;
  color: string;
  disabled?: boolean;
}

const Button = ({ label, onClick, color, disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: color,
        padding: "10px 20px",
        border: "none",
        borderRadius: 4,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
```

```tsx
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./components/Button";

// Meta typed with our own ButtonProps → full prop autocomplete & checking
const meta: Meta<ButtonProps> = {
  title: "components/Button",
  component: Button,
  argTypes: {
    color: { control: "color" },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;

// Each story is a StoryObj typed against the same props
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: { label: "Click me", color: "#007BFF", disabled: false },
};

export const Disabled: Story = {
  args: { label: "This is the disabled button", color: "#007BFF", disabled: true },
};

export const Red: Story = {
  args: { label: "Red button", color: "#FF0000", disabled: false },
};
```

> [!TIP]
> Typing `Meta<ButtonProps>` and `StoryObj<ButtonProps>` means TypeScript validates your `args` against the real component props. Misspell a prop or pass the wrong type and you get a compile-time error — your stories can't drift out of sync with the component.

---

## ⚡ 12. Addons

**Addons** are extensions that add capabilities to Storybook — much like VS Code extensions add capabilities to your editor. `init` installs a default set:

- **`@storybook/addon-essentials`** — the core bundle (Controls, Actions, Backgrounds, Viewport, etc.).
- **`@storybook/addon-interactions`** — write & replay interaction tests.
- **`@storybook/addon-onboarding`** — the first-run guided tour.

You can browse more in the official addons catalog and install them like any other package:

```bash
# Example: install the official documentation addon
npm install @storybook/addon-docs
```

Then enable it in `.storybook/main.ts` by adding it to the `addons` array.

---

## ⚡ 13. Autodocs: Auto-Generated Living Documentation

Storybook can auto-generate a full documentation page for a component from its args, argTypes, and stories. Opt in with the **`tags: ["autodocs"]`** flag on the meta:

```tsx
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./components/Button";

const meta: Meta<ButtonProps> = {
  title: "components/Button",
  component: Button,
  tags: ["autodocs"], // ← generates a "Docs" page automatically
  argTypes: {
    color: { control: "color" },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: { label: "Click me", color: "#007BFF", disabled: false },
};
```

Restart Storybook and a new **Docs** entry appears. It shows the component, a live code snippet, an editable props table (label, disabled, onClick…), and every story rendered inline — all generated from your stories. This is the "living documentation" that so many teams adopt Storybook for.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. What problem does Storybook's "component isolation" actually solve?
<details>
  <summary><b>Reveal Answer</b></summary>

  It lets you build and test a single UI component **without running the entire application** — no routing to the right page, no logging in, no faking server data just to reach the state you want to see. You render the component directly in Storybook and drive its props yourself, so you can focus purely on that one component's appearance and behavior, and catch visual/behavioral bugs early in development.
</details>

### 2. What is the difference between `args` and `argTypes`?
<details>
  <summary><b>Reveal Answer</b></summary>

  **`args`** are the actual **values** of the props passed to the component for a given story (e.g. `{ label: "Click me", primary: true }`). **`argTypes`** are **metadata** that tell Storybook *how each prop should be edited* in the Controls panel — which control widget to use (`color`, `select`, `text`, `number`, `boolean`), plus extras like `options`, `min`/`max`/`step`, and `description`. In short: `args` = the data, `argTypes` = the editing UI for that data.
</details>

### 3. How does the `title` field control the Storybook sidebar, and what does `storyName` do?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `title` string uses **forward slashes** to build a nested folder tree in the sidebar — `"products/buttons"` creates a `products` folder containing a `buttons` group, and the component's stories live under it. `storyName` overrides the **display label** of an individual story (which otherwise defaults to its export name), e.g. `Primary.storyName = "Blue Button"` shows "Blue Button" in the sidebar while the code still exports `Primary`.
</details>

### 4. Name the three levels of decorators and the scope of each.
<details>
  <summary><b>Reveal Answer</b></summary>

  1. **Variation-level** — defined via `decorators` on a single named story export; applies to **only that one story**.
  2. **Local-level** — defined via `decorators` on the **default export (meta)**; applies to **every story in that file**.
  3. **Global-level** — registered in **`.storybook/preview.ts`** (typically importing a reusable decorator like `withBackgroundColor`); applies to **every story in the entire project**. A local decorator on the Button file does NOT affect the Input file — only a global one reaches everywhere.
</details>

### 5. What do `Meta` and `StoryObj` give you, and how does `tags: ["autodocs"]` relate to documentation?
<details>
  <summary><b>Reveal Answer</b></summary>

  `Meta<Props>` types the **default export** (metadata such as `title`, `component`, `argTypes`), and `StoryObj<Props>` types each **named story** object. Typing them with your component's props makes TypeScript validate every story's `args` against the real props — so a misspelled or wrong-typed arg is a compile error. Separately, adding `tags: ["autodocs"]` to the meta tells Storybook to **auto-generate a "Docs" page** from your component, args, argTypes, and stories — a code snippet, an editable props table, and all variations rendered inline.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: A Fully-Controlled Button

1. Scaffold a React + TypeScript project and run `npx storybook@latest init`.
2. Delete the generated `src/stories/` examples and create your own `Button.tsx` accepting `label`, `backgroundColor`, `size` (`"small" | "medium" | "large"`), `borderRadius`, and `disabled`.
3. Write `Button.stories.tsx` typed with `Meta<ButtonProps>` and `StoryObj<ButtonProps>`.
4. Add `argTypes` so `backgroundColor` uses a `color` control, `size` a `select` control, `borderRadius` a `number` control (`min: 0`, `max: 50`, `step: 1`), and `disabled` a `boolean` control.
5. Export three stories — `Primary`, `Secondary`, `Disabled` — each with different `args`.
6. Add `parameters: { layout: "centered" }` and a custom `backgrounds` list, then verify everything in the Controls panel.

### 🛠️ Exercise 2: Decorators + Autodocs

1. Create a `withBackgroundColor` decorator in `.storybook/decorators.tsx` that wraps the story in a padded, light-gray box.
2. Register it **globally** in `.storybook/preview.ts` and confirm it wraps *every* story (Button AND a new `Input` component).
3. Add a **variation-level** decorator to just one story (e.g. a colored border around `Primary`) and confirm it does NOT affect the others.
4. Add `tags: ["autodocs"]` to your Button meta, restart Storybook, open the new **Docs** page, and confirm the props table and live snippet are generated automatically.
