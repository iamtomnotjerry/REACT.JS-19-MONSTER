# Styling React Components 🎨

React cung cấp nhiều cách để áp dụng các kiểu dáng CSS cho component của bạn. Trong bài học này, chúng ta sẽ tập trung vào các kiến thức cơ bản: **Inline Styles** (sử dụng dấu ngoặc nhọn kép) và **Style Objects** (khai báo các kiểu dáng dưới dạng biến JavaScript).

---

## ⚡ 1. Inline Styles (Cú pháp ngoặc nhọn kép)

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

---

## ⚠️ Quy tắc cú pháp quan trọng: Thuộc tính camelCase

Trong CSS tiêu chuẩn, các tên thuộc tính được viết theo kiểu kebab-case (ví dụ: `background-color`, `font-size`, `padding-left`).
Vì inline style trong React được viết dưới dạng các object JavaScript, nên các tên thuộc tính **phải được viết theo quy tắc camelCase** (ví dụ: `backgroundColor`, `fontSize`, `paddingLeft`).

| CSS Tiêu chuẩn | React JSX Style |
| :--- | :--- |
| `background-color` | `backgroundColor` |
| `font-size` | `fontSize` |
| `padding-left` | `paddingLeft` |
| `border-radius` | `borderRadius` |

> [!NOTE]
> Các giá trị phải được bọc trong dấu ngoặc kép nếu chúng là chuỗi (ví dụ: `"20px"`, `"center"`, `"red"`). Đôi khi các con số có thể được viết trực tiếp mà không cần đơn vị, khi đó React sẽ tự động hiểu đơn vị mặc định là pixel (ví dụ: `padding: 15` sẽ được biên dịch thành `15px`).

---

## ⚡ 2. Style Objects (Cách tiếp cận sạch sẽ & ngăn nắp)

Để giữ cho template JSX của bạn sạch sẽ và dễ đọc hơn, bạn có thể tách các quy tắc styling ra thành một biến object JavaScript riêng biệt thay vì viết tất cả inline.

```jsx
const CardComponent = () => {
  // Define styles as a JavaScript object
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

  // Reference the style objects inside JSX
  return (
    <div style={cardStyles}>
      <h2 style={titleStyles}>Style Card Title</h2>
      <p>This card is styled cleanly using external style objects.</p>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Styling Components. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao chúng ta lại viết `style={{ color: "red" }}` bằng hai cặp dấu ngoặc nhọn?
<details>
  <summary><b>Reveal Answer</b></summary>

  Cặp dấu ngoặc nhọn đầu tiên (bên ngoài) dùng để chuyển sang chế độ JavaScript trong JSX. Cặp dấu ngoặc nhọn thứ hai (bên trong) đại diện cho object JavaScript chứa các cặp thuộc tính-giá trị CSS.
</details>

### 2. Làm thế nào để chuyển đổi thuộc tính CSS `text-align` sang inline style trong React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn chuyển nó thành định dạng camelCase: `textAlign` (ví dụ: `textAlign: "center"`).
</details>

### 3. Sự khác biệt giữa viết inline style trực tiếp và sử dụng biến style object là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Về mặt chức năng, cả hai đều thực hiện cùng một nhiệm vụ. Tuy nhiên, sử dụng biến style object giúp mã nguồn JSX trông sạch sẽ, dễ đọc và giúp các style dễ bảo trì hoặc chia sẻ hơn trong phạm vi component.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Styled Card
1. Tạo một component tên là `StyledCard.jsx` bên trong `src/components/`.
2. Định nghĩa một style object:
   - Màu nền (Background color): `lightgray`
   - Đệm (Padding): `20px`
   - Bo góc (Border radius): `10px`
   - Màu chữ (Color): `darkblue`
3. Render một chiếc card chứa một thẻ `<h1>` và một đoạn văn, đồng thời áp dụng style object này cho container.
4. Import và render `<StyledCard />` bên trong `App.jsx` của bạn.
