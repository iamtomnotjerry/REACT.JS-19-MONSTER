# Custom Hooks in React ⚓

In React, **Custom Hooks** are JavaScript functions that allow you to extract and share component logic (stateful logic, side effects, timers) across multiple components. Custom hooks must always start with the prefix **`use`** (e.g., `useFetch`, `useLocalStorage`, `useToggle`).

### 💡 Real-World Analogy
Imagine you are building different Lego vehicles: a car, a truck, and an airplane. All of them need wheels or landing gears. Instead of redesigning the wheel assembly from scratch for each vehicle, you build a "standard wheel block" (Custom Hook) once, and snap it onto any vehicle that needs it.

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
    let active = true;
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

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
};
```

### How to use `useFetch` in a Component:

```jsx
import { useFetch } from './hooks/useFetch';

const PostList = () => {
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
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
```

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

### 5. Why is using custom hooks superior to writing states directly in page components?
<details>
  <summary><b>Reveal Answer</b></summary>

  It promotes the **DRY (Don't Repeat Yourself)** principle. It separates UI design (JSX) from business logic (side effects/data states), making codebases clean, modular, and extremely easy to unit test.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Build a `useLocalStorage` Hook
1. Create a file `useLocalStorage.js` inside a new `src/hooks/` directory.
2. The hook should accept a `key` and an `initialValue`.
3. Read the value from `localStorage` on mount:
   ```javascript
   const saved = localStorage.getItem(key);
   return saved ? JSON.parse(saved) : initialValue;
   ```
4. Return an array containing the current state value and a setter function that updates both the state and the value in `localStorage`.
5. Test it by persisting a text input field value across page refreshes.

### 🛠️ Exercise 2: Build a `useOnlineStatus` Hook
1. Create a hook `useOnlineStatus.js`.
2. It should return a boolean (`true` if online, `false` if offline).
3. Listen to the window `online` and `offline` events in a `useEffect` hook and clean them up properly.
4. Render a banner or indicator in your main page showing the network status of the browser.
