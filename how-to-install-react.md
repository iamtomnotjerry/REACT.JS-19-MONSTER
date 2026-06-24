# How to Install and Set Up ReactJS 🚀

This guide walks you through setting up a ReactJS project from scratch. In modern web development, the classic `create-react-app` utility is officially deprecated. Instead, we use faster, optimized build tools like **Vite** or full-stack production frameworks like **Next.js**.

---

## 🛠️ Step 1: Install Node.js & npm

Before setting up React, you must install **Node.js** which automatically includes **npm** (Node Package Manager) to manage your project packages.

1. Go to the official website: [nodejs.org](https://nodejs.org/).
2. Download and install the **LTS (Long Term Support)** version for stability.
3. Open your terminal (Command Prompt, PowerShell, or Git Bash) and verify the installation:
   ```bash
   node -v
   npm -v
   ```

---

## ⚡ Method 1: Using Vite (Highly Recommended for Learning & SPAs)

Vite is a next-generation frontend tool that is extremely fast, lightweight, and pre-configured for React.

### 1. Initialize the Project

You can set up a Vite project using either the interactive prompt wizard or a quick single-line command:

#### 🔹 Option A: Interactive Wizard (Step-by-Step)
Run the following command to start the wizard:
```bash
npm create vite@latest
```
You will be prompted with the following interactive steps in your terminal:

1. **Project name:**
   - Type your desired folder name (e.g., `first-react-app`) and press **Enter**.
2. **Need to install the following packages: create-vite... Ok to proceed? (y)**
   - Press **`y`** (or just press **Enter**) to download the creator tool.
3. **Select a framework:**
   - Use the arrow keys (↓/↑) to highlight **`React`** and press **Enter**.
4. **Select a variant:**
   - Highlight **`JavaScript`** or **`TypeScript`** and press **Enter**.
5. **Use ESLint instead of Oxlint?**
   - Select **`Yes (ESLint)`** (Recommended for standard plugins and maximum ecosystem compatibility) or **`No (Oxlint)`** (for ultra-fast linting).
6. **Install with npm and start now?**
   - Select **`Yes`** (Recommended) to let Vite automatically download all packages immediately.

---

#### 🔹 Option B: Quick Setup (Bypasses Prompts)
If you want to skip all the questions and create a pre-configured React project instantly, run:
```bash
# For JavaScript template
npm create vite@latest first-react-app -- --template react

# For TypeScript template
npm create vite@latest first-react-app -- --template react-ts
```

---

### 2. Navigate and Run Your Application

Follow these commands to enter your project folder and spin up the development server:

```bash
# 1. Enter the project folder
cd first-react-app

# 2. Install dependencies (ONLY if you selected 'No' to automatic installation in Step 6 of Option A)
npm install

# 3. Start the local development server
npm run dev
```

> [!TIP]
> Once the development server starts, it will output a local URL (typically `http://localhost:5173`). Copy and paste this URL into your web browser to view your live React application!

---

## 🌐 Method 2: Using Next.js (Recommended for Full-Stack & Production Apps)

Next.js is the official React framework for building full-stack production applications. It provides Server-Side Rendering (SSR), API routes, and optimized image processing.

### 1. Run the Setup Wizard
Navigate to your workspace directory and run:
```bash
npx create-next-app@latest my-next-app
```

### 2. Select Your Preferences
Choose the following options during configuration:
- *Would you like to use TypeScript?* **Yes** (Recommended)
- *Would you like to use ESLint?* **Yes**
- *Would you like to use Tailwind CSS?* **Yes**
- *Would you like to use `src/` directory?* **Yes**
- *Would you like to use App Router?* **Yes** (Highly recommended for modern features)
- *Would you like to customize the default import alias (@/*)?* **No**

### 3. Spin Up the App
```bash
cd my-next-app
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🎨 Method 3: Direct CDN Integration (Zero-Install Scratchpad)

If you want to write React code instantly inside a single HTML file without installing any packages, you can load React via Content Delivery Networks (CDNs):

1. Create a file named `index.html`.
2. Add the following template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>React 19 CDN Demo</title>
  <!-- React & React-DOM UMD core libraries -->
  <script src="https://unpkg.com/react@19/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js" crossorigin></script>
  <!-- Babel Standalone compiler to translate JSX on the fly -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel">
    function App() {
      return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
          <h1>Hello from React 19 CDN! ⚛️</h1>
          <p>This page runs React directly inside the browser with zero build setup.</p>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
```

---

## 📌 Setup Comparison Cheat Sheet

| Use Case | Setup Choice | Create Command |
| :--- | :--- | :--- |
| **Learning core concepts & UI building** | **React + Vite** | `npm create vite@latest` |
| **Production apps, SEO-heavy sites, or APIs** | **Next.js Framework** | `npx create-next-app` |
| **Quick one-file experiments** | **CDN scripts** | *Plain HTML file* |
