# Bài 1: Giới thiệu & Các kiểu dữ liệu cơ bản trong TypeScript 📘

TypeScript là một ngôn ngữ lập trình mã nguồn mở, định kiểu mạnh (strongly typed), được phát triển bởi Microsoft. Nó là một **superset (tập siêu) cú pháp nghiêm ngặt của JavaScript**, nghĩa là toàn bộ mã JavaScript hợp lệ đều là mã TypeScript hợp lệ. TypeScript được biên dịch thành mã JavaScript thuần khiết, gọn gàng và dễ đọc, có thể chạy trên bất kỳ trình duyệt, môi trường Node.js hay JS engine nào.

## 🌟 Khái niệm & Tổng quan

Hãy hình dung TypeScript như **"JavaScript với siêu năng lực"**. Nó cho phép bạn làm mọi thứ mà JavaScript đã làm được, nhưng bổ sung thêm một lớp nữa — một *type system (hệ thống kiểu dữ liệu)* — mô tả **hình dạng (shape)** của dữ liệu. Khẩu hiệu chính thức đã nói rõ điều này: *"TypeScript là JavaScript với cú pháp dành cho kiểu dữ liệu."* Những chú thích bổ sung này cho phép trình soạn thảo của bạn bắt lỗi **trước khi** code được chạy, nhờ vậy bạn có thể tin tưởng vào những gì mình triển khai.

> [!NOTE]
> Mã TypeScript không bao giờ chạy trực tiếp ở bất kỳ đâu. Trình biên dịch (`tsc`) sẽ transpile các tệp `.ts` của bạn thành các tệp `.js` thông thường, loại bỏ mọi chú thích kiểu dữ liệu trong quá trình đó. Kiểu dữ liệu chỉ tồn tại ở **thời điểm phát triển/biên dịch** — tại runtime, đó chỉ là JavaScript thuần.

> [!WARNING]
> Hãy tránh kiểu `any` bất cứ khi nào có thể. `any` tắt hoàn toàn việc kiểm tra kiểu và đưa trở lại tất cả những lỗi runtime mà TypeScript vốn được tạo ra để ngăn chặn. Khi bạn thực sự không biết một kiểu dữ liệu, hãy ưu tiên dùng **`unknown`**, kiểu này buộc bạn phải thu hẹp (narrow) giá trị một cách an toàn trước khi sử dụng.

> [!TIP]
> Bạn không cần phải ghi nhớ phần lớn các kiểu dữ liệu cơ bản — TypeScript sử dụng **type inference (suy luận kiểu)** để tự xác định chúng cho bạn. Viết `let age = 25;` và TypeScript đã biết `age` là một `number`. Hãy thêm chú thích tường minh chủ yếu ở những *ranh giới* của code (tham số hàm, kiểu trả về, dữ liệu từ bên ngoài).

### 💡 Ví dụ thực tế dễ hiểu: Bản vẽ thiết kế
Hãy hình dung JavaScript giống như việc xây nhà mà không có bản vẽ — bạn có thể xếp gạch và đặt cửa ở bất cứ đâu. Nó nhanh và linh hoạt, nhưng bạn có thể xây một cánh cửa mở thẳng vào bức tường. TypeScript giống như việc vẽ một **bản vẽ kiến trúc chi tiết (types)** trước tiên. Nó đảm bảo rằng đường ống nước trong bếp khớp với hệ thống cấp thoát nước trước khi bạn mua dù chỉ một viên gạch (kiểm tra ở thời điểm biên dịch).

---

## ⚡ 1. Tại sao nên sử dụng TypeScript?

1. **Phát hiện lỗi sớm**: Bắt các lỗi sai kiểu dữ liệu (như gọi `.toUpperCase()` trên một biến số) ngay tại thời điểm biên dịch trong trình soạn thảo, trước khi code được chạy thực tế ở môi trường production.
2. **Công cụ hỗ trợ vượt trội**: VS Code cung cấp tự động hoàn thành code (IntelliSense), gợi ý tham số khi di chuột, và các công cụ tái cấu trúc (refactor) an toàn vì nó hiểu rõ hình dạng dữ liệu của bạn.
3. **Mã nguồn tự ghi tài liệu**: Các kiểu dữ liệu mô tả chính xác hình dạng dữ liệu được mong đợi, giúp giảm bớt gánh nặng viết tài liệu.

### So sánh nhanh TypeScript và JavaScript

| Khía cạnh | JavaScript | TypeScript |
| :--- | :--- | :--- |
| **Kiểm tra kiểu** | Không có — lỗi xuất hiện tại runtime | Tĩnh (static) — lỗi xuất hiện trong trình soạn thảo tại thời điểm biên dịch |
| **Công cụ / tự động hoàn thành** | Hạn chế (engine đoán hình dạng) | IntelliSense phong phú từ các kiểu đã biết |
| **Chạy trong trình duyệt** | Trực tiếp | Chỉ sau khi biên dịch sang `.js` |
| **Phần mở rộng tệp** | `.js` / `.jsx` | `.ts` / `.tsx` |
| **Phù hợp nhất với** | Script nhanh, prototype nhỏ | Mọi quy mô — đặc biệt là các codebase lớn, tồn tại lâu dài |

---

## 🧩 2. Cài đặt và thiết lập bộ biên dịch

TypeScript được biên dịch bằng công cụ dòng lệnh **`tsc`**. Để khởi tạo cấu hình TypeScript trong một dự án, bạn tạo ra một tệp `tsconfig.json`:

```bash
# Install the compiler globally (or locally inside a project with --save-dev)
npm install -g typescript

# Optional: ts-node lets you run .ts files directly without a manual compile step
npm install -g ts-node

# Confirm the installation and print the compiler version
tsc -v

# Generate a tsconfig.json with all compiler options documented
tsc --init
```

Tệp `tsconfig.json` điều khiển các tham số như phiên bản JavaScript đầu ra (ví dụ `ES6`), hệ thống module, và các ràng buộc kiểm tra kiểu nghiêm ngặt (như `"strict": true`).

> [!TIP]
> Với các thử nghiệm nhanh, bạn thậm chí không cần thiết lập build. Hãy cài đặt extension **Code Runner** cho VS Code cùng với **ts-node**, tạo một tệp `index.ts`, và chạy tệp trực tiếp từ trình soạn thảo. Đây là cách chúng ta sẽ khám phá các kiểu dữ liệu ở đầu khóa học.

---

## 🧩 3. Chú thích kiểu (Kiểu nguyên thủy)

Một **chú thích (annotation)** chỉ định kiểu dữ liệu của một biến, tham số, hoặc giá trị trả về. Để chú thích, bạn thêm dấu hai chấm `:` theo sau là tên kiểu, rồi gán một giá trị khớp với kiểu đó:

```typescript
// Syntax:  let <variableName>: <type> = <value>;

let myName: string = "Monster"; // annotated as string -> only text allowed
let fairNumber: number = 8;     // annotated as number -> integers, floats, hex, binary
let isTsHard: boolean = false;  // annotated as boolean -> only true / false

// Reassigning with the SAME type is fine
myName = "Another Person";

// Reassigning with a DIFFERENT type fails at compile time:
// myName = 12; // ❌ Error: Type 'number' is not assignable to type 'string'
```

### Type Inference (Suy luận kiểu)
Nếu bạn gán một giá trị ngay khi khai báo, thường bạn có thể bỏ qua phần chú thích — TypeScript sẽ **suy luận (infer)** ra nó:

```typescript
let tech = "TypeScript"; // TypeScript infers the type as `string`
let count = 8;           // inferred as `number`
let active = true;       // inferred as `boolean`

// Inference is just as strict as an explicit annotation:
// tech = 12; // ❌ Error: Type 'number' is not assignable to type 'string'
```

---

## 🧩 4. Kiểu Mảng (Array) & Tuple

```typescript
// Notation A: element-type followed by square brackets (the common, modern style)
let ratings: number[] = [5, 4, 5, 2];

// Notation B: the generic Array<T> wrapper (older, rarely used today)
let skills: Array<string> = ["React", "TypeScript", "Node"];

// The array element type is enforced on every operation, including .push()
let items: string[] = [];
items.push("keyboard"); // ✅ a string is allowed
// items.push(12);      // ❌ Error: number is not assignable to type 'string'
```

### Mảng nhiều chiều
Một mảng có thể chứa các mảng khác. Thêm một cặp ngoặc vuông cho mỗi chiều:

```typescript
// Each extra [] adds a level of nesting
let single: number[] = [1, 2, 3, 4, 5];           // 1-D
let matrix: number[][] = [[1, 2, 3], [4, 5, 6]];   // 2-D (a matrix / grid)
let cube: number[][][] = [[[1, 2], [3, 4]]];       // 3-D (rarely needed)
```

### Tuple
Tuple là các mảng có **số lượng phần tử cố định** mà kiểu dữ liệu tại từng vị trí cụ thể đã được biết trước:

```typescript
// A tuple: index 0 must be a number, index 1 must be a string
let userSession: [number, string] = [101, "admin"];

// Swapping the order breaks the contract:
// userSession = ["admin", 101]; // ❌ Error: 'string' is not assignable to type 'number'
```

> [!NOTE]
> Bạn đã sử dụng tuple trong React rồi đấy! `const [count, setCount] = useState(0)` trả về một tuple có kiểu `[number, Dispatch<SetStateAction<number>>]` — một cặp ở vị trí cố định gồm giá trị state và hàm setter của nó.

---

## 🧩 5. Enum

Enum (Enumerations - Kiểu liệt kê) cho phép chúng ta định nghĩa một tập hợp các hằng số có đặt tên.

#### A. Numeric Enums (Enum dạng số)
Mặc định, các enum dạng số tự động tăng giá trị bắt đầu từ `0`:
```typescript
enum UserRole {
  Admin,  // 0
  Editor, // 1
  User    // 2
}
let currentRole: UserRole = UserRole.Admin; // Evaluates to 0
```

#### B. String Enums (Enum dạng chuỗi)
Enum dạng chuỗi rất dễ đọc vì các giá trị không tự động tăng; chúng được biên dịch trực tiếp thành các chuỗi hằng (string literal):
```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}
let currentDir: Direction = Direction.Up; // Evaluates to "UP"
```

---

## 🧩 6. Hàm: Chú thích Tham số & Giá trị trả về

Bạn chú thích cho từng tham số, và (tùy chọn) cho giá trị trả về đặt sau danh sách tham số:

```typescript
// Regular function: `num` is annotated as number, return value annotated as number
function addOne(num: number): number {
  return num + 1;
}
const result = addOne(3); // ✅ 4
// addOne("3"); // ❌ Error: argument of type 'string' is not assignable to 'number'

// Arrow function with two annotated params and an annotated return type
const double = (x: number, y: number): number => x * y;
const product = double(2, 10); // ✅ 20

// Default parameter values — TypeScript infers the type from the default
function greet(person: string = "Anonymous"): string {
  return `Hello ${person}`;
}
greet();          // "Hello Anonymous"
greet("Monster"); // "Hello Monster"
```

> [!WARNING]
> Nếu bạn quên chú thích cho một tham số, TypeScript sẽ mặc định dùng **`any` ngầm định (implicit `any`)** (và cảnh báo bạn khi bật `"strict": true`). Việc gọi `double(2, 10)` có thể *trông* ổn, nhưng một tham số `x` không được chú thích sẽ âm thầm vô hiệu hóa an toàn kiểu cho đối số đó. Hãy luôn chú thích cho các tham số của bạn.

TypeScript cũng kiểm soát **số lượng đối số** — truyền quá nhiều hoặc quá ít đều là lỗi:

```typescript
// double expects exactly 2 arguments
// double(2);          // ❌ Error: Expected 2 arguments, but got 1
// double(2, 10, 5);   // ❌ Error: Expected 2 arguments, but got 3
```

---

## 🧩 7. Kiểu Object & Type Alias

Bạn có thể chú thích chính xác **hình dạng (shape)** của một object ngay tại chỗ (inline), hoặc tách nó ra thành một **type alias (bí danh kiểu)** tái sử dụng được:

```typescript
// Inline object annotation: keys separated by semicolons
let person: { firstName: string; lastName: string; age: number } = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
};
// Omitting `age` -> Error: Property 'age' is missing in type ...

// A `type` alias names a shape so you can reuse it everywhere
type User = {
  name: string;
  age: number;
  location: string;
};

// Reuse the alias as a parameter type and a return type
function printUser(): User {
  return { name: "Monster", age: 20, location: "Earth" };
}
const res: User = printUser();
```

> [!TIP]
> Type alias giúp code của bạn tuân theo nguyên tắc DRY — định nghĩa hình dạng một lần và tham chiếu đến nó bằng tên. Ở phần sau của khóa học, bạn sẽ gặp **interface**, vốn còn mạnh mẽ hơn nữa trong việc mô tả hình dạng object.

---

## 🧩 8. Các kiểu dữ liệu đặc biệt: `any`, `unknown`, `void` và `never`

| Kiểu đặc biệt | Hành vi | Khi nào sử dụng |
| :--- | :--- | :--- |
| **`any`** | Vô hiệu hóa hoàn toàn việc kiểm tra kiểu. Bạn có thể gọi bất kỳ thuộc tính hay phương thức nào trên nó. | Tránh dùng nếu có thể. Chỉ hữu ích cho việc chuyển đổi tạm thời từ JavaScript. |
| **`unknown`** | Phiên bản an toàn kiểu của `any`. Bạn không thể gọi phương thức trên nó nếu chưa kiểm tra kiểu trước thông qua một **type guard** để thu hẹp nó. | Khi xử lý các giá trị từ đầu vào bên ngoài chưa rõ kiểu (ví dụ JSON đã parse, payload từ API bên ngoài). |
| **`void`** | Biểu thị sự vắng mặt của một giá trị trả về. | Kiểu trả về của các hàm thực hiện công việc nhưng không trả về giá trị (ví dụ `console.log`). |
| **`never`** | Biểu thị các giá trị **không bao giờ xảy ra**. | Kiểu trả về của các hàm lặp vô hạn hoặc luôn luôn ném ra ngoại lệ. |

```typescript
// ❌ `any` turns OFF all checking — this compiles but crashes at runtime:
let color: any = "Crimson";
color = 20;
// color(); // no editor error, but throws "color is not a function" when run

// ✅ `unknown` is the safe alternative — you MUST narrow before using it:
let inputData: unknown = "Hello World";
// let length: number = inputData.length; // ❌ Error: Object is of type 'unknown'
if (typeof inputData === "string") {
  let length: number = inputData.length; // ✅ Safe! Narrowed to string by the type guard
}

// `void`: function does work but returns nothing meaningful
function printMessage(message: string): void {
  console.log("This is my message:", message);
}

// `never`: function NEVER returns (always throws or loops forever)
function throwError(message: string): never {
  throw new Error(message);
}
function infiniteLoop(): never {
  while (true) {} // control flow never reaches the end
}
```

> [!NOTE]
> `void` và `never` trông giống nhau nhưng khác biệt: một hàm `void` *có trả về* (nó chỉ không tạo ra giá trị hữu ích nào), trong khi một hàm `never` *không bao giờ đến được điểm trả về* — nó luôn ném lỗi hoặc lặp mãi mãi.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về TypeScript cơ bản. Nhấp vào **Reveal Answer** để xác nhận.

### 1. TypeScript có chạy trực tiếp trong các web engine của trình duyệt không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Trình duyệt chỉ có thể thực thi JavaScript. TypeScript là một công cụ ở thời điểm phát triển. Trình biên dịch TypeScript (`tsc`) sẽ transpile các tệp `.ts` thành tệp `.js` tiêu chuẩn, loại bỏ toàn bộ chú thích kiểu trước khi triển khai.
</details>

### 2. Sự khác biệt giữa `any` và `unknown` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `any` bỏ qua hoàn toàn việc kiểm tra kiểu. Bạn có thể truy cập bất kỳ thuộc tính nào hoặc gọi bất kỳ phương thức nào trên nó mà không cần kiểm tra, điều này có thể gây crash tại runtime.
  - `unknown` là an toàn kiểu. Nó nói với trình biên dịch rằng "chúng ta chưa biết kiểu này". Bạn buộc phải thực hiện các type guard (như kiểm tra bằng `typeof`) để thu hẹp kiểu trước khi truy cập các thuộc tính trên nó. **Hãy ưu tiên `unknown` hơn `any`.**
</details>

### 3. Type Inference (Suy luận kiểu) trong TypeScript là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Type Inference là khả năng của TypeScript tự động xác định kiểu của biến dựa trên giá trị được gán cho chúng khi khai báo. Ví dụ, viết `let age = 25;` sẽ tự động gán cho `age` kiểu `number` mà không cần chú thích thủ công: `let age: number = 25;`.
</details>

### 4. Tuple là gì? Nêu một ví dụ phổ biến trong React hook.
<details>
  <summary><b>Reveal Answer</b></summary>

  Tuple là một mảng có độ dài cố định, trong đó kiểu của từng vị trí phần tử đã được định nghĩa trước. Một ví dụ phổ biến trong React là giá trị trả về của hook `useState`, trả về một tuple chứa giá trị state và một hàm setter, ví dụ `[string, Dispatch<SetStateAction<string>>]`.
</details>

### 5. Tại sao việc dùng String Enum thường được ưu tiên hơn Numeric Enum?
<details>
  <summary><b>Reveal Answer</b></summary>

  Numeric enum biên dịch thành các số nguyên tự động tăng (0, 1, 2...). Nếu bạn in hoặc log giá trị của chúng, chúng sẽ xuất ra các con số khiến việc gỡ lỗi trở nên khó khăn. String enum giữ các giá trị chuỗi dễ đọc (như `"UP"`, `"DOWN"`), giúp các log runtime và payload mạng trở nên mô tả rõ ràng và dễ hiểu.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Cấu hình và Biên dịch lần đầu
1. Bên trong một thư mục tạm trong workspace của bạn, tạo một tệp tên là `basics.ts`.
2. Định nghĩa một String Enum tên là `Status` gồm các khóa: `Pending`, `Success`, `Failed`.
3. Tạo một biến tuple `apiResponse` có kiểu `[Status, number, string[]]` đại diện cho Status, Mã HTTP, và danh sách các chuỗi thông điệp.
4. Thử gán một kiểu sai (như truyền một boolean thay vì một `Status`) để xem các cảnh báo của trình biên dịch.
5. Sửa lại các kiểu cho đúng, mở terminal, và chạy `npx tsc basics.ts` để biên dịch tệp thành JavaScript tiêu chuẩn `basics.js`. Mở tệp đầu ra để quan sát cách các kiểu bị loại bỏ và cách enum được biên dịch.

**Khung khởi đầu (Starter scaffold):**
```typescript
// basics.ts
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Failed = "FAILED",
}

// [status, httpCode, messages]
let apiResponse: [Status, number, string[]] = [Status.Success, 200, ["OK"]];

// Try this to trigger an error, then fix it:
// apiResponse = [true, 200, ["OK"]]; // ❌ boolean is not assignable to Status

console.log(apiResponse);
```

### 🛠️ Bài tập 2: Xử lý đầu vào an toàn với `unknown`
Thực hành để hiểu tại sao `unknown` tốt hơn `any` khi dữ liệu đến từ bên ngoài code của bạn.

1. Tạo một tệp `safeInput.ts`.
2. Viết một hàm `formatTitle(value: unknown): string` nhận vào một giá trị kiểu `unknown`.
3. Bên trong nó, dùng một **type guard** `typeof` để kiểm tra xem `value` có phải là `string` hay không. Nếu đúng, trả về giá trị đó ở dạng chữ in hoa; nếu không, trả về chuỗi `"INVALID INPUT"`.
4. Gọi hàm một lần với một chuỗi và một lần với một số, rồi log cả hai kết quả.
5. Bây giờ hãy đổi kiểu tham số từ `unknown` sang `any` và để ý rằng trình soạn thảo ngừng bảo vệ bạn — hãy xác nhận rằng việc bỏ type guard với `any` vẫn biên dịch được dù điều đó không an toàn.

**Hành vi mong đợi:**
```typescript
// safeInput.ts
function formatTitle(value: unknown): string {
  // `unknown` forces this guard before we may treat `value` as a string
  if (typeof value === "string") {
    return value.toUpperCase(); // ✅ safely narrowed to string here
  }
  return "INVALID INPUT";
}

console.log(formatTitle("typescript")); // "TYPESCRIPT"
console.log(formatTitle(42));           // "INVALID INPUT"
```
