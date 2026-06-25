# Zustand Async Actions & Persistence Middleware 🐻

This lesson covers how to write asynchronous actions (like calling REST APIs) inside Zustand stores and how to use built-in **Zustand Middlewares** to automatically persist state values in browser storage (like `localStorage`).

---

## ⚡ 1. Asynchronous Actions in Zustand

Unlike Redux which requires complex middleware (like Thunk or Saga) to process async code, Zustand actions can be written directly as standard **`async/await`** functions:

```javascript
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Async Action
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      if (!res.ok) throw new Error("User profile not found!");
      const data = await res.json();
      
      // Update state when network request completes
      set({ user: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  }
}));
```

---

## ⚡ 2. Persisting State automatically (`persist` Middleware)

A highly requested feature is saving state configurations (like shopping baskets, theme styles, or login details) so they survive browser refreshes.

Zustand provides a built-in **`persist`** middleware that automatically syncs store states to `localStorage` (or `sessionStorage`) without requiring any manual storage setters:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    // 1. Standard store definition
    (set) => ({
      fontSize: "medium",
      notificationsEnabled: true,
      
      setFontSize: (size) => set({ fontSize: size }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled }))
    }),
    // 2. Persistence configurations
    {
      name: 'user-app-settings', // Unique storage key name in localStorage
      storage: createJSONStorage(() => localStorage), // Default storage (optional config)
    }
  )
);
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Zustand middleware and async actions. Click **Reveal Answer** to verify.

### 1. Do we need any extra thunk configurations to handle async operations in Zustand?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Zustand actions are standard JavaScript functions. You can write them as `async` functions and perform asynchronous operations (like using `await fetch()`) directly within the store. When the request resolves, you simply call the synchronous `set()` function to save the data.
</details>

### 2. How does the `persist` middleware handle parsing and stringifying data?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `persist` middleware handles object serialization automatically under the hood. It converts your store state into a JSON string before writing to `localStorage`, and runs `JSON.parse` automatically to restore the state when the application mounts, saving you from writing boilerplate code.
</details>

### 3. What happens if you add actions (functions) to a persisted store? Are functions also saved to `localStorage`?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Functions cannot be serialized into JSON. The `persist` middleware is smart enough to identify and serialize only the data properties in the store, automatically ignoring function references during serialization and restoring the functions correctly on initialization.
</details>

### 4. What is "Hydration" in the context of persisted stores, and why can it cause issues in SSR frameworks?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hydration is the process where React client-side code loads and binds state to server-rendered HTML. In SSR frameworks (like Next.js), the server doesn't have access to browser `localStorage` and renders default values. If the client loads persisted values on mount, it creates a mismatch. This is solved by using an `onRehydrateStorage` hook or checking mounting states in the client before displaying persisted layouts.
</details>

### 5. Can we select or restrict which specific parts of a store get persisted?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. You can use the `partialize` configuration option inside the persist settings. It accepts a selector function specifying only the keys you want to serialize:
  ```javascript
  {
    name: 'settings',
    partialize: (state) => ({ fontSize: state.fontSize }) // Only saves 'fontSize'
  }
  ```
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Persisted Shopping Cart with API Calculations
1. Create a store named `useCartStore.js` in `src/stores/`.
2. Wrap it inside the `persist` middleware.
3. Keep an array `cartItems` storing product objects: `[{ id, name, price, qty }]`.
4. Create an action `fetchProductAndAdd(id)` that:
   - Fetches product details asynchronously from `https://jsonplaceholder.typicode.com/todos/${id}` (treating the todo title as the product name, and generating a dummy price).
   - Appends it to `cartItems` with a quantity of `1`.
5. Run the app, add items, and reload the browser to verify the basket items are successfully loaded from `localStorage`.
