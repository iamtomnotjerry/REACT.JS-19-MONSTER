# Unit Testing with Vitest 🧪

**Unit Testing** is the practice of testing individual pieces of code (functions, utility classes, algorithms) in isolation to ensure they behave exactly as expected. In the modern React ecosystem, **Vitest** is the preferred, next-generation testing framework because it is extremely fast, configures instantly with Vite, and supports Jest-compatible assertion syntax.

---

## 🌐 Concept & Overview

Before we write a single test, let's understand *where* unit testing fits. There are three flavors of automated testing, and they form a pyramid that runs from cheapest/fastest at the bottom to most expensive/slowest at the top:

| Test Type | What It Checks | Scope | Speed |
| :--- | :--- | :--- | :--- |
| **Unit** | A single function or class in isolation | Smallest (one "unit") | ⚡ Fastest |
| **Integration** | How multiple modules, databases, and APIs work *together* | Medium | 🚶 Medium |
| **End-to-End (E2E)** | A real user journey through the whole app (frontend + backend + services) | Largest | 🐢 Slowest |

This lesson focuses entirely on **unit testing** — verifying that small, isolated pieces of logic do exactly what we expect. Think of it like a car factory: before assembling the whole vehicle (E2E), you test that each individual bolt, gear, and spark plug works on its own (unit). If a bolt is faulty, you want to know *now*, not after the car ships.

> [!NOTE]
> **Why Vitest over Jest, Mocha, or Cypress?** Vitest is the fastest of the popular runners, and it natively supports **ESM**, **TypeScript**, and **JSX** out of the box. Other frameworks support ESM only experimentally and may need extra config for TypeScript/JSX. Because Vitest shares Vite's config, you reuse the *same* loaders and bundler your app already uses — no duplicate Babel setup.

> [!TIP]
> Write tests in **plain JavaScript** while you are *learning* unit testing. TypeScript's type system already eliminates many invalid-input bugs at compile time, which hides the very edge cases (like passing a string where a number is expected) that make unit testing interesting. Once you move on to React components, switch to `.tsx`.

> [!WARNING]
> Unit tests should never depend on a real network, database, or filesystem. The moment a "unit" test reaches out to an external service, it becomes a slow, flaky *integration* test. Keep units pure and isolated — mock external dependencies when needed.

---

## ⚡ 1. Installation & Configurations

To add Vitest to your Vite-based React project, run:

```bash
npm install -D vitest
```

### Adding Scripts to `package.json`
Add a script to launch the Vitest runner in watch mode, plus an optional UI dashboard:
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

The `test:ui` script opens a browser dashboard where you can filter by passing, failing, or skipped tests and inspect each test's code and console output. The plain `test` script runs the same suite directly in your terminal.

> [!NOTE]
> The first time you run `npm run test:ui`, it will prompt you to install the `@vitest/ui` dependency — accept it. This package is specific to Vitest; runners like Jest or Mocha do not ship it.

---

## 🧩 2. Writing Your First Unit Test

A test file is typically named with a `.test.js` or `.test.ts` extension. The `.test` segment tells the runner that this file is a test suite. We organize tests using three main blocks:
1. **`describe`**: Groups related tests together into a named test suite (optional, but recommended for readability).
2. **`it`** (or **`test`**): Defines an individual test case. `it` and `test` are interchangeable — they work identically.
3. **`expect`**: Asserts that the received value matches the expected outcome. An **assertion** is a statement that checks whether a value meets a condition (equality, truthiness, etc.).

Let's test a utility file containing simple mathematical operations:

### The Source File (`src/utils/math.js`)
```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

export const divide = (a, b) => {
  // Guard against division by zero by throwing a descriptive error
  if (b === 0) throw new Error('Division by zero is not allowed');
  return a / b;
};

export const calculateDiscount = (price, discount) => {
  if (price < 0 || discount < 0) return 0;
  return price - (price * discount);
};
```

### The Test File (`src/utils/math.test.js`)
```javascript
import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide, calculateDiscount } from './math';

describe('Math Utility Functions', () => {

  it('should correctly add two numbers', () => {
    // Assert that the returned value equals the expected result
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });

  it('should correctly subtract two numbers', () => {
    expect(subtract(5, 2)).toBe(3);
  });

  it('should correctly multiply two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(-2, 3)).toBe(-6);
  });

  it('should correctly divide two numbers', () => {
    expect(divide(6, 3)).toBe(2);
    expect(divide(5, 2)).toBe(2.5);
  });

  it('should throw an error when dividing by zero', () => {
    // Wrap the call in an arrow function so Vitest can invoke it safely
    expect(() => divide(5, 0)).toThrow('Division by zero is not allowed');
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

To execute the test suite, run `npm run test`. Watch mode keeps the runner alive and re-runs only the tests affected by the files you save — instant feedback while you code.

> [!TIP]
> Always give your `it`/`test` blocks **meaningful descriptions** (e.g. `'should throw an error when dividing by zero'`). When a test fails six months from now — or when a teammate reads your suite — the description is the first clue to what broke and why.

---

## 🎯 3. The AAA Pattern (Arrange–Act–Assert)

Well-structured tests follow the **AAA** pattern, which splits every test into three clear phases:

1. **Arrange** — set up everything the test needs (variables, mock data, inputs).
2. **Act** — perform the action you are testing (call the function).
3. **Assert** — verify the result matches what you expected.

### 🍰 The Baking-a-Cake Metaphor

Think of AAA like baking a cake:

- **Arrange** = gather your ingredients and tools (flour, sugar, eggs, mixing bowl).
- **Act** = mix the ingredients and put the cake in the oven.
- **Assert** = cut a slice and taste it to confirm it baked properly.

If the cake tastes great, your steps worked. If not, you know exactly which phase to inspect.

```javascript
import { test, expect } from 'vitest';
import { add } from '../src/math';

test('adds numbers correctly', () => {
  // 1. Arrange — set up the input data
  const a = 1;
  const b = 1;

  // 2. Act — perform the action under test
  const result = add(a, b);

  // 3. Assert — verify the outcome
  expect(result).toBe(2);
});
```

> [!NOTE]
> AAA is a *convention*, not a syntax rule — the runner does not enforce it. But separating the three phases visually (often with blank lines or comments) makes tests dramatically easier to read and debug.

---

## 🔴🟢🔵 4. Test-Driven Development (TDD): Red–Green–Refactor

**TDD** flips the usual order: you write the **test first**, then write just enough code to make it pass. The cycle has three repeating steps, often called **Red → Green → Refactor**:

| Phase | Color | What You Do | Expected State |
| :--- | :--- | :--- | :--- |
| **1. Write a failing test** | 🔴 Red | Describe what the code *should* do, before it exists | Test FAILS (no code yet) |
| **2. Make it pass** | 🟢 Green | Write the *minimum* code to satisfy the test | Test PASSES |
| **3. Refactor** | 🔵 Blue | Clean up / optimize the code, keeping tests green | Test STILL PASSES |

Then you **repeat** the cycle for the next feature.

```javascript
// STEP 🔴 RED — write the test before any implementation exists.
// src/math.test.js
import { describe, it, expect } from 'vitest';
import { add } from '../src/math';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3); // Fails: `add` does not exist yet!
  });
});
```

```javascript
// STEP 🟢 GREEN — write the minimum code to make the test pass.
// src/math.js
export const add = (a, b) => a + b;
```

```javascript
// STEP 🔵 REFACTOR — improve the code while keeping the test green.
// src/math.js
export const add = (a, b) => {
  // Add validation discovered during refactoring
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
};
```

> [!WARNING]
> The Red step **must actually fail first**. If your brand-new test passes before you write any implementation, the test is broken (it isn't testing what you think) — fix the test before continuing.

---

## ⚡ 5. The Complete Matcher Reference Table

Assertions use **Matchers** to compare values in different ways. So far we've mostly used `toBe`, but Vitest ships dozens. Here is your everyday reference:

| Matcher | What It Checks | Best For |
| :--- | :--- | :--- |
| `toBe(value)` | Strict equality (`Object.is`, like `===`) — same type *and* value | Primitives: numbers, strings, booleans |
| `toEqual(value)` | **Deep** equality — recursively compares contents | Objects & arrays (ignores reference) |
| `toStrictEqual(value)` | Deep equality **plus** type checks — also distinguishes `undefined` props, sparse arrays, and class types | Strict object/array comparison |
| `toContain(item)` | An array contains an element, or a string contains a substring | Arrays & substrings |
| `toBeNull()` | Value is exactly `null` | Null checks |
| `toBeUndefined()` | Value is exactly `undefined` | Undefined checks |
| `toBeTruthy()` | Value is truthy (anything except `false`, `0`, `''`, `null`, `undefined`, `NaN`) | Loose "has a value" checks |
| `toBeFalsy()` | Value is falsy (one of the values listed above) | Loose "empty/absent" checks |
| `toBeGreaterThan(n)` | Number `> n` | Numeric comparisons |
| `toBeGreaterThanOrEqual(n)` | Number `>= n` | Numeric comparisons (inclusive) |
| `toBeLessThan(n)` | Number `< n` | Numeric comparisons |
| `toBeLessThanOrEqual(n)` | Number `<= n` | Numeric comparisons (inclusive) |
| `toMatch(regexOrString)` | String matches a regular expression or contains a substring | Pattern/format validation |
| `toHaveProperty(key)` | An object has a given property key | Object shape checks |
| `toThrow(error?)` | A function throws (optionally matching a message/error) | Error-handling logic |

```javascript
import { it, expect } from 'vitest';

it('demonstrates the core matchers', () => {
  // --- Equality ---
  expect(5).toBe(5);                                  // strict primitive equality
  expect({ id: 1 }).toEqual({ id: 1 });               // deep equality (refs differ, OK)
  expect({ a: 1 }).toStrictEqual({ a: 1 });           // deep + type strictness

  // --- Collections & strings ---
  expect([1, 2, 3]).toContain(2);                     // array membership
  expect('hello world').toContain('world');           // substring
  expect('hello world').toMatch(/World/i);            // regex, case-insensitive

  // --- Nullish / truthiness ---
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
  expect(1).toBeTruthy();
  expect(0).toBeFalsy();

  // --- Numbers ---
  expect(10).toBeGreaterThan(5);
  expect(10).toBeGreaterThanOrEqual(10);
  expect(3).toBeLessThan(5);
  expect(3).toBeLessThanOrEqual(3);

  // --- Objects ---
  const user = { name: 'Alice', age: 22 };
  expect(user).toHaveProperty('name');

  // --- Errors (note the arrow-function wrapper) ---
  expect(() => { throw new Error('boom'); }).toThrow('boom');
});
```

> [!WARNING]
> `toThrow()` requires you to pass the call **wrapped in an arrow function**: `expect(() => myFn()).toThrow()`. If you write `expect(myFn()).toThrow()`, the function runs *immediately* and crashes the test before the assertion can catch the error.

```javascript
// Why toBe fails but toEqual succeeds for objects
it('should verify objects share identical structures', () => {
  const user = { name: "Alice", role: "admin" };

  // expect(user).toBe({ name: "Alice", role: "admin" }); // Fails! Different reference.
  expect(user).toEqual({ name: "Alice", role: "admin" }); // Success! Deep values match.
});
```

---

## ✅❌📏 6. Positive, Negative & Boundary Testing

A robust suite tests three categories of input, not just the happy path:

| Strategy | What It Verifies | Example (for an `add(a, b)` that requires numbers) |
| :--- | :--- | :--- |
| **Positive** | The system behaves correctly with **valid** inputs | `add(3, 5)` returns `8` |
| **Negative** | The system rejects **invalid** inputs gracefully (throws, doesn't crash) | `add('3', 5)` throws "Both inputs must be numbers" |
| **Boundary** | The system handles the **edges** of valid ranges, where bugs hide most often | A password validator at exactly 8 and exactly 16 characters |

```javascript
// Source: src/math.js
export const add = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both inputs must be numbers');
  }
  return a + b;
};
```

```javascript
import { describe, it, expect } from 'vitest';
import { add } from '../src/math';

describe('add', () => {
  // ✅ POSITIVE testing — valid inputs produce correct output
  it('should add valid numbers', () => {
    expect(add(3, 5)).toBe(8);
    expect(add(10, 20)).toBe(30);
    expect(add(0, 0)).toBe(0);
  });

  // ❌ NEGATIVE testing — invalid inputs are rejected gracefully
  it('should throw an error for invalid inputs', () => {
    expect(() => add(3, '5')).toThrow('Both inputs must be numbers');
    expect(() => add('a', 5)).toThrow('Both inputs must be numbers');
    expect(() => add(undefined, null)).toThrow('Both inputs must be numbers');
  });
});
```

### 📏 Boundary Testing in Action

Boundaries are where off-by-one errors live. For a password that must be **between 8 and 16 characters**, you test *just inside* and *just outside* each edge:

```javascript
// Source: src/validatePassword.js
export const validatePassword = (password) => {
  if (password.length < 8 || password.length > 16) {
    throw new Error('Password must be between 8 and 16 characters');
  }
  return 'Password is valid';
};
```

```javascript
import { describe, it, expect } from 'vitest';
import { validatePassword } from '../src/validatePassword';

describe('validatePassword (boundary tests)', () => {
  it('should allow a password with exactly 8 characters (min boundary)', () => {
    expect(validatePassword('abcdefgh')).toBe('Password is valid');
  });

  it('should allow a password with exactly 16 characters (max boundary)', () => {
    expect(validatePassword('abcdefghijklmnop')).toBe('Password is valid');
  });

  it('should throw when password is shorter than 8 (just outside min)', () => {
    expect(() => validatePassword('abc')).toThrow('Password must be between 8 and 16 characters');
  });

  it('should throw when password is longer than 16 (just outside max)', () => {
    expect(() => validatePassword('abcdefghijklmnopq')).toThrow('Password must be between 8 and 16 characters');
  });
});
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of unit testing. Click **Reveal Answer** to verify.

### 1. What is the difference between unit, integration, and end-to-end testing?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Unit testing** verifies a single isolated piece of code (a function or class) on its own — the smallest, fastest tests.
  - **Integration testing** checks how multiple modules, databases, or APIs work *together*.
  - **End-to-end (E2E) testing** simulates a real user journey through the entire application, including frontend, backend, and external services. This lesson focuses on unit testing.
</details>

### 2. What is the difference between `toBe()`, `toEqual()`, and `toStrictEqual()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`toBe()`** uses strict referential equality (`Object.is`, like `===`). Use it for primitives (numbers, strings, booleans).
  - **`toEqual()`** does a **deep** comparison of object/array contents, ignoring whether the references point to the same memory.
  - **`toStrictEqual()`** is like `toEqual()` but *stricter*: it also checks property types and distinguishes `undefined` properties, sparse arrays, and class instances. Two objects that pass `toEqual` can still fail `toStrictEqual`.
</details>

### 3. Explain the AAA pattern and why we wrap throwing code in an arrow function for `toThrow()`.
<details>
  <summary><b>Reveal Answer</b></summary>

  **AAA** = **Arrange** (set up inputs/mock data), **Act** (call the function under test), **Assert** (verify the result). It keeps tests readable, like gathering ingredients, baking, then tasting a cake.

  For `toThrow()`, we wrap the call in an arrow function — `expect(() => myFn()).toThrow()` — so Vitest can call it *inside a try/catch*. If you pass `expect(myFn())` directly, the function executes immediately and the error crashes the test before the assertion runs.
</details>

### 4. Describe the TDD Red–Green–Refactor cycle.
<details>
  <summary><b>Reveal Answer</b></summary>

  1. **🔴 Red** — write a test for behavior that doesn't exist yet; it fails.
  2. **🟢 Green** — write the *minimum* code needed to make the test pass.
  3. **🔵 Refactor** — clean up or optimize the code while keeping the test green.

  Then repeat. The key discipline is that the test must genuinely fail first — if it passes before you write any code, the test is flawed.
</details>

### 5. What is the difference between positive, negative, and boundary testing?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Positive testing** confirms the system works with *valid* inputs (e.g. `add(3, 5)` returns `8`).
  - **Negative testing** confirms the system *gracefully rejects* invalid inputs — throwing a clear error instead of crashing or returning garbage.
  - **Boundary testing** targets the *edges* of valid ranges (just inside and just outside the minimum/maximum), because off-by-one errors cluster at boundaries.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment. Use the **AAA pattern** and include **positive, negative, and boundary** cases.

### 🛠️ Exercise 1: Math Utility Test Suite (with TDD)

Practice the full Red–Green–Refactor cycle on real algorithms.

1. Create `src/mathUtils.js` and implement+export these functions:
   - `factorial(n)`: returns `n!`; throws `'Number must be non-negative'` when `n < 0`.
   - `gcd(a, b)`: returns the greatest common divisor (use recursion: `b === 0 ? a : gcd(b, a % b)`).
   - `fibonacci(n)`: returns the sequence array up to `n` terms; throws `'Number must be non-negative'` when `n < 0`.
2. **Practice TDD**: for at least one function, write its test in `src/mathUtils.test.js` **before** the implementation, watch it fail (🔴), then make it pass (🟢).
3. Write a `describe('Math Utilities', ...)` suite covering:
   - **Positive**: `expect(factorial(5)).toBe(120)`, `expect(gcd(56, 98)).toBe(14)`, `expect(fibonacci(5)).toEqual([0, 1, 1, 2, 3])`.
   - **Negative**: `expect(() => factorial(-1)).toThrow('Number must be non-negative')`.
   - **Boundary**: test `factorial(0)` (should be `1`) and `fibonacci(1)`.
4. Run `npm run test` and confirm all tests pass.

### 🛠️ Exercise 2: String & Array Utility Tests

Test real string and array transformation functions using the full matcher set.

1. Create `src/stringUtils.js` and export:
   - `reverseString(str)`: `str.split('').reverse().join('')`.
   - `capitalize(str)`: first letter uppercase, the rest lowercase.
   - `isPalindrome(str)`: returns `true`/`false` (compare a cleaned, lowercased string to its reverse).
2. Create `src/arrayUtils.js` and export:
   - `sum(arr)`: total of all elements via `reduce`.
   - `findMax(arr)` / `findMin(arr)`: using `Math.max` / `Math.min` with spread.
   - `removeDuplicates(arr)`: `[...new Set(arr)]`.
3. Create matching `.test.js` files and write a `describe` suite for each, verifying:
   - `reverseString('hello')` **`toBe`** `'olleh'`.
   - `capitalize('hELLO')` **`toBe`** `'Hello'`.
   - `isPalindrome('racecar')` **`toBeTruthy`**, and `isPalindrome('apple')` **`toBeFalsy`**.
   - `sum([1, 2, 3])` **`toBe`** `6` (positive) and `sum([-1, -2, -3])` **`toBe`** `-6` (negative values).
   - `findMax([10, 5, 100])` **`toBe`** `100`.
   - `removeDuplicates([1, 2, 2, 3, 4, 4])` **`toEqual`** `[1, 2, 3, 4]`.
   - Use **`toContain`** to assert that a result array includes a specific element.
4. Launch `npm run test` (or `npm run test:ui` for the dashboard) and verify every suite is green.

### 🛠️ Exercise 3 (Bonus): Cart Calculations

1. Create `src/cartUtils.js` and export:
   - `calculateItemTotal(price, qty = 1)`: returns total cost; defaults the quantity to `1` if omitted.
   - `formatCurrency(amount)`: returns a formatted string like `"$100.00"`.
2. In `src/cartUtils.test.js`, verify that:
   - `calculateItemTotal` works for standard quantities, applies the default of `1`, and handles negative parameters (boundary/negative).
   - `formatCurrency` prepends the dollar sign and formats two decimal places — assert with **`toMatch(/^\$\d+\.\d{2}$/)`**.
3. Run `npm run test` and inspect the console logs.
