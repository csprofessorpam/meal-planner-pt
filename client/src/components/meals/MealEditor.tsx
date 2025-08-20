import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecipes } from '@/hooks/useRecipes';

interface MealEditorProps {
  date: Date;
  meal: any;
  onMealSaved: () => void;
}

export function MealEditor({ date, meal, onMealSaved }: MealEditorProps) {
  const [mealName, setMealName] = React.useState(meal?.meal_name || '');
  const [servingsNeeded, setServingsNeeded] = React.useState(meal?.servings_needed?.toString() || '');
  const [proteinRecipeId, setProteinRecipeId] = React.useState(meal?.protein_recipe_id?.toString() || 'none');
  const [starchRecipeId, setStarchRecipeId] = React.useState(meal?.starch_recipe_id?.toString() || 'none');
  const [vegetableRecipeId, setVegetableRecipeId] = React.useState(meal?.vegetable_recipe_id?.toString() || 'none');
  const [sauceRecipeId, setSauceRecipeId] = React.useState(meal?.sauce_recipe_id?.toString() || 'none');
  const [loading, setLoading] = React.useState(false);

  const { recipes } = useRecipes();

  React.useEffect(() => {
    setMealName(meal?.meal_name || '');
    setServingsNeeded(meal?.servings_needed?.toString() || '');
    setProteinRecipeId(meal?.protein_recipe_id?.toString() || 'none');
    setStarchRecipeId(meal?.starch_recipe_id?.toString() || 'none');
    setVegetableRecipeId(meal?.vegetable_recipe_id?.toString() || 'none');
    setSauceRecipeId(meal?.sauce_recipe_id?.toString() || 'none');
  }, [meal]);

  const getRecipesByCategory = (categoryNames: string[]) => {
    return recipes.filter(recipe => 
      categoryNames.some(name => 
        recipe.category_name.toLowerCase().includes(name.toLowerCase())
      )
    );
  };

  const proteinRecipes = getRecipesByCategory(['Chicken', 'Beef', 'Fish', 'Vegetarian Protein']);
  const starchRecipes = getRecipesByCategory(['Starch']);
  const vegetableRecipes = getRecipesByCategory(['Vegetable']);
  const sauceRecipes = getRecipesByCategory(['Sauce']);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servingsNeeded) return;

    setLoading(true);
    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meal_date: formatDate(date),
          meal_name: mealName.trim() || null,
          servings_needed: parseInt(servingsNeeded),
          protein_recipe_id: proteinRecipeId !== 'none' ? parseInt(proteinRecipeId) : null,
          starch_recipe_id: starchRecipeId !== 'none' ? parseInt(starchRecipeId) : null,
          vegetable_recipe_id: vegetableRecipeId !== 'none' ? parseInt(vegetableRecipeId) : null,
          sauce_recipe_id: sauceRecipeId !== 'none' ? parseInt(sauceRecipeId) : null,
        }),
      });

      if (response.ok) {
        onMealSaved();
      }
    } catch (error) {
      console.error('Error saving meal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Meal Plan for {formatDisplayDate(date)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mealName">Meal Name (Optional)</Label>
            <Input
              id="mealName"
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g., Asian Night, Italian Dinner"
            />
          </div>

          <div>
            <Label htmlFor="servings">Number of Servings Needed</Label>
            <Input
              id="servings"
              type="number"
              value={servingsNeeded}
              onChange={(e) => setServingsNeeded(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Protein</Label>
              <Select value={proteinRecipeId} onValueChange={setProteinRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select protein" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {proteinRecipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name} (serves {recipe.servings})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Starch</Label>
              <Select value={starchRecipeId} onValueChange={setStarchRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select starch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {starchRecipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name} (serves {recipe.servings})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vegetable</Label>
              <Select value={vegetableRecipeId} onValueChange={setVegetableRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vegetable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vegetableRecipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name} (serves {recipe.servings})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sauce</Label>
              <Select value={sauceRecipeId} onValueChange={setSauceRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sauce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {sauceRecipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id.toString()}>
                      {recipe.name} (serves {recipe.servings})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Meal Plan'}
          </Button>
        </form>

        {meal && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-2">Current Meal Plan:</h4>
            <div className="space-y-2 text-sm">
              {meal.meal_name && <p><strong>Name:</strong> {meal.meal_name}</p>}
              <p><strong>Servings:</strong> {meal.servings_needed}</p>
              {meal.protein && <p><strong>Protein:</strong> {meal.protein.name}</p>}
              {meal.starch && <p><strong>Starch:</strong> {meal.starch.name}</p>}
              {meal.vegetable && <p><strong>Vegetable:</strong> {meal.vegetable.name}</p>}
              {meal.sauce && <p><strong>Sauce:</strong> {meal.sauce.name}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
