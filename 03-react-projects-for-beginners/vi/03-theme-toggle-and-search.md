# Dự án 5 & 6: Chuyển đổi giao diện (Theme Toggle) & Thanh tìm kiếm ẩn 🚀

Trong bài học này, chúng ta sẽ xây dựng một **ứng dụng Chuyển đổi giao diện (Theme Toggle)** (bộ chuyển đổi chế độ Sáng/Tối) và một **Thanh tìm kiếm ẩn (Hidden Search Bar)** (ô nhập tìm kiếm tương tác tự trượt ra khi cần). Các dự án này dạy về **định dạng kiểu dáng có điều kiện (conditional styling)**, các trình kích hoạt sự kiện focus (`onBlur`), và tạo hiệu ứng động cho layout bằng state trong React.

---

## 🎨 Dự án 5: Ứng dụng Chuyển đổi giao diện (Theme Toggle)

Dự án này sử dụng state dạng boolean để chuyển đổi qua lại giữa giao diện tối và sáng, tự động cập nhật các thuộc tính kiểu dáng trên component.

### Các khái niệm chính được thực hành:
* Lưu trữ các giá trị bật/tắt (`isDark`) trong state.
* Viết toán tử ba ngôi (ternary) trong inline style: `color: isDark ? "#fff" : "#000"`.
* Tạo các hiệu ứng chuyển đổi trạng thái thị giác mượt mà bằng CSS.

### Hướng dẫn triển khai từng bước (`ToggleTheme.jsx`)

Tạo tệp `src/components/ToggleTheme.jsx` và chèn đoạn mã sau:

```jsx
import { useState } from 'react';

export const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => setIsDark((prev) => !prev);

  // Dynamic style object based on state
  const containerStyles = {
    backgroundColor: isDark ? "#121212" : "#f5f6fa",
    color: isDark ? "#f5f6fa" : "#121212",
    height: "220px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.4s ease", // Smooth background color swap
    maxWidth: "400px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif"
  };

  const btnStyles = {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: isDark ? "#f1c40f" : "#34495e",
    color: isDark ? "#121212" : "#ffffff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "15px",
    transition: "background 0.3s ease"
  };

  return (
    <div style={containerStyles}>
      <h2>{isDark ? "Dark Mode Active 🌙" : "Light Mode Active ☀️"}</h2>
      <p style={{ margin: "5px 0" }}>Theme toggle uses local component state.</p>
      <button style={btnStyles} onClick={toggle}>
        Switch to {isDark ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
};
```

---

## 🔍 Dự án 6: Thanh tìm kiếm ẩn (Hidden Search Bar)

Một thanh tìm kiếm được ẩn đi cho đến khi người dùng nhấp vào biểu tượng kính lúp. Sau khi nhấp, nó sẽ mở rộng ra mượt mà và tự động focus vào ô nhập. Nếu người dùng nhấp ra ngoài, thanh tìm kiếm sẽ thu lại.

### Các khái niệm chính được thực hành:
* **Sự kiện focus (`onBlur`)**: Đóng thanh tìm kiếm khi ô nhập mất focus (hành vi nhấp ra ngoài).
* **AutoFocus**: Tự động đặt con trỏ vào ô nhập tìm kiếm ngay khi nó được render.
* **Hiệu ứng trượt động (Animated Slide-Outs)**: Điều chỉnh chiều rộng (width) của input một cách linh hoạt bằng inline styling.

### Hướng dẫn triển khai từng bước (`HiddenSearch.jsx`)

Tạo tệp `src/components/HiddenSearch.jsx` và chèn đoạn mã sau:

```jsx
import { useState } from 'react';

export const HiddenSearch = () => {
  const [showInput, setShowInput] = useState(false);

  const containerStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    maxWidth: "500px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif"
  };

  const inputStyles = {
    width: showInput ? "220px" : "0px",
    opacity: showInput ? 1 : 0,
    padding: showInput ? "10px 15px" : "0px",
    border: showInput ? "2px solid #3498db" : "0px solid transparent",
    borderRadius: "25px",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Premium slide ease
  };

  const searchBtnStyles = {
    padding: "10px 20px",
    backgroundColor: showInput ? "#e74c3c" : "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "all 0.3s ease"
  };

  return (
    <div style={containerStyles}>
      <input
        type="text"
        placeholder="Type search queries..."
        style={inputStyles}
        onBlur={() => setShowInput(false)} // Retract input when clicking away
        autoFocus={showInput} // Auto focus input when mounted
        key={showInput ? "open" : "closed"} // Key trick to force fresh autoFocus render
      />
      <button style={searchBtnStyles} onClick={() => setShowInput((prev) => !prev)}>
        {showInput ? "Close ✕" : "Search 🔍"}
      </button>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về những dự án trung cấp này. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Sự kiện `onBlur` có tác dụng gì, và nó hữu ích như thế nào trong các form tìm kiếm trên giao diện?
<details>
  <summary><b>Reveal Answer</b></summary>

  Sự kiện `onBlur` được kích hoạt khi một phần tử input mất focus (tức là khi người dùng nhấp vào bất kỳ nơi nào khác bên ngoài ô nhập). Trong các giao diện tìm kiếm, nó hữu ích để tự động thu lại hoặc ẩn thanh tìm kiếm khi người dùng đã thao tác xong với nó.
</details>

### 2. Tại sao ô nhập trong dự án Hidden Search lại cần `autoFocus`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu không có `autoFocus`, khi người dùng nhấp vào nút tìm kiếm, ô nhập sẽ trượt mở ra nhưng người dùng phải nhấp vào bên trong ô nhập một lần nữa mới có thể bắt đầu gõ phím. `autoFocus` sẽ tự động đặt con trỏ văn bản vào ô nhập ngay lập tức, giúp người dùng tiết kiệm một lần nhấp.
</details>

### 3. Sự khác biệt giữa render có điều kiện (`condition && <Input />`) và style có điều kiện (`width: open ? "200px" : "0px"`) khi tạo hiệu ứng động cho các ô nhập là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Render có điều kiện (Conditional Rendering)** thêm vào hoặc xóa hẳn phần tử khỏi DOM. Bạn không thể dễ dàng áp dụng các CSS transition tiêu chuẩn khi thêm phần tử theo cách này.
  - **Style có điều kiện (Conditional Styling)** giữ phần tử lại trong DOM nhưng điều chỉnh các thuộc tính thị giác như `width` hoặc `opacity`. Cách này cho phép các CSS transition (`transition: all 0.3s`) tạo hiệu ứng mở rộng mượt mà.
</details>

### 4. CSS transition "cubic-bezier" là gì và tại sao nó được ưa chuộng hơn các giá trị "linear"?
<details>
  <summary><b>Reveal Answer</b></summary>

  `cubic-bezier` định nghĩa một đường cong tốc độ tùy chỉnh (easing) cho các transition. Các transition dạng linear di chuyển với tốc độ không đổi, trông không tự nhiên. Các transition có easing bắt đầu nhanh rồi chậm lại (hoặc ngược lại), mô phỏng quán tính vật lý trong thế giới thực và mang lại cảm giác cao cấp, chuyên nghiệp hơn nhiều.
</details>

### 5. Trong React, cách làm tốt nhất (best practice) để áp dụng nhiều class CSS một cách động là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể dùng cú pháp nội suy chuỗi (string interpolation):
  ```jsx
  className={`search-input ${isOpen ? "active" : "hidden"}`}
  ```
  Hoặc sử dụng các thư viện tiện ích như `clsx` hay `classnames` để gộp các class dựa trên các cờ trạng thái (state flags).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Lưu giữ lựa chọn giao diện
1. Mở `ToggleTheme.jsx`.
2. Lưu giá trị của `isDark` vào `localStorage` bên trong một hook `useEffect` mỗi khi nó thay đổi.
3. Đọc giá trị giao diện từ `localStorage` trong lúc thiết lập state ban đầu để ứng dụng ghi nhớ giao diện khi tải lại trang.

### 🛠️ Bài tập 2: Danh sách thư mục tìm kiếm trực tiếp
1. Mở `HiddenSearch.jsx`.
2. Thêm một danh sách các mục bên dưới thanh tìm kiếm: `const list = ["Apple", "Banana", "Cherry", "Date", "Elderberry"]`.
3. Theo dõi nội dung văn bản của ô nhập bằng một biến state `query`.
4. Render một phiên bản đã lọc của danh sách bên dưới ô nhập, chỉ chứa những tên khớp với `query`.
