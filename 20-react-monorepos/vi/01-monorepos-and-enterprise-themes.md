# Monorepo & Hệ thống Theme Doanh nghiệp trong React Hiện đại 🌲

Trong phát triển phần mềm quy mô doanh nghiệp, các công ty hiếm khi xây dựng một trang web đơn lẻ, cô lập. Thay vào đó, họ quản lý một hệ sinh thái ứng dụng—ví dụ như ứng dụng web dành cho khách hàng, trang quản trị (admin dashboard), và trang tài liệu hướng dẫn—tất cả đều cần dùng chung các component, thư viện tiện ích, và nhận diện thương hiệu.

Để giải quyết thách thức về mặt hiệu suất này, kỹ nghệ frontend hiện đại dựa vào **Monorepo** và **Bộ quản lý Theme Động (Dynamic Theme Providers)**.

---

## ⚡ 1. Monorepo là gì?

**Monorepo (monolithic repository)** là một chiến lược phát triển phần mềm trong đó mã nguồn của nhiều dự án riêng biệt, khác nhau được lưu trữ trong cùng một kho chứa (repository) của hệ thống quản lý phiên bản (như Git).

### Tại sao chọn Monorepo?
- **Chia sẻ mã nguồn dễ dàng**: Trực tiếp import các thư viện UI dùng chung (`packages/ui`) hoặc các tiện ích (`packages/utils`) vào ứng dụng của bạn mà không cần đẩy chúng lên npm.
- **Quản lý phiên bản phụ thuộc tập trung**: Quản lý phiên bản thư viện (dependencies) cho tất cả các package tại một nơi duy nhất, đảm bảo tính đồng bộ (ví dụ: cùng một phiên bản React).
- **Atomic Commits (Commit nguyên tử)**: Thay đổi một component và cập nhật các ứng dụng tiêu thụ nó trong cùng một commit git duy nhất.

### Monorepo so với Multi-repo (Nhiều repo độc lập)

| Tính năng | Monorepo | Multi-repo (Polyrepo) |
| :--- | :--- | :--- |
| **Chia sẻ mã nguồn** | Import trực tiếp thông qua workspace (cập nhật tức thì) | Phải xuất bản và tải các package thông qua npm |
| **Phiên bản phụ thuộc** | Đồng bộ và điều phối cực kỳ dễ dàng | Dễ bị lệch phiên bản, dẫn tới lỗi tương thích |
| **Cấu hình & Công cụ** | Chi phí cấu hình ban đầu cao hơn | Cấu hình dự án đơn giản, độc lập |

---

## 📁 2. Thiết lập Workspaces (npm / pnpm / Yarn)

Workspaces là cơ chế cốt lõi được tích hợp sẵn trong các trình quản lý gói (package managers) để hỗ trợ monorepo. Chúng liên kết các thư mục trên đĩa cứng cục bộ lại với nhau để có thể tham chiếu trực tiếp.

### Cấu trúc thư mục mẫu
```
my-enterprise-monorepo/
├── package.json (cấu hình thư mục gốc)
├── pnpm-workspace.yaml (nếu sử dụng pnpm)
├── apps/
│   ├── admin-dashboard/ (ứng dụng React)
│   └── customer-portal/ (ứng dụng React)
└── packages/
    ├── ui/ (thư viện component cho Design System)
    └── tsconfig/ (cấu hình tsconfig dùng chung)
```

### File cấu hình gốc (`package.json`)
Nếu bạn đang sử dụng **npm** hoặc **Yarn**, bạn định nghĩa workspaces trong file `package.json` ở thư mục gốc:

```json
{
  "name": "my-enterprise-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### Import Thư viện UI Dùng chung
Trong file `apps/admin-dashboard/package.json`, bạn import package UI cục bộ như sau:
```json
{
  "name": "admin-dashboard",
  "dependencies": {
    "@my-monorepo/ui": "workspace:*"
  }
}
```
Giờ đây, bạn có thể import các component trực tiếp bên trong ứng dụng dashboard của mình:
```typescript
import { Button } from '@my-monorepo/ui';
```

> [!TIP]
> Sử dụng **Turborepo** (`npx turbo build`) trên nền tảng workspaces để lưu bộ nhớ đệm (caching) cho các kết quả build. Nếu mã nguồn trong `packages/ui` không thay đổi, Turborepo sẽ gọi lại kết quả build cũ ngay lập tức, giúp cắt giảm tới 90% thời gian chạy CI build.

---

## 🎨 3. Hệ thống Theme Doanh nghiệp với Biến CSS (CSS Variables)

Một hệ thống thiết kế doanh nghiệp phải hỗ trợ nhiều chủ đề giao diện (ví dụ: Sáng, Tối, Tương phản cao, hoặc đa thương hiệu như Y tế so với Doanh nghiệp).

Cách tối ưu nhất để quản lý theme là sử dụng **Biến CSS (Custom Properties)** kết hợp với thuộc tính HTML `data-theme`.

### Bước 1: Định nghĩa các Theme Tokens trong CSS
Định nghĩa các biến CSS bên trong bộ chọn thuộc tính cụ thể thay vì chỉ khai báo trong `:root`:

```css
/* src/styles/theme.css */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6; /* Màu xanh dương */
}

[data-theme="dark"] {
  --color-bg: #0f172a; /* Slate 900 */
  --color-text: #f8fafc;
  --color-primary: #60a5fa; /* Xanh dương nhạt */
}

[data-theme="brand-pink"] {
  --color-bg: #fff1f2;
  --color-text: #4c0519;
  --color-primary: #ec4899; /* Màu hồng */
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s, color 0.3s;
}
```

---

## ⚡ 4. Tạo bộ quản lý theme động `ThemeProvider` trong React

Để xử lý việc thay đổi theme động, chúng ta quản lý trạng thái đó bên trong một Context Provider.

```tsx
// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'brand-pink';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Đọc theme ban đầu từ localStorage hoặc mặc định theo cấu hình hệ thống
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme') as Theme;
    if (saved) return saved;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    // Áp dụng thuộc tính theme lên thẻ HTML gốc
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
```

### Sử dụng bên trong các Component:
```tsx
import { useTheme } from './context/ThemeContext';

export const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-4">
      <button 
        className="px-4 py-2 border rounded"
        onClick={() => setTheme('light')}
        disabled={theme === 'light'}
      >
        Light Mode
      </button>
      <button 
        className="px-4 py-2 border rounded bg-slate-800 text-white"
        onClick={() => setTheme('dark')}
        disabled={theme === 'dark'}
      >
        Dark Mode
      </button>
      <button 
        className="px-4 py-2 border rounded bg-pink-500 text-white"
        onClick={() => setTheme('brand-pink')}
        disabled={theme === 'brand-pink'}
      >
        Brand Pink
      </button>
    </div>
  );
};
```

> [!WARNING]
> Khi sử dụng các framework Server-Side Rendering (SSR) như Next.js, việc đọc dữ liệu từ `localStorage` trực tiếp trong lượt render đầu tiên sẽ gây ra lỗi **Hydration Mismatch** (không khớp dữ liệu server/client) do phía máy chủ không truy cập được bộ lưu trữ của trình duyệt. Để khắc phục, hãy trì hoãn việc đọc bộ nhớ cục bộ cho đến khi chạy `useEffect` hoặc chạy một tập lệnh chặn (blocking script) nhỏ trong thẻ `<head>` của HTML để gán thuộc tính `data-theme` trước khi React khởi động.

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh câu trả lời.

### 1. Liên kết workspace của npm khác biệt gì so với việc cài đặt package thông thường?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các package thông thường sẽ được tải về từ máy chủ npm registry công khai và lưu trong thư mục `node_modules`. Đối với workspaces, trình quản lý gói sẽ tạo ra các **symlinks** (liên kết tượng trưng) trên ổ đĩa cứng cục bộ trỏ trực tiếp đến thư mục nguồn của package phụ thuộc. Mọi thay đổi về code bên trong package đó sẽ lập tức được cập nhật ở ứng dụng tiêu thụ mà không cần chạy lệnh `npm publish` hay `npm install`.
</details>

### 2. Lợi ích của việc gán thuộc tính theme `data-theme` lên thẻ `<html>` hoặc `<body>` thay vì lưu trong biến trạng thái class của React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Gán `data-theme` lên phần tử cha ngoài cùng cho phép các biến CSS lan truyền tự động xuống toàn bộ cây DOM bên dưới (CSS inheritance). Mọi rule CSS con sử dụng cú pháp `var(--color-bg)` sẽ ngay lập tức thích ứng theo theme được chọn. Nó cũng giúp tối giản cấu hình Tailwind, vì bạn có thể định nghĩa các style theo selector (ví dụ: `[data-theme="dark"] .card`).
</details>

### 3. Hiện tượng "nháy theme" (hydration flash) là gì, và nó xảy ra như thế nào trong các bộ quản lý theme?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hiện tượng nháy theme xảy ra trong các ứng dụng SSR khi máy chủ render theme mặc định (ví dụ: Light) do không biết cấu hình tùy chọn của người dùng. Khi mã HTML tải xong, màn hình sẽ hiển thị giao diện Light trước, sau đó React chạy ở phía client (`useEffect`) mới đọc `localStorage` và chuyển đổi sang theme Dark. Sự thay đổi đột ngột từ nền sáng sang nền tối tạo ra hiện tượng nhấp nháy gây khó chịu cho người dùng.
</details>

### 4. Làm cách nào để viết các class Tailwind thích ứng theo các biến CSS của Theme?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn ánh xạ các màu sắc của Tailwind sang biến CSS bên trong file `tailwind.config.js`:
  ```javascript
  module.exports = {
    theme: {
      extend: {
        colors: {
          primary: 'var(--color-primary)',
          background: 'var(--color-bg)',
        }
      }
    }
  }
  ```
  Giờ đây, việc sử dụng các class như `bg-background` hoặc `text-primary` sẽ tự động chuyển đổi màu sắc chính xác khi biến CSS thay đổi.
</details>

### 5. Tại sao cần thiết lập `private: true` trong file `package.json` gốc của một monorepo?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó giúp ngăn chặn việc vô tình đẩy nhầm (publish) toàn bộ dự án monorepo lên npm registry công khai. Thư mục gốc monorepo chỉ đóng vai trò điều phối/cấu hình chung chứ không phải là một package đóng gói để phân phối.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Khởi tạo Cấu trúc Monorepo Workspaces
1. Tạo một thư mục gốc tên `react-monorepo-practice` chứa tệp `package.json` cấu hình workspaces cho `apps/*` và `packages/*`.
2. Bên trong `packages/`, tạo thư mục `math-utils` có package.json và một tệp `index.js` xuất bản ra hàm tính tổng `add`.
3. Bên trong `apps/`, tạo một ứng dụng Node hoặc React đơn giản tên `my-app` thực hiện import và chạy hàm `add` từ thư mục workspace `math-utils`.
4. Xác minh liên kết hoạt động tốt bằng cách chạy ứng dụng.

### 🛠️ Bài tập 2: Thử thách Theme tương phản cao (High-contrast theme)
1. Mở rộng phần định nghĩa CSS để hỗ trợ thêm một theme tương phản cao `high-contrast`.
2. Theme `high-contrast` phải định nghĩa:
   - `--color-bg: #000000;` (Đen hoàn toàn)
   - `--color-text: #ffff00;` (Vàng neon sáng)
   - `--color-primary: #ffffff;`
3. Thêm một nút bấm trong component `ThemeToggler` để kích hoạt chế độ `high-contrast` và kiểm tra xem toàn bộ các khối nội dung có thay đổi giao diện phù hợp hay không.
