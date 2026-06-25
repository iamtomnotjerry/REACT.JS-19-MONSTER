# Storybook: Phát Triển & Tài Liệu Hóa Component Một Cách Độc Lập 📖

Khi bạn xây dựng một button, một input hay một modal, thông thường bạn chỉ *nhìn thấy* nó sau khi đã gắn vào một trang, click qua ba route và ép nó vào đúng trạng thái cần xem. **Storybook** đảo ngược điều đó. Nó là một công cụ mã nguồn mở để phát triển và kiểm thử các UI component **một cách độc lập** — bên ngoài ứng dụng chính của bạn — để bạn có thể xây dựng, kiểm thử và trình diễn từng mảnh UI riêng lẻ *trước khi* nó được tích hợp vào phần còn lại của ứng dụng.

Trong bài học này, chúng ta sẽ xây dựng nhiều story từ đầu: một button và một input, sau đó là một story "combo" kết hợp. Chúng ta sẽ tìm hiểu **args**, panel **Controls** tương tác, **argTypes** cho các loại control, việc **nesting** (lồng) và **renaming** (đổi tên) story, **parameters** (layout & backgrounds), ba cấp độ của **decorators**, việc gán kiểu **TypeScript** đầy đủ với `Meta` và `StoryObj`, **addons**, và cuối cùng là **Autodocs** để tự động tạo tài liệu sống.

> [!NOTE]
> Storybook tỏa sáng với các **ứng dụng quy mô doanh nghiệp lớn và design system** — nơi nhiều người cùng xây dựng nhiều component tái sử dụng. Với một trang portfolio nhỏ thì bạn *có thể* dùng nó, nhưng chi phí thiết lập hiếm khi xứng đáng. Hãy dùng nó khi việc tái sử dụng component, tính nhất quán về mặt hình ảnh và tài liệu thực sự quan trọng.

---

## ⚡ 1. Storybook Là Gì & Tại Sao Dùng Nó?

Hãy hình dung Storybook như một **studio chụp ảnh cho các component của bạn**. Trong studio, bạn đặt một sản phẩm duy nhất trên phông nền sạch, thay đổi ánh sáng, đổi đạo cụ và chụp từ mọi góc độ — không bị nhiễu bởi phần còn lại của phòng trưng bày. Storybook làm điều tương tự cho UI: nó cô lập một component và cho phép bạn thử nghiệm mọi trạng thái hình ảnh theo ý muốn.

Nó mang lại bốn lợi ích lớn:

| Lợi ích | Ý nghĩa | Vì sao quan trọng |
| :--- | :--- | :--- |
| **Cô lập component** | Xây & kiểm thử một component mà không cần chạy cả ứng dụng. | Bạn tập trung vào hành vi của *một* component, không phải toàn bộ tầng routing/dữ liệu. |
| **Kiểm thử trực quan** | Giao diện trực quan để xem mọi trạng thái: theme, kích thước, dữ liệu đầu vào, disabled/loading. | Bắt lỗi hình ảnh/hành vi *sớm*, trước khi tích hợp. |
| **Tài liệu sống** | Mỗi "story" là một use case được tài liệu hóa, tự động hiển thị trong UI. | Tài liệu luôn đồng bộ khi component thay đổi. |
| **Addons** | Tiện ích mở rộng cho kiểm tra a11y, kiểm thử responsive, kiểm thử tương tác và hơn nữa. | Mở rộng Storybook cho phù hợp quy trình của nhóm. |

> [!TIP]
> Một **story** là một ví dụ được render đơn lẻ, có tên, của một component ở một trạng thái cụ thể (ví dụ `Primary`, `Disabled`, `Loading`). Một file component thường sở hữu *nhiều* story — mỗi "phiên bản" hình ảnh một story.

---

## ⚡ 2. Cài Đặt & Khởi Tạo

Storybook không chỉ giới hạn cho React — nó hoạt động với Svelte, Vue và các framework khác. Bắt đầu với một ứng dụng React bất kỳ (Vite hoặc Create React App), rồi khởi tạo Storybook lên trên nó.

```bash
# 1. Create a fresh React + TypeScript project (Vite)
npm create vite@latest storybook-demos
#    → choose "React" then "TypeScript"
cd storybook-demos
npm install

# 2. Initialize Storybook inside the existing project
npx storybook@latest init
#    (the older shorthand `npx sb init` also works)
```

Lệnh `init` kiểm tra project của bạn, cài đặt đúng các gói Storybook và tạo khung cho hai thứ:

1. Một thư mục **`.storybook/`** chứa các file cấu hình.
2. Một thư mục **`src/stories/`** với các story ví dụ (Button, Header, Page) mà bạn có thể nghiên cứu rồi xóa.

Chạy nó bằng:

```bash
npm run storybook
```

Lệnh này khởi động giao diện Storybook trong trình duyệt của bạn. Bạn có thể xây dựng không chỉ một button đơn giản, mà cả những header hoàn chỉnh và thậm chí cả các trang đầy đủ — và tài liệu hóa từng cái một.

### Các file cấu hình `.storybook/`

```text
.storybook/
├── main.ts      ← Setup & behavior config: where stories live, which addons load,
│                  bundler (Vite/Webpack) config, framework, etc.
└── preview.ts   ← Preview config: how stories are RENDERED & displayed in the UI
                   (global decorators, global parameters, backgrounds, etc.)
```

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // Glob telling Storybook where to find your story files
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  // Default addons added by `init`
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};

export default config;
```

---

## ⚡ 3. Story Đầu Tiên Của Bạn (CSF — Component Story Format)

Xóa thư mục `src/stories/` được tạo sẵn và tự tạo lại của riêng bạn. Story sử dụng **CSF (Component Story Format)**: một file `.stories.tsx` thuần với một **default export** (metadata) và một hoặc nhiều **named export** (các story).

Đầu tiên, một component thuần (chưa dùng TypeScript — chúng ta sẽ thêm kiểu sau để bạn tập trung vào cú pháp Storybook):

```jsx
// src/stories/components/Button.jsx
const Button = (props) => {
  // Spread every prop straight onto the button for now
  return <button {...props}>Click me</button>;
};

export default Button;
```

Bây giờ là file story của nó — chú ý mẫu tên file `Name.stories.tsx`:

```jsx
// src/stories/Button.stories.jsx
import Button from "./components/Button";

// The DEFAULT export = metadata about this set of stories
export default {
  title: "components/Button", // Where it appears in the sidebar tree
  component: Button,          // The component these stories exercise
};

// A NAMED export = one story (one "flavor" of the component)
export const Primary = () => <Button />;
```

> [!NOTE]
> `title` điều khiển nhãn và cấu trúc thư mục trong sidebar. `component` cho Storybook biết những story này tài liệu hóa component nào. Mỗi **named export** trở thành một story có thể chọn trong sidebar.

---

## ⚡ 4. Các Biến Thể (Phiên Bản) Mà Không Cần Copy-Paste

Làm cho component nhận các prop tùy ý để mỗi story có thể cấu hình nó khác nhau — không cần nhân bản component:

```jsx
// src/stories/components/Button.jsx
const Button = (props) => {
  // Spread all incoming props so each story can customize the button
  return <button {...props}>Button</button>;
};

export default Button;
```

```jsx
// src/stories/Button.stories.jsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
};

// Three "flavors" of the same component — driven purely by props
export const Primary = () => <Button variant="primary" />;
export const Secondary = () => <Button variant="secondary" />;
export const Danger = () => <Button variant="danger" />;
```

Mỗi named export hiện ra như một biến thể riêng biệt dưới mục `Button` trong sidebar — tất cả từ một component, được cấu hình bằng các prop khác nhau.

---

## ⚡ 5. Args & Panel Controls

Việc hard-code các prop bên trong các arrow function là **cách cũ**. **Cách hiện đại** là export một **object** với trường `args`. **Args** là các giá trị của những prop được truyền vào component. Chúng cho phép bạn:

- truyền prop vào component,
- điều khiển hành vi của nó một cách **tương tác** trong UI,
- và tài liệu hóa các prop của component.

```tsx
// src/stories/components/Button.tsx
interface ButtonProps {
  label: string;
  primary?: boolean;            // optional
  onClick?: () => void;         // optional
}

const Button = ({ label, primary = false, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: primary ? "blue" : "gray",
        color: "white",
        padding: 10,
        border: "none",
        borderRadius: 5,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
```

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
};

// MODERN way: a story is an object with `args` (props for this story)
export const Primary = {
  args: {
    primary: true,
    label: "Label of button",
    onClick: () => console.log("You clicked me!"), // logs on click
  },
};
```

Mở một story và click vào tab **Controls** (hoặc nhấn `Alt + A`) để hiện ra **panel Controls**. Ở đó bạn có thể bật/tắt `primary`, gõ lại `label`, và click button để kích hoạt `onClick` — tất cả ngay trực tiếp, không cần thay đổi code.

> [!TIP]
> Panel Controls là trái tim của tính tương tác trong Storybook. Args cung cấp dữ liệu cho panel; panel cung cấp dữ liệu cho component. Thay đổi một giá trị và component được render sẽ re-render tức thì — hoàn hảo để kiểm thử mọi trạng thái một cách độc lập.

---

## ⚡ 6. argTypes & Các Loại Control

`args` đặt *giá trị*; **`argTypes`** cho Storybook biết *mỗi prop nên được chỉnh sửa như thế nào* trong panel Controls. Chúng là metadata ánh xạ một prop tới một widget control cụ thể — một bộ chọn màu, một dropdown, một bộ tăng giảm số, v.v.

```tsx
// src/stories/components/Button.tsx
interface ButtonProps {
  label: string;
  backgroundColor: string;
  size: "small" | "medium" | "large";
  borderRadius: number;
  fontSize: string;
  textColor: string;
}

const sizeStyles = {
  small: "5px 10px",
  medium: "10px 20px",
  large: "15px 30px",
};

const Button = ({
  label,
  backgroundColor,
  size,
  borderRadius,
  fontSize,
  textColor,
}: ButtonProps) => {
  return (
    <button
      style={{
        backgroundColor,
        padding: sizeStyles[size],
        borderRadius: `${borderRadius}px`,
        fontSize,
        color: textColor,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
```

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
  // argTypes = HOW each prop is edited in the Controls panel
  argTypes: {
    backgroundColor: { control: "color" }, // color picker
    size: {
      control: "select",                   // dropdown
      options: ["small", "medium", "large"],
    },
    label: {
      control: "text",                     // text input
      description: "Text displayed on the button",
    },
    borderRadius: {
      control: "number",                   // number stepper
      min: 0,
      max: 50,
      step: 1,
    },
  },
};

export const Primary = {
  args: {
    label: "Click me",
    backgroundColor: "#007BFF",
    size: "medium",
    borderRadius: 4,
    fontSize: "16px",
    textColor: "#FFF",
  },
};

export const Secondary = {
  args: {
    label: "Click me",
    backgroundColor: "#6c757d",
    size: "medium",
    borderRadius: 4,
    fontSize: "16px",
    textColor: "#FFF",
  },
};
```

Dưới đây là cách các loại control phổ biến được ánh xạ:

| Giá trị `control` | Widget hiển thị | Phù hợp cho |
| :--- | :--- | :--- |
| `"color"` | Bộ chọn màu | các prop hex / rgb (ví dụ `backgroundColor`) |
| `"select"` | Dropdown (cần `options`) | một tập lựa chọn cố định (ví dụ `size`) |
| `"text"` | Ô nhập text | các chuỗi tự do (ví dụ `label`) |
| `"number"` | Bộ tăng giảm số (`min` / `max` / `step`) | các prop dạng số (ví dụ `borderRadius`) |
| `"boolean"` | Công tắc bật/tắt | các cờ true/false (ví dụ `disabled`) |

---

## ⚡ 7. Tổ Chức Story: Nesting & Renaming

### 🧩 Nesting qua dấu gạch chéo trong `title`

Chuỗi `title` dùng **dấu gạch chéo** để xây cây thư mục trong sidebar. Mỗi `/` tạo thêm một cấp lồng:

```tsx
export default {
  title: "products/buttons", // → "products" folder → "buttons" subfolder
  component: Button,
};
// Sidebar: products ▸ buttons ▸ Primary
```

```tsx
export default {
  title: "special/products/buttons", // 3 levels deep
  component: Button,
};
```

### 🧩 Đổi tên một story với `storyName`

Mặc định, nhãn sidebar của một story là tên export của nó. Bạn có thể ghi đè bằng **`storyName`** (một kỹ thuật cũ nhưng tiện):

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
};

export const Primary = () => <Button variant="primary" />;
Primary.storyName = "Blue Button"; // sidebar shows "Blue Button"

export const Secondary = () => <Button variant="secondary" />;
Secondary.storyName = "Green Button";

export const Danger = () => <Button variant="danger" />;
Danger.storyName = "Red Button";
```

> [!NOTE]
> `storyName` chỉ thay đổi **nhãn hiển thị** — tên export vẫn định danh story trong code. Với cú pháp object hiện đại + `args` thì bạn hiếm khi cần nó, nhưng nó hữu ích cho các nhãn thân thiện với con người.

---

## ⚡ 8. Combo Stories (một Story Bên Trong một Story)

Bạn không bị giới hạn ở một component mỗi story. Để trình diễn nhiều component cùng nhau, hãy render một component bao bọc nhỏ thay vì trỏ tới một `component` duy nhất:

```tsx
// src/stories/Combo.stories.tsx
import Input from "./components/Input";
import Button from "./components/Button";

export default {
  title: "combo/components",
};

// A custom component that combines several others
export const Combo = () => (
  <div>
    <Input placeholder="Enter whatever you prefer" size="20rem" />
    <Button primary label="Submit" />
  </div>
);
```

Cách này rất hợp để tài liệu hóa cách các component trông như thế nào **cạnh nhau** — một layout form, một thanh toolbar, một card có các action.

---

## ⚡ 9. Parameters: Diện Mạo & Cảm Giác của Canvas

**Parameters** thay đổi diện mạo và cảm giác của *canvas* Storybook (vùng nơi component của bạn được render) và các panel. Hai cách dùng phổ biến là căn giữa component và cấu hình các mẫu màu nền.

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
  parameters: {
    layout: "centered", // center the component in the canvas
    controls: { expanded: true }, // show description + default columns in Controls
    backgrounds: {
      default: "light", // initially selected background
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "dark", value: "#333333" },
        { name: "sky blue", value: "#00BCD4" },
        { name: "hot pink", value: "#FF69B4" },
      ],
    },
  },
};
```

`layout` nhận `"centered"`, `"fullscreen"`, hoặc `"padded"` (mặc định). Thanh công cụ `backgrounds` cho phép bạn đổi phông nền của canvas giữa các mẫu màu bạn đã định nghĩa để kiểm tra độ tương phản.

---

## ⚡ 10. Decorators: Ba Cấp Độ Bao Bọc

Một **decorator** là một hàm **bao bọc** một story, cho phép bạn tiêm thêm layout, styling hoặc context (như một theme provider hay router) xung quanh component được render. Nó nhận `Story` và trả về nó được bao bọc trong bất cứ thứ gì bạn muốn.

Có **ba cấp độ**, từ phạm vi hẹp nhất đến rộng nhất:

| Cấp độ | Nơi định nghĩa | Áp dụng cho |
| :--- | :--- | :--- |
| **Variation** | Trên một export story đơn lẻ | Chỉ đúng một story đó |
| **Local** | Trên `default export` (meta) | Mọi story trong file đó |
| **Global** | Trong `.storybook/preview.ts` | Mọi story trong toàn project |

### 🛠️ Cấp Variation (chỉ một story)

```tsx
// Applies ONLY to this single story
export const Default = {
  args: { label: "Click me", color: "#007BFF", disabled: false },
  // variation-only decorator
  decorators: [
    (Story: any) => (
      <div style={{ padding: 20, backgroundColor: "#F0F0F0", borderRadius: 4 }}>
        <Story />
      </div>
    ),
  ],
};
```

### 🛠️ Cấp Local (toàn file)

Đưa decorator lên default export để mọi story trong file đều nhận được nó:

```tsx
// src/stories/Button.stories.tsx
import Button from "./components/Button";

export default {
  title: "components/Button",
  component: Button,
  // local decorator: applies to EVERY story in this file
  decorators: [
    (Story: any) => (
      <div style={{ padding: 20, backgroundColor: "#F0F0F0", borderRadius: 4 }}>
        <Story />
      </div>
    ),
  ],
};

export const Primary = { args: { label: "Click me", color: "#007BFF" } };
export const Secondary = { args: { label: "Click me", color: "#6c757d" } };
```

### 🛠️ Cấp Global (toàn project)

Best practice: đặt các decorator tái sử dụng vào file riêng của chúng, rồi đăng ký trong `preview.ts`. Định nghĩa decorator riêng:

```tsx
// .storybook/decorators.tsx
import React from "react";
import type { Decorator } from "@storybook/react";

// Convention: name reusable decorators "with…"
export const withBackgroundColor: Decorator = (StoryFn) => {
  return (
    <div style={{ padding: 20, backgroundColor: "#F0F0F0", borderRadius: 4 }}>
      <StoryFn />
    </div>
  );
};
```

Sau đó đăng ký nó toàn cục trong `preview.ts`:

```tsx
// .storybook/preview.ts
import { withBackgroundColor } from "./decorators";

// Global decorators apply to EVERY component in the project
export const decorators = [withBackgroundColor];
```

> [!WARNING]
> Decorators có phạm vi: một decorator **local** trên `Button.stories.tsx` sẽ *không* ảnh hưởng tới `Input.stories.tsx`. Nếu bạn cần cùng một lớp bao bọc ở mọi nơi, hãy đăng ký nó **toàn cục** trong `preview.ts` — đừng copy-paste nó vào mọi file.

---

## ⚡ 11. TypeScript: `Meta` & `StoryObj`

Storybook cung cấp hai kiểu chủ chốt. Import chúng từ `@storybook/react`:

- **`Meta<T>`** — gán kiểu cho **default export** (metadata / giá trị khởi tạo).
- **`StoryObj<T>`** — gán kiểu cho mỗi export story có tên (các object biến thể).

```tsx
// src/stories/components/Button.tsx
export interface ButtonProps {
  label: string;
  onClick?: () => void;
  color: string;
  disabled?: boolean;
}

const Button = ({ label, onClick, color, disabled = false }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: color,
        padding: "10px 20px",
        border: "none",
        borderRadius: 4,
      }}
    >
      {label}
    </button>
  );
};

export default Button;
```

```tsx
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./components/Button";

// Meta typed with our own ButtonProps → full prop autocomplete & checking
const meta: Meta<ButtonProps> = {
  title: "components/Button",
  component: Button,
  argTypes: {
    color: { control: "color" },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;

// Each story is a StoryObj typed against the same props
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: { label: "Click me", color: "#007BFF", disabled: false },
};

export const Disabled: Story = {
  args: { label: "This is the disabled button", color: "#007BFF", disabled: true },
};

export const Red: Story = {
  args: { label: "Red button", color: "#FF0000", disabled: false },
};
```

> [!TIP]
> Việc gán kiểu `Meta<ButtonProps>` và `StoryObj<ButtonProps>` có nghĩa là TypeScript sẽ kiểm tra `args` của bạn dựa trên các prop thật của component. Gõ sai tên một prop hoặc truyền sai kiểu và bạn sẽ nhận lỗi tại thời điểm biên dịch — các story của bạn không thể lệch khỏi component được.

---

## ⚡ 12. Addons

**Addons** là các tiện ích mở rộng bổ sung khả năng cho Storybook — y hệt như các extension của VS Code bổ sung khả năng cho editor của bạn. `init` cài đặt một bộ mặc định:

- **`@storybook/addon-essentials`** — gói cốt lõi (Controls, Actions, Backgrounds, Viewport, v.v.).
- **`@storybook/addon-interactions`** — viết & phát lại các bài kiểm thử tương tác.
- **`@storybook/addon-onboarding`** — chuyến tham quan hướng dẫn lần chạy đầu tiên.

Bạn có thể duyệt thêm trên catalog addons chính thức và cài đặt chúng như bất kỳ gói nào:

```bash
# Example: install the official documentation addon
npm install @storybook/addon-docs
```

Sau đó kích hoạt nó trong `.storybook/main.ts` bằng cách thêm nó vào mảng `addons`.

---

## ⚡ 13. Autodocs: Tài Liệu Sống Tự Động Tạo

Storybook có thể tự động tạo một trang tài liệu đầy đủ cho một component từ args, argTypes và các story của nó. Bật tính năng này bằng cờ **`tags: ["autodocs"]`** trên meta:

```tsx
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./components/Button";

const meta: Meta<ButtonProps> = {
  title: "components/Button",
  component: Button,
  tags: ["autodocs"], // ← generates a "Docs" page automatically
  argTypes: {
    color: { control: "color" },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  args: { label: "Click me", color: "#007BFF", disabled: false },
};
```

Khởi động lại Storybook và một mục **Docs** mới sẽ xuất hiện. Nó hiển thị component, một đoạn code trực tiếp, một bảng prop có thể chỉnh sửa (label, disabled, onClick…), và mọi story được render nội tuyến — tất cả được tạo từ các story của bạn. Đây chính là "tài liệu sống" mà rất nhiều nhóm chọn dùng Storybook vì nó.

---

## 🧠 Test Your Knowledge

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn. Click **Reveal Answer** để xác minh.

### 1. Tính "cô lập component" của Storybook thực sự giải quyết vấn đề gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó cho phép bạn xây dựng và kiểm thử một UI component duy nhất **mà không cần chạy cả ứng dụng** — không phải điều hướng tới đúng trang, không phải đăng nhập, không phải giả lập dữ liệu server chỉ để đạt được trạng thái bạn muốn xem. Bạn render component trực tiếp trong Storybook và tự điều khiển các prop của nó, nên bạn có thể tập trung hoàn toàn vào diện mạo và hành vi của riêng một component đó, và bắt được các lỗi hình ảnh/hành vi sớm trong quá trình phát triển.
</details>

### 2. Sự khác biệt giữa `args` và `argTypes` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  **`args`** là các **giá trị** thực tế của những prop được truyền vào component cho một story nhất định (ví dụ `{ label: "Click me", primary: true }`). **`argTypes`** là **metadata** cho Storybook biết *mỗi prop nên được chỉnh sửa như thế nào* trong panel Controls — dùng widget control nào (`color`, `select`, `text`, `number`, `boolean`), cùng các phần bổ sung như `options`, `min`/`max`/`step`, và `description`. Tóm lại: `args` = dữ liệu, `argTypes` = giao diện chỉnh sửa cho dữ liệu đó.
</details>

### 3. Trường `title` điều khiển sidebar Storybook như thế nào, và `storyName` làm gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Chuỗi `title` dùng **dấu gạch chéo** để xây một cây thư mục lồng nhau trong sidebar — `"products/buttons"` tạo một thư mục `products` chứa một nhóm `buttons`, và các story của component nằm dưới đó. `storyName` ghi đè **nhãn hiển thị** của một story riêng lẻ (vốn mặc định là tên export của nó), ví dụ `Primary.storyName = "Blue Button"` hiển thị "Blue Button" trong sidebar trong khi code vẫn export `Primary`.
</details>

### 4. Hãy nêu ba cấp độ của decorators và phạm vi của mỗi cấp.
<details>
  <summary><b>Reveal Answer</b></summary>

  1. **Cấp Variation** — định nghĩa qua `decorators` trên một export story có tên đơn lẻ; áp dụng cho **chỉ đúng một story đó**.
  2. **Cấp Local** — định nghĩa qua `decorators` trên **default export (meta)**; áp dụng cho **mọi story trong file đó**.
  3. **Cấp Global** — đăng ký trong **`.storybook/preview.ts`** (thường import một decorator tái sử dụng như `withBackgroundColor`); áp dụng cho **mọi story trong toàn bộ project**. Một decorator local trên file Button KHÔNG ảnh hưởng tới file Input — chỉ một decorator global mới chạm tới mọi nơi.
</details>

### 5. `Meta` và `StoryObj` mang lại điều gì, và `tags: ["autodocs"]` liên quan tới tài liệu ra sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  `Meta<Props>` gán kiểu cho **default export** (metadata như `title`, `component`, `argTypes`), và `StoryObj<Props>` gán kiểu cho mỗi object story có tên. Gán kiểu chúng với các prop của component khiến TypeScript kiểm tra `args` của mỗi story dựa trên các prop thật — nên một arg gõ sai hoặc sai kiểu sẽ là lỗi biên dịch. Riêng biệt, việc thêm `tags: ["autodocs"]` vào meta báo cho Storybook **tự động tạo một trang "Docs"** từ component, args, argTypes và các story của bạn — một đoạn code, một bảng prop có thể chỉnh sửa, và mọi biến thể được render nội tuyến.
</details>

---

## 💻 Practice Exercises

### 🛠️ Bài tập 1: Một Button Được Điều Khiển Hoàn Toàn

1. Tạo khung một project React + TypeScript và chạy `npx storybook@latest init`.
2. Xóa các ví dụ `src/stories/` được tạo sẵn và tạo `Button.tsx` của riêng bạn nhận `label`, `backgroundColor`, `size` (`"small" | "medium" | "large"`), `borderRadius`, và `disabled`.
3. Viết `Button.stories.tsx` được gán kiểu với `Meta<ButtonProps>` và `StoryObj<ButtonProps>`.
4. Thêm `argTypes` để `backgroundColor` dùng control `color`, `size` dùng control `select`, `borderRadius` dùng control `number` (`min: 0`, `max: 50`, `step: 1`), và `disabled` dùng control `boolean`.
5. Export ba story — `Primary`, `Secondary`, `Disabled` — mỗi cái với `args` khác nhau.
6. Thêm `parameters: { layout: "centered" }` và một danh sách `backgrounds` tùy chỉnh, rồi kiểm tra mọi thứ trong panel Controls.

### 🛠️ Bài tập 2: Decorators + Autodocs

1. Tạo một decorator `withBackgroundColor` trong `.storybook/decorators.tsx` bao bọc story trong một hộp màu xám nhạt có padding.
2. Đăng ký nó **toàn cục** trong `.storybook/preview.ts` và xác nhận rằng nó bao bọc *mọi* story (Button VÀ một component `Input` mới).
3. Thêm một decorator **cấp variation** vào chỉ một story (ví dụ một viền màu quanh `Primary`) và xác nhận rằng nó KHÔNG ảnh hưởng tới những story khác.
4. Thêm `tags: ["autodocs"]` vào meta của Button, khởi động lại Storybook, mở trang **Docs** mới, và xác nhận rằng bảng prop và đoạn code trực tiếp được tạo tự động.
