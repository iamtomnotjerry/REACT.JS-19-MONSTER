# React Hooks & Xử lý sự kiện với TypeScript 🦾

Định nghĩa kiểu dữ liệu cho các state hooks, liên kết DOM (refs) và sự kiện trình duyệt là điều bắt buộc để xây dựng các ứng dụng React an toàn và đầy đủ kiểu dữ liệu. TypeScript giúp tự động gợi ý các thuộc tính (autocomplete) của sự kiện và thẻ HTML tương ứng một cách chính xác.

---

## ⚡ 1. Định nghĩa kiểu cho `useState`

Thông thường, TypeScript có thể tự động suy đoán kiểu dữ liệu của biến state dựa trên giá trị khởi tạo ban đầu:

```tsx
const [count, setCount] = useState(0); // Tự hiểu kiểu: number
const [text, setText] = useState("");   // Tự hiểu kiểu: string
```

Tuy nhiên, nếu state của bạn khởi tạo bằng giá trị `null` hoặc `undefined`, hoặc hỗ trợ nhiều cấu trúc dữ liệu khác nhau, bạn bắt buộc phải sử dụng **Generics**:

```tsx
interface User {
  id: number;
  username: string;
}

// State có thể nhận đối tượng User HOẶC null
const [user, setUser] = useState<User | null>(null);

const loginUser = () => {
  setUser({ id: 99, username: "admin" }); // Hợp lệ!
};
```

---

## ⚡ 2. Định nghĩa kiểu cho `useRef`

Hàm `useRef` hoạt động khác nhau tùy thuộc vào việc bạn dùng nó để trỏ tới các phần tử DOM hay để lưu các giá trị thông thường.

### A. Trỏ tới phần tử DOM (Chỉ đọc thuộc tính `.current`)
Để liên kết với một phần tử DOM, bạn truyền tên interface của phần tử HTML tương ứng làm tham số generic, và bắt buộc khởi tạo ref bằng giá trị `null`:

```tsx
import { useRef, useEffect } from 'react';

export const TextInput = () => {
  // 1. Khai báo kiểu phần tử input đích
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 2. Truy cập DOM an toàn sử dụng dấu chấm hỏi optional chaining
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
};
```

*Một số kiểu phần tử HTML phổ biến: `HTMLInputElement`, `HTMLButtonElement`, `HTMLDivElement`, `HTMLFormElement`.*

### B. Lưu trữ giá trị thay đổi (Có thể ghi dữ liệu `.current`)
Nếu bạn muốn lưu trữ một giá trị tồn tại qua các lần render mà không gây re-render component, chỉ cần truyền kiểu dữ liệu và KHÔNG truyền null vào khởi tạo:

```tsx
const renderCount = useRef<number>(0);
renderCount.current += 1; // Có thể ghi trực tiếp dữ liệu
```

---

## ⚡ 3. Định nghĩa kiểu dữ liệu cho Sự kiện (Events)

Khi bạn viết các hàm xử lý sự kiện dạng inline trực tiếp trong JSX, React sẽ tự động hiểu kiểu dữ liệu. Tuy nhiên, nếu bạn viết tách các hàm xử lý sự kiện ra ngoài, bạn bắt buộc phải định nghĩa kiểu dữ liệu cho tham số sự kiện `e` một cách thủ công:

```tsx
import React, { useState } from 'react';

export const UserForm = () => {
  const [email, setEmail] = useState("");

  // 1. Định nghĩa kiểu sự kiện thay đổi input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 2. Định nghĩa kiểu sự kiện click chuột
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Tọa độ click chuột:", e.clientX, e.clientY);
  };

  // 3. Định nghĩa kiểu sự kiện submit biểu mẫu
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Dữ liệu gửi đi:", email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={handleEmailChange} />
      <button type="button" onClick={handleButtonClick}>In tọa độ chuột</button>
      <button type="submit">Gửi biểu mẫu</button>
    </form>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Khi nào bạn bắt buộc phải truyền tham số generic cho `useState`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn cần truyền tham số kiểu generic (ví dụ: `useState<Type>()`) khi kiểu dữ liệu của state không thể tự suy luận chính xác từ giá trị khởi tạo. Các trường hợp bao gồm:
  1. Giá trị khởi tạo ban đầu là `null` hoặc `undefined` (ví dụ chờ gọi API lấy dữ liệu).
  2. State chứa kiểu kết hợp gồm nhiều giá trị cụ thể (ví dụ: `useState<"light" | "dark">("light")`).
  3. State quản lý các đối tượng object phức tạp hoặc mảng chứa nhiều phần tử.
</details>

### 2. Tại sao ta phải khởi tạo DOM ref bằng giá trị `null` (ví dụ `useRef<HTMLInputElement>(null)`)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong React, truyền `null` giúp trình biên dịch nhận biết ref này dùng để liên kết với một phần tử DOM. Nó sẽ trả về một đối tượng `RefObject` chỉ đọc mà React tự quản lý thuộc tính `.current`. Nếu bạn không truyền `null`, nó sẽ trả về `MutableRefObject` có thể chỉnh sửa trực tiếp, dùng để lưu trữ các biến thông thường và không thể liên kết chính xác với các thuộc tính DOM.
</details>

### 3. Sự khác biệt giữa `React.ChangeEvent` và `React.FormEvent` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`React.ChangeEvent`** kích hoạt khi giá trị của các ô nhập liệu (`<input>`, `<textarea>`, `<select>`) thay đổi, cho phép truy cập giá trị nhập vào qua `e.target.value`.
  - **`React.FormEvent`** kích hoạt trên các sự kiện của biểu mẫu, chẳng hạn khi submit thẻ `<form>`, cho phép chạy hàm `e.preventDefault()` để chặn tải lại trang.
</details>

### 4. Làm thế nào để tìm được tên kiểu dữ liệu sự kiện React tương ứng nếu bạn lỡ quên?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể viết hàm xử lý sự kiện dạng inline trực tiếp trong mã JSX (ví dụ: `<button onClick={(e) => {}} />`), sau đó di chuột qua tham số `e` trong VS Code. Trình soạn thảo sẽ hiển thị đầy đủ tên kiểu dữ liệu chính xác của sự kiện đó để bạn copy.
</details>

### 5. Tại sao chúng ta sử dụng `e.target.value` thay vì `e.currentTarget.value` trong React?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `e.target` trỏ trực tiếp đến phần tử **kích hoạt** sự kiện (có thể là một thẻ span nhỏ nằm bên trong thẻ button).
  - `e.currentTarget` trỏ đến phần tử **gắn trình lắng nghe sự kiện** (chính là thẻ button đó).
  Đối với các ô nhập liệu thông thường thì hai thuộc tính này giống nhau, nhưng dùng `e.currentTarget` sẽ an toàn hơn trong các cấu trúc giao diện lồng nhau phức tạp.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Theo dõi tọa độ chuột trên Canvas & Ô nhập liệu
1. Tạo một component `CoordinatesForm.tsx` (sử dụng đuôi `.tsx`).
2. Thiết lập state theo dõi tọa độ: `const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)`.
3. Hiển thị một thẻ `<div>` lớn làm vùng canvas. Theo dõi di chuyển chuột trên vùng này bằng hàm xử lý:
   ```typescript
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   ```
4. Hiển thị tọa độ `x` và `y` lên màn hình. Thêm một ô nhập để người dùng ghi nhãn, sử dụng một hàm `onChange` có định nghĩa kiểu sự kiện ChangeEvent đầy đủ.
5. Kiểm tra để đảm bảo VS Code hiển thị đầy đủ các gợi ý thuộc tính khi bạn gõ dấu chấm sau biến sự kiện `e`.
