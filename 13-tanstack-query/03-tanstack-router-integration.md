# TanStack Router + Query Integration 🧭

Most React developers reach for `react-router-dom` and call it a day. But when you pair **TanStack Router** with **TanStack Query**, you unlock something neither library gives you alone: a router that is *type-safe from URL to component*, that *preloads data before the page renders*, and that *hands off cache ownership to Query* so there is exactly one source of truth for your server state.

In this lesson you will build a fully type-safe routing layer — defining routes, navigating with `<Link>` and `useNavigate`, reading typed path and search params, and (the headline feature) wiring **route loaders** to **TanStack Query** so that data is fetched *during navigation* and consumed with `useSuspenseQuery` — never undefined, never a loading flag in your component body.

---

## ⚡ 1. Concept & Overview

> [!NOTE]
> **TanStack Router is part of this course's roadmap, but it was not demonstrated in the recorded lectures** (the transcript only mentions "TanStack Query / TanStack Router" as future topics alongside `react-router-dom`). This lesson is **net-new** and teaches **current best practices** as of TanStack Router v1. Everything below is complete and copy-pasteable — no elided code.

TanStack Router is a **fully type-safe** router for React. Unlike `react-router-dom`, where `to="/users/:id"` and `useParams<{ id: string }>()` are just strings you *hope* line up, TanStack Router derives the type of every path, every search param, and every loader's return value from a single **route tree**. Mistype a path in a `<Link>` and TypeScript fails the build.

It also has a **data layer built into the router itself**: every route can declare a `loader` that runs *before* the route's component mounts. This is the seam where TanStack Query plugs in — the loader warms the Query cache, and the component reads from that warm cache synchronously via Suspense.

### 🧩 Real-world metaphor: the airport pre-boarding crew

Think of navigating to a route like **boarding a flight**.

- The **`<Link>`** is your ticket — it has to name a *real* gate (route). Hand over a ticket for a gate that doesn't exist and the gate agent (TypeScript) refuses you at the desk.
- The **`loader`** is the **ground crew** that loads luggage, fuel, and catering *while you are still walking down the jet bridge*. By the time you step into the cabin (the component renders), everything is already onboard.
- **TanStack Query** is the **central warehouse** behind the airport. The ground crew doesn't manufacture fuel each time — it requests it from the warehouse, which keeps stock (cache) and only re-orders (refetches) when supplies go stale.
- **`useSuspenseQuery`** in your component is you sitting in your seat asking the flight attendant for the meal that was *already loaded* — it's there instantly, no "please wait."

The magic is that the loader and the component ask the **same warehouse** for the **same item** (a shared query key), so the work is never duplicated.

### How the pieces relate

```
            ┌─────────────────────────────────────────────┐
            │              Route Tree (typed)              │
            │   rootRoute → indexRoute, userRoute, ...     │
            └───────────────────┬─────────────────────────┘
                                │ createRouter({ routeTree })
                                ▼
        ┌───────────────────────────────────────────────────┐
        │   <RouterProvider router={router} />               │
        │   (declaration-merged → app-wide type safety)      │
        └───────┬───────────────────────────────────┬───────┘
                │ navigation                          │ data
                ▼                                     ▼
   <Link to> / useNavigate / useParams      loader: ensureQueryData
   useSearch (validateSearch)                         │ warms
                                                       ▼
                                          ┌──────────────────────┐
                                          │  TanStack Query Cache │ ◀── single source
                                          └──────────┬───────────┘     of truth
                                                     │ reads (warm)
                                                     ▼
                                          Component: useSuspenseQuery
```

### TanStack Router vs. react-router-dom

| Capability                | react-router-dom (v6/v7) | TanStack Router v1                          |
| ------------------------- | ------------------------ | ------------------------------------------- |
| Path type safety          | ❌ strings only          | ✅ inferred from route tree                 |
| Search-param type safety  | ❌ raw `URLSearchParams`  | ✅ `validateSearch` → typed object          |
| Built-in loaders          | ✅ (data routers)        | ✅ with full return-type inference          |
| First-class Query bridge  | manual                   | ✅ `ensureQueryData` + `useSuspenseQuery`   |
| File-based routing        | optional plugin          | ✅ official Vite plugin (codegen)           |
| `pending` / `error` UI    | per-route                | ✅ `pendingComponent` / `errorComponent`    |

---

## 🛠️ 2. Installation

```bash
# Router + Query + the Query/Router devtools
npm i @tanstack/react-router @tanstack/react-query
npm i -D @tanstack/router-devtools @tanstack/react-query-devtools

# Optional but recommended: the file-based routing Vite plugin (codegen)
npm i -D @tanstack/router-plugin
```

> [!TIP]
> There are **two ways** to define routes: **code-based** (you write `createRoute(...)` by hand) and **file-based** (the Vite plugin generates the route tree from your `src/routes/` folder). This lesson teaches **code-based first** because it makes the type-safety mechanics explicit, then shows how to switch the plugin on. File-based is the recommended default for real apps because the codegen keeps the tree in sync for you.

If you use the file-based plugin, register it in `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    // IMPORTANT: the router plugin must come BEFORE the react plugin.
    TanStackRouterVite(),
    react(),
  ],
});
```

---

## 🧩 3. Defining Routes (code-based)

A route tree is built bottom-up from a **root route** plus **child routes**. Each child names its `getParentRoute`, its URL `path`, and its `component`.

```tsx
// src/routes.tsx
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// 1) The ROOT route renders the app shell. <Outlet/> is where the
//    matched child route's component is injected (like a layout).
const rootRoute = createRootRoute({
  component: () => (
    <div className="app-shell">
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        {/* Links go here in §4 */}
      </nav>
      <main style={{ padding: 12 }}>
        <Outlet />
      </main>
      {/* Devtools only render in development builds */}
      <TanStackRouterDevtools />
    </div>
  ),
});

// 2) The index route ("/").
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/", // exact "/"
  component: function HomePage() {
    return <h1>🏠 Home</h1>;
  },
});

// 3) A users list route ("/users").
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: function UsersPage() {
    return <h1>👥 Users</h1>;
  },
});

// 4) A dynamic detail route ("/users/$userId").
//    The "$" prefix marks a path PARAM — its type flows through to useParams.
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  component: function UserPage() {
    return <h1>👤 User detail</h1>;
  },
});

// 5) Assemble the route TREE. The shape of this tree is what gives
//    every <Link>, useParams, and useSearch their static types.
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
  userRoute,
]);

// 6) Create the router instance.
export const router = createRouter({
  routeTree,
  // Sensible defaults for a Query-backed app:
  defaultPreload: "intent", // preload a route's loader on link hover/focus
  defaultPreloadStaleTime: 0, // let TanStack Query own staleness, not the router
});

// 7) Register the router type GLOBALLY via declaration merging.
//    This is what makes `to="/users/$userId"` autocomplete and type-check
//    everywhere in your app without importing the router type by hand.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

> [!WARNING]
> The `declare module "@tanstack/react-router"` block is **not optional boilerplate** — it is the single line that turns on app-wide type safety. Without it, `<Link to="...">` accepts any string and you lose every compile-time guarantee. Add it exactly once, in the file that creates the router.

Now mount the router. Note that the Query and Router providers are **both** present — Query owns the cache, Router owns the URL.

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";

// One QueryClient for the whole app — the "warehouse" from the metaphor.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // data is "fresh" for 60s; no refetch within that window
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

> [!TIP]
> If your loaders need access to the `QueryClient` (they do — see §6), pass it into the router's **context**: `createRouter({ routeTree, context: { queryClient } })`. We do exactly that in §6 so loaders can call `queryClient.ensureQueryData(...)`.

---

## 🧭 4. Navigation: `<Link>`, `useNavigate`, `useParams`

### ⚡ Type-safe `<Link>`

```tsx
import { Link } from "@tanstack/react-router";

function MainNav() {
  return (
    <nav style={{ display: "flex", gap: 12 }}>
      {/* `to` is checked against the route tree. A typo here is a build error. */}
      <Link to="/">Home</Link>
      <Link to="/users">Users</Link>

      {/* For a route with params, `params` is REQUIRED and typed. */}
      <Link to="/users/$userId" params={{ userId: "42" }}>
        User 42
      </Link>

      {/* activeProps style the link when its route is the active match. */}
      <Link
        to="/users"
        activeProps={{ style: { fontWeight: "bold", textDecoration: "underline" } }}
      >
        Users (active-aware)
      </Link>
    </nav>
  );
}

export default MainNav;
```

### ⚡ Imperative navigation with `useNavigate`

```tsx
import { useNavigate } from "@tanstack/react-router";

function CreateUserButton() {
  const navigate = useNavigate();

  function handleCreated(newId: string) {
    // Same type safety as <Link>: `to` and `params` are validated.
    navigate({ to: "/users/$userId", params: { userId: newId } });
  }

  return (
    <button type="button" onClick={() => handleCreated("99")}>
      Pretend we created user 99, then navigate
    </button>
  );
}

export default CreateUserButton;
```

### ⚡ Reading path params with `useParams`

The cleanest, most type-safe way to read params is the **route-scoped** hook `Route.useParams()`, which knows *which* params exist on *that* route:

```tsx
// Inside the file where `userRoute` is defined:
function UserPage() {
  // `userId` is typed as string because the path is "/users/$userId".
  const { userId } = userRoute.useParams();
  return <h2>Viewing user {userId}</h2>;
}
```

---

## 🔎 5. Type-safe Search Params (`validateSearch` + `Route.useSearch`)

Query strings like `?page=2&sort=desc` are notoriously untyped. TanStack Router fixes this: you declare a `validateSearch` function on the route, and the *return type* of that function becomes the type of `useSearch()`.

We'll use **Zod** for runtime validation (any validator works, but Zod gives clean inference).

```tsx
// src/routes/users.search.tsx
import { createRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./root"; // wherever your rootRoute lives

// 1) Describe the search-param SHAPE with defaults so the URL is always valid.
const usersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1), // ?page=2 → 2; missing/invalid → 1
  sort: z.enum(["asc", "desc"]).catch("asc"),
});

// Infer the TypeScript type from the schema (single source of truth).
type UsersSearch = z.infer<typeof usersSearchSchema>;

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  // 2) validateSearch parses/coerces the raw URL search into a typed object.
  //    Its return type drives Route.useSearch() and the `search` prop on <Link>.
  validateSearch: (raw): UsersSearch => usersSearchSchema.parse(raw),
  component: UsersListPage,
});

function UsersListPage() {
  // 3) Fully typed: `page` is number, `sort` is "asc" | "desc".
  const { page, sort } = usersRoute.useSearch();
  const navigate = useNavigate();

  // 4) Update search params immutably. The updater receives the current
  //    typed search and returns the next one — TypeScript checks both.
  function goToPage(next: number) {
    navigate({
      to: "/users",
      search: (prev) => ({ ...prev, page: next }),
    });
  }

  function toggleSort() {
    navigate({
      to: "/users",
      search: (prev) => ({ ...prev, sort: prev.sort === "asc" ? "desc" : "asc" }),
    });
  }

  return (
    <section>
      <p>
        Page <b>{page}</b>, sorted <b>{sort}</b>
      </p>
      <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
        ← Prev
      </button>
      <button type="button" onClick={() => goToPage(page + 1)}>
        Next →
      </button>
      <button type="button" onClick={toggleSort}>
        Toggle sort
      </button>
    </section>
  );
}
```

> [!NOTE]
> Using `.catch(default)` (Zod) inside `validateSearch` means a malformed URL like `?page=banana` silently falls back to a valid value instead of throwing. This keeps deep-links and shared URLs robust. If you'd rather reject bad URLs, drop `.catch()` and pair the route with an `errorComponent` (see §7).

---

## 🚀 6. Loaders + TanStack Query (the integration)

This is the heart of the lesson. The pattern is:

1. Define a **reusable query options factory** (`queryOptions`) so the loader and the component reference the *same* query.
2. In the route's **`loader`**, call `queryClient.ensureQueryData(...)` — this fetches *only if the cache is empty/stale*, otherwise returns instantly.
3. In the **component**, call `useSuspenseQuery(...)` with the same options — it reads the warm cache synchronously.

### 🛠️ Step 1 — wire `queryClient` into the router context

```tsx
// src/router.tsx
import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree"; // assembled tree

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0, // Query owns staleness
  // Loaders read this via { context } — see step 3.
  context: { queryClient },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

### 🛠️ Step 2 — the shared `queryOptions` factory

```typescript
// src/api/users.ts
import { queryOptions } from "@tanstack/react-query";

export interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(userId: string): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to load user ${userId} (status ${res.status})`);
  }
  return (await res.json()) as User;
}

// ONE definition used by BOTH the loader and the component.
// Identical queryKey ⇒ they share the same cache entry ⇒ no double fetch.
export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["user", userId] as const,
    queryFn: () => fetchUser(userId),
  });
}
```

### 🛠️ Step 3 — loader warms the cache, component reads it

```tsx
// src/routes/user.detail.tsx
import { createRoute, ErrorComponent } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { userQueryOptions } from "../api/users";

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",

  // The loader runs DURING navigation, before the component mounts.
  // `context.queryClient` was injected in router.tsx (step 1).
  // `params.userId` is typed from the "$userId" path segment.
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),

  // Shown while the loader's promise is pending (first visit / cold cache).
  pendingComponent: () => <p>⏳ Loading user…</p>,

  // Shown if the loader or query throws (e.g. 404, network error).
  errorComponent: ({ error }) => <ErrorComponent error={error} />,

  component: UserDetail,
});

function UserDetail() {
  const { userId } = userRoute.useParams();

  // useSuspenseQuery NEVER returns `undefined` data — by the time this
  // component renders, the loader already populated the cache.
  // `data` is typed as `User` (no `| undefined`, no loading flag).
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));

  return (
    <article>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <small>ID: {user.id}</small>
    </article>
  );
}
```

### Why this is better than fetching in `useEffect`

```
useEffect approach:                  loader + ensureQueryData approach:
─────────────────────                ─────────────────────────────────
navigate → mount → render            navigate → loader fetches (cache) →
  → useEffect fires → fetch            render with data ALREADY present
  → setState → re-render             ── no loading flicker in component
  (loading flicker + waterfall)      ── no "data | undefined" in types
```

> [!TIP]
> Because `defaultPreload: "intent"` is on, hovering a `<Link to="/users/$userId">` *fires the loader early*. The fetch is already in flight (or done) before the user even clicks — pages feel instant. Set `defaultPreloadStaleTime: 0` so the router defers staleness decisions to TanStack Query rather than caching loader results itself.

> [!WARNING]
> The loader and the component **must use the same `queryKey`**. That's the whole reason for the `userQueryOptions` factory. If the loader fetches `["user", userId]` but the component's `useSuspenseQuery` uses `["users", userId]` (note the `s`), Suspense will trigger a *second* fetch and you lose the entire benefit. Always share one `queryOptions` definition.

---

## 🧩 7. `pendingComponent` and `errorComponent` in depth

Every route can declare per-route UI for the two non-happy states. The router shows them automatically — you never write `if (isLoading)` / `if (error)` branches inside your component.

```tsx
// A richer example combining both, plus a route-level retry button.
import { createRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { userQueryOptions } from "../api/users";

export const userRouteRich = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),

  // pendingComponent appears after `pendingMs` of waiting (default 1s),
  // for at least `pendingMinMs`, to avoid flashing on fast loads.
  pendingMs: 300,
  pendingMinMs: 500,
  pendingComponent: () => (
    <div role="status" aria-busy="true">
      <span>⏳ Fetching user profile…</span>
    </div>
  ),

  // errorComponent receives the thrown error. `reset` re-runs the loader.
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div role="alert">
        <p>❌ Could not load this user.</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
        <button
          type="button"
          onClick={() => {
            // Invalidate the current match and re-run its loader.
            reset();
            router.invalidate();
          }}
        >
          Retry
        </button>
      </div>
    );
  },

  component: function RichUserDetail() {
    const { userId } = userRouteRich.useParams();
    const { data: user } = useSuspenseQuery(userQueryOptions(userId));
    return (
      <article>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </article>
    );
  },
});
```

> [!NOTE]
> `pendingComponent` covers the *navigation* loading state (the loader's promise). `useSuspenseQuery`'s own Suspense boundary covers *re-fetch* loading after the component has mounted. In practice the loader fills the cache first, so the in-component suspense rarely shows on initial visit — it mostly matters for cache invalidation and refetch.

---

## 🗂️ 8. The file-based alternative (brief)

With the Vite plugin from §2, you skip writing `createRoute` calls by hand. Instead you create files under `src/routes/` and export a `Route` from each:

```tsx
// src/routes/users.$userId.tsx  (the filename encodes the path "/users/$userId")
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userQueryOptions } from "../api/users";

// createFileRoute's argument is auto-filled and verified by the plugin's codegen.
export const Route = createFileRoute("/users/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
  component: UserPage,
});

function UserPage() {
  const { userId } = Route.useParams();
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));
  return <h2>{user.name}</h2>;
}
```

The plugin generates `src/routeTree.gen.ts` (the assembled tree) on save. You then `import { routeTree } from "./routeTree.gen"` and feed it to `createRouter` exactly as in §6 — everything else (loaders, search validation, type safety) works identically. **File-based is the recommended default for production apps** because the tree never drifts out of sync with your files.

---

## 🧠 Test Your Knowledge

**1.** Why must the route loader and the component use the *same* `queryOptions` factory (with an identical `queryKey`)?

<details>
  <summary><b>Reveal Answer</b></summary>

  Because the integration relies on the loader and the component reading the **same cache entry**. `ensureQueryData` in the loader fetches and stores data under a `queryKey`; `useSuspenseQuery` in the component then reads from that exact key. If the keys differ (even `["user", id]` vs `["users", id]`), the component's Suspense query finds an empty cache for *its* key and triggers a brand-new fetch — defeating the preloading benefit and causing a double request. Sharing one `userQueryOptions(userId)` factory guarantees both sides agree on `queryKey` and `queryFn`.
</details>

**2.** What does the `declare module "@tanstack/react-router" { interface Register { router: typeof router } }` block actually do?

<details>
  <summary><b>Reveal Answer</b></summary>

  It uses **TypeScript declaration merging** to register *your specific* router instance (and therefore your route tree) as the global router type for the whole app. Once registered, hooks and components like `<Link>`, `useNavigate`, `useParams`, and `useSearch` infer their valid `to` paths, `params`, and `search` shapes from your tree — with full autocomplete and compile-time errors on typos. Without this block, `<Link to>` falls back to accepting any `string`, and you lose all of TanStack Router's type safety.
</details>

**3.** What is the difference between `pendingComponent` and the loading state of `useSuspenseQuery`?

<details>
  <summary><b>Reveal Answer</b></summary>

  `pendingComponent` is the router's UI for the **navigation/loader phase** — it shows while the route's `loader` promise is pending, *before the route component mounts*. `useSuspenseQuery`'s loading is handled by a **React Suspense boundary** and triggers when the component renders against a cold/refetching cache. In the loader pattern, the loader fills the cache first, so on initial visit the in-component suspense usually does not fire; it mostly matters after cache invalidation or a refetch. `pendingComponent` also supports `pendingMs`/`pendingMinMs` to avoid flicker on fast loads.
</details>

**4.** How do you make search params type-safe, and what drives the type returned by `Route.useSearch()`?

<details>
  <summary><b>Reveal Answer</b></summary>

  You add a `validateSearch` function to the route. It receives the raw search object parsed from the URL and returns a typed object (commonly via `zodSchema.parse(raw)`). The **return type of `validateSearch`** is what `Route.useSearch()` is typed as, and it also types the `search` prop on `<Link>`/`useNavigate` for that route. Using Zod's `.catch(default)` makes malformed URLs fall back to valid values rather than throwing, keeping deep links robust.
</details>

**5.** Why is the loader + `ensureQueryData` pattern preferable to fetching inside a `useEffect`?

<details>
  <summary><b>Reveal Answer</b></summary>

  Fetching in `useEffect` creates a **waterfall**: the component must mount and render once (showing a loading flicker) before the effect fires the request, and the component's data type is `T | undefined` forcing loading/null guards everywhere. The loader runs **during navigation, before mount**, so by the time the component renders the data is already in the cache; `useSuspenseQuery` then returns fully-typed, non-undefined `data` with no loading branch. Combined with `defaultPreload: "intent"`, the fetch can even start on link hover, making navigation feel instant. `ensureQueryData` is also a no-op when the cache is already fresh, so it doesn't refetch unnecessarily.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1 — Add a type-safe, loader-backed posts route

Build a `/posts/$postId` route that preloads a post via TanStack Query.

**Tasks**

1. Create a `postQueryOptions(postId)` factory hitting `https://jsonplaceholder.typicode.com/posts/{postId}`.
2. Define a `postRoute` whose `loader` calls `ensureQueryData`.
3. Render `title` and `body` with `useSuspenseQuery`.
4. Add a `pendingComponent` and an `errorComponent`.

**Starter**

```tsx
// src/api/posts.ts
import { queryOptions } from "@tanstack/react-query";

export interface Post {
  id: number;
  title: string;
  body: string;
}

async function fetchPost(postId: string): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  if (!res.ok) throw new Error(`Post ${postId} not found (${res.status})`);
  return (await res.json()) as Post;
}

export function postQueryOptions(postId: string) {
  return queryOptions({
    queryKey: ["post", postId] as const,
    queryFn: () => fetchPost(postId),
  });
}

// src/routes/post.detail.tsx
import { createRoute, ErrorComponent } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { postQueryOptions } from "../api/posts";

export const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts/$postId",
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(postQueryOptions(params.postId)),
  pendingComponent: () => <p>⏳ Loading post…</p>,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  component: function PostDetail() {
    const { postId } = postRoute.useParams();
    const { data: post } = useSuspenseQuery(postQueryOptions(postId));
    return (
      <article>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </article>
    );
  },
});
```

Remember to add `postRoute` to your `rootRoute.addChildren([...])` and link to it with `<Link to="/posts/$postId" params={{ postId: "1" }}>`.

### 🛠️ Exercise 2 — Filterable, paginated, shareable list via search params

Extend a `/posts` list route so its filter state lives entirely in the URL (so it's shareable and back-button friendly).

**Tasks**

1. Add a `validateSearch` with `page: number (default 1)` and `q: string (default "")`.
2. Read them with `postsRoute.useSearch()`.
3. Use `useNavigate` with an immutable `search: (prev) => ...` updater for a Prev/Next pager and a search box.
4. Fetch the filtered list with `useSuspenseQuery` keyed by `["posts", { page, q }]` and preload it in the loader.

**Starter**

```tsx
// src/routes/posts.list.tsx
import { createRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { rootRoute } from "./root";

const postsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  q: z.string().catch(""),
});
type PostsSearch = z.infer<typeof postsSearchSchema>;

interface PostSummary {
  id: number;
  title: string;
}

async function fetchPosts(search: PostsSearch): Promise<PostSummary[]> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_page=${search.page}&_limit=10`,
  );
  if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
  const all = (await res.json()) as PostSummary[];
  // Client-side filter by the `q` search term for demo purposes.
  return search.q
    ? all.filter((p) => p.title.toLowerCase().includes(search.q.toLowerCase()))
    : all;
}

function postsQueryOptions(search: PostsSearch) {
  return queryOptions({
    queryKey: ["posts", search] as const,
    queryFn: () => fetchPosts(search),
  });
}

export const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts",
  validateSearch: (raw): PostsSearch => postsSearchSchema.parse(raw),
  // loaderDeps tells the loader to re-run when search changes.
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(postsQueryOptions(deps)),
  component: function PostsList() {
    const search = postsRoute.useSearch();
    const navigate = useNavigate();
    const { data: posts } = useSuspenseQuery(postsQueryOptions(search));

    return (
      <section>
        <input
          value={search.q}
          placeholder="Filter by title…"
          onChange={(e) =>
            navigate({
              to: "/posts",
              search: (prev) => ({ ...prev, q: e.target.value, page: 1 }),
            })
          }
        />
        <ul>
          {posts.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
        <button
          type="button"
          disabled={search.page <= 1}
          onClick={() =>
            navigate({ to: "/posts", search: (prev) => ({ ...prev, page: prev.page - 1 }) })
          }
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() =>
            navigate({ to: "/posts", search: (prev) => ({ ...prev, page: prev.page + 1 }) })
          }
        >
          Next →
        </button>
      </section>
    );
  },
});
```

**Stretch goal:** add a `pendingComponent` and verify in the Network tab that hovering a `<Link to="/posts">` (with `defaultPreload: "intent"`) starts the request *before* you click.

---

## 🎯 Summary

- TanStack Router derives **path, param, and search-param types** from a single route tree — registered globally via `declare module ... interface Register`.
- Navigate with type-safe `<Link to>`, `useNavigate`, and read state with route-scoped `Route.useParams()` / `Route.useSearch()`.
- **`validateSearch`** turns query strings into typed, validated objects; its return type *is* the search type.
- The Router↔Query bridge: a shared **`queryOptions` factory** + `ensureQueryData` in the **loader** + `useSuspenseQuery` in the **component** ⇒ data is preloaded during navigation, the cache is the single source of truth, and components never deal with `undefined` or loading flags.
- **`pendingComponent`** and **`errorComponent`** declare per-route loading/error UI so your components stay focused on the happy path.
- For production, prefer **file-based routing** with the Vite plugin — same concepts, zero manual tree assembly.
