# FullStack: JWT Authentication & Protected Routing 🔐

Authentication là xương sống của mọi ứng dụng thực tế: nó quyết định *bạn là ai*, trong khi authorization quyết định *bạn được phép làm gì*. Ở bài học trước (`01-fullstack-dashboard.md`) chúng ta đã dựng backend Express + MongoDB và frontend React + RTK Query như một hệ thống hoàn chỉnh. Bài học này là một lần đào sâu tập trung, đầu-cuối vào **lát cắt auth của hệ thống đó** — từ việc hash một password trong database cho đến việc redirect một người dùng đã đăng xuất ra khỏi một trang được bảo vệ trên trình duyệt.

Đến cuối bài bạn sẽ hiểu trọn vẹn vòng đời round trip: người dùng gửi credentials → backend hash/xác minh chúng bằng `bcrypt` → nó ký một JWT và lưu vào một cookie `httpOnly` → trình duyệt âm thầm trả lại cookie đó trong mọi request → middleware đọc `req.cookies.jwt` để chặn các route → và ứng dụng React bảo vệ UI của nó bằng `<PrivateRoute>` / `<AdminRoute>`. Chúng ta sẽ gắn type cho mọi thứ bằng TypeScript để hợp đồng giữa các tầng trở nên rõ ràng và có thể copy-paste được.

> [!NOTE]
> Khóa học được ghi hình dựng backend bằng **JavaScript** và dùng một `bcrypt.hash` inline ngay trong register controller. Trong bài học này có hai điểm **HOÀN TOÀN MỚI so với transcript**: (1) chúng ta refactor việc hashing thành một Mongoose **pre-save hook** cộng với một instance method **`matchPassword`** (mẫu best-practice hiện hành), và (2) chúng ta **gắn type đầy đủ cho frontend** bằng TypeScript / React 19. Mọi thứ còn lại — cookie util `createToken`, middleware `authenticate` / `authorizeAdmin`, `authSlice`, và các route guard — đều phản chiếu những gì giảng viên xây dựng, được chuẩn hóa sang TypeScript.

---

## 🧭 Concept & Overview

Authentication trả lời câu hỏi *"bạn có đúng là người bạn tự nhận không?"* và authorization trả lời *"bạn có được phép làm việc này không?"*. Chúng là hai bước riêng biệt, tuần tự. Bạn không thể quyết định ai đó có phải admin hay không trước khi biết họ là người dùng nào.

**Phép ẩn dụ thực tế — một khách sạn.** Khi bạn check in, quầy lễ tân xác minh giấy tờ và thanh toán của bạn (đó là **authentication**, giống `bcrypt.compare`). Đổi lại họ đưa cho bạn một **thẻ chìa khóa** (chính là **JWT**). Thẻ chìa khóa không chứa thông tin ngân hàng của bạn — nó chỉ là một token mờ đục, đã được ký. Từ đó trở đi bạn không bao giờ phải xuất trình giấy tờ nữa: bạn quẹt thẻ ở mọi cánh cửa, và đầu đọc của mỗi cửa (chính là **middleware**) âm thầm kiểm tra xem thẻ có hợp lệ không và xem *thẻ này* có mở được *cửa này* không (đó là **authorization**, giống `authorizeAdmin`). Thang máy lên penthouse chỉ mở cho những thẻ được mã hóa là "khách suite" — y hệt cách một admin route chỉ mở cho `userInfo.isAdmin`. Điều then chốt: chính các đầu đọc thẻ — không phải vị khách — quyết định quyền truy cập. Một vị khách có thể tuyên bố bất cứ điều gì; tòa nhà mới là nơi thực thi sự thật.

Cookie JWT chính là tấm thẻ chìa khóa đó. Một cookie `httpOnly` là tấm thẻ chìa khóa mà vị khách về mặt vật lý không thể đọc hay photocopy bằng JavaScript — chỉ các đầu đọc của tòa nhà mới diễn giải được nó.

### Vòng đời đầy đủ của một request

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

### Mỗi trách nhiệm nằm ở đâu

| Bước | Nằm ở | Cơ chế | Tại sao ở đó |
| --- | --- | --- | --- |
| Hash password | Backend | `bcrypt` pre-save hook | Plaintext không bao giờ được chạm vào DB |
| Xác minh password | Backend | `matchPassword` (`bcrypt.compare`) | Hash là một chiều; chỉ server so sánh |
| Phát hành session token | Backend | `jwt.sign` + `res.cookie` | Khóa ký chỉ tồn tại trên server |
| Lưu session | Browser | cookie `httpOnly` | JS không đọc được → chống XSS |
| Gửi session | Browser | cookie tự động trên cùng origin | Không cần header `Authorization` thủ công |
| Chặn API route | Backend | `authenticate` / `authorizeAdmin` | Server là nguồn sự thật |
| Chặn UI route | Frontend | `<PrivateRoute>` / `<AdminRoute>` | Chỉ là UX — *không phải* ranh giới bảo mật |
| Ghi nhớ user cho UI | Frontend | `authSlice` + `localStorage` | Dữ liệu hiển thị không nhạy cảm |

> [!WARNING]
> Các route guard của frontend là **UX, không phải bảo mật**. Chúng ẩn đi những trang mà người dùng không nên thấy, nhưng một người dùng quyết tâm có thể chỉnh sửa JavaScript state hoặc gọi thẳng API của bạn bằng `curl`/Postman. *Mọi* thao tác được bảo vệ cũng phải được thực thi bởi backend middleware. Server là nguồn sự thật duy nhất; hãy coi client là kẻ thù.

---

## ⚡ 1. User Model — bcrypt Pre-Save Hook + `matchPassword`

Transcript hash password inline ngay trong register controller. Mẫu sạch sẽ, chuẩn công nghiệp hơn là làm cho **model** chịu trách nhiệm về bảo mật password của chính nó thông qua một Mongoose `pre("save")` hook và một instance method. Như vậy *mọi* đường lưu (register, cập nhật profile, admin chỉnh sửa) đều hash tự động — bạn không bao giờ có thể quên làm điều đó.

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
> **Không bao giờ lưu password dạng plaintext**, và không bao giờ log chúng. `bcrypt` là một chiều: ngay cả khi database bị rò rỉ, các hash cũng không thể đảo ngược về password gốc. Cost factor `genSalt(10)` khiến mỗi lần đoán cố ý chậm đi, và đó chính là thứ đánh bại các cuộc tấn công brute-force. Tăng con số lên 12 làm khối lượng công việc kẻ tấn công phải làm cho mỗi lần đoán tăng lên khoảng gấp bốn.

> [!TIP]
> Hãy bảo vệ hook bằng `this.isModified("password")`. Nếu không có nó, việc tải một user, chỉ thay đổi email của họ, rồi save sẽ hash lại password *vốn đã được hash* — và người dùng sẽ không bao giờ đăng nhập được nữa vì giá trị được lưu giờ là `hash(hash(realPassword))`.

---

## 🔑 2. `createToken` — Ký một JWT vào Cookie httpOnly

Token util ký một JWT chỉ mang theo id của người dùng, rồi gắn nó như một cookie đã được làm cứng. Trình duyệt lưu nó và tự động phát lại; frontend không bao giờ chạm vào token thô.

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

Dưới đây là giải phẫu của từng cookie flag và cuộc tấn công mà nó vô hiệu hóa:

| Flag | Giá trị | Bảo vệ chống lại |
| --- | --- | --- |
| `httpOnly` | `true` | XSS — một script độc hại không thể đọc token ra khỏi `document.cookie` |
| `secure` | `true` ở prod | Nghe lén mạng — cookie chỉ truyền qua HTTPS |
| `sameSite` | `"strict"` | CSRF — cookie không được gắn vào các request bắt nguồn từ site khác |
| `maxAge` | 30 ngày tính bằng ms | Session cũ — cookie tự hết hạn |

> [!WARNING]
> Payload của một JWT được **encode, không phải encrypt**. Bất kỳ ai cũng có thể base64-decode `{ userId }` và đọc được nó. Điều họ *không thể* làm là giả mạo một token mới, vì họ thiếu `JWT_SECRET` để tạo ra một chữ ký hợp lệ. Vậy nên: không bao giờ lưu password hay secret trong payload, và giữ cho `JWT_SECRET` dài, ngẫu nhiên, và chỉ tồn tại trên server.

---

## 👤 3. Register & Login Controllers

Các controller buộc model và token util lại với nhau. Hãy để ý chúng trở nên mỏng manh thế nào một khi model sở hữu việc hashing: register chỉ cần khởi tạo user (hook hash giúp), và login chỉ cần gọi `matchPassword`.

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
> Hãy trả về **cùng một** lỗi cho cả "không tìm thấy user" lẫn "sai password" (`Invalid email or password.`). Các thông báo khác nhau cho phép kẻ tấn công dò xem những email nào có tài khoản — một món quà trinh sát miễn phí. Một lỗi 401 chung chung đóng lại lỗ hổng đó.

---

## 🛡️ 4. Middleware — `authenticate` & `authorizeAdmin`

Hai guard này đọc cookie và chặn mọi route được bảo vệ. `authenticate` chứng minh *bạn là ai*; `authorizeAdmin` chứng minh bạn *được phép*. Chúng được thiết kế để chạy theo đúng thứ tự đó.

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
> Middleware chạy **từ trái sang phải**. Trong `get("/", authenticate, authorizeAdmin, handler)`, `authenticate` chạy trước và set `req.user`; chỉ khi đó `authorizeAdmin` mới đọc `req.user.isAdmin`. Đảo ngược chúng và `authorizeAdmin` sẽ đọc một `req.user` `undefined` rồi từ chối tất cả mọi người — kể cả admin thật. Thứ tự *mã hóa quy tắc* "đăng nhập trước khi chúng tôi kiểm tra vai trò của bạn."

---

## ⚡ 5. Frontend — `authSlice` đã gắn Type

Frontend phản chiếu một lát cắt sự thật của server để UI có thể phản ứng tức thì (hiển thị username, ẩn link đăng nhập, chặn route) mà không cần một round trip. Chúng ta chỉ persist dữ liệu hiển thị **không nhạy cảm** vào `localStorage` để một lần refresh không làm người dùng bị đăng xuất về mặt hiển thị. Session thật sự chính là cookie.

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
> Chúng ta lưu `userInfo` (id, username, email, isAdmin) trong `localStorage` **thuần túy vì tiện cho UI** — nó có thể được đọc bởi bất kỳ script nào trên trang. Điều đó *chỉ* chấp nhận được vì nó không chứa credential nào. Session thật sự là cookie JWT `httpOnly`, mà JavaScript không thể đọc. Không bao giờ đặt token, password, hay bất cứ thứ gì bí mật vào `localStorage`.

---

## 🧩 6. Login & Register Form với RTK Query Mutations

Các auth endpoint là RTK Query **mutation** (chúng thay đổi server state). Các form gọi các hook được sinh ra, rồi dispatch `setCredentials` với user JSON trả về. Chúng ta gắn type cho request/response để các hook được kiểm tra đầy đủ.

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
> Luôn gọi `.unwrap()` trên một RTK Query mutation bên trong `try/catch`. Không có nó, promise sẽ resolve thành một result object chứa một field `error` rất dễ quên kiểm tra; `.unwrap()` khiến các thất bại **throw**, nên `catch` của bạn xử lý chúng một cách đáng tin cậy và nhánh thành công chỉ chạy khi thực sự thành công.

---

## 🛠️ 7. Logout — Xóa Cookie *và* Client State

Đăng xuất là một thao tác hai mặt: server phải vô hiệu hóa cookie, và client phải bỏ đi state được phản chiếu của nó. Chỉ làm một trong hai sẽ để lại một session zombie nửa-đăng-nhập.

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
> Chỉ xóa `localStorage` **không** đăng xuất được người dùng — cookie `httpOnly` vẫn còn hợp lệ và trình duyệt sẽ tiếp tục gửi nó, nên các API call được bảo vệ vẫn thành công. Bạn phải gọi endpoint `/logout` của server để làm cookie hết hạn. Ngược lại, làm cookie hết hạn mà không xóa client state sẽ để UI hiển thị một username "đã đăng nhập" cho đến khi refresh. Hãy làm cả hai.

---

## 🔒 8. Protected Routing — `<PrivateRoute>` & `<AdminRoute>`

Các layout route của React Router cho phép một guard render một `<Outlet />` (child được match) khi được phép, hoặc một redirect `<Navigate />` khi không. Đây là mẫu sạch sẽ nhất: guard bao bọc một nhóm route thay vì mỗi trang tự kiểm tra auth.

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
> `<Navigate replace />` ghi đè entry history hiện tại thay vì push một entry mới. Sau khi một người dùng đã đăng xuất bị đẩy từ `/profile` sang `/login`, việc nhấn nút **Back** của trình duyệt sẽ không đưa họ thẳng trở lại trang mà họ vừa bị từ chối — họ sẽ đáp xuống bất cứ trang nào đứng trước `/profile`. Không có `replace`, nút Back sẽ vào lại `/profile`, lập tức redirect lần nữa, và cảm giác như một vòng lặp bị hỏng.

---

## 🧠 Test Your Knowledge

Trả lời những câu hỏi sau để kiểm tra mức độ hiểu của bạn. Nhấn **Reveal Answer** để đối chiếu.

### 1. Tại sao nên chuyển việc hash password vào một Mongoose `pre("save")` hook thay vì hash bên trong register controller?

<details>
  <summary><b>Reveal Answer</b></summary>

  Tập trung việc hashing vào model đảm bảo rằng *mọi* đường code lưu một user — register, cập nhật profile, một admin chỉnh sửa một user, một seed script — đều hash password tự động. Nếu việc hashing nằm trong một controller, thì mọi đường lưu *khác* đều là nơi bạn có thể quên hash, làm rò rỉ một password plaintext vào database. Hook cũng được bảo vệ bằng `this.isModified("password")` để các cập nhật không-phải-password không vô tình hash lại một hash đã có. Đó là nguyên tắc single-responsibility áp dụng cho tính toàn vẹn dữ liệu: model sở hữu chính các invariant bảo mật của nó.
</details>

### 2. Payload của JWT chỉ là `{ userId }`. Tại sao việc phơi bày user id thì an toàn, nhưng đặt password vào payload thì không?

<details>
  <summary><b>Reveal Answer</b></summary>

  Một JWT được **ký, không phải mã hóa** — payload của nó được base64-encode và bất kỳ ai có token đều đọc được một cách dễ dàng. Chữ ký chỉ ngăn việc *giả mạo* (bạn không thể đổi `userId` hay `isAdmin` mà không làm vô hiệu chữ ký, vì bạn thiếu `JWT_SECRET`). Phơi bày user id là vô hại: nó không phải bí mật. Đặt một password (hay bất kỳ bí mật nào) vào payload sẽ phát tán nó cho bất kỳ ai chặn bắt hay decode được token. Quy tắc: payload của một JWT có thể chứa các định danh và các claim không nhạy cảm, không bao giờ chứa credential.
</details>

### 3. Một đồng đội xóa `localStorage` khi logout nhưng bỏ qua việc gọi endpoint `/logout`. Bug ở đâu?

<details>
  <summary><b>Reveal Answer</b></summary>

  Session chính là cookie JWT `httpOnly`, **không phải** `localStorage`. Việc xóa `localStorage` chỉ gỡ bỏ `userInfo` được phản chiếu của UI, nên navbar ngừng hiển thị username — nhưng cookie vẫn hợp lệ và trình duyệt tiếp tục gửi nó. Mọi request API được bảo vệ vẫn thành công, nghĩa là người dùng thực ra chưa đăng xuất. Cách sửa là gọi `/logout` của server, vốn ghi đè cookie bằng một cookie đã hết hạn (`expires: new Date(0)`), *rồi sau đó* mới xóa client state. Logout phải vô hiệu hóa session thật trên server.
</details>

### 4. Tại sao `<PrivateRoute>` và `<AdminRoute>` không đủ để làm bảo vệ *duy nhất* cho các thao tác admin?

<details>
  <summary><b>Reveal Answer</b></summary>

  Các route guard của frontend chạy trong trình duyệt, vốn hoàn toàn nằm dưới sự kiểm soát của người dùng. Chúng là UX — chúng ẩn trang và link — nhưng một người dùng có thể chỉnh sửa Redux state trong DevTools để lật `isAdmin` thành `true`, hoặc đơn giản là gọi thẳng admin API endpoint bằng `curl`/Postman, không hề tải ứng dụng React của bạn. Do đó mọi thao tác được bảo vệ cũng phải được thực thi phía server thông qua `authenticate` + `authorizeAdmin`, vốn xác minh cookie đã được ký và `isAdmin` thật từ database. Guard phía client cải thiện trải nghiệm; guard phía server cung cấp bảo mật. Bạn cần cả hai, nhưng chỉ guard server mới là một ranh giới thật sự.
</details>

### 5. Trong route `router.get("/", authenticate, authorizeAdmin, handler)`, tại sao thứ tự của hai middleware lại quan trọng?

<details>
  <summary><b>Reveal Answer</b></summary>

  Express chạy middleware từ trái sang phải. `authenticate` xác minh cookie JWT và set `req.user` từ database. `authorizeAdmin` sau đó đọc `req.user.isAdmin`. Nếu bạn đảo ngược chúng, `authorizeAdmin` sẽ thực thi trong khi `req.user` vẫn còn `undefined`, nên kiểm tra `req.user && req.user.isAdmin` thất bại và *tất cả mọi người* — kể cả admin hợp lệ — đều bị từ chối. Thứ tự mã hóa sự phụ thuộc: bạn phải thiết lập danh tính trước khi có thể đánh giá vai trò. Authentication luôn đi trước authorization.
</details>

---

## 💻 Practice Exercises

### 🛠️ Exercise 1: Thêm một endpoint kiểm tra "current user" và rehydrate từ server

`authSlice` tin tưởng `localStorage`, nhưng `localStorage` có thể trở nên cũ (ví dụ một admin đã thu hồi `isAdmin` của ai đó). Hãy thêm một server endpoint suy ra lại user từ cookie, để client có thể làm mới sự thật của nó.

**Tasks**
1. Backend: thêm `GET /api/v1/users/profile` phía sau `authenticate`. Nó nên trả về `req.user` (đã được loại bỏ password). Đấu nối nó trong `userRoutes.ts`.
2. Frontend: trong `users.ts`, thêm một **query** (không phải mutation): `getProfile: builder.query<UserInfo, void>({ query: () => ({ url: \`${USERS_URL}/profile\` }) })` và export `useGetProfileQuery`.
3. Trong một effect ở `App.tsx` cấp cao nhất, gọi `useGetProfileQuery()` khi mount; nếu nó trả về dữ liệu, `dispatch(setCredentials(data))` để ghi đè bản copy có thể đã cũ trong `localStorage` bằng sự thật của server. Nếu nó trả về 401, `dispatch(logout())`.
4. **Verify:** đăng nhập, rồi trong MongoDB set `isAdmin` của user bạn về lại `false`, refresh ứng dụng, và xác nhận các link admin biến mất vì `userInfo` được suy ra từ server giờ có `isAdmin: false`.

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

### 🛠️ Exercise 2: Thêm xử lý token expiry với một global 401 interceptor

Hiện tại một cookie hết hạn tạo ra một 401 mà mỗi component phải tự xử lý. Hãy thêm một interceptor duy nhất tự động đăng xuất người dùng khi gặp bất kỳ 401 nào, để một session hết hạn không bao giờ để lại một UI nửa-hỏng gây bối rối.

**Tasks**
1. Trong `apiSlice.ts`, bọc `fetchBaseQuery` trong một `baseQueryWithAuth` chạy base query, và nếu kết quả có `result.error?.status === 401`, dispatch `logout()` từ auth slice.
2. Dùng hàm đã bọc đó làm `baseQuery` truyền vào `createApi`.
3. **Verify:** đăng nhập, xóa thủ công cookie `jwt` trong DevTools → Application → Cookies, kích hoạt bất kỳ request được bảo vệ nào, và xác nhận bạn bị đẩy sang `/login` tự động mà không có console crash.

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
