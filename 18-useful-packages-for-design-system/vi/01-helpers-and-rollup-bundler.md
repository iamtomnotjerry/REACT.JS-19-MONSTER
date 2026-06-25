# Công cụ Hỗ trợ Định dạng (Styling Helpers) & Trình đóng gói Rollup trong Hệ thống Thiết kế 🛠️

Khi xây dựng một **Hệ thống Thiết kế React (React Design System)** sẵn sàng cho môi trường production, việc viết các component chỉ mới giải quyết được một nửa chặng đường. Bạn phải đảm bảo rằng:
1. **Định dạng kiểu dáng (styling) linh hoạt**: Người dùng thư viện (consumers) có thể dễ dàng ghi đè các styles mặc định mà không gặp xung đột.
2. **Đóng gói tối ưu**: Thư viện được biên dịch thành một gói nhẹ hỗ trợ cơ chế loại bỏ code thừa (tree-shaking - ESM) và tương thích ngược (CJS).

Trong bài học này, chúng ta sẽ tìm hiểu về các công cụ hỗ trợ gộp class (`clsx` + `tailwind-merge`) và đóng gói thư viện component với **Rollup**.

---

## ⚡ 1. Vấn đề Định dạng động trong Tailwind CSS

Trong các ứng dụng React + Tailwind thông thường, chúng ta thường viết các class có điều kiện như sau:

```jsx
const Button = ({ variant, className }) => {
  const baseStyle = "px-4 py-2 rounded text-white font-medium";
  const variantStyle = variant === "danger" ? "bg-red-500" : "bg-blue-500";
  
  return <button className={`${baseStyle} ${variantStyle} ${className}`} {...props} />;
};
```

Nếu một người dùng gọi button này và cố gắng tùy biến nó:
```jsx
<Button variant="danger" className="px-6 bg-orange-600" />
```

Chuỗi class nhận được sau cùng sẽ chứa cả hai: `px-4 bg-red-500 px-6 bg-orange-600`.
Do thứ tự khai báo CSS trong file Tailwind đã biên dịch, **`bg-red-500` có thể sẽ thắng `bg-orange-600`**, mặc dù `bg-orange-600` được truyền vào sau cùng!

### Giải pháp: `clsx` + `tailwind-merge`

Để giải quyết xung đột này một cách triệt để:
- **`clsx`** (hoặc `classnames`): Một tiện ích siêu nhỏ giúp xây dựng chuỗi `className` theo điều kiện.
- **`tailwind-merge`**: Một tiện ích giúp ghi đè các class Tailwind CSS bị xung đột, đảm bảo class được khai báo sau cùng sẽ thắng.

Chúng ta kết hợp chúng để tạo ra hàm tiện ích chuẩn công nghiệp mang tên `cn` (được phổ biến rộng rãi bởi thư viện `shadcn/ui`):

```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Cách hàm `cn` xử lý các class:
```typescript
cn("px-4 py-2 bg-red-500", "px-6 bg-orange-600");
// Kết quả trả về: "py-2 px-6 bg-orange-600"
// Lưu ý: px-4 và bg-red-500 đã được ghi đè và loại bỏ thành công!
```

> [!TIP]
> Luôn luôn sử dụng hàm `cn` để bọc các class trong thư viện component nhằm cung cấp quyền kiểm soát định dạng tối đa cho người dùng thư viện.

---

## ⚡ 2. Tại sao chọn Rollup để đóng gói thư viện?

Trong khi **Vite** và **Webpack** cực kỳ tuyệt vời để xây dựng ứng dụng web, **Rollup** lại là tiêu chuẩn vàng để đóng gói các thư viện JavaScript.

| Tính năng | Rollup | Webpack |
| :--- | :--- | :--- |
| **Mục tiêu chính** | Đóng gói thư viện / package | Đóng gói ứng dụng web |
| **Định dạng đầu ra** | Hỗ trợ ESM, CJS, UMD đồng thời | Tối ưu hóa cho ứng dụng đơn trang (SPA) |
| **Tree Shaking** | Phân tích tĩnh cực kỳ hiệu quả | Tốt, nhưng tạo ra nhiều code bao quanh |
| **Kích thước gói** | Dung lượng tối giản, đầu ra sạch | Chứa các trình tải module và runtime đi kèm |

---

## 📦 3. Thiết lập Rollup cho React & TypeScript

Hãy cùng thực hiện thiết lập quy trình build (pipeline) đóng gói cho một thư viện component.

### Bước 1: Cài đặt Dependencies
Cài đặt Rollup và các plugin cần thiết làm dev dependencies:

```bash
npm install -D rollup rollup-plugin-peer-deps-external @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-postcss rollup-plugin-dts typescript postcss
```

### Bước 2: Cấu hình `rollup.config.mjs`
Tạo file cấu hình để xuất ra cả phiên bản ES modules (`.esm.js`) và CommonJS (`.cjs.js`) cho thư viện của bạn, kèm theo các file định nghĩa kiểu TypeScript:

```javascript
// rollup.config.mjs
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';

import packageJson from './package.json' assert { type: 'json' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(), // Ngăn chặn việc đóng gói react và react-dom vào bundle
      resolve(),          // Tìm kiếm các gói bên thứ ba trong node_modules
      commonjs(),         // Chuyển đổi các module CommonJS sang ES6
      typescript({ tsconfig: './tsconfig.json' }),
      postcss({
        extensions: ['.css'],
        minimize: true,
        inject: true,     // Chèn trực tiếp CSS styles vào DOM
      }),
    ],
  },
  {
    // Đóng gói các file định nghĩa kiểu (.d.ts) thành một file duy nhất
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
```

> [!WARNING]
> Việc không sử dụng `rollup-plugin-peer-deps-external` có thể làm cho bundle của bạn chứa bản sao trùng lặp của thư viện React. Khi dự án tiêu thụ import thư viện của bạn, React sẽ báo lỗi vi phạm "rules of hooks" do có nhiều phiên bản React chạy đồng thời trong cùng một app.

### Bước 3: Cấu hình `package.json`
Cấu hình các file đầu vào chính (entry points) và các build scripts:

```json
{
  "name": "@my-company/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "rollup -c",
    "watch": "rollup -c -w"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh câu trả lời.

### 1. Thư viện `tailwind-merge` giải quyết được vấn đề gì mà một mình `clsx` không thể tự xử lý?
<details>
  <summary><b>Reveal Answer</b></summary>

  `clsx` chỉ đơn giản nối các đối số chuỗi lại với nhau theo điều kiện. Nó hoàn toàn không hiểu cú pháp class của Tailwind. Do đó, nếu bạn truyền vào `px-4 px-6`, `clsx` sẽ cho ra `"px-4 px-6"`. `tailwind-merge` hiểu cấu trúc thuộc tính cụ thể của Tailwind và tiến hành ghi đè `px-4` bằng `px-6` vì cả hai đều nhắm tới cùng một thuộc tính CSS (padding chiều ngang).
</details>

### 2. Tại sao chúng ta nên khai báo React trong `peerDependencies` thay vì `dependencies` trong một thư viện component?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khai báo React dưới dạng `dependencies` sẽ buộc npm cài đặt một bản sao React riêng biệt trong thư mục `node_modules` của thư viện. Điều này dẫn đến hai phiên bản React hoạt động đồng thời trong ứng dụng của người dùng. Việc đưa nó vào `peerDependencies` chỉ định rằng ứng dụng host (nơi cài đặt thư viện) phải chịu trách nhiệm cung cấp React, tránh xung đột phiên bản và các lỗi nghiêm trọng về React hooks.
</details>

### 3. Vai trò của plugin `rollup-plugin-dts` trong cấu hình Rollup là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó gộp tất cả các file khai báo kiểu TypeScript riêng lẻ (`.d.ts`) được tạo ra bởi trình biên dịch thành một file `.d.ts` duy nhất và sạch sẽ ở file đầu ra. Điều này giúp đơn giản hóa quá trình nhận diện kiểu dữ liệu của trình soạn thảo code khi người dùng import các component từ thư viện của bạn.
</details>

### 4. Sự khác biệt giữa định dạng đầu ra ESM và CJS là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **ESM (ES Modules)** sử dụng các câu lệnh `import` và `export`. Đây là định dạng tĩnh (static), cho phép các công cụ build hiện đại thực hiện loại bỏ code thừa không dùng đến (tree-shaking).
  - **CJS (CommonJS)** sử dụng `require()` và `module.exports`. Đây là định dạng động (dynamic) và được sử dụng chủ yếu bởi Node.js trong các dự án cũ hoặc hệ thống build truyền thống.
</details>

### 5. Tại sao Rollup lại được ưa chuộng hơn Vite/esbuild khi đóng gói thư viện mặc dù Vite nhanh hơn?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mặc dù esbuild (được sử dụng bởi Vite) chạy cực kỳ nhanh, Rollup lại cung cấp các file bundle được tối ưu hóa cao, khả năng tree-shaking triệt để và có một hệ sinh thái plugin phong phú dành riêng cho các vấn đề phức tạp khi viết thư viện, như gộp kiểu dữ liệu (`dts`) và quản lý các phụ thuộc đồng hành (peer dependencies).
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Xây dựng Sandbox thử nghiệm hàm `cn`
1. Khởi tạo một dự án Node mini và cài đặt `clsx` và `tailwind-merge`.
2. Tạo hàm tiện ích `cn` để gộp class.
3. Kiểm thử hàm với các dữ liệu đầu vào sau:
   - `cn("text-red-500 bg-black", "text-blue-500")` (Xác minh xem `text-red-500` có bị loại bỏ hay không).
   - `cn("p-4", false && "p-2", "p-8")` (Xác minh xem logic rút gọn với boolean hoạt động tốt và `p-4` có bị ghi đè bởi `p-8` không).

### 🛠️ Bài tập 2: Biên dịch thử nghiệm với Rollup
1. Tạo một thư mục chứa cấu trúc tối giản:
   - `src/components/Button.tsx`: Một component Button đơn giản sử dụng React tiêu chuẩn.
   - `src/index.ts`: Export component Button trên.
2. Khởi tạo các cấu hình Rollup như đã trình bày ở Bước 2.
3. Chạy lệnh `npm run build` và kiểm tra thư mục đầu ra `dist/` để xác minh rằng các tệp đóng gói ESM và CJS đã được tạo ra thành công.
