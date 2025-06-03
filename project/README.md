# Query Plan Visualizer & Optimizer

An interactive educational tool to help users understand database query execution and optimization strategies through side-by-side visualizations of naive and optimized execution plans.

## 🚀 Features

- ✍️ SQL query editor (powered by CodeMirror)
- 🔍 View both naive and optimized query execution plans
- 📊 Interactive D3-based plan tree visualizations
- ⚙️ Toggle optimization rules (Join Reordering, Selection Pushdown, Index Selection, etc.)
- 📤 Export execution plan comparison as JSON
- 🎨 Dark mode & responsive UI

## 🛠️ Technologies

- React + TypeScript + Vite
- Zustand (state management)
- Tailwind CSS
- D3.js (for tree visualization)
- CodeMirror (SQL editor)
- React Toastify (notifications)

## 📦 Installation

```bash
git clone https://github.com/PremKalyanDavidRaj/Query-Plan-Visualizer-and-Optimizer.git
cd project
npm install
npm run dev
