# Cơ bản về Framer Motion: Giới thiệu & Hiệu ứng đơn giản ✨

**Framer Motion** là thư viện tạo hiệu ứng chuyển động (animation) và tương tác cử chỉ tiêu chuẩn của ngành dành cho các ứng dụng React. Thư viện này giúp việc tạo các hiệu ứng mượt mà dựa trên mô phỏng vật lý trở nên vô cùng đơn giản, giúp nhà phát triển xây dựng các giao diện cao cấp với số dòng code tối thiểu.

---

## ⚡ 1. Khởi đầu: Hướng dẫn cài đặt

Để cài đặt Framer Motion vào dự án React của bạn, hãy chạy lệnh sau trong terminal:

```bash
npm install framer-motion
```

---

## 🧩 2. Phần tử `<motion>`

Framer Motion hoạt động bằng cách bao bọc các thẻ HTML tiêu chuẩn bằng một đối tượng **`motion`** đặc biệt (ví dụ: `<motion.div>`, `<motion.button>`, `<motion.h1>`). Các thẻ motion này chấp nhận các thuộc tính cấu hình để định nghĩa chuyển động:

```jsx
import { motion } from 'framer-motion';

export const SimpleBox = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }} // 1. Trạng thái bắt đầu
      animate={{ opacity: 1, scale: 1 }}   // 2. Trạng thái đích
      transition={{ duration: 0.5 }}       // 3. Điều khiển hiệu ứng
      style={styles.box}
    />
  );
};

const styles = {
  box: { width: 100, height: 100, backgroundColor: "#3498db", borderRadius: "10px" }
};
```

---

## ⚡ 3. Các thuộc tính điều khiển: `initial`, `animate` và `transition`

Hiểu rõ 3 thuộc tính này là chìa khóa để làm chủ Framer Motion:

### A. Thuộc tính `initial`
Định nghĩa trạng thái bắt đầu của phần tử trước khi nó được nạp (mount) vào giao diện.
* Ví dụ: `initial={{ x: -100, opacity: 0 }}` bắt đầu với hộp lệch sang trái 100px và hoàn toàn ẩn.
* Nếu không muốn chạy hiệu ứng khi mount, hãy đặt `initial={false}`.

### B. Thuộc tính `animate`
Định nghĩa các giá trị trạng thái đích cuối cùng mà phần tử sẽ chuyển động hướng tới.
* Ví dụ: `animate={{ x: 0, opacity: 1 }}`.
* Framer Motion tự động tính toán khoảng chênh lệch và chạy hiệu ứng mượt mà.

### C. Thuộc tính `transition`
Điều khiển *cách thức* các thuộc tính di chuyển từ `initial` sang `animate`. Nó hỗ trợ các cấu hình thời gian hoặc mô phỏng vật lý thực tế:

#### Transition thời gian (Tween)
Sử dụng thời lượng chạy tính bằng giây và các đường cong tốc độ định nghĩa sẵn:
```jsx
transition={{ duration: 0.8, ease: "easeInOut" }}
```

#### Transition vật lý (Spring)
Mô phỏng cơ chế lò xo ngoài thực tế (độ nảy và trọng lượng). **Spring là kiểu transition mặc định của Framer Motion** vì nó tạo cảm giác chuyển động tự nhiên:
```jsx
transition={{ 
  type: "spring", 
  stiffness: 120, // Độ căng lò xo (càng cao thì hiệu ứng càng nhanh/nảy)
  damping: 15,    // Độ cản lò xo (càng thấp thì độ nảy qua lại càng nhiều)
  mass: 1         // Khối lượng của vật thể chuyển động
}}
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Kiểu transition mặc định trong Framer Motion là gì, và tại sao nó tối ưu hơn kiểu tween thời gian?
<details>
  <summary><b>Reveal Answer</b></summary>

  Kiểu transition mặc định là **`spring`** (lò xo). Nó được ưu tiên vì mô phỏng quán tính vật lý thực tế (độ căng và độ cản), giúp tạo ra các hiệu ứng chuyển động nảy tự nhiên. Các hiệu ứng dạng tuyến tính hoặc "tween" truyền thống tạo cảm giác đơ và cơ học, không thật mắt.
</details>

### 2. Điều gì xảy ra khi bạn thay đổi giá trị trong thuộc tính `animate` một cách động bằng biến state?
<details>
  <summary><b>Reveal Answer</b></summary>

  Framer Motion sẽ tự động phát hiện sự thay đổi giá trị state và chạy hiệu ứng chuyển dịch mượt mà phần tử từ vị trí hiện tại đến vị trí mới được khai báo trong thuộc tính `animate`, bạn không cần tự viết thêm các hàm keyframes thủ công.
</details>

### 3. Có thể chạy trực tiếp hiệu ứng cho các thuộc tính transform như `rotate`, `scale`, `x` và `y` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Framer Motion cung cấp sẵn các tên viết tắt cho các thuộc tính CSS transform phổ biến:
  - `x` và `y` đại diện cho `translateX` và `translateY` (ví dụ: `x: 100` dịch phần tử sang phải 100px).
  - `rotate` đại diện cho trục `rotateZ` (ví dụ: `rotate: 45` xoay phần tử góc 45 độ).
  - `scale` đại diện cho tỷ lệ co giãn (ví dụ: `scale: 1.5` phóng to 1,5 lần).
</details>

### 4. Làm cách nào để tắt hiệu ứng xuất hiện ban đầu của một component `<motion>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn truyền trực tiếp giá trị boolean `false` vào thuộc tính `initial`: `<motion.div initial={false} animate={{ opacity: 1 }} />`. Điều này báo cho Framer Motion bỏ qua bước chạy hiệu ứng bắt đầu và hiển thị trạng thái đích ngay lập tức khi nạp component.
</details>

### 5. Tại sao nên dùng các tên viết tắt (như `x` hay `scale`) thay vì viết chuỗi CSS chuẩn (như `transform: "translateX(100px)"`) trong thuộc tính motion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các thuộc tính viết tắt cho phép Framer Motion đọc, ghi và chạy hiệu ứng độc lập cho từng tham số biến đổi. Viết chuỗi CSS đầy đủ sẽ khiến công cụ vật lý rất khó phân tích cú pháp giá trị, từ đó làm mất hiệu lực của chuyển động lò xo spring mượt mà và làm giảm hiệu năng render.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Hộp thông báo trượt Snappy (Slide Alert Notification)
1. Tạo một component `SlideAlert.tsx` (sử dụng đuôi `.tsx`).
2. Thiết lập một state `isOpen` để bật/tắt hiển thị một dòng thông báo.
3. Bao bọc thẻ thông báo bằng thẻ `<motion.div>`:
   - Trạng thái bắt đầu (`initial`): ẩn hoàn toàn, nằm ở phía trên ngoài màn hình (`y: -100`).
   - Trạng thái hiển thị (`animate`): hiện rõ, trượt xuống vị trí (`y: 20`).
   - Sử dụng transition lò xo nảy: `type: "spring", stiffness: 150, damping: 12`.
4. Tạo một nút bấm để đổi trạng thái `isOpen` và quan sát chuyển động xuất hiện/biến mất của hộp thông báo.
