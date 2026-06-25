# React Best Practices: Clean Code, Accessibility (a11y), và Định dạng 🚀

Tài liệu này giải thích các cấu hình tiêu chuẩn và chuẩn mực viết code ở mức độ chuyên nghiệp được áp dụng trong dự án của chúng ta. Việc tuân thủ các quy tắc này đảm bảo ứng dụng của bạn luôn sạch sẽ, dễ tiếp cận (accessible) và tuân theo cấu trúc chuẩn phục vụ môi trường thực tế.

---

## 💅 1. Định dạng mã nguồn (Prettier)

Khi làm việc nhóm, sự khác biệt về phong cách viết code có thể gây ra những cuộc xung đột git (git conflicts) rất lớn. Chúng ta sử dụng **Prettier** để tự động áp dụng một quy chuẩn định dạng thống nhất.

### Các cấu hình quy tắc chính (`.prettierrc`)
- **Không sử dụng dấu chấm phẩy (`semi: false`)**: Code trông sạch hơn khi loại bỏ các dấu chấm phẩy thừa ở cuối dòng.
- **Dấu nháy đơn (`singleQuote: true`)**: Thống nhất định dạng chuỗi trong JS/TS bằng dấu nháy đơn.
- **Dấu nháy kép trong JSX (`jsxSingleQuote: false`)**: Áp dụng quy chuẩn chung của ngành là dùng dấu nháy kép cho các thuộc tính giống HTML trong JSX.
- **Dấu phẩy ở cuối (`trailingComma: "all"`)**: Giúp các phần so sánh git (git diffs) sạch sẽ hơn khi thêm các phần tử mới vào mảng hoặc đối tượng.
- **Giới hạn độ rộng dòng (`printWidth: 80`)**: Tránh việc phải cuộn chuột ngang bằng cách tự động xuống dòng khi code vượt quá 80 ký tự.
- **Độ rộng Tab (`tabWidth: 2`, `useTabs: false`)**: Áp dụng chuẩn thụt lề bằng 2 khoảng trắng thay vì sử dụng ký tự Tab thô.
- **Khoảng trắng trong ngoặc nhọn (`bracketSpacing: true`)**: Tăng tính dễ đọc bằng cách thêm khoảng trắng bên trong dấu ngoặc nhọn của đối tượng (ví dụ: `{ user }`).
- **Ngoặc tròn cho tham số Arrow Function (`arrowParens: "always"`)**: Bắt buộc bọc các đối số của arrow function trong dấu ngoặc tròn (rất quan trọng khi làm việc với TypeScript sau này).
- **Ký tự kết thúc dòng (`endOfLine: "auto"`)**: Tự động xử lý ký tự kết thúc dòng (LF hoặc CRLF) trên các hệ điều hành khác nhau.

### Cách sử dụng Prettier:
Trong thư mục dự án của bạn, bạn có thể chạy:
```bash
# Formats all files inside your project directory
npm run format

# Checks if files are formatted correctly
npm run format:check
```

### 💡 ESLint so với Prettier: Sự khác biệt là gì?

Mọi người rất dễ nhầm lẫn giữa **ESLint** và **Prettier** vì cả hai đều quét qua các tệp mã nguồn của bạn, tuy nhiên chúng tập trung vào hai khía cạnh hoàn toàn khác nhau:

- **ESLint (Linter = Chất lượng mã nguồn):** Phân tích mã nguồn để phát hiện **lỗi logic, lỗi cú pháp hoặc các phản mô hình (anti-patterns)** (ví dụ: sử dụng biến chưa khai báo, import thư viện mà không dùng, hoặc vi phạm thứ tự gọi các React Hook). *Các vi phạm ở đây có thể khiến ứng dụng của bạn bị lỗi hoặc crash.*
- **Prettier (Formatter = Phong cách trình bày):** Chỉ tập trung vào **hình thức hiển thị của code** (ví dụ: khoảng trắng hay tab, loại dấu nháy đơn hay kép, dấu phẩy cuối dòng, giới hạn độ dài dòng). *Các vi phạm ở đây không ảnh hưởng đến hiệu năng của ứng dụng; chúng chỉ làm code khó đọc hơn nếu không được chuẩn hóa.*

| Đặc điểm | ESLint (Linter) | Prettier (Formatter) |
| :--- | :--- | :--- |
| **Mục tiêu** | Tính đúng đắn & Chất lượng mã nguồn (Logic) | Bố cục & Phong cách trình bày (Định dạng) |
| **Cách xử lý** | Cảnh báo về lỗi logic (có thể sửa một số lỗi cú pháp cơ bản qua `--fix`) | Tự động ghi đè tệp tin để khớp hoàn toàn với cấu hình chuẩn |
| **Ví dụ** | `no-unused-vars`, `react-hooks/rules-of-hooks` | `semi: false`, `singleQuote: true` |

**Phép so sánh ẩn dụ:** Hãy nghĩ về ESLint như một **Biên tập viên Ngữ pháp** (đảm bảo câu từ của bạn có nghĩa và đúng cấu trúc ngữ pháp) và Prettier giống như một **Nhà thiết kế Đồ họa** (căn chỉnh lề, khoảng cách dòng và chọn font chữ để trang giấy trông đẹp mắt và ngay ngắn).

---

## 🎨 2. HTML ngữ nghĩa (Semantic HTML) & Khả năng tiếp cận (Accessibility - a11y)

Viết giao diện người dùng dễ tiếp cận là một yêu cầu cốt lõi đối với các lập trình viên có kinh nghiệm. Chúng ta sẽ tuân thủ các thực tiễn tốt nhất về **a11y** một cách thủ công trong mã nguồn.

### Các quy tắc cốt lõi:
1. **Sử dụng thẻ ngữ nghĩa (Semantic Tags)**: Tránh việc lạm dụng bọc quá nhiều thẻ `div` lồng nhau. Sử dụng các thẻ HTML5 ngữ nghĩa phù hợp:
   - Thẻ `<header>` cho thanh điều hướng/đầu trang.
   - Thẻ `<nav>` cho danh sách liên kết điều hướng.
   - Thẻ `<footer>` cho phần thông tin bản quyền ở chân trang.
   - Thẻ `<article>` hoặc `<section>` cho các container nội dung độc lập/thẻ thông tin người dùng.
2. **Các thẻ neo dễ tiếp cận**: Không bao giờ viết `<a href="#">`. Nó khiến trình duyệt bị nhảy ngược lên đầu trang một cách khó chịu. Hãy sử dụng các liên kết neo mô tả cụ thể (ví dụ: `href="#home"`).
3. **Hỗ trợ trình đọc màn hình**: Sử dụng thuộc tính `aria-label` để cung cấp văn bản mô tả cho các thiết bị hỗ trợ đọc màn hình (ví dụ: `<nav aria-label="Main Navigation">`).

---

## 📐 3. Tiêu đề thân thiện với SEO (SEO-Friendly Headings)

Các công cụ tìm kiếm (như Google) đọc các thẻ tiêu đề của bạn (`<h1>` đến `<h6>`) để hiểu cấu trúc nội dung trang web.
- **Quy tắc:** Một trang web chỉ nên có **duy nhất một thẻ `<h1>`** (thường nằm ở phần tiêu đề chính của trang).
- Các tiêu đề của các component nhỏ hơn bên dưới nên sử dụng các thẻ `<h2>` hoặc `<h3>` để thể hiện cấp bậc nhỏ hơn trong sơ đồ phân cấp thông tin.

---

## ⚡ 4. Cập nhật State: Sử dụng Functional State Update Pattern

Khi cập nhật một state mà giá trị mới phụ thuộc vào giá trị state cũ trước đó, **tuyệt đối không** đọc trực tiếp giá trị state hiện tại như thế này:
```javascript
// ❌ Avoid this:
setCount(count + 1);
```
Vì React thực hiện gộp (batch) các cập nhật state một cách bất đồng bộ, `count` có thể chứa giá trị cũ (stale) tại thời điểm thực thi.

### Cách viết đúng (Functional Update):
```javascript
// ✅ Do this:
setCount((prevCount) => prevCount + 1);
```
Bằng cách truyền vào một hàm callback, React đảm bảo tham số `prevCount` luôn luôn chứa giá trị state mới nhất và chính xác nhất.

---

## 🧩 5. Tránh lạm dụng React Fragments thừa

Chỉ sử dụng React Fragments (`<>...</>`) khi bạn thực sự cần trả về nhiều phần tử đồng cấp nằm liền kề nhau.
- **Nếu component của bạn chỉ trả về một phần tử duy nhất** (ví dụ: chỉ có một thẻ `<div>` hoặc một thẻ `<header>`), thì **không** bọc nó trong fragment. Việc này chỉ tổ làm thừa thãi cấu trúc cây JSX của bạn.

---

## 🛠️ 6. Git Hooks: Tự động hóa kiểm soát chất lượng mã nguồn

Một lập trình viên chuyên nghiệp luôn đảm bảo rằng mã nguồn bị lỗi hoặc chưa được định dạng chuẩn sẽ không bao giờ được đẩy lên kho lưu trữ chung. **Git Hooks** là các kịch bản lệnh (scripts) mà Git tự động thực thi trước các hành động quan trọng (như commit, push, hoặc merge).

Trong dự án của chúng ta, chúng ta sử dụng chung thư mục `.githooks/`. Thư mục này được cấu hình trong Git bằng lệnh:
```bash
git config core.hooksPath .githooks
```

Chúng ta đã thiết lập hai chốt chặn chất lượng quan trọng:
1. **`commit-msg` (Chốt chặn thông điệp commit):** Xác minh xem thông điệp commit của bạn có tuân thủ chuẩn **Conventional Commits** hay không (ví dụ: `feat: ...`, `fix: ...`, `docs: ...`). Nếu không đúng chuẩn, lệnh commit sẽ bị từ chối.
2. **`pre-commit` (Chốt chặn tính toàn vẹn của code):** Tự động chạy ba bài kiểm tra trước khi cho phép bạn tạo commit:
   - **Kiểm tra định dạng Prettier**: Đảm bảo tất cả các tệp tin chuẩn bị commit đã được định dạng đúng theo cấu hình Prettier.
   - **Kiểm tra lỗi ESLint**: Quét mã nguồn để phát hiện các bug logic hoặc lỗi cú pháp.
   - **Kiểm tra việc build sản phẩm (`npm run build`)**: Xác nhận ứng dụng có thể biên dịch thành công. Nếu có bất kỳ tệp tin nào bị lỗi biên dịch, hành động commit sẽ lập tức bị chặn lại!

---

## 🧠 Kiểm tra kiến thức

Kiểm tra mức độ hiểu bài của bạn. Nhấp vào **Reveal Answer** để xác nhận câu trả lời.

### 1. Tại sao cách cập nhật state dạng hàm (`prev => prev + 1`) lại an toàn hơn cách viết `likes + 1`?
<details>
  <summary><b>Reveal Answer</b></summary>

  React cập nhật state bất đồng bộ. Nếu nhiều cập nhật state xảy ra trong cùng một chu kỳ render (hoặc khi người dùng click chuột liên tục cực nhanh), việc sử dụng `likes + 1` có thể dẫn đến việc đọc các giá trị state cũ đã lỗi thời và kết quả bộ đếm sẽ bị sai lệch. Truyền vào một hàm `(prev) => prev + 1` đảm bảo React luôn cung cấp giá trị state mới nhất tại thời điểm xử lý.
</details>

### 2. HTML ngữ nghĩa (Semantic HTML) là gì? Tại sao nó tốt hơn việc chỉ dùng toàn thẻ `div`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các phần tử HTML ngữ nghĩa (như `<nav>`, `<article>`, `<header>`) mô tả rõ ràng ý nghĩa và vai trò của chúng đối với cả trình duyệt lẫn các công cụ tìm kiếm. Nó giúp cải thiện thứ hạng tìm kiếm (SEO) và hỗ trợ đắc lực cho những người dùng sử dụng trình đọc màn hình để duyệt web (a11y).
</details>

### 3. Tại sao trên một trang web chỉ nên có duy nhất một thẻ `<h1>`?
<details>
  <summary><b>Reveal Answer</b></summary>

  Thẻ `<h1>` đại diện cho chủ đề chính và quan trọng nhất của trang. Việc có nhiều thẻ `<h1>` trên cùng một trang sẽ khiến các công cụ tìm kiếm và trình đọc màn hình bị bối rối trong việc xác định chủ đề cốt lõi của tài liệu đó.
</details>

### 4. Git Hook là gì? Hãy kể tên hai hook được cấu hình trong dự án của chúng ta.
<details>
  <summary><b>Reveal Answer</b></summary>

  Git Hook là các script tự động chạy trước hoặc sau các hành động của Git như commit hoặc push. Trong dự án này, chúng ta sử dụng:
  - **`pre-commit`**: Tự động chạy định dạng code, kiểm tra lỗi linting và chạy lệnh biên dịch dự án (build).
  - **`commit-msg`**: Kiểm tra tính hợp lệ của nội dung thông điệp commit theo chuẩn Conventional Commits.
</details>

---

## 💻 Bài tập thực hành

Áp dụng các quy tắc trên:

### 🛠️ Bài tập 1: Cải tiến component sử dụng HTML ngữ nghĩa
1. Mở tệp [`Header.jsx`](file:///d:/REACT.JS-19-MONSTER/first-react-app/src/components/Header.jsx) của bạn và kiểm tra xem nó đã sử dụng các thẻ `<header>` và `<nav>` hay chưa.
2. Mở tệp [`Footer.jsx`](file:///d:/REACT.JS-19-MONSTER/first-react-app/src/components/Footer.jsx) và xác minh xem nó đã sử dụng thẻ ngữ nghĩa `<footer>` chưa.
3. Chạy lệnh `npm run format` bên trong thư mục `first-react-app/` để tự động định dạng lại toàn bộ các tệp mã nguồn mới viết!

### 🛠️ Bài tập 2: Kiểm thử Chốt chặn chất lượng (Git Hooks)
1. Thực hiện một chỉnh sửa nhỏ thử nghiệm trong một tệp bất kỳ.
2. Thử commit thay đổi đó với thông điệp không đúng chuẩn: `git commit -m "fixed stuff"`. Xác minh xem `commit-msg` có **từ chối** commit hay không.
3. Thử cố tình tạo ra một lỗi cú pháp (ví dụ viết `const x = ` và bỏ trống phía sau). Đưa tệp vào hàng chờ (`git add .`) và thử commit với thông điệp chuẩn: `git commit -m "feat: test compilation"`. Xác minh xem commit đó có bị **chặn lại** bởi `pre-commit` (bước kiểm tra build) hay không.
4. Xóa lỗi cú pháp vừa tạo, định dạng lại code và thực hiện commit thành công!
