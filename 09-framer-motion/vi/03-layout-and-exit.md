# Hiệu ứng Bố cục (Layout) & Biến mất (Exit) trong Framer Motion ✨

Trong React thông thường, các phần tử được thêm vào hoặc xóa khỏi DOM ngay lập tức khi render có điều kiện, khiến việc tạo hiệu ứng cho lúc chúng rời đi là bất khả thi. Bài học này đề cập đến **`AnimatePresence`** (hiệu ứng khi unmount), thuộc tính **`layout`** (tạo hiệu ứng cho các thay đổi bố cục), và **`layoutId`** (hiệu ứng chia sẻ bố cục giữa các component). Sau đó, chúng ta sẽ đi sâu hơn một cấp vào các **motion-value hook** vốn là nền tảng cho các hiệu ứng điều khiển bằng cuộn (scroll) và kéo (drag): **`useMotionValue`**, **`useTransform`**, **`useScroll`**, và **`useSpring`**.

---

## 📚 Khái niệm & Tổng quan

Hiệu ứng chuyển động không chỉ là trang trí — nó truyền đạt *sự thay đổi* tới người dùng. Khi một thông báo xuất hiện, một modal đóng lại, hoặc một danh sách tự sắp xếp lại, một chuyển tiếp mượt mà cho mắt người thấy được *điều gì đã xảy ra và nó đã đi đâu*. Framer Motion cung cấp cho chúng ta hai bộ công cụ riêng biệt cho việc này:

1. **Hiệu ứng presence & layout** — các thuộc tính khai báo (`exit`, `layout`, `layoutId`) tạo hiệu ứng cho các component khi chúng mount, unmount, hoặc dịch chuyển vị trí (reflow).
2. **Motion value** — các nguyên thủy phản ứng (reactive) (`useMotionValue`, `useTransform`, `useScroll`, `useSpring`) cho phép chúng ta điều khiển hiệu ứng *bằng lập trình* từ các đầu vào liên tục như vị trí cuộn hoặc khoảng cách kéo.

> [!NOTE]
> Một **motion value** là một bộ chứa phản ứng (reactive) đặc biệt, theo dõi trạng thái của một thuộc tính có thể tạo hiệu ứng (như `x`, `opacity`, hay `backgroundColor`). Khi bạn dùng thuộc tính `animate`, Framer Motion tự động tạo các motion value này *giúp bạn* — đó chính là lý do tại sao chỉ một `animate={{ x: 200 }}` đơn giản đã trượt mượt mà dù bạn chưa từng viết transition nào. Các hook trong bài học này đơn giản là cho phép bạn tự tạo và điều khiển các giá trị đó.

> [!TIP]
> Hãy dùng các **thuộc tính khai báo** (`animate`, `exit`, `layout`) cho 90% các hiệu ứng giao diện — chúng đơn giản hơn và tự tối ưu hóa. Chỉ chuyển sang dùng **motion-value hook** khi hiệu ứng phải phản ứng *liên tục* với một đầu vào bên ngoài (cuộn, con trỏ, kéo), bởi những đầu vào đó thay đổi quá thường xuyên, không thể mô hình hóa thành state React rời rạc mà không bị giật (jank).

> [!WARNING]
> Một khi bạn gắn một thuộc tính vào motion value **của riêng bạn** thông qua thuộc tính `style`, Framer Motion sẽ ngừng quản lý nó cho bạn. Điều đó có nghĩa là khả năng làm mượt tự động biến mất — phần tử nhảy tức thì đến từng giá trị mới. Nếu bạn muốn lấy lại sự mượt mà, hãy bọc giá trị đó trong **`useSpring`** (được đề cập bên dưới). Việc trộn lẫn `animate={{ x }}` và `style={{ x }}` cho *cùng một* thuộc tính tại cùng một thời điểm sẽ gây xung đột và không hoạt động như mong đợi.

### 🤔 Một phép ẩn dụ thực tế

Hãy nghĩ về sự khác biệt giống như **công tắc đèn so với núm điều chỉnh độ sáng (dimmer)**:

- **Thuộc tính `animate`** là *công tắc đèn* — bạn khai báo trạng thái kết thúc ("bật") và Framer Motion lo phần chuyển mờ giữa tắt và bật cho bạn.
- Một **motion value** bạn điều khiển là *núm điều chỉnh độ sáng* — bạn đang trực tiếp vặn nó, và bóng đèn bám theo tay bạn ngay lập tức. Không có easing dựng sẵn; độ sáng nằm chính xác ở nơi ngón tay bạn đang ở ngay lúc này. Điều đó hoàn hảo cho cuộn và kéo, nơi đầu vào của người dùng *chính là* cái núm.
- **`useSpring`** là một *núm điều chỉnh có quán tính* — khi bạn buông núm ra, nó nhẹ nhàng dịch chuyển vào vị trí thay vì dừng phắt lại, mang lại cảm giác tự nhiên, mang tính vật lý.

---

## ⚡ 1. Hiệu ứng biến mất với `AnimatePresence`

Để tạo hiệu ứng cho một phần tử khi nó rời khỏi DOM, bạn phải:
1. Import và bao bọc khối render có điều kiện bên trong **`AnimatePresence`**.
2. Thêm thuộc tính **`exit`** vào component con `<motion>` trực tiếp.
3. Đảm bảo component motion con có thuộc tính **`key`** duy nhất để Framer Motion có thể theo dõi chính xác phần tử cụ thể nào đang được unmount.

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FadeAlert = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setVisible(!visible)}>Toggle Alert</button>
      
      <AnimatePresence>
        {visible && (
          <motion.div
            key="alert-box" // Required key
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} // 1. Run this before unmounting!
            style={styles.alert}
          >
            <h3>Alert Notification!</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = { alert: { padding: "15px", backgroundColor: "#e74c3c", color: "#fff", borderRadius: "5px", marginTop: "10px" } };
```

---

## ⚡ 2. Tạo hiệu ứng cho các thay đổi bố cục (`layout`)

Khi danh sách thay đổi kích thước hoặc các phần tử dịch chuyển vị trí, chúng thường "nhảy" tức thì đến vị trí mới, tạo ra một sự dịch chuyển bố cục thiếu tự nhiên.

Thêm thuộc tính **`layout`** vào một component `<motion>` sẽ hướng dẫn Framer Motion tự động tạo hiệu ứng cho các thay đổi kích thước hoặc vị trí bằng cách dùng các CSS transform có hiệu năng rất cao:

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ListManager = () => {
  const [items, setItems] = useState([1, 2, 3]);

  const removeItem = (id) => {
    setItems(items.filter((item) => item !== id));
  };

  return (
    <div style={{ maxWidth: "300px", margin: "20px auto" }}>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            layout // 1. Animates items moving up to fill the gap left by deleted item
            key={item}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }} // 2. Slides out right on delete
            onClick={() => removeItem(item)}
            style={listStyles.card}
          >
            Item Card {item} (Click to delete)
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const listStyles = {
  card: { padding: "15px", margin: "10px 0", backgroundColor: "#34495e", color: "#fff", borderRadius: "5px", cursor: "pointer" }
};
```

### 🧐 Vì sao hiệu ứng Layout lại quan trọng — Kỹ thuật FLIP

Tạo hiệu ứng cho bố cục (`width`, `height`, `top`, `left`) theo cách ngây thơ, thiếu tối ưu thì **chậm**. Các thuộc tính như `width` và `top` buộc trình duyệt phải tính toán lại hình học của trang (gọi là "layout" hay "reflow") trên *từng frame một*, gây giật rất nặng. Các thuộc tính transform (`scale`, `translate`) thì **không** — chúng chạy trên bộ tổng hợp (compositor) của GPU và không bao giờ chạm vào layout.

Thuộc tính `layout` giải quyết điều này bằng một mẹo nổi tiếng gọi là **FLIP** — **F**irst, **L**ast, **I**nvert, **P**lay (Đầu tiên, Cuối cùng, Đảo ngược, Phát):

| Bước | Framer Motion làm gì |
| --- | --- |
| **F — First** | Đo hộp bao (bounding box) của phần tử *trước* khi thay đổi (vị trí và kích thước cũ của nó). |
| **L — Last** | Để React áp dụng thay đổi, rồi đo hộp bao *sau* khi thay đổi (vị trí và kích thước mới của nó). |
| **I — Invert** | Tức thì áp dụng một `transform` khiến phần tử *trông như* nó vẫn còn ở vị trí cũ. |
| **P — Play** | Tạo hiệu ứng đưa transform đó về không — để phần tử trông như trượt từ cũ sang mới, nhưng mỗi frame đều là một transform GPU rẻ. |

```text
   FIRST              LAST              INVERT                PLAY
  ┌──────┐         ┌──────┐          ┌──────┐  (visually   ┌──────┐
  │  A   │   -->   │      │   -->    │  A   │   still at    │ ...  │  --> glides
  └──────┘         │      │          └──────┘   old spot)   │  A   │      to new
   (old)           │  A   │           transform             └──────┘      position
                   └──────┘           = old - new
```

> [!NOTE]
> **Hiệu năng cảm nhận (perceived performance)** mới là phần thưởng thực sự. Ngay cả khi tổng khối lượng công việc là tương đương, một hiệu ứng chạy mượt ở 60fps *mang lại cảm giác* nhanh hơn và đáng tin cậy hơn một bước nhảy tức thì, bởi mắt có thể theo dõi sự liền mạch và không bao giờ mất dấu phần tử. Hiệu ứng layout gần như không tốn kém gì (chỉ là các transform thuần) nhưng lại làm cho giao diện trở nên chỉn chu và phản hồi tốt — một lợi ích khổng lồ cho chỉ một thuộc tính `layout`.

---

## ⚡ 3. Chia sẻ bố cục (`layoutId`)

Bạn có thể tạo hiệu ứng chuyển tiếp giữa các component hoàn toàn riêng biệt bằng thuộc tính **`layoutId`**. Khi một component có `layoutId` cụ thể được mount trong lúc một component khác có cùng ID đang được unmount, Framer Motion thực hiện một chuyển tiếp trực quan mượt mà giữa chúng.

Một ví dụ phổ biến là dòng chỉ báo trạng thái đang hoạt động trượt giữa các nút tab điều hướng:

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export const TabMenu = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const tabs = ["Home", "Profile", "Settings"];

  return (
    <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{ position: "relative", border: "none", background: "none", cursor: "pointer", fontSize: "1.1rem" }}
        >
          {tab}
          {activeTab === tab && (
            // 1. Sliding underline indicator moves smoothly between tabs using layoutId
            <motion.div
              layoutId="underline"
              style={{
                position: "absolute",
                bottom: "-5px",
                left: 0,
                right: 0,
                height: "3px",
                backgroundColor: "#e67e22"
              }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};
```

---

## 🎛️ 4. Motion-Value Hook: Điều khiển hiệu ứng bằng lập trình

Ngoài các thuộc tính khai báo, Framer Motion cung cấp các hook cho phép bạn tự tạo và đọc các motion value thô. Đây là nền tảng cho các hiệu ứng liên kết với cuộn, parallax, và các giao diện theo dõi thao tác kéo.

### `useMotionValue` — Tạo giá trị của riêng bạn

`useMotionValue(initial)` trả về một motion value mà bạn toàn quyền điều khiển. Bạn đọc nó bằng `.get()` và cập nhật nó bằng `.set()`. Hãy gắn nó qua thuộc tính **`style`** (không phải `animate`), bởi giờ đây bạn là người điều khiển nó.

```jsx
import { motion, useMotionValue } from 'framer-motion';

export const DragTracker = () => {
  // 1. Create a motion value starting at 0 on the x-axis.
  const x = useMotionValue(0);

  return (
    <motion.div
      drag="x"                                   // Make it draggable horizontally
      dragConstraints={{ left: 0, right: 200 }}  // Limit how far it can travel
      style={{
        x,                                        // 2. Bind the value via style, NOT animate
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#3498db",
        cursor: "grab",
      }}
    />
  );
};
```

> [!TIP]
> Trong khi kéo, Framer Motion ghi vị trí con trỏ trực tiếp (live) vào motion value `x` của bạn. Bạn có thể debug điều này mà không cần re-render React bằng cách gắn `useMotionValueEvent(x, "change", latest => console.log(latest))` — nó kích hoạt trên mỗi frame mà giá trị thay đổi, rẻ hơn rất nhiều so với việc sao chép giá trị vào `useState`.

### `useTransform` — Ánh xạ một khoảng giá trị sang khoảng khác

`useTransform` nhận một motion value nguồn và ánh xạ một **khoảng đầu vào** sang một **khoảng đầu ra**. Đầu ra có thể là số, màu sắc, hay giá trị kèm đơn vị — khiến nó hoàn hảo để suy ra một thuộc tính hiệu ứng từ một thuộc tính khác. Ở đây chúng ta biến khoảng cách kéo ngang thành một sự thay đổi màu sắc:

```jsx
import { motion, useMotionValue, useTransform } from 'framer-motion';

export const DragColorBox = () => {
  const x = useMotionValue(0);

  // 1. Map drag position [-100 .. 100] onto colors [red .. green].
  const backgroundColor = useTransform(
    x,                          // source motion value
    [-100, 0, 100],             // input range
    ["#ff0000", "#ffaa00", "#00ff00"] // output range
  );

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: -100, right: 100 }}
      style={{
        x,
        backgroundColor,        // 2. Derived value drives the background
        width: 120,
        height: 120,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        cursor: "grab",
      }}
    >
      Drag me
    </motion.div>
  );
};
```

### `useScroll` — Theo dõi vị trí cuộn dưới dạng một motion value

`useScroll()` trả về các motion value mô tả trang (hoặc một phần tử mục tiêu) đã cuộn được bao xa. Hữu ích nhất là **`scrollYProgress`**, một giá trị từ `0` (đầu trang) đến `1` (cuộn hết) — lý tưởng cho thanh tiến trình và parallax. Kết hợp nó với `useTransform` để điều khiển bất kỳ thuộc tính nào dựa trên độ sâu cuộn:

```jsx
import { motion, useScroll, useTransform } from 'framer-motion';

export const ScrollProgress = () => {
  // 1. scrollYProgress is a motion value: 0 at the top, 1 at the bottom.
  const { scrollYProgress } = useScroll();

  // 2. Map scroll progress [0 .. 1] to scale [1 .. 1.5] and opacity [1 .. 0].
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <>
      {/* Fixed top progress bar that fills as the user scrolls */}
      <motion.div
        style={{
          scaleX: scrollYProgress, // width follows scroll progress directly
          transformOrigin: "left",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: "#e67e22",
        }}
      />

      {/* A box that scales up and fades out as you scroll down */}
      <div style={{ height: "200vh", display: "grid", placeItems: "center" }}>
        <motion.div
          style={{
            scale,
            opacity,
            width: 120,
            height: 120,
            borderRadius: 16,
            backgroundColor: "#3498db",
          }}
        />
      </div>
    </>
  );
};
```

> [!NOTE]
> Có hai họ hiệu ứng cuộn. Hiệu ứng **kích hoạt bởi cuộn (scroll-triggered)** chạy một lần khi một phần tử đi vào vùng nhìn thấy (dùng thuộc tính `whileInView`). Hiệu ứng **điều khiển bởi cuộn (scroll-driven)** ánh xạ một thuộc tính *liên tục* theo vị trí cuộn (dùng `useScroll` + `useTransform`). Ví dụ ở trên là loại điều khiển bởi cuộn — mỗi pixel cuộn được phản ánh tức thì vào `scale` và `opacity`.

### `useSpring` — Thêm sự làm mượt tự nhiên dựa trên vật lý

Giá trị thô từ `useMotionValue` hoặc `useScroll` bám theo mục tiêu của nó mà không có easing, nên có thể tạo cảm giác máy móc. **`useSpring`** bọc một motion value (hoặc một số thuần) và khiến nó *đuổi theo* mục tiêu của mình bằng một mô hình vật lý lò xo (spring) — mang lại chuyển động mượt mà, hơi nảy nhẹ. Thường thì đây chỉ là một thay đổi gói gọn trong một dòng:

```jsx
import { useScroll, useSpring, motion } from 'framer-motion';

export const SmoothScrollBar = () => {
  const { scrollYProgress } = useScroll();

  // Wrap the raw progress in a spring so the bar eases instead of snapping.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100, // how strongly it pulls toward the target
    damping: 30,    // how quickly the bounce settles
  });

  return (
    <motion.div
      style={{
        scaleX: smoothProgress, // smoothed value -> buttery progress bar
        transformOrigin: "left",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: "#9b59b6",
      }}
    />
  );
};
```

### 🗂️ Bảng tra cứu nhanh so sánh các Hook

| Hook | Tạo ra cái gì | Được điều khiển bởi | Sử dụng điển hình |
| --- | --- | --- | --- |
| `useMotionValue(0)` | Một giá trị *bạn* điều khiển bằng `.get()` / `.set()` | Code của bạn, kéo, con trỏ | Theo dõi kéo, điều khiển thủ công |
| `useTransform(v, [in], [out])` | Một motion value *suy ra (derived)* | Một motion value khác | Ánh xạ kéo/cuộn sang màu, scale, xoay |
| `useScroll()` | `scrollX/Y` + `scrollXProgress/YProgress` | Cuộn trang hoặc phần tử | Thanh tiến trình, parallax, hiển thị dần |
| `useSpring(v, config)` | Một motion value *đã được làm mượt* | Bất kỳ motion value / số nào | Thêm quán tính và easing tự nhiên |

---

## 🌟 5. `mode="wait"` cho các chuyển tiếp tuần tự

Mặc định `AnimatePresence` tạo hiệu ứng cho phần tử rời đi và phần tử đi vào *đồng thời*. Thiết lập `mode="wait"` buộc phần tử mới phải đợi cho đến khi phần tử cũ đã hoàn toàn rời đi — hoàn hảo cho các chuyển tiếp trang/route nơi sự chồng lấn sẽ trông lộn xộn.

```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentPage} // changing key triggers exit + enter
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
  >
    {pageContent}
  </motion.div>
</AnimatePresence>
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về hiệu ứng layout. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao cơ chế render có điều kiện tiêu chuẩn của React khiến hiệu ứng biến mất là bất khả thi, và `AnimatePresence` giải quyết điều này thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong React thông thường, khi một state thay đổi để ẩn một component, React lập tức gỡ bỏ phần tử khỏi DOM, không để lại thời gian nào để chạy các frame chuyển tiếp.
  `AnimatePresence` giải quyết điều này bằng cách can thiệp vào quá trình unmount. Nó trì hoãn việc xóa node DOM cho đến khi transition `exit` của motion con lồng bên trong chạy xong hoàn toàn.
</details>

### 2. Sự khác biệt giữa một motion value mà Framer Motion tạo tự động và một motion value bạn tạo bằng `useMotionValue` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi bạn dùng thuộc tính `animate` (ví dụ `animate={{ x: 200 }}`), Framer Motion tạo và **quản lý** motion value cho bạn — nó tự động dịch chuyển mượt (ease) giá trị đến mục tiêu của nó, đó là lý do tại sao phần tử trượt mượt mà ngay cả khi không có transition.
  Khi bạn tự tạo bằng `useMotionValue` và gắn nó qua thuộc tính `style`, **bạn** chịu trách nhiệm cập nhật nó. Không có easing tự động, nên phần tử nhảy tức thì đến từng giá trị mới. Để khôi phục sự làm mượt trên một giá trị bạn điều khiển, hãy bọc nó trong `useSpring`.
</details>

### 3. Thuộc tính `layout` làm gì ở phía sau hậu trường, và kỹ thuật FLIP là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thuộc tính `layout` tạo hiệu ứng cho các thay đổi vị trí và kích thước bằng các transform được tăng tốc bởi GPU thay vì các thuộc tính kích hoạt layout chậm chạp. Nó dùng **FLIP** — **First** (đo hộp bao cũ), **Last** (để React áp dụng thay đổi và đo hộp bao mới), **Invert** (tức thì áp dụng một transform để phần tử vẫn trông như ở vị trí cũ của nó), và **Play** (tạo hiệu ứng đưa transform đó về không). Kết quả là một sự trượt mượt mà nơi mỗi frame là một `transform` rẻ, không bao giờ là một reflow tốn kém.
</details>

### 4. Bạn muốn một hộp liên tục đổi màu khi người dùng kéo nó sang trái và phải. Bạn kết hợp những hook nào, và như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Dùng `useMotionValue(0)` để tạo một giá trị `x` và gắn nó qua `style` trong khi làm cho phần tử có `drag="x"`. Sau đó dùng `useTransform(x, [-100, 100], ["#ff0000", "#00ff00"])` để ánh xạ khoảng cách kéo (khoảng đầu vào) sang một màu (khoảng đầu ra), và gắn giá trị suy ra đó vào `backgroundColor` qua `style`. Khi việc kéo cập nhật `x`, transform tính toán lại màu trên mỗi frame.
</details>

### 5. `useScroll` trả về cái gì, và làm thế nào để bạn khiến một hiệu ứng liên kết với cuộn cảm thấy mượt mà thay vì nhảy phắt?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useScroll()` trả về các motion value mô tả vị trí cuộn, hữu ích nhất là `scrollYProgress` (một giá trị từ `0` ở đầu trang đến `1` ở cuối trang). Bạn thường đưa nó vào `useTransform` để điều khiển một thuộc tính như `scale` hay `opacity`. Vì giá trị thô bám theo cuộn một cách chính xác và có thể tạo cảm giác máy móc, bạn bọc nó trong `useSpring(scrollYProgress, { stiffness, damping })` để thêm quán tính dựa trên vật lý, tạo ra chuyển động mượt mà, tự nhiên.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Accordion mở rộng với các dịch chuyển bố cục
1. Tạo một component `CollapsibleList.jsx` chứa một danh sách các card.
2. Nhấp vào một card sẽ bật/tắt việc mở rộng nó (hiển thị thêm chi tiết bên trong).
3. Thêm thuộc tính `layout` vào `<motion.div>` của card chứa và tất cả các card danh sách xung quanh.
4. Kiểm tra rằng khi một card mở rộng, các card bên dưới nó trượt xuống mượt mà, và bản thân card thay đổi chiều cao với một hiệu ứng mượt mà thay vì nhảy tức thì.
5. **Mở rộng:** Bọc danh sách trong `<AnimatePresence>` và thêm một hiệu ứng `exit` để khi xóa một card nó trượt ra ngoài trong khi phần còn lại dịch chuyển lại qua `layout`.

### 🛠️ Bài tập 2: Thanh tiến trình liên kết với cuộn được làm mượt bằng Spring
1. Tạo một component `ReadingProgress.jsx`.
2. Thêm một thân trang cao (ví dụ một `div` với `height: 300vh`) để có cái gì đó để cuộn.
3. Gọi `const { scrollYProgress } = useScroll();` để theo dõi người dùng đã cuộn được bao xa.
4. Render một thanh cố định ở đầu trang và gắn `scaleX` của nó vào `scrollYProgress` (đặt `transformOrigin: "left"`).
5. Xác nhận thanh được lấp đầy từ 0% đến 100% khi bạn cuộn từ trên xuống dưới.
6. **Thêm chiều sâu:** Bọc giá trị với `const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });` và gắn thanh vào `smooth` thay vì giá trị gốc. Cuộn nhanh và quan sát cách thanh nhẹ nhàng dịch vào vị trí với quán tính êm ái thay vì bám theo cuộn tức thì.
7. **Mở rộng:** Dùng `useTransform(scrollYProgress, [0, 1], ["#3498db", "#e74c3c"])` để cũng dịch chuyển `backgroundColor` của thanh từ xanh dương sang đỏ khi người đọc gần đến cuối.
