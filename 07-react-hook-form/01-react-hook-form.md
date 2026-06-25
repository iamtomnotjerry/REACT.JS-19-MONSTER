# Advanced Form Management with React Hook Form 📝

Forms are crucial for user interaction, but managing form state in React can quickly become complex. Standard controlled forms (using `useState` on every input) cause the entire component to re-render on every keystroke, leading to laggy performance on complex pages.

**React Hook Form** solves this by leveraging **uncontrolled inputs** via refs, triggering re-renders only when validation status changes.

In this lesson, we will cover the **core mechanics** of React Hook Form — registering inputs, declaring inline validation rules, handling submissions, and displaying error messages — and then explore optional **schema-based validation with Zod**.

---

## 📚 Concept & Overview

React Hook Form gives you a single hook, `useForm`, that returns the tools you need to wire up a form. The three pieces you will use in almost every form are:

- **`register`** — connects an `<input>` to the form. You spread its return value onto the input (`{...register("name")}`). The second argument is where you declare **inline validation rules**.
- **`handleSubmit`** — wraps your own submit callback. It runs validation first, and only calls your function with the collected `data` if every rule passes.
- **`formState.errors`** — an object containing one entry per field that failed validation, each holding the `message` you defined in your rules.

> [!NOTE]
> The library is called **React Hook Form** precisely because all of this "magic" — validation, submission handling, and error tracking — flows out of a single hook. Destructure exactly what you need: `const { register, handleSubmit, formState: { errors } } = useForm();`

> [!TIP]
> **Validation modes** control *when* validation runs. By default React Hook Form validates on submit. Pass a `mode` to `useForm` to change this:
> - `mode: "onSubmit"` — (default) validate only when the form is submitted.
> - `mode: "onChange"` — validate on every keystroke (instant feedback, more re-renders).
> - `mode: "onBlur"` — validate when the user clicks away from a field.
> - `mode: "onTouched"` — validate on the first blur, then on every change after.
>
> Example: `useForm({ mode: "onBlur" })`.

> [!WARNING]
> Do **not** add your own `onChange` handler that overrides the one `register` provides. Spreading `{...register("name")}` attaches the library's `onChange`, `onBlur`, `name`, and `ref`. If you replace `onChange`, React Hook Form stops tracking that field. If you need the live value, use the `watch` utility instead.

---

## ⚡ Why React Hook Form Is Fast: Controlled vs Uncontrolled

Before diving deeper, let's understand why React Hook Form performs so well.

**Real-world metaphor:** Imagine a restaurant. A **controlled form** is like a waiter who runs back to the kitchen to report *every single word* a customer says while ordering ("They said 'I'…", "They said 'I would'…", "They said 'I would like'…"). Exhausting and slow. An **uncontrolled form** (React Hook Form) is like a waiter who simply lets the customer finish writing their order on a notepad (the DOM), and only walks to the kitchen **once** — when the order is complete (submit) or when something is clearly wrong (a validation error). Far fewer trips, far less work.

| Feature | Controlled Forms (`useState`) | React Hook Form (Uncontrolled) |
| :--- | :--- | :--- |
| **State Storage** | React Component State | DOM nodes (accessed via Refs) |
| **Re-renders** | On every single keypress | Only on validation errors or form submit |
| **Performance** | Degrading on large/dynamic forms | Extremely fast (isolated rendering) |
| **Integration** | Manual state updates (`onChange`) | Automatic `register` registration hook |

```text
Controlled form (useState):
  keystroke ─▶ setState ─▶ re-render whole component ─▶ ... (every key)

React Hook Form (uncontrolled):
  keystroke ─▶ value stored on DOM ref (no re-render)
  submit / error ─▶ single re-render
```

---

## 🧩 The Core Workflow (Transcript-Faithful)

This is the exact flow taught in the course. We build a form step by step using **inline validation rules** — no extra libraries required.

### Step 1: Install React Hook Form
```bash
npm install react-hook-form
```

### Step 2: Set up the hook

Create a `components/Form.tsx` component. Pull `register`, `handleSubmit`, and `errors` out of `useForm`. Define a TypeScript interface describing your form data and pass it to `useForm<FormData>()` so everything is fully typed.

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

### Step 3: Register inputs and declare inline validation rules

The **second argument** to `register` is an object of validation rules. The course uses all four of the most common rules: `required`, `minLength`, `maxLength`, and `pattern`. Each rule can be a plain value, or an object `{ value, message }` so you can attach a custom error message.

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

When you hit **Submit** with empty fields, React Hook Form blocks the call to `onSubmit` and populates `errors`, so each `<p style={{ color: "red" }}>` appears with its message. Fix the inputs and the matching error disappears automatically.

### Step 4 (Optional): Disable the button while submitting

`formState` also exposes `isSubmitting` — a boolean that is `true` while an async `onSubmit` is pending. This is perfect for disabling the button and showing a loading label so users can't double-submit.

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
> Reusing the same pattern, you can build large forms (first name, last name, email, city, state, ZIP code, country, etc.) — every field is just another `register(...)` call with its own rules and its own `errors.<field>.message` display block. The mechanics never change, no matter how many fields you add.

---

## ⚡ Advanced (Optional): Schema Validation with Zod

> This section is **optional**. The inline `register` rules above are everything you need for most forms. Reach for Zod when you want a single, reusable, TypeScript-first source of truth for validation — especially on larger enterprise forms.

While basic inline validations work well for simple forms, larger React apps often benefit from a **unified schema**. **Zod** is a TypeScript-first schema declaration and validation library. Instead of scattering rules across every `register` call, you declare one schema and let it drive both runtime validation and your TypeScript types.

### Step 1: Install Zod and the Resolver
```bash
npm install zod @hookform/resolvers
```

### Step 2: Implementation (TypeScript)
We define our validation rules outside the component, then pass the validation resolver to `useForm`:

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
> Combining Zod with React Hook Form means you get **compile-time TypeScript safety** and **runtime validation** working hand-in-hand automatically, reducing form bugs. Note how the inputs no longer carry inline rules — the schema is the single source of truth.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. What does the `register` function do in React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `register` function attaches an input element to the library's internal state. It returns an object containing ref handlers and events (`onChange`, `onBlur`, `name`, `ref`). By using the ES6 spread operator (`{...register("name")}`), you apply these attributes directly to the input element. Its **second argument** is an object of inline validation rules such as `required`, `minLength`, `maxLength`, and `pattern`.
</details>

### 2. How does React Hook Form trigger validations?
<details>
  <summary><b>Reveal Answer</b></summary>

  By default, validation is triggered when the user submits the form (`onSubmit`). You can change this behavior by passing a `mode` option to `useForm`. Available modes are `onChange` (validates on every keystroke), `onBlur` (validates when user clicks away), or `onTouched` (validates on the first blur event, then on every change). `handleSubmit(onSubmit)` only calls your `onSubmit` callback once every rule passes.
</details>

### 3. What is the benefit of using `zod.refine()` in Zod schemas?
<details>
  <summary><b>Reveal Answer</b></summary>

  `refine()` allows you to declare **custom validation logic** that involves checking values across multiple form fields. A common example is verifying that a password matches a password confirmation field, or checking that an end date falls after a start date.
</details>

### 4. Why should you avoid using the `onChange` event handlers on inputs registered with React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Directly overriding `onChange` on the DOM node blocks React Hook Form's internal handler, preventing it from registering keypresses and updating validation errors. If you need to intercept values, pass a custom change handler inside the register options or use the `watch` utility provided by `useForm`.
</details>

### 5. What does the `isSubmitting` boolean state tell us?
<details>
  <summary><b>Reveal Answer</b></summary>

  `isSubmitting` is a state managed inside `formState`. It automatically turns `true` when your `handleSubmit` callback returns a Promise that is pending, and switches back to `false` when the Promise resolves or rejects. It is ideal for disabling submit buttons and showing loading indicators (e.g. `disabled={isSubmitting}` and a `"Loading..."` label).
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Build a Registration Form with Inline Rules (Core)
1. Create a `Form.tsx` component and define a `FormData` interface with `name`, `email`, and `password` (all `string`).
2. Call `useForm<FormData>()` and destructure `register`, `handleSubmit`, and `formState: { errors }`.
3. Type your submit callback with `SubmitHandler<FormData>` and `console.log` the `data`.
4. Register three inputs using **inline rules**:
   - `name`: `required` + `minLength` of 3 + `maxLength` of 20.
   - `email`: `required` + a `pattern` regex with the message `"Invalid email address"`.
   - `password`: `required` + `minLength` of 8.
5. Below each input, render `errors.<field>?.message` in red, and add a `<button type="submit">`.
6. Submit with empty fields and confirm each error message appears; then fix the inputs and watch the errors clear one by one.

### 🛠️ Exercise 2: Address Details Validation Schema (Advanced — Zod)
1. Create a Zod schema containing the following fields:
   - `street`: Required string.
   - `zipCode`: Must contain exactly 5 digits (hint: use a regex via `z.string().regex(...)`).
   - `country`: Must be selected from a list of options: `'US'`, `'CA'`, or `'UK'` (hint: `z.enum([...])`).
2. Bind this schema to a React Hook Form component using `zodResolver` and verify the validation rules block incorrect inputs.

### 🛠️ Exercise 3: Password Complexity Checker (Stretch)
1. Add a password complexity rule to the Zod schema: it must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.
2. Render feedback messages dynamically below the password input field as the user types (hint: use RHF's `watch("password")` to check the current value live).
