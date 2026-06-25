# What is a React Component? 🧩

In React, **Components** are the core building blocks of the user interface. Every application you build with React is made up of pieces called components. 

Think of components as custom, reusable HTML elements that contain their own layout (HTML), styling (CSS), and behavior (JavaScript).

---

## 💡 The Lego Analogy

Imagine building a Lego castle. Instead of carving the entire castle out of a single block of wood, you build it using many individual **Lego bricks**:
- Each brick is independent.
- Bricks can be reused in different places (e.g., a window brick can be used on the tower or the gate).
- You assemble these small bricks to create the final, complex castle.

In React, a **Component** is a Lego brick. Your **App** is the castle.

---

## 🛠️ Types of Components

In React's history, there are two ways to create components:

### 1. Functional Components (Modern Standard)
Today, components are written as simple JavaScript functions that return JSX. This is the **standard and recommended way** to write components in React 19.

```jsx
// A simple Functional Component
function WelcomeMessage() {
  return <h1>Welcome back, developer! 👋</h1>;
}

export default WelcomeMessage;
```

*Or using ES6 Arrow Function syntax:*
```jsx
const WelcomeMessage = () => {
  return <h1>Welcome back, developer! 👋</h1>;
};

export default WelcomeMessage;
```

### 2. Class Components (Legacy / Older Way)
Historically, components were written using ES6 classes. While you might still see them in older codebases (legacy code), you should **avoid using them** for new React 19 projects.

```jsx
// Legacy Class Component (For reference only)
import React, { Component } from 'react';

class WelcomeMessage extends Component {
  render() {
    return <h1>Welcome back, developer! 👋</h1>;
  }
}

export default WelcomeMessage;
```

---

## 🔑 Core Features of Components

To build dynamic and interactive UIs, components rely on three main concepts:

### 1. JSX (The Structure)
JSX allows you to write HTML elements inside JavaScript. It defines what the component will render on the screen.
> [!NOTE]
> React components **must return a single root element**. If you have multiple elements, wrap them in a parent container or a **React Fragment** (`<> ... </>`).

```jsx
const Card = () => {
  return (
    <>
      <h2>React 19</h2>
      <p>Building UI with components is easy.</p>
    </>
  );
};
```

### 2. Props (The Inputs)
Props (short for *properties*) are read-only inputs passed from a parent component to a child component, just like arguments passed to a function. They allow components to be dynamic and reusable.

```jsx
// Child Component
const UserProfile = (props) => {
  return <h2>Hello, {props.username}!</h2>;
};

// Parent Component using the Child Component with different props
const App = () => {
  return (
    <div>
      <UserProfile username="Alice" />
      <UserProfile username="Bob" />
    </div>
  );
};
```

### 3. State (The Memory)
Unlike props which are read-only, **State** is a component's private, internal memory. It holds data that can change over time (e.g., whether a menu is open, the value of a text input, or a counter value). When state changes, React automatically re-renders the component to show the updated data.

```jsx
import { useState } from 'react';

const ClickCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
};
```

---

## ⚠️ Important Rules for React Components

1. **Capitalized Names:** Component names **must always start with a capital letter** (e.g., `UserProfile`, not `userProfile`). React uses this rule to distinguish custom components from standard HTML tags (like `<div>` or `<button>`).
2. **Pure Functions (for Props):** A component must never modify its own `props`. Props are read-only.
3. **Single Root Element:** As mentioned, a component must return exactly one root tag.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of React Components. Click on **Reveal Answer** to verify your answers.

### 1. What is a React Component? How does the Lego analogy help explain it?
<details>
  <summary><b>Reveal Answer</b></summary>

  A component is an independent, reusable piece of UI that self-manages its structure, style, and logic. The Lego analogy represents this by treating components as individual bricks; you build them independently and assemble them together to construct the final complex application.
</details>

### 2. Why must React component names start with a capital letter? What happens if you name a component `myHeader`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React uses capitalization to differentiate between custom React components and standard HTML elements. 
  - Standard HTML elements start with lowercase letters (e.g. `<div>`, `<header>`).
  - Custom components must start with a capital letter (e.g. `<MyHeader>`). 
  - If you name it `myHeader`, React will treat it as a native HTML tag `<myHeader>` and will fail to render your component.
</details>

### 3. What is the difference between Functional Components and Class Components? Which one is favored in React 19?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Functional Components** are written as JavaScript functions that return JSX and manage features using Hooks. They are the modern standard in React 19.
  - **Class Components** are written using ES6 classes and lifecycle methods (like `componentDidMount`). They are considered legacy and should be avoided in new projects.
</details>

### 4. Why must a component return a single root element? What can you use if you do not want to insert an extra `<div>` in the DOM tree?
<details>
  <summary><b>Reveal Answer</b></summary>

  React components must return a single value (expression). Under the hood, JSX compiles to JavaScript objects, and a function can only return a single value. If you don't want to pollute your DOM with unnecessary container `<div>`s, you can wrap your elements in a **React Fragment** (`<> ... </>`).
</details>

### 5. Explain the difference between Props and State. Which one can be updated inside the component?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Props** are configuration parameters passed down from a parent component to a child. They are **read-only** (immutable) inside the child component.
  - **State** is the component's internal, private data memory. It is **mutable** and can be updated inside the component using state setter functions (like `setCount`). When state updates, React automatically triggers a re-render.
</details>

---

## 💻 Practice Exercises

Complete these exercises inside your `first-react-app` project to test your understanding. 

> [!IMPORTANT]
> **Best Practice Folder Structure:** 
> A senior coder always keeps `src/` clean. Create a new directory named **`components`** inside **`src/`** (path: `src/components/`). All custom components for the exercises below must be created inside this folder.

---

### 🛠️ Exercise 1: Component Composition (Nesting)
1. Create a new file named **`Header.jsx`** inside **`src/components/`**.
2. Inside `Header.jsx`, define a component that returns a navigation header with a site title (e.g. "React Monster") and 3 anchor links (Home, About, Contact). Export it as default.
3. Create another file named **`Footer.jsx`** inside **`src/components/`** that returns a footer with copyright text (e.g., `"© 2026 React Monster. All rights reserved."`). Export it as default.
4. Import both components in `App.jsx` using the correct path:
   ```jsx
   import Header from "./components/Header"
   import Footer from "./components/Footer"
   ```
5. Render `Header` at the top and `Footer` at the bottom of the container.

---

### 🛠️ Exercise 2: Dynamic Components (Working with Props)
1. Create a new file named **`UserInfo.jsx`** inside **`src/components/`**.
2. Inside it, define a functional component `UserInfo` that accepts `props` (or uses destructuring) and displays:
   - An `<h3>` header displaying a `name`.
   - A `<strong>` tag displaying a `role`.
   - A `<p>` paragraph displaying a short `bio`.
3. In `App.jsx`, import and render the `UserInfo` component **three times** with different data (e.g., Alice the Developer, Bob the Designer, and Charlie the Product Manager):
   ```jsx
   import UserInfo from "./components/UserInfo"
   ```
4. Verify in the browser that each card renders with its respective unique details!

---

### 🛠️ Exercise 3: Stateful Components (Interactive State)
1. Create a new file named **`LikeButton.jsx`** inside **`src/components/`**.
2. Import the `useState` hook from `'react'`.
3. Set up a state variable `likes` initialized to `0`.
4. Render a button that displays the like count (e.g., `👍 Like ({likes})`).
5. Add an `onClick` event listener to the button that increments the `likes` state by `1` when clicked.
6. Import and render the `LikeButton` inside `App.jsx` (above the Footer) and test clicking it in your browser!



