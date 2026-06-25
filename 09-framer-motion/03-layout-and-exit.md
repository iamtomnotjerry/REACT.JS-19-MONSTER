# Layout & Exit Animations in Framer Motion ✨

In standard React, elements are immediately added or removed from the DOM during conditional rendering, making it impossible to animate their departure. This lesson covers **`AnimatePresence`** (unmounting animations), the **`layout`** prop (animating layout shifts), and **`layoutId`** (shared layout animations between components).

---

## ⚡ 1. Exit Animations with `AnimatePresence`

To animate an element as it leaves the DOM, you must:
1. Import and wrap the conditional block inside **`AnimatePresence`**.
2. Add the **`exit`** prop to the direct child `<motion>` component.
3. Ensure the child motion component has a unique **`key`** prop so Framer Motion can track which specific element is unmounting.

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FadeAlert = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setVisible(!visible)}>Toggle Alert</button>
      
      <AnimatePresence>
        {visible && (
          <motion.div
            key="alert-box" // Required key
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} // 1. Run this before unmounting!
            style={styles.alert}
          >
            <h3>Alert Notification!</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = { alert: { padding: "15px", backgroundColor: "#e74c3c", color: "#fff", borderRadius: "5px", marginTop: "10px" } };
```

---

## ⚡ 2. Animating Layout Reflows (`layout`)

When lists change size or elements shift position, they normally "jump" instantly to their new locations, creating an unnatural layout shift. 

Adding the **`layout`** prop to a `<motion>` component instructs Framer Motion to automatically animate size or position changes using highly performant CSS transforms:

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ListManager = () => {
  const [items, setItems] = useState([1, 2, 3]);

  const removeItem = (id) => {
    setItems(items.filter((item) => item !== id));
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto" }}>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            layout // 1. Animates items moving up to fill the gap left by deleted item
            key={item}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }} // 2. Slides out right on delete
            onClick={() => removeItem(item)}
            style={listStyles.card}
          >
            Item Card {item} (Click to delete)
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const listStyles = {
  card: { padding: "15px", margin: "10px 0", backgroundColor: "#34495e", color: "#fff", borderRadius: "5px", cursor: "pointer" }
};
```

---

## ⚡ 3. Shared Layouts (`layoutId`)

You can animate transitions between completely separate components using the **`layoutId`** prop. When a component with a specific `layoutId` mounts while another with the same ID is unmounting, Framer Motion performs a smooth visual transition between them.

A common example is an active indicator line sliding between navigation tab buttons:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export const TabMenu = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const tabs = ["Home", "Profile", "Settings"];

  return (
    <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{ position: "relative", border: "none", background: "none", cursor: "pointer", fontSize: "1.1rem" }}
        >
          {tab}
          {activeTab === tab && (
            // 1. Sliding underline indicator moves smoothly between tabs using layoutId
            <motion.div
              layoutId="underline"
              style={{
                position: "absolute",
                bottom: "-5px",
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "#e67e22"
              }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of layout animations. Click **Reveal Answer** to verify.

### 1. Why does standard React conditional rendering make exit animations impossible, and how does `AnimatePresence` solve this?
<details>
  <summary><b>Reveal Answer</b></summary>

  In standard React, when a state changes to hide a component, React immediately removes the element from the DOM. There is no time to perform transition frames. 
  `AnimatePresence` solves this by intercepting the unmounting action. It delays removing the DOM node until the nested motion child's `exit` transition finishes executing completely.
</details>

### 2. What is the role of the `key` prop inside `AnimatePresence`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Framer Motion relies on the `key` prop to track the identity of elements in the DOM. Without a unique key, when React unmounts a component, Framer Motion cannot distinguish which component is leaving, preventing the exit transition from triggering.
</details>

### 3. What does the `layout` prop do under the hood in Framer Motion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Under the hood, the `layout` prop measures the element's layout bounding box (position and dimensions) before and after a change. It then calculates the differences and animates the reflow smoothly using GPU-accelerated CSS `transform` parameters (scale and translate), avoiding slow browser repaints.
</details>

### 4. How does `layoutId` create shared animations between two completely separate elements?
<details>
  <summary><b>Reveal Answer</b></summary>

  When a component containing a `layoutId` is rendered, Framer Motion searches for another active component sharing the exact same `layoutId`. If found, it projects a smooth visual animation morphing the shape, scale, and position of the old component directly into the new component.
</details>

### 5. What does setting `mode="wait"` do on `<AnimatePresence>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  By default, entering and exiting components animate simultaneously. Setting `<AnimatePresence mode="wait">` forces the entering component to wait until the exiting component completes its exit animation before starting its entrance animation. This is ideal for page route transitions.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Expanding Accordion with Layout Shifts
1. Create a component `CollapsibleList.jsx` containing a list of cards.
2. Clicking a card should toggle its expansion (revealing more details inside).
3. Add the `layout` prop to the container card `<motion.div>` and all surrounding list cards.
4. Verify that when a card expands, the cards below it slide down smoothly, and the card itself changes height with a smooth animation rather than jumping instantly.
