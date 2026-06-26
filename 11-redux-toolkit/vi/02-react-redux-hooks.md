# React-Redux: Provider & Typed Hooks 🪝

Trong bài học trước, bạn đã xây dựng một Redux store với `configureStore` và chia state thành các slice bằng `createSlice`. Tuy nhiên, store đó chỉ là một object JavaScript thuần nằm bên ngoài React. Bài học này chính là cây cầu nối: nó cho thấy cách package **`react-redux`** kết nối store đó *vào* cây component của bạn để bất kỳ component nào cũng có thể **đọc** state và **dispatch** các action — và cách làm điều đó với sự an toàn TypeScript trọn vẹn, từ đầu đến cuối, trong React 19.

Bạn sẽ học ba thành phần làm cho Redux trở nên tự nhiên với React: `<Provider>` để tiêm store vào gốc cây, hook `useSelector` để subscribe một component vào một mảnh state, và hook `useDispatch` cho phép một component gửi đi các action. Sau đó, chúng ta nâng cấp từ JavaScript thuần mà khóa học ghi hình lên mẫu (pattern) cấp độ production mà mọi codebase Redux Toolkit hiện đại đều dùng: một `RootState` được định kiểu, một `AppDispatch` được định kiểu, và các hook **`useAppSelector` / `useAppDispatch` đã được định kiểu sẵn** nghĩa là bạn sẽ không bao giờ phải tự chú thích (annotate) `state` bằng tay nữa.

> [!NOTE]
> **Nền tảng & những gì là hoàn toàn mới.** Khóa học ghi hình tài liệu này bằng JavaScript thuần: bọc `<App />` trong `<Provider store={store}>`, đọc bằng `useSelector((state) => state.counter.value)`, và dispatch bằng `useDispatch()`. Mọi thứ từ phần **"Typed Setup"** trở đi (`RootState`, `AppDispatch`, các hook tùy chỉnh `useAppSelector`/`useAppDispatch`, và các selector được memoize với `createSelector`) là **best practice TypeScript hoàn toàn mới** được thêm vào bên trên những gì giảng viên trình bày. Đó là cách tiếp cận được khuyến nghị chính thức trong tài liệu Redux Toolkit + React-Redux v9 hiện tại. **RTK Query được cố ý không đề cập ở đây — nó nằm trong bài 03.**

---

## 🌟 Khái niệm & Tổng quan

Redux store là một object duy nhất, dùng chung cho toàn ứng dụng, nắm giữ state của bạn. Các component React, theo mặc định, không hề biết gì về nó. Thư viện `react-redux` là **bộ chuyển đổi (adapter)** kết nối hai thế giới đó:

- **`<Provider store={store}>`** đặt store vào React Context ở vị trí trên cùng của cây. Mọi component con cháu — dù sâu đến đâu — giờ đây đều có thể truy cập store mà không cần prop drilling.
- **`useSelector`** là cách một component **đọc**. Bạn truyền cho nó một hàm chọn đúng mảnh state mà bạn quan tâm; component chỉ re-render khi *mảnh đó* thay đổi.
- **`useDispatch`** là cách một component **ghi**. Nó trả về hàm `dispatch` của store, hàm mà bạn gọi cùng với một action được tạo bởi slice của bạn.

### 🛠️ Một ẩn dụ đời thực: hệ thống liên lạc nội bộ của văn phòng

Hãy hình dung một tòa nhà văn phòng lớn. **Store** là hệ thống loa phát thanh/liên lạc nội bộ (PA/intercom) trung tâm đang hoạt động dưới tầng hầm — nó nắm giữ các thông báo hiện tại (state).

- `<Provider>` là hành động **đấu nối mọi căn phòng vào hệ thống liên lạc đó**. Một khi tòa nhà đã được đấu nối, bất kỳ phòng nào cũng có thể nghe hoặc nói; không ai phải kéo một sợi dây riêng (prop) từ tầng hầm đến từng bàn làm việc.
- `useSelector` là một **tai nghe được chỉnh sang một kênh duy nhất**. Bạn không bị dội bom bởi mọi thông báo trong tòa nhà — bạn subscribe kênh "Số liệu bán hàng" và chỉ chú ý khi *con số đó* thay đổi.
- `useDispatch` là **micro**. Bạn nhấn nút và phát đi một thông điệp có cấu trúc — "INCREMENT bộ đếm" — và hệ thống dưới tầng hầm (các reducer) quyết định thông điệp đó cập nhật các thông báo như thế nào.

Tai nghe (đọc) và micro (ghi) là hai công cụ tách biệt một cách có chủ đích. Bạn không bao giờ mutate bảng thông báo bằng cách đi xuống tầng hầm và viết nguệch ngoạc lên đó — bạn *nói một action vào micro*, và hệ thống cập nhật bảng thông báo cho tất cả mọi người.

### Các thành phần liên hệ với nhau như thế nào

```text
            ┌─────────────────────────────────────────────┐
            │  store  (configureStore)                     │
            │   state = { counter: { value: 0 }, ... }     │
            │   dispatch(action) -> reducers -> new state  │
            └───────────────▲──────────────────┬───────────┘
                            │                  │
                 reads via  │                  │  writes via
              useSelector   │                  │  useDispatch
                            │                  ▼
        ┌───────────────────┴──────────────────────────────┐
        │  <Provider store={store}>   (React Context root)  │
        │     └── <App>                                     │
        │           └── <Counter>  ← reads value, dispatches│
        └───────────────────────────────────────────────────┘
```

| Mối quan tâm | `useState` thuần | Redux + react-redux |
| --- | --- | --- |
| State nằm ở đâu | Bên trong một component | Một store trung tâm, dùng chung toàn app |
| Chia sẻ xuyên suốt cây | Lift state up + prop drill | `<Provider>` + `useSelector` ở bất cứ đâu |
| Đọc state | `const [v] = useState()` | `useSelector(state => state.x)` |
| Cập nhật state | `setV(next)` | `dispatch(action(payload))` |
| Kích hoạt re-render | Lời gọi `setState` | Tham chiếu của một mảnh state đã chọn thay đổi |
| Logic xuyên suốt (cross-cutting) | Callback thủ công | Reducer + action tập trung |

---

## ⚡ 1. Bọc App trong `<Provider>`

Store được tạo một lần (bài 01). Để phơi bày nó cho React, hãy import `Provider` từ `react-redux` và bọc component gốc của bạn. Trong một app React 19 + Vite, việc này diễn ra trong `src/main.tsx`.

Trước tiên, đây là store và slice mà chúng ta đang kết nối (tóm tắt từ bài 01, giờ đã được định kiểu đầy đủ):

```typescript
// src/features/counter/counterSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// The shape of THIS slice's state.
interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    // No payload: just a command.
    increment: (state) => {
      // Immer lets us "mutate" safely — RTK produces a new immutable state.
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // WITH a payload: PayloadAction<number> types `action.payload` as a number.
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// Action creators are generated for each reducer key.
export const { increment, decrement, incrementByAmount, reset } =
  counterSlice.actions;

// The reducer goes into the store.
export default counterSlice.reducer;
```

```typescript
// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    // The key "counter" is how we reach this slice in selectors:
    // state.counter.value
    counter: counterReducer,
  },
});
```

Bây giờ hãy kết nối nó vào React ở gốc cây:

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* Everything inside <Provider> can now read & dispatch. */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
```

> [!TIP]
> Bọc app **càng cao càng tốt** — ngay tại gốc, bao quanh `<App />`. Không có hình phạt nào về hiệu năng cho một `<Provider>` duy nhất đặt gần đỉnh cây, và đặt nó ở đó đảm bảo mọi route, modal, và component được tải lười (lazily-loaded) đều có thể truy cập store. Bạn không cần (và không nên thêm) nhiều `<Provider>` cho cùng một store.

---

## 🧩 2. Đọc & Dispatch (đoạn JavaScript mà khóa học trình bày)

Đây chính xác là mẫu được ghi hình trong các bài học, viết theo dạng chưa định kiểu của `react-redux`. Nó hoạt động, và nó là mô hình tư duy đúng đắn để bắt đầu trước khi chúng ta thêm kiểu (type).

```jsx
// src/components/Counter.jsx  — untyped, as shown in the course
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "../features/counter/counterSlice";

export const Counter = () => {
  // READ: subscribe to one narrow slice of state.
  // This component re-renders only when state.counter.value changes.
  const count = useSelector((state) => state.counter.value);

  // WRITE: get the dispatch function.
  const dispatch = useDispatch();

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Count: {count}</h2>
      {/* Dispatch an ACTION (the result of calling the action creator). */}
      <button onClick={() => dispatch(increment())}>+ Increment</button>
      <button onClick={() => dispatch(decrement())}>- Decrement</button>
    </div>
  );
};
```

Hai chi tiết từ bản ghi hình thường khiến mọi người vấp ngã:

1. **Bạn dispatch *kết quả* của việc gọi action creator.** `increment` là một hàm; `dispatch(increment())` gửi đi object action mà nó trả về. Viết `onClick={dispatch(increment())}` (không có arrow function) sẽ kích hoạt nó ngay trong lúc render — luôn luôn bọc nó trong một arrow function hoặc một handler.
2. **Đường dẫn của selector phản chiếu hình dạng của store.** `state.counter.value` đọc từ key `counter` trong `configureStore({ reducer: { counter } })`, rồi đến trường `value` từ `initialState` của slice. Thay đổi key của store thì đường dẫn của selector cũng thay đổi theo.

> [!WARNING]
> Cái bẫy lớn nhất của `useSelector`: **không bao giờ trả về một object hay array literal hoàn toàn mới từ một selector**. `useSelector(state => ({ value: state.counter.value }))` tạo ra một tham chiếu object mới toanh trong *mỗi* lần dispatch trong toàn bộ app. `react-redux` so sánh kết quả theo tham chiếu (`===`), thấy một tham chiếu mới mỗi lần, và re-render component của bạn liên tục — ngay cả khi không có gì liên quan thay đổi. Hãy chọn các giá trị nguyên thủy (primitive), hoặc memoize (xem mục 5).

---

## ⚡ 3. Thiết lập định kiểu (best practice hoàn toàn mới)

Đoạn JS thuần ở trên có một cái giá tiềm ẩn trong TypeScript: bên trong `useSelector((state) => state.counter.value)`, `state` được định kiểu là `unknown`, nên bạn không có autocomplete và không có sự an toàn tại thời điểm biên dịch (compile-time) trên đường dẫn. Giải pháp là hai kiểu được suy ra (derived type) cộng với hai hook đã định kiểu sẵn. **Định nghĩa chúng một lần, import chúng ở mọi nơi.**

### 🛠️ Bước 1 — Suy ra `RootState` và `AppDispatch` từ store

```typescript
// src/app/store.ts  (extended)
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// Infer the `{ counter: CounterState, ... }` shape directly from the store.
// As you add slices, RootState updates automatically — no manual editing.
export type RootState = ReturnType<typeof store.getState>;

// The exact dispatch type, including any middleware-enhanced dispatch
// (e.g. thunks). Derived from the store, never hand-written.
export type AppDispatch = typeof store.dispatch;
```

> [!NOTE]
> Lưu ý rằng cả hai kiểu đều được **suy ra từ store**, không phải khai báo bằng tay. `ReturnType<typeof store.getState>` nói rằng "bất cứ thứ gì `getState()` trả về chính là `RootState` của tôi." Đây là thói quen quan trọng bậc nhất trong Redux định kiểu: store là nguồn chân lý duy nhất (source of truth), và các kiểu đi theo nó. Thêm một slice `user` vào ngày mai và `RootState` sẽ mọc thêm một trường `user` mà không tốn công sức.

### 🛠️ Bước 2 — Tạo các hook đã định kiểu sẵn

```typescript
// src/app/hooks.ts
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Pre-typed dispatch: knows about your middleware (thunks, etc.).
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

// Pre-typed selector: `state` is automatically RootState — no annotation needed.
export const useAppSelector = useSelector.withTypes<RootState>();
```

> [!TIP]
> `useDispatch.withTypes<AppDispatch>()` và `useSelector.withTypes<RootState>()` là API hiện đại của react-redux **v9**. Nếu bạn đang ở một dự án v8 cũ hơn, bạn sẽ thấy dạng cũ tương đương:
> ```typescript
> export const useAppDispatch: () => AppDispatch = useDispatch;
> export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
> ```
> Cả hai đều cho ra cùng một kết quả — các hook mà `state` đã sẵn là `RootState`. Hãy ưu tiên `.withTypes()` trên v9+.

### 🛠️ Bước 3 — Dùng các hook đã định kiểu trong component

```tsx
// src/components/Counter.tsx — fully typed React 19 component
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from "../features/counter/counterSlice";

export function Counter() {
  // `state` is inferred as RootState — you get autocomplete on `.counter.value`
  // and a compile error if you typo the path.
  const count = useAppSelector((state) => state.counter.value);

  // `dispatch` is AppDispatch — it accepts your slice actions (and thunks).
  const dispatch = useAppDispatch();

  return (
    <section style={{ padding: 20, textAlign: "center" }}>
      <h2>Count: {count}</h2>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => dispatch(decrement())}>-1</button>
        <button onClick={() => dispatch(increment())}>+1</button>
        {/* Dispatching an action WITH a payload — typed as number. */}
        <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
        <button onClick={() => dispatch(reset())}>Reset</button>
      </div>
    </section>
  );
}
```

Nếu bạn viết `dispatch(incrementByAmount("5"))`, TypeScript sẽ từ chối nó bởi vì `PayloadAction<number>` truyền xuyên suốt qua chữ ký (signature) của `incrementByAmount`. Đó chính là toàn bộ phần thưởng của thiết lập định kiểu: kiểu của payload của action được thực thi ngay tại điểm gọi (call site).

### So sánh nhanh hook thuần và hook đã định kiểu

| | Thuần (mặc định của `react-redux`) | Đã định kiểu sẵn (`useAppSelector` / `useAppDispatch`) |
| --- | --- | --- |
| `state` trong selector | `unknown` (hoặc `any`) | `RootState` một cách tự động |
| Autocomplete trên đường dẫn | Không có | Đầy đủ, từ hình dạng store thực tế |
| Gõ sai `state.countr.value` | Im lặng | Lỗi biên dịch |
| Dispatch sai payload | Được cho phép | Lỗi biên dịch |
| Định nghĩa ở đâu | Import từ `react-redux` | Import từ `app/hooks.ts` của bạn |
| Boilerplate mỗi component | Chú thích `state` mỗi lần | Không có — import và dùng |

---

## ⚡ 4. Dispatch các Action của `createSlice` cùng với Payload

Mỗi key trong `reducers` của một slice tạo ra một **action creator** cùng tên. Gọi nó trả về một object action thuần `{ type, payload }`; truyền cái đó cho `dispatch` sẽ chạy reducer tương ứng. Đây là một slice phong phú hơn — một danh sách todo — để minh họa các payload có hình dạng khác nhau.

```typescript
// src/features/todos/todosSlice.ts
import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

interface TodosState {
  items: Todo[];
}

const initialState: TodosState = {
  items: [],
};

export const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    // Object payload. We use `prepare` so callers pass just the text
    // while the reducer receives a fully-built Todo.
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: { id: nanoid(), text, done: false } as Todo,
      }),
    },
    // String payload (the id to toggle).
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) {
        todo.done = !todo.done;
      }
    },
    // String payload (the id to remove).
    removeTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addTodo, toggleTodo, removeTodo } = todosSlice.actions;
export default todosSlice.reducer;
```

Đăng ký nó trong store (`RootState` tự động nhận ra nó):

```typescript
// src/app/store.ts  (with the todos slice added)
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import todosReducer from "../features/todos/todosSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Tiêu thụ nó trong một component:

```tsx
// src/components/TodoList.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addTodo, toggleTodo, removeTodo } from "../features/todos/todosSlice";

export function TodoList() {
  const todos = useAppSelector((state) => state.todos.items);
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    // `prepare` means we pass just the string; the id/done are built for us.
    dispatch(addTodo(text));
    setDraft("");
  };

  return (
    <section style={{ maxWidth: 420, margin: "0 auto" }}>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What needs doing?"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ display: "flex", gap: 8, padding: "4px 0" }}>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(removeTodo(todo.id))}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

---

## ⚡ 5. Best Practice cho Selector

Selector là nơi quyết định thắng hay thua về hiệu năng của Redux. Hai quy tắc bao quát hầu hết các trường hợp: **chọn hẹp**, và **memoize bất cứ thứ gì được dẫn xuất (derived)**.

### 🧩 Quy tắc 1 — Chọn giá trị hẹp nhất

```tsx
// ✅ GOOD: select one primitive. Re-renders only when that number changes.
const count = useAppSelector((state) => state.counter.value);

// ✅ GOOD: select one already-stable array reference.
const todos = useAppSelector((state) => state.todos.items);

// ❌ BAD: new object literal every run → re-renders on EVERY dispatch.
const { value } = useAppSelector((state) => ({ value: state.counter.value }));
```

### 🧩 Quy tắc 2 — Memoize dữ liệu dẫn xuất với `createSelector`

Khi một selector *tính toán* một thứ gì đó (lọc, đếm, map), kết quả là một giá trị mới trong mỗi lần chạy. Trả về một array mới từ `useAppSelector` sẽ re-render component trong mỗi lần dispatch. `createSelector` từ Redux Toolkit (được re-export từ Reselect) cache đầu ra: nó chỉ tính toán lại khi các **đầu vào** của nó thay đổi, và trả về *cùng một tham chiếu* trong các trường hợp khác.

```typescript
// src/features/todos/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// Input selectors: cheap, return existing references straight from state.
const selectTodoItems = (state: RootState) => state.todos.items;

// Output selector: the expensive/derived computation is memoized.
// Recomputes ONLY when `state.todos.items` changes reference.
export const selectActiveTodos = createSelector([selectTodoItems], (items) =>
  items.filter((todo) => !todo.done),
);

export const selectCompletedCount = createSelector(
  [selectTodoItems],
  (items) => items.filter((todo) => todo.done).length,
);
```

```tsx
// Using a memoized selector — same reference between unrelated dispatches.
import { useAppSelector } from "../app/hooks";
import { selectActiveTodos, selectCompletedCount } from "../features/todos/selectors";

export function TodoSummary() {
  const active = useAppSelector(selectActiveTodos);
  const doneCount = useAppSelector(selectCompletedCount);

  return (
    <p>
      {active.length} remaining · {doneCount} completed
    </p>
  );
}
```

> [!WARNING]
> Một lỗi phổ biến là viết thẳng (inline) phép dẫn xuất: `useAppSelector(state => state.todos.items.filter(t => !t.done))`. `.filter()` trả về một **array mới mỗi lần**, nên component re-render trong mỗi lần dispatch ở bất cứ đâu trong app, ngay cả khi todos không thay đổi. Hãy chuyển các selection dẫn xuất/tính toán vào một `createSelector`, hoặc memoize chúng — không bao giờ tính toán array/object mới ngay tại chỗ (inline) trong `useSelector`.

> [!TIP]
> Đối với các selector nhận một đối số (ví dụ "todos cho dự án X"), một `createSelector` đơn lẻ chia sẻ chung một ô cache và bị xung đột (thrash) khi được gọi với các đối số khác nhau từ các component khác nhau. Hãy dùng `createSelector` với một đầu vào có tham số (parameterized input), hoặc mẫu per-instance của RTK, để mỗi đối số có được kết quả memoize riêng của nó. Với các app đơn giản, các selector hẹp thuần túy là hoàn toàn ổn — hãy dùng đến memoization khi bạn đo lường được một vấn đề re-render thực sự.

---

## 🧠 Kiểm tra kiến thức

### 1. `<Provider store={store}>` thực sự làm gì, và nó nên đặt ở đâu?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `<Provider>` đặt Redux store vào React Context để mọi component con cháu có thể truy cập nó thông qua các hook của react-redux (`useSelector`, `useDispatch`). Nếu không có nó, các hook đó sẽ ném ra lỗi "could not find react-redux context value." Nó nên bọc app của bạn **càng cao càng tốt** — thường là quanh `<App />` trong `main.tsx` — để mọi route, modal, và component được tải lười đều có thể truy cập store duy nhất. Bạn dùng đúng một `<Provider>` cho mỗi store, đặt gần gốc cây.
</details>

### 2. Tại sao chúng ta viết `type RootState = ReturnType<typeof store.getState>` thay vì khai báo hình dạng state bằng tay?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Bởi vì store là nguồn chân lý duy nhất. `ReturnType<typeof store.getState>` **suy ra** toàn bộ hình dạng `{ counter: ..., todos: ... }` trực tiếp từ các reducer đã cấu hình. Khi bạn thêm hoặc bớt một slice, `RootState` tự động cập nhật mà không cần chỉnh sửa thủ công nào. Khai báo kiểu bằng tay sẽ trùng lặp thông tin và lệch khỏi đồng bộ ngay khoảnh khắc ai đó thêm một slice. Cùng nguyên tắc đó cho chúng ta `AppDispatch = typeof store.dispatch`, vốn nắm bắt chính xác dispatch được tăng cường bởi middleware (như thunks).
</details>

### 3. Sự khác biệt giữa `useSelector` từ `react-redux` và `useAppSelector` tùy chỉnh là gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Chúng giống hệt nhau về mặt chức năng, nhưng `useAppSelector` đã được **định kiểu sẵn**: tạo qua `useSelector.withTypes<RootState>()`. Với hook thuần, đối số `state` là `unknown`, nên bạn sẽ phải chú thích nó (`(state: RootState) => ...`) trong mỗi component và bạn sẽ không có autocomplete nếu không làm vậy. `useAppSelector` nướng sẵn `RootState` vào một lần, nên `state` được định kiểu đúng ở mọi nơi với autocomplete đầy đủ và không cần chú thích lặp lại. Điều tương tự áp dụng cho `useAppDispatch` mang theo kiểu `AppDispatch`.
</details>

### 4. Tại sao trả về `{ value: state.counter.value }` từ một selector lại gây hại cho hiệu năng?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `useSelector` quyết định có re-render hay không bằng cách so sánh giá trị trả về của selector với giá trị trước đó dùng phép so sánh tham chiếu nghiêm ngặt (`===`). Một object/array **literal** tạo ra một tham chiếu mới toanh trong mỗi lần chạy, nên phép so sánh luôn luôn là "khác nhau," và component re-render trong *mỗi* action được dispatch ở bất cứ đâu trong app — ngay cả khi dữ liệu nền tảng không bao giờ thay đổi. Cách khắc phục: chọn các giá trị nguyên thủy một cách riêng lẻ, hoặc dùng một `createSelector` được memoize để trả về một tham chiếu ổn định khi các đầu vào không đổi.
</details>

### 5. Khi nào bạn cần `createSelector`, và nó memoize cái gì?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Bạn cần nó bất cứ khi nào một selector **dẫn xuất** một giá trị mới — lọc, map, tính tổng — bởi vì điều đó tạo ra một tham chiếu array/object mới trong mỗi lần gọi và sẽ kích hoạt các lần re-render không cần thiết. `createSelector` nhận một hoặc nhiều *input selector* cộng với một *hàm đầu ra (output function)*. Nó cache đầu ra và chỉ tính toán lại khi các đầu vào thay đổi tham chiếu; nếu không, nó trả về đúng cùng một tham chiếu, nên phép kiểm tra bằng nhau (equality check) của `useSelector` vượt qua và component không re-render. Các selector hẹp thuần túy trả về các tham chiếu state hiện có thì không cần đến nó.
</details>

---

## 💻 Bài tập thực hành

### 🛠️ Bài tập 1: Counter định kiểu từ đầu
Xây dựng một feature counter được định kiểu đầy đủ từ đầu đến cuối.

1. Tạo `src/features/counter/counterSlice.ts` với một `CounterState` (`{ value: number }`), `initialState`, và các reducer `increment`, `decrement`, `incrementByAmount` (payload `number`), và `reset`.
2. Trong `src/app/store.ts`, đăng ký reducer dưới key `counter`, rồi export `RootState` và `AppDispatch` được suy ra từ store.
3. Trong `src/app/hooks.ts`, tạo `useAppSelector` và `useAppDispatch` với `.withTypes<...>()`.
4. Bọc `<App />` trong `<Provider store={store}>` bên trong `main.tsx`.
5. Xây dựng `Counter.tsx` dùng các hook đã định kiểu. Thêm một input number được gắn (bound) với `useState` cục bộ, và một nút "Add amount" để dispatch `incrementByAmount(Number(input))`.
6. Xác nhận rằng TypeScript từ chối `dispatch(incrementByAmount("oops"))`.

Khởi đầu:

```tsx
// src/components/Counter.tsx
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
} from "../features/counter/counterSlice";

export function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const [amount, setAmount] = useState("2");

  // TODO: render count, +/- buttons, the amount input,
  // an "Add amount" button dispatching incrementByAmount(Number(amount)),
  // and a Reset button.
  return <div>Count: {count}</div>;
}
```

### 🛠️ Bài tập 2: Selector todo được memoize
Mở rộng slice todos từ mục 4 với các selector dẫn xuất, được memoize.

1. Tạo `src/features/todos/selectors.ts`.
2. Viết một input selector `selectTodoItems` trả về `state.todos.items`.
3. Xây dựng ba selector được memoize với `createSelector`: `selectActiveTodos` (chưa xong), `selectCompletedTodos` (đã xong), và `selectStats` trả về `{ total, active, completed }`.
4. Xây dựng một `TodoSummary.tsx` tiêu thụ `selectStats` qua `useAppSelector` và render ba con số đó.
5. **Kiểm chứng chiến thắng:** dispatch một action *không liên quan* (ví dụ `increment()` trên counter) lặp đi lặp lại và xác nhận `TodoSummary` **không** re-render (thêm một `console.count("TodoSummary render")`). Sau đó viết thẳng (inline) phép lọc ngay trong `useAppSelector` và quan sát rằng giờ nó re-render trong mỗi lần dispatch — chứng minh tại sao `createSelector` quan trọng.

Khởi đầu:

```typescript
// src/features/todos/selectors.ts
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

const selectTodoItems = (state: RootState) => state.todos.items;

export const selectActiveTodos = createSelector([selectTodoItems], (items) =>
  items.filter((t) => !t.done),
);

// TODO: selectCompletedTodos and selectStats ({ total, active, completed }).
export const selectStats = createSelector([selectTodoItems], (items) => ({
  total: items.length,
  active: 0, // TODO: count !done
  completed: 0, // TODO: count done
}));
```
