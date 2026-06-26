# Shadcn/ui: CLI, Quyền sở hữu & Tùy biến 🧩

Trong bài học trước bạn đã làm quen với **DaisyUI** (chỉ CSS), **Radix UI** (hành vi headless), và nếm trải lần đầu với **Shadcn/ui**. Bài học này phóng to hết cỡ vào Shadcn/ui — bộ công cụ React UI phổ biến nhất hiện nay — và vào một ý tưởng khiến nó thực sự khác biệt so với mọi thư viện trước đó: **bạn không cài đặt Shadcn/ui như một dependency. Bạn sao chép mã nguồn của nó vào repository của chính mình và sở hữu nó mãi mãi.**

Chúng ta sẽ đi qua chính xác những gì `npx shadcn@latest init` ghi ra đĩa (`components.json`, helper `cn()`, và các theme token dạng CSS-variable), những gì `npx shadcn@latest add button` tải về, cách `Button` được sinh ra được dựng từ **CVA + Radix `Slot` + `cn()`**, cách tùy biến nó bằng cách chỉnh sửa trực tiếp mã nguồn và thêm các CVA variant của riêng bạn, cách theming hoạt động thông qua CSS variables (sáng/tối), và cuối cùng mô hình "quyền sở hữu" này so sánh ra sao với mô hình "nâng cấp-qua-npm" của DaisyUI.

> [!NOTE]
> Khóa học được ghi hình cho thấy giảng viên chạy shadcn CLI, chọn style **New York** với base color **neutral**, trả lời **yes** cho CSS variables, rồi thêm `button`, `card`, `input`, `label`, và `select`. Mọi thứ trong bài học viết này đều dựa trên buổi hướng dẫn đó, nhưng được mở rộng bằng các best practice hiện hành — bao gồm kỷ nguyên React 19 / Tailwind v4 nơi CLI không còn yêu cầu bạn tự tay chỉnh sửa `tailwind.config.js`. Ở những chỗ một chủ đề vượt ra ngoài những gì video thực sự cho thấy (ví dụ phần nội tại của `Button` được sinh ra, các CVA variant tùy chỉnh, cách đấu nối dark-mode), hãy xem đó như một phần diễn giải sâu hơn, chính xác của cùng một luồng.

---

## ⚡ 1. Khái niệm & Tổng quan: Sở hữu, Không phải Phụ thuộc

Gần như mọi thư viện UI bạn từng dùng đều tuân theo cùng một giao ước: bạn `npm install` một package, bạn `import { Button } from "the-library"`, và mã nguồn thực sự nằm — bị niêm phong và không thể chỉnh sửa — bên trong `node_modules/`. Khi nhóm bảo trì phát hành một bản sửa lỗi, bạn nâng version và `npm install` lại. Bạn **thuê** các component.

Shadcn/ui đảo ngược điều này. Không có package runtime `@shadcn/ui` nào trong `dependencies` của bạn. Thay vào đó, một **CLI** kết nối tới một registry, tải mã nguồn `.tsx` của component bạn yêu cầu, và ghi nó thẳng vào `src/components/ui/`. Từ khoảnh khắc đó file là *của bạn*: nó là TypeScript + React thuần trong repo của bạn, nó xuất hiện trong các Git diff của bạn, và bạn có thể chỉnh một tên class duy nhất hoặc xé toang toàn bộ. Bạn **sở hữu** các component.

### 🏠 Một Phép Ẩn Dụ Thực Tế

| Mô hình | Ẩn dụ thực tế | "Nâng cấp" nghĩa là gì |
| :--- | :--- | :--- |
| **Dependency đi thuê** (MUI, Chakra, DaisyUI) | Thuê một căn hộ đầy đủ nội thất. Chủ nhà sở hữu chiếc ghế sofa; bạn không thể cưa chân nó, nhưng nếu nó hỏng thì chủ nhà thay. | `npm update` — chủ nhà đổi nội thất; bạn không làm gì cả. |
| **Mã nguồn sở hữu** (Shadcn/ui) | Mua bộ nội thất lắp ráp và ráp nó trong *chính* nhà bạn. Khoảnh khắc bạn vặn vít xong thì nó là của bạn — sơn lại, khoan lỗ mới, đổi bản lề. | Bạn chạy lại CLI cho các phần *mới*; với các phần bạn đã sở hữu và đã chỉnh, **bạn** quyết định có hợp nhất các thay đổi upstream hay không. |

Sự đánh đổi duy nhất đó — từ bỏ nâng cấp tự động, đổi lấy toàn quyền kiểm soát — chính là toàn bộ tính cách của Shadcn/ui. Phần còn lại của bài học này là cơ chế vận hành.

> [!TIP]
> Mô hình tư duy hữu ích nhất: **Shadcn/ui là một cuốn sách công thức và một con robot giao mã, không phải một thiết bị nhà bếp.** Con robot (CLI) thả một món ăn hoàn chỉnh, được dựng tốt (mã nguồn component) lên quầy bếp của bạn. Sau đó, món ăn là thức ăn trên đĩa của bạn — nêm nếm tùy ý.

---

## 🧩 2. Những gì CLI Ghi ra: `init`

Việc thiết lập bắt đầu với một lệnh, chạy ở thư mục gốc của một dự án React + TypeScript hiện có (khóa học dùng một app Vite + React + TS):

```bash
# Run inside your project root
npx shadcn@latest init
```

Trình hướng dẫn init hỏi vài câu. Trong khóa học giảng viên chọn style **New York**, base color **neutral**, và trả lời **yes** cho CSS variables. Trên các thiết lập hiện đại (Tailwind v4 + React 19) các câu hỏi rút gọn lại đại khái còn:

```text
? Which style would you like to use?      › New York
? Which color would you like as base?     › Neutral
? Where is your global CSS file?          › src/index.css
? Do you want to use CSS variables?       › yes
```

> [!NOTE]
> Trong các thiết lập Tailwind v3 cũ hơn (thứ video ghi lại) bạn còn phải đảm bảo `tailwind.config.js` tồn tại trước, dán một glob `content` và các directive `@tailwind` vào CSS của bạn, và đặt `baseUrl` + `paths` trong `tsconfig.json` để alias `@/` phân giải được. Với **Tailwind v4** CLI xử lý việc đấu nối CSS giúp bạn và không có `tailwind.config.js` nào để tự tay chỉnh sửa — cấu hình nằm trong CSS thông qua `@theme`. Giảng viên gặp lỗi "No Tailwind CSS configuration found" chính vì Tailwind chưa được thiết lập *trước* khi `init`; cách khắc phục là cấu hình Tailwind trước, rồi chạy lại `init`.

### Ba thứ mà `init` tạo ra

```text
your-project/
├── components.json          ← (NEW) the CLI's config: style, aliases, paths
├── src/
│   ├── index.css            ← (EDITED) theme tokens added as CSS variables
│   ├── lib/
│   │   └── utils.ts         ← (NEW) the cn() helper
│   └── components/
│       └── ui/              ← (NEW, empty for now) future components land here
```

**1) `components.json`** — bản kê khai mà CLI đọc ở mỗi lần `add` về sau. Nó ghi lại style bạn đã chọn, việc bạn có dùng CSS variables hay không, file CSS entry của Tailwind, và các import alias.

```json
// components.json — generated by `init`, read by every later `add`
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**2) `src/lib/utils.ts`** — helper `cn()`. Mọi component được sinh ra đều import nó. Nó kết hợp `clsx` (nối class có điều kiện) với `tailwind-merge` (giải quyết xung đột), nên class Tailwind xung đột *cuối cùng* sẽ thắng.

```typescript
// src/lib/utils.ts — created by `init`
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn = "class names". It does two jobs in one call:
//   1. clsx flattens arrays/objects/conditionals into a single string,
//      dropping falsy values: cn("a", false && "b", ["c"]) -> "a c"
//   2. twMerge then de-duplicates *conflicting* Tailwind utilities,
//      keeping the last one: cn("px-2", "px-4") -> "px-4"
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

> [!TIP]
> `cn()` là lý do vì sao một bên tiêu dùng có thể ghi đè an toàn các giá trị mặc định của một component được sinh ra. Vì component thực hiện `cn(buttonVariants({ variant }), className)`, `className="bg-red-500"` bạn truyền vào nằm *sau* `bg-primary` của variant và `tailwind-merge` giữ lại của bạn. Không cần `!important`, không có cuộc chiến độ ưu tiên (specificity).

**3) Các theme token dạng CSS-variable** — `init` ghi một bảng màu các design token vào CSS toàn cục của bạn dưới dạng CSS custom property, kèm một bộ riêng nằm dưới selector `.dark`. Đây là các màu được đặt tên (`--primary`, `--background`, `--destructive`, …) mà mọi component được sinh ra tham chiếu thông qua các class Tailwind như `bg-primary` và `text-primary-foreground`.

```css
/* src/index.css — tokens added by `init` (Tailwind v4 / oklch values) */
@import "tailwindcss";

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);            /* page background          */
  --foreground: oklch(0.145 0 0);       /* default text             */
  --primary: oklch(0.205 0 0);          /* brand / primary surface  */
  --primary-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.577 0.245 27.325); /* danger / delete       */
  --border: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);             /* focus ring               */
}

.dark {
  /* Same token NAMES, different VALUES. Toggling the `dark` class on
     <html> instantly re-skins every component that uses these tokens. */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.556 0 0);
}
```

---

## 🛠️ 3. Thêm Component: `add`

Khi `init` xong, bạn kéo các component vào theo nhu cầu. Mỗi lần `add` tải các file mã nguồn vào `src/components/ui/` và cài bất kỳ npm peer package nào mà component đó cần (ví dụ primitive `@radix-ui/*` liên quan).

```bash
# Add one component
npx shadcn@latest add button

# Add several at once (the course adds these for a form)
npx shadcn@latest add card input label select
```

Sau khi chạy các lệnh này, cây thư mục của bạn trông như sau — mỗi file là mã nguồn thực, có thể chỉnh sửa mà bây giờ bạn sở hữu:

```text
src/components/ui/
├── button.tsx     ← CVA + Radix Slot + cn()
├── card.tsx       ← Card, CardHeader, CardTitle, CardContent, CardFooter
├── input.tsx
├── label.tsx      ← wraps @radix-ui/react-label
└── select.tsx     ← wraps @radix-ui/react-select (full behavior, styled)
```

Bạn import chúng bằng alias `@/` (được cấu hình trong lúc init) và dùng chúng như bất kỳ component cục bộ nào:

```tsx
// src/App.tsx — consuming owned components
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div className="p-8 flex gap-3">
      {/* "default" variant, "default" size come from defaultVariants */}
      <Button>Learn More</Button>
      <Button variant="destructive" size="sm">
        Delete Account
      </Button>
    </div>
  );
}
```

> [!WARNING]
> `add` **chỉ idempotent đối với các file mới** — nếu bạn chạy lại `add button` sau khi đã chỉnh `button.tsx`, CLI sẽ đề nghị **ghi đè** file của bạn và xóa sạch các tùy biến của bạn. Vì bạn sở hữu mã nguồn, hãy đối xử với `src/components/ui/*` như bất kỳ đoạn code viết tay nào: commit nó, và chỉ chạy lại `add` cho component đó khi bạn cố ý muốn reset nó. Các phiên bản CLI mới hơn sẽ hỏi trước khi ghi đè; đừng theo quán tính bấm qua phần xác nhận.

---

## 🧩 4. Giải Phẫu `Button` Được Sinh Ra

Đây là phần thưởng cho việc hiểu CVA trong bài học dựng thư viện. File `button.tsx` mà CLI trao cho bạn kết hợp ba công cụ bạn đã biết:

- **CVA** (`class-variance-authority`) — khai báo ma trận `variant`/`size` và các giá trị mặc định.
- **Radix `Slot`** (`@radix-ui/react-slot`) — cơ chế `asChild` cho phép Button *trở thành* phần tử mà nó bọc.
- **`cn()`** — hợp nhất đầu ra CVA với bất kỳ `className` nào bên tiêu dùng cung cấp.

```tsx
// src/components/ui/button.tsx — exactly the kind of file `add button` writes
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// 1) CVA: base classes + the variant matrix. Every class references a
//    CSS-variable token (bg-primary, text-destructive-foreground, ...),
//    so theming is automatic.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
    "text-sm font-medium transition-colors focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none " +
    "disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2) Props = native <button> attributes + the CVA variant props (auto-derived)
//    + asChild. VariantProps<typeof buttonVariants> gives us a fully typed
//    `variant` and `size` union for free.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // 3) Slot magic: if asChild is true, render the CHILD element with our
    //    classes/ref/props merged onto it. Otherwise render a real <button>.
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Vì sao `Slot` / `asChild` quan trọng

`asChild` giải quyết một vấn đề thực: bạn muốn một *link* trông y hệt Button của mình mà không phải lồng một `<a>` bên trong một `<button>` (HTML không hợp lệ) và không phải copy-paste toàn bộ các class của button lên thẻ anchor.

```tsx
import { Button } from "@/components/ui/button";

// WITHOUT asChild: renders <button>…</button> (a real button element)
<Button variant="outline">Plain button</Button>;

// WITH asChild: Slot MERGES the button's classes/props onto the <a>,
// so you get one <a> element that LOOKS like the button. No nested tags.
<Button asChild variant="link">
  <a href="/pricing">Go to pricing</a>
</Button>;
```

```text
asChild = false                     asChild = true
──────────────                      ─────────────
<Comp> resolves to "button"         <Comp> resolves to Slot
       │                                   │
       ▼                                   ▼
<button class="…btn classes…">      Slot clones its CHILD (<a>) and
  children                          merges class/ref/onClick onto it
</button>                                  │
                                           ▼
                                    <a class="…btn classes…" href="…">
```

> [!NOTE]
> `forwardRef` hiện diện để các component cha và các wrapper Radix (tooltip, dropdown trigger) có thể gắn một `ref` vào DOM node bên dưới — thiết yếu cho việc quản lý focus và định vị. Hãy giữ nó khi bạn tùy biến.

---

## ⚡ 5. Tùy biến: Chỉnh Mã Nguồn, Thêm CVA Variant

Vì file là của bạn, tùy biến chỉ đơn giản là *chỉnh code* — không có API ghi đè theme, không có wrapper `styled()`, không phải prop drilling xuyên qua một object cấu hình. Hai tùy biến hằng ngày là: tinh chỉnh các class hiện có, và thêm một variant hoàn toàn mới.

Ở đây chúng ta thêm một variant `gradient` và một size `xl` trực tiếp vào `buttonVariants`:

```tsx
// src/components/ui/button.tsx — your edits inside the existing CVA call
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
    "text-sm font-medium transition-colors focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none " +
    "disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // NEW: a custom gradient variant — fully owned, no upstream needed
        gradient:
          "bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white " +
          "shadow-md hover:from-fuchsia-500 hover:to-indigo-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // NEW: an extra-large size
        xl: "h-14 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

Ngay khoảnh khắc bạn thêm `gradient` và `xl` vào các map, `VariantProps<typeof buttonVariants>` suy ra lại các union prop, nên TypeScript tự động hoàn thành — và kiểm tra kiểu — các tùy chọn mới với **không** cần gõ thêm gì:

```tsx
// Both lines compile with full IntelliSense; a typo like variant="grandient"
// is a compile-time error because the union came straight from the CVA config.
<Button variant="gradient" size="xl">Upgrade now ✨</Button>;
<Button variant="gradient" size="sm">Small gradient</Button>;
```

> [!TIP]
> Hãy ưu tiên thêm các variant **mới** thay vì viết lại các variant hiện có khi có thể. Các key mới mang tính bổ sung và sẽ không gây bất ngờ cho các component khác đang dựa vào `default`/`outline`. Nếu bạn buộc phải đổi một base class, hãy làm điều đó trong chuỗi base của `cva` để mọi variant kế thừa nó một cách nhất quán.

---

## 🧩 6. Theming với CSS Variables (Sáng / Tối)

Các component được sinh ra không bao giờ hardcode một mã màu hex — chúng tham chiếu các token class (`bg-primary`, `text-foreground`, `border-border`). Các class đó phân giải thành các CSS variable mà `init` đã ghi. Để chuyển toàn bộ app sang dark mode bạn chỉ cần lật **một class** trên `<html>`; mọi component đổi giao diện vì các *giá trị* biến dưới `.dark` lên ngôi.

Đây là một bộ chuyển theme hoàn chỉnh, chạy được cho React 19 kèm khả năng lưu lại:

```tsx
// src/components/ThemeToggle.tsx
import * as React from "react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

// Read the saved theme (or fall back to the OS preference) — runs once.
function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  // Whenever theme changes: toggle the `dark` class on <html> and persist it.
  React.useEffect(() => {
    const root = document.documentElement; // the <html> element
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"} — click to switch
    </Button>
  );
}
```

```text
                 .dark class toggled on <html>
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                         ▼
  :root tokens                              .dark tokens
  --primary: near-black                     --primary: near-white
        │                                         │
        └──────────► bg-primary class ◄───────────┘
                          │
              every <Button>, <Card>, <Input>
              recolors at once — no re-render of
              token values, pure CSS cascade
```

> [!NOTE]
> Điều này về mặt khái niệm giống hệt với bộ chuyển `data-theme` của DaisyUI mà bạn đã thấy ở bài học trước — cả hai đều là "lật một thuộc tính/class, CSS cascade lo phần còn lại." Khác biệt nằm ở *nơi các token sống và ai có thể thay đổi chúng*: các theme của DaisyUI được ship bên trong npm plugin, trong khi các token của Shadcn sống trong file CSS **của bạn**, nên bạn có thể đổi tên, thêm, hoặc viết lại hoàn toàn một theme mà không đụng tới bất kỳ dependency nào.

---

## ⚡ 7. Shadcn/ui và DaisyUI: Quyền Sở Hữu & Câu Chuyện Nâng Cấp

Cả hai đều đứng trên Tailwind, cả hai đều theme qua một CSS hook, cả hai đều phổ biến — nhưng chúng đặt cược ngược chiều nhau về quyền sở hữu.

| Khía cạnh | **DaisyUI** | **Shadcn/ui** |
| :--- | :--- | :--- |
| Phân phối | `npm install daisyui` — sống trong `node_modules` | CLI copy `.tsx` vào `src/components/ui/` |
| Bạn nhận được gì | Các class CSS ngữ nghĩa (`btn btn-primary`) | Toàn bộ mã nguồn component React bạn sở hữu |
| Hành vi / khả năng tiếp cận (a11y) | Không có — chỉ CSS; bạn tự đấu nối `useState` cho modal | Các primitive Radix gói sẵn focus trap, bàn phím, ARIA |
| Tùy biến | Cấu hình theme + ghi đè utility; nội tại component cố định | Chỉnh mã nguồn từng dòng; thêm CVA variant thoải mái |
| **Câu chuyện nâng cấp** | `npm update daisyui` — bản sửa lỗi/component mới đến tự động | Bạn chạy lại CLI cho từng component; **bạn** hợp nhất các thay đổi upstream thủ công |
| Tác động lên bundle | CSS thuần, không có JS runtime | Ship phần Radix JS mà các component dùng (chỉ những gì bạn thêm) |
| Tốt nhất khi | Nguyên mẫu nhanh, trang nội dung, bạn muốn nâng cấp không cần đụng tay | UI ứng dụng cần tùy biến sâu, a11y mạnh, toàn quyền kiểm soát |

> [!WARNING]
> Mô hình sở hữu có một cái giá thực: **không có nâng cấp tự động.** Nếu Shadcn sửa một lỗi trong `dialog.tsx` ở upstream, file `dialog.tsx` bạn đã copy **không** thay đổi. Bạn hoặc chạy lại `add dialog` (ghi đè các chỉnh sửa của bạn) hoặc tự tay chuyển bản sửa lỗi sang. `npm update` của DaisyUI cho bạn các bản sửa lỗi miễn phí nhưng không cho bạn chạm vào markup bên trong một component. Hãy chọn sự đánh đổi một cách có chủ ý: kiểm soát đổi lấy bảo trì.

---

## 🧠 Kiểm Tra Kiến Thức

### 1. Vì sao Shadcn/ui *không* được liệt kê trong dependencies của `package.json`?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Bởi vì Shadcn/ui không phải là một thư viện runtime mà bạn import từ `node_modules` — nó là một **CLI sao chép mã nguồn vào repo của bạn**. Chạy `npx shadcn@latest add button` tải `button.tsx` thẳng vào `src/components/ui/`, nơi nó trở thành code thông thường, có thể chỉnh sửa mà bạn sở hữu và commit. Thứ duy nhất *thực sự* nằm trong `dependencies` là các package hỗ trợ mà các component dùng (`class-variance-authority`, `clsx`, `tailwind-merge`, và các primitive `@radix-ui/*` cụ thể) — nhưng bản thân các component Shadcn là mã nguồn của bạn, không phải một package.
</details>

### 2. `npx shadcn@latest init` tạo ra ba thứ gì, và mỗi thứ dùng để làm gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  1. **`components.json`** — bản kê khai ghi lại style bạn đã chọn (ví dụ New York), base color, đường dẫn file CSS, việc bạn có dùng CSS variables hay không, và các import alias của bạn (`@/components`, `@/lib/utils`). Mỗi lần `add` về sau đều đọc nó.
  2. **`src/lib/utils.ts`** chứa **`cn()`** — một helper chạy `clsx` (để làm phẳng các danh sách class có điều kiện) rồi `tailwind-merge` (để giải quyết các utility Tailwind xung đột sao cho cái cuối cùng thắng). Mọi component được sinh ra đều import nó.
  3. **Các theme token dạng CSS-variable** được thêm vào CSS toàn cục của bạn — các design token được đặt tên như `--primary`, `--background`, `--destructive` dưới `:root`, cùng một bộ tương ứng dưới `.dark`. Các component tham chiếu chúng qua các class như `bg-primary`.
</details>

### 3. Trong `Button` được sinh ra, CVA, Radix `Slot`, và `cn()` mỗi thứ đóng góp gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  - **CVA** khai báo ma trận variant (`variant`, `size`) cùng `defaultVariants`, và thông qua `VariantProps<typeof buttonVariants>` tự suy ra các prop `variant`/`size` có kiểu.
  - **Radix `Slot`** vận hành `asChild`: khi `asChild` là true thì component render `Slot`, vốn hợp nhất các class/ref/props của button lên phần tử *con* của nó (ví dụ một `<a>`) thay vì render một `<button>` thật — nên bạn có một link được tạo kiểu như một button mà không có các thẻ lồng không hợp lệ.
  - **`cn()`** hợp nhất chuỗi class do CVA sinh ra với bất kỳ `className` nào của bên tiêu dùng, dùng `tailwind-merge` để bản ghi đè của bên tiêu dùng thắng giá trị mặc định của variant mà không cần các thủ thuật về độ ưu tiên (specificity).
</details>

### 4. Làm thế nào để thêm một variant `gradient` mới, và vì sao nó an toàn kiểu ngay lập tức?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Bạn thêm một key `gradient` bên trong object `variants.variant` trong lệnh `cva(...)` hiện có ở `button.tsx` (file bạn sở hữu), gán cho nó các class Tailwind bạn muốn. Nó an toàn kiểu ngay lập tức vì các prop của Button mở rộng `VariantProps<typeof buttonVariants>`, vốn suy ra lại union `variant` *từ chính cấu hình CVA*. Khoảnh khắc `gradient` tồn tại trong cấu hình, `variant="gradient"` tự động hoàn thành và một lỗi gõ sai trở thành lỗi tại thời điểm biên dịch — bạn không bao giờ phải bảo trì một kiểu prop riêng.
</details>

### 5. So với DaisyUI, sự đánh đổi về nâng cấp mà bạn chấp nhận với Shadcn/ui là gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  DaisyUI sống trong `node_modules`, nên `npm update daisyui` kéo về các bản sửa lỗi và component mới một cách tự động — nhưng bạn không thể chỉnh markup/hành vi nội tại của một component. Shadcn/ui copy mã nguồn vào repo của bạn, cho bạn toàn quyền kiểm soát để chỉnh và thêm variant — nhưng **không có nâng cấp tự động**: một bản sửa lỗi upstream cho một component không đến được file bạn đã copy. Bạn phải chạy lại CLI cho component đó (ghi đè các chỉnh sửa của bạn) hoặc tự tay chuyển thay đổi sang. Sự đánh đổi là **kiểm soát đổi lấy bảo trì**: Shadcn tối đa hóa kiểm soát với cái giá là bảo trì thủ công; DaisyUI tối đa hóa nâng cấp không cần đụng tay với cái giá là khả năng tùy biến.
</details>

---

## 💻 Bài Tập Thực Hành

### 🛠️ Bài tập 1: Khởi tạo Shadcn, thêm một Button, và ship một variant tùy chỉnh
1. Trong một dự án **Vite + React + TypeScript** mới tinh, thiết lập Tailwind, rồi chạy `npx shadcn@latest init` (chọn **New York**, **neutral**, CSS variables **yes**). Xác nhận `components.json`, `src/lib/utils.ts`, và các CSS token đã được tạo.
2. Chạy `npx shadcn@latest add button` và mở `src/components/ui/button.tsx`. Định vị lệnh `buttonVariants` CVA.
3. Thêm một variant `success` (`bg-emerald-600 text-white hover:bg-emerald-500`) và một size `xl` (`h-14 rounded-lg px-10 text-base`).
4. Trong `App.tsx`, render `<Button variant="success" size="xl">Saved ✓</Button>` cạnh một `<Button variant="destructive">Delete</Button>`. Xác nhận IntelliSense liệt kê `success` và rằng một lỗi gõ sai (`variant="sucess"`) làm hỏng quá trình build TypeScript.

Khởi đầu:

```tsx
// src/App.tsx
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="min-h-screen grid place-items-center gap-4 p-8">
      {/* TODO: render your custom success/xl button + a destructive button */}
      <div className="flex gap-3">
        <Button>TODO</Button>
      </div>
    </main>
  );
}
```

### 🛠️ Bài tập 2: Đấu nối một bộ chuyển theme sáng/tối có lưu lại
1. Thêm component `ThemeToggle` từ Phần 6 vào app của bạn.
2. Xác minh rằng nhấp vào nó sẽ lật class `dark` trên `<html>` (kiểm tra phần tử) và rằng Button, cùng bất kỳ `Card`/`Input` nào bạn thêm, đổi màu ngay lập tức.
3. Tải lại trang — xác nhận lựa chọn được lưu lại từ `localStorage`. Sau đó xóa `localStorage` và xác nhận nó quay về dùng `prefers-color-scheme` của hệ điều hành.
4. **Suy ngẫm:** Thêm một `<Card>` (`npx shadcn@latest add card`) với chút văn bản và lưu ý rằng bạn đã viết **không** class dark-mode nào lên nó — nó theme tự động vì nó tham chiếu các token `bg-card`/`text-card-foreground`. So sánh điều này với cách `data-theme` của DaisyUI đạt được hiệu ứng tương tự ở bài học trước, và giải thích ai sở hữu các giá trị token trong từng trường hợp.

```tsx
// src/App.tsx — Exercise 2 scaffold
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8 flex flex-col gap-6">
      <ThemeToggle />
      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        {/* TODO: add a <Card> here and confirm it themes with no extra classes */}
      </div>
    </main>
  );
}
```
