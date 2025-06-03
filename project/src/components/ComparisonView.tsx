import React, { useState } from 'react';
import PlanVisualizer from './PlanVisualizer';
import { useAppStore } from '../store/appStore';
import { ArrowLeftRight, Download, ChevronRight, ChevronDown, FileText } from 'lucide-react';

const ComparisonView: React.FC = () => {
  const { naivePlan, optimizedPlan } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);
  
  // Function to export plans as JSON
  const exportPlans = () => {
    if (!naivePlan || !optimizedPlan) return;
    
    const exportData = {
      naive: naivePlan,
      optimized: optimizedPlan,
      improvement: {
        costReduction: naivePlan.totalCost - optimizedPlan.totalCost,
        percentageImprovement: ((naivePlan.totalCost - optimizedPlan.totalCost) / naivePlan.totalCost) * 100
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_plan_comparison.json';
    a.click();
    
    URL.revokeObjectURL(url);
  };
  
  // Generate comparison details
  const generateComparisonDetails = () => {
    if (!naivePlan || !optimizedPlan) return [];
    
    const details = [];
    
    // Cost comparison
    details.push({
      title: 'Cost Reduction',
      description: `Reduced cost from ${naivePlan.totalCost.toFixed(2)} to ${optimizedPlan.totalCost.toFixed(2)}, 
                   a ${((naivePlan.totalCost - optimizedPlan.totalCost) / naivePlan.totalCost * 100).toFixed(1)}% improvement`
    });
    
    // Join type differences
    const naiveJoinTypes = countNodeTypes(naivePlan.rootNode, ['Join', 'NestedLoopJoin', 'HashJoin', 'MergeJoin']);
    const optimizedJoinTypes = countNodeTypes(optimizedPlan.rootNode, ['Join', 'NestedLoopJoin', 'HashJoin', 'MergeJoin']);
    
    if (JSON.stringify(naiveJoinTypes) !== JSON.stringify(optimizedJoinTypes)) {
      details.push({
        title: 'Join Method Optimization',
        description: `Changed join methods from ${formatJoinTypes(naiveJoinTypes)} to ${formatJoinTypes(optimizedJoinTypes)}`
      });
    }
    
    // Index usage
    const naiveIndexScans = countNodeTypes(naivePlan.rootNode, ['IndexScan']);
    const optimizedIndexScans = countNodeTypes(optimizedPlan.rootNode, ['IndexScan']);
    
    if (optimizedIndexScans.IndexScan > naiveIndexScans.IndexScan) {
      details.push({
        title: 'Index Usage',
        description: `Increased index usage from ${naiveIndexScans.IndexScan} to ${optimizedIndexScans.IndexScan} index scans`
      });
    }
    
    // Filter push-down
    const naiveFilters = countNodeTypes(naivePlan.rootNode, ['Filter']);
    const optimizedFilters = countNodeTypes(optimizedPlan.rootNode, ['Filter']);
    
    if (naiveFilters.Filter !== optimizedFilters.Filter) {
      details.push({
        title: 'Filter Optimization',
        description: `Changed filter placement or count from ${naiveFilters.Filter} to ${optimizedFilters.Filter}`
      });
    }
    
    return details;
  };
  
  const countNodeTypes = (node: any, types: string[]) => {
    const result: Record<string, number> = types.reduce((acc, type) => ({ ...acc, [type]: 0 }), {});
    
    const traverse = (n: any) => {
      if (!n) return;
      
      if (types.includes(n.type)) {
        result[n.type]++;
      }
      
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return result;
  };
  
  const formatJoinTypes = (joinTypes: Record<string, number>) => {
    return Object.entries(joinTypes)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };
  
  const details = generateComparisonDetails();
  
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <PlanVisualizer 
        plan={naivePlan} 
        title="Naive Execution Plan" 
        className="col-span-full md:col-span-1"
      />
      <PlanVisualizer 
        plan={optimizedPlan} 
        title="Optimized Execution Plan" 
        className="col-span-full md:col-span-1"
      />
      
      {naivePlan && optimizedPlan && (
        <div className="col-span-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
            <div 
              className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
              onClick={() => setShowDetails(!showDetails)}
            >
              <div className="flex items-center">
                <ArrowLeftRight size={18} className="mr-2 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Optimization Analysis</h2>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    exportPlans();
                  }}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors duration-150"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
                
                {showDetails ? 
                  <ChevronDown size={20} className="text-gray-500" /> : 
                  <ChevronRight size={20} className="text-gray-500" />
                }
              </div>
            </div>
            
            {showDetails && details.length > 0 && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {details.map((detail, index) => (
                    <div 
                      key={index}
                      className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-750"
                    >
                      <div className="flex items-center mb-2">
                        <FileText size={16} className="mr-2 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-medium text-gray-800 dark:text-white">{detail.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {detail.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;