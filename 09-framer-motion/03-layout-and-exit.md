# Layout & Exit Animations in Framer Motion ✨

In standard React, elements are immediately added or removed from the DOM during conditional rendering, making it impossible to animate their departure. This lesson covers **`AnimatePresence`** (unmounting animations), the **`layout`** prop (animating layout shifts), and **`layoutId`** (shared layout animations between components). It then goes a level deeper into the **motion-value hooks** that power scroll-driven and drag-driven animations: **`useMotionValue`**, **`useTransform`**, **`useScroll`**, and **`useSpring`**.

---

## 📚 Concept & Overview

Animation is not just decoration — it communicates *change* to the user. When a notification appears, a modal closes, or a list reorders itself, a smooth transition tells the human eye *what happened and where it went*. Framer Motion gives us two distinct toolsets for this:

1. **Presence & layout animations** — declarative props (`exit`, `layout`, `layoutId`) that animate components as they mount, unmount, or reflow.
2. **Motion values** — reactive primitives (`useMotionValue`, `useTransform`, `useScroll`, `useSpring`) that let us *programmatically* drive animation from continuous inputs such as scroll position or drag distance.

> [!NOTE]
> A **motion value** is a special reactive container that tracks the state of a single animatable property (like `x`, `opacity`, or `backgroundColor`). When you use the `animate` prop, Framer Motion creates these motion values *for you automatically* — which is exactly why a bare `animate={{ x: 200 }}` already glides smoothly even though you never wrote a transition. The hooks in this lesson simply let you create and control those values yourself.

> [!TIP]
> Reach for the **declarative props** (`animate`, `exit`, `layout`) for 90% of UI animations — they are simpler and self-optimizing. Drop down to **motion-value hooks** only when the animation must respond *continuously* to an external input (scroll, pointer, drag), because those inputs change far too often to model as discrete React state without jank.

> [!WARNING]
> Once you bind a property to your **own** motion value via the `style` prop, Framer Motion stops managing it for you. That means the automatic smoothing disappears — the element snaps instantly to each new value. If you want smoothness back, wrap the value in **`useSpring`** (covered below). Mixing `animate={{ x }}` and `style={{ x }}` for the *same* property at the same time is a conflict and will not behave as expected.

### 🤔 A Real-World Metaphor

Think of the difference like **a light switch vs. a dimmer knob**:

- The **`animate` prop** is the *light switch* — you declare the end state ("on") and Framer Motion handles the fade between off and on for you.
- A **motion value** you control is the *dimmer knob* — you are physically turning it, and the bulb tracks your hand instantly. There is no built-in easing; the brightness is exactly wherever your fingers are right now. That is perfect for scroll and drag, where the user's input *is* the knob.
- **`useSpring`** is a *dimmer with inertia* — when you let go of the knob, it eases gently into place instead of stopping dead, giving that natural, physical feel.

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

### 🧐 Why Layout Animations Matter — The FLIP Technique

Animating layout (`width`, `height`, `top`, `left`) the naive way is **slow**. Properties like `width` and `top` force the browser to recompute the geometry of the page (a "layout" or "reflow") on *every single frame*, which janks badly. Transform properties (`scale`, `translate`) do **not** — they run on the GPU compositor and never touch layout.

The `layout` prop solves this with a well-known trick called **FLIP** — **F**irst, **L**ast, **I**nvert, **P**lay:

| Step | What Framer Motion does |
| --- | --- |
| **F — First** | Measures the element's bounding box *before* the change (its old position and size). |
| **L — Last** | Lets React apply the change, then measures the bounding box *after* (its new position and size). |
| **I — Invert** | Instantly applies a `transform` that makes the element *look* like it is still in its old spot. |
| **P — Play** | Animates that transform back to zero — so the element appears to glide from old to new, but every frame is a cheap GPU transform. |

```text
   FIRST              LAST              INVERT                PLAY
  ┌──────┐         ┌──────┐          ┌──────┐  (visually   ┌──────┐
  │  A   │   -->   │      │   -->    │  A   │   still at    │ ...  │  --> glides
  └──────┘         │      │          └──────┘   old spot)   │  A   │      to new
   (old)           │  A   │           transform             └──────┘      position
                   └──────┘           = old - new
```

> [!NOTE]
> **Perceived performance** is the real payoff. Even when total work is similar, an animation that runs at a smooth 60fps *feels* faster and more trustworthy than an instant jump, because the eye can follow continuity and never loses track of an element. Layout animations cost almost nothing (pure transforms) yet make an interface feel polished and responsive — a huge return for a single `layout` prop.

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

## 🎛️ 4. Motion-Value Hooks: Driving Animation Programmatically

Beyond declarative props, Framer Motion exposes hooks that let you create and read raw motion values yourself. This is the foundation of scroll-linked effects, parallax, and drag-tracking UIs.

### `useMotionValue` — Create your own value

`useMotionValue(initial)` returns a motion value you fully control. You read it with `.get()` and update it with `.set()`. Bind it through the **`style`** prop (not `animate`), because you are now the one driving it.

```jsx
import { motion, useMotionValue } from 'framer-motion';

export const DragTracker = () => {
  // 1. Create a motion value starting at 0 on the x-axis.
  const x = useMotionValue(0);

  return (
    <motion.div
      drag="x"                                   // Make it draggable horizontally
      dragConstraints={{ left: 0, right: 200 }}  // Limit how far it can travel
      style={{
        x,                                        // 2. Bind the value via style, NOT animate
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#3498db",
        cursor: "grab",
      }}
    />
  );
};
```

> [!TIP]
> While dragging, Framer Motion writes the live pointer position straight into your `x` motion value. You can debug this without re-rendering React by attaching `useMotionValueEvent(x, "change", latest => console.log(latest))` — it fires on every frame the value changes, which is far cheaper than mirroring the value into `useState`.

### `useTransform` — Map one range to another

`useTransform` takes a source motion value and maps an **input range** to an **output range**. The output can be numbers, colors, or units — making it perfect for deriving one animated property from another. Here we turn horizontal drag distance into a color shift:

```jsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const DragColorBox = () => {
  const x = useMotionValue(0);

  // 1. Map drag position [-100 .. 100] onto colors [red .. green].
  const backgroundColor = useTransform(
    x,                          // source motion value
    [-100, 0, 100],             // input range
    ["#ff0000", "#ffaa00", "#00ff00"] // output range
  );

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      style={{
        x,
        backgroundColor,        // 2. Derived value drives the background
        width: 120,
        height: 120,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        cursor: "grab",
      }}
    >
      Drag me
    </motion.div>
  );
};
```

### `useScroll` — Track scroll position as a motion value

`useScroll()` returns motion values that describe how far the page (or a target element) has scrolled. The most useful is **`scrollYProgress`**, a value from `0` (top) to `1` (fully scrolled) — ideal for progress bars and parallax. Combine it with `useTransform` to drive any property from scroll depth:

```jsx
import { motion, useScroll, useTransform } from 'framer-motion';

export const ScrollProgress = () => {
  // 1. scrollYProgress is a motion value: 0 at the top, 1 at the bottom.
  const { scrollYProgress } = useScroll();

  // 2. Map scroll progress [0 .. 1] to scale [1 .. 1.5] and opacity [1 .. 0].
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      {/* Fixed top progress bar that fills as the user scrolls */}
      <motion.div
        style={{
          scaleX: scrollYProgress, // width follows scroll progress directly
          transformOrigin: "left",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "#e67e22",
        }}
      />

      {/* A box that scales up and fades out as you scroll down */}
      <div style={{ height: "200vh", display: "grid", placeItems: "center" }}>
        <motion.div
          style={{
            scale,
            opacity,
            width: 120,
            height: 120,
            borderRadius: 16,
            backgroundColor: "#3498db",
          }}
        />
      </div>
    </>
  );
};
```

> [!NOTE]
> There are two families of scroll animation. **Scroll-triggered** animations fire once when an element enters the viewport (use the `whileInView` prop). **Scroll-driven** animations map a property *continuously* to scroll position (use `useScroll` + `useTransform`). The example above is scroll-driven — every pixel of scroll is reflected instantly in `scale` and `opacity`.

### `useSpring` — Add natural, physics-based smoothing

The raw value from `useMotionValue` or `useScroll` snaps to its target with no easing, which can feel mechanical. **`useSpring`** wraps a motion value (or a plain number) and makes it *chase* its target using a spring physics model — giving fluid, slightly bouncy motion. Often you change a single word:

```jsx
import { useScroll, useSpring, motion } from 'framer-motion';

export const SmoothScrollBar = () => {
  const { scrollYProgress } = useScroll();

  // Wrap the raw progress in a spring so the bar eases instead of snapping.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100, // how strongly it pulls toward the target
    damping: 30,    // how quickly the bounce settles
  });

  return (
    <motion.div
      style={{
        scaleX: smoothProgress, // smoothed value -> buttery progress bar
        transformOrigin: "left",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: "#9b59b6",
      }}
    />
  );
};
```

### 🗂️ Hook Comparison Cheat-Sheet

| Hook | What it produces | Driven by | Typical use |
| --- | --- | --- | --- |
| `useMotionValue(0)` | A value *you* control with `.get()` / `.set()` | Your code, drag, pointer | Drag tracking, manual control |
| `useTransform(v, [in], [out])` | A *derived* motion value | Another motion value | Map drag/scroll to color, scale, rotation |
| `useScroll()` | `scrollX/Y` + `scrollXProgress/YProgress` | Page or element scroll | Progress bars, parallax, reveal |
| `useSpring(v, config)` | A *smoothed* motion value | Any motion value / number | Add inertia and natural easing |

---

## 🌟 5. `mode="wait"` for Sequenced Transitions

By default `AnimatePresence` animates the exiting and entering elements *simultaneously*. Setting `mode="wait"` forces the new element to wait until the old one has fully exited — perfect for page/route transitions where overlap would look messy.

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentPage} // changing key triggers exit + enter
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
  >
    {pageContent}
  </motion.div>
</AnimatePresence>
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

### 2. What is the difference between a motion value that Framer Motion creates automatically and one you create with `useMotionValue`?
<details>
  <summary><b>Reveal Answer</b></summary>

  When you use the `animate` prop (e.g. `animate={{ x: 200 }}`), Framer Motion creates and **manages** the motion value for you — it automatically eases the value to its target, which is why the element glides smoothly even without a transition.
  When you create your own with `useMotionValue` and bind it through the `style` prop, **you** are responsible for updating it. There is no automatic easing, so the element snaps instantly to each new value. To restore smoothing on a value you control, wrap it in `useSpring`.
</details>

### 3. What does the `layout` prop do under the hood, and what is the FLIP technique?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `layout` prop animates position and size changes using GPU-accelerated transforms instead of slow layout-triggering properties. It uses **FLIP** — **First** (measure the old bounding box), **Last** (let React apply the change and measure the new box), **Invert** (instantly apply a transform so the element still appears in its old spot), and **Play** (animate that transform back to zero). The result is a smooth glide where every frame is a cheap `transform`, never a costly reflow.
</details>

### 4. You want a box to continuously change color as the user drags it left and right. Which hooks do you combine, and how?
<details>
  <summary><b>Reveal Answer</b></summary>

  Use `useMotionValue(0)` to create an `x` value and bind it through `style` while making the element `drag="x"`. Then use `useTransform(x, [-100, 100], ["#ff0000", "#00ff00"])` to map the drag distance (input range) onto a color (output range), and bind that derived value to `backgroundColor` via `style`. As the drag updates `x`, the transform recomputes the color every frame.
</details>

### 5. What does `useScroll` return, and how do you make a scroll-linked animation feel smooth instead of snappy?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useScroll()` returns motion values describing scroll position, most usefully `scrollYProgress` (a value from `0` at the top to `1` at the bottom). You typically feed it into `useTransform` to drive a property like `scale` or `opacity`. Because the raw value tracks scroll exactly and can feel mechanical, you wrap it in `useSpring(scrollYProgress, { stiffness, damping })` to add physics-based inertia, producing buttery, natural motion.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Expanding Accordion with Layout Shifts
1. Create a component `CollapsibleList.jsx` containing a list of cards.
2. Clicking a card should toggle its expansion (revealing more details inside).
3. Add the `layout` prop to the container card `<motion.div>` and all surrounding list cards.
4. Verify that when a card expands, the cards below it slide down smoothly, and the card itself changes height with a smooth animation rather than jumping instantly.
5. **Stretch:** Wrap the list in `<AnimatePresence>` and add an `exit` animation so deleting a card slides it out while the rest reflow via `layout`.

### 🛠️ Exercise 2: Scroll-Linked Progress Bar with Spring Smoothing
1. Create a component `ReadingProgress.jsx`.
2. Add a tall page body (e.g. a `div` with `height: 300vh`) so there is something to scroll.
3. Call `const { scrollYProgress } = useScroll();` to track how far the user has scrolled.
4. Render a fixed bar at the top of the page and bind its `scaleX` to `scrollYProgress` (set `transformOrigin: "left"`).
5. Confirm the bar fills from 0% to 100% as you scroll top to bottom.
6. **Add depth:** Wrap the value with `const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });` and bind the bar to `smooth` instead. Scroll quickly and observe how the bar eases into place with gentle inertia rather than tracking the scroll instantly.
7. **Stretch:** Use `useTransform(scrollYProgress, [0, 1], ["#3498db", "#e74c3c"])` to also shift the bar's `backgroundColor` from blue to red as the reader nears the end.
