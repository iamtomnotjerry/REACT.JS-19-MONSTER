# Hook `useRef` ⚓

Hook **`useRef`** là một công cụ mạnh mẽ trong React phục vụ hai mục đích chính:
1. **Truy cập và thao tác trực tiếp các phần tử DOM** của trình duyệt (tương tự như việc sử dụng hàm `document.getElementById` trong JavaScript thuần).
2. **Lưu trữ các giá trị có thể thay đổi (mutable values) giữa các lần render** mà không kích hoạt việc hiển thị lại (re-render) component khi giá trị đó thay đổi.

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng bạn đang ghi chú vào một cuốn sách vật lý.
- **`useState`** giống như việc viết lại cả trang sách mỗi khi có một thay đổi nhỏ (màn hình được vẽ lại/re-render).
- **`useRef`** giống như một tờ giấy nhớ (post-it) được dán ở bên mép trang. Bạn có thể viết lên đó, xóa đi và cập nhật thoải mái mà không cần phải xé và viết lại cả trang sách (dữ liệu được lưu trữ, nhưng không kích hoạt việc re-render).

---

## ⚡ 1. So sánh trực tiếp: State vs. Ref vs. Biến cục bộ thông thường

Việc hiểu rõ cách thức hoạt động của các loại biến qua các lần render là cực kỳ quan trọng:

| Tính năng | `useState` | `useRef` | Biến cục bộ thông thường (`let x`) |
| :--- | :--- | :--- | :--- |
| **Kích hoạt re-render khi thay đổi?** | **Có** | **Không** | **Không** |
| **Tồn tại qua các lần render?** | **Có** | **Có** | **Không** (bị khởi tạo lại giá trị mặc định khi render) |
| **Cú pháp** | `const [val, setVal] = useState(0)` | `const myRef = useRef(0)` (truy cập qua `myRef.current`) | `let val = 0` |

---

## 🧩 2. Trường hợp sử dụng 1: Truy cập các phần tử DOM

Đây là trường hợp sử dụng phổ biến nhất. Bằng cách truyền đối tượng ref vào thuộc tính `ref` của một phần tử JSX, React sẽ tự động gán phần tử DOM tương ứng vào thuộc tính `.current`.

```jsx
import { useRef, useEffect } from 'react';

const AutoFocusInput = () => {
  const inputRef = useRef(null);

  const handleClick = () => {
    // Tự động focus vào ô nhập liệu bằng API DOM của trình duyệt
    inputRef.current.focus();
    inputRef.current.style.border = "2px solid red";
  };

  useEffect(() => {
    // Tự động focus ô nhập liệu khi component mount lần đầu
    inputRef.current.focus();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <input ref={inputRef} type="text" placeholder="Nhập văn bản..." />
      <button onClick={handleClick}>Focus & Tô viền đỏ ô nhập</button>
    </div>
  );
};
```

---

## 🧩 3. Trường hợp sử dụng 2: Lưu trữ giá trị mà không gây Re-render

Sử dụng phương án này khi bạn cần theo dõi một giá trị (như ID của bộ đếm thời gian interval, số lần click, hoặc đo đạc thời gian hoạt động) nhưng không muốn những thay đổi này làm gián đoạn hay vẽ lại giao diện UI.

```jsx
import { useState, useRef } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const timerId = useRef(null); // Ref để lưu trữ ID của interval

  const startTimer = () => {
    if (timerId.current !== null) return; // Ngăn chặn việc chạy nhiều interval cùng lúc

    timerId.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerId.current);
    timerId.current = null; // Đặt lại giá trị của ref
  };

  return (
    <div>
      <h2>Đồng hồ: {seconds}s</h2>
      <button onClick={startTimer}>Bắt đầu</button>
      <button onClick={stopTimer}>Dừng</button>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useRef`. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Thay đổi giá trị của `ref.current` có kích hoạt việc re-render component không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Việc sửa đổi thuộc tính `.current` của một ref là thao tác thay đổi trực tiếp trên một đối tượng JavaScript. React không theo dõi các thay đổi này cho việc hiển thị, vì vậy thay đổi nó sẽ không bao giờ kích hoạt re-render component.
</details>

### 2. Tại sao ta không dùng một biến cục bộ bình thường (ví dụ `let counter = 0`) thay cho `useRef` để lưu các giá trị không cần re-render?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vì các biến cục bộ thông thường sẽ bị khai báo lại và đặt lại về giá trị mặc định ban đầu của chúng mỗi khi component được thực thi (render). `useRef` tạo ra một chiếc hộp lưu trữ bền vững được React giữ nguyên vẹn trong suốt vòng đời của component.
</details>

### 3. Giá trị mặc định của `ref.current` là gì nếu ta gọi `useRef()` mà không truyền tham số nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu không truyền tham số nào cho `useRef()`, thuộc tính `.current` sẽ mặc định là `undefined`. Theo thực tiễn tốt nhất, ta nên khởi tạo các ref liên quan đến DOM bằng giá trị `null` (ví dụ: `useRef(null)`) để biểu thị rằng chúng chưa trỏ tới bất kỳ phần tử DOM thực tế nào.
</details>

### 4. Làm thế nào để sử dụng `useRef` để theo dõi giá trị trước đó (previous value) của một biến state?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể sử dụng hook `useEffect` chạy sau mỗi lần render để gán giá trị state hiện tại vào ref:
  ```javascript
  useEffect(() => {
    prevValueRef.current = stateValue;
  }, [stateValue]);
  ```
  Vì `useEffect` chạy *sau khi* quá trình render hoàn tất, nên ref sẽ giữ giá trị của lần render trước đó trong suốt quá trình render hiện tại.
</details>

### 5. Tại sao bạn nên tránh dùng `useRef` để đọc các giá trị hiển thị trực tiếp trong mã JSX của bạn?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu bạn hiển thị trực tiếp giá trị của ref trong JSX (ví dụ: `<h1>{myRef.current}</h1>`), những thay đổi đối với giá trị đó sẽ không hiển thị trên màn hình vì việc đổi giá trị `current` không gây re-render. Nếu một giá trị cần cập nhật trực quan trên giao diện UI, nó bắt buộc phải được lưu trữ trong state (`useState`).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Đo độ dài từ nhập vào (Không Re-render)
1. Tạo một component `InputCounter.jsx`.
2. Hiển thị một ô `<input>` và một nút bấm "Xem độ dài".
3. Sử dụng `useRef` để liên kết với thẻ `<input>`.
4. Khi người dùng bấm nút, hãy đọc trực tiếp giá trị từ ref của input và hiển thị độ dài của chuỗi thông qua hộp thoại `alert`. Chú ý rằng quá trình nhập văn bản vào ô input không hề gây ra việc re-render component.

### 🛠️ Bài tập 2: Bộ đếm số lần render của Component
1. Tạo một component `RenderCounter.jsx` chứa một biến state `text`.
2. Hiển thị một ô nhập liệu liên kết với state `text` này (để khi gõ chữ sẽ gây re-render component).
3. Sử dụng một ref `const renderCount = useRef(0)` để theo dõi xem component đã hiển thị bao nhiêu lần.
4. Tăng giá trị của ref này lên 1 đơn vị bên trong một `useEffect` không truyền mảng phụ thuộc.
5. Hiển thị nội dung text và số lần render ra màn hình. Kiểm tra xem số lần render có tăng lên sau mỗi phím bạn gõ hay không.
