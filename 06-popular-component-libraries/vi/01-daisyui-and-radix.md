# DaisyUI & Radix UI: Class Đã Style Sẵn vs Primitive Headless 🎨

Khi xây dựng một ứng dụng React thực tế, bạn dành ra một lượng thời gian đáng kinh ngạc cho cùng một nhóm nhỏ các widget — button, card, navbar, modal, dropdown. Viết từng cái từ những chuỗi utility Tailwind thô (`px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600 …`) thì chậm, thiếu nhất quán, và accessibility thường bị xem là chuyện tính sau. Các component library giải quyết vấn đề này, nhưng chúng làm theo hai cách khác nhau về bản chất.

Bài học này tập trung vào hai library mà giảng viên trình diễn liên tiếp trong khóa học: **DaisyUI** — một Tailwind plugin trao cho bạn các class CSS được đặt tên theo ngữ nghĩa, dùng được ngay — và **Radix UI** — một tập hợp các primitive hành vi headless, hoàn toàn accessible mà bạn tự style. Chúng nằm ở *hai đầu đối lập* của cùng một quang phổ, và hiểu được vì sao mới chính là bài học thực sự. (Shadcn/ui, thứ kết hợp hành vi của Radix với cách style của Tailwind thành các file source có thể copy, được trình bày riêng ở bài 02.)

> [!NOTE]
> Giảng viên trình diễn việc cài DaisyUI vào một dự án Tailwind, kết nối nó vào phần plugins trong Tailwind config, và bật/tắt một modal DaisyUI; và riêng biệt là dựng một dự án Vite với Radix rồi bọc app trong `<Theme>` provider của Radix. Mọi thứ ở đây đều dựa trên bản demo đó. Một vài chi tiết là **hoàn toàn mới** so với bản ghi hình — cụ thể là **cách thiết lập CSS-first `@plugin` cho Tailwind v4** với DaisyUI 5, theme switcher lưu vào `localStorage`, và ví dụ Radix `DropdownMenu` điều hướng được hoàn toàn bằng bàn phím. Những điều đó phản ánh best practice hiện tại (2026) và được chú thích rõ ở những chỗ xuất hiện.

---

## 🌍 Khái Niệm & Tổng Quan

Một component library là một bộ công cụ dựng sẵn để bạn không phải phát minh lại cùng một button trong mọi dự án. Nhưng hai bộ công cụ có thể đối lập nhau về mặt triết lý.

**DaisyUI** trao cho bạn món đồ nội thất đã hoàn thiện, đã sơn: bạn viết `class="btn btn-primary"` và một button đã được style xuất hiện. Nó là *CSS thuần túy* — không có một dòng JavaScript nào được ship đi. Điều đó khiến nó nhỏ gọn và độc lập với framework, nhưng cũng có nghĩa là bất cứ thứ gì *có tính tương tác* (modal mở ra, dropdown bật/tắt) đều không có bộ não riêng. Bạn cung cấp bộ não đó bằng React.

**Radix UI** trao cho bạn điều ngược lại: một *cơ chế* hoạt động được nhưng không có nước sơn. Một `Dialog` của Radix đã sẵn sàng giữ focus, đóng khi nhấn `Esc`, trả focus về trigger, thiết lập mọi thuộc tính ARIA, và khóa cuộn body — nhưng nó render ra hoàn toàn không có style. Bạn mang Tailwind đến.

### Một Phép Ẩn Dụ Đời Thực 🏠

Hãy nghĩ về việc trang bị nội thất cho một căn phòng:

| Cách tiếp cận | Phép so sánh đời thực | Library | Cái bạn được miễn phí | Cái bạn phải tự thêm |
| :--- | :--- | :--- | :--- | :--- |
| Utility chỉ-CSS | Mua một chiếc ghế đã hoàn thiện, đã sơn từ cửa hàng | **DaisyUI** | Styling, theme, vẻ ngoài | Hành vi — tự nối `useState` cho modal/dropdown |
| Headless / không style | Mua một *cơ chế* ghế ngả hoạt động được rồi tự bọc nệm | **Radix UI** | Hành vi + accessibility (focus, bàn phím, ARIA) | Từng pixel của việc styling |

Điểm chốt lại: **DaisyUI cho bạn styling miễn phí nhưng không có hành vi; Radix cho bạn hành vi miễn phí nhưng không có styling.** Chúng không phải đối thủ — nhiều ứng dụng production dùng *cả hai*, DaisyUI cho layout và các widget nhanh, Radix cho những phần tương tác bắt buộc phải accessible.

### Các tầng liên hệ với nhau như thế nào

```text
                Tailwind CSS  (utility classes)
                      │
        ┌─────────────┴──────────────┐
        ▼                            ▼
   DaisyUI                      (your hand-written
   (semantic classes:           Tailwind classes)
    btn, card, modal,                 ▲
    navbar, dropdown)                 │
        │                            │
   PURE CSS                     applied on top of
   no JavaScript                      │
                                      ▼
                                 Radix UI
                                 (headless behavior:
                                  focus trap, Esc,
                                  ARIA, keyboard nav)
                                 NO styling of its own
```

> [!WARNING]
> DaisyUI ship **không một dòng JavaScript nào**. Các phần tử tương tác như modal, dropdown và accordion **không** tự mở và đóng. Bạn phải điều khiển chúng bằng React state (`useState`) hoặc một CSS toggle. Người mới thường nghĩ DaisyUI bị "hỏng" khi một modal không chịu mở — thực ra nó đang hoạt động đúng như thiết kế. Radix thì ngược lại: nó có toàn bộ hành vi và *không có* styling, nên một Radix dialog mà bạn quên style sẽ trông như HTML không có style.

---

## ⚡ 1. DaisyUI — Các Class Theo Ngữ Nghĩa Đặt Trên Tailwind

**DaisyUI** là một plugin của Tailwind CSS. Thay vì viết một chuỗi utility dài cho mỗi button, bạn dùng một tên class theo ngữ nghĩa. Như giảng viên diễn đạt: "thay vì viết tất cả những class Tailwind CSS này, bạn không còn phải làm vậy nữa — bây giờ bạn có thể dùng DaisyUI để chỉ viết vài class và nó sẽ cho bạn cùng một kết quả."

```html
<!-- Without DaisyUI: a wall of utilities, repeated everywhere -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
  Click me
</button>

<!-- With DaisyUI: one semantic class, themed automatically -->
<button class="btn btn-primary">Click me</button>
```

Các class component DaisyUI phổ biến mà bạn sẽ dùng đến liên tục:

| Nhóm class | Mục đích | Ví dụ |
| :--- | :--- | :--- |
| `btn` | Button, với các modifier màu | `btn btn-primary`, `btn btn-ghost`, `btn-sm` |
| `card` | Card nội dung | `card`, `card-body`, `card-title` |
| `navbar` | Thanh điều hướng trên cùng | `navbar`, `navbar-start`, `navbar-center`, `navbar-end` |
| `modal` | Hộp thoại (cần React để bật/tắt) | `modal`, `modal-box`, `modal-action`, `modal-open` |
| `dropdown` | Menu (cần React/CSS để bật/tắt) | `dropdown`, `dropdown-content` |
| `select` / `input` | Các control của form | `select select-bordered`, `input input-bordered` |

### 🛠️ Cài Đặt & Thiết Lập

Luồng của giảng viên là: dựng một dự án Vite + Tailwind, sau đó thêm DaisyUI làm dev dependency và đăng ký nó như một Tailwind plugin. Có **hai** cách thiết lập hợp lệ tùy theo phiên bản Tailwind của bạn.

**Cách A — Tailwind v3 (mảng plugins trong `tailwind.config.js`):**

```bash
npm install -D daisyui@latest
```

```javascript
// tailwind.config.js — Tailwind v3 style
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  // Register DaisyUI as a Tailwind plugin
  plugins: [require("daisyui")],
  // Enable the themes you want available at runtime
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
};
```

**Cách B — Tailwind v4 + DaisyUI 5 (CSS-first, HOÀN TOÀN MỚI):**

> [!NOTE]
> Dạng CSS-first này là **hoàn toàn mới** so với bản ghi hình. Tailwind v4 đã bỏ file JS config để chuyển sang cấu hình trực tiếp bên trong CSS entry point của bạn. Với DaisyUI 5, bạn đăng ký nó bằng `@plugin` và khai báo các theme bằng `@plugin "daisyui" { themes: ... }`. Hoàn toàn không có `tailwind.config.js`.

```css
/* src/index.css — Tailwind v4 + DaisyUI 5 */
@import "tailwindcss";

/* Register the DaisyUI plugin and enable themes in one block */
@plugin "daisyui" {
  themes: light --default, dark --prefersdark, cupcake;
}
```

Dù theo cách nào, một khi đã cài xong, bạn có thể đặt thẳng các class DaisyUI vào JSX:

```tsx
// src/App.tsx — DaisyUI classes, no extra config needed in the component
export default function App() {
  return (
    <div className="p-8 flex flex-wrap gap-3">
      <button className="btn">Neutral</button>
      <button className="btn btn-primary">Primary</button>
      <button className="btn btn-secondary">Secondary</button>
      <button className="btn btn-accent">Accent</button>
      <button className="btn btn-ghost">Ghost</button>
    </div>
  );
}
```

### 🧩 Một Modal DaisyUI — Vì Sao Nó Cần `useState`

Trong bản demo, giảng viên copy phần markup modal của DaisyUI và phát hiện nó chỉ mở ra khi React điều khiển. Bởi DaisyUI là CSS thuần túy, trạng thái mở/đóng của modal chỉ đơn giản là sự có mặt hay vắng mặt của class `modal-open` — và *bạn* là người quyết định khi nào class đó được áp dụng.

```tsx
// src/DaisyModal.tsx
import { useState } from "react";

export function DaisyModal() {
  // DaisyUI has no JS, so WE own the open/closed state.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      {/* The trigger button uses DaisyUI's btn classes */}
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>

      {/*
        The `modal-open` class is what actually makes the modal visible.
        We toggle it from React state — without this line nothing happens.
      */}
      <div className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Hello DaisyUI!</h3>
          <p className="py-4">
            This modal is styled by DaisyUI but opened/closed by React state.
          </p>
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

> [!WARNING]
> Hãy để ý những thứ DaisyUI **không** cho bạn ở đây: nhấn `Esc` không đóng modal này, focus không bị giữ bên trong nó, và click vào lớp backdrop bị làm mờ chẳng làm gì cả — trừ khi bạn tự nối tất cả những thứ đó. Khoảng trống accessibility đó chính là vấn đề mà Radix giải quyết trong phần tiếp theo.

### 🎨 Đổi Theme Trực Tiếp với `data-theme`

Tính năng đặc trưng của DaisyUI là theming. Mọi theme được áp dụng thông qua một thuộc tính HTML duy nhất — `data-theme` — trên một phần tử bao ngoài. Mọi token màu của DaisyUI (`bg-base-100`, `text-base-content`, `btn-primary`, …) nằm dưới phần tử đó sẽ tự động đổi màu. Bởi vì nó *chỉ là một thuộc tính*, việc đổi theme lúc runtime chỉ là một lần cập nhật React state.

```tsx
// src/ThemeSwitcher.tsx
import { useState } from "react";

// These must match the themes you enabled in your DaisyUI config.
const THEMES = ["light", "dark", "cupcake"] as const;
type Theme = (typeof THEMES)[number];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    // The data-theme attribute drives EVERY DaisyUI color below it.
    <div
      data-theme={theme}
      className="min-h-screen p-8 bg-base-100 text-base-content"
    >
      <h1 className="text-2xl font-bold mb-4">Current theme: {theme}</h1>

      <select
        className="select select-bordered mb-6"
        value={theme}
        // Update state -> data-theme changes -> the subtree recolors instantly.
        onChange={(e) => setTheme(e.target.value as Theme)}
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button className="btn btn-primary">Primary</button>
        <button className="btn btn-secondary">Secondary</button>
        <button className="btn btn-accent">Accent</button>
      </div>
    </div>
  );
}
```

> [!TIP]
> Để lựa chọn này sống sót qua một lần tải lại trang (HOÀN TOÀN MỚI — không có trong bản ghi hình), hãy lưu nó vào `localStorage` và áp dụng nó lên document root. Đặt `data-theme` lên `<html>` sẽ theme *toàn bộ* trang, bao gồm cả nội dung được portal render ra bên ngoài cây component của bạn.

```tsx
// src/usePersistedTheme.ts — a reusable theme hook with persistence
import { useEffect, useState } from "react";

const THEMES = ["light", "dark", "cupcake"] as const;
export type Theme = (typeof THEMES)[number];

const STORAGE_KEY = "app-theme";

export function usePersistedTheme() {
  // Lazy initializer reads the saved theme ONCE on first render.
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved ?? "light";
  });

  // Whenever theme changes: apply it to <html> and persist it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme, themes: THEMES };
}
```

```tsx
// src/ThemePicker.tsx — consuming the persisted hook
import { usePersistedTheme } from "./usePersistedTheme";

export function ThemePicker() {
  const { theme, setTheme, themes } = usePersistedTheme();

  return (
    <select
      className="select select-bordered"
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
    >
      {themes.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
```

---

## ⚡ 2. Radix UI — Các Primitive Headless, Accessible

**Radix UI** được mô tả trong khóa học là "một component library mã nguồn mở được tối ưu cho phát triển nhanh, bảo trì dễ dàng, và accessibility — chỉ cần import và dùng." Nó ship hai thứ riêng biệt, và điều cốt yếu là không được nhầm lẫn chúng:

| Package | Nó là gì | Khi nào dùng |
| :--- | :--- | :--- |
| `@radix-ui/themes` | Một design system **đã được style sẵn** (Button, Card, Flex…) được bọc trong một `<Theme>` provider | Bạn muốn có component đẹp mắt nhanh chóng với ít công sức styling nhất |
| `@radix-ui/react-*` (vd. `react-dialog`, `react-dropdown-menu`) | **Các primitive headless** — hành vi + accessibility, không có styling | Bạn muốn toàn quyền kiểm soát thiết kế và mang Tailwind của riêng bạn vào |

Giảng viên trình diễn Radix **Themes**: dựng một app Vite, import CSS của Radix một lần, và bọc app trong `<Theme>`. Mẫu hình phổ biến hơn nhiều trong production — và là mẫu hình đi cùng với chủ đề "headless" của bài học này — là dùng trực tiếp các **primitive**. Chúng ta sẽ trình bày cả hai.

### 🛠️ Radix Themes (bản demo của giảng viên)

```bash
# Scaffold a Vite + React project, then install Radix Themes
npm create vite@latest radix-demo -- --template react-ts
cd radix-demo
npm install
npm install @radix-ui/themes
```

```tsx
// src/main.tsx — import the CSS ONCE and wrap the app in <Theme>
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css"; // Radix Themes base styles — import exactly once
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* <Theme> is Radix's provider: it sets the accent color, radius,
        scaling, and light/dark appearance for everything inside it. */}
    <Theme accentColor="iris" radius="large" appearance="light">
      <App />
    </Theme>
  </React.StrictMode>
);
```

```tsx
// src/App.tsx — using pre-built, pre-styled Radix Themes components
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";

export default function App() {
  return (
    <Card size="3" style={{ maxWidth: 360, margin: "40px auto" }}>
      <Flex direction="column" gap="3">
        <Heading>Hello from the Radix theme</Heading>
        <Text color="gray">Styled entirely by the tokens in &lt;Theme&gt;.</Text>
        <Button>Get Started</Button>
      </Flex>
    </Card>
  );
}
```

> [!NOTE]
> Trong bản demo, sau khi bọc app, giảng viên xóa sạch `App.css` và `index.css` mặc định để các style khởi tạo của Vite ngừng xung đột với Radix theme. Nếu app Radix Themes của bạn "trông không ngầu," thì thủ phạm thường gặp là phần CSS boilerplate còn sót lại đang ghi đè lên các token của Radix.

### 🧩 Radix Primitives — Xây Một Dialog Accessible Được Style Bằng Tailwind

Đây là luồng làm việc headless khiến Radix trở nên đặc biệt. Bạn cài một primitive duy nhất và áp dụng các class Tailwind *của riêng bạn*. Primitive lo việc giữ focus, `Esc`-để-đóng, trả focus về trigger, các vai trò ARIA, và khóa cuộn body — miễn phí.

```bash
# Install only the primitive you need — each is a separate package
npm install @radix-ui/react-dialog
```

```tsx
// src/ConfirmDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";

export function ConfirmDialog() {
  return (
    // Dialog.Root owns the open/closed state INTERNALLY — no useState needed.
    <Dialog.Root>
      {/* Trigger is the button that opens the dialog. We style it with Tailwind. */}
      <Dialog.Trigger className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
        Delete account
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay = the dimmed backdrop. Radix renders it; we paint it. */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in" />

        {/* Content = the dialog box. Radix gives it focus trap + Esc + ARIA. */}
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl focus:outline-none">
          {/* Title and Description are wired to aria-labelledby/aria-describedby */}
          <Dialog.Title className="text-lg font-bold text-slate-900">
            Are you absolutely sure?
          </Dialog.Title>
          <Dialog.Description className="py-2 text-sm text-slate-600">
            This action cannot be undone. Your account and all data will be
            permanently removed.
          </Dialog.Description>

          <div className="mt-4 flex justify-end gap-2">
            {/* Dialog.Close closes the dialog from anywhere inside it */}
            <Dialog.Close className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
              Cancel
            </Dialog.Close>
            <Dialog.Close className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Yes, delete it
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

> [!NOTE]
> Hãy nhìn kỹ: ở đây **không có `useState`** nào cả. `Dialog.Root` tự sở hữu trạng thái mở. Hãy đối chiếu với modal DaisyUI lúc nãy, nơi *bạn* theo dõi `isOpen` thủ công. Đó là sự đánh đổi cốt lõi được nhắc lại — Radix cho hành vi miễn phí; DaisyUI cho styling miễn phí.

### 🧩 Một DropdownMenu Điều Hướng Hoàn Toàn Bằng Bàn Phím (HOÀN TOÀN MỚI)

> [!NOTE]
> Ví dụ `DropdownMenu` này là **hoàn toàn mới** so với bản ghi hình, được đưa vào để cho thấy phần thưởng về accessibility của các primitive headless. Menu bên dưới hỗ trợ điều hướng bằng phím mũi tên, gõ-để-tìm (type-ahead), `Esc` để đóng, và `Enter`/`Space` để kích hoạt — tất cả đều do Radix cung cấp, không cái nào do bạn viết.

```bash
npm install @radix-ui/react-dropdown-menu
```

```tsx
// src/UserMenu.tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

type UserMenuProps = {
  // Typed callbacks so the parent decides what each action does.
  onProfile: () => void;
  onSettings: () => void;
  onSignOut: () => void;
};

export function UserMenu({ onProfile, onSettings, onSignOut }: UserMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded bg-slate-800 px-4 py-2 text-white">
        Account ▾
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        {/* Radix gives this menu: ↑/↓ to move, type-ahead, Esc to close,
            Enter/Space to select, and full focus management. */}
        <DropdownMenu.Content
          sideOffset={6}
          className="min-w-[200px] rounded-md border border-slate-200 bg-white p-1 shadow-lg"
        >
          <DropdownMenu.Item
            onSelect={onProfile}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100"
          >
            Profile
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={onSettings}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm outline-none data-[highlighted]:bg-slate-100"
          >
            Settings
          </DropdownMenu.Item>

          {/* A visual separator with the correct ARIA role baked in */}
          <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />

          <DropdownMenu.Item
            onSelect={onSignOut}
            className="flex cursor-pointer items-center rounded px-3 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

Các selector Tailwind `data-[highlighted]:` móc nối vào các data attribute của Radix: khi người dùng dùng phím mũi tên di chuyển qua menu, Radix đặt `data-highlighted` lên item đang được focus và Tailwind style nó. Bạn viết *các quy tắc styling gắn với các trạng thái hành vi mà Radix quản lý* — đó chính là mẫu hình headless gói gọn trong một câu.

---

## ⚡ 3. Chỉ-CSS vs Headless — Bảng Quyết Định

| Tiêu chí | DaisyUI (chỉ-CSS) | Radix UI (Headless) |
| :--- | :--- | :--- |
| **Cái được ship** | Class CSS thuần túy, không JavaScript | Component React, không CSS |
| **Chi phí bundle** | Cực nhỏ — chỉ CSS Tailwind đã purge | JS nhỏ cho mỗi primitive; không style |
| **Styling** | Được làm sẵn cho bạn (đã theme) | Bạn viết từng class |
| **Hành vi** | Bạn tự nối (`useState`) | Được làm sẵn cho bạn |
| **Accessibility** | Trách nhiệm của bạn | Tích hợp sẵn (focus, ARIA, bàn phím) |
| **Theming** | Hạng nhất qua `data-theme` | Qua class / token của riêng bạn |
| **Phụ thuộc framework** | Không (chạy trong bất kỳ HTML nào) | Riêng cho React |
| **Phù hợp nhất cho** | Prototype nhanh, trang marketing, layout, widget nhanh | UI tương tác phức tạp nơi a11y quan trọng: dialog, menu, tooltip, combobox |

> [!TIP]
> Câu trả lời chín chắn vào năm 2026 là "cả hai, ở các tầng khác nhau." Dùng DaisyUI cho lớp vỏ *tĩnh* của app — navbar, card, layout form, button — và với tay sang các primitive Radix ngay khi một widget cần tính tương tác thực sự và accessibility (một modal, một dropdown, một tooltip). Bạn thậm chí có thể style một primitive Radix *bằng* các class DaisyUI, vì các class DaisyUI chỉ là CSS.

---

## 🧠 Kiểm Tra Kiến Thức

Hãy trả lời những câu sau để kiểm tra mức độ hiểu của bạn. Click **Reveal Answer** để đối chiếu.

### 1. Vì sao một modal DaisyUI cần React `useState`, trong khi một `Dialog` của Radix thì không?
<details>
  <summary><b>Reveal Answer</b></summary>

  DaisyUI là **CSS thuần túy và ship không một dòng JavaScript nào**. Một modal DaisyUI chỉ hiển thị khi class `modal-open` có mặt, và không có gì trong DaisyUI thêm hay xóa class đó — nên *bạn* phải tự sở hữu trạng thái mở/đóng trong React (`const [isOpen, setIsOpen] = useState(false)`) và áp dụng `modal-open` một cách có điều kiện. Ngược lại, `Dialog.Root` của Radix là một component React có state, tự quản lý trạng thái mở/đóng của chính nó (và có expose các props `open`/`onOpenChange` nếu bạn muốn điều khiển nó). Đó là sự đánh đổi headless-vs-chỉ-CSS: Radix cho hành vi miễn phí, DaisyUI cho styling miễn phí.
</details>

### 2. Thuộc tính nào điều khiển theming của DaisyUI, và làm thế nào để thay đổi nó lúc runtime?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thuộc tính `data-theme` trên một phần tử bao ngoài (thường là `<html>` hoặc một `<div>` cấp cao nhất) điều khiển mọi token màu DaisyUI nằm dưới nó. Để đổi theme lúc runtime, bạn lưu theme đang dùng trong React state và bind nó: `<div data-theme={theme}>`, cập nhật `theme` từ một handler `onChange`. Vì nó chỉ là một thay đổi thuộc tính HTML, toàn bộ subtree sẽ đổi màu ở lần render tiếp theo — không cần thêm library nào. Đặt `data-theme` lên `document.documentElement` (`<html>`) sẽ theme toàn bộ trang bao gồm cả nội dung được portal render, và lưu nó vào `localStorage` để sống sót qua các lần tải lại.
</details>

### 3. "Headless" của Radix UI nghĩa là gì, và bạn được gì miễn phí?
<details>
  <summary><b>Reveal Answer</b></summary>

  "Headless" nghĩa là Radix cung cấp **hành vi và accessibility nhưng không có styling**. Một primitive Radix render ra DOM không style, và bạn áp dụng các class Tailwind/CSS của riêng mình. Miễn phí, bạn nhận được: giữ focus (focus ở lại bên trong dialog đang mở), `Esc`-để-đóng, khôi phục focus về trigger khi đóng, các vai trò ARIA đúng và nối `aria-labelledby`/`aria-describedby`, điều hướng bàn phím (phím mũi tên, gõ-để-tìm trong menu), và khóa cuộn body. Tự tay sao chép lại tất cả những điều này một cách chính xác thực sự khó, đó là lý do các headless library là lựa chọn tiêu chuẩn cho các component tương tác accessible.
</details>

### 4. Sự khác biệt giữa `@radix-ui/themes` và một package như `@radix-ui/react-dialog` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `@radix-ui/themes` là một **design system đã được style sẵn** — nó ship các component đã hoàn thiện, đẹp mắt (`Button`, `Card`, `Flex`, …) cùng một `<Theme>` provider thiết lập màu accent, radius, và appearance. Bạn import CSS của nó một lần và bọc app trong `<Theme>`. Các package `@radix-ui/react-*` (như `react-dialog`, `react-dropdown-menu`) là các **primitive headless** — chỉ hành vi và accessibility, hoàn toàn không style, được cài từng cái một. Dùng Themes để có tốc độ; dùng các primitive khi bạn muốn toàn quyền kiểm soát thiết kế và mang styling của riêng mình vào.
</details>

### 5. Khi nào bạn nên với tay sang DaisyUI so với Radix, và bạn có thể dùng cả hai không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Với tay sang **DaisyUI** để style nhanh UI tĩnh — navbar, card, button, layout form, trang marketing — nơi bạn muốn ngay lập tức một vẻ ngoài bóng bẩy với các theme tích hợp sẵn và tính tương tác là tối thiểu. Với tay sang **các primitive Radix** ngay khi một widget bắt buộc phải tương tác thực sự *và* accessible: dialog, dropdown menu, tooltip, combobox, popover. Và đúng vậy — bạn hoàn toàn có thể dùng cả hai trong một app: DaisyUI cho lớp vỏ/layout, Radix cho các phần tương tác accessible. Vì các class DaisyUI chỉ là CSS, bạn thậm chí có thể áp dụng chúng lên các phần tử của một primitive Radix.
</details>

---

## 💻 Bài Tập Thực Hành

### 🛠️ Bài Tập 1: Navbar DaisyUI với Theme Switcher Được Lưu Lại

**Mục tiêu:** Xây một navbar responsive mà lựa chọn theme của nó sống sót qua một lần refresh trang.

**Nhiệm vụ:**
1. Dựng một dự án Vite + React + Tailwind và cài DaisyUI. Bật ít nhất ba theme (`light`, `dark`, `cupcake`).
2. Xây một navbar dùng `navbar`, `navbar-start`, `navbar-center`, và `navbar-end`.
3. Đặt một `<select>` chọn theme vào `navbar-end`, được hỗ trợ bởi hook `usePersistedTheme` từ bài học này.
4. **Bonus:** Thêm một `dropdown` DaisyUI cho một menu "Profile / Settings / Logout" và bật/tắt nó bằng `useState` — quan sát tận mắt rằng nó không có điều hướng bàn phím, tạo động lực cho Bài Tập 2.

**Khởi đầu:**

```tsx
// src/Navbar.tsx — fill in the marked spots
import { usePersistedTheme } from "./usePersistedTheme";

export function Navbar() {
  const { theme, setTheme, themes } = usePersistedTheme();

  return (
    <div className="navbar bg-base-100 shadow">
      <div className="navbar-start">
        <a className="btn btn-ghost text-xl">MyApp</a>
      </div>

      <div className="navbar-center hidden md:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a>Home</a></li>
          <li><a>Docs</a></li>
        </ul>
      </div>

      <div className="navbar-end">
        {/* TODO: render a <select> bound to `theme` / `setTheme`,
            mapping over `themes` to produce <option>s. */}
      </div>
    </div>
  );
}
```

### 🛠️ Bài Tập 2: Một Radix Dialog Được Style Bằng Tailwind — Chứng Minh A11y

**Mục tiêu:** Xây một dialog xác nhận accessible bằng một primitive Radix (không dùng Shadcn CLI) và kiểm chứng hành vi mà bạn nhận được miễn phí.

**Nhiệm vụ:**
1. Chỉ cài `@radix-ui/react-dialog`.
2. Xây một dialog từ `Dialog.Root`, `Dialog.Trigger`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, và `Dialog.Close`, style từng cái bằng các class Tailwind của riêng bạn (bắt đầu từ `ConfirmDialog` ở trên).
3. **Kiểm chứng accessibility miễn phí:** mở dialog và xác nhận rằng (a) `Tab` chỉ xoay vòng qua các phần tử *bên trong* dialog (focus bị giữ), (b) `Esc` đóng nó, và (c) focus quay về button trigger khi đóng. Thử điều tương tự với modal DaisyUI từ phần bonus của Bài Tập 1 — lưu ý rằng không cái nào trong số này hoạt động.
4. **Suy ngẫm:** Đếm số dòng code quản lý state mà bạn đã viết cho Radix dialog (bằng không) so với modal DaisyUI (`useState` + class có điều kiện + các handler đóng thủ công). Sự khác biệt đó *chính là* sự đánh đổi headless-vs-chỉ-CSS.

**Khởi đầu:**

```tsx
// src/DeleteConfirm.tsx — complete the Content section
import * as Dialog from "@radix-ui/react-dialog";

type DeleteConfirmProps = {
  itemName: string;
  onConfirm: () => void;
};

export function DeleteConfirm({ itemName, onConfirm }: DeleteConfirmProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded bg-red-600 px-4 py-2 text-white">
        Delete {itemName}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          {/* TODO:
              - Dialog.Title and Dialog.Description
              - a Cancel button (Dialog.Close)
              - a confirm button that calls onConfirm() then closes
                (wrap the confirm button in <Dialog.Close asChild> so it
                both fires onConfirm and dismisses the dialog) */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```
