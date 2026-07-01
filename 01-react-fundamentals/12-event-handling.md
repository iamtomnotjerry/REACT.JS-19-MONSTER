# Event Handling in React ⚡

React allows you to handle user interactions (like clicks, mouse movements, form submissions, and key presses) easily. React events are named using camelCase (like `onClick`) instead of lowercase (like `onclick` in HTML), and you pass a JavaScript function as the event handler rather than a string.

---

## ⚡ 1. Standard Event Syntax

Here is how you handle a button click in React:

### Option A: Using a Named Function (Recommended)
This approach is clean and keeps your JSX organized, especially for complex handler logic.

```jsx
const ClickButton = () => {
  const handleClick = () => {
    alert("Button was clicked! 🚀");
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```
> [!IMPORTANT]
> When referencing the function, **do not call it with parentheses** (do NOT write `onClick={handleClick()}`). 
> Writing parentheses calls the function immediately during the render phase, rather than waiting for the user to click.

### Option B: Using an Inline Arrow Function
Useful for short, single-line actions.

```jsx
const ClickButton = () => {
  return (
    <button onClick={() => alert("Inline click handled! ⚡")}>
      Click Me
    </button>
  );
};
```

---

## 🌟 2. Passing Arguments to Event Handlers

If you need to pass custom arguments to your event handler, wrap the handler in an anonymous arrow function:

```jsx
const UserActions = () => {
  const greetUser = (name) => {
    alert(`Hello, ${name}!`);
  };

  // We wrap the function call in an arrow function so it isn't executed immediately
  return (
    <button onClick={() => greetUser("Monster Coder")}>
      Greet User
    </button>
  );
};
```

---

## ⚙️ 3. The Synthetic Event Object (`e`) & Preventing Defaults

When an event handler is triggered, React automatically passes an **Event Object** (conventionally named `e` or `event`) as the first argument to the handler function. 
React's event object is called a **SyntheticEvent**. It is a cross-browser wrapper around the browser's native event, ensuring the exact same behavior across Safari, Chrome, Edge, and Firefox.

### A. Accessing Input Values
You can inspect what the user typed in an input element using `e.target.value`:
```jsx
const InputField = () => {
  const handleInputChange = (e) => {
    console.log("User typed:", e.target.value);
  };

  return <input type="text" onChange={handleInputChange} />;
};
```

### B. Preventing Default Action (`e.preventDefault()`)
Many HTML elements have built-in default behaviors. For example, clicking a submit button in a form automatically reloads the entire webpage. You can stop this default behavior by calling `e.preventDefault()`:

```jsx
const FormComponent = () => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Stop page reload!
    console.log("Form submitted safely without reload.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Enter info" />
      <button type="submit">Submit Form</button>
    </form>
  );
};
```

---

## 🧠 Test Your Knowledge (Interview Prep)

Answer these questions to check your understanding of Event Handling. Click **Reveal Answer** to verify.

### 1. What is the difference between `onClick={handleClick}` and `onClick={handleClick()}`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `onClick={handleClick}` passes the function reference to React, so it runs **only when the user clicks**.
  - `onClick={handleClick()}` executes the function **immediately when the component renders**, which is usually a bug and can cause infinite re-render loops if the function updates state.
</details>

### 2. What is the Event object `e` and what does `e.preventDefault()` do?
<details>
  <summary><b>Reveal Answer</b></summary>

  The event object `e` is an object automatically passed by React containing metadata about the triggered event (e.g., target element, click coordinates). `e.preventDefault()` is used to block the browser's default action associated with the event, such as preventing a page reload when submitting a `<form>`.
</details>

### 3. What is a SyntheticEvent in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  React wraps the native browser events in a custom **SyntheticEvent** object to ensure they behave consistently across all browsers and operating systems, solving cross-compatibility issues automatically.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Click & Hover Logger
1. Create a component `ButtonConsole.jsx` inside `src/components/`.
2. Render a button that console-logs `"Click event fired!"` when clicked.
3. Render a paragraph `<p>` that console-logs `"Mouse hover event fired!"` when the mouse enters its area (using `onMouseEnter`).
4. Import and render `<ButtonConsole />` inside `App.jsx`.

### 🛠️ Exercise 2: Form reload prevention
1. Create a component `FormSubmit.jsx` inside `src/components/`.
2. Render a `<form>` containing an `<input>` field and a `<button type="submit">`.
3. Set up an `onSubmit` handler that calls `e.preventDefault()`, logs the message `"Form submission intercepted! No page reload occurred."` in the console, and alerts the message.
4. Render `<FormSubmit />` in `App.jsx` and test submitting it. Verify that the browser page does not reload!
