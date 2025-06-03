// A simplified SQL parser for demonstration purposes
export function parseSql(query: string): { valid: boolean; error?: string } {
  // This is a very simplified validation
  // In a real app, you would use a proper SQL parser library
  
  try {
    query = query.trim().toLowerCase();
    
    // Check if it starts with SELECT
    if (!query.startsWith('select')) {
      return { valid: false, error: 'Query must start with SELECT' };
    }
    
    // Check for basic SQL syntax
    if (!query.includes('from')) {
      return { valid: false, error: 'Query must include FROM clause' };
    }
    
    // Check for mismatched parentheses
    const openParens = (query.match(/\(/g) || []).length;
    const closeParens = (query.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      return { valid: false, error: 'Mismatched parentheses in query' };
    }
    
    // More validation would be needed in a real implementation
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Error parsing SQL query' };
  }
}