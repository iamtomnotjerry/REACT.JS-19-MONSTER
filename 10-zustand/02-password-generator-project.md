# 🔐 Project: Password Generator with Zustand

A password generator is one of those deceptively small apps that touches *every* concept you care about in client-side state management: derived booleans (the toggle flags), a numeric setting (length), an action that **reads** the whole slice to produce a new value (`generate`), a browser side-effect (`copyToClipboard`), and a piece of UI that is **never stored** but always **computed** (the strength indicator). It is the perfect canvas for a Zustand store because there is real state, real actions, and a genuine selector worth memoizing.

In this lesson you build the full thing end-to-end: a typed Zustand store that holds the configuration and the generated password, a single React 19 component that wires a range slider and three checkboxes to that store, a copy-to-clipboard button with transient "Copied!" feedback, and a strength meter derived purely from a selector. Everything is fully typed, complete, and copy-pasteable — no fragments, no "fill this in later."

> [!NOTE]
> This project **rebuilds an earlier course app idea — the Password Generator — but this time backed by a Zustand store instead of local `useState`.** The original app idea comes from the course; the Zustand implementation here is **net-new** (it goes beyond what the recorded transcript demonstrates), so it is taught using current Zustand v5 + React 19 best practices rather than transcribed line-by-line.

---

## ⚡ 1. Concept & Overview: State, Actions, and Derived Values

Before writing code, separate the app's data into three buckets. This separation is the single most important design decision in any state-managed feature, and Zustand makes it explicit.

| Bucket | Examples in this app | Lives where? | Why |
| --- | --- | --- | --- |
| **Stored state** | `length`, `includeUppercase`, `includeNumbers`, `includeSymbols`, `password`, `copied` | Inside the Zustand store | These are facts that change over time and must persist across re-renders. |
| **Actions** | `setLength`, `toggleUppercase`, `generate`, `copyToClipboard` | Inside the store (functions that call `set`) | The *only* sanctioned way to mutate state. Components never `set` directly. |
| **Derived values** | password **strength** (Weak / Fair / Strong) | Computed in a **selector**, never stored | It is 100% a function of existing state. Storing it would create a second source of truth that can drift out of sync. |

The golden rule: **if a value can be calculated from other state, do not store it — derive it.** Strength is a function of `length` and how many character classes are enabled, so it belongs in a selector, not in the store.

### 🛠️ A Real-World Metaphor: The Espresso Machine

Think of the store as an **espresso machine**.

- The **dials and switches** on the front — grind size, shot count, milk on/off — are your **stored state** (`length`, the three toggles). You turn them; they hold their position.
- Pressing the big **BREW button** is an **action** (`generate`). It reads every dial, runs the internal pump, and fills the cup. You don't reach inside the boiler yourself; you press the button and the machine does the work.
- The **pressure gauge** on top is a **derived value** (the strength indicator). Nobody sets the gauge by hand — it simply *reflects* what the machine is doing right now. If you tried to store and manually update a gauge reading, it would lie the moment a dial moved.

A great password generator, like a great espresso machine, keeps these three concerns physically separate.

> [!TIP]
> Zustand actions are just functions you put **inside** the store object. Because they close over `set` and `get`, an action like `generate()` can read the current `length` and flags with `get()` and write a fresh `password` with `set()` — all without the component passing any arguments. This keeps your component dumb and your logic centralized and unit-testable.

---

## 🧩 2. The Data Flow

```
   ┌─────────────────────────────────────────────────────────┐
   │                     Zustand Store                        │
   │                                                          │
   │  state:  length, includeUppercase, includeNumbers,       │
   │          includeSymbols, password, copied                │
   │                                                          │
   │  actions:                                                │
   │    setLength(n) ───────────► set({ length: n })          │
   │    toggleUppercase() ──────► set(flip flag)              │
   │    generate() ──► get() flags ─► build charset ─► random │
   │                                └─► set({ password })      │
   │    copyToClipboard() ─► navigator.clipboard ─► set(copied)│
   └───────────────┬──────────────────────────▲──────────────┘
                   │ selectors (read)          │ actions (write)
                   ▼                           │
   ┌─────────────────────────────────────────────────────────┐
   │                   <PasswordGenerator />                  │
   │                                                          │
   │  Range slider ──── length ──── setLength                 │
   │  ☑ Uppercase ☑ Numbers ☑ Symbols ── toggle* actions      │
   │  [ generated password output ]                           │
   │  [ Copy ] ── copyToClipboard ── "Copied!" (copied flag)  │
   │  Strength bar  ◄── derived selector (length + flags)     │
   └─────────────────────────────────────────────────────────┘
```

The component **reads** narrow slices via selectors and **calls** actions. It never owns logic. The store **owns** logic and never imports React. That clean split is the whole point.

---

## 🧱 3. Project Setup

Spin up a Vite + React + TypeScript app and add Zustand v5.

```bash
# Create the app (choose the react-ts template)
npm create vite@latest password-generator -- --template react-ts
cd password-generator

# Install dependencies plus Zustand
npm install
npm install zustand
```

The two files you will create:

```
src/
├── store/
│   └── usePasswordStore.ts     # the typed Zustand store + selectors
├── PasswordGenerator.tsx       # the single UI component
└── App.tsx                     # renders <PasswordGenerator />
```

---

## ⚡ 4. The Store (Fully Typed)

This is the heart of the lesson. Read the comments carefully — every line is intentional.

```typescript
// src/store/usePasswordStore.ts
import { create } from "zustand";

/**
 * The shape of our store: state fields first, then actions.
 * Keeping them in one interface gives `set`/`get` full type safety.
 */
interface PasswordState {
  // ----- Stored state -----
  length: number;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  password: string;
  copied: boolean;

  // ----- Actions -----
  setLength: (length: number) => void;
  toggleUppercase: () => void;
  toggleNumbers: () => void;
  toggleSymbols: () => void;
  generate: () => void;
  copyToClipboard: () => Promise<void>;
}

// Character pools, defined once outside the store so they are never re-created.
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/**
 * Cryptographically strong random integer in the range [0, max).
 * We use the Web Crypto API (crypto.getRandomValues) instead of Math.random()
 * because passwords must not be predictable. This is supported in every
 * modern browser and is the correct tool for security-sensitive randomness.
 */
function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Map the 32-bit value into [0, max) with modulo. The tiny modulo bias is
  // negligible for password character selection.
  return array[0] % max;
}

export const usePasswordStore = create<PasswordState>((set, get) => ({
  // ----- Initial state -----
  length: 12,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: false,
  password: "",
  copied: false,

  // ----- Actions -----

  // Clamp length between 4 and 64 so the slider can never produce nonsense.
  setLength: (length) =>
    set({ length: Math.min(64, Math.max(4, Math.round(length))) }),

  // Each toggle flips its own boolean. We read the previous value via the
  // updater function form of `set` so we never depend on a stale closure.
  toggleUppercase: () =>
    set((state) => ({ includeUppercase: !state.includeUppercase })),
  toggleNumbers: () =>
    set((state) => ({ includeNumbers: !state.includeNumbers })),
  toggleSymbols: () =>
    set((state) => ({ includeSymbols: !state.includeSymbols })),

  /**
   * Build the active charset from the flags, then draw `length` random
   * characters from it. Lowercase is always included so we can never end up
   * with an empty charset (a UX guarantee, not just a safety net).
   */
  generate: () => {
    const { length, includeUppercase, includeNumbers, includeSymbols } = get();

    // Lowercase is the always-on baseline.
    let charset = LOWERCASE;
    if (includeUppercase) charset += UPPERCASE;
    if (includeNumbers) charset += NUMBERS;
    if (includeSymbols) charset += SYMBOLS;

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[secureRandomInt(charset.length)];
    }

    // A fresh password resets the "Copied!" feedback so old state never lingers.
    set({ password: result, copied: false });
  },

  /**
   * Copy the current password to the system clipboard and flip `copied` so the
   * UI can show transient feedback. We guard against an empty password and
   * against environments where the Clipboard API is unavailable.
   */
  copyToClipboard: async () => {
    const { password } = get();
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      set({ copied: true });
      // Auto-reset the flag after 2 seconds so the "Copied!" label disappears.
      setTimeout(() => set({ copied: false }), 2000);
    } catch (error) {
      // Clipboard can be blocked by permissions or insecure (http) contexts.
      console.error("Failed to copy password:", error);
      set({ copied: false });
    }
  },
}));
```

> [!WARNING]
> `navigator.clipboard.writeText` only works in a **secure context** (HTTPS or `localhost`) and requires the call to happen inside a user gesture (a click). It is `Promise`-based, which is why `copyToClipboard` is `async` and wrapped in `try/catch`. Never assume the copy succeeded — always handle the rejection, or your "Copied!" message will lie when permission is denied.

---

## 🧩 5. The Strength Selector (Derived, Never Stored)

Strength is computed, so it lives next to the store as a **plain function** plus a small **selector hook**. This keeps the derivation logic out of the component and lets multiple components reuse it.

```typescript
// src/store/usePasswordStore.ts  (append to the same file)

export type Strength = "Weak" | "Fair" | "Strong";

/**
 * Score the password configuration:
 *  - longer is stronger (length contributes the most)
 *  - each enabled character class widens the pool, raising entropy
 * This is intentionally simple and deterministic so it's easy to test.
 */
export function computeStrength(state: PasswordState): Strength {
  // Count how many character classes are active (lowercase is always on => +1).
  const classes =
    1 +
    (state.includeUppercase ? 1 : 0) +
    (state.includeNumbers ? 1 : 0) +
    (state.includeSymbols ? 1 : 0);

  // A rough score combining length and variety.
  const score = state.length + classes * 4;

  if (state.length < 8 || score < 16) return "Weak";
  if (state.length < 14 || score < 24) return "Fair";
  return "Strong";
}

/**
 * A selector hook so components can subscribe to ONLY the derived strength.
 * Because the selector returns a primitive string, Zustand's default
 * (Object.is) equality check prevents needless re-renders: the component
 * only re-renders when the strength label actually changes, not on every
 * keystroke of the slider.
 */
export const useStrength = (): Strength =>
  usePasswordStore((state) => computeStrength(state));
```

> [!TIP]
> Returning a **primitive** (a string) from a selector is the cheapest possible subscription in Zustand. If a selector returns a fresh object/array on every call, you must pass a custom equality function (e.g. `useShallow`) or you will re-render on every store change. Here, `"Strong" === "Strong"` is `true`, so the component naps until the label genuinely flips.

---

## ⚡ 6. The Component (React 19, Fully Typed)

One component wires everything together. Notice how each piece of UI subscribes to the **narrowest** slice it needs — this is what keeps the app fast.

```tsx
// src/PasswordGenerator.tsx
import { useEffect } from "react";
import { usePasswordStore, useStrength, type Strength } from "./store/usePasswordStore";

// Map each strength label to a width + color for the meter bar.
const STRENGTH_STYLES: Record<Strength, { width: string; color: string }> = {
  Weak: { width: "33%", color: "#ef4444" }, // red
  Fair: { width: "66%", color: "#f59e0b" }, // amber
  Strong: { width: "100%", color: "#22c55e" }, // green
};

export function PasswordGenerator() {
  // Subscribe to each slice individually. Each selector returns a primitive or
  // a stable function reference, so re-renders are minimal and precise.
  const length = usePasswordStore((s) => s.length);
  const includeUppercase = usePasswordStore((s) => s.includeUppercase);
  const includeNumbers = usePasswordStore((s) => s.includeNumbers);
  const includeSymbols = usePasswordStore((s) => s.includeSymbols);
  const password = usePasswordStore((s) => s.password);
  const copied = usePasswordStore((s) => s.copied);

  // Actions have stable identities in Zustand, so grabbing them is free.
  const setLength = usePasswordStore((s) => s.setLength);
  const toggleUppercase = usePasswordStore((s) => s.toggleUppercase);
  const toggleNumbers = usePasswordStore((s) => s.toggleNumbers);
  const toggleSymbols = usePasswordStore((s) => s.toggleSymbols);
  const generate = usePasswordStore((s) => s.generate);
  const copyToClipboard = usePasswordStore((s) => s.copyToClipboard);

  // The derived strength comes from its own selector hook.
  const strength = useStrength();

  // Generate one password on first mount so the UI is never empty,
  // and regenerate whenever length or any flag changes.
  useEffect(() => {
    generate();
  }, [length, includeUppercase, includeNumbers, includeSymbols, generate]);

  const meter = STRENGTH_STYLES[strength];

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "2rem auto",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        🔐 Password Generator
      </h1>

      {/* ---- Generated output + copy button ---- */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <output
          aria-live="polite"
          style={{
            flex: 1,
            padding: "0.6rem 0.75rem",
            fontFamily: "monospace",
            fontSize: "1rem",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {password || "—"}
        </output>
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!password}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 8,
            border: "none",
            cursor: password ? "pointer" : "not-allowed",
            background: copied ? "#22c55e" : "#3b82f6",
            color: "white",
            fontWeight: 600,
            minWidth: 84,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* ---- Strength indicator (derived) ---- */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            marginBottom: 4,
          }}
        >
          <span>Strength</span>
          <span style={{ color: meter.color, fontWeight: 600 }}>{strength}</span>
        </div>
        <div
          style={{
            height: 8,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: meter.width,
              background: meter.color,
              transition: "width 200ms ease, background 200ms ease",
            }}
          />
        </div>
      </div>

      {/* ---- Length slider ---- */}
      <label style={{ display: "block", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span>Length</span>
          <span style={{ fontWeight: 600 }}>{length}</span>
        </div>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </label>

      {/* ---- Checkboxes ---- */}
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <Checkbox
          label="Include uppercase (A-Z)"
          checked={includeUppercase}
          onChange={toggleUppercase}
        />
        <Checkbox
          label="Include numbers (0-9)"
          checked={includeNumbers}
          onChange={toggleNumbers}
        />
        <Checkbox
          label="Include symbols (!@#$…)"
          checked={includeSymbols}
          onChange={toggleSymbols}
        />
      </fieldset>

      {/* ---- Manual regenerate ---- */}
      <button
        type="button"
        onClick={generate}
        style={{
          marginTop: "1.25rem",
          width: "100%",
          padding: "0.7rem",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          background: "#111827",
          color: "white",
          fontWeight: 600,
        }}
      >
        🔄 Regenerate
      </button>
    </div>
  );
}

// A small typed, reusable checkbox row.
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0.35rem 0",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
```

Wire it into the app root:

```tsx
// src/App.tsx
import { PasswordGenerator } from "./PasswordGenerator";

export default function App() {
  return <PasswordGenerator />;
}
```

Run it:

```bash
npm run dev
```

You now have a working generator: drag the slider, toggle the boxes, watch the password and strength bar update live, and click **Copy** to see the transient "Copied!" feedback.

> [!NOTE]
> The `useEffect` that calls `generate()` on every config change is a deliberate UX choice — the password refreshes the instant you change a setting. If you prefer the user to press **Regenerate** explicitly, delete the effect and rely on the button alone. The store does not care; this is purely a component-level decision, which is exactly the kind of separation a Zustand store buys you.

---

## 🛠️ 7. Why This Architecture Wins

| Concern | Naive (`useState`) approach | This Zustand approach |
| --- | --- | --- |
| Where is `generate` logic? | Inside the component, re-created each render | Inside the store, defined once, testable in isolation |
| Sharing state across components | Prop-drilling or lifting state up | Any component calls `usePasswordStore` — zero props |
| Re-render scope | Whole component on any change | Each selector subscribes to one slice |
| Strength value | Risk of storing & forgetting to update | Derived in a selector — can never drift |
| Unit testing the logic | Must render a component | Call `usePasswordStore.getState().generate()` directly |

That last row is worth emphasizing: because the store is just a plain object, you can test it with **no React at all**:

```typescript
// src/store/usePasswordStore.test.ts (Vitest)
import { describe, it, expect, beforeEach } from "vitest";
import { usePasswordStore } from "./usePasswordStore";

describe("password store", () => {
  beforeEach(() => {
    // Reset to a known config before each test.
    usePasswordStore.setState({
      length: 12,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false,
      password: "",
      copied: false,
    });
  });

  it("generates a password of the configured length", () => {
    usePasswordStore.getState().generate();
    expect(usePasswordStore.getState().password).toHaveLength(12);
  });

  it("clamps length to the 4..64 range", () => {
    usePasswordStore.getState().setLength(999);
    expect(usePasswordStore.getState().length).toBe(64);
    usePasswordStore.getState().setLength(1);
    expect(usePasswordStore.getState().length).toBe(4);
  });

  it("excludes symbols when the flag is off", () => {
    usePasswordStore.setState({ includeSymbols: false });
    usePasswordStore.getState().generate();
    const pw = usePasswordStore.getState().password;
    expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw)).toBe(false);
  });
});
```

---

## 🧠 Test Your Knowledge

**1. Why is the password *strength* computed in a selector instead of being stored as a field in the Zustand state?**

<details>
  <summary><b>Reveal Answer</b></summary>

Because strength is **derived state** — it is entirely a function of `length` and the three include-flags. Storing it would create a *second source of truth* that you would have to manually keep in sync inside every action (`setLength`, each `toggle*`, `generate`). Forget one update and the meter lies. By computing it in `computeStrength(state)` and exposing it via the `useStrength` selector hook, the value is always recalculated from the current state, so it can never drift. The general rule: **never store what you can derive.**
</details>

**2. The `generate` action takes no arguments, yet it knows the current `length` and flags. How?**

<details>
  <summary><b>Reveal Answer</b></summary>

Zustand passes `(set, get)` into the store creator. The `generate` action closes over `get`, so calling `get()` returns the **current** state at the moment the action runs — `const { length, includeUppercase, ... } = get();`. This is why the component can call `generate()` with no arguments: the store reads its own state. Using `get()` (rather than capturing values in the component) guarantees the action always sees fresh values, never stale ones.
</details>

**3. Why does the component subscribe to each field with a separate `usePasswordStore((s) => s.field)` call instead of one `usePasswordStore((s) => s)`?**

<details>
  <summary><b>Reveal Answer</b></summary>

Subscribing to the whole state object (`(s) => s`) returns a new reference whenever *anything* changes, forcing the component to re-render on every store update. Narrow selectors return **primitives** (a number, a boolean, a string), and Zustand compares them with `Object.is`. So the `length` subscription only re-renders when `length` actually changes, the `copied` subscription only when `copied` flips, and so on. This makes re-renders precise and cheap. If you *did* want to grab multiple fields in one selector returning an object, you would need `useShallow` to avoid the new-reference re-render trap.
</details>

**4. Why is `copyToClipboard` declared `async` and wrapped in `try/catch`?**

<details>
  <summary><b>Reveal Answer</b></summary>

`navigator.clipboard.writeText()` returns a **Promise** and can **reject** — the Clipboard API requires a secure context (HTTPS or `localhost`), a user gesture, and granted permission. If any of these fail, the promise rejects. Marking the action `async` lets us `await` the write; the `try/catch` ensures a denied/blocked clipboard doesn't crash the app and, importantly, doesn't set `copied: true` (which would show a false "Copied!" message). On failure we log and keep `copied: false`.
</details>

**5. Lowercase characters are always included in the charset even though there is no "include lowercase" checkbox. Why was it designed that way?**

<details>
  <summary><b>Reveal Answer</b></summary>

It guarantees the charset is **never empty**. If every toggle could be turned off, `generate` could build an empty `charset` and `charset[secureRandomInt(0)]` would produce `undefined`, yielding a broken `"undefinedundefined…"` password. By making lowercase the always-on baseline, there is always at least one character class available, so `generate` is always safe and the user always gets a usable password. The strength function accounts for this by starting its class count at `1`.
</details>

---

## 💻 Practice Exercises

### 🧩 Exercise 1 — "Exclude ambiguous characters"

Add a new toggle, `excludeAmbiguous`, that removes easily-confused characters (`l`, `1`, `I`, `O`, `0`, `o`) from the charset before generating. This is a common real-world feature so users don't misread a password.

**Tasks:**
1. Add `excludeAmbiguous: boolean` to the state and a `toggleAmbiguous: () => void` action.
2. In `generate`, after building `charset`, strip the ambiguous characters when the flag is on.
3. Add a `<Checkbox>` to the component wired to the new flag.

**Starter:**

```typescript
// In the PasswordState interface, add:
//   excludeAmbiguous: boolean;
//   toggleAmbiguous: () => void;

const AMBIGUOUS = new Set(["l", "1", "I", "O", "0", "o"]);

// Inside generate(), after assembling `charset`:
generate: () => {
  const { length, includeUppercase, includeNumbers, includeSymbols, excludeAmbiguous } = get();

  let charset = LOWERCASE;
  if (includeUppercase) charset += UPPERCASE;
  if (includeNumbers) charset += NUMBERS;
  if (includeSymbols) charset += SYMBOLS;

  if (excludeAmbiguous) {
    charset = [...charset].filter((c) => !AMBIGUOUS.has(c)).join("");
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[secureRandomInt(charset.length)];
  }
  set({ password: result, copied: false });
},
```

Then add the checkbox in the component:

```tsx
const excludeAmbiguous = usePasswordStore((s) => s.excludeAmbiguous);
const toggleAmbiguous = usePasswordStore((s) => s.toggleAmbiguous);

// Add this Checkbox alongside the other three inside the existing <fieldset>:
<Checkbox
  label="Exclude ambiguous (l 1 I O 0 o)"
  checked={excludeAmbiguous}
  onChange={toggleAmbiguous}
/>
```

Don't forget to include `excludeAmbiguous` in the `useEffect` dependency array so the password regenerates when it changes.

### 🧩 Exercise 2 — "Guarantee at least one of each enabled class"

A truly strong password should contain at least one character from **every** enabled class (e.g. if numbers are on, guarantee at least one digit). Right now `generate` draws purely at random, so a short password could accidentally omit numbers entirely.

**Tasks:**
1. Build an array of the enabled pools (always include lowercase).
2. Seed the result with one guaranteed character from each enabled pool.
3. Fill the remaining slots randomly from the combined charset.
4. Shuffle the final array (so the guaranteed chars aren't always at the front) before joining.

**Starter:**

```typescript
generate: () => {
  const { length, includeUppercase, includeNumbers, includeSymbols } = get();

  // 1. Collect the enabled pools.
  const pools: string[] = [LOWERCASE];
  if (includeUppercase) pools.push(UPPERCASE);
  if (includeNumbers) pools.push(NUMBERS);
  if (includeSymbols) pools.push(SYMBOLS);

  const combined = pools.join("");
  const chars: string[] = [];

  // 2. Guarantee one char from each pool (if length allows).
  for (const pool of pools) {
    if (chars.length < length) {
      chars.push(pool[secureRandomInt(pool.length)]);
    }
  }

  // 3. Fill the rest from the combined charset.
  while (chars.length < length) {
    chars.push(combined[secureRandomInt(combined.length)]);
  }

  // 4. Fisher-Yates shuffle so guaranteed chars aren't predictable.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  set({ password: chars.join(""), copied: false });
},
```

**Stretch goal:** write a Vitest test asserting that with all flags enabled and `length = 16`, the generated password contains at least one uppercase letter, one digit, and one symbol.

---

> [!TIP]
> Once this works, try adding the `persist` middleware (covered in `02-async-and-persistence.md`) so the user's **preferred length and flags** survive a page refresh — but deliberately **exclude** `password` and `copied` from what you persist. You never want to write a generated password to `localStorage`. Use `partialize` to whitelist only the config fields.
