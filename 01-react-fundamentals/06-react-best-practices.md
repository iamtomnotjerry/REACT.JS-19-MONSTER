# React Best Practices: Clean Code, Accessibility (a11y), and Formatting 🚀

This guide explains the senior-level developer configurations and code standards implemented in our project. Following these rules ensures your applications are clean, accessible, and follow modern production-grade structures.

---

## 💅 1. Code Formatting (Prettier)

In team development, code styling differences can cause huge git conflicts. We use **Prettier** to enforce consistent styles automatically.

### Key Rules Configured (`.prettierrc`)
- **No Semicolons (`semi: false`)**: Cleaner code by avoiding unnecessary trailing semicolons.
- **Single Quotes (`singleQuote: true`)**: Standardizes JS/TS string formatting using single quotes.
- **JSX Double Quotes (`jsxSingleQuote: false`)**: Enforces industry-standard double quotes for HTML-like attributes in JSX.
- **Trailing Commas (`trailingComma: "all"`)**: Keeps git diffs clean when adding items to arrays or objects.
- **Code Width Wrap (`printWidth: 80`)**: Prevents horizontal scrolling by wrapping code at 80 characters.
- **Tab Formatting (`tabWidth: 2`, `useTabs: false`)**: Enforces a standard 2-space indentation instead of raw tabs.
- **Bracket Spacing (`bracketSpacing: true`)**: Adds readability spaces inside object braces (e.g. `{ user }`).
- **Arrow Function Parentheses (`arrowParens: "always"`)**: Enforces wrapping arrow function arguments in parentheses (vital for TypeScript later).
- **Line Endings (`endOfLine: "auto"`)**: Auto-handles line endings (LF vs CRLF) across different operating systems.

### How to use Prettier:
In the project folder, you can run:
```bash
# Formats all files inside your project directory
npm run format

# Checks if files are formatted correctly
npm run format:check
```

### 💡 ESLint vs. Prettier: What's the Difference?

It is common to confuse **ESLint** and **Prettier** since both inspect your code files, but they focus on two entirely different aspects:

- **ESLint (Linter = Code Quality):** Analyzes your code to find **logic bugs, syntax errors, or anti-patterns** (e.g., using undeclared variables, importing unused modules, or breaking React Hook execution orders). *Violations here can cause your app to crash.*
- **Prettier (Formatter = Code Style):** Focuses solely on **how the code looks** (e.g., spaces vs. tabs, quote styles, trailing commas, line wrapping length). *Violations here do not affect performance; they just make the code harder to read.*

| Feature | ESLint (Linter) | Prettier (Formatter) |
| :--- | :--- | :--- |
| **Focus** | Code correctness & Quality (Logic) | Code layout & Style (Format) |
| **Fixes** | Warns about logic flaws (can fix simple syntax via `--fix`) | Auto-rewrites files to match the style guide exactly |
| **Examples** | `no-unused-vars`, `react-hooks/rules-of-hooks` | `semi: false`, `singleQuote: true` |

**The Analogy:** Think of ESLint as your **Grammar Editor** (ensuring your sentences make sense and follow syntax rules) and Prettier as your **Graphic Designer** (aligning margins, spacing, and margins to make the paper look neat).

---

## 🎨 2. Semantic HTML & Accessibility (a11y)

Writing accessible UI is a core requirement for senior developers. We follow **a11y** best practices manually in our code.

### Core Rules:
1. **Use Semantic Tags**: Avoid nesting `div`s. Use appropriate HTML5 semantic tags:
   - `<header>` for top navigations.
   - `<nav>` for navigation links.
   - `<footer>` for copyright blocks.
   - `<article>` or `<section>` for independent user cards/content containers.
2. **Accessible Anchors**: Never write `<a href="#">`. It forces the browser to jump to the top. Use descriptive anchor links (e.g. `href="#home"`).
3. **Screen Reader Support**: Use `aria-label` attributes to provide descriptive text for screen readers (e.g. `<nav aria-label="Main Navigation">`).

---

## 📐 3. SEO-Friendly Headings

Search engines (like Google) read your HTML headings (`<h1>` to `<h6>`) to understand your content structure.
- **Rule:** A webpage should have **only one `<h1>` tag** (typically inside the main header).
- All other component titles should use `<h2>` or `<h3>` tags to represent their lower level in the page hierarchy.

---

## ⚡ 4. Stateful Updates: Functional State Pattern

When updating state that depends on the previous state value, **never** read the current state directly:
```javascript
// ❌ Avoid this:
setCount(count + 1);
```
Since React batches state updates asynchronously, `count` might contain an outdated value at execution time.

### The Correct Way (Functional Update):
```javascript
// ✅ Do this:
setCount((prevCount) => prevCount + 1);
```
By passing a callback function, React guarantees that `prevCount` always contains the absolute latest state value.

---

## 🧩 5. Avoid Redundant React Fragments

Only use React Fragments (`<>...</>`) when you need to return multiple adjacent sibling elements.
- **If your component returns a single element** (e.g. one `<div>` or one `<header>`), do **not** wrap it in a fragment. It adds useless wrappers to your JSX structure.

---

## 🛠️ 6. Git Hooks: Automating Quality Control

A senior developer ensures that broken or poorly styled code never reaches the remote repository. **Git Hooks** are scripts that Git executes automatically before key actions (like committing, pushing, or merging).

In our project, we use a shared `.githooks/` folder. This is configured in Git using:
```bash
git config core.hooksPath .githooks
```

We have set up two key quality gates:
1. **`commit-msg` (Commit Style Gate):** Verifies that your commit message follows the **Conventional Commits** standard (e.g., `feat: ...`, `fix: ...`, `docs: ...`). If not, the commit is rejected.
2. **`pre-commit` (Code Integrity Gate):** Automatically runs three tests before letting you commit:
   - **Prettier formatting check**: Ensures all staged files match Prettier styling.
   - **ESLint linting check**: Scans for logic bugs or syntax errors.
   - **Production build check (`npm run build`)**: Confirms the app compiles successfully. If any file has compilation errors, the commit is blocked!

---

## 🧠 Test Your Knowledge

Test your understanding. Click **Reveal Answer** to check.

### 1. Why is the functional state update pattern (`prev => prev + 1`) safer than `likes + 1`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React updates state asynchronously. If multiple state updates occur in the same render cycle (or during rapid user clicking), using `likes + 1` can lead to stale state values and incorrect counters. Passing a function `(prev) => prev + 1` guarantees React passes the most current state value.
</details>

### 2. What is semantic HTML? Why is it better than using only `div` tags?
<details>
  <summary><b>Reveal Answer</b></summary>

  Semantic HTML elements (like `<nav>`, `<article>`, `<header>`) describe their meaning to both the browser and search engine crawlers. It improves search engine rankings (SEO) and makes the website accessible to users with screen readers (a11y).
</details>

### 3. Why should you only have one `<h1>` tag on a page?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `<h1>` tag represents the primary topic of the page. Having multiple `<h1>` tags confuses search engine bots and screen readers about the main purpose of the document.
</details>

### 4. What is a Git Hook? Name the two hooks configured in our project.
<details>
  <summary><b>Reveal Answer</b></summary>

  A Git Hook is an automated script that Git runs before or after actions like commits or pushes. In our project, we use:
  - **`pre-commit`**: Automatically runs formatter, linter, and compilation build checks.
  - **`commit-msg`**: Validates the commit message against Conventional Commits formatting rules.
</details>

---

## 💻 Practice Exercises

Apply these rules:

### 🛠️ Exercise 1: Refactoring components for Semantic HTML
1. Open your [`Header.jsx`](file:///d:/REACT.JS-19-MONSTER/first-react-app/src/components/Header.jsx) and check if it uses `<header>` and `<nav>`.
2. Open [`Footer.jsx`](file:///d:/REACT.JS-19-MONSTER/first-react-app/src/components/Footer.jsx) and verify if it uses the semantic `<footer>` element.
3. Run `npm run format` inside `first-react-app/` to format all of your newly written code files!

### 🛠️ Exercise 2: Testing Quality Gates (Git Hooks)
1. Make a small test edit in one of your files.
2. Try to commit the change with an invalid message: `git commit -m "fixed stuff"`. Verify that `commit-msg` **rejects** the commit.
3. Introduce a syntax error (e.g. `const x = ` with nothing after it). Stage it (`git add .`) and try to commit with a valid message: `git commit -m "feat: test compilation"`. Verify that the commit is **blocked** by `pre-commit` (compilation check).
4. Remove the error, format your code, and commit successfully!

