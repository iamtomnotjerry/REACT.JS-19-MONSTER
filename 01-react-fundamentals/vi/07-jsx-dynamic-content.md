# Nội dung động trong JSX ⚛️

JSX cho phép bạn nhúng các biểu thức JavaScript trực tiếp vào cấu trúc giống như HTML của mình. Đây chính là điều làm cho giao diện React trở nên động, cho phép bạn hiển thị các biến, tính toán giá trị, thực thi hàm và định dạng thuộc tính một cách động.

Để chuyển sang "chế độ JavaScript" bên trong JSX, chúng ta bọc biểu thức đó trong **dấu ngoặc nhọn `{}`**.

---

## ⚡ Quy tắc dấu ngoặc nhọn `{}`

Nếu bạn viết các biểu thức bên trong JSX mà không có dấu ngoặc nhọn, React sẽ coi chúng là văn bản thuần túy. Việc bọc chúng trong dấu ngoặc nhọn báo cho React biết cần biên dịch nó như một biểu thức JavaScript.

```jsx
// React treats this as plain text
<p>2 + 2</p>  // Outputs: 2 + 2

// React treats this as a JavaScript expression
<p>{2 + 2}</p>  // Outputs: 4
```

---

## 🌟 Các trường hợp sử dụng phổ biến của `{}`

### 1. Hiển thị biến
Bạn có thể hiển thị bất kỳ biến tiêu chuẩn nào (chuỗi, số, v.v.) trực tiếp trong JSX của mình.
```jsx
const MyComponent = () => {
  const username = "MonsterCoder";
  return <h1>Welcome back, {username}!</h1>;
};
```

### 2. Nhúng các biểu thức JavaScript
Bất kỳ biểu thức JavaScript một dòng hợp lệ nào trả về một giá trị đều có thể được nhúng vào.
```jsx
<p>2 * 10 is equal to: {2 * 10}</p> // Outputs: 2 * 10 is equal to: 20
```

### 3. Hiển thị nội dung mảng
React có thể hiển thị trực tiếp các mảng. Nó sẽ in ra từng phần tử một cách tuần tự.
```jsx
const MyComponent = () => {
  const friends = ["Alex", "John", "Jordan"];
  return <p>My friends: {friends}</p>; // Outputs: My friends: AlexJohnJordan
};
```
*(Lưu ý: Để hiển thị mảng một cách gọn gàng dưới dạng danh sách, chúng ta thường sử dụng phương thức `.map()`, điều mà chúng ta sẽ học trong bài học tiếp theo!)*

### 4. Thực thi hàm & Helper Methods
Bạn có thể gọi bất kỳ hàm JavaScript nào bên trong dấu ngoặc nhọn, và React sẽ hiển thị bất cứ thứ gì hàm đó trả về. Điều này cực kỳ lý tưởng để định dạng dữ liệu trước khi hiển thị lên giao diện.
```jsx
const MyComponent = () => {
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div>
      <p>Total cost: {formatPrice(19.99)}</p> {/* Outputs: Total cost: $19.99 */}
    </div>
  );
};
```

### 5. Tên class và thuộc tính động
Bạn có thể gán các biến một cách động cho các thuộc tính HTML/JSX, chẳng hạn như `src`, `href`, hoặc `className`. Đối với việc tạo class động (dynamic styling), việc sử dụng template literals bên trong dấu ngoặc nhọn `{}` là tiêu chuẩn công nghiệp:
```jsx
const Button = ({ variant, isActive }) => {
  const baseClass = "btn";
  
  return (
    <button className={`${baseClass} btn-${variant} ${isActive ? "active" : ""}`}>
      Click Me
    </button>
  );
};
```

---

## ⚠️ Bẫy & Trường hợp đặc biệt quan trọng (Critical Pitfalls)

Khi làm việc với nội dung động trong JSX, có một số hành vi rất dễ khiến các lập trình viên mới gặp lỗi:

### 1. Lỗi Crash khi Render Object trực tiếp (Run-time Error)
React **không thể** render trực tiếp một plain JavaScript object (đối tượng thuần túy) làm phần tử con (children) trong JSX. Nếu cố làm vậy, ứng dụng sẽ bị crash ngay lập tức với lỗi: `Error: Objects are not valid as a React child`.

* **Viết sai:**
  ```jsx
  const user = { name: "Alex", age: 25 };
  return <div>{user}</div>; // ❌ Làm crash ứng dụng!
  ```
* **Viết đúng:** Render từng thuộc tính nguyên thủy của đối tượng, hoặc chuyển đổi thành chuỗi JSON khi cần debug:
  ```jsx
  return (
    <div>
      <p>Name: {user.name}</p> {/* ✅ Hoạt động tốt */}
      <pre>{JSON.stringify(user, null, 2)}</pre> {/* ✅ Hoạt động (dùng khi debug) */}
    </div>
  );
  ```

### 2. Các giá trị Boolean, `null` và `undefined` bị bỏ qua
Các giá trị như `true`, `false`, `null` và `undefined` là những phần tử JSX hợp lệ nhưng chúng **sẽ không hiển thị bất kỳ nội dung nào** lên DOM. Điều này cực kỳ hữu ích cho việc render có điều kiện, nhưng nếu bạn thực sự muốn hiển thị chúng ra màn hình, bạn phải chuyển chúng thành chuỗi (string):

* **Không hiển thị gì:**
  ```jsx
  const isOnline = true;
  return <div>Status: {isOnline}</div>; // Kết quả trên màn hình: "Status: "
  ```
* **Cách hiển thị giá trị:**
  ```jsx
  return <div>Status: {isOnline.toString()}</div>; // Kết quả: "Status: true"
  // HOẶC
  return <div>Status: {isOnline ? "Online" : "Offline"}</div>;
  ```

### 3. Lỗi hiển thị số `0` khi dùng điều kiện rút gọn (Short-Circuit Bug)
Vì giá trị boolean không hiển thị gì, chúng ta hay dùng cú pháp `{condition && <Component />}` để render có điều kiện. Tuy nhiên, nếu biến điều kiện có giá trị là số `0`, React **sẽ render số `0` đó** lên màn hình vì `0` là kiểu dữ liệu Number chứ không phải Boolean.

* **Code lỗi:**
  ```jsx
  const items = [];
  return <div>{items.length && <p>Items available!</p>}</div>; // Màn hình hiển thị: "0" ❌
  ```
* **Code đúng:** Luôn đảm bảo biểu thức điều kiện trả về một giá trị boolean thực sự:
  ```jsx
  return <div>{items.length > 0 && <p>Items available!</p>}</div>; // Không hiển thị gì ✅
  // HOẶC dùng toán tử 3 ngôi
  return <div>{items.length ? <p>Items available!</p> : null}</div>;
  ```

### 4. Sử dụng Chuỗi trực tiếp vs Ngoặc nhọn trong Thuộc tính
Tuyệt đối không kết hợp dấu ngoặc kép và dấu ngoặc nhọn khi truyền các thuộc tính động.
* **Viết sai:** `src="{imageUrl}"` hoặc `src="{{imageUrl}}"`
* **Viết đúng:** `src={imageUrl}`

---

## 🧠 Kiểm tra kiến thức (Câu hỏi phỏng vấn)

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về nội dung động. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Điều gì xảy ra nếu bạn không bọc `2 + 2` trong dấu ngoặc nhọn bên trong một thẻ JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ coi nó như một chuỗi văn bản nguyên văn và hiển thị `2 + 2` trên màn hình.
</details>

### 2. Bạn có thể viết một câu lệnh nhiều dòng (như `if-else` hoặc vòng lặp `for`) trực tiếp bên trong dấu ngoặc nhọn của JSX không?
<details>
  <summary><b>Reveal Answer</b></summary>

  **Không.** Bạn chỉ được phép viết **biểu thức** (expression - đoạn mã trả về một giá trị) bên trong dấu ngoặc nhọn. Các câu lệnh như `if-else`, vòng lặp `for`, `while` hay khai báo biến là các câu lệnh (statements) và sẽ gây lỗi cú pháp (syntax error). Đối với logic điều kiện, bạn phải dùng toán tử ba ngôi (`? :`), toán tử logic (`&&`), hoặc gọi một hàm helper chứa các câu lệnh đó.
</details>

### 3. React bảo vệ nội dung động bên trong `{}` khỏi các cuộc tấn công XSS (Cross-Site Scripting) như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mặc định, React **tự động escape (mã hóa)** mọi giá trị động được render trong JSX trước khi hiển thị chúng. Nghĩa là bất kỳ mã HTML nào được truyền vào dưới dạng chuỗi động sẽ được hiển thị dưới dạng văn bản thuần túy (plain text) thay vì được trình duyệt phân tích và thực thi như mã lệnh. Nếu bạn thực sự muốn render một chuỗi chứa thẻ HTML thô, bạn phải dùng thuộc tính `dangerouslySetInnerHTML`.
</details>

### 4. Kết quả render của `<div>{false || "Fallback Text"}</div>` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó sẽ render `"Fallback Text"`. Vì `false` bị React bỏ qua không render gì, toán tử logic OR (`||`) sẽ trả về giá trị vế sau là chuỗi `"Fallback Text"` và React sẽ hiển thị chuỗi này.
</details>

### 5. Tại sao `<img src={logoUrl} alt="logo" />` là đúng, còn `<img src="{logoUrl}" alt="logo" />` lại sai?
<details>
  <summary><b>Reveal Answer</b></summary>

  Cách thứ hai sẽ coi `"{logoUrl}"` là một chuỗi đường dẫn tĩnh, nghĩa là trình duyệt sẽ cố gắng tìm kiếm và tải một file ảnh có tên chính xác là `{logoUrl}` (điều này sẽ gây lỗi 404). Cách thứ nhất sử dụng dấu ngoặc nhọn để React hiểu cần tính toán giá trị của biến `logoUrl` và truyền chuỗi đường dẫn thực sự vào thuộc tính `src`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của mình:

### 🛠️ Bài tập 1: Lời chào động & Định dạng thời gian
1. Tạo một file component mới `Greetings.jsx` bên trong `src/components/`.
2. Định nghĩa một biến chuỗi `greetMessage` (ví dụ `"Welcome to React!"`).
3. Hiển thị thông điệp này một cách động bên trong một thẻ `<h1>`.
4. Hiển thị ngày và giờ hiện tại được định dạng đẹp mắt (ví dụ: dùng `new Date().toLocaleString()`) một cách động bên trong một thẻ `<p>`.
5. Import và render `<Greetings />` bên trong file `App.jsx` của bạn.

### 🛠️ Bài tập 2: Card sản phẩm với CSS động
1. Tạo một file component mới `ProductInfo.jsx` bên trong `src/components/`.
2. Định nghĩa một đối tượng sản phẩm:
   ```javascript
   const product = {
     name: "Màn hình Ultra-Wide",
     price: 499.99,
     availability: "Out of Stock" // Thử đổi thành "In Stock" để kiểm tra kết quả
   };
   ```
3. Hiển thị động tên sản phẩm, giá đã định dạng (ví dụ `$499.99`), và trạng thái tồn kho.
4. **Thử thách**: Áp dụng CSS class động dựa vào trạng thái tồn kho:
   - Nếu sản phẩm là `"In Stock"`, hiển thị trạng thái tồn kho bằng class `status-available` (chữ màu xanh lá).
   - Nếu là `"Out of Stock"`, hiển thị trạng thái bằng class `status-unavailable` (chữ màu đỏ).
   - *Gợi ý*: Sử dụng template literals trong thuộc tính `className`.
5. Import và render `<ProductInfo />` bên trong file `App.jsx`.
