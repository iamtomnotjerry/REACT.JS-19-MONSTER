# Hướng dẫn Cài đặt và Thiết lập ReactJS 🚀

Tài liệu này sẽ hướng dẫn bạn thiết lập một dự án ReactJS từ đầu. Trong phát triển web hiện đại, công cụ cổ điển `create-react-app` đã chính thức bị khai tử (deprecated). Thay vào đó, chúng ta sử dụng các công cụ build nhanh hơn và được tối ưu hơn như **Vite** hoặc các framework hoàn chỉnh phục vụ production như **Next.js**.

---

## 🛠️ Bước 1: Cài đặt Node.js & npm

Trước khi thiết lập React, bạn phải cài đặt **Node.js**. Node.js sẽ tự động đi kèm với **npm** (Node Package Manager - Trình quản lý gói của Node) để quản lý các gói phần mềm trong dự án của bạn.

1. Truy cập trang web chính thức: [nodejs.org](https://nodejs.org/).
2. Tải về và cài đặt phiên bản **LTS (Long Term Support)** để đảm bảo tính ổn định.
3. Mở terminal (Command Prompt, PowerShell hoặc Git Bash) và xác minh việc cài đặt thành công:
   ```bash
   node -v
   npm -v
   ```

---

## ⚡ Cách 1: Sử dụng Vite (Rất khuyến nghị khi Học tập & làm ứng dụng SPA)

Vite là một công cụ frontend thế hệ mới cực kỳ nhanh, nhẹ và đã được cấu hình sẵn cho React.

### 1. Khởi tạo Dự án

Bạn có thể thiết lập dự án Vite bằng cách sử dụng trình hướng dẫn tương tác từng bước hoặc chạy một dòng lệnh nhanh duy nhất:

#### 🔹 Lựa chọn A: Trình hướng dẫn Tương tác (Từng bước)
Chạy lệnh sau để bắt đầu trình hướng dẫn:
```bash
npm create vite@latest
```
Bạn sẽ được hỏi các bước tương tác sau trong terminal:

1. **Project name:**
   - Nhập tên thư mục mong muốn của bạn (ví dụ: `first-react-app`) và nhấn **Enter**.
2. **Need to install the following packages: create-vite... Ok to proceed? (y)**
   - Nhấn **`y`** (hoặc chỉ cần nhấn **Enter**) để tải xuống công cụ khởi tạo.
3. **Select a framework:**
   - Sử dụng các phím mũi tên (↓/↑) để chọn **`React`** và nhấn **Enter**.
4. **Select a variant:**
   - Di chuyển và chọn **`JavaScript`** hoặc **`TypeScript`** rồi nhấn **Enter**.
5. **Use ESLint instead of Oxlint?**
   - Chọn **`Yes (ESLint)`** (Khuyến nghị để có các plugin tiêu chuẩn và khả năng tương thích hệ sinh thái tối đa) hoặc **`No (Oxlint)`** (để lint cực nhanh).
6. **Install with npm and start now?**
   - Chọn **`Yes`** (Khuyến nghị) để cho phép Vite tự động tải xuống tất cả các gói ngay lập tức.

---

#### 🔹 Lựa chọn B: Thiết lập nhanh (Bỏ qua các câu hỏi)
Nếu bạn muốn bỏ qua tất cả câu hỏi và tạo một dự án React được cấu hình sẵn ngay lập tức, hãy chạy:
```bash
# For JavaScript template
npm create vite@latest first-react-app -- --template react

# For TypeScript template
npm create vite@latest first-react-app -- --template react-ts
```

---

### 2. Di chuyển vào thư mục và Chạy Ứng dụng

Chạy các lệnh sau để vào thư mục dự án và khởi động development server:

```bash
# 1. Enter the project folder
cd first-react-app

# 2. Install dependencies (ONLY if you selected 'No' to automatic installation in Step 6 of Option A)
npm install

# 3. Start the local development server
npm run dev
```

> [!TIP]
> Ngay khi development server khởi chạy, nó sẽ hiển thị một URL cục bộ (thường là `http://localhost:5173`). Hãy sao chép và dán URL này vào trình duyệt web của bạn để xem ứng dụng React hoạt động trực tiếp!

---

## 🌐 Cách 2: Sử dụng Next.js (Khuyến nghị cho Ứng dụng Full-Stack & Production)

Next.js là framework React chính thức để xây dựng các ứng dụng full-stack chạy trên môi trường production. Nó cung cấp Server-Side Rendering (SSR), các API routes và xử lý hình ảnh được tối ưu.

### 1. Chạy Trình hướng dẫn Thiết lập
Di chuyển đến thư mục làm việc của bạn và chạy:
```bash
npx create-next-app@latest my-next-app
```

### 2. Lựa chọn Cấu hình Ưu tiên
Chọn các tùy chọn sau trong quá trình cấu hình:
- *Would you like to use TypeScript?* **Yes** (Khuyến nghị)
- *Would you like to use ESLint?* **Yes**
- *Would you like to use Tailwind CSS?* **Yes**
- *Would you like to use `src/` directory?* **Yes**
- *Would you like to use App Router?* **Yes** (Rất khuyến nghị để dùng các tính năng hiện đại)
- *Would you like to customize the default import alias (@/*)?* **No**

### 3. Chạy Ứng dụng
```bash
cd my-next-app
npm run dev
```
Mở trình duyệt của bạn và truy cập `http://localhost:3000`.

---

## 🎨 Cách 3: Nhúng CDN trực tiếp (Tạo nhanh không cần cài đặt)

Nếu bạn muốn viết mã React ngay lập tức trong một tệp HTML duy nhất mà không cần cài đặt bất kỳ gói nào, bạn có thể tải React thông qua các mạng phân phối nội dung (CDN):

1. Tạo một tệp có tên là `index.html`.
2. Thêm đoạn mã mẫu sau:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>React 19 CDN Demo</title>
  <!-- React & React-DOM UMD core libraries -->
  <script src="https://unpkg.com/react@19/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js" crossorigin></script>
  <!-- Babel Standalone compiler to translate JSX on the fly -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    function App() {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
          <h1>Hello from React 19 CDN! ⚛️</h1>
          <p>This page runs React directly inside the browser with zero build setup.</p>
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

## 📌 Bảng so sánh nhanh các phương pháp thiết lập

| Trường hợp sử dụng | Lựa chọn Thiết lập | Lệnh Khởi tạo |
| :--- | :--- | :--- |
| **Học các khái niệm cốt lõi & xây dựng UI** | **React + Vite** | `npm create vite@latest` |
| **Ứng dụng production, trang nặng về SEO, hoặc APIs** | **Next.js Framework** | `npx create-next-app` |
| **Thử nghiệm nhanh trên một tệp duy nhất** | **CDN scripts** | *Tệp HTML thông thường* |

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về cài đặt React. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao `create-react-app` không còn được khuyến nghị để bắt đầu các dự án React mới?
<details>
  <summary><b>Reveal Answer</b></summary>

  `create-react-app` (CRA) đã lỗi thời vì:
  - Nó không còn được duy trì bởi đội ngũ cốt lõi của React.
  - Nó được xây dựng dựa trên Webpack, chậm hơn đáng kể so với các bundler hiện đại như Vite (esbuild/rollup) hay Next.js (turbopack).
  - Nó không hỗ trợ các tính năng hiện đại như React Server Components (RSC).
</details>

### 2. Sự khác biệt giữa việc thiết lập React bằng Vite và bằng Next.js là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Vite** là một công cụ build phía client. Nó cung cấp một tệp HTML trống và để trình duyệt chạy JavaScript để render trang (Client-Side Rendering - CSR). Nó phù hợp nhất cho các dashboard, học tập và các ứng dụng đơn trang đơn giản.
  - **Next.js** là một framework full-stack. Nó render các trang trên server trước khi gửi chúng về trình duyệt (Server-Side Rendering - SSR). Nó phù hợp nhất cho production, các trang nhạy cảm về SEO và các dự án full-stack.
</details>

### 3. Mục đích của `npm install` là gì? Nó tải các gói về đâu?
<details>
  <summary><b>Reveal Answer</b></summary>

  `npm install` đọc tệp `package.json` trong dự án của bạn, tra cứu tất cả các dependency và công cụ phát triển được liệt kê, sau đó tải chúng xuống. Tất cả các gói tải về được lưu trữ bên trong thư mục cục bộ `node_modules/` ở thư mục gốc.
</details>

### 4. Lệnh nào dùng để khởi động development server cục bộ cho một dự án React chạy bằng Vite?
<details>
  <summary><b>Reveal Answer</b></summary>

  `npm run dev`
</details>

### 5. Trong quá trình cài đặt Vite tương tác, sự khác biệt giữa ESLint và Oxlint là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **ESLint** là trình linter tiêu chuẩn trong ngành. Nó rất hoàn thiện, hỗ trợ hàng trăm plugin tùy chỉnh (cho React, hooks, v.v.) và được sử dụng rộng rãi trong hầu hết các codebase.
  - **Oxlint** là một linter mới được viết bằng Rust. Nó cực kỳ nhanh (nhanh hơn 50-100 lần so với ESLint) nhưng chưa hỗ trợ hệ sinh thái plugin phong phú hoặc các quy tắc tùy chỉnh phức tạp như ESLint.
</details>

### 6. Trong quá trình thiết lập Vite tương tác, nếu bạn chọn "Yes" cho "Install with npm and start now", bạn có thể bỏ qua bước nào sau đó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể bỏ qua việc chạy lệnh **`npm install`** bằng tay trong terminal, vì trình cài đặt của Vite sẽ tự động chạy nó và tải xuống các dependency của bạn trước khi kết thúc.
</details>
