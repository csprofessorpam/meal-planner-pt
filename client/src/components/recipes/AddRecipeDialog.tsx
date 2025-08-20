import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useRecipeCategories } from '@/hooks/useRecipeCategories';

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
}

interface Direction {
  instruction: string;
}

export function AddRecipeDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [servings, setServings] = React.useState('');
  const [ingredients, setIngredients] = React.useState<Ingredient[]>([{ item: '', amount: '', unit: '' }]);
  const [directions, setDirections] = React.useState<Direction[]>([{ instruction: '' }]);
  const [loading, setLoading] = React.useState(false);

  const { categories } = useRecipeCategories();

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addDirection = () => {
    setDirections([...directions, { instruction: '' }]);
  };

  const removeDirection = (index: number) => {
    setDirections(directions.filter((_, i) => i !== index));
  };

  const updateDirection = (index: number, value: string) => {
    const updated = [...directions];
    updated[index].instruction = value;
    setDirections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !servings) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          category_id: parseInt(categoryId),
          servings: parseInt(servings),
          ingredients: ingredients.filter(ing => ing.item && ing.amount && ing.unit).map(ing => ({
            ...ing,
            amount: parseFloat(ing.amount)
          })),
          directions: directions.filter(dir => dir.instruction)
        }),
      });

      if (response.ok) {
        // Reset form
        setName('');
        setCategoryId('');
        setServings('');
        setIngredients([{ item: '', amount: '', unit: '' }]);
        setDirections([{ instruction: '' }]);
        setOpen(false);
        // Trigger a refresh of the recipes list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Recipe Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Ingredients</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Item"
                  value={ingredient.item}
                  onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                />
                <Input
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                />
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                />
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Directions</Label>
              <Button type="button" variant="outline" size="sm" onClick={addDirection}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {directions.map((direction, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder={`Step ${index + 1}`}
                  value={direction.instruction}
                  onChange={(e) => updateDirection(index, e.target.value)}
                />
                {directions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDirection(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Recipe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
