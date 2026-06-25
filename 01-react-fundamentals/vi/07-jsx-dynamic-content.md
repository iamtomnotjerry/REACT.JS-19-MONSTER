# Nhúng nội dung động trong JSX ⚛️

JSX cho phép bạn nhúng các biểu thức JavaScript (JavaScript expressions) trực tiếp vào cấu trúc giống như HTML. Đây là điểm làm cho giao diện React trở nên động, cho phép bạn hiển thị các biến số, tính toán giá trị, thực thi hàm và định dạng thuộc tính động.

Để chuyển sang "chế độ JavaScript" bên trong JSX, chúng ta bọc biểu thức đó trong **dấu ngoặc nhọn `{}`**.

---

## ⚡ Quy tắc dấu ngoặc nhọn `{}`

Nếu bạn viết các biểu thức bên trong JSX mà không có dấu ngoặc nhọn, React sẽ coi chúng là văn bản thuần túy. Việc bọc chúng trong dấu ngoặc nhọn báo hiệu cho React biết cần biên dịch đó là một biểu thức JavaScript hợp lệ.

```jsx
// React coi đây là văn bản thuần túy
<p>2 + 2</p>  // Kết quả hiển thị: 2 + 2

// React coi đây là một biểu thức JavaScript
<p>{2 + 2}</p>  // Kết quả hiển thị: 4
```

---

## 🌟 Các trường hợp sử dụng phổ biến của `{}`

### 1. Hiển thị biến số
Bạn có thể hiển thị bất kỳ biến tiêu chuẩn nào (chuỗi, số, v.v.) trực tiếp trong JSX của mình.
```jsx
const MyComponent = () => {
  const username = "MonsterCoder";
  return <h1>Chào mừng trở lại, {username}!</h1>;
};
```

### 2. Nhúng các biểu thức JavaScript
Bất kỳ biểu thức JavaScript một dòng nào trả về một giá trị đều có thể được nhúng.
```jsx
<p>2 nhân 10 bằng: {2 * 10}</p> // Kết quả hiển thị: 2 nhân 10 bằng: 20
```

### 3. Hiển thị nội dung mảng
React có thể hiển thị trực tiếp các mảng bằng cách in tuần tự từng phần tử ra màn hình.
```jsx
const MyComponent = () => {
  const friends = ["Alex", "John", "Jordan"];
  return <p>Bạn bè của tôi: {friends}</p>; // Kết quả hiển thị: Bạn bè của tôi: AlexJohnJordan
};
```
*(Lưu ý: Để hiển thị mảng một cách sạch sẽ dưới dạng danh sách, chúng ta thường sử dụng phương thức `.map()`, chúng ta sẽ học ở bài tiếp theo!)*

### 4. Thực thi hàm
Bạn có thể gọi một hàm JavaScript bên trong dấu ngoặc nhọn và React sẽ hiển thị bất kỳ thứ gì hàm đó trả về.
```jsx
const MyComponent = () => {
  const multiply = (a, b) => a * b;

  return (
    <p>
      Kết quả: {multiply(5, 4)}
    </p>
  ); // Kết quả hiển thị: Kết quả: 20
};
```

### 5. Nhúng các Class Name và thuộc tính động
Bạn có thể gán các biến động cho các thuộc tính HTML/JSX, chẳng hạn như `src`, `href`, hoặc `className`.
```jsx
const MyComponent = () => {
  const specialClass = "highlight-box";
  return <div className={specialClass}>Hộp này có một class động.</div>;
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Điều gì xảy ra nếu bạn không bọc `2 + 2` trong dấu ngoặc nhọn bên trong một thẻ JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ coi nó là một chuỗi văn bản thô và hiển thị nguyên văn `2 + 2` trên màn hình.
</details>

### 2. Bạn có thể viết một câu lệnh `if-else` nhiều dòng trực tiếp bên trong dấu ngoặc nhọn của JSX không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Bên trong dấu ngoặc nhọn, bạn chỉ được phép viết các **biểu thức** (mã nguồn trả về một giá trị cụ thể, như toán tử ba ngôi hoặc toán tử logic AND). Bạn không thể viết các câu lệnh điều khiển cấu trúc như `if`, `for`, hoặc `switch` trực tiếp ở đó.
</details>

### 3. Làm thế nào để truyền một biến chuỗi động vào thuộc tính `src` của thẻ ảnh?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn thay thế dấu ngoặc kép bằng dấu ngoặc nhọn chứa tên biến đó: `<img src={imageUrl} alt="mô tả" />`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Lời chào động
1. Tạo một component mới tên là `Greetings.jsx` bên trong `src/components/`.
2. Định nghĩa một biến chuỗi tên là `greetMessage` (ví dụ: `"Hello World!"` hoặc `"Xin chào!"`).
3. Hiển thị thông điệp này một cách động bên trong một thẻ `<h1>`.
4. Tạo một thẻ đoạn văn `<p>` hiển thị ngày hiện tại một cách động bằng cách sử dụng `{new Date().getDate()}`.
5. Import và render `<Greetings />` bên trong tệp `App.jsx`.

### 🛠️ Bài tập 2: Hiển thị thông tin đối tượng Sản phẩm
1. Tạo một component mới tên là `ProductInfo.jsx` bên trong `src/components/`.
2. Định nghĩa một đối tượng sản phẩm với các thuộc tính:
   ```javascript
   const product = {
     name: "Laptop",
     price: 1200,
     availability: "in stock"
   };
   ```
3. Hiển thị động tên sản phẩm trong thẻ `<h1>`, giá sản phẩm trong thẻ `<p>` (ví dụ: `$1200`), và tình trạng kho hàng trong một thẻ `<p>` khác.
4. Import và render `<ProductInfo />` bên trong tệp `App.jsx`.
