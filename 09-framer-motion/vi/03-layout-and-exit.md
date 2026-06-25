# Hiệu ứng Bố cục (Layout) & Biến mất (Exit) trong Framer Motion ✨

Trong lập trình React thông thường, các phần tử sẽ được thêm hoặc xóa khỏi cây DOM ngay lập tức khi thực hiện render có điều kiện, khiến việc tạo hiệu ứng khi phần tử biến mất là bất khả thi. Bài học này hướng dẫn về **`AnimatePresence`** (hiệu ứng khi hủy component), thuộc tính **`layout`** (tự động hóa hiệu ứng thay đổi bố cục), và **`layoutId`** (hiệu ứng chia sẻ bố cục giữa các component).

---

## ⚡ 1. Hiệu ứng biến mất với `AnimatePresence`

Để tạo hiệu ứng cho một phần tử khi nó bị xóa khỏi cây DOM, bạn cần:
1. Import và bao bọc khối render có điều kiện trong thẻ **`AnimatePresence`**.
2. Thêm thuộc tính **`exit`** vào component con trực tiếp dạng `<motion>`.
3. Đảm bảo component con đó được thiết lập thuộc tính **`key`** duy nhất để Framer Motion theo dõi chính xác phần tử nào đang bị hủy.

```jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FadeAlert = () => {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => setVisible(!visible)}>Bật/Tắt Thông báo</button>
      
      <AnimatePresence>
        {visible && (
          <motion.div
            key="alert-box" // Bắt buộc phải có key
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }} // 1. Chạy hiệu ứng này trước khi unmount!
            style={styles.alert}
          >
            <h3>Hộp thông báo Alert!</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = { alert: { padding: "15px", backgroundColor: "#e74c3c", color: "#fff", borderRadius: "5px", marginTop: "10px" } };
```

---

## ⚡ 2. Tự động chạy hiệu ứng thay đổi vị trí (`layout`)

Khi danh sách thay đổi kích thước hoặc các phần tử bị dịch chuyển vị trí, chúng thường bị "giật" lập tức đến vị trí mới, tạo cảm giác giao diện thô cứng.

Thêm thuộc tính **`layout`** vào một component `<motion>` sẽ yêu cầu Framer Motion tự động chạy hiệu ứng chuyển dịch kích thước hoặc vị trí một cách mượt mà bằng cách sử dụng các phép biến đổi CSS transform tối ưu:

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
            layout // 1. Tự chạy hiệu ứng trượt mượt mà khi các phần tử dưới đẩy lên thay thế vị trí phần tử bị xóa
            key={item}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }} // 2. Trượt sang phải và biến mất khi bị xóa
            onClick={() => removeItem(item)}
            style={listStyles.card}
          >
            Thẻ thông tin {item} (Click để xóa)
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

---

## ⚡ 3. Chia sẻ bố cục giữa các phần tử khác nhau (`layoutId`)

Bạn có thể tạo hiệu ứng chuyển động mượt mà liên kết giữa hai component hoàn toàn độc lập bằng cách sử dụng thuộc tính **`layoutId`**. Khi một component có thuộc tính `layoutId` được mount đồng thời một component khác có cùng ID đó unmount, Framer Motion sẽ tự động tính toán và tạo hiệu ứng dịch chuyển/biến đổi hình dáng mượt mà giữa chúng.

Một ví dụ phổ biến là thanh trượt gạch chân tab menu điều hướng:

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
            // 1. Dòng gạch chân tự động trượt mượt mà giữa các tab nhờ layoutId chung
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

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao cơ chế render có điều kiện của React khiến hiệu ứng biến mất không thể hoạt động, và `AnimatePresence` giải quyết vấn đề này thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Trong React thông thường, khi trạng thái thay đổi để ẩn một component, React sẽ lập tức gỡ bỏ phần tử đó khỏi DOM ngay tức khắc, không có khoảng thời gian trống để chạy các hiệu ứng chuyển động. 
  `AnimatePresence` giải quyết điều này bằng cách can thiệp vào hành động gỡ bỏ DOM. Nó sẽ trì hoãn việc xóa node DOM cho đến khi hiệu ứng khai báo trong thuộc tính `exit` của component motion con chạy xong hoàn toàn.
</details>

### 2. Thuộc tính `key` đóng vai trò gì khi khai báo bên trong thẻ `<AnimatePresence>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Framer Motion dựa trên thuộc tính `key` để theo dõi vòng đời của từng phần tử trên DOM. Nếu thiếu thuộc tính key duy nhất này, khi React unmount component, Framer Motion sẽ không thể phân biệt được component nào đang rời đi, khiến hiệu ứng unmount trong thuộc tính `exit` không thể kích hoạt.
</details>

### 3. Thuộc tính `layout` thực hiện các tính toán gì dưới nền của Framer Motion?
<details>
  <summary><b>Reveal Answer</b></summary>

  Dưới nền, thuộc tính `layout` đo đạc hộp bao quanh (vị trí tọa độ và kích thước chiều rộng/chiều cao) của phần tử trước và sau khi có sự thay đổi. Sau đó nó tính toán độ chênh lệch và chạy hiệu ứng dịch chuyển mượt mà thông qua các thuộc tính CSS `transform` (scale và translate) được tăng tốc bằng phần cứng GPU, tránh việc trình duyệt phải vẽ lại trang (repaint) gây chậm hiệu năng.
</details>

### 4. Thuộc tính `layoutId` tạo hiệu ứng liên kết giữa hai phần tử độc lập như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi một component chứa thuộc tính `layoutId` xuất hiện trên màn hình, Framer Motion sẽ tìm kiếm một component khác đang biến mất có cùng mã `layoutId` tương ứng. Nếu phát hiện, nó sẽ tạo ra một hiệu ứng chuyển tiếp trực quan, biến đổi kích thước, hình dáng và tọa độ từ vị trí của phần tử cũ sang phần tử mới một cách mượt mà.
</details>

### 5. Việc thiết lập thuộc tính `mode="wait"` trên thẻ `<AnimatePresence>` có tác dụng gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mặc định, các phần tử xuất hiện mới và các phần tử biến mất cũ sẽ chạy hiệu ứng đồng thời. Khi đặt `<AnimatePresence mode="wait">`, component mới xuất hiện sẽ phải đợi cho đến khi component cũ chạy xong hoàn toàn hiệu ứng `exit` và biến mất khỏi DOM rồi mới bắt đầu chạy hiệu ứng xuất hiện của mình. Cách này phù hợp cho việc chuyển trang điều hướng (page routes).
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Khung Accordion co giãn mượt mà tránh giật bố cục
1. Tạo một component `CollapsibleList.jsx` hiển thị danh sách các thẻ bài viết.
2. Khi nhấp vào một thẻ card bất kỳ, hãy phóng to thẻ card đó ra để hiển thị thêm các nội dung chi tiết ẩn bên dưới.
3. Thêm thuộc tính `layout` vào component card dạng `<motion.div>` và các card xung quanh.
4. Kiểm tra để đảm bảo khi một thẻ card mở rộng, các thẻ card bên dưới nó tự trượt xuống một cách mượt mà và bản thân thẻ card thay đổi chiều cao bằng hiệu ứng trượt chứ không bị nhảy bố cục lập tức.
