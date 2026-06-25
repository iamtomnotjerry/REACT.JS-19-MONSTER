# TanStack Query: Cập nhật dữ liệu (Mutations) & Vô hiệu hóa Cache ⚡

Bài học này hướng dẫn về **Mutations** (gửi các yêu cầu thay đổi dữ liệu lên server như POST, PUT, DELETE) và **Vô hiệu hóa bộ nhớ đệm (Cache Invalidation)** (báo cho TanStack Query biết một phân vùng cache đã lỗi thời để tự động gọi lại API cập nhật dữ liệu).

---

## ⚡ 1. Thay đổi dữ liệu sử dụng `useMutation`

Trong khi `useQuery` được thiết kế chuyên biệt cho việc lấy dữ liệu, thì **`useMutation`** được sử dụng khi bạn cần tạo mới, cập nhật hoặc xóa dữ liệu trên máy chủ backend.

### Các điểm khác biệt chính:
* `useQuery` tự động chạy khi component mount. `useMutation` thì **không**; bạn bắt buộc phải kích hoạt nó thủ công bằng cách gọi hàm `mutate(variables)`.
* `useMutation` không yêu cầu phải khai báo các khóa truy vấn (query keys) (tuy nhiên nó có thể tương tác với các khóa này để xóa cache trong hàm onSuccess).

```jsx
import { useMutation } from '@tanstack/react-query';

// 1. Định nghĩa hàm gọi API bất đồng bộ phương thức POST
const createTodoApi = async (newTodo) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify(newTodo),
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Không thể tạo mới phần tử!");
  return res.json();
};

export const AddTodoComponent = () => {
  // 2. Khởi tạo hook useMutation
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createTodoApi,
    onSuccess: (data) => {
      alert(`Thành công! Đã tạo bài viết có ID: ${data.id}`);
    }
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const title = new FormData(e.target).get("todoTitle");
    
    // 3. Kích hoạt gọi mutation thủ công
    mutate({ title, body: "Tạo qua TanStack Query", userId: 1 });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="text" name="todoTitle" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Thêm Todo"}
      </button>
      {isError && <p style={{ color: "red" }}>Lỗi: {error.message}</p>}
    </form>
  );
};
```

---

## ⚡ 2. Vô hiệu hóa bộ nhớ đệm (`invalidateQueries`)

Khi bạn thay đổi dữ liệu thành công trên server, bộ nhớ cache ở phía client của bạn sẽ lập tức bị lỗi thời (stale). Để đồng bộ hóa lại giao diện UI hiển thị thông tin mới nhất, bạn bắt buộc phải yêu cầu TanStack Query xóa bỏ cache cũ và tự gọi lại API lấy dữ liệu mới.

Chúng ta thực hiện điều này bằng cách sử dụng hook **`useQueryClient`** và gọi hàm **`invalidateQueries`** bên trong hàm callback `onSuccess` của mutation:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Giả định các hàm fetchTodoList và createTodoApi đã được định nghĩa từ trước...

export const TodoListApp = () => {
  const queryClient = useQueryClient(); // 1. Truy cập thực thể QueryClient toàn cục

  // 2. Query gọi danh sách hiển thị
  const { data: todos } = useQuery({
    queryKey: ['todosList'],
    queryFn: fetchTodoList
  });

  // 3. Mutation tạo mới phần tử
  const { mutate } = useMutation({
    mutationFn: createTodoApi,
    onSuccess: () => {
      // 4. QUAN TRỌNG: Xóa bỏ cache và ép buộc truy vấn 'todosList' gọi lại API ngầm!
      queryClient.invalidateQueries({ queryKey: ['todosList'] });
    }
  });

  return (
    <div>
      {/* Giao diện danh sách và Form AddTodo hiển thị tại đây */}
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao `useMutation` không tự động chạy khi component nạp (mount) lần đầu?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMutation` được thiết kế cho các tác vụ thay đổi, cập nhật hoặc xóa dữ liệu (chỉ xảy ra khi có hành vi tương tác rõ ràng của người dùng như bấm nút hoặc submit form). Việc tự chạy khi mount sẽ gây ra các hành động ghi đè dữ liệu trùng lặp không mong muốn. Do đó, nó chỉ trả về hàm `mutate` để bạn tự kích hoạt khi cần.
</details>

### 2. Hàm `queryClient.invalidateQueries({ queryKey: ['todos'] })` thực thi những gì dưới nền?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó thực thi hai việc:
  1. Đánh dấu toàn bộ các cache đang hoạt động có khóa chứa `'todos'` là đã lỗi thời (stale).
  2. Nếu các truy vấn này đang hiển thị trên màn hình, nó kích hoạt gọi API ngầm ngay lập tức để đồng bộ lại dữ liệu mới nhất từ server lên giao diện UI.
</details>

### 3. Sự khác biệt giữa `mutate` và `mutateAsync` trả về từ `useMutation` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`mutate`** là một hàm dạng "gọi và quên" (fire-and-forget). Nó không trả về Promise và bạn kiểm soát kết quả thông qua các hàm callback vòng đời (`onSuccess`, `onError`).
  - **`mutateAsync`** trả về một Promise tiêu chuẩn. Điều này cho phép bạn viết khối lệnh `try/catch` kết hợp `await` trực tiếp trong hàm xử lý sự kiện của component, rất hữu ích khi cần gọi liên tiếp các tác vụ bất đồng bộ tuần tự.
</details>

### 4. Đối tượng cấu hình của `useMutation` hỗ trợ các hàm callback vòng đời nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó hỗ trợ:
  - **`onMutate`**: Chạy trước khi hàm mutation thực thi. Thích hợp cho việc tối ưu UI tức thời (optimistic updates).
  - **`onSuccess`**: Chạy khi mutation thực thi thành công, nhận dữ liệu phản hồi từ server.
  - **`onError`**: Chạy nếu xảy ra lỗi, nhận đối tượng lỗi trả về.
  - **`onSettled`**: Chạy khi hoàn thành, bất kể thành công hay thất bại.
</details>

### 5. Nếu chúng ta có khóa cache là `['todos', 'details', 5]`, việc vô hiệu hóa khóa `['todos']` có ảnh hưởng đến nó không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Theo mặc định, việc vô hiệu hóa khóa của TanStack Query hoạt động theo cơ chế **khớp tiền tố (prefix-based)**. Gọi `invalidateQueries({ queryKey: ['todos'] })` sẽ tìm và xóa tất cả các cache có khóa bắt đầu bằng chữ `'todos'`, bao gồm `['todos']`, `['todos', 'list']`, và `['todos', 'details', 5]`. Để chỉ định chính xác, thêm thuộc tính `{ exact: true }`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Quản lý danh bạ liên lạc tự động cập nhật
1. Tạo một component `ContactManager.tsx` (sử dụng đuôi `.tsx`).
2. Sử dụng `useQuery` gọi danh bạ người dùng từ `https://jsonplaceholder.typicode.com/users` (Query Key: `['contacts']`).
3. Hiển thị một form nhập Tên và Email để thêm liên lạc mới.
4. Thiết lập `useMutation` gọi phương thức POST để gửi thông tin liên lạc lên server.
5. Trong hàm callback `onSuccess`, gọi hàm vô hiệu hóa khóa `['contacts']` để đồng bộ lại danh sách dưới nền.
6. Hiển thị vòng xoay đang tải (loading spinner) trên nút Thêm liên lạc khi tiến trình mutation đang xử lý.
