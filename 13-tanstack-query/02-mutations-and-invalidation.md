# TanStack Query: Mutations & Cache Invalidation ⚡

This lesson covers **Mutations** (sending data modifications to a server like POST, PUT, DELETE requests) and **Cache Invalidation** (informing TanStack Query that specific caches are outdated, triggering automatic background refreshes).

---

## ⚡ 1. Data Mutations with `useMutation`

While `useQuery` is designed for fetching data, **`useMutation`** is used to create, update, or delete data on a backend server. 

### Key Differences:
* `useQuery` runs automatically on component mount. `useMutation` does **not**; you trigger it manually by calling the `mutate(variables)` function.
* `useMutation` does not require query keys (though it can interact with them during onSuccess cycles).

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

When you mutate data on the server, the client-side cache of your queries becomes outdated (stale). To keep the UI synchronized, you must tell TanStack Query to throw away the old cache and fetch fresh data.

We do this by instantiating the **`useQueryClient`** hook and calling **`invalidateQueries`** inside the mutation's `onSuccess` callback:

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

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of mutations. Click **Reveal Answer** to verify.

### 1. Why doesn't `useMutation` run automatically when a component mounts?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMutation` is designed for side effects that write, update, or delete data (which should only happen due to explicit user interactions like clicking a button or submitting a form). Running them automatically on mount would cause duplicate writes and database spam. Instead, it returns a `mutate` function for you to invoke on-demand.
</details>

### 2. What does `queryClient.invalidateQueries({ queryKey: ['todos'] })` do under the hood?
<details>
  <summary><b>Reveal Answer</b></summary>

  It does two things:
  1. Marks any active queries with key `['todos']` as stale.
  2. If the queries are currently rendered on screen, it immediately triggers a background refetch to sync the UI with the backend server database automatically.
</details>

### 3. What is the difference between `mutate` and `mutateAsync` returned by `useMutation`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`mutate`** is a fire-and-forget function. It does not return a Promise and you handle results via lifecycle callbacks (`onSuccess`, `onError`).
  - **`mutateAsync`** returns a standard Promise. This allows you to use `try/catch` and `await` directly in your component's event handlers, which is useful when sequencing multiple async operations.
</details>

### 4. What lifecycle callbacks does the `useMutation` options object support?
<details>
  <summary><b>Reveal Answer</b></summary>

  It supports:
  - **`onMutate`**: Runs before the mutation function executes. Ideal for optimistic UI updates.
  - **`onSuccess`**: Runs when the mutation successfully completes, receiving the response payload.
  - **`onError`**: Runs if the mutation encounters an error, receiving the error object.
  - **`onSettled`**: Runs when the mutation finishes, regardless of success or failure.
</details>

### 5. If we have a query key `['todos', 'details', 5]`, does invalidating `['todos']` affect it?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. By default, query key invalidation is **prefix-based**. Calling `invalidateQueries({ queryKey: ['todos'] })` will match and invalidate any query key that begins with `'todos'`, including `['todos']`, `['todos', 'list']`, and `['todos', 'details', 5]`. To target a key exactly, add the option `{ exact: true }`.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Dynamic Contact List Creator
1. Create a component `ContactManager.tsx` (using `.tsx` extension).
2. Use `useQuery` to fetch a list of contacts from `https://jsonplaceholder.typicode.com/users` (Query Key: `['contacts']`).
3. Write a form with inputs for Name and Email.
4. Set up a `useMutation` utilizing `fetch` POST to create a contact.
5. In `onSuccess`, invalidate the `['contacts']` key to verify the list is refreshed in the background.
6. Display a loading spinner indicator on the Submit button while the mutation is pending.
