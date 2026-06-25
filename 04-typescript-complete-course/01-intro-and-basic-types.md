# Lesson 1: TypeScript Intro & Basic Types 📘

TypeScript is a strongly typed, open-source programming language developed by Microsoft. It is a strict syntactical **superset of JavaScript**, meaning that all valid JavaScript is valid TypeScript. TypeScript compiles down to clean, readable, plain JavaScript that runs in any browser, Node.js environment, or JS engine.

## 🌟 Concept & Overview

Think of TypeScript as **"JavaScript with superpowers"**. It lets you do every single thing JavaScript already does, but adds an extra layer — a *type system* — that describes the **shape** of your data. The official tagline says it best: *"TypeScript is JavaScript with syntax for types."* These extra annotations let your editor catch errors **before** the code ever runs, so you can trust what you ship.

> [!NOTE]
> TypeScript code never runs directly anywhere. The compiler (`tsc`) transpiles your `.ts` files into ordinary `.js` files, stripping every type annotation along the way. Types exist purely at **development/compile time** — at runtime, it is plain JavaScript.

> [!WARNING]
> Avoid the `any` type whenever possible. `any` switches off type checking entirely and reintroduces all the runtime bugs TypeScript was meant to prevent. When you genuinely do not know a type, prefer **`unknown`**, which forces you to narrow the value safely before using it.

> [!TIP]
> You do not need to memorize most basic types — TypeScript uses **type inference** to figure them out for you. Write `let age = 25;` and TypeScript already knows `age` is a `number`. Add explicit annotations mainly at the *boundaries* of your code (function parameters, return types, external data).

### 💡 Real-World Analogy: The Blueprint
Think of JavaScript as building a house without blueprints — you can stack bricks and place doors anywhere. It is fast and flexible, but you might build a door that opens into a wall. TypeScript is like drawing a detailed **architectural blueprint (types)** first. It guarantees that the kitchen pipes align with the plumbing before you buy a single brick (compile-time checking).

---

## ⚡ 1. Why Use TypeScript?

1. **Catch Bugs Early**: Catch type mismatches (like calling `.toUpperCase()` on a number) during compile time in your editor before the code ever runs in production.
2. **Superior Tooling**: VS Code provides autocomplete (IntelliSense), hover parameter hints, and secure refactoring tools because it understands the shapes of your data.
3. **Self-Documenting Code**: Types describe exactly what data shapes are expected, reducing documentation overhead.

### TypeScript vs. JavaScript at a Glance

| Aspect | JavaScript | TypeScript |
| :--- | :--- | :--- |
| **Type checking** | None — errors surface at runtime | Static — errors surface in the editor at compile time |
| **Tooling / autocomplete** | Limited (engine guesses shapes) | Rich IntelliSense from known types |
| **Runs in the browser** | Directly | Only after compiling to `.js` |
| **File extension** | `.js` / `.jsx` | `.ts` / `.tsx` |
| **Best for** | Quick scripts, tiny prototypes | Any scale — especially large, long-lived codebases |

---

## 🧩 2. Setting Up the Compiler

TypeScript is compiled using the compiler CLI tool **`tsc`**. To initialize a TypeScript configuration in a project, you generate a `tsconfig.json` file:

```bash
# Install the compiler globally (or locally inside a project with --save-dev)
npm install -g typescript

# Optional: ts-node lets you run .ts files directly without a manual compile step
npm install -g ts-node

# Confirm the installation and print the compiler version
tsc -v

# Generate a tsconfig.json with all compiler options documented
tsc --init
```

The `tsconfig.json` controls parameters like target JavaScript version (e.g. `ES6`), module systems, and strict type-check constraints (like `"strict": true`).

> [!TIP]
> For quick experiments you do not even need a build setup. Install the **Code Runner** VS Code extension plus **ts-node**, create an `index.ts`, and run the file straight from the editor. This is how we will explore types at the start of the course.

---

## 🧩 3. Type Annotations (Primitives)

An **annotation** specifies the data type of a variable, parameter, or return value. To annotate, you append a colon `:` followed by the type name, then assign a matching value:

```typescript
// Syntax:  let <variableName>: <type> = <value>;

let myName: string = "Monster"; // annotated as string -> only text allowed
let fairNumber: number = 8;     // annotated as number -> integers, floats, hex, binary
let isTsHard: boolean = false;  // annotated as boolean -> only true / false

// Reassigning with the SAME type is fine
myName = "Another Person";

// Reassigning with a DIFFERENT type fails at compile time:
// myName = 12; // ❌ Error: Type 'number' is not assignable to type 'string'
```

### Type Inference
If you assign a value at declaration, you can usually skip the annotation — TypeScript **infers** it:

```typescript
let tech = "TypeScript"; // TypeScript infers the type as `string`
let count = 8;           // inferred as `number`
let active = true;       // inferred as `boolean`

// Inference is just as strict as an explicit annotation:
// tech = 12; // ❌ Error: Type 'number' is not assignable to type 'string'
```

---

## 🧩 4. Array & Tuple Types

```typescript
// Notation A: element-type followed by square brackets (the common, modern style)
let ratings: number[] = [5, 4, 5, 2];

// Notation B: the generic Array<T> wrapper (older, rarely used today)
let skills: Array<string> = ["React", "TypeScript", "Node"];

// The array element type is enforced on every operation, including .push()
let items: string[] = [];
items.push("keyboard"); // ✅ a string is allowed
// items.push(12);      // ❌ Error: number is not assignable to type 'string'
```

### Multi-dimensional Arrays
An array can contain other arrays. Add one pair of brackets per dimension:

```typescript
// Each extra [] adds a level of nesting
let single: number[] = [1, 2, 3, 4, 5];           // 1-D
let matrix: number[][] = [[1, 2, 3], [4, 5, 6]];   // 2-D (a matrix / grid)
let cube: number[][][] = [[[1, 2], [3, 4]]];       // 3-D (rarely needed)
```

### Tuples
Tuples are arrays with a **fixed number of elements** whose types are known at specific positions:

```typescript
// A tuple: index 0 must be a number, index 1 must be a string
let userSession: [number, string] = [101, "admin"];

// Swapping the order breaks the contract:
// userSession = ["admin", 101]; // ❌ Error: 'string' is not assignable to type 'number'
```

> [!NOTE]
> You already use tuples in React! `const [count, setCount] = useState(0)` returns a tuple of type `[number, Dispatch<SetStateAction<number>>]` — a fixed-position pair of the state value and its setter.

---

## 🧩 5. Enums

Enums (Enumerations) let us define a set of named constants.

#### A. Numeric Enums
By default, numeric enums auto-increment starting from `0`:
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

## 🧩 6. Functions: Parameter & Return Annotations

You annotate each parameter, and (optionally) the return value after the parameter list:

```typescript
// Regular function: `num` is annotated as number, return value annotated as number
function addOne(num: number): number {
  return num + 1;
}
const result = addOne(3); // ✅ 4
// addOne("3"); // ❌ Error: argument of type 'string' is not assignable to 'number'

// Arrow function with two annotated params and an annotated return type
const double = (x: number, y: number): number => x * y;
const product = double(2, 10); // ✅ 20

// Default parameter values — TypeScript infers the type from the default
function greet(person: string = "Anonymous"): string {
  return `Hello ${person}`;
}
greet();          // "Hello Anonymous"
greet("Monster"); // "Hello Monster"
```

> [!WARNING]
> If you forget to annotate a parameter, TypeScript falls back to an **implicit `any`** (and warns you under `"strict": true`). Calling `double(2, 10)` may *look* fine, but an un-annotated `x` silently disables type safety for that argument. Always annotate your parameters.

TypeScript also enforces the **number of arguments** — passing too many or too few is an error:

```typescript
// double expects exactly 2 arguments
// double(2);          // ❌ Error: Expected 2 arguments, but got 1
// double(2, 10, 5);   // ❌ Error: Expected 2 arguments, but got 3
```

---

## 🧩 7. Object Types & Type Aliases

You can annotate the exact **shape** of an object inline, or extract it into a reusable **type alias**:

```typescript
// Inline object annotation: keys separated by semicolons
let person: { firstName: string; lastName: string; age: number } = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
};
// Omitting `age` -> Error: Property 'age' is missing in type ...

// A `type` alias names a shape so you can reuse it everywhere
type User = {
  name: string;
  age: number;
  location: string;
};

// Reuse the alias as a parameter type and a return type
function printUser(): User {
  return { name: "Monster", age: 20, location: "Earth" };
}
const res: User = printUser();
```

> [!TIP]
> Type aliases keep your code DRY — define the shape once and reference it by name. Later in the course you will meet **interfaces**, which are even more powerful for describing object shapes.

---

## 🧩 8. Special Types: `any`, `unknown`, `void`, and `never`

| Special Type | Behavior | When to Use |
| :--- | :--- | :--- |
| **`any`** | Completely disables type checking. You can call any property or method on it. | Avoid where possible. Useful only for temporary JavaScript migrations. |
| **`unknown`** | Type-safe counterpart to `any`. You cannot call methods on it without first verifying its type via a **type guard** that narrows it. | When handling values from unknown external inputs (e.g. parsed JSON, external API payloads). |
| **`void`** | Represents the absence of a return value. | Return type of functions that perform tasks but do not return values (e.g., `console.log`). |
| **`never`** | Represents values that **never occur**. | Return type of functions that loop infinitely or always throw exceptions. |

```typescript
// ❌ `any` turns OFF all checking — this compiles but crashes at runtime:
let color: any = "Crimson";
color = 20;
// color(); // no editor error, but throws "color is not a function" when run

// ✅ `unknown` is the safe alternative — you MUST narrow before using it:
let inputData: unknown = "Hello World";
// let length: number = inputData.length; // ❌ Error: Object is of type 'unknown'
if (typeof inputData === "string") {
  let length: number = inputData.length; // ✅ Safe! Narrowed to string by the type guard
}

// `void`: function does work but returns nothing meaningful
function printMessage(message: string): void {
  console.log("This is my message:", message);
}

// `never`: function NEVER returns (always throws or loops forever)
function throwError(message: string): never {
  throw new Error(message);
}
function infiniteLoop(): never {
  while (true) {} // control flow never reaches the end
}
```

> [!NOTE]
> `void` and `never` look similar but differ: a `void` function *returns* (it just yields no useful value), whereas a `never` function *never reaches a return point* at all — it always throws or loops forever.

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
  - `unknown` is type-safe. It tells the compiler "we don't know this type yet." You are forced to perform type guards (like `typeof` checks) to narrow down the type before accessing properties on it. **Prefer `unknown` over `any`.**
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
4. Attempt to assign an incorrect type (like passing a boolean instead of a `Status`) to see the compiler warnings.
5. Fix the types, open a terminal, and run `npx tsc basics.ts` to compile the file into standard JavaScript `basics.js`. Open the output file to observe how types were stripped away and how the enum compiled.

**Starter scaffold:**
```typescript
// basics.ts
enum Status {
  Pending = "PENDING",
  Success = "SUCCESS",
  Failed = "FAILED",
}

// [status, httpCode, messages]
let apiResponse: [Status, number, string[]] = [Status.Success, 200, ["OK"]];

// Try this to trigger an error, then fix it:
// apiResponse = [true, 200, ["OK"]]; // ❌ boolean is not assignable to Status

console.log(apiResponse);
```

### 🛠️ Exercise 2: Safe Input Handling with `unknown`
Practice why `unknown` beats `any` when data comes from outside your code.

1. Create a file `safeInput.ts`.
2. Write a function `formatTitle(value: unknown): string` that receives a value of type `unknown`.
3. Inside it, use a `typeof` **type guard** to check whether `value` is a `string`. If it is, return it in upper-case; otherwise return the literal string `"INVALID INPUT"`.
4. Call the function once with a string and once with a number, and log both results.
5. Now change the parameter type from `unknown` to `any` and notice that the editor stops protecting you — confirm that removing the guard with `any` compiles even though it is unsafe.

**Expected behavior:**
```typescript
// safeInput.ts
function formatTitle(value: unknown): string {
  // `unknown` forces this guard before we may treat `value` as a string
  if (typeof value === "string") {
    return value.toUpperCase(); // ✅ safely narrowed to string here
  }
  return "INVALID INPUT";
}

console.log(formatTitle("typescript")); // "TYPESCRIPT"
console.log(formatTitle(42));           // "INVALID INPUT"
```
