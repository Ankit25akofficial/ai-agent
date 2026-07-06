# 🎨 ai Agent Frontend

This directory contains the React 19 + TypeScript + Tailwind CSS v4.0 client dashboard for the **ai Agent** Equity Research System.

For complete project documentation, overview, and architectural highlights, see the [Workspace README](file:///c:/AI%20Product/README.md).

---

## 🛠️ Frontend Scripts

### Start Development Server
```bash
npm run dev
```
Launches the Vite dev server with hot module replacement (HMR) at `http://localhost:5173`.

### Build for Production
```bash
npm run build
```
Compiles and bundles the application for production deployment. Generates static assets inside the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Serves the locally built `dist/` production folder for testing.

---

## 📁 Key Technical Features
* **Tailwind v4.0**: Customized color themes and keyframe pulse animations declared inside [src/index.css](file:///c:/AI%20Product/frontend/src/index.css).
* **TypeScript Types**: Defined types for reports and rendering states.
* **Gooey Search Input**: Primed with a custom `Enter` submission action wrapper.
* **Sandbox-Safe Inline Confirmation**: Native inline "Yes" / "No" controls for deleting historical cards.
