import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecipeDetails } from '@/hooks/useRecipeDetails';
import { RecipeDetailsDialog } from './RecipeDetailsDialog';

export function RecipeList() {
  const { recipes, loading, error } = useRecipes();
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { recipe: selectedRecipe } = useRecipeDetails(selectedRecipeId);

  const handleRecipeClick = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedRecipeId(null);
    }
  };

  if (loading) {
    return <div>Loading recipes...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading recipes: {error}</div>;
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recipes found. Add your first recipe to get started!
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card 
            key={recipe.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleRecipeClick(recipe.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{recipe.name}</CardTitle>
                <Badge variant="secondary">{recipe.category_name}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Serves {recipe.servings} people
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RecipeDetailsDialog 
        recipe={selectedRecipe}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
      />
    </>
  );
}
