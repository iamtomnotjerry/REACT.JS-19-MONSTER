# Render danh sách và sử dụng Key trong React 📋

Trong phát triển web, chúng ta thường xuyên cần render các danh sách phần tử một cách động (chẳng hạn như kết quả tìm kiếm, hồ sơ người dùng, hoặc danh mục sản phẩm). Trong React, chúng ta xử lý việc render danh sách bằng các phương thức mảng tiêu chuẩn của JavaScript, cụ thể là phương thức **`.map()`**, bên trong JSX.

---

## ⚡ Phương thức `.map()` trong React

Phương thức `.map()` lặp qua từng phần tử trong một mảng và trả về một mảng mới gồm các phần tử JSX. React sẽ tự động giải nén và render danh sách phần tử này.

### Ví dụ cơ bản (Mảng các chuỗi)
```jsx
const UserList = () => {
  const users = ["Alice", "Bob", "Charlie"];

  return (
    <ul>
      {users.map((user, index) => (
        <li key={index}>{user}</li>
      ))}
    </ul>
  );
};
```

---

## 🔑 Tại sao prop `key` lại bắt buộc?

Nếu bạn render một danh sách mà không cung cấp prop `key` cho phần tử ngoài cùng của mỗi item, React sẽ hiển thị một cảnh báo trên console:
> *Warning: Each child in a list should have a unique "key" prop.*

### React sử dụng Key như thế nào
1. **Reconciliation (Đối chiếu)**: Khi một item trong danh sách được thêm vào, xóa đi, hoặc sắp xếp lại, React so sánh các cây Virtual DOM.
2. **Identity (Định danh)**: `key` đóng vai trò là một định danh duy nhất cho phần tử cụ thể đó. Nó nói cho React biết: *"Phần tử này tương ứng với item dữ liệu cụ thể này"*.
3. **Performance (Hiệu năng)**: Với key, React chỉ cập nhật hoặc sắp xếp lại những phần tử DOM thực sự thay đổi, thay vì hủy bỏ và xây dựng lại toàn bộ danh sách từ đầu.

> [!WARNING]
> **Tránh sử dụng chỉ số (index) của mảng làm key** nếu các item trong danh sách có thể thay đổi, được sắp xếp lại, hoặc được lọc. Làm như vậy có thể gây ra các lỗi hiển thị và vấn đề về hiệu năng. Luôn ưu tiên dùng các ID duy nhất từ dữ liệu của bạn (ví dụ `user.id`).

---

## 🌟 Ví dụ nâng cao (Mảng các object)

Trong các ứng dụng thực tế, dữ liệu thường được biểu diễn dưới dạng một mảng các object.

```jsx
const ProductList = () => {
  const products = [
    { id: 101, name: "Keyboard", price: 50 },
    { id: 102, name: "Mouse", price: 30 },
    { id: 103, name: "Monitor", price: 200 }
  ];

  return (
    <div>
      <h2>Product Catalog</h2>
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Hãy trả lời những câu hỏi sau để kiểm tra mức độ hiểu của bạn về Lists & Keys. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Phương thức JavaScript nào được ưu tiên để render danh sách trong React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phương thức `map()` được ưu tiên vì nó lặp qua mảng và trả về một mảng mới gồm các phần tử JSX.
</details>

### 2. Tại sao bạn nên tránh sử dụng `index` của mảng làm key?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu danh sách bị sắp xếp lại, được sort, được lọc, hoặc các item bị chèn thêm/xóa đi, thì index của mỗi item sẽ thay đổi. Điều này có thể khiến React đối chiếu sai các trạng thái UI (chẳng hạn như các ô input giữ lại giá trị của sai item trong danh sách) và làm giảm hiệu năng render.
</details>

### 3. Phần tử nào trong vòng lặp phải nhận prop `key`?
<details>
  <summary><b>Reveal Answer</b></summary>

  **Phần tử ngoài cùng** được trả về bởi hàm callback của `.map()` phải nhận prop `key`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component danh sách người dùng (User List)
1. Tạo một file component mới `UserList.jsx` bên trong `src/components/`.
2. Định nghĩa một danh sách người dùng chứa thông tin chi tiết của họ:
   ```javascript
   const users = [
     { id: 1, name: "Alice", age: 25 },
     { id: 2, name: "Bob", age: 30 },
     { id: 3, name: "Charlie", age: 22 }
   ];
   ```
3. Sử dụng phương thức `.map()` để render danh sách những người dùng này, hiển thị tên (name) và tuổi (age) của họ. Đảm bảo mỗi item có một `key` duy nhất.
4. Import và render `<UserList />` trong `App.jsx`.
