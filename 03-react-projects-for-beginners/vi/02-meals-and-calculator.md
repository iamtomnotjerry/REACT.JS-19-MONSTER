# Dự án 3 & 4: Gọi API Món ăn & Máy tính bỏ túi 🚀

Trong bài học này, chúng ta sẽ xây dựng một **Danh mục món ăn lấy dữ liệu từ API (Meals Catalog API Fetcher)** và một ứng dụng **Máy tính bỏ túi (Calculator)** hoàn chỉnh. Các dự án này giúp bạn làm quen sâu hơn với luồng dữ liệu, xử lý các tác vụ phụ (`useEffect`), quản lý lỗi gọi mạng, kiểm soát dữ liệu nhập và thiết kế bố cục lưới grid phức tạp.

---

## 🍽️ Dự án 3: Danh mục món ăn Seafood (Meals API)

Dự án này thực hiện gọi danh sách món ăn hải sản từ API bên ngoài, hiển thị dạng lưới thẻ card, đồng thời xử lý trạng thái đang tải (loading) và hiển thị thông báo lỗi.

### Các khái niệm chính được thực hành:
* Gọi dữ liệu trong `useEffect` và lưu trữ vào state.
* Quản lý trạng thái đang tải (`loading`) và thông báo lỗi (`error`).
* Thiết lập bố cục danh sách động sử dụng CSS Grid.

### Hướng dẫn triển khai từng bước (`Meals.jsx`)

Tạo tệp component tại `src/components/Meals.jsx` và viết đoạn mã sau:

```jsx
import { useState, useEffect } from 'react';

export const Meals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể kết nối cơ sở dữ liệu món ăn!");
        return res.json();
      })
      .then((data) => {
        if (active) {
          // Lưu trữ 8 món ăn đầu tiên
          setItems(data.meals ? data.meals.slice(0, 8) : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false; // Ngăn chặn cập nhật state khi component đã hủy (race condition)
    };
  }, []);

  if (loading) return <p style={styles.message}>Đang tải danh mục hải sản...</p>;
  if (error) return <p style={styles.errorMessage}>Lỗi: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dự án 3: Danh mục Hải sản qua API</h2>
      <div style={styles.grid}>
        {items.map(({ idMeal, strMeal, strMealThumb }) => (
          <div key={idMeal} style={styles.card}>
            <img src={strMealThumb} alt={strMeal} style={styles.image} />
            <div style={styles.info}>
              <h4 style={styles.mealName}>{strMeal}</h4>
              <span style={styles.tag}>ID: {idMeal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    maxWidth: "1000px",
    margin: "0 auto"
  },
  title: {
    textAlign: "center",
    color: "#2c3e50",
    marginBottom: "30px"
  },
  message: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#7f8c8d",
    marginTop: "50px"
  },
  errorMessage: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#e74c3c",
    marginTop: "50px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease"
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover"
  },
  info: {
    padding: "15px"
  },
  mealName: {
    margin: "0 0 10px 0",
    fontSize: "1.1rem",
    color: "#34495e"
  },
  tag: {
    fontSize: "0.8rem",
    color: "#bdc3c7",
    fontWeight: "bold"
  }
};
```

---

## 🔢 Dự án 4: Máy tính bỏ túi toán học (Calculator)

Ứng dụng máy tính với thiết kế lưới grid, cho phép ghép nối và tính toán các biểu thức toán học dạng chuỗi.

### ⚠️ Cảnh báo bảo mật: Rủi ro khi dùng hàm `eval()`
Trong thực tế lập trình, hàm toàn cục `eval()` của JavaScript có thể thực thi bất kỳ đoạn mã độc nào trong chuỗi, tiềm ẩn rủi ro bảo mật nghiêm trọng (như tấn công XSS) nếu chuỗi nhập vào là từ người dùng. Trong React, giải pháp thay thế an toàn hơn là sử dụng hàm dựng `Function`:
```javascript
// Tính toán chuỗi biểu thức an toàn
const safeEvaluate = (expression) => {
  return Function(`"use strict"; return (${expression})`)();
};
```

### Hướng dẫn triển khai từng bước (`Calculator.jsx`)

Tạo tệp component tại `src/components/Calculator.jsx` và viết đoạn mã sau:

```jsx
import { useState } from 'react';

export const Calculator = () => {
  const [input, setInput] = useState("");

  const clear = () => setInput("");
  const append = (value) => {
    // Tránh việc nhấn liên tiếp hai toán tử toán học
    const lastChar = input[input.length - 1];
    const operators = ["+", "-", "*", "/"];
    if (operators.includes(value) && operators.includes(lastChar)) return;
    setInput((prev) => prev + value);
  };
  
  const calculate = () => {
    if (!input) return;
    try {
      // Thực thi tính toán chuỗi biểu thức thông qua hàm Function an toàn hơn eval
      const result = Function(`"use strict"; return (${input})`)();
      setInput(Number(result).toString());
    } catch {
      setInput("Error");
    }
  };

  return (
    <div style={calcStyles.wrapper}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Dự án 4: Máy tính React</h2>
      <div style={calcStyles.container}>
        <div style={calcStyles.display}>{input || "0"}</div>
        <div style={calcStyles.grid}>
          <button style={calcStyles.clearBtn} onClick={clear}>C</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("/")}>/</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("*")}>*</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("-")}>-</button>
          
          <button style={calcStyles.btn} onClick={() => append("7")}>7</button>
          <button style={calcStyles.btn} onClick={() => append("8")}>8</button>
          <button style={calcStyles.btn} onClick={() => append("9")}>9</button>
          <button style={calcStyles.operatorBtn} onClick={() => append("+")}>+</button>
          
          <button style={calcStyles.btn} onClick={() => append("4")}>4</button>
          <button style={calcStyles.btn} onClick={() => append("5")}>5</button>
          <button style={calcStyles.btn} onClick={() => append("6")}>6</button>
          <button style={calcStyles.equalBtn} onClick={calculate}>=</button>
          
          <button style={calcStyles.btn} onClick={() => append("1")}>1</button>
          <button style={calcStyles.btn} onClick={() => append("2")}>2</button>
          <button style={calcStyles.btn} onClick={() => append("3")}>3</button>
          <button style={calcStyles.btn} onClick={() => append("0")}>0</button>
        </div>
      </div>
    </div>
  );
};

const calcStyles = {
  wrapper: {
    maxWidth: "350px",
    margin: "30px auto",
    fontFamily: "'Segoe UI', monospace"
  },
  container: {
    backgroundColor: "#2c3e50",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
  },
  display: {
    backgroundColor: "#ecf0f1",
    padding: "15px",
    borderRadius: "5px",
    fontSize: "2rem",
    textAlign: "right",
    color: "#2c3e50",
    marginBottom: "20px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px"
  },
  btn: {
    padding: "20px",
    fontSize: "1.2rem",
    backgroundColor: "#34495e",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  operatorBtn: {
    padding: "20px",
    fontSize: "1.2rem",
    backgroundColor: "#e67e22",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  clearBtn: {
    padding: "20px",
    fontSize: "1.2rem",
    backgroundColor: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  equalBtn: {
    gridRow: "span 2",
    backgroundColor: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao cần viết hàm dọn dẹp (cleanup) cho các lời gọi API trong `useEffect`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nhằm ngăn chặn việc cập nhật trạng thái (state update) của các component đã bị hủy (unmounted) khỏi màn hình. Nếu kết quả API phản hồi chậm hơn thời gian component bị đóng lại, việc gọi set state sẽ kích hoạt cảnh báo rò rỉ bộ nhớ (memory leak) trong console. Cờ `active` trong hàm dọn dẹp sẽ giải quyết việc này.
</details>

### 2. Tại sao hàm `eval()` gốc của JavaScript bị hạn chế sử dụng, và đâu là giải pháp thay thế an toàn?
<details>
  <summary><b>Reveal Answer</b></summary>

  `eval()` thực thi bất cứ văn bản nào truyền vào dưới dạng mã JS. Nếu người dùng chèn mã độc vào ô nhập, điều này dẫn đến tấn công XSS hoặc hack hệ thống. Giải pháp thay thế là tự dựng phạm vi hàm thông qua `Function("return (" + expression + ")")()`, hoặc sử dụng các thư viện phân tích biểu thức toán học chuyên dụng như `mathjs`.
</details>

### 3. Thuộc tính `gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))"` có tác dụng gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó giúp lưới layout tự động co giãn thích ứng (responsive). Nó sẽ xếp nhiều cột nhất có thể trên một hàng, mỗi cột có chiều rộng tối thiểu là `220px`. Nếu màn hình rộng, các cột tự chia đều khoảng trống còn lại (`1fr`), giúp loại bỏ việc viết quá nhiều truy vấn CSS Media Queries.
</details>

### 4. Điều gì xảy ra khi bạn gọi dữ liệu trong `useEffect` nhưng không khai báo mảng phụ thuộc rỗng `[]`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm gọi API sẽ chạy sau lần render đầu tiên, cập nhật state gây re-render component, chạy lại API, cập nhật state tiếp, tạo ra một vòng lặp vô hạn. Điều này sẽ spam máy chủ gọi API và làm treo trình duyệt.
</details>

### 5. Tại sao cần viết hàm `.catch()` ở cuối các chuỗi promises gọi dữ liệu?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `.catch()` dùng để bắt các lỗi kết nối mạng (offline), lỗi máy chủ phản hồi chậm hoặc lỗi do bạn ném ra (throw) trong chuỗi xử lý. Không bắt lỗi sẽ dẫn đến lỗi Promise bị từ chối không xử lý (unhandled rejections), làm giao diện UI bị đơ mãi ở trạng thái Loading.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Bộ lọc danh mục cho Món ăn
1. Mở file `Meals.jsx`.
2. Thêm một thanh chọn danh mục gồm các nút bấm: "Seafood" (Hải sản), "Chicken" (Thịt gà), "Beef" (Thịt bò).
3. Thiết lập biến state `category` mặc định là `"Seafood"`.
4. Gọi lại API tương ứng mỗi khi `category` thay đổi bằng cách truyền nó vào mảng phụ thuộc của `useEffect`. Hiển thị danh mục món ăn tương ứng.

### 🛠️ Bài tập 2: Tính năng Xóa từng ký tự (Backspace) cho Máy tính
1. Mở file `Calculator.jsx`.
2. Thêm nút xóa từng số có nhãn là `"⌫"` hoặc `"DEL"`.
3. Khi bấm nút này, hãy cắt bỏ ký tự cuối cùng của chuỗi state `input` bằng phương thức slice:
   ```javascript
   const deleteLast = () => setInput((prev) => prev.slice(0, -1));
   ```
