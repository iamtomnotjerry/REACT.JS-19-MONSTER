# Component Testing with React Testing Library (RTL) 🔍

While unit testing is great for utility functions, **Component Testing** verifies that your user interface renders correctly and responds properly to user interactions. In React, **React Testing Library (RTL)** is the industry-standard tool for testing components.

---

## ⚡ 1. Concept & Overview

RTL's core philosophy is captured in one sentence:

> **"The more your tests resemble the way your software is used, the more confidence they can give you."**

* You should test components from the **user's perspective** (e.g. clicking buttons, typing in forms, reading text on screen).
* You should **avoid** testing implementation details (like checking internal `useState` values or calling component helper methods directly).

Think of it this way 👇

> 🧠 **Real-world metaphor — The Restaurant Health Inspector.**
> A bad inspector walks into the kitchen and interrogates the chef about which brand of pan they used and the exact temperature of the fridge motor. If the restaurant later swaps brands, the inspector panics — even though the food is still perfect. A **good** inspector sits at a table, orders the food, and checks: *Does it arrive? Does it taste right? Is it safe?* That is exactly what RTL does. It does not care **how** your component stores state internally; it only cares that when a user **clicks "Increment"**, they **see the number go up**. Refactor your internals all you want — the test only breaks if the *user-visible behavior* breaks.

This is why RTL gives you so much confidence: your tests survive refactors and fail only when something a real human would notice is actually broken.

> [!NOTE]
> RTL does **not** render your component to a real screen. It mounts it into a **virtual DOM** (provided by `jsdom`) that lives entirely in Node.js memory. There are no pixels — just a queryable tree of DOM nodes, exactly like the one a browser would build.

> [!TIP]
> RTL has a strict priority order for **how** you should query elements. Prefer queries that real users and assistive technology rely on: **role → label → text → test-id** (last resort). If you find yourself reaching for `getByTestId` first, your markup is probably not accessible enough.

> [!WARNING]
> Never assert on internal state or props (e.g. `expect(component.state.count).toBe(1)`). The moment you refactor `useState` into `useReducer`, every such test shatters even though nothing the user sees changed. Assert on **what is rendered**, not how it got there.

---

## ⚡ 2. Installation & Setup

To use RTL with Vitest in a React + TypeScript project, install the test runner, the testing library, custom DOM matchers, the user-event library, and a virtual browser DOM (**`jsdom`**):

```bash
# Test runner + assertion library
npm install -D vitest

# React Testing Library + custom matchers (toBeInTheDocument, etc.)
npm install -D @testing-library/react @testing-library/jest-dom

# Simulates real user interactions (click, type, tab...)
npm install -D @testing-library/user-event

# The virtual browser DOM that lets components mount in Node.js
npm install -D jsdom

# Optional TypeScript types for the jest-dom matchers
npm install -D @types/testing-library__jest-dom
```

Add a script to `package.json` to launch the visual test runner:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

Configure Vitest to run in the `jsdom` environment in `vitest.config.ts`:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',          // 1. Run tests inside a virtual browser DOM
    globals: true,                 // 2. Use describe/it/expect without importing them
    setupFiles: './tests/setup.ts' // 3. Run this file before every test suite
  },
});
```

Then create the setup file that loads the custom matchers once for the whole project:

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'; // Adds matchers like toBeInTheDocument(), toBeDisabled(), toBeChecked()
```

> [!NOTE]
> With `globals: true`, you no longer need to import `describe`, `it`, and `expect` in every test file — they are available globally, just like in Jest. This keeps test files lean across dozens of components.

---

## 🧩 3. Writing Your First Component Test

Let's test a simple interactive Counter component to see the full `render` → `screen` → `expect` loop.

### The Component (`src/components/SimpleCounter.tsx`)
```tsx
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

### The Test File (`src/components/SimpleCounter.test.tsx`)
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleCounter } from './SimpleCounter';

describe('SimpleCounter Component', () => {

  it('should render the initial count value as 0', () => {
    // 1. Mount the component into the virtual DOM
    render(<SimpleCounter />);

    // 2. Query the rendered element by its text
    const textElement = screen.getByText(/current count: 0/i);

    // 3. Assert it is actually on screen
    expect(textElement).toBeInTheDocument();
  });

  it('should increment the value when the button is clicked', async () => {
    render(<SimpleCounter />);

    // 1. Set up a user "session" that mimics a real person
    const user = userEvent.setup();

    // 2. Find the button the way a screen reader would (by its role + accessible name)
    const button = screen.getByRole('button', { name: /increment/i });

    // 3. Simulate a real click (async — see section 5)
    await user.click(button);

    // 4. Verify the UI updated as a user would see it
    expect(screen.getByText(/current count: 1/i)).toBeInTheDocument();
  });
});
```

The two stars of every test are:
* **`render(<Component />)`** — mounts the component into the virtual DOM.
* **`screen`** — your handle for *querying* that virtual DOM, exactly like a user scanning the page.

---

## 🚀 4. The Complete Query Reference Table

The single hardest (and most important) part of RTL is choosing the **right query**. Every query is built from two decisions:

1. **Which variant?** → `get` vs `query` vs `find` (and their `All` versions).
2. **By what?** → role, label, text, placeholder, display value, alt text, title, or test-id.

### 4a. The Variant Formula (`get` / `query` / `find`)

There is a simple mental formula. Pick the variant by asking: *"Is the element definitely here, maybe here, or coming later?"*

| Variant | Returns | If 0 found | If multiple found | Sync / Async | Use it when... |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`getBy...`** | a single element | **throws** error | **throws** error | sync | the element **must** already be on screen. |
| **`queryBy...`** | a single element **or `null`** | returns `null` (no error) | **throws** error | sync | you want to assert an element is **absent**. |
| **`findBy...`** | a **Promise** of one element | rejects after timeout | rejects | **async** | the element appears **later** (after a fetch, timer, or interaction). |
| **`getAllBy...`** | an **array** | **throws** error | returns all | sync | several matching elements **must** exist. |
| **`queryAllBy...`** | an **array** (may be **empty `[]`**) | returns `[]` (no error) | returns all | sync | zero-or-more elements; safe to check `.length === 0`. |
| **`findAllBy...`** | a **Promise** of an array | rejects after timeout | resolves with all | **async** | several elements appear **later**. |

> 🧩 **The cheat-formula:**
> * `get` → *"I'm sure it's there"* (throws if not — fails loudly).
> * `query` → *"It might not be there"* (returns `null`/`[]` — great for absence checks).
> * `find` → *"It'll show up soon"* (returns a Promise — always `await` it).
> * Add `All` → *"There are several of them"* (returns an array).

```typescript
// get → element MUST exist (throws if missing — your test fails immediately)
const heading = screen.getByRole('heading');

// query → assert something is NOT on screen (returns null, never throws)
expect(screen.queryByText(/error/i)).toBeNull();
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

// find → wait for async content (must await; default timeout 1000ms)
const successMessage = await screen.findByText(/load successful/i);
expect(successMessage).toBeInTheDocument();

// getAllBy → multiple elements that must all exist
const items = screen.getAllByRole('listitem');
expect(items).toHaveLength(3);

// queryAllBy → safe when the list might be empty
expect(screen.queryAllByRole('listitem')).toHaveLength(0);

// findAllBy → multiple async elements (e.g. results that load from an API)
const results = await screen.findAllByRole('listitem');
expect(results).toHaveLength(5);
```

### 4b. The "By What?" Reference Table

The suffix decides **which attribute** is matched. These are listed in RTL's recommended priority order:

| Query suffix | Matches on | Example | Typical element |
| :--- | :--- | :--- | :--- |
| **`...ByRole`** | the ARIA role (+ accessible `name`) | `getByRole('button', { name: /submit/i })` | buttons, links, headings, inputs |
| **`...ByLabelText`** | the `<label>` associated with a form field | `getByLabelText(/email/i)` | inputs, selects, textareas |
| **`...ByPlaceholderText`** | the `placeholder` attribute | `getByPlaceholderText(/search/i)` | inputs lacking a label |
| **`...ByText`** | visible text content | `getByText(/welcome/i)` | paragraphs, spans, divs |
| **`...ByDisplayValue`** | the current value of a filled-in field | `getByDisplayValue(/john/i)` | pre-filled inputs |
| **`...ByAltText`** | the `alt` attribute | `getByAltText(/profile photo/i)` | images |
| **`...ByTitle`** | the `title` attribute | `getByTitle(/tooltip/i)` | elements with tooltips |
| **`...ByTestId`** | the `data-testid` attribute | `getByTestId('custom-widget')` | **last resort** escape hatch |

### 4c. Querying by Role & the ARIA Accessibility Connection

`getByRole` is the **heart** of RTL because it queries elements the way a screen reader sees them — through the **accessibility tree**. ARIA (Accessible Rich Internet Applications) roles describe *what an element is for*. When you write `getByRole('button')`, you are asserting that the element is genuinely announced as a button to assistive technology.

Most HTML elements have an **implicit** role — you do not need to add `role="..."` yourself:

| HTML element | Implicit ARIA role |
| :--- | :--- |
| `<a href="...">` | `link` |
| `<button>` | `button` |
| `<h1>`–`<h6>` | `heading` |
| `<header>` | `banner` |
| `<footer>` | `contentinfo` |
| `<img alt="...">` | `img` |
| `<input type="text">` | `textbox` |
| `<input type="number">` | `spinbutton` |
| `<input type="checkbox">` | `checkbox` |
| `<ul>` / `<ol>` | `list` |
| `<li>` | `listitem` |
| `<section aria-label>` | `region` |
| element with `role="alert"` | `alert` |

> [!TIP]
> Querying by role is **resilient**: if you rename your button text from "Submit" to "Send", a `getByText` test breaks — but `getByRole('button')` still works. It also forces you to write **accessible markup**, because if RTL can't find a role, neither can a screen-reader user.

```typescript
// Disambiguate two buttons with the accessible name (the visible/label text)
const submitBtn = screen.getByRole('button', { name: /submit/i });
const cancelBtn = screen.getByRole('button', { name: /cancel/i });
```

---

## 🖱️ 5. `userEvent` vs `fireEvent` — Simulating a Real Human

There are two ways to trigger interactions, and understanding the difference is critical.

| | `fireEvent` | `@testing-library/user-event` |
| :--- | :--- | :--- |
| What it does | dispatches **one** raw DOM event | simulates the **full chain** a real user triggers |
| Typing "hi" | one `change` event with value `"hi"` | `focus → keydown h → input → keyup → keydown i → ...` |
| Realism | low (skips intermediate events) | **high** (matches actual browser behavior) |
| Async? | synchronous | **returns Promises — must `await`** |
| Recommended? | only for edge cases | ✅ **the default choice** |

### Setting up `userEvent`

The modern API requires calling `userEvent.setup()` **once** at the start of each test (before `render`); it returns a `user` object that you then drive:

```tsx
import userEvent from '@testing-library/user-event';

it('types into a field and clicks submit', async () => {
  const user = userEvent.setup(); // 1. Create the simulated user session
  render(<MyForm />);

  const input = screen.getByLabelText(/username/i);
  const button = screen.getByRole('button', { name: /submit/i });

  await user.type(input, 'tom_dev'); // 2. Type character-by-character (focus, keys, input, blur)
  await user.click(button);          // 3. Full mouse-down → mouse-up → click sequence

  expect(screen.getByText(/submitted: tom_dev/i)).toBeInTheDocument();
});
```

Common `user` methods: `click()`, `dblClick()`, `type()`, `clear()`, `tab()`, `hover()`, `keyboard()`, `selectOptions()`, `upload()`.

> [!WARNING]
> **You MUST `await` every `userEvent` action.** Each one runs asynchronously to faithfully simulate browser timing. Forgetting `await` is the #1 cause of flaky, intermittently-failing component tests — your assertion runs *before* React has finished re-rendering, so the element you expect isn't there yet.

---

## 🔁 6. Setup & Teardown — `beforeEach` / `afterEach`

When several tests in a suite share the same arrangement (e.g. every test renders the same component), repeating `render(...)` is noisy. Vitest gives you lifecycle hooks:

| Hook | Runs |
| :--- | :--- |
| `beforeAll` | **once**, before any test in the block |
| `beforeEach` | before **every** test |
| `afterEach` | after **every** test |
| `afterAll` | **once**, after all tests in the block |

```tsx
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FindAllByQueries Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();  // fresh user session for each test
    render(<FindAllByQueries />); // re-mount a clean component before every test
  });

  afterEach(() => {
    cleanup(); // unmount and wipe the virtual DOM (auto-run by RTL when globals are on)
  });

  it('finds all the paragraphs by text', async () => {
    const paragraphs = await screen.findAllByText(/item \d/);
    expect(paragraphs).toHaveLength(3);
  });

  it('finds all the buttons by role', async () => {
    const buttons = await screen.findAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});
```

> [!NOTE]
> RTL automatically calls `cleanup()` after each test when Vitest `globals` are enabled, so the explicit `afterEach(cleanup)` above is usually optional. It's shown here so you understand *what is happening*: each test starts from a fresh, isolated DOM with no leftover nodes from the previous test.

---

## 🧪 7. A Realistic Example — Testing a Todo List with User Interaction + Async

This is where everything comes together: a controlled form, `userEvent` typing and clicking, `getByRole`, and an **async** assertion with `waitFor`.

### The Component (`src/components/TodoList.tsx`)
```tsx
import { useState, type ChangeEvent } from 'react';

interface Todo {
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value);
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { text: newTodo, completed: false }]);
      setNewTodo(''); // reset the controlled input
    }
  };

  const handleToggleTodo = (index: number) => {
    const updated = [...todos];
    updated[index].completed = !updated[index].completed;
    setTodos(updated);
  };

  const handleDeleteTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input
        type="text"
        value={newTodo}
        onChange={handleInputChange}
        placeholder="Enter new todo"
      />
      <button onClick={handleAddTodo}>Add Todo</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(index)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### The Test File (`src/components/TodoList.test.tsx`)
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';

describe('TodoList Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    render(<TodoList />); // fresh component before every test
  });

  it('should render the input and the add button', () => {
    expect(screen.getByPlaceholderText(/enter new todo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('can add a todo item', async () => {
    const input = screen.getByPlaceholderText(/enter new todo/i);
    const addButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Learn RTL'); // simulate real typing
    await user.click(addButton);         // simulate the click that commits it

    // The new todo should now be visible on screen
    expect(screen.getByText(/learn rtl/i)).toBeInTheDocument();
  });

  it('can mark a todo as completed', async () => {
    const input = screen.getByPlaceholderText(/enter new todo/i);
    await user.type(input, 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked(); // starts unchecked

    await user.click(checkbox);
    expect(checkbox).toBeChecked();     // toggled on after the click
  });

  it('can delete a todo item (async assertion)', async () => {
    const input = screen.getByPlaceholderText(/enter new todo/i);
    await user.type(input, 'Temporary task');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // Confirm it appeared first
    expect(screen.getByText(/temporary task/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete/i }));

    // waitFor retries the callback until it passes (or times out) —
    // perfect for asserting something has been REMOVED after a state update
    await waitFor(() => {
      expect(screen.queryByText(/temporary task/i)).not.toBeInTheDocument();
    });
  });
});
```

This single suite exercises the entire toolkit: `getByPlaceholderText`, `getByRole`, `getByText`/`queryByText`, `toBeChecked`, `user.type`, `user.click`, `beforeEach` setup, and an async `waitFor` for the deletion.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of component testing. Click **Reveal Answer** to verify.

### 1. Why does RTL recommend using `getByRole` over queries like `getByText`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `getByRole` queries elements using the **accessibility tree** (roles like `button`, `heading`, `link`), mirroring how screen readers and keyboard users interact with the page. This guarantees your HTML is structured accessibly (A11y-friendly) and makes tests **resilient** — they don't break when you change visible label text, only when the actual interactive behavior changes. RTL's recommended priority order is **role → label → text → test-id (last resort)**.
</details>

### 2. What is the difference between `@testing-library/user-event` and the older `fireEvent`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `fireEvent` dispatches a **single raw DOM event** (e.g. one `change` event) programmatically.
  - `userEvent` simulates the **full user workflow**. For example, `await user.type(input, 'hi')` fires `focus`, then `keydown`/`input`/`keyup` for each character, then `blur` — exactly like a real browser. You create the session with `userEvent.setup()` and every action returns a Promise, so `userEvent` reproduces real interactions far more faithfully and is the **default recommended** approach.
</details>

### 3. Explain the difference between `getBy`, `queryBy`, and `findBy`, including what each returns when no element is found.
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`getBy...`** — synchronous; returns the element, but **throws an error** if it's missing. Use when the element must already exist.
  - **`queryBy...`** — synchronous; returns the element or **`null`** (never throws). Use to assert an element is **absent**: `expect(screen.queryByText(/error/i)).toBeNull()`.
  - **`findBy...`** — **asynchronous**; returns a **Promise** that resolves when the element appears, or rejects after a timeout. Use it (with `await`) for content that loads later — API responses, timers, post-interaction renders.

  The `All` variants (`getAllBy`, `queryAllBy`, `findAllBy`) return **arrays** instead of single elements; `queryAllBy` returns an **empty array `[]`** when nothing matches.
</details>

### 4. Why must you `await` every `userEvent` action, and what bug appears if you forget?
<details>
  <summary><b>Reveal Answer</b></summary>

  Every `userEvent` method (`click`, `type`, etc.) runs **asynchronously** to faithfully simulate browser timing and let React flush its state updates and re-renders. If you forget `await`, your assertion executes **before** the component has re-rendered, so the expected element isn't in the DOM yet. This produces **flaky tests** that fail intermittently — the single most common RTL mistake.
</details>

### 5. What is the purpose of `beforeEach`, and why does RTL keep each test isolated?
<details>
  <summary><b>Reveal Answer</b></summary>

  `beforeEach` runs a setup function **before every individual test** in a `describe` block — commonly `render(<Component />)` and `userEvent.setup()` — so each test starts from an identical, fresh arrangement without repeating boilerplate. RTL keeps tests **isolated** by calling `cleanup()` after each test (automatic when Vitest `globals` are enabled), unmounting the component and wiping the virtual DOM. This guarantees that one test can never leak rendered nodes or state into the next, eliminating order-dependent, hard-to-debug failures.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment.

### 🛠️ Exercise 1: Test a Search Form component
1. Create a component `SearchForm.tsx` (using the `.tsx` extension).
2. It should contain a labelled text input, a submit button, and a results paragraph that renders `"Search term: [User Query]"` only after submitting.
3. Create a test file `SearchForm.test.tsx`.
4. Add a `beforeEach` that calls `userEvent.setup()` and renders the component.
5. Write test cases validating:
   - The input is empty on mount (`getByRole('textbox')` → `toHaveValue('')`).
   - Typing into the input updates its value (`await user.type(...)` → `toHaveValue('react')`).
   - Clicking submit renders the results paragraph with the typed term, queried via `getByText(/search term: react/i)`.
   - Before submitting, the results paragraph is **absent** (`queryByText(...)` → `not.toBeInTheDocument()`).
6. Run `npm run test:ui` and confirm all tests pass.

### 🛠️ Exercise 2: Test an async UserProfile loader
1. Create `UserProfile.tsx` that, on mount, shows `"Loading..."`, then after a simulated 500ms delay (use `setTimeout` inside a `useEffect`) replaces it with `"Welcome, [name]"`.
2. Create `UserProfile.test.tsx`.
3. Write test cases validating:
   - The loading text appears **immediately** on mount (`getByText(/loading/i)`).
   - The welcome message appears **later** using an async query: `expect(await screen.findByText(/welcome, tom/i)).toBeInTheDocument()`.
   - The loading text is eventually **removed** — wrap the assertion in `waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument())`.
4. Note **which variant** you reached for at each step and why: `getBy` for what is already there, `findBy` for what arrives later, `queryBy` for what should be gone.
5. Run your test runner and confirm every assertion passes.
