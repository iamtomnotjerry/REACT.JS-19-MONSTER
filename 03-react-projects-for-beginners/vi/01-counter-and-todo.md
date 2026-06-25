# Dự án 1 & 2: Counter & Todo List 🚀

Trong bài học này, chúng ta sẽ xây dựng hai dự án đầu tiên dành cho người mới bắt đầu: một **ứng dụng Counter** và một **Todo List**. Những dự án này là nền tảng cốt lõi của việc phát triển React tương tác, giúp luyện tập quản lý state (`useState`), gắn kết event, điều khiển form và các thao tác mảng bất biến (immutable).

---

## 🔢 Dự án 1: Ứng dụng Counter

Counter là "Hello World" kinh điển của state trong React. Nó cho phép chúng ta xem và thay đổi một state dạng số bằng các nút bấm.

### Các khái niệm chính được luyện tập:
* Quản lý state dạng số với `useState`.
* Event handler (`onClick`).
* Cập nhật dạng hàm (`prev => prev + 1`) để đảm bảo tính chính xác của state.

### Triển khai từng bước (`Counter.jsx`)

Tạo một file component tại `src/components/Counter.jsx` và chèn đoạn code sau:

```jsx
import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  // 1. Functional updates are a best practice to avoid stale state bugs
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Project 1: React Counter</h2>
      <div style={styles.counterBox}>
        <h1 style={styles.number}>{count}</h1>
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnDecrement} onClick={decrement}>- Decrement</button>
        <button style={styles.btnReset} onClick={reset}>Reset</button>
        <button style={styles.btnIncrement} onClick={increment}>+ Increment</button>
      </div>
    </div>
  );
};

// Sleek inline styling system
const styles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "400px",
    margin: "20px auto",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: {
    color: "#2c3e50",
    marginBottom: "20px"
  },
  counterBox: {
    background: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  number: {
    fontSize: "4rem",
    margin: "0",
    color: "#2980b9"
  },
  btnGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px"
  },
  btnIncrement: {
    flex: 1,
    padding: "10px 15px",
    backgroundColor: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnDecrement: {
    flex: 1,
    padding: "10px 15px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  btnReset: {
    padding: "10px 15px",
    backgroundColor: "#95a5a6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
```

---

## 📝 Dự án 2: Ứng dụng Todo List

Dự án Todo List chuyển từ những con số đơn giản sang việc quản lý **mảng các object**. Chúng ta sẽ hỗ trợ thêm task, đánh dấu task hoàn thành và xóa task.

### Các khái niệm chính được luyện tập:
* **Controlled Input**: Gắn kết các trường input với các biến state cục bộ.
* **Cập nhật bất biến (Immutable Updates)**: Tạo bản sao của mảng bằng spread operator (`...`) hoặc `.filter()`, thay vì sửa đổi trực tiếp mảng state.
* **Render danh sách**: Lặp qua các phần tử bằng `.map()` và gán thuộc tính `key` riêng biệt.

### Triển khai từng bước (`Todo.jsx`)

Tạo một file component tại `src/components/Todo.jsx` và chèn đoạn code sau:

```jsx
import { useState } from 'react';

export const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. ADD ITEM: Return a new array containing existing items plus the new item
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false
    };

    setTodos([...todos, newTodo]);
    setInput(""); // Clear input box
  };

  const toggleComplete = (id) => {
    // 2. UPDATE ITEM: Map through and create a copy of the changed object
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    // 3. DELETE ITEM: Filter out the item to create a new array
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div style={todoStyles.card}>
      <h2 style={todoStyles.title}>Project 2: React Todo List</h2>
      <form onSubmit={handleSubmit} style={todoStyles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          style={todoStyles.input}
        />
        <button type="submit" style={todoStyles.addBtn}>Add</button>
      </form>

      <ul style={todoStyles.list}>
        {todos.map((todo) => (
          <li key={todo.id} style={todoStyles.item}>
            <span
              onClick={() => toggleComplete(todo.id)}
              style={{
                ...todoStyles.text,
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#95a5a6" : "#2c3e50"
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)} style={todoStyles.removeBtn}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && <p style={todoStyles.emptyText}>No tasks added yet!</p>}
    </div>
  );
};

const todoStyles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "500px",
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  title: {
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: "20px"
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem"
  },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 10px",
    borderBottom: "1px solid #eee"
  },
  text: {
    cursor: "pointer",
    flex: 1,
    fontSize: "1.1rem"
  },
  removeBtn: {
    padding: "5px 10px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  emptyText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "20px"
  }
};
```

---

## ⚠️ Thực hành thiết yếu: Quy tắc bất biến (Immutability)

> [!IMPORTANT]
> Bạn **không bao giờ** được mutate (sửa đổi trực tiếp) state của React.
> - **Sai**: `todos.push(newTodo)` rồi sau đó `setTodos(todos)`.
> - **Đúng**: `setTodos([...todos, newTodo])`.
> React sử dụng so sánh tham chiếu nông (shallow reference comparison) để xác định xem state đã được cập nhật hay chưa. Nếu bạn mutate trực tiếp mảng, tham chiếu bộ nhớ vẫn giữ nguyên, và React sẽ không kích hoạt re-render.

---

## 🧠 Kiểm tra kiến thức

Trả lời những câu hỏi sau để kiểm tra mức độ hiểu của bạn về các dự án dành cho người mới bắt đầu này. Nhấn **Reveal Answer** để xác minh.

### 1. Tại sao React yêu cầu một prop `key` duy nhất cho các phần tử bên trong danh sách `.map()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sử dụng prop `key` trong quá trình **Reconciliation** (re-render danh sách). Key đóng vai trò như một ID ổn định cho mỗi phần tử, cho React biết phần tử nào đã được thêm, thay đổi hay xóa. Nếu không có key, React phải re-render toàn bộ cấu trúc danh sách, làm chậm hiệu năng render và gây ra các vấn đề với focus của input.
</details>

### 2. Chúng ta có thể dùng chỉ số mảng (`index`) làm prop `key` không? Điều đó có thể gây ra những vấn đề gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mặc dù React cho phép điều này, việc dùng chỉ số mảng làm key là một anti-pattern đối với danh sách động. Nếu các phần tử trong danh sách được sắp xếp lại, bị xóa, hoặc chèn vào giữa, chỉ số sẽ thay đổi đối với các phần tử hiện có. Điều này làm rối engine reconciliation của React, dẫn đến các lỗi render (chẳng hạn input văn bản nằm sai dòng) và làm giảm hiệu năng.
</details>

### 3. "Controlled input" trong React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Controlled input là một phần tử `<input>` mà giá trị của nó được điều khiển bởi một biến state của React (qua thuộc tính `value`) và được cập nhật thông qua một state setter của React (qua event listener `onChange`). Điều này khiến React trở thành nguồn chân lý duy nhất (single source of truth) cho nội dung của input.
</details>

### 4. Spread operator (`...`) là gì và tại sao nó được sử dụng thường xuyên đến vậy trong các thay đổi state của React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Spread operator sao chép các phần tử của một mảng hoặc object hiện có vào một mảng hoặc object literal hoàn toàn mới: `[...existingArray, newItem]`. Nó được sử dụng vì state của React phải được cập nhật một cách bất biến. Spread operator tạo ra một tham chiếu object hoàn toàn mới, báo hiệu cho React re-render.
</details>

### 5. Tại sao chúng ta bọc các event handler trong form bằng `e.preventDefault()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Theo mặc định, các form HTML tiêu chuẩn sẽ tải lại (refresh) trang trình duyệt khi được submit. Việc gọi `e.preventDefault()` báo cho trình duyệt hủy bỏ hành động mặc định này, cho phép code React xử lý sự kiện submit một cách bất đồng bộ (ví dụ cập nhật state cục bộ hoặc gọi API) mà không tải lại trang web.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Các phép toán Counter nâng cao
1. Render `<Counter />` bên trong `App.jsx` của bạn.
2. Thêm một trường text input vào counter.
3. Cho phép người dùng nhập một mức bước (step) tùy chỉnh (ví dụ `5`), để khi nhấn nút Increment, count tăng thêm `5` thay vì `1`.

### 🛠️ Bài tập 2: Xóa tất cả task & Huy hiệu đếm số
1. Mở component `<Todo />` của bạn.
2. Thêm một huy hiệu (badge) hoặc một đoạn văn ở dưới cùng hiển thị: "Pending tasks: X" (tính từ số lượng các phần tử chưa hoàn thành).
3. Thêm một nút "Clear All" để kích hoạt một thay đổi state, đặt lại mảng `todos` về `[]`.
