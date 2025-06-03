import { create } from 'zustand';
import { AppState, OptimizationRule, QueryPlan } from '../types';
import { generateNaivePlan, optimizePlan } from '../utils/queryPlanner';
import { sampleQueries } from '../data/sampleQueries';
import { parseSql } from '../utils/sqlParser';

export const useAppStore = create<AppState>((set, get) => ({
  sqlQuery: 'SELECT * FROM customers JOIN orders ON customers.id = orders.customer_id WHERE orders.total > 100;',
  setSqlQuery: (query: string) => set({ sqlQuery: query }),
  
  naivePlan: null,
  optimizedPlan: null,
  
  generateQueryPlans: (query: string) => {
    try {
      // First validate/parse the SQL
      const parseResult = parseSql(query);
      
      if (!parseResult.valid) {
        console.error("SQL parsing error:", parseResult.error);
        return;
      }
      
      // Generate naive execution plan
      const naivePlan = generateNaivePlan(query);
      
      // Apply enabled optimization rules to generate optimized plan
      const enabledRules = get().optimizationRules
        .filter(rule => rule.enabled)
        .map(rule => rule.id);
      
      const optimizedPlan = optimizePlan(naivePlan, enabledRules);
      
      set({
        naivePlan,
        optimizedPlan
      });
    } catch (error) {
      console.error("Error generating query plans:", error);
    }
  },
  
  optimizationRules: [
    {
      id: 'join_reordering',
      name: 'Join Reordering',
      description: 'Reorders joins based on table sizes and selectivity',
      enabled: true
    },
    {
      id: 'selection_pushdown',
      name: 'Selection Pushdown',
      description: 'Pushes filters down the query plan to reduce intermediate result sizes',
      enabled: true
    },
    {
      id: 'index_selection',
      name: 'Index Selection',
      description: 'Uses available indexes for faster data access',
      enabled: true
    },
    {
      id: 'join_method_selection',
      name: 'Join Method Selection',
      description: 'Chooses between nested loop, hash, or merge join',
      enabled: true
    }
  ],
  
  toggleOptimizationRule: (id: string) => {
    set(state => ({
      optimizationRules: state.optimizationRules.map(rule =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    }));
    
    // Regenerate optimized plan when rules change
    const { sqlQuery, naivePlan } = get();
    if (naivePlan) {
      const enabledRules = get().optimizationRules
        .filter(rule => rule.enabled)
        .map(rule => rule.id);
      
      const optimizedPlan = optimizePlan(naivePlan, enabledRules);
      set({ optimizedPlan });
    }
  },
  
  theme: 'dark',
  toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  
  sampleQueries,
  loadSampleQuery: (id: string) => {
    const query = sampleQueries.find(q => q.id === id);
    if (query) {
      set({ sqlQuery: query.query });
      get().generateQueryPlans(query.query);
    }
  }
}));