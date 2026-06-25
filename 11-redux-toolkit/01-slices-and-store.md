# Redux Toolkit: Slices & Store Configuration 🔄

**Redux Toolkit (RTK)** is the modern, official, and recommended way to write Redux logic. It was created to solve the three common complaints of legacy Redux: complex store setups, too much boilerplate code, and having to configure multiple packages manually.

---

## 📖 Concept & Overview

**Redux** is an open-source JavaScript library for managing state in a **predictable** way. The keyword here is *state*. In React you already manage state with `useState`, `useReducer`, and `useContext`. Redux solves the same problem, but at the scale of an entire application — a single, central place where any component can read and update shared data.

**Redux Toolkit** is described by the official docs as *"the official, opinionated, batteries-included toolset for efficient Redux development."* In plain English: it is still Redux under the hood, but it ships with sensible defaults and helpers so you write far less code.

> [!IMPORTANT]
> A very common misconception is that **React and Redux are the same thing**. They are not. React is a UI library; Redux is a standalone state-management library that *can* be used with React (via the `react-redux` bindings) — or with Angular, Vue, or vanilla JavaScript. Throughout this lesson, whenever we say "Redux" we mean **Redux Toolkit**.

> [!NOTE]
> Redux Toolkit is the **officially recommended** way to write Redux logic today. The legacy "Redux core" (hand-writing action types, action creators, and switch-statement reducers) still works, but the Redux team now steers everyone toward RTK. You should not start a new project with plain Redux core.

> [!TIP]
> You only need Redux when state is genuinely **global and shared** across many distant parts of the tree. For local, component-scoped state, `useState` is still the right tool. Reaching for Redux too early adds ceremony you do not need.

---

## 🌍 The Real-World Metaphor: A Central Warehouse

Imagine the classic **prop-drilling problem**. Your `App` component holds some important data, and a deeply nested `Data` component needs it:

```
App (has the data)
 └── Card
      └── User
           └── Data (needs the data)
```

With plain props you must thread the data through `Card → User → Data` even though `Card` and `User` do not care about it. That repetition is fragile and noisy. The Context API helps, but at the scale of a company like Google or Facebook — with *countless* components — wiring providers everywhere becomes unwieldy.

Redux Toolkit takes a different approach. Picture a **central warehouse (the Store)** that lives *outside* your component tree. You put your shared inventory (state) in the warehouse once. Then any component — the header, the card, the footer, the deeply nested `Data` component — can walk up to the warehouse counter and **read** what it needs or hand over a **request slip (action)** to change the inventory. No middle component has to carry boxes it does not care about.

- **Store** = the warehouse (the single source of truth).
- **Slice** = one labeled shelf in the warehouse (e.g. the "counter" shelf, the "todos" shelf).
- **Reducer** = the worker's instructions for *how* to change a shelf.
- **Action** = the request slip ("add one", "remove one") you dispatch to the worker.

> [!WARNING]
> The Store lives **outside** your React tree, but components cannot magically reach it. You must wrap your app in `<Provider>` so the store is injected via React Context. Forgetting the `<Provider>` is the single most common beginner error — `useSelector`/`useDispatch` will throw *"could not find react-redux context value"*.

### Redux core vs Redux Toolkit vs Context API

| Aspect | Redux Core (legacy) | Redux Toolkit (RTK) ✅ | Context API |
|---|---|---|---|
| **Purpose** | Global state | Global state | Dependency injection / lightweight sharing |
| **Boilerplate** | Heavy: action types, creators, switch reducers | Minimal: `createSlice` generates them | Low, but no update logic built in |
| **Immutability** | Manual (spread operators everywhere) | Automatic via **Immer** (write "mutating" code) | You manage state yourself (usually `useState`) |
| **DevTools** | Manual setup | Built in via `configureStore` | None |
| **Async / data fetching** | Add `redux-thunk` / `redux-saga` manually | Thunk included; RTK Query for data fetching | Not provided |
| **Best for** | Legacy codebases | New apps with large shared state | Theme, auth user, locale; few, rarely-changing values |
| **Re-render behavior** | Subscribed components only | Subscribed components only (`useSelector`) | **Every consumer re-renders** when value changes |

The takeaway: Context is excellent for a handful of stable values (theme, current user). Once you have many components mutating shared state frequently, RTK gives you structure, performance, and tooling that raw Context cannot.

---

## ⚡ 1. Installation

To add Redux Toolkit and its React bindings to your project, run:

```bash
# @reduxjs/toolkit  -> the Redux Toolkit core (createSlice, configureStore, etc.)
# react-redux        -> the binding layer that connects Redux to React components
npm install @reduxjs/toolkit react-redux
```

---

## 🧩 2. Creating a Slice (`createSlice`)

A **Slice** is a Redux Toolkit concept that groups the initial state, reducer logic, and action creators for a specific feature into a single file.

Think back to the warehouse metaphor: if the whole store is a big cake, a **slice** is one manageable piece of that cake — a smaller part of your overall state *plus* the instructions for how to change it.

### ⚠️ The Magic of Immer
Normally, Redux state must be updated immutably (e.g. using the spread operator). However, RTK uses the **Immer** library under the hood. This allows you to write "mutative" code (like `state.value += 1` or `state.todos.push(newItem)`) inside your reducers. Immer intercepts these mutations and automatically compiles them into safe, immutable state updates.

> [!CAUTION]
> The "write mutating code" superpower **only works inside `createSlice` reducers** (and `createReducer`). Immer is not active in your components, helpers, or event handlers. Mutating an object directly outside a reducer bypasses React's change detection and causes silent, hard-to-debug rendering bugs.

Create `src/features/counterSlice.js` and insert the following code:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  title: "RTK Counter"
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 1. Immer allows writing direct mutations safely!
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // 2. Actions can receive payloads via action.payload
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    }
  }
});

// Export auto-generated action creators
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Export the reducer to register in the store
export default counterSlice.reducer;
```

> [!NOTE]
> The action **type strings** are generated for you in the format `sliceName/reducerName` — e.g. `counter/increment`. You never hand-write action type constants again, which removes a whole class of typo bugs.

---

## 🧩 3. Configuring the Store (`configureStore`)

The **Store** is the global database (our warehouse) containing all slice reducers. We configure it using **`configureStore`**, which automatically sets up Redux DevTools and middleware (like Thunk):

Create `src/app/store.js` and insert the following code:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // Register slice reducers here
  }
});
```

> [!TIP]
> The key you choose here (`counter`) becomes the path you read from later. `state.counter.value` in a selector maps directly to this `counter` key plus the `value` field from the slice's `initialState`. Keep these names intentional and consistent.

---

## 🧩 4. Providing the Store to React (`Provider`)

To make the Redux store available to all React components, wrap your application root with the **`<Provider>`** component from `react-redux`:

Modify `src/main.jsx` (or your root file):

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

---

## 🧩 5. Reading & Updating State in Components

The store is useless until a component talks to it. `react-redux` gives you two hooks:

- **`useSelector`** — reads (selects) a piece of data from the store.
- **`useDispatch`** — returns the `dispatch` function so you can send actions to change the store.

Create `src/components/Counter.jsx`:

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../features/counterSlice';

function Counter() {
  // READ: select the value from the store.
  // state.counter -> the "counter" key in configureStore
  // .value        -> the field from the slice's initialState
  const count = useSelector((state) => state.counter.value);

  // GET the dispatch function used to send actions to the store.
  const dispatch = useDispatch();

  return (
    <div>
      <h1>{count}</h1>
      {/* Dispatch the action creators (call them so they RETURN an action object) */}
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}

export default Counter;
```

> [!WARNING]
> Notice the parentheses: `dispatch(increment())`, **not** `dispatch(increment)`. The action creator is a *function* — you must call it so it returns the action object `{ type: 'counter/increment' }` for `dispatch` to send. Forgetting the inner `()` is a frequent silent bug.

That completes the full Redux Toolkit flow: **Slice → Store → Provider → useSelector/useDispatch**.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Redux Toolkit. Click **Reveal Answer** to verify.

### 1. What three problems does Redux Toolkit solve compared to legacy Redux?
<details>
  <summary><b>Reveal Answer</b></summary>

  Redux Toolkit solves:
  1. **Complex Store Configurations**: Setup is simplified using `configureStore`.
  2. **Boilerplate Bloat**: `createSlice` combines actions and reducers, removing the need for separate action type constants and creators.
  3. **Package Overhead**: RTK includes essential tools (like Redux DevTools and Redux Thunk) built-in by default.
</details>

### 2. How does the Immer library work inside `createSlice`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Immer wraps your state updates inside a proxy tree. It allows you to write standard mutable commands (like `.push()` or assignments `state.x = y`). Immer tracks these operations, creates a draft state under the hood, and compiles them into clean, immutable objects before committing them to the store.
</details>

### 3. Can you write mutable state updates outside of `createSlice` reducers?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Immer is only active inside the reducer functions defined within `createSlice`. Writing mutable state code in components, helpers, or other areas will mutate your objects directly, violating Redux principles and causing silent rendering bugs.
</details>

### 4. What is the format of the action object generated by `createSlice`?
<details>
  <summary><b>Reveal Answer</b></summary>

  The actions conform to the **FSA (Flux Standard Action)** format:
  ```javascript
  {
    type: "counter/incrementByAmount", // Format: [sliceName]/[reducerName]
    payload: 10 // The value passed during execution
  }
  ```
</details>

### 5. Why is the React-Redux `<Provider>` component necessary?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `<Provider>` component uses React's Context API to make the global Redux store available to any nested components down the tree, allowing hooks like `useSelector` and `useDispatch` to interact with the store. Without it, those hooks throw an error because they cannot find the store.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Build a Task Management Slice
1. Create a slice named `todoSlice.js` in `src/features/`.
2. Set the initial state to `{ list: [] }`.
3. Support three reducers inside the slice:
   - `addTodo(state, action)`: Pushes a new todo object `{ id: Date.now(), text: action.payload, completed: false }` directly into `state.list` (utilizing Immer).
   - `toggleTodo(state, action)`: Finds the todo matching `action.payload` (the todo ID) and toggles its `completed` state.
   - `deleteTodo(state, action)`: Removes the matching todo from the list.
4. Register the `todoSlice` reducer in your global `store.js` file under the key `todos`.
5. **Wire it up in the UI**: Build a `TodoList.jsx` component that uses `useSelector((state) => state.todos.list)` to read the todos and `useDispatch` to dispatch `addTodo`, `toggleTodo`, and `deleteTodo`. Verify items appear, toggle a strikethrough, and disappear when deleted.

### 🛠️ Exercise 2: Extend the Counter with a Payload Action
1. Open `counterSlice.js` and confirm the `incrementByAmount` and `reset` reducers exist.
2. In your `Counter.jsx`, add a number input whose value you store in local `useState`.
3. Add an **"Add Amount"** button that dispatches `incrementByAmount(Number(inputValue))` — proving you understand `action.payload`.
4. Add a **"Reset"** button that dispatches `reset()`.
5. **Bonus**: Open the Redux DevTools browser extension and watch the dispatched actions (`counter/incrementByAmount`, `counter/reset`) appear in the timeline, inspecting the `payload` and resulting state for each.
