# Hook `useRef` ⚓

Hook **`useRef`** là một công cụ mạnh mẽ trong React phục vụ hai mục đích chính:
1. **Truy cập và thao tác trực tiếp các phần tử DOM** (tương tự như việc sử dụng `document.getElementById` trong JavaScript thuần).
2. **Lưu trữ các giá trị có thể thay đổi (mutable values) xuyên suốt các lần render** mà không kích hoạt re-render component khi giá trị đó thay đổi.

---

## 📖 Khái niệm & Tổng quan

`useRef` trả về một đối tượng JavaScript thuần có thể thay đổi với hình dạng `{ current: <value> }`. React đảm bảo trao cho bạn **cùng một đối tượng** trên mỗi lần render, vì vậy nó hoạt động như một "chiếc hộp" ổn định tồn tại qua các lần re-render. Bạn đọc và ghi giá trị thông qua thuộc tính `.current`.

Có hai quy tắc vàng phân biệt `useRef` với `useState`:

> [!NOTE]
> Việc thay đổi (mutate) `ref.current` **KHÔNG** kích hoạt re-render. React cố tình bỏ qua các thay đổi trên thuộc tính `.current`. Hãy dùng `useRef` cho những giá trị cần được lưu giữ nhưng *không* nên điều khiển những gì người dùng nhìn thấy (ID của interval, giá trị trước đó, nút DOM, cờ flag).

> [!WARNING]
> **KHÔNG** đọc hoặc ghi một ref trong quá trình render. Việc đọc `ref.current` trong khi React đang tính toán JSX (bên ngoài các event handler hoặc effect) khiến component của bạn không còn thuần khiết (impure) và có thể tạo ra kết quả không nhất quán giữa các lần render cũng như trong Strict Mode. Chỉ chạm vào `.current` bên trong các event handler, effect, hoặc callback.

> [!TIP]
> Nếu một giá trị cần được **hiển thị trên màn hình** và cập nhật trực quan, nó thuộc về `useState`. Nếu nó là việc ghi chép "hậu trường" mà UI không trực tiếp hiển thị, hãy dùng `useRef`.

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng bạn đang ghi chú vào một cuốn sách vật lý.
- **`useState`** giống như việc viết lại cả một trang sách mỗi khi bạn thực hiện một thay đổi (màn hình được vẽ lại/re-render).
- **`useRef`** giống như một tờ giấy nhớ (post-it) được dán ở bên mép trang. Bạn có thể viết lên đó, xóa đi và cập nhật thoải mái mà không cần phải xé bỏ và viết lại cả trang sách (dữ liệu được lưu giữ, nhưng không kích hoạt re-render).

---

## ⚡ 1. So sánh trực tiếp: State vs. Ref vs. Biến cục bộ

Việc hiểu rõ cách các biến hoạt động qua các lần render là cực kỳ quan trọng:

| Tính năng | `useState` | `useRef` | Biến cục bộ thông thường (`let x`) |
| :--- | :--- | :--- | :--- |
| **Gây re-render khi cập nhật?** | **Có** | **Không** | **Không** |
| **Tồn tại qua các lần render?** | **Có** | **Có** | **Không** (bị đặt lại về mặc định khi render) |
| **Đọc trong lúc render?** | An toàn | **Tránh** (impure) | An toàn |
| **Cú pháp** | `const [val, setVal] = useState(0)` | `const myRef = useRef(0)` (truy cập qua `myRef.current`) | `let val = 0` |

### 🔄 Mô hình tư duy: Chu kỳ Render

```text
                ┌─────────────────────────────┐
   setState ──▶ │   Component re-renders      │
                │   (function runs again)     │
                └──────────────┬──────────────┘
                               │
            local `let x`  ───▶ RESET to initial value
            useRef.current ───▶ PRESERVED (same box)
            useState value ───▶ PRESERVED + drives the UI
```

---

## 🧩 2. Trường hợp sử dụng 1: Truy cập các phần tử DOM

Đây là trường hợp sử dụng phổ biến nhất. Bằng cách truyền đối tượng ref vào thuộc tính `ref` của một phần tử JSX, React sẽ gán nút DOM tương ứng vào `.current` sau khi phần tử được mount.

```jsx
import { useRef, useEffect } from 'react';

const AutoFocusInput = () => {
  const inputRef = useRef(null); // Initialize with null: no DOM node yet

  const handleClick = () => {
    // Focus the input field directly using the browser DOM API.
    // We only touch .current inside an event handler — never during render.
    inputRef.current.focus();
    inputRef.current.style.border = "2px solid red";
  };

  useEffect(() => {
    // Auto-focus the input field on mount (effect runs after render)
    inputRef.current.focus();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <input ref={inputRef} type="text" placeholder="Type here..." />
      <button onClick={handleClick}>Focus & Highlight Input</button>
    </div>
  );
};
```

> [!WARNING]
> Một DOM ref có giá trị `null` trong lần render đầu tiên (trước khi phần tử được gắn vào). Hãy luôn phòng vệ bằng optional chaining (`inputRef.current?.focus()`) hoặc chạy truy cập DOM bên trong một `useEffect`, vốn chỉ kích hoạt *sau khi* DOM đã tồn tại.

---

## 🧩 3. Trường hợp sử dụng 2: Lưu trữ giá trị mà không gây Re-render

Sử dụng cách này khi bạn cần theo dõi một giá trị (như ID của interval đang hoạt động, số lần click, hoặc đo đạc thời lượng) nhưng không muốn các thay đổi kích hoạt việc làm mới bố cục trực quan.

```jsx
import { useState, useRef } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const timerId = useRef(null); // Ref stores the interval ID across renders

  const startTimer = () => {
    if (timerId.current !== null) return; // Prevent multiple intervals

    // Storing the ID in a ref means restarting/re-rendering won't lose it
    timerId.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerId.current);
    timerId.current = null; // Reset the ref value (no re-render happens here)
  };

  return (
    <div>
      <h2>Timer: {seconds}s</h2>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
};
```

> [!NOTE]
> Lưu ý rằng `seconds` nằm trong `useState` vì nó được hiển thị trên màn hình, trong khi `timerId` nằm trong `useRef` vì nó là phần đường ống nội bộ mà người dùng không bao giờ nhìn thấy. Sự phân chia này chính là cốt lõi của việc lựa chọn giữa hai hook.

---

## 🧪 4. Phần thưởng thêm: Theo dõi giá trị trước đó

Một pattern kinh điển của `useRef` là ghi nhớ giá trị của một biến ở lần render *trước đó*. Vì các effect chạy sau khi render, nên ref vẫn giữ giá trị cũ trong suốt lần render hiện tại.

```jsx
import { useState, useEffect, useRef } from 'react';

const PreviousValue = () => {
  const [count, setCount] = useState(0);
  const prevCount = useRef(null);

  useEffect(() => {
    // Runs AFTER render — so during render, prevCount.current is still the old value
    prevCount.current = count;
  }, [count]);

  return (
    <div>
      <p>Now: {count} | Before: {prevCount.current ?? "—"}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useRef`. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Thay đổi giá trị của `ref.current` có kích hoạt việc re-render component không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Việc sửa đổi thuộc tính `.current` của một ref là thao tác thay đổi trực tiếp trên một đối tượng JavaScript. React không theo dõi các thay đổi trên đối tượng này cho việc hiển thị, vì vậy thay đổi nó sẽ không bao giờ kích hoạt re-render.
</details>

### 2. Tại sao ta không thể dùng một biến cục bộ thông thường (như `let counter = 0`) thay cho `useRef` để lưu các giá trị mà ta không muốn re-render?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vì các biến cục bộ thông thường bị khai báo lại và đặt lại về giá trị khởi tạo mặc định của chúng mỗi lần hàm component được thực thi (render). `useRef` tạo ra một chiếc hộp lưu trữ bền vững mà React giữ nguyên vẹn xuyên suốt toàn bộ vòng đời của component.
</details>

### 3. Giá trị khởi tạo mặc định của `ref.current` là gì nếu ta gọi `useRef()` mà không truyền tham số nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu không truyền tham số nào cho `useRef()`, thuộc tính `.current` sẽ mặc định là `undefined`. Theo thông lệ phổ biến, ta nên khởi tạo các DOM ref bằng `null` (ví dụ `useRef(null)`) để biểu thị rằng chúng chưa trỏ tới một phần tử DOM nào.
</details>

### 4. Làm thế nào để sử dụng `useRef` để theo dõi giá trị trước đó của một biến state?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể sử dụng một hook `useEffect` chạy sau mỗi lần render để gán giá trị state hiện tại vào một ref:
  ```javascript
  useEffect(() => {
    prevValueRef.current = stateValue;
  }, [stateValue]);
  ```
  Vì `useEffect` chạy *sau khi* giai đoạn render hoàn tất, nên ref sẽ giữ giá trị của lần render trước đó trong suốt giai đoạn render hiện tại.
</details>

### 5. Tại sao bạn nên tránh dùng `useRef` để đọc các giá trị mà bạn hiển thị trực tiếp trong template JSX của mình?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu bạn hiển thị trực tiếp giá trị của một ref trong JSX (ví dụ `<h1>{myRef.current}</h1>`), các cập nhật cho giá trị đó sẽ không xuất hiện trên màn hình vì việc thay đổi `current` không kích hoạt re-render. Nếu một giá trị cần được cập nhật trực quan trên UI, nó phải được lưu trong state (`useState`). Ngoài ra, việc đọc hoặc ghi một ref trong giai đoạn render khiến component không còn thuần khiết (impure) và bị React khuyến cáo không nên làm.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Bộ đếm ký tự của từ nhập vào
1. Tạo một component `InputCounter.jsx`.
2. Hiển thị một ô `<input>` và một nút bấm tên là "Show Length".
3. Sử dụng `useRef` để nhắm tới phần tử `<input>` (`const inputRef = useRef(null)`).
4. Khi người dùng nhấp nút, hãy đọc trực tiếp giá trị từ ref của input (`inputRef.current.value`) và hiển thị độ dài chuỗi trong một hộp thoại alert.
5. **Quan sát:** Lưu ý rằng việc gõ chữ vào ô input *không* gây ra bất kỳ re-render nào cho component — không có state nào liên quan, vì vậy hàm component không bao giờ chạy lại khi bạn gõ.
6. **Mục tiêu nâng cao:** Thêm một nút thứ hai "Clear" để gán `inputRef.current.value = ""` và focus lại vào ô input, tất cả mà không cần bất kỳ `useState` nào.

### 🛠️ Bài tập 2: Bộ đếm số lần render của Component
1. Tạo một component `RenderCounter.jsx` chứa một biến state `text`.
2. Hiển thị một ô nhập liệu liên kết với state `text` này (để khi gõ chữ sẽ gây re-render).
3. Sử dụng một ref `const renderCount = useRef(0)` để theo dõi component đã re-render bao nhiêu lần.
4. Tăng giá trị ref bên trong một `useEffect` **không có mảng phụ thuộc** (để nó chạy sau mỗi lần render).
5. Hiển thị nội dung text và số lần render ra màn hình. Xác minh rằng số đếm tăng lên sau mỗi lần nhấn phím.
6. **Suy ngẫm:** Tại sao bộ đếm render phải nằm trong một ref chứ không phải trong state? (Gợi ý: việc tăng state bên trong một effect không có mảng phụ thuộc sẽ kích hoạt thêm một lần render, gây ra vòng lặp vô hạn.)

### 🛠️ Bài tập 3 (Thử thách): Đồng hồ đếm với Refs
1. Tạo một component `Timer.jsx` với một state `count` được khởi tạo là `0`.
2. Tạo một `intervalRef = useRef(null)` để giữ ID của interval.
3. Trong một `useEffect` với mảng phụ thuộc rỗng, hãy khởi động một `setInterval` tăng `count` mỗi giây, lưu ID vào `intervalRef.current`.
4. Trả về một hàm dọn dẹp (cleanup) từ effect gọi `clearInterval(intervalRef.current)`.
5. Thêm một nút "Stop Timer" gọi `clearInterval(intervalRef.current)` để tạm dừng bộ đếm.
6. **Quan sát:** ID của interval được lưu giữ qua các lần render thông qua ref, mặc dù đồng hồ vẫn liên tục re-render giá trị count được hiển thị mỗi giây.
