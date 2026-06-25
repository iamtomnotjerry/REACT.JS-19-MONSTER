# Khởi tạo Kho lưu trữ Zustand & Kỹ thuật sử dụng Selectors 🐻

**Zustand** là một thư viện quản lý trạng thái (state management) nhỏ gọn, tốc độ nhanh và có khả năng mở rộng cao dành cho React. Thư viện này nổi tiếng nhờ cú pháp viết code cực kỳ tối giản (gần như không có code mẫu rườm rà), không yêu cầu các thẻ Context Provider bao bọc ứng dụng, và tận dụng các React hook làm giao diện tương tác chính.

---

## ⚡ 1. Hướng dẫn cài đặt

Để cài đặt Zustand vào dự án React của bạn, hãy chạy lệnh sau trong terminal:

```bash
npm install zustand
```

---

## 🧩 2. Tạo Store đầu tiên của bạn

Trong Zustand, một kho lưu trữ (store) bản chất là một React hook. Bạn tạo nó bằng cách sử dụng hàm **`create`**, nhận vào một hàm callback `set` để định nghĩa các giá trị state và các hàm hành động (actions) dùng để cập nhật các giá trị đó:

```javascript
import { create } from 'zustand';

// Khởi tạo một custom hook có tên là 'useCounterStore'
export const useCounterStore = create((set) => ({
  // 1. Các giá trị trạng thái (state values)
  count: 0,
  title: "Bộ đếm Zustand",

  // 2. Các hành động cập nhật state (actions)
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }), // Thay thế giá trị trực tiếp
  updateTitle: (newTitle) => set({ title: newTitle })
}));
```

---

## 🚀 3. Sử dụng State trong Store qua Selectors

Mặc dù bạn có thể giải nén (destructure) toàn bộ store cùng một lúc, thực tiễn khuyên dùng tốt nhất là sử dụng **Selectors**. Một selector báo cho Zustand biết chính xác những thuộc tính nào bạn muốn đăng ký lắng nghe dữ liệu. Điều này tối ưu hóa hiệu năng render bằng cách ngăn component bị vẽ lại khi các thuộc tính không liên quan trong store thay đổi:

```jsx
import { useCounterStore } from '../stores/useCounterStore';

export const CounterDisplay = () => {
  // 1. Selector chỉ đăng ký lắng nghe duy nhất thuộc tính count
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div style={styles.container}>
      <h2>Bộ đếm: {count}</h2>
      <button onClick={increment}>Tăng số</button>
    </div>
  );
};

// 2. Một component khác chỉ đăng ký lắng nghe thuộc tính title
export const HeaderTitle = () => {
  const title = useCounterStore((state) => state.title);
  console.log("HeaderTitle Rendered!"); // Dòng này sẽ KHÔNG chạy khi ta click Tăng số ở trên!
  
  return <h1>{title}</h1>;
};

const styles = { container: { padding: "20px", border: "1px solid #ccc", borderRadius: "5px" } };
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao Zustand không yêu cầu bất kỳ thẻ bao bọc `<Provider>` nào ở gốc ứng dụng React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các store của Zustand được tạo ra như các **bao đóng ngoài (external closures / module-level state scopes)** nằm hoàn toàn độc lập bên ngoài cây component của React. Khi một component gọi custom hook store này, nó sẽ đăng ký lắng nghe trực tiếp đến store bên ngoài này. Do dữ liệu nằm ngoài React nên ta không cần dùng đến React Context Provider bao bọc ở gốc ứng dụng.
</details>

### 2. "Selector" trong Zustand là gì, và tại sao nó cực kỳ quan trọng đối với hiệu năng render?
<details>
  <summary><b>Reveal Answer</b></summary>

  Selector là một hàm callback truyền vào hook store để chỉ lọc ra một nhánh nhỏ của state mong muốn (ví dụ: `(state) => state.count`). Nó quan trọng cho hiệu năng vì nếu bạn giải nén trực tiếp không qua selector (ví dụ: `const { count, title } = useStore()`), component sẽ tự động re-render mỗi khi có *bất kỳ* thuộc tính nào trong store thay đổi. Dùng selector giúp component chỉ re-render khi thuộc tính được chọn thay đổi.
</details>

### 3. Hàm `set` trong Zustand cập nhật state theo cơ chế gộp sâu (deep merge) hay gộp nông (shallow merge)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `set` của Zustand thực hiện cơ chế **gộp nông (shallow merge)** đối tượng trả về với state hiện tại. Nếu store có cấu trúc `{ count: 0, title: "Tiêu đề" }`, việc gọi `set({ count: 1 })` sẽ giữ nguyên thuộc tính `title`. Tuy nhiên đối với các object lồng nhau sâu, bạn bắt buộc phải tự gộp các thuộc tính thủ công sử dụng toán tử spread (`...`).
</details>

### 4. Chúng ta có thể định nghĩa các hành động (actions) của Zustand bên ngoài hàm khởi tạo `create()` được không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì store của Zustand là các module độc lập, bạn hoàn toàn có thể viết các hàm cập nhật state ở bên ngoài bằng cách sử dụng các hàm tiện ích của store, ví dụ: `useCounterStore.setState({ count: 100 })`. Việc khai báo action bên trong hàm `create` chỉ là quy ước giúp tổ chức tập trung state và logic tại một nơi dễ quản lý.
</details>

### 5. Trong Zustand, làm thế nào để đọc các giá trị state hiện tại bên trong một hành động mà không cần thông qua tham số của hàm `set`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `create()` cung cấp cho bạn một tham số callback thứ hai là **`get`**:
  ```javascript
  const useStore = create((set, get) => ({
    count: 0,
    checkAndIncrement: () => {
      const currentCount = get().count; // Đọc giá trị state hiện tại trực tiếp
      if (currentCount < 10) set({ count: currentCount + 1 });
    }
  }));
  ```
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Kho quản lý Công việc (Task Store) bằng Zustand
1. Tạo một store tên là `useTodoStore.js` trong thư mục `src/stores/`.
2. Định nghĩa một mảng state `todos` mặc định là mảng rỗng.
3. Thêm 3 hành động (actions) bên trong store:
   - `addTodo(text)`: Thêm một công việc mới `{ id: Date.now(), text, completed: false }`.
   - `toggleTodo(id)`: Lặp qua mảng `todos` và đảo ngược giá trị `completed` cho phần tử có ID trùng khớp.
   - `deleteTodo(id)`: Lọc bỏ phần tử có ID trùng khớp ra khỏi mảng.
4. Xây dựng một component React `TodoList.tsx` tiêu thụ store này thông qua các selectors và hiển thị danh sách công việc lên màn hình.
