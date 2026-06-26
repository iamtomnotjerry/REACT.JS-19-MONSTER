# Lesson 3: Generics & Utility Types 📘

This lesson covers **Generics** (writing reusable functions, classes, and interfaces that work with multiple types while maintaining compile-time safety), TypeScript's built-in **Utility Types** for transforming data shapes, and **Type Narrowing** (refining a broad type down to a precise one inside conditional blocks).

---

## 🌐 Concept & Overview

Generics are TypeScript's answer to a simple problem: *how do I write one piece of logic that works with many types — without throwing away type safety?* The naive escape hatch is `any`, but `any` silently switches the compiler off. Generics keep the compiler fully engaged: they remember the exact type that flowed in, and they guarantee the exact type that flows out.

> **A real-world metaphor: the shipping box 📦**
>
> Think of a generic `Box<T>` like a cardboard shipping box. The box itself is always the *same* design — four walls, a lid, a label slot. But what goes *inside* changes: today it holds a phone, tomorrow a book, next week a pair of shoes. The box does not need to be redesigned for each item. The label (`<T>`) simply records *what kind of thing* is inside, so that when you open it later, you know exactly what to expect. `any` would be like a box with no label at all — you would have to guess the contents and hope you are right.

> [!NOTE]
> A generic type parameter (the `<T>` part) is a **type variable**. Just as a function parameter `(item)` is a placeholder for a *value*, `<T>` is a placeholder for a *type*. The convention is single uppercase letters — `T` (Type), `U` (a second type), `K` (Key), `V` (Value) — but you can spell out full names like `<TData>` when it aids readability.

> [!TIP]
> Reach for **generics** when the relationship between input and output types must be preserved (e.g. "this function returns the same type it received"). Reach for **utility types** (`Partial`, `Pick`, `Omit`…) when you need to derive a *new shape* from an *existing* type. Reach for **type narrowing** when a single variable could be one of several types at runtime and you must safely figure out which.

### `any` vs `unknown` vs Generics — the comparison

| Approach | Type safety | Knows the return type? | Autocomplete | When to use |
| :--- | :--- | :--- | :--- | :--- |
| **`any`** | ❌ None — checker is off | ❌ No | ❌ No | Almost never; migration escape hatch only. |
| **`unknown`** | ✅ Safe, but forces a check | ⚠️ Only after narrowing | ⚠️ After narrowing | When input is genuinely unknown and must be validated. |
| **Generics `<T>`** | ✅ Full | ✅ Yes — captures exact type | ✅ Yes | Reusable functions/classes/interfaces preserving type links. |

```text
              ┌─────────────────────────┐
   number ───▶│                         │───▶ number
   string ───▶│   identity<T>(x: T): T  │───▶ string
  boolean ───▶│                         │───▶ boolean
              └─────────────────────────┘
        the SAME function — the type rides along with the value
```

---

## ⚡ 1. TypeScript Generics

Generics act as type variables—meaning you can pass a type parameter (typically written as `<T>`) into a function or component just as you would pass an argument.

### A. Generic Functions
Instead of using `any` (which destroys type safety), generics preserve the exact type connection between inputs and outputs:

```typescript
// 1. A basic generic utility function
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const num = getFirstElement([10, 20, 30]); // TypeScript infers 'num' is type: number
const str = getFirstElement(["a", "b", "c"]); // TypeScript infers 'str' is type: string
```

You can also write a generic that returns *two* values whose types travel together:

```typescript
// A function that returns a tuple of [item, defaultValue], both of type T
function uniqueDataType<T>(item: T, defaultValue: T): [T, T] {
  return [item, defaultValue];
}

const numbers = uniqueDataType<number>(10, 20);   // inferred as [number, number]
const strings = uniqueDataType<string>("hello", "world"); // [string, string]
const bools = uniqueDataType<boolean>(true, false);       // [boolean, boolean]
```

> [!NOTE]
> You usually do **not** need to write the angle brackets at the call site (`uniqueDataType<number>(...)`). TypeScript *infers* `T` from the arguments you pass. Specify it explicitly only when inference cannot figure it out, or when you want to lock the type down deliberately.

### B. Generic Constraints (`extends`)
Sometimes you want a function to support multiple types, but only those that contain specific properties. We enforce this requirement using the **`extends`** keyword:

```typescript
interface HasId {
  id: number;
}

// Enforce that T must possess an 'id' property
function logItemDetails<T extends HasId>(item: T): void {
  console.log(`Item ID is: ${item.id}`);
}

logItemDetails({ id: 101, title: "Book" }); // Safe!
// logItemDetails({ title: "No ID" }); // Error: Property 'id' is missing.
```

### C. The `keyof` Constraint
You can constrain a generic parameter to match the property keys of another object:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const car = { brand: "Tesla", model: "Model 3", year: 2024 };
const brand = getProperty(car, "brand"); // Safe!
// const price = getProperty(car, "price"); // Error: Argument of type '"price"' is not assignable to 'brand' | 'model' | 'year'
```

### D. Multiple Type Parameters (`<T, U>`)
A generic function is not limited to a single type. When two inputs may have *different* types — and you want to keep both types precise — declare more than one type parameter. A classic example is a function that reverses the order of a pair:

```typescript
// 'reversePair' takes one value of type T and one of type U,
// then returns them swapped as a [U, T] tuple — both types preserved.
function reversePair<T, U>(value1: T, value2: U): [U, T] {
  return [value2, value1];
}

const reversed = reversePair("hello", 20);
// TypeScript infers the result as [number, string]
console.log(reversed); // [20, "hello"]
```

> [!TIP]
> Name your extra parameters by their role, not just by alphabet. `<TInput, TResult>` reads far better than `<T, U>` in a real codebase, and the IntelliSense hints become self-documenting.

### E. Generic Classes (`Box<T>`)
Generics shine in classes too. A **generic class** is parameterized by a type at the moment you create an instance, so the same class definition can safely hold a `string`, a `number`, or any other type — each instance remembering its own `T`:

```typescript
// A reusable container class. 'T' is decided per-instance.
class Box<T> {
  private content: T;

  constructor(initialContent: T) {
    this.content = initialContent;
  }

  // Returns the stored value with its precise type T
  getContent(): T {
    return this.content;
  }

  // Accepts only a value of the same type T
  setContent(newContent: T): void {
    this.content = newContent;
  }
}

// String box: T is locked to string
const stringBox = new Box<string>("hello typescript");
console.log(stringBox.getContent()); // "hello typescript"
stringBox.setContent("new content edited");
console.log(stringBox.getContent()); // "new content edited"

// Number box: T is locked to number
const numberBox = new Box<number>(20);
console.log(numberBox.getContent()); // 20
numberBox.setContent(100);
console.log(numberBox.getContent()); // 100
// numberBox.setContent("oops"); // Error: 'string' is not assignable to 'number'
```

Notice that `stringBox.setContent` will only accept strings and `numberBox.setContent` will only accept numbers — even though both came from the *same* `Box` class. That is the whole payoff of a generic class.

---

## ⚡ 2. Built-in Utility Types

TypeScript provides several global utility types that transform existing types into new shapes.

| Utility Type | Description | Use Case |
| :--- | :--- | :--- |
| **`Partial<T>`** | Sets all properties of type `T` to **optional** (`?`). | Handling edit/update forms or PATCH requests. |
| **`Readonly<T>`** | Sets all properties of type `T` to **read-only**. | Freezing configuration states or state caches. |
| **`Pick<T, Keys>`** | Creates a type by **selecting** a specific set of keys from `T`. | Extracting simple preview cards from large database shapes. |
| **`Omit<T, Keys>`** | Creates a type by **removing** a specific set of keys from `T`. | Creating user submissions without automatically generated IDs. |

### Utility Code Examples

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
}

// 1. Partial: Makes all profile fields optional for update operations
const updateProfile = (id: number, updates: Partial<UserProfile>) => {
  // updates can contain username, email, or avatarUrl; all are optional
};

// 2. Readonly: Freezes the profile so no field can be reassigned
const lockedProfile: Readonly<UserProfile> = {
  id: 1,
  username: "monstercoder",
  email: "coder@test.com",
  avatarUrl: "https://avatar.png"
};
// lockedProfile.username = "changed"; // Error: cannot assign to read-only property

// 3. Pick: Selects only username and avatarUrl for list previews
type UserPreview = Pick<UserProfile, "username" | "avatarUrl">;
const preview: UserPreview = {
  username: "monstercoder",
  avatarUrl: "https://avatar.png"
};

// 4. Omit: Removes 'id' for user registration forms
type RegisterData = Omit<UserProfile, "id">;
const submission: RegisterData = {
  username: "alice",
  email: "alice@test.com",
  avatarUrl: "https://alice.jpg"
};
```

---

## ⚡ 3. Type Narrowing

**Type narrowing** is the process of refining a variable's type *within a conditional block* of code, letting you write more precise and type-safe logic. When a variable can be one of several types (a *union*), TypeScript will not let you use type-specific methods until you have *proven* which type you are holding. The tools that do this proving are called **type guards**.

> **A real-world metaphor: the airport security lane 🛂**
>
> A union type `string | number` is like a line of travelers where each could be a citizen *or* a visitor. You cannot hand someone the "citizen-only" fast-track form until you have *checked their passport*. The `typeof`/`instanceof` checks are the passport scan: once the scan confirms "citizen", everyone downstream in that lane is treated as a citizen with full confidence. TypeScript does exactly this — inside the verified block, it upgrades the variable to the narrower, more capable type.

| Narrowing technique | Best for checking… | Example check |
| :--- | :--- | :--- |
| **`typeof`** | Primitive types | `typeof value === "string"` |
| **`instanceof`** | Class instances | `animal instanceof Dog` |
| **`in` operator** | Presence of a property | `"bark" in animal` |
| **Discriminated union** | Tagged object variants | `shape.kind === "circle"` |

### A. `typeof` Type Guards
The `typeof` operator narrows **primitive** types (`string`, `number`, `boolean`, etc.):

```typescript
type MyType = string | number;

function example(value: MyType): void {
  if (typeof value === "string") {
    // Inside this block, TypeScript knows 'value' is a string
    console.log(value.toUpperCase());
  } else {
    // Here, 'value' must be a number
    console.log(value.toFixed(2));
  }
}

example("hello"); // "HELLO"
example(20);      // "20.00"
```

### B. `instanceof` Type Guards
The `instanceof` operator narrows by checking whether an object was created from a particular **class** (constructor):

```typescript
class Dog {
  bark(): void {
    console.log("woof woof");
  }
}

class Cat {
  meow(): void {
    console.log("meow");
  }
}

function animalSound(animal: Dog | Cat): void {
  if (animal instanceof Dog) {
    // Narrowed to Dog — '.bark()' is available
    animal.bark();
  } else {
    // Narrowed to Cat — '.meow()' is available
    animal.meow();
  }
}

animalSound(new Dog()); // "woof woof"
animalSound(new Cat()); // "meow"
```

### C. Discriminated Unions
A **discriminated (tagged) union** gives each member of a union a shared literal property — the *discriminant* — so a simple equality check on that property narrows the whole object. This is the most robust pattern for modeling "one of several known shapes":

```typescript
// Each variant carries a unique literal 'kind' tag
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  side: number;
}

type Shape = Circle | Square;

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // Narrowed to Circle — 'radius' is accessible
      return Math.PI * shape.radius ** 2;
    case "square":
      // Narrowed to Square — 'side' is accessible
      return shape.side ** 2;
  }
}

console.log(area({ kind: "circle", radius: 2 })); // ~12.566
console.log(area({ kind: "square", side: 3 }));   // 9
```

> [!WARNING]
> Type narrowing happens at **compile time** to help you write safe code, but all TypeScript types are **erased** when compiled to JavaScript. A `typeof`/`instanceof` check survives (it is real JavaScript), but a discriminant like `kind` must be a *real runtime value* on the object — TypeScript will not invent it for you. Always set the tag explicitly when you construct the object.

> [!TIP]
> Pair discriminated unions with an **exhaustiveness check**: add a `default` branch that assigns the value to a `never` typed variable. If you later add a new variant to the union but forget to handle it, the compiler will flag the `default` branch — turning a silent runtime bug into a build-time error.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of advanced TypeScript. Click **Reveal Answer** to verify.

### 1. Why is using a Generic `<T>` preferred over using the `any` type?
<details>
  <summary><b>Reveal Answer</b></summary>

  `any` turns off the compiler's type checker, meaning TypeScript does not know or verify the return type of a function. A Generic `<T>` acts as a placeholder that captures the *exact* type passed in, guaranteeing type relationships and autocomplete safety for output values.
</details>

### 2. In `reversePair<T, U>(value1: T, value2: U): [U, T]`, why declare two type parameters instead of one?
<details>
  <summary><b>Reveal Answer</b></summary>

  The two arguments can be of *different* types (e.g. a `string` and a `number`), and we want to preserve **both** types precisely in the result. A single `<T>` would force both arguments to share one type. Declaring `<T, U>` lets each value keep its own type, so `reversePair("hello", 20)` is correctly inferred as `[number, string]`.
</details>

### 3. What is the benefit of a generic class like `Box<T>` over writing separate `StringBox` and `NumberBox` classes?
<details>
  <summary><b>Reveal Answer</b></summary>

  A single `Box<T>` definition is reused for every type — you avoid duplicating the class logic. Each instance "locks in" its own `T` at creation time (`new Box<string>(...)`, `new Box<number>(...)`), so `getContent()` returns the precise type and `setContent()` rejects values of the wrong type. One source of truth, full type safety per instance.
</details>

### 4. Inside `if (typeof value === "string") { ... } else { ... }` where `value: string | number`, what type does TypeScript assign to `value` in each branch?
<details>
  <summary><b>Reveal Answer</b></summary>

  Inside the `if` block, `value` is narrowed to `string` (so methods like `.toUpperCase()` are available). Inside the `else` block, TypeScript narrows it to `number` by elimination (so `.toFixed()` is available). This refinement is **type narrowing** via a `typeof` type guard.
</details>

### 5. What makes a *discriminated union* safer than a plain union of object types, and what runtime caveat must you remember?
<details>
  <summary><b>Reveal Answer</b></summary>

  Each member shares a common literal "tag" property (e.g. `kind: "circle"`), so a single check like `shape.kind === "circle"` narrows the entire object — enabling clean `switch` handling and optional exhaustiveness checks. The caveat: types are erased at compile time, so the discriminant must be a **real value** you set on the object at runtime. TypeScript does not add it for you.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Build a Generic API Response Wrapper
1. Create a file `generics.ts` in your workspace.
2. Define a generic interface `ApiResponse<T>` containing:
   - `status`: number.
   - `message`: string.
   - `data`: generic type `T`.
3. Create an interface `Product` containing `id` (number) and `title` (string).
4. Define a variable `productResponse` using `ApiResponse<Product>` and assign a mock object to verify compiler autocomplete.
5. Create an interface `User` containing `id` (number) and `username` (string).
6. Define a variable `usersListResponse` using `ApiResponse<User[]>` and assign a mock list of users.
7. Verify that you get autocomplete properties when accessing `productResponse.data.title` and `usersListResponse.data[0].username`.

### 🛠️ Exercise 2: Generic `Stack<T>` Class + Type Narrowing
1. In a file `stack.ts`, create a **generic class** `Stack<T>` with:
   - A `private items: T[]` array initialized to `[]`.
   - A `push(item: T): void` method that appends to `items`.
   - A `pop(): T | undefined` method that removes and returns the last item.
   - A `peek(): T | undefined` method that returns (without removing) the last item.
2. Create `const numberStack = new Stack<number>();`, push a few numbers, and log the result of `pop()`.
3. Create `const stringStack = new Stack<string>();`, push a few strings, and confirm the compiler rejects `stringStack.push(42)`.
4. Now add **type narrowing**: write a function `describe(value: string | number): string` that:
   - Uses a `typeof` guard to return `` `text of length ${value.length}` `` when `value` is a `string`.
   - Returns `` `number doubled is ${value * 2}` `` when `value` is a `number`.
5. **Stretch goal:** Define a discriminated union `type Notification = { kind: "email"; address: string } | { kind: "sms"; phone: string }`. Write a `send(n: Notification)` function that `switch`es on `n.kind` and logs the correct field. Add a `default` branch that assigns `n` to a `const _exhaustive: never = n;` to enforce exhaustiveness.
