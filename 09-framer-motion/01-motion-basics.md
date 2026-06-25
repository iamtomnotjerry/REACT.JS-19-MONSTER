# Framer Motion Basics: Intro & Simple Animations ✨

**Framer Motion** is the industry-standard, production-ready animation and gesture library for React. It makes creating smooth, physics-based animations extremely simple, helping developers build premium user interfaces with minimal code.

---

## 📖 Concept & Overview

Before touching code, it helps to understand *why* a library like Framer Motion exists at all when CSS already has `transition` and `@keyframes`.

### CSS vs Framer Motion

CSS animations are **great** for simple hover effects, transitions between states, or animations that don't require complex logic. They are very performant, can leverage GPU acceleration, and require **zero** third-party dependencies. However, CSS becomes painful when you need to coordinate multiple elements, respond to user interaction beyond simple events, or animate based on React component **state**.

Framer Motion offers advanced capabilities like **drag gestures**, **layout animations**, and **exit animations** that are hard to achieve in pure CSS. Most importantly, it integrates seamlessly with React's component model, making **state-driven animation** trivial.

> [!NOTE]
> Don't confuse **Framer** with **Framer Motion**. *Framer* (framer.com) is a visual design tool for building high-fidelity prototypes. *Framer Motion* (framer.com/motion) is a React-specific animation library. This lesson is exclusively about the **library**.

### The Real-World Metaphor: A GPS, Not Turn-by-Turn Driving 🗺️

The single most important idea in Framer Motion is that animation is **declarative**, not **imperative**.

Imagine you want to get to the airport. With **imperative** animation (like manually tweaking `requestAnimationFrame` or stepping through CSS keyframes by hand), you are the driver giving yourself instructions every second: *"turn left now, accelerate to 30, brake, turn right..."* You manage every intermediate frame.

With **declarative** animation, you act like a **GPS destination**. You simply say *"I am here (`initial`), and I want to be there (`animate`)."* Framer Motion is the navigation engine that figures out the entire route — every intermediate frame, the easing, the physics — to get the element from its current state to the target state. You describe the **what**, not the **how**.

> [!TIP]
> Because animation is declarative, you almost never write keyframe loops by hand. When you change a value in the `animate` prop (often driven by React state), Framer Motion automatically computes a smooth path from the element's *current* visual state to the new target — no manual interpolation required.

---

## ⚡ 1. Getting Started: Installation

To add Framer Motion to your React project, run the following command in your terminal:

```bash
npm install framer-motion
```

---

## 🧩 2. The `<motion>` Element

Framer Motion works by wrapping standard HTML tags in a special **`motion`** object (e.g., `<motion.div>`, `<motion.button>`, `<motion.h1>`). You can use `motion` with almost any element: `motion.h1`, `motion.li`, `motion.span`, `motion.img`, `motion.article`, `motion.section`, and more. These motion elements accept configuration properties to define animation behaviors:

```jsx
import { motion } from 'framer-motion';

export const SimpleBox = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }} // 1. Start state
      animate={{ opacity: 1, scale: 1 }}   // 2. Target state
      transition={{ duration: 0.5 }}       // 3. Animation controls
      style={styles.box}
    />
  );
};

const styles = {
  box: { width: 100, height: 100, backgroundColor: "#3498db", borderRadius: "10px" }
};
```

> [!WARNING]
> Always import from `'framer-motion'`, not from another animation library. A very common mistake when copying code is importing `motion` from the wrong package (for example from a state library). If `motion.div` renders but never animates, double-check your import path first.

---

## ⚡ 3. Control Props: `initial`, `animate`, and `transition`

Understanding these three props is crucial to working with Framer Motion:

### A. The `initial` Prop
Defines the starting properties of the element **before it enters the DOM** — how it should appear when it first renders.
* E.g., `initial={{ x: -100, opacity: 0 }}` starts the box 100 pixels to the left and fully transparent.
* If you do not want an entry animation, set `initial={false}`.

### B. The `animate` Prop
Defines the final target values the element should animate towards. This is the heart of state-driven animation.
* E.g., `animate={{ x: 0, opacity: 1 }}`.
* Framer Motion automatically calculates the differences and animates the properties smoothly.

### C. The `exit` Prop
Defines the animation that runs when the component is **removed** from the React tree. This is perfect for fade-outs and slide-aways when an element unmounts (used together with `<AnimatePresence>`, covered in later lessons).

### D. The `transition` Prop
Controls *how* the properties move from `initial` to `animate`. It supports timing configurations or physical simulation settings:

#### Timing Transition (Tween)
Uses time durations and predefined easing curves:
```jsx
transition={{ duration: 0.8, ease: "easeInOut" }}
```

#### Physics Transition (Spring)
Simulates real-world spring mechanics (bounce and weight). **Spring is the default type in Framer Motion** because it mimics natural physics:
```jsx
transition={{
  type: "spring",
  stiffness: 120, // Tension of the spring (higher is faster/snappier)
  damping: 15,    // Resistance of the spring (lower causes more bounces)
  mass: 1         // Weight of the moving element
}}
```

---

## 🔬 4. Tween vs Spring: Choosing a Transition Type

The `transition` prop accepts two fundamentally different philosophies of motion. **Tween** is *time-based* (you control how long it takes), while **Spring** is *physics-based* (you control the forces, and duration emerges from them). Choosing the right one is the difference between an animation that feels mechanical and one that feels alive.

| Aspect | Tween (`type: "tween"`) | Spring (`type: "spring"`) |
| --- | --- | --- |
| **Driven by** | Time + easing curve | Physics simulation (forces) |
| **Key properties** | `duration`, `ease`, `delay` | `stiffness`, `damping`, `mass`, `velocity` |
| **Duration** | Explicit — you set it exactly | Emergent — derived from the physics |
| **Feel** | Precise, controlled, can feel mechanical | Natural, bouncy, organic |
| **Best for** | Opacity fades, color shifts, exact-timing sequences | Drag release, hover scale, UI that should feel "alive" |
| **Default in Framer Motion?** | No | ✅ Yes (for most transformable values) |
| **Overshoot / bounce** | Never (follows the curve exactly) | Yes (low `damping` produces visible bounce) |

> [!NOTE]
> Framer Motion intelligently picks a default: physical properties like `x`, `scale`, and `rotate` default to **spring**, while non-physical properties like `opacity` and `color` default to **tween**. You only need to set `type` explicitly when you want to override this behavior.

### Spring knobs explained
* **`stiffness`** — the tension of the spring. Higher = faster, snappier movement. (Common range: 100–400.)
* **`damping`** — the resistance / friction. Lower = more bouncing before it settles. Higher = it stops sooner.
* **`mass`** — the weight of the element. Heavier elements feel sluggish and overshoot more slowly.

---

## 🎯 5. Transform Shortcuts

Framer Motion provides convenient shorthands so you don't have to write full CSS `transform` strings. These shorthands let the physics engine animate each property **independently**:

```jsx
<motion.div
  animate={{
    x: 100,      // translateX(100px)
    y: -50,      // translateY(-50px)
    rotate: 45,  // rotateZ(45deg)
    scale: 1.5,  // scale factor
    skewX: 20,   // skewX(20deg)
  }}
/>
```

You can also use custom units like `"10rem"` or `"80%"` instead of raw numbers (numbers default to pixels for `x`/`y`).

---

## 🎞️ 6. Keyframes

Instead of animating from a single start to a single end, you can pass an **array** of values to define multiple intermediate points. Framer Motion plays through each value in sequence:

```jsx
<motion.div
  // Pulse: grow to 1.2x then shrink back, looping forever
  animate={{ scale: [1, 1.2, 1] }}
  transition={{
    duration: 1,        // total time for the full sequence
    ease: "easeInOut",
    repeat: Infinity,   // loop endlessly
  }}
  className="box"
/>
```

> [!TIP]
> Think of a keyframe array as **splitting one animation into multiple parts**. `scale: [1, 2, 3, 2, 1]` grows the element up to 3x then shrinks it back down — all in a single declarative array.

---

## 🖐️ 7. Gesture Animations

Gestures make components respond to user interaction. The three most common are hover, tap, and drag:

```jsx
<motion.div
  className="box"
  whileHover={{ scale: 1.2, rotate: 10 }}        // on mouse hover
  whileTap={{ scale: 0.8, backgroundColor: "crimson" }} // on click/tap
  drag                                            // make it draggable
  dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
  transition={{ type: "spring", stiffness: 300 }} // springy gesture feel
/>
```

* **`whileHover`** — applies styles while the pointer is over the element.
* **`whileTap`** — applies styles while the element is pressed.
* **`drag`** — makes the element draggable. Use `drag="x"` or `drag="y"` to lock an axis.
* **`dragConstraints`** — limits how far the element can be dragged.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Framer Motion. Click **Reveal Answer** to verify.

### 1. What is the default transition type in Framer Motion, and why is it preferred over tween timing?
<details>
  <summary><b>Reveal Answer</b></summary>

  For transformable physical properties (like `x`, `scale`, `rotate`), the default transition type is **`spring`**. It is preferred because it simulates real-world physical inertia (tension and resistance), which creates natural-looking bounce animations. Traditional linear or "tween" easing transitions can feel sterile and artificial. (Note: non-physical properties like `opacity` default to `tween`.)
</details>

### 2. What happens if you modify a value inside the `animate` prop dynamically using state?
<details>
  <summary><b>Reveal Answer</b></summary>

  Framer Motion will automatically detect the state change and smoothly animate the element from its **current** position to the new value defined in the `animate` prop, without requiring any manual keyframe definitions. This is the essence of **declarative** animation — you describe the destination, the library computes the route.
</details>

### 3. Can you animate transform properties like `rotate`, `scale`, `x`, and `y` directly?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. Framer Motion provides shorthand names for common CSS transform properties:
  - `x` and `y` represent `translateX` and `translateY` (e.g. `x: 100` shifts the element 100px right).
  - `rotate` represents `rotateZ` (e.g. `rotate: 45` rotates the element 45 degrees).
  - `scale` represents scale factor (e.g. `scale: 1.5`).
</details>

### 4. How do you disable the mount animation of a `<motion>` component?
<details>
  <summary><b>Reveal Answer</b></summary>

  You pass the boolean `false` directly to the `initial` prop: `<motion.div initial={false} animate={{ opacity: 1 }} />`. This tells Framer Motion to skip the initial animation frame and render the target state instantly on mount.
</details>

### 5. What is the key difference between a `tween` transition and a `spring` transition, and when would you choose each?
<details>
  <summary><b>Reveal Answer</b></summary>

  A **tween** is *time-based*: you set an explicit `duration` and `ease` curve, and the animation follows that curve exactly with no overshoot. A **spring** is *physics-based*: you set `stiffness`, `damping`, and `mass`, and the duration emerges from the simulation, often producing natural bounce/overshoot.

  Use **tween** for precise, controlled effects like opacity fades, color changes, or sequences that must finish at an exact time. Use **spring** for anything that should feel organic and alive — drag release, hover scale, and interactive UI.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Snappy Alert Notification Box
1. Create a component `SlideAlert.tsx` (using `.tsx` extension).
2. Set up a state variable `isOpen` that toggles an alert message.
3. Wrap the alert card inside a `<motion.div>`:
   - Start position (`initial`): fully transparent, positioned above the screen (`y: -100`).
   - Active position (`animate`): fully opaque, slides down to view (`y: 20`).
   - Use a snappy spring transition: `type: "spring", stiffness: 150, damping: 12`.
4. Render a button to toggle `isOpen` and observe the entrance and exit movement.
5. **Stretch goal:** Duplicate the component and swap the spring transition for a tween (`type: "tween", duration: 0.4, ease: "easeInOut"`). Place both side by side and observe how the spring overshoots/bounces while the tween glides in cleanly. This makes the comparison table above tangible.

```tsx
import { useState } from "react";
import { motion } from "framer-motion";

export const SlideAlert = () => {
  // Toggle controls whether the alert is on screen
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        Toggle Alert
      </button>

      {isOpen && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}   // start above the viewport, invisible
          animate={{ y: 20, opacity: 1 }}     // slide down into view
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
          style={{
            background: "#2ecc71",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            marginTop: "12px",
          }}
        >
          Success! Your changes were saved.
        </motion.div>
      )}
    </div>
  );
};
```

---

### 🛠️ Exercise 2: Infinite Pulsing Button (Keyframes + Loop)
1. Create a component `PulsingButton.tsx`.
2. Use `motion.button` with a keyframe array on `scale`: `[1, 1.1, 1]`.
3. Add a keyframe array on `backgroundColor` so the color shifts and returns.
4. Configure the transition with `duration: 0.8`, `ease: "easeInOut"`, and `repeat: Infinity` so it pulses forever.
5. **Stretch goal:** Add `whileHover={{ scale: 1.15 }}` and `whileTap={{ scale: 0.95 }}` so the button also reacts to the user, combining keyframe loops with gesture animations.

```tsx
import { motion } from "framer-motion";

export const PulsingButton = () => {
  return (
    <motion.button
      // Keyframe arrays: grow then shrink, and shift color then return
      animate={{
        scale: [1, 1.1, 1],
        backgroundColor: ["#3498db", "#9b59b6", "#3498db"],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity, // loop the pulse endlessly
      }}
      whileHover={{ scale: 1.15 }} // gesture: react to hover
      whileTap={{ scale: 0.95 }}   // gesture: react to press
      style={{
        padding: "12px 24px",
        color: "white",
        border: "none",
        borderRadius: "9999px",
        cursor: "pointer",
      }}
    >
      Click Me
    </motion.button>
  );
};
```
