# Hook `useEffect` ⚓

Hook **`useEffect`** là một công cụ cốt lõi trong React cho phép bạn thực hiện các **tác vụ phụ (side effects)** bên trong các functional component. Tác vụ phụ là bất kỳ hành động nào vươn ra ngoài phạm vi của vòng đời render trong React để tương tác với thế giới bên ngoài.

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng việc render một component trong React giống như việc chuẩn bị một món ăn trong bếp nhà hàng. Bản thân món ăn (giao diện HTML) là sản phẩm chính. Một **tác vụ phụ (side effect)** giống như việc yêu cầu bồi bàn nhấn chuông hoặc thông báo cho khách hàng (gửi email, ghi nhật ký, cập nhật tiêu đề trình duyệt) sau khi món ăn được đặt lên quầy phục vụ.

---

## ⚡ 1. Tại sao chúng ta cần `useEffect`?

Trong React, giai đoạn render phải thuần khiết (pure): với cùng props và state, nó phải trả về cùng một mã JSX chính xác mà không làm thay đổi các biến hay gọi các API bên ngoài. Các tác vụ phụ bắt buộc phải diễn ra ngoài vòng lặp render này. Các tác vụ phụ phổ biến bao gồm:
* Lấy dữ liệu từ một API máy chủ backend.
* Thay đổi tiêu đề tài liệu của trình duyệt theo cách thủ công (`document.title`).
* Thiết lập bộ hẹn giờ (`setTimeout`, `setInterval`).
* Thêm các trình lắng nghe sự kiện (event listeners) trực tiếp vào đối tượng toàn cục `window` hoặc `document`.
* Đăng ký nhận dữ liệu từ các nguồn bên ngoài hoặc hệ thống chat.

---

## 🧩 2. Cú pháp và Cấu trúc

Hook `useEffect` nhận vào một hàm callback và một mảng phụ thuộc (dependency array) tùy chọn:

```jsx
import { useEffect } from 'react';

useEffect(() => {
  // 1. Side effect logic goes here
  
  return () => {
    // 2. Optional cleanup function goes here
  };
}, [dependencies]); // 3. Optional dependency array
```

### Ba cấu hình của Mảng phụ thuộc (Dependency Array)

Cách cấu hình mảng phụ thuộc sẽ quyết định thời điểm effect được thực thi:

| Cấu hình | Cú pháp | Thời điểm chạy | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- |
| **Không truyền mảng** | `useEffect(() => {})` | Chạy sau **mỗi một lần render** và re-render của component. | Ghi nhật ký gỡ lỗi (hiếm khi dùng trong môi trường production). |
| **Mảng rỗng** | `useEffect(() => {}, [])` | Chạy **chỉ một lần duy nhất** khi component được nạp lần đầu (render lần đầu tiên). | Lấy dữ liệu ban đầu, thiết lập trình lắng nghe sự kiện toàn cục. |
| **Mảng có phần tử phụ thuộc** | `useEffect(() => {}, [count])` | Chạy khi mount, và sau đó chạy lại **chỉ khi** các giá trị trong mảng thay đổi. | Tự động lưu dữ liệu nhập vào, cập nhật giao diện dựa trên thay đổi của state. |

---

## 🧹 3. Hàm dọn dẹp (Cleanup Function) cực kỳ quan trọng

Khi bạn thiết lập các tài nguyên tồn tại lâu dài (như trình lắng nghe sự kiện, bộ hẹn giờ, hoặc đăng ký web socket), bạn phải dọn dẹp chúng khi component bị hủy (unmount) hoặc trước khi effect chạy lại để ngăn ngừa tình trạng **rò rỉ bộ nhớ (memory leaks)**.

Bạn thực hiện điều này bằng cách trả về một **hàm dọn dẹp (cleanup function)** từ callback của `useEffect`:

```jsx
import { useState, useEffect } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Set up timer
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Return cleanup function to clear interval
    return () => {
      clearInterval(intervalId);
      console.log("Timer cleaned up!");
    };
  }, []); // Run once on mount

  return <h1>Active time: {seconds}s</h1>;
};
```

> [!WARNING]
> Nếu bạn quên xóa bộ hẹn giờ, nó sẽ tiếp tục chạy ngầm ngay cả khi component đã bị xóa khỏi màn hình, gây tiêu tốn bộ nhớ và CPU của trình duyệt.

---

## 🌐 4. Lấy dữ liệu và Ngăn chặn Tình trạng Race Condition

Một trường hợp sử dụng phổ biến là lấy dữ liệu. Tuy nhiên, nếu state thay đổi quá nhanh, các phản hồi có thể trả về theo thứ tự khác với thứ tự yêu cầu (gọi là **race condition**). Chúng ta sử dụng một cờ boolean cục bộ `active` để bỏ qua các phản hồi đã lỗi thời:

```jsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true; // Flag to trace if the component is still active
    setLoading(true);

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setUser(data);
          setLoading(false);
        }
      });

    // Cleanup: set active to false when userId changes or component unmounts
    return () => {
      active = false;
    };
  }, [userId]); // Re-fetch whenever userId changes

  if (loading) return <p>Loading user data...</p>;
  return (
    <div>
      <h3>Name: {user.name}</h3>
      <p>Email: {user.email}</p>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useEffect`. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. "Tác vụ phụ (side effect)" trong React là gì, và tại sao chúng ta không thể viết nó trực tiếp bên trong thân component?
<details>
  <summary><b>Reveal Answer</b></summary>

  Tác vụ phụ là bất kỳ hành động nào tương tác với thế giới bên ngoài (như gọi API mạng, thao tác DOM, đăng ký nhận dữ liệu, bộ hẹn giờ). 
  Chúng ta không thể chạy chúng trực tiếp trong thân component vì thân component được thực thi sau **mỗi lần render**. Nếu bạn gọi API trực tiếp trong thân component, nó sẽ kích hoạt cập nhật state, gây ra re-render, và lại chạy lại lệnh gọi API, dẫn đến một **vòng lặp render vô hạn**.
</details>

### 2. Hàm dọn dẹp (cleanup function) được trả về bởi `useEffect` chạy khi nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm dọn dẹp chạy vào hai thời điểm cụ thể:
  1. Ngay trước khi hàm callback của effect chạy lại (khi các giá trị phụ thuộc thay đổi), nhằm dọn dẹp tác vụ phụ của lần render trước đó.
  2. Khi component bị hủy (bị xóa hoàn toàn khỏi DOM).
</details>

### 3. Điều gì xảy ra nếu bạn cập nhật state bên trong một `useEffect` không có mảng phụ thuộc?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó tạo ra một **vòng lặp vô hạn (infinite loop)**. Việc cập nhật state kích hoạt re-render. Vì không có mảng phụ thuộc, effect sẽ chạy lại sau lần re-render đó. Bên trong effect, state lại được cập nhật một lần nữa, kích hoạt một re-render khác, cứ thế lặp đi lặp lại vô tận và làm treo tab trình duyệt.
</details>

### 4. Tại sao React chạy effect hai lần trong môi trường phát triển (development)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong chế độ phát triển của React 18 và 19 (khi dùng `React.StrictMode`), React cố tình mount, unmount và mount lại các component. Điều này giúp các lập trình viên phát hiện các hàm dọn dẹp bị thiếu (ví dụ: trình lắng nghe sự kiện hoặc bộ hẹn giờ vẫn còn hoạt động) – những nguyên nhân có thể gây rò rỉ bộ nhớ.
</details>

### 5. Làm thế nào để giải quyết tình trạng race condition khi lấy dữ liệu bằng `useEffect`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn sử dụng một cờ boolean cục bộ (ví dụ: `let active = true;`) bên trong effect. Khi component bị hủy hoặc các giá trị phụ thuộc thay đổi, hàm dọn dẹp sẽ đặt `active = false`. Trước khi cập nhật state bằng phản hồi từ API, bạn kiểm tra `if (active)`. Điều này ngăn không cho React cập nhật state bằng các kết quả API đã lỗi thời.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Danh sách thư mục người dùng
1. Tạo một component `UserDirectory.jsx` trong `src/components/`.
2. Lấy danh sách người dùng từ `https://jsonplaceholder.typicode.com/users` bằng `useEffect` với mảng phụ thuộc rỗng.
3. Lưu danh sách người dùng vào một biến state `users`.
4. Render danh sách tên người dùng. Nhúng component này vào trang `App.jsx` chính của bạn.

### 🛠️ Bài tập 2: Theo dõi tọa độ chuột (Trình lắng nghe đã được dọn dẹp)
1. Tạo một component `MouseTracker.jsx`.
2. Thiết lập một trình lắng nghe sự kiện trong `useEffect` để theo dõi sự kiện `mousemove` của cửa sổ trình duyệt:
   ```javascript
   const handleMouseMove = (e) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   window.addEventListener('mousemove', handleMouseMove);
   ```
3. Trả về một hàm dọn dẹp để gỡ bỏ trình lắng nghe sự kiện này một cách chính xác.
4. Render tọa độ `x` và `y` lên màn hình. Kiểm tra trong console của bạn để xác nhận việc dọn dẹp được thực thi khi bạn tắt component theo dõi.
