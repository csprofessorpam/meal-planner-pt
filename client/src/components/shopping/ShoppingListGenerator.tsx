import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMeals } from '@/hooks/useMeals';

interface ShoppingItem {
  item: string;
  amount: number;
  unit: string;
}

export function ShoppingListGenerator() {
  const [selectedMealIds, setSelectedMealIds] = React.useState<number[]>([]);
  const [shoppingList, setShoppingList] = React.useState<ShoppingItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { meals, loading: mealsLoading } = useMeals();

  const handleMealToggle = (mealId: number, checked: boolean) => {
    if (checked) {
      setSelectedMealIds([...selectedMealIds, mealId]);
    } else {
      setSelectedMealIds(selectedMealIds.filter(id => id !== mealId));
    }
  };

  const generateShoppingList = async () => {
  if (selectedMealIds.length === 0) return;

  setLoading(true);
  try {
    const response = await fetch('/api/meals/shopping-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mealIds: selectedMealIds }), // <-- this matches the backend
    });

    if (response.ok) {
      const data: ShoppingItem[] = await response.json();
      setShoppingList(data); // <-- update state with generated list
    } else {
      const errorData = await response.json();
      console.error('Error generating shopping list:', errorData);
      setShoppingList([]);
    }
  } catch (error) {
    console.error('Error generating shopping list:', error);
    setShoppingList([]);
  } finally {
    setLoading(false);
  }
};


  // const generateShoppingList = async () => {
  //   if (selectedMealIds.length === 0) return;

  //   setLoading(true);
  //   try {
  //     const response = await fetch('/api/meals/shopping-list', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ mealIds: selectedMealIds }),
  //     });
      
  //     if (response.ok) {
  //       const data = await response.json();
  //       setShoppingList(data);
  //     }
  //   } catch (error) {
  //     console.error('Error generating shopping list:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const formatMealDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getMealDisplayName = (meal: any) => {
    if (meal.meal_name) {
      return `${meal.meal_name} (${formatMealDate(meal.meal_date)})`;
    }
    
    const components = [];
    if (meal.protein) components.push(meal.protein.name);
    if (meal.starch) components.push(meal.starch.name);
    if (meal.vegetable) components.push(meal.vegetable.name);
    if (meal.sauce) components.push(meal.sauce.name);
    
    const displayName = components.length > 0 ? components.join(' + ') : 'Unnamed Meal';
    return `${displayName} (${formatMealDate(meal.meal_date)})`;
  };

  if (mealsLoading) {
    return <div>Loading meals...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Meals for Shopping List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meals.length === 0 ? (
              <p className="text-muted-foreground">No meals found. Create some meal plans first!</p>
            ) : (
              <>
                <div className="space-y-3">
                  {meals.map((meal) => (
                    <div key={meal.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`meal-${meal.id}`}
                        checked={selectedMealIds.includes(meal.id)}
                        onCheckedChange={(checked) => handleMealToggle(meal.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`meal-${meal.id}`}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{getMealDisplayName(meal)}</div>
                          <div className="text-muted-foreground text-xs">
                            Serves {meal.servings_needed} people
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={generateShoppingList} 
                  disabled={loading || selectedMealIds.length === 0}
                >
                  {loading ? 'Generating...' : `Generate Shopping List (${selectedMealIds.length} meals)`}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {shoppingList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Shopping List</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedMealIds.length} meal{selectedMealIds.length === 1 ? '' : 's'} selected
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shoppingList.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{item.item}</span>
                  <span className="text-muted-foreground">
                    {item.amount} {item.unit}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  const text = shoppingList
                    .map(item => `${item.item}: ${item.amount} ${item.unit}`)
                    .join('\n');
                  navigator.clipboard.writeText(text);
                }}
              >
                Copy to Clipboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
