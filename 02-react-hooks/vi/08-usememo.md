# Hook `useMemo` ⚓

Hook **`useMemo`** là một công cụ tối ưu hiệu năng trong React cho phép bạn **lưu vào bộ nhớ đệm (memoize) kết quả đã tính toán** của một phép tính tốn kém giữa các lần render. Nó đảm bảo một phép tính chỉ được chạy lại khi một trong các dependency của nó thay đổi.

---

## 📖 Khái niệm & Tổng quan

Mỗi lần một component React re-render, **toàn bộ code bên trong thân hàm của nó sẽ chạy lại từ trên xuống dưới**. Đối với các thao tác rẻ tiền (cộng hai số, tạo một chuỗi ngắn) thì điều này không đáng kể. Nhưng nếu component của bạn thực hiện một phép tính tốn kém — sắp xếp hàng nghìn bản ghi, lọc một danh sách khổng lồ, chạy một vòng lặp toán học nặng — thì công việc đó sẽ diễn ra ở *mỗi* lần render, kể cả khi đầu vào không hề thay đổi.

`useMemo` giải quyết vấn đề này bằng cách **ghi nhớ** kết quả của một phép tính và chỉ chạy lại phép tính khi một trong các dependency đã khai báo thay đổi. Trong khoảng thời gian giữa các lần đó, React trả về ngay lập tức giá trị đã được cache trước đó cho bạn.

> [!NOTE]
> Chỉ dùng `useMemo` để memoize **các phép tính tốn kém** — sắp xếp/lọc các mảng lớn, các vòng lặp toán học chuyên sâu, hoặc để giữ một tham chiếu object/array ổn định. Bọc những công việc tầm thường (một phép cộng đơn giản hay một phép ghép chuỗi ngắn) trong `useMemo` thường tốn kém hơn là tiết kiệm, vì React vẫn phải lưu trữ giá trị và so sánh mảng dependency ở mỗi lần render.

> [!WARNING]
> **Không bao giờ chạy side effect bên trong hàm factory của `useMemo`.** `useMemo` chạy trong **giai đoạn render (render phase)**, vốn phải luôn thuần khiết (pure). Không gọi API, không ghi vào `localStorage`, không thay đổi biến bên ngoài, và không gọi `setState` bên trong nó. Side effect thuộc về các hàm xử lý sự kiện hoặc `useEffect`.

> [!TIP]
> Trước khi nghĩ đến việc dùng `useMemo`, hãy đo lường trước. Bọc phép tính khả nghi trong `console.time("calc")` / `console.timeEnd("calc")` (hoặc dùng React Profiler). Nếu nó luôn chỉ mất một phần nhỏ của một mili-giây, thì gần như chắc chắn bạn không cần memoize nó.

---

### 💡 Ví dụ thực tế dễ hiểu: Máy tính Thuế
Hãy tưởng tượng bạn đang tính thuế thu nhập hàng năm của mình bằng tay. Phép tính rất phức tạp, khiến bạn mất 30 phút để hoàn thành.
- **Không dùng `useMemo`**: Mỗi khi bạn của bạn hỏi thuế suất của bạn là bao nhiêu, bạn lại tính toán lại từ đầu, mỗi lần mất 30 phút.
- **Có dùng `useMemo`**: Bạn ghi con số thuế cuối cùng lên một tờ giấy nhớ. Khi bạn của bạn hỏi, bạn đọc ngay lập tức. Bạn chỉ tính lại nếu thu nhập hoặc các khoản khấu trừ (**dependencies**) thay đổi.

Tờ giấy nhớ chính là **cache**. Thu nhập và các khoản khấu trừ của bạn chính là **mảng dependency**. Miễn là chúng không thay đổi, câu trả lời đã được ghi sẵn ở đó.

---

### 🔍 `useMemo` so với `useCallback` so với Tính toán thuần

| Cách tiếp cận | Cache cái gì | Trả về | Phù hợp nhất cho |
| --- | --- | --- | --- |
| Tính toán thuần (không hook) | Không gì cả | Giá trị được tính mới ở mỗi lần render | Các thao tác rẻ, nhanh |
| `useMemo(fn, deps)` | **Giá trị trả về** bởi `fn` | Kết quả đã cache của `fn()` | Các phép tính tốn kém; tham chiếu object/array ổn định |
| `useCallback(fn, deps)` | Bản thân **tham chiếu hàm** | Chính hàm đó (không thực thi) | Các callback prop ổn định truyền xuống các component con đã memoize |

`useCallback(fn, deps)` về cơ bản là cách viết tắt cho `useMemo(() => fn, deps)`.

---

## ⚡ 1. Cú pháp cốt lõi

`useMemo` nhận vào một hàm trả về một giá trị, và một mảng dependency:

```jsx
import { useMemo } from 'react';

const memoizedValue = useMemo(() => {
  return runExpensiveCalculation(a, b);
}, [a, b]); // Only recalculates if 'a' or 'b' changes
```

Về mặt khái niệm, luồng render trông như thế này:

```text
Component re-renders
        │
        ▼
Did any dependency in [a, b] change?
        │
   ┌────┴─────┐
  YES         NO
   │           │
   ▼           ▼
Re-run fn   Return the
& cache     cached value
result      (skip fn)
```

---

## 🧩 2. Ví dụ mã nguồn chi tiết: Lọc một tập dữ liệu lớn

Hãy cùng xem một trường hợp phổ biến: lọc một danh sách người dùng. Nếu không dùng `useMemo`, việc nhấn một nút "Increment Count" riêng biệt sẽ khiến toàn bộ logic lọc danh sách chạy lại, mặc dù từ khóa tìm kiếm không hề thay đổi.

```jsx
import { useState, useMemo } from 'react';

// Generates a mock list of 5,000 items
const generateUsers = () => {
  const list = [];
  for (let i = 0; i < 5000; i++) {
    list.push({ id: i, name: `User ${i}`, age: Math.floor(Math.random() * 80) + 10 });
  }
  return list;
};

const usersData = generateUsers();

const UserFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState(0);

  // Memoize the filtered users array
  const filteredUsers = useMemo(() => {
    console.log("Filtering users... (expensive operation)");
    return usersData.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]); // Only re-run filtering if searchTerm changes

  return (
    <div style={{ padding: "20px" }}>
      <h2>Performance Testing (useMemo)</h2>

      {/* 1. Unrelated state update */}
      <button onClick={() => setCount((prev) => prev + 1)}>
        Increment Count: {count}
      </button>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
        />
      </div>

      <p>Found {filteredUsers.length} users</p>
      <ul>
        {filteredUsers.slice(0, 10).map((user) => (
          <li key={user.id}>{user.name} (Age: {user.age})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserFilter;
```

*Khi bạn nhấn nút "Increment Count", component sẽ re-render. Tuy nhiên, câu lệnh console `"Filtering users..."` sẽ KHÔNG được kích hoạt, cho thấy cache đã được trả về trực tiếp.*

---

## 🧊 3. Tính bằng nhau theo tham chiếu (Referential Equality): Lý do còn lại để memoize

Trong JavaScript, hai object/array có cùng nội dung thì **không** bằng nhau (`{} !== {}`). Mỗi lần render tạo ra các tham chiếu hoàn toàn mới. Điều này quan trọng khi một object/array được dùng làm dependency hoặc được truyền cho một component con đã memoize.

```jsx
import { useMemo, useEffect } from 'react';

// ❌ Without useMemo: a NEW object is created on every render,
//    so the useEffect below sees a "changed" dependency every time.
// const params = { category: "books" };

// ✅ With useMemo: the same object reference is reused across renders.
const params = useMemo(() => ({ category: "books" }), []);

useEffect(() => {
  fetchData(params);
}, [params]); // Stable reference prevents an infinite fetch loop
```

> [!WARNING]
> Một lỗi phổ biến: đặt một object hoặc array vừa được tạo mới vào mảng dependency của `useEffect`. Vì tham chiếu thay đổi ở mỗi lần render, effect sẽ kích hoạt liên tục không ngừng. Memoize object đó bằng `useMemo` sẽ cho nó một danh tính ổn định và phá vỡ vòng lặp.

---

## 🚀 4. Khi nào nên dùng `useMemo`

Bạn không nên thêm `useMemo` ở mọi nơi. Nó tạo thêm chi phí thực thi. Hãy dùng nó trong hai trường hợp sau:
1. **Các phép tính tốn kém**: Khi bạn đang xử lý, sắp xếp hoặc lọc các mảng lớn hoặc thực hiện các thao tác toán học chuyên sâu.
2. **Tính bằng nhau theo tham chiếu của Object/Array**: Nếu bạn đang truyền một object hoặc array xuống một component con đã được memoize, hoặc dùng nó làm dependency trong một hook khác như `useEffect`:
   ```javascript
   // Without useMemo, this object reference changes on EVERY render
   const params = useMemo(() => ({ category: "books" }), []);
   useEffect(() => {
     fetchData(params);
   }, [params]); // Prevents infinite loops
   ```

> [!NOTE]
> `useMemo` là một **tối ưu hóa** hiệu năng, không phải một sự đảm bảo về tính đúng đắn. React có thể chọn loại bỏ một giá trị đã cache (ví dụ, để giải phóng bộ nhớ) và tính lại nó. Code của bạn phải hoạt động đúng ngay cả khi `useMemo` tính lại ở mỗi lần render — đừng bao giờ dựa vào nó để *chỉ* chạy một lần.

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useMemo`. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Sự khác biệt cơ bản giữa `useMemo` và `useCallback` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `useMemo` cache **giá trị trả về** của một hàm (trả về kết quả sau khi thực thi hàm).
  - `useCallback` cache **chính tham chiếu hàm** (trả về bản thân hàm đó mà không thực thi nó).
</details>

### 2. Làm thế nào để xác định một phép tính có đủ "tốn kém" để cần đến `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể đo lường hiệu năng bằng cách dùng `console.time()` và `console.timeEnd()`. Nhìn chung, các thao tác xử lý mảng hàng trăm/hàng nghìn phần tử, sắp xếp các tập dữ liệu, hoặc thực thi các vòng lặp là tốn kém. Các phép cộng render thông thường, ghép chuỗi văn bản đơn giản, hoặc cấp phát các object nhỏ là rẻ và không cần `useMemo`.
</details>

### 3. Điều gì xảy ra nếu bạn bỏ qua mảng dependency trong `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu bạn không truyền mảng dependency, hàm sẽ thực thi ở **mỗi một lần render**, điều này hoàn toàn làm mất đi mục đích của việc cache giá trị. Luôn luôn cung cấp một mảng dependency.
</details>

### 4. Bạn có thể dùng `useMemo` để cache các phần tử JSX không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì các phần tử React là các object JavaScript thuần, bạn có thể memoize một phần của bố cục UI:
  ```jsx
  const expensiveUI = useMemo(() => <HeavyComponent data={data} />, [data]);
  ```
  Cách này ngăn `HeavyComponent` re-render trừ khi `data` thay đổi.
</details>

### 5. Tại sao bạn không nên viết side effect (như gọi API hoặc cập nhật local storage) bên trong `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMemo` chạy trong **giai đoạn render (render phase)**. Giai đoạn render phải thuần khiết và không có side effect. Việc thực thi các yêu cầu mạng hoặc thay đổi state trong khi render sẽ gây ra lỗi, trục trặc hiển thị, và các vòng lặp render vô hạn tiềm ẩn. Side effect phải luôn được đặt trong các hàm xử lý sự kiện hoặc bên trong hook `useEffect`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Máy tính số nguyên tố nặng
1. Tạo một component `PrimeCalculator.jsx`.
2. Triển khai một hàm helper `checkPrime(num)` xác định xem một số có phải là số nguyên tố hay không (chạy một vòng lặp từ 2 đến căn bậc hai của `num`).
3. Render một ô nhập cho phép người dùng nhập một số, và hiển thị xem nó có phải là số nguyên tố hay không.
4. Render một nút toggle để chuyển đổi theme (màu nền).
5. Bọc phép tính `checkPrime` trong `useMemo` để việc chuyển đổi theme không kích hoạt chạy lại các phép kiểm tra số nguyên tố, giữ tốc độ render UI mượt mà.

**Khung sườn khởi đầu:**

```jsx
import { useState, useMemo } from 'react';

// Returns true if num is a prime number
const checkPrime = (num) => {
  console.log("Running expensive prime check...");
  if (num < 2) return false;
  // Only loop up to the square root for efficiency
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

const PrimeCalculator = () => {
  const [number, setNumber] = useState(7);
  const [darkTheme, setDarkTheme] = useState(false);

  // TODO: memoize this so toggling the theme does NOT re-run checkPrime
  const isPrime = useMemo(() => checkPrime(number), [number]);

  const themeStyles = {
    background: darkTheme ? "#222" : "#eee",
    color: darkTheme ? "#fff" : "#000",
    padding: "20px",
  };

  return (
    <div style={themeStyles}>
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
      />
      <p>{number} is {isPrime ? "PRIME" : "NOT prime"}</p>
      <button onClick={() => setDarkTheme((prev) => !prev)}>Toggle Theme</button>
    </div>
  );
};

export default PrimeCalculator;
```

Mở console: xác nhận rằng việc nhấn **Toggle Theme** KHÔNG ghi log `"Running expensive prime check..."`, nhưng việc thay đổi số thì có.

---

### 🛠️ Bài tập 2: Tham chiếu ổn định để dừng một vòng lặp vô hạn
1. Tạo một component `ProductList.jsx` nhận vào một object `filters` (ví dụ `{ category: "books", inStock: true }`).
2. Bên trong, gọi `useEffect` để "fetch" sản phẩm bất cứ khi nào `filters` thay đổi (ghi một thông báo ra log để mô phỏng việc fetch).
3. Đầu tiên, định nghĩa `filters` như một object inline thuần **không** dùng `useMemo` và quan sát thấy effect kích hoạt ở mỗi lần render — một vòng lặp vô hạn nếu effect cũng cập nhật state.
4. Sau đó bọc `filters` trong `useMemo(() => ({ category, inStock }), [category, inStock])` và xác nhận effect giờ đây chỉ kích hoạt khi `category` hoặc `inStock` thực sự thay đổi.
5. Phần thưởng: thêm một nút đếm không liên quan đến filters và kiểm tra rằng việc tăng nó không còn kích hoạt việc fetch nữa một khi đã có `useMemo`.

> [!TIP]
> Bài tập này minh họa trường hợp sử dụng *tính bằng nhau theo tham chiếu (referential equality)* — có thể nói đây là lý do thực tế phổ biến hơn để dùng đến `useMemo`, thậm chí còn nhiều hơn cả chi phí tính toán thuần túy.
