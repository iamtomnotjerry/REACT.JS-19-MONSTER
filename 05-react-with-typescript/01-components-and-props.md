# React Components & Props with TypeScript 🦾

Integrating TypeScript with React provides compile-time protection for your user interface. It ensures that components receive the exact data shapes (props) they require, preventing visual bugs and silent rendering errors.

---

## 📚 Concept & Overview

When you write plain JavaScript React, a component happily accepts **any** prop you throw at it. Pass a `number` where a `string` was expected, misspell `onClick` as `onclik`, forget a required field — JavaScript stays silent until the bug explodes in the browser. TypeScript closes that gap. By annotating your props, you tell the compiler the **contract** each component agrees to, and any violation is caught the instant you type it, long before a user ever sees the screen.

> [!NOTE]
> Think of a TypeScript prop type as the **nutrition label** on a packaged food. The label promises exactly what is inside the box — 3 grams of `name: string`, 1 serving of `age: number`, a pinch of optional `avatarUrl?`. A consumer (the parent component) can read the label and know precisely what to put in and what they will get out, with zero guessing. Plain JavaScript components are an unlabeled mystery box.

> [!TIP]
> When you scaffold a new project with `npm create vite@latest`, choose the **React + TypeScript** template. Your component files then use the `.tsx` extension (TypeScript + JSX) instead of `.jsx`. The `x` is what unlocks JSX syntax inside a TypeScript file.

```bash
# Scaffold a brand-new React + TypeScript project with Vite
npm create vite@latest ts-demo -- --template react-ts

# Move into the project and install dependencies
cd ts-demo
npm install

# Start the dev server
npm run dev
```

---

## ⚡ 1. Typing Component Props

To type props in React, you define a TypeScript interface or type alias representing the shape of the incoming data:

```tsx
interface ButtonProps {
  label: string; // Required string
  importance?: "primary" | "secondary"; // Optional union string
  onClick: () => void; // Required event handler callback
}
```

If you forget to annotate your props, TypeScript raises the classic error: **"Parameter 'props' implicitly has an 'any' type."** That message is TypeScript telling you it cannot protect a value it knows nothing about — annotating the props is how you opt back into safety.

```tsx
// ❌ Implicit "any" — TypeScript cannot help you here
export const User = (props) => {
  return <h2>{props.name}</h2>;
};

// ✅ Explicit shape — every property is now checked at compile time
interface UserShape {
  name: string;
  age: number;
  isStudent: boolean;
}

export const User = (props: UserShape) => {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.age}</p>
      <p>{props.isStudent ? "Student" : "Not a student"}</p>
    </div>
  );
};
```

---

## 🧩 2. Two Ways to Declare Components

In React with TypeScript, you can declare component function signatures in two standard ways:

### Method A: Standard Function Parameters (Recommended)
This approach types props directly in the parameter list. It is simple, highly readable, and handles generic components easily:

```tsx
interface CardProps {
  title: string;
  description: string;
  isFeatured?: boolean;
}

export const Card = ({ title, description, isFeatured = false }: CardProps) => {
  return (
    <div style={{ border: isFeatured ? "2px solid gold" : "1px solid #ccc", padding: "15px" }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
```

### Method B: Using `React.FC` (Functional Component)
`React.FC` (or `React.FunctionComponent`) is a generic type provided by React. It automatically handles properties like `displayName` and typing return values:

```tsx
import React from 'react';

interface TitleProps {
  text: string;
}

export const Title: React.FC<TitleProps> = ({ text }) => {
  return <h1>{text}</h1>;
};
```

> [!TIP]
> In React 18 and 19, `React.FC` does **not** implicitly include `children` anymore. You must explicitly define `children` in your props interface if you want to support nested layouts.

---

## ⚖️ 3. `React.FC` vs Plain Function Component — Trade-offs

Both styles compile and run identically at runtime. The difference is entirely about the **developer experience** at compile time. Here is a side-by-side comparison so you can choose deliberately:

| Aspect | `React.FC<Props>` (Method B) | Plain Function `(props: Props)` (Method A) |
| --- | --- | --- |
| **Requires importing React** | Yes — `import React from 'react'` to reference `React.FC` | No import needed (with the modern JSX transform) |
| **Return type** | Implicitly typed for you (`ReactElement \| null`) | Inferred from your `return` statement |
| **Implicit `children`** | None in React 18/19 (was auto-included pre-18) | Never auto-included — always explicit |
| **Default prop values** | Works, but reads awkwardly with destructuring | Clean: `({ isFeatured = false }: CardProps)` |
| **Generic components** | Painful — `React.FC` does not accept type parameters cleanly | Natural: `function List<T>(props: ListProps<T>)` |
| **`displayName` / `defaultProps`** | Attached automatically on the type | You attach them manually if needed |
| **Readability** | Verbose, extra wrapper type to parse | Minimal, the props type sits right at the call site |
| **Community direction (2024+)** | Falling out of favor | Recommended default |

> [!WARNING]
> Avoid reaching for `React.FC` purely because you saw it in older tutorials or documentation. Since `React.FC` cannot accept generic type parameters cleanly, the moment you try to build a reusable generic component (for example a typed `<List<T> />`), you will hit friction and likely have to rewrite it as a plain function. Starting with the plain-function style avoids that future migration entirely.

**Rule of thumb:** reach for **Method A (plain function parameters)** by default. Only use `React.FC` when working in a codebase that has already standardized on it for consistency.

---

## 🧩 4. Typing the `children` Prop

If your component acts as a layout container wrapping other elements, you must type the `children` prop using **`React.ReactNode`**:

```tsx
import React from 'react';

interface ContainerProps {
  title: string;
  children: React.ReactNode; // Represents any renderable React node (JSX, string, number, array)
}

export const Container = ({ title, children }: ContainerProps) => {
  return (
    <div style={{ padding: "20px", border: "1px solid blue", borderRadius: "8px" }}>
      <h2>{title}</h2>
      <div style={{ marginTop: "15px" }}>
        {children}
      </div>
    </div>
  );
};
```

`React.ReactNode` is intentionally broad. If you `Ctrl/Cmd + click` it in your editor, your IDE jumps to React's `index.d.ts` types file, where you can see it is a union of a `ReactElement`, a `string`, a `number`, a portal, a `boolean`, `null`, `undefined`, and arrays of all those. That breadth is exactly why it is the correct type for `children` — children can be literally anything renderable.

---

## ♻️ 5. Extending & Reusing Prop Types

A common real-world need is one shape that builds on another — for example, an **admin** has every field a regular **user** has, plus a few extras. TypeScript lets you compose these with the intersection operator (`&`) instead of copy-pasting fields. To use a shared type across files, simply `export` it.

```typescript
// types.ts — a single source of truth for your data shapes

// Base information shared by every user
export type Info = {
  id: number;
  name: string;
  email: string;
};

// AdminInfo = everything in Info, PLUS admin-only fields
export type AdminInfo = Info & {
  role: string;
  lastLogin: Date;
};
```

```tsx
// AdminCard.tsx — import the shared types and reuse them
import type { AdminInfo } from "./types"; // "import type" tells the compiler these are types only

interface AdminCardProps {
  admin: AdminInfo;
}

export const AdminCard = ({ admin }: AdminCardProps) => {
  return (
    <div>
      <h2>Admin Information</h2>
      <p>{admin.name}</p>
      <p>{admin.email}</p>
      <p>{admin.role}</p>
      <p>Last login: {admin.lastLogin.toLocaleString()}</p>
    </div>
  );
};
```

Using `import type { ... }` (instead of a plain `import`) explicitly signals to the compiler that you are importing **types, not runtime values**. The import is fully erased from the compiled JavaScript bundle.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of React and TypeScript. Click **Reveal Answer** to verify.

### 1. Why was implicit `children` removed from `React.FC` in React 18?
<details>
  <summary><b>Reveal Answer</b></summary>

  Implicit `children` was removed because it was too permissive. It allowed developers to write nested components (e.g. `<MyButton>Click Me</MyButton>`) even if the component was never designed to render or handle child content, leading to silent bugs. Removing it forces developers to explicitly declare `children: React.ReactNode` in their props interface.
</details>

### 2. What is the difference between `React.ReactNode` and `React.ReactElement`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`React.ReactNode`** is very broad. It represents anything that React can render: JSX elements, strings, numbers, fragments, arrays of nodes, booleans, or `null`.
  - **`React.ReactElement`** is narrow. It represents a single JSX object returned directly by `React.createElement()` (it does not include strings, numbers, or arrays).
</details>

### 3. How do you specify default values for optional props in TypeScript?
<details>
  <summary><b>Reveal Answer</b></summary>

  The modern best practice is to assign default values directly during ES6 object destructuring in the component parameter list, e.g., `({ isFeatured = false }: CardProps)`. TypeScript automatically infers the optional type and handles rendering defaults.
</details>

### 4. How do you restrict a prop to only accept specific string values?
<details>
  <summary><b>Reveal Answer</b></summary>

  You use a **Union Type** in your props interface, for example:
  ```typescript
  interface AlertProps {
    type: "success" | "warning" | "danger";
  }
  ```
  This restricts the prop so that trying to pass `<Alert type="info" />` will trigger a compile-time error.
</details>

### 5. Why is standard function typing generally preferred over `React.FC` in modern React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Standard function parameter typing is simpler, doesn't require importing `React`, handles default parameter destructuring more cleanly, and is much easier to write when the component needs to handle Generic types (e.g., a generic `<List<T> />` component). `React.FC` also no longer auto-includes `children` in React 18/19, removing one of its few historical advantages.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Accessible User Card Component
1. Create a component `UserCard.tsx` inside `src/components/` (ensure the file extension is `.tsx` to support TSX syntax).
2. Define a props interface `UserCardProps` containing:
   - `name`: string.
   - `email`: string.
   - `role`: optional union string containing `"admin" | "editor" | "user"`. Defaults to `"user"`.
   - `avatarUrl`: optional string.
3. Render a card showcasing the user's name, email, role badge, and profile picture (if `avatarUrl` is provided).
4. Render multiple `<UserCard />` elements inside your `App.tsx` page to verify compile checks work when optional parameters are omitted.
5. **Stretch:** intentionally pass `<UserCard role="superuser" />` and observe the compile-time union error. Then remove the required `email` prop from one instance and read the error TypeScript gives you.

### 🛠️ Exercise 2: A Reusable Button with Three Props
This challenge mirrors the course's "first TypeScript challenge." Build a typed, reusable button.

1. Create `Button.tsx` in `src/components/`.
2. Define a `ButtonProps` shape with **three** props:
   - `label`: string — the text shown on the button.
   - `onClick`: a function with the signature `() => void` (it returns nothing).
   - `disabled`: boolean — toggles whether the button is enabled.
3. Destructure all three props in the parameter list and render a native `<button>` that wires `label`, `onClick`, and `disabled` to the real element.
4. Import `<Button />` into `App.tsx`, pass an `onClick` that does `console.log("clicked")`, run `npm run dev`, and confirm there are **zero** TypeScript errors.
5. **Stretch — extend with intersection types:** move `ButtonProps` into a shared `types.ts`, `export` it, then create an `IconButton` whose props are `ButtonProps & { iconName: string }`. Reuse the base shape rather than re-declaring `label`, `onClick`, and `disabled`.
