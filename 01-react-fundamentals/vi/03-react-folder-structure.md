# Tìm hiểu Cấu trúc Thư mục Dự án React 📂

Tài liệu này giải thích các tệp và thư mục được tạo ra trong dự án React chạy bằng Vite của bạn (`first-react-app`). Việc biết rõ vị trí của từng thành phần là chìa khóa để xây dựng ứng dụng một cách hiệu quả.

Hãy cùng phân tích cấu trúc này:

---

## 📁 Tổng quan về Thư mục Gốc

```text
first-react-app/
├── node_modules/       # Downloaded third-party packages (React, Vite, etc.)
├── public/             # Static files served directly (unprocessed by Vite)
│   ├── favicon.svg     # Website tab icon
│   └── icons.svg       # Vector icons
├── src/                # Your main source code (processed & bundled by Vite)
│   ├── assets/         # Static assets (images, vectors) compiled by Vite
│   ├── App.css         # Styles specific to the App component
│   ├── App.jsx         # Main App component (Root UI layout)
│   ├── index.css       # Global styles applied to the whole application
│   └── main.jsx        # Entry point of the React app (mounts React to DOM)
├── .gitignore          # Tells Git which files to ignore (e.g., node_modules)
├── eslint.config.js    # Linting configuration for catching code bugs/errors
├── index.html          # Main HTML page entry point
├── package-lock.json   # Locked version tree of dependencies
├── package.json        # Project metadata, scripts, and dependencies list
└── vite.config.js      # Configuration settings for Vite
```

---

## 🔍 Phân tích chi tiết

### 1. `index.html` (Phần khung vỏ)
Khác với các trang web truyền thống có nhiều trang HTML riêng lẻ, React sử dụng mô hình **Ứng dụng đơn trang (SPA - Single Page Application)**.
- `index.html` là tệp HTML duy nhất được gửi tới trình duyệt.
- Bên trong thẻ `<body>` của nó, bạn sẽ thấy:
  ```html
  <div id="root"></div>
  ```
- React gắn (mount) toàn bộ ứng dụng của bạn vào bên trong thẻ `div` duy nhất này.
- Nó cũng tham chiếu đến điểm đầu vào React của bạn: `<script type="module" src="/src/main.jsx"></script>`.

### 2. Thư mục `src/` (Mã nguồn)
Đây là nơi bạn sẽ dành 99% thời gian phát triển của mình.

* **`main.jsx`**
  Đây là tệp điểm đầu vào (entry point). Nó lấy phần tử `#root` từ `index.html` và gắn React vào đó:
  ```jsx
  import { createRoot } from 'react-dom/client'
  import App from './App.jsx'
  import './index.css'

  createRoot(document.getElementById('root')).render(
    <App />
  )
  ```
* **`App.jsx`**
  Component Gốc (Root Component). Đây là khung tranh chính cho ứng dụng React của bạn. Mọi component khác bạn tạo ra cuối cùng đều sẽ được render bên trong `App.jsx`.
* **`index.css`** & **`App.css`**
  - `index.css`: Được sử dụng cho các kiểu CSS toàn cục (như font chữ mặc định, màu nền body, các khung bao bố cục).
  - `App.css`: Các kiểu CSS có phạm vi áp dụng trực tiếp cho `App.jsx`.
* **`assets/`**
  Hình ảnh, font chữ hoặc các file SVG đặt ở đây sẽ được xử lý và tối ưu hóa bởi trình biên dịch build của Vite.

### 3. Thư mục `public/` (Tài nguyên tĩnh)
Các tệp ở đây được phân phối trực tiếp. Chúng **không** bị tối ưu hóa hay thay đổi bởi Vite.
- Sử dụng thư mục này cho các tệp cần giữ nguyên chính xác tên và đường dẫn của chúng, chẳng hạn như `robots.txt`, `favicon.ico`, hoặc các cấu hình tĩnh.
- Bạn có thể tham chiếu trực tiếp đến các tài nguyên public bằng cách viết `/favicon.svg` trong mã HTML/React của bạn.

### 4. Các tệp cấu hình
* **`package.json`**
  Tệp cấu hình cho các dự án Node.js. Nó liệt kê:
  - **`scripts`**: Các lệnh bạn chạy (ví dụ: `npm run dev` để khởi chạy Vite, `npm run build` để xuất mã sản phẩm production).
  - **`dependencies`**: Các tệp thư viện cần thiết cho production (`react`, `react-dom`).
  - **`devDependencies`**: Các thư viện chỉ cần thiết cho việc phát triển/kiểm thử (`vite`, `eslint`).
* **`vite.config.js`**
  Tùy chỉnh cách Vite build và chạy ứng dụng của bạn (ví dụ: cấu hình alias, plugin, hoặc thiết lập proxy).
* **`eslint.config.js`**
  Định nghĩa các quy tắc để giữ cho JavaScript của bạn sạch sẽ và không có các lỗi hiển nhiên (ví dụ: cảnh báo về các biến không dùng tới hoặc thiếu import).
* **`node_modules/`**
  Thư mục lớn nhất, chứa toàn bộ các gói được cài đặt bởi npm. **Không bao giờ được chỉnh sửa thư mục này bằng tay!** Nó được tự động tạo và cập nhật khi bạn chạy `npm install`.

---

## 💡 Thực tiễn tốt nhất: Tổ chức thư mục `src/` của bạn
Khi ứng dụng của bạn phát triển lớn hơn, cấu trúc phẳng mặc định bên trong `src/` sẽ trở nên lộn xộn. Một thực tiễn tiêu chuẩn trong ngành là sắp xếp thư mục `src/` như sau:

```text
src/
├── assets/         # Images, fonts, SVG icons
├── components/     # Reusable UI elements (Button, Card, Input)
├── hooks/          # Custom React Hooks
├── pages/          # Full page components (Home, Profile, Login)
├── styles/         # Global style sheets (variables, themes)
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về cấu trúc thư mục React. Nhấp vào **Reveal Answer** để xác nhận câu trả lời của bạn.

### 1. React chèn toàn bộ ứng dụng của bạn vào đâu trên trình duyệt? Hãy chỉ rõ tệp tin và phần tử HTML cụ thể.
<details>
  <summary><b>Reveal Answer</b></summary>

  React chèn toàn bộ ứng dụng của bạn vào tệp **`index.html`**, cụ thể là bên trong phần tử `<div id="root"></div>` nằm trong thẻ `<body>` của HTML.
</details>

### 2. Sự khác biệt giữa `main.jsx` và `App.jsx` là gì? Vai trò tương ứng của chúng là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`main.jsx`** là điểm đầu vào (entry point) của ứng dụng React. Nhiệm vụ duy nhất của nó là lấy phần tử `#root` từ HTML và gắn gốc ảo của React vào đó bằng `createRoot().render()`.
  - **`App.jsx`** là component gốc (root component) của ứng dụng. Nó chứa bố cục và cấu trúc trực quan, đồng thời đóng vai trò là container cha cho tất cả các component React tùy chỉnh khác mà bạn xây dựng.
</details>

### 3. Sự khác biệt giữa thư mục `public/` và thư mục `src/assets/` là gì? Vite xử lý chúng khác nhau như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`public/`**: Các tài nguyên ở đây được máy chủ phân phối trực tiếp đúng như nguyên bản. Vite **không** xử lý, đóng gói hay nén chúng. Chúng được truy cập bằng đường dẫn tương đối gốc (ví dụ: `/favicon.svg`).
  - **`src/assets/`**: Các tài nguyên ở đây được xử lý, biên dịch và đóng gói bởi Vite. Vite tối ưu hóa hình ảnh, build CSS, và có thể thêm các mã băm (hash) vào tên tệp để phục vụ caching của trình duyệt. Chúng phải được import trong các tệp JS/JSX của bạn (ví dụ: `import logo from './assets/logo.png'`).
</details>

### 4. Tại sao bạn không bao giờ nên commit thư mục `node_modules/` lên GitHub? Làm thế nào một lập trình viên mới tải được các gói đó sau khi clone dự án về?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn không bao giờ nên commit `node_modules/` vì:
  - Nó cực kỳ lớn (thường lên đến hàng trăm megabytes) và chứa hàng ngàn tệp tin nhỏ, điều này làm chậm các lệnh Git.
  - Danh sách chính xác các gói đã được theo dõi sẵn bên trong `package.json` và `package-lock.json`.
  - Một lập trình viên mới có thể tải chúng về ngay lập tức sau khi clone bằng cách chạy **`npm install`** trong thư mục dự án.
</details>

### 5. Mục đích của `package.json` là gì? Hãy giải thích sự khác biệt giữa `dependencies` và `devDependencies`.
<details>
  <summary><b>Reveal Answer</b></summary>

  `package.json` là tệp manifest cấu hình của dự án Node.js của bạn.
  - **`dependencies`**: Các thư viện cần thiết để ứng dụng chạy trong môi trường production (ví dụ: `react`, `react-dom`).
  - **`devDependencies`**: Các thư viện và công cụ chỉ cần thiết trong quá trình phát triển cục bộ, kiểm thử, hoặc build (ví dụ: `vite`, `eslint`, các trình biên dịch).
</details>
