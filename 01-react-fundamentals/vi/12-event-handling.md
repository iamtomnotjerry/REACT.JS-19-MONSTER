# Xử lý sự kiện (Event Handling) trong React ⚡

React cho phép bạn xử lý các tương tác của người dùng (như click chuột, di chuyển chuột, submit form, và gõ bàn phím) một cách dễ dàng. Các sự kiện trong React được đặt tên bằng quy tắc camelCase (như `onClick`) thay vì viết thường (như `onclick` trong HTML), và bạn truyền vào một hàm JavaScript làm trình xử lý sự kiện chứ không phải là một chuỗi văn bản.

---

## ⚡ 1. Cú pháp xử lý sự kiện chuẩn

Dưới đây là cách bạn xử lý sự kiện click chuột vào nút bấm trong React:

### Lựa chọn A: Sử dụng một hàm có tên (Khuyến nghị)
Cách tiếp cận này rất sạch sẽ và giữ cho JSX của bạn ngăn nắp, đặc biệt là khi logic xử lý sự kiện phức tạp.

```jsx
const ClickButton = () => {
  const handleClick = () => {
    alert("Button was clicked! 🚀");
  };

  return <button onClick={handleClick}>Click Me</button>;
};
```
> [!IMPORTANT]
> Khi tham chiếu đến hàm xử lý sự kiện, **không được gọi hàm bằng cặp ngoặc tròn** (tức là KHÔNG viết `onClick={handleClick()}`).
> Viết thêm cặp ngoặc tròn sẽ khiến hàm chạy ngay lập tức trong quá trình render, chứ không đợi người dùng click chuột.

### Lựa chọn B: Sử dụng một Arrow Function nội dòng (Inline)
Hữu ích cho các hành động ngắn gọn, viết trên một dòng duy nhất.

```jsx
const ClickButton = () => {
  return (
    <button onClick={() => alert("Inline click handled! ⚡")}>
      Click Me
    </button>
  );
};
```

---

## 🌟 2. Truyền đối số (Arguments) vào hàm xử lý sự kiện

Nếu bạn cần truyền các đối số tùy chỉnh vào hàm xử lý sự kiện, hãy bọc lời gọi hàm trong một arrow function ẩn danh:

```jsx
const UserActions = () => {
  const greetUser = (name) => {
    alert(`Hello, ${name}!`);
  };

  // Chúng ta bọc lời gọi hàm trong một arrow function để nó không bị chạy ngay lập tức
  return (
    <button onClick={() => greetUser("Monster Coder")}>
      Greet User
    </button>
  );
};
```

---

## ⚙️ 3. Đối tượng Sự kiện SyntheticEvent (`e`) & Ngăn chặn mặc định

Khi một sự kiện được kích hoạt, React tự động truyền một **Đối tượng Sự kiện** (thường được đặt tên là `e` hoặc `event`) làm đối số đầu tiên vào hàm xử lý sự kiện của bạn.
Đối tượng sự kiện của React được gọi là **SyntheticEvent**. Đây là một wrapper bao bọc sự kiện gốc của trình duyệt, giúp đảm bảo các sự kiện hoạt động hoàn toàn giống nhau trên mọi trình duyệt bao gồm Safari, Chrome, Edge, và Firefox.

### A. Truy cập giá trị nhập vào của ô Input
Bạn có thể đọc nội dung người dùng vừa nhập vào ô input bằng cách dùng `e.target.value`:
```jsx
const InputField = () => {
  const handleInputChange = (e) => {
    console.log("User typed:", e.target.value);
  };

  return <input type="text" onChange={handleInputChange} />;
};
```

### B. Ngăn chặn hành vi mặc định (`e.preventDefault()`)
Nhiều phần tử HTML có các hành vi mặc định tích hợp sẵn. Ví dụ, nhấp vào nút submit trong một thẻ form sẽ tự động tải lại (reload) toàn bộ trang web. Bạn có thể ngăn chặn hành vi mặc định này bằng cách gọi hàm `e.preventDefault()`:

```jsx
const FormComponent = () => {
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn tải lại trang!
    console.log("Form submitted safely without reload.");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Enter info" />
      <button type="submit">Submit Form</button>
    </form>
  );
};
```

---

## 🧠 Kiểm tra kiến thức (Chuẩn bị phỏng vấn)

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Xử lý sự kiện. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Sự khác biệt giữa `onClick={handleClick}` và `onClick={handleClick()}` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `onClick={handleClick}` truyền tham chiếu hàm tới React, do đó hàm **chỉ chạy khi người dùng nhấp chuột**.
  - `onClick={handleClick()}` thực thi hàm **ngay lập tức khi component render**, đây thường là lỗi logic và có thể gây ra vòng lặp render vô tận nếu hàm đó cập nhật state.
</details>

### 2. Đối tượng sự kiện `e` là gì và hàm `e.preventDefault()` có tác dụng gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đối tượng sự kiện `e` là một đối tượng được React tự động truyền vào, chứa các thông tin siêu dữ liệu về sự kiện được kích hoạt (ví dụ: phần tử mục tiêu, tọa độ click). `e.preventDefault()` được dùng để chặn hành vi mặc định của trình duyệt liên quan đến sự kiện đó, ví dụ như ngăn tải lại trang khi submit một `<form>`.
</details>

### 3. SyntheticEvent trong React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  React bọc các sự kiện gốc của trình duyệt vào trong đối tượng **SyntheticEvent** tự tùy chỉnh để đảm bảo chúng hoạt động nhất quán trên tất cả các trình duyệt và hệ điều hành, giúp giải quyết các lỗi tương thích trình duyệt một cách tự động.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Ghi log khi Click và Hover
1. Tạo một component `ButtonConsole.jsx` bên trong thư mục `src/components/`.
2. Render một nút bấm ghi log ra console chữ `"Click event fired!"` khi được click.
3. Render một đoạn văn `<p>` ghi log ra console chữ `"Mouse hover event fired!"` khi chuột di chuyển vào khu vực của nó (sử dụng sự kiện `onMouseEnter`).
4. Import và render `<ButtonConsole />` bên trong `App.jsx`.

### 🛠️ Bài tập 2: Ngăn chặn tải lại trang khi Submit Form
1. Tạo một component `FormSubmit.jsx` bên trong thư mục `src/components/`.
2. Render một thẻ `<form>` chứa một ô `<input>` và một `<button type="submit">`.
3. Thiết lập một hàm xử lý sự kiện `onSubmit` có gọi `e.preventDefault()`, ghi log ra console dòng chữ `"Form submission intercepted! No page reload occurred."`, đồng thời hiển thị thông báo alert.
4. Render `<FormSubmit />` trong `App.jsx` và chạy thử nút submit. Xác minh xem trang trình duyệt có bị tải lại hay không!
