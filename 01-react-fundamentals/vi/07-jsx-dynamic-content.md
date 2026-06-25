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

### 4. Thực thi hàm
Bạn có thể gọi một hàm JavaScript bên trong dấu ngoặc nhọn, và React sẽ hiển thị bất cứ thứ gì hàm đó trả về.
```jsx
const MyComponent = () => {
  const multiply = (a, b) => a * b;

  return (
    <p>
      Result: {multiply(5, 4)}
    </p>
  ); // Outputs: Result: 20
};
```

### 5. Tên class và thuộc tính động
Bạn có thể gán các biến một cách động cho các thuộc tính HTML/JSX, chẳng hạn như `src`, `href`, hoặc `className`.
```jsx
const MyComponent = () => {
  const specialClass = "highlight-box";
  return <div className={specialClass}>This box has a dynamic class.</div>;
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về nội dung động. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Điều gì xảy ra nếu bạn không bọc `2 + 2` trong dấu ngoặc nhọn bên trong một thẻ JSX?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ coi nó như một chuỗi văn bản nguyên văn và hiển thị `2 + 2` trên màn hình.
</details>

### 2. Bạn có thể viết một câu lệnh `if-else` nhiều dòng trực tiếp bên trong dấu ngoặc nhọn của JSX không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Bên trong dấu ngoặc nhọn, bạn chỉ có thể viết các **biểu thức** (đoạn mã trả về một giá trị, như toán tử ba ngôi hoặc câu lệnh logic AND). Bạn không thể viết trực tiếp các câu lệnh như `if`, `for`, hoặc `switch`.
</details>

### 3. Làm thế nào để truyền một biến chuỗi động vào thuộc tính `src` của một thẻ ảnh?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn thay thế các dấu ngoặc kép bằng dấu ngoặc nhọn chứa tên biến: `<img src={imageUrl} alt="description" />`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của mình:

### 🛠️ Bài tập 1: Lời chào động
1. Tạo một file component mới `Greetings.jsx` bên trong `src/components/`.
2. Định nghĩa một biến chuỗi `greetMessage` (ví dụ `"Hello World!"` hoặc `"Gracias!"`).
3. Hiển thị thông điệp này một cách động bên trong một thẻ `<h1>`.
4. Tạo một thẻ đoạn văn `<p>` hiển thị ngày hiện tại một cách động bằng cách sử dụng `{new Date().getDate()}`.
5. Import và render `<Greetings />` bên trong file `App.jsx` của bạn.

### 🛠️ Bài tập 2: Thông tin đối tượng sản phẩm
1. Tạo một file component mới `ProductInfo.jsx` bên trong `src/components/`.
2. Định nghĩa một đối tượng sản phẩm với các thuộc tính:
   ```javascript
   const product = {
     name: "Laptop",
     price: 1200,
     availability: "in stock"
   };
   ```
3. Hiển thị một cách động tên sản phẩm trong thẻ `<h1>`, giá trong thẻ `<p>` (ví dụ `$1200`), và trạng thái còn hàng trong một thẻ `<p>` khác.
4. Import và render `<ProductInfo />` bên trong file `App.jsx`.
