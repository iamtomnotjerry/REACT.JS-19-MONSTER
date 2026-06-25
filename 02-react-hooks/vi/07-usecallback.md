# Hook `useCallback` ⚓

Hook **`useCallback`** là một hook dùng để tối ưu hóa hiệu năng trong React. Nó trả về một phiên bản **memoized** (đã được cache) của một hàm callback, và hàm này chỉ thay đổi khi một trong các giá trị phụ thuộc (dependencies) của nó thay đổi.

### 💡 Ví dụ thực tế dễ hiểu: Bản photocopy mẫu
Hãy tưởng tượng bạn là một giáo viên hàng ngày đưa cho học sinh một mẫu bài tập.
- **Không dùng `useCallback`**: Mỗi ngày, bạn lại viết lại mẫu bài tập từ đầu lên bảng đen. Ngay cả khi nội dung hoàn toàn giống hệt, bạn vẫn tốn công sức và tạo ra một bản sao hoàn toàn mới mỗi lần.
- **Có dùng `useCallback`**: Bạn viết mẫu đó lên một tờ giấy một lần duy nhất, sau đó đem đi photocopy (**memoize** nó). Bạn chỉ vẽ lại nó nếu thực sự cần thay đổi nội dung của chính mẫu đó.

---

## ⚡ 1. Vấn đề cốt lõi: So sánh tham chiếu (Referential Equality)

Trong JavaScript, hàm là các đối tượng (objects). Điều này có nghĩa là chúng được so sánh bằng **tham chiếu (địa chỉ bộ nhớ)** chứ không phải bằng giá trị:

```javascript
const functionOne = () => console.log("Hello");
const functionTwo = () => console.log("Hello");

console.log(functionOne === functionTwo); // false! They reside in different locations in memory.
```

Trong React, mỗi khi một component re-render, **tất cả các hàm được khai báo bên trong thân component đều được tạo lại từ đầu**.
Nếu bạn truyền một trong các hàm này dưới dạng prop xuống component con, component con sẽ thấy một tham chiếu hoàn toàn mới. Nếu component con đó được tối ưu bằng `React.memo` (vốn ngăn re-render nếu props không thay đổi), component con vẫn **sẽ re-render** vì tham chiếu của hàm đã thay đổi.

---

## 🧩 2. Cú pháp và Thiết lập cơ bản

`useCallback` nhận vào phần code của hàm và một mảng phụ thuộc (dependency array):

```jsx
import { useCallback } from 'react';

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Only re-create the function reference if 'a' or 'b' changes
```

---

## 🌐 3. Ví dụ tối ưu hóa chi tiết: Component Cha & Con

Hãy cùng xem cách `useCallback` hoạt động kết hợp với `React.memo` để tối ưu hóa việc render:

### Component Con đã được tối ưu (`Button.jsx`)
```jsx
import React from 'react';

// Wrap child in React.memo so it only re-renders if props change
const Button = React.memo(({ handleClick, children }) => {
  console.log(`Child Rendered: ${children}`);
  return <button onClick={handleClick}>{children}</button>;
});

Button.displayName = "Button";
export default Button;
```

### Component Cha (`App.jsx`)
```jsx
import { useState, useCallback } from 'react';
import Button from './Button';

const ParentComponent = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // Memoize increment function
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // Empty dependency array: reference never changes

  // Non-memoized text change handler
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Count: {count}</h2>
      {/* 1. This button will NOT re-render when typing because its prop is memoized */}
      <Button handleClick={increment}>Increment Count</Button>
      
      <div style={{ marginTop: "20px" }}>
        <input value={text} onChange={handleTextChange} placeholder="Type text..." />
        <p>Text: {text}</p>
      </div>
    </div>
  );
};
```

*Nếu chúng ta không bao bọc `increment` trong `useCallback`, việc gõ chữ vào ô input sẽ cập nhật state `text`, kích hoạt component cha re-render, tạo lại tham chiếu hàm `increment`, và khiến component `<Button>` re-render một cách không cần thiết.*

---

## ⚠️ 4. Cái giá của việc lạm dụng Memoization

> [!CAUTION]
> **KHÔNG bao bọc mọi hàm trong `useCallback`.**
> Memoization có chi phí kèm theo. React phải khởi tạo mảng phụ thuộc, kiểm tra sự khác biệt của các phụ thuộc ở mỗi lần render, và giữ bộ nhớ cache của hàm trong bộ nhớ.

### Chỉ nên dùng `useCallback` khi:
1. Bạn truyền hàm đó làm prop cho một component con được tối ưu hóa bằng `React.memo`.
2. Hàm đó được sử dụng làm phụ thuộc (dependency) trong các hook khác, như `useEffect` hoặc `useMemo`.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useCallback`. Nhấp vào **Reveal Answer** để xác nhận.

### 1. `useCallback` có ngăn một hàm thực thi/chạy khi được gọi không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. `useCallback` không thay đổi cách thức hoặc thời điểm một hàm chạy. Nó chỉ kiểm soát việc **địa chỉ bộ nhớ tham chiếu** của hàm có thay đổi qua các lần render hay không.
</details>

### 2. Tại sao việc dùng `useCallback` mà không bao bọc component con trong `React.memo` thường không mang lại lợi ích hiệu năng nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu một component con không được bao bọc trong `React.memo`, nó sẽ tự động re-render mỗi khi component cha re-render, bất kể props của nó có thay đổi hay không. Trong trường hợp này, việc giữ cho tham chiếu hàm ổn định là vô ích vì component con đằng nào cũng re-render.
</details>

### 3. Điều gì xảy ra nếu bạn quên đưa một biến state được sử dụng bên trong một `useCallback` vào mảng phụ thuộc của nó?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó tạo ra một **stale closure (bao đóng lỗi thời)**. Hàm được memoize sẽ vĩnh viễn tham chiếu đến giá trị của biến từ chu kỳ render khi hàm được tạo ra lần cuối. Nếu mảng phụ thuộc rỗng, nó sẽ chỉ biết đến giá trị từ lần render đầu tiên và sẽ tính toán các cập nhật bằng dữ liệu lỗi thời.
</details>

### 4. Sự khác biệt giữa `useCallback` và `useMemo` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `useCallback` cache **chính tham chiếu hàm**. (Trả về `fn`).
  - `useMemo` gọi thực thi hàm và cache **giá trị kết quả trả về** của hàm. (Trả về `fn()`).
  Về mặt cú pháp, `useCallback(fn, deps)` tương đương với `useMemo(() => fn, deps)`.
</details>

### 5. Trong React 19, việc tối ưu thủ công bằng `useCallback` có còn bắt buộc không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong React 19, **React Compiler** mới (React Forget) được giới thiệu để tự động phân tích các component và áp dụng memoization cho các hàm và giá trị ở tầng ngầm bên dưới. Tuy nhiên, việc hiểu `useCallback` vẫn rất quan trọng để duy trì các codebase cũ, phát triển thư viện, hoặc xử lý các trường hợp đặc biệt khi compiler không được bật.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Tối ưu bộ lọc danh sách (Optimized List Filter)
1. Tạo một component `FilteredList.jsx` chứa một ô nhập văn bản cho từ khóa tìm kiếm và một nút đếm (count).
2. Render một component con hiển thị danh sách `<ListItems items={items} onItemClick={handleItemClick} />`.
3. Bao bọc `ListItems` trong `React.memo`.
4. Triển khai `handleItemClick` bằng `useCallback` sao cho việc tăng state count ở component cha không kích hoạt re-render trong `ListItems`. Thêm các câu lệnh `console.log` trong `ListItems` để xác nhận khi nào nó render.
