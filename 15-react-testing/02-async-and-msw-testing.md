# Testing Async UI with React Testing Library & MSW 🌐

In a real app, almost nothing interesting happens synchronously. You click a button, the UI shows a spinner, a request flies off to an API, and *some time later* a list of results — or an error banner — appears. If your tests only assert against the first paint, they verify a screen no real user ever sees. Async testing is about asserting on the screen **after the dust settles**.

This lesson covers the two halves of that problem. First, the **query side**: how `findBy*` and `waitFor` let your test wait for elements that appear asynchronously without brittle `setTimeout` hacks. Second, the **network side**: how **Mock Service Worker (MSW v2)** intercepts requests at the network layer so your component runs its *real* `fetch`/`axios` code against *fake* responses you control per test. We'll finish with a complete, copy-pasteable example: a component that fetches a list, tested across its **loading → success → error** lifecycle.

> [!NOTE]
> **MSW is referenced in this course's toolset** (it appears in the design-system/Chromatic discussion) but is not taught step-by-step in the recordings. This is therefore a **standard, modern testing lesson** written to current best practices: **MSW v2** (the `http` + `HttpResponse` API), **Vitest**, and **React Testing Library** with `@testing-library/user-event`. The patterns map 1:1 to Jest if your project uses it instead.

---

## ⚡ 1. Concept & Overview: The Three States of Async UI

Every component that loads data passes through a small state machine. Even if you never write the word "state machine," your JSX encodes one:

```
        ┌─────────────┐
        │   IDLE      │  (optional: before the request starts)
        └──────┬──────┘
               │ fetch begins
               ▼
        ┌─────────────┐
        │  LOADING    │  → render a spinner / skeleton
        └──────┬──────┘
        ┌──────┴───────┐
        ▼              ▼
 ┌─────────────┐ ┌─────────────┐
 │   SUCCESS   │ │    ERROR    │
 │ render data │ │ render msg  │
 └─────────────┘ └─────────────┘
```

A complete test suite asserts on **all three reachable end states** (loading, success, error), not just the happy path. The hard part is that LOADING is the *initial* render and SUCCESS/ERROR arrive *later*, on a future microtask, after the network promise resolves. Your assertions must therefore be **time-aware**.

### 🛠️ A real-world metaphor: ordering at a restaurant

Hand-mocking `fetch` is like **bribing the waiter to recite a menu line you wrote on a napkin**. The waiter never walks to the kitchen, so you never test whether your *order* (the request URL, headers, query params, JSON body) was correct — only that the waiter can read your napkin. The moment you change how you place the order, your napkin test still "passes" while the real kitchen rejects the order.

**MSW is a fake kitchen installed behind the same pass-through window the real kitchen uses.** Your code places a genuine order through the normal channel (`fetch`/`axios`), the order travels exactly as it would in production, and the fake kitchen hands back a dish *you* prepared for this test. You're testing the whole pipeline — request construction, response parsing, and rendering — not just a napkin.

> [!TIP]
> The mantra: **mock at the boundary you don't own, run everything you do own.** You own your component's fetch logic, its parsing, and its rendering — so run all of it for real. You don't own the network, so mock *that*. MSW draws the line in exactly the right place.

---

## 🧩 2. `findBy*` vs `getBy*` vs `queryBy*` — Choosing the Right Query

React Testing Library gives three query *families*, and async testing lives almost entirely in the third one. Picking the wrong family is the single most common source of flaky async tests.

| Query family | Returns | Waits for the element? | Throws if not found? | Use it to assert… |
| ------------- | ------- | ---------------------- | -------------------- | ----------------- |
| `getBy*`      | Element | **No** (synchronous)   | **Yes** (immediately) | something is **already** there *now* |
| `queryBy*`    | Element \| `null` | **No** (synchronous) | No — returns `null` | something is **absent** right now |
| `findBy*`     | `Promise<Element>` | **Yes** (retries up to a timeout) | Yes, after timeout | something will **appear** soon |

The mental rule:

- **`findBy*`** = "appears later." It's literally `waitFor` + `getBy` fused together, returning a promise you `await`. Use it for the SUCCESS/ERROR content.
- **`queryBy*`** = "should be gone / never there." It's the *only* family that returns `null` instead of throwing, so it's the one you pair with `.not.toBeInTheDocument()`.
- **`getBy*`** = "synchronously present." Use it for the initial LOADING render and for content you've *already* awaited into existence.

```tsx
// LOADING: present on first synchronous render → getBy
expect(screen.getByRole('status')).toBeInTheDocument();

// SUCCESS: appears after the fetch resolves → findBy (await it!)
expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

// The spinner should be GONE now → queryBy + .not
expect(screen.queryByRole('status')).not.toBeInTheDocument();
```

> [!WARNING]
> A `findBy*` call returns a **Promise**. Forgetting to `await` it is a classic bug: the assertion runs against an unsettled promise (always truthy), the test passes for the wrong reason, and you get an `act(...)`/unhandled-rejection warning later. **Always `await` every `findBy*`.** A lint rule (`testing-library/await-async-queries`) catches this — enable it.

### ⚡ `waitFor` — for assertions that aren't "an element appeared"

`findBy*` is sugar for the common case "an element shows up." When you need to wait for *something else* — a mock to have been called, an element to **disappear**, a class to change — reach for `waitFor`, which re-runs its callback until it stops throwing (or times out).

```tsx
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';

// Wait until a side effect has happened (callback called).
await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));

// Wait for the spinner to be REMOVED — purpose-built helper, clearer than a manual loop.
await waitForElementToBeRemoved(() => screen.queryByRole('status'));
```

> [!TIP]
> Prefer `findBy*` over a manual `waitFor(() => expect(getBy...).toBeInTheDocument())` — it's shorter and gives a better failure message. Reserve `waitFor` for *non-appearance* conditions, and keep its callback **side-effect-free** and **single-assertion** so the retry loop stays cheap and the failure is unambiguous.

---

## 🧩 3. Why MSW Beats Hand-Mocking `fetch`

Before MSW, the common move was `vi.spyOn(global, 'fetch').mockResolvedValue(...)`. Here is why that ages badly and MSW doesn't.

| Concern | Hand-mocked `fetch` | MSW (network interception) |
| ------- | ------------------- | -------------------------- |
| **Realism** | Returns a fake object you hand-shape; bypasses your real fetch call | Your real `fetch`/`axios` runs; MSW intercepts the actual HTTP request |
| **Request assertions** | You can't easily verify URL, method, headers, body were correct | Handlers receive the real `Request` — assert on URL, params, body |
| **Reuse** | Re-stubbed in every test file, copy-pasted, drifts | One handler set, shared by tests **and** the dev browser (`setupWorker`) |
| **Client-agnostic** | Tied to `fetch`; breaks if you switch to `axios` | Intercepts at network layer — `fetch`, `axios`, `ky`, all work unchanged |
| **Coupling** | Couples tests to the *implementation* (which client you call) | Couples tests to the *contract* (the API endpoint) — refactor freely |

The deciding factor is the last row. Hand-mocking ties your test to *how* you fetch. Swap `fetch` for `axios` and every mock breaks even though behavior is identical. MSW ties the test to *what endpoint* you call — the actual contract — so you can refactor the client internals without touching a single test.

> [!NOTE]
> In tests (Node), MSW uses `setupServer` and patches Node's request layer. In the browser (dev/Storybook) it uses `setupWorker` and a real **Service Worker**. The handler array — `http.get(...)`, `http.post(...)` — is **identical** across both, which is why the same mocks power your tests *and* your local dev experience.

---

## 🛠️ 4. Installing & Wiring MSW v2

```bash
# MSW and the testing stack as dev dependencies
npm i -D msw @testing-library/react @testing-library/user-event @testing-library/jest-dom

# This lesson uses Vitest + jsdom; for Jest the equivalents are jest + jest-environment-jsdom
npm i -D vitest jsdom
```

> [!WARNING]
> **MSW v2 is a hard break from v1.** v1's `rest.get` / `res(ctx.json(...))` API is gone. v2 uses `http.get` and a standard-`Response`-based `HttpResponse.json(...)`. v2 also requires **Node 18+** and **TypeScript 4.7+**. Make sure you're reading v2 docs — most stale blog posts show v1 and will not compile.

### 🧩 Define handlers once, in one place

A *handler* describes how to respond to one endpoint. Keep them in a shared file so tests and (optionally) the browser worker import the same source of truth.

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// The shape our component expects back from the API.
export interface User {
  id: number;
  name: string;
}

// Default "happy path" data returned by the success handler below.
export const usersFixture: User[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
];

export const handlers = [
  // Respond to GET /api/users with a 200 and JSON body.
  http.get('/api/users', () => {
    return HttpResponse.json(usersFixture, { status: 200 });
  }),
];
```

### 🧩 The Node server + lifecycle

`setupServer` creates the interceptor. Its lifecycle hooks are the heart of a reliable suite — get these wrong and tests leak handlers into each other.

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// One server instance, seeded with the default handlers.
export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts  (referenced from vitest.config setupFiles)
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { server } from '../mocks/server';

// Start intercepting before any test runs. `onUnhandledRequest: 'error'`
// makes a request to an UNMOCKED endpoint fail loudly instead of hitting
// the real network — a great safety net.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any per-test overrides (server.use) back to the defaults after EACH
// test, so an error-case override in one test can't leak into the next.
afterEach(() => server.resetHandlers());

// Stop the interceptor once the whole file is done — clean teardown.
afterAll(() => server.close());
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // give tests a DOM (document, window)
    globals: true,                 // describe/it/expect without imports
    setupFiles: ['./src/test/setup.ts'], // runs the MSW lifecycle above
  },
});
```

> [!TIP]
> Memorize the lifecycle trio as **listen / reset / close** mapped to **beforeAll / afterEach / afterAll**. The middle one — `resetHandlers` in `afterEach` — is the one people forget, and forgetting it is exactly how a `server.use(...)` error override silently poisons the next test. Put it in `setup.ts` once and never think about it again.

---

## 🛠️ 5. The Component Under Test

A small, realistic component: it fetches users on mount and renders the loading / success / error states. Fully typed, no placeholders.

```tsx
// src/components/UserList.tsx
import { useEffect, useState } from 'react';
import type { User } from '../mocks/handlers';

// A discriminated union models the three states precisely — TypeScript then
// forces us to handle each branch, mirroring the state machine from section 1.
type Status =
  | { phase: 'loading' }
  | { phase: 'success'; users: User[] }
  | { phase: 'error'; message: string };

export function UserList() {
  const [status, setStatus] = useState<Status>({ phase: 'loading' });

  useEffect(() => {
    // AbortController lets us cancel the request if the component unmounts
    // mid-flight, avoiding a "set state on unmounted component" situation.
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/users', { signal: controller.signal });

        // fetch only rejects on network failure, NOT on 4xx/5xx — so we must
        // check res.ok ourselves and convert a bad status into an error state.
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const users = (await res.json()) as User[];
        setStatus({ phase: 'success', users });
      } catch (err) {
        // Ignore the abort that we triggered ourselves on unmount.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setStatus({ phase: 'error', message });
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  if (status.phase === 'loading') {
    // role="status" is an ARIA live region — the accessible, queryable way to
    // expose a spinner. Tests find it with getByRole('status').
    return <p role="status">Loading users…</p>;
  }

  if (status.phase === 'error') {
    // role="alert" announces errors to assistive tech and is easy to query.
    return <p role="alert">Something went wrong: {status.message}</p>;
  }

  if (status.users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <ul aria-label="users">
      {status.users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

> [!NOTE]
> Notice the component uses **accessible roles** (`status`, `alert`, the list's `aria-label`) rather than test-only `data-testid`s. RTL's guiding principle is to query the way a user (or screen reader) perceives the UI. This makes tests resilient to refactors *and* nudges you toward accessible markup — a two-for-one win.

---

## 🛠️ 6. The Full Test: Loading → Success → Error

This is the payoff. One file, three states, each driven by MSW.

```tsx
// src/components/UserList.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../mocks/server';
import { UserList } from './UserList';

describe('<UserList />', () => {
  it('shows a loading indicator on first render', () => {
    // Add a small delay so the loading state is observable before the
    // response resolves. Without it the success state can win the race.
    server.use(
      http.get('/api/users', async () => {
        await delay(50);
        return HttpResponse.json([{ id: 1, name: 'Ada Lovelace' }]);
      }),
    );

    render(<UserList />);

    // getBy*: the spinner is present synchronously on the very first render.
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading users…')).toBeInTheDocument();
  });

  it('renders the fetched users on success', async () => {
    // No server.use() here → the DEFAULT happy-path handler from handlers.ts
    // (Ada Lovelace + Alan Turing) is used.
    render(<UserList />);

    // findBy*: wait for the list items that appear AFTER the fetch resolves.
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();

    // The list itself is queryable by its accessible name.
    expect(screen.getByRole('list', { name: 'users' })).toBeInTheDocument();

    // queryBy* + .not: the spinner must be GONE once data has arrived.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error message when the API returns 500', async () => {
    // Override the default handler FOR THIS TEST ONLY. afterEach's
    // resetHandlers() (in setup.ts) restores the default afterward.
    server.use(
      http.get('/api/users', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<UserList />);

    // findByRole('alert') waits for the error branch to render.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Request failed with status 500');

    // We never reached success: no list, and the spinner is gone.
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an empty-state message when the API returns no users', async () => {
    // Override with a valid 200 but an EMPTY array to hit the empty branch.
    server.use(
      http.get('/api/users', () => HttpResponse.json([], { status: 200 })),
    );

    render(<UserList />);

    expect(await screen.findByText('No users found.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('builds the request against the correct endpoint', async () => {
    // MSW handlers receive the REAL Request — proof the contract is honored.
    let calledUrl = '';
    server.use(
      http.get('/api/users', ({ request }) => {
        calledUrl = new URL(request.url).pathname;
        return HttpResponse.json([{ id: 1, name: 'Ada Lovelace' }]);
      }),
    );

    render(<UserList />);
    await screen.findByText('Ada Lovelace');

    // This assertion is IMPOSSIBLE with a naive fetch stub — it verifies the
    // component actually placed the order at /api/users.
    expect(calledUrl).toBe('/api/users');
  });
});
```

### ⚡ Anatomy of the three key MSW moves

```tsx
// 1) DEFAULT handler (handlers.ts) → the success path used when no override.
http.get('/api/users', () => HttpResponse.json(usersFixture));

// 2) PER-TEST override for errors → server.use() takes precedence this test.
server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));

// 3) PER-TEST override for empty/edge data → same mechanism, different body.
server.use(http.get('/api/users', () => HttpResponse.json([])));
```

`server.use()` **prepends** a handler that wins over the defaults, but only until `server.resetHandlers()` runs in `afterEach`. That single line in `setup.ts` is what guarantees test isolation — each test starts from the clean default set.

> [!WARNING]
> A subtle race: if your mock resolves *instantly*, React may flush the success render before your `getByRole('status')` assertion runs, so the loading test fails intermittently. Add a tiny `await delay(...)` (from `msw`) in the loading-state handler — as shown above — to make the loading window deterministic. Don't add real `setTimeout`s to your component to "fix" this; fix it in the *mock*.

> [!TIP]
> When a user *action* triggers the fetch (e.g., clicking "Load"), drive it with `userEvent` and `await` the interaction: `const user = userEvent.setup(); await user.click(screen.getByRole('button', { name: /load/i }));`. `userEvent` already wraps interactions in `act`, so you won't see act warnings — then follow up with your `findBy*` assertion as usual.

---

## 🧠 Test Your Knowledge

<details>
  <summary><b>Reveal Answer</b></summary>

  **Q1. Your test does `expect(screen.findByText('Done')).toBeInTheDocument()` and it passes even though "Done" never renders. Why, and what's the fix?**

  `findByText` returns a **Promise**, and you never `await`ed it. A Promise object is always truthy, so `toBeInTheDocument()` is being called on the *promise* (not an element) and effectively short-circuits, or `jest-dom` matches loosely and passes for the wrong reason — meanwhile the real assertion never runs. The fix is `expect(await screen.findByText('Done')).toBeInTheDocument()`. Enable the `testing-library/await-async-queries` ESLint rule so this is caught automatically.
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

  **Q2. When should you use `getBy*`, `queryBy*`, and `findBy*` in an async test?**

  Use **`getBy*`** for content present on the **first synchronous render** (the loading spinner) — it throws immediately if missing. Use **`findBy*`** for content that **appears later** after a promise resolves (the success list, the error alert) — it returns a promise that retries until a timeout, so you `await` it. Use **`queryBy*`** to assert **absence** (`expect(screen.queryByRole('status')).not.toBeInTheDocument()`) because it's the only family that returns `null` instead of throwing.
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

  **Q3. Why is `server.resetHandlers()` in `afterEach` so important?**

  Because `server.use()` adds **per-test overrides** that take precedence over the defaults and otherwise persist for the rest of the file. If a test overrides `/api/users` to return a 500 and you never reset, the *next* test also gets a 500 even though it expected the happy path — a leaked handler causing a confusing, order-dependent failure. `resetHandlers()` restores the original default handler set after every test, guaranteeing isolation. The trio is `listen()`/`resetHandlers()`/`close()` in `beforeAll`/`afterEach`/`afterAll`.
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

  **Q4. Give two concrete things MSW lets you test that a `vi.spyOn(global, 'fetch')` stub makes hard or impossible.**

  (1) **Request correctness** — MSW handlers receive the real `Request`, so you can assert the component called the right **URL, method, query params, headers, and body**. A fetch stub returns a value regardless of how (or whether) the request was built, so it can't verify the order was placed correctly. (2) **Client independence** — MSW intercepts at the network layer, so the same mocks work whether you use `fetch`, `axios`, or `ky`; switching clients is a refactor your tests don't notice. A `fetch` stub is coupled to `fetch` specifically and breaks on that refactor. (Bonus: MSW handlers are reusable across tests *and* the dev browser via `setupWorker`.)
</details>

<details>
  <summary><b>Reveal Answer</b></summary>

  **Q5. Your "shows loading spinner" test is flaky — it passes locally but fails in CI. The mock returns instantly. What's happening and how do you fix it without changing the component?**

  The mock resolves so fast that React flushes the **success** render before your synchronous `getByRole('status')` assertion runs, so the spinner is already gone. It's a race between the resolved-promise microtask and your assertion. The fix is in the **mock**, not the component: add a small `await delay(50)` (imported from `msw`) inside the loading-state handler so there is a deterministic window where the loading state is observable. Never add real timers to production code just to make a test pass — that's fixing the wrong layer.
</details>

---

## 💻 Practice Exercises

### 🧩 Exercise 1 — Test a search box that fetches on submit

Build and test a `UserSearch` component: it has a text input and a "Search" button. On submit it fetches `/api/users?q=<query>` and renders matching names, or a "No matches" message. Write tests that (a) drive the interaction with `userEvent`, (b) assert the request carried the right `q` query param via an MSW handler, and (c) cover both a match and a no-match response.

**Starter:**

```tsx
// src/components/UserSearch.tsx
import { useState, type FormEvent } from 'react';
import type { User } from '../mocks/handlers';

export function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: fetch `/api/users?q=${encodeURIComponent(query)}`,
    // parse JSON into User[], and store it in `users` state.
    const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
    setUsers((await res.json()) as User[]);
  }

  return (
    <form onSubmit={handleSubmit} aria-label="user search">
      <label htmlFor="q">Search</label>
      <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button type="submit">Search</button>
      {users && users.length === 0 && <p>No matches.</p>}
      {users && users.length > 0 && (
        <ul aria-label="results">
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
```

```tsx
// src/components/UserSearch.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { UserSearch } from './UserSearch';

describe('<UserSearch />', () => {
  it('passes the typed query as the q param and renders matches', async () => {
    let receivedQuery: string | null = null;
    server.use(
      http.get('/api/users', ({ request }) => {
        // TODO: read the `q` search param from the request URL into receivedQuery.
        receivedQuery = new URL(request.url).searchParams.get('q');
        return HttpResponse.json([{ id: 1, name: 'Ada Lovelace' }]);
      }),
    );

    const user = userEvent.setup();
    render(<UserSearch />);

    await user.type(screen.getByLabelText('Search'), 'ada');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(receivedQuery).toBe('ada'); // verify the request contract
  });

  it('shows a no-match message when the API returns an empty array', async () => {
    // TODO: server.use() an override returning HttpResponse.json([]),
    // submit the form, and assert "No matches." appears via findByText.
  });
});
```

### 🧩 Exercise 2 — Add a "retry" path

Extend the original `UserList` so the error state renders a **"Retry"** button that re-runs the fetch. Then write a test that: first returns a 500 (assert the alert + retry button appear), then `server.use()`s a *new* success handler, clicks Retry, and asserts the list finally renders. This exercises handler swapping mid-test and verifies your component recovers from failure.

**Hints:**
- Lift the fetch logic into a `loadUsers()` callback you can call from both `useEffect` and the Retry `onClick`.
- After the first 500, call `server.use(http.get('/api/users', () => HttpResponse.json(usersFixture)))` *before* clicking Retry so the second request hits the success handler.
- Use `await screen.findByRole('button', { name: /retry/i })` to wait for the error UI, then `await user.click(...)`, then `await screen.findByText('Ada Lovelace')`.

> [!TIP]
> If a retry test feels racy, remember the loading-spinner lesson: give your overrides a tiny `delay()` when you need to observe an intermediate state, and lean on `findBy*`/`waitFor` rather than guessing at timings. Deterministic mocks beat `setTimeout` every time.
