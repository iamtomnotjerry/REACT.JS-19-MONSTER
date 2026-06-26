# Design Systems & Design Tokens 📖

A **Design System** is far more than a folder of components. It is a shared toolkit — part design, part engineering — that lets a team build many products that look and behave consistently. This lesson focuses on the **theory of design systems** and the **design tokens** that power them. (Storybook, the tool for building and documenting components in isolation, gets a brief mention here and a deep dive in **§17**.)

---

## 💡 Concept & Overview

If you ask a designer "what is a design system?", they will say it is a UI kit, a color palette, a typography grid, or iconography. If you ask a developer, they will say it is a component library, a set of style guides, or documentation. **The truth is that a design system is all of these** — a little design and a little engineering glued together.

A common formal definition:

> A design system is a comprehensive set of standards, guidelines, and components that ensure consistency and cohesion in the design and development of a digital product. It serves as a shared language and resource for designers, developers, and other stakeholders.

The simplest mental model: **a design system is a toolkit for building digital products**. It includes everything you need to keep the design consistent so that it looks the same across every screen and page.

> [!NOTE]
> A design system is **not** the product. It is the set of reusable parts and rules you assemble products *from*. Think of it as the box of LEGO bricks plus the instruction booklet — not the finished castle.

> [!TIP]
> You do not have to build the biggest design system on the planet. Even a tiny system — a handful of colors, a spacing scale, a button, and a card — already pays for itself the first time a brand color changes and you update it in **one** place instead of fifty.

---

## 🧱 The Core Building Blocks

A complete design system is made of layered building blocks. The lower layers (principles, tokens) inform the higher ones (components, patterns, documentation).

| Building Block       | What It Is                                                                 | Real Example                                   |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| **Design Principles** | High-level guidelines and philosophies that inform every decision          | "Simplicity", "Accessibility first", "Usability" |
| **Style Guides**      | Concrete visual rules — typography, color palette, spacing, iconography     | Heading uses 1.5rem / 700 weight; brand blue is `#1F6FEB` |
| **UI Components**     | Reusable interface elements, responsive and accessible by default           | Buttons, forms, modals, navigation bars        |
| **Patterns**          | Repeated solutions to recurring problems                                   | Card layouts, grids, dropdown menus, empty states |
| **Branding**          | Ensures the system aligns with company identity, tone, and values           | Logo usage, voice, brand colors, illustration style |
| **Documentation**     | Clear instructions and best practices for *using* and *maintaining* the system | "Use `<Button variant=\"danger\">` for destructive actions" |
| **Code**              | The front-end implementation devs integrate — React components, CSS frameworks | A published `@acme/ui` npm package             |
| **Accessibility**     | Recommendations that make the product usable by people with disabilities    | WCAG color-contrast ratios, keyboard navigation, ARIA roles |

### 🛒 A Real-World Metaphor

Imagine you are building a **shopping app** for a brand, and you want buttons, colors, fonts, iconography, and layouts to look consistent across every screen.

Think of the design system as the **kitchen of a restaurant chain**. The chain does not reinvent the meal at every location — it standardizes the *ingredients* (tokens: the exact flour, the exact sauce ratio), the *recipes* (components: how to assemble a burger), and the *plating rules* (patterns and documentation). Any cook at any branch produces the same dish. In your app, you "already have" your colors (gray, blue, red, amber, green, teal…), your typography, your icons, and your components — you just **grab them and use them**, and the app comes out consistent automatically.

---

## 🎨 Design Tokens — The Atoms of the System

**Design Tokens** are the smallest, named, single-source-of-truth values in a design system. Instead of scattering raw values like `#1F6FEB` or `16px` throughout your code, you name them once (`color-primary-500`, `spacing-md`) and reference the name everywhere. Change the token, and every consumer updates.

> [!IMPORTANT]
> Tokens are **platform-agnostic**. The *same* token (`color-primary-500`) can compile to a CSS custom property for the web, a Swift constant for iOS, and an XML resource for Android. CSS custom properties are just **one** way to express tokens — not the definition of a token.

Design tokens are holistic — they cover the entire visual language, not just colors:

### 1. Color Scales

Each semantic color (primary, neutral, warning, danger, success, gray-scale) is expanded into a **scale** of shades. A common convention runs `50, 100, 200, … 900, 950`, where low numbers are light tints and high numbers are dark shades.

```css
/* CSS custom properties: a primary color SCALE, not a single color */
:root {
  --color-primary-50:  #e7f0ff;
  --color-primary-100: #c2dbff;
  --color-primary-500: #1f6feb; /* base / default */
  --color-primary-900: #0a2a5e;
  --color-primary-950: #061a3b;

  /* Semantic roles map onto the scale */
  --color-danger-500:  #ef4444;
  --color-success-500: #22c55e;
  --color-warning-500: #eab308;
  --color-neutral-500: #6b7280;
}
```

### 2. Spacing — A Numeric Scale

Spacing tokens are usually a fixed **numeric scale** with friendly names, so layouts breathe consistently. (In Figma these are often modeled as a "number scale" collection.)

```css
:root {
  --space-tiny:   2px;  /* tiny     */
  --space-xs:     4px;  /* extra small */
  --space-sm:     6px;  /* small    */
  --space-md:     12px; /* medium   */
  --space-lg:     16px; /* large    */
  --space-xl:     20px; /* extra large */
  --space-2xl:    24px; /* super large */
  --space-huge:   32px; /* huge     */
  --space-giant:  40px; /* gigantic */
}
```

### 3. Typography

```css
:root {
  --font-family-base: "Inter", system-ui, sans-serif;
  --font-size-sm:  0.875rem;
  --font-size-md:  1rem;
  --font-size-lg:  1.25rem;
  --font-weight-regular: 400;
  --font-weight-bold:    700;
  --line-height-body:    1.5;
}
```

### 4. Border-Radius

```css
:root {
  --radius-xs:   2px;
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px; /* perfect circle / pill */
}
```

### 5. Opacity

```css
:root {
  --opacity-opaque:           1;    /* fully visible      */
  --opacity-semi:             0.8;  /* semi-opaque        */
  --opacity-transparent:      0.5;  /* transparent        */
  --opacity-light:            0.3;  /* light transparent  */
  --opacity-very-transparent: 0.25; /* very transparent   */
}
```

### 6. Shadows (Elevation)

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
}
```

---

## 🔁 The Figma → Tokens → Code Workflow

Tokens usually *originate in design* and *flow into engineering*. Understanding this pipeline is what makes a design system a shared language rather than two disconnected silos.

```text
   ┌──────────────┐      ┌────────────────┐      ┌──────────────────┐
   │    FIGMA     │ ───▶ │  DESIGN TOKENS │ ───▶ │       CODE       │
   │ (design)     │      │ (source of     │      │ (CSS vars, JS,   │
   │              │      │  truth, e.g.   │      │  iOS, Android)   │
   │ styles +     │      │  JSON/W3C      │      │                  │
   │ variables    │      │  tokens)       │      │                  │
   └──────────────┘      └────────────────┘      └──────────────────┘
```

A typical flow, exactly as a designer builds it in Figma:

1. **Decide the colors** for the system (using palette tools to pick a cohesive set).
2. **Generate styles** for those colors (e.g., a *Styler* plugin turns swatches into Figma styles).
3. **Convert styles to variables** (e.g., a *Styles → Variables* step) so each shade becomes a reusable, named token like `primary/500`.
4. Add other **variable collections**: a *number scale* (tiny → gigantic), a *radius* collection, and an *opacities* collection.
5. **Export/extract** the variables and bring them into code as CSS custom properties (or a tokens JSON consumed by a build tool).

Once tokens live in Figma as variables, a designer can build a component (say, a button) entirely from `radius/sm`, `primary/500`, and `space/md` — and the engineer reproduces the *identical* component because both sides reference the same named tokens.

> [!WARNING]
> Never copy raw hex codes from a design file directly into components. The moment a designer tweaks a shade, every hardcoded copy silently drifts out of sync. Always go through a **named token** so that a single edit propagates everywhere.

> [!TIP]
> If you are not a designer, you can skip the Figma-authoring part — but understand the *output*. In a real company you will either be asked to build the system or to consume tokens someone else produced. Either way, tokens are the contract between design and code.

---

## 📚 A Brief Note on Storybook

**Storybook** is an open-source tool for building and documenting UI components **in isolation** — outside the full app, without routing, auth, or API mocking. It shines for **large/enterprise** design systems and component libraries, and is overkill for a tiny portfolio site.

```bash
# Add Storybook to an existing React project (covered in depth in §17)
npx storybook@latest init
```

That is all you need here — the full treatment of stories, Component Story Format (CSF), `args`, controls, and `autodocs` lives in **§17 (Storybook)**.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. Why is there "no single definition" of a design system, and what is the honest answer?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because designers and developers describe it differently — a designer calls it a UI kit / color palette / typography grid, while a developer calls it a component library / style guide / documentation. The honest answer is that a design system is **all of these at once**: a little design and a little engineering. It is a shared toolkit and language for building consistent products across screens and platforms.
</details>

### 2. Name at least five core building blocks of a design system.
<details>
  <summary><b>Reveal Answer</b></summary>

  Any five of: **Design Principles**, **Style Guides**, **UI Components**, **Patterns**, **Branding**, **Documentation**, **Code**, and **Accessibility**. Principles and tokens sit at the foundation; components and patterns build on them; documentation and code make them usable and maintainable.
</details>

### 3. Why are design tokens described as "platform-agnostic," and how do CSS custom properties relate to them?
<details>
  <summary><b>Reveal Answer</b></summary>

  A token is an abstract named value (e.g., `color-primary-500`) that is independent of any technology. The *same* token can compile to a CSS custom property for the web, a Swift constant for iOS, and an XML resource for Android. CSS custom properties are therefore just **one representation** of tokens for the web — not the definition of a token itself.
</details>

### 4. Beyond color, list the other token categories a holistic design system defines.
<details>
  <summary><b>Reveal Answer</b></summary>

  **Spacing** (a numeric scale: tiny → gigantic), **Typography** (font family, sizes, weights, line-height), **Border-radius** (xs → full), **Opacity** (opaque → very transparent), and **Shadows/elevation**. Color itself is expressed as a **scale** (50–950) per semantic role (primary, neutral, warning, danger, success, gray-scale), not a single value.
</details>

### 5. Describe the Figma → tokens → code workflow and why it matters.
<details>
  <summary><b>Reveal Answer</b></summary>

  Tokens originate in design and flow to engineering: **(1)** decide colors, **(2)** generate styles from them, **(3)** convert styles to Figma variables (named tokens like `primary/500`), **(4)** add number-scale, radius, and opacity collections, **(5)** export/extract those variables into code as CSS custom properties or a tokens JSON. It matters because both designers and developers reference the *same named tokens*, so a single edit propagates everywhere and the implemented UI matches the design exactly — tokens become the contract between design and code.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment.

### 🛠️ Exercise 1: Author a token file and consume it in a component

1. Create a file `src/styles/tokens.css` and define **at least four token categories**: a color *scale* (e.g., `--color-primary-100/500/900`), a spacing scale (`--space-sm/md/lg`), a `--radius-md`, and an `--opacity-semi`.
2. Import the file once at your app root (e.g., in `main.tsx`, or in `index.css` via `@import "./styles/tokens.css";`).
3. Create `src/components/InfoCard.tsx` with props: `title` (string), `description` (string), and `borderTheme` (a color string).
4. Style the card **only through tokens** — use `var(--space-lg)` for padding, `var(--radius-md)` for corners, and `var(--shadow-md)` (add it to the token file) for elevation. Do **not** hardcode any pixel or hex value in the component.
5. Render two variants:
   - `Default`: a standard card.
   - `Featured`: a thick golden border using `borderTheme`.
6. Change a token value in `tokens.css` (e.g., bump `--space-lg` from `16px` to `24px`) and confirm every card updates without touching the component file.

```tsx
// src/components/InfoCard.tsx
type InfoCardProps = {
  title: string;
  description: string;
  borderTheme?: string; // a color token reference, e.g. var(--color-warning-500)
};

export const InfoCard = ({ title, description, borderTheme }: InfoCardProps) => {
  return (
    <article
      style={{
        // Every value is a token reference — no hardcoded raw values
        padding: "var(--space-lg)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
        border: `2px solid ${borderTheme ?? "var(--color-neutral-500)"}`,
        fontFamily: "var(--font-family-base)",
      }}
    >
      <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)" }}>
        {title}
      </h3>
      <p style={{ fontSize: "var(--font-size-md)", lineHeight: "var(--line-height-body)" }}>
        {description}
      </p>
    </article>
  );
};
```

### 🛠️ Exercise 2: Map a design system's building blocks to your project

1. Open any small app you have built. On paper (or in a markdown file), list which of the **eight building blocks** (principles, style guides, UI components, patterns, branding, documentation, code, accessibility) it currently has, and which are missing.
2. For one missing block — for example **Accessibility** — write one concrete improvement: pick two color tokens used together (text on background) and verify they meet a **WCAG AA contrast ratio of at least 4.5:1**. Adjust the token shade (e.g., move from `--color-neutral-400` to `--color-neutral-600`) until it passes.
3. Write a one-paragraph **documentation** entry describing *when* to use your `primary` vs `danger` color tokens (e.g., "`danger` is reserved for destructive, irreversible actions"). This turns raw tokens into a usable, maintainable system.
