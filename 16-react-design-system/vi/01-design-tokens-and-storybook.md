# Design Systems & Design Tokens 📖

Một **Design System** không chỉ đơn thuần là một thư mục chứa các component. Nó là bộ công cụ dùng chung — một phần là thiết kế, một phần là kỹ thuật — giúp một đội ngũ xây dựng nhiều sản phẩm trông và hoạt động một cách nhất quán. Bài học này tập trung vào **lý thuyết về design system** và các **design token** tạo nên sức mạnh cho chúng. (Storybook, công cụ để xây dựng và tài liệu hóa các component một cách độc lập, được nhắc qua ở đây và sẽ được đào sâu trong **§17**.)

---

## 💡 Khái niệm & Tổng quan

Nếu bạn hỏi một designer "design system là gì?", họ sẽ trả lời rằng đó là một bộ UI kit, một bảng màu (color palette), một lưới typography, hay bộ iconography. Nếu bạn hỏi một developer, họ sẽ nói đó là một thư viện component, các style guide, hoặc tài liệu (documentation). **Sự thật là design system bao gồm tất cả những thứ đó** — một chút thiết kế và một chút kỹ thuật được gắn kết lại với nhau.

Một định nghĩa chính thức phổ biến:

> Design system là một tập hợp toàn diện các tiêu chuẩn, hướng dẫn và component nhằm đảm bảo tính nhất quán và sự gắn kết trong việc thiết kế và phát triển một sản phẩm số. Nó đóng vai trò là ngôn ngữ chung và nguồn tài nguyên cho các designer, developer và những bên liên quan khác.

Mô hình tư duy đơn giản nhất: **design system là một bộ công cụ để xây dựng các sản phẩm số**. Nó bao gồm mọi thứ bạn cần để thiết kế luôn nhất quán và trông giống nhau trên mọi màn hình và trang.

> [!NOTE]
> Design system **không phải** là sản phẩm. Nó là tập hợp các bộ phận và quy tắc có thể tái sử dụng mà bạn dùng để lắp ráp *nên* sản phẩm. Hãy xem nó như hộp gạch LEGO cộng với cuốn sách hướng dẫn — chứ không phải tòa lâu đài đã hoàn thành.

> [!TIP]
> Bạn không cần phải xây dựng design system lớn nhất hành tinh. Ngay cả một hệ thống nhỏ xíu — một vài màu sắc, một thang spacing, một button, và một card — cũng đã tự chứng minh giá trị của nó ngay lần đầu tiên một màu thương hiệu thay đổi và bạn chỉ cập nhật ở **một** nơi thay vì năm mươi nơi.

---

## 🧱 Các Khối Xây Dựng Cốt Lõi

Một design system hoàn chỉnh được tạo thành từ các khối xây dựng phân lớp. Các lớp thấp hơn (nguyên tắc, token) định hình cho các lớp cao hơn (component, pattern, tài liệu).

| Khối Xây Dựng         | Là Gì                                                                       | Ví Dụ Thực Tế                                  |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| **Design Principles** | Các hướng dẫn/triết lý cấp cao định hình mọi quyết định                      | "Đơn giản", "Ưu tiên khả năng tiếp cận (Accessibility first)", "Khả năng sử dụng (Usability)" |
| **Style Guides**      | Các quy tắc trực quan cụ thể — typography, bảng màu, spacing, iconography     | Tiêu đề dùng 1.5rem / độ đậm 700; màu xanh thương hiệu là `#1F6FEB` |
| **UI Components**     | Các phần tử giao diện tái sử dụng, được xây responsive và accessible mặc định | Button, form, modal, navigation bar           |
| **Patterns**          | Các giải pháp lặp lại cho những vấn đề thường gặp                            | Bố cục card, lưới, dropdown menu, trạng thái rỗng (empty state) |
| **Branding**          | Đảm bảo hệ thống phù hợp với bản sắc, tông giọng và giá trị của công ty       | Cách dùng logo, giọng văn (voice), màu thương hiệu, phong cách minh họa |
| **Documentation**     | Hướng dẫn rõ ràng + best practice để *sử dụng* và *bảo trì* hệ thống          | "Dùng `<Button variant=\"danger\">` cho các hành động phá hủy" |
| **Code**              | Phần triển khai front-end để dev tích hợp — React component, framework CSS    | Một gói npm `@acme/ui` đã được xuất bản         |
| **Accessibility**     | Các khuyến nghị giúp sản phẩm có thể sử dụng được với người khuyết tật         | Tỷ lệ tương phản màu theo WCAG, điều hướng bằng bàn phím, ARIA role |

### 🛒 Một Phép Ẩn Dụ Thực Tế

Hãy tưởng tượng bạn đang xây dựng một **ứng dụng mua sắm (shopping app)** cho một thương hiệu và bạn muốn button, màu sắc, font, iconography, và bố cục trông nhất quán trên mọi màn hình.

Hãy xem design system như **gian bếp của một chuỗi nhà hàng**. Chuỗi nhà hàng không phát minh lại món ăn ở mỗi địa điểm — nó chuẩn hóa các *nguyên liệu* (token: loại bột chính xác, tỷ lệ nước sốt chính xác), các *công thức* (component: cách lắp ráp một chiếc burger), và các *quy tắc bày trí* (pattern và tài liệu). Bất kỳ đầu bếp nào ở bất kỳ chi nhánh nào cũng làm ra cùng một món. Trong ứng dụng của bạn, bạn "đã có sẵn" các màu của mình (xám, xanh dương, đỏ, hổ phách, xanh lá, xanh ngọc…), typography, các icon, và các component — bạn chỉ việc **lấy chúng ra và sử dụng**, và ứng dụng tự động trở nên nhất quán.

---

## 🎨 Design Tokens — Những Nguyên Tử Của Hệ Thống

**Design Tokens** là những giá trị nhỏ nhất, có tên gọi, đóng vai trò nguồn dữ liệu gốc duy nhất trong một design system. Thay vì rải rác các giá trị thô như `#1F6FEB` hay `16px` khắp code của bạn, bạn đặt tên cho chúng một lần (`color-primary-500`, `spacing-md`) và tham chiếu đến cái tên đó ở mọi nơi. Thay đổi token, và mọi nơi sử dụng nó đều được cập nhật theo.

> [!IMPORTANT]
> Token là **độc lập với nền tảng (platform-agnostic)**. *Cùng* một token (`color-primary-500`) có thể biên dịch thành một CSS custom property cho web, một hằng số Swift cho iOS, và một tài nguyên XML cho Android. CSS custom property chỉ là **một** cách để biểu diễn token — chứ không phải định nghĩa của một token.

Design token mang tính toàn diện — chúng bao trùm toàn bộ ngôn ngữ trực quan, không chỉ riêng màu sắc:

### 1. Thang Màu (Color Scales)

Mỗi màu mang ngữ nghĩa (primary, neutral, warning, danger, success, gray-scale) được mở rộng thành một **thang (scale)** gồm nhiều sắc độ. Một quy ước phổ biến chạy theo `50, 100, 200, … 900, 950`, trong đó số thấp là các sắc nhạt và số cao là các sắc đậm.

```css
/* CSS custom properties: a primary color SCALE, not a single color */
:root {
  --color-primary-50:  #e7f0ff;
  --color-primary-100: #c2dbff;
  --color-primary-500: #1f6feb; /* base / default */
  --color-primary-900: #0a2a5e;
  --color-primary-950: #061a3b;

  /* Semantic roles map onto the scale */
  --color-danger-500:  #ef4444;
  --color-success-500: #22c55e;
  --color-warning-500: #eab308;
  --color-neutral-500: #6b7280;
}
```

### 2. Spacing — Một Thang Số (Numeric Scale)

Token spacing thường là một **thang số (numeric scale)** cố định với những cái tên thân thiện để bố cục "thở" một cách nhất quán. (Trong Figma chúng thường được mô hình hóa thành một bộ sưu tập "number scale".)

```css
:root {
  --space-tiny:   2px;  /* tiny     */
  --space-xs:     4px;  /* extra small */
  --space-sm:     6px;  /* small    */
  --space-md:     12px; /* medium   */
  --space-lg:     16px; /* large    */
  --space-xl:     20px; /* extra large */
  --space-2xl:    24px; /* super large */
  --space-huge:   32px; /* huge     */
  --space-giant:  40px; /* gigantic */
}
```

### 3. Typography

```css
:root {
  --font-family-base: "Inter", system-ui, sans-serif;
  --font-size-sm:  0.875rem;
  --font-size-md:  1rem;
  --font-size-lg:  1.25rem;
  --font-weight-regular: 400;
  --font-weight-bold:    700;
  --line-height-body:    1.5;
}
```

### 4. Border-Radius

```css
:root {
  --radius-xs:   2px;
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px; /* perfect circle / pill */
}
```

### 5. Opacity

```css
:root {
  --opacity-opaque:           1;    /* fully visible      */
  --opacity-semi:             0.8;  /* semi-opaque        */
  --opacity-transparent:      0.5;  /* transparent        */
  --opacity-light:            0.3;  /* light transparent  */
  --opacity-very-transparent: 0.25; /* very transparent   */
}
```

### 6. Shadows (Elevation)

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.10);
  --shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15);
}
```

---

## 🔁 Quy Trình Figma → Tokens → Code

Token thường *bắt nguồn từ thiết kế* và *chảy vào kỹ thuật*. Hiểu được pipeline này là điều biến design system thành một ngôn ngữ chung thay vì hai silo tách rời.

```text
   ┌──────────────┐      ┌────────────────┐      ┌──────────────────┐
   │    FIGMA     │ ───▶ │  DESIGN TOKENS │ ───▶ │       CODE       │
   │ (design)     │      │ (source of     │      │ (CSS vars, JS,   │
   │              │      │  truth, e.g.   │      │  iOS, Android)   │
   │ styles +     │      │  JSON/W3C      │      │                  │
   │ variables    │      │  tokens)       │      │                  │
   └──────────────┘      └────────────────┘      └──────────────────┘
```

Một luồng điển hình, chính xác như cách một designer xây dựng nó trong Figma:

1. **Quyết định các màu** cho hệ thống (dùng các công cụ palette để chọn một bộ màu hài hòa).
2. **Tạo styles** cho những màu đó (ví dụ, một plugin *Styler* biến các mẫu màu thành Figma style).
3. **Chuyển styles thành variables** (ví dụ, một bước *Styles → Variables*) để mỗi sắc độ trở thành một token có tên gọi, tái sử dụng được như `primary/500`.
4. Thêm các **bộ sưu tập variable** khác: một *number scale* (tiny → gigantic), một bộ sưu tập *radius*, và một bộ sưu tập *opacities*.
5. **Export/trích xuất** các variable và đưa chúng vào code dưới dạng CSS custom property (hoặc một tokens JSON được một build tool sử dụng).

Một khi token tồn tại trong Figma dưới dạng variable, một designer có thể xây dựng một component (chẳng hạn một button) hoàn toàn từ `radius/sm`, `primary/500`, và `space/md` — và engineer tái tạo *chính xác* component đó vì cả hai phía đều tham chiếu cùng các token có tên gọi giống nhau.

> [!WARNING]
> Đừng bao giờ sao chép trực tiếp các mã hex thô từ file thiết kế vào component. Ngay khi một designer chỉnh một sắc độ, mọi bản sao hardcode sẽ âm thầm mất đồng bộ. Hãy luôn đi qua một **token có tên gọi** để một lần chỉnh sửa lan truyền đến mọi nơi.

> [!TIP]
> Nếu bạn không phải là designer, bạn có thể bỏ qua phần dựng token trong Figma — nhưng hãy hiểu *kết quả đầu ra*. Trong một công ty thực tế, bạn sẽ hoặc được giao xây dựng hệ thống, hoặc sử dụng các token mà người khác tạo ra. Dù theo cách nào, token chính là bản hợp đồng giữa thiết kế và code.

---

## 📚 Một Ghi Chú Ngắn Về Storybook

**Storybook** là một công cụ mã nguồn mở để xây dựng và tài liệu hóa các UI component **một cách độc lập (in isolation)** — bên ngoài ứng dụng đầy đủ, không cần routing, auth, hay giả lập API. Nó phát huy tác dụng tốt nhất với các design system và thư viện component **lớn/cấp doanh nghiệp (enterprise)**, và là quá mức cần thiết đối với một trang portfolio nhỏ.

```bash
# Add Storybook to an existing React project (covered in depth in §17)
npx storybook@latest init
```

Đó là tất cả những gì bạn cần ở đây — phần xử lý đầy đủ về story, Component Story Format (CSF), `args`, control, và `autodocs` nằm trong **§17 (Storybook)**.

---

## 🧠 Kiểm Tra Kiến Thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn. Nhấp vào **Reveal Answer** để xác minh.

### 1. Tại sao "không có một định nghĩa duy nhất" cho design system, và câu trả lời trung thực là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì designer và developer mô tả nó theo những cách khác nhau — một designer gọi nó là UI kit / bảng màu / lưới typography, trong khi một developer gọi nó là thư viện component / style guide / tài liệu. Câu trả lời trung thực là design system **đồng thời là tất cả những thứ đó**: một chút thiết kế và một chút kỹ thuật. Nó là một bộ công cụ và ngôn ngữ dùng chung để xây dựng các sản phẩm nhất quán trên mọi màn hình và nền tảng.
</details>

### 2. Hãy kể tên ít nhất năm khối xây dựng cốt lõi của một design system.
<details>
  <summary><b>Reveal Answer</b></summary>

  Năm khối bất kỳ trong số: **Design Principles**, **Style Guides**, **UI Components**, **Patterns**, **Branding**, **Documentation**, **Code**, và **Accessibility**. Principle và token nằm ở nền móng; component và pattern được xây dựng dựa trên chúng; tài liệu và code làm cho chúng có thể sử dụng và bảo trì được.
</details>

### 3. Tại sao design token được mô tả là "độc lập với nền tảng (platform-agnostic)", và CSS custom property liên hệ với chúng như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một token là một giá trị trừu tượng có tên gọi (ví dụ, `color-primary-500`) độc lập với bất kỳ công nghệ nào. *Cùng* một token có thể biên dịch thành một CSS custom property cho web, một hằng số Swift cho iOS, và một tài nguyên XML cho Android. Do đó CSS custom property chỉ là **một cách biểu diễn** token cho web — chứ không phải định nghĩa của bản thân token.
</details>

### 4. Ngoài màu sắc, hãy liệt kê các danh mục token khác mà một design system toàn diện định nghĩa.
<details>
  <summary><b>Reveal Answer</b></summary>

  **Spacing** (một thang số: tiny → gigantic), **Typography** (font family, kích thước, độ đậm, line-height), **Border-radius** (xs → full), **Opacity** (opaque → very transparent), và **Shadows/elevation**. Bản thân màu sắc được biểu diễn dưới dạng một **thang (scale)** (50–950) cho mỗi vai trò ngữ nghĩa (primary, neutral, warning, danger, success, gray-scale), chứ không phải một giá trị đơn lẻ.
</details>

### 5. Hãy mô tả quy trình Figma → tokens → code và tại sao nó quan trọng.
<details>
  <summary><b>Reveal Answer</b></summary>

  Token bắt nguồn từ thiết kế và chảy đến kỹ thuật: **(1)** quyết định màu sắc, **(2)** tạo styles từ chúng, **(3)** chuyển styles thành Figma variable (token có tên gọi như `primary/500`), **(4)** thêm các bộ sưu tập number-scale, radius và opacity, **(5)** export/trích xuất các variable đó vào code dưới dạng CSS custom property hoặc một tokens JSON. Nó quan trọng vì cả designer và developer đều tham chiếu *cùng các token có tên gọi giống nhau*, nên một lần chỉnh sửa lan truyền đến mọi nơi và giao diện được triển khai khớp chính xác với thiết kế — token trở thành bản hợp đồng giữa thiết kế và code.
</details>

---

## 💻 Bài Tập Thực Hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình.

### 🛠️ Bài tập 1: Soạn một file token và sử dụng nó trong một component

1. Tạo một file `src/styles/tokens.css` và định nghĩa **ít nhất bốn danh mục token**: một *thang* màu (ví dụ, `--color-primary-100/500/900`), một thang spacing (`--space-sm/md/lg`), một `--radius-md`, và một `--opacity-semi`.
2. Import file đó một lần tại gốc ứng dụng (ví dụ, trong `main.tsx` hoặc `index.css` thông qua `@import "./styles/tokens.css";`).
3. Tạo `src/components/InfoCard.tsx` với các props: `title` (string), `description` (string), và `borderTheme` (một chuỗi màu).
4. Style cho card **chỉ thông qua token** — dùng `var(--space-lg)` cho padding, `var(--radius-md)` cho các góc, và `var(--shadow-md)` (thêm nó vào file token) cho elevation. **Không** hardcode bất kỳ giá trị pixel hay hex nào trong component.
5. Render hai biến thể:
   - `Default`: card tiêu chuẩn.
   - `Featured`: một viền vàng dày sử dụng `borderTheme`.
6. Thay đổi một giá trị token trong `tokens.css` (ví dụ, tăng `--space-lg` từ `16px` lên `24px`) và xác nhận mọi card đều được cập nhật mà không cần đụng đến file component.

```tsx
// src/components/InfoCard.tsx
type InfoCardProps = {
  title: string;
  description: string;
  borderTheme?: string; // a color token reference, e.g. var(--color-warning-500)
};

export const InfoCard = ({ title, description, borderTheme }: InfoCardProps) => {
  return (
    <article
      style={{
        // Every value is a token reference — no hardcoded raw values
        padding: "var(--space-lg)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
        border: `2px solid ${borderTheme ?? "var(--color-neutral-500)"}`,
        fontFamily: "var(--font-family-base)",
      }}
    >
      <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)" }}>
        {title}
      </h3>
      <p style={{ fontSize: "var(--font-size-md)", lineHeight: "var(--line-height-body)" }}>
        {description}
      </p>
    </article>
  );
};
```

### 🛠️ Bài tập 2: Ánh xạ các khối xây dựng của một design system vào dự án của bạn

1. Mở bất kỳ ứng dụng nhỏ nào bạn đã xây dựng. Trên giấy (hoặc trong một file markdown), liệt kê những khối nào trong số **tám khối xây dựng** (principle, style guide, UI component, pattern, branding, documentation, code, accessibility) mà nó hiện đang có, và những khối nào còn thiếu.
2. Đối với một khối còn thiếu — ví dụ **Accessibility** — hãy viết một cải tiến cụ thể: chọn hai token màu được dùng cùng nhau (chữ trên nền) và xác minh chúng đáp ứng **tỷ lệ tương phản WCAG AA tối thiểu 4.5:1**. Điều chỉnh sắc độ token (ví dụ, chuyển từ `--color-neutral-400` sang `--color-neutral-600`) cho đến khi nó đạt yêu cầu.
3. Viết một mục **tài liệu (documentation)** dài một đoạn mô tả *khi nào* nên dùng token màu `primary` so với `danger` (ví dụ, "`danger` được dành riêng cho các hành động phá hủy, không thể hoàn tác"). Điều này biến các token thô thành một hệ thống có thể sử dụng và bảo trì được.
