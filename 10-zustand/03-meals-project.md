# Project: Meals Browser with Zustand (async + persist) 🍽️

In the previous two lessons you learned how to **create a Zustand store** and how to write **async actions** plus wire up the **`persist` middleware**. Now you will put all of it together in a complete, production-grade mini-project: a **Meals Browser**. We fetch recipes from the free [TheMealDB](https://www.themealdb.com) API, render them in a responsive card grid, let the user **search/filter** as they type, and let them **favorite** meals — with favorites surviving a page refresh.

The instructor in the course builds the foundation of this project: a store that holds `meals` and a `searchQuery`, fetches data, and filters the list client-side. We are going to keep that exact spine and then level it up to what you would actually ship: a fully typed store, a real **async `fetchMeals()` action that lives inside the store** (not in a `useEffect`), explicit **`loading`/`error`** state, a **derived selector** for the filtered list, and **favorites persisted to `localStorage` using `partialize`** so only the favorites — and nothing transient — get saved.

---

## ⚡ 1. Concept & Overview

A "browse + search + favorite" screen is one of the most common UI patterns on the web — it is the skeleton behind Netflix rows, Spotify libraries, e-commerce catalogs, and food-delivery apps. Underneath, it is always the same four-part state machine:

1. **Server data** you fetch once (`meals`).
2. **A view filter** the user controls (`query`).
3. **Request status** so the UI can show spinners and errors (`loading`, `error`).
4. **User-owned preferences** that must outlive the session (`favorites`).

The interesting design decision is that these four pieces have **different lifetimes**. Server data is disposable — you can re-fetch it anytime. Request status is purely transient. But favorites belong to the *user*, so they must be persisted. Zustand lets us keep all four in one store while persisting only the part that matters, using `partialize`.

> [!NOTE]
> **What is grounded vs. net-new.** The course transcript builds the core of this project: a Zustand store with `meals` + `searchQuery`, a fetch from TheMealDB, and a client-side `filter`. Everything in this lesson up to "filter the list" mirrors that. The parts that are **net-new and beyond the recording** — moving the async fetch *into the store* as a typed action, adding explicit `loading`/`error` state, and **persisting only `favorites` with `partialize`** — are clearly modern best practices and are taught as such here.

### 🌍 Real-World Metaphor

Think of the store as a **restaurant's front-of-house system**:

- The **menu board** (`meals`) is printed fresh each service from the kitchen's master list (the API). If it gets smudged, you just reprint it — it's disposable.
- The **"now searching" note** a host scribbles while a guest describes what they want (`query`) is erased the moment they're seated. Transient.
- The **"kitchen is plating / kitchen is on fire" status light** (`loading` / `error`) tells the floor staff what's happening *right now*. It means nothing tomorrow.
- The **regulars' favorites book** (`favorites`) is the one thing locked in the safe overnight. When the restaurant reopens, that book comes back out exactly as it was. That — and only that — is what `persist` + `partialize` saves.

### 📊 State Slices and Their Lifetimes

| Slice       | Type          | Source        | Lifetime               | Persisted? |
| ----------- | ------------- | ------------- | ---------------------- | ---------- |
| `meals`     | `Meal[]`      | API           | Until re-fetch         | ❌ No       |
| `query`     | `string`      | User input    | Until cleared          | ❌ No       |
| `loading`   | `boolean`     | Derived/async | One request            | ❌ No       |
| `error`     | `string \| null` | Derived/async | One request         | ❌ No       |
| `favorites` | `string[]`    | User action   | **Forever** (per user) | ✅ Yes      |

> [!TIP]
> A useful rule of thumb: **persist intent, not data**. `favorites` is *intent* (the user chose these). `meals` is just a cached copy of something the server already owns — re-fetching is cheap and always gives fresher data, so persisting it only risks showing stale recipes.

---

## 🛠️ 2. Project Setup

Scaffold a Vite + React + TypeScript app and install Zustand. (We use Tailwind for the grid styling, exactly as the course does, but every concept works with plain CSS too.)

```bash
# Scaffold a React + TypeScript app with Vite
npm create vite@latest meals-browser -- --template react-ts
cd meals-browser

# Install dependencies, then Zustand
npm install
npm install zustand

# Tailwind (optional but used by the course for the grid)
npm install -D tailwindcss @tailwindcss/vite
```

Wire Tailwind into Vite and your stylesheet:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css — Tailwind v4 single-line import */
@import "tailwindcss";
```

The folder layout we are building toward:

```
meals-browser/
├── src/
│   ├── store/
│   │   └── useMealStore.ts     # the Zustand store (state + async + persist)
│   ├── types/
│   │   └── meal.ts             # shared Meal types + API response type
│   ├── components/
│   │   ├── SearchBar.tsx       # controlled search input
│   │   ├── MealCard.tsx        # one card + favorite toggle
│   │   └── MealGrid.tsx        # responsive grid + loading/error/empty states
│   ├── App.tsx
│   └── main.tsx
└── index.html
```

---

## 🧩 3. Typing the Domain

TheMealDB returns a lot of fields per meal, but we only need a handful. Define a **narrow `Meal` type** for what the app uses, plus a type for the **raw API response** so the fetch is type-safe end to end.

```typescript
// src/types/meal.ts

// The shape the API returns. TheMealDB uses `idMeal`, `strMeal`,
// `strMealThumb` (the "str"/"id" prefixes are their convention).
// `meals` is `null` when the search has no results — important to handle.
export interface ApiMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
}

export interface MealApiResponse {
  meals: ApiMeal[] | null;
}

// The trimmed shape our UI actually renders. Mapping the API into
// our own type means a future API change touches ONE function, not
// every component.
export interface Meal {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  area: string;
}

// Pure mapper: raw API meal -> our domain Meal.
export function toMeal(api: ApiMeal): Meal {
  return {
    id: api.idMeal,
    name: api.strMeal,
    thumbnail: api.strMealThumb,
    category: api.strCategory,
    area: api.strArea,
  };
}
```

> [!WARNING]
> TheMealDB returns `{ "meals": null }` — not an empty array — when a search yields nothing. If you blindly call `.map()` on `data.meals`, you crash with *"Cannot read properties of null (reading 'map')"*. (The course hit the sibling version of this bug — reading `data.meal` instead of `data.meals`.) Always coalesce: `data.meals ?? []`.

---

## ⚡ 4. The Store: State + Async Action + Persist

This is the heart of the lesson. We define one store that holds all four slices, exposes the actions, runs the async fetch **inside the store**, and persists **only `favorites`** via `partialize`.

```typescript
// src/store/useMealStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Meal, type MealApiResponse, toMeal } from "../types/meal";

// TheMealDB search endpoint. Empty `s=` returns a default batch of meals.
const SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

// The full store contract: state values first, then actions.
interface MealState {
  // --- state ---
  meals: Meal[];
  query: string;
  loading: boolean;
  error: string | null;
  favorites: string[]; // array of meal ids — this is the ONLY persisted slice

  // --- actions ---
  fetchMeals: () => Promise<void>;
  setQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useMealStore = create<MealState>()(
  // `persist` wraps the store factory. The 2nd arg configures storage.
  persist(
    (set, get) => ({
      // --- initial state ---
      meals: [],
      query: "",
      loading: false,
      error: null,
      favorites: [],

      // --- async action: lives in the store, not in a useEffect ---
      // Marking it `async` is all Zustand needs — no thunk/saga layer.
      fetchMeals: async () => {
        // Flip the status light on and clear any stale error.
        set({ loading: true, error: null });
        try {
          const res = await fetch(SEARCH_URL);
          if (!res.ok) {
            // Non-2xx responses don't throw on their own — check manually.
            throw new Error(`Request failed with status ${res.status}`);
          }
          const data: MealApiResponse = await res.json();
          // `data.meals` is null when there are no results — coalesce it.
          const meals = (data.meals ?? []).map(toMeal);
          set({ meals, loading: false });
        } catch (err) {
          // Narrow `unknown` to a readable message for the UI.
          const message =
            err instanceof Error ? err.message : "Failed to fetch meals";
          console.error("Error fetching meals:", message);
          set({ error: message, loading: false });
        }
      },

      // --- sync action: update the search query ---
      setQuery: (query) => set({ query }),

      // --- sync action: add/remove an id from favorites (persisted) ---
      toggleFavorite: (id) => {
        const { favorites } = get();
        const next = favorites.includes(id)
          ? favorites.filter((favId) => favId !== id) // remove
          : [...favorites, id]; // add
        set({ favorites: next });
      },

      // --- read helper: is this meal favorited? ---
      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      // Key under which the persisted slice is saved in localStorage.
      name: "meals-storage",
      storage: createJSONStorage(() => localStorage),
      // CRITICAL: persist ONLY favorites. Transient slices (meals, query,
      // loading, error) must never be saved — they'd resurrect stale data
      // and a frozen spinner on the next page load.
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
```

> [!NOTE]
> Notice the **double call signature** `create<MealState>()( ... )`. When you wrap a store in middleware like `persist`, Zustand's TypeScript types require this curried form — `create<T>()(...)` rather than `create<T>(...)`. Forgetting the empty `()` produces a confusing type error, so it is the single most common Zustand+TS gotcha.

### How `partialize` changes what gets stored

```
                Full store state
        ┌───────────────────────────────┐
        │ meals      query     loading   │
        │ error      favorites           │
        └───────────────┬───────────────┘
                        │  partialize: (s) => ({ favorites: s.favorites })
                        ▼
            localStorage["meals-storage"]
        ┌───────────────────────────────┐
        │ { "state": { "favorites":      │
        │     ["52772","52959"] },       │
        │   "version": 0 }               │   ← only favorites survive a refresh
        └───────────────────────────────┘
```

> [!TIP]
> Because `isFavorite` reads from `get()`, it is **not** reactive — calling `store.isFavorite(id)` once won't re-render when favorites change. Use it inside event handlers or computed values. For UI that must *re-render* on favorite changes, subscribe to the slice directly with a selector (shown next).

---

## 🧩 5. A Derived Selector for the Filtered List

The user's search should filter the already-fetched `meals` **client-side** — no extra network request per keystroke. Instead of recomputing the filter inside every component, expose it as a **selector hook** so the logic lives in one place and any component can reuse it.

```typescript
// src/store/useMealStore.ts (append below the store)

// A derived selector hook. It does NOT add state — it computes a value
// from existing state on each render. Components that call this re-render
// only when `meals` or `query` actually change.
export const useFilteredMeals = (): Meal[] =>
  useMealStore((state) => {
    const q = state.query.trim().toLowerCase();
    if (q === "") return state.meals; // empty query => show everything
    return state.meals.filter((meal) =>
      meal.name.toLowerCase().includes(q)
    );
  });

// Convenience selectors keep components terse and re-renders surgical.
export const useMealsLoading = () => useMealStore((s) => s.loading);
export const useMealsError = () => useMealStore((s) => s.error);
```

> [!WARNING]
> The filter selector returns a **new array** whenever `query` is non-empty (`.filter()` always allocates). That is fine here because the consuming component re-renders on `meals`/`query` changes anyway. But never put an expensive O(n²) computation in a selector without memoizing — selectors run on **every** store update. For heavy derivations, compute inside the component with `useMemo`, or store the derived value.

### 📊 `useEffect`-fetch vs. store-action fetch

| Aspect              | Fetch in component `useEffect` (course's first pass) | Async action in the store (this lesson) |
| ------------------- | ---------------------------------------------------- | --------------------------------------- |
| Where logic lives   | Inside each component                                | One place, the store                    |
| Reusable elsewhere  | ❌ Copy/paste                                         | ✅ Call `fetchMeals()` anywhere          |
| Testable in isolation | ❌ Needs a rendered component                       | ✅ Call the action directly              |
| `loading`/`error`   | Local `useState`, duplicated                         | Centralized in the store                |
| Re-fetch on demand  | Awkward                                              | Trivial — call the action again         |

---

## 🛠️ 6. The Components

### ⚡ SearchBar — controlled input bound to the store

```tsx
// src/components/SearchBar.tsx
import { useMealStore } from "../store/useMealStore";

export function SearchBar() {
  // Subscribe ONLY to `query` and `setQuery` so this input doesn't
  // re-render when meals or favorites change.
  const query = useMealStore((s) => s.query);
  const setQuery = useMealStore((s) => s.setQuery);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search for a meal…"
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base
                 outline-none focus:border-orange-500 focus:ring-2
                 focus:ring-orange-200"
      aria-label="Search meals by name"
    />
  );
}
```

### ⚡ MealCard — one card with a favorite toggle

```tsx
// src/components/MealCard.tsx
import { useMealStore } from "../store/useMealStore";
import type { Meal } from "../types/meal";

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  // Subscribe to a boolean derived from THIS meal's favorite status.
  // The component re-renders only when this specific card's status flips.
  const favorited = useMealStore((s) => s.favorites.includes(meal.id));

  return (
    <article className="group relative overflow-hidden rounded-xl bg-white shadow-md
                        transition hover:shadow-xl">
      <img
        src={meal.thumbnail}
        alt={meal.name}
        loading="lazy"
        className="h-48 w-full object-cover"
      />

      {/* Favorite toggle, top-right corner */}
      <button
        type="button"
        onClick={() => toggleFavorite(meal.id)}
        aria-pressed={favorited}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center
                   rounded-full bg-white/90 text-xl shadow backdrop-blur
                   transition hover:scale-110"
      >
        {/* Filled vs. outline heart communicates state at a glance */}
        {favorited ? "❤️" : "🤍"}
      </button>

      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900">{meal.name}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {meal.category} · {meal.area}
        </p>
      </div>
    </article>
  );
}
```

### ⚡ MealGrid — responsive grid + loading / error / empty states

```tsx
// src/components/MealGrid.tsx
import {
  useFilteredMeals,
  useMealsLoading,
  useMealsError,
  useMealStore,
} from "../store/useMealStore";
import { MealCard } from "./MealCard";

export function MealGrid() {
  const meals = useFilteredMeals();
  const loading = useMealsLoading();
  const error = useMealsError();
  const fetchMeals = useMealStore((s) => s.fetchMeals);

  // 1. Loading state — first paint while the request is in flight.
  if (loading) {
    return (
      <p className="py-12 text-center text-gray-500" role="status">
        Loading delicious meals…
      </p>
    );
  }

  // 2. Error state — show the message and a retry that re-runs the action.
  if (error) {
    return (
      <div className="py-12 text-center" role="alert">
        <p className="text-red-600">Something went wrong: {error}</p>
        <button
          type="button"
          onClick={() => fetchMeals()}
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white
                     hover:bg-orange-600"
        >
          Try again
        </button>
      </div>
    );
  }

  // 3. Empty state — fetch succeeded but the filter matched nothing.
  if (meals.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">
        No meals found. Try a different search.
      </p>
    );
  }

  // 4. Success — responsive grid: 1 col on mobile, up to 4 on large screens.
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
}
```

### ⚡ App — kick off the fetch once on mount

```tsx
// src/App.tsx
import { useEffect } from "react";
import { useMealStore } from "./store/useMealStore";
import { SearchBar } from "./components/SearchBar";
import { MealGrid } from "./components/MealGrid";

export default function App() {
  // The component's only job re: data is to TRIGGER the action once.
  // All the logic lives in the store; this just calls it on mount.
  const fetchMeals = useMealStore((s) => s.fetchMeals);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]); // fetchMeals is a stable store reference -> runs once

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Seafood &amp; Recipes 🍤</h1>
        <p className="mt-2 text-gray-600">
          Search, browse, and favorite meals. Favorites persist across refreshes.
        </p>
      </header>

      <div className="mb-8">
        <SearchBar />
      </div>

      <MealGrid />
    </main>
  );
}
```

> [!TIP]
> We trigger `fetchMeals()` from `useEffect` in `App` rather than calling it at module scope. Triggering on mount keeps the fetch tied to the React lifecycle (it won't run during SSR or in tests that don't render `App`), while the *logic* still lives in the store. This is the clean division: **components decide *when*, the store decides *how*.**

---

## 🧩 7. Verifying Persistence

Run the app, favorite a couple of meals, then open DevTools → Application → Local Storage. You will see exactly one key:

```json
{
  "state": { "favorites": ["52772", "52959"] },
  "version": 0
}
```

Refresh the page. The meals re-fetch fresh from the API (good — always current), but your favorited hearts stay filled, because `favorites` rehydrated from `localStorage`. Notice that `meals`, `query`, `loading`, and `error` are **absent** from storage — that is `partialize` doing its job.

> [!WARNING]
> If you persist the whole store by removing `partialize`, refreshing can restore `loading: true` from a request that was interrupted mid-flight — leaving your UI stuck on the loading spinner forever. This is precisely why transient flags must be excluded from persistence.

---

## 🧠 Test Your Knowledge

**1. Why does `partialize: (state) => ({ favorites: state.favorites })` matter in this project? What breaks if you remove it?**

<details>
  <summary><b>Reveal Answer</b></summary>

`partialize` tells the `persist` middleware **which slices to save** to `localStorage`. Here we whitelist only `favorites`. If you remove it, `persist` saves the *entire* store — including transient slices like `loading` and `error`. The concrete failure modes are: (a) a `loading: true` value can get persisted if a refresh happens mid-request, and on the next load the UI rehydrates into a permanent spinner with no request running; (b) stale `meals` get restored, hiding the fresh server data; (c) `localStorage` bloats with disposable data. The rule is "persist intent (favorites), not transient/derived data."
</details>

**2. The store uses `create<MealState>()(persist(...))` with an empty `()`. Why is that empty call there?**

<details>
  <summary><b>Reveal Answer</b></summary>

It is the **curried form** Zustand requires for correct TypeScript inference when a store is wrapped in middleware. `create<MealState>()` returns a function that you then call with the store initializer (the `persist(...)` wrapper). Writing `create<MealState>(persist(...))` (no empty parens) trips TypeScript because the generic and the middleware-augmented `set`/`get` signatures can't be reconciled in a single call. The empty `()` is the most common Zustand+TS gotcha — without it you get a cryptic type error even though the runtime code would work.
</details>

**3. The course's first version fetched data inside a component `useEffect`. What do we gain by moving `fetchMeals` into the store as an async action?**

<details>
  <summary><b>Reveal Answer</b></summary>

Moving the fetch into the store centralizes the logic: `loading` and `error` live in one place instead of being duplicated as local `useState` in every component; the action becomes **reusable** (any component can call `fetchMeals()`, e.g. a "retry" button) and **testable in isolation** (you can call the action directly without rendering a component); and re-fetching becomes trivial. The component is left with a single responsibility — deciding *when* to fetch (on mount, via `useEffect`) — while the store owns *how*. Zustand needs no thunk/saga; marking the action `async` is enough because actions are plain functions.
</details>

**4. `useFilteredMeals` recomputes a filtered array on every render where `meals` or `query` changes. When would this become a performance problem, and how would you fix it?**

<details>
  <summary><b>Reveal Answer</b></summary>

The selector runs on **every store update** and `.filter()` allocates a new array each time the query is non-empty. With a few hundred meals and a simple `.includes()` check this is negligible. It becomes a problem when the list is large *and* the per-item work is expensive (e.g. fuzzy matching, normalization, or sorting that is O(n log n) or worse), because that cost is paid on every keystroke and every unrelated store change. Fixes: debounce the `query` updates so the filter runs less often; memoize the heavy computation (compute in the component with `useMemo` keyed on `meals` + `query`); or precompute a normalized search index when `meals` is set, so filtering is cheap.
</details>

**5. After refreshing the page, the favorite hearts stay filled but the meal cards re-appear from a fresh API call. Explain the two different mechanisms responsible for each behavior.**

<details>
  <summary><b>Reveal Answer</b></summary>

Two separate mechanisms are at work. **Favorites stay filled** because the `persist` middleware wrote `{ favorites: [...] }` to `localStorage` (limited to that slice by `partialize`) and **rehydrates** it into the store automatically when the store is created on the next page load. **Meals re-appear** because they are *not* persisted — on mount, `App`'s `useEffect` calls `fetchMeals()`, which makes a fresh network request and repopulates `meals`. So persisted state is restored from storage, while non-persisted state is rebuilt by re-running the async action. This is the intended design: user intent is durable, server data is always fresh.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1 — "Favorites only" filter toggle

Add a toggle (checkbox or button) that, when active, shows **only favorited meals**. It must compose with the existing text search: if "favorites only" is on *and* the user types "soup", the grid shows only favorited meals whose name includes "soup".

**Tasks**

1. Add `showFavoritesOnly: boolean` to the store with a `toggleFavoritesOnly` action.
2. Decide whether to persist `showFavoritesOnly` — justify your choice in a comment.
3. Extend `useFilteredMeals` to also apply the favorites filter.

**Starter**

```typescript
// In MealState, add:
//   showFavoritesOnly: boolean;
//   toggleFavoritesOnly: () => void;

// In the store body, add:
showFavoritesOnly: false,
toggleFavoritesOnly: () =>
  set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),

// Update the selector:
export const useFilteredMeals = (): Meal[] =>
  useMealStore((state) => {
    const q = state.query.trim().toLowerCase();

    // TODO 1: start from all meals
    let result = state.meals;

    // TODO 2: if showFavoritesOnly, keep only meals whose id is in favorites
    // result = ...

    // TODO 3: if there's a query, also filter by name (lowercased includes)
    // if (q !== "") result = ...

    return result;
  });
```

<details>
  <summary><b>Reveal one correct solution</b></summary>

```typescript
export const useFilteredMeals = (): Meal[] =>
  useMealStore((state) => {
    const q = state.query.trim().toLowerCase();
    let result = state.meals;

    if (state.showFavoritesOnly) {
      result = result.filter((meal) => state.favorites.includes(meal.id));
    }
    if (q !== "") {
      result = result.filter((meal) => meal.name.toLowerCase().includes(q));
    }
    return result;
  });
```

For persistence: `showFavoritesOnly` is a **view preference**, not durable user intent, so most apps would *not* persist it — leave it out of `partialize` so each visit starts on the full catalog. (Persisting it is defensible if you want the toggle to "stick", but then add it to the `partialize` whitelist explicitly.)
</details>

---

### 🛠️ Exercise 2 — Search the API instead of filtering locally

Right now we fetch once and filter client-side. Change `fetchMeals` to accept the query and hit `search.php?s=<query>` so the **server** does the search. Debounce it so you don't fire a request on every keystroke.

**Tasks**

1. Change `fetchMeals` to `fetchMeals: (query: string) => Promise<void>` and build the URL from the query.
2. In `SearchBar`, debounce calls to `fetchMeals` (e.g. 400 ms) so typing "chicken" makes one request, not eight.
3. Keep `loading`/`error` working, and handle the `data.meals === null` (no results) case.

**Starter**

```typescript
// store: build the URL from the query
const SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

fetchMeals: async (query: string) => {
  set({ loading: true, error: null });
  try {
    const res = await fetch(`${SEARCH_URL}${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data: MealApiResponse = await res.json();
    set({ meals: (data.meals ?? []).map(toMeal), loading: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch meals";
    set({ error: message, loading: false });
  }
},
```

```tsx
// SearchBar.tsx — debounce the server search
import { useEffect, useRef } from "react";
import { useMealStore } from "../store/useMealStore";

export function SearchBar() {
  const query = useMealStore((s) => s.query);
  const setQuery = useMealStore((s) => s.setQuery);
  const fetchMeals = useMealStore((s) => s.fetchMeals);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // TODO: clear the previous timer, then set a new 400ms timer
    // that calls fetchMeals(query). Clean up on unmount.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetchMeals(query);
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, fetchMeals]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search for a meal…"
      className="w-full rounded-lg border px-4 py-3"
      aria-label="Search meals by name"
    />
  );
}
```

<details>
  <summary><b>Reveal the key insight</b></summary>

The debounce lives in `SearchBar`'s `useEffect`, keyed on `query`. Every keystroke updates `query` (instant, local), but the effect cleans up the previous timer and schedules a new one — so the network call only fires 400 ms after the user *stops* typing. Server-side search is the right move once the dataset is too large to ship to the client; the trade-off is a network round-trip per (debounced) search instead of instant local filtering. With this change you no longer need `useFilteredMeals` for name matching — the server returns the matches — though you'd keep a selector if you still apply a *client-side* "favorites only" filter on top.
</details>
