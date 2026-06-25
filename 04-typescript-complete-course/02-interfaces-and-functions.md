# Lesson 2: Interfaces, Type Aliases, & Functions 📘

This lesson covers how to define custom object structures, handle flexible values using Union and Intersection types, and enforce strict type safety for functions and callback parameters.

---

## ⚡ 1. Interfaces vs. Type Aliases

Both interfaces and type aliases allow you to define object structures. However, they are designed for different use cases.

### A. Interfaces (Objects & Extensibility)
Interfaces are standard blueprints for objects. They support **inheritance** (extending interfaces) and **declaration merging**:

```typescript
// 1. Define base interface
interface User {
  readonly id: number; // Cannot be modified after initial assignment
  name: string;
  email: string;
  role?: string; // Optional property
}

// 2. Extending an interface
interface Employee extends User {
  salary: number;
}

const developer: Employee = {
  id: 1,
  name: "Sarah",
  email: "sarah@dev.com",
  salary: 95000
};
// developer.id = 2; // Error: Cannot assign to 'id' because it is a read-only property.
```

> [!NOTE]
> **Declaration Merging**: If you declare two interfaces with the exact same name in the same file, TypeScript automatically merges their properties together. Type aliases cannot do this.

---

### B. Type Aliases (Flexibility & Unions)
Type Aliases are naming shortcuts for *any* type shape, including primitives, unions, and tuples:

```typescript
// 1. Primitive Aliasing
type ID = string | number;

// 2. Object Shape Aliasing
type Point = {
  x: number;
  y: number;
};

// 3. Extending types (using Intersections)
type NamedPoint = Point & { name: string };
```

---

## ⚡ 2. Union and Intersection Types

TypeScript allows you to compose types using set operations:

### Union Types (`|` - Or)
A union type describes a value that can be one of **several** types:

```typescript
const printId = (id: string | number) => {
  if (typeof id === "string") {
    // TypeScript knows 'id' is string here
    console.log(id.toUpperCase());
  } else {
    // TypeScript knows 'id' is number here
    console.log(id.toFixed(2));
  }
};
```

### Intersection Types (`&` - And)
An intersection type combines multiple types into **one**, requiring the object to satisfy all combined shapes:

```typescript
interface HasName {
  name: string;
}
interface HasAge {
  age: number;
}

type Person = HasName & HasAge;

const customer: Person = {
  name: "John",
  age: 30 // Must have both name AND age properties
};
```

---

## ⚡ 3. Typing Functions

In TypeScript, you can strictly type function parameters, optional arguments, default values, and return formats.

```typescript
// 1. Named function with explicit return type
function calculateBill(price: number, taxRate: number, discount: number = 0): number {
  return (price * (1 + taxRate)) - discount;
}

// 2. Arrow function with optional parameter
const formatGreeting = (name: string, title?: string): string => {
  if (title) return `Hello, ${title} ${name}`;
  return `Hello, ${name}`;
};

// 3. Callback Function Parameter Signature
const executeAction = (
  id: number, 
  callback: (username: string) => void
): void => {
  const username = `User_${id}`;
  callback(username);
};

// Usage
executeAction(404, (name) => console.log(`Processed: ${name}`));
```

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of objects and functions. Click **Reveal Answer** to verify.

### 1. What is "Declaration Merging" in TypeScript, and which construct supports it?
<details>
  <summary><b>Reveal Answer</b></summary>

  Declaration Merging occurs when the TypeScript compiler merges two or more independent declarations sharing the same name into a single definition. Only **Interfaces** support declaration merging. Declaring two Type Aliases with the same name will cause a compile-time "Duplicate identifier" error.
</details>

### 2. What does the `readonly` modifier do when applied to interface properties?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `readonly` modifier makes a property read-only after its initial object creation. Any subsequent code attempts to reassign or modify the value of a `readonly` property will trigger a compile-time error.
</details>

### 3. In functions, can you place an optional parameter before a required parameter?
<details>
  <summary><b>Reveal Answer</b></summary>

  No. In JavaScript and TypeScript, optional parameters (e.g. `title?: string`) must always be placed **after** all required parameters in the function arguments list.
</details>

### 4. What is the difference between Union and Intersection types?
<details>
  <summary><b>Reveal Answer</b></summary>

  - A **Union Type** (`A | B`) represents a value that can be *either* type A or type B.
  - An **Intersection Type** (`A & B`) combines multiple type structures, creating a new type that *must contain all* properties from both A and B.
</details>

### 5. What does the return type `void` represent in a function signature?
<details>
  <summary><b>Reveal Answer</b></summary>

  `void` indicates that the function performs an action but **does not return any value** (its evaluation result is undefined). It is commonly used for functions that log to the console, trigger callbacks, or run event changes.
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment:

### 🛠️ Exercise 1: Typing API Payload & Processors
1. Create a file `functions.ts` inside your workspace.
2. Define an interface called `Product` containing:
   - `id`: read-only number.
   - `name`: string.
   - `price`: number.
   - `category`: optional string.
3. Define a type alias `Cart` which is an array of `Product` objects.
4. Write a function `checkout` that accepts a `Cart` and an optional discount code (string), returning the total checkout price (number):
   - If the discount code `"SAVE10"` is passed, subtract `10` from the total price.
5. Create a mock cart array, pass it to the function, and run compile checks to verify type correctness.
