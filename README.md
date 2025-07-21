# Query Plan Visualizer and Optimizer

A tool to parse and visualize PostgreSQL query execution plans, helping developers understand and optimize database performance.

## 🚀 Features
- Parses `EXPLAIN (ANALYZE, VERBOSE)` output from PostgreSQL
- Visualizes the execution plan as a tree
- Highlights cost-heavy nodes for easy optimization
- Suggests heuristic improvements based on query structure

## 🛠️ Technologies Used
- C++
- TypeScript
- PostgreSQL
- D3.js (for future visualization support)


## 📂 Structure
/src
├── parser.cpp
├── visualizer.ts
└── ...

markdown
Copy
Edit

## 📈 Optimization Strategy
Inspired by network routing heuristics:
- Prioritizes node cost
- Compares nested loop joins vs. hash joins
- Suggests alternate join orderings

## 📋 Usage
1. Run a query in PostgreSQL with `EXPLAIN (ANALYZE, VERBOSE)`
2. Copy the output to a file `plan.txt`
3. Run the parser:
```bash
./qpv plan.txt

Author
Prem Kalyan David Raj
MS in Information Technology
