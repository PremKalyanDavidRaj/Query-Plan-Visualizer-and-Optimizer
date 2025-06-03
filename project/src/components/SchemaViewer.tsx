import React, { useState } from 'react';
import { DatabaseTable, Column } from '../types';
import { sampleSchema } from '../data/schemaSamples';
import { Database, ChevronDown, ChevronRight, KeyRound, Hash } from 'lucide-react';

const SchemaViewer: React.FC = () => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(
    sampleSchema.reduce((acc, table) => ({ ...acc, [table.name]: false }), {})
  );

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const renderColumn = (column: Column, tableName: string) => {
    return (
      <div 
        key={`${tableName}-${column.name}`}
        className="pl-8 py-1.5 flex items-center text-gray-700 dark:text-gray-300 text-sm group"
      >
        {column.hasIndex ? (
          <KeyRound size={14} className="mr-2 text-blue-500 dark:text-blue-400" />
        ) : (
          <Hash size={14} className="mr-2 text-gray-400 dark:text-gray-500" />
        )}
        <span className="font-mono">{column.name}</span>
        <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">{column.type}</span>
        
        {column.hasIndex && (
          <span className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-blue-600 dark:text-blue-400 transition-opacity duration-150">
            indexed
          </span>
        )}
      </div>
    );
  };

  const renderTable = (table: DatabaseTable) => {
    const isExpanded = expandedTables[table.name];
    
    return (
      <div key={table.name} className="mb-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
        <div 
          className="px-4 py-2 bg-gray-50 dark:bg-gray-850 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-150"
          onClick={() => toggleTable(table.name)}
        >
          <div className="flex items-center">
            <Database size={16} className="mr-2 text-gray-600 dark:text-gray-300" />
            <span className="font-medium text-gray-800 dark:text-gray-200">{table.name}</span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {table.rowCount.toLocaleString()} rows
            </span>
          </div>
          
          {isExpanded ? (
            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
        
        {isExpanded && (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {table.columns.map(column => renderColumn(column, table.name))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Database Schema</h2>
      </div>
      
      <div className="p-4">
        {sampleSchema.map(renderTable)}
      </div>
    </div>
  );
};

export default SchemaViewer;