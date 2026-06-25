# Zustand Async Actions & Persistence Middleware 🐻

This lesson covers how to write asynchronous actions (like calling REST APIs) inside Zustand stores and how to use built-in **Zustand Middlewares** to automatically persist state values in browser storage (like `localStorage`).

---

## 🎯 Concept & Overview

In real applications, state rarely stays local and temporary. You fetch data from servers, and you want certain values (theme, cart, auth token) to **survive a page refresh**. Zustand handles both needs with surprisingly little ceremony.

Two ideas drive this lesson:

1. **Async actions** — An action in Zustand is just a plain function. If it needs to `await` something, mark it `async`. There is no special "thunk" or "saga" layer to install.
2. **Persistence** — The `persist` middleware transparently mirrors your store into `localStorage`/`sessionStorage`, then reloads it on startup.

> [!NOTE]
> Async actions in Zustand need **no extra middleware**. Because actions are ordinary JavaScript functions, you can write `async fetchUser()` and call `set()` whenever your `await` resolves. This is the biggest mental shift coming from Redux, where async logic forces you to add Thunk/Saga and dispatch multiple action types.

> [!WARNING]
> The `persist` middleware reads from `localStorage`, which **does not exist on the server**. In SSR frameworks (Next.js, Remix), the server renders with default values while the client rehydrates with stored values — producing a **hydration mismatch** warning. Guard against it by deferring persisted UI until after mount (e.g. a `hasHydrated` flag or `onRehydrateStorage` hook). See Section 3.

> [!TIP]
> Persist only what you truly need. Saving an entire store (including transient `loading`/`error` flags) to `localStorage` is wasteful and can resurrect stale states on reload. Use `partialize` to whitelist keys.

### 🌍 Real-World Metaphor

Think of your Zustand store as the **whiteboard in an office**:

- **Without persistence**, the whiteboard is wiped clean every night (every page refresh). Everyone starts from a blank board the next morning.
- **With the `persist` middleware**, a diligent assistant photographs the board before leaving (writes to `localStorage`) and redraws it exactly each morning (rehydration). The team continues as if nothing happened.
- **An async action** is like sending a courier to fetch a document from the archive. You note "courier is out" on the board (`set({ loading: true })`), keep working, and update the board when the courier returns with the document — or with bad news (`set({ error })`).

### 📊 Redux vs. Zustand for Async & Persistence

| Concern               | Redux (classic)                          | Zustand                                   |
| --------------------- | ---------------------------------------- | ----------------------------------------- |
| Async logic           | Requires Thunk/Saga middleware           | Plain `async` function inside the store   |
| Action dispatch       | `dispatch(action)` + reducer + types     | Call `set()` directly                     |
| Boilerplate           | Action creators, types, reducers         | One function                              |
| Persistence           | `redux-persist` (separate install/setup) | Built-in `persist` middleware             |
| Storage serialization | Manual config / transforms               | Automatic `JSON.stringify` / `JSON.parse` |

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

> [!NOTE]
> Notice the three `set()` calls describe the full lifecycle of a request: **start** (`loading: true`), **success** (`user: data`), and **failure** (`error`). This `loading / data / error` triad is the standard shape for any data-fetching action.

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

### 🎛️ Selective Persistence with `partialize`

Often you only want to persist a subset of the store and leave transient fields out. The `partialize` option accepts a selector that returns just the keys you want saved:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],            // We DO want to persist this
      loading: false,           // Transient — should NOT be persisted
      error: null,              // Transient — should NOT be persisted

      addItem: (item) =>
        set((state) => ({ cartItems: [...state.cartItems, item] })),
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
      // Only 'cartItems' is written to localStorage; loading/error stay in memory only
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
```

---

## ⚡ 3. Safe Hydration (SSR & First Render)

Because `localStorage` is unavailable on the server, persisted stores can desync between the server-rendered HTML and the client. The `onRehydrateStorage` hook lets you flip a flag once rehydration finishes, so you can hold off rendering persisted UI until it is safe:

```jsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      hasHydrated: false, // Tracks whether localStorage has been read

      setTheme: (theme) => set({ theme }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => localStorage),
      // Fires after the persisted value has been merged into the store
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Consuming component: avoid the SSR/client mismatch by waiting for hydration
export const ThemeBadge = () => {
  const theme = useThemeStore((s) => s.theme);
  const hasHydrated = useThemeStore((s) => s.hasHydrated);

  // Render a neutral placeholder until the persisted value is loaded
  if (!hasHydrated) return <span>Loading theme…</span>;

  return <span>Current theme: {theme}</span>;
};
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
5. Add `loading` and `error` state fields, and set them appropriately during the fetch lifecycle (start → success → failure).
6. Use `partialize` so that **only** `cartItems` is written to `localStorage` (keep `loading`/`error` out of storage).
7. Run the app, add items, and reload the browser to verify the basket items are successfully loaded from `localStorage` (and that `loading` does NOT reappear stuck as `true` after reload).

### 🛠️ Exercise 2: Hydration-Safe Theme Toggle
1. Create a store named `useThemeStore.js` wrapped in `persist` with a `theme` value (`'light'` | `'dark'`) and a `toggleTheme` action.
2. Add a `hasHydrated` boolean and set it to `true` inside an `onRehydrateStorage` callback.
3. Build a `ThemeToggle` component that:
   - Reads `theme`, `toggleTheme`, and `hasHydrated` via selectors.
   - Renders a neutral placeholder (e.g. a disabled button) while `hasHydrated` is `false`.
   - Renders the real toggle once hydration completes.
4. Refresh the page repeatedly and confirm you see **no** "hydration mismatch" warning in the console and the chosen theme persists across reloads.
