# Vitest: Mocking, Spying & Fake Timers 🎭

Trong bài học trước, bạn đã viết các test *render* một component và assert dựa trên những gì người dùng nhìn thấy. Nhưng các ứng dụng thực tế đầy rẫy những thứ mà bạn **không** muốn một unit test thực sự chạy: network call, ghi database, third-party SDK, `Date.now()`, `setTimeout`, các analytics ping. Một unit test tốt sẽ cô lập **unit cần test** và thay thế mọi thứ còn lại bằng một bản thế thân được kiểm soát. Bản thế thân đó chính là một **mock**.

Trong bài học này, bạn sẽ thành thạo bộ công cụ mocking của Vitest: `vi.fn()` để tạo các callback giả mà bạn có thể kiểm tra, `vi.spyOn()` để bọc và quan sát một method thật của một object, `vi.mock()` để thay thế cả một module (chẳng hạn như tầng API của bạn), và **fake timers** để khiến code phụ thuộc thời gian (debounce, throttle, polling) chạy ngay lập tức và mang tính tất định. Bạn cũng sẽ học về *vòng đời* của mock — sự khác biệt giữa `clear`, `reset` và `restore` — vốn là nguyên nhân phổ biến nhất gây ra các test không ổn định (flaky).

> [!NOTE]
> Trong khóa học được ghi hình, giảng viên dùng `vi.fn()` để mock một callback prop (ví dụ handler `onPageChange` của một component phân trang) và assert nó bằng `toHaveBeenCalledWith(...)`. Phần đó **bám sát** transcript. Mọi thứ khác trong bài học này — `mockReturnValue`/`mockResolvedValue`/`mockImplementation`, `vi.spyOn`, `vi.mock`, vòng đời clear/reset/restore, và fake timers — là nội dung **hoàn toàn mới** ngoài bản ghi hình. Nó phản ánh các best practice hiện hành của Vitest (Vitest 3.x) và những pattern mà các team React chuyên nghiệp dựa vào.

---

## ⚡ 1. Khái niệm & Tổng quan: Mock Là Gì?

Một **mock** (cũng được gọi một cách lỏng lẻo là "test double") là một implementation giả thế chỗ cho một dependency thật trong suốt quá trình test. Nó phục vụ hai mục đích:

1. **Kiểm soát** — bạn quyết định chính xác nó trả về gì, nhờ đó test mang tính tất định.
2. **Kiểm tra** — nó ghi lại mọi lần gọi (các tham số, số lần gọi, thứ tự) để bạn có thể assert *cách* code của bạn đã sử dụng nó.

Vitest cung cấp cho bạn ba cấp độ làm giả tăng dần, và chọn đúng cấp độ chính là phần lớn của kỹ năng này:

| Công cụ | Làm giả cái gì | Trường hợp dùng điển hình | Dọn dẹp |
| --- | --- | --- | --- |
| `vi.fn()` | Một function độc lập | Một callback prop, một dependency được tiêm vào | `mockClear` / `mockReset` |
| `vi.spyOn(obj, "m")` | Một **method trên một object thật** | Theo dõi `console.error`, stub `Math.random`, quan sát một method của service trong khi giữ nguyên phần còn lại của object | `mockRestore` (đặt bản gốc trở lại) |
| `vi.mock("module")` | **Cả một module** | Thay thế `api.ts` / `db.ts` của bạn để không có network thật xảy ra | `vi.unmock` / tự động theo từng file |

### 🛠️ Một phép ẩn dụ thực tế: diễn viên đóng thế trong phim

Hãy tưởng tượng bạn đang quay một bộ phim hành động. Diễn viên chính (dependency thật của bạn) thì đắt đỏ, dễ tổn thương, và bạn không thể bắt họ nhảy khỏi tòa nhà cho mỗi cú quay. Vì vậy bạn mời đến ba kiểu thế thân:

- **`vi.fn()`** là một **diễn viên đóng thế hoàn toàn mới** được thuê từ con số không — không có phiên bản "thật", bạn tạo ra một người thuần túy cho cảnh này và bảo họ làm chính xác điều gì ("ngã xuống, rồi giơ ngón tay cái lên").
- **`vi.spyOn()`** là việc **gắn một camera giấu kín lên trang phục của diễn viên thật**. Theo mặc định, diễn viên vẫn diễn bình thường, nhưng giờ bạn có thể xem lại đoạn phim sau đó ("họ đã tung ra bao nhiêu cú đấm?"). Bạn *cũng có thể* bảo họ giả vờ làm cú đóng thế nếu muốn — và quan trọng là, bạn phải **gỡ camera ra sau đó** (`mockRestore`) để trang phục sạch sẽ cho cảnh tiếp theo.
- **`vi.mock()`** là việc **thay thế toàn bộ nhân vật** — mọi cảnh tham chiếu đến "API của nhân vật phản diện" giờ đây dùng một con rối mà bạn hoàn toàn kiểm soát, cho cả buổi quay.

Đạo diễn (chính là bạn) xem lại đoạn phim — số lần gọi và các tham số — để xác nhận cảnh diễn ra đúng y như kịch bản.

---

## ⚡ 2. `vi.fn()` — Tạo & Kiểm Tra Các Mock Function

`vi.fn()` trả về một function mà theo mặc định không làm gì nhưng **ghi nhớ mọi thứ**. Bạn cấu hình giá trị trả về của nó và sau đó assert về cách nó đã được gọi.

### 🧩 Cấu hình hành vi

```typescript
// src/__tests__/vi-fn-behavior.test.ts
import { describe, it, expect, vi } from "vitest";

describe("vi.fn() behavior configuration", () => {
  it("returns a fixed value with mockReturnValue", () => {
    const getDiscount = vi.fn();
    getDiscount.mockReturnValue(0.1); // always returns 10%

    expect(getDiscount()).toBe(0.1);
    expect(getDiscount("ignored-argument")).toBe(0.1);
  });

  it("resolves a promise with mockResolvedValue", async () => {
    // Perfect for faking an async API client method.
    const fetchUser = vi.fn();
    fetchUser.mockResolvedValue({ id: 1, name: "Ada" });

    await expect(fetchUser()).resolves.toEqual({ id: 1, name: "Ada" });
  });

  it("rejects a promise with mockRejectedValue", async () => {
    const fetchUser = vi.fn();
    fetchUser.mockRejectedValue(new Error("Network down"));

    await expect(fetchUser()).rejects.toThrow("Network down");
  });

  it("runs custom logic with mockImplementation", () => {
    // Use when the return value must depend on the arguments.
    const add = vi.fn((a: number, b: number) => a + b);

    expect(add(2, 3)).toBe(5);
    expect(add(10, 5)).toBe(15);
  });

  it("queues one-shot values with mockReturnValueOnce", () => {
    const next = vi.fn().mockReturnValue("default");
    next.mockReturnValueOnce("first").mockReturnValueOnce("second");

    expect(next()).toBe("first"); // consumed
    expect(next()).toBe("second"); // consumed
    expect(next()).toBe("default"); // falls back to the base value
  });
});
```

> [!TIP]
> Hãy dùng `mockResolvedValue(x)` / `mockRejectedValue(e)` thay vì `mockReturnValue(Promise.resolve(x))`. Chúng là dạng viết tắt cho chính điều đó, nhưng đọc dễ hiểu hơn và làm cho ý định "đây là bất đồng bộ" trở nên rõ ràng.

### 🧩 Assert trên các lần gọi

Mỗi `vi.fn()` đều ghi lại các lần gọi của nó. Đây là những matcher mà bạn sẽ dùng liên tục:

```typescript
// src/__tests__/vi-fn-assertions.test.ts
import { describe, it, expect, vi } from "vitest";

// The unit under test: a pure function that receives a callback (dependency injection).
// In React this is exactly the shape of a callback prop like onPageChange.
function applyCoupon(
  price: number,
  code: string,
  onApplied: (finalPrice: number, code: string) => void,
): number {
  const discount = code === "SAVE10" ? 0.1 : 0;
  const finalPrice = price * (1 - discount);
  onApplied(finalPrice, code); // notify the caller
  return finalPrice;
}

describe("applyCoupon notifies its callback", () => {
  it("calls the callback with the final price and code", () => {
    const onApplied = vi.fn(); // a brand-new stunt double

    const result = applyCoupon(100, "SAVE10", onApplied);

    expect(result).toBe(90);
    expect(onApplied).toHaveBeenCalled(); // was it called at all?
    expect(onApplied).toHaveBeenCalledTimes(1); // exactly once
    expect(onApplied).toHaveBeenCalledWith(90, "SAVE10"); // with these exact args
  });

  it("exposes the raw call log via .mock.calls", () => {
    const onApplied = vi.fn();

    applyCoupon(50, "NONE", onApplied);

    // .mock.calls is an array of argument-arrays, one per invocation.
    expect(onApplied.mock.calls).toEqual([[50, "NONE"]]);
    // .mock.lastCall is the most recent argument-array.
    expect(onApplied.mock.lastCall).toEqual([50, "NONE"]);
  });
});
```

> [!NOTE]
> Khi bạn chỉ quan tâm rằng *một số* tham số khớp và muốn bỏ qua phần còn lại, hãy dùng **asymmetric matcher**: `expect(fn).toHaveBeenCalledWith(expect.any(Number), expect.stringContaining("SAVE"))`. Điều này giữ cho test bền vững trước những thay đổi tham số không liên quan.

---

## ⚡ 3. `vi.spyOn()` — Quan Sát (và Tùy Chọn Thay Thế) Các Method Thật

`vi.fn()` tạo ra một function từ con số không. Nhưng thường thì bạn muốn theo dõi một method **đã tồn tại sẵn** trên một object thật — mà không phải viết lại object đó. Đó chính là `vi.spyOn(object, "method")`.

Theo mặc định, một spy **vẫn gọi xuyên qua đến implementation gốc** trong khi ghi lại các lần gọi. Sau đó bạn có thể *tùy chọn* override nó bằng `.mockImplementation()` / `.mockReturnValue()`, và bạn **phải** đặt bản gốc trở lại bằng `.mockRestore()`.

```typescript
// src/__tests__/vi-spyon.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";

// A small service object — note paySvc.charge is a REAL method.
const paymentService = {
  rate: 1.2,
  charge(amount: number): number {
    return Math.round(amount * this.rate); // real business logic
  },
};

describe("vi.spyOn observes a real method", () => {
  afterEach(() => {
    // CRITICAL: restore every spy so later tests see the real object.
    vi.restoreAllMocks();
  });

  it("records calls while keeping the real implementation (call-through)", () => {
    const spy = vi.spyOn(paymentService, "charge");

    const result = paymentService.charge(100); // real logic still runs

    expect(result).toBe(120); // 100 * 1.2, rounded
    expect(spy).toHaveBeenCalledWith(100);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("can replace the implementation when you don't want the real one", () => {
    const spy = vi
      .spyOn(paymentService, "charge")
      .mockReturnValue(999); // stub it out entirely

    expect(paymentService.charge(100)).toBe(999); // real logic skipped
    expect(spy).toHaveBeenCalledOnce();
  });

  it("silences a noisy console.error during a test", () => {
    // A very common spy: stop expected error logs from polluting test output.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    console.error("this would normally print red noise");

    expect(errorSpy).toHaveBeenCalledWith("this would normally print red noise");
    // afterEach -> restoreAllMocks() puts console.error back to normal.
  });
});
```

> [!WARNING]
> Nếu bạn `mockImplementation` một spy và quên `mockRestore()` (hoặc `vi.restoreAllMocks()`), bản override sẽ **rò rỉ sang mọi test sau đó trong file**. Một `console.error` đã bị spy-và-stub mà không bao giờ được restore có thể âm thầm nuốt chửng các lỗi thật cho phần còn lại của suite. Luôn luôn ghép `vi.spyOn(...).mockImplementation(...)` với một lệnh restore trong `afterEach`.

### Ba thứ trông giống nhau khác nhau như thế nào

```
vi.fn()                  -> no original. A function born for the test.
vi.spyOn(obj,"m")        -> wraps obj.m. Calls through by default. Restorable.
vi.spyOn(obj,"m")
   .mockImplementation() -> wraps AND replaces obj.m. Restorable.
```

---

## ⚡ 4. `vi.mock()` — Thay Thế Cả Một Module

Khi component của bạn import cả một module — chẳng hạn `import { fetchProducts } from "../api/products"` — bạn không muốn có HTTP call thật trong một unit test. `vi.mock("../api/products")` thay thế **cả module** bằng các mock cho toàn bộ test file.

> [!NOTE]
> `vi.mock()` được Vitest **hoist** (nâng lên đầu file) trước khi bất kỳ import nào chạy, bất kể bạn viết nó ở đâu. Điều đó là cố ý — module phải được thay thế *trước khi* file cần test import nó. Một hệ quả: bạn không thể tham chiếu các biến ở scope bên ngoài bên trong factory trừ khi bạn bọc chúng trong `vi.hoisted()` (được trình bày bên dưới).

### 🛠️ Module được mock

```typescript
// src/api/products.ts  — the REAL module (makes a network request)
export interface Product {
  id: number;
  name: string;
  price: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("https://api.example.com/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}
```

### 🛠️ Code cần test

```tsx
// src/components/ProductList.tsx
import { useEffect, useState } from "react";
import { fetchProducts, type Product } from "../api/products";

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          {p.name} — ${p.price}
        </li>
      ))}
    </ul>
  );
}
```

### 🛠️ Test — dạng factory

```tsx
// src/components/__tests__/ProductList.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "../ProductList";
import { fetchProducts, type Product } from "../../api/products";

// Replace the whole ../../api/products module with a factory.
// The factory must return an object shaped like the module's exports.
vi.mock("../../api/products", () => ({
  fetchProducts: vi.fn(), // a mock we will program per-test
}));

// Tell TypeScript that fetchProducts is now a mock, so .mockResolvedValue exists.
const mockedFetch = vi.mocked(fetchProducts);

describe("ProductList", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // wipe call history between tests
  });

  it("renders products returned by the mocked api", async () => {
    const fake: Product[] = [
      { id: 1, name: "Keyboard", price: 80 },
      { id: 2, name: "Mouse", price: 30 },
    ];
    mockedFetch.mockResolvedValue(fake);

    render(<ProductList />);

    // findBy* waits for the async useEffect + state update.
    expect(await screen.findByText("Keyboard — $80")).toBeInTheDocument();
    expect(screen.getByText("Mouse — $30")).toBeInTheDocument();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  it("shows an error message when the api rejects", async () => {
    mockedFetch.mockRejectedValue(new Error("Failed to load products"));

    render(<ProductList />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Failed to load products");
  });
});
```

> [!TIP]
> `vi.mocked(fn)` **không** thay đổi hành vi runtime — nó là một helper TypeScript thuần túy giúp gán lại type cho function vốn đã được mock để các method như `.mockResolvedValue` và `.mockReturnValue` hiển thị và được type-check. Nếu không có nó, bạn sẽ thấy các đường gạch đỏ ngay cả khi code vẫn chạy.

### Dùng `vi.hoisted()` khi factory cần các biến dùng chung

Vì `vi.mock` được hoist lên trên các import của bạn, factory chạy **trước** bất kỳ `const` ở cấp top-level nào. Để chia sẻ một mock giữa factory và các test của bạn, hãy tạo nó bên trong `vi.hoisted()`:

```tsx
// src/components/__tests__/ProductList.hoisted.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductList } from "../ProductList";

// vi.hoisted runs in the same early phase as vi.mock, so this is safe to reference.
const { fetchProductsMock } = vi.hoisted(() => ({
  fetchProductsMock: vi.fn(),
}));

vi.mock("../../api/products", () => ({
  fetchProducts: fetchProductsMock, // reference the hoisted mock
}));

describe("ProductList with hoisted mock", () => {
  it("renders the resolved product", async () => {
    fetchProductsMock.mockResolvedValue([{ id: 9, name: "Webcam", price: 50 }]);

    render(<ProductList />);

    expect(await screen.findByText("Webcam — $50")).toBeInTheDocument();
  });
});
```

---

## ⚡ 5. Vòng Đời Mock: `clear` vs `reset` vs `restore`

Đây là phần khiến ai cũng vấp. Ba function nghe có vẻ giống nhau nhưng làm những việc **khác nhau**:

| Function | Xóa lịch sử gọi (`.mock.calls`) | Gỡ bỏ implementation / giá trị trả về | Khôi phục bản *gốc* (chỉ spy) |
| --- | :---: | :---: | :---: |
| `vi.clearAllMocks()` | ✅ | ❌ | ❌ |
| `vi.resetAllMocks()` | ✅ | ✅ (về lại một `vi.fn()` no-op) | ❌ |
| `vi.restoreAllMocks()` | ✅ | ✅ | ✅ (chỉ ảnh hưởng các spy `vi.spyOn`) |

Quy tắc kinh nghiệm bằng ngôn ngữ đời thường:

- **`clearAllMocks`** — "quên ai đã gọi bạn, nhưng tiếp tục hành xử như cũ." Dùng giữa các test khi *hành vi* được thiết lập một lần và bạn chỉ muốn số lần gọi mới tinh.
- **`resetAllMocks`** — "quên mọi thứ, kể cả những gì bạn được lập trình để trả về." Sau lệnh này, một mock lại trả về `undefined`. Dùng khi mỗi test tự lập trình các giá trị trả về của riêng nó.
- **`restoreAllMocks`** — "đặt method thật trở lại." **Chỉ các spy được tạo bằng `vi.spyOn` mới được khôi phục**; các mock được tạo bằng `vi.fn()` thì không. Đây là cái bạn cần để hoàn tác các override `console` và các bản vá object thật khác.

```typescript
// src/__tests__/lifecycle.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const fn = vi.fn();

describe("clearAllMocks keeps the implementation", () => {
  beforeEach(() => {
    fn.mockReturnValue("configured"); // set behavior every test
    vi.clearAllMocks(); // wipes calls, NOT the return value...
    // ...but note: we re-set the return value BEFORE clearing here,
    // so order matters. clearAllMocks does not touch mockReturnValue.
  });

  it("starts each test with zero calls but the same behavior", () => {
    expect(fn).toHaveBeenCalledTimes(0); // history was cleared
    expect(fn()).toBe("configured"); // behavior survived clear
  });
});
```

> [!WARNING]
> Hãy thiết lập những cái này một cách toàn cục trong `vitest.config.ts` để bạn không bao giờ phải dựa vào việc nhớ chúng theo từng file:
> ```typescript
> // vitest.config.ts
> import { defineConfig } from "vitest/config";
> import react from "@vitejs/plugin-react";
>
> export default defineConfig({
>   plugins: [react()],
>   test: {
>     globals: true,
>     environment: "jsdom",
>     setupFiles: "./src/setupTests.ts",
>     clearMocks: true,    // auto vi.clearAllMocks() before each test
>     restoreMocks: true,  // auto vi.restoreAllMocks() before each test
>   },
> });
> ```
> Với `restoreMocks: true`, một `vi.spyOn(console, "error")` bị quên không thể rò rỉ qua các file nữa. Một cờ config duy nhất này ngăn chặn cả một loại test flaky.

---

## ⚡ 6. Fake Timers — Test `setTimeout`, Debounce & Polling

Code phụ thuộc thời gian là cơn ác mộng để test thật sự: một debounce 300 ms nghĩa là một test chậm 300 ms. **Fake timers** cho phép bạn thay thế đồng hồ bằng một cái mà *bạn* tự tua tới, nhờ đó một vòng lặp polling 5 phút chạy trong vài microsecond và hoàn toàn mang tính tất định.

Chu trình luôn là: `vi.useFakeTimers()` → chạy code lên lịch các timer → `vi.advanceTimersByTime(ms)` (hoặc `vi.runAllTimers()`) → assert → `vi.useRealTimers()`.

| API | Nó làm gì |
| --- | --- |
| `vi.useFakeTimers()` | Thay thế `setTimeout`/`setInterval`/`Date` bằng bản giả |
| `vi.advanceTimersByTime(ms)` | Tua đồng hồ giả tới `ms`, kích hoạt mọi callback đến hạn |
| `vi.advanceTimersByTimeAsync(ms)` | Tương tự, nhưng cũng flush các microtask/promise đang chờ |
| `vi.runAllTimers()` | Kích hoạt **mọi** timer đang chờ ngay lập tức (cẩn thận với các interval vô hạn) |
| `vi.runOnlyPendingTimers()` | Chỉ kích hoạt các timer đã được lên lịch *cho đến hiện tại* (an toàn cho interval) |
| `vi.useRealTimers()` | Khôi phục đồng hồ thật — luôn làm điều này khi xong việc |

### 🛠️ Unit cần test: một tiện ích debounce

```typescript
// src/utils/debounce.ts
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

### 🛠️ Test nó với fake timers

```typescript
// src/utils/__tests__/debounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // install the fake clock
  });

  afterEach(() => {
    vi.useRealTimers(); // ALWAYS restore the real clock
  });

  it("delays the call until the delay has elapsed", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 300);

    debounced("hello");
    expect(spy).not.toHaveBeenCalled(); // nothing yet

    vi.advanceTimersByTime(299);
    expect(spy).not.toHaveBeenCalled(); // still not enough time

    vi.advanceTimersByTime(1); // total 300ms -> fires
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("hello");
  });

  it("collapses rapid calls into a single trailing call", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 200);

    debounced("a");
    debounced("b");
    debounced("c"); // each call resets the timer

    vi.advanceTimersByTime(200);

    // Only the LAST call survives the debounce window.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("c");
  });

  it("runAllTimers flushes every pending timeout at once", () => {
    const spy = vi.fn();
    const debounced = debounce(spy, 5000);

    debounced("instant");
    vi.runAllTimers(); // jump straight to the end, no ms math

    expect(spy).toHaveBeenCalledWith("instant");
  });
});
```

> [!WARNING]
> Đừng bao giờ gọi `vi.runAllTimers()` trên code dùng `setInterval` hoặc một `setTimeout` tự lên lịch lại chính nó — **không hề có "điểm kết thúc"**, nên Vitest sẽ ném lỗi sau 10.000 vòng lặp để bảo vệ bạn khỏi một vòng lặp vô hạn. Với các timer lặp lại, hãy dùng `vi.advanceTimersByTime(ms)` hoặc `vi.runOnlyPendingTimers()` thay thế.

### 🛠️ Fake timers + một React component

Khi fake timers điều khiển một state update bên trong một component, hãy tua đồng hồ **bên trong `act`** (React Testing Library re-export nó) để React flush lần re-render kết quả trước khi bạn assert:

```tsx
// src/components/__tests__/AutoSaveBadge.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useEffect, useState } from "react";

// A tiny component that shows "Saved" 1 second after mount.
function AutoSaveBadge() {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSaved(true), 1000);
    return () => clearTimeout(id);
  }, []);
  return <span>{saved ? "Saved" : "Saving…"}</span>;
}

describe("AutoSaveBadge", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("flips to 'Saved' after one second of fake time", () => {
    render(<AutoSaveBadge />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();

    // Advance the fake clock inside act() so React applies the state update.
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
```

> [!TIP]
> Nếu component của bạn cũng dựa vào `userEvent` từ Testing Library trong khi fake timers đang hoạt động, hãy tạo user bằng `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`. Nếu không, các độ trễ nội bộ của `userEvent` sẽ treo mãi mãi trước một đồng hồ bị đóng băng.

---

## ⚡ 7. Ghép Lại Với Nhau — Hướng Dẫn Ra Quyết Định

```
Need to fake something in a test?
│
├─ It's a callback / injected function with no real version
│     → vi.fn()  (program with mockReturnValue / mockResolvedValue / mockImplementation)
│
├─ It's ONE method on a real object you mostly want to keep
│     → vi.spyOn(obj, "method")   (+ mockRestore / restoreMocks)
│
├─ It's an ENTIRE imported module (api, db, sdk)
│     → vi.mock("module", factory)   (+ vi.mocked for types)
│
└─ It's TIME (setTimeout, setInterval, Date, debounce, polling)
      → vi.useFakeTimers() / advanceTimersByTime / useRealTimers
```

---

## 🧠 Kiểm Tra Kiến Thức Của Bạn

<details>
  <summary><b>Hiện đáp án</b></summary>

**Q1. Sự khác biệt giữa `mockReturnValue` và `mockResolvedValue` là gì?**

`mockReturnValue(x)` khiến mock trả về `x` một cách đồng bộ. `mockResolvedValue(x)` khiến mock trả về một **Promise resolve thành `x`** — nó là dạng viết tắt cho `mockReturnValue(Promise.resolve(x))`. Hãy dùng `mockResolvedValue` (và anh em của nó là `mockRejectedValue`) khi làm giả một function `async` chẳng hạn như một method của API client, để `await` / `.then()` trong code tiêu thụ hoạt động chính xác. Dùng `mockReturnValue(x)` cho một dependency bất đồng bộ sẽ trao cho caller một giá trị thô thay vì một thenable và làm hỏng `await`.
</details>

<details>
  <summary><b>Hiện đáp án</b></summary>

**Q2. Theo mặc định, `vi.spyOn(obj, "method")` chạy method gốc hay thay thế nó?**

Nó **chạy bản gốc** (call-through) trong khi ghi lại mọi lần gọi. Bản thân một spy chỉ *quan sát*. Để thay thế hành vi, bạn chain `.mockImplementation(...)`, `.mockReturnValue(...)`, hoặc `.mockResolvedValue(...)`. Đây là điểm khác biệt then chốt so với `vi.fn()`, vốn không bao giờ có bản gốc để gọi xuyên qua. Vì một spy vá lên một object thật, bạn phải hoàn tác nó bằng `.mockRestore()` (hoặc `vi.restoreAllMocks()` / `restoreMocks: true`).
</details>

<details>
  <summary><b>Hiện đáp án</b></summary>

**Q3. Tại sao `vi.mock(...)` phải được viết ra mặc dù nó xuất hiện ở cuối các import, và `vi.hoisted` dùng để làm gì?**

Vitest **hoist** mọi lời gọi `vi.mock()` lên trên cùng của file, phía trên tất cả các import, để module được thay thế *trước khi* file cần test import nó. Vì factory do đó chạy trong giai đoạn sớm này — trước khi bất kỳ `const`/`let` cấp top-level nào được khởi tạo — bạn không thể tham chiếu trực tiếp các biến ở scope bên ngoài bên trong factory (bạn sẽ gặp lỗi "Cannot access before initialization"). `vi.hoisted(() => ({...}))` cho phép bạn tạo các giá trị (như một `vi.fn()` dùng chung) trong cùng giai đoạn sớm đó để cả factory và phần thân test của bạn đều có thể tham chiếu chúng một cách an toàn.
</details>

<details>
  <summary><b>Hiện đáp án</b></summary>

**Q4. Bạn đã spy `console.error` bằng `.mockImplementation(() => {})` trong một test. Test tiếp theo trong cùng file bất ngờ không có output lỗi và một bug thật bị bỏ sót. Chuyện gì đã xảy ra và làm sao để ngăn chặn?**

Spy chưa bao giờ được restore, nên implementation no-op đã **rò rỉ** sang các test tiếp theo và nuốt chửng toàn bộ output `console.error` cho phần còn lại của file. Cách khắc phục là restore các spy sau mỗi test — hoặc một cách tường minh với `afterEach(() => vi.restoreAllMocks())`, hoặc một cách toàn cục bằng cách đặt `restoreMocks: true` trong `vitest.config.ts`. Lưu ý rằng `clearAllMocks` và `resetAllMocks` **không** khắc phục được điều này: chỉ `restoreAllMocks` mới đặt `console.error` gốc trở lại, và nó chỉ làm vậy cho các spy được tạo qua `vi.spyOn`.
</details>

<details>
  <summary><b>Hiện đáp án</b></summary>

**Q5. Khi test một poller dựa trên `setInterval`, tại sao `vi.runAllTimers()` lại nguy hiểm, và bạn nên dùng gì thay thế?**

`vi.runAllTimers()` kích hoạt **tất cả** các timer đang chờ và tiếp tục kích hoạt bất kỳ timer mới nào chúng lên lịch cho đến khi hàng đợi rỗng. Một `setInterval` (hoặc một `setTimeout` tự lên lịch lại) không bao giờ làm rỗng hàng đợi của nó, nên điều này sẽ lặp vô hạn; Vitest bảo vệ trước tình huống này bằng cách ném lỗi sau khoảng 10.000 vòng lặp. Thay vào đó, hãy tua đồng hồ một cách tất định với `vi.advanceTimersByTime(ms)` (kích hoạt đúng các timer đến hạn trong cửa sổ đó) hoặc `vi.runOnlyPendingTimers()` (chỉ kích hoạt các timer đã được lên lịch, không phải các timer mà chúng sinh ra). Luôn kết thúc bằng `vi.useRealTimers()`.
</details>

---

## 💻 Bài Tập Thực Hành

### 🛠️ Bài tập 1 — Mock một callback và một API module

Bạn được cho một function `checkout` và một API module `payments`. Hãy viết các test mà (a) xác minh `checkout` gọi callback `onSuccess` của nó với tổng đơn hàng, và (b) mock module `payments` để không có lần charge thật nào xảy ra.

**Khởi đầu — code cần test:**

```typescript
// src/payments/payments.ts  — the REAL module
export async function chargeCard(amountCents: number): Promise<{ id: string }> {
  const res = await fetch("https://pay.example.com/charge", {
    method: "POST",
    body: JSON.stringify({ amountCents }),
  });
  if (!res.ok) throw new Error("Charge failed");
  return res.json();
}
```

```typescript
// src/payments/checkout.ts  — the unit under test
import { chargeCard } from "./payments";

export async function checkout(
  cents: number,
  onSuccess: (chargeId: string, total: number) => void,
): Promise<void> {
  const { id } = await chargeCard(cents);
  onSuccess(id, cents);
}
```

**Nhiệm vụ của bạn:**

```typescript
// src/payments/__tests__/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkout } from "../checkout";
import { chargeCard } from "../payments";

// TASK 1: Mock the entire ../payments module so chargeCard is a vi.fn().
//         (Hint: vi.mock + a factory returning { chargeCard: vi.fn() })

// TASK 2: Re-type chargeCard with vi.mocked so mockResolvedValue is available.

describe("checkout", () => {
  beforeEach(() => {
    // TASK 3: clear mock call history before each test.
  });

  it("calls onSuccess with the charge id and total", async () => {
    // TASK 4: program the mocked chargeCard to resolve to { id: "ch_123" }.
    // TASK 5: create an onSuccess mock with vi.fn().
    // TASK 6: await checkout(2500, onSuccess).
    // TASK 7: assert onSuccess was called once with ("ch_123", 2500)
    //         and that chargeCard was called with 2500.
  });
});
```

<details>
  <summary><b>Hiện một lời giải khả dĩ</b></summary>

```typescript
// src/payments/__tests__/checkout.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkout } from "../checkout";
import { chargeCard } from "../payments";

vi.mock("../payments", () => ({
  chargeCard: vi.fn(),
}));

const mockedCharge = vi.mocked(chargeCard);

describe("checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onSuccess with the charge id and total", async () => {
    mockedCharge.mockResolvedValue({ id: "ch_123" });
    const onSuccess = vi.fn();

    await checkout(2500, onSuccess);

    expect(mockedCharge).toHaveBeenCalledWith(2500);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith("ch_123", 2500);
  });
});
```
</details>

---

### 🛠️ Bài tập 2 — Test một tiện ích throttle với fake timers

Một `throttle` chạy function ngay lập tức, rồi bỏ qua các lần gọi tiếp theo cho đến khi `limit` ms đã trôi qua. Hãy dùng fake timers để chứng minh điều đó.

**Khởi đầu — code cần test:**

```typescript
// src/utils/throttle.ts
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  limit: number,
): (...args: Args) => void {
  let inCooldown = false;
  return (...args: Args) => {
    if (inCooldown) return;
    fn(...args); // run immediately (leading edge)
    inCooldown = true;
    setTimeout(() => {
      inCooldown = false;
    }, limit);
  };
}
```

**Nhiệm vụ của bạn:**

```typescript
// src/utils/__tests__/throttle.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../throttle";

describe("throttle", () => {
  // TASK 1: install fake timers before each test.
  // TASK 2: restore real timers after each test.

  it("runs immediately then blocks until the limit elapses", () => {
    // TASK 3: create a spy and a throttled wrapper with limit 1000.
    // TASK 4: call it 3 times in a row -> assert it ran exactly ONCE.
    // TASK 5: advance fake time by 1000ms.
    // TASK 6: call it again -> assert it has now run exactly TWICE.
  });
});
```

<details>
  <summary><b>Hiện một lời giải khả dĩ</b></summary>

```typescript
// src/utils/__tests__/throttle.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../throttle";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs immediately then blocks until the limit elapses", () => {
    const spy = vi.fn();
    const throttled = throttle(spy, 1000);

    throttled("a");
    throttled("b");
    throttled("c");
    expect(spy).toHaveBeenCalledTimes(1); // leading call only
    expect(spy).toHaveBeenCalledWith("a");

    vi.advanceTimersByTime(1000); // cooldown ends

    throttled("d");
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith("d");
  });
});
```
</details>

---

Giờ đây bạn đã có trọn bộ công cụ làm giả của Vitest: `vi.fn()` cho các callback, `vi.spyOn()` cho các method thật, `vi.mock()` cho cả module, vòng đời clear/reset/restore để giữ các test được cô lập, và fake timers để khiến code phụ thuộc thời gian trở nên tức thì và mang tính tất định. Kết hợp với React Testing Library từ bài học trước, giờ bạn có thể test bất kỳ component hay tiện ích nào — bất kể nó che giấu bao nhiêu side effect. 🎭
