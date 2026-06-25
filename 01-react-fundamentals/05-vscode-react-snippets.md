# Master VS Code ES7+ React Snippets Like a Pro 🚀

The **ES7+ React/Redux/React-Native snippets** extension is one of the most powerful tools in a React developer's toolkit. It saves thousands of keystrokes by generating boilerplate code instantly using simple abbreviations.

However, a senior developer doesn't just memorize shortcuts; they use them selectively to write clean, modern, and bug-free code.

---

## ⚡ The Essential "Cheat Sheet" for Modern React 19

Out of the hundreds of shortcuts available, these are the primary ones you will use daily:

| Abbreviation | Output Code | Use Case |
| :--- | :--- | :--- |
| **`rafce`** | React Arrow Functional Component with default Export | Creating a new modern arrow component (Default Export) |
| **`rafc`** | React Arrow Functional Component with Named Export | Creating a new modern arrow component (Named Export) |
| **`rfce`** | React Functional Component with default Export | Creating a new classic function component (Default Export) |
| **`imrse`** | `import React, { useState, useEffect } from 'react'` | Quick imports for React and hooks |
| **`nfn`** | `const name = (params) => { ... }` | Creating a standard arrow function |
| **`clg`** | `console.log(object)` | Quick logging for debugging |

> [!NOTE]
> **React Hooks Autocomplete:** For standard hooks like `useState` or `useEffect`, the extension does not use shorthand abbreviations. You simply type the full name (`useState` or `useEffect`) and press **Tab** or **Enter** when the snippet autocomplete popup appears to expand it.

---

## 💡 Modern Best Practices (The Senior Approach)

### 1. Prefer `rafce` over `rfce` (Visual Consistency)
In modern React codebases, **arrow functions (`rafce`)** are favored for component definitions:
- They provide a consistent visual style, matching regular event handlers and helper functions.
- They have implicit returns for small UI elements.
- Example output of `rafce`:
```jsx
import React from 'react' // Note: This import is actually optional in React 19!

const Header = () => {
  return (
    <div>Header</div>
  )
}

export default Header
```

### 2. Remove Unnecessary React Imports
In modern React (React 17+ and React 19), you **do not need** to write `import React from 'react'` at the top of every file unless you are using specific React APIs (like `React.Fragment`, `React.lazy`, or legacy refs).
- > [!TIP]
  > After generating a component with `rafce`, you can safely delete the line `import React from 'react'` to keep your files clean.
- In the extension settings, you can check **"Disable React Import"** so that snippets like `rafce` don't insert `import React` automatically!

### 3. Learn TypeScript Snippets (For Future Chapters)
When we progress to the TypeScript sections of the roadmap, you can prepend `ts` to the snippets:
- **`tsrafce`**: Generates a TypeScript arrow component with typed Props interface.

---

## 🧠 Test Your Knowledge

Test your understanding of snippets. Click **Reveal Answer** to verify.

### 1. What is the difference between `rafce` and `rafc`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`rafce`** includes `export default ComponentName` at the bottom of the file (Default Export).
  - **`rafc`** uses inline named export: `export const ComponentName = () => { ... }` (Named Export).
  - Seniors prefer **Named Exports (`rafc`)** in larger projects to prevent naming mismatches during imports.
</details>

### 2. Do you need to keep `import React from 'react'` when generating components?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. In modern React (React 17, 18, and 19), the JSX transform automatically handles rendering under the hood. You only need to import specific hooks (e.g. `import { useState } from 'react'`), not the entire `React` object.
</details>

### 3. How do you trigger the snippets in VS Code?
<details>
  <summary><b>Reveal Answer</b></summary>

  Simply type the abbreviation (e.g. `rafce`) inside a JSX/JS file and press **Tab** or **Enter** when the autocomplete suggestion menu appears.
</details>

---

## 💻 Practice Exercises

Apply the snippets inside your `first-react-app` project:

### 🛠️ Exercise 1: Quick Component Creation
1. Inside `src/components/`, create a new file named `Navbar.jsx`.
2. Open the file, type `rafc` (Named Export) and press **Enter** / **Tab**.
3. Notice how it creates an arrow function component with inline export.
4. Clean up any unused imports at the top.

### 🛠️ Exercise 2: Quick Logging
1. Open your newly created [`Navbar.jsx`](file:///d:/REACT.JS-19-MONSTER/first-react-app/src/components/Navbar.jsx).
2. Inside the `Navbar` component, type **`clg`** and press **Enter** or **Tab**.
3. It will instantly expand into `console.log()`. Type a message like `'Navbar rendered'` inside the parentheses.
4. Render `<Navbar />` inside `App.jsx` and verify the console log in your browser's Developer Tools (F12).
