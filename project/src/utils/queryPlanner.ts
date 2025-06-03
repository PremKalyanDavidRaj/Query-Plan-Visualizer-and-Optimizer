import { PlanNode, QueryPlan, OperationType } from '../types';
import { sampleSchema } from '../data/schemaSamples';

// Simulate generating a naive execution plan
export function generateNaivePlan(sqlQuery: string): QueryPlan {
  const sqlLower = sqlQuery.toLowerCase();
  
  let rootNode: PlanNode;
  let totalCost = 0;
  let estimatedRows = 0;
  
  if (sqlLower.includes('join')) {
    const tables = extractTablesFromQuery(sqlQuery);
    const whereConditions = extractConditionsFromQuery(sqlQuery);
    
    // Create leaf nodes for table scans
    const tableNodes: PlanNode[] = tables.map(table => {
      const tableDef = sampleSchema.find(t => t.name === table) || {
        name: table,
        rowCount: 1000,
        columns: []
      };
      
      // More sophisticated index selection
      const useIndex = whereConditions.some(cond => {
        const tableCols = tableDef.columns.filter(col => col.hasIndex);
        return tableCols.some(col => {
          const colPattern = new RegExp(`${table}\\.${col.name}\\s*[=><]`);
          return colPattern.test(cond);
        });
      });
      
      const nodeType: OperationType = useIndex ? 'IndexScan' : 'Scan';
      // More realistic scan costs based on table size
      const baseCost = tableDef.rowCount * (useIndex ? 0.1 : 1);
      const ioCost = Math.ceil(baseCost * 0.8); // 80% IO cost
      const cpuCost = Math.ceil(baseCost * 0.2); // 20% CPU cost
      
      return {
        id: generateId(),
        type: nodeType,
        description: `${nodeType} on ${table}`,
        table,
        cost: ioCost + cpuCost,
        cardinality: tableDef.rowCount,
        children: []
      };
    });
    
    // Build join tree with more accurate cost estimation
    let currentNode = tableNodes[0];
    
    for (let i = 1; i < tableNodes.length; i++) {
      const rightNode = tableNodes[i];
      const joinSelectivity = estimateJoinSelectivity(currentNode, rightNode);
      
      // For naive plan, always use nested loop join with higher costs
      const joinCost = currentNode.cost + (currentNode.cardinality * rightNode.cost);
      const resultCardinality = Math.ceil(currentNode.cardinality * rightNode.cardinality * joinSelectivity);
      
      currentNode = {
        id: generateId(),
        type: 'NestedLoopJoin',
        description: `Join ${currentNode.table} with ${rightNode.table}`,
        cost: joinCost,
        cardinality: resultCardinality,
        children: [currentNode, rightNode]
      };
    }
    
    // Apply filters with more accurate selectivity
    if (whereConditions.length > 0) {
      const filterSelectivity = estimateFilterSelectivity(whereConditions);
      const filterCost = Math.ceil(currentNode.cardinality * 0.1); // CPU cost for filtering
      
      currentNode = {
        id: generateId(),
        type: 'Filter',
        description: `Filter: ${whereConditions.join(' AND ')}`,
        condition: whereConditions.join(' AND '),
        cost: currentNode.cost + filterCost,
        cardinality: Math.ceil(currentNode.cardinality * filterSelectivity),
        children: [currentNode]
      };
    }
    
    rootNode = currentNode;
    totalCost = rootNode.cost;
    estimatedRows = rootNode.cardinality;
  } else {
    // Handle non-join queries
    const table = extractTablesFromQuery(sqlQuery)[0];
    const tableDef = sampleSchema.find(t => t.name === table) || {
      name: table,
      rowCount: 1000,
      columns: []
    };
    
    const scanCost = tableDef.rowCount;
    rootNode = {
      id: generateId(),
      type: 'Scan',
      description: `Table Scan on ${table}`,
      table,
      cost: scanCost,
      cardinality: tableDef.rowCount,
      children: []
    };
    
    if (sqlLower.includes('where')) {
      const conditions = extractConditionsFromQuery(sqlQuery);
      const filterSelectivity = estimateFilterSelectivity(conditions);
      const filterCost = Math.ceil(rootNode.cardinality * 0.1);
      
      rootNode = {
        id: generateId(),
        type: 'Filter',
        description: `Filter: ${conditions.join(' AND ')}`,
        condition: conditions.join(' AND '),
        cost: rootNode.cost + filterCost,
        cardinality: Math.ceil(rootNode.cardinality * filterSelectivity),
        children: [rootNode]
      };
    }
    
    totalCost = rootNode.cost;
    estimatedRows = rootNode.cardinality;
  }
  
  return { rootNode, totalCost, estimatedRows };
}

// Enhanced optimization with better cost models
export function optimizePlan(naivePlan: QueryPlan, enabledRules: string[]): QueryPlan {
  const plan: QueryPlan = JSON.parse(JSON.stringify(naivePlan));
  
  if (enabledRules.includes('selection_pushdown')) {
    applySelectionPushdown(plan.rootNode);
  }
  
  if (enabledRules.includes('join_reordering')) {
    plan.rootNode = applyJoinReordering(plan.rootNode);
  }
  
  if (enabledRules.includes('index_selection')) {
    applyIndexSelection(plan.rootNode);
  }
  
  if (enabledRules.includes('join_method_selection')) {
    applyJoinMethodSelection(plan.rootNode);
  }
  
  updateNodeCosts(plan.rootNode);
  
  plan.totalCost = plan.rootNode.cost;
  plan.estimatedRows = plan.rootNode.cardinality;
  
  return plan;
}

function estimateJoinSelectivity(leftNode: PlanNode, rightNode: PlanNode): number {
  // More sophisticated join selectivity based on table sizes and characteristics
  const maxCard = Math.max(leftNode.cardinality, rightNode.cardinality);
  const minCard = Math.min(leftNode.cardinality, rightNode.cardinality);
  
  // Larger tables tend to have lower join selectivity
  const baseSelectivity = 1 / Math.sqrt(maxCard);
  
  // Adjust based on size ratio between tables
  const sizeRatio = minCard / maxCard;
  const adjustedSelectivity = baseSelectivity * (0.1 + (0.9 * sizeRatio));
  
  // Ensure reasonable bounds
  return Math.max(0.001, Math.min(0.5, adjustedSelectivity));
}

function estimateFilterSelectivity(conditions: string[]): number {
  // More sophisticated filter selectivity estimation
  const baseSelectivity = 0.3; // Average selectivity for a single condition
  return Math.pow(baseSelectivity, conditions.length);
}

function calculateJoinCost(leftNode: PlanNode, rightNode: PlanNode, joinType: string): number {
  const leftCost = leftNode.cost;
  const rightCost = rightNode.cost;
  const leftCard = leftNode.cardinality;
  const rightCard = rightNode.cardinality;
  
  switch (joinType) {
    case 'nested_loop':
      // Cost increases quadratically with input sizes
      return leftCost + (leftCard * rightCost);
      
    case 'hash':
      // Cost includes building hash table and probing
      const buildCost = leftCard * 1.2; // Hash table building
      const probeCost = rightCard * 0.1; // Hash table probing
      return leftCost + rightCost + buildCost + probeCost;
      
    case 'merge':
      // Cost includes sorting (if needed) and merging
      const sortCost = (leftCard + rightCard) * Math.log2(leftCard + rightCard) * 0.05;
      const mergeCost = (leftCard + rightCard) * 0.1;
      return leftCost + rightCost + sortCost + mergeCost;
      
    default:
      return leftCost + rightCost + (leftCard * rightCard * 0.1);
  }
}

function applySelectionPushdown(node: PlanNode): void {
  if (node.type === 'Filter' && node.children.length === 1) {
    const childNode = node.children[0];
    
    if (isJoinNode(childNode)) {
      const condition = node.condition || '';
      const leftTable = extractTableFromNode(childNode.children[0]);
      const rightTable = extractTableFromNode(childNode.children[1]);
      
      const leftConditions: string[] = [];
      const rightConditions: string[] = [];
      const joinConditions: string[] = [];
      
      condition.split(' AND ').forEach(cond => {
        if (cond.includes(leftTable) && !cond.includes(rightTable)) {
          leftConditions.push(cond);
        } else if (!cond.includes(leftTable) && cond.includes(rightTable)) {
          rightConditions.push(cond);
        } else {
          joinConditions.push(cond);
        }
      });
      
      if (leftConditions.length > 0) {
        childNode.children[0] = createFilterNode(
          childNode.children[0],
          leftConditions.join(' AND ')
        );
      }
      
      if (rightConditions.length > 0) {
        childNode.children[1] = createFilterNode(
          childNode.children[1],
          rightConditions.join(' AND ')
        );
      }
      
      if (joinConditions.length > 0) {
        node.condition = joinConditions.join(' AND ');
        node.description = `Filter: ${joinConditions.join(' AND ')}`;
      } else {
        Object.assign(node, childNode);
      }
      
      updateNodeCosts(childNode);
    }
  }
  
  node.children.forEach(child => applySelectionPushdown(child));
}

function createFilterNode(child: PlanNode, condition: string): PlanNode {
  const filterSelectivity = 0.5;
  return {
    id: generateId(),
    type: 'Filter',
    description: `Filter: ${condition}`,
    condition,
    cost: child.cost + Math.ceil(child.cardinality * 0.1),
    cardinality: Math.ceil(child.cardinality * filterSelectivity),
    children: [child]
  };
}

function applyJoinMethodSelection(node: PlanNode): void {
  if (isJoinNode(node) && node.children.length === 2) {
    const leftChild = node.children[0];
    const rightChild = node.children[1];
    
    // Choose join method based on table sizes and characteristics
    if (leftChild.cardinality < 1000 && rightChild.cardinality < 1000) {
      node.type = 'NestedLoopJoin';
      node.description = `Nested Loop Join: ${leftChild.table || ''} ⋈ ${rightChild.table || ''}`;
      node.cost = calculateJoinCost(leftChild, rightChild, 'nested_loop');
    } else if (isSortedScanNode(leftChild) && isSortedScanNode(rightChild)) {
      node.type = 'MergeJoin';
      node.description = `Merge Join: ${leftChild.table || ''} ⋈ ${rightChild.table || ''}`;
      node.cost = calculateJoinCost(leftChild, rightChild, 'merge');
    } else {
      node.type = 'HashJoin';
      node.description = `Hash Join: ${leftChild.table || ''} ⋈ ${rightChild.table || ''}`;
      node.cost = calculateJoinCost(leftChild, rightChild, 'hash');
    }
    
    const joinSelectivity = estimateJoinSelectivity(leftChild, rightChild);
    node.cardinality = Math.ceil(leftChild.cardinality * rightChild.cardinality * joinSelectivity);
  }
  
  node.children.forEach(child => applyJoinMethodSelection(child));
}

function extractTablesFromQuery(query: string): string[] {
  const fromMatch = query.toLowerCase().match(/from\s+([a-z0-9_,\s]+)(?:(?:where|join|group|order|limit|having))?/i);
  if (!fromMatch) return [];
  
  const fromClause = fromMatch[1];
  let tables: string[] = fromClause.split(',').map(t => t.trim());
  
  const joinMatches = query.toLowerCase().matchAll(/join\s+([a-z0-9_]+)/gi);
  for (const match of joinMatches) {
    tables.push(match[1].trim());
  }
  
  tables = tables.map(t => t.split(' ')[0]);
  return [...new Set(tables)];
}

function extractConditionsFromQuery(query: string): string[] {
  const whereMatch = query.toLowerCase().match(/where\s+(.+?)(?:(?:group|order|limit|having)\s+by|$)/i);
  if (!whereMatch) return [];
  
  const whereClause = whereMatch[1];
  return whereClause.split(' AND ').map(c => c.trim());
}

function extractColumnsFromCondition(condition: string): string[] {
  const columnMatches = condition.matchAll(/([a-z0-9_]+)\.([a-z0-9_]+)/gi);
  const columns: string[] = [];
  
  for (const match of columnMatches) {
    columns.push(match[2]);
  }
  
  return columns;
}

function extractTableFromNode(node: PlanNode): string {
  if (node.table) return node.table;
  return node.children.length > 0 ? extractTableFromNode(node.children[0]) : '';
}

function isJoinNode(node: PlanNode): boolean {
  return ['Join', 'NestedLoopJoin', 'HashJoin', 'MergeJoin'].includes(node.type);
}

function isSortedScanNode(node: PlanNode): boolean {
  return node.type === 'Sort' || 
         node.type === 'IndexScan' || 
         (node.type === 'Scan' && node.details?.sorted);
}

function flattenJoinTree(node: PlanNode): PlanNode[] {
  if (!isJoinNode(node)) {
    return [node];
  }
  
  const tables: PlanNode[] = [];
  node.children.forEach(child => {
    tables.push(...(isJoinNode(child) ? flattenJoinTree(child) : [child]));
  });
  
  return tables;
}

function buildBalancedJoinTree(tables: PlanNode[]): PlanNode {
  if (tables.length === 1) return tables[0];
  
  if (tables.length === 2) {
    const joinSelectivity = estimateJoinSelectivity(tables[0], tables[1]);
    return {
      id: generateId(),
      type: 'HashJoin',
      description: `Join ${tables[0].table || ''} with ${tables[1].table || ''}`,
      cost: calculateJoinCost(tables[0], tables[1], 'hash'),
      cardinality: Math.ceil(tables[0].cardinality * tables[1].cardinality * joinSelectivity),
      children: [tables[0], tables[1]]
    };
  }
  
  const mid = Math.floor(tables.length / 2);
  const leftTables = tables.slice(0, mid);
  const rightTables = tables.slice(mid);
  
  const leftNode = buildBalancedJoinTree(leftTables);
  const rightNode = buildBalancedJoinTree(rightTables);
  
  const joinSelectivity = estimateJoinSelectivity(leftNode, rightNode);
  return {
    id: generateId(),
    type: 'HashJoin',
    description: `Join ${leftNode.table || ''} with ${rightNode.table || ''}`,
    cost: calculateJoinCost(leftNode, rightNode, 'hash'),
    cardinality: Math.ceil(leftNode.cardinality * rightNode.cardinality * joinSelectivity),
    children: [leftNode, rightNode]
  };
}

function findParentNode(node: PlanNode, currentNode: PlanNode = null, root: PlanNode = null): PlanNode | null {
  if (!root) return null;
  
  for (const child of root.children) {
    if (child === node) return root;
    
    const parent = findParentNode(node, child, child);
    if (parent) return parent;
  }
  
  return null;
}

function updateNodeCosts(node: PlanNode): void {
  if (node.children.length > 0) {
    node.children.forEach(child => updateNodeCosts(child));
    
    if (isJoinNode(node)) {
      const joinType = node.type === 'NestedLoopJoin' ? 'nested_loop' :
                      node.type === 'HashJoin' ? 'hash' : 'merge';
      node.cost = calculateJoinCost(node.children[0], node.children[1], joinType);
      
      const joinSelectivity = estimateJoinSelectivity(node.children[0], node.children[1]);
      node.cardinality = Math.ceil(node.children[0].cardinality * node.children[1].cardinality * joinSelectivity);
    } else if (node.type === 'Filter') {
      const filterSelectivity = Math.pow(0.5, (node.condition?.split(' AND ').length || 1));
      node.cost = node.children[0].cost + Math.ceil(node.children[0].cardinality * 0.1);
      node.cardinality = Math.ceil(node.children[0].cardinality * filterSelectivity);
    } else {
      node.cost = Math.ceil(node.children.reduce((sum, child) => sum + child.cost, 0));
      node.cardinality = node.children[0].cardinality;
    }
  }
}

function calculateTotalCostAndRows(node: PlanNode): { totalCost: number; estimatedRows: number } {
  return {
    totalCost: Math.ceil(node.cost),
    estimatedRows: Math.ceil(node.cardinality)
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function applyJoinReordering(node: PlanNode): PlanNode {
  node.children = node.children.map(child => applyJoinReordering(child));
  
  if (isJoinNode(node) && node.children.length === 2 && 
      isJoinNode(node.children[0]) && !isJoinNode(node.children[1])) {
    
    const tables = flattenJoinTree(node);
    tables.sort((a, b) => a.cardinality - b.cardinality);
    
    const newRoot = buildBalancedJoinTree(tables);
    updateNodeCosts(newRoot);
    
    return newRoot;
  }
  
  return node;
}

function applyIndexSelection(node: PlanNode): void {
  if (node.type === 'Scan' && node.table) {
    const tableDef = sampleSchema.find(t => t.name === node.table);
    
    if (tableDef) {
      const parent = findParentNode(node);
      
      if (parent && parent.type === 'Filter' && parent.condition) {
        const conditionColumns = extractColumnsFromCondition(parent.condition);
        
        const indexedColumn = tableDef.columns.find(col => 
          col.hasIndex && conditionColumns.includes(col.name)
        );
        
        if (indexedColumn) {
          node.type = 'IndexScan';
          node.description = `Index Scan on ${node.table} using index on ${indexedColumn.name}`;
          node.index = indexedColumn.name;
          node.cost = Math.ceil(node.cost * 0.2);
        }
      }
    }
  }
  
  node.children.forEach(child => applyIndexSelection(child));
}