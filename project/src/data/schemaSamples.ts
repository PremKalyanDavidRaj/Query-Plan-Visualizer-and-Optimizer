import { DatabaseTable } from '../types';

export const sampleSchema: DatabaseTable[] = [
  {
    name: 'customers',
    columns: [
      { name: 'id', type: 'INTEGER', hasIndex: true },
      { name: 'name', type: 'VARCHAR(100)', hasIndex: false },
      { name: 'email', type: 'VARCHAR(100)', hasIndex: true },
      { name: 'country', type: 'VARCHAR(50)', hasIndex: true },
      { name: 'created_at', type: 'TIMESTAMP', hasIndex: false }
    ],
    rowCount: 5000
  },
  {
    name: 'orders',
    columns: [
      { name: 'id', type: 'INTEGER', hasIndex: true },
      { name: 'customer_id', type: 'INTEGER', hasIndex: true },
      { name: 'order_date', type: 'DATE', hasIndex: true },
      { name: 'total', type: 'DECIMAL(10,2)', hasIndex: false },
      { name: 'status', type: 'VARCHAR(20)', hasIndex: true }
    ],
    rowCount: 50000
  },
  {
    name: 'order_items',
    columns: [
      { name: 'id', type: 'INTEGER', hasIndex: true },
      { name: 'order_id', type: 'INTEGER', hasIndex: true },
      { name: 'product_id', type: 'INTEGER', hasIndex: true },
      { name: 'quantity', type: 'INTEGER', hasIndex: false },
      { name: 'price', type: 'DECIMAL(10,2)', hasIndex: false }
    ],
    rowCount: 200000
  },
  {
    name: 'products',
    columns: [
      { name: 'id', type: 'INTEGER', hasIndex: true },
      { name: 'name', type: 'VARCHAR(100)', hasIndex: false },
      { name: 'category', type: 'VARCHAR(50)', hasIndex: true },
      { name: 'price', type: 'DECIMAL(10,2)', hasIndex: false },
      { name: 'in_stock', type: 'BOOLEAN', hasIndex: true }
    ],
    rowCount: 1000
  }
];