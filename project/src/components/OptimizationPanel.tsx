import React from 'react';
import { useAppStore } from '../store/appStore';
import { Settings, Info } from 'lucide-react';

const OptimizationPanel: React.FC = () => {
  const { 
    optimizationRules, 
    toggleOptimizationRule,
    naivePlan,
    optimizedPlan
  } = useAppStore();

  const calculateImprovement = (): number => {
    if (!naivePlan || !optimizedPlan) return 0;
    
    const improvement = ((naivePlan.totalCost - optimizedPlan.totalCost) / naivePlan.totalCost) * 100;
    return Math.max(0, Math.round(improvement * 10) / 10); // Round to 1 decimal place
  };

  const improvement = calculateImprovement();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center">
        <Settings size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Optimization Rules</h2>
      </div>
      
      <div className="p-4">
        {optimizationRules.map(rule => (
          <div key={rule.id} className="mb-3 last:mb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleOptimizationRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </label>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {rule.name}
                </span>
              </div>
              <div className="group relative">
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150">
                  <Info size={16} />
                </button>
                <div className="absolute z-10 right-0 mt-2 w-64 px-4 py-3 bg-white dark:bg-gray-700 text-sm rounded-md shadow-lg text-gray-700 dark:text-gray-300 invisible group-hover:visible transition-opacity duration-150 ease-in-out">
                  {rule.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {naivePlan && optimizedPlan && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700 dark:text-gray-300">Performance Improvement:</span>
            <div className={`text-sm font-medium px-3 py-1 rounded-full ${
              improvement > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              improvement > 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {improvement}%
            </div>
          </div>
          
          <div className="mt-2">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, improvement)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Naive Cost: {naivePlan.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Optimized Cost: {optimizedPlan.totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizationPanel;