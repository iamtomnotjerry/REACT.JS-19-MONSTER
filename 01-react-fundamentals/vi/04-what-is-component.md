# React Component là gì? 🧩

Trong React, **Component** là khối xây dựng cốt lõi của giao diện người dùng. Mọi ứng dụng bạn xây dựng với React đều được tạo thành từ những phần được gọi là component.

Hãy hình dung component như những phần tử HTML tùy chỉnh, có thể tái sử dụng, chứa bố cục (HTML), kiểu dáng (CSS) và hành vi (JavaScript) của riêng chúng.

---

## 💡 Phép ẩn dụ Lego

Hãy tưởng tượng bạn đang xây một lâu đài Lego. Thay vì đẽo toàn bộ lâu đài từ một khối gỗ duy nhất, bạn xây nó bằng nhiều **viên gạch Lego** riêng lẻ:
- Mỗi viên gạch là độc lập.
- Các viên gạch có thể được tái sử dụng ở nhiều nơi khác nhau (ví dụ: một viên gạch cửa sổ có thể được dùng cho tháp hoặc cổng).
- Bạn lắp ráp những viên gạch nhỏ này lại để tạo ra lâu đài phức tạp hoàn chỉnh cuối cùng.

Trong React, một **Component** chính là một viên gạch Lego. **App** của bạn chính là lâu đài.

---

## 🛠️ Các loại Component

Trong lịch sử của React, có hai cách để tạo component:

### 1. Functional Component (Chuẩn hiện đại)
Ngày nay, component được viết dưới dạng các hàm JavaScript đơn giản trả về JSX. Đây là **cách chuẩn và được khuyến nghị** để viết component trong React 19.

```jsx
// A simple Functional Component
function WelcomeMessage() {
  return <h1>Welcome back, developer! 👋</h1>;
}

export default WelcomeMessage;
```

*Hoặc sử dụng cú pháp Arrow Function của ES6:*
```jsx
const WelcomeMessage = () => {
  return <h1>Welcome back, developer! 👋</h1>;
};

export default WelcomeMessage;
```

### 2. Class Component (Di sản / Cách cũ)
Trong lịch sử, component được viết bằng các class ES6. Mặc dù bạn vẫn có thể thấy chúng trong các codebase cũ (legacy code), bạn nên **tránh sử dụng chúng** cho các dự án React 19 mới.

```jsx
// Legacy Class Component (For reference only)
import React, { Component } from 'react';

class WelcomeMessage extends Component {
  render() {
    return <h1>Welcome back, developer! 👋</h1>;
  }
}

export default WelcomeMessage;
```

---

## 🔑 Các tính năng cốt lõi của Component

Để xây dựng giao diện động và tương tác, component dựa vào ba khái niệm chính:

### 1. JSX (Cấu trúc)
JSX cho phép bạn viết các phần tử HTML bên trong JavaScript. Nó định nghĩa những gì component sẽ render ra màn hình.
> [!NOTE]
> React component **phải trả về một phần tử gốc duy nhất**. Nếu bạn có nhiều phần tử, hãy bọc chúng trong một container cha hoặc một **React Fragment** (`<> ... </>`).

```jsx
const Card = () => {
  return (
    <>
      <h2>React 19</h2>
      <p>Building UI with components is easy.</p>
    </>
  );
};
```

### 2. Props (Đầu vào)
Props (viết tắt của *properties*) là các đầu vào chỉ đọc (read-only) được truyền từ component cha xuống component con, giống như các tham số được truyền vào một hàm. Chúng cho phép các component trở nên động và có thể tái sử dụng.

```jsx
// Child Component
const UserProfile = (props) => {
  return <h2>Hello, {props.username}!</h2>;
};

// Parent Component using the Child Component with different props
const App = () => {
  return (
    <div>
      <UserProfile username="Alice" />
      <UserProfile username="Bob" />
    </div>
  );
};
```

### 3. State (Bộ nhớ)
Không giống như props vốn chỉ đọc, **State** là bộ nhớ riêng tư, nội bộ của một component. Nó lưu giữ dữ liệu có thể thay đổi theo thời gian (ví dụ: liệu một menu có đang mở hay không, giá trị của một ô nhập văn bản, hoặc giá trị của một bộ đếm). Khi state thay đổi, React tự động render lại component để hiển thị dữ liệu đã được cập nhật.

```jsx
import { useState } from 'react';

const ClickCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
};
```

---

## ⚠️ Các quy tắc quan trọng cho React Component

1. **Tên viết hoa:** Tên component **phải luôn bắt đầu bằng chữ cái viết hoa** (ví dụ: `UserProfile`, chứ không phải `userProfile`). React sử dụng quy tắc này để phân biệt các component tùy chỉnh với các thẻ HTML chuẩn (như `<div>` hoặc `<button>`).
2. **Hàm thuần túy (đối với Props):** Một component không bao giờ được phép sửa đổi `props` của chính nó. Props là chỉ đọc (read-only).
3. **Một phần tử gốc duy nhất:** Như đã đề cập, một component phải trả về đúng một thẻ gốc.

---

## 🧠 Kiểm tra kiến thức của bạn

Hãy trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về React Component. Nhấp vào **Reveal Answer** để xác minh câu trả lời của bạn.

### 1. React Component là gì? Phép ẩn dụ Lego giúp giải thích nó như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một component là một phần UI độc lập, có thể tái sử dụng, tự quản lý cấu trúc, kiểu dáng và logic của riêng nó. Phép ẩn dụ Lego thể hiện điều này bằng cách xem các component như những viên gạch riêng lẻ; bạn xây dựng chúng một cách độc lập rồi lắp ráp chúng lại với nhau để tạo nên ứng dụng phức tạp hoàn chỉnh cuối cùng.
</details>

### 2. Tại sao tên React component phải bắt đầu bằng chữ cái viết hoa? Điều gì xảy ra nếu bạn đặt tên một component là `myHeader`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sử dụng việc viết hoa để phân biệt giữa các React component tùy chỉnh và các phần tử HTML chuẩn.
  - Các phần tử HTML chuẩn bắt đầu bằng chữ cái thường (ví dụ: `<div>`, `<header>`).
  - Các component tùy chỉnh phải bắt đầu bằng chữ cái viết hoa (ví dụ: `<MyHeader>`).
  - Nếu bạn đặt tên nó là `myHeader`, React sẽ coi nó như một thẻ HTML gốc `<myHeader>` và sẽ không thể render được component của bạn.
</details>

### 3. Sự khác biệt giữa Functional Component và Class Component là gì? Loại nào được ưa chuộng trong React 19?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Functional Component** được viết dưới dạng các hàm JavaScript trả về JSX và quản lý các tính năng bằng Hooks. Chúng là chuẩn hiện đại trong React 19.
  - **Class Component** được viết bằng các class ES6 và các lifecycle method (như `componentDidMount`). Chúng được xem là di sản (legacy) và nên tránh sử dụng trong các dự án mới.
</details>

### 4. Tại sao một component phải trả về một phần tử gốc duy nhất? Bạn có thể dùng gì nếu không muốn chèn thêm một `<div>` thừa vào cây DOM?
<details>
  <summary><b>Reveal Answer</b></summary>

  React component phải trả về một giá trị (biểu thức) duy nhất. Về bản chất bên dưới, JSX được biên dịch thành các đối tượng JavaScript, và một hàm chỉ có thể trả về một giá trị duy nhất. Nếu bạn không muốn làm rối DOM với các container `<div>` không cần thiết, bạn có thể bọc các phần tử của mình trong một **React Fragment** (`<> ... </>`).
</details>

### 5. Hãy giải thích sự khác biệt giữa Props và State. Loại nào có thể được cập nhật bên trong component?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Props** là các tham số cấu hình được truyền từ component cha xuống component con. Chúng là **chỉ đọc** (bất biến) bên trong component con.
  - **State** là bộ nhớ dữ liệu nội bộ, riêng tư của component. Nó **có thể thay đổi** và có thể được cập nhật bên trong component bằng các hàm setter của state (như `setCount`). Khi state cập nhật, React tự động kích hoạt việc render lại.
</details>

---

## 💻 Bài tập thực hành

Hoàn thành các bài tập này bên trong dự án `first-react-app` của bạn để kiểm tra mức độ hiểu của mình.

> [!IMPORTANT]
> **Cấu trúc thư mục theo Best Practice:**
> Một lập trình viên giỏi luôn giữ cho `src/` gọn gàng. Hãy tạo một thư mục mới tên là **`components`** bên trong **`src/`** (đường dẫn: `src/components/`). Tất cả các component tùy chỉnh cho các bài tập dưới đây phải được tạo bên trong thư mục này.

---

### 🛠️ Bài tập 1: Component Composition (Lồng component)
1. Tạo một file mới tên là **`Header.jsx`** bên trong **`src/components/`**.
2. Bên trong `Header.jsx`, định nghĩa một component trả về một navigation header với tiêu đề trang web (ví dụ: "React Monster") và 3 liên kết anchor (Home, About, Contact). Export nó dưới dạng default.
3. Tạo một file khác tên là **`Footer.jsx`** bên trong **`src/components/`** trả về một footer với văn bản bản quyền (ví dụ: `"© 2026 React Monster. All rights reserved."`). Export nó dưới dạng default.
4. Import cả hai component trong `App.jsx` bằng đường dẫn chính xác:
   ```jsx
   import Header from "./components/Header"
   import Footer from "./components/Footer"
   ```
5. Render `Header` ở trên cùng và `Footer` ở dưới cùng của container.

---

### 🛠️ Bài tập 2: Component động (Làm việc với Props)
1. Tạo một file mới tên là **`UserInfo.jsx`** bên trong **`src/components/`**.
2. Bên trong đó, định nghĩa một functional component `UserInfo` nhận `props` (hoặc dùng destructuring) và hiển thị:
   - Một header `<h3>` hiển thị `name`.
   - Một thẻ `<strong>` hiển thị `role`.
   - Một đoạn văn `<p>` hiển thị một `bio` ngắn.
3. Trong `App.jsx`, import và render component `UserInfo` **ba lần** với dữ liệu khác nhau (ví dụ: Alice the Developer, Bob the Designer, và Charlie the Product Manager):
   ```jsx
   import UserInfo from "./components/UserInfo"
   ```
4. Kiểm tra trong trình duyệt rằng mỗi thẻ được render với các chi tiết riêng biệt tương ứng của nó!

---

### 🛠️ Bài tập 3: Component có state (State tương tác)
1. Tạo một file mới tên là **`LikeButton.jsx`** bên trong **`src/components/`**.
2. Import hook `useState` từ `'react'`.
3. Thiết lập một biến state `likes` được khởi tạo bằng `0`.
4. Render một button hiển thị số lượt thích (ví dụ: `👍 Like ({likes})`).
5. Thêm một event listener `onClick` vào button để tăng state `likes` lên `1` khi được nhấp.
6. Import và render `LikeButton` bên trong `App.jsx` (phía trên Footer) và thử nhấp vào nó trong trình duyệt của bạn!
