# Cử chỉ tương tác (Gestures) & Biến thể (Variants) trong Framer Motion ✨

Bài học này hướng dẫn về các **Cử chỉ tương tác (Gestures)** của người dùng (hover, tap, drag), **Variants** – một phương pháp khai báo để tổ chức các thuộc tính hiệu ứng, làm sạch mã JSX và điều phối các hiệu ứng lồng nhau phức tạp (staggering) – và **hiệu ứng kích hoạt theo cuộn trang (scroll-triggered animation)** với prop `whileInView`.

---

## 📖 Khái niệm & Tổng quan

Framer Motion mang đến cho bạn hai siêu năng lực phối hợp ăn ý với nhau:

1. **Gestures (Cử chỉ)** — các prop như `whileHover`, `whileTap` và `drag` phản hồi người dùng *trong khi* một tương tác đang diễn ra, mà không cần quản lý state thủ công.
2. **Variants (Biến thể)** — những "preset hiệu ứng" được đặt tên và lưu trong một object thuần. Thay vì rải rác các object `initial`, `animate` và `transition` khắp JSX, bạn đặt tên cho từng trạng thái hình ảnh (`"hidden"`, `"visible"`) và tham chiếu chúng dưới dạng chuỗi.

> [!NOTE]
> Một **variant** chỉ đơn giản là một từ điển (dictionary) có các key là *tên trạng thái* và các value là object style đích. Khi bạn viết `animate="visible"`, Framer Motion sẽ tra cứu key `visible` trong prop `variants` của component. Điều kỳ diệu thực sự là phép tra cứu này diễn ra **đệ quy xuống toàn bộ cây component**, và đây chính là điều giúp việc điều phối (staggering) trở nên khả thi.

> [!TIP]
> Hãy dùng đến **variants** ngay khi một component có nhiều hơn một trạng thái hiệu ứng, hoặc bất cứ khi nào một component cha cần điều phối các con của nó. Đối với một hiệu ứng đơn lẻ chỉ chạy một lần (ví dụ: một logo chỉ xoay), việc viết inline `animate={{ rotate: 360 }}` là hoàn toàn ổn — đừng làm phức tạp hóa vấn đề.

### Phép ẩn dụ thực tế 🎻

Hãy xem một component `motion` cha như **nhạc trưởng của một dàn nhạc**, và mỗi component `motion` con là một **nhạc công**:

- Nhạc trưởng giơ chiếc đũa chỉ huy (component cha chuyển sang `animate="visible"`).
- Mỗi nhạc công đã biết rõ phần của mình (mỗi component con định nghĩa một variant `visible`).
- Nhạc trưởng không hét chỉ dẫn cho từng người chơi một cách riêng lẻ — một cử chỉ duy nhất lan truyền đến cả dàn nhạc.
- `staggerChildren` là việc nhạc trưởng quyết định cho các nhạc công vào **từng bè một** thay vì tất cả cùng lúc, tạo nên nhịp điệu thay vì sự hỗn loạn.

### Gestures và Variants trong nháy mắt

| Tính năng | Gestures (`whileHover`, v.v.) | Variants |
| --- | --- | --- |
| Nơi định nghĩa | Inline trên component | Object từ điển bên ngoài |
| Phù hợp nhất cho | Phản hồi tương tác đơn lẻ | Nhiều trạng thái / trạng thái phối hợp |
| Tái sử dụng giữa các component | Không (copy-paste) | Có (import object) |
| Lan truyền xuống các con | Không | **Có** (tính năng cốt lõi) |
| Giữ JSX gọn gàng | Nhanh chóng trở nên rối rắm | Rất gọn gàng |

---

## ⚡ 1. Cử chỉ tương tác (Interactive Gestures)

Framer Motion có sẵn các prop lắng nghe để kích hoạt hiệu ứng ngay lập tức khi người dùng di chuột (hover), nhấp (tap) hoặc kéo (drag):

```jsx
import { motion } from 'framer-motion';

export const InteractiveButton = () => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "#2980b9" }} // Trigger on hover
      whileTap={{ scale: 0.95 }}                               // Trigger on click
      style={styles.btn}
    >
      Click Me
    </motion.button>
  );
};
```

### Cử chỉ kéo thả (Drag Gestures)
Biến bất kỳ phần tử nào thành có thể kéo thả bằng cách thêm prop `drag`. Giới hạn phạm vi di chuyển bằng prop `dragConstraints`:

```jsx
export const DraggableCard = () => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: -50, right: 150, top: -50, bottom: 50 }}
      dragElastic={0.1} // Friction/elastic resistance when dragging past boundaries
      style={styles.card}
    >
      Drag Me!
    </motion.div>
  );
};
```

### Kết hợp Gestures với Variants
Bạn có thể trộn lẫn gestures và variants trên cùng một phần tử. Định nghĩa ba trạng thái được đặt tên và ánh xạ mỗi prop gesture tới một key:

```jsx
import { motion } from 'framer-motion';

// One dictionary describing initial, hover, and click states
const boxVariants = {
  initial: { scale: 1, rotate: 0, skewX: 0 },
  hover:   { scale: 1.2, rotate: 15, skewX: 10, transition: { duration: 0.3 } },
  click:   { scale: 0.9, rotate: -50, transition: { duration: 0.3 } }
};

export const AnimatedShape = () => {
  return (
    <motion.div
      variants={boxVariants}
      initial="initial"   // Start in the resting state
      whileHover="hover"  // Gesture references the "hover" key
      whileTap="click"    // Gesture references the "click" key
      style={styles.shape}
    />
  );
};
```

> [!WARNING]
> Các prop gesture (`whileHover`, `whileTap`) chỉ chạy hiệu ứng **trong khi** tương tác đang hoạt động và bật lại khi tương tác kết thúc. Chúng **không** lưu giữ trạng thái. Nếu bạn cần một cú nhấp để *bật/tắt* một trạng thái cố định, hãy điều khiển `animate` từ một giá trị React state (ví dụ: `animate={isOpen ? "visible" : "hidden"}`) thay vì dùng `whileTap`.

---

## 🧩 2. Biến thể hiệu ứng (Animation Variants)

Khi hiệu ứng trở nên phức tạp, việc viết nhiều object trạng thái inline bên trong JSX khiến mã nguồn trở nên rối rắm. **Variants** giải quyết vấn đề này bằng cách tách các mốc hiệu ứng (animation targets) thành các cấu hình từ điển gọn gàng.

```javascript
// 1. Declare the variants dictionary
const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};
```

Sau đó truyền từ điển này vào component và tham chiếu các key dưới dạng các trạng thái chuỗi:

```jsx
<motion.div
  variants={listVariants}
  initial="hidden"
  animate="visible"
/>
```

---

## 🚀 3. Điều phối hiệu ứng lồng nhau (Staggering)

Variants mở ra một tính năng cực kỳ mạnh mẽ: các component cha có thể tự động điều khiển hiệu ứng của các phần tử con. Nếu một component motion cha có thiết lập variant (ví dụ `initial="hidden"` và `animate="visible"`), nó sẽ tự động lan truyền các key đang hoạt động này xuống tất cả các component motion con trong cây.

### Cơ chế lan truyền hoạt động thế nào (Sơ đồ)

Khi bạn thiết lập key variant đang hoạt động trên một component cha, bạn **không** thiết lập nó trên các con — chúng kế thừa nó:

```text
                <motion.ul variants={containerVariants} initial="hidden" animate="visible">
                                          │
                  the key "visible" propagates DOWN the tree
                                          │
          ┌───────────────────────────────┼───────────────────────────────┐
          ▼                                ▼                                ▼
  <motion.li variants={item}>     <motion.li variants={item}>     <motion.li variants={item}>
   (no animate prop! it           (no animate prop! it            (no animate prop! it
    inherits "visible")            inherits "visible")             inherits "visible")
          │                                │                                │
   starts at  t = 0.1s            starts at  t = 0.3s             starts at  t = 0.5s
          └────────── staggerChildren: 0.2  +  delayChildren: 0.1 ──────────┘
```

- **Component cha** là component duy nhất mà bạn cho biết *nó nên ở* trạng thái nào.
- Mỗi **component con** chỉ khai báo *trông như thế nào* với `hidden` và `visible` — nó không bao giờ tự thiết lập `animate`.
- `staggerChildren` chèn một khoảng trống (tính bằng giây) giữa thời điểm bắt đầu của mỗi con.
- `delayChildren` chờ đợi trước khi con *đầu tiên* bắt đầu.

> [!NOTE]
> Sự lan truyền chỉ tới được các con **bỏ qua** prop `initial`/`animate` của riêng chúng nhưng **có** cung cấp một key `variants` khớp. Ngay khoảnh khắc một con tự thiết lập `animate="..."` của riêng nó, nó sẽ ngừng lắng nghe component cha và việc điều phối bị phá vỡ. Hãy để component cha là nguồn chân lý duy nhất quyết định *trạng thái nào*; để các con sở hữu việc *mỗi trạng thái trông như thế nào*.

Chúng ta sử dụng các **thuộc tính điều phối (Orchestration properties)** như `staggerChildren` để tạo độ trễ thời điểm bắt đầu của các hiệu ứng con một cách tự động:

```jsx
import { motion } from 'framer-motion';

// Parent Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between each child animation (in seconds)
      delayChildren: 0.1    // Initial delay before first child starts
    }
  }
};

// Child Variants
const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" } }
};

export const StaggeredList = () => {
  const items = ["Item A", "Item B", "Item C"];

  return (
    // 1. Parent initiates keys: hidden & visible
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={styles.list}
    >
      {items.map((item, index) => (
        // 2. Children automatically receive and execute keys hidden & visible!
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

> [!TIP]
> Thêm `staggerDirection: -1` vào bên trong transition của component cha để đảo ngược thứ tự — các con sẽ chạy hiệu ứng từ cuối lên đầu. Điều này rất phù hợp cho hiệu ứng "thu gọn/ẩn" khi các phần tử nên biến mất theo thứ tự ngược lại với khi chúng xuất hiện.

---

## 📜 4. Hiệu ứng kích hoạt theo cuộn trang: `whileInView`

Cho đến giờ, các hiệu ứng của chúng ta chạy khi mount (`animate`) hoặc khi tương tác (`whileHover`). Một loại kích hoạt thứ ba là **vị trí cuộn trang (scroll position)**. Framer Motion chia công việc cuộn trang thành hai nhóm:

| Loại | Hành vi | Trường hợp sử dụng |
| --- | --- | --- |
| **Scroll-triggered** | Kích hoạt một lần khi phần tử lọt vào vùng nhìn thấy (viewport) | Hé lộ các card/section khi bạn cuộn qua chúng |
| **Scroll-driven** | Liên tục ánh xạ vị trí cuộn tới một giá trị | Parallax, thanh tiến trình (dùng `useScroll`/`useTransform`) |

Phần này đề cập đến loại **scroll-triggered** bằng cách dùng hai prop:

- `whileInView` — mốc hiệu ứng đích để áp dụng *trong khi phần tử nhìn thấy được* trong viewport.
- `viewport` — các tùy chọn tùy chỉnh *khi nào* được tính là "nhìn thấy được" (ví dụ: chỉ kích hoạt một lần, hoặc yêu cầu phần tử phải lọt vào màn hình nhiều hơn).

```jsx
import { motion } from 'framer-motion';

export const AnimatedCard = () => {
  return (
    <motion.div
      // Starting (off-screen) state
      initial={{ scale: 0.5, opacity: 0, transition: { duration: 0.5 } }}
      // Target state applied WHILE the card is inside the viewport
      whileInView={{ scale: 1, opacity: 1, y: 0 }}
      // viewport options: only animate the FIRST time it scrolls in,
      // and wait until 40% of the card is visible (amount: 0.4)
      viewport={{ once: true, amount: 0.4 }}
      style={styles.card}
    >
      <h2>Amazing Card</h2>
      <p>This card animates beautifully into the view as you scroll.</p>
    </motion.div>
  );
};
```

> [!NOTE]
> Theo mặc định, `whileInView` chạy hiệu ứng **mỗi lần** phần tử quay lại viewport (cuộn xuống, cuộn lại lên, cuộn xuống lần nữa → nó chạy lại). Hãy truyền `viewport={{ once: true }}` để khóa nó lại sau lần hé lộ đầu tiên — đây gần như luôn là điều bạn muốn cho các section nội dung "fade-in khi cuộn" để trang không bị nhấp nháy mỗi lần cuộn ngược lại.

> [!WARNING]
> `whileInView` cần một trạng thái `initial` được định nghĩa để chạy hiệu ứng *từ đó*. Nếu bạn quên `initial`, phần tử sẽ bắt đầu ngay ở trạng thái cuối cùng đã nhìn thấy được và bạn sẽ không thấy hiệu ứng nào cả — đây là lỗi "tại sao hiệu ứng cuộn của tôi không chạy?" phổ biến nhất. Luôn ghép `whileInView` với một `initial` ẩn phần tử đi (ví dụ: `opacity: 0`).

**Các tùy chọn `viewport` thường gặp:**

| Tùy chọn | Kiểu | Tác dụng |
| --- | --- | --- |
| `once` | `boolean` | Nếu `true`, chỉ chạy hiệu ứng lần đầu tiên phần tử lọt vào tầm nhìn |
| `amount` | `number` \| `"some"` \| `"all"` | Bao nhiêu phần tử phải nhìn thấy được để kích hoạt (ví dụ: `0.4` = 40%) |
| `margin` | `string` | Mở rộng/thu nhỏ vùng phát hiện, giống CSS margin (ví dụ: `"-100px"` kích hoạt muộn hơn) |

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về gestures và variants. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Variants giúp đơn giản hóa các template mã JSX như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Variants tách biệt phần markup bố cục (JSX) khỏi logic hiệu ứng bằng cách đưa các thuộc tính style (initial, animate, transition) vào một object cấu hình riêng. Điều này giúp các file JSX gọn gàng, dễ đọc và cho phép tái sử dụng các định nghĩa hiệu ứng trên nhiều component khác nhau.
</details>

### 2. Cơ chế lan truyền variant từ cha xuống con hoạt động thế nào trong Framer Motion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi một component cha `<motion>` được gán một tên key trạng thái (ví dụ `initial="hidden"`), nó sẽ tự động chuyển tiếp tên key đó xuống tất cả các component motion con lồng bên dưới. Nếu các con có variants chứa key khớp (ví dụ `hidden`), chúng sẽ tự động chạy hiệu ứng đó mà bạn không cần truyền props thủ công. Lưu ý rằng một con sẽ ngừng kế thừa ngay khoảnh khắc nó tự thiết lập prop `animate` của riêng mình — component cha nên là nguồn chân lý duy nhất quyết định *trạng thái nào*.
</details>

### 3. Mục đích của `staggerChildren` trong cấu hình transition là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `staggerChildren` là một thuộc tính điều phối (orchestration). Khi được định nghĩa trong transition của một variant cha, nó thêm một độ trễ tuần tự (tính bằng giây) giữa hiệu ứng xuất hiện của mỗi phần tử con, tạo ra các hiệu ứng fade-in tuần tự cao cấp. Kết hợp nó với `delayChildren` để tạm dừng trước con đầu tiên, hoặc `staggerDirection: -1` để đảo ngược thứ tự.
</details>

### 4. `dragConstraints` giới hạn điều gì, và làm thế nào để khóa kéo thả chỉ theo một trục duy nhất?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `dragConstraints` định nghĩa các biên giới hạn (bằng pixel hoặc qua một React ref tới một container bao bọc) hạn chế mức độ một phần tử có thể kéo đi xa đến đâu.
  - Để khóa kéo thả theo một trục duy nhất, truyền một chuỗi vào prop `drag`: `drag="x"` (chỉ kéo ngang) hoặc `drag="y"` (chỉ kéo dọc).
</details>

### 5. Prop `whileInView` làm gì, và tùy chọn `viewport` nào ngăn nó chạy lại mỗi lần cuộn ngược lên?
<details>
  <summary><b>Reveal Answer</b></summary>

  `whileInView` là một prop kích hoạt theo cuộn trang: nó áp dụng mốc hiệu ứng đích trong khi phần tử nhìn thấy được bên trong viewport, cho phép bạn hé lộ nội dung khi người dùng cuộn tới nó. Theo mặc định nó chạy lại mỗi lần phần tử quay lại tầm nhìn. Truyền `viewport={{ once: true }}` sẽ khóa hiệu ứng sau lần hé lộ đầu tiên để nó không chạy lại trong các lần cuộn ngược lên sau đó. Hãy nhớ rằng nó cũng yêu cầu một trạng thái `initial` khớp để chạy hiệu ứng từ đó.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Lưới thẻ hồ sơ xuất hiện tuần tự (Staggered Profile Cards Grid)
1. Tạo một component `ProfileGrid.tsx` (sử dụng đuôi `.tsx`).
2. Thiết lập một list grid container với variants của cha điều phối độ trễ tuần tự `0.15` giây (`staggerChildren: 0.15`), cộng thêm `delayChildren: 0.2` để cả nhóm chờ một chút trước khi bắt đầu.
3. Render bốn thẻ hồ sơ con. Mỗi thẻ nên fade-in từ phía dưới (`y: 50`) và phóng to nhẹ khi hover (`whileHover={{ scale: 1.03 }}`) và co lại khi nhấp (`whileTap={{ scale: 0.98 }}`).
4. Đảm bảo rằng **các con không tự thiết lập prop `animate` của riêng chúng** — chúng chỉ nên khai báo `variants={cardVariants}` và kế thừa key đang hoạt động từ component cha. Kiểm chứng rằng các thẻ trượt và fade lên màn hình lần lượt từng cái một cách động.
5. **Mục tiêu nâng cao:** thêm `staggerDirection: -1` và quan sát các thẻ xuất hiện từ cuối lên đầu.

### 🛠️ Bài tập 2: Section tính năng hé lộ theo cuộn trang (Scroll-Reveal Feature Section)
1. Tạo một component `FeatureSection.tsx` render một trang dài: một `<h1>` ("Scroll down to see the animation") theo sau bởi một `<div>` spacer chiều cao đầy đủ để có chỗ cuộn.
2. Bên dưới spacer, render ba thẻ `motion.div`.
3. Cho mỗi thẻ một `initial={{ opacity: 0, scale: 0.5 }}` và một `whileInView={{ opacity: 1, scale: 1, y: 0 }}` với `transition` thời lượng `0.5`.
4. Thêm `viewport={{ once: true, amount: 0.4 }}` để mỗi thẻ chạy hiệu ứng đúng một lần, khi 40% của nó nhìn thấy được.
5. Kiểm chứng cái bẫy lỗi: tạm thời xóa prop `initial` và xác nhận rằng hiệu ứng biến mất — rồi thêm lại. Điều này củng cố *tại sao* `whileInView` cần một trạng thái khởi đầu.
