# RHF + Zod: Schema Validation & Nested Forms 🛡️

In the previous lesson you wired up React Hook Form with **inline rules** — `required`, `minLength`, `pattern`, and friends, each declared field-by-field inside `register(...)`. That works, but as a form grows, the validation logic gets scattered across dozens of `register` calls, your `FormData` interface and your rules drift apart, and there is no single artifact you can reuse on the server. This lesson fixes all of that with **Zod**.

**Zod** is a TypeScript-first schema declaration and validation library. You declare the *shape and rules* of your data **once**, in one object, and then: (1) derive your form's TypeScript type from it for free, (2) hand it to React Hook Form via the `zodResolver` so it drives runtime validation, and optionally (3) reuse the exact same schema on your backend. This is the **schema-first** approach, and it is the modern standard for serious forms. We will cover primitives, cross-field validation with `.refine`/`.superRefine`, nested object schemas, and dynamic field arrays with `useFieldArray`.

> [!NOTE]
> **Beyond the recorded course.** The 50+ hour transcript teaches React Hook Form with **inline `register` rules**; it does not cover Zod, resolvers, `useFieldArray`, or schema composition. Everything in this lesson is **net-new, modern best practice** that builds directly on top of the RHF mechanics you already learned. The `register` / `handleSubmit` / `formState` API is identical — we are only swapping *where validation comes from*.

---

## 📚 Concept & Overview

With inline rules, validation lives **inside the JSX**, tangled with markup. With Zod, validation lives in **one plain object** that has nothing to do with React. React Hook Form connects to it through a thin adapter called a **resolver**.

The flow is always the same three moves:

1. **Define** a schema with `z.object({ ... })`.
2. **Infer** the form type with `type FormValues = z.infer<typeof schema>` — no hand-written interface.
3. **Wire** it: `useForm<FormValues>({ resolver: zodResolver(schema) })`.

After that, every input is just `{...register("field")}` with **zero inline rules** — the schema is the single source of truth.

### 🧩 Real-world metaphor: the airport security checkpoint

Think of inline `register` rules as asking **each passenger's individual friend** to vouch for them at the gate — the rules are spread out, inconsistent, and nobody has the full picture. Zod is the **central security checkpoint with one published rulebook**: every passenger (field) passes through the *same* documented set of checks, the rulebook is printed once and posted on the wall (your schema file), and the airline's *website* (your TypeScript types) is generated from that exact same rulebook so it can never claim a rule the checkpoint doesn't enforce. One rulebook, enforced at runtime, mirrored in your types.

### Inline rules vs. Zod schema

| Aspect | Inline `register` rules | Zod schema + `zodResolver` |
| :--- | :--- | :--- |
| **Source of truth** | Scattered across every `register` call | One `z.object` in one place |
| **TypeScript type** | Hand-written `interface` (can drift) | Derived via `z.infer` (always in sync) |
| **Cross-field rules** | Awkward (`validate` callbacks reading other fields) | First-class `.refine` / `.superRefine` |
| **Reuse on backend** | Not possible (tied to RHF + JSX) | Same schema validates API payloads |
| **Nested / array data** | Verbose, manual | `z.object` nesting + `z.array` |
| **Transforms (trim, coerce)** | Not supported | `.trim()`, `.transform()`, `z.coerce.*` |

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
> Keep schemas in their own file (e.g. `schemas/registration.ts`) and export both the schema **and** its inferred type. Your form imports the type for `useForm<...>`, and your API route imports the schema to `parse()` the request body. One file, validated on both ends of the wire.

---

## ⚡ 1. Setup: Install Zod and the Resolver

Two packages: `zod` itself, and `@hookform/resolvers`, the official bridge that lets RHF understand Zod (and Yup, Valibot, etc.).

```bash
npm install zod @hookform/resolvers
```

> [!NOTE]
> This lesson targets **Zod 3.23+** (the current line) and **React Hook Form 7**. In Zod 3 the import is `import { z } from "zod"`. The resolver import path is `@hookform/resolvers/zod`. These are stable, production APIs.

---

## 🛠️ 2. Your First Schema: Primitives, `.min`, `.max`, `.email`, `.regex`

Let's rebuild the registration form from Lesson 1 the schema-first way. We declare the schema, infer the type, and attach the resolver. Notice the inputs carry **no inline rules** at all.

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

Now the component. It is the same RHF API you already know — the only new line is the `resolver`.

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
> An `<input type="number">` still hands JavaScript a **string** ("18", not `18`). If your schema declares `age: z.number()` without coercion, validation fails with *"Expected number, received string."* Fix it with **either** `z.coerce.number()` in the schema **or** `register("age", { valueAsNumber: true })` on the input. Using `z.coerce.*` is the more portable choice because the same schema then also works for JSON API payloads where the value might arrive as a string.

---

## ⚡ 3. Cross-Field Validation: `.refine` and `.superRefine`

Some rules can't live on a single field — "confirm password must equal password" depends on **two** fields at once. Zod handles this at the **object level** with `.refine` (one check) or `.superRefine` (many checks / fine-grained control).

### 🧩 `.refine` — one cross-field rule

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
> Always set `path` on a cross-field `.refine`. Without it, Zod attaches the error to the **form root** (`errors.root`), and your per-field `{errors.confirmPassword && ...}` block will never display it. The user sees the form silently refuse to submit with no visible reason.

### 🛠️ `.superRefine` — multiple conditional checks

`.refine` returns a single pass/fail. When you need **several** issues, conditional rules, or different messages on different paths, use `.superRefine`, which gives you a `ctx` to push as many issues as you like.

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

| Method | Returns | Use when |
| :--- | :--- | :--- |
| `.refine(fn, opts)` | boolean (one issue) | Exactly one cross-field rule, one message |
| `.superRefine(fn)` | void (push many via `ctx.addIssue`) | Multiple/conditional rules, different paths |

---

## ⚡ 4. Nested Object Schemas

Real forms group related fields — an address, a billing block, a profile. Zod nests `z.object` inside `z.object`, and React Hook Form addresses nested fields with **dotted paths** in `register`.

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
> Nested errors are accessed with the **same dotted shape**, but in JavaScript that means optional chaining: `errors.address?.zip?.message`. The `?.` matters — `errors.address` is `undefined` until that sub-object has at least one error.

---

## 🧩 5. Dynamic Field Arrays: `useFieldArray` + `z.array`

The hardest forms are **dynamic**: an invoice with N line items, a team with N members, a recipe with N ingredients. React Hook Form's `useFieldArray` manages the add/remove/reorder mechanics, and `z.array(...)` describes and validates the collection.

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
> The single most common `useFieldArray` bug is using the array **index** as the React `key`. When you remove or reorder rows, indices shift, React reuses the wrong DOM nodes, and inputs show stale values. Always use the stable `field.id` that `useFieldArray` generates: `key={field.id}`.

> [!TIP]
> Distinguish the two error locations. A bad **individual** field is `errors.items?.[index]?.quantity`. A violation of the **whole array** rule (`.min(1)` / `.max(20)`) lives at `errors.items?.root`. Render both so users see "this row is wrong" *and* "you need at least one row."

---

## ⚡ 6. Why Schema-First Beats Scattered Inline Rules

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

- **Single source of truth.** Add a field once, in the schema; the type and the runtime rules both update. No more "I updated the interface but forgot the validation rule."
- **Shareable FE/BE types.** Put the schema in a shared package. The form imports its inferred type; the API route calls `schema.parse(req.body)`. Frontend and backend enforce *literally the same rules*, eliminating the classic "the UI allowed it but the server rejected it" drift.
- **Composability.** Sub-schemas (`addressSchema`, `lineItemSchema`) nest and reuse. You build big forms out of small validated pieces.
- **Transforms and coercion.** `.trim()`, `.toLowerCase()`, `z.coerce.number()`, `.transform()` clean and convert data *as part of validation*, so your `onSubmit` receives a normalized, correctly-typed payload — not raw input strings.

> [!NOTE]
> Schema reuse on the backend is the headline win. Define `registrationSchema` in `packages/shared`, import the inferred type in your React form, and in your Express/Next route do `const data = registrationSchema.parse(req.body)`. If validation passes, `data` is fully typed *and* trusted. One rulebook, two ends of the wire.

---

## 🧠 Test Your Knowledge

### 1. What are the three steps to connect a Zod schema to React Hook Form?
<details>
  <summary><b>Reveal Answer</b></summary>

  (1) **Define** the schema with `z.object({ ... })` and its field rules. (2) **Infer** the form's TypeScript type with `type FormValues = z.infer<typeof schema>` — no hand-written interface. (3) **Wire** it into the hook with `useForm<FormValues>({ resolver: zodResolver(schema) })`, importing `zodResolver` from `@hookform/resolvers/zod`. After that, inputs are registered with plain `{...register("field")}` and carry no inline rules — the schema is the single source of truth for both runtime validation and types.
</details>

### 2. Why does a cross-field `.refine` need a `path`, and what happens if you omit it?
<details>
  <summary><b>Reveal Answer</b></summary>

  A `.refine` (or `.superRefine` issue) runs at the **object level**, so Zod doesn't know which field to blame. The `path` option (e.g. `path: ["confirmPassword"]`) tells Zod to attach the error to a specific field, so React Hook Form surfaces it as `errors.confirmPassword.message`. If you omit `path`, the error attaches to the **form root** (`errors.root`), and any per-field display block like `{errors.confirmPassword && ...}` will never render it — the form silently refuses to submit with no visible message.
</details>

### 3. When should you reach for `.superRefine` instead of `.refine`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Use `.refine` for a **single** cross-field rule with one boolean result and one message. Use `.superRefine((data, ctx) => ...)` when you need to push **multiple** issues, apply **conditional** rules, or target **different paths** with different messages from one validation pass. `.superRefine` gives you a `ctx` object and you call `ctx.addIssue({ code: z.ZodIssueCode.custom, message, path })` as many times as needed (e.g. "end after start", "long stays need a promo code", "max 8 guests" — three issues on three different paths).
</details>

### 4. Why must you use `field.id` (not the array index) as the React key in a `useFieldArray` list?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useFieldArray` returns a `fields` array where each entry has a stable, library-generated `id`. If you key rows by **index**, then removing or reordering a row shifts every subsequent index; React's reconciler matches old and new elements by key, so it reuses the wrong DOM nodes and inputs display stale values from a different row. Keying by the stable `field.id` keeps each row's identity fixed across add/remove/reorder operations, so the right input keeps the right value.
</details>

### 5. An `<input type="number">` field fails validation with "Expected number, received string." Why, and what are the two fixes?
<details>
  <summary><b>Reveal Answer</b></summary>

  DOM inputs always produce **strings** — a number input gives `"18"`, not `18` — so a schema declaring `z.number()` rejects it. **Fix A (schema side):** use `z.coerce.number()`, which converts the value before validating; this is preferred because the same schema then also works for JSON API payloads. **Fix B (form side):** pass `register("age", { valueAsNumber: true })` so RHF stores a numeric value. Using `z.coerce.*` keeps the schema portable across frontend and backend; combining both is harmless and keeps RHF's internal value numeric too.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Signup form with password confirmation (cross-field)

Build a complete signup form whose validation lives entirely in a Zod schema.

**Tasks:**
1. Create `schemas/signup.ts` exporting a `signupSchema` with `email` (valid email, trimmed), `password` (min 8, must contain an uppercase letter and a digit via `.regex`), and `confirmPassword` (string).
2. Add a `.refine` that checks `password === confirmPassword`, with `message: "Passwords do not match"` and `path: ["confirmPassword"]`.
3. Export `type SignupValues = z.infer<typeof signupSchema>`.
4. Build the form with `useForm<SignupValues>({ resolver: zodResolver(signupSchema), mode: "onTouched" })`, three registered inputs, and per-field error displays.
5. Verify: submitting mismatched passwords shows the error under the confirm field; matching them clears it.

**Starter:**

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

### 🛠️ Exercise 2: Team builder with a validated field array

Build a "create team" form: a team name plus a dynamic list of members, each with a name and a role chosen from an enum.

**Tasks:**
1. Create `schemas/team.ts`. Define `memberSchema = z.object({ name: z.string().trim().min(1, ...), role: z.enum(["owner", "admin", "member"]) })`.
2. Define `teamSchema = z.object({ teamName: z.string().trim().min(2, ...), members: z.array(memberSchema).min(1, "Add at least one member").max(10, "Max 10 members") })`.
3. In the component, call `useFieldArray({ control, name: "members" })` and render a row per `field`, keyed by `field.id`.
4. Register nested fields with template paths: `register(\`members.${index}.name\`)` and `register(\`members.${index}.role\`)`.
5. Add **Add member** (`append({ name: "", role: "member" })`) and **Remove** (`remove(index)`, disabled when one row remains) buttons.
6. Display per-row errors at `errors.members?.[index]?.name` and the array-level error at `errors.members?.root`.

**Starter:**

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

When both exercises submit only with valid data — and show precise, per-field messages otherwise — you have mastered schema-first validation: one rulebook driving your types and your runtime checks, ready to be shared all the way to your backend.
