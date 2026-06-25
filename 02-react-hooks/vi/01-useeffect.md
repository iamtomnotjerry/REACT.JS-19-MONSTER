# Hook `useEffect` ⚓

Hook **`useEffect`** là một công cụ cốt lõi trong React cho phép bạn thực hiện các **tác vụ phụ (side effects)** bên trong các functional component. Tác vụ phụ là bất kỳ hành động nào tương tác với thế giới bên ngoài vòng đời hiển thị (render cycle) của React.

### 💡 Ví dụ thực tế dễ hiểu
Hãy tưởng tượng việc hiển thị một component trong React giống như việc chuẩn bị món ăn trong bếp nhà hàng. Bản thân món ăn (giao diện HTML) là sản phẩm chính. Một **tác vụ phụ (side effect)** giống như việc yêu cầu bồi bàn nhấn chuông thông báo cho khách hàng (gửi email, ghi nhật ký, cập nhật tiêu đề trình duyệt) sau khi món ăn được đặt lên quầy phục vụ.

---

## ⚡ 1. Tại sao chúng ta cần `useEffect`?

Trong React, quá trình render (hiển thị) phải hoàn toàn thuần khiết (pure): với cùng props và state, nó phải trả về cùng một mã JSX mà không làm thay đổi các biến số bên ngoài hoặc gọi các API bên ngoài. Các tác vụ phụ bắt buộc phải diễn ra ngoài vòng lặp render này. Các tác vụ phụ phổ biến bao gồm:
* Lấy dữ liệu từ một API máy chủ backend.
* Thay đổi tiêu đề tài liệu của trình duyệt (`document.title`).
* Thiết lập bộ hẹn giờ (`setTimeout`, `setInterval`).
* Thêm các trình lắng nghe sự kiện (event listeners) trực tiếp vào đối tượng toàn cục `window` hoặc `document`.
* Đăng ký nhận dữ liệu từ các nguồn bên ngoài hoặc hệ thống chat.

---

## 🧩 2. Cú pháp và Cấu trúc

Hook `useEffect` nhận vào một hàm callback và một mảng phụ thuộc (dependency array) tùy chọn:

```jsx
import { useEffect } from 'react';

useEffect(() => {
  // 1. Logic tác vụ phụ (side effect) nằm ở đây
  
  return () => {
    // 2. Hàm dọn dẹp (cleanup function) tùy chọn nằm ở đây
  };
}, [dependencies]); // 3. Mảng phụ thuộc tùy chọn
```

### Ba cấu hình của Mảng phụ thuộc (Dependency Array)

Cách cấu hình mảng phụ thuộc sẽ quyết định thời điểm tác vụ phụ được thực thi:

| Cấu hình | Cú pháp | Thời điểm chạy | Trường hợp sử dụng |
| :--- | :--- | :--- | :--- |
| **Không truyền mảng** | `useEffect(() => {})` | Chạy sau **mỗi lần render** và re-render của component. | Ghi nhật ký gỡ lỗi (ít dùng trong môi trường production). |
| **Mảng rỗng** | `useEffect(() => {}, [])` | Chạy **chỉ một lần duy nhất** sau khi component được nạp lần đầu (mount). | Lấy dữ liệu ban đầu, thiết lập trình lắng nghe sự kiện toàn cục. |
| **Mảng có phần tử** | `useEffect(() => {}, [count])` | Chạy sau khi mount, và chạy lại **chỉ khi** các giá trị trong mảng thay đổi. | Tự động lưu dữ liệu nhập vào, cập nhật giao diện khi state thay đổi. |

---

## 🧹 3. Hàm dọn dẹp (Cleanup Function) cực kỳ quan trọng

Khi bạn thiết lập các tài nguyên tồn tại lâu dài (như trình lắng nghe sự kiện, bộ hẹn giờ hoặc kết nối websocket), bạn phải **dọn dẹp chúng** khi component bị hủy (unmount) hoặc trước khi effect chạy lại để ngăn ngừa tình trạng **rò rỉ bộ nhớ (memory leaks)**.

Bạn thực hiện điều này bằng cách trả về một **hàm dọn dẹp (cleanup function)** từ callback của `useEffect`:

```jsx
import { useState, useEffect } from 'react';

const Timer = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Thiết lập bộ hẹn giờ
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Trả về hàm dọn dẹp để xóa bộ hẹn giờ
    return () => {
      clearInterval(intervalId);
      console.log("Timer đã được dọn dẹp!");
    };
  }, []); // Chỉ chạy một lần khi mount

  return <h1>Thời gian hoạt động: {seconds}s</h1>;
};
```

> [!WARNING]
> Nếu bạn quên xóa bộ hẹn giờ bằng `clearInterval`, nó sẽ tiếp tục chạy ngầm ngay cả khi component đã bị xóa khỏi màn hình, gây tiêu tốn bộ nhớ và CPU của trình duyệt.

---

## 🌐 4. Lấy dữ liệu và Ngăn chặn Tình trạng Race Condition

Một trường hợp sử dụng phổ biến của `useEffect` là lấy dữ liệu từ API. Tuy nhiên, nếu trạng thái thay đổi quá nhanh, các phản hồi API có thể trả về sai thứ tự yêu cầu (gọi là **race condition**). Chúng ta sử dụng một cờ boolean `active` ở local để bỏ qua các phản hồi cũ:

```jsx
import { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true; // Cờ kiểm tra component còn hoạt động hay không
    setLoading(true);

    fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setUser(data);
          setLoading(false);
        }
      });

    // Cleanup: đặt active thành false khi userId thay đổi hoặc component unmount
    return () => {
      active = false;
    };
  }, [userId]); // Lấy lại dữ liệu mỗi khi userId thay đổi

  if (loading) return <p>Đang tải dữ liệu người dùng...</p>;
  return (
    <div>
      <h3>Tên: {user.name}</h3>
      <p>Email: {user.email}</p>
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useEffect`. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tác vụ phụ (side effect) trong React là gì? Tại sao ta không được viết trực tiếp trong thân component?
<details>
  <summary><b>Reveal Answer</b></summary>

  Tác vụ phụ là bất kỳ hành động nào tương tác với thế giới bên ngoài (như gọi API mạng, thao tác DOM trực tiếp, đăng ký sự kiện, bộ hẹn giờ). 
  Ta không thể chạy trực tiếp trong thân component vì thân component sẽ được thực thi **sau mỗi lần render**. Nếu gọi API trực tiếp tại đó, nó sẽ cập nhật state, kích hoạt re-render, chạy lại API, dẫn đến **vòng lặp render vô hạn**.
</details>

### 2. Hàm dọn dẹp (cleanup function) được trả về bởi `useEffect` chạy khi nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm dọn dẹp chạy vào hai thời điểm cụ thể:
  1. Ngay trước khi hàm callback của effect chạy lại (khi các giá trị phụ thuộc thay đổi), nhằm dọn dẹp tác vụ phụ của lần render trước đó.
  2. Khi component bị hủy hoàn toàn khỏi DOM (unmount).
</details>

### 3. Điều gì xảy ra nếu bạn cập nhật state bên trong một `useEffect` không có mảng phụ thuộc?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó tạo ra một **vòng lặp vô hạn (infinite loop)**. Việc cập nhật state kích hoạt re-render. Vì không có mảng phụ thuộc, effect sẽ tiếp tục chạy sau lần re-render đó. Bên trong effect, state lại tiếp tục được cập nhật, kích hoạt một re-render khác, cứ thế lặp đi lặp lại vô tận làm đơ hoặc treo trình duyệt.
</details>

### 4. Tại sao React chạy effect hai lần trong môi trường phát triển (development)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong chế độ phát triển của React 18 và 19 (khi dùng `React.StrictMode`), React sẽ cố tình mount, unmount và mount lại các component. Điều này giúp các lập trình viên dễ dàng phát hiện các hàm dọn dẹp bị thiếu (ví dụ: quên gỡ trình lắng nghe sự kiện hoặc bộ hẹn giờ) – những nguyên nhân chính gây rò rỉ bộ nhớ.
</details>

### 5. Làm thế nào để giải quyết lỗi Race Condition khi gọi dữ liệu mạng bằng `useEffect`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn sử dụng một biến cờ boolean cục bộ (ví dụ: `let active = true;`) bên trong effect. Khi component bị hủy hoặc dependencies thay đổi, hàm dọn dẹp sẽ đặt `active = false`. Trước khi cập nhật state với dữ liệu nhận được từ API, bạn kiểm tra `if (active)`. Điều này ngăn không cho React cập nhật state bằng các kết quả API đã lỗi thời.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Danh sách thư mục người dùng
1. Tạo một component `UserDirectory.jsx` trong thư mục `src/components/`.
2. Sử dụng `useEffect` với mảng phụ thuộc rỗng để gọi danh sách người dùng từ `https://jsonplaceholder.typicode.com/users`.
3. Lưu danh sách người dùng vào state `users`.
4. Hiển thị danh sách tên người dùng ra màn hình. Nhúng component này vào tệp `App.jsx` chính của bạn.

### 🛠️ Bài tập 2: Theo dõi tọa độ chuột (Hàm dọn dẹp)
1. Tạo một component `MouseTracker.jsx`.
2. Thiết lập một trình lắng nghe sự kiện trong `useEffect` để theo dõi sự kiện di chuyển chuột (`mousemove`) của cửa sổ trình duyệt:
   ```javascript
   const handleMouseMove = (e) => {
     setCoords({ x: e.clientX, y: e.clientY });
   };
   window.addEventListener('mousemove', handleMouseMove);
   ```
3. Trả về một hàm dọn dẹp để gỡ bỏ trình lắng nghe sự kiện này một cách chính xác.
4. Hiển thị tọa độ `x` và `y` lên màn hình. Kiểm tra trong tab console của trình duyệt để đảm bảo việc dọn dẹp được thực thi khi bạn ẩn/hiện component này.
