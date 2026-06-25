# Dự án 1 & 2: Bộ đếm & Danh sách công việc (Todo List) 🚀

Trong bài học này, chúng ta sẽ xây dựng hai dự án khởi đầu: **Bộ đếm (Counter)** và **Danh sách công việc (Todo List)**. Đây là những dự án nền tảng trong lập trình React, giúp thực hành quản lý trạng thái (`useState`), liên kết sự kiện, biểu mẫu đầu vào và thao tác bất biến trên mảng dữ liệu.

---

## 🔢 Dự án 1: Ứng dụng Bộ đếm (Counter)

Bộ đếm là dự án kinh điển khi bắt đầu học quản lý state trong React. Nó cho phép người dùng thay đổi và hiển thị một giá trị số thông qua các nút bấm.

### Các khái niệm chính được thực hành:
* Quản lý trạng thái số học bằng `useState`.
* Các hàm xử lý sự kiện click (`onClick`).
* Cập nhật state dạng callback (`prev => prev + 1`) để đảm bảo dữ liệu luôn chính xác.

### Hướng dẫn triển khai từng bước (`Counter.jsx`)

Tạo một tệp component tại `src/components/Counter.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const Counter = () => {
  const [count, setCount] = useState(0);

  // 1. Cập nhật state dạng hàm là best practice để tránh lỗi dữ liệu bất đồng bộ
  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);
  const reset = () => setCount(0);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Dự án 1: Bộ đếm React</h2>
      <div style={styles.counterBox}>
        <h1 style={styles.number}>{count}</h1>
      </div>
      <div style={styles.btnGroup}>
        <button style={styles.btnDecrement} onClick={decrement}>- Giảm</button>
        <button style={styles.btnReset} onClick={reset}>Đặt lại</button>
        <button style={styles.btnIncrement} onClick={increment}>+ Tăng</button>
      </div>
    </div>
  );
};

// Hệ thống phong cách CSS Inline
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

## 📝 Dự án 2: Danh sách công việc (Todo List)

Dự án Todo List chuyển đổi từ quản lý một con số đơn giản sang quản lý một **mảng các đối tượng (array of objects)**. Chúng ta sẽ hỗ trợ các tính năng: thêm mới, đánh dấu hoàn thành và xóa các công việc.

### Các khái niệm chính được thực hành:
* **Controlled Inputs (Đầu vào được kiểm soát)**: Liên kết ô nhập liệu trực tiếp với biến state của React.
* **Immutable Updates (Cập nhật bất biến)**: Sử dụng toán tử spread (`...`) hoặc hàm `.filter()` để tạo bản sao mảng mới thay vì chỉnh sửa trực tiếp mảng state.
* **Render danh sách**: Sử dụng vòng lặp `.map()` để hiển thị các phần tử và gán thuộc tính `key` duy nhất.

### Hướng dẫn triển khai từng bước (`Todo.jsx`)

Tạo một tệp component tại `src/components/Todo.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. THÊM PHẦN TỬ: Trả về một mảng mới chứa các phần tử cũ cộng thêm phần tử mới
    const newTodo = {
      id: Date.now(),
      text: input,
      completed: false
    };

    setTodos([...todos, newTodo]);
    setInput(""); // Xóa sạch nội dung ô nhập
  };

  const toggleComplete = (id) => {
    // 2. CẬP NHẬT PHẦN TỬ: Map qua mảng để tạo bản sao object cần sửa đổi
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    // 3. XÓA PHẦN TỬ: Lọc bỏ phần tử để tạo ra mảng mới hoàn toàn
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div style={todoStyles.card}>
      <h2 style={todoStyles.title}>Dự án 2: Danh sách công việc</h2>
      <form onSubmit={handleSubmit} style={todoStyles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bạn cần làm gì hôm nay?"
          style={todoStyles.input}
        />
        <button type="submit" style={todoStyles.addBtn}>Thêm</button>
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
              Xóa
            </button>
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && <p style={todoStyles.emptyText}>Chưa có công việc nào!</p>}
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

## ⚠️ Nguyên tắc thực hành: Tính bất biến (Immutability)

> [!IMPORTANT]
> Bạn tuyệt đối **không được** chỉnh sửa trực tiếp dữ liệu state của React.
> - **Sai**: `todos.push(newTodo)` rồi gọi `setTodos(todos)`.
> - **Đúng**: `setTodos([...todos, newTodo])`.
> React sử dụng so sánh tham chiếu nông để nhận biết state có cập nhật hay không. Nếu bạn chỉnh sửa trực tiếp mảng cũ, địa chỉ bộ nhớ không thay đổi, React sẽ nghĩ dữ liệu không thay đổi và bỏ qua việc hiển thị lại giao diện UI.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao React yêu cầu thuộc tính `key` duy nhất cho các phần tử bên trong vòng lặp `.map()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sử dụng thuộc tính `key` trong quá trình **Reconciliation** (đối chiếu và render lại danh sách). Key hoạt động như một mã định danh duy nhất cho từng phần tử, báo cho React biết phần tử nào vừa được thêm, sửa hoặc xóa. Nếu không có key, React buộc phải render lại toàn bộ danh sách, gây chậm hiệu suất và lỗi liên quan đến việc focus của ô nhập.
</details>

### 2. Chúng ta có thể dùng chỉ số index của mảng để làm thuộc tính `key` không? Nó có thể gây ra lỗi gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mặc dù React cho phép sử dụng, nhưng dùng index của mảng làm key là một bad practice đối với các danh sách động. Nếu danh sách bị sắp xếp lại, xóa bớt hoặc thêm vào giữa, chỉ số index của các phần tử cũ sẽ bị thay đổi. Điều này khiến thuật toán đối chiếu của React bị nhầm lẫn, dẫn đến các lỗi render (ví dụ nội dung text input vẫn giữ ở dòng cũ) và giảm hiệu năng đáng kể.
</details>

### 3. "Controlled input" (đầu vào được kiểm soát) trong React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Controlled input là một phần tử `<input>` có giá trị hiển thị được điều khiển hoàn toàn bởi một biến state của React (thông qua thuộc tính `value`) và cập nhật thông qua hàm cập nhật state (thông qua sự kiện `onChange`). Việc này giúp React trở thành "nguồn chân lý duy nhất" (single source of truth) kiểm soát nội dung ô nhập.
</details>

### 4. Toán tử spread (`...`) là gì và tại sao nó được sử dụng thường xuyên khi thay đổi state?
<details>
  <summary><b>Reveal Answer</b></summary>

  Toán tử spread sao chép toàn bộ các phần tử của một mảng hoặc các thuộc tính của một object cũ vào một mảng hoặc object mới hoàn toàn: `[...existingArray, newItem]`. Nó được sử dụng vì state trong React yêu cầu cập nhật bất biến. Toán tử spread tạo ra một địa chỉ tham chiếu mới, báo cho React biết để kích hoạt hiển thị lại giao diện UI.
</details>

### 5. Tại sao chúng ta hay sử dụng hàm `e.preventDefault()` trong sự kiện submit của form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mặc định, các form HTML sẽ tải lại (refresh) toàn bộ trang web khi người dùng nhấn submit. Gọi hàm `e.preventDefault()` yêu cầu trình duyệt hủy bỏ hành động mặc định này, cho phép mã nguồn React tự xử lý việc submit một cách mượt mà (ví dụ như cập nhật state cục bộ hoặc gọi API) mà không làm tải lại trang.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Bộ đếm bước nhảy tùy chỉnh (Counter Step Input)
1. Render component `<Counter />` vào tệp `App.jsx` của bạn.
2. Thêm một ô nhập số (text hoặc number input) vào component bộ đếm.
3. Cho phép người dùng nhập một con số bước nhảy tùy chọn (ví dụ: `5`), để khi bấm nút Tăng (Increment) hoặc Giảm (Decrement), giá trị của đếm sẽ tăng hoặc giảm tương ứng là `5` đơn vị thay vì `1`.

### 🛠️ Bài tập 2: Tính năng Xóa sạch & Đếm số lượng công việc
1. Mở component `<Todo />` của bạn.
2. Thêm một nhãn thông tin nhỏ ở phía dưới danh sách: "Công việc chưa hoàn thành: X" (hãy tính toán số này dựa trên số lượng phần tử có thuộc tính `completed` là `false`).
3. Thêm một nút bấm "Xóa tất cả" để kích hoạt sự kiện dọn sạch toàn bộ mảng `todos` về lại mảng rỗng `[]`.
