# Tạo Store Zustand & Các Kỹ thuật Selector 🐻

**Zustand** là một thư viện quản lý trạng thái (state-management) nhỏ gọn, nhanh và có khả năng mở rộng dành cho React. Thư viện này nổi tiếng vì gần như không có code mẫu rườm rà (boilerplate), không yêu cầu các context provider bao bọc ứng dụng, và tận dụng React hook làm giao diện tiêu thụ chính.

---

## 📖 Khái niệm & Tổng quan

Hãy hình dung một cây component lồng nhau sâu: `App → Header → Nav → Card → User → DateTime`. Nếu một mẩu dữ liệu nằm ở trên cùng trong `App` nhưng lại cần dùng tận dưới cùng ở `DateTime`, bạn sẽ phải truyền dữ liệu đó dưới dạng prop qua từng lớp một ở giữa. Chuỗi truyền tải tẻ nhạt này được gọi là **prop drilling**. Context API có thể giải quyết vấn đề này, nhưng khi ứng dụng của bạn lớn dần, bạn thường sẽ cần đến một thư viện state chuyên dụng — Redux Toolkit hoặc **Zustand**.

Mô hình tư duy của Zustand rất đơn giản: thay vì luồn state qua các component, bạn **nhấc state ra hoàn toàn khỏi cây component** vào một *store* bên ngoài. Khi đó, bất kỳ component nào — `Card`, `Nav`, hay `DateTime` — đều có thể vươn thẳng vào store đó và lấy ra chính xác thứ nó cần.

> [!NOTE]
> Trong Zustand, các **action nằm bên trong store**, ngay cạnh state mà chúng cập nhật. Một store gói cả dữ liệu (`count`) lẫn các hàm biến đổi dữ liệu đó (`increment`, `decrement`) vào trong một object duy nhất. Cách này giúp logic state của bạn được đặt chung một chỗ và dễ suy luận, thay vì bị phân tán rải rác qua các reducer, action creator và dispatcher.

> [!TIP]
> Luôn **chọn các lát cắt (slice) hẹp** của state bằng một selector — `useStore((state) => state.count)` — thay vì lấy toàn bộ store. Một component đăng ký lắng nghe một slice duy nhất chỉ re-render khi slice đó thay đổi, qua đó tránh được một loạt re-render không cần thiết khắp giao diện của bạn.

### 🏬 Một Phép ẩn dụ thực tế: Nhà kho

Hãy hình dung một store của Zustand như một **nhà kho trung tâm** nằm bên ngoài khu vực cửa hàng (cây React):

- **Nhà kho** chứa toàn bộ hàng hóa (state của bạn) tại một nơi.
- Mỗi **nhân viên bán hàng** (một component) không vác cả nhà kho đi theo. Thay vào đó họ bước vào với một danh sách mua hàng chính xác — một **selector** — và chỉ lấy đúng món đồ họ cần.
- Khi một kệ hàng được nhập thêm (một slice cập nhật), chỉ những nhân viên đã yêu cầu *món đồ đó* mới được thông báo. Những nhân viên cầm danh sách cho các kệ khác vẫn tiếp tục làm việc mà không bị làm phiền.

Đây chính là lý do Zustand không cần `<Provider>` ở gốc — nhà kho tồn tại độc lập với cửa hàng, dưới dạng một closure ở cấp module.

### 🆚 Zustand so với các cách tiếp cận khác

| Tính năng | Prop Drilling | Context API | Redux Toolkit | **Zustand** |
| --- | --- | --- | --- | --- |
| Cần bao bọc Provider | Không | ✅ Có | ✅ Có | ❌ Không |
| Code mẫu (boilerplate) | Thấp (nhưng tẻ nhạt) | Trung bình | Cao | **Rất thấp** |
| Kiểm soát re-render | Thủ công | Toàn bộ consumer re-render | Qua `useSelector` | **Selector tích hợp sẵn** |
| Truy cập ngoài component | Không | Không | Qua `store.dispatch` | **Có (`useStore.setState`)** |
| Phù hợp nhất cho | 1–2 lớp | State nhỏ/tĩnh | Ứng dụng lớn, phức tạp | **Hầu hết ứng dụng, mở rộng nhanh** |

```text
        Prop Drilling                        Zustand
   App (data) ──┐                       ┌──────────────┐
                │ prop                  │    STORE      │ (external closure)
            Header                      │  count: 0     │
                │ prop                  │  increment()  │
              Card                      └──────┬────────┘
                │ prop                     ▲   │   ▲
             DateTime  <- finally used     │   │   │  selectors
                                        Card Nav DateTime
```

---

## ⚡ 1. Cài đặt

Để thêm Zustand vào ứng dụng React của bạn, hãy chạy lệnh sau trong terminal:

```bash
npm install zustand
```

---

## 🧩 2. Tạo Store đầu tiên của bạn

Trong Zustand, một store chính là một React hook. Bạn tạo nó bằng hàm **`create`**, hàm này nhận vào một callback `set` để định nghĩa các giá trị state và các hàm (action) dùng để cập nhật những giá trị đó:

```javascript
import { create } from 'zustand';

// Create a custom hook named 'useCounterStore'
export const useCounterStore = create((set) => ({
  // 1. State values
  count: 0,
  title: "Zustand Counter",

  // 2. Actions (state updates) — these live INSIDE the store
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }), // Direct state replacement
  updateTitle: (newTitle) => set({ title: newTitle })
}));
```

> [!WARNING]
> Hàm `set` của Zustand thực hiện **gộp nông (shallow merge)**, không phải gộp sâu (deep merge). Gọi `set({ count: 1 })` vẫn giữ nguyên `title`, nhưng đối với các object lồng nhau bạn phải tự spread các giá trị trước đó: `set((state) => ({ user: { ...state.user, name: "New" } }))`. Quên spread sẽ âm thầm ghi đè lên phần còn lại của object lồng nhau.

### 🟦 Với TypeScript

Khóa học dạy cùng store đó nhưng được định kiểu bằng TypeScript. Bạn khai báo một interface mô tả hình dạng state và các action, rồi truyền nó làm tham số kiểu cho `create`:

```typescript
import { create } from 'zustand';

// Describe the shape of the store: state + actions
interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

// Annotate create<...> so TypeScript checks every slice and action
export const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));
```

---

## 🚀 3. Tiêu thụ State của Store bằng Selector

Mặc dù bạn có thể destructure toàn bộ store, thực hành tốt nhất được khuyến nghị là dùng **Selector**. Một selector cho Zustand biết chính xác những thuộc tính nào bạn muốn đăng ký lắng nghe. Điều này tối ưu hiệu năng bằng cách ngăn component re-render khi những thuộc tính state không liên quan thay đổi:

```jsx
import { useCounterStore } from '../stores/useCounterStore';

export const CounterDisplay = () => {
  // 1. Selector retrieves ONLY the count property
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div style={styles.container}>
      <h2>Count: {count}</h2>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

// 2. A separate component subscribing ONLY to the title property
export const HeaderTitle = () => {
  const title = useCounterStore((state) => state.title);
  console.log("HeaderTitle Rendered!"); // This won't run when clicking increment!

  return <h1>{title}</h1>;
};

const styles = { container: { padding: "20px", border: "1px solid #ccc", borderRadius: "5px" } };
```

> [!TIP]
> Bạn cũng có thể đọc state hiện tại bên ngoài React bằng `useCounterStore.getState().count`, và cập nhật nó từ bất kỳ đâu — kể cả bên ngoài component — bằng `useCounterStore.setState({ count: 100 })`. Điều này khả thi vì store là một closure bên ngoài, không bị ràng buộc với cây component.

### 🔁 Hai cách truy cập cùng một dữ liệu

Khóa học minh họa hai phong cách tiêu thụ. Hãy ưu tiên dạng selector ở bên phải để có hiệu năng tốt hơn:

```jsx
// ❌ Destructuring the whole store — re-renders on ANY change
const { count, increment } = useCounterStore();

// ✅ Narrow selectors — re-renders only when THAT slice changes
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);
```

---

## 🧠 Kiểm tra kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu bài của bạn về Zustand. Nhấp vào **Reveal Answer** để xác nhận.

### 1. Tại sao Zustand không yêu cầu một thẻ bao bọc `<Provider>` ở gốc của ứng dụng React?
<details>
  <summary><b>Reveal Answer</b></summary>

  Các store của Zustand được tạo ra như những **closure bên ngoài (phạm vi state ở cấp module)** nằm ngoài cây component của React. Khi một component gọi custom hook store, nó đăng ký lắng nghe trực tiếp đến store bên ngoài này. Vì dữ liệu nằm ngoài React nên không cần một React Context Provider bao bọc ở gốc ứng dụng của bạn.
</details>

### 2. "Selector" trong Zustand là gì, và tại sao nó cực kỳ quan trọng đối với hiệu năng render?
<details>
  <summary><b>Reveal Answer</b></summary>

  Selector là một hàm callback được truyền vào hook store, trả về chỉ một lát cắt (slice) cụ thể của state (ví dụ `(state) => state.count`). Nó cực kỳ quan trọng cho hiệu năng vì nếu bạn destructure các giá trị mà không dùng selector (ví dụ `const { count, title } = useStore()`), component sẽ re-render mỗi khi *bất kỳ* thuộc tính nào trong store thay đổi. Dùng selector đảm bảo component chỉ re-render khi thuộc tính được chọn cập nhật.
</details>

### 3. Hàm `set` cập nhật state trong Zustand như thế nào? Là gộp sâu (deep merge) hay gộp nông (shallow merge)?
<details>
  <summary><b>Reveal Answer</b></summary>

  Hàm `set` của Zustand thực hiện **gộp nông (shallow merge)** object trả về với state hiện hành của store. Nếu store của bạn có các thuộc tính `{ count: 0, title: "Title" }`, gọi `set({ count: 1 })` sẽ giữ nguyên thuộc tính `title`. Tuy nhiên, đối với các object lồng nhau sâu, bạn phải tự gộp các thuộc tính một cách thủ công bằng toán tử spread (`...`).
</details>

### 4. Chúng ta có thể định nghĩa các action của Zustand bên ngoài định nghĩa store trong `create()` không?
<details>
  <summary><b>Reveal Answer</b></summary>

  Có. Vì các store của Zustand là những closure bên ngoài, bạn có thể khai báo các hàm sửa đổi state bên ngoài store bằng cách dùng các hàm tiện ích của store, ví dụ `useCounterStore.setState({ count: 100 })`. Khai báo các action bên trong store chỉ đơn thuần là một quy ước để giữ state và logic được tổ chức tại một nơi.
</details>

### 5. Trong Zustand, làm thế nào để truy cập các giá trị state hiện tại bên trong một action mà không dùng tham số state của `set`?
<details>
  <summary><b>Reveal Answer</b></summary>

  API `create()` cung cấp một tham số callback thứ hai gọi là **`get`**:
  ```javascript
  const useStore = create((set, get) => ({
    count: 0,
    checkAndIncrement: () => {
      const currentCount = get().count; // Read state value directly
      if (currentCount < 10) set({ count: currentCount + 1 });
    }
  }));
  ```
</details>

---

## 💻 Bài tập thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình:

### 🛠️ Bài tập 1: Task Store với Zustand
1. Tạo một store tên là `useTodoStore.js` trong `src/stores/`.
2. Định nghĩa một mảng state `todos` được khởi tạo là mảng rỗng.
3. Thêm ba action bên trong store:
   - `addTodo(text)`: Nối thêm một todo mới `{ id: Date.now(), text, completed: false }`.
   - `toggleTodo(id)`: Lặp qua `todos` và đảo ngược `completed` cho phần tử có ID trùng khớp.
   - `deleteTodo(id)`: Lọc bỏ todo có ID trùng khớp.
4. Xây dựng một component React `TodoList.tsx` tiêu thụ store này bằng các selector và render các phần tử danh sách lên màn hình.

**Mục tiêu nâng cao:** Thêm một action `clearCompleted()` lọc bỏ mọi todo có `completed` là `true`, và một selector dẫn xuất trong component để đếm số todo còn lại (chưa hoàn thành) — đảm bảo bộ đếm đó chỉ re-render khi con số thực sự thay đổi.

### 🛠️ Bài tập 2: Recipe Store có định kiểu (TypeScript)
Tái tạo lại recipe store đã được minh họa trong khóa học, được định kiểu đầy đủ.

1. Định nghĩa một interface `Recipe` với `id: number`, `name: string`, `ingredients: string[]`, và `instructions: string`.
2. Định nghĩa một interface `RecipeStore` chứa `recipes: Recipe[]`, `addRecipe(recipe: Recipe): void`, và `removeRecipe(id: number): void`.
3. Tạo store với `create<RecipeStore>((set) => ({ ... }))`:
   - `addRecipe` nên spread các recipe hiện có rồi nối thêm cái mới: `set((state) => ({ recipes: [...state.recipes, recipe] }))`.
   - `removeRecipe` nên lọc theo id: `set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))`.
4. Xây dựng một component `RecipeList.tsx` đăng ký lắng nghe `recipes` bằng một **selector hẹp** và render tên cùng danh sách nguyên liệu được nối chuỗi của từng recipe.

```tsx
import { create } from 'zustand';

// 1. Shape of a single recipe item
interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string;
}

// 2. Shape of the store: state + actions
interface RecipeStore {
  recipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: number) => void;
}

// 3. Create the typed store
export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  // Clone existing recipes, then append the new one (shallow merge)
  addRecipe: (recipe) =>
    set((state) => ({ recipes: [...state.recipes, recipe] })),
  // Keep only the recipes whose id does NOT match the one to remove
  removeRecipe: (id) =>
    set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }))
}));
```

**Mục tiêu nâng cao:** Thêm một action `updateRecipe(id, updated)` thay thế tại chỗ một recipe trùng khớp, và kết nối một luồng chỉnh sửa-và-lưu (edit-and-save) trong component.
