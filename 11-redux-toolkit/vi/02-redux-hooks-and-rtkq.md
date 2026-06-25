# Redux Hooks & RTK Query (RTKQ) 🔄

Bài học này hướng dẫn cách kết nối Redux với các component React thông qua các hook (**`useSelector`** và **`useDispatch`**), đồng thời giới thiệu **RTK Query (RTKQ)** — một công cụ mạnh mẽ để gọi dữ liệu và quản lý cache được tích hợp trực tiếp trong Redux Toolkit.

---

## 🌟 Khái niệm & Tổng quan

Việc tự tay nối dây gọi dữ liệu trong Redux rất lặp đi lặp lại: bạn phải viết một thunk, một cờ loading, một cờ error, một reducer cho trường hợp thành công, và cuối cùng là một selector — **cho từng endpoint một**. RTK Query gom toàn bộ đống boilerplate đó vào một định nghĩa khai báo duy nhất. Bạn chỉ cần mô tả dữ liệu *nằm ở đâu*, và RTK Query sẽ sinh ra các React hook đầy đủ kiểu (fully-typed) tự xử lý toàn bộ vòng đời của request, cache và tự động gọi lại giúp bạn.

Hãy hình dung các hook của React-Redux như hai đầu của một đường dây điện thoại nối component của bạn với store: `useSelector` là **ống nghe** (bạn lắng nghe state), còn `useDispatch` là **ống nói** (bạn nói các action vào store). RTK Query sau đó nằm trên đường dây này như một **trợ lý thông minh**: lần đầu bạn hỏi "tất cả sản phẩm", nó thực hiện cuộc gọi, ghi câu trả lời lên một tờ giấy nhớ (cache) và ghim lên bảng. Lần sau bất kỳ ai hỏi cùng câu hỏi đó, trợ lý chỉ cần đọc tờ giấy nhớ thay vì gọi lại — cho đến khi tờ giấy đó cũ (stale) và bị vứt đi.

> [!NOTE]
> RTK Query **không** phải là một thư viện riêng mà bạn cài đặt độc lập. Nó đi kèm bên trong `@reduxjs/toolkit`. Bạn import nó từ điểm vào (entry point) chuyên biệt `@reduxjs/toolkit/query/react` để các **React hook** được sinh tự động cũng được bao gồm.

> [!TIP]
> Với RTK Query bạn gần như không bao giờ phải viết `try/catch` hay tự quản lý các cờ `isLoading` bằng tay. Hook query được sinh ra đã trả về sẵn `data`, `error`, `isLoading`, `isFetching` và `isSuccess`. Hãy destructure đúng những gì bạn cần và để RTK Query nắm toàn bộ vòng đời.

---

## ⚡ 1. Các hook của React-Redux

Để đọc dữ liệu và dispatch các action lên Redux store bên trong các component React, ta dùng hai hook chính:

1. **`useSelector`**: Trích xuất các phần state (state slice) cụ thể từ store.
2. **`useDispatch`**: Trả về hàm dispatch để kích hoạt các action.

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

## ⚡ 2. RTK Query (RTKQ) là gì?

**RTK Query** là một khả năng mạnh mẽ để gọi dữ liệu và quản lý cache. Nó đơn giản hóa việc tải dữ liệu từ các web API, loại bỏ nhu cầu phải viết các async thunk, reducer và các trạng thái loading/error tùy biến.

Nó tự động sinh ra các React hook quản lý vòng đời gọi dữ liệu, cache và việc vô hiệu hóa cache (cache invalidation).

---

## 🧩 3. Thiết lập RTK Query

Hãy cùng xây dựng một dịch vụ query để lấy danh sách bài viết (posts) từ một API JSON:

### Bước 1: Tạo API Slice (`src/services/postsApi.js`)
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
> Tên hook được sinh ra tự động cho bạn. RTK Query lấy tên endpoint của bạn (ví dụ `getPosts`), thêm tiền tố `use`, viết hoa chữ cái đầu, và gắn thêm `Query` hoặc `Mutation` vào cuối. Vậy nên `getPosts` (một `builder.query`) trở thành `useGetPostsQuery`, còn một `builder.mutation` tên `addPost` trở thành `useAddPostMutation`.

### Bước 2: Đăng ký API vào Store (`src/app/store.js`)
Bạn bắt buộc phải đăng ký reducer của API được sinh ra và thêm middleware tùy biến của nó để kích hoạt các tính năng cache, invalidation và polling:

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
> Nếu bạn quên `.concat(postsApi.middleware)`, RTK Query trông như vẫn "hoạt động" nhưng cache, tự động gọi lại, polling và **invalidation dựa trên tag sẽ âm thầm hỏng hết**. Middleware chính là thứ điều phối toàn bộ vòng đời của cache — đừng bao giờ bỏ qua nó.

### Bước 3: Sử dụng trong Component (`PostFeed.jsx`)
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

## 🔁 4. Query và Mutation

Mỗi endpoint hoặc là một **query** (bạn đang *đọc* dữ liệu) hoặc là một **mutation** (bạn đang *thay đổi* dữ liệu). Phương thức builder bạn chọn quyết định bạn nhận được hook tự sinh nào và cách bạn gọi nó.

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

Một query hook **chạy tự động** khi mount và trả về một *object*. Một mutation hook trả về một *array*: một hàm trigger mà bạn gọi thủ công, cộng với một object kết quả.

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

### Bảng so sánh

| Khía cạnh | **Query** (`builder.query`) | **Mutation** (`builder.mutation`) |
| --- | --- | --- |
| Mục đích | Đọc / lấy dữ liệu | Tạo, cập nhật hoặc xóa dữ liệu |
| Động từ HTTP | `GET` | `POST`, `PUT`, `PATCH`, `DELETE` |
| Hook được sinh ra | `useGetXQuery` | `useXMutation` |
| Kiểu giá trị hook trả về | **Object**: `{ data, error, isLoading }` | **Array**: `[trigger, { data, error, isLoading }]` |
| Cách thực thi | Chạy **tự động** khi mount | Chạy **thủ công** khi bạn gọi trigger |
| Cache | Kết quả được cache & chia sẻ | Bản thân nó không được cache |
| Vai trò với cache | Khai báo **những gì nó cung cấp** (`providesTags`) | Khai báo **những gì nó vô hiệu hóa** (`invalidatesTags`) |
| Gọi lại (re-fetch) | Hỗ trợ polling & gọi lại khi focus | Kích hoạt các query khác gọi lại thông qua tag |

---

## 🏷️ 5. Vô hiệu hóa Cache bằng Tag

Đây là vấn đề mà tag giải quyết: hãy tưởng tượng `useGetAllProductsQuery` đã cache một danh sách 30 sản phẩm. Người dùng nhấn **Add Product**, mutation của bạn thành công trên server — nhưng màn hình vẫn hiển thị **30 sản phẩm cũ**, vì danh sách đã cache không hề biết có gì thay đổi. Bạn có thể gọi `refetch()` thủ công, nhưng cách đó mong manh và rất dễ quên.

**Tag** là giải pháp tự động của RTK Query. Hãy hình dung một tag như một **nhãn dán trên ngăn kéo tủ hồ sơ**. Mỗi query nói "Tôi cung cấp nội dung của ngăn `Products`." Mỗi mutation nói "Tôi vừa động vào ngăn `Products` — mọi thứ phụ thuộc vào nó giờ đã cũ." RTK Query sau đó tự động gọi lại mọi query đã cung cấp tag bị vô hiệu hóa. Không cần `refetch()` thủ công, không có UI cũ.

Luồng này gồm ba phần:

1. **`tagTypes`** — khai báo các tên tag tồn tại trong API này.
2. **`providesTags`** — một query công bố dữ liệu của nó đại diện cho những tag nào.
3. **`invalidatesTags`** — một mutation công bố nó làm bẩn (dirty) những tag nào.

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

### Luồng vô hiệu hóa một tag diễn ra như thế nào

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
> Quy ước `id: 'LIST'` là mẫu (pattern) được khuyến nghị. Hãy gắn tag cho chính bộ sưu tập (collection) bằng một id `'LIST'` đặc biệt để các mutation **add** (vốn tạo ra một item chưa có id nào đã biết) vẫn có thể vô hiệu hóa toàn bộ danh sách một cách chính xác, mà không phá hủy từng mục cache sản phẩm riêng lẻ.

> [!WARNING]
> Tag chỉ được tôn trọng khi middleware của API đã được đăng ký (xem Bước 2). Một lỗi thường gặp: `providesTags`/`invalidatesTags` được viết đúng, mutation thành công, nhưng danh sách không bao giờ làm mới — vì middleware bị thiếu trong `configureStore`, nên sự kiện invalidation không có gì lắng nghe nó.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về Redux Hooks và RTK Query. Nhấp vào **Reveal Answer** để xác nhận.

### 1. `useSelector` xác định thời điểm một component cần re-render bằng cách nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useSelector` chạy hàm selector của nó mỗi khi một action được dispatch và state của store cập nhật. Nó thực hiện một phép **so sánh tham chiếu nghiêm ngặt** (`===`) trên giá trị trả về. Nếu tham chiếu trả về giống hệt lần render trước, nó bỏ qua việc re-render component, giúp bảo vệ hiệu năng.
</details>

### 2. Tại sao nên tránh trả về một object mới trực tiếp bên trong `useSelector` (ví dụ `useSelector(state => ({ val: state.a }))`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trả về một object literal mới trực tiếp tạo ra một tham chiếu object hoàn toàn mới trong bộ nhớ ở **mỗi lần chạy**. Vì `useSelector` so sánh tham chiếu, nó sẽ nghĩ rằng state đã thay đổi sau mỗi lần dispatch và kích hoạt các lần re-render không cần thiết. Để trả về nhiều giá trị một cách an toàn:
  1. Gọi `useSelector` nhiều lần, mỗi lần lấy ra một giá trị nguyên thủy.
  2. Hoặc dùng hàm trợ giúp so sánh nông (shallow equality): `useSelector(selector, shallowEqual)`.
</details>

### 3. RTK Query làm gì dưới nền khi một component dùng `useGetPostsQuery(5)` bị unmount rồi sau đó mount lại?
<details>
  <summary><b>Reveal Answer</b></summary>

  RTK Query kiểm tra cache tập trung của nó. Vì dữ liệu với đối số `5` đã có sẵn trong cache, nó trả về dữ liệu đã cache ngay lập tức mà không kích hoạt một request mạng mới. Mặc định, nó giữ cache không sử dụng trong bộ nhớ trong 60 giây (có thể cấu hình qua `keepUnusedDataFor`) trước khi dọn dẹp (garbage collect) nó.
</details>

### 4. Sự khác biệt giữa cách bạn gọi một `Query` hook và một `Mutation` hook trong một component là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Một **query hook** trả về một **object** và chạy **tự động** khi mount: `const { data, error, isLoading } = useGetAllProductsQuery();`
  - Một **mutation hook** trả về một **array** `[triggerFn, resultObject]` và chạy **thủ công** khi bạn gọi trigger: `const [addProduct, { data, isLoading }] = useAddNewProductMutation();`. Sau đó bạn gọi `addProduct(payload)` (tùy chọn kèm `.unwrap()`) bên trong một event handler.
</details>

### 5. `providesTags` và `invalidatesTags` phối hợp với nhau như thế nào để giữ cho dữ liệu cache luôn mới?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mỗi **query** dùng `providesTags` để gắn nhãn cho mục cache mà nó sở hữu (ví dụ `{ type: 'Product', id: 'LIST' }`). Mỗi **mutation** dùng `invalidatesTags` để khai báo nó làm cũ những nhãn nào. Khi mutation thành công, RTK Query tìm mọi query đã cache *cung cấp* một tag khớp và **tự động gọi lại** nó. Điều này loại bỏ các lệnh `refetch()` thủ công và ngăn UI bị cũ sau các thao tác tạo/cập nhật/xóa. Tag chỉ hoạt động khi middleware của API được đăng ký trong store.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Xây dựng dịch vụ Query danh sách Users
1. Tạo một tệp service `usersApi.js` bên trong `src/services/`.
2. Định nghĩa một query endpoint `getUsers` lấy danh sách người dùng từ `https://jsonplaceholder.typicode.com/users`.
3. Đăng ký reducer và middleware của `usersApi` trong tệp `store.js` toàn cục của bạn (đừng quên `setupListeners`).
4. Xây dựng một component `UsersList.tsx` sử dụng hook tự sinh `useGetUsersQuery()`.
5. Hiển thị một danh sách tên và email người dùng lên màn hình, kèm một chỉ báo loading trong khi đang gọi dữ liệu.

### 🛠️ Bài tập 2: Thêm Vô hiệu hóa Cache bằng Tag
Mở rộng ví dụ products để danh sách sản phẩm luôn mới sau một thao tác ghi — **mà không bao giờ phải gọi `refetch()` thủ công**.

1. Thêm `tagTypes: ['Product']` vào cấu hình `createApi` của bạn.
2. Trên `getAllProducts`, thêm `providesTags` gắn tag cho từng item theo `id` cộng với một mục `{ type: 'Product', id: 'LIST' }` cho bộ sưu tập.
3. Tạo một mutation `addNewProduct` (`POST` tới `products/add`) và gán cho nó `invalidatesTags: [{ type: 'Product', id: 'LIST' }]`.
4. Tạo một mutation `deleteProduct` (`DELETE` tới `products/:id`) vô hiệu hóa cả `{ type: 'Product', id }` và `{ type: 'Product', id: 'LIST' }`.
5. Xây dựng hai component: một danh sách hiển thị tất cả sản phẩm, và một form với nút **Add Product**. Xác nhận rằng việc nhấn nút sẽ cập nhật danh sách **tự động**.
6. **Bonus:** Tạm thời xóa `.concat(productsApi.middleware)` khỏi store và quan sát rằng danh sách không còn tự động làm mới — chứng minh tại sao middleware là bắt buộc cho việc vô hiệu hóa bằng tag.
