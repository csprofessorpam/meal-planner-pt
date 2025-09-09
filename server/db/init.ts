// server/db/init.ts
import { db } from './database.js'; // NOTE: .js extension required in ESM

/**
 * Initialize the database: create tables if missing, seed categories
 */
export async function initializeDatabase() {
  console.log('Initializing database...');

  try {
    // Create tables if they don't exist
    await db.schema
      .createTable('recipe_categories')
      .ifNotExists()
      .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', col => col.notNull())
      .addColumn('created_at', 'text', col => col.notNull())
      .execute();

    await db.schema
      .createTable('recipes')
      .ifNotExists()
      .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
      .addColumn('name', 'text', col => col.notNull())
      .addColumn('category_id', 'integer', col => col.notNull())
      .addColumn('servings', 'integer', col => col.notNull())
      .addColumn('created_at', 'text', col => col.notNull())
      .addColumn('updated_at', 'text', col => col.notNull())
      .execute();

    await db.schema
      .createTable('recipe_ingredients')
      .ifNotExists()
      .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
      .addColumn('recipe_id', 'integer', col => col.notNull())
      .addColumn('item', 'text', col => col.notNull())
      .addColumn('amount', 'real', col => col.notNull())
      .addColumn('unit', 'text', col => col.notNull())
      .execute();

    await db.schema
      .createTable('recipe_directions')
      .ifNotExists()
      .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
      .addColumn('recipe_id', 'integer', col => col.notNull())
      .addColumn('step_number', 'integer', col => col.notNull())
      .addColumn('instruction', 'text', col => col.notNull())
      .execute();

    await db.schema
      .createTable('daily_meals')
      .ifNotExists()
      .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
      .addColumn('meal_date', 'text', col => col.notNull())
      .addColumn('meal_name', 'text') // optional
      .addColumn('servings_needed', 'integer', col => col.notNull())
      .addColumn('protein_recipe_id', 'integer')
      .addColumn('starch_recipe_id', 'integer')
      .addColumn('vegetable_recipe_id', 'integer')
      .addColumn('sauce_recipe_id', 'integer')
      .addColumn('created_at', 'text', col => col.notNull())
      .addColumn('updated_at', 'text', col => col.notNull())
      .execute();

    console.log('All tables ensured to exist.');

    // Seed recipe_categories if empty
    const categoryCount = await db
      .selectFrom('recipe_categories')
      .select(db => db.fn.count('id').as('count'))
      .executeTakeFirst();

    const count = Number(categoryCount?.count || 0);
    console.log('Current recipe_categories count:', count);

    if (count === 0) {
      console.log('Seeding recipe_categories...');
      const categories = [
        'Chicken',
        'Beef',
        'Fish',
        'Vegetarian Protein',
        'Starch',
        'Vegetable',
        'Sauce',
      ];

      await db.insertInto('recipe_categories')
        .values(categories.map(name => ({
          name,
          created_at: new Date().toISOString()
        })))
        .execute();

      console.log('Recipe categories seeded successfully.');
    } else {
      console.log('Recipe categories already exist, skipping seed.');
    }

    console.log('Database initialization completed.');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}


// // server/db/init.ts
// import { db } from './database';
// //removed .ts

// /**
//  * Initialize the database: create tables if missing, seed categories
//  */
// export async function initializeDatabase() {
//   console.log('Initializing database...');

//   try {
//     // Create tables if they don't exist
//     await db.schema
//       .createTable('recipe_categories')
//       .ifNotExists()
//       .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
//       .addColumn('name', 'text', col => col.notNull())
//       .addColumn('created_at', 'text', col => col.notNull())
//       .execute();

//     await db.schema
//       .createTable('recipes')
//       .ifNotExists()
//       .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
//       .addColumn('name', 'text', col => col.notNull())
//       .addColumn('category_id', 'integer', col => col.notNull())
//       .addColumn('servings', 'integer', col => col.notNull())
//       .addColumn('created_at', 'text', col => col.notNull())
//       .addColumn('updated_at', 'text', col => col.notNull())
//       .execute();

//     await db.schema
//       .createTable('recipe_ingredients')
//       .ifNotExists()
//       .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
//       .addColumn('recipe_id', 'integer', col => col.notNull())
//       .addColumn('item', 'text', col => col.notNull())
//       .addColumn('amount', 'real', col => col.notNull())
//       .addColumn('unit', 'text', col => col.notNull())
//       .execute();

//     await db.schema
//       .createTable('recipe_directions')
//       .ifNotExists()
//       .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
//       .addColumn('recipe_id', 'integer', col => col.notNull())
//       .addColumn('step_number', 'integer', col => col.notNull())
//       .addColumn('instruction', 'text', col => col.notNull())
//       .execute();

// await db.schema
//   .createTable('daily_meals')
//   .ifNotExists()
//   .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
//   .addColumn('meal_date', 'text', col => col.notNull())
//   .addColumn('meal_name', 'text') // optional column
//   .addColumn('servings_needed', 'integer', col => col.notNull())
//   .addColumn('protein_recipe_id', 'integer')
//   .addColumn('starch_recipe_id', 'integer')
//   .addColumn('vegetable_recipe_id', 'integer')
//   .addColumn('sauce_recipe_id', 'integer')
//   .addColumn('created_at', 'text', col => col.notNull())
//   .addColumn('updated_at', 'text', col => col.notNull())
//   .execute();


//     console.log('All tables ensured to exist.');

//     // Seed recipe_categories if empty
//     const categoryCount = await db
//       .selectFrom('recipe_categories')
//       .select(db => db.fn.count('id').as('count'))
//       .executeTakeFirst();

//     const count = Number(categoryCount?.count || 0);
//     console.log('Current recipe_categories count:', count);

//     if (count === 0) {
//       console.log('Seeding recipe_categories...');
//       const categories = [
//         'Chicken',
//         'Beef',
//         'Fish',
//         'Vegetarian Protein',
//         'Starch',
//         'Vegetable',
//         'Sauce',
//       ];

//       await db.insertInto('recipe_categories')
//         .values(categories.map(name => ({
//           name,
//           created_at: new Date().toISOString()
//         })))
//         .execute();

//       console.log('Recipe categories seeded successfully.');
//     } else {
//       console.log('Recipe categories already exist, skipping seed.');
//     }

//     console.log('Database initialization completed.');
//   } catch (err) {
//     console.error('Error initializing database:', err);
//     throw err;
//   }
// }

// //call it
// // Node ESM safe call
// (async () => {
//   await initializeDatabase();
// })();


// import { db } from './database.js';

// export async function initializeDatabase() {
//   console.log('Initializing database...');

//   try {
//     // Check if recipe_categories table exists and has data
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
//         { name: 'Sauce' },
//       ];

//       await db
//         .insertInto('recipe_categories')
//         .values(
//           categories.map(cat => ({
//             name: cat.name,
//             created_at: new Date().toISOString(),
//           }))
//         )
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


// // server/db/init.ts
// import { db } from './database.js';

// export async function initializeDatabase() {
//   console.log('Initializing database...');

//   try {
//     // Check if recipe_categories table exists and has data
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
//         { name: 'Sauce' },
//       ];

//       await db
//         .insertInto('recipe_categories')
//         .values(
//           categories.map(cat => ({
//             name: cat.name,
//             created_at: new Date().toISOString(), // Kysely expects string for SQLite
//           }))
//         )
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
