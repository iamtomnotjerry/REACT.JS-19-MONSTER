# Design Patterns: Render Props, Compound Components & Slots 📐

This lesson covers three advanced composition patterns in React: **Render Props** (sharing stateful logic using a function-as-a-prop), **Compound Components** (building cohesive Parent-Child component structures that manage shared state implicitly), and the **Slot Pattern** (letting a parent inject dynamic content into specific regions of a child component).

---

## 📖 Concept & Overview

All three patterns answer the same fundamental question: **"How do I make a component flexible and reusable without drowning it in props?"** Instead of hard-coding layout and behavior, these patterns hand control back to the consumer of the component.

A useful real-world metaphor is a **picture frame shop** 🖼️:

- A **Render Prop** is like handing the customer an empty frame plus the *measurements* of the wall, and saying "you draw whatever you want, here are the dimensions you have to work with." The shop owns the measuring (the logic/state); the customer owns the artwork (the UI).
- A **Compound Component** is like a *modular shelving system* (think IKEA): the rails, brackets, and shelves are sold separately but are designed to click together. Each piece silently knows how to talk to the others through hidden grooves (Context) — you never have to wire them up by hand.
- A **Slot** is like a *physical photo frame with cut-out windows*: a big window for the main photo (the default `children` slot), and smaller labeled windows for a caption, a date stamp, or a logo (named slots). You just drop content into each window.

> [!NOTE]
> These are **composition patterns**, not React APIs. React gives you primitives (`children`, `props`, `Context`) — the *patterns* are conventions for combining those primitives. Slots in particular are **not native to React**: unlike Vue's `<slot>` or Web Components' Shadow DOM, React fakes slots using ordinary props.

> [!TIP]
> In modern React, **custom hooks** have largely replaced the Render Props pattern for sharing *logic*, while **Compound Components** and **Slots** remain the idiomatic way to share *layout flexibility*. Reach for hooks when you need behavior; reach for compounds/slots when you need composition.

### When to use which?

| Pattern | Shares… | Mechanism | Best for |
| --- | --- | --- | --- |
| **Render Props** | Stateful **logic** | A function prop called during render | Mouse trackers, data fetchers, toggles where the consumer designs the UI |
| **Compound Components** | Implicit **state** between siblings | Parent + sub-components + `Context` | `<Tabs>`, `<Accordion>`, `<Select>` — families of elements that coordinate |
| **Slots** | **Content placement** | `children` and/or named JSX props | Cards, modals, layouts with fixed regions (header / body / footer) |

```
                    ┌─────────────────────────────┐
   Consumer  ──────▶│  Reusable Component          │
   (your app)       │                              │
                    │  Render Prop  → calls render(state)
                    │  Compound     → shares state via Context
                    │  Slot         → places children/props into regions
                    └─────────────────────────────┘
```

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

### A classic example: the Mouse Tracker

A `MouseTracker` owns the *logic* of listening to mouse movement, but lets the consumer decide how to *display* the position:

```tsx
import { useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  // The render prop receives the current position and returns JSX
  render: (position: Position) => React.ReactNode;
}

export const MouseTracker = ({ render }: MouseTrackerProps) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    // Capture the cursor coordinates from the event object
    setPosition({ x: event.clientX, y: event.clientY });
  };

  // Fill the full viewport height so there is room to move the mouse
  return (
    <div style={{ height: "100vh" }} onMouseMove={handleMouseMove}>
      {render(position)}
    </div>
  );
};

// Consumer decides the presentation
export const App = () => (
  <MouseTracker
    render={(position) => (
      <p>Mouse is at X: {position.x}, Y: {position.y}</p>
    )}
  />
);
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

## 🧩 3. The Slot Pattern

A **slot** lets a component accept dynamic content from its parent and place that content into a specific area of its own layout. Because React has **no built-in slot mechanism** (unlike Vue or Web Components), we achieve slots using **props** — either the special `children` prop or named JSX props.

> [!WARNING]
> Do not confuse the Slot pattern with "passing props." The defining trait of a slot is that the value being passed is **renderable JSX/content** destined for a *specific region* of the layout — not configuration data like `color="red"` or `size={12}`. If you find yourself passing strings down only to rebuild the same JSX inside, you probably want a slot instead.

There are four flavors, building from simplest to most powerful:

| Slot type | Passed via | Number of regions | State sharing |
| --- | --- | --- | --- |
| **Default (anonymous)** | `children` | One | None |
| **Named** | Custom JSX props | Many (fixed) | None |
| **Compound** | Sub-components, each taking `children` | Many (composable) | None |
| **Slot with Context** | `children` + a Provider | Many | Yes (shared) |

### 🟢 3.1 Default Slot (the `children` prop)

The **default slot** — also called the *anonymous slot* — is simply the `children` prop. Whatever you place between a component's opening and closing tags is passed as `children`:

```tsx
// Card.tsx
interface CardProps {
  children: React.ReactNode;
}

export const Card = ({ children }: CardProps) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
      {/* Default slot: render whatever the parent passed in */}
      {children}
    </div>
  );
};
```

```tsx
// App.tsx — anything between the tags lands in the default slot
import { Card } from './Card';

export const App = () => (
  <Card>
    <h1>This is my card title</h1>
    <p>This is my card content</p>
    <button>Learn more</button>
  </Card>
);
```

### 🟡 3.2 Named Slots (JSX passed via props)

A **named slot** is a prop with a descriptive name whose value is **JSX**. This lets the parent fill several distinct regions, and lets the child decide *where* each region renders:

```tsx
// Card.tsx
interface CardProps {
  cardTitle: React.ReactNode;   // named slot 1
  cardContent: React.ReactNode; // named slot 2
  cardButton: React.ReactNode;  // named slot 3
}

export const Card = ({ cardTitle, cardContent, cardButton }: CardProps) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "16px" }}>
      <header>{cardTitle}</header>
      <section>{cardContent}</section>
      <footer>{cardButton}</footer>
    </div>
  );
};
```

```tsx
// App.tsx — each prop receives a chunk of JSX
import { Card } from './Card';

export const App = () => (
  <Card
    cardTitle={<h1>This is my card title</h1>}
    cardContent={<p>This is my card content</p>}
    cardButton={
      <button style={{ background: "#000", color: "#fff" }}>Learn more</button>
    }
  />
);
```

> [!TIP]
> Named slots are perfect when a layout has a **fixed set of regions** (e.g. `header`, `body`, `footer`) and you want to guarantee at the type level that each region is provided. TypeScript will flag a missing `cardTitle` for you.

### 🟠 3.3 Compound Slots (sub-components with `children`)

You can combine the Slot pattern with Compound Components. Instead of named props, you expose a sub-component for **each region**, and each sub-component renders its own `children`. This reads more naturally as JSX and is fully composable:

```tsx
// CardTitle.tsx
export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ fontSize: "1.5rem" }}>{children}</h1>
);

// CardContent.tsx
export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <p style={{ marginTop: "0.5rem" }}>{children}</p>
);

// CardButton.tsx
export const CardButton = ({ children }: { children: React.ReactNode }) => (
  <button style={{ background: "#000", color: "#fff" }}>{children}</button>
);
```

```tsx
// Card.tsx — wire the sub-components onto the parent as a namespace
import { CardTitle } from './CardTitle';
import { CardContent } from './CardContent';
import { CardButton } from './CardButton';

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Attach each "slot" as a compound property
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Button = CardButton;
```

```tsx
// App.tsx — fill each slot declaratively
import { Card } from './Card';

export const App = () => (
  <Card>
    <Card.Title>Card title</Card.Title>
    <Card.Content>Card content goes here</Card.Content>
    <Card.Button>Click me</Card.Button>
  </Card>
);
```

### 🔴 3.4 Compound Slots with Context

When the slotted sub-components need to **share state** (e.g. read a value or trigger an update), wire them together with **Context** — the same engine that powers compound components. This is the most powerful slot variant.

```tsx
// context/MyContext.tsx
import { createContext, useState } from 'react';

interface MyContextType {
  value: string;
  setValue: (next: string) => void;
}

// Initialize as undefined so a missing provider is detectable
export const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState("Hello from Context");

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};
```

```tsx
// hooks/useMyContext.ts
import { useContext } from 'react';
import { MyContext } from '../context/MyContext';

export const useMyContext = () => {
  const context = useContext(MyContext);

  // Guard: this hook must run inside a provider
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
```

```tsx
// components/SlotComponent.tsx — a slot that READS shared state
import { useMyContext } from '../hooks/useMyContext';

export const SlotComponent = ({ children }: { children: React.ReactNode }) => {
  const { value } = useMyContext();

  return (
    <div>
      <h3>Context value: {value}</h3>
      {/* This nested slot can hold any content */}
      <div>{children}</div>
    </div>
  );
};
```

```tsx
// components/SlotContent.tsx — a slot that UPDATES shared state
import { useMyContext } from '../hooks/useMyContext';

export const SlotContent = () => {
  const { setValue } = useMyContext();

  return (
    <button onClick={() => setValue("New value from SlotContent component")}>
      Update context value
    </button>
  );
};
```

```tsx
// App.tsx — wrap the tree, then nest slots freely
import { MyProvider } from './context/MyContext';
import { SlotComponent } from './components/SlotComponent';
import { SlotContent } from './components/SlotContent';

export const App = () => (
  <MyProvider>
    <SlotComponent>
      <SlotContent />
    </SlotComponent>
  </MyProvider>
);
```

When you click the button, `SlotContent` calls `setValue`, the Context updates, and `SlotComponent` re-renders with the new text — even though neither component received the value through props. This is the slot pattern and the compound pattern working together.

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

### 3. Are slots a built-in feature of React, and how are the four slot variants distinguished?
<details>
  <summary><b>Reveal Answer</b></summary>

  **No** — React has no native slot mechanism (unlike Vue's `<slot>` or Web Components' Shadow DOM). Slots are *emulated* using props. The four variants are:
  - **Default (anonymous) slot** → the `children` prop; a single region.
  - **Named slots** → custom props whose values are JSX, allowing multiple fixed regions.
  - **Compound slots** → a sub-component per region, each rendering its own `children`.
  - **Slot with Context** → compound slots that also share state via a Context Provider.
</details>

### 4. Why is attaching sub-components to the parent object (e.g., `Tabs.Trigger = Trigger`) a common practice?
<details>
  <summary><b>Reveal Answer</b></summary>

  This is a namespace organization convention. It signals to other developers that the sub-component is designed to work exclusively as a child of the parent component. It also simplifies imports, allowing developers to import only `Tabs` and access sub-components via dot notation: `<Tabs.Trigger />`.
</details>

### 5. When would you choose a **named slot** over a **default (`children`) slot**, and why are custom hooks often preferred over Render Props?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Choose a **named slot** when a layout has **multiple distinct regions** (e.g. header, body, footer) that must each be filled independently — a single `children` slot can only target one region, and named slots also let TypeScript enforce that every region is provided.
  - **Custom Hooks** are preferred over Render Props because render props require writing callback functions directly inside the JSX tree. Nesting multiple render props creates deep function hierarchies (callback-hell-style indentation) that hurt readability. Custom Hooks keep the JSX flat by declaring logic at the top of the function body.
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

### 🛠️ Exercise 2: Build a Slotted `<PageLayout>` (named + default slots)
Practice mixing slot variants in one component.

1. Create `PageLayout.tsx`. It should accept **two named slots** (`header` and `sidebar`, both typed as `React.ReactNode`) and a **default slot** (`children`) for the main content area.
2. Render the layout as a CSS grid: `header` across the top, `sidebar` on the left, and `children` filling the main region.
   ```tsx
   interface PageLayoutProps {
     header: React.ReactNode;   // named slot
     sidebar: React.ReactNode;  // named slot
     children: React.ReactNode; // default slot
   }
   ```
3. In `App.tsx`, pass a `<nav>` to `header`, a list of links to `sidebar`, and place the page body between the tags so it flows into the default slot.
4. **Stretch goal:** convert the named slots into **compound slots with Context**. Add a `useTheme()` hook backed by a `ThemeProvider`, expose `<PageLayout.Header>` and `<PageLayout.Sidebar>` sub-components, and have the header render a button that toggles a `theme` value shared through Context. Confirm the sidebar reacts to the theme change without receiving any props.
