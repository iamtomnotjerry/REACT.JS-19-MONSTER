# React Components & Props với TypeScript 🦾

Việc tích hợp TypeScript vào React mang lại cơ chế bảo vệ giao diện người dùng ngay tại thời điểm biên dịch. Nó đảm bảo các component nhận đúng chính xác cấu trúc dữ liệu (props) mà chúng yêu cầu, ngăn chặn các lỗi hiển thị và các lỗi render âm thầm.

---

## 📚 Khái niệm & Tổng quan

Khi bạn viết React bằng JavaScript thuần, một component sẽ vui vẻ chấp nhận **bất kỳ** prop nào bạn truyền vào. Truyền một `number` vào nơi mong đợi một `string`, viết sai `onClick` thành `onclik`, quên một trường bắt buộc — JavaScript vẫn im lặng cho đến khi lỗi bùng nổ trên trình duyệt. TypeScript lấp đầy khoảng trống đó. Bằng cách chú thích kiểu cho props, bạn cho trình biên dịch biết **bản hợp đồng** mà mỗi component cam kết tuân thủ, và bất kỳ vi phạm nào cũng bị bắt ngay khoảnh khắc bạn gõ ra, từ rất lâu trước khi người dùng nhìn thấy màn hình.

> [!NOTE]
> Hãy xem một kiểu prop trong TypeScript giống như **nhãn dinh dưỡng** trên một gói thực phẩm. Nhãn này cam kết chính xác những gì có bên trong hộp — 3 gram `name: string`, 1 phần `age: number`, một chút `avatarUrl?` tùy chọn. Người tiêu dùng (component cha) có thể đọc nhãn và biết chính xác cần đưa vào những gì và sẽ nhận lại được những gì, không phải đoán mò. Các component JavaScript thuần là một hộp bí ẩn không có nhãn.

> [!TIP]
> Khi bạn khởi tạo một project mới với `npm create vite@latest`, hãy chọn template **React + TypeScript**. Khi đó các file component của bạn sẽ dùng phần mở rộng `.tsx` (TypeScript + JSX) thay vì `.jsx`. Chính ký tự `x` là thứ mở khóa cú pháp JSX bên trong một file TypeScript.

```bash
# Scaffold a brand-new React + TypeScript project with Vite
npm create vite@latest ts-demo -- --template react-ts

# Move into the project and install dependencies
cd ts-demo
npm install

# Start the dev server
npm run dev
```

---

## ⚡ 1. Định nghĩa kiểu cho Props của Component

Để định nghĩa kiểu cho props trong React, bạn khai báo một interface hoặc type alias trong TypeScript đại diện cho cấu trúc của dữ liệu truyền vào:

```tsx
interface ButtonProps {
  label: string; // Required string
  importance?: "primary" | "secondary"; // Optional union string
  onClick: () => void; // Required event handler callback
}
```

Nếu bạn quên chú thích kiểu cho props, TypeScript sẽ báo lỗi kinh điển: **"Parameter 'props' implicitly has an 'any' type."** Thông điệp đó là cách TypeScript nói với bạn rằng nó không thể bảo vệ một giá trị mà nó không biết gì cả — việc chú thích kiểu cho props chính là cách bạn chọn quay lại với sự an toàn.

```tsx
// ❌ Implicit "any" — TypeScript cannot help you here
export const User = (props) => {
  return <h2>{props.name}</h2>;
};

// ✅ Explicit shape — every property is now checked at compile time
interface UserShape {
  name: string;
  age: number;
  isStudent: boolean;
}

export const User = (props: UserShape) => {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.age}</p>
      <p>{props.isStudent ? "Student" : "Not a student"}</p>
    </div>
  );
};
```

---

## 🧩 2. Hai cách khai báo Component

Trong React kết hợp với TypeScript, bạn có thể khai báo chữ ký hàm của component theo hai cách tiêu chuẩn:

### Cách A: Tham số hàm thông thường (Khuyên dùng)
Cách tiếp cận này định nghĩa kiểu cho props trực tiếp trong danh sách tham số. Nó đơn giản, dễ đọc, và xử lý các generic component một cách dễ dàng:

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

### Cách B: Sử dụng `React.FC` (Functional Component)
`React.FC` (hoặc `React.FunctionComponent`) là một kiểu generic do React cung cấp. Nó tự động xử lý các thuộc tính như `displayName` và việc định kiểu cho giá trị trả về:

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
> Trong React 18 và 19, `React.FC` **không** còn ngầm bao gồm `children` nữa. Bạn phải định nghĩa tường minh `children` trong interface props của mình nếu muốn hỗ trợ các layout lồng nhau.

---

## ⚖️ 3. `React.FC` so với Function Component thuần — Đánh đổi

Cả hai phong cách đều biên dịch và chạy giống hệt nhau tại runtime. Sự khác biệt hoàn toàn nằm ở **trải nghiệm của lập trình viên** tại thời điểm biên dịch. Dưới đây là bảng so sánh song song để bạn có thể lựa chọn một cách có chủ đích:

| Khía cạnh | `React.FC<Props>` (Cách B) | Function thuần `(props: Props)` (Cách A) |
| --- | --- | --- |
| **Yêu cầu import React** | Có — `import React from 'react'` để tham chiếu `React.FC` | Không cần import (với JSX transform hiện đại) |
| **Kiểu trả về** | Được định kiểu ngầm cho bạn (`ReactElement \| null`) | Suy ra từ câu lệnh `return` của bạn |
| **`children` ngầm định** | Không có trong React 18/19 (tự động bao gồm trước phiên bản 18) | Không bao giờ tự động bao gồm — luôn tường minh |
| **Giá trị mặc định cho prop** | Hoạt động được, nhưng đọc khá vụng về khi destructuring | Sạch sẽ: `({ isFeatured = false }: CardProps)` |
| **Generic component** | Khó chịu — `React.FC` không nhận tham số kiểu một cách gọn gàng | Tự nhiên: `function List<T>(props: ListProps<T>)` |
| **`displayName` / `defaultProps`** | Tự động gắn trên kiểu | Bạn tự gắn thủ công nếu cần |
| **Khả năng đọc** | Dài dòng, có thêm kiểu bao bọc phải phân tích | Tối giản, kiểu của props nằm ngay tại nơi gọi |
| **Xu hướng cộng đồng (2024+)** | Đang dần mất ưa chuộng | Mặc định được khuyên dùng |

> [!WARNING]
> Đừng vội dùng `React.FC` chỉ vì bạn thấy nó trong các hướng dẫn hoặc tài liệu cũ. Vì `React.FC` không thể nhận tham số kiểu generic một cách gọn gàng, ngay khoảnh khắc bạn cố xây dựng một generic component tái sử dụng (ví dụ một `<List<T> />` có kiểu), bạn sẽ gặp trắc trở và nhiều khả năng phải viết lại nó thành một function thuần. Bắt đầu với phong cách function thuần sẽ tránh hoàn toàn việc phải di trú đó trong tương lai.

**Nguyên tắc chung:** hãy chọn **Cách A (tham số hàm thông thường)** theo mặc định. Chỉ dùng `React.FC` khi làm việc trong một codebase đã chuẩn hóa theo nó để đảm bảo tính nhất quán.

---

## 🧩 4. Định kiểu cho prop `children`

Nếu component của bạn đóng vai trò là một container layout bao bọc các phần tử khác, bạn phải định kiểu cho prop `children` bằng **`React.ReactNode`**:

```tsx
import React from 'react';

interface ContainerProps {
  title: string;
  children: React.ReactNode; // Represents any renderable React node (JSX, string, number, array)
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

`React.ReactNode` có chủ ý rất rộng. Nếu bạn `Ctrl/Cmd + click` vào nó trong trình soạn thảo, IDE của bạn sẽ nhảy tới file kiểu `index.d.ts` của React, nơi bạn có thể thấy nó là một union của `ReactElement`, một `string`, một `number`, một portal, một `boolean`, `null`, `undefined`, và mảng của tất cả những thứ đó. Chính độ rộng đó là lý do nó là kiểu đúng cho `children` — children có thể là bất cứ thứ gì render được theo đúng nghĩa đen.

---

## ♻️ 5. Mở rộng & Tái sử dụng các kiểu Prop

Một nhu cầu phổ biến trong thực tế là một cấu trúc được xây dựng dựa trên một cấu trúc khác — ví dụ, một **admin** có mọi trường mà một **user** thông thường có, cộng thêm một vài trường nữa. TypeScript cho phép bạn kết hợp chúng bằng toán tử giao (`&`) thay vì sao chép-dán các trường. Để dùng một kiểu dùng chung qua nhiều file, chỉ cần `export` nó.

```typescript
// types.ts — a single source of truth for your data shapes

// Base information shared by every user
export type Info = {
  id: number;
  name: string;
  email: string;
};

// AdminInfo = everything in Info, PLUS admin-only fields
export type AdminInfo = Info & {
  role: string;
  lastLogin: Date;
};
```

```tsx
// AdminCard.tsx — import the shared types and reuse them
import type { AdminInfo } from "./types"; // "import type" tells the compiler these are types only

interface AdminCardProps {
  admin: AdminInfo;
}

export const AdminCard = ({ admin }: AdminCardProps) => {
  return (
    <div>
      <h2>Admin Information</h2>
      <p>{admin.name}</p>
      <p>{admin.email}</p>
      <p>{admin.role}</p>
      <p>Last login: {admin.lastLogin.toLocaleString()}</p>
    </div>
  );
};
```

Việc dùng `import type { ... }` (thay vì một `import` thông thường) báo hiệu rõ ràng cho trình biên dịch rằng bạn đang import **các kiểu, không phải các giá trị runtime**. Import này bị xóa hoàn toàn khỏi bundle JavaScript đã biên dịch.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về React và TypeScript. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao `children` ngầm định lại bị loại bỏ khỏi `React.FC` trong React 18?
<details>
  <summary><b>Reveal Answer</b></summary>

  `children` ngầm định bị loại bỏ vì nó quá lỏng lẻo. Nó cho phép lập trình viên viết các component lồng nhau (ví dụ `<MyButton>Click Me</MyButton>`) ngay cả khi component đó chưa bao giờ được thiết kế để render hay xử lý nội dung con, dẫn đến các lỗi âm thầm. Loại bỏ nó buộc lập trình viên phải khai báo tường minh `children: React.ReactNode` trong interface props của họ.
</details>

### 2. Sự khác biệt giữa `React.ReactNode` và `React.ReactElement` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`React.ReactNode`** rất rộng. Nó đại diện cho bất cứ thứ gì React có thể render: các phần tử JSX, chuỗi, số, fragment, mảng các node, boolean, hoặc `null`.
  - **`React.ReactElement`** thì hẹp. Nó đại diện cho một đối tượng JSX đơn lẻ được trả về trực tiếp bởi `React.createElement()` (nó không bao gồm chuỗi, số, hay mảng).
</details>

### 3. Làm thế nào để chỉ định giá trị mặc định cho các props tùy chọn trong TypeScript?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thực tiễn tốt nhất hiện đại là gán giá trị mặc định trực tiếp trong quá trình destructuring đối tượng ES6 tại danh sách tham số của component, ví dụ `({ isFeatured = false }: CardProps)`. TypeScript tự động suy ra kiểu tùy chọn và xử lý việc render giá trị mặc định.
</details>

### 4. Làm thế nào để giới hạn một prop chỉ chấp nhận các giá trị chuỗi cụ thể?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn dùng một **Union Type** trong interface props của mình, ví dụ:
  ```typescript
  interface AlertProps {
    type: "success" | "warning" | "danger";
  }
  ```
  Điều này giới hạn prop sao cho việc cố truyền `<Alert type="info" />` sẽ kích hoạt một lỗi tại thời điểm biên dịch.
</details>

### 5. Tại sao việc định kiểu hàm thông thường lại nhìn chung được ưa chuộng hơn `React.FC` trong React hiện đại?
<details>
  <summary><b>Reveal Answer</b></summary>

  Việc định kiểu qua tham số hàm thông thường đơn giản hơn, không yêu cầu import `React`, xử lý việc destructuring tham số mặc định gọn gàng hơn, và dễ viết hơn nhiều khi component cần xử lý các kiểu Generic (ví dụ một generic component `<List<T> />`). `React.FC` cũng không còn tự động bao gồm `children` trong React 18/19, loại bỏ một trong số ít lợi thế lịch sử của nó.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường project của mình:

### 🛠️ Bài tập 1: Component Thẻ người dùng có khả năng truy cập
1. Tạo một component `UserCard.tsx` bên trong `src/components/` (đảm bảo phần mở rộng file là `.tsx` để hỗ trợ cú pháp TSX).
2. Định nghĩa một interface props `UserCardProps` bao gồm:
   - `name`: string.
   - `email`: string.
   - `role`: chuỗi union tùy chọn chứa `"admin" | "editor" | "user"`. Mặc định là `"user"`.
   - `avatarUrl`: string tùy chọn.
3. Render một thẻ card hiển thị tên, email, nhãn role badge của người dùng, và ảnh đại diện (nếu có cung cấp `avatarUrl`).
4. Render nhiều phần tử `<UserCard />` bên trong trang `App.tsx` của bạn để xác minh rằng việc kiểm tra biên dịch hoạt động khi các tham số tùy chọn bị bỏ qua.
5. **Mở rộng:** cố tình truyền `<UserCard role="superuser" />` và quan sát lỗi union tại thời điểm biên dịch. Sau đó loại bỏ prop `email` bắt buộc khỏi một instance và đọc lỗi mà TypeScript đưa ra cho bạn.

### 🛠️ Bài tập 2: Một Button tái sử dụng với Ba Props
Thử thách này phản chiếu "thử thách TypeScript đầu tiên" của khóa học. Hãy xây dựng một button có kiểu, tái sử dụng được.

1. Tạo `Button.tsx` trong `src/components/`.
2. Định nghĩa một cấu trúc `ButtonProps` với **ba** props:
   - `label`: string — văn bản hiển thị trên button.
   - `onClick`: một hàm với chữ ký `() => void` (nó không trả về gì cả).
   - `disabled`: boolean — bật/tắt việc button có được kích hoạt hay không.
3. Destructure cả ba props trong danh sách tham số và render một `<button>` gốc gắn `label`, `onClick`, và `disabled` vào phần tử thật.
4. Import `<Button />` vào `App.tsx`, truyền một `onClick` thực hiện `console.log("clicked")`, chạy `npm run dev`, và xác nhận có **không** lỗi TypeScript nào.
5. **Mở rộng — mở rộng với intersection types:** chuyển `ButtonProps` vào một `types.ts` dùng chung, `export` nó, sau đó tạo một `IconButton` có props là `ButtonProps & { iconName: string }`. Tái sử dụng cấu trúc cơ sở thay vì khai báo lại `label`, `onClick`, và `disabled`.
