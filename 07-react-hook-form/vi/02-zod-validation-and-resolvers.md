# RHF + Zod: Schema Validation & Nested Forms 🛡️

Trong bài học trước, bạn đã kết nối React Hook Form với **các quy tắc inline** — `required`, `minLength`, `pattern`, và những thứ tương tự, mỗi quy tắc được khai báo riêng cho từng field bên trong `register(...)`. Cách đó hoạt động được, nhưng khi form lớn dần lên, logic validation bị rải rác qua hàng chục lệnh gọi `register`, interface `FormData` của bạn và các quy tắc dần trở nên lệch nhau, và không có một artifact duy nhất nào bạn có thể tái sử dụng ở phía server. Bài học này khắc phục tất cả những điều đó bằng **Zod**.

**Zod** là một thư viện khai báo và validation schema ưu tiên TypeScript. Bạn khai báo *hình dạng và quy tắc* của dữ liệu **một lần duy nhất**, trong một object, rồi sau đó: (1) suy ra kiểu TypeScript của form từ nó một cách miễn phí, (2) đưa nó cho React Hook Form qua `zodResolver` để nó điều khiển validation tại runtime, và tùy chọn (3) tái sử dụng đúng schema đó ở backend. Đây là cách tiếp cận **schema-first**, và nó là tiêu chuẩn hiện đại cho các form nghiêm túc. Chúng ta sẽ tìm hiểu các kiểu nguyên thủy, validation liên field với `.refine`/`.superRefine`, các schema object lồng nhau, và các field array động với `useFieldArray`.

> [!NOTE]
> **Vượt ra ngoài khóa học đã ghi hình.** Bản transcript hơn 50 giờ dạy React Hook Form bằng **các quy tắc `register` inline**; nó không đề cập đến Zod, resolver, `useFieldArray`, hay schema composition. Mọi thứ trong bài học này đều là **kiến thức hoàn toàn mới, best practice hiện đại** được xây dựng trực tiếp dựa trên cơ chế RHF mà bạn đã học. API `register` / `handleSubmit` / `formState` vẫn y hệt — chúng ta chỉ đang thay đổi *nguồn gốc của validation*.

---

## 📚 Concept & Overview

Với các quy tắc inline, validation nằm **bên trong JSX**, vướng víu với markup. Với Zod, validation nằm trong **một object thuần** chẳng liên quan gì đến React. React Hook Form kết nối với nó thông qua một adapter mỏng gọi là **resolver**.

Luồng làm việc luôn là ba bước giống nhau:

1. **Định nghĩa** một schema với `z.object({ ... })`.
2. **Suy ra** kiểu của form với `type FormValues = z.infer<typeof schema>` — không cần viết interface bằng tay.
3. **Kết nối** nó: `useForm<FormValues>({ resolver: zodResolver(schema) })`.

Sau đó, mỗi input chỉ là `{...register("field")}` với **không có quy tắc inline nào** — schema là nguồn chân lý duy nhất.

### 🧩 Phép ẩn dụ thực tế: trạm kiểm tra an ninh sân bay

Hãy hình dung các quy tắc `register` inline như việc nhờ **người bạn riêng của từng hành khách** đứng ra bảo lãnh cho họ tại cổng — các quy tắc bị phân tán, không nhất quán, và chẳng ai nắm được bức tranh toàn cảnh. Zod là **trạm kiểm tra an ninh trung tâm với một cuốn sổ quy tắc được công bố**: mọi hành khách (field) đều đi qua *cùng một* bộ kiểm tra đã được ghi chép, cuốn sổ quy tắc được in một lần và dán lên tường (file schema của bạn), và *website* của hãng hàng không (các kiểu TypeScript của bạn) được sinh ra từ chính cuốn sổ quy tắc đó nên nó không bao giờ có thể tuyên bố một quy tắc mà trạm kiểm tra không thực thi. Một cuốn sổ quy tắc, được thực thi tại runtime, được phản chiếu trong các kiểu của bạn.

### Quy tắc inline vs. Zod schema

| Khía cạnh | Quy tắc `register` inline | Zod schema + `zodResolver` |
| :--- | :--- | :--- |
| **Nguồn chân lý** | Rải rác qua mọi lệnh gọi `register` | Một `z.object` ở một nơi |
| **Kiểu TypeScript** | `interface` viết tay (có thể lệch) | Suy ra qua `z.infer` (luôn đồng bộ) |
| **Quy tắc liên field** | Vụng về (callback `validate` đọc các field khác) | Được hỗ trợ tận gốc qua `.refine` / `.superRefine` |
| **Tái sử dụng ở backend** | Không thể (gắn chặt với RHF + JSX) | Cùng schema validate payload của API |
| **Dữ liệu lồng nhau / mảng** | Dài dòng, thủ công | Lồng `z.object` + `z.array` |
| **Transform (trim, coerce)** | Không hỗ trợ | `.trim()`, `.transform()`, `z.coerce.*` |

```text
        ┌─────────────────────────────┐
        │   schema = z.object({...})  │   ← ONE source of truth
        └──────────────┬──────────────┘
                       │
        ┌──────────────┼───────────────────────────┐
        ▼              ▼                            ▼
 z.infer<typeof>   zodResolver(schema)      (optional) backend
   = FormValues    → useForm runtime         reuse: schema.parse(req.body)
   (compile-time)    validation
```

> [!TIP]
> Giữ các schema trong file riêng của chúng (ví dụ `schemas/registration.ts`) và export cả schema **lẫn** kiểu được suy ra của nó. Form của bạn import kiểu cho `useForm<...>`, và API route của bạn import schema để `parse()` request body. Một file, được validate ở cả hai đầu của đường truyền.

---

## ⚡ 1. Setup: Cài đặt Zod và Resolver

Hai package: bản thân `zod`, và `@hookform/resolvers`, cây cầu chính thức giúp RHF hiểu được Zod (và Yup, Valibot, v.v.).

```bash
npm install zod @hookform/resolvers
```

> [!NOTE]
> Bài học này hướng tới **Zod 3.23+** (dòng hiện tại) và **React Hook Form 7**. Trong Zod 3, lệnh import là `import { z } from "zod"`. Đường dẫn import của resolver là `@hookform/resolvers/zod`. Đây là các API ổn định, dùng được trong production.

---

## 🛠️ 2. Schema đầu tiên của bạn: Kiểu nguyên thủy, `.min`, `.max`, `.email`, `.regex`

Hãy xây dựng lại form đăng ký từ Bài 1 theo cách schema-first. Chúng ta khai báo schema, suy ra kiểu, và gắn resolver. Lưu ý rằng các input **không mang quy tắc inline** nào cả.

```tsx
// src/schemas/registration.ts
import { z } from "zod";

// 1. ONE schema describing the whole form.
//    Every chained method (.min, .email, .regex) is both a runtime rule
//    AND a contributor to the inferred TypeScript type.
export const registrationSchema = z.object({
  // .trim() strips whitespace BEFORE the length check runs.
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters"),

  // .email() is a built-in string refinement — no hand-rolled regex needed.
  email: z.string().trim().email("Please enter a valid email address"),

  // .regex() lets you express precise rules. Here: 8+ chars, with at least
  // one lowercase, one uppercase, and one digit.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),

  // z.coerce.number() converts the string an <input> always produces
  // into a real number BEFORE validating the range.
  age: z.coerce
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18")
    .max(120, "Please enter a realistic age"),

  // A boolean checkbox that MUST be true. .refine() rejects `false`.
  acceptTerms: z
    .boolean()
    .refine((checked) => checked === true, "You must accept the terms"),
});

// 2. Derive the form type FROM the schema. If you add a field to the
//    schema, this type updates automatically — they can never drift apart.
export type RegistrationValues = z.infer<typeof registrationSchema>;
```

Bây giờ đến component. Đây vẫn là API RHF mà bạn đã quen — dòng mới duy nhất là `resolver`.

```tsx
// src/components/RegistrationForm.tsx
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationValues } from "../schemas/registration";

export const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    // The single line that swaps "inline rules" for "schema-driven validation".
    resolver: zodResolver(registrationSchema),
    mode: "onTouched", // validate on first blur, then on every change
    defaultValues: {
      username: "",
      email: "",
      password: "",
      age: 18,
      acceptTerms: false,
    },
  });

  const onSubmit: SubmitHandler<RegistrationValues> = async (data) => {
    // `data` is fully typed AND already coerced/trimmed by Zod.
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log("Validated payload:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" {...register("username")} />
        {errors.username && <p style={{ color: "red" }}>{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="age">Age</label>
        {/* valueAsNumber is optional because z.coerce.number() already converts,
            but it keeps the field value numeric in RHF's store too. */}
        <input id="age" type="number" {...register("age", { valueAsNumber: true })} />
        {errors.age && <p style={{ color: "red" }}>{errors.age.message}</p>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("acceptTerms")} />
          I accept the terms and conditions
        </label>
        {errors.acceptTerms && (
          <p style={{ color: "red" }}>{errors.acceptTerms.message}</p>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Register"}
      </button>
    </form>
  );
};
```

> [!WARNING]
> Một `<input type="number">` vẫn trao cho JavaScript một **chuỗi** ("18", không phải `18`). Nếu schema của bạn khai báo `age: z.number()` mà không coercion, validation sẽ thất bại với *"Expected number, received string."* Hãy sửa nó bằng **một trong hai cách**: `z.coerce.number()` trong schema **hoặc** `register("age", { valueAsNumber: true })` trên input. Dùng `z.coerce.*` là lựa chọn dễ tái sử dụng hơn vì cùng schema đó khi ấy cũng hoạt động cho các payload JSON API nơi giá trị có thể đến dưới dạng chuỗi.

---

## ⚡ 3. Validation liên field: `.refine` và `.superRefine`

Một số quy tắc không thể nằm trên một field đơn lẻ — "confirm password phải bằng password" phụ thuộc vào **hai** field cùng lúc. Zod xử lý điều này ở **cấp object** với `.refine` (một kiểm tra) hoặc `.superRefine` (nhiều kiểm tra / kiểm soát chi tiết).

### 🧩 `.refine` — một quy tắc liên field

```tsx
// src/schemas/signup.ts
import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  // .refine runs AFTER each field's own rules pass. It receives the whole object.
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    // `path` decides WHICH field the error attaches to — so RHF shows it
    // under the confirmPassword input, not at the form root.
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;
```

> [!WARNING]
> Luôn đặt `path` trên một `.refine` liên field. Nếu thiếu nó, Zod sẽ gắn lỗi vào **gốc của form** (`errors.root`), và khối `{errors.confirmPassword && ...}` theo từng field của bạn sẽ không bao giờ hiển thị nó. Người dùng thấy form lặng lẽ từ chối submit mà không có lý do nào hiện ra.

### 🛠️ `.superRefine` — nhiều kiểm tra có điều kiện

`.refine` trả về một kết quả pass/fail đơn lẻ. Khi bạn cần **nhiều** vấn đề, các quy tắc có điều kiện, hoặc các thông báo khác nhau trên các path khác nhau, hãy dùng `.superRefine`, thứ cung cấp cho bạn một `ctx` để push bao nhiêu vấn đề tùy thích.

```tsx
// src/schemas/booking.ts
import { z } from "zod";

export const bookingSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    guests: z.coerce.number().int().min(1, "At least one guest"),
    promoCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Rule 1: end must be after start.
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after the start date",
        path: ["endDate"],
      });
    }

    // Rule 2: stays over 30 days require a promo code (conditional rule).
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = (data.endDate.getTime() - data.startDate.getTime()) / msPerDay;
    if (nights > 30 && !data.promoCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stays longer than 30 nights require a promo code",
        path: ["promoCode"],
      });
    }

    // Rule 3: more than 8 guests is not allowed.
    if (data.guests > 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum 8 guests per booking",
        path: ["guests"],
      });
    }
  });

export type BookingValues = z.infer<typeof bookingSchema>;
```

| Phương thức | Trả về | Dùng khi |
| :--- | :--- | :--- |
| `.refine(fn, opts)` | boolean (một vấn đề) | Đúng một quy tắc liên field, một thông báo |
| `.superRefine(fn)` | void (push nhiều qua `ctx.addIssue`) | Nhiều quy tắc / có điều kiện, các path khác nhau |

---

## ⚡ 4. Schema Object lồng nhau

Các form thực tế nhóm các field liên quan với nhau — một địa chỉ, một khối thanh toán, một profile. Zod lồng `z.object` bên trong `z.object`, và React Hook Form định địa chỉ các field lồng nhau bằng **đường dẫn có dấu chấm** trong `register`.

```tsx
// src/schemas/profile.ts
import { z } from "zod";

// A reusable sub-schema. Define it once, drop it into any parent object.
const addressSchema = z.object({
  street: z.string().trim().min(1, "Street is required"),
  city: z.string().trim().min(1, "City is required"),
  // 5-digit US ZIP via regex.
  zip: z.string().regex(/^\d{5}$/, "ZIP must be exactly 5 digits"),
  country: z.enum(["US", "CA", "UK"], {
    // Shown when the value is missing or not one of the allowed options.
    message: "Select a valid country",
  }),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short"),
  // Nested objects compose cleanly.
  address: addressSchema,
});

export type ProfileValues = z.infer<typeof profileSchema>;
// z.infer expands recursively:
// { fullName: string; address: { street: string; city: string; zip: string; country: "US" | "CA" | "UK" } }
```

```tsx
// src/components/ProfileForm.tsx
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileValues } from "../schemas/profile";

export const ProfileForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      address: { street: "", city: "", zip: "", country: "US" },
    },
  });

  const onSubmit: SubmitHandler<ProfileValues> = (data) => {
    console.log("Profile:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input placeholder="Full name" {...register("fullName")} />
      {errors.fullName && <p style={{ color: "red" }}>{errors.fullName.message}</p>}

      <fieldset>
        <legend>Address</legend>

        {/* Dotted paths register nested fields. */}
        <input placeholder="Street" {...register("address.street")} />
        {errors.address?.street && (
          <p style={{ color: "red" }}>{errors.address.street.message}</p>
        )}

        <input placeholder="City" {...register("address.city")} />
        {errors.address?.city && (
          <p style={{ color: "red" }}>{errors.address.city.message}</p>
        )}

        <input placeholder="ZIP" {...register("address.zip")} />
        {errors.address?.zip && (
          <p style={{ color: "red" }}>{errors.address.zip.message}</p>
        )}

        <select {...register("address.country")}>
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="UK">United Kingdom</option>
        </select>
        {errors.address?.country && (
          <p style={{ color: "red" }}>{errors.address.country.message}</p>
        )}
      </fieldset>

      <button type="submit">Save profile</button>
    </form>
  );
};
```

> [!TIP]
> Các lỗi lồng nhau được truy cập bằng **cùng hình dạng có dấu chấm**, nhưng trong JavaScript điều đó có nghĩa là optional chaining: `errors.address?.zip?.message`. Dấu `?.` rất quan trọng — `errors.address` là `undefined` cho đến khi sub-object đó có ít nhất một lỗi.

---

## 🧩 5. Field Array động: `useFieldArray` + `z.array`

Các form khó nhất là những form **động**: một hóa đơn với N dòng mục, một team với N thành viên, một công thức với N nguyên liệu. `useFieldArray` của React Hook Form quản lý cơ chế thêm/xóa/sắp xếp lại, còn `z.array(...)` mô tả và validate tập hợp đó.

```tsx
// src/schemas/invoice.ts
import { z } from "zod";

const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
});

export const invoiceSchema = z.object({
  client: z.string().trim().min(1, "Client name is required"),
  // z.array validates EVERY element with lineItemSchema, plus the array length.
  items: z
    .array(lineItemSchema)
    .min(1, "Add at least one line item")
    .max(20, "An invoice can have at most 20 items"),
});

export type InvoiceValues = z.infer<typeof invoiceSchema>;
// items is typed as { description: string; quantity: number; unitPrice: number }[]
```

```tsx
// src/components/InvoiceForm.tsx
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceValues } from "../schemas/invoice";

export const InvoiceForm = () => {
  const {
    register,
    control, // useFieldArray needs `control` from the same useForm instance
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  // `fields` is the render list. Always use field.id (a stable RHF-generated
  // key) for the React `key` — NOT the array index, which breaks on reorder.
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit: SubmitHandler<InvoiceValues> = (data) => {
    console.log("Invoice:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input placeholder="Client name" {...register("client")} />
      {errors.client && <p style={{ color: "red" }}>{errors.client.message}</p>}

      {fields.map((field, index) => (
        <div key={field.id} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div>
            <input
              placeholder="Description"
              {...register(`items.${index}.description` as const)}
            />
            {errors.items?.[index]?.description && (
              <p style={{ color: "red" }}>
                {errors.items[index]?.description?.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="Qty"
              {...register(`items.${index}.quantity` as const, {
                valueAsNumber: true,
              })}
            />
            {errors.items?.[index]?.quantity && (
              <p style={{ color: "red" }}>
                {errors.items[index]?.quantity?.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="number"
              step="0.01"
              placeholder="Unit price"
              {...register(`items.${index}.unitPrice` as const, {
                valueAsNumber: true,
              })}
            />
            {errors.items?.[index]?.unitPrice && (
              <p style={{ color: "red" }}>
                {errors.items[index]?.unitPrice?.message}
              </p>
            )}
          </div>

          {/* Disable remove if only one row remains, to honor the .min(1) rule */}
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            Remove
          </button>
        </div>
      ))}

      {/* append adds a fully-shaped new row matching the schema */}
      <button
        type="button"
        onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
      >
        Add line item
      </button>

      {/* Array-LEVEL error (e.g. .min(1) / .max(20)) lives on errors.items.root */}
      {errors.items?.root && (
        <p style={{ color: "red" }}>{errors.items.root.message}</p>
      )}

      <button type="submit">Create invoice</button>
    </form>
  );
};
```

> [!WARNING]
> Lỗi `useFieldArray` phổ biến nhất là dùng **index** của mảng làm React `key`. Khi bạn xóa hoặc sắp xếp lại các dòng, các index dịch chuyển, React tái sử dụng nhầm các DOM node, và các input hiển thị giá trị cũ. Luôn dùng `field.id` ổn định mà `useFieldArray` sinh ra: `key={field.id}`.

> [!TIP]
> Phân biệt hai vị trí lỗi. Một field **riêng lẻ** bị sai là `errors.items?.[index]?.quantity`. Một vi phạm quy tắc của **toàn bộ mảng** (`.min(1)` / `.max(20)`) nằm tại `errors.items?.root`. Hãy render cả hai để người dùng thấy "dòng này sai" *và* "bạn cần ít nhất một dòng."

---

## ⚡ 6. Vì sao Schema-First vượt trội hơn các quy tắc inline rải rác

```text
INLINE RULES                          ZOD SCHEMA
────────────                          ──────────
interface FormData {...}   ── drift ─▶  type = z.infer<schema>   (auto, in sync)
register("a",{rules})                   schema.a = z.string()...
register("b",{rules})       scattered   schema.b = z.number()...   one object
register("c",{rules})                   schema.c = ...
   ▲                                        │
   │ FE only                                ▼ same schema
 backend re-validates                  backend: schema.parse(req.body)
 with DIFFERENT code  ⚠️ drift          SAME rules ✓
```

- **Nguồn chân lý duy nhất.** Thêm một field một lần, trong schema; cả kiểu lẫn các quy tắc runtime đều cập nhật theo. Không còn cảnh "tôi đã cập nhật interface nhưng quên quy tắc validation."
- **Kiểu FE/BE dùng chung được.** Đặt schema trong một package dùng chung. Form import kiểu được suy ra của nó; API route gọi `schema.parse(req.body)`. Frontend và backend thực thi *đúng nguyên văn cùng một bộ quy tắc*, loại bỏ sự lệch nhau kinh điển kiểu "UI cho phép nhưng server lại từ chối."
- **Khả năng kết hợp.** Các sub-schema (`addressSchema`, `lineItemSchema`) lồng và tái sử dụng được. Bạn xây các form lớn từ những mảnh nhỏ đã được validate.
- **Transform và coercion.** `.trim()`, `.toLowerCase()`, `z.coerce.number()`, `.transform()` làm sạch và chuyển đổi dữ liệu *như một phần của validation*, nên `onSubmit` của bạn nhận một payload đã chuẩn hóa, đúng kiểu — chứ không phải các chuỗi input thô.

> [!NOTE]
> Tái sử dụng schema ở backend là lợi ích nổi bật nhất. Định nghĩa `registrationSchema` trong `packages/shared`, import kiểu được suy ra trong form React của bạn, và trong route Express/Next của bạn hãy làm `const data = registrationSchema.parse(req.body)`. Nếu validation pass, `data` vừa đầy đủ kiểu *vừa* đáng tin cậy. Một cuốn sổ quy tắc, hai đầu của đường truyền.

---

## 🧠 Test Your Knowledge

### 1. Ba bước để kết nối một Zod schema với React Hook Form là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  (1) **Định nghĩa** schema với `z.object({ ... })` và các quy tắc field của nó. (2) **Suy ra** kiểu TypeScript của form với `type FormValues = z.infer<typeof schema>` — không cần viết interface bằng tay. (3) **Kết nối** nó vào hook với `useForm<FormValues>({ resolver: zodResolver(schema) })`, import `zodResolver` từ `@hookform/resolvers/zod`. Sau đó, các input được register bằng `{...register("field")}` thuần và không mang quy tắc inline nào — schema là nguồn chân lý duy nhất cho cả validation tại runtime lẫn các kiểu.
</details>

### 2. Vì sao một `.refine` liên field cần một `path`, và điều gì xảy ra nếu bạn bỏ qua nó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một `.refine` (hay một issue của `.superRefine`) chạy ở **cấp object**, nên Zod không biết phải đổ lỗi cho field nào. Tùy chọn `path` (ví dụ `path: ["confirmPassword"]`) bảo Zod gắn lỗi vào một field cụ thể, nhờ vậy React Hook Form đưa nó ra dưới dạng `errors.confirmPassword.message`. Nếu bạn bỏ qua `path`, lỗi sẽ gắn vào **gốc của form** (`errors.root`), và bất kỳ khối hiển thị theo từng field nào như `{errors.confirmPassword && ...}` sẽ không bao giờ render nó — form lặng lẽ từ chối submit mà không có thông báo nào hiện ra.
</details>

### 3. Khi nào bạn nên dùng đến `.superRefine` thay vì `.refine`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Dùng `.refine` cho một quy tắc liên field **đơn lẻ** với một kết quả boolean và một thông báo. Dùng `.superRefine((data, ctx) => ...)` khi bạn cần push **nhiều** issue, áp dụng các quy tắc **có điều kiện**, hoặc nhắm tới **các path khác nhau** với các thông báo khác nhau trong một lượt validation. `.superRefine` cung cấp cho bạn một object `ctx` và bạn gọi `ctx.addIssue({ code: z.ZodIssueCode.custom, message, path })` bao nhiêu lần tùy cần (ví dụ "end sau start", "lưu trú dài cần promo code", "tối đa 8 khách" — ba issue trên ba path khác nhau).
</details>

### 4. Vì sao bạn phải dùng `field.id` (không phải index của mảng) làm React key trong một danh sách `useFieldArray`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useFieldArray` trả về một mảng `fields` trong đó mỗi phần tử có một `id` ổn định, do thư viện sinh ra. Nếu bạn dùng **index** làm key cho các dòng, thì việc xóa hoặc sắp xếp lại một dòng sẽ làm dịch chuyển mọi index phía sau; bộ reconciler của React khớp các phần tử cũ và mới theo key, nên nó tái sử dụng nhầm các DOM node và các input hiển thị giá trị cũ từ một dòng khác. Dùng `field.id` ổn định làm key giữ cho danh tính của mỗi dòng cố định qua các thao tác thêm/xóa/sắp xếp lại, nhờ vậy đúng input giữ đúng giá trị.
</details>

### 5. Một field `<input type="number">` thất bại validation với "Expected number, received string." Vì sao, và hai cách sửa là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các DOM input luôn tạo ra **chuỗi** — một number input cho `"18"`, không phải `18` — nên một schema khai báo `z.number()` sẽ từ chối nó. **Cách A (phía schema):** dùng `z.coerce.number()`, thứ chuyển đổi giá trị trước khi validate; cách này được ưa chuộng vì cùng schema đó khi ấy cũng hoạt động cho các payload JSON API. **Cách B (phía form):** truyền `register("age", { valueAsNumber: true })` để RHF lưu một giá trị số. Dùng `z.coerce.*` giữ cho schema dễ tái sử dụng giữa frontend và backend; kết hợp cả hai cũng vô hại và giữ cho giá trị nội bộ của RHF cũng là số.
</details>

---

## 💻 Practice Exercises

### 🛠️ Bài tập 1: Form signup với xác nhận mật khẩu (liên field)

Xây dựng một form signup hoàn chỉnh mà validation của nó nằm hoàn toàn trong một Zod schema.

**Nhiệm vụ:**
1. Tạo `schemas/signup.ts` export một `signupSchema` với `email` (email hợp lệ, đã trim), `password` (tối thiểu 8 ký tự, phải chứa một chữ hoa và một chữ số qua `.regex`), và `confirmPassword` (string).
2. Thêm một `.refine` kiểm tra `password === confirmPassword`, với `message: "Passwords do not match"` và `path: ["confirmPassword"]`.
3. Export `type SignupValues = z.infer<typeof signupSchema>`.
4. Xây dựng form với `useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: "onTouched" })`, ba input đã register, và phần hiển thị lỗi theo từng field.
5. Kiểm chứng: submit với mật khẩu không khớp sẽ hiển thị lỗi dưới field confirm; làm cho chúng khớp sẽ xóa lỗi đó.

**Code khởi đầu:**

```tsx
// src/schemas/signup.ts
import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().trim().email("Enter a valid email"),
    // TODO: password with .min(8) + two .regex rules
    password: z.string(),
    confirmPassword: z.string(),
  })
  // TODO: add the cross-field .refine here (remember the path!)
  ;

export type SignupValues = z.infer<typeof signupSchema>;
```

```tsx
// src/components/SignupForm.tsx
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupValues } from "../schemas/signup";

export const SignupForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit: SubmitHandler<SignupValues> = (data) => {
    console.log("Signup OK:", data);
  };

  // TODO: render three inputs (email, password, confirmPassword) with
  //       per-field error <p> blocks, plus a submit button.
  return <form onSubmit={handleSubmit(onSubmit)} noValidate>{/* build me */}</form>;
};
```

### 🛠️ Bài tập 2: Trình tạo team với một field array đã được validate

Xây dựng một form "create team": một tên team cùng một danh sách thành viên động, mỗi thành viên có một tên và một role chọn từ một enum.

**Nhiệm vụ:**
1. Tạo `schemas/team.ts`. Định nghĩa `memberSchema = z.object({ name: z.string().trim().min(1, ...), role: z.enum(["owner", "admin", "member"]) })`.
2. Định nghĩa `teamSchema = z.object({ teamName: z.string().trim().min(2, ...), members: z.array(memberSchema).min(1, "Add at least one member").max(10, "Max 10 members") })`.
3. Trong component, gọi `useFieldArray({ control, name: "members" })` và render một dòng cho mỗi `field`, dùng key là `field.id`.
4. Register các field lồng nhau bằng template path: `register(\`members.${index}.name\`)` và `register(\`members.${index}.role\`)`.
5. Thêm các nút **Add member** (`append({ name: "", role: "member" })`) và **Remove** (`remove(index)`, bị disable khi chỉ còn một dòng).
6. Hiển thị lỗi theo từng dòng tại `errors.members?.[index]?.name` và lỗi ở cấp mảng tại `errors.members?.root`.

**Code khởi đầu:**

```tsx
// src/schemas/team.ts
import { z } from "zod";

const memberSchema = z.object({
  name: z.string().trim().min(1, "Member name is required"),
  role: z.enum(["owner", "admin", "member"], { message: "Pick a role" }),
});

export const teamSchema = z.object({
  teamName: z.string().trim().min(2, "Team name is too short"),
  members: z
    .array(memberSchema)
    .min(1, "Add at least one member")
    .max(10, "A team can have at most 10 members"),
});

export type TeamValues = z.infer<typeof teamSchema>;
```

```tsx
// src/components/TeamForm.tsx
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchema, type TeamValues } from "../schemas/team";

export const TeamForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { teamName: "", members: [{ name: "", role: "member" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  const onSubmit: SubmitHandler<TeamValues> = (data) => console.log("Team:", data);

  // TODO: render teamName input + its error, then fields.map(...) rows keyed by
  //       field.id with name input, role <select>, and Remove button. Add the
  //       "Add member" button and the errors.members?.root display.
  return <form onSubmit={handleSubmit(onSubmit)} noValidate>{/* build me */}</form>;
};
```

Khi cả hai bài tập chỉ submit với dữ liệu hợp lệ — và nếu không thì hiển thị các thông báo chính xác theo từng field — bạn đã làm chủ validation schema-first: một cuốn sổ quy tắc điều khiển cả các kiểu lẫn các kiểm tra runtime của bạn, sẵn sàng để được dùng chung suốt đường tới backend của bạn.
