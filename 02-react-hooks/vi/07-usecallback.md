# Hook `useCallback` ⚓

Hook **`useCallback`** là một hook dùng để tối ưu hóa hiệu năng trong React. Nó trả về một phiên bản **memoized** (lưu vào bộ nhớ đệm / cache) của một hàm callback, và hàm này chỉ được tạo lại khi một trong các giá trị phụ thuộc (dependencies) thay đổi.

### 💡 Ví dụ thực tế dễ hiểu: Bản in mẫu tài liệu
Hãy tưởng tượng bạn là một giáo viên hàng ngày phải viết một mẫu đề bài tập lên bảng cho học sinh.
- **Không dùng `useCallback`**: Mỗi ngày đến lớp, bạn đều viết lại đề bài đó từ đầu lên bảng đen. Ngay cả khi nội dung chữ viết hoàn toàn giống hệt hôm trước, bạn vẫn tốn công sức và tạo ra một bản viết tay mới hoàn toàn (tốn năng lượng không cần thiết).
- **Có dùng `useCallback`**: Bạn viết đề bài đó lên một tờ giấy một lần duy nhất, sau đó đem đi photocopy (**memoize**). Bạn chỉ viết lại bản gốc nếu cần thay đổi nội dung của đề bài tập đó.

---

## ⚡ 1. Vấn đề cốt lõi: So sánh tham chiếu (Referential Equality)

Trong JavaScript, hàm thực chất là các đối tượng (objects). Do đó, chúng được so sánh bằng **tham chiếu (địa chỉ bộ nhớ)** chứ không phải bằng giá trị:

```javascript
const functionOne = () => console.log("Hello");
const functionTwo = () => console.log("Hello");

console.log(functionOne === functionTwo); // false! Chúng nằm ở hai vị trí khác nhau trong bộ nhớ.
```

Trong React, mỗi khi một component re-render, **tất cả các hàm được khai báo bên trong thân component sẽ được khởi tạo lại mới hoàn toàn**.
Nếu bạn truyền một trong các hàm này dưới dạng prop xuống component con, component con sẽ thấy đó là một tham chiếu mới. Ngay cả khi component con đó đã được tối ưu bằng `React.memo` (chỉ re-render khi props thực sự thay đổi), component con **vẫn sẽ bị re-render** vì tham chiếu của hàm truyền xuống đã bị thay đổi.

---

## 🧩 2. Cú pháp và Thiết lập cơ bản

`useCallback` nhận vào một hàm xử lý và một mảng phụ thuộc (dependency array):

```jsx
import { useCallback } from 'react';

const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Chỉ tạo lại tham chiếu hàm nếu 'a' hoặc 'b' thay đổi
```

---

## 🌐 3. Ví dụ tối ưu hóa chi tiết: Component Cha & Con

Hãy cùng xem cách `useCallback` hoạt động kết hợp với `React.memo` để tối ưu hóa việc render:

### Component Con đã được tối ưu (`Button.jsx`)
```jsx
import React from 'react';

// Bao bọc component con trong React.memo để chỉ render lại khi props thay đổi
const Button = React.memo(({ handleClick, children }) => {
  console.log(`Component con render: ${children}`);
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

  // Lưu cache cho hàm increment
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []); // Mảng phụ thuộc rỗng: tham chiếu hàm không bao giờ đổi

  // Hàm xử lý nhập text thông thường (không cache)
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bộ đếm: {count}</h2>
      {/* 1. Nút bấm này sẽ KHÔNG bị render lại khi gõ chữ vì prop handleClick đã được cache */}
      <Button handleClick={increment}>Tăng bộ đếm</Button>
      
      <div style={{ marginTop: "20px" }}>
        <input value={text} onChange={handleTextChange} placeholder="Nhập văn bản..." />
        <p>Văn bản: {text}</p>
      </div>
    </div>
  );
};
```

*Nếu chúng ta không bao bọc hàm `increment` trong `useCallback`, mỗi khi người dùng gõ chữ vào ô nhập, state `text` thay đổi kích hoạt component cha re-render, tham chiếu hàm `increment` được tạo mới, dẫn đến component `<Button>` con bị re-render một cách vô ích.*

---

## ⚠️ 4. Tác hại của việc lạm dụng Memoization

> [!CAUTION]
> **KHÔNG bao bọc tất cả các hàm trong `useCallback`.**
> Việc tối ưu bộ nhớ (memoization) luôn đi kèm với chi phí hiệu năng phụ. React phải khởi tạo mảng phụ thuộc, so sánh sự khác biệt của các phần tử trong mảng ở mỗi lần render, và lưu trữ bộ nhớ cache của hàm.

### Chỉ nên dùng `useCallback` khi:
1. Bạn truyền hàm đó làm prop cho một component con đã được tối ưu hóa bằng `React.memo`.
2. Hàm đó được sử dụng làm phần tử phụ thuộc (dependency) trong các hook khác, ví dụ như `useEffect` hoặc `useMemo`.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useCallback`. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. `useCallback` có ngăn một hàm tự động thực thi/chạy khi được gọi không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. `useCallback` không thay đổi cách thức hoặc thời điểm một hàm hoạt động khi được gọi. Nó chỉ kiểm soát việc **tham chiếu địa chỉ bộ nhớ** của hàm đó có bị thay đổi qua các lần render hay không.
</details>

### 2. Tại sao việc dùng `useCallback` mà không kết hợp `React.memo` cho component con thường không mang lại lợi ích hiệu năng nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu component con không được bao bọc bởi `React.memo`, nó sẽ tự động re-render mỗi khi component cha re-render, bất kể props truyền xuống có thay đổi hay không. Trong trường hợp đó, giữ cho tham chiếu hàm ổn định không có tác dụng gì vì component con đằng nào cũng bị vẽ lại.
</details>

### 3. Điều gì xảy ra nếu bạn quên khai báo một biến state sử dụng bên trong `useCallback` vào mảng phụ thuộc?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó sẽ tạo ra lỗi **stale closure (bao đóng lỗi thời)**. Hàm được lưu cache sẽ liên tục tham chiếu đến giá trị của biến đó từ thời điểm hàm được tạo ra lần cuối cùng. Nếu mảng phụ thuộc trống, hàm đó chỉ biết đến giá trị từ lần render đầu tiên (mount) và thực hiện các tính toán bằng dữ liệu cũ.
</details>

### 4. Sự khác biệt giữa `useCallback` và `useMemo` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `useCallback` lưu bộ nhớ đệm cho **chính tham chiếu hàm**. (Trả về `fn`).
  - `useMemo` gọi thực thi hàm và lưu bộ nhớ đệm cho **giá trị kết quả trả về** của hàm đó. (Trả về `fn()`).
  Về mặt cú pháp, `useCallback(fn, deps)` tương đương với `useMemo(() => fn, deps)`.
</details>

### 5. Trong phiên bản React 19, chúng ta có bắt buộc phải tự tối ưu thủ công bằng `useCallback` nữa không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phiên bản React 19 giới thiệu **React Compiler** (React Forget) giúp tự động phân tích và áp dụng cơ chế tối ưu lưu trữ (memoization) cho các hàm và giá trị ngầm bên dưới. Tuy nhiên, việc nắm vững `useCallback` vẫn rất quan trọng để làm việc với các codebase phiên bản cũ, viết thư viện, hoặc xử lý các dự án chưa kích hoạt bộ compiler này.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Tối ưu bộ lọc danh sách (Filter List)
1. Tạo một component `FilteredList.jsx` gồm một ô nhập văn bản để tìm kiếm và một nút tăng đếm (count).
2. Tạo một component con hiển thị danh sách `<ListItems items={items} onItemClick={handleItemClick} />`.
3. Bao bọc `ListItems` trong `React.memo`.
4. Triển khai hàm `handleItemClick` sử dụng `useCallback` sao cho việc nhấn nút tăng bộ đếm count ở component cha không kích hoạt re-render component `ListItems`. Thêm dòng `console.log` trong `ListItems` để kiểm tra kết quả tối ưu.
