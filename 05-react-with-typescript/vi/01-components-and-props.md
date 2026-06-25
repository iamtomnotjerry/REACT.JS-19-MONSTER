# React Component & Props với TypeScript 🦾

Tích hợp TypeScript vào React giúp bảo vệ giao diện người dùng ngay tại thời điểm biên dịch. Cơ chế này đảm bảo các component luôn nhận đúng cấu trúc dữ liệu (props) cần thiết, ngăn chặn các lỗi hiển thị giao diện và các hành vi render sai lệch một cách âm thầm.

---

## ⚡ 1. Định nghĩa kiểu dữ liệu cho Props (Props Typing)

Để định nghĩa kiểu dữ liệu cho props trong React, bạn khai báo một `interface` hoặc `type alias` mô tả cấu trúc dữ liệu truyền xuống:

```tsx
interface ButtonProps {
  label: string; // Chuỗi bắt buộc
  importance?: "primary" | "secondary"; // Thuộc tính union tùy chọn
  onClick: () => void; // Hàm callback bắt buộc xử lý sự kiện
}
```

---

## 🧩 2. Hai cách khai báo Component tiêu chuẩn

Trong React kết hợp TypeScript, bạn có hai cách tiêu chuẩn để khai báo kiểu dữ liệu cho một functional component:

### Cách A: Khai báo qua tham số hàm thông thường (Khuyên dùng)
Cách tiếp cận này định nghĩa kiểu dữ liệu cho props trực tiếp trong danh sách tham số đầu vào của hàm. Cách viết này đơn giản, dễ đọc, và dễ dàng xử lý các generic component:

```tsx
interface CardProps {
  title: string;
  description: string;
  isFeatured?: boolean;
}

export const Card = ({ title, description, isFeatured = false }: CardProps) => {
  return (
    <div style={{ border: isFeatured ? "2px solid gold" : "1px solid #ccc", padding: "15px" }}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};
```

### Cách B: Sử dụng kiểu `React.FC` (Functional Component)
`React.FC` (hoặc tên đầy đủ `React.FunctionComponent`) là một kiểu generic do React cung cấp. Nó tự động xử lý một số thuộc tính bổ sung như `displayName` hoặc kiểu dữ liệu trả về của component:

```tsx
import React from 'react';

interface TitleProps {
  text: string;
}

export const Title: React.FC<TitleProps> = ({ text }) => {
  return <h1>{text}</h1>;
};
```

> [!TIP]
> Kể từ phiên bản React 18 và 19, `React.FC` **không** còn tự động tích hợp thuộc tính ẩn `children` nữa. Bạn bắt buộc phải khai báo tường minh thuộc tính `children` trong interface props nếu muốn component hỗ trợ bao bọc các phần tử con lồng nhau.

---

## 🧩 3. Định nghĩa kiểu cho thuộc tính `children`

Nếu component của bạn đóng vai trò là một khung layout bao bọc các phần tử con khác bên trong, bạn phải định nghĩa kiểu cho `children` là **`React.ReactNode`**:

```tsx
import React from 'react';

interface ContainerProps {
  title: string;
  children: React.ReactNode; // Đại diện cho bất kỳ phần tử nào có thể render (JSX, string, number, array)
}

export const Container = ({ title, children }: ContainerProps) => {
  return (
    <div style={{ padding: "20px", border: "1px solid blue", borderRadius: "8px" }}>
      <h2>{title}</h2>
      <div style={{ marginTop: "15px" }}>
        {children}
      </div>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao thuộc tính `children` ngầm định lại bị loại bỏ khỏi `React.FC` trong React 18?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó bị loại bỏ vì quá lỏng lẻo. Cú pháp cũ cho phép nhà phát triển viết lồng các thẻ con (ví dụ: `<MyButton>Click Me</MyButton>`) ngay cả khi component đó không được thiết kế để hiển thị hay xử lý nội dung thẻ con, dẫn đến các lỗi logic ẩn. Loại bỏ nó buộc lập trình viên phải khai báo rõ ràng `children: React.ReactNode` khi thiết kế props.
</details>

### 2. Sự khác biệt giữa `React.ReactNode` và `React.ReactElement` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`React.ReactNode`** có phạm vi rộng: đại diện cho mọi thứ React có thể render được, bao gồm các thẻ JSX, chuỗi văn bản, số, React Fragment, mảng các phần tử, giá trị boolean hoặc `null`.
  - **`React.ReactElement`** có phạm vi hẹp: chỉ đại diện cho một đối tượng thẻ JSX duy nhất được trả về bởi hàm `React.createElement()` (không bao gồm chuỗi, số hay mảng).
</details>

### 3. Làm cách nào để thiết lập giá trị mặc định cho các props tùy chọn (optional props) trong TypeScript?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thực tiễn tốt nhất là gán trực tiếp giá trị mặc định khi thực hiện giải nén đối tượng (object destructuring) ES6 ngay tại danh sách tham số của component, ví dụ: `({ isFeatured = false }: CardProps)`. TypeScript sẽ tự động nhận diện kiểu dữ liệu và xử lý giá trị mặc định khi render.
</details>

### 4. Làm thế nào để giới hạn một prop chỉ được phép nhận một vài giá trị chuỗi cụ thể?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn sử dụng kiểu kết hợp **Union Type** trong interface props, ví dụ:
  ```typescript
  interface AlertProps {
    type: "success" | "warning" | "danger";
  }
  ```
  Ràng buộc này giúp trình biên dịch báo lỗi ngay lập tức nếu bạn cố tình viết truyền dữ liệu dạng `<Alert type="info" />`.
</details>

### 5. Tại sao khai báo hàm thông thường lại được ưa chuộng hơn `React.FC` trong lập trình React hiện đại?
<details>
  <summary><b>Reveal Answer</b></summary>

  Cách viết hàm thông thường đơn giản hơn, không yêu cầu import `React` một cách dư thừa, viết giá trị mặc định cho tham số sạch sẽ hơn, và đặc biệt dễ viết hơn rất nhiều khi component cần sử dụng kiểu Generic (ví dụ component danh sách dùng chung `<List<T> />`).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng Component Thẻ người dùng (User Card)
1. Tạo một component `UserCard.tsx` trong thư mục `src/components/` (chú ý sử dụng đuôi `.tsx` để hỗ trợ mã TSX).
2. Định nghĩa interface `UserCardProps` gồm các trường:
   - `name`: chuỗi bắt buộc (string).
   - `email`: chuỗi bắt buộc (string).
   - `role`: chuỗi tùy chọn nhận giá trị giới hạn `"admin" | "editor" | "user"`, mặc định là `"user"`.
   - `avatarUrl`: chuỗi tùy chọn (string).
3. Hiển thị thông tin người dùng lên thẻ card gồm tên, email, nhãn phân quyền (role badge) và ảnh đại diện (nếu có `avatarUrl`).
4. Nhúng và gọi component `<UserCard />` nhiều lần trong tệp `App.jsx` để kiểm tra khả năng bắt lỗi của TypeScript khi thiếu hoặc sai kiểu dữ liệu của props.
