# Props and Component Composition in React 🎁

**Props** (short for *properties*) are read-only configuration arguments passed from a parent component down to a child component. They make your UI components dynamic, configurable, and highly reusable.

---

## ⚡ How Props Work

Props are passed to custom React components using a syntax that mimics HTML attributes.

### 1. Passing Props from the Parent Component
```jsx
// Parent Component (App.jsx)
import UserProfile from "./UserProfile";

const App = () => {
  return (
    <div>
      <UserProfile username="Alice" age={25} isMember={true} />
      <UserProfile username="Bob" age={30} isMember={false} />
    </div>
  );
};
```

### 2. Receiving Props in the Child Component
Props are received as a single object containing all key-value pairs passed by the parent:

```jsx
// Child Component (UserProfile.jsx)
const UserProfile = (props) => {
  return (
    <div className="user-card">
      <h2>Name: {props.username}</h2>
      <p>Age: {props.age}</p>
      <p>Status: {props.isMember ? "Active Member" : "Guest"}</p>
    </div>
  );
};
```

---

## 💡 Prop Destructuring (Recommended Best Practice)

To keep your code concise and avoid writing `props.` repeatedly, you should destructure the props object directly inside the component's function parameters:

```jsx
// Destructuring directly in the parameters
const UserProfile = ({ username, age, isMember }) => {
  return (
    <div className="user-card">
      <h2>Name: {username}</h2>
      <p>Age: {age}</p>
      <p>Status: {isMember ? "Active Member" : "Guest"}</p>
    </div>
  );
};
```

---

## 🌟 Passing Different Data Types as Props

Props can accept any standard JavaScript data type. Strings can be passed directly with quotes; other types (numbers, booleans, arrays, objects, functions) must be wrapped in curly braces `{}`:

```jsx
<UserCard
  name="Jane Doe"                             // String
  age={28}                                    // Number
  isMarried={false}                           // Boolean
  hobbies={["Reading", "Coding", "Gaming"]}   // Array
  address={{ city: "New York", zip: "10001" }} // Object
/>
```

---

## 🧩 The `children` Prop: Advanced Component Composition

The **`children`** prop is a special React prop automatically passed to every component. It contains whatever content (text, HTML, or other React components) is written **between the opening and closing tags** of the component.

This is the basis of **Component Composition** (nesting components inside wrappers).

### 1. Creating a Wrapper Component
```jsx
// Wrapper Component (Card.jsx)
const Card = ({ children }) => {
  const cardStyles = {
    border: "2px solid #ccc",
    borderRadius: "10px",
    padding: "20px",
    margin: "10px",
    boxShadow: "2px 2px 12px rgba(0, 0, 0, 0.1)"
  };

  return <div style={cardStyles}>{children}</div>;
};

export default Card;
```

### 2. Using the Wrapper Component
Instead of self-closing the tag (`<Card />`), you open and close it (`<Card>...</Card>`), placing any nested components inside:
```jsx
// Parent Component (App.jsx)
import Card from "./components/Card";

const App = () => {
  return (
    <div>
      <Card>
        <h2>Visual Container</h2>
        <p>This paragraph is passed dynamically as a child!</p>
      </Card>
      
      <Card>
        <button onClick={() => alert("Success!")}>Trigger Alert</button>
      </Card>
    </div>
  );
};
```

---

## ⚠️ Core Prop Rules

1. **Props are Read-Only (Immutable):** A component must never modify its own props. Doing so breaks React's unidirectional data flow and causes hard-to-track bugs. If data needs to change, use **State**.
2. **Pure Functions:** React components must act like pure functions with respect to their props—always returning the same UI layout for the same input prop values.

---

## 🧠 Test Your Knowledge (Interview Prep)

Answer these questions to check your understanding of Props. Click **Reveal Answer** to verify.

### 1. What is the primary difference between Props and State?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Props** are configuration settings passed down from parent to child. They are **immutable** (read-only) inside the child component.
  - **State** is a component's internal, private data store. It is **mutable** and can be updated inside the component to trigger re-renders.
</details>

### 2. What is the `children` prop in React? How is it passed to a component?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `children` prop is a built-in prop that lets you pass nested content (elements, strings, or components) into another component. It is passed by wrapping the contents between the opening and closing tags of the component: `<MyComponent> Nested Content Here </MyComponent>`.
</details>

### 3. Can a child component modify the props it receives? What is the technical term for this rule?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Props are immutable. React enforces **unidirectional data flow** (data flows down, never back up or sideways), and components must be **pure functions** that do not mutate their inputs.
</details>

### 4. What happens if you pass `<MyComponent count="5" />` versus `<MyComponent count={5} />`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `count="5"` passes the value as a plain **String**.
  - `count={5}` passes the value as a **Number** (inside the JavaScript expression braces).
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Person Component
1. Create a component `Person.jsx` inside `src/components/`.
2. The component should accept `name` and `age` as props.
3. Display the `name` in an `<h2>` tag and the `age` in a `<p>` tag.
4. Render it inside `App.jsx` passing your name and age.

### 🛠️ Exercise 2: Product Component
1. Create a component `Product.jsx` inside `src/components/`.
2. The component should accept `name` and `price` as props.
3. Display the product name inside an `<h2>` and the price formatted as `$Price` inside a `<p>`.

### 🛠️ Exercise 3: Composition wrapper
1. Create a component `Card.jsx` inside `src/components/`.
2. Destructure the `children` prop and render it inside a `div` with styling (e.g. padding, border, shadow).
3. Open `App.jsx` and use `<Card>` to wrap your `<Person>` component.
4. Use another `<Card>` to wrap your `<Product>` component.
5. Verify in the browser that both elements are now wrapped in clean, bordered containers!
