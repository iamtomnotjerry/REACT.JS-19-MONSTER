# The `useRef` Hook ⚓

The **`useRef`** Hook is a powerful tool in React that serves two primary purposes:
1. **Accessing and manipulating DOM elements** directly (similar to using `document.getElementById` in vanilla JavaScript).
2. **Persisting mutable values across renders** without triggering a re-render of the component when the value changes.

---

## 📖 Concept & Overview

`useRef` returns a plain mutable JavaScript object of the shape `{ current: <value> }`. React guarantees that it hands you the **same object** on every render, so it acts as a stable "box" that survives re-renders. You read and write the value through the `.current` property.

There are two golden rules that separate `useRef` from `useState`:

> [!NOTE]
> Mutating `ref.current` does **NOT** trigger a re-render. React deliberately ignores changes to the `.current` property. Use `useRef` for values that should persist but should *not* drive what the user sees (interval IDs, previous values, DOM nodes, flags).

> [!WARNING]
> Do **NOT** read or write a ref during rendering. Reading `ref.current` while React is computing the JSX (outside of event handlers or effects) makes your component impure and can produce inconsistent results across renders and in Strict Mode. Only touch `.current` inside event handlers, effects, or callbacks.

> [!TIP]
> If a value needs to be **shown on screen** and update visually, it belongs in `useState`. If it is "behind-the-scenes" bookkeeping that the UI does not directly display, reach for `useRef`.

### 💡 Real-World Analogy
Imagine you are writing notes in a physical book.
- **`useState`** is like rewriting a page of the book every time you make a change (the screen re-draws/re-renders).
- **`useRef`** is like a post-it note stuck to the side of the page. You can write on it, erase it, and update it as much as you want without having to rip out and rewrite the page itself (data persists, but no re-render is triggered).

---

## ⚡ 1. Direct Comparison: State vs. Ref vs. Local Variables

Understanding how variables behave across renders is crucial:

| Feature | `useState` | `useRef` | Plain Local Variable (`let x`) |
| :--- | :--- | :--- | :--- |
| **Causes Re-render on Update?** | **Yes** | **No** | **No** |
| **Persists Across Renders?** | **Yes** | **Yes** | **No** (resets to default on render) |
| **Read during render?** | Safe | **Avoid** (impure) | Safe |
| **Syntax** | `const [val, setVal] = useState(0)` | `const myRef = useRef(0)` (access via `myRef.current`) | `let val = 0` |

### 🔄 Mental Model: The Render Cycle

```text
                ┌─────────────────────────────┐
   setState ──▶ │   Component re-renders      │
                │   (function runs again)     │
                └──────────────┬──────────────┘
                               │
            local `let x`  ───▶ RESET to initial value
            useRef.current ───▶ PRESERVED (same box)
            useState value ───▶ PRESERVED + drives the UI
```

---

## 🧩 2. Use Case 1: Accessing DOM Elements

This is the most common use case. By passing the ref object to a JSX element's `ref` attribute, React populates `.current` with the corresponding DOM node after the element mounts.

```jsx
import { useRef, useEffect } from 'react';

const AutoFocusInput = () => {
  const inputRef = useRef(null); // Initialize with null: no DOM node yet

  const handleClick = () => {
    // Focus the input field directly using the browser DOM API.
    // We only touch .current inside an event handler — never during render.
    inputRef.current.focus();
    inputRef.current.style.border = "2px solid red";
  };

  useEffect(() => {
    // Auto-focus the input field on mount (effect runs after render)
    inputRef.current.focus();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <input ref={inputRef} type="text" placeholder="Type here..." />
      <button onClick={handleClick}>Focus & Highlight Input</button>
    </div>
  );
};
```

> [!WARNING]
> A DOM ref is `null` during the very first render (before the element is attached). Always guard with optional chaining (`inputRef.current?.focus()`) or run DOM access inside a `useEffect`, which only fires *after* the DOM exists.

---

## 🧩 3. Use Case 2: Persisting Values Without Re-renders

Use this when you need to track a value (like an active interval ID, click counts, or measuring duration) but do not want changes to trigger a visual layout refresh.

```jsx
import { useState, useRef } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const timerId = useRef(null); // Ref stores the interval ID across renders

  const startTimer = () => {
    if (timerId.current !== null) return; // Prevent multiple intervals

    // Storing the ID in a ref means restarting/re-rendering won't lose it
    timerId.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerId.current);
    timerId.current = null; // Reset the ref value (no re-render happens here)
  };

  return (
    <div>
      <h2>Timer: {seconds}s</h2>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
};
```

> [!NOTE]
> Notice that `seconds` lives in `useState` because it is displayed on screen, while `timerId` lives in `useRef` because it is internal plumbing the user never sees. This split is the essence of choosing between the two hooks.

---

## 🧪 4. Bonus: Tracking the Previous Value

A classic `useRef` pattern is remembering what a value was on the *previous* render. Because effects run after rendering, the ref still holds the old value during the current render.

```jsx
import { useState, useEffect, useRef } from 'react';

const PreviousValue = () => {
  const [count, setCount] = useState(0);
  const prevCount = useRef(null);

  useEffect(() => {
    // Runs AFTER render — so during render, prevCount.current is still the old value
    prevCount.current = count;
  }, [count]);

  return (
    <div>
      <p>Now: {count} | Before: {prevCount.current ?? "—"}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of `useRef`. Click **Reveal Answer** to verify.

### 1. Does changing the value of `ref.current` trigger a component re-render?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Modifying the `.current` property of a ref is a direct mutation of a JavaScript object. React does not track modifications to this object for rendering, so changing it will never trigger a re-render.
</details>

### 2. Why can't we use a plain local variable (like `let counter = 0`) instead of `useRef` to store values we don't want to re-render?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because plain local variables are re-declared and reset to their default initial values every single time the component function executes (renders). `useRef` creates a persistent box that React preserves across the component's entire lifecycle.
</details>

### 3. What is the default initial value of `ref.current` if we call `useRef()` without passing arguments?
<details>
  <summary><b>Reveal Answer</b></summary>

  If no argument is passed to `useRef()`, the `.current` property defaults to `undefined`. It is common practice to initialize DOM refs with `null` (e.g. `useRef(null)`) to signify that they do not point to a DOM element yet.
</details>

### 4. How can you use `useRef` to track the previous value of a state variable?
<details>
  <summary><b>Reveal Answer</b></summary>

  You can use a `useEffect` hook that runs after every render to assign the current state value to a ref:
  ```javascript
  useEffect(() => {
    prevValueRef.current = stateValue;
  }, [stateValue]);
  ```
  Since `useEffect` runs *after* the render phase completes, the ref will hold the previous render's value during the current render phase.
</details>

### 5. Why should you avoid using `useRef` to read values that you display directly in your JSX template?
<details>
  <summary><b>Reveal Answer</b></summary>

  If you display a ref's value directly in JSX (e.g., `<h1>{myRef.current}</h1>`), updates to that value will not show up on screen because changing `current` does not trigger a re-render. If a value needs to be visually updated in the UI, it must be stored in state (`useState`) instead. Additionally, reading or writing a ref during the render phase makes the component impure and is discouraged by React.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Input Word Character Counter
1. Create a component `InputCounter.jsx`.
2. Render an `<input>` field and a button called "Show Length".
3. Use `useRef` to target the `<input>` element (`const inputRef = useRef(null)`).
4. When the user clicks the button, read the value directly from the input ref (`inputRef.current.value`) and display the string length in an alert box.
5. **Observe:** Notice that typing in the input does *not* cause any component re-render — there is no state involved, so the component function never runs again as you type.
6. **Stretch goal:** Add a second button "Clear" that sets `inputRef.current.value = ""` and re-focuses the input, all without any `useState`.

### 🛠️ Exercise 2: Component Render Counter
1. Create a component `RenderCounter.jsx` containing a state variable `text`.
2. Render an input field tied to this `text` state (so typing causes a re-render).
3. Use a ref `const renderCount = useRef(0)` to track how many times the component has re-rendered.
4. Increment the ref inside a `useEffect` that has **no dependency array** (so it runs after every render).
5. Display the text and the render count on the screen. Verify the count increases with every keypress.
6. **Reflect:** Why must the render counter live in a ref and not in state? (Hint: incrementing state inside a dependency-free effect would trigger another render, causing an infinite loop.)

### 🛠️ Exercise 3 (Challenge): Timer with Refs
1. Create a `Timer.jsx` component with a `count` state initialized to `0`.
2. Create an `intervalRef = useRef(null)` to hold the interval ID.
3. In a `useEffect` with an empty dependency array, start a `setInterval` that increments `count` every second, storing the ID in `intervalRef.current`.
4. Return a cleanup function from the effect that calls `clearInterval(intervalRef.current)`.
5. Add a "Stop Timer" button that calls `clearInterval(intervalRef.current)` to pause the counter.
6. **Observe:** The interval ID is preserved across renders via the ref, even though the timer keeps re-rendering the displayed count every second.
