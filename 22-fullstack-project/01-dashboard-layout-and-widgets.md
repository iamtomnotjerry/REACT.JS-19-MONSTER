# FullStack: Dashboard Layout & Widgets 📊

This lesson is a focused split of the larger [FullStack Enterprise Dashboard](./01-fullstack-dashboard.md) build. Here we ignore the backend almost entirely and concentrate on a single thing: the **admin frontend shell** — the responsive layout (sidebar + header + content), the **stat cards** at the top, a **Genre management widget**, and a **Movie management table** with per-row actions. We consume the RTK Query lists you already wired up (`useGetMoviesQuery` / `useGetGenresQuery`) and surface proper loading, empty, and error UI for each one.

In the course walkthrough, the instructor logs in as an admin, opens the dashboard, and shows three headline numbers (subscribers/users, comments, movies), a "top content" panel, a genre create/update/delete tool, and a movie table whose rows let you jump straight into update or delete. We rebuild exactly that surface here in **React 19 + TypeScript + Tailwind**, as reusable, fully-typed widget components — so the next lessons can drop in real auth (lesson 02) and the full CRUD/API layer (lesson 03) without touching the layout.

---

## 🧭 Concept & Overview

An admin dashboard is not one big page — it is a **frame** plus a grid of **widgets**. The frame (sidebar + header + content area) stays put while you navigate; the widgets are independent, self-contained panels that each own one slice of data, one loading spinner, and one error message. This separation is what lets a real product grow: you add a new widget without redesigning the page, and a failing widget shows its own error instead of blanking the whole screen.

Think of the dashboard as the **control room of a cinema multiplex**. The walls and the doorway never move — that's your layout shell. On the walls hang a set of independent monitors: one shows ticket sales (stat cards), one is a touchscreen for editing the showtimes board (the Genre widget), and one is the big film roster the manager scrolls and edits (the Movie table). If the ticket-sales feed drops, that one monitor shows static — the manager can still use the roster screen. Each monitor wires to its own camera feed (its own RTK Query hook); the room itself doesn't care which feeds are live.

> [!NOTE]
> **Net-new vs. grounded.** The admin *widgets* (stat cards, genre tool, movie table with row actions) are exactly what the course demonstrates. The specific **Tailwind layout shell** (a fixed sidebar + sticky header + scrollable content using CSS grid) and the **TypeScript typings** shown here go beyond the recorded JavaScript walkthrough — they are added once, here, as current best practice. Everything is wired to the same RTK Query endpoints from [the parent lesson](./01-fullstack-dashboard.md).

> [!TIP]
> Each widget should be **dumb about layout and smart about its own data**. It fetches with its hook, renders one of four states (loading / error / empty / data), and exposes callbacks (`onEdit`, `onDelete`) instead of doing navigation itself. That keeps widgets reusable on other pages and trivial to test in isolation.

### Anatomy of the dashboard

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

### Layout responsibilities

| Region | Owns | Does NOT own |
| --- | --- | --- |
| `AdminLayout` | Grid structure, responsive breakpoints, where the sidebar/header/content sit | Any data fetching, business logic |
| `Sidebar` | Nav links + active highlighting + collapse on mobile | What the pages render |
| `Header` | Page title slot, user menu, mobile menu toggle | Sidebar state internals |
| `StatCard` | One number + label + icon + skeleton | Where the number comes from |
| `GenreWidget` | Genre list, add/rename/delete UI, its own loading/error | The HTTP layer (delegates to RTK Query hooks) |
| `MovieTable` | Tabular rows + per-row action buttons | Navigation target of those actions (callbacks) |

---

## ⚡ 1. The Data Contracts (Typed)

Before any UI, define the TypeScript shapes the widgets consume. These mirror the Mongoose models from the parent lesson (`Movie`, `Genre`) but expressed as the JSON the frontend actually receives. Put them in a shared `types.ts`.

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
> The backend uses `.populate("genre")` so `movie.genre` is normally the full `Genre` object. Typing it as `Genre | string` and funnelling reads through `genreName()` means a route that *forgets* to populate degrades to a dash instead of rendering `[object Object]`.

### Typing the RTK Query hooks

The parent lesson wrote the API slice in JavaScript. Here is the same slice in TypeScript so the hooks return typed data. Note the endpoint names match this lesson's brief: `getMovies` / `getGenres`.

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

The shell is pure layout: a CSS grid that places a sidebar to the left and a `main` column on the right. On mobile the sidebar slides over the content (off-canvas); on `md` and up it sits permanently in a fixed-width column. We use Tailwind utility classes only — no custom CSS.

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
> A fixed sidebar (`fixed inset-y-0 left-0 w-64`) is *out of the document flow*, so it does not push the content. You must add the matching `md:pl-64` padding on the main column (as `AdminLayout` does) or your content will hide *underneath* the sidebar on desktop. The two numbers — `w-64` and `pl-64` — must always agree.

---

## 🧩 3. Stat Cards

The three headline numbers (users, comments, movies) are the first thing the instructor highlights. A `StatCard` is intentionally presentational: it takes a label, a value, an icon, and a `loading` flag, and renders a skeleton while the value is unknown. The dashboard page computes the numbers from the lists it already fetched — total movies, and total reviews summed across movies.

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
> Notice the dashboard fetches `useGetMoviesQuery()` once and *passes the whole query object* to `MovieTable`. RTK Query **deduplicates** identical requests, so even if `MovieTable` also called the hook you'd get the same single network request — but passing the result down makes the data flow explicit and saves a hook call.

---

## 🛠️ 4. A Reusable `QueryBoundary` for Loading / Empty / Error

Every list widget repeats the same four-state dance: loading, error, empty, data. Factor it into one generic component so the widgets stay short and consistent. This is the single most reused piece in the whole dashboard.

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
> Returning a render-prop (`children: (data) => ReactNode`) instead of rendering rows itself keeps `QueryBoundary` **generic over `T`**. The Genre widget and Movie table both reuse it, and TypeScript narrows `data` to the right element type inside each `children` callback — no casts needed.

---

## 🧩 5. The Genre Management Widget

The genre tool is a compact panel: a list of existing genres, an input to add a new one, and inline rename/delete per row. It uses four mutations and one query, and because every mutation `invalidatesTags: ["Genre"]`, the list re-fetches automatically after any change — no manual refresh.

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
> Always `.trim()` and check for an empty string before firing the create/rename mutation. The backend `createGenre` controller returns `{ error: "Name is required" }` for a blank name, but it returns HTTP **200** with that error in the body — so RTK Query won't treat it as a failure. Guarding on the client avoids creating phantom blank rows.

---

## 🧩 6. The Movie Management Table

The movie table is the largest widget: a scrollable table of every movie with its poster, year, genre, review count, and two row actions — **Edit** (navigates to the update page) and **Delete** (a destructive mutation). It reuses `QueryBoundary` and accepts the query as a prop so the dashboard can share its already-fetched data.

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
> The `Edit` button calls an `onEdit(movie)` callback rather than navigating itself. That single decision makes `MovieTable` reusable on a "recently added" panel, a search-results page, or a Storybook story — none of which may want to navigate to the same place. The *parent* decides the action; the table just reports the click.

---

## 🛠️ 7. Wiring the Routes

Drop the layout and pages into the router. The whole admin area nests under `AdminLayout`, so every admin page automatically gets the sidebar and header. (In lesson 02 you'll wrap this branch in `AdminRoute` to enforce the admin guard.)

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

### 1. Why does `AdminLayout` need a `md:pl-64` on the main column when the sidebar is `w-64`?

<details>
  <summary><b>Reveal Answer</b></summary>

  Because the sidebar is positioned with `fixed`, it is removed from the normal document flow and therefore does **not** take up space that would push the content to the right. Without compensating padding, the `main` column starts at the left edge of the viewport and the fixed sidebar overlaps (hides) the first 16rem of content. Adding `md:pl-64` reserves exactly the sidebar's width (`w-64` = 16rem) on `md`+ screens so the content begins where the sidebar ends. The two values must always match; if you widen the sidebar to `w-72`, you must change the padding to `md:pl-72`.
</details>

### 2. How does the genre list refresh after you add or delete a genre, without any manual refetch call?

<details>
  <summary><b>Reveal Answer</b></summary>

  Through RTK Query's tag system. `getGenres` declares `providesTags: ["Genre"]`, and each of `createGenre`, `updateGenre`, and `deleteGenre` declares `invalidatesTags: ["Genre"]`. When a mutation succeeds, RTK Query marks every active query that *provides* the `"Genre"` tag as stale and automatically re-runs it. So the moment a create/rename/delete resolves, `getGenres` re-fetches and the `GenreWidget` re-renders with fresh data — no `dispatch`, no `refetch()`, no manual cache surgery.
</details>

### 3. Why is `QueryBoundary` written as a generic component (`<T>`) with a render-prop `children`, instead of just rendering rows internally?

<details>
  <summary><b>Reveal Answer</b></summary>

  Because the four states (loading / error / empty / data) are identical for every list, but the *data rendering* is different for genres vs. movies. Making it generic over `T` and accepting `children: (data: T[]) => ReactNode` lets the same boundary wrap both widgets while TypeScript still narrows `data` to `Genre[]` in one place and `Movie[]` in the other — fully typed, no casts. If `QueryBoundary` rendered rows itself it would either be locked to one data type or need an untyped `any`, defeating the point.
</details>

### 4. The `MovieTable`'s Edit button calls `onEdit(movie)` rather than calling `navigate(...)` directly. What does this buy us?

<details>
  <summary><b>Reveal Answer</b></summary>

  Decoupling and reusability. The table no longer knows or cares *what* editing means — it just reports "the user clicked Edit on this movie." The parent (the dashboard page) decides the consequence: navigate to `/admin/movies/update/:id`. A different parent could open a modal, log an analytics event, or do nothing. This keeps `MovieTable` a pure presentational widget that can be reused on multiple pages and tested in isolation by passing a spy as `onEdit`. Delete is handled inside the table because it's a self-contained data mutation, but even that could be lifted to a prop if needed.
</details>

### 5. The "Comments" stat card shows `movies.reduce((s, m) => s + m.numReviews, 0)`. Why compute it from the movies list instead of fetching a separate count, and what loading flag should drive the card?

<details>
  <summary><b>Reveal Answer</b></summary>

  Reviews are *embedded* inside each movie document on the backend (`movie.reviews` with a `numReviews` field), and the dashboard already fetches the full movie list for the table. Summing `numReviews` reuses data we already have — no second round-trip, no extra endpoint. The card's `loading` prop should therefore be tied to `moviesQuery.isLoading`, the same query that produces the number: while the movie list is loading we don't yet know the comment total, so the skeleton should show until that query resolves.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Add a "Recent Reviews" widget

Build a fourth widget that lists the 5 most recent reviews across all movies, reusing the data you already fetch.

**Tasks**

1. Create `frontend/src/components/admin/RecentReviewsWidget.tsx` that accepts the movies query as a prop (same pattern as `MovieTable`).
2. Flatten every movie's `reviews` into one array, attaching the movie name to each, then sort by `createdAt` descending and take the first 5.
3. Render each review with the reviewer's name, the movie title, the rating, and a relative date. Wrap it in `QueryBoundary`.

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

**Verify:** add `<RecentReviewsWidget query={moviesQuery} />` to `DashboardPage` and confirm it shows the latest reviews and updates whenever a movie list refetch happens.

### 🛠️ Exercise 2: Make the Movie table filterable by genre

Add a `<select>` above the table that filters rows by genre, driven entirely on the client from the data you already have.

**Tasks**

1. In `MovieTable`, add local state `const [genreFilter, setGenreFilter] = useState<string>("all")`.
2. Derive the list of unique genre names from the movies (use `genreName(movie.genre)`), and render them as `<option>`s plus an "All genres" default.
3. Filter the rows inside the `QueryBoundary` render-prop so only matching movies render — without re-fetching.

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

**Verify:** pick a genre and confirm the table narrows instantly (no network request in the Network tab), and that selecting "All genres" restores the full list. Bonus: show the filtered count in the heading, e.g. `Movies (4 of 12)`.
