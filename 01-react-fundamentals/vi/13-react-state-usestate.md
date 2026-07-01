# React State và Hook `useState` 🐻

Trong React, **State** (trạng thái) là bộ nhớ riêng tư, cục bộ của một component. Không giống như props vốn là chỉ đọc và được truyền từ cha xuống, state được kiểm soát hoàn toàn bởi chính component đó. Khi state của một component thay đổi, React sẽ tự động lên lịch **render lại (re-render)** để hiển thị dữ liệu mới nhất trên giao diện UI.

Để khai báo và quản lý state trong các functional component, chúng ta sử dụng Hook **`useState`**.

---

## ⚡ 1. Khai báo State

Để sử dụng `useState`, trước tiên bạn import nó từ thư viện `'react'`. Cú pháp sử dụng tính năng giải nén mảng (array destructuring) của JavaScript:

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
* **`count`**: Biến lưu trữ giá trị hiện tại của state.
* **`setCount`**: Hàm setter dùng để cập nhật giá trị của state và kích hoạt quá trình render lại giao diện.
* **`0`**: Giá trị khởi tạo ban đầu được gán cho state.

---

## 🌟 2. Quản lý các kiểu dữ liệu phức tạp (Quy tắc Bất biến - Immutability)

State trong React là **bất biến** (immutable - không thể sửa đổi trực tiếp). Bạn tuyệt đối không bao giờ được chỉnh sửa trực tiếp các biến state của mình (ví dụ: không viết `friends.push('John')` hoặc `user.age = 26`). Bạn luôn phải truyền một **bản sao mới hoàn toàn** của mảng hoặc đối tượng đó vào hàm setter.

### A. Cập nhật State dạng Mảng (Array)
Sử dụng toán tử spread (`...`) để sao chép mảng khi muốn thêm mới phần tử, và dùng các phương thức mảng trả về mảng mới như `.filter()` hoặc `.map()` khi cần xóa hoặc cập nhật:

```jsx
const FriendsList = () => {
  const [friends, setFriends] = useState(["Alex", "Jordan"]);

  // 1. Thêm một phần tử (Clone & Add)
  const addFriend = () => {
    setFriends([...friends, "John"]); // ✅ Sao chép an toàn
  };

  // 2. Xóa một phần tử (Lọc bỏ)
  const removeFriend = (nameToRemove) => {
    setFriends(friends.filter((friend) => friend !== nameToRemove)); // ✅ Trả về mảng mới
  };

  // 3. Cập nhật một phần tử (Map & Replace)
  const updateFriend = (oldName, newName) => {
    setFriends(friends.map((f) => (f === oldName ? newName : f))); // ✅ Trả về mảng mới
  };

  return (
    <div>
      <button onClick={addFriend}>Add John</button>
      <button onClick={() => updateFriend("Alex", "Alex Smith")}>Update Alex</button>
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
Sử dụng toán tử spread (`...`) để sao chép toàn bộ các thuộc tính hiện có, sau đó chỉ định thuộc tính cụ thể mà bạn muốn ghi đè/thay đổi:

```jsx
const MovieCard = () => {
  const [movie, setMovie] = useState({
    title: "Equalizer 3",
    rating: 7
  });

  const updateRating = () => {
    setMovie({
      ...movie, // Sao chép các thuộc tính hiện có
      rating: 9  // Ghi đè rating mới
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

### C. Cập nhật State là một Mảng chứa các Đối tượng (Array of Objects)
Để cập nhật một đối tượng cụ thể nằm bên trong một mảng state, sử dụng `.map()` để duyệt qua mảng, kiểm tra phần tử có ID trùng khớp, và trả về một đối tượng được sao chép có trường thông tin đã thay đổi:

```jsx
const MovieList = () => {
  const [movies, setMovies] = useState([
    { id: 1, title: "Spider-Man", rating: 8 },
    { id: 2, title: "Superman", rating: 6 }
  ]);

  const updateMovieTitle = (id) => {
    setMovies(
      movies.map((movie) => {
        if (movie.id === id) {
          return { ...movie, title: "John Wick 5" }; // Sao chép và cập nhật đối tượng mục tiêu
        }
        return movie; // Trả về đối tượng không đổi
      })
    );
  };

  return (
    <div>
      {movies.map((m) => (
        <div key={m.id}>
          <h3>{m.title} ({m.rating}/10)</h3>
          <button onClick={() => updateMovieTitle(m.id)}>Change Title</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 💡 3. Nâng State lên (Lifting State Up - Chia sẻ State)

Khi nhiều component đồng cấp cần truy cập hoặc chỉnh sửa chung một state, bạn phải **nâng state đó lên (lift state up)** component cha chung gần nhất của chúng và truyền nó xuống dưới dưới dạng props.

```jsx
// Component Cha (App.jsx)
import { useState } from 'react';
import ComponentOne from './ComponentOne';
import ComponentTwo from './ComponentTwo';

const App = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);

  return (
    <div>
      <h1>Shared Parent State</h1>
      <ComponentOne count={count} onIncrement={increment} />
      <ComponentTwo count={count} onIncrement={increment} />
    </div>
  );
};
```

```jsx
// Component Con 1
const ComponentOne = ({ count, onIncrement }) => (
  <div>
    <p>Component 1 Count: {count}</p>
    <button onClick={onIncrement}>Increment Shared State</button>
  </div>
);
```

---

## ⚙️ 4. Khởi tạo State trì hoãn (Lazy State Initialization)

Nếu giá trị ban đầu của state cần các tác vụ tính toán nặng (ví dụ: đọc và phân tích dữ liệu từ `localStorage`, chạy vòng lặp phức tạp), hãy truyền một **hàm callback** vào `useState()`. React sẽ chỉ thực thi hàm này **duy nhất một lần** khi component mount lần đầu tiên, thay vì chạy lại nó ở mỗi lần render sau đó.

```jsx
// Pattern khởi tạo trì hoãn (Lazy initialization)
const [name, setName] = useState(() => {
  const savedName = localStorage.getItem("username");
  return savedName ? JSON.parse(savedName) : "Guest"; // Chỉ chạy 1 lần duy nhất khi mount!
});
```

---

## 📝 5. Thành phần có kiểm soát (Controlled Inputs) & Form State

Để thu thập thông tin nhập vào từ người dùng, hãy liên kết thuộc tính `value` của thẻ input với state và cập nhật nó thông qua sự kiện `onChange`:

```jsx
const InputForm = () => {
  const [name, setName] = useState("");

  return (
    <div>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        placeholder="Enter name" 
      />
      <p>Your name is: {name}</p>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về State. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Điều gì xảy ra với giao diện UI khi state của component được cập nhật?
<details>
  <summary><b>Reveal Answer</b></summary>

  React tự động kích hoạt việc render lại (re-render) component đó và chỉ cập nhật các phần thực sự thay đổi trong cây DOM thực tế (Real DOM).
</details>

### 2. Tại sao bạn không nên viết trực tiếp `myStateArray.push('item')`?
<details>
  <summary><b>Reveal Answer</b></summary>

  State trong React là bất biến. Việc chỉnh sửa trực tiếp mảng cũ sẽ không tạo ra một tham chiếu mảng mới, khiến React không nhận biết được sự thay đổi để kích hoạt việc render lại. Hãy luôn dùng toán tử spread `[...myStateArray, 'item']` để tạo một tham chiếu mảng hoàn toàn mới.
</details>

### 3. "Controlled Component" (Thành phần có kiểm soát) trong React là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Controlled component là một phần tử nhập liệu (như `<input>`, `<textarea>`, hoặc `<select>`) có thuộc tính giá trị (`value`) được điều khiển và quyết định bởi React state, thay vì state nội bộ tự quản lý của thẻ DOM trên trình duyệt.
</details>

### 4. Lazy Initialization trong `useState` là gì và bạn nên dùng nó khi nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Lazy initialization là việc truyền một hàm vào `useState` (ví dụ: `useState(() => initialValue)`). Cách này được sử dụng khi việc tính toán giá trị khởi tạo tốn tài nguyên (như đọc `localStorage` hoặc tính toán nặng). Truyền hàm đảm bảo code tính toán đó chỉ chạy một lần khi component mount, thay vì chạy lại ở mỗi chu kỳ render.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Bộ đếm tương tác (Thử thách lớp học 1)
1. Tạo file `Counter.jsx` trong thư mục `src/components/`.
2. Khởi tạo biến state `count` bằng `0`.
3. Render hai nút: "Increment" và "Decrement".
4. Thêm trình xử lý sự kiện click để tăng và giảm giá trị state của bộ đếm đi `1` đơn vị.

### 🛠️ Bài tập 2: Danh sách việc cần làm (Thử thách lớp học 2)
1. Tạo file `TodoList.jsx` trong thư mục `src/components/`.
2. Khởi tạo state mảng `todos` bằng `[]` và state chuỗi nhập liệu `inputValue` bằng `""`.
3. Render một form có ô nhập văn bản và nút gửi (submit).
4. Khi submit, thêm giá trị `inputValue` vào mảng `todos` và xóa sạch ô nhập liệu.
5. Render danh sách việc cần làm bằng phương thức `.map()` đi kèm key duy nhất.

### 🛠️ Bài tập 3: Trình chỉnh sửa hồ sơ (Thử thách lớp học 3)
1. Tạo file `Profile.jsx` trong thư mục `src/components/`.
2. Khởi tạo state dạng đối tượng `profile` có các thuộc tính `name` (string) và `age` (number/string).
3. Render các ô nhập cho cả tên và tuổi.
4. Triển khai một hàm xử lý thay đổi duy nhất để cập nhật đối tượng profile một cách động bằng cách dùng thuộc tính name của input:
   ```javascript
   const handleChange = (e) => {
     const { name, value } = e.target;
     setProfile((prev) => ({ ...prev, [name]: value }));
   };
   ```
5. Hiển thị thông tin hồ sơ bên dưới các ô nhập liệu một cách động.

### 🛠️ Bài tập 4: Danh sách mua sắm mảng chứa đối tượng (Thử thách lớp học 4)
1. Tạo file `ShoppingList.jsx` trong thư mục `src/components/`.
2. Khởi tạo state mảng `items` bằng `[]`.
3. Tạo các state nhập liệu cho `name` và `quantity` (số lượng).
4. Render một form để thêm mặt hàng mua sắm mới gồm tên và số lượng. Chuyển đổi số lượng sang kiểu số nguyên bằng `parseInt()`.
5. Hiển thị danh sách mua sắm động trên giao diện.
