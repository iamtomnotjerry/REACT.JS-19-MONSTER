# Unit Testing with Vitest 🧪

**Unit Testing** is the practice of testing individual pieces of code (functions, utility classes, algorithms) in isolation to ensure they behave exactly as expected. In modern React ecosystems, **Vitest** is the preferred, next-generation testing framework because it is extremely fast, configures instantly with Vite, and supports Jest-compatible assertion syntax.

---

## ⚡ 1. Installation & Configurations

To add Vitest to your Vite-based React project, run:

```bash
npm install -D vitest
```

### Adding a Script to `package.json`
Add the following command script to launch the Vitest runner in watch mode:
```json
"scripts": {
  "test": "vitest"
}
```

---

## 🧩 2. Writing Your First Unit Test

A test file is typically named with a `.test.js` or `.test.ts` extension. We organize tests using three main blocks:
1. **`describe`**: Groups related tests together into a test suite.
2. **`it`** (or **`test`**): Defines an individual test case.
3. **`expect`**: Asserts that the received value matches the expected outcome.

Let's test a utility file containing simple mathematical operations:

### The Source File (`src/utils/math.js`)
```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const calculateDiscount = (price, discount) => {
  if (price < 0 || discount < 0) return 0;
  return price - (price * discount);
};
```

### The Test File (`src/utils/math.test.js`)
```javascript
import { describe, it, expect } from 'vitest';
import { add, subtract, calculateDiscount } from './math';

describe('Math Utility Functions', () => {
  
  it('should correctly add two numbers', () => {
    // Assert value equals expected result
    expect(add(2, 3)).toBe(5);
  });

  it('should correctly subtract two numbers', () => {
    expect(subtract(5, 2)).toBe(3);
  });

  it('should apply discount percentage correctly', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
  });

  it('should return 0 if price or discount is negative', () => {
    expect(calculateDiscount(-100, 0.1)).toBe(0);
    expect(calculateDiscount(100, -0.1)).toBe(0);
  });
});
```

To execute the test suite, run: `npm run test`.

---

## ⚡ 3. Common Vitest Assertions (Matchers)

Assertions use **Matchers** to compare values in different ways:

* **`toBe(value)`**: Checks strict equality using `Object.is` (best for primitives like numbers, strings, booleans).
* **`toEqual(value)`**: Checks deep equality (best for comparing arrays or objects).
* **`toContain(item)`**: Checks if an array contains a specific element or if a string contains a substring.
* **`toBeNull()`** / **`toBeUndefined()`**: Asserts exact null or undefined values.
* **`toThrow(error)`**: Verifies that a function throws an exception when called.

```javascript
// Example comparing arrays or objects
it('should verify objects share identical structures', () => {
  const user = { name: "Alice", role: "admin" };
  
  // expect(user).toBe({ name: "Alice", role: "admin" }); // Fails! Reference changed.
  expect(user).toEqual({ name: "Alice", role: "admin" }); // Success! Deep values match.
});
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of unit testing. Click **Reveal Answer** to verify.

### 1. What makes Vitest different from Jest in Vite-based applications?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vitest integrates directly with Vite's build configuration under the hood. It shares the same loaders, bundlers, and configuration files, meaning you do not need to set up duplicate Babel configs. It is also significantly faster because it leverages Vite's hot-module replacement (HMR) speeds.
</details>

### 2. What is the difference between `toBe()` and `toEqual()` matchers?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`toBe()`** compares values using strict referential equality (`Object.is`). It is used for primitive types like numbers, strings, and booleans.
  - **`toEqual()`** compares values by deeply iterating through all properties of objects or arrays, checking if they contain identical keys and values even if their references in memory are different.
</details>

### 3. Why must we wrap code that throws errors inside an anonymous function when using `toThrow()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  If you pass the function call directly (e.g. `expect(myFn()).toThrow()`), the function executes immediately *before* the assertion runs, crashing the test suite. Wrapping it in an anonymous arrow function allows Vitest to call it inside a try/catch block to verify the error safely:
  ```javascript
  expect(() => myFn()).toThrow();
  ```
</details>

### 4. What does the `describe` block do, and is it strictly required?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `describe` block groups related test cases together into a named suite, making test output logs easy to read. It is not strictly required by the test runner (you can write `it` blocks at the top level), but is a best practice for keeping test files organized.
</details>

### 5. What does the "watch mode" do in Vitest?
<details>
  <summary><b>Reveal Answer</b></summary>

  Watch mode keeps the test runner process running in the background. It monitors your filesystem and automatically runs only the tests associated with the files you edit as soon as you save them, providing instant feedback during coding.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Cart Calculation Unit Tests
1. Create a file named `cartUtils.js` inside a new `src/utils/` directory.
2. Implement and export two functions:
   - `calculateItemTotal(price, qty)`: returns total cost.
   - `formatCurrency(amount)`: returns a formatted string like `"$100.00"`.
3. Create a test file `cartUtils.test.js`.
4. Write a test suite verifying that:
   - `calculateItemTotal` works for standard quantities, handles default quantities of `1` if omitted, and handles negative parameters.
   - `formatCurrency` correctly prepends dollar signs and formats decimal places.
5. Launch `npm run test` and check the test runner console logs.
