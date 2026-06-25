# Monorepo & Hệ thống Theme Doanh nghiệp trong React Hiện đại 🌲

Trong phát triển phần mềm quy mô doanh nghiệp, các công ty hiếm khi xây dựng một trang web đơn lẻ, cô lập. Thay vào đó, họ quản lý một bộ các ứng dụng—chẳng hạn như một web app hướng tới khách hàng, một admin dashboard, và một cổng tài liệu hướng dẫn—tất cả đều phải dùng chung các component, thư viện tiện ích, và nhận diện thương hiệu.

Để giải quyết thách thức về hiệu suất này, kỹ nghệ frontend hiện đại dựa vào **Monorepo** và **Dynamic Theme Provider (Bộ quản lý Theme động)**.

---

## 💡 Khái niệm & Tổng quan

Một monorepo không chỉ đơn thuần là "nhiều thư mục trong một repo". Đó là một kiến trúc có chủ đích cho phép nhiều ứng dụng cùng tiêu thụ một **nguồn chân lý duy nhất (single source of truth)** cho các component, tiện ích, và—đặc biệt quan trọng đối với thương hiệu—các **design token**. Khi đội thiết kế đổi màu primary của thương hiệu từ xanh dương sang teal, bạn muốn thay đổi đó lan tỏa vào mọi ứng dụng từ một nơi duy nhất, chứ không phải sao chép thủ công qua năm repository khác nhau.

> [!NOTE]
> **Ẩn dụ "một căn bếp duy nhất".** Hãy hình dung một chuỗi nhà hàng có năm chi nhánh (các ứng dụng của bạn). Một polyrepo giống như việc đưa cho mỗi chi nhánh một cuốn sổ công thức riêng—khi bếp trưởng tinh chỉnh nước sốt đặc trưng, ai đó phải tự tay chuyển công thức mới đến cả năm nơi và hy vọng không ai gõ sai. Còn monorepo là một căn bếp trung tâm duy nhất: mọi chi nhánh đều lấy nguyên liệu từ cùng một kệ (`packages/tokens`, `packages/ui`). Đổi nước sốt một lần, và mọi món ăn được phục vụ ở khắp nơi đều phản ánh ngay lập tức.

> [!TIP]
> Design **token** là các nguyên tử của một design system: những giá trị được đặt tên cho color, spacing, radius, shadow, và opacity. Bằng cách lưu chúng dưới dạng **JSON** thuần túy, chúng trở nên độc lập với nền tảng—cùng một `color.primary` có thể được biên dịch thành CSS variable cho web, một tài nguyên Android XML, và một hằng số Swift trên iOS. Đây chính xác là những gì các công cụ như **Style Dictionary** tự động hóa.

> [!WARNING]
> Sai lầm lớn nhất ở quy mô doanh nghiệp là hardcode trực tiếp các giá trị hex (`#3b82f6`) trong các component. Khoảnh khắc thương hiệu thay đổi, bạn phải đối mặt với một cuộc find-and-replace mong manh trên hàng nghìn file. Token thêm một lớp gián tiếp (`var(--color-primary)`) để nhận diện hình ảnh nằm trong **dữ liệu**, chứ không bị rải rác khắp **code**.

### Mỗi mảnh ghép nằm ở đâu

| Lớp | Package | Định dạng | Được tiêu thụ bởi |
| :--- | :--- | :--- | :--- |
| **Giá trị thô** | `packages/tokens` | JSON | Style Dictionary, Tailwind preset |
| **CSS variable** | `theme.css` được sinh ra | CSS | global stylesheet của mọi app |
| **Component** | `packages/ui` | TSX | `apps/*` |
| **Cấu hình type** | `packages/tsconfig` | JSON | mọi package & app thông qua `extends` |
| **Tailwind preset** | `packages/tailwind-preset` | JS | `tailwind.config.js` của mỗi app |

```text
                 packages/tokens/*.json   (single source of truth)
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
 Style Dictionary   Tailwind preset    TypeScript types
        │                 │
        ▼                 ▼
   theme.css        tailwind.config
        │                 │
        └──────┬──────────┘
               ▼
        apps/admin · apps/portal  (consume identical brand)
```

---

## ⚡ 1. Monorepo là gì?

**Monorepo (monolithic repository)** là một chiến lược phát triển phần mềm trong đó mã nguồn của nhiều dự án riêng biệt, khác nhau được lưu trữ trong cùng một kho chứa (repository) của hệ thống quản lý phiên bản.

### Tại sao chọn Monorepo?
- **Chia sẻ mã nguồn (Shared Codebase)**: Dễ dàng import các thư viện UI dùng chung (`packages/ui`) hoặc các tiện ích (`packages/utils`) vào ứng dụng của bạn mà không cần đẩy chúng lên npm.
- **Một nguồn dependency duy nhất (Single Dependency Source)**: Quản lý các dependency trên tất cả các package tại một nơi duy nhất, đảm bảo các phiên bản React được đồng bộ.
- **Atomic Commits (Commit nguyên tử)**: Thay đổi một component và cập nhật các ứng dụng tiêu thụ nó trong cùng một commit git duy nhất.

### Monorepo so với Multi-repo

| Tính năng | Monorepo | Multi-repo (Polyrepo) |
| :--- | :--- | :--- |
| **Chia sẻ mã nguồn** | Import trực tiếp qua workspace (cập nhật tức thì) | Phải publish/install các package qua npm |
| **Phiên bản dependency** | Đồng bộ hoặc điều phối dễ dàng | Thường bị lệch, gây ra lỗi tương thích |
| **Công cụ & Cấu hình** | Chi phí cấu hình ban đầu cao hơn | Thiết lập dự án đơn giản, độc lập |

> [!TIP]
> Trong phần hướng dẫn của khóa học, giảng viên chứng minh lợi ích này một cách trực tiếp: anh ấy đưa một bug vào trong package dùng chung `my-math` (biến `add` thành phép trừ) và ứng dụng tiêu thụ `my-project` phản ánh điều đó **ngay lập tức** trong lần chạy kế tiếp—không cần publish, không cần reinstall, không cần vòng lặp qua GitHub. Sự tức thời đó chính là toàn bộ giá trị cốt lõi của workspace.

---

## 📁 2. Thiết lập Workspaces (npm / pnpm / Yarn)

Workspaces là cơ chế cốt lõi được tích hợp sẵn trong các trình quản lý gói (package manager) để hỗ trợ monorepo. Chúng liên kết các thư mục trên đĩa cứng cục bộ lại với nhau để có thể tham chiếu lẫn nhau trực tiếp.

### Cấu trúc thư mục
```
my-enterprise-monorepo/
├── package.json (root configuration)
├── tsconfig.base.json (shared TypeScript base — see §6)
├── pnpm-workspace.yaml (if using pnpm)
├── apps/
│   ├── admin-dashboard/ (React app)
│   └── customer-portal/ (React app)
└── packages/
    ├── ui/ (Design System component library)
    ├── tokens/ (Design tokens as JSON — see §5)
    ├── tailwind-preset/ (Tailwind config generated from tokens — see §7)
    └── tsconfig/ (Shared tsconfig base)
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

> [!NOTE]
> Theo phần demo Yarn workspaces trong khóa học: bạn tạo một `package.json` gốc với `"private": true` và một mảng `workspaces` (giảng viên gom mọi thứ dưới một thư mục `packages/*` duy nhất theo quy ước). Mỗi package được khởi tạo bằng `yarn init -y`, được đặt một tên alias có scope (ví dụ `@husan/my-math`), được khai báo là một dependency trong package tiêu thụ, và được liên kết bằng một lệnh `yarn install` duy nhất ở thư mục gốc—lệnh này tạo ra một `node_modules` dùng chung với một symlink trỏ đến mã nguồn.

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
> Sử dụng **Turborepo** (`npx turbo build`) trên nền tảng workspaces để cache các kết quả build. Nếu bạn chưa thay đổi mã nguồn trong `packages/ui`, Turborepo sẽ phát lại bản build đã được cache ngay lập tức, giúp cắt giảm tới 90% thời gian build CI.

---

## 🎨 3. Hệ thống Theme cấp Doanh nghiệp với CSS Variable

Một enterprise design system phải hỗ trợ nhiều theme (ví dụ: Light, Dark, High-Contrast, hoặc các theme đa thương hiệu như Medical so với Corporate).

Cách hiệu năng nhất để quản lý theme là sử dụng **CSS Variable (Custom Properties)** kết hợp với thuộc tính HTML `data-theme`.

### Bước 1: Định nghĩa các Theme Token trong CSS
Định nghĩa các biến bên trong các bộ chọn thuộc tính cụ thể thay vì `:root`:

```css
/* src/styles/theme.css */
[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text: #1a1a1a;
  --color-primary: #3b82f6; /* Blue */
}

[data-theme="dark"] {
  --color-bg: #0f172a; /* Slate 900 */
  --color-text: #f8fafc;
  --color-primary: #60a5fa; /* Light Blue */
}

[data-theme="brand-pink"] {
  --color-bg: #fff1f2;
  --color-text: #4c0519;
  --color-primary: #ec4899; /* Pink */
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: background-color 0.3s, color 0.3s;
}
```

> [!NOTE]
> Đoạn CSS hardcode ở trên rất tốt cho việc giảng dạy, nhưng trong một enterprise monorepo thực tế, bạn sẽ **không** gõ thủ công các giá trị này. Thay vào đó chúng được **sinh ra** từ các JSON token ở §5 bởi Style Dictionary (§5.1). File CSS trở thành một build artifact, không bao giờ được chỉnh sửa trực tiếp.

---

## ⚡ 4. Tạo một `ThemeProvider` động trong React

Để xử lý việc hoán đổi theme một cách động, hãy quản lý state bên trong một Context Provider.

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
  // Read initial theme from localStorage or default to system preference
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
    // Apply theme attribute to the HTML root element
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

### Sử dụng trong các Component:
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
> Khi sử dụng các framework Server-Side Rendering (SSR) như Next.js, việc đọc trực tiếp từ `localStorage` trong lượt render đầu tiên sẽ gây ra lỗi **Hydration Mismatch** vì máy chủ không có quyền truy cập vào bộ lưu trữ của trình duyệt. Để khắc phục, hãy luôn trì hoãn việc đọc local storage cho đến `useEffect`, hoặc inject một blocking script trong `<head>` của HTML để gán thuộc tính data-theme trước khi React khởi động.

---

## 🎟️ 5. Design Token (`packages/tokens`)

Token là nguồn chân lý duy nhất cho nhận diện hình ảnh của bạn, được lưu dưới dạng JSON thuần túy để bất kỳ nền tảng nào cũng có thể tiêu thụ. Hãy nhóm chúng theo danh mục: **colors, radius, spacing, shadows, opacity**.

```json
// packages/tokens/tokens.json
{
  "color": {
    "bg":        { "value": "#ffffff" },
    "text":      { "value": "#1a1a1a" },
    "primary":   { "value": "#3b82f6" },
    "secondary": { "value": "#64748b" },
    "danger":    { "value": "#ef4444" },
    "success":   { "value": "#22c55e" }
  },
  "radius": {
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "16px" },
    "full": { "value": "9999px" }
  },
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" },
    "xl": { "value": "40px" }
  },
  "shadow": {
    "sm": { "value": "0 1px 2px rgba(0,0,0,0.05)" },
    "md": { "value": "0 4px 6px rgba(0,0,0,0.10)" },
    "lg": { "value": "0 10px 25px rgba(0,0,0,0.15)" }
  },
  "opacity": {
    "disabled": { "value": "0.4" },
    "muted":    { "value": "0.6" },
    "full":     { "value": "1" }
  }
}
```

> [!NOTE]
> Cấu trúc lồng nhau `{ "value": ... }` chính là định dạng token của **Style Dictionary**. Lớp bao bọc thêm này cho phép bạn đính kèm metadata về sau (ví dụ `"comment"`, `"deprecated"`) mà không phá vỡ các bên tiêu thụ.

### 5.1 Cấu hình Style Dictionary (tóm tắt)

**Style Dictionary** đọc `tokens.json` và biến đổi nó thành các đầu ra dành riêng cho từng nền tảng. Cài đặt nó như một dev dependency trong `packages/tokens`, sau đó thêm một file config:

```js
// packages/tokens/style-dictionary.config.js
export default {
  source: ['tokens.json'], // input: the JSON above
  platforms: {
    // Output #1: CSS custom properties for the web
    css: {
      transformGroup: 'css',
      buildPath: 'dist/',
      files: [{
        destination: 'theme.css',
        format: 'css/variables', // emits :root { --color-primary: #3b82f6; ... }
        options: { outputReferences: true }
      }]
    },
    // Output #2: a JS module so the Tailwind preset can import raw values
    js: {
      transformGroup: 'js',
      buildPath: 'dist/',
      files: [{ destination: 'tokens.js', format: 'javascript/es6' }]
    }
  }
};
```

```bash
# Build all platform outputs from the single tokens.json source
npx style-dictionary build --config packages/tokens/style-dictionary.config.js
```

File `theme.css` được sinh ra sẽ thay thế đoạn CSS viết tay ở §3—một nguồn, nhiều đích đến.

---

## 🧩 6. Cấu hình TypeScript Liên-package

Trong một monorepo, mọi package và app nên dùng chung một baseline TypeScript duy nhất để các tùy chọn compiler không bao giờ bị lệch. Bạn định nghĩa một **base config gốc** và để mỗi package `extends` nó.

```json
// tsconfig.base.json (at the monorepo root)
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "jsx": "react-jsx",
    "strict": true,            // enforce strict typing everywhere
    "skipLibCheck": true,
    "esModuleInterop": true,
    "declaration": true,       // emit .d.ts so other packages get types
    "baseUrl": "."
  }
}
```

Mỗi package sau đó giữ một config nhỏ gọn dùng `extends` base và chỉ override những gì là cục bộ:

```json
// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json", // inherit all shared options
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

```json
// apps/admin-dashboard/tsconfig.json
{
  "extends": "../../tsconfig.base.json", // same baseline as packages
  "compilerOptions": {
    "noEmit": true,            // the bundler emits, not tsc
    "paths": {
      "@my-monorepo/ui": ["../../packages/ui/src"],
      "@my-monorepo/tokens": ["../../packages/tokens/dist"]
    }
  },
  "include": ["src"]
}
```

> [!TIP]
> Kết hợp điều này với **TypeScript Project References** (`"references": [{ "path": "../tokens" }]`) để `tsc --build` biên dịch các package theo đúng thứ tự phụ thuộc và cache những package không thay đổi—tương đương với incremental build của Turborepo trong thế giới TypeScript.

---

## 🌬️ 7. Tailwind Preset Sinh ra từ Token

Một **Tailwind preset** là một mảnh config có thể chia sẻ mà `tailwind.config.js` của mọi app có thể nạp vào qua mảng `presets`. Chúng ta xây dựng nó từ cùng một bộ token để các utility của Tailwind và các CSS variable không bao giờ mâu thuẫn nhau.

```js
// packages/tailwind-preset/index.js
// Import the JS tokens emitted by Style Dictionary (§5.1)
const tokens = require('@my-monorepo/tokens/dist/tokens.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Map CSS variables so utilities follow the active data-theme
      colors: {
        background: 'var(--color-bg)',
        foreground: 'var(--color-text)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
      },
      // Static scales pulled straight from the token values
      borderRadius: {
        sm: tokens.RadiusSm,
        md: tokens.RadiusMd,
        lg: tokens.RadiusLg,
      },
      spacing: {
        xs: tokens.SpacingXs,
        sm: tokens.SpacingSm,
        md: tokens.SpacingMd,
        lg: tokens.SpacingLg,
        xl: tokens.SpacingXl,
      },
      boxShadow: {
        sm: tokens.ShadowSm,
        md: tokens.ShadowMd,
        lg: tokens.ShadowLg,
      },
      opacity: {
        disabled: tokens.OpacityDisabled,
        muted: tokens.OpacityMuted,
      },
    },
  },
};
```

Mỗi app sau đó tiêu thụ preset chỉ trong một dòng:

```js
// apps/admin-dashboard/tailwind.config.js
module.exports = {
  presets: [require('@my-monorepo/tailwind-preset')], // shared brand
  content: ['./src/**/*.{ts,tsx}'],
};
```

> [!NOTE]
> Hãy chú ý sự phân tách: **colors** ánh xạ sang `var(--color-*)` để chúng phản ứng với `data-theme` đang hoạt động (light/dark/brand), trong khi **radius/spacing/shadow** là các giá trị scale tĩnh được nung sẵn tại thời điểm build. Giờ đây `className="bg-background text-primary rounded-md shadow-lg p-md"` được điều khiển hoàn toàn bởi token trên mọi app.

> [!TIP]
> **Build từ đầu đến cuối.** Bài học này thiết lập kiến trúc và từng file config riêng lẻ. Bản build hoàn chỉnh, đã được kết nối đầy đủ—khởi tạo repo design system, sinh ra CSS, publish các package, và tiêu thụ chúng trong một app đang chạy—được trình bày từng bước trong **§21 (Fullstack Project / Design System build)**. Hãy dùng phần đó cho việc lắp ráp thực hành thay vì lặp lại pipeline ở đây.

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh.

### 1. Cơ chế liên kết workspace của npm khác biệt như thế nào so với việc phân giải package npm thông thường?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các package thông thường được tải về từ npm registry từ xa và lưu trong `node_modules`. Workspaces tạo ra các **symlink** (liên kết tượng trưng) trên hệ thống file cục bộ của bạn, trỏ trực tiếp đến thư mục nguồn của package phụ thuộc. Bất kỳ chỉnh sửa nào trong mã nguồn của dependency đều được phản ánh ngay lập tức trong app tiêu thụ mà không cần chạy lệnh npm publish hay npm install.
</details>

### 2. Lợi ích của việc gán thuộc tính theme `data-theme` lên phần tử `<html>` hoặc `<body>` thay vì dùng các biến class trong React state là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Gán `data-theme` lên một phần tử DOM cha cho phép các CSS variable lan truyền tự động xuống cây DOM. Bất kỳ rule CSS lồng nhau nào sử dụng `var(--color-bg)` đều thích ứng ngay lập tức theo theme được chọn. Nó cũng giữ cho cấu hình Tailwind của bạn đơn giản, vì bạn có thể style các component bằng các theme selector (ví dụ `[data-theme="dark"] .card`).
</details>

### 3. Tại sao lại lưu design token dưới dạng JSON, và Style Dictionary làm gì với chúng?
<details>
  <summary><b>Reveal Answer</b></summary>

  Lưu token dưới dạng **JSON** thuần túy biến chúng thành dữ liệu độc lập với nền tảng thay vì code bị ràng buộc vào một framework. **Style Dictionary** đọc nguồn `tokens.json` duy nhất đó và biến đổi nó thành nhiều đầu ra dành riêng cho từng nền tảng—CSS custom properties (`theme.css`) cho web, một JS module cho Tailwind preset, và thậm chí cả tài nguyên Android/iOS. Một thay đổi trong JSON sẽ lan tỏa đi khắp nơi trong lần build kế tiếp, loại bỏ các giá trị hex hardcode rải rác khắp các component.
</details>

### 4. Trong một monorepo, làm cách nào để giữ cho các tùy chọn compiler của TypeScript nhất quán trên tất cả các package?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn định nghĩa một file `tsconfig.base.json` duy nhất ở thư mục gốc của repository với tất cả các `compilerOptions` dùng chung (`strict`, `target`, `jsx`, `declaration`, v.v.). Mỗi package và app sau đó có một `tsconfig.json` nhỏ gọn sử dụng `"extends": "../../tsconfig.base.json"` và chỉ override các cài đặt cục bộ như `outDir`, `rootDir`, hoặc các path alias. Điều này đảm bảo các tùy chọn compiler không bị lệch. Tùy chọn thêm, TypeScript **Project References** cho phép `tsc --build` biên dịch các package theo đúng thứ tự phụ thuộc với incremental caching.
</details>

### 5. Trong Tailwind preset, tại sao colors lại được ánh xạ sang `var(--color-*)` trong khi radius và spacing lại dùng các giá trị token theo nghĩa đen?
<details>
  <summary><b>Reveal Answer</b></summary>

  Colors phải phản ứng với việc chuyển đổi theme tại **thời điểm runtime** được điều khiển bởi thuộc tính `data-theme`, nên chúng trỏ tới các CSS variable (`var(--color-primary)`) có giá trị thay đổi ngay lập tức khi theme thay đổi—không cần build lại. Radius, spacing, shadow, và opacity là một phần của thang đo cấu trúc không thay đổi giữa các theme light/dark/brand, nên chúng được nung sẵn dưới dạng các giá trị literal tĩnh tại **thời điểm build**, được import trực tiếp từ module token được sinh ra. Việc ánh xạ một preset dùng chung theo cách này giữ cho nhận diện thương hiệu của mọi app giống hệt nhau chỉ qua một dòng `presets: [require('@my-monorepo/tailwind-preset')]`.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Thiết lập Monorepo với Workspaces
1. Tạo một thư mục gốc `react-monorepo-practice` chứa một `package.json` với workspaces được cấu hình cho `apps/*` và `packages/*`.
2. Bên trong `packages/`, tạo một thư mục `math-utils` với một package.json và một file `index.js` export một hàm `add`.
3. Bên trong `apps/`, tạo một Node app hoặc React app đơn giản tên `my-app` thực hiện import và gọi hàm `add` từ workspace `math-utils`.
4. Xác minh liên kết hoạt động đúng bằng cách gọi chạy code.
5. **Thêm chiều sâu:** Đưa một bug có chủ đích vào `math-utils` (đổi `add` thành phép trừ), chạy lại `my-app` **mà không** cần reinstall, và xác nhận thay đổi được phản ánh ngay lập tức—chứng minh hành vi của symlink. Sau đó thêm một `tsconfig.base.json` ở thư mục gốc và cho cả `math-utils` lẫn `my-app` `extends` nó.

### 🛠️ Bài tập 2: Thử thách theme high-contrast cho design system
1. Mở rộng khối CSS theme để hỗ trợ một theme `high-contrast`.
2. Theme `high-contrast` phải định nghĩa:
   - `--color-bg: #000000;`
   - `--color-text: #ffff00;` (Vàng tươi)
   - `--color-primary: #ffffff;`
3. Thêm một button trong `ThemeToggler` để kích hoạt chế độ `high-contrast` và xác minh rằng tất cả các khối văn bản điều chỉnh phù hợp.
4. **Thêm chiều sâu:** Thêm một mục `high-contrast` tương ứng vào `packages/tokens/tokens.json` và xác nhận rằng các màu sắc chảy thông suốt đến các utility của Tailwind (ví dụ `bg-background text-foreground`) thông qua preset, chứ không chỉ ở CSS thô.

### 🛠️ Bài tập 3: Pipeline Tokens → Tailwind
1. Tạo `packages/tokens/tokens.json` sử dụng cấu trúc colors/radius/spacing/shadows/opacity từ §5.
2. Thêm file config Style Dictionary từ §5.1 và chạy build để sinh ra `dist/theme.css` và `dist/tokens.js`.
3. Tạo `packages/tailwind-preset/index.js` import các token được sinh ra và ánh xạ colors sang các CSS variable trong khi nung sẵn các thang đo radius/spacing/shadow.
4. Kết nối `tailwind.config.js` của một app với `presets: [require('@my-monorepo/tailwind-preset')]` và style một card với `bg-background text-foreground rounded-md shadow-md p-md`.
5. Đổi một màu duy nhất trong `tokens.json`, build lại, và xác nhận mọi app tiêu thụ đều cập nhật. (Để xem bản build hoàn chỉnh từ đầu đến cuối đã được lắp ráp đầy đủ, xem **§21**.)
