# Xây Dựng Một Design System Cấp Doanh Nghiệp Hoàn Chỉnh 🏛️

Ở các phần trước, bạn đã học cách *sử dụng* các thư viện component có sẵn như DaisyUI và Shadcn/ui. Bây giờ chúng ta đảo ngược góc nhìn và trở thành **người tạo ra** một design system. Các công ty lớn không kéo các utility class ngẫu nhiên vào từng repository — họ phát hành một **nguồn chân lý duy nhất** (single source of truth) được đánh phiên bản cho màu sắc, khoảng cách, bo góc, typography và component, và mọi đội sản phẩm đều sử dụng nó theo đúng một cách giống nhau.

Trong bài học này, chúng ta sẽ xây dựng hệ thống đó từ đầu đến cuối dưới dạng một **monorepo** sử dụng **Yarn workspaces**. Chúng ta tạo ba package: `foundation` (design tokens), `reactjs` (các component sử dụng tokens), và `storybook` (tài liệu sống). Chất keo kỳ diệu là **Style Dictionary**, một công cụ biến đổi token JSON độc lập nền tảng thành CSS, SCSS, JavaScript thực sự, và một **Tailwind preset** có thương hiệu mà mọi component sau đó đều dùng.

---

## ⚡ 1. Khái Niệm & Tổng Quan: Một Nguồn Chân Lý Duy Nhất

Một design system trả lời một câu hỏi đơn giản nhưng tốn kém: *"Màu vàng cảnh báo (warning) chính xác của thương hiệu chúng ta là gì, và làm sao tất cả 40 app của chúng ta đều dùng nó giống hệt nhau?"* Nếu mỗi đội hard-code `#FBBF24`, thì ngày thiết kế đổi thương hiệu, bạn phải lục tìm trong hàng chục repository. Thay vào đó, chúng ta định nghĩa giá trị **một lần** dưới dạng token, và sinh ra mọi thứ khác từ đó.

> [!NOTE]
> Một **design token** là một quyết định thiết kế được đặt tên, độc lập nền tảng, lưu dưới dạng dữ liệu (thường là JSON). `color.warning.500 = "#F59E0B"` là một token. Nó không phải CSS, không phải JS, không phải Swift — nó là *ý định* (intent), và công cụ sẽ biên dịch nó thành từng nền tảng đó. Đây chính là điều cho phép một đội web, một đội iOS, và một plugin Figma luôn đồng bộ hoàn hảo với nhau.

> [!TIP]
> Việc tách monorepo là có chủ đích và được dẫn dắt bởi quan hệ phụ thuộc. `foundation` không biết gì về React. `reactjs` phụ thuộc vào `foundation`. `storybook` phụ thuộc vào **cả hai**. Vẽ đúng mũi tên phụ thuộc này là quyết định kiến trúc quan trọng nhất trong toàn bộ phần này — các tầng thấp hơn không bao giờ được import lên trên.

---

## ⚡ 2. Mô Hình Tư Duy: Một Dây Chuyền Lắp Ráp Trong Nhà Máy 🏭

Hãy hình dung hệ thống như một nhà máy biến nguyên liệu thô thành sản phẩm hoàn thiện:

```
  RAW MATERIAL              MACHINE                 FINISHED GOODS              SHOWROOM
 ┌────────────┐        ┌───────────────┐        ┌──────────────────┐        ┌───────────┐
 │ tokens/*.json │ ──▶ │ Style Dictionary │ ──▶ │ output.css        │ ──▶  │ Storybook │
 │ colors        │      │ (the compiler)  │      │ tokens.scss       │       │ (showroom │
 │ spacing       │      │                 │      │ tokens.js         │       │  of every │
 │ radius        │      │ reads JSON,     │      │ tdp.config.js     │       │  component│
 │ shadow        │      │ emits per-      │      │ (Tailwind preset) │       │  with the │
 │ opacity       │      │ platform code   │      │                   │       │  tokens)  │
 └────────────┘        └───────────────┘        └──────────────────┘        └───────────┘
   @company-ds/foundation                          @company-ds/reactjs         @company-ds/storybook
```

JSON thô không bao giờ được gửi tới trình duyệt. **Style Dictionary** là cỗ máy đọc JSON một lần và dập ra một file CSS, một file SCSS, một JS object, và một Tailwind preset. Các component React được xây dựng bằng Tailwind preset đó (nên lập trình viên viết `company-bg-warning-500`), và Storybook là phòng trưng bày nơi mọi component hoàn thiện được hiển thị.

| Package | Alias | Phụ thuộc vào | Trách nhiệm |
| :--- | :--- | :--- | :--- |
| `foundation` | `@company-ds/foundation` | — | Token JSON + cấu hình Style Dictionary + output sinh ra + Tailwind preset |
| `reactjs` | `@company-ds/reactjs` | `foundation` | Các component React được style bằng các class Tailwind có thương hiệu |
| `storybook` | `@company-ds/storybook` (private) | `foundation` + `reactjs` | Tài liệu trực quan; import `output.css` đã build |

---

## ⚡ 3. Dựng Khung Monorepo Với Yarn Workspaces 🛠️

Chúng ta bắt đầu từ một thư mục rỗng và bật chế độ Yarn hiện đại (Berry), rồi tạo bộ khung package.

```bash
# Opt into the latest Yarn release (Berry, v4+) for this repo
yarn set version berry

# Create the three workspace packages
mkdir -p packages/foundation packages/reactjs packages/storybook

# Initialize each package's package.json
cd packages/foundation && yarn init -y && cd ../..
cd packages/reactjs    && yarn init -y && cd ../..
# Storybook is internal documentation — mark it private so it is never published
cd packages/storybook  && yarn init -y --private && cd ../..
```

Bây giờ báo cho `package.json` ở **root** biết rằng mọi thứ dưới `packages/*` là một workspace, và đặt cho mỗi package một tên alias có scope.

```json
// package.json (root of the monorepo)
{
  "name": "company-design-system",
  "packageManager": "yarn@4.6.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

```json
// packages/foundation/package.json
{ "name": "@company-ds/foundation", "version": "1.0.0" }
```

```json
// packages/reactjs/package.json
{ "name": "@company-ds/reactjs", "version": "1.0.0" }
```

```json
// packages/storybook/package.json
{ "name": "@company-ds/storybook", "version": "1.0.0", "private": true }
```

> [!WARNING]
> Các tên có scope (`@company-ds/...`) không phải để trang trí — các lệnh `yarn workspace <name> add ...` bên dưới nhắm tới package **theo tên**, không phải theo thư mục. Nếu bạn đổi tên, hãy đổi mọi lệnh cho khớp. Hãy chọn prefix thương hiệu thật của bạn một lần và giữ nhất quán.

Nối các mũi tên phụ thuộc bằng lệnh workspace. Yarn liên kết chúng bằng giao thức `workspace:` — không cài qua mạng, chỉ là symlink bên trong repo.

```bash
# Storybook depends on BOTH other packages
yarn workspace @company-ds/storybook add @company-ds/foundation @company-ds/reactjs

# reactjs depends on the tokens in foundation
yarn workspace @company-ds/reactjs add @company-ds/foundation
```

---

## ⚡ 4. Cấu Hình TypeScript Dùng Chung Giữa Các Package

Trong một monorepo, bạn viết các quy tắc compiler nghiêm ngặt **một lần** ở root và cho mỗi package `extends` nó, chỉ ghi đè những gì riêng biệt (baseUrl, outDir, chế độ jsx của nó).

```bash
# Install TypeScript at the root, then into each package as a dev dependency
yarn add -D typescript
yarn workspace @company-ds/foundation add -D typescript
yarn workspace @company-ds/reactjs   add -D typescript
yarn workspace @company-ds/storybook add -D typescript
```

```jsonc
// tsconfig.json (root) — the shared base every package inherits
{
  "compilerOptions": {
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "moduleResolution": "node",
    "isolatedModules": true,
    "downlevelIteration": true,
    "declaration": true,
    "removeComments": false,
    "sourceMap": true,
    "lib": ["esnext", "dom"],
    "baseUrl": ".",
    "paths": {
      // Resolve the scoped alias to each package's built lib folder
      "@company-ds/*": ["packages/*/lib"]
    },
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "noEmitOnError": true,
    "strictFunctionTypes": true
  },
  "exclude": ["node_modules", "**/*.test.*"]
}
```

```jsonc
// packages/reactjs/tsconfig.json — extends the root, adds React-specific options
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "outDir": "./lib",       // built JS + .d.ts land here
    "downlevelIteration": true,
    "target": "esnext",
    "jsx": "react-jsx",       // enable JSX in this package
    "module": "esnext",
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/*.test.*", "lib"]
}
```

> [!TIP]
> Ánh xạ `paths` là `"@company-ds/*": ["packages/*/lib"]` chính là thứ làm cho `import Button from "@company-ds/reactjs"` được giải quyết tới output đã biên dịch khi type-check. Thư mục `lib` là *sản phẩm build* — đừng bao giờ sửa nó bằng tay; nó được tạo lại sau mỗi lần build.

---

## ⚡ 5. Package `foundation`: Design Tokens Dưới Dạng JSON 🎨

Bên trong `packages/foundation/src/tokens/`, chúng ta viết một file JSON cho mỗi nhóm token. Những file này là nơi **duy nhất** mà một giá trị hex thô hay con số pixel được phép tồn tại trong toàn hệ thống.

```bash
yarn workspace @company-ds/foundation add -D style-dictionary
```

```json
// packages/foundation/src/tokens/colors.json
{
  "color": {
    "primary": {
      "50":  { "value": "#EFF6FF" },
      "100": { "value": "#DBEAFE" },
      "500": { "value": "#3B82F6" },
      "900": { "value": "#1E3A8A" },
      "950": { "value": "#172554" }
    },
    "warning": {
      "100": { "value": "#FEF3C7" },
      "500": { "value": "#F59E0B" },
      "900": { "value": "#78350F" }
    },
    "danger":  { "500": { "value": "#EF4444" } },
    "success": { "500": { "value": "#22C55E" } },
    "neutral": { "500": { "value": "#737373" } }
  }
}
```

```json
// packages/foundation/src/tokens/radius.json
{
  "radius": {
    "xs":   { "value": "2px" },
    "sm":   { "value": "4px" },
    "md":   { "value": "8px" },
    "lg":   { "value": "12px" },
    "xl":   { "value": "16px" },
    "full": { "value": "9999px" }
  }
}
```

```json
// packages/foundation/src/tokens/spacing.json
{
  "spacing": {
    "4":  { "value": "4px" },
    "8":  { "value": "8px" },
    "16": { "value": "16px" },
    "24": { "value": "24px" },
    "32": { "value": "32px" }
  }
}
```

```json
// packages/foundation/src/tokens/shadows.json
{
  "shadow": {
    "xs": { "value": "0 1px 2px rgba(0,0,0,0.05)" },
    "sm": { "value": "0 1px 3px rgba(0,0,0,0.1)" },
    "md": { "value": "0 4px 6px rgba(0,0,0,0.1)" },
    "lg": { "value": "0 10px 15px rgba(0,0,0,0.1)" }
  }
}
```

```json
// packages/foundation/src/tokens/opacities.json
{
  "opacity": {
    "opaque":           { "value": "1" },
    "semi-opaque":      { "value": "0.75" },
    "transparent":      { "value": "0.5" },
    "light-transparent":{ "value": "0.25" }
  }
}
```

---

## ⚡ 6. Style Dictionary: Biên Dịch Tokens Thành Code Thực Sự

Style Dictionary đọc mọi file token `*.json` và phát ra một output cho mỗi **platform** mà ta cấu hình. Chúng ta sinh ra ba đích: biến SCSS, CSS custom properties, và một JS object.

```js
// packages/foundation/style-dictionary.config.js
module.exports = {
  // Glob every token JSON file as the single source
  source: ["src/tokens/**/*.json"],
  platforms: {
    // 1) SCSS variables → lib/tokens/scss/tokens.scss
    scss: {
      transformGroup: "scss",
      buildPath: "lib/tokens/scss/",
      files: [
        { destination: "tokens.scss", format: "scss/variables" }
      ]
    },
    // 2) CSS custom properties → lib/tokens/css/tokens.css
    css: {
      transformGroup: "css",
      buildPath: "lib/tokens/css/",
      files: [
        { destination: "tokens.css", format: "css/variables" }
      ]
    },
    // 3) JS object → lib/tokens/js/tokens.js (consumed by the Tailwind preset)
    js: {
      transformGroup: "js",
      buildPath: "lib/tokens/js/",
      files: [
        { destination: "tokens.js", format: "javascript/module" }
      ]
    }
  }
};
```

```json
// packages/foundation/package.json — add the build scripts
{
  "name": "@company-ds/foundation",
  "version": "1.0.0",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "scripts": {
    "build:tokens": "style-dictionary build --config style-dictionary.config.js",
    "build": "yarn build:tokens && tsc"
  }
}
```

```bash
# Run the compiler from inside the foundation package
yarn workspace @company-ds/foundation build:tokens
```

File `tokens.css` được sinh ra sẽ chứa các mục như sau — bằng chứng rằng ý định đã trở thành code thực sự:

```css
/* lib/tokens/css/tokens.css (GENERATED — do not edit) */
:root {
  --color-primary-500: #3B82F6;
  --color-warning-500: #F59E0B;
  --radius-md: 8px;
  --spacing-16: 16px;
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

> [!WARNING]
> Mọi thứ dưới `lib/` đều là **output được sinh ra**. Hãy thêm nó vào `.gitignore` (hoặc commit nó một cách có chủ đích như một sản phẩm phát hành) nhưng **đừng bao giờ sửa tay** — lần chạy `build:tokens` tiếp theo sẽ ghi đè thay đổi của bạn. Hãy sửa JSON trong `src/tokens/` rồi build lại.

---

## ⚡ 7. Sinh Ra Một Tailwind Preset Có Thương Hiệu 🧩

Đây là phần thưởng. Chúng ta đưa các JS token đã biên dịch vào một Tailwind **preset** và thêm một **prefix** (tên thương hiệu của bạn). Prefix là lý do lập trình viên viết `company-bg-warning-500` thay vì `bg-warning-500` thuần — nó đảm bảo các class của design system không bao giờ xung đột với cấu hình Tailwind của đội khác.

```js
// packages/foundation/src/tdp.config.js  (Tailwind Design Preset)
// Require the JS object that Style Dictionary generated.
const tokens = require("./../lib/tokens/js/tokens.js");

// Style Dictionary nests tokens deeply; flatten the leaf "value"s into
// the flat { "warning-500": "#F59E0B" } shape Tailwind's theme expects.
function flattenValues(obj, prefix = "") {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const name = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === "object" && "value" in val) {
      acc[name] = val.value;          // leaf token → keep its value
    } else if (val && typeof val === "object") {
      Object.assign(acc, flattenValues(val, name)); // recurse into nesting
    }
    return acc;
  }, {});
}

module.exports = {
  // Brand prefix → classes become company-bg-..., company-rounded-..., etc.
  prefix: "company-",
  theme: {
    colors:       flattenValues(tokens.color),
    opacity:      flattenValues(tokens.opacity),
    borderRadius: flattenValues(tokens.radius),
    spacing:      flattenValues(tokens.spacing),
    boxShadow:    flattenValues(tokens.shadow),
    fontFamily: {
      sans: ["Inter", "sans-serif"]
    }
  },
  plugins: []
};
```

```json
// packages/foundation/src/index.ts re-exports tokens so they are importable too
```

```typescript
// packages/foundation/src/index.ts
import tokens from "./../lib/tokens/js/tokens.js";
export default tokens;
export { tokens };
```

Sau khi viết preset, hãy build toàn bộ package foundation để `reactjs` có thể sử dụng output đã biên dịch:

```bash
yarn workspace @company-ds/foundation build
```

---

## ⚡ 8. Package `reactjs`: Các Component Sử Dụng Tokens

Cài React (và types) dưới dạng dependency **dev**, nhưng khai báo React là **peer** dependency — app sử dụng sẽ cung cấp React, thư viện của bạn không được đóng gói bản React riêng của mình.

```bash
yarn workspace @company-ds/reactjs add -D react react-dom
yarn workspace @company-ds/reactjs add -D @types/react @types/react-dom
yarn workspace @company-ds/reactjs add -D tailwindcss
```

```json
// packages/reactjs/package.json — peerDependencies + build/watch scripts
{
  "name": "@company-ds/reactjs",
  "version": "1.0.0",
  "main": "lib/index.js",
  "types": "lib/index.d.ts",
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "scripts": {
    "build": "yarn build:css && tsc",
    "watch:css": "npx tailwindcss -i ./src/input.css -o ./lib/output.css --watch",
    "build:css": "npx tailwindcss -i ./src/input.css -o ./lib/output.css"
  }
}
```

Cấu hình Tailwind của package component chỉ đơn giản là **preset** lại preset có thương hiệu đã build trong `foundation`:

```js
// packages/reactjs/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  // Pull in the generated, branded preset from the foundation package
  presets: [require("@company-ds/foundation/lib/tdp.config.js")]
};
```

```css
/* packages/reactjs/src/input.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Giờ một component được style hoàn toàn bằng các class token có thương hiệu — không hex thô, không con số kỳ diệu:

```tsx
// packages/reactjs/src/button.tsx
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({ children, ...props }: ButtonProps) {
  return (
    // Every class is a branded design-system token, e.g. company-bg-warning-500
    <button
      className="company-bg-warning-500 company-px-8 company-py-4 company-rounded-sm company-font-semibold"
      {...props}
    >
      {children}
    </button>
  );
}
```

```typescript
// packages/reactjs/src/index.ts — the package's public surface
export { default as Button } from "./button";
```

```bash
# Build the component package, then watch CSS while developing
yarn workspace @company-ds/reactjs build
yarn workspace @company-ds/reactjs watch:css
```

> [!NOTE]
> `peerDependencies` với `>=16.8.0` nói rằng "Tôi cần React 16.8 trở lên (kỷ nguyên hooks), nhưng *app sử dụng* sở hữu bản cài đặt thực sự." Điều này ngăn lỗi kinh điển có hai bản React trong cùng một bundle, vốn làm hỏng hooks khi chạy.

---

## ⚡ 9. Package `storybook`: Đấu Nối Phòng Trưng Bày

Khởi tạo Storybook bên trong package, rồi cho file preview của nó import `output.css` đã **build** để phòng trưng bày render với chính các style đã biên dịch mà người dùng sẽ nhận được.

```bash
cd packages/storybook
npx storybook@latest init   # choose React + Vite when prompted
cd ../..
```

Bước đấu nối Storybook quan trọng nhất: import CSS đã biên dịch trong `preview.ts`.

```typescript
// packages/storybook/.storybook/preview.ts
import type { Preview } from "@storybook/react";

// Import the COMPILED stylesheet produced by `reactjs` build:css.
// This is why the branded classes (company-bg-warning-500) actually paint.
import "../../reactjs/lib/output.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i } }
  }
};

export default preview;
```

```tsx
// packages/storybook/stories/button.stories.tsx
import { Button } from "@company-ds/reactjs";

export default {
  title: "Components/Button",
  component: Button
};

export const Primary = () => <Button variant="primary">Click me</Button>;
export const Secondary = () => <Button variant="secondary">Click me</Button>;
export const Danger = () => <Button variant="danger">Click me</Button>;
```

```bash
# Launch the living documentation
yarn workspace @company-ds/storybook storybook
```

> [!WARNING]
> Nếu Storybook hiển thị button **không có style**, nguyên nhân gần như luôn là một trong hai điều: (1) `preview.ts` không import `output.css`, hoặc (2) `output.css` chưa từng được build/watch. Hãy chạy `yarn workspace @company-ds/reactjs build:css` và xác nhận `lib/output.css` tồn tại và không rỗng. Một cạm bẫy phổ biến thứ hai: `tailwind.config.js` phải dùng CommonJS `module.exports` (không phải `export default`) để lệnh `require()` preset được giải quyết.

---

## ⚡ 10. Luồng Đầu-Đến-Cuối

```
 designer changes warning yellow
            │
            ▼
 edit src/tokens/colors.json   (the ONE place a hex lives)
            │  yarn workspace @company-ds/foundation build
            ▼
 Style Dictionary regenerates  tokens.css / tokens.scss / tokens.js
            │
            ▼
 tdp.config.js rebuilds the branded Tailwind preset
            │  yarn workspace @company-ds/reactjs build:css
            ▼
 output.css recompiles → every company-bg-warning-500 updates
            │
            ▼
 Storybook (and every consuming app) shows the new color — zero code edits
```

Một lần sửa JSON lan tỏa qua toàn bộ tổ chức. Đó chính là toàn bộ giá trị cốt lõi của một design system cấp doanh nghiệp: **sửa một lần, lan tỏa mọi nơi, được đảm bảo.**

---

## 🧠 Test Your Knowledge

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn. Nhấn **Reveal Answer** để kiểm chứng.

### 1. "Design token" chính xác là gì, và tại sao lưu nó dưới dạng JSON thay vì CSS?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một design token là một quyết định thiết kế được đặt tên, **độc lập nền tảng**, lưu dưới dạng dữ liệu, ví dụ `color.warning.500 = "#F59E0B"`. Lưu nó dưới dạng JSON (thay vì trực tiếp là CSS) nghĩa là giá trị chỉ là *ý định* (intent), tách rời khỏi bất kỳ nền tảng đơn lẻ nào. Một công cụ như Style Dictionary sau đó có thể biên dịch một mục JSON đó thành CSS custom properties, biến SCSS, một JS object, iOS Swift, Android XML, v.v. — giữ web, mobile và công cụ thiết kế đồng bộ hoàn hảo từ một nguồn chân lý duy nhất.
</details>

### 2. Tại sao `storybook` phụ thuộc vào cả `foundation` và `reactjs`, trong khi `foundation` không phụ thuộc cái nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Quan hệ phụ thuộc chỉ được chảy **xuống dưới**. `foundation` là tầng thấp nhất — token thuần với không hiểu biết gì về React hay render, nên nó không phụ thuộc cái gì. `reactjs` sử dụng các token/preset đã biên dịch, nên nó phụ thuộc `foundation`. `storybook` là phòng trưng bày tài liệu hóa các *component* (từ `reactjs`) được style bằng các *token* (từ `foundation`), nên nó phải phụ thuộc cả hai. Nếu một tầng thấp hơn lại import một tầng cao hơn, bạn sẽ tạo ra phụ thuộc vòng (circular dependency) và làm hỏng quá trình build.
</details>

### 3. Vai trò của Style Dictionary trong kiến trúc này là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Style Dictionary là **trình biên dịch / biến đổi**. Nó đọc mọi file token `*.json` một lần (`source: ["src/tokens/**/*.json"]`) và, với mỗi `platform` được cấu hình, phát ra một sản phẩm cụ thể: `css/variables`, `scss/variables`, và `javascript/module`. Nó biến ý định trừu tượng (JSON) thành code thực sự, dùng được cho từng đích. JSON thô không bao giờ gửi tới trình duyệt — chỉ `output.css`/`tokens.js` được sinh ra mới được gửi.
</details>

### 4. Tại sao thêm một brand prefix (ví dụ `company-`) vào các class Tailwind được sinh ra?
<details>
  <summary><b>Reveal Answer</b></summary>

  Prefix được đặt trong Tailwind preset (`prefix: "company-"`), biến `bg-warning-500` thành `company-bg-warning-500`. Nó tạo namespace cho mọi utility class của design system để chúng không thể xung đột với cấu hình Tailwind riêng của app sử dụng hay các class của thư viện khác. Nó cũng làm cho việc dùng design system tự mô tả ngay trong markup — ai đọc JSX cũng thấy ngay class nào đến từ hệ thống chính thức.
</details>

### 5. Tại sao React được khai báo là `peerDependency` (`>=16.8.0`) trong package `reactjs` thay vì một dependency thông thường?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một thư viện không nên đóng gói bản React riêng của nó; **app sử dụng** sở hữu bản cài đặt React. Khai báo `react`/`react-dom` là `peerDependencies` nói rằng "Tôi yêu cầu React 16.8+ (kỷ nguyên hooks) nhưng bạn cung cấp nó." Điều này ngăn lỗi kinh điển có hai instance React khác nhau cùng nằm trong một bundle, vốn khiến hooks ném lỗi "Invalid hook call" khi chạy. Trong lúc phát triển, bạn vẫn cài React dưới dạng `devDependency` để package có thể biên dịch và chạy Storybook cục bộ.
</details>

---

## 💻 Practice Exercises

### 🛠️ Bài Tập 1: Thêm Một Token Hoàn Toàn Mới Và Xem Nó Lan Tỏa
1. Mở `packages/foundation/src/tokens/colors.json` và thêm một thang màu mới, ví dụ `"brand": { "500": { "value": "#7C3AED" } }`.
2. Chạy `yarn workspace @company-ds/foundation build` và xác nhận giá trị xuất hiện trong `lib/tokens/css/tokens.css` dưới dạng `--color-brand-500`.
3. Build lại các component bằng `yarn workspace @company-ds/reactjs build:css`.
4. Trong `button.tsx`, đổi class thành `company-bg-brand-500` và khởi chạy Storybook để xác nhận màu mới được vẽ — mà không hề chạm vào một giá trị hex nào trong component.

### 🧩 Bài Tập 2: Thêm Một Output Nền Tảng Thứ Hai (JSON Cho Một Đội Mobile)
1. Trong `style-dictionary.config.js`, thêm một platform thứ tư tên `json` với `transformGroup: "js"`, `buildPath: "lib/tokens/json/"`, và một file `{ destination: "tokens.json", format: "json/flat" }`.
2. Chạy `yarn workspace @company-ds/foundation build:tokens`.
3. Kiểm tra file `lib/tokens/json/tokens.json` được sinh ra — quan sát cách *cùng* các token nguồn giờ cũng có sẵn dưới dạng JSON phẳng mà một đội iOS/Android native có thể sử dụng.
4. Suy ngẫm: bạn đã thêm một nền tảng người dùng hoàn toàn mới mà không sửa một giá trị token nào. Hãy ghi chú trong một comment lý do điều này chứng minh lợi ích "single source of truth".
