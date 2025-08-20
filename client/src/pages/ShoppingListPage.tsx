import * as React from 'react';
import { ShoppingListGenerator } from '@/components/shopping/ShoppingListGenerator';

export function ShoppingListPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Shopping List</h2>
      <ShoppingListGenerator />
    </div>
  );
}
