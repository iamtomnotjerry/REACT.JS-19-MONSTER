# Dự án 7 & 8: Slide trình chiếu (Slider) & Khung thu gọn (Accordion) 🚀

Trong bài học này, chúng ta sẽ xây dựng ứng dụng **Slide đánh giá (Testimonials Slider)** và khung thu gọn thông tin **Accordion**. Các dự án này rèn luyện kỹ năng quản lý chỉ số index của mảng, cấu trúc component kết hợp (Parent-Child patterns), chuyển giao trạng thái (state lifting) và điều khiển ẩn/hiện bố cục.

---

## 🎠 Dự án 7: Slide trình chiếu nhận xét (Testimonials Slider)

Ứng dụng cho phép duyệt qua danh sách các thẻ nhận xét của khách hàng bằng các nút điều khiển "Tiếp theo" (Next) và "Quay lại" (Back).

### Các khái niệm chính được thực hành:
* Quản lý trạng thái chỉ số `index` để chỉ hiển thị một phần tử tại một thời điểm.
* Phép toán chia lấy dư `%` (modulo) để tạo vòng lặp mảng:
  - **Tiếp theo**: `(index + 1) % length`
  - **Quay lại**: `(index - 1 + length) % length`

### Hướng dẫn triển khai từng bước (`Testimonials.jsx`)

Tạo tệp component tại `src/components/Testimonials.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const Testimonials = () => {
  const [index, setIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      quote: "React 19 thực sự thay đổi cuộc chơi! Bộ compiler tự động hóa việc memoize vô cùng tối ưu.",
      author: "Sarah Connor",
      role: "Kiến trúc sư phần mềm chính"
    },
    {
      id: 2,
      quote: "Xây dựng custom hook chưa bao giờ trực quan thế này. Mã nguồn của tôi sạch và dễ tái sử dụng hơn.",
      author: "Alex Mercer",
      role: "Kỹ sư Frontend cấp cao"
    },
    {
      id: 3,
      quote: "Quản lý state bằng Zustand và Redux Toolkit trở nên rất đơn giản sau khi hoàn thành khóa học này.",
      author: "Elena Rostova",
      role: "Lập trình viên Fullstack"
    }
  ];

  const handleNext = () => {
    // Quay lại 0 khi vượt quá phần tử cuối cùng
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    // Quay lại phần tử cuối cùng khi giảm xuống dưới 0
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[index];

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Dự án 7: Slide đánh giá</h2>
      <div style={styles.quoteBox}>
        <p style={styles.quote}>"{current.quote}"</p>
        <h4 style={styles.author}>— {current.author}</h4>
        <span style={styles.role}>{current.role}</span>
      </div>
      <div style={styles.nav}>
        <button style={styles.btn} onClick={handlePrev}>⟵ Quay lại</button>
        <span style={styles.counter}>{index + 1} / {testimonials.length}</span>
        <button style={styles.btn} onClick={handleNext}>Tiếp theo ⟶</button>
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

## 🗂️ Dự án 8: Khung câu hỏi thu gọn (Accordion)

Accordion là giao diện gồm các tiêu đề câu hỏi, khi nhấp vào sẽ mở rộng để hiển thị câu trả lời bên dưới. Chúng ta có 2 cách thiết kế:
1. **Multi-Open Accordion**: Mỗi mục tự quản lý trạng thái đóng/mở của mình. Nhiều mục có thể mở cùng lúc.
2. **Single-Open Accordion**: ID của mục đang mở được lưu trữ ở component Cha. Mở một mục mới sẽ tự động đóng toàn bộ các mục khác.

### Hướng dẫn triển khai kiểu Multi-Open (`Accordion.jsx`)

Tạo tệp component tại `src/components/Accordion.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

// Component con - tự quản lý trạng thái đóng/mở độc lập
const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={accStyles.item}>
      <div style={accStyles.header} onClick={() => setIsOpen(!isOpen)}>
        <h3 style={accStyles.question}>{question}</h3>
        <span style={accStyles.icon}>{isOpen ? "▼" : "►"}</span>
      </div>
      
      {/* Hiển thị chiều cao động bằng CSS transition */}
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

// Component cha
export const Accordion = () => {
  return (
    <div style={accStyles.container}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Dự án 8: Khung Accordion</h2>
      <AccordionItem 
        question="1. DOM ảo (Virtual DOM) trong React là gì?" 
        answer="Là bản sao gọn nhẹ của DOM thực tế trong bộ nhớ, dùng để React tính toán so sánh các điểm khác biệt (diffing) và thực hiện các bản cập nhật nhanh nhất lên trình duyệt." 
      />
      <AccordionItem 
        question="2. Props khác State như thế nào?" 
        answer="Props là dữ liệu đầu vào truyền từ component cha xuống con (chỉ đọc), còn state là trạng thái riêng tư do component tự quản lý bên trong." 
      />
      <AccordionItem 
        question="3. Khi nào bạn nên sử dụng useEffect?" 
        answer="Khi thực hiện các tác vụ tương tác với thế giới bên ngoài (side effects) như gọi API mạng, thao tác DOM thủ công hoặc cài đặt bộ hẹn giờ." 
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

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Trong phần Slider, thuật toán chia lấy dư `(index + 1) % length` khi click "Next" hoạt động ra sao?
<details>
  <summary><b>Reveal Answer</b></summary>

  Phép toán chia lấy dư trả về số dư của phép chia. Đối với danh sách có 3 phần tử (length = 3):
  - Khi `index = 0`, `(0 + 1) % 3` trả về dư `1`.
  - Khi `index = 1`, `(1 + 1) % 3` trả về dư `2`.
  - Khi `index = 2` (phần tử cuối), `(2 + 1) % 3` tức 3 chia 3 dư `0`. Chỉ số index quay về `0` (phần tử đầu tiên), giúp slide quay vòng lặp.
</details>

### 2. Một accordion kiểu Single-Open khác kiểu Multi-Open thế nào về cấu trúc?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Giao diện **multi-open**: Mỗi component con tự quản lý state `isOpen` riêng biệt nên chúng hoạt động hoàn toàn độc lập với nhau.
  - Giao diện **single-open**: Component cha quản lý state `activeId` của mục đang mở. Component cha truyền prop xuống con: `isOpen={activeId === itemId}` kèm theo một hàm callback để cập nhật lại ID đó. Trạng thái được **nâng lên (lifted up)** component cha.
</details>

### 3. Tại sao chúng ta cần định nghĩa chiều cao giới hạn `maxHeight` khi làm hiệu ứng trượt Accordion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trình duyệt không thể tính toán chuyển động CSS transition trực tiếp từ chiều cao `0px` lên `auto`. Việc đặt giới hạn chiều cao `maxHeight: 150px` hoặc sử dụng tỷ lệ scale giúp trình duyệt tính toán được các khung hình trung gian để tạo hiệu ứng mở rộng mượt mà.
</details>

### 4. Kết quả của phép tính `(index - 1 + length) % length` khi index bằng 0 là bao nhiêu, tại sao cần cộng thêm `length`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Với mảng có chiều dài 3, đi lùi từ index 0:
  `(-1 + 3) % 3 = 2 % 3 = 2`.
  Cộng thêm `length` giúp số bị chia luôn là số dương. Trong JavaScript, phép chia lấy dư số âm sẽ trả về kết quả âm (ví dụ: `-1 % 3 = -1`), điều này sẽ gây ra lỗi truy cập ngoài phạm vi index của mảng.
</details>

### 5. Tại sao cần thiết lập thuộc tính CSS `userSelect: "none"` trên tiêu đề của accordion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Vì khi người dùng nhấp đúp chuột nhanh để đóng mở accordion, trình duyệt sẽ hiểu nhầm và bôi đen (select) văn bản tiêu đề đó. Thuộc tính `userSelect: "none"` ngăn cản việc bôi đen này, giúp nút bấm hoạt động tự nhiên như nút của hệ thống.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Tự động chạy Slide (Autoplay Carousel)
1. Mở file `Testimonials.jsx`.
2. Thiết lập một `useEffect` để chạy bộ đếm thời gian tự động gọi hàm `handleNext()` sau mỗi 4 giây.
3. **LƯU Ý QUAN TRỌNG**: Trả về hàm dọn dẹp (cleanup) gọi `clearInterval` để tránh chồng chất các bộ đếm thời gian khi người dùng click đổi slide thủ công hoặc tắt component.

### 🛠️ Bài tập 2: Chuyển đổi sang Accordion Single-Open
1. Sửa lại tệp `Accordion.jsx`.
2. Chuyển state đóng mở lên component cha: `const [activeId, setActiveId] = useState(null)`.
3. Truyền các props thích hợp xuống `AccordionItem`:
   - `isOpen={activeId === item.id}`
   - `onToggle={() => setActiveId(activeId === item.id ? null : item.id)}`
4. Kiểm tra để đảm bảo việc mở một accordion mới sẽ tự động thu gọn các mục khác.
