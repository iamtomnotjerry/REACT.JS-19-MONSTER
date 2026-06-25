# Projects 5 & 6: Theme Toggle & Search Bar 🚀

In this lesson, we will build a **Theme Toggle application** (Light/Dark mode switcher) and a **Hidden Search Bar** (an interactive search input that slides out on request). These projects teach **conditional styling**, focus event triggers (`onBlur`), and animating layouts using React state.

---

## 🎨 Project 5: Theme Toggle Application

This project uses boolean state to switch between dark and light themes, dynamically updating style properties on components.

### Key Concepts Practiced:
* Storing toggle values (`isDark`) in state.
* Writing ternary operations in inline styles: `color: isDark ? "#fff" : "#000"`.
* Creating smooth visual state transitions with CSS.

### Step-by-Step Implementation (`ToggleTheme.jsx`)

Create `src/components/ToggleTheme.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => setIsDark((prev) => !prev);

  // Dynamic style object based on state
  const containerStyles = {
    backgroundColor: isDark ? "#121212" : "#f5f6fa",
    color: isDark ? "#f5f6fa" : "#121212",
    height: "220px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.4s ease", // Smooth background color swap
    maxWidth: "400px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif"
  };

  const btnStyles = {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: isDark ? "#f1c40f" : "#34495e",
    color: isDark ? "#121212" : "#ffffff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "15px",
    transition: "background 0.3s ease"
  };

  return (
    <div style={containerStyles}>
      <h2>{isDark ? "Dark Mode Active 🌙" : "Light Mode Active ☀️"}</h2>
      <p style={{ margin: "5px 0" }}>Theme toggle uses local component state.</p>
      <button style={btnStyles} onClick={toggle}>
        Switch to {isDark ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
};
```

---

## 🔍 Project 6: Hidden Search Bar

A search bar that remains hidden until the search icon is clicked. Once clicked, it expands smoothly, focusing the input automatically. If the user clicks away, the search bar retracts.

### Key Concepts Practiced:
* **Focus Events (`onBlur`)**: Closing the search bar when the input loses focus (click-away behavior).
* **AutoFocus**: Automatically placing the cursor in the search input as soon as it renders.
* **Animated Slide-Outs**: Dynamically adjusting input widths using inline styling.

### Step-by-Step Implementation (`HiddenSearch.jsx`)

Create `src/components/HiddenSearch.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const HiddenSearch = () => {
  const [showInput, setShowInput] = useState(false);

  const containerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    maxWidth: "500px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  };

  const inputStyles = {
    width: showInput ? "220px" : "0px",
    opacity: showInput ? 1 : 0,
    padding: showInput ? "10px 15px" : "0px",
    border: showInput ? "2px solid #3498db" : "0px solid transparent",
    borderRadius: "25px",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Premium slide ease
  };

  const searchBtnStyles = {
    padding: "10px 20px",
    backgroundColor: showInput ? "#e74c3c" : "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease"
  };

  return (
    <div style={containerStyles}>
      <input
        type="text"
        placeholder="Type search queries..."
        style={inputStyles}
        onBlur={() => setShowInput(false)} // Retract input when clicking away
        autoFocus={showInput} // Auto focus input when mounted
        key={showInput ? "open" : "closed"} // Key trick to force fresh autoFocus render
      />
      <button style={searchBtnStyles} onClick={() => setShowInput((prev) => !prev)}>
        {showInput ? "Close ✕" : "Search 🔍"}
      </button>
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these intermediate projects. Click **Reveal Answer** to verify.

### 1. What does `onBlur` do, and how is it useful in UI search forms?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `onBlur` event fires when an input element loses focus (i.e. the user clicks anywhere else outside the input). In search UIs, it is useful for automatically retracting or hiding the search bar when the user is done interacting with it.
</details>

### 2. Why does the input field in the Hidden Search project need `autoFocus`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Without `autoFocus`, when the user clicks the search button, the input slides open but the user must click inside the input field again to start typing. `autoFocus` automatically places the text cursor in the field immediately, saving the user an extra click.
</details>

### 3. What is the difference between conditional rendering (`condition && <Input />`) and conditional styling (`width: open ? "200px" : "0px"`) for animating inputs?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Conditional Rendering** adds or removes the element from the DOM completely. You cannot easily apply standard CSS transitions when adding elements this way.
  - **Conditional Styling** keeps the element in the DOM but adjusts visual properties like `width` or `opacity`. This allows CSS transitions (`transition: all 0.3s`) to animate the expansion smoothly.
</details>

### 4. What is the CSS transition "cubic-bezier" and why is it preferred over "linear" values?
<details>
  <summary><b>Reveal Answer</b></summary>

  `cubic-bezier` defines a custom speed curve (easing) for transitions. Linear transitions move at a constant speed, which looks unnatural. Easing transitions start fast and slow down (or vice versa), which mimics real-world physical inertia and feels much more premium and professional.
</details>

### 5. In React, what is the best practice for applying multiple CSS classes dynamically?
<details>
  <summary><b>Reveal Answer</b></summary>

  You can use string interpolation:
  ```jsx
  className={`search-input ${isOpen ? "active" : "hidden"}`}
  ```
  Or use utility libraries like `clsx` or `classnames` to merge classes based on state flags.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Persisted Theme Selection
1. Open `ToggleTheme.jsx`.
2. Save the value of `isDark` inside `localStorage` inside a `useEffect` hook whenever it changes.
3. Read the theme value from `localStorage` during initial state setup so the theme is remembered when reloading the page.

### 🛠️ Exercise 2: Live Search Directory List
1. Open `HiddenSearch.jsx`.
2. Add a list of items below the search bar: `const list = ["Apple", "Banana", "Cherry", "Date", "Elderberry"]`.
3. Track the input text in a state variable `query`.
4. Render a filtered version of the list below the input box containing only names matching `query`.
