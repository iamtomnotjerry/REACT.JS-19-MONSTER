# Bộ biên dịch React Compiler & Tính năng Actions trong React 19 🔥

Phiên bản React 19 giới thiệu những nâng cấp lớn trong cách chúng ta xây dựng các ứng dụng web. Nó tự động tối ưu hóa hiệu suất thông qua bộ biên dịch mới **React Compiler** và thay đổi cách xử lý các biểu mẫu và các yêu cầu bất đồng bộ bằng **Actions**.

---

## ⚡ 1. Bộ biên dịch React Compiler (React Forget)

Trước phiên bản React 19, lập trình viên bắt buộc phải tối ưu hóa hiệu năng một cách thủ công bằng cách sử dụng các hook như `useMemo` và `useCallback` nhằm ngăn chặn các component con bị re-render một cách không cần thiết.

**React Compiler** là một công cụ mới hoạt động trong quá trình build (build-time tool), tự động chèn các quy tắc tối ưu hóa và ghi nhớ (memoization) vào mã nguồn của bạn dưới dạng ngầm định. Bộ biên dịch này hiểu rõ các quy tắc của JavaScript và React, nghĩa là:
* Các hàm và đối tượng thông thường sẽ được tự động memoize (lưu cache).
* Component chỉ hiển thị lại (re-render) nếu dữ liệu đầu vào (props/state) thực sự thay đổi.
* Việc gọi thủ công các hook `useMemo` và `useCallback` hầu như trở thành các dòng mã lỗi thời của các phiên bản cũ.

---

## ⚡ 2. React Server Component (RSC) vs. Client Component

React 19 chính thức hóa việc phân chia rõ ràng giữa Server Component và Client Component:
* **Server Components**: Mặc định render ở phía máy chủ (server). Chúng có thể truy vấn trực tiếp vào database hoặc đọc tệp hệ thống. Chúng gửi các gói biểu diễn dữ liệu dạng JSON siêu nhẹ về trình duyệt, giúp giảm dung lượng các gói JavaScript tải về thiết bị người dùng.
* **Client Components**: Được khai báo bằng cách viết chỉ thị `"use client"` ở đầu tệp tin. Chúng chạy ở trình duyệt và có quyền truy cập vào các tính năng đặc thù của client như quản lý trạng thái (`useState`), tác vụ phụ (`useEffect`) và các API của trình duyệt.

---

## ⚡ 3. Tính năng Form Actions mới

Trong các phiên bản React trước đây, việc xử lý một sự kiện submit biểu mẫu yêu cầu thêm sự kiện `onSubmit` vào form, gọi hàm `e.preventDefault()`, tự theo dõi giá trị các ô nhập vào thông qua state, và tự quản lý các biến boolean để hiển thị spinner tải dữ liệu.

React 19 giới thiệu **Actions**, là các hàm chuyển đổi trạng thái bất đồng bộ. Bạn có thể truyền trực tiếp một hàm bất đồng bộ (async function) vào thuộc tính **`action`** của thẻ HTML `<form>`. React tự động kiểm soát vòng đời của sự kiện đó, và truyền trực tiếp đối tượng **`FormData`** tiêu chuẩn vào hàm xử lý:

```jsx
// Ví dụ về tính năng Async Action trong React 19
export const UpdateProfileForm = () => {
  
  const updateNicknameAction = async (formData) => {
    // 1. Đọc trực tiếp giá trị từ thuộc tính name của input mà không cần quản lý state thủ công!
    const nickname = formData.get("nickname");
    
    try {
      // 2. Thực hiện gọi API bất đồng bộ lên máy chủ
      const res = await fetch("https://api.example.com/profile", {
        method: "POST",
        body: JSON.stringify({ nickname }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Cập nhật thất bại!");
      alert("Cập nhật biệt danh thành công!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form action={updateNicknameAction} style={styles.form}>
      <h3>Cập nhật biệt danh</h3>
      <input 
        type="text" 
        name="nickname" // Thuộc tính name được dùng trong hàm formData.get()
        placeholder="Nhập biệt danh mới..." 
        style={styles.input}
        required 
      />
      <button type="submit" style={styles.btn}>Lưu</button>
    </form>
  );
};

const styles = {
  form: { maxWidth: "300px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" },
  input: { width: "100%", padding: "8px", margin: "10px 0", boxSizing: "border-box" },
  btn: { width: "100%", padding: "10px", backgroundColor: "#2ecc71", color: "#fff", border: "none", cursor: "pointer" }
};
```

### Các ưu điểm vượt trội của Actions:
* **Không cần dùng `e.preventDefault()`**: React tự động chặn việc submit mặc định của form để tránh tải lại trang web.
* **Lấy dữ liệu ngầm định**: Sử dụng `formData` giúp loại bỏ việc viết quá nhiều hook state cho từng ô nhập liệu.
* **Tự động theo dõi trạng thái**: React tự động theo dõi tiến trình chạy của action bất đồng bộ (có thể truy cập qua các hook như `useFormStatus`).

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. React Compiler làm gì và nó ảnh hưởng thế nào đến các hook tối ưu hóa thông thường?
<details>
  <summary><b>Reveal Answer</b></summary>

  React Compiler tự động tiêm các kiểm tra tối ưu bộ nhớ (memoization) vào component của bạn trong quá trình build dự án. Việc này tự động ngăn chặn component và giá trị bị render lại một cách không cần thiết, giúp việc tự viết `useMemo` và `useCallback` thủ công hầu như không còn cần thiết.
</details>

### 2. Làm thế nào để lấy giá trị của ô nhập liệu bên trong một Form Action của React 19?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn đặt thuộc tính `name` cho thẻ input (ví dụ: `<input name="username" />`). Trong hàm action, React truyền đối tượng `FormData` làm tham số đầu tiên. Bạn chỉ cần đọc giá trị bằng cách gọi hàm `formData.get("username")`.
</details>

### 3. Các Form Action trong React 19 có gây tải lại (refresh) trang web không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Khi một hàm bất đồng bộ được truyền vào thuộc tính `<form action={...}>`, React tự động ghi đè hành vi submit mặc định của trình duyệt. Nó thực thi hàm action bất đồng bộ ngầm dưới nền, ngăn chặn tải lại trang mà bạn không cần phải viết dòng code `e.preventDefault()`.
</details>

### 4. Vai trò của chỉ thị `"use client"` trong React 19 là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong các framework React hiện đại, mặc định các component đều là Server Components. Chỉ thị `"use client"` đánh dấu ranh giới phân tách giữa mã nguồn chạy trên server và client. Nó bắt buộc phải đặt ở dòng đầu tiên của tệp tin để khai báo rằng component này chạy ở trình duyệt, cho phép bạn sử dụng các hook (như `useState`, `useEffect`) và các trình lắng nghe sự kiện.
</details>

### 5. Form Actions có hỗ trợ tải tệp tin (file upload) thông thường không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì Form Actions của React 19 nhận trực tiếp đối tượng `FormData` tiêu chuẩn của trình duyệt, nó tự động hỗ trợ các thẻ input chọn file:
  ```javascript
  const avatarFile = formData.get("avatar"); // Trả về đối tượng File
  ```
  Bạn có thể gửi trực tiếp đối tượng file này lên máy chủ API bằng cú pháp gọi fetch multipart/form-data thông thường.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng Form gửi phản hồi bất đồng bộ (Feedback Action)
1. Tạo một component `FeedbackAction.tsx` bên trong thư mục `src/components/` (hoặc đuôi `.jsx` nếu không dùng TypeScript).
2. Tạo một biểu mẫu gồm hai ô nhập: `title` (ô text thường) và `comments` (khung textarea). Hãy chắc chắn đặt thuộc tính `name` tương ứng cho chúng.
3. Viết một hàm bất đồng bộ `sendFeedbackAction` đọc hai giá trị này từ đối tượng `formData` và mô phỏng một độ trễ gọi mạng:
   ```javascript
   const sendFeedbackAction = async (formData) => {
     const title = formData.get("title");
     const comments = formData.get("comments");
     // Giả lập độ trễ 2 giây
     await new Promise((resolve) => setTimeout(resolve, 2000));
     alert(`Nhận phản hồi thành công: ${title} - ${comments}`);
   };
   ```
4. Liên kết hàm này vào thuộc tính `<form action={...}>` và chạy kiểm tra thử hành vi gửi biểu mẫu.
