# React State and the `useState` Hook 🐻

In React, **State** is a component's private, local memory. Unlike props which are read-only and passed down from parents, state is fully controlled by the component itself. When a component's state changes, React automatically schedules a **re-render** to display the updated data in the UI.

To declare and manage state in functional components, we use the **`useState`** Hook.

---

## ⚡ 1. Declaring State

To use `useState`, you first import it from the `'react'` library. The syntax uses JavaScript array destructuring:

```jsx
import { useState } from 'react';

const Counter = () => {
  // const [stateValue, setterFunction] = useState(initialValue);
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```
- `count`: The current state variable value.
- `setCount`: The setter function used to update the state variable.
- `0`: The initial value assigned to the state.

---

## 🌟 2. Managing Complex State Types

State is not limited to numbers or strings. You can store and update arrays, objects, and array of objects.

### A. Updating State with Arrays
Since state is immutable, **never modify the array directly** (e.g. do not write `friends.push('John')`). Always create a new array using the spread operator `...` or array methods like `.filter()`:

```jsx
const FriendsList = () => {
  const [friends, setFriends] = useState(["Alex", "Jordan"]);

  // Adding an item (Spread Operator)
  const addFriend = () => {
    setFriends([...friends, "John"]);
  };

  // Removing an item (Filter)
  const removeFriend = (nameToRemove) => {
    setFriends(friends.filter((friend) => friend !== nameToRemove));
  };

  return (
    <div>
      <button onClick={addFriend}>Add John</button>
      <ul>
        {friends.map((friend, idx) => (
          <li key={idx}>
            {friend} <button onClick={() => removeFriend(friend)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### B. Updating State with Objects
When updating state objects, you must copy the existing object properties using the spread operator `...` and then overwrite the specific field you want to change:

```jsx
const MovieCard = () => {
  const [movie, setMovie] = useState({
    title: "Equalizer 3",
    rating: 7
  });

  const updateRating = () => {
    // Copy movie properties, overwrite rating
    setMovie({
      ...movie,
      rating: 9
    });
  };

  return (
    <div>
      <h3>{movie.title}</h3>
      <p>Rating: {movie.rating}/10</p>
      <button onClick={updateRating}>Update Rating</button>
    </div>
  );
};
```

---

## 📝 3. Controlled Inputs & Form State

To capture keyboard input from the user, we bind the `value` attribute of an `<input>` element to a state variable, and update it using the `onChange` event:

```jsx
const InputForm = () => {
  const [name, setName] = useState("");

  const handleChange = (e) => {
    setName(e.target.value);
  };

  return (
    <div>
      <input type="text" value={name} onChange={handleChange} placeholder="Enter name" />
      <p>Your name is: {name}</p>
    </div>
  );
};
```
*How it works*: Every keystroke fires `handleChange`, which reads `e.target.value` (what the user typed) and updates the state. React then re-renders, displaying the new value in the input box and the paragraph tag.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of State. Click **Reveal Answer** to verify.

### 1. What happens to the UI when a component's state is updated?
<details>
  <summary><b>Reveal Answer</b></summary>

  React automatically triggers a re-render of the component and updates only the modified parts in the Real DOM.
</details>

### 2. Why shouldn't you write `myStateArray.push('item')` directly?
<details>
  <summary><b>Reveal Answer</b></summary>

  State is immutable in React. Modifying the array directly does not create a new array reference, so React will not detect the change and will not trigger a re-render. Always use the spread operator `[...myStateArray, 'item']` to create a new array reference.
</details>

### 3. What is a "controlled component" in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  A controlled component is an input element (like `<input>`, `<textarea>`, or `<select>`) whose value is driven by React state rather than the browser's internal DOM state.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Multi-Counter Component
1. Create a component `CounterList.jsx` inside `src/components/`.
2. Set up a state containing an array of counters:
   ```javascript
   const [counters, setCounters] = useState([0, 0, 0]);
   ```
3. Render three buttons, each showing the click count of its respective index.
4. Implement a function to increment a specific counter by index (using `.map()` to update the array immutably).
5. Import and render `<CounterList />` in `App.jsx`.
