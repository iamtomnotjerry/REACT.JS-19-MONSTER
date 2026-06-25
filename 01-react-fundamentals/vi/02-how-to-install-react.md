# Hướng dẫn Cài đặt và Thiết lập ReactJS 🚀

Tài liệu này sẽ hướng dẫn bạn thiết lập một dự án ReactJS từ đầu. Trong phát triển web hiện đại, công cụ cổ điển `create-react-app` đã chính thức bị khai tử (deprecated). Thay vào đó, chúng ta sử dụng các công cụ xây dựng (build tools) nhanh hơn và tối ưu hơn như **Vite** hoặc các framework hoàn chỉnh phục vụ sản xuất như **Next.js**.

---

## 🛠️ Bước 1: Cài đặt Node.js & npm

Trước khi thiết lập React, bạn phải cài đặt **Node.js**. Node.js sẽ tự động đi kèm với **npm** (Node Package Manager - Trình quản lý gói của Node) để quản lý các gói phần mềm trong dự án của bạn.

1. Truy cập trang web chính thức: [nodejs.org](https://nodejs.org/).
2. Tải về và cài đặt phiên bản **LTS (Long Term Support)** để đảm bảo tính ổn định.
3. Mở terminal (Command Prompt, PowerShell hoặc Git Bash) và xác minh việc cài đặt thành công bằng lệnh:
   ```bash
   node -v
   npm -v
   ```

---

## ⚡ Cách 1: Sử dụng Vite (Khuyên dùng khi Học tập & làm ứng dụng SPA)

Vite là một công cụ phát triển frontend thế hệ mới cực kỳ nhanh, nhẹ và đã được cấu hình sẵn cho React.

### 1. Khởi tạo Dự án

Bạn có thể thiết lập dự án Vite bằng cách sử dụng trình hướng dẫn tương tác từng bước hoặc chạy một dòng lệnh nhanh duy nhất:

#### 🔹 Lựa chọn A: Trình hướng dẫn Tương tác (Từng bước)
Chạy lệnh sau để bắt đầu trình hướng dẫn tương tác:
```bash
npm create vite@latest
```
Bạn sẽ nhận được các câu hỏi tương tác sau trong terminal:

1. **Project name:** (Tên dự án)
   - Nhập tên thư mục mong muốn của bạn (ví dụ: `first-react-app`) và nhấn **Enter**.
2. **Need to install the following packages: create-vite... Ok to proceed? (y)** (Cần cài đặt các gói sau... Đồng ý tiếp tục?)
   - Nhấn **`y`** (hoặc chỉ cần nhấn **Enter**) để tải xuống công cụ khởi tạo.
3. **Select a framework:** (Chọn một framework)
   - Sử dụng các phím mũi tên (↓/↑) để chọn **`React`** và nhấn **Enter**.
4. **Select a variant:** (Chọn một biến thể)
   - Di chuyển và chọn **`JavaScript`** hoặc **`TypeScript`** rồi nhấn **Enter**.
5. **Use ESLint instead of Oxlint?** (Sử dụng ESLint thay vì Oxlint?)
   - Chọn **`Yes (ESLint)`** (Khuyên dùng để có các plugin tiêu chuẩn và khả năng tương thích hệ sinh thái tốt nhất) hoặc **`No (Oxlint)`** (để lint code siêu nhanh).
6. **Install with npm and start now?** (Cài đặt bằng npm và khởi động ngay?)
   - Chọn **`Yes`** (Khuyên dùng) để cho phép Vite tự động tải xuống tất cả các gói cần thiết ngay lập tức.

---

#### 🔹 Lựa chọn B: Thiết lập nhanh (Bỏ qua các câu hỏi tương tác)
Nếu bạn muốn bỏ qua tất cả câu hỏi và tạo một dự án React được cấu hình sẵn ngay lập tức, hãy chạy:
```bash
# Đối với mẫu JavaScript
npm create vite@latest first-react-app -- --template react

# Đối với mẫu TypeScript
npm create vite@latest first-react-app -- --template react-ts
```

---

### 2. Di chuyển vào thư mục và Chạy Ứng dụng

Chạy các lệnh sau để vào thư mục dự án và khởi động máy chủ phát triển cục bộ:

```bash
# 1. Đi vào thư mục dự án
cd first-react-app

# 2. Cài đặt các thư viện phụ thuộc (CHỈ khi bạn đã chọn 'No' ở Bước 6 của Lựa chọn A)
npm install

# 3. Khởi động máy chủ phát triển cục bộ
npm run dev
```

> [!TIP]
> Ngay khi máy chủ phát triển khởi chạy, nó sẽ hiển thị một đường dẫn cục bộ (thường là `http://localhost:5173`). Hãy sao chép và dán URL này vào trình duyệt web của bạn để xem ứng dụng React hoạt động trực tiếp!

---

## 🌐 Cách 2: Sử dụng Next.js (Khuyên dùng cho Ứng dụng Thực tế & Full-Stack)

Next.js là framework chính thức của React để xây dựng các ứng dụng thực tế chạy trên môi trường production. Nó hỗ trợ Server-Side Rendering (SSR - Render phía máy chủ), các tuyến API (API routes) và tối ưu hóa hình ảnh.

### 1. Chạy Trình cài đặt
Di chuyển đến thư mục làm việc của bạn và chạy:
```bash
npx create-next-app@latest my-next-app
```

### 2. Lựa chọn Cấu hình Ưu tiên
Chọn các tùy chọn sau trong quá trình cấu hình:
- *Would you like to use TypeScript?* **Yes** (Khuyên dùng)
- *Would you like to use ESLint?* **Yes**
- *Would you like to use Tailwind CSS?* **Yes**
- *Would you like to use `src/` directory?* **Yes**
- *Would you like to use App Router?* **Yes** (Khuyên dùng để sử dụng các tính năng hiện đại)
- *Would you like to customize the default import alias (@/*)?* **No**

### 3. Chạy Ứng dụng
```bash
cd my-next-app
npm run dev
```
Mở trình duyệt của bạn và truy cập `http://localhost:3000`.

---

## 🎨 Cách 3: Nhúng CDN trực tiếp (Tạo nhanh không cần cài đặt)

Nếu bạn muốn viết mã React ngay lập tức trong một tệp HTML duy nhất mà không cần cài đặt bất kỳ gói phần mềm nào, bạn có thể tải React thông qua các mạng phân phối nội dung (CDN):

1. Tạo một tệp có tên là `index.html`.
2. Thêm đoạn mã mẫu sau:
```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>React 19 CDN Demo</title>
  <!-- Các thư viện cốt lõi của React & React-DOM bản UMD -->
  <script src="https://unpkg.com/react@19/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js" crossorigin></script>
  <!-- Trình biên dịch Babel Standalone để dịch JSX trực tiếp trên trình duyệt -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    function App() {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
          <h1>Hello từ React 19 CDN! ⚛️</h1>
          <p>Trang này chạy React trực tiếp trong trình duyệt mà không cần thiết lập build phức tạp.</p>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
```

---

## 📌 Bảng so sánh các phương pháp thiết lập

| Trường hợp sử dụng | Lựa chọn Thiết lập | Lệnh Khởi tạo |
| :--- | :--- | :--- |
| **Học các khái niệm cốt lõi & xây dựng giao diện (UI)** | **React + Vite** | `npm create vite@latest` |
| **Ứng dụng thực tế, trang web cần SEO, hoặc APIs** | **Next.js Framework** | `npx create-next-app` |
| **Thử nghiệm nhanh trên một tệp duy nhất** | **CDN scripts** | *Tệp HTML thông thường* |

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về cài đặt React. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao `create-react-app` không còn được khuyên dùng để bắt đầu các dự án React mới?
<details>
  <summary><b>Reveal Answer</b></summary>

  `create-react-app` (CRA) đã lỗi thời vì:
  - Nó không còn được duy trì bởi đội ngũ phát triển cốt lõi của React.
  - Nó được xây dựng dựa trên Webpack, chậm hơn đáng kể so với các công cụ đóng gói hiện đại như Vite (sử dụng esbuild/rollup) hay Next.js (sử dụng turbopack).
  - Nó không hỗ trợ các tính năng hiện đại như React Server Components (RSC).
</details>

### 2. Sự khác biệt giữa việc thiết lập React bằng Vite và Next.js là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Vite** là một công cụ build phía client. Nó cung cấp một tệp HTML trống và để trình duyệt chạy JavaScript để hiển thị trang (Client-Side Rendering - CSR). Nó phù hợp nhất cho các trang quản trị (dashboard), học tập và các ứng dụng đơn trang đơn giản.
  - **Next.js** là một framework full-stack. Nó render các trang trên máy chủ trước khi gửi chúng về trình duyệt (Server-Side Rendering - SSR). Nó phù hợp nhất cho môi trường thực tế (production), các trang cần SEO và dự án full-stack.
</details>

### 3. Mục đích của `npm install` là gì? Nó tải các gói phần mềm về đâu?
<details>
  <summary><b>Reveal Answer</b></summary>

  `npm install` đọc tệp `package.json` trong dự án của bạn, tìm kiếm tất cả các thư viện phụ thuộc và công cụ phát triển được liệt kê ở đó, sau đó tải chúng xuống. Tất cả các gói tải về sẽ được lưu trữ trong thư mục cục bộ `node_modules/` ở thư mục gốc của dự án.
</details>

### 4. Lệnh nào dùng để khởi động máy chủ phát triển cục bộ cho dự án React chạy bằng Vite?
<details>
  <summary><b>Reveal Answer</b></summary>

  `npm run dev`
</details>

### 5. Trong cài đặt Vite tương tác, sự khác biệt giữa ESLint và Oxlint là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **ESLint** là trình kiểm lỗi (linter) tiêu chuẩn trong ngành. Nó rất hoàn thiện, hỗ trợ hàng trăm plugin tùy chỉnh (cho React, hooks, v.v.) và được sử dụng rộng rãi trong hầu hết các dự án.
  - **Oxlint** là một công cụ kiểm lỗi mới được viết bằng Rust. Nó cực kỳ nhanh (nhanh hơn 50-100 lần so với ESLint) nhưng chưa hỗ trợ hệ sinh thái plugin phong phú hoặc các quy tắc tùy chỉnh phức tạp như ESLint.
</details>

### 6. Trong thiết lập Vite tương tác, nếu bạn chọn "Yes" cho câu hỏi "Install with npm and start now", bạn có thể bỏ qua bước nào sau đó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể bỏ qua việc chạy lệnh **`npm install`** bằng tay trong terminal, vì trình cài đặt của Vite sẽ tự động chạy lệnh này và tải xuống các gói phụ thuộc trước khi kết thúc.
</details>
