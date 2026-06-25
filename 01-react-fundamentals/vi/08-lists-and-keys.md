# Hiển thị Danh sách và Sử dụng Key trong React 📋

Trong phát triển web, chúng ta thường xuyên cần hiển thị danh sách các mục một cách động (chẳng hạn như kết quả tìm kiếm, hồ sơ người dùng hoặc danh mục sản phẩm). Trong React, chúng ta xử lý hiển thị danh sách bằng các phương thức mảng JavaScript tiêu chuẩn, đặc biệt là phương thức **`.map()`**, ngay bên trong JSX.

---

## ⚡ Phương thức `.map()` trong React

Phương thức `.map()` lặp qua từng phần tử trong một mảng và trả về một mảng mới gồm các phần tử JSX. React sẽ tự động giải nén và render danh sách các phần tử này lên màn hình.

### Ví dụ cơ bản (Mảng chứa các Chuỗi)
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

## 🔑 Tại sao thuộc tính `key` lại bắt buộc?

Nếu bạn render một danh sách mà không cung cấp thuộc tính `key` cho phần tử ngoài cùng của mỗi mục, React sẽ hiển thị một cảnh báo trong bảng điều khiển console:
> *Warning: Each child in a list should have a unique "key" prop.* (Cảnh báo: Mỗi phần tử con trong danh sách phải có một thuộc tính "key" duy nhất.)

### Cách React sử dụng Key
1. **Reconciliation (Đối chiếu)**: Khi một mục trong danh sách được thêm, xóa hoặc sắp xếp lại, React sẽ so sánh các cây DOM ảo.
2. **Identity (Định danh)**: Thuộc tính `key` đóng vai trò là một mã định danh duy nhất cho phần tử đó. Nó báo cho React biết: *"Phần tử UI này tương ứng với mục dữ liệu cụ thể này"*.
3. **Hiệu năng**: Nhờ có keys, React chỉ cập nhật hoặc sắp xếp lại các phần tử DOM thực sự thay đổi, thay vì phải hủy bỏ và xây dựng lại toàn bộ danh sách từ đầu.

> [!WARNING]
> **Tránh sử dụng chỉ số mảng (index) làm key** nếu các mục trong danh sách có thể thay đổi, sắp xếp lại hoặc lọc. Làm như vậy có thể gây ra lỗi giao diện hiển thị sai lệch và ảnh hưởng tiêu cực đến hiệu năng. Hãy luôn ưu tiên các ID duy nhất từ dữ liệu của bạn (ví dụ: `user.id`).

---

## 🌟 Ví dụ nâng cao (Mảng chứa các Đối tượng)

Trong các ứng dụng thực tế, dữ liệu thường được biểu diễn dưới dạng một mảng chứa các đối tượng.

```jsx
const ProductList = () => {
  const products = [
    { id: 101, name: "Bàn phím", price: 50 },
    { id: 102, name: "Chuột", price: 30 },
    { id: 103, name: "Màn hình", price: 200 }
  ];

  return (
    <div>
      <h2>Danh mục sản phẩm</h2>
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <h3>{product.name}</h3>
          <p>Giá: ${product.price}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Danh sách & Key. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Phương thức JavaScript nào được ưu tiên để render danh sách trong React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phương thức `map()` được ưu tiên vì nó lặp qua mảng và trả về một mảng mới gồm các phần tử JSX.
</details>

### 2. Tại sao bạn nên tránh sử dụng `index` của mảng làm key?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu danh sách được sắp xếp lại, lọc, thêm hoặc xóa các mục, chỉ số index của mỗi phần tử sẽ thay đổi. Điều này có thể khiến React nhầm lẫn trạng thái UI của các phần tử (như ô input giữ giá trị của dòng sai lệch) và làm giảm hiệu năng render.
</details>

### 3. Phần tử nào trong vòng lặp phải nhận thuộc tính `key`?
<details>
  <summary><b>Reveal Answer</b></summary>

  **Phần tử ngoài cùng** được trả về bởi hàm callback của `.map()` phải nhận thuộc tính `key`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component Danh sách Người dùng
1. Tạo một tệp component mới tên là `UserList.jsx` bên trong `src/components/`.
2. Định nghĩa một danh sách người dùng chứa thông tin chi tiết:
   ```javascript
   const users = [
     { id: 1, name: "Alice", age: 25 },
     { id: 2, name: "Bob", age: 30 },
     { id: 3, name: "Charlie", age: 22 }
   ];
   ```
3. Sử dụng phương thức `.map()` để hiển thị danh sách người dùng này, hiển thị tên và tuổi của họ. Hãy đảm bảo mỗi phần tử có một `key` duy nhất.
4. Import và render `<UserList />` bên trong `App.jsx`.
