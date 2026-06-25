# Projects 3 & 4: Meals API & Calculator 🚀

In this lesson, we will build a **Meals Catalog API Fetcher** (consuming external REST APIs) and a fully functional mathematical **Calculator**. These projects practice advanced data flow, side effects (`useEffect`), error management, inputs validation, and complex interactive grid layouts.

---

## 🍽️ Project 3: Meals API Catalog

This project fetches dishes from an external food API and displays them in a card grid layout, including loading states and error handle checks.

### Key Concepts Practiced:
* Fetching data inside `useEffect` and storing it in state.
* Managing loading state (`loading`) and error messages (`error`).
* Dynamic item layouts via grid styling.

### Step-by-Step Implementation (`Meals.jsx`)

Create `src/components/Meals.jsx` and insert the following code:

```jsx
import { useState, useEffect } from 'react';

export const Meals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch food database!");
        return res.json();
      })
      .then((data) => {
        if (active) {
          // Store first 8 meals
          setItems(data.meals ? data.meals.slice(0, 8) : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false; // Prevent race condition updates
    };
  }, []);

  if (loading) return <p style={styles.message}>Loading seafood catalog...</p>;
  if (error) return <p style={styles.errorMessage}>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Project 3: Seafood Meal API Catalog</h2>
      <div style={styles.grid}>
        {items.map(({ idMeal, strMeal, strMealThumb }) => (
          <div key={idMeal} style={styles.card}>
            <img src={strMealThumb} alt={strMeal} style={styles.image} />
            <div style={styles.info}>
              <h4 style={styles.mealName}>{strMeal}</h4>
              <span style={styles.tag}>ID: {idMeal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    maxWidth: "1000px",
    margin: "0 auto"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "30px"
  },
  message: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#7f8c8d",
    marginTop: "50px"
  },
  errorMessage: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#e74c3c",
    marginTop: "50px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease"
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover"
  },
  info: {
    padding: "15px"
  },
  mealName: {
    margin: "0 0 10px 0",
    fontSize: "1.1rem",
    color: "#34495e"
  },
  tag: {
    fontSize: "0.8rem",
    color: "#bdc3c7",
    fontWeight: "bold"
  }
};
```

---

## 🔢 Project 4: Mathematical Calculator

A grid layout calculator that processes mathematical expressions represented as strings.

### ⚠️ Security Warning: `eval()` Risks
In standard practice, JavaScript's global `eval()` function can evaluate arbitrary strings as code, posing severe security risks (XSS attacks) if the string is user-supplied. In React, a safer sandbox alternative is to use the `Function` constructor:
```javascript
// Safely evaluate a math string
const safeEvaluate = (expression) => {
  return Function(`"use strict"; return (${expression})`)();
};
```

### Step-by-Step Implementation (`Calculator.jsx`)

Create `src/components/Calculator.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const Calculator = () => {
  const [input, setInput] = useState("");

  const clear = () => setInput("");
  const append = (value) => {
    // Avoid double operators in succession
    const lastChar = input[input.length - 1];
    const operators = ["+", "-", "*", "/"];
    if (operators.includes(value) && operators.includes(lastChar)) return;
    setInput((prev) => prev + value);
  };
  
  const calculate = () => {
    if (!input) return;
    try {
      // Evaluate string mathematically using the safer Function constructor
      const result = Function(`"use strict"; return (${input})`)();
      setInput(Number(result).toString());
    } catch {
      setInput("Error");
    }
  };

  return (
    <div style={calcStyles.wrapper}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Project 4: React Calculator</h2>
      <div style={calcStyles.container}>
        <div style={calcStyles.display}>{input || "0"}</div>
        <div style={calcStyles.grid}>
          <button style={calcStyles.clearBtn} onClick={clear}>C</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("/")}>/</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("*")}>*</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("-")}>-</button>
          
          <button style={calcStyles.btn} onClick={() => append("7")}>7</button>
          <button style={calcStyles.btn} onClick={() => append("8")}>8</button>
          <button style={calcStyles.btn} onClick={() => append("9")}>9</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("+")}>+</button>
          
          <button style={calcStyles.btn} onClick={() => append("4")}>4</button>
          <button style={calcStyles.btn} onClick={() => append("5")}>5</button>
          <button style={calcStyles.btn} onClick={() => append("6")}>6</button>
          <button style={calcStyles.equalBtn} onClick={calculate}>=</button>
          
          <button style={calcStyles.btn} onClick={() => append("1")}>1</button>
          <button style={calcStyles.btn} onClick={() => append("2")}>2</button>
          <button style={calcStyles.btn} onClick={() => append("3")}>3</button>
          <button style={calcStyles.btn} onClick={() => append("0")}>0</button>
        </div>
      </div>
    </div>
  );
};

const calcStyles = {
  wrapper: {
    maxWidth: "350px",
    margin: "30px auto",
    fontFamily: "'Segoe UI', monospace"
  },
  container: {
    backgroundColor: "#2c3e50",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
  },
  display: {
    backgroundColor: "#ecf0f1",
    padding: "15px",
    borderRadius: "5px",
    fontSize: "2rem",
    textAlign: "right",
    color: "#2c3e50",
    marginBottom: "20px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px"
  },
  btn: {
    padding: "20px",
    fontSize: "1.2rem",
    backgroundColor: "#34495e",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  operatorBtn: {
    padding: "20px",
    fontSize: "1.2rem",
    backgroundColor: "#e67e22",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  clearBtn: {
    padding: "20px",
    fontSize: "1.2rem",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  equalBtn: {
    gridRow: "span 2",
    backgroundColor: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these beginner projects. Click **Reveal Answer** to verify.

### 1. Why do we need a cleanup function in `useFetch` or API calls inside `useEffect`?
<details>
  <summary><b>Reveal Answer</b></summary>

  To prevent updating state on components that have already been unmounted (removed from screen). If an API call finishes after a component is unmounted, calling the state setter triggers a memory leak warning in the browser console. Using an `active` boolean flag inside the effect's cleanup prevents this.
</details>

### 2. Why is the JavaScript native `eval()` discouraged, and what is a safer alternative?
<details>
  <summary><b>Reveal Answer</b></summary>

  `eval()` executes any string as JavaScript code. If a user can inject malicious text into your input, it can lead to Cross-Site Scripting (XSS) or remote code execution. A safer alternative is to construct a sandbox function scope using `Function("return (" + expression + ")")()`, or use mathematical parser libraries like `mathjs`.
</details>

### 3. How does `gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))"` enhance responsiveness?
<details>
  <summary><b>Reveal Answer</b></summary>

  It automatically fits as many grid columns as possible on screen. Each column is guaranteed to be at least `220px` wide. If space permits, columns grow to fill remaining fraction units (`1fr`) equally, eliminating the need for complex media queries.
</details>

### 4. What happens when you fetch data inside `useEffect` without an empty dependency array `[]`?
<details>
  <summary><b>Reveal Answer</b></summary>

  The API will fetch on the first render, update the state, trigger a re-render, fetch again, update state, and loop indefinitely. This will spam the API server and quickly freeze the browser tab.
</details>

### 5. Why do we use `.catch()` at the end of a `.then()` fetch chain?
<details>
  <summary><b>Reveal Answer</b></summary>

  `.catch()` catches any network connection errors, server timeout failures, or manual throw errors that occur within the promise chain. Failing to capture errors will result in unhandled promise rejections, leaving user interfaces stuck in loading states.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Category Filter for Meals
1. Open `Meals.jsx`.
2. Add a row of filter buttons at the top of your page: "Seafood", "Chicken", "Beef".
3. Add a state variable `category` initialized to `"Seafood"`.
4. Trigger the `useEffect` fetch call whenever `category` changes by adding it to the dependency array. Render the food gallery matching the chosen category.

### 🛠️ Exercise 2: Add Backspace Control to Calculator
1. Open `Calculator.jsx`.
2. Add a backspace button labeled `"⌫"` or `"DEL"`.
3. Clicking this button should remove the last character of the `input` string state:
   ```javascript
   const deleteLast = () => setInput((prev) => prev.slice(0, -1));
   ```
