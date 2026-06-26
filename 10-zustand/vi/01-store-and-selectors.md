# Zustand: Store, Actions & Selectors 🐻

**Zustand** (tiếng Đức nghĩa là "trạng thái") là một thư viện quản lý state cho React: nhỏ gọn, nhanh và không áp đặt quy tắc. Bạn định nghĩa một *store* một lần, đặt cùng chỗ **state** của bạn và các **action** thay đổi nó bên trong store đó, rồi bất kỳ component nào ở bất cứ đâu trong cây đều đọc đúng phần dữ liệu nó cần thông qua một **selector** — không cần `<Provider>`, không reducer, không hằng số action-type, không boilerplate dispatch.

Bài học này là một lần đào sâu tập trung vào ba trụ cột bạn sẽ dùng mỗi ngày với Zustand: xây dựng một **store** được định kiểu đầy đủ, định nghĩa các **action** đọc và ghi state (với `set` và `get`), và tiêu thụ state hiệu quả với **selector** cùng `useShallow`. Đến cuối bài bạn sẽ hiểu chính xác khi nào một component re-render, cách `set` merge state, và cách quyết định giữa một store đơn được chia slice với nhiều store nhỏ.

> [!NOTE]
> Khóa học ghi hình đặt nền tảng cho các kiến thức cơ bản về tạo store mà bạn thấy ở đây: cài đặt `zustand`, dạng `create(set => ({ ...state, ...actions }))`, mẫu custom-hook, và interface TypeScript. Phần sâu hơn — `get()` bên trong action, `useShallow` cho việc chọn object/array, mẫu slices, và sự đánh đổi giữa store-đơn-với-nhiều-store — đi **xa hơn** những gì giảng viên đã ghi hình. Những phần đó được dạy ở đây dựa trên các best practice hiện hành của Zustand v5 để bạn có một bức tranh đầy đủ và chính xác.

---

## ⚡ 1. Khái niệm & Tổng quan

Trong một ứng dụng React điển hình, state mà nhiều component cùng chia sẻ phải nằm trong một *tổ tiên chung* và được luồn xuống dưới dưới dạng props — đó chính là **prop drilling** đáng sợ. Context API loại bỏ việc luồn props nhưng lại re-render *mọi* consumer mỗi khi *bất kỳ* phần nào của giá trị context thay đổi. Redux khắc phục vấn đề re-render bằng selector nhưng yêu cầu bạn phải viết reducer, action creator, và một provider.

Mô hình tư duy của Zustand thì khác: store sống **bên ngoài** cây React dưới dạng một closure ở cấp module. Component không nhận state từ cha — chúng vươn *lên và ra ngoài* để tới store và subscribe vào một phần chính xác của nó.

### 🏬 Một ẩn dụ đời thực: Kho hàng trung tâm

Hãy hình dung một Zustand store như một **kho hàng trung tâm** đứng cạnh cửa hàng của bạn (cây React):

- **Kho hàng** giữ mọi món hàng (state của bạn) ở một chỗ, độc lập với việc ai đang mua sắm.
- Mỗi **nhân viên cửa hàng** (một component) bước vào với một danh sách mua sắm chính xác — một **selector** — và chỉ lấy đúng món họ cần đến lấy, không phải toàn bộ kho.
- Khi một kệ được nhập hàng lại (một slice cập nhật), chỉ những nhân viên có danh sách nhắc đến *kệ đó* mới được gọi. Tất cả những người khác tiếp tục làm việc không bị quấy rầy.
- Quản lý kho (một **action**) có thể nhìn vào bất kỳ kệ nào (`get()`) trước khi quyết định nhập hàng lại thế nào (`set()`).

Vì kho hàng tồn tại độc lập, bạn không bao giờ cần bọc cửa hàng của mình trong một `<Provider>` — store chỉ là một module JavaScript mà bạn import.

### 🆚 Zustand vs. Context vs. Redux Toolkit

| Vấn đề | Context API | Redux Toolkit | **Zustand** |
| :--- | :--- | :--- | :--- |
| Provider tại root | ✅ Bắt buộc | ✅ Bắt buộc (`<Provider store>`) | ❌ Không cần |
| Boilerplate để thêm state | Thấp | Cao (slice + reducer + cấu hình store) | **Rất thấp** |
| Mức độ chi tiết của re-render | Toàn bộ consumer re-render khi bất kỳ giá trị nào đổi | Theo từng selector qua `useSelector` | **Theo từng selector, có sẵn** |
| Đọc state bên ngoài React | Vụng về | `store.getState()` | **`useStore.getState()`** |
| Ghi state bên ngoài React | Không thể | `store.dispatch(...)` | **`useStore.setState(...)`** |
| Action bất đồng bộ | Thủ công | Thunks / RTK Query | **Chỉ là các hàm `async` trong store** |
| DevTools / persistence | Tự làm | Có sẵn | **Middleware (`devtools`, `persist`)** |
| Kích thước bundle (xấp xỉ) | 0 (có sẵn) | ~12 kB+ | **~1 kB** |
| Phù hợp nhất với | State nhỏ, ít thay đổi (theme, locale) | Ứng dụng lớn với quy ước nghiêm ngặt | **Hầu hết ứng dụng; mở rộng nhanh** |

```text
       Context API                         Zustand
  ┌─────────────────┐               ┌──────────────────────┐
  │  <Provider>     │               │   STORE (module)     │  ← lives outside React
  │   value={...}   │               │   count: 0           │
  │  ┌───────────┐  │               │   user:  {...}       │
  │  │ Consumer  │  │ re-renders    │   increment()        │
  │  │ Consumer  │  │ ALL on any    └─────────┬────────────┘
  │  │ Consumer  │  │ value change      ▲     ▲     ▲
  │  └───────────┘  │               selector selector selector
  └─────────────────┘                 │       │       │
                                    CompA   CompB   CompC   ← each re-renders
                                                              only for ITS slice
```

---

## 🛠️ 2. Cài đặt

Zustand được phát hành dưới dạng một dependency duy nhất. Thêm nó vào bất kỳ dự án React 18 / 19 nào:

```bash
npm install zustand
```

Không provider, không file cấu hình, không codegen. Điều tiếp theo bạn viết chính là store.

---

## 🧩 3. Tạo một Store: `create<StoreType>()((set, get) => ({ ... }))`

Một Zustand store **chính là một React hook**. Bạn xây dựng nó với hàm `create`. Trong TypeScript bạn cung cấp dạng (shape) của store làm type argument để mọi mẩu state và mọi action đều được kiểm tra kiểu.

> [!TIP]
> Với TypeScript, hãy dùng dạng **curried** `create<StoreType>()(...)` — chú ý cặp `()` rỗng sau type argument. Lời gọi hai bước này là bắt buộc để TypeScript suy luận đúng kiểu của `set` và `get` khi sau này bạn thêm middleware như `persist` hay `devtools`. Dạng không-curried `create<StoreType>(...)` vẫn chạy cho các store đơn giản nhất nhưng làm hỏng suy luận kiểu một khi có middleware tham gia, nên việc luôn dùng curry là một thực hành tốt.

```typescript
// src/stores/useCounterStore.ts
import { create } from "zustand";

// 1. Describe the FULL shape of the store: state values + actions.
//    Keeping them in one interface is the whole point of Zustand —
//    the data and the functions that change it live together.
interface CounterStore {
  // ---- state ----
  count: number;
  title: string;

  // ---- actions ----
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setTitle: (title: string) => void;
  // An action that READS state before writing it (uses get):
  incrementIfBelow: (max: number) => void;
}

// 2. create<CounterStore>()(...) — note the empty () after the type arg.
//    The callback receives `set` (write) and `get` (read) and must
//    return an object containing BOTH the initial state and the actions.
export const useCounterStore = create<CounterStore>()((set, get) => ({
  // ---- initial state ----
  count: 0,
  title: "Zustand Counter",

  // ---- actions ----
  // The functional form of set receives the previous state.
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),

  // The object form of set replaces the listed keys directly.
  reset: () => set({ count: 0 }),
  setTitle: (title) => set({ title }),

  // get() returns the CURRENT store snapshot — handy for conditional logic.
  incrementIfBelow: (max) => {
    const { count } = get(); // read the live value, no `state` param needed
    if (count < max) {
      set({ count: count + 1 });
    }
  },
}));
```

> [!WARNING]
> `set` thực hiện một **shallow merge chỉ ở cấp cao nhất** — nó *không* phải deep merge. Gọi `set({ count: 1 })` giữ nguyên `title` vì chúng là các key anh em ở cấp cao nhất. Nhưng với một object lồng nhau bạn phải tự spread nó:
> ```typescript
> // ❌ This REPLACES the entire user object, dropping every other field
> set({ user: { name: "Ada" } });
>
> // ✅ Spread the previous nested object so siblings survive
> set((state) => ({ user: { ...state.user, name: "Ada" } }));
> ```
> Quên spread sẽ âm thầm phá hủy phần còn lại của object lồng nhau — một trong những bug Zustand phổ biến nhất.

### 🧩 `set` vs `get` nhìn nhanh

| Helper | Hướng | Dùng điển hình | Dạng |
| :--- | :--- | :--- | :--- |
| `set(partial)` | **Ghi** | Thay thế các key cấp cao nhất cụ thể | `set({ count: 0 })` |
| `set((state) => partial)` | **Ghi** | Tính giá trị mới từ state trước đó | `set((s) => ({ count: s.count + 1 }))` |
| `get()` | **Đọc** | Đọc snapshot trực tiếp *bên trong một action* | `const { count } = get()` |

> [!TIP]
> Hãy dùng `get()` bất cứ khi nào một action cần *đọc* state hiện tại để quyết định phải làm gì (validation, toggle, tính một giá trị ghi suy ra) — như action `incrementIfBelow` ở trên. Hãy dùng dạng hàm `set((state) => ...)` khi bạn chỉ cần giá trị trước đó để *tạo ra state mới*. Chúng có phần chồng lấn, nhưng `get()` tỏa sáng khi bạn đọc state ở một chỗ và ghi ở chỗ khác, hoặc đọc nhiều lần trong một action.

---

## 🚀 4. Đọc State với Selector

Một **selector** là hàm bạn truyền vào store hook. Nó cho Zustand biết *chính xác* phần nào của store mà component này quan tâm. Sau đó Zustand chỉ re-render component **khi giá trị được chọn đó thay đổi** (mặc định so sánh bằng `Object.is`).

```tsx
// src/components/Counter.tsx
import { useCounterStore } from "../stores/useCounterStore";

export function Counter() {
  // Each call subscribes to ONE narrow slice.
  // This component re-renders only when `count` changes.
  const count = useCounterStore((state) => state.count);

  // Selecting an action is cheap and stable: the function identity
  // never changes, so this subscription never triggers a re-render.
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
}

// A sibling that subscribes ONLY to `title`. Clicking +1 above will
// NOT re-render this component, because `title` never changed.
export function TitleBar() {
  const title = useCounterStore((state) => state.title);
  console.log("TitleBar rendered"); // logs once, not on every increment
  return <h1>{title}</h1>;
}
```

> [!WARNING]
> Gọi hook **không có selector** — `const store = useCounterStore()` — sẽ subscribe component vào *toàn bộ* store. Khi đó nó sẽ re-render với **mọi** thay đổi state ở bất cứ đâu trong store, làm mất đi lợi ích hiệu năng chính. Luôn truyền một selector trừ khi bạn thực sự cần toàn bộ store.

### 🔁 So sánh hai phong cách tiêu thụ

```tsx
// ❌ Whole-store / destructure-everything: re-renders on ANY store change
const { count, increment } = useCounterStore();

// ✅ Narrow selectors: each re-renders only when ITS slice changes
const count = useCounterStore((state) => state.count);
const increment = useCounterStore((state) => state.increment);
```

### 🛠️ Đọc và ghi từ *bên ngoài* React

Vì store là một closure bên ngoài, bạn có thể chạm vào nó mà không cần component — hữu ích trong event handler, tiện ích, test, hay route loader:

```typescript
// Read the current snapshot anywhere (non-reactive — does not subscribe)
const current = useCounterStore.getState().count;

// Write from anywhere — components subscribed to `count` will re-render
useCounterStore.setState({ count: 100 });

// Subscribe imperatively (e.g. to log every change); returns an unsubscribe fn
const unsubscribe = useCounterStore.subscribe((state) =>
  console.log("count is now", state.count)
);
// ...later
unsubscribe();
```

---

## 🧩 5. `useShallow` — Chọn Object và Array một cách an toàn

Có một điểm sắc bén với selector. Zustand quyết định có re-render hay không bằng cách so sánh kết quả selector *trước* với kết quả *mới* dùng `Object.is`. Nếu selector của bạn trả về một **object hoặc array hoàn toàn mới ở mỗi lần gọi**, `Object.is` luôn báo "khác", nên component re-render với *mọi* thay đổi store — kể cả những thay đổi không liên quan, và thậm chí có thể lặp vô hạn.

```tsx
// ⚠️ DANGER: this selector builds a NEW object every render.
// Object.is(prev, next) is always false → re-renders on every store change.
const { count, title } = useCounterStore((state) => ({
  count: state.count,
  title: state.title,
}));
```

Cách khắc phục là **`useShallow`**, một helper từ `zustand/react/shallow`. Nó bọc selector của bạn và so sánh kết quả *theo kiểu nông* (từng key/phần tử), nên component chỉ re-render khi một trong các giá trị được chọn thực sự thay đổi.

```tsx
// src/components/CounterPanel.tsx
import { useShallow } from "zustand/react/shallow";
import { useCounterStore } from "../stores/useCounterStore";

export function CounterPanel() {
  // ✅ Pick MULTIPLE values in one selector, compared shallowly.
  //    Re-renders only when count OR title actually changes value.
  const { count, title } = useCounterStore(
    useShallow((state) => ({ count: state.count, title: state.title }))
  );

  // useShallow also works for arrays and tuples:
  const [increment, decrement] = useCounterStore(
    useShallow((state) => [state.increment, state.decrement] as const)
  );

  return (
    <section>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
    </section>
  );
}
```

> [!NOTE]
> Khi nào bạn nên dùng `useShallow`? Bất cứ khi nào một **selector đơn trả về một object, array, hay tuple vừa được tạo mới** chứa nhiều giá trị của store. Nếu thay vào đó bạn chọn từng primitive trong lời gọi hook riêng của nó (`const count = useStore(s => s.count)`), bạn **không** cần `useShallow`, vì mỗi selector trả về một primitive ổn định mà `Object.is` so sánh đúng. `useShallow` là công cụ để gom nhiều lựa chọn vào một subscription mà không phải trả giá bằng những lần re-render thừa.

### Các chiến lược so sánh nhìn nhanh

| Selector của bạn trả về gì | Kiểm tra re-render | Cần `useShallow`? |
| :--- | :--- | :--- |
| Một primitive (`state.count`) | `Object.is` trên giá trị | Không |
| Một hàm ổn định (`state.increment`) | `Object.is` trên identity | Không |
| Một object mới `{ a, b }` mỗi lần gọi | `Object.is` → luôn khác | **Có** |
| Một array mới `[a, b]` mỗi lần gọi | `Object.is` → luôn khác | **Có** |
| Kết quả của `.filter()` / `.map()` | array mới mỗi lần gọi | **Có** (hoặc memoize phép tính) |

---

## ⚡ 6. Một Store thực tế, được định kiểu đầy đủ

Hãy ghép `set`, `get`, async, và cập nhật state lồng nhau lại thành một store mà bạn có thể thực sự đưa lên production — một giỏ hàng với tổng tiền suy ra và một checkout bất đồng bộ.

```typescript
// src/stores/useCartStore.ts
import { create } from "zustand";

// ---- domain types ----
interface CartItem {
  id: string;
  name: string;
  price: number; // unit price in cents
  qty: number;
}

interface CartStore {
  // state
  items: CartItem[];
  isCheckingOut: boolean;
  lastError: string | null;

  // actions
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalCents: () => number; // a derived getter using get()
  checkout: () => Promise<void>; // an async action
}

export const useCartStore = create<CartStore>()((set, get) => ({
  // ---- initial state ----
  items: [],
  isCheckingOut: false,
  lastError: null,

  // Add a new item, or bump qty if it already exists.
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        // Return a NEW array with the matching item's qty incremented.
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      // Append a fresh line item with qty 1.
      return { items: [...state.items, { ...item, qty: 1 }] };
    }),

  // Remove the matching line item entirely.
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  // Clamp quantity to a minimum of 1; never go to zero here.
  setQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, qty) } : i
      ),
    })),

  clear: () => set({ items: [] }),

  // A DERIVED value computed on demand via get(). Call it as
  // useCartStore.getState().totalCents() or select it in a component.
  totalCents: () =>
    get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

  // An async action: set a loading flag, await work, then commit results.
  checkout: async () => {
    // Read current state to guard against empty / double checkout.
    if (get().isCheckingOut || get().items.length === 0) return;

    set({ isCheckingOut: true, lastError: null });
    try {
      // Pretend network call; replace with your real API request.
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Success: empty the cart and drop the loading flag.
      set({ items: [], isCheckingOut: false });
    } catch (err) {
      // Failure: record the message and stop loading.
      set({
        isCheckingOut: false,
        lastError: err instanceof Error ? err.message : "Checkout failed",
      });
    }
  },
}));
```

Tiêu thụ nó với các subscription đúng và tối thiểu:

```tsx
// src/components/CartSummary.tsx
import { useShallow } from "zustand/react/shallow";
import { useCartStore } from "../stores/useCartStore";

export function CartSummary() {
  // The items array changes identity whenever the cart mutates,
  // so a plain selector is fine here (we WANT to re-render on changes).
  const items = useCartStore((state) => state.items);

  // Group the flags + actions we need with useShallow (one new object).
  const { isCheckingOut, checkout } = useCartStore(
    useShallow((state) => ({
      isCheckingOut: state.isCheckingOut,
      checkout: state.checkout,
    }))
  );

  // Derive the total in the component from the items we already subscribed to.
  const totalCents = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div>
      <h3>{items.length} item(s)</h3>
      <p>Total: ${(totalCents / 100).toFixed(2)}</p>
      <button onClick={checkout} disabled={isCheckingOut || items.length === 0}>
        {isCheckingOut ? "Processing…" : "Checkout"}
      </button>
    </div>
  );
}
```

> [!TIP]
> Để ý rằng chúng ta suy ra `totalCents` *trong component* từ `items` mà ta đã subscribe, thay vì cũng subscribe vào getter `totalCents()`. Subscribe cả hai sẽ đồng nghĩa với hai subscription vào dữ liệu luôn thay đổi cùng nhau. Hãy chọn tập slice nhỏ nhất mô tả đầy đủ những gì component render.

---

## 🧩 7. Một Store với Slices vs. Nhiều Store

Khi một ứng dụng lớn lên, bạn đối mặt với một lựa chọn về tổ chức. Cả hai đều là công dân hạng nhất trong Zustand.

**Nhiều store** — các lời gọi `create` riêng cho từng mối quan tâm (`useAuthStore`, `useCartStore`, `useUiStore`). Mỗi cái hoàn toàn độc lập: đơn giản, cô lập hoàn hảo, và dễ dàng tree-shake. Đây là mặc định được khuyến nghị và khớp với cách tiếp cận store-theo-tính-năng của khóa học.

**Một store đơn được chia thành slice** — một lời gọi `create` mà thân của nó được kết hợp từ nhiều hàm *slice creator*. Hãy chọn cách này khi các slice cần gọi action của nhau dễ dàng, hoặc khi bạn muốn một store được persist/devtools như một đơn vị.

```typescript
// src/stores/slices.ts
import { create } from "zustand";
import type { StateCreator } from "zustand";

// ---- slice 1: auth ----
interface AuthSlice {
  user: string | null;
  login: (user: string) => void;
  logout: () => void;
}

// ---- slice 2: cart ----
interface CartSlice {
  cart: string[];
  addToCart: (item: string) => void;
}

// The full store is the intersection of all slices.
type AppStore = AuthSlice & CartSlice;

// Each slice creator is typed so it can READ and WRITE the WHOLE store
// (the [] [] type params keep middleware inference happy in v5).
const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
});

const createCartSlice: StateCreator<AppStore, [], [], CartSlice> = (
  set,
  get
) => ({
  cart: [],
  addToCart: (item) => {
    // A cart action can read another slice's state via get().
    if (get().user === null) {
      console.warn("Cannot add to cart while logged out");
      return;
    }
    set((state) => ({ cart: [...state.cart, item] }));
  },
});

// Compose every slice into one store by spreading each creator's result.
export const useAppStore = create<AppStore>()((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));
```

| Câu hỏi | Nhiều store | Một store + slices |
| :--- | :--- | :--- |
| Độ phức tạp thiết lập | Thấp nhất | Hơi nhiều hơn (định kiểu `StateCreator`) |
| Truy cập xuyên tính năng | Import hook của store kia | Một `get()` dùng chung |
| Cô lập / tree-shaking | Tốt nhất | Toàn bộ store nạp cùng nhau |
| Persist / devtools như một đơn vị | Theo từng store | Một cấu hình cho tất cả |
| Mặc định được khuyến nghị | ✅ Bắt đầu ở đây | Khi các slice gắn kết chặt chẽ |

> [!TIP]
> Hãy bắt đầu với **nhiều store nhỏ**, mỗi store cho một tính năng, và chỉ dùng đến mẫu store-đơn-chia-slice khi bạn thấy các slice liên tục cần dữ liệu của nhau. Tách ra sau này là rẻ; gỡ rối một store khổng lồ thì không.

---

## 🧠 Kiểm tra kiến thức của bạn

### 1. Tại sao Zustand không yêu cầu một bao bọc `<Provider>` tại root của ứng dụng?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Một Zustand store được tạo ra như một **closure ở cấp module sống bên ngoài cây component React**. Khi một component gọi store hook, nó subscribe trực tiếp vào store bên ngoài đó. Vì state không sống bên trong React, không có React Context nào cần cung cấp, và do đó không cần `<Provider>` tại root. Cùng một store thậm chí có thể được đọc và ghi hoàn toàn bên ngoài React qua `useStore.getState()` và `useStore.setState()`.
</details>

### 2. `set` làm gì khi bạn gọi `set({ count: 1 })` trên một store cũng có trường `title`? Còn với các object lồng nhau thì sao?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `set` thực hiện một **shallow merge ở cấp cao nhất**. `set({ count: 1 })` chỉ thay thế key `count` và để nguyên `title` anh em. Tuy nhiên, việc merge *chỉ sâu một cấp*: với một object lồng nhau như `user`, gọi `set({ user: { name: "Ada" } })` sẽ **thay thế toàn bộ object `user`**, làm mất mọi trường khác. Để giữ lại các trường anh em bên trong một object lồng nhau bạn phải tự spread giá trị trước đó: `set((state) => ({ user: { ...state.user, name: "Ada" } }))`.
</details>

### 3. Khi nào bạn cần `useShallow`, và khi nào *không*?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Zustand re-render khi kết quả của selector khác đi theo `Object.is`. Bạn **cần `useShallow`** khi một selector đơn trả về một *object, array, hay tuple vừa được dựng mới* (ví dụ `(s) => ({ a: s.a, b: s.b })`), vì một tham chiếu mới được tạo ở mỗi lần gọi và `Object.is` luôn báo "khác", gây re-render với mọi thay đổi store. Bạn **không cần nó** khi mỗi selector trả về một **primitive** ổn định (`(s) => s.count`) hoặc một **tham chiếu hàm** ổn định (`(s) => s.increment`) được chọn trong lời gọi hook riêng của nó — những thứ đó so sánh đúng với `Object.is`.
</details>

### 4. Bên trong một action, làm sao để đọc state hiện tại mà không nhận nó như một tham số của `set`, và khi nào điều đó hữu ích?
<details>
  <summary><b>Hiện đáp án</b></summary>

  **Tham số thứ hai, `get`**, của callback `create` trả về snapshot trực tiếp của store: `const { count } = get();`. Nó hữu ích khi một action cần *đọc trước khi ghi* — cho validation/guard (ví dụ đừng tăng quá một max, đừng checkout một giỏ rỗng), để đọc state của **slice khác** trong một store chia slice, hoặc để đọc state ở một chỗ và ghi ở một chỗ khác trong cùng một action. Thay vào đó hãy dùng dạng hàm `set((state) => ...)` khi bạn chỉ cần giá trị trước đó để tính ra giá trị mới.
</details>

### 5. Bạn viết `const store = useCartStore();` (không selector). Hệ quả về hiệu năng là gì, và bạn khắc phục thế nào?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Gọi hook **không có selector** subscribe component vào **toàn bộ store**, nên nó re-render với *mọi* thay đổi state ở bất cứ đâu trong store — kể cả các trường không liên quan. Cách khắc phục là truyền một **selector hẹp** cho từng giá trị bạn thực sự dùng (`useCartStore((s) => s.items)`), hoặc, khi bạn cần nhiều giá trị cùng lúc, gom chúng vào **một selector bọc trong `useShallow`** để component chỉ re-render khi một trong những giá trị cụ thể đó thay đổi.
</details>

---

## 💻 Bài tập thực hành

### 🛠️ Bài tập 1: Một Todo Store có thể lọc (state, actions, selectors, `useShallow`)

Xây dựng một todo store và một UI re-render một cách chính xác.

1. Tạo `src/stores/useTodoStore.ts` với một `TodoStore` được định kiểu:
   - State: `todos: Todo[]` (với `Todo = { id: number; text: string; done: boolean }`) và `filter: "all" | "active" | "done"`.
   - Actions: `addTodo(text)`, `toggleTodo(id)`, `removeTodo(id)`, `setFilter(filter)`, và `clearCompleted()`.
   - Một getter `visibleTodos()` dùng `get()` để trả về các todo khớp với `filter` hiện tại.
2. Xây dựng `TodoList.tsx` subscribe vào các todo hiển thị và render chúng.
3. Xây dựng một toolbar `Filters.tsx` chọn `filter` và `setFilter` cùng nhau bằng `useShallow`, và chứng minh (bằng một `console.log`) rằng việc toggle một todo **không** re-render toolbar.

```tsx
// src/stores/useTodoStore.ts — STARTER (fill in the bodies)
import { create } from "zustand";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

type Filter = "all" | "active" | "done";

interface TodoStore {
  todos: Todo[];
  filter: Filter;
  addTodo: (text: string) => void;
  toggleTodo: (id: number) => void;
  removeTodo: (id: number) => void;
  setFilter: (filter: Filter) => void;
  clearCompleted: () => void;
  visibleTodos: () => Todo[];
}

export const useTodoStore = create<TodoStore>()((set, get) => ({
  todos: [],
  filter: "all",

  addTodo: (text) =>
    set((state) => ({
      todos: [...state.todos, { id: Date.now(), text, done: false }],
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    })),

  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),

  setFilter: (filter) => set({ filter }),

  clearCompleted: () =>
    set((state) => ({ todos: state.todos.filter((t) => !t.done) })),

  // Uses get() to read both todos AND the current filter.
  visibleTodos: () => {
    const { todos, filter } = get();
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "done") return todos.filter((t) => t.done);
    return todos;
  },
}));
```

```tsx
// src/components/Filters.tsx — STARTER
import { useShallow } from "zustand/react/shallow";
import { useTodoStore } from "../stores/useTodoStore";

export function Filters() {
  // Group filter + setFilter into ONE shallow subscription.
  const { filter, setFilter } = useTodoStore(
    useShallow((state) => ({
      filter: state.filter,
      setFilter: state.setFilter,
    }))
  );

  console.log("Filters rendered"); // should NOT log when toggling a todo

  return (
    <div>
      {(["all", "active", "done"] as const).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          style={{ fontWeight: filter === f ? "bold" : "normal" }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
```

**Nhiệm vụ của bạn:** Viết `TodoList.tsx`. Subscribe vào các todo *hiển thị* (gợi ý: chọn `todos` và `filter`, rồi suy ra trong component, HOẶC gọi getter `visibleTodos` qua `useTodoStore((s) => s.visibleTodos())` — giải thích trong một comment bạn chọn cách nào và tại sao). Thêm một input + button gọi `addTodo`, và các button Toggle cùng Remove cho từng hàng.

**Mục tiêu nâng cao:** Thêm một getter `remainingCount()` (số todo `!done`) và một `<Footer>` hiển thị nó. Xác nhận bằng một `console.log` rằng footer chỉ re-render khi con số thực sự thay đổi — không phải với mỗi lần gõ phím trong state không liên quan.

---

### 🛠️ Bài tập 2: Tách Store thành các Slice

Lấy giỏ hàng từ Phần 6 và khái niệm auth từ Phần 7 rồi kết hợp chúng thành **một store chia slice**.

1. Tạo `src/stores/useShopStore.ts` export một store đơn được kết hợp từ `createAuthSlice` và `createCartSlice` dùng mẫu `StateCreator<AppStore, [], [], Slice>`.
2. Làm cho `addToCart` **đọc state auth qua `get()`** và từ chối thêm khi `user === null` (return sớm và set một chuỗi `lastError`).
3. Xây dựng một component `Shop.tsx` mà:
   - Chọn `user`, `login`, `logout` với `useShallow`.
   - Chọn `cart` và `addToCart` với `useShallow`.
   - Render một form đăng nhập khi chưa đăng nhập và UI giỏ hàng khi đã đăng nhập.

```typescript
// src/stores/useShopStore.ts — STARTER (complete the slices)
import { create } from "zustand";
import type { StateCreator } from "zustand";

interface AuthSlice {
  user: string | null;
  login: (user: string) => void;
  logout: () => void;
}

interface CartSlice {
  cart: string[];
  lastError: string | null;
  addToCart: (item: string) => void;
}

type ShopStore = AuthSlice & CartSlice;

const createAuthSlice: StateCreator<ShopStore, [], [], AuthSlice> = (set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null, cart: [] }), // also clears the cart on logout
});

const createCartSlice: StateCreator<ShopStore, [], [], CartSlice> = (
  set,
  get
) => ({
  cart: [],
  lastError: null,
  addToCart: (item) => {
    // Read the auth slice via the shared get().
    if (get().user === null) {
      set({ lastError: "Please log in before adding to the cart." });
      return;
    }
    set((state) => ({ cart: [...state.cart, item], lastError: null }));
  },
});

export const useShopStore = create<ShopStore>()((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));
```

**Nhiệm vụ của bạn:** Viết `Shop.tsx` tiêu thụ `useShopStore` với `useShallow` cho từng nhóm, và hiển thị `lastError` khi có.

**Mục tiêu nâng cao:** Thêm middleware `persist` (`import { persist } from "zustand/middleware"`) để giỏ hàng và user sống sót qua một lần tải lại trang, rồi bọc store: `create<ShopStore>()(persist((...args) => ({ ...createAuthSlice(...args), ...createCartSlice(...args) }), { name: "shop-storage" }))`. Tải lại trang và xác nhận giỏ hàng cùng trạng thái đăng nhập được khôi phục từ `localStorage`.
