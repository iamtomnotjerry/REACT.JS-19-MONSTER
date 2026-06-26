# Bài 2: Interface, Type Alias & Hàm 📘

Bài học này trình bày cách định nghĩa cấu trúc đối tượng tùy chỉnh, xử lý các giá trị linh hoạt bằng kiểu Union và Intersection, và thực thi kiểm tra kiểu an toàn nghiêm ngặt cho các hàm và tham số callback. Chúng ta cũng sẽ tìm hiểu sâu các tính năng làm cho **interface** trở nên đặc biệt: declaration merging (gộp khai báo), thuộc tính optional và `readonly`, cùng method signature (chữ ký phương thức).

---

## 📖 Khái niệm & Tổng quan

Trong TypeScript, hai công cụ quan trọng nhất để mô tả *hình dạng* (shape) của dữ liệu là **interface** và **type alias**. Thoạt nhìn chúng gần như giống hệt nhau, nhưng mỗi loại lại có những sức mạnh riêng mà loại kia không có. Một khi đã hiểu về hình dạng đối tượng, bạn có thể áp dụng sự chặt chẽ tương tự cho các **hàm** của mình: định kiểu cho tham số, đối số tùy chọn, giá trị mặc định, kiểu trả về, và thậm chí cả các callback mà bạn truyền đi.

Một mô hình tư duy then chốt giúp bạn "thông" được TypeScript chính là **structural typing** (đôi khi được gọi vui là "duck typing"): TypeScript không quan tâm bạn *đặt tên* cho một kiểu là gì — nó quan tâm đến *cấu trúc* (tập hợp các thuộc tính và kiểu của chúng). Nếu một đối tượng có đúng hình dạng, nó sẽ phù hợp, bất kể nó đến từ đâu.

> [!NOTE]
> Một **interface** là một *hợp đồng* mô tả hình dạng mà một đối tượng **bắt buộc phải có**. Trình biên dịch kiểm tra mọi đối tượng bạn gán dựa trên hợp đồng đó — nếu một thuộc tính bắt buộc bị thiếu hoặc sai kiểu, bạn sẽ nhận được lỗi tại thời điểm biên dịch, từ rất lâu trước khi mã được chạy.

> [!TIP]
> Một quy tắc thực tế dễ nhớ: hãy dùng **interface** khi bạn đang mô tả hình dạng của một *đối tượng* hoặc một *class*, đặc biệt trong một public API mà người khác có thể mở rộng. Hãy dùng **type alias** khi bạn cần *union*, *intersection*, *tuple*, *kiểu nguyên thủy*, hoặc bất kỳ hình dạng nào không phải đối tượng.

> [!WARNING]
> Chỉ có **interface** mới hỗ trợ *declaration merging*. Nếu bạn khai báo cùng một tên **type alias** hai lần, TypeScript sẽ báo lỗi `Duplicate identifier`. Nắm được sự khác biệt này sẽ giúp bạn tiết kiệm hàng giờ debug đầy bối rối.

---

## 🧠 Giải thích chuyên sâu: Phép ẩn dụ "Hợp đồng công việc"

Hãy hình dung một **interface** như một **bản mô tả công việc** do một công ty đăng tuyển.

Bản mô tả công việc liệt kê các trách nhiệm (các thuộc tính và phương thức) mà một ứng viên **bắt buộc** phải đáp ứng được. Công ty không quan tâm bạn *tốt nghiệp trường nào* hay *chức danh công việc trước đây của bạn là gì* — họ chỉ quan tâm bạn có làm được mọi thứ trong danh sách hay không. Đây chính xác là cách **structural typing** hoạt động: TypeScript kiểm tra xem đối tượng của bạn có thể "làm được công việc" mà interface mô tả hay không, chứ không phải bạn có gắn nhãn rõ ràng nó thuộc kiểu đó hay không.

- Một **thuộc tính optional (`?`)** giống như một kỹ năng *có thì tốt*: "Biết tiếng Pháp là một lợi thế." Bạn vẫn nhận được công việc dù có hay không có kỹ năng đó.
- Một **thuộc tính `readonly`** giống như *mã số nhân viên* của bạn: nó được cấp một lần duy nhất trong ngày đầu đi làm và không bao giờ được thay đổi về sau.
- Một **method signature** là một *nhiệm vụ* bắt buộc mà bạn phải thực hiện được, ví dụ "phải có khả năng nộp báo cáo hàng tuần" (`printSongInfo(): string`).
- **Declaration merging** giống như việc công ty *bổ sung* vào cùng một bản mô tả công việc sau này: các trách nhiệm mới được thêm vào vai trò hiện có thay vì tạo ra một vai trò mới hoàn toàn và mâu thuẫn.

### 📊 Bảng so sánh nhanh Interface và Type Alias

| Khả năng                              | `interface` | `type` (alias) |
| ------------------------------------- | :---------: | :------------: |
| Mô tả hình dạng đối tượng             |     ✅      |       ✅       |
| Thuộc tính optional (`?`)             |     ✅      |       ✅       |
| Thuộc tính `readonly`                 |     ✅      |       ✅       |
| Method signature                      |     ✅      |       ✅       |
| Mở rộng / kết hợp các hình dạng khác  | `extends`   |  `&` (intersection) |
| **Declaration merging** (mở lại)      |     ✅      |  ❌ (lỗi)      |
| Kiểu Union (`A \| B`)                 |     ❌      |       ✅       |
| Tuple & kiểu nguyên thủy              |     ❌      |       ✅       |
| `implements` trên một `class`         |     ✅      |   ✅ (chỉ hình dạng đối tượng) |

---

## ⚡ 1. Interface vs. Type Alias

Cả interface và type alias đều cho phép bạn định nghĩa cấu trúc của đối tượng. Tuy nhiên, chúng được thiết kế cho các trường hợp sử dụng khác nhau.

### A. Interface (Đối tượng & Khả năng mở rộng)
Interface là bản thiết kế tiêu chuẩn cho các đối tượng. Chúng hỗ trợ **kế thừa** (mở rộng interface) và **declaration merging**:

```typescript
// 1. Define base interface
interface User {
  readonly id: number; // Cannot be modified after initial assignment
  name: string;
  email: string;
  role?: string; // Optional property
}

// 2. Extending an interface (inheritance)
interface Employee extends User {
  salary: number;
}

const developer: Employee = {
  id: 1,
  name: "Sarah",
  email: "sarah@dev.com",
  salary: 95000
};
// developer.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

> [!NOTE]
> **Declaration Merging**: Nếu bạn khai báo hai interface có tên giống hệt nhau trong cùng một phạm vi, TypeScript sẽ tự động gộp các thuộc tính của chúng lại với nhau. Type alias không thể làm điều này.

---

### B. Type Alias (Tính linh hoạt & Kiểu Union)
Type Alias là cú pháp đặt tên viết tắt cho *bất kỳ* hình dạng kiểu nào, bao gồm kiểu nguyên thủy, union và tuple:

```typescript
// 1. Primitive Aliasing
type ID = string | number;

// 2. Object Shape Aliasing
type Point = {
  x: number;
  y: number;
};

// 3. Extending types (using Intersections)
type NamedPoint = Point & { name: string };
```

---

## ⚡ 2. Structural Typing ("Duck Typing")

TypeScript sử dụng hệ thống kiểu **structural** (theo cấu trúc), chứ không phải *nominal* (theo tên) — khác với Java hay C#. Điều này có nghĩa là hai kiểu được coi là tương thích nếu *cấu trúc* của chúng khớp nhau — *tên* của kiểu không hề quan trọng.

> Nếu nó đi như một con vịt và kêu quạc quạc như một con vịt, TypeScript sẽ coi nó là một con vịt.

```typescript
interface Named {
  name: string;
}

// 'logName' only requires that its argument HAS a 'name' string.
function logName(thing: Named): void {
  console.log(thing.name);
}

// This object was never declared as 'Named', but it has the right SHAPE,
// so TypeScript accepts it. This is structural typing in action.
const pet = { name: "Rex", legs: 4 };
logName(pet); // ✅ Works: 'pet' satisfies the 'Named' contract.

const robot = { id: 7 };
// logName(robot); // ❌ Error: Property 'name' is missing in type '{ id: number; }'.
```

> [!TIP]
> Các thuộc tính dư thừa là chấp nhận được khi gán từ một *biến* (như `pet` ở trên), vì đối tượng vẫn thỏa mãn hợp đồng. Tuy nhiên, một **object literal** được gán *trực tiếp* sẽ kích hoạt "excess property checks" (kiểm tra thuộc tính dư thừa) và sẽ báo lỗi với các thuộc tính lạ — một lưới an toàn có chủ đích để bắt lỗi gõ nhầm.

---

## ⚡ 3. Thuộc tính Optional (`?`) và Bổ ngữ `readonly`

### A. Thuộc tính Optional

Thêm dấu `?` sau tên thuộc tính để đánh dấu nó là **optional** (tùy chọn). Đối tượng vẫn hợp lệ dù có hay không có thuộc tính đó. Việc truy cập một thuộc tính optional bị thiếu sẽ trả về `undefined` (không phải lỗi).

```typescript
type Person = {
  name: string;
  location: string;
  age?: number; // Optional: callers may omit it entirely
};

// ✅ Valid: 'age' is omitted because it is optional
const userA: Person = {
  name: "Hassan",
  location: "China"
};

// ✅ Also valid: 'age' is provided
const userB: Person = {
  name: "Alex",
  location: "USA",
  age: 20
};

console.log(userA.age); // undefined (no error — the property is optional)
```

> [!WARNING]
> Nếu bạn bỏ dấu `?` khỏi `age`, TypeScript sẽ lập tức phàn nàn: *"Property 'age' is missing in type ... but required in type 'Person'."* Dấu `?` là thứ duy nhất khiến việc bỏ qua thuộc tính trở nên hợp lệ.

### B. Bổ ngữ `readonly`

`readonly` cho phép bạn *đọc* một thuộc tính nhưng cấm *gán lại* nó sau khi đối tượng đã được tạo. Nó hoàn hảo cho các ID, hằng số cấu hình, và bất kỳ giá trị nào không bao giờ nên thay đổi.

```typescript
type Account = {
  readonly id: number; // Set once at creation, never reassigned
  location: string;    // Mutable
};

const account: Account = { id: 101, location: "China" };

account.location = "Japan"; // ✅ Allowed: 'location' is mutable
// account.id = 999;        // ❌ Error: Cannot assign to 'id' because it is a read-only property.
```

---

## ⚡ 4. Kiểu Union và Intersection

TypeScript cho phép bạn kết hợp các kiểu bằng các phép toán tập hợp.

### Kiểu Union (`|` - Hoặc)
Kiểu union mô tả một giá trị có thể là một trong **nhiều** kiểu:

```typescript
const printId = (id: string | number) => {
  if (typeof id === "string") {
    // TypeScript narrows 'id' to string here
    console.log(id.toUpperCase());
  } else {
    // TypeScript narrows 'id' to number here
    console.log(id.toFixed(2));
  }
};

// Unions also work on variables and in tuples/arrays:
let items: (number | string)[] = [1, 5, "hello"];
// items.push(true); // ❌ Error: boolean is not assignable to number | string
```

### Kiểu Intersection (`&` - Và)
Kiểu intersection kết hợp nhiều kiểu thành **một**, yêu cầu đối tượng phải thỏa mãn *tất cả* các hình dạng được kết hợp:

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
  age: 30 // Must have both name AND age properties
};
```

---

## ⚡ 5. Method Signature bên trong Interface

Interface **không chỉ giới hạn ở dữ liệu thuần túy** — chúng còn có thể mô tả các **phương thức** mà một đối tượng phải triển khai. Đây là cách bạn diễn đạt "bất kỳ đối tượng nào có hình dạng này đều phải có khả năng *làm* một điều gì đó."

```typescript
// An interface describing a song that can describe ITSELF.
interface Song {
  songName: string;
  singerName: string;

  // Method signature: takes two strings, returns a string.
  printSongInfo(songName: string, singerName: string): string;
}

const song1: Song = {
  songName: "Natural",
  singerName: "Imagine Dragons",

  // The object must IMPLEMENT the method exactly as the signature requires.
  printSongInfo(songName: string, singerName: string): string {
    return `Song: ${songName} — Singer: ${singerName}`;
  }
};

console.log(song1.printSongInfo("Natural", "Imagine Dragons"));
// Output: Song: Natural — Singer: Imagine Dragons
```

Dưới đây là một ví dụ thứ hai kết hợp các thuộc tính dữ liệu với một phương thức `void` (một phương thức thực hiện hành động nhưng không trả về gì cả):

```typescript
interface PersonGreeter {
  firstName: string;
  lastName: string;
  age: number;
  sayHello(): void; // Action method; returns nothing
}

// 'greet' accepts ANY object that satisfies the PersonGreeter contract.
function greet(person: PersonGreeter): void {
  console.log(`Hello, ${person.firstName} ${person.lastName}`);
  person.sayHello();
}

greet({
  firstName: "John",
  lastName: "Doe",
  age: 30,
  sayHello() {
    console.log("Hi there!");
  }
});
```

> [!NOTE]
> Các interface có method signature kết hợp rất ăn ý với class thông qua `implements`. Một `class Car implements Vehicle { ... }` bị trình biên dịch buộc phải định nghĩa mọi phương thức (ví dụ `start()`, `stop()`) đã được khai báo trên interface `Vehicle`.

---

## ⚡ 6. Declaration Merging (Mở lại một Interface)

Một sức mạnh độc đáo của interface là **declaration merging**: bạn có thể khai báo *cùng một tên interface* nhiều hơn một lần, và TypeScript sẽ tự động **gộp** tất cả các khai báo thành một định nghĩa kết hợp duy nhất. Điều này là không thể với type alias.

```typescript
// First declaration
interface Computer {
  name: string;
  ram: number;
}

// Reopening the SAME interface to add more required properties.
// TypeScript MERGES this into the declaration above.
interface Computer {
  hardDiskDrive: number;
}

// Now 'Computer' effectively requires ALL THREE properties.
const myPc: Computer = {
  name: "i7",
  ram: 8,
  hardDiskDrive: 100 // Required because of the merged declaration
};

console.log(myPc.name, myPc.ram, myPc.hardDiskDrive);
```

So sánh điều này với một type alias, vốn **không** được phép gộp:

```typescript
type Gadget = { name: string };
// type Gadget = { price: number }; // ❌ Error: Duplicate identifier 'Gadget'.
```

> [!TIP]
> Declaration merging được các tác giả thư viện sử dụng rất nhiều để *bổ sung* (augment) các kiểu hiện có (ví dụ thêm thuộc tính vào interface `Window` toàn cục hoặc vào các kiểu của một module bên thứ ba) mà không cần sửa đổi mã nguồn gốc.

---

## ⚡ 7. Định nghĩa kiểu cho Hàm

Trong TypeScript, bạn có thể định kiểu một cách nghiêm ngặt cho tham số hàm, đối số tùy chọn, giá trị mặc định, và kiểu trả về.

```typescript
// 1. Named function with explicit return type
function calculateBill(price: number, taxRate: number, discount: number = 0): number {
  return (price * (1 + taxRate)) - discount;
}

// 2. Arrow function with optional parameter (note: optional params come LAST)
const formatGreeting = (name: string, title?: string): string => {
  if (title) return `Hello, ${title} ${name}`;
  return `Hello, ${name}`;
};

// 3. Callback Function Parameter Signature
const executeAction = (
  id: number,
  callback: (username: string) => void
): void => {
  const username = `User_${id}`;
  callback(username);
};

// Usage
executeAction(404, (name) => console.log(`Processed: ${name}`));
```

> [!WARNING]
> Một tham số tùy chọn (ví dụ `title?: string`) luôn phải xuất hiện **sau** tất cả các tham số bắt buộc. Viết `(title?: string, name: string)` là một lỗi cú pháp.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về đối tượng, interface và hàm. Nhấp vào **Reveal Answer** để xác nhận.

### 1. "Declaration Merging" trong TypeScript là gì, và cú pháp nào hỗ trợ nó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Declaration Merging xảy ra khi trình biên dịch TypeScript gộp hai hoặc nhiều khai báo độc lập có cùng tên thành một định nghĩa kết hợp duy nhất. Chỉ có **Interface** hỗ trợ declaration merging — việc mở lại một interface sẽ thêm các thành viên mới của nó vào interface hiện có. Trái lại, việc khai báo hai **Type Alias** cùng tên sẽ gây ra lỗi biên dịch `Duplicate identifier`.
</details>

### 2. Bổ ngữ `readonly` làm gì, và nó khác với thuộc tính optional (`?`) như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bổ ngữ `readonly` khiến một thuộc tính trở thành chỉ đọc **sau** khi đối tượng được tạo ban đầu — bất kỳ nỗ lực gán lại nào về sau đều kích hoạt lỗi biên dịch. Một thuộc tính **optional (`?`)** kiểm soát việc thuộc tính có *bắt buộc hay không*: nó có thể bị bỏ qua hoàn toàn (khi đó truy cập nó sẽ trả về `undefined`). Tóm lại: `readonly` liên quan đến *khả năng thay đổi* (mutability), còn `?` liên quan đến *sự hiện diện* (presence).
</details>

### 3. "Structural typing" là gì, và tại sao một object literal chưa từng được khai báo là một interface nhất định vẫn thỏa mãn được interface đó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Structural typing (còn gọi là "duck typing") nghĩa là TypeScript kiểm tra tính tương thích kiểu dựa trên **hình dạng** — tập hợp các thuộc tính và kiểu của chúng — thay vì dựa trên **tên** khai báo của kiểu (nominal typing). Miễn là một đối tượng chứa tất cả các thành viên bắt buộc với kiểu tương thích, nó sẽ thỏa mãn interface, bất kể nó đến từ đâu hay được gắn nhãn như thế nào.
</details>

### 4. Làm thế nào để khai báo một **method signature** bên trong một interface, và một đối tượng phải cung cấp gì để thỏa mãn nó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn khai báo nó như `printSongInfo(songName: string, singerName: string): string;` — một tên, các tham số có kiểu, và một kiểu trả về — ngay bên trong thân interface. Bất kỳ đối tượng nào được định kiểu bằng interface đó **bắt buộc phải triển khai** một phương thức khớp: cùng kiểu tham số và một giá trị trả về có thể gán được cho kiểu trả về đã khai báo (hoặc `void` nếu nó không trả về gì cả).
</details>

### 5. Sự khác biệt giữa kiểu Union và Intersection là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Một **Kiểu Union** (`A | B`) đại diện cho một giá trị có thể là *hoặc* kiểu A *hoặc* kiểu B (phép HOẶC logic). TypeScript thu hẹp (narrow) giá trị bên trong các phép kiểm tra `typeof`/`instanceof`.
  - Một **Kiểu Intersection** (`A & B`) kết hợp nhiều hình dạng thành một kiểu *bắt buộc phải chứa tất cả* các thuộc tính từ cả A và B (phép VÀ logic).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình.

### 🛠️ Bài tập 1: Định nghĩa kiểu cho một API Payload & Bộ xử lý
1. Tạo một tệp `functions.ts` trong workspace của bạn.
2. Định nghĩa một interface tên là `Product` chứa:
   - `id`: một số `readonly`.
   - `name`: string.
   - `price`: number.
   - `category`: string tùy chọn (optional).
3. **Mở lại** interface `Product` (declaration merging) trong cùng tệp đó và thêm một thuộc tính `readonly sku: string`. Xác nhận rằng các đối tượng `Product` mới giờ đây bị buộc phải bao gồm `sku`.
4. Định nghĩa một type alias `Cart` là một mảng các đối tượng `Product`.
5. Viết một hàm `checkout` nhận vào một `Cart` và một mã giảm giá *tùy chọn* (string), trả về tổng giá thanh toán (number):
   - Nếu mã giảm giá `"SAVE10"` được truyền vào, hãy trừ `10` khỏi tổng giá.
6. Tạo một mảng giỏ hàng giả lập, truyền nó vào hàm, và chạy kiểm tra biên dịch (`tsc functions.ts`) để xác minh tính đúng đắn của kiểu.
7. **Bonus:** Thử gán lại `product.id` sau khi tạo và xác nhận rằng trình biên dịch từ chối nó vì `readonly`.

### 🛠️ Bài tập 2: Một Interface với Method Signature
1. Trong cùng tệp đó, định nghĩa một interface `Song` với:
   - `songName`: string.
   - `singerName`: string.
   - Một method signature `printSongInfo(): string` trả về một mô tả đã được định dạng.
2. Tạo một đối tượng `song1` được định kiểu là `Song` và **triển khai** `printSongInfo()`, trả về một chuỗi như `"Natural by Imagine Dragons"`.
3. Viết một hàm độc lập `describeSong(song: Song): void` gọi `song.printSongInfo()` và in kết quả ra log.
4. Truyền một *object literal vô danh* với hình dạng đúng trực tiếp vào `describeSong(...)` để chứng minh **structural typing** — đối tượng này chưa bao giờ cần được gắn nhãn rõ ràng là `Song`.
5. **Bonus:** Thêm một interface thứ hai `LikeableSong` và dùng một **intersection** (`Song & LikeableSong`) để yêu cầu thêm một thuộc tính `likes: number`, sau đó cập nhật đối tượng của bạn cho phù hợp.
