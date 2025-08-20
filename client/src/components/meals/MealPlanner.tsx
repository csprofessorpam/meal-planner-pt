import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MealEditor } from './MealEditor';

export function MealPlanner() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [meal, setMeal] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchMeal = React.useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const dateString = formatDate(date);
      const response = await fetch(`/api/meals/${dateString}`);
      if (response.ok) {
        const data = await response.json();
        setMeal(data);
      } else {
        setMeal(null);
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
      setMeal(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMeal(selectedDate);
  }, [selectedDate, fetchMeal]);

  const handleMealSaved = () => {
    fetchMeal(selectedDate);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[240px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? formatDisplayDate(selectedDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {loading ? (
        <div>Loading meal plan...</div>
      ) : (
        <MealEditor 
          date={selectedDate} 
          meal={meal} 
          onMealSaved={handleMealSaved} 
        />
      )}
    </div>
  );
}
