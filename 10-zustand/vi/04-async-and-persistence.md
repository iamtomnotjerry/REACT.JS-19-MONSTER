# Zustand: Async Actions & Persistence Middleware 🐻💾

Trong các bài học Zustand trước, bạn đã thấy rằng một store chỉ đơn giản là một hàm gọi `set` và `get` — và trong dự án của khóa học, bạn đã fetch một danh sách các món ăn, đưa chúng vào một store, rồi lọc chúng bằng `zustand`. Bài học này phóng to vào hai tính năng biến một store đồ chơi thành một store production: **các async action** sống *bên trong* store, và **`persist` middleware** phản chiếu các phần state được chọn vào trình duyệt để chúng tồn tại sau khi refresh.

Chúng ta cũng sẽ bổ sung thêm hai mảnh công cụ middleware nữa: **`devtools`** (để các thay đổi state của Zustand hiện ra trên timeline của Redux DevTools) và các quy tắc để **kết hợp nhiều middleware theo đúng thứ tự**. Mọi thứ ở đây được type đầy đủ cho React 19 + TypeScript, có thể copy-paste, và không có chỗ trống điền tạm.

> [!NOTE]
> Khóa học được ghi hình bao gồm việc fetch dữ liệu vào một Zustand store và lọc nó (phần tìm kiếm món ăn) cùng với một store form-builder đã được type. Các chủ đề middleware sâu hơn trong bài học này — cấu hình `persist` (`partialize` / `version` / `migrate`), `skipHydration` / `onRehydrateStorage`, lưu ý về SSR hydration, và việc kết hợp `devtools` — đi **xa hơn những gì giảng viên ghi hình trên màn hình**. Chúng được dạy ở đây như những best practice hiện hành của Zustand v5 để bài học tách riêng này có thể tự đứng vững một mình.

---

## ⚡ 1. Khái niệm & Tổng quan

Một Zustand store là state thuần túy cộng với các hàm thuần túy. Vì các hàm này là JavaScript thông thường, hai điều sau đây xảy ra một cách tự nhiên trong khi lại đòi hỏi rất nhiều nghi thức trong Redux:

1. **Một action có thể là `async`.** Bạn đánh dấu hàm là `async`, `await` lệnh gọi network của mình, và gọi `set` mỗi khi một promise resolve. Không có thunk, không có saga, không có lớp "effects" riêng biệt nào cả.
2. **Middleware bọc lấy store creator.** `persist`, `devtools`, `immer`, và các bạn của chúng là các hàm bậc cao nhận store creator của bạn và trả về một creator được nâng cấp. Bạn kết hợp chúng bằng cách lồng vào nhau.

### 🌍 Phép ẩn dụ thực tế

Hãy hình dung store của bạn như một **trạm sơ chế của đầu bếp** trong một căn bếp bận rộn.

- **Một async action là việc đặt hàng với nhà cung cấp.** Đầu bếp viết "cá hồi — *đang đặt hàng*" lên giá phiếu order (`set({ loading: true })`), tiếp tục nấu các món khác, và cập nhật giá phiếu khi xe giao hàng tới với mẻ cá (`set({ data })`) — hoặc khi nhà cung cấp gọi điện báo họ đã hết hàng (`set({ error })`). Căn bếp không bao giờ đứng yên chờ đợi ở cửa.
- **`persist` middleware là danh sách kiểm tra ca đóng cửa.** Trước khi khóa cửa, một line cook chụp ảnh phần *mise en place* — hành đã thái, nước dùng, các loại sốt đáng giữ lại (`partialize`) — và dán tấm ảnh lên tủ lạnh (`localStorage`). Nó cố ý **không** chụp đĩa món ăn dở dang sắp bị bỏ đi (các cờ tạm thời `loading`/`error`). Sáng hôm sau, trạm sơ chế được dựng lại từ tấm ảnh (rehydration).
- **`devtools` là nguồn cấp camera CCTV của căn bếp.** Mọi động tác của đầu bếp đều được đóng dấu thời gian và có thể phát lại, nên khi một món ra sai bạn có thể tua lại đoạn phim thay vì đoán mò.

### 📊 Các mảnh liên quan với nhau như thế nào

| Lớp              | Nó là gì                                      | Ai gọi nó           | Được persist?      |
| ---------------- | --------------------------------------------- | ------------------- | ------------------ |
| State            | `data`, `loading`, `error`, `theme`, …        | được component đọc  | chỉ qua `partialize` |
| Sync action      | `setTheme`, `addItem` — gọi `set` một lần      | component / sự kiện | không (hàm bị bỏ qua) |
| Async action     | `async fetchUser()` — `await` rồi `set`      | component / effect | không |
| `persist` mw     | phản chiếu state ↔ `localStorage`                | runtime, khi `set`   | ghi các key đã chọn |
| `devtools` mw    | stream mọi `set` tới Redux DevTools         | runtime, khi `set`   | không |

### 🧩 Middleware như các lớp bọc lồng nhau (ASCII)

```text
create(
  devtools(            ┐  outermost: sees the FINAL state after persist merges
    persist(           │  middle: serializes/rehydrates to localStorage
      immer(           │  innermost-ish: lets actions "mutate" a draft
        (set, get) => store  ◄── your actual store creator
      ),
    { name, ... }),    │
  { name: 'MyStore' }) ┘
)
```

Mỗi lớp bọc nhận creator từ lớp **bên trong** nó và trao một creator nâng cấp cho lớp **bên ngoài** nó. Thứ tự quan trọng — chúng ta sẽ đề cập các quy tắc trong mục 6.

---

## 🛠️ 2. Các Async Action bên trong Store

Trong Redux, công việc async buộc bạn phải cài Thunk hoặc Saga và dispatch các action type `PENDING` / `FULFILLED` / `REJECTED`. Trong Zustand, action chỉ đơn giản là `async`, và bạn mô tả vòng đời của request bằng ba lệnh `set`: **bắt đầu**, **thành công**, **thất bại**.

```typescript
// src/stores/userStore.ts
import { create } from 'zustand';

// 1. The shape of a single user coming back from the API.
interface User {
  id: number;
  name: string;
  email: string;
}

// 2. The full store contract: state + actions, all typed.
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (id: number) => Promise<void>; // async actions return a Promise
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  error: null,

  // The async action lives RIGHT HERE in the store — no thunk needed.
  fetchUser: async (id) => {
    // START: flip the loading flag and clear any stale error.
    set({ loading: true, error: null });

    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data: User = await res.json();

      // SUCCESS: store the data and turn loading off.
      set({ user: data, loading: false });
    } catch (err) {
      // FAILURE: capture a readable message; never leave loading stuck on.
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: message, loading: false });
    }
  },

  // A plain synchronous action for completeness.
  reset: () => set({ user: null, loading: false, error: null }),
}));
```

Việc tiêu thụ nó trong một component React 19 hoàn toàn giống với bất kỳ store nào khác — các selector giữ cho việc re-render hẹp lại:

```tsx
// src/components/UserCard.tsx
import { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';

export function UserCard({ id }: { id: number }) {
  // Select each slice separately so this component only re-renders
  // when the slice it reads actually changes.
  const user = useUserStore((s) => s.user);
  const loading = useUserStore((s) => s.loading);
  const error = useUserStore((s) => s.error);
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    // Calling the async action returns a Promise; we can ignore it
    // because the store updates itself when it resolves.
    void fetchUser(id);
  }, [id, fetchUser]);

  if (loading) return <p>Loading user…</p>;
  if (error) return <p role="alert">Error: {error}</p>;
  if (!user) return null;

  return (
    <article>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </article>
  );
}
```

> [!NOTE]
> Bộ ba `loading / data / error` là hình dạng kinh điển cho *mọi* action fetch dữ liệu. Vì async action trả về một `Promise<void>`, một caller vẫn có thể `await useUserStore.getState().fetchUser(1)` bên ngoài React (ví dụ trong một route loader hoặc một test) và biết khi nào nó đã hoàn tất.

> [!TIP]
> Hãy dùng `get()` bên trong một async action khi bạn cần state *mới nhất* giữa chừng — ví dụ để khử trùng lặp các request đồng thời: `if (get().loading) return;` ở đầu `fetchUser` ngăn một cú double-click kích hoạt hai lần fetch.

---

## 💾 3. `persist` Middleware

`persist` bọc lấy store creator của bạn và đồng bộ state một cách trong suốt tới một backend `Storage` (mặc định là `localStorage`). Nó serialize trên mỗi lần `set` và rehydrate một lần lúc khởi động.

```typescript
// src/stores/settingsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface SettingsState {
  theme: Theme;
  fontSize: number;
  // Transient field we deliberately will NOT persist:
  isPanelOpen: boolean;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: number) => void;
  togglePanel: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  // Note the extra () after create<...>() — required so TypeScript can
  // infer the middleware-wrapped store type correctly.
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      isPanelOpen: false,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    }),
    {
      // 1. Unique key under which the slice is saved in localStorage.
      name: 'app-settings',

      // 2. Which Storage to use. createJSONStorage handles JSON.stringify /
      //    JSON.parse for you. Swap localStorage for sessionStorage to make
      //    the data last only for the tab session.
      storage: createJSONStorage(() => localStorage),

      // 3. Whitelist exactly what gets written. isPanelOpen is transient UI
      //    state — we never want it resurrected as "open" on a fresh load.
      partialize: (state) => ({ theme: state.theme, fontSize: state.fontSize }),

      // 4. Schema version of the persisted payload (see migrate, section 4).
      version: 1,
    }
  )
);
```

> [!TIP]
> `partialize` là tùy chọn `persist` quan trọng nhất của bạn. Việc persist toàn bộ store — bao gồm cả `loading` và `error` — có thể làm sống lại một spinner bị kẹt sau khi reload. Hãy whitelist chỉ những dữ liệu bền vững: theme, giỏ hàng, form nháp, token xác thực.

> [!NOTE]
> `persist` tự động bỏ qua các hàm trong quá trình serialize — các action không bao giờ có thể được mã hóa JSON, nên chúng đơn giản bị bỏ qua và được gắn lại từ creator lúc khởi động. Bạn không bao giờ cần loại trừ các action của mình trong `partialize`.

### 🧩 Chọn một backend cho storage

| Backend                 | Sống sót qua refresh | Sống sót qua đóng tab | Sống sót qua khởi động lại trình duyệt | Trường hợp dùng điển hình |
| ----------------------- | ---------------- | ------------------ | ------------------------ | ---------------------- |
| `localStorage`          | ✅               | ✅                 | ✅                       | theme, giỏ hàng, auth      |
| `sessionStorage`        | ✅               | ❌                 | ❌                       | luồng wizard / thanh toán |
| in-memory (no persist)  | ❌               | ❌                 | ❌                       | state UI tạm thời     |
| async (IndexedDB)       | ✅               | ✅                 | ✅                       | tập dữ liệu lớn/offline |

Với các backend async như IndexedDB, `createJSONStorage` chấp nhận bất kỳ object nào triển khai `getItem`/`setItem`/`removeItem` trả về các Promise — `persist` sẽ tự động `await` chúng.

---

## 🧩 4. Versioning & Migration

Hình dạng của state được persist sẽ thay đổi theo thời gian. Nếu bạn phát hành một phiên bản mới đổi tên `fontSize` thành `fontScale`, người dùng hiện tại vẫn còn payload *cũ* trong `localStorage` của họ. Cặp `version` + `migrate` nâng cấp các payload cũ khi load.

```typescript
// src/stores/settingsStore.ts (versioned variant)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsStateV2 {
  theme: 'light' | 'dark';
  fontScale: number; // renamed from fontSize, and now a multiplier not px
  setTheme: (theme: 'light' | 'dark') => void;
  setFontScale: (scale: number) => void;
}

export const useSettingsStore = create<SettingsStateV2>()(
  persist(
    (set) => ({
      theme: 'light',
      fontScale: 1,
      setTheme: (theme) => set({ theme }),
      setFontScale: (fontScale) => set({ fontScale }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => localStorage),
      version: 2, // bumped from 1 → 2

      // Runs ONLY when the stored version is older than `version` above.
      // `persistedState` is typed `unknown` — narrow it yourself.
      migrate: (persistedState, fromVersion) => {
        const state = persistedState as Partial<SettingsStateV2> & {
          fontSize?: number; // the old v1 field
        };

        if (fromVersion < 2) {
          // Convert old pixel size (e.g. 16px) into the new scale multiplier.
          const px = state.fontSize ?? 16;
          return {
            theme: state.theme ?? 'light',
            fontScale: px / 16,
          } as SettingsStateV2;
        }

        // Already current — return as-is.
        return state as SettingsStateV2;
      },
    }
  )
);
```

> [!WARNING]
> Nếu bạn thay đổi hình dạng được persist nhưng **quên tăng `version` và viết một `migrate`**, người dùng quay lại sẽ load một payload cũ không còn khớp với các type của bạn nữa. Store âm thầm merge các field không khớp và app của bạn đọc ra `undefined` ở nơi nó mong đợi một number. Hãy đối xử với `version` như một database migration — tăng nó lên trên mỗi thay đổi hình dạng phá vỡ tương thích.

---

## 🌊 5. Hydration: `onRehydrateStorage`, `skipHydration`, và lưu ý về SSR

**Hydration** là khoảnh khắc `persist` đọc payload đã lưu và merge nó vào store đang chạy. Trên một SPA thuần client-side, điều này diễn ra đồng bộ trong lúc tạo store, nên nó thường vô hình. Trong các app **render trên server** (Next.js App Router, Remix) nó trở thành một vấn đề thực sự: server **không có `localStorage`**, nên nó render các giá trị mặc định, rồi client rehydrate với giá trị đã lưu — và hai cây HTML không khớp nhau.

> [!WARNING]
> Đây là **SSR hydration mismatch** kinh điển. Server render `theme: 'light'` (giá trị mặc định) trong khi client ngay lập tức rehydrate thành `theme: 'dark'` đã lưu. React phát hiện rằng markup nó nhận được không khớp với những gì nó sẽ render và ném ra lỗi *"Hydration failed… server rendered HTML didn't match the client"*, thường nhấp nháy sai UI trong một frame. Cách khắc phục là render một UI ổn định, chỉ-mặc-định cho tới khi hydration được xác nhận hoàn tất.

### Pattern A — một cờ `hasHydrated` qua `onRehydrateStorage`

`onRehydrateStorage` chạy *trước* khi rehydration và trả về một callback chạy *sau* khi nó hoàn tất (với state đã rehydrate, hoặc một `error`). Hãy lật một cờ ở đó và gate UI của bạn dựa trên nó.

```tsx
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  hasHydrated: boolean;
  toggleTheme: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      hasHydrated: false,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'app-theme',
      storage: createJSONStorage(() => localStorage),
      // Do NOT persist hasHydrated — it's a runtime-only flag.
      partialize: (state) => ({ theme: state.theme }),

      // The returned function runs once rehydration completes.
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Theme rehydration failed:', error);
        } else {
          state?.setHasHydrated(true);
        }
      },
    }
  )
);
```

```tsx
// src/components/ThemeToggle.tsx
import { useThemeStore } from '../stores/themeStore';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const hasHydrated = useThemeStore((s) => s.hasHydrated);

  // Until hydration is confirmed, render the SAME default markup the server
  // produced. This guarantees server HTML === first client HTML.
  if (!hasHydrated) {
    return (
      <button type="button" disabled aria-busy="true">
        Theme: light
      </button>
    );
  }

  return (
    <button type="button" onClick={toggleTheme}>
      Theme: {theme} (click to switch)
    </button>
  );
}
```

### Pattern B — `skipHydration` + `rehydrate()` thủ công

Đôi khi bạn muốn kiểm soát *thời điểm* hydration chạy — chẳng hạn, để chạy nó một cách tường minh bên trong một `useEffect` để nó không bao giờ thực thi trên server. Đặt `skipHydration: true` và tự gọi `persist.rehydrate()`.

```tsx
// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartState {
  items: string[];
  addItem: (name: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (name) => set((state) => ({ items: [...state.items, name] })),
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
      // Hydration will NOT run automatically — we trigger it ourselves.
      skipHydration: true,
    }
  )
);
```

```tsx
// src/components/HydrationGate.tsx
import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cartStore';

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // rehydrate() returns a Promise that resolves once storage is read.
    // Running it in an effect guarantees it only fires on the client.
    void useCartStore.persist.rehydrate()?.then(() => setHydrated(true));
  }, []);

  // Render nothing (or a skeleton) until the client has rehydrated.
  if (!hydrated) return null;
  return <>{children}</>;
}
```

> [!TIP]
> `persist` API cũng phơi bày `useStore.persist.hasHydrated()`, `onHydrate`, `onFinishHydration`, và `clearStorage()`. Trong một dự án Next.js, việc bọc UI được persist trong một gate như `HydrationGate` (hoặc dùng một cờ `hasHydrated`) là phương thuốc tiêu chuẩn cho cảnh báo mismatch.

---

## 🛠️ 6. `devtools` Middleware & Thứ tự Kết hợp

`devtools` middleware stream mọi `set` tới extension trình duyệt **Redux DevTools**, cho bạn một timeline có thể phát lại, du hành thời gian của các thay đổi state — vô giá khi debug một action kích hoạt sai thời điểm.

```typescript
// src/stores/todoStore.ts
import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggle: (id: number) => void;
}

export const useTodoStore = create<TodoState>()(
  // devtools is OUTERMOST so it observes the final state after persist merges.
  devtools(
    persist(
      (set) => ({
        todos: [],
        addTodo: (text) =>
          set(
            (state) => ({
              todos: [...state.todos, { id: Date.now(), text, done: false }],
            }),
            undefined,
            // 3rd arg: an action NAME that appears in the DevTools timeline.
            'todos/add'
          ),
        toggle: (id) =>
          set(
            (state) => ({
              todos: state.todos.map((t) =>
                t.id === id ? { ...t, done: !t.done } : t
              ),
            }),
            undefined,
            'todos/toggle'
          ),
      }),
      { name: 'todos', storage: createJSONStorage(() => localStorage) }
    ),
    // devtools options: name shown in the extension's store dropdown.
    { name: 'TodoStore', enabled: import.meta.env.DEV }
  )
);
```

Lưu ý **đối số thứ ba của `set`** (`'todos/add'`): khi `devtools` đang hoạt động, chuỗi đó gắn nhãn cho mục trong timeline thay vì một action `anonymous` vô danh.

### 📊 Các quy tắc về thứ tự kết hợp

| Tổ hợp                    | Thứ tự khuyến nghị (ngoài → trong) | Tại sao                                                             |
| ------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `devtools` + `persist`    | `devtools(persist(...))`          | DevTools nên log state *cuối cùng* sau khi persist merge/rehydrate. |
| `persist` + `immer`       | `persist(immer(...))`             | `immer` chỉ thay đổi cách các action ghi; persist serialize kết quả. |
| cả ba                     | `devtools(persist(immer(...)))`   | Lớp ngoài quan sát, lớp giữa lưu trữ, lớp trong cho phép mutate draft. |

> [!WARNING]
> Thứ tự kết hợp **không** tùy tiện. Đặt `devtools` *trong cùng* thì nó sẽ chỉ thấy các lần ghi trước khi `persist` chạy, nên rehydration sẽ không xuất hiện trong timeline của bạn. Quy tắc đáng tin cậy: **`devtools` ngoài cùng, `persist` ở giữa, `immer` trong cùng.** Đồng thời hãy gate `devtools` với `enabled: import.meta.env.DEV` để nó không bao giờ bị đưa lên production.

> [!NOTE]
> Khi bạn xếp chồng middleware, dạng curry `create<T>()(...)` (cặp ngoặc rỗng sau đối số type) là **bắt buộc** để TypeScript suy luận đúng type của store đã được bọc. Viết `create<T>(devtools(...))` mà thiếu cặp `()` thừa sẽ tạo ra các lỗi type khó hiểu — đây là một quy ước được ghi chép của Zustand v5.

---

## 🧠 Kiểm tra Kiến thức của Bạn

### 1. Tại sao Zustand không cần lớp thunk/saga cho công việc async?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Vì một Zustand action là một hàm JavaScript thông thường, không phải một action object được serialize và xử lý bởi reducer. Bạn có thể đánh dấu nó `async`, `await` một lệnh gọi network trực tiếp bên trong nó, và gọi `set()` đồng bộ mỗi khi một promise resolve. Store tự cập nhật tại chỗ — không có sự gián tiếp dispatch/reducer mà lẽ ra sẽ buộc một middleware phải chặn các luồng async. Pattern tiêu chuẩn là ba lệnh `set`: `set({ loading: true })` lúc bắt đầu, `set({ data, loading: false })` lúc thành công, và `set({ error, loading: false })` lúc thất bại.
</details>

### 2. `partialize` làm gì, và tại sao nó được coi là tùy chọn `persist` quan trọng nhất?
<details>
  <summary><b>Hiện đáp án</b></summary>

  `partialize` là một selector `(state) => subset` whitelist chính xác những key nào được ghi vào storage. Nó quan trọng vì việc persist các field tạm thời như `loading` hoặc `error` có thể làm sống lại một spinner bị kẹt hoặc một error cũ sau khi reload. Bằng cách chỉ trả về dữ liệu bền vững (`theme`, `cart`, `authToken`), bạn giữ cho storage gọn nhẹ và tránh mang về các state luôn nên bắt đầu mới. Các hàm bị bỏ qua tự động, nên bạn chỉ liệt kê các field dữ liệu.
</details>

### 3. Giải thích SSR hydration mismatch và một cách khắc phục nó.
<details>
  <summary><b>Hiện đáp án</b></summary>

  Trên server không có `localStorage`, nên store render các giá trị **mặc định** vào HTML. Trên client, `persist` ngay lập tức rehydrate thành các giá trị **đã lưu**, tạo ra markup khác với những gì server đã gửi. React phát hiện sự khác biệt và ném ra lỗi "Hydration failed", thường nhấp nháy sai UI trong một frame. Cách khắc phục: (a) giữ một cờ `hasHydrated` được lật thành `true` bên trong `onRehydrateStorage`, và render markup chỉ-mặc-định cho tới khi nó là `true`; hoặc (b) đặt `skipHydration: true` và gọi `useStore.persist.rehydrate()` bên trong một `useEffect` để hydration chỉ chạy trên client, gate các children cho tới khi nó resolve.
</details>

### 4. Trong `devtools(persist(immer(...)))`, tại sao thứ tự lại quan trọng?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Mỗi middleware bọc lấy creator bên trong nó. `devtools` ở ngoài cùng để nó quan sát state **cuối cùng** — bao gồm cả các lần ghi mà `persist` thực hiện trong lúc rehydration — và log chúng vào timeline. `persist` nằm ở giữa để nó serialize kết quả của bất kỳ thứ gì các lớp bên trong tạo ra. `immer` ở trong cùng vì nó chỉ thay đổi *cách* một action ghi (mutate draft), điều nên xảy ra trước khi persist serialize. Nếu `devtools` ở trong cùng nó sẽ bỏ lỡ rehydration và các thay đổi sau persist; nếu `persist` bọc `devtools` nó sẽ cố serialize các phần nội bộ của DevTools.
</details>

### 5. Mục đích của đối số thứ ba của `set` khi `devtools` đang hoạt động là gì, và tại sao dùng `create<T>()(...)` với cặp ngoặc rỗng?
<details>
  <summary><b>Hiện đáp án</b></summary>

  Đối số `set` thứ ba là một chuỗi **tên action** (ví dụ `'todos/add'`) gắn nhãn cho mục trong timeline của Redux DevTools; thiếu nó, các mục hiện ra dưới dạng vô danh, khiến timeline khó đọc. Dạng curry `create<T>()(...)` — lưu ý cặp `()` thừa sau đối số type — là bắt buộc khi kết hợp middleware để TypeScript có thể suy luận đúng type của store đã bị middleware biến đổi. Viết `create<T>(persist(...))` (không có cặp ngoặc thừa) phá vỡ suy luận và tạo ra các lỗi type khó hiểu. Đây là một quy ước được ghi chép của Zustand v5.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1 — Store món ăn async, được persist (xây dựng trên dự án của khóa học)

Mở rộng phần tìm kiếm món ăn từ khóa học thành một store thực thụ với fetch async và persistence.

**Nhiệm vụ**
1. Tạo `src/stores/mealsStore.ts` được bọc trong `persist`.
2. State: `meals: Meal[]`, `query: string`, `loading: boolean`, `error: string | null`.
3. Async action `fetchMeals()` gọi tới TheMealDB và chạy bộ ba bắt đầu/thành công/thất bại.
4. Sync action `setQuery(q)`.
5. Dùng `partialize` để **chỉ** `meals` và `query` được persist — không bao giờ `loading`/`error`.
6. Reload trình duyệt và xác nhận rằng các món đã cache xuất hiện ngay lập tức trong khi một `fetchMeals()` chạy nền làm mới chúng, và rằng không có spinner nào bị kẹt.

**Khung khởi đầu**

```typescript
// src/stores/mealsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealsState {
  meals: Meal[];
  query: string;
  loading: boolean;
  error: string | null;
  setQuery: (q: string) => void;
  fetchMeals: () => Promise<void>;
}

export const useMealsStore = create<MealsState>()(
  persist(
    (set) => ({
      meals: [],
      query: '',
      loading: false,
      error: null,

      setQuery: (q) => set({ query: q }),

      fetchMeals: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(
            'https://www.themealdb.com/api/json/v1/1/search.php?s='
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: { meals: Meal[] | null } = await res.json();
          set({ meals: json.meals ?? [], loading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          set({ error: message, loading: false });
        }
      },
    }),
    {
      name: 'meals-cache',
      storage: createJSONStorage(() => localStorage),
      // TODO: whitelist ONLY meals + query here.
      partialize: (state) => ({ meals: state.meals, query: state.query }),
    }
  )
);
```

---

### 🛠️ Bài tập 2 — Store auth được versioning, an toàn với hydration

Xây dựng một store auth sống sót qua refresh, migrate một hình dạng payload cũ, và không bao giờ nhấp nháy trạng thái đã đăng xuất trong lần render đầu tiên.

**Nhiệm vụ**
1. Tạo `src/stores/authStore.ts` được bọc trong `persist` với `version: 2`.
2. State: `token: string | null`, `user: { id: number; name: string } | null`, `hasHydrated: boolean`.
3. Các action: `login(token, user)`, `logout()`, `setHasHydrated(v)`.
4. Viết một `migrate` nâng cấp một payload v1 (vốn lưu một `userName: string` phẳng) thành object `user` của v2.
5. Dùng `onRehydrateStorage` để lật `hasHydrated`.
6. Trong một `Navbar`, render một skeleton trung tính cho tới khi `hasHydrated` là `true`, rồi hiển thị tên người dùng hoặc một nút "Sign in".

**Khung khởi đầu**

```tsx
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  hasHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({ token: state.token, user: state.user }),

      migrate: (persisted, fromVersion) => {
        const state = persisted as Partial<AuthState> & { userName?: string };
        if (fromVersion < 2) {
          // v1 stored a flat userName string; reshape it into a User object.
          return {
            token: state.token ?? null,
            user: state.userName
              ? { id: 0, name: state.userName }
              : null,
          } as AuthState;
        }
        return state as AuthState;
      },

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

```tsx
// src/components/Navbar.tsx
import { useAuthStore } from '../stores/authStore';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Skeleton until hydration completes — prevents a logged-out flash.
  if (!hasHydrated) return <nav aria-busy="true">Loading…</nav>;

  return (
    <nav>
      {user ? (
        <>
          <span>Hi, {user.name}</span>
          <button type="button" onClick={logout}>
            Sign out
          </button>
        </>
      ) : (
        <button type="button">Sign in</button>
      )}
    </nav>
  );
}
```

Refresh trang vài lần và xác nhận rằng **không** có cảnh báo hydration-mismatch nào trong console, trạng thái auth sống sót qua các lần reload, và một payload v1 cũ được âm thầm nâng cấp lên hình dạng v2.
