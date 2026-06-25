# Tìm hiểu Cấu trúc Thư mục Dự án React 📂

Tài liệu này giải thích các tệp và thư mục được tạo ra trong dự án React chạy bằng Vite của bạn (`first-react-app`). Việc hiểu rõ vị trí và chức năng của từng tệp là chìa khóa để xây dựng ứng dụng một cách hiệu quả.

Dưới đây là sơ đồ cấu trúc chi tiết:

---

## 📁 Tổng quan về Thư mục Gốc

```text
first-react-app/
├── node_modules/       # Các gói phụ thuộc từ bên thứ ba đã tải xuống (React, Vite, v.v.)
├── public/             # Các tệp tĩnh được phân phối trực tiếp (không bị Vite xử lý)
│   ├── favicon.svg     # Biểu tượng trên tab trang web
│   └── icons.svg       # Các biểu tượng dạng vector
├── src/                # Mã nguồn chính của bạn (được Vite xử lý & đóng gói)
│   ├── assets/         # Các tài nguyên tĩnh (hình ảnh, vector) được biên dịch bởi Vite
│   ├── App.css         # Các kiểu CSS cụ thể cho component App
│   ├── App.jsx         # Component App chính (Bố cục giao diện gốc)
│   ├── index.css       # Các kiểu CSS toàn cục áp dụng cho toàn bộ ứng dụng
│   └── main.jsx        # Điểm đầu vào của ứng dụng React (gắn React vào DOM)
├── .gitignore          # Chỉ định các tệp/thư mục Git sẽ bỏ qua (ví dụ: node_modules)
├── eslint.config.js    # Cấu hình kiểm tra lỗi code (linting) để phát hiện bug sớm
├── index.html          # Trang HTML chính, điểm đầu vào của ứng dụng
├── package-lock.json   # Lưu trữ chính xác phiên bản của các gói phụ thuộc đã cài
├── package.json        # Thông tin mô tả dự án, các lệnh script và danh sách thư viện phụ thuộc
└── vite.config.js      # Các thiết lập cấu hình cho Vite
```

---

## 🔍 Phân tích chi tiết từng phần

### 1. `index.html` (Phần khung vỏ)
Khác với các trang web truyền thống có nhiều trang HTML riêng lẻ, React sử dụng mô hình **Ứng dụng đơn trang (SPA - Single Page Application)**.
- `index.html` là tệp HTML duy nhất được gửi tới trình duyệt.
- Bên trong thẻ `<body>`, bạn sẽ thấy:
  ```html
  <div id="root"></div>
  ```
- React sẽ gắn (mount) toàn bộ ứng dụng của bạn vào bên trong thẻ `div` duy nhất này.
- Tệp này cũng chứa đường dẫn tham chiếu đến điểm bắt đầu của mã React: `<script type="module" src="/src/main.jsx"></script>`.

### 2. Thư mục `src/` (Mã nguồn)
Đây là nơi bạn sẽ dành 99% thời gian phát triển của mình.

* **`main.jsx`**
  Đây là tệp điểm đầu vào. Nó lấy phần tử `#root` từ `index.html` và gắn ứng dụng React vào đó:
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
  - `index.css`: Được sử dụng cho các phong cách CSS toàn cục (như font chữ mặc định, màu nền body, các khung bao ngoài).
  - `App.css`: Các phong cách CSS có phạm vi hẹp hơn, áp dụng trực tiếp cho `App.jsx`.
* **`assets/`**
  Hình ảnh, font chữ hoặc các file SVG đặt ở đây sẽ được xử lý và tối ưu hóa bởi trình biên dịch build của Vite.

### 3. Thư mục `public/` (Tài nguyên tĩnh)
Các tệp ở đây được phân phối trực tiếp và **không** bị tối ưu hóa hay thay đổi bởi Vite.
- Sử dụng thư mục này cho các tệp cần giữ nguyên tên và đường dẫn chính xác, chẳng hạn như `robots.txt`, `favicon.ico`, hoặc các cấu hình tĩnh khác.
- Bạn có thể tham chiếu trực tiếp đến các tài nguyên trong thư mục public bằng cách viết `/favicon.svg` trong mã HTML/React của bạn.

### 4. Các tệp cấu hình
* **`package.json`**
  Tệp cấu hình cho dự án Node.js. Nó liệt kê:
  - **`scripts`**: Các lệnh chạy (ví dụ: `npm run dev` để khởi chạy Vite, `npm run build` để xuất mã sản phẩm production).
  - **`dependencies`**: Các thư viện cần thiết khi chạy ứng dụng trong thực tế (`react`, `react-dom`).
  - **`devDependencies`**: Các thư viện chỉ cần thiết trong quá trình phát triển/thử nghiệm cục bộ (`vite`, `eslint`).
* **`vite.config.js`**
  Tùy chỉnh cách Vite biên dịch và chạy ứng dụng của bạn (ví dụ: cấu hình alias đường dẫn, các plugin hoặc thiết lập proxy).
* **`eslint.config.js`**
  Định nghĩa các quy tắc để giữ cho mã nguồn JavaScript sạch sẽ và không có các lỗi ngớ ngẩn (ví dụ: cảnh báo về các biến không dùng tới hoặc thiếu import).
* **`node_modules/`**
  Thư mục lớn nhất, chứa toàn bộ các gói đã được cài đặt bởi npm. **Không bao giờ được chỉnh sửa thư mục này bằng tay!** Nó được tự động tạo và cập nhật khi bạn chạy `npm install`.

---

## 💡 Thực tiễn tốt nhất: Tổ chức thư mục `src/` của bạn
Khi ứng dụng của bạn phát triển lớn hơn, cấu trúc phẳng mặc định bên trong `src/` sẽ trở nên lộn xộn. Một thực tiễn tiêu chuẩn trong ngành là sắp xếp thư mục `src/` như sau:

```text
src/
├── assets/         # Hình ảnh, font chữ, các biểu tượng SVG
├── components/     # Các thành phần UI có thể tái sử dụng (Button, Card, Input)
├── hooks/          # Các React Hook tùy chỉnh (Custom Hooks)
├── pages/          # Các component đại diện cho toàn bộ trang (Home, Profile, Login)
├── styles/         # Các bảng mã CSS toàn cục (biến số, chủ đề/theme)
├── App.css
├── App.jsx
├── index.css
└── main.jsx
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về cấu trúc thư mục React. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. React chèn toàn bộ ứng dụng của bạn vào đâu trên trình duyệt? Hãy chỉ rõ tệp tin và phần tử HTML cụ thể.
<details>
  <summary><b>Reveal Answer</b></summary>

  React chèn toàn bộ ứng dụng của bạn vào tệp **`index.html`**, cụ thể là bên trong phần tử `<div id="root"></div>` nằm trong thẻ `<body>` của HTML.
</details>

### 2. Sự khác biệt giữa `main.jsx` và `App.jsx` là gì? Vai trò tương ứng của chúng là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`main.jsx`** là điểm đầu vào (entry point) của ứng dụng React. Nhiệm vụ duy nhất của nó là lấy phần tử `#root` từ HTML và gắn gốc ảo của React vào đó bằng lệnh `createRoot().render()`.
  - **`App.jsx`** là component gốc của ứng dụng. Nó chứa bố cục cấu trúc giao diện trực quan và đóng vai trò là container cha cho tất cả các component tùy chỉnh khác mà bạn xây dựng.
</details>

### 3. Sự khác biệt giữa thư mục `public/` và thư mục `src/assets/` là gì? Vite xử lý chúng khác nhau như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`public/`**: Các tài nguyên ở đây được máy chủ phân phối trực tiếp giữ nguyên định dạng ban đầu. Vite **không** xử lý, đóng gói hay nén chúng. Chúng được truy cập bằng đường dẫn tương đối gốc (ví dụ: `/favicon.svg`).
  - **`src/assets/`**: Các tài nguyên ở đây sẽ được xử lý, biên dịch và đóng gói bởi Vite. Vite tối ưu hóa hình ảnh, biên dịch CSS và có thể thêm các mã băm (hash) vào tên tệp để tối ưu hóa bộ nhớ đệm (caching) của trình duyệt. Chúng phải được import trong các tệp JS/JSX (ví dụ: `import logo from './assets/logo.png'`).
</details>

### 4. Tại sao bạn không bao giờ nên đưa thư mục `node_modules/` lên GitHub? Làm thế nào một lập trình viên mới tải được các thư viện đó sau khi clone dự án về?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn không nên đưa `node_modules/` lên Git vì:
  - Nó cực kỳ nặng (thường lên đến hàng trăm megabytes) và chứa hàng ngàn tệp tin nhỏ, điều này làm chậm các lệnh Git.
  - Danh sách chính xác các gói cần thiết đã được theo dõi sẵn trong `package.json` và `package-lock.json`.
  - Một lập trình viên mới sau khi tải dự án về chỉ cần chạy lệnh **`npm install`** trong thư mục dự án để tự động tải lại toàn bộ các thư viện đó.
</details>

### 5. Mục đích của `package.json` là gì? Hãy giải thích sự khác biệt giữa `dependencies` và `devDependencies`.
<details>
  <summary><b>Reveal Answer</b></summary>

  `package.json` là tệp cấu hình chứa thông tin tổng quan của dự án Node.js.
  - **`dependencies`**: Các thư viện cần thiết để ứng dụng hoạt động trong môi trường production (ví dụ: `react`, `react-dom`).
  - **`devDependencies`**: Các thư viện và công cụ chỉ cần thiết trong quá trình phát triển, kiểm thử hoặc build ứng dụng cục bộ (ví dụ: `vite`, `eslint`, các trình biên dịch).
</details>
