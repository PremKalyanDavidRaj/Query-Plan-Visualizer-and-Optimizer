export type OperationType = 
  | 'Scan' 
  | 'Filter' 
  | 'Join' 
  | 'Sort' 
  | 'Aggregate' 
  | 'Project' 
  | 'GroupBy'
  | 'HashJoin'
  | 'NestedLoopJoin'
  | 'MergeJoin'
  | 'IndexScan';

export interface PlanNode {
  id: string;
  type: OperationType;
  description: string;
  cost: number;
  cardinality: number;
  children: PlanNode[];
  table?: string;
  condition?: string;
  columns?: string[];
  index?: string;
  details?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface DatabaseTable {
  name: string;
  columns: Column[];
  rowCount: number;
}

export interface Column {
  name: string;
  type: string;
  hasIndex: boolean;
}

export interface QueryPlan {
  rootNode: PlanNode;
  totalCost: number;
  estimatedRows: number;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  sqlQuery: string;
  setSqlQuery: (query: string) => void;
  naivePlan: QueryPlan | null;
  optimizedPlan: QueryPlan | null;
  generateQueryPlans: (query: string) => void;
  optimizationRules: OptimizationRule[];
  toggleOptimizationRule: (id: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  sampleQueries: SampleQuery[];
  loadSampleQuery: (id: string) => void;
}

export interface SampleQuery {
  id: string;
  name: string;
  description: string;
  query: string;
}