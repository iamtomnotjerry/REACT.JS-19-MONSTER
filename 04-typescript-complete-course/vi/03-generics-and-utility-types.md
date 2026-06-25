# Bài 3: Generic & Các kiểu tiện ích (Utility Types) trong TypeScript 📘

Bài học này hướng dẫn cách sử dụng **Generic** (viết các hàm, class và interface có khả năng tái sử dụng với nhiều kiểu dữ liệu khác nhau trong khi vẫn đảm bảo an toàn kiểu dữ liệu tại thời điểm biên dịch) và các **Utility Types** tích hợp sẵn của TypeScript để biến đổi cấu trúc dữ liệu.

---

## ⚡ 1. Generic trong TypeScript

Generic hoạt động như một biến chứa kiểu dữ liệu—nghĩa là bạn có thể truyền một tham số kiểu dữ liệu (thường ký hiệu là `<T>`) vào một hàm hoặc component giống như cách truyền đối số cho hàm.

### A. Generic cho Hàm (Generic Functions)
Thay vì sử dụng kiểu `any` (làm mất hoàn toàn tính năng kiểm tra an toàn kiểu dữ liệu), generic giúp bảo toàn liên kết kiểu dữ liệu chính xác giữa tham số đầu vào và giá trị trả về:

```typescript
// 1. Một hàm generic tiện ích cơ bản
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const num = getFirstElement([10, 20, 30]); // TypeScript tự hiểu 'num' có kiểu: number
const str = getFirstElement(["a", "b", "c"]); // TypeScript tự hiểu 'str' có kiểu: string
```

### B. Ràng buộc Generic (Generic Constraints - `extends`)
Đôi khi bạn muốn viết một hàm hỗ trợ nhiều kiểu dữ liệu, nhưng yêu cầu các kiểu đó bắt buộc phải chứa một số thuộc tính cụ thể. Ta thực hiện ràng buộc này bằng từ khóa **`extends`**:

```typescript
interface HasId {
  id: number;
}

// Bắt buộc tham số kiểu T phải có thuộc tính 'id'
function logItemDetails<T extends HasId>(item: T): void {
  console.log(`ID của phần tử là: ${item.id}`);
}

logItemDetails({ id: 101, title: "Sách" }); // Hợp lệ!
// logItemDetails({ title: "Không có ID" }); // Lỗi: Thuộc tính 'id' bị thiếu.
```

### C. Ràng buộc bằng từ khóa `keyof`
Bạn có thể ràng buộc một tham số generic khớp với danh sách các thuộc tính (keys) của một đối tượng khác:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K) {
  return obj[key];
}

const car = { brand: "Tesla", model: "Model 3", year: 2024 };
const brand = getProperty(car, "brand"); // Hợp lệ!
// const price = getProperty(car, "price"); // Lỗi: Đối số kiểu '"price"' không thể gán cho "brand" | "model" | "year"
```

---

## ⚡ 2. Các kiểu tiện ích tích hợp sẵn (Utility Types)

TypeScript cung cấp sẵn một số kiểu tiện ích toàn cục giúp bạn biến đổi các kiểu dữ liệu hiện có thành các cấu trúc mới.

| Kiểu tiện ích | Mô tả | Trường hợp sử dụng |
| :--- | :--- | :--- |
| **`Partial<T>`** | Thiết lập tất cả các thuộc tính của `T` thành **tùy chọn (optional)** (`?`). | Xử lý các form chỉnh sửa thông tin hoặc yêu cầu PATCH API. |
| **`Readonly<T>`** | Thiết lập tất cả các thuộc tính của `T` thành **chỉ đọc**. | Đóng băng dữ liệu cấu hình hoặc bộ nhớ đệm state. |
| **`Pick<T, Keys>`** | Tạo kiểu mới bằng cách **chỉ chọn lọc** một nhóm các thuộc tính từ `T`. | Lấy dữ liệu tóm tắt hiển thị dạng thẻ card từ đối tượng database lớn. |
| **`Omit<T, Keys>`** | Tạo kiểu mới bằng cách **loại bỏ** một nhóm các thuộc tính khỏi `T`. | Tạo form đăng ký của người dùng, loại bỏ trường ID tự động tăng. |

### Ví dụ mã nguồn sử dụng Utility Types

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl: string;
}

// 1. Partial: Tạo đối tượng cập nhật với các trường tùy chọn
const updateProfile = (id: number, updates: Partial<UserProfile>) => {
  // updates có thể chứa username, email, hoặc avatarUrl; tất cả đều là tùy chọn
};

// 2. Pick: Chọn lọc chỉ lấy username và avatarUrl để làm danh sách hiển thị
type UserPreview = Pick<UserProfile, "username" | "avatarUrl">;
const preview: UserPreview = {
  username: "monstercoder",
  avatarUrl: "https://avatar.png"
};

// 3. Omit: Loại bỏ trường 'id' dành cho biểu mẫu đăng ký mới
type RegisterData = Omit<UserProfile, "id">;
const submission: RegisterData = {
  username: "alice",
  email: "alice@test.com",
  avatarUrl: "https://alice.jpg"
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao việc sử dụng Generic `<T>` lại tối ưu hơn việc sử dụng kiểu `any`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Kiểu `any` tắt hoàn toàn chức năng kiểm tra của trình biên dịch, khiến TypeScript không thể biết hay xác nhận kiểu dữ liệu trả về của hàm. Generic `<T>` hoạt động như một tham số giữ chỗ ghi nhận *chính xác* kiểu dữ liệu được truyền vào, từ đó bảo toàn kiểu dữ liệu và tự động gợi ý code (autocomplete) an toàn cho kết quả đầu ra.
</details>

### 2. Biểu thức `K extends keyof T` có ý nghĩa gì trong một hàm generic?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó ràng buộc tham số kiểu `K` bắt buộc phải là một trong những tên thuộc tính (keys) hợp lệ của đối tượng kiểu `T`. Điều này giúp ngăn chặn lỗi gõ sai tên thuộc tính của lập trình viên.
</details>

### 3. Nếu bạn bao bọc một interface trong `Readonly<Type>`, bạn có thể chỉnh sửa các thuộc tính của nó khi chạy ứng dụng (runtime) không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không khi biên dịch, TypeScript sẽ báo lỗi và chặn các dòng code cố tình gán lại giá trị cho các thuộc tính. Tuy nhiên, lưu ý rằng vì các kiểu dữ liệu TS bị loại bỏ khi biên dịch sang JS, nên mã JS chạy thực tế sẽ không ngăn chặn thay đổi trừ khi bạn đóng băng đối tượng đó bằng hàm `Object.freeze()`.
</details>

### 4. Sự khác biệt giữa `Omit<User, 'id' | 'role'>` và `Pick<User, 'username' | 'email'>` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `Omit` loại bỏ các trường được chỉ định (`id` và `role`) và giữ lại tất cả các trường còn lại của interface `User`.
  - `Pick` chỉ trích xuất các trường được chọn (`username` và `email`), loại bỏ toàn bộ các trường khác.
</details>

### 5. Một interface tùy chỉnh có thể kế thừa từ một kiểu dữ liệu đã được biến đổi bởi Utility Type không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Bạn có thể sử dụng Utility Types trong kế thừa interface, ví dụ:
  ```typescript
  interface GuestUser extends Omit<UserProfile, "id" | "email"> {
    guestToken: string;
  }
  ```
  Cú pháp này tạo ra một interface hợp lệ kết hợp các thuộc tính đã lọc cùng với trường dữ liệu mới.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng cấu trúc phản hồi API dùng chung (Generic API Wrapper)
1. Tạo một tệp `generics.ts` trong workspace của bạn.
2. Định nghĩa một generic interface `ApiResponse<T>` gồm các trường:
   - `status`: số (number).
   - `message`: chuỗi (string).
   - `data`: kiểu generic `T`.
3. Định nghĩa một interface `Product` gồm `id` (number) và `title` (string).
4. Tạo biến `productResponse` kiểu `ApiResponse<Product>` và gán một object giả lập để kiểm tra tính năng tự động gợi ý code.
5. Định nghĩa một interface `User` gồm `id` (number) và `username` (string).
6. Tạo biến `usersListResponse` kiểu `ApiResponse<User[]>` và gán mảng người dùng giả lập.
7. Đảm bảo rằng bạn nhận được autocomplete chính xác khi truy cập `productResponse.data.title` và `usersListResponse.data[0].username`.
