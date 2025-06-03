import { SampleQuery } from '../types';

export const sampleQueries: SampleQuery[] = [
  {
    id: 'simple_select',
    name: 'Simple Select',
    description: 'A basic query with a filter condition',
    query: 'SELECT * FROM customers WHERE country = "USA";'
  },
  {
    id: 'simple_join',
    name: 'Simple Join',
    description: 'A query joining two tables with a filter',
    query: 'SELECT c.name, o.order_date, o.total\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.total > 100;'
  },
  {
    id: 'multi_join',
    name: 'Multiple Joins',
    description: 'A query joining multiple tables with filtering and sorting',
    query: 'SELECT c.name, p.name, o.quantity, o.order_date\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nJOIN order_items oi ON o.id = oi.order_id\nJOIN products p ON oi.product_id = p.id\nWHERE c.country = "Canada"\nORDER BY o.order_date DESC;'
  },
  {
    id: 'aggregation',
    name: 'Aggregation',
    description: 'A query with grouping and aggregation',
    query: 'SELECT c.country, COUNT(*) as customer_count, AVG(o.total) as avg_order\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nGROUP BY c.country\nHAVING COUNT(*) > 5\nORDER BY avg_order DESC;'
  },
  {
    id: 'subquery',
    name: 'Subquery',
    description: 'A query with a subquery in the WHERE clause',
    query: 'SELECT name, email\nFROM customers\nWHERE id IN (\n  SELECT DISTINCT customer_id\n  FROM orders\n  WHERE total > 1000\n);'
  }
];