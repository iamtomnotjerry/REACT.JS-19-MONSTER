# Xây dựng & Đóng gói thư viện Component React với CVA + Rollup 📦

Cho tới giờ bạn mới chỉ là *người dùng* các thư viện component như DaisyUI và Shadcn/ui. Trong bài học này bạn đổi vai và trở thành *tác giả*: bạn sẽ tự xây dựng một thư viện component React có thể publish, từ con số không. Bộ công cụ chính là thứ mà các đội design-system chuyên nghiệp thường dùng — **React + TypeScript** cho các component, **class-variance-authority (CVA)** để quản lý variant một cách type-safe, **tailwind-merge** để ghép class mà không xung đột, **Rollup** để đóng gói ra cả CommonJS lẫn ESM (kèm theo các file khai báo kiểu `.d.ts`), **Storybook** để kiểm thử trực quan, và **Vitest + React Testing Library** để viết unit test.

Đến cuối bài, bạn sẽ có một component `Button` với các variant `variant`, `size` và `disabled`, một thư mục `dist/` chứa CJS, ESM cùng các file typings, và đúng những trường `package.json` cần thiết để `npm publish` nó — để bất kỳ ứng dụng nào, của bạn hay của đồng đội, đều có thể `npm install` và import vào dùng.

---

## ⚡ 1. Khái niệm & Tổng quan: Tại sao phải xây dựng một thư viện?

Một thư viện component là một package duy nhất, được đánh phiên bản, chứa toàn bộ UI tái sử dụng của bạn. Thay vì copy-paste một `Button` vào năm ứng dụng khác nhau (rồi phải sửa cùng một lỗi năm lần), bạn publish nó một lần và mọi ứng dụng đều cài cùng một nguồn dữ liệu gốc duy nhất. Cập nhật package, tăng phiên bản, và mọi ứng dụng sử dụng đều nâng cấp chỉ với một lệnh `npm install`.

> [!NOTE]
> Một thư viện **có thể publish** về bản chất khác hẳn một thư mục component nằm trong ứng dụng. Nó phải xuất ra *output đã biên dịch, độc lập framework* (JS thuần mà bất kỳ bundler nào cũng hiểu) cộng với *các file khai báo kiểu* (`.d.ts`) để người dùng TypeScript có autocomplete. Nó cũng phải khai báo React là một **peer dependency** để ứng dụng sử dụng dùng đúng bản React duy nhất của mình — tuyệt đối không bundle React vào trong thư viện.

> [!WARNING]
> Lỗi phổ biến nhất khi viết thư viện là **bundle luôn cả React**. Nếu `dist` của bạn chứa bản React riêng, ứng dụng sử dụng sẽ có *hai* bản React và các hook sẽ crash với lỗi "Invalid hook call." Cách khắc phục là dùng plugin `rollup-plugin-peer-deps-external` cộng với một mục `peerDependencies` — cả hai đều được trình bày bên dưới.

> [!TIP]
> Hãy hình dung thư viện của bạn như một **nhà máy đóng hộp thực phẩm**. Gian bếp của bạn (phần `src/` gồm TypeScript + JSX) thì bừa bộn và dùng những dụng cụ mà khách hàng không có. Rollup chính là *dây chuyền đóng hộp*: nó nấu công thức thành một lon đã niêm phong (`dist/`) mà bất kỳ gian bếp nào cũng mở được — có dán nhãn thành phần (các kiểu `.d.ts`) và đóng dấu "cần một cái bếp đang hoạt động" (peer dependency React).

---

## 🧩 2. Thiết lập dự án

Tạo một thư mục mới tinh, khởi tạo Git và npm, rồi thêm React + TypeScript làm công cụ phát triển.

```bash
# Create and enter the project
mkdir my-components-library
cd my-components-library

# Initialize git and the package manifest
git init
npm init -y

# React + TypeScript live in devDependencies for a library
# (React itself becomes a *peer* dependency later — see package.json)
npm i -D react react-dom typescript @types/react @types/react-dom
```

Thêm một file `.gitignore` để không commit các sản phẩm build và dependency:

```bash
# .gitignore
node_modules
dist
.rollup.cache
```

Tạo cấu trúc thư mục nguồn. Một thư viện gọn gàng sẽ dùng **barrel file** (`index.ts`) để người dùng có thể viết `import { Button } from "my-components-library"` thay vì những đường dẫn sâu.

```
my-components-library/
├── src/
│   ├── index.ts                     # root barrel: re-exports everything
│   └── components/
│       ├── index.ts                 # components barrel
│       └── button/
│           ├── index.ts             # button barrel
│           └── Button.tsx           # the actual component
├── package.json
├── tsconfig.json
└── rollup.config.js
```

Bây giờ khởi tạo và cấu hình TypeScript cho một bản *phân phối* (chú ý nhấn mạnh vào việc xuất ra các file khai báo):

```bash
npx tsc --init
```

```json
// tsconfig.json — tuned for building a library, not running an app
{
  "compilerOptions": {
    "target": "ESNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "rootDir": ".",
    "jsx": "react",
    "module": "ESNext",
    "declaration": true,              // emit .d.ts type files
    "declarationDir": "types",        // where declarations go before bundling
    "sourceMap": true,
    "outDir": "dist",                 // build output
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "emitDeclarationOnly": true       // Rollup compiles JS; tsc only emits types
  }
}
```

> [!NOTE]
> `emitDeclarationOnly: true` là thiết lập then chốt của thư viện. Ta để **Rollup** (qua plugin TypeScript của nó) lo phần biên dịch JavaScript, còn `tsc` chỉ sinh ra các file `.d.ts`. Việc này tránh để hai đường ống biên dịch cạnh tranh nhau cùng xuất ra một mã JavaScript.

---

## ⚡ 3. CVA — Quản lý variant type-safe (đào sâu)

**class-variance-authority (CVA)** giải quyết một nỗi đau có thật: khi một component lớn dần, logic `className` của nó thoái hóa thành một mớ ternary chằng chịt. CVA cho phép bạn khai báo các variant dưới dạng một object có cấu trúc, và trả về một hàm ánh xạ props → chuỗi class.

```bash
npm i class-variance-authority tailwind-merge
```

Về mặt tư duy, hãy hình dung `cva()` như một bảng tra cứu:

```
cva( BASE_CLASSES , {
        variants: {                 <-- the dimensions a component varies along
          variant: { primary, secondary },
          size:    { sm, md, lg },
          disabled:{ true: "..." }
        },
        defaultVariants: { ... }    <-- values used when a prop is omitted
} )
        │
        ▼
  styleFn({ variant:"primary", size:"lg" })  ──►  "base primary-classes lg-classes"
```

So sánh cách làm "trước CVA" và "với CVA":

| Khía cạnh | Ternary thủ công | CVA |
| :--- | :--- | :--- |
| Dễ đọc | `cn(base, v==='primary'&&'...', v==='secondary'&&'...')` — phình theo cấp số nhân | Object khai báo phẳng, mỗi tùy chọn một mục |
| Giá trị mặc định | Các fallback `?? 'primary'` rải rác khắp nơi | Khối `defaultVariants` duy nhất, một nguồn |
| An toàn kiểu | Chuỗi không có kiểu — gõ sai vẫn biên dịch được | `VariantProps<typeof styleFn>` tự suy ra kiểu cho props |
| Thêm một size | Phải sửa mọi ternary | Thêm một khóa vào `size` |

Đây là cấu hình variant của Button. Ta lưu kết quả của `cva()` vào `buttonStyles`:

```tsx
// src/components/button/Button.tsx
import React from "react";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// buttonStyles is a function: pass it variant/size/disabled, get a class string
const buttonStyles = cva(
  // 1) BASE classes — always applied, regardless of variant
  "px-4 py-2 rounded focus:outline-none",
  {
    // 2) VARIANTS — each key is a dimension the button varies along
    variants: {
      variant: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-500 text-black",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      disabled: {
        true: "bg-gray-300 text-gray-600 cursor-not-allowed",
      },
    },
    // 3) DEFAULTS — used when the prop is not passed
    defaultVariants: {
      variant: "primary",
      size: "md",
      disabled: false,
    },
  }
);
```

---

## ⚡ 4. tailwind-merge — Giải quyết xung đột class

Có một vấn đề tinh tế ở đây: chuyện gì xảy ra nếu người dùng truyền `className="bg-red-500"` của riêng họ để ghi đè `bg-blue-500` mặc định của bạn? Nối chuỗi một cách ngây thơ sẽ cho ra `"bg-blue-500 ... bg-red-500"` — **cả hai** class đều nằm trong chuỗi, và class nào thắng phụ thuộc vào thứ tự khai báo CSS chứ không phải ý định của tác giả. Điều đó rất mong manh.

`tailwind-merge` hiểu các nhóm class của Tailwind: khi nó thấy hai class cùng nhóm (hai `bg-*`, hai `text-*`, hai `px-*`), nó chỉ giữ lại **class cuối cùng**. Nhờ vậy, bản ghi đè của người dùng luôn thắng một cách đáng tin cậy.

```tsx
// Continuing Button.tsx — the component itself

// The component accepts native button attributes PLUS our variant props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  disabled,
  children,
  className,           // consumer-supplied overrides
  ...props             // rest: onClick, type, aria-*, etc.
}) => {
  // twMerge takes the CVA output FIRST, then className LAST so overrides win
  const mergedClassNames = twMerge(
    buttonStyles({ variant, size, disabled }),
    className
  );

  return (
    <button className={mergedClassNames} disabled={disabled} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

> [!TIP]
> Thứ tự trong `twMerge` rất quan trọng. Đặt các class do thư viện sinh ra trước, và `className` của người dùng sau cùng. `tailwind-merge` giải quyết xung đột từ trái sang phải, nên thứ xuất hiện sau sẽ thắng — đúng hành vi "người dùng ghi đè giá trị mặc định của thư viện" mà bạn mong muốn.

Kết nối các barrel file để component được export ra từ gốc package:

```ts
// src/components/button/index.ts
export { default } from "./Button";
```

```ts
// src/components/index.ts
export { default as Button } from "./button";
```

```ts
// src/index.ts — the package entry point
export * from "./components";
```

---

## 🛠️ 5. Rollup — Đóng gói ra CJS + ESM + Types

**Rollup** là bundler biến `src/` thành `dist/` có thể ship được. Ta cài Rollup cùng một bộ plugin, mỗi cái đảm nhận một nhiệm vụ.

```bash
npm i -D rollup \
  @rollup/plugin-node-resolve \
  @rollup/plugin-commonjs \
  @rollup/plugin-typescript \
  @rollup/plugin-terser \
  rollup-plugin-peer-deps-external \
  rollup-plugin-postcss \
  rollup-plugin-dts
```

Nhiệm vụ của từng plugin:

| Plugin | Trách nhiệm |
| :--- | :--- |
| `rollup-plugin-peer-deps-external` | Đánh dấu các `peerDependencies` (React) là *external* để chúng **không** bị bundle — ngăn lỗi trùng lặp hai bản React |
| `@rollup/plugin-node-resolve` | Cho phép Rollup tìm các module trong `node_modules` (ví dụ `tailwind-merge`) |
| `@rollup/plugin-commonjs` | Chuyển các dependency CommonJS sang ESM để Rollup xử lý được |
| `@rollup/plugin-typescript` | Biên dịch `.tsx`/`.ts` sang JavaScript trong lúc build |
| `rollup-plugin-postcss` | Xử lý và nội tuyến các import CSS (cần thiết vì ta dùng Tailwind) |
| `@rollup/plugin-terser` | Nén nhỏ (minify) JS đầu ra để bundle gọn hơn |
| `rollup-plugin-dts` | Một **lượt chạy thứ hai** gom tất cả file `.d.ts` thành một `dist/index.d.ts` duy nhất |

File cấu hình export ra một **mảng gồm hai bản build**: bản thứ nhất xuất ra cả JavaScript CJS lẫn ESM; bản thứ hai đóng gói các file khai báo kiểu.

```js
// rollup.config.js
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";

// We read our own package.json to reuse its output paths
import packageJson from "./package.json" assert { type: "json" };

export default [
  // ── Pass 1: bundle the JavaScript (dual CJS + ESM output) ──
  {
    input: "src/index.ts",            // single entry that re-exports everything
    output: [
      {
        file: packageJson.main,       // "dist/cjs/index.js" — for Node/CommonJS
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,     // "dist/esm/index.js" — for modern bundlers
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      peerDepsExternal(),             // keep React out of the bundle
      resolve(),                      // resolve node_modules imports
      commonjs(),                     // convert CJS deps to ESM
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss(),                      // handle Tailwind/CSS imports
      terser(),                       // minify
    ],
    // do not bundle these even if imported
    external: ["react", "react-dom"],
  },

  // ── Pass 2: roll all .d.ts files into one declaration file ──
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    // CSS imports have no types — tell dts to ignore them
    external: [/\.css$/],
  },
];
```

> [!WARNING]
> Hai lượt chạy phải diễn ra theo thứ tự: Lượt 1 (và `tsc`) phải sinh ra các file `.d.ts` trung gian **trước khi** Lượt 2 có thể gom chúng lại. Rollup chạy các mục trong mảng tuần tự, nên chỉ một lệnh `rollup -c` lo cả hai — chỉ cần chắc chắn đường dẫn `declarationDir`/types của bạn khớp với `input` của Lượt 2.

---

## 🧩 6. package.json — Điểm vào, Files & Peer Dependencies

`package.json` là bản hợp đồng cho npm và các bundler sử dụng biết *tìm cái gì ở đâu*. Chính những trường này khiến thư viện của bạn thực sự import được sau khi cài.

```json
{
  "name": "my-components-library",
  "version": "1.0.0",
  "description": "A reusable React component library",
  "type": "module",
  "main": "dist/cjs/index.js",        // CommonJS entry (require / older tooling)
  "module": "dist/esm/index.js",      // ESM entry (import / modern bundlers)
  "types": "dist/index.d.ts",         // TypeScript declarations entry
  "files": ["dist"],                  // ONLY ship the dist folder to npm
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "scripts": {
    "rollup": "rollup -c --bundleConfigAsCjs"
  },
  "keywords": ["react", "components", "ui"],
  "peerDependencies": {
    "react": "^18 || ^19",            // consumer must already have React 18+
    "react-dom": "^18 || ^19"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

| Trường | Vì sao quan trọng |
| :--- | :--- |
| `main` | Điểm vào cho CommonJS (`require`) và các toolchain cũ |
| `module` | Điểm vào cho ESM (`import`); các bundler hiện đại ưu tiên nó để tree-shaking |
| `types` | Nơi TypeScript tìm các file khai báo — thiếu nó thì người dùng không có autocomplete |
| `files` | Danh sách trắng những gì `npm publish` tải lên; `["dist"]` giữ `src` và file cấu hình ở ngoài package |
| `exports` | Bản đồ điểm vào hiện đại, tường minh theo từng điều kiện (`import`/`require`/`types`) |
| `peerDependencies` | "Bạn, người dùng, phải cung cấp React" — ngăn bundle thêm một bản React thứ hai |

Giờ build:

```bash
npm run rollup
```

Bạn sẽ có một thư mục `dist/` chứa `cjs/index.js`, `esm/index.js` và `index.d.ts` — output sẵn sàng cho production. Để ship công khai:

```bash
npm login          # authenticate with your npm account
npm publish        # uploads only the dist folder (per "files")
```

---

## ⚡ 7. Kiểm thử trực quan với Storybook (autodocs)

Storybook render từng component một cách biệt lập để bạn có thể nhìn tận mắt mọi variant. Khởi tạo nó và chọn builder **Vite** khi được hỏi.

```bash
npx storybook@latest init
# If it errors about a missing builder, install Vite + React explicitly:
npm i -D react react-dom vite
npm run storybook
```

Xóa các story demo mà Storybook sinh ra và viết của riêng bạn. Quan trọng nhất, hãy import file Tailwind CSS của bạn trong `.storybook/preview.ts` để các class thực sự được render:

```ts
// .storybook/preview.ts
import "../src/index.css";   // your Tailwind entry — without this, styles are missing
```

```tsx
// src/stories/Button.stories.tsx
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],            // auto-generate a documentation page
};

export default meta;
type Story = StoryObj<typeof meta>;

// Each export becomes an interactive story in the Storybook sidebar
export const Primary: Story = {
  args: { variant: "primary", size: "md", children: "Primary Button" },
};

export const Secondary: Story = {
  args: { variant: "secondary", size: "md", children: "Secondary Button" },
};

export const Small: Story = {
  args: { variant: "primary", size: "sm", children: "Small Button" },
};

export const Large: Story = {
  args: { variant: "primary", size: "lg", children: "Large Button" },
};

export const Disabled: Story = {
  args: { variant: "primary", size: "md", disabled: true, children: "Disabled Button" },
};
```

> [!TIP]
> Dòng `tags: ["autodocs"]` bảo Storybook tự sinh ra một trang Docs — nó đọc các kiểu props TypeScript của bạn và liệt kê mọi prop, kèm kiểu của nó và giá trị mặc định. Đó là tài liệu miễn phí, luôn chính xác cho người dùng thư viện của bạn.

---

## 🛠️ 8. Unit test với Vitest + React Testing Library

Storybook chứng minh component *trông* đúng; unit test chứng minh nó *hoạt động* đúng và bảo vệ chống lại hồi quy. Cài Vitest và các thư viện kiểm thử:

```bash
npm i -D vitest @testing-library/react @testing-library/user-event \
  @testing-library/jest-dom jsdom @vitejs/plugin-react @types/jest
```

Cấu hình Vitest với môi trường `jsdom` (một DOM trình duyệt giả lập) và một file setup:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",          // simulate a browser DOM in Node
    globals: true,                 // use describe/it/expect without imports
    setupFiles: "src/test/setup.ts",
  },
});
```

```ts
// src/test/setup.ts — extends expect() with DOM matchers like toHaveClass
import "@testing-library/jest-dom";
```

Thêm script và các kiểu của Vitest vào các file cấu hình:

```json
// package.json scripts
"test:ui": "vitest --ui"
```

```json
// tsconfig.json — so TS knows about expect/describe globals
"types": ["vitest/globals"]
```

Giờ viết test cho Button. Matcher then chốt là `toHaveClass`, nó khẳng định ánh xạ CVA đã sinh ra đúng các class Tailwind:

```tsx
// src/test/components/Button.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import Button from "../../components/button/Button";

describe("Button component", () => {
  it("should render a button with default styles", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveTextContent("Click Me");
    // defaultVariants → primary + md
    expect(button).toHaveClass("bg-blue-500");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("text-base");
    expect(button).not.toBeDisabled();
  });

  it("should render a button with secondary variant", () => {
    render(<Button variant="secondary">Click Me</Button>);
    const button = screen.getByRole("button");

    expect(button).toHaveClass("bg-gray-500");
    expect(button).toHaveClass("text-black");
  });

  it("should render a button with small size", () => {
    render(<Button size="sm">Click Me</Button>);
    expect(screen.getByRole("button")).toHaveClass("text-sm");
  });

  it("should render a disabled button", () => {
    render(<Button disabled>Click Me</Button>);
    const button = screen.getByRole("button");

    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-gray-300");
    expect(button).toHaveClass("text-gray-600");
  });

  it("should merge custom className with default styles", () => {
    render(<Button className="custom-class">Click Me</Button>);
    const button = screen.getByRole("button");

    // both the override AND the surviving default are present
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-blue-500");
  });
});
```

Chạy nó:

```bash
npm run test:ui
```

Cả năm test đều phải pass — xác nhận rằng các variant, size, trạng thái disabled và phép ghép của `tailwind-merge` đều hoạt động. Giờ bạn đã có một component được *build*, *bundle*, *kiểm thử trực quan* và *unit test* đầy đủ.

---

## 🧠 Kiểm tra kiến thức của bạn

### 1. Tại sao React phải là một `peerDependency` thay vì một `dependency` thông thường của thư viện?
<details>
  <summary><b>Reveal Answer</b></summary>

  React dựa vào trạng thái singleton nội bộ (dispatcher của hooks). Nếu thư viện của bạn bundle bản React riêng dưới dạng `dependency` thông thường, ứng dụng sử dụng sẽ có **hai bản React** — và mọi lời gọi hook từ component của bạn sẽ ném ra lỗi "Invalid hook call." Khai báo React dưới `peerDependencies` bảo npm rằng "ứng dụng sử dụng phải tự cung cấp React," nên cả ứng dụng lẫn thư viện của bạn dùng *cùng một bản* React duy nhất. Plugin `rollup-plugin-peer-deps-external` thực thi điều này lúc build bằng cách đánh dấu các peer dependency là external (không bundle).
</details>

### 2. `tailwind-merge` giải quyết vấn đề gì mà việc nối chuỗi thông thường không giải quyết được?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nối chuỗi thông thường có thể để lại các class *xung đột* cùng một nhóm Tailwind trong chuỗi cuối cùng (ví dụ cả `bg-blue-500` lẫn `bg-red-500`). Khi đó class nào thắng do thứ tự khai báo CSS quyết định, chứ không phải ý định tác giả — mong manh và khó lường. `tailwind-merge` hiểu các nhóm class của Tailwind và chỉ giữ lại class **cuối cùng** của mỗi nhóm xung đột. Bằng cách truyền các class do thư viện sinh ra trước và `className` của người dùng sau cùng, bản ghi đè của người dùng sẽ thắng một cách đáng tin cậy.
</details>

### 3. Tại sao file cấu hình Rollup lại export ra một mảng gồm hai object cấu hình?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hai object là hai lượt build riêng biệt. **Lượt 1** đóng gói JavaScript thực sự và xuất ra cả output CommonJS (`dist/cjs/index.js`, cho `require`/toolchain cũ) lẫn output ESM (`dist/esm/index.js`, cho các bundler hiện đại có tree-shaking). **Lượt 2** dùng `rollup-plugin-dts` để gom tất cả file `.d.ts` trung gian thành một `dist/index.d.ts` duy nhất, để người dùng TypeScript có một file khai báo sạch sẽ. Rollup chạy các mục trong mảng theo thứ tự, nên việc xuất kiểu của Lượt 1 diễn ra trước khi Lượt 2 sử dụng chúng.
</details>

### 4. Vai trò của `defaultVariants` trong một cấu hình CVA là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `defaultVariants` chỉ định giá trị variant nào được áp dụng khi prop tương ứng bị **bỏ qua** bởi người dùng. Trong Button của ta, `defaultVariants: { variant: "primary", size: "md", disabled: false }` nghĩa là `<Button>Hi</Button>` render thành một button primary, medium, đang bật mà người dùng không cần truyền gì cả. Nó tập trung các giá trị mặc định vào một chỗ thay vì rải rác các fallback `?? "primary"` khắp component.
</details>

### 5. Trong `package.json`, khác biệt giữa `main`, `module` và `types` là gì, và tại sao phải có cả ba?
<details>
  <summary><b>Reveal Answer</b></summary>

  `main` trỏ tới bundle CommonJS (`dist/cjs/index.js`) được dùng bởi `require()` và các toolchain cũ. `module` trỏ tới bundle ESM (`dist/esm/index.js`); các bundler hiện đại ưu tiên nó vì ESM cho phép tree-shaking. `types` trỏ tới file khai báo TypeScript (`dist/index.d.ts`) để người dùng TypeScript có kiểm tra kiểu và autocomplete. Có cả ba (hoặc bản đồ `exports` tương đương) nghĩa là thư viện của bạn hoạt động đúng dù được import qua `require` hay `import`, trong JS hay trong TS — tối đa hóa khả năng tương thích trên mọi môi trường sử dụng.
</details>

---

## 💻 Bài tập thực hành

### 🛠️ Bài tập 1: Thêm variant `danger` và size `xl`
1. Trong `Button.tsx`, mở rộng cấu hình CVA: thêm `danger: "bg-red-500 text-white"` vào map `variant` và `xl: "text-xl"` vào map `size`.
2. Cập nhật các union type của interface `ButtonProps` để bao gồm các tùy chọn mới (`"danger"` và `"xl"`).
3. Thêm các story Storybook `Danger` và `ExtraLarge` để thử nghiệm chúng, rồi kiểm chứng trực quan với `npm run storybook`.
4. Thêm các test Vitest khẳng định `toHaveClass("bg-red-500")` và `toHaveClass("text-xl")`. Chạy `npm run test:ui` và xác nhận chúng pass.

### 🛠️ Bài tập 2: Build, kiểm tra và sử dụng package cục bộ
1. Chạy `npm run rollup` và mở thư mục `dist/`. Xác nhận bạn có `cjs/index.js`, `esm/index.js` và `index.d.ts`. Mở `index.d.ts` và kiểm chứng kiểu `ButtonProps` có mặt.
2. Từ thư mục thư viện chạy `npm pack` — lệnh này tạo ra một file `.tgz` chứa đúng những gì `npm publish` sẽ tải lên. Liệt kê nội dung của nó và xác nhận chỉ có `dist` (không có `src`) được bao gồm, tuân theo trường `files`.
3. Trong một ứng dụng React thử nghiệm riêng, chạy `npm i ../my-components-library/my-components-library-1.0.0.tgz`, rồi `import { Button } from "my-components-library"` và render `<Button variant="primary">Hello</Button>`. Xác nhận các style hiện ra và TypeScript autocomplete được prop `variant` — chứng minh bản hợp đồng đã publish của bạn hoạt động trọn vẹn từ đầu đến cuối.
