# Xử lý sự kiện (Event Handling) trong React ⚡

React cho phép bạn xử lý các tương tác của người dùng (như click chuột, di chuyển chuột, gửi biểu mẫu và nhấn phím) một cách dễ dàng. Các sự kiện trong React được đặt tên theo quy tắc camelCase (như `onClick`) thay vì viết thường toàn bộ (như `onclick` trong HTML), và bạn sẽ truyền một hàm JavaScript làm trình xử lý sự kiện thay vì một chuỗi văn bản.

---

## ⚡ 1. Cú pháp xử lý sự kiện tiêu chuẩn

Dưới đây là cách bạn xử lý sự kiện click chuột vào nút bấm trong React:

### Lựa chọn A: Sử dụng một hàm được đặt tên (Khuyên dùng)
Cách tiếp cận này giúp mã nguồn sạch sẽ, đặc biệt là khi logic xử lý sự kiện phức tạp.

```jsx
const ClickButton = () => {
  const handleClick = () => {
    alert("Nút bấm đã được click! 🚀");
  };

  return <button onClick={handleClick}>Click vào tôi</button>;
};
```
> [!IMPORTANT]
> Khi tham chiếu đến hàm xử lý sự kiện, **không gọi hàm bằng cặp dấu ngoặc đơn** (tuyệt đối KHÔNG viết `onClick={handleClick()}`).
> Việc viết thêm dấu ngoặc đơn sẽ khiến hàm được thực thi ngay lập tức trong quá trình render giao diện, thay vì đợi người dùng click chuột.

### Lựa chọn B: Sử dụng một Arrow Function inline trực tiếp
Hữu ích cho các hành động ngắn, đơn giản.

```jsx
const ClickButton = () => {
  return (
    <button onClick={() => alert("Đã xử lý sự kiện click trực tiếp! ⚡")}>
      Click vào tôi
    </button>
  );
};
```

---

## 🌟 2. Truyền tham số vào Hàm xử lý sự kiện

Nếu bạn cần truyền các tham số tùy chỉnh vào hàm xử lý sự kiện của mình, hãy bọc cuộc gọi hàm đó bên trong một arrow function ẩn danh:

```jsx
const UserActions = () => {
  const greetUser = (name) => {
    alert(`Xin chào, ${name}!`);
  };

  // Chúng ta bọc cuộc gọi hàm trong một arrow function để nó không bị chạy ngay lập tức
  return (
    <button onClick={() => greetUser("Monster Coder")}>
      Chào người dùng
    </button>
  );
};
```

---

## 🖱️ 3. Các sự kiện chuột phổ biến khác

React hỗ trợ tất cả các sự kiện tiêu chuẩn của trình duyệt, được ánh xạ sang định dạng camelCase:

```jsx
const HoverBox = () => {
  const handleMouseMove = () => {
    console.log("Chuột di chuyển trên hộp!");
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{ padding: "50px", border: "1px solid black" }}
    >
      Rê chuột vào tôi và kiểm tra bảng điều khiển console!
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Xử lý sự kiện. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Sự khác biệt giữa `onClick={handleClick}` và `onClick={handleClick()}` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `onClick={handleClick}` truyền tham chiếu hàm cho React, nên nó chỉ chạy **khi người dùng thực sự click vào nút**.
  - `onClick={handleClick()}` thực thi hàm **ngay khi component render**, đây thường là một lỗi logic và có thể gây ra vòng lặp render vô tận (infinite re-render loop) nếu hàm này có cập nhật state.
</details>

### 2. Làm thế nào để truyền tham số vào hàm xử lý sự kiện trong React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn bọc hàm xử lý sự kiện bên trong một arrow function inline: `onClick={() => handleAction(arg)}`.
</details>

### 3. Quy ước đặt tên nào được React sử dụng cho các trình xử lý sự kiện (ví dụ: `onclick` hay `onClick`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sử dụng quy tắc **camelCase** cho các trình xử lý sự kiện (ví dụ: `onClick`, `onMouseEnter`, `onMouseMove`, `onSubmit`).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Trình ghi sự kiện Click & Hover
1. Tạo một component tên là `ButtonConsole.jsx` bên trong `src/components/`.
2. Render một nút bấm ghi log ra console `"Click event fired!"` khi được click.
3. Render một đoạn văn `<p>` ghi log ra console `"Mouse hover event fired!"` khi chuột di chuyển vào vùng của nó (sử dụng sự kiện `onMouseEnter`).
4. Import và render `<ButtonConsole />` bên trong tệp `App.jsx`.
