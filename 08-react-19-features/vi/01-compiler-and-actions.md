# React 19 Compiler & Actions 🔥

React 19 giới thiệu những nâng cấp lớn trong cách chúng ta xây dựng các ứng dụng web. Nó tự động hóa việc tối ưu hiệu năng thông qua **React Compiler** mới và thay đổi cách chúng ta xử lý form cũng như các yêu cầu bất đồng bộ bằng **Actions**.

---

## 📖 Khái niệm & Tổng quan

React 19 mang đến hai ý tưởng chủ đạo mà khi kết hợp lại sẽ loại bỏ một lượng lớn code soạn sẵn (boilerplate) trong công việc React hằng ngày:

1. **React Compiler** tự động hóa việc memoization tại thời điểm build, nhờ đó bạn không còn phải tự tay viết `useMemo` và `useCallback`.
2. **Actions** biến việc submit form và các mutation bất đồng bộ thành các primitive hạng nhất, nhờ đó bạn không còn phải tự đấu nối `onSubmit`, `e.preventDefault()` và các biến boolean loading thủ công.

Hãy hình dung nó giống như việc chuyển từ **xe hộp số sàn sang xe hộp số tự động**. Với hộp số sàn cũ (React 18 trở về trước), bạn liên tục phải quyết định khi nào sang số — khi nào memoize, khi nào theo dõi pending state, khi nào ngăn hành vi submit mặc định. Với hộp số tự động của React 19, động cơ tự lo việc sang số cho bạn. Bạn vẫn cầm lái (bạn viết logic), nhưng các thao tác đạp côn tẻ nhạt thì biến mất.

> [!NOTE]
> React Compiler là tính năng **tùy chọn bật (opt-in)** và hoạt động song song với code hiện có của bạn. Bạn không cần phải viết lại bất cứ thứ gì để bắt đầu hưởng lợi — các lời gọi `useMemo`/`useCallback` hiện tại vẫn tiếp tục hoạt động. Compiler đơn giản chỉ khiến hầu hết chúng trở nên không cần thiết về sau.

> [!TIP]
> Bạn có thể áp dụng các tính năng React 19 **theo từng bước (incrementally)**. Chuyển một form sang dùng Action, để nguyên phần còn lại, rồi ship. Actions, `useActionState` và `useFormStatus` được thiết kế để cùng tồn tại với các form dùng controlled-input cổ điển trong cùng một codebase.

### Mô hình mới so với mô hình cũ

| Vấn đề quan tâm | React 18 (thủ công) | React 19 (tự động) |
| --- | --- | --- |
| Tránh re-render | Tự tay dùng `useMemo` / `useCallback` / `React.memo` | React Compiler tự động memoize |
| Đọc giá trị form | `useState` cho mỗi input + các handler `onChange` | `formData.get("name")` bên trong một Action |
| Ngăn tải lại trang | `e.preventDefault()` trong `onSubmit` | Tự động khi dùng `<form action={fn}>` |
| Theo dõi trạng thái submit | Biến `isLoading` thủ công | `useFormStatus().pending` |
| State từ kết quả của form | Reducer + state tùy chỉnh | `useActionState(fn, initial)` |
| Đọc dữ liệu bất đồng bộ | `useEffect` + `useState` + cờ loading | `use(promise)` bên trong `<Suspense>` |

---

## ⚡ 1. React Compiler (React Forget)

Trước React 19, lập trình viên phải tối ưu hiệu năng thủ công bằng các hook như `useMemo` và `useCallback` để ngăn các component con render lại một cách không cần thiết.

**React Compiler** là một công cụ build-time mới biên dịch code React của bạn để tự động áp dụng chính xác các quy tắc memoization ở tầng ngầm. Nó hiểu các quy tắc của JavaScript và các quy tắc của React, nghĩa là:
* Các hàm và đối tượng thông thường được tự động memoize.
* Component chỉ re-render nếu dữ liệu đầu vào (props/state) của chúng thực sự thay đổi.
* Các lời gọi `useMemo` và `useCallback` thủ công hầu hết trở thành code lỗi thời.

> [!WARNING]
> Compiler chỉ có thể tối ưu code tuân theo **Rules of React**. Nếu một component mutate props, đọc hoặc ghi refs trong lúc render, hoặc phá vỡ tính thuần khiết (purity) theo cách khác, compiler sẽ an toàn **bỏ qua (skip)** việc tối ưu nó. Hãy dựa vào các quy tắc của `eslint-plugin-react-hooks` để compiler có thể làm tốt nhiệm vụ của mình.

---

## ⚡ 2. React Server Components (RSC) vs. Client Components

React 19 chính thức hóa việc tách biệt giữa Server Component và Client Component:
* **Server Components**: Mặc định render trên server. Chúng có thể truy vấn database hoặc đọc trực tiếp cấu trúc filesystem. Chúng gửi các biểu diễn JSON nhẹ về trình duyệt, giúp giảm dung lượng bundle JavaScript.
* **Client Components**: Được khai báo bằng chỉ thị `"use client"` ở đầu tệp. Chúng có thể truy cập các tính năng chỉ có ở client như state (`useState`), effect (`useEffect`), và các API trình duyệt.

React 19 cũng bổ sung **hỗ trợ metadata tích hợp sẵn** (bạn có thể đặt các thẻ `<title>` và `<meta>` ở bất cứ đâu trong một component phục vụ SEO) và một **hook `use` mới** cho phép bạn đọc một promise hoặc context trực tiếp bên trong render — kể cả bên trong vòng lặp hay điều kiện — thay thế nhiều cách fetch dữ liệu dựa trên `useEffect` khi được bọc trong `<Suspense>`.

```jsx
// Reading async data with the new `use` hook (React 19)
import { use, Suspense } from "react";

// A plain async function that returns a promise
const fetchTodo = async () => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  return res.json(); // Resolves to the todo object
};

const Todo = () => {
  // `use` unwraps the promise; Suspense shows the fallback while it pends
  const todo = use(fetchTodo());
  return <h2>{todo.title}</h2>;
};

export const App = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <Todo />
  </Suspense>
);
```

---

## ⚡ 3. Tính năng Form Actions mới

Trong các phiên bản React trước đây, việc xử lý submit một form bao gồm thêm `onSubmit` vào form, gọi `e.preventDefault()`, theo dõi state của các input thủ công, và xử lý các biến boolean cho spinner loading.

React 19 giới thiệu **Actions**, là các hàm chuyển đổi (transition) bất đồng bộ. Bạn có thể truyền trực tiếp một async function vào thuộc tính **`action`** của thẻ HTML `<form>`. React tự động xử lý vòng đời, và truyền trực tiếp đối tượng **`FormData`** tiêu chuẩn vào hàm handler:

```jsx
// A modern React 19 Async Action example
export const UpdateProfileForm = () => {
  
  const updateNicknameAction = async (formData) => {
    // 1. Fetch values directly from the input names without manual states!
    const nickname = formData.get("nickname");
    
    try {
      // 2. Perform async server network request
      const res = await fetch("https://api.example.com/profile", {
        method: "POST",
        body: JSON.stringify({ nickname }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Update failed!");
      alert("Nickname updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form action={updateNicknameAction} style={styles.form}>
      <h3>Update Nickname</h3>
      <input 
        type="text" 
        name="nickname" // Name attribute is used by formData.get()
        placeholder="Enter new nickname..." 
        style={styles.input}
        required 
      />
      <button type="submit" style={styles.btn}>Save Nickname</button>
    </form>
  );
};

const styles = {
  form: { maxWidth: "300px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" },
  input: { width: "100%", padding: "8px", margin: "10px 0", boxSizing: "border-box" },
  btn: { width: "100%", padding: "10px", backgroundColor: "#2ecc71", color: "#fff", border: "none", cursor: "pointer" }
};
```

### Các ưu điểm chính của Actions:
* **Không cần `e.preventDefault()`**: React tự động chặn việc submit form để ngăn tải lại trang.
* **Trích xuất dữ liệu ngầm định**: Dùng `formData` loại bỏ nhu cầu viết các state hook tùy chỉnh cho từng ô nhập văn bản.
* **Pending State tự động**: React tự động theo dõi xem action bất đồng bộ có đang thực thi hay không (truy cập qua các hook như `useFormStatus`).

---

### 🚦 Xử lý lỗi trong Form Actions

Cách dùng `alert()` ở trên hoạt động ổn cho một demo, nhưng trong ứng dụng thực tế bạn muốn lỗi nằm **bên trong UI** của mình để có thể render một thông báo ngay cạnh form. Mẫu thiết kế đúng chuẩn của React 19 là kết hợp một Action với **`useActionState`**: action của bạn bọc logic trong một `try/catch` và **trả về một object error state** thay vì throw. React lưu giá trị trả về đó làm state mới, rồi bạn render nó.

> [!IMPORTANT]
> Một Action nên **return** một object error/result thay vì để một exception thoát ra ngoài. Một lỗi bị throw bên trong một Action sẽ nổi lên (bubble up) tới error boundary gần nhất và unmount form của bạn. Trả về một object state có thể serialize giúp giữ form được mount và cho phép bạn hiển thị một thông báo thân thiện trong khi vẫn bảo toàn dữ liệu người dùng đã nhập.

```jsx
// Form Action with try/catch + returned error state via useActionState
import { useActionState } from "react";

export const SubscribeForm = () => {
  // useActionState(actionFn, initialState) -> [state, formAction, isPending]
  const [state, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const email = formData.get("email");

      // Basic client-side validation: return an error, don't throw
      if (!email || !email.includes("@")) {
        return { ok: false, error: "Please enter a valid email." };
      }

      try {
        const res = await fetch("https://api.example.com/subscribe", {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        });

        // Convert non-2xx responses into a returned error state
        if (!res.ok) {
          return { ok: false, error: "Server rejected the request." };
        }

        return { ok: true, error: null }; // Success state
      } catch (networkError) {
        // Network/parse failures land here — surface them in the UI
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    { ok: false, error: null } // initial state
  );

  return (
    <form action={formAction}>
      <input type="email" name="email" placeholder="you@example.com" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Subscribe"}
      </button>

      {/* Render the returned state instead of using alert() */}
      {state.error && <p style={{ color: "crimson" }}>{state.error}</p>}
      {state.ok && <p style={{ color: "green" }}>Subscribed! 🎉</p>}
    </form>
  );
};
```

**Tóm tắt mẫu thiết kế:**
* Bọc lời gọi `await` rủi ro trong một `try/catch`.
* Khi thất bại, `return { ok: false, error: "..." }` — không bao giờ throw cho các lỗi được lường trước.
* Khi thành công, `return { ok: true, error: null }`.
* Đọc trực tiếp `state.error` / `state.ok` và `isPending` trong JSX để có một form hoàn toàn khép kín (self-contained).

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về React 19. Nhấp vào **Reveal Answer** để xác nhận.

### 1. React Compiler làm gì, và nó ảnh hưởng thế nào đến các hook render thông thường?
<details>
  <summary><b>Reveal Answer</b></summary>

  React Compiler tự động chèn các kiểm tra memoization vào component của bạn trong giai đoạn build. Việc này tự động ngăn các component và giá trị re-render không cần thiết, khiến các lời gọi `useMemo` và `useCallback` thủ công phần lớn trở nên dư thừa. Nó chỉ có thể tối ưu các component tuân theo Rules of React (render thuần khiết, không mutate prop), và nó an toàn bỏ qua bất kỳ component nào phá vỡ các quy tắc đó.
</details>

### 2. Làm thế nào để trích xuất giá trị input bên trong một Form Action của React 19?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn gán thuộc tính `name` cho phần tử input (ví dụ `<input name="username" />`). Trong hàm action, React truyền một đối tượng `FormData` làm tham số đầu tiên. Bạn có thể đọc giá trị bằng cách gọi `formData.get("username")`.
</details>

### 3. Form Action của React 19 có gây tải lại trang không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Khi một async function được truyền vào thuộc tính `<form action={...}>`, React tự động ghi đè hành vi submit mặc định của trình duyệt. Nó chạy action bất đồng bộ, ngăn mọi việc tải lại trang mà không cần viết `e.preventDefault()`.
</details>

### 4. Bạn nên xử lý lỗi bên trong một Form Action như thế nào để chúng hiển thị trong UI?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bọc logic bất đồng bộ trong một `try/catch` và **return** một object error state có thể serialize (ví dụ `{ ok: false, error: "Network error" }`) thay vì throw. Kết hợp action với `useActionState(actionFn, initialState)`, hook này lưu giá trị trả về làm state. Sau đó bạn render trực tiếp `state.error` trong JSX. Nếu throw, lỗi sẽ bubble lên một error boundary và unmount form, làm mất dữ liệu người dùng đã nhập.
</details>

### 5. Một Form Action có thể xử lý việc upload tệp HTML gốc (native) không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì Form Actions của React 19 nhận đối tượng `FormData` tiêu chuẩn của trình duyệt, nó tự nhiên hỗ trợ các input dạng file:
  ```javascript
  const avatarFile = formData.get("avatar"); // returns the File object
  ```
  Bạn có thể gửi trực tiếp đối tượng file này tới server API của mình bằng các lời gọi fetch `multipart/form-data` tiêu chuẩn.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Action gửi phản hồi bất đồng bộ
1. Tạo một component `FeedbackAction.tsx` bên trong `src/components/` (hoặc `.jsx` nếu không dùng TypeScript).
2. Tạo một form với hai input: `title` (text) và `comments` (textarea). Đảm bảo chúng có thuộc tính `name` tương ứng.
3. Viết một hàm bất đồng bộ `sendFeedbackAction` đọc cả hai giá trị từ `formData` và mô phỏng một lời gọi mạng:
   ```javascript
   const sendFeedbackAction = async (formData) => {
     const title = formData.get("title");
     const comments = formData.get("comments");
     // Simulate delay
     await new Promise((resolve) => setTimeout(resolve, 2000));
     alert(`Feedback Received: ${title} - ${comments}`);
   };
   ```
4. Gắn hàm này vào `<form action={...}>` và kiểm tra hành vi submit.
5. **Mục tiêu nâng cao:** Tạo một component `SubmitButton.tsx` riêng, gọi `useFormStatus()` bên trong nó, và disable nút (hiển thị "Submitting...") khi `pending` là `true`. Hãy nhớ `useFormStatus` phải được đọc từ một component con *bên trong* form, không phải component render ra `<form>`.

### 🛠️ Bài tập 2: Form Subscribe có validate với Error State trả về
1. Tạo `SubscribeForm.tsx` và dùng `useActionState` để quản lý kết quả của form.
2. Trong action, validate rằng trường `email` chứa ký tự `@`. Nếu không, **return** `{ ok: false, error: "Please enter a valid email." }` — không throw.
3. Bọc một `fetch` mô phỏng (hoặc một promise `setTimeout` reject ngẫu nhiên) trong một `try/catch`. Khi bắt được lỗi, return `{ ok: false, error: "Network error. Please try again." }`.
4. Khi thành công, return `{ ok: true, error: null }`.
5. Trong JSX, render thông báo lỗi màu đỏ khi `state.error` được set, một thông báo thành công màu xanh khi `state.ok` là `true`, và disable nút submit khi `isPending` là `true`.
6. **Kiểm chứng:** Submit một email không hợp lệ và xác nhận form vẫn được mount với dữ liệu đã nhập còn nguyên và lỗi hiển thị inline (không tải lại trang, không crash).
