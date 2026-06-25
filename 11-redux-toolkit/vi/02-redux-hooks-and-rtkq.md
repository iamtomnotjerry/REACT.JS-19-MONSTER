# Redux Hooks & công cụ RTK Query (RTKQ) 🔄

Bài học này hướng dẫn cách kết nối Redux store vào các component React sử dụng các hook thông dụng (**`useSelector`** và **`useDispatch`**), đồng thời giới thiệu **RTK Query (RTKQ)** – một công cụ quản lý gọi dữ liệu mạng và cache cực kỳ mạnh mẽ tích hợp sẵn trong Redux Toolkit.

---

## ⚡ 1. Các hook của React-Redux

Để đọc dữ liệu từ store và gửi (dispatch) các action lên store từ các React component, ta sử dụng hai hook chính:

1. **`useSelector`**: Lấy ra một phần state cụ thể từ store toàn cục.
2. **`useDispatch`**: Trả về hàm dispatch dùng để gửi các action đi.

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../features/counterSlice';

export const CounterApp = () => {
  // 1. Selector lấy ra giá trị (chỉ đăng ký lắng nghe thay đổi của thuộc tính value ở slice counter)
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Bộ đếm: {count}</h2>
      <button onClick={() => dispatch(increment())}>+ Tăng</button>
      <button onClick={() => dispatch(decrement())}>- Giảm</button>
    </div>
  );
};
```

---

## ⚡ 2. RTK Query (RTKQ) là gì?

**RTK Query** là bộ công cụ tối ưu cho việc tải dữ liệu mạng và quản lý cache. Nó giúp đơn giản hóa quá trình gọi dữ liệu từ các web API, loại bỏ hoàn toàn việc phải tự viết thủ công các hàm async thunks, reducers, và các biến quản lý trạng thái loading/error.

RTK Query tự động sinh ra các React hook tương ứng để tự quản lý vòng đời lấy dữ liệu, lưu cache và tự động dọn dẹp cache cũ.

---

## 🧩 3. Thiết lập RTK Query

Hãy cùng xây dựng một dịch vụ query lấy danh sách bài viết từ một API JSON bên ngoài:

### Bước 1: Khởi tạo API Slice (`src/services/postsApi.js`)
```javascript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Định nghĩa dịch vụ gọi API sử dụng base URL và các endpoints mong muốn
export const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com/' }),
  endpoints: (builder) => ({
    // Queries đại diện cho các yêu cầu GET. Mutations đại diện cho POST/PUT/DELETE
    getPosts: builder.query({
      query: (limit) => `posts?_limit=${limit}`,
    }),
  }),
});

// Quy tắc đặt tên hook tự động sinh ra: use[TênEndpoint][Query/Mutation]
export const { useGetPostsQuery } = postsApi;
```

### Bước 2: Đăng ký API vào Store (`src/app/store.js`)
Bạn bắt buộc phải đăng ký reducer của API và thêm middleware tương ứng vào store toàn cục để kích hoạt tính năng cache, tự dọn dẹp dữ liệu và tự gọi lại (polling):

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counterSlice';
import { postsApi } from '../services/postsApi';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // Đăng ký reducer của API như một lát cắt ở cấp cao nhất
    [postsApi.reducerPath]: postsApi.reducer,
  },
  // Thêm middleware giúp kích hoạt các tính năng cache, dọn dẹp dữ liệu, polling của rtk-query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(postsApi.middleware),
});
```

### Bước 3: Tiêu thụ hook trong Component (`PostFeed.jsx`)
```jsx
import { useGetPostsQuery } from '../services/postsApi';

export const PostFeed = () => {
  // Hook tự động quản lý trạng thái loading, lỗi gọi mạng và lưu cache kết quả!
  const { data: posts, error, isLoading } = useGetPostsQuery(5);

  if (isLoading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Không thể tải bài viết: {error.message}</p>;

  return (
    <div>
      <h3>Danh sách bài viết mới nhất (RTK Query)</h3>
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

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Hook `useSelector` xác định thời điểm component cần re-render bằng cách nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useSelector` sẽ chạy hàm selector của nó mỗi khi một action được dispatch lên store và state thay đổi. Nó thực hiện so sánh tham chiếu nghiêm ngặt (`===`) trên kết quả trả về. Nếu tham chiếu kết quả giống hệt lần render trước, nó sẽ bỏ qua việc re-render component, giúp tối ưu hóa hiệu năng.
</details>

### 2. Tại sao nên tránh trả về một đối tượng mới trực tiếp trong `useSelector` (ví dụ: `useSelector(state => ({ val: state.a }))`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trả về một đối tượng trực tiếp dạng `{}` sẽ tạo ra một địa chỉ tham chiếu object mới hoàn toàn trong bộ nhớ ở **mỗi lần chạy**. Vì `useSelector` so sánh tham chiếu nên nó sẽ nghĩ state thay đổi sau mỗi lần dispatch và kích hoạt re-render component không cần thiết. Để sửa lỗi:
  1. Gọi `useSelector` nhiều lần, mỗi lần lấy ra một giá trị nguyên thủy duy nhất.
  2. Hoặc sử dụng hàm so sánh nông (shallow comparison): `useSelector(selector, shallowEqual)`.
</details>

### 3. RTK Query thực hiện hành động gì dưới nền khi một component dùng `useGetPostsQuery(5)` bị hủy (unmount) rồi sau đó hiển thị lại (mount)?
<details>
  <summary><b>Reveal Answer</b></summary>

  RTK Query kiểm tra bộ nhớ đệm cache tập trung. Vì dữ liệu với đối số `5` đã có sẵn trong cache, nó trả về kết quả ngay tức khắc mà không cần gửi thêm bất kỳ yêu cầu mạng gọi API nào. Mặc định, nó sẽ giữ các cache không sử dụng này trong 60 giây (có thể cấu hình qua thuộc tính `keepUnusedDataFor`) trước khi tự giải phóng bộ nhớ.
</details>

### 4. Sự khác biệt giữa `Query` và `Mutation` trong cấu hình RTK Query là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Queries**: Đại diện cho các tác vụ lấy dữ liệu (yêu cầu HTTP GET). Chúng hỗ trợ lưu cache, tự động cập nhật, tự gọi lại theo chu kỳ (polling) và tải lại khi focus màn hình.
  - **Mutations**: Đại diện cho các tác vụ thay đổi dữ liệu (yêu cầu HTTP POST, PUT, DELETE) gửi cập nhật lên server và kích hoạt cơ chế xóa cache cũ để tự động gọi lại các Queries.
</details>

### 5. Tại sao chúng ta cần nối thêm middleware của API vào cấu hình store?
<details>
  <summary><b>Reveal Answer</b></summary>

  Middleware của API bắt buộc phải có để điều phối vòng đời của bộ nhớ cache. Nó tự động quản lý thời gian tồn tại của các đăng ký dữ liệu, xử lý chu kỳ polling, kích hoạt tự xóa cache cũ khi chạy mutation, và quản lý thời gian gọi dữ liệu ngầm dưới nền.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng dịch vụ gọi danh sách User qua RTK Query
1. Tạo một tệp API service `usersApi.js` trong thư mục `src/services/`.
2. Định nghĩa endpoint `getUsers` thực hiện gọi danh sách người dùng từ đường dẫn `https://jsonplaceholder.typicode.com/users`.
3. Đăng ký reducer và middleware của `usersApi` vào tệp cấu hình store `store.js` toàn cục.
4. Xây dựng component `UsersList.tsx` tiêu thụ hook tự sinh ra `useGetUsersQuery()`.
5. Hiển thị danh sách tên và email người dùng lên màn hình, hiển thị thông điệp "Đang tải dữ liệu..." trong quá trình gọi API.
