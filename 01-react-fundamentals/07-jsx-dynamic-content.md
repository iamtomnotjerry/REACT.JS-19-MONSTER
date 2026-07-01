# Dynamic Content in JSX ⚛️

JSX allows you to embed JavaScript expressions directly into your HTML-like structure. This is what makes React interfaces dynamic, allowing you to display variables, compute values, execute functions, and format attributes dynamically.

To enter "JavaScript mode" inside JSX, we wrap the expression in **curly braces `{}`**.

---

## ⚡ The Curly Braces `{}` Rule

If you write expressions inside JSX without curly braces, React treats them as plain text. Wrapping them in curly braces tells React to compile it as a JavaScript expression.

```jsx
// React treats this as plain text
<p>2 + 2</p>  // Outputs: 2 + 2

// React treats this as a JavaScript expression
<p>{2 + 2}</p>  // Outputs: 4
```

---

## 🌟 Common Use Cases for `{}`

### 1. Rendering Variables
You can render any standard variable (strings, numbers, etc.) directly in your JSX.
```jsx
const MyComponent = () => {
  const username = "MonsterCoder";
  return <h1>Welcome back, {username}!</h1>;
};
```

### 2. Embedding JavaScript Expressions
Any valid single-line JavaScript expression that evaluates to a value can be embedded.
```jsx
<p>2 * 10 is equal to: {2 * 10}</p> // Outputs: 2 * 10 is equal to: 20
```

### 3. Rendering Array Contents
React can render arrays directly. It will print out each element sequentially.
```jsx
const MyComponent = () => {
  const friends = ["Alex", "John", "Jordan"];
  return <p>My friends: {friends}</p>; // Outputs: My friends: AlexJohnJordan
};
```
*(Note: To render arrays cleanly as a list, we typically use the `.map()` method, which we will learn in the next lesson!)*

### 4. Executing Functions & Helper Methods
You can call any JavaScript function inside curly braces, and React will render whatever the function returns. This is ideal for formatting data before displaying it.
```jsx
const MyComponent = () => {
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div>
      <p>Total cost: {formatPrice(19.99)}</p> {/* Outputs: Total cost: $19.99 */}
    </div>
  );
};
```

### 5. Dynamic Class Names and Attributes
You can assign variables dynamically to HTML/JSX attributes, such as `src`, `href`, or `className`. For dynamic styling, template literals inside curly braces are the industry standard:
```jsx
const Button = ({ variant, isActive }) => {
  const baseClass = "btn";
  
  return (
    <button className={`${baseClass} btn-${variant} ${isActive ? "active" : ""}`}>
      Click Me
    </button>
  );
};
```

---

## ⚠️ Critical Pitfalls & Edge Cases

When working with JSX dynamic content, there are several behaviors that frequently catch developers off guard:

### 1. The Object Rendering Crash (Run-time Error)
React **cannot** render plain JavaScript objects directly as children inside JSX. Doing so will crash your application with a run-time error: `Error: Objects are not valid as a React child`.

* **Incorrect:**
  ```jsx
  const user = { name: "Alex", age: 25 };
  return <div>{user}</div>; // ❌ CRASHES the app!
  ```
* **Correct:** Render individual primitive properties or serialize the object for debugging:
  ```jsx
  return (
    <div>
      <p>Name: {user.name}</p> {/* ✅ Works */}
      <pre>{JSON.stringify(user, null, 2)}</pre> {/* ✅ Works (for debugging) */}
    </div>
  );
  ```

### 2. Booleans, `null`, and `undefined` are Ignored
Values like `true`, `false`, `null`, and `undefined` are valid JSX elements but **do not render anything** to the DOM. This is extremely useful for conditional rendering, but if you actually need to display them, you must convert them to strings:

* **No output:**
  ```jsx
  const isOnline = true;
  return <div>Status: {isOnline}</div>; // Renders: "Status: "
  ```
* **Displaying the value:**
  ```jsx
  return <div>Status: {isOnline.toString()}</div>; // Renders: "Status: true"
  // OR
  return <div>Status: {isOnline ? "Online" : "Offline"}</div>;
  ```

### 3. The `0` Short-Circuit Rendering Bug
Because booleans render nothing, a common React pattern is short-circuit evaluation: `{condition && <Component />}`. However, if the condition evaluates to the number `0`, React **will render the `0`** on the screen because `0` is a number, not a boolean.

* **Buggy Code:**
  ```jsx
  const items = [];
  return <div>{items.length && <p>Items available!</p>}</div>; // Renders: "0" ❌
  ```
* **Safe Code:** Always resolve the check to an actual boolean value:
  ```jsx
  return <div>{items.length > 0 && <p>Items available!</p>}</div>; // Renders: nothing ✅
  // OR using ternary
  return <div>{items.length ? <p>Items available!</p> : null}</div>;
  ```

### 4. Direct Strings vs. Curly Braces in Attributes
Do not combine quotes and curly braces when passing dynamic attributes. 
* **Incorrect:** `src="{imageUrl}"` or `src="{{imageUrl}}"`
* **Correct:** `src={imageUrl}`

---

## 🧠 Test Your Knowledge (Interview Questions)

Answer these questions to check your understanding of dynamic content. Click **Reveal Answer** to verify.

### 1. What happens if you do not wrap `2 + 2` in curly braces inside a JSX tag?
<details>
  <summary><b>Reveal Answer</b></summary>

  React will treat it as a literal string and display `2 + 2` on the screen.
</details>

### 2. Can you write a multi-line statement (like `if-else` or `for` loop) directly inside JSX curly braces?
<details>
  <summary><b>Reveal Answer</b></summary>

  **No.** You can only write **expressions** (code that evaluates to a value) inside curly braces. Statements like `if-else`, `for`, `while`, and variable declarations are syntax errors. For conditional logic, you must use ternary operators (`? :`), logical operators (`&&`), or call a helper function that contains the statements.
</details>

### 3. How does React protect dynamic content inside `{}` from Cross-Site Scripting (XSS) attacks?
<details>
  <summary><b>Reveal Answer</b></summary>

  By default, React **automatically escapes** all values rendered in JSX before displaying them. This means any HTML code passed as a dynamic string will be rendered as plain text rather than being parsed and executed as code. If you explicitly want to render HTML strings, you must use the `dangerouslySetInnerHTML` attribute.
</details>

### 4. What will be rendered by `<div>{false || "Fallback Text"}</div>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  It will render `"Fallback Text"`. Since `false` is ignored, the logical OR operator (`||`) falls back to the right-hand string expression, which React renders.
</details>

### 5. Why is `<img src={logoUrl} alt="logo" />` correct while `<img src="{logoUrl}" alt="logo" />` is wrong?
<details>
  <summary><b>Reveal Answer</b></summary>

  The second option treats `"{logoUrl}"` as a literal string path, meaning the browser will attempt to load a file literally named `{logoUrl}` which will fail. The first option uses curly braces, allowing React to evaluate the variable `logoUrl` and assign its string value to the `src` attribute.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Dynamic Greeting & Time Formatter
1. Create a new component file `Greetings.jsx` inside `src/components/`.
2. Define a string variable `greetMessage` (e.g. `"Welcome to React!"`).
3. Render this message dynamically inside an `<h1>` tag.
4. Display the current date and time formatted nicely (e.g., using `new Date().toLocaleString()`) dynamically inside a `<p>` tag.
5. Import and render `<Greetings />` inside your `App.jsx`.

### 🛠️ Exercise 2: Product Card with Dynamic Styling
1. Create a new component file `ProductInfo.jsx` inside `src/components/`.
2. Define a product object:
   ```javascript
   const product = {
     name: "Ultra-Wide Monitor",
     price: 499.99,
     availability: "Out of Stock" // Try changing to "In Stock"
   };
   ```
3. Dynamically display the product's name, formatted price (e.g., `$499.99`), and availability.
4. **Challenge**: Dynamically apply styling depending on availability:
   - If the product is `"In Stock"`, render the availability in a class named `status-available` (green text).
   - If it is `"Out of Stock"`, render the availability in a class named `status-unavailable` (red text).
   - *Tip*: Use template literals in the `className` attribute.
5. Import and render `<ProductInfo />` inside `App.jsx`.
