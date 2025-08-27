export {};
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
