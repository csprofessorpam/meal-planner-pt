export interface Database {
  recipe_categories: RecipeCategoryTable;
  recipes: RecipeTable;
  recipe_ingredients: RecipeIngredientTable;
  recipe_directions: RecipeDirectionTable;
  daily_meals: DailyMealTable;
}

export interface RecipeCategoryTable {
  id: number;
  name: string;
  created_at: string;
}

export interface RecipeTable {
  id: number;
  name: string;
  category_id: number;
  servings: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredientTable {
  id: number;
  recipe_id: number;
  item: string;
  amount: number;
  unit: string;
}

export interface RecipeDirectionTable {
  id: number;
  recipe_id: number;
  step_number: number;
  instruction: string;
}

export interface DailyMealTable {
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
}
