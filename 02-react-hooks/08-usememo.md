# The `useMemo` Hook ⚓

The **`useMemo`** Hook is a performance optimization tool in React that allows you to **cache (memoize) the computed result** of an expensive calculation between renders. It ensures that a computation is only run again if one of its dependencies changes.

### 💡 Real-World Analogy: The Tax Calculator
Imagine you are calculating your annual taxes manually. The calculation is complex, taking you 30 minutes to complete. 
- **Without `useMemo`**: Every time your friend asks what your tax rate is, you recalculate the math from scratch, taking 30 minutes each time.
- **With `useMemo`**: You write the final tax figure on a sticky note. When your friend asks, you read it instantly. You only recalculate if your income or deductions (**dependencies**) change.

---

## ⚡ 1. The Core Syntax

`useMemo` takes a function that returns a value, and a dependency array:

```jsx
import { useMemo } from 'react';

const memoizedValue = useMemo(() => {
  return runExpensiveCalculation(a, b);
}, [a, b]); // Only recalculates if 'a' or 'b' changes
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

## 🚀 3. When to Use `useMemo`

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
