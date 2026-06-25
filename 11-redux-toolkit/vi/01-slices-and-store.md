# Redux Toolkit: Slice & Cấu hình Store 🔄

**Redux Toolkit (RTK)** là cách viết logic Redux hiện đại, chính thức và được khuyến nghị. Nó được tạo ra để giải quyết ba lời than phiền phổ biến về Redux truyền thống: cấu hình store phức tạp, quá nhiều mã boilerplate, và phải cấu hình nhiều package thủ công.

---

## 📖 Khái niệm & Tổng quan

**Redux** là một thư viện JavaScript mã nguồn mở để quản lý state theo cách **có thể dự đoán được (predictable)**. Từ khóa ở đây là *state*. Trong React bạn đã quản lý state với `useState`, `useReducer` và `useContext`. Redux giải quyết cùng một bài toán, nhưng ở quy mô của toàn bộ ứng dụng — một nơi trung tâm duy nhất nơi bất kỳ component nào cũng có thể đọc và cập nhật dữ liệu được chia sẻ.

**Redux Toolkit** được tài liệu chính thức mô tả là *"bộ công cụ chính thức, có quan điểm rõ ràng (opinionated), tích hợp sẵn mọi thứ để phát triển Redux hiệu quả."* Nói một cách đơn giản: bên dưới nó vẫn là Redux, nhưng đi kèm các giá trị mặc định hợp lý và các hàm hỗ trợ để bạn viết ít mã hơn rất nhiều.

> [!IMPORTANT]
> Một quan niệm sai lầm rất phổ biến là **React và Redux là cùng một thứ**. Không phải vậy. React là một thư viện UI; Redux là một thư viện quản lý state độc lập *có thể* được dùng với React (thông qua bindings `react-redux`) — hoặc với Angular, Vue, hay JavaScript thuần. Xuyên suốt bài học này, mỗi khi nói "Redux" chúng ta đều ngụ ý **Redux Toolkit**.

> [!NOTE]
> Redux Toolkit là cách **được khuyến nghị chính thức** để viết logic Redux ngày nay. "Redux core" truyền thống (tự tay viết các action type, action creator, và reducer dạng switch-statement) vẫn hoạt động, nhưng đội ngũ Redux nay hướng tất cả mọi người sang RTK. Bạn không nên bắt đầu một dự án mới với Redux core thuần.

> [!TIP]
> Bạn chỉ cần Redux khi state thực sự **toàn cục và được chia sẻ** xuyên suốt nhiều phần xa nhau trong cây component. Đối với state cục bộ, giới hạn trong phạm vi một component, `useState` vẫn là công cụ phù hợp. Dùng Redux quá sớm sẽ thêm những thủ tục rườm rà mà bạn không cần.

---

## 🌍 Phép ẩn dụ thực tế: Một Kho Hàng Trung Tâm

Hãy hình dung **bài toán prop-drilling** kinh điển. Component `App` của bạn giữ một số dữ liệu quan trọng, và một component `Data` lồng sâu cần đến nó:

```
App (has the data)
 └── Card
      └── User
           └── Data (needs the data)
```

Với props thuần, bạn phải luồn dữ liệu qua `Card → User → Data` mặc dù `Card` và `User` không quan tâm đến nó. Sự lặp lại đó vừa mong manh vừa nhiễu. Context API có giúp ích, nhưng ở quy mô của một công ty như Google hay Facebook — với *vô số* component — việc cắm provider ở khắp nơi trở nên cồng kềnh khó quản.

Redux Toolkit dùng một cách tiếp cận khác. Hãy hình dung một **kho hàng trung tâm (the Store)** nằm *bên ngoài* cây component của bạn. Bạn đặt hàng tồn kho được chia sẻ (state) vào kho một lần. Sau đó bất kỳ component nào — header, card, footer, hay component `Data` lồng sâu — đều có thể bước tới quầy của kho để **đọc** thứ nó cần hoặc trao một **phiếu yêu cầu (action)** để thay đổi hàng tồn kho. Không component trung gian nào phải vác những thùng hàng mà nó không quan tâm.

- **Store** = kho hàng (nguồn chân lý duy nhất).
- **Slice** = một kệ hàng có dán nhãn trong kho (ví dụ kệ "counter", kệ "todos").
- **Reducer** = chỉ dẫn cho người công nhân *cách* thay đổi một kệ hàng.
- **Action** = phiếu yêu cầu ("thêm một", "bớt một") mà bạn dispatch tới người công nhân.

> [!WARNING]
> Store nằm **bên ngoài** cây React của bạn, nhưng các component không thể tự động chạm tới nó một cách thần kỳ. Bạn phải bao bọc ứng dụng trong `<Provider>` để store được tiêm vào thông qua React Context. Quên `<Provider>` là lỗi phổ biến nhất của người mới — `useSelector`/`useDispatch` sẽ ném ra lỗi *"could not find react-redux context value"*.

### Redux core vs Redux Toolkit vs Context API

| Khía cạnh | Redux Core (truyền thống) | Redux Toolkit (RTK) ✅ | Context API |
|---|---|---|---|
| **Mục đích** | State toàn cục | State toàn cục | Dependency injection / chia sẻ nhẹ |
| **Boilerplate** | Nặng: action type, creator, switch reducer | Tối thiểu: `createSlice` sinh ra chúng | Thấp, nhưng không có sẵn logic cập nhật |
| **Tính bất biến (Immutability)** | Thủ công (spread operator ở khắp nơi) | Tự động qua **Immer** (viết mã "mutating") | Bạn tự quản lý state (thường là `useState`) |
| **DevTools** | Cấu hình thủ công | Tích hợp sẵn qua `configureStore` | Không có |
| **Async / fetch dữ liệu** | Thêm `redux-thunk` / `redux-saga` thủ công | Thunk có sẵn; RTK Query cho việc fetch dữ liệu | Không cung cấp |
| **Phù hợp nhất cho** | Codebase cũ | Ứng dụng mới với state chia sẻ lớn | Theme, user auth, locale; ít giá trị, ít thay đổi |
| **Hành vi re-render** | Chỉ các component đã subscribe | Chỉ các component đã subscribe (`useSelector`) | **Mọi consumer đều re-render** khi giá trị thay đổi |

Điều rút ra: Context tuyệt vời cho một số ít giá trị ổn định (theme, user hiện tại). Một khi bạn có nhiều component thay đổi state chia sẻ thường xuyên, RTK mang lại cho bạn cấu trúc, hiệu năng và công cụ mà Context thuần không thể có.

---

## ⚡ 1. Cài đặt

Để thêm Redux Toolkit và các React bindings của nó vào dự án, chạy:

```bash
# @reduxjs/toolkit  -> the Redux Toolkit core (createSlice, configureStore, etc.)
# react-redux        -> the binding layer that connects Redux to React components
npm install @reduxjs/toolkit react-redux
```

---

## 🧩 2. Tạo một Slice (`createSlice`)

Một **Slice** là một khái niệm của Redux Toolkit gộp state ban đầu, logic reducer và các action creator cho một tính năng cụ thể vào trong một tệp duy nhất.

Hãy nhớ lại phép ẩn dụ kho hàng: nếu toàn bộ store là một cái bánh lớn, thì một **slice** là một miếng bánh dễ quản lý của cái bánh đó — một phần nhỏ hơn của tổng state *cộng với* các chỉ dẫn về cách thay đổi nó.

### ⚠️ Phép màu của Immer
Thông thường, state của Redux phải được cập nhật một cách bất biến (ví dụ dùng spread operator). Tuy nhiên, RTK dùng thư viện **Immer** ở bên dưới. Điều này cho phép bạn viết mã "mutative" (như `state.value += 1` hoặc `state.todos.push(newItem)`) bên trong các reducer của bạn. Immer chặn lại các thao tác thay đổi này và tự động biên dịch chúng thành các bản cập nhật state an toàn, bất biến.

> [!CAUTION]
> Siêu năng lực "viết mã mutating" **chỉ hoạt động bên trong các reducer của `createSlice`** (và `createReducer`). Immer không hoạt động trong các component, hàm helper, hay event handler của bạn. Thay đổi trực tiếp một object bên ngoài reducer sẽ bỏ qua cơ chế phát hiện thay đổi của React và gây ra các lỗi render âm thầm, khó gỡ.

Tạo tệp `src/features/counterSlice.js` và chèn đoạn mã sau:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  title: "RTK Counter"
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 1. Immer allows writing direct mutations safely!
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // 2. Actions can receive payloads via action.payload
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    }
  }
});

// Export auto-generated action creators
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Export the reducer to register in the store
export default counterSlice.reducer;
```

> [!NOTE]
> Các **chuỗi type** của action được sinh ra sẵn cho bạn theo định dạng `sliceName/reducerName` — ví dụ `counter/increment`. Bạn không bao giờ phải tự tay viết các hằng số action type nữa, điều này loại bỏ cả một lớp lỗi do gõ sai (typo).

---

## 🧩 3. Cấu hình Store (`configureStore`)

**Store** là cơ sở dữ liệu toàn cục (kho hàng của chúng ta) chứa tất cả các slice reducer. Chúng ta cấu hình nó bằng **`configureStore`**, hàm này tự động thiết lập Redux DevTools và middleware (như Thunk):

Tạo tệp `src/app/store.js` và chèn đoạn mã sau:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // Register slice reducers here
  }
});
```

> [!TIP]
> Khóa (key) mà bạn chọn ở đây (`counter`) sẽ trở thành đường dẫn bạn dùng để đọc sau này. `state.counter.value` trong một selector ánh xạ trực tiếp tới khóa `counter` này cộng với trường `value` từ `initialState` của slice. Hãy đặt các tên này một cách có chủ ý và nhất quán.

---

## 🧩 4. Cung cấp Store cho React (`Provider`)

Để làm cho Redux store khả dụng với tất cả các component React, hãy bao bọc gốc ứng dụng của bạn bằng component **`<Provider>`** từ `react-redux`:

Sửa đổi `src/main.jsx` (hoặc tệp gốc của bạn):

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

---

## 🧩 5. Đọc & Cập nhật State trong các Component

Store là vô dụng cho đến khi một component giao tiếp với nó. `react-redux` cung cấp cho bạn hai hook:

- **`useSelector`** — đọc (chọn) một mẩu dữ liệu từ store.
- **`useDispatch`** — trả về hàm `dispatch` để bạn có thể gửi các action nhằm thay đổi store.

Tạo tệp `src/components/Counter.jsx`:

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../features/counterSlice';

function Counter() {
  // READ: select the value from the store.
  // state.counter -> the "counter" key in configureStore
  // .value        -> the field from the slice's initialState
  const count = useSelector((state) => state.counter.value);

  // GET the dispatch function used to send actions to the store.
  const dispatch = useDispatch();

  return (
    <div>
      <h1>{count}</h1>
      {/* Dispatch the action creators (call them so they RETURN an action object) */}
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}

export default Counter;
```

> [!WARNING]
> Hãy để ý dấu ngoặc đơn: `dispatch(increment())`, **không phải** `dispatch(increment)`. Action creator là một *hàm* — bạn phải gọi nó để nó trả về object action `{ type: 'counter/increment' }` cho `dispatch` gửi đi. Quên cặp `()` bên trong là một lỗi âm thầm thường gặp.

Như vậy là hoàn tất toàn bộ luồng Redux Toolkit: **Slice → Store → Provider → useSelector/useDispatch**.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về Redux Toolkit. Nhấp vào **Reveal Answer** để xác minh.

### 1. Redux Toolkit giải quyết ba vấn đề gì so với Redux truyền thống?
<details>
  <summary><b>Reveal Answer</b></summary>

  Redux Toolkit giải quyết:
  1. **Cấu hình Store phức tạp**: Việc thiết lập được đơn giản hóa bằng `configureStore`.
  2. **Phình to vì Boilerplate**: `createSlice` kết hợp action và reducer, loại bỏ nhu cầu phải có các hằng số action type và creator riêng biệt.
  3. **Gánh nặng về package**: RTK tích hợp sẵn các công cụ thiết yếu (như Redux DevTools và Redux Thunk) theo mặc định.
</details>

### 2. Thư viện Immer hoạt động như thế nào bên trong `createSlice`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Immer bao bọc các bản cập nhật state của bạn bên trong một cây proxy. Nó cho phép bạn viết các lệnh mutable chuẩn (như `.push()` hoặc phép gán `state.x = y`). Immer theo dõi các thao tác này, tạo một state nháp (draft) ở bên dưới, và biên dịch chúng thành các object sạch, bất biến trước khi commit chúng vào store.
</details>

### 3. Bạn có thể viết các bản cập nhật state dạng mutable bên ngoài các reducer của `createSlice` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Immer chỉ hoạt động bên trong các hàm reducer được định nghĩa trong `createSlice`. Viết mã state dạng mutable trong component, hàm helper, hay các nơi khác sẽ thay đổi trực tiếp các object của bạn, vi phạm các nguyên tắc Redux và gây ra các lỗi render âm thầm.
</details>

### 4. Định dạng của object action được sinh ra bởi `createSlice` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các action tuân theo định dạng **FSA (Flux Standard Action)**:
  ```javascript
  {
    type: "counter/incrementByAmount", // Format: [sliceName]/[reducerName]
    payload: 10 // The value passed during execution
  }
  ```
</details>

### 5. Tại sao component `<Provider>` của React-Redux lại cần thiết?
<details>
  <summary><b>Reveal Answer</b></summary>

  Component `<Provider>` sử dụng React Context API để làm cho Redux store toàn cục khả dụng với bất kỳ component lồng nhau nào bên dưới cây, cho phép các hook như `useSelector` và `useDispatch` tương tác với store. Nếu không có nó, các hook đó sẽ ném ra lỗi vì chúng không tìm thấy store.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Xây dựng một Slice Quản lý Công việc
1. Tạo một slice tên là `todoSlice.js` trong `src/features/`.
2. Đặt state ban đầu là `{ list: [] }`.
3. Hỗ trợ ba reducer bên trong slice:
   - `addTodo(state, action)`: Push một object todo mới `{ id: Date.now(), text: action.payload, completed: false }` trực tiếp vào `state.list` (tận dụng Immer).
   - `toggleTodo(state, action)`: Tìm todo khớp với `action.payload` (ID của todo) và đảo trạng thái `completed` của nó.
   - `deleteTodo(state, action)`: Xóa todo khớp khỏi danh sách.
4. Đăng ký reducer `todoSlice` vào tệp `store.js` toàn cục của bạn dưới khóa `todos`.
5. **Kết nối nó vào UI**: Xây dựng một component `TodoList.jsx` dùng `useSelector((state) => state.todos.list)` để đọc các todo và `useDispatch` để dispatch `addTodo`, `toggleTodo`, và `deleteTodo`. Kiểm chứng rằng các mục xuất hiện, gạch ngang khi toggle, và biến mất khi bị xóa.

### 🛠️ Bài tập 2: Mở rộng Counter với một Action có Payload
1. Mở `counterSlice.js` và xác nhận các reducer `incrementByAmount` và `reset` đã tồn tại.
2. Trong `Counter.jsx` của bạn, thêm một ô input dạng số mà giá trị của nó bạn lưu trong `useState` cục bộ.
3. Thêm một nút **"Add Amount"** dispatch `incrementByAmount(Number(inputValue))` — chứng tỏ bạn hiểu `action.payload`.
4. Thêm một nút **"Reset"** dispatch `reset()`.
5. **Bonus**: Mở extension trình duyệt Redux DevTools và quan sát các action được dispatch (`counter/incrementByAmount`, `counter/reset`) xuất hiện trong timeline, kiểm tra `payload` và state kết quả của mỗi cái.
