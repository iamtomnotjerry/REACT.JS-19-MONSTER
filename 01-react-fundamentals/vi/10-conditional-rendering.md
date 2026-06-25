# Render theo điều kiện trong React 🔀

Trong các ứng dụng web, chúng ta thường cần hiển thị hoặc ẩn các phần tử dựa trên một số điều kiện nhất định (ví dụ: hiển thị nút "Logout" nếu người dùng đã đăng nhập, hoặc render tin nhắn cảnh báo nếu xảy ra lỗi). Trong React, bạn có thể render giao diện theo điều kiện bằng logic JavaScript tiêu chuẩn: câu lệnh `if-else`, toán tử logic `&&` và toán tử ba ngôi `? :`.

---

## ⚡ 1. Sử dụng câu lệnh `if-else`

Không thể đặt câu lệnh `if-else` trực tiếp bên trong dấu ngoặc nhọn của JSX. Thay vào đó, bạn viết chúng trong phần thân component trước câu lệnh `return`.

```jsx
const Weather = ({ temperature }) => {
  if (temperature > 30) {
    return <h2>It's hot outside! ☀️</h2>;
  } else if (temperature < 15) {
    return <h2>It's cold outside! ❄️</h2>;
  } else {
    return <h2>The weather is moderate. ⛅</h2>;
  }
};
```

---

## ⚡ 2. Toán tử Logic AND (`&&`)

Toán tử logic `&&` là một cách viết ngắn gọn để render một phần tử **chỉ khi điều kiện là đúng (true)**. Nếu điều kiện là sai (false), React sẽ hoàn toàn bỏ qua nó.

```jsx
const Notification = ({ messages }) => {
  return (
    <div>
      <h1>Inbox</h1>
      {messages.length > 0 && (
        <p>You have {messages.length} unread messages!</p>
      )}
    </div>
  );
};
```
*Cách hoạt động*: Trong JavaScript, biểu thức `true && expression` trả về `expression`, còn `false && expression` trả về `false`. Nếu biểu thức trả về `false` hoặc `0`, React sẽ không render bất kỳ thứ gì.

---

## ⚡ 3. Toán tử Ba ngôi (`? :`)

Toán tử ba ngôi là giải pháp lý tưởng để render có điều kiện ngay bên trong JSX khi bạn có điều kiện **lựa chọn giữa hai trạng thái** (đúng hoặc sai).

```jsx
const LoginButton = ({ isLoggedIn }) => {
  return (
    <div>
      {isLoggedIn ? (
        <button>Log Out</button>
      ) : (
        <button>Log In</button>
      )}
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Render theo điều kiện. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao chúng ta không thể viết câu lệnh `if-else` bên trong biểu thức ngoặc nhọn của JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  `if-else` là một câu lệnh (statement), không phải là một biểu thức (expression). Dấu ngoặc nhọn trong JSX chỉ có thể đánh giá cú pháp biểu thức (thứ trả về một giá trị). Đối với các điều kiện inline, bạn phải sử dụng toán tử ba ngôi hoặc toán tử logic AND (`&&`).
</details>

### 2. Điều gì xảy ra nếu điều kiện trong `condition && <Component />` trả về giá trị `false`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ đánh giá câu lệnh đó là `false` và sẽ không render bất kỳ thứ gì lên DOM cho dòng đó.
</details>

### 3. Toán tử nào là phù hợp nhất để render một phần tử nếu đúng, và một phần tử hoàn toàn khác nếu sai?
<details>
  <summary><b>Reveal Answer</b></summary>

  Toán tử ba ngôi (`? :`) là phù hợp nhất cho trường hợp này.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component Nhiệt độ
1. Tạo một component `WeatherReport.jsx` bên trong `src/components/`.
2. Component này sẽ nhận một prop tên là `temp` (dạng số).
3. Sử dụng các khối `if-else` để hiển thị:
   - "It's freezing! ❄️" nếu `temp` nhỏ hơn 10.
   - "It's nice and warm! ☀️" nếu `temp` nằm trong khoảng từ 10 đến 28.
   - "It's boiling hot! 🔥" nếu `temp` lớn hơn 28.
4. Render component này trong `App.jsx` với các giá trị nhiệt độ khác nhau.

### 🛠️ Bài tập 2: Hiển thị Trạng thái Người dùng
1. Tạo một component `UserStatus.jsx` bên trong `src/components/`.
2. Component này sẽ nhận hai props: `loggedIn` (boolean) và `isAdmin` (boolean).
3. Sử dụng toán tử ba ngôi inline và toán tử logic AND (`&&`):
   - Hiển thị thông điệp chào mừng `"Welcome back, Admin!"` nếu cả `loggedIn` và `isAdmin` đều đúng.
   - Hiển thị `"Welcome back, User!"` nếu `loggedIn` đúng nhưng `isAdmin` sai.
   - Hiển thị `"Please log in."` nếu `loggedIn` sai.
4. Render component này trong `App.jsx` với các tổ hợp props khác nhau.
