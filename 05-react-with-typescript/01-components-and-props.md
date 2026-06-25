# React Components & Props with TypeScript 🦾

Integrating TypeScript with React provides compile-time protection for your user interface. It ensures that components receive the exact data shapes (props) they require, preventing visual bugs and silent rendering errors.

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

## 🧩 3. Typing the `children` Prop

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

  Standard function parameter typing is simpler, doesn't require importing `React`, handles default parameter destructuring more cleanly, and is much easier to write when the component needs to handle Generic types (e.g., a generic `<List<T> />` component).
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
