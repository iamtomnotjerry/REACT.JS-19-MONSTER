# Projects 7 & 8: Slider & Accordion 🚀

In this lesson, we will build a **Testimonials Slider** (a carousel displaying user reviews) and a collapsible **Accordion**. These projects teach array indexing, composite component architecture (Parent-Child patterns), state lifting, and toggling layouts.

---

## 🎠 Project 7: Testimonials Slider

A carousel that navigates through an array of testimonial cards using "Next" and "Back" controls.

### Key Concepts Practiced:
* Managing an index state (`index`) to render one item at a time.
* Modulo math `%` to loop indexing boundaries:
  - **Next**: `(index + 1) % length`
  - **Prev**: `(index - 1 + length) % length`

### Step-by-Step Implementation (`Testimonials.jsx`)

Create `src/components/Testimonials.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "React 19 is absolutely game-changing! The compiler handles memoization perfectly.",
      author: "Sarah Connor",
      role: "Lead Software Architect"
    },
    {
      id: 2,
      quote: "Creating custom hooks has never been this intuitive. My code is cleaner and more reusable.",
      author: "Alex Mercer",
      role: "Senior Frontend Engineer"
    },
    {
      id: 3,
      quote: "State management using Zustand and Redux Toolkit is extremely simple after taking this course.",
      author: "Elena Rostova",
      role: "Fullstack Web Developer"
    }
  ];

  const handleNext = () => {
    // Loop back to 0 when passing the last element
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    // Loop back to the last element when passing 0
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index];

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Project 7: Testimonials Slider</h2>
      <div style={styles.quoteBox}>
        <p style={styles.quote}>"{current.quote}"</p>
        <h4 style={styles.author}>— {current.author}</h4>
        <span style={styles.role}>{current.role}</span>
      </div>
      <div style={styles.nav}>
        <button style={styles.btn} onClick={handlePrev}>⟵ Back</button>
        <span style={styles.counter}>{index + 1} / {testimonials.length}</span>
        <button style={styles.btn} onClick={handleNext}>Next ⟶</button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "500px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "20px"
  },
  quoteBox: {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  quote: {
    fontSize: "1.1rem",
    fontStyle: "italic",
    color: "#34495e",
    margin: "0 0 15px 0"
  },
  author: {
    margin: "0",
    color: "#2c3e50"
  },
  role: {
    fontSize: "0.85rem",
    color: "#7f8c8d"
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  btn: {
    padding: "10px 15px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  counter: {
    color: "#7f8c8d",
    fontWeight: "bold"
  }
};
```

---

## 🗂️ Project 8: Accordion Component

Accordions contain headers that expand to reveal answers when clicked. We can structure them in two ways:
1. **Multi-Open Accordion**: Each item manages its own open/close state. Multiple items can be open at once.
2. **Single-Open Accordion**: The active item's ID is stored in the parent component. Opening one item automatically closes all other items.

### Multi-Open Step-by-Step Implementation (`Accordion.jsx`)

Create `src/components/Accordion.jsx` and insert the following code:

```jsx
import { useState } from 'react';

// Child Component - manages its own independent state
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={accStyles.item}>
      <div style={accStyles.header} onClick={() => setIsOpen(!isOpen)}>
        <h3 style={accStyles.question}>{question}</h3>
        <span style={accStyles.icon}>{isOpen ? "▼" : "►"}</span>
      </div>
      
      {/* Smooth CSS height rendering simulation */}
      <div 
        style={{
          ...accStyles.content,
          maxHeight: isOpen ? "150px" : "0px",
          padding: isOpen ? "15px" : "0px 15px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <p style={{ margin: 0 }}>{answer}</p>
      </div>
    </div>
  );
};

// Parent Component
export const Accordion = () => {
  return (
    <div style={accStyles.container}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Project 8: Accordion</h2>
      <AccordionItem 
        question="1. What is the React Virtual DOM?" 
        answer="A lightweight, in-memory copy of the browser DOM that React uses to run diffing checks and execute highly performant visual updates." 
      />
      <AccordionItem 
        question="2. How do props differ from state?" 
        answer="Props are inputs passed from parent components to child components (read-only), while state is private data managed internally by the component itself." 
      />
      <AccordionItem 
        question="3. When should you use useEffect?" 
        answer="When performing operations that reach outside the React component render loop, such as network requests, manual DOM mutations, or timers." 
      />
    </div>
  );
};

const accStyles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto",
    fontFamily: "Arial, sans-serif"
  },
  item: {
    border: "1px solid #dfe6e9",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: "15px 20px",
    cursor: "pointer",
    userSelect: "none"
  },
  question: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#2c3e50"
  },
  icon: {
    fontSize: "1.2rem",
    color: "#7f8c8d"
  },
  content: {
    backgroundColor: "#fff",
    color: "#2d3436",
    overflow: "hidden",
    transition: "all 0.3s ease-in-out"
  }
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these beginner projects. Click **Reveal Answer** to verify.

### 1. In a Slider, how does the modulo operator `(index + 1) % length` work when clicking "Next"?
<details>
  <summary><b>Reveal Answer</b></summary>

  The modulo operator returns the remainder of division. For a list of 3 items (length = 3):
  - When `index = 0`, `(0 + 1) % 3` returns `1`.
  - When `index = 1`, `(1 + 1) % 3` returns `2`.
  - When `index = 2` (last element), `(2 + 1) % 3` (3 divided by 3) returns `0` (remainder 0), looping the slider back to the first element.
</details>

### 2. How does a single-open accordion differ architecturally from a multi-open accordion?
<details>
  <summary><b>Reveal Answer</b></summary>

  - In a **multi-open** accordion, each child item has its own local `isOpen` state, making them independent.
  - In a **single-open** accordion, the parent component manages an `activeId` state. The parent passes down a boolean (`isOpen={activeId === itemId}`) and a handler to update the ID. The state is **lifted up** to the parent.
</details>

### 3. What is the danger of not specifying a height limit or `maxHeight` when animating accordion expansion?
<details>
  <summary><b>Reveal Answer</b></summary>

  You cannot animate heights directly from `0px` to `auto` using standard CSS transitions. Animating to `maxHeight: 150px` or using scale operations allows the browser engine to calculate transitional frames, providing a smooth expand animation.
</details>

### 4. What is the value of `(index - 1 + length) % length` when index is 0, and why is `+ length` added?
<details>
  <summary><b>Reveal Answer</b></summary>

  For a list of length 3, if we start at index 0 and go backward:
  `(-1 + 3) % 3 = 2 % 3 = 2`.
  Adding `length` ensures the dividend is positive. In JavaScript, modulo operations on negative numbers yield negative results (e.g. `-1 % 3 = -1`), which would cause an index out-of-bounds error.
</details>

### 5. Why do we set `userSelect: "none"` on accordion headers?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because clicking quickly on the header to expand/collapse it can cause the browser to highlight/select the question text. Setting `userSelect: "none"` prevents text highlight selections, making the button feel like a native desktop widget.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Autoplay Testimonial Carousel
1. Open `Testimonials.jsx`.
2. Set up a `useEffect` hook to run an interval timer calling `handleNext()` every 4 seconds.
3. **CRITICAL**: Return a cleanup function inside the effect that runs `clearInterval` to prevent multiple timers from piling up when the component is clicked or unmounted.

### 🛠️ Exercise 2: Convert to Single-Open Accordion
1. Refactor `Accordion.jsx`.
2. Move state management up to the parent component: `const [activeId, setActiveId] = useState(null)`.
3. Pass down props to `AccordionItem`:
   - `isOpen={activeId === item.id}`
   - `onToggle={() => setActiveId(activeId === item.id ? null : item.id)}`
4. Verify that opening one accordion item collapses the other active items.
