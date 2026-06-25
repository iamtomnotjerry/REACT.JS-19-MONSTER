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

### 4. Executing Functions
You can call a JavaScript function inside curly braces, and React will render whatever the function returns.
```jsx
const MyComponent = () => {
  const multiply = (a, b) => a * b;

  return (
    <p>
      Result: {multiply(5, 4)}
    </p>
  ); // Outputs: Result: 20
};
```

### 5. Dynamic Class Names and Attributes
You can assign variables dynamically to HTML/JSX attributes, such as `src`, `href`, or `className`.
```jsx
const MyComponent = () => {
  const specialClass = "highlight-box";
  return <div className={specialClass}>This box has a dynamic class.</div>;
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of dynamic content. Click **Reveal Answer** to verify.

### 1. What happens if you do not wrap `2 + 2` in curly braces inside a JSX tag?
<details>
  <summary><b>Reveal Answer</b></summary>

  React will treat it as a literal string and display `2 + 2` on the screen.
</details>

### 2. Can you write a multi-line `if-else` statement directly inside JSX curly braces?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Inside the curly braces, you can only write **expressions** (code that returns a value, like ternary operators or logical AND statements). You cannot write statements like `if`, `for`, or `switch` directly.
</details>

### 3. How do you pass a dynamic string variable into an `src` attribute of an image tag?
<details>
  <summary><b>Reveal Answer</b></summary>

  You replace the quote marks with curly braces containing the variable name: `<img src={imageUrl} alt="description" />`.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Dynamic Greeting
1. Create a new component file `Greetings.jsx` inside `src/components/`.
2. Define a string variable `greetMessage` (e.g. `"Hello World!"` or `"Gracias!"`).
3. Render this message dynamically inside an `<h1>` tag.
4. Create a paragraph tag `<p>` that displays the current date dynamically using `{new Date().getDate()}`.
5. Import and render `<Greetings />` inside your `App.jsx`.

### 🛠️ Exercise 2: Product Object Info
1. Create a new component file `ProductInfo.jsx` inside `src/components/`.
2. Define a product object with properties:
   ```javascript
   const product = {
     name: "Laptop",
     price: 1200,
     availability: "in stock"
   };
   ```
3. Dynamically display the product's name in an `<h1>`, price in a `<p>` (e.g., `$1200`), and availability status in another `<p>`.
4. Import and render `<ProductInfo />` inside `App.jsx`.
