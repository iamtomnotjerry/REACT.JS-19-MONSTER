# React Hook Form: Kiến thức nền tảng 📝

Form xuất hiện ở khắp mọi nơi — đăng ký, đăng nhập, thanh toán, bảng cài đặt — và chúng khó làm cho đúng hơn ta tưởng. Cách tiếp cận React ngây thơ là gắn một `useState` cho mỗi input, điều đó có nghĩa là **toàn bộ component re-render trên từng lần gõ phím**. Với form năm trường thì điều này gây khó chịu; với form doanh nghiệp ba mươi trường thì nó thực sự bị giật lag.

**React Hook Form** (RHF) khắc phục điều này bằng cách mặc định coi các input của bạn là **uncontrolled**: nó đọc giá trị thẳng từ DOM thông qua ref và chỉ re-render khi có thứ gì đó mà UI thực sự quan tâm thay đổi — một lỗi validation xuất hiện, hoặc form được submit. Trong bài học này bạn sẽ học phần lõi trung thành với transcript: cài đặt thư viện, gọi `useForm<FormValues>()`, đăng ký các trường với **inline validation rules**, xử lý submit bằng một `SubmitHandler` có kiểu, và render thông báo lỗi. Chúng ta cũng sẽ giới thiệu các tiện ích thường dùng `reset`, `watch`, `setValue`, và `getValues`, và giải thích *tại sao* mô hình uncontrolled lại nhanh đến vậy.

> [!NOTE]
> Schema validation với **Zod** (`zodResolver`) là **hoàn toàn mới và cố ý nằm ngoài phạm vi ở đây** — nó nằm ở bài học `02`. Bài học này giữ trung thành với những gì khóa học ghi lại: **chỉ inline validation rules** (`required`, `minLength`, `maxLength`, `min`, `max`, `pattern`). Các tiện ích `reset` / `watch` / `setValue` / `getValues` / `defaultValues` bên dưới đi xa hơn một chút so với transcript đã ghi; chúng được đánh dấu ở nơi xuất hiện và phản ánh best practice hiện hành.

---

## 📚 Khái niệm & Tổng quan

`useForm` là một hook duy nhất trao cho bạn mọi thứ cần thiết để vận hành một form. Thư viện thậm chí được *đặt tên* theo ý tưởng này — tất cả "phép màu" (validation, submission, theo dõi lỗi) đều chảy ra từ một hook. Bạn destructure đúng những gì mình cần:

```tsx
const {
  register,      // connect an <input> to the form
  handleSubmit,  // wrap your submit fn; runs validation first
  reset,         // clear or reset fields to given values
  watch,         // subscribe to live field value(s)
  setValue,      // programmatically set a field's value
  getValues,     // read values without subscribing/re-rendering
  formState: { errors, isSubmitting }, // validation errors + async pending flag
} = useForm<FormValues>();
```

**Phép ẩn dụ đời thực — cuốn sổ tay thông minh.** Hãy hình dung một người phục vụ đang ghi order. Một **controlled form** là người phục vụ chạy ào vào bếp sau *mỗi từ* khách nói: "Họ nói 'Tôi'…", "Họ nói 'Tôi muốn'…", "Họ nói 'Tôi muốn gọi'…". Cuống cuồng và chậm chạp. **React Hook Form** là người phục vụ đưa cho khách một cuốn sổ tay (DOM), để họ viết trọn cả order mà không bị làm phiền, và chỉ đi vào bếp **một lần** — khi order hoàn tất (submit) hoặc khi có thứ gì đó rõ ràng sai (một lỗi validation). Cuốn sổ tay *chính là* nguồn chân lý; người phục vụ chỉ tham gia vào những thời điểm thực sự quan trọng.

Ba mảnh ghép bạn sẽ chạm tới trong hầu như mọi form:

- **`register(name, rules)`** — kết nối một `<input>` với form. Bạn spread giá trị trả về của nó lên element (`{...register("email")}`), thao tác này gắn `name`, `ref`, `onChange`, và `onBlur`. Đối số thứ hai tùy chọn là nơi đặt **validation rules** inline.
- **`handleSubmit(onSubmit)`** — bọc *callback submit của bạn*. Nó chạy validation trước và chỉ gọi hàm của bạn — với `data` đã thu thập và có kiểu — nếu mọi rule đều vượt qua.
- **`formState.errors`** — một object với một mục cho mỗi trường thất bại validation, mỗi mục mang theo `message` mà bạn đã định nghĩa. Bạn render `errors.email?.message`.

> [!NOTE]
> Vì sao generic `useForm<FormValues>()` lại quan trọng: truyền tham số kiểu của bạn khiến `register("email")` từ chối lỗi gõ sai (chỉ tên trường thật mới được chấp nhận), gán kiểu cho đối số `data` trong submit handler, và trao cho `errors` đúng hình dạng của form. Bỏ qua generic là bạn mất toàn bộ sự an toàn đó.

> [!TIP]
> **Validation mode** kiểm soát *khi nào* validation chạy. Mặc định RHF validate khi submit. Truyền `mode` để thay đổi:
> - `mode: "onSubmit"` — (mặc định) chỉ validate khi submit.
> - `mode: "onChange"` — validate trên từng lần gõ phím (phản hồi tức thì, nhiều re-render hơn).
> - `mode: "onBlur"` — validate khi người dùng rời khỏi một trường.
> - `mode: "onTouched"` — validate ở lần blur đầu tiên, rồi trên mỗi lần change sau đó.
>
> Ví dụ: `useForm<FormValues>({ mode: "onBlur" })`.

---

## ⚡ Vì sao nó nhanh: Controlled vs Uncontrolled

Đây là mô hình tư duy quan trọng nhất trong thư viện. Một input **controlled** lưu giá trị của nó trong React state, nên mỗi lần nhấn phím gọi `setState`, dẫn đến re-render component. Một input **uncontrolled** để DOM giữ giá trị; React đọc nó qua một `ref` chỉ khi cần. React Hook Form mặc định là uncontrolled, đó là lý do nó vẫn nhanh ngay cả trên những form khổng lồ.

| Khía cạnh | Controlled (`useState`) | React Hook Form (uncontrolled) |
| :--- | :--- | :--- |
| **Nơi lưu giá trị** | React component state | DOM node, đọc qua `ref` |
| **Re-render** | Mỗi lần gõ phím | Chỉ khi có lỗi / submit / `watch` đã subscribe |
| **Đấu nối** | Thủ công `value` + `onChange` cho mỗi trường | Một lần spread: `{...register("name")}` |
| **Hiệu năng trên form lớn** | Suy giảm rõ rệt | Vẫn nhanh (cô lập, dựa trên ref) |
| **Tốt nhất khi** | Vài trường cần UI dẫn xuất theo thời gian thực | Phần lớn form, đặc biệt là form lớn |

```text
Controlled form (useState):
  keystroke ─▶ setState ─▶ re-render WHOLE component ─▶ ...repeat every key

React Hook Form (uncontrolled):
  keystroke ─▶ value written to DOM ref (NO re-render)
  submit / validation error / watch ─▶ a single, targeted re-render
```

> [!WARNING]
> **Đừng** đặt `onChange` của riêng bạn lên một input đã được register mà nó *thay thế* cái `register` cung cấp. Spread `{...register("name")}` gắn `name`, `ref`, `onChange`, và `onBlur` của RHF. Nếu bạn ghi đè `onChange`, React Hook Form ngừng theo dõi trường đó và validation lặng lẽ hỏng. Nếu bạn cần giá trị trực tiếp, dùng `watch("name")`; nếu bạn cần đặt giá trị, dùng `setValue("name", ...)`.

---

## 🛠️ Bước 1: Cài đặt và Dựng khung

Khóa học dựng khung một project Vite + React + TypeScript và cài thư viện:

```bash
# Scaffold (the course uses Vite)
npm create vite@latest react-hook-form-demo -- --template react-ts
cd react-hook-form-demo
npm install

# Install React Hook Form
npm install react-hook-form

# Run the dev server
npm run dev
```

---

## 🧩 Bước 2: Thiết lập Hook

Tạo `src/components/Form.tsx`. Mô tả hình dạng của form bằng một TypeScript interface và truyền nó vào `useForm<FormValues>()` để mọi thứ phía sau đều có kiểu đầy đủ.

```tsx
// src/components/Form.tsx
import { useForm, type SubmitHandler } from "react-hook-form";

// 1. Describe the shape of our form data.
//    This drives the typing of register(), errors, and the submit handler.
interface FormValues {
  name: string;
  email: string;
  password: string;
}

export const Form = () => {
  // 2. Pull the tools we need out of the single useForm hook.
  //    register     -> connects an input to the form
  //    handleSubmit -> runs validation, then calls our onSubmit on success
  //    errors       -> validation errors, one entry per failing field
  //    isSubmitting -> true while an async onSubmit is pending
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  // 3. Our own submit function. handleSubmit only calls this once every
  //    rule passes. SubmitHandler<FormValues> types the `data` argument
  //    so `data.email` etc. are known and checked at compile time.
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Form submitted:", data);
  };

  return (
    // 4. handleSubmit(onSubmit) wraps our callback so validation runs first.
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* fields go in Step 3 */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Submit"}
      </button>
    </form>
  );
};
```

> [!TIP]
> `import { type SubmitHandler }` dùng inline *type-only* import. Nó hoàn toàn là một kiểu, nên import theo cách này báo cho bundler biết nó có thể bị xóa lúc compile — một thói quen nhỏ nhưng đúng đắn trong các project TypeScript hiện đại.

---

## 🧩 Bước 3: Register Input và Khai báo Inline Rules

**Đối số thứ hai** của `register` là một object các validation rules. Mỗi rule hoặc là một giá trị đơn thuần (`required: true`) hoặc — hữu ích hơn nhiều — một object `{ value, message }` để bạn có thể gắn một thông báo lỗi tùy chỉnh. Đây là form đầy đủ, chạy được mà khóa học xây dựng, mở rộng ra để thể hiện mọi rule thông dụng.

```tsx
// src/components/Form.tsx (full body of the <form>)
import { useForm, type SubmitHandler } from "react-hook-form";

interface FormValues {
  name: string;
  email: string;
  age: number;
  password: string;
}

export const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // Simulate a network request so we can see isSubmitting in action.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Sent to API:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* NAME — required + min/max length */}
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          {...register("name", {
            required: "Name is required", // shorthand: string is the message
            minLength: { value: 3, message: "Minimum length is 3" },
            maxLength: { value: 20, message: "Maximum length is 20" },
          })}
        />
        {/* Render the message only when this field has an error. */}
        {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
      </div>

      {/* EMAIL — required + regex pattern */}
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          placeholder="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              // Standard email regex. The instructor notes he copied this
              // snippet rather than memorising it — totally normal.
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
      </div>

      {/* AGE — number field with min/max. valueAsNumber stores a number,
          not a string, so data.age is typed and validated as a number. */}
      <div>
        <label htmlFor="age">Age</label>
        <input
          type="number"
          id="age"
          {...register("age", {
            required: "Age is required",
            valueAsNumber: true,
            min: { value: 18, message: "You must be at least 18" },
            max: { value: 120, message: "Please enter a realistic age" },
          })}
        />
        {errors.age && <p style={{ color: "red" }}>{errors.age.message}</p>}
      </div>

      {/* PASSWORD — required + minimum length */}
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          placeholder="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
        />
        {errors.password && (
          <p style={{ color: "red" }}>{errors.password.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Submit"}
      </button>
    </form>
  );
};
```

Điều gì xảy ra khi bạn nhấn **Submit** với các trường trống: React Hook Form chặn lời gọi tới `onSubmit`, điền vào `errors`, và mỗi `<p>` màu đỏ xuất hiện cùng thông báo của nó. Sửa một input và lỗi tương ứng tự động biến mất. Vì mỗi trường chỉ là một lời gọi `register(...)` khác với rules riêng và khối `errors.<field>.message` riêng, nên việc mở rộng lên một form ba mươi trường (first name, last name, city, state, ZIP, country…) chỉ thuần túy là lặp lại — cơ chế không hề thay đổi.

Đây là bảng tham chiếu đầy đủ các inline rules được dạy trong khóa học, cộng thêm `min`/`max` cho các input số:

| Rule | Áp dụng cho | Dạng rút gọn | Với thông báo tùy chỉnh |
| :--- | :--- | :--- | :--- |
| `required` | trường bất kỳ | `required: true` | `required: "Name is required"` |
| `minLength` | chuỗi | `minLength: 3` | `minLength: { value: 3, message: "..." }` |
| `maxLength` | chuỗi | `maxLength: 20` | `maxLength: { value: 20, message: "..." }` |
| `min` | số / ngày | `min: 18` | `min: { value: 18, message: "..." }` |
| `max` | số / ngày | `max: 120` | `max: { value: 120, message: "..." }` |
| `pattern` | chuỗi | `pattern: /regex/` | `pattern: { value: /regex/, message: "..." }` |
| `validate` | bất kỳ | — | `validate: (v) => v !== "" || "Custom error"` |

> [!NOTE]
> Thuộc tính `<form noValidate>` tắt các popup validation HTML *gốc* của trình duyệt để thông báo của React Hook Form là cái duy nhất người dùng nhìn thấy. Không có nó, bong bóng "Please fill out this field" của trình duyệt có thể bật lên trước và che mất các lỗi được tạo kiểu của bạn. (Đây là phần bổ sung best-practice đi xa hơn transcript đã ghi.)

---

## ⚡ Cờ `isSubmitting`

`formState.isSubmitting` là một boolean có giá trị `true` trong khi một `onSubmit` **async** đang chờ và lật về `false` khi nó hoàn tất. Nó hoàn hảo để disable nút và hiển thị nhãn loading sao cho người dùng không thể submit hai lần — đúng như những gì ta đã đấu nối vào nút ở trên.

```tsx
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Loading..." : "Submit"}
</button>
```

Trong bản demo đã ghi, request giải quyết tức thì, nên trạng thái loading vụt qua quá nhanh để thấy. Trong môi trường production — nơi mạng thực sự tốn thời gian — trạng thái "Loading..." bị disable hiển thị rõ ràng và ngăn các request trùng lặp.

---

## 🧩 Bước 4: `defaultValues`, `reset`, `watch`, `setValue`, `getValues`

Những tiện ích này hoàn thiện công việc form hàng ngày. Chúng đi xa hơn một chút so với transcript đã ghi, nhưng bạn sẽ với tới chúng liên tục trong các app thực tế.

```tsx
// src/components/ProfileForm.tsx
import { useForm, type SubmitHandler } from "react-hook-form";

interface ProfileValues {
  username: string;
  bio: string;
  newsletter: boolean;
}

export const ProfileForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    // defaultValues seeds the form so fields start populated (e.g. when
    // editing an existing record). It also fixes the type of every field.
    defaultValues: {
      username: "",
      bio: "",
      newsletter: false,
    },
  });

  // watch() SUBSCRIBES to a field and re-renders this component when it
  // changes. Use it for live, derived UI like a character counter.
  const bio = watch("bio");

  const onSubmit: SubmitHandler<ProfileValues> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Saved profile:", data);
    // reset() with no argument clears back to defaultValues. Passing an
    // object resets to those specific values (handy after a successful save).
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          {...register("username", {
            required: "Username is required",
            minLength: { value: 2, message: "At least 2 characters" },
          })}
        />
        {errors.username && (
          <p style={{ color: "red" }}>{errors.username.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          {...register("bio", {
            maxLength: { value: 160, message: "Keep it under 160 characters" },
          })}
        />
        {/* Live counter powered by watch() — this is what watch is for. */}
        <small>{bio.length} / 160</small>
        {errors.bio && <p style={{ color: "red" }}>{errors.bio.message}</p>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("newsletter")} />
          Subscribe to the newsletter
        </label>
      </div>

      {/* setValue writes a field programmatically (no user typing needed). */}
      <button type="button" onClick={() => setValue("bio", "Hello, world!")}>
        Insert sample bio
      </button>

      {/* getValues reads current values WITHOUT subscribing/re-rendering —
          ideal inside event handlers where you just need a snapshot. */}
      <button
        type="button"
        onClick={() => console.log("Snapshot:", getValues())}
      >
        Log current values
      </button>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
};
```

Sự phân biệt then chốt giữa hai tiện ích đọc:

| Tiện ích | Re-render khi thay đổi? | Dùng nó cho |
| :--- | :--- | :--- |
| `watch("field")` | **Có** — subscribe | UI trực tiếp: bộ đếm, trường có điều kiện, preview |
| `getValues()` | **Không** — đọc một lần | Snapshot bên trong event handler / logic submit |

> [!WARNING]
> Lạm dụng `watch` ở khắp nơi tái tạo lại chính cái chi phí re-render mà RHF được thiết kế để tránh — mỗi trường được `watch` re-render component khi thay đổi. Chỉ `watch` những gì UI bắt buộc phải phản ứng theo thời gian thực. Để lấy một snapshot đơn thuần bên trong một handler, dùng `getValues()`, hàm này không bao giờ kích hoạt render.

---

## 🧠 Kiểm tra kiến thức

### 1. `register` trả về gì, và bạn áp dụng nó vào một input như thế nào?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `register(name, rules)` trả về một object các props — `name`, `ref`, `onChange`, và `onBlur` — đấu nối input vào state nội bộ (dựa trên ref) của React Hook Form. Bạn áp dụng nó bằng cách spread: `{...register("email")}`. Đối số thứ hai tùy chọn là object các inline validation rules (`required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `validate`). Vì các input là uncontrolled, RHF đọc giá trị của chúng từ DOM qua `ref` thay vì từ React state.
</details>

### 2. Vì sao React Hook Form nhanh hơn một form controlled dùng `useState`-cho-mỗi-trường?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Các input controlled lưu giá trị trong React state, nên mỗi lần gõ phím gọi `setState` và re-render toàn bộ component. Các input của RHF là **uncontrolled**: DOM giữ giá trị và RHF đọc nó qua một `ref`, nên việc gõ phím **không** kích hoạt re-render. Re-render chỉ xảy ra ở những thời điểm có ý nghĩa — một lỗi validation thay đổi, form được submit, hoặc một trường được `watch` cập nhật. Trên các form lớn, đây chính là khác biệt giữa mượt mà và giật lag.
</details>

### 3. Vai trò của `handleSubmit` là gì, và `SubmitHandler<FormValues>` giúp ích như thế nào?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `handleSubmit(onSubmit)` bọc callback của bạn và được truyền vào `onSubmit` của form. Nó chạy toàn bộ validation trước và **chỉ** gọi `onSubmit` của bạn — với `data` đã thu thập và đã validate — nếu mọi rule vượt qua; ngược lại nó điền vào `formState.errors` và bỏ qua callback của bạn. Gán kiểu callback của bạn thành `SubmitHandler<FormValues>` cho `data` đúng hình dạng của form, nên `data.email`, `data.age`, v.v. được biết đến và kiểm tra lúc compile.
</details>

### 4. Sự khác biệt giữa `watch` và `getValues` là gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `watch("field")` **subscribe** vào một trường và re-render component bất cứ khi nào trường đó thay đổi — dùng nó cho UI dẫn xuất trực tiếp như bộ đếm ký tự hoặc một trường hiển thị theo điều kiện. `getValues()` thực hiện một lần **đọc duy nhất** các giá trị hiện tại và **không** subscribe hay gây re-render — dùng nó bên trong event handler hoặc logic submit khi bạn chỉ cần một snapshot. Lạm dụng `watch` tái tạo lại chi phí re-render mà RHF tồn tại để tránh.
</details>

### 5. `isSubmitting` cho bạn biết điều gì, và `defaultValues` để làm gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `formState.isSubmitting` là `true` trong khi Promise của một submit handler **async** đang chờ và `false` khi nó hoàn tất — hoàn hảo cho `disabled={isSubmitting}` và một nhãn "Loading..." để ngăn submit hai lần. `defaultValues` (truyền vào `useForm`) gieo các giá trị khởi tạo của form — thiết yếu khi chỉnh sửa một bản ghi có sẵn để các trường bắt đầu đã được điền — và nó cũng khóa kiểu của mỗi trường. `reset()` đưa form về các `defaultValues` đó (hoặc về một object bạn truyền cho nó), đây là động tác chuẩn sau một lần lưu thành công.
</details>

---

## 💻 Bài tập thực hành

### 🛠️ Bài tập 1: Form đăng ký với Inline Rules (Cốt lõi)

Dựng lại form trong transcript từ đầu và xác nhận validation hoạt động đúng.

**Nhiệm vụ:**
1. Tạo `Form.tsx` với một interface `FormValues`: `name: string`, `email: string`, `password: string`.
2. Gọi `useForm<FormValues>()` và destructure `register`, `handleSubmit`, và `formState: { errors, isSubmitting }`.
3. Gán kiểu cho callback submit bằng `SubmitHandler<FormValues>`; `await` một độ trễ giả 1.5s, rồi `console.log(data)`.
4. Register ba input với inline rules:
   - `name`: `required` + `minLength` 3 + `maxLength` 20.
   - `email`: `required` + một regex `pattern` với thông báo `"Invalid email address"`.
   - `password`: `required` + `minLength` 8.
5. Render `errors.<field>?.message` màu đỏ bên dưới mỗi input, và thêm `<button type="submit" disabled={isSubmitting}>`.
6. Submit khi để trống để thấy mọi thông báo xuất hiện; sửa từng trường và xem các lỗi lần lượt biến mất.

**Khởi đầu:**
```tsx
import { useForm, type SubmitHandler } from "react-hook-form";

interface FormValues {
  name: string;
  email: string;
  password: string;
}

export const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    // TODO: await a 1500ms delay, then console.log(data)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* TODO: name input + rules + errors.name?.message */}
      {/* TODO: email input + pattern + errors.email?.message */}
      {/* TODO: password input + minLength + errors.password?.message */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Loading..." : "Submit"}
      </button>
    </form>
  );
};
```

### 🛠️ Bài tập 2: Bộ đếm ký tự trực tiếp với `watch` + `reset` (Nâng cao)

Luyện tập các tiện ích bằng cách thêm phản hồi trực tiếp và một reset hoạt động được.

**Nhiệm vụ:**
1. Thêm một trường `tweet: string` được validate với `maxLength: { value: 280, message: "Too long" }`.
2. Dùng `watch("tweet")` để render một bộ đếm trực tiếp: `` `${tweet.length} / 280` ``, chuyển chữ sang màu đỏ khi vượt quá 280.
3. Gieo form với `defaultValues: { tweet: "" }`.
4. Sau một lần submit thành công, gọi `reset()` và xác nhận trường cùng bộ đếm được xóa sạch.
5. Thêm một nút "Clear" (`type="button"`) gọi `reset()` trực tiếp.

**Khởi đầu:**
```tsx
import { useForm, type SubmitHandler } from "react-hook-form";

interface TweetForm {
  tweet: string;
}

export const Composer = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TweetForm>({ defaultValues: { tweet: "" } });

  const tweet = watch("tweet");

  const onSubmit: SubmitHandler<TweetForm> = (data) => {
    console.log(data);
    reset(); // clears back to defaultValues
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <textarea
        {...register("tweet", {
          maxLength: { value: 280, message: "Too long" },
        })}
      />
      {/* TODO: live counter, red once tweet.length > 280 */}
      {/* TODO: errors.tweet?.message */}
      <button type="submit">Post</button>
      {/* TODO: a type="button" Clear button that calls reset() */}
    </form>
  );
};
```
