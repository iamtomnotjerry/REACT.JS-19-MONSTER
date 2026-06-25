# Cử chỉ tương tác (Gestures) & Biến thể (Variants) trong Framer Motion ✨

Bài học này hướng dẫn về các **Cử chỉ tương tác (Gestures)** tích hợp sẵn của người dùng (hover, tap, drag) và **Variants** – phương pháp khai báo giúp tổ chức gọn gàng các thuộc tính hiệu ứng, làm sạch mã JSX, và điều phối các cụm hiệu ứng lồng nhau phức tạp (staggering).

---

## ⚡ 1. Cử chỉ tương tác của người dùng (Gestures)

Framer Motion tích hợp sẵn các thuộc tính lắng nghe cử chỉ để kích hoạt hiệu ứng ngay lập tức khi người dùng di chuột (hover), nhấn giữ (tap), hoặc kéo thả (drag):

```jsx
import { motion } from 'framer-motion';

export const InteractiveButton = () => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "#2980b9" }} // Kích hoạt khi di chuột
      whileTap={{ scale: 0.95 }}                               // Kích hoạt khi click
      style={styles.btn}
    >
      Nhấp chuột
    </motion.button>
  );
};
```

### Cử chỉ kéo thả (Drag Gestures)
Biến bất kỳ phần tử nào thành vật thể có thể kéo thả bằng cách thêm thuộc tính `drag`. Giới hạn phạm vi di chuyển bằng thuộc tính `dragConstraints`:

```jsx
export const DraggableCard = () => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -50, right: 150, top: -50, bottom: 50 }}
      dragElastic={0.1} // Lực cản đàn hồi khi kéo vượt quá giới hạn constraints
      style={styles.card}
    >
      Kéo tôi đi!
    </motion.div>
  );
};
```

---

## 🧩 2. Các biến thể hiệu ứng (Variants)

Khi hiệu ứng trở nên phức tạp, việc viết quá nhiều đối tượng state inline trực tiếp trong JSX sẽ khiến mã nguồn trở nên rối rắm. **Variants** giải quyết vấn đề này bằng cách tách các mốc thuộc tính hiệu ứng thành một đối tượng cấu hình từ điển gọn gàng.

```javascript
// 1. Khai báo đối tượng chứa các biến thể (variants)
const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};
```

Sau đó truyền đối tượng này vào component và gọi tên các key tương ứng dưới dạng chuỗi:

```jsx
<motion.div
  variants={listVariants}
  initial="hidden"
  animate="visible"
/>
```

---

## 🚀 3. Điều phối hiệu ứng lồng nhau (Staggering)

Variants mở ra một tính năng cực kỳ mạnh mẽ: component cha có thể tự động điều khiển tiến trình chạy hiệu ứng của các component con lồng bên dưới. Nếu component cha có thiết lập một variant (ví dụ `initial="hidden"` và `animate="visible"`), nó tự động truyền các key này xuống tất cả các component con kiểu motion trực thuộc.

Chúng ta sử dụng các **thuộc tính điều phối (Orchestration)** như `staggerChildren` để tạo độ trễ xuất hiện tuần tự giữa các phần tử con một cách tự động:

```jsx
import { motion } from 'framer-motion';

// Đối tượng Variants của thẻ Cha
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Độ trễ giữa mỗi phần tử con xuất hiện (tính bằng giây)
      delayChildren: 0.1    // Độ trễ ban đầu trước khi phần tử đầu tiên bắt đầu chạy
    }
  }
};

// Đối tượng Variants của thẻ Con
const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" } }
};

export const StaggeredList = () => {
  const items = ["Phần tử A", "Phần tử B", "Phần tử C"];

  return (
    // 1. Thẻ cha thiết lập các key đại diện: hidden & visible
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={styles.list}
    >
      {items.map((item, index) => (
        // 2. Thẻ con tự nhận và chạy các key hidden & visible tương ứng!
        <motion.li key={index} variants={itemVariants} style={styles.item}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
};

const styles = {
  list: { listStyleType: "none", padding: 0 },
  item: { padding: "10px", margin: "5px", backgroundColor: "#ecf0f1", borderRadius: "5px" }
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Variants giúp làm sạch mã nguồn JSX của bạn như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Variants tách biệt phần hiển thị giao diện (JSX) khỏi logic hiệu ứng bằng cách đưa toàn bộ thuộc tính cấu hình (initial, animate, transition) vào một đối tượng riêng biệt. Điều này giúp tệp JSX gọn gàng, tăng tính dễ đọc và cho phép tái sử dụng cấu hình hiệu ứng cho nhiều component khác nhau.
</details>

### 2. Cơ chế truyền variant từ cha xuống con (variant propagation) hoạt động thế nào trong Framer Motion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi một component cha `<motion>` được gán một key trạng thái hiệu ứng (ví dụ: `initial="hidden"`), nó sẽ tự động truyền chuỗi key đó xuống tất cả các component con kiểu motion trực thuộc. Nếu các component con có khai báo variants chứa key tương ứng (ví dụ: `hidden`), chúng sẽ tự động chạy hiệu ứng đó mà bạn không cần truyền thủ công.
</details>

### 3. Thuộc tính `staggerChildren` trong cấu hình transition có tác dụng gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `staggerChildren` là một thuộc tính điều phối (orchestration). Khi khai báo trong transition của component cha, nó sẽ tạo một khoảng thời gian trễ tự động (tính bằng giây) lần lượt giữa các hiệu ứng xuất hiện của các component con, tạo hiệu ứng chuyển động tuần tự cực kỳ cao cấp.
</details>

### 4. Thuộc tính `dragConstraints` dùng để giới hạn điều gì, và làm thế nào để khóa kéo thả chỉ theo một chiều duy nhất?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `dragConstraints` giới hạn khu vực kéo thả (bằng các thông số pixel giới hạn hoặc truyền một ref trỏ tới một thẻ div chứa bao bọc bên ngoài).
  - Để khóa kéo thả theo một chiều cố định, truyền giá trị chuỗi vào thuộc tính `drag`: `drag="x"` (chỉ kéo ngang) hoặc `drag="y"` (chỉ kéo dọc).
</details>

### 5. Thuộc tính `dragElastic` điều khiển hành vi nào của kéo thả?
<details>
  <summary><b>Reveal Answer</b></summary>

  `dragElastic` điều khiển độ cản đàn hồi (co giãn như dây chun) khi người dùng kéo vật thể vượt quá biên giới hạn của `dragConstraints`. Thiết lập bằng `0` sẽ tắt hoàn toàn tính năng đàn hồi, trong khi thiết lập bằng `1` cho phép kéo dãn tự do ra ngoài trước khi vật thể tự nảy quay trở lại vị trí biên.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Lưới thẻ nhân viên xuất hiện tuần tự (Staggered Profile Cards Grid)
1. Tạo một component `ProfileGrid.tsx` (sử dụng đuôi `.tsx`).
2. Thiết lập một lưới danh sách grid container có variants của cha điều phối độ trễ xuất hiện tuần tự (stagger delay) là `0.15` giây.
3. Render bốn thẻ card hiển thị thông tin nhân viên con. Mỗi thẻ card có hiệu ứng trượt xuất hiện từ dưới lên (`y: 50`), đồng thời có hiệu ứng phóng to nhẹ khi di chuột (`whileHover={{ scale: 1.03 }}`) và co nhẹ khi bấm (`whileTap={{ scale: 0.98 }}`).
4. Kiểm tra để đảm bảo các thẻ card tự động trượt và hiện lên màn hình tuần tự từng chiếc một một cách mượt mà.
