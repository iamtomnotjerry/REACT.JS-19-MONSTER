# Kiểm thử đơn vị (Unit Testing) với Vitest 🧪

**Kiểm thử đơn vị (Unit Testing)** là việc kiểm thử các phần mã nguồn riêng lẻ (hàm, tệp tiện ích, thuật toán) một cách hoàn toàn độc lập nhằm đảm bảo chúng hoạt động chính xác theo thiết kế. Trong các dự án React hiện đại, **Vitest** là framework kiểm thử thế hệ mới được ưa chuộng nhờ tốc độ chạy cực nhanh, khả năng tích hợp sẵn với cấu hình Vite và hỗ trợ cú pháp assertion tương thích hoàn toàn với Jest.

---

## ⚡ 1. Hướng dẫn cài đặt & Cấu hình

Để cài đặt Vitest vào dự án React (chạy Vite) của bạn, hãy chạy lệnh sau:

```bash
npm install -D vitest
```

### Thêm script vào tệp `package.json`
Thêm dòng script sau để chạy trình kiểm thử Vitest ở chế độ theo dõi thay đổi (watch mode):
```json
"scripts": {
  "test": "vitest"
}
```

---

## 🧩 2. Viết ca kiểm thử (Test Case) đầu tiên

Tệp kiểm thử thường được đặt tên có đuôi `.test.js` hoặc `.test.ts`. Chúng ta tổ chức các test case sử dụng 3 hàm chính:
1. **`describe`**: Nhóm các ca kiểm thử liên quan lại với nhau thành một bộ kiểm thử (test suite).
2. **`it`** (hoặc **`test`**): Định nghĩa một ca kiểm thử đơn lẻ cụ thể.
3. **`expect`**: Kiểm tra xem giá trị nhận được có khớp với kết quả mong đợi hay không (assertion).

Chúng ta hãy thử kiểm thử một tệp hàm tiện ích tính toán cơ bản:

### Tệp mã nguồn (`src/utils/math.js`)
```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const calculateDiscount = (price, discount) => {
  if (price < 0 || discount < 0) return 0;
  return price - (price * discount);
};
```

### Tệp kiểm thử tương ứng (`src/utils/math.test.js`)
```javascript
import { describe, it, expect } from 'vitest';
import { add, subtract, calculateDiscount } from './math';

describe('Kiểm thử các hàm toán học', () => {
  
  it('nên cộng chính xác hai số', () => {
    // Xác thực giá trị trả về bằng kết quả mong muốn
    expect(add(2, 3)).toBe(5);
  });

  it('nên trừ chính xác hai số', () => {
    expect(subtract(5, 2)).toBe(3);
  });

  it('nên tính phần trăm giảm giá chính xác', () => {
    expect(calculateDiscount(100, 0.1)).toBe(90);
  });

  it('nên trả về 0 nếu giá tiền hoặc phần trăm giảm giá nhỏ hơn 0', () => {
    expect(calculateDiscount(-100, 0.1)).toBe(0);
    expect(calculateDiscount(100, -0.1)).toBe(0);
  });
});
```

Để thực thi bộ kiểm thử, chạy lệnh: `npm run test`.

---

## ⚡ 3. Các hàm so sánh (Matchers) phổ biến trong Vitest

Các khẳng định (assertions) sử dụng các **Matchers** để so sánh các giá trị theo nhiều cách khác nhau:

* **`toBe(value)`**: So sánh bằng nghiêm ngặt sử dụng phép toán `Object.is` (thích hợp cho các kiểu nguyên thủy như số, chuỗi, boolean).
* **`toEqual(value)`**: So sánh bằng sâu (deep equality) (thích hợp để so sánh cấu trúc của mảng hoặc object).
* **`toContain(item)`**: Kiểm tra xem một mảng có chứa phần tử cụ thể hay không hoặc một chuỗi có chứa chuỗi con hay không.
* **`toBeNull()`** / **`toBeUndefined()`**: Xác thực giá trị chính xác là null hoặc undefined.
* **`toThrow(error)`**: Xác thực một hàm có ném ra lỗi (exception) khi được gọi hay không.

```javascript
// Ví dụ so sánh hai đối tượng object
it('nên xác thực cấu trúc đối tượng trùng khớp', () => {
  const user = { name: "Alice", role: "admin" };
  
  // expect(user).toBe({ name: "Alice", role: "admin" }); // Thất bại! Địa chỉ tham chiếu thay đổi.
  expect(user).toEqual({ name: "Alice", role: "admin" }); // Thành công! Các thuộc tính bên trong trùng khớp.
});
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Điểm khác biệt lớn nhất giúp Vitest tối ưu hơn Jest trong các ứng dụng chạy Vite là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vitest tích hợp và chia sẻ chung bộ cấu hình biên dịch (build config) của Vite dưới nền. Nó sử dụng chung các loaders, plugins và tệp cấu hình, giúp bạn không cần thiết lập lại các cấu hình Babel phức tạp như khi dùng Jest. Vitest cũng chạy nhanh hơn vượt trội nhờ tận dụng tốc độ HMR (Hot Module Replacement) của Vite.
</details>

### 2. Sự khác biệt giữa hai hàm matcher `toBe()` và `toEqual()` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`toBe()`** so sánh bằng nghiêm ngặt bằng phép toán so sánh tham chiếu (`Object.is`). Nó được dùng cho các kiểu dữ liệu nguyên thủy như số, chuỗi và boolean.
  - **`toEqual()`** so sánh bằng cách duyệt sâu qua tất cả các thuộc tính của object hoặc phần tử của mảng, kiểm tra xem các cặp key-value có khớp nhau hay không, bất kể địa chỉ bộ nhớ của chúng có khác nhau.
</details>

### 3. Tại sao ta phải bao bọc mã ném ra lỗi (throw errors) trong một hàm ẩn danh khi dùng matcher `toThrow()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu bạn truyền trực tiếp lời gọi hàm (ví dụ: `expect(myFn()).toThrow()`), hàm đó sẽ thực thi ngay lập tức *trước khi* dòng kiểm thử chạy, làm crash cả bộ kiểm thử. Bao bọc nó trong một hàm mũi tên ẩn danh giúp Vitest có thể gọi nó bên trong khối try/catch của thư viện để kiểm tra lỗi an toàn:
  ```javascript
  expect(() => myFn()).toThrow();
  ```
</details>

### 4. Khối lệnh `describe` dùng để làm gì và có bắt buộc phải sử dụng không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khối lệnh `describe` dùng để nhóm các ca kiểm thử liên quan lại với nhau, giúp kết quả hiển thị của bộ kiểm thử trên terminal rõ ràng và dễ theo dõi. Nó không bắt buộc (bạn hoàn toàn có thể viết các hàm `it` độc lập ở cấp ngoài cùng), nhưng là thực tiễn tốt nhất giúp tổ chức các tệp kiểm thử ngăn nắp.
</details>

### 5. Chế độ theo dõi "watch mode" trong Vitest hoạt động ra sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  Watch mode giữ tiến trình kiểm thử luôn chạy ngầm dưới nền. Nó theo dõi các thay đổi trên tệp tin của bạn và tự động chạy lại duy nhất các file test liên quan đến tệp tin bạn vừa chỉnh sửa ngay khi bạn nhấn Lưu, giúp phản hồi kết quả kiểm thử ngay lập tức.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Viết Unit Test cho Giỏ hàng
1. Tạo một tệp tên là `cartUtils.js` trong thư mục `src/utils/`.
2. Định nghĩa và export hai hàm xử lý:
   - `calculateItemTotal(price, qty)`: tính tổng giá tiền.
   - `formatCurrency(amount)`: định dạng số tiền thành chuỗi hiển thị ví dụ `"$100.00"`.
3. Tạo tệp kiểm thử `cartUtils.test.js`.
4. Viết các ca kiểm thử xác thực rằng:
   - Hàm `calculateItemTotal` tính toán đúng giá trị, tự động gán số lượng `qty` bằng `1` nếu không truyền, và xử lý chính xác khi truyền số âm.
   - Hàm `formatCurrency` hiển thị đúng ký hiệu đô la và phần thập phân của tiền tệ.
5. Chạy lệnh `npm run test` để kiểm tra kết quả hiển thị trên terminal.
