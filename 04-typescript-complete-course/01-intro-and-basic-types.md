# Lesson 1: TypeScript Intro & Basic Types 📘

TypeScript is a strongly typed, open-source programming language developed by Microsoft. It is a strict syntactical **superset of JavaScript**, meaning that all valid JavaScript is valid TypeScript. TypeScript compiles down to clean, readable, plain JavaScript that runs in any browser, Node.js environment, or JS engine.

### 💡 Real-World Analogy: The Blueprint
Think of JavaScript as building a house without blueprints—you can stack bricks and place doors anywhere. It is fast and flexible, but you might build a door that opens into a wall. TypeScript is like drawing a detailed **architectural blueprint (types)** first. It guarantees that the kitchen pipes align with the plumbing before you buy a single brick (compile time checking).

---

## ⚡ 1. Why Use TypeScript?

1. **Catch Bugs Early**: Catch type mismatches (like calling `.toUpperCase()` on a number) during compile time in your editor before the code ever runs in production.
2. **Superior Tooling**: VS Code provides autocomplete (IntelliSense), hover parameter hints, and secure refactoring tools because it understands the shapes of your data.
3. **Self-Documenting Code**: Types describe exactly what data shapes are expected, reducing documentation overhead.

---

## 🧩 2. Setting Up the Compiler

TypeScript is compiled using the compiler CLI tool **`tsc`**. To initialize a TypeScript configuration in a project, you generate a `tsconfig.json` file:

```bash
# Install globally or locally in project
npm install -g typescript

# Initialize tsconfig compiler parameters
tsc --init
```

The `tsconfig.json` controls parameters like target JavaScript version (e.g. `ES6`), module systems, and strict type check constraints (like `"strict": true`).

---

## 🧩 3. Primitive & Array Type Annotations

To define types, you append a colon `:` followed by the type name:

```typescript
// 1. Primitive Types
let username: string = "Monster";
let age: number = 25; // Supports integers, floats, hex, binaries
let isDeveloper: boolean = true;
let emptyValue: null = null;
let undefinedValue: undefined = undefined;

// 2. Arrays
// Notation A: type followed by square brackets
let ratings: number[] = [5, 4, 5, 2];

// Notation B: Generic array wrapper syntax
let skills: Array<string> = ["React", "TypeScript", "Node"];
```

---

## 🧩 4. Tuples and Enums

### Tuples
Tuples are arrays with a **fixed number of elements** whose types are known at specific positions:

```typescript
// A tuple containing user ID (number) and role (string)
let userSession: [number, string] = [101, "admin"];

// Attempting to swap types or append extra cells will trigger a compile check error:
// userSession = ["admin", 101]; // Error: Type 'string' is not assignable to type 'number'
```

### Enums
Enums (Enumerations) allow us to define a set of named constants.

#### A. Numeric Enums
By default, numeric enums start auto-incrementing from `0`:
```typescript
enum UserRole {
  Admin,  // 0
  Editor, // 1
  User    // 2
}
let currentRole: UserRole = UserRole.Admin; // Evaluates to 0
```

#### B. String Enums
String enums are highly readable because the values do not increment; they compile directly to string literals:
```typescript
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}
let currentDir: Direction = Direction.Up; // Evaluates to "UP"
```

---

## 🧩 5. Special Types: `any`, `unknown`, `void`, and `never`

| Special Type | Behavior | When to Use |
| :--- | :--- | :--- |
| **`any`** | Completely disables type checking. You can call any property or method on it. | Avoid where possible. Useful only for temporary JavaScript migrations. |
| **`unknown`** | Type-safe counterpart to `any`. You cannot call methods on it without first verifying its type via **Type Guard** narrows. | When handling values from unknown external inputs (e.g. parsed JSON, external API payloads). |
| **`void`** | Represents the absence of a return value. | Return type of functions that perform tasks but do not return values (e.g., `console.log`). |
| **`never`** | Represents values that **never occur**. | Return type of functions that loop infinitely or always throw exceptions. |

```typescript
// unknown safety check example
let inputData: unknown = "Hello World";

// let length: number = inputData.length; // Error: Object is of type 'unknown'

if (typeof inputData === "string") {
  let length: number = inputData.length; // Safe! TypeScript narrowed type to string.
}
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of basic TypeScript. Click **Reveal Answer** to verify.

### 1. Does TypeScript run directly in browser web engines?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. Browsers can only execute JavaScript. TypeScript is a development-time tool. The TypeScript compiler (`tsc`) transpiles `.ts` files into standard `.js` files, stripping away all type annotations before deployment.
</details>

### 2. What is the difference between `any` and `unknown`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `any` bypasses type checking completely. You can access any properties or call any methods on it without checks, which can crash at runtime.
  - `unknown` is type-safe. It tells the compiler "we don't know this type yet." You are forced to perform type guards (like `typeof` checks) to narrow down the type before accessing properties on it.
</details>

### 3. What is Type Inference in TypeScript?
<details>
  <summary><b>Reveal Answer</b></summary>

  Type Inference is TypeScript's ability to automatically figure out variables' types based on the values assigned to them during declaration. For example, writing `let age = 25;` automatically type-assigns `age` to `number` without needing manual annotation: `let age: number = 25;`.
</details>

### 4. What is a Tuple? Give a common example in React hooks.
<details>
  <summary><b>Reveal Answer</b></summary>

  A Tuple is a fixed-length array where the type of each element position is pre-defined. A common example in React is the return value of the `useState` hook, which returns a tuple containing the state value and a setter function, e.g., `[string, Dispatch<SetStateAction<string>>]`.
</details>

### 5. Why is using String Enums often preferred over Numeric Enums?
<details>
  <summary><b>Reveal Answer</b></summary>

  Numeric enums compile to auto-incrementing integers (0, 1, 2...). If you print or log their values, they output numbers which make debugging difficult. String enums hold readable string values (like `"UP"`, `"DOWN"`), making runtime logs and network payloads highly descriptive and self-explanatory.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Config and First Compile
1. Inside a temporary directory in your workspace, create a file named `basics.ts`.
2. Define a String Enum called `Status` containing keys: `Pending`, `Success`, `Failed`.
3. Create a tuple variable `apiResponse` of type `[Status, number, string[]]` representing Status, HTTP Code, and list of message strings.
4. Attempt to assign an incorrect type (like passing boolean instead of status) to see compiler warnings.
5. Fix the types, open a terminal, and run `npx tsc basics.ts` to compile the file into standard JavaScript `basics.js`. View the output file to observe how types were stripped away and enums were compiled.
