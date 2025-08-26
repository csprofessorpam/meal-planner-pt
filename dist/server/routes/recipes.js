import express from 'express';
import { db } from '../db/database.js';
const router = express.Router();
// Get all recipe categories
router.get('/categories', async (req, res) => {
    try {
        console.log('Fetching recipe categories');
        const categories = await db.selectFrom('recipe_categories').selectAll().execute();
        console.log('Found categories:', categories.length);
        res.json(categories);
        return;
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
        return;
    }
});
// Get all recipes with category info
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all recipes');
        const recipes = await db
            .selectFrom('recipes')
            .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
            .select([
            'recipes.id',
            'recipes.name',
            'recipes.servings',
            'recipes.category_id',
            'recipe_categories.name as category_name',
            'recipes.created_at',
            'recipes.updated_at'
        ])
            .execute();
        console.log('Found recipes:', recipes.length);
        res.json(recipes);
        return;
    }
    catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Failed to fetch recipes', details: error.message });
        return;
    }
});
// Get single recipe with ingredients and directions
router.get('/:id', async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id);
        if (isNaN(recipeId)) {
            res.status(400).json({ error: 'Invalid recipe ID' });
            return;
        }
        console.log('Fetching recipe details for ID:', recipeId);
        const recipe = await db
            .selectFrom('recipes')
            .innerJoin('recipe_categories', 'recipes.category_id', 'recipe_categories.id')
            .select([
            'recipes.id',
            'recipes.name',
            'recipes.servings',
            'recipes.category_id',
            'recipe_categories.name as category_name'
        ])
            .where('recipes.id', '=', recipeId)
            .executeTakeFirst();
        if (!recipe) {
            res.status(404).json({ error: 'Recipe not found' });
            return;
        }
        const ingredients = await db
            .selectFrom('recipe_ingredients')
            .selectAll()
            .where('recipe_id', '=', recipeId)
            .execute();
        const directions = await db
            .selectFrom('recipe_directions')
            .selectAll()
            .where('recipe_id', '=', recipeId)
            .orderBy('step_number')
            .execute();
        console.log('Recipe found with', ingredients.length, 'ingredients and', directions.length, 'directions');
        res.json({ ...recipe, ingredients, directions });
        return;
    }
    catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Failed to fetch recipe', details: error.message });
        return;
    }
});
// Create new recipe
router.post('/', async (req, res) => {
    try {
        const { name, category_id, servings, ingredients, directions } = req.body;
        if (!name || !category_id || !servings) {
            res.status(400).json({ error: 'Missing required fields: name, category_id, servings' });
            return;
        }
        console.log('Creating new recipe:', name);
        const result = await db
            .insertInto('recipes')
            .values({
            name,
            category_id,
            servings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
            .executeTakeFirst();
        // Convert BigInt to number for JSON serialization
        const recipeId = Number(result.insertId);
        console.log('Recipe created with ID:', recipeId);
        // Insert ingredients
        if (ingredients && ingredients.length > 0) {
            console.log('Inserting', ingredients.length, 'ingredients');
            await db
                .insertInto('recipe_ingredients')
                .values(ingredients.map((ing) => ({
                recipe_id: recipeId,
                item: ing.item,
                amount: ing.amount,
                unit: ing.unit
            })))
                .execute();
        }
        // Insert directions
        if (directions && directions.length > 0) {
            console.log('Inserting', directions.length, 'directions');
            await db
                .insertInto('recipe_directions')
                .values(directions.map((dir, index) => ({
                recipe_id: recipeId,
                step_number: index + 1,
                instruction: dir.instruction
            })))
                .execute();
        }
        console.log('Recipe created successfully');
        res.status(201).json({ id: recipeId, message: 'Recipe created successfully' });
        return;
    }
    catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Failed to create recipe', details: error.message });
        return;
    }
});
export { router as recipesRouter };
