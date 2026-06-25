# Mô hình thiết kế: Thuộc tính Render (Render Props) & Component phức hợp (Compound Components) 📐

Bài học này hướng dẫn hai mô hình thiết kế nâng cao trong React: **Render Props** (chia sẻ logic quản lý trạng thái thông qua việc truyền một hàm làm prop) và **Compound Components** (xây dựng các cấu trúc component Cha-Con liên kết chặt chẽ để tự quản lý state ngầm định).

---

## ⚡ 1. Mô hình Render Props Pattern

Mô hình **Render Props** là kỹ thuật chia sẻ logic xử lý dữ liệu giữa các component bằng cách sử dụng một prop có giá trị là một hàm (function). Thay vì component tự vẽ cứng giao diện (layout HTML) của riêng mình, nó sẽ gọi hàm truyền từ prop và truyền các giá trị state cục bộ làm đối số, nhường quyền thiết kế giao diện UI hoàn toàn cho phía tiêu thụ:

```jsx
import { useState } from 'react';

// Component chứa logic dùng chung: Theo dõi trạng thái bật/tắt
export const Toggle = ({ render }) => {
  const [on, setOn] = useState(false);
  const toggle = () => setOn((prev) => !prev);

  // Gọi hàm render truyền từ prop, truyền các giá trị state làm đối số
  return render(on, toggle);
};
```

### Cách tiêu thụ Render Prop:
```jsx
import { Toggle } from './Toggle';

export const ToggleApp = () => {
  return (
    <div>
      {/* Phía tiêu thụ tự quyết định 100% việc hiển thị thẻ HTML nào và CSS ra sao */}
      <Toggle 
        render={(on, toggle) => (
          <div style={{ padding: "20px", border: "1px solid #ccc" }}>
            <button onClick={toggle}>{on ? "Tắt" : "Bật"}</button>
            {on && <p>💡 Đèn đang sáng!</p>}
          </div>
        )}
      />
    </div>
  );
};
```

---

## ⚡ 2. Mô hình Compound Components Pattern

Mô hình **Compound Components** (Component phức hợp) cho phép bạn thiết kế một nhóm các component phối hợp ăn ý với nhau để chia sẻ state ngầm định và hiển thị một giao diện thống nhất, tương tự cách hoạt động của thẻ `<select>` và `<option>` trong HTML.

Thay vì phải truyền quá nhiều props cấu hình phức tạp (như mảng dữ liệu cấu hình) vào một component khổng lồ duy nhất, bạn có thể tự do viết lồng các component con trực tiếp. Chúng ta triển khai mô hình này bằng cách sử dụng **React Context**:

### Ví dụ về hệ thống Tab Menu phức hợp

#### Bước 1: Tạo component Cha & Khởi tạo Context (`Tabs.jsx`)
```jsx
import React, { createContext, useState, useContext } from 'react';

const TabsContext = createContext();

export const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div style={styles.container}>{children}</div>
    </TabsContext.Provider>
  );
};

// 1. Component con: Nút bấm chuyển đổi Tab (Trigger)
const Trigger = ({ value, children }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      style={{
        padding: "10px 20px",
        backgroundColor: isActive ? "#3498db" : "#ecf0f1",
        color: isActive ? "#fff" : "#2c3e50",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      {children}
    </button>
  );
};

// 2. Component con: Khung hiển thị nội dung (Content)
const Content = ({ value, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div style={styles.content}>{children}</div>;
};

// Gắn các component con vào đối tượng Cha để dễ import và sử dụng
Tabs.Trigger = Trigger;
Tabs.Content = Content;

const styles = {
  container: { border: "1px solid #dfe6e9", borderRadius: "8px", overflow: "hidden", maxWidth: "500px" },
  content: { padding: "20px", backgroundColor: "#fff" }
};
```

#### Bước 2: Sử dụng các Component phức hợp
Quan sát cấu trúc mã nguồn cực kỳ gọn gàng, trực quan và có tính tùy biến bố cục rất cao:

```jsx
import { Tabs } from './Tabs';

export const Dashboard = () => {
  return (
    <Tabs defaultValue="profile">
      {/* 1. Thanh điều hướng chuyển tab */}
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        <Tabs.Trigger value="profile">Cài đặt Cá nhân</Tabs.Trigger>
        <Tabs.Trigger value="security">Bảo mật & Mật khẩu</Tabs.Trigger>
      </div>

      {/* 2. Các khung hiển thị nội dung tương ứng */}
      <Tabs.Content value="profile">
        <h4>Cài đặt thông tin cá nhân</h4>
        <p>Chỉnh sửa tên hiển thị, tải ảnh đại diện...</p>
      </Tabs.Content>
      <Tabs.Content value="security">
        <h4>Quản lý bảo mật</h4>
        <p>Đổi mật khẩu, kích hoạt mã bảo mật 2 lớp...</p>
      </Tabs.Content>
    </Tabs>
  );
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Lợi ích lớn nhất của mô hình Render Props là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó cho phép chia sẻ **logic quản lý trạng thái** (như theo dõi di chuột, biểu mẫu nhập, bộ đếm thời gian) giữa các component khác nhau trong khi vẫn nhường toàn quyền thiết kế giao diện HTML và định dạng CSS cho phía tiêu thụ bên ngoài.
</details>

### 2. Các Component phức hợp (Compound Components) quản lý state ngầm định bằng cách nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Chúng chia sẻ state ngầm định bằng cách sử dụng **React Context**. Component cha (ví dụ `<Tabs>`) bao bọc toàn bộ cây component con trong một Context Provider chứa các biến state và các hàm handler xử lý. Các component con (ví dụ `<Tabs.Trigger>`) gọi hàm `useContext` dưới nền để tự lấy dữ liệu mà không cần bạn phải truyền props thủ công qua từng thẻ.
</details>

### 3. Sự khác biệt giữa thuộc tính Render Prop và thuộc tính `children` thông thường là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Thuộc tính **`children`** đại diện cho các node React đã được render sẵn từ trước. Component cha khó có thể truyền ngược các giá trị state của nó lên cho các children trong khi render.
  - Một **Render Prop** thực chất là một hàm callback. Bằng cách gọi hàm này kèm theo đối số khi render (ví dụ: `render(stateVal)`), component dễ dàng truyền trực tiếp các giá trị state nội bộ của nó ra cho phía tiêu thụ bên ngoài xử lý.
</details>

### 4. Tại sao việc gắn trực tiếp các component con vào đối tượng Cha (ví dụ: `Tabs.Trigger = Trigger`) lại được sử dụng phổ biến?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đây là quy ước đặt tên (namespace convention). Nó báo hiệu cho các lập trình viên khác biết component con đó được thiết kế để chỉ hoạt động đi kèm bên trong component cha. Việc này cũng tối giản cú pháp import, cho phép bạn chỉ cần import component `Tabs` là có thể gọi các con qua dấu chấm: `<Tabs.Trigger />`.
</details>

### 5. Tại sao Custom Hooks thường được ưu tiên hơn Render Props trong các ứng dụng React hiện đại?
<details>
  <summary><b>Reveal Answer</b></summary>

  Render Props yêu cầu viết các hàm callback trực tiếp bên trong cấu trúc giao diện JSX. Khi lồng nhiều Render Props lại với nhau sẽ tạo ra các tầng hàm lồng nhau sâu (tương tự lỗi callback hell), làm cấu trúc JSX cực kỳ khó đọc. Custom Hooks giữ cho cấu trúc JSX phẳng hơn bằng cách khai báo logic state ở phía trên cùng của thân component.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường phát triển của mình:

### 🛠️ Bài tập 1: Xây dựng Khung Accordion phức hợp (Compound Accordion)
1. Tạo một tệp `CompoundAccordion.tsx` (sử dụng đuôi `.tsx`).
2. Khởi tạo một Context `AccordionContext` theo dõi state `openId`.
3. Xây dựng component cha `<Accordion>` và ba component con:
   - `<Accordion.Item value={id}>`: Bao bọc cấu trúc của từng mục.
   - `<Accordion.Header value={id}>`: Nhấp vào sẽ thay đổi state `openId`.
   - `<Accordion.Panel value={id}>`: Chỉ hiển thị nội dung thẻ con nếu `openId === id`.
4. Gắn các component con này vào đối tượng `Accordion` cha.
5. Tiêu thụ component này trong `App.tsx` và đảm bảo việc mở một mục mới sẽ tự động đóng mục cũ ngầm định.
