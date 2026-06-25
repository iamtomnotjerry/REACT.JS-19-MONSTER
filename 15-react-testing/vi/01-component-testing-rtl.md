# Kiểm thử Component với React Testing Library (RTL) 🔍

Trong khi kiểm thử đơn vị (unit test) rất hữu ích cho các hàm tiện ích, **Kiểm thử Component (Component Testing)** giúp xác thực giao diện người dùng hiển thị chính xác cấu trúc và phản hồi đúng đắn với các tương tác của người dùng. Trong React, **React Testing Library (RTL)** là thư viện tiêu chuẩn của ngành để kiểm thử component.

---

## ⚡ 1. Triết lý của React Testing Library

Triết lý cốt lõi của RTL là: **"Mã kiểm thử của bạn càng giống với cách phần mềm được sử dụng thực tế bao nhiêu, nó càng mang lại sự tin cậy bấy nhiêu."**
* Bạn nên viết mã kiểm thử component dưới **góc nhìn của người dùng** (ví dụ: bấm nút, gõ chữ vào form, kiểm tra chữ hiển thị trên màn hình).
* Bạn nên **tránh** kiểm thử các chi tiết triển khai bên trong (ví dụ như tự truy cập và kiểm tra biến state nội bộ hay các hàm xử lý phụ của component).

---

## ⚡ 2. Cài đặt & Thiết lập

Để sử dụng RTL kết hợp với Vitest trong dự án React, cài đặt các thư viện kiểm thử và môi trường DOM ảo của trình duyệt (**`jsdom`**):

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Cấu hình cho Vitest chạy trong môi trường `jsdom` bên trong tệp `vite.config.js` hoặc `vitest.config.js` của bạn:
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // 1. Chạy các tệp test trong môi trường DOM ảo của trình duyệt
    setupFiles: './src/setupTests.js', // Tệp cài đặt tùy chọn (nếu có)
  },
});
```

---

## 🧩 3. Viết ca kiểm thử Component đầu tiên

Hãy cùng kiểm thử một component bộ đếm tương tác đơn giản:

### Component nguồn (`src/components/SimpleCounter.jsx`)
```jsx
import { useState } from 'react';

export const SimpleCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### Tệp kiểm thử tương ứng (`src/components/SimpleCounter.test.jsx`)
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleCounter } from './SimpleCounter';
import '@testing-library/jest-dom'; // Bổ sung các matcher như 'toBeInTheDocument'

describe('Kiểm thử Component SimpleCounter', () => {

  it('nên hiển thị giá trị đếm ban đầu là 0', () => {
    // 1. Nạp component vào DOM ảo
    render(<SimpleCounter />);
    
    // 2. Tìm kiếm phần tử theo đoạn văn bản
    const textElement = screen.getByText(/current count: 0/i);
    expect(textElement).toBeInTheDocument();
  });

  it('nên tăng giá trị đếm khi nhấn nút', async () => {
    render(<SimpleCounter />);
    
    // 1. Khởi tạo đối tượng giả lập tương tác người dùng
    const user = userEvent.setup();
    
    // 2. Tìm kiếm phần tử nút bấm
    const button = screen.getByRole('button', { name: /increment/i });
    
    // 3. Giả lập hành động click nút
    await user.click(button);
    
    // 4. Xác thực văn bản đã được cập nhật
    const textElement = screen.getByText(/current count: 1/i);
    expect(textElement).toBeInTheDocument();
  });
});
```

---

## 🚀 4. Hướng dẫn sử dụng các hàm truy vấn Screen: `get`, `query` và `find`

Khi tìm kiếm các phần tử hiển thị trên màn hình ảo, bạn chọn các hàm truy vấn dựa trên các kịch bản mong đợi:

| Tiền tố truy vấn | Trả về phần tử | Ném ra lỗi nếu thiếu? | Bất đồng bộ (Trả về Promise)? | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **`getBy...`** | Có | **Có** | Không | Các kiểm tra tiêu chuẩn cho các phần tử bắt buộc phải có trên màn hình. |
| **`queryBy...`** | Có hoặc `null` | **Không** | Không | Dùng để xác thực một phần tử **không** hiển thị trên màn hình. |
| **`findBy...`** | Có | **Có** | **Có** | Chờ đợi các phần tử xuất hiện chậm sau khi gọi API bất đồng bộ. |

```javascript
// Xác thực phần tử báo lỗi KHÔNG hiển thị trên màn hình
expect(screen.queryByText(/error/i)).toBeNull();

// Chờ đợi văn bản tải thành công hiển thị lên màn hình
const successMessage = await screen.findByText(/load successful/i);
expect(successMessage).toBeInTheDocument();
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao thư viện RTL khuyến nghị sử dụng hàm `getByRole` hơn là các hàm như `getByText`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `getByRole` tìm kiếm các phần tử dựa trên **cây tiếp cận (accessibility trees)** của trình duyệt (ví dụ: `role="button"`, `role="heading"`), mô phỏng chính xác cách các trình đọc màn hình cho người khiếm thị nhận biết trang web. Điều này giúp đảm bảo mã HTML của bạn được tối ưu cho khả năng tiếp cận (accessibility), đồng thời tránh lỗi test bị hỏng khi bạn chỉ thay đổi nhãn văn bản hiển thị.
</details>

### 2. Sự khác biệt giữa thư viện `@testing-library/user-event` và hàm `fireEvent` tiêu chuẩn là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `fireEvent` kích hoạt các sự kiện trình duyệt một cách trực tiếp và cơ học (ví dụ gọi trực tiếp sự kiện click).
  - `userEvent` giả lập **toàn bộ quy trình hành động của người dùng**. Ví dụ, khi gọi `userEvent.type()`, nó sẽ tự động kích hoạt các sự kiện focus, gõ phím, thay đổi dữ liệu đầu vào và mất focus (blur) tuần tự. Điều này giúp kiểm thử các tác vụ phụ chính xác và thật hơn.
</details>

### 3. Tại sao chúng ta bắt buộc phải sử dụng `await` khi giả lập click chuột bằng `userEvent`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì các hành động click, hover hay gõ chữ của `userEvent` được thực thi bất đồng bộ để mô phỏng các khoảng thời gian trễ thực tế của trình duyệt. Các API của nó trả về Promise, nên bạn bắt buộc phải viết `await` để đảm bảo hành động tương tác chạy xong hoàn toàn trước khi kiểm tra sự thay đổi của state.
</details>

### 4. Làm cách nào để xác thực một phần tử đã bị biến mất khỏi màn hình sau khi bấm nút?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn sử dụng hàm truy vấn có tiền tố `queryBy...`:
  ```javascript
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  ```
  Nếu bạn dùng hàm `getByText()`, trình chạy test sẽ lập tức quăng lỗi crash tệp test ngay tại dòng tìm kiếm nếu phần tử đó không có mặt, khiến test case bị thất bại.
</details>

### 5. Vai trò của thư viện `jsdom` trong cấu hình Vitest là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các component React yêu cầu một môi trường trình duyệt web (đối tượng window, document, DOM nodes) để có thể nạp (mount) và render giao diện. Thư viện `jsdom` là bộ mô phỏng trình duyệt viết bằng JavaScript chạy trực tiếp trên môi trường Node.js, cho phép render giao diện và tương tác sự kiện click mà không cần mở một ứng dụng trình duyệt thật.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Viết test case cho Component Form Tìm kiếm
1. Tạo một component `SearchForm.tsx` (sử dụng đuôi `.tsx`).
2. Component chứa một ô nhập văn bản (input), một nút bấm submit, và một dòng chữ hiển thị kết quả: `"Từ khóa tìm kiếm: [Nội dung nhập]"`.
3. Tạo tệp kiểm thử `SearchForm.test.tsx`.
4. Viết các ca kiểm thử xác thực:
   - Ô nhập tìm kiếm rỗng khi vừa mount component.
   - Gõ chữ vào ô nhập sẽ cập nhật đúng giá trị của ô nhập đó.
   - Nhấp chuột vào nút submit sẽ hiển thị chính xác từ khóa vừa gõ lên dòng văn bản báo kết quả.
5. Chạy trình test để xác nhận tất cả các ca kiểm thử vượt qua thành công.
