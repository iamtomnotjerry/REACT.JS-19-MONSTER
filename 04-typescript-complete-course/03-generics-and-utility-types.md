# Lesson 3: Generics & Utility Types 📘

This lesson covers **Generics** (writing reusable functions, classes, and interfaces that work with multiple types while maintaining compile-time safety) and TypeScript's built-in **Utility Types** for transforming data shapes.

---

## ⚡ 1. TypeScript Generics

Generics act as type variables—meaning you can pass a type parameter (typically represented as `<T>`) into a function or component just like passing an argument.

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

### B. Generic Constraints (`extends`)
Sometimes you want a function to support multiple types, but with a requirement that they contain specific properties. We enforce this using the **`extends`** keyword:

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

---

## ⚡ 2. Built-in Utility Types

TypeScript provides several global utility helper types to transform existing types into new shapes.

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

// 2. Pick: Selects only username and avatarUrl for list previews
type UserPreview = Pick<UserProfile, "username" | "avatarUrl">;
const preview: UserPreview = {
  username: "monstercoder",
  avatarUrl: "https://avatar.png"
};

// 3. Omit: Removes 'id' for user registration forms
type RegisterData = Omit<UserProfile, "id">;
const submission: RegisterData = {
  username: "alice",
  email: "alice@test.com",
  avatarUrl: "https://alice.jpg"
};
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of advanced TypeScript. Click **Reveal Answer** to verify.

### 1. Why is using a Generic `<T>` preferred over using the `any` type?
<details>
  <summary><b>Reveal Answer</b></summary>

  `any` turns off the compiler's type checker, meaning TypeScript does not know or verify the return type of a function. A Generic `<T>` acts as a placeholder that captures the *exact* type passed in, guaranteeing type relationships and autocomplete safety for output values.
</details>

### 2. What does the expression `K extends keyof T` do in a generic function?
<details>
  <summary><b>Reveal Answer</b></summary>

  It constraints the type parameter `K` to be a union type representing only the valid property key names of object type `T`. This prevents developer errors by blocking access to non-existent property names.
</details>

### 3. If you wrap an interface in `Readonly<Type>`, can you modify its properties at runtime?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. The TypeScript compiler will block any code attempts to write to or reassign properties, showing errors. Note that because types are stripped at compilation, the resulting JavaScript does not prevent mutations unless you explicitly freeze the object using `Object.freeze()`.
</details>

### 4. What is the difference between `Omit<User, 'id' | 'role'>` and `Pick<User, 'username' | 'email'>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `Omit` removes the specified keys (`id` and `role`) and retains all other properties of the `User` interface.
  - `Pick` extracts only the selected keys (`username` and `email`), discarding everything else.
</details>

### 5. Can a custom interface inherit from a utility-transformed type?
<details>
  <summary><b>Reveal Answer</b></summary>

  Yes. You can use utility types in interface inheritance, for example:
  ```typescript
  interface GuestUser extends Omit<UserProfile, "id" | "email"> {
    guestToken: string;
  }
  ```
  This creates a valid interface shape combining the omitted properties with new fields.
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
