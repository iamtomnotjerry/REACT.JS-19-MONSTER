# Styling React Components 🎨

React cung cấp nhiều cách để áp dụng các kiểu dáng CSS cho component của bạn. Trong bài học này, chúng ta sẽ tập trung vào ba phương pháp định kiểu chính: **External Stylesheets (CSS ngoài)**, **Inline Styles (CSS trực tiếp)**, và **Style Objects (Đối tượng CSS)**.

---

## ⚡ 1. External Stylesheets (Cách tiếp cận tiêu chuẩn)

Cách phổ biến nhất để định kiểu cho các component React là viết CSS tiêu chuẩn trong một tệp stylesheet riêng biệt và import nó vào tệp React của bạn.

### Cách sử dụng CSS ngoài:
1. Tạo một tệp CSS (ví dụ: `Button.css`):
```css
/* Button.css */
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
}
```

2. Import và áp dụng các class CSS bên trong JSX:
```jsx
// Button.jsx
import './Button.css';

const Button = () => {
  return <button className="btn-primary">Click Me</button>;
};
```

> [!IMPORTANT]
> **Tại sao lại dùng `className` thay vì `class`?**
> Trong HTML tiêu chuẩn, chúng ta sử dụng thuộc tính `class`. Nhưng trong React/JSX, chúng ta **bắt buộc phải sử dụng `className`**. Lý do là vì JSX được biên dịch thành JavaScript, và từ khóa `class` đã là từ khóa dành riêng (reserved keyword) của JavaScript (dùng để khai báo Class ES6).

---

## ⚡ 2. Inline Styles (Cú pháp ngoặc nhọn kép)

Trong JSX, bạn chỉ định các inline style bằng thuộc tính `style`. Thay vì truyền một chuỗi văn bản thông thường (như trong HTML truyền thống), bạn phải truyền một **object JavaScript**. Điều này dẫn đến cú pháp dấu ngoặc nhọn kép đặc trưng: `style={{ ... }}`.
- Cặp ngoặc nhọn **ngoài cùng** `{}` để chuyển sang thế giới biểu thức JavaScript.
- Cặp ngoặc nhọn **bên trong** `{}` biểu thị object literal của JavaScript.

```jsx
const InlineStyledComponent = () => {
  return (
    <h1 style={{ color: "lightblue", fontSize: "24px", textAlign: "center" }}>
      Hello, Styled React!
    </h1>
  );
};
```

### ⚠️ Quy tắc cú pháp quan trọng: Thuộc tính camelCase
Trong CSS tiêu chuẩn, các tên thuộc tính được viết theo kiểu kebab-case (ví dụ: `background-color`, `font-size`). Vì inline style trong React được viết dưới dạng các đối tượng JavaScript, các tên thuộc tính **bắt buộc phải viết theo quy tắc camelCase**:

| CSS Tiêu chuẩn | React JSX Style |
| :--- | :--- |
| `background-color` | `backgroundColor` |
| `font-size` | `fontSize` |
| `padding-left` | `paddingLeft` |
| `border-radius` | `borderRadius` |

*Lưu ý: Các giá trị phải được bọc trong dấu ngoặc kép nếu chúng là chuỗi (ví dụ: `"20px"`, `"red"`). Đôi khi các con số có thể được viết trực tiếp mà không cần đơn vị, khi đó React sẽ tự động hiểu đơn vị mặc định là pixel (ví dụ: `padding: 15` sẽ được biên dịch thành `15px`).*

---

## ⚡ 3. Style Objects (Cách tiếp cận sạch sẽ & ngăn nắp)

Để giữ cho template JSX của bạn sạch sẽ và dễ đọc hơn, bạn có thể tách các quy tắc styling ra thành một biến object JavaScript riêng biệt thay vì viết tất cả inline.

```jsx
const CardComponent = () => {
  const cardStyles = {
    backgroundColor: "#f0f0f0",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    color: "#333"
  };

  const titleStyles = {
    color: "darkblue",
    fontSize: "20px"
  };

  return (
    <div style={cardStyles}>
      <h2 style={titleStyles}>Style Card Title</h2>
      <p>This card is styled cleanly using external style objects.</p>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức (Chuẩn bị phỏng vấn)

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Styling Components. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao chúng ta lại viết `style={{ color: "red" }}` bằng hai cặp dấu ngoặc nhọn?
<details>
  <summary><b>Reveal Answer</b></summary>

  Cặp dấu ngoặc nhọn đầu tiên (bên ngoài) dùng để chuyển sang chế độ JavaScript trong JSX. Cặp dấu ngoặc nhọn thứ hai (bên trong) đại diện cho object JavaScript chứa các cặp thuộc tính-giá trị CSS.
</details>

### 2. Tại sao React sử dụng `className` thay vì `class` trong JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vì JSX là cú pháp mở rộng của JavaScript nên nó phải tránh sử dụng các từ khóa dành riêng của JavaScript. Từ khóa `class` được dùng để khai báo class ES6, do đó React thay thế bằng `className` để gán class CSS cho các phần tử HTML.
</details>

### 3. Làm thế nào để chuyển đổi thuộc tính CSS `text-align` sang inline style trong React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn chuyển nó thành định dạng camelCase: `textAlign` (ví dụ: `textAlign: "center"`).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Styled Card (Inline & Style Object)
1. Tạo một component tên là `StyledCard.jsx` bên trong `src/components/`.
2. Định nghĩa một style object:
   - Màu nền (Background color): `lightgray`
   - Đệm (Padding): `20px`
   - Bo góc (Border radius): `10px`
   - Màu chữ (Color): `darkblue`
3. Render một chiếc card chứa một thẻ `<h1>` và một đoạn văn, đồng thời áp dụng style object này cho container.
4. Import và render `<StyledCard />` bên trong `App.jsx` của bạn.

### 🛠️ Bài tập 2: Card sử dụng CSS ngoài
1. Tạo một tệp stylesheet `Card.css` trong thư mục `src/styles/` (hoặc trực tiếp bên trong `src/components/`).
2. Thêm class `.card-container` với các thuộc tính: border, padding, và box-shadow.
3. Tạo file component `Card.jsx` trong thư mục `src/components/`. Import file `Card.css` ở trên cùng.
4. Render container sử dụng thuộc tính `className="card-container"` để bọc một số văn bản.
5. Render component này trong `App.jsx` để kiểm tra kết quả hiển thị.
