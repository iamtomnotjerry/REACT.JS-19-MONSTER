# Styling React Components 🎨

React offers multiple ways to apply CSS styles to your components. In this lesson, we will focus on the three primary styling methodologies: **External Stylesheets**, **Inline Styles**, and **Style Objects**.

---

## ⚡ 1. External Stylesheets (Standard Approach)

The most common way to style React components is by writing standard CSS in a separate stylesheet and importing it into your React file.

### How to Use External Styles:
1. Create a CSS file (e.g. `Button.css`):
```css
/* Button.css */
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
}
```

2. Import and apply classes inside your JSX:
```jsx
// Button.jsx
import './Button.css';

const Button = () => {
  return <button className="btn-primary">Click Me</button>;
};
```

> [!IMPORTANT]
> **Why `className` instead of `class`?**
> In standard HTML, we use the `class` attribute. In React/JSX, we **must use `className`**. This is because JSX compiles into JavaScript, and `class` is already a reserved keyword in JavaScript (used for ES6 classes).

---

## ⚡ 2. Inline Styles (Double Curly Braces)

In JSX, you specify inline styles using the `style` attribute. Instead of passing a plain string (like in regular HTML), you must pass a **JavaScript object**. This results in the double curly braces syntax: `style={{ ... }}`.
- The **outer** braces `{}` enter the JavaScript expression world.
- The **inner** braces `{}` denote the JavaScript object literal.

```jsx
const InlineStyledComponent = () => {
  return (
    <h1 style={{ color: "lightblue", fontSize: "24px", textAlign: "center" }}>
      Hello, Styled React!
    </h1>
  );
};
```

### ⚠️ Important Syntax Rule: camelCase Properties
In standard CSS, property names are kebab-cased (e.g. `background-color`, `font-size`). Because inline styles in React are written as JavaScript objects, property names **must be written in camelCase**:

| Standard CSS | React JSX Style |
| :--- | :--- |
| `background-color` | `backgroundColor` |
| `font-size` | `fontSize` |
| `padding-left` | `paddingLeft` |
| `border-radius` | `borderRadius` |

*Note: Values must be wrapped in quotation marks if they are strings (e.g., `"20px"`, `"red"`). Numbers can be written directly, defaulting to pixels (e.g., `padding: 15` compiles to `15px`).*

---

## ⚡ 3. Style Objects (Clean & Organized Approach)

To keep your JSX template clean and easy to read, you can extract the styling rules into a separate JavaScript object variable instead of writing it all inline.

```jsx
const CardComponent = () => {
  const cardStyles = {
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    color: "#333"
  };

  const titleStyles = {
    color: "darkblue",
    fontSize: "20px"
  };

  return (
    <div style={cardStyles}>
      <h2 style={titleStyles}>Style Card Title</h2>
      <p>This card is styled cleanly using external style objects.</p>
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge (Interview Prep)

Answer these questions to check your understanding of Styling Components. Click **Reveal Answer** to verify.

### 1. Why do we write `style={{ color: "red" }}` with double curly braces?
<details>
  <summary><b>Reveal Answer</b></summary>

  The first (outer) set of curly braces enters the JavaScript mode in JSX. The second (inner) set of curly braces represents the JavaScript object containing the CSS property-value pairs.
</details>

### 2. Why does React use `className` instead of `class` in JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  Since JSX is a syntax extension of JavaScript, it must avoid using reserved JavaScript keywords. `class` is a reserved keyword in JavaScript (used to define ES6 classes), so React uses `className` for HTML element classes instead.
</details>

### 3. How do you translate the CSS property `text-align` to React inline styles?
<details>
  <summary><b>Reveal Answer</b></summary>

  You convert it to camelCase: `textAlign` (e.g., `textAlign: "center"`).
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Styled Card (Inline & Style Object)
1. Create a component `StyledCard.jsx` inside `src/components/`.
2. Define a style object:
   - Background color: `lightgray`
   - Padding: `20px`
   - Border radius: `10px`
   - Color: `darkblue`
3. Render a card with an `<h1>` and a paragraph, applying the style object to the container.
4. Import and render `<StyledCard />` inside your `App.jsx`.

### 🛠️ Exercise 2: Card with External CSS
1. Create a stylesheet `Card.css` in `src/styles/` (or inside `src/components/`).
2. Add a class name `.card-container` with border, padding, and box-shadow.
3. Create `Card.jsx` inside `src/components/`. Import `Card.css` at the top.
4. Render a container using `className="card-container"` to wrap some text.
5. Render it in `App.jsx` to test.
