# Vitest: Mocking, Spying & Fake Timers 🎭

In the previous lesson you wrote tests that *render* a component and assert on what the user sees. But real applications are full of things you do **not** want a unit test to actually run: network calls, database writes, third-party SDKs, `Date.now()`, `setTimeout`, analytics pings. A good unit test isolates the **unit under test** and replaces everything else with a controlled stand-in. That stand-in is a **mock**.

In this lesson you will master Vitest's mocking toolkit: `vi.fn()` to create fake callbacks you can inspect, `vi.spyOn()` to wrap and observe a real object's method, `vi.mock()` to replace an entire module (such as your API layer), and **fake timers** to make time-based code (debounce, throttle, polling) run instantly and deterministically. You will also learn the mock *lifecycle* — the difference between `clear`, `reset`, and `restore` — which is the single most common source of flaky tests.

> [!NOTE]
> In the recorded course, the instructor uses `vi.fn()` to mock a callback prop (for example the `onPageChange` handler of a pagination component) and asserts on it with `toHaveBeenCalledWith(...)`. That part is **grounded** in the transcript. Everything else in this lesson — `mockReturnValue`/`mockResolvedValue`/`mockImplementation`, `vi.spyOn`, `vi.mock`, the clear/reset/restore lifecycle, and fake timers — is **net-new** material beyond the recording. It reflects current Vitest best practices (Vitest 3.x) and the patterns professional React teams rely on.

---

## ⚡ 1. Concept & Overview: What Is a Mock?

A **mock** (also loosely called a "test double") is a fake implementation that stands in for a real dependency during a test. It serves two purposes:

1. **Control** — you decide exactly what it returns, so the test is deterministic.
2. **Inspection** — it records every call (arguments, call count, order) so you can assert *how* your code used it.

Vitest gives you three escalating levels of faking, and choosing the right one is most of the skill:

| Tool | What it fakes | Typical use | Cleanup |
| --- | --- | --- | --- |
| `vi.fn()` | A standalone function | A callback prop, an injected dependency | `mockClear` / `mockReset` |
| `vi.spyOn(obj, "m")` | One **method on a real object** | Watch `console.error`, stub `Math.random`, observe a service method while keeping the rest of the object real | `mockRestore` (puts the original back) |
| `vi.mock("module")` | An **entire module** | Replace your `api.ts` / `db.ts` so no real network happens | `vi.unmock` / automatic per-file |

### 🛠️ A real-world metaphor: the film stunt double

Imagine shooting an action movie. The lead actor (your real dependency) is expensive, fragile, and you cannot have them jump off a building for every take. So you bring in three kinds of stand-ins:

- **`vi.fn()`** is a **brand-new stunt double** hired from scratch — there is no "real" version, you create one purely for this scene and tell it exactly what to do ("fall, then give a thumbs up").
- **`vi.spyOn()`** is **wiring a hidden camera onto the real actor's costume**. By default the actor still performs normally, but now you can review the footage afterward ("how many punches did they throw?"). You can *also* tell them to fake the stunt if you want — and crucially, you must **remove the camera afterward** (`mockRestore`) so the costume is clean for the next scene.
- **`vi.mock()`** is **swapping out the entire character** — every scene that references "the villain's API" now uses a puppet you fully control, for the whole shoot.

The director (you) reviews the footage — call counts and arguments — to confirm the scene played out exactly as scripted.

---

## ⚡ 2. `vi.fn()` — Creating & Inspecting Mock Functions

`vi.fn()` returns a function that does nothing by default but **remembers everything**. You configure its return value and later assert on how it was called.

### 🧩 Configuring behavior

```typescript
// src/__tests__/vi-fn-behavior.test.ts
import { describe, it, expect, vi } from "vitest";

describe("vi.fn() behavior configuration", () => {
  it("returns a fixed value with mockReturnValue", () => {
    const getDiscount = vi.fn();
    getDiscount.mockReturnValue(0.1); // always returns 10%

    expect(getDiscount()).toBe(0.1);
    expect(getDiscount("ignored-argument")).toBe(0.1);
  });

  it("resolves a promise with mockResolvedValue", async () => {
    // Perfect for faking an async API client method.
    const fetchUser = vi.fn();
    fetchUser.mockResolvedValue({ id: 1, name: "Ada" });

    await expect(fetchUser()).resolves.toEqual({ id: 1, name: "Ada" });
  });

  it("rejects a promise with mockRejectedValue", async () => {
    const fetchUser = vi.fn();
    fetchUser.mockRejectedValue(new Error("Network down"));

    await expect(fetchUser()).rejects.toThrow("Network down");
  });

  it("runs custom logic with mockImplementation", () => {
    // Use when the return value must depend on the arguments.
    const add = vi.fn((a: number, b: number) => a + b);

    expect(add(2, 3)).toBe(5);
    expect(add(10, 5)).toBe(15);
  });

  it("queues one-shot values with mockReturnValueOnce", () => {
    const next = vi.fn().mockReturnValue("default");
    next.mockReturnValueOnce("first").mockReturnValueOnce("second");

    expect(next()).toBe("first"); // consumed
    expect(next()).toBe("second"); // consumed
    expect(next()).toBe("default"); // falls back to the base value
  });
});
```

> [!TIP]
> Reach for `mockResolvedValue(x)` / `mockRejectedValue(e)` instead of `mockReturnValue(Promise.resolve(x))`. They are shorthand for exactly that, but they read better and make the "this is async" intent obvious.

### 🧩 Asserting on calls

Every `vi.fn()` records its calls. These are the matchers you will use constantly:

```typescript
// src/__tests__/vi-fn-assertions.test.ts
import { describe, it, expect, vi } from "vitest";

// The unit under test: a pure function that receives a callback (dependency injection).
// In React this is exactly the shape of a callback prop like onPageChange.
function applyCoupon(
  price: number,
  code: string,
  onApplied: (finalPrice: number, code: string) => void,
): number {
  const discount = code === "SAVE10" ? 0.1 : 0;
  const finalPrice = price * (1 - discount);
  onApplied(finalPrice, code); // notify the caller
  return finalPrice;
}

describe("applyCoupon notifies its callback", () => {
  it("calls the callback with the final price and code", () => {
    const onApplied = vi.fn(); // a brand-new stunt double

    const result = applyCoupon(100, "SAVE10", onApplied);

    expect(result).toBe(90);
    expect(onApplied).toHaveBeenCalled(); // was it called at all?
    expect(onApplied).toHaveBeenCalledTimes(1); // exactly once
    expect(onApplied).toHaveBeenCalledWith(90, "SAVE10"); // with these exact args
  });

  it("exposes the raw call log via .mock.calls", () => {
    const onApplied = vi.fn();

    applyCoupon(50, "NONE", onApplied);

    // .mock.calls is an array of argument-arrays, one per invocation.
    expect(onApplied.mock.calls).toEqual([[50, "NONE"]]);
    // .mock.lastCall is the most recent argument-array.
    expect(onApplied.mock.lastCall).toEqual([50, "NONE"]);
  });
});
```

> [!NOTE]
> When you only care that *some* arguments matched and want to ignore the rest, use **asymmetric matchers**: `expect(fn).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("SAVE"))`. This keeps tests robust against irrelevant argument changes.

---

## ⚡ 3. `vi.spyOn()` — Observe (and Optionally Replace) Real Methods

`vi.fn()` creates a function from nothing. But often you want to watch a method that **already exists** on a real object — without rewriting the object. That is `vi.spyOn(object, "method")`.

By default a spy **still calls through to the original implementation** while recording calls. You can then *optionally* override it with `.mockImplementation()` / `.mockReturnValue()`, and you **must** put the original back with `.mockRestore()`.

```typescript
// src/__tests__/vi-spyon.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";

// A small service object — note paySvc.charge is a REAL method.
const paymentService = {
  rate: 1.2,
  charge(amount: number): number {
    return Math.round(amount * this.rate); // real business logic
  },
};

describe("vi.spyOn observes a real method", () => {
  afterEach(() => {
    // CRITICAL: restore every spy so later tests see the real object.
    vi.restoreAllMocks();
  });

  it("records calls while keeping the real implementation (call-through)", () => {
    const spy = vi.spyOn(paymentService, "charge");

    const result = paymentService.charge(100); // real logic still runs

    expect(result).toBe(120); // 100 * 1.2, rounded
    expect(spy).toHaveBeenCalledWith(100);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("can replace the implementation when you don't want the real one", () => {
    const spy = vi
      .spyOn(paymentService, "charge")
      .mockReturnValue(999); // stub it out entirely

    expect(paymentService.charge(100)).toBe(999); // real logic skipped
    expect(spy).toHaveBeenCalledOnce();
  });

  it("silences a noisy console.error during a test", () => {
    // A very common spy: stop expected error logs from polluting test output.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    console.error("this would normally print red noise");

    expect(errorSpy).toHaveBeenCalledWith("this would normally print red noise");
    // afterEach -> restoreAllMocks() puts console.error back to normal.
  });
});
```

> [!WARNING]
> If you `mockImplementation` a spy and forget `mockRestore()` (or `vi.restoreAllMocks()`), the override **leaks into every later test in the file**. A spied-and-stubbed `console.error` that is never restored can silently swallow real errors for the rest of the suite. Always pair `vi.spyOn(...).mockImplementation(...)` with a restore in `afterEach`.

### How the three lookalikes differ

```
vi.fn()                  -> no original. A function born for the test.
vi.spyOn(obj,"m")        -> wraps obj.m. Calls through by default. Restorable.
vi.spyOn(obj,"m")
   .mockImplementation() -> wraps AND replaces obj.m. Restorable.
```

---

## ⚡ 4. `vi.mock()` — Replace an Entire Module

When your component imports a whole module — say `import { fetchProducts } from "../api/products"` — you do not want the real HTTP call in a unit test. `vi.mock("../api/products")` replaces the **entire module** with mocks for the whole test file.

> [!NOTE]
> `vi.mock()` is **hoisted** to the top of the file by Vitest before any imports run, regardless of where you write it. That is intentional — the module must be replaced *before* the file under test imports it. A consequence: you cannot reference outer-scope variables inside the factory unless you wrap them in `vi.hoisted()` (shown below).

### 🛠️ The module being mocked

```typescript
// src/api/products.ts  — the REAL module (makes a network request)
export interface Product {
  id: number;
  name: string;
  price: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("https://api.example.com/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}
```

### 🛠️ The code under test

```tsx
// src/components/ProductList.tsx
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "../api/products";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name} — ${p.price}
        </li>
      ))}
    </ul>
  );
}
```

### 🛠️ The test — factory form

```tsx
// src/components/__tests__/ProductList.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "../ProductList";
import { fetchProducts, type Product } from "../../api/products";

// Replace the whole ../../api/products module with a factory.
// The factory must return an object shaped like the module's exports.
vi.mock("../../api/products", () => ({
  fetchProducts: vi.fn(), // a mock we will program per-test
}));

// Tell TypeScript that fetchProducts is now a mock, so .mockResolvedValue exists.
const mockedFetch = vi.mocked(fetchProducts);

describe("ProductList", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // wipe call history between tests
  });

  it("renders products returned by the mocked api", async () => {
    const fake: Product[] = [
      { id: 1, name: "Keyboard", price: 80 },
      { id: 2, name: "Mouse", price: 30 },
    ];
    mockedFetch.mockResolvedValue(fake);

    render(<ProductList />);

    // findBy* waits for the async useEffect + state update.
    expect(await screen.findByText("Keyboard — $80")).toBeInTheDocument();
    expect(screen.getByText("Mouse — $30")).toBeInTheDocument();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when the api rejects", async () => {
    mockedFetch.mockRejectedValue(new Error("Failed to load products"));

    render(<ProductList />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Failed to load products");
  });
});
```

> [!TIP]
> `vi.mocked(fn)` does **not** change runtime behavior — it is a pure TypeScript helper that re-types the already-mocked function so methods like `.mockResolvedValue` and `.mockReturnValue` are visible and type-checked. Without it you would get red squiggles even though the code runs.

### Using `vi.hoisted()` when the factory needs shared variables

Because `vi.mock` is hoisted above your imports, the factory runs **before** any top-level `const`. To share a mock between the factory and your tests, create it inside `vi.hoisted()`:

```tsx
// src/components/__tests__/ProductList.hoisted.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "../ProductList";

// vi.hoisted runs in the same early phase as vi.mock, so this is safe to reference.
const { fetchProductsMock } = vi.hoisted(() => ({
  fetchProductsMock: vi.fn(),
}));

vi.mock("../../api/products", () => ({
  fetchProducts: fetchProductsMock, // reference the hoisted mock
}));

describe("ProductList with hoisted mock", () => {
  it("renders the resolved product", async () => {
    fetchProductsMock.mockResolvedValue([{ id: 9, name: "Webcam", price: 50 }]);

    render(<ProductList />);

    expect(await screen.findByText("Webcam — $50")).toBeInTheDocument();
  });
});
```

---

## ⚡ 5. Mock Lifecycle: `clear` vs `reset` vs `restore`

This is the part that bites everyone. The three functions sound similar but do **different** things:

| Function | Clears call history (`.mock.calls`) | Removes the implementation / return value | Restores the *original* (spies only) |
| --- | :---: | :---: | :---: |
| `vi.clearAllMocks()` | ✅ | ❌ | ❌ |
| `vi.resetAllMocks()` | ✅ | ✅ (back to a no-op `vi.fn()`) | ❌ |
| `vi.restoreAllMocks()` | ✅ | ✅ | ✅ (only affects `vi.spyOn` spies) |

Plain-English rules of thumb:

- **`clearAllMocks`** — "forget who called you, but keep behaving the same." Use between tests when the *behavior* is set up once and you only want fresh call counts.
- **`resetAllMocks`** — "forget everything, including what you were programmed to return." After this a mock returns `undefined` again. Use when each test programs its own return values.
- **`restoreAllMocks`** — "put the real method back." **Only spies created with `vi.spyOn` are restored**; mocks created with `vi.fn()` are not. This is the one you need to undo `console` overrides and other real-object patches.

```typescript
// src/__tests__/lifecycle.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const fn = vi.fn();

describe("clearAllMocks keeps the implementation", () => {
  beforeEach(() => {
    fn.mockReturnValue("configured"); // set behavior every test
    vi.clearAllMocks(); // wipes calls, NOT the return value...
    // ...but note: we re-set the return value BEFORE clearing here,
    // so order matters. clearAllMocks does not touch mockReturnValue.
  });

  it("starts each test with zero calls but the same behavior", () => {
    expect(fn).toHaveBeenCalledTimes(0); // history was cleared
    expect(fn()).toBe("configured"); // behavior survived clear
  });
});
```

> [!WARNING]
> Set these globally in `vitest.config.ts` so you never rely on remembering them per-file:
> ```typescript
> // vitest.config.ts
> import { defineConfig } from "vitest/config";
> import react from "@vitejs/plugin-react";
>
> export default defineConfig({
>   plugins: [react()],
>   test: {
>     globals: true,
>     environment: "jsdom",
>     setupFiles: "./src/setupTests.ts",
>     clearMocks: true,    // auto vi.clearAllMocks() before each test
>     restoreMocks: true,  // auto vi.restoreAllMocks() before each test
>   },
> });
> ```
> With `restoreMocks: true`, a forgotten `vi.spyOn(console, "error")` can no longer leak across files. This single config flag prevents a whole category of flaky tests.

---

## ⚡ 6. Fake Timers — Testing `setTimeout`, Debounce & Polling

Time-based code is a nightmare to test for real: a 300 ms debounce means a 300 ms-slow test. **Fake timers** let you replace the clock with one *you* advance manually, so a 5-minute polling loop runs in microseconds and is fully deterministic.

The cycle is always: `vi.useFakeTimers()` → run code that schedules timers → `vi.advanceTimersByTime(ms)` (or `vi.runAllTimers()`) → assert → `vi.useRealTimers()`.

| API | What it does |
| --- | --- |
| `vi.useFakeTimers()` | Replace `setTimeout`/`setInterval`/`Date` with fakes |
| `vi.advanceTimersByTime(ms)` | Move the fake clock forward `ms`, firing any due callbacks |
| `vi.advanceTimersByTimeAsync(ms)` | Same, but also flushes pending microtasks/promises |
| `vi.runAllTimers()` | Fire **every** pending timer immediately (beware infinite intervals) |
| `vi.runOnlyPendingTimers()` | Fire only timers scheduled *so far* (safe for intervals) |
| `vi.useRealTimers()` | Restore the real clock — always do this when done |

### 🛠️ The unit under test: a debounce utility

```typescript
// src/utils/debounce.ts
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

### 🛠️ Testing it with fake timers

```typescript
// src/utils/__tests__/debounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // install the fake clock
  });

  afterEach(() => {
    vi.useRealTimers(); // ALWAYS restore the real clock
  });

  it("delays the call until the delay has elapsed", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced("hello");
    expect(spy).not.toHaveBeenCalled(); // nothing yet

    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled(); // still not enough time

    vi.advanceTimersByTime(1); // total 300ms -> fires
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("hello");
  });

  it("collapses rapid calls into a single trailing call", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 200);

    debounced("a");
    debounced("b");
    debounced("c"); // each call resets the timer

    vi.advanceTimersByTime(200);

    // Only the LAST call survives the debounce window.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("c");
  });

  it("runAllTimers flushes every pending timeout at once", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 5000);

    debounced("instant");
    vi.runAllTimers(); // jump straight to the end, no ms math

    expect(spy).toHaveBeenCalledWith("instant");
  });
});
```

> [!WARNING]
> Never call `vi.runAllTimers()` on code that uses `setInterval` or a `setTimeout` that re-schedules itself — there is **no "end"**, so Vitest throws after 10,000 iterations to protect you from an infinite loop. For recurring timers use `vi.advanceTimersByTime(ms)` or `vi.runOnlyPendingTimers()` instead.

### 🛠️ Fake timers + a React component

When fake timers drive a state update inside a component, advance the clock **inside `act`** (React Testing Library re-exports it) so React flushes the resulting re-render before you assert:

```tsx
// src/components/__tests__/AutoSaveBadge.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useEffect, useState } from "react";

// A tiny component that shows "Saved" 1 second after mount.
function AutoSaveBadge() {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSaved(true), 1000);
    return () => clearTimeout(id);
  }, []);
  return <span>{saved ? "Saved" : "Saving…"}</span>;
}

describe("AutoSaveBadge", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("flips to 'Saved' after one second of fake time", () => {
    render(<AutoSaveBadge />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();

    // Advance the fake clock inside act() so React applies the state update.
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
```

> [!TIP]
> If your component also relies on `userEvent` from Testing Library while fake timers are active, create the user with `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`. Otherwise `userEvent`'s internal delays will hang forever against a frozen clock.

---

## ⚡ 7. Putting It Together — Decision Guide

```
Need to fake something in a test?
│
├─ It's a callback / injected function with no real version
│     → vi.fn()  (program with mockReturnValue / mockResolvedValue / mockImplementation)
│
├─ It's ONE method on a real object you mostly want to keep
│     → vi.spyOn(obj, "method")   (+ mockRestore / restoreMocks)
│
├─ It's an ENTIRE imported module (api, db, sdk)
│     → vi.mock("module", factory)   (+ vi.mocked for types)
│
└─ It's TIME (setTimeout, setInterval, Date, debounce, polling)
      → vi.useFakeTimers() / advanceTimersByTime / useRealTimers
```

---

## 🧠 Test Your Knowledge

<details>
  <summary><b>Reveal Answer</b></summary>

**Q1. What is the difference between `mockReturnValue` and `mockResolvedValue`?**

`mockReturnValue(x)` makes the mock return `x` synchronously. `mockResolvedValue(x)` makes the mock return a **Promise that resolves to `x`** — it is shorthand for `mockReturnValue(Promise.resolve(x))`. Use `mockResolvedValue` (and its sibling `mockRejectedValue`) when faking an `async` function such as an API client method, so the consuming code's `await` / `.then()` behaves correctly. Using `mockReturnValue(x)` for an async dependency would hand the caller a raw value instead of a thenable and break the `await`.
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

**Q2. By default, does `vi.spyOn(obj, "method")` run the original method or replace it?**

It **runs the original** (call-through) while recording every call. A spy by itself only *observes*. To replace the behavior you chain `.mockImplementation(...)`, `.mockReturnValue(...)`, or `.mockResolvedValue(...)`. This is the key distinction from `vi.fn()`, which never has an original to call through to. Because a spy patches a real object, you must undo it with `.mockRestore()` (or `vi.restoreAllMocks()` / `restoreMocks: true`).
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

**Q3. Why must `vi.mock(...)` be written even though it appears at the bottom of imports, and what is `vi.hoisted` for?**

Vitest **hoists** every `vi.mock()` call to the very top of the file, above all imports, so the module is replaced *before* the file under test imports it. Because the factory therefore runs in this early phase — before any top-level `const`/`let` is initialized — you cannot reference outer-scope variables inside the factory directly (you would get a "Cannot access before initialization" error). `vi.hoisted(() => ({...}))` lets you create values (like a shared `vi.fn()`) in that same early phase so both the factory and your test body can reference them safely.
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

**Q4. You spied on `console.error` with `.mockImplementation(() => {})` in one test. The next test in the same file unexpectedly has no error output and a real bug goes unnoticed. What happened and how do you prevent it?**

The spy was never restored, so the no-op implementation **leaked** into subsequent tests and swallowed all `console.error` output for the rest of the file. The fix is to restore spies after each test — either explicitly with `afterEach(() => vi.restoreAllMocks())`, or globally by setting `restoreMocks: true` in `vitest.config.ts`. Note that `clearAllMocks` and `resetAllMocks` would **not** fix this: only `restoreAllMocks` puts the original `console.error` back, and it only does so for spies created via `vi.spyOn`.
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

**Q5. When testing a `setInterval`-based poller, why is `vi.runAllTimers()` dangerous, and what should you use instead?**

`vi.runAllTimers()` fires **all** pending timers and keeps firing any new ones they schedule until the queue is empty. A `setInterval` (or a self-rescheduling `setTimeout`) never empties its queue, so this would loop forever; Vitest guards against this by throwing after ~10,000 iterations. Instead, advance the clock deterministically with `vi.advanceTimersByTime(ms)` (fire exactly the timers due in that window) or `vi.runOnlyPendingTimers()` (fire only the timers already scheduled, not the ones they spawn). Always finish with `vi.useRealTimers()`.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1 — Mock a callback and an API module

You are given a `checkout` function and a `payments` API module. Write tests that (a) verify `checkout` calls its `onSuccess` callback with the order total, and (b) mock the `payments` module so no real charge happens.

**Starter — code under test:**

```typescript
// src/payments/payments.ts  — the REAL module
export async function chargeCard(amountCents: number): Promise<{ id: string }> {
  const res = await fetch("https://pay.example.com/charge", {
    method: "POST",
    body: JSON.stringify({ amountCents }),
  });
  if (!res.ok) throw new Error("Charge failed");
  return res.json();
}
```

```typescript
// src/payments/checkout.ts  — the unit under test
import { chargeCard } from "./payments";

export async function checkout(
  cents: number,
  onSuccess: (chargeId: string, total: number) => void,
): Promise<void> {
  const { id } = await chargeCard(cents);
  onSuccess(id, cents);
}
```

**Your tasks:**

```typescript
// src/payments/__tests__/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkout } from "../checkout";
import { chargeCard } from "../payments";

// TASK 1: Mock the entire ../payments module so chargeCard is a vi.fn().
//         (Hint: vi.mock + a factory returning { chargeCard: vi.fn() })

// TASK 2: Re-type chargeCard with vi.mocked so mockResolvedValue is available.

describe("checkout", () => {
  beforeEach(() => {
    // TASK 3: clear mock call history before each test.
  });

  it("calls onSuccess with the charge id and total", async () => {
    // TASK 4: program the mocked chargeCard to resolve to { id: "ch_123" }.
    // TASK 5: create an onSuccess mock with vi.fn().
    // TASK 6: await checkout(2500, onSuccess).
    // TASK 7: assert onSuccess was called once with ("ch_123", 2500)
    //         and that chargeCard was called with 2500.
  });
});
```

<details>
  <summary><b>Reveal one possible solution</b></summary>

```typescript
// src/payments/__tests__/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkout } from "../checkout";
import { chargeCard } from "../payments";

vi.mock("../payments", () => ({
  chargeCard: vi.fn(),
}));

const mockedCharge = vi.mocked(chargeCard);

describe("checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onSuccess with the charge id and total", async () => {
    mockedCharge.mockResolvedValue({ id: "ch_123" });
    const onSuccess = vi.fn();

    await checkout(2500, onSuccess);

    expect(mockedCharge).toHaveBeenCalledWith(2500);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("ch_123", 2500);
  });
});
```
</details>

---

### 🛠️ Exercise 2 — Test a throttle utility with fake timers

A `throttle` runs the function immediately, then ignores further calls until `limit` ms have passed. Use fake timers to prove it.

**Starter — code under test:**

```typescript
// src/utils/throttle.ts
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  limit: number,
): (...args: Args) => void {
  let inCooldown = false;
  return (...args: Args) => {
    if (inCooldown) return;
    fn(...args); // run immediately (leading edge)
    inCooldown = true;
    setTimeout(() => {
      inCooldown = false;
    }, limit);
  };
}
```

**Your tasks:**

```typescript
// src/utils/__tests__/throttle.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../throttle";

describe("throttle", () => {
  // TASK 1: install fake timers before each test.
  // TASK 2: restore real timers after each test.

  it("runs immediately then blocks until the limit elapses", () => {
    // TASK 3: create a spy and a throttled wrapper with limit 1000.
    // TASK 4: call it 3 times in a row -> assert it ran exactly ONCE.
    // TASK 5: advance fake time by 1000ms.
    // TASK 6: call it again -> assert it has now run exactly TWICE.
  });
});
```

<details>
  <summary><b>Reveal one possible solution</b></summary>

```typescript
// src/utils/__tests__/throttle.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../throttle";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs immediately then blocks until the limit elapses", () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 1000);

    throttled("a");
    throttled("b");
    throttled("c");
    expect(spy).toHaveBeenCalledTimes(1); // leading call only
    expect(spy).toHaveBeenCalledWith("a");

    vi.advanceTimersByTime(1000); // cooldown ends

    throttled("d");
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith("d");
  });
});
```
</details>

---

You now have the full Vitest faking toolkit: `vi.fn()` for callbacks, `vi.spyOn()` for real methods, `vi.mock()` for entire modules, the clear/reset/restore lifecycle to keep tests isolated, and fake timers to make time-dependent code instant and deterministic. Combined with React Testing Library from the previous lesson, you can now test any component or utility — no matter how many side effects it hides. 🎭
