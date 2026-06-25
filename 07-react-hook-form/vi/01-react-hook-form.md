# Quản lý Form Nâng cao với React Hook Form 📝

Form là phần tối quan trọng đối với sự tương tác của người dùng, nhưng việc quản lý trạng thái form trong React có thể nhanh chóng trở nên phức tạp. Các form được kiểm soát theo cách truyền thống (controlled forms - sử dụng `useState` trên mỗi ô input) sẽ kích hoạt render lại (re-render) toàn bộ component mỗi khi người dùng nhấn một phím, dẫn đến giảm hiệu năng trên các trang phức tạp.

**React Hook Form** giải quyết vấn đề này bằng cách tận dụng các **input không kiểm soát (uncontrolled inputs)** thông qua refs, chỉ kích hoạt re-render khi trạng thái xác thực (validation) thay đổi.

Trong bài học này, chúng ta sẽ tìm hiểu cơ chế cốt lõi của React Hook Form và cách triển khai xác thực theo lược đồ (schema-based validation) bằng thư viện **Zod**.

---

## ⚡ 1. So sánh Controlled Form với Uncontrolled Form

Trước khi đi vào viết code, hãy hiểu lý do tại sao React Hook Form lại có tốc độ xử lý nhanh vượt trội:

| Tính năng | Controlled Forms (`useState`) | React Hook Form (Uncontrolled) |
| :--- | :--- | :--- |
| **Nơi lưu trữ Trạng thái** | React Component State | Các nút DOM (truy cập qua Refs) |
| **Render lại (Re-renders)** | Mỗi khi nhấn một phím bất kỳ | Chỉ khi có lỗi xác thực hoặc submit form |
| **Hiệu năng** | Giảm dần khi form lớn/động | Cực kỳ nhanh (render độc lập) |
| **Tích hợp** | Cập nhật thủ công qua `onChange` | Tự động thông qua hook đăng ký register |

---

## ⚡ 2. Cài đặt Cơ bản và Đăng ký Input (Input Registration)

Hook cốt lõi của React Hook Form là `useForm`. Nó cung cấp các phương thức để đăng ký các ô input DOM, xử lý sự kiện submit và theo dõi các lỗi.

### Bước 1: Cài đặt React Hook Form
```bash
npm install react-hook-form
```

### Bước 2: Triển khai

Dưới đây là cách bạn đăng ký các trường form cơ bản và bắt các lỗi xác thực:

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

export const SimpleForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log("Form Submitted Successfully:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-slate-900 rounded-lg flex flex-col gap-4 text-white max-w-md mx-auto">
      <div>
        <label className="block text-sm font-semibold mb-1">Username</label>
        <input 
          type="text" 
          {...register("username", { required: "Username is required", minLength: { value: 3, message: "Minimum length is 3" } })} 
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
        />
        {errors.username && <span className="text-red-500 text-xs mt-1 block">{errors.username.message}</span>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Email</label>
        <input 
          type="email" 
          {...register("email", { 
            required: "Email is required", 
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } 
          })} 
          className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
        />
        {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
      </div>

      <button type="submit" className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition">
        Submit
      </button>
    </form>
  );
};
```

---

## 🛡️ 3. Xác thực Lược đồ (Schema Validation) với Zod

Mặc dù các xác thực nội dòng (inline validations) cơ bản hoạt động tốt cho các form đơn giản, nhưng các ứng dụng React lớn lại yêu cầu một cấu trúc xác thực đồng bộ. **Zod** là thư viện định nghĩa lược đồ (schema) và xác thực dữ liệu ưu tiên hỗ trợ TypeScript.

### Bước 1: Cài đặt Zod và Resolver
```bash
npm install zod @hookform/resolvers
```

### Bước 2: Triển khai (TypeScript)
Chúng ta định nghĩa các quy tắc xác thực bên ngoài component, sau đó truyền validation resolver vào `useForm`:

```tsx
// src/components/RegisterForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Định nghĩa lược đồ xác thực sử dụng Zod
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"] // Đánh dấu lỗi trên trường confirmPassword
});

// 2. Suy luận kiểu dữ liệu TypeScript từ Schema của Zod
type RegisterInput = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) // Liên kết schema Zod
  });

  const onSubmit = async (data: RegisterInput) => {
    // Giả lập độ trễ mạng
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Register data sent to API:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-4 text-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Create Account</h2>

      <div>
        <label className="block text-sm mb-1">Full Name</label>
        <input type="text" {...register("name")} className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
        {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
      </div>

      <div>
        <label className="block text-sm mb-1">Email</label>
        <input type="email" {...register("email")} className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
        {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email.message}</span>}
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input type="password" {...register("password")} className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
        {errors.password && <span className="text-red-500 text-xs mt-1 block">{errors.password.message}</span>}
      </div>

      <div>
        <label className="block text-sm mb-1">Confirm Password</label>
        <input type="password" {...register("confirmPassword")} className="w-full p-2 rounded bg-slate-800 border border-slate-700" />
        {errors.confirmPassword && <span className="text-red-500 text-xs mt-1 block">{errors.confirmPassword.message}</span>}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting} 
        className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition disabled:opacity-50"
      >
        {isSubmitting ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
};
```

> [!NOTE]
> Kết hợp Zod với React Hook Form mang lại khả năng **bảo vệ kiểu dữ liệu an toàn khi compile (TypeScript compile-time safety)** và **xác thực dữ liệu khi chạy (runtime validation)** hoạt động bổ trợ lẫn nhau một cách tự động, giúp giảm thiểu lỗi lập trình form.

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác minh câu trả lời.

### 1. Hàm `register` làm nhiệm vụ gì trong React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `register` liên kết một phần tử đầu vào (input) với trạng thái bên trong của thư viện. Nó trả về một đối tượng chứa các trình xử lý tham chiếu (refs) và sự kiện (`onChange`, `onBlur`, `name`, `ref`). Bằng cách sử dụng cú pháp spread của ES6 (`{...register("name")}`), bạn áp dụng trực tiếp các thuộc tính này lên phần tử input.
</details>

### 2. React Hook Form kích hoạt việc xác thực (validation) vào lúc nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Theo mặc định, việc xác thực được kích hoạt khi người dùng nhấn nút gửi form (`onSubmit`). Bạn có thể thay đổi hành vi này bằng cách truyền thuộc tính `mode` vào `useForm`. Các chế độ hỗ trợ bao gồm `onChange` (xác thực mỗi khi gõ phím), `onBlur` (xác thực khi người dùng nhấn click chuột ra ngoài), hoặc `onTouched` (xác thực ở sự kiện blur đầu tiên, sau đó xác thực ở mỗi lần thay đổi).
</details>

### 3. Lợi ích của việc sử dụng hàm `zod.refine()` trong các lược đồ của Zod là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `refine()` cho phép bạn định nghĩa các **logic xác thực tùy biến** đòi hỏi đối chiếu giá trị giữa nhiều trường thông tin khác nhau trong form. Một ví dụ phổ biến là kiểm tra xem mật khẩu nhập lại có khớp với mật khẩu ban đầu hay không, hoặc kiểm tra xem ngày kết thúc có nằm sau ngày bắt đầu hay không.
</details>

### 4. Tại sao bạn nên tránh ghi đè trực tiếp thuộc tính sự kiện `onChange` trên các input đã đăng ký với React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Việc ghi đè trực tiếp thuộc tính `onChange` trên nút DOM sẽ chặn trình xử lý nội bộ của React Hook Form, khiến thư viện không thể theo dõi sự thay đổi giá trị phím gõ để cập nhật các lỗi xác thực. Nếu cần can thiệp xử lý giá trị, hãy truyền hàm xử lý thay đổi tùy biến thông qua thuộc tính của hàm register hoặc sử dụng tiện ích `watch` được cung cấp từ `useForm`.
</details>

### 5. Cờ trạng thái `isSubmitting` cho chúng ta biết thông tin gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `isSubmitting` là trạng thái boolean được quản lý bên trong `formState`. Nó tự động chuyển sang `true` khi hàm callback `handleSubmit` của bạn trả về một Promise đang trong trạng thái chờ xử lý (pending), và chuyển về `false` khi Promise đó được giải quyết (resolved) hoặc bị từ chối (rejected). Đây là cờ lý tưởng để ẩn/hiện chỉ báo loading hoặc vô hiệu hóa nút submit.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Lược đồ Xác thực Thông tin Địa chỉ
1. Tạo một lược đồ Zod chứa các trường thông tin sau:
   - `street`: Chuỗi bắt buộc.
   - `zipCode`: Phải chứa chính xác 5 chữ số (gợi ý: sử dụng kiểm tra regex).
   - `country`: Phải là một giá trị được lựa chọn trong mảng các tùy chọn: `'US'`, `'CA'`, hoặc `'UK'`.
2. Liên kết lược đồ này với một component React Hook Form và xác minh xem các quy tắc xác thực có chặn chính xác dữ liệu nhập sai hay không.

### 🛠️ Bài tập 2: Kiểm tra Độ phức tạp của Mật khẩu
1. Thêm một quy tắc kiểm tra độ phức tạp của mật khẩu vào Zod schema: mật khẩu phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường và 1 chữ số.
2. Hiển thị thông báo phản hồi động ngay dưới trường nhập mật khẩu khi người dùng đang gõ (gợi ý: sử dụng tính năng `watch("password")` của RHF để kiểm tra giá trị hiện tại theo thời gian thực).
