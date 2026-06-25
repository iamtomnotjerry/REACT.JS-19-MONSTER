# Các Thư viện Component React Hiện đại: DaisyUI, Radix UI & Shadcn/ui 📦

Khi xây dựng các ứng dụng React hiện đại, việc tự viết từng component giao diện (button, modal, dropdown) từ đầu rất tốn thời gian. Các component library giúp tăng tốc quá trình phát triển. Ngày nay, hệ sinh thái React đã chuyển dịch từ các thư viện component nặng chạy ở runtime (như Material UI hay Chakra UI) sang các giải pháp gọn nhẹ tích hợp với Tailwind: **DaisyUI**, **Radix UI**, và **Shadcn/ui**.

Trong bài học này, chúng ta sẽ so sánh các paradigm thư viện và học cách triển khai DaisyUI, Radix UI, và Shadcn/ui — bao gồm cả một ví dụ chuyển đổi theme trực tiếp.

---

## 🌍 Khái niệm & Tổng quan

Một component library là một hộp công cụ gồm các thành phần UI dựng sẵn, giúp bạn không phải phát minh lại cùng một button hay dialog trong mỗi dự án. Nhưng không phải hộp công cụ nào cũng hoạt động giống nhau. Có loại đưa cho bạn món đồ nội thất đã hoàn thiện, đã sơn sẵn (CSS-only). Có loại đưa cho bạn *cơ chế* — bản lề, khóa, thanh trượt đã hoạt động sẵn — rồi để bạn tự sơn theo ý mình (headless). Và có loại cho phép bạn sao chép nguyên bản thiết kế vào xưởng của riêng mình, để bạn hoàn toàn sở hữu và có thể dựng lại từng mối nối (sao chép component).

> [!NOTE]
> **DaisyUI**, **Radix UI**, và **Shadcn/ui** thực chất không phải là những đối thủ mà bạn buộc phải chọn *một trong số đó*. Chúng nằm ở các tầng khác nhau. DaisyUI là CSS thuần. Radix UI là hành vi không có style. Shadcn/ui thực chất *kết hợp* Radix UI (hành vi) + Tailwind (styling) thành các file mã nguồn có thể sao chép. Hiểu được tầng mà mỗi thư viện chiếm giữ mới chính là bài học thực sự.

> [!TIP]
> Shadcn/ui dùng `class-variance-authority` (CVA) để định nghĩa các trạng thái component có cấu trúc (variant, kích thước). Điều này cho phép bạn mở rộng các thuộc tính component một cách gọn gàng và an toàn về kiểu (type-safe).

> [!WARNING]
> DaisyUI là **CSS thuần** — nó không kèm theo chút JavaScript nào. Điều đó có nghĩa là các phần tử tương tác như modal, dropdown và accordion **không** tự đóng mở. Bạn phải tự kết nối React state (`useState`) hoặc một CSS toggle. Người mới học thường nghĩ DaisyUI bị "hỏng" khi modal không mở; thực ra nó đang hoạt động đúng như thiết kế.

### Một Phép ẩn dụ Thực tế 🏠

Hãy hình dung việc bày biện nội thất cho một căn phòng:

| Cách tiếp cận | Phép ẩn dụ thực tế | Thư viện |
| :--- | :--- | :--- |
| CSS-only utility | Mua một chiếc ghế đã hoàn thiện, đã sơn sẵn từ cửa hàng | DaisyUI |
| Headless / không style | Mua một *cơ chế* ghế tựa hoạt động được rồi tự bọc nệm cho nó | Radix UI |
| Sao chép component | Lấy toàn bộ bản thiết kế + linh kiện, lắp ráp trong xưởng của riêng bạn, rồi tinh chỉnh từng con ốc | Shadcn/ui |

---

## ⚡ 1. Các Paradigm Thư viện: CSS-only vs Headless vs Sao chép Component

Hiểu rõ ba paradigm này là chìa khóa để chọn đúng công cụ:

| Paradigm | Cách hoạt động | Ví dụ | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- | :--- |
| **CSS-only Utility** | Các class CSS thuần được xây dựng trên Tailwind. Không có React JS runtime. | DaisyUI | Cực nhanh, bundle size nhỏ, không phụ thuộc framework. | Các phần tử tương tác (modal, dropdown) yêu cầu tự toggle state thủ công trong React. |
| **Headless (Không style)** | Cung cấp logic React và khả năng tiếp cận (accessibility), việc styling hoàn toàn để bạn quyết định. | Radix UI, Headless UI | Khả năng tiếp cận (A11y) hoàn hảo, tự do thiết kế trọn vẹn. | Phải tự viết toàn bộ class CSS/Tailwind từ đầu. |
| **Sao chép Component** | Một CLI tạo các component trực tiếp vào thư mục mã nguồn của bạn bằng các primitive Radix + Tailwind. | Shadcn/ui | Sở hữu mã nguồn trực tiếp, tùy biến 100%, không phụ thuộc gói npm. | Cần thiết lập CLI ban đầu và code boilerplate trong dự án. |

### Cách các tầng xếp chồng lên nhau

```text
┌─────────────────────────────────────────────┐
│  Shadcn/ui  (copy-paste source you own)       │
│  ┌───────────────────────┐  ┌──────────────┐ │
│  │  Radix UI primitives  │  │  Tailwind CSS │ │
│  │  (behavior + a11y)    │  │  (styling)    │ │
│  └───────────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────┘

DaisyUI  →  sits on top of Tailwind CSS, pure class names, no JS
```

---

## ⚡ 2. Làm việc với DaisyUI

**DaisyUI** là một plugin của Tailwind CSS. Thay vì viết các chuỗi utility Tailwind dài dòng như `px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600`, bạn dùng các class component mang tính ngữ nghĩa như `btn btn-primary`.

### Cài đặt & Thiết lập

1. Cài đặt DaisyUI làm dev dependency:
```bash
npm install -D daisyui@latest
```

2. Thêm DaisyUI vào mảng plugins trong `tailwind.config.js`:
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // Optionally configure daisyUI themes
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
```

### Ví dụ Sử dụng trong React
Vì DaisyUI là CSS thuần, các component tương tác như modal yêu cầu dùng React state để toggle trạng thái hiển thị:

```jsx
import React, { useState } from 'react';

export const DaisyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* DaisyUI Button classes */}
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      {/* Modal markup controlled by React state */}
      <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-slate-900 text-white">
          <h3 className="font-bold text-lg">Hello DaisyUI!</h3>
          <p className="py-4">This modal is styled using DaisyUI components and controlled via React useState.</p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 🎨 Chuyển đổi Theme Trực tiếp (DaisyUI `data-theme`)

Một trong những tính năng tuyệt vời nhất của DaisyUI là theming tích hợp sẵn. Mỗi theme DaisyUI được áp dụng thông qua thuộc tính `data-theme` trên một phần tử bao bọc (thường là `<html>` hoặc một `<div>` cấp cao nhất). Vì nó chỉ là một thuộc tính HTML, việc chuyển theme lúc runtime đơn giản chỉ là cập nhật một giá trị React state — không cần thêm thư viện JS nào.

```jsx
import React, { useState } from 'react';

// The themes you enabled in tailwind.config.js -> daisyui.themes
const THEMES = ['light', 'dark', 'cupcake'];

export const ThemeSwitcher = () => {
  // Current active DaisyUI theme, stored in React state
  const [theme, setTheme] = useState('light');

  return (
    // The data-theme attribute drives ALL DaisyUI colors below it
    <div data-theme={theme} className="min-h-screen p-8 bg-base-100 text-base-content">
      <h1 className="text-2xl font-bold mb-4">Current theme: {theme}</h1>

      {/* A simple dropdown to pick a theme */}
      <select
        className="select select-bordered mb-6"
        value={theme}
        onChange={(e) => setTheme(e.target.value)} // Update state -> data-theme re-renders
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {/* These components instantly recolor when the theme changes */}
      <div className="flex gap-2">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-accent">Accent</button>
      </div>
    </div>
  );
};
```

> [!TIP]
> Để giữ lại theme đã chọn qua các lần tải lại trang, hãy lưu nó vào `localStorage` và đọc lại bên trong một `useEffect` khi mount. DaisyUI cũng cung cấp một class `theme-controller` checkbox tích hợp sẵn nếu bạn muốn một toggle CSS thuần không cần React state nào.

---

## ⚡ 3. Làm việc với Radix UI (Độc lập)

**Radix UI** là một thư viện primitive *headless*. Nó cung cấp cho bạn hành vi có thể tiếp cận hoàn toàn, điều hướng được bằng bàn phím, không có style — và bạn tự đem thiết kế của mình vào. Điều này khác với Shadcn/ui: với Radix bạn cài các gói npm và dùng trực tiếp các primitive; với Shadcn bạn sao chép các wrapper đã được style sẵn bao quanh chính những primitive đó.

Radix cung cấp hai thứ mọi người thường dùng:
- **Radix Themes** — một design system tùy chọn, đã được style, dựng sẵn (`@radix-ui/themes`).
- **Radix Primitives** — các khối xây dựng hành vi không có style (ví dụ `@radix-ui/react-dialog`).

### Cài đặt

```bash
# Option A: the full styled Radix Themes design system
npm install @radix-ui/themes

# Option B: a single unstyled primitive (you can install only what you need)
npm install @radix-ui/react-dialog
```

### Bao bọc ứng dụng của bạn bằng Theme / ThemeProvider

Nếu bạn dùng **Radix Themes**, bạn import CSS của nó một lần và bao bọc ứng dụng trong một provider `<Theme>`. Mọi thứ bên trong sẽ kế thừa các token của Radix (màu sắc, bo góc, khoảng cách).

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css"; // Radix Themes base styles (import ONCE)
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Theme is Radix's provider: it sets color palette, radius, scaling, dark/light appearance */}
    <Theme accentColor="iris" radius="large" appearance="light">
      <App />
    </Theme>
  </React.StrictMode>
);
```

```tsx
// src/App.tsx — using Radix Themes pre-built components
import { Button, Card, Flex, Heading } from "@radix-ui/themes";

export default function App() {
  return (
    <Card size="3" style={{ maxWidth: 360, margin: "40px auto" }}>
      <Flex direction="column" gap="3">
        <Heading>Hello from the Radix theme</Heading>
        {/* Styled by Radix tokens defined in <Theme> */}
        <Button>Get Started</Button>
      </Flex>
    </Card>
  );
}
```

### Dùng trực tiếp một Radix Primitive (không style, bạn tự style)

Đây chính là phần khiến Radix khác biệt với Shadcn: bạn sử dụng primitive thô và áp dụng class của riêng mình. Primitive đó tự xử lý việc bẫy focus, `Esc` để đóng, các vai trò ARIA, và khóa cuộn cho bạn.

```tsx
// src/AlertDialogExample.tsx
import * as Dialog from "@radix-ui/react-dialog";

export const AlertDialogExample = () => {
  return (
    // Dialog.Root manages open/close state internally (no useState needed)
    <Dialog.Root>
      {/* Trigger is the button that opens the dialog */}
      <Dialog.Trigger className="btn btn-primary">Open Dialog</Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay = dimmed background. We style it ourselves with Tailwind */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        {/* Content = the dialog box. Radix handles focus + Esc + a11y automatically */}
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl">
          <Dialog.Title className="text-lg font-bold">Confirm action</Dialog.Title>
          <Dialog.Description className="py-2 text-slate-600">
            This dialog is fully accessible out of the box — but every pixel of styling is yours.
          </Dialog.Description>
          <Dialog.Close className="btn mt-4">Cancel</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
```

> [!NOTE]
> Hãy để ý rằng Radix primitive **không cần `useState`** để đóng mở — `Dialog.Root` tự sở hữu state đó nội bộ. Hãy so sánh với modal DaisyUI ở trên, nơi *bạn* phải tự theo dõi `isOpen` thủ công. Đó chính là sự đánh đổi cốt lõi: Radix cho bạn hành vi miễn phí; DaisyUI cho bạn styling miễn phí.

---

## ⚡ 4. Làm việc với Shadcn/ui

**Shadcn/ui** không phải là một thư viện dependency. Nó là một tập hợp các component tái sử dụng mà bạn sao chép và dán vào ứng dụng của mình. Nó dùng **Radix UI** cho hành vi có thể tiếp cận (điều hướng bàn phím, trình đọc màn hình) và **Tailwind CSS** cho styling.

### Cài đặt

1. Chạy CLI khởi tạo tại thư mục gốc của dự án:
```bash
npx shadcn@latest init
```
CLI này sẽ hỏi một số câu hỏi (lựa chọn TypeScript, đường dẫn file Tailwind CSS, các biến toàn cục) và tạo ra `components.json`, khởi tạo các biến theme trong `global.css`, và tạo file `src/lib/utils.ts` chứa hàm tiện ích `cn`.

2. Thêm một component (ví dụ: Button):
```bash
npx shadcn@latest add button
```
Lệnh này tải một file trực tiếp về `src/components/ui/button.tsx`.

### Ví dụ Sử dụng trong React

Vì file component nằm trong mã nguồn dự án của bạn, bạn import nó cục bộ và có thể chỉnh sửa trực tiếp code của nó:

```tsx
// src/components/ui/button.tsx (created by shadcn CLI)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

Trong code ứng dụng của bạn:
```tsx
import { Button } from "@/components/ui/button";

export const App = () => {
  return (
    <div className="p-4 flex gap-2">
      <Button variant="default">Shadcn Button</Button>
      <Button variant="destructive" size="sm">Delete Account</Button>
    </div>
  );
};
```

> [!TIP]
> Shadcn/ui dùng `class-variance-authority` (CVA) để định nghĩa các trạng thái component có cấu trúc (variant, kích thước). Điều này cho phép bạn mở rộng các thuộc tính component một cách gọn gàng và an toàn về kiểu (type-safe).

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh.

### 1. Tại sao Shadcn/ui không được coi là một thư viện npm tiêu chuẩn?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì bạn không cài đặt nó như một module dependency npm (ví dụ nó không được liệt kê trong phần `dependencies` của package.json). Thay vào đó, bạn dùng một công cụ CLI để sao chép mã nguồn của từng component cụ thể trực tiếp vào codebase của riêng bạn (`src/components/ui/`). Điều này cho bạn toàn quyền sở hữu và khả năng chỉnh sửa logic nội bộ cũng như style của component.
</details>

### 2. Vai trò của Radix UI bên trong các component Shadcn/ui là gì, và việc dùng Radix *trực tiếp* khác biệt như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Radix UI cung cấp các **headless primitive** xử lý các tiêu chuẩn tiếp cận (A11y) phức tạp, điều khiển điều hướng bàn phím, quản lý focus, và cấu trúc DOM ngữ nghĩa. Shadcn/ui đóng gói các primitive có thể tiếp cận này và style chúng bằng các class Tailwind CSS. Khi bạn dùng Radix UI **trực tiếp** (ví dụ `@radix-ui/react-dialog`), bạn tự cài gói npm và áp dụng style của riêng mình lên primitive không có style — không có wrapper được style sẵn nào cả. Shadcn chỉ đơn giản thực hiện bước styling đó cho bạn và đưa cho bạn file mã nguồn kết quả.
</details>

### 3. Làm thế nào DaisyUI giữ bundle size nhỏ so với các thư viện JS runtime như Material UI?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI thêm các CSS rule utility thuần vào bundle Tailwind của bạn. Nó không chứa engine JavaScript runtime, các object CSS inline, hay framework render nào. Quy trình build của Tailwind sẽ purge các CSS không dùng đến, chỉ giữ lại các class được sử dụng trong stylesheet production cuối cùng.
</details>

### 4. Trong DaisyUI, thuộc tính nào điều khiển việc chuyển theme, và bạn thay đổi nó lúc runtime trong React như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thuộc tính `data-theme` trên một phần tử bao bọc điều khiển mọi token màu DaisyUI bên dưới nó. Để chuyển theme lúc runtime, bạn lưu theme đang hoạt động vào React state (ví dụ `const [theme, setTheme] = useState('light')`) và gắn nó vào `data-theme={theme}`. Việc cập nhật state thông qua một handler `onChange` sẽ re-render cây con với theme mới — không cần thư viện bổ sung nào. Bạn có thể lưu lại nó qua `localStorage`.
</details>

### 5. Khi nào bạn nên ưu tiên DaisyUI hơn Radix/Shadcn, và sự đánh đổi chính là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI là lựa chọn lý tưởng cho việc prototyping nhanh, các website đơn giản ít tương tác phức tạp, hoặc các dự án mà bạn muốn style ngay các phần tử HTML (form, layout) bằng các tên CSS gọn gàng, ngữ nghĩa. Sự đánh đổi chính: DaisyUI cho bạn **styling miễn phí nhưng không có hành vi** (bạn tự kết nối `useState` cho modal/dropdown), trong khi Radix/Shadcn cho bạn **hành vi có thể tiếp cận miễn phí** (bẫy focus, điều hướng bàn phím, ARIA) và được ưu tiên cho các ứng dụng mạnh mẽ, tương tác cao, và quan trọng về khả năng tiếp cận.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Xây dựng Navbar DaisyUI Responsive với Bộ chuyển Theme Hoạt động
1. Cấu hình DaisyUI trong một dự án React thử nghiệm và bật ít nhất ba theme (`light`, `dark`, `cupcake`) trong `tailwind.config.js`.
2. Xây dựng một navbar bằng các class `navbar`, `navbar-start`, `navbar-center`, và `navbar-end` của DaisyUI.
3. Thêm một `<select>` chuyển theme (hoặc dropdown) vào `navbar-end` được hậu thuẫn bởi `useState`, gắn giá trị đã chọn vào thuộc tính `data-theme` trên phần tử bao bọc trang (tái sử dụng pattern `ThemeSwitcher` từ Phần 2).
4. **Phần thưởng:** Lưu theme đã chọn vào `localStorage` và khôi phục nó khi mount bằng `useEffect` để lựa chọn vẫn còn sau khi tải lại trang.

### 🛠️ Bài tập 2: Dùng trực tiếp một Radix Primitive (Không dùng Shadcn)
1. Trong một dự án React + TypeScript mới, chỉ cài `@radix-ui/react-dialog` (**không** chạy shadcn CLI).
2. Xây dựng một dialog xác nhận có thể tiếp cận bằng `Dialog.Root`, `Dialog.Trigger`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, và `Dialog.Close`, tự style từng phần bằng các class Tailwind của riêng bạn.
3. Kiểm chứng hành vi tiếp cận mà bạn nhận được miễn phí: nhấn `Esc` đóng dialog, focus bị bẫy bên trong khi đang mở, và focus quay về trigger khi đóng.
4. **Suy ngẫm:** Lưu ý bạn đã viết bao nhiêu dòng code quản lý state so với modal DaisyUI ở Phần 2 — đây chính là sự đánh đổi headless-vs-CSS-only trong thực tế.

### 🛠️ Bài tập 3: Tùy biến một Component Shadcn/ui
1. Khởi tạo shadcn (`npx shadcn@latest init`) và thêm một button (`npx shadcn@latest add button`).
2. Mở file `src/components/ui/button.tsx` được tạo ra và thêm một variant tùy chỉnh `"outline-rainbow"` hiển thị một đường viền kép mảnh với gradient tương phản cao.
3. Render variant tùy chỉnh của bạn cùng với các variant default và destructive để xác nhận map `variants` của CVA nhận diện nó một cách an toàn về kiểu (type-safe).
