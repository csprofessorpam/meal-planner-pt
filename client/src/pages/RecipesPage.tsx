import * as React from 'react';
import { RecipeList } from '@/components/recipes/RecipeList';
import { AddRecipeDialog } from '@/components/recipes/AddRecipeDialog';

export function RecipesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Recipes</h2>
        <AddRecipeDialog />
      </div>
      <RecipeList />
    </div>
  );
}
