# FullStack: API Integration, CRUD & Cache Invalidation 🔌

The previous lesson built the two halves of our Movie Dashboard separately: an **Express + MongoDB** backend that owns the data, and a **React + Redux Toolkit** frontend that renders the UI. This lesson is the bridge between them — the **data layer** that turns "two apps in two terminals" into one cohesive product. Everything here lives on the seam: how the browser reaches the server, how reads and writes flow through **RTK Query**, and how the UI stays in sync after every create, update, and delete without you ever calling `refetch()` by hand.

By the end you will have a fully-typed `apiSlice`, injected endpoints for **movies / genres / reviews** (queries *and* mutations), **tag-based cache invalidation** so lists auto-refresh after a write, an **optimistic-update** example built with `onQueryStarted` + `updateQueryData`, server-side **search / filter / sort**, **review creation**, and **image upload** through a `multer` endpoint using `multipart/form-data`. The Vite proxy ties it all together so the browser sees a single origin and the `httpOnly` auth cookie just works.

> [!NOTE]
> The course transcript installs `multer` and `concurrently`, scaffolds the backend, and wires the RTK Query `apiSlice` with `injectEndpoints`, `tagTypes`, queries, and mutations. The **optimistic update** (`onQueryStarted` + `updateQueryData`), the **typed** TypeScript signatures, and the detailed **multer upload route** are presented here as NET-NEW, current best-practice extensions of what the instructor demonstrates in JavaScript — the patterns are identical, just fully typed and production-hardened.

---

## 🧭 Concept & Overview

RTK Query is a **caching data-fetching layer**. You describe your server's endpoints once, and it generates React hooks (`useGetMoviesQuery`, `useCreateReviewMutation`, …) that fetch, cache, deduplicate, and re-fetch for you. You never write `useEffect` + `useState` + `fetch` triads again, and you never manually track "is this list stale?" — the cache does it through **tags**.

Picture a **busy restaurant kitchen with an order board**. A **query** is a waiter reading the board to tell a table what's available — and the kitchen keeps a copy pinned up (the cache) so the next waiter asking the same question doesn't re-ask the chef. A **mutation** is a new order coming in: it changes what the kitchen is making. The moment that order lands, the head chef **rips down every board entry tagged with that dish** (`invalidatesTags`) so the next waiter who looks is forced to get fresh information. Tags are the sticky notes that say *"this board entry depends on Movies"* — change a movie, and every Movie-tagged board entry is torn down and re-read automatically.

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

### How the pieces relate

| Layer | Responsibility | "It is stale when…" |
| :--- | :--- | :--- |
| Component | Calls a generated hook, renders `data` / `isLoading` | never decides staleness itself |
| Endpoint (`query`) | Declares URL + `providesTags` | a matching tag is invalidated |
| Endpoint (`mutation`) | Declares URL + `invalidatesTags` | n/a — it *causes* staleness |
| `apiSlice` cache | Stores responses keyed by args, runs refetches | tracks every tag automatically |
| Vite proxy | Forwards `/api/*` to Express so the cookie is same-origin | n/a |

---

## ⚡ 1. The Vite Proxy — One Origin, Cookie Included

The auth token from the last lesson lives in an `httpOnly`, `sameSite: "strict"` cookie. The browser only sends that cookie to **the same origin** that set it. In development the React app runs on `http://localhost:5173` (Vite) while Express runs on `http://localhost:3000` — two different origins, so the cookie would not be attached, and every protected request would 401.

The fix is a **dev proxy**: we tell Vite to forward any request starting with `/api` (and `/uploads` for served images) to Express. The browser only ever talks to `localhost:5173`, so to it everything is one origin, and the cookie rides along.

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
> Because the proxy makes the API same-origin, our `baseUrl` is just `"/api"` — a relative path. In production you typically serve the built frontend from Express itself (or put both behind a reverse proxy), so the same relative `/api` URLs keep working with **zero code changes**. Never hardcode `http://localhost:3000` into the frontend.

---

## 🧩 2. The `apiSlice` — One Root, Many Injected Endpoints

`createApi` defines the shape of the whole data layer in one object: the `baseQuery` (how every request is made), the `tagTypes` (the universe of cache tags), and the `endpoints`. We deliberately leave `endpoints` empty here and **inject** the real ones from feature files. This keeps the root slice tiny and lets each feature (movies, genres, reviews) own its own endpoints while sharing a single cache.

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

### Shared response types

Strong typing is what turns RTK Query from "fetch with extra steps" into a contract. We declare the server's shapes once and reuse them across every endpoint.

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

## ⚡ 3. Genre Endpoints — Queries & Mutations, the Tag Loop

Genres are the simplest resource, so they best illustrate the **tag loop**: a query *provides* a tag, a mutation *invalidates* it, and the list refreshes itself.

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
> `invalidatesTags: ["Genre"]` is a **broad** invalidation: it dirties *every* cached entry tagged `Genre`. For a single list that is perfect. For many cached entries you can be surgical with object tags like `{ type: "Movie", id }` — invalidating only the movie that changed instead of the whole list. We use that precision form for movies in the next section.

A component consuming this is tiny — no `useEffect`, no manual loading state:

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

## 🛠️ 4. Movie Endpoints — Search, Filter, Sort & Precise Tags

Movie reads carry **arguments**: a search term, a genre filter, a sort order. RTK Query caches by the *serialized argument*, so `{ search: "matrix" }` and `{ genre: "abc" }` are two separate cache entries that coexist happily.

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

The matching backend controller reads those query params and builds the Mongo query dynamically:

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

A search page wires it together. Note RTK Query **dedupes** identical requests and caches each argument combination, so typing the same term twice hits the cache instantly:

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
> In production, debounce the `search` input (e.g. with a 300 ms `useDebounce`) so you don't fire one request per keystroke. RTK Query will still cache and dedupe, but debouncing keeps the network quiet and your Mongo `$regex` queries cheap.

---

## 🧩 5. Creating a Review

A review is created against a specific movie and, on success, must refresh that movie so the new comment and updated `numReviews` appear. We invalidate **only that movie's tag** — the rest of the cache is untouched.

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

## ⚡ 6. Optimistic Updates with `onQueryStarted` + `updateQueryData`

Tag invalidation is correct but waits for the server round-trip before the UI changes. For snappy interactions (toggling a favorite, posting a review you trust will succeed) you can **optimistically** patch the cache *before* the server replies, then roll back if it fails.

The mechanism is `onQueryStarted`: inside it, `dispatch(api.util.updateQueryData(...))` returns a **patch result** with an `.undo()` method. Apply the patch immediately; `await queryFulfilled`; if it rejects, call `patchResult.undo()`.

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
> Optimistic updates assume success. They are great for low-stakes, high-confidence actions, but **never** use them where a silent rollback would confuse the user about whether their data was saved (payments, irreversible deletes). Always handle the rejection branch — an optimistic patch with no `patch.undo()` leaves the cache permanently lying about server state.

### Invalidation vs. optimistic update at a glance

| | Tag invalidation | Optimistic update |
| :--- | :--- | :--- |
| UI updates | after server responds | instantly, before response |
| Perceived speed | normal | very fast |
| Complexity | one line (`invalidatesTags`) | `onQueryStarted` + manual rollback |
| Risk if write fails | none (never showed bad data) | must `undo()` or UI lies |
| Best for | most writes | favorites, likes, reorders, trusted posts |

---

## 🛠️ 7. Image Upload — `multer` + `multipart/form-data`

Movie posters are files, not JSON. You cannot put a binary image in a JSON body, so the upload uses `multipart/form-data` and the backend uses **multer** to write the file to disk and return its URL. The flow is two-step: upload the image, get back a path, then save that path in the movie's `image` field.

### Backend: the multer upload route

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

Mount it and serve the folder statically in the Express entry point:

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
> Always set a `fileFilter` **and** a size limit (`multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })`). Without them, anyone can upload a 2 GB executable named `poster.jpg` and fill your disk. The filter is a first line of defense — for production, also verify the file's real magic bytes, not just its extension.

### Frontend: the upload endpoint and a poster picker

The key detail: when you pass a `FormData` object as the body, `fetchBaseQuery` does **not** set a `Content-Type` header — the browser sets `multipart/form-data` with the correct boundary itself. Setting it manually breaks the upload.

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

## 🧩 8. Wiring the Store

All injected endpoints share the one `apiSlice`, so the store only needs the single reducer + middleware. `setupListeners` enables `refetchOnFocus` / `refetchOnReconnect`.

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

## 🧠 Test Your Knowledge

### 1. Why is the RTK Query `baseUrl` set to the relative path `"/api"` instead of `http://localhost:3000/api`?

<details>
  <summary><b>Reveal Answer</b></summary>

  Because the **Vite dev proxy** forwards `/api/*` to Express, the browser only ever talks to its own origin (`localhost:5173`). Using a relative `/api` keeps every request same-origin, which is exactly what makes the `httpOnly`, `sameSite: "strict"` auth cookie get attached automatically. It also means the *same* code works in production where the frontend is served from the same host as the API — no environment-specific base URL, no CORS configuration, no hardcoded ports to change.
</details>

### 2. A user creates a genre and the genre list refreshes with no `refetch()` call. Trace the exact mechanism.

<details>
  <summary><b>Reveal Answer</b></summary>

  `getGenres` declares `providesTags: ["Genre"]`, so its cached result is tagged `Genre`. `createGenre` declares `invalidatesTags: ["Genre"]`. When the mutation's request resolves successfully, RTK Query looks up every *active* cached query that provides the `Genre` tag, marks it stale, and automatically re-issues its request. The component subscribed via `useGetGenresQuery` re-renders with the fresh data. No manual dispatch, refetch, or local state copy is involved — the tag is the entire contract.
</details>

### 3. Why do the movie endpoints use object tags like `{ type: "Movie", id }` and an `id: "LIST"` sentinel instead of a plain `"Movie"` string?

<details>
  <summary><b>Reveal Answer</b></summary>

  Granularity. A plain `"Movie"` tag would force *every* movie-related cache entry to refetch on *any* movie write. With per-id tags, updating one movie (`invalidatesTags: [{ type: "Movie", id }]`) refreshes only that movie's cached entries, leaving every other cached movie and list untouched. The `{ type: "Movie", id: "LIST" }` sentinel represents "the collection itself," so `createMovie` and `deleteMovie` invalidate it to refresh lists, while an in-place `updateMovie` does not need to disturb the list ordering. This minimizes redundant network traffic at scale.
</details>

### 4. In the optimistic review update, what does the patch returned by `dispatch(updateQueryData(...))` give you, and why is it essential?

<details>
  <summary><b>Reveal Answer</b></summary>

  `dispatch(updateQueryData(...))` returns a **patch result** object with an `.undo()` method. It immediately mutates the cached `getMovieById` entry (via an Immer draft) so the new review appears instantly. The code then `await queryFulfilled`. If the server **rejects** (e.g. duplicate review, not logged in), `patch.undo()` rolls the cache back to its pre-patch state, so the UI does not keep showing a review that was never actually saved. Without capturing and undoing the patch on failure, the cache would permanently misrepresent server state.
</details>

### 5. When uploading an image via `FormData`, why must you NOT set a `Content-Type` header, and why must the form field name match `upload.single("image")`?

<details>
  <summary><b>Reveal Answer</b></summary>

  `multipart/form-data` requires a unique **boundary** string in the `Content-Type` header that separates parts of the body. The browser generates that boundary automatically when you pass a `FormData` body — if you set `Content-Type` yourself, the boundary is missing or wrong and the server cannot parse the upload. Separately, multer's `upload.single("image")` extracts exactly the file whose form field is named `"image"`; if the frontend appends the file under a different key (`formData.append("poster", file)`), `req.file` is `undefined` and the upload fails. The field names on both sides must agree.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Add a "Top Rated" carousel powered by a sorted query

1. The `getMovies` query already accepts `sort: "top-rated"`. Create a `TopMovies.tsx` component that calls `useGetMoviesQuery({ sort: "top-rated" })` and renders the first 5 results in a horizontal strip.
2. Confirm caching: render both `<Movies />` (default `newest`) and `<TopMovies />` on the same page. Open the Network tab and verify **two** distinct requests fire (one per argument set), and that re-mounting `<TopMovies />` serves from cache with **no** new request.
3. Now create a movie via `CreateMovie`. Because `createMovie` invalidates `{ type: "Movie", id: "LIST" }`, confirm **both** lists refetch automatically.

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

### 🛠️ Exercise 2: Make the review submission optimistic and prove the rollback

1. Swap `ReviewForm` over to `useCreateReviewOptimisticMutation`, passing the logged-in user's `username` and `userId` (read them from `state.auth.userInfo`).
2. Submit a review and confirm it appears **instantly** in the movie's review list, before the network request resolves.
3. Force a failure to prove the rollback: temporarily change the review URL in the endpoint to a wrong path (e.g. `/movies/${movieId}/reviewsXXX`) so the server returns 404. Submit again and confirm the optimistic review **appears then disappears** as `patch.undo()` runs. Restore the URL afterward.

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
