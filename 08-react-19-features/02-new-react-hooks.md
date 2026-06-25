# New React 19 Hooks & the `use` API 🔥

React 19 introduces a family of powerful hooks and API paradigms designed to coordinate complex asynchronous form workflows, optimistic rendering updates, non-blocking UI transitions, and dynamic resource loading directly inside component render trees.

---

## 🧭 Concept & Overview

Before React 19, building a form that talked to a server meant juggling several `useState` flags by hand: one for the data, one for `isLoading`, one for the error message, and yet another to optimistically update the UI. React 19 collapses all of that boilerplate into a small set of purpose-built hooks (`useActionState`, `useFormStatus`, `useOptimistic`, `useTransition`) plus the new `use` API.

**Real-world metaphor — the restaurant kitchen:** 🍳
Imagine you order food at a busy restaurant.

- `useActionState` is the **waiter** who takes your order (the action), walks it to the kitchen, and comes back with the result — and can tell you "still cooking" (`isPending`) the whole time.
- `useFormStatus` is the **kitchen status board** that any cook can glance at to see whether an order is currently in progress, without the waiter personally telling each one.
- `useOptimistic` is the **bread basket** placed on your table *immediately* so the meal feels like it started, even before the main dish is confirmed.
- `useTransition` is the **expediter** who lets urgent tasks (someone asking for water) jump ahead of a slow bulk order, so the dining room never freezes.
- `use` is a **flexible runner** who can fetch a resource (a Promise) or read a posted notice (Context) on demand, even mid-task.

> [!NOTE]
> `useActionState` and `useOptimistic` are imported from `react`, but **`useFormStatus` is imported from `react-dom`**. Mixing these up is one of the most common React 19 beginner errors.

> [!TIP]
> These hooks are designed to work together. A typical React 19 form uses `useActionState` on the parent `<form>`, a nested `<SubmitButton>` powered by `useFormStatus`, and `useOptimistic` to render the pending item instantly. They are complementary, not competing.

> [!WARNING]
> The `use` API can read a Promise during render, which means it can **suspend** the component. Any component that calls `use(promise)` MUST have a `<Suspense>` boundary somewhere above it, or React will throw.

### At-a-glance comparison

| Hook / API | Imported from | Primary job | Returns a pending flag? |
| :--- | :--- | :--- | :--- |
| `useActionState` | `react` | Wrap an async action + track its state | ✅ `isPending` (3rd element) |
| `useFormStatus` | `react-dom` | Read parent `<form>` status from a child | ✅ `pending` (object field) |
| `useOptimistic` | `react` | Render an expected result instantly | ❌ (you model `sending` yourself) |
| `useTransition` | `react` | Mark state updates as non-blocking | ✅ `isPending` (1st element) |
| `use` | `react` | Resolve a Promise or Context during render | ❌ (suspends via `<Suspense>`) |

---

## ⚡ 1. `useActionState` (Asynchronous Form State Wrapper)

Formerly called `useFormState` in the experimental builds, **`useActionState`** is the primary hook for handling forms. It wraps a custom async action function and returns:
1. **The State**: The current returned result of the action (initialized to whatever default you set).
2. **The Form Action Wrapper**: A wrapped version of the action to pass directly to `<form action={formAction}>`.
3. **`isPending`**: A built-in boolean flag indicating whether the async action is currently executing.

```jsx
import { useActionState } from 'react';

// 1. Define the action function: receives (previousState, formData)
const subscribeUser = async (prevState, formData) => {
  const email = formData.get("email");

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!email.includes("@")) {
    return { success: false, message: "Invalid email address!" };
  }
  return { success: true, message: `Subscribed ${email} successfully! 🎉` };
};

export const NewsletterForm = () => {
  // 2. Initialize useActionState: returns [state, formAction, isPending]
  const [state, formAction, isPending] = useActionState(subscribeUser, { success: false, message: "" });

  return (
    <form action={formAction} style={styles.card}>
      <h3>Newsletter Subscribe</h3>
      <input type="email" name="email" placeholder="Your email..." required />

      <button type="submit" disabled={isPending}>
        {isPending ? "Subscribing..." : "Subscribe"}
      </button>

      {state.message && (
        <p style={{ color: state.success ? "green" : "red", marginTop: "10px" }}>
          {state.message}
        </p>
      )}
    </form>
  );
};

const styles = { card: { maxWidth: "300px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" } };
```

---

## ⚡ 2. `useFormStatus` (Form Context Tracking)

**`useFormStatus`** is a context hook. It allows child elements nested deep inside a `<form>` to automatically detect whether the parent form is pending, without you needing to manually pass down state props:

```jsx
import { useFormStatus } from 'react-dom';

// This component MUST be rendered inside a <form> ancestor
export const SubmitButton = () => {
  // The hook reads the status of the closest parent <form>
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving Changes..." : "Save"}
    </button>
  );
};
```

> [!WARNING]
> `useFormStatus` reads the status of the **closest parent `<form>`** — like a Context consumer searching upward. If you call it inside the very same component that *renders* the `<form>` tag, the form is not an ancestor and `pending` will always be `false`. Always put the hook in a **child** component.

### 🔍 `useFormStatus` (context-based) vs `isPending` from `useActionState` (hook return)

Both tell you "is the form busy?" — but they get the answer in fundamentally different ways. Choosing the right one depends on *where* your button lives in the tree.

| Aspect | `useFormStatus().pending` | `isPending` from `useActionState` |
| :--- | :--- | :--- |
| **How you get it** | Reads it from React **Context** of the nearest parent `<form>` | Returned **directly** as the 3rd element of the hook |
| **Where you can use it** | In a **child** component nested inside the `<form>` | Only in the component that **called** `useActionState` |
| **Import source** | `react-dom` | `react` |
| **Needs the action?** | No — it does not know which action ran | Yes — it is tied to the specific wrapped action |
| **Best for** | Reusable `<SubmitButton>` shared across many forms | Showing status/result right next to the form definition |
| **Extra data exposed** | `data`, `method`, `action` of the submission | Only the boolean + your returned `state` |

> [!TIP]
> Use **`useActionState`'s `isPending`** when the button and the form live in the same component. Reach for **`useFormStatus`** when you want a *decoupled, reusable* submit button that can be dropped into any form without prop drilling.

---

## ⚡ 3. `useOptimistic` (Instant Optimistic UI Updates)

**`useOptimistic`** is a hook designed to make user interfaces feel instantaneous. During asynchronous API updates (like sending a chat message), it allows you to temporarily render the expected "successful" result immediately. If the API succeeds, the real state is rendered; if it fails, it rolls back:

```jsx
import { useOptimistic, useState } from 'react';

export const ChatApp = () => {
  const [messages, setMessages] = useState([{ id: 1, text: "Hello!" }]);

  // Create optimistic state
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // Reducer-like function: merges existing array with a temporary element
    (state, newText) => [...state, { id: Date.now(), text: newText, sending: true }]
  );

  const sendMessageAction = async (formData) => {
    const text = formData.get("message");
    if (!text.trim()) return;

    // 1. Immediately trigger the optimistic UI update
    addOptimisticMessage(text);

    // 2. Perform real async API fetch
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay

    // 3. Confirm in actual component state
    setMessages((prev) => [...prev, { id: Date.now(), text }]);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h3>Chat (useOptimistic)</h3>
      <div style={{ border: "1px solid #ccc", height: "200px", padding: "10px", overflowY: "auto", marginBottom: "15px" }}>
        {optimisticMessages.map((msg) => (
          <p key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
            {msg.text} {msg.sending && <small>(sending...)</small>}
          </p>
        ))}
      </div>
      <form action={sendMessageAction}>
        <input type="text" name="message" placeholder="Type a message..." required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
```

---

## ⚡ 4. `useTransition` (Non-Blocking Updates & Deferred Renders)

Some state updates trigger expensive renders — imagine clicking a tab that mounts hundreds of cards. Without help, React renders that update **synchronously and blocks the main thread**: the whole UI freezes, and you cannot click anything else until the heavy render finishes.

**`useTransition`** lets you mark a state update as a low-priority **transition**. React keeps the UI responsive — urgent interactions (clicks, typing) jump ahead, while the expensive update renders in the background. It returns a tuple:
1. **`isPending`**: a boolean that is `true` while the deferred update is rendering.
2. **`startTransition`**: a function you wrap your slow state update in.

> [!NOTE]
> `useTransition` does NOT make rendering faster. It makes the app *feel* faster by keeping it interruptible. You reach for it rarely — only when a single state change triggers a genuinely heavy render that would otherwise lock the page.

### The problem (without `useTransition`)

```jsx
import { useState } from 'react';
import { Home } from './components/Home';
import { Post } from './components/Post';
import { Contact } from './components/Contact';

export const App = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <Home />;
      case "post": return <Post />;   // <-- renders hundreds of heavy items
      case "contact": return <Contact />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="tabs">
        {/* Clicking "post" freezes the whole UI until everything renders */}
        <button onClick={() => setActiveTab("home")}>Home</button>
        <button onClick={() => setActiveTab("post")}>Post</button>
        <button onClick={() => setActiveTab("contact")}>Contact</button>
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  );
};
```

### The fix (with `useTransition`)

```jsx
import { useState, useTransition } from 'react';
import { Home } from './components/Home';
import { Post } from './components/Post';
import { Contact } from './components/Contact';

export const App = () => {
  const [activeTab, setActiveTab] = useState("home");

  // isPending: true while the deferred render is in flight
  // startTransition: wraps the non-urgent state update
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab) => {
    // Mark this state update as a low-priority transition.
    // The UI stays interactive while <Post /> renders in the background.
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <Home />;
      case "post": return <Post />;
      case "contact": return <Contact />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="tabs">
        <button onClick={() => handleTabChange("home")}>Home</button>
        <button onClick={() => handleTabChange("post")}>Post</button>
        <button onClick={() => handleTabChange("contact")}>Contact</button>
      </div>

      {/* While the heavy tab renders, show a non-blocking indicator */}
      {isPending && <p>Loading...</p>}

      <div className="content">{renderContent()}</div>
    </div>
  );
};
```

> [!WARNING]
> Only wrap **state updates** in `startTransition`, never side effects like data mutations or `await`-ed fetches you depend on for ordering. The callback should be synchronous and contain `setState` calls. For async server work, prefer `useActionState`.

---

## ⚡ 5. The `use` API (Conditional Promise & Context Resolver)

Before React 19, hooks had to follow a strict top-level rule and could not be used conditionally inside `if` statements or nested loops.

The **`use`** API is a new paradigm that can read Promises or Context values directly **during rendering, conditionally**:

```jsx
import { use, Suspense } from 'react';

// Resolves a Context conditionally inside an 'if' block!
const InfoCard = ({ showDetails, MyContext }) => {
  if (showDetails) {
    const contextValue = use(MyContext); // Completely valid inside 'if' statements!
    return <p>Secret Details: {contextValue}</p>;
  }
  return <p>Details are hidden</p>;
};

// Reading a Promise with use() requires a <Suspense> boundary above it
const UserName = ({ userPromise }) => {
  const user = use(userPromise); // Suspends until the promise resolves
  return <p>Welcome, {user.name}!</p>;
};

export const Profile = ({ userPromise }) => (
  <Suspense fallback={<p>Loading user...</p>}>
    <UserName userPromise={userPromise} />
  </Suspense>
);
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these new React 19 APIs. Click **Reveal Answer** to verify.

### 1. What parameters does the action function passed to `useActionState` receive?
<details>
  <summary><b>Reveal Answer</b></summary>

  The wrapped action function receives two parameters:
  1. `state`: The previous returned value of the state (or the initial value on the first call).
  2. `formData`: The native browser `FormData` object containing the form inputs.
</details>

### 2. How does `useFormStatus` differ from the `isPending` value returned by `useActionState`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useFormStatus` (imported from `react-dom`) reads the pending state from **React Context** of the nearest parent `<form>`, so it must be called in a **child** component nested inside that form — it is ideal for a reusable, decoupled `<SubmitButton>`. In contrast, `isPending` from `useActionState` (imported from `react`) is returned **directly** as the third element of the hook and is only available in the component that called the hook; it is tied to that specific wrapped action. Use `isPending` when the button lives in the same component as the form; use `useFormStatus` when you want a shared submit button without prop drilling.
</details>

### 3. How does `useOptimistic` handle failures?
<details>
  <summary><b>Reveal Answer</b></summary>

  When the async action finishes execution, React automatically flushes the temporary optimistic state and re-renders using the actual component state. If the API fails and you choose not to update the actual state (`setMessages`), the UI rolls back to its original state automatically, removing the temporary item.
</details>

### 4. What problem does `useTransition` solve, and what does it return?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useTransition` solves UI **freezing** caused by expensive, synchronous renders (for example, switching to a tab that mounts hundreds of items). By wrapping the state update inside `startTransition`, you mark it as a low-priority **transition**, so React keeps the page interactive and renders the heavy update in the background. It returns a tuple: `[isPending, startTransition]` — `isPending` is `true` while the deferred render is in flight (handy for showing a "Loading..." indicator), and `startTransition` is the function you wrap your non-urgent `setState` call in. Note that it does not make rendering faster; it makes the app feel responsive by keeping it interruptible.
</details>

### 5. What React wrapper component must you use when resolving Promises inside a component using the `use` API?
<details>
  <summary><b>Reveal Answer</b></summary>

  You must wrap the component in a **`<Suspense>`** boundary. Because resolving a Promise halts (suspends) rendering, Suspense provides a fallback indicator (like a loading spinner) to show on screen while the Promise is waiting to resolve.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Form Status Button component
1. Create a component `FormStatusDemo.tsx` (or `.jsx`).
2. Create a child button component `<StatusBtn />` that uses `useFormStatus()`. Disable the button and change its text to `"Adding Item..."` if the form state is pending.
3. Render a form with a text input box in the parent `FormStatusDemo`.
4. Wrap the form submission with an async action that delays for 3 seconds:
   ```javascript
   const submitAction = async (formData) => {
     await new Promise(r => setTimeout(r, 3000));
     alert("Saved successfully!");
   };
   ```
5. Nest `<StatusBtn />` inside the form. Run the project to verify that the button status is automatically updated without using parent state hooks.

> [!TIP]
> Confirm the lesson's key rule: try calling `useFormStatus()` directly inside `FormStatusDemo` (next to the `<form>` tag) and watch `pending` stay `false`. Then move it back into the nested `<StatusBtn />` child and watch it work again.

### 🛠️ Exercise 2: Non-blocking tab switcher with `useTransition`
1. Create an `App.tsx` with three buttons — **Home**, **Post**, and **Contact** — and a `useState` for `activeTab`.
2. Build a heavy `<Post />` component that renders many items so the render is expensive:
   ```jsx
   export const Post = () => {
     // Generate a large list to make rendering noticeably slow
     const posts = Array.from({ length: 5000 }, (_, index) => `Post ${index + 1}`);
     return (
       <div>
         {posts.map((post) => (
           <div className="post" key={post}>{post}</div>
         ))}
       </div>
     );
   };
   ```
3. First wire the tabs **without** `useTransition` (call `setActiveTab` directly). Click **Post**, then immediately try clicking **Home** or **Contact** — notice the UI is frozen until the heavy render finishes.
4. Now refactor: pull `const [isPending, startTransition] = useTransition();` and route clicks through a `handleTabChange(tab)` that wraps `setActiveTab(tab)` inside `startTransition(...)`.
5. Render `{isPending && <p>Loading...</p>}` above the content. Re-test: clicking **Post** should show "Loading..." while the other tabs remain instantly clickable.
6. **Reflect:** Did `useTransition` make the render *faster*, or just keep the app *responsive*? Write a one-line comment in your code with the answer.
