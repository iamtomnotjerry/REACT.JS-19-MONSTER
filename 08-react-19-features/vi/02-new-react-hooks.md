# Các Hook mới trong React 19 & API `use` 🔥

Phiên bản React 19 giới thiệu bốn hook và mô hình API mạnh mẽ được thiết kế để điều phối các biểu mẫu bất đồng bộ phức tạp, tối ưu hóa hiển thị giao diện tức thời (optimistic UI), và nạp động các tài nguyên trực tiếp bên trong quá trình render của component.

---

## ⚡ 1. Hook `useActionState` (Hàm bao bọc trạng thái biểu mẫu bất đồng bộ)

Trước đây được gọi là `useFormState` trong các phiên bản thử nghiệm, **`useActionState`** là hook chính dùng để xử lý các biểu mẫu. Nó bao bọc một hàm action bất đồng bộ tùy chỉnh và trả về:
1. **State**: Kết quả trả về hiện tại của action (được khởi tạo với giá trị mặc định do bạn thiết lập).
2. **Form Action Wrapper**: Phiên bản hàm action đã được bao bọc để truyền trực tiếp vào thuộc tính `<form action={formAction}>`.
3. **`isPending`**: Cờ boolean tích hợp sẵn cho biết hàm action bất đồng bộ có đang thực thi hay không.

```jsx
import { useActionState } from 'react';

// 1. Định nghĩa hàm action: nhận vào (previousState, formData)
const subscribeUser = async (prevState, formData) => {
  const email = formData.get("email");
  
  // Giả lập độ trễ gọi API
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  if (!email.includes("@")) {
    return { success: false, message: "Email không đúng định dạng!" };
  }
  return { success: true, message: `Đăng ký thành công email: ${email}! 🎉` };
};

export const NewsletterForm = () => {
  // 2. Khởi tạo useActionState: trả về [state, formAction, isPending]
  const [state, formAction, isPending] = useActionState(subscribeUser, { success: false, message: "" });

  return (
    <form action={formAction} style={styles.card}>
      <h3>Đăng ký Bản tin (Newsletter)</h3>
      <input type="email" name="email" placeholder="Nhập email của bạn..." required />
      
      <button type="submit" disabled={isPending}>
        {isPending ? "Đang đăng ký..." : "Đăng ký"}
      </button>

      {state.message && (
        <p style={{ color: state.success ? "green" : "red", marginTop: "10px" }}>
          {state.message}
        </p>
      )}
    </form>
  );
};

const styles = { card: { maxWidth: "300px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" } };
```

---

## ⚡ 2. Hook `useFormStatus` (Theo dõi trạng thái Biểu mẫu)

**`useFormStatus`** là một context hook. Nó cho phép các phần tử con nằm sâu bên trong thẻ `<form>` tự động nhận biết biểu mẫu cha có đang trong trạng thái gửi dữ liệu hay không, mà bạn không cần truyền prop một cách thủ công:

```jsx
import { useFormStatus } from 'react-dom';

// Component này BẮT BUỘC phải được đặt bên trong thẻ <form> cha
export const SubmitButton = () => {
  // Thuộc tính pending tự động theo dõi trạng thái gửi biểu mẫu
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Đang lưu thay đổi..." : "Lưu"}
    </button>
  );
};
```

---

## ⚡ 3. Hook `useOptimistic` (Cập nhật giao diện UI Tối ưu tức thời)

Hook **`useOptimistic`** được thiết kế để tạo cảm giác phản hồi tức thì cho giao diện người dùng. Trong các tác vụ cập nhật API bất đồng bộ (ví dụ: gửi một tin nhắn chat), nó cho phép bạn hiển thị tạm thời kết quả "thành công" mong đợi ngay lập tức trên màn hình. Nếu API gọi thành công thực sự, dữ liệu state thật sẽ được hiển thị; nếu API thất bại, nó tự động hoàn tác (roll back) về trạng thái cũ:

```jsx
import { useOptimistic, useState } from 'react';

export const ChatApp = () => {
  const [messages, setMessages] = useState([{ id: 1, text: "Xin chào!" }]);
  
  // Tạo trạng thái tối ưu tạm thời (optimistic state)
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // Hàm reducer: gộp mảng hiện tại với phần tử tạm thời
    (state, newText) => [...state, { id: Date.now(), text: newText, sending: true }]
  );

  const sendMessageAction = async (formData) => {
    const text = formData.get("message");
    if (!text.trim()) return;

    // 1. Kích hoạt hiển thị tin nhắn tạm thời ngay lập tức
    addOptimisticMessage(text);

    // 2. Thực hiện gọi API thật bất đồng bộ
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Trễ
    
    // 3. Cập nhật vào state thực tế của component sau khi gọi xong
    setMessages((prev) => [...prev, { id: Date.now(), text }]);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h3>Trò chuyện (useOptimistic)</h3>
      <div style={{ border: "1px solid #ccc", height: "200px", padding: "10px", overflowY: "auto", marginBottom: "15px" }}>
        {optimisticMessages.map((msg) => (
          <p key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
            {msg.text} {msg.sending && <small>(đang gửi...)</small>}
          </p>
        ))}
      </div>
      <form action={sendMessageAction}>
        <input type="text" name="message" placeholder="Nhập tin nhắn..." required />
        <button type="submit">Gửi</button>
      </form>
    </div>
  );
};
```

---

## ⚡ 4. API `use` (Giải quyết Promise và Context có điều kiện)

Trước phiên bản React 19, các hook bắt buộc phải tuân thủ nghiêm ngặt quy tắc cấp cao nhất (top-level rules): không được đặt bên trong các câu lệnh `if` hay vòng lặp `for`.

API **`use`** là mô hình mới cho phép bạn đọc các giá trị Promise hoặc Context trực tiếp **trong khi render, một cách có điều kiện**:

```jsx
import { use } from 'react';

// Giải quyết giá trị Context có điều kiện bên trong khối 'if'!
const InfoCard = ({ showDetails, MyContext }) => {
  if (showDetails) {
    const contextValue = use(MyContext); // Hoàn toàn hợp lệ trong câu lệnh 'if'!
    return <p>Chi tiết ẩn: {contextValue}</p>;
  }
  return <p>Thông tin chi tiết đã bị ẩn</p>;
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Hàm action truyền vào `useActionState` nhận được các tham số đầu vào nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm action nhận được hai tham số đầu vào:
  1. `state`: Giá trị trả về trước đó của state (hoặc giá trị mặc định ban đầu ở lần gọi đầu tiên).
  2. `formData`: Đối tượng `FormData` tiêu chuẩn chứa các dữ liệu nhập vào của biểu mẫu.
</details>

### 2. Có thể gọi hàm `useFormStatus` bên trong chính component khai báo thẻ `<form>` cha được không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. `useFormStatus` hoạt động tương tự cơ chế Consumer của React Context. Nó tìm kiếm thẻ `<form>` cha gần nhất trên cây component. Nếu bạn gọi nó trong chính component khai báo thẻ `<form>`, đối tượng cung cấp (provider) không phải là tổ tiên của nó, và hook sẽ trả về `pending: false`, không thể theo dõi trạng thái biểu mẫu.
</details>

### 3. Hook `useOptimistic` xử lý lỗi gọi API thất bại như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi hàm action bất đồng bộ thực hiện xong, React sẽ tự động dọn dẹp trạng thái tối ưu tạm thời và render lại dựa trên giá trị state thực tế của component. Nếu API lỗi và bạn không gọi cập nhật state thực (`setMessages`), UI sẽ tự động hoàn tác, loại bỏ tin nhắn tạm thời đó khỏi màn hình.
</details>

### 4. API `use` khác biệt thế nào so với các hook tiêu chuẩn như `useContext`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các hook tiêu chuẩn như `useContext` bị giới hạn bởi Quy tắc của Hook: bắt buộc phải khai báo ở cấp cao nhất của component, không được nằm trong khối điều kiện `if`, vòng lặp `for`, hay switch/case. API `use` phá vỡ giới hạn này và có thể gọi linh hoạt ở bất kỳ khối mã nào trong khi render.
</details>

### 5. Component bao bọc nào bắt buộc phải sử dụng khi giải quyết Promise bằng API `use`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn bắt buộc phải bao bọc component đó bằng thẻ **`<Suspense>`**. Vì việc giải quyết một Promise bất đồng bộ sẽ trì hoãn quá trình render, Suspense sẽ cung cấp một giao diện hiển thị tạm thời (như loading spinner) trong khi chờ Promise hoàn thành.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Component Nút bấm tự động theo dõi Trạng thái form
1. Tạo một component `FormStatusDemo.tsx` (hoặc đuôi `.jsx`).
2. Viết một component nút bấm con `<StatusBtn />` có sử dụng hook `useFormStatus()`. Nút bấm tự khóa (`disabled`) và đổi chữ thành `"Đang thêm..."` nếu form đang trong trạng thái gửi dữ liệu.
3. Tạo một biểu mẫu nhập liệu ở component cha `FormStatusDemo`.
4. Viết hàm submit action bất đồng bộ có độ trễ 3 giây:
   ```javascript
   const submitAction = async (formData) => {
     await new Promise(r => setTimeout(r, 3000));
     alert("Lưu dữ liệu thành công!");
   };
   ```
5. Đặt nút `<StatusBtn />` bên trong thẻ form. Chạy dự án và bấm thử để kiểm tra xem trạng thái nút bấm có tự động thay đổi hay không mà không cần khai báo state ở component cha.
