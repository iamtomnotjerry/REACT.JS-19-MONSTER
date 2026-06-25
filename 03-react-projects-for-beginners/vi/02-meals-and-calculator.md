# Dự án 3 & 4: Meals API & Máy tính 🚀

Trong bài học này, chúng ta sẽ xây dựng một **Meals Catalog API Fetcher** (tiêu thụ các REST API bên ngoài) và một ứng dụng **Máy tính (Calculator)** toán học hoàn chỉnh. Các dự án này giúp bạn thực hành luồng dữ liệu nâng cao, các side effect (`useEffect`), quản lý lỗi, kiểm tra dữ liệu nhập (inputs validation) và các bố cục lưới grid tương tác phức tạp.

---

## 🍽️ Dự án 3: Meals API Catalog

Dự án này lấy các món ăn từ một food API bên ngoài và hiển thị chúng dưới dạng bố cục lưới thẻ card, bao gồm cả các trạng thái loading và xử lý kiểm tra lỗi.

### Các khái niệm chính được thực hành:
* Lấy dữ liệu bên trong `useEffect` và lưu trữ vào state.
* Quản lý trạng thái loading (`loading`) và thông báo lỗi (`error`).
* Bố cục item động thông qua grid styling.

### Hướng dẫn triển khai từng bước (`Meals.jsx`)

Tạo tệp `src/components/Meals.jsx` và chèn đoạn mã sau:

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
        if (!res.ok) throw new Error("Could not fetch food database!");
        return res.json();
      })
      .then((data) => {
        if (active) {
          // Store first 8 meals
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
      active = false; // Prevent race condition updates
    };
  }, []);

  if (loading) return <p style={styles.message}>Loading seafood catalog...</p>;
  if (error) return <p style={styles.errorMessage}>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Project 3: Seafood Meal API Catalog</h2>
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

## 🔢 Dự án 4: Máy tính toán học

Một ứng dụng máy tính bố cục lưới grid, xử lý các biểu thức toán học được biểu diễn dưới dạng chuỗi.

### ⚠️ Cảnh báo bảo mật: Rủi ro của `eval()`
Trong thực tế tiêu chuẩn, hàm toàn cục `eval()` của JavaScript có thể thực thi các chuỗi tùy ý dưới dạng mã, gây ra những rủi ro bảo mật nghiêm trọng (tấn công XSS) nếu chuỗi đó được cung cấp bởi người dùng. Trong React, một giải pháp sandbox an toàn hơn là sử dụng hàm dựng (constructor) `Function`:
```javascript
// Safely evaluate a math string
const safeEvaluate = (expression) => {
  return Function(`"use strict"; return (${expression})`)();
};
```

### Hướng dẫn triển khai từng bước (`Calculator.jsx`)

Tạo tệp `src/components/Calculator.jsx` và chèn đoạn mã sau:

```jsx
import { useState } from 'react';

export const Calculator = () => {
  const [input, setInput] = useState("");

  const clear = () => setInput("");
  const append = (value) => {
    // Avoid double operators in succession
    const lastChar = input[input.length - 1];
    const operators = ["+", "-", "*", "/"];
    if (operators.includes(value) && operators.includes(lastChar)) return;
    setInput((prev) => prev + value);
  };
  
  const calculate = () => {
    if (!input) return;
    try {
      // Evaluate string mathematically using the safer Function constructor
      const result = Function(`"use strict"; return (${input})`)();
      setInput(Number(result).toString());
    } catch {
      setInput("Error");
    }
  };

  return (
    <div style={calcStyles.wrapper}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Project 4: React Calculator</h2>
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

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về các dự án nhập môn này. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao chúng ta cần một hàm cleanup trong `useFetch` hoặc các lời gọi API bên trong `useEffect`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Để ngăn việc cập nhật state trên các component đã bị unmount (gỡ khỏi màn hình). Nếu một lời gọi API hoàn tất sau khi component đã bị unmount, việc gọi hàm set state sẽ kích hoạt cảnh báo rò rỉ bộ nhớ (memory leak) trong console của trình duyệt. Sử dụng một cờ boolean `active` bên trong hàm cleanup của effect sẽ ngăn chặn điều này.
</details>

### 2. Tại sao hàm `eval()` gốc của JavaScript không được khuyến khích, và đâu là giải pháp thay thế an toàn hơn?
<details>
  <summary><b>Reveal Answer</b></summary>

  `eval()` thực thi bất kỳ chuỗi nào dưới dạng mã JavaScript. Nếu người dùng có thể chèn văn bản độc hại vào input của bạn, nó có thể dẫn đến Cross-Site Scripting (XSS) hoặc thực thi mã từ xa (remote code execution). Một giải pháp thay thế an toàn hơn là tạo một phạm vi hàm sandbox bằng `Function("return (" + expression + ")")()`, hoặc sử dụng các thư viện phân tích biểu thức toán học như `mathjs`.
</details>

### 3. `gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))"` cải thiện tính responsive như thế nào?
<details>
  <summary><b>Reveal Answer</b></summary>

  Nó tự động xếp vừa số lượng cột grid nhiều nhất có thể trên màn hình. Mỗi cột được đảm bảo có chiều rộng tối thiểu là `220px`. Nếu không gian cho phép, các cột sẽ giãn ra để lấp đầy các đơn vị phần (fraction unit) còn lại (`1fr`) một cách đồng đều, loại bỏ nhu cầu viết các media query phức tạp.
</details>

### 4. Điều gì xảy ra khi bạn lấy dữ liệu bên trong `useEffect` mà không có mảng phụ thuộc rỗng `[]`?
<details>
  <summary><b>Reveal Answer</b></summary>

  API sẽ được gọi ở lần render đầu tiên, cập nhật state, kích hoạt re-render, gọi lại API, cập nhật state, và lặp vô hạn. Điều này sẽ spam máy chủ API và nhanh chóng làm treo tab trình duyệt.
</details>

### 5. Tại sao chúng ta sử dụng `.catch()` ở cuối một chuỗi fetch `.then()`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `.catch()` bắt mọi lỗi kết nối mạng, lỗi server timeout, hoặc các lỗi được ném (throw) thủ công xảy ra trong chuỗi promise. Việc không bắt được lỗi sẽ dẫn đến các unhandled promise rejection, khiến giao diện người dùng bị kẹt ở trạng thái loading.
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào dự án React của mình:

### 🛠️ Bài tập 1: Bộ lọc danh mục cho Meals
1. Mở `Meals.jsx`.
2. Thêm một hàng các nút lọc ở đầu trang: "Seafood", "Chicken", "Beef".
3. Thêm một biến state `category` được khởi tạo với giá trị `"Seafood"`.
4. Kích hoạt lại lời gọi fetch trong `useEffect` mỗi khi `category` thay đổi bằng cách thêm nó vào mảng phụ thuộc. Render gallery món ăn khớp với category được chọn.

### 🛠️ Bài tập 2: Thêm chức năng Backspace cho Máy tính
1. Mở `Calculator.jsx`.
2. Thêm một nút backspace có nhãn `"⌫"` hoặc `"DEL"`.
3. Nhấp vào nút này sẽ xóa ký tự cuối cùng của state chuỗi `input`:
   ```javascript
   const deleteLast = () => setInput((prev) => prev.slice(0, -1));
   ```
