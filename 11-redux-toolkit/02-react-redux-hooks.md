# React-Redux: Provider & Typed Hooks 🪝

In the previous lesson you built a Redux store with `configureStore` and carved your state into slices with `createSlice`. That store, however, is just a plain JavaScript object sitting outside of React. This lesson is the bridge: it shows how the **`react-redux`** package wires that store *into* your component tree so any component can **read** state and **dispatch** actions — and how to do it with full, end-to-end TypeScript safety in React 19.

You will learn the three moving parts that make Redux feel native to React: the `<Provider>` that injects the store at the root, the `useSelector` hook that subscribes a component to a slice of state, and the `useDispatch` hook that lets a component send actions. Then we level up from the plain JavaScript the course recorded into the production-grade pattern every modern Redux Toolkit codebase uses: a typed `RootState`, a typed `AppDispatch`, and the **pre-typed `useAppSelector` / `useAppDispatch`** hooks that mean you never annotate `state` by hand again.

> [!NOTE]
> **Grounding & what is net-new.** The course records this material in plain JavaScript: wrapping `<App />` in `<Provider store={store}>`, reading with `useSelector((state) => state.counter.value)`, and dispatching with `useDispatch()`. Everything in the **"Typed Setup"** section onward (`RootState`, `AppDispatch`, the custom `useAppSelector`/`useAppDispatch` hooks, and memoized selectors with `createSelector`) is **net-new TypeScript best practice** added on top of what the instructor shows. It is the officially recommended approach in the current Redux Toolkit + React-Redux v9 docs. **RTK Query is intentionally not covered here — it lives in lesson 03.**

---

## 🌟 Concept & Overview

The Redux store is a single, app-wide object that holds your state. React components, by default, know nothing about it. The `react-redux` library is the **adapter** that connects the two worlds:

- **`<Provider store={store}>`** puts the store into React Context at the very top of the tree. Every descendant — no matter how deep — can now reach the store without prop drilling.
- **`useSelector`** is how a component **reads**. You hand it a function that picks the exact piece of state you care about; the component re-renders only when *that* piece changes.
- **`useDispatch`** is how a component **writes**. It returns the store's `dispatch` function, which you call with an action created by your slice.

### 🛠️ A real-world metaphor: the office intercom

Picture a large office building. The **store** is the central PA/intercom system humming in the basement — it holds the current announcements (state).

- `<Provider>` is the act of **wiring every room into that intercom**. Once the building is wired, any room can listen or speak; nobody has to run a private cable (prop) from the basement to each desk.
- `useSelector` is a **headset tuned to one channel**. You don't get blasted with every announcement in the building — you subscribe to the "Sales numbers" channel and only perk up when *that* number changes.
- `useDispatch` is the **microphone**. You press the button and broadcast a structured message — "INCREMENT the counter" — and the basement system (the reducers) decides how that message updates the announcements.

The headset (read) and microphone (write) are deliberately separate tools. You never mutate the announcement board by walking down to the basement and scribbling on it — you *speak an action into the mic*, and the system updates the board for everyone.

### How the pieces relate

```text
            ┌─────────────────────────────────────────────┐
            │  store  (configureStore)                     │
            │   state = { counter: { value: 0 }, ... }     │
            │   dispatch(action) -> reducers -> new state  │
            └───────────────▲──────────────────┬───────────┘
                            │                  │
                 reads via  │                  │  writes via
              useSelector   │                  │  useDispatch
                            │                  ▼
        ┌───────────────────┴──────────────────────────────┐
        │  <Provider store={store}>   (React Context root)  │
        │     └── <App>                                     │
        │           └── <Counter>  ← reads value, dispatches│
        └───────────────────────────────────────────────────┘
```

| Concern | Plain `useState` | Redux + react-redux |
| --- | --- | --- |
| Where state lives | Inside one component | One central store, app-wide |
| Sharing across the tree | Lift state up + prop drill | `<Provider>` + `useSelector` anywhere |
| Reading state | `const [v] = useState()` | `useSelector(state => state.x)` |
| Updating state | `setV(next)` | `dispatch(action(payload))` |
| Re-render trigger | `setState` call | A selected slice's reference changes |
| Cross-cutting logic | Manual callbacks | Centralized reducers + actions |

---

## ⚡ 1. Wrapping the App in `<Provider>`

The store is created once (lesson 01). To expose it to React, import `Provider` from `react-redux` and wrap your root component. In a React 19 + Vite app this happens in `src/main.tsx`.

First, here is the store and slice we are connecting (recap from lesson 01, now fully typed):

```typescript
// src/features/counter/counterSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// The shape of THIS slice's state.
interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    // No payload: just a command.
    increment: (state) => {
      // Immer lets us "mutate" safely — RTK produces a new immutable state.
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // WITH a payload: PayloadAction<number> types `action.payload` as a number.
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// Action creators are generated for each reducer key.
export const { increment, decrement, incrementByAmount, reset } =
  counterSlice.actions;

// The reducer goes into the store.
export default counterSlice.reducer;
```

```typescript
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    // The key "counter" is how we reach this slice in selectors:
    // state.counter.value
    counter: counterReducer,
  },
});
```

Now wire it into React at the root:

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Everything inside <Provider> can now read & dispatch. */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

> [!TIP]
> Wrap the app **as high as possible** — at the very root, around `<App />`. There is no performance penalty for a single `<Provider>` near the top, and putting it there guarantees every route, modal, and lazily-loaded component can reach the store. You do not need (and should not add) multiple `<Provider>`s for one store.

---

## 🧩 2. Reading & Dispatching (the JavaScript the course shows)

This is exactly the pattern recorded in the lessons, written in `react-redux`'s untyped form. It works, and it's the right mental model to start from before we add types.

```jsx
// src/components/Counter.jsx  — untyped, as shown in the course
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "../features/counter/counterSlice";

export const Counter = () => {
  // READ: subscribe to one narrow slice of state.
  // This component re-renders only when state.counter.value changes.
  const count = useSelector((state) => state.counter.value);

  // WRITE: get the dispatch function.
  const dispatch = useDispatch();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Count: {count}</h2>
      {/* Dispatch an ACTION (the result of calling the action creator). */}
      <button onClick={() => dispatch(increment())}>+ Increment</button>
      <button onClick={() => dispatch(decrement())}>- Decrement</button>
    </div>
  );
};
```

Two details from the recording that trip people up:

1. **You dispatch the *result* of calling the action creator.** `increment` is a function; `dispatch(increment())` sends the action object it returns. Writing `onClick={dispatch(increment())}` (no arrow) would fire it during render — always wrap it in an arrow function or a handler.
2. **The selector path mirrors the store shape.** `state.counter.value` reads from the `counter` key in `configureStore({ reducer: { counter } })`, then the `value` field from the slice's `initialState`. Change the store key and the selector path changes with it.

> [!WARNING]
> The biggest `useSelector` footgun: **never return a brand-new object or array literal from a selector**. `useSelector(state => ({ value: state.counter.value }))` builds a fresh object reference on *every* dispatch in the whole app. `react-redux` compares the result by reference (`===`), sees a new reference every time, and re-renders your component constantly — even when nothing relevant changed. Select primitives, or memoize (see section 5).

---

## ⚡ 3. The Typed Setup (net-new best practice)

The plain JS above has a hidden cost in TypeScript: inside `useSelector((state) => state.counter.value)`, `state` is typed as `unknown`, so you get no autocomplete and no compile-time safety on the path. The fix is two derived types plus two pre-typed hooks. **Define them once, import them everywhere.**

### 🛠️ Step 1 — Derive `RootState` and `AppDispatch` from the store

```typescript
// src/app/store.ts  (extended)
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// Infer the `{ counter: CounterState, ... }` shape directly from the store.
// As you add slices, RootState updates automatically — no manual editing.
export type RootState = ReturnType<typeof store.getState>;

// The exact dispatch type, including any middleware-enhanced dispatch
// (e.g. thunks). Derived from the store, never hand-written.
export type AppDispatch = typeof store.dispatch;
```

> [!NOTE]
> Notice both types are **inferred from the store**, not declared by hand. `ReturnType<typeof store.getState>` says "whatever `getState()` returns is my `RootState`." This is the single most important habit in typed Redux: the store is the source of truth, and the types follow it. Add a `user` slice tomorrow and `RootState` grows a `user` field for free.

### 🛠️ Step 2 — Create pre-typed hooks

```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Pre-typed dispatch: knows about your middleware (thunks, etc.).
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Pre-typed selector: `state` is automatically RootState — no annotation needed.
export const useAppSelector = useSelector.withTypes<RootState>();
```

> [!TIP]
> `useDispatch.withTypes<AppDispatch>()` and `useSelector.withTypes<RootState>()` are the modern react-redux **v9** API. If you are on an older v8 project you will see the equivalent older form:
> ```typescript
> export const useAppDispatch: () => AppDispatch = useDispatch;
> export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
> ```
> Both produce the same result — hooks where `state` is already `RootState`. Prefer `.withTypes()` on v9+.

### 🛠️ Step 3 — Use the typed hooks in components

```tsx
// src/components/Counter.tsx — fully typed React 19 component
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from "../features/counter/counterSlice";

export function Counter() {
  // `state` is inferred as RootState — you get autocomplete on `.counter.value`
  // and a compile error if you typo the path.
  const count = useAppSelector((state) => state.counter.value);

  // `dispatch` is AppDispatch — it accepts your slice actions (and thunks).
  const dispatch = useAppDispatch();

  return (
    <section style={{ padding: 20, textAlign: "center" }}>
      <h2>Count: {count}</h2>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => dispatch(decrement())}>-1</button>
        <button onClick={() => dispatch(increment())}>+1</button>
        {/* Dispatching an action WITH a payload — typed as number. */}
        <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
        <button onClick={() => dispatch(reset())}>Reset</button>
      </div>
    </section>
  );
}
```

If you wrote `dispatch(incrementByAmount("5"))`, TypeScript would reject it because `PayloadAction<number>` flows all the way through `incrementByAmount`'s signature. That is the entire payoff of the typed setup: the action's payload type is enforced at the call site.

### Plain vs. typed hooks at a glance

| | Plain (`react-redux` defaults) | Pre-typed (`useAppSelector` / `useAppDispatch`) |
| --- | --- | --- |
| `state` in selector | `unknown` (or `any`) | `RootState` automatically |
| Autocomplete on paths | None | Full, from the real store shape |
| Typo in `state.countr.value` | Silent | Compile error |
| Dispatching wrong payload | Allowed | Compile error |
| Where defined | Imported from `react-redux` | Imported from your `app/hooks.ts` |
| Boilerplate per component | Annotate `state` every time | Zero — import and go |

---

## ⚡ 4. Dispatching `createSlice` Actions with Payloads

Every key in a slice's `reducers` produces an **action creator** of the same name. Calling it returns a plain action object `{ type, payload }`; passing that to `dispatch` runs the matching reducer. Here is a richer slice — a todo list — to show payloads of different shapes.

```typescript
// src/features/todos/todosSlice.ts
import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface TodosState {
  items: Todo[];
}

const initialState: TodosState = {
  items: [],
};

export const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    // Object payload. We use `prepare` so callers pass just the text
    // while the reducer receives a fully-built Todo.
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: { id: nanoid(), text, done: false } as Todo,
      }),
    },
    // String payload (the id to toggle).
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) {
        todo.done = !todo.done;
      }
    },
    // String payload (the id to remove).
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
```

Register it in the store (`RootState` picks it up automatically):

```typescript
// src/app/store.ts  (with the todos slice added)
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import todosReducer from "../features/todos/todosSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Consume it in a component:

```tsx
// src/components/TodoList.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addTodo, toggleTodo, removeTodo } from "../features/todos/todosSlice";

export function TodoList() {
  const todos = useAppSelector((state) => state.todos.items);
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    // `prepare` means we pass just the string; the id/done are built for us.
    dispatch(addTodo(text));
    setDraft("");
  };

  return (
    <section style={{ maxWidth: 420, margin: "0 auto" }}>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What needs doing?"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: "flex", gap: 8, padding: "4px 0" }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(removeTodo(todo.id))}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

---

## ⚡ 5. Selector Best Practices

Selectors are where Redux performance is won or lost. Two rules cover most cases: **select narrow**, and **memoize anything derived**.

### 🧩 Rule 1 — Select the narrowest value

```tsx
// ✅ GOOD: select one primitive. Re-renders only when that number changes.
const count = useAppSelector((state) => state.counter.value);

// ✅ GOOD: select one already-stable array reference.
const todos = useAppSelector((state) => state.todos.items);

// ❌ BAD: new object literal every run → re-renders on EVERY dispatch.
const { value } = useAppSelector((state) => ({ value: state.counter.value }));
```

### 🧩 Rule 2 — Memoize derived data with `createSelector`

When a selector *computes* something (filters, counts, maps), the result is a new value each run. Returning a fresh array from `useAppSelector` re-renders the component on every dispatch. `createSelector` from Redux Toolkit (re-exported from Reselect) caches the output: it only recomputes when its **inputs** change, and returns the *same reference* otherwise.

```typescript
// src/features/todos/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// Input selectors: cheap, return existing references straight from state.
const selectTodoItems = (state: RootState) => state.todos.items;

// Output selector: the expensive/derived computation is memoized.
// Recomputes ONLY when `state.todos.items` changes reference.
export const selectActiveTodos = createSelector([selectTodoItems], (items) =>
  items.filter((todo) => !todo.done),
);

export const selectCompletedCount = createSelector(
  [selectTodoItems],
  (items) => items.filter((todo) => todo.done).length,
);
```

```tsx
// Using a memoized selector — same reference between unrelated dispatches.
import { useAppSelector } from "../app/hooks";
import { selectActiveTodos, selectCompletedCount } from "../features/todos/selectors";

export function TodoSummary() {
  const active = useAppSelector(selectActiveTodos);
  const doneCount = useAppSelector(selectCompletedCount);

  return (
    <p>
      {active.length} remaining · {doneCount} completed
    </p>
  );
}
```

> [!WARNING]
> A common mistake is to inline the derivation: `useAppSelector(state => state.todos.items.filter(t => !t.done))`. `.filter()` returns a **new array every time**, so the component re-renders on every dispatch anywhere in the app, even when todos didn't change. Move derived/computed selections into a `createSelector`, or memoize them — never compute new arrays/objects inline in `useSelector`.

> [!TIP]
> For selectors that take an argument (e.g. "todos for project X"), a single `createSelector` shares one cache slot and thrashes when called with different args across components. Use `createSelector` with a parameterized input, or RTK's per-instance pattern, so each argument gets its own memoized result. For simple apps, plain narrow selectors are perfectly fine — reach for memoization when you measure a real re-render problem.

---

## 🧠 Test Your Knowledge

### 1. What does `<Provider store={store}>` actually do, and where should it go?
<details>
  <summary><b>Reveal Answer</b></summary>

  `<Provider>` places the Redux store into React Context so that every descendant component can access it via the react-redux hooks (`useSelector`, `useDispatch`). Without it, those hooks throw "could not find react-redux context value." It should wrap your app **as high as possible** — typically around `<App />` in `main.tsx` — so every route, modal, and lazily-loaded component can reach the single store. You use exactly one `<Provider>` per store, near the root.
</details>

### 2. Why do we write `type RootState = ReturnType<typeof store.getState>` instead of declaring the state shape by hand?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because the store is the single source of truth. `ReturnType<typeof store.getState>` **infers** the entire `{ counter: ..., todos: ... }` shape directly from the configured reducers. When you add or remove a slice, `RootState` updates automatically with zero manual edits. Hand-declaring the type would duplicate information and drift out of sync the moment someone adds a slice. The same principle gives us `AppDispatch = typeof store.dispatch`, which captures middleware-enhanced dispatch (like thunks) precisely.
</details>

### 3. What is the difference between `useSelector` from `react-redux` and the custom `useAppSelector`?
<details>
  <summary><b>Reveal Answer</b></summary>

  They are the same hook functionally, but `useAppSelector` is **pre-typed**: created via `useSelector.withTypes<RootState>()`. With the plain hook, the `state` argument is `unknown`, so you'd have to annotate it (`(state: RootState) => ...`) in every component and you'd get no autocomplete otherwise. `useAppSelector` bakes in `RootState` once, so `state` is correctly typed everywhere with full autocomplete and no repeated annotations. The same applies to `useAppDispatch` carrying the `AppDispatch` type.
</details>

### 4. Why does returning `{ value: state.counter.value }` from a selector hurt performance?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useSelector` decides whether to re-render by comparing the selector's return value to the previous one with strict reference equality (`===`). An object/array **literal** creates a brand-new reference on every run, so the comparison is always "different," and the component re-renders on *every* dispatched action anywhere in the app — even when the underlying data never changed. Fixes: select primitives individually, or use a memoized `createSelector` that returns a stable reference when inputs are unchanged.
</details>

### 5. When do you need `createSelector`, and what does it memoize?
<details>
  <summary><b>Reveal Answer</b></summary>

  You need it whenever a selector **derives** a new value — filtering, mapping, computing totals — because that produces a new array/object reference each call and would trigger needless re-renders. `createSelector` takes one or more *input selectors* plus an *output function*. It caches the output and only recomputes when the inputs change reference; otherwise it returns the exact same reference, so `useSelector`'s equality check passes and the component does not re-render. Plain narrow selectors that return existing state references don't need it.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Typed counter from scratch
Build a fully typed counter feature end to end.

1. Create `src/features/counter/counterSlice.ts` with a `CounterState` (`{ value: number }`), `initialState`, and reducers `increment`, `decrement`, `incrementByAmount` (payload `number`), and `reset`.
2. In `src/app/store.ts`, register the reducer under the key `counter`, then export `RootState` and `AppDispatch` derived from the store.
3. In `src/app/hooks.ts`, create `useAppSelector` and `useAppDispatch` with `.withTypes<...>()`.
4. Wrap `<App />` in `<Provider store={store}>` inside `main.tsx`.
5. Build `Counter.tsx` using the typed hooks. Add a number input bound to local `useState`, and an "Add amount" button that dispatches `incrementByAmount(Number(input))`.
6. Confirm TypeScript rejects `dispatch(incrementByAmount("oops"))`.

Starter:

```tsx
// src/components/Counter.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from "../features/counter/counterSlice";

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState("2");

  // TODO: render count, +/- buttons, the amount input,
  // an "Add amount" button dispatching incrementByAmount(Number(amount)),
  // and a Reset button.
  return <div>Count: {count}</div>;
}
```

### 🛠️ Exercise 2: Memoized todo selectors
Extend the todos slice from section 4 with derived, memoized selectors.

1. Create `src/features/todos/selectors.ts`.
2. Write an input selector `selectTodoItems` that returns `state.todos.items`.
3. Build three memoized selectors with `createSelector`: `selectActiveTodos` (not done), `selectCompletedTodos` (done), and `selectStats` returning `{ total, active, completed }`.
4. Build a `TodoSummary.tsx` that consumes `selectStats` via `useAppSelector` and renders the three numbers.
5. **Verify the win:** dispatch an *unrelated* action (e.g. `increment()` on the counter) repeatedly and confirm `TodoSummary` does **not** re-render (add a `console.count("TodoSummary render")`). Then inline the filter directly in `useAppSelector` and observe it now re-renders on every dispatch — proving why `createSelector` matters.

Starter:

```typescript
// src/features/todos/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const selectTodoItems = (state: RootState) => state.todos.items;

export const selectActiveTodos = createSelector([selectTodoItems], (items) =>
  items.filter((t) => !t.done),
);

// TODO: selectCompletedTodos and selectStats ({ total, active, completed }).
export const selectStats = createSelector([selectTodoItems], (items) => ({
  total: items.length,
  active: 0, // TODO: count !done
  completed: 0, // TODO: count done
}));
```
