# React Hooks & Event Handling with TypeScript 🦾

Typing state hooks, DOM references, browser events, reducers, effects, and shared context is essential for building fully typed, secure React applications. TypeScript ensures that every value, element, and action exposes proper autocomplete and protects you from passing the wrong shape into the wrong place.

---

## 🌐 Concept & Overview

When you wire hooks together in plain JavaScript, React happily accepts whatever you give it and only complains at runtime — usually in front of a user. Adding TypeScript turns those silent runtime surprises into loud, helpful errors in your editor, *before* you ever hit save-and-refresh.

Think of TypeScript with hooks like the **labeled compartments in a professional toolbox**. In a messy drawer, any tool can go anywhere — you only discover you grabbed a screwdriver instead of a chisel when the wood splits. A labeled toolbox tells you *immediately* which slot expects which tool. Each hook is a compartment: `useState` is labeled with the shape of the value it holds, `useReducer` is labeled with the exact set of actions it accepts, `useContext` is labeled with the contract every consumer must honor, and event handlers are labeled with the precise DOM element they fire on.

> [!NOTE]
> TypeScript usually **infers** types from your initial values, so you write *less* code, not more. You only add explicit generics when inference cannot figure out the type on its own — for example when the initial value is `null`, or when a reducer must know its full universe of actions up front.

> [!TIP]
> Forgot the name of a React event type? Write the handler **inline** in JSX (e.g. `onClick={(e) => {}}`), hover the `e` parameter in VS Code, and copy the type the tooltip shows. This trick works for every event and is faster than memorizing the catalog.

### Where each hook fits

| Hook | What TypeScript types for you | When you add an explicit type |
| --- | --- | --- |
| `useState` | The state value + its setter | Initial value is `null`/`undefined`, or a union/object shape |
| `useRef` | `.current` (DOM node or mutable box) | Always pass the element type for DOM refs |
| Event handlers | Nothing automatically when extracted | When you move a handler out of inline JSX |
| `useReducer` | State + `dispatch`, narrowed per action | Define state type **and** a discriminated-union action type |
| `useEffect` | Nothing (it returns `void`/cleanup) | Type the **state** that stores fetched data |
| Context | The value every consumer receives | Pass a generic to `createContext` |

---

## ⚡ 1. Typing `useState`

TypeScript usually infers the type of state variables based on their initial value:

```tsx
const [count, setCount] = useState(0); // Inferred as: number
const [text, setText] = useState("");   // Inferred as: string
```

However, if your state is initialized to `null` or `undefined`, or can support multiple type shapes, you must define it using **Generics**:

```tsx
interface User {
  id: number;
  username: string;
}

// State can be either a User object OR null
const [user, setUser] = useState<User | null>(null);

const loginUser = () => {
  setUser({ id: 99, username: "admin" }); // Safe!
};
```

For object state that you update field-by-field, type the shape once and spread the previous value to keep the other fields intact:

```tsx
interface UserProfile {
  name: string;
  age: number;
  email: string;
}

const [profile, setProfile] = useState<UserProfile>({
  name: "",
  age: 0,
  email: "",
});

// Update a single field while preserving the rest
const updateName = (name: string) => {
  setProfile((prev) => ({ ...prev, name })); // prev is typed as UserProfile
};
```

---

## ⚡ 2. Typing `useRef`

`useRef` behaves differently depending on whether it is used for DOM elements or mutable values.

### A. DOM Reference (Read-only `.current`)
To target a DOM element, pass the HTML element interface name as a generic parameter, and initialize the ref with `null`:

```tsx
import { useRef, useEffect } from 'react';

export const TextInput = () => {
  // 1. Declare target input element type
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 2. Access DOM safely (use optional chaining)
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
};
```

*Common HTML element types include: `HTMLInputElement`, `HTMLButtonElement`, `HTMLDivElement`, `HTMLFormElement`.*

> [!WARNING]
> If a DOM ref's `.current` might be `null` at the moment you read it, TypeScript will flag `inputRef.current.value`. Prefer optional chaining (`inputRef.current?.value`) so your code stays safe. The non-null assertion (`inputRef.current!.value`) silences the check but removes the safety net — only use it when you are certain the element is mounted.

### B. Mutable Values (Writable `.current`)
If you are storing a value that persists without triggering re-renders, provide the type and do NOT pass null:

```tsx
const renderCount = useRef<number>(0);
renderCount.current += 1; // Can write directly
```

---

## ⚡ 3. Typing Events

Writing inline event handlers in JSX doesn't require manual types because React automatically infers them. However, when extracting event handlers into separate functions, you must annotate the event parameter manually:

```tsx
import React, { useState } from 'react';

export const UserForm = () => {
  const [email, setEmail] = useState("");

  // 1. Type input change events
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 2. Type click events
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked coordinates:", e.clientX, e.clientY);
  };

  // 3. Type form submit events
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting:", email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={handleEmailChange} />
      <button type="button" onClick={handleButtonClick}>Log Coordinates</button>
      <button type="submit">Submit Form</button>
    </form>
  );
};
```

> [!TIP]
> The generic on the event (`<HTMLButtonElement>`, `<HTMLFormElement>`) is the element the **listener is attached to** — it controls what `e.currentTarget` is. Pick it from the element you wrote the `onClick`/`onSubmit` on.

---

## ⚡ 4. Typing `useReducer`

When state logic gets complex — multiple sub-values that change together, or transitions that depend on the action taken — `useReducer` is cleaner than juggling several `useState` calls. With TypeScript you define three things: the **state type**, a **discriminated-union action type**, and a **typed reducer** that returns the state type.

A *discriminated union* is the secret sauce: every action shares a literal `type` field, so inside a `switch` TypeScript automatically **narrows** the action to exactly the right shape in each `case`. If you read `action.payload` in a case that has no payload, you get a compile error.

```tsx
import { useReducer } from "react";

// 1. The shape of the state the reducer owns
type CounterState = {
  count: number;
};

// 2. A discriminated union of every action the reducer accepts.
//    Each member has a literal `type` and optionally a payload.
type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "incrementBy"; payload: number }
  | { type: "reset" };

// 3. The reducer signature is fully typed: (state, action) => state
const counterReducer = (
  state: CounterState,
  action: CounterAction
): CounterState => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "incrementBy":
      // TypeScript KNOWS action.payload exists here (and is a number)
      return { count: state.count + action.payload };
    case "reset":
      return { count: 0 };
    default:
      return state; // safety fallback
  }
};

export const Counter = () => {
  // state is CounterState; dispatch only accepts CounterAction members
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      {/* The payload is required AND must be a number — anything else errors */}
      <button onClick={() => dispatch({ type: "incrementBy", payload: 5 })}>
        +5
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
};
```

> [!NOTE]
> Because `dispatch` is typed to `CounterAction`, a typo like `dispatch({ type: "incremnt" })` or a missing payload is caught instantly. The reducer and the components stay in sync forever — change the union in one place and every dispatch site updates its checks automatically.

For larger apps, extract the types and reducer into their own file (e.g. `reducers/counterReducer.ts`) and export them, then import the types where you initialize state:

```typescript
// reducers/counterReducer.ts
export type CounterState = { count: number };

export type CounterAction =
  | { type: "increment" }
  | { type: "decrement" };

export const counterReducer = (
  state: CounterState,
  action: CounterAction
): CounterState => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
};
```

---

## ⚡ 5. Typing `useEffect` (Fetching API Data)

`useEffect` itself returns nothing (or a cleanup function), so there is no generic to pass to it. The typing work happens around it: you type the **state** that holds the fetched data, and you await an `async` helper **defined inside** the effect (an effect callback itself must not be `async`, because it would return a Promise where React expects a cleanup function).

```tsx
import { useState, useEffect } from "react";

// 1. Describe the exact shape of the API response you care about
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

export const ProductCard = () => {
  // 2. Type the state: data is a Product OR null until it arrives
  const [data, setData] = useState<Product | null>(null);

  useEffect(() => {
    // 3. Define an async function INSIDE the effect, then call it.
    //    The effect callback stays synchronous.
    const fetchData = async () => {
      try {
        const response = await fetch("https://dummyjson.com/products/1");
        const result: Product = await response.json(); // assert the shape
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // 4. Empty dependency array → run once on mount

  // 5. Guard the render: data may still be null
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <p>ID: {data.id}</p>
      <p>{data.title}</p>
      <p>${data.price}</p>
      <img src={data.thumbnail} alt={data.title} />
    </div>
  );
};
```

> [!WARNING]
> Do **not** write `useEffect(async () => { ... }, [])`. An `async` function always returns a Promise, but React expects an effect to return either nothing or a cleanup function. Define the async helper inside and call it, as shown above.

The **dependency array** is also type-relevant: every value from props or state that the effect reads should be listed. With TypeScript and the `react-hooks` ESLint rule together, a forgotten dependency is flagged so your effect never reads a stale value.

---

## ⚡ 6. Typing the Context API

Context shares values across the tree without prop-drilling. With TypeScript you pass a generic to `createContext`, type the Provider's value, and — most importantly — write a **safe consumer hook** that throws a clear error when a component reads the context outside its Provider. That throw also *narrows away the `undefined`*, so consumers get a non-null typed value with zero extra guards.

```tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from "react";

// 1. The contract every consumer can rely on
interface CounterContextProps {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// 2. createContext generic. Start as `undefined` so we can detect
//    "used outside a Provider" instead of silently returning a fake default.
const CounterContext = createContext<CounterContextProps | undefined>(
  undefined
);

// 3. Typed Provider. children is typed with ReactNode.
export const CounterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);

  // The value object must satisfy CounterContextProps
  return (
    <CounterContext.Provider value={{ count, increment, decrement }}>
      {children}
    </CounterContext.Provider>
  );
};

// 4. Safe-consumer helper: throws outside the Provider, and the throw
//    NARROWS the type so the return value is never undefined.
export const useCounter = (): CounterContextProps => {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context; // typed as CounterContextProps (no undefined)
};
```

Consuming it stays clean — no null checks, full autocomplete:

```tsx
import { useCounter } from "./CounterContext";

export const CounterDisplay = () => {
  // count/increment/decrement are fully typed and guaranteed present
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};
```

Wrap the part of the tree that needs the value:

```tsx
import { CounterProvider } from "./CounterContext";
import { CounterDisplay } from "./CounterDisplay";

export const App = () => (
  <CounterProvider>
    <CounterDisplay />
  </CounterProvider>
);
```

> [!NOTE]
> Starting the context as `undefined` is intentional. It lets the `useCounter` hook detect misuse and fail with a readable message during development, instead of components rendering with a meaningless placeholder default that would only break later.

---

## 🧭 useState vs useReducer vs Context — When to Use Which

These three tools answer different questions: *how complex are my transitions?* and *how far does this state need to travel?*

| Criterion | `useState` | `useReducer` | Context API |
| --- | --- | --- | --- |
| Best for | Simple, independent values | Complex transitions / many related values | Sharing state across many components |
| State shape | Primitive or small object | Object with several fields that change together | Any value you must avoid prop-drilling |
| Update style | Direct setter calls | `dispatch(action)` with a typed reducer | Provider exposes the value + updaters |
| TypeScript focus | Generic when not inferable | State type + discriminated-union actions | `createContext` generic + safe consumer hook |
| Scope | Local to one component | Local to one component | App-wide / subtree-wide |
| Reach for it when | A toggle, a text field, a counter | A form wizard, undo/redo, a cart | Theme, auth user, a global counter |

A good rule of thumb: start with `useState`. Promote to `useReducer` when the update logic grows branchy or several values change in lockstep. Reach for **Context** only when *unrelated, distant* components need the same state — and note that you can put a `useReducer`'s `state` and `dispatch` *inside* a Context for app-wide complex state.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of hooks and events. Click **Reveal Answer** to verify.

### 1. When do you need to pass generic type arguments to `useState`?
<details>
  <summary><b>Reveal Answer</b></summary>

  You need to pass generic type arguments (e.g. `useState<Type>()`) when the type cannot be correctly inferred from the initial value. This occurs when:
  1. The initial value is `null` or `undefined` (e.g., fetching data later).
  2. The state holds a union of multiple possible types (e.g., `useState<"light" | "dark">("light")`).
  3. The state manages complex objects or arrays of items.
</details>

### 2. Why is a discriminated-union action type so useful with `useReducer`?
<details>
  <summary><b>Reveal Answer</b></summary>

  A discriminated union gives every action a shared literal `type` field (e.g. `{ type: "increment" }` vs `{ type: "incrementBy"; payload: number }`). Inside the reducer's `switch (action.type)`, TypeScript **narrows** the action to the exact member for each `case`, so it knows precisely which extra fields (like `payload`) exist. This means:
  - Reading a `payload` in a case that has none is a compile error.
  - `dispatch` rejects unknown action types and missing/wrong payloads.
  - The reducer and every dispatch site stay in sync automatically when you edit the union.
</details>

### 3. Why must the `async` function live *inside* `useEffect` instead of making the effect callback itself `async`?
<details>
  <summary><b>Reveal Answer</b></summary>

  An `async` function always returns a Promise. React expects the effect callback to return either nothing or a **cleanup function** — never a Promise. If you write `useEffect(async () => {...}, [])`, React would receive a Promise as the "cleanup," which is incorrect (and TypeScript flags it). The fix is to define an `async` helper (e.g. `fetchData`) inside the effect and call it synchronously, keeping the effect callback itself non-async.
</details>

### 4. Why do we initialize `createContext` with `undefined` and write a safe-consumer hook that throws?
<details>
  <summary><b>Reveal Answer</b></summary>

  Initializing with `undefined` (e.g. `createContext<CounterContextProps | undefined>(undefined)`) lets us detect when a component reads the context **outside its Provider**. The consumer hook (`useCounter`) checks for `undefined` and `throw`s a clear error like `"useCounter must be used within a CounterProvider"`. As a bonus, the `throw` **narrows the type** — after the guard, TypeScript knows the value is `CounterContextProps`, not `undefined`, so consumers get a fully typed value with no extra null checks. A fake default would instead let bugs render silently.
</details>

### 5. You have a single text input and a multi-step form wizard with shared, interdependent fields. Which hook fits each, and why?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Single text input → `useState`.** It is one simple, independent value; a direct setter is the least ceremony.
  - **Multi-step wizard → `useReducer`.** Several fields change together and transitions (next step, validate, reset) are branchy. A typed reducer with a discriminated-union action type centralizes that logic and keeps every transition type-safe.
  
  If those wizard values also needed to be read by distant, unrelated components, you would lift the `useReducer` into a **Context** so it can be shared without prop-drilling.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Canvas Coordinates Tracer & Typed Form
1. Create a component `CoordinatesForm.tsx` (ensure it uses the `.tsx` extension).
2. Set up state tracking coordinates: `const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)`.
3. Render a container `<div>` acting as a trace area. Track mouse movement over the container using:
   ```tsx
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   ```
4. Render the coordinates on screen. Include an input field to enter a label, capturing input via a typed `onChange` function (`React.ChangeEvent<HTMLInputElement>`).
5. Add a `useRef<HTMLInputElement>(null)` and a "Focus label" button whose `onClick` calls `inputRef.current?.focus()`.
6. Verify that VS Code provides complete autocomplete on your event variables and that `coords` is correctly narrowed before you read `coords.x`.

### 🛠️ Exercise 2: Typed Reducer + Context Cart
Build a tiny shopping cart that combines `useReducer` and Context.

1. Create `CartContext.tsx`. Define:
   - A state type: `type CartState = { items: { id: number; name: string }[] }`.
   - A discriminated-union action type:
     ```tsx
     type CartAction =
       | { type: "add"; payload: { id: number; name: string } }
       | { type: "remove"; payload: { id: number } }
       | { type: "clear" };
     ```
   - A typed reducer `cartReducer = (state: CartState, action: CartAction): CartState => { ... }` handling all three cases plus a `default`.
2. Create the context with `createContext<{ state: CartState; dispatch: React.Dispatch<CartAction> } | undefined>(undefined)`.
3. Build a typed `CartProvider` (`FC<{ children: ReactNode }>`) that calls `useReducer(cartReducer, { items: [] })` and provides `{ state, dispatch }`.
4. Write a safe-consumer hook `useCart()` that throws `"useCart must be used within a CartProvider"` when used outside the Provider, and returns the narrowed (non-`undefined`) value.
5. In a `CartView` component, consume `useCart()` to list items and wire buttons that dispatch `add`, `remove`, and `clear`. Confirm TypeScript blocks a dispatch with a missing or wrong `payload`.

### 🛠️ Exercise 3: Typed Data Fetch with `useEffect`
1. Create `UserList.tsx`. Define an interface `User { id: number; name: string; username: string; email: string; phone: string }`.
2. Add three typed states: `useState<User[]>([])`, `useState<boolean>(true)` for loading, and `useState<string | null>(null)` for an error.
3. Inside `useEffect(() => { ... }, [])`, define an `async` `fetchUsers` helper that fetches `https://jsonplaceholder.typicode.com/users`, checks `response.ok`, assigns `const data: User[] = await response.json()`, and stores it. Handle errors in a `catch` (using `error instanceof Error ? error.message : "An error occurred"`) and set loading to `false` in `finally`.
4. Render `Loading...` while loading, the error message if present, otherwise a `<table>` of users keyed by `user.id`.
5. Confirm there are no `any` types and that removing a column from the `User` interface produces a compile error where you render it.
