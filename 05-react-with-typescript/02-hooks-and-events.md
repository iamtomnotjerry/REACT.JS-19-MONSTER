# React Hooks & Event Handling with TypeScript 🦾

Typing state hooks, DOM references, and browser events is essential for building fully typed, secure React applications. TypeScript ensures that event variables expose proper autocomplete tags for values and elements.

---

## ⚡ 1. Typing `useState`

TypeScript usually infers the type of state variables based on their initial value:

```tsx
const [count, setCount] = useState(0); // Inferred as: number
const [text, setText] = useState("");   // Inferred as: string
```

However, if your state is initialized to `null` or `undefined`, or can support multiple type shapes, you must define it using **Generics**:

```tsx
interface User {
  id: number;
  username: string;
}

// State can be either User object OR null
const [user, setUser] = useState<User | null>(null);

const loginUser = () => {
  setUser({ id: 99, username: "admin" }); // Safe!
};
```

---

## ⚡ 2. Typing `useRef`

`useRef` behaves differently depending on whether it is used for DOM elements or mutable values.

### A. DOM Reference (Read-only `.current`)
To target a DOM element, pass the HTML element interface name as a generic parameter, and initialize the ref with `null`:

```tsx
import { useRef, useEffect } from 'react';

export const TextInput = () => {
  // 1. Declare target input element type
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 2. Access DOM safely (use optional chaining)
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
};
```

*Common HTML element types include: `HTMLInputElement`, `HTMLButtonElement`, `HTMLDivElement`, `HTMLFormElement`.*

### B. Mutable Values (Writable `.current`)
If you are storing a value that persists without triggering re-renders, provide the type and do NOT pass null:

```tsx
const renderCount = useRef<number>(0);
renderCount.current += 1; // Can write directly
```

---

## ⚡ 3. Typing Events

Writing inline event handlers in JSX doesn't require manual types because React automatically infers them. However, when extracting event handlers into separate functions, you must annotate the event parameter manually:

```tsx
import React, { useState } from 'react';

export const UserForm = () => {
  const [email, setEmail] = useState("");

  // 1. Type input change events
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 2. Type click events
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked coordinates:", e.clientX, e.clientY);
  };

  // 3. Type form submit events
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting:", email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={handleEmailChange} />
      <button type="button" onClick={handleButtonClick}>Log Coordinates</button>
      <button type="submit">Submit Form</button>
    </form>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of hooks and events. Click **Reveal Answer** to verify.

### 1. When do you need to pass generic type arguments to `useState`?
<details>
  <summary><b>Reveal Answer</b></summary>

  You need to pass generic type arguments (e.g. `useState<Type>()`) when the type cannot be correctly inferred from the initial value. This occurs when:
  1. The initial value is `null` or `undefined` (e.g., fetching data later).
  2. The state holds a union of multiple possible types (e.g., `useState<"light" | "dark">("light")`).
  3. The state manages complex objects or arrays of items.
</details>

### 2. Why must you initialize a DOM ref with `null` (e.g., `useRef<HTMLInputElement>(null)`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  In React, passing `null` tells the compiler that the ref is intended to bind to a DOM element. It returns a read-only `RefObject` whose `.current` is managed directly by React. If you omit `null`, it returns a mutable `MutableRefObject`, which is intended for storing general variables and won't bind to DOM properties correctly.
</details>

### 3. What is the difference between `React.ChangeEvent` and `React.FormEvent`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`React.ChangeEvent`** is triggered when the value of input-like elements (`<input>`, `<textarea>`, `<select>`) changes. It allows you to access `e.target.value`.
  - **`React.FormEvent`** is triggered on form-level actions, such as submitting a `<form>`, allowing you to run `e.preventDefault()` to stop page reloads.
</details>

### 4. How do you find the correct name for a React event type if you forget it?
<details>
  <summary><b>Reveal Answer</b></summary>

  You can write the event handler inline in your JSX (e.g., `<button onClick={(e) => {}} />`), hover your mouse cursor over the `e` parameter in VS Code, and copy the type name displayed in the hover tooltip.
</details>

### 5. Why do we write `e.target.value` instead of `e.currentTarget.value` in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `e.target` refers to the element that **triggered** the event (which could be a nested child span inside a button).
  - `e.currentTarget` refers to the element that the **event listener is bound to** (the button itself). 
  For simple text input fields, they are identical, but `e.currentTarget` is mathematically safer in nested layout events.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Canvas Coordinates Tracer & Form
1. Create a component `CoordinatesForm.tsx` (ensure it uses `.tsx` extension).
2. Set up a state tracking coordinates: `const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)`.
3. Render a container `<div>` acting as a trace area. Track mouse movement over the container using:
   ```typescript
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   ```
4. Render the coordinates on screen. Include an input field to enter a label, capturing inputs via a typed `onChange` function.
5. Verify that VS Code provides complete autocomplete properties on your event variables.
