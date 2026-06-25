# Kiểm thử đơn vị (Unit Testing) với Vitest 🧪

**Kiểm thử đơn vị (Unit Testing)** là việc kiểm thử các phần mã nguồn riêng lẻ (hàm, lớp tiện ích, thuật toán) một cách hoàn toàn độc lập nhằm đảm bảo chúng hoạt động chính xác đúng như mong đợi. Trong các hệ sinh thái React hiện đại, **Vitest** là framework kiểm thử thế hệ mới được ưa chuộng vì cực kỳ nhanh, cấu hình ngay lập tức với Vite, và hỗ trợ cú pháp assertion tương thích với Jest.

---

## 🌐 Khái niệm & Tổng quan

Trước khi viết dòng test đầu tiên, hãy hiểu *vị trí* của kiểm thử đơn vị. Có ba dạng kiểm thử tự động, và chúng tạo thành một kim tự tháp đi từ rẻ nhất/nhanh nhất ở dưới đáy đến đắt nhất/chậm nhất ở trên đỉnh:

| Loại kiểm thử | Kiểm tra cái gì | Phạm vi | Tốc độ |
| :--- | :--- | :--- | :--- |
| **Unit** | Một hàm hoặc lớp đơn lẻ một cách độc lập | Nhỏ nhất (một "đơn vị") | ⚡ Nhanh nhất |
| **Integration** | Cách nhiều module, cơ sở dữ liệu và API phối hợp *với nhau* | Trung bình | 🚶 Trung bình |
| **End-to-End (E2E)** | Một hành trình người dùng thực sự qua toàn bộ ứng dụng (frontend + backend + dịch vụ) | Lớn nhất | 🐢 Chậm nhất |

Bài học này tập trung hoàn toàn vào **kiểm thử đơn vị** — xác minh rằng những phần logic nhỏ, độc lập làm đúng những gì ta mong đợi. Hãy hình dung như một nhà máy sản xuất ô tô: trước khi lắp ráp toàn bộ chiếc xe (E2E), bạn kiểm tra từng con bu-lông, bánh răng và bugi hoạt động riêng lẻ (unit). Nếu một con bu-lông bị lỗi, bạn muốn biết *ngay bây giờ*, chứ không phải sau khi xe đã xuất xưởng.

> [!NOTE]
> **Tại sao chọn Vitest thay vì Jest, Mocha hay Cypress?** Vitest là trình chạy nhanh nhất trong số các trình chạy phổ biến, và nó hỗ trợ sẵn **ESM**, **TypeScript** và **JSX** ngay từ đầu. Các framework khác chỉ hỗ trợ ESM ở mức thử nghiệm và có thể cần cấu hình thêm cho TypeScript/JSX. Vì Vitest dùng chung cấu hình của Vite, bạn tái sử dụng *chính* các loader và bundler mà ứng dụng của bạn đang dùng — không cần thiết lập Babel trùng lặp.

> [!TIP]
> Hãy viết test bằng **JavaScript thuần** trong khi bạn *đang học* kiểm thử đơn vị. Hệ thống kiểu của TypeScript vốn đã loại bỏ nhiều lỗi đầu vào không hợp lệ ngay tại thời điểm biên dịch, điều này lại che giấu các trường hợp biên (như truyền vào một chuỗi khi cần một số) — vốn là những thứ làm cho kiểm thử đơn vị trở nên thú vị. Khi chuyển sang các React component, hãy đổi sang `.tsx`.

> [!WARNING]
> Test đơn vị không bao giờ nên phụ thuộc vào mạng, cơ sở dữ liệu hay hệ thống tệp thực. Ngay khi một test "đơn vị" vươn ra một dịch vụ bên ngoài, nó trở thành một test *tích hợp* chậm và hay lỗi vặt. Hãy giữ các đơn vị thuần khiết và độc lập — mock các phụ thuộc bên ngoài khi cần.

---

## ⚡ 1. Cài đặt & Cấu hình

Để thêm Vitest vào dự án React dựa trên Vite của bạn, hãy chạy:

```bash
npm install -D vitest
```

### Thêm Script vào `package.json`
Thêm một command script để khởi chạy trình chạy Vitest ở chế độ watch, cùng với một bảng điều khiển UI tùy chọn:
```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

Script `test:ui` mở một bảng điều khiển trên trình duyệt, nơi bạn có thể lọc theo test đậu, rớt, hoặc bị bỏ qua, và xem chi tiết mã cũng như đầu ra console của từng test. Script `test` thông thường chạy cùng bộ test đó trực tiếp trong terminal của bạn.

> [!NOTE]
> Chạy `npm run test:ui` lần đầu tiên sẽ nhắc bạn cài đặt phụ thuộc `@vitest/ui` — hãy chấp nhận. Gói này chỉ có ở Vitest; các trình chạy như Jest hay Mocha không đi kèm nó.

---

## 🧩 2. Viết Test Đơn vị Đầu tiên của Bạn

Một tệp test thường được đặt tên với phần mở rộng `.test.js` hoặc `.test.ts`. Phân đoạn `.test` cho trình chạy biết tệp này là một bộ test. Chúng ta tổ chức các test bằng ba khối chính:
1. **`describe`**: Nhóm các test liên quan lại với nhau thành một bộ test có tên (tùy chọn, nhưng được khuyến nghị để dễ đọc).
2. **`it`** (hoặc **`test`**): Định nghĩa một ca kiểm thử đơn lẻ. `it` và `test` có thể thay thế cho nhau — chúng hoạt động giống hệt nhau.
3. **`expect`**: Khẳng định rằng giá trị nhận được khớp với kết quả mong đợi. Một **assertion** là một câu lệnh kiểm tra xem một giá trị có thỏa mãn một điều kiện hay không (bằng nhau, tính đúng, v.v.).

Hãy kiểm thử một tệp tiện ích chứa các phép toán đơn giản:

### Tệp Mã nguồn (`src/utils/math.js`)
```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

export const divide = (a, b) => {
  // Guard against division by zero by throwing a descriptive error
  if (b === 0) throw new Error('Division by zero is not allowed');
  return a / b;
};

export const calculateDiscount = (price, discount) => {
  if (price < 0 || discount < 0) return 0;
  return price - (price * discount);
};
```

### Tệp Test (`src/utils/math.test.js`)
```javascript
import { describe, it, expect } from 'vitest';
import { add, subtract, multiply, divide, calculateDiscount } from './math';

describe('Math Utility Functions', () => {

  it('should correctly add two numbers', () => {
    // Assert that the returned value equals the expected result
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
  });

  it('should correctly subtract two numbers', () => {
    expect(subtract(5, 2)).toBe(3);
  });

  it('should correctly multiply two numbers', () => {
    expect(multiply(3, 4)).toBe(12);
    expect(multiply(-2, 3)).toBe(-6);
  });

  it('should correctly divide two numbers', () => {
    expect(divide(6, 3)).toBe(2);
    expect(divide(5, 2)).toBe(2.5);
  });

  it('should throw an error when dividing by zero', () => {
    // Wrap the call in an arrow function so Vitest can invoke it safely
    expect(() => divide(5, 0)).toThrow('Division by zero is not allowed');
  });

  it('should apply discount percentage correctly', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
  });

  it('should return 0 if price or discount is negative', () => {
    expect(calculateDiscount(-100, 0.1)).toBe(0);
    expect(calculateDiscount(100, -0.1)).toBe(0);
  });
});
```

Để thực thi bộ test, chạy `npm run test`. Chế độ watch giữ cho trình chạy luôn hoạt động và chỉ chạy lại các test bị ảnh hưởng bởi các tệp bạn lưu — phản hồi tức thì trong khi bạn code.

> [!TIP]
> Luôn đặt cho các khối `it`/`test` của bạn những **mô tả có ý nghĩa** (ví dụ `'should throw an error when dividing by zero'`). Khi một test rớt sau sáu tháng — hoặc khi một đồng đội đọc bộ test của bạn — phần mô tả là manh mối đầu tiên về thứ gì đã hỏng và tại sao.

---

## 🎯 3. Mô hình AAA (Arrange–Act–Assert)

Các test có cấu trúc tốt tuân theo mô hình **AAA**, chia mỗi test thành ba giai đoạn rõ ràng:

1. **Arrange** (Sắp xếp) — thiết lập mọi thứ test cần (biến, dữ liệu mock, đầu vào).
2. **Act** (Hành động) — thực hiện hành động bạn đang kiểm thử (gọi hàm).
3. **Assert** (Khẳng định) — xác minh kết quả khớp với những gì bạn mong đợi.

### 🍰 Ẩn dụ Nướng bánh

Hãy hình dung AAA như việc nướng một chiếc bánh:

- **Arrange** = tập hợp nguyên liệu và dụng cụ (bột, đường, trứng, tô trộn).
- **Act** = trộn nguyên liệu và cho bánh vào lò.
- **Assert** = cắt một miếng và nếm thử để xác nhận bánh đã nướng đúng cách.

Nếu bánh ngon, các bước của bạn đã thành công. Nếu không, bạn biết chính xác giai đoạn nào cần kiểm tra.

```javascript
import { test, expect } from 'vitest';
import { add } from '../src/math';

test('adds numbers correctly', () => {
  // 1. Arrange — set up the input data
  const a = 1;
  const b = 1;

  // 2. Act — perform the action under test
  const result = add(a, b);

  // 3. Assert — verify the outcome
  expect(result).toBe(2);
});
```

> [!NOTE]
> AAA là một *quy ước*, không phải một quy tắc cú pháp. Trình chạy không bắt buộc áp dụng nó. Nhưng việc tách ba giai đoạn này một cách trực quan (thường bằng dòng trống hoặc comment) làm cho test dễ đọc và dễ debug hơn rất nhiều.

---

## 🔴🟢🔵 4. Phát triển Hướng Kiểm thử (TDD): Red–Green–Refactor

**TDD** đảo ngược thứ tự thông thường: bạn viết **test trước**, rồi viết vừa đủ mã để làm cho nó đậu. Chu trình có ba bước lặp lại, thường gọi là **Red → Green → Refactor**:

| Giai đoạn | Màu | Bạn làm gì | Trạng thái mong đợi |
| :--- | :--- | :--- | :--- |
| **1. Viết một test thất bại** | 🔴 Đỏ | Mô tả những gì mã *nên* làm, trước khi nó tồn tại | Test RỚT (chưa có mã) |
| **2. Làm cho nó đậu** | 🟢 Xanh lá | Viết *lượng mã tối thiểu* để thỏa mãn test | Test ĐẬU |
| **3. Refactor** | 🔵 Xanh dương | Dọn dẹp / tối ưu mã, giữ cho test vẫn xanh | Test VẪN ĐẬU |

Sau đó bạn **lặp lại** chu trình cho tính năng tiếp theo.

```javascript
// STEP 🔴 RED — write the test before any implementation exists.
// src/math.test.js
import { describe, it, expect } from 'vitest';
import { add } from '../src/math';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3); // Fails: `add` does not exist yet!
  });
});
```

```javascript
// STEP 🟢 GREEN — write the minimum code to make the test pass.
// src/math.js
export const add = (a, b) => a + b;
```

```javascript
// STEP 🔵 REFACTOR — improve the code while keeping the test green.
// src/math.js
export const add = (a, b) => {
  // Add validation discovered during refactoring
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
};
```

> [!WARNING]
> Bước Red **phải thực sự thất bại trước**. Nếu test mới tinh của bạn đậu trước khi bạn viết bất kỳ phần triển khai nào, thì test đó bị lỗi (nó không kiểm thử thứ bạn nghĩ) — hãy sửa test trước khi tiếp tục.

---

## ⚡ 5. Bảng Tham chiếu Đầy đủ các Matcher

Các assertion sử dụng **Matcher** để so sánh giá trị theo nhiều cách khác nhau. Cho đến giờ ta chủ yếu dùng `toBe`, nhưng Vitest cung cấp hàng chục matcher. Đây là bảng tham chiếu hằng ngày của bạn:

| Matcher | Kiểm tra cái gì | Phù hợp nhất cho |
| :--- | :--- | :--- |
| `toBe(value)` | So sánh bằng nghiêm ngặt (`Object.is`, giống `===`) — cùng kiểu *và* cùng giá trị | Kiểu nguyên thủy: số, chuỗi, boolean |
| `toEqual(value)` | So sánh bằng **sâu** — so sánh nội dung một cách đệ quy | Object & mảng (bỏ qua tham chiếu) |
| `toStrictEqual(value)` | So sánh sâu **cộng thêm** kiểm tra kiểu — cũng phân biệt thuộc tính `undefined`, mảng thưa, và kiểu lớp | So sánh object/mảng nghiêm ngặt |
| `toContain(item)` | Một mảng chứa một phần tử, hoặc một chuỗi chứa một chuỗi con | Mảng & chuỗi con |
| `toBeNull()` | Giá trị chính xác là `null` | Kiểm tra null |
| `toBeUndefined()` | Giá trị chính xác là `undefined` | Kiểm tra undefined |
| `toBeTruthy()` | Giá trị là truthy (bất cứ gì trừ `false`, `0`, `''`, `null`, `undefined`, `NaN`) | Kiểm tra lỏng kiểu "có giá trị" |
| `toBeFalsy()` | Giá trị là falsy (một trong các giá trị liệt kê ở trên) | Kiểm tra lỏng kiểu "rỗng/vắng mặt" |
| `toBeGreaterThan(n)` | Số `> n` | So sánh số học |
| `toBeGreaterThanOrEqual(n)` | Số `>= n` | So sánh số học (bao gồm) |
| `toBeLessThan(n)` | Số `< n` | So sánh số học |
| `toBeLessThanOrEqual(n)` | Số `<= n` | So sánh số học (bao gồm) |
| `toMatch(regexOrString)` | Chuỗi khớp một biểu thức chính quy hoặc chứa một chuỗi con | Kiểm tra mẫu/định dạng |
| `toHaveProperty(key)` | Một object có một khóa thuộc tính nhất định | Kiểm tra hình dạng object |
| `toThrow(error?)` | Một hàm ném ra lỗi (tùy chọn khớp với một thông điệp/lỗi) | Logic xử lý lỗi |

```javascript
import { it, expect } from 'vitest';

it('demonstrates the core matchers', () => {
  // --- Equality ---
  expect(5).toBe(5);                                  // strict primitive equality
  expect({ id: 1 }).toEqual({ id: 1 });               // deep equality (refs differ, OK)
  expect({ a: 1 }).toStrictEqual({ a: 1 });           // deep + type strictness

  // --- Collections & strings ---
  expect([1, 2, 3]).toContain(2);                     // array membership
  expect('hello world').toContain('world');           // substring
  expect('hello world').toMatch(/World/i);            // regex, case-insensitive

  // --- Nullish / truthiness ---
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
  expect(1).toBeTruthy();
  expect(0).toBeFalsy();

  // --- Numbers ---
  expect(10).toBeGreaterThan(5);
  expect(10).toBeGreaterThanOrEqual(10);
  expect(3).toBeLessThan(5);
  expect(3).toBeLessThanOrEqual(3);

  // --- Objects ---
  const user = { name: 'Alice', age: 22 };
  expect(user).toHaveProperty('name');

  // --- Errors (note the arrow-function wrapper) ---
  expect(() => { throw new Error('boom'); }).toThrow('boom');
});
```

> [!WARNING]
> `toThrow()` yêu cầu bạn truyền lời gọi **được bao bọc trong một hàm mũi tên**: `expect(() => myFn()).toThrow()`. Nếu bạn viết `expect(myFn()).toThrow()`, hàm sẽ chạy *ngay lập tức* và làm crash test trước khi assertion có thể bắt được lỗi.

```javascript
// Why toBe fails but toEqual succeeds for objects
it('should verify objects share identical structures', () => {
  const user = { name: "Alice", role: "admin" };

  // expect(user).toBe({ name: "Alice", role: "admin" }); // Fails! Different reference.
  expect(user).toEqual({ name: "Alice", role: "admin" }); // Success! Deep values match.
});
```

---

## ✅❌📏 6. Kiểm thử Tích cực, Tiêu cực & Biên

Một bộ test vững chắc kiểm thử ba loại đầu vào, không chỉ con đường hạnh phúc (happy path):

| Chiến lược | Xác minh cái gì | Ví dụ (cho một hàm `add(a, b)` đòi hỏi các số) |
| :--- | :--- | :--- |
| **Tích cực (Positive)** | Hệ thống hoạt động đúng với đầu vào **hợp lệ** | `add(3, 5)` trả về `8` |
| **Tiêu cực (Negative)** | Hệ thống từ chối đầu vào **không hợp lệ** một cách nhẹ nhàng (ném lỗi, không crash) | `add('3', 5)` ném ra "Both inputs must be numbers" |
| **Biên (Boundary)** | Hệ thống xử lý **các điểm cực** của các khoảng hợp lệ, nơi lỗi ẩn nấp nhiều nhất | Một bộ kiểm tra mật khẩu tại chính xác 8 và chính xác 16 ký tự |

```javascript
// Source: src/math.js
export const add = (a, b) => {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both inputs must be numbers');
  }
  return a + b;
};
```

```javascript
import { describe, it, expect } from 'vitest';
import { add } from '../src/math';

describe('add', () => {
  // ✅ POSITIVE testing — valid inputs produce correct output
  it('should add valid numbers', () => {
    expect(add(3, 5)).toBe(8);
    expect(add(10, 20)).toBe(30);
    expect(add(0, 0)).toBe(0);
  });

  // ❌ NEGATIVE testing — invalid inputs are rejected gracefully
  it('should throw an error for invalid inputs', () => {
    expect(() => add(3, '5')).toThrow('Both inputs must be numbers');
    expect(() => add('a', 5)).toThrow('Both inputs must be numbers');
    expect(() => add(undefined, null)).toThrow('Both inputs must be numbers');
  });
});
```

### 📏 Kiểm thử Biên trong Thực tế

Các biên là nơi lỗi lệch-một (off-by-one) cư trú. Đối với một mật khẩu phải **từ 8 đến 16 ký tự**, bạn kiểm thử *ngay bên trong* và *ngay bên ngoài* mỗi điểm cực:

```javascript
// Source: src/validatePassword.js
export const validatePassword = (password) => {
  if (password.length < 8 || password.length > 16) {
    throw new Error('Password must be between 8 and 16 characters');
  }
  return 'Password is valid';
};
```

```javascript
import { describe, it, expect } from 'vitest';
import { validatePassword } from '../src/validatePassword';

describe('validatePassword (boundary tests)', () => {
  it('should allow a password with exactly 8 characters (min boundary)', () => {
    expect(validatePassword('abcdefgh')).toBe('Password is valid');
  });

  it('should allow a password with exactly 16 characters (max boundary)', () => {
    expect(validatePassword('abcdefghijklmnop')).toBe('Password is valid');
  });

  it('should throw when password is shorter than 8 (just outside min)', () => {
    expect(() => validatePassword('abc')).toThrow('Password must be between 8 and 16 characters');
  });

  it('should throw when password is longer than 16 (just outside max)', () => {
    expect(() => validatePassword('abcdefghijklmnopq')).toThrow('Password must be between 8 and 16 characters');
  });
});
```

---

## 🧠 Kiểm tra Kiến thức của Bạn

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về kiểm thử đơn vị. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Sự khác biệt giữa kiểm thử đơn vị, tích hợp và end-to-end là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Kiểm thử đơn vị (Unit testing)** xác minh một phần mã độc lập đơn lẻ (một hàm hoặc lớp) tự thân nó — những test nhỏ nhất, nhanh nhất.
  - **Kiểm thử tích hợp (Integration testing)** kiểm tra cách nhiều module, cơ sở dữ liệu, hoặc API phối hợp *với nhau*.
  - **Kiểm thử end-to-end (E2E)** mô phỏng một hành trình người dùng thực qua toàn bộ ứng dụng, bao gồm frontend, backend, và các dịch vụ bên ngoài. Bài học này tập trung vào kiểm thử đơn vị.
</details>

### 2. Sự khác biệt giữa `toBe()`, `toEqual()`, và `toStrictEqual()` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`toBe()`** dùng so sánh bằng theo tham chiếu nghiêm ngặt (`Object.is`, giống `===`). Dùng nó cho các kiểu nguyên thủy (số, chuỗi, boolean).
  - **`toEqual()`** thực hiện so sánh **sâu** nội dung của object/mảng, bỏ qua việc các tham chiếu có trỏ tới cùng vùng nhớ hay không.
  - **`toStrictEqual()`** giống `toEqual()` nhưng *nghiêm ngặt hơn*: nó còn kiểm tra kiểu thuộc tính, phân biệt các thuộc tính `undefined`, mảng thưa, và các thực thể lớp (class instance). Hai object đậu `toEqual` vẫn có thể rớt `toStrictEqual`.
</details>

### 3. Giải thích mô hình AAA và tại sao chúng ta bao bọc mã ném lỗi trong một hàm mũi tên cho `toThrow()`.
<details>
  <summary><b>Reveal Answer</b></summary>

  **AAA** = **Arrange** (thiết lập đầu vào/dữ liệu mock), **Act** (gọi hàm đang được kiểm thử), **Assert** (xác minh kết quả). Nó giữ cho test dễ đọc, giống như tập hợp nguyên liệu, nướng bánh, rồi nếm thử.

  Đối với `toThrow()`, chúng ta bao bọc lời gọi trong một hàm mũi tên — `expect(() => myFn()).toThrow()` — để Vitest có thể gọi nó *bên trong một try/catch*. Nếu bạn truyền trực tiếp `expect(myFn())`, hàm thực thi ngay lập tức và lỗi làm crash test trước khi assertion chạy.
</details>

### 4. Mô tả chu trình TDD Red–Green–Refactor.
<details>
  <summary><b>Reveal Answer</b></summary>

  1. **🔴 Red** — viết một test cho hành vi chưa tồn tại; nó thất bại.
  2. **🟢 Green** — viết *lượng mã tối thiểu* cần thiết để làm cho test đậu.
  3. **🔵 Refactor** — dọn dẹp hoặc tối ưu mã trong khi giữ cho test xanh.

  Sau đó lặp lại. Kỷ luật then chốt là test phải thực sự thất bại trước — nếu nó đậu trước khi bạn viết mã, thì test có khiếm khuyết.
</details>

### 5. Sự khác biệt giữa kiểm thử tích cực, tiêu cực và biên là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Kiểm thử tích cực (Positive testing)** xác nhận hệ thống hoạt động với đầu vào *hợp lệ* (ví dụ `add(3, 5)` trả về `8`).
  - **Kiểm thử tiêu cực (Negative testing)** xác nhận hệ thống *từ chối một cách nhẹ nhàng* các đầu vào không hợp lệ — ném ra một lỗi rõ ràng thay vì crash hoặc trả về rác.
  - **Kiểm thử biên (Boundary testing)** nhắm vào *các điểm cực* của các khoảng hợp lệ (ngay bên trong và ngay bên ngoài giá trị nhỏ nhất/lớn nhất), vì lỗi lệch-một tụ tập tại các biên.
</details>

---

## 💻 Bài tập Thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình. Sử dụng **mô hình AAA** và bao gồm các trường hợp **tích cực, tiêu cực, và biên**.

### 🛠️ Bài tập 1: Bộ Test cho Tiện ích Toán học (với TDD)

Thực hành toàn bộ chu trình Red–Green–Refactor trên các thuật toán thực.

1. Tạo `src/mathUtils.js` và triển khai+export các hàm này:
   - `factorial(n)`: trả về `n!`; ném `'Number must be non-negative'` khi `n < 0`.
   - `gcd(a, b)`: trả về ước số chung lớn nhất (dùng đệ quy: `b === 0 ? a : gcd(b, a % b)`).
   - `fibonacci(n)`: trả về mảng dãy số đến `n` phần tử; ném `'Number must be non-negative'` khi `n < 0`.
2. **Thực hành TDD**: với ít nhất một hàm, hãy viết test của nó trong `src/mathUtils.test.js` **trước** phần triển khai, xem nó thất bại (🔴), rồi làm cho nó đậu (🟢).
3. Viết một bộ `describe('Math Utilities', ...)` bao phủ:
   - **Tích cực**: `expect(factorial(5)).toBe(120)`, `expect(gcd(56, 98)).toBe(14)`, `expect(fibonacci(5)).toEqual([0, 1, 1, 2, 3])`.
   - **Tiêu cực**: `expect(() => factorial(-1)).toThrow('Number must be non-negative')`.
   - **Biên**: kiểm thử `factorial(0)` (phải là `1`) và `fibonacci(1)`.
4. Chạy `npm run test` và xác nhận tất cả test đều đậu.

### 🛠️ Bài tập 2: Test Tiện ích Chuỗi & Mảng

Kiểm thử các hàm biến đổi chuỗi và mảng thực bằng cách dùng đầy đủ bộ matcher.

1. Tạo `src/stringUtils.js` và export:
   - `reverseString(str)`: `str.split('').reverse().join('')`.
   - `capitalize(str)`: chữ cái đầu viết hoa, phần còn lại viết thường.
   - `isPalindrome(str)`: trả về `true`/`false` (so sánh một chuỗi đã được làm sạch, viết thường với chuỗi đảo ngược của nó).
2. Tạo `src/arrayUtils.js` và export:
   - `sum(arr)`: tổng của tất cả phần tử qua `reduce`.
   - `findMax(arr)` / `findMin(arr)`: dùng `Math.max` / `Math.min` với spread.
   - `removeDuplicates(arr)`: `[...new Set(arr)]`.
3. Tạo các tệp `.test.js` tương ứng và viết một bộ `describe` cho mỗi tệp, xác minh:
   - `reverseString('hello')` **`toBe`** `'olleh'`.
   - `capitalize('hELLO')` **`toBe`** `'Hello'`.
   - `isPalindrome('racecar')` **`toBeTruthy`**, và `isPalindrome('apple')` **`toBeFalsy`**.
   - `sum([1, 2, 3])` **`toBe`** `6` (tích cực) và `sum([-1, -2, -3])` **`toBe`** `-6` (giá trị âm).
   - `findMax([10, 5, 100])` **`toBe`** `100`.
   - `removeDuplicates([1, 2, 2, 3, 4, 4])` **`toEqual`** `[1, 2, 3, 4]`.
   - Dùng **`toContain`** để khẳng định một mảng kết quả bao gồm một phần tử cụ thể.
4. Khởi chạy `npm run test` (hoặc `npm run test:ui` cho bảng điều khiển) và xác minh mọi bộ test đều xanh.

### 🛠️ Bài tập 3 (Nâng cao): Tính toán Giỏ hàng

1. Tạo `src/cartUtils.js` và export:
   - `calculateItemTotal(price, qty = 1)`: trả về tổng chi phí; mặc định số lượng là `1` nếu bỏ qua.
   - `formatCurrency(amount)`: trả về một chuỗi đã định dạng như `"$100.00"`.
2. Trong `src/cartUtils.test.js`, xác minh rằng:
   - `calculateItemTotal` hoạt động cho các số lượng tiêu chuẩn, áp dụng giá trị mặc định `1`, và xử lý các tham số âm (biên/tiêu cực).
   - `formatCurrency` thêm ký hiệu đô la ở đầu và định dạng hai chữ số thập phân — khẳng định bằng **`toMatch(/^\$\d+\.\d{2}$/)`**.
3. Chạy `npm run test` và kiểm tra các log trên console.
