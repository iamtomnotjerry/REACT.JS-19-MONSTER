# Redux Toolkit: Lát cắt (Slices) & Cấu hình Kho lưu trữ (Store) 🔄

**Redux Toolkit (RTK)** là phương thức chính thức, hiện đại và được khuyến nghị để viết các logic Redux ngày nay. Nó được phát triển nhằm giải quyết triệt để 3 khuyết điểm cố hữu của Redux truyền thống: cấu hình store quá phức tạp, quá nhiều dòng mã mẫu (boilerplate code) dư thừa, và phải tự cài đặt nhiều gói thư viện bổ sung thủ công.

---

## ⚡ 1. Hướng dẫn cài đặt

Để cài đặt Redux Toolkit và các thư viện liên kết với React, chạy lệnh sau:

```bash
npm install @reduxjs/toolkit react-redux
```

---

## 🧩 2. Tạo một Lát cắt (`createSlice`)

Một **Slice** là khái niệm của Redux Toolkit dùng để gộp trạng thái ban đầu (initial state), logic reducer và các hàm tạo action (action creators) của một tính năng cụ thể vào trong một tệp duy nhất.

### ⚠️ Phép màu của thư viện Immer
Thông thường, state của Redux bắt buộc phải cập nhật bất biến (ví dụ sử dụng toán tử spread). Tuy nhiên, RTK tích hợp sẵn thư viện **Immer** dưới nền. Điều này cho phép bạn viết mã sửa đổi state trực tiếp (như `state.value += 1` hoặc `state.todos.push(newItem)`) bên trong reducers. Immer sẽ tự động phát hiện, chặn lại các thao tác sửa đổi này và tự chuyển đổi thành mã cập nhật bất biến an toàn.

Tạo tệp `src/features/counterSlice.js` và viết đoạn mã sau:

```javascript
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  title: "Bộ đếm RTK"
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 1. Thư viện Immer giúp chỉnh sửa trực tiếp giá trị một cách an toàn!
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    // 2. Các Action có thể nhận dữ liệu truyền vào qua thuộc tính action.payload
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
    reset: (state) => {
      state.value = 0;
    }
  }
});

// Xuất các hàm tạo action tự động
export const { increment, decrement, incrementByAmount, reset } = counterSlice.actions;

// Xuất reducer để đăng ký vào Store
export default counterSlice.reducer;
```

---

## 🧩 3. Cấu hình Store toàn cục (`configureStore`)

**Store** đóng vai trò là cơ sở dữ liệu toàn cục lưu trữ tất cả các slice reducers của hệ thống. Chúng ta cấu hình nó bằng hàm **`configureStore`**, tự động kích hoạt công cụ Redux DevTools và các middleware cần thiết (như Redux Thunk):

Tạo tệp `src/app/store.js` và viết đoạn mã sau:

```javascript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer, // Đăng ký các slice reducers tại đây
  }
});
```

---

## 🧩 4. Cung cấp Store cho ứng dụng React (`Provider`)

Để các component trong React có thể tương tác với Redux store, hãy bao bọc component gốc của ứng dụng bằng thẻ **`<Provider>`** được import từ thư viện `react-redux`:

Sửa đổi tệp `src/main.jsx` (hoặc tệp root tương đương của bạn):

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

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Redux Toolkit giải quyết 3 vấn đề gì so với Redux truyền thống?
<details>
  <summary><b>Reveal Answer</b></summary>

  Redux Toolkit giải quyết các vấn đề:
  1. **Cấu hình Store phức tạp**: Đơn giản hóa quá trình thiết lập thông qua hàm `configureStore`.
  2. **Quá nhiều mã mẫu**: Hàm `createSlice` gộp chung cả action và reducer, loại bỏ nhu cầu tự viết thủ công các hằng số loại action và hàm khởi tạo action.
  3. **Cài đặt thủ công nhiều gói phụ trợ**: RTK tích hợp sẵn các công cụ cần thiết (như Redux DevTools để gỡ lỗi và Redux Thunk để gọi API).
</details>

### 2. Thư viện Immer hoạt động thế nào bên trong `createSlice`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Immer bao bọc các thay đổi state của bạn bên trong một cây proxy. Nó cho phép bạn viết các câu lệnh thay đổi trực tiếp thông thường (như phép gán `.push()` hay `state.x = y`). Immer theo dõi các hành động đó, tạo một bản dự thảo state dưới nền, rồi tự chuyển hóa thành các đối tượng bất biến trước khi ghi vào store.
</details>

### 3. Chúng ta có viết mã thay đổi state trực tiếp bên ngoài hàm reducer của `createSlice` được không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Thư viện Immer chỉ được kích hoạt hoạt động bên trong phạm vi các hàm reducer được định nghĩa của `createSlice`. Việc viết mã thay đổi trực tiếp thuộc tính đối tượng ở component, hàm helper hoặc các nơi khác sẽ làm biến đổi trực tiếp tham chiếu đối tượng cũ, vi phạm nguyên tắc bất biến của Redux và gây lỗi render.
</details>

### 4. Định dạng đối tượng action được sinh ra tự động bởi `createSlice` như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các đối tượng action tuân thủ theo định dạng **FSA (Flux Standard Action)**:
  ```javascript
  {
    type: "counter/incrementByAmount", // Định dạng: [tênSlice]/[tênReducer]
    payload: 10 // Giá trị truyền vào khi gọi hàm action
  }
  ```
</details>

### 5. Tại sao thẻ `<Provider>` của thư viện react-redux lại bắt buộc phải bao bọc ứng dụng?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thẻ `<Provider>` sử dụng React Context API để cung cấp thực thể Redux store toàn cục xuống cho toàn bộ các component con lồng bên dưới, giúp các hook như `useSelector` và `useDispatch` có thể kết nối và tương tác được với dữ liệu của store.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng Lát cắt Quản lý Công việc (Todo Slice)
1. Tạo một slice tên là `todoSlice.js` trong thư mục `src/features/`.
2. Thiết lập state ban đầu là `{ list: [] }`.
3. Viết 3 hàm reducer bên trong slice:
   - `addTodo(state, action)`: Thêm một công việc mới `{ id: Date.now(), text: action.payload, completed: false }` trực tiếp vào mảng `state.list` (tận dụng tính năng của Immer).
   - `toggleTodo(state, action)`: Tìm kiếm công việc khớp với ID trong `action.payload` và đảo ngược trạng thái `completed`.
   - `deleteTodo(state, action)`: Xóa bỏ công việc khỏi danh sách dựa theo ID nhận được.
4. Đăng ký reducer của `todoSlice` vào tệp cấu hình store `store.js` toàn cục của bạn.
