# Testing UI Bất Đồng Bộ với React Testing Library & MSW 🌐

Trong một ứng dụng thực tế, hầu như không có điều gì thú vị xảy ra một cách đồng bộ. Bạn nhấn một nút, UI hiển thị spinner, một request bay đến API, và *một lúc sau* một danh sách kết quả — hoặc một banner lỗi — xuất hiện. Nếu các test của bạn chỉ assert vào lần render đầu tiên, chúng đang xác minh một màn hình mà không người dùng thực nào từng thấy. Async testing là về việc assert vào màn hình **sau khi mọi thứ đã lắng xuống**.

Bài học này bao quát hai nửa của bài toán đó. Đầu tiên, **phía query**: cách `findBy*` và `waitFor` cho phép test của bạn chờ các phần tử xuất hiện bất đồng bộ mà không cần đến các thủ thuật `setTimeout` dễ vỡ. Thứ hai, **phía network**: cách **Mock Service Worker (MSW v2)** chặn các request ở tầng network để component của bạn chạy code `fetch`/`axios` *thật* của nó với các response *giả* mà bạn kiểm soát theo từng test. Chúng ta sẽ kết thúc với một ví dụ hoàn chỉnh, có thể copy-paste: một component fetch một danh sách, được test qua toàn bộ vòng đời **loading → success → error** của nó.

> [!NOTE]
> **MSW được nhắc đến trong bộ công cụ của khóa học này** (nó xuất hiện trong phần thảo luận về design-system/Chromatic) nhưng không được dạy từng bước trong các bản ghi. Do đó đây là một **bài học testing tiêu chuẩn, hiện đại** được viết theo các best practice hiện hành: **MSW v2** (API `http` + `HttpResponse`), **Vitest**, và **React Testing Library** với `@testing-library/user-event`. Các pattern này ánh xạ 1:1 sang Jest nếu dự án của bạn dùng nó thay thế.

---

## ⚡ 1. Khái Niệm & Tổng Quan: Ba Trạng Thái của Async UI

Mọi component tải dữ liệu đều đi qua một máy trạng thái nhỏ. Ngay cả khi bạn không bao giờ viết ra chữ "máy trạng thái," JSX của bạn vẫn mã hóa một cái:

```
        ┌─────────────┐
        │   IDLE      │  (optional: before the request starts)
        └──────┬──────┘
               │ fetch begins
               ▼
        ┌─────────────┐
        │  LOADING    │  → render a spinner / skeleton
        └──────┬──────┘
        ┌──────┴───────┐
        ▼              ▼
 ┌─────────────┐ ┌─────────────┐
 │   SUCCESS   │ │    ERROR    │
 │ render data │ │ render msg  │
 └─────────────┘ └─────────────┘
```

Một bộ test hoàn chỉnh assert vào **cả ba trạng thái cuối có thể đạt tới** (loading, success, error), không chỉ happy path. Phần khó là LOADING là lần render *ban đầu* còn SUCCESS/ERROR đến *sau đó*, trong một microtask tương lai, sau khi network promise resolve. Do đó các assertion của bạn phải **nhận biết thời gian**.

### 🛠️ Một phép ẩn dụ đời thực: gọi món ở nhà hàng

Tự tay mock `fetch` giống như **hối lộ người phục vụ để đọc lại một dòng menu mà bạn viết trên khăn giấy**. Người phục vụ không bao giờ đi vào bếp, nên bạn không bao giờ test được liệu *đơn hàng* của mình (request URL, headers, query params, JSON body) có đúng không — chỉ test được rằng người phục vụ có thể đọc tờ khăn giấy của bạn. Khoảnh khắc bạn thay đổi cách đặt đơn hàng, test khăn giấy của bạn vẫn "pass" trong khi bếp thật từ chối đơn hàng.

**MSW là một cái bếp giả được lắp đặt phía sau cùng một cửa chuyển món mà bếp thật sử dụng.** Code của bạn đặt một đơn hàng thực sự qua kênh thông thường (`fetch`/`axios`), đơn hàng di chuyển đúng như cách nó sẽ làm trong production, và bếp giả trả lại một món ăn mà *bạn* đã chuẩn bị cho test này. Bạn đang test toàn bộ pipeline — xây dựng request, phân tích response, và rendering — không chỉ một tờ khăn giấy.

> [!TIP]
> Câu thần chú: **mock tại ranh giới mà bạn không sở hữu, chạy thật mọi thứ bạn sở hữu.** Bạn sở hữu logic fetch của component, việc parsing của nó, và việc rendering của nó — vậy nên hãy chạy thật tất cả chúng. Bạn không sở hữu network, vậy nên hãy mock *cái đó*. MSW vạch ranh giới đúng ngay chỗ cần.

---

## 🧩 2. `findBy*` vs `getBy*` vs `queryBy*` — Chọn Đúng Query

React Testing Library cung cấp ba *họ* query, và async testing gần như sống hoàn toàn trong họ thứ ba. Chọn sai họ là nguồn gốc phổ biến nhất của các async test không ổn định (flaky).

| Họ query | Trả về | Có chờ phần tử không? | Có throw nếu không tìm thấy? | Dùng nó để assert… |
| ------------- | ------- | ---------------------- | -------------------- | ----------------- |
| `getBy*`      | Element | **Không** (đồng bộ)   | **Có** (ngay lập tức) | một thứ **đã** ở đó *ngay bây giờ* |
| `queryBy*`    | Element \| `null` | **Không** (đồng bộ) | Không — trả về `null` | một thứ **vắng mặt** ngay lúc này |
| `findBy*`     | `Promise<Element>` | **Có** (thử lại đến hết timeout) | Có, sau timeout | một thứ sẽ **xuất hiện** sớm |

Quy tắc tư duy:

- **`findBy*`** = "xuất hiện sau." Nó thực chất là `waitFor` + `getBy` ghép lại, trả về một promise mà bạn `await`. Dùng nó cho nội dung SUCCESS/ERROR.
- **`queryBy*`** = "lẽ ra phải biến mất / không bao giờ ở đó." Nó là họ *duy nhất* trả về `null` thay vì throw, nên nó là cái bạn ghép với `.not.toBeInTheDocument()`.
- **`getBy*`** = "hiện diện đồng bộ." Dùng nó cho lần render LOADING ban đầu và cho nội dung mà bạn *đã* await để nó tồn tại.

```tsx
// LOADING: present on first synchronous render → getBy
expect(screen.getByRole('status')).toBeInTheDocument();

// SUCCESS: appears after the fetch resolves → findBy (await it!)
expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();

// The spinner should be GONE now → queryBy + .not
expect(screen.queryByRole('status')).not.toBeInTheDocument();
```

> [!WARNING]
> Một lời gọi `findBy*` trả về một **Promise**. Quên `await` nó là một lỗi kinh điển: assertion chạy trên một promise chưa settle (luôn truthy), test pass vì lý do sai, và bạn nhận được một cảnh báo `act(...)`/unhandled-rejection sau đó. **Luôn `await` mọi `findBy*`.** Một lint rule (`testing-library/await-async-queries`) bắt được lỗi này — hãy bật nó lên.

### ⚡ `waitFor` — cho các assertion không phải là "một phần tử đã xuất hiện"

`findBy*` là cú pháp đường (sugar) cho trường hợp phổ biến "một phần tử hiện ra." Khi bạn cần chờ *một thứ khác* — một mock đã được gọi, một phần tử **biến mất**, một class thay đổi — hãy dùng đến `waitFor`, nó chạy lại callback của mình cho đến khi nó ngừng throw (hoặc hết timeout).

```tsx
import { waitFor, waitForElementToBeRemoved } from '@testing-library/react';

// Wait until a side effect has happened (callback called).
await waitFor(() => expect(onLoaded).toHaveBeenCalledTimes(1));

// Wait for the spinner to be REMOVED — purpose-built helper, clearer than a manual loop.
await waitForElementToBeRemoved(() => screen.queryByRole('status'));
```

> [!TIP]
> Hãy ưu tiên `findBy*` hơn một `waitFor(() => expect(getBy...).toBeInTheDocument())` thủ công — nó ngắn hơn và cho thông báo lỗi tốt hơn. Để dành `waitFor` cho các điều kiện *không-xuất-hiện*, và giữ callback của nó **không có side-effect** và **một assertion duy nhất** để vòng lặp thử lại vẫn rẻ và lỗi không mơ hồ.

---

## 🧩 3. Tại Sao MSW Tốt Hơn Việc Tự Tay Mock `fetch`

Trước MSW, cách làm phổ biến là `vi.spyOn(global, 'fetch').mockResolvedValue(...)`. Đây là lý do tại sao cách đó già cỗi đi rất tệ còn MSW thì không.

| Vấn đề quan tâm | `fetch` mock thủ công | MSW (chặn ở tầng network) |
| ------- | ------------------- | -------------------------- |
| **Tính thực tế** | Trả về một object giả mà bạn tự nặn hình; bỏ qua lời gọi fetch thật của bạn | `fetch`/`axios` thật của bạn chạy; MSW chặn HTTP request thực |
| **Assert về request** | Bạn không dễ xác minh URL, method, headers, body có đúng không | Handlers nhận `Request` thật — assert về URL, params, body |
| **Tái sử dụng** | Bị stub lại trong mỗi test file, copy-paste, trôi dạt | Một bộ handler, dùng chung bởi tests **và** trình duyệt dev (`setupWorker`) |
| **Không phụ thuộc client** | Bị buộc vào `fetch`; vỡ nếu bạn chuyển sang `axios` | Chặn ở tầng network — `fetch`, `axios`, `ky`, tất cả chạy không đổi |
| **Sự gắn kết (coupling)** | Gắn tests vào *cách triển khai* (client bạn gọi) | Gắn tests vào *hợp đồng (contract)* (endpoint API) — refactor thoải mái |

Yếu tố quyết định là hàng cuối cùng. Mock thủ công gắn test của bạn vào *cách* bạn fetch. Đổi `fetch` sang `axios` và mọi mock đều vỡ dù hành vi giống hệt. MSW gắn test vào *endpoint nào* bạn gọi — chính là contract thực sự — nên bạn có thể refactor nội bộ client mà không phải đụng đến dù chỉ một test.

> [!NOTE]
> Trong tests (Node), MSW dùng `setupServer` và patch tầng request của Node. Trong trình duyệt (dev/Storybook) nó dùng `setupWorker` và một **Service Worker** thật. Mảng handler — `http.get(...)`, `http.post(...)` — là **giống hệt** trên cả hai, đó là lý do tại sao cùng một bộ mock vận hành cả tests *và* trải nghiệm dev cục bộ của bạn.

---

## 🛠️ 4. Cài Đặt & Đấu Nối MSW v2

```bash
# MSW and the testing stack as dev dependencies
npm i -D msw @testing-library/react @testing-library/user-event @testing-library/jest-dom

# This lesson uses Vitest + jsdom; for Jest the equivalents are jest + jest-environment-jsdom
npm i -D vitest jsdom
```

> [!WARNING]
> **MSW v2 là một bước phá vỡ hoàn toàn so với v1.** API `rest.get` / `res(ctx.json(...))` của v1 đã biến mất. v2 dùng `http.get` và một `HttpResponse.json(...)` dựa trên `Response` chuẩn. v2 cũng yêu cầu **Node 18+** và **TypeScript 4.7+**. Hãy chắc chắn bạn đang đọc tài liệu v2 — phần lớn các bài blog cũ hiển thị v1 và sẽ không biên dịch được.

### 🧩 Định nghĩa handlers một lần, ở một nơi

Một *handler* mô tả cách phản hồi cho một endpoint. Hãy giữ chúng trong một file dùng chung để tests và (tùy chọn) browser worker import cùng một nguồn chân lý duy nhất.

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

// The shape our component expects back from the API.
export interface User {
  id: number;
  name: string;
}

// Default "happy path" data returned by the success handler below.
export const usersFixture: User[] = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
];

export const handlers = [
  // Respond to GET /api/users with a 200 and JSON body.
  http.get('/api/users', () => {
    return HttpResponse.json(usersFixture, { status: 200 });
  }),
];
```

### 🧩 Node server + vòng đời

`setupServer` tạo ra interceptor. Các lifecycle hook của nó là trái tim của một bộ test đáng tin cậy — làm sai chúng và các test sẽ rò rỉ handler vào nhau.

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// One server instance, seeded with the default handlers.
export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts  (referenced from vitest.config setupFiles)
import { afterAll, afterEach, beforeAll } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { server } from '../mocks/server';

// Start intercepting before any test runs. `onUnhandledRequest: 'error'`
// makes a request to an UNMOCKED endpoint fail loudly instead of hitting
// the real network — a great safety net.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any per-test overrides (server.use) back to the defaults after EACH
// test, so an error-case override in one test can't leak into the next.
afterEach(() => server.resetHandlers());

// Stop the interceptor once the whole file is done — clean teardown.
afterAll(() => server.close());
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // give tests a DOM (document, window)
    globals: true,                 // describe/it/expect without imports
    setupFiles: ['./src/test/setup.ts'], // runs the MSW lifecycle above
  },
});
```

> [!TIP]
> Hãy ghi nhớ bộ ba vòng đời là **listen / reset / close** ánh xạ tới **beforeAll / afterEach / afterAll**. Cái ở giữa — `resetHandlers` trong `afterEach` — là cái mọi người quên, và quên nó chính là cách một error override `server.use(...)` âm thầm đầu độc test tiếp theo. Hãy đặt nó vào `setup.ts` một lần và không bao giờ phải nghĩ về nó nữa.

---

## 🛠️ 5. Component Đang Được Test

Một component nhỏ, thực tế: nó fetch users khi mount và render các trạng thái loading / success / error. Được gõ kiểu đầy đủ, không có placeholder.

```tsx
// src/components/UserList.tsx
import { useEffect, useState } from 'react';
import type { User } from '../mocks/handlers';

// A discriminated union models the three states precisely — TypeScript then
// forces us to handle each branch, mirroring the state machine from section 1.
type Status =
  | { phase: 'loading' }
  | { phase: 'success'; users: User[] }
  | { phase: 'error'; message: string };

export function UserList() {
  const [status, setStatus] = useState<Status>({ phase: 'loading' });

  useEffect(() => {
    // AbortController lets us cancel the request if the component unmounts
    // mid-flight, avoiding a "set state on unmounted component" situation.
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/users', { signal: controller.signal });

        // fetch only rejects on network failure, NOT on 4xx/5xx — so we must
        // check res.ok ourselves and convert a bad status into an error state.
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const users = (await res.json()) as User[];
        setStatus({ phase: 'success', users });
      } catch (err) {
        // Ignore the abort that we triggered ourselves on unmount.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setStatus({ phase: 'error', message });
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  if (status.phase === 'loading') {
    // role="status" is an ARIA live region — the accessible, queryable way to
    // expose a spinner. Tests find it with getByRole('status').
    return <p role="status">Loading users…</p>;
  }

  if (status.phase === 'error') {
    // role="alert" announces errors to assistive tech and is easy to query.
    return <p role="alert">Something went wrong: {status.message}</p>;
  }

  if (status.users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <ul aria-label="users">
      {status.users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

> [!NOTE]
> Lưu ý rằng component dùng các **accessible role** (`status`, `alert`, `aria-label` của list) thay vì các `data-testid` chỉ dành cho test. Nguyên tắc dẫn đường của RTL là query theo cách một người dùng (hoặc screen reader) cảm nhận UI. Điều này làm cho tests bền bỉ trước các lần refactor *và* thúc đẩy bạn hướng tới markup dễ tiếp cận — một mũi tên trúng hai đích.

---

## 🛠️ 6. Bài Test Đầy Đủ: Loading → Success → Error

Đây là phần thưởng. Một file, ba trạng thái, mỗi cái được điều khiển bởi MSW.

```tsx
// src/components/UserList.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../mocks/server';
import { UserList } from './UserList';

describe('<UserList />', () => {
  it('shows a loading indicator on first render', () => {
    // Add a small delay so the loading state is observable before the
    // response resolves. Without it the success state can win the race.
    server.use(
      http.get('/api/users', async () => {
        await delay(50);
        return HttpResponse.json([{ id: 1, name: 'Ada Lovelace' }]);
      }),
    );

    render(<UserList />);

    // getBy*: the spinner is present synchronously on the very first render.
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading users…')).toBeInTheDocument();
  });

  it('renders the fetched users on success', async () => {
    // No server.use() here → the DEFAULT happy-path handler from handlers.ts
    // (Ada Lovelace + Alan Turing) is used.
    render(<UserList />);

    // findBy*: wait for the list items that appear AFTER the fetch resolves.
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();

    // The list itself is queryable by its accessible name.
    expect(screen.getByRole('list', { name: 'users' })).toBeInTheDocument();

    // queryBy* + .not: the spinner must be GONE once data has arrived.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an error message when the API returns 500', async () => {
    // Override the default handler FOR THIS TEST ONLY. afterEach's
    // resetHandlers() (in setup.ts) restores the default afterward.
    server.use(
      http.get('/api/users', () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    render(<UserList />);

    // findByRole('alert') waits for the error branch to render.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Request failed with status 500');

    // We never reached success: no list, and the spinner is gone.
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an empty-state message when the API returns no users', async () => {
    // Override with a valid 200 but an EMPTY array to hit the empty branch.
    server.use(
      http.get('/api/users', () => HttpResponse.json([], { status: 200 })),
    );

    render(<UserList />);

    expect(await screen.findByText('No users found.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('builds the request against the correct endpoint', async () => {
    // MSW handlers receive the REAL Request — proof the contract is honored.
    let calledUrl = '';
    server.use(
      http.get('/api/users', ({ request }) => {
        calledUrl = new URL(request.url).pathname;
        return HttpResponse.json([{ id: 1, name: 'Ada Lovelace' }]);
      }),
    );

    render(<UserList />);
    await screen.findByText('Ada Lovelace');

    // This assertion is IMPOSSIBLE with a naive fetch stub — it verifies the
    // component actually placed the order at /api/users.
    expect(calledUrl).toBe('/api/users');
  });
});
```

### ⚡ Giải phẫu ba nước đi MSW chủ chốt

```tsx
// 1) DEFAULT handler (handlers.ts) → the success path used when no override.
http.get('/api/users', () => HttpResponse.json(usersFixture));

// 2) PER-TEST override for errors → server.use() takes precedence this test.
server.use(http.get('/api/users', () => new HttpResponse(null, { status: 500 })));

// 3) PER-TEST override for empty/edge data → same mechanism, different body.
server.use(http.get('/api/users', () => HttpResponse.json([])));
```

`server.use()` **chèn lên đầu (prepend)** một handler thắng các handler mặc định, nhưng chỉ cho đến khi `server.resetHandlers()` chạy trong `afterEach`. Đúng một dòng đó trong `setup.ts` là thứ đảm bảo tính cô lập của test — mỗi test bắt đầu từ bộ mặc định sạch sẽ.

> [!WARNING]
> Một race tinh vi: nếu mock của bạn resolve *tức thì*, React có thể flush lần render success trước khi assertion `getByRole('status')` của bạn chạy, nên test loading thất bại không liên tục. Hãy thêm một `await delay(...)` nhỏ (từ `msw`) trong handler của trạng thái loading — như đã thể hiện ở trên — để làm cho cửa sổ loading có tính tất định. Đừng thêm `setTimeout` thật vào component của bạn để "sửa" điều này; hãy sửa nó trong *mock*.

> [!TIP]
> Khi một *hành động* của người dùng kích hoạt fetch (ví dụ, nhấn "Load"), hãy điều khiển nó bằng `userEvent` và `await` tương tác đó: `const user = userEvent.setup(); await user.click(screen.getByRole('button', { name: /load/i }));`. `userEvent` đã bọc các tương tác trong `act` sẵn, nên bạn sẽ không thấy cảnh báo act — sau đó tiếp tục với assertion `findBy*` của bạn như thường lệ.

---

## 🧠 Kiểm Tra Kiến Thức Của Bạn

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  **Q1. Test của bạn làm `expect(screen.findByText('Done')).toBeInTheDocument()` và nó pass dù "Done" không bao giờ render. Tại sao, và cách sửa là gì?**

  `findByText` trả về một **Promise**, và bạn không bao giờ `await` nó. Một object Promise luôn truthy, nên `toBeInTheDocument()` đang được gọi trên *promise* (chứ không phải một element) và về cơ bản bị chập mạch (short-circuit), hoặc `jest-dom` khớp lỏng lẻo và pass vì lý do sai — trong khi đó assertion thật sự không bao giờ chạy. Cách sửa là `expect(await screen.findByText('Done')).toBeInTheDocument()`. Hãy bật ESLint rule `testing-library/await-async-queries` để lỗi này bị bắt tự động.
</details>

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  **Q2. Khi nào bạn nên dùng `getBy*`, `queryBy*`, và `findBy*` trong một async test?**

  Dùng **`getBy*`** cho nội dung hiện diện ở **lần render đồng bộ đầu tiên** (loading spinner) — nó throw ngay lập tức nếu thiếu. Dùng **`findBy*`** cho nội dung **xuất hiện sau** khi một promise resolve (success list, error alert) — nó trả về một promise thử lại đến hết timeout, nên bạn `await` nó. Dùng **`queryBy*`** để assert **sự vắng mặt** (`expect(screen.queryByRole('status')).not.toBeInTheDocument()`) vì nó là họ duy nhất trả về `null` thay vì throw.
</details>

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  **Q3. Tại sao `server.resetHandlers()` trong `afterEach` lại quan trọng đến vậy?**

  Bởi vì `server.use()` thêm các **override theo từng test** được ưu tiên hơn các handler mặc định và nếu không sẽ tồn tại cho phần còn lại của file. Nếu một test override `/api/users` để trả về 500 và bạn không bao giờ reset, thì test *tiếp theo* cũng nhận 500 dù nó mong đợi happy path — một handler rò rỉ gây ra một thất bại khó hiểu, phụ thuộc thứ tự. `resetHandlers()` khôi phục bộ handler mặc định ban đầu sau mỗi test, đảm bảo tính cô lập. Bộ ba là `listen()`/`resetHandlers()`/`close()` trong `beforeAll`/`afterEach`/`afterAll`.
</details>

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  **Q4. Hãy nêu hai thứ cụ thể mà MSW cho phép bạn test mà một stub `vi.spyOn(global, 'fetch')` làm cho khó hoặc bất khả thi.**

  (1) **Tính đúng đắn của request** — MSW handlers nhận `Request` thật, nên bạn có thể assert component đã gọi đúng **URL, method, query params, headers, và body**. Một fetch stub trả về một giá trị bất kể request được xây dựng như thế nào (hay có được xây dựng hay không), nên nó không thể xác minh đơn hàng được đặt đúng. (2) **Độc lập với client** — MSW chặn ở tầng network, nên cùng một bộ mock chạy được dù bạn dùng `fetch`, `axios`, hay `ky`; chuyển client là một lần refactor mà tests của bạn không nhận ra. Một `fetch` stub bị gắn cụ thể vào `fetch` và vỡ khi refactor đó. (Thưởng thêm: MSW handlers tái sử dụng được trên cả tests *và* trình duyệt dev qua `setupWorker`.)
</details>

<details>
  <summary><b>Hiện Đáp Án</b></summary>

  **Q5. Test "shows loading spinner" của bạn bị flaky — nó pass cục bộ nhưng fail trong CI. Mock trả về tức thì. Điều gì đang xảy ra và bạn sửa nó thế nào mà không thay đổi component?**

  Mock resolve nhanh đến mức React flush lần render **success** trước khi assertion đồng bộ `getByRole('status')` của bạn chạy, nên spinner đã biến mất rồi. Đó là một race giữa microtask của promise đã resolve và assertion của bạn. Cách sửa nằm trong **mock**, không phải component: thêm một `await delay(50)` nhỏ (import từ `msw`) bên trong handler của trạng thái loading để có một cửa sổ tất định nơi trạng thái loading quan sát được. Đừng bao giờ thêm timer thật vào code production chỉ để làm cho một test pass — đó là sửa sai tầng.
</details>

---

## 💻 Bài Tập Thực Hành

### 🧩 Bài Tập 1 — Test một search box fetch khi submit

Xây dựng và test một component `UserSearch`: nó có một text input và một nút "Search". Khi submit nó fetch `/api/users?q=<query>` và render các tên khớp, hoặc một thông báo "No matches". Hãy viết các test mà (a) điều khiển tương tác bằng `userEvent`, (b) assert request mang đúng query param `q` qua một MSW handler, và (c) bao quát cả response khớp và không khớp.

**Khởi đầu:**

```tsx
// src/components/UserSearch.tsx
import { useState, type FormEvent } from 'react';
import type { User } from '../mocks/handlers';

export function UserSearch() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[] | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: fetch `/api/users?q=${encodeURIComponent(query)}`,
    // parse JSON into User[], and store it in `users` state.
    const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
    setUsers((await res.json()) as User[]);
  }

  return (
    <form onSubmit={handleSubmit} aria-label="user search">
      <label htmlFor="q">Search</label>
      <input id="q" value={query} onChange={(e) => setQuery(e.target.value)} />
      <button type="submit">Search</button>
      {users && users.length === 0 && <p>No matches.</p>}
      {users && users.length > 0 && (
        <ul aria-label="results">
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
```

```tsx
// src/components/UserSearch.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { UserSearch } from './UserSearch';

describe('<UserSearch />', () => {
  it('passes the typed query as the q param and renders matches', async () => {
    let receivedQuery: string | null = null;
    server.use(
      http.get('/api/users', ({ request }) => {
        // TODO: read the `q` search param from the request URL into receivedQuery.
        receivedQuery = new URL(request.url).searchParams.get('q');
        return HttpResponse.json([{ id: 1, name: 'Ada Lovelace' }]);
      }),
    );

    const user = userEvent.setup();
    render(<UserSearch />);

    await user.type(screen.getByLabelText('Search'), 'ada');
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(receivedQuery).toBe('ada'); // verify the request contract
  });

  it('shows a no-match message when the API returns an empty array', async () => {
    // TODO: server.use() an override returning HttpResponse.json([]),
    // submit the form, and assert "No matches." appears via findByText.
  });
});
```

### 🧩 Bài Tập 2 — Thêm đường "retry"

Mở rộng `UserList` ban đầu để trạng thái error render một nút **"Retry"** chạy lại fetch. Sau đó viết một test mà: đầu tiên trả về 500 (assert alert + nút retry xuất hiện), rồi `server.use()` một success handler *mới*, nhấn Retry, và assert list cuối cùng render ra. Bài này luyện việc tráo handler giữa chừng test và xác minh component của bạn phục hồi sau thất bại.

**Gợi ý:**
- Tách logic fetch ra thành một callback `loadUsers()` mà bạn có thể gọi từ cả `useEffect` lẫn `onClick` của Retry.
- Sau lần 500 đầu tiên, gọi `server.use(http.get('/api/users', () => HttpResponse.json(usersFixture)))` *trước khi* nhấn Retry để request thứ hai trúng success handler.
- Dùng `await screen.findByRole('button', { name: /retry/i })` để chờ error UI, rồi `await user.click(...)`, rồi `await screen.findByText('Ada Lovelace')`.

> [!TIP]
> Nếu một retry test cảm thấy racy, hãy nhớ bài học loading-spinner: cho các override của bạn một `delay()` nhỏ khi bạn cần quan sát một trạng thái trung gian, và dựa vào `findBy*`/`waitFor` thay vì đoán mò thời gian. Mock tất định luôn thắng `setTimeout`.
