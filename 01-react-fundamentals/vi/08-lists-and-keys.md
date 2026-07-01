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
1. **Đối chiếu (Reconciliation)**: Khi một item trong danh sách được thêm vào, xóa đi, hoặc sắp xếp lại, React so sánh các cây Virtual DOM.
2. **Định danh (Identity)**: `key` đóng vai trò là một định danh duy nhất cho phần tử cụ thể đó. Nó nói cho React biết: *"Phần tử này tương ứng với item dữ liệu cụ thể này"*.
3. **Hiệu năng (Performance)**: Với key, React chỉ cập nhật hoặc sắp xếp lại những phần tử DOM thực sự thay đổi, thay vì hủy bỏ và xây dựng lại toàn bộ danh sách từ đầu.

---

## ⚠️ Thực tiễn tốt nhất & Các bẫy cần tránh khi dùng Key

### 1. Tránh sử dụng Chỉ số (Index) của Mảng làm Key
Không sử dụng chỉ số mảng (tham số thứ hai trong vòng lặp `.map(item, index)`) làm key nếu danh sách có khả năng thay đổi, sắp xếp lại, lọc hoặc thêm/xóa phần tử.
* **Lỗi xảy ra:** Khi bạn sắp xếp lại danh sách, chỉ số index của phần tử sẽ thay đổi. React sẽ nhận nhầm danh tính phần tử DOM, gây ra lỗi hiển thị (ví dụ: các ô input giữ lại giá trị của sai item) và làm giảm hiệu suất render.
* **Quy tắc:** Chỉ sử dụng index làm key khi bạn chắc chắn 100% danh sách này là tĩnh (chỉ đọc) và không bao giờ thay đổi.

### 2. Tuyệt đối không dùng Key ngẫu nhiên (ví dụ: `Math.random()`)
Tạo key ngẫu nhiên ngay khi render là một lỗi phản mẫu (anti-pattern) rất nặng trong React:
* **Lỗi xảy ra:** Ở *mỗi lần render*, một key mới sẽ được tạo ra. React coi đây là một phần tử hoàn toàn mới, dẫn đến việc unmount (hủy bỏ) phần tử DOM cũ và mount (tạo mới) phần tử mới. Điều này gây ra:
  - Mất hoàn toàn state cục bộ của component con (ví dụ: chữ trong ô input bị xóa sạch).
  - Mất tiêu điểm (focus) của con trỏ chuột.
  - Hiệu năng cực kỳ kém do DOM phải liên tục xây dựng lại.
* **Quy tắc:** Key phải **ổn định, dự đoán được và duy nhất**. Hãy luôn sử dụng ID duy nhất từ dữ liệu của bạn (ví dụ: `user.id`).

### 3. Thiết lập Key cho React Fragment
Nếu bạn cần hiển thị nhiều phần tử đồng cấp cho mỗi item trong danh sách mà không muốn bọc chúng trong một thẻ bao ngoài (như `div`), bạn phải dùng cú pháp `<React.Fragment>` đầy đủ, vì cú pháp viết tắt (`<>...</>`) không hỗ trợ thuộc tính như `key`.

```jsx
import React from 'react';

const DefinitionList = ({ items }) => {
  return (
    <dl>
      {items.map((item) => (
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
};
```

---

## 🌟 Ví dụ nâng cao (Mảng các object)

Trong các ứng dụng thực tế, dữ liệu thường được biểu diễn dưới dạng một mảng các object.

```jsx
const ProductCatalog = () => {
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

  Nếu danh sách bị sắp xếp lại, lọc hoặc thêm/xóa phần tử, index của các item sẽ thay đổi. Điều này khiến React đối chiếu sai trạng thái giao diện (như giữ lại giá trị nhập của sai ô input) và làm giảm hiệu năng render.
</details>

### 3. Điều gì xảy ra nếu bạn sử dụng `key={Math.random()}` khi render danh sách?
<details>
  <summary><b>Reveal Answer</b></summary>

  Ở mỗi lần render, React tạo ra một key mới ngẫu nhiên. React sẽ unmount hoàn toàn phần tử DOM cũ và mount lại phần tử mới từ đầu. Gây mất state (xóa sạch nội dung input), mất focus và suy giảm hiệu năng nghiêm trọng.
</details>

### 4. Phần tử nào trong vòng lặp phải nhận prop `key`?
<details>
  <summary><b>Reveal Answer</b></summary>

  **Phần tử ngoài cùng** được trả về bởi hàm callback của `.map()` phải nhận prop `key`.
</details>

### 5. Làm sao để truyền key nếu bạn muốn render nhiều phần tử đồng cấp mà không cần thẻ div bao ngoài?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn phải import `React` và dùng thẻ `<React.Fragment key={item.id}>...</React.Fragment>`. Cú pháp viết tắt `<>...</>` không hỗ trợ truyền thuộc tính `key`.
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

### 🛠️ Bài tập 2: Component danh sách sản phẩm (Product List)
1. Tạo một file component mới `ProductList.jsx` bên trong `src/components/`.
2. Định nghĩa một mảng sản phẩm:
   ```javascript
   const products = [
     { id: 1, name: "Phone", price: 699 },
     { id: 2, name: "Laptop", price: 1200 },
     { id: 3, name: "Headphones", price: 199 }
   ];
   ```
3. Dùng phương thức `.map()` hiển thị tên và giá của từng sản phẩm. Sử dụng `id` sản phẩm làm key.
4. Import và render `<ProductList />` bên trong `App.jsx`.
