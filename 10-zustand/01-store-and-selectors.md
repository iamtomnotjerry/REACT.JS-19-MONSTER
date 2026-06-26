# Zustand: Store, Actions & Selectors 🐻

**Zustand** (German for "state") is a tiny, fast, unopinionated state-management library for React. You define a *store* once, colocate your **state** and the **actions** that mutate it inside that store, and then any component anywhere in the tree reads exactly the slice it needs through a **selector** — no `<Provider>`, no reducers, no action-type constants, no dispatch boilerplate.

This lesson is a focused deep-dive into the three pillars you will use every single day with Zustand: building a fully-typed **store**, defining **actions** that read and write state (with `set` and `get`), and consuming state efficiently with **selectors** and `useShallow`. By the end you will understand exactly when a component re-renders, how `set` merges state, and how to decide between a single sliced store and several small stores.

> [!NOTE]
> The recorded course grounds the store-creation fundamentals you see here: installing `zustand`, the `create(set => ({ ...state, ...actions }))` shape, the custom-hook pattern, and the TypeScript interface. The deeper material — `get()` inside actions, `useShallow` for object/array selections, the slices pattern, and the single-store-vs-multiple-stores trade-off — goes **beyond** what the instructor recorded. Those parts are taught here against the current Zustand v5 best practices so you have a complete, accurate picture.

---

## ⚡ 1. Concept & Overview

In a typical React app, state that many components share has to live in a *common ancestor* and be threaded down as props — the dreaded **prop drilling**. The Context API removes the threading but re-renders *every* consumer whenever *any* part of the context value changes. Redux fixes the re-render problem with selectors but asks you to write reducers, action creators, and a provider.

Zustand's mental model is different: the store lives **outside** the React tree as a module-level closure. Components don't receive state from a parent — they reach *up and out* to the store and subscribe to a precise slice of it.

### 🏬 A Real-World Metaphor: The Central Warehouse

Think of a Zustand store as a **central warehouse** standing next to your shop (the React tree):

- The **warehouse** holds every item (your state) in one place, independent of who is shopping.
- Each **shop assistant** (a component) walks in with a precise shopping list — a **selector** — and grabs only the item they came for, not the whole inventory.
- When one shelf is restocked (one slice updates), only the assistants whose list mentions *that shelf* get paged. Everyone else keeps working undisturbed.
- The warehouse manager (an **action**) can look at any shelf (`get()`) before deciding how to restock (`set()`).

Because the warehouse exists on its own, you never need to wrap your shop in a `<Provider>` — the store is just a JavaScript module you import.

### 🆚 Zustand vs. Context vs. Redux Toolkit

| Concern | Context API | Redux Toolkit | **Zustand** |
| :--- | :--- | :--- | :--- |
| Provider at the root | ✅ Required | ✅ Required (`<Provider store>`) | ❌ Not required |
| Boilerplate to add state | Low | High (slice + reducer + store config) | **Very low** |
| Re-render granularity | Whole consumer re-renders on any value change | Per-selector via `useSelector` | **Per-selector, built in** |
| Reading state outside React | Awkward | `store.getState()` | **`useStore.getState()`** |
| Writing state outside React | Not possible | `store.dispatch(...)` | **`useStore.setState(...)`** |
| Async actions | Manual | Thunks / RTK Query | **Just `async` functions in the store** |
| DevTools / persistence | DIY | Built-in | **Middleware (`devtools`, `persist`)** |
| Bundle size (approx) | 0 (built in) | ~12 kB+ | **~1 kB** |
| Best fit | Small, rarely-changing state (theme, locale) | Large apps with strict conventions | **Most apps; fast to scale** |

```text
       Context API                         Zustand
  ┌─────────────────┐               ┌──────────────────────┐
  │  <Provider>     │               │   STORE (module)     │  ← lives outside React
  │   value={...}   │               │   count: 0           │
  │  ┌───────────┐  │               │   user:  {...}       │
  │  │ Consumer  │  │ re-renders    │   increment()        │
  │  │ Consumer  │  │ ALL on any    └─────────┬────────────┘
  │  │ Consumer  │  │ value change      ▲     ▲     ▲
  │  └───────────┘  │               selector selector selector
  └─────────────────┘                 │       │       │
                                    CompA   CompB   CompC   ← each re-renders
                                                              only for ITS slice
```

---

## 🛠️ 2. Installation

Zustand ships as a single dependency. Add it to any React 18 / 19 project:

```bash
npm install zustand
```

No provider, no configuration file, no codegen. The next thing you write is the store itself.

---

## 🧩 3. Creating a Store: `create<StoreType>()((set, get) => ({ ... }))`

A Zustand store **is a React hook**. You build it with the `create` function. In TypeScript you supply the store's shape as a type argument so every piece of state and every action is checked.

> [!TIP]
> With TypeScript, use the **curried** form `create<StoreType>()(...)` — note the empty `()` after the type argument. This two-step call is required for TypeScript to correctly infer the types of `set` and `get` when you later add middleware like `persist` or `devtools`. The non-curried `create<StoreType>(...)` works for the simplest stores but breaks inference once middleware is involved, so it is good practice to always curry.

```typescript
// src/stores/useCounterStore.ts
import { create } from "zustand";

// 1. Describe the FULL shape of the store: state values + actions.
//    Keeping them in one interface is the whole point of Zustand —
//    the data and the functions that change it live together.
interface CounterStore {
  // ---- state ----
  count: number;
  title: string;

  // ---- actions ----
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setTitle: (title: string) => void;
  // An action that READS state before writing it (uses get):
  incrementIfBelow: (max: number) => void;
}

// 2. create<CounterStore>()(...) — note the empty () after the type arg.
//    The callback receives `set` (write) and `get` (read) and must
//    return an object containing BOTH the initial state and the actions.
export const useCounterStore = create<CounterStore>()((set, get) => ({
  // ---- initial state ----
  count: 0,
  title: "Zustand Counter",

  // ---- actions ----
  // The functional form of set receives the previous state.
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),

  // The object form of set replaces the listed keys directly.
  reset: () => set({ count: 0 }),
  setTitle: (title) => set({ title }),

  // get() returns the CURRENT store snapshot — handy for conditional logic.
  incrementIfBelow: (max) => {
    const { count } = get(); // read the live value, no `state` param needed
    if (count < max) {
      set({ count: count + 1 });
    }
  },
}));
```

> [!WARNING]
> `set` performs a **shallow merge of the top level only** — it is *not* a deep merge. Calling `set({ count: 1 })` keeps `title` untouched because they are sibling top-level keys. But for a nested object you must spread it yourself:
> ```typescript
> // ❌ This REPLACES the entire user object, dropping every other field
> set({ user: { name: "Ada" } });
>
> // ✅ Spread the previous nested object so siblings survive
> set((state) => ({ user: { ...state.user, name: "Ada" } }));
> ```
> Forgetting the spread silently destroys the rest of the nested object — one of the most common Zustand bugs.

### 🧩 `set` vs `get` at a glance

| Helper | Direction | Typical use | Form |
| :--- | :--- | :--- | :--- |
| `set(partial)` | **Write** | Replace specific top-level keys | `set({ count: 0 })` |
| `set((state) => partial)` | **Write** | Derive new value from previous state | `set((s) => ({ count: s.count + 1 }))` |
| `get()` | **Read** | Read the live snapshot *inside an action* | `const { count } = get()` |

> [!TIP]
> Reach for `get()` whenever an action needs to *read* current state to decide what to do (validation, toggling, computing a derived write) — like the `incrementIfBelow` action above. Reach for the functional `set((state) => ...)` when you only need the previous value to *produce the new state*. They overlap, but `get()` shines when you read state in one place and write in another, or read multiple times in one action.

---

## 🚀 4. Reading State with Selectors

A **selector** is the function you pass to the store hook. It tells Zustand *exactly* which part of the store this component cares about. Zustand then re-renders the component **only when that selected value changes** (compared with `Object.is` by default).

```tsx
// src/components/Counter.tsx
import { useCounterStore } from "../stores/useCounterStore";

export function Counter() {
  // Each call subscribes to ONE narrow slice.
  // This component re-renders only when `count` changes.
  const count = useCounterStore((state) => state.count);

  // Selecting an action is cheap and stable: the function identity
  // never changes, so this subscription never triggers a re-render.
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}

// A sibling that subscribes ONLY to `title`. Clicking +1 above will
// NOT re-render this component, because `title` never changed.
export function TitleBar() {
  const title = useCounterStore((state) => state.title);
  console.log("TitleBar rendered"); // logs once, not on every increment
  return <h1>{title}</h1>;
}
```

> [!WARNING]
> Calling the hook with **no selector** — `const store = useCounterStore()` — subscribes the component to the *entire* store. It will then re-render on **every** state change anywhere in the store, defeating the main performance benefit. Always pass a selector unless you genuinely need the whole store.

### 🔁 Two consumption styles compared

```tsx
// ❌ Whole-store / destructure-everything: re-renders on ANY store change
const { count, increment } = useCounterStore();

// ✅ Narrow selectors: each re-renders only when ITS slice changes
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);
```

### 🛠️ Reading and writing from *outside* React

Because the store is an external closure, you can touch it without a component — useful in event handlers, utilities, tests, or route loaders:

```typescript
// Read the current snapshot anywhere (non-reactive — does not subscribe)
const current = useCounterStore.getState().count;

// Write from anywhere — components subscribed to `count` will re-render
useCounterStore.setState({ count: 100 });

// Subscribe imperatively (e.g. to log every change); returns an unsubscribe fn
const unsubscribe = useCounterStore.subscribe((state) =>
  console.log("count is now", state.count)
);
// ...later
unsubscribe();
```

---

## 🧩 5. `useShallow` — Selecting Objects and Arrays Safely

There is a sharp edge with selectors. Zustand decides whether to re-render by comparing the *previous* selector result with the *new* one using `Object.is`. If your selector returns a **brand-new object or array on every call**, `Object.is` always reports "different," so the component re-renders on *every* store change — even unrelated ones, and can even loop.

```tsx
// ⚠️ DANGER: this selector builds a NEW object every render.
// Object.is(prev, next) is always false → re-renders on every store change.
const { count, title } = useCounterStore((state) => ({
  count: state.count,
  title: state.title,
}));
```

The fix is **`useShallow`**, a helper from `zustand/react/shallow`. It wraps your selector and compares the result *shallowly* (each key/element), so the component only re-renders when one of the picked values actually changes.

```tsx
// src/components/CounterPanel.tsx
import { useShallow } from "zustand/react/shallow";
import { useCounterStore } from "../stores/useCounterStore";

export function CounterPanel() {
  // ✅ Pick MULTIPLE values in one selector, compared shallowly.
  //    Re-renders only when count OR title actually changes value.
  const { count, title } = useCounterStore(
    useShallow((state) => ({ count: state.count, title: state.title }))
  );

  // useShallow also works for arrays and tuples:
  const [increment, decrement] = useCounterStore(
    useShallow((state) => [state.increment, state.decrement] as const)
  );

  return (
    <section>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </section>
  );
}
```

> [!NOTE]
> When should you reach for `useShallow`? Whenever a **single selector returns a freshly-constructed object, array, or tuple** that holds several store values. If you instead select each primitive in its own hook call (`const count = useStore(s => s.count)`), you do **not** need `useShallow`, because each selector returns a stable primitive that `Object.is` compares correctly. `useShallow` is the tool for grouping multiple picks into one subscription without paying for spurious re-renders.

### Comparison strategies at a glance

| What your selector returns | Re-render check | Need `useShallow`? |
| :--- | :--- | :--- |
| A primitive (`state.count`) | `Object.is` on the value | No |
| A stable function (`state.increment`) | `Object.is` on identity | No |
| A new object `{ a, b }` each call | `Object.is` → always different | **Yes** |
| A new array `[a, b]` each call | `Object.is` → always different | **Yes** |
| A `.filter()` / `.map()` result | new array each call | **Yes** (or memoize derivation) |

---

## ⚡ 6. A Realistic, Fully-Typed Store

Let's pull `set`, `get`, async, and nested-state updates together into a store you might actually ship — a cart with derived totals and an async checkout.

```typescript
// src/stores/useCartStore.ts
import { create } from "zustand";

// ---- domain types ----
interface CartItem {
  id: string;
  name: string;
  price: number; // unit price in cents
  qty: number;
}

interface CartStore {
  // state
  items: CartItem[];
  isCheckingOut: boolean;
  lastError: string | null;

  // actions
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalCents: () => number; // a derived getter using get()
  checkout: () => Promise<void>; // an async action
}

export const useCartStore = create<CartStore>()((set, get) => ({
  // ---- initial state ----
  items: [],
  isCheckingOut: false,
  lastError: null,

  // Add a new item, or bump qty if it already exists.
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        // Return a NEW array with the matching item's qty incremented.
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      // Append a fresh line item with qty 1.
      return { items: [...state.items, { ...item, qty: 1 }] };
    }),

  // Remove the matching line item entirely.
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  // Clamp quantity to a minimum of 1; never go to zero here.
  setQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, qty) } : i
      ),
    })),

  clear: () => set({ items: [] }),

  // A DERIVED value computed on demand via get(). Call it as
  // useCartStore.getState().totalCents() or select it in a component.
  totalCents: () =>
    get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

  // An async action: set a loading flag, await work, then commit results.
  checkout: async () => {
    // Read current state to guard against empty / double checkout.
    if (get().isCheckingOut || get().items.length === 0) return;

    set({ isCheckingOut: true, lastError: null });
    try {
      // Pretend network call; replace with your real API request.
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Success: empty the cart and drop the loading flag.
      set({ items: [], isCheckingOut: false });
    } catch (err) {
      // Failure: record the message and stop loading.
      set({
        isCheckingOut: false,
        lastError: err instanceof Error ? err.message : "Checkout failed",
      });
    }
  },
}));
```

Consuming it with correct, minimal subscriptions:

```tsx
// src/components/CartSummary.tsx
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../stores/useCartStore";

export function CartSummary() {
  // The items array changes identity whenever the cart mutates,
  // so a plain selector is fine here (we WANT to re-render on changes).
  const items = useCartStore((state) => state.items);

  // Group the flags + actions we need with useShallow (one new object).
  const { isCheckingOut, checkout } = useCartStore(
    useShallow((state) => ({
      isCheckingOut: state.isCheckingOut,
      checkout: state.checkout,
    }))
  );

  // Derive the total in the component from the items we already subscribed to.
  const totalCents = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div>
      <h3>{items.length} item(s)</h3>
      <p>Total: ${(totalCents / 100).toFixed(2)}</p>
      <button onClick={checkout} disabled={isCheckingOut || items.length === 0}>
        {isCheckingOut ? "Processing…" : "Checkout"}
      </button>
    </div>
  );
}
```

> [!TIP]
> Notice we derived `totalCents` *in the component* from `items` we already subscribed to, rather than also subscribing to the `totalCents()` getter. Subscribing to both would mean two subscriptions to data that always changes together. Pick the smallest set of slices that fully describes what the component renders.

---

## 🧩 7. One Store with Slices vs. Multiple Stores

As an app grows, you face an organizational choice. Both are first-class in Zustand.

**Multiple stores** — separate `create` calls per concern (`useAuthStore`, `useCartStore`, `useUiStore`). Each is fully independent: simple, perfectly isolated, and trivially tree-shaken. This is the recommended default and matches the course's per-feature store approach.

**A single store split into slices** — one `create` call whose body is composed from several *slice creator* functions. Choose this when slices need to call each other's actions easily, or when you want one store to persist/devtools as a unit.

```typescript
// src/stores/slices.ts
import { create } from "zustand";
import type { StateCreator } from "zustand";

// ---- slice 1: auth ----
interface AuthSlice {
  user: string | null;
  login: (user: string) => void;
  logout: () => void;
}

// ---- slice 2: cart ----
interface CartSlice {
  cart: string[];
  addToCart: (item: string) => void;
}

// The full store is the intersection of all slices.
type AppStore = AuthSlice & CartSlice;

// Each slice creator is typed so it can READ and WRITE the WHOLE store
// (the [] [] type params keep middleware inference happy in v5).
const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createCartSlice: StateCreator<AppStore, [], [], CartSlice> = (
  set,
  get
) => ({
  cart: [],
  addToCart: (item) => {
    // A cart action can read another slice's state via get().
    if (get().user === null) {
      console.warn("Cannot add to cart while logged out");
      return;
    }
    set((state) => ({ cart: [...state.cart, item] }));
  },
});

// Compose every slice into one store by spreading each creator's result.
export const useAppStore = create<AppStore>()((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));
```

| Question | Multiple stores | Single store + slices |
| :--- | :--- | :--- |
| Setup complexity | Lowest | Slightly more (`StateCreator` typing) |
| Cross-feature access | Import the other store's hook | One shared `get()` |
| Isolation / tree-shaking | Best | Whole store loaded together |
| Persist / devtools as a unit | Per store | One config for everything |
| Recommended default | ✅ Start here | When slices are tightly coupled |

> [!TIP]
> Start with **multiple small stores**, one per feature, and only reach for the single-sliced-store pattern when you find slices constantly needing each other's data. Splitting later is cheap; untangling one giant store is not.

---

## 🧠 Test Your Knowledge

### 1. Why does Zustand not require a `<Provider>` wrapper at the root of the app?
<details>
  <summary><b>Reveal Answer</b></summary>

  A Zustand store is created as a **module-level closure that lives outside the React component tree**. When a component calls the store hook, it subscribes directly to that external store. Because the state does not live inside React, there is no React Context to provide, and therefore no `<Provider>` is needed at the root. The same store can even be read and written outside React entirely via `useStore.getState()` and `useStore.setState()`.
</details>

### 2. What does `set` do when you call `set({ count: 1 })` on a store that also has a `title` field? What about nested objects?
<details>
  <summary><b>Reveal Answer</b></summary>

  `set` performs a **shallow merge of the top level**. `set({ count: 1 })` replaces only the `count` key and leaves the sibling `title` untouched. However, the merge is *only one level deep*: for a nested object like `user`, calling `set({ user: { name: "Ada" } })` **replaces the entire `user` object**, dropping every other field. To preserve siblings inside a nested object you must spread the previous value yourself: `set((state) => ({ user: { ...state.user, name: "Ada" } }))`.
</details>

### 3. When do you need `useShallow`, and when do you *not*?
<details>
  <summary><b>Reveal Answer</b></summary>

  Zustand re-renders when the selector's result differs by `Object.is`. You **need `useShallow`** when a single selector returns a *freshly-built object, array, or tuple* (e.g. `(s) => ({ a: s.a, b: s.b })`), because a new reference is created on every call and `Object.is` always reports "different," causing a re-render on every store change. You **do not need it** when each selector returns a stable **primitive** (`(s) => s.count`) or a stable **function reference** (`(s) => s.increment`) selected in its own hook call — those compare correctly with `Object.is`.
</details>

### 4. Inside an action, how do you read the current state without receiving it as a `set` parameter, and when is that useful?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `create` callback's **second argument, `get`**, returns the live store snapshot: `const { count } = get();`. It is useful when an action needs to *read before writing* — for validation/guards (e.g. don't increment past a max, don't checkout an empty cart), for reading **another slice's** state in a sliced store, or for reading state in one place and writing in a different place within the same action. Use the functional `set((state) => ...)` instead when you only need the previous value to compute the new one.
</details>

### 5. You wrote `const store = useCartStore();` (no selector). What is the performance consequence, and how do you fix it?
<details>
  <summary><b>Reveal Answer</b></summary>

  Calling the hook with **no selector** subscribes the component to the **entire store**, so it re-renders on *every* state change anywhere in the store — even unrelated fields. The fix is to pass a **narrow selector** for each value you actually use (`useCartStore((s) => s.items)`), or, when you need several values at once, group them in **one selector wrapped in `useShallow`** so the component re-renders only when one of those specific values changes.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: A Filterable Todo Store (state, actions, selectors, `useShallow`)

Build a todo store and a UI that re-renders precisely.

1. Create `src/stores/useTodoStore.ts` with a typed `TodoStore`:
   - State: `todos: Todo[]` (where `Todo = { id: number; text: string; done: boolean }`) and `filter: "all" | "active" | "done"`.
   - Actions: `addTodo(text)`, `toggleTodo(id)`, `removeTodo(id)`, `setFilter(filter)`, and `clearCompleted()`.
   - A getter `visibleTodos()` that uses `get()` to return the todos matching the current `filter`.
2. Build `TodoList.tsx` that subscribes to the visible todos and renders them.
3. Build a `Filters.tsx` toolbar that selects `filter` and `setFilter` together with `useShallow`, and prove (with a `console.log`) that toggling a todo does **not** re-render the toolbar.

```tsx
// src/stores/useTodoStore.ts — STARTER (fill in the bodies)
import { create } from "zustand";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "done";

interface TodoStore {
  todos: Todo[];
  filter: Filter;
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
  setFilter: (filter: Filter) => void;
  clearCompleted: () => void;
  visibleTodos: () => Todo[];
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],
  filter: "all",

  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, done: false }],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })),

  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

  setFilter: (filter) => set({ filter }),

  clearCompleted: () =>
    set((state) => ({ todos: state.todos.filter((t) => !t.done) })),

  // Uses get() to read both todos AND the current filter.
  visibleTodos: () => {
    const { todos, filter } = get();
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  },
}));
```

```tsx
// src/components/Filters.tsx — STARTER
import { useShallow } from "zustand/react/shallow";
import { useTodoStore } from "../stores/useTodoStore";

export function Filters() {
  // Group filter + setFilter into ONE shallow subscription.
  const { filter, setFilter } = useTodoStore(
    useShallow((state) => ({
      filter: state.filter,
      setFilter: state.setFilter,
    }))
  );

  console.log("Filters rendered"); // should NOT log when toggling a todo

  return (
    <div>
      {(["all", "active", "done"] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          style={{ fontWeight: filter === f ? "bold" : "normal" }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
```

**Your task:** Write `TodoList.tsx`. Subscribe to the *visible* todos (hint: select `todos` and `filter`, then derive in the component, OR call the `visibleTodos` getter via `useTodoStore((s) => s.visibleTodos())` — explain in a comment which you chose and why). Add an input + button that calls `addTodo`, and per-row Toggle and Remove buttons.

**Stretch goal:** Add a `remainingCount()` getter (number of `!done` todos) and a `<Footer>` that displays it. Confirm with a `console.log` that the footer re-renders only when the count actually changes — not on every keystroke in unrelated state.

---

### 🛠️ Exercise 2: Split the Store into Slices

Take the cart from Section 6 and the auth concept from Section 7 and combine them into **one sliced store**.

1. Create `src/stores/useShopStore.ts` exporting a single store composed from `createAuthSlice` and `createCartSlice` using the `StateCreator<AppStore, [], [], Slice>` pattern.
2. Make `addToCart` **read auth state through `get()`** and refuse to add when `user === null` (return early and set a `lastError` string).
3. Build a `Shop.tsx` component that:
   - Selects `user`, `login`, `logout` with `useShallow`.
   - Selects `cart` and `addToCart` with `useShallow`.
   - Renders a login form when logged out and the cart UI when logged in.

```typescript
// src/stores/useShopStore.ts — STARTER (complete the slices)
import { create } from "zustand";
import type { StateCreator } from "zustand";

interface AuthSlice {
  user: string | null;
  login: (user: string) => void;
  logout: () => void;
}

interface CartSlice {
  cart: string[];
  lastError: string | null;
  addToCart: (item: string) => void;
}

type ShopStore = AuthSlice & CartSlice;

const createAuthSlice: StateCreator<ShopStore, [], [], AuthSlice> = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null, cart: [] }), // also clears the cart on logout
});

const createCartSlice: StateCreator<ShopStore, [], [], CartSlice> = (
  set,
  get
) => ({
  cart: [],
  lastError: null,
  addToCart: (item) => {
    // Read the auth slice via the shared get().
    if (get().user === null) {
      set({ lastError: "Please log in before adding to the cart." });
      return;
    }
    set((state) => ({ cart: [...state.cart, item], lastError: null }));
  },
});

export const useShopStore = create<ShopStore>()((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));
```

**Your task:** Write `Shop.tsx` consuming `useShopStore` with `useShallow` for each group, and display `lastError` when present.

**Stretch goal:** Add the `persist` middleware (`import { persist } from "zustand/middleware"`) so the cart and user survive a page reload, then wrap the store: `create<ShopStore>()(persist((...args) => ({ ...createAuthSlice(...args), ...createCartSlice(...args) }), { name: "shop-storage" }))`. Reload the page and confirm the cart and login state are restored from `localStorage`.
