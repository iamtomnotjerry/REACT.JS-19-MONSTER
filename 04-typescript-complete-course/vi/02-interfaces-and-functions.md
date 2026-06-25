# Bài 2: Interface, Type Alias & Định nghĩa kiểu cho Hàm 📘

Bài học này hướng dẫn cách định nghĩa cấu trúc đối tượng tùy chỉnh, xử lý các giá trị linh hoạt bằng kiểu Union (Hợp) và Intersection (Giao), và thực thi kiểm tra kiểu dữ liệu nghiêm ngặt cho các hàm và tham số callback.

---

## ⚡ 1. Interface vs. Type Alias

Cả interface và type alias đều cho phép bạn định nghĩa cấu trúc của đối tượng. Tuy nhiên, chúng có mục đích thiết kế khác nhau.

### A. Interface (Đối tượng & Khả năng mở rộng)
Interface là bản thiết kế tiêu chuẩn cho đối tượng. Chúng hỗ trợ **kế thừa** (extending interfaces) và **gộp khai báo (declaration merging)**:

```typescript
// 1. Định nghĩa interface cơ bản
interface User {
  readonly id: number; // Không thể chỉnh sửa sau khi khởi tạo giá trị ban đầu
  name: string;
  email: string;
  role?: string; // Thuộc tính tùy chọn (optional)
}

// 2. Kế thừa một interface bằng từ khóa extends
interface Employee extends User {
  salary: number;
}

const developer: Employee = {
  id: 1,
  name: "Sarah",
  email: "sarah@dev.com",
  salary: 95000
};
// developer.id = 2; // Lỗi: Không thể gán lại giá trị cho 'id' vì đây là thuộc tính chỉ đọc (readonly).
```

> [!NOTE]
> **Declaration Merging (Gộp khai báo)**: Nếu bạn khai báo hai interface có tên giống hệt nhau trong cùng một tệp, TypeScript sẽ tự động gộp các thuộc tính của chúng lại làm một. Type alias không hỗ trợ tính năng này.

---

### B. Type Alias (Tính linh hoạt & Kiểu Union)
Type Alias là cú pháp đặt tên viết tắt cho *bất kỳ* hình dạng kiểu dữ liệu nào, bao gồm kiểu nguyên thủy, kiểu kết hợp union và kiểu tuple:

```typescript
// 1. Đặt bí danh cho kiểu nguyên thủy / Union
type ID = string | number;

// 2. Định nghĩa cấu trúc đối tượng
type Point = {
  x: number;
  y: number;
};

// 3. Kế thừa các type bằng Intersection (&)
type NamedPoint = Point & { name: string };
```

---

## ⚡ 2. Kiểu dữ liệu kết hợp Union và Intersection

TypeScript cho phép bạn xây dựng các kiểu dữ liệu mới bằng các phép toán tập hợp:

### Union Types (`|` - Phép Hoặc)
Kiểu Union mô tả một giá trị có thể thuộc **một trong nhiều** kiểu dữ liệu được khai báo:

```typescript
const printId = (id: string | number) => {
  if (typeof id === "string") {
    // TypeScript tự động hiểu 'id' là chuỗi trong khối này
    console.log(id.toUpperCase());
  } else {
    // TypeScript tự động hiểu 'id' là số trong khối này
    console.log(id.toFixed(2));
  }
};
```

### Intersection Types (`&` - Phép Và)
Kiểu Intersection gộp nhiều kiểu dữ liệu lại làm **một**, bắt buộc đối tượng phải thỏa mãn đầy đủ cấu trúc của tất cả các kiểu thành phần:

```typescript
interface HasName {
  name: string;
}
interface HasAge {
  age: number;
}

type Person = HasName & HasAge;

const customer: Person = {
  name: "John",
  age: 30 // Bắt buộc phải có cả 2 thuộc tính name VÀ age
};
```

---

## ⚡ 3. Định nghĩa kiểu cho Hàm (Function Typing)

Trong TypeScript, bạn có thể kiểm soát chặt chẽ kiểu dữ liệu cho tham số đầu vào, tham số tùy chọn, giá trị mặc định và giá trị trả về của hàm.

```typescript
// 1. Hàm bình thường có kiểu trả về tường minh (number)
function calculateBill(price: number, taxRate: number, discount: number = 0): number {
  return (price * (1 + taxRate)) - discount;
}

// 2. Hàm Arrow Function có tham số tùy chọn (optional parameter)
const formatGreeting = (name: string, title?: string): string => {
  if (title) return `Xin chào, ${title} ${name}`;
  return `Xin chào, ${name}`;
};

// 3. Khai báo kiểu dữ liệu cho Tham số Callback
const executeAction = (
  id: number, 
  callback: (username: string) => void
): void => {
  const username = `User_${id}`;
  callback(username);
};

// Sử dụng
executeAction(404, (name) => console.log(`Đang xử lý: ${name}`));
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Cơ chế "Gộp khai báo" (Declaration Merging) trong TypeScript là gì, và cú pháp nào hỗ trợ nó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Gộp khai báo xảy ra khi trình biên dịch TypeScript tự động gộp các khai báo trùng tên độc lập thành một định nghĩa duy nhất. Chỉ có **Interfaces** hỗ trợ cơ chế này. Việc khai báo hai Type Aliases trùng tên trong cùng một phạm vi sẽ gây ra lỗi biên dịch "Duplicate identifier" (Trùng lặp mã định danh).
</details>

### 2. Thuộc tính `readonly` có tác dụng gì khi khai báo trong interface?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thuộc tính `readonly` thiết lập một trường thông tin chỉ được phép đọc sau khi đối tượng được khởi tạo. Bất kỳ đoạn mã nào cố gắng gán lại hoặc sửa đổi giá trị của trường `readonly` này sẽ lập tức bị báo lỗi khi biên dịch.
</details>

### 3. Trong hàm, ta có thể đặt một tham số tùy chọn (optional) đứng trước một tham số bắt buộc (required) được không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Trong JavaScript và TypeScript, các tham số tùy chọn (ví dụ: `title?: string`) bắt buộc phải luôn luôn nằm **sau cùng** của danh sách các tham số trong hàm.
</details>

### 4. Sự khác biệt giữa kiểu Union và Intersection là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Kiểu **Union** (`A | B`) đại diện cho một giá trị có thể là kiểu A *hoặc* kiểu B.
  - Kiểu **Intersection** (`A & B`) gộp nhiều cấu trúc kiểu dữ liệu lại, tạo ra một kiểu dữ liệu mới bắt buộc phải chứa *đầy đủ* tất cả các thuộc tính của cả hai kiểu A và B.
</details>

### 5. Kiểu trả về `void` biểu thị điều gì trong mô tả hàm?
<details>
  <summary><b>Reveal Answer</b></summary>

  `void` biểu thị việc hàm thực thi hành động nhưng **không trả về bất kỳ dữ liệu nào** (kết quả trả về của nó có giá trị undefined). Nó thường được dùng cho các hàm in thông tin ra console, kích hoạt các sự kiện callback, hoặc thay đổi state.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Định nghĩa kiểu dữ liệu cho Giỏ hàng & Hàm thanh toán
1. Tạo một tệp `functions.ts` trong workspace của bạn.
2. Định nghĩa một interface tên là `Product` gồm các trường:
   - `id`: số chỉ đọc (readonly number).
   - `name`: chuỗi (string).
   - `price`: số (number).
   - `category`: chuỗi tùy chọn (optional string).
3. Định nghĩa một type alias `Cart` là một mảng chứa các đối tượng `Product`.
4. Viết hàm `checkout` nhận vào một `Cart` và một mã giảm giá tùy chọn (discount code kiểu string), trả về tổng tiền thanh toán (kiểu number):
   - Nếu mã giảm giá truyền vào là `"SAVE10"`, hãy giảm `10` đơn vị tiền vào tổng số tiền thanh toán.
5. Tạo một mảng giỏ hàng giả lập, truyền vào hàm và chạy thử công cụ biên dịch để đảm bảo kiểu dữ liệu hoạt động chính xác.
