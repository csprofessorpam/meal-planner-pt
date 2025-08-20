import * as React from 'react';

interface Meal {
  id: number;
  meal_date: string;
  meal_name: string | null;
  servings_needed: number;
  protein_recipe_id: number | null;
  starch_recipe_id: number | null;
  vegetable_recipe_id: number | null;
  sauce_recipe_id: number | null;
  created_at: string;
  updated_at: string;
  protein: any;
  starch: any;
  vegetable: any;
  sauce: any;
}

export function useMeals() {
  const [meals, setMeals] = React.useState<Meal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMeals = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meals');
      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }
      const data = await response.json();
      setMeals(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return { meals, loading, error, refetch: fetchMeals };
}
