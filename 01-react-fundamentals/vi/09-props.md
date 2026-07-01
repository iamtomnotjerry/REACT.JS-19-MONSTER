# Props và Component Composition trong React 🎁

**Props** (viết tắt của *properties* - thuộc tính) là cơ chế được sử dụng để truyền dữ liệu từ một component cha xuống một component con. Chúng cho phép bạn làm cho các component trở nên động, có khả năng cấu hình và có tính tái sử dụng cao.

Props là **chỉ đọc** (bất biến - immutable). Một component con không bao giờ được phép sửa đổi trực tiếp các prop mà nó nhận được.

---

## ⚡ Props hoạt động như thế nào

Props được truyền vào các component tùy chỉnh của React bằng cú pháp tương tự như cách khai báo các thuộc tính trên thẻ HTML (ví dụ: `src` hay `href`).

### 1. Truyền Props từ Component cha
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

### 2. Nhận Props ở Component con
Trong component con, các prop được nhận dưới dạng một đối tượng (object) duy nhất chứa toàn bộ các cặp khóa-giá trị được truyền từ cha:

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

## 💡 Destructuring Props (Thực tiễn tốt nhất được khuyến nghị)

Để giữ cho mã nguồn của bạn ngắn gọn và tránh việc viết lặp đi lặp lại từ khóa `props.`, bạn nên giải nén đối tượng props trực tiếp trong phần khai báo tham số của hàm:

```jsx
// Destructuring trực tiếp trong tham số đầu vào
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

Props có thể nhận bất kỳ kiểu dữ liệu JavaScript tiêu chuẩn nào. Kiểu chuỗi (string) có thể truyền trực tiếp bằng dấu nháy kép; các kiểu khác (số, boolean, mảng, đối tượng, hàm) phải được bọc trong dấu ngoặc nhọn `{}`:

```jsx
<UserCard
  name="Jane Doe"                             // Chuỗi (String)
  age={28}                                    // Số (Number)
  isMarried={false}                           // Boolean
  hobbies={["Reading", "Coding", "Gaming"]}   // Mảng (Array)
  address={{ city: "New York", zip: "10001" }} // Đối tượng (Object)
/>
```

---

## 🧩 Prop `children`: Cấu trúc lồng ghép Component nâng cao

Prop **`children`** là một prop đặc biệt của React được tự động truyền vào mọi component. Nó chứa bất kỳ nội dung nào (văn bản thô, thẻ HTML, hoặc các component React khác) được đặt **ở giữa thẻ mở và thẻ đóng** của component đó.

Đây chính là nền tảng của **Component Composition** (kỹ thuật lồng ghép component vào trong các component bao ngoài).

### 1. Tạo một Component bao ngoài (Wrapper Component)
```jsx
// Wrapper Component (Card.jsx)
const Card = ({ children }) => {
  const cardStyles = {
    border: "2px solid #ccc",
    borderRadius: "10px",
    padding: "20px",
    margin: "10px",
    boxShadow: "2px 2px 12px rgba(0, 0, 0, 0.1)"
  };

  return <div style={cardStyles}>{children}</div>;
};

export default Card;
```

### 2. Sử dụng Component bao ngoài
Thay vì viết thẻ tự đóng (`<Card />`), bạn mở và đóng thẻ đầy đủ (`<Card>...</Card>`) rồi đặt các nội dung lồng ghép bên trong:
```jsx
// Parent Component (App.jsx)
import Card from "./components/Card";

const App = () => {
  return (
    <div>
      <Card>
        <h2>Khung chứa giao diện</h2>
        <p>Đoạn văn này được truyền động vào như một phần tử con!</p>
      </Card>
      
      <Card>
        <button onClick={() => alert("Thành công!")}>Kích hoạt Alert</button>
      </Card>
    </div>
  );
};
```

---

## ⚠️ Các quy tắc cốt lõi của Props

1. **Props là Chỉ đọc (Bất biến):** Một component con tuyệt đối không được tự ý chỉnh sửa prop của nó. Việc này giúp đảm bảo luồng dữ liệu một chiều của React và tránh các lỗi khó tìm. Nếu cần thay đổi dữ liệu, hãy dùng **State**.
2. **Hàm thuần túy (Pure Functions):** Các component React phải hành xử giống như các hàm thuần túy đối với props—luôn trả về cùng một cấu trúc giao diện tương ứng với cùng một giá trị props đầu vào.

---

## 🧠 Kiểm tra kiến thức (Chuẩn bị phỏng vấn)

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Props. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Sự khác biệt chính giữa Props và State là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - **Props** là các tham số cấu hình được truyền từ cha xuống con. Chúng là **bất biến** (chỉ đọc) bên trong component nhận.
  - **State** là bộ nhớ dữ liệu nội bộ, riêng tư của component. Nó **có thể thay đổi** trực tiếp bên trong component để kích hoạt giao diện render lại.
</details>

### 2. Prop `children` trong React là gì? Làm thế nào để truyền nó vào một component?
<details>
  <summary><b>Reveal Answer</b></summary>

  Prop `children` là một thuộc tính có sẵn cho phép bạn truyền các nội dung lồng ghép (thẻ HTML, chữ hoặc các component khác) vào trong một component khác. Nó được truyền bằng cách đặt các nội dung đó ở giữa thẻ mở và thẻ đóng của component: `<MyComponent> Nội dung lồng ghép </MyComponent>`.
</details>

### 3. Component con có thể sửa đổi prop nó nhận được không? Thuật ngữ kỹ thuật cho quy tắc này là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Không. Props là bất biến (immutable). React áp dụng nguyên lý **luồng dữ liệu một chiều** (unidirectional data flow - dữ liệu đi từ trên xuống dưới, không đi ngược lại hay đi ngang), và các component phải là các **hàm thuần túy** (pure functions) không làm thay đổi đầu vào của chúng.
</details>

### 4. Có gì khác nhau khi bạn viết `<MyComponent count="5" />` so với `<MyComponent count={5} />`?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `count="5"` truyền giá trị đi dưới dạng một **Chuỗi (String)**.
  - `count={5}` truyền giá trị đi dưới dạng một **Số (Number)** (bằng cách sử dụng cặp ngoặc nhọn để viết biểu thức JavaScript).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Component Person
1. Tạo một component `Person.jsx` bên trong `src/components/`.
2. Component này cần nhận các prop là `name` và `age`.
3. Hiển thị `name` trong thẻ `<h2>` và `age` trong thẻ `<p>`.
4. Render nó bên trong `App.jsx` và truyền vào tên cùng tuổi của bạn.

### 🛠️ Bài tập 2: Component Product
1. Tạo một component `Product.jsx` bên trong `src/components/`.
2. Component này cần nhận các prop là `name` và `price`.
3. Hiển thị tên sản phẩm trong một thẻ `<h2>` và giá đã định dạng dạng `$Price` trong thẻ `<p>`.

### 🛠️ Bài tập 3: Cấu trúc bọc ngoài (Composition Wrapper)
1. Tạo một component `Card.jsx` bên trong `src/components/`.
2. Giải nén prop `children` và render nó bên trong một thẻ `div` có CSS styling (ví dụ: padding, border, bóng mờ - shadow).
3. Mở file `App.jsx` và sử dụng `<Card>` để bao quanh component `<Person>` của bạn.
4. Sử dụng một thẻ `<Card>` khác để bao quanh component `<Product>`.
5. Xác minh trên trình duyệt xem cả hai phần tử trên đã được hiển thị gọn gàng trong các khung viền đẹp mắt chưa!
