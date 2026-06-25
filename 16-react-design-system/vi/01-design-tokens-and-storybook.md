# Thiết kế Hệ thống Design Tokens & Tích hợp Storybook 📖

Một **Hệ thống Thiết kế (Design System)** là một tập hợp các thành phần giao diện (UI components) có thể tái sử dụng, được hướng dẫn bởi các tiêu chuẩn rõ ràng, có thể lắp ghép lại với nhau để xây dựng bất kỳ số lượng ứng dụng nào. Trong bài học này, chúng ta sẽ tìm hiểu về **Design Tokens** (các biến thiết kế trực quan) và **Storybook** (công cụ xây dựng và tài liệu hóa các thành phần UI độc lập).

---

## ⚡ 1. Design Tokens là gì?

**Design Tokens** là những "nguyên tử" (atoms) trực quan của một hệ thống thiết kế. Chúng đóng vai trò là "nguồn sự thật duy nhất" (single source of truth) cho các biến giao diện, đại diện cho khoảng cách (spacing), màu sắc (color choices), kích thước chữ (typography scales), bo góc (border radiuses), và bóng đổ (shadow parameters).

Bằng cách trừu tượng hóa các giá trị thô thành các biến có tên gọi cụ thể, bạn đảm bảo tính nhất quán trên toàn bộ sản phẩm web:

```css
/* Các thuộc tính tùy chỉnh CSS (CSS custom properties) đại diện cho design tokens */
:root {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-dark: #2c3e50;
  
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  
  --border-radius-round: 8px;
}
```

---

## ⚡ 2. Storybook: Phát triển UI Độc lập (Isolated UI Development)

**Storybook** là một công cụ mã nguồn mở dùng để xây dựng các thành phần UI trong môi trường độc lập. Thay vì render một component mới bên trong một ứng dụng phức tạp (nơi bạn phải điều hướng qua các màn hình, giả lập phản hồi API hoặc đăng nhập), bạn viết một "story" để xem và kiểm thử nó ngay lập tức trên một bảng điều khiển (dashboard) sandbox cục bộ.

### Cài đặt
Để thêm Storybook vào một dự án React hiện tại, chạy lệnh sau trong thư mục gốc của dự án:

```bash
npx storybook@latest init
```

Lệnh này sẽ tạo thư mục cấu hình `.storybook/`, thêm các script vào `package.json`, và tạo sẵn một thư mục mẫu `src/stories/`.

---

## 🧩 3. Viết Stories (Component Story Format - CSF)

Các story được viết bằng tiêu chuẩn **CSF (Component Story Format) 3.0** hiện đại. Một file story có tên định dạng `[ComponentName].stories.jsx` hoặc `.tsx`:

### Component (`src/components/Badge.jsx`)
```jsx
export const Badge = ({ label, variant = "info" }) => {
  const badgeStyles = {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    display: "inline-block",
    backgroundColor: variant === "success" ? "#2ecc71" : "#3498db",
    color: "#fff"
  };

  return <span style={badgeStyles}>{label}</span>;
};
```

### File Story (`src/components/Badge.stories.jsx`)
```jsx
import { Badge } from './Badge';

// 1. Export mặc định định nghĩa metadata của component và vị trí trên thanh bên (sidebar)
export default {
  title: 'Design System/Atoms/Badge', // Cấu trúc phân cấp trên sidebar
  component: Badge,
  tags: ['autodocs'], // Tự động tạo tab tài liệu API
  argTypes: {
    variant: {
      control: 'select', // Render hộp chọn điều khiển trên dashboard Storybook
      options: ['info', 'success'],
    },
  },
};

// 2. Các export được đặt tên định nghĩa từng biến thể câu chuyện (story variant) để kiểm thử
export const Info = {
  args: {
    label: "Information Tag",
    variant: "info",
  },
};

export const Success = {
  args: {
    label: "Task Approved",
    variant: "success",
  },
};
```

Để chạy môi trường Storybook cục bộ, thực thi lệnh: `npm run storybook`.

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu biết của bạn về hệ thống thiết kế. Nhấp vào **Reveal Answer** để xác minh câu trả lời.

### 1. Design Tokens là gì, và tại sao chúng được ưa chuộng hơn các giá trị hardcode?
<details>
  <summary><b>Reveal Answer</b></summary>

  Design Tokens là các biến độc lập với nền tảng đại diện cho các tham số thiết kế trực quan (màu sắc, kích thước, kiểu chữ). Chúng được ưa chuộng vì đóng vai trò là **nguồn sự thật duy nhất (single source of truth)**. Nếu màu sắc thương hiệu thay đổi, bạn chỉ cần cập nhật định nghĩa token ở một nơi duy nhất, và nó sẽ tự động lan truyền đến tất cả các component, tránh các lỗi do tìm kiếm và thay thế thủ công.
</details>

### 2. Phát triển component "độc lập" (in isolation) có nghĩa là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó có nghĩa là render và lập trình các component bên ngoài codebase của ứng dụng chính. Trong Storybook, một component được tải trên một màn hình sandbox sạch sẽ mà không phụ thuộc vào truy vấn cơ sở dữ liệu, logic điều hướng router, hoặc cấu hình trạng thái phức tạp, giúp việc phát triển, kiểm thử và thiết kế giao diện nhanh hơn đáng kể.
</details>

### 3. `args` trong các story của Storybook là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `args` đại diện cho **props** của component. Thiết lập `args` bên trong một story sẽ định nghĩa các thuộc tính mặc định (dữ liệu đầu vào) mà Storybook sẽ truyền qua để render biến thể component cụ thể đó trên màn hình.
</details>

### 4. Lợi ích của thuộc tính `tags: ['autodocs']` bên trong export mặc định CSF là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó tự động tạo một **tab Docs** chuyên dụng trong dashboard Storybook của bạn. Tab này ghi lại các tài liệu hướng dẫn API của component, tạo bảng mô tả thuộc tính (props description tables), và cung cấp các ví dụ mã có thể sao chép-dán cho các lập trình viên khác sử dụng.
</details>

### 5. Các story của Storybook có thể tái sử dụng cho các mục đích kiểm thử khác không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì các story CSF là các đối tượng ES6 chuẩn xuất bản (export) các component và props, bạn có thể import chúng trực tiếp vào các bài kiểm thử đơn vị (sử dụng Vitest/RTL) hoặc kiểm thử tích hợp để xác minh việc hiển thị giao diện và các hành động click chuột, giúp tránh việc phải lặp lại cấu hình thiết lập.
</details>

---

## 💻 Bài tập Thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Tạo một component Card và Story của nó
1. Tạo một component `InfoCard.tsx` (sử dụng phần mở rộng `.tsx`).
2. Thiết lập các props: `title` (string), `description` (string), và `borderTheme` (màu sắc đường viền dạng chuỗi).
3. Định dạng kiểu dáng (style) cho thẻ card sử dụng các design tokens (ví dụ như `--spacing-lg` cho phần đệm - padding).
4. Tạo một file story `InfoCard.stories.tsx`.
5. Định nghĩa hai câu chuyện (stories):
   - `Default`: Hiển thị thẻ card tiêu chuẩn.
   - `Featured`: Thẻ card hiển thị viền vàng dày (`borderTheme` màu vàng).
6. Xác minh story hiển thị chính xác trong sandbox Storybook và kiểm tra xem bảng điều khiển controls có cho phép bạn chỉnh sửa nội dung trực tiếp hay không.
