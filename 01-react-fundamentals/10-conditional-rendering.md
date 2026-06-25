# Conditional Rendering in React 🔀

In web applications, we often need to show or hide elements based on certain conditions (e.g. showing a "Logout" button if logged in, or rendering a warning message if there's an error). In React, you can conditionally render UI elements using standard JavaScript logic: `if-else` statements, logical `&&` operators, and ternary operators `? :`.

---

## ⚡ 1. Using `if-else` Statements

`if-else` statements cannot be placed directly inside JSX curly braces. Instead, you write them in the component body before the `return` statement.

```jsx
const Weather = ({ temperature }) => {
  if (temperature > 30) {
    return <h2>It's hot outside! ☀️</h2>;
  } else if (temperature < 15) {
    return <h2>It's cold outside! ❄️</h2>;
  } else {
    return <h2>The weather is moderate. ⛅</h2>;
  }
};
```

---

## ⚡ 2. The Logical AND (`&&`) Operator

The logical `&&` operator is a compact way to render an element **only if a condition is true**. If the condition is false, React completely ignores it.

```jsx
const Notification = ({ messages }) => {
  return (
    <div>
      <h1>Inbox</h1>
      {messages.length > 0 && (
        <p>You have {messages.length} unread messages!</p>
      )}
    </div>
  );
};
```
*How it works*: In JavaScript, `true && expression` evaluates to `expression`, and `false && expression` evaluates to `false`. If the expression evaluates to `false` or `0`, React won't render anything.

---

## ⚡ 3. The Ternary Operator (`? :`)

The ternary operator is ideal for inline conditional rendering inside JSX when you have an **either-or** (two-way) condition.

```jsx
const LoginButton = ({ isLoggedIn }) => {
  return (
    <div>
      {isLoggedIn ? (
        <button>Log Out</button>
      ) : (
        <button>Log In</button>
      )}
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Conditional Rendering. Click **Reveal Answer** to verify.

### 1. Why can't we write an `if-else` statement inside a JSX curly brace expression?
<details>
  <summary><b>Reveal Answer</b></summary>

  `if-else` is a statement, not an expression. JSX curly braces can only evaluate expression syntax (which returns a value). For inline conditions, you must use ternary operators or logical AND (`&&`).
</details>

### 2. What happens if the condition in `condition && <Component />` evaluates to `false`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React will evaluate the statement as `false` and will render nothing in the DOM for that line.
</details>

### 3. Which operator is best suited for rendering one element if true, and a completely different element if false?
<details>
  <summary><b>Reveal Answer</b></summary>

  The ternary operator (`? :`) is best suited for this case.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Temperature Component
1. Create a component `WeatherReport.jsx` inside `src/components/`.
2. The component should receive a prop named `temp` (a number).
3. Use `if-else` blocks to display:
   - "It's freezing! ❄️" if `temp` is under 10.
   - "It's nice and warm! ☀️" if `temp` is between 10 and 28.
   - "It's boiling hot! 🔥" if `temp` is above 28.
4. Render it in `App.jsx` with various temperature values.

### 🛠️ Exercise 2: User Status Display
1. Create a component `UserStatus.jsx` inside `src/components/`.
2. The component should receive two props: `loggedIn` (boolean) and `isAdmin` (boolean).
3. Using inline ternary operators and logical AND (`&&`):
   - Display a welcome message `"Welcome back, Admin!"` if both `loggedIn` and `isAdmin` are true.
   - Display `"Welcome back, User!"` if `loggedIn` is true but `isAdmin` is false.
   - Display `"Please log in."` if `loggedIn` is false.
4. Render it in `App.jsx` with different prop combinations.
