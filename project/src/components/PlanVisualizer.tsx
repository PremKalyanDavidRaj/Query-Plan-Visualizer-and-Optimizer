import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PlanNode, QueryPlan } from '../types';
import { useAppStore } from '../store/appStore';

interface PlanVisualizerProps {
  plan: QueryPlan | null;
  title: string;
  className?: string;
}

const PlanVisualizer: React.FC<PlanVisualizerProps> = ({ plan, title, className = '' }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useAppStore().theme;

  useEffect(() => {
    if (!plan || !svgRef.current) return;
    
    const width = svgRef.current.clientWidth;
    const height = 600; // Fixed height, could be dynamic based on tree depth
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, 50)`); // Center the tree horizontally
    
    // Create a tree layout
    const treeLayout = d3.tree<PlanNode>()
      .size([width - 100, height - 100])
      .nodeSize([120, 120]);
    
    // Create a hierarchy from the plan
    const root = d3.hierarchy(plan.rootNode);
    
    // Apply the tree layout to the hierarchy
    const treeData = treeLayout(root);
    
    // Create links
    svg.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d => {
        return `M${d.source.y},${d.source.x}
                C${(d.source.y + d.target.y) / 2},${d.source.x}
                 ${(d.source.y + d.target.y) / 2},${d.target.x}
                 ${d.target.y},${d.target.x}`;
      })
      .attr('fill', 'none')
      .attr('stroke', theme === 'dark' ? '#4B5563' : '#D1D5DB')
      .attr('stroke-width', 2);
    
    // Function to determine node color based on type
    const getNodeColor = (type: string): string => {
      const colorMap: Record<string, string> = {
        'Scan': theme === 'dark' ? '#1F2937' : '#E5E7EB',
        'IndexScan': theme === 'dark' ? '#065F46' : '#D1FAE5',
        'Filter': theme === 'dark' ? '#1E3A8A' : '#DBEAFE',
        'Join': theme === 'dark' ? '#3730A3' : '#E0E7FF',
        'HashJoin': theme === 'dark' ? '#3730A3' : '#E0E7FF',
        'NestedLoopJoin': theme === 'dark' ? '#4C1D95' : '#EDE9FE',
        'MergeJoin': theme === 'dark' ? '#5B21B6' : '#F5F3FF',
        'Sort': theme === 'dark' ? '#831843' : '#FCE7F3',
        'Aggregate': theme === 'dark' ? '#7C2D12' : '#FEF3C7',
        'GroupBy': theme === 'dark' ? '#7C2D12' : '#FEF3C7',
        'Project': theme === 'dark' ? '#1E3A8A' : '#DBEAFE',
      };
      
      return colorMap[type] || (theme === 'dark' ? '#374151' : '#F3F4F6');
    };
    
    // Function to determine text color based on theme
    const getTextColor = (): string => {
      return theme === 'dark' ? '#E5E7EB' : '#1F2937';
    };
    
    // Create node groups
    const nodeGroups = svg.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .attr('cursor', 'pointer');
    
    // Add node rectangles
    nodeGroups.append('rect')
      .attr('width', 100)
      .attr('height', 60)
      .attr('x', -50)
      .attr('y', -30)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => getNodeColor(d.data.type))
      .attr('stroke', theme === 'dark' ? '#6B7280' : '#9CA3AF')
      .attr('stroke-width', 1);
    
    // Add node type
    nodeGroups.append('text')
      .attr('dy', '-15')
      .attr('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .attr('fill', getTextColor())
      .text(d => d.data.type);
    
    // Add cost information
    nodeGroups.append('text')
      .attr('dy', '5')
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', getTextColor())
      .text(d => {
        const description = d.data.description.length > 15 
          ? d.data.description.substring(0, 15) + '...' 
          : d.data.description;
        return description;
      });
    
    // Add cost information
    nodeGroups.append('text')
      .attr('dy', '20')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', getTextColor())
      .text(d => `Cost: ${d.data.cost.toFixed(1)}`);
    
    // Add tooltips for more detailed information
    nodeGroups.append('title')
      .text(d => {
        let tooltip = `Type: ${d.data.type}\n`;
        tooltip += `Description: ${d.data.description}\n`;
        tooltip += `Cost: ${d.data.cost.toFixed(2)}\n`;
        tooltip += `Cardinality: ${Math.round(d.data.cardinality)}\n`;
        
        if (d.data.table) {
          tooltip += `Table: ${d.data.table}\n`;
        }
        
        if (d.data.condition) {
          tooltip += `Condition: ${d.data.condition}\n`;
        }
        
        if (d.data.index) {
          tooltip += `Index: ${d.data.index}\n`;
        }
        
        return tooltip;
      });
    
  }, [plan, theme]);

  if (!plan) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${className}`}>
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No query plan available. Execute a query to generate a plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200 ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Cost: {plan.totalCost.toFixed(2)} | Estimated Rows: {Math.round(plan.estimatedRows)}
          </p>
        </div>
      </div>
      <div className="p-4 overflow-auto" style={{ height: '600px' }}>
        <svg ref={svgRef} width="100%" height="600" className="transition-colors duration-200"></svg>
      </div>
    </div>
  );
};

export default PlanVisualizer;