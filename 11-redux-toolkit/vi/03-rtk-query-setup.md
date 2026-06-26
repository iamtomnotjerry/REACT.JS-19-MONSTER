# Redux Toolkit Query: Lấy & Cache Dữ liệu 🛰️

Ở bài học trước, bạn đã thấy `useSelector` và `useDispatch` kết nối các React component với Redux store như thế nào, và bạn cũng đã được nếm thử **RTK Query (RTKQ)** lần đầu. Bài học này là một phần đi sâu, tập trung và đạt chuẩn production về chính RTK Query: công cụ khai báo duy nhất bên trong Redux Toolkit đảm nhận toàn bộ vòng đời dữ liệu phía server của bạn — lấy dữ liệu, cache, các cờ loading/error, khử trùng lặp (de-duplication), và tự động lấy lại dữ liệu sau khi ghi.

Lời hứa rất đơn giản nhưng cực kỳ to lớn: bạn mô tả *dữ liệu của bạn nằm ở đâu* và *nó đại diện cho cái gì*, rồi RTK Query trao cho bạn các React hook đã được định kiểu đầy đủ (`useGetItemsQuery`, `useAddItemMutation`, …) mà bạn cắm thẳng vào component. Không cần viết tay thunk, không có các biến boolean `isLoading` mà bạn phải tự bật/tắt, không phải tự quản lý cache. Đến cuối bài, bạn sẽ có một service TypeScript hoàn chỉnh, có thể copy-paste — `createApi` với `tagTypes` cùng một hỗn hợp các query và mutation — được nối vào `configureStore`, cộng thêm một mô hình tư duy rõ ràng về cách các cache tag giữ cho UI của bạn luôn tươi mới một cách tự động.

---

## ⚡ 1. Khái niệm & Tổng quan

Dữ liệu phía server về cơ bản khác với state UI cục bộ. Nó nằm ở một nơi khác, nó có thể thay đổi mà app của bạn không hề hay biết, nhiều component cùng muốn một phần dữ liệu giống nhau, và mỗi request đều có một vòng đời (pending → success/error). Tự tay làm tất cả những điều đó trong Redux nghĩa là phải viết *cùng* năm thứ cho mỗi endpoint: một async thunk, một cờ loading, một cờ error, một reducer xử lý success, và một selector. RTK Query gom sự lặp lại đó vào một định nghĩa `createApi` mang tính khai báo duy nhất.

> [!NOTE]
> RTK Query **không** phải là một package riêng. Nó đi kèm bên trong `@reduxjs/toolkit`. Bạn import các phần dùng để lấy dữ liệu từ entry point chuyên dụng `@reduxjs/toolkit/query/react` để các **React hook** được sinh tự động được bao gồm. (Nếu bạn import từ `@reduxjs/toolkit/query` mà không có `/react`, bạn sẽ có core API nhưng không có hook.)

### 🧩 Một ẩn dụ đời thực: người thủ thư văn phòng

Hãy hình dung app của bạn là một văn phòng bận rộn và API là một kho lưu trữ xa xôi ở bên kia thành phố. RTK Query là **người thủ thư văn phòng** ngồi tại bàn giữa hai bên:

- Lần đầu tiên có ai đó hỏi "các báo cáo Q3" (`useGetReportsQuery()`), người thủ thư đi tới kho lưu trữ, mang về một bản sao, và **xếp nó vào một ngăn kéo có dán nhãn** (cache, được gắn tag `Report`).
- Khi một người thứ hai hỏi cùng các báo cáo đó một lát sau, người thủ thư không đi lại lần nữa — họ trao ngay bản sao đã có sẵn trong ngăn kéo. Đó là **khử trùng lặp request (request de-duplication)** và **caching**.
- Khi có ai đó nộp một báo cáo *mới* (`useAddReportMutation()`), người thủ thư gạch bỏ nhãn ngăn kéo "Reports" coi như đã **cũ (stale)** và lặng lẽ lấy lại nó, để người đọc kế tiếp luôn nhận được dữ liệu hiện tại. Đó là **vô hiệu hóa dựa trên tag (tag-based invalidation)**.
- Nếu một ngăn kéo không được động đến trong một khoảng thời gian (mặc định 60 giây), người thủ thư hủy bản sao để giải phóng chỗ. Đó là **thu gom rác (garbage collection)** (`keepUnusedDataFor`).

Bạn không bao giờ phải quản lý các ngăn kéo, các chuyến đi, hay việc hủy giấy. Bạn chỉ cần hỏi, và ghi, còn người thủ thư giữ cho mọi thứ nhất quán.

### RTK Query khớp vào Redux store như thế nào

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
> Bạn gần như không bao giờ viết `try/catch` quanh một query, và bạn không bao giờ khai báo `const [loading, setLoading] = useState(false)`. Hook query được sinh ra đã trả về sẵn `data`, `error`, `isLoading`, `isFetching`, và `isSuccess`. Hãy destructure đúng những gì bạn cần và để RTK Query đảm nhận vòng đời.

---

## 🛠️ 2. Cài đặt & Thiết lập

RTK Query là một phần của Redux Toolkit, nên việc cài đặt Redux theo chuẩn đã bao gồm sẵn nó.

```bash
# Redux Toolkit (includes RTK Query) + the React bindings
npm install @reduxjs/toolkit react-redux
```

Một bố cục dự án điển hình cho cách tiếp cận dựa trên service mà giảng viên sử dụng:

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
> Giảng viên gọi file `createApi` lúc thì là **"service"**, lúc thì là **"slice"** một cách hoán đổi. Chúng có nghĩa giống nhau: một lệnh gọi `createApi` duy nhất đảm nhận cả một nhóm các endpoint liên quan (ví dụ mọi thứ liên quan đến `Product`). Hầu hết app có một API slice duy nhất; các app lớn có thể tách ra thành vài cái theo domain.

---

## 🧩 3. Tạo API Slice với `createApi`

Đây là trái tim của RTK Query. `createApi` nhận một object cấu hình với bốn trường chính, và trả về một object chứa một reducer, middleware, và một hook được sinh tự động cho mỗi endpoint.

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
> Tên hook được sinh ra cho bạn theo một quy tắc cố định: lấy tên endpoint, thêm tiền tố `use`, viết hoa chữ cái đầu (`getAllProducts` → `GetAllProducts`), bỏ các khoảng trắng, và thêm hậu tố `Query` hoặc `Mutation` tùy theo phương thức builder. Vậy nên `getAllProducts` (một `builder.query`) trở thành `useGetAllProductsQuery`, và `addNewProduct` (một `builder.mutation`) trở thành `useAddNewProductMutation`. Đổi tên endpoint thì tên hook tự động đi theo.

### ⚡ Tại sao các generic `<ReturnType, ArgType>` lại quan trọng

Trong JavaScript thuần (như trong transcript) bạn sẽ viết `builder.query({ query: () => 'products' })` và `data` sẽ có kiểu `any`. Trong TypeScript, hai generic này chính là thứ làm cho toàn bộ mọi thứ an toàn về kiểu từ đầu đến cuối:

| Vị trí generic | Nó định kiểu cái gì | Ví dụ |
| :--- | :--- | :--- |
| Thứ nhất — **ReturnType** | Hình dạng của `data` mà hook trả về | `ProductsResponse` |
| Thứ hai — **ArgType** | Tham số mà hook nhận (và là thứ cache dùng làm khóa) | `void`, `number`, `NewProduct` |

Vậy nên `useGetProductByIdQuery(2)` được kiểm tra để chắc chắn nhận vào một `number`, và `data` được biết là một `Product` — editor của bạn tự động gợi ý `data.title` mà không cần ép kiểu.

---

## 🛠️ 4. Đăng ký API trong `configureStore`

Service vẫn nằm im cho đến khi bạn nối ba thứ vào store: **reducer** của nó (dưới `reducerPath` của nó), **middleware** của nó (nối thêm vào các middleware mặc định), và tùy chọn `setupListeners` (cho refetch-on-focus / refetch-on-reconnect).

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
> Nếu bạn quên `.concat(productsApi.middleware)`, RTK Query *trông như* vẫn hoạt động — các query ban đầu vẫn lấy được dữ liệu — nhưng **caching, polling, refetch-on-focus, và tag-based invalidation đều âm thầm hỏng**. Không có lỗi nào báo ra; các mutation chỉ đơn giản là không làm tươi lại các danh sách của bạn. Middleware chính là bộ điều phối của toàn bộ vòng đời cache, nên nó là bắt buộc, không phải tùy chọn.

> [!NOTE]
> Giảng viên mô tả `setupListeners` là "thứ mà bạn không cần phải bận tâm" — và điều đó đúng trong sử dụng hằng ngày. Cụ thể hơn, nó đăng ký lắng nghe các sự kiện `focus` và `online` của trình duyệt để RTK Query có thể lấy lại dữ liệu khi người dùng quay lại tab app của bạn hoặc khôi phục kết nối. Bạn viết một dòng đó rồi quên nó đi.

---

## ⚡ 5. Sử dụng Endpoint trong Component

### 🧩 Query — tự động, trả về một object

Một hook query chạy **tự động khi mount**, chạy lại khi tham số của nó thay đổi, và trả về một **object** gồm các trường vòng đời. Bạn thường canh `isLoading` và `error`, sau đó render `data`.

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

Lấy một item đơn lẻ thì giống hệt — bạn chỉ cần truyền tham số vào, mà RTK Query cũng dùng nó như một phần của cache key:

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
> **`isLoading` so với `isFetching`** làm gần như tất cả mọi người vấp ngã. `isLoading` chỉ là `true` ở lần lấy dữ liệu **đầu tiên** cho một cache entry nhất định (chưa có dữ liệu nào). `isFetching` là `true` cho **bất kỳ** request nào đang diễn ra, bao gồm cả các lần lấy lại ở chế độ nền khi dữ liệu đã có sẵn trên màn hình. Dùng `isLoading` cho spinner toàn trang và `isFetching` cho các chỉ báo "refreshing…" tinh tế mà không làm trống nội dung hiện có.

### 🧩 Mutation — thủ công, trả về một mảng

Một hook mutation **không** chạy khi mount. Nó trả về một **mảng**: một **hàm trigger** mà bạn gọi từ một event handler, cộng thêm một object kết quả. Sự khác biệt mảng-so-với-object này là điểm khác biệt thực tiễn quan trọng nhất giữa hai loại hook.

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
> Dùng `.unwrap()` mỗi khi bạn muốn rẽ nhánh dựa trên *kết quả* trong một event handler — điều hướng khi thành công, hiện toast khi thất bại, đọc id được trả về, v.v. Nếu không có nó, promise sẽ resolve thành một object phân biệt `{ data }` | `{ error }` mà bạn phải tự kiểm tra bằng tay. Với nó, thành công chính là giá trị trả về và thất bại là một lỗi được ném ra mà `catch` của bạn nhận được.

---

## 🔁 Query so với Mutation: So sánh Đầy đủ

Mỗi endpoint chính xác là một trong hai loại này. Chọn sai phương thức builder là lỗi phổ biến nhất của người mới bắt đầu, nên hãy thuộc nằm lòng bảng này:

| Khía cạnh | **Query** (`builder.query`) | **Mutation** (`builder.mutation`) |
| :--- | :--- | :--- |
| Mục đích | **Đọc** / lấy dữ liệu | **Tạo, cập nhật, hoặc xóa** dữ liệu |
| HTTP verb | `GET` | `POST`, `PUT`, `PATCH`, `DELETE` |
| Hook được sinh ra | `useGetXQuery` | `useXMutation` |
| Hình dạng giá trị trả về của hook | **Object**: `{ data, error, isLoading, isFetching }` | **Array**: `[trigger, { data, error, isLoading }]` |
| Thực thi | Chạy **tự động** khi mount & khi tham số đổi | Chạy **thủ công** khi bạn gọi trigger |
| Tham số | Truyền vào `query`; cũng được dùng làm **cache key** | Truyền vào `query` khi bạn gọi trigger |
| Caching | Kết quả được **cache và chia sẻ** giữa các component | Bản thân nó không được cache |
| Vai trò với cache | Khai báo **nó cung cấp cái gì** qua `providesTags` | Khai báo **nó vô hiệu hóa cái gì** qua `invalidatesTags` |
| Lấy lại | Hỗ trợ polling & refetch-on-focus | Kích hoạt các query *khác* lấy lại thông qua tag |

```text
QUERY  →  const { data, isLoading } = useGetAllProductsQuery();   // object, auto
MUTATION → const [addProduct, { isLoading }] = useAddNewProductMutation();  // array, manual
                    │
                    └─ later, in an event handler:  await addProduct(payload).unwrap();
```

---

## 🏷️ 6. Vô hiệu hóa Cache với Tag

> [!NOTE]
> **Phần này là phần hoàn toàn mới, vượt ra ngoài transcript được ghi hình.** Trong video khóa học, giảng viên minh họa các mutation (add / update / delete) nhưng làm tươi lại màn hình bằng cách render lại từng component riêng lẻ — họ không bao giờ nối `providesTags`/`invalidatesTags`. Vô hiệu hóa cache tự động bằng tag là cách hiện đại, được khuyến nghị để giữ cho các danh sách tươi mới sau một lần ghi, nên chúng ta dạy nó ở đây như best practice hiện hành. Mọi thứ trong §3–§5 khớp với những gì giảng viên trình bày.

### Vấn đề mà tag giải quyết

`useGetAllProductsQuery` đã cache một danh sách gồm 30 sản phẩm. Người dùng bấm **Add Product**, mutation thành công trên server — nhưng màn hình vẫn hiển thị **30 item cũ**, bởi vì danh sách đã cache không hề biết rằng có gì đó đã thay đổi. Bạn *có thể* gọi `refetch()` thủ công, nhưng cách đó mong manh và dễ quên, và nó cũng không giúp được một component *khác* cũng đang hiển thị danh sách đó.

### Giải pháp: nhãn ngăn kéo

Hãy hình dung một tag như **nhãn dán trên một ngăn kéo tủ hồ sơ**. Mỗi query tuyên bố "Tôi cung cấp nội dung của ngăn kéo `Product`." Mỗi mutation tuyên bố "Tôi vừa động vào ngăn kéo `Product`." Sau đó RTK Query tự động lấy lại mọi query đã cung cấp một tag bị vô hiệu hóa — trên toàn bộ app, không cần `refetch()` thủ công.

Cơ chế này có ba phần phối hợp với nhau:

1. **`tagTypes`** — khai báo các tên tag tồn tại trong API này (trường ở cấp cao nhất).
2. **`providesTags`** — một *query* tuyên bố dữ liệu đã cache của nó đại diện cho những tag nào.
3. **`invalidatesTags`** — một *mutation* tuyên bố nó làm cho những tag nào trở nên cũ.

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

### Một lần vô hiệu hóa tag diễn ra như thế nào

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
> Quy ước `id: 'LIST'` là mẫu được khuyến nghị. Hãy gắn tag cho chính tập hợp (collection) bằng một id đặc biệt `'LIST'` để các mutation **add** (vốn tạo ra một item mà bạn chưa biết id) vẫn có thể vô hiệu hóa toàn bộ danh sách một cách chính xác — mà không phá hủy cache entry của từng sản phẩm riêng lẻ. Các thao tác update và delete, vốn *biết* id, có thể chỉ vô hiệu hóa đúng entry đó (cộng thêm `'LIST'` cho delete, vì tập hợp đã co lại).

> [!WARNING]
> Các tag **chỉ được tôn trọng khi API middleware đã được đăng ký** (xem §4). Lỗi gây bối rối kinh điển: `providesTags`/`invalidatesTags` được viết hoàn hảo, mutation trả về 200, nhưng danh sách không bao giờ làm tươi lại — bởi vì `.concat(productsApi.middleware)` đã bị thiếu trong `configureStore`, nên sự kiện vô hiệu hóa chẳng có ai lắng nghe.

---

## 🧠 Kiểm tra Kiến thức

### 1. Tại sao bạn import từ `@reduxjs/toolkit/query/react` thay vì `@reduxjs/toolkit/query`?
<details>
  <summary><b>Hiện Đáp án</b></summary>

  Entry point `/react` bao gồm các **React hook được sinh tự động** (`useGetXQuery`, `useXMutation`). Entry point thuần `@reduxjs/toolkit/query` chỉ phơi bày core không phụ thuộc framework (`createApi`, `fetchBaseQuery`, reducer/middleware) nhưng **không có hook**, vốn dành cho các tích hợp không phải React hoặc tùy chỉnh. Trong một app React bạn gần như luôn muốn `/react` để `createApi` gắn các hook vào object API được trả về.
</details>

### 2. Sự khác biệt giữa `isLoading` và `isFetching` trên một kết quả query là gì, và khi nào bạn dùng mỗi cái?
<details>
  <summary><b>Hiện Đáp án</b></summary>

  `isLoading` là `true` **chỉ ở request đầu tiên** cho một cache entry — khi chưa có dữ liệu nào trên màn hình. `isFetching` là `true` cho **bất kỳ** request nào đang diễn ra với entry đó, bao gồm các lần lấy lại ở chế độ nền được kích hoạt bởi vô hiệu hóa tag, polling, hay refetch-on-focus trong khi dữ liệu đã hiển thị. Dùng `isLoading` để hiện một spinner/skeleton toàn trang (chưa có gì để hiện), và `isFetching` cho một chỉ báo "refreshing…" tinh tế giữ cho dữ liệu hiện có vẫn hiển thị.
</details>

### 3. Tại sao một hook mutation trả về một mảng `[trigger, result]` trong khi một hook query trả về một object `{ data, ... }`?
<details>
  <summary><b>Hiện Đáp án</b></summary>

  Một **query** chạy tự động khi mount, nên không có gì để bạn phải gọi — RTK Query chỉ trao cho bạn object vòng đời `{ data, error, isLoading, isFetching }`. Một **mutation** phải chạy theo yêu cầu (một cú click nút, một lần submit form), nên hook trả lại cho bạn một **mảng** mà phần tử đầu tiên là **hàm trigger** bạn tự gọi, và phần tử thứ hai là object kết quả: `const [addProduct, { isLoading }] = useAddNewProductMutation()`. Sau đó bạn gọi `addProduct(payload)` (tùy chọn kèm `.unwrap()`) bên trong một event handler.
</details>

### 4. Chính xác thì cái gì hỏng nếu bạn quên `.concat(api.middleware)` trong `configureStore`, và tại sao không có lỗi nào báo ra?
<details>
  <summary><b>Hiện Đáp án</b></summary>

  Các query ban đầu vẫn lấy được dữ liệu (vì reducer lưu kết quả), nên *trông như* nó hoạt động. Nhưng middleware mới là thứ điều phối vòng đời cache, nên **sự nhất quán của cache, polling, refetch-on-focus/reconnect, và tag-based invalidation đều âm thầm ngừng hoạt động** — biểu hiện rõ nhất là các mutation không còn làm tươi lại các query mà chúng vô hiệu hóa. Không có lỗi vì về mặt kỹ thuật chẳng có gì dị dạng cả; các action vô hiệu hóa đơn giản là được dispatch vào một store mà không có listener nào (chính là middleware bị thiếu) phản ứng với chúng.
</details>

### 5. `tagTypes`, `providesTags`, và `invalidatesTags` phối hợp như thế nào để làm tươi lại một danh sách sau khi add, và tại sao lại dùng quy ước `id: 'LIST'`?
<details>
  <summary><b>Hiện Đáp án</b></summary>

  `tagTypes` khai báo các tên tag hợp lệ (ví dụ `['Product']`). Mỗi **query** dùng `providesTags` để gắn nhãn cho cache entry mà nó sở hữu; query danh sách cung cấp một tag cho mỗi item cộng thêm một tag tập hợp đặc biệt `{ type: 'Product', id: 'LIST' }`. Mỗi **mutation** dùng `invalidatesTags` để đánh dấu các nhãn là cũ; một mutation add vô hiệu hóa `{ type: 'Product', id: 'LIST' }`. Khi mutation thành công, RTK Query tìm mọi query đã cache có *cung cấp* một tag khớp và tự động lấy lại nó. Quy ước `'LIST'` tồn tại bởi vì một thao tác **add** tạo ra một item với id mà bạn chưa biết — vô hiệu hóa tag cấp tập hợp `'LIST'` sẽ làm tươi lại toàn bộ danh sách một cách chính xác mà không cần vô hiệu hóa (và lấy lại) từng entry item riêng lẻ.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Xây dựng một Users service có định kiểu từ đầu

Tạo một service RTK Query hoàn chỉnh cho users và sử dụng nó.

**Nhiệm vụ:**
1. Tạo `src/services/usersApi.ts`. Định nghĩa một interface `User` (`id`, `name`, `email`).
2. Thêm một query `getUsers` lấy `users` từ `https://jsonplaceholder.typicode.com/`. Định kiểu nó là `builder.query<User[], void>`.
3. Đăng ký `usersApi.reducer` (dưới `usersApi.reducerPath`) và `.concat(usersApi.middleware)` trong `store.ts`. Giữ nguyên `setupListeners(store.dispatch)`.
4. Xây dựng `UsersList.tsx` gọi `useGetUsersQuery()`, hiện `Loading…` khi `isLoading`, một thông báo lỗi khi `error`, và nếu không thì render tên cùng email của mỗi user.

**Mã khởi đầu:**

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

### 🛠️ Bài tập 2: Làm cho danh sách sản phẩm tự làm tươi với tag

Mở rộng products service để danh sách cập nhật **tự động** sau một lần ghi — mà không bao giờ gọi `refetch()`.

**Nhiệm vụ:**
1. Thêm `tagTypes: ['Product']` vào `createApi`.
2. Cho `getAllProducts` một `providesTags` ánh xạ mỗi item thành `{ type: 'Product', id }` cộng thêm một entry `{ type: 'Product', id: 'LIST' }`.
3. Thêm một mutation `addNewProduct` (`POST products/add`) với `invalidatesTags: [{ type: 'Product', id: 'LIST' }]`.
4. Thêm một mutation `deleteProduct` (`DELETE products/:id`) vô hiệu hóa cả `{ type: 'Product', id }` lẫn `{ type: 'Product', id: 'LIST' }`.
5. Render một danh sách `AllProducts` và một nút `AddProduct` trên cùng một màn hình. Bấm **Add** và xác nhận danh sách tự làm tươi lại.
6. **Phần thưởng chẩn đoán:** tạm thời gỡ `.concat(productsApi.middleware)` khỏi store. Quan sát rằng danh sách ngừng tự làm tươi — chứng minh tận mắt cảnh báo ở §4. Sau đó đặt nó lại.

**Mã khởi đầu:**

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
