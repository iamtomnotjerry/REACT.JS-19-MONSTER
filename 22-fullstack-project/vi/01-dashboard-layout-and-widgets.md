# FullStack: Dashboard Layout & Widgets 📊

Bài học này là một phần tách riêng, tập trung từ bản dựng lớn hơn [FullStack Enterprise Dashboard](./01-fullstack-dashboard.md). Ở đây chúng ta gần như bỏ qua hoàn toàn backend và chỉ tập trung vào một thứ duy nhất: **lớp vỏ frontend cho trang admin** — layout responsive (sidebar + header + nội dung), các **stat card** ở phía trên, một **widget quản lý Genre**, và một **bảng quản lý Movie** với các hành động trên từng dòng. Chúng ta tiêu thụ các danh sách RTK Query mà bạn đã nối dây từ trước (`useGetMoviesQuery` / `useGetGenresQuery`) và hiển thị đúng các trạng thái loading, rỗng và lỗi cho từng cái.

Trong phần hướng dẫn của khóa học, giảng viên đăng nhập với vai trò admin, mở dashboard, và hiển thị ba con số nổi bật (subscribers/users, comments, movies), một panel "top content", một công cụ tạo/cập nhật/xóa genre, và một bảng movie có các dòng cho phép bạn nhảy thẳng vào việc cập nhật hoặc xóa. Chúng ta dựng lại chính xác bề mặt đó ở đây bằng **React 19 + TypeScript + Tailwind**, dưới dạng các component widget có thể tái sử dụng và được định kiểu (typed) đầy đủ — để các bài học tiếp theo có thể gắn vào phần auth thật (bài 02) và toàn bộ lớp CRUD/API (bài 03) mà không cần đụng đến layout.

---

## 🧭 Concept & Overview

Một admin dashboard không phải là một trang lớn duy nhất — nó là một **khung (frame)** cộng với một lưới các **widget**. Khung (sidebar + header + vùng nội dung) đứng yên trong khi bạn điều hướng; các widget là những panel độc lập, khép kín, mỗi cái sở hữu một mảnh dữ liệu, một spinner loading, và một thông báo lỗi riêng. Sự tách biệt này chính là điều cho phép một sản phẩm thực tế phát triển: bạn thêm một widget mới mà không cần thiết kế lại trang, và một widget bị lỗi sẽ hiển thị lỗi của riêng nó thay vì làm trống cả màn hình.

Hãy hình dung dashboard như **phòng điều khiển của một cụm rạp chiếu phim**. Các bức tường và lối cửa không bao giờ di chuyển — đó là lớp vỏ layout của bạn. Trên tường treo một loạt màn hình độc lập: một cái hiển thị doanh số vé (stat card), một cái là màn hình cảm ứng để chỉnh bảng lịch chiếu (widget Genre), và một cái là danh sách phim lớn mà người quản lý cuộn và chỉnh sửa (bảng Movie). Nếu luồng dữ liệu doanh số vé bị ngắt, riêng màn hình đó hiển thị nhiễu — người quản lý vẫn có thể dùng màn hình danh sách. Mỗi màn hình nối dây đến luồng camera riêng của nó (hook RTK Query riêng); bản thân căn phòng không quan tâm luồng nào đang hoạt động.

> [!NOTE]
> **Hoàn toàn mới so với có cơ sở.** Các *widget* admin (stat card, công cụ genre, bảng movie với hành động trên dòng) chính xác là những gì khóa học trình diễn. **Lớp vỏ layout Tailwind** cụ thể (sidebar cố định + header sticky + nội dung cuộn được dùng CSS grid) và phần **định kiểu TypeScript** được trình bày ở đây đi xa hơn phần hướng dẫn JavaScript đã ghi hình — chúng được thêm vào một lần, ngay tại đây, như best practice hiện thời. Mọi thứ đều được nối dây đến cùng các endpoint RTK Query từ [bài học gốc](./01-fullstack-dashboard.md).

> [!TIP]
> Mỗi widget nên **ngờ nghệch về layout nhưng thông minh về dữ liệu của chính nó**. Nó fetch bằng hook của mình, render một trong bốn trạng thái (loading / error / empty / data), và phơi ra các callback (`onEdit`, `onDelete`) thay vì tự mình điều hướng. Điều đó giữ cho widget tái sử dụng được trên các trang khác và dễ dàng test một cách độc lập.

### Giải phẫu của dashboard

```text
┌──────────────────────────────────────────────────────────────┐
│  AdminLayout (grid: [sidebar | main])                          │
│ ┌───────────┬────────────────────────────────────────────────┐│
│ │           │  Header (sticky)   title · search · user menu   ││
│ │  Sidebar  ├────────────────────────────────────────────────┤│
│ │  (nav)    │  Content area (scrolls)                         ││
│ │           │   ┌────────┐┌────────┐┌────────┐  ← StatCards   ││
│ │  • Dash   │   │ Users  ││Comments││ Movies │                ││
│ │  • Genres │   └────────┘└────────┘└────────┘                ││
│ │  • Movies │   ┌───────────────┐┌────────────────────────┐   ││
│ │  • Logout │   │ GenreWidget   ││ MovieTable             │   ││
│ │           │   │ list+add+edit ││ rows + edit/delete     │   ││
│ │           │   └───────────────┘└────────────────────────┘   ││
│ └───────────┴────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Trách nhiệm của layout

| Vùng | Sở hữu | KHÔNG sở hữu |
| --- | --- | --- |
| `AdminLayout` | Cấu trúc grid, các breakpoint responsive, vị trí đặt sidebar/header/nội dung | Bất kỳ việc fetch dữ liệu nào, logic nghiệp vụ |
| `Sidebar` | Các link nav + highlight mục đang active + thu gọn trên mobile | Các trang render cái gì |
| `Header` | Vị trí (slot) tiêu đề trang, user menu, nút bật/tắt menu mobile | Phần nội tại của trạng thái sidebar |
| `StatCard` | Một con số + nhãn + icon + skeleton | Con số đó đến từ đâu |
| `GenreWidget` | Danh sách genre, UI thêm/đổi tên/xóa, trạng thái loading/error của chính nó | Lớp HTTP (ủy thác cho các hook RTK Query) |
| `MovieTable` | Các dòng dạng bảng + nút hành động trên từng dòng | Đích điều hướng của các hành động đó (callback) |

---

## ⚡ 1. The Data Contracts (Typed)

Trước khi có bất kỳ UI nào, hãy định nghĩa các shape TypeScript mà các widget sẽ tiêu thụ. Chúng phản chiếu các Mongoose model từ bài học gốc (`Movie`, `Genre`) nhưng được biểu diễn dưới dạng JSON mà frontend thực sự nhận được. Hãy đặt chúng trong một file `types.ts` dùng chung.

```typescript
// frontend/src/types.ts
// These mirror the JSON the API returns (ObjectIds become strings over the wire).

export interface Genre {
  _id: string;
  name: string;
}

export interface MovieReview {
  _id: string;
  name: string;     // reviewer's username (denormalised on the server)
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Movie {
  _id: string;
  name: string;
  image?: string;
  year: number;
  // `getAllMovies` calls `.populate("genre")`, so genre arrives as a full
  // object. We allow a bare string id too, in case a non-populated route is used.
  genre: Genre | string;
  detail: string;
  cast: string[];
  reviews: MovieReview[];
  numReviews: number;
  createdAt: string;
}

// A small helper so the table never crashes on an un-populated genre.
export function genreName(genre: Genre | string): string {
  return typeof genre === "string" ? "—" : genre.name;
}
```

> [!NOTE]
> Backend dùng `.populate("genre")` nên `movie.genre` thông thường là object `Genre` đầy đủ. Việc định kiểu nó là `Genre | string` và dồn mọi thao tác đọc qua `genreName()` có nghĩa là một route nào đó *quên* populate sẽ suy biến thành một dấu gạch ngang thay vì render `[object Object]`.

### Định kiểu cho các hook RTK Query

Bài học gốc viết API slice bằng JavaScript. Dưới đây là cùng slice đó bằng TypeScript để các hook trả về dữ liệu đã được định kiểu. Lưu ý rằng tên các endpoint khớp với đề bài của bài học này: `getMovies` / `getGenres`.

```typescript
// frontend/src/redux/api/dashboardApi.ts
import { apiSlice } from "./apiSlice";
import { MOVIES_URL, GENRE_URL } from "../constants";
import type { Movie, Genre } from "../../types";

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // --- Movies ---
    getMovies: builder.query<Movie[], void>({
      query: () => `${MOVIES_URL}/all-movies`,
      providesTags: ["Movie"],
    }),
    deleteMovie: builder.mutation<{ _id: string }, string>({
      query: (id) => ({ url: `${MOVIES_URL}/delete-movie/${id}`, method: "DELETE" }),
      invalidatesTags: ["Movie"],
    }),

    // --- Genres ---
    getGenres: builder.query<Genre[], void>({
      query: () => `${GENRE_URL}/genres`,
      providesTags: ["Genre"],
    }),
    createGenre: builder.mutation<Genre, { name: string }>({
      query: (body) => ({ url: GENRE_URL, method: "POST", body }),
      invalidatesTags: ["Genre"],
    }),
    updateGenre: builder.mutation<Genre, { id: string; name: string }>({
      query: ({ id, name }) => ({ url: `${GENRE_URL}/${id}`, method: "PUT", body: { name } }),
      invalidatesTags: ["Genre"],
    }),
    deleteGenre: builder.mutation<Genre, string>({
      query: (id) => ({ url: `${GENRE_URL}/${id}`, method: "DELETE" }),
      invalidatesTags: ["Genre"],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useDeleteMovieMutation,
  useGetGenresQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} = dashboardApi;
```

---

## 🛠️ 2. The Responsive Layout Shell

Lớp vỏ thuần túy là layout: một CSS grid đặt sidebar bên trái và một cột `main` bên phải. Trên mobile, sidebar trượt đè lên nội dung (off-canvas); từ `md` trở lên nó nằm cố định vĩnh viễn trong một cột có chiều rộng cố định. Chúng ta chỉ dùng các utility class của Tailwind — không có CSS tùy chỉnh.

```tsx
// frontend/src/components/admin/AdminLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

/**
 * The frame for every admin page. It owns one piece of state — whether the
 * mobile sidebar is open — and renders the nested route via <Outlet />.
 */
export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar: off-canvas on mobile, fixed column from md up */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main column is pushed right by the sidebar width on desktop */}
      <div className="md:pl-64">
        <Header title="Dashboard" onMenuClick={() => setMobileOpen(true)} />

        {/* The only scrolling region. max-w keeps lines readable on huge screens */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Dimmed backdrop behind the mobile drawer */}
      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
```

```tsx
// frontend/src/components/admin/Sidebar.tsx
import { NavLink } from "react-router-dom";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

// Single source of truth for the nav. Add a route here and it appears everywhere.
const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/genres", label: "Genres", icon: "🏷️" },
  { to: "/admin/movies", label: "Movies", icon: "🎬" },
] as const;

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800",
        "bg-slate-900 transition-transform duration-200 ease-in-out",
        // Slide in/out on mobile; always visible from md up.
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0",
      ].join(" ")}
    >
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <span className="text-xl">🍿</span>
        <span className="text-lg font-bold">MovieAdmin</span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose} // close the drawer after tapping on mobile
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              ].join(" ")
            }
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

```tsx
// frontend/src/components/admin/Header.tsx
interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger only shows on mobile, where the sidebar is hidden */}
        <button
          className="rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-slate-400 sm:inline">Admin</span>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-600 text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}
```

> [!WARNING]
> Một sidebar cố định (`fixed inset-y-0 left-0 w-64`) nằm *ngoài luồng document*, nên nó không đẩy nội dung. Bạn phải thêm padding `md:pl-64` tương ứng trên cột main (như `AdminLayout` làm) nếu không nội dung của bạn sẽ ẩn *bên dưới* sidebar trên desktop. Hai con số — `w-64` và `pl-64` — phải luôn khớp nhau.

---

## 🧩 3. Stat Cards

Ba con số nổi bật (users, comments, movies) là thứ đầu tiên giảng viên làm nổi bật. Một `StatCard` được thiết kế có chủ đích để chỉ mang tính trình bày (presentational): nó nhận một nhãn, một giá trị, một icon, và một cờ `loading`, rồi render một skeleton trong khi giá trị còn chưa biết. Trang dashboard tính các con số từ các danh sách mà nó đã fetch — tổng số movie, và tổng số review cộng dồn trên tất cả movie.

```tsx
// frontend/src/components/admin/StatCard.tsx
interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  loading?: boolean;
  /** Optional accent colour for the icon chip, e.g. "bg-indigo-600". */
  accent?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  loading = false,
  accent = "bg-indigo-600",
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-lg text-xl ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-slate-400">{label}</p>
        {loading ? (
          // A shimmering placeholder while the number is still loading.
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-700" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">{value}</p>
        )}
      </div>
    </div>
  );
}
```

```tsx
// frontend/src/pages/admin/DashboardPage.tsx
import { useGetMoviesQuery, useGetGenresQuery } from "../../redux/api/dashboardApi";
import StatCard from "../../components/admin/StatCard";
import GenreWidget from "../../components/admin/GenreWidget";
import MovieTable from "../../components/admin/MovieTable";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate = useNavigate();

  // Two independent feeds. Each widget could fetch its own, but the
  // dashboard needs the movie list anyway, so we fetch once and pass down.
  const moviesQuery = useGetMoviesQuery();
  const genresQuery = useGetGenresQuery();

  const movies = moviesQuery.data ?? [];
  // "Comments" in the course = the sum of every movie's reviews.
  const totalComments = movies.reduce((sum, m) => sum + m.numReviews, 0);

  return (
    <div className="space-y-6">
      {/* Stat cards: responsive grid, 1 → 2 → 3 columns */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Movies"
          value={movies.length}
          icon="🎬"
          loading={moviesQuery.isLoading}
        />
        <StatCard
          label="Comments"
          value={totalComments}
          icon="💬"
          accent="bg-emerald-600"
          loading={moviesQuery.isLoading}
        />
        <StatCard
          label="Genres"
          value={genresQuery.data?.length ?? 0}
          icon="🏷️"
          accent="bg-amber-600"
          loading={genresQuery.isLoading}
        />
      </section>

      {/* Two-column widget row on large screens, stacked on small */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <GenreWidget />
        </div>
        <div className="lg:col-span-2">
          <MovieTable
            query={moviesQuery}
            onEdit={(movie) => navigate(`/admin/movies/update/${movie._id}`)}
          />
        </div>
      </section>
    </div>
  );
}
```

> [!TIP]
> Để ý rằng dashboard gọi `useGetMoviesQuery()` một lần và *truyền cả object query* xuống `MovieTable`. RTK Query **khử trùng lặp (deduplicate)** các request giống hệt nhau, nên ngay cả khi `MovieTable` cũng gọi hook đó thì bạn vẫn nhận được đúng một request mạng duy nhất — nhưng việc truyền kết quả xuống làm cho luồng dữ liệu trở nên rõ ràng và tiết kiệm một lần gọi hook.

---

## 🛠️ 4. A Reusable `QueryBoundary` for Loading / Empty / Error

Mọi widget dạng danh sách đều lặp lại cùng một điệu nhảy bốn trạng thái: loading, error, empty, data. Hãy tách nó vào một component generic duy nhất để các widget luôn ngắn gọn và nhất quán. Đây là mảnh được tái sử dụng nhiều nhất trong toàn bộ dashboard.

```tsx
// frontend/src/components/admin/QueryBoundary.tsx
import type { ReactNode } from "react";

// Minimal shape of what an RTK Query hook returns that we care about.
interface QueryLike<T> {
  data?: T[];
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
}

interface QueryBoundaryProps<T> {
  query: QueryLike<T>;
  /** Rendered once data has arrived and is non-empty. */
  children: (data: T[]) => ReactNode;
  emptyMessage?: string;
  /** Number of skeleton rows to show while loading. */
  skeletonRows?: number;
}

// `extends unknown` lets us write a generic arrow component in a .tsx file.
export default function QueryBoundary<T>({
  query,
  children,
  emptyMessage = "Nothing here yet.",
  skeletonRows = 3,
}: QueryBoundaryProps<T>) {
  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-slate-800" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
        <p className="font-medium">Couldn’t load data.</p>
        <button
          onClick={() => query.refetch()}
          className="mt-2 rounded bg-red-800 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const data = query.data ?? [];
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return <>{children(data)}</>;
}
```

> [!NOTE]
> Việc trả về một render-prop (`children: (data) => ReactNode`) thay vì tự render các dòng giúp `QueryBoundary` **generic theo `T`**. Cả widget Genre lẫn bảng Movie đều tái sử dụng nó, và TypeScript thu hẹp (narrow) `data` về đúng kiểu phần tử bên trong mỗi callback `children` — không cần ép kiểu (cast).

---

## 🧩 5. The Genre Management Widget

Công cụ genre là một panel gọn gàng: một danh sách các genre đang có, một ô input để thêm genre mới, và đổi tên/xóa inline trên từng dòng. Nó dùng bốn mutation và một query, và bởi vì mỗi mutation đều `invalidatesTags: ["Genre"]`, danh sách tự động fetch lại sau bất kỳ thay đổi nào — không cần refresh thủ công.

```tsx
// frontend/src/components/admin/GenreWidget.tsx
import { useState } from "react";
import {
  useGetGenresQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} from "../../redux/api/dashboardApi";
import QueryBoundary from "./QueryBoundary";
import type { Genre } from "../../types";

export default function GenreWidget() {
  const genresQuery = useGetGenresQuery();
  const [createGenre, createState] = useCreateGenreMutation();
  const [updateGenre] = useUpdateGenreMutation();
  const [deleteGenre] = useDeleteGenreMutation();

  const [newName, setNewName] = useState("");
  // Which row is being renamed, and the draft text for it.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return; // guard: don't POST an empty genre
    await createGenre({ name }).unwrap(); // unwrap so a failure throws
    setNewName("");
  }

  async function handleRename(genre: Genre) {
    const name = editingName.trim();
    if (name && name !== genre.name) {
      await updateGenre({ id: genre._id, name }).unwrap();
    }
    setEditingId(null);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-base font-semibold">Genres</h2>

      {/* Add form */}
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a genre…"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={createState.isLoading || !newName.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* List with rename / delete per row */}
      <QueryBoundary query={genresQuery} emptyMessage="No genres yet — add one above.">
        {(genres) => (
          <ul className="space-y-1">
            {genres.map((genre) => (
              <li
                key={genre._id}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-800"
              >
                {editingId === genre._id ? (
                  <>
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(genre)}
                      className="flex-1 rounded border border-indigo-500 bg-slate-800 px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => handleRename(genre)}
                      className="text-xs font-medium text-emerald-400 hover:underline"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-slate-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm">{genre.name}</span>
                    <button
                      onClick={() => {
                        setEditingId(genre._id);
                        setEditingName(genre.name);
                      }}
                      className="text-xs text-slate-400 hover:text-indigo-400"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => deleteGenre(genre._id)}
                      className="text-xs text-slate-400 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </div>
  );
}
```

> [!WARNING]
> Luôn `.trim()` và kiểm tra chuỗi rỗng trước khi kích hoạt mutation create/rename. Controller `createGenre` ở backend trả về `{ error: "Name is required" }` khi tên trống, nhưng nó trả về HTTP **200** với lỗi đó nằm trong body — nên RTK Query sẽ không coi đó là một thất bại. Việc canh chừng (guard) ở phía client tránh tạo ra các dòng trống ma.

---

## 🧩 6. The Movie Management Table

Bảng movie là widget lớn nhất: một bảng cuộn được liệt kê mọi movie cùng với poster, năm, genre, số lượng review, và hai hành động trên dòng — **Edit** (điều hướng đến trang cập nhật) và **Delete** (một mutation phá hủy). Nó tái sử dụng `QueryBoundary` và nhận query làm prop để dashboard có thể chia sẻ dữ liệu mà nó đã fetch sẵn.

```tsx
// frontend/src/components/admin/MovieTable.tsx
import { useDeleteMovieMutation } from "../../redux/api/dashboardApi";
import QueryBoundary from "./QueryBoundary";
import { genreName, type Movie } from "../../types";

// The shape of an RTK Query result, narrowed to what this table needs.
interface MovieTableProps {
  query: {
    data?: Movie[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
  onEdit: (movie: Movie) => void;
}

export default function MovieTable({ query, onEdit }: MovieTableProps) {
  const [deleteMovie, deleteState] = useDeleteMovieMutation();

  async function handleDelete(movie: Movie) {
    // A real app would use a modal; window.confirm keeps the example runnable.
    if (window.confirm(`Delete “${movie.name}”? This cannot be undone.`)) {
      await deleteMovie(movie._id).unwrap();
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-base font-semibold">Movies</h2>

      <QueryBoundary query={query} emptyMessage="No movies yet — create one." skeletonRows={5}>
        {(movies) => (
          // overflow-x-auto: the table scrolls horizontally on narrow screens
          // instead of breaking the page layout.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-2 py-2 font-medium">Movie</th>
                  <th className="px-2 py-2 font-medium">Year</th>
                  <th className="px-2 py-2 font-medium">Genre</th>
                  <th className="px-2 py-2 font-medium">Reviews</th>
                  <th className="px-2 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr
                    key={movie._id}
                    className="border-b border-slate-800/60 hover:bg-slate-800/40"
                  >
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-3">
                        {movie.image ? (
                          <img
                            src={movie.image}
                            alt=""
                            className="h-10 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="grid h-10 w-8 place-items-center rounded bg-slate-700 text-xs">
                            🎬
                          </div>
                        )}
                        <span className="font-medium">{movie.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 tabular-nums">{movie.year}</td>
                    <td className="px-2 py-2">{genreName(movie.genre)}</td>
                    <td className="px-2 py-2 tabular-nums">{movie.numReviews}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(movie)}
                          className="rounded bg-slate-700 px-2 py-1 text-xs font-medium hover:bg-slate-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(movie)}
                          disabled={deleteState.isLoading}
                          className="rounded bg-red-700 px-2 py-1 text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
```

> [!TIP]
> Nút `Edit` gọi một callback `onEdit(movie)` thay vì tự mình điều hướng. Chỉ một quyết định đó thôi làm cho `MovieTable` tái sử dụng được trên một panel "vừa thêm gần đây", một trang kết quả tìm kiếm, hay một story Storybook — không cái nào trong số đó có thể muốn điều hướng đến cùng một nơi. *Component cha* quyết định hành động; bảng chỉ báo cáo cú click.

---

## 🛠️ 7. Wiring the Routes

Thả layout và các trang vào router. Toàn bộ khu vực admin lồng bên dưới `AdminLayout`, nên mọi trang admin tự động có sidebar và header. (Trong bài 02 bạn sẽ bọc nhánh này trong `AdminRoute` để áp đặt guard cho admin.)

```tsx
// frontend/src/main.tsx (admin branch of the route tree)
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import GenreWidget from "./components/admin/GenreWidget";

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLayout />, // sidebar + header wrap all children
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      // A full-page genre manager reuses the very same widget.
      { path: "genres", element: <div className="max-w-md"><GenreWidget /></div> },
      // "movies" + "movies/update/:id" pages come in lesson 03 (CRUD layer).
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

---

## 🧠 Test Your Knowledge

### 1. Tại sao `AdminLayout` cần `md:pl-64` trên cột main khi sidebar là `w-64`?

<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì sidebar được định vị bằng `fixed`, nó bị loại khỏi luồng document bình thường và do đó **không** chiếm chỗ để đẩy nội dung sang phải. Nếu không có padding bù trừ, cột `main` bắt đầu ở mép trái của viewport và sidebar cố định sẽ chồng (che) 16rem nội dung đầu tiên. Việc thêm `md:pl-64` dành ra đúng chiều rộng của sidebar (`w-64` = 16rem) trên màn hình `md`+ để nội dung bắt đầu ngay nơi sidebar kết thúc. Hai giá trị phải luôn khớp nhau; nếu bạn nới sidebar thành `w-72`, bạn phải đổi padding thành `md:pl-72`.
</details>

### 2. Làm thế nào danh sách genre tự refresh sau khi bạn thêm hoặc xóa một genre, mà không cần lệnh refetch thủ công nào?

<details>
  <summary><b>Reveal Answer</b></summary>

  Thông qua hệ thống tag của RTK Query. `getGenres` khai báo `providesTags: ["Genre"]`, và mỗi `createGenre`, `updateGenre`, và `deleteGenre` khai báo `invalidatesTags: ["Genre"]`. Khi một mutation thành công, RTK Query đánh dấu mọi query đang active mà *cung cấp* tag `"Genre"` là cũ (stale) và tự động chạy lại nó. Nên ngay khoảnh khắc một thao tác create/rename/delete hoàn tất, `getGenres` fetch lại và `GenreWidget` render lại với dữ liệu mới — không `dispatch`, không `refetch()`, không phẫu thuật cache thủ công.
</details>

### 3. Tại sao `QueryBoundary` được viết dưới dạng một component generic (`<T>`) với một render-prop `children`, thay vì chỉ render các dòng nội bộ?

<details>
  <summary><b>Reveal Answer</b></summary>

  Bởi vì bốn trạng thái (loading / error / empty / data) là giống hệt nhau với mọi danh sách, nhưng *việc render dữ liệu* lại khác nhau giữa genre và movie. Việc làm cho nó generic theo `T` và nhận `children: (data: T[]) => ReactNode` cho phép cùng một boundary bọc cả hai widget trong khi TypeScript vẫn thu hẹp `data` thành `Genre[]` ở một chỗ và `Movie[]` ở chỗ kia — định kiểu đầy đủ, không ép kiểu. Nếu `QueryBoundary` tự render các dòng thì nó hoặc bị khóa vào một kiểu dữ liệu duy nhất hoặc cần một `any` không định kiểu, làm hỏng mục đích.
</details>

### 4. Nút Edit của `MovieTable` gọi `onEdit(movie)` thay vì gọi trực tiếp `navigate(...)`. Điều này mang lại cho chúng ta điều gì?

<details>
  <summary><b>Reveal Answer</b></summary>

  Sự tách rời (decoupling) và khả năng tái sử dụng. Bảng không còn biết hay quan tâm *chỉnh sửa* nghĩa là gì — nó chỉ báo cáo "người dùng đã click Edit trên movie này." Component cha (trang dashboard) quyết định hệ quả: điều hướng đến `/admin/movies/update/:id`. Một component cha khác có thể mở một modal, ghi một sự kiện analytics, hoặc không làm gì. Điều này giữ cho `MovieTable` là một widget thuần trình bày có thể tái sử dụng trên nhiều trang và test một cách độc lập bằng cách truyền một spy làm `onEdit`. Delete được xử lý bên trong bảng vì nó là một mutation dữ liệu khép kín, nhưng ngay cả nó cũng có thể được nâng lên thành một prop nếu cần.
</details>

### 5. Stat card "Comments" hiển thị `movies.reduce((s, m) => s + m.numReviews, 0)`. Tại sao tính nó từ danh sách movie thay vì fetch một con số đếm riêng, và cờ loading nào nên điều khiển card?

<details>
  <summary><b>Reveal Answer</b></summary>

  Các review được *nhúng* bên trong mỗi document movie ở backend (`movie.reviews` với một trường `numReviews`), và dashboard vốn đã fetch danh sách movie đầy đủ cho bảng. Việc cộng dồn `numReviews` tái sử dụng dữ liệu mà chúng ta đã có — không cần round-trip thứ hai, không cần endpoint thừa. Do đó prop `loading` của card nên gắn với `moviesQuery.isLoading`, chính query tạo ra con số đó: trong khi danh sách movie đang loading thì chúng ta chưa biết tổng số comment, nên skeleton nên hiển thị cho đến khi query đó hoàn tất.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Thêm một widget "Recent Reviews"

Xây dựng một widget thứ tư liệt kê 5 review gần đây nhất trên tất cả movie, tái sử dụng dữ liệu mà bạn đã fetch sẵn.

**Tasks**

1. Tạo `frontend/src/components/admin/RecentReviewsWidget.tsx` nhận movies query làm prop (cùng pattern như `MovieTable`).
2. Làm phẳng (flatten) `reviews` của mọi movie thành một mảng, gắn tên movie vào mỗi cái, sau đó sắp xếp theo `createdAt` giảm dần và lấy 5 cái đầu tiên.
3. Render mỗi review với tên người review, tiêu đề movie, rating, và một ngày tương đối. Bọc nó trong `QueryBoundary`.

**Starter**

```tsx
// frontend/src/components/admin/RecentReviewsWidget.tsx
import QueryBoundary from "./QueryBoundary";
import type { Movie, MovieReview } from "../../types";

type ReviewWithMovie = MovieReview & { movieName: string };

interface Props {
  query: {
    data?: Movie[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };
}

export default function RecentReviewsWidget({ query }: Props) {
  // TODO 1: flatten reviews and attach movieName
  const recent: ReviewWithMovie[] = (query.data ?? []).flatMap((movie) =>
    movie.reviews.map((r) => ({ ...r, movieName: movie.name })),
  );

  // TODO 2: sort by createdAt desc, take 5
  const top5 = [...recent]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="mb-4 text-base font-semibold">Recent Reviews</h2>
      {/* TODO 3: render `top5` inside a QueryBoundary.
          Tip: the boundary keys off `query`, but you render `top5`. */}
      <QueryBoundary query={query} emptyMessage="No reviews yet.">
        {() => (
          <ul className="space-y-3">
            {top5.map((review) => (
              <li key={review._id} className="text-sm">
                <span className="font-medium">{review.name}</span>
                <span className="text-slate-400"> rated </span>
                <span className="font-medium">{review.movieName}</span>
                <span className="ml-1 text-amber-400">{"★".repeat(review.rating)}</span>
                <p className="text-slate-400">{review.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </div>
  );
}
```

**Verify:** thêm `<RecentReviewsWidget query={moviesQuery} />` vào `DashboardPage` và xác nhận rằng nó hiển thị các review mới nhất và cập nhật bất cứ khi nào có một lần refetch danh sách movie.

### 🛠️ Exercise 2: Làm cho bảng Movie có thể lọc theo genre

Thêm một `<select>` phía trên bảng để lọc các dòng theo genre, được điều khiển hoàn toàn ở phía client từ dữ liệu mà bạn đã có sẵn.

**Tasks**

1. Trong `MovieTable`, thêm state cục bộ `const [genreFilter, setGenreFilter] = useState<string>("all")`.
2. Suy ra danh sách các tên genre duy nhất từ các movie (dùng `genreName(movie.genre)`), và render chúng dưới dạng các `<option>` cộng với một mặc định "All genres".
3. Lọc các dòng bên trong render-prop của `QueryBoundary` để chỉ các movie khớp được render — không cần fetch lại.

**Starter**

```tsx
// inside MovieTable, above the <table>:
const [genreFilter, setGenreFilter] = useState<string>("all");

// inside the QueryBoundary children, before mapping:
// const uniqueGenres = Array.from(new Set(movies.map((m) => genreName(m.genre)))).sort();
// const visible = genreFilter === "all"
//   ? movies
//   : movies.filter((m) => genreName(m.genre) === genreFilter);
//
// Render <select value={genreFilter} onChange={...}> with uniqueGenres,
// then map over `visible` instead of `movies`.
```

**Verify:** chọn một genre và xác nhận rằng bảng thu hẹp ngay lập tức (không có request mạng trong tab Network), và rằng việc chọn "All genres" khôi phục lại danh sách đầy đủ. Bonus: hiển thị số lượng đã lọc trong tiêu đề, ví dụ `Movies (4 of 12)`.
