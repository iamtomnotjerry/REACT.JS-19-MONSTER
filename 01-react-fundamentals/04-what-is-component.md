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
