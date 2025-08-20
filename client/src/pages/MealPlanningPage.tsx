import * as React from 'react';
import { MealPlanner } from '@/components/meals/MealPlanner';

export function MealPlanningPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Meal Planning</h2>
      <MealPlanner />
    </div>
  );
}
