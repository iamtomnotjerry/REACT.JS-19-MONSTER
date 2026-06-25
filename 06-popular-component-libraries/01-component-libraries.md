# Modern React Component Libraries: DaisyUI & Shadcn/ui 📦

When building modern React applications, writing every UI component (buttons, modals, dropdowns) from scratch is time-consuming. Component libraries speed up development. Today, the React ecosystem has shifted from heavy runtime component libraries (like Material UI or Chakra UI) toward lightweight, tailwind-integrated solutions: **DaisyUI** and **Shadcn/ui**.

In this lesson, we will compare library paradigms and learn how to implement DaisyUI and Shadcn/ui.

---

## ⚡ 1. Library Paradigms: CSS-only vs Headless vs Component Copying

Understanding these three paradigms is key to choosing the right tool:

| Paradigm | How it Works | Examples | Pros | Cons |
| :--- | :--- | :--- | :--- | :--- |
| **CSS-only Utility** | Pure CSS classes built on Tailwind. No React JS runtime. | DaisyUI | Extremely fast, small bundle size, framework agnostic. | Interactive elements (modals, dropdowns) require manual state toggling in React. |
| **Headless (Unstyled)** | React logic and accessibility are provided, styling is completely left to you. | Radix UI, Headless UI | Perfect accessibility (A11y), complete design freedom. | Must write all CSS/Tailwind classes from scratch. |
| **Component Copying** | A CLI builds components directly in your source folder using Radix primitives + Tailwind. | Shadcn/ui | Direct code ownership, 100% customizable, no npm package dependency. | Requires initial CLI setup and boilerplate code in your project. |

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

---

## ⚡ 3. Working with Shadcn/ui

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

### 2. What is the role of Radix UI inside Shadcn/ui components?
<details>
  <summary><b>Reveal Answer</b></summary>

  Radix UI provides **headless primitives** that handle complex accessibility (A11y) standards, keyboard navigation controls, focus management, and semantic DOM structure. Shadcn/ui packages these accessible primitives and styles them using Tailwind CSS classes.
</details>

### 3. How does DaisyUI keep bundle sizes small compared to runtime JS libraries like Material UI?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI adds pure utility CSS rules to your Tailwind bundle. It does not contain runtime JavaScript engines, inline CSS objects, or rendering frameworks. Tailwind's build process purges unused CSS, leaving only the utilized classes in the final production stylesheet.
</details>

### 4. What is Class Variance Authority (CVA), and why is it useful?
<details>
  <summary><b>Reveal Answer</b></summary>

  CVA is a tool for mapping component props to CSS classes in a structured object-oriented format. It eliminates long, messy conditional ternary operators in your JSX files by letting you declare options like `variants: { color: { primary: "...", secondary: "..." } }` and providing default configurations.
</details>

### 5. When should you prefer DaisyUI over Shadcn/ui?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI is ideal for fast prototyping, simple websites with minimal complex interaction, or projects where you want to style HTML elements (like forms or layouts) immediately using clean, semantic CSS names without dealing with React TSX configurations. Shadcn/ui is preferred for robust, highly interactive enterprise web portals requiring strict accessibility and custom design changes.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Build a Responsive DaisyUI Navbar
1. Configure DaisyUI in a React test project.
2. Build a navbar using the `navbar`, `navbar-start`, `navbar-center`, and `navbar-end` classes from DaisyUI.
3. Add a responsive theme-switching dropdown using DaisyUI's dropdown styling and state hook.

### 🛠️ Exercise 2: Customizing a Shadcn/ui Component
1. Create a button component using the CVA model structure shown in Section 3.
2. Add a custom variant: `"outline-rainbow"` that renders a thin double border with high contrast gradient colors.
3. Test your custom button variant by rendering it inside your test page component.
