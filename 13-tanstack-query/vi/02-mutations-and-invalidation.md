# TanStack Query: Mutations & Vô hiệu hóa Cache ⚡

Bài học này bao gồm **Mutations** (gửi các thay đổi dữ liệu lên server như yêu cầu POST, PUT, DELETE), **Vô hiệu hóa Cache** (báo cho TanStack Query biết các cache cụ thể đã lỗi thời, kích hoạt việc tự động làm mới ngầm), toàn bộ **vòng đời mutation** (`onMutate` / `onError` / `onSuccess` / `onSettled`) cùng với **cập nhật lạc quan (optimistic updates)**, `mutateAsync`, và **truy vấn phân trang (paginated queries)** với `placeholderData` / `keepPreviousData`.

---

## 📖 Khái niệm & Tổng quan

Cho đến nay chúng ta đã dùng `useQuery` để **đọc** dữ liệu từ server. Nhưng các ứng dụng thực tế còn cần **ghi** dữ liệu — tạo một todo, chỉnh sửa hồ sơ, xóa một bình luận. Trong TanStack Query, mọi thao tác ghi đều đi qua hook **`useMutation`**. Sau một thao tác ghi thành công, dữ liệu bạn đã cache trước đó giờ đã lỗi thời, nên bạn **vô hiệu hóa (invalidate)** các query key bị ảnh hưởng để kích hoạt việc fetch ngầm mới và giữ cho UI luôn đồng bộ.

> [!NOTE]
> **Queries là đọc; mutations là ghi.** Một `useQuery` chạy tự động khi mount và được gắn key/cache. Một `useMutation` thì **không làm gì cả** cho đến khi bạn gọi `mutate()` hoặc `mutateAsync()` một cách tường minh. Mutations không được cache theo một query key — thay vào đó chúng cung cấp một vòng đời (`onMutate` → `onError`/`onSuccess` → `onSettled`) cho phép bạn phản ứng với từng giai đoạn.

> [!TIP]
> Mẫu hình phổ biến nhất trong các ứng dụng thực tế là: **mutate → khi thành công, `invalidateQueries` các danh sách đã thay đổi.** Nếu bạn chỉ nhớ một điều duy nhất từ bài học này, hãy nhớ cặp đôi đó. Cập nhật lạc quan (optimistic updates, đề cập bên dưới) là một tinh chỉnh nâng cao xây dựng trên nền tảng này để tạo UI có cảm giác tức thời.

### 🍽️ Một phép ẩn dụ thực tế: Đơn hàng ở nhà hàng

Hãy hình dung **cơ sở dữ liệu server của bạn như một nhà bếp nhà hàng** và **cache như bảng thực đơn** mà khách hàng đọc:

- **`useQuery`** = đọc bảng thực đơn. Nhanh, được cache, mọi người đều thấy cùng một thứ.
- **`useMutation`** = đặt một món với nhà bếp (một thao tác ghi). Nó chỉ xảy ra khi *bạn* yêu cầu người phục vụ.
- **`onMutate`** = người phục vụ ngay lập tức viết món bạn gọi lên bảng *trước khi* nhà bếp xác nhận (optimistic update). Bảng trông như đã được cập nhật tức thì.
- **`onError`** = nhà bếp báo lại "hết cá hồi rồi!" — người phục vụ xóa món bạn gọi khỏi bảng (rollback).
- **`onSuccess`** = nhà bếp xác nhận món đang được chế biến.
- **`onSettled`** = dù chuyện gì xảy ra, người phục vụ quay lại nhà bếp để kiểm tra lại xem bảng có khớp với thực tế không (`invalidateQueries`).

### 🔀 `mutate` so với `mutateAsync`

| Tính năng | `mutate(vars)` | `mutateAsync(vars)` |
| --- | --- | --- |
| Giá trị trả về | `void` (gọi-và-quên) | Một `Promise` |
| Xử lý lỗi | Qua callback `onError` | `try/catch` **hoặc** `onError` |
| Dùng `await`? | Không | Có |
| Phù hợp nhất cho | Form đơn giản, click nút | Sắp xếp tuần tự nhiều await, cần kết quả trực tiếp tại chỗ |
| Rủi ro rejection chưa xử lý | Không | Có — bạn phải `catch` nó |

---

## ⚡ 1. Thay đổi dữ liệu với `useMutation`

Trong khi `useQuery` được thiết kế để lấy dữ liệu, thì **`useMutation`** được dùng để tạo, cập nhật, hoặc xóa dữ liệu trên một server backend.

### Các điểm khác biệt chính:
* `useQuery` chạy tự động khi component mount. `useMutation` thì **không**; bạn kích hoạt nó thủ công bằng cách gọi hàm `mutate(variables)`.
* `useMutation` không yêu cầu query keys (mặc dù nó có thể tương tác với chúng trong các chu trình onSuccess).

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

## ⚡ 2. Vô hiệu hóa Cache (`invalidateQueries`)

Khi bạn thay đổi dữ liệu trên server, cache phía client của các query trở nên lỗi thời (stale). Để giữ cho UI luôn đồng bộ, bạn phải báo cho TanStack Query loại bỏ cache cũ và fetch dữ liệu mới.

Chúng ta làm điều này bằng cách khởi tạo hook **`useQueryClient`** và gọi **`invalidateQueries`** bên trong callback `onSuccess` của mutation:

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
> `invalidateQueries` mặc định **dựa trên tiền tố (prefix-based)**. Gọi `invalidateQueries({ queryKey: ['todos'] })` cũng sẽ vô hiệu hóa `['todos', 1]`, `['todos', 'details', 5]`, và bất kỳ key nào khác bắt đầu bằng `'todos'`. Đây thường là điều bạn mong muốn, nhưng nếu bạn cần vô hiệu hóa một key chính xác duy nhất, hãy truyền `{ queryKey: ['todos', 1], exact: true }`.

---

## ⚡ 3. Vòng đời Mutation: `onMutate` / `onError` / `onSuccess` / `onSettled`

Mỗi `useMutation` nhận một object tùy chọn với bốn callback vòng đời. Chúng được kích hoạt theo một thứ tự được đảm bảo:

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

| Callback | Khi nào chạy | Cách dùng điển hình |
| --- | --- | --- |
| `onMutate` | Trước `mutationFn` | Hủy các refetch đang chạy, chụp snapshot cache, áp dụng optimistic update |
| `onSuccess` | Sau khi request resolve | Hiển thị toast, đặt query data bằng phản hồi từ server |
| `onError` | Sau khi request reject | Roll back optimistic update bằng snapshot |
| `onSettled` | Sau khi thành công **hoặc** lỗi | `invalidateQueries` để đồng bộ lại với server |

---

## ⚡ 4. Cập nhật lạc quan (UI có cảm giác tức thời)

Một **optimistic update** giả định rằng mutation sẽ thành công và cập nhật cache *ngay lập tức*, trước khi server phản hồi. Nếu sau đó server từ chối, bạn roll back. Đây là mẫu hình "người phục vụ viết món bạn gọi lên bảng trước khi nhà bếp xác nhận" từ phép ẩn dụ.

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
> Luôn kết hợp một optimistic update với `cancelQueries` (trong `onMutate`) và `invalidateQueries` (trong `onSettled`). Việc hủy ngăn một refetch ngầm chậm chạp ghi đè lên giá trị lạc quan của bạn; lần invalidate cuối cùng đảm bảo cache cuối cùng sẽ khớp với nguồn sự thật trên server.

---

## ⚡ 5. `mutateAsync` — chờ kết quả

`mutate` là gọi-và-quên. Khi bạn cần `await` kết quả trực tiếp tại chỗ — ví dụ để nối tiếp một request thứ hai, hoặc để giữ một handler submit trong một khối `try/catch` duy nhất — hãy dùng **`mutateAsync`**, hàm này trả về một Promise.

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

## ⚡ 6. Truy vấn phân trang với `placeholderData` / `keepPreviousData`

Khi bạn fetch từng trang một, việc thay đổi trang sẽ thay đổi **query key** (ví dụ `['todos', page]`), điều này theo mặc định khiến màn hình nhấp nháy trở về trạng thái loading ở mỗi lần đổi trang. Để giữ cho dữ liệu của trang trước vẫn hiển thị trong khi trang tiếp theo đang tải, hãy dùng `placeholderData: keepPreviousData`.

> [!NOTE]
> Trong **TanStack Query v5**, tùy chọn boolean `keepPreviousData: true` đã bị loại bỏ. Thay vào đó hãy import helper `keepPreviousData` và truyền nó dưới dạng `placeholderData: keepPreviousData`. Ở v4 bạn dùng `keepPreviousData: true`. Hành vi là như nhau — dữ liệu cũ vẫn ở trên màn hình trong lần fetch tiếp theo.

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
> `isFetching` (đang có refresh ngầm) khác với `isLoading` (chưa có dữ liệu cache, lần tải đầu tiên). Ở trang 2 trở đi, `isLoading` vẫn là `false` vì chúng ta đã giữ lại dữ liệu trước đó — hãy dùng `isFetching` cho một chỉ báo "Updating..." không chặn (non-blocking) thay thế.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về mutations. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao `useMutation` không tự động chạy khi một component mount?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMutation` được thiết kế cho các side effect ghi, cập nhật, hoặc xóa dữ liệu (chỉ nên xảy ra do các tương tác tường minh của người dùng như click một nút hoặc submit một form). Việc chạy chúng tự động khi mount sẽ gây ra các thao tác ghi trùng lặp và làm spam cơ sở dữ liệu. Thay vào đó, nó trả về một hàm `mutate` để bạn gọi theo nhu cầu (on-demand).
</details>

### 2. `queryClient.invalidateQueries({ queryKey: ['todos'] })` làm gì ở bên dưới (under the hood)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó làm hai việc:
  1. Đánh dấu mọi query đang hoạt động có key `['todos']` (và, theo tiền tố, các key bắt đầu bằng `'todos'`) là lỗi thời (stale).
  2. Nếu các query đó hiện đang được render trên màn hình, nó ngay lập tức kích hoạt một refetch ngầm để tự động đồng bộ UI với cơ sở dữ liệu server backend.
</details>

### 3. Trong một optimistic update, mục đích của giá trị trả về từ `onMutate` là gì, và nó được dùng ở đâu?
<details>
  <summary><b>Reveal Answer</b></summary>

  Giá trị trả về từ `onMutate` trở thành đối số **`context`** được truyền vào `onError` và `onSettled`. Bạn thường chụp snapshot cache trước đó (ví dụ `{ previousTodos }`) và trả nó về, để nếu mutation thất bại, `onError` có thể roll back cache bằng `queryClient.setQueryData(['todos'], context.previousTodos)`. Bạn cũng nên gọi `cancelQueries` trong `onMutate` để một refetch đang chạy không thể ghi đè lên giá trị lạc quan của bạn.
</details>

### 4. Sự khác biệt giữa `mutate` và `mutateAsync` là gì, và `mutateAsync` đi kèm trách nhiệm bổ sung nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`mutate`** là gọi-và-quên. Nó trả về `void` và bạn xử lý kết quả qua các callback vòng đời (`onSuccess`, `onError`). Nó không bao giờ throw.
  - **`mutateAsync`** trả về một **Promise**, nên bạn có thể `await` nó và dùng nó trực tiếp tại chỗ (ví dụ để sắp xếp tuần tự các request phụ thuộc). Trách nhiệm bổ sung: vì nó reject khi thất bại, bạn **bắt buộc** phải bọc nó trong `try/catch` (hoặc gắn `.catch`) để tránh một unhandled promise rejection.
</details>

### 5. Trong TanStack Query v5, làm thế nào để giữ dữ liệu của trang trước hiển thị trong khi trang tiếp theo đang tải, và `isFetching` khác `isLoading` như thế nào trong tình huống đó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Truyền `placeholderData: keepPreviousData` (import helper `keepPreviousData`) vào `useQuery`. Tùy chọn boolean cũ `keepPreviousData: true` từ v4 đã bị loại bỏ. Khi đặt nó:
  - **`isLoading`** chỉ là `true` khi hoàn toàn không có dữ liệu cache (lần tải đầu tiên). Ở trang 2 trở đi, nó vẫn là `false` vì dữ liệu của trang trước được giữ lại.
  - **`isFetching`** là `true` bất cứ khi nào có một request đang chạy, bao gồm cả các refresh ngầm. Hãy dùng `isFetching` (và `isPlaceholderData`) để hiển thị một chỉ báo "Updating..." không chặn thay vì thay thế toàn bộ UI bằng một spinner.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Trình tạo danh bạ liên lạc động
1. Tạo một component `ContactManager.tsx` (sử dụng đuôi `.tsx`).
2. Dùng `useQuery` để fetch một danh sách liên lạc từ `https://jsonplaceholder.typicode.com/users` (Query Key: `['contacts']`).
3. Viết một form với các input cho Name và Email.
4. Thiết lập một `useMutation` sử dụng `fetch` POST để tạo một liên lạc.
5. Trong `onSuccess` (hoặc `onSettled`), vô hiệu hóa key `['contacts']` để xác minh rằng danh sách được làm mới dưới nền.
6. Hiển thị một chỉ báo loading spinner trên nút Submit trong khi mutation đang pending (`isPending`).
7. **Nâng cao:** Chuyển đổi handler submit để dùng `mutateAsync` bên trong một khối `try/catch`, và `console.log` `id` của liên lạc đã tạo trả về từ Promise.

### 🛠️ Bài tập 2: "Toggle Complete" lạc quan với Rollback
1. Tái sử dụng một query `['todos']` tải các todo từ `https://jsonplaceholder.typicode.com/todos?_limit=10`.
2. Xây dựng một mutation `useToggleTodo` mà `mutationFn` của nó gửi một `PATCH` tới `/todos/:id` để đảo ngược `completed`.
3. Trong **`onMutate`**:
   - `await queryClient.cancelQueries({ queryKey: ['todos'] })`.
   - Chụp snapshot cache bằng `getQueryData(['todos'])`.
   - Đảo ngược cờ `completed` của todo được toggle một cách lạc quan bằng `setQueryData`.
   - Trả về `{ previousTodos }` làm context.
4. Trong **`onError`**, khôi phục snapshot từ `context.previousTodos`.
5. Trong **`onSettled`**, gọi `invalidateQueries({ queryKey: ['todos'] })`.
6. **Xác minh rollback:** tạm thời làm cho `mutationFn` throw một error và xác nhận rằng checkbox đảo trạng thái một cách rõ ràng, sau đó bật trở lại.

### 🛠️ Bài tập 3: Trình xem bài viết phân trang
1. Tạo `PaginatedPosts.tsx` với một state `currentPage` (khởi tạo `1`).
2. Truy vấn `['posts', currentPage]` từ `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`.
3. Thêm `placeholderData: keepPreviousData`.
4. Render các nút Previous/Next. Vô hiệu hóa Previous khi `currentPage === 1`, và vô hiệu hóa Next trong khi `isPlaceholderData` là `true`.
5. Hiển thị một nhãn "Updating..." được điều khiển bởi `isFetching` (không phải `isLoading`), và xác nhận rằng danh sách **không** nhấp nháy rỗng khi chuyển trang.
