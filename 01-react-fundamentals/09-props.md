# Props in React 🎁

**Props** (short for *properties*) are the mechanism used to pass data from a parent component down to a child component. They allow you to make components dynamic, reusable, and configurable.

Props are **read-only** (immutable). A child component should never modify the props it receives.

---

## ⚡ How Props Work

Props are passed to components similarly to how attributes are specified on HTML tags (e.g. `src` or `href`).

### 1. Passing Props from Parent
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

### 2. Receiving Props in Child
In the child component, props are received as a single object argument in the function:

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

## 💡 Prop Destructuring (Recommended)

To make your code cleaner and avoid writing `props.` repeatedly, you can destructure the props object directly in the function signature:

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

Props can accept any JavaScript data type, including strings, numbers, booleans, arrays, objects, and even functions or JSX elements:

```jsx
// Parent passing complex data types
<UserCard
  name="Jane Doe"
  age={28}
  hobbies={["Reading", "Coding", "Gaming"]}
  address={{ city: "New York", zip: "10001" }}
  imgUrl="https://example.com/avatar.jpg"
/>
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Props. Click **Reveal Answer** to verify.

### 1. Can a child component modify the props it receives?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Props are read-only (immutable). If you need to change data inside a component, you should use **State** instead of modifying props.
</details>

### 2. How do you pass a boolean value or a number as a prop?
<details>
  <summary><b>Reveal Answer</b></summary>

  You must wrap them in curly braces: `<MyComponent age={25} isPremium={true} />`. (Strings can be passed using double quotes directly: `<MyComponent name="Alice" />`).
</details>

### 3. What is prop destructuring and why is it used?
<details>
  <summary><b>Reveal Answer</b></summary>

  Prop destructuring is extracting individual properties from the `props` object immediately in the function arguments or function body. It is used to keep code clean and readable, eliminating the need to prepend `props.` to every variable.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Custom UserCard Component
1. Create a component `UserCard.jsx` inside `src/components/`.
2. The component should accept `name`, `role`, and `bio` as props.
3. Apply simple styling to make it look like a card.
4. Import and render `<UserCard />` in `App.jsx` multiple times, passing different users' data.
