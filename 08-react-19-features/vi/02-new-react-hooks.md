# Các Hook mới trong React 19 & API `use` 🔥

React 19 giới thiệu một nhóm các hook và mô hình API mạnh mẽ được thiết kế để điều phối các luồng xử lý form bất đồng bộ phức tạp, cập nhật hiển thị theo kiểu optimistic, các chuyển đổi UI không chặn (non-blocking), và nạp tài nguyên động trực tiếp bên trong cây render của component.

---

## 🧭 Khái niệm & Tổng quan

Trước React 19, việc xây dựng một form giao tiếp với server đồng nghĩa với việc bạn phải tự tay xoay sở nhiều cờ `useState`: một cho dữ liệu, một cho `isLoading`, một cho thông báo lỗi, và lại thêm một cái nữa để cập nhật UI theo kiểu optimistic. React 19 gom toàn bộ đống boilerplate đó vào một tập nhỏ các hook chuyên dụng (`useActionState`, `useFormStatus`, `useOptimistic`, `useTransition`) cùng với API `use` mới.

**Phép ẩn dụ thực tế — căn bếp nhà hàng:** 🍳
Hãy tưởng tượng bạn gọi món ở một nhà hàng đông khách.

- `useActionState` là **người phục vụ** nhận đơn của bạn (action), mang nó vào bếp, rồi quay lại với kết quả — và có thể báo cho bạn "vẫn đang nấu" (`isPending`) trong suốt quá trình đó.
- `useFormStatus` là **bảng trạng thái của bếp** mà bất kỳ đầu bếp nào cũng có thể liếc qua để biết một đơn hàng có đang được xử lý hay không, mà không cần người phục vụ phải đích thân báo cho từng người.
- `useOptimistic` là **giỏ bánh mì** được đặt lên bàn của bạn *ngay lập tức* để bữa ăn có cảm giác như đã bắt đầu, ngay cả trước khi món chính được xác nhận.
- `useTransition` là **người điều phối** cho phép các tác vụ khẩn cấp (ai đó xin thêm nước) chen lên trước một đơn hàng số lượng lớn chậm chạp, để phòng ăn không bao giờ bị đóng băng.
- `use` là một **người chạy việc linh hoạt** có thể lấy một tài nguyên (một Promise) hoặc đọc một thông báo được dán lên (Context) theo yêu cầu, thậm chí ngay giữa chừng một tác vụ.

> [!NOTE]
> `useActionState` và `useOptimistic` được import từ `react`, nhưng **`useFormStatus` được import từ `react-dom`**. Nhầm lẫn những điều này là một trong những lỗi phổ biến nhất của người mới bắt đầu với React 19.

> [!TIP]
> Các hook này được thiết kế để hoạt động cùng nhau. Một form React 19 điển hình dùng `useActionState` trên `<form>` cha, một `<SubmitButton>` lồng bên trong được vận hành bởi `useFormStatus`, và `useOptimistic` để render mục đang chờ xử lý ngay tức thì. Chúng bổ trợ cho nhau, chứ không cạnh tranh nhau.

> [!WARNING]
> API `use` có thể đọc một Promise trong lúc render, điều này có nghĩa là nó có thể khiến component **suspend** (tạm dừng). Bất kỳ component nào gọi `use(promise)` BẮT BUỘC phải có một ranh giới `<Suspense>` ở đâu đó phía trên nó, nếu không React sẽ ném lỗi.

### So sánh nhanh

| Hook / API | Import từ | Nhiệm vụ chính | Có trả về cờ pending không? |
| :--- | :--- | :--- | :--- |
| `useActionState` | `react` | Bao bọc một async action + theo dõi trạng thái của nó | ✅ `isPending` (phần tử thứ 3) |
| `useFormStatus` | `react-dom` | Đọc trạng thái của `<form>` cha từ một component con | ✅ `pending` (trường của object) |
| `useOptimistic` | `react` | Render ngay lập tức một kết quả dự kiến | ❌ (bạn tự mô hình hóa `sending`) |
| `useTransition` | `react` | Đánh dấu các cập nhật state là non-blocking | ✅ `isPending` (phần tử thứ 1) |
| `use` | `react` | Resolve một Promise hoặc Context trong lúc render | ❌ (suspend thông qua `<Suspense>`) |

---

## ⚡ 1. `useActionState` (Hàm bao bọc trạng thái form bất đồng bộ)

Trước đây được gọi là `useFormState` trong các bản experimental, **`useActionState`** là hook chính để xử lý các form. Nó bao bọc một hàm async action tùy chỉnh và trả về:
1. **State**: Kết quả trả về hiện tại của action (được khởi tạo với bất kỳ giá trị mặc định nào bạn đặt).
2. **Form Action Wrapper**: Một phiên bản đã được bao bọc của action để truyền trực tiếp vào `<form action={formAction}>`.
3. **`isPending`**: Một cờ boolean tích hợp sẵn cho biết async action có đang thực thi hay không.

```jsx
import { useActionState } from 'react';

// 1. Define the action function: receives (previousState, formData)
const subscribeUser = async (prevState, formData) => {
  const email = formData.get("email");

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!email.includes("@")) {
    return { success: false, message: "Invalid email address!" };
  }
  return { success: true, message: `Subscribed ${email} successfully! 🎉` };
};

export const NewsletterForm = () => {
  // 2. Initialize useActionState: returns [state, formAction, isPending]
  const [state, formAction, isPending] = useActionState(subscribeUser, { success: false, message: "" });

  return (
    <form action={formAction} style={styles.card}>
      <h3>Newsletter Subscribe</h3>
      <input type="email" name="email" placeholder="Your email..." required />

      <button type="submit" disabled={isPending}>
        {isPending ? "Subscribing..." : "Subscribe"}
      </button>

      {state.message && (
        <p style={{ color: state.success ? "green" : "red", marginTop: "10px" }}>
          {state.message}
        </p>
      )}
    </form>
  );
};

const styles = { card: { maxWidth: "300px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "5px" } };
```

---

## ⚡ 2. `useFormStatus` (Theo dõi Context của form)

**`useFormStatus`** là một context hook. Nó cho phép các phần tử con lồng sâu bên trong một `<form>` tự động phát hiện xem form cha có đang ở trạng thái pending hay không, mà bạn không cần phải truyền state props xuống thủ công:

```jsx
import { useFormStatus } from 'react-dom';

// This component MUST be rendered inside a <form> ancestor
export const SubmitButton = () => {
  // The hook reads the status of the closest parent <form>
  const { pending, data, method, action } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "Saving Changes..." : "Save"}
    </button>
  );
};
```

> [!WARNING]
> `useFormStatus` đọc trạng thái của **`<form>` cha gần nhất** — giống như một Context consumer tìm kiếm ngược lên trên. Nếu bạn gọi nó bên trong chính component *render* ra thẻ `<form>`, thì form đó không phải là tổ tiên (ancestor) và `pending` sẽ luôn là `false`. Hãy luôn đặt hook này trong một component **con**.

### 🔍 `useFormStatus` (dựa trên context) vs `isPending` từ `useActionState` (giá trị trả về của hook)

Cả hai đều cho bạn biết "form có đang bận không?" — nhưng chúng lấy câu trả lời theo những cách hoàn toàn khác nhau. Việc chọn đúng cái nào phụ thuộc vào *vị trí* nút bấm của bạn nằm ở đâu trong cây.

| Khía cạnh | `useFormStatus().pending` | `isPending` từ `useActionState` |
| :--- | :--- | :--- |
| **Cách bạn lấy được nó** | Đọc nó từ React **Context** của `<form>` cha gần nhất | Được trả về **trực tiếp** dưới dạng phần tử thứ 3 của hook |
| **Nơi bạn có thể dùng nó** | Trong một component **con** lồng bên trong `<form>` | Chỉ trong component đã **gọi** `useActionState` |
| **Nguồn import** | `react-dom` | `react` |
| **Có cần action không?** | Không — nó không biết action nào đã chạy | Có — nó gắn liền với action cụ thể đã được bao bọc |
| **Phù hợp nhất cho** | `<SubmitButton>` tái sử dụng được, dùng chung cho nhiều form | Hiển thị trạng thái/kết quả ngay cạnh phần định nghĩa form |
| **Dữ liệu bổ sung được phơi bày** | `data`, `method`, `action` của lần submit | Chỉ giá trị boolean + `state` bạn trả về |

> [!TIP]
> Dùng **`isPending` của `useActionState`** khi nút bấm và form nằm trong cùng một component. Hãy chọn **`useFormStatus`** khi bạn muốn một nút submit *tách rời, tái sử dụng được* mà có thể thả vào bất kỳ form nào mà không cần prop drilling.

---

## ⚡ 3. `useOptimistic` (Cập nhật UI theo kiểu optimistic tức thì)

**`useOptimistic`** là một hook được thiết kế để khiến giao diện người dùng có cảm giác tức thời. Trong các cập nhật API bất đồng bộ (như gửi một tin nhắn chat), nó cho phép bạn tạm thời render ngay lập tức kết quả "thành công" được dự kiến. Nếu API thành công, state thật sẽ được render; nếu thất bại, nó sẽ quay lại (rollback):

```jsx
import { useOptimistic, useState } from 'react';

export const ChatApp = () => {
  const [messages, setMessages] = useState([{ id: 1, text: "Hello!" }]);

  // Create optimistic state
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    // Reducer-like function: merges existing array with a temporary element
    (state, newText) => [...state, { id: Date.now(), text: newText, sending: true }]
  );

  const sendMessageAction = async (formData) => {
    const text = formData.get("message");
    if (!text.trim()) return;

    // 1. Immediately trigger the optimistic UI update
    addOptimisticMessage(text);

    // 2. Perform real async API fetch
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay

    // 3. Confirm in actual component state
    setMessages((prev) => [...prev, { id: Date.now(), text }]);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h3>Chat (useOptimistic)</h3>
      <div style={{ border: "1px solid #ccc", height: "200px", padding: "10px", overflowY: "auto", marginBottom: "15px" }}>
        {optimisticMessages.map((msg) => (
          <p key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
            {msg.text} {msg.sending && <small>(sending...)</small>}
          </p>
        ))}
      </div>
      <form action={sendMessageAction}>
        <input type="text" name="message" placeholder="Type a message..." required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
```

---

## ⚡ 4. `useTransition` (Cập nhật non-blocking & render trì hoãn)

Một số cập nhật state kích hoạt các lần render tốn kém — hãy tưởng tượng việc nhấp vào một tab mà mount hàng trăm card. Nếu không có sự trợ giúp, React render cập nhật đó **một cách đồng bộ và chặn luồng chính (main thread)**: toàn bộ UI bị đóng băng, và bạn không thể nhấp vào bất cứ thứ gì khác cho đến khi lần render nặng nề kết thúc.

**`useTransition`** cho phép bạn đánh dấu một cập nhật state là một **transition** có độ ưu tiên thấp. React giữ cho UI luôn phản hồi — các tương tác khẩn cấp (nhấp chuột, gõ phím) chen lên trước, trong khi cập nhật tốn kém được render ở chế độ nền. Nó trả về một tuple:
1. **`isPending`**: một boolean có giá trị `true` trong khi cập nhật trì hoãn đang được render.
2. **`startTransition`**: một hàm mà bạn bao bọc cập nhật state chậm của mình bên trong.

> [!NOTE]
> `useTransition` KHÔNG làm cho việc render nhanh hơn. Nó khiến ứng dụng *có cảm giác* nhanh hơn bằng cách giữ cho nó có thể bị ngắt quãng (interruptible). Bạn hiếm khi cần đến nó — chỉ khi một thay đổi state đơn lẻ kích hoạt một lần render thực sự nặng nề mà nếu không thì sẽ khóa cả trang.

### Vấn đề (khi không có `useTransition`)

```jsx
import { useState } from 'react';
import { Home } from './components/Home';
import { Post } from './components/Post';
import { Contact } from './components/Contact';

export const App = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <Home />;
      case "post": return <Post />;   // <-- renders hundreds of heavy items
      case "contact": return <Contact />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="tabs">
        {/* Clicking "post" freezes the whole UI until everything renders */}
        <button onClick={() => setActiveTab("home")}>Home</button>
        <button onClick={() => setActiveTab("post")}>Post</button>
        <button onClick={() => setActiveTab("contact")}>Contact</button>
      </div>
      <div className="content">{renderContent()}</div>
    </div>
  );
};
```

### Cách khắc phục (với `useTransition`)

```jsx
import { useState, useTransition } from 'react';
import { Home } from './components/Home';
import { Post } from './components/Post';
import { Contact } from './components/Contact';

export const App = () => {
  const [activeTab, setActiveTab] = useState("home");

  // isPending: true while the deferred render is in flight
  // startTransition: wraps the non-urgent state update
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tab) => {
    // Mark this state update as a low-priority transition.
    // The UI stays interactive while <Post /> renders in the background.
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <Home />;
      case "post": return <Post />;
      case "contact": return <Contact />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="tabs">
        <button onClick={() => handleTabChange("home")}>Home</button>
        <button onClick={() => handleTabChange("post")}>Post</button>
        <button onClick={() => handleTabChange("contact")}>Contact</button>
      </div>

      {/* While the heavy tab renders, show a non-blocking indicator */}
      {isPending && <p>Loading...</p>}

      <div className="content">{renderContent()}</div>
    </div>
  );
};
```

> [!WARNING]
> Chỉ bao bọc các **cập nhật state** trong `startTransition`, không bao giờ bao bọc các side effect như thao tác thay đổi dữ liệu (data mutation) hoặc các fetch được `await` mà bạn phụ thuộc vào để đảm bảo thứ tự. Callback nên là đồng bộ và chứa các lời gọi `setState`. Đối với công việc async phía server, hãy ưu tiên `useActionState`.

---

## ⚡ 5. API `use` (Bộ resolve Promise & Context có điều kiện)

Trước React 19, các hook phải tuân theo quy tắc nghiêm ngặt về việc gọi ở cấp cao nhất (top-level) và không thể được sử dụng có điều kiện bên trong các câu lệnh `if` hoặc các vòng lặp lồng nhau.

API **`use`** là một mô hình mới có thể đọc Promise hoặc giá trị Context trực tiếp **trong lúc render, một cách có điều kiện**:

```jsx
import { use, Suspense } from 'react';

// Resolves a Context conditionally inside an 'if' block!
const InfoCard = ({ showDetails, MyContext }) => {
  if (showDetails) {
    const contextValue = use(MyContext); // Completely valid inside 'if' statements!
    return <p>Secret Details: {contextValue}</p>;
  }
  return <p>Details are hidden</p>;
};

// Reading a Promise with use() requires a <Suspense> boundary above it
const UserName = ({ userPromise }) => {
  const user = use(userPromise); // Suspends until the promise resolves
  return <p>Welcome, {user.name}!</p>;
};

export const Profile = ({ userPromise }) => (
  <Suspense fallback={<p>Loading user...</p>}>
    <UserName userPromise={userPromise} />
  </Suspense>
);
```

---

## 🧠 Kiểm tra kiến thức của bạn

Hãy trả lời các câu hỏi sau để kiểm tra mức độ hiểu biết của bạn về các API mới này của React 19. Nhấp vào **Reveal Answer** để kiểm chứng.

### 1. Hàm action được truyền vào `useActionState` nhận những tham số nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm action đã được bao bọc nhận hai tham số:
  1. `state`: Giá trị trả về trước đó của state (hoặc giá trị khởi tạo trong lần gọi đầu tiên).
  2. `formData`: Đối tượng `FormData` gốc của trình duyệt chứa các input của form.
</details>

### 2. `useFormStatus` khác với giá trị `isPending` được trả về bởi `useActionState` như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useFormStatus` (được import từ `react-dom`) đọc trạng thái pending từ **React Context** của `<form>` cha gần nhất, nên nó phải được gọi trong một component **con** lồng bên trong form đó — nó lý tưởng cho một `<SubmitButton>` tái sử dụng được, tách rời. Ngược lại, `isPending` từ `useActionState` (được import từ `react`) được trả về **trực tiếp** dưới dạng phần tử thứ ba của hook và chỉ khả dụng trong component đã gọi hook; nó gắn liền với action cụ thể đã được bao bọc đó. Dùng `isPending` khi nút bấm nằm trong cùng component với form; dùng `useFormStatus` khi bạn muốn một nút submit dùng chung mà không cần prop drilling.
</details>

### 3. `useOptimistic` xử lý các trường hợp thất bại như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Khi async action hoàn tất thực thi, React tự động xả (flush) state optimistic tạm thời và render lại bằng state thực tế của component. Nếu API thất bại và bạn chọn không cập nhật state thực tế (`setMessages`), UI sẽ tự động quay lại (rollback) trạng thái ban đầu, loại bỏ mục tạm thời.
</details>

### 4. `useTransition` giải quyết vấn đề gì, và nó trả về cái gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useTransition` giải quyết tình trạng UI **đóng băng** gây ra bởi các lần render đồng bộ, tốn kém (ví dụ, chuyển sang một tab mount hàng trăm mục). Bằng cách bao bọc cập nhật state bên trong `startTransition`, bạn đánh dấu nó là một **transition** có độ ưu tiên thấp, nhờ đó React giữ cho trang luôn có thể tương tác và render cập nhật nặng nề ở chế độ nền. Nó trả về một tuple: `[isPending, startTransition]` — `isPending` có giá trị `true` trong khi lần render trì hoãn đang diễn ra (hữu ích để hiển thị chỉ báo "Loading..."), và `startTransition` là hàm mà bạn bao bọc lời gọi `setState` không khẩn cấp của mình bên trong. Lưu ý rằng nó không làm cho việc render nhanh hơn; nó khiến ứng dụng có cảm giác phản hồi nhanh bằng cách giữ cho nó có thể bị ngắt quãng.
</details>

### 5. Bạn phải dùng component wrapper nào của React khi resolve các Promise bên trong một component sử dụng API `use`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn phải bao bọc component trong một ranh giới **`<Suspense>`**. Bởi vì việc resolve một Promise sẽ tạm dừng (suspend) quá trình render, Suspense cung cấp một chỉ báo fallback (như một biểu tượng loading xoay) để hiển thị trên màn hình trong khi Promise đang chờ được resolve.
</details>

---

## 💻 Bài tập thực hành

Hãy áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Component nút bấm theo dõi trạng thái Form
1. Tạo một component `FormStatusDemo.tsx` (hoặc `.jsx`).
2. Tạo một component nút con `<StatusBtn />` sử dụng `useFormStatus()`. Vô hiệu hóa nút và đổi text của nó thành `"Adding Item..."` nếu trạng thái của form là pending.
3. Render một form với một ô input văn bản trong component cha `FormStatusDemo`.
4. Bao bọc việc submit form bằng một async action trì hoãn 3 giây:
   ```javascript
   const submitAction = async (formData) => {
     await new Promise(r => setTimeout(r, 3000));
     alert("Saved successfully!");
   };
   ```
5. Lồng `<StatusBtn />` bên trong form. Chạy dự án để xác minh rằng trạng thái của nút được tự động cập nhật mà không cần dùng các state hook ở cấp cha.

> [!TIP]
> Hãy kiểm chứng quy tắc then chốt của bài học: thử gọi `useFormStatus()` trực tiếp bên trong `FormStatusDemo` (ngay cạnh thẻ `<form>`) và quan sát `pending` vẫn luôn là `false`. Sau đó chuyển nó trở lại vào component con lồng bên trong `<StatusBtn />` và quan sát nó hoạt động trở lại.

### 🛠️ Bài tập 2: Bộ chuyển tab non-blocking với `useTransition`
1. Tạo một `App.tsx` với ba nút — **Home**, **Post**, và **Contact** — và một `useState` cho `activeTab`.
2. Xây dựng một component `<Post />` nặng nề render nhiều mục để khiến việc render trở nên tốn kém:
   ```jsx
   export const Post = () => {
     // Generate a large list to make rendering noticeably slow
     const posts = Array.from({ length: 5000 }, (_, index) => `Post ${index + 1}`);
     return (
       <div>
         {posts.map((post) => (
           <div className="post" key={post}>{post}</div>
         ))}
       </div>
     );
   };
   ```
3. Đầu tiên, hãy nối dây các tab **mà không có** `useTransition` (gọi `setActiveTab` trực tiếp). Nhấp vào **Post**, rồi ngay lập tức thử nhấp vào **Home** hoặc **Contact** — hãy để ý rằng UI bị đóng băng cho đến khi lần render nặng nề kết thúc.
4. Bây giờ hãy refactor: kéo `const [isPending, startTransition] = useTransition();` ra và định tuyến các lần nhấp qua một hàm `handleTabChange(tab)` bao bọc `setActiveTab(tab)` bên trong `startTransition(...)`.
5. Render `{isPending && <p>Loading...</p>}` phía trên phần nội dung. Kiểm tra lại: nhấp vào **Post** sẽ hiển thị "Loading..." trong khi các tab khác vẫn có thể nhấp được ngay lập tức.
6. **Suy ngẫm:** `useTransition` có làm cho việc render *nhanh hơn* không, hay chỉ giữ cho ứng dụng *phản hồi nhanh*? Hãy viết một comment một dòng trong code của bạn với câu trả lời.
