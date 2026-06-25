# Zustand Store Creation & Selector Patterns 🐻

**Zustand** is a small, fast, and scalable state-management library for React. It is famous for having almost zero boilerplate code, not requiring context providers to wrap your application, and leveraging React hooks as its primary consumer interface.

---

## ⚡ 1. Installation

To add Zustand to your React application, run the following command in your terminal:

```bash
npm install zustand
```

---

## 🧩 2. Creating Your First Store

In Zustand, a store is a React hook. You create it using the **`create`** function, which receives a `set` callback to define state values and functions (actions) to update those values:

```javascript
import { create } from 'zustand';

// Create a custom hook named 'useCounterStore'
export const useCounterStore = create((set) => ({
  // 1. State values
  count: 0,
  title: "Zustand Counter",

  // 2. Actions (state updates)
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }), // Direct state replacement
  updateTitle: (newTitle) => set({ title: newTitle })
}));
```

---

## 🚀 3. Consuming Store States with Selectors

While you can destructure the entire store, the recommended best practice is to use **Selectors**. A selector tells Zustand exactly which properties you want to subscribe to. This optimizes performance by preventing the component from re-rendering when unrelated state properties change:

```jsx
import { useCounterStore } from '../stores/useCounterStore';

export const CounterDisplay = () => {
  // 1. Selector retrieves ONLY the count property
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div style={styles.container}>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

// 2. A separate component subscribing ONLY to the title property
export const HeaderTitle = () => {
  const title = useCounterStore((state) => state.title);
  console.log("HeaderTitle Rendered!"); // This won't run when clicking increment!
  
  return <h1>{title}</h1>;
};

const styles = { container: { padding: "20px", border: "1px solid #ccc", borderRadius: "5px" } };
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Zustand. Click **Reveal Answer** to verify.

### 1. Why does Zustand not require a `<Provider>` wrapper at the root of the React application?
<details>
  <summary><b>Reveal Answer</b></summary>

  Zustand stores are created as **external closures (module-level state scopes)** outside the React component tree. When a component calls the custom store hook, it subscribes directly to this external store. Because the data resides outside React, there is no need for a React Context Provider wrapper at the root of your application.
</details>

### 2. What is a "Selector" in Zustand, and why is it critical for rendering performance?
<details>
  <summary><b>Reveal Answer</b></summary>

  A Selector is a callback function passed to the store hook that returns only a specific slice of the state (e.g. `(state) => state.count`). It is critical for performance because if you destructure values without a selector (e.g. `const { count, title } = useStore()`), the component will re-render whenever *any* property in the store changes. Using a selector ensures the component only re-renders when the selected property updates.
</details>

### 3. How does the `set` function update state in Zustand? Is it deep merging or shallow merging?
<details>
  <summary><b>Reveal Answer</b></summary>

  Zustand's `set` function performs a **shallow merge** of the returned object with the active store state. If your store has properties `{ count: 0, title: "Title" }`, calling `set({ count: 1 })` leaves the `title` property unchanged. However, for deeply nested objects, you must manually merge properties using the spread operator (`...`).
</details>

### 4. Can we define Zustand actions outside of the `create()` store definition?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. Since Zustand stores are external closures, you can declare functions that modify state outside the store using the store's utility functions, e.g., `useCounterStore.setState({ count: 100 })`. Declaring actions inside the store is simply a convention to keep state and logic organized in one place.
</details>

### 5. In Zustand, how do you access the current state values inside an action without using `set` state parameters?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `create()` API provides a second callback parameter called **`get`**:
  ```javascript
  const useStore = create((set, get) => ({
    count: 0,
    checkAndIncrement: () => {
      const currentCount = get().count; // Read state value directly
      if (currentCount < 10) set({ count: currentCount + 1 });
    }
  }));
  ```
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Task Store with Zustand
1. Create a store named `useTodoStore.js` inside `src/stores/`.
2. Define a state array `todos` initialized to an empty array.
3. Add three actions inside the store:
   - `addTodo(text)`: Appends a new todo item `{ id: Date.now(), text, completed: false }`.
   - `toggleTodo(id)`: Maps through `todos` and toggles `completed` for the matching ID.
   - `deleteTodo(id)`: Filters out the matching todo item.
4. Build a React component `TodoList.tsx` that consumes this store using selectors and render list items on screen.
