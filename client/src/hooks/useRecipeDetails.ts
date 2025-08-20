import * as React from 'react';

interface RecipeDetails {
  id: number;
  name: string;
  servings: number;
  category_id: number;
  category_name: string;
  ingredients: Array<{
    id: number;
    recipe_id: number;
    item: string;
    amount: number;
    unit: string;
  }>;
  directions: Array<{
    id: number;
    recipe_id: number;
    step_number: number;
    instruction: string;
  }>;
}

export function useRecipeDetails(recipeId: number | null) {
  const [recipe, setRecipe] = React.useState<RecipeDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRecipeDetails = React.useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }
      const data = await response.json();
      setRecipe(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    } else {
      setRecipe(null);
      setError(null);
    }
  }, [recipeId, fetchRecipeDetails]);

  return { recipe, loading, error };
}
