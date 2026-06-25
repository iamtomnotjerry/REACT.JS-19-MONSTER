# Zustand Store Creation & Selector Patterns 🐻

**Zustand** is a small, fast, and scalable state-management library for React. It is famous for having almost zero boilerplate code, not requiring context providers to wrap your application, and leveraging React hooks as its primary consumer interface.

---

## 📖 Concept & Overview

Imagine a deeply nested component tree: `App → Header → Nav → Card → User → DateTime`. If a piece of data lives at the top in `App` but is needed all the way down in `DateTime`, you would have to pass that data as a prop through every single layer in between. This tedious chain is called **prop drilling**. The Context API can solve it, but as your app grows you generally reach for a dedicated state library — Redux Toolkit or **Zustand**.

Zustand's mental model is simple: instead of threading state through components, you **lift the state out of the tree entirely** into an external *store*. Any component — `Card`, `Nav`, or `DateTime` — can then reach directly into that store and pull out exactly what it needs.

> [!NOTE]
> In Zustand the **actions live inside the store**, right next to the state they update. A store bundles both the data (`count`) and the functions that mutate it (`increment`, `decrement`) into a single object. This keeps your state logic colocated and easy to reason about, rather than scattered across reducers, action creators, and dispatchers.

> [!TIP]
> Always **select narrow slices** of state with a selector — `useStore((state) => state.count)` — instead of grabbing the whole store. A component subscribed to a single slice only re-renders when that slice changes, which avoids a cascade of unnecessary re-renders across your UI.

### 🏬 A Real-World Metaphor: The Warehouse

Think of a Zustand store as a **central warehouse** that sits outside your shop floor (the React tree):

- The **warehouse** holds all the goods (your state) in one place.
- Each **shop assistant** (a component) does not carry the whole warehouse around. Instead they walk in with a precise shopping list — a **selector** — and grab only the item they need.
- When a single shelf is restocked (a slice updates), only the assistants who asked for *that* item get notified. Assistants holding a list for other shelves keep working undisturbed.

This is why Zustand needs no `<Provider>` at the root — the warehouse exists independently of the shop, as a module-level closure.

### 🆚 Zustand vs. Other Approaches

| Feature | Prop Drilling | Context API | Redux Toolkit | **Zustand** |
| --- | --- | --- | --- | --- |
| Provider wrapper required | No | ✅ Yes | ✅ Yes | ❌ No |
| Boilerplate | Low (but tedious) | Medium | High | **Very low** |
| Re-render control | Manual | Whole consumer re-renders | Via `useSelector` | **Built-in selectors** |
| Access outside components | No | No | Via `store.dispatch` | **Yes (`useStore.setState`)** |
| Best for | 1–2 layers | Small/static state | Large, complex apps | **Most apps, fast scaling** |

```text
        Prop Drilling                        Zustand
   App (data) ──┐                       ┌──────────────┐
                │ prop                  │    STORE      │ (external closure)
            Header                      │  count: 0     │
                │ prop                  │  increment()  │
              Card                      └──────┬────────┘
                │ prop                     ▲   │   ▲
             DateTime  <- finally used     │   │   │  selectors
                                        Card Nav DateTime
```

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

  // 2. Actions (state updates) — these live INSIDE the store
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }), // Direct state replacement
  updateTitle: (newTitle) => set({ title: newTitle })
}));
```

> [!WARNING]
> Zustand's `set` performs a **shallow merge**, not a deep merge. Calling `set({ count: 1 })` keeps `title` intact, but for nested objects you must spread the previous values yourself: `set((state) => ({ user: { ...state.user, name: "New" } }))`. Forgetting the spread will silently overwrite the rest of the nested object.

### 🟦 With TypeScript

The course teaches the same store typed with TypeScript. You declare an interface describing your state shape and actions, then pass it as the type argument to `create`:

```typescript
import { create } from 'zustand';

// Describe the shape of the store: state + actions
interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Annotate create<...> so TypeScript checks every slice and action
export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
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

> [!TIP]
> You can also read the current state outside React using `useCounterStore.getState().count`, and update it from anywhere — even outside a component — with `useCounterStore.setState({ count: 100 })`. This is possible because the store is an external closure, not bound to the component tree.

### 🔁 Two ways to access the same data

The course demonstrates two consumption styles. Prefer the selector form on the right for performance:

```jsx
// ❌ Destructuring the whole store — re-renders on ANY change
const { count, increment } = useCounterStore();

// ✅ Narrow selectors — re-renders only when THAT slice changes
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);
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

**Stretch goal:** Add a `clearCompleted()` action that filters out every todo whose `completed` is `true`, and a derived selector in the component that counts remaining (incomplete) todos — make sure that counter only re-renders when the count actually changes.

### 🛠️ Exercise 2: Typed Recipe Store (TypeScript)
Recreate the recipe store demonstrated in the course, fully typed.

1. Define a `Recipe` interface with `id: number`, `name: string`, `ingredients: string[]`, and `instructions: string`.
2. Define a `RecipeStore` interface containing `recipes: Recipe[]`, `addRecipe(recipe: Recipe): void`, and `removeRecipe(id: number): void`.
3. Create the store with `create<RecipeStore>((set) => ({ ... }))`:
   - `addRecipe` should spread the existing recipes and append the new one: `set((state) => ({ recipes: [...state.recipes, recipe] }))`.
   - `removeRecipe` should filter by id: `set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))`.
4. Build a `RecipeList.tsx` component that subscribes to `recipes` with a **narrow selector** and renders each recipe's name and joined ingredients.

```tsx
import { create } from 'zustand';

// 1. Shape of a single recipe item
interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string;
}

// 2. Shape of the store: state + actions
interface RecipeStore {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: number) => void;
}

// 3. Create the typed store
export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  // Clone existing recipes, then append the new one (shallow merge)
  addRecipe: (recipe) =>
    set((state) => ({ recipes: [...state.recipes, recipe] })),
  // Keep only the recipes whose id does NOT match the one to remove
  removeRecipe: (id) =>
    set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))
}));
```

**Stretch goal:** Add an `updateRecipe(id, updated)` action that replaces a matching recipe in place, and wire up an edit-and-save flow in the component.
