# Dự án 9 & 10: Xác thực biểu mẫu & Giỏ hàng 🚀

Trong bài học này, chúng ta sẽ xây dựng một **Biểu mẫu đăng ký có xác thực dữ liệu (Sign-Up Form with Validation)** và một **Giỏ hàng mua sắm (Shopping Cart)**. Các dự án này kết hợp nhiều trạng thái đầu vào, định dạng kiểu dáng có điều kiện, lập chỉ mục mảng và các phép toán tính tổng tổng hợp (tổng số lượng và tổng tiền).

---

## 📝 Dự án 9: Xác thực biểu mẫu (Form Validation)

Dự án này quản lý một biểu mẫu đăng ký có khả năng xác thực động các trường đầu vào (username, email, password), hiển thị phản hồi được mã hóa bằng màu sắc và đưa ra cảnh báo lỗi tùy chỉnh.

### Các khái niệm chính được thực hành:
* Xác thực các trường dựa trên tiêu chí (ví dụ: kiểm tra Email bằng Regex, độ dài Password).
* Lưu trữ lỗi của biểu mẫu trong một đối tượng state dictionary duy nhất (`errors`).
* Áp dụng inline style có điều kiện dựa trên sự hiện diện của các lỗi xác thực.

### Hướng dẫn triển khai từng bước (`Form.jsx`)

Tạo tệp `src/components/Form.jsx` và chèn đoạn mã sau:

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

    // 1. Username checks
    if (!username.trim()) {
      tempErrors.username = "Username is required";
    }

    // 2. Email format validation using regular expressions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    // 3. Password strength checks
    if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }

    setErrors(tempErrors);

    // 4. Submit if error dictionary is empty
    if (Object.keys(tempErrors).length === 0) {
      alert("Registration Successful! 🎉");
      // Reset form fields
      setUsername("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Project 9: Signup Form</h2>
      <form onSubmit={validate}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Username</label>
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
          <label style={styles.label}>Email Address</label>
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
          <label style={styles.label}>Password</label>
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

        <button type="submit" style={styles.submitBtn}>Register</button>
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

Một danh mục sản phẩm được liên kết với một giỏ hàng tương tác. Người dùng thêm các món đồ vào giỏ, điều chỉnh số lượng, và xem các phép tính cập nhật trực tiếp.

### Các khái niệm chính được thực hành:
* Thêm phần tử có điều kiện: cập nhật số lượng `qty` cho các sản phẩm đã tồn tại so với chèn các món mới.
* Tính tổng bằng phương thức `.reduce()` của mảng:
  ```javascript
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  ```

### Hướng dẫn triển khai từng bước (`Cart.jsx`)

Tạo tệp `src/components/Cart.jsx` và chèn đoạn mã sau:

```jsx
import { useState } from 'react';

export const Cart = () => {
  const [cart, setCart] = useState([]);

  const products = [
    { id: 1, name: "Premium T-Shirt", price: 25 },
    { id: 2, name: "Running Sneakers", price: 85 },
    { id: 3, name: "Wireless Headphones", price: 120 }
  ];

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    
    if (existing) {
      // 1. UPDATE: Map through and increment quantity
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      // 2. ADD FRESH: Append item object initialized with qty: 1
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const clearCart = () => setCart([]);

  // Calculate aggregate quantities and total prices
  const totalQuantity = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={cartStyles.container}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Project 10: Shopping Cart</h2>
      
      <h3>Product Catalog</h3>
      <div style={cartStyles.catalog}>
        {products.map((p) => (
          <div key={p.id} style={cartStyles.prodCard}>
            <h4>{p.name}</h4>
            <p style={{ margin: "5px 0" }}>Price: ${p.price}</p>
            <button style={cartStyles.addBtn} onClick={() => addToCart(p)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: "40px" }}>Your Basket</h3>
      <div style={cartStyles.basket}>
        {cart.length === 0 ? (
          <p style={cartStyles.empty}>Your cart is currently empty.</p>
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
              <p>Total Items: <strong>{totalQuantity}</strong></p>
              <p>Total Cost: <strong>${totalPrice}</strong></p>
            </div>
            <button style={cartStyles.clearBtn} onClick={clearCart}>
              Clear Basket
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

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về các dự án nâng cao cho người mới này. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Trạng thái dictionary `errors` ngăn cản việc gửi biểu mẫu trong quá trình xác thực như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong quá trình gửi biểu mẫu, chúng ta chạy các kiểm tra xác thực. Nếu bất kỳ trường nào không đạt, chúng ta điền vào một đối tượng cục bộ `tempErrors` các chuỗi cảnh báo. Chúng ta kiểm tra `Object.keys(tempErrors).length === 0`. Nếu độ dài khác 0 thì nghĩa là có lỗi tồn tại, và chúng ta chặn việc gửi form đồng thời ghi đối tượng đó vào state để hiển thị cảnh báo lên màn hình.
</details>

### 2. Phương thức `.reduce()` của mảng trong JavaScript hoạt động như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  `.reduce()` lặp qua một mảng, gom nội dung của nó về một giá trị duy nhất (số, object, v.v.). Nó nhận vào một callback `(accumulator, item) => ...` và một giá trị khởi tạo (ví dụ `0`). Trong giỏ hàng của chúng ta:
  `cart.reduce((sum, item) => sum + (item.price * item.qty), 0)`
  Nó bắt đầu `sum` ở `0`, cộng dồn giá sản phẩm nhân với số lượng, và trả về tổng cuối cùng.
</details>

### 3. Tại sao chúng ta phải sao chép các món như `{ ...item, qty: item.qty + 1 }` khi cập nhật số lượng trong giỏ hàng?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong JavaScript, các object lồng bên trong mảng được sao chép theo tham chiếu. Việc sửa `item.qty = item.qty + 1` làm thay đổi (mutate) trực tiếp tham chiếu của đối tượng đang hoạt động. Để thỏa mãn tiêu chí bất biến nghiêm ngặt của React, chúng ta phải tạo một bản sao nông của đối tượng bằng `{ ...item }` và chỉ đè lên thuộc tính `qty`.
</details>

### 4. Biểu thức chính quy (Regex) là gì và nó được dùng trong việc xác thực biểu mẫu như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Biểu thức chính quy là một mẫu cú pháp dùng để khớp các tổ hợp chuỗi. `const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;` đảm bảo chuỗi có phần văn bản, một ký hiệu `@`, văn bản, một dấu chấm `.`, và phần văn bản tên miền, trả về `true` hoặc `false` khi được kiểm tra thông qua `emailRegex.test(string)`.
</details>

### 5. Tại sao chúng ta xóa biểu mẫu bằng cách đặt các giá trị state về `""` trong hàm xử lý submit?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì các ô nhập của chúng ta là controlled component gắn liền với state. Việc đặt lại các biến state về `""` sẽ tự động xóa sạch nội dung văn bản bên trong các ô nhập của trình duyệt, đảm bảo giao diện phản ánh việc gửi form thành công.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Ô xác nhận khớp Mật khẩu
1. Mở `Form.jsx`.
2. Thêm một ô nhập thứ tư: "Confirm Password" với state `confirmPassword`.
3. Sửa đổi kiểm tra xác thực khi submit: đảm bảo `confirmPassword` không trống, và trùng khớp với state `password`.
4. Hiển thị cảnh báo lỗi tùy chỉnh nếu chúng không khớp, đồng thời chặn việc gửi form.

### 🛠️ Bài tập 2: Nút điều chỉnh số lượng & Xóa món
1. Mở `Cart.jsx`.
2. Sửa đổi danh sách giỏ hàng. Bên cạnh số lượng của mỗi món, hiển thị một nút Tăng `[+]` và một nút Giảm `[-]`.
3. Kết nối chúng với các hàm xử lý state:
   - Nhấp `[+]` tăng số lượng lên 1.
   - Nhấp `[-]` giảm số lượng đi 1. Nếu số lượng đạt về 0, hãy xóa hoàn toàn món đó khỏi mảng giỏ hàng.
4. Thêm một nút "Remove" `[✕]` để xóa ngay lập tức một món khỏi giỏ hàng bất kể số lượng của nó là bao nhiêu.
