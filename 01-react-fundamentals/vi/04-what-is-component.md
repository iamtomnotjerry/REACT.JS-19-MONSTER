# Component trong React là gì? 🧩

Trong React, **Component** (Thành phần) là các khối xây dựng cốt lõi của giao diện người dùng. Mọi ứng dụng bạn xây dựng với React đều được tạo thành từ các mảnh nhỏ ghép lại gọi là component.

Hãy nghĩ về các component như các phần tử HTML tùy chỉnh, có thể tái sử dụng, chứa bố cục (HTML), kiểu dáng (CSS) và hành vi (JavaScript) của riêng chúng.

---

## 💡 Phép so sánh với Lego

Hãy tưởng tượng bạn đang xây dựng một lâu đài Lego. Thay vì đúc toàn bộ lâu đài từ một khối gỗ duy nhất, bạn xây dựng nó bằng cách sử dụng nhiều **viên gạch Lego** riêng lẻ:
- Mỗi viên gạch đều độc lập.
- Các viên gạch có thể được tái sử dụng ở nhiều nơi khác nhau (ví dụ: một viên gạch cửa sổ có thể dùng ở trên tháp hoặc ở cổng).
- Bạn lắp ráp các viên gạch nhỏ này để tạo thành lâu đài phức tạp cuối cùng.

Trong React, một **Component** là một viên gạch Lego. **App** của bạn chính là lâu đài.

---

## 🛠️ Các loại Component

Trong lịch sử của React, có hai cách để tạo component:

### 1. Functional Components (Tiêu chuẩn Hiện đại)
Ngày nay, các component được viết dưới dạng các hàm JavaScript đơn giản trả về JSX. Đây là **cách tiêu chuẩn và được khuyên dùng** để viết component trong React 19.

```jsx
// Một Functional Component đơn giản
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

### 2. Class Components (Di sản / Cách cũ)
Trước đây, các component được viết bằng cách sử dụng các lớp (class) ES6. Mặc dù bạn vẫn có thể bắt gặp chúng trong các dự án cũ (legacy code), bạn nên **tránh sử dụng chúng** cho các dự án React 19 mới.

```jsx
// Class Component cũ (Chỉ dùng để tham khảo)
import React, { Component } from 'react';

class WelcomeMessage extends Component {
  render() {
    return <h1>Welcome back, developer! 👋</h1>;
  }
}

export default WelcomeMessage;
```

---

## 🔑 Các đặc tính cốt lõi của Component

Để xây dựng giao diện người dùng động và tương tác tốt, các component dựa vào ba khái niệm chính:

### 1. JSX (Cấu trúc)
JSX cho phép bạn viết các thẻ HTML ngay bên trong mã JavaScript. Nó định nghĩa những gì component sẽ hiển thị trên màn hình.
> [!NOTE]
> Các React component **phải trả về một phần tử gốc duy nhất**. Nếu bạn có nhiều phần tử đồng cấp, hãy bọc chúng trong một container cha hoặc một **React Fragment** (`<> ... </>`).

```jsx
const Card = () => {
  return (
    <>
      <h2>React 19</h2>
      <p>Xây dựng giao diện với component rất dễ dàng.</p>
    </>
  );
};
```

### 2. Props (Đầu vào)
Props (viết tắt của *properties* - thuộc tính) là các dữ liệu đầu vào chỉ đọc được truyền từ component cha xuống component con, giống như các đối số được truyền vào một hàm. Chúng cho phép các component hiển thị dữ liệu động và có khả năng tái sử dụng.

```jsx
// Component Con
const UserProfile = (props) => {
  return <h2>Xin chào, {props.username}!</h2>;
};

// Component Cha sử dụng Component Con với các props khác nhau
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
Khác với props chỉ đọc, **State** là bộ nhớ riêng tư, nội bộ của một component. Nó giữ dữ liệu có thể thay đổi theo thời gian (ví dụ: một menu đang mở hay đóng, nội dung nhập trong ô text, hoặc giá trị của bộ đếm). Khi state thay đổi, React tự động render lại component để hiển thị dữ liệu mới nhất.

```jsx
import { useState } from 'react';

const ClickCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Bạn đã click {count} lần</p>
      <button onClick={() => setCount(count + 1)}>Click vào tôi</button>
    </div>
  );
};
```

---

## ⚠️ Quy tắc quan trọng khi viết Component trong React

1. **Tên Component viết hoa chữ cái đầu:** Tên component **phải luôn bắt đầu bằng chữ cái viết hoa** (ví dụ: `UserProfile`, không phải `userProfile`). React dựa vào quy tắc này để phân biệt component tự định nghĩa với các thẻ HTML tiêu chuẩn (như `<div>` hay `<button>`).
2. **Hàm thuần khiết (đối với Props):** Một component tuyệt đối không được tự ý sửa đổi `props` của chính nó. Props là dữ liệu chỉ đọc.
3. **Một phần tử gốc duy nhất:** Như đã đề cập, component phải trả về chính xác một thẻ gốc bao ngoài.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về React Component. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Component trong React là gì? Phép so sánh với Lego giúp giải thích điều đó như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Component là một phần giao diện độc lập, có thể tái sử dụng, tự quản lý cấu trúc, kiểu dáng và logic của riêng nó. Phép so sánh Lego thể hiện điều này bằng cách coi mỗi component là một viên gạch; bạn tạo ra các viên gạch độc lập và lắp ghép chúng lại với nhau để dựng nên ứng dụng hoàn chỉnh cuối cùng.
</details>

### 2. Tại sao tên component trong React phải bắt đầu bằng chữ cái viết hoa? Điều gì xảy ra nếu bạn đặt tên một component là `myHeader`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sử dụng việc viết hoa chữ cái đầu để phân biệt giữa các component tự định nghĩa và các phần tử HTML tiêu chuẩn.
  - Các phần tử HTML tiêu chuẩn bắt đầu bằng chữ viết thường (ví dụ: `<div>`, `<header>`).
  - Các component tùy chỉnh phải bắt đầu bằng chữ viết hoa (ví dụ: `<MyHeader>`).
  - Nếu bạn đặt tên là `myHeader`, React sẽ coi đó là một thẻ HTML thông thường `<myHeader>` và sẽ không thể render component của bạn.
</details>

### 3. Sự khác biệt giữa Functional Components và Class Components là gì? Loại nào được ưu tiên trong React 19?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Functional Components** được viết dưới dạng hàm JavaScript trả về JSX và quản lý các tính năng thông qua React Hooks. Đây là tiêu chuẩn hiện đại trong React 19.
  - **Class Components** được viết bằng các lớp ES6 và các phương thức vòng đời (như `componentDidMount`). Chúng được coi là di sản cũ và nên tránh sử dụng trong các dự án mới.
</details>

### 4. Tại sao component phải trả về một phần tử gốc duy nhất? Bạn có thể dùng gì nếu không muốn chèn thêm một thẻ `<div>` dư thừa vào cây DOM?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các component trong React phải trả về một giá trị duy nhất. Dưới bản chất, JSX được biên dịch thành các đối tượng JavaScript, và một hàm thì chỉ có thể trả về một giá trị duy nhất. Nếu bạn không muốn làm ô nhiễm DOM bởi các thẻ `<div>` bao ngoài không cần thiết, bạn có thể bọc chúng trong một **React Fragment** (`<> ... </>`).
</details>

### 5. Hãy giải thích sự khác biệt giữa Props và State. Dữ liệu nào có thể được cập nhật từ bên trong component?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Props** là các tham số cấu hình được truyền từ component cha xuống component con. Chúng là **chỉ đọc** (bất biến - immutable) bên trong component con.
  - **State** là dữ liệu nội bộ, riêng tư của component. Nó **có thể thay đổi** (mutable) và được cập nhật từ bên trong component bằng hàm cập nhật state (như `setCount`). Khi state thay đổi, React tự động kích hoạt render lại giao diện.
</details>

---

## 💻 Bài tập thực hành

Hoàn thành các bài tập sau bên trong dự án `first-react-app` để củng cố kiến thức của bạn.

> [!IMPORTANT]
> **Thực tiễn tốt nhất về cấu trúc thư mục:**
> Một lập trình viên nhiều kinh nghiệm luôn giữ thư mục `src/` gọn gàng. Hãy tạo một thư mục mới tên là **`components`** bên trong **`src/`** (đường dẫn: `src/components/`). Tất cả các component tùy chỉnh cho các bài tập dưới đây phải được tạo trong thư mục này.

---

### 🛠️ Bài tập 1: Ghép nối Component (Nesting)
1. Tạo một tệp mới tên là **`Header.jsx`** bên trong **`src/components/`**.
2. Bên trong `Header.jsx`, định nghĩa một component trả về một thanh điều hướng chứa tiêu đề trang web (ví dụ: "React Monster") và 3 liên kết neo (Home, About, Contact). Export default nó.
3. Tạo một tệp khác tên là **`Footer.jsx`** bên trong **`src/components/`** trả về một chân trang chứa văn bản bản quyền (ví dụ: `"© 2026 React Monster. All rights reserved."`). Export default nó.
4. Import cả hai component này vào `App.jsx` theo đúng đường dẫn:
   ```jsx
   import Header from "./components/Header"
   import Footer from "./components/Footer"
   ```
5. Render `Header` ở trên cùng và `Footer` ở dưới cùng của container.

---

### 🛠️ Bài tập 2: Component Động (Làm việc với Props)
1. Tạo một tệp mới tên là **`UserInfo.jsx`** bên trong **`src/components/`**.
2. Bên trong đó, định nghĩa một functional component `UserInfo` nhận `props` (hoặc sử dụng kỹ thuật destructuring) và hiển thị:
   - Một tiêu đề thẻ `<h3>` hiển thị `name`.
   - Một thẻ `<strong>` hiển thị `role`.
   - Một đoạn văn `<p>` hiển thị mô tả ngắn `bio`.
3. Trong `App.jsx`, import và render component `UserInfo` **ba lần** với dữ liệu khác nhau (ví dụ: Alice là Developer, Bob là Designer, và Charlie là Product Manager):
   ```jsx
   import UserInfo from "./components/UserInfo"
   ```
4. Xác minh trên trình duyệt rằng mỗi thẻ hiển thị đúng thông tin duy nhất tương ứng!

---

### 🛠️ Bài tập 3: Component có Trạng thái (Tương tác với State)
1. Tạo một tệp mới tên là **`LikeButton.jsx`** bên trong **`src/components/`**.
2. Import hook `useState` từ thư viện `'react'`.
3. Thiết lập biến state `likes` được khởi tạo bằng `0`.
4. Render một nút bấm hiển thị số lượt thích (ví dụ: `👍 Thích ({likes})`).
5. Thêm trình lắng nghe sự kiện `onClick` vào nút bấm để tăng giá trị state `likes` lên `1` đơn vị mỗi khi được click.
6. Import và render `LikeButton` bên trong `App.jsx` (ngay trên Footer) và thử click vào nó trên trình duyệt để kiểm tra!
