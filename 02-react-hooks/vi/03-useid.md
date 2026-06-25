# Hook `useId` ⚓

Hook **`useId`** là một hook trong React được thiết kế để tạo ra các mã định danh (ID) duy nhất và ổn định. Các ID này được đảm bảo nhất quán giữa quá trình render phía client (trình duyệt) và render phía server (SSR).

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng bạn đang phân phối số thẻ tủ đồ cá nhân cho nhân viên. Nếu bạn để mỗi quản lý tự ghi số theo ý mình, hai quản lý khác nhau có thể cấp cùng một số "Tủ số 5" cho hai nhân viên khác nhau (xung đột ID). Hoặc nếu máy chủ và trình duyệt tự đánh số tủ độc lập, họ có thể ghi số tủ khác nhau cho cùng một người. `useId` đóng vai trò như một hệ thống quản lý tập trung, tự động đảm bảo mọi người đều có số ID duy nhất và khớp nhau trên mọi hệ thống.

---

## ⚡ 1. Tại sao `useId` lại cần thiết?

Trước phiên bản React 18, việc tạo các ID duy nhất cho các biểu mẫu (để liên kết thẻ `<label>` với `<input>` thông qua thuộc tính `htmlFor`) thường được thực hiện theo 2 cách dưới đây, tuy nhiên cả hai đều có khuyết điểm:
1. **Cứng hóa (Hardcode) ID**: Ví dụ đặt cứng `id="email"`. Nếu component này được hiển thị nhiều lần trên cùng một trang, ID sẽ bị lặp lại, vi phạm tiêu chuẩn HTML và làm giảm khả năng tiếp cận (Accessibility - A11y).
2. **Sử dụng biến đếm toàn cục (Global Counter)**: Ví dụ `id={`input-${counter++}`}`. Trong các framework hỗ trợ Server-Side Rendering (SSR) như Next.js, biến đếm này có thể tăng theo các giá trị khác nhau giữa server và client (trình duyệt), gây ra **lỗi không khớp dữ liệu (hydration mismatch error)**.

`useId` giải quyết triệt để vấn đề này bằng cách tạo ra các chuỗi ID duy nhất, ổn định và tự động khớp theo từng instance của component.

---

## 🧩 2. Cách sử dụng cơ bản

```jsx
import { useId } from 'react';

const LoginForm = () => {
  const emailId = useId();
  const passwordId = useId();

  return (
    <form className="login-form">
      <div>
        <label htmlFor={emailId}>Email:</label>
        <input id={emailId} type="email" placeholder="Nhập email..." />
      </div>
      <div>
        <label htmlFor={passwordId}>Mật khẩu:</label>
        <input id={passwordId} type="password" placeholder="Nhập mật khẩu..." />
      </div>
    </form>
  );
};
```

---

## 🚀 3. Thực hành tốt nhất: Sử dụng tiếp đầu ngữ kết hợp (Compound Prefixing)

Nếu bạn có một biểu mẫu lớn với nhiều trường nhập liệu, bạn không cần phải gọi hàm `useId` cho từng trường một. Thay vào đó, hãy gọi nó một lần để lấy một ID gốc, sau đó ghép thêm các hậu tố tùy chọn. Cách này giúp mã nguồn sạch hơn và tối ưu hiệu suất hơn:

```jsx
import { useId } from 'react';

const RegistrationForm = () => {
  const formId = useId();

  return (
    <form>
      <div>
        <label htmlFor={`${formId}-first`}>Tên:</label>
        <input id={`${formId}-first`} type="text" />
      </div>
      <div>
        <label htmlFor={`${formId}-last`}>Họ:</label>
        <input id={`${formId}-last`} type="text" />
      </div>
      <div>
        <label htmlFor={`${formId}-age`}>Tuổi:</label>
        <input id={`${formId}-age`} type="number" />
      </div>
    </form>
  );
};
```

---

## ⚠️ Những hạn chế quan trọng

> [!CAUTION]
> **KHÔNG sử dụng `useId` để tạo thuộc tính `key` cho các phần tử danh sách (list keys).** Thuộc tính `key` trong React phải được tạo ra trực tiếp từ dữ liệu của bạn (ví dụ: ID từ database, ID của object) thay vì tạo ngẫu nhiên trong vòng đời render. Việc dùng `useId` để làm key sẽ làm mất hiệu quả tối ưu của thuật toán Reconciliation (đối chiếu giao diện) trong React.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useId`. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Lỗi "hydration mismatch" là gì, và `useId` ngăn chặn nó như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Lỗi hydration mismatch xảy ra khi máy chủ server render ra một đoạn mã HTML (ví dụ: có ID `id="input-1"`), nhưng phía client (trình duyệt) lại biên dịch hoặc mong đợi một mã khác (ví dụ: `id="input-2"`). 
  `useId` giải quyết điều này bằng cách tạo ra các ID dựa trên vị trí/độ sâu của component trong cây render tree. Do vị trí cây render này giống hệt nhau ở cả server và client, kết quả ID đầu ra sẽ hoàn toàn trùng khớp.
</details>

### 2. Chúng ta có thể dùng `useId` làm thuộc tính `key` bên trong vòng lặp `.map()` của mảng động không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Bạn không bao giờ được dùng `useId` cho thuộc tính `key`. Các key trong React cần gắn liền với vòng đời của chính phần tử dữ liệu đó (như ID trong database). Vì `useId` gắn liền với vị trí của component trong cây giao diện UI, khi bạn sắp xếp lại thứ tự danh sách, các ID này vẫn giữ nguyên vị trí, khiến React nhận diện sai phần tử nào thực sự thay đổi.
</details>

### 3. Các ID được tạo ra bởi `useId` có định dạng như thế nào và tại sao lại như vậy?
<details>
  <summary><b>Reveal Answer</b></summary>

  React tạo ra các ID được bao bọc bởi các dấu hai chấm, ví dụ: `:r0:`, `:r1:`. Định dạng này cố tình làm cho chúng trở thành các bộ chọn CSS (CSS selectors) không hợp lệ. Điều này ngăn cản các lập trình viên sử dụng trực tiếp hàm `document.querySelector` để can thiệp trực tiếp vào DOM, khuyến khích viết code theo mô hình hướng trạng thái (state-driven) chuẩn của React.
</details>

### 4. `useId` cải thiện khả năng tiếp cận (Accessibility - A11y) của ứng dụng như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó đảm bảo rằng các trình đọc màn hình dành cho người khiếm thị có thể liên kết chính xác nhãn văn bản với ô nhập (thông qua `htmlFor` và `id`) hoặc mô tả các trường thông tin bổ sung (thông qua `aria-describedby`), ngay cả khi component đó được tái sử dụng rất nhiều lần trên cùng một trang web.
</details>

### 5. Nếu một component được render 3 lần trên trang, `useId` có trả về cùng một chuỗi ID giống nhau không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Mỗi thực thể component trong số ba thực thể đó nằm ở một nhánh/độ sâu khác nhau trên cây render tree của React. Do đó, mỗi thực thể sẽ tạo ra một chuỗi ID hoàn toàn khác nhau (ví dụ: `:r0:`, `:r1:`, `:r2:`), đảm bảo không xảy ra xung đột ID trong tài liệu DOM.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Xây dựng biểu mẫu phản hồi dễ tiếp cận
1. Tạo một component `FeedbackForm.jsx` trong dự án của bạn.
2. Sử dụng `useId` để tạo một ID gốc ban đầu.
3. Hiển thị một biểu mẫu có ba ô nhập liệu: Tên, Email và Nội dung phản hồi (Textarea).
4. Sử dụng ID gốc kết hợp hậu tố phù hợp để liên kết nhãn `<label htmlFor="...">` và ô nhập `<input id="...">` một cách chính xác.
5. Thêm một khối văn bản mô tả định dạng email hợp lệ bên dưới ô nhập email (ví dụ: `@gmail.com`) bằng cách sử dụng thuộc tính `aria-describedby` liên kết với ID hậu tố đó.
6. Render component này nhiều lần trong tệp `App.jsx` để kiểm tra và đảm bảo không có ID HTML nào bị trùng lặp trong DOM.
