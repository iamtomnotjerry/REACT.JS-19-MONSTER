# Design System Tokens & Storybook Integration 📖

A **Design System** is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications. In this lesson, we will cover **Design Tokens** (visual variables) and **Storybook** (building and documenting components in isolation).

---

## ⚡ 1. What are Design Tokens?

**Design Tokens** are the visual "atoms" of a design system. They are the single source of truth for visual variables, representing spacing, color choices, typography scales, border radiuses, and shadow parameters. 

By abstracting raw values into named variables, you guarantee consistency across all web products:

```css
/* CSS custom properties representing design tokens */
:root {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-dark: #2c3e50;
  
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  
  --border-radius-round: 8px;
}
```

---

## ⚡ 2. Storybook: Isolated UI Development

**Storybook** is an open-source tool for building UI components in isolation. Instead of rendering a new component inside a complex application (where you must navigate through screens, simulate API responses, or login), you write a "story" to view and test it instantly on a local sandbox dashboard.

### Installation
To add Storybook to an existing React project, run this command in your project root:

```bash
npx storybook@latest init
```

This creates a `.storybook/` configurations directory, adds scripts to `package.json`, and populates a mock `src/stories/` folder.

---

## 🧩 3. Writing Stories (Component Story Format - CSF)

Stories are written using the modern **CSF (Component Story Format) 3.0** standard. A story file is named `[ComponentName].stories.jsx` or `.tsx`:

### The Component (`src/components/Badge.jsx`)
```jsx
export const Badge = ({ label, variant = "info" }) => {
  const badgeStyles = {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    display: "inline-block",
    backgroundColor: variant === "success" ? "#2ecc71" : "#3498db",
    color: "#fff"
  };

  return <span style={badgeStyles}>{label}</span>;
};
```

### The Story File (`src/components/Badge.stories.jsx`)
```jsx
import { Badge } from './Badge';

// 1. Default export defines component metadata and sidebar placement
export default {
  title: 'Design System/Atoms/Badge', // Sidebar location hierarchy
  component: Badge,
  tags: ['autodocs'], // Automatically generates API documentation tabs
  argTypes: {
    variant: {
      control: 'select', // Render select box controls in Storybook dashboard
      options: ['info', 'success'],
    },
  },
};

// 2. Named exports define individual test stories
export const Info = {
  args: {
    label: "Information Tag",
    variant: "info",
  },
};

export const Success = {
  args: {
    label: "Task Approved",
    variant: "success",
  },
};
```

To run your Storybook environment locally, execute: `npm run storybook`.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of design systems. Click **Reveal Answer** to verify.

### 1. What are Design Tokens, and why are they preferred over hardcoded values?
<details>
  <summary><b>Reveal Answer</b></summary>

  Design Tokens are platform-agnostic variables representing visual design parameters (colors, sizes, typography). They are preferred because they represent a **single source of truth**. If a brand color changes, you update it once in the token definitions, and it propagates automatically across all components, avoiding search-and-replace bugs.
</details>

### 2. What does building components "in isolation" mean?
<details>
  <summary><b>Reveal Answer</b></summary>

  It means rendering and coding components outside the main application codebase. In Storybook, a component is loaded on a clean sandbox screen without database queries, router navigation logic, or state configurations, making development, testing, and styling significantly faster.
</details>

### 3. What are `args` in Storybook stories?
<details>
  <summary><b>Reveal Answer</b></summary>

  `args` represent the component's **props**. Setting args inside a story defines the default properties (inputs) that Storybook will pass to render that specific story variant on screen.
</details>

### 4. What is the benefit of the `tags: ['autodocs']` property inside the CSF default export?
<details>
  <summary><b>Reveal Answer</b></summary>

  It automatically generates a dedicated **Docs tab** in your Storybook dashboard. This tab documents your component APIs, generates prop description tables, and provides copy-pasteable code examples for other developers.
</details>

### 5. Can Storybook stories be reused for other testing tasks?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. Since CSF stories are standard ES6 objects exporting components and props, you can import them directly into unit tests (using Vitest/RTL) or integration tests to verify visual rendering and click actions, avoiding duplicate setups.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Create a Card component and its Story
1. Create a component `InfoCard.tsx` (using `.tsx` extension).
2. Set up props: `title` (string), `description` (string), and `borderTheme` (string color).
3. Style the card using design tokens (like `--spacing-lg` for padding).
4. Create a story file `InfoCard.stories.tsx`.
5. Define two stories:
   - `Default`: Standard card display.
   - `Featured`: Card showing a thick golden border.
6. Verify the story renders correctly in the Storybook sandbox and check that controls let you edit text live.
