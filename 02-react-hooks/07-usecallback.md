# The `useCallback` Hook ⚓

The **`useCallback`** Hook is a performance optimization hook in React. It returns a **memoized** (cached) version of a callback function that only changes if one of its dependencies has changed.

### 💡 Real-World Analogy: The Photocopy Template
Imagine you are a teacher giving a daily assignment template to your students. 
- **Without `useCallback`**: Every single day, you write the assignment template from scratch on the chalkboard. Even if the text is exactly the same, you expend energy and create a brand-new copy of the text every time.
- **With `useCallback`**: You write the template once on a piece of paper and photocopy it (**memoize** it). You only redraw it if you actually need to change the content of the template itself.

---

## ⚡ 1. The Core Problem: Referential Equality

In JavaScript, functions are objects. This means they are compared by **reference (memory address)**, not by value:

```javascript
const functionOne = () => console.log("Hello");
const functionTwo = () => console.log("Hello");

console.log(functionOne === functionTwo); // false! They reside in different locations in memory.
```

In React, every time a component re-renders, **all functions declared inside the component body are re-created from scratch**. 
If you pass one of these functions as a prop to a child component, the child sees a brand-new reference. If that child is optimized with `React.memo` (which prevents re-renders if props don't change), the child will **still re-render** because the function reference changed.

---

## 🧩 2. Syntax and Basic Setup

`useCallback` accepts the function code and a dependency array:

```jsx
import { useCallback } from 'react';

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Only re-create the function reference if 'a' or 'b' changes
```

---

## 🌐 3. Detailed Optimization Example: Parent & Child

Let's see how `useCallback` works together with `React.memo` to optimize rendering:

### Optimized Child Component (`Button.jsx`)
```jsx
import React from 'react';

// Wrap child in React.memo so it only re-renders if props change
const Button = React.memo(({ handleClick, children }) => {
  console.log(`Child Rendered: ${children}`);
  return <button onClick={handleClick}>{children}</button>;
});

Button.displayName = "Button";
export default Button;
```

### Parent Component (`App.jsx`)
```jsx
import { useState, useCallback } from 'react';
import Button from './Button';

const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Memoize increment function
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // Empty dependency array: reference never changes

  // Non-memoized text change handler
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Count: {count}</h2>
      {/* 1. This button will NOT re-render when typing because its prop is memoized */}
      <Button handleClick={increment}>Increment Count</Button>
      
      <div style={{ marginTop: "20px" }}>
        <input value={text} onChange={handleTextChange} placeholder="Type text..." />
        <p>Text: {text}</p>
      </div>
    </div>
  );
};
```

*If we did not wrap `increment` in `useCallback`, typing in the input field would update `text` state, trigger a parent re-render, recreate the `increment` function reference, and cause the `<Button>` component to unnecessarily re-render.*

---

## ⚠️ 4. The Cost of Over-Memoization

> [!CAUTION]
> **Do NOT wrap every function in `useCallback`.** 
> Memoization has an overhead. React must instantiate the dependency array, check dependency differences on every render, and keep the function cache in memory. 

### Only use `useCallback` when:
1. You are passing the function as a prop to a child component optimized with `React.memo`.
2. The function is used as a dependency in other hooks, like `useEffect` or `useMemo`.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of `useCallback`. Click **Reveal Answer** to verify.

### 1. Does `useCallback` prevent a function from executing/running when called?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. `useCallback` does not alter how or when a function runs. It only controls whether the **reference memory address** of the function changes across renders.
</details>

### 2. Why does using `useCallback` without wrapping child components in `React.memo` usually yield zero performance benefits?
<details>
  <summary><b>Reveal Answer</b></summary>

  If a child component is not wrapped in `React.memo`, it will automatically re-render whenever the parent re-renders, regardless of whether its props changed or not. In this case, keeping function references stable is useless because the child re-renders anyway.
</details>

### 3. What happens if you forget to include a state variable used inside a `useCallback` in its dependency array?
<details>
  <summary><b>Reveal Answer</b></summary>

  It creates a **stale closure**. The memoized function will permanently refer to the value of the variable from the render cycle when the function was last created. If the dependency array is empty, it will only know the value from the initial render and will compute updates using outdated data.
</details>

### 4. What is the difference between `useCallback` and `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `useCallback` caches the **function reference itself**. (Returns `fn`).
  - `useMemo` calls the function and caches the **returned result value** of the function. (Returns `fn()`).
  `useCallback(fn, deps)` is syntactically equivalent to `useMemo(() => fn, deps)`.
</details>

### 5. In React 19, is manual optimization via `useCallback` still required?
<details>
  <summary><b>Reveal Answer</b></summary>

  In React 19, the new **React Compiler** (React Forget) is introduced to automatically analyze components and apply memoization to functions and values under the hood. However, understanding `useCallback` remains vital for maintaining legacy codebases, developing libraries, or managing edge cases where the compiler is not enabled.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Optimized List Filter
1. Create a component `FilteredList.jsx` containing a text input for a search query and a count buttons.
2. Render a child list component `<ListItems items={items} onItemClick={handleItemClick} />`.
3. Wrap `ListItems` in `React.memo`.
4. Implement `handleItemClick` using `useCallback` so that incrementing the count state in the parent does not trigger re-renders in `ListItems`. Add `console.log` statements in `ListItems` to confirm when it renders.
