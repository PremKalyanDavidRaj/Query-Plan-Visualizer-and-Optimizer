import React, { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppStore } from './store/appStore';
import Navbar from './components/Navbar';
import QueryInput from './components/QueryInput';
import PlanVisualizer from './components/PlanVisualizer';
import OptimizationPanel from './components/OptimizationPanel';
import ComparisonView from './components/ComparisonView';
import SchemaViewer from './components/SchemaViewer';
import { Info } from 'lucide-react';

function App() {
  const { 
    sqlQuery, 
    generateQueryPlans,
    theme
  } = useAppStore();
  
  // Generate initial query plan when app first loads
useEffect(() => {
  if (sqlQuery) {
    generateQueryPlans(sqlQuery);
  }
}, [sqlQuery]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Introduction Section */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-start">
              <Info className="flex-shrink-0 h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  About This Tool
                </h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-200">
                  <p>
                    This query plan visualizer helps you understand how databases execute SQL queries and how different optimization techniques affect performance. 
                    Enter an SQL query, view the naive execution plan, and see how optimization rules improve efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QueryInput />
            </div>
            
            <div className="lg:col-span-1">
              <OptimizationPanel />
            </div>
          </div>
          
          <ComparisonView />
          
          <div className="mt-6">
            <SchemaViewer />
          </div>
        </main>
        
        {/* Toast container for notifications */}
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
}

export default App;