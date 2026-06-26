# Bộ công cụ Design System: Tokens, Helpers & Rollup Bundler 🛠️

Khi xây dựng một **React Design System** sẵn sàng cho môi trường production, việc viết các component mới chỉ là một nửa chặng đường. Một design system tuyệt vời phụ thuộc vào một nhóm nhỏ các công cụ chuyên biệt phối hợp với nhau để giữ cho việc styling luôn **nhất quán**, **linh hoạt** và **có thể phân phối**. Trong bài học này, chúng ta sẽ đi qua bốn công cụ mà giảng viên hướng dẫn, theo thứ tự:

1. **Style Dictionary** — định nghĩa design tokens một lần duy nhất trong JSON, sau đó biến đổi chúng thành các đầu ra CSS, SCSS và JavaScript.
2. **clsx** — nối các class name theo điều kiện mà không cần ghép chuỗi một cách mong manh, dễ vỡ.
3. **CVA (`class-variance-authority`)** — định nghĩa các variant của component một cách có cấu trúc và an toàn về kiểu (type-safe).
4. **Rollup** — đóng gói thư viện hoàn chỉnh thành ESM + CJS + type definitions.

## 📖 Khái niệm & Tổng quan

> [!NOTE]
> Hãy hình dung một design system giống như một **căn bếp chuyên nghiệp**. **Style Dictionary** là kho nguyên liệu trung tâm — một nguồn dữ liệu gốc duy nhất cho mọi nguyên liệu (màu sắc, spacing, font chữ). **clsx** là người đầu bếp tại quầy quyết định bày những loại trang trí nào lên đĩa dựa trên order. **CVA** là tấm thẻ công thức được chuẩn hóa, đảm bảo mọi món "cay vừa" đều có hương vị giống hệt nhau. Và **Rollup** là dây chuyền đóng gói, đóng hộp món ăn hoàn chỉnh để bất kỳ khách hàng (app) nào cũng có thể hâm nóng lại một cách gọn gàng. Mỗi công cụ giải quyết một nhiệm vụ, và khi kết hợp lại, chúng tạo ra một kết quả đáng tin cậy và có thể lặp lại.

> [!TIP]
> Bạn không cần phải áp dụng cả bốn công cụ cùng một lúc. Chúng độc lập với nhau. Nhưng trong một thư viện component đã hoàn thiện, chúng bổ trợ lẫn nhau: tokens cung cấp dữ liệu cho CSS của bạn, `clsx`/`tailwind-merge` xử lý xung đột class lúc runtime, CVA tổ chức các variant, và Rollup đóng gói tất cả để phân phối.

Đây là cách các mảnh ghép kết hợp với nhau trong pipeline từ khâu viết code đến khâu phân phối:

| Giai đoạn | Công cụ | Đầu vào | Đầu ra |
| :--- | :--- | :--- | :--- |
| **1. Định nghĩa** | Style Dictionary | `*.tokens.json` | CSS vars, SCSS vars, JS objects |
| **2. Kết hợp** | clsx | điều kiện + chuỗi | một chuỗi `className` duy nhất |
| **3. Chuẩn hóa** | CVA | base + cấu hình variant | hàm variant có kiểu |
| **4. Phân phối** | Rollup | `src/index.ts` | `index.cjs`, `index.esm.js`, `index.d.ts` |

---

## 🎨 1. Style Dictionary — Nguồn dữ liệu gốc duy nhất cho Tokens

Một **design token** là quyết định nhỏ nhất và có tên gọi trong một design system: một màu sắc, một mức spacing, một cỡ chữ, một độ đậm font. Thay vì rải rác `#7c3aed` khắp 40 file, bạn đặt tên cho nó một lần (`color.violet`) và tham chiếu đến tên đó ở mọi nơi.

**Style Dictionary** là một build system cho phép designer và developer **định nghĩa, tổ chức và quản lý design tokens trong JSON**, sau đó biến đổi những tokens đó thành nhiều định dạng đầu ra — CSS variables, SCSS variables, JavaScript objects, và thậm chí cả các định dạng Android/iOS.

### Tại sao điều này quan trọng

- **Quản lý tập trung** — tokens nằm trong một nguồn dữ liệu gốc duy nhất (JSON), dễ bảo trì và cập nhật.
- **Đa nền tảng (cross-platform)** — một định nghĩa xuất ra CSS, SCSS, JS và các định dạng native.
- **Khả năng mở rộng** — bạn có thể tùy biến cách xử lý tokens (giá trị được tính toán, các transform tùy chỉnh).
- **Tự động hóa** — việc biến đổi tokens thành code sử dụng được chỉ gói gọn trong một câu lệnh build duy nhất.

### Bước 1: Cài đặt

```bash
# style-dictionary is the core engine; the utils package adds helper functions
npm install style-dictionary style-dictionary-utils
```

### Bước 2: Định nghĩa tokens dưới dạng JSON

Tạo một thư mục `tokens/`. Các file có đuôi `.tokens.json` để cấu hình có thể glob (quét) chúng.

```json
// tokens/color.tokens.json
{
  "color": {
    "violet": { "value": "#7c3aed" },
    "blue":   { "value": "#3b5aff" },
    "green":  { "value": "#1b9981" },
    "red":    { "value": "#ef4444" }
  }
}
```

Bạn thêm các file token khác theo cùng một cách — ví dụ spacing và typography:

```json
// tokens/spacing.tokens.json
{
  "spacing": {
    "xs": { "value": "4px" },
    "sm": { "value": "8px" },
    "md": { "value": "16px" },
    "lg": { "value": "24px" }
  }
}
```

```json
// tokens/typography.tokens.json
{
  "font": {
    "size":   { "sm": { "value": "12px" }, "base": { "value": "16px" }, "lg": { "value": "20px" } },
    "weight": { "normal": { "value": "400" }, "medium": { "value": "500" }, "bold": { "value": "700" } }
  }
}
```

### Bước 3: Cấu hình Style Dictionary

Tạo `config.js` ở thư mục gốc của dự án. Mẫu glob `source` quét mọi file token, và mỗi mục bên dưới `platforms` mô tả một định dạng đầu ra.

```js
// config.js
export default {
  // Grab every token file in the tokens folder
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    // 1) CSS custom properties
    css: {
      transformGroup: 'css',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables', // emits :root { --color-violet: #7c3aed; ... }
        },
      ],
    },
    // 2) SCSS variables
    scss: {
      transformGroup: 'scss',
      buildPath: 'build/scss/',
      files: [
        {
          destination: 'variables.scss',
          format: 'scss/variables', // emits $color-violet: #7c3aed; ...
        },
      ],
    },
    // 3) JavaScript ES6 object
    js: {
      transformGroup: 'js',
      buildPath: 'build/js/',
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6', // emits export const ColorViolet = '#7c3aed'; ...
        },
      ],
    },
  },
};
```

### Bước 4: Thêm một build script và chạy nó

```json
// package.json
{
  "scripts": {
    "build": "style-dictionary build"
  }
}
```

```bash
npm run build
```

Sau khi chạy, thư mục `build/` chứa cả ba định dạng được tạo ra từ cùng một bộ tokens:

```css
/* build/css/variables.css */
:root {
  --color-violet: #7c3aed;
  --color-blue: #3b5aff;
  --color-green: #1b9981;
  --color-red: #ef4444;
  --spacing-md: 16px;
  --font-size-base: 16px;
  --font-weight-bold: 700;
}
```

> [!TIP]
> Muốn có cả đầu ra cho Android hoặc iOS? Hãy thêm một khối platform khác với `transformGroup` phù hợp (ví dụ `android`). Một nguồn JSON duy nhất có thể vận hành cho web app, native app và tài liệu của bạn cùng một lúc — đó chính là sức mạnh thực sự của tokens.

---

## 🔗 2. clsx — Nối Class theo Điều kiện

`clsx` là một tiện ích siêu nhỏ giúp **nối các class name theo điều kiện**. Nó cho phép bạn thêm hoặc bớt các class CSS dựa trên một điều kiện mà không cần ghép chuỗi thủ công hay những mớ toán tử ba ngôi rối rắm.

### Cài đặt

```bash
npm install clsx
```

### Bốn kiểu đối số mà `clsx` hiểu được

```js
// src/index.js
import { clsx } from 'clsx';

// 1) Plain strings are concatenated
clsx('button', 'button-primary');
// -> "button button-primary"

// 2) Inline conditional expression
const isPrimary = true;
clsx('button', isPrimary && 'primary');
// -> "button primary"   (when false -> "button")

// 3) Arrays (falsy entries are dropped)
clsx(['button', 'button-primary', isPrimary && 'active']);
// -> "button button-primary active"

// 4) Objects: key is included only when its value is truthy
const isDisabled = false;
clsx({
  button: true,
  'button-primary': isPrimary,   // included
  'button-disabled': isDisabled, // dropped (false)
});
// -> "button button-primary"
```

> [!WARNING]
> `clsx` chỉ **nối** các chuỗi — nó hoàn toàn không hiểu ý nghĩa của các utility Tailwind. Nếu bạn truyền vào `clsx('px-4', 'px-6')`, bạn sẽ nhận được đúng nguyên văn `"px-4 px-6"`, và thứ tự khai báo trong source CSS sẽ quyết định bên nào thắng. Để class *cuối cùng* thắng khi các utility Tailwind xung đột, hãy kết hợp `clsx` với `tailwind-merge` (xem helper `cn` bên dưới).

### Helper `cn` chuẩn công nghiệp

Trong các thư viện component thực tế (theo một mô hình được `shadcn/ui` phổ biến rộng rãi), `clsx` được kết hợp với **`tailwind-merge`** để vừa nối *vừa* giải quyết xung đột các class Tailwind:

```bash
npm install clsx tailwind-merge
```

```typescript
// src/utils/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// clsx builds the string; twMerge resolves conflicting Tailwind utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```typescript
cn('px-4 py-2 bg-red-500', 'px-6 bg-orange-600');
// Output: "py-2 px-6 bg-orange-600"
// px-4 and bg-red-500 were overwritten and removed — the last class wins.
```

| Tiện ích | Nó làm gì | Hiểu Tailwind? |
| :--- | :--- | :--- |
| `clsx` | Nối chuỗi/mảng/object theo điều kiện | ❌ Không |
| `tailwind-merge` | Giải quyết các utility Tailwind xung đột (cái cuối thắng) | ✅ Có |
| `cn` (cả hai kết hợp) | Nối theo điều kiện **và** giải quyết xung đột | ✅ Có |

> [!TIP]
> Luôn bọc danh sách class của một component trong `cn(...)` và chuyển tiếp `className` của người dùng vào vị trí cuối cùng. Cách này cho người dùng toàn quyền kiểm soát styling trong khi vẫn giữ các giá trị mặc định của bạn ở mức hợp lý.

---

## 🧬 3. CVA — Component Variants An toàn về Kiểu

**CVA** (`class-variance-authority`) là một tiện ích quản lý và áp dụng các class name có điều kiện theo cách **có cấu trúc, tái sử dụng được và an toàn về kiểu (type-safe)**. Nó kết hợp tuyệt vời với các framework utility-first như Tailwind CSS, cho phép bạn định nghĩa các biến thể class dựa trên props hoặc state của component trong khi vẫn giữ cho styling nhất quán.

### Cài đặt

```bash
npm install class-variance-authority
```

### Định nghĩa các variant

Bạn gọi `cva(baseClasses, config)`. Đối số đầu tiên là phần base luôn được áp dụng; `config.variants` mô tả từng trục biến thể; còn `defaultVariants` điền vào bất cứ giá trị nào mà người dùng không truyền.

```tsx
// src/components/button-styles.ts
import { cva } from 'class-variance-authority';

export const buttonStyles = cva(
  // Base classes applied to every button
  'px-4 py-2 rounded-md focus:outline-none',
  {
    variants: {
      // Axis 1: color
      color: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-500 text-black',
      },
      // Axis 2: size
      size: {
        small: 'text-sm py-1 px-3',
        large: 'text-lg py-3 px-6',
      },
      // Axis 3: state
      state: {
        active: 'bg-blue-700',
        disabled: 'bg-gray-300 cursor-not-allowed',
      },
    },
    // Used when a prop is not passed
    defaultVariants: {
      color: 'primary',
      size: 'small',
    },
  }
);
```

### Sử dụng nó bên trong một component (với độ an toàn TypeScript đầy đủ)

```tsx
// src/components/Button.tsx
import { type ReactNode } from 'react';
import { buttonStyles } from './button-styles';

interface ButtonProps {
  color?: 'primary' | 'secondary'; // optional — falls back to defaultVariants
  size?: 'small' | 'large';
  state?: 'active' | 'disabled';
  children: ReactNode;
}

export const Button = ({ color, size, state, children }: ButtonProps) => {
  return (
    <button
      // buttonStyles() returns the resolved class string for these variants
      className={buttonStyles({ color, size, state })}
      disabled={state === 'disabled'}
    >
      {children}
    </button>
  );
};
```

```tsx
// src/App.tsx — consuming the variants
<div className="space-y-4">
  <Button color="primary" size="large" state="active">Primary Large Button</Button>
  <Button color="secondary" size="small">Secondary Small Button</Button>
  <Button color="primary" size="small" state="disabled">Disabled Button</Button>
</div>
```

> [!TIP]
> Bởi vì các key variant đều có kiểu, editor của bạn sẽ tự động gợi ý `color="primary" | "secondary"` và báo lỗi gõ nhầm ngay lúc compile. Hãy kết hợp CVA với helper `cn` để người dùng vẫn có thể truyền thêm một `className` nhằm ghi đè đầu ra của variant.

---

## ⚡ 4. Rollup — Đóng gói Thư viện

Trong khi **Vite** và **Webpack** rất xuất sắc trong việc build *ứng dụng*, **Rollup** lại là tiêu chuẩn vàng để đóng gói các *thư viện* JavaScript — nó tạo ra đầu ra nhỏ gọn, sạch sẽ và có thể tree-shake ở nhiều định dạng module.

| Tính năng | Rollup | Webpack |
| :--- | :--- | :--- |
| **Mục tiêu chính** | Đóng gói thư viện / package | Đóng gói ứng dụng web |
| **Định dạng đầu ra** | ESM, CJS, UMD đồng thời | Tối ưu hóa cho ứng dụng đơn trang (SPA) |
| **Tree Shaking** | Phân tích tĩnh cực kỳ hiệu quả | Tốt, nhưng tạo ra nhiều code bao bọc hơn |
| **Kích thước bundle** | Dung lượng tối giản, đầu ra sạch sẽ | Kèm theo các module loader và code runtime |

### Bước 1: Cài đặt dependencies

```bash
npm install -D rollup rollup-plugin-peer-deps-external @rollup/plugin-node-resolve @rollup/plugin-commonjs @rollup/plugin-typescript rollup-plugin-postcss rollup-plugin-dts typescript postcss
```

### Bước 2: Cấu hình `rollup.config.mjs`

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
      peerDepsExternal(), // Prevents bundling react and react-dom
      resolve(),          // Locates third-party node_modules
      commonjs(),         // Converts CommonJS modules to ES6
      typescript({ tsconfig: './tsconfig.json' }),
      postcss({
        extensions: ['.css'],
        minimize: true,
        inject: true,     // Injects CSS styles directly into DOM
      }),
    ],
  },
  {
    // Bundle type definitions (.d.ts) into a single file
    input: 'dist/esm/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
```

> [!WARNING]
> Việc không sử dụng `rollup-plugin-peer-deps-external` có thể khiến bundle của bạn chứa một bản sao React bị trùng lặp. Khi đó, lúc một consumer import thư viện của bạn, React sẽ ném ra lỗi vi phạm "rules of hooks" do có nhiều instance React cùng chạy trong một app.

### Bước 3: Cấu hình `package.json`

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

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh.

### 1. Style Dictionary giải quyết vấn đề gì, và nguồn dữ liệu gốc duy nhất của nó là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Style Dictionary giải quyết vấn đề các quyết định thiết kế bị trùng lặp, thiếu nhất quán và nằm rải rác khắp codebase. Bạn định nghĩa **design tokens** (màu sắc, spacing, font chữ) một lần duy nhất trong các **file JSON** — nguồn dữ liệu gốc duy nhất — và Style Dictionary biến đổi chúng thành nhiều định dạng đầu ra (CSS variables, SCSS variables, JS objects, các định dạng native) thông qua một câu lệnh build duy nhất. Cập nhật token một lần, build lại, và mọi nền tảng đều được đồng bộ.
</details>

### 2. `tailwind-merge` làm được điều gì mà một mình `clsx` không thể làm?
<details>
  <summary><b>Reveal Answer</b></summary>

  `clsx` chỉ nối các đối số chuỗi/mảng/object theo điều kiện. Nó không hiểu cú pháp utility của Tailwind, nên `clsx('px-4', 'px-6')` xuất ra `"px-4 px-6"`. `tailwind-merge` hiểu các thuộc tính đặc thù của Tailwind và ghi đè `px-4` để ưu tiên `px-6` vì chúng nhắm tới cùng một thuộc tính CSS (padding chiều ngang), đảm bảo class cuối cùng thắng.
</details>

### 3. Trong CVA, mục đích của `defaultVariants` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `defaultVariants` chỉ định các giá trị variant được áp dụng khi người dùng không truyền vào một prop nhất định. Ví dụ, với `defaultVariants: { color: 'primary', size: 'small' }`, việc gọi `buttonStyles({})` vẫn trả về các class primary + small. Điều này giữ cho các prop tùy chọn dễ sử dụng và đảm bảo một diện mạo cơ bản hợp lý.
</details>

### 4. Tại sao chúng ta nên khai báo React trong `peerDependencies` thay vì `dependencies` trong một thư viện?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khai báo React dưới dạng `dependencies` buộc npm cài đặt một bản React riêng biệt bên trong `node_modules` của thư viện. Điều này có thể dẫn đến hai instance React cùng hoạt động trong app của người dùng, làm hỏng rules of hooks. Bằng cách đặt React trong `peerDependencies`, bạn yêu cầu ứng dụng host cung cấp React, qua đó tránh được tình trạng lệch phiên bản và lỗi trùng lặp instance.
</details>

### 5. Sự khác biệt giữa định dạng đầu ra ESM và CJS của Rollup là gì, và tại sao nên ship cả hai?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **ESM (ES Modules)** sử dụng `import`/`export`. Nó là tĩnh (static), cho phép các bundler hiện đại tree-shake code không dùng đến.
  - **CJS (CommonJS)** sử dụng `require()`/`module.exports`. Nó là động (dynamic) và được sử dụng bởi Node.js cùng các build system cũ.

  Việc ship cả hai (cùng với một `.d.ts` được gộp lại qua `rollup-plugin-dts`) tối đa hóa khả năng tương thích: các bundler hiện đại chọn bản ESM có thể tree-shake, còn các công cụ cũ thì quay về dùng CJS.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Pipeline Token của Style Dictionary
1. Tạo một thư mục `style-dict-demo`, chạy `npm init -y`, và `npm install style-dictionary style-dictionary-utils`.
2. Thêm một file `tokens/color.tokens.json` với ít nhất bốn màu (violet, blue, green, red) sử dụng cấu trúc `{ "value": "#hex" }`.
3. Tạo `config.js` với **ba** platform (`css`, `scss`, `js`) như đã trình bày ở trên, và thêm một script `"build": "style-dictionary build"`.
4. Chạy `npm run build` và xác nhận rằng `build/css/variables.css`, `build/scss/variables.scss`, và `build/js/variables.js` đều được tạo ra từ cùng một nguồn.
5. **Nâng cao:** thêm một file `tokens/spacing.tokens.json`, build lại, và xác minh rằng các spacing variable xuất hiện trong cả ba đầu ra mà không cần chỉnh sửa `config.js`.

### 🛠️ Bài tập 2: Xây dựng một `Button` có kiểu với CVA + `cn`
1. Scaffold một app Vite React + TypeScript và thiết lập Tailwind CSS.
2. Cài đặt `class-variance-authority`, `clsx`, và `tailwind-merge`.
3. Tạo helper `cn` trong `src/utils/cn.ts`.
4. Tạo `buttonStyles` với `cva`, định nghĩa các variant `color` (primary/secondary), `size` (small/large), và `state` (active/disabled) cùng với `defaultVariants`.
5. Xây dựng một component `<Button>` có `className` là `cn(buttonStyles({ color, size, state }), className)` để người dùng vẫn có thể ghi đè style.
6. Render ba button trong `App.tsx` (primary-large-active, secondary-small, primary-small-disabled) và xác nhận TypeScript tự động hoàn thành các prop variant.

### 🛠️ Bài tập 3: Thực hành Biên dịch với Rollup
1. Tạo một thư mục tối giản chứa:
   - `src/components/Button.tsx`: một component button đơn giản.
   - `src/index.ts`: export component button.
2. Thêm `rollup.config.mjs` như đã phác thảo ở Bước 2 và các entry point `package.json` tương ứng (`main`, `module`, `types`).
3. Chạy `npm run build` và kiểm tra thư mục `dist/` để xác minh rằng bundle ESM, bundle CJS, và một file `index.d.ts` được gộp lại đều được tạo ra.
