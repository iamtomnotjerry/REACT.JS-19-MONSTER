# Trạng thái (State) và Hook `useState` trong React 🐻

Trong React, **State** là bộ nhớ riêng tư, cục bộ của một component. Khác với props là thuộc tính chỉ đọc được truyền từ component cha xuống, state được kiểm soát và quản lý hoàn toàn bởi chính bản thân component đó. Khi state của một component thay đổi, React sẽ tự động lên lịch **render lại (re-render)** để hiển thị dữ liệu mới nhất lên giao diện người dùng.

Để khai báo và quản lý state trong các functional components, chúng ta sử dụng Hook tên là **`useState`**.

---

## ⚡ 1. Khai báo State

Để sử dụng `useState`, trước tiên bạn import nó từ thư viện `'react'`. Cú pháp sử dụng tính năng phân rã mảng (array destructuring) của JavaScript:

```jsx
import { useState } from 'react';

const Counter = () => {
  // const [stateValue, setterFunction] = useState(initialValue);
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```
- `count`: Biến lưu trữ giá trị hiện tại của state.
- `setCount`: Hàm dùng để cập nhật giá trị mới cho biến state.
- `0`: Giá trị khởi đầu được gán cho state.

---

## 🌟 2. Quản lý các kiểu State phức tạp

State không chỉ giới hạn ở số hay chuỗi. Bạn có thể lưu trữ và cập nhật mảng, đối tượng (object) hoặc mảng chứa các đối tượng.

### A. Cập nhật State dạng Mảng
Vì state là bất biến, **tuyệt đối không chỉnh sửa trực tiếp mảng state** (ví dụ: không viết `friends.push('John')`). Hãy luôn tạo một mảng mới bằng toán tử spread `...` hoặc các phương thức mảng như `.filter()`:

```jsx
const FriendsList = () => {
  const [friends, setFriends] = useState(["Alex", "Jordan"]);

  // Adding an item (Spread Operator)
  const addFriend = () => {
    setFriends([...friends, "John"]);
  };

  // Removing an item (Filter)
  const removeFriend = (nameToRemove) => {
    setFriends(friends.filter((friend) => friend !== nameToRemove));
  };

  return (
    <div>
      <button onClick={addFriend}>Add John</button>
      <ul>
        {friends.map((friend, idx) => (
          <li key={idx}>
            {friend} <button onClick={() => removeFriend(friend)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### B. Cập nhật State dạng Đối tượng (Object)
Khi cập nhật các state dạng đối tượng, bạn phải sao chép tất cả thuộc tính hiện có của đối tượng bằng toán tử spread `...`, sau đó ghi đè thuộc tính cụ thể mà bạn muốn thay đổi:

```jsx
const MovieCard = () => {
  const [movie, setMovie] = useState({
    title: "Equalizer 3",
    rating: 7
  });

  const updateRating = () => {
    // Copy movie properties, overwrite rating
    setMovie({
      ...movie,
      rating: 9
    });
  };

  return (
    <div>
      <h3>{movie.title}</h3>
      <p>Rating: {movie.rating}/10</p>
      <button onClick={updateRating}>Update Rating</button>
    </div>
  );
};
```

---

## 📝 3. Ô nhập dữ liệu có kiểm soát (Controlled Inputs) & Form State

Để thu thập nội dung người dùng nhập từ bàn phím, chúng ta liên kết thuộc tính `value` của thẻ `<input>` với một biến state, và cập nhật biến đó thông qua sự kiện `onChange`:

```jsx
const InputForm = () => {
  const [name, setName] = useState("");

  const handleChange = (e) => {
    setName(e.target.value);
  };

  return (
    <div>
      <input type="text" value={name} onChange={handleChange} placeholder="Enter name" />
      <p>Your name is: {name}</p>
    </div>
  );
};
```
*Cách hoạt động*: Mỗi khi gõ một ký tự, sự kiện `handleChange` được kích hoạt, đọc giá trị `e.target.value` (nội dung người dùng đã gõ) và cập nhật vào state. React sau đó render lại component, hiển thị nội dung mới trong ô input và thẻ đoạn văn.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về State. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Điều gì xảy ra với giao diện người dùng (UI) khi state của một component được cập nhật?
<details>
  <summary><b>Reveal Answer</b></summary>

  React tự động kích hoạt quá trình render lại (re-render) component đó và chỉ cập nhật những phần thay đổi vào cây Real DOM.
</details>

### 2. Tại sao bạn không nên viết trực tiếp `myStateArray.push('item')`?
<details>
  <summary><b>Reveal Answer</b></summary>

  State trong React là bất biến (immutable). Việc thay đổi trực tiếp mảng sẽ không tạo ra một tham chiếu mảng mới, do đó React sẽ không phát hiện ra sự thay đổi và không kích hoạt render lại giao diện. Hãy luôn sử dụng toán tử spread `[...myStateArray, 'item']` để tạo một tham chiếu mảng mới.
</details>

### 3. "Controlled component" (Thành phần có kiểm soát) trong React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Controlled component là một phần tử nhập dữ liệu (như `<input>`, `<textarea>`, hoặc `<select>`) có giá trị (value) được điều khiển hoàn toàn bởi React state chứ không phải bởi trạng thái nội bộ của trình duyệt.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component Danh sách Bộ đếm (Multi-Counter)
1. Tạo một component tên là `CounterList.jsx` bên trong `src/components/`.
2. Thiết lập một state chứa mảng các giá trị bộ đếm:
   ```javascript
   const [counters, setCounters] = useState([0, 0, 0]);
   ```
3. Render ba nút bấm, mỗi nút hiển thị số lần click của chỉ số (index) tương ứng.
4. Triển khai một hàm để tăng giá trị của một bộ đếm cụ thể theo chỉ số index (sử dụng phương thức `.map()` để cập nhật mảng một cách bất biến).
5. Import và render `<CounterList />` bên trong tệp `App.jsx`.
