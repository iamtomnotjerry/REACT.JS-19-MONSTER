# Zustand Async Actions & Persistence Middleware 🐻

Bài học này trình bày cách viết các action bất đồng bộ (như gọi REST API) bên trong các store của Zustand và cách sử dụng các **Zustand Middleware** tích hợp sẵn để tự động lưu trữ các giá trị state vào bộ nhớ của trình duyệt (như `localStorage`).

---

## 🎯 Khái niệm & Tổng quan

Trong các ứng dụng thực tế, state hiếm khi chỉ tồn tại cục bộ và tạm thời. Bạn fetch dữ liệu từ server, và bạn muốn một số giá trị nhất định (theme, giỏ hàng, auth token) **vẫn tồn tại sau khi tải lại trang**. Zustand đáp ứng cả hai nhu cầu này với rất ít thủ tục rườm rà.

Hai ý tưởng dẫn dắt bài học này:

1. **Async actions** — Một action trong Zustand chỉ là một hàm thông thường. Nếu nó cần `await` điều gì đó, hãy đánh dấu nó là `async`. Không có lớp "thunk" hay "saga" đặc biệt nào cần phải cài đặt.
2. **Persistence (Lưu trữ bền vững)** — Middleware `persist` tự động phản chiếu store của bạn vào `localStorage`/`sessionStorage`, rồi tải lại nó khi khởi động.

> [!NOTE]
> Các async action trong Zustand **không cần thêm middleware** nào. Vì action là các hàm JavaScript thông thường, bạn có thể viết `async fetchUser()` và gọi `set()` bất cứ khi nào `await` của bạn hoàn tất. Đây là sự thay đổi tư duy lớn nhất khi đến từ Redux, nơi mà logic bất đồng bộ buộc bạn phải thêm Thunk/Saga và dispatch nhiều loại action.

> [!WARNING]
> Middleware `persist` đọc từ `localStorage`, vốn **không tồn tại trên server**. Trong các framework SSR (Next.js, Remix), server render với các giá trị mặc định trong khi client rehydrate với các giá trị đã lưu — tạo ra cảnh báo **hydration mismatch** (không trùng khớp khi hydrate). Hãy phòng tránh bằng cách trì hoãn việc hiển thị UI đã được persist cho đến sau khi mount (ví dụ một cờ `hasHydrated` hoặc hook `onRehydrateStorage`). Xem Mục 3.

> [!TIP]
> Chỉ persist những gì bạn thực sự cần. Việc lưu toàn bộ store (bao gồm cả các cờ tạm thời như `loading`/`error`) vào `localStorage` là lãng phí và có thể làm sống lại các state cũ kỹ khi tải lại. Hãy dùng `partialize` để chọn lọc (whitelist) các key.

### 🌍 Phép ẩn dụ thực tế

Hãy hình dung store Zustand của bạn như một **tấm bảng trắng trong văn phòng**:

- **Không có persistence**, tấm bảng trắng bị xóa sạch mỗi đêm (mỗi lần tải lại trang). Mọi người bắt đầu từ một tấm bảng trống vào sáng hôm sau.
- **Với middleware `persist`**, một trợ lý chăm chỉ chụp ảnh tấm bảng trước khi ra về (ghi vào `localStorage`) và vẽ lại y hệt vào mỗi sáng (rehydration). Cả nhóm tiếp tục như thể chưa có gì xảy ra.
- **Một async action** giống như việc cử một người giao chuyển đi lấy một tài liệu từ kho lưu trữ. Bạn ghi chú "người giao chuyển đang đi" lên bảng (`set({ loading: true })`), tiếp tục làm việc, và cập nhật tấm bảng khi người giao chuyển quay về với tài liệu — hoặc với tin xấu (`set({ error })`).

### 📊 Redux vs. Zustand cho Async & Persistence

| Vấn đề                  | Redux (cổ điển)                          | Zustand                                   |
| ----------------------- | ---------------------------------------- | ----------------------------------------- |
| Logic bất đồng bộ       | Cần middleware Thunk/Saga                | Hàm `async` thông thường bên trong store  |
| Dispatch action         | `dispatch(action)` + reducer + types     | Gọi `set()` trực tiếp                     |
| Mã rườm rà (Boilerplate)| Action creators, types, reducers         | Một hàm                                   |
| Persistence             | `redux-persist` (cài đặt/thiết lập riêng)| Middleware `persist` tích hợp sẵn         |
| Tuần tự hóa lưu trữ     | Cấu hình / transforms thủ công           | Tự động `JSON.stringify` / `JSON.parse`   |

---

## ⚡ 1. Các Action Bất đồng bộ trong Zustand

Không giống như Redux vốn yêu cầu middleware phức tạp (như Thunk hay Saga) để xử lý mã bất đồng bộ, các action của Zustand có thể được viết trực tiếp dưới dạng các hàm **`async/await`** tiêu chuẩn:

```javascript
import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  // Async Action
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      if (!res.ok) throw new Error("User profile not found!");
      const data = await res.json();

      // Update state when network request completes
      set({ user: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  }
}));
```

> [!NOTE]
> Hãy lưu ý ba lời gọi `set()` mô tả toàn bộ vòng đời của một request: **bắt đầu** (`loading: true`), **thành công** (`user: data`), và **thất bại** (`error`). Bộ ba `loading / data / error` này là hình dạng chuẩn cho bất kỳ action fetch dữ liệu nào.

---

## ⚡ 2. Tự động lưu trữ State (`persist` Middleware)

Một tính năng được yêu cầu nhiều là lưu các cấu hình state (như giỏ hàng, kiểu giao diện theme, hoặc thông tin đăng nhập) để chúng vẫn tồn tại sau khi tải lại trình duyệt.

Zustand cung cấp một middleware **`persist`** tích hợp sẵn giúp tự động đồng bộ các state của store vào `localStorage` (hoặc `sessionStorage`) mà không cần bất kỳ setter lưu trữ thủ công nào:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    // 1. Standard store definition
    (set) => ({
      fontSize: "medium",
      notificationsEnabled: true,

      setFontSize: (size) => set({ fontSize: size }),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled }))
    }),
    // 2. Persistence configurations
    {
      name: 'user-app-settings', // Unique storage key name in localStorage
      storage: createJSONStorage(() => localStorage), // Default storage (optional config)
    }
  )
);
```

### 🎛️ Lưu trữ chọn lọc với `partialize`

Thông thường bạn chỉ muốn persist một tập con của store và bỏ lại các trường tạm thời. Tùy chọn `partialize` nhận vào một selector trả về đúng những key bạn muốn lưu:

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],            // We DO want to persist this
      loading: false,           // Transient — should NOT be persisted
      error: null,              // Transient — should NOT be persisted

      addItem: (item) =>
        set((state) => ({ cartItems: [...state.cartItems, item] })),
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
      // Only 'cartItems' is written to localStorage; loading/error stay in memory only
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
```

---

## ⚡ 3. Hydration An toàn (SSR & Lần Render Đầu tiên)

Vì `localStorage` không khả dụng trên server, các store được persist có thể bị lệch (desync) giữa HTML được render từ server và client. Hook `onRehydrateStorage` cho phép bạn lật một cờ ngay khi quá trình rehydration kết thúc, để bạn có thể hoãn việc render UI đã được persist cho đến khi an toàn:

```jsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      hasHydrated: false, // Tracks whether localStorage has been read

      setTheme: (theme) => set({ theme }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => localStorage),
      // Fires after the persisted value has been merged into the store
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Consuming component: avoid the SSR/client mismatch by waiting for hydration
export const ThemeBadge = () => {
  const theme = useThemeStore((s) => s.theme);
  const hasHydrated = useThemeStore((s) => s.hasHydrated);

  // Render a neutral placeholder until the persisted value is loaded
  if (!hasHydrated) return <span>Loading theme…</span>;

  return <span>Current theme: {theme}</span>;
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về middleware và async action trong Zustand. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Chúng ta có cần thêm bất kỳ cấu hình thunk nào để xử lý các thao tác bất đồng bộ trong Zustand không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Các action của Zustand là các hàm JavaScript tiêu chuẩn. Bạn có thể viết chúng dưới dạng các hàm `async` và thực hiện các thao tác bất đồng bộ (như dùng `await fetch()`) trực tiếp bên trong store. Khi request hoàn tất, bạn chỉ cần gọi hàm đồng bộ `set()` để lưu dữ liệu.
</details>

### 2. Middleware `persist` xử lý việc parse và stringify dữ liệu như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Middleware `persist` xử lý việc tuần tự hóa (serialization) đối tượng một cách tự động ngầm bên dưới. Nó chuyển đổi state của store thành một chuỗi JSON trước khi ghi vào `localStorage`, và tự động chạy `JSON.parse` để khôi phục state khi ứng dụng mount, giúp bạn không phải viết mã rườm rà.
</details>

### 3. Điều gì xảy ra nếu bạn thêm các action (hàm) vào một store đã được persist? Các hàm này có được lưu vào `localStorage` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Các hàm không thể được tuần tự hóa thành JSON. Middleware `persist` đủ thông minh để nhận diện và chỉ tuần tự hóa các thuộc tính dữ liệu trong store, tự động bỏ qua các tham chiếu hàm trong quá trình serialization và khôi phục các hàm một cách chính xác khi khởi tạo.
</details>

### 4. "Hydration" là gì trong ngữ cảnh của các store đã được persist, và tại sao nó có thể gây ra vấn đề trong các framework SSR?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hydration là quá trình mà mã React ở phía client tải và gắn kết (bind) state vào HTML đã được render từ server. Trong các framework SSR (như Next.js), server không có quyền truy cập vào `localStorage` của trình duyệt và render các giá trị mặc định. Nếu client tải các giá trị đã persist khi mount, nó sẽ tạo ra sự không trùng khớp (mismatch). Vấn đề này được giải quyết bằng cách dùng hook `onRehydrateStorage` hoặc kiểm tra trạng thái mounting ở client trước khi hiển thị các bố cục đã được persist.
</details>

### 5. Chúng ta có thể chọn lọc hoặc giới hạn những phần cụ thể nào của store được persist không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Bạn có thể sử dụng tùy chọn cấu hình `partialize` bên trong phần cài đặt persist. Nó nhận vào một hàm selector chỉ định những key bạn muốn tuần tự hóa:
  ```javascript
  {
    name: 'settings',
    partialize: (state) => ({ fontSize: state.fontSize }) // Only saves 'fontSize'
  }
  ```
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Giỏ hàng được Persist với các Phép tính từ API
1. Tạo một store tên là `useCartStore.js` trong `src/stores/`.
2. Bao bọc nó bên trong middleware `persist`.
3. Giữ một mảng `cartItems` lưu trữ các đối tượng sản phẩm: `[{ id, name, price, qty }]`.
4. Tạo một action `fetchProductAndAdd(id)` thực hiện:
   - Fetch thông tin chi tiết sản phẩm một cách bất đồng bộ từ `https://jsonplaceholder.typicode.com/todos/${id}` (coi tiêu đề của todo là tên sản phẩm, và tạo ra một mức giá giả lập).
   - Thêm nó vào `cartItems` với số lượng là `1`.
5. Thêm các trường state `loading` và `error`, và thiết lập chúng một cách phù hợp trong suốt vòng đời của quá trình fetch (bắt đầu → thành công → thất bại).
6. Sử dụng `partialize` sao cho **chỉ** `cartItems` được ghi vào `localStorage` (giữ `loading`/`error` ngoài bộ nhớ lưu trữ).
7. Chạy ứng dụng, thêm các sản phẩm, và tải lại trình duyệt để xác minh rằng các sản phẩm trong giỏ được tải thành công từ `localStorage` (và rằng `loading` KHÔNG xuất hiện lại bị kẹt ở `true` sau khi tải lại).

### 🛠️ Bài tập 2: Theme Toggle An toàn với Hydration
1. Tạo một store tên là `useThemeStore.js` được bao bọc trong `persist` với một giá trị `theme` (`'light'` | `'dark'`) và một action `toggleTheme`.
2. Thêm một boolean `hasHydrated` và thiết lập nó thành `true` bên trong một callback `onRehydrateStorage`.
3. Xây dựng một component `ThemeToggle` thực hiện:
   - Đọc `theme`, `toggleTheme`, và `hasHydrated` thông qua các selector.
   - Render một placeholder trung tính (ví dụ một nút bị vô hiệu hóa) trong khi `hasHydrated` là `false`.
   - Render toggle thật sự một khi hydration hoàn tất.
4. Tải lại trang nhiều lần và xác nhận rằng bạn **không** thấy cảnh báo "hydration mismatch" nào trong console và theme đã chọn vẫn được giữ lại qua các lần tải lại.
