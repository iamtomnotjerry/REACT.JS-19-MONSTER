# Props trong React 🎁

**Props** (viết tắt của *properties* - thuộc tính) là cơ chế được sử dụng để truyền dữ liệu từ component cha xuống component con. Chúng cho phép bạn tạo ra các component động, dễ tái sử dụng và dễ cấu hình.

Props là **chỉ đọc** (bất biến - immutable). Một component con không bao giờ được phép sửa đổi props mà nó nhận được.

---

## ⚡ Cách hoạt động của Props

Props được truyền vào component tương tự cách bạn chỉ định các thuộc tính trên các thẻ HTML (ví dụ như `src` hoặc `href`).

### 1. Truyền Props từ Component Cha
```jsx
// Parent Component (App.jsx)
import UserProfile from "./UserProfile";

const App = () => {
  return (
    <div>
      <UserProfile username="Alice" age={25} isMember={true} />
      <UserProfile username="Bob" age={30} isMember={false} />
    </div>
  );
};
```

### 2. Nhận Props ở Component Con
Trong component con, props được nhận dưới dạng một đối số đối tượng duy nhất trong hàm:

```jsx
// Child Component (UserProfile.jsx)
const UserProfile = (props) => {
  return (
    <div className="user-card">
      <h2>Name: {props.username}</h2>
      <p>Age: {props.age}</p>
      <p>Status: {props.isMember ? "Active Member" : "Guest"}</p>
    </div>
  );
};
```

---

## 💡 Phân rã Props (Khuyên dùng)

Để làm cho mã nguồn của bạn sạch hơn và tránh việc phải viết lặp đi lặp lại `props.`, bạn có thể phân rã đối tượng props trực tiếp trong phần khai báo tham số của hàm:

```jsx
// Destructuring directly in the parameters
const UserProfile = ({ username, age, isMember }) => {
  return (
    <div className="user-card">
      <h2>Name: {username}</h2>
      <p>Age: {age}</p>
      <p>Status: {isMember ? "Active Member" : "Guest"}</p>
    </div>
  );
};
```

---

## 🌟 Truyền các kiểu dữ liệu khác nhau dưới dạng Props

Props có thể nhận bất kỳ kiểu dữ liệu JavaScript nào, bao gồm chuỗi, số, boolean, mảng, đối tượng, thậm chí cả các hàm hoặc phần tử JSX:

```jsx
// Parent passing complex data types
<UserCard
  name="Jane Doe"
  age={28}
  hobbies={["Reading", "Coding", "Gaming"]}
  address={{ city: "New York", zip: "10001" }}
  imgUrl="https://example.com/avatar.jpg"
/>
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Props. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Component con có thể sửa đổi các props mà nó nhận được hay không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Props là chỉ đọc (bất biến). Nếu bạn cần thay đổi dữ liệu bên trong một component, bạn nên sử dụng **State** thay vì sửa đổi props.
</details>

### 2. Làm thế nào để truyền một giá trị boolean hoặc một con số dưới dạng một prop?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn phải bọc chúng bên trong dấu ngoặc nhọn: `<MyComponent age={25} isPremium={true} />`. (Các chuỗi văn bản có thể được truyền trực tiếp bằng dấu ngoặc kép: `<MyComponent name="Alice" />`).
</details>

### 3. Phân rã props (prop destructuring) là gì và tại sao nó được sử dụng?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phân rã props là việc trích xuất các thuộc tính riêng lẻ từ đối tượng `props` ngay tại phần đối số của hàm hoặc trong thân hàm. Nó được sử dụng để giữ cho mã nguồn sạch sẽ và dễ đọc, loại bỏ nhu cầu phải thêm `props.` trước mỗi biến.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component UserCard tùy chỉnh
1. Tạo một component `UserCard.jsx` bên trong `src/components/`.
2. Component này sẽ nhận `name`, `role`, và `bio` làm props.
3. Áp dụng phong cách CSS đơn giản để làm cho nó trông giống như một chiếc thẻ.
4. Import và render `<UserCard />` nhiều lần trong `App.jsx`, truyền dữ liệu của những người dùng khác nhau.
