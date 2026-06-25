# Advanced Form Management with React Hook Form 📝

Forms are crucial for user interaction, but managing form state in React can quickly become complex. Standard controlled forms (using `useState` on every input) cause the entire component to re-render on every keystroke, leading to laggy performance on complex pages. 

**React Hook Form** solves this by leveraging **uncontrolled inputs** via refs, triggering re-renders only when validation status changes.

In this lesson, we will cover the core mechanics of React Hook Form and how to implement schema-based validation with **Zod**.

---

## ⚡ 1. Controlled vs Uncontrolled Forms

Before diving into code, let's understand why React Hook Form is so fast:

| Feature | Controlled Forms (`useState`) | React Hook Form (Uncontrolled) |
| :--- | :--- | :--- |
| **State Storage** | React Component State | DOM nodes (accessed via Refs) |
| **Re-renders** | On every single keypress | Only on validation errors or form submit |
| **Performance** | Degrading on large/dynamic forms | Extremely fast (isolated rendering) |
| **Integration** | Manual state updates (`onChange`) | Automatic register registration hook |

---

## ⚡ 2. Basic Setup and Input Registration

The core hook of React Hook Form is `useForm`. It provides methods to register DOM inputs, handle submissions, and track errors.

### Step 1: Install React Hook Form
```bash
npm install react-hook-form
```

### Step 2: Implementation

Here is how you register basic form fields and capture validation errors:

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

## 🛡️ 3. Schema Validation with Zod

While basic inline validations work well for simple forms, enterprise React apps require unified schemas. **Zod** is a TypeScript-first schema declaration and validation library.

### Step 1: Install Zod and the Resolver
```bash
npm install zod @hookform/resolvers
```

### Step 2: Implementation (TypeScript)
We define our validation rules outside the component, then pass the validation resolver to `useForm`:

```tsx
// src/components/RegisterForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// 1. Define the validation schema using Zod
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"] // Mark error on confirmPassword field
});

// 2. Infer TypeScript types from the Zod Schema
type RegisterInput = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) // Attach Zod schema
  });

  const onSubmit = async (data: RegisterInput) => {
    // Simulate network delay
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
> Combining Zod with React Hook Form means you get **compile-time TypeScript safety** and **runtime validation** working hand-in-hand automatically, reducing form bugs.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding. Click **Reveal Answer** to verify.

### 1. What does the `register` function do in React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `register` function attaches an input element to the library's internal state. It returns an object containing ref handlers and events (`onChange`, `onBlur`, `name`, `ref`). By using the ES6 spread operator (`{...register("name")}`), you apply these attributes directly to the input element.
</details>

### 2. How does React Hook Form trigger validations?
<details>
  <summary><b>Reveal Answer</b></summary>

  By default, validation is triggered when the user submits the form (`onSubmit`). You can change this behavior by passing a `mode` option to `useForm`. Available modes are `onChange` (validates on every keystroke), `onBlur` (validates when user clicks away), or `onTouched` (validates on the first blur event, then on every change).
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

  `isSubmitting` is a state managed inside `formState`. It automatically turns `true` when your `handleSubmit` callback returns a Promise that is pending, and switches back to `false` when the Promise resolves or rejects. It is ideal for disabling submit buttons and showing loading indicators.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Address Details Validation Schema
1. Create a Zod schema containing the following fields:
   - `street`: Required string.
   - `zipCode`: Must contain exactly 5 digits (hint: use regex checking).
   - `country`: Must be selected from a list of options: `'US'`, `'CA'`, or `'UK'`.
2. Bind this schema to a React Hook Form component and verify validation rules block incorrect inputs.

### 🛠️ Exercise 2: Password Complexity Checker
1. Add a password complexity rule to the Zod schema: it must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number.
2. Render feedback messages dynamically below the password input field as the user types (hint: use RHF's `watch("password")` to check the current value live).
