# Thư viện Component React Hiện đại: DaisyUI & Shadcn/ui 📦

Khi xây dựng các ứng dụng React hiện đại, việc tự viết từng component giao diện (như button, modal, dropdown) từ đầu rất tốn thời gian. Các thư viện component giúp tăng tốc quá trình phát triển. Hiện nay, hệ sinh thái React đã chuyển dịch từ các thư viện component nặng chạy ở runtime (như Material UI hay Chakra UI) sang các giải pháp gọn nhẹ tích hợp trực tiếp với Tailwind CSS: **DaisyUI** và **Shadcn/ui**.

Trong bài học này, chúng ta sẽ so sánh các mô hình thiết kế thư viện và tìm hiểu cách triển khai DaisyUI và Shadcn/ui.

---

## ⚡ 1. Các Mô hình Thư viện: CSS-only vs Headless vs Sao chép Component

Hiểu rõ ba mô hình này là chìa khóa để lựa chọn công cụ phù hợp cho dự án:

| Mô hình | Cách Hoạt động | Ví dụ | Ưu điểm | Nhược điểm |
| :--- | :--- | :--- | :--- | :--- |
| **CSS-only Utility** | Cung cấp các class CSS thuần được xây dựng trên Tailwind. Không có mã chạy JS. | DaisyUI | Rất nhanh, dung lượng bundle cực nhỏ, không phụ thuộc vào framework. | Các thành phần tương tác (modal, dropdown) yêu cầu phải tự quản lý state hiển thị trong React. |
| **Headless (Không style)** | Cung cấp logic hành vi và khả năng tiếp cận (accessibility), việc định dạng giao diện hoàn toàn do bạn quyết định. | Radix UI, Headless UI | Khả năng tiếp cận hoàn hảo, tự do sáng tạo thiết kế mà không bị giới hạn. | Bạn phải tự viết toàn bộ các class CSS/Tailwind từ đầu. |
| **Sao chép Component** | Sử dụng CLI để tạo mã nguồn component trực tiếp vào thư mục dự án của bạn từ các primitive Radix + Tailwind. | Shadcn/ui | Quyền sở hữu mã nguồn trực tiếp, tùy biến 100%, không phụ thuộc vào các gói npm bên ngoài. | Đòi hỏi thiết lập CLI ban đầu và tạo ra code boilerplate trong dự án của bạn. |

---

## ⚡ 2. Làm việc với DaisyUI

**DaisyUI** là một plugin của Tailwind CSS. Thay vì viết các chuỗi class tiện ích dài dòng của Tailwind như `px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600`, bạn sử dụng các class component mang tính ngữ nghĩa như `btn btn-primary`.

### Cài đặt & Thiết lập

1. Cài đặt DaisyUI làm dev dependency:
```bash
npm install -D daisyui@latest
```

2. Thêm DaisyUI vào mảng plugins của file `tailwind.config.js`:
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  // Cấu hình các theme daisyUI (Tùy chọn)
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}
```

### Ví dụ Sử dụng trong React
Vì DaisyUI là CSS thuần, các component tương tác như modal yêu cầu sử dụng state của React để chuyển đổi trạng thái hiển thị:

```jsx
import React, { useState } from 'react';

export const DaisyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Các class Button của DaisyUI */}
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      {/* Cấu trúc Modal được điều khiển bởi React state */}
      <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box bg-slate-900 text-white">
          <h3 className="font-bold text-lg">Hello DaisyUI!</h3>
          <p className="py-4">Mẫu modal này được định dạng giao diện bằng DaisyUI và quản lý trạng thái bằng useState của React.</p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## ⚡ 3. Làm việc với Shadcn/ui

**Shadcn/ui** không phải là một thư viện phụ thuộc (dependency library). Nó là một tập hợp các component tái sử dụng mà bạn sao chép thẳng vào ứng dụng của mình. Nó sử dụng **Radix UI** để xử lý các hành vi tiếp cận (điều hướng bàn phím, trình đọc màn hình) và **Tailwind CSS** để định dạng giao diện.

### Cài đặt

1. Chạy CLI khởi tạo trong thư mục gốc của dự án:
```bash
npx shadcn@latest init
```
CLI này sẽ hỏi một số câu hỏi (lựa chọn ngôn ngữ TypeScript, đường dẫn tệp Tailwind CSS, các biến toàn cục) và tạo ra file `components.json`, khởi tạo các biến theme trong `global.css`, và tạo tệp `src/lib/utils.ts` chứa hàm tiện ích gộp class `cn`.

2. Thêm một component (ví dụ: Button):
```bash
npx shadcn@latest add button
```
Lệnh này sẽ tải file component trực tiếp về thư mục `src/components/ui/button.tsx`.

### Ví dụ Sử dụng trong React

Vì tệp component nằm trực tiếp trong thư mục mã nguồn dự án của bạn, bạn có thể import cục bộ và chỉnh sửa mã nguồn của nó bất kỳ lúc nào:

```tsx
// src/components/ui/button.tsx (được tạo bởi shadcn CLI)
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

Sử dụng component trong ứng dụng của bạn:
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
> Shadcn/ui sử dụng `class-variance-authority` (CVA) để định nghĩa các trạng thái có cấu trúc của component (các biến thể, kích thước). Điều này giúp bạn mở rộng các thuộc tính của component một cách rõ ràng và an toàn về kiểu dữ liệu (type-safe).

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh câu trả lời.

### 1. Tại sao Shadcn/ui không được coi là một thư viện npm thông thường?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì bạn không cài đặt nó dưới dạng một module phụ thuộc npm (nó không xuất hiện trong phần `dependencies` của package.json). Thay vào đó, bạn sử dụng công cụ CLI để sao chép mã nguồn của từng component cụ thể trực tiếp vào trong cấu trúc thư mục dự án của bạn (`src/components/ui/`). Điều này giúp bạn có toàn quyền chỉnh sửa và làm chủ logic cũng như kiểu dáng hiển thị của component.
</details>

### 2. Vai trò của Radix UI bên trong các component của Shadcn/ui là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Radix UI cung cấp các **phần tử nguyên bản không có kiểu dáng (headless primitives)** để xử lý các tiêu chuẩn tiếp cận phức tạp (A11y), các sự kiện bàn phím, quản lý tiêu điểm (focus management), và cấu trúc HTML ngữ nghĩa. Shadcn/ui đóng gói các phần tử này và định dạng kiểu dáng cho chúng bằng các class Tailwind CSS.
</details>

### 3. Tại sao DaisyUI lại giữ kích thước bundle nhỏ hơn so với các thư viện JS chạy ở runtime như Material UI?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI chỉ đơn thuần thêm các CSS rules dạng lớp tiện ích vào bundle Tailwind của bạn. Nó hoàn toàn không chứa mã JavaScript runtime, các đối tượng CSS-in-JS, hay công cụ dựng giao diện phức tạp. Quy trình build của Tailwind sẽ tự động loại bỏ các CSS không dùng đến (purge), chỉ giữ lại các class thực sự được sử dụng trong file CSS thành phẩm cuối cùng.
</details>

### 4. Class Variance Authority (CVA) là gì, và tại sao nó hữu ích?
<details>
  <summary><b>Reveal Answer</b></summary>

  CVA là công cụ dùng để ánh xạ các prop của component sang các class CSS theo cấu trúc đối tượng rõ ràng. Nó loại bỏ các câu điều kiện ba ngôi lộn xộn trong file JSX bằng cách cho phép khai báo trực tiếp các tùy chọn như `variants: { color: { primary: "...", secondary: "..." } }` cùng các cấu hình mặc định khác.
</details>

### 5. Khi nào bạn nên ưu tiên DaisyUI hơn Shadcn/ui?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI là lựa chọn lý tưởng khi cần xây dựng prototype nhanh, các website đơn giản ít tương tác phức tạp, hoặc các dự án mà bạn muốn tạo style cho các thẻ HTML (như form, layout) nhanh chóng bằng các tên class CSS ngắn gọn mà không cần bận tâm về cấu hình TypeScript phức tạp. Shadcn/ui được ưa chuộng hơn đối với các cổng thông tin doanh nghiệp lớn có độ tương tác cao, đòi hỏi tính tiếp cận chuẩn chỉ và cần khả năng tùy biến thiết kế sâu.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Xây dựng Thanh điều hướng (Navbar) phản hồi với DaisyUI
1. Cấu hình DaisyUI trong một dự án React thử nghiệm.
2. Xây dựng một navbar sử dụng các class `navbar`, `navbar-start`, `navbar-center`, và `navbar-end` từ DaisyUI.
3. Thêm một dropdown chuyển đổi theme giao diện sử dụng định dạng dropdown của DaisyUI kết hợp với hook React.

### 🛠️ Bài tập 2: Tự biến đổi kiểu dáng component Shadcn/ui
1. Tạo một component Button dựa trên cấu trúc CVA đã trình bày ở phần 3.
2. Thêm một biến thể (variant) tự định nghĩa mang tên `"outline-rainbow"` để hiển thị một đường viền kép mảnh có dải màu gradient nổi bật.
3. Thử nghiệm variant mới bằng cách gọi nó bên trong trang thử nghiệm của bạn.
