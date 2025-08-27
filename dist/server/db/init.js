// server/db/init.ts
import { db } from './database.js';
export async function initializeDatabase() {
    console.log('Initializing database...');
    try {
        // Check if recipe_categories table exists and has data
        const categoryCount = await db
            .selectFrom('recipe_categories')
            .select(db => db.fn.count('id').as('count'))
            .executeTakeFirst();
        const count = Number(categoryCount?.count || 0);
        console.log('Current category count:', count);
        if (count === 0) {
            console.log('Seeding recipe categories...');
            const categories = [
                { name: 'Chicken' },
                { name: 'Beef' },
                { name: 'Fish' },
                { name: 'Vegetarian Protein' },
                { name: 'Starch' },
                { name: 'Vegetable' },
                { name: 'Sauce' },
            ];
            await db
                .insertInto('recipe_categories')
                .values(categories.map(cat => ({
                name: cat.name,
                created_at: new Date().toISOString(), // Kysely expects string for SQLite
            })))
                .execute();
            console.log('Recipe categories seeded successfully');
        }
        else {
            console.log('Recipe categories already exist, skipping seed');
        }
        console.log('Database initialization completed');
    }
    catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}
// server/db/init.ts
// import { db } from './database.js';
// import { Database } from './types.js';  // import the types
// export async function initializeDatabase() {
//   console.log('Initializing database...');
//   try {
//     // Check if categories table has data
//     const categoryCount = await db
//       .selectFrom('recipe_categories')
//       .select(db => db.fn.count('id').as('count'))
//       .executeTakeFirst();
//     const count = Number(categoryCount?.count || 0);
//     console.log('Current category count:', count);
//     if (count === 0) {
//       console.log('Seeding recipe categories...');
//       const categories: Omit<Database['recipe_categories'], 'id'>[] = [
//         { name: 'Chicken', created_at: new Date().toISOString() },
//         { name: 'Beef', created_at: new Date().toISOString() },
//         { name: 'Fish', created_at: new Date().toISOString() },
//         { name: 'Vegetarian Protein', created_at: new Date().toISOString() },
//         { name: 'Starch', created_at: new Date().toISOString() },
//         { name: 'Vegetable', created_at: new Date().toISOString() },
//         { name: 'Sauce', created_at: new Date().toISOString() }
//       ];
//       await db
//         .insertInto('recipe_categories')
//         .values(categories)
//         .execute();
//       console.log('Recipe categories seeded successfully');
//     } else {
//       console.log('Recipe categories already exist, skipping seed');
//     }
//     console.log('Database initialization completed');
//   } catch (error) {
//     console.error('Error initializing database:', error);
//     throw error;
//   }
// }
// import { db } from './database.js';
// export async function initializeDatabase() {
//   console.log('Initializing database...');
//   try {
//     // Check if categories table has data
//     const categoryCount = await db
//       .selectFrom('recipe_categories')
//       .select(db => db.fn.count('id').as('count'))
//       .executeTakeFirst();
//     const count = Number(categoryCount?.count || 0);
//     console.log('Current category count:', count);
//     if (count === 0) {
//       console.log('Seeding recipe categories...');
//       const categories = [
//         { name: 'Chicken' },
//         { name: 'Beef' },
//         { name: 'Fish' },
//         { name: 'Vegetarian Protein' },
//         { name: 'Starch' },
//         { name: 'Vegetable' },
//         { name: 'Sauce' }
//       ];
//       await db
//         .insertInto('recipe_categories')
//         .values(categories.map(cat => ({
//           ...cat,
//           created_at: new Date().toISOString()
//         })))
//         .execute();
//       console.log('Recipe categories seeded successfully');
//     } else {
//       console.log('Recipe categories already exist, skipping seed');
//     }
//     console.log('Database initialization completed');
//   } catch (error) {
//     console.error('Error initializing database:', error);
//     throw error;
//   }
// }
