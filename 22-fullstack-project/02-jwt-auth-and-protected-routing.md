# FullStack: JWT Authentication & Protected Routing 🔐

Authentication is the spine of every real application: it decides *who you are*, while authorization decides *what you are allowed to do*. In the previous lesson (`01-fullstack-dashboard.md`) we stood up the Express + MongoDB backend and the React + RTK Query frontend as a whole system. This lesson is a focused, end-to-end deep dive into the **auth slice of that system** — from hashing a password in the database all the way to redirecting a logged-out user away from a protected page in the browser.

By the end you will understand the complete round trip: a user submits credentials → the backend hashes/verifies them with `bcrypt` → it signs a JWT and stores it in an `httpOnly` cookie → the browser silently returns that cookie on every request → middleware reads `req.cookies.jwt` to gate routes → and the React app guards its UI with `<PrivateRoute>` / `<AdminRoute>`. We will type everything with TypeScript so the contract between layers is explicit and copy-pasteable.

> [!NOTE]
> The recorded course builds the backend in **JavaScript** and uses an inline `bcrypt.hash` inside the register controller. In this lesson two things are **NET-NEW beyond the transcript**: (1) we refactor hashing into a Mongoose **pre-save hook** plus a **`matchPassword`** instance method (the current best-practice pattern), and (2) we **fully type the frontend** in TypeScript / React 19. Everything else — the `createToken` cookie util, the `authenticate` / `authorizeAdmin` middleware, the `authSlice`, and the route guards — mirrors what the instructor builds, normalized to TypeScript.

---

## 🧭 Concept & Overview

Authentication answers *"are you who you claim to be?"* and authorization answers *"are you allowed to do this?"*. They are distinct, sequential steps. You cannot decide whether someone is an admin until you first know which user they are.

**Real-world metaphor — a hotel.** When you check in, the front desk verifies your ID and payment (that is **authentication**, like `bcrypt.compare`). In return they hand you a **key card** (the **JWT**). The key card does not contain your bank details — it is just an opaque, signed token. From then on you never show your ID again: you tap the card at every door, and each door's reader (the **middleware**) silently checks whether the card is valid and whether *this* card opens *this* door (that is **authorization**, like `authorizeAdmin`). The elevator to the penthouse only opens for cards encoded as "suite guest" — exactly how an admin route only opens for `userInfo.isAdmin`. Crucially, the card readers — not the guest — decide access. A guest can claim anything; the building enforces the truth.

The JWT cookie is that key card. An `httpOnly` cookie is a key card the guest physically cannot read or photocopy with JavaScript — only the building's readers can interpret it.

### The full request lifecycle

```
┌────────────┐   POST /auth {email,password}    ┌──────────────────────────────┐
│  Browser   │ ───────────────────────────────► │  Express Backend             │
│ (React app)│                                   │                              │
│            │                                   │ 1. User.findOne({ email })   │
│            │                                   │ 2. user.matchPassword(pw)    │  bcrypt.compare
│            │                                   │ 3. createToken(res, _id)     │  jwt.sign
│            │  ◄─── Set-Cookie: jwt=… HttpOnly  │    res.cookie("jwt", …)      │
│            │       + JSON { _id, isAdmin … }   └──────────────────────────────┘
│            │
│  cookie    │   GET /users  (cookie sent AUTOMATICALLY by browser)
│  stored by │ ───────────────────────────────► authenticate ──► authorizeAdmin ──► handler
│  browser   │                                   reads req.cookies.jwt → jwt.verify → req.user
└────────────┘
```

### Where each responsibility lives

| Step | Lives on | Mechanism | Why there |
| --- | --- | --- | --- |
| Hash password | Backend | `bcrypt` pre-save hook | Plaintext must never touch the DB |
| Verify password | Backend | `matchPassword` (`bcrypt.compare`) | Hash is one-way; only the server compares |
| Issue session token | Backend | `jwt.sign` + `res.cookie` | Signing secret is server-only |
| Store session | Browser | `httpOnly` cookie | JS cannot read it → XSS-resistant |
| Send session | Browser | automatic cookie on same-origin | No manual `Authorization` header |
| Gate API routes | Backend | `authenticate` / `authorizeAdmin` | Server is the source of truth |
| Gate UI routes | Frontend | `<PrivateRoute>` / `<AdminRoute>` | UX only — *not* a security boundary |
| Remember user for UI | Frontend | `authSlice` + `localStorage` | Non-sensitive display data |

> [!WARNING]
> The frontend route guards are **UX, not security**. They hide pages a user shouldn't see, but a determined user can edit JavaScript state or call your API directly with `curl`/Postman. *Every* protected operation must also be enforced by backend middleware. The server is the only source of truth; treat the client as hostile.

---

## ⚡ 1. The User Model — bcrypt Pre-Save Hook + `matchPassword`

The transcript hashes the password inline inside the register controller. The cleaner, industry-standard pattern is to make the **model** responsible for its own password security via a Mongoose `pre("save")` hook and an instance method. This way *every* save path (register, profile update, admin edit) hashes automatically — you can never forget to do it.

```typescript
// backend/models/User.ts
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// The shape of a user document, including our custom instance method.
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Compares a plaintext attempt against the stored hash. Returns true if they match.
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true } // auto-adds createdAt & updatedAt
);

// PRE-SAVE HOOK: runs automatically before every .save().
// We only re-hash when the password field actually changed, so updating an
// email (without touching the password) does not double-hash the stored hash.
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // password unchanged → skip hashing
  }
  const salt = await bcrypt.genSalt(10); // cost factor 10
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// INSTANCE METHOD: available on every user document as user.matchPassword(...)
userSchema.methods.matchPassword = async function (
  this: IUser,
  enteredPassword: string
): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
```

> [!WARNING]
> **Never store plaintext passwords**, and never log them. `bcrypt` is one-way: even if the database leaks, the hashes cannot be reversed into the original passwords. The `genSalt(10)` cost factor makes each guess deliberately slow, which is what defeats brute-force attacks. Bumping the number to 12 roughly quadruples the work an attacker must do per guess.

> [!TIP]
> Guard the hook with `this.isModified("password")`. Without it, loading a user, changing only their email, and saving would re-hash the *already-hashed* password — and the user could never log in again because the stored value is now `hash(hash(realPassword))`.

---

## 🔑 2. `createToken` — Sign a JWT into an httpOnly Cookie

The token util signs a JWT carrying only the user's id, then attaches it as a hardened cookie. The browser stores it and replays it automatically; the frontend never touches the raw token.

```typescript
// backend/utils/createToken.ts
import jwt from "jsonwebtoken";
import { Response } from "express";

// Sign a JWT for `userId` and set it on the response as an httpOnly cookie.
const createToken = (res: Response, userId: string): string => {
  // The payload is intentionally minimal — just the id. Anything in a JWT is
  // readable (base64), only its signature is tamper-proof, so never put secrets here.
  const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // JS in the browser CANNOT read document.cookie → XSS-resistant
    secure: process.env.NODE_ENV !== "development", // HTTPS-only outside dev
    sameSite: "strict", // browser won't send it on cross-site requests → CSRF defense
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days, in milliseconds
  });

  return token;
};

export default createToken;
```

Here is the anatomy of each cookie flag and the attack it neutralizes:

| Flag | Value | Protects against |
| --- | --- | --- |
| `httpOnly` | `true` | XSS — a malicious script cannot read the token out of `document.cookie` |
| `secure` | `true` in prod | Network sniffing — cookie only travels over HTTPS |
| `sameSite` | `"strict"` | CSRF — cookie is not attached to requests originating from other sites |
| `maxAge` | 30d in ms | Stale sessions — the cookie self-expires |

> [!WARNING]
> A JWT's payload is **encoded, not encrypted**. Anyone can base64-decode `{ userId }` and read it. What they *cannot* do is forge a new token, because they lack `JWT_SECRET` to produce a valid signature. So: never store passwords or secrets in the payload, and keep `JWT_SECRET` long, random, and server-only.

---

## 👤 3. Register & Login Controllers

The controllers tie the model and the token util together. Notice how thin they become once the model owns hashing: register just constructs the user (the hook hashes), and login just calls `matchPassword`.

```typescript
// backend/controllers/userController.ts
import { Request, Response } from "express";
import User from "../models/User.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import createToken from "../utils/createToken.js";

// POST /api/v1/users  — register a new user (public)
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  // 1. Validate required fields
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the input fields.");
  }

  // 2. Reject duplicate emails
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists.");
  }

  // 3. Construct & save. The pre-save hook hashes the password for us.
  const newUser = new User({ username, email, password });
  await newUser.save();

  // 4. Issue the session cookie immediately so the user is logged in after signup.
  createToken(res, newUser._id.toString());

  res.status(201).json({
    _id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    isAdmin: newUser.isAdmin,
  });
});

// POST /api/v1/users/auth  — log in (public)
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  const existingUser = await User.findOne({ email });

  // Use the model's matchPassword method — bcrypt.compare under the hood.
  if (existingUser && (await existingUser.matchPassword(password ?? ""))) {
    createToken(res, existingUser._id.toString());
    res.status(200).json({
      _id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      isAdmin: existingUser.isAdmin,
    });
    return;
  }

  // Same generic message for "no such user" AND "wrong password" — don't leak
  // which emails are registered (account-enumeration defense).
  res.status(401);
  throw new Error("Invalid email or password.");
});

// POST /api/v1/users/logout  — clear the cookie (public)
export const logoutCurrentUser = asyncHandler(
  async (_req: Request, res: Response) => {
    // Overwrite the cookie with an empty value that expired in the past.
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
  }
);
```

> [!TIP]
> Return the **same** error for "user not found" and "wrong password" (`Invalid email or password.`). Distinct messages let an attacker probe which emails have accounts — a free reconnaissance gift. One generic 401 closes that hole.

---

## 🛡️ 4. Middleware — `authenticate` & `authorizeAdmin`

These two guards read the cookie and gate every protected route. `authenticate` proves *who* you are; `authorizeAdmin` proves you're *allowed*. They are designed to run in that order.

```typescript
// backend/middlewares/asyncHandler.ts
import { Request, Response, NextFunction } from "express";

// Wraps an async controller so a rejected promise becomes a 500 instead of an
// unhandled rejection — no repetitive try/catch in every handler.
type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

const asyncHandler =
  (fn: AsyncFn) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      res.status(res.statusCode === 200 ? 500 : res.statusCode);
      res.json({ message: error.message });
    });
  };

export default asyncHandler;
```

```typescript
// backend/middlewares/authMiddleware.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User.js";
import asyncHandler from "./asyncHandler.js";

// Augment Express's Request type so req.user is known to TypeScript everywhere.
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
}

// GUARD 1: must be logged in. Reads the cookie, verifies it, loads the user.
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.jwt as string | undefined; // set by cookie-parser

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token.");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      // Attach the user (minus the hash) so downstream handlers can use req.user.
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        res.status(401);
        throw new Error("Not authorized, user no longer exists.");
      }
      req.user = user;
      next();
    } catch {
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  }
);

// GUARD 2: must be an admin. Relies on req.user set by `authenticate`.
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin." });
  }
};
```

```typescript
// backend/routes/userRoutes.ts
import express from "express";
import {
  createUser,
  loginUser,
  logoutCurrentUser,
} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);          // register (public)
router.post("/auth", loginUser);       // login (public)
router.post("/logout", logoutCurrentUser); // logout (public)

// Admin-only: must clear authenticate FIRST, then authorizeAdmin.
router.get("/", authenticate, authorizeAdmin, async (_req, res) => {
  const User = (await import("../models/User.js")).default;
  const users = await User.find({}).select("-password");
  res.json(users);
});

export default router;
```

> [!NOTE]
> Middleware runs **left to right**. In `get("/", authenticate, authorizeAdmin, handler)`, `authenticate` runs first and sets `req.user`; only then does `authorizeAdmin` read `req.user.isAdmin`. Reverse them and `authorizeAdmin` would read an `undefined` `req.user` and reject everyone — including real admins. The order *encodes the rule* "log in before we check your role."

---

## ⚡ 5. Frontend — The Typed `authSlice`

The frontend mirrors a slice of the server's truth so the UI can react instantly (show the username, hide the login link, guard routes) without a round trip. We persist only **non-sensitive** display data to `localStorage` so a refresh doesn't log the user out visually. The real session is the cookie.

```typescript
// frontend/src/redux/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// The non-sensitive user info we mirror on the client. NO token here —
// the token lives only in the httpOnly cookie.
export interface UserInfo {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthState {
  userInfo: UserInfo | null;
}

// Rehydrate from localStorage so a page refresh keeps the user "logged in" in the UI.
const stored = localStorage.getItem("userInfo");
const initialState: AuthState = {
  userInfo: stored ? (JSON.parse(stored) as UserInfo) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after a successful login/register with the user JSON from the API.
    setCredentials: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    // Called after logout — clears both Redux state and the persisted copy.
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

> [!WARNING]
> We store `userInfo` (id, username, email, isAdmin) in `localStorage` **purely for UI convenience** — it is readable by any script on the page. That is acceptable *only* because it contains no credential. The actual session is the `httpOnly` JWT cookie, which JavaScript cannot read. Never put the token, a password, or anything secret in `localStorage`.

---

## 🧩 6. Login & Register Forms with RTK Query Mutations

The auth endpoints are RTK Query **mutations** (they change server state). The forms call the generated hooks, then dispatch `setCredentials` with the returned user JSON. We type the request/response so the hooks are fully checked.

```typescript
// frontend/src/redux/api/users.ts
import { apiSlice } from "./apiSlice"; // base createApi instance from lesson 01
import { USERS_URL } from "../constants";
import type { UserInfo } from "../features/auth/authSlice";

interface LoginRequest {
  email: string;
  password: string;
}
interface RegisterRequest extends LoginRequest {
  username: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserInfo, LoginRequest>({
      query: (data) => ({ url: `${USERS_URL}/auth`, method: "POST", body: data }),
    }),
    register: builder.mutation<UserInfo, RegisterRequest>({
      query: (data) => ({ url: USERS_URL, method: "POST", body: data }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: `${USERS_URL}/logout`, method: "POST" }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } =
  userApiSlice;
```

```tsx
// frontend/src/pages/Auth/Login.tsx
import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../redux/api/users";
import { setCredentials } from "../../redux/features/auth/authSlice";
import type { RootState } from "../../redux/store";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search } = useLocation();

  // Support ?redirect=/profile so we can send the user back where they came from.
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state: RootState) => state.auth);

  // If already logged in, skip the form.
  useEffect(() => {
    if (userInfo) navigate(redirect);
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // .unwrap() throws on error so we can catch it; returns the typed UserInfo.
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials(res)); // store user info + persist to localStorage
      navigate(redirect);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Login failed";
      alert(message); // replace with a toast in a real app
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <h1>Sign In</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign In"}
      </button>
      <p>
        New customer? <Link to={`/register?redirect=${redirect}`}>Register</Link>
      </p>
    </form>
  );
};

export default Login;
```

```tsx
// frontend/src/pages/Auth/Register.tsx
import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../../redux/api/users";
import { setCredentials } from "../../redux/features/auth/authSlice";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    try {
      const res = await register({ username, email, password }).unwrap();
      dispatch(setCredentials(res)); // auto-login: backend already set the cookie
      navigate("/");
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ??
        "Registration failed";
      alert(message);
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <h1>Register</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Registering…" : "Register"}
      </button>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
};

export default Register;
```

> [!TIP]
> Always call `.unwrap()` on an RTK Query mutation inside `try/catch`. Without it, the promise resolves to a result object containing an `error` field that is easy to forget to check; `.unwrap()` makes failures **throw**, so your `catch` reliably handles them and the success branch only runs on real success.

---

## 🛠️ 7. Logout — Clear the Cookie *and* the Client State

Logging out is a two-sided operation: the server must invalidate the cookie, and the client must drop its mirrored state. Doing only one leaves a half-logged-in zombie session.

```tsx
// frontend/src/components/LogoutButton.tsx
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/api/users";
import { logout } from "../redux/features/auth/authSlice";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap(); // 1. server clears the httpOnly cookie
      dispatch(logout()); // 2. client clears Redux state + localStorage
      navigate("/login"); // 3. send the user to the login page
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button type="button" onClick={logoutHandler}>
      Logout
    </button>
  );
};

export default LogoutButton;
```

> [!WARNING]
> Clearing `localStorage` alone does **not** log a user out — the `httpOnly` cookie is still valid and the browser will keep sending it, so protected API calls still succeed. You must hit the server's `/logout` endpoint to expire the cookie. Conversely, expiring the cookie without clearing client state leaves the UI showing a "logged-in" username until refresh. Do both.

---

## 🔒 8. Protected Routing — `<PrivateRoute>` & `<AdminRoute>`

React Router's layout routes let a guard render an `<Outlet />` (the matched child) when allowed, or a `<Navigate />` redirect when not. This is the cleanest pattern: the guard wraps a group of routes rather than each page checking auth itself.

```tsx
// frontend/src/pages/Auth/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

// Gate for any logged-in user. Renders child routes via <Outlet>, else redirects.
const PrivateRoute = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Preserve where they were headed so login can bounce them back.
  return userInfo ? (
    <Outlet />
  ) : (
    <Navigate to={`/login?redirect=${location.pathname}`} replace />
  );
};

export default PrivateRoute;
```

```tsx
// frontend/src/pages/Admin/AdminRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";

// Gate for admins only. Must be logged in AND have isAdmin === true.
const AdminRoute = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);

  return userInfo && userInfo.isAdmin ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;
```

```tsx
// frontend/src/main.tsx — route configuration
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/User/Profile";
import GenreList from "./pages/Admin/GenreList";
import Dashboard from "./pages/Admin/Dashboard";
import PrivateRoute from "./pages/Auth/PrivateRoute";
import AdminRoute from "./pages/Admin/AdminRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public routes */}
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      {/* Logged-in users only — Profile renders inside PrivateRoute's <Outlet> */}
      <Route element={<PrivateRoute />}>
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admins only */}
      <Route element={<AdminRoute />}>
        <Route path="admin/movies/genre" element={<GenreList />} />
        <Route path="admin/movies/dashboard" element={<Dashboard />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
```

> [!NOTE]
> `<Navigate replace />` overwrites the current history entry instead of pushing a new one. After a logged-out user is bounced from `/profile` to `/login`, pressing the browser **Back** button won't send them straight back into the page they were just denied — they'd land on whatever came before `/profile`. Without `replace`, Back would re-enter `/profile`, immediately redirect again, and feel like a broken loop.

---

## 🧠 Test Your Knowledge

Answer these to check your understanding. Click **Reveal Answer** to verify.

### 1. Why move password hashing into a Mongoose `pre("save")` hook instead of hashing inside the register controller?

<details>
  <summary><b>Reveal Answer</b></summary>

  Centralizing hashing in the model guarantees that *every* code path which saves a user — register, profile update, an admin editing a user, a seed script — hashes the password automatically. If hashing lives in one controller, every *other* save path is a place you can forget to hash, leaking a plaintext password into the database. The hook also guards with `this.isModified("password")` so non-password updates don't accidentally re-hash an existing hash. It is the single-responsibility principle applied to data integrity: the model owns its own security invariants.
</details>

### 2. The JWT payload is just `{ userId }`. Why is it safe to expose the user id, but unsafe to put the password in the payload?

<details>
  <summary><b>Reveal Answer</b></summary>

  A JWT is **signed, not encrypted** — its payload is base64-encoded and trivially readable by anyone who has the token. The signature only prevents *tampering* (you can't change `userId` or `isAdmin` without invalidating the signature, because you lack `JWT_SECRET`). Exposing the user id is harmless: it's not a secret. Putting a password (or any secret) in the payload would broadcast it to anyone who intercepts or decodes the token. The rule: a JWT payload may contain identifiers and non-sensitive claims, never credentials.
</details>

### 3. A teammate clears `localStorage` on logout but skips calling the `/logout` endpoint. What's the bug?

<details>
  <summary><b>Reveal Answer</b></summary>

  The session is the `httpOnly` JWT cookie, **not** `localStorage`. Clearing `localStorage` only removes the UI's mirrored `userInfo`, so the navbar stops showing the username — but the cookie is still valid and the browser keeps sending it. Any protected API request still succeeds, meaning the user is not actually logged out. The fix is to call the server's `/logout`, which overwrites the cookie with an expired one (`expires: new Date(0)`), *and then* clear client state. Logout must invalidate the real session on the server.
</details>

### 4. Why are `<PrivateRoute>` and `<AdminRoute>` insufficient as the *only* protection for admin operations?

<details>
  <summary><b>Reveal Answer</b></summary>

  Frontend route guards run in the browser, which is fully under the user's control. They are UX — they hide pages and links — but a user can edit Redux state in DevTools to flip `isAdmin` to `true`, or simply call the admin API endpoint directly with `curl`/Postman, never loading your React app at all. Therefore every protected operation must *also* be enforced server-side via `authenticate` + `authorizeAdmin`, which verify the signed cookie and the real `isAdmin` from the database. The client guard improves experience; the server guard provides security. You need both, but only the server one is a true boundary.
</details>

### 5. In the route `router.get("/", authenticate, authorizeAdmin, handler)`, why does the order of the two middlewares matter?

<details>
  <summary><b>Reveal Answer</b></summary>

  Express runs middleware left to right. `authenticate` verifies the JWT cookie and sets `req.user` from the database. `authorizeAdmin` then reads `req.user.isAdmin`. If you reversed them, `authorizeAdmin` would execute while `req.user` is still `undefined`, so the `req.user && req.user.isAdmin` check fails and *everyone* — including legitimate admins — is rejected. The order encodes the dependency: you must establish identity before you can evaluate a role. Authentication always precedes authorization.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Add a "current user" check endpoint and rehydrate from the server

The `authSlice` trusts `localStorage`, but `localStorage` can go stale (e.g. an admin revoked someone's `isAdmin`). Add a server endpoint that re-derives the user from the cookie, so the client can refresh its truth.

**Tasks**
1. Backend: add `GET /api/v1/users/profile` behind `authenticate`. It should respond with `req.user` (already password-stripped). Wire it in `userRoutes.ts`.
2. Frontend: in `users.ts`, add a **query** (not a mutation): `getProfile: builder.query<UserInfo, void>({ query: () => ({ url: \`${USERS_URL}/profile\` }) })` and export `useGetProfileQuery`.
3. In a top-level `App.tsx` effect, call `useGetProfileQuery()` on mount; if it returns data, `dispatch(setCredentials(data))` to overwrite the possibly-stale `localStorage` copy with the server's truth. If it 401s, `dispatch(logout())`.
4. **Verify:** log in, then in MongoDB set your user's `isAdmin` back to `false`, refresh the app, and confirm the admin links disappear because the server-derived `userInfo` now has `isAdmin: false`.

**Starter**

```typescript
// backend/routes/userRoutes.ts — add inside the router
import { authenticate } from "../middlewares/authMiddleware.js";

router.get("/profile", authenticate, (req, res) => {
  // req.user was set by authenticate (password already stripped).
  res.json(req.user);
});
```

```tsx
// frontend/src/App.tsx — rehydrate on mount
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetProfileQuery } from "./redux/api/users";
import { setCredentials, logout } from "./redux/features/auth/authSlice";

const App = () => {
  const dispatch = useDispatch();
  const { data, error } = useGetProfileQuery();

  useEffect(() => {
    if (data) dispatch(setCredentials(data)); // refresh from server truth
    else if (error) dispatch(logout()); // cookie invalid → drop client state
  }, [data, error, dispatch]);

  return <Outlet />;
};

export default App;
```

### 🛠️ Exercise 2: Add token expiry handling with a global 401 interceptor

Right now an expired cookie produces a 401 that each component must handle. Add a single interceptor that logs the user out automatically on any 401, so an expired session never leaves a confusing half-broken UI.

**Tasks**
1. In `apiSlice.ts`, wrap `fetchBaseQuery` in a `baseQueryWithAuth` that runs the base query, and if the result has `result.error?.status === 401`, dispatches `logout()` from the auth slice.
2. Use that wrapped function as the `baseQuery` passed to `createApi`.
3. **Verify:** log in, manually delete the `jwt` cookie in DevTools → Application → Cookies, trigger any protected request, and confirm you are bounced to `/login` automatically without a console crash.

**Starter**

```typescript
// frontend/src/redux/api/apiSlice.ts
import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";
import { logout } from "../features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({ baseUrl: BASE_URL });

// Wrap the base query: on any 401, clear client auth state.
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    api.dispatch(logout()); // global auto-logout on expired/invalid session
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  tagTypes: ["User", "Movie", "Genre"],
  endpoints: () => ({}),
});
```
