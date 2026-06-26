# Lesson 2: Interfaces, Type Aliases, & Functions 📘

This lesson covers how to define custom object structures, handle flexible values using Union and Intersection types, and enforce strict type safety for functions and callback parameters. We will also dive deep into the features that make **interfaces** special: declaration merging, optional and `readonly` properties, and method signatures.

---

## 📖 Concept & Overview

In TypeScript, the two most important tools for describing the *shape* of your data are **interfaces** and **type aliases**. They look almost identical at first glance, but each one has powers the other lacks. Once you understand object shapes, you can apply the same rigor to your **functions**: typing parameters, optional arguments, default values, return types, and even the callbacks you pass around.

A key mental model that makes TypeScript "click" is **structural typing** (sometimes nicknamed "duck typing"): TypeScript does not care what you *named* a type — it cares about the *structure* (the set of properties and their types). If an object has the right shape, it fits, regardless of where it came from.

> [!NOTE]
> An **interface** is a *contract* that describes the shape an object **must have**. The compiler checks every object you assign against that contract — if a required property is missing or has the wrong type, you get a compile-time error long before the code ever runs.

> [!TIP]
> A practical rule of thumb: reach for an **interface** when you are describing the shape of an *object* or a *class*, especially in a public API that others might extend. Reach for a **type alias** when you need *unions*, *intersections*, *tuples*, *primitives*, or any non-object shape.

> [!WARNING]
> Only **interfaces** support *declaration merging*. If you declare the same **type alias** name twice, TypeScript throws a `Duplicate identifier` error. Knowing this distinction will save you hours of confused debugging.

---

## 🧠 Deep Explanation: The "Job Contract" Metaphor

Think of an **interface** as a **job description** posted by a company.

The job description lists the responsibilities (the properties and methods) a candidate **must** be able to fulfill. The company does not care *which school* you graduated from or *what your previous job title was* — only that you can do everything on the list. This is exactly how **structural typing** works: TypeScript checks whether your object can "do the job" described by the interface, not whether you explicitly labeled the object as that type.

- An **optional property (`?`)** is like a *nice-to-have* skill: "Knowledge of French is a plus." You can take the job with or without it.
- A **`readonly` property** is like your *employee ID*: it is assigned once on your first day and can never be changed afterward.
- A **method signature** is a required *task* you must be able to perform, e.g. "must be able to file weekly reports" (`printSongInfo(): string`).
- **Declaration merging** is like the company *amending* the same job description later: new responsibilities get added to the existing role rather than creating a brand-new, conflicting one.

### 📊 Interfaces vs. Type Aliases at a Glance

| Capability                            | `interface` | `type` (alias) |
| ------------------------------------- | :---------: | :------------: |
| Describe an object shape              |     ✅      |       ✅       |
| Optional properties (`?`)             |     ✅      |       ✅       |
| `readonly` properties                 |     ✅      |       ✅       |
| Method signatures                     |     ✅      |       ✅       |
| Extend / combine other shapes         | `extends`   |  `&` (intersection) |
| **Declaration merging** (reopening)   |     ✅      |  ❌ (error)    |
| Union types (`A \| B`)                |     ❌      |       ✅       |
| Tuples & primitives                   |     ❌      |       ✅       |
| `implements` on a `class`             |     ✅      |   ✅ (object-shape only) |

---

## ⚡ 1. Interfaces vs. Type Aliases

Both interfaces and type aliases let you define object structures. However, they are designed for different use cases.

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

// 2. Extending an interface (inheritance)
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
> **Declaration Merging**: If you declare two interfaces with the exact same name in the same scope, TypeScript automatically merges their properties into one. Type aliases cannot do this.

---

### B. Type Aliases (Flexibility & Unions)
Type aliases are naming shortcuts for *any* type shape, including primitives, unions, and tuples:

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

## ⚡ 2. Structural Typing ("Duck Typing")

TypeScript uses a **structural** type system, not a *nominal* one (unlike Java or C#). This means two types are considered compatible if their *structure* matches — the *name* of the type is irrelevant.

> If it walks like a duck and quacks like a duck, TypeScript treats it as a duck.

```typescript
interface Named {
  name: string;
}

// 'logName' only requires that its argument HAS a 'name' string.
function logName(thing: Named): void {
  console.log(thing.name);
}

// This object was never declared as 'Named', but it has the right SHAPE,
// so TypeScript accepts it. This is structural typing in action.
const pet = { name: "Rex", legs: 4 };
logName(pet); // ✅ Works: 'pet' satisfies the 'Named' contract.

const robot = { id: 7 };
// logName(robot); // ❌ Error: Property 'name' is missing in type '{ id: number; }'.
```

> [!TIP]
> Extra properties are fine when assigning from a *variable* (like `pet` above), because the object still satisfies the contract. However, an **object literal** assigned *directly* triggers "excess property checks" and will error on unknown properties — a deliberate safety net for catching typos.

---

## ⚡ 3. Optional Properties (`?`) and the `readonly` Modifier

### A. Optional Properties

Add a `?` after a property name to mark it as **optional**. The object is valid whether or not that property is present. Accessing a missing optional property yields `undefined` (not an error).

```typescript
type Person = {
  name: string;
  location: string;
  age?: number; // Optional: callers may omit it entirely
};

// ✅ Valid: 'age' is omitted because it is optional
const userA: Person = {
  name: "Hassan",
  location: "China"
};

// ✅ Also valid: 'age' is provided
const userB: Person = {
  name: "Alex",
  location: "USA",
  age: 20
};

console.log(userA.age); // undefined (no error — the property is optional)
```

> [!WARNING]
> If you remove the `?` from `age`, TypeScript immediately complains: *"Property 'age' is missing in type ... but required in type 'Person'."* The `?` is the only thing making omission legal.

### B. The `readonly` Modifier

`readonly` lets you *read* a property but forbids *reassigning* it after the object is created. It is ideal for IDs, configuration constants, and any value that should never change.

```typescript
type Account = {
  readonly id: number; // Set once at creation, never reassigned
  location: string;    // Mutable
};

const account: Account = { id: 101, location: "China" };

account.location = "Japan"; // ✅ Allowed: 'location' is mutable
// account.id = 999;        // ❌ Error: Cannot assign to 'id' because it is a read-only property.
```

---

## ⚡ 4. Union and Intersection Types

TypeScript allows you to compose types using set operations.

### Union Types (`|` - Or)
A union type describes a value that can be one of **several** types:

```typescript
const printId = (id: string | number) => {
  if (typeof id === "string") {
    // TypeScript narrows 'id' to string here
    console.log(id.toUpperCase());
  } else {
    // TypeScript narrows 'id' to number here
    console.log(id.toFixed(2));
  }
};

// Unions also work on variables and in tuples/arrays:
let items: (number | string)[] = [1, 5, "hello"];
// items.push(true); // ❌ Error: boolean is not assignable to number | string
```

### Intersection Types (`&` - And)
An intersection type combines multiple types into **one**, requiring the object to satisfy *all* combined shapes:

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

## ⚡ 5. Method Signatures Inside Interfaces

Interfaces are **not limited to plain data** — they can also describe **methods** that an object must implement. This is how you express the idea that "any object of this shape must be able to *do* something."

```typescript
// An interface describing a song that can describe ITSELF.
interface Song {
  songName: string;
  singerName: string;

  // Method signature: takes two strings, returns a string.
  printSongInfo(songName: string, singerName: string): string;
}

const song1: Song = {
  songName: "Natural",
  singerName: "Imagine Dragons",

  // The object must IMPLEMENT the method exactly as the signature requires.
  printSongInfo(songName: string, singerName: string): string {
    return `Song: ${songName} — Singer: ${singerName}`;
  }
};

console.log(song1.printSongInfo("Natural", "Imagine Dragons"));
// Output: Song: Natural — Singer: Imagine Dragons
```

Here is a second example combining data properties with a `void` method (a method that performs an action but returns nothing):

```typescript
interface PersonGreeter {
  firstName: string;
  lastName: string;
  age: number;
  sayHello(): void; // Action method; returns nothing
}

// 'greet' accepts ANY object that satisfies the PersonGreeter contract.
function greet(person: PersonGreeter): void {
  console.log(`Hello, ${person.firstName} ${person.lastName}`);
  person.sayHello();
}

greet({
  firstName: "John",
  lastName: "Doe",
  age: 30,
  sayHello() {
    console.log("Hi there!");
  }
});
```

> [!NOTE]
> Interfaces with method signatures pair beautifully with classes via `implements`. A `class Car implements Vehicle { ... }` is forced by the compiler to define every method (e.g. `start()` and `stop()`) declared on the `Vehicle` interface.

---

## ⚡ 6. Declaration Merging (Reopening an Interface)

A unique power of interfaces is **declaration merging**: you can declare the *same interface name* more than once, and TypeScript automatically **merges** all declarations into a single combined definition. This is impossible with type aliases.

```typescript
// First declaration
interface Computer {
  name: string;
  ram: number;
}

// Reopening the SAME interface to add more required properties.
// TypeScript MERGES this into the declaration above.
interface Computer {
  hardDiskDrive: number;
}

// Now 'Computer' effectively requires ALL THREE properties.
const myPc: Computer = {
  name: "i7",
  ram: 8,
  hardDiskDrive: 100 // Required because of the merged declaration
};

console.log(myPc.name, myPc.ram, myPc.hardDiskDrive);
```

Compare this with a type alias, which is **not** allowed to merge:

```typescript
type Gadget = { name: string };
// type Gadget = { price: number }; // ❌ Error: Duplicate identifier 'Gadget'.
```

> [!TIP]
> Declaration merging is widely used by library authors to *augment* existing types (e.g. adding properties to the global `Window` interface or to a third-party module's types) without modifying the original source.

---

## ⚡ 7. Typing Functions

In TypeScript, you can strictly type function parameters, optional arguments, default values, and return types.

```typescript
// 1. Named function with explicit return type
function calculateBill(price: number, taxRate: number, discount: number = 0): number {
  return (price * (1 + taxRate)) - discount;
}

// 2. Arrow function with optional parameter (note: optional params come LAST)
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

> [!WARNING]
> An optional parameter (e.g. `title?: string`) must always appear **after** all required parameters. Writing `(title?: string, name: string)` is a syntax error.

---

## 🧠 Test Your Knowledge

Answer these questions to check your understanding of objects, interfaces, and functions. Click **Reveal Answer** to verify.

### 1. What is "Declaration Merging" in TypeScript, and which construct supports it?
<details>
  <summary><b>Reveal Answer</b></summary>

  Declaration Merging occurs when the TypeScript compiler merges two or more independent declarations that share the same name into a single combined definition. Only **Interfaces** support declaration merging — reopening an interface adds its new members to the existing one. Declaring two **Type Aliases** with the same name instead causes a compile-time `Duplicate identifier` error.
</details>

### 2. What does the `readonly` modifier do, and how does it differ from an optional (`?`) property?
<details>
  <summary><b>Reveal Answer</b></summary>

  The `readonly` modifier makes a property read-only **after** its initial object creation — any later attempt to reassign it triggers a compile-time error. An **optional (`?`)** property controls whether the property is *required at all*: it may be omitted entirely (accessing it then yields `undefined`). In short: `readonly` is about *mutability*, while `?` is about *presence*.
</details>

### 3. What is "structural typing," and why does an object literal that was never declared as a given interface still satisfy it?
<details>
  <summary><b>Reveal Answer</b></summary>

  Structural typing (a.k.a. "duck typing") means TypeScript checks type compatibility by **shape** — the set of properties and their types — rather than by the type's declared **name** (nominal typing). As long as an object contains all the required members with compatible types, it satisfies the interface, regardless of where it came from or how it was labeled.
</details>

### 4. How do you declare a **method signature** inside an interface, and what must an object provide to satisfy it?
<details>
  <summary><b>Reveal Answer</b></summary>

  You declare it like `printSongInfo(songName: string, singerName: string): string;` — a name, typed parameters, and a return type — directly inside the interface body. Any object typed with that interface **must implement** a matching method: same parameter types and a return value assignable to the declared return type (or `void` if it returns nothing).
</details>

### 5. What is the difference between Union and Intersection types?
<details>
  <summary><b>Reveal Answer</b></summary>

  - A **Union Type** (`A | B`) represents a value that can be *either* type A or type B (logical OR). TypeScript narrows the value within `typeof`/`instanceof` checks.
  - An **Intersection Type** (`A & B`) combines multiple shapes into one type that *must contain all* properties from both A and B (logical AND).
</details>

---

## 💻 Practice Exercises

Apply what you learned in your project environment.

### 🛠️ Exercise 1: Typing an API Payload & Processor
1. Create a file `functions.ts` inside your workspace.
2. Define an interface called `Product` containing:
   - `id`: a `readonly` number.
   - `name`: string.
   - `price`: number.
   - `category`: optional string.
3. **Reopen** the `Product` interface (declaration merging) in the same file and add a `readonly sku: string` property. Confirm that new `Product` objects are now forced to include `sku`.
4. Define a type alias `Cart` which is an array of `Product` objects.
5. Write a function `checkout` that accepts a `Cart` and an *optional* discount code (string) and returns the total checkout price (number):
   - If the discount code `"SAVE10"` is passed, subtract `10` from the total price.
6. Create a mock cart array, pass it to the function, and run compile checks (`tsc functions.ts`) to verify type correctness.
7. **Bonus:** Try reassigning `product.id` after creation and confirm the compiler rejects it because of `readonly`.

### 🛠️ Exercise 2: An Interface with a Method Signature
1. In the same file, define an interface `Song` with:
   - `songName`: string.
   - `singerName`: string.
   - A method signature `printSongInfo(): string` that returns a formatted description.
2. Create an object `song1` typed as `Song` that **implements** `printSongInfo()`, returning a string like `"Natural by Imagine Dragons"`.
3. Write a standalone function `describeSong(song: Song): void` that calls `song.printSongInfo()` and logs the result.
4. Pass an *anonymous object literal* with the correct shape directly into `describeSong(...)` to prove **structural typing** — the object never needed to be explicitly labeled `Song`.
5. **Bonus:** Add a second interface `LikeableSong` and use an **intersection** (`Song & LikeableSong`) to require an extra `likes: number` property, then update your object accordingly.
