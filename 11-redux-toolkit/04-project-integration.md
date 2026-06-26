# 🛒 Project: Products Dashboard (Slice + RTK Query) 📊

In the previous lessons you learned the two halves of Redux Toolkit separately: **`createSlice`** for hand-written client state, and **RTK Query** (`createApi`) for fetching and caching server data. This project lesson finally puts them *side by side in one store*, because that is exactly how real apps are wired.

You will build a **Products Dashboard**: a screen that lists products fetched from a REST API (RTK Query), lets an admin **add / edit / delete** products (mutations that auto-refetch the list via cache tags), and a **shopping-cart panel** whose items, quantities, and total live in a plain `createSlice`. By the end you will own a mental model — the single most useful rule in Redux Toolkit — for *which* tool owns *which* piece of state.

> [!NOTE]
> The recorded transcript builds the products `getProducts / addProduct / updateProduct / deleteProduct` flow with RTK Query against `dummyjson.com`. The **`cartSlice` integration** — combining a hand-written slice with an API service in the *same* `configureStore`, plus the "server-state vs client-state" rule of thumb — is **NET-NEW** material beyond the recording. It is taught here with current Redux Toolkit 2.x best practices.

---

## ⚡ 1. Concept & Overview: Two Owners, One Store

A Redux store is a single object, but the *data* inside it has two completely different origins:

- **Server state** — data that lives on a backend and that you merely *borrow*: products, users, orders. You did not create it; you fetch it, it can go stale, and it can change without your app knowing. **RTK Query owns this.**
- **Client / UI state** — data your app *invents* and fully owns: the cart contents, a "dark mode" toggle, which modal is open, a multi-step form's draft. The server never knew about it until you decide to send it. **`createSlice` owns this.**

### 🧩 Real-world metaphor: the restaurant

Think of your app as a **restaurant**.

- **RTK Query is the kitchen.** You (the waiter) shout an order ("get me all products!"). The kitchen cooks it, and — crucially — *remembers* the dish on a warming shelf (the **cache**) so the next table asking for the same thing gets it instantly. When an ingredient changes (a product is edited), the kitchen throws out the stale plate and re-cooks it (**tag invalidation**). You never store the food in your pocket; you ask the kitchen every time and trust its shelf.
- **The `cartSlice` is the customer's own tray.** What the diner piles onto their tray — three burgers, one salad — is *theirs*. The kitchen has no idea what's on the tray until the diner walks to the register to pay (the checkout mutation). The tray lives entirely on the customer's side.

Mixing these up is the classic beginner mistake: people copy fetched products *into* a slice with `useEffect` + `dispatch`, then fight to keep that copy in sync forever. Don't. Let the kitchen keep the food.

### Comparison table

| Question | RTK Query (`createApi`) | Slice (`createSlice`) |
| --- | --- | --- |
| What data? | **Server** state (products, users) | **Client/UI** state (cart, theme, modals) |
| Source of truth | The backend | Your app |
| Created with | `createApi` + `endpoints` | `createSlice` + `reducers` |
| You write reducers? | No — generated for you | Yes — by hand |
| Caching / refetch | Built-in, automatic | None — it's just memory |
| Stale data handling | Tags + `invalidatesTags` | N/A (you own it) |
| Components read via | Auto-generated hooks (`useGetProductsQuery`) | `useSelector` |
| Components write via | Mutation hooks (`useAddProductMutation`) | `useDispatch(action())` |

```
                       ┌─────────────────────────────────────┐
                       │           configureStore             │
                       │                                      │
   ┌───────────────┐   │  reducer: {                          │
   │  Backend API  │◀──┼──  [productsApi.reducerPath]: …      │ ← SERVER state
   │ (dummyjson)   │──▶│    cart: cartReducer                 │ ← CLIENT state
   └───────────────┘   │  }                                   │
                       │  middleware: + productsApi.middleware│
                       └─────────────────────────────────────┘
                                  ▲                    ▲
        useGetProductsQuery() ────┘                    └──── useSelector(selectCartItems)
        useAddProductMutation()                              useDispatch(addToCart(...))
```

---

## 🛠️ 2. Project Setup

We use a Vite + React + TypeScript app. Install Redux Toolkit and the React bindings.

```bash
# Scaffold (skip if you already have an app)
npm create vite@latest products-dashboard -- --template react-ts
cd products-dashboard

# Redux Toolkit ships createSlice AND createApi (RTK Query) in one package.
# react-redux gives us the typed hooks and <Provider>.
npm install @reduxjs/toolkit react-redux
```

Folder structure we are building toward:

```
src/
├── app/
│   ├── store.ts          # configureStore — wires BOTH owners
│   └── hooks.ts          # typed useAppDispatch / useAppSelector
├── features/
│   ├── products/
│   │   └── productsApi.ts # RTK Query service (server state)
│   └── cart/
│       └── cartSlice.ts   # createSlice (client state)
├── components/
│   ├── ProductList.tsx
│   ├── ProductForm.tsx
│   └── CartPanel.tsx
├── App.tsx
└── main.tsx
```

> [!TIP]
> The folder names matter less than the *boundary*. Keep everything one feature owns inside its folder (`features/cart/`), and keep cross-cutting wiring (`store.ts`, `hooks.ts`) in `app/`. This is the official Redux "feature folder" convention and it scales to large apps.

---

## 🧩 3. The Server-State Half — `productsApi` (RTK Query)

`createApi` defines a **service**: a base URL plus a set of **endpoints**. Each endpoint is either a **query** (reads data) or a **mutation** (changes data). RTK Query then *generates React hooks for you*, named `use` + EndpointName + `Query`/`Mutation`.

We target the free `https://dummyjson.com/products` API. First, the shared types so the whole feature is fully typed.

```typescript
// src/features/products/productsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ---- Domain types (shape of the data the API returns) ----
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
}

// dummyjson wraps the list in a paginated envelope.
interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// Payload we send when CREATING a product (no id yet — server assigns it).
export type NewProduct = Pick<Product, "title" | "description" | "price" | "category">;

// Payload for UPDATING: an id plus any subset of editable fields.
export interface UpdateProductArg {
  id: number;
  changes: Partial<NewProduct>;
}

export const productsApi = createApi({
  // reducerPath is the key this service occupies inside the store.
  reducerPath: "productsApi",

  // fetchBaseQuery is a tiny fetch wrapper. baseUrl is prepended to every endpoint url.
  baseQuery: fetchBaseQuery({ baseUrl: "https://dummyjson.com" }),

  // Tags are the cache-invalidation system. We declare every tag type up front.
  tagTypes: ["Products"],

  endpoints: (builder) => ({
    // -------- QUERY: read the product list --------
    // <return type, argument type>. Argument is void because we take no args.
    getProducts: builder.query<Product[], void>({
      query: () => "/products",
      // The API returns { products: [...] }. transformResponse unwraps it
      // so our hook hands components a clean Product[].
      transformResponse: (response: ProductsResponse) => response.products,
      // Tag the whole list AND each individual item id. This lets a mutation
      // invalidate either "the whole list" or "just product 5".
      providesTags: (result) =>
        result
          ? [
              ...result.map((p) => ({ type: "Products" as const, id: p.id })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    // -------- MUTATION: add a product --------
    addProduct: builder.mutation<Product, NewProduct>({
      query: (body) => ({
        url: "/products/add",
        method: "POST",
        body,
      }),
      // Adding a product means the LIST is now stale -> refetch getProducts.
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    // -------- MUTATION: update a product --------
    updateProduct: builder.mutation<Product, UpdateProductArg>({
      query: ({ id, changes }) => ({
        url: `/products/${id}`,
        method: "PUT", // dummyjson accepts PUT/PATCH for edits
        body: changes,
      }),
      // Only the edited item (and the list it appears in) is stale.
      invalidatesTags: (_result, _error, arg) => [
        { type: "Products", id: arg.id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // -------- MUTATION: delete a product --------
    deleteProduct: builder.mutation<{ id: number; isDeleted: boolean }, number>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

// RTK Query generated these hooks for us — one per endpoint.
export const {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
```

> [!NOTE]
> **The hook-naming magic.** You never *write* `useGetProductsQuery`. RTK Query takes your endpoint name (`getProducts`), capitalises the first letter, prefixes `use`, and suffixes `Query` (for queries) or `Mutation` (for mutations). Rename the endpoint to `getAllProducts` and the hook automatically becomes `useGetAllProductsQuery`. This is the "behind-the-scenes string building" the instructor demonstrates.

> [!WARNING]
> `dummyjson.com` is a **mock/fake** backend. Its mutations return a realistic response (`POST /products/add` gives you back a new product with `id: 195`) but **do not actually persist** anything. So after `addProduct` succeeds, the `invalidatesTags` refetch of `/products` will *not* show your new row — that's the fake API, not a bug in your tags. Against a real backend that truly saves, the refetched list would contain it.

### How tags drive automatic refetching

This is the payoff of separating server state. You never manually "add the product to the list in state." Instead:

```
1. User clicks "Add"  ──▶  useAddProductMutation fires POST /products/add
2. Mutation succeeds  ──▶  it carries invalidatesTags: [{ Products, id: "LIST" }]
3. RTK Query sees the "Products/LIST" tag is now dirty
4. Any mounted useGetProductsQuery (which PROVIDES that tag) auto-refetches
5. The list re-renders with fresh server data — zero manual sync code
```

---

## 🧩 4. The Client-State Half — `cartSlice` (`createSlice`)

The cart is pure client state. The server has no idea what's in it until checkout, so we manage it with a hand-written slice. `createSlice` lets us write "mutating" logic (via Immer, which produces a correct immutable update under the hood).

```typescript
// src/features/cart/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../products/productsApi";

// A cart line = the product plus how many of it the user wants.
export interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add a product to the cart. If it's already there, just bump quantity.
    // Note we accept the API's Product type and copy only the fields we need.
    addToCart: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      const existing = state.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += 1; // Immer makes this safe & immutable
      } else {
        state.items.push({
          id: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
        });
      }
    },

    // Remove a line entirely by product id.
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    // Decrease quantity by one; drop the line if it hits zero.
    decrementQuantity: (state, action: PayloadAction<number>) => {
      const existing = state.items.find((item) => item.id === action.payload);
      if (!existing) return;
      existing.quantity -= 1;
      if (existing.quantity <= 0) {
        state.items = state.items.filter((item) => item.id !== action.payload);
      }
    },

    // Empty the cart (e.g. after a successful checkout).
    clearCart: (state) => {
      state.items = [];
    },
  },
});

// Action creators — generated from the reducer keys above.
export const { addToCart, removeFromCart, decrementQuantity, clearCart } =
  cartSlice.actions;

// The reducer goes into the store.
export default cartSlice.reducer;

// ---- Selectors: derive read-only views of cart state ----
// We import RootState lazily via a type-only param to avoid a circular import;
// see hooks.ts for the canonical typed selectors. These take the cart slice.
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

// The headline derived value: total price across all lines.
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
```

> [!TIP]
> Notice `selectCartTotal` is a **selector**, not a stored field. Never store derived data (a total you can recompute) in the slice — store the minimal source (`items`) and *derive* the rest. If you stored `total` too, you'd have to remember to update it in every reducer, and it would eventually drift out of sync.

---

## 🧩 5. Wiring BOTH Into `configureStore`

Here is where the two owners meet. The API service contributes **three** things to the store: a reducer (under its `reducerPath`), a middleware (for caching/refetching), and we opt into automatic refetch-on-focus with `setupListeners`. The cart contributes just a normal reducer.

```typescript
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { productsApi } from "../features/products/productsApi";
import cartReducer from "../features/cart/cartSlice";

export const store = configureStore({
  reducer: {
    // SERVER state: the API mounts itself under its own reducerPath key.
    // Use the computed-property name so the key always matches the service.
    [productsApi.reducerPath]: productsApi.reducer,

    // CLIENT state: an ordinary hand-written reducer.
    cart: cartReducer,
  },

  // RTK Query needs its middleware added for caching, invalidation, polling, etc.
  // getDefaultMiddleware already includes thunk + dev checks; we concat the API's.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect behaviour (optional but nice).
setupListeners(store.dispatch);

// ---- Infer the store's types ONCE, here, and reuse everywhere ----
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Pre-typed hooks so you never import RootState/AppDispatch in components.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

> [!WARNING]
> Forgetting `.concat(productsApi.middleware)` is the most common RTK Query setup bug. Without it, your queries will *fire once* but caching, tag invalidation, and automatic refetching silently stop working — and you'll get a console warning. Likewise, the reducer key **must** be `[productsApi.reducerPath]` (a computed key), not a literal string you typed yourself, so the two can never drift apart.

Finally, provide the store to the React tree:

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
```

---

## 🛠️ 6. Building the UI

### 🧩 6a. `ProductList` — read server state, add to client cart

This component reads from **both** owners: it *queries* products (RTK Query) and *dispatches* `addToCart` (slice). It also wires the delete mutation.

```tsx
// src/components/ProductList.tsx
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../features/products/productsApi";
import { useAppDispatch } from "../app/hooks";
import { addToCart } from "../features/cart/cartSlice";

export function ProductList() {
  // RTK Query hook: returns data + the full status flags the instructor shows.
  const { data: products, isLoading, isError } = useGetProductsQuery();

  // Mutation hook returns [trigger, { status }]. We grab the delete in-flight flag.
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const dispatch = useAppDispatch();

  if (isLoading) return <h2>Loading products…</h2>;
  if (isError || !products) return <h2>Oh no — failed to load products.</h2>;

  return (
    <section>
      <h2>Products ({products.length})</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {products.slice(0, 10).map((product) => (
          <li
            key={product.id}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              borderBottom: "1px solid #ddd",
              padding: "0.5rem 0",
            }}
          >
            <img src={product.thumbnail} alt={product.title} width={48} height={48} />
            <span style={{ flex: 1 }}>
              <strong>{product.title}</strong> — ${product.price}
            </span>

            {/* CLIENT state action: drop this product onto the cart tray. */}
            <button onClick={() => dispatch(addToCart(product))}>Add to cart</button>

            {/* SERVER state action: delete; the list auto-refetches via tags. */}
            <button
              disabled={isDeleting}
              onClick={() => deleteProduct(product.id)}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### 🧩 6b. `ProductForm` — add & edit via mutations

```tsx
// src/components/ProductForm.tsx
import { useState, type FormEvent } from "react";
import {
  useAddProductMutation,
  type NewProduct,
} from "../features/products/productsApi";

export function ProductForm() {
  // Controlled local form state — this is UI state too local to need Redux.
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  // [trigger, result] tuple. isLoading lets us disable the button while in flight.
  const [addProduct, { isLoading, isSuccess, data }] = useAddProductMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newProduct: NewProduct = {
      title,
      description: "Added from the dashboard",
      price: Number(price) || 0,
      category: "misc",
    };
    try {
      // .unwrap() throws on error so try/catch works naturally.
      await addProduct(newProduct).unwrap();
      setTitle("");
      setPrice("");
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.5rem", maxWidth: 320 }}>
      <h3>Add a product</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        placeholder="Price"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Saving…" : "Add product"}
      </button>

      {/* dummyjson echoes the created product back with a fresh id. */}
      {isSuccess && data && (
        <p>Created “{data.title}” (id {data.id}).</p>
      )}
    </form>
  );
}
```

### 🧩 6c. `CartPanel` — pure client state with a derived total

```tsx
// src/components/CartPanel.tsx
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  removeFromCart,
  decrementQuantity,
  addToCart,
  clearCart,
  selectCartItems,
  selectCartCount,
  selectCartTotal,
} from "../features/cart/cartSlice";
import type { Product } from "../features/products/productsApi";

export function CartPanel() {
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal); // derived, not stored
  const dispatch = useAppDispatch();

  return (
    <aside
      style={{ border: "1px solid #ccc", borderRadius: 8, padding: "1rem", minWidth: 280 }}
    >
      <h2>🛒 Cart ({count})</h2>

      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li key={item.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ flex: 1 }}>
                {item.title} × {item.quantity}
              </span>
              {/* addToCart expects a Product; reconstruct the minimal shape. */}
              <button
                onClick={() =>
                  dispatch(addToCart({ ...item } as unknown as Product))
                }
              >
                +
              </button>
              <button onClick={() => dispatch(decrementQuantity(item.id))}>−</button>
              <button onClick={() => dispatch(removeFromCart(item.id))}>✕</button>
            </li>
          ))}
        </ul>
      )}

      <hr />
      <p>
        <strong>Total: ${total.toFixed(2)}</strong>
      </p>
      {items.length > 0 && (
        <button onClick={() => dispatch(clearCart())}>Clear cart</button>
      )}
    </aside>
  );
}
```

### 🧩 6d. `App` — compose the dashboard

```tsx
// src/App.tsx
import { ProductList } from "./components/ProductList";
import { ProductForm } from "./components/ProductForm";
import { CartPanel } from "./components/CartPanel";

export default function App() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "1rem" }}>
      <h1>Products Dashboard</h1>
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <ProductForm />
          <ProductList />
        </div>
        {/* Client-state panel sits beside the server-state list. */}
        <CartPanel />
      </div>
    </main>
  );
}
```

That's the whole loop: products flow *in* from the kitchen (RTK Query), the cart fills up on the customer's tray (slice), and a single store holds both without either stepping on the other.

---

## 🧠 Test Your Knowledge

**1. Why do we manage `products` with RTK Query but the `cart` with `createSlice`?**

<details>
  <summary><b>Reveal Answer</b></summary>

  Because they are different *kinds* of state. Products are **server state** — they live on the backend, you only borrow them, and they can go stale, so RTK Query's caching + tag-invalidation handles fetching and keeping them fresh for you. The cart is **client/UI state** — your app invents and fully owns it; the server doesn't know about it until checkout. The rule of thumb: **RTK Query owns server state, slices own client state.** Copying fetched products into a slice creates a duplicate you must manually keep in sync forever — the exact problem RTK Query was built to remove.
</details>

**2. You added a product successfully but the list didn't refetch. Two plausible causes?**

<details>
  <summary><b>Reveal Answer</b></summary>

  (a) **Missing or mismatched tags.** The `addProduct` mutation must `invalidatesTags` a tag that `getProducts` `providesTags`. If `getProducts` provides `{ type: "Products", id: "LIST" }` but the mutation invalidates only `"Product"` (wrong name) nothing refetches. (b) **`productsApi.middleware` not added** in `configureStore`, so the whole invalidation engine is inert. A third, sneaky cause specific to this project: `dummyjson` is a **fake** API that doesn't persist, so even a correct refetch returns the original list without your new item.
</details>

**3. Where do `useGetProductsQuery` and `useAddProductMutation` come from — did we write them?**

<details>
  <summary><b>Reveal Answer</b></summary>

  No. RTK Query **generates** them from your endpoint definitions. It takes the endpoint name (`getProducts`), capitalises it, prefixes `use`, and suffixes `Query` (for `builder.query`) or `Mutation` (for `builder.mutation`) → `useGetProductsQuery`, `useAddProductMutation`. You export them from the `productsApi` object. Rename the endpoint and the hook name changes to match automatically.
</details>

**4. Why is `selectCartTotal` a selector instead of a `total` field stored in `cartState`?**

<details>
  <summary><b>Reveal Answer</b></summary>

  Because the total is **derived data** — it can always be recomputed from `items` (`sum of price × quantity`). Storing it separately means every reducer (`addToCart`, `removeFromCart`, `decrementQuantity`, `clearCart`) would have to remember to recalculate it, and the moment one forgets, the stored total drifts out of sync with the real items. Store the minimal source of truth (`items`) and derive everything else with selectors. (For expensive derivations, wrap the selector in `createSelector` to memoize it.)
</details>

**5. What three things does `productsApi` contribute to `configureStore`, and what breaks if you omit the middleware?**

<details>
  <summary><b>Reveal Answer</b></summary>

  (1) A **reducer**, mounted under `[productsApi.reducerPath]`. (2) A **middleware**, added via `getDefaultMiddleware().concat(productsApi.middleware)`. (3) Indirectly, listener behaviour via `setupListeners(store.dispatch)` for refetch-on-focus/reconnect. If you omit the middleware, queries still fire once but **caching, tag invalidation, automatic refetching, and polling stop working** — mutations will no longer cause the list to refresh, and you'll see a console warning about the missing middleware.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1 — Add `updateProduct` editing to the UI

The `productsApi` already exposes `useUpdateProductMutation` and an `UpdateProductArg` type, but no component uses it yet. Build an **inline edit** so each product row can have its price changed.

**Tasks:**
1. In `ProductList`, add an "Edit" button per row that toggles a small inline input for the new price.
2. Call `updateProduct({ id, changes: { price: newPrice } })` and `.unwrap()` it.
3. Disable the row's controls while `isLoading` is true.
4. Confirm (conceptually) that the edited row + the list both carry stale tags, so `getProducts` refetches.

**Starter:**

```tsx
// Inside ProductList.tsx
import { useState } from "react";
import { useUpdateProductMutation } from "../features/products/productsApi";

function EditableRow({ id, title, price }: { id: number; title: string; price: number }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(price));
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  async function save() {
    // TODO: call updateProduct with { id, changes: { price: Number(draft) } }
    // TODO: .unwrap(), then setEditing(false)
  }

  return (
    <li>
      <strong>{title}</strong> — ${price}
      {editing ? (
        <>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button disabled={isLoading} onClick={save}>
            {isLoading ? "Saving…" : "Save"}
          </button>
        </>
      ) : (
        <button onClick={() => setEditing(true)}>Edit</button>
      )}
    </li>
  );
}
```

### 🛠️ Exercise 2 — A `checkout` flow that bridges both worlds

Right now the cart lives only on the client. Add a checkout that *sends* the cart to the server, then clears it — the moment client state crosses into server state.

**Tasks:**
1. Add a `checkout` mutation to `productsApi` (`POST /carts/add` on dummyjson) whose argument is the cart `items`.
2. Add a `CheckoutButton` component using `useCheckoutMutation`.
3. On success, `dispatch(clearCart())` so the tray empties after the kitchen takes the order.
4. Show an "Order #123 placed!" confirmation from the mutation's returned data.

**Starter:**

```typescript
// Add to productsApi endpoints:
checkout: builder.mutation<{ id: number }, { products: { id: number; quantity: number }[] }>({
  query: (body) => ({
    url: "/carts/add",
    method: "POST",
    body: { userId: 1, ...body },
  }),
  // A cart submission doesn't change the product LIST, so no invalidatesTags needed.
}),
// Then export useCheckoutMutation from the generated hooks.
```

```tsx
// CheckoutButton.tsx — wire client cart -> server mutation -> clear client cart
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectCartItems, clearCart } from "../features/cart/cartSlice";
import { useCheckoutMutation } from "../features/products/productsApi";

export function CheckoutButton() {
  const items = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  const [checkout, { isLoading }] = useCheckoutMutation();

  async function handleCheckout() {
    // TODO: map items -> { id, quantity }, call checkout(...).unwrap()
    // TODO: on success dispatch(clearCart())
  }

  return (
    <button disabled={isLoading || items.length === 0} onClick={handleCheckout}>
      {isLoading ? "Placing order…" : "Checkout"}
    </button>
  );
}
```

---

### Recap

- **One store, two owners.** RTK Query holds server state (products); `createSlice` holds client state (cart). Wire both into `configureStore`.
- **Server-state writes never touch a slice.** Mutations + `providesTags`/`invalidatesTags` keep the cached list fresh automatically — no manual sync.
- **Client-state derives, never duplicates.** Store `items`; compute `selectCartTotal` on the fly.
- **The hooks are free.** `useGetProductsQuery`, `useAddProductMutation`, etc. are generated from your endpoint names — you only export them.
- **The boundary is the skill.** Knowing *which* tool owns a piece of state is the single most valuable Redux Toolkit instinct, and this dashboard exercises both sides of it at once.
