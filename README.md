# StockSync

<p align="center">
    <img width="1768" height="363" alt="image" src="https://github.com/user-attachments/assets/a4e910fb-0640-46af-9fa8-965e04ef403e" />
</p>

StockSync is a data processor and analytics engine tailored specifically for proprietary inventory management methods, but
due to my personnal love to open source, i have made it public in hopes that it might help or inspire someone or something.
(free github actions might also be a strong reason)

### 2. Launch the Application

You can run the app in development mode or create a production build.

**For Development:**

```bash
bun electron:dev
```

**For Production Build:**

```bash
bun build:all
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

> **Note:** Ensure you have your Python environment configured and all dependencies listed in requirements.txt in both backend\ and updater\ are installed before running `bun build:all` to avoid path errors.

---
