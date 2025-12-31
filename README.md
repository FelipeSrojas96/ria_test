Here’s a clearer **README-style** section for installing and running a **React + Vite** app.

---

# Weather app (React + Vite)

## Prerequisites

1. **Install Node.js (LTS recommended)**

   * Verify it’s installed:

   ```bash
   node -v
   npm -v
   ```

   You should see version numbers.

---

## Setup (first time)

1. **Download / clone the project**

   ```bash
   git clone <your-repo-url>
   cd <your-project-folder>
   ```


2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create the environment file**
   In the project root (same level as `package.json`), create a file named **`.env`** and add:

   ```bash
   VITE_OWM_API_KEY=YOUR_OPENWEATHERMAP_KEY
   ```


---

## Run the app (development)

Start the Vite dev server:

```bash
npm run dev
```

Vite will print a local URL in the terminal, usually:

* `http://localhost:5173/`


---


