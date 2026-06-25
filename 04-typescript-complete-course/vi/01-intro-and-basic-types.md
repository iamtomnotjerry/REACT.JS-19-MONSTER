# Bài 1: Giới thiệu & Các kiểu dữ liệu cơ bản trong TypeScript 📘

TypeScript là một ngôn ngữ lập trình mã nguồn mở, được phát triển bởi Microsoft. Nó là một **superset (tập siêu) của JavaScript**, nghĩa là toàn bộ mã JavaScript hợp lệ đều là mã TypeScript hợp lệ. TypeScript được biên dịch thành mã JavaScript thuần khiết, gọn gàng để có thể chạy trên bất kỳ trình duyệt, môi trường Node.js hay JavaScript engine nào.

### 💡 Ví dụ thực tế dễ hiểu: Bản vẽ thiết kế
Hãy tưởng tượng việc viết code JavaScript giống như xây nhà không cần bản vẽ—bạn có thể xếp gạch và đặt cửa ở bất cứ đâu. Nó rất nhanh và linh hoạt, nhưng bạn có thể xây một cánh cửa mở thẳng vào bức tường. TypeScript giống như việc vẽ một **bản thiết kế kiến trúc chi tiết (types - kiểu dữ liệu)** trước khi xây dựng. Bản vẽ này giúp bạn đảm bảo đường ống nước khớp nối với vòi sen trước khi bạn bỏ tiền mua viên gạch đầu tiên (kiểm tra lỗi ngay khi viết code).

---

## ⚡ 1. Tại sao nên sử dụng TypeScript?

1. **Phát hiện lỗi sớm**: Phát hiện các lỗi sai kiểu dữ liệu (như gọi hàm `.toUpperCase()` trên một biến kiểu số) ngay trong quá trình viết code ở trình soạn thảo, trước khi ứng dụng được chạy thực tế.
2. **Hỗ trợ công cụ thông minh**: VS Code hỗ trợ tự động gợi ý code (IntelliSense), xem nhanh tham số của hàm, và công cụ tái cấu trúc (refactor) an toàn nhờ hiểu rõ cấu trúc dữ liệu của bạn.
3. **Mã nguồn tự ghi tài liệu**: Các định nghĩa kiểu dữ liệu (types) mô tả chính xác cấu trúc dữ liệu mong đợi, giúp giảm thiểu thời gian viết tài liệu hướng dẫn (documentation).

---

## 🧩 2. Cài đặt và thiết lập bộ biên dịch

TypeScript được biên dịch thông qua công cụ dòng lệnh **`tsc`**. Để khởi tạo cấu hình biên dịch TypeScript cho dự án, bạn tạo tệp cấu hình `tsconfig.json`:

```bash
# Cài đặt toàn cục hoặc cục bộ trong dự án
npm install -g typescript

# Khởi tạo tệp cấu hình biên dịch tsconfig.json
tsc --init
```

Tệp `tsconfig.json` điều khiển các tham số như phiên bản JavaScript đầu ra (ví dụ: `ES6`), hệ thống mô-đun, và các ràng buộc kiểm tra kiểu dữ liệu nghiêm ngặt (như `"strict": true`).

---

## 🧩 3. Định nghĩa kiểu dữ liệu Cơ bản & Mảng

Để định nghĩa kiểu dữ liệu cho một biến, bạn thêm dấu hai chấm `:` kèm theo tên kiểu dữ liệu:

```typescript
// 1. Các kiểu dữ liệu nguyên thủy (Primitive Types)
let username: string = "Monster";
let age: number = 25; // Hỗ trợ số nguyên, số thực, hệ thập lục phân, nhị phân
let isDeveloper: boolean = true;
let emptyValue: null = null;
let undefinedValue: undefined = undefined;

// 2. Kiểu Mảng (Arrays)
// Cách viết A: Tên kiểu dữ liệu đi kèm cặp ngoặc vuông
let ratings: number[] = [5, 4, 5, 2];

// Cách viết B: Cú pháp Wrapper Generic
let skills: Array<string> = ["React", "TypeScript", "Node"];
```

---

## 🧩 4. Tuple (Mảng cố định) và Enum (Kiểu liệt kê)

### Tuple
Tuple là các mảng có **số lượng phần tử cố định** và kiểu dữ liệu của các phần tử ở từng vị trí đã được xác định trước:

```typescript
// Một tuple chứa ID người dùng (số) và vai trò (chuỗi)
let userSession: [number, string] = [101, "admin"];

// Việc gán sai kiểu dữ liệu hoặc thêm phần tử dư thừa sẽ báo lỗi biên dịch:
// userSession = ["admin", 101]; // Lỗi: Kiểu 'string' không thể gán cho kiểu 'number'
```

### Enum
Enum (Enumerations - Kiểu liệt kê) cho phép chúng ta định nghĩa một nhóm các giá trị hằng số có đặt tên.

#### A. Numeric Enums (Enum dạng số)
Mặc định, các enum dạng số tự động tăng giá trị bắt đầu từ số `0`:
```typescript
enum UserRole {
  Admin,  // 0
  Editor, // 1
  User    // 2
}
let currentRole: UserRole = UserRole.Admin; // Có giá trị là 0
```

#### B. String Enums (Enum dạng chuỗi)
Enum dạng chuỗi rất dễ đọc vì các giá trị không tự động tăng mà ánh xạ trực tiếp sang các chuỗi hằng số:
```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}
let currentDir: Direction = Direction.Up; // Có giá trị là "UP"
```

---

## 🧩 5. Các kiểu dữ liệu đặc biệt: `any`, `unknown`, `void` và `never`

| Kiểu dữ liệu | Hành vi | Khi nào sử dụng |
| :--- | :--- | :--- |
| **`any`** | Bỏ qua hoàn toàn việc kiểm tra kiểu dữ liệu. Có thể gọi bất kỳ thuộc tính hay hàm nào từ biến này. | Nên tránh sử dụng. Chỉ dùng tạm thời khi chuyển đổi dự án từ JS sang TS. |
| **`unknown`** | Kiểu dữ liệu an toàn thay thế cho `any`. Bạn không được gọi hàm của biến này nếu chưa thực hiện kiểm tra kiểu dữ liệu (**Type Guard**). | Khi xử lý dữ liệu chưa rõ kiểu từ bên ngoài (như kết quả phân tích JSON, dữ liệu gọi từ API). |
| **`void`** | Biểu thị một hàm không trả về bất kỳ giá trị nào. | Kiểu trả về của các hàm thực hiện hành động nhưng không return dữ liệu (ví dụ hàm `console.log`). |
| **`never`** | Biểu thị các giá trị **không bao giờ xảy ra**. | Kiểu trả về của các hàm chạy vòng lặp vô hạn hoặc luôn luôn ném ra lỗi (throw exception). |

```typescript
// Ví dụ kiểm tra an toàn với kiểu unknown
let inputData: unknown = "Hello World";

// let length: number = inputData.length; // Lỗi: Đối tượng này có kiểu là 'unknown'

if (typeof inputData === "string") {
  let length: number = inputData.length; // An toàn! TypeScript nhận diện kiểu dữ liệu lúc này là string.
}
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Trình duyệt web có thể chạy trực tiếp tệp mã nguồn TypeScript không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Trình duyệt chỉ có thể thực thi mã JavaScript. TypeScript là công cụ hỗ trợ trong quá trình phát triển (development time). Trình biên dịch TypeScript (`tsc`) sẽ chuyển đổi các tệp `.ts` thành tệp `.js` thông thường, loại bỏ hoàn toàn các khai báo kiểu dữ liệu trước khi chạy thực tế.
</details>

### 2. Sự khác biệt giữa kiểu dữ liệu `any` và `unknown` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `any` tắt hoàn toàn việc kiểm tra kiểu dữ liệu. Bạn có thể truy cập bất kỳ thuộc tính nào hoặc gọi hàm từ nó, điều này có thể gây crash ứng dụng khi chạy thực tế (runtime).
  - `unknown` là kiểu dữ liệu an toàn. Nó thông báo cho trình biên dịch rằng "chúng ta chưa biết kiểu dữ liệu của biến này". Bạn bắt buộc phải thực hiện kiểm tra kiểu (Type Guard như dùng `typeof`) để xác định kiểu dữ liệu trước khi muốn truy cập các thuộc tính của nó.
</details>

### 3. Cơ chế suy luận kiểu dữ liệu (Type Inference) trong TypeScript là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Type Inference là khả năng của TypeScript tự động suy đoán và gán kiểu dữ liệu cho một biến dựa trên giá trị mà bạn gán cho biến đó khi khai báo. Ví dụ, khai báo `let age = 25;` thì TypeScript tự động hiểu `age` có kiểu dữ liệu là `number` mà bạn không cần khai báo tường minh là `let age: number = 25;`.
</details>

### 4. Tuple là gì? Nêu một ví dụ quen thuộc của Tuple trong các React hook?
<details>
  <summary><b>Reveal Answer</b></summary>

  Tuple là một mảng có độ dài cố định và kiểu dữ liệu của từng vị trí phần tử đã được định nghĩa trước. Một ví dụ rất phổ biến trong React là kết quả trả về của hook `useState`. Hook này trả về một Tuple chứa 2 phần tử: phần tử thứ nhất là giá trị state và phần tử thứ hai là hàm cập nhật state đó, ví dụ: `[string, Dispatch<SetStateAction<string>>]`.
</details>

### 5. Tại sao String Enums (Enum chuỗi) thường được ưu tiên sử dụng hơn Numeric Enums (Enum số)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Enum số biên dịch thành các số nguyên tự động tăng (0, 1, 2...). Khi in ra log để gỡ lỗi, chúng chỉ hiển thị các con số khiến ta khó hiểu. Enum chuỗi giữ nguyên giá trị chuỗi dễ đọc (ví dụ: `"UP"`, `"DOWN"`), giúp các thông tin ghi nhật ký (log runtime) và dữ liệu truyền tải mạng (payload network) trở nên rõ ràng và dễ hiểu hơn nhiều.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Cấu hình và Biên dịch tệp TS đầu tiên
1. Tạo một tệp tên là `basics.ts` bên trong workspace của bạn.
2. Định nghĩa một String Enum tên là `Status` gồm các khóa: `Pending`, `Success`, `Failed`.
3. Tạo một biến tuple `apiResponse` có kiểu dữ liệu là `[Status, number, string[]]` đại diện cho Trạng thái (Status), Mã HTTP Code, và mảng danh sách các thông điệp.
4. Thử gán sai kiểu dữ liệu (ví dụ truyền boolean vào vị trí của Status) để xem trình biên dịch báo lỗi ra sao.
5. Sửa lại cho đúng kiểu dữ liệu, mở terminal và chạy lệnh `npx tsc basics.ts` để biên dịch tệp thành mã JavaScript `basics.js` tiêu chuẩn. Mở tệp `.js` vừa tạo để quan sát cách các kiểu dữ liệu bị loại bỏ và enum được biên dịch như thế nào.
