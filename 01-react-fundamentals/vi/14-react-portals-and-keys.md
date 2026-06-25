# React Portals và các Khái niệm Nâng cao về Key 🌲

Để kết thúc hành trình tìm hiểu phần React Fundamentals, chúng ta sẽ khám phá hai khái niệm render nâng cao: **React Portals** (render các phần tử ra ngoài node DOM gốc) và **Advanced Keys** (sử dụng thuộc tính `key` để reset trạng thái component).

---

## ⚡ 1. React Portals (`createPortal`)

Thông thường, mọi component trong ứng dụng React đều được lồng bên trong phần tử `#root` trong tệp `index.html`. Tuy nhiên, đối với một số component UI như modal, popup, và tooltip, việc đặt chúng lồng sâu trong cây DOM có thể gây ra các vấn đề về kiểu dáng CSS (như xung đột `z-index` hoặc thuộc tính `overflow: hidden` của thẻ cha cắt mất phần tử con).

React Portals giải quyết vấn đề này bằng cách cho phép bạn render một component vào một **node DOM hoàn toàn khác** trong khi nó vẫn giữ nguyên vị trí phân cấp trong cây component React.

### Cách sử dụng Portals
1. Tạo một phần tử container bên trong tệp `index.html`:
```html
<body>
  <div id="root"></div>
  <div id="popup-content"></div> <!-- Điểm đích portal của chúng ta -->
</body>
```

2. Sử dụng hàm `createPortal` từ thư viện `react-dom` bên trong component của bạn:
```jsx
import { createPortal } from 'react-dom';

const PortalPopup = () => {
  return createPortal(
    <div className="popup">
      <p>Tôi được render bên ngoài thẻ div #root! 🛸</p>
    </div>,
    document.getElementById("popup-content")
  );
};
```
*Lưu ý: Hãy đảm bảo import `createPortal` từ `'react-dom'`, chứ không phải từ `'react'`!*

---

## 🔑 2. Cú pháp Key nâng cao: Ép buộc Reset State

Trước đây chúng ta đã học rằng React sử dụng thuộc tính `key` để định danh các phần tử trong danh sách. Tuy nhiên, thuộc tính `key` cũng có thể được sử dụng trên các component hoặc phần tử đơn lẻ để **ép buộc React hủy bỏ và tạo mới lại chúng**, từ đó reset toàn bộ state cục bộ của chúng.

### Vấn đề: Trùng lặp trạng thái phần tử DOM
Nếu bạn chuyển đổi qua lại giữa hai form nhập liệu hoặc các phần tử có cấu trúc tương tự nhau, React sẽ cố gắng tối ưu hóa việc render bằng cách tái sử dụng phần tử DOM hiện có. Điều này có nghĩa là nội dung bạn gõ vào ô input ở màn hình trước có thể vẫn giữ nguyên khi chuyển sang màn hình sau:

```jsx
// Không có keys, chữ đã gõ vẫn giữ nguyên khi chuyển đổi chế độ!
{isDark ? (
  <input type="text" placeholder="Ô nhập chế độ Tối" />
) : (
  <input type="text" placeholder="Ô nhập chế độ Sáng" />
)}
```

### Giải pháp: Sử dụng `key` để bắt buộc Reset
Bằng cách thêm thuộc tính `key` duy nhất gắn liền với state điều kiện, React sẽ nhận diện chúng là các phần tử hoàn toàn khác biệt. Khi key thay đổi, React sẽ hủy bỏ (unmount) ô input cũ (xóa sạch chữ đã gõ) và gắn vào (mount) một ô input mới hoàn toàn:

```jsx
// Có keys, ô nhập liệu sẽ được reset sạch sẽ khi chế độ thay đổi!
{isDark ? (
  <input key="dark" type="text" placeholder="Ô nhập chế độ Tối" />
) : (
  <input key="light" type="text" placeholder="Ô nhập chế độ Sáng" />
)}
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Portals & Keys. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Bạn import `createPortal` từ thư viện nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn import nó từ thư viện `'react-dom'` (hoặc `'react-dom/client'`), không phải `'react'`.
</details>

### 2. Khi nào bạn nên sử dụng React Portal?
<details>
  <summary><b>Reveal Answer</b></summary>

  Portals được sử dụng tốt nhất cho các component cần phá vỡ các giới hạn định dạng kiểu dáng của khối cha, chẳng hạn như hộp thoại modal, tooltip, thông báo toast, và menu dropdown.
</details>

### 3. React phản ứng như thế nào khi thuộc tính `key` của một component đơn lẻ thay đổi?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ hoàn toàn hủy bỏ (unmount) thực thể component cũ (làm mất toàn bộ state cục bộ của nó) và gắn vào (mount) một thực thể component mới hoàn toàn từ đầu.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Lớp phủ Portal
1. Thêm một thẻ `<div id="modal-root"></div>` vào trong tệp `index.html` của bạn.
2. Tạo một component tên là `ModalPortal.jsx` bên trong `src/components/`.
3. Bên trong đó, render một chiếc thẻ đơn giản sử dụng `createPortal` để đưa nội dung ra ngoài thẻ `#modal-root`.
4. Định dạng kiểu dáng CSS cho thẻ với thuộc tính fixed positioning (`position: fixed`) để tạo lớp phủ toàn màn hình.
5. Render `<ModalPortal />` bên trong tệp `App.jsx` và inspect cây DOM (F12) trên trình duyệt để kiểm tra xem nó có nằm dưới thẻ `#modal-root` hay không.
