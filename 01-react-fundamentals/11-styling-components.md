# Styling React Components 🎨

React offers multiple ways to apply CSS styles to your components. In this lesson, we will focus on the fundamentals: **Inline Styles** (using double curly braces) and **Style Objects** (declaring styles as JavaScript variables).

---

## ⚡ 1. Inline Styles (Double Curly Braces)

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

---

## ⚠️ Important Syntax Rule: camelCase Properties

In standard CSS, property names are kebab-cased (e.g. `background-color`, `font-size`, `padding-left`). 
Because inline styles in React are written as JavaScript objects, property names **must be written in camelCase** (e.g. `backgroundColor`, `fontSize`, `paddingLeft`).

| Standard CSS | React JSX Style |
| :--- | :--- |
| `background-color` | `backgroundColor` |
| `font-size` | `fontSize` |
| `padding-left` | `paddingLeft` |
| `border-radius` | `borderRadius` |

> [!NOTE]
> Values must be wrapped in quotation marks if they are strings (e.g., `"20px"`, `"center"`, `"red"`). Numbers can sometimes be written directly without units, in which case React will automatically default to pixels (e.g. `padding: 15` will compile to `15px`).

---

## ⚡ 2. Style Objects (Clean & Organized Approach)

To keep your JSX template clean and easy to read, you can extract the styling rules into a separate JavaScript object variable instead of writing it all inline.

```jsx
const CardComponent = () => {
  // Define styles as a JavaScript object
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

  // Reference the style objects inside JSX
  return (
    <div style={cardStyles}>
      <h2 style={titleStyles}>Style Card Title</h2>
      <p>This card is styled cleanly using external style objects.</p>
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Styling Components. Click **Reveal Answer** to verify.

### 1. Why do we write `style={{ color: "red" }}` with double curly braces?
<details>
  <summary><b>Reveal Answer</b></summary>

  The first (outer) set of curly braces enters the JavaScript mode in JSX. The second (inner) set of curly braces represents the JavaScript object containing the CSS property-value pairs.
</details>

### 2. How do you translate the CSS property `text-align` to React inline styles?
<details>
  <summary><b>Reveal Answer</b></summary>

  You convert it to camelCase: `textAlign` (e.g., `textAlign: "center"`).
</details>

### 3. What is the difference between inline styling and using a style object variable?
<details>
  <summary><b>Reveal Answer</b></summary>

  Functionally, they perform the same task. However, style object variables keep the JSX code clean, readable, and make the styles easier to maintain or share within the component.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Styled Card
1. Create a component `StyledCard.jsx` inside `src/components/`.
2. Define a style object:
   - Background color: `lightgray`
   - Padding: `20px`
   - Border radius: `10px`
   - Color: `darkblue`
3. Render a card with an `<h1>` and a paragraph, applying the style object to the container.
4. Import and render `<StyledCard />` inside your `App.jsx`.
