# Cơ bản về Framer Motion: Giới thiệu & Hiệu ứng đơn giản ✨

**Framer Motion** là thư viện tạo hiệu ứng chuyển động (animation) và tương tác cử chỉ (gesture) tiêu chuẩn của ngành, sẵn sàng cho môi trường production dành cho React. Thư viện này giúp việc tạo các hiệu ứng mượt mà dựa trên mô phỏng vật lý trở nên vô cùng đơn giản, hỗ trợ nhà phát triển xây dựng các giao diện cao cấp với số dòng code tối thiểu.

---

## 📖 Khái niệm & Tổng quan

Trước khi bắt tay vào code, sẽ rất hữu ích nếu hiểu được *tại sao* một thư viện như Framer Motion lại tồn tại trong khi CSS đã có sẵn `transition` và `@keyframes`.

### CSS so với Framer Motion

Các hiệu ứng CSS **rất tốt** cho các hiệu ứng hover đơn giản, chuyển đổi giữa các trạng thái, hoặc các hiệu ứng không đòi hỏi logic phức tạp. Chúng có hiệu năng rất cao, có thể tận dụng tăng tốc GPU, và **không** yêu cầu bất kỳ thư viện bên thứ ba nào. Tuy nhiên, CSS trở nên khó khăn khi bạn cần điều phối nhiều phần tử cùng lúc, phản hồi tương tác của người dùng vượt ra ngoài các sự kiện đơn giản, hoặc chạy hiệu ứng dựa trên **state** của component React.

Framer Motion cung cấp các khả năng nâng cao như **cử chỉ kéo (drag gestures)**, **hiệu ứng layout (layout animations)**, và **hiệu ứng thoát (exit animations)** vốn rất khó thực hiện bằng CSS thuần. Quan trọng nhất, nó tích hợp liền mạch với mô hình component của React, khiến cho việc **chạy hiệu ứng dựa trên state** trở nên cực kỳ đơn giản.

> [!NOTE]
> Đừng nhầm lẫn giữa **Framer** và **Framer Motion**. *Framer* (framer.com) là một công cụ thiết kế trực quan để xây dựng các bản prototype có độ chân thực cao. *Framer Motion* (framer.com/motion) là một thư viện animation dành riêng cho React. Bài học này hoàn toàn nói về **thư viện**.

### Phép ẩn dụ thực tế: Một chiếc GPS, không phải lái xe theo từng bước 🗺️

Ý tưởng quan trọng nhất trong Framer Motion là animation mang tính **khai báo (declarative)**, chứ không phải **mệnh lệnh (imperative)**.

Hãy tưởng tượng bạn muốn đến sân bay. Với animation kiểu **mệnh lệnh** (như chỉnh sửa thủ công `requestAnimationFrame` hay tự bước qua từng keyframe CSS), bạn là người lái xe tự đưa ra chỉ dẫn cho chính mình mỗi giây: *"rẽ trái ngay bây giờ, tăng tốc lên 30, phanh lại, rẽ phải..."* Bạn quản lý từng khung hình trung gian.

Với animation kiểu **khai báo**, bạn hành động như một **điểm đến trên GPS**. Bạn chỉ đơn giản nói *"Tôi đang ở đây (`initial`), và tôi muốn đến đó (`animate`)."* Framer Motion chính là động cơ điều hướng tự tính toán toàn bộ lộ trình — mọi khung hình trung gian, đường cong easing, các yếu tố vật lý — để đưa phần tử từ trạng thái hiện tại đến trạng thái đích. Bạn mô tả **cái gì**, chứ không phải **bằng cách nào**.

> [!TIP]
> Vì animation mang tính khai báo, bạn gần như không bao giờ phải viết các vòng lặp keyframe bằng tay. Khi bạn thay đổi một giá trị trong thuộc tính `animate` (thường được điều khiển bởi state của React), Framer Motion sẽ tự động tính toán một lộ trình mượt mà từ trạng thái hiển thị *hiện tại* của phần tử đến trạng thái đích mới — không cần nội suy thủ công.

---

## ⚡ 1. Khởi đầu: Hướng dẫn cài đặt

Để cài đặt Framer Motion vào dự án React của bạn, hãy chạy lệnh sau trong terminal:

```bash
npm install framer-motion
```

---

## 🧩 2. Phần tử `<motion>`

Framer Motion hoạt động bằng cách bao bọc các thẻ HTML tiêu chuẩn bằng một đối tượng **`motion`** đặc biệt (ví dụ: `<motion.div>`, `<motion.button>`, `<motion.h1>`). Bạn có thể dùng `motion` với hầu hết mọi phần tử: `motion.h1`, `motion.li`, `motion.span`, `motion.img`, `motion.article`, `motion.section`, và nhiều hơn nữa. Các phần tử motion này chấp nhận các thuộc tính cấu hình để định nghĩa hành vi chuyển động:

```jsx
import { motion } from 'framer-motion';

export const SimpleBox = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }} // 1. Start state
      animate={{ opacity: 1, scale: 1 }}   // 2. Target state
      transition={{ duration: 0.5 }}       // 3. Animation controls
      style={styles.box}
    />
  );
};

const styles = {
  box: { width: 100, height: 100, backgroundColor: "#3498db", borderRadius: "10px" }
};
```

> [!WARNING]
> Luôn import từ `'framer-motion'`, không phải từ một thư viện animation khác. Một lỗi rất phổ biến khi sao chép code là import `motion` từ sai package (ví dụ từ một thư viện state). Nếu `motion.div` được render nhưng không bao giờ chạy hiệu ứng, hãy kiểm tra lại đường dẫn import của bạn trước tiên.

---

## ⚡ 3. Các thuộc tính điều khiển: `initial`, `animate` và `transition`

Hiểu rõ ba thuộc tính này là điều then chốt để làm việc với Framer Motion:

### A. Thuộc tính `initial`
Định nghĩa các thuộc tính ban đầu của phần tử **trước khi nó được đưa vào DOM** — cách nó nên hiển thị khi render lần đầu.
* Ví dụ: `initial={{ x: -100, opacity: 0 }}` bắt đầu với hộp lệch sang trái 100 pixel và hoàn toàn trong suốt.
* Nếu bạn không muốn có hiệu ứng xuất hiện, hãy đặt `initial={false}`.

### B. Thuộc tính `animate`
Định nghĩa các giá trị đích cuối cùng mà phần tử sẽ chuyển động hướng tới. Đây là trái tim của animation dựa trên state.
* Ví dụ: `animate={{ x: 0, opacity: 1 }}`.
* Framer Motion tự động tính toán khoảng chênh lệch và chạy hiệu ứng mượt mà cho các thuộc tính.

### C. Thuộc tính `exit`
Định nghĩa hiệu ứng chạy khi component bị **gỡ bỏ** khỏi cây React. Điều này hoàn hảo cho các hiệu ứng mờ dần (fade-out) và trượt đi khi một phần tử bị unmount (sử dụng cùng với `<AnimatePresence>`, sẽ được đề cập trong các bài học sau).

### D. Thuộc tính `transition`
Điều khiển *cách thức* các thuộc tính di chuyển từ `initial` sang `animate`. Nó hỗ trợ các cấu hình thời gian hoặc các thiết lập mô phỏng vật lý:

#### Transition theo thời gian (Tween)
Sử dụng thời lượng và các đường cong easing định nghĩa sẵn:
```jsx
transition={{ duration: 0.8, ease: "easeInOut" }}
```

#### Transition vật lý (Spring)
Mô phỏng cơ chế lò xo ngoài thực tế (độ nảy và trọng lượng). **Spring là kiểu mặc định trong Framer Motion** vì nó mô phỏng các yếu tố vật lý tự nhiên:
```jsx
transition={{
  type: "spring",
  stiffness: 120, // Tension of the spring (higher is faster/snappier)
  damping: 15,    // Resistance of the spring (lower causes more bounces)
  mass: 1         // Weight of the moving element
}}
```

---

## 🔬 4. Tween so với Spring: Lựa chọn kiểu transition

Thuộc tính `transition` chấp nhận hai triết lý chuyển động khác biệt về bản chất. **Tween** dựa trên *thời gian* (bạn kiểm soát thời lượng diễn ra), trong khi **Spring** dựa trên *vật lý* (bạn kiểm soát các lực, và thời lượng tự sinh ra từ chúng). Lựa chọn đúng kiểu chính là sự khác biệt giữa một hiệu ứng cảm giác cơ học và một hiệu ứng cảm giác sống động.

| Khía cạnh | Tween (`type: "tween"`) | Spring (`type: "spring"`) |
| --- | --- | --- |
| **Điều khiển bởi** | Thời gian + đường cong easing | Mô phỏng vật lý (các lực) |
| **Thuộc tính chính** | `duration`, `ease`, `delay` | `stiffness`, `damping`, `mass`, `velocity` |
| **Thời lượng** | Tường minh — bạn đặt chính xác | Tự sinh — suy ra từ vật lý |
| **Cảm giác** | Chính xác, có kiểm soát, có thể cảm thấy cơ học | Tự nhiên, nảy, hữu cơ |
| **Phù hợp nhất cho** | Mờ dần opacity, đổi màu, chuỗi cần thời gian chính xác | Thả kéo, scale khi hover, UI cần cảm giác "sống động" |
| **Mặc định trong Framer Motion?** | Không | ✅ Có (cho hầu hết các giá trị transform) |
| **Vượt quá / nảy** | Không bao giờ (theo đúng đường cong) | Có (`damping` thấp tạo độ nảy rõ rệt) |

> [!NOTE]
> Framer Motion lựa chọn mặc định một cách thông minh: các thuộc tính vật lý như `x`, `scale`, và `rotate` mặc định dùng **spring**, trong khi các thuộc tính phi vật lý như `opacity` và `color` mặc định dùng **tween**. Bạn chỉ cần đặt `type` một cách tường minh khi muốn ghi đè hành vi này.

### Giải thích các tham số của Spring
* **`stiffness`** — độ căng của lò xo. Càng cao = chuyển động càng nhanh, càng dứt khoát. (Khoảng phổ biến: 100–400.)
* **`damping`** — độ cản / ma sát. Càng thấp = càng nảy nhiều trước khi ổn định. Càng cao = dừng sớm hơn.
* **`mass`** — khối lượng của phần tử. Phần tử nặng hơn cho cảm giác ì ạch và vượt quá chậm hơn.

---

## 🎯 5. Các phím tắt Transform

Framer Motion cung cấp các cách viết tắt tiện lợi để bạn không phải viết đầy đủ chuỗi CSS `transform`. Các cách viết tắt này cho phép công cụ vật lý chạy hiệu ứng từng thuộc tính một cách **độc lập**:

```jsx
<motion.div
  animate={{
    x: 100,      // translateX(100px)
    y: -50,      // translateY(-50px)
    rotate: 45,  // rotateZ(45deg)
    scale: 1.5,  // scale factor
    skewX: 20,   // skewX(20deg)
  }}
/>
```

Bạn cũng có thể dùng các đơn vị tùy chỉnh như `"10rem"` hoặc `"80%"` thay vì các số thuần (số mặc định tính theo pixel cho `x`/`y`).

---

## 🎞️ 6. Keyframes

Thay vì chạy hiệu ứng từ một điểm bắt đầu đến một điểm kết thúc duy nhất, bạn có thể truyền vào một **mảng** các giá trị để định nghĩa nhiều điểm trung gian. Framer Motion sẽ chạy qua từng giá trị theo thứ tự:

```jsx
<motion.div
  // Pulse: grow to 1.2x then shrink back, looping forever
  animate={{ scale: [1, 1.2, 1] }}
  transition={{
    duration: 1,        // total time for the full sequence
    ease: "easeInOut",
    repeat: Infinity,   // loop endlessly
  }}
  className="box"
/>
```

> [!TIP]
> Hãy nghĩ về một mảng keyframe như việc **chia một hiệu ứng thành nhiều phần**. `scale: [1, 2, 3, 2, 1]` phóng to phần tử lên 3 lần rồi thu nhỏ lại — tất cả chỉ trong một mảng khai báo duy nhất.

---

## 🖐️ 7. Hiệu ứng cử chỉ (Gesture Animations)

Cử chỉ giúp các component phản hồi tương tác của người dùng. Ba loại phổ biến nhất là hover, tap và drag:

```jsx
<motion.div
  className="box"
  whileHover={{ scale: 1.2, rotate: 10 }}        // on mouse hover
  whileTap={{ scale: 0.8, backgroundColor: "crimson" }} // on click/tap
  drag                                            // make it draggable
  dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
  transition={{ type: "spring", stiffness: 300 }} // springy gesture feel
/>
```

* **`whileHover`** — áp dụng các style trong khi con trỏ ở trên phần tử.
* **`whileTap`** — áp dụng các style trong khi phần tử đang bị nhấn.
* **`drag`** — làm cho phần tử có thể kéo được. Dùng `drag="x"` hoặc `drag="y"` để khóa một trục.
* **`dragConstraints`** — giới hạn phạm vi mà phần tử có thể được kéo đi.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về Framer Motion. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Kiểu transition mặc định trong Framer Motion là gì, và tại sao nó được ưu tiên hơn so với kiểu tween theo thời gian?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đối với các thuộc tính vật lý có thể transform (như `x`, `scale`, `rotate`), kiểu transition mặc định là **`spring`**. Nó được ưu tiên vì mô phỏng quán tính vật lý thực tế (độ căng và độ cản), giúp tạo ra các hiệu ứng nảy trông tự nhiên. Các hiệu ứng easing dạng tuyến tính hoặc "tween" truyền thống có thể cho cảm giác đơ và nhân tạo. (Lưu ý: các thuộc tính phi vật lý như `opacity` mặc định dùng `tween`.)
</details>

### 2. Điều gì xảy ra khi bạn thay đổi một giá trị bên trong thuộc tính `animate` một cách động bằng state?
<details>
  <summary><b>Reveal Answer</b></summary>

  Framer Motion sẽ tự động phát hiện sự thay đổi state và chạy hiệu ứng mượt mà phần tử từ vị trí **hiện tại** đến giá trị mới được định nghĩa trong thuộc tính `animate`, mà không yêu cầu bất kỳ định nghĩa keyframe thủ công nào. Đây chính là bản chất của animation **khai báo** — bạn mô tả điểm đến, thư viện tính toán lộ trình.
</details>

### 3. Bạn có thể chạy hiệu ứng trực tiếp cho các thuộc tính transform như `rotate`, `scale`, `x` và `y` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Framer Motion cung cấp các tên viết tắt cho các thuộc tính CSS transform phổ biến:
  - `x` và `y` đại diện cho `translateX` và `translateY` (ví dụ: `x: 100` dịch phần tử sang phải 100px).
  - `rotate` đại diện cho `rotateZ` (ví dụ: `rotate: 45` xoay phần tử 45 độ).
  - `scale` đại diện cho tỷ lệ co giãn (ví dụ: `scale: 1.5`).
</details>

### 4. Làm cách nào để tắt hiệu ứng khi mount của một component `<motion>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn truyền trực tiếp giá trị boolean `false` vào thuộc tính `initial`: `<motion.div initial={false} animate={{ opacity: 1 }} />`. Điều này báo cho Framer Motion bỏ qua khung hình hiệu ứng ban đầu và render ngay trạng thái đích khi mount.
</details>

### 5. Sự khác biệt then chốt giữa transition `tween` và transition `spring` là gì, và khi nào bạn nên chọn loại nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Một **tween** dựa trên *thời gian*: bạn đặt một `duration` tường minh và đường cong `ease`, và hiệu ứng đi theo đúng đường cong đó mà không vượt quá. Một **spring** dựa trên *vật lý*: bạn đặt `stiffness`, `damping`, và `mass`, và thời lượng tự sinh ra từ mô phỏng, thường tạo ra độ nảy/vượt quá tự nhiên.

  Dùng **tween** cho các hiệu ứng chính xác, có kiểm soát như mờ dần opacity, đổi màu, hoặc các chuỗi phải kết thúc tại một thời điểm chính xác. Dùng **spring** cho bất cứ thứ gì cần cảm giác hữu cơ và sống động — thả kéo, scale khi hover, và các UI tương tác.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Hộp thông báo trượt dứt khoát (Snappy Alert Notification Box)
1. Tạo một component `SlideAlert.tsx` (sử dụng đuôi `.tsx`).
2. Thiết lập một biến state `isOpen` để bật/tắt một dòng thông báo.
3. Bao bọc thẻ thông báo (alert card) bên trong một `<motion.div>`:
   - Vị trí bắt đầu (`initial`): hoàn toàn trong suốt, nằm ở phía trên màn hình (`y: -100`).
   - Vị trí hoạt động (`animate`): hoàn toàn rõ nét, trượt xuống vào tầm nhìn (`y: 20`).
   - Sử dụng một transition spring dứt khoát: `type: "spring", stiffness: 150, damping: 12`.
4. Render một nút bấm để bật/tắt `isOpen` và quan sát chuyển động xuất hiện và biến mất.
5. **Mục tiêu nâng cao:** Nhân bản component và thay transition spring bằng một tween (`type: "tween", duration: 0.4, ease: "easeInOut"`). Đặt cả hai cạnh nhau và quan sát cách spring vượt quá/nảy trong khi tween trượt vào một cách gọn gàng. Điều này khiến bảng so sánh ở trên trở nên trực quan.

```tsx
import { useState } from "react";
import { motion } from "framer-motion";

export const SlideAlert = () => {
  // Toggle controls whether the alert is on screen
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        Toggle Alert
      </button>

      {isOpen && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}   // start above the viewport, invisible
          animate={{ y: 20, opacity: 1 }}     // slide down into view
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
          style={{
            background: "#2ecc71",
            color: "white",
            padding: "16px",
            borderRadius: "8px",
            marginTop: "12px",
          }}
        >
          Success! Your changes were saved.
        </motion.div>
      )}
    </div>
  );
};
```

---

### 🛠️ Bài tập 2: Nút bấm nhấp nháy vô hạn (Keyframes + Loop)
1. Tạo một component `PulsingButton.tsx`.
2. Sử dụng `motion.button` với một mảng keyframe cho `scale`: `[1, 1.1, 1]`.
3. Thêm một mảng keyframe cho `backgroundColor` để màu sắc thay đổi rồi trở về.
4. Cấu hình transition với `duration: 0.8`, `ease: "easeInOut"`, và `repeat: Infinity` để nó nhấp nháy mãi mãi.
5. **Mục tiêu nâng cao:** Thêm `whileHover={{ scale: 1.15 }}` và `whileTap={{ scale: 0.95 }}` để nút bấm cũng phản hồi với người dùng, kết hợp vòng lặp keyframe với hiệu ứng cử chỉ.

```tsx
import { motion } from "framer-motion";

export const PulsingButton = () => {
  return (
    <motion.button
      // Keyframe arrays: grow then shrink, and shift color then return
      animate={{
        scale: [1, 1.1, 1],
        backgroundColor: ["#3498db", "#9b59b6", "#3498db"],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity, // loop the pulse endlessly
      }}
      whileHover={{ scale: 1.15 }} // gesture: react to hover
      whileTap={{ scale: 0.95 }}   // gesture: react to press
      style={{
        padding: "12px 24px",
        color: "white",
        border: "none",
        borderRadius: "9999px",
        cursor: "pointer",
      }}
    >
      Click Me
    </motion.button>
  );
};
```
