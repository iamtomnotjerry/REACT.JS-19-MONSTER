# Render có điều kiện trong React 🔀

Trong các ứng dụng web, chúng ta thường xuyên cần ẩn hoặc hiện các phần tử dựa trên các điều kiện nhất định (ví dụ: hiển thị nút "Đăng xuất" nếu đã đăng nhập, hoặc hiển thị thông báo lỗi nếu có lỗi xảy ra). Trong React, bạn có thể render UI có điều kiện bằng các logic JavaScript tiêu chuẩn: câu lệnh `if-else`, toán tử logic `&&`, và toán tử ba ngôi `? :`.

---

## ⚡ 1. Sử dụng câu lệnh `if-else`

Câu lệnh `if-else` không thể viết trực tiếp bên trong dấu ngoặc nhọn `{}` của JSX. Thay vào đó, bạn phải viết chúng ở phần thân component trước câu lệnh `return`.

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

## ⚡ 2. Toán tử logic AND (`&&`)

Toán tử logic `&&` là một cách viết ngắn gọn để render một phần tử **chỉ khi điều kiện là true**. Nếu điều kiện là false, React sẽ bỏ qua hoàn toàn.

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

> [!CAUTION]
> **Lỗi render số `0` khi dùng toán tử rút gọn `&&`:**
> React sẽ hiển thị các giá trị dạng số như `0` lên màn hình nếu chúng nằm ở vế trái của biểu thức `&&`.
> * **Code lỗi:** `items.length && <List />` sẽ render số `0` lên màn hình nếu mảng `items` trống, vì biểu thức `items.length` trả về giá trị số `0`.
> * **Code đúng:** Luôn đưa điều kiện về dạng boolean thực sự: `items.length > 0 && <List />` hoặc `!!items.length && <List />`.

---

## ⚡ 3. Toán tử ba ngôi (`? :`)

Toán tử ba ngôi cực kỳ lý tưởng để render có điều kiện trực tiếp (inline) trong JSX khi bạn có một điều kiện **chọn một trong hai** (đúng hoặc sai).

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

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Render có điều kiện. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao chúng ta không thể viết câu lệnh `if-else` bên trong dấu ngoặc nhọn của JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  `if-else` là một câu lệnh (statement), không phải biểu thức (expression). Dấu ngoặc nhọn trong JSX chỉ có thể tính toán các biểu thức (trả về một giá trị cụ thể). Đối với các điều kiện nội dòng (inline), bạn phải dùng toán tử ba ngôi hoặc toán tử logic AND (`&&`).
</details>

### 2. Điều gì xảy ra nếu điều kiện trong `condition && <Component />` trả về `false`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ đánh giá biểu thức là `false` và không render bất kỳ phần tử DOM nào cho dòng đó.
</details>

### 3. Lỗi phổ biến khi kiểm tra độ dài mảng bằng cách viết `list.length && <Component />` là gì? Cách sửa ra sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu mảng rỗng, `list.length` bằng `0`. Trong React, các giá trị số (như `0`) vẫn được render ra DOM, dẫn đến chữ số `0` xuất hiện ngoài ý muốn trên màn hình. Để sửa lỗi này, hãy chuyển điều kiện về dạng so sánh boolean rõ ràng: `list.length > 0 && <Component />` hoặc `!!list.length && <Component />`.
</details>

### 4. Toán tử nào phù hợp nhất để hiển thị một phần tử nếu đúng, và hiển thị một phần tử hoàn toàn khác nếu sai?
<details>
  <summary><b>Reveal Answer</b></summary>

  Toán tử ba ngôi (`? :`) là phù hợp nhất cho trường hợp này.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của mình:

### 🛠️ Bài tập 1: Component kiểm tra mật khẩu (Password Validator)
1. Tạo một file component mới `Password.jsx` bên trong `src/components/`.
2. Bên trong `Password.jsx`, tạo thêm hai component nhỏ phụ trợ:
   - `ValidPassword` trả về `<h1>Valid Password</h1>`
   - `InvalidPassword` trả về `<h1>Invalid Password</h1>`
3. Component `Password` chính nhận vào một prop kiểu boolean là `isValid`.
4. Sử dụng câu lệnh `if-else` thông thường ở phần thân hàm để render `<ValidPassword />` nếu `isValid` là true, ngược lại render `<InvalidPassword />`.
5. **Thử thách**: Refactor lại component `Password` chính để render kết quả bằng **toán tử ba ngôi** nội dòng trực tiếp trong lệnh `return` JSX.
6. Import và render `<Password isValid={true} />` và `<Password isValid={false} />` trong `App.jsx` để kiểm tra kết quả.

### 🛠️ Bài tập 2: Component dự báo thời tiết (Weather Report)
1. Tạo một component `WeatherReport.jsx` bên trong `src/components/`.
2. Component này cần nhận một prop tên là `temp` (kiểu số).
3. Sử dụng các khối `if-else` hiển thị:
   - "It's freezing! ❄️" nếu `temp` dưới 10.
   - "It's nice and warm! ☀️" nếu `temp` trong khoảng từ 10 đến 28.
   - "It's boiling hot! 🔥" nếu `temp` trên 28.
4. Render nó trong `App.jsx` với các giá trị nhiệt độ khác nhau.

### 🛠️ Bài tập 3: Hiển thị trạng thái người dùng (User Status)
1. Tạo một component `UserStatus.jsx` bên trong `src/components/`.
2. Component này nhận vào hai prop: `loggedIn` (boolean) và `isAdmin` (boolean).
3. Sử dụng các toán tử ba ngôi nội dòng và toán tử logic `&&`:
   - Hiển thị thông báo chào mừng `"Welcome back, Admin!"` nếu cả `loggedIn` và `isAdmin` đều là true.
   - Hiển thị `"Welcome back, User!"` nếu `loggedIn` là true nhưng `isAdmin` là false.
   - Hiển thị `"Please log in."` nếu `loggedIn` là false.
4. Render component trong `App.jsx` với các tổ hợp giá trị prop khác nhau.
