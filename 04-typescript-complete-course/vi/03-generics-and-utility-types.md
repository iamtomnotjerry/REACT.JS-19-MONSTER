# Bài 3: Generic & Các kiểu tiện ích (Utility Types) 📘

Bài học này bao gồm **Generic** (viết các hàm, class và interface có khả năng tái sử dụng, hoạt động với nhiều kiểu dữ liệu khác nhau trong khi vẫn đảm bảo an toàn kiểu dữ liệu tại thời điểm biên dịch), các **Utility Types** tích hợp sẵn của TypeScript để biến đổi cấu trúc dữ liệu, và **Type Narrowing** (thu hẹp một kiểu rộng xuống thành một kiểu chính xác bên trong các khối điều kiện).

---

## 🌐 Khái niệm & Tổng quan

Generic là lời giải của TypeScript cho một bài toán đơn giản: *làm thế nào để tôi viết một đoạn logic hoạt động được với nhiều kiểu — mà không phải vứt bỏ tính an toàn kiểu dữ liệu?* Lối thoát ngây thơ là dùng `any`, nhưng `any` âm thầm tắt trình biên dịch đi. Generic giữ cho trình biên dịch luôn hoạt động đầy đủ: nó ghi nhớ chính xác kiểu dữ liệu đi vào, và đảm bảo chính xác kiểu dữ liệu đi ra.

> **Một phép ẩn dụ thực tế: chiếc hộp giao hàng 📦**
>
> Hãy hình dung một generic `Box<T>` như một chiếc hộp carton để giao hàng. Bản thân chiếc hộp luôn có *cùng một* thiết kế — bốn vách, một nắp, một chỗ dán nhãn. Nhưng thứ nằm *bên trong* thì thay đổi: hôm nay nó chứa một chiếc điện thoại, ngày mai một quyển sách, tuần sau một đôi giày. Chiếc hộp không cần được thiết kế lại cho từng món đồ. Tấm nhãn (`<T>`) chỉ đơn giản ghi lại *loại đồ vật* bên trong, để khi bạn mở nó ra sau này, bạn biết chính xác cần mong đợi điều gì. `any` thì giống như một chiếc hộp hoàn toàn không có nhãn — bạn sẽ phải đoán xem bên trong chứa gì và hy vọng mình đoán đúng.

> [!NOTE]
> Một tham số kiểu generic (phần `<T>`) là một **biến kiểu (type variable)**. Cũng giống như một tham số hàm `(item)` là một chỗ giữ cho một *giá trị*, `<T>` là một chỗ giữ cho một *kiểu*. Quy ước là dùng một chữ cái viết hoa — `T` (Type), `U` (kiểu thứ hai), `K` (Key), `V` (Value) — nhưng bạn có thể viết đầy đủ tên như `<TData>` khi điều đó giúp dễ đọc hơn.

> [!TIP]
> Hãy dùng **generic** khi mối quan hệ giữa kiểu đầu vào và đầu ra cần được bảo toàn (ví dụ "hàm này trả về đúng kiểu mà nó đã nhận"). Hãy dùng **utility types** (`Partial`, `Pick`, `Omit`…) khi bạn cần suy ra một *cấu trúc mới* từ một kiểu *đã có sẵn*. Hãy dùng **type narrowing** khi một biến duy nhất có thể là một trong nhiều kiểu tại thời điểm chạy và bạn phải xác định một cách an toàn nó đang là kiểu nào.

### `any` vs `unknown` vs Generic — bảng so sánh

| Cách tiếp cận | An toàn kiểu | Biết kiểu trả về? | Autocomplete | Khi nào dùng |
| :--- | :--- | :--- | :--- | :--- |
| **`any`** | ❌ Không — trình kiểm tra bị tắt | ❌ Không | ❌ Không | Hầu như không bao giờ; chỉ là lối thoát khi di chuyển code. |
| **`unknown`** | ✅ An toàn, nhưng buộc phải kiểm tra | ⚠️ Chỉ sau khi narrowing | ⚠️ Sau khi narrowing | Khi đầu vào thực sự chưa biết và phải được xác thực. |
| **Generic `<T>`** | ✅ Đầy đủ | ✅ Có — ghi nhận chính xác kiểu | ✅ Có | Hàm/class/interface tái sử dụng, bảo toàn liên kết kiểu. |

```text
              ┌─────────────────────────┐
   number ───▶│                         │───▶ number
   string ───▶│   identity<T>(x: T): T  │───▶ string
  boolean ───▶│                         │───▶ boolean
              └─────────────────────────┘
        the SAME function — the type rides along with the value
```

---

## ⚡ 1. Generic trong TypeScript

Generic hoạt động như các biến kiểu—nghĩa là bạn có thể truyền một tham số kiểu (thường được biểu diễn dưới dạng `<T>`) vào một hàm hoặc component giống như cách truyền một đối số.

### A. Generic cho Hàm (Generic Functions)
Thay vì sử dụng `any` (làm mất tính an toàn kiểu dữ liệu), generic bảo toàn liên kết kiểu chính xác giữa đầu vào và đầu ra:

```typescript
// 1. A basic generic utility function
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const num = getFirstElement([10, 20, 30]); // TypeScript infers 'num' is type: number
const str = getFirstElement(["a", "b", "c"]); // TypeScript infers 'str' is type: string
```

Bạn cũng có thể viết một generic trả về *hai* giá trị mà kiểu của chúng đi cùng nhau:

```typescript
// A function that returns a tuple of [item, defaultValue], both of type T
function uniqueDataType<T>(item: T, defaultValue: T): [T, T] {
  return [item, defaultValue];
}

const numbers = uniqueDataType<number>(10, 20);   // inferred as [number, number]
const strings = uniqueDataType<string>("hello", "world"); // [string, string]
const bools = uniqueDataType<boolean>(true, false);       // [boolean, boolean]
```

> [!NOTE]
> Thông thường bạn **không** cần phải viết các dấu ngoặc nhọn tại nơi gọi hàm (`uniqueDataType<number>(...)`). TypeScript *suy luận* `T` từ các đối số bạn truyền vào. Chỉ chỉ định nó một cách tường minh khi việc suy luận không thể tự xác định được, hoặc khi bạn muốn cố định kiểu một cách có chủ đích.

### B. Ràng buộc Generic (Generic Constraints - `extends`)
Đôi khi bạn muốn một hàm hỗ trợ nhiều kiểu, nhưng với yêu cầu rằng chúng phải chứa những thuộc tính cụ thể. Ta thực thi điều này bằng từ khóa **`extends`**:

```typescript
interface HasId {
  id: number;
}

// Enforce that T must possess an 'id' property
function logItemDetails<T extends HasId>(item: T): void {
  console.log(`Item ID is: ${item.id}`);
}

logItemDetails({ id: 101, title: "Book" }); // Safe!
// logItemDetails({ title: "No ID" }); // Error: Property 'id' is missing.
```

### C. Ràng buộc bằng `keyof`
Bạn có thể ràng buộc một tham số generic khớp với các tên thuộc tính (keys) của một đối tượng khác:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const car = { brand: "Tesla", model: "Model 3", year: 2024 };
const brand = getProperty(car, "brand"); // Safe!
// const price = getProperty(car, "price"); // Error: Argument of type '"price"' is not assignable to 'brand' | 'model' | 'year'
```

### D. Nhiều tham số kiểu (`<T, U>`)
Một hàm generic không bị giới hạn ở một kiểu duy nhất. Khi hai đầu vào có thể có các kiểu *khác nhau* — và bạn muốn giữ cho cả hai kiểu đều chính xác — hãy khai báo nhiều hơn một tham số kiểu. Một ví dụ kinh điển là một hàm đảo ngược thứ tự của một cặp giá trị:

```typescript
// 'reversePair' takes one value of type T and one of type U,
// then returns them swapped as a [U, T] tuple — both types preserved.
function reversePair<T, U>(value1: T, value2: U): [U, T] {
  return [value2, value1];
}

const reversed = reversePair("hello", 20);
// TypeScript infers the result as [number, string]
console.log(reversed); // [20, "hello"]
```

> [!TIP]
> Hãy đặt tên cho các tham số bổ sung theo vai trò của chúng, chứ không chỉ theo thứ tự bảng chữ cái. `<TInput, TResult>` dễ đọc hơn nhiều so với `<T, U>` trong một codebase thực tế, và các gợi ý IntelliSense trở nên tự giải thích.

### E. Generic cho Class (`Box<T>`)
Generic cũng tỏa sáng trong các class. Một **generic class** được tham số hóa bằng một kiểu tại thời điểm bạn tạo một instance, nhờ đó cùng một định nghĩa class có thể an toàn chứa một `string`, một `number`, hoặc bất kỳ kiểu nào khác — mỗi instance ghi nhớ `T` của riêng nó:

```typescript
// A reusable container class. 'T' is decided per-instance.
class Box<T> {
  private content: T;

  constructor(initialContent: T) {
    this.content = initialContent;
  }

  // Returns the stored value with its precise type T
  getContent(): T {
    return this.content;
  }

  // Accepts only a value of the same type T
  setContent(newContent: T): void {
    this.content = newContent;
  }
}

// String box: T is locked to string
const stringBox = new Box<string>("hello typescript");
console.log(stringBox.getContent()); // "hello typescript"
stringBox.setContent("new content edited");
console.log(stringBox.getContent()); // "new content edited"

// Number box: T is locked to number
const numberBox = new Box<number>(20);
console.log(numberBox.getContent()); // 20
numberBox.setContent(100);
console.log(numberBox.getContent()); // 100
// numberBox.setContent("oops"); // Error: 'string' is not assignable to 'number'
```

Lưu ý rằng `stringBox.setContent` sẽ chỉ chấp nhận chuỗi và `numberBox.setContent` sẽ chỉ chấp nhận số — mặc dù cả hai đều đến từ *cùng một* class `Box`. Đó chính là toàn bộ lợi ích của một generic class.

---

## ⚡ 2. Các kiểu tiện ích tích hợp sẵn (Utility Types)

TypeScript cung cấp sẵn một số kiểu tiện ích trợ giúp toàn cục để biến đổi các kiểu hiện có thành các cấu trúc mới.

| Kiểu tiện ích | Mô tả | Trường hợp sử dụng |
| :--- | :--- | :--- |
| **`Partial<T>`** | Đặt tất cả thuộc tính của kiểu `T` thành **tùy chọn (optional)** (`?`). | Xử lý các form chỉnh sửa/cập nhật hoặc yêu cầu PATCH. |
| **`Readonly<T>`** | Đặt tất cả thuộc tính của kiểu `T` thành **chỉ đọc (read-only)**. | Đóng băng trạng thái cấu hình hoặc bộ nhớ đệm state. |
| **`Pick<T, Keys>`** | Tạo một kiểu bằng cách **chọn lọc** một nhóm key cụ thể từ `T`. | Trích xuất các thẻ xem trước đơn giản từ cấu trúc database lớn. |
| **`Omit<T, Keys>`** | Tạo một kiểu bằng cách **loại bỏ** một nhóm key cụ thể khỏi `T`. | Tạo dữ liệu người dùng gửi lên mà không có các ID được sinh tự động. |

### Ví dụ mã nguồn sử dụng Utility Types

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
}

// 1. Partial: Makes all profile fields optional for update operations
const updateProfile = (id: number, updates: Partial<UserProfile>) => {
  // updates can contain username, email, or avatarUrl; all are optional
};

// 2. Readonly: Freezes the profile so no field can be reassigned
const lockedProfile: Readonly<UserProfile> = {
  id: 1,
  username: "monstercoder",
  email: "coder@test.com",
  avatarUrl: "https://avatar.png"
};
// lockedProfile.username = "changed"; // Error: cannot assign to read-only property

// 3. Pick: Selects only username and avatarUrl for list previews
type UserPreview = Pick<UserProfile, "username" | "avatarUrl">;
const preview: UserPreview = {
  username: "monstercoder",
  avatarUrl: "https://avatar.png"
};

// 4. Omit: Removes 'id' for user registration forms
type RegisterData = Omit<UserProfile, "id">;
const submission: RegisterData = {
  username: "alice",
  email: "alice@test.com",
  avatarUrl: "https://alice.jpg"
};
```

---

## ⚡ 3. Type Narrowing

**Type narrowing** là quá trình tinh chỉnh kiểu của một biến *bên trong một khối điều kiện* của mã nguồn, cho phép bạn viết logic chính xác và an toàn kiểu hơn. Khi một biến có thể là một trong nhiều kiểu (một *union*), TypeScript sẽ không cho phép bạn sử dụng các phương thức đặc thù của kiểu cho đến khi bạn đã *chứng minh* được mình đang giữ kiểu nào. Những công cụ thực hiện việc chứng minh này được gọi là **type guard**.

> **Một phép ẩn dụ thực tế: làn kiểm tra an ninh sân bay 🛂**
>
> Một kiểu union `string | number` giống như một hàng hành khách mà mỗi người có thể là công dân *hoặc* khách du lịch. Bạn không thể đưa cho ai đó tờ khai làn ưu tiên "chỉ dành cho công dân" cho đến khi bạn đã *kiểm tra hộ chiếu của họ*. Các phép kiểm tra `typeof`/`instanceof` chính là việc quét hộ chiếu: một khi lần quét xác nhận "công dân", mọi người ở phía sau trong làn đó đều được đối xử như công dân với sự tin tưởng đầy đủ. TypeScript làm chính xác điều này — bên trong khối đã được xác minh, nó nâng cấp biến lên thành kiểu hẹp hơn, có nhiều khả năng hơn.

| Kỹ thuật narrowing | Phù hợp nhất để kiểm tra… | Ví dụ kiểm tra |
| :--- | :--- | :--- |
| **`typeof`** | Các kiểu nguyên thủy (primitive) | `typeof value === "string"` |
| **`instanceof`** | Các instance của class | `animal instanceof Dog` |
| **Toán tử `in`** | Sự hiện diện của một thuộc tính | `"bark" in animal` |
| **Discriminated union** | Các biến thể đối tượng có nhãn (tagged) | `shape.kind === "circle"` |

### A. Type Guard với `typeof`
Toán tử `typeof` thu hẹp các kiểu **nguyên thủy (primitive)** (`string`, `number`, `boolean`, v.v.):

```typescript
type MyType = string | number;

function example(value: MyType): void {
  if (typeof value === "string") {
    // Inside this block, TypeScript knows 'value' is a string
    console.log(value.toUpperCase());
  } else {
    // Here, 'value' must be a number
    console.log(value.toFixed(2));
  }
}

example("hello"); // "HELLO"
example(20);      // "20.00"
```

### B. Type Guard với `instanceof`
Toán tử `instanceof` thu hẹp kiểu bằng cách kiểm tra xem một đối tượng có được tạo ra từ một **class** (constructor) cụ thể hay không:

```typescript
class Dog {
  bark(): void {
    console.log("woof woof");
  }
}

class Cat {
  meow(): void {
    console.log("meow");
  }
}

function animalSound(animal: Dog | Cat): void {
  if (animal instanceof Dog) {
    // Narrowed to Dog — '.bark()' is available
    animal.bark();
  } else {
    // Narrowed to Cat — '.meow()' is available
    animal.meow();
  }
}

animalSound(new Dog()); // "woof woof"
animalSound(new Cat()); // "meow"
```

### C. Discriminated Union
Một **discriminated union (union có nhãn)** trao cho mỗi thành viên của union một thuộc tính literal chung — *discriminant* (nhãn phân biệt) — nhờ đó một phép kiểm tra bằng đơn giản trên thuộc tính đó sẽ thu hẹp toàn bộ đối tượng. Đây là mẫu mạnh mẽ nhất để mô hình hóa "một trong nhiều cấu trúc đã biết":

```typescript
// Each variant carries a unique literal 'kind' tag
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  side: number;
}

type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // Narrowed to Circle — 'radius' is accessible
      return Math.PI * shape.radius ** 2;
    case "square":
      // Narrowed to Square — 'side' is accessible
      return shape.side ** 2;
  }
}

console.log(area({ kind: "circle", radius: 2 })); // ~12.566
console.log(area({ kind: "square", side: 3 }));   // 9
```

> [!WARNING]
> Type narrowing diễn ra tại **thời điểm biên dịch** để giúp bạn viết mã an toàn, nhưng tất cả các kiểu trong TypeScript đều bị **xóa bỏ (erased)** khi biên dịch sang JavaScript. Một phép kiểm tra `typeof`/`instanceof` vẫn tồn tại (vì nó là JavaScript thực sự), nhưng một discriminant như `kind` phải là một *giá trị runtime thực sự* trên đối tượng — TypeScript sẽ không tự bịa ra nó cho bạn. Hãy luôn đặt nhãn một cách tường minh khi bạn khởi tạo đối tượng.

> [!TIP]
> Hãy kết hợp discriminated union với một **phép kiểm tra tính đầy đủ (exhaustiveness check)**: thêm một nhánh `default` gán giá trị đó vào một biến có kiểu `never`. Nếu sau này bạn thêm một biến thể mới vào union nhưng quên xử lý nó, trình biên dịch sẽ báo lỗi ở nhánh `default` — biến một lỗi runtime âm thầm thành một lỗi tại thời điểm build.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về TypeScript nâng cao. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao việc sử dụng Generic `<T>` lại được ưa chuộng hơn việc sử dụng kiểu `any`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `any` tắt chức năng kiểm tra kiểu của trình biên dịch, nghĩa là TypeScript không biết hay không xác minh kiểu trả về của một hàm. Generic `<T>` hoạt động như một chỗ giữ ghi nhận *chính xác* kiểu được truyền vào, đảm bảo các mối quan hệ kiểu và sự an toàn của autocomplete cho các giá trị đầu ra.
</details>

### 2. Trong `reversePair<T, U>(value1: T, value2: U): [U, T]`, tại sao lại khai báo hai tham số kiểu thay vì một?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hai đối số có thể thuộc các kiểu *khác nhau* (ví dụ một `string` và một `number`), và chúng ta muốn bảo toàn **cả hai** kiểu một cách chính xác trong kết quả. Một `<T>` duy nhất sẽ buộc cả hai đối số phải dùng chung một kiểu. Việc khai báo `<T, U>` cho phép mỗi giá trị giữ kiểu riêng của nó, nhờ đó `reversePair("hello", 20)` được suy luận đúng thành `[number, string]`.
</details>

### 3. Lợi ích của một generic class như `Box<T>` so với việc viết riêng hai class `StringBox` và `NumberBox` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một định nghĩa `Box<T>` duy nhất được tái sử dụng cho mọi kiểu — bạn tránh được việc lặp lại logic của class. Mỗi instance "khóa cố định" `T` của riêng nó tại thời điểm tạo (`new Box<string>(...)`, `new Box<number>(...)`), nhờ đó `getContent()` trả về đúng kiểu chính xác và `setContent()` từ chối các giá trị sai kiểu. Một nguồn chân lý duy nhất, an toàn kiểu đầy đủ cho từng instance.
</details>

### 4. Bên trong `if (typeof value === "string") { ... } else { ... }` với `value: string | number`, TypeScript gán kiểu nào cho `value` trong mỗi nhánh?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bên trong khối `if`, `value` được thu hẹp thành `string` (nên các phương thức như `.toUpperCase()` khả dụng). Bên trong khối `else`, TypeScript thu hẹp nó thành `number` bằng cách loại trừ (nên `.toFixed()` khả dụng). Sự tinh chỉnh này chính là **type narrowing** thông qua một type guard `typeof`.
</details>

### 5. Điều gì làm cho một *discriminated union* an toàn hơn một union thông thường của các kiểu đối tượng, và bạn phải nhớ lưu ý gì về runtime?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mỗi thành viên chia sẻ một thuộc tính "nhãn" literal chung (ví dụ `kind: "circle"`), nhờ đó một phép kiểm tra đơn lẻ như `shape.kind === "circle"` thu hẹp toàn bộ đối tượng — cho phép xử lý `switch` gọn gàng và các phép kiểm tra tính đầy đủ tùy chọn. Lưu ý: các kiểu bị xóa bỏ tại thời điểm biên dịch, nên discriminant phải là một **giá trị thực sự** mà bạn đặt trên đối tượng tại thời điểm chạy. TypeScript không tự thêm nó cho bạn.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Xây dựng một Generic API Response Wrapper
1. Tạo một tệp `generics.ts` trong workspace của bạn.
2. Định nghĩa một generic interface `ApiResponse<T>` gồm:
   - `status`: number.
   - `message`: string.
   - `data`: kiểu generic `T`.
3. Tạo một interface `Product` gồm `id` (number) và `title` (string).
4. Định nghĩa một biến `productResponse` sử dụng `ApiResponse<Product>` và gán một object giả lập để kiểm tra autocomplete của trình biên dịch.
5. Tạo một interface `User` gồm `id` (number) và `username` (string).
6. Định nghĩa một biến `usersListResponse` sử dụng `ApiResponse<User[]>` và gán một danh sách người dùng giả lập.
7. Xác nhận rằng bạn nhận được các thuộc tính autocomplete khi truy cập `productResponse.data.title` và `usersListResponse.data[0].username`.

### 🛠️ Bài tập 2: Generic Class `Stack<T>` + Type Narrowing
1. Trong một tệp `stack.ts`, tạo một **generic class** `Stack<T>` với:
   - Một mảng `private items: T[]` được khởi tạo bằng `[]`.
   - Một phương thức `push(item: T): void` nối thêm vào `items`.
   - Một phương thức `pop(): T | undefined` xóa và trả về phần tử cuối cùng.
   - Một phương thức `peek(): T | undefined` trả về (mà không xóa) phần tử cuối cùng.
2. Tạo `const numberStack = new Stack<number>();`, push vài số vào, và log kết quả của `pop()`.
3. Tạo `const stringStack = new Stack<string>();`, push vài chuỗi vào, và xác nhận rằng trình biên dịch từ chối `stringStack.push(42)`.
4. Bây giờ thêm **type narrowing**: viết một hàm `describe(value: string | number): string` mà:
   - Sử dụng một type guard `typeof` để trả về `` `text of length ${value.length}` `` khi `value` là một `string`.
   - Trả về `` `number doubled is ${value * 2}` `` khi `value` là một `number`.
5. **Mục tiêu nâng cao:** Định nghĩa một discriminated union `type Notification = { kind: "email"; address: string } | { kind: "sms"; phone: string }`. Viết một hàm `send(n: Notification)` thực hiện `switch` trên `n.kind` và log đúng trường tương ứng. Thêm một nhánh `default` gán `n` vào `const _exhaustive: never = n;` để thực thi tính đầy đủ.
