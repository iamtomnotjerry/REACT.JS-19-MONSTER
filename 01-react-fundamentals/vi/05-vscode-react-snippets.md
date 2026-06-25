# Làm chủ ES7+ React Snippets trong VS Code như Pro 🚀

Extension **ES7+ React/Redux/React-Native snippets** là một trong những công cụ mạnh mẽ nhất trong bộ công cụ của một nhà phát triển React. Nó tiết kiệm hàng ngàn lượt gõ phím bằng cách tạo nhanh mã boilerplate (mã mẫu) ngay lập tức bằng các từ viết tắt đơn giản.

Tuy nhiên, một lập trình viên chuyên nghiệp không chỉ ghi nhớ các phím tắt một cách máy móc; họ sử dụng chúng một cách có chọn lọc để viết mã sạch, hiện đại và không có lỗi.

---

## ⚡ Bảng tra cứu các phím tắt thiết yếu cho React 19 hiện đại

Trong số hàng trăm phím tắt có sẵn, đây là những phím tắt chính bạn sẽ sử dụng hàng ngày:

| Từ viết tắt | Mã nguồn được tạo ra | Trường hợp sử dụng |
| :--- | :--- | :--- |
| **`rafce`** | React Arrow Functional Component with default Export | Tạo một component viết theo kiểu arrow function hiện đại (Default Export) |
| **`rafc`** | React Arrow Functional Component with Named Export | Tạo một component viết theo kiểu arrow function hiện đại (Named Export) |
| **`rfce`** | React Functional Component with default Export | Tạo một component viết theo kiểu function truyền thống (Default Export) |
| **`imrse`** | `import React, { useState, useEffect } from 'react'` | Import nhanh thư viện React và các hook phổ biến |
| **`nfn`** | `const name = (params) => { ... }` | Tạo nhanh một arrow function chuẩn |
| **`clg`** | `console.log(object)` | Ghi log nhanh để phục vụ quá trình debug |

> [!NOTE]
> **Tự động gợi ý React Hooks:** Đối với các hook tiêu chuẩn như `useState` hoặc `useEffect`, extension không sử dụng các từ viết tắt ngắn. Bạn chỉ cần nhập tên đầy đủ (`useState` hoặc `useEffect`) và nhấn **Tab** hoặc **Enter** khi hộp thoại tự động gợi ý xuất hiện để mở rộng mã.

---

## 💡 Các thực tiễn tốt nhất hiện đại (Cách tiếp cận chuyên nghiệp)

### 1. Ưu tiên sử dụng `rafce` thay vì `rfce` (Tính nhất quán về giao diện)
Trong các dự án React hiện đại, **arrow functions (`rafce`)** được ưu ái hơn khi định nghĩa component:
- Chúng đem lại phong cách viết code nhất quán, tương đồng với các trình xử lý sự kiện (event handlers) và các hàm bổ trợ khác.
- Chúng hỗ trợ cú pháp rút gọn trả về trực tiếp (implicit returns) cho các phần tử UI nhỏ gọn.
- Ví dụ về mã nguồn được tạo ra bởi lệnh `rafce`:
```jsx
import React from 'react' // Lưu ý: Dòng import này thực chất là không bắt buộc trong React 19!

const Header = () => {
  return (
    <div>Header</div>
  )
}

export default Header
```

### 2. Loại bỏ các dòng import React không cần thiết
Trong React hiện đại (từ React 17+ và React 19 trở đi), bạn **không cần** phải viết `import React from 'react'` ở đầu mỗi tệp tin, trừ khi bạn đang sử dụng các API cụ thể trực tiếp từ đối tượng React (như `React.Fragment`, `React.lazy`, hoặc các ref kiểu cũ).
- > [!TIP]
  > Sau khi tạo nhanh một component bằng `rafce`, bạn có thể xóa dòng `import React from 'react'` một cách an toàn để giữ cho tệp mã sạch sẽ hơn.
- Trong phần cài đặt của extension, bạn có thể tích chọn **"Disable React Import"** để các phím tắt như `rafce` không tự động chèn dòng `import React` nữa!

### 3. Tìm hiểu các phím tắt TypeScript (Cho các chương tiếp theo)
Khi chúng ta chuyển sang các phần sử dụng TypeScript trong lộ trình học tập, bạn có thể thêm tiền tố `ts` trước các phím tắt:
- **`tsrafce`**: Tạo một component dạng arrow function sử dụng TypeScript đi kèm với định nghĩa kiểu Props.

---

## 🧠 Kiểm tra kiến thức

Kiểm tra mức độ hiểu bài của bạn về snippets. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Sự khác biệt giữa `rafce` và `rafc` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`rafce`** bao gồm dòng `export default ComponentName` ở cuối tệp tin (Default Export).
  - **`rafc`** sử dụng cách export trực tiếp trên dòng khai báo: `export const ComponentName = () => { ... }` (Named Export).
  - Các lập trình viên có kinh nghiệm thường ưu tiên sử dụng **Named Exports (`rafc`)** trong các dự án lớn để tránh lỗi sai lệch tên khi import component ở các nơi khác.
</details>

### 2. Bạn có cần giữ dòng `import React from 'react'` khi tạo component bằng phím tắt không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Trong React hiện đại (React 17, 18 và 19), cơ chế JSX transform tự động xử lý việc render dưới nền. Bạn chỉ cần import các hook cụ thể khi dùng (ví dụ: `import { useState } from 'react'`), chứ không cần import toàn bộ đối tượng `React`.
</details>

### 3. Làm cách nào để kích hoạt các snippet này trong VS Code?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đơn giản chỉ cần gõ từ viết tắt (ví dụ: `rafce`) bên trong một tệp JSX/JS và nhấn **Tab** hoặc **Enter** khi menu gợi ý tự động xuất hiện trên màn hình.
</details>

---

## 💻 Bài tập thực hành

Áp dụng các phím tắt này bên trong dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Tạo Component nhanh
1. Bên trong thư mục `src/components/`, tạo một tệp tin mới tên là `Navbar.jsx`.
2. Mở tệp tin này, gõ `rafc` (Named Export) và nhấn **Enter** / **Tab**.
3. Hãy chú ý cách nó tạo ra một component sử dụng arrow function đi kèm với từ khóa export trực tiếp.
4. Xóa dòng import React không cần thiết ở trên cùng.

### 🛠️ Bài tập 2: Ghi log nhanh
1. Mở tệp tin [`Navbar.jsx`](file:///d:/REACT.JS-19-MONSTER/first-react-app/src/components/Navbar.jsx) bạn vừa tạo.
2. Bên trong phần thân của component `Navbar`, gõ **`clg`** rồi nhấn **Enter** hoặc **Tab**.
3. Nó sẽ ngay lập tức mở rộng thành `console.log()`. Hãy viết một tin nhắn như `'Navbar rendered'` bên trong dấu ngoặc đơn.
4. Render `<Navbar />` bên trong `App.jsx` và mở Công cụ dành cho nhà phát triển (F12) trên trình duyệt để kiểm tra kết quả ghi log!
