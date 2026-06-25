# Gestures & Variants in Framer Motion ✨

This lesson covers interactive user **Gestures** (hover, tap, drag) and **Variants**—a declarative method to organize animation properties, clean up JSX templates, and coordinate complex nested animations (staggering).

---

## ⚡ 1. Interactive Gestures

Framer Motion has built-in listener props to trigger animations instantly when users hover, click (tap), or drag:

```jsx
import { motion } from 'framer-motion';

export const InteractiveButton = () => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "#2980b9" }} // Trigger on hover
      whileTap={{ scale: 0.95 }}                               // Trigger on click
      style={styles.btn}
    >
      Click Me
    </motion.button>
  );
};
```

### Drag Gestures
Make any element draggable by adding the `drag` prop. Constrain the movement boundary using the `dragConstraints` prop:

```jsx
export const DraggableCard = () => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -50, right: 150, top: -50, bottom: 50 }}
      dragElastic={0.1} // Friction/elastic resistance when dragging past boundaries
      style={styles.card}
    >
      Drag Me!
    </motion.div>
  );
};
```

---

## 🧩 2. Animation Variants

When animations grow complex, writing multiple inline state objects inside JSX makes code messy. **Variants** solve this by extracting animation targets into clean dictionary configurations.

```javascript
// 1. Declare the variants dictionary
const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};
```

Then pass the dictionary to the component and reference keys as string states:

```jsx
<motion.div
  variants={listVariants}
  initial="hidden"
  animate="visible"
/>
```

---

## 🚀 3. Orchestrating Nested Animations (Staggering)

Variants enable a powerful feature: parent components can control the animations of child elements automatically. If a parent motion component has a variant set (e.g. `initial="hidden"` and `animate="visible"`), it automatically propagates these active keys to all motion children down the tree.

We use **Orchestration properties** like `staggerChildren` to stagger the start time of child animations automatically:

```jsx
import { motion } from 'framer-motion';

// Parent Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between each child animation (in seconds)
      delayChildren: 0.1    // Initial delay before first child starts
    }
  }
};

// Child Variants
const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" } }
};

export const StaggeredList = () => {
  const items = ["Item A", "Item B", "Item C"];

  return (
    // 1. Parent initiates keys: hidden & visible
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={styles.list}
    >
      {items.map((item, index) => (
        // 2. Children automatically receive and execute keys hidden & visible!
        <motion.li key={index} variants={itemVariants} style={styles.item}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
};

const styles = {
  list: { listStyleType: "none", padding: 0 },
  item: { padding: "10px", margin: "5px", backgroundColor: "#ecf0f1", borderRadius: "5px" }
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of gestures and variants. Click **Reveal Answer** to verify.

### 1. How do Variants simplify JSX code templates?
<details>
  <summary><b>Reveal Answer</b></summary>

  Variants separate the layout markup (JSX) from the animation logic by moving styling properties (initial, animate, transition) into a separate configuration object. This keeps JSX files clean, readable, and enables the reuse of animation definitions across multiple different components.
</details>

### 2. How does parent-to-child variant propagation work in Framer Motion?
<details>
  <summary><b>Reveal Answer</b></summary>

  When a parent `<motion>` component is assigned a state key name (e.g. `initial="hidden"`), it automatically forwards that key name down to all nested motion children. If the children have variants containing a match for that key (e.g., `hidden`), they will execute it automatically without you needing to pass props manually.
</details>

### 3. What is the purpose of `staggerChildren` in a transition configuration?
<details>
  <summary><b>Reveal Answer</b></summary>

  `staggerChildren` is an orchestration property. When defined on a parent variant's transition, it adds a staggered delay (in seconds) between each child element's entrance animation, creating premium sequential fade-in effects.
</details>

### 4. What does `dragConstraints` restrict, and how do you lock dragging to only one axis?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `dragConstraints` defines boundaries (in pixels or via a React ref to a bounding container) that restrict how far a draggable element can be moved.
  - To lock dragging to a single axis, pass a string to the `drag` prop: `drag="x"` (horizontal only) or `drag="y"` (vertical only).
</details>

### 5. What does the `dragElastic` prop control?
<details>
  <summary><b>Reveal Answer</b></summary>

  `dragElastic` controls the degree of resistance or "rubber-banding" elasticity when a user attempts to drag an element outside its defined `dragConstraints`. Setting it to `0` disables rubber-banding completely, while `1` allows full stretching beyond bounds before snapping back.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Staggered Profile Cards Grid
1. Create a component `ProfileGrid.tsx` (using `.tsx` extension).
2. Set up a grid container list with parent variants orchestrating a stagger delay of `0.15` seconds.
3. Render four profile card child items. Each card should fade in from the bottom (`y: 50`) and scale up slightly on hover (`whileHover={{ scale: 1.03 }}`) and shrink on click (`whileTap={{ scale: 0.98 }}`).
4. Verify that cards slide and fade onto the screen one after another dynamically.
