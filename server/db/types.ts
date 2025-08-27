import { Generated } from 'kysely';

/**
 * Recipe category table
 */
export interface RecipeCategory {
  id: Generated<number>;  // auto-increment primary key
  name: string;
  created_at: string;
}

/**
 * Recipes table
 */
export interface Recipe {
  id: Generated<number>;
  name: string;
  category_id: number;      // FK to recipe_categories
  servings: number;
  created_at: string;
  updated_at: string;
}

/**
 * Ingredients for each recipe
 */
export interface RecipeIngredient {
  id: Generated<number>;
  recipe_id: number;       // FK to recipes
  item: string;
  amount: number;
  unit: string;
}

/**
 * Directions for each recipe
 */
export interface RecipeDirection {
  id: Generated<number>;
  recipe_id: number;       // FK to recipes
  step_number: number;
  instruction: string;
}

/**
 * Daily meals table (specific recipe served on a date)
 */
export interface DailyMeal {
  id: Generated<number>;
  meal_date: string;       // ISO string
  recipe_id: number;       // FK to recipes
  servings: number;
  created_at: string;
  updated_at: string;
}

/**
 * Existing meals table (if you still need it for legacy or other purposes)
 */
export interface Meal {
  id: Generated<number>;
  name: string;
  date: string;            // ISO string
  created_at: string;
}

/**
 * Join table for meals and recipes (legacy or other purpose)
 */
export interface MealRecipe {
  id: Generated<number>;
  meal_id: number;         // FK to meals
  recipe_id: number;       // FK to recipes
  quantity: number;
  created_at: string;
}

/**
 * Database interface for Kysely
 */
export interface Database {
  recipe_categories: RecipeCategory;
  recipes: Recipe;
  recipe_ingredients: RecipeIngredient;
  recipe_directions: RecipeDirection;
  daily_meals: DailyMeal;

  // Keep existing meals system if needed
  meals: Meal;
  meal_recipes: MealRecipe;
}


// // server/db/types.ts
// import { Generated } from 'kysely';

// export interface Database {
//   recipe_categories: {
//     id: Generated<number>;       // auto-increment primary key
//     name: string;
//     created_at: string;
//   };
//   recipes: {
//     id: Generated<number>;       // auto-increment primary key
//     name: string;
//     category_id: number;         // FK to recipe_categories
//     instructions: string;
//     created_at: string;
//   };
//   meals: {
//     id: Generated<number>;       // auto-increment primary key
//     name: string;
//     date: string;                // store as ISO string
//     created_at: string;
//   };
//   meal_recipes: {
//     id: Generated<number>;       // auto-increment primary key
//     meal_id: number;             // FK to meals
//     recipe_id: number;           // FK to recipes
//     quantity: number;
//     created_at: string;
//   };
// }


// export interface DailyMeal {
//   id: number;
//   meal_date: string;
//   recipe_id: number;
//   servings: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface Recipe {
//   id: number;
//   name: string;
//   category_id: number;
//   servings: number;
//   created_at: string;
//   updated_at: string;
// }

// export interface RecipeCategory {
//   id: number;
//   name: string;
//   created_at: string;
// }
