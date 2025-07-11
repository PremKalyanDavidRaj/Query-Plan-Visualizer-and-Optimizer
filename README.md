Here’s an updated **README.md** that combines all the technologies you’ve mentioned, along with the additional features and setup instructions:

````markdown
# Query Plan Visualizer & Optimizer

An interactive educational tool that helps users understand database query execution and optimization strategies through side-by-side visualizations of naive and optimized execution plans. The tool allows for interactive SQL queries, execution plan visualization, and experimentation with optimization techniques.

## 🚀 Features

- ✍️ **SQL Query Editor**: Write SQL queries and instantly see their execution plans.
- 🔍 **Compare Naive and Optimized Execution Plans**: View both the original (naive) and optimized query execution plans side by side.
- 📊 **Interactive D3-based Plan Tree Visualizations**: Query execution plans are displayed as interactive tree structures to facilitate understanding.
- ⚙️ **Toggle Optimization Rules**: Experiment with various optimization techniques, such as:
  - Join Reordering
  - Selection Pushdown
  - Index Selection
- 📤 **Export Execution Plan Comparison as JSON**: Save the comparison between naive and optimized plans for further analysis.
- 🎨 **Dark Mode & Responsive UI**: The tool offers a modern UI with dark mode support for better usability and responsiveness.

## 🛠️ Technologies

### **Frontend:**
- **React**: A JavaScript library for building user interfaces, providing a dynamic, component-based architecture.
- **TypeScript**: A statically typed superset of JavaScript that helps with error checking and better maintainability.
- **Vite**: A fast and modern build tool that serves the app during development with hot module replacement.
- **Tailwind CSS**: A utility-first CSS framework for styling the UI components rapidly.
- **D3.js**: A JavaScript library for producing dynamic, interactive data visualizations in the browser, used for rendering the execution plan trees.
- **CodeMirror**: A versatile in-browser code editor that is used for writing SQL queries.
- **Zustand**: A small, fast state management solution to handle application state with minimal boilerplate.
- **React Toastify**: A simple library for showing toast notifications in the app, used to display success or error messages.

### **Backend (C++):**
- **C++**: Core language used to implement the query plan optimization and parsing logic.
- **libpqxx**: A C++ library to interact with PostgreSQL and retrieve query execution plans.
- **Graphviz**: For visualizing query execution trees in graphical formats such as PNG or SVG.
- **nlohmann/json**: A C++ library used to parse and handle JSON query plans.

## 📦 Installation

To set up the project locally, follow these steps:

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/PremKalyanDavidRaj/Query-Plan-Visualizer-and-Optimizer.git
   cd Query-Plan-Visualizer-and-Optimizer
````

2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   This will start the frontend application on [http://localhost:3000](http://localhost:3000).

### Backend Setup (C++)

1. Make sure you have **PostgreSQL** installed and running, as the backend relies on it to fetch query plans.

2. Install C++ dependencies:

   * **libpqxx**: C++ client library for PostgreSQL.
   * **Graphviz**: For rendering query plan trees.
   * **nlohmann/json**: For parsing JSON query plans.

3. Build the C++ code:

   * Set up the project directory with source and include files for C++ code.
   * Use **CMake** to compile the C++ components.

4. Ensure the C++ components are integrated with the frontend, allowing the submission of SQL queries and receiving execution plans in real-time.

## 💡 Usage

1. **SQL Query Editor**: Use the SQL query editor to write and execute SQL queries. The execution plans for both the naive and optimized versions will be shown side by side.

2. **Visualize Execution Plan**: The execution plans will be visualized as interactive trees, allowing users to explore how each query step is executed.

3. **Optimization**: Toggle different optimization strategies to see how they impact the execution plan. You can experiment with:

   * **Join Reordering**
   * **Selection Pushdown**
   * **Index Selection**

4. **Export Plans**: After comparing the naive and optimized execution plans, you can export the comparison as a JSON file for further analysis or sharing.

## 👨‍💻 Contributing

We welcome contributions! If you'd like to contribute, feel free to fork the repository and submit pull requests. Please follow the steps below:

1. Fork the repository.
2. Create a new branch for your changes.
3. Make your changes and test thoroughly.
4. Submit a pull request.

````
