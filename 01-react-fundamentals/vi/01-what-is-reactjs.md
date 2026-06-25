# ReactJS là gì? ⚛️

ReactJS (thường gọi tắt là React) là một thư viện JavaScript mã nguồn mở được phát triển bởi Meta (trước đây là Facebook) vào năm 2013. Nó được thiết kế chuyên biệt để xây dựng **Giao diện người dùng (UI - User Interface)** cho các ứng dụng web, đặc biệt là các ứng dụng đơn trang (SPA - Single-Page Applications).

Để hiểu ReactJS một cách dễ dàng nhất, hãy hình dung nó qua 4 khái niệm cốt lõi sau:

---

## 🧩 1. Kiến trúc dựa trên Component (Tư duy như lắp ráp Lego)
Thay vì viết một tệp HTML khổng lồ duy nhất với hàng ngàn dòng code, React chia giao diện người dùng thành các phần nhỏ độc lập và có thể tái sử dụng, gọi là **Component** (Thành phần).
- Mỗi component tự quản lý cấu trúc (HTML), phong cách (CSS) và logic (JavaScript) của riêng nó.
- **Ví dụ thực tế**: Trong một trang web thương mại điện tử, bạn có thể có các component như `Header`, `ProductCard`, `Sidebar`, và `Footer`. Bạn chỉ cần viết code cho `ProductCard` một lần, sau đó tái sử dụng nó hàng trăm lần với dữ liệu sản phẩm khác nhau.

---

## 📣 2. Declarative UI (Giao diện Khai báo)
React giúp việc xây dựng các giao diện người dùng tương tác trở nên dễ dàng hơn bằng cách áp dụng cách tiếp cận "Khai báo" (Declarative) thay vì "Mệnh lệnh" (Imperative).
- **Cách cũ (Imperative - Vanilla JS)**: Bạn phải hướng dẫn trình duyệt từng bước một: *"Tìm thẻ div có id là 'app', tạo một phần tử đoạn văn mới, đặt nội dung văn bản cho nó và chèn nó vào thẻ div đó"*.
- **Cách của React (Declarative)**: Bạn chỉ cần khai báo: *"Tôi muốn giao diện trông như thế này dựa trên dữ liệu hiện tại (State)"*. Khi dữ liệu thay đổi (ví dụ: người dùng đăng nhập), React sẽ tự động cập nhật và hiển thị đúng giao diện mà bạn không cần phải thao tác trực tiếp với các phần tử trên trang một cách thủ công.

---

## ⚡ 3. Virtual DOM (Tốc độ vượt trội)
Việc thao tác trực tiếp trên giao diện thực tế của trình duyệt (Real DOM) là rất chậm và tốn tài nguyên. React giải quyết vấn đề này bằng cách sử dụng **Virtual DOM** (DOM ảo):
1. Khi dữ liệu thay đổi, trước tiên React tạo một bản sao nhẹ của DOM trong bộ nhớ (Virtual DOM) và áp dụng các thay đổi ở đó.
2. React so sánh Virtual DOM mới này với phiên bản trước đó (quá trình này gọi là **Diffing**).
3. React tính toán cách hiệu quả nhất để cập nhật trình duyệt và **chỉ cập nhật những phần tử thực sự thay đổi** (quá trình này gọi là **Reconciliation**), thay vì tải lại toàn bộ trang.

---

## 🚀 4. JSX (Sự kết hợp giữa HTML và JavaScript)
React sử dụng một cú pháp mở rộng gọi là **JSX** (JavaScript XML). Nó cho phép bạn viết các thẻ giống như HTML trực tiếp bên trong các tệp JavaScript của mình.
```jsx
const Welcome = () => {
  const user = "Monster";
  return (
    <div className="card">
      <h1>Welcome {user} to React 19!</h1>
      <p>Wishing you an amazing learning journey.</p>
    </div>
  );
};
```
*JSX giúp mã giao diện của bạn mang tính trực quan cao, dễ đọc và cho phép bạn tận dụng toàn bộ sức mạnh logic của JavaScript.*

---

## 🌟 Tại sao React lại phổ biến như vậy?
* **Cộng đồng khổng lồ**: Được sử dụng bởi hàng triệu lập trình viên trên toàn thế giới, cung cấp nguồn tài nguyên, thư viện và công cụ phong phú.
* **Nhu cầu tuyển dụng cao**: Các công ty lớn nhỏ luôn tích cực tìm kiếm các lập trình viên biết sử dụng React.
* **Học một lần, viết mọi nơi**: Bạn có thể sử dụng kiến thức React của mình để xây dựng ứng dụng di động (iOS & Android) với **React Native**, hoặc xây dựng ứng dụng Web Full-stack với **Next.js**.
* **React 19**: Phiên bản mới nhất giới thiệu các tính năng đột phá như **React Server Components (RSC)**, **Actions** để xử lý biểu mẫu bất đồng bộ và **React Compiler** để tự động tối ưu hóa hiệu năng mà không cần tối ưu thủ công qua các hook (`useMemo` hay `useCallback`).

---
Hy vọng tài liệu này giúp bạn có một mô hình tư duy rõ ràng về ReactJS trước khi chúng ta bắt đầu viết những dòng code đầu tiên!

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về ReactJS. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. ReactJS là một framework hay một thư viện? Hãy giải thích sự khác biệt chính.
<details>
  <summary><b>Reveal Answer</b></summary>

  ReactJS là một **thư viện** (library), không phải là một framework.
  - **Framework** (như Angular hay Vue) quyết định cấu trúc ứng dụng của bạn và gọi mã nguồn của bạn khi cần (Inversion of Control - Đảo ngược điều khiển).
  - **Thư viện** (như React) trao quyền kiểm soát cho bạn. Bạn import React ở những nơi cần để xây dựng giao diện và bạn hoàn toàn tự do lựa chọn các thư viện khác cho việc định tuyến (routing), quản lý trạng thái (state management) và định dạng kiểu dáng (styling).
</details>

### 2. Virtual DOM là gì? Giải thích 3 bước React thực hiện khi dữ liệu thay đổi.
<details>
  <summary><b>Reveal Answer</b></summary>

  Virtual DOM là một bản sao gọn nhẹ trong bộ nhớ của Real DOM. Khi state thay đổi, React sẽ:
  1. **Render** ra một cây Virtual DOM mới đại diện cho giao diện đã được cập nhật.
  2. **So sánh** (Diffing) Virtual DOM mới này với phiên bản trước đó để tìm ra các điểm khác biệt cụ thể.
  3. **Cập nhật** (Reconciliation) chỉ những phần thay đổi vào Real DOM của trình duyệt, thay vì phải render lại toàn bộ trang.
</details>

### 3. Sự khác biệt giữa Imperative UI (Giao diện Mệnh lệnh) và Declarative UI (Giao diện Khai báo) là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Imperative UI** (Ví dụ: Vanilla JS): Bạn viết các hướng dẫn từng bước yêu cầu trình duyệt *làm thế nào* để cập nhật giao diện (ví dụ: tìm phần tử, thêm class, thay đổi nội dung văn bản).
  - **Declarative UI** (Ví dụ: React): Bạn mô tả giao diện *sẽ trông như thế nào* dựa trên trạng thái (state) hiện tại. Khi state thay đổi, React tự động xử lý các bước cập nhật DOM cho bạn.
</details>

### 4. "Kiến trúc dựa trên Component" có nghĩa là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có nghĩa là chia nhỏ giao diện người dùng thành các mảnh độc lập, tự quản lý và có thể tái sử dụng gọi là **component** (như các khối Lego). Mỗi component tự quản lý cấu trúc, kiểu dáng và logic của riêng nó, giúp các ứng dụng lớn dễ xây dựng, kiểm thử và bảo trì hơn.
</details>

### 5. JSX là gì? JSX có phải là JavaScript hợp lệ mà trình duyệt có thể đọc trực tiếp được không?
<details>
  <summary><b>Reveal Answer</b></summary>

  **JSX** (JavaScript XML) là một cú pháp mở rộng của JavaScript cho phép bạn viết các thẻ giống như HTML trực tiếp bên trong JavaScript. Nó **không phải** là mã JavaScript hợp lệ mà trình duyệt có thể hiểu được trực tiếp; nó cần phải được biên dịch thành JavaScript tiêu chuẩn (sử dụng các công cụ như Babel hoặc React Compiler mới) trước khi trình duyệt có thể thực thi.
</details>
