# Design Patterns: Logic vs. Presentation & HOCs 📐

Design patterns in React represent industry-standard solutions to recurring coding challenges. In this lesson, we cover separating business logic from UI layouts (the **Container-Presenter Pattern**) and creating **Higher-Order Components (HOCs)** to share behavioral wrappers.

---

## ⚡ 1. Logic vs. Presentation (Container-Presenter Pattern)

One of the most important concepts in clean software engineering is **Separation of Concerns**. We divide components into two categories:

### A. Presentational Components (UI Layer)
* **What they do**: Determine *how* things look.
* **Characteristics**: They do not manage state (except local UI states like hover flags), do not fetch API data, and receive all values and action callbacks via **props**. They are pure and highly reusable.

### B. Container Components (Logic Layer)
* **What they do**: Determine *how* things work.
* **Characteristics**: They manage state, fetch API data over HTTP, handle side effects, and contain business logic. They do not render complex styling; instead, they pass state down as props to Presentational components.

### Code Example: Container-Presenter Setup

#### 1. The Presentational Component (`UserListUI.jsx`)
```jsx
// Pure Presentational Component: focus is 100% on rendering HTML & styles
export const UserListUI = ({ users, onSelectUser }) => {
  return (
    <div style={styles.card}>
      <h3>Active User Accounts</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} style={styles.item} onClick={() => onSelectUser(user.name)}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  card: { padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px" },
  item: { padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }
};
```

#### 2. The Container Component (`UserListContainer.jsx`)
```jsx
import { useState, useEffect } from 'react';
import { UserListUI } from './UserListUI';

// Container Component: handles all state and side effects, rendering zero HTML layout
export const UserListContainer = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users?_limit=4")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleSelectUser = (name) => {
    alert(`Selected user: ${name}`);
  };

  return <UserListUI users={users} onSelectUser={handleSelectUser} />;
};
```

---

## ⚡ 2. Higher-Order Components (HOCs)

A **Higher-Order Component** is a functional programming pattern where a function takes a component as an argument and returns a brand-new component enhanced with extra properties or logic.

HOC function names are conventionally prefixed with **`with`** (e.g., `withLoading`, `withAuth`):

```jsx
import React from 'react';

// Create a generic Loading HOC
export function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading, please wait...</p>;
    }
    // Forward remaining props to the wrapped component
    return <WrappedComponent {...props} />;
  };
}
```

### Consuming the HOC:
```jsx
import { UserListUI } from './UserListUI';
import { withLoading } from './withLoading';

// Enhance the UI component with loading capabilities
const UserListWithLoading = withLoading(UserListUI);

// Usage in parent
// <UserListWithLoading isLoading={true} users={[]} onSelectUser={...} />
```

---

## 🚀 3. HOCs vs. Custom Hooks

While HOCs are popular in legacy codebases, modern React generally prefers **Custom Hooks** for code sharing:

| Criteria | Higher-Order Components (HOCs) | Custom Hooks (`useHooks`) |
| :--- | :--- | :--- |
| **Boilerplate** | High. Requires nested functions and prop forwarding wrappers. | Low. It is just a standard helper hook call. |
| **Prop Collisions** | Risk. Two different HOCs can accidentally overwrite the same prop name. | None. Variables returned by hooks have distinct names. |
| **Component Nesting** | Creates "Wrapper Hell" in React DevTools trees. | Flat tree. No extra div/component wrappers are created. |
| **TypeScript Support** | Complex. Requires typing wrapping generics. | Simple and highly intuitive. |

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of these design patterns. Click **Reveal Answer** to verify.

### 1. What is the main advantage of the Container-Presenter design pattern?
<details>
  <summary><b>Reveal Answer</b></summary>

  It promotes the **Separation of Concerns**. By isolating UI display styles from data fetching and logic operations, components become simpler, easier to modify, highly reusable (e.g., you can swap the UI card layouts without touching the data fetching logic), and much easier to unit test.
</details>

### 2. Can Presentational components hold state variables?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. Presentational components can manage local UI state (like active hover indexes, menu drop-down visibility toggles, or accordion open status flags). They should not, however, manage application business data state (like user login credentials or fetched shopping cart lists).
</details>

### 3. What does it mean to "forward props" inside a Higher-Order Component?
<details>
  <summary><b>Reveal Answer</b></summary>

  HOCs sit as intermediate wrappers between parent and child components. Any properties passed by the parent to the enhanced component (e.g., `<EnhancedComponent title="Hello" />`) must be explicitly passed down to the wrapped child using the spread operator: `<WrappedComponent {...props} />`, otherwise the child will miss the input parameters.
</details>

### 4. Why does wrapping multiple HOCs together lead to "Wrapper Hell"?
<details>
  <summary><b>Reveal Answer</b></summary>

  Each HOC returns a new wrapper component. If you combine multiple enhancements (e.g. `withAuth(withRouter(withLoading(MyComponent)))`), it nests four layers of empty divs/wrappers in the React DOM. This bloats memory usage and makes inspecting components in React DevTools extremely frustrating.
</details>

### 5. Why do Custom Hooks usually replace HOCs in modern React codebases?
<details>
  <summary><b>Reveal Answer</b></summary>

  Custom Hooks solve the code-sharing problem without wrapping components. They allow components to share stateful behaviors flatly in the code, eliminate wrapper nesting nodes, prevent prop namespace collisions, and are much easier to type with TypeScript.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Build an Auth Checker HOC
1. Create a file `withAuth.tsx` (using `.tsx` extension).
2. Create an HOC function `withAuth(WrappedComponent)`.
3. The HOC should check a boolean prop `isAuthenticated`:
   - If `isAuthenticated` is `false`, render an access denied warning: `<h2 style={{ color: "red" }}>Access Denied. Please log in!</h2>`.
   - If `true`, render the `WrappedComponent` forwarding all original props.
4. Enhance your `UserListUI` component using this HOC: `const SecureList = withAuth(UserListUI)`.
5. Test rendering it in `App.tsx` passing both `isAuthenticated={true}` and `isAuthenticated={false}` to verify boundary controls.
