# Mô hình thiết kế: Render Props, Compound Components & Slots 📐

Bài học này trình bày ba mô hình composition nâng cao trong React: **Render Props** (chia sẻ logic quản lý trạng thái bằng cách dùng một hàm làm prop), **Compound Components** (xây dựng các cấu trúc component Cha-Con liên kết chặt chẽ, tự quản lý state dùng chung một cách ngầm định), và **Slot Pattern** (cho phép component cha chèn nội dung động vào những vùng cụ thể của component con).

---

## 📖 Khái niệm & Tổng quan

Cả ba mô hình đều trả lời cùng một câu hỏi cốt lõi: **"Làm thế nào để một component vừa linh hoạt, vừa tái sử dụng được mà không bị chìm ngập trong props?"** Thay vì viết cứng layout và hành vi, các mô hình này trao quyền điều khiển lại cho phía tiêu thụ component.

Một phép ẩn dụ hữu ích từ đời thực là một **cửa hàng khung tranh** 🖼️:

- **Render Prop** giống như việc đưa cho khách một cái khung rỗng kèm theo *số đo* của bức tường, và nói "bạn vẽ gì tùy ý, đây là kích thước bạn được phép làm việc trong đó." Cửa hàng sở hữu việc đo đạc (logic/state); khách hàng sở hữu tác phẩm (UI).
- **Compound Component** giống như một *hệ thống kệ lắp ghép theo module* (hãy nghĩ đến IKEA): thanh ray, giá đỡ và mặt kệ được bán riêng nhưng được thiết kế để ráp khớp vào nhau. Mỗi mảnh ghép âm thầm biết cách giao tiếp với những mảnh khác thông qua các rãnh ẩn (Context) — bạn không bao giờ phải đấu nối chúng bằng tay.
- **Slot** giống như một *khung ảnh vật lý với các ô cắt sẵn*: một ô lớn cho tấm ảnh chính (slot `children` mặc định), và những ô nhỏ hơn có nhãn dành cho chú thích, dấu ngày tháng, hoặc logo (các slot có tên). Bạn chỉ việc thả nội dung vào từng ô.

> [!NOTE]
> Đây là các **mô hình composition**, không phải API của React. React cung cấp cho bạn các primitive (`children`, `props`, `Context`) — còn *mô hình* là những quy ước để phối hợp các primitive đó. Riêng Slots **không phải là native trong React**: khác với `<slot>` của Vue hay Shadow DOM của Web Components, React giả lập slot bằng các props thông thường.

> [!TIP]
> Trong React hiện đại, **custom hooks** đã phần lớn thay thế mô hình Render Props cho việc chia sẻ *logic*, trong khi **Compound Components** và **Slots** vẫn là cách tiêu chuẩn để chia sẻ *sự linh hoạt về layout*. Hãy dùng hooks khi bạn cần hành vi; dùng compounds/slots khi bạn cần composition.

### Khi nào dùng cái nào?

| Mô hình | Chia sẻ… | Cơ chế | Phù hợp nhất cho |
| --- | --- | --- | --- |
| **Render Props** | **Logic** quản lý trạng thái | Một prop dạng hàm được gọi trong lúc render | Mouse tracker, data fetcher, toggle nơi phía tiêu thụ tự thiết kế UI |
| **Compound Components** | **State** ngầm định giữa các thành phần anh em | Cha + các sub-component + `Context` | `<Tabs>`, `<Accordion>`, `<Select>` — các nhóm element phối hợp với nhau |
| **Slots** | **Vị trí đặt nội dung** | `children` và/hoặc các prop JSX có tên | Card, modal, layout có các vùng cố định (header / body / footer) |

```
                    ┌─────────────────────────────┐
   Consumer  ──────▶│  Reusable Component          │
   (your app)       │                              │
                    │  Render Prop  → calls render(state)
                    │  Compound     → shares state via Context
                    │  Slot         → places children/props into regions
                    └─────────────────────────────┘
```

---

## ⚡ 1. Mô hình Render Props Pattern

Mô hình **Render Props** là kỹ thuật chia sẻ logic quản lý trạng thái giữa các component bằng cách dùng một prop có giá trị là một hàm. Thay vì tự render layout viết cứng của riêng mình, component sẽ gọi prop dạng hàm và truyền các giá trị state cục bộ của nó làm đối số, nhường lại việc thiết kế layout UI cho phía tiêu thụ:

```jsx
import { useState } from 'react';

// Shared Logic Component: Tracks toggle status
export const Toggle = ({ render }) => {
  const [on, setOn] = useState(false);
  const toggle = () => setOn((prev) => !prev);

  // Calls the render function prop, passing states as arguments
  return render(on, toggle);
};
```

### Cách tiêu thụ Render Prop:
```jsx
import { Toggle } from './Toggle';

export const ToggleApp = () => {
  return (
    <div>
      {/* Consumer decides EXACTLY what elements and styles to render */}
      <Toggle 
        render={(on, toggle) => (
          <div style={{ padding: "20px", border: "1px solid #ccc" }}>
            <button onClick={toggle}>{on ? "Turn Off" : "Turn On"}</button>
            {on && <p>💡 The light is on!</p>}
          </div>
        )}
      />
    </div>
  );
};
```

### Một ví dụ kinh điển: Mouse Tracker

Một component `MouseTracker` sở hữu *logic* lắng nghe chuyển động của chuột, nhưng để phía tiêu thụ tự quyết định cách *hiển thị* vị trí:

```tsx
import { useState } from 'react';

interface Position {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  // The render prop receives the current position and returns JSX
  render: (position: Position) => React.ReactNode;
}

export const MouseTracker = ({ render }: MouseTrackerProps) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    // Capture the cursor coordinates from the event object
    setPosition({ x: event.clientX, y: event.clientY });
  };

  // Fill the full viewport height so there is room to move the mouse
  return (
    <div style={{ height: "100vh" }} onMouseMove={handleMouseMove}>
      {render(position)}
    </div>
  );
};

// Consumer decides the presentation
export const App = () => (
  <MouseTracker
    render={(position) => (
      <p>Mouse is at X: {position.x}, Y: {position.y}</p>
    )}
  />
);
```

---

## ⚡ 2. Mô hình Compound Components Pattern

Mô hình **Compound Components** cho phép bạn thiết kế một nhóm component phối hợp ăn ý với nhau để chia sẻ state ngầm định và render ra một giao diện thống nhất, tương tự thẻ `<select>` và `<option>` trong HTML.

Thay vì truyền nhiều props phức tạp (như các cấu hình dữ liệu dạng mảng) vào một component khổng lồ duy nhất, bạn viết lồng các sub-component con trực tiếp. Chúng ta triển khai điều này bằng **React Context**:

### Ví dụ về hệ thống Tab phức hợp

#### Bước 1: Tạo component Cha & Context (`Tabs.jsx`)
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

// 1. Child Sub-Component: Trigger tab change
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

// 2. Child Sub-Component: Conditionally render layout
const Content = ({ value, children }) => {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div style={styles.content}>{children}</div>;
};

// Bind sub-components to parent object for clean namespace imports
Tabs.Trigger = Trigger;
Tabs.Content = Content;

const styles = {
  container: { border: "1px solid #dfe6e9", borderRadius: "8px", overflow: "hidden", maxWidth: "500px" },
  content: { padding: "20px", backgroundColor: "#fff" }
};
```

#### Bước 2: Sử dụng các Compound Component
Hãy quan sát cấu trúc markup gọn gàng, dễ đọc và có khả năng tùy biến cao đến mức nào:

```jsx
import { Tabs } from './Tabs';

export const Dashboard = () => {
  return (
    <Tabs defaultValue="profile">
      {/* 1. Trigger list navigation */}
      <div style={{ display: "flex", borderBottom: "1px solid #ccc" }}>
        <Tabs.Trigger value="profile">Profile Settings</Tabs.Trigger>
        <Tabs.Trigger value="security">Password & Security</Tabs.Trigger>
      </div>

      {/* 2. Display panels */}
      <Tabs.Content value="profile">
        <h4>User Profile Settings</h4>
        <p>Edit username, upload avatar...</p>
      </Tabs.Content>
      <Tabs.Content value="security">
        <h4>Security Controls</h4>
        <p>Update keys, activate 2FA codes...</p>
      </Tabs.Content>
    </Tabs>
  );
};
```

---

## 🧩 3. Mô hình Slot Pattern

Một **slot** cho phép một component nhận nội dung động từ component cha và đặt nội dung đó vào một vùng cụ thể trong layout của chính nó. Vì React **không có cơ chế slot tích hợp sẵn** (khác với Vue hay Web Components), chúng ta tạo ra slot bằng **props** — hoặc là prop đặc biệt `children`, hoặc là các prop JSX có tên.

> [!WARNING]
> Đừng nhầm lẫn mô hình Slot với việc "truyền props." Đặc điểm nhận dạng của một slot là giá trị được truyền vào là **JSX/nội dung có thể render được**, hướng đến một *vùng cụ thể* của layout — chứ không phải dữ liệu cấu hình như `color="red"` hay `size={12}`. Nếu bạn thấy mình đang truyền các chuỗi xuống chỉ để dựng lại đúng JSX đó bên trong, thì có lẽ bạn nên dùng slot thay thế.

Có bốn biến thể, đi từ đơn giản nhất đến mạnh mẽ nhất:

| Loại slot | Truyền qua | Số vùng | Chia sẻ state |
| --- | --- | --- | --- |
| **Mặc định (vô danh)** | `children` | Một | Không |
| **Có tên** | Các prop JSX tùy chỉnh | Nhiều (cố định) | Không |
| **Phức hợp** | Các sub-component, mỗi cái nhận `children` | Nhiều (có thể compose) | Không |
| **Slot với Context** | `children` + một Provider | Nhiều | Có (dùng chung) |

### 🟢 3.1 Slot mặc định (prop `children`)

**Slot mặc định** — còn gọi là *slot vô danh* — đơn giản chính là prop `children`. Bất cứ thứ gì bạn đặt giữa thẻ mở và thẻ đóng của một component đều được truyền vào dưới dạng `children`:

```tsx
// Card.tsx
interface CardProps {
  children: React.ReactNode;
}

export const Card = ({ children }: CardProps) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
      {/* Default slot: render whatever the parent passed in */}
      {children}
    </div>
  );
};
```

```tsx
// App.tsx — anything between the tags lands in the default slot
import { Card } from './Card';

export const App = () => (
  <Card>
    <h1>This is my card title</h1>
    <p>This is my card content</p>
    <button>Learn more</button>
  </Card>
);
```

### 🟡 3.2 Slot có tên (JSX truyền qua props)

Một **slot có tên** là một prop với tên mô tả mà giá trị của nó là **JSX**. Điều này cho phép component cha lấp đầy nhiều vùng riêng biệt, và để component con quyết định *nơi* mỗi vùng được render:

```tsx
// Card.tsx
interface CardProps {
  cardTitle: React.ReactNode;   // named slot 1
  cardContent: React.ReactNode; // named slot 2
  cardButton: React.ReactNode;  // named slot 3
}

export const Card = ({ cardTitle, cardContent, cardButton }: CardProps) => {
  return (
    <div style={{ border: "1px solid #ccc", padding: "16px" }}>
      <header>{cardTitle}</header>
      <section>{cardContent}</section>
      <footer>{cardButton}</footer>
    </div>
  );
};
```

```tsx
// App.tsx — each prop receives a chunk of JSX
import { Card } from './Card';

export const App = () => (
  <Card
    cardTitle={<h1>This is my card title</h1>}
    cardContent={<p>This is my card content</p>}
    cardButton={
      <button style={{ background: "#000", color: "#fff" }}>Learn more</button>
    }
  />
);
```

> [!TIP]
> Slot có tên rất phù hợp khi một layout có **một tập hợp vùng cố định** (ví dụ `header`, `body`, `footer`) và bạn muốn đảm bảo ở cấp độ type rằng mỗi vùng đều được cung cấp. TypeScript sẽ báo cho bạn nếu thiếu `cardTitle`.

### 🟠 3.3 Slot phức hợp (sub-component với `children`)

Bạn có thể kết hợp mô hình Slot với Compound Components. Thay vì dùng các prop có tên, bạn cung cấp một sub-component cho **mỗi vùng**, và mỗi sub-component render `children` của riêng nó. Cách này đọc tự nhiên hơn dưới dạng JSX và có thể compose hoàn toàn:

```tsx
// CardTitle.tsx
export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 style={{ fontSize: "1.5rem" }}>{children}</h1>
);

// CardContent.tsx
export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <p style={{ marginTop: "0.5rem" }}>{children}</p>
);

// CardButton.tsx
export const CardButton = ({ children }: { children: React.ReactNode }) => (
  <button style={{ background: "#000", color: "#fff" }}>{children}</button>
);
```

```tsx
// Card.tsx — wire the sub-components onto the parent as a namespace
import { CardTitle } from './CardTitle';
import { CardContent } from './CardContent';
import { CardButton } from './CardButton';

export const Card = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Attach each "slot" as a compound property
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Button = CardButton;
```

```tsx
// App.tsx — fill each slot declaratively
import { Card } from './Card';

export const App = () => (
  <Card>
    <Card.Title>Card title</Card.Title>
    <Card.Content>Card content goes here</Card.Content>
    <Card.Button>Click me</Card.Button>
  </Card>
);
```

### 🔴 3.4 Slot phức hợp với Context

Khi các sub-component được slot cần **chia sẻ state** (ví dụ đọc một giá trị hoặc kích hoạt một cập nhật), hãy đấu nối chúng với nhau bằng **Context** — chính cỗ máy đứng sau compound components. Đây là biến thể slot mạnh mẽ nhất.

```tsx
// context/MyContext.tsx
import { createContext, useState } from 'react';

interface MyContextType {
  value: string;
  setValue: (next: string) => void;
}

// Initialize as undefined so a missing provider is detectable
export const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState("Hello from Context");

  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
};
```

```tsx
// hooks/useMyContext.ts
import { useContext } from 'react';
import { MyContext } from '../context/MyContext';

export const useMyContext = () => {
  const context = useContext(MyContext);

  // Guard: this hook must run inside a provider
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
```

```tsx
// components/SlotComponent.tsx — a slot that READS shared state
import { useMyContext } from '../hooks/useMyContext';

export const SlotComponent = ({ children }: { children: React.ReactNode }) => {
  const { value } = useMyContext();

  return (
    <div>
      <h3>Context value: {value}</h3>
      {/* This nested slot can hold any content */}
      <div>{children}</div>
    </div>
  );
};
```

```tsx
// components/SlotContent.tsx — a slot that UPDATES shared state
import { useMyContext } from '../hooks/useMyContext';

export const SlotContent = () => {
  const { setValue } = useMyContext();

  return (
    <button onClick={() => setValue("New value from SlotContent component")}>
      Update context value
    </button>
  );
};
```

```tsx
// App.tsx — wrap the tree, then nest slots freely
import { MyProvider } from './context/MyContext';
import { SlotComponent } from './components/SlotComponent';
import { SlotContent } from './components/SlotContent';

export const App = () => (
  <MyProvider>
    <SlotComponent>
      <SlotContent />
    </SlotComponent>
  </MyProvider>
);
```

Khi bạn nhấn nút, `SlotContent` gọi `setValue`, Context cập nhật, và `SlotComponent` render lại với đoạn text mới — dù không component nào nhận được giá trị đó qua props. Đây chính là mô hình slot và mô hình compound phối hợp cùng nhau.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về các mô hình nâng cao này. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Lợi ích chính của mô hình Render Props là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó cho phép bạn chia sẻ **logic quản lý trạng thái** (như theo dõi di chuột, giá trị form, trạng thái timer) giữa các component, đồng thời trao cho component cha toàn quyền quyết định bố cục markup hiển thị và định dạng CSS.
</details>

### 2. Các Compound Component quản lý state ngầm định bằng cách nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Chúng quản lý state ngầm định bằng cách dùng **React Context**. Component cha (ví dụ `<Tabs>`) bao bọc cây component trong một Context Provider chứa các state active và các handler. Các sub-component con (ví dụ `<Tabs.Trigger>`) gọi `useContext` dưới nền để tự động truy cập các cấu hình, loại bỏ nhu cầu phải truyền props xuống thủ công.
</details>

### 3. Slots có phải là tính năng tích hợp sẵn của React không, và bốn biến thể slot được phân biệt như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  **Không** — React không có cơ chế slot native (khác với `<slot>` của Vue hay Shadow DOM của Web Components). Slot được *giả lập* bằng props. Bốn biến thể là:
  - **Slot mặc định (vô danh)** → prop `children`; một vùng duy nhất.
  - **Slot có tên** → các prop tùy chỉnh có giá trị là JSX, cho phép nhiều vùng cố định.
  - **Slot phức hợp** → một sub-component cho mỗi vùng, mỗi cái render `children` của riêng nó.
  - **Slot với Context** → các slot phức hợp đồng thời chia sẻ state qua một Context Provider.
</details>

### 4. Tại sao việc gắn các sub-component vào đối tượng cha (ví dụ `Tabs.Trigger = Trigger`) lại là một thông lệ phổ biến?
<details>
  <summary><b>Reveal Answer</b></summary>

  Đây là một quy ước tổ chức namespace. Nó báo hiệu cho các lập trình viên khác rằng sub-component đó được thiết kế để hoạt động độc quyền như một con của component cha. Nó cũng đơn giản hóa việc import, cho phép lập trình viên chỉ cần import `Tabs` và truy cập các sub-component qua cú pháp dấu chấm: `<Tabs.Trigger />`.
</details>

### 5. Khi nào bạn nên chọn **slot có tên** thay vì **slot mặc định (`children`)**, và tại sao custom hooks thường được ưu tiên hơn Render Props?
<details>
  <summary><b>Reveal Answer</b></summary>

  - Hãy chọn **slot có tên** khi một layout có **nhiều vùng riêng biệt** (ví dụ header, body, footer) mà mỗi vùng phải được lấp đầy độc lập — một slot `children` duy nhất chỉ có thể nhắm đến một vùng, và slot có tên còn cho phép TypeScript đảm bảo rằng mọi vùng đều được cung cấp.
  - **Custom Hooks** được ưu tiên hơn Render Props vì render props yêu cầu viết các hàm callback trực tiếp bên trong cây JSX. Việc lồng nhiều render props tạo ra các tầng hàm sâu (kiểu callback-hell với thụt lề lồng nhau) làm giảm khả năng đọc hiểu. Custom Hooks giữ cho JSX phẳng bằng cách khai báo logic ở đầu thân hàm.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Xây dựng Compound Accordion Component
1. Tạo một tệp `CompoundAccordion.tsx` (dùng đuôi `.tsx`).
2. Thiết lập một React Context `AccordionContext` theo dõi state `openId`.
3. Xây dựng một component cha `<Accordion>` và ba sub-component:
   - `<Accordion.Item value={id}>`: Bao bọc layout của từng mục.
   - `<Accordion.Header value={id}>`: Kích hoạt thay đổi state khi nhấp.
   - `<Accordion.Panel value={id}>`: Chỉ render nội dung con lồng nhau nếu `openId === id`.
4. Đăng ký chúng làm các compound property trên `Accordion`.
5. Tiêu thụ các component trong `App.tsx` và xác minh rằng việc mở một mục sẽ ngầm định thu gọn các mục khác.

### 🛠️ Bài tập 2: Xây dựng `<PageLayout>` có slot (slot có tên + slot mặc định)
Luyện tập kết hợp các biến thể slot trong một component.

1. Tạo `PageLayout.tsx`. Nó nên nhận **hai slot có tên** (`header` và `sidebar`, cả hai có kiểu `React.ReactNode`) và một **slot mặc định** (`children`) cho vùng nội dung chính.
2. Render layout dưới dạng một CSS grid: `header` chạy ngang phía trên, `sidebar` ở bên trái, và `children` lấp đầy vùng chính.
   ```tsx
   interface PageLayoutProps {
     header: React.ReactNode;   // named slot
     sidebar: React.ReactNode;  // named slot
     children: React.ReactNode; // default slot
   }
   ```
3. Trong `App.tsx`, truyền một `<nav>` vào `header`, một danh sách link vào `sidebar`, và đặt phần thân trang giữa các thẻ để nó chảy vào slot mặc định.
4. **Mục tiêu nâng cao:** chuyển các slot có tên thành **slot phức hợp với Context**. Thêm một hook `useTheme()` được hậu thuẫn bởi một `ThemeProvider`, cung cấp các sub-component `<PageLayout.Header>` và `<PageLayout.Sidebar>`, và để header render một nút chuyển đổi giá trị `theme` được chia sẻ qua Context. Xác nhận rằng sidebar phản ứng với thay đổi theme mà không nhận bất kỳ props nào.
