# Dự án 5 & 6: Chuyển đổi giao diện (Theme Toggle) & Thanh tìm kiếm ẩn 🚀

Trong bài học này, chúng ta sẽ xây dựng ứng dụng **Chuyển đổi giao diện sáng/tối (Theme Toggle)** và **Thanh tìm kiếm ẩn (Hidden Search Bar)** (thanh tìm kiếm tự trượt ra khi bấm nút). Các dự án này tập trung vào **định dạng kiểu dáng có điều kiện (conditional styling)**, sự kiện mất focus của ô nhập (`onBlur`), và tạo hiệu ứng chuyển động mượt mà bằng state trong React.

---

## 🎨 Dự án 5: Chuyển đổi giao diện sáng/tối (Theme Toggle)

Dự án này sử dụng trạng thái boolean để chuyển đổi qua lại giữa giao diện sáng và tối, tự động thay đổi các giá trị màu sắc của component.

### Các khái niệm chính được thực hành:
* Lưu trữ trạng thái bật/tắt dạng boolean (`isDark`) trong state.
* Sử dụng toán tử điều kiện trong inline style: `color: isDark ? "#fff" : "#000"`.
* Tạo hiệu ứng chuyển đổi màu sắc nền mượt mà bằng CSS.

### Hướng dẫn triển khai từng bước (`ToggleTheme.jsx`)

Tạo tệp component tại `src/components/ToggleTheme.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => setIsDark((prev) => !prev);

  // Đối tượng style động thay đổi theo state
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
    transition: "all 0.4s ease", // Hiệu ứng chuyển màu mượt mà
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
      <h2>{isDark ? "Đã bật Chế độ tối 🌙" : "Đã bật Chế độ sáng ☀️"}</h2>
      <p style={{ margin: "5px 0" }}>Thay đổi giao diện sử dụng state của component.</p>
      <button style={btnStyles} onClick={toggle}>
        Chuyển sang {isDark ? "Chế độ sáng" : "Chế độ tối"}
      </button>
    </div>
  );
};
```

---

## 🔍 Dự án 6: Thanh tìm kiếm ẩn (Hidden Search Bar)

Thanh tìm kiếm được ẩn đi cho đến khi người dùng nhấp vào biểu tượng kính lúp. Khi nhấp, ô nhập sẽ trượt ra mượt mà và tự động đặt con trỏ chuột (focus). Nếu người dùng nhấp ra ngoài, thanh tìm kiếm tự động thu lại.

### Các khái niệm chính được thực hành:
* **Sự kiện mất focus (`onBlur`)**: Tự động đóng thanh tìm kiếm khi người dùng nhấp chuột ra ngoài ô nhập.
* **Tự động focus (`autoFocus`)**: Đặt con trỏ chuột vào ô nhập ngay khi nó vừa hiển thị, giúp người dùng gõ phím được ngay.
* **Hiệu ứng trượt (Slide-Out Animation)**: Thay đổi chiều rộng (width) của input linh hoạt bằng inline styles.

### Hướng dẫn triển khai từng bước (`HiddenSearch.jsx`)

Tạo tệp component tại `src/components/HiddenSearch.jsx` và viết đoạn mã sau:

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
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Hiệu ứng trượt cao cấp
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
        placeholder="Nhập từ khóa tìm kiếm..."
        style={inputStyles}
        onBlur={() => setShowInput(false)} // Thu hồi ô nhập khi click ra ngoài
        autoFocus={showInput} // Tự động đặt con trỏ chuột khi mount
        key={showInput ? "open" : "closed"} // Dùng key để ép buộc render lại autoFocus
      />
      <button style={searchBtnStyles} onClick={() => setShowInput((prev) => !prev)}>
        {showInput ? "Đóng ✕" : "Tìm kiếm 🔍"}
      </button>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Sự kiện `onBlur` có tác dụng gì, và tại sao nó hữu ích trong thiết kế giao diện tìm kiếm?
<details>
  <summary><b>Reveal Answer</b></summary>

  Sự kiện `onBlur` được kích hoạt khi một phần tử input mất focus (ví dụ khi người dùng click chuột ra bất kỳ chỗ nào khác ngoài ô nhập). Trong các giao diện tìm kiếm, nó giúp tự động ẩn hoặc thu hồi thanh tìm kiếm khi người dùng không còn thao tác với nó nữa.
</details>

### 2. Tại sao ô nhập trong dự án Hidden Search lại cần thuộc tính `autoFocus`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu không có `autoFocus`, khi người dùng bấm nút tìm kiếm, ô nhập sẽ trượt mở ra nhưng người dùng bắt buộc phải click chuột vào ô nhập một lần nữa mới có thể gõ chữ. Thuộc tính `autoFocus` giúp tự động đặt con trỏ chuột vào ô nhập ngay lập tức, tiết kiệm cho người dùng một lần click.
</details>

### 3. Sự khác biệt giữa render có điều kiện (`condition && <Input />`) và style có điều kiện (`width: open ? "200px" : "0px"`) khi làm hiệu ứng chuyển động?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Render có điều kiện**: Sẽ thêm hoặc xóa phần tử khỏi cây DOM hoàn toàn. Bạn rất khó để áp dụng các hiệu ứng chuyển động CSS transition khi thêm/bớt phần tử theo cách này.
  - **Style có điều kiện**: Giữ nguyên phần tử trên cây DOM nhưng thay đổi các thuộc tính hiển thị như `width` hoặc `opacity`. Cách này giúp CSS transition (`transition: all 0.3s`) hoạt động và co giãn mượt mà.
</details>

### 4. Hiệu ứng transition "cubic-bezier" trong CSS là gì và tại sao nó tối ưu hơn "linear"?
<details>
  <summary><b>Reveal Answer</b></summary>

  `cubic-bezier` định nghĩa đường cong tốc độ chuyển động tùy chỉnh. Các transition dạng linear (tuyến tính) di chuyển với tốc độ không đổi từ đầu đến cuối nên nhìn rất đơ và giả tạo. Chuyển động bezier có tốc độ thay đổi (nhanh lúc đầu và chậm lại lúc sau), bắt chước quán tính vật lý thực tế nên tạo cảm giác cao cấp và mượt mà hơn nhiều.
</details>

### 5. Cách tốt nhất để áp dụng nhiều class CSS động trong React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể dùng cú pháp chuỗi truyền tham số (string interpolation) với dấu backtick:
  ```jsx
  className={`search-input ${isOpen ? "active" : "hidden"}`}
  ```
  Hoặc sử dụng các thư viện tiện ích như `clsx` hay `classnames` để gộp class dựa trên các cờ trạng thái.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Lưu trạng thái Giao diện đã chọn
1. Mở file `ToggleTheme.jsx`.
2. Lưu giá trị của state `isDark` vào `localStorage` bên trong một hook `useEffect` mỗi khi trạng thái này thay đổi.
3. Đọc dữ liệu từ `localStorage` khi khởi tạo state ban đầu để ứng dụng ghi nhớ chế độ giao diện sáng/tối mỗi khi người dùng tải lại trang.

### 🛠️ Bài tập 2: Bộ lọc danh sách tìm kiếm trực tiếp
1. Mở file `HiddenSearch.jsx`.
2. Tạo một mảng danh sách sản phẩm ở phía dưới thanh tìm kiếm: `const list = ["Apple", "Banana", "Cherry", "Date", "Elderberry"]`.
3. Theo dõi nội dung ô nhập bằng một state `query`.
4. Hiển thị danh sách kết quả đã được lọc bên dưới ô nhập, chỉ giữ lại những phần tử chứa ký tự trong biến `query`.
