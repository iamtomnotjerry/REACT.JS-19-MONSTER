# Hook `useId` ⚓

Hook **`useId`** là một hook trong React được dùng để tạo ra các mã định danh (ID) duy nhất, ổn định và được đảm bảo an toàn cũng như nhất quán giữa cả quá trình render phía client và môi trường render phía server (SSR).

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng bạn đang phân phối số thẻ tủ đồ cá nhân cho nhân viên. Nếu bạn để mỗi quản lý tự ghi số theo ý mình, hai quản lý khác nhau có thể cấp cùng một số "Tủ số 5" cho hai nhân viên khác nhau (xung đột ID). Hoặc nếu server và client tự tạo số tủ một cách độc lập, họ có thể ghi số khác nhau cho cùng một nhân viên. `useId` đóng vai trò như một bộ phận đăng ký trung tâm tự động, đảm bảo mọi người đều nhận được một ID duy nhất và khớp nhau.

---

## ⚡ 1. Tại sao `useId` lại cần thiết

Trước React 18, việc tạo ID duy nhất cho các biểu mẫu (để liên kết thẻ `<label>` với `<input>` thông qua `htmlFor`) thường được thực hiện theo một trong hai cách chưa tối ưu sau:
1. **Cứng hóa (Hardcode) ID**: Ví dụ `id="email"`. Nếu component được render nhiều lần trên cùng một trang, ID sẽ bị trùng lặp, vi phạm tiêu chuẩn HTML và làm giảm khả năng tiếp cận (accessibility).
2. **Sử dụng biến đếm toàn cục (Global Counter)**: Ví dụ `id={`input-${counter++}`}`. Trong các framework hỗ trợ Server-Side Rendering (SSR) như Next.js, biến đếm này có thể tăng theo cách khác nhau giữa server và client (trình duyệt), gây ra **lỗi không khớp dữ liệu (hydration mismatch error)**.

`useId` tạo ra các chuỗi ID ổn định, duy nhất theo phạm vi của từng instance component, ngăn chặn xung đột và lỗi hydration mismatch.

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
        <input id={emailId} type="email" placeholder="enter email..." />
      </div>
      <div>
        <label htmlFor={passwordId}>Password:</label>
        <input id={passwordId} type="password" placeholder="enter password..." />
      </div>
    </form>
  );
};
```

---

## 🚀 3. Thực hành tốt nhất: Sử dụng tiếp đầu ngữ kết hợp (Compound Prefixing)

Nếu bạn có một biểu mẫu phức tạp với nhiều trường nhập liệu, bạn không cần phải gọi `useId` cho từng trường một. Thay vào đó, hãy gọi nó một lần để tạo một ID gốc rồi ghép thêm các hậu tố tùy chỉnh. Cách này giúp mã nguồn sạch hơn và đạt hiệu suất cao:

```jsx
import { useId } from 'react';

const RegistrationForm = () => {
  const formId = useId();

  return (
    <form>
      <div>
        <label htmlFor={`${formId}-first`}>First Name:</label>
        <input id={`${formId}-first`} type="text" />
      </div>
      <div>
        <label htmlFor={`${formId}-last`}>Last Name:</label>
        <input id={`${formId}-last`} type="text" />
      </div>
      <div>
        <label htmlFor={`${formId}-age`}>Age:</label>
        <input id={`${formId}-age`} type="number" />
      </div>
    </form>
  );
};
```

---

## ⚠️ Những hạn chế quan trọng

> [!CAUTION]
> **KHÔNG sử dụng `useId` để tạo key cho các phần tử trong danh sách.** Các key trong React phải được tạo trực tiếp từ dữ liệu của bạn (ví dụ: ID từ database, ID của model) thay vì được tạo tức thời trong các chu kỳ render. Việc dùng `useId` để làm key sẽ làm mất đi lợi ích hiệu suất của thuật toán reconciliation.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useId`. Nhấp vào **Reveal Answer** để xác nhận.

### 1. "Hydration mismatch" là gì, và `useId` ngăn chặn nó như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Lỗi hydration mismatch xảy ra khi server render ra một đoạn mã HTML (ví dụ: có ID `id="input-1"`), nhưng client (trình duyệt) lại mong đợi hoặc tạo ra một đoạn khác (ví dụ: `id="input-2"`). 
  `useId` giải quyết điều này bằng cách tạo ra các ID dựa trên vị trí độ sâu của component trong cây render tree, vốn giống hệt nhau ở cả server và client, đảm bảo kết quả đầu ra khớp nhau hoàn hảo.
</details>

### 2. Chúng ta có thể dùng `useId` làm key bên trong các mảng động `.map()` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Bạn không bao giờ được dùng `useId` cho key. Các key trong React phải đại diện cho mã định danh duy nhất gắn liền với vòng đời của chính các phần tử dữ liệu (như ID trong database). Vì `useId` gắn liền với vị trí của component trong cây UI, việc sắp xếp lại danh sách sẽ giữ nguyên các ID tại chỗ, khiến React nhận diện sai phần tử nào thực sự thay đổi.
</details>

### 3. Các ID được tạo bởi `useId` sử dụng định dạng tiền tố nào, và tại sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  React tạo ra các ID được bao bọc bởi dấu hai chấm, ví dụ: `:r0:`, `:r1:`. Đây là một lựa chọn thiết kế có chủ đích nhằm khiến chúng trở thành các bộ chọn CSS (CSS selector) không hợp lệ. Điều này ngăn cản các lập trình viên sử dụng trực tiếp `document.querySelector` trong code của họ, thay vào đó khuyến khích các thực hành chuẩn hướng theo state của React.
</details>

### 4. `useId` cải thiện khả năng tiếp cận số (A11y) như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó đảm bảo các trình đọc màn hình có thể liên kết chính xác các nhãn văn bản với ô nhập liệu (sử dụng `htmlFor` và `id`) hoặc các phần tử với thẻ trợ giúp mô tả (sử dụng `aria-describedby`), ngay cả khi một component được khởi tạo nhiều lần trên cùng một trang web.
</details>

### 5. Nếu một component được render ba lần trên trang, `useId` có trả về cùng một chuỗi ID không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Mỗi instance trong ba instance đó nằm ở một nhánh/độ sâu khác nhau trên cây render tree của React. Do đó, mỗi instance sẽ tạo ra một chuỗi ID hoàn toàn duy nhất (ví dụ: `:r0:`, `:r1:`, `:r2:`), đảm bảo không xảy ra xung đột ID trong DOM.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Biểu mẫu phản hồi dễ tiếp cận
1. Tạo một component `FeedbackForm.jsx` trong dự án của bạn.
2. Sử dụng `useId` để tạo một ID tiền tố gốc.
3. Render một biểu mẫu có ba trường nhập liệu: Name, Email và Feedback Textarea.
4. Liên kết chính xác từng trường bằng `<label htmlFor="...">` và `<input id="...">` sử dụng các hậu tố dựa trên ID đã tạo.
5. Thêm một khối văn bản trợ giúp `aria-describedby` bên dưới ô nhập email mô tả các tên miền email được chấp nhận (ví dụ: `@gmail.com`), liên kết ô nhập với khối văn bản đó bằng ID hậu tố.
6. Render component này nhiều lần trong `App.jsx` để xác minh không có ID HTML nào bị trùng lặp được tạo ra trong DOM.
