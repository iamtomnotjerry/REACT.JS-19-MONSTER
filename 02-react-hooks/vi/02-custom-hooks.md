# Custom Hooks (Hook Tự Thiết Kế) trong React ⚓

Trong React, **Custom Hooks** là các hàm JavaScript cho phép bạn tách và chia sẻ logic quản lý trạng thái (stateful logic, side effects, bộ hẹn giờ) giữa nhiều component khác nhau. Custom hook bắt buộc phải bắt đầu bằng tiếp đầu ngữ **`use`** (ví dụ: `useFetch`, `useLocalStorage`, `useToggle`).

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng bạn đang lắp ráp các phương tiện Lego khác nhau: xe hơi, xe tải và máy bay. Tất cả chúng đều cần bánh xe hoặc bộ bánh đáp. Thay vì phải thiết kế lại cụm bánh xe từ đầu cho từng phương tiện, bạn chế tạo một "khối bánh xe tiêu chuẩn" (Custom Hook) một lần và chỉ cần gắn nó vào bất kỳ phương tiện nào cần dùng.

---

## ⚡ 1. Quy tắc sử dụng Hook (Rules of Hooks)

Trước khi xây dựng các custom hook, bạn phải tuân thủ nghiêm ngặt các quy tắc sau:
1. **Chỉ gọi Hook ở cấp cao nhất**: Không gọi hook bên trong vòng lặp, câu lệnh điều kiện (`if`) hoặc các hàm lồng nhau.
2. **Chỉ gọi Hook từ các hàm React**: Chỉ gọi hook từ các component functional của React hoặc từ các custom hook khác.
3. **Bắt đầu bằng chữ `use`**: Quy ước đặt tên này là bắt buộc. Nó giúp công cụ linter của React nhận biết hàm này chứa các lời gọi hook tiêu chuẩn (như `useState` hay `useEffect`) và áp dụng các quy tắc kiểm tra tương ứng.

---

## 🧩 2. Ví dụ 1: `useFetch` (Logic gọi dữ liệu mạng)

Thay vì viết đi viết lại `useState` và `useEffect` cho việc gọi dữ liệu ở mỗi component, chúng ta có thể gộp chúng vào một custom hook `useFetch` có khả năng tái sử dụng cao:

```javascript
import { useState, useEffect } from 'react';

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu");
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

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, error };
};
```

### Cách sử dụng `useFetch` trong một Component:

```jsx
import { useFetch } from './hooks/useFetch';

const PostList = () => {
  const { data: posts, loading, error } = useFetch("https://jsonplaceholder.typicode.com/posts?_limit=5");

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}><strong>{post.title}</strong></li>
      ))}
    </ul>
  );
};
```

---

## 🧩 3. Ví dụ 2: `useWindowSize` (Theo dõi kích thước màn hình)

Custom hook này theo dõi chiều rộng và chiều cao của cửa sổ trình duyệt một cách linh hoạt, đồng thời tự động dọn dẹp các sự kiện lắng nghe:

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
    
    // Dọn dẹp sự kiện lắng nghe
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Custom Hooks. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Việc gọi cùng một custom hook ở hai component khác nhau có chia sẻ dữ liệu state giữa chúng không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Custom hook chỉ chia sẻ **logic quản lý trạng thái**, không chia sẻ dữ liệu state thực tế. Mỗi khi bạn gọi một custom hook, tất cả các biến state và hiệu ứng (effects) bên trong nó sẽ được tạo mới hoàn toàn và hoàn toàn độc lập cho instance của component đó.
</details>

### 2. Tại sao custom hook bắt buộc phải bắt đầu bằng từ khóa "use"?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đây là quy định bắt buộc của trình biên dịch React và các công cụ kiểm tra cú pháp linter (ESLint plugin for React Hooks). Nó giúp hệ thống nhận diện rằng hàm này có thể gọi các hook chuẩn của React (`useState`, `useEffect`...), từ đó linter có thể tự động kiểm tra xem các Quy tắc của Hook có được tuân thủ đúng hay không.
</details>

### 3. Một custom hook có thể trả về kiểu dữ liệu khác ngoài mảng hoặc đối tượng không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Custom hook thực chất là một hàm JavaScript bình thường. Nó có thể trả về bất kỳ dữ liệu gì: một giá trị đơn (chuỗi, số, boolean), một mảng, một đối tượng, hoặc thậm chí không trả về gì cả. Việc trả về đối tượng rất phổ biến khi hook cần cung cấp nhiều biến/hàm (như `useFetch`), trong khi trả về mảng thường bắt chước cú pháp của `useState`.
</details>

### 4. Chúng ta có thể gọi một React hook bên trong một hàm tiện ích (helper utility function) thông thường không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Bạn chỉ có thể gọi React hook bên trong các component functional của React hoặc các custom hook khác (cũng bắt đầu bằng `use`). Việc gọi chúng trong các hàm helper bình thường sẽ gây ra lỗi khi biên dịch hoặc chạy ứng dụng.
</details>

### 5. Tại sao việc sử dụng custom hook lại tối ưu hơn việc viết trực tiếp state trong các component trang?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó tuân thủ nguyên lý **DRY (Don't Repeat Yourself - Đừng lặp lại chính mình)**. Việc này tách biệt rõ ràng giữa thiết kế giao diện (JSX) và logic xử lý (gọi API/quản lý trạng thái), giúp mã nguồn sạch sẽ, dễ dàng tái sử dụng và kiểm thử (unit test) các hàm xử lý logic một cách độc lập.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Tự xây dựng Hook `useLocalStorage`
1. Tạo một tệp `useLocalStorage.js` bên trong thư mục `src/hooks/`.
2. Hook nhận vào một `key` (khóa) và một `initialValue` (giá trị ban đầu).
3. Đọc dữ liệu từ `localStorage` khi mount:
   ```javascript
   const saved = localStorage.getItem(key);
   return saved ? JSON.parse(saved) : initialValue;
   ```
4. Trả về một mảng chứa trạng thái hiện tại và một hàm cập nhật có khả năng cập nhật đồng thời cả state và lưu giá trị đó vào `localStorage`.
5. Kiểm tra bằng cách tạo một ô nhập văn bản và đảm bảo nội dung vẫn giữ nguyên khi bạn tải lại trang.

### 🛠️ Bài tập 2: Tự xây dựng Hook `useOnlineStatus`
1. Tạo một hook `useOnlineStatus.js`.
2. Hook này trả về giá trị boolean (`true` nếu có kết nối mạng, `false` nếu mất mạng).
3. Lắng nghe các sự kiện `online` và `offline` của đối tượng window trong `useEffect` và dọn dẹp các sự kiện lắng nghe một cách chính xác.
4. Hiển thị một biểu ngữ hoặc chỉ báo trực quan trên trang chính để báo tình trạng kết nối mạng của trình duyệt.
