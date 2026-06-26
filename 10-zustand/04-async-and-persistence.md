# Zustand: Async Actions & Persistence Middleware 🐻💾

In the previous Zustand lessons you saw how a store is just a function that calls `set` and `get` — and in the course project you fetched a list of meals, dropped them into a store, and filtered them with `zustand`. This lesson zooms into the two features that turn a toy store into a production store: **asynchronous actions** that live *inside* the store, and the **`persist` middleware** that mirrors selected state into the browser so it survives a refresh.

We will also layer in two more pieces of middleware tooling: **`devtools`** (so your Zustand mutations show up in the Redux DevTools timeline) and the rules for **composing multiple middlewares in the right order**. Everything here is fully typed for React 19 + TypeScript, copy-pasteable, and free of placeholders.

> [!NOTE]
> The recorded course covers fetching data into a Zustand store and filtering it (the meals search) plus a typed form-builder store. The deeper middleware topics in this lesson — `persist` configuration (`partialize` / `version` / `migrate`), `skipHydration` / `onRehydrateStorage`, the SSR hydration caveat, and `devtools` composition — go **beyond what the instructor records on screen**. They are taught here as current Zustand v5 best practices so this split lesson stands on its own.

---

## ⚡ 1. Concept & Overview

A Zustand store is plain state plus plain functions. Because the functions are ordinary JavaScript, two things follow naturally that take real ceremony in Redux:

1. **An action can be `async`.** You mark the function `async`, `await` your network call, and call `set` whenever a promise resolves. There is no thunk, no saga, no separate "effects" layer.
2. **Middleware wraps the store creator.** `persist`, `devtools`, `immer`, and friends are higher-order functions that take your store creator and return an enhanced one. You compose them by nesting.

### 🌍 Real-World Metaphor

Picture your store as a **chef's prep station** in a busy kitchen.

- **An async action is placing an order with a supplier.** The chef writes "salmon — *on order*" on the ticket rail (`set({ loading: true })`), keeps cooking other dishes, and updates the rail when the delivery van arrives with the fish (`set({ data })`) — or when the supplier calls to say they're out (`set({ error })`). The kitchen never freezes waiting at the door.
- **The `persist` middleware is the closing-shift checklist.** Before locking up, a line cook photographs the *mise en place* — the chopped onions, the stock, the sauces worth keeping (`partialize`) — and tapes the photo to the fridge (`localStorage`). It deliberately does **not** photograph the half-finished plate that's about to be thrown out (transient `loading`/`error` flags). Next morning the station is rebuilt from the photo (rehydration).
- **`devtools` is the kitchen's CCTV feed.** Every move the chef makes is timestamped and replayable, so when a dish comes out wrong you can scrub back through the footage instead of guessing.

### 📊 How the pieces relate

| Layer            | What it is                                    | Who calls it        | Persisted?         |
| ---------------- | --------------------------------------------- | ------------------- | ------------------ |
| State            | `data`, `loading`, `error`, `theme`, …        | read by components  | only via `partialize` |
| Sync action      | `setTheme`, `addItem` — calls `set` once      | components / events | n/a (functions skipped) |
| Async action     | `async fetchUser()` — `await` then `set`      | components / effects | n/a |
| `persist` mw     | mirrors state ↔ `localStorage`                | runtime, on `set`   | writes selected keys |
| `devtools` mw    | streams every `set` to Redux DevTools         | runtime, on `set`   | no |

### 🧩 Middleware as nested wrappers (ASCII)

```text
create(
  devtools(            ┐  outermost: sees the FINAL state after persist merges
    persist(           │  middle: serializes/rehydrates to localStorage
      immer(           │  innermost-ish: lets actions "mutate" a draft
        (set, get) => store  ◄── your actual store creator
      ),
    { name, ... }),    │
  { name: 'MyStore' }) ┘
)
```

Each wrapper receives the creator from the layer **inside** it and hands an enhanced creator to the layer **outside** it. Order matters — we cover the rules in section 6.

---

## 🛠️ 2. Asynchronous Actions Inside the Store

In Redux, async work forces you to install Thunk or Saga and dispatch `PENDING` / `FULFILLED` / `REJECTED` action types. In Zustand the action is simply `async`, and you describe the request lifecycle with three `set` calls: **start**, **success**, **failure**.

```typescript
// src/stores/userStore.ts
import { create } from 'zustand';

// 1. The shape of a single user coming back from the API.
interface User {
  id: number;
  name: string;
  email: string;
}

// 2. The full store contract: state + actions, all typed.
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (id: number) => Promise<void>; // async actions return a Promise
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,

  // The async action lives RIGHT HERE in the store — no thunk needed.
  fetchUser: async (id) => {
    // START: flip the loading flag and clear any stale error.
    set({ loading: true, error: null });

    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data: User = await res.json();

      // SUCCESS: store the data and turn loading off.
      set({ user: data, loading: false });
    } catch (err) {
      // FAILURE: capture a readable message; never leave loading stuck on.
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  // A plain synchronous action for completeness.
  reset: () => set({ user: null, loading: false, error: null }),
}));
```

Consuming it in a React 19 component is identical to any other store — selectors keep re-renders narrow:

```tsx
// src/components/UserCard.tsx
import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';

export function UserCard({ id }: { id: number }) {
  // Select each slice separately so this component only re-renders
  // when the slice it reads actually changes.
  const user = useUserStore((s) => s.user);
  const loading = useUserStore((s) => s.loading);
  const error = useUserStore((s) => s.error);
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    // Calling the async action returns a Promise; we can ignore it
    // because the store updates itself when it resolves.
    void fetchUser(id);
  }, [id, fetchUser]);

  if (loading) return <p>Loading user…</p>;
  if (error) return <p role="alert">Error: {error}</p>;
  if (!user) return null;

  return (
    <article>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </article>
  );
}
```

> [!NOTE]
> The `loading / data / error` triad is the canonical shape for *every* data-fetching action. Because the async action returns a `Promise<void>`, a caller can still `await useUserStore.getState().fetchUser(1)` outside React (e.g. in a route loader or a test) and know when it has settled.

> [!TIP]
> Reach for `get()` inside an async action when you need the *latest* state mid-flight — for example to dedupe concurrent requests: `if (get().loading) return;` at the top of `fetchUser` prevents a double-click from firing two fetches.

---

## 💾 3. The `persist` Middleware

`persist` wraps your store creator and transparently syncs state to a `Storage` backend (defaulting to `localStorage`). It serializes on every `set` and rehydrates once on startup.

```typescript
// src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  fontSize: number;
  // Transient field we deliberately will NOT persist:
  isPanelOpen: boolean;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  togglePanel: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  // Note the extra () after create<...>() — required so TypeScript can
  // infer the middleware-wrapped store type correctly.
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      isPanelOpen: false,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    }),
    {
      // 1. Unique key under which the slice is saved in localStorage.
      name: 'app-settings',

      // 2. Which Storage to use. createJSONStorage handles JSON.stringify /
      //    JSON.parse for you. Swap localStorage for sessionStorage to make
      //    the data last only for the tab session.
      storage: createJSONStorage(() => localStorage),

      // 3. Whitelist exactly what gets written. isPanelOpen is transient UI
      //    state — we never want it resurrected as "open" on a fresh load.
      partialize: (state) => ({ theme: state.theme, fontSize: state.fontSize }),

      // 4. Schema version of the persisted payload (see migrate, section 4).
      version: 1,
    }
  )
);
```

> [!TIP]
> `partialize` is your most important `persist` option. Persisting an entire store — including `loading` and `error` — can resurrect a stuck spinner after a reload. Whitelist only durable data: theme, cart, draft form, auth token.

> [!NOTE]
> `persist` automatically ignores functions during serialization — actions can never be JSON-encoded, so they are simply skipped and re-attached from the creator on startup. You never need to exclude your actions in `partialize`.

### 🧩 Choosing a storage backend

| Backend                 | Survives refresh | Survives tab close | Survives browser restart | Typical use            |
| ----------------------- | ---------------- | ------------------ | ------------------------ | ---------------------- |
| `localStorage`          | ✅               | ✅                 | ✅                       | theme, cart, auth      |
| `sessionStorage`        | ✅               | ❌                 | ❌                       | wizard / checkout flow |
| in-memory (no persist)  | ❌               | ❌                 | ❌                       | transient UI state     |
| async (IndexedDB)       | ✅               | ✅                 | ✅                       | large/offline datasets |

For async backends like IndexedDB, `createJSONStorage` accepts any object that implements `getItem`/`setItem`/`removeItem` returning Promises — `persist` awaits them automatically.

---

## 🧩 4. Versioning & Migration

The shape of your persisted state will change over time. If you ship a new version that renames `fontSize` to `fontScale`, existing users still have the *old* payload in their `localStorage`. The `version` + `migrate` pair upgrades old payloads on load.

```typescript
// src/stores/settingsStore.ts (versioned variant)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStateV2 {
  theme: 'light' | 'dark';
  fontScale: number; // renamed from fontSize, and now a multiplier not px
  setTheme: (theme: 'light' | 'dark') => void;
  setFontScale: (scale: number) => void;
}

export const useSettingsStore = create<SettingsStateV2>()(
  persist(
    (set) => ({
      theme: 'light',
      fontScale: 1,
      setTheme: (theme) => set({ theme }),
      setFontScale: (fontScale) => set({ fontScale }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => localStorage),
      version: 2, // bumped from 1 → 2

      // Runs ONLY when the stored version is older than `version` above.
      // `persistedState` is typed `unknown` — narrow it yourself.
      migrate: (persistedState, fromVersion) => {
        const state = persistedState as Partial<SettingsStateV2> & {
          fontSize?: number; // the old v1 field
        };

        if (fromVersion < 2) {
          // Convert old pixel size (e.g. 16px) into the new scale multiplier.
          const px = state.fontSize ?? 16;
          return {
            theme: state.theme ?? 'light',
            fontScale: px / 16,
          } as SettingsStateV2;
        }

        // Already current — return as-is.
        return state as SettingsStateV2;
      },
    }
  )
);
```

> [!WARNING]
> If you change the persisted shape but **forget to bump `version` and write a `migrate`**, returning users load a stale payload that no longer matches your types. The store silently merges mismatched fields and your app reads `undefined` where it expected a number. Treat `version` like a database migration — bump it on every breaking shape change.

---

## 🌊 5. Hydration: `onRehydrateStorage`, `skipHydration`, and the SSR caveat

**Hydration** is the moment `persist` reads the stored payload and merges it into the live store. On a pure client-side SPA this happens synchronously during store creation, so it's usually invisible. In **server-rendered** apps (Next.js App Router, Remix) it becomes a real problem: the server has **no `localStorage`**, so it renders defaults, then the client rehydrates with the stored value — and the two HTML trees disagree.

> [!WARNING]
> This is the classic **SSR hydration mismatch**. The server renders `theme: 'light'` (the default) while the client immediately rehydrates to the stored `theme: 'dark'`. React detects that the markup it received does not match what it would render and throws a *"Hydration failed… server rendered HTML didn't match the client"* error, often flashing the wrong UI for a frame. The fix is to render a stable, default-only UI until hydration is confirmed complete.

### Pattern A — a `hasHydrated` flag via `onRehydrateStorage`

`onRehydrateStorage` runs *before* rehydration and returns a callback that runs *after* it finishes (with the rehydrated state, or an `error`). Flip a flag there and gate your UI on it.

```tsx
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  hasHydrated: boolean;
  toggleTheme: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      hasHydrated: false,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => localStorage),
      // Do NOT persist hasHydrated — it's a runtime-only flag.
      partialize: (state) => ({ theme: state.theme }),

      // The returned function runs once rehydration completes.
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Theme rehydration failed:', error);
        } else {
          state?.setHasHydrated(true);
        }
      },
    }
  )
);
```

```tsx
// src/components/ThemeToggle.tsx
import { useThemeStore } from '../stores/themeStore';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const hasHydrated = useThemeStore((s) => s.hasHydrated);

  // Until hydration is confirmed, render the SAME default markup the server
  // produced. This guarantees server HTML === first client HTML.
  if (!hasHydrated) {
    return (
      <button type="button" disabled aria-busy="true">
        Theme: light
      </button>
    );
  }

  return (
    <button type="button" onClick={toggleTheme}>
      Theme: {theme} (click to switch)
    </button>
  );
}
```

### Pattern B — `skipHydration` + manual `rehydrate()`

Sometimes you want to control *when* hydration runs — for instance, to run it explicitly inside a `useEffect` so it never executes on the server at all. Set `skipHydration: true` and call `persist.rehydrate()` yourself.

```tsx
// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartState {
  items: string[];
  addItem: (name: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (name) => set((state) => ({ items: [...state.items, name] })),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
      // Hydration will NOT run automatically — we trigger it ourselves.
      skipHydration: true,
    }
  )
);
```

```tsx
// src/components/HydrationGate.tsx
import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cartStore';

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // rehydrate() returns a Promise that resolves once storage is read.
    // Running it in an effect guarantees it only fires on the client.
    void useCartStore.persist.rehydrate()?.then(() => setHydrated(true));
  }, []);

  // Render nothing (or a skeleton) until the client has rehydrated.
  if (!hydrated) return null;
  return <>{children}</>;
}
```

> [!TIP]
> The `persist` API also exposes `useStore.persist.hasHydrated()`, `onHydrate`, `onFinishHydration`, and `clearStorage()`. In a Next.js project, wrapping persisted UI in a gate like `HydrationGate` (or using a `hasHydrated` flag) is the standard cure for the mismatch warning.

---

## 🛠️ 6. `devtools` Middleware & Composition Order

The `devtools` middleware streams every `set` to the **Redux DevTools** browser extension, giving you a replayable, time-travel timeline of state changes — invaluable when debugging an action that fires at the wrong time.

```typescript
// src/stores/todoStore.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggle: (id: number) => void;
}

export const useTodoStore = create<TodoState>()(
  // devtools is OUTERMOST so it observes the final state after persist merges.
  devtools(
    persist(
      (set) => ({
        todos: [],
        addTodo: (text) =>
          set(
            (state) => ({
              todos: [...state.todos, { id: Date.now(), text, done: false }],
            }),
            undefined,
            // 3rd arg: an action NAME that appears in the DevTools timeline.
            'todos/add'
          ),
        toggle: (id) =>
          set(
            (state) => ({
              todos: state.todos.map((t) =>
                t.id === id ? { ...t, done: !t.done } : t
              ),
            }),
            undefined,
            'todos/toggle'
          ),
      }),
      { name: 'todos', storage: createJSONStorage(() => localStorage) }
    ),
    // devtools options: name shown in the extension's store dropdown.
    { name: 'TodoStore', enabled: import.meta.env.DEV }
  )
);
```

Note the **third argument to `set`** (`'todos/add'`): with `devtools` active, that string labels the entry in the timeline instead of an anonymous `anonymous` action.

### 📊 Composition order rules

| Combination               | Recommended order (outer → inner) | Why                                                                 |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `devtools` + `persist`    | `devtools(persist(...))`          | DevTools should log the *final* state after persist merges/rehydrates. |
| `persist` + `immer`       | `persist(immer(...))`             | `immer` only changes how actions write; persist serializes the result. |
| all three                 | `devtools(persist(immer(...)))`   | Outer observes, middle stores, inner enables draft mutation.        |

> [!WARNING]
> Composition order is **not** arbitrary. Put `devtools` *innermost* and it will only see writes before `persist` runs, so rehydration won't appear in your timeline. The reliable rule: **`devtools` outermost, `persist` in the middle, `immer` innermost.** Also gate `devtools` with `enabled: import.meta.env.DEV` so it never ships to production.

> [!NOTE]
> When you stack middleware, the `create<T>()(...)` curried form (empty parens after the type argument) is **required** for TypeScript to infer the wrapped store type. Writing `create<T>(devtools(...))` without the extra `()` produces confusing type errors — this is a documented Zustand v5 convention.

---

## 🧠 Test Your Knowledge

### 1. Why does Zustand need no thunk/saga layer for async work?
<details>
  <summary><b>Reveal Answer</b></summary>

  Because a Zustand action is an ordinary JavaScript function, not a serialized action object processed by a reducer. You can mark it `async`, `await` a network call directly inside it, and call the synchronous `set()` whenever a promise resolves. The store updates itself in place — there is no dispatch/reducer indirection that would otherwise force a middleware to intercept async flows. The standard pattern is three `set` calls: `set({ loading: true })` on start, `set({ data, loading: false })` on success, and `set({ error, loading: false })` on failure.
</details>

### 2. What does `partialize` do, and why is it considered the most important `persist` option?
<details>
  <summary><b>Reveal Answer</b></summary>

  `partialize` is a selector `(state) => subset` that whitelists exactly which keys are written to storage. It matters because persisting transient fields like `loading` or `error` can resurrect a stuck spinner or stale error after a reload. By returning only durable data (`theme`, `cart`, `authToken`), you keep storage lean and avoid bringing back states that should always start fresh. Functions are skipped automatically, so you only list data fields.
</details>

### 3. Explain the SSR hydration mismatch and one way to fix it.
<details>
  <summary><b>Reveal Answer</b></summary>

  On the server there is no `localStorage`, so the store renders its **default** values into the HTML. On the client, `persist` immediately rehydrates to the **stored** values, producing markup that differs from what the server sent. React detects the divergence and throws a "Hydration failed" error, often flashing the wrong UI for a frame. Fixes: (a) keep a `hasHydrated` flag flipped to `true` inside `onRehydrateStorage`, and render default-only markup until it's `true`; or (b) set `skipHydration: true` and call `useStore.persist.rehydrate()` inside a `useEffect` so hydration runs only on the client, gating children until it resolves.
</details>

### 4. In `devtools(persist(immer(...)))`, why is the order significant?
<details>
  <summary><b>Reveal Answer</b></summary>

  Each middleware wraps the creator inside it. `devtools` is outermost so it observes the **final** state — including writes that `persist` performs during rehydration — and logs them to the timeline. `persist` sits in the middle so it serializes the result of whatever the inner layers produce. `immer` is innermost because it only changes *how* an action writes (draft mutation), which should happen before persist serializes. If `devtools` were innermost it would miss rehydration and post-persist changes; if `persist` wrapped `devtools` it would try to serialize DevTools internals.
</details>

### 5. What is the purpose of the third argument to `set` when `devtools` is active, and why use `create<T>()(...)` with empty parens?
<details>
  <summary><b>Reveal Answer</b></summary>

  The third `set` argument is an **action name** string (e.g. `'todos/add'`) that labels the entry in the Redux DevTools timeline; without it, entries show up as anonymous, making the timeline hard to read. The curried `create<T>()(...)` form — note the extra `()` after the type argument — is required when composing middleware so TypeScript can correctly infer the middleware-mutated store type. Writing `create<T>(persist(...))` (no extra parens) breaks inference and yields cryptic type errors. It is a documented Zustand v5 convention.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1 — Persisted, async meals store (build on the course project)

Extend the meals search from the course into a real store with async fetching and persistence.

**Tasks**
1. Create `src/stores/mealsStore.ts` wrapped in `persist`.
2. State: `meals: Meal[]`, `query: string`, `loading: boolean`, `error: string | null`.
3. Async action `fetchMeals()` that hits TheMealDB and runs the start/success/failure triad.
4. Sync action `setQuery(q)`.
5. Use `partialize` so **only** `meals` and `query` persist — never `loading`/`error`.
6. Reload the browser and confirm the cached meals appear instantly while a background `fetchMeals()` refreshes them, and that no spinner is stuck on.

**Starter**

```typescript
// src/stores/mealsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealsState {
  meals: Meal[];
  query: string;
  loading: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  fetchMeals: () => Promise<void>;
}

export const useMealsStore = create<MealsState>()(
  persist(
    (set) => ({
      meals: [],
      query: '',
      loading: false,
      error: null,

      setQuery: (q) => set({ query: q }),

      fetchMeals: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(
            'https://www.themealdb.com/api/json/v1/1/search.php?s='
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: { meals: Meal[] | null } = await res.json();
          set({ meals: json.meals ?? [], loading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          set({ error: message, loading: false });
        }
      },
    }),
    {
      name: 'meals-cache',
      storage: createJSONStorage(() => localStorage),
      // TODO: whitelist ONLY meals + query here.
      partialize: (state) => ({ meals: state.meals, query: state.query }),
    }
  )
);
```

---

### 🛠️ Exercise 2 — Versioned, hydration-safe auth store

Build an auth store that survives refresh, migrates an old payload shape, and never flashes a logged-out state on first render.

**Tasks**
1. Create `src/stores/authStore.ts` wrapped in `persist` with `version: 2`.
2. State: `token: string | null`, `user: { id: number; name: string } | null`, `hasHydrated: boolean`.
3. Actions: `login(token, user)`, `logout()`, `setHasHydrated(v)`.
4. Write a `migrate` that upgrades a v1 payload (which stored a flat `userName: string`) into the v2 `user` object.
5. Use `onRehydrateStorage` to flip `hasHydrated`.
6. In a `Navbar`, render a neutral skeleton until `hasHydrated` is `true`, then show either the user's name or a "Sign in" button.

**Starter**

```tsx
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({ token: state.token, user: state.user }),

      migrate: (persisted, fromVersion) => {
        const state = persisted as Partial<AuthState> & { userName?: string };
        if (fromVersion < 2) {
          // v1 stored a flat userName string; reshape it into a User object.
          return {
            token: state.token ?? null,
            user: state.userName
              ? { id: 0, name: state.userName }
              : null,
          } as AuthState;
        }
        return state as AuthState;
      },

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

```tsx
// src/components/Navbar.tsx
import { useAuthStore } from '../stores/authStore';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Skeleton until hydration completes — prevents a logged-out flash.
  if (!hasHydrated) return <nav aria-busy="true">Loading…</nav>;

  return (
    <nav>
      {user ? (
        <>
          <span>Hi, {user.name}</span>
          <button type="button" onClick={logout}>
            Sign out
          </button>
        </>
      ) : (
        <button type="button">Sign in</button>
      )}
    </nav>
  );
}
```

Refresh the page several times and confirm there is **no** hydration-mismatch warning in the console, the auth state survives reloads, and an old v1 payload is silently upgraded to the v2 shape.
