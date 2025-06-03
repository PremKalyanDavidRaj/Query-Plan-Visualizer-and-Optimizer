import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { useAppStore } from '../store/appStore';
import { Play, Lightbulb, Copy, X } from 'lucide-react';
import { toast } from 'react-toastify';

const QueryInput: React.FC = () => {
  const { 
    sqlQuery, 
    setSqlQuery, 
    generateQueryPlans,
    sampleQueries,
    loadSampleQuery
  } = useAppStore();

  const handleQueryChange = React.useCallback((value: string) => {
    setSqlQuery(value);
  }, [setSqlQuery]);

  const handleExecuteQuery = () => {
    try {
      generateQueryPlans(sqlQuery);
      toast.success("Query plan generated successfully!");
    } catch (error) {
      toast.error("Error generating query plan!");
      console.error(error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery)
      .then(() => toast.success("Query copied to clipboard!"))
      .catch(err => toast.error("Failed to copy query"));
  };

  const clearQuery = () => {
    setSqlQuery('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">SQL Query</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={copyToClipboard}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            title="Copy SQL"
          >
            <Copy size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={clearQuery}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
            title="Clear SQL"
          >
            <X size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <CodeMirror
            value={sqlQuery}
            height="150px"
            extensions={[sql()]}
            onChange={handleQueryChange}
            className="text-sm font-mono"
            theme={useAppStore().theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center">
          <button
            onClick={handleExecuteQuery}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-150"
          >
            <Play size={16} />
            <span>Execute Query</span>
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="relative group">
            <button
              className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md transition-colors duration-150"
            >
              <Lightbulb size={16} />
              <span>Example Queries</span>
            </button>
            
            <div className="absolute z-10 right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden transform scale-0 group-hover:scale-100 origin-top-right transition-transform duration-150 ease-in-out">
              <div className="py-1">
                {sampleQueries.map(query => (
                  <button
                    key={query.id}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => loadSampleQuery(query.id)}
                  >
                    <div className="font-medium">{query.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{query.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryInput;