# Design Patterns: Render Props & Compound Components 📐

This lesson covers two advanced design patterns in React: **Render Props** (sharing stateful logic using a function-as-a-prop) and **Compound Components** (building cohesive Parent-Child component structures that manage shared states implicitly).

---

## ⚡ 1. The Render Props Pattern

The **Render Props** pattern is a technique for sharing stateful logic between components using a prop whose value is a function. Instead of the component rendering its own hardcoded layout, it calls the function prop and passes its local state values as arguments, leaving UI layout design to the consumer:

```jsx
import { useState } from 'react';

// Shared Logic Component: Tracks toggle status
export const Toggle = ({ render }) => {
  const [on, setOn] = useState(false);
  const toggle = () => setOn((prev) => !prev);

  // Calls the render function prop, passing states as arguments
  return render(on, toggle);
};
```

### Consuming the Render Prop:
```jsx
import { Toggle } from './Toggle';

export const ToggleApp = () => {
  return (
    <div>
      {/* Consumer decides EXACTLY what elements and styles to render */}
      <Toggle 
        render={(on, toggle) => (
          <div style={{ padding: "20px", border: "1px solid #ccc" }}>
            <button onClick={toggle}>{on ? "Turn Off" : "Turn On"}</button>
            {on && <p>💡 The light is on!</p>}
          </div>
        )}
      />
    </div>
  );
};
```

---

## ⚡ 2. The Compound Components Pattern

The **Compound Components** pattern allows you to design a set of components that work together to share state implicitly and render a unified user interface, similar to HTML `<select>` and `<option>` tags. 

Instead of passing down multiple complex props (like array data configs) to a single giant component, you compose child sub-components directly. We implement this using **React Context**:

### Compound Tab System Example

#### Step 1: Create Parent & Context (`Tabs.jsx`)
```jsx
import React, { createContext, useState, useContext } from 'react';

const TabsContext = createContext();

export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div style={styles.container}>{children}</div>
    </TabsContext.Provider>
  );
};

// 1. Child Sub-Component: Trigger tab change
const Trigger = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      style={{
        padding: "10px 20px",
        backgroundColor: isActive ? "#3498db" : "#ecf0f1",
        color: isActive ? "#fff" : "#2c3e50",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      {children}
    </button>
  );
};

// 2. Child Sub-Component: Conditionally render layout
const Content = ({ value, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div style={styles.content}>{children}</div>;
};

// Bind sub-components to parent object for clean namespace imports
Tabs.Trigger = Trigger;
Tabs.Content = Content;

const styles = {
  container: { border: "1px solid #dfe6e9", borderRadius: "8px", overflow: "hidden", maxWidth: "500px" },
  content: { padding: "20px", backgroundColor: "#fff" }
};
```

#### Step 2: Consuming the Compound Components
Observe how clean, readable, and highly customizable the markup structure is:

```jsx
import { Tabs } from './Tabs';

export const Dashboard = () => {
  return (
    <Tabs defaultValue="profile">
      {/* 1. Trigger list navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        <Tabs.Trigger value="profile">Profile Settings</Tabs.Trigger>
        <Tabs.Trigger value="security">Password & Security</Tabs.Trigger>
      </div>

      {/* 2. Display panels */}
      <Tabs.Content value="profile">
        <h4>User Profile Settings</h4>
        <p>Edit username, upload avatar...</p>
      </Tabs.Content>
      <Tabs.Content value="security">
        <h4>Security Controls</h4>
        <p>Update keys, activate 2FA codes...</p>
      </Tabs.Content>
    </Tabs>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these advanced patterns. Click **Reveal Answer** to verify.

### 1. What is the primary benefit of the Render Props pattern?
<details>
  <summary><b>Reveal Answer</b></summary>

  It allows you to share **stateful logic** (like mouse movement tracking, form values, timer states) between components while giving the parent component full freedom to decide the visual markup layout and CSS formatting.
</details>

### 2. How do Compound Components manage state implicitly?
<details>
  <summary><b>Reveal Answer</b></summary>

  They manage state implicitly by using **React Context**. The parent component (e.g. `<Tabs>`) wraps the tree in a Context Provider containing active states and handlers. Child sub-components (e.g. `<Tabs.Trigger>`) call `useContext` under the hood to access settings automatically, eliminating the need to pass props down manually.
</details>

### 3. What is the difference between a Render Prop and the standard `children` prop?
<details>
  <summary><b>Reveal Answer</b></summary>

  - The **`children`** prop represents pre-rendered React nodes. The component cannot easily pass state variables back up to children during render.
  - A **Render Prop** is a callback function. By calling this function with arguments during rendering (e.g., `render(stateVal)`), the component shares its state values directly with the consumer.
</details>

### 4. Why is attaching sub-components to the parent object (e.g., `Tabs.Trigger = Trigger`) a common practice?
<details>
  <summary><b>Reveal Answer</b></summary>

  This is a namespace organization convention. It signals to other developers that the sub-component is designed to work exclusively as a child of the parent component. It also simplifies imports, allowing developers to import only `Tabs` and access sub-components via dot notation: `<Tabs.Trigger />`.
</details>

### 5. Why are custom hooks often preferred over Render Props in modern React codebases?
<details>
  <summary><b>Reveal Answer</b></summary>

  Render Props require writing callback functions directly inside the JSX markup tree. When nesting multiple render props, it creates deep function hierarchies (similar to callback hell), making JSX code hard to read. Custom Hooks keep the JSX tree flat by declaring state logic at the top of the function body.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Build a Compound Accordion Component
1. Create a file `CompoundAccordion.tsx` (using `.tsx` extension).
2. Set up a React Context `AccordionContext` tracking `openId` state.
3. Build a parent component `<Accordion>` and three sub-components:
   - `<Accordion.Item value={id}>`: Wraps item layouts.
   - `<Accordion.Header value={id}>`: Triggers state change on click.
   - `<Accordion.Panel value={id}>`: Renders nested children only if `openId === id`.
4. Register them as compound properties on `Accordion`.
5. Consume the components in `App.tsx` and verify that opening one item collapses the others implicitly.
