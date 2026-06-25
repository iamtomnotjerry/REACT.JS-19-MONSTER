# Dự án 7 & 8: Slider & Accordion 🚀

Trong bài học này, chúng ta sẽ xây dựng một **Testimonials Slider** (một carousel hiển thị các đánh giá của người dùng) và một **Accordion** có thể thu gọn. Các dự án này dạy về cách lập chỉ mục mảng (array indexing), kiến trúc component kết hợp (mô hình Parent-Child), nâng state (state lifting) và bố cục đóng/mở (toggling).

---

## 🎠 Dự án 7: Testimonials Slider

Một carousel điều hướng qua một mảng các thẻ đánh giá bằng các nút điều khiển "Next" và "Back".

### Các khái niệm chính được thực hành:
* Quản lý một state chỉ mục (`index`) để render từng phần tử một tại mỗi thời điểm.
* Phép toán chia lấy dư `%` (modulo) để tạo vòng lặp cho ranh giới chỉ mục:
  - **Next**: `(index + 1) % length`
  - **Prev**: `(index - 1 + length) % length`

### Hướng dẫn triển khai từng bước (`Testimonials.jsx`)

Tạo tệp `src/components/Testimonials.jsx` và chèn đoạn mã sau:

```jsx
import { useState } from 'react';

export const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "React 19 is absolutely game-changing! The compiler handles memoization perfectly.",
      author: "Sarah Connor",
      role: "Lead Software Architect"
    },
    {
      id: 2,
      quote: "Creating custom hooks has never been this intuitive. My code is cleaner and more reusable.",
      author: "Alex Mercer",
      role: "Senior Frontend Engineer"
    },
    {
      id: 3,
      quote: "State management using Zustand and Redux Toolkit is extremely simple after taking this course.",
      author: "Elena Rostova",
      role: "Fullstack Web Developer"
    }
  ];

  const handleNext = () => {
    // Loop back to 0 when passing the last element
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    // Loop back to the last element when passing 0
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index];

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Project 7: Testimonials Slider</h2>
      <div style={styles.quoteBox}>
        <p style={styles.quote}>"{current.quote}"</p>
        <h4 style={styles.author}>— {current.author}</h4>
        <span style={styles.role}>{current.role}</span>
      </div>
      <div style={styles.nav}>
        <button style={styles.btn} onClick={handlePrev}>⟵ Back</button>
        <span style={styles.counter}>{index + 1} / {testimonials.length}</span>
        <button style={styles.btn} onClick={handleNext}>Next ⟶</button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    backgroundColor: "#ffffff",
    maxWidth: "500px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "20px"
  },
  quoteBox: {
    minHeight: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  quote: {
    fontSize: "1.1rem",
    fontStyle: "italic",
    color: "#34495e",
    margin: "0 0 15px 0"
  },
  author: {
    margin: "0",
    color: "#2c3e50"
  },
  role: {
    fontSize: "0.85rem",
    color: "#7f8c8d"
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  btn: {
    padding: "10px 15px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  counter: {
    color: "#7f8c8d",
    fontWeight: "bold"
  }
};
```

---

## 🗂️ Dự án 8: Accordion Component

Accordion chứa các tiêu đề (header) khi nhấp vào sẽ mở rộng để hiển thị câu trả lời. Chúng ta có thể tổ chức chúng theo hai cách:
1. **Multi-Open Accordion**: Mỗi mục tự quản lý state đóng/mở của riêng nó. Nhiều mục có thể mở cùng một lúc.
2. **Single-Open Accordion**: ID của mục đang hoạt động được lưu trong component cha. Mở một mục sẽ tự động đóng tất cả các mục khác.

### Hướng dẫn triển khai từng bước kiểu Multi-Open (`Accordion.jsx`)

Tạo tệp `src/components/Accordion.jsx` và chèn đoạn mã sau:

```jsx
import { useState } from 'react';

// Child Component - manages its own independent state
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={accStyles.item}>
      <div style={accStyles.header} onClick={() => setIsOpen(!isOpen)}>
        <h3 style={accStyles.question}>{question}</h3>
        <span style={accStyles.icon}>{isOpen ? "▼" : "►"}</span>
      </div>
      
      {/* Smooth CSS height rendering simulation */}
      <div 
        style={{
          ...accStyles.content,
          maxHeight: isOpen ? "150px" : "0px",
          padding: isOpen ? "15px" : "0px 15px",
          opacity: isOpen ? 1 : 0
        }}
      >
        <p style={{ margin: 0 }}>{answer}</p>
      </div>
    </div>
  );
};

// Parent Component
export const Accordion = () => {
  return (
    <div style={accStyles.container}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Project 8: Accordion</h2>
      <AccordionItem 
        question="1. What is the React Virtual DOM?" 
        answer="A lightweight, in-memory copy of the browser DOM that React uses to run diffing checks and execute highly performant visual updates." 
      />
      <AccordionItem 
        question="2. How do props differ from state?" 
        answer="Props are inputs passed from parent components to child components (read-only), while state is private data managed internally by the component itself." 
      />
      <AccordionItem 
        question="3. When should you use useEffect?" 
        answer="When performing operations that reach outside the React component render loop, such as network requests, manual DOM mutations, or timers." 
      />
    </div>
  );
};

const accStyles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto",
    fontFamily: "Arial, sans-serif"
  },
  item: {
    border: "1px solid #dfe6e9",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: "15px 20px",
    cursor: "pointer",
    userSelect: "none"
  },
  question: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#2c3e50"
  },
  icon: {
    fontSize: "1.2rem",
    color: "#7f8c8d"
  },
  content: {
    backgroundColor: "#fff",
    color: "#2d3436",
    overflow: "hidden",
    transition: "all 0.3s ease-in-out"
  }
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về các dự án nhập môn này. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Trong một Slider, phép toán chia lấy dư `(index + 1) % length` hoạt động như thế nào khi nhấp "Next"?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phép toán chia lấy dư trả về phần dư của phép chia. Với một danh sách gồm 3 phần tử (length = 3):
  - Khi `index = 0`, `(0 + 1) % 3` trả về `1`.
  - Khi `index = 1`, `(1 + 1) % 3` trả về `2`.
  - Khi `index = 2` (phần tử cuối cùng), `(2 + 1) % 3` (3 chia 3) trả về `0` (dư 0), đưa slider quay vòng về phần tử đầu tiên.
</details>

### 2. Về mặt kiến trúc, một accordion single-open khác với một accordion multi-open như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Trong một accordion **multi-open**, mỗi mục con có state `isOpen` cục bộ của riêng nó, khiến chúng độc lập với nhau.
  - Trong một accordion **single-open**, component cha quản lý một state `activeId`. Component cha truyền xuống một giá trị boolean (`isOpen={activeId === itemId}`) và một handler để cập nhật ID. State được **nâng lên (lifted up)** component cha.
</details>

### 3. Mối nguy hiểm của việc không chỉ định giới hạn chiều cao hay `maxHeight` khi tạo hiệu ứng mở rộng accordion là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn không thể tạo hiệu ứng chiều cao trực tiếp từ `0px` đến `auto` bằng các CSS transition tiêu chuẩn. Việc tạo hiệu ứng đến `maxHeight: 150px` hoặc sử dụng các phép biến đổi scale cho phép engine trình duyệt tính toán các khung hình chuyển tiếp, mang lại hiệu ứng mở rộng mượt mà.
</details>

### 4. Giá trị của `(index - 1 + length) % length` là bao nhiêu khi index bằng 0, và tại sao lại cộng thêm `+ length`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Với một danh sách có chiều dài 3, nếu chúng ta bắt đầu ở index 0 và đi lùi:
  `(-1 + 3) % 3 = 2 % 3 = 2`.
  Việc cộng thêm `length` đảm bảo số bị chia luôn dương. Trong JavaScript, phép chia lấy dư trên số âm cho ra kết quả âm (ví dụ `-1 % 3 = -1`), điều này sẽ gây ra lỗi truy cập index ngoài phạm vi (out-of-bounds).
</details>

### 5. Tại sao chúng ta đặt `userSelect: "none"` trên các tiêu đề accordion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì việc nhấp nhanh vào tiêu đề để mở rộng/thu gọn nó có thể khiến trình duyệt bôi đen/chọn (highlight/select) văn bản câu hỏi. Đặt `userSelect: "none"` ngăn việc bôi đen văn bản, khiến nút bấm có cảm giác như một widget desktop gốc (native).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Testimonial Carousel Tự động chạy (Autoplay)
1. Mở `Testimonials.jsx`.
2. Thiết lập một hook `useEffect` để chạy một interval timer gọi `handleNext()` sau mỗi 4 giây.
3. **QUAN TRỌNG**: Trả về một hàm cleanup bên trong effect để chạy `clearInterval`, nhằm tránh việc nhiều timer chồng chất lên nhau khi component được nhấp hoặc bị unmount.

### 🛠️ Bài tập 2: Chuyển đổi sang Accordion Single-Open
1. Tái cấu trúc (refactor) `Accordion.jsx`.
2. Chuyển việc quản lý state lên component cha: `const [activeId, setActiveId] = useState(null)`.
3. Truyền props xuống `AccordionItem`:
   - `isOpen={activeId === item.id}`
   - `onToggle={() => setActiveId(activeId === item.id ? null : item.id)}`
4. Xác nhận rằng việc mở một mục accordion sẽ thu gọn các mục đang hoạt động khác.
