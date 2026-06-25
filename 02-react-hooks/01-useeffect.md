# The `useEffect` Hook ⚓

The **`useEffect`** Hook is a fundamental tool in React that allows you to perform **side effects** in functional components. A side effect is anything that reaches outside the scope of the React rendering cycle to interact with the external world.

### 💡 Real-World Analogy
Think of rendering a React component as preparing a dish in a restaurant kitchen. The dish itself (HTML UI) is the main product. A **side effect** is like telling the waiter to ring a bell or notify the customer (sending an email, logging data, updating browser titles) once the dish is placed on the counter.

---

## ⚡ 1. Why Do We Need `useEffect`?

In React, the render phase must be pure: given the same props and state, it should return the exact same JSX without modifying variables or calling external APIs. Side effects must happen outside this render loop. Common side effects include:
* Fetching data from a backend server API.
* Manually changing the document title (`document.title`).
* Setting up timers (`setTimeout`, `setInterval`).
* Adding event listeners directly to the global window or document object.
* Subscribing to external data sources or chat systems.

---

## 🧩 2. Syntax and Structure

The `useEffect` Hook accepts a callback function and an optional dependency array:

```jsx
import { useEffect } from 'react';

useEffect(() => {
  // 1. Side effect logic goes here
  
  return () => {
    // 2. Optional cleanup function goes here
  };
}, [dependencies]); // 3. Optional dependency array
```

### The Three Dependency Configurations

How the dependency array is configured determines when the effect executes:

| Configuration | Syntax | When It Runs | Use Case |
| :--- | :--- | :--- | :--- |
| **No Array** | `useEffect(() => {})` | Runs after **every single render** and re-render of the component. | Debugging logs (rarely used in production). |
| **Empty Array** | `useEffect(() => {}, [])` | Runs **only once** when the component first mounts (renders for the first time). | Fetching initial data, setting up global event listeners. |
| **With Dependencies** | `useEffect(() => {}, [count])` | Runs on mount, and then re-runs **only when** values in the array change. | Auto-saving input, updating UI based on state changes. |

---

## 🧹 3. The Critical Cleanup Function

When you set up resources that persist (like event listeners, timers, or web socket subscriptions), you must clean them up when the component unmounts or before the effect runs again to prevent **memory leaks**.

You do this by returning a **cleanup function** from your `useEffect` callback:

```jsx
import { useState, useEffect } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Set up timer
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Return cleanup function to clear interval
    return () => {
      clearInterval(intervalId);
      console.log("Timer cleaned up!");
    };
  }, []); // Run once on mount

  return <h1>Active time: {seconds}s</h1>;
};
```

> [!WARNING]
> If you forget to clear the interval, it will continue running in the background even if the component is removed from the screen, consuming browser memory and CPU.

---

## 🌐 4. Data Fetching and Preventing Race Conditions

A common use case is fetching data. However, if state changes quickly, responses may return in a different order than requested (known as a **race condition**). We use a local boolean flag `active` to ignore outdated responses:

```jsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true; // Flag to trace if the component is still active
    setLoading(true);

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setUser(data);
          setLoading(false);
        }
      });

    // Cleanup: set active to false when userId changes or component unmounts
    return () => {
      active = false;
    };
  }, [userId]); // Re-fetch whenever userId changes

  if (loading) return <p>Loading user data...</p>;
  return (
    <div>
      <h3>Name: {user.name}</h3>
      <p>Email: {user.email}</p>
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of `useEffect`. Click **Reveal Answer** to verify.

### 1. What is a "side effect" in React, and why can't we write it directly inside the component body?
<details>
  <summary><b>Reveal Answer</b></summary>

  A side effect is any action that interacts with the outside world (like network requests, DOM manipulation, subscriptions, timers). 
  We cannot run them directly in the component body because the component body executes on **every render**. If you fetch data directly in the body, it will trigger a state update, causing a re-render, which runs the fetch again, leading to an **infinite rendering loop**.
</details>

### 2. When does the cleanup function returned by `useEffect` run?
<details>
  <summary><b>Reveal Answer</b></summary>

  The cleanup function runs at two specific times:
  1. Immediately before the effect callback runs again (when dependencies change), to clean up the previous render's side effects.
  2. When the component unmounts (is removed from the DOM completely).
</details>

### 3. What happens if you update state inside a `useEffect` that has no dependency array?
<details>
  <summary><b>Reveal Answer</b></summary>

  It creates an **infinite loop**. Updating state triggers a re-render. Since there is no dependency array, the effect runs again after that re-render. Inside the effect, the state is updated again, which triggers another re-render, looping indefinitely and crashing the browser tab.
</details>

### 4. Why does React run effects twice in development mode?
<details>
  <summary><b>Reveal Answer</b></summary>

  In React 18 and 19 development mode (when using `React.StrictMode`), React intentionally mounts, unmounts, and remounts components. This is to help developers detect missing cleanup functions (e.g. active event listeners or timers) that would otherwise cause memory leaks.
</details>

### 5. How do you solve a race condition in data fetching using `useEffect`?
<details>
  <summary><b>Reveal Answer</b></summary>

  You use a local boolean flag (e.g., `let active = true;`) inside the effect. When the component unmounts or the dependencies change, the cleanup function sets `active = false`. Before setting the state with the API response, you check `if (active)`. This prevents React from updating state with outdated API results.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: User Directory List
1. Create a component `UserDirectory.jsx` in `src/components/`.
2. Fetch a list of users from `https://jsonplaceholder.typicode.com/users` using `useEffect` with an empty dependency array.
3. Save the users list to a state variable `users`.
4. Render the list of names. Wrap the component inside your main `App.jsx` page.

### 🛠️ Exercise 2: Mouse Position Tracker (Cleaned Up Listener)
1. Create a component `MouseTracker.jsx`.
2. Set up an event listener in `useEffect` tracking the window `mousemove` event:
   ```javascript
   const handleMouseMove = (e) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   window.addEventListener('mousemove', handleMouseMove);
   ```
3. Return a cleanup function that correctly removes the event listener.
4. Render the `x` and `y` coordinates on screen. Check your console to verify cleanup runs when toggling the tracker component off.
