# Projects 1 & 2: Counter & Todo List 🚀

In this lesson, we will build our first two beginner projects: a **Counter Application** and a **Todo List**. These projects form the bedrock of interactive React development, practicing state management (`useState`), event bindings, form controls, and immutable array operations.

---

## 🔢 Project 1: Counter Application

The Counter is the canonical "Hello World" of React state. It allows us to view and modify a numerical state using buttons.

### Key Concepts Practiced:
* Managing numeric states with `useState`.
* Event handlers (`onClick`).
* Functional updates (`prev => prev + 1`) to ensure state accuracy.

### Step-by-Step Implementation (`Counter.jsx`)

Create a component file at `src/components/Counter.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  // 1. Functional updates are a best practice to avoid stale state bugs
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Project 1: React Counter</h2>
      <div style={styles.counterBox}>
        <h1 style={styles.number}>{count}</h1>
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnDecrement} onClick={decrement}>- Decrement</button>
        <button style={styles.btnReset} onClick={reset}>Reset</button>
        <button style={styles.btnIncrement} onClick={increment}>+ Increment</button>
      </div>
    </div>
  );
};

// Sleek inline styling system
const styles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "400px",
    margin: "20px auto",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: {
    color: "#2c3e50",
    marginBottom: "20px"
  },
  counterBox: {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  number: {
    fontSize: "4rem",
    margin: "0",
    color: "#2980b9"
  },
  btnGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px"
  },
  btnIncrement: {
    flex: 1,
    padding: "10px 15px",
    backgroundColor: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnDecrement: {
    flex: 1,
    padding: "10px 15px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnReset: {
    padding: "10px 15px",
    backgroundColor: "#95a5a6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
```

---

## 📝 Project 2: Todo List Application

The Todo List project transitions from simple numbers to managing **arrays of objects**. We will support adding tasks, marking tasks complete, and deleting tasks.

### Key Concepts Practiced:
* **Controlled Inputs**: Binding input fields to local state variables.
* **Immutable Updates**: Creating copies of arrays using the spread operator (`...`) or `.filter()`, rather than modifying the state array directly.
* **Rendering Lists**: Iterating over elements using `.map()` and assigning distinct `key` attributes.

### Step-by-Step Implementation (`Todo.jsx`)

Create a component file at `src/components/Todo.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. ADD ITEM: Return a new array containing existing items plus the new item
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false
    };

    setTodos([...todos, newTodo]);
    setInput(""); // Clear input box
  };

  const toggleComplete = (id) => {
    // 2. UPDATE ITEM: Map through and create a copy of the changed object
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    // 3. DELETE ITEM: Filter out the item to create a new array
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div style={todoStyles.card}>
      <h2 style={todoStyles.title}>Project 2: React Todo List</h2>
      <form onSubmit={handleSubmit} style={todoStyles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          style={todoStyles.input}
        />
        <button type="submit" style={todoStyles.addBtn}>Add</button>
      </form>

      <ul style={todoStyles.list}>
        {todos.map((todo) => (
          <li key={todo.id} style={todoStyles.item}>
            <span
              onClick={() => toggleComplete(todo.id)}
              style={{
                ...todoStyles.text,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#95a5a6" : "#2c3e50"
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)} style={todoStyles.removeBtn}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && <p style={todoStyles.emptyText}>No tasks added yet!</p>}
    </div>
  );
};

const todoStyles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "500px",
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: {
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: "20px"
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem"
  },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 10px",
    borderBottom: "1px solid #eee"
  },
  text: {
    cursor: "pointer",
    flex: 1,
    fontSize: "1.1rem"
  },
  removeBtn: {
    padding: "5px 10px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  emptyText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "20px"
  }
};
```

---

## ⚠️ Essential Practice: The Immutability Rule

> [!IMPORTANT]
> You must **never** mutate React state directly.
> - **Incorrect**: `todos.push(newTodo)` followed by `setTodos(todos)`.
> - **Correct**: `setTodos([...todos, newTodo])`.
> React uses shallow reference comparisons to determine if state has updated. If you mutate the array directly, the memory reference remains the same, and React will not trigger a re-render.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these beginner projects. Click **Reveal Answer** to verify.

### 1. Why does React require a unique `key` prop for items inside a `.map()` list?
<details>
  <summary><b>Reveal Answer</b></summary>

  React uses the `key` prop during **Reconciliation** (re-rendering lists). The key acts as a stable ID for each item, telling React which items were added, changed, or removed. Without keys, React has to re-render the entire list structure, slowing down rendering performance and causing issues with input focus.
</details>

### 2. Can we use array indexes (`index`) as the `key` prop? What problems can it cause?
<details>
  <summary><b>Reveal Answer</b></summary>

  While React allows it, using array indexes as keys is an anti-pattern for dynamic lists. If list items are sorted, deleted, or inserted in the middle, the index changes for existing elements. This confuses React's reconciliation engine, leading to rendering bugs (like text inputs remaining in the wrong rows) and degraded performance.
</details>

### 3. What is a "controlled input" in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  A controlled input is an `<input>` element whose value is driven by a React state variable (via the `value` attribute) and updated through a React state setter (via the `onChange` event listener). This makes React the single source of truth for the input's content.
</details>

### 4. What is the spread operator (`...`) and why is it used so frequently in React state changes?
<details>
  <summary><b>Reveal Answer</b></summary>

  The spread operator copy-pastes the elements of an existing array or object into a brand-new array or object literal: `[...existingArray, newItem]`. It is used because React state must be updated immutably. The spread operator creates a brand-new object reference, signaling React to re-render.
</details>

### 5. Why do we wrap event handlers in forms inside `e.preventDefault()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  By default, standard HTML forms refresh the browser page when submitted. Calling `e.preventDefault()` tells the browser to cancel this default action, allowing React code to handle the submit event asynchronously (e.g. updating local state or calling APIs) without refreshing the web page.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Advanced Counter Operations
1. Render `<Counter />` inside your `App.jsx`.
2. Add a text input field to the counter.
3. Allow the user to enter a custom step amount (e.g. `5`), so that clicking the Increment button increases the count by `5` instead of `1`.

### 🛠️ Exercise 2: Clear All Tasks & Count Badge
1. Open your `<Todo />` component.
2. Add a badge or a paragraph at the bottom indicating: "Pending tasks: X" (calculate this from the number of incomplete items).
3. Add a "Clear All" button that triggers a state change resetting the `todos` array to `[]`.
