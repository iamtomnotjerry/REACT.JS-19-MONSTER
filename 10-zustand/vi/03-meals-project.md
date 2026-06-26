# Dự án: Meals Browser với Zustand (async + persist) 🍽️

Trong hai bài học trước, bạn đã học cách **tạo một Zustand store** và cách viết các **async action** cùng với việc kết nối **`persist` middleware**. Bây giờ bạn sẽ ghép tất cả lại với nhau trong một mini-project hoàn chỉnh, đạt chuẩn production: một **Meals Browser**. Chúng ta fetch công thức nấu ăn từ API miễn phí [TheMealDB](https://www.themealdb.com), render chúng trong một lưới card responsive, cho phép người dùng **tìm kiếm/lọc** ngay khi gõ, và cho phép họ **yêu thích (favorite)** các món ăn — với danh sách favorite vẫn tồn tại sau khi refresh trang.

Giảng viên trong khóa học xây dựng nền tảng của dự án này: một store giữ `meals` và một `searchQuery`, fetch dữ liệu, và lọc danh sách ở phía client. Chúng ta sẽ giữ nguyên đúng bộ khung đó rồi nâng cấp nó lên mức mà bạn thực sự sẽ triển khai: một store được type đầy đủ, một **async action `fetchMeals()` thật sự nằm bên trong store** (chứ không nằm trong một `useEffect`), state **`loading`/`error`** tường minh, một **derived selector** cho danh sách đã lọc, và **favorites được persist vào `localStorage` bằng `partialize`** sao cho chỉ favorites — và không gì khác mang tính tạm thời — được lưu lại.

---

## ⚡ 1. Khái niệm & Tổng quan

Một màn hình "duyệt + tìm kiếm + yêu thích" là một trong những mẫu UI phổ biến nhất trên web — nó là bộ khung đứng sau các hàng phim của Netflix, thư viện của Spotify, danh mục thương mại điện tử, và các ứng dụng giao đồ ăn. Bên dưới, nó luôn là cùng một state machine gồm bốn phần:

1. **Dữ liệu từ server** mà bạn fetch một lần (`meals`).
2. **Một bộ lọc hiển thị** do người dùng điều khiển (`query`).
3. **Trạng thái request** để UI có thể hiển thị spinner và lỗi (`loading`, `error`).
4. **Tùy chọn thuộc về người dùng** phải tồn tại lâu hơn phiên làm việc (`favorites`).

Quyết định thiết kế thú vị nằm ở chỗ bốn phần này có **vòng đời (lifetime) khác nhau**. Dữ liệu server là loại bỏ được — bạn có thể fetch lại bất cứ lúc nào. Trạng thái request hoàn toàn tạm thời. Nhưng favorites thuộc về *người dùng*, nên chúng phải được persist. Zustand cho phép chúng ta giữ cả bốn phần trong một store đồng thời chỉ persist phần quan trọng, bằng cách dùng `partialize`.

> [!NOTE]
> **Đâu là phần dựa trên khóa học và đâu là phần mới hoàn toàn.** Phần transcript của khóa học xây dựng phần lõi của dự án này: một Zustand store với `meals` + `searchQuery`, một lần fetch từ TheMealDB, và một `filter` phía client. Mọi thứ trong bài học này cho đến phần "lọc danh sách" đều phản ánh điều đó. Các phần **mới hoàn toàn và vượt ra ngoài bản ghi hình** — chuyển async fetch *vào trong store* dưới dạng một action được type, thêm state `loading`/`error` tường minh, và **chỉ persist `favorites` bằng `partialize`** — rõ ràng là các best practice hiện đại và được dạy như vậy ở đây.

### 🌍 Phép ẩn dụ thực tế

Hãy hình dung store như một **hệ thống tiền sảnh (front-of-house) của nhà hàng**:

- **Bảng thực đơn** (`meals`) được in mới mỗi ca phục vụ từ danh sách gốc của bếp (API). Nếu nó bị nhòe, bạn chỉ cần in lại — nó là loại bỏ được.
- **Tờ ghi chú "đang tìm"** mà người tiếp đón viết nguệch ngoạc khi khách mô tả họ muốn gì (`query`) sẽ bị xóa ngay khi khách được dẫn vào chỗ ngồi. Tạm thời.
- **Đèn báo trạng thái "bếp đang bày món / bếp đang cháy"** (`loading` / `error`) cho nhân viên phục vụ biết chuyện gì *đang* xảy ra *ngay lúc này*. Ngày mai nó chẳng còn ý nghĩa gì.
- **Cuốn sổ favorites của khách quen** (`favorites`) là thứ duy nhất được khóa trong két qua đêm. Khi nhà hàng mở cửa lại, cuốn sổ đó được lấy ra đúng y như cũ. Đó — và chỉ đó — là thứ mà `persist` + `partialize` lưu lại.

### 📊 Các state slice và vòng đời của chúng

| Slice       | Type          | Nguồn         | Vòng đời               | Persist? |
| ----------- | ------------- | ------------- | ---------------------- | ---------- |
| `meals`     | `Meal[]`      | API           | Cho đến khi fetch lại  | ❌ Không    |
| `query`     | `string`      | Người dùng nhập | Cho đến khi xóa      | ❌ Không    |
| `loading`   | `boolean`     | Suy ra/async  | Một request            | ❌ Không    |
| `error`     | `string \| null` | Suy ra/async | Một request         | ❌ Không    |
| `favorites` | `string[]`    | Hành động người dùng | **Mãi mãi** (mỗi người dùng) | ✅ Có |

> [!TIP]
> Một quy tắc ngón tay cái hữu ích: **persist ý định, không persist dữ liệu**. `favorites` là *ý định* (người dùng đã chọn chúng). `meals` chỉ là một bản sao cache của thứ mà server vốn đã sở hữu — fetch lại rất rẻ và luôn cho dữ liệu mới hơn, nên persist nó chỉ làm tăng nguy cơ hiển thị công thức cũ.

---

## 🛠️ 2. Thiết lập dự án

Khởi tạo một app Vite + React + TypeScript và cài đặt Zustand. (Chúng ta dùng Tailwind cho phần styling lưới, đúng như khóa học làm, nhưng mọi khái niệm đều hoạt động với CSS thuần.)

```bash
# Scaffold a React + TypeScript app with Vite
npm create vite@latest meals-browser -- --template react-ts
cd meals-browser

# Install dependencies, then Zustand
npm install
npm install zustand

# Tailwind (optional but used by the course for the grid)
npm install -D tailwindcss @tailwindcss/vite
```

Kết nối Tailwind vào Vite và file stylesheet của bạn:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css — Tailwind v4 single-line import */
@import "tailwindcss";
```

Bố cục thư mục mà chúng ta hướng tới:

```
meals-browser/
├── src/
│   ├── store/
│   │   └── useMealStore.ts     # the Zustand store (state + async + persist)
│   ├── types/
│   │   └── meal.ts             # shared Meal types + API response type
│   ├── components/
│   │   ├── SearchBar.tsx       # controlled search input
│   │   ├── MealCard.tsx        # one card + favorite toggle
│   │   └── MealGrid.tsx        # responsive grid + loading/error/empty states
│   ├── App.tsx
│   └── main.tsx
└── index.html
```

---

## 🧩 3. Định kiểu cho Domain

TheMealDB trả về rất nhiều field cho mỗi món ăn, nhưng chúng ta chỉ cần một nắm nhỏ. Hãy định nghĩa một **type `Meal` thu hẹp** cho những gì app dùng, cộng thêm một type cho **API response thô** để việc fetch được type-safe từ đầu đến cuối.

```typescript
// src/types/meal.ts

// The shape the API returns. TheMealDB uses `idMeal`, `strMeal`,
// `strMealThumb` (the "str"/"id" prefixes are their convention).
// `meals` is `null` when the search has no results — important to handle.
export interface ApiMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
}

export interface MealApiResponse {
  meals: ApiMeal[] | null;
}

// The trimmed shape our UI actually renders. Mapping the API into
// our own type means a future API change touches ONE function, not
// every component.
export interface Meal {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  area: string;
}

// Pure mapper: raw API meal -> our domain Meal.
export function toMeal(api: ApiMeal): Meal {
  return {
    id: api.idMeal,
    name: api.strMeal,
    thumbnail: api.strMealThumb,
    category: api.strCategory,
    area: api.strArea,
  };
}
```

> [!WARNING]
> TheMealDB trả về `{ "meals": null }` — không phải một mảng rỗng — khi một lần tìm kiếm không cho kết quả nào. Nếu bạn vô tư gọi `.map()` trên `data.meals`, bạn sẽ crash với lỗi *"Cannot read properties of null (reading 'map')"*. (Khóa học đã gặp phiên bản tương tự của bug này — đọc `data.meal` thay vì `data.meals`.) Luôn dùng toán tử coalesce: `data.meals ?? []`.

---

## ⚡ 4. Store: State + Async Action + Persist

Đây là trái tim của bài học. Chúng ta định nghĩa một store giữ cả bốn slice, expose các action, chạy async fetch **bên trong store**, và chỉ persist **mỗi `favorites`** thông qua `partialize`.

```typescript
// src/store/useMealStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Meal, type MealApiResponse, toMeal } from "../types/meal";

// TheMealDB search endpoint. Empty `s=` returns a default batch of meals.
const SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

// The full store contract: state values first, then actions.
interface MealState {
  // --- state ---
  meals: Meal[];
  query: string;
  loading: boolean;
  error: string | null;
  favorites: string[]; // array of meal ids — this is the ONLY persisted slice

  // --- actions ---
  fetchMeals: () => Promise<void>;
  setQuery: (query: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useMealStore = create<MealState>()(
  // `persist` wraps the store factory. The 2nd arg configures storage.
  persist(
    (set, get) => ({
      // --- initial state ---
      meals: [],
      query: "",
      loading: false,
      error: null,
      favorites: [],

      // --- async action: lives in the store, not in a useEffect ---
      // Marking it `async` is all Zustand needs — no thunk/saga layer.
      fetchMeals: async () => {
        // Flip the status light on and clear any stale error.
        set({ loading: true, error: null });
        try {
          const res = await fetch(SEARCH_URL);
          if (!res.ok) {
            // Non-2xx responses don't throw on their own — check manually.
            throw new Error(`Request failed with status ${res.status}`);
          }
          const data: MealApiResponse = await res.json();
          // `data.meals` is null when there are no results — coalesce it.
          const meals = (data.meals ?? []).map(toMeal);
          set({ meals, loading: false });
        } catch (err) {
          // Narrow `unknown` to a readable message for the UI.
          const message =
            err instanceof Error ? err.message : "Failed to fetch meals";
          console.error("Error fetching meals:", message);
          set({ error: message, loading: false });
        }
      },

      // --- sync action: update the search query ---
      setQuery: (query) => set({ query }),

      // --- sync action: add/remove an id from favorites (persisted) ---
      toggleFavorite: (id) => {
        const { favorites } = get();
        const next = favorites.includes(id)
          ? favorites.filter((favId) => favId !== id) // remove
          : [...favorites, id]; // add
        set({ favorites: next });
      },

      // --- read helper: is this meal favorited? ---
      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      // Key under which the persisted slice is saved in localStorage.
      name: "meals-storage",
      storage: createJSONStorage(() => localStorage),
      // CRITICAL: persist ONLY favorites. Transient slices (meals, query,
      // loading, error) must never be saved — they'd resurrect stale data
      // and a frozen spinner on the next page load.
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
```

> [!NOTE]
> Hãy để ý **chữ ký gọi hai lần (double call signature)** `create<MealState>()( ... )`. Khi bạn bọc một store trong middleware như `persist`, kiểu TypeScript của Zustand yêu cầu dạng curry này — `create<T>()(...)` thay vì `create<T>(...)`. Quên cặp `()` rỗng sẽ tạo ra một lỗi type khó hiểu, nên đây là cái bẫy Zustand+TS phổ biến nhất.

### `partialize` thay đổi những gì được lưu như thế nào

```
                Full store state
        ┌───────────────────────────────┐
        │ meals      query     loading   │
        │ error      favorites           │
        └───────────────┬───────────────┘
                        │  partialize: (s) => ({ favorites: s.favorites })
                        ▼
            localStorage["meals-storage"]
        ┌───────────────────────────────┐
        │ { "state": { "favorites":      │
        │     ["52772","52959"] },       │
        │   "version": 0 }               │   ← only favorites survive a refresh
        └───────────────────────────────┘
```

> [!TIP]
> Vì `isFavorite` đọc từ `get()`, nó **không** reactive — gọi `store.isFavorite(id)` một lần sẽ không re-render khi favorites thay đổi. Hãy dùng nó bên trong event handler hoặc các giá trị tính toán. Đối với UI phải *re-render* khi favorites thay đổi, hãy subscribe trực tiếp vào slice bằng một selector (trình bày ở phần tiếp theo).

---

## 🧩 5. Một Derived Selector cho danh sách đã lọc

Tìm kiếm của người dùng nên lọc danh sách `meals` đã fetch sẵn ở **phía client** — không có request mạng phụ thêm cho mỗi lần gõ phím. Thay vì tính lại bộ lọc bên trong mỗi component, hãy expose nó dưới dạng một **selector hook** để logic nằm ở một nơi duy nhất và bất kỳ component nào cũng có thể tái sử dụng.

```typescript
// src/store/useMealStore.ts (append below the store)

// A derived selector hook. It does NOT add state — it computes a value
// from existing state on each render. Components that call this re-render
// only when `meals` or `query` actually change.
export const useFilteredMeals = (): Meal[] =>
  useMealStore((state) => {
    const q = state.query.trim().toLowerCase();
    if (q === "") return state.meals; // empty query => show everything
    return state.meals.filter((meal) =>
      meal.name.toLowerCase().includes(q)
    );
  });

// Convenience selectors keep components terse and re-renders surgical.
export const useMealsLoading = () => useMealStore((s) => s.loading);
export const useMealsError = () => useMealStore((s) => s.error);
```

> [!WARNING]
> Selector lọc trả về một **mảng mới** mỗi khi `query` không rỗng (`.filter()` luôn cấp phát mảng mới). Điều đó ổn ở đây vì component tiêu thụ vốn đã re-render khi `meals`/`query` thay đổi. Nhưng đừng bao giờ đặt một phép tính O(n²) tốn kém trong một selector mà không memoize — selector chạy trên **mỗi** lần cập nhật store. Đối với các phép suy ra nặng, hãy tính bên trong component với `useMemo`, hoặc lưu trữ giá trị đã suy ra.

### 📊 Fetch trong `useEffect` so với fetch bằng store-action

| Khía cạnh           | Fetch trong component `useEffect` (lần đầu của khóa học) | Async action trong store (bài học này) |
| ------------------- | ---------------------------------------------------- | --------------------------------------- |
| Logic nằm ở đâu     | Bên trong mỗi component                              | Một nơi duy nhất, là store              |
| Tái sử dụng nơi khác | ❌ Copy/paste                                         | ✅ Gọi `fetchMeals()` ở bất cứ đâu       |
| Test độc lập        | ❌ Cần một component đã render                        | ✅ Gọi action trực tiếp                  |
| `loading`/`error`   | `useState` cục bộ, bị lặp lại                         | Tập trung trong store                   |
| Fetch lại theo yêu cầu | Vụng về                                          | Đơn giản — gọi lại action               |

---

## 🛠️ 6. Các Component

### ⚡ SearchBar — controlled input gắn với store

```tsx
// src/components/SearchBar.tsx
import { useMealStore } from "../store/useMealStore";

export function SearchBar() {
  // Subscribe ONLY to `query` and `setQuery` so this input doesn't
  // re-render when meals or favorites change.
  const query = useMealStore((s) => s.query);
  const setQuery = useMealStore((s) => s.setQuery);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search for a meal…"
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base
                 outline-none focus:border-orange-500 focus:ring-2
                 focus:ring-orange-200"
      aria-label="Search meals by name"
    />
  );
}
```

### ⚡ MealCard — một card với nút toggle favorite

```tsx
// src/components/MealCard.tsx
import { useMealStore } from "../store/useMealStore";
import type { Meal } from "../types/meal";

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const toggleFavorite = useMealStore((s) => s.toggleFavorite);
  // Subscribe to a boolean derived from THIS meal's favorite status.
  // The component re-renders only when this specific card's status flips.
  const favorited = useMealStore((s) => s.favorites.includes(meal.id));

  return (
    <article className="group relative overflow-hidden rounded-xl bg-white shadow-md
                        transition hover:shadow-xl">
      <img
        src={meal.thumbnail}
        alt={meal.name}
        loading="lazy"
        className="h-48 w-full object-cover"
      />

      {/* Favorite toggle, top-right corner */}
      <button
        type="button"
        onClick={() => toggleFavorite(meal.id)}
        aria-pressed={favorited}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center
                   rounded-full bg-white/90 text-xl shadow backdrop-blur
                   transition hover:scale-110"
      >
        {/* Filled vs. outline heart communicates state at a glance */}
        {favorited ? "❤️" : "🤍"}
      </button>

      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900">{meal.name}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {meal.category} · {meal.area}
        </p>
      </div>
    </article>
  );
}
```

### ⚡ MealGrid — lưới responsive + trạng thái loading / error / empty

```tsx
// src/components/MealGrid.tsx
import {
  useFilteredMeals,
  useMealsLoading,
  useMealsError,
  useMealStore,
} from "../store/useMealStore";
import { MealCard } from "./MealCard";

export function MealGrid() {
  const meals = useFilteredMeals();
  const loading = useMealsLoading();
  const error = useMealsError();
  const fetchMeals = useMealStore((s) => s.fetchMeals);

  // 1. Loading state — first paint while the request is in flight.
  if (loading) {
    return (
      <p className="py-12 text-center text-gray-500" role="status">
        Loading delicious meals…
      </p>
    );
  }

  // 2. Error state — show the message and a retry that re-runs the action.
  if (error) {
    return (
      <div className="py-12 text-center" role="alert">
        <p className="text-red-600">Something went wrong: {error}</p>
        <button
          type="button"
          onClick={() => fetchMeals()}
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white
                     hover:bg-orange-600"
        >
          Try again
        </button>
      </div>
    );
  }

  // 3. Empty state — fetch succeeded but the filter matched nothing.
  if (meals.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">
        No meals found. Try a different search.
      </p>
    );
  }

  // 4. Success — responsive grid: 1 col on mobile, up to 4 on large screens.
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
}
```

### ⚡ App — khởi động lần fetch một lần khi mount

```tsx
// src/App.tsx
import { useEffect } from "react";
import { useMealStore } from "./store/useMealStore";
import { SearchBar } from "./components/SearchBar";
import { MealGrid } from "./components/MealGrid";

export default function App() {
  // The component's only job re: data is to TRIGGER the action once.
  // All the logic lives in the store; this just calls it on mount.
  const fetchMeals = useMealStore((s) => s.fetchMeals);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]); // fetchMeals is a stable store reference -> runs once

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Seafood &amp; Recipes 🍤</h1>
        <p className="mt-2 text-gray-600">
          Search, browse, and favorite meals. Favorites persist across refreshes.
        </p>
      </header>

      <div className="mb-8">
        <SearchBar />
      </div>

      <MealGrid />
    </main>
  );
}
```

> [!TIP]
> Chúng ta kích hoạt `fetchMeals()` từ `useEffect` trong `App` thay vì gọi nó ở phạm vi module. Kích hoạt khi mount giữ cho việc fetch gắn với vòng đời của React (nó sẽ không chạy trong lúc SSR hay trong các test không render `App`), trong khi *logic* vẫn nằm trong store. Đây là sự phân chia gọn gàng: **component quyết định *khi nào*, store quyết định *như thế nào*.**

---

## 🧩 7. Kiểm chứng tính Persistence

Chạy app, favorite một vài món ăn, rồi mở DevTools → Application → Local Storage. Bạn sẽ thấy chính xác một key:

```json
{
  "state": { "favorites": ["52772", "52959"] },
  "version": 0
}
```

Refresh trang. Các món ăn được fetch lại mới từ API (tốt — luôn cập nhật), nhưng các trái tim đã favorite vẫn được tô đầy, vì `favorites` đã được rehydrate từ `localStorage`. Hãy để ý rằng `meals`, `query`, `loading`, và `error` đều **vắng mặt** trong storage — đó là `partialize` đang làm nhiệm vụ của nó.

> [!WARNING]
> Nếu bạn persist toàn bộ store bằng cách bỏ `partialize`, việc refresh có thể khôi phục `loading: true` từ một request bị gián đoạn giữa chừng — khiến UI của bạn bị kẹt mãi mãi trên loading spinner. Đây chính là lý do các cờ tạm thời phải được loại trừ khỏi việc persist.

---

## 🧠 Kiểm tra kiến thức của bạn

**1. Tại sao `partialize: (state) => ({ favorites: state.favorites })` lại quan trọng trong dự án này? Điều gì sẽ hỏng nếu bạn bỏ nó đi?**

<details>
  <summary><b>Hiện đáp án</b></summary>

`partialize` cho `persist` middleware biết **những slice nào cần lưu** vào `localStorage`. Ở đây chúng ta chỉ whitelist mỗi `favorites`. Nếu bạn bỏ nó đi, `persist` sẽ lưu *toàn bộ* store — bao gồm cả các slice tạm thời như `loading` và `error`. Các kiểu hỏng cụ thể là: (a) một giá trị `loading: true` có thể bị persist nếu refresh xảy ra giữa lúc đang request, và ở lần load tiếp theo UI rehydrate vào một spinner vĩnh viễn mà không có request nào đang chạy; (b) `meals` cũ được khôi phục, che mất dữ liệu server mới; (c) `localStorage` phình to với dữ liệu loại bỏ được. Quy tắc là "persist ý định (favorites), không persist dữ liệu tạm thời/suy ra."
</details>

**2. Store dùng `create<MealState>()(persist(...))` với một cặp `()` rỗng. Tại sao lại có lời gọi rỗng đó?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Đó là **dạng curry** mà Zustand yêu cầu để TypeScript suy luận đúng khi một store được bọc trong middleware. `create<MealState>()` trả về một hàm mà sau đó bạn gọi với bộ khởi tạo store (lớp bọc `persist(...)`). Viết `create<MealState>(persist(...))` (không có cặp ngoặc rỗng) làm TypeScript vấp ngã vì generic và các chữ ký `set`/`get` đã được middleware bổ sung không thể hòa giải được trong một lời gọi duy nhất. Cặp `()` rỗng là cái bẫy Zustand+TS phổ biến nhất — không có nó bạn sẽ nhận một lỗi type khó hiểu mặc dù code lúc runtime vẫn chạy được.
</details>

**3. Phiên bản đầu tiên của khóa học fetch dữ liệu bên trong một component `useEffect`. Chúng ta được lợi gì khi chuyển `fetchMeals` vào store dưới dạng một async action?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Chuyển việc fetch vào store giúp tập trung hóa logic: `loading` và `error` nằm ở một nơi thay vì bị lặp lại dưới dạng `useState` cục bộ trong mỗi component; action trở nên **tái sử dụng được** (bất kỳ component nào cũng có thể gọi `fetchMeals()`, ví dụ một nút "retry") và **test được độc lập** (bạn có thể gọi action trực tiếp mà không cần render một component); và việc fetch lại trở nên đơn giản. Component chỉ còn lại một trách nhiệm duy nhất — quyết định *khi nào* fetch (lúc mount, thông qua `useEffect`) — trong khi store sở hữu phần *như thế nào*. Zustand không cần thunk/saga; đánh dấu action là `async` là đủ vì các action chỉ là hàm thuần.
</details>

**4. `useFilteredMeals` tính lại một mảng đã lọc trên mỗi lần render mà `meals` hoặc `query` thay đổi. Khi nào điều này trở thành vấn đề hiệu năng, và bạn sẽ khắc phục nó ra sao?**

<details>
  <summary><b>Hiện đáp án</b></summary>

Selector chạy trên **mỗi lần cập nhật store** và `.filter()` cấp phát một mảng mới mỗi khi query không rỗng. Với vài trăm món ăn và một phép kiểm tra `.includes()` đơn giản thì điều này không đáng kể. Nó trở thành vấn đề khi danh sách lớn *và* công việc trên mỗi phần tử tốn kém (ví dụ fuzzy matching, chuẩn hóa, hoặc sắp xếp ở mức O(n log n) hoặc tệ hơn), vì chi phí đó phải trả trên mỗi lần gõ phím và mỗi lần cập nhật store không liên quan. Cách khắc phục: debounce các lần cập nhật `query` để bộ lọc chạy ít hơn; memoize phép tính nặng (tính trong component với `useMemo` được key theo `meals` + `query`); hoặc tính trước một search index đã chuẩn hóa khi `meals` được set, để việc lọc trở nên rẻ.
</details>

**5. Sau khi refresh trang, các trái tim favorite vẫn được tô đầy nhưng các meal card lại xuất hiện trở lại từ một lần gọi API mới. Hãy giải thích hai cơ chế khác nhau chịu trách nhiệm cho mỗi hành vi.**

<details>
  <summary><b>Hiện đáp án</b></summary>

Có hai cơ chế riêng biệt đang hoạt động. **Favorites vẫn được tô đầy** vì `persist` middleware đã ghi `{ favorites: [...] }` vào `localStorage` (giới hạn ở slice đó bởi `partialize`) và **rehydrate** nó vào store một cách tự động khi store được tạo ở lần load trang tiếp theo. **Meals xuất hiện trở lại** vì chúng *không* được persist — khi mount, `useEffect` của `App` gọi `fetchMeals()`, hàm này thực hiện một request mạng mới và làm đầy lại `meals`. Vậy nên state đã persist được khôi phục từ storage, trong khi state không persist được dựng lại bằng cách chạy lại async action. Đây là thiết kế có chủ đích: ý định của người dùng thì bền bỉ, dữ liệu server thì luôn mới.
</details>

---

## 💻 Bài tập thực hành

### 🛠️ Bài tập 1 — Nút toggle bộ lọc "Chỉ favorites"

Thêm một nút toggle (checkbox hoặc button) mà khi được kích hoạt, chỉ hiển thị **các món ăn đã favorite**. Nó phải kết hợp được với phần tìm kiếm văn bản hiện có: nếu "chỉ favorites" đang bật *và* người dùng gõ "soup", lưới chỉ hiển thị các món đã favorite có tên chứa "soup".

**Nhiệm vụ**

1. Thêm `showFavoritesOnly: boolean` vào store cùng với một action `toggleFavoritesOnly`.
2. Quyết định có persist `showFavoritesOnly` hay không — biện minh cho lựa chọn của bạn trong một comment.
3. Mở rộng `useFilteredMeals` để áp dụng thêm bộ lọc favorites.

**Khởi đầu**

```typescript
// In MealState, add:
//   showFavoritesOnly: boolean;
//   toggleFavoritesOnly: () => void;

// In the store body, add:
showFavoritesOnly: false,
toggleFavoritesOnly: () =>
  set((state) => ({ showFavoritesOnly: !state.showFavoritesOnly })),

// Update the selector:
export const useFilteredMeals = (): Meal[] =>
  useMealStore((state) => {
    const q = state.query.trim().toLowerCase();

    // TODO 1: start from all meals
    let result = state.meals;

    // TODO 2: if showFavoritesOnly, keep only meals whose id is in favorites
    // result = ...

    // TODO 3: if there's a query, also filter by name (lowercased includes)
    // if (q !== "") result = ...

    return result;
  });
```

<details>
  <summary><b>Hiện một lời giải đúng</b></summary>

```typescript
export const useFilteredMeals = (): Meal[] =>
  useMealStore((state) => {
    const q = state.query.trim().toLowerCase();
    let result = state.meals;

    if (state.showFavoritesOnly) {
      result = result.filter((meal) => state.favorites.includes(meal.id));
    }
    if (q !== "") {
      result = result.filter((meal) => meal.name.toLowerCase().includes(q));
    }
    return result;
  });
```

Về việc persist: `showFavoritesOnly` là một **tùy chọn hiển thị (view preference)**, không phải ý định bền bỉ của người dùng, nên hầu hết các app sẽ *không* persist nó — hãy để nó ra ngoài `partialize` để mỗi lần ghé thăm đều bắt đầu trên toàn bộ danh mục. (Persist nó là chấp nhận được nếu bạn muốn nút toggle "dính lại", nhưng khi đó hãy thêm nó vào whitelist `partialize` một cách tường minh.)
</details>

---

### 🛠️ Bài tập 2 — Tìm kiếm trên API thay vì lọc cục bộ

Hiện tại chúng ta fetch một lần và lọc ở phía client. Hãy thay đổi `fetchMeals` để nhận query và gọi `search.php?s=<query>` sao cho **server** thực hiện việc tìm kiếm. Debounce nó để bạn không bắn một request trên mỗi lần gõ phím.

**Nhiệm vụ**

1. Đổi `fetchMeals` thành `fetchMeals: (query: string) => Promise<void>` và dựng URL từ query.
2. Trong `SearchBar`, debounce các lời gọi tới `fetchMeals` (ví dụ 400 ms) để gõ "chicken" tạo ra một request, không phải tám.
3. Giữ cho `loading`/`error` hoạt động, và xử lý trường hợp `data.meals === null` (không có kết quả).

**Khởi đầu**

```typescript
// store: build the URL from the query
const SEARCH_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

fetchMeals: async (query: string) => {
  set({ loading: true, error: null });
  try {
    const res = await fetch(`${SEARCH_URL}${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const data: MealApiResponse = await res.json();
    set({ meals: (data.meals ?? []).map(toMeal), loading: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch meals";
    set({ error: message, loading: false });
  }
},
```

```tsx
// SearchBar.tsx — debounce the server search
import { useEffect, useRef } from "react";
import { useMealStore } from "../store/useMealStore";

export function SearchBar() {
  const query = useMealStore((s) => s.query);
  const setQuery = useMealStore((s) => s.setQuery);
  const fetchMeals = useMealStore((s) => s.fetchMeals);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // TODO: clear the previous timer, then set a new 400ms timer
    // that calls fetchMeals(query). Clean up on unmount.
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetchMeals(query);
    }, 400);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, fetchMeals]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search for a meal…"
      className="w-full rounded-lg border px-4 py-3"
      aria-label="Search meals by name"
    />
  );
}
```

<details>
  <summary><b>Hiện insight chính</b></summary>

Phần debounce nằm trong `useEffect` của `SearchBar`, được key theo `query`. Mỗi lần gõ phím đều cập nhật `query` (tức thời, cục bộ), nhưng effect dọn dẹp timer trước đó và lên lịch một timer mới — nên lời gọi mạng chỉ bắn 400 ms sau khi người dùng *ngừng* gõ. Tìm kiếm phía server là nước đi đúng khi tập dữ liệu quá lớn để gửi xuống client; sự đánh đổi là một vòng round-trip mạng cho mỗi lần tìm kiếm (đã debounce) thay vì lọc cục bộ tức thời. Với thay đổi này, bạn không còn cần `useFilteredMeals` cho việc khớp tên nữa — server trả về các kết quả khớp — mặc dù bạn vẫn giữ một selector nếu bạn còn áp dụng một bộ lọc "chỉ favorites" ở *phía client* lên trên.
</details>
