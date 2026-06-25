# The `useMemo` Hook ⚓

The **`useMemo`** Hook is a performance optimization tool in React that allows you to **cache (memoize) the computed result** of an expensive calculation between renders. It ensures that a computation is only run again if one of its dependencies changes.

---

## 📖 Concept & Overview

Every time a React component re-renders, **all of the code inside its function body runs again from top to bottom**. For cheap operations (adding two numbers, building a small string) this is invisible. But if your component performs an expensive calculation — sorting thousands of records, filtering a huge list, running a heavy math loop — that work happens on *every* render, even when the inputs never changed.

`useMemo` solves this by **remembering** the result of a calculation and only re-running the calculation when one of its declared dependencies changes. In between, React hands you back the previously cached value instantly.

> [!NOTE]
> Use `useMemo` to memoize **expensive calculations only** — sorting/filtering large arrays, intensive math loops, or to preserve a stable object/array reference. Wrapping trivial work (a simple sum or a short string concat) in `useMemo` usually costs more than it saves, because React still has to store the value and compare the dependency array on every render.

> [!WARNING]
> **Never run side effects inside the `useMemo` factory function.** `useMemo` runs during the **render phase**, which must stay pure. Do not perform API calls, write to `localStorage`, mutate external variables, or call `setState` inside it. Side effects belong in event handlers or in `useEffect`.

> [!TIP]
> Before reaching for `useMemo`, measure first. Wrap the suspect calculation in `console.time("calc")` / `console.timeEnd("calc")` (or use the React Profiler). If it consistently takes only a fraction of a millisecond, you almost certainly do not need to memoize it.

---

### 💡 Real-World Analogy: The Tax Calculator
Imagine you are calculating your annual taxes manually. The calculation is complex, taking you 30 minutes to complete.
- **Without `useMemo`**: Every time your friend asks what your tax rate is, you recalculate the math from scratch, taking 30 minutes each time.
- **With `useMemo`**: You write the final tax figure on a sticky note. When your friend asks, you read it instantly. You only recalculate if your income or deductions (**dependencies**) change.

The sticky note is the **cache**. Your income and deductions are the **dependency array**. As long as they don't change, the answer is already written down.

---

### 🔍 `useMemo` vs. `useCallback` vs. Plain Computation

| Approach | What it caches | Returns | Best for |
| --- | --- | --- | --- |
| Plain computation (no hook) | Nothing | Freshly computed value every render | Cheap, fast operations |
| `useMemo(fn, deps)` | The **value returned** by `fn` | The cached result of `fn()` | Expensive calculations; stable object/array references |
| `useCallback(fn, deps)` | The **function reference** itself | The same function (not executed) | Stable callback props passed to memoized children |

`useCallback(fn, deps)` is essentially shorthand for `useMemo(() => fn, deps)`.

---

## ⚡ 1. The Core Syntax

`useMemo` takes a function that returns a value, and a dependency array:

```jsx
import { useMemo } from 'react';

const memoizedValue = useMemo(() => {
  return runExpensiveCalculation(a, b);
}, [a, b]); // Only recalculates if 'a' or 'b' changes
```

Conceptually, the render flow looks like this:

```text
Component re-renders
        │
        ▼
Did any dependency in [a, b] change?
        │
   ┌────┴─────┐
  YES         NO
   │           │
   ▼           ▼
Re-run fn   Return the
& cache     cached value
result      (skip fn)
```

---

## 🧩 2. Comprehensive Code Example: Filtering a Large Dataset

Let's look at a common scenario: filtering a list of users. Without `useMemo`, clicking a separate "Increment Count" button would cause the entire list filtering logic to re-run, even though the search query didn't change.

```jsx
import { useState, useMemo } from 'react';

// Generates a mock list of 5,000 items
const generateUsers = () => {
  const list = [];
  for (let i = 0; i < 5000; i++) {
    list.push({ id: i, name: `User ${i}`, age: Math.floor(Math.random() * 80) + 10 });
  }
  return list;
};

const usersData = generateUsers();

const UserFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState(0);

  // Memoize the filtered users array
  const filteredUsers = useMemo(() => {
    console.log("Filtering users... (expensive operation)");
    return usersData.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]); // Only re-run filtering if searchTerm changes

  return (
    <div style={{ padding: "20px" }}>
      <h2>Performance Testing (useMemo)</h2>

      {/* 1. Unrelated state update */}
      <button onClick={() => setCount((prev) => prev + 1)}>
        Increment Count: {count}
      </button>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
        />
      </div>

      <p>Found {filteredUsers.length} users</p>
      <ul>
        {filteredUsers.slice(0, 10).map((user) => (
          <li key={user.id}>{user.name} (Age: {user.age})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserFilter;
```

*When you click the "Increment Count" button, the component re-renders. However, the console statement `"Filtering users..."` does NOT fire, indicating that the cache was returned directly.*

---

## 🧊 3. Referential Equality: The Other Reason to Memoize

In JavaScript, two objects/arrays with the same contents are **not** equal (`{} !== {}`). Every render creates brand-new references. This matters when an object/array is used as a dependency or passed to a memoized child.

```jsx
import { useMemo, useEffect } from 'react';

// ❌ Without useMemo: a NEW object is created on every render,
//    so the useEffect below sees a "changed" dependency every time.
// const params = { category: "books" };

// ✅ With useMemo: the same object reference is reused across renders.
const params = useMemo(() => ({ category: "books" }), []);

useEffect(() => {
  fetchData(params);
}, [params]); // Stable reference prevents an infinite fetch loop
```

> [!WARNING]
> A common bug: putting a freshly-created object or array in a `useEffect` dependency array. Because the reference changes every render, the effect fires endlessly. Memoizing the object with `useMemo` gives it a stable identity and breaks the loop.

---

## 🚀 4. When to Use `useMemo`

You should not add `useMemo` everywhere. It adds execution overhead. Use it under these two scenarios:
1. **Expensive Calculations**: When you are processing, sorting, or filtering large arrays or doing intensive math operations.
2. **Referential Equality of Objects/Arrays**: If you are passing an object or array down to a child component that is memoized, or using it as a dependency in another hook like `useEffect`:
   ```javascript
   // Without useMemo, this object reference changes on EVERY render
   const params = useMemo(() => ({ category: "books" }), []);
   useEffect(() => {
     fetchData(params);
   }, [params]); // Prevents infinite loops
   ```

> [!NOTE]
> `useMemo` is a performance **optimization**, not a correctness guarantee. React may choose to discard a cached value (for example, to free memory) and recompute it. Your code must work correctly even if `useMemo` recomputes on every render — never rely on it to *only* run once.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of `useMemo`. Click **Reveal Answer** to verify.

### 1. What is the fundamental difference between `useMemo` and `useCallback`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `useMemo` caches the **returned value** of a function (returns the result of executing the function).
  - `useCallback` caches the **function reference itself** (returns the function without executing it).
</details>

### 2. How do you determine if a calculation is "expensive" enough to warrant `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  You can measure performance using `console.time()` and `console.timeEnd()`. In general, operations processing arrays of hundreds/thousands of elements, sorting datasets, or executing loops are expensive. Standard rendering additions, simple text concats, or small object allocations are cheap and do not need `useMemo`.
</details>

### 3. What happens if you omit the dependency array in `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  If you pass no dependency array, the function will execute on **every single render**, which completely defeats the purpose of caching the value. Always provide a dependency array.
</details>

### 4. Can you use `useMemo` to cache JSX elements?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. Since React elements are plain JavaScript objects, you can memoize a portion of your UI layout:
  ```jsx
  const expensiveUI = useMemo(() => <HeavyComponent data={data} />, [data]);
  ```
  This prevents `HeavyComponent` from re-rendering unless `data` changes.
</details>

### 5. Why shouldn't you write side effects (like API calls or updating local storage) inside `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMemo` runs during the **render phase**. The render phase must be pure and free of side effects. Executing network requests or changing state during rendering will cause bugs, visual glitches, and potential infinite rendering loops. Side effects must always be placed in event handlers or inside the `useEffect` hook.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Heavy Prime Number Calculator
1. Create a component `PrimeCalculator.jsx`.
2. Implement a helper function `checkPrime(num)` that determines if a number is prime (run a loop from 2 up to the square root of `num`).
3. Render an input field allowing users to enter a number, and display whether it is prime or not.
4. Render a toggle button that toggles a theme (background color).
5. Wrap the `checkPrime` calculation in `useMemo` so that toggling the theme does not trigger a re-run of the prime checks, preserving UI rendering speeds.

**Starter scaffold:**

```jsx
import { useState, useMemo } from 'react';

// Returns true if num is a prime number
const checkPrime = (num) => {
  console.log("Running expensive prime check...");
  if (num < 2) return false;
  // Only loop up to the square root for efficiency
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const PrimeCalculator = () => {
  const [number, setNumber] = useState(7);
  const [darkTheme, setDarkTheme] = useState(false);

  // TODO: memoize this so toggling the theme does NOT re-run checkPrime
  const isPrime = useMemo(() => checkPrime(number), [number]);

  const themeStyles = {
    background: darkTheme ? "#222" : "#eee",
    color: darkTheme ? "#fff" : "#000",
    padding: "20px",
  };

  return (
    <div style={themeStyles}>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
      />
      <p>{number} is {isPrime ? "PRIME" : "NOT prime"}</p>
      <button onClick={() => setDarkTheme((prev) => !prev)}>Toggle Theme</button>
    </div>
  );
};

export default PrimeCalculator;
```

Open the console: confirm that clicking **Toggle Theme** does NOT log `"Running expensive prime check..."`, but changing the number does.

---

### 🛠️ Exercise 2: Stable Reference to Stop an Infinite Loop
1. Create a component `ProductList.jsx` that receives a `filters` object (e.g. `{ category: "books", inStock: true }`).
2. Inside, call `useEffect` that "fetches" products whenever `filters` changes (log a message to simulate the fetch).
3. First, define `filters` as a plain inline object **without** `useMemo` and observe that the effect fires on every render — an infinite loop if the effect also updates state.
4. Then wrap `filters` in `useMemo(() => ({ category, inStock }), [category, inStock])` and confirm the effect now only fires when `category` or `inStock` actually changes.
5. Bonus: add a counter button unrelated to the filters and verify that incrementing it no longer triggers the fetch once `useMemo` is in place.

> [!TIP]
> This exercise demonstrates the *referential equality* use case — arguably the more common real-world reason to reach for `useMemo`, even more than raw calculation cost.
