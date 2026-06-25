# Gestures & Variants in Framer Motion ✨

This lesson covers interactive user **Gestures** (hover, tap, drag), **Variants**—a declarative method to organize animation properties, clean up JSX templates, and coordinate complex nested animations (staggering)—and **scroll-triggered animation** with the `whileInView` prop.

---

## 📖 Concept & Overview

Framer Motion gives you two superpowers that work beautifully together:

1. **Gestures** — props like `whileHover`, `whileTap`, and `drag` that respond to the user *while* an interaction is happening, with no manual state management.
2. **Variants** — named "animation presets" stored in a plain object. Instead of scattering `initial`, `animate`, and `transition` objects all over your JSX, you give each visual state a name (`"hidden"`, `"visible"`) and reference it as a string.

> [!NOTE]
> A **variant** is just a dictionary whose keys are *state names* and whose values are the target style objects. When you write `animate="visible"`, Framer Motion looks up the `visible` key in the component's `variants` prop. The real magic is that this lookup happens **recursively down the component tree**, which is what makes orchestration (staggering) possible.

> [!TIP]
> Reach for **variants** the moment a component has more than one animation state, or whenever a parent needs to coordinate its children. For a single one-off animation (e.g. a logo that just spins), inline `animate={{ rotate: 360 }}` is perfectly fine—don't over-engineer.

### Real-World Metaphor 🎻

Think of a parent `motion` component as the **conductor of an orchestra**, and each `motion` child as a **musician**:

- The conductor raises the baton (the parent switches to `animate="visible"`).
- Every musician already knows their part (each child defines a `visible` variant).
- The conductor doesn't shout instructions to each player individually—a single gesture propagates to the whole ensemble.
- `staggerChildren` is the conductor deciding the musicians enter **one section at a time** instead of all at once, creating rhythm instead of noise.

### Gestures vs. Variants at a Glance

| Feature | Gestures (`whileHover`, etc.) | Variants |
| --- | --- | --- |
| Where defined | Inline on the component | External dictionary object |
| Best for | Single interactive responses | Multiple/coordinated states |
| Reusable across components | No (copy-paste) | Yes (import the object) |
| Propagates to children | No | **Yes** (the key feature) |
| Keeps JSX clean | Gets noisy quickly | Very clean |

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

### Combining Gestures with Variants
You can mix gestures and variants on the same element. Define three named states and map each gesture prop to a key:

```jsx
import { motion } from 'framer-motion';

// One dictionary describing initial, hover, and click states
const boxVariants = {
  initial: { scale: 1, rotate: 0, skewX: 0 },
  hover:   { scale: 1.2, rotate: 15, skewX: 10, transition: { duration: 0.3 } },
  click:   { scale: 0.9, rotate: -50, transition: { duration: 0.3 } }
};

export const AnimatedShape = () => {
  return (
    <motion.div
      variants={boxVariants}
      initial="initial"   // Start in the resting state
      whileHover="hover"  // Gesture references the "hover" key
      whileTap="click"    // Gesture references the "click" key
      style={styles.shape}
    />
  );
};
```

> [!WARNING]
> Gesture props (`whileHover`, `whileTap`) only animate **while** the interaction is active and snap back when it ends. They do **not** persist state. If you need a click to *toggle* a permanent state, drive `animate` from a React state value (e.g. `animate={isOpen ? "visible" : "hidden"}`) instead of using `whileTap`.

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

### How Propagation Works (Diagram)

When you set the active variant key on a parent, you do **not** set it on the children—they inherit it:

```text
                <motion.ul variants={containerVariants} initial="hidden" animate="visible">
                                          │
                  the key "visible" propagates DOWN the tree
                                          │
          ┌───────────────────────────────┼───────────────────────────────┐
          ▼                                ▼                                ▼
  <motion.li variants={item}>     <motion.li variants={item}>     <motion.li variants={item}>
   (no animate prop! it           (no animate prop! it            (no animate prop! it
    inherits "visible")            inherits "visible")             inherits "visible")
          │                                │                                │
   starts at  t = 0.1s            starts at  t = 0.3s             starts at  t = 0.5s
          └────────── staggerChildren: 0.2  +  delayChildren: 0.1 ──────────┘
```

- The **parent** is the only component you tell *which* state to be in.
- Each **child** only declares *what* `hidden` and `visible` look like—it never sets `animate` itself.
- `staggerChildren` inserts a gap (in seconds) between each child's start time.
- `delayChildren` waits before the *first* child begins.

> [!NOTE]
> Propagation only reaches children that **omit** their own `initial`/`animate` props but **do** provide a matching `variants` key. The moment a child sets its own `animate="..."`, it stops listening to the parent and orchestration breaks. Let the parent be the single source of truth for *which* state; let children own *what* each state looks like.

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

> [!TIP]
> Add `staggerDirection: -1` inside the parent's transition to reverse the order—children animate from last to first. This is great for a "collapse/hide" effect where items should disappear in the opposite order they appeared.

---

## 📜 4. Scroll-Triggered Animation: `whileInView`

So far our animations run on mount (`animate`) or on interaction (`whileHover`). A third trigger is **scroll position**. Framer Motion splits scroll work into two families:

| Type | Behavior | Use cases |
| --- | --- | --- |
| **Scroll-triggered** | Fires once when an element enters the viewport | Revealing cards/sections as you scroll past them |
| **Scroll-driven** | Continuously maps the scroll position to a value | Parallax, progress bars (uses `useScroll`/`useTransform`) |

This section covers the **scroll-triggered** variety using two props:

- `whileInView` — the animation target to apply *while the element is visible* in the viewport.
- `viewport` — options that customize *when* "visible" counts (e.g. only fire once, or require the element to be further on-screen).

```jsx
import { motion } from 'framer-motion';

export const AnimatedCard = () => {
  return (
    <motion.div
      // Starting (off-screen) state
      initial={{ scale: 0.5, opacity: 0, transition: { duration: 0.5 } }}
      // Target state applied WHILE the card is inside the viewport
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      // viewport options: only animate the FIRST time it scrolls in,
      // and wait until 40% of the card is visible (amount: 0.4)
      viewport={{ once: true, amount: 0.4 }}
      style={styles.card}
    >
      <h2>Amazing Card</h2>
      <p>This card animates beautifully into the view as you scroll.</p>
    </motion.div>
  );
};
```

> [!NOTE]
> By default `whileInView` animates **every time** the element re-enters the viewport (scroll down, scroll back up, scroll down again → it re-plays). Pass `viewport={{ once: true }}` to lock it after the first reveal—this is almost always what you want for "fade-in on scroll" content sections so the page doesn't flicker on every scroll-back.

> [!WARNING]
> `whileInView` needs a defined `initial` state to animate *from*. If you forget `initial`, the element starts already in its final visible state and you'll see no animation at all—the most common "why isn't my scroll animation working?" bug. Always pair `whileInView` with an `initial` that hides the element (e.g. `opacity: 0`).

**Common `viewport` options:**

| Option | Type | What it does |
| --- | --- | --- |
| `once` | `boolean` | If `true`, animate only the first time the element enters view |
| `amount` | `number` \| `"some"` \| `"all"` | How much of the element must be visible to trigger (e.g. `0.4` = 40%) |
| `margin` | `string` | Grows/shrinks the detection box, like CSS margin (e.g. `"-100px"` triggers later) |

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

  When a parent `<motion>` component is assigned a state key name (e.g. `initial="hidden"`), it automatically forwards that key name down to all nested motion children. If the children have variants containing a match for that key (e.g., `hidden`), they will execute it automatically without you needing to pass props manually. Note that a child stops inheriting the moment it sets its own `animate` prop—the parent should be the single source of truth for *which* state.
</details>

### 3. What is the purpose of `staggerChildren` in a transition configuration?
<details>
  <summary><b>Reveal Answer</b></summary>

  `staggerChildren` is an orchestration property. When defined on a parent variant's transition, it adds a staggered delay (in seconds) between each child element's entrance animation, creating premium sequential fade-in effects. Combine it with `delayChildren` to pause before the first child, or `staggerDirection: -1` to reverse the order.
</details>

### 4. What does `dragConstraints` restrict, and how do you lock dragging to only one axis?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `dragConstraints` defines boundaries (in pixels or via a React ref to a bounding container) that restrict how far a draggable element can be moved.
  - To lock dragging to a single axis, pass a string to the `drag` prop: `drag="x"` (horizontal only) or `drag="y"` (vertical only).
</details>

### 5. What does the `whileInView` prop do, and which `viewport` option prevents it from replaying on every scroll-back?
<details>
  <summary><b>Reveal Answer</b></summary>

  `whileInView` is a scroll-triggered prop: it applies its animation target while the element is visible inside the viewport, letting you reveal content as the user scrolls to it. By default it re-plays every time the element re-enters view. Passing `viewport={{ once: true }}` locks the animation after the first reveal so it does not replay on subsequent scroll-backs. Remember it also requires a matching `initial` state to animate from.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Staggered Profile Cards Grid
1. Create a component `ProfileGrid.tsx` (using `.tsx` extension).
2. Set up a grid container list with parent variants orchestrating a stagger delay of `0.15` seconds (`staggerChildren: 0.15`), plus a `delayChildren: 0.2` so the whole group waits briefly before starting.
3. Render four profile card child items. Each card should fade in from the bottom (`y: 50`) and scale up slightly on hover (`whileHover={{ scale: 1.03 }}`) and shrink on click (`whileTap={{ scale: 0.98 }}`).
4. Make sure the **children do not set their own `animate` prop**—they should only declare `variants={cardVariants}` and inherit the active key from the parent. Verify that cards slide and fade onto the screen one after another dynamically.
5. **Stretch goal:** add `staggerDirection: -1` and observe the cards entering from last to first.

### 🛠️ Exercise 2: Scroll-Reveal Feature Section
1. Create a component `FeatureSection.tsx` that renders a tall page: an `<h1>` ("Scroll down to see the animation") followed by a full-height spacer `<div>` so there is room to scroll.
2. Below the spacer, render three `motion.div` cards.
3. Give each card an `initial={{ opacity: 0, scale: 0.5 }}` and a `whileInView={{ opacity: 1, scale: 1, y: 0 }}` with a `transition` duration of `0.5`.
4. Add `viewport={{ once: true, amount: 0.4 }}` so each card animates exactly once, when 40% of it is visible.
5. Verify the bug-trap: temporarily remove the `initial` prop and confirm the animation disappears—then add it back. This cements *why* `whileInView` needs a starting state.
