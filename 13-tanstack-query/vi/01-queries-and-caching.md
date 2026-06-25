# TanStack Query: Truy vấn (Queries) & Cấu hình bộ nhớ đệm (Caching) ⚡

**TanStack Query** (trước đây gọi là **React Query**) là thư viện quản lý trạng thái bất đồng bộ (asynchronous state management) tiêu chuẩn của ngành dành cho React. Thư viện này thiết kế chuyên biệt để xử lý việc gọi dữ liệu, lưu cache, đồng bộ và cập nhật **trạng thái máy chủ (server state)** (dữ liệu API) trong các ứng dụng web.

---

## ⚡ 1. Tại sao nên chọn TanStack Query?

Trong ứng dụng React thông thường, gọi dữ liệu mạng thường sử dụng kết hợp `useState` và `useEffect`. Tuy nhiên, cách này thiếu đi các tính năng nâng cao như lưu cache, gọi dữ liệu ngầm dưới nền, loại bỏ trùng lặp request, tự động gọi lại khi focus trình duyệt, hoặc quản lý các biến trạng thái hiển thị chi tiết.

TanStack Query tự động quản lý server state một cách chuyên nghiệp, tách biệt hoàn toàn khỏi client state.

---

## ⚡ 2. Cài đặt & Thiết lập Kho lưu trữ (Store)

Để cài đặt TanStack Query vào ứng dụng React của bạn, chạy lệnh:

```bash
npm install @tanstack/react-query
```

### Bao bọc component gốc của ứng dụng (`main.jsx`)
Để có thể sử dụng các câu truy vấn, bạn bắt buộc phải khởi tạo một đối tượng **`QueryClient`** và bao bọc các component của mình trong thẻ **`QueryClientProvider`**:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Khởi tạo một client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 🧩 3. Gọi dữ liệu sử dụng `useQuery`

Để gọi dữ liệu, bạn sử dụng hook **`useQuery`**, nhận vào một đối tượng cấu hình chứa:
1. **`queryKey`**: Mảng chứa các khóa định danh duy nhất để phân vùng bộ nhớ cache.
2. **`queryFn`**: Hàm bất đồng bộ (trả về một promise) thực hiện việc gọi API lấy dữ liệu.

```jsx
import { useQuery } from '@tanstack/react-query';

// 1. Định nghĩa hàm gọi API thuần khiết
const fetchUsers = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) throw new Error("Không thể tải danh sách người dùng!");
  return res.json();
};

export const UserDirectory = () => {
  // 2. Gọi dữ liệu sử dụng hook useQuery
  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['usersList'], // Khóa định danh cache
    queryFn: fetchUsers       // Hàm xử lý Promise
  });

  if (isLoading) return <p>Đang tải danh mục người dùng...</p>;
  if (isError) return <p style={{ color: "red" }}>Lỗi: {error.message}</p>;

  return (
    <div>
      <h3>Danh mục người dùng (TanStack Query)</h3>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name} ({user.email})</li>
        ))}
      </ul>
    </div>
  );
};
```

---

## 🚀 4. Khái niệm cốt lõi về Cache: `staleTime` vs. `gcTime`

Cấu hình hành vi lưu cache là vô cùng quan trọng để tối ưu hóa lưu lượng mạng gọi API:

```mermaid
graph TD
    A[Kích hoạt Truy vấn] --> B{Có sẵn dữ liệu Cache?}
    B -->|Có| C{Dữ liệu còn Mới (Fresh)?}
    C -->|Còn, staleTime còn hạn| D[Trả về dữ liệu Cache ngay, KHÔNG gọi API]
    C -->|Hết, staleTime hết hạn| E[Trả về dữ liệu Cache ngay, gọi API ngầm để cập nhật]
    B -->|Không, gcTime hết hạn| F[Hiển thị trạng thái Loading, gọi API mới từ server]
```

### A. `staleTime` (Ngưỡng dữ liệu mới)
* **Khái niệm**: Khoảng thời gian (tính bằng mili-giây) mà dữ liệu API sau khi gọi về được coi là "mới" (fresh).
* **Hành vi**: Trong khi dữ liệu còn mới, các component khác gọi chung queryKey sẽ đọc dữ liệu từ cache ngay lập tức **mà không kích hoạt bất kỳ yêu cầu gọi API ngầm nào dưới nền**.
* **Mặc định**: `0` mili-giây (dữ liệu lập tức bị coi là cũ sau khi gọi về).

### B. `gcTime` (Thời gian dọn dẹp bộ nhớ)
* **Khái niệm**: Trước đây gọi là `cacheTime` (Garbage Collection Time). Khoảng thời gian (tính bằng mili-giây) dữ liệu cache không sử dụng được lưu giữ trong bộ nhớ đệm trước khi bị xóa bỏ hoàn toàn.
* **Hành vi**: Nếu không còn bất kỳ component nào đăng ký lắng nghe queryKey đó, bộ đếm thời gian bắt đầu chạy. Khi hết hạn `gcTime`, dữ liệu đó bị giải phóng khỏi bộ nhớ đệm.
* **Mặc định**: `300000` mili-giây (5 phút).

### Ví dụ cấu hình tùy chỉnh:
```javascript
const { data } = useQuery({
  queryKey: ['usersList'],
  queryFn: fetchUsers,
  staleTime: 60 * 1000, // Coi dữ liệu mới trong vòng 1 phút
  gcTime: 10 * 60 * 1000, // Giữ dữ liệu cache không dùng trong bộ nhớ 10 phút
});
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. "Query Keys" là gì và tại sao chúng được đối xử giống như mảng phụ thuộc dependency?
<details>
  <summary><b>Reveal Answer</b></summary>

  Query Keys là các mảng đóng vai trò làm các khóa định danh duy nhất để lưu trữ và quản lý cache. Nếu bạn đưa các biến động vào trong query key (ví dụ: `['todos', userId]`), mảng này hoạt động tương tự mảng dependency của `useEffect`. Khi biến `userId` thay đổi, TanStack Query tự hiểu khóa cũ bị vô hiệu lực, tự tạo một khóa cache mới và kích hoạt gọi lại dữ liệu API cho ID mới.
</details>

### 2. Thiết lập cấu hình `staleTime: 5000` (5 giây) có tác dụng gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó đánh dấu dữ liệu gọi về sẽ được coi là "mới" (fresh) trong vòng 5 giây. Nếu có bất kỳ component nào yêu cầu cùng khóa queryKey đó trong vòng 5 giây này, TanStack Query sẽ trả về dữ liệu cache ngay lập tức và **không** gửi thêm bất kỳ yêu cầu gọi API ngầm nào dưới nền.
</details>

### 3. Sự khác biệt giữa `isLoading` và `isFetching` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`isLoading`** chỉ có giá trị true ở **lần mount đầu tiên** khi gọi dữ liệu mạng mà hoàn toàn chưa có bất kỳ dữ liệu cache nào sẵn trong bộ nhớ (trạng thái tải cứng).
  - **`isFetching`** có giá trị true **mỗi khi** có yêu cầu mạng gọi API đang chạy ngầm bên dưới, bất kể trên màn hình đã hiển thị dữ liệu cache cũ hay chưa.
</details>

### 4. Tính năng "Refetch on Window Focus" là gì và làm thế nào để tắt nó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đó là tính năng tự động gọi lại API dưới nền của TanStack Query mỗi khi người dùng chuyển tab trình duyệt và quay lại focus vào cửa sổ của ứng dụng. Để tắt tính năng này toàn cục hoặc cho từng query cụ thể, hãy đặt cấu hình `refetchOnWindowFocus: false` trong phần options.
</details>

### 5. Tại sao TanStack Query không dùng React Context toàn cục để lưu trữ và chia sẻ dữ liệu state?
<details>
  <summary><b>Reveal Answer</b></summary>

  TanStack Query lưu trữ cache trong một lớp quản lý bộ nhớ ngoài (`QueryClient`). Nó sử dụng React Context *chỉ* để chia sẻ địa chỉ trỏ tới client này xuống các con. Các component hook tương tác trực tiếp với thực thể bộ nhớ cache bên ngoài này. Cách thiết kế này giúp tránh các vòng lặp re-render không cần thiết của Context và đồng bộ dữ liệu với hiệu năng cực cao.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Tải chi tiết bài viết động theo ID (Post Details Fetcher)
1. Tạo một component `PostViewer.tsx` (sử dụng đuôi `.tsx`).
2. Thiết lập một state `postId` khởi tạo bằng giá trị `1`.
3. Viết hàm gọi API bất đồng bộ `fetchPost(id)` lấy thông tin từ đường dẫn `https://jsonplaceholder.typicode.com/posts/${id}`.
4. Truyền khóa `['post', postId]` làm `queryKey` và `() => fetchPost(postId)` làm `queryFn` trong hàm `useQuery`.
5. Hiển thị tiêu đề và nội dung bài viết lên màn hình, kèm 2 nút bấm "Bài tiếp theo" và "Bài trước đó" để thay đổi giá trị `postId`. Quan sát việc bấm quay lại các bài viết cũ sẽ hiển thị thông tin ngay lập tức nhờ cơ chế lưu cache theo queryKey!
