# Redux Toolkit Query: Data Fetching & Caching 🛰️

In the previous lesson you saw how `useSelector` and `useDispatch` connect React components to the Redux store, and you got a first taste of **RTK Query (RTKQ)**. This lesson is a focused, production-grade deep dive into RTK Query itself: the single declarative tool inside Redux Toolkit that owns your entire server-data lifecycle — fetching, caching, loading/error flags, de-duplication, and automatic re-fetching after writes.

The promise is simple but enormous: you describe *where* your data lives and *what* it represents, and RTK Query hands you fully-typed React hooks (`useGetItemsQuery`, `useAddItemMutation`, …) that you drop straight into components. No hand-written thunks, no `isLoading` booleans you toggle yourself, no manual cache bookkeeping. By the end you will have a complete, copy-pasteable TypeScript service — `createApi` with `tagTypes` and a mix of queries and mutations — wired into `configureStore`, plus a clear mental model of how cache tags keep your UI fresh automatically.

---

## ⚡ 1. Concept & Overview

Server data is fundamentally different from local UI state. It lives somewhere else, it can change without your app knowing, multiple components want the same slice of it, and every request has a lifecycle (pending → success/error). Hand-rolling all of that in Redux means writing the *same* five things for every endpoint: an async thunk, a loading flag, an error flag, a success reducer, and a selector. RTK Query collapses that repetition into one declarative `createApi` definition.

> [!NOTE]
> RTK Query is **not** a separate package. It ships inside `@reduxjs/toolkit`. You import the data-fetching pieces from the dedicated entry point `@reduxjs/toolkit/query/react` so the auto-generated **React hooks** are included. (If you import from `@reduxjs/toolkit/query` without `/react`, you get the core API but no hooks.)

### 🧩 A real-world metaphor: the office librarian

Imagine your app is a busy office and the API is a distant archive across town. RTK Query is the **office librarian** sitting at a desk between them:

- The first time someone asks for "the Q3 reports" (`useGetReportsQuery()`), the librarian makes the trip to the archive, brings back a copy, and **files it in a labeled drawer** (the cache, tagged `Report`).
- When a second person asks for the same reports a moment later, the librarian doesn't travel again — they hand over the copy already in the drawer. That's **request de-duplication** and **caching**.
- When someone files a *new* report (`useAddReportMutation()`), the librarian crosses out the "Reports" drawer label as **stale** and quietly re-fetches it, so the next reader always gets current data. That's **tag-based invalidation**.
- If a drawer goes untouched for a while (default 60 seconds), the librarian shreds the copy to free space. That's **garbage collection** (`keepUnusedDataFor`).

You never manage the drawers, the trips, or the shredding. You just ask, and write, and the librarian keeps everything coherent.

### How RTK Query fits into the Redux store

```text
            ┌─────────────────────────── Redux Store ───────────────────────────┐
            │                                                                    │
 Component  │   counter:   counterReducer        (your normal slices)           │
   │        │   productsApi: productsApi.reducer  (RTKQ-managed cache slice)     │
   │ useGetAllProductsQuery()                                                    │
   ▼        │        ▲                                                           │
 ┌──────────┴──┐     │  reads cached data / lifecycle flags                      │
 │ auto hook   │─────┘                                                           │
 │  data       │                                                                 │
 │  isLoading  │     dispatches lifecycle actions ──► productsApi.middleware ──► fetchBaseQuery ──► API
 │  isFetching │                                       (caching, polling,                            │
 │  error      │◄────────────── writes result into cache slice ◄─────────────────────────────────────┘
 └─────────────┘
```

> [!TIP]
> You almost never write `try/catch` around a query, and you never declare `const [loading, setLoading] = useState(false)`. The generated query hook already returns `data`, `error`, `isLoading`, `isFetching`, and `isSuccess`. Destructure exactly what you need and let RTK Query own the lifecycle.

---

## 🛠️ 2. Installation & Setup

RTK Query is part of Redux Toolkit, so a standard Redux install already includes it.

```bash
# Redux Toolkit (includes RTK Query) + the React bindings
npm install @reduxjs/toolkit react-redux
```

A typical project layout for the service-based approach the instructor uses:

```text
src/
├── app/
│   └── store.ts                # configureStore: registers reducers + middleware
├── services/
│   └── productsApi.ts          # createApi service ("slice" for RTK Query)
└── components/
    ├── AllProducts.tsx         # consumes a query hook
    └── AddProduct.tsx          # consumes a mutation hook
```

> [!NOTE]
> The instructor refers to the `createApi` file interchangeably as a **"service"** or a **"slice"**. They mean the same thing: one `createApi` call that owns a whole group of related endpoints (e.g. everything `Product`-related). Most apps have a single API slice; large apps may split into a few by domain.

---

## 🧩 3. Creating the API Slice with `createApi`

This is the heart of RTK Query. `createApi` takes a configuration object with four key fields, and returns an object containing a reducer, middleware, and one auto-generated hook per endpoint.

```typescript
// src/services/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ---- TypeScript models for the dummyjson.com /products API ----
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
}

// The /products list endpoint wraps the array in an object
export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// The body shape we send when creating a product
export interface NewProduct {
  title: string;
  description: string;
  price: number;
}

export const productsApi = createApi({
  // 1) reducerPath: the unique key this API gets inside the Redux store.
  //    It must match what you register in configureStore.
  reducerPath: 'productsApi',

  // 2) baseQuery: how every request is actually made. fetchBaseQuery is a
  //    thin wrapper over fetch() that prepends baseUrl and parses JSON.
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/' }),

  // 3) tagTypes: the set of cache "labels" this API knows about (see §6).
  tagTypes: ['Product'],

  // 4) endpoints: a builder function returning one definition per endpoint.
  //    builder.query = read; builder.mutation = write.
  endpoints: (builder) => ({
    // QUERY — read all products. The generic <ReturnType, ArgType> fully types
    // both the `data` you get back and the argument the hook accepts.
    getAllProducts: builder.query<ProductsResponse, void>({
      // The `query` callback returns the URL appended to baseUrl.
      query: () => 'products',
    }),

    // QUERY — read one product by id. The arg (a number) is passed straight
    // into the query callback and becomes part of the cache key.
    getProductById: builder.query<Product, number>({
      query: (id) => `products/${id}`,
    }),

    // MUTATION — create a product. Returns the created Product; takes a NewProduct.
    addNewProduct: builder.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: newProduct,
      }),
    }),
  }),
});

// 5) RTK Query auto-generates one hook per endpoint. Export them for components.
export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useAddNewProductMutation,
} = productsApi;
```

> [!TIP]
> The hook name is generated for you by a fixed rule: take the endpoint name, prefix `use`, capitalize the first letter (`getAllProducts` → `GetAllProducts`), strip the spaces, and append `Query` or `Mutation` depending on the builder method. So `getAllProducts` (a `builder.query`) becomes `useGetAllProductsQuery`, and `addNewProduct` (a `builder.mutation`) becomes `useAddNewProductMutation`. Rename the endpoint and the hook name follows automatically.

### ⚡ Why the `<ReturnType, ArgType>` generics matter

In plain JavaScript (as shown in the transcript) you'd write `builder.query({ query: () => 'products' })` and `data` would be typed `any`. In TypeScript, the two generics are what make the whole thing type-safe end to end:

| Generic position | What it types | Example |
| :--- | :--- | :--- |
| First — **ReturnType** | The shape of `data` returned by the hook | `ProductsResponse` |
| Second — **ArgType** | The argument the hook accepts (and that the cache keys on) | `void`, `number`, `NewProduct` |

So `useGetProductByIdQuery(2)` is checked to receive a `number`, and `data` is known to be a `Product` — your editor autocompletes `data.title` with no casting.

---

## 🛠️ 4. Registering the API in `configureStore`

The service is inert until you wire three things into the store: its **reducer** (under its `reducerPath`), its **middleware** (concatenated onto the defaults), and optionally `setupListeners` (for refetch-on-focus / refetch-on-reconnect).

```typescript
// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import counterReducer from '../features/counterSlice';
import { productsApi } from '../services/productsApi';

export const store = configureStore({
  reducer: {
    // Your normal slices live here as usual…
    counter: counterReducer,

    // …and the RTKQ cache slice is registered under its reducerPath.
    // The computed-key syntax [productsApi.reducerPath] keeps it in sync
    // automatically if you ever rename the path.
    [productsApi.reducerPath]: productsApi.reducer,
  },

  // The api middleware is what powers caching, invalidation, polling,
  // and refetching. Concat it onto the default middleware — never replace.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect behavior across the app.
// Optional, but recommended — and harmless if you don't use those features.
setupListeners(store.dispatch);

// Strongly-typed helpers for the rest of the app (used by typed hooks).
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

> [!WARNING]
> If you forget `.concat(productsApi.middleware)`, RTK Query will *appear* to work — initial queries still fetch — but **caching, polling, refetch-on-focus, and tag-based invalidation all silently break**. There is no error; mutations just won't refresh your lists. The middleware is the orchestrator of the entire cache lifecycle, so it is mandatory, not optional.

> [!NOTE]
> The instructor describes `setupListeners` as "something you don't have to worry about" — and that's true day-to-day. Concretely, it subscribes to the browser's `focus` and `online` events so RTK Query can re-fetch data when the user tabs back into your app or regains connectivity. You write the one line and forget it.

---

## ⚡ 5. Consuming Endpoints in Components

### 🧩 Queries — automatic, return an object

A query hook runs **automatically on mount**, re-runs when its argument changes, and returns an **object** of lifecycle fields. You typically guard on `isLoading` and `error`, then render `data`.

```tsx
// src/components/AllProducts.tsx
import { useGetAllProductsQuery } from '../services/productsApi';

export function AllProducts() {
  // Runs on mount. `data` is typed ProductsResponse | undefined until it loads.
  const { data, error, isLoading, isFetching } = useGetAllProductsQuery();

  if (isLoading) return <h1>Loading…</h1>;
  if (error) return <h1>Oh no, we got an error fetching products.</h1>;

  return (
    <div>
      <h2>
        All Products {isFetching && <small>(refreshing…)</small>}
      </h2>
      <ul>
        {data?.products.map((product) => (
          <li key={product.id}>
            <strong>{product.title}</strong> — ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Fetching a single item is identical — you just pass the argument, which RTK Query also uses as part of the cache key:

```tsx
// src/components/SpecificProduct.tsx
import { useGetProductByIdQuery } from '../services/productsApi';

export function SpecificProduct({ id }: { id: number }) {
  // The argument `id` is passed into the endpoint's query callback,
  // AND used to key the cache: id=2 and id=5 are cached separately.
  const { data, error, isLoading } = useGetProductByIdQuery(id);

  if (isLoading) return <h1>Loading…</h1>;
  if (error) return <h1>Could not load product #{id}.</h1>;

  return (
    <div>
      <h1>{data?.brand}</h1>
      <h2>{data?.category}</h2>
      <p>{data?.description}</p>
    </div>
  );
}
```

> [!NOTE]
> **`isLoading` vs `isFetching`** trips up almost everyone. `isLoading` is `true` only on the **very first** fetch for a given cache entry (there is no data yet). `isFetching` is `true` for **any** in-flight request, including background re-fetches when data is already on screen. Use `isLoading` for full-page spinners and `isFetching` for subtle "refreshing…" indicators that don't blank out existing content.

### 🧩 Mutations — manual, return an array

A mutation hook does **not** run on mount. It returns an **array**: a **trigger function** you call from an event handler, plus a result object. This array-vs-object difference is the single most important practical distinction between the two hook types.

```tsx
// src/components/AddProduct.tsx
import { useAddNewProductMutation } from '../services/productsApi';

export function AddProduct() {
  // Array destructuring: [triggerFn, { lifecycle fields }]
  const [addNewProduct, { data, error, isLoading }] = useAddNewProductMutation();

  const handleAddProduct = async () => {
    try {
      // Calling the trigger fires the request. `.unwrap()` returns the raw
      // payload on success and THROWS the raw error on failure, so a normal
      // try/catch works. Without .unwrap() you'd get a result object instead.
      const created = await addNewProduct({
        title: 'Amazing T-Shirt',
        description: 'A wonderful, very soft t-shirt.',
        price: 19,
      }).unwrap();

      console.log('Created product with id', created.id);
    } catch (err) {
      console.error('Failed to add product', err);
    }
  };

  return (
    <div>
      {/* Disable while the request is in flight to prevent double-submits */}
      <button onClick={handleAddProduct} disabled={isLoading}>
        {isLoading ? 'Adding…' : 'Add New Product'}
      </button>

      {error && <p>Something went wrong adding the product.</p>}
      {data && <p>Added: {data.title} (id {data.id})</p>}
    </div>
  );
}
```

> [!TIP]
> Use `.unwrap()` whenever you want to branch on the *result* in an event handler — navigate on success, show a toast on failure, read the returned id, etc. Without it, the promise resolves to a discriminated `{ data }` | `{ error }` object that you'd have to check by hand. With it, success is the return value and failure is a thrown error your `catch` receives.

---

## 🔁 Query vs. Mutation: The Complete Comparison

Every endpoint is exactly one of these two. Choosing the wrong builder method is the most common beginner mistake, so internalize this table:

| Aspect | **Query** (`builder.query`) | **Mutation** (`builder.mutation`) |
| :--- | :--- | :--- |
| Purpose | **Read** / fetch data | **Create, update, or delete** data |
| HTTP verb | `GET` | `POST`, `PUT`, `PATCH`, `DELETE` |
| Generated hook | `useGetXQuery` | `useXMutation` |
| Hook return shape | **Object**: `{ data, error, isLoading, isFetching }` | **Array**: `[trigger, { data, error, isLoading }]` |
| Execution | Runs **automatically** on mount & arg change | Runs **manually** when you call the trigger |
| Argument | Passed to `query`; also used as the **cache key** | Passed to `query` when you call the trigger |
| Caching | Result is **cached and shared** across components | Not cached itself |
| Cache role | Declares **what it provides** via `providesTags` | Declares **what it invalidates** via `invalidatesTags` |
| Re-fetch | Supports polling & refetch-on-focus | Triggers *other* queries to re-fetch via tags |

```text
QUERY  →  const { data, isLoading } = useGetAllProductsQuery();   // object, auto
MUTATION → const [addProduct, { isLoading }] = useAddNewProductMutation();  // array, manual
                    │
                    └─ later, in an event handler:  await addProduct(payload).unwrap();
```

---

## 🏷️ 6. Cache Invalidation with Tags

> [!NOTE]
> **This section is net-new beyond the recorded transcript.** In the course video, the instructor demonstrates mutations (add / update / delete) but refreshes the screen by re-rendering individual components — they never wire up `providesTags`/`invalidatesTags`. Automatic cache invalidation with tags is the modern, recommended way to keep lists fresh after a write, so we teach it here as current best practice. Everything in §3–§5 matches what the instructor shows.

### The problem tags solve

`useGetAllProductsQuery` has cached a list of 30 products. The user clicks **Add Product**, the mutation succeeds on the server — but the screen still shows the **old 30 items**, because the cached list never learned that anything changed. You *could* manually call `refetch()`, but that's fragile and easy to forget, and it doesn't help a *different* component that's also showing the list.

### The solution: drawer labels

Think of a tag as the **label on a filing-cabinet drawer**. Each query announces "I provide the contents of the `Product` drawer." Each mutation announces "I just disturbed the `Product` drawer." RTK Query then automatically re-fetches every query that provided an invalidated tag — across the whole app, no manual `refetch()`.

The mechanism has three coordinated pieces:

1. **`tagTypes`** — declare the tag names that exist in this API (top-level field).
2. **`providesTags`** — a *query* announces which tags its cached data represents.
3. **`invalidatesTags`** — a *mutation* announces which tags it makes stale.

```typescript
// src/services/productsApi.ts (extended with tags + update/delete)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product, ProductsResponse, NewProduct } from './types';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/' }),

  // 1) Declare every tag type this API understands.
  tagTypes: ['Product'],

  endpoints: (builder) => ({
    getAllProducts: builder.query<ProductsResponse, void>({
      query: () => 'products',
      // 2) This query's cache IS the Product list. We tag each item by id
      //    AND add a special { id: 'LIST' } tag representing the collection.
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `products/${id}`,
      // This query provides the tag for one specific product id.
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    addNewProduct: builder.mutation<Product, NewProduct>({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: newProduct,
      }),
      // 3) A new product makes the LIST stale → getAllProducts re-fetches.
      //    We don't know the new id yet, so we only invalidate the collection.
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<Product, { id: number; patch: Partial<NewProduct> }>({
      query: ({ id, patch }) => ({
        url: `products/${id}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: patch,
      }),
      // Only the edited product is stale → re-fetch just that one entry.
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation<{ id: number; isDeleted: boolean }, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      // Deleting invalidates BOTH that id and the collection list.
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useAddNewProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

### How a tag invalidation flows

```text
[Component]  addNewProduct({ title, price, description })
     │
     ▼
[Mutation]   invalidatesTags: [{ type: 'Product', id: 'LIST' }]
     │
     ▼
[RTK Query]  "Which cached queries provided Product/LIST?"
     │
     ▼
[Query]      getAllProducts  ──► marked STALE ──► AUTOMATICALLY re-fetched
     │
     ▼
[Component]  re-renders with fresh data — you never called refetch()
```

> [!TIP]
> The `id: 'LIST'` convention is the recommended pattern. Tag the collection itself with a special `'LIST'` id so that **add** mutations (which create an item whose id you don't know yet) can still invalidate the whole list precisely — without nuking every individual product's cache entry. Updates and deletes, which *do* know the id, can invalidate just that entry (plus `'LIST'` for deletes, since the collection shrank).

> [!WARNING]
> Tags are honored **only when the API middleware is registered** (see §4). The classic confusing bug: `providesTags`/`invalidatesTags` are written perfectly, the mutation returns a 200, but the list never refreshes — because `.concat(productsApi.middleware)` was missing from `configureStore`, so the invalidation event has nothing listening for it.

---

## 🧠 Test Your Knowledge

### 1. Why do you import from `@reduxjs/toolkit/query/react` instead of `@reduxjs/toolkit/query`?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `/react` entry point includes the **auto-generated React hooks** (`useGetXQuery`, `useXMutation`). The plain `@reduxjs/toolkit/query` entry point exposes the framework-agnostic core (`createApi`, `fetchBaseQuery`, the reducer/middleware) but **no hooks**, which is intended for non-React or custom integrations. In a React app you almost always want `/react` so `createApi` attaches the hooks to the returned API object.
</details>

### 2. What is the difference between `isLoading` and `isFetching` on a query result, and when would you use each?
<details>
  <summary><b>Reveal Answer</b></summary>

  `isLoading` is `true` **only on the first request** for a cache entry — when there is no data on screen yet. `isFetching` is `true` for **any** in-flight request for that entry, including background re-fetches triggered by tag invalidation, polling, or refetch-on-focus while data is already displayed. Use `isLoading` to show a full-page/skeleton spinner (nothing to show yet), and `isFetching` for a subtle "refreshing…" indicator that keeps the existing data visible.
</details>

### 3. Why does a mutation hook return an array `[trigger, result]` while a query hook returns an object `{ data, ... }`?
<details>
  <summary><b>Reveal Answer</b></summary>

  A **query** runs automatically on mount, so there's nothing for you to call — RTK Query just hands you the lifecycle object `{ data, error, isLoading, isFetching }`. A **mutation** must run on demand (a button click, a form submit), so the hook gives you back an **array** whose first element is the **trigger function** you invoke yourself, and whose second element is the result object: `const [addProduct, { isLoading }] = useAddNewProductMutation()`. You then call `addProduct(payload)` (optionally with `.unwrap()`) inside an event handler.
</details>

### 4. What exactly breaks if you forget `.concat(api.middleware)` in `configureStore`, and why is there no error?
<details>
  <summary><b>Reveal Answer</b></summary>

  Initial queries will still fetch (because the reducer stores the result), so it *looks* like it works. But the middleware is what orchestrates the cache lifecycle, so **caching coherence, polling, refetch-on-focus/reconnect, and tag-based invalidation all silently stop working** — most visibly, mutations no longer refresh the queries they invalidate. There's no error because nothing is technically malformed; the invalidation actions are simply dispatched into a store where no listener (the missing middleware) reacts to them.
</details>

### 5. How do `tagTypes`, `providesTags`, and `invalidatesTags` cooperate to refresh a list after an add, and why is the `id: 'LIST'` convention used?
<details>
  <summary><b>Reveal Answer</b></summary>

  `tagTypes` declares the valid tag names (e.g. `['Product']`). Each **query** uses `providesTags` to label the cache entry it owns; the list query provides one tag per item plus a special collection tag `{ type: 'Product', id: 'LIST' }`. Each **mutation** uses `invalidatesTags` to mark labels stale; an add mutation invalidates `{ type: 'Product', id: 'LIST' }`. When the mutation succeeds, RTK Query finds every cached query that *provided* a matching tag and automatically re-fetches it. The `'LIST'` convention exists because an **add** creates an item with an id you don't know yet — invalidating the collection-level `'LIST'` tag precisely refreshes the full list without invalidating (and re-fetching) every individual item entry.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Build a typed Users service from scratch

Create a complete RTK Query service for users and consume it.

**Tasks:**
1. Create `src/services/usersApi.ts`. Define a `User` interface (`id`, `name`, `email`).
2. Add a `getUsers` query that fetches `users` from `https://jsonplaceholder.typicode.com/`. Type it as `builder.query<User[], void>`.
3. Register `usersApi.reducer` (under `usersApi.reducerPath`) and `.concat(usersApi.middleware)` in `store.ts`. Keep `setupListeners(store.dispatch)`.
4. Build `UsersList.tsx` that calls `useGetUsersQuery()`, shows `Loading…` while `isLoading`, an error message on `error`, and otherwise renders each user's name and email.

**Starter:**

```typescript
// src/services/usersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface User {
  id: number;
  name: string;
  email: string;
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // TODO: add getUsers query<User[], void> hitting 'users'
  }),
});

// TODO: export the auto-generated useGetUsersQuery hook
```

```tsx
// src/components/UsersList.tsx
import { useGetUsersQuery } from '../services/usersApi';

export function UsersList() {
  // TODO: call the hook, guard isLoading/error, render name + email
  return <div>Replace me</div>;
}
```

### 🛠️ Exercise 2: Make the products list self-refresh with tags

Extend the products service so the list updates **automatically** after a write — without ever calling `refetch()`.

**Tasks:**
1. Add `tagTypes: ['Product']` to `createApi`.
2. Give `getAllProducts` a `providesTags` that maps each item to `{ type: 'Product', id }` plus a `{ type: 'Product', id: 'LIST' }` entry.
3. Add an `addNewProduct` mutation (`POST products/add`) with `invalidatesTags: [{ type: 'Product', id: 'LIST' }]`.
4. Add a `deleteProduct` mutation (`DELETE products/:id`) that invalidates both `{ type: 'Product', id }` and `{ type: 'Product', id: 'LIST' }`.
5. Render an `AllProducts` list and an `AddProduct` button on the same screen. Click **Add** and confirm the list refreshes on its own.
6. **Diagnostic bonus:** temporarily remove `.concat(productsApi.middleware)` from the store. Observe that the list stops auto-refreshing — proving §4's warning firsthand. Then put it back.

**Starter:**

```typescript
// Add to endpoints in src/services/productsApi.ts
getAllProducts: builder.query<ProductsResponse, void>({
  query: () => 'products',
  // TODO: providesTags → per-item tags + a { type: 'Product', id: 'LIST' } tag
}),

addNewProduct: builder.mutation<Product, NewProduct>({
  query: (body) => ({ url: 'products/add', method: 'POST', body }),
  // TODO: invalidatesTags → [{ type: 'Product', id: 'LIST' }]
}),

deleteProduct: builder.mutation<{ id: number }, number>({
  query: (id) => ({ url: `products/${id}`, method: 'DELETE' }),
  // TODO: invalidatesTags → both the id entry AND the LIST entry
}),
```
