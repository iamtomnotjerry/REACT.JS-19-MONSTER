# New React 19 Hooks & the `use` API 🔥

React 19 introduces four powerful hooks and API paradigms designed to coordinate complex asynchronous form workflows, optimistic rendering updates, and dynamic resource loading directly inside component render trees.

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
  // e.target.pending automatically captures the active status
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving Changes..." : "Save"}
    </button>
  );
};
```

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

## ⚡ 4. The `use` API (Conditional Promise & Context Resolver)

Before React 19, hooks had to follow a strict top-level rule and could not be used conditionally inside `if` statements or nested loops.

The **`use`** API is a new paradigm that can read Promises or Context values directly **during rendering, conditionally**:

```jsx
import { use } from 'react';

// Resolves a Context conditionally inside an 'if' block!
const InfoCard = ({ showDetails, MyContext }) => {
  if (showDetails) {
    const contextValue = use(MyContext); // Completely valid inside 'if' statements!
    return <p>Secret Details: {contextValue}</p>;
  }
  return <p>Details are hidden</p>;
};
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

### 2. Can you call `useFormStatus` in the same component that renders the parent `<form>` element?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. `useFormStatus` works like a standard React Context consumer. It searches upwards in the tree for an ancestor `<form>` provider. If you call it in the same component that declares the `<form>` tag, the provider is not an ancestor, and the hook will return `pending: false` and fail to detect status updates.
</details>

### 3. How does `useOptimistic` handle failures?
<details>
  <summary><b>Reveal Answer</b></summary>

  When the async action finishes execution, React automatically flushes the temporary optimistic state and re-renders using the actual component state. If the API fails and you choose not to update the actual state (`setMessages`), the UI rolls back to its original state automatically, removing the temporary item.
</details>

### 4. What makes the `use` API different from standard hooks like `useContext`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Standard hooks like `useContext` are strictly bound by the Rules of Hooks: they must be declared at the top-level of the component function, and cannot be placed inside `if` conditionals, `for` loops, or switch statements. The `use` API breaks this constraint and can be called dynamically and conditionally inside any block.
</details>

### 5. What React wrapper component must you use when resolving Promises inside a component using the `use` API?
<details>
  <summary><b>Reveal Answer</b></summary>

  You must wrap the component in a **`<Suspense>`** boundary. Because resolving a Promise halts rendering, Suspense provides a fallback indicator (like a loading spinner) to show on screen while the Promise is waiting to resolve.
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
