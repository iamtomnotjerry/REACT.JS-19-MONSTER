# Custom Hooks in React ⚓

In React, **Custom Hooks** are JavaScript functions that allow you to extract and share component logic (stateful logic, side effects, timers) across multiple components. Custom hooks must always start with the prefix **`use`** (e.g., `useFetch`, `useLocalStorage`, `useToggle`).

---

## 🌟 Concept & Overview

A custom hook does **not** introduce a new React feature — it is simply a function that *composes* the built-in hooks (`useState`, `useEffect`, `useRef`, `useId`, etc.) into a single reusable unit. When you find yourself copy-pasting the same `useState` + `useEffect` data-fetching block into three different components, that is the signal to extract it into a custom hook.

> [!NOTE]
> **The Rules of Hooks always apply.** A custom hook is a regular function, but because it *calls* other hooks, it must obey the same two rules as any component: (1) only call hooks at the **top level**, and (2) only call hooks from **React functions** (components or other custom hooks). The `use` prefix is what tells React's linter to enforce these rules inside your function.

> [!WARNING]
> **Never call hooks conditionally.** Do not place a hook call inside an `if` block, a loop, or a nested callback. React relies on hooks being called in the **same order on every render** to match each state value to its slot. Wrapping `useState` or `useEffect` in a condition breaks that ordering and will throw `Rendered fewer hooks than expected` or silently corrupt your state.

```jsx
// ❌ WRONG — hook called conditionally
function Bad({ enabled }) {
  if (enabled) {
    const [value, setValue] = useState(0); // breaks hook order!
  }
}

// ✅ CORRECT — hook always called, condition lives inside
function Good({ enabled }) {
  const [value, setValue] = useState(0);
  if (!enabled) return null; // early return AFTER hooks is fine
}
```

> [!TIP]
> A custom hook shares **logic**, not **state**. Each component that calls `useFetch(url)` gets its own private `data`, `loading`, and `error` — there is no shared global value. If you need shared state across components, reach for Context or a store (Zustand/Redux), not a custom hook.

---

### 💡 Real-World Analogy
Imagine you are building different Lego vehicles: a car, a truck, and an airplane. All of them need wheels or landing gears. Instead of redesigning the wheel assembly from scratch for each vehicle, you build a "standard wheel block" (Custom Hook) once, and snap it onto any vehicle that needs it. Each vehicle still gets **its own physical set of wheels** (its own isolated state) — they just share the same **blueprint** (the logic).

---

## 🔍 Custom Hook vs. Helper Function vs. Component

It is easy to confuse these three building blocks. Here is how they differ:

| Feature | Custom Hook (`useX`) | Helper / Utility Function | Component |
| --- | --- | --- | --- |
| Naming convention | Must start with `use` | Any name (e.g. `formatDate`) | PascalCase (e.g. `PostList`) |
| Can call other hooks? | ✅ Yes | ❌ No | ✅ Yes |
| Can hold React state? | ✅ Yes (`useState`) | ❌ No | ✅ Yes |
| Returns | Any value (object, array, primitive) | Any value | JSX / React elements |
| Re-runs on render? | ✅ Yes (with the component) | Only when explicitly called | ✅ Yes |
| Purpose | Reuse **stateful logic** | Reuse **pure computation** | Reuse **UI** |

---

## ⚡ 1. The Rules of Hooks (Review)

Before building custom hooks, you must strictly follow these rules:
1. **Only Call Hooks at the Top Level**: Do not call hooks inside loops, conditions (`if` blocks), or nested functions.
2. **Only Call Hooks from React Functions**: Call hooks from React functional components or from other custom hooks.
3. **Prefix with `use`**: This naming convention is mandatory. It allows React's linter to recognize that the function contains hook calls (like `useState` or `useEffect`) and apply hook rules.

---

## 🧩 2. Example 1: `useFetch` (Network Request Logic)

Instead of rewriting `useState` and `useEffect` for data fetching in every component, we can consolidate it into a reusable `useFetch` hook:

```javascript
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true; // guards against setting state after unmount
    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((jsonData) => {
        if (active) {
          setData(jsonData);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    // Cleanup: flip the flag so a late response is ignored
    return () => {
      active = false;
    };
  }, [url]); // re-fetch whenever the URL changes

  return { data, loading, error };
};
```

### How to use `useFetch` in a Component:

```jsx
import { useFetch } from './hooks/useFetch';

const PostList = () => {
  // Destructure and rename `data` to `posts` for readability
  const { data: posts, loading, error } = useFetch("https://jsonplaceholder.typicode.com/posts?_limit=5");

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}><strong>{post.title}</strong></li>
      ))}
    </ul>
  );
};
```

> [!TIP]
> Notice the **early returns** for `loading` and `error` come *after* the `useFetch` call. This is the correct pattern — call your hook unconditionally at the top, then branch on its result.

---

## 🧩 3. Example 2: `useWindowSize` (Responsive Screen Dimensions)

This custom hook tracks window width and height dynamically, and cleans up event listeners automatically:

```javascript
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener to prevent memory leaks
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // empty array: attach the listener once on mount

  return windowSize;
};
```

---

## 🔄 4. The Lifecycle of a Custom Hook (Diagram)

When two components call the same hook, each gets an **independent instance** of the logic:

```text
        ┌─────────────────────────┐        ┌─────────────────────────┐
        │   <PostList />          │        │   <Comments />          │
        │   useFetch("/posts")    │        │   useFetch("/comments") │
        └───────────┬─────────────┘        └───────────┬─────────────┘
                    │                                  │
                    ▼                                  ▼
        ┌─────────────────────────┐        ┌─────────────────────────┐
        │ OWN data / loading /    │        │ OWN data / loading /    │
        │ error  (isolated!)      │        │ error  (isolated!)      │
        └─────────────────────────┘        └─────────────────────────┘
                    └──────── shared LOGIC, separate STATE ──────────┘
```

The blueprint (the function body) is shared. The wheels (the `useState` values) are minted fresh for each caller.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Custom Hooks. Click **Reveal Answer** to verify.

### 1. Does calling a custom hook in two different components share the state between them?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Custom hooks share **stateful logic**, not the state itself. Every time you call a custom hook, all state variables and effects inside it are created fresh and isolated for that specific component instance.
</details>

### 2. Why must custom hooks start with the word "use"?
<details>
  <summary><b>Reveal Answer</b></summary>

  This prefix is required by React's compiler and linter tools (ESLint plugin for React Hooks). It signals to the system that this function may call standard React hooks (`useState`, `useEffect`, etc.), allowing the linter to verify that the Rules of Hooks are followed.
</details>

### 3. Can a custom hook return something other than an array or an object?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. A custom hook is just a regular JavaScript function. It can return anything: a single value (string, number, boolean), an array, an object, or even nothing at all. Return objects are popular for custom hooks with multiple values (like `useFetch`), while arrays are popular for hook-like APIs (like `useState`).
</details>

### 4. Can we call a React hook inside a standard utility helper function?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. You can only call React hooks inside React functional components or other custom hooks (which also begin with `use`). Calling them in standard helper functions will result in a compilation/runtime error.
</details>

### 5. Why is it illegal to call a hook inside an `if` block, and what is the correct alternative?
<details>
  <summary><b>Reveal Answer</b></summary>

  React matches each hook call to its internal state "slot" by the **order** in which hooks are called on every render. If a hook is wrapped in a condition, that order changes between renders, so React can no longer line up the right state with the right hook (you'll see `Rendered fewer hooks than expected`). The correct alternative is to always call the hook unconditionally at the **top level** of the function, and put the conditional logic *inside* the hook or use an early `return` only **after** all hooks have run.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Build a `useLocalStorage` Hook
1. Create a file `useLocalStorage.js` inside a new `src/hooks/` directory.
2. The hook should accept a `key` and an `initialValue`.
3. Read the value from `localStorage` on initialization using the **lazy initializer** form of `useState` so it only runs once:
   ```javascript
   const [value, setValue] = useState(() => {
     const saved = localStorage.getItem(key);
     return saved ? JSON.parse(saved) : initialValue;
   });
   ```
4. Use a `useEffect` that depends on `[key, value]` to write the serialized value back to `localStorage` whenever it changes:
   ```javascript
   useEffect(() => {
     localStorage.setItem(key, JSON.stringify(value));
   }, [key, value]);
   ```
5. Return an array `[value, setValue]` (mirroring the `useState` API).
6. Test it by persisting a text input field value across page refreshes.

> [!WARNING]
> Make sure you call `useState` and `useEffect` at the top level of the hook — never inside the `if (saved)` check. Move the conditional logic *inside* the initializer instead.

### 🛠️ Exercise 2: Build a `useOnlineStatus` Hook
1. Create a hook `useOnlineStatus.js`.
2. Initialize state from `navigator.onLine` so the first render is accurate.
3. It should return a boolean (`true` if online, `false` if offline).
4. Listen to the window `online` and `offline` events in a `useEffect` hook and **clean them up** in the returned cleanup function.
5. Render a banner or indicator in your main page showing the network status of the browser.

### 🛠️ Exercise 3 (Stretch): Refactor a component to use `useFetch`
1. Find (or build) a component that fetches data directly with inline `useState` + `useEffect`.
2. Extract that logic into the `useFetch` hook shown above.
3. Replace the inline logic with a single `const { data, loading, error } = useFetch(url);` call.
4. Confirm the component still renders identically — you have now made the logic reusable across your whole app.
