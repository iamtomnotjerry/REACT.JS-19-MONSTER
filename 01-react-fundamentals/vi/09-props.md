# Props trong React 🎁

**Props** (viết tắt của *properties* - thuộc tính) là cơ chế được sử dụng để truyền dữ liệu từ component cha xuống component con. Chúng giúp bạn thiết kế các component động, dễ tái sử dụng và dễ cấu hình.

Props là thuộc tính **chỉ đọc** (bất biến - immutable). Một component con tuyệt đối không bao giờ được phép sửa đổi props mà nó nhận được.

---

## ⚡ Cách hoạt động của Props

Props được truyền vào component tương tự cách bạn viết các thuộc tính cho các thẻ HTML (như `src` hoặc `href`).

### 1. Truyền Props từ Component Cha
```jsx
// Component Cha (App.jsx)
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
Trong component con, props được nhận dưới dạng một đối tượng đối số duy nhất trong hàm:

```jsx
// Component Con (UserProfile.jsx)
const UserProfile = (props) => {
  return (
    <div className="user-card">
      <h2>Tên: {props.username}</h2>
      <p>Tuổi: {props.age}</p>
      <p>Trạng thái: {props.isMember ? "Thành viên tích cực" : "Khách"}</p>
    </div>
  );
};
```

---

## 💡 Phân rã Props (Prop Destructuring - Khuyên dùng)

Để làm cho mã nguồn của bạn sạch hơn và tránh việc phải viết lặp đi lặp lại từ khóa `props.`, bạn có thể phân rã đối tượng props trực tiếp trong phần khai báo tham số của hàm:

```jsx
// Phân rã trực tiếp trong tham số của hàm
const UserProfile = ({ username, age, isMember }) => {
  return (
    <div className="user-card">
      <h2>Tên: {username}</h2>
      <p>Tuổi: {age}</p>
      <p>Trạng thái: {isMember ? "Thành viên tích cực" : "Khách"}</p>
    </div>
  );
};
```

---

## 🌟 Truyền các kiểu dữ liệu khác nhau dưới dạng Props

Props có thể nhận bất kỳ kiểu dữ liệu JavaScript nào, bao gồm chuỗi, số, boolean, mảng, đối tượng, thậm chí cả các hàm hoặc phần tử JSX:

```jsx
// Cha truyền các kiểu dữ liệu phức tạp
<UserCard
  name="Jane Doe"
  age={28}
  hobbies={["Đọc sách", "Viết code", "Chơi game"]}
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

  Không. Props là thuộc tính chỉ đọc (bất biến). Nếu bạn cần thay đổi dữ liệu bên trong một component, bạn phải sử dụng **State** thay vì cố gắng sửa đổi props.
</details>

### 2. Làm thế nào để truyền một giá trị boolean hoặc một con số dưới dạng một prop?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn phải bọc chúng bên trong dấu ngoặc nhọn: `<MyComponent age={25} isPremium={true} />`. (Các chuỗi văn bản thì có thể truyền trực tiếp bằng dấu ngoặc kép: `<MyComponent name="Alice" />`).
</details>

### 3. Phân rã props (prop destructuring) là gì và tại sao nó lại được sử dụng?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phân rã props là kỹ thuật trích xuất các thuộc tính riêng lẻ từ đối tượng `props` ngay lập tức tại vị trí tham số hàm hoặc trong thân hàm. Nó được sử dụng để giúp mã nguồn ngắn gọn, dễ đọc, loại bỏ nhu cầu viết `props.` trước mỗi tên biến.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component Thẻ thông tin UserCard tùy chỉnh
1. Tạo một component tên là `UserCard.jsx` bên trong `src/components/`.
2. Component này sẽ nhận các prop gồm `name`, `role`, và `bio`.
3. Áp dụng phong cách CSS đơn giản để làm cho nó trông giống như một chiếc thẻ thông tin.
4. Import và render `<UserCard />` nhiều lần trong tệp `App.jsx` với các dữ liệu người dùng khác nhau.
