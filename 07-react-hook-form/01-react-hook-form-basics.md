# React Hook Form: Fundamentals 📝

Forms are everywhere — sign-ups, logins, checkouts, settings panels — and they are deceptively hard to get right. The naive React approach wires a piece of `useState` to every input, which means **the whole component re-renders on every single keystroke**. On a five-field form that is annoying; on a thirty-field enterprise form it is genuinely laggy.

**React Hook Form** (RHF) fixes this by treating your inputs as **uncontrolled** by default: it reads values straight from the DOM through refs and only re-renders when something the UI actually cares about changes — a validation error appearing, or the form being submitted. In this lesson you will learn the transcript-faithful core: installing the library, calling `useForm<FormValues>()`, registering fields with **inline validation rules**, handling submission with a typed `SubmitHandler`, and rendering error messages. We will also introduce the everyday utilities `reset`, `watch`, `setValue`, and `getValues`, and explain *why* the uncontrolled model is so fast.

> [!NOTE]
> Schema validation with **Zod** (`zodResolver`) is **net-new and intentionally out of scope here** — it lives in lesson `02`. This lesson stays faithful to what the course records: **inline validation rules only** (`required`, `minLength`, `maxLength`, `min`, `max`, `pattern`). The `reset` / `watch` / `setValue` / `getValues` / `defaultValues` utilities below go slightly beyond the recorded transcript; they are flagged where they appear and reflect current best practice.

---

## 📚 Concept & Overview

`useForm` is a single hook that hands you everything needed to run a form. The library is even *named* after this idea — all the "magic" (validation, submission, error tracking) flows out of one hook. You destructure exactly what you need:

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

**Real-world metaphor — the smart notepad.** Picture a waiter taking an order. A **controlled form** is a waiter who sprints to the kitchen after *every word* the customer says: "They said 'I'…", "They said 'I'd'…", "They said 'I'd like'…". Frantic and slow. **React Hook Form** is a waiter who hands the customer a notepad (the DOM), lets them write the whole order undisturbed, and walks to the kitchen **once** — when the order is finished (submit) or when something is obviously wrong (a validation error). The notepad *is* the source of truth; the waiter only gets involved at the moments that matter.

The three pieces you will touch in almost every form:

- **`register(name, rules)`** — connects an `<input>` to the form. You spread its return value onto the element (`{...register("email")}`), which attaches `name`, `ref`, `onChange`, and `onBlur`. The optional second argument is where inline **validation rules** live.
- **`handleSubmit(onSubmit)`** — wraps *your* submit callback. It runs validation first and only calls your function — with the collected, typed `data` — if every rule passes.
- **`formState.errors`** — an object with one entry per field that failed validation, each carrying the `message` you defined. You render `errors.email?.message`.

> [!NOTE]
> Why the generic `useForm<FormValues>()` matters: passing your type parameter makes `register("email")` reject typos (only real field names are allowed), types the `data` argument in your submit handler, and gives `errors` the exact shape of your form. Skip the generic and you lose all of that safety.

> [!TIP]
> **Validation modes** control *when* validation runs. By default RHF validates on submit. Pass `mode` to change it:
> - `mode: "onSubmit"` — (default) validate only on submit.
> - `mode: "onChange"` — validate on every keystroke (instant feedback, more re-renders).
> - `mode: "onBlur"` — validate when the user leaves a field.
> - `mode: "onTouched"` — validate on first blur, then on every change after.
>
> Example: `useForm<FormValues>({ mode: "onBlur" })`.

---

## ⚡ Why It's Fast: Controlled vs Uncontrolled

This is the single most important mental model in the library. A **controlled** input stores its value in React state, so every keypress calls `setState`, which re-renders the component. An **uncontrolled** input lets the DOM hold the value; React reads it via a `ref` only when needed. React Hook Form is uncontrolled by default, which is why it stays fast even on huge forms.

| Aspect | Controlled (`useState`) | React Hook Form (uncontrolled) |
| :--- | :--- | :--- |
| **Value storage** | React component state | DOM node, read via `ref` |
| **Re-renders** | Every keystroke | Only on errors / submit / subscribed `watch` |
| **Wiring** | Manual `value` + `onChange` per field | One spread: `{...register("name")}` |
| **Performance on big forms** | Degrades noticeably | Stays fast (isolated, ref-based) |
| **Best when** | A few fields needing live derived UI | Most forms, especially large ones |

```text
Controlled form (useState):
  keystroke ─▶ setState ─▶ re-render WHOLE component ─▶ ...repeat every key

React Hook Form (uncontrolled):
  keystroke ─▶ value written to DOM ref (NO re-render)
  submit / validation error / watch ─▶ a single, targeted re-render
```

> [!WARNING]
> Do **not** put your own `onChange` on a registered input that *replaces* the one `register` supplies. Spreading `{...register("name")}` attaches RHF's `name`, `ref`, `onChange`, and `onBlur`. If you overwrite `onChange`, React Hook Form stops tracking that field and validation silently breaks. If you need the live value, use `watch("name")`; if you need to set it, use `setValue("name", ...)`.

---

## 🛠️ Step 1: Install and Scaffold

The course scaffolds a Vite + React + TypeScript project and installs the library:

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

## 🧩 Step 2: Set Up the Hook

Create `src/components/Form.tsx`. Describe your form's shape with a TypeScript interface and pass it to `useForm<FormValues>()` so everything downstream is fully typed.

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
> `import { type SubmitHandler }` uses an inline *type-only* import. It is purely a type, so importing it this way tells the bundler it can be erased at compile time — a small but correct habit in modern TypeScript projects.

---

## 🧩 Step 3: Register Inputs and Declare Inline Rules

The **second argument** to `register` is an object of validation rules. Each rule is either a plain value (`required: true`) or — far more useful — an object `{ value, message }` so you can attach a custom error message. Here is the complete, runnable form the course builds, expanded to show every common rule.

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

What happens when you click **Submit** with empty fields: React Hook Form blocks the call to `onSubmit`, populates `errors`, and each red `<p>` appears with its message. Fix an input and the matching error clears automatically. Because every field is just another `register(...)` call with its own rules and its own `errors.<field>.message` block, scaling to a thirty-field form (first name, last name, city, state, ZIP, country…) is pure repetition — the mechanics never change.

Here is the full inline-rules reference taught in the course, plus `min`/`max` for numeric inputs:

| Rule | Applies to | Shorthand | With custom message |
| :--- | :--- | :--- | :--- |
| `required` | any field | `required: true` | `required: "Name is required"` |
| `minLength` | strings | `minLength: 3` | `minLength: { value: 3, message: "..." }` |
| `maxLength` | strings | `maxLength: 20` | `maxLength: { value: 20, message: "..." }` |
| `min` | numbers / dates | `min: 18` | `min: { value: 18, message: "..." }` |
| `max` | numbers / dates | `max: 120` | `max: { value: 120, message: "..." }` |
| `pattern` | strings | `pattern: /regex/` | `pattern: { value: /regex/, message: "..." }` |
| `validate` | any | — | `validate: (v) => v !== "" || "Custom error"` |

> [!NOTE]
> The `<form noValidate>` attribute turns off the browser's *native* HTML validation popups so React Hook Form's messages are the only ones the user sees. Without it, the browser's "Please fill out this field" bubble can fire first and hide your styled errors. (This is a best-practice addition beyond the recorded transcript.)

---

## ⚡ The `isSubmitting` Flag

`formState.isSubmitting` is a boolean that is `true` while an **async** `onSubmit` is pending and flips back to `false` when it settles. It is perfect for disabling the button and showing a loading label so users cannot double-submit — exactly what we wired into the button above.

```tsx
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? "Loading..." : "Submit"}
</button>
```

In the recorded demo the request resolves instantly, so the loading state flickers by too fast to see. In production — where the network actually takes time — the disabled "Loading..." state is clearly visible and prevents duplicate requests.

---

## 🧩 Step 4: `defaultValues`, `reset`, `watch`, `setValue`, `getValues`

These utilities round out everyday form work. They go slightly beyond the recorded transcript, but you will reach for them constantly in real apps.

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

The key distinction between the two read utilities:

| Utility | Re-renders on change? | Use it for |
| :--- | :--- | :--- |
| `watch("field")` | **Yes** — subscribes | Live UI: counters, conditional fields, previews |
| `getValues()` | **No** — one-time read | Snapshots inside event handlers / submit logic |

> [!WARNING]
> Reaching for `watch` everywhere reintroduces the very re-render cost RHF was designed to avoid — each `watch`ed field re-renders the component on change. Only `watch` what the UI must react to live. For a plain snapshot inside a handler, use `getValues()`, which never triggers a render.

---

## 🧠 Test Your Knowledge

### 1. What does `register` return, and how do you apply it to an input?
<details>
  <summary><b>Reveal Answer</b></summary>

  `register(name, rules)` returns an object of props — `name`, `ref`, `onChange`, and `onBlur` — that wires the input into React Hook Form's internal (ref-based) state. You apply it by spreading: `{...register("email")}`. The optional second argument is the inline validation rules object (`required`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `validate`). Because the inputs are uncontrolled, RHF reads their values from the DOM via the `ref` rather than from React state.
</details>

### 2. Why is React Hook Form faster than a `useState`-per-field controlled form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Controlled inputs store their value in React state, so every keystroke calls `setState` and re-renders the whole component. RHF inputs are **uncontrolled**: the DOM holds the value and RHF reads it through a `ref`, so typing does **not** trigger re-renders. Re-renders happen only at meaningful moments — a validation error changing, the form submitting, or a `watch`ed field updating. On large forms this is the difference between smooth and laggy.
</details>

### 3. What is the role of `handleSubmit`, and how does `SubmitHandler<FormValues>` help?
<details>
  <summary><b>Reveal Answer</b></summary>

  `handleSubmit(onSubmit)` wraps your callback and is passed to the form's `onSubmit`. It runs all validation first and **only** invokes your `onSubmit` — with the collected, validated `data` — if every rule passes; otherwise it populates `formState.errors` and skips your callback. Typing your callback as `SubmitHandler<FormValues>` gives `data` the exact shape of your form, so `data.email`, `data.age`, etc. are known and checked at compile time.
</details>

### 4. What's the difference between `watch` and `getValues`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `watch("field")` **subscribes** to a field and re-renders the component whenever that field changes — use it for live derived UI such as a character counter or a conditionally shown field. `getValues()` performs a **one-time read** of current values and does **not** subscribe or cause a re-render — use it inside event handlers or submit logic when you just need a snapshot. Overusing `watch` reintroduces the re-render cost RHF exists to avoid.
</details>

### 5. What does `isSubmitting` tell you, and what is `defaultValues` for?
<details>
  <summary><b>Reveal Answer</b></summary>

  `formState.isSubmitting` is `true` while an **async** submit handler's Promise is pending and `false` once it settles — perfect for `disabled={isSubmitting}` and a "Loading..." label to prevent double submits. `defaultValues` (passed to `useForm`) seeds the form's initial values — essential when editing an existing record so fields start populated — and it also locks in each field's type. `reset()` returns the form to those `defaultValues` (or to an object you pass it), which is the standard move after a successful save.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Registration Form with Inline Rules (Core)

Rebuild the transcript form from scratch and confirm validation behaves correctly.

**Tasks:**
1. Create `Form.tsx` with a `FormValues` interface: `name: string`, `email: string`, `password: string`.
2. Call `useForm<FormValues>()` and destructure `register`, `handleSubmit`, and `formState: { errors, isSubmitting }`.
3. Type the submit callback with `SubmitHandler<FormValues>`; `await` a 1.5s fake delay, then `console.log(data)`.
4. Register three inputs with inline rules:
   - `name`: `required` + `minLength` 3 + `maxLength` 20.
   - `email`: `required` + a `pattern` regex with message `"Invalid email address"`.
   - `password`: `required` + `minLength` 8.
5. Render `errors.<field>?.message` in red beneath each input, and add `<button type="submit" disabled={isSubmitting}>`.
6. Submit empty to see every message appear; fix each field and watch errors clear one by one.

**Starter:**
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

### 🛠️ Exercise 2: Live Character Counter with `watch` + `reset` (Stretch)

Practise the utilities by adding live feedback and a working reset.

**Tasks:**
1. Add a `tweet: string` field validated with `maxLength: { value: 280, message: "Too long" }`.
2. Use `watch("tweet")` to render a live counter: `` `${tweet.length} / 280` ``, turning the text red once it exceeds 280.
3. Seed the form with `defaultValues: { tweet: "" }`.
4. After a successful submit, call `reset()` and confirm the field and counter clear.
5. Add a "Clear" button (`type="button"`) that calls `reset()` directly.

**Starter:**
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
