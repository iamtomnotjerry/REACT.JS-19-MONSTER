# 🔐 Dự án: Trình tạo mật khẩu với Zustand

Một trình tạo mật khẩu là một trong những ứng dụng nhỏ bé tưởng chừng đơn giản nhưng lại chạm tới *mọi* khái niệm bạn quan tâm trong quản lý state phía client: các giá trị boolean được dẫn xuất (các cờ toggle), một thiết lập dạng số (length), một action **đọc** toàn bộ slice để tạo ra một giá trị mới (`generate`), một side-effect của trình duyệt (`copyToClipboard`), và một phần UI **không bao giờ được lưu trữ** mà luôn được **tính toán** (chỉ báo độ mạnh). Đây là tấm canvas hoàn hảo cho một Zustand store vì có state thực sự, action thực sự, và một selector thật sự đáng để memoize.

Trong bài học này bạn sẽ xây dựng trọn vẹn từ đầu đến cuối: một Zustand store được typed giữ cấu hình và mật khẩu đã tạo, một component React 19 duy nhất nối một thanh trượt range và ba checkbox vào store đó, một nút copy-to-clipboard với phản hồi "Copied!" thoáng qua, và một thanh đo độ mạnh được dẫn xuất hoàn toàn từ một selector. Mọi thứ đều được typed đầy đủ, hoàn chỉnh, và sao chép-dán được — không có đoạn rời rạc, không có "điền nốt phần này sau."

> [!NOTE]
> Dự án này **dựng lại một ý tưởng ứng dụng có từ trước trong khóa học — Trình tạo mật khẩu — nhưng lần này được hậu thuẫn bởi một Zustand store thay vì `useState` cục bộ.** Ý tưởng ứng dụng gốc đến từ khóa học; phần triển khai Zustand ở đây là **hoàn toàn mới** (nó vượt ra ngoài những gì transcript ghi hình minh họa), nên nó được dạy bằng các best practice hiện hành của Zustand v5 + React 19 thay vì transcribe từng dòng một.

---

## ⚡ 1. Khái niệm & Tổng quan: State, Action, và Giá trị dẫn xuất

Trước khi viết code, hãy tách dữ liệu của ứng dụng thành ba nhóm. Sự tách bạch này là quyết định thiết kế quan trọng nhất trong bất kỳ tính năng có quản lý state nào, và Zustand làm cho nó trở nên tường minh.

| Nhóm | Ví dụ trong ứng dụng này | Sống ở đâu? | Tại sao |
| --- | --- | --- | --- |
| **State được lưu trữ** | `length`, `includeUppercase`, `includeNumbers`, `includeSymbols`, `password`, `copied` | Bên trong Zustand store | Đây là những dữ kiện thay đổi theo thời gian và phải tồn tại bền vững qua các lần re-render. |
| **Action** | `setLength`, `toggleUppercase`, `generate`, `copyToClipboard` | Bên trong store (các hàm gọi `set`) | Cách *duy nhất* được cho phép để thay đổi state. Component không bao giờ `set` trực tiếp. |
| **Giá trị dẫn xuất** | **độ mạnh** mật khẩu (Weak / Fair / Strong) | Được tính trong một **selector**, không bao giờ lưu trữ | Nó hoàn toàn 100% là một hàm của state hiện có. Lưu trữ nó sẽ tạo ra nguồn chân lý thứ hai có thể bị lệch khỏi nhau. |

Quy tắc vàng: **nếu một giá trị có thể được tính từ state khác, đừng lưu trữ nó — hãy dẫn xuất nó.** Độ mạnh là một hàm của `length` và số lớp ký tự được bật, nên nó thuộc về một selector, không phải store.

### 🛠️ Một phép ẩn dụ đời thực: Máy pha cà phê espresso

Hãy hình dung store như một **máy pha espresso**.

- Các **núm và công tắc** ở mặt trước — độ mịn xay, số shot, có sữa hay không — là **state được lưu trữ** của bạn (`length`, ba cờ toggle). Bạn vặn chúng; chúng giữ nguyên vị trí.
- Nhấn nút **BREW lớn** là một **action** (`generate`). Nó đọc từng núm, chạy bơm bên trong, và làm đầy cốc. Bạn không tự thò tay vào nồi hơi; bạn nhấn nút và máy làm việc.
- **Đồng hồ đo áp suất** ở trên cùng là một **giá trị dẫn xuất** (chỉ báo độ mạnh). Không ai chỉnh đồng hồ bằng tay — nó chỉ đơn giản *phản ánh* những gì máy đang làm ngay lúc này. Nếu bạn thử lưu trữ và cập nhật thủ công một số đọc của đồng hồ, nó sẽ nói dối ngay khoảnh khắc một núm được vặn.

Một trình tạo mật khẩu tuyệt vời, như một máy espresso tuyệt vời, giữ ba mối quan tâm này tách biệt về mặt vật lý.

> [!TIP]
> Action của Zustand chỉ là những hàm bạn đặt **bên trong** đối tượng store. Vì chúng đóng gói (close over) `set` và `get`, một action như `generate()` có thể đọc `length` và các cờ hiện tại bằng `get()` và ghi một `password` mới tinh bằng `set()` — tất cả mà không cần component truyền vào bất kỳ tham số nào. Điều này giữ cho component của bạn đơn giản (dumb) và logic của bạn được tập trung và có thể unit-test được.

---

## 🧩 2. Luồng dữ liệu

```
   ┌─────────────────────────────────────────────────────────┐
   │                     Zustand Store                        │
   │                                                          │
   │  state:  length, includeUppercase, includeNumbers,       │
   │          includeSymbols, password, copied                │
   │                                                          │
   │  actions:                                                │
   │    setLength(n) ───────────► set({ length: n })          │
   │    toggleUppercase() ──────► set(flip flag)              │
   │    generate() ──► get() flags ─► build charset ─► random │
   │                                └─► set({ password })      │
   │    copyToClipboard() ─► navigator.clipboard ─► set(copied)│
   └───────────────┬──────────────────────────▲──────────────┘
                   │ selectors (read)          │ actions (write)
                   ▼                           │
   ┌─────────────────────────────────────────────────────────┐
   │                   <PasswordGenerator />                  │
   │                                                          │
   │  Range slider ──── length ──── setLength                 │
   │  ☑ Uppercase ☑ Numbers ☑ Symbols ── toggle* actions      │
   │  [ generated password output ]                           │
   │  [ Copy ] ── copyToClipboard ── "Copied!" (copied flag)  │
   │  Strength bar  ◄── derived selector (length + flags)     │
   └─────────────────────────────────────────────────────────┘
```

Component **đọc** các slice hẹp qua selector và **gọi** các action. Nó không bao giờ sở hữu logic. Store **sở hữu** logic và không bao giờ import React. Sự phân tách sạch sẽ đó chính là toàn bộ ý nghĩa.

---

## 🧱 3. Thiết lập dự án

Khởi tạo một ứng dụng Vite + React + TypeScript và thêm Zustand v5.

```bash
# Create the app (choose the react-ts template)
npm create vite@latest password-generator -- --template react-ts
cd password-generator

# Install dependencies plus Zustand
npm install
npm install zustand
```

Hai file bạn sẽ tạo:

```
src/
├── store/
│   └── usePasswordStore.ts     # the typed Zustand store + selectors
├── PasswordGenerator.tsx       # the single UI component
└── App.tsx                     # renders <PasswordGenerator />
```

---

## ⚡ 4. Store (Được typed đầy đủ)

Đây là trái tim của bài học. Hãy đọc kỹ các comment — mỗi dòng đều có chủ đích.

```typescript
// src/store/usePasswordStore.ts
import { create } from "zustand";

/**
 * The shape of our store: state fields first, then actions.
 * Keeping them in one interface gives `set`/`get` full type safety.
 */
interface PasswordState {
  // ----- Stored state -----
  length: number;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  password: string;
  copied: boolean;

  // ----- Actions -----
  setLength: (length: number) => void;
  toggleUppercase: () => void;
  toggleNumbers: () => void;
  toggleSymbols: () => void;
  generate: () => void;
  copyToClipboard: () => Promise<void>;
}

// Character pools, defined once outside the store so they are never re-created.
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

/**
 * Cryptographically strong random integer in the range [0, max).
 * We use the Web Crypto API (crypto.getRandomValues) instead of Math.random()
 * because passwords must not be predictable. This is supported in every
 * modern browser and is the correct tool for security-sensitive randomness.
 */
function secureRandomInt(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Map the 32-bit value into [0, max) with modulo. The tiny modulo bias is
  // negligible for password character selection.
  return array[0] % max;
}

export const usePasswordStore = create<PasswordState>((set, get) => ({
  // ----- Initial state -----
  length: 12,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: false,
  password: "",
  copied: false,

  // ----- Actions -----

  // Clamp length between 4 and 64 so the slider can never produce nonsense.
  setLength: (length) =>
    set({ length: Math.min(64, Math.max(4, Math.round(length))) }),

  // Each toggle flips its own boolean. We read the previous value via the
  // updater function form of `set` so we never depend on a stale closure.
  toggleUppercase: () =>
    set((state) => ({ includeUppercase: !state.includeUppercase })),
  toggleNumbers: () =>
    set((state) => ({ includeNumbers: !state.includeNumbers })),
  toggleSymbols: () =>
    set((state) => ({ includeSymbols: !state.includeSymbols })),

  /**
   * Build the active charset from the flags, then draw `length` random
   * characters from it. Lowercase is always included so we can never end up
   * with an empty charset (a UX guarantee, not just a safety net).
   */
  generate: () => {
    const { length, includeUppercase, includeNumbers, includeSymbols } = get();

    // Lowercase is the always-on baseline.
    let charset = LOWERCASE;
    if (includeUppercase) charset += UPPERCASE;
    if (includeNumbers) charset += NUMBERS;
    if (includeSymbols) charset += SYMBOLS;

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[secureRandomInt(charset.length)];
    }

    // A fresh password resets the "Copied!" feedback so old state never lingers.
    set({ password: result, copied: false });
  },

  /**
   * Copy the current password to the system clipboard and flip `copied` so the
   * UI can show transient feedback. We guard against an empty password and
   * against environments where the Clipboard API is unavailable.
   */
  copyToClipboard: async () => {
    const { password } = get();
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      set({ copied: true });
      // Auto-reset the flag after 2 seconds so the "Copied!" label disappears.
      setTimeout(() => set({ copied: false }), 2000);
    } catch (error) {
      // Clipboard can be blocked by permissions or insecure (http) contexts.
      console.error("Failed to copy password:", error);
      set({ copied: false });
    }
  },
}));
```

> [!WARNING]
> `navigator.clipboard.writeText` chỉ hoạt động trong một **secure context** (HTTPS hoặc `localhost`) và yêu cầu lời gọi xảy ra bên trong một cử chỉ người dùng (một cú click). Nó dựa trên `Promise`, đó là lý do `copyToClipboard` là `async` và được bọc trong `try/catch`. Đừng bao giờ giả định việc copy đã thành công — luôn xử lý phần rejection, nếu không thông báo "Copied!" của bạn sẽ nói dối khi quyền bị từ chối.

---

## 🧩 5. Selector độ mạnh (Dẫn xuất, không bao giờ lưu trữ)

Độ mạnh được tính toán, nên nó sống cạnh store dưới dạng một **hàm thuần** cộng với một **selector hook** nhỏ. Điều này giữ logic dẫn xuất ra khỏi component và cho phép nhiều component tái sử dụng nó.

```typescript
// src/store/usePasswordStore.ts  (append to the same file)

export type Strength = "Weak" | "Fair" | "Strong";

/**
 * Score the password configuration:
 *  - longer is stronger (length contributes the most)
 *  - each enabled character class widens the pool, raising entropy
 * This is intentionally simple and deterministic so it's easy to test.
 */
export function computeStrength(state: PasswordState): Strength {
  // Count how many character classes are active (lowercase is always on => +1).
  const classes =
    1 +
    (state.includeUppercase ? 1 : 0) +
    (state.includeNumbers ? 1 : 0) +
    (state.includeSymbols ? 1 : 0);

  // A rough score combining length and variety.
  const score = state.length + classes * 4;

  if (state.length < 8 || score < 16) return "Weak";
  if (state.length < 14 || score < 24) return "Fair";
  return "Strong";
}

/**
 * A selector hook so components can subscribe to ONLY the derived strength.
 * Because the selector returns a primitive string, Zustand's default
 * (Object.is) equality check prevents needless re-renders: the component
 * only re-renders when the strength label actually changes, not on every
 * keystroke of the slider.
 */
export const useStrength = (): Strength =>
  usePasswordStore((state) => computeStrength(state));
```

> [!TIP]
> Trả về một **primitive** (một chuỗi) từ một selector là kiểu subscription rẻ nhất có thể trong Zustand. Nếu một selector trả về một object/array mới tinh ở mỗi lần gọi, bạn phải truyền vào một hàm equality tùy chỉnh (ví dụ `useShallow`) hoặc bạn sẽ re-render ở mọi thay đổi của store. Ở đây, `"Strong" === "Strong"` là `true`, nên component ngủ yên cho tới khi nhãn thực sự lật đổi.

---

## ⚡ 6. Component (React 19, Được typed đầy đủ)

Một component nối mọi thứ lại với nhau. Hãy để ý cách mỗi phần UI subscribe vào slice **hẹp nhất** mà nó cần — đây chính là điều giữ cho ứng dụng nhanh.

```tsx
// src/PasswordGenerator.tsx
import { useEffect } from "react";
import { usePasswordStore, useStrength, type Strength } from "./store/usePasswordStore";

// Map each strength label to a width + color for the meter bar.
const STRENGTH_STYLES: Record<Strength, { width: string; color: string }> = {
  Weak: { width: "33%", color: "#ef4444" }, // red
  Fair: { width: "66%", color: "#f59e0b" }, // amber
  Strong: { width: "100%", color: "#22c55e" }, // green
};

export function PasswordGenerator() {
  // Subscribe to each slice individually. Each selector returns a primitive or
  // a stable function reference, so re-renders are minimal and precise.
  const length = usePasswordStore((s) => s.length);
  const includeUppercase = usePasswordStore((s) => s.includeUppercase);
  const includeNumbers = usePasswordStore((s) => s.includeNumbers);
  const includeSymbols = usePasswordStore((s) => s.includeSymbols);
  const password = usePasswordStore((s) => s.password);
  const copied = usePasswordStore((s) => s.copied);

  // Actions have stable identities in Zustand, so grabbing them is free.
  const setLength = usePasswordStore((s) => s.setLength);
  const toggleUppercase = usePasswordStore((s) => s.toggleUppercase);
  const toggleNumbers = usePasswordStore((s) => s.toggleNumbers);
  const toggleSymbols = usePasswordStore((s) => s.toggleSymbols);
  const generate = usePasswordStore((s) => s.generate);
  const copyToClipboard = usePasswordStore((s) => s.copyToClipboard);

  // The derived strength comes from its own selector hook.
  const strength = useStrength();

  // Generate one password on first mount so the UI is never empty,
  // and regenerate whenever length or any flag changes.
  useEffect(() => {
    generate();
  }, [length, includeUppercase, includeNumbers, includeSymbols, generate]);

  const meter = STRENGTH_STYLES[strength];

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "2rem auto",
        padding: "1.5rem",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        🔐 Password Generator
      </h1>

      {/* ---- Generated output + copy button ---- */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <output
          aria-live="polite"
          style={{
            flex: 1,
            padding: "0.6rem 0.75rem",
            fontFamily: "monospace",
            fontSize: "1rem",
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {password || "—"}
        </output>
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!password}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 8,
            border: "none",
            cursor: password ? "pointer" : "not-allowed",
            background: copied ? "#22c55e" : "#3b82f6",
            color: "white",
            fontWeight: 600,
            minWidth: 84,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* ---- Strength indicator (derived) ---- */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.85rem",
            marginBottom: 4,
          }}
        >
          <span>Strength</span>
          <span style={{ color: meter.color, fontWeight: 600 }}>{strength}</span>
        </div>
        <div
          style={{
            height: 8,
            background: "#e5e7eb",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: meter.width,
              background: meter.color,
              transition: "width 200ms ease, background 200ms ease",
            }}
          />
        </div>
      </div>

      {/* ---- Length slider ---- */}
      <label style={{ display: "block", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span>Length</span>
          <span style={{ fontWeight: 600 }}>{length}</span>
        </div>
        <input
          type="range"
          min={4}
          max={64}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </label>

      {/* ---- Checkboxes ---- */}
      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <Checkbox
          label="Include uppercase (A-Z)"
          checked={includeUppercase}
          onChange={toggleUppercase}
        />
        <Checkbox
          label="Include numbers (0-9)"
          checked={includeNumbers}
          onChange={toggleNumbers}
        />
        <Checkbox
          label="Include symbols (!@#$…)"
          checked={includeSymbols}
          onChange={toggleSymbols}
        />
      </fieldset>

      {/* ---- Manual regenerate ---- */}
      <button
        type="button"
        onClick={generate}
        style={{
          marginTop: "1.25rem",
          width: "100%",
          padding: "0.7rem",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          background: "#111827",
          color: "white",
          fontWeight: 600,
        }}
      >
        🔄 Regenerate
      </button>
    </div>
  );
}

// A small typed, reusable checkbox row.
interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0.35rem 0",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}
```

Nối nó vào root của ứng dụng:

```tsx
// src/App.tsx
import { PasswordGenerator } from "./PasswordGenerator";

export default function App() {
  return <PasswordGenerator />;
}
```

Chạy nó:

```bash
npm run dev
```

Giờ bạn đã có một trình tạo đang hoạt động: kéo thanh trượt, bật/tắt các ô, xem mật khẩu và thanh đo độ mạnh cập nhật trực tiếp, và click **Copy** để thấy phản hồi "Copied!" thoáng qua.

> [!NOTE]
> `useEffect` gọi `generate()` ở mỗi thay đổi cấu hình là một lựa chọn UX có chủ đích — mật khẩu làm mới ngay khoảnh khắc bạn thay đổi một thiết lập. Nếu bạn muốn người dùng phải nhấn **Regenerate** một cách tường minh, hãy xóa effect đi và chỉ dựa vào nút bấm. Store không bận tâm; đây hoàn toàn là một quyết định ở cấp component, đúng kiểu phân tách mà một Zustand store mang lại cho bạn.

---

## 🛠️ 7. Tại sao kiến trúc này thắng thế

| Mối quan tâm | Cách tiếp cận ngây thơ (`useState`) | Cách tiếp cận Zustand này |
| --- | --- | --- |
| Logic `generate` ở đâu? | Bên trong component, được tạo lại mỗi lần render | Bên trong store, định nghĩa một lần, test được độc lập |
| Chia sẻ state qua các component | Prop-drilling hoặc lifting state up | Bất kỳ component nào gọi `usePasswordStore` — không cần props |
| Phạm vi re-render | Toàn bộ component ở bất kỳ thay đổi nào | Mỗi selector subscribe vào một slice |
| Giá trị độ mạnh | Có nguy cơ lưu trữ rồi quên cập nhật | Dẫn xuất trong một selector — không bao giờ bị lệch |
| Unit test logic | Phải render một component | Gọi `usePasswordStore.getState().generate()` trực tiếp |

Dòng cuối cùng đó đáng được nhấn mạnh: vì store chỉ là một đối tượng thuần, bạn có thể test nó **mà không cần React chút nào**:

```typescript
// src/store/usePasswordStore.test.ts (Vitest)
import { describe, it, expect, beforeEach } from "vitest";
import { usePasswordStore } from "./usePasswordStore";

describe("password store", () => {
  beforeEach(() => {
    // Reset to a known config before each test.
    usePasswordStore.setState({
      length: 12,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false,
      password: "",
      copied: false,
    });
  });

  it("generates a password of the configured length", () => {
    usePasswordStore.getState().generate();
    expect(usePasswordStore.getState().password).toHaveLength(12);
  });

  it("clamps length to the 4..64 range", () => {
    usePasswordStore.getState().setLength(999);
    expect(usePasswordStore.getState().length).toBe(64);
    usePasswordStore.getState().setLength(1);
    expect(usePasswordStore.getState().length).toBe(4);
  });

  it("excludes symbols when the flag is off", () => {
    usePasswordStore.setState({ includeSymbols: false });
    usePasswordStore.getState().generate();
    const pw = usePasswordStore.getState().password;
    expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw)).toBe(false);
  });
});
```

---

## 🧠 Kiểm tra kiến thức của bạn

**1. Tại sao *độ mạnh* mật khẩu được tính trong một selector thay vì được lưu trữ như một field trong Zustand state?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Bởi vì độ mạnh là **state dẫn xuất** — nó hoàn toàn là một hàm của `length` và ba cờ include. Lưu trữ nó sẽ tạo ra một *nguồn chân lý thứ hai* mà bạn phải tự tay giữ đồng bộ bên trong mọi action (`setLength`, mỗi `toggle*`, `generate`). Quên cập nhật một chỗ thì thanh đo sẽ nói dối. Bằng cách tính nó trong `computeStrength(state)` và phơi bày nó qua selector hook `useStrength`, giá trị luôn được tính lại từ state hiện tại, nên nó không bao giờ bị lệch. Quy tắc chung: **đừng bao giờ lưu trữ những gì bạn có thể dẫn xuất.**
</details>

**2. Action `generate` không nhận tham số nào, vậy mà nó biết được `length` và các cờ hiện tại. Bằng cách nào?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Zustand truyền `(set, get)` vào hàm tạo store. Action `generate` đóng gói (close over) `get`, nên gọi `get()` trả về state **hiện tại** ở khoảnh khắc action chạy — `const { length, includeUppercase, ... } = get();`. Đây là lý do component có thể gọi `generate()` không cần tham số: store tự đọc state của chính nó. Dùng `get()` (thay vì bắt giữ các giá trị trong component) đảm bảo action luôn thấy các giá trị mới tinh, không bao giờ cũ kỹ.
</details>

**3. Tại sao component subscribe vào từng field bằng một lời gọi `usePasswordStore((s) => s.field)` riêng biệt thay vì một `usePasswordStore((s) => s)`?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Subscribe vào toàn bộ đối tượng state (`(s) => s`) trả về một reference mới mỗi khi *bất cứ thứ gì* thay đổi, buộc component re-render ở mọi cập nhật của store. Các selector hẹp trả về **primitive** (một số, một boolean, một chuỗi), và Zustand so sánh chúng bằng `Object.is`. Nên subscription `length` chỉ re-render khi `length` thực sự thay đổi, subscription `copied` chỉ khi `copied` lật đổi, v.v. Điều này làm cho re-render chính xác và rẻ. Nếu bạn *thực sự* muốn lấy nhiều field trong một selector trả về một object, bạn sẽ cần `useShallow` để tránh cái bẫy re-render do reference mới.
</details>

**4. Tại sao `copyToClipboard` được khai báo là `async` và được bọc trong `try/catch`?**

<details>
  <summary><b>Hiện đáp án</b></summary>

`navigator.clipboard.writeText()` trả về một **Promise** và có thể **reject** — Clipboard API yêu cầu một secure context (HTTPS hoặc `localhost`), một cử chỉ người dùng, và quyền đã được cấp. Nếu bất kỳ điều nào trong số này thất bại, promise sẽ reject. Đánh dấu action là `async` cho phép chúng ta `await` thao tác ghi; phần `try/catch` đảm bảo một clipboard bị từ chối/chặn không làm crash ứng dụng và, quan trọng là, không đặt `copied: true` (điều sẽ hiển thị một thông báo "Copied!" sai sự thật). Khi thất bại, ta log lại và giữ `copied: false`.
</details>

**5. Các ký tự chữ thường luôn được bao gồm trong charset dù không có checkbox "include lowercase". Tại sao nó được thiết kế như vậy?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Nó đảm bảo charset **không bao giờ rỗng**. Nếu mọi toggle đều có thể tắt, `generate` có thể dựng một `charset` rỗng và `charset[secureRandomInt(0)]` sẽ tạo ra `undefined`, sinh ra một mật khẩu hỏng `"undefinedundefined…"`. Bằng cách biến chữ thường thành baseline luôn-bật, luôn có ít nhất một lớp ký tự khả dụng, nên `generate` luôn an toàn và người dùng luôn nhận được một mật khẩu dùng được. Hàm độ mạnh tính đến điều này bằng cách bắt đầu đếm số lớp từ `1`.
</details>

---

## 💻 Bài tập thực hành

### 🧩 Bài tập 1 — "Loại trừ các ký tự dễ nhầm lẫn"

Thêm một toggle mới, `excludeAmbiguous`, loại bỏ các ký tự dễ bị nhầm (`l`, `1`, `I`, `O`, `0`, `o`) khỏi charset trước khi tạo. Đây là một tính năng phổ biến trong thực tế để người dùng không đọc nhầm một mật khẩu.

**Nhiệm vụ:**
1. Thêm `excludeAmbiguous: boolean` vào state và một action `toggleAmbiguous: () => void`.
2. Trong `generate`, sau khi dựng `charset`, loại bỏ các ký tự dễ nhầm khi cờ được bật.
3. Thêm một `<Checkbox>` vào component nối với cờ mới.

**Code khởi đầu:**

```typescript
// In the PasswordState interface, add:
//   excludeAmbiguous: boolean;
//   toggleAmbiguous: () => void;

const AMBIGUOUS = new Set(["l", "1", "I", "O", "0", "o"]);

// Inside generate(), after assembling `charset`:
generate: () => {
  const { length, includeUppercase, includeNumbers, includeSymbols, excludeAmbiguous } = get();

  let charset = LOWERCASE;
  if (includeUppercase) charset += UPPERCASE;
  if (includeNumbers) charset += NUMBERS;
  if (includeSymbols) charset += SYMBOLS;

  if (excludeAmbiguous) {
    charset = [...charset].filter((c) => !AMBIGUOUS.has(c)).join("");
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[secureRandomInt(charset.length)];
  }
  set({ password: result, copied: false });
},
```

Sau đó thêm checkbox trong component:

```tsx
const excludeAmbiguous = usePasswordStore((s) => s.excludeAmbiguous);
const toggleAmbiguous = usePasswordStore((s) => s.toggleAmbiguous);

// Add this Checkbox alongside the other three inside the existing <fieldset>:
<Checkbox
  label="Exclude ambiguous (l 1 I O 0 o)"
  checked={excludeAmbiguous}
  onChange={toggleAmbiguous}
/>
```

Đừng quên đưa `excludeAmbiguous` vào mảng dependency của `useEffect` để mật khẩu được tạo lại khi nó thay đổi.

### 🧩 Bài tập 2 — "Đảm bảo có ít nhất một ký tự của mỗi lớp được bật"

Một mật khẩu thực sự mạnh nên chứa ít nhất một ký tự từ **mọi** lớp được bật (ví dụ nếu numbers đang bật, hãy đảm bảo có ít nhất một chữ số). Hiện tại `generate` rút thuần túy ngẫu nhiên, nên một mật khẩu ngắn có thể vô tình bỏ sót hoàn toàn các chữ số.

**Nhiệm vụ:**
1. Dựng một mảng các pool được bật (luôn bao gồm lowercase).
2. Gieo mầm kết quả với một ký tự được đảm bảo từ mỗi pool được bật.
3. Lấp đầy các vị trí còn lại một cách ngẫu nhiên từ charset gộp.
4. Xáo trộn mảng cuối cùng (để các ký tự được đảm bảo không luôn nằm ở đầu) trước khi join.

**Code khởi đầu:**

```typescript
generate: () => {
  const { length, includeUppercase, includeNumbers, includeSymbols } = get();

  // 1. Collect the enabled pools.
  const pools: string[] = [LOWERCASE];
  if (includeUppercase) pools.push(UPPERCASE);
  if (includeNumbers) pools.push(NUMBERS);
  if (includeSymbols) pools.push(SYMBOLS);

  const combined = pools.join("");
  const chars: string[] = [];

  // 2. Guarantee one char from each pool (if length allows).
  for (const pool of pools) {
    if (chars.length < length) {
      chars.push(pool[secureRandomInt(pool.length)]);
    }
  }

  // 3. Fill the rest from the combined charset.
  while (chars.length < length) {
    chars.push(combined[secureRandomInt(combined.length)]);
  }

  // 4. Fisher-Yates shuffle so guaranteed chars aren't predictable.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  set({ password: chars.join(""), copied: false });
},
```

**Mục tiêu mở rộng:** viết một test Vitest khẳng định rằng với tất cả cờ được bật và `length = 16`, mật khẩu được tạo chứa ít nhất một chữ cái viết hoa, một chữ số, và một ký hiệu.

---

> [!TIP]
> Một khi cái này hoạt động, hãy thử thêm middleware `persist` (được trình bày trong `02-async-and-persistence.md`) để **độ dài và các cờ ưa thích** của người dùng tồn tại qua một lần refresh trang — nhưng hãy cố ý **loại trừ** `password` và `copied` khỏi những gì bạn persist. Bạn không bao giờ muốn ghi một mật khẩu đã tạo vào `localStorage`. Dùng `partialize` để chỉ whitelist các field cấu hình.
