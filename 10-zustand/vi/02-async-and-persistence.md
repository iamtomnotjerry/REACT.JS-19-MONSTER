# Zustand Hành động Bất đồng bộ & Tiện ích Lưu trữ (Persist Middleware) 🐻

Bài học này hướng dẫn cách viết các hành động bất đồng bộ (như gọi REST APIs) bên trong store của Zustand và cách sử dụng **Zustand Middlewares** tích hợp sẵn để tự động đồng bộ và lưu trữ dữ liệu vào các phân vùng nhớ của trình duyệt (như `localStorage`).

---

## ⚡ 1. Các hành động bất đồng bộ (Async Actions) trong Zustand

Không giống như Redux yêu cầu các cấu hình middleware phức tạp (như Thunk hay Saga) để xử lý các tác vụ bất đồng bộ, các action trong Zustand có thể viết trực tiếp dưới dạng các hàm **`async/await`** thông thường:

```javascript
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Hành động bất đồng bộ
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      if (!res.ok) throw new Error("Không tìm thấy thông tin người dùng!");
      const data = await res.json();
      
      // Cập nhật state sau khi gọi mạng hoàn tất
      set({ user: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  }
}));
```

---

## ⚡ 2. Tự động lưu trữ State bằng `persist` Middleware

Một tính năng vô cùng quan trọng là lưu lại các cài đặt trạng thái (như giỏ hàng, tùy chọn giao diện, hoặc thông tin phiên đăng nhập) để dữ liệu vẫn tồn tại kể cả khi người dùng tải lại (refresh) trình duyệt.

Zustand cung cấp sẵn middleware **`persist`** giúp tự động đồng bộ dữ liệu của store vào `localStorage` (hoặc `sessionStorage`) mà bạn không cần tự viết mã lưu trữ thủ công:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    // 1. Định nghĩa store bình thường
    (set) => ({
      fontSize: "medium",
      notificationsEnabled: true,
      
      setFontSize: (size) => set({ fontSize: size }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled }))
    }),
    // 2. Cấu hình tính năng lưu trữ (persist config)
    {
      name: 'user-app-settings', // Khóa lưu trữ duy nhất trong localStorage
      storage: createJSONStorage(() => localStorage), // Cấu hình phân vùng lưu trữ (tùy chọn)
    }
  )
);
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Chúng ta có cần cấu hình thêm các bộ thư viện phụ trợ (như redux-thunk) để gọi API trong Zustand không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Các action của Zustand là các hàm JavaScript thông thường. Bạn có thể viết chúng dưới dạng các hàm `async` và thực thi các thao tác bất đồng bộ (như gọi API với `await fetch()`) trực tiếp trong store. Khi có kết quả phản hồi, bạn chỉ cần gọi hàm đồng bộ `set()` để lưu trữ dữ liệu.
</details>

### 2. Middleware `persist` xử lý việc mã hóa chuỗi (stringify) và phân tích (parse) dữ liệu như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Middleware `persist` tự động thực hiện việc tuần tự hóa dữ liệu (serialization) ngầm dưới nền. Nó biến đổi state của store thành một chuỗi JSON trước khi ghi vào `localStorage`, và tự động gọi hàm `JSON.parse` để khôi phục lại dữ liệu khi ứng dụng được khởi chạy lại, giúp lập trình viên không cần viết mã cấu hình thủ công.
</details>

### 3. Điều gì xảy ra nếu bạn thêm các hàm (actions) vào một store sử dụng middleware persist? Các hàm này có bị lưu vào `localStorage` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Các hàm không thể tuần tự hóa thành chuỗi JSON. Middleware `persist` đủ thông minh để nhận biết và chỉ lưu trữ các thuộc tính chứa dữ liệu trong store, tự động bỏ qua các trường chứa hàm trong quá trình ghi dữ liệu và khôi phục lại các hàm đó một cách chính xác khi khởi tạo.
</details>

### 4. Khái niệm "Hydration" trong việc lưu trữ store là gì, và tại sao nó có thể gây lỗi trong các framework SSR?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hydration là quá trình mã nguồn React ở client tải và đồng bộ trạng thái vào HTML đã được render trước đó ở server. Trong các framework SSR (như Next.js), máy chủ không có quyền truy cập vào `localStorage` nên sẽ render giao diện với giá trị mặc định. Khi client tải dữ liệu đã lưu lên sẽ tạo ra sự không trùng khớp (mismatch). Lỗi này được giải quyết bằng cách dùng cờ kiểm tra component đã mount ở client trước khi cho hiển thị dữ liệu lưu trữ.
</details>

### 5. Chúng ta có thể chỉ định hoặc giới hạn những phần dữ liệu nào của store được phép lưu trữ không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Bạn có thể sử dụng cấu hình `partialize` trong phần cài đặt của persist. Thuộc tính này nhận vào một hàm callback trả về các key cụ thể mà bạn muốn lưu trữ:
  ```javascript
  {
    name: 'settings',
    partialize: (state) => ({ fontSize: state.fontSize }) // Chỉ lưu thuộc tính 'fontSize'
  }
  ```
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng Giỏ hàng lưu trữ liên kết gọi API
1. Tạo một store tên là `useCartStore.js` trong thư mục `src/stores/`.
2. Bao bọc store này bên trong middleware `persist`.
3. Khai báo một mảng state `cartItems` lưu trữ danh sách sản phẩm: `[{ id, name, price, qty }]`.
4. Viết một hành động bất đồng bộ `fetchProductAndAdd(id)` thực hiện:
   - Gọi thông tin sản phẩm bất đồng bộ từ API `https://jsonplaceholder.typicode.com/todos/${id}` (lấy tiêu đề của todo làm tên sản phẩm, và gán một giá trị giá tiền giả lập).
   - Thêm sản phẩm vừa lấy vào mảng `cartItems` với số lượng mặc định ban đầu `qty` là `1`.
5. Chạy dự án, thực hiện thêm sản phẩm và tải lại trang trình duyệt để xác thực mảng sản phẩm trong giỏ hàng vẫn được bảo toàn nguyên vẹn từ `localStorage`.
