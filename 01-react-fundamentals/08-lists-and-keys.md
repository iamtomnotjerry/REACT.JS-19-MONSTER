# Rendering Lists and using Keys in React 📋

In web development, we frequently need to render lists of items dynamically (such as search results, user profiles, or product inventories). In React, we handle list rendering using standard JavaScript array methods, specifically the **`.map()`** method, inside JSX.

---

## ⚡ The `.map()` Method in React

The `.map()` method loops through each item in an array and returns a new array of JSX elements. React will automatically unpack and render this list of elements.

### Basic Example (Array of Strings)
```jsx
const UserList = () => {
  const users = ["Alice", "Bob", "Charlie"];

  return (
    <ul>
      {users.map((user, index) => (
        <li key={index}>{user}</li>
      ))}
    </ul>
  );
};
```

---

## 🔑 Why is the `key` Prop Required?

If you render a list without providing a `key` prop to the outer element of each item, React will display a console warning: 
> *Warning: Each child in a list should have a unique "key" prop.*

### How React Uses Keys
1. **Reconciliation**: When an item in a list is added, removed, or reordered, React compares the Virtual DOM trees. 
2. **Identity**: The `key` serves as a unique identifier for that specific element. It tells React: *"This element corresponds to this specific data item"*.
3. **Performance**: With keys, React only updates or reorders the DOM elements that actually changed, instead of destroying and rebuilding the entire list from scratch.

> [!WARNING]
> **Avoid using array indexes as keys** if the list items can change, be reordered, or filtered. Doing so can cause visual bugs and performance issues. Always prefer unique IDs from your data (e.g. `user.id`).

---

## 🌟 Advanced Example (Array of Objects)

In real applications, data is usually represented as an array of objects.

```jsx
const ProductList = () => {
  const products = [
    { id: 101, name: "Keyboard", price: 50 },
    { id: 102, name: "Mouse", price: 30 },
    { id: 103, name: "Monitor", price: 200 }
  ];

  return (
    <div>
      <h2>Product Catalog</h2>
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Lists & Keys. Click **Reveal Answer** to verify.

### 1. What JavaScript method is preferred for rendering lists in React?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `map()` method is preferred because it loops through the array and returns a new array of JSX elements.
</details>

### 2. Why should you avoid using the array `index` as a key?
<details>
  <summary><b>Reveal Answer</b></summary>

  If the list is reordered, sorted, filtered, or items are inserted/deleted, the index of each item changes. This can cause React to mismatch UI states (like inputs keeping values of the wrong list item) and degrades rendering performance.
</details>

### 3. Which element in the loop must receive the `key` prop?
<details>
  <summary><b>Reveal Answer</b></summary>

  The **outermost element** returned by the `.map()` callback function must receive the `key` prop.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your `first-react-app` project:

### 🛠️ Exercise 1: User List Component
1. Create a new component file `UserList.jsx` inside `src/components/`.
2. Define a list of users containing their details:
   ```javascript
   const users = [
     { id: 1, name: "Alice", age: 25 },
     { id: 2, name: "Bob", age: 30 },
     { id: 3, name: "Charlie", age: 22 }
   ];
   ```
3. Use the `.map()` method to render a list of these users, displaying their name and age. Ensure each item has a unique `key`.
4. Import and render `<UserList />` in `App.jsx`.
