import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recipe {
  id: number;
  name: string;
  servings: number;
  category_name: string;
  ingredients: Array<{
    id: number;
    item: string;
    amount: number;
    unit: string;
  }>;
  directions: Array<{
    id: number;
    step_number: number;
    instruction: string;
  }>;
}

interface RecipeDetailsDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDetailsDialog({ recipe, open, onOpenChange }: RecipeDetailsDialogProps) {
  const [customServings, setCustomServings] = React.useState('');

  React.useEffect(() => {
    if (recipe) {
      setCustomServings(recipe.servings.toString());
    }
  }, [recipe]);

  if (!recipe) return null;

  const servingMultiplier = customServings ? parseFloat(customServings) / recipe.servings : 1;

  const scaledIngredients = recipe.ingredients.map(ingredient => ({
    ...ingredient,
    amount: ingredient.amount * servingMultiplier
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{recipe.name}</DialogTitle>
            <Badge variant="secondary">{recipe.category_name}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="servings">Customize Servings</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="servings"
                type="number"
                value={customServings}
                onChange={(e) => setCustomServings(e.target.value)}
                className="w-20"
                min="1"
                step="0.5"
              />
              <span className="text-sm text-muted-foreground">
                (Original: {recipe.servings} servings)
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scaledIngredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex justify-between items-center">
                      <span>{ingredient.item}</span>
                      <span className="text-muted-foreground">
                        {Math.round(ingredient.amount * 100) / 100} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Directions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {recipe.directions
                    .sort((a, b) => a.step_number - b.step_number)
                    .map((direction) => (
                      <li key={direction.id} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {direction.step_number}
                        </span>
                        <span className="text-sm">{direction.instruction}</span>
                      </li>
                    ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
