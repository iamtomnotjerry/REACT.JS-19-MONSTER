# Kiểm thử Component với React Testing Library (RTL) 🔍

Nếu unit testing rất phù hợp cho các hàm tiện ích, thì **Component Testing** lại xác minh rằng giao diện người dùng của bạn render chính xác và phản hồi đúng cách với các tương tác của người dùng. Trong React, **React Testing Library (RTL)** là công cụ tiêu chuẩn của ngành để kiểm thử component.

---

## ⚡ 1. Khái niệm & Tổng quan

Triết lý cốt lõi của RTL được gói gọn trong một câu:

> **"Bài kiểm thử của bạn càng giống với cách phần mềm được sử dụng thực tế, nó càng mang lại cho bạn nhiều sự tin cậy."**

* Bạn nên kiểm thử component dưới **góc nhìn của người dùng** (ví dụ: bấm nút, gõ chữ vào form, đọc văn bản trên màn hình).
* Bạn nên **tránh** kiểm thử các chi tiết triển khai (như kiểm tra giá trị `useState` nội bộ hay gọi trực tiếp các hàm hỗ trợ của component).

Hãy nghĩ theo cách này 👇

> 🧠 **Phép ẩn dụ thực tế — Thanh tra Vệ sinh Nhà hàng.**
> Một thanh tra tồi sẽ đi thẳng vào bếp và tra hỏi đầu bếp về thương hiệu chảo họ dùng và nhiệt độ chính xác của động cơ tủ lạnh. Nếu sau này nhà hàng đổi thương hiệu, vị thanh tra này hoảng loạn — dù món ăn vẫn hoàn hảo. Một thanh tra **giỏi** thì ngồi vào bàn, gọi món, rồi kiểm tra: *Món ăn có được mang ra không? Có ngon không? Có an toàn không?* Đó chính xác là điều RTL làm. Nó không quan tâm component của bạn lưu trữ state nội bộ **như thế nào**; nó chỉ quan tâm rằng khi người dùng **bấm "Increment"**, họ **thấy con số tăng lên**. Bạn cứ thoải mái refactor phần bên trong — bài kiểm thử chỉ hỏng khi *hành vi mà người dùng nhìn thấy* thực sự bị hỏng.

Đây là lý do RTL mang lại cho bạn nhiều sự tin cậy đến vậy: các bài kiểm thử của bạn vẫn vững vàng qua các lần refactor và chỉ thất bại khi một thứ mà người dùng thật sẽ nhận ra thực sự bị hỏng.

> [!NOTE]
> RTL **không** render component của bạn ra một màn hình thật. Nó mount component vào một **virtual DOM** (do `jsdom` cung cấp) hoàn toàn nằm trong bộ nhớ của Node.js. Không có pixel nào — chỉ là một cây các DOM node có thể truy vấn, hệt như cách một trình duyệt sẽ dựng lên.

> [!TIP]
> RTL có một thứ tự ưu tiên nghiêm ngặt về **cách** bạn nên truy vấn các phần tử. Hãy ưu tiên các query mà người dùng thật và công nghệ hỗ trợ dựa vào: **role → label → text → test-id** (giải pháp cuối cùng). Nếu bạn thấy mình tìm đến `getByTestId` đầu tiên, có lẽ markup của bạn chưa đủ accessible.

> [!WARNING]
> Đừng bao giờ assert dựa trên state hay props nội bộ (ví dụ `expect(component.state.count).toBe(1)`). Ngay khi bạn refactor `useState` thành `useReducer`, mọi bài kiểm thử kiểu đó sẽ vỡ vụn dù không có gì mà người dùng thấy thay đổi cả. Hãy assert dựa trên **những gì được render**, chứ không phải cách nó được tạo ra.

---

## ⚡ 2. Cài đặt & Thiết lập

Để sử dụng RTL với Vitest trong dự án React + TypeScript, hãy cài đặt test runner, testing library, các custom DOM matcher, thư viện user-event, và một virtual browser DOM (**`jsdom`**):

```bash
# Test runner + assertion library
npm install -D vitest

# React Testing Library + custom matchers (toBeInTheDocument, etc.)
npm install -D @testing-library/react @testing-library/jest-dom

# Simulates real user interactions (click, type, tab...)
npm install -D @testing-library/user-event

# The virtual browser DOM that lets components mount in Node.js
npm install -D jsdom

# Optional TypeScript types for the jest-dom matchers
npm install -D @types/testing-library__jest-dom
```

Thêm một script vào `package.json` để khởi chạy test runner trực quan:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

Cấu hình Vitest chạy trong môi trường `jsdom` tại `vitest.config.ts`:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',          // 1. Run tests inside a virtual browser DOM
    globals: true,                 // 2. Use describe/it/expect without importing them
    setupFiles: './tests/setup.ts' // 3. Run this file before every test suite
  },
});
```

Sau đó tạo tệp setup để nạp các custom matcher một lần cho toàn bộ dự án:

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'; // Adds matchers like toBeInTheDocument(), toBeDisabled(), toBeChecked()
```

> [!NOTE]
> Với `globals: true`, bạn không còn phải import `describe`, `it`, và `expect` trong mỗi tệp test nữa — chúng có sẵn ở phạm vi toàn cục, hệt như Jest. Điều này giúp các tệp test gọn gàng trên hàng chục component.

---

## 🧩 3. Viết Bài kiểm thử Component đầu tiên

Hãy cùng kiểm thử một component Counter tương tác đơn giản để thấy toàn bộ chu trình `render` → `screen` → `expect`.

### Component (`src/components/SimpleCounter.tsx`)
```tsx
import { useState } from 'react';

export const SimpleCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### Tệp kiểm thử (`src/components/SimpleCounter.test.tsx`)
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleCounter } from './SimpleCounter';

describe('SimpleCounter Component', () => {

  it('should render the initial count value as 0', () => {
    // 1. Mount the component into the virtual DOM
    render(<SimpleCounter />);

    // 2. Query the rendered element by its text
    const textElement = screen.getByText(/current count: 0/i);

    // 3. Assert it is actually on screen
    expect(textElement).toBeInTheDocument();
  });

  it('should increment the value when the button is clicked', async () => {
    render(<SimpleCounter />);

    // 1. Set up a user "session" that mimics a real person
    const user = userEvent.setup();

    // 2. Find the button the way a screen reader would (by its role + accessible name)
    const button = screen.getByRole('button', { name: /increment/i });

    // 3. Simulate a real click (async — see section 5)
    await user.click(button);

    // 4. Verify the UI updated as a user would see it
    expect(screen.getByText(/current count: 1/i)).toBeInTheDocument();
  });
});
```

Hai nhân vật chính của mọi bài kiểm thử là:
* **`render(<Component />)`** — mount component vào virtual DOM.
* **`screen`** — công cụ giúp bạn *truy vấn* virtual DOM đó, hệt như một người dùng đang đưa mắt lướt qua trang.

---

## 🚀 4. Bảng Tham chiếu Query Đầy đủ

Phần khó nhất (và cũng quan trọng nhất) của RTL là chọn **đúng query**. Mỗi query được hình thành từ hai quyết định:

1. **Biến thể nào?** → `get` vs `query` vs `find` (và các phiên bản `All` của chúng).
2. **Theo tiêu chí gì?** → role, label, text, placeholder, display value, alt text, title, hay test-id.

### 4a. Công thức Biến thể (`get` / `query` / `find`)

Có một công thức tư duy đơn giản. Hãy chọn biến thể bằng cách tự hỏi: *"Phần tử chắc chắn đang ở đây, có thể ở đây, hay sẽ xuất hiện sau?"*

| Biến thể | Trả về | Nếu tìm thấy 0 | Nếu tìm thấy nhiều | Đồng bộ / Bất đồng bộ | Dùng khi... |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`getBy...`** | một phần tử đơn | **ném** lỗi | **ném** lỗi | sync | phần tử **bắt buộc** đã có trên màn hình. |
| **`queryBy...`** | một phần tử đơn **hoặc `null`** | trả về `null` (không lỗi) | **ném** lỗi | sync | bạn muốn assert một phần tử **vắng mặt**. |
| **`findBy...`** | một **Promise** của một phần tử | reject sau timeout | reject | **async** | phần tử xuất hiện **sau** (sau khi fetch, timer, tương tác). |
| **`getAllBy...`** | một **mảng** | **ném** lỗi | trả về tất cả | sync | nhiều phần tử khớp **bắt buộc** phải tồn tại. |
| **`queryAllBy...`** | một **mảng** (có thể **rỗng `[]`**) | trả về `[]` (không lỗi) | trả về tất cả | sync | có không hoặc nhiều phần tử; an toàn khi kiểm tra `.length === 0`. |
| **`findAllBy...`** | một **Promise** của một mảng | reject sau timeout | resolve với tất cả | **async** | nhiều phần tử xuất hiện **sau**. |

> 🧩 **Công thức ghi nhớ nhanh:**
> * `get` → *"Tôi chắc chắn nó ở đó"* (ném lỗi nếu không — thất bại rõ ràng, ầm ĩ).
> * `query` → *"Có thể nó không ở đó"* (trả về `null`/`[]` — tuyệt vời để kiểm tra sự vắng mặt).
> * `find` → *"Nó sẽ sớm xuất hiện thôi"* (trả về một Promise — luôn `await` nó).
> * Thêm `All` → *"Có nhiều phần tử như vậy"* (trả về một mảng).

```typescript
// get → element MUST exist (throws if missing — your test fails immediately)
const heading = screen.getByRole('heading');

// query → assert something is NOT on screen (returns null, never throws)
expect(screen.queryByText(/error/i)).toBeNull();
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

// find → wait for async content (must await; default timeout 1000ms)
const successMessage = await screen.findByText(/load successful/i);
expect(successMessage).toBeInTheDocument();

// getAllBy → multiple elements that must all exist
const items = screen.getAllByRole('listitem');
expect(items).toHaveLength(3);

// queryAllBy → safe when the list might be empty
expect(screen.queryAllByRole('listitem')).toHaveLength(0);

// findAllBy → multiple async elements (e.g. results that load from an API)
const results = await screen.findAllByRole('listitem');
expect(results).toHaveLength(5);
```

### 4b. Bảng Tham chiếu "Theo cái gì?"

Hậu tố quyết định **thuộc tính nào** sẽ được khớp. Các mục dưới đây được liệt kê theo thứ tự ưu tiên mà RTL khuyến nghị:

| Hậu tố query | Khớp theo | Ví dụ | Phần tử điển hình |
| :--- | :--- | :--- | :--- |
| **`...ByRole`** | ARIA role (kèm accessible `name`) | `getByRole('button', { name: /submit/i })` | button, link, heading, input |
| **`...ByLabelText`** | `<label>` gắn với một form field | `getByLabelText(/email/i)` | input, select, textarea |
| **`...ByPlaceholderText`** | thuộc tính `placeholder` | `getByPlaceholderText(/search/i)` | input thiếu label |
| **`...ByText`** | nội dung văn bản hiển thị | `getByText(/welcome/i)` | paragraph, span, div |
| **`...ByDisplayValue`** | giá trị hiện tại của một field đã điền | `getByDisplayValue(/john/i)` | input đã điền sẵn |
| **`...ByAltText`** | thuộc tính `alt` | `getByAltText(/profile photo/i)` | hình ảnh |
| **`...ByTitle`** | thuộc tính `title` | `getByTitle(/tooltip/i)` | phần tử có tooltip |
| **`...ByTestId`** | thuộc tính `data-testid` | `getByTestId('custom-widget')` | giải pháp **cuối cùng** |

### 4c. Truy vấn theo Role & Mối liên hệ với Accessibility ARIA

`getByRole` là **trái tim** của RTL vì nó truy vấn các phần tử theo đúng cách mà một screen reader nhìn thấy chúng — thông qua **cây accessibility**. Các role ARIA (Accessible Rich Internet Applications) mô tả *một phần tử dùng để làm gì*. Khi bạn viết `getByRole('button')`, bạn đang khẳng định rằng phần tử đó thực sự được công nghệ hỗ trợ thông báo là một button.

Hầu hết các phần tử HTML đều có sẵn một role **ngầm định** — bạn không cần tự thêm `role="..."`:

| Phần tử HTML | ARIA role ngầm định |
| :--- | :--- |
| `<a href="...">` | `link` |
| `<button>` | `button` |
| `<h1>`–`<h6>` | `heading` |
| `<header>` | `banner` |
| `<footer>` | `contentinfo` |
| `<img alt="...">` | `img` |
| `<input type="text">` | `textbox` |
| `<input type="number">` | `spinbutton` |
| `<input type="checkbox">` | `checkbox` |
| `<ul>` / `<ol>` | `list` |
| `<li>` | `listitem` |
| `<section aria-label>` | `region` |
| phần tử có `role="alert"` | `alert` |

> [!TIP]
> Truy vấn theo role rất **bền bỉ**: nếu bạn đổi văn bản trên nút từ "Submit" thành "Send", một bài kiểm thử dùng `getByText` sẽ hỏng — nhưng `getByRole('button')` thì vẫn hoạt động. Cách này cũng buộc bạn viết **markup accessible**, vì nếu RTL không tìm được role, thì người dùng dùng screen reader cũng vậy.

```typescript
// Disambiguate two buttons with the accessible name (the visible/label text)
const submitBtn = screen.getByRole('button', { name: /submit/i });
const cancelBtn = screen.getByRole('button', { name: /cancel/i });
```

---

## 🖱️ 5. `userEvent` vs `fireEvent` — Mô phỏng một Con người Thật

Có hai cách để kích hoạt tương tác, và việc hiểu rõ sự khác biệt giữa chúng là điều then chốt.

| | `fireEvent` | `@testing-library/user-event` |
| :--- | :--- | :--- |
| Nó làm gì | dispatch **một** DOM event thô | mô phỏng **toàn bộ chuỗi event** mà người dùng thật kích hoạt |
| Gõ "hi" | một event `change` với giá trị `"hi"` | `focus → keydown h → input → keyup → keydown i → ...` |
| Độ chân thực | thấp (bỏ qua các event trung gian) | **cao** (khớp với hành vi thực tế của trình duyệt) |
| Bất đồng bộ? | đồng bộ | **trả về Promise — bắt buộc `await`** |
| Khuyến nghị? | chỉ cho các trường hợp đặc biệt | ✅ **lựa chọn mặc định** |

### Thiết lập `userEvent`

API hiện đại yêu cầu gọi `userEvent.setup()` **một lần** ở đầu mỗi bài kiểm thử (trước `render`); nó trả về một đối tượng `user` mà sau đó bạn dùng để điều khiển các thao tác:

```tsx
import userEvent from '@testing-library/user-event';

it('types into a field and clicks submit', async () => {
  const user = userEvent.setup(); // 1. Create the simulated user session
  render(<MyForm />);

  const input = screen.getByLabelText(/username/i);
  const button = screen.getByRole('button', { name: /submit/i });

  await user.type(input, 'tom_dev'); // 2. Type character-by-character (focus, keys, input, blur)
  await user.click(button);          // 3. Full mouse-down → mouse-up → click sequence

  expect(screen.getByText(/submitted: tom_dev/i)).toBeInTheDocument();
});
```

Các phương thức `user` thường dùng: `click()`, `dblClick()`, `type()`, `clear()`, `tab()`, `hover()`, `keyboard()`, `selectOptions()`, `upload()`.

> [!WARNING]
> **Bạn PHẢI `await` mọi hành động `userEvent`.** Mỗi hành động chạy bất đồng bộ để mô phỏng trung thực nhịp thời gian của trình duyệt. Quên `await` là nguyên nhân số 1 gây ra các bài kiểm thử component flaky, thất bại lúc được lúc không — assertion của bạn chạy *trước khi* React kịp hoàn tất re-render, nên phần tử bạn mong đợi vẫn chưa xuất hiện.

---

## 🔁 6. Setup & Teardown — `beforeEach` / `afterEach`

Khi nhiều bài kiểm thử trong cùng một suite chia sẻ một bước chuẩn bị giống nhau (ví dụ: mọi bài kiểm thử đều render cùng một component), việc lặp lại `render(...)` trở nên rườm rà. Vitest cung cấp cho bạn các lifecycle hook:

| Hook | Chạy |
| :--- | :--- |
| `beforeAll` | **một lần**, trước bất kỳ bài kiểm thử nào trong khối |
| `beforeEach` | trước **mỗi** bài kiểm thử |
| `afterEach` | sau **mỗi** bài kiểm thử |
| `afterAll` | **một lần**, sau tất cả bài kiểm thử trong khối |

```tsx
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FindAllByQueries Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();  // fresh user session for each test
    render(<FindAllByQueries />); // re-mount a clean component before every test
  });

  afterEach(() => {
    cleanup(); // unmount and wipe the virtual DOM (auto-run by RTL when globals are on)
  });

  it('finds all the paragraphs by text', async () => {
    const paragraphs = await screen.findAllByText(/item \d/);
    expect(paragraphs).toHaveLength(3);
  });

  it('finds all the buttons by role', async () => {
    const buttons = await screen.findAllByRole('button');
    expect(buttons).toHaveLength(3);
  });
});
```

> [!NOTE]
> RTL tự động gọi `cleanup()` sau mỗi bài kiểm thử khi `globals` của Vitest được bật, nên `afterEach(cleanup)` tường minh ở trên thường là không bắt buộc. Nó được trình bày ở đây để bạn hiểu *điều gì đang diễn ra* — mỗi bài kiểm thử bắt đầu từ một DOM mới tinh, biệt lập, không còn node thừa nào sót lại từ bài kiểm thử trước.

---

## 🧪 7. Một Ví dụ Thực tế — Kiểm thử Todo List với Tương tác Người dùng + Bất đồng bộ

Đây là nơi mọi thứ hội tụ: một controlled form, thao tác gõ và bấm bằng `userEvent`, `getByRole`, và một assertion **bất đồng bộ** với `waitFor`.

### Component (`src/components/TodoList.tsx`)
```tsx
import { useState, type ChangeEvent } from 'react';

interface Todo {
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTodo(e.target.value);
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { text: newTodo, completed: false }]);
      setNewTodo(''); // reset the controlled input
    }
  };

  const handleToggleTodo = (index: number) => {
    const updated = [...todos];
    updated[index].completed = !updated[index].completed;
    setTodos(updated);
  };

  const handleDeleteTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input
        type="text"
        value={newTodo}
        onChange={handleInputChange}
        placeholder="Enter new todo"
      />
      <button onClick={handleAddTodo}>Add Todo</button>

      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(index)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => handleDeleteTodo(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Tệp kiểm thử (`src/components/TodoList.test.tsx`)
```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';

describe('TodoList Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    render(<TodoList />); // fresh component before every test
  });

  it('should render the input and the add button', () => {
    expect(screen.getByPlaceholderText(/enter new todo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add todo/i })).toBeInTheDocument();
  });

  it('can add a todo item', async () => {
    const input = screen.getByPlaceholderText(/enter new todo/i);
    const addButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Learn RTL'); // simulate real typing
    await user.click(addButton);         // simulate the click that commits it

    // The new todo should now be visible on screen
    expect(screen.getByText(/learn rtl/i)).toBeInTheDocument();
  });

  it('can mark a todo as completed', async () => {
    const input = screen.getByPlaceholderText(/enter new todo/i);
    await user.type(input, 'Buy milk');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked(); // starts unchecked

    await user.click(checkbox);
    expect(checkbox).toBeChecked();     // toggled on after the click
  });

  it('can delete a todo item (async assertion)', async () => {
    const input = screen.getByPlaceholderText(/enter new todo/i);
    await user.type(input, 'Temporary task');
    await user.click(screen.getByRole('button', { name: /add todo/i }));

    // Confirm it appeared first
    expect(screen.getByText(/temporary task/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete/i }));

    // waitFor retries the callback until it passes (or times out) —
    // perfect for asserting something has been REMOVED after a state update
    await waitFor(() => {
      expect(screen.queryByText(/temporary task/i)).not.toBeInTheDocument();
    });
  });
});
```

Chỉ riêng suite này đã vận dụng toàn bộ bộ công cụ: `getByPlaceholderText`, `getByRole`, `getByText`/`queryByText`, `toBeChecked`, `user.type`, `user.click`, bước setup `beforeEach`, và một `waitFor` bất đồng bộ cho thao tác xóa.

---

## 🧠 Kiểm tra Kiến thức

Trả lời các câu hỏi sau để kiểm tra mức độ hiểu của bạn về component testing. Bấm **Reveal Answer** để đối chiếu đáp án.

### 1. Tại sao RTL khuyến nghị dùng `getByRole` thay vì các query như `getByText`?
<details>
  <summary><b>Reveal Answer</b></summary>

  `getByRole` truy vấn các phần tử thông qua **cây accessibility** (các role như `button`, `heading`, `link`), phản ánh đúng cách mà screen reader và người dùng bàn phím tương tác với trang. Điều này đảm bảo HTML của bạn được cấu trúc accessible (thân thiện A11y) và giúp các bài kiểm thử trở nên **bền bỉ** — chúng không hỏng khi bạn thay đổi văn bản nhãn hiển thị, mà chỉ hỏng khi hành vi tương tác thực sự thay đổi. Thứ tự ưu tiên mà RTL khuyến nghị là **role → label → text → test-id (giải pháp cuối cùng)**.
</details>

### 2. Sự khác biệt giữa `@testing-library/user-event` và `fireEvent` cũ là gì?
<details>
  <summary><b>Reveal Answer</b></summary>

  - `fireEvent` dispatch **một DOM event thô đơn lẻ** (ví dụ một event `change`) theo cách lập trình.
  - `userEvent` mô phỏng **toàn bộ quy trình thao tác của người dùng**. Ví dụ, `await user.type(input, 'hi')` kích hoạt `focus`, rồi `keydown`/`input`/`keyup` cho từng ký tự, rồi `blur` — hệt như một trình duyệt thật. Bạn tạo session với `userEvent.setup()` và mỗi hành động đều trả về một Promise, nên `userEvent` tái hiện các tương tác thật trung thực hơn nhiều và là cách tiếp cận **mặc định được khuyến nghị**.
</details>

### 3. Giải thích sự khác biệt giữa `getBy`, `queryBy`, và `findBy`, bao gồm cả việc mỗi cái trả về gì khi không tìm thấy phần tử.
<details>
  <summary><b>Reveal Answer</b></summary>

  - **`getBy...`** — đồng bộ; trả về phần tử, nhưng **ném lỗi** nếu nó không tồn tại. Dùng khi phần tử bắt buộc phải đã có sẵn.
  - **`queryBy...`** — đồng bộ; trả về phần tử hoặc **`null`** (không bao giờ ném lỗi). Dùng để assert rằng một phần tử **vắng mặt**: `expect(screen.queryByText(/error/i)).toBeNull()`.
  - **`findBy...`** — **bất đồng bộ**; trả về một **Promise** resolve khi phần tử xuất hiện, hoặc reject sau một khoảng timeout. Dùng (kèm `await`) cho nội dung tải sau — phản hồi API, timer, hay render sau tương tác.

  Các biến thể `All` (`getAllBy`, `queryAllBy`, `findAllBy`) trả về **mảng** thay vì một phần tử đơn lẻ; `queryAllBy` trả về một **mảng rỗng `[]`** khi không có gì khớp.
</details>

### 4. Tại sao bạn phải `await` mọi hành động `userEvent`, và lỗi gì xuất hiện nếu bạn quên?
<details>
  <summary><b>Reveal Answer</b></summary>

  Mọi phương thức `userEvent` (`click`, `type`, v.v.) đều chạy **bất đồng bộ** để mô phỏng trung thực nhịp thời gian của trình duyệt và để React kịp flush các cập nhật state cùng việc re-render. Nếu bạn quên `await`, assertion của bạn sẽ thực thi **trước khi** component re-render xong, nên phần tử mong đợi vẫn chưa có trong DOM. Điều này tạo ra các **bài kiểm thử flaky** thất bại lúc được lúc không — sai lầm RTL phổ biến nhất.
</details>

### 5. Mục đích của `beforeEach` là gì, và tại sao RTL giữ cho mỗi bài kiểm thử biệt lập?
<details>
  <summary><b>Reveal Answer</b></summary>

  `beforeEach` chạy một hàm setup **trước mỗi bài kiểm thử riêng lẻ** trong một khối `describe` — thường là `render(<Component />)` và `userEvent.setup()` — để mỗi bài kiểm thử bắt đầu từ một bước chuẩn bị giống hệt nhau, mới tinh mà không phải lặp lại boilerplate. RTL giữ cho các bài kiểm thử **biệt lập** bằng cách gọi `cleanup()` sau mỗi bài (tự động khi `globals` của Vitest được bật), unmount component và xóa sạch virtual DOM. Điều này đảm bảo một bài kiểm thử không bao giờ có thể rò rỉ node đã render hay state sang bài tiếp theo, qua đó loại bỏ các thất bại phụ thuộc thứ tự và khó debug.
</details>

---

## 💻 Bài tập Thực hành

Áp dụng những gì bạn đã học vào môi trường dự án của mình.

### 🛠️ Bài tập 1: Kiểm thử một component Search Form
1. Tạo một component `SearchForm.tsx` (dùng phần mở rộng `.tsx`).
2. Nó cần chứa một text input có label, một nút submit, và một paragraph kết quả chỉ render `"Search term: [User Query]"` sau khi submit.
3. Tạo một tệp kiểm thử `SearchForm.test.tsx`.
4. Thêm một `beforeEach` gọi `userEvent.setup()` và render component.
5. Viết các test case xác minh:
   - Input rỗng khi mount (`getByRole('textbox')` → `toHaveValue('')`).
   - Gõ vào input sẽ cập nhật giá trị của nó (`await user.type(...)` → `toHaveValue('react')`).
   - Bấm submit sẽ render paragraph kết quả với từ khóa đã gõ, truy vấn qua `getByText(/search term: react/i)`.
   - Trước khi submit, paragraph kết quả **vắng mặt** (`queryByText(...)` → `not.toBeInTheDocument()`).
6. Chạy `npm run test:ui` và xác nhận tất cả bài kiểm thử đều pass.

### 🛠️ Bài tập 2: Kiểm thử một UserProfile loader bất đồng bộ
1. Tạo `UserProfile.tsx` mà khi mount sẽ hiển thị `"Loading..."`, rồi sau một độ trễ mô phỏng 500ms (dùng `setTimeout` bên trong một `useEffect`) thay nó bằng `"Welcome, [name]"`.
2. Tạo `UserProfile.test.tsx`.
3. Viết các test case xác minh:
   - Văn bản loading xuất hiện **ngay lập tức** khi mount (`getByText(/loading/i)`).
   - Thông báo welcome xuất hiện **sau đó** bằng một async query: `expect(await screen.findByText(/welcome, tom/i)).toBeInTheDocument()`.
   - Văn bản loading cuối cùng **bị gỡ bỏ** — bọc assertion trong `waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument())`.
4. Ghi chú lại **biến thể nào** bạn dùng ở mỗi bước và tại sao: `getBy` cho thứ đã có sẵn, `findBy` cho thứ xuất hiện sau, `queryBy` cho thứ lẽ ra đã biến mất.
5. Chạy test runner của bạn và xác nhận mọi assertion đều pass.
