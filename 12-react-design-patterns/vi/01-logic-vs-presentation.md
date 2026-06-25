# Mô hình thiết kế: Logic và Hiển thị & HOCs 📐

Các mô hình thiết kế (design patterns) trong React đại diện cho các giải pháp tiêu chuẩn của ngành dành cho những thách thức lập trình lặp đi lặp lại. Trong bài học này, chúng ta đề cập đến việc tách logic nghiệp vụ khỏi bố cục giao diện (**Mô hình Container-Presenter**) và tạo ra các **Higher-Order Components (HOCs)** để chia sẻ các lớp bao bọc hành vi.

---

## 📖 Khái niệm & Tổng quan

Design patterns là những giải pháp phổ biến và best practices được sử dụng để cấu trúc code sao cho nó trở nên **dễ bảo trì (maintainable)**, **tái sử dụng được (reusable)** và **dễ mở rộng (scalable)**. Bản thân React là một thư viện UI tập trung vào việc xây dựng các component tái sử dụng — design patterns mang đến cho chúng ta những chiến lược để tổ chức các component đó (cùng với logic bên trong chúng) nhằm thúc đẩy tính nhất quán trong một codebase lớn.

Ý tưởng lớn nhất đằng sau bài học hôm nay là **Phân tách các mối quan tâm (Separation of Concerns)**: giữ cho phần code *quyết định điều gì xảy ra* tách biệt khỏi phần code *quyết định nó trông như thế nào*. Một khi bạn thấm nhuần điều này, bạn sẽ ngừng viết những component dài 300 dòng vừa fetch dữ liệu, biến đổi nó, quản lý state, VÀ render markup tất cả trong một chỗ.

> [!NOTE]
> **Separation of Concerns** là nguyên tắc mà mỗi module nên có một trách nhiệm được định nghĩa rõ ràng duy nhất. Trong React điều này thường có nghĩa là tách một component thành một **Container** (logic: state, fetch dữ liệu, side effects) và một **Presenter** (UI: markup và styling). Khi các trách nhiệm được tách biệt, bạn có thể thay đổi *cách một thứ trông như thế nào* mà không gây rủi ro cho *cách nó hoạt động*, và ngược lại.

> [!TIP]
> Theo quy ước, mỗi Higher-Order Component được đặt tên với tiền tố **`with`** — `withLoading`, `withAuth`, `withRouter`. Tiền tố này ngay lập tức báo hiệu cho các developer khác rằng "đây là một hàm bao bọc một component và trả về một component đã được nâng cấp," chứ không phải một component thông thường mà bạn render trực tiếp bằng `<Tag />`.

### 🌍 Một phép ẩn dụ thực tế

Hãy nghĩ về một **nhà hàng**. **Nhà bếp** là *Container*: nó tìm nguồn nguyên liệu (fetch dữ liệu), tuân theo công thức (logic nghiệp vụ), và xử lý tất cả những công việc rối rắm phía sau hậu trường. **Đĩa thức ăn bày ra cho khách hàng** là *Presenter*: nó chỉ quan tâm đến việc món ăn trông như thế nào và được sắp xếp ra sao. Người phục vụ mang món ăn đã hoàn thành ra (truyền props xuống).

Nhà bếp không bao giờ quyết định màu của đĩa, và đĩa cũng không bao giờ quyết định cách nấu — nhưng cùng nhau chúng phục vụ bữa ăn. Bạn có thể thiết kế lại cách bày biện (thay đổi UI) mà không cần đào tạo lại đầu bếp (logic), và đầu bếp có thể đổi nhà cung cấp (thay đổi nguồn dữ liệu) mà khách hàng hoàn toàn không nhận ra chiếc đĩa đã thay đổi.

---

## ⚡ 1. Logic và Hiển thị (Mô hình Container-Presenter)

Một trong những khái niệm quan trọng nhất trong kỹ thuật phần mềm sạch là **Separation of Concerns**. Chúng ta chia các component thành hai loại:

### A. Presentational Components (Lớp UI)
* **Chúng làm gì**: Quyết định *cách* mọi thứ trông như thế nào.
* **Đặc điểm**: Chúng không quản lý state (ngoại trừ các state UI cục bộ như cờ hover), không fetch dữ liệu API, và nhận toàn bộ giá trị cùng các callback hành động thông qua **props**. Chúng thuần khiết (pure) và có khả năng tái sử dụng cao.

### B. Container Components (Lớp Logic)
* **Chúng làm gì**: Quyết định *cách* mọi thứ hoạt động.
* **Đặc điểm**: Chúng quản lý state, fetch dữ liệu API qua HTTP, xử lý side effects, và chứa logic nghiệp vụ. Chúng không render styling phức tạp; thay vào đó, chúng truyền state xuống dưới dạng props cho các Presentational component.

### 📊 So sánh nhanh

| Khía cạnh | Presentational (Presenter) | Container |
| :--- | :--- | :--- |
| **Mối quan tâm chính** | Mọi thứ trông như thế nào | Mọi thứ hoạt động như thế nào |
| **Quản lý dữ liệu ứng dụng?** | Không (chỉ props) | Có (state, fetch) |
| **State UI cục bộ?** | Đôi khi (hover, toggle) | Hiếm khi |
| **Side effects / gọi API** | Không bao giờ | Có |
| **Khả năng tái sử dụng** | Rất cao | Thấp (gắn với một tính năng) |
| **Dễ unit test?** | Rất dễ (thuần khiết, dựa trên prop) | Khó hơn (cần mock) |

### 🗺️ Luồng dữ liệu

```text
        ┌─────────────────────────────┐
        │   Container (Logic Layer)   │
        │  • useState / useEffect     │
        │  • fetch() over HTTP        │
        │  • event handlers           │
        └──────────────┬──────────────┘
                       │  props (data + callbacks) flow DOWN
                       ▼
        ┌─────────────────────────────┐
        │  Presenter (UI Layer)       │
        │  • renders HTML & styles    │
        │  • calls callbacks on click │
        └─────────────────────────────┘
```

### Ví dụ mã nguồn: Triển khai Container-Presenter

#### 1. Presentational Component (`UserListUI.jsx`)
```jsx
// Pure Presentational Component: focus is 100% on rendering HTML & styles
export const UserListUI = ({ users, onSelectUser }) => {
  return (
    <div style={styles.card}>
      <h3>Active User Accounts</h3>
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

#### 2. Container Component (`UserListContainer.jsx`)
```jsx
import { useState, useEffect } from 'react';
import { UserListUI } from './UserListUI';

// Container Component: handles all state and side effects, rendering zero HTML layout
export const UserListContainer = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users?_limit=4")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleSelectUser = (name) => {
    alert(`Selected user: ${name}`);
  };

  // The container renders NO layout of its own — it only wires data into the presenter
  return <UserListUI users={users} onSelectUser={handleSelectUser} />;
};
```

> [!WARNING]
> Một presentational component không bao giờ nên tự mình đi fetch dữ liệu của riêng nó. Khoảnh khắc một component UI "ngốc nghếch" bắt đầu gọi `fetch()` hoặc sở hữu state nghiệp vụ, nó không còn tái sử dụng được nữa — bạn không còn có thể đặt nó vào Storybook, một bài test, hay một màn hình khác mà không kéo theo cả phần network. Hãy giữ phần network trong container.

---

## ⚡ 2. Higher-Order Components (HOCs)

Một **Higher-Order Component** là một mô hình lập trình hàm trong đó một hàm nhận một component làm tham số và trả về một component hoàn toàn mới được nâng cấp với các thuộc tính hoặc logic bổ sung.

Tên các hàm HOC theo quy ước được đặt tiền tố **`with`** (ví dụ: `withLoading`, `withAuth`):

```jsx
import React from 'react';

// Create a generic Loading HOC
export function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading, please wait...</p>;
    }
    // Forward remaining props to the wrapped component
    return <WrappedComponent {...props} />;
  };
}
```

### Sử dụng HOC:
```jsx
import { UserListUI } from './UserListUI';
import { withLoading } from './withLoading';

// Enhance the UI component with loading capabilities
const UserListWithLoading = withLoading(UserListUI);

// Usage in parent
// <UserListWithLoading isLoading={true} users={[]} onSelectUser={...} />
```

> [!NOTE]
> Lưu ý rằng HOC **tiêu thụ** prop `isLoading` (nó destructure prop này ra) nhưng **chuyển tiếp** mọi prop khác qua `{...props}`. Đây chính là cốt lõi của một HOC: chặn lấy các prop bạn quan tâm, để mọi thứ còn lại đi thẳng xuống component được bao bọc mà không bị động chạm.

---

## 🚀 3. So sánh HOCs và Custom Hooks

Mặc dù HOC phổ biến trong các codebase cũ, React hiện đại nhìn chung ưu tiên **Custom Hooks** để chia sẻ code:

| Tiêu chí | Higher-Order Components (HOCs) | Custom Hooks (`useHooks`) |
| :--- | :--- | :--- |
| **Mã dư thừa (Boilerplate)** | Nhiều. Đòi hỏi các hàm lồng nhau và các wrapper chuyển tiếp prop. | Ít. Chỉ đơn giản là một lời gọi hook trợ giúp tiêu chuẩn. |
| **Xung đột Prop** | Có rủi ro. Hai HOC khác nhau có thể vô tình ghi đè cùng một tên prop. | Không. Các biến trả về từ hook có tên riêng biệt. |
| **Độ lồng Component** | Tạo ra "Wrapper Hell" trong cây React DevTools. | Cây phẳng. Không tạo thêm bất kỳ wrapper div/component nào. |
| **Hỗ trợ TypeScript** | Phức tạp. Đòi hỏi định kiểu các generic bao bọc. | Đơn giản và rất trực quan. |

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về những design patterns này. Nhấp **Reveal Answer** để xác nhận.

### 1. Ưu điểm chính của mô hình thiết kế Container-Presenter là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó thúc đẩy **Separation of Concerns**. Bằng cách tách biệt các style hiển thị UI khỏi việc fetch dữ liệu và các thao tác logic, các component trở nên đơn giản hơn, dễ chỉnh sửa hơn, có khả năng tái sử dụng cao (ví dụ, bạn có thể thay đổi bố cục thẻ UI mà không cần động đến logic fetch dữ liệu), và dễ unit test hơn rất nhiều.
</details>

### 2. Các Presentational component có được giữ biến state không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Các presentational component có thể quản lý state UI cục bộ (như chỉ số hover đang active, cờ bật/tắt hiển thị menu thả xuống, hoặc cờ trạng thái mở của accordion). Tuy nhiên, chúng không nên quản lý state dữ liệu nghiệp vụ của ứng dụng (như thông tin đăng nhập của người dùng hay danh sách giỏ hàng đã fetch).
</details>

### 3. "Chuyển tiếp props" (forward props) bên trong một Higher-Order Component nghĩa là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các HOC nằm ở vị trí wrapper trung gian giữa component cha và component con. Bất kỳ thuộc tính nào được cha truyền cho component đã nâng cấp (ví dụ: `<EnhancedComponent title="Hello" />`) phải được truyền xuống một cách tường minh cho component con được bao bọc bằng spread operator: `<WrappedComponent {...props} />`, nếu không component con sẽ thiếu các tham số đầu vào.
</details>

### 4. Tại sao việc bao bọc nhiều HOC lại với nhau dẫn đến "Wrapper Hell"?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mỗi HOC trả về một component wrapper mới. Nếu bạn kết hợp nhiều phần nâng cấp (ví dụ `withAuth(withRouter(withLoading(MyComponent)))`), nó lồng bốn lớp div/wrapper rỗng vào trong React DOM. Điều này làm phình to việc sử dụng bộ nhớ và khiến việc kiểm tra (inspect) các component trong React DevTools trở nên cực kỳ khó chịu.
</details>

### 5. Tại sao Custom Hooks thường thay thế HOCs trong các codebase React hiện đại?
<details>
  <summary><b>Reveal Answer</b></summary>

  Custom Hooks giải quyết bài toán chia sẻ code mà không cần bao bọc các component. Chúng cho phép các component chia sẻ các hành vi có state một cách phẳng trong code, loại bỏ các node wrapper lồng nhau, ngăn xung đột namespace của prop, và dễ định kiểu với TypeScript hơn nhiều.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của bạn:

### 🛠️ Bài tập 1: Xây dựng một HOC kiểm tra Đăng nhập (Auth Checker)
1. Tạo một tệp `withAuth.tsx` (sử dụng đuôi `.tsx`).
2. Tạo một hàm HOC `withAuth(WrappedComponent)`.
3. HOC nên kiểm tra một prop boolean `isAuthenticated`:
   - Nếu `isAuthenticated` là `false`, render một cảnh báo từ chối truy cập: `<h2 style={{ color: "red" }}>Access Denied. Please log in!</h2>`.
   - Nếu `true`, render `WrappedComponent` và chuyển tiếp tất cả props gốc.
4. Nâng cấp component `UserListUI` của bạn bằng HOC này: `const SecureList = withAuth(UserListUI)`.
5. Test việc render nó trong `App.tsx` bằng cách truyền cả `isAuthenticated={true}` và `isAuthenticated={false}` để xác minh các kiểm soát ranh giới.

<details>
  <summary><b>Reveal a Starting Point</b></summary>

```tsx
// withAuth.tsx
import React from "react";

// Generic HOC: gate any component behind an authentication flag
export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  // The returned component intercepts `isAuthenticated`, forwards the rest
  return function WithAuthComponent({ isAuthenticated, ...props }: P & { isAuthenticated: boolean }) {
    if (!isAuthenticated) {
      return <h2 style={{ color: "red" }}>Access Denied. Please log in!</h2>;
    }
    // Forward every remaining prop straight to the wrapped component
    return <WrappedComponent {...(props as P)} />;
  };
}
```
</details>

---

### 🛠️ Bài tập 2: Tái cấu trúc một "God Component" thành Container + Presenter
Bạn được cho một component cồng kềnh duy nhất vừa fetch các bài post VÀ render chúng. Hãy tách nó ra.

1. Tạo `PostListContainer.jsx`. Chuyển TẤT CẢ những thứ sau vào trong nó:
   - Một state `posts` thông qua `useState([])`.
   - Một `useEffect` fetch `https://jsonplaceholder.typicode.com/posts?_limit=5`.
   - Một callback `handleSelect(id)` thực hiện `alert` id của bài post đã chọn.
2. Tạo `PostListUI.jsx` **thuần túy là presentational**:
   - Nó nhận `posts` và `onSelect` chỉ qua props.
   - Nó render một `<ul>` gồm các tiêu đề bài post và gọi `onSelect(post.id)` khi click.
   - Nó **không** chứa `useState`, `useEffect`, hay `fetch`.
3. Kết nối chúng lại với nhau sao cho container render `<PostListUI posts={posts} onSelect={handleSelect} />`.
4. **Xác minh sự phân tách:** tạm thời render `<PostListUI posts={[{ id: 1, title: "Fake post" }]} onSelect={() => {}} />` trực tiếp với dữ liệu hard-code. Nếu UI hiển thị bài post giả của bạn mà không có lời gọi network nào, thì presenter của bạn đã được tách rời (decoupled) đúng cách.

<details>
  <summary><b>Reveal a Starting Point</b></summary>

```jsx
// PostListUI.jsx — pure presenter, no logic
export const PostListUI = ({ posts, onSelect }) => (
  <ul>
    {posts.map((post) => (
      <li key={post.id} onClick={() => onSelect(post.id)} style={{ cursor: "pointer" }}>
        {post.title}
      </li>
    ))}
  </ul>
);

// PostListContainer.jsx — all logic lives here
import { useState, useEffect } from "react";
import { PostListUI } from "./PostListUI";

export const PostListContainer = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=5")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  const handleSelect = (id) => alert(`Selected post id: ${id}`);

  return <PostListUI posts={posts} onSelect={handleSelect} />;
};
```
</details>
