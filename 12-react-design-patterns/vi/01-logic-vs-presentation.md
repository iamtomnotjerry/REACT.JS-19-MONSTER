# Mô hình thiết kế: Phân tách Logic và Hiển thị & HOCs 📐

Các mô hình thiết kế (design patterns) trong React đại diện cho các giải pháp tiêu chuẩn được đúc kết để giải quyết các vấn đề lập trình lặp đi lặp lại. Trong bài học này, chúng ta sẽ học cách phân tách logic nghiệp vụ khỏi giao diện hiển thị (mô hình **Container-Presenter Pattern**) và cách xây dựng các **Component cấp cao (Higher-Order Components - HOCs)** để chia sẻ các logic hành vi dùng chung.

---

## ⚡ 1. Phân tách Logic & Hiển thị (Container-Presenter Pattern)

Một trong những khái niệm quan trọng nhất trong công nghệ phần mềm sạch là **Phân tách các mối quan tâm (Separation of Concerns)**. Chúng ta chia các component làm 2 loại:

### A. Component Hiển thị - Presentational Components (Lớp giao diện UI)
* **Nhiệm vụ**: Quyết định giao diện hiển thị ra sao (*how things look*).
* **Đặc điểm**: Không quản lý dữ liệu state (ngoại trừ các state giao diện cục bộ như cờ hover, bật tắt popup), không trực tiếp gọi API lấy dữ liệu, và nhận toàn bộ dữ liệu cùng các hàm callback xử lý thông qua **props**. Chúng hoàn toàn thuần khiết và có khả năng tái sử dụng cao.

### B. Component Logic - Container Components (Lớp xử lý Logic)
* **Nhiệm vụ**: Quyết định logic hoạt động ra sao (*how things work*).
* **Đặc điểm**: Trực tiếp quản lý state, gọi dữ liệu API từ máy chủ, xử lý các tác vụ phụ side effects và chứa các logic nghiệp vụ của ứng dụng. Chúng không chứa các thẻ HTML tạo kiểu giao diện phức tạp mà chỉ đóng vai trò bao bọc, truyền dữ liệu state xuống cho các Presentational Component con hiển thị.

### Ví dụ mã nguồn: Triển khai Container-Presenter

#### 1. Component Hiển thị UI (`UserListUI.jsx`)
```jsx
// Component Hiển thị thuần túy: Tập trung 100% vào hiển thị mã HTML & Styles
export const UserListUI = ({ users, onSelectUser }) => {
  return (
    <div style={styles.card}>
      <h3>Danh sách tài khoản hoạt động</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id} style={styles.item} onClick={() => onSelectUser(user.name)}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  card: { padding: "20px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px" },
  item: { padding: "10px", borderBottom: "1px solid #eee", cursor: "pointer" }
};
```

#### 2. Component Logic Bao bọc (`UserListContainer.jsx`)
```jsx
import { useState, useEffect } from 'react';
import { UserListUI } from './UserListUI';

// Component Logic: Xử lý toàn bộ state và gọi dữ liệu, hoàn toàn không vẽ giao diện HTML
export const UserListContainer = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users?_limit=4")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleSelectUser = (name) => {
    alert(`Đã chọn người dùng: ${name}`);
  };

  return <UserListUI users={users} onSelectUser={handleSelectUser} />;
};
```

---

## ⚡ 2. Component cấp cao (Higher-Order Components - HOCs)

Một **Higher-Order Component** là một mô hình lập trình hàm (functional programming), trong đó một hàm nhận đầu vào là một component và trả về một component mới hoàn toàn đã được nâng cấp, bổ sung thêm các thuộc tính (props) hoặc các hành vi logic xử lý.

Tên của các hàm HOC theo quy ước thường được bắt đầu bằng từ khóa **`with`** (ví dụ: `withLoading`, `withAuth`):

```jsx
import React from 'react';

// Khởi tạo một HOC hiển thị trạng thái Loading dùng chung
export function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Đang tải dữ liệu, vui lòng đợi...</p>;
    }
    // Truyền tiếp (forward) toàn bộ props còn lại xuống cho component con
    return <WrappedComponent {...props} />;
  };
}
```

### Cách tiêu thụ HOC:
```jsx
import { UserListUI } from './UserListUI';
import { withLoading } from './withLoading';

// Nâng cấp component UI bằng cách bao bọc qua hàm HOC loading
const UserListWithLoading = withLoading(UserListUI);

// Sử dụng ở component cha
// <UserListWithLoading isLoading={true} users={[]} onSelectUser={...} />
```

---

## 🚀 3. So sánh HOCs vs. Custom Hooks

Mặc dù HOC là một mô hình rất phổ biến trong các dự án React cũ, lập trình React hiện đại ngày nay ưu tiên sử dụng **Custom Hooks** để chia sẻ logic:

| Tiêu chí | Component cấp cao (HOCs) | Custom Hooks (`useHooks`) |
| :--- | :--- | :--- |
| **Mã nguồn dư thừa** | Nhiều. Đòi hỏi viết các hàm lồng nhau và chuyển tiếp props phức tạp. | Ít. Chỉ đơn giản là một lời gọi hàm hook thông thường. |
| **Xung đột tên thuộc tính** | Dễ xảy ra. Hai HOC khác nhau có thể vô tình đè chung một tên prop truyền xuống con. | Không. Các biến trả về từ hook có thể tự do đổi tên. |
| **Độ lồng cấu trúc** | Tạo ra nhiều thẻ bao bọc rỗng (Wrapper Hell) trên cây React DevTools. | Phẳng. Không tạo ra bất kỳ thẻ DOM rỗng hay component bao bọc nào. |
| **Hỗ trợ TypeScript** | Phức tạp. Đòi hỏi định nghĩa các kiểu generic lồng nhau rất khó viết. | Đơn giản, rõ ràng và tự động suy luận kiểu cực kỳ tốt. |

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Ưu điểm lớn nhất của mô hình thiết kế Container-Presenter là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đó là tuân thủ nguyên lý **Phân tách các mối quan tâm (Separation of Concerns)**. Bằng việc tách biệt cấu trúc giao diện UI ra khỏi logic xử lý và gọi API mạng, các component sẽ trở nên đơn giản hơn, dễ chỉnh sửa, tái sử dụng cao (ví dụ bạn có thể thay đổi thiết kế thẻ hiển thị mà không cần chỉnh sửa logic gọi API), và vô cùng dễ viết mã kiểm thử (unit test).
</details>

### 2. Các Presentational component (component hiển thị) có được phép chứa biến state không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Các presentational component có thể chứa và quản lý các state giao diện mang tính chất cục bộ (ví dụ: state lưu chỉ số index thẻ đang hover, cờ ẩn/hiện menu thả xuống, hoặc cờ đóng mở accordion). Tuy nhiên chúng không được phép quản lý state chứa logic nghiệp vụ cốt lõi của ứng dụng (như thông tin tài khoản đăng nhập hay danh sách giỏ hàng gọi từ API).
</details>

### 3. Khái niệm "Chuyển tiếp props" (forward props) trong Higher-Order Component nghĩa là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  HOC đóng vai trò là một component bao bọc trung gian nằm giữa component cha thực tế và component con được nâng cấp. Bất kỳ thuộc tính nào component cha truyền vào HOC (ví dụ: `<EnhancedComponent title="Hello" />`) bắt buộc phải được HOC chuyển tiếp tiếp tục xuống cho component con bằng toán tử spread: `<WrappedComponent {...props} />`, nếu không component con sẽ bị thiếu hụt dữ liệu đầu vào.
</details>

### 4. Tại sao việc lồng nhiều HOC lại tạo ra hiện tượng "Wrapper Hell"?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì mỗi HOC sẽ trả về một component bao bọc mới. Nếu bạn lồng nhiều chức năng nâng cấp (ví dụ: `withAuth(withRouter(withLoading(MyComponent)))`), nó sẽ tạo ra bốn tầng component rỗng lồng vào nhau trên cây DOM ảo của React. Việc này gây tiêu tốn tài nguyên bộ nhớ và làm cho việc kiểm tra (inspect) component trên React DevTools trở nên vô cùng rối mắt.
</details>

### 5. Tại sao Custom Hooks hầu như thay thế hoàn toàn HOCs trong lập trình React hiện đại?
<details>
  <summary><b>Reveal Answer</b></summary>

  Custom Hooks giải quyết bài toán chia sẻ logic trạng thái mà không cần can thiệp hay bao bọc component. Chúng giúp mã nguồn phẳng hơn, loại bỏ hoàn toàn các thẻ bao bọc rỗng, tránh xung đột tên biến prop, và cực kỳ dễ dàng khai báo kiểu dữ liệu với TypeScript.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng HOC kiểm tra quyền Đăng nhập (Auth Guard)
1. Tạo một tệp `withAuth.tsx` (sử dụng đuôi `.tsx`).
2. Viết hàm HOC `withAuth(WrappedComponent)`.
3. Hàm này thực hiện kiểm tra thuộc tính boolean `isAuthenticated`:
   - Nếu `isAuthenticated` là `false`, hiển thị một thông báo từ chối truy cập: `<h2 style={{ color: "red" }}>Từ chối truy cập. Vui lòng đăng nhập!</h2>`.
   - Nếu là `true`, cho hiển thị `WrappedComponent` và chuyển tiếp đầy đủ toàn bộ props ban đầu xuống.
4. Nâng cấp component `UserListUI` bằng HOC vừa tạo: `const SecureList = withAuth(UserListUI)`.
5. Gọi component này trong tệp `App.jsx` và truyền vào cả hai trường hợp `isAuthenticated={true}` và `isAuthenticated={false}` để chạy thử nghiệm cơ chế bảo vệ.
