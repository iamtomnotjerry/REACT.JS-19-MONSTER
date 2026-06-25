# Custom Hooks trong React ⚓

Trong React, **Custom Hooks** là các hàm JavaScript cho phép bạn tách và chia sẻ logic của component (stateful logic, side effects, timers) giữa nhiều component khác nhau. Custom hook bắt buộc phải bắt đầu bằng tiền tố **`use`** (ví dụ: `useFetch`, `useLocalStorage`, `useToggle`).

---

## 🌟 Khái niệm & Tổng quan

Một custom hook **không** giới thiệu một tính năng React mới — nó chỉ đơn giản là một hàm *kết hợp* (compose) các built-in hook (`useState`, `useEffect`, `useRef`, `useId`, v.v.) thành một đơn vị duy nhất có thể tái sử dụng. Khi bạn thấy mình đang copy-paste cùng một khối `useState` + `useEffect` để fetch dữ liệu vào ba component khác nhau, đó chính là tín hiệu để tách nó ra thành một custom hook.

> [!NOTE]
> **Các Rules of Hooks luôn luôn được áp dụng.** Một custom hook là một hàm bình thường, nhưng vì nó *gọi* các hook khác, nó phải tuân theo cùng hai quy tắc như bất kỳ component nào: (1) chỉ gọi hook ở **cấp cao nhất** (top level), và (2) chỉ gọi hook từ **các hàm React** (component hoặc các custom hook khác). Tiền tố `use` là thứ báo cho linter của React để bắt buộc thực thi các quy tắc này bên trong hàm của bạn.

> [!WARNING]
> **Đừng bao giờ gọi hook một cách có điều kiện.** Đừng đặt một lời gọi hook bên trong khối `if`, vòng lặp, hoặc callback lồng nhau. React dựa vào việc các hook được gọi theo **cùng một thứ tự ở mỗi lần render** để khớp mỗi giá trị state với đúng vị trí của nó. Việc bọc `useState` hay `useEffect` trong một điều kiện sẽ phá vỡ thứ tự đó và sẽ ném ra lỗi `Rendered fewer hooks than expected` hoặc âm thầm làm hỏng state của bạn.

```jsx
// ❌ WRONG — hook called conditionally
function Bad({ enabled }) {
  if (enabled) {
    const [value, setValue] = useState(0); // breaks hook order!
  }
}

// ✅ CORRECT — hook always called, condition lives inside
function Good({ enabled }) {
  const [value, setValue] = useState(0);
  if (!enabled) return null; // early return AFTER hooks is fine
}
```

> [!TIP]
> Một custom hook chia sẻ **logic**, không phải **state**. Mỗi component gọi `useFetch(url)` đều nhận được `data`, `loading`, và `error` riêng tư của mình — không có giá trị global nào được chia sẻ cả. Nếu bạn cần state được chia sẻ giữa nhiều component, hãy dùng Context hoặc một store (Zustand/Redux), chứ không phải custom hook.

---

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng bạn đang lắp ráp các phương tiện Lego khác nhau: xe hơi, xe tải và máy bay. Tất cả chúng đều cần bánh xe hoặc bộ bánh đáp. Thay vì thiết kế lại cụm bánh xe từ đầu cho từng phương tiện, bạn chế tạo một "khối bánh xe tiêu chuẩn" (Custom Hook) một lần, rồi gắn nó vào bất kỳ phương tiện nào cần dùng. Mỗi phương tiện vẫn có **bộ bánh xe vật lý riêng của mình** (state riêng biệt của nó) — chúng chỉ chia sẻ cùng một **bản thiết kế** (blueprint, tức là phần logic).

---

## 🔍 Custom Hook vs. Helper Function vs. Component

Rất dễ nhầm lẫn ba khối xây dựng này. Đây là cách chúng khác nhau:

| Tính năng | Custom Hook (`useX`) | Hàm Helper / Utility | Component |
| --- | --- | --- | --- |
| Quy ước đặt tên | Phải bắt đầu bằng `use` | Tên bất kỳ (ví dụ `formatDate`) | PascalCase (ví dụ `PostList`) |
| Có thể gọi hook khác? | ✅ Có | ❌ Không | ✅ Có |
| Có thể giữ React state? | ✅ Có (`useState`) | ❌ Không | ✅ Có |
| Trả về | Bất kỳ giá trị nào (object, array, primitive) | Bất kỳ giá trị nào | JSX / React elements |
| Chạy lại khi render? | ✅ Có (cùng với component) | Chỉ khi được gọi tường minh | ✅ Có |
| Mục đích | Tái sử dụng **stateful logic** | Tái sử dụng **tính toán thuần (pure)** | Tái sử dụng **UI** |

---

## ⚡ 1. Các Rules of Hooks (Ôn tập)

Trước khi xây dựng custom hook, bạn phải tuân thủ nghiêm ngặt các quy tắc sau:
1. **Chỉ gọi Hook ở cấp cao nhất (Top Level)**: Không gọi hook bên trong vòng lặp, câu lệnh điều kiện (khối `if`), hoặc các hàm lồng nhau.
2. **Chỉ gọi Hook từ các hàm React**: Gọi hook từ các functional component của React hoặc từ các custom hook khác.
3. **Bắt đầu bằng tiền tố `use`**: Quy ước đặt tên này là bắt buộc. Nó cho phép linter của React nhận biết rằng hàm này chứa các lời gọi hook (như `useState` hay `useEffect`) và áp dụng các quy tắc về hook.

---

## 🧩 2. Ví dụ 1: `useFetch` (Logic gọi dữ liệu mạng)

Thay vì viết lại `useState` và `useEffect` cho việc fetch dữ liệu ở mỗi component, chúng ta có thể gộp chúng vào một hook `useFetch` có khả năng tái sử dụng:

```javascript
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true; // guards against setting state after unmount
    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((jsonData) => {
        if (active) {
          setData(jsonData);
          setError(null);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    // Cleanup: flip the flag so a late response is ignored
    return () => {
      active = false;
    };
  }, [url]); // re-fetch whenever the URL changes

  return { data, loading, error };
};
```

### Cách sử dụng `useFetch` trong một Component:

```jsx
import { useFetch } from './hooks/useFetch';

const PostList = () => {
  // Destructure and rename `data` to `posts` for readability
  const { data: posts, loading, error } = useFetch("https://jsonplaceholder.typicode.com/posts?_limit=5");

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}><strong>{post.title}</strong></li>
      ))}
    </ul>
  );
};
```

> [!TIP]
> Lưu ý rằng các **early return** cho `loading` và `error` nằm *sau* lời gọi `useFetch`. Đây là pattern đúng — gọi hook của bạn một cách vô điều kiện ở trên cùng, sau đó mới rẽ nhánh dựa trên kết quả của nó.

---

## 🧩 3. Ví dụ 2: `useWindowSize` (Kích thước màn hình responsive)

Custom hook này theo dõi chiều rộng và chiều cao của cửa sổ một cách linh hoạt, và tự động dọn dẹp các event listener:

```javascript
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup event listener to prevent memory leaks
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // empty array: attach the listener once on mount

  return windowSize;
};
```

---

## 🔄 4. Vòng đời của một Custom Hook (Sơ đồ)

Khi hai component gọi cùng một hook, mỗi component nhận được một **instance độc lập** của logic:

```text
        ┌─────────────────────────┐        ┌─────────────────────────┐
        │   <PostList />          │        │   <Comments />          │
        │   useFetch("/posts")    │        │   useFetch("/comments") │
        └───────────┬─────────────┘        └───────────┬─────────────┘
                    │                                  │
                    ▼                                  ▼
        ┌─────────────────────────┐        ┌─────────────────────────┐
        │ OWN data / loading /    │        │ OWN data / loading /    │
        │ error  (isolated!)      │        │ error  (isolated!)      │
        └─────────────────────────┘        └─────────────────────────┘
                    └──────── shared LOGIC, separate STATE ──────────┘
```

Bản thiết kế (phần thân hàm) được chia sẻ. Các bánh xe (các giá trị `useState`) được đúc mới cho mỗi caller.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Custom Hooks. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Việc gọi một custom hook ở hai component khác nhau có chia sẻ state giữa chúng không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Custom hook chia sẻ **stateful logic**, không phải bản thân state. Mỗi lần bạn gọi một custom hook, tất cả các biến state và effect bên trong nó đều được tạo mới và độc lập cho instance cụ thể của component đó.
</details>

### 2. Tại sao custom hook bắt buộc phải bắt đầu bằng từ "use"?
<details>
  <summary><b>Reveal Answer</b></summary>

  Tiền tố này được yêu cầu bởi trình biên dịch (compiler) của React và các công cụ linter (ESLint plugin for React Hooks). Nó báo hiệu cho hệ thống rằng hàm này có thể gọi các React hook chuẩn (`useState`, `useEffect`, v.v.), cho phép linter kiểm tra rằng các Rules of Hooks được tuân thủ.
</details>

### 3. Một custom hook có thể trả về thứ gì đó khác ngoài một array hoặc một object không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Custom hook chỉ là một hàm JavaScript bình thường. Nó có thể trả về bất cứ thứ gì: một giá trị đơn (string, number, boolean), một array, một object, hoặc thậm chí không trả về gì cả. Trả về object phổ biến cho các custom hook có nhiều giá trị (như `useFetch`), trong khi trả về array phổ biến cho các API kiểu hook (như `useState`).
</details>

### 4. Chúng ta có thể gọi một React hook bên trong một hàm utility helper thông thường không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Bạn chỉ có thể gọi React hook bên trong các functional component của React hoặc các custom hook khác (cũng bắt đầu bằng `use`). Việc gọi chúng trong các hàm helper thông thường sẽ dẫn đến lỗi biên dịch/lỗi runtime.
</details>

### 5. Tại sao việc gọi một hook bên trong khối `if` là không hợp lệ, và giải pháp thay thế đúng đắn là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  React khớp mỗi lời gọi hook với "slot" state nội bộ của nó dựa trên **thứ tự** mà các hook được gọi ở mỗi lần render. Nếu một hook bị bọc trong một điều kiện, thứ tự đó sẽ thay đổi giữa các lần render, nên React không còn có thể khớp đúng state với đúng hook nữa (bạn sẽ thấy lỗi `Rendered fewer hooks than expected`). Giải pháp thay thế đúng đắn là luôn gọi hook một cách vô điều kiện ở **cấp cao nhất (top level)** của hàm, và đặt logic điều kiện *bên trong* hook hoặc chỉ dùng `return` sớm **sau khi** tất cả các hook đã chạy.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Xây dựng Hook `useLocalStorage`
1. Tạo một tệp `useLocalStorage.js` bên trong một thư mục `src/hooks/` mới.
2. Hook nhận vào một `key` và một `initialValue`.
3. Đọc giá trị từ `localStorage` khi khởi tạo bằng cách dùng dạng **lazy initializer** của `useState` để nó chỉ chạy một lần:
   ```javascript
   const [value, setValue] = useState(() => {
     const saved = localStorage.getItem(key);
     return saved ? JSON.parse(saved) : initialValue;
   });
   ```
4. Dùng một `useEffect` phụ thuộc vào `[key, value]` để ghi giá trị đã serialize trở lại `localStorage` mỗi khi nó thay đổi:
   ```javascript
   useEffect(() => {
     localStorage.setItem(key, JSON.stringify(value));
   }, [key, value]);
   ```
5. Trả về một array `[value, setValue]` (phản chiếu lại API của `useState`).
6. Kiểm tra bằng cách lưu giữ giá trị của một ô nhập văn bản (text input) qua các lần refresh trang.

> [!WARNING]
> Hãy chắc chắn rằng bạn gọi `useState` và `useEffect` ở cấp cao nhất của hook — không bao giờ đặt bên trong phần kiểm tra `if (saved)`. Thay vào đó hãy chuyển logic điều kiện vào *bên trong* initializer.

### 🛠️ Bài tập 2: Xây dựng Hook `useOnlineStatus`
1. Tạo một hook `useOnlineStatus.js`.
2. Khởi tạo state từ `navigator.onLine` để lần render đầu tiên được chính xác.
3. Nó nên trả về một giá trị boolean (`true` nếu online, `false` nếu offline).
4. Lắng nghe các sự kiện `online` và `offline` của window trong một hook `useEffect` và **dọn dẹp chúng** trong hàm cleanup được trả về.
5. Render một banner hoặc chỉ báo trên trang chính của bạn để hiển thị tình trạng kết nối mạng của trình duyệt.

### 🛠️ Bài tập 3 (Nâng cao): Refactor một component để dùng `useFetch`
1. Tìm (hoặc xây dựng) một component fetch dữ liệu trực tiếp với `useState` + `useEffect` viết inline.
2. Tách logic đó ra thành hook `useFetch` đã trình bày ở trên.
3. Thay thế logic inline bằng một lời gọi duy nhất `const { data, loading, error } = useFetch(url);`.
4. Xác nhận rằng component vẫn render giống hệt như trước — giờ đây bạn đã biến logic thành có thể tái sử dụng trên toàn bộ ứng dụng của mình.
