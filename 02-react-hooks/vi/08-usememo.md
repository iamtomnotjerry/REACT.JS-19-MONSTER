# Hook `useMemo` ⚓

Hook **`useMemo`** là một công cụ tối ưu hiệu năng trong React cho phép bạn **lưu bộ nhớ đệm (cache) cho kết quả tính toán** của một tác vụ nặng giữa các lần render. Nó đảm bảo phép tính đó chỉ được chạy lại khi một trong các giá trị phụ thuộc (dependencies) thay đổi.

### 💡 Ví dụ thực tế dễ hiểu: Máy tính Thuế thu nhập
Hãy tưởng tượng bạn đang tính toán thuế thu nhập cá nhân hàng năm bằng tay. Phép tính này rất phức tạp và khiến bạn mất 30 phút để hoàn thành.
- **Không dùng `useMemo`**: Mỗi khi có người hỏi thuế suất của bạn là bao nhiêu, bạn lại lôi bút giấy ra tính toán từ đầu, mất thêm 30 phút nữa (quá lãng phí thời gian).
- **Có dùng `useMemo`**: Bạn ghi kết quả thuế suất cuối cùng lên một tờ giấy nhớ. Khi có người hỏi, bạn đọc ngay lập tức. Bạn chỉ tính toán lại nếu thu nhập hoặc số người phụ thuộc (**dependencies**) thay đổi.

---

## ⚡ 1. Cú pháp cốt lõi

`useMemo` nhận vào một hàm trả về một giá trị, và một mảng phụ thuộc (dependency array):

```jsx
import { useMemo } from 'react';

const memoizedValue = useMemo(() => {
  return runExpensiveCalculation(a, b);
}, [a, b]); // Chỉ tính toán lại nếu 'a' hoặc 'b' thay đổi
```

---

## 🧩 2. Ví dụ mã nguồn chi tiết: Lọc danh sách dữ liệu lớn

Hãy cùng xem một trường hợp phổ biến: lọc danh sách người dùng. Nếu không dùng `useMemo`, việc nhấn nút "Tăng đếm" (count) ở một state hoàn toàn không liên quan sẽ khiến toàn bộ logic lọc danh sách chạy lại từ đầu, mặc dù từ khóa tìm kiếm không hề thay đổi.

```jsx
import { useState, useMemo } from 'react';

// Tạo danh sách giả lập gồm 5.000 phần tử
const generateUsers = () => {
  const list = [];
  for (let i = 0; i < 5000; i++) {
    list.push({ id: i, name: `Người dùng ${i}`, age: Math.floor(Math.random() * 80) + 10 });
  }
  return list;
};

const usersData = generateUsers();

const UserFilter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState(0);

  // Cache danh sách người dùng đã được lọc
  const filteredUsers = useMemo(() => {
    console.log("Đang lọc danh sách người dùng... (phép tính nặng)");
    return usersData.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]); // Chỉ chạy lại bộ lọc nếu searchTerm thay đổi

  return (
    <div style={{ padding: "20px" }}>
      <h2>Kiểm tra hiệu năng (useMemo)</h2>
      
      {/* 1. Cập nhật state không liên quan */}
      <button onClick={() => setCount((prev) => prev + 1)}>
        Tăng bộ đếm: {count}
      </button>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm người dùng..."
        />
      </div>

      <p>Tìm thấy {filteredUsers.length} người dùng</p>
      <ul>
        {filteredUsers.slice(0, 10).map((user) => (
          <li key={user.id}>{user.name} (Tuổi: {user.age})</li>
        ))}
      </ul>
    </div>
  );
};

export default UserFilter;
```

*Khi bạn nhấn nút "Tăng bộ đếm", component sẽ re-render. Tuy nhiên, dòng chữ `"Đang lọc danh sách người dùng..."` trong console sẽ KHÔNG in ra, chứng tỏ kết quả cache đã được trả về ngay lập tức.*

---

## 🚀 3. Khi nào nên dùng `useMemo`

Bạn không nên dùng `useMemo` vô tội vạ vì nó gây tốn tài nguyên bộ nhớ cho việc lưu trữ cache. Hãy chỉ dùng trong 2 trường hợp sau:
1. **Các tính toán nặng**: Khi xử lý, sắp xếp (sorting), hoặc lọc (filtering) các mảng dữ liệu lớn, hoặc thực hiện các công thức toán học phức tạp.
2. **Đảm bảo tính nhất quán tham chiếu (Referential Equality) cho Object/Array**: Nếu bạn truyền một đối tượng hoặc mảng làm prop xuống component con đã tối ưu, hoặc sử dụng nó làm dependency cho một hook khác như `useEffect`:
   ```javascript
   // Không có useMemo, tham chiếu object này sẽ bị đổi sau MỖI LẦN render
   const params = useMemo(() => ({ category: "books" }), []);
   useEffect(() => {
     fetchData(params);
   }, [params]); // Ngăn chặn vòng lặp vô hạn do tham chiếu object thay đổi
   ```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về `useMemo`. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Sự khác biệt cơ bản giữa `useMemo` và `useCallback` là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `useMemo` lưu bộ nhớ đệm cho **giá trị kết quả** của hàm (trả về kết quả sau khi thực thi hàm).
  - `useCallback` lưu bộ nhớ đệm cho **chính tham chiếu hàm** (trả về bản thân hàm đó mà không chạy nó).
</details>

### 2. Làm thế nào để xác định một tính toán là "nặng" và xứng đáng dùng `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Bạn có thể đo lường thời gian thực thi bằng cách dùng `console.time()` và `console.timeEnd()`. Nhìn chung, các thao tác duyệt mảng hàng trăm/hàng nghìn phần tử, sắp xếp dữ liệu, hoặc chạy các vòng lặp sâu là các tác vụ nặng. Các phép cộng trừ thông thường, ghép chữ ngắn hoặc tạo object nhỏ là các tác vụ cực kỳ nhẹ và không cần dùng `useMemo`.
</details>

### 3. Điều gì xảy ra nếu bạn không truyền mảng phụ thuộc (dependency array) vào `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nếu bạn không truyền mảng phụ thuộc, hàm tính toán sẽ chạy lại sau **mỗi lần render**, điều này làm mất hoàn toàn ý nghĩa của việc lưu trữ bộ đệm cache. Luôn luôn truyền mảng phụ thuộc.
</details>

### 4. Chúng ta có thể dùng `useMemo` để lưu cache cho các phần tử JSX không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì các phần tử React (JSX elements) thực chất là các đối tượng JavaScript thuần, bạn có thể lưu cache cho một phần giao diện UI:
  ```jsx
  const expensiveUI = useMemo(() => <HeavyComponent data={data} />, [data]);
  ```
  Cách này giúp ngăn `<HeavyComponent>` bị re-render trừ khi biến `data` thay đổi.
</details>

### 5. Tại sao không được viết các tác vụ phụ (như gọi API hoặc ghi file) bên trong `useMemo`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `useMemo` chạy trong **quá trình render (render phase)**. Quá trình render phải luôn thuần khiết (pure) và không có tác vụ phụ. Việc thực hiện gọi mạng hoặc cập nhật state ở đây sẽ gây ra lỗi nghiêm trọng, giật lag giao diện và có thể rơi vào vòng lặp re-render vô hạn. Các tác vụ phụ bắt buộc phải đặt trong hàm xử lý sự kiện hoặc hook `useEffect`.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Tính số nguyên tố lớn (Prime Calculator)
1. Tạo một component `PrimeCalculator.jsx`.
2. Viết một hàm helper `checkPrime(num)` kiểm tra xem một số có phải là số nguyên tố hay không (chạy vòng lặp từ 2 đến căn bậc hai của `num`).
3. Hiển thị một ô nhập cho phép người dùng điền số cần kiểm tra và báo kết quả số nguyên tố lên màn hình.
4. Thêm một nút bấm để chuyển đổi giao diện sáng/tối (theme switcher) thay đổi màu nền của trang.
5. Bao bọc hàm kiểm tra `checkPrime` bằng `useMemo` để việc bấm chuyển đổi giao diện sáng/tối không kích hoạt chạy lại phép tính số nguyên tố nặng, giúp giao diện mượt mà hơn.
