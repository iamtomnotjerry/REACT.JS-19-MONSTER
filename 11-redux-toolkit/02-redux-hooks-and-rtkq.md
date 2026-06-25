# Redux Hooks & RTK Query (RTKQ) 🔄

This lesson covers how to connect Redux to React components using hooks (**`useSelector`** and **`useDispatch`**), and introduces **RTK Query (RTKQ)**—a powerful data fetching and caching tool built directly into Redux Toolkit.

---

## 🌟 Concept & Overview

Manually wiring up data fetching in Redux is repetitive: you write a thunk, a loading flag, an error flag, a success reducer, and finally a selector—**for every single endpoint**. RTK Query collapses all of that boilerplate into a single declarative definition. You describe *where* the data lives, and RTK Query generates fully-typed React hooks that handle the entire request lifecycle, caching, and re-fetching for you.

Think of the React-Redux hooks as the two ends of a phone line connecting your components to the store: `useSelector` is the **earpiece** (you listen for state), and `useDispatch` is the **mouthpiece** (you speak actions into the store). RTK Query then sits on top of this line like a **smart assistant**: the first time you ask for "all products," it makes the call, writes the answer on a sticky note (the cache), and pins it to the board. The next time anyone asks the same question, the assistant just reads the sticky note instead of making another call—until the note becomes stale and gets thrown away.

> [!NOTE]
> RTK Query is **not** a separate library you install on its own. It ships inside `@reduxjs/toolkit`. You import it from the dedicated entry point `@reduxjs/toolkit/query/react` so that the auto-generated **React hooks** are included.

> [!TIP]
> You almost never write `try/catch` or manage `isLoading` flags by hand with RTK Query. The generated query hook already returns `data`, `error`, `isLoading`, `isFetching`, and `isSuccess`. Destructure exactly what you need and let RTK Query own the lifecycle.

---

## ⚡ 1. React-Redux Hooks

To read data from and dispatch actions to the Redux store inside React components, we use two primary hooks:

1. **`useSelector`**: Extracts specific state slices from the store.
2. **`useDispatch`**: Returns the dispatch function to trigger actions.

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../features/counterSlice';

export const CounterApp = () => {
  // 1. Selector retrieves values (subscribes only to changes in counter slice)
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Count: {count}</h2>
      <button onClick={() => dispatch(increment())}>+ Increment</button>
      <button onClick={() => dispatch(decrement())}>- Decrement</button>
    </div>
  );
};
```

---

## ⚡ 2. What is RTK Query (RTKQ)?

**RTK Query** is a powerful data fetching and caching capability. It simplifies loading data from web APIs, eliminating the need to write custom async thunks, reducers, and loading/error states.

It automatically generates React hooks that manage the fetching lifecycle, caching, and cache invalidation.

---

## 🧩 3. Setting Up RTK Query

Let's build a query service to fetch posts from a JSON API:

### Step 1: Create the API Slice (`src/services/postsApi.js`)
```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // Queries represent GET requests. Mutations represent POST/PUT/DELETE
    getPosts: builder.query({
      query: (limit) => `posts?_limit=${limit}`,
    }),
  }),
});

// Auto-generated hook naming convention: use[EndpointName][Query/Mutation]
export const { useGetPostsQuery } = postsApi;
```

> [!NOTE]
> The hook name is generated for you. RTK Query takes your endpoint name (e.g. `getPosts`), prefixes `use`, capitalizes the first letter, and appends `Query` or `Mutation`. So `getPosts` (a `builder.query`) becomes `useGetPostsQuery`, while a `builder.mutation` named `addPost` becomes `useAddPostMutation`.

### Step 2: Register API in the Store (`src/app/store.js`)
You must register the generated API reducer and add its custom middleware to enable caching, invalidation, and polling features:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import counterReducer from '../features/counterSlice';
import { postsApi } from '../services/postsApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // Add the generated reducer as a specific top-level slice
    [postsApi.reducerPath]: postsApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling, and other useful features of rtk-query.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});

// Optional but recommended: enables refetchOnFocus / refetchOnReconnect behavior
setupListeners(store.dispatch);
```

> [!WARNING]
> If you forget to `.concat(postsApi.middleware)`, RTK Query will appear to "work" but caching, automatic re-fetching, polling, and **tag-based invalidation all silently break**. The middleware is what orchestrates the entire cache lifecycle—never skip it.

### Step 3: Consume in a Component (`PostFeed.jsx`)
```jsx
import { useGetPostsQuery } from '../services/postsApi';

export const PostFeed = () => {
  // Hook automatically handles loading state, error states, and caches results!
  const { data: posts, error, isLoading } = useGetPostsQuery(5);

  if (isLoading) return <p>Loading articles...</p>;
  if (error) return <p>Could not load posts: {error.message}</p>;

  return (
    <div>
      <h3>Recent Articles (RTK Query)</h3>
      <ul>
        {posts?.map((post) => (
          <li key={post.id}>
            <strong>{post.title}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🔁 4. Queries vs. Mutations

Every endpoint is either a **query** (you are *reading* data) or a **mutation** (you are *changing* data). The builder method you choose dictates which auto-generated hook you get and how you call it.

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/' }),
  endpoints: (builder) => ({
    // READ: a query — just fetching data
    getAllProducts: builder.query({
      query: () => 'products',
    }),
    getProductById: builder.query({
      // The hook argument is passed straight into the query function
      query: (id) => `products/${id}`,
    }),
    // WRITE: a mutation — we send a request body and change server state
    addNewProduct: builder.mutation({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: newProduct,
      }),
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useAddNewProductMutation,
} = productsApi;
```

A query hook **runs automatically** on mount and returns an *object*. A mutation hook returns an *array*: a trigger function you call manually, plus a result object.

```jsx
// QUERY — runs immediately, returns an object you destructure
const { data, error, isLoading } = useGetAllProductsQuery();

// MUTATION — returns [triggerFn, resultObject]; you fire it on demand
const [addNewProduct, { data, error, isLoading }] = useAddNewProductMutation();

const handleAddProduct = async () => {
  // Call the trigger; .unwrap() lets you try/catch the real result
  await addNewProduct({ title: 'Amazing T-Shirt', price: 19 }).unwrap();
};
```

### Comparison Table

| Aspect | **Query** (`builder.query`) | **Mutation** (`builder.mutation`) |
| --- | --- | --- |
| Purpose | Read / fetch data | Create, update, or delete data |
| HTTP verb | `GET` | `POST`, `PUT`, `PATCH`, `DELETE` |
| Generated hook | `useGetXQuery` | `useXMutation` |
| Hook return shape | **Object**: `{ data, error, isLoading }` | **Array**: `[trigger, { data, error, isLoading }]` |
| Execution | Runs **automatically** on mount | Runs **manually** when you call the trigger |
| Caching | Result is cached & shared | Not cached itself |
| Cache role | Declares **what it provides** (`providesTags`) | Declares **what it invalidates** (`invalidatesTags`) |
| Re-fetch | Supports polling & refetch-on-focus | Triggers other queries to re-fetch via tags |

---

## 🏷️ 5. Cache Invalidation with Tags

Here is the problem tags solve: imagine `useGetAllProductsQuery` has cached a list of 30 products. The user clicks **Add Product**, your mutation succeeds on the server—but the screen still shows the **old 30 items**, because the cached list never knew anything changed. You could manually call `refetch()`, but that is fragile and easy to forget.

**Tags** are RTK Query's automatic solution. Think of a tag as a **label on a filing cabinet drawer**. Each query says "I provide the contents of the `Products` drawer." Each mutation says "I just messed with the `Products` drawer—anything depending on it is now stale." RTK Query then automatically re-fetches every query that provided the invalidated tag. No manual `refetch()`, no stale UI.

The flow has three pieces:

1. **`tagTypes`** — declare the tag names that exist in this API.
2. **`providesTags`** — a query announces which tags its data represents.
3. **`invalidatesTags`** — a mutation announces which tags it dirties.

```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/' }),
  // 1. Declare every tag type this API knows about
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => 'products',
      // 2. This query's cached data IS the "Product" list.
      //    We also tag each item by id so a single product can be invalidated.
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query({
      query: (id) => `products/${id}`,
      // This query provides the tag for one specific product id
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    addNewProduct: builder.mutation({
      query: (newProduct) => ({
        url: 'products/add',
        method: 'POST',
        body: newProduct,
      }),
      // 3. Adding a product makes the whole LIST stale -> refetch getAllProducts
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: patch,
      }),
      // Only the edited product is stale -> refetch just that one
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      // Removing an item invalidates that id AND the list
      invalidatesTags: (result, error, id) => [
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
[Component]  addNewProduct({...})
     |
     v
[Mutation]   invalidatesTags: [{ type: 'Product', id: 'LIST' }]
     |
     v
[RTK Query]  "Which cached queries provide Product/LIST?"
     |
     v
[Query]      getAllProducts  --> marked stale --> AUTOMATICALLY re-fetched
     |
     v
[Component]  re-renders with fresh data — no manual refetch() needed
```

> [!TIP]
> The `id: 'LIST'` convention is the recommended pattern. Tag the collection itself with a special `'LIST'` id so that **add** mutations (which create an item with no known id yet) can still invalidate the full list precisely, without nuking every individual product cache entry.

> [!WARNING]
> Tags are only honored when the API middleware is registered (see Step 2). A common bug: `providesTags`/`invalidatesTags` are written correctly, the mutation succeeds, but the list never refreshes—because the middleware was missing from `configureStore`, so the invalidation event has nothing listening to it.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of Redux Hooks and RTK Query. Click **Reveal Answer** to verify.

### 1. How does `useSelector` determine when a component needs to re-render?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useSelector` runs its selector function whenever an action is dispatched and the store state updates. It performs a strict **referential equality check** (`===`) on the returned value. If the returned reference is identical to the previous render, it skips re-rendering the component, protecting performance.
</details>

### 2. Why should you avoid returning a new object directly inside `useSelector` (e.g. `useSelector(state => ({ val: state.a }))`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Returning a new object literal directly creates a brand-new object reference in memory on **every single run**. Because `useSelector` compares references, it will think the state has changed on every dispatch and trigger unnecessary re-renders. To return multiple values safely:
  1. Call `useSelector` multiple times, retrieving one primitive at a time.
  2. Or use the shallow equality comparison helper: `useSelector(selector, shallowEqual)`.
</details>

### 3. What does RTK Query do under the hood when a component using `useGetPostsQuery(5)` is unmounted and then mounted again?
<details>
  <summary><b>Reveal Answer</b></summary>

  RTK Query checks its centralized cache. Since the data with argument `5` is already in the cache, it returns the cached data immediately without triggering a new network request. By default, it keeps unused cache in memory for 60 seconds (configurable via `keepUnusedDataFor`) before garbage collecting it.
</details>

### 4. What is the difference between how you call a `Query` hook and a `Mutation` hook in a component?
<details>
  <summary><b>Reveal Answer</b></summary>

  - A **query hook** returns an **object** and runs **automatically** on mount: `const { data, error, isLoading } = useGetAllProductsQuery();`
  - A **mutation hook** returns an **array** `[triggerFn, resultObject]` and runs **manually** when you invoke the trigger: `const [addProduct, { data, isLoading }] = useAddNewProductMutation();`. You then call `addProduct(payload)` (optionally with `.unwrap()`) inside an event handler.
</details>

### 5. How do `providesTags` and `invalidatesTags` work together to keep cached data fresh?
<details>
  <summary><b>Reveal Answer</b></summary>

  Each **query** uses `providesTags` to label the cache entry it owns (e.g. `{ type: 'Product', id: 'LIST' }`). Each **mutation** uses `invalidatesTags` to declare which of those labels it makes stale. When the mutation succeeds, RTK Query finds every cached query that *provided* a matching tag and **automatically re-fetches** it. This eliminates manual `refetch()` calls and prevents stale UI after create/update/delete operations. Tags only function when the API middleware is registered in the store.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Build a Users Query Service
1. Create a service file `usersApi.js` inside `src/services/`.
2. Define a query endpoint `getUsers` that fetches a list of users from `https://jsonplaceholder.typicode.com/users`.
3. Register the `usersApi` reducer and middleware in your global `store.js` file (don't forget `setupListeners`).
4. Build a component `UsersList.tsx` that consumes the auto-generated hook `useGetUsersQuery()`.
5. Render a list of user names and emails on the screen, showing a loading indicator during fetching.

### 🛠️ Exercise 2: Add Cache Invalidation with Tags
Extend the products example so that the product list stays fresh after a write—**without ever calling `refetch()` manually**.

1. Add `tagTypes: ['Product']` to your `createApi` configuration.
2. On `getAllProducts`, add `providesTags` that tags each item by `id` plus a `{ type: 'Product', id: 'LIST' }` entry for the collection.
3. Create an `addNewProduct` mutation (`POST` to `products/add`) and give it `invalidatesTags: [{ type: 'Product', id: 'LIST' }]`.
4. Create a `deleteProduct` mutation (`DELETE` to `products/:id`) that invalidates both `{ type: 'Product', id }` and `{ type: 'Product', id: 'LIST' }`.
5. Build two components: a list that renders all products, and a form with an **Add Product** button. Confirm that clicking the button updates the list **automatically**.
6. **Bonus:** Temporarily remove `.concat(productsApi.middleware)` from the store and observe that the list no longer auto-refreshes—proving why the middleware is mandatory for tag invalidation.
