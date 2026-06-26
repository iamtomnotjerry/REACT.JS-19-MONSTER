# FullStack: Tích hợp API, CRUD & Cache Invalidation 🔌

Bài học trước đã xây dựng riêng rẽ hai nửa của Movie Dashboard: một backend **Express + MongoDB** sở hữu dữ liệu, và một frontend **React + Redux Toolkit** render giao diện. Bài học này là cây cầu nối giữa chúng — **lớp dữ liệu (data layer)** biến "hai ứng dụng chạy trên hai terminal" thành một sản phẩm thống nhất. Mọi thứ ở đây nằm ngay trên đường ráp nối: cách trình duyệt tiếp cận server, cách các thao tác đọc và ghi đi qua **RTK Query**, và cách giao diện luôn đồng bộ sau mỗi lần create, update, delete mà bạn không bao giờ phải gọi `refetch()` bằng tay.

Đến cuối bài, bạn sẽ có một `apiSlice` được định kiểu (typed) đầy đủ, các endpoint được inject cho **movies / genres / reviews** (cả query *lẫn* mutation), **cache invalidation dựa trên tag** để các danh sách tự động làm mới sau mỗi lần ghi, một ví dụ **optimistic update** dựng bằng `onQueryStarted` + `updateQueryData`, **search / filter / sort** phía server, **tạo review**, và **upload ảnh** qua một endpoint `multer` dùng `multipart/form-data`. Vite proxy gắn kết tất cả lại để trình duyệt thấy một origin duy nhất và cookie xác thực `httpOnly` cứ thế hoạt động.

> [!NOTE]
> Transcript của khóa học cài đặt `multer` và `concurrently`, dựng khung backend, và đấu nối RTK Query `apiSlice` với `injectEndpoints`, `tagTypes`, các query và mutation. Phần **optimistic update** (`onQueryStarted` + `updateQueryData`), các chữ ký TypeScript **được định kiểu (typed)**, và route **multer upload** chi tiết được trình bày ở đây như phần mở rộng HOÀN TOÀN MỚI, theo best practice hiện hành, dựa trên những gì giảng viên minh họa bằng JavaScript — các pattern giống hệt nhau, chỉ là được định kiểu đầy đủ và được tôi luyện cho production.

---

## 🧭 Khái niệm & Tổng quan

RTK Query là một **lớp data-fetching có caching**. Bạn mô tả các endpoint của server một lần, và nó sinh ra các React hook (`useGetMoviesQuery`, `useCreateReviewMutation`, …) tự fetch, cache, dedupe (loại trùng), và re-fetch giúp bạn. Bạn không bao giờ phải viết lại bộ ba `useEffect` + `useState` + `fetch` nữa, và bạn không bao giờ phải tự theo dõi "danh sách này đã cũ chưa?" — cache làm điều đó thông qua các **tag**.

Hãy hình dung một **gian bếp nhà hàng bận rộn với một bảng order**. Một **query** là người phục vụ đọc bảng để cho bàn ăn biết món nào có sẵn — và gian bếp giữ một bản sao ghim sẵn (cache) để người phục vụ tiếp theo hỏi cùng câu đó không phải hỏi lại đầu bếp. Một **mutation** là một order mới đến: nó thay đổi những gì gian bếp đang làm. Ngay khoảnh khắc order đó đến, bếp trưởng **xé bỏ mọi mục trên bảng được gắn tag với món đó** (`invalidatesTags`) để người phục vụ tiếp theo nhìn vào buộc phải lấy thông tin mới. Tag chính là những mẩu giấy nhớ ghi *"mục trên bảng này phụ thuộc vào Movies"* — thay đổi một movie, và mọi mục trên bảng được gắn tag Movie sẽ tự động bị xé bỏ và đọc lại.

```
                 ┌──────────────────────── BROWSER ────────────────────────┐
                 │                                                          │
   useGetMovies  │   ┌─────────────┐   cache hit?   ┌──────────────────┐    │
   Query() ──────┼──▶│  RTK Query  │───── yes ──────▶│  cached data     │    │
                 │   │   cache     │                 │ (provides:Movie) │    │
   useCreateMovie│   │             │───── no ──┐     └──────────────────┘    │
   Mutation() ───┼──▶│ invalidate  │           │            ▲ refetch        │
                 │   │  "Movie"    │───────────┼────────────┘ (auto)         │
                 └───┴─────────────┴───────────┼──────────────────────────────┘
                                               │  /api/...  (Vite proxy)
                                               ▼
                 ┌───────────────────── EXPRESS SERVER ─────────────────────┐
                 │   routes ──▶ controllers ──▶ Mongoose ──▶ MongoDB         │
                 └──────────────────────────────────────────────────────────┘
```

### Các mảnh ghép liên hệ với nhau ra sao

| Layer | Trách nhiệm | "Nó cũ (stale) khi…" |
| :--- | :--- | :--- |
| Component | Gọi một hook được sinh ra, render `data` / `isLoading` | không bao giờ tự quyết định tính stale |
| Endpoint (`query`) | Khai báo URL + `providesTags` | một tag khớp bị invalidate |
| Endpoint (`mutation`) | Khai báo URL + `invalidatesTags` | không áp dụng — nó *gây ra* tính stale |
| `apiSlice` cache | Lưu trữ response theo khóa là args, chạy refetch | tự động theo dõi mọi tag |
| Vite proxy | Chuyển tiếp `/api/*` tới Express để cookie cùng origin | không áp dụng |

---

## ⚡ 1. Vite Proxy — Một Origin, Kèm Cookie

Token xác thực từ bài trước nằm trong một cookie `httpOnly`, `sameSite: "strict"`. Trình duyệt chỉ gửi cookie đó tới **cùng origin** đã thiết lập nó. Trong môi trường development, ứng dụng React chạy trên `http://localhost:5173` (Vite) còn Express chạy trên `http://localhost:3000` — hai origin khác nhau, nên cookie sẽ không được đính kèm, và mọi request được bảo vệ sẽ trả về 401.

Cách khắc phục là một **dev proxy**: ta bảo Vite chuyển tiếp bất kỳ request nào bắt đầu bằng `/api` (và `/uploads` cho các ảnh được phục vụ) tới Express. Trình duyệt chỉ bao giờ giao tiếp với `localhost:5173`, nên với nó mọi thứ là cùng một origin, và cookie đi theo cùng.

```typescript
// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/* is transparently forwarded to Express.
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true, // rewrite the Host header to the target
      },
      // Uploaded images are served as static files by Express.
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

> [!TIP]
> Vì proxy khiến API trở thành cùng origin, `baseUrl` của ta chỉ là `"/api"` — một đường dẫn tương đối. Trong production bạn thường phục vụ frontend đã build ngay từ chính Express (hoặc đặt cả hai sau một reverse proxy), nên cùng các URL `/api` tương đối đó tiếp tục hoạt động với **không cần thay đổi code nào**. Đừng bao giờ hardcode `http://localhost:3000` vào frontend.

---

## 🧩 2. `apiSlice` — Một Gốc, Nhiều Endpoint Được Inject

`createApi` định nghĩa hình dạng của toàn bộ lớp dữ liệu trong một object: `baseQuery` (cách mỗi request được thực hiện), `tagTypes` (vũ trụ các cache tag), và `endpoints`. Ta cố ý để `endpoints` rỗng ở đây và **inject** các endpoint thật từ các file feature. Điều này giữ cho slice gốc nhỏ gọn và để mỗi feature (movies, genres, reviews) sở hữu endpoint của riêng nó trong khi vẫn dùng chung một cache.

```typescript
// frontend/src/redux/api/apiSlice.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// fetchBaseQuery is a thin fetch() wrapper. credentials:"include" makes the
// browser attach our httpOnly auth cookie on every request.
const baseQuery = fetchBaseQuery({
  baseUrl: "/api", // relative — the Vite proxy (or prod server) handles it
  credentials: "include",
});

export const apiSlice = createApi({
  reducerPath: "api", // key under which the cache lives in the Redux store
  baseQuery,
  // The complete set of cache tags. Every query "provides" some of these,
  // every mutation "invalidates" some of these.
  tagTypes: ["Movie", "Genre", "Review", "User"],
  // Endpoints are injected from feature files (movies.ts, genres.ts, ...).
  endpoints: () => ({}),
});
```

### Các kiểu response dùng chung

Định kiểu mạnh chính là thứ biến RTK Query từ "fetch với vài bước phụ" thành một hợp đồng (contract). Ta khai báo các hình dạng của server một lần và tái sử dụng chúng trên mọi endpoint.

```typescript
// frontend/src/types/movie.ts
export interface Genre {
  _id: string;
  name: string;
}

export interface Review {
  _id: string;
  name: string;    // username of the reviewer (denormalized for display)
  rating: number;  // 1–5
  comment: string;
  user: string;    // ObjectId of the author
  createdAt: string;
}

export interface Movie {
  _id: string;
  name: string;
  image?: string;       // "/uploads/abc123.jpg"
  year: number;
  genre: Genre | string; // populated Genre object, or raw ObjectId
  detail: string;
  cast: string[];
  reviews: Review[];
  numReviews: number;
  createdAt: string;
  updatedAt: string;
}

// The arguments a movie-list request can carry (search / filter / sort).
export interface MovieQueryArgs {
  search?: string;
  genre?: string;                  // genre _id
  sort?: "newest" | "top-rated";   // server-side ordering
}
```

---

## ⚡ 3. Genre Endpoints — Query & Mutation, Vòng lặp Tag

Genre là tài nguyên đơn giản nhất, nên nó minh họa rõ nhất **vòng lặp tag (tag loop)**: một query *provides* (cung cấp) một tag, một mutation *invalidates* (làm mất hiệu lực) nó, và danh sách tự làm mới chính mình.

```typescript
// frontend/src/redux/api/genres.ts
import { apiSlice } from "./apiSlice";
import type { Genre } from "../../types/movie";

export const genreApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // READ: returns Genre[]; second generic is the query arg type (none here)
    getGenres: builder.query<Genre[], void>({
      query: () => "/genre/genres",
      // This cached entry carries the "Genre" tag. Any mutation that
      // invalidates "Genre" will force this query to re-run.
      providesTags: ["Genre"],
    }),

    // WRITE: create a genre, then mark "Genre" data dirty.
    createGenre: builder.mutation<Genre, { name: string }>({
      query: (body) => ({ url: "/genre", method: "POST", body }),
      invalidatesTags: ["Genre"], // → getGenres refetches automatically
    }),

    updateGenre: builder.mutation<Genre, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/genre/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Genre"],
    }),

    deleteGenre: builder.mutation<Genre, string>({
      query: (id) => ({ url: `/genre/${id}`, method: "DELETE" }),
      invalidatesTags: ["Genre"],
    }),
  }),
});

// RTK Query auto-generates a typed hook per endpoint.
export const {
  useGetGenresQuery,
  useCreateGenreMutation,
  useUpdateGenreMutation,
  useDeleteGenreMutation,
} = genreApiSlice;
```

> [!NOTE]
> `invalidatesTags: ["Genre"]` là một invalidation **rộng (broad)**: nó làm bẩn (dirty) *mọi* cached entry được gắn tag `Genre`. Với một danh sách đơn lẻ thì điều đó hoàn hảo. Với nhiều cached entry, bạn có thể chính xác như mổ xẻ với các object tag như `{ type: "Movie", id }` — chỉ invalidate đúng movie đã thay đổi thay vì toàn bộ danh sách. Ta dùng dạng chính xác đó cho movies trong phần kế tiếp.

Một component tiêu thụ cái này thì nhỏ xíu — không `useEffect`, không loading state thủ công:

```tsx
// frontend/src/pages/admin/GenreList.tsx
import { useState } from "react";
import {
  useGetGenresQuery,
  useCreateGenreMutation,
  useDeleteGenreMutation,
} from "../../redux/api/genres";

export default function GenreList() {
  const [name, setName] = useState("");
  // isLoading: first fetch only. isFetching: also true on background refetches.
  const { data: genres, isLoading } = useGetGenresQuery();
  const [createGenre, { isLoading: isCreating }] = useCreateGenreMutation();
  const [deleteGenre] = useDeleteGenreMutation();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    // .unwrap() turns the result into a promise that rejects on error,
    // so a try/catch can react to failures.
    await createGenre({ name }).unwrap();
    setName(""); // the genre list refetches itself — no manual refresh needed
  };

  if (isLoading) return <p>Loading genres…</p>;

  return (
    <div>
      <form onSubmit={handleCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button disabled={isCreating}>Add genre</button>
      </form>
      <ul>
        {genres?.map((g) => (
          <li key={g._id}>
            {g.name}
            <button onClick={() => deleteGenre(g._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🛠️ 4. Movie Endpoints — Search, Filter, Sort & Tag Chính xác

Các thao tác đọc movie mang theo **arguments**: một từ khóa tìm kiếm, một bộ lọc genre, một thứ tự sắp xếp. RTK Query cache theo *argument được serialize*, nên `{ search: "matrix" }` và `{ genre: "abc" }` là hai cache entry riêng biệt cùng tồn tại vui vẻ.

```typescript
// frontend/src/redux/api/movies.ts
import { apiSlice } from "./apiSlice";
import type { Movie, MovieQueryArgs } from "../../types/movie";

export const movieApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // LIST with search / filter / sort. Args are serialized into query params.
    getMovies: builder.query<Movie[], MovieQueryArgs | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.search) params.set("search", args.search);
        if (args?.genre) params.set("genre", args.genre);
        if (args?.sort) params.set("sort", args.sort);
        const qs = params.toString();
        return `/movies/all-movies${qs ? `?${qs}` : ""}`;
      },
      // Provide one tag per movie PLUS a list-level sentinel tag. This lets a
      // single-movie update invalidate just that movie, while a create/delete
      // invalidates the whole list.
      providesTags: (result) =>
        result
          ? [
              ...result.map((m) => ({ type: "Movie" as const, id: m._id })),
              { type: "Movie" as const, id: "LIST" },
            ]
          : [{ type: "Movie" as const, id: "LIST" }],
    }),

    getMovieById: builder.query<Movie, string>({
      query: (id) => `/movies/specific-movie/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Movie", id }],
    }),

    createMovie: builder.mutation<Movie, Partial<Movie>>({
      query: (body) => ({ url: "/movies/create-movie", method: "POST", body }),
      // A new movie affects the LIST, not any existing single movie.
      invalidatesTags: [{ type: "Movie", id: "LIST" }],
    }),

    updateMovie: builder.mutation<Movie, { id: string; data: Partial<Movie> }>({
      query: ({ id, data }) => ({
        url: `/movies/update-movie/${id}`,
        method: "PUT",
        body: data,
      }),
      // Only the edited movie (and any list showing it) needs refreshing.
      invalidatesTags: (_r, _e, { id }) => [{ type: "Movie", id }],
    }),

    deleteMovie: builder.mutation<{ _id: string }, string>({
      query: (id) => ({ url: `/movies/delete-movie/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Movie", id },
        { type: "Movie", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMoviesQuery,
  useGetMovieByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} = movieApiSlice;
```

Controller backend tương ứng đọc các query param đó và xây dựng query Mongo một cách động:

```js
// backend/controllers/movieController.js  (getAllMovies — extended)
import Movie from "../models/Movie.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const getAllMovies = asyncHandler(async (req, res) => {
  const { search, genre, sort } = req.query;

  // Build the Mongo filter object from the incoming query params.
  const filter = {};
  if (search) {
    // case-insensitive partial match on the movie name
    filter.name = { $regex: search, $options: "i" };
  }
  if (genre) {
    filter.genre = genre; // genre is an ObjectId string
  }

  // Map the friendly "sort" token to a Mongo sort spec.
  const sortSpec =
    sort === "top-rated"
      ? { numReviews: -1 } // most-reviewed first
      : { createdAt: -1 }; // "newest" (default)

  const movies = await Movie.find(filter)
    .populate("genre") // replace the genre ObjectId with the full document
    .sort(sortSpec);

  res.json(movies);
});

export { getAllMovies };
```

Một trang tìm kiếm đấu nối tất cả lại với nhau. Lưu ý RTK Query **dedupe** các request giống hệt nhau và cache từng tổ hợp argument, nên gõ cùng một từ khóa hai lần sẽ trúng cache ngay lập tức:

```tsx
// frontend/src/pages/Movies.tsx
import { useState } from "react";
import { useGetMoviesQuery } from "../redux/api/movies";
import { useGetGenresQuery } from "../redux/api/genres";

export default function Movies() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState<"newest" | "top-rated">("newest");

  const { data: genres } = useGetGenresQuery();
  // The args object IS the cache key. Changing any field fetches (or reuses).
  const { data: movies, isFetching } = useGetMoviesQuery({
    search: search || undefined,
    genre: genre || undefined,
    sort,
  });

  return (
    <div>
      <input
        placeholder="Search movies…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={genre} onChange={(e) => setGenre(e.target.value)}>
        <option value="">All genres</option>
        {genres?.map((g) => (
          <option key={g._id} value={g._id}>
            {g.name}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as "newest" | "top-rated")}
      >
        <option value="newest">Newest</option>
        <option value="top-rated">Top rated</option>
      </select>

      {isFetching && <span>Updating…</span>}
      <ul>
        {movies?.map((m) => (
          <li key={m._id}>
            {m.name} ({m.year}) — {m.numReviews} reviews
          </li>
        ))}
      </ul>
    </div>
  );
}
```

> [!TIP]
> Trong production, hãy debounce input `search` (ví dụ với một `useDebounce` 300 ms) để bạn không bắn một request cho mỗi lần gõ phím. RTK Query vẫn sẽ cache và dedupe, nhưng debounce giữ cho mạng yên ắng và các query `$regex` Mongo của bạn rẻ.

---

## 🧩 5. Tạo một Review

Một review được tạo dựa trên một movie cụ thể và, khi thành công, phải làm mới movie đó để comment mới và `numReviews` đã cập nhật xuất hiện. Ta invalidate **chỉ tag của movie đó** — phần còn lại của cache không bị động chạm.

```typescript
// frontend/src/redux/api/reviews.ts
import { apiSlice } from "./apiSlice";
import type { Movie } from "../../types/movie";

interface CreateReviewArgs {
  movieId: string;
  rating: number;
  comment: string;
}

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation<{ message: string }, CreateReviewArgs>({
      query: ({ movieId, rating, comment }) => ({
        url: `/movies/${movieId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      // Refresh exactly the movie that was reviewed.
      invalidatesTags: (_r, _e, { movieId }) => [{ type: "Movie", id: movieId }],
    }),
  }),
});

export const { useCreateReviewMutation } = reviewApiSlice;
```

```tsx
// frontend/src/components/ReviewForm.tsx
import { useState } from "react";
import { useCreateReviewMutation } from "../redux/api/reviews";

export default function ReviewForm({ movieId }: { movieId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading, error }] = useCreateReviewMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview({ movieId, rating, comment }).unwrap();
      setComment(""); // movie refetches → new review appears automatically
    } catch {
      // The server enforces "one review per user" and "must be logged in";
      // `error` holds the 400/401 payload for display.
    }
  };

  return (
    <form onSubmit={submit}>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} ★
          </option>
        ))}
      </select>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button disabled={isLoading}>Submit review</button>
      {error && <p>Could not submit review.</p>}
    </form>
  );
}
```

---

## ⚡ 6. Optimistic Update với `onQueryStarted` + `updateQueryData`

Tag invalidation thì đúng đắn nhưng phải chờ vòng round-trip tới server xong rồi giao diện mới đổi. Với các tương tác mượt mà (bật/tắt favorite, đăng một review mà bạn tin chắc sẽ thành công) bạn có thể **lạc quan (optimistically)** vá cache *trước khi* server trả lời, rồi roll back (hoàn tác) nếu nó thất bại.

Cơ chế là `onQueryStarted`: bên trong nó, `dispatch(api.util.updateQueryData(...))` trả về một **patch result** với phương thức `.undo()`. Áp dụng patch ngay lập tức; `await queryFulfilled`; nếu nó bị reject, gọi `patchResult.undo()`.

```typescript
// frontend/src/redux/api/reviews.ts  (optimistic variant of createReview)
import { apiSlice } from "./apiSlice";
import { movieApiSlice } from "./movies";
import type { Review } from "../../types/movie";

interface CreateReviewArgs {
  movieId: string;
  rating: number;
  comment: string;
  // We need the current user's display name to build the optimistic review.
  username: string;
  userId: string;
}

export const reviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReviewOptimistic: builder.mutation<
      { message: string },
      CreateReviewArgs
    >({
      query: ({ movieId, rating, comment }) => ({
        url: `/movies/${movieId}/reviews`,
        method: "POST",
        body: { rating, comment },
      }),
      async onQueryStarted(
        { movieId, rating, comment, username, userId },
        { dispatch, queryFulfilled }
      ) {
        // Build the review we EXPECT the server to create.
        const optimisticReview: Review = {
          _id: `temp-${Date.now()}`, // placeholder id until the refetch arrives
          name: username,
          rating,
          comment,
          user: userId,
          createdAt: new Date().toISOString(),
        };

        // Patch the cached single-movie entry immediately.
        const patch = dispatch(
          movieApiSlice.util.updateQueryData(
            "getMovieById", // the endpoint whose cache we edit
            movieId, // its argument (the cache key)
            (draft) => {
              // `draft` is an Immer draft — mutate it directly.
              draft.reviews.push(optimisticReview);
              draft.numReviews = draft.reviews.length;
            }
          )
        );

        try {
          await queryFulfilled; // wait for the real server response
          // Success: invalidate so the temp review is replaced by the real one.
          dispatch(
            apiSlice.util.invalidateTags([{ type: "Movie", id: movieId }])
          );
        } catch {
          // Failure: roll the optimistic change back out of the cache.
          patch.undo();
        }
      },
    }),
  }),
});

export const { useCreateReviewOptimisticMutation } = reviewApiSlice;
```

> [!WARNING]
> Optimistic update giả định sẽ thành công. Chúng tuyệt vời cho các hành động ít rủi ro, độ tin cậy cao, nhưng **đừng bao giờ** dùng chúng ở nơi mà một lần roll back âm thầm sẽ khiến người dùng bối rối không biết dữ liệu của họ đã được lưu hay chưa (thanh toán, xóa không thể hoàn tác). Luôn xử lý nhánh reject — một optimistic patch không có `patch.undo()` sẽ để lại cache nói dối vĩnh viễn về trạng thái server.

### Invalidation so với optimistic update trong nháy mắt

| | Tag invalidation | Optimistic update |
| :--- | :--- | :--- |
| Giao diện cập nhật | sau khi server phản hồi | ngay lập tức, trước phản hồi |
| Tốc độ cảm nhận | bình thường | rất nhanh |
| Độ phức tạp | một dòng (`invalidatesTags`) | `onQueryStarted` + rollback thủ công |
| Rủi ro nếu ghi thất bại | không (chưa từng hiện dữ liệu sai) | phải `undo()` nếu không giao diện nói dối |
| Phù hợp nhất cho | hầu hết các thao tác ghi | favorites, likes, sắp xếp lại, các bài đăng đáng tin |

---

## 🛠️ 7. Upload Ảnh — `multer` + `multipart/form-data`

Poster phim là file, không phải JSON. Bạn không thể đặt một ảnh nhị phân vào body JSON, nên việc upload dùng `multipart/form-data` và backend dùng **multer** để ghi file xuống đĩa và trả về URL của nó. Luồng có hai bước: upload ảnh, nhận lại một path, rồi lưu path đó vào field `image` của movie.

### Backend: route upload multer

```js
// backend/routes/uploadRoutes.js
import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

// Tell multer WHERE to store files and HOW to name them.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"), // folder on disk
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    // e.g. "image-1718000000000.jpg" — unique to avoid collisions
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// Only allow image mime/extensions through.
const fileFilter = (_req, file, cb) => {
  const allowed = /jpe?g|png|webp/;
  const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const okMime = /image\/(jpe?g|png|webp)/.test(file.mimetype);
  if (okExt && okMime) cb(null, true);
  else cb(new Error("Images only (jpg, png, webp)"), false);
};

const upload = multer({ storage, fileFilter });
// .single("image") parses ONE file from the form field named "image".
const uploadSingle = upload.single("image");

router.post("/", (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No image provided" });
    // Return the public URL the frontend will store on the movie.
    res.status(200).json({
      message: "Image uploaded",
      image: `/uploads/${req.file.filename}`,
    });
  });
});

export default router;
```

Gắn (mount) nó và phục vụ thư mục đó dưới dạng tĩnh trong entry point của Express:

```js
// backend/index.js  (additions)
import path from "path";
import uploadRoutes from "./routes/uploadRoutes.js";

app.use("/api/upload", uploadRoutes);

// Serve uploaded files so the browser can load /uploads/<filename>.
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
```

> [!WARNING]
> Luôn thiết lập một `fileFilter` **và** một giới hạn kích thước (`multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })`). Không có chúng, bất kỳ ai cũng có thể upload một file thực thi 2 GB đặt tên là `poster.jpg` và lấp đầy đĩa của bạn. Bộ lọc là tuyến phòng thủ đầu tiên — với production, hãy còn xác minh magic bytes thật của file, chứ không chỉ phần mở rộng của nó.

### Frontend: endpoint upload và một bộ chọn poster

Chi tiết then chốt: khi bạn truyền một object `FormData` làm body, `fetchBaseQuery` **không** đặt header `Content-Type` — trình duyệt tự đặt `multipart/form-data` với boundary đúng. Tự đặt nó bằng tay sẽ làm hỏng việc upload.

```typescript
// frontend/src/redux/api/upload.ts
import { apiSlice } from "./apiSlice";

interface UploadResult {
  message: string;
  image: string; // "/uploads/abc.jpg"
}

export const uploadApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<UploadResult, FormData>({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData, // DO NOT set Content-Type — the browser does it.
      }),
    }),
  }),
});

export const { useUploadImageMutation } = uploadApiSlice;
```

```tsx
// frontend/src/pages/admin/CreateMovie.tsx
import { useState } from "react";
import { useUploadImageMutation } from "../../redux/api/upload";
import { useCreateMovieMutation } from "../../redux/api/movies";

export default function CreateMovie() {
  const [name, setName] = useState("");
  const [year, setYear] = useState(2025);
  const [image, setImage] = useState(""); // the uploaded URL

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [createMovie, { isLoading: isSaving }] = useCreateMovieMutation();

  // Step 1: when a file is chosen, upload it and store the returned URL.
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file); // field name MUST match upload.single("image")
    const { image: url } = await uploadImage(formData).unwrap();
    setImage(url);
  };

  // Step 2: save the movie with the uploaded image path.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMovie({ name, year, image }).unwrap();
    // movie list (tag "Movie"/"LIST") refetches automatically
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Title" />
      <input
        type="number"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      />
      <input type="file" accept="image/*" onChange={handleFile} />
      {isUploading && <span>Uploading image…</span>}
      {image && <img src={image} alt="poster preview" width={120} />}
      <button disabled={isSaving || isUploading}>Create movie</button>
    </form>
  );
}
```

---

## 🧩 8. Đấu nối Store

Tất cả các endpoint được inject dùng chung một `apiSlice`, nên store chỉ cần một reducer + middleware duy nhất. `setupListeners` bật `refetchOnFocus` / `refetchOnReconnect`.

```typescript
// frontend/src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./features/auth/authSlice";

// Importing these modules executes injectEndpoints, registering them.
import "./api/genres";
import "./api/movies";
import "./api/reviews";
import "./api/upload";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // the RTK Query cache
    auth: authReducer,
  },
  // The middleware powers caching, invalidation, polling, and lifecycles.
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

// Typed helpers for the rest of the app.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## 🧠 Kiểm tra Kiến thức

### 1. Tại sao `baseUrl` của RTK Query được đặt thành đường dẫn tương đối `"/api"` thay vì `http://localhost:3000/api`?

<details>
  <summary><b>Hiện đáp án</b></summary>

  Bởi vì **Vite dev proxy** chuyển tiếp `/api/*` tới Express, trình duyệt chỉ bao giờ giao tiếp với origin của chính nó (`localhost:5173`). Dùng `/api` tương đối giữ cho mọi request cùng origin, mà đó chính xác là điều khiến cookie xác thực `httpOnly`, `sameSite: "strict"` được đính kèm tự động. Nó cũng có nghĩa *cùng* một code hoạt động trong production nơi frontend được phục vụ từ cùng host với API — không base URL đặc thù theo môi trường, không cấu hình CORS, không port hardcode phải thay đổi.
</details>

### 2. Một người dùng tạo một genre và danh sách genre tự làm mới mà không có lệnh `refetch()` nào. Hãy lần theo cơ chế chính xác.

<details>
  <summary><b>Hiện đáp án</b></summary>

  `getGenres` khai báo `providesTags: ["Genre"]`, nên kết quả được cache của nó được gắn tag `Genre`. `createGenre` khai báo `invalidatesTags: ["Genre"]`. Khi request của mutation resolve thành công, RTK Query tra cứu mọi query đã cache *đang hoạt động (active)* có cung cấp tag `Genre`, đánh dấu nó là stale, và tự động phát lại request của nó. Component đăng ký qua `useGetGenresQuery` re-render với dữ liệu mới. Không dispatch thủ công, không refetch, không bản sao state cục bộ nào dính líu — tag chính là toàn bộ hợp đồng.
</details>

### 3. Tại sao các movie endpoint dùng object tag như `{ type: "Movie", id }` và một sentinel `id: "LIST"` thay vì một string `"Movie"` thuần?

<details>
  <summary><b>Hiện đáp án</b></summary>

  Độ chi tiết (granularity). Một tag `"Movie"` thuần sẽ buộc *mọi* cache entry liên quan đến movie phải refetch khi có *bất kỳ* thao tác ghi movie nào. Với tag theo từng id, cập nhật một movie (`invalidatesTags: [{ type: "Movie", id }]`) chỉ làm mới các cache entry của đúng movie đó, để mọi movie và danh sách được cache khác không bị động chạm. Sentinel `{ type: "Movie", id: "LIST" }` đại diện cho "bản thân tập hợp đó", nên `createMovie` và `deleteMovie` invalidate nó để làm mới các danh sách, trong khi một `updateMovie` tại chỗ không cần làm xáo trộn thứ tự danh sách. Điều này giảm thiểu lưu lượng mạng dư thừa ở quy mô lớn.
</details>

### 4. Trong optimistic review update, patch được trả về bởi `dispatch(updateQueryData(...))` cho bạn cái gì, và tại sao nó thiết yếu?

<details>
  <summary><b>Hiện đáp án</b></summary>

  `dispatch(updateQueryData(...))` trả về một object **patch result** với một phương thức `.undo()`. Nó ngay lập tức mutate cache entry `getMovieById` (qua một Immer draft) để review mới xuất hiện tức thì. Code sau đó `await queryFulfilled`. Nếu server **reject** (ví dụ review trùng, chưa đăng nhập), `patch.undo()` roll back cache về trạng thái trước-patch, để giao diện không tiếp tục hiển thị một review chưa từng thực sự được lưu. Nếu không bắt và undo patch khi thất bại, cache sẽ biểu diễn sai trạng thái server vĩnh viễn.
</details>

### 5. Khi upload một ảnh qua `FormData`, tại sao bạn KHÔNG được đặt header `Content-Type`, và tại sao tên field của form phải khớp với `upload.single("image")`?

<details>
  <summary><b>Hiện đáp án</b></summary>

  `multipart/form-data` đòi hỏi một chuỗi **boundary** duy nhất trong header `Content-Type` để phân tách các phần của body. Trình duyệt tự sinh boundary đó khi bạn truyền một body `FormData` — nếu bạn tự đặt `Content-Type`, boundary bị thiếu hoặc sai và server không thể parse được upload. Riêng biệt, `upload.single("image")` của multer trích xuất đúng file có form field tên là `"image"`; nếu frontend append file dưới một khóa khác (`formData.append("poster", file)`), `req.file` là `undefined` và việc upload thất bại. Tên field ở cả hai phía phải khớp nhau.
</details>

---

## 💻 Bài tập Thực hành

### 🛠️ Bài tập 1: Thêm một carousel "Top Rated" chạy bằng một query đã sắp xếp

1. Query `getMovies` đã chấp nhận `sort: "top-rated"`. Tạo một component `TopMovies.tsx` gọi `useGetMoviesQuery({ sort: "top-rated" })` và render 5 kết quả đầu tiên trong một dải ngang.
2. Xác nhận caching: render cả `<Movies />` (mặc định `newest`) và `<TopMovies />` trên cùng một trang. Mở tab Network và xác minh có **hai** request riêng biệt được bắn (một cho mỗi tập argument), và rằng re-mount `<TopMovies />` phục vụ từ cache **không có** request mới.
3. Giờ tạo một movie qua `CreateMovie`. Vì `createMovie` invalidate `{ type: "Movie", id: "LIST" }`, hãy xác nhận **cả hai** danh sách tự động refetch.

```tsx
// frontend/src/components/TopMovies.tsx — starter
import { useGetMoviesQuery } from "../redux/api/movies";

export default function TopMovies() {
  const { data: movies, isLoading } = useGetMoviesQuery({ sort: "top-rated" });
  if (isLoading) return <p>Loading…</p>;
  // TODO: render movies.slice(0, 5) in a horizontal scroll container,
  // showing each poster (m.image) and its numReviews.
  return <div>{/* your carousel here */}</div>;
}
```

### 🛠️ Bài tập 2: Làm cho việc gửi review trở nên optimistic và chứng minh việc rollback

1. Chuyển `ReviewForm` sang dùng `useCreateReviewOptimisticMutation`, truyền `username` và `userId` của người dùng đã đăng nhập (đọc chúng từ `state.auth.userInfo`).
2. Gửi một review và xác nhận nó xuất hiện **tức thì** trong danh sách review của movie, trước khi network request resolve.
3. Ép một thất bại để chứng minh việc rollback: tạm thời đổi URL review trong endpoint sang một path sai (ví dụ `/movies/${movieId}/reviewsXXX`) để server trả về 404. Gửi lại và xác nhận review optimistic **xuất hiện rồi biến mất** khi `patch.undo()` chạy. Khôi phục lại URL sau đó.

```tsx
// frontend/src/components/ReviewForm.tsx — starter for the optimistic swap
import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useCreateReviewOptimisticMutation } from "../redux/api/reviews";

export default function ReviewForm({ movieId }: { movieId: string }) {
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [createReview, { isLoading }] = useCreateReviewOptimisticMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo) return;
    // TODO: call createReview with movieId, rating, comment,
    // username: userInfo.username, userId: userInfo._id — and .unwrap()
    // inside a try/catch so a failure shows a toast while the cache rolls back.
  };

  return (
    <form onSubmit={submit}>
      {/* rating select + comment textarea + submit button */}
    </form>
  );
}
```
