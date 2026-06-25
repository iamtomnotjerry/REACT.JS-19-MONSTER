# Quản lý Form Nâng cao với React Hook Form 📝

Form là yếu tố then chốt đối với sự tương tác của người dùng, nhưng việc quản lý form state trong React có thể nhanh chóng trở nên phức tạp. Các controlled form theo cách thông thường (sử dụng `useState` trên mỗi input) khiến toàn bộ component re-render mỗi khi gõ một phím, dẫn đến hiệu năng giật lag trên các trang phức tạp.

**React Hook Form** giải quyết vấn đề này bằng cách tận dụng các **uncontrolled input** thông qua refs, chỉ kích hoạt re-render khi trạng thái validation thay đổi.

Trong bài học này, chúng ta sẽ tìm hiểu **cơ chế cốt lõi** của React Hook Form — đăng ký input, khai báo các quy tắc validation nội dòng (inline), xử lý submit và hiển thị thông báo lỗi — sau đó khám phá tùy chọn **validation theo schema với Zod**.

---

## 📚 Khái niệm & Tổng quan

React Hook Form cung cấp cho bạn một hook duy nhất, `useForm`, trả về những công cụ cần thiết để thiết lập một form. Ba thành phần bạn sẽ dùng trong hầu hết mọi form là:

- **`register`** — kết nối một `<input>` với form. Bạn spread giá trị trả về của nó lên input (`{...register("name")}`). Tham số thứ hai là nơi bạn khai báo **các quy tắc validation nội dòng (inline)**.
- **`handleSubmit`** — bọc lấy hàm submit callback của bạn. Nó chạy validation trước, và chỉ gọi hàm của bạn với `data` đã thu thập nếu mọi quy tắc đều vượt qua.
- **`formState.errors`** — một object chứa mỗi entry tương ứng với một field không vượt qua validation, mỗi entry giữ `message` mà bạn đã định nghĩa trong các quy tắc.

> [!NOTE]
> Thư viện được gọi là **React Hook Form** chính bởi vì tất cả "phép màu" này — validation, xử lý submit và theo dõi lỗi — đều xuất phát từ một hook duy nhất. Hãy destructure chính xác những gì bạn cần: `const { register, handleSubmit, formState: { errors } } = useForm();`

> [!TIP]
> **Validation mode** kiểm soát *thời điểm* validation chạy. Theo mặc định, React Hook Form validate khi submit. Truyền một `mode` vào `useForm` để thay đổi điều này:
> - `mode: "onSubmit"` — (mặc định) chỉ validate khi form được submit.
> - `mode: "onChange"` — validate mỗi khi gõ phím (phản hồi tức thì, nhiều re-render hơn).
> - `mode: "onBlur"` — validate khi người dùng click ra khỏi một field.
> - `mode: "onTouched"` — validate ở lần blur đầu tiên, sau đó ở mỗi lần thay đổi.
>
> Ví dụ: `useForm({ mode: "onBlur" })`.

> [!WARNING]
> **Không** thêm handler `onChange` của riêng bạn để ghi đè lên handler mà `register` cung cấp. Việc spread `{...register("name")}` sẽ gắn `onChange`, `onBlur`, `name`, và `ref` của thư viện. Nếu bạn thay thế `onChange`, React Hook Form sẽ ngừng theo dõi field đó. Nếu bạn cần giá trị trực tiếp (live value), hãy dùng tiện ích `watch` thay thế.

---

## ⚡ Vì sao React Hook Form Nhanh: Controlled so với Uncontrolled

Trước khi đi sâu hơn, hãy hiểu vì sao React Hook Form lại có hiệu năng tốt như vậy.

**Ẩn dụ thực tế:** Hãy tưởng tượng một nhà hàng. Một **controlled form** giống như một người phục vụ chạy về bếp để báo cáo *từng từ một* mà khách nói khi gọi món ("Khách nói 'Tôi'…", "Khách nói 'Tôi muốn'…", "Khách nói 'Tôi muốn gọi'…"). Mệt mỏi và chậm chạp. Một **uncontrolled form** (React Hook Form) giống như một người phục vụ chỉ đơn giản để khách viết xong đơn gọi món trên một tờ giấy (DOM), và chỉ đi vào bếp **một lần duy nhất** — khi đơn đã hoàn tất (submit) hoặc khi có gì đó rõ ràng sai (lỗi validation). Ít chuyến đi hơn rất nhiều, ít công sức hơn rất nhiều.

| Tính năng | Controlled Form (`useState`) | React Hook Form (Uncontrolled) |
| :--- | :--- | :--- |
| **Nơi lưu trữ State** | React Component State | Các node DOM (truy cập qua Refs) |
| **Re-render** | Mỗi lần nhấn phím | Chỉ khi có lỗi validation hoặc submit form |
| **Hiệu năng** | Giảm dần trên form lớn/động | Cực kỳ nhanh (render độc lập) |
| **Tích hợp** | Cập nhật state thủ công (`onChange`) | Tự động qua hook đăng ký `register` |

```text
Controlled form (useState):
  keystroke ─▶ setState ─▶ re-render whole component ─▶ ... (every key)

React Hook Form (uncontrolled):
  keystroke ─▶ value stored on DOM ref (no re-render)
  submit / error ─▶ single re-render
```

---

## 🧩 Quy trình Cốt lõi (Bám sát Transcript)

Đây chính là luồng được dạy trong khóa học. Chúng ta xây dựng một form từng bước bằng **các quy tắc validation nội dòng (inline)** — không cần thư viện bổ sung nào.

### Bước 1: Cài đặt React Hook Form
```bash
npm install react-hook-form
```

### Bước 2: Thiết lập hook

Tạo một component `components/Form.tsx`. Lấy `register`, `handleSubmit`, và `errors` ra từ `useForm`. Định nghĩa một TypeScript interface mô tả dữ liệu form của bạn và truyền nó vào `useForm<FormData>()` để mọi thứ được định kiểu đầy đủ.

```tsx
// src/components/Form.tsx
import { useForm, SubmitHandler } from "react-hook-form";

// 1. Describe the shape of our form data
interface FormData {
  name: string;
  email: string;
  password: string;
}

export const Form = () => {
  // 2. Grab the tools we need from the single useForm hook.
  //    register      -> connects an input field to the form
  //    handleSubmit  -> handles the form submission (runs validation first)
  //    errors        -> contains the validation errors for each field
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // 3. Our own submit function. handleSubmit only calls this if
  //    validation passes. SubmitHandler<FormData> types the `data` arg.
  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    // 4. handleSubmit wraps our onSubmit so validation runs first
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* fields go here (Step 3) */}
    </form>
  );
};
```

### Bước 3: Đăng ký input và khai báo các quy tắc validation nội dòng

**Tham số thứ hai** của `register` là một object chứa các quy tắc validation. Khóa học sử dụng cả bốn quy tắc phổ biến nhất: `required`, `minLength`, `maxLength`, và `pattern`. Mỗi quy tắc có thể là một giá trị thuần, hoặc một object `{ value, message }` để bạn có thể đính kèm một thông báo lỗi tùy biến.

```tsx
<form onSubmit={handleSubmit(onSubmit)}>
  {/* NAME — required, with min/max length constraints */}
  <div>
    <label htmlFor="name">Name</label>
    <input
      type="text"
      id="name"
      {...register("name", {
        required: "Name is required", // must not be empty
        minLength: { value: 3, message: "Minimum length is 3" },
        maxLength: { value: 20, message: "Maximum length is 20" },
      })}
    />
    {/* Show the error message only if this field has an error */}
    {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
  </div>

  {/* EMAIL — required + a regex pattern */}
  <div>
    <label htmlFor="email">Email</label>
    <input
      type="email"
      id="email"
      placeholder="email"
      {...register("email", {
        required: "Email is required",
        pattern: {
          // Standard email regex (copied from a snippet, as the course notes!)
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      })}
    />
    {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
  </div>

  {/* PASSWORD — required + minimum length */}
  <div>
    <input
      type="password"
      placeholder="password"
      {...register("password", {
        required: "Password is required",
        minLength: {
          value: 8,
          message: "Password must be at least 8 characters",
        },
      })}
    />
    {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
  </div>

  <button type="submit">Submit</button>
</form>
```

Khi bạn nhấn **Submit** với các field rỗng, React Hook Form chặn lệnh gọi tới `onSubmit` và điền vào `errors`, nhờ vậy mỗi `<p style={{ color: "red" }}>` xuất hiện cùng thông báo của nó. Sửa lại các input và lỗi tương ứng sẽ tự động biến mất.

### Bước 4 (Tùy chọn): Vô hiệu hóa nút trong khi đang submit

`formState` cũng cung cấp `isSubmitting` — một boolean có giá trị `true` trong khi một `onSubmit` bất đồng bộ đang chờ xử lý. Điều này hoàn hảo để vô hiệu hóa nút và hiển thị một nhãn loading để người dùng không thể submit hai lần.

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<FormData>();

const onSubmit: SubmitHandler<FormData> = async (data) => {
  // Simulate a network request
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log("Sent to API:", data);
};

// ...later, in the JSX:
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Loading..." : "Submit"}
</button>
```

> [!TIP]
> Tái sử dụng cùng một pattern, bạn có thể xây dựng các form lớn (first name, last name, email, city, state, ZIP code, country, v.v.) — mỗi field chỉ đơn giản là một lệnh gọi `register(...)` khác với quy tắc riêng và khối hiển thị `errors.<field>.message` riêng. Cơ chế không bao giờ thay đổi, dù bạn thêm bao nhiêu field đi nữa.

---

## ⚡ Nâng cao (Tùy chọn): Validation theo Schema với Zod

> Phần này là **tùy chọn**. Các quy tắc `register` nội dòng ở trên là tất cả những gì bạn cần cho hầu hết các form. Hãy dùng đến Zod khi bạn muốn một nguồn chân lý (source of truth) duy nhất, có thể tái sử dụng, ưu tiên TypeScript cho việc validation — đặc biệt trên các form doanh nghiệp lớn hơn.

Mặc dù các validation nội dòng cơ bản hoạt động tốt cho các form đơn giản, các ứng dụng React lớn hơn thường hưởng lợi từ một **schema thống nhất**. **Zod** là một thư viện khai báo schema và validation ưu tiên TypeScript. Thay vì rải rác các quy tắc qua từng lệnh gọi `register`, bạn khai báo một schema duy nhất và để nó điều khiển cả validation lúc runtime lẫn các TypeScript type của bạn.

### Bước 1: Cài đặt Zod và Resolver
```bash
npm install zod @hookform/resolvers
```

### Bước 2: Triển khai (TypeScript)
Chúng ta định nghĩa các quy tắc validation bên ngoài component, sau đó truyền validation resolver vào `useForm`:

```tsx
// src/components/RegisterForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 1. Define the validation schema using Zod
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Mark error on confirmPassword field
  });

// 2. Infer TypeScript types from the Zod schema (no manual interface!)
type RegisterInput = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema), // Attach the Zod schema
  });

  const onSubmit = async (data: RegisterInput) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Register data sent to API:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Create Account</h2>

      <div>
        <label>Full Name</label>
        {/* Notice: no inline rules here — the schema handles validation */}
        <input type="text" {...register("name")} />
        {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register("email")} />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register("password")} />
        {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input type="password" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
};
```

> [!NOTE]
> Kết hợp Zod với React Hook Form nghĩa là bạn có được **độ an toàn TypeScript lúc compile-time** và **validation lúc runtime** hoạt động song hành với nhau một cách tự động, giảm thiểu lỗi form. Lưu ý cách các input không còn mang theo các quy tắc nội dòng nữa — schema là nguồn chân lý duy nhất.

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh.

### 1. Hàm `register` làm gì trong React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `register` gắn một phần tử input vào state nội bộ của thư viện. Nó trả về một object chứa các ref handler và sự kiện (`onChange`, `onBlur`, `name`, `ref`). Bằng cách dùng toán tử spread của ES6 (`{...register("name")}`), bạn áp dụng các thuộc tính này trực tiếp lên phần tử input. **Tham số thứ hai** của nó là một object chứa các quy tắc validation nội dòng như `required`, `minLength`, `maxLength`, và `pattern`.
</details>

### 2. React Hook Form kích hoạt validation như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Theo mặc định, validation được kích hoạt khi người dùng submit form (`onSubmit`). Bạn có thể thay đổi hành vi này bằng cách truyền tùy chọn `mode` vào `useForm`. Các mode khả dụng là `onChange` (validate mỗi khi gõ phím), `onBlur` (validate khi người dùng click ra ngoài), hoặc `onTouched` (validate ở sự kiện blur đầu tiên, sau đó ở mỗi lần thay đổi). `handleSubmit(onSubmit)` chỉ gọi callback `onSubmit` của bạn khi mọi quy tắc đều vượt qua.
</details>

### 3. Lợi ích của việc dùng `zod.refine()` trong các schema của Zod là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `refine()` cho phép bạn khai báo **logic validation tùy biến** liên quan đến việc kiểm tra giá trị trên nhiều form field. Một ví dụ phổ biến là xác minh rằng mật khẩu khớp với field xác nhận mật khẩu, hoặc kiểm tra rằng ngày kết thúc nằm sau ngày bắt đầu.
</details>

### 4. Vì sao bạn nên tránh dùng handler sự kiện `onChange` trên các input đã đăng ký với React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Việc ghi đè trực tiếp `onChange` trên node DOM sẽ chặn handler nội bộ của React Hook Form, ngăn nó đăng ký các lần gõ phím và cập nhật các lỗi validation. Nếu bạn cần can thiệp giá trị, hãy truyền một change handler tùy biến bên trong các tùy chọn của register hoặc dùng tiện ích `watch` được `useForm` cung cấp.
</details>

### 5. Trạng thái boolean `isSubmitting` cho chúng ta biết điều gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `isSubmitting` là một state được quản lý bên trong `formState`. Nó tự động chuyển sang `true` khi callback `handleSubmit` của bạn trả về một Promise đang chờ xử lý (pending), và chuyển trở lại `false` khi Promise đó được resolve hoặc reject. Nó lý tưởng để vô hiệu hóa các nút submit và hiển thị các chỉ báo loading (ví dụ `disabled={isSubmitting}` và một nhãn `"Loading..."`).
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Xây dựng Form Đăng ký với các Quy tắc Nội dòng (Cốt lõi)
1. Tạo một component `Form.tsx` và định nghĩa một interface `FormData` với `name`, `email`, và `password` (tất cả đều là `string`).
2. Gọi `useForm<FormData>()` và destructure `register`, `handleSubmit`, và `formState: { errors }`.
3. Định kiểu cho submit callback của bạn bằng `SubmitHandler<FormData>` và `console.log` ra `data`.
4. Đăng ký ba input bằng **các quy tắc nội dòng**:
   - `name`: `required` + `minLength` là 3 + `maxLength` là 20.
   - `email`: `required` + một `pattern` regex với thông báo `"Invalid email address"`.
   - `password`: `required` + `minLength` là 8.
5. Bên dưới mỗi input, render `errors.<field>?.message` màu đỏ, và thêm một `<button type="submit">`.
6. Submit với các field rỗng và xác nhận mỗi thông báo lỗi xuất hiện; sau đó sửa các input và quan sát các lỗi biến mất lần lượt.

### 🛠️ Bài tập 2: Schema Validation Thông tin Địa chỉ (Nâng cao — Zod)
1. Tạo một Zod schema chứa các field sau:
   - `street`: Chuỗi bắt buộc.
   - `zipCode`: Phải chứa chính xác 5 chữ số (gợi ý: dùng regex qua `z.string().regex(...)`).
   - `country`: Phải được chọn từ một danh sách các tùy chọn: `'US'`, `'CA'`, hoặc `'UK'` (gợi ý: `z.enum([...])`).
2. Liên kết schema này với một component React Hook Form bằng `zodResolver` và xác minh các quy tắc validation chặn được dữ liệu nhập sai.

### 🛠️ Bài tập 3: Kiểm tra Độ phức tạp của Mật khẩu (Mở rộng)
1. Thêm một quy tắc độ phức tạp của mật khẩu vào Zod schema: nó phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, và 1 chữ số.
2. Render các thông báo phản hồi một cách động ngay dưới field nhập mật khẩu khi người dùng gõ (gợi ý: dùng `watch("password")` của RHF để kiểm tra giá trị hiện tại theo thời gian thực).
