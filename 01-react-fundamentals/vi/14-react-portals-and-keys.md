# React Portals và các Khái niệm Nâng cao về Key 🌲

Để kết thúc hành trình tìm hiểu phần React Fundamentals, chúng ta sẽ khám phá hai khái niệm render nâng cao: **React Portals** (render các phần tử ra ngoài node DOM gốc) và **Advanced Keys** (sử dụng prop `key` để reset state của component).

---

## ⚡ 1. React Portals (`createPortal`)

Thông thường, mọi component trong ứng dụng React đều được lồng bên trong phần tử `#root` trong tệp `index.html`. Tuy nhiên, đối với một số component UI như modal, popup, và tooltip, việc đặt chúng lồng sâu trong cây DOM có thể gây ra các vấn đề về CSS styling (như xung đột `z-index` hoặc thuộc tính `overflow: hidden` cắt mất các phần tử).

React Portals giải quyết vấn đề này bằng cách cho phép bạn render một component vào một **node DOM hoàn toàn khác** trong khi nó vẫn giữ nguyên vị trí trong cây component React.

### Cách sử dụng Portals
1. Tạo một phần tử container bên trong tệp `index.html`:
```html
<body>
  <div id="root"></div>
  <div id="popup-content"></div> <!-- Our portal target -->
</body>
```

2. Sử dụng `createPortal` từ `react-dom` bên trong component của bạn:
```jsx
import { createPortal } from 'react-dom';

const PortalPopup = () => {
  return createPortal(
    <div className="popup">
      <p>I am rendered outside the #root div! 🛸</p>
    </div>,
    document.getElementById("popup-content")
  );
};
```
*Lưu ý: Hãy đảm bảo import `createPortal` từ `'react-dom'`, chứ không phải từ `'react'`!*

---

## 🔑 2. Advanced Keys: Ép buộc Reset State

Trước đây chúng ta đã học rằng React sử dụng prop `key` để định danh các item trong list. Tuy nhiên, key cũng có thể được sử dụng trên các component hoặc phần tử đơn lẻ để **ép buộc React hủy bỏ và tạo lại chúng**, từ đó reset state cục bộ của chúng.

### Vấn đề: Trùng lặp State của phần tử DOM
Nếu bạn chuyển đổi qua lại giữa hai form hoặc các phần tử trông tương tự nhau, React sẽ cố gắng tối ưu hóa việc render bằng cách tái sử dụng cùng một phần tử DOM. Điều này có nghĩa là văn bản đã gõ vào input ở màn hình này có thể vẫn giữ nguyên khi chuyển sang màn hình khác:

```jsx
// Without keys, typed text persists when switching modes!
{isDark ? (
  <input type="text" placeholder="Dark Mode input" />
) : (
  <input type="text" placeholder="Light Mode input" />
)}
```

### Giải pháp: Sử dụng `key` để ép buộc Reset
Bằng cách thêm một prop `key` duy nhất gắn liền với state, React sẽ nhận diện chúng là các phần tử riêng biệt. Khi key thay đổi, React sẽ unmount input cũ (xóa sạch văn bản của nó) và mount một input hoàn toàn mới:

```jsx
// With keys, the input field is reset when mode changes!
{isDark ? (
  <input key="dark" type="text" placeholder="Dark Mode input" />
) : (
  <input key="light" type="text" placeholder="Light Mode input" />
)}
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Portals & Keys. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Bạn import `createPortal` từ đâu?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn import nó từ `'react-dom'` (hoặc `'react-dom/client'`), không phải `'react'`.
</details>

### 2. Khi nào bạn nên sử dụng một React Portal?
<details>
  <summary><b>Reveal Answer</b></summary>

  Portals được sử dụng tốt nhất cho các component cần phá vỡ các ràng buộc styling layout của phần tử cha, chẳng hạn như modal dialog, tooltip, toast notification, và dropdown menu.
</details>

### 3. React hành xử như thế nào khi prop `key` của một component đơn lẻ thay đổi?
<details>
  <summary><b>Reveal Answer</b></summary>

  React sẽ hoàn toàn hủy bỏ (unmount) instance cũ của component (làm mất state cục bộ của nó) và mount một instance mới hoàn toàn từ đầu.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì đã học vào dự án `first-react-app` của bạn:

### 🛠️ Bài tập 1: Portal Overlay
1. Thêm một `<div id="modal-root"></div>` vào trong tệp `index.html` của bạn.
2. Tạo một component tên là `ModalPortal.jsx` bên trong `src/components/`.
3. Bên trong đó, render một card đơn giản sử dụng `createPortal` để đưa nội dung ra `#modal-root`.
4. Style card với fixed positioning (`position: fixed`) để tạo lớp phủ toàn màn hình.
5. Render `<ModalPortal />` trong `App.jsx` và inspect cây DOM (F12) để xác nhận nó nằm dưới `#modal-root`.
