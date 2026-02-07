# StockSync

StockSync is a high-performance data processor and analytics generator desktop application.

## 🚀 Quick Start

To get the development environment up and running, follow these steps:

### 1. Build Python Dependencies

First, ensure the Python components are compiled and ready:

```bash
bun build:py

```

### 2. Launch the Application

You can run the app in development mode or create a production build.

**For Development:**

```bash
bun electron:dev

```

**For Production Build:**

```bash
bun electron:build

```

---

## 📂 Distribution & Execution

After running the build command, your packaged application will be located in the distribution folder.

* **Path:** `dist_electron/`
* **Action:** Navigate to this folder and run the executable corresponding to your OS.

---

## 🛠 Tech Stack

* **Runtime:** [Bun](https://bun.sh/)
* **Framework:** [Electron](https://www.electronjs.org/)
* **Backend Logic:** Python
* **Package Manager:** Bun

## 📝 Development Notes

> **Note:** Ensure you have your Python environment configured and all global dependencies installed before running `bun build:py` to avoid path errors.

---
