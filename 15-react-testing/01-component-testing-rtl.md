# Component Testing with React Testing Library (RTL) 🔍

While unit testing is great for utility functions, **Component Testing** verifies that your user interface renders correctly and responds properly to user interactions. In React, **React Testing Library (RTL)** is the industry-standard tool for testing components.

---

## ⚡ 1. Philosophy of React Testing Library

RTL's core philosophy is: **"The more your tests resemble the way your software is used, the more confidence they can give you."**
* You should test components from the **user's perspective** (e.g. clicking buttons, typing in forms, checking text on screen).
* You should **avoid** testing implementation details (like checking internal state variables or component helper methods).

---

## ⚡ 2. Installation & Setup

To use RTL with Vitest in a React project, install the testing libraries and a virtual browser DOM environment (**`jsdom`**):

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Configure Vitest to run in the `jsdom` environment in your `vite.config.js` or `vitest.config.js`:
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // 1. Run tests inside a virtual browser DOM
    setupFiles: './src/setupTests.js', // Optional setups file
  },
});
```

---

## 🧩 3. Writing a Component Test

Let's test a simple interactive Counter component:

### The Component (`src/components/SimpleCounter.jsx`)
```jsx
import { useState } from 'react';

export const SimpleCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### The Test File (`src/components/SimpleCounter.test.jsx`)
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleCounter } from './SimpleCounter';
import '@testing-library/jest-dom'; // Extra matchers like 'toBeInTheDocument'

describe('SimpleCounter Component', () => {

  it('should render initial count value as 0', () => {
    // 1. Mount component in virtual DOM
    render(<SimpleCounter />);
    
    // 2. Query element by text
    const textElement = screen.getByText(/current count: 0/i);
    expect(textElement).toBeInTheDocument();
  });

  it('should increment value on button click', async () => {
    render(<SimpleCounter />);
    
    // 1. Setup user interaction
    const user = userEvent.setup();
    
    // 2. Query the button
    const button = screen.getByRole('button', { name: /increment/i });
    
    // 3. Click the button
    await user.click(button);
    
    // 4. Verify text updated
    const textElement = screen.getByText(/current count: 1/i);
    expect(textElement).toBeInTheDocument();
  });
});
```

---

## 🚀 4. Screen Query Cheat Sheet: `get`, `query`, and `find`

When extracting elements from the virtual screen, choose queries based on expected layouts:

| Query Prefix | Returns Element | Throws Error if Missing? | Async (Returns Promise)? | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`getBy...`** | Yes | **Yes** | No | Standard assertions for elements that must be on screen. |
| **`queryBy...`** | Yes or `null` | **No** | No | Asserting that an element is **not** on the screen. |
| **`findBy...`** | Yes | **Yes** | **Yes** | Waiting for elements that load asynchronously later. |

```javascript
// Assert element is NOT in the document
expect(screen.queryByText(/error/i)).toBeNull();

// Wait for asynchronous data to appear on screen
const successMessage = await screen.findByText(/load successful/i);
expect(successMessage).toBeInTheDocument();
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of component testing. Click **Reveal Answer** to verify.

### 1. Why does RTL recommend using `getByRole` over queries like `getByText`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `getByRole` queries elements using **accessibility trees** (like `role="button"`, `role="heading"`), mirroring how screen readers and users interact with the page. This guarantees that your HTML markup is structured accessibly (A11y-friendly) and prevents tests from breaking if you change label text.
</details>

### 2. What is the difference between `@testing-library/user-event` and the standard `fireEvent` wrapper?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `fireEvent` triggers direct browser events (like `click`) programmatically.
  - `userEvent` simulates **full user workflows**. E.g., calling `userEvent.type()` triggers focus, keypresses, inputs, and blur events in order. This mimics actual browser interactions and captures side effects more reliably.
</details>

### 3. Why must we use `await` when simulating clicks with `userEvent`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because `userEvent` animations, hover actions, and typing flows run asynchronously to simulate real browser delays. Its APIs return Promises, meaning you must write `await` to ensure interactions complete before validating state changes.
</details>

### 4. How do you assert that an element is removed from the screen after a click?
<details>
  <summary><b>Reveal Answer</b></summary>

  You use the `queryBy...` prefix:
  ```javascript
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  ```
  If you use `getByText()`, the test runner crashes with an error immediately if the element is missing, failing the test.
</details>

### 5. What is the role of `jsdom` in Vitest configurations?
<details>
  <summary><b>Reveal Answer</b></summary>

  React components require a web browser environment (the window, document, DOM nodes) to mount and render. `jsdom` is a pure JavaScript simulation of a browser DOM that runs inside Node.js, allowing tests to render UI layouts and bind click events without launching a full browser.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Test a Search Form component
1. Create a component `SearchForm.tsx` (using `.tsx` extension).
2. It should contain a text input field, a submit button, and a search results listing paragraph: `"Search term: [User Query]"`.
3. Create a test file `SearchForm.test.tsx`.
4. Write test cases validating:
   - The input box is empty on mount.
   - Typing into the input box updates its value.
   - Clicking the submit button updates the results paragraph to display the typed search term.
5. Run your test runner to confirm all tests pass successfully.
