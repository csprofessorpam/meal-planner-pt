// import { Router } from 'express';
import express, { Request, Response, Router } from 'express';
import { RequestHandler } from 'express';
import { db } from '../db/database.js';
import { DailyMeal, Recipe, RecipeCategory } from '../db/types.js';

// const router = Router();
const router: Router = express.Router();


type DailyMealRow = Omit<DailyMeal, 'id'> & { id: number };
type RecipeRow = Omit<Recipe, 'id'> & { id: number };

/**
 * GET all daily meals
 */
router.get('/', async (req, res) => {
  try {
    // Fetch all daily meals
    const meals: DailyMealRow[] = await db
      .selectFrom('daily_meals')
      .select([
        'id',
        'meal_date',
        'meal_name',
        'servings_needed',
        'protein_recipe_id',
        'starch_recipe_id',
        'vegetable_recipe_id',
        'sauce_recipe_id',
        'created_at',
        'updated_at'
      ])
      .execute();

    // Optionally, fetch all recipes to map IDs to names
    const recipeIds = [
      ...meals.map(m => m.protein_recipe_id),
      ...meals.map(m => m.starch_recipe_id),
      ...meals.map(m => m.vegetable_recipe_id),
      ...meals.map(m => m.sauce_recipe_id)
    ].filter(id => id != null) as number[];

    const recipes: RecipeRow[] = await db
      .selectFrom('recipes')
      .select(['id', 'name', 'category_id', 'servings', 'created_at', 'updated_at'])
      .where('id', 'in', recipeIds)
      .execute();

    const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]));

    const mealsWithRecipes = meals.map(meal => ({
      ...meal,
      protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
      starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
      vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
      sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null
    }));

    res.json(mealsWithRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

/**
 * GET a single daily meal
 */

const getMealById: RequestHandler<{ id: string }, any, any, any> = async (req, res): Promise<void> => {
  const mealId = Number(req.params.id);
  if (isNaN(mealId)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const meal = await db
      .selectFrom('daily_meals')
      .select([
        'id',
        'meal_date',
        'meal_name',
        'servings_needed',
        'protein_recipe_id',
        'starch_recipe_id',
        'vegetable_recipe_id',
        'sauce_recipe_id',
        'created_at',
        'updated_at'
      ])
      .where('id', '=', mealId)
      .executeTakeFirst();

    if (!meal) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    res.json(meal);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
};

router.get('/:id', getMealById);

// router.get('/:id', async (req, res) => {
//   const mealId = Number(req.params.id);
//   if (isNaN(mealId)) return res.status(400).json({ error: 'Invalid ID' });

//   try {
//     const meal = await db
//       .selectFrom('daily_meals')
//       .select([
//         'id',
//         'meal_date',
//         'meal_name',
//         'servings_needed',
//         'protein_recipe_id',
//         'starch_recipe_id',
//         'vegetable_recipe_id',
//         'sauce_recipe_id',
//         'created_at',
//         'updated_at'
//       ])
//       .where('id', '=', mealId)
//       .executeTakeFirst();

//     if (!meal) return res.status(404).json({ error: 'Meal not found' });

//     res.json(meal);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to fetch meal' });
//   }
// });

/**
 * CREATE a new daily meal
 */
router.post('/', async (req, res) => {
  const {
    meal_date,
    meal_name,
    servings_needed,
    protein_recipe_id,
    starch_recipe_id,
    vegetable_recipe_id,
    sauce_recipe_id
  } = req.body;

  try {
    const inserted = await db
      .insertInto('daily_meals')
      .values({
        meal_date,
        meal_name: meal_name || null,
        servings_needed,
        protein_recipe_id: protein_recipe_id || null,
        starch_recipe_id: starch_recipe_id || null,
        vegetable_recipe_id: vegetable_recipe_id || null,
        sauce_recipe_id: sauce_recipe_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returningAll()
      .executeTakeFirst();

    res.status(201).json(inserted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
});

/**
 * UPDATE a daily meal
 */

const updateMealById: RequestHandler<{ id: string }> = async (req, res): Promise<void> => {
  const mealId = Number(req.params.id);
  if (isNaN(mealId)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  const {
    meal_date,
    meal_name,
    servings_needed,
    protein_recipe_id,
    starch_recipe_id,
    vegetable_recipe_id,
    sauce_recipe_id
  } = req.body;

  try {
    const updated = await db
      .updateTable('daily_meals')
      .set({
        meal_date,
        meal_name: meal_name || null,
        servings_needed,
        protein_recipe_id: protein_recipe_id || null,
        starch_recipe_id: starch_recipe_id || null,
        vegetable_recipe_id: vegetable_recipe_id || null,
        sauce_recipe_id: sauce_recipe_id || null,
        updated_at: new Date().toISOString()
      })
      .where('id', '=', mealId)
      .returningAll()
      .executeTakeFirst();

    if (!updated) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update meal' });
  }
};

// Attach the handler to your router
router.put('/:id', updateMealById);

// router.put('/:id', async (req, res) => {
//   const mealId = Number(req.params.id);
//   if (isNaN(mealId)) return res.status(400).json({ error: 'Invalid ID' });

//   const {
//     meal_date,
//     meal_name,
//     servings_needed,
//     protein_recipe_id,
//     starch_recipe_id,
//     vegetable_recipe_id,
//     sauce_recipe_id
//   } = req.body;

//   try {
//     const updated = await db
//       .updateTable('daily_meals')
//       .set({
//         meal_date,
//         meal_name: meal_name || null,
//         servings_needed,
//         protein_recipe_id: protein_recipe_id || null,
//         starch_recipe_id: starch_recipe_id || null,
//         vegetable_recipe_id: vegetable_recipe_id || null,
//         sauce_recipe_id: sauce_recipe_id || null,
//         updated_at: new Date().toISOString()
//       })
//       .where('id', '=', mealId)
//       .returningAll()
//       .executeTakeFirst();

//     if (!updated) return res.status(404).json({ error: 'Meal not found' });

//     res.json(updated);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to update meal' });
//   }
// });

/**
 * DELETE a daily meal
 */

const deleteMealById: RequestHandler<{ id: string }> = async (req, res): Promise<void> => {
  const mealId = Number(req.params.id);
  if (isNaN(mealId)) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }

  try {
    const deleted = await db
      .deleteFrom('daily_meals')
      .where('id', '=', mealId)
      .returningAll()
      .executeTakeFirst();

    if (!deleted) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    res.json(deleted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

// Attach to router
router.delete('/:id', deleteMealById);

// router.delete('/:id', async (req, res) => {
//   const mealId = Number(req.params.id);
//   if (isNaN(mealId)) return res.status(400).json({ error: 'Invalid ID' });

//   try {
//     const deleted = await db
//       .deleteFrom('daily_meals')
//       .where('id', '=', mealId)
//       .returningAll()
//       .executeTakeFirst();

//     if (!deleted) return res.status(404).json({ error: 'Meal not found' });

//     res.json(deleted);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to delete meal' });
//   }
// });


// // Generate shopping list for selected meals
interface ShoppingListRequestBody {
  mealIds: number[];
}

const generateShoppingList: RequestHandler<{}, any, ShoppingListRequestBody> = async (req, res): Promise<void> => {
  try {
    const { mealIds } = req.body;
    console.log('Generating shopping list for meals:', mealIds);

    // Validate input
    if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
      res.status(400).json({ error: 'No meals selected' });
      return;
    }

    // Fetch the meals from the database
    const meals = await db
      .selectFrom('daily_meals')
      .selectAll()
      .where('id', 'in', mealIds)
      .execute();

    console.log('Found', meals.length, 'meals for shopping list');

    const shoppingList: Record<string, { amount: number; unit: string }> = {};

    for (const meal of meals) {
      const recipeIds = [
        meal.protein_recipe_id,
        meal.starch_recipe_id,
        meal.vegetable_recipe_id,
        meal.sauce_recipe_id
      ].filter((id): id is number => id != null);

      for (const recipeId of recipeIds) {
        const recipe = await db
          .selectFrom('recipes')
          .select(['servings'])
          .where('id', '=', recipeId)
          .executeTakeFirst();

        if (!recipe) {
          console.warn('Recipe not found:', recipeId);
          continue;
        }

        const ingredients = await db
          .selectFrom('recipe_ingredients')
          .selectAll()
          .where('recipe_id', '=', recipeId)
          .execute();

        // Calculate the total amount based on servings needed
        const multiplier = meal.servings_needed / recipe.servings;

        for (const ingredient of ingredients) {
          const key = `${ingredient.item} (${ingredient.unit})`;
          const adjustedAmount = ingredient.amount * multiplier;

          if (shoppingList[key]) {
            shoppingList[key].amount += adjustedAmount;
          } else {
            shoppingList[key] = { amount: adjustedAmount, unit: ingredient.unit };
          }
        }
      }
    }

    // Format for frontend
    const formattedList = Object.entries(shoppingList).map(([item, data]) => ({
      item: item.replace(` (${data.unit})`, ''),
      amount: Math.round(data.amount * 100) / 100, // round to 2 decimals
      unit: data.unit
    }));

    console.log('Generated shopping list with', formattedList.length, 'items');
    res.json(formattedList);
  } catch (error: any) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({ error: 'Failed to generate shopping list', details: error.message });
  }
};

// Attach to router
router.post('/shopping-list', generateShoppingList);

// router.post('/shopping-list', async (req, res) => {
//   try {
//     const { mealIds } = req.body;
//     console.log('Generating shopping list for meals:', mealIds);

//     // Validate input
//     if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
//       return res.status(400).json({ error: 'No meals selected' });
//     }

//     // Fetch the meals from the database
//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('id', 'in', mealIds)
//       .execute();

//     console.log('Found', meals.length, 'meals for shopping list');

//     const shoppingList: Record<string, { amount: number; unit: string }> = {};

//     for (const meal of meals) {
//       const recipeIds = [
//         meal.protein_recipe_id,
//         meal.starch_recipe_id,
//         meal.vegetable_recipe_id,
//         meal.sauce_recipe_id
//       ].filter((id): id is number => id != null);

//       for (const recipeId of recipeIds) {
//         const recipe = await db
//           .selectFrom('recipes')
//           .select(['servings'])
//           .where('id', '=', recipeId)
//           .executeTakeFirst();

//         if (!recipe) {
//           console.warn('Recipe not found:', recipeId);
//           continue;
//         }

//         const ingredients = await db
//           .selectFrom('recipe_ingredients')
//           .selectAll()
//           .where('recipe_id', '=', recipeId)
//           .execute();

//         // Calculate the total amount based on servings needed
//         const multiplier = meal.servings_needed / recipe.servings;

//         for (const ingredient of ingredients) {
//           const key = `${ingredient.item} (${ingredient.unit})`;
//           const adjustedAmount = ingredient.amount * multiplier;

//           if (shoppingList[key]) {
//             shoppingList[key].amount += adjustedAmount;
//           } else {
//             shoppingList[key] = { amount: adjustedAmount, unit: ingredient.unit };
//           }
//         }
//       }
//     }

//     // Format for frontend
//     const formattedList = Object.entries(shoppingList).map(([item, data]) => ({
//       item: item.replace(` (${data.unit})`, ''),
//       amount: Math.round(data.amount * 100) / 100, // round to 2 decimals
//       unit: data.unit
//     }));

//     console.log('Generated shopping list with', formattedList.length, 'items');
//     return res.json(formattedList);
//   } catch (error: any) {
//     console.error('Error generating shopping list:', error);
//     return res.status(500).json({ error: 'Failed to generate shopping list', details: error.message });
//   }
// });


export default router;


// import express from 'express';
// import { db } from '../db/database.js';
// import type { Selectable } from 'kysely';

// const router = express.Router();

// // Define type for daily_meals table row
// type DailyMealTable = Selectable<{
//   id: number;
//   meal_date: string;
//   meal_name?: string | null;
//   servings_needed: number;
//   protein_recipe_id?: number | null;
//   starch_recipe_id?: number | null;
//   vegetable_recipe_id?: number | null;
//   sauce_recipe_id?: number | null;
//   created_at: string;
//   updated_at: string;
// }>;

// // Define type for recipes with category
// type RecipeTable = Selectable<{
//   id: number;
//   name: string;
//   servings: number;
//   category_id: number;
//   created_at?: string;
//   updated_at?: string;
//   category_name: string;
// }>;

// // Get all meals
// router.get('/', async (_req, res) => {
//   try {
//     console.log('Fetching all meals');

//     const meals: DailyMealTable[] = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     const mealsWithRecipes = [];

//     for (const meal of meals) {
//       const recipeIds = [
//         meal.protein_recipe_id,
//         meal.starch_recipe_id,
//         meal.vegetable_recipe_id,
//         meal.sauce_recipe_id
//       ].filter((id): id is number => id != null);

//       let recipes: RecipeTable[] = [];
//       if (recipeIds.length > 0) {
//         recipes = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipes.category_id',
//             'recipe_categories.name as category_name',
//             'recipes.created_at',
//             'recipes.updated_at'
//           ])
//           .where('recipes.id', 'in', recipeIds)
//           .execute();
//       }

//       const recipeMap = recipes.reduce<Record<number, RecipeTable>>((acc, recipe) => {
//         acc[recipe.id] = recipe;
//         return acc;
//       }, {});

//       mealsWithRecipes.push({
//         ...meal,
//         protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//         starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//         vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//         sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//       });
//     }

//     res.json(mealsWithRecipes);
//   } catch (error) {
//     console.error('Error fetching meals:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: (error as Error).message });
//   }
// });

// // Get meal for a specific date
// router.get('/:date', async (req, res) => {
//   try {
//     const mealDate = req.params.date;

//     if (!/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
//       res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
//       return;
//     }

//     const meal = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('meal_date', '=', mealDate)
//       .executeTakeFirst<DailyMealTable>();

//     if (!meal) {
//       res.json(null);
//       return;
//     }

//     const recipeIds = [
//       meal.protein_recipe_id,
//       meal.starch_recipe_id,
//       meal.vegetable_recipe_id,
//       meal.sauce_recipe_id
//     ].filter((id): id is number => id != null);

//     let recipes: RecipeTable[] = [];
//     if (recipeIds.length > 0) {
//       recipes = await db
//         .selectFrom('recipes')
//         .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//         .select([
//           'recipes.id',
//           'recipes.name',
//           'recipes.servings',
//           'recipes.category_id',
//           'recipe_categories.name as category_name',
//           'recipes.created_at',
//           'recipes.updated_at'
//         ])
//         .where('recipes.id', 'in', recipeIds)
//         .execute();
//     }

//     const recipeMap = recipes.reduce<Record<number, RecipeTable>>((acc, recipe) => {
//       acc[recipe.id] = recipe;
//       return acc;
//     }, {});

//     const mealWithRecipes = {
//       ...meal,
//       protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//       starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//       vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//       sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//     };

//     res.json(mealWithRecipes);
//   } catch (error) {
//     console.error('Error fetching meal:', error);
//     res.status(500).json({ error: 'Failed to fetch meal', details: (error as Error).message });
//   }
// });

// // Create or update meal for a date
// router.post('/', async (req, res) => {
//   try {
//     const {
//       meal_date,
//       meal_name,
//       servings_needed,
//       protein_recipe_id,
//       starch_recipe_id,
//       vegetable_recipe_id,
//       sauce_recipe_id
//     } = req.body;

//     if (!meal_date || !servings_needed) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, servings_needed' });
//       return;
//     }

//     const existingMeal = await db
//       .selectFrom('daily_meals')
//       .select('id')
//       .where('meal_date', '=', meal_date)
//       .executeTakeFirst();

//     if (existingMeal) {
//       await db
//         .updateTable('daily_meals')
//         .set({
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           updated_at: new Date().toISOString()
//         })
//         .where('id', '=', existingMeal.id)
//         .execute();

//       res.json({ id: existingMeal.id, message: 'Meal updated successfully' });
//     } else {
//       const result = await db
//         .insertInto('daily_meals')
//         .values({
//           meal_date,
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         })
//         .executeTakeFirst();

//       const insertId = Number(result.insertId);
//       res.status(201).json({ id: insertId, message: 'Meal created successfully' });
//     }
//   } catch (error) {
//     console.error('Error saving meal:', error);
//     res.status(500).json({ error: 'Failed to save meal', details: (error as Error).message });
//   }
// });

// export { router as mealsRouter };



// import express from 'express';
// import { db } from '../db/database.js';
// import type { DailyMealTable, RecipeTable, RecipeCategoryTable } from '../db/schema.js';
// import type { Selectable } from 'kysely';

// const router = express.Router();

// // Get all meals
// router.get('/', async (req, res) => {
//   try {
//     console.log('Fetching all meals');

//     const meals: Selectable<DailyMealTable>[] = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     const mealsWithRecipes = [];

//     for (const meal of meals) {
//       const recipeIds = [
//         meal.protein_recipe_id,
//         meal.starch_recipe_id,
//         meal.vegetable_recipe_id,
//         meal.sauce_recipe_id
//       ].filter((id): id is number => id !== null);

//       let recipes: Selectable<RecipeTable & { category_name: string }>[] = [];
//       if (recipeIds.length > 0) {
//         recipes = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipes.category_id',
//             'recipe_categories.name as category_name'
//           ])
//           .where('recipes.id', 'in', recipeIds)
//           .execute();
//       }

//       const recipeMap = recipes.reduce((acc, recipe) => {
//         acc[recipe.id] = recipe;
//         return acc;
//       }, {} as Record<number, typeof recipes[number]>);

//       mealsWithRecipes.push({
//         ...meal,
//         protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//         starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//         vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//         sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null
//       });
//     }

//     res.json(mealsWithRecipes);
//   } catch (error) {
//     console.error('Error fetching meals:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: (error as Error).message });
//   }
// });

// // Create or update meal for a date
// router.post('/', async (req, res) => {
//   try {
//     const {
//       meal_date,
//       meal_name,
//       servings_needed,
//       protein_recipe_id,
//       starch_recipe_id,
//       vegetable_recipe_id,
//       sauce_recipe_id
//     } = req.body;

//     if (!meal_date || !servings_needed) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, servings_needed' });
//       return;
//     }

//     // Check if meal exists for this date
//     const existingMeal = await db
//       .selectFrom('daily_meals')
//       .select('id')
//       .where('meal_date', '=', meal_date)
//       .executeTakeFirst();

//     if (existingMeal) {
//       // Update
//       await db
//         .updateTable('daily_meals')
//         .set({
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           updated_at: new Date().toISOString()
//         })
//         .where('id', '=', existingMeal.id)
//         .execute();

//       res.json({ id: existingMeal.id, message: 'Meal updated successfully' });
//     } else {
//       // Insert
//       const result = await db
//         .insertInto('daily_meals')
//         .values({
//           meal_date,
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         })
//         .executeTakeFirst();

//       const insertId = Number(result.insertId);
//       res.status(201).json({ id: insertId, message: 'Meal created successfully' });
//     }
//   } catch (error) {
//     console.error('Error saving meal:', error);
//     res.status(500).json({ error: 'Failed to save meal', details: (error as Error).message });
//   }
// });

// export { router as mealsRouter };



// import express from 'express';
// import { db } from '../db/database.js';

// const router = express.Router();

// // Get all meals
// router.get('/', async (req, res) => {
//   try {
//     console.log('Fetching all meals');

//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     console.log('Found meals:', meals.length);

//     const mealsWithRecipes = [];

//     for (const meal of meals) {
//       const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
//         .filter(id => id !== null);

//       let recipes = [];
//       if (recipeIds.length > 0) {
//         recipes = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipe_categories.name as category_name'
//           ])
//           .where('recipes.id', 'in', recipeIds)
//           .execute();
//       }

//       const recipeMap = recipes.reduce((acc, recipe) => {
//         acc[recipe.id] = recipe;
//         return acc;
//       }, {} as any);

//       mealsWithRecipes.push({
//         ...meal,
//         protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//         starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//         vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//         sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//       });
//     }

//     res.json(mealsWithRecipes);
//     return;
//   } catch (error) {
//     console.error('Error fetching meals:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: error.message });
//     return;
//   }
// });

// // Get meals for a specific date
// router.get('/:date', async (req, res) => {
//   try {
//     const mealDate = req.params.date;
//     console.log('Fetching meal for date:', mealDate);

//     // Validate date format
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
//       res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
//       return;
//     }

//     const meal = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('meal_date', '=', mealDate)
//       .executeTakeFirst();

//     if (!meal) {
//       console.log('No meal found for date:', mealDate);
//       res.json(null);
//       return;
//     }

//     // Get recipe details for each component
//     const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
//       .filter(id => id !== null);

//     let recipes = [];
//     if (recipeIds.length > 0) {
//       recipes = await db
//         .selectFrom('recipes')
//         .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//         .select([
//           'recipes.id',
//           'recipes.name',
//           'recipes.servings',
//           'recipe_categories.name as category_name'
//         ])
//         .where('recipes.id', 'in', recipeIds)
//         .execute();
//     }

//     const recipeMap = recipes.reduce((acc, recipe) => {
//       acc[recipe.id] = recipe;
//       return acc;
//     }, {} as any);

//     const mealWithRecipes = {
//       ...meal,
//       protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//       starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//       vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//       sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//     };

//     console.log('Found meal for date with', Object.keys(recipeMap).length, 'recipes');
//     res.json(mealWithRecipes);
//     return;
//   } catch (error) {
//     console.error('Error fetching meal:', error);
//     res.status(500).json({ error: 'Failed to fetch meal', details: error.message });
//     return;
//   }
// });

// // Create or update meal for a date
// router.post('/', async (req, res) => {
//   try {
//     const { meal_date, meal_name, servings_needed, protein_recipe_id, starch_recipe_id, vegetable_recipe_id, sauce_recipe_id } = req.body;
    
//     if (!meal_date || !servings_needed) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, servings_needed' });
//       return;
//     }

//     console.log('Creating/updating meal for date:', meal_date);

//     // Check if meal exists for this date
//     const existingMeal = await db
//       .selectFrom('daily_meals')
//       .select('id')
//       .where('meal_date', '=', meal_date)
//       .executeTakeFirst();

//     if (existingMeal) {
//       // Update existing meal
//       console.log('Updating existing meal with ID:', existingMeal.id);
//       await db
//         .updateTable('daily_meals')
//         .set({
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           updated_at: new Date().toISOString()
//         })
//         .where('id', '=', existingMeal.id)
//         .execute();

//       res.json({ id: existingMeal.id, message: 'Meal updated successfully' });
//       return;
//     } else {
//       // Create new meal
//       console.log('Creating new meal');
//       const result = await db
//         .insertInto('daily_meals')
//         .values({
//           meal_date,
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         })
//         .executeTakeFirst();

//       // Convert BigInt to number for JSON serialization
//       const insertId = Number(result.insertId);
//       console.log('Meal created with ID:', insertId);
//       res.status(201).json({ id: insertId, message: 'Meal created successfully' });
//       return;
//     }
//   } catch (error) {
//     console.error('Error saving meal:', error);
//     res.status(500).json({ error: 'Failed to save meal', details: error.message });
//     return;
//   }
// });

// // Generate shopping list for selected meals
// router.post('/shopping-list', async (req, res) => {
//   try {
//     const { mealIds } = req.body;
//     console.log('Generating shopping list for meals:', mealIds);

//     if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
//       res.status(400).json({ error: 'No meals selected' });
//       return;
//     }

//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('id', 'in', mealIds)
//       .execute();

//     console.log('Found', meals.length, 'meals for shopping list');

//     const shoppingList: { [key: string]: { amount: number; unit: string } } = {};

//     for (const meal of meals) {
//       const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
//         .filter(id => id !== null);

//       for (const recipeId of recipeIds) {
//         const recipe = await db
//           .selectFrom('recipes')
//           .select(['servings'])
//           .where('id', '=', recipeId!)
//           .executeTakeFirst();

//         if (!recipe) {
//           console.warn('Recipe not found:', recipeId);
//           continue;
//         }

//         const ingredients = await db
//           .selectFrom('recipe_ingredients')
//           .selectAll()
//           .where('recipe_id', '=', recipeId!)
//           .execute();

//         const multiplier = meal.servings_needed / recipe.servings;
//         console.log('Recipe', recipeId, 'multiplier:', multiplier);

//         for (const ingredient of ingredients) {
//           const key = `${ingredient.item} (${ingredient.unit})`;
//           const adjustedAmount = ingredient.amount * multiplier;

//           if (shoppingList[key]) {
//             shoppingList[key].amount += adjustedAmount;
//           } else {
//             shoppingList[key] = {
//               amount: adjustedAmount,
//               unit: ingredient.unit
//             };
//           }
//         }
//       }
//     }

//     const formattedList = Object.entries(shoppingList).map(([item, data]) => ({
//       item: item.replace(` (${data.unit})`, ''),
//       amount: Math.round(data.amount * 100) / 100,
//       unit: data.unit
//     }));

//     console.log('Generated shopping list with', formattedList.length, 'items');
//     res.json(formattedList);
//     return;
//   } catch (error) {
//     console.error('Error generating shopping list:', error);
//     res.status(500).json({ error: 'Failed to generate shopping list', details: error.message });
//     return;
//   }
// });

// export { router as mealsRouter };


// import express from 'express';
// import { db } from '../db/database.js';
// import type { DailyMeal, Recipe } from '../db/types.js';
// import type { Selectable } from 'kysely';

// const router = express.Router();

// // Get all daily meals with recipe info
// router.get('/', async (req, res) => {
//   try {
//     console.log('Fetching all daily meals');

//     const meals: Selectable<DailyMeal>[] = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     // Attach recipe info to each meal
//     const detailedMeals = await Promise.all(
//       meals.map(async (meal: Selectable<DailyMeal>) => {
//         const recipe = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipes.category_id',
//             'recipe_categories.name as category_name'
//           ])
//           .where('recipes.id', '=', meal.recipe_id)
//           .executeTakeFirst();

//         return { ...meal, recipe };
//       })
//     );

//     res.json(detailedMeals);
//   } catch (error) {
//     console.error('Error fetching daily meals:', error);
//     res.status(500).json({ error: 'Failed to fetch daily meals', details: (error as Error).message });
//   }
// });

// // Get meals by specific date
// router.get('/:date', async (req, res) => {
//   try {
//     const mealDate = req.params.date;
//     console.log('Fetching meals for date:', mealDate);

//     const meals: Selectable<DailyMeal>[] = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('meal_date', '=', mealDate)
//       .orderBy('meal_date', 'desc')
//       .execute();

//     const detailedMeals = await Promise.all(
//       meals.map(async (meal: Selectable<DailyMeal>) => {
//         const recipe = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipes.category_id',
//             'recipe_categories.name as category_name'
//           ])
//           .where('recipes.id', '=', meal.recipe_id)
//           .executeTakeFirst();

//         return { ...meal, recipe };
//       })
//     );

//     res.json(detailedMeals);
//   } catch (error) {
//     console.error('Error fetching meals by date:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: (error as Error).message });
//   }
// });

// // Create new daily meal
// router.post('/', async (req, res) => {
//   try {
//     const { meal_date, recipe_id, servings } = req.body;

//     if (!meal_date || !recipe_id || !servings) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, recipe_id, servings' });
//       return;
//     }

//     const result = await db
//       .insertInto('daily_meals')
//       .values({
//         meal_date,
//         recipe_id,
//         servings,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       })
//       .executeTakeFirst();

//     const mealId = Number(result.insertId);

//     res.status(201).json({ id: mealId, message: 'Daily meal created successfully' });
//   } catch (error) {
//     console.error('Error creating daily meal:', error);
//     res.status(500).json({ error: 'Failed to create daily meal', details: (error as Error).message });
//   }
// });

// // Update existing daily meal
// router.put('/:id', async (req, res) => {
//   try {
//     const mealId = parseInt(req.params.id);
//     if (isNaN(mealId)) {
//       res.status(400).json({ error: 'Invalid meal ID' });
//       return;
//     }

//     const { meal_date, recipe_id, servings } = req.body;

//     const result = await db
//       .updateTable('daily_meals')
//       .set({
//         meal_date,
//         recipe_id,
//         servings,
//         updated_at: new Date().toISOString()
//       })
//       .where('id', '=', mealId)
//       .executeTakeFirst();

//     res.json({ message: 'Daily meal updated successfully', result });
//   } catch (error) {
//     console.error('Error updating daily meal:', error);
//     res.status(500).json({ error: 'Failed to update daily meal', details: (error as Error).message });
//   }
// });

// // Delete a daily meal
// router.delete('/:id', async (req, res) => {
//   try {
//     const mealId = parseInt(req.params.id);
//     if (isNaN(mealId)) {
//       res.status(400).json({ error: 'Invalid meal ID' });
//       return;
//     }

//     await db.deleteFrom('daily_meals').where('id', '=', mealId).execute();

//     res.json({ message: 'Daily meal deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting daily meal:', error);
//     res.status(500).json({ error: 'Failed to delete daily meal', details: (error as Error).message });
//   }
// });

// export { router as mealsRouter };


// import express from 'express';
// import { db } from '../db/database.js';
// import type { DailyMeal, Recipe } from '../db/types.js';

// const router = express.Router();

// // Get all daily meals
// router.get('/', async (req, res) => {
//   try {
//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     res.json(meals);
//   } catch (error: any) {
//     console.error('Error fetching daily meals:', error);
//     res.status(500).json({ error: 'Failed to fetch daily meals', details: error.message });
//   }
// });

// // Get meals by date
// router.get('/:date', async (req, res) => {
//   try {
//     const mealDate = req.params.date;

//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('meal_date', '=', mealDate)
//       .execute();

//     const mealsWithRecipes = await Promise.all(
//       meals.map(async (meal: DailyMeal) => {
//         const recipe = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipes.category_id',
//             'recipe_categories.name as category_name'
//           ])
//           .where('recipes.id', '=', meal.recipe_id)
//           .executeTakeFirst();

//         return { ...meal, recipe };
//       })
//     );

//     res.json(mealsWithRecipes);
//   } catch (error: any) {
//     console.error('Error fetching meals by date:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: error.message });
//   }
// });

// // Create or update a daily meal
// router.post('/', async (req, res) => {
//   try {
//     const { meal_date, recipe_id, servings } = req.body;

//     if (!meal_date || !recipe_id || !servings) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, recipe_id, servings' });
//       return;
//     }

//     // Check if meal already exists for that date and recipe
//     const existing = await db
//       .selectFrom('daily_meals')
//       .select('id')
//       .where('meal_date', '=', meal_date)
//       .where('recipe_id', '=', recipe_id)
//       .executeTakeFirst();

//     if (existing) {
//       // Update servings
//       await db
//         .updateTable('daily_meals')
//         .set({ servings, updated_at: new Date().toISOString() })
//         .where('id', '=', existing.id)
//         .execute();

//       res.json({ message: 'Meal updated successfully', id: existing.id });
//       return;
//     }

//     // Insert new daily meal
//     const result = await db
//       .insertInto('daily_meals')
//       .values({
//         meal_date,
//         recipe_id,
//         servings,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString()
//       })
//       .executeTakeFirst();

//     res.status(201).json({ message: 'Meal created successfully', id: Number(result.insertId) });
//   } catch (error: any) {
//     console.error('Error creating/updating meal:', error);
//     res.status(500).json({ error: 'Failed to create/update meal', details: error.message });
//   }
// });

// export { router as mealsRouter };


// import express from 'express';
// import { db } from '../db/database.js';
// import { DailyMeal, Recipe } from '../db/types.js'; // we will create these types

// const router = express.Router();

// // Get all meals
// router.get('/', async (_req, res) => {
//   try {
//     const meals: DailyMeal[] = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     const mealsWithRecipes = await Promise.all(
//       meals.map(async (meal) => {
//         const recipeIds = [
//           meal.protein_recipe_id,
//           meal.starch_recipe_id,
//           meal.vegetable_recipe_id,
//           meal.sauce_recipe_id,
//         ].filter((id): id is number => id !== null);

//         let recipes: Recipe[] = [];
//         if (recipeIds.length > 0) {
//           recipes = await db
//             .selectFrom('recipes')
//             .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//             .select([
//               'recipes.id',
//               'recipes.name',
//               'recipes.servings',
//               'recipe_categories.name as category_name',
//             ])
//             .where('recipes.id', 'in', recipeIds)
//             .execute();
//         }

//         const recipeMap: Record<number, Recipe> = recipes.reduce((acc, recipe) => {
//           acc[recipe.id] = recipe;
//           return acc;
//         }, {} as Record<number, Recipe>);

//         return {
//           ...meal,
//           protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//           starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//           vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//           sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//         };
//       })
//     );

//     res.json(mealsWithRecipes);
//   } catch (error: any) {
//     console.error('Error fetching meals:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: error.message });
//   }
// });

// // Get meals for a specific date
// router.get('/:date', async (req, res) => {
//   try {
//     const mealDate = req.params.date;
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
//       res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
//       return;
//     }

//     const meal: DailyMeal | undefined = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('meal_date', '=', mealDate)
//       .executeTakeFirst();

//     if (!meal) {
//       res.json(null);
//       return;
//     }

//     const recipeIds = [
//       meal.protein_recipe_id,
//       meal.starch_recipe_id,
//       meal.vegetable_recipe_id,
//       meal.sauce_recipe_id,
//     ].filter((id): id is number => id !== null);

//     let recipes: Recipe[] = [];
//     if (recipeIds.length > 0) {
//       recipes = await db
//         .selectFrom('recipes')
//         .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//         .select([
//           'recipes.id',
//           'recipes.name',
//           'recipes.servings',
//           'recipe_categories.name as category_name',
//         ])
//         .where('recipes.id', 'in', recipeIds)
//         .execute();
//     }

//     const recipeMap: Record<number, Recipe> = recipes.reduce((acc, recipe) => {
//       acc[recipe.id] = recipe;
//       return acc;
//     }, {} as Record<number, Recipe>);

//     const mealWithRecipes = {
//       ...meal,
//       protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//       starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//       vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//       sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//     };

//     res.json(mealWithRecipes);
//   } catch (error: any) {
//     console.error('Error fetching meal:', error);
//     res.status(500).json({ error: 'Failed to fetch meal', details: error.message });
//   }
// });

// // Create or update meal
// router.post('/', async (req, res) => {
//   try {
//     const body = req.body as Partial<DailyMeal> & { meal_date: string; servings_needed: number };
//     const { meal_date, meal_name, servings_needed, protein_recipe_id, starch_recipe_id, vegetable_recipe_id, sauce_recipe_id } = body;

//     if (!meal_date || !servings_needed) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, servings_needed' });
//       return;
//     }

//     const existingMeal = await db
//       .selectFrom('daily_meals')
//       .select('id')
//       .where('meal_date', '=', meal_date)
//       .executeTakeFirst();

//     if (existingMeal) {
//       await db
//         .updateTable('daily_meals')
//         .set({
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           updated_at: new Date().toISOString(),
//         })
//         .where('id', '=', existingMeal.id)
//         .execute();

//       res.json({ id: existingMeal.id, message: 'Meal updated successfully' });
//     } else {
//       const result = await db
//         .insertInto('daily_meals')
//         .values({
//           meal_date,
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString(),
//         })
//         .executeTakeFirst();

//       const insertId = Number(result.insertId); // convert bigint to number
//       res.status(201).json({ id: insertId, message: 'Meal created successfully' });
//     }
//   } catch (error: any) {
//     console.error('Error saving meal:', error);
//     res.status(500).json({ error: 'Failed to save meal', details: error.message });
//   }
// });

// export { router as mealsRouter };


// import express from 'express';
// import { db } from '../db/database.js';

// const router = express.Router();

// // Get all meals
// router.get('/', async (req, res) => {
//   try {
//     console.log('Fetching all meals');

//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .orderBy('meal_date', 'desc')
//       .execute();

//     console.log('Found meals:', meals.length);

//     const mealsWithRecipes = [];

//     for (const meal of meals) {
//       const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
//         .filter(id => id !== null);

//       let recipes = [];
//       if (recipeIds.length > 0) {
//         recipes = await db
//           .selectFrom('recipes')
//           .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//           .select([
//             'recipes.id',
//             'recipes.name',
//             'recipes.servings',
//             'recipe_categories.name as category_name'
//           ])
//           .where('recipes.id', 'in', recipeIds)
//           .execute();
//       }

//       const recipeMap = recipes.reduce((acc, recipe) => {
//         acc[recipe.id] = recipe;
//         return acc;
//       }, {} as any);

//       mealsWithRecipes.push({
//         ...meal,
//         protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//         starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//         vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//         sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//       });
//     }

//     res.json(mealsWithRecipes);
//     return;
//   } catch (error) {
//     console.error('Error fetching meals:', error);
//     res.status(500).json({ error: 'Failed to fetch meals', details: error.message });
//     return;
//   }
// });

// // Get meals for a specific date
// router.get('/:date', async (req, res) => {
//   try {
//     const mealDate = req.params.date;
//     console.log('Fetching meal for date:', mealDate);

//     // Validate date format
//     if (!/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
//       res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
//       return;
//     }

//     const meal = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('meal_date', '=', mealDate)
//       .executeTakeFirst();

//     if (!meal) {
//       console.log('No meal found for date:', mealDate);
//       res.json(null);
//       return;
//     }

//     // Get recipe details for each component
//     const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
//       .filter(id => id !== null);

//     let recipes = [];
//     if (recipeIds.length > 0) {
//       recipes = await db
//         .selectFrom('recipes')
//         .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
//         .select([
//           'recipes.id',
//           'recipes.name',
//           'recipes.servings',
//           'recipe_categories.name as category_name'
//         ])
//         .where('recipes.id', 'in', recipeIds)
//         .execute();
//     }

//     const recipeMap = recipes.reduce((acc, recipe) => {
//       acc[recipe.id] = recipe;
//       return acc;
//     }, {} as any);

//     const mealWithRecipes = {
//       ...meal,
//       protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
//       starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
//       vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
//       sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
//     };

//     console.log('Found meal for date with', Object.keys(recipeMap).length, 'recipes');
//     res.json(mealWithRecipes);
//     return;
//   } catch (error) {
//     console.error('Error fetching meal:', error);
//     res.status(500).json({ error: 'Failed to fetch meal', details: error.message });
//     return;
//   }
// });

// // Create or update meal for a date
// router.post('/', async (req, res) => {
//   try {
//     const { meal_date, meal_name, servings_needed, protein_recipe_id, starch_recipe_id, vegetable_recipe_id, sauce_recipe_id } = req.body;
    
//     if (!meal_date || !servings_needed) {
//       res.status(400).json({ error: 'Missing required fields: meal_date, servings_needed' });
//       return;
//     }

//     console.log('Creating/updating meal for date:', meal_date);

//     // Check if meal exists for this date
//     const existingMeal = await db
//       .selectFrom('daily_meals')
//       .select('id')
//       .where('meal_date', '=', meal_date)
//       .executeTakeFirst();

//     if (existingMeal) {
//       // Update existing meal
//       console.log('Updating existing meal with ID:', existingMeal.id);
//       await db
//         .updateTable('daily_meals')
//         .set({
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           updated_at: new Date().toISOString()
//         })
//         .where('id', '=', existingMeal.id)
//         .execute();

//       res.json({ id: existingMeal.id, message: 'Meal updated successfully' });
//       return;
//     } else {
//       // Create new meal
//       console.log('Creating new meal');
//       const result = await db
//         .insertInto('daily_meals')
//         .values({
//           meal_date,
//           meal_name: meal_name || null,
//           servings_needed,
//           protein_recipe_id: protein_recipe_id || null,
//           starch_recipe_id: starch_recipe_id || null,
//           vegetable_recipe_id: vegetable_recipe_id || null,
//           sauce_recipe_id: sauce_recipe_id || null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         })
//         .executeTakeFirst();

//       // Convert BigInt to number for JSON serialization
//       const insertId = Number(result.insertId);
//       console.log('Meal created with ID:', insertId);
//       res.status(201).json({ id: insertId, message: 'Meal created successfully' });
//       return;
//     }
//   } catch (error) {
//     console.error('Error saving meal:', error);
//     res.status(500).json({ error: 'Failed to save meal', details: error.message });
//     return;
//   }
// });

// // Generate shopping list for selected meals
// router.post('/shopping-list', async (req, res) => {
//   try {
//     const { mealIds } = req.body;
//     console.log('Generating shopping list for meals:', mealIds);

//     if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
//       res.status(400).json({ error: 'No meals selected' });
//       return;
//     }

//     const meals = await db
//       .selectFrom('daily_meals')
//       .selectAll()
//       .where('id', 'in', mealIds)
//       .execute();

//     console.log('Found', meals.length, 'meals for shopping list');

//     const shoppingList: { [key: string]: { amount: number; unit: string } } = {};

//     for (const meal of meals) {
//       const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
//         .filter(id => id !== null);

//       for (const recipeId of recipeIds) {
//         const recipe = await db
//           .selectFrom('recipes')
//           .select(['servings'])
//           .where('id', '=', recipeId!)
//           .executeTakeFirst();

//         if (!recipe) {
//           console.warn('Recipe not found:', recipeId);
//           continue;
//         }

//         const ingredients = await db
//           .selectFrom('recipe_ingredients')
//           .selectAll()
//           .where('recipe_id', '=', recipeId!)
//           .execute();

//         const multiplier = meal.servings_needed / recipe.servings;
//         console.log('Recipe', recipeId, 'multiplier:', multiplier);

//         for (const ingredient of ingredients) {
//           const key = `${ingredient.item} (${ingredient.unit})`;
//           const adjustedAmount = ingredient.amount * multiplier;

//           if (shoppingList[key]) {
//             shoppingList[key].amount += adjustedAmount;
//           } else {
//             shoppingList[key] = {
//               amount: adjustedAmount,
//               unit: ingredient.unit
//             };
//           }
//         }
//       }
//     }

//     const formattedList = Object.entries(shoppingList).map(([item, data]) => ({
//       item: item.replace(` (${data.unit})`, ''),
//       amount: Math.round(data.amount * 100) / 100,
//       unit: data.unit
//     }));

//     console.log('Generated shopping list with', formattedList.length, 'items');
//     res.json(formattedList);
//     return;
//   } catch (error) {
//     console.error('Error generating shopping list:', error);
//     res.status(500).json({ error: 'Failed to generate shopping list', details: error.message });
//     return;
//   }
// });

// export { router as mealsRouter };
