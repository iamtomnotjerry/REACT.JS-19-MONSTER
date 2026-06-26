# Tích hợp TanStack Router + Query 🧭

Hầu hết các lập trình viên React đều dùng `react-router-dom` và xem như xong việc. Nhưng khi bạn kết hợp **TanStack Router** với **TanStack Query**, bạn mở khóa được điều mà không thư viện nào riêng lẻ mang lại: một router *type-safe từ URL đến component*, *preload dữ liệu trước khi trang render*, và *trao quyền sở hữu cache cho Query* để có đúng một nguồn chân lý duy nhất cho server state của bạn.

Trong bài học này, bạn sẽ xây dựng một lớp routing hoàn toàn type-safe — định nghĩa các route, điều hướng với `<Link>` và `useNavigate`, đọc path param và search param đã được typed, và (tính năng nổi bật) kết nối **route loader** với **TanStack Query** sao cho dữ liệu được fetch *trong lúc điều hướng* và tiêu thụ bằng `useSuspenseQuery` — không bao giờ undefined, không bao giờ có loading flag trong thân component của bạn.

---

## ⚡ 1. Khái niệm & Tổng quan

> [!NOTE]
> **TanStack Router nằm trong lộ trình của khóa học này, nhưng nó không được trình diễn trong các bài giảng đã ghi hình** (transcript chỉ nhắc đến "TanStack Query / TanStack Router" như những chủ đề tương lai bên cạnh `react-router-dom`). Bài học này là **hoàn toàn mới** và dạy các **best practice hiện hành** tính đến TanStack Router v1. Mọi thứ bên dưới đều hoàn chỉnh và có thể copy-paste — không có đoạn code nào bị lược bỏ.

TanStack Router là một router **hoàn toàn type-safe** cho React. Khác với `react-router-dom`, nơi `to="/users/:id"` và `useParams<{ id: string }>()` chỉ là những chuỗi mà bạn *hy vọng* sẽ khớp nhau, TanStack Router suy ra kiểu của mọi path, mọi search param, và giá trị trả về của mọi loader từ một **route tree** duy nhất. Gõ sai một path trong `<Link>` và TypeScript sẽ làm hỏng quá trình build.

Nó cũng có một **lớp dữ liệu được tích hợp ngay trong router**: mỗi route có thể khai báo một `loader` chạy *trước khi* component của route được mount. Đây chính là chỗ tiếp giáp nơi TanStack Query cắm vào — loader làm ấm Query cache, và component đọc từ cache ấm đó một cách đồng bộ thông qua Suspense.

### 🧩 Ẩn dụ thực tế: đội tiền lên máy bay ở sân bay

Hãy hình dung việc điều hướng đến một route giống như **lên một chuyến bay**.

- **`<Link>`** là vé của bạn — nó phải ghi tên một cổng (route) *có thật*. Đưa ra một tấm vé cho một cổng không tồn tại và nhân viên cổng (TypeScript) sẽ từ chối bạn ngay tại quầy.
- **`loader`** là **đội mặt đất** xếp hành lý, nhiên liệu và đồ ăn *trong khi bạn vẫn đang đi trên cầu ống lồng*. Đến lúc bạn bước vào khoang (component render), mọi thứ đã ở trên máy bay rồi.
- **TanStack Query** là **nhà kho trung tâm** phía sau sân bay. Đội mặt đất không tự sản xuất nhiên liệu mỗi lần — họ yêu cầu từ nhà kho, nơi giữ hàng tồn (cache) và chỉ đặt lại hàng (refetch) khi nguồn cung cũ đi.
- **`useSuspenseQuery`** trong component của bạn chính là bạn ngồi trên ghế hỏi tiếp viên về suất ăn đã *được xếp lên từ trước* — nó có ngay lập tức, không cần "vui lòng đợi".

Điều kỳ diệu là loader và component cùng hỏi **một nhà kho** về **cùng một món đồ** (một query key dùng chung), nên công việc không bao giờ bị lặp lại.

### Các thành phần liên kết với nhau ra sao

```
            ┌─────────────────────────────────────────────┐
            │              Route Tree (typed)              │
            │   rootRoute → indexRoute, userRoute, ...     │
            └───────────────────┬─────────────────────────┘
                                │ createRouter({ routeTree })
                                ▼
        ┌───────────────────────────────────────────────────┐
        │   <RouterProvider router={router} />               │
        │   (declaration-merged → app-wide type safety)      │
        └───────┬───────────────────────────────────┬───────┘
                │ navigation                          │ data
                ▼                                     ▼
   <Link to> / useNavigate / useParams      loader: ensureQueryData
   useSearch (validateSearch)                         │ warms
                                                       ▼
                                          ┌──────────────────────┐
                                          │  TanStack Query Cache │ ◀── single source
                                          └──────────┬───────────┘     of truth
                                                     │ reads (warm)
                                                     ▼
                                          Component: useSuspenseQuery
```

### TanStack Router so với react-router-dom

| Khả năng                  | react-router-dom (v6/v7) | TanStack Router v1                          |
| ------------------------- | ------------------------ | ------------------------------------------- |
| Type safety cho path      | ❌ chỉ là chuỗi          | ✅ suy ra từ route tree                     |
| Type safety cho search param | ❌ `URLSearchParams` thô | ✅ `validateSearch` → object đã typed       |
| Loader tích hợp sẵn       | ✅ (data router)         | ✅ với khả năng suy luận đầy đủ kiểu trả về |
| Cầu nối Query hạng nhất   | thủ công                 | ✅ `ensureQueryData` + `useSuspenseQuery`   |
| Routing dựa trên file     | plugin tùy chọn          | ✅ plugin Vite chính thức (codegen)         |
| UI `pending` / `error`    | theo từng route          | ✅ `pendingComponent` / `errorComponent`    |

---

## 🛠️ 2. Cài đặt

```bash
# Router + Query + the Query/Router devtools
npm i @tanstack/react-router @tanstack/react-query
npm i -D @tanstack/router-devtools @tanstack/react-query-devtools

# Optional but recommended: the file-based routing Vite plugin (codegen)
npm i -D @tanstack/router-plugin
```

> [!TIP]
> Có **hai cách** để định nghĩa route: **dựa trên code** (bạn tự viết `createRoute(...)` bằng tay) và **dựa trên file** (plugin Vite sinh ra route tree từ thư mục `src/routes/` của bạn). Bài học này dạy **dựa trên code trước** vì nó làm rõ cơ chế type-safety, rồi sau đó chỉ cách bật plugin lên. Dựa trên file là mặc định được khuyến nghị cho các app thực tế vì codegen giúp giữ tree đồng bộ cho bạn.

Nếu bạn dùng plugin dựa trên file, hãy đăng ký nó trong `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    // IMPORTANT: the router plugin must come BEFORE the react plugin.
    TanStackRouterVite(),
    react(),
  ],
});
```

---

## 🧩 3. Định nghĩa Route (dựa trên code)

Một route tree được xây dựng từ dưới lên, bắt đầu từ một **root route** cộng với các **child route**. Mỗi child khai báo `getParentRoute`, `path` URL của nó, và `component` của nó.

```tsx
// src/routes.tsx
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// 1) The ROOT route renders the app shell. <Outlet/> is where the
//    matched child route's component is injected (like a layout).
const rootRoute = createRootRoute({
  component: () => (
    <div className="app-shell">
      <nav style={{ display: "flex", gap: 12, padding: 12 }}>
        {/* Links go here in §4 */}
      </nav>
      <main style={{ padding: 12 }}>
        <Outlet />
      </main>
      {/* Devtools only render in development builds */}
      <TanStackRouterDevtools />
    </div>
  ),
});

// 2) The index route ("/").
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/", // exact "/"
  component: function HomePage() {
    return <h1>🏠 Home</h1>;
  },
});

// 3) A users list route ("/users").
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: function UsersPage() {
    return <h1>👥 Users</h1>;
  },
});

// 4) A dynamic detail route ("/users/$userId").
//    The "$" prefix marks a path PARAM — its type flows through to useParams.
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  component: function UserPage() {
    return <h1>👤 User detail</h1>;
  },
});

// 5) Assemble the route TREE. The shape of this tree is what gives
//    every <Link>, useParams, and useSearch their static types.
const routeTree = rootRoute.addChildren([
  indexRoute,
  usersRoute,
  userRoute,
]);

// 6) Create the router instance.
export const router = createRouter({
  routeTree,
  // Sensible defaults for a Query-backed app:
  defaultPreload: "intent", // preload a route's loader on link hover/focus
  defaultPreloadStaleTime: 0, // let TanStack Query own staleness, not the router
});

// 7) Register the router type GLOBALLY via declaration merging.
//    This is what makes `to="/users/$userId"` autocomplete and type-check
//    everywhere in your app without importing the router type by hand.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

> [!WARNING]
> Khối `declare module "@tanstack/react-router"` **không phải là boilerplate tùy chọn** — nó là dòng duy nhất bật type safety cho toàn bộ app. Không có nó, `<Link to="...">` sẽ chấp nhận bất kỳ chuỗi nào và bạn mất mọi đảm bảo tại thời điểm biên dịch. Hãy thêm nó đúng một lần, trong file tạo ra router.

Giờ hãy mount router. Lưu ý rằng provider của Query và Router **đều** có mặt — Query sở hữu cache, Router sở hữu URL.

```tsx
// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";

// One QueryClient for the whole app — the "warehouse" from the metaphor.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // data is "fresh" for 60s; no refetch within that window
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

> [!TIP]
> Nếu loader của bạn cần truy cập `QueryClient` (chúng có cần — xem §6), hãy truyền nó vào **context** của router: `createRouter({ routeTree, context: { queryClient } })`. Chúng ta làm đúng điều đó ở §6 để loader có thể gọi `queryClient.ensureQueryData(...)`.

---

## 🧭 4. Điều hướng: `<Link>`, `useNavigate`, `useParams`

### ⚡ `<Link>` type-safe

```tsx
import { Link } from "@tanstack/react-router";

function MainNav() {
  return (
    <nav style={{ display: "flex", gap: 12 }}>
      {/* `to` is checked against the route tree. A typo here is a build error. */}
      <Link to="/">Home</Link>
      <Link to="/users">Users</Link>

      {/* For a route with params, `params` is REQUIRED and typed. */}
      <Link to="/users/$userId" params={{ userId: "42" }}>
        User 42
      </Link>

      {/* activeProps style the link when its route is the active match. */}
      <Link
        to="/users"
        activeProps={{ style: { fontWeight: "bold", textDecoration: "underline" } }}
      >
        Users (active-aware)
      </Link>
    </nav>
  );
}

export default MainNav;
```

### ⚡ Điều hướng tường minh với `useNavigate`

```tsx
import { useNavigate } from "@tanstack/react-router";

function CreateUserButton() {
  const navigate = useNavigate();

  function handleCreated(newId: string) {
    // Same type safety as <Link>: `to` and `params` are validated.
    navigate({ to: "/users/$userId", params: { userId: newId } });
  }

  return (
    <button type="button" onClick={() => handleCreated("99")}>
      Pretend we created user 99, then navigate
    </button>
  );
}

export default CreateUserButton;
```

### ⚡ Đọc path param với `useParams`

Cách sạch sẽ và type-safe nhất để đọc param là hook **gắn với route** `Route.useParams()`, vốn biết *những* param nào tồn tại trên *route đó*:

```tsx
// Inside the file where `userRoute` is defined:
function UserPage() {
  // `userId` is typed as string because the path is "/users/$userId".
  const { userId } = userRoute.useParams();
  return <h2>Viewing user {userId}</h2>;
}
```

---

## 🔎 5. Search Param type-safe (`validateSearch` + `Route.useSearch`)

Những chuỗi query như `?page=2&sort=desc` nổi tiếng là không có kiểu. TanStack Router khắc phục điều này: bạn khai báo một hàm `validateSearch` trên route, và *kiểu trả về* của hàm đó trở thành kiểu của `useSearch()`.

Chúng ta sẽ dùng **Zod** để xác thực ở runtime (validator nào cũng được, nhưng Zod cho khả năng suy luận kiểu sạch sẽ).

```tsx
// src/routes/users.search.tsx
import { createRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./root"; // wherever your rootRoute lives

// 1) Describe the search-param SHAPE with defaults so the URL is always valid.
const usersSearchSchema = z.object({
  page: z.number().int().min(1).catch(1), // ?page=2 → 2; missing/invalid → 1
  sort: z.enum(["asc", "desc"]).catch("asc"),
});

// Infer the TypeScript type from the schema (single source of truth).
type UsersSearch = z.infer<typeof usersSearchSchema>;

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  // 2) validateSearch parses/coerces the raw URL search into a typed object.
  //    Its return type drives Route.useSearch() and the `search` prop on <Link>.
  validateSearch: (raw): UsersSearch => usersSearchSchema.parse(raw),
  component: UsersListPage,
});

function UsersListPage() {
  // 3) Fully typed: `page` is number, `sort` is "asc" | "desc".
  const { page, sort } = usersRoute.useSearch();
  const navigate = useNavigate();

  // 4) Update search params immutably. The updater receives the current
  //    typed search and returns the next one — TypeScript checks both.
  function goToPage(next: number) {
    navigate({
      to: "/users",
      search: (prev) => ({ ...prev, page: next }),
    });
  }

  function toggleSort() {
    navigate({
      to: "/users",
      search: (prev) => ({ ...prev, sort: prev.sort === "asc" ? "desc" : "asc" }),
    });
  }

  return (
    <section>
      <p>
        Page <b>{page}</b>, sorted <b>{sort}</b>
      </p>
      <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
        ← Prev
      </button>
      <button type="button" onClick={() => goToPage(page + 1)}>
        Next →
      </button>
      <button type="button" onClick={toggleSort}>
        Toggle sort
      </button>
    </section>
  );
}
```

> [!NOTE]
> Việc dùng `.catch(default)` (Zod) bên trong `validateSearch` có nghĩa là một URL bị hỏng như `?page=banana` sẽ âm thầm quay về một giá trị hợp lệ thay vì ném lỗi. Điều này giữ cho các deep-link và URL được chia sẻ luôn vững vàng. Nếu bạn muốn từ chối các URL xấu, hãy bỏ `.catch()` và ghép route với một `errorComponent` (xem §7).

---

## 🚀 6. Loader + TanStack Query (phần tích hợp)

Đây là trái tim của bài học. Mô hình là:

1. Định nghĩa một **factory tái sử dụng cho query options** (`queryOptions`) để loader và component cùng tham chiếu đến *cùng một* query.
2. Trong **`loader`** của route, gọi `queryClient.ensureQueryData(...)` — nó chỉ fetch *nếu cache rỗng/cũ*, ngược lại trả về ngay lập tức.
3. Trong **component**, gọi `useSuspenseQuery(...)` với cùng các options — nó đọc từ cache ấm một cách đồng bộ.

### 🛠️ Bước 1 — nối `queryClient` vào context của router

```tsx
// src/router.tsx
import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree"; // assembled tree

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0, // Query owns staleness
  // Loaders read this via { context } — see step 3.
  context: { queryClient },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

### 🛠️ Bước 2 — factory `queryOptions` dùng chung

```typescript
// src/api/users.ts
import { queryOptions } from "@tanstack/react-query";

export interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchUser(userId: string): Promise<User> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to load user ${userId} (status ${res.status})`);
  }
  return (await res.json()) as User;
}

// ONE definition used by BOTH the loader and the component.
// Identical queryKey ⇒ they share the same cache entry ⇒ no double fetch.
export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["user", userId] as const,
    queryFn: () => fetchUser(userId),
  });
}
```

### 🛠️ Bước 3 — loader làm ấm cache, component đọc nó

```tsx
// src/routes/user.detail.tsx
import { createRoute, ErrorComponent } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { userQueryOptions } from "../api/users";

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",

  // The loader runs DURING navigation, before the component mounts.
  // `context.queryClient` was injected in router.tsx (step 1).
  // `params.userId` is typed from the "$userId" path segment.
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),

  // Shown while the loader's promise is pending (first visit / cold cache).
  pendingComponent: () => <p>⏳ Loading user…</p>,

  // Shown if the loader or query throws (e.g. 404, network error).
  errorComponent: ({ error }) => <ErrorComponent error={error} />,

  component: UserDetail,
});

function UserDetail() {
  const { userId } = userRoute.useParams();

  // useSuspenseQuery NEVER returns `undefined` data — by the time this
  // component renders, the loader already populated the cache.
  // `data` is typed as `User` (no `| undefined`, no loading flag).
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));

  return (
    <article>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <small>ID: {user.id}</small>
    </article>
  );
}
```

### Vì sao điều này tốt hơn fetch trong `useEffect`

```
useEffect approach:                  loader + ensureQueryData approach:
─────────────────────                ─────────────────────────────────
navigate → mount → render            navigate → loader fetches (cache) →
  → useEffect fires → fetch            render with data ALREADY present
  → setState → re-render             ── no loading flicker in component
  (loading flicker + waterfall)      ── no "data | undefined" in types
```

> [!TIP]
> Vì `defaultPreload: "intent"` đang bật, việc rê chuột qua một `<Link to="/users/$userId">` sẽ *kích hoạt loader sớm*. Lần fetch đã đang diễn ra (hoặc đã xong) trước khi người dùng kịp click — các trang cảm giác tức thì. Đặt `defaultPreloadStaleTime: 0` để router nhường các quyết định về staleness cho TanStack Query thay vì tự cache kết quả của loader.

> [!WARNING]
> Loader và component **phải dùng cùng `queryKey`**. Đó chính là lý do tồn tại của factory `userQueryOptions`. Nếu loader fetch `["user", userId]` nhưng `useSuspenseQuery` của component lại dùng `["users", userId]` (chú ý chữ `s`), Suspense sẽ kích hoạt một lần fetch *thứ hai* và bạn mất toàn bộ lợi ích. Luôn dùng chung một định nghĩa `queryOptions`.

---

## 🧩 7. `pendingComponent` và `errorComponent` chuyên sâu

Mỗi route có thể khai báo UI riêng cho hai trạng thái không-suôn-sẻ. Router hiển thị chúng tự động — bạn không bao giờ phải viết các nhánh `if (isLoading)` / `if (error)` bên trong component.

```tsx
// A richer example combining both, plus a route-level retry button.
import { createRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { userQueryOptions } from "../api/users";

export const userRouteRich = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),

  // pendingComponent appears after `pendingMs` of waiting (default 1s),
  // for at least `pendingMinMs`, to avoid flashing on fast loads.
  pendingMs: 300,
  pendingMinMs: 500,
  pendingComponent: () => (
    <div role="status" aria-busy="true">
      <span>⏳ Fetching user profile…</span>
    </div>
  ),

  // errorComponent receives the thrown error. `reset` re-runs the loader.
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div role="alert">
        <p>❌ Could not load this user.</p>
        <pre>{error instanceof Error ? error.message : String(error)}</pre>
        <button
          type="button"
          onClick={() => {
            // Invalidate the current match and re-run its loader.
            reset();
            router.invalidate();
          }}
        >
          Retry
        </button>
      </div>
    );
  },

  component: function RichUserDetail() {
    const { userId } = userRouteRich.useParams();
    const { data: user } = useSuspenseQuery(userQueryOptions(userId));
    return (
      <article>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </article>
    );
  },
});
```

> [!NOTE]
> `pendingComponent` bao phủ trạng thái loading của *quá trình điều hướng* (promise của loader). Suspense boundary của riêng `useSuspenseQuery` bao phủ trạng thái loading khi *re-fetch* sau khi component đã được mount. Trên thực tế loader đổ đầy cache trước, nên suspense bên trong component hiếm khi hiển thị ở lần truy cập đầu — nó chủ yếu quan trọng cho việc vô hiệu hóa cache (invalidation) và refetch.

---

## 🗂️ 8. Phương án dựa trên file (sơ lược)

Với plugin Vite ở §2, bạn bỏ qua việc viết các lệnh gọi `createRoute` bằng tay. Thay vào đó, bạn tạo các file trong `src/routes/` và export một `Route` từ mỗi file:

```tsx
// src/routes/users.$userId.tsx  (the filename encodes the path "/users/$userId")
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { userQueryOptions } from "../api/users";

// createFileRoute's argument is auto-filled and verified by the plugin's codegen.
export const Route = createFileRoute("/users/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userQueryOptions(params.userId)),
  component: UserPage,
});

function UserPage() {
  const { userId } = Route.useParams();
  const { data: user } = useSuspenseQuery(userQueryOptions(userId));
  return <h2>{user.name}</h2>;
}
```

Plugin sinh ra `src/routeTree.gen.ts` (tree đã được lắp ráp) mỗi khi lưu. Sau đó bạn `import { routeTree } from "./routeTree.gen"` và đưa nó vào `createRouter` đúng như ở §6 — mọi thứ còn lại (loader, validation search, type safety) hoạt động y hệt. **Dựa trên file là mặc định được khuyến nghị cho các app production** vì tree không bao giờ lệch khỏi đồng bộ với các file của bạn.

---

## 🧠 Kiểm Tra Kiến Thức

**1.** Vì sao route loader và component phải dùng *cùng một* factory `queryOptions` (với một `queryKey` giống hệt nhau)?

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  Bởi vì sự tích hợp này dựa trên việc loader và component đọc **cùng một cache entry**. `ensureQueryData` trong loader fetch và lưu dữ liệu dưới một `queryKey`; `useSuspenseQuery` trong component sau đó đọc từ đúng key đó. Nếu các key khác nhau (kể cả `["user", id]` so với `["users", id]`), Suspense query của component sẽ thấy cache rỗng đối với key *của nó* và kích hoạt một lần fetch hoàn toàn mới — làm mất lợi ích của việc preload và gây ra một request lặp lại. Dùng chung một factory `userQueryOptions(userId)` đảm bảo cả hai phía nhất trí về `queryKey` và `queryFn`.
</details>

**2.** Khối `declare module "@tanstack/react-router" { interface Register { router: typeof router } }` thực sự làm gì?

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  Nó dùng **declaration merging của TypeScript** để đăng ký *chính instance router cụ thể của bạn* (và do đó là route tree của bạn) làm kiểu router toàn cục cho cả app. Một khi đã đăng ký, các hook và component như `<Link>`, `useNavigate`, `useParams`, và `useSearch` sẽ suy ra các path `to` hợp lệ, `params`, và hình dạng `search` từ tree của bạn — với autocomplete đầy đủ và lỗi tại thời điểm biên dịch khi gõ sai. Không có khối này, `<Link to>` quay về việc chấp nhận bất kỳ `string` nào, và bạn mất toàn bộ type safety của TanStack Router.
</details>

**3.** Sự khác biệt giữa `pendingComponent` và trạng thái loading của `useSuspenseQuery` là gì?

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  `pendingComponent` là UI của router cho **giai đoạn điều hướng/loader** — nó hiển thị trong khi promise của `loader` của route đang chờ, *trước khi component của route được mount*. Trạng thái loading của `useSuspenseQuery` được xử lý bởi một **React Suspense boundary** và kích hoạt khi component render trên một cache lạnh/đang refetch. Trong mô hình loader, loader đổ đầy cache trước, nên ở lần truy cập đầu suspense bên trong component thường không kích hoạt; nó chủ yếu quan trọng sau khi cache bị vô hiệu hóa hoặc khi refetch. `pendingComponent` cũng hỗ trợ `pendingMs`/`pendingMinMs` để tránh nhấp nháy trên các lần load nhanh.
</details>

**4.** Làm thế nào để bạn khiến search param trở nên type-safe, và điều gì quyết định kiểu được trả về bởi `Route.useSearch()`?

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  Bạn thêm một hàm `validateSearch` vào route. Nó nhận object search thô được parse từ URL và trả về một object đã typed (thường là qua `zodSchema.parse(raw)`). **Kiểu trả về của `validateSearch`** chính là kiểu của `Route.useSearch()`, và nó cũng quyết định kiểu của prop `search` trên `<Link>`/`useNavigate` cho route đó. Dùng `.catch(default)` của Zod khiến các URL bị hỏng quay về các giá trị hợp lệ thay vì ném lỗi, giữ cho các deep link vững vàng.
</details>

**5.** Vì sao mô hình loader + `ensureQueryData` được ưa chuộng hơn việc fetch bên trong `useEffect`?

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  Fetch trong `useEffect` tạo ra một **waterfall**: component phải mount và render một lần (hiển thị nhấp nháy loading) trước khi effect kích hoạt request, và kiểu dữ liệu của component là `T | undefined` buộc phải có các kiểm tra loading/null ở khắp nơi. Loader chạy **trong lúc điều hướng, trước khi mount**, nên đến lúc component render thì dữ liệu đã có sẵn trong cache; `useSuspenseQuery` sau đó trả về `data` đã được typed đầy đủ, không undefined, không có nhánh loading. Kết hợp với `defaultPreload: "intent"`, lần fetch thậm chí có thể bắt đầu khi rê chuột qua link, khiến việc điều hướng cảm giác tức thì. `ensureQueryData` cũng là một no-op khi cache đã tươi mới, nên nó không refetch một cách không cần thiết.
</details>

---

## 💻 Bài Tập Thực Hành

### 🛠️ Bài tập 1 — Thêm một route posts type-safe, có loader hậu thuẫn

Xây dựng một route `/posts/$postId` preload một post thông qua TanStack Query.

**Nhiệm vụ**

1. Tạo một factory `postQueryOptions(postId)` gọi đến `https://jsonplaceholder.typicode.com/posts/{postId}`.
2. Định nghĩa một `postRoute` mà `loader` của nó gọi `ensureQueryData`.
3. Render `title` và `body` với `useSuspenseQuery`.
4. Thêm một `pendingComponent` và một `errorComponent`.

**Code khởi đầu**

```tsx
// src/api/posts.ts
import { queryOptions } from "@tanstack/react-query";

export interface Post {
  id: number;
  title: string;
  body: string;
}

async function fetchPost(postId: string): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  if (!res.ok) throw new Error(`Post ${postId} not found (${res.status})`);
  return (await res.json()) as Post;
}

export function postQueryOptions(postId: string) {
  return queryOptions({
    queryKey: ["post", postId] as const,
    queryFn: () => fetchPost(postId),
  });
}

// src/routes/post.detail.tsx
import { createRoute, ErrorComponent } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { rootRoute } from "./root";
import { postQueryOptions } from "../api/posts";

export const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts/$postId",
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(postQueryOptions(params.postId)),
  pendingComponent: () => <p>⏳ Loading post…</p>,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  component: function PostDetail() {
    const { postId } = postRoute.useParams();
    const { data: post } = useSuspenseQuery(postQueryOptions(postId));
    return (
      <article>
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </article>
    );
  },
});
```

Hãy nhớ thêm `postRoute` vào `rootRoute.addChildren([...])` của bạn và liên kết đến nó bằng `<Link to="/posts/$postId" params={{ postId: "1" }}>`.

### 🛠️ Bài tập 2 — Danh sách có thể lọc, phân trang, chia sẻ được qua search param

Mở rộng một route danh sách `/posts` sao cho trạng thái lọc của nó nằm hoàn toàn trong URL (để có thể chia sẻ và thân thiện với nút back).

**Nhiệm vụ**

1. Thêm một `validateSearch` với `page: number (mặc định 1)` và `q: string (mặc định "")`.
2. Đọc chúng bằng `postsRoute.useSearch()`.
3. Dùng `useNavigate` với một updater bất biến `search: (prev) => ...` cho một bộ phân trang Prev/Next và một ô tìm kiếm.
4. Fetch danh sách đã lọc bằng `useSuspenseQuery` được khóa theo `["posts", { page, q }]` và preload nó trong loader.

**Code khởi đầu**

```tsx
// src/routes/posts.list.tsx
import { createRoute, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { rootRoute } from "./root";

const postsSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  q: z.string().catch(""),
});
type PostsSearch = z.infer<typeof postsSearchSchema>;

interface PostSummary {
  id: number;
  title: string;
}

async function fetchPosts(search: PostsSearch): Promise<PostSummary[]> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_page=${search.page}&_limit=10`,
  );
  if (!res.ok) throw new Error(`Failed to load posts (${res.status})`);
  const all = (await res.json()) as PostSummary[];
  // Client-side filter by the `q` search term for demo purposes.
  return search.q
    ? all.filter((p) => p.title.toLowerCase().includes(search.q.toLowerCase()))
    : all;
}

function postsQueryOptions(search: PostsSearch) {
  return queryOptions({
    queryKey: ["posts", search] as const,
    queryFn: () => fetchPosts(search),
  });
}

export const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts",
  validateSearch: (raw): PostsSearch => postsSearchSchema.parse(raw),
  // loaderDeps tells the loader to re-run when search changes.
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(postsQueryOptions(deps)),
  component: function PostsList() {
    const search = postsRoute.useSearch();
    const navigate = useNavigate();
    const { data: posts } = useSuspenseQuery(postsQueryOptions(search));

    return (
      <section>
        <input
          value={search.q}
          placeholder="Filter by title…"
          onChange={(e) =>
            navigate({
              to: "/posts",
              search: (prev) => ({ ...prev, q: e.target.value, page: 1 }),
            })
          }
        />
        <ul>
          {posts.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
        <button
          type="button"
          disabled={search.page <= 1}
          onClick={() =>
            navigate({ to: "/posts", search: (prev) => ({ ...prev, page: prev.page - 1 }) })
          }
        >
          ← Prev
        </button>
        <button
          type="button"
          onClick={() =>
            navigate({ to: "/posts", search: (prev) => ({ ...prev, page: prev.page + 1 }) })
          }
        >
          Next →
        </button>
      </section>
    );
  },
});
```

**Mục tiêu nâng cao:** thêm một `pendingComponent` và xác minh trong tab Network rằng việc rê chuột qua một `<Link to="/posts">` (với `defaultPreload: "intent"`) bắt đầu request *trước khi* bạn click.

---

## 🎯 Tóm Tắt

- TanStack Router suy ra các **kiểu của path, param, và search param** từ một route tree duy nhất — được đăng ký toàn cục qua `declare module ... interface Register`.
- Điều hướng với `<Link to>`, `useNavigate` type-safe, và đọc state với `Route.useParams()` / `Route.useSearch()` gắn với route.
- **`validateSearch`** biến các chuỗi query thành các object đã typed và đã validate; kiểu trả về của nó *chính là* kiểu search.
- Cầu nối Router↔Query: một **factory `queryOptions`** dùng chung + `ensureQueryData` trong **loader** + `useSuspenseQuery` trong **component** ⇒ dữ liệu được preload trong lúc điều hướng, cache là nguồn chân lý duy nhất, và các component không bao giờ phải xử lý `undefined` hay loading flag.
- **`pendingComponent`** và **`errorComponent`** khai báo UI loading/error theo từng route để các component của bạn tập trung vào luồng suôn sẻ (happy path).
- Với production, hãy ưu tiên **routing dựa trên file** với plugin Vite — cùng khái niệm, không phải lắp ráp tree thủ công.
