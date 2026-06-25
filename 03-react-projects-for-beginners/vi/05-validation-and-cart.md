# Dự án 9 & 10: Xác thực biểu mẫu & Giỏ hàng 🚀

Trong bài học này, chúng ta sẽ xây dựng hai dự án kết thúc phần cơ bản: **Biểu mẫu đăng ký có xác thực dữ liệu (Form Validation)** và **Giỏ hàng mua sắm (Shopping Cart)**. Các dự án này kết hợp nhiều trạng thái đầu vào, định dạng kiểu dáng có điều kiện, quản lý mảng đối tượng và các phép toán tính tổng nâng cao (tổng số lượng và tổng tiền).

---

## 📝 Dự án 9: Xác thực biểu mẫu đăng ký (Form Validation)

Dự án quản lý một biểu mẫu đăng ký thành viên có khả năng tự động kiểm tra các trường đầu vào (tên, email, mật mã), hiển thị màu sắc phản hồi (đỏ/xanh) và đưa ra cảnh báo lỗi cụ thể.

### Các khái niệm chính được thực hành:
* Xác thực các trường dựa trên tiêu chí (ví dụ: định dạng Email bằng Regex, độ dài Mật khẩu).
* Lưu trữ danh sách lỗi dưới dạng một đối tượng dictionary (`errors`).
* Sử dụng inline style có điều kiện dựa trên trạng thái lỗi của các ô nhập.

### Hướng dẫn triển khai từng bước (`Form.jsx`)

Tạo tệp component tại `src/components/Form.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const Form = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validate = (e) => {
    e.preventDefault();
    let tempErrors = {};

    // 1. Kiểm tra Username
    if (!username.trim()) {
      tempErrors.username = "Tên đăng nhập là bắt buộc";
    }

    // 2. Xác thực định dạng email bằng biểu thức chính quy (Regular Expression)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      tempErrors.email = "Email không đúng định dạng";
    }

    // 3. Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      tempErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự";
    }

    setErrors(tempErrors);

    // 4. Cho phép submit nếu đối tượng lỗi trống (không có lỗi)
    if (Object.keys(tempErrors).length === 0) {
      alert("Đăng ký thành công! 🎉");
      // Xóa sạch dữ liệu các ô nhập
      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Dự án 9: Biểu mẫu Đăng ký</h2>
      <form onSubmit={validate}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tên người dùng (Username)</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.username ? "#e74c3c" : "#2ecc71"
            }}
          />
          {errors.username && <p style={styles.errorText}>{errors.username}</p>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Địa chỉ Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.email ? "#e74c3c" : "#2ecc71"
            }}
          />
          {errors.email && <p style={styles.errorText}>{errors.email}</p>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...styles.input,
              borderColor: errors.password ? "#e74c3c" : "#2ecc71"
            }}
          />
          {errors.password && <p style={styles.errorText}>{errors.password}</p>}
        </div>

        <button type="submit" style={styles.submitBtn}>Đăng ký</button>
      </form>
    </div>
  );
};

const styles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "400px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "20px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#34495e"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    borderWidth: "2px",
    borderStyle: "solid",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box"
  },
  errorText: {
    color: "#e74c3c",
    fontSize: "0.85rem",
    margin: "5px 0 0 0"
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#9b59b6",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    marginTop: "10px"
  }
};
```

---

## 🛒 Dự án 10: Ứng dụng Giỏ hàng (Shopping Cart)

Giao diện danh mục sản phẩm kết hợp giỏ hàng mua sắm. Người dùng có thể thêm các món đồ vào giỏ, tăng giảm số lượng sản phẩm, và xem tổng tiền cập nhật tự động.

### Các khái niệm chính được thực hành:
* Thêm phần tử có điều kiện: Tăng số lượng (`qty`) nếu sản phẩm đã có trong giỏ, ngược lại thì thêm mới object vào mảng.
* Tính toán tổng số lượng và số tiền thanh toán sử dụng hàm `.reduce()` của mảng:
  ```javascript
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  ```

### Hướng dẫn triển khai từng bước (`Cart.jsx`)

Tạo tệp component tại `src/components/Cart.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const Cart = () => {
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: "Áo thun Premium", price: 25 },
    { id: 2, name: "Giày thể thao Sneaker", price: 85 },
    { id: 3, name: "Tai nghe không dây", price: 120 }
  ];

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    
    if (existing) {
      // 1. CẬP NHẬT: Map qua mảng để tăng số lượng quantity
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      // 2. THÊM MỚI: Thêm đối tượng sản phẩm với thuộc tính mặc định qty: 1
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const clearCart = () => setCart([]);

  // Tính tổng số lượng và tổng tiền trong giỏ hàng
  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={cartStyles.container}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Dự án 10: Giỏ hàng mua sắm</h2>
      
      <h3>Danh mục Sản phẩm</h3>
      <div style={cartStyles.catalog}>
        {products.map((p) => (
          <div key={p.id} style={cartStyles.prodCard}>
            <h4>{p.name}</h4>
            <p style={{ margin: "5px 0" }}>Giá: ${p.price}</p>
            <button style={cartStyles.addBtn} onClick={() => addToCart(p)}>
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "40px" }}>Giỏ hàng của bạn</h3>
      <div style={cartStyles.basket}>
        {cart.length === 0 ? (
          <p style={cartStyles.empty}>Giỏ hàng đang trống.</p>
        ) : (
          <div>
            <ul style={cartStyles.list}>
              {cart.map((item) => (
                <li key={item.id} style={cartStyles.item}>
                  <span>{item.name} (x{item.qty})</span>
                  <span>${item.price * item.qty}</span>
                </li>
              ))}
            </ul>
            <div style={cartStyles.summary}>
              <p>Tổng số lượng: <strong>{totalQuantity}</strong></p>
              <p>Tổng thanh toán: <strong>${totalPrice}</strong></p>
            </div>
            <button style={cartStyles.clearBtn} onClick={clearCart}>
              Xóa sạch giỏ hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const cartStyles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "30px",
    fontFamily: "Arial, sans-serif"
  },
  catalog: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px"
  },
  prodCard: {
    border: "1px solid #dfe6e9",
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    textAlign: "center"
  },
  addBtn: {
    padding: "8px 12px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  basket: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0"
  },
  list: {
    listStyleType: "none",
    padding: 0,
    margin: 0
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #e2e8f0"
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    paddingTop: "10px",
    borderTop: "2px solid #cbd5e1"
  },
  clearBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: "15px"
  },
  empty: {
    textAlign: "center",
    color: "#7f8c8d"
  }
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Trạng thái đối tượng `errors` ngăn cản việc gửi biểu mẫu (submit form) như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi người dùng bấm submit, chúng ta thực hiện các hàm kiểm tra điều kiện. Nếu phát hiện trường nào lỗi, chúng ta ghi thông báo lỗi vào một object cục bộ `tempErrors`. Chúng ta kiểm tra điều kiện `Object.keys(tempErrors).length === 0`. Nếu độ dài khác 0 chứng tỏ có lỗi, chúng ta ghi object này vào state để hiển thị cảnh báo ra màn hình và chặn không cho submit form thành công.
</details>

### 2. Phương thức `.reduce()` của mảng hoạt động ra sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `.reduce()` lặp qua các phần tử của mảng để tổng hợp chúng về một giá trị duy nhất (số, chuỗi, object...). Nó nhận vào một hàm callback `(accumulator, item) => ...` và một giá trị khởi tạo ban đầu (ví dụ: `0`). Trong dự án giỏ hàng:
  `cart.reduce((sum, item) => sum + (item.price * item.qty), 0)`
  Nó bắt đầu biến tích lũy `sum` bằng `0`, cộng dồn giá sản phẩm nhân số lượng ở mỗi vòng lặp, và trả về tổng số cuối cùng.
</details>

### 3. Tại sao chúng ta cần tạo bản sao mảng dạng `{ ...item, qty: item.qty + 1 }` khi cập nhật số lượng hàng?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong JavaScript, các object lồng bên trong mảng được tham chiếu theo địa chỉ bộ nhớ. Chỉnh sửa trực tiếp `item.qty = item.qty + 1` sẽ làm thay đổi trực tiếp tham chiếu của đối tượng cũ. Để thỏa mãn tính chất bất biến của React state, ta phải sao chép nông đối tượng cũ bằng cú pháp spread `{ ...item }` và chỉ đè giá trị mới cho thuộc tính `qty`.
</details>

### 4. Biểu thức chính quy (Regular Expression - Regex) là gì và ứng dụng thế nào trong kiểm tra form?
<details>
  <summary><b>Reveal Answer</b></summary>

  Regex là một chuỗi cú pháp đặc biệt dùng để mô tả một mẫu khớp ký tự mong muốn. Ví dụ mẫu email: `const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;` dùng để đảm bảo chuỗi nhập vào chứa ký tự thường, ký tự `@`, tên miền và dấu chấm `.`, trả về kết quả `true` hoặc `false` thông qua hàm kiểm tra `emailRegex.test(chuỗi)`.
</details>

### 5. Tại sao chúng ta cần xóa sạch biểu mẫu bằng cách set state về lại chuỗi rỗng `""`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vì các ô nhập của chúng ta là controlled components (thành phần được kiểm soát) liên kết trực tiếp với state. Việc đặt lại giá trị state về `""` sẽ tự động xóa sạch nội dung chữ hiển thị trong ô nhập của trình duyệt, thông báo trực quan cho người dùng biết biểu mẫu đã được gửi đi thành công.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Thêm ô xác nhận lại Mật khẩu (Confirm Password)
1. Mở file `Form.jsx`.
2. Thêm một ô nhập thứ tư: "Xác nhận mật khẩu" đi kèm biến state `confirmPassword`.
3. Sửa đổi hàm validate kiểm tra khi submit: Đảm bảo ô `confirmPassword` không trống, và có giá trị trùng khớp hoàn toàn với state `password`.
4. Hiển thị thông báo cảnh báo lỗi nếu hai mật khẩu không trùng khớp và chặn hành động gửi form.

### 🛠️ Bài tập 2: Nút Tăng / Giảm số lượng & Nút Xóa sản phẩm
1. Mở file `Cart.jsx`.
2. Sửa lại danh sách giỏ hàng. Bên cạnh hiển thị số lượng sản phẩm, hãy thêm hai nút Tăng `[+]` và Giảm `[-]`.
3. Viết các hàm xử lý state:
   - Click nút `[+]` tăng số lượng `qty` sản phẩm lên 1 đơn vị.
   - Click nút `[-]` giảm số lượng `qty` xuống 1 đơn vị. Nếu số lượng giảm về 0, hãy xóa sản phẩm đó khỏi mảng giỏ hàng.
4. Thêm nút "Xóa" `[✕]` để xóa ngay lập tức sản phẩm khỏi giỏ hàng mà không cần quan tâm số lượng sản phẩm là bao nhiêu.
