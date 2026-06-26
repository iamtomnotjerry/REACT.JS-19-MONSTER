# 🛒 Dự án: Products Dashboard (Slice + RTK Query) 📊

Trong các bài học trước, bạn đã học hai nửa của Redux Toolkit một cách riêng rẽ: **`createSlice`** cho client state viết tay, và **RTK Query** (`createApi`) để fetch và cache dữ liệu server. Bài học dự án này cuối cùng đặt cả hai *cạnh nhau trong cùng một store*, bởi vì đó chính xác là cách các ứng dụng thực tế được đấu dây.

Bạn sẽ xây dựng một **Products Dashboard**: một màn hình liệt kê các sản phẩm được fetch từ một REST API (RTK Query), cho phép admin **thêm / sửa / xóa** sản phẩm (các mutation tự động refetch danh sách thông qua cache tags), và một **panel giỏ hàng** mà các item, số lượng, và tổng tiền của nó nằm trong một `createSlice` thuần. Đến cuối bài, bạn sẽ sở hữu một mô hình tư duy — quy tắc hữu ích nhất trong Redux Toolkit — về việc *công cụ nào* sở hữu *phần state nào*.

> [!NOTE]
> Bản ghi hình hướng dẫn xây dựng luồng products `getProducts / addProduct / updateProduct / deleteProduct` với RTK Query nhắm vào `dummyjson.com`. Phần **tích hợp `cartSlice`** — kết hợp một slice viết tay với một API service trong *cùng* một `configureStore`, cùng với quy tắc ngón tay cái "server-state vs client-state" — là tài liệu **HOÀN TOÀN MỚI** vượt ra ngoài bản ghi hình. Nó được giảng dạy ở đây với các best practice hiện hành của Redux Toolkit 2.x.

---

## ⚡ 1. Khái niệm & Tổng quan: Hai Chủ Sở Hữu, Một Store

Một Redux store là một object duy nhất, nhưng *dữ liệu* bên trong nó có hai nguồn gốc hoàn toàn khác nhau:

- **Server state** — dữ liệu nằm trên backend và bạn chỉ *mượn*: products, users, orders. Bạn không tạo ra nó; bạn fetch nó, nó có thể trở nên cũ (stale), và nó có thể thay đổi mà ứng dụng của bạn không hề hay biết. **RTK Query sở hữu phần này.**
- **Client / UI state** — dữ liệu mà ứng dụng của bạn *tự tạo ra* và sở hữu hoàn toàn: nội dung giỏ hàng, một toggle "dark mode", modal nào đang mở, bản nháp của một form nhiều bước. Server không hề biết về nó cho đến khi bạn quyết định gửi đi. **`createSlice` sở hữu phần này.**

### 🧩 Phép ẩn dụ thực tế: nhà hàng

Hãy nghĩ về ứng dụng của bạn như một **nhà hàng**.

- **RTK Query là nhà bếp.** Bạn (người phục vụ) hô một order ("lấy cho tôi tất cả sản phẩm!"). Nhà bếp nấu nó, và — quan trọng nhất — *ghi nhớ* món ăn trên một kệ giữ ấm (đó là **cache**) để bàn tiếp theo hỏi cùng món đó nhận được ngay lập tức. Khi một nguyên liệu thay đổi (một sản phẩm được sửa), nhà bếp vứt bỏ đĩa cũ và nấu lại (**tag invalidation**). Bạn không bao giờ cất đồ ăn trong túi; bạn hỏi nhà bếp mỗi lần và tin tưởng vào cái kệ của nó.
- **`cartSlice` là cái khay của chính khách hàng.** Những gì thực khách chất lên khay của họ — ba cái burger, một đĩa salad — là *của họ*. Nhà bếp không hề biết trên khay có gì cho đến khi thực khách đi đến quầy thu ngân để thanh toán (mutation checkout). Cái khay hoàn toàn nằm ở phía khách hàng.

Nhầm lẫn hai thứ này là sai lầm kinh điển của người mới: người ta copy các sản phẩm đã fetch *vào* một slice bằng `useEffect` + `dispatch`, rồi vật lộn để giữ bản sao đó đồng bộ mãi mãi. Đừng làm vậy. Hãy để nhà bếp giữ đồ ăn.

### Bảng so sánh

| Câu hỏi | RTK Query (`createApi`) | Slice (`createSlice`) |
| --- | --- | --- |
| Dữ liệu gì? | **Server** state (products, users) | **Client/UI** state (cart, theme, modals) |
| Nguồn chân lý | Backend | Ứng dụng của bạn |
| Tạo bằng | `createApi` + `endpoints` | `createSlice` + `reducers` |
| Bạn viết reducer? | Không — được tạo sẵn cho bạn | Có — viết bằng tay |
| Caching / refetch | Tích hợp sẵn, tự động | Không — chỉ là bộ nhớ |
| Xử lý dữ liệu cũ | Tags + `invalidatesTags` | Không áp dụng (bạn sở hữu nó) |
| Component đọc qua | Hook tự sinh (`useGetProductsQuery`) | `useSelector` |
| Component ghi qua | Hook mutation (`useAddProductMutation`) | `useDispatch(action())` |

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

## 🛠️ 2. Thiết lập Dự án

Chúng ta dùng một ứng dụng Vite + React + TypeScript. Cài đặt Redux Toolkit và phần binding cho React.

```bash
# Scaffold (skip if you already have an app)
npm create vite@latest products-dashboard -- --template react-ts
cd products-dashboard

# Redux Toolkit ships createSlice AND createApi (RTK Query) in one package.
# react-redux gives us the typed hooks and <Provider>.
npm install @reduxjs/toolkit react-redux
```

Cấu trúc thư mục mà chúng ta đang hướng tới:

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
> Tên thư mục ít quan trọng hơn *ranh giới*. Hãy giữ mọi thứ mà một feature sở hữu bên trong thư mục của nó (`features/cart/`), và giữ phần đấu dây xuyên suốt (`store.ts`, `hooks.ts`) trong `app/`. Đây là quy ước "feature folder" chính thức của Redux và nó mở rộng tốt cho các ứng dụng lớn.

---

## 🧩 3. Nửa Server-State — `productsApi` (RTK Query)

`createApi` định nghĩa một **service**: một base URL cộng với một tập hợp các **endpoint**. Mỗi endpoint hoặc là một **query** (đọc dữ liệu) hoặc là một **mutation** (thay đổi dữ liệu). Sau đó RTK Query *tự sinh các React hook cho bạn*, được đặt tên là `use` + EndpointName + `Query`/`Mutation`.

Chúng ta nhắm tới API miễn phí `https://dummyjson.com/products`. Đầu tiên, các type dùng chung để toàn bộ feature được type đầy đủ.

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
> **Phép màu đặt tên hook.** Bạn không bao giờ *viết* `useGetProductsQuery`. RTK Query lấy tên endpoint của bạn (`getProducts`), viết hoa chữ cái đầu, thêm tiền tố `use`, và thêm hậu tố `Query` (cho query) hoặc `Mutation` (cho mutation). Đổi tên endpoint thành `getAllProducts` và hook tự động trở thành `useGetAllProductsQuery`. Đây chính là phần "xây dựng chuỗi đằng sau hậu trường" mà người hướng dẫn trình diễn.

> [!WARNING]
> `dummyjson.com` là một backend **giả/mock**. Các mutation của nó trả về một response thực tế (`POST /products/add` trả lại cho bạn một sản phẩm mới với `id: 195`) nhưng **không thực sự lưu trữ (persist)** bất cứ thứ gì. Vì vậy sau khi `addProduct` thành công, việc refetch `/products` do `invalidatesTags` kích hoạt sẽ *không* hiển thị dòng mới của bạn — đó là do API giả, không phải lỗi trong các tag của bạn. Đối với một backend thực sự lưu dữ liệu, danh sách được refetch sẽ chứa nó.

### Cách các tag điều khiển refetch tự động

Đây là phần lợi ích của việc tách biệt server state. Bạn không bao giờ tự tay "thêm sản phẩm vào danh sách trong state." Thay vào đó:

```
1. User clicks "Add"  ──▶  useAddProductMutation fires POST /products/add
2. Mutation succeeds  ──▶  it carries invalidatesTags: [{ Products, id: "LIST" }]
3. RTK Query sees the "Products/LIST" tag is now dirty
4. Any mounted useGetProductsQuery (which PROVIDES that tag) auto-refetches
5. The list re-renders with fresh server data — zero manual sync code
```

---

## 🧩 4. Nửa Client-State — `cartSlice` (`createSlice`)

Giỏ hàng là client state thuần túy. Server không hề biết trong đó có gì cho đến khi checkout, vì vậy chúng ta quản lý nó bằng một slice viết tay. `createSlice` cho phép chúng ta viết logic kiểu "mutating" (thông qua Immer, thứ tạo ra một immutable update đúng đắn ở phía sau).

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
> Lưu ý rằng `selectCartTotal` là một **selector**, không phải một field được lưu trữ. Đừng bao giờ lưu trữ dữ liệu phái sinh (một tổng tiền mà bạn có thể tính lại) trong slice — hãy lưu trữ nguồn tối thiểu (`items`) và *phái sinh (derive)* phần còn lại. Nếu bạn cũng lưu trữ `total`, bạn sẽ phải nhớ cập nhật nó trong mọi reducer, và cuối cùng nó sẽ trôi lệch khỏi đồng bộ.

---

## 🧩 5. Đấu Dây CẢ HAI vào `configureStore`

Đây là nơi hai chủ sở hữu gặp nhau. API service đóng góp **ba** thứ vào store: một reducer (dưới `reducerPath` của nó), một middleware (cho caching/refetching), và chúng ta chọn tham gia tính năng tự động refetch-on-focus với `setupListeners`. Giỏ hàng chỉ đóng góp một reducer thông thường.

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
> Quên `.concat(productsApi.middleware)` là lỗi thiết lập RTK Query phổ biến nhất. Không có nó, các query của bạn sẽ *bắn một lần* nhưng caching, tag invalidation, và refetch tự động lặng lẽ ngừng hoạt động — và bạn sẽ nhận được một cảnh báo trong console. Tương tự, key của reducer **phải** là `[productsApi.reducerPath]` (một computed key), không phải một chuỗi literal mà bạn tự gõ, để hai thứ không bao giờ trôi lệch khỏi nhau.

Cuối cùng, cung cấp store cho cây React:

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

## 🛠️ 6. Xây dựng Giao diện (UI)

### 🧩 6a. `ProductList` — đọc server state, thêm vào client cart

Component này đọc từ **cả hai** chủ sở hữu: nó *query* products (RTK Query) và *dispatch* `addToCart` (slice). Nó cũng đấu dây mutation delete.

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

### 🧩 6b. `ProductForm` — thêm & sửa thông qua mutation

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

### 🧩 6c. `CartPanel` — client state thuần túy với một tổng tiền phái sinh

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

### 🧩 6d. `App` — kết hợp dashboard

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

Đó là toàn bộ vòng lặp: products chảy *vào* từ nhà bếp (RTK Query), giỏ hàng đầy lên trên khay của khách hàng (slice), và một store duy nhất giữ cả hai mà không bên nào giẫm chân lên bên kia.

---

## 🧠 Kiểm tra Kiến thức của Bạn

**1. Tại sao chúng ta quản lý `products` bằng RTK Query nhưng quản lý `cart` bằng `createSlice`?**

<details>
  <summary><b>Hiện Đáp án</b></summary>

  Bởi vì chúng là những *loại* state khác nhau. Products là **server state** — chúng nằm trên backend, bạn chỉ mượn chúng, và chúng có thể trở nên cũ, nên caching + tag-invalidation của RTK Query xử lý việc fetch và giữ chúng tươi mới cho bạn. Giỏ hàng là **client/UI state** — ứng dụng của bạn tự tạo ra và sở hữu hoàn toàn; server không biết về nó cho đến khi checkout. Quy tắc ngón tay cái: **RTK Query sở hữu server state, slice sở hữu client state.** Việc copy các sản phẩm đã fetch vào một slice tạo ra một bản sao mà bạn phải tự tay giữ đồng bộ mãi mãi — đúng là vấn đề mà RTK Query được tạo ra để loại bỏ.
</details>

**2. Bạn đã thêm một sản phẩm thành công nhưng danh sách không refetch. Hai nguyên nhân hợp lý?**

<details>
  <summary><b>Hiện Đáp án</b></summary>

  (a) **Tag bị thiếu hoặc không khớp.** Mutation `addProduct` phải `invalidatesTags` một tag mà `getProducts` `providesTags`. Nếu `getProducts` cung cấp `{ type: "Products", id: "LIST" }` nhưng mutation chỉ invalidate `"Product"` (sai tên) thì không có gì refetch cả. (b) **`productsApi.middleware` không được thêm vào** trong `configureStore`, nên toàn bộ cỗ máy invalidation bất hoạt. Một nguyên nhân thứ ba, tinh quái và đặc thù của dự án này: `dummyjson` là một API **giả** không lưu trữ dữ liệu, nên ngay cả một refetch đúng đắn cũng trả về danh sách ban đầu mà không có item mới của bạn.
</details>

**3. `useGetProductsQuery` và `useAddProductMutation` đến từ đâu — chúng ta có viết chúng không?**

<details>
  <summary><b>Hiện Đáp án</b></summary>

  Không. RTK Query **tự sinh** chúng từ các định nghĩa endpoint của bạn. Nó lấy tên endpoint (`getProducts`), viết hoa nó, thêm tiền tố `use`, và thêm hậu tố `Query` (cho `builder.query`) hoặc `Mutation` (cho `builder.mutation`) → `useGetProductsQuery`, `useAddProductMutation`. Bạn export chúng từ object `productsApi`. Đổi tên endpoint và tên hook tự động thay đổi để khớp.
</details>

**4. Tại sao `selectCartTotal` là một selector thay vì một field `total` được lưu trong `cartState`?**

<details>
  <summary><b>Hiện Đáp án</b></summary>

  Bởi vì tổng tiền là **dữ liệu phái sinh** — nó luôn có thể được tính lại từ `items` (`tổng của price × quantity`). Lưu trữ nó riêng rẽ có nghĩa là mọi reducer (`addToCart`, `removeFromCart`, `decrementQuantity`, `clearCart`) sẽ phải nhớ tính lại nó, và khoảnh khắc một cái quên, tổng tiền được lưu trữ trôi lệch khỏi đồng bộ với các item thực tế. Hãy lưu trữ nguồn chân lý tối thiểu (`items`) và phái sinh mọi thứ khác bằng selector. (Đối với các phép phái sinh tốn kém, hãy bọc selector trong `createSelector` để memoize nó.)
</details>

**5. `productsApi` đóng góp ba thứ gì vào `configureStore`, và điều gì hỏng nếu bạn bỏ qua middleware?**

<details>
  <summary><b>Hiện Đáp án</b></summary>

  (1) Một **reducer**, được mount dưới `[productsApi.reducerPath]`. (2) Một **middleware**, được thêm qua `getDefaultMiddleware().concat(productsApi.middleware)`. (3) Một cách gián tiếp, hành vi listener qua `setupListeners(store.dispatch)` cho refetch-on-focus/reconnect. Nếu bạn bỏ qua middleware, các query vẫn bắn một lần nhưng **caching, tag invalidation, refetch tự động, và polling ngừng hoạt động** — mutation sẽ không còn khiến danh sách làm mới, và bạn sẽ thấy một cảnh báo trong console về middleware bị thiếu.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1 — Thêm chức năng sửa `updateProduct` vào UI

`productsApi` đã expose sẵn `useUpdateProductMutation` và một type `UpdateProductArg`, nhưng chưa có component nào dùng nó. Hãy xây dựng một **inline edit** để mỗi dòng sản phẩm có thể thay đổi giá của nó.

**Nhiệm vụ:**
1. Trong `ProductList`, thêm một nút "Edit" cho mỗi dòng, dùng để bật/tắt một input inline nhỏ cho giá mới.
2. Gọi `updateProduct({ id, changes: { price: newPrice } })` và `.unwrap()` nó.
3. Vô hiệu hóa các control của dòng đó khi `isLoading` là true.
4. Xác nhận (về mặt khái niệm) rằng cả dòng đã sửa lẫn danh sách đều mang tag cũ (stale), nên `getProducts` refetch.

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

### 🛠️ Bài tập 2 — Một luồng `checkout` bắc cầu giữa hai thế giới

Hiện tại giỏ hàng chỉ nằm ở phía client. Hãy thêm một checkout *gửi* giỏ hàng lên server, rồi xóa nó — chính khoảnh khắc client state vượt sang server state.

**Nhiệm vụ:**
1. Thêm một mutation `checkout` vào `productsApi` (`POST /carts/add` trên dummyjson) mà tham số của nó là `items` của giỏ hàng.
2. Thêm một component `CheckoutButton` dùng `useCheckoutMutation`.
3. Khi thành công, `dispatch(clearCart())` để cái khay trống đi sau khi nhà bếp nhận order.
4. Hiển thị một xác nhận "Order #123 placed!" từ dữ liệu mà mutation trả về.

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

### Tóm tắt

- **Một store, hai chủ sở hữu.** RTK Query giữ server state (products); `createSlice` giữ client state (cart). Đấu dây cả hai vào `configureStore`.
- **Các thao tác ghi server-state không bao giờ chạm vào một slice.** Mutation + `providesTags`/`invalidatesTags` giữ danh sách được cache tươi mới một cách tự động — không cần đồng bộ thủ công.
- **Client-state phái sinh, không bao giờ trùng lặp.** Lưu trữ `items`; tính `selectCartTotal` ngay tức thời.
- **Các hook là miễn phí.** `useGetProductsQuery`, `useAddProductMutation`, v.v. được tự sinh từ tên endpoint của bạn — bạn chỉ export chúng.
- **Ranh giới chính là kỹ năng.** Biết *công cụ nào* sở hữu một phần state là bản năng Redux Toolkit giá trị nhất, và dashboard này luyện tập cả hai phía cùng một lúc.
