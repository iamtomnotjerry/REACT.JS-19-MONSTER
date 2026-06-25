# Event Handling in React ⚡

React allows you to handle user interactions (like clicks, mouse movements, form submissions, and key presses) easily. React events are named using camelCase (like `onClick`) instead of lowercase (like `onclick` in HTML), and you pass a JavaScript function as the event handler rather than a string.

---

## ⚡ 1. Standard Event Syntax

Here is how you handle a button click in React:

### Option A: Using a Named Function (Recommended)
This approach is clean, especially for complex event handler logic.

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
Useful for short, simple actions.

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

## 🖱️ 3. Other Common Mouse Events

React supports all standard browser events, mapping them to camelCase:

```jsx
const HoverBox = () => {
  const handleMouseMove = () => {
    console.log("Mouse moved over the box!");
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ padding: "50px", border: "1px solid black" }}
    >
      Hover over me and check console!
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Event Handling. Click **Reveal Answer** to verify.

### 1. What is the difference between `onClick={handleClick}` and `onClick={handleClick()}`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `onClick={handleClick}` passes the function reference to React, so it runs **only when the user clicks**.
  - `onClick={handleClick()}` executes the function **immediately when the component renders**, which is usually a bug and can cause infinite re-render loops if the function updates state.
</details>

### 2. How do you pass arguments to an event handler in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  You wrap the handler function inside an inline arrow function: `onClick={() => handleAction(arg)}`.
</details>

### 3. What naming convention does React use for event handlers (e.g. `onclick` vs `onClick`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  React uses **camelCase** for event handlers (e.g. `onClick`, `onMouseEnter`, `onMouseMove`, `onSubmit`).
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Click & Hover Logger
1. Create a component `ButtonConsole.jsx` inside `src/components/`.
2. Render a button that console-logs `"Click event fired!"` when clicked.
3. Render a paragraph `<p>` that console-logs `"Mouse hover event fired!"` when the mouse enters its area (using `onMouseEnter`).
4. Import and render `<ButtonConsole />` inside `App.jsx`.
