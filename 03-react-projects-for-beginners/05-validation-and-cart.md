# Projects 9 & 10: Form Validation & Shopping Cart 🚀

In this lesson, we will build a **Sign-Up Form with Validation** and a **Shopping Cart**. These projects combine multiple input states, conditional styling, array indexing, and aggregate summary calculations (total items and prices).

---

## 📝 Project 9: Form Validation

This project manages a registration form that validates input fields (username, email, password) dynamically, displaying color-coded feedback and custom error warnings.

### Key Concepts Practiced:
* Validating fields with criteria (e.g. Email Regex checks, Password lengths).
* Storing form errors in a single dictionary state object (`errors`).
* Applying conditional inline styles based on the presence of validation errors.

### Step-by-Step Implementation (`Form.jsx`)

Create `src/components/Form.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const Form = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = (e) => {
    e.preventDefault();
    let tempErrors = {};

    // 1. Username checks
    if (!username.trim()) {
      tempErrors.username = "Username is required";
    }

    // 2. Email format validation using regular expressions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    // 3. Password strength checks
    if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);

    // 4. Submit if error dictionary is empty
    if (Object.keys(tempErrors).length === 0) {
      alert("Registration Successful! 🎉");
      // Reset form fields
      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Project 9: Signup Form</h2>
      <form onSubmit={validate}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.username ? "#e74c3c" : "#2ecc71"
            }}
          />
          {errors.username && <p style={styles.errorText}>{errors.username}</p>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.email ? "#e74c3c" : "#2ecc71"
            }}
          />
          {errors.email && <p style={styles.errorText}>{errors.email}</p>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.password ? "#e74c3c" : "#2ecc71"
            }}
          />
          {errors.password && <p style={styles.errorText}>{errors.password}</p>}
        </div>

        <button type="submit" style={styles.submitBtn}>Register</button>
      </form>
    </div>
  );
};

const styles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "400px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "20px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#34495e"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    borderWidth: "2px",
    borderStyle: "solid",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box"
  },
  errorText: {
    color: "#e74c3c",
    fontSize: "0.85rem",
    margin: "5px 0 0 0"
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#9b59b6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    marginTop: "10px"
  }
};
```

---

## 🛒 Project 10: Shopping Cart Application

A product catalog linked to an interactive shopping cart. Users add items to the cart, adjust quantity counts, and watch calculations update live.

### Key Concepts Practiced:
* Appending elements conditionally: updating `qty` counts for existing products vs inserting new items.
* Calculating totals using array `.reduce()`:
  ```javascript
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  ```

### Step-by-Step Implementation (`Cart.jsx`)

Create `src/components/Cart.jsx` and insert the following code:

```jsx
import { useState } from 'react';

export const Cart = () => {
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: "Premium T-Shirt", price: 25 },
    { id: 2, name: "Running Sneakers", price: 85 },
    { id: 3, name: "Wireless Headphones", price: 120 }
  ];

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    
    if (existing) {
      // 1. UPDATE: Map through and increment quantity
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      // 2. ADD FRESH: Append item object initialized with qty: 1
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const clearCart = () => setCart([]);

  // Calculate aggregate quantities and total prices
  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={cartStyles.container}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Project 10: Shopping Cart</h2>
      
      <h3>Product Catalog</h3>
      <div style={cartStyles.catalog}>
        {products.map((p) => (
          <div key={p.id} style={cartStyles.prodCard}>
            <h4>{p.name}</h4>
            <p style={{ margin: "5px 0" }}>Price: ${p.price}</p>
            <button style={cartStyles.addBtn} onClick={() => addToCart(p)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "40px" }}>Your Basket</h3>
      <div style={cartStyles.basket}>
        {cart.length === 0 ? (
          <p style={cartStyles.empty}>Your cart is currently empty.</p>
        ) : (
          <div>
            <ul style={cartStyles.list}>
              {cart.map((item) => (
                <li key={item.id} style={cartStyles.item}>
                  <span>{item.name} (x{item.qty})</span>
                  <span>${item.price * item.qty}</span>
                </li>
              ))}
            </ul>
            <div style={cartStyles.summary}>
              <p>Total Items: <strong>{totalQuantity}</strong></p>
              <p>Total Cost: <strong>${totalPrice}</strong></p>
            </div>
            <button style={cartStyles.clearBtn} onClick={clearCart}>
              Clear Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const cartStyles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px",
    fontFamily: "Arial, sans-serif"
  },
  catalog: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  },
  prodCard: {
    border: "1px solid #dfe6e9",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    textAlign: "center"
  },
  addBtn: {
    padding: "8px 12px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  basket: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #e2e8f0"
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    paddingTop: "10px",
    borderTop: "2px solid #cbd5e1"
  },
  clearBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "15px"
  },
  empty: {
    textAlign: "center",
    color: "#7f8c8d"
  }
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these advanced beginner projects. Click **Reveal Answer** to verify.

### 1. How does `errors` dictionary state prevent form submissions in validation?
<details>
  <summary><b>Reveal Answer</b></summary>

  During form submission, we run validation checks. If any field fails, we populate a local object `tempErrors` with warning strings. We check `Object.keys(tempErrors).length === 0`. If the length is not zero, it means errors exist, and we block submission and write the object to state to display warnings on screen.
</details>

### 2. How does the JavaScript array `.reduce()` method function?
<details>
  <summary><b>Reveal Answer</b></summary>

  `.reduce()` iterates over an array, compiling its contents down to a single value (number, object, etc.). It takes a callback `(accumulator, item) => ...` and an initial value (e.g. `0`). In our cart:
  `cart.reduce((sum, item) => sum + (item.price * item.qty), 0)`
  It starts `sum` at `0`, adds item prices multiplied by quantities, and returns the final sum.
</details>

### 3. Why must we copy items like `{ ...item, qty: item.qty + 1 }` when updating quantities in shopping carts?
<details>
  <summary><b>Reveal Answer</b></summary>

  In JavaScript, nested objects inside arrays are copied by reference. Modifying `item.qty = item.qty + 1` mutates the active object reference directly. To satisfy React's strict immutability criteria, we must create a shallow copy of the object using `{ ...item }` and override only the `qty` property.
</details>

### 4. What is a regular expression (Regex) and how is it used in form validation?
<details>
  <summary><b>Reveal Answer</b></summary>

  A regular expression is a syntax pattern matching string combinations. `const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;` ensures the string has text, an `@` symbol, text, a dot `.`, and domain text, returning `true` or `false` when verified via `emailRegex.test(string)`.
</details>

### 5. Why do we clear forms by setting state values to `""` in submit handlers?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because our inputs are controlled components tied to state. Setting state variables back to `""` automatically clears the text inside the browser's input fields, ensuring the UI reflects successful submission.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your React project:

### 🛠️ Exercise 1: Confirm Password Matching Field
1. Open `Form.jsx`.
2. Add a fourth input field: "Confirm Password" with state `confirmPassword`.
3. Modify the submit validation check: ensure that `confirmPassword` is not empty, and matches the `password` state.
4. Show custom error warnings if they do not match, blocking submission.

### 🛠️ Exercise 2: Quantity Adjusters & Item Removals
1. Open `Cart.jsx`.
2. Modify the basket listing. Next to each item quantity, render an Increment `[+]` button and Decrement `[-]` button.
3. Hook these up to state handlers:
   - Clicking `[+]` increases quantity count by 1.
   - Clicking `[-]` decreases quantity count by 1. If quantity reaches 0, remove the item from the cart array completely.
4. Add a "Remove" `[✕]` button to instantly delete an item from the cart regardless of its quantity.
