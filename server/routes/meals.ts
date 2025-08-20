import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Get all meals
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all meals');

    const meals = await db
      .selectFrom('daily_meals')
      .selectAll()
      .orderBy('meal_date', 'desc')
      .execute();

    console.log('Found meals:', meals.length);

    const mealsWithRecipes = [];

    for (const meal of meals) {
      const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
        .filter(id => id !== null);

      let recipes = [];
      if (recipeIds.length > 0) {
        recipes = await db
          .selectFrom('recipes')
          .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
          .select([
            'recipes.id',
            'recipes.name',
            'recipes.servings',
            'recipe_categories.name as category_name'
          ])
          .where('recipes.id', 'in', recipeIds)
          .execute();
      }

      const recipeMap = recipes.reduce((acc, recipe) => {
        acc[recipe.id] = recipe;
        return acc;
      }, {} as any);

      mealsWithRecipes.push({
        ...meal,
        protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
        starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
        vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
        sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
      });
    }

    res.json(mealsWithRecipes);
    return;
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals', details: error.message });
    return;
  }
});

// Get meals for a specific date
router.get('/:date', async (req, res) => {
  try {
    const mealDate = req.params.date;
    console.log('Fetching meal for date:', mealDate);

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(mealDate)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    const meal = await db
      .selectFrom('daily_meals')
      .selectAll()
      .where('meal_date', '=', mealDate)
      .executeTakeFirst();

    if (!meal) {
      console.log('No meal found for date:', mealDate);
      res.json(null);
      return;
    }

    // Get recipe details for each component
    const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
      .filter(id => id !== null);

    let recipes = [];
    if (recipeIds.length > 0) {
      recipes = await db
        .selectFrom('recipes')
        .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
        .select([
          'recipes.id',
          'recipes.name',
          'recipes.servings',
          'recipe_categories.name as category_name'
        ])
        .where('recipes.id', 'in', recipeIds)
        .execute();
    }

    const recipeMap = recipes.reduce((acc, recipe) => {
      acc[recipe.id] = recipe;
      return acc;
    }, {} as any);

    const mealWithRecipes = {
      ...meal,
      protein: meal.protein_recipe_id ? recipeMap[meal.protein_recipe_id] : null,
      starch: meal.starch_recipe_id ? recipeMap[meal.starch_recipe_id] : null,
      vegetable: meal.vegetable_recipe_id ? recipeMap[meal.vegetable_recipe_id] : null,
      sauce: meal.sauce_recipe_id ? recipeMap[meal.sauce_recipe_id] : null,
    };

    console.log('Found meal for date with', Object.keys(recipeMap).length, 'recipes');
    res.json(mealWithRecipes);
    return;
  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({ error: 'Failed to fetch meal', details: error.message });
    return;
  }
});

// Create or update meal for a date
router.post('/', async (req, res) => {
  try {
    const { meal_date, meal_name, servings_needed, protein_recipe_id, starch_recipe_id, vegetable_recipe_id, sauce_recipe_id } = req.body;
    
    if (!meal_date || !servings_needed) {
      res.status(400).json({ error: 'Missing required fields: meal_date, servings_needed' });
      return;
    }

    console.log('Creating/updating meal for date:', meal_date);

    // Check if meal exists for this date
    const existingMeal = await db
      .selectFrom('daily_meals')
      .select('id')
      .where('meal_date', '=', meal_date)
      .executeTakeFirst();

    if (existingMeal) {
      // Update existing meal
      console.log('Updating existing meal with ID:', existingMeal.id);
      await db
        .updateTable('daily_meals')
        .set({
          meal_name: meal_name || null,
          servings_needed,
          protein_recipe_id: protein_recipe_id || null,
          starch_recipe_id: starch_recipe_id || null,
          vegetable_recipe_id: vegetable_recipe_id || null,
          sauce_recipe_id: sauce_recipe_id || null,
          updated_at: new Date().toISOString()
        })
        .where('id', '=', existingMeal.id)
        .execute();

      res.json({ id: existingMeal.id, message: 'Meal updated successfully' });
      return;
    } else {
      // Create new meal
      console.log('Creating new meal');
      const result = await db
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
        .executeTakeFirst();

      // Convert BigInt to number for JSON serialization
      const insertId = Number(result.insertId);
      console.log('Meal created with ID:', insertId);
      res.status(201).json({ id: insertId, message: 'Meal created successfully' });
      return;
    }
  } catch (error) {
    console.error('Error saving meal:', error);
    res.status(500).json({ error: 'Failed to save meal', details: error.message });
    return;
  }
});

// Generate shopping list for selected meals
router.post('/shopping-list', async (req, res) => {
  try {
    const { mealIds } = req.body;
    console.log('Generating shopping list for meals:', mealIds);

    if (!mealIds || !Array.isArray(mealIds) || mealIds.length === 0) {
      res.status(400).json({ error: 'No meals selected' });
      return;
    }

    const meals = await db
      .selectFrom('daily_meals')
      .selectAll()
      .where('id', 'in', mealIds)
      .execute();

    console.log('Found', meals.length, 'meals for shopping list');

    const shoppingList: { [key: string]: { amount: number; unit: string } } = {};

    for (const meal of meals) {
      const recipeIds = [meal.protein_recipe_id, meal.starch_recipe_id, meal.vegetable_recipe_id, meal.sauce_recipe_id]
        .filter(id => id !== null);

      for (const recipeId of recipeIds) {
        const recipe = await db
          .selectFrom('recipes')
          .select(['servings'])
          .where('id', '=', recipeId!)
          .executeTakeFirst();

        if (!recipe) {
          console.warn('Recipe not found:', recipeId);
          continue;
        }

        const ingredients = await db
          .selectFrom('recipe_ingredients')
          .selectAll()
          .where('recipe_id', '=', recipeId!)
          .execute();

        const multiplier = meal.servings_needed / recipe.servings;
        console.log('Recipe', recipeId, 'multiplier:', multiplier);

        for (const ingredient of ingredients) {
          const key = `${ingredient.item} (${ingredient.unit})`;
          const adjustedAmount = ingredient.amount * multiplier;

          if (shoppingList[key]) {
            shoppingList[key].amount += adjustedAmount;
          } else {
            shoppingList[key] = {
              amount: adjustedAmount,
              unit: ingredient.unit
            };
          }
        }
      }
    }

    const formattedList = Object.entries(shoppingList).map(([item, data]) => ({
      item: item.replace(` (${data.unit})`, ''),
      amount: Math.round(data.amount * 100) / 100,
      unit: data.unit
    }));

    console.log('Generated shopping list with', formattedList.length, 'items');
    res.json(formattedList);
    return;
  } catch (error) {
    console.error('Error generating shopping list:', error);
    res.status(500).json({ error: 'Failed to generate shopping list', details: error.message });
    return;
  }
});

export { router as mealsRouter };
