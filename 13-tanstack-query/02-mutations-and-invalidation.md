# TanStack Query: Mutations & Cache Invalidation ⚡

This lesson covers **Mutations** (sending data modifications to a server like POST, PUT, DELETE requests), **Cache Invalidation** (informing TanStack Query that specific caches are outdated, triggering automatic background refreshes), the full **mutation lifecycle** (`onMutate` / `onError` / `onSuccess` / `onSettled`) with **optimistic updates**, `mutateAsync`, and **paginated queries** with `placeholderData` / `keepPreviousData`.

---

## 📖 Concept & Overview

So far we used `useQuery` to **read** data from a server. But real apps also need to **write** data — create a todo, edit a profile, delete a comment. In TanStack Query, every write goes through the **`useMutation`** hook. After a successful write, the data you previously cached is out of date, so you **invalidate** the affected query keys to trigger a fresh background fetch and keep the UI synchronized.

> [!NOTE]
> **Queries are reads; mutations are writes.** A `useQuery` runs automatically on mount and is keyed/cached. A `useMutation` does **nothing** until you explicitly call `mutate()` or `mutateAsync()`. Mutations are not cached by a query key — instead they expose a lifecycle (`onMutate` → `onError`/`onSuccess` → `onSettled`) that lets you react to each phase.

> [!TIP]
> The single most common pattern in real apps is: **mutate → on success, `invalidateQueries` the lists that changed.** If you remember only one thing from this lesson, remember that pairing. Optimistic updates (covered below) are an advanced refinement on top of it for instant-feeling UIs.

### 🍽️ A Real-World Metaphor: The Restaurant Order

Think of your **server database as a restaurant kitchen** and the **cache as the menu board** customers read:

- **`useQuery`** = reading the menu board. Fast, cached, everyone sees the same thing.
- **`useMutation`** = placing an order with the kitchen (a write). It only happens when *you* ask the waiter.
- **`onMutate`** = the waiter immediately writes your order on the board *before* the kitchen confirms (optimistic update). The board looks updated instantly.
- **`onError`** = the kitchen calls back saying "we're out of salmon!" — the waiter erases your order from the board (rollback).
- **`onSuccess`** = the kitchen confirms the dish is being made.
- **`onSettled`** = whatever happened, the waiter walks back to the kitchen to double-check the board matches reality (`invalidateQueries`).

### 🔀 `mutate` vs `mutateAsync`

| Feature | `mutate(vars)` | `mutateAsync(vars)` |
| --- | --- | --- |
| Return value | `void` (fire-and-forget) | A `Promise` |
| Error handling | Via `onError` callback | `try/catch` **or** `onError` |
| Use `await`? | No | Yes |
| Best for | Simple forms, button clicks | Sequencing multiple awaits, needing the result inline |
| Unhandled rejection risk | None | Yes — you must `catch` it |

---

## ⚡ 1. Data Mutations with `useMutation`

While `useQuery` is designed for fetching data, **`useMutation`** is used to create, update, or delete data on a backend server.

### Key Differences:
* `useQuery` runs automatically on component mount. `useMutation` does **not**; you trigger it manually by calling the `mutate(variables)` function.
* `useMutation` does not require a query key (though it can interact with cached keys inside callbacks such as `onSuccess`).

```jsx
import { useMutation } from '@tanstack/react-query';

// 1. Define async POST function
const createTodoApi = async (newTodo) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(newTodo),
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Could not create item!");
  return res.json();
};

export const AddTodoComponent = () => {
  // 2. Initialize useMutation hook
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createTodoApi,
    onSuccess: (data) => {
      alert(`Success! Created post ID: ${data.id}`);
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const title = new FormData(e.target).get("todoTitle");

    // 3. Trigger mutation manually
    mutate({ title, body: "Created via TanStack Query", userId: 1 });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="text" name="todoTitle" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Add Todo"}
      </button>
      {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
    </form>
  );
};
```

---

## ⚡ 2. Cache Invalidation (`invalidateQueries`)

When you mutate data on the server, the client-side cache of your queries becomes stale. To keep the UI synchronized, you tell TanStack Query to mark the old cache as outdated and fetch fresh data.

We do this by reading the client from the **`useQueryClient`** hook and calling **`invalidateQueries`** inside the mutation's `onSuccess` callback:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Assume fetchTodoList and createTodoApi are defined...

export const TodoListApp = () => {
  const queryClient = useQueryClient(); // 1. Access the global QueryClient

  // 2. Query to load list
  const { data: todos } = useQuery({
    queryKey: ['todosList'],
    queryFn: fetchTodoList
  });

  // 3. Mutation to add item
  const { mutate } = useMutation({
    mutationFn: createTodoApi,
    onSuccess: () => {
      // 4. CRITICAL: Invalidate and force a background refresh of todosList query key!
      queryClient.invalidateQueries({ queryKey: ['todosList'] });
    }
  });

  return (
    <div>
      {/* Todo list and AddTodo form render here */}
    </div>
  );
};
```

> [!WARNING]
> `invalidateQueries` is **prefix-based** by default. Calling `invalidateQueries({ queryKey: ['todos'] })` will also invalidate `['todos', 1]`, `['todos', 'details', 5]`, and any other key starting with `'todos'`. This is usually what you want, but if you need to invalidate a single exact key, pass `{ queryKey: ['todos', 1], exact: true }`.

---

## ⚡ 3. The Mutation Lifecycle: `onMutate` / `onError` / `onSuccess` / `onSettled`

Every `useMutation` accepts an options object with four lifecycle callbacks. They fire in a guaranteed order:

```
mutate() called
      │
      ▼
  onMutate(variables)        ← runs BEFORE the request. Return a "context" value.
      │
      ▼
  mutationFn(variables)      ← the actual async request
      │
   ┌──┴───────────────┐
   ▼                  ▼
onSuccess(data,    onError(error,
  vars, context)     vars, context)
   └──────┬───────────┘
          ▼
  onSettled(data, error, vars, context)   ← ALWAYS runs last (success OR failure)
```

| Callback | When it runs | Typical use |
| --- | --- | --- |
| `onMutate` | Before `mutationFn` | Cancel in-flight refetches, snapshot cache, apply optimistic update |
| `onSuccess` | After request resolves | Show toast, set query data with server response |
| `onError` | After request rejects | Roll back optimistic update using the snapshot |
| `onSettled` | After success **or** error | `invalidateQueries` to re-sync with the server |

---

## ⚡ 4. Optimistic Updates (instant-feeling UIs)

An **optimistic update** assumes the mutation will succeed and updates the cache *immediately*, before the server responds. If the server later rejects it, you roll back. This is the "waiter writes your order on the board before the kitchen confirms" pattern from the metaphor.

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id?: number;
  title: string;
  completed: boolean;
}

export const useAddTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTodo: Todo) => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json() as Promise<Todo>;
    },

    // 1. Runs BEFORE the request. Return a context object for rollback.
    onMutate: async (newTodo) => {
      // Stop any in-flight refetch so it can't overwrite our optimistic value.
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // Snapshot the current cache so we can restore it if the request fails.
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // Optimistically insert the new todo into the cache immediately.
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) => [
        ...old,
        { ...newTodo, id: Date.now() }, // temporary fake id
      ]);

      // Whatever we return here becomes `context` in onError / onSettled.
      return { previousTodos };
    },

    // 2. The server rejected — roll the cache back to the snapshot.
    onError: (_error, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    // 3. Success OR failure — re-sync with the server's real data.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};
```

> [!TIP]
> Always pair an optimistic update with `cancelQueries` (in `onMutate`) and `invalidateQueries` (in `onSettled`). Cancelling prevents a slow background refetch from clobbering your optimistic value; the final invalidate guarantees the cache eventually matches the source of truth on the server.

---

## ⚡ 5. `mutateAsync` — awaiting the result

`mutate` is fire-and-forget. When you need to `await` the result inline — for example to chain a second request, or to keep a submit handler in a single `try/catch` — use **`mutateAsync`**, which returns a Promise.

```tsx
import { useMutation } from '@tanstack/react-query';

export const PublishButton = () => {
  const { mutateAsync, isPending } = useMutation({ mutationFn: createTodoApi });

  const handlePublish = async () => {
    try {
      // mutateAsync returns the resolved data, so we can use it right away.
      const created = await mutateAsync({ title: "Draft", completed: false });
      console.log("Created todo id:", created.id);

      // Sequence a second dependent request after the first resolves.
      await notifyFollowers(created.id);
    } catch (err) {
      // Because mutateAsync rejects, we MUST catch here to avoid an
      // unhandled promise rejection. (mutate would never throw.)
      console.error("Publish failed:", err);
    }
  };

  return (
    <button onClick={handlePublish} disabled={isPending}>
      {isPending ? "Publishing..." : "Publish"}
    </button>
  );
};
```

---

## ⚡ 6. Paginated Queries with `placeholderData` / `keepPreviousData`

When you fetch one page at a time, changing the page changes the **query key** (e.g. `['todos', page]`), which by default makes the screen flash back to a loading state on every page change. To keep the previous page's data visible while the next page loads, use `placeholderData: keepPreviousData`.

> [!NOTE]
> In **TanStack Query v5**, the boolean option `keepPreviousData: true` was removed. Instead import the `keepPreviousData` helper and pass it as `placeholderData: keepPreviousData`. In v4 you used `keepPreviousData: true`. The behavior is the same — old data stays on screen during the next fetch.

```tsx
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Fetch a single page from the API.
const fetchTodos = async (page = 1, limit = 10): Promise<Todo[]> => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=${limit}`
  );
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export const PaginatedTodos = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, error, isLoading, isFetching, isPlaceholderData } = useQuery({
    // The page number is PART OF the query key, so each page is cached separately.
    queryKey: ['todos', currentPage],
    queryFn: () => fetchTodos(currentPage, pageSize),
    // Keep showing the previous page's rows while the next page loads.
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <h1>Loading...</h1>;
  if (error) return <h1>Error: {(error as Error).message}</h1>;

  return (
    <div>
      <h1>Todos — page {currentPage}</h1>
      <ul>
        {data?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>

      <div style={{ display: "flex", gap: 8 }}>
        {/* Go back, but never below page 1. */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous Page
        </button>

        {/* Disable "Next" while we are still showing placeholder data,
            so users can't skip ahead before the real data arrives. */}
        <button
          onClick={() => setCurrentPage((p) => p + 1)}
          disabled={isPlaceholderData}
        >
          Next Page
        </button>
      </div>

      {/* Subtle background-refresh indicator. */}
      {isFetching ? <span> Updating...</span> : null}
    </div>
  );
};
```

> [!TIP]
> `isFetching` (background refresh in progress) is different from `isLoading` (no cached data yet, first ever load). On page 2+, `isLoading` stays `false` because we kept previous data — use `isFetching` for a non-blocking "Updating..." indicator instead.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of mutations. Click **Reveal Answer** to verify.

### 1. Why doesn't `useMutation` run automatically when a component mounts?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMutation` is designed for side effects that write, update, or delete data, which should only happen in response to explicit user interactions like clicking a button or submitting a form. Running a mutation automatically on mount would cause duplicate writes and spam the database. Instead, the hook returns a `mutate` function for you to invoke on demand.
</details>

### 2. What does `queryClient.invalidateQueries({ queryKey: ['todos'] })` do under the hood?
<details>
  <summary><b>Reveal Answer</b></summary>

  It does two things:
  1. Marks any query with the key `['todos']` (and, by prefix, any key starting with `'todos'`) as stale.
  2. For queries that are currently active (rendered on screen), it immediately triggers a background refetch to sync the UI with the backend server.
</details>

### 3. In an optimistic update, what is the purpose of the value returned from `onMutate`, and where is it used?
<details>
  <summary><b>Reveal Answer</b></summary>

  The value returned from `onMutate` becomes the **`context`** argument passed to `onError` and `onSettled`. You typically snapshot the previous cache (e.g. `{ previousTodos }`) and return it, so that if the mutation fails, `onError` can roll the cache back with `queryClient.setQueryData(['todos'], context.previousTodos)`. You should also call `cancelQueries` in `onMutate` so an in-flight refetch can't overwrite your optimistic value.
</details>

### 4. What is the difference between `mutate` and `mutateAsync`, and what extra responsibility comes with `mutateAsync`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`mutate`** is fire-and-forget. It returns `void` and you handle results via lifecycle callbacks (`onSuccess`, `onError`). It never throws.
  - **`mutateAsync`** returns a **Promise**, so you can `await` it and use it inline (e.g. to sequence dependent requests). The extra responsibility: because it rejects on failure, you **must** wrap it in `try/catch` (or attach `.catch`) to avoid an unhandled promise rejection.
</details>

### 5. In TanStack Query v5, how do you keep the previous page's data visible while the next page loads, and how does `isFetching` differ from `isLoading` in that scenario?
<details>
  <summary><b>Reveal Answer</b></summary>

  Pass `placeholderData: keepPreviousData` (importing the `keepPreviousData` helper) to `useQuery`. The old boolean `keepPreviousData: true` from v4 was removed. With it set:
  - **`isLoading`** is `true` only when there is no cached data at all (the very first load). On page 2+, it stays `false` because the previous page's data is retained.
  - **`isFetching`** is `true` whenever a request is in flight, including background refreshes. Use `isFetching` (and `isPlaceholderData`) to show a non-blocking "Updating..." indicator instead of replacing the whole UI with a spinner.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Dynamic Contact List Creator
1. Create a component `ContactManager.tsx` (using `.tsx` extension).
2. Use `useQuery` to fetch a list of contacts from `https://jsonplaceholder.typicode.com/users` (Query Key: `['contacts']`).
3. Write a form with inputs for Name and Email.
4. Set up a `useMutation` utilizing `fetch` POST to create a contact.
5. In `onSuccess` (or `onSettled`), invalidate the `['contacts']` key to verify the list is refreshed in the background.
6. Display a loading spinner indicator on the Submit button while the mutation is pending (`isPending`).
7. **Stretch:** Convert the submit handler to use `mutateAsync` inside a `try/catch`, and `console.log` the created contact's `id` returned from the Promise.

### 🛠️ Exercise 2: Optimistic "Toggle Complete" with Rollback
1. Reuse a `['todos']` query that loads todos from `https://jsonplaceholder.typicode.com/todos?_limit=10`.
2. Build a `useToggleTodo` mutation whose `mutationFn` sends a `PATCH` to `/todos/:id` flipping `completed`.
3. In **`onMutate`**:
   - `await queryClient.cancelQueries({ queryKey: ['todos'] })`.
   - Snapshot the cache with `getQueryData(['todos'])`.
   - Optimistically flip the toggled todo's `completed` flag using `setQueryData`.
   - Return `{ previousTodos }` as context.
4. In **`onError`**, restore the snapshot from `context.previousTodos`.
5. In **`onSettled`**, call `invalidateQueries({ queryKey: ['todos'] })`.
6. **Verify the rollback:** temporarily make the `mutationFn` throw an error and confirm the checkbox visibly flips, then snaps back.

### 🛠️ Exercise 3: Paginated Posts Viewer
1. Create `PaginatedPosts.tsx` with a `currentPage` state (initial `1`).
2. Query `['posts', currentPage]` from `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`.
3. Add `placeholderData: keepPreviousData`.
4. Render Previous/Next buttons. Disable Previous when `currentPage === 1`, and disable Next while `isPlaceholderData` is `true`.
5. Show an "Updating..." label driven by `isFetching` (not `isLoading`), and confirm the list does **not** flash empty when paging.
