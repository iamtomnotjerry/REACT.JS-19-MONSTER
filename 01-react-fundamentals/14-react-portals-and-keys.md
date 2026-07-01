# React Portals and Advanced Keys 🌲

As we finish our React Fundamentals journey, we will explore two advanced rendering concepts: **React Portals** (rendering elements outside the root DOM node) and **Advanced Keys** (using the `key` prop to reset component state).

---

## ⚡ 1. React Portals (`createPortal`)

Normally, every component in a React app is nested inside the `#root` element in `index.html`. However, for some UI components like modals, popups, and tooltips, having them nested deep in the DOM tree can cause CSS styling issues (like `z-index` conflicts or `overflow: hidden` cutting off elements).

React Portals solve this by letting you render a component into a **completely different DOM node** while retaining its logical place in the React component tree.

### How to Use Portals
1. Create a container element inside `index.html`:
```html
<body>
  <div id="root"></div>
  <div id="popup-content"></div> <!-- Our portal target -->
</body>
```

2. Use `createPortal` from `react-dom` inside your component:
```jsx
import { createPortal } from 'react-dom';

const PortalPopup = () => {
  return createPortal(
    <div className="popup">
      <p>I am rendered outside the #root div! 🛸</p>
    </div>,
    document.getElementById("popup-content")
  );
};
```
*Note: Make sure to import `createPortal` from `'react-dom'`, not from `'react'`!*

### ⚠️ Critical Concept: Event Bubbling through Portals
Even though a portal element is rendered outside the parent DOM node in the actual HTML structure, **events still bubble up through the React component tree**. 

If a user clicks a button inside a portal, any click event handler placed on the parent wrapper component in your React JSX will still trigger:

```jsx
const Parent = () => {
  const handleParentClick = () => {
    console.log("Click bubbled up to parent, even though target is in a portal!");
  };

  return (
    <div onClick={handleParentClick}>
      <h1>Parent Layout</h1>
      <PortalPopup />
    </div>
  );
};
```

---

## 🔑 2. Advanced Keys: Forcing State Resets

We previously learned that React uses the `key` prop to identify items in lists. However, keys can also be used on single components or elements to **force React to destroy and recreate them**, resetting their local state.

### The Problem: Shared DOM Element State
If you switch between two forms or elements that look similar, React tries to optimize rendering by reusing the same DOM element. This means text typed in an input on one screen might persist when switching screens:

```jsx
// Without keys, typed text persists when switching modes!
{isDark ? (
  <input type="text" placeholder="Dark Mode input" />
) : (
  <input type="text" placeholder="Light Mode input" />
)}
```

### The Solution: Using `key` to Force Reset
By adding a unique `key` prop tied to the state, React recognizes them as separate elements. When the key changes, React unmounts the old input (clearing its text) and mounts a brand new input:

```jsx
// With keys, the input field is reset when mode changes!
{isDark ? (
  <input key="dark" type="text" placeholder="Dark Mode input" />
) : (
  <input key="light" type="text" placeholder="Light Mode input" />
)}
```

---

## 🧠 Test Your Knowledge (Interview Prep)

Answer these questions to check your understanding of Portals & Keys. Click **Reveal Answer** to verify.

### 1. Where do you import `createPortal` from?
<details>
  <summary><b>Reveal Answer</b></summary>

  You import it from `'react-dom'` (or `'react-dom/client'`), not `'react'`.
</details>

### 2. When should you use a React Portal?
<details>
  <summary><b>Reveal Answer</b></summary>

  Portals are best used for components that need to break out of parent layout styling constraints, such as modal dialogs, tooltips, toast notifications, and dropdown menus.
</details>

### 3. How does event bubbling behave with React Portals?
<details>
  <summary><b>Reveal Answer</b></summary>

  Even though a portal renders the HTML element in a different physical DOM location, event bubbling follows the React component tree hierarchy, not the HTML DOM hierarchy. Thus, events will still bubble up from the portal to its parent React components.
</details>

### 4. How does React behave when the `key` prop of a single component changes?
<details>
  <summary><b>Reveal Answer</b></summary>

  React will completely destroy (unmount) the old component instance (losing its local state) and mount a fresh new instance from scratch.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Portal Overlay with Event Bubbling
1. Add a `<div id="modal-root"></div>` to your `index.html` file.
2. Create a component `ModalPortal.jsx` inside `src/components/`.
3. Inside it, render a simple modal card using `createPortal` containing a button that says `"Click inside Portal Modal"`.
4. Style the card to cover the screen.
5. Render `<ModalPortal />` inside a wrapper div in `App.jsx` that has an `onClick` event listener.
6. Verify that clicking the button inside the modal triggers the wrapper div's click handler, demonstrating event bubbling through Portals!
