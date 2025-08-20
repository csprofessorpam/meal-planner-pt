import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RecipesPage } from '@/pages/RecipesPage';
import { MealPlanningPage } from '@/pages/MealPlanningPage';
import { ShoppingListPage } from '@/pages/ShoppingListPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Meal Planning App</h1>
              <div className="flex gap-4">
                <Button variant="ghost" asChild>
                  <Link to="/">Recipes</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/meal-planning">Meal Planning</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/shopping-list">Shopping List</Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RecipesPage />} />
            <Route path="/meal-planning" element={<MealPlanningPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
