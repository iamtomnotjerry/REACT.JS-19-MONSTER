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
* **`count`**: The current state variable value.
* **`setCount`**: The setter function used to update the state variable and trigger re-rendering.
* **`0`**: The initial value assigned to the state.

---

## 🌟 2. Managing Complex State Types (Immutability Rules)

State in React is **immutable** (cannot be directly changed). You must never modify your state variables directly (e.g. do not write `friends.push('John')` or `user.age = 26`). You must always pass a **brand-new copy** of the array or object to the setter function.

### A. Updating State with Arrays
Use the spread operator (`...`) to clone the array for additions, and methods like `.filter()` or `.map()` to remove or update items:

```jsx
const FriendsList = () => {
  const [friends, setFriends] = useState(["Alex", "Jordan"]);

  // 1. Adding an item (Clone & Add)
  const addFriend = () => {
    setFriends([...friends, "John"]); // ✅ Safe clone
  };

  // 2. Removing an item (Filter out)
  const removeFriend = (nameToRemove) => {
    setFriends(friends.filter((friend) => friend !== nameToRemove)); // ✅ Returns new array
  };

  // 3. Updating an item (Map & Replace)
  const updateFriend = (oldName, newName) => {
    setFriends(friends.map((f) => (f === oldName ? newName : f))); // ✅ Returns new array
  };

  return (
    <div>
      <button onClick={addFriend}>Add John</button>
      <button onClick={() => updateFriend("Alex", "Alex Smith")}>Update Alex</button>
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
Use the spread operator (`...`) to copy the existing properties, then specify and overwrite the properties that you want to change:

```jsx
const MovieCard = () => {
  const [movie, setMovie] = useState({
    title: "Equalizer 3",
    rating: 7
  });

  const updateRating = () => {
    setMovie({
      ...movie, // Copy existing properties
      rating: 9  // Overwrite rating
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

### C. Updating State with Array of Objects
To update a specific object nested inside a state array, use `.map()` to traverse the array, check for the matching identifier, and return a cloned object with the modified field:

```jsx
const MovieList = () => {
  const [movies, setMovies] = useState([
    { id: 1, title: "Spider-Man", rating: 8 },
    { id: 2, title: "Superman", rating: 6 }
  ]);

  const updateMovieTitle = (id) => {
    setMovies(
      movies.map((movie) => {
        if (movie.id === id) {
          return { ...movie, title: "John Wick 5" }; // Clone and update target object
        }
        return movie; // Return unchanged objects
      })
    );
  };

  return (
    <div>
      {movies.map((m) => (
        <div key={m.id}>
          <h3>{m.title} ({m.rating}/10)</h3>
          <button onClick={() => updateMovieTitle(m.id)}>Change Title</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 📈 3. Lifting State Up (Sharing State Between Components)

If multiple sibling components need to access or modify the same state, you must **lift the state up** to their closest common parent component and pass it down as props.

```jsx
// Parent Component (App.jsx)
import { useState } from 'react';
import ComponentOne from './ComponentOne';
import ComponentTwo from './ComponentTwo';

const App = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);

  return (
    <div>
      <h1>Shared Parent State</h1>
      <ComponentOne count={count} onIncrement={increment} />
      <ComponentTwo count={count} onIncrement={increment} />
    </div>
  );
};
```

```jsx
// Child Component One
const ComponentOne = ({ count, onIncrement }) => (
  <div>
    <p>Component 1 Count: {count}</p>
    <button onClick={onIncrement}>Increment Shared State</button>
  </div>
);
```

---

## ⚙️ 4. Lazy State Initialization

If the initial value of your state requires a heavy computation (e.g., parsing local storage, complex calculations), pass a **callback function** to `useState()`. React will execute this function **only once** when the component initially mounts, instead of executing it on every single render.

```jsx
// Lazy initialization pattern
const [name, setName] = useState(() => {
  const savedName = localStorage.getItem("username");
  return savedName ? JSON.parse(savedName) : "Guest"; // Runs ONLY on first mount!
});
```

---

## 📝 5. Controlled Inputs & Form State

To capture user text inputs, bind the input's `value` attribute to state and update it via the `onChange` event:

```jsx
const InputForm = () => {
  const [name, setName] = useState("");

  return (
    <div>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name" 
      />
      <p>Your name is: {name}</p>
    </div>
  );
};
```

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

### 4. What is Lazy Initialization in `useState` and when should you use it?
<details>
  <summary><b>Reveal Answer</b></summary>

  Lazy initialization is passing a function to `useState` (e.g., `useState(() => initialValue)`). It is used when computing the initial state value is expensive (like accessing `localStorage` or running loops). Passing a function ensures the code runs only once when the component mounts, rather than on every render cycle.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: Interactive Counter (Class Challenge 1)
1. Create `Counter.jsx` in `src/components/`.
2. Initialize state variable `count` to `0`.
3. Render two buttons: "Increment" and "Decrement".
4. Add click event handlers to increment and decrement the counter state by `1`.

### 🛠️ Exercise 2: Todo List Array (Class Challenge 2)
1. Create `TodoList.jsx` in `src/components/`.
2. Initialize state array `todos` to `[]` and state string `inputValue` to `""`.
3. Render a form with a text input and a submit button.
4. On submit, append the `inputValue` to the `todos` array and clear the input.
5. Render the list of to-dos using `.map()` with unique keys.

### 🛠️ Exercise 3: Profile Editor Object (Class Challenge 3)
1. Create `Profile.jsx` in `src/components/`.
2. Initialize an object state `profile` with properties `name` (string) and `age` (number/string).
3. Render input fields for both name and age.
4. Implement a single change handler that dynamically updates the profile object using the name attribute:
   ```javascript
   const handleChange = (e) => {
     const { name, value } = e.target;
     setProfile((prev) => ({ ...prev, [name]: value }));
   };
   ```
5. Display the profile information dynamically below the inputs.

### 🛠️ Exercise 4: Shopping List Array of Objects (Class Challenge 4)
1. Create `ShoppingList.jsx` in `src/components/`.
2. Initialize state array `items` to `[]`.
3. Create input states for `name` and `quantity`.
4. Render a form to add a new shopping item containing name and quantity. Parse the quantity as an integer (`parseInt()`).
5. Render the shopping list dynamically inside a list.
