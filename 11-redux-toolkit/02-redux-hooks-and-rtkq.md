# Redux Hooks & RTK Query (RTKQ) 🔄

This lesson covers how to connect Redux to React components using hooks (**`useSelector`** and **`useDispatch`**), and introduces **RTK Query (RTKQ)**—a powerful data fetching and caching tool built directly into Redux Toolkit.

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

### Step 2: Register API in the Store (`src/app/store.js`)
You must register the generated API reducer and add its custom middleware to enable caching, invalidation, and polling features:

```javascript
import { configureStore } from '@reduxjs/toolkit';
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
```

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

### 4. What is the difference between a `Query` and a `Mutation` in RTK Query?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Queries** represent data-fetching operations (HTTP GET requests). They support caching, automatic updates, polling, and refetch-on-focus.
  - **Mutations** represent data-changing operations (HTTP POST, PUT, DELETE requests) that send updates to the server and trigger cache invalidations to refresh queries.
</details>

### 5. Why do we need to concat the API middleware in `configureStore`?
<details>
  <summary><b>Reveal Answer</b></summary>

  The API middleware is required to orchestrate the cache lifecycle. It automatically manages API subscription lifetimes, handles polling intervals, executes cache invalidation triggers, and manages the fetch timings behind the scenes.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Build a Users Query Service
1. Create a service file `usersApi.js` inside `src/services/`.
2. Define a query endpoint `getUsers` that fetches a list of users from `https://jsonplaceholder.typicode.com/users`.
3. Register the `usersApi` reducer and middleware in your global `store.js` file.
4. Build a component `UsersList.tsx` that consumes the auto-generated hook `useGetUsersQuery()`.
5. Render a list of user names and emails on the screen, showing a loading indicator during fetching.
