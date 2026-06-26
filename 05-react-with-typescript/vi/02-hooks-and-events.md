# React Hooks & Xử lý Sự kiện với TypeScript 🦾

Định nghĩa kiểu cho các state hook, tham chiếu DOM, sự kiện trình duyệt, reducer, effect và context dùng chung là điều thiết yếu để xây dựng các ứng dụng React được định kiểu đầy đủ và an toàn. TypeScript đảm bảo mỗi giá trị, phần tử và hành động đều có gợi ý tự động (autocomplete) đúng đắn, đồng thời bảo vệ bạn khỏi việc truyền sai cấu trúc dữ liệu vào sai chỗ.

---

## 🌐 Khái niệm & Tổng quan

Khi bạn kết nối các hook với nhau bằng JavaScript thuần, React vui vẻ chấp nhận bất cứ thứ gì bạn đưa cho nó và chỉ phàn nàn khi chạy (runtime) — thường là ngay trước mặt người dùng. Việc thêm TypeScript biến những bất ngờ runtime thầm lặng đó thành các lỗi rõ ràng, hữu ích ngay trong editor của bạn, *trước khi* bạn kịp save-and-refresh.

Hãy hình dung TypeScript với các hook giống như **các ngăn được dán nhãn trong một hộp đồ nghề chuyên nghiệp**. Trong một ngăn kéo lộn xộn, bất kỳ dụng cụ nào cũng có thể nằm ở bất kỳ đâu — bạn chỉ phát hiện ra mình cầm nhầm tua vít thay vì cái đục khi miếng gỗ bị nứt. Một hộp đồ nghề có nhãn cho bạn biết *ngay lập tức* ngăn nào dành cho dụng cụ nào. Mỗi hook là một ngăn: `useState` được dán nhãn bằng cấu trúc của giá trị mà nó nắm giữ, `useReducer` được dán nhãn bằng tập hợp chính xác các action mà nó chấp nhận, `useContext` được dán nhãn bằng bản cam kết (contract) mà mọi consumer phải tuân thủ, và các event handler được dán nhãn bằng phần tử DOM chính xác mà chúng được kích hoạt.

> [!NOTE]
> TypeScript thường **suy luận (infer)** kiểu từ các giá trị khởi tạo của bạn, nên bạn viết *ít* code hơn, chứ không phải nhiều hơn. Bạn chỉ thêm generic tường minh khi suy luận không thể tự xác định kiểu — ví dụ khi giá trị khởi tạo là `null`, hoặc khi một reducer cần biết trước toàn bộ tập hợp action của nó.

> [!TIP]
> Quên mất tên một kiểu sự kiện React? Hãy viết handler **inline** ngay trong JSX (ví dụ `onClick={(e) => {}}`), rê chuột vào tham số `e` trong VS Code, và sao chép kiểu mà tooltip hiển thị. Mẹo này hoạt động với mọi sự kiện và nhanh hơn việc học thuộc cả danh mục.

### Mỗi hook phù hợp ở đâu

| Hook | TypeScript định kiểu giúp bạn điều gì | Khi nào bạn thêm kiểu tường minh |
| --- | --- | --- |
| `useState` | Giá trị state + setter của nó | Giá trị khởi tạo là `null`/`undefined`, hoặc là một union/cấu trúc object |
| `useRef` | `.current` (DOM node hoặc hộp chứa giá trị có thể thay đổi) | Luôn truyền kiểu phần tử cho các DOM ref |
| Event handlers | Không có gì tự động khi được tách ra | Khi bạn chuyển một handler ra khỏi JSX inline |
| `useReducer` | State + `dispatch`, được thu hẹp theo từng action | Định nghĩa kiểu state **và** một kiểu action dạng discriminated-union |
| `useEffect` | Không có gì (nó trả về `void`/cleanup) | Định kiểu cho **state** lưu trữ dữ liệu đã fetch |
| Context | Giá trị mà mọi consumer nhận được | Truyền một generic cho `createContext` |

---

## ⚡ 1. Định kiểu cho `useState`

TypeScript thường suy luận kiểu của các biến state dựa trên giá trị khởi tạo của chúng:

```tsx
const [count, setCount] = useState(0); // Inferred as: number
const [text, setText] = useState("");   // Inferred as: string
```

Tuy nhiên, nếu state của bạn được khởi tạo là `null` hoặc `undefined`, hoặc có thể nhận nhiều cấu trúc kiểu khác nhau, bạn phải định nghĩa nó bằng **Generics**:

```tsx
interface User {
  id: number;
  username: string;
}

// State can be either a User object OR null
const [user, setUser] = useState<User | null>(null);

const loginUser = () => {
  setUser({ id: 99, username: "admin" }); // Safe!
};
```

Đối với state dạng object mà bạn cập nhật theo từng trường, hãy định kiểu cấu trúc một lần và spread giá trị trước đó để giữ nguyên các trường còn lại:

```tsx
interface UserProfile {
  name: string;
  age: number;
  email: string;
}

const [profile, setProfile] = useState<UserProfile>({
  name: "",
  age: 0,
  email: "",
});

// Update a single field while preserving the rest
const updateName = (name: string) => {
  setProfile((prev) => ({ ...prev, name })); // prev is typed as UserProfile
};
```

---

## ⚡ 2. Định kiểu cho `useRef`

`useRef` hoạt động khác nhau tùy thuộc vào việc nó giữ một phần tử DOM hay một giá trị có thể thay đổi.

### A. Tham chiếu DOM (`.current` chỉ-đọc)
Để nhắm tới một phần tử DOM, hãy truyền tên interface của phần tử HTML làm tham số generic, và khởi tạo ref bằng `null`:

```tsx
import { useRef, useEffect } from 'react';

export const TextInput = () => {
  // 1. Declare target input element type
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 2. Access DOM safely (use optional chaining)
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />;
};
```

*Các kiểu phần tử HTML phổ biến bao gồm: `HTMLInputElement`, `HTMLButtonElement`, `HTMLDivElement`, `HTMLFormElement`.*

> [!WARNING]
> Nếu `.current` của một DOM ref có thể là `null` tại thời điểm bạn đọc nó, TypeScript sẽ cảnh báo ở `inputRef.current.value`. Hãy ưu tiên optional chaining (`inputRef.current?.value`) để code của bạn luôn an toàn. Toán tử non-null assertion (`inputRef.current!.value`) sẽ tắt việc kiểm tra này nhưng đồng thời loại bỏ lưới an toàn — chỉ dùng nó khi bạn chắc chắn phần tử đã được mount.

### B. Giá trị có thể thay đổi (`.current` ghi-được)
Nếu bạn đang lưu một giá trị tồn tại lâu dài mà không kích hoạt re-render, hãy cung cấp kiểu và KHÔNG truyền null:

```tsx
const renderCount = useRef<number>(0);
renderCount.current += 1; // Can write directly
```

---

## ⚡ 3. Định kiểu cho Sự kiện

Việc viết các event handler inline trong JSX không yêu cầu định kiểu thủ công vì React tự động suy luận chúng. Tuy nhiên, khi tách các event handler thành các hàm riêng biệt, bạn phải chú thích (annotate) tham số sự kiện một cách thủ công:

```tsx
import React, { useState } from 'react';

export const UserForm = () => {
  const [email, setEmail] = useState("");

  // 1. Type input change events
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  // 2. Type click events
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked coordinates:", e.clientX, e.clientY);
  };

  // 3. Type form submit events
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting:", email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={handleEmailChange} />
      <button type="button" onClick={handleButtonClick}>Log Coordinates</button>
      <button type="submit">Submit Form</button>
    </form>
  );
};
```

> [!TIP]
> Generic trên sự kiện (`<HTMLButtonElement>`, `<HTMLFormElement>`) chính là phần tử mà **listener được gắn vào** — nó quyết định `e.currentTarget` là gì. Hãy chọn nó từ phần tử mà bạn đã viết `onClick`/`onSubmit` lên đó.

---

## ⚡ 4. Định kiểu cho `useReducer`

Khi logic state trở nên phức tạp — nhiều giá trị con thay đổi cùng nhau, hoặc các chuyển trạng thái phụ thuộc vào action được thực hiện — `useReducer` gọn gàng hơn việc xoay xở với nhiều lời gọi `useState`. Với TypeScript bạn định nghĩa ba thứ: **kiểu state**, một **kiểu action dạng discriminated-union**, và một **reducer được định kiểu** trả về kiểu state.

Một *discriminated union* chính là bí quyết: mỗi action chia sẻ một trường literal `type`, nên bên trong một `switch` TypeScript tự động **thu hẹp (narrow)** action về đúng cấu trúc trong mỗi `case`. Nếu bạn đọc `action.payload` trong một case không có payload, bạn sẽ nhận được lỗi biên dịch.

```tsx
import { useReducer } from "react";

// 1. The shape of the state the reducer owns
type CounterState = {
  count: number;
};

// 2. A discriminated union of every action the reducer accepts.
//    Each member has a literal `type` and optionally a payload.
type CounterAction =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "incrementBy"; payload: number }
  | { type: "reset" };

// 3. The reducer signature is fully typed: (state, action) => state
const counterReducer = (
  state: CounterState,
  action: CounterAction
): CounterState => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    case "incrementBy":
      // TypeScript KNOWS action.payload exists here (and is a number)
      return { count: state.count + action.payload };
    case "reset":
      return { count: 0 };
    default:
      return state; // safety fallback
  }
};

export const Counter = () => {
  // state is CounterState; dispatch only accepts CounterAction members
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+1</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-1</button>
      {/* The payload is required AND must be a number — anything else errors */}
      <button onClick={() => dispatch({ type: "incrementBy", payload: 5 })}>
        +5
      </button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
};
```

> [!NOTE]
> Vì `dispatch` được định kiểu theo `CounterAction`, một lỗi gõ sai như `dispatch({ type: "incremnt" })` hoặc việc thiếu payload sẽ bị bắt ngay lập tức. Reducer và các component luôn được giữ đồng bộ với nhau — bạn chỉ cần thay đổi union ở một nơi và mọi điểm dispatch sẽ tự động cập nhật phần kiểm tra của nó.

Đối với các ứng dụng lớn hơn, hãy tách các kiểu và reducer ra một file riêng (ví dụ `reducers/counterReducer.ts`) và export chúng, sau đó import các kiểu vào nơi bạn khởi tạo state:

```typescript
// reducers/counterReducer.ts
export type CounterState = { count: number };

export type CounterAction =
  | { type: "increment" }
  | { type: "decrement" };

export const counterReducer = (
  state: CounterState,
  action: CounterAction
): CounterState => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
};
```

---

## ⚡ 5. Định kiểu cho `useEffect` (Fetch dữ liệu API)

Bản thân `useEffect` không trả về gì (hoặc một hàm cleanup), nên không có generic nào để truyền cho nó. Công việc định kiểu diễn ra xung quanh nó: bạn định kiểu cho **state** giữ dữ liệu đã fetch, và bạn await một hàm trợ giúp `async` **được định nghĩa bên trong** effect (bản thân effect callback không được là `async`, vì nó sẽ trả về một Promise trong khi React mong đợi một hàm cleanup).

```tsx
import { useState, useEffect } from "react";

// 1. Describe the exact shape of the API response you care about
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
}

export const ProductCard = () => {
  // 2. Type the state: data is a Product OR null until it arrives
  const [data, setData] = useState<Product | null>(null);

  useEffect(() => {
    // 3. Define an async function INSIDE the effect, then call it.
    //    The effect callback stays synchronous.
    const fetchData = async () => {
      try {
        const response = await fetch("https://dummyjson.com/products/1");
        const result: Product = await response.json(); // assert the shape
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // 4. Empty dependency array → run once on mount

  // 5. Guard the render: data may still be null
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <p>ID: {data.id}</p>
      <p>{data.title}</p>
      <p>${data.price}</p>
      <img src={data.thumbnail} alt={data.title} />
    </div>
  );
};
```

> [!WARNING]
> **Không** viết `useEffect(async () => { ... }, [])`. Một hàm `async` luôn trả về một Promise, nhưng React mong đợi một effect trả về hoặc không gì cả hoặc một hàm cleanup. Hãy định nghĩa hàm trợ giúp async bên trong và gọi nó, như minh họa ở trên.

**Mảng dependency** cũng liên quan đến kiểu: mọi giá trị từ props hoặc state mà effect đọc đều nên được liệt kê trong đó. Khi TypeScript và quy tắc ESLint `react-hooks` kết hợp với nhau, một dependency bị bỏ quên sẽ bị cảnh báo, nhờ đó effect của bạn không bao giờ đọc phải một giá trị cũ (stale).

---

## ⚡ 6. Định kiểu cho Context API

Context chia sẻ giá trị xuyên suốt cây component mà không cần prop-drilling. Với TypeScript bạn truyền một generic cho `createContext`, định kiểu cho value của Provider, và — quan trọng nhất — viết một **consumer hook an toàn** ném ra một lỗi rõ ràng khi một component đọc context bên ngoài Provider của nó. Việc ném lỗi đó cũng *thu hẹp kiểu để loại bỏ `undefined`*, nên các consumer nhận được một giá trị đã được định kiểu, không bao giờ là null, mà không cần kiểm tra thêm.

```tsx
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from "react";

// 1. The contract every consumer can rely on
interface CounterContextProps {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// 2. createContext generic. Start as `undefined` so we can detect
//    "used outside a Provider" instead of silently returning a fake default.
const CounterContext = createContext<CounterContextProps | undefined>(
  undefined
);

// 3. Typed Provider. children is typed with ReactNode.
export const CounterProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);

  // The value object must satisfy CounterContextProps
  return (
    <CounterContext.Provider value={{ count, increment, decrement }}>
      {children}
    </CounterContext.Provider>
  );
};

// 4. Safe-consumer helper: throws outside the Provider, and the throw
//    NARROWS the type so the return value is never undefined.
export const useCounter = (): CounterContextProps => {
  const context = useContext(CounterContext);
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return context; // typed as CounterContextProps (no undefined)
};
```

Việc sử dụng nó vẫn gọn gàng — không cần kiểm tra null, autocomplete đầy đủ:

```tsx
import { useCounter } from "./CounterContext";

export const CounterDisplay = () => {
  // count/increment/decrement are fully typed and guaranteed present
  const { count, increment, decrement } = useCounter();

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
};
```

Bọc phần cây component cần đến giá trị đó:

```tsx
import { CounterProvider } from "./CounterContext";
import { CounterDisplay } from "./CounterDisplay";

export const App = () => (
  <CounterProvider>
    <CounterDisplay />
  </CounterProvider>
);
```

> [!NOTE]
> Việc khởi tạo context là `undefined` là có chủ đích. Nó cho phép hook `useCounter` phát hiện việc dùng sai và báo lỗi với một thông báo dễ đọc ngay trong quá trình phát triển, thay vì để các component render với một giá trị mặc định giả vô nghĩa mà chỉ gây ra lỗi về sau.

---

## 🧭 useState vs useReducer vs Context — Khi nào dùng cái nào

Ba công cụ này trả lời những câu hỏi khác nhau: *các chuyển trạng thái của tôi phức tạp đến mức nào?* và *state này cần đi xa đến đâu?*

| Tiêu chí | `useState` | `useReducer` | Context API |
| --- | --- | --- | --- |
| Phù hợp nhất cho | Các giá trị đơn giản, độc lập | Các chuyển trạng thái phức tạp / nhiều giá trị liên quan | Chia sẻ state qua nhiều component |
| Cấu trúc state | Kiểu nguyên thủy hoặc object nhỏ | Object với nhiều trường thay đổi cùng nhau | Bất kỳ giá trị nào bạn phải tránh prop-drilling |
| Cách cập nhật | Gọi setter trực tiếp | `dispatch(action)` với một reducer được định kiểu | Provider cung cấp giá trị + các hàm cập nhật |
| Trọng tâm TypeScript | Generic khi không suy luận được | Kiểu state + các action discriminated-union | Generic `createContext` + consumer hook an toàn |
| Phạm vi | Cục bộ trong một component | Cục bộ trong một component | Toàn ứng dụng / toàn nhánh cây |
| Hãy dùng khi | Một toggle, một text field, một counter | Một form wizard, undo/redo, một giỏ hàng | Theme, người dùng auth, một counter toàn cục |

Một quy tắc kinh nghiệm tốt: hãy bắt đầu với `useState`. Nâng cấp lên `useReducer` khi logic cập nhật trở nên nhiều nhánh hoặc nhiều giá trị thay đổi đồng bộ với nhau. Chỉ tìm đến **Context** khi các component *không liên quan, ở xa nhau* cần cùng một state — và lưu ý rằng bạn có thể đặt `state` và `dispatch` của một `useReducer` *bên trong* một Context cho state phức tạp toàn ứng dụng.

---

## 🧠 Kiểm tra Kiến thức của Bạn

Trả lời các câu hỏi này để kiểm tra mức độ hiểu của bạn về hook và sự kiện. Nhấn **Reveal Answer** để xác minh.

### 1. Khi nào bạn cần truyền tham số kiểu generic cho `useState`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn cần truyền tham số kiểu generic (ví dụ `useState<Type>()`) khi kiểu không thể được suy luận chính xác từ giá trị khởi tạo. Điều này xảy ra khi:
  1. Giá trị khởi tạo là `null` hoặc `undefined` (ví dụ, fetch dữ liệu sau này).
  2. State giữ một union của nhiều kiểu khả dĩ (ví dụ, `useState<"light" | "dark">("light")`).
  3. State quản lý các object phức tạp hoặc mảng các phần tử.
</details>

### 2. Tại sao kiểu action dạng discriminated-union lại hữu ích đến vậy với `useReducer`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một discriminated union cho mỗi action một trường literal `type` dùng chung (ví dụ `{ type: "increment" }` so với `{ type: "incrementBy"; payload: number }`). Bên trong `switch (action.type)` của reducer, TypeScript **thu hẹp** action về đúng member cho mỗi `case`, nên nó biết chính xác những trường bổ sung nào (như `payload`) tồn tại. Điều này có nghĩa là:
  - Đọc một `payload` trong một case không có nó là một lỗi biên dịch.
  - `dispatch` từ chối các kiểu action không xác định và các payload thiếu/sai.
  - Reducer và mọi điểm dispatch tự động được giữ đồng bộ với nhau khi bạn chỉnh sửa union.
</details>

### 3. Tại sao hàm `async` phải nằm *bên trong* `useEffect` thay vì biến chính effect callback thành `async`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một hàm `async` luôn trả về một Promise. React mong đợi effect callback trả về hoặc không gì cả hoặc một **hàm cleanup** — không bao giờ là một Promise. Nếu bạn viết `useEffect(async () => {...}, [])`, React sẽ nhận một Promise làm "cleanup", điều này không đúng (và TypeScript báo lỗi). Cách khắc phục là định nghĩa một hàm trợ giúp `async` (ví dụ `fetchData`) bên trong effect và gọi nó một cách đồng bộ, giữ cho chính effect callback không phải là async.
</details>

### 4. Tại sao chúng ta khởi tạo `createContext` với `undefined` và viết một consumer hook an toàn ném lỗi?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khởi tạo với `undefined` (ví dụ `createContext<CounterContextProps | undefined>(undefined)`) cho phép chúng ta phát hiện khi một component đọc context **bên ngoài Provider của nó**. Consumer hook (`useCounter`) kiểm tra `undefined` và `throw` một lỗi rõ ràng như `"useCounter must be used within a CounterProvider"`. Thêm vào đó, việc `throw` còn giúp **thu hẹp kiểu** — sau khi qua bước kiểm tra, TypeScript biết giá trị là `CounterContextProps`, không phải `undefined`, nên các consumer nhận được một giá trị đã được định kiểu đầy đủ mà không cần kiểm tra null thêm. Nếu dùng một giá trị mặc định giả thay thế, các lỗi sẽ âm thầm được render ra mà không bị phát hiện.
</details>

### 5. Bạn có một text input đơn lẻ và một form wizard nhiều bước với các trường dùng chung, phụ thuộc lẫn nhau. Hook nào phù hợp với từng cái, và tại sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Text input đơn lẻ → `useState`.** Nó là một giá trị đơn giản, độc lập; một setter trực tiếp là cách ít rườm rà nhất.
  - **Wizard nhiều bước → `useReducer`.** Nhiều trường thay đổi cùng nhau và các chuyển trạng thái (bước tiếp theo, validate, reset) nhiều nhánh. Một reducer được định kiểu với một kiểu action discriminated-union tập trung hóa logic đó và giữ cho mọi chuyển trạng thái an toàn về kiểu.
  
  Nếu các giá trị wizard đó cũng cần được đọc bởi các component ở xa, không liên quan, bạn sẽ nâng `useReducer` lên một **Context** để nó có thể được chia sẻ mà không cần prop-drilling.
</details>

---

## 💻 Bài tập Thực hành

Áp dụng những gì bạn đã học trong môi trường dự án của bạn:

### 🛠️ Bài tập 1: Bộ theo dõi Tọa độ Canvas & Form được Định kiểu
1. Tạo một component `CoordinatesForm.tsx` (đảm bảo nó dùng phần mở rộng `.tsx`).
2. Thiết lập state theo dõi tọa độ: `const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)`.
3. Render một container `<div>` đóng vai trò là vùng theo dõi. Theo dõi chuyển động chuột trên container bằng cách dùng:
   ```tsx
   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   ```
4. Render tọa độ lên màn hình. Bao gồm một input field để nhập một nhãn (label), bắt giá trị nhập qua một hàm `onChange` được định kiểu (`React.ChangeEvent<HTMLInputElement>`).
5. Thêm một `useRef<HTMLInputElement>(null)` và một nút "Focus label" có `onClick` gọi `inputRef.current?.focus()`.
6. Xác minh rằng VS Code cung cấp autocomplete đầy đủ trên các biến sự kiện của bạn và rằng `coords` được thu hẹp đúng cách trước khi bạn đọc `coords.x`.

### 🛠️ Bài tập 2: Giỏ hàng với Reducer được Định kiểu + Context
Xây dựng một giỏ hàng nhỏ kết hợp `useReducer` và Context.

1. Tạo `CartContext.tsx`. Định nghĩa:
   - Một kiểu state: `type CartState = { items: { id: number; name: string }[] }`.
   - Một kiểu action dạng discriminated-union:
     ```tsx
     type CartAction =
       | { type: "add"; payload: { id: number; name: string } }
       | { type: "remove"; payload: { id: number } }
       | { type: "clear" };
     ```
   - Một reducer được định kiểu `cartReducer = (state: CartState, action: CartAction): CartState => { ... }` xử lý cả ba case cộng với một `default`.
2. Tạo context với `createContext<{ state: CartState; dispatch: React.Dispatch<CartAction> } | undefined>(undefined)`.
3. Xây dựng một `CartProvider` được định kiểu (`FC<{ children: ReactNode }>`) gọi `useReducer(cartReducer, { items: [] })` và cung cấp `{ state, dispatch }`.
4. Viết một consumer hook an toàn `useCart()` ném `"useCart must be used within a CartProvider"` khi được dùng bên ngoài Provider, và trả về giá trị đã được thu hẹp (không-`undefined`).
5. Trong một component `CartView`, dùng `useCart()` để liệt kê các item và gắn các nút để dispatch `add`, `remove`, và `clear`. Xác nhận rằng TypeScript chặn một lệnh dispatch với `payload` bị thiếu hoặc sai.

### 🛠️ Bài tập 3: Fetch Dữ liệu được Định kiểu với `useEffect`
1. Tạo `UserList.tsx`. Định nghĩa một interface `User { id: number; name: string; username: string; email: string; phone: string }`.
2. Thêm ba state được định kiểu: `useState<User[]>([])`, `useState<boolean>(true)` cho loading, và `useState<string | null>(null)` cho một lỗi.
3. Bên trong `useEffect(() => { ... }, [])`, định nghĩa một hàm trợ giúp `async` `fetchUsers` fetch `https://jsonplaceholder.typicode.com/users`, kiểm tra `response.ok`, gán `const data: User[] = await response.json()`, và lưu nó. Xử lý lỗi trong một `catch` (dùng `error instanceof Error ? error.message : "An error occurred"`) và đặt loading thành `false` trong `finally`.
4. Render `Loading...` trong khi đang loading, thông báo lỗi nếu có, ngược lại một `<table>` các user được key bằng `user.id`.
5. Xác nhận rằng không có kiểu `any` nào và rằng việc xóa một cột khỏi interface `User` tạo ra một lỗi biên dịch tại nơi bạn render nó.
