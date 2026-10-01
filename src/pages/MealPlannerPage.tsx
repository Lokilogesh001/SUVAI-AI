
import { useState, useCallback, useEffect } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { Calendar, Utensils, Plus, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import MealPlannerForm from "@/components/MealPlannerForm";
import Navbar from "@/components/Navbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define meal type
interface Meal {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner";
  date: Date;
  notes?: string;
}

// Local storage key
const STORAGE_KEY = "meal-planner-data";

const MealPlannerPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [activeTab, setActiveTab] = useState("day");

  // Load meals from local storage on initial render
  useEffect(() => {
    const savedMeals = localStorage.getItem(STORAGE_KEY);
    if (savedMeals) {
      try {
        const parsedMeals = JSON.parse(savedMeals).map((meal: any) => ({
          ...meal,
          date: new Date(meal.date),
        }));
        setMeals(parsedMeals);
      } catch (error) {
        console.error("Failed to parse meals from localStorage:", error);
      }
    }
  }, []);

  // Save meals to local storage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
  }, [meals]);

  // Get days of current week
  const getWeekDays = useCallback(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [selectedDate]);

  const weekDays = getWeekDays();

  // Filter meals for the selected day
  const getMealsForDay = useCallback(
    (date: Date, type: "breakfast" | "lunch" | "dinner") => {
      return meals.filter(
        (meal) => 
          format(meal.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") && 
          meal.type === type
      );
    },
    [meals]
  );

  // Add a meal
  const addMeal = useCallback((newMeal: Omit<Meal, "id">) => {
    const meal = {
      ...newMeal,
      id: crypto.randomUUID(),
    };
    
    setMeals(prev => [...prev, meal]);
    setIsAddingMeal(false);
    
    toast({
      title: "Meal added",
      description: `${meal.name} added to your meal plan`,
    });
  }, [toast]);

  // Delete a meal
  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter((meal) => meal.id !== id));
    
    toast({
      title: "Meal removed",
      description: "Meal removed from your plan",
    });
  }, [toast]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Switch to day view when selecting a date
      setActiveTab("day");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="content-grid pt-24 md:pt-28 pb-16">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <div className="w-full md:w-1/4">
            <Card className="h-full transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{t("mealplanner.calendar")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md pointer-events-auto"
                />
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-3/4">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  <span>{t("mealplanner.title")}</span>
                </CardTitle>
                <Button 
                  onClick={() => setIsAddingMeal(true)} 
                  size="sm" 
                  className="gap-1 animate-fade-in"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("mealplanner.add")}</span>
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="day">{t("mealplanner.day")}</TabsTrigger>
                    <TabsTrigger value="week">{t("mealplanner.week")}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="day" className="animate-fade-in">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">{t("mealplanner.breakfast")}</h3>
                        <div className="space-y-2">
                          {getMealsForDay(selectedDate, "breakfast").length > 0 ? (
                            getMealsForDay(selectedDate, "breakfast").map((meal) => (
                              <div 
                                key={meal.id} 
                                className="flex items-center justify-between p-3 bg-accent/50 rounded-md animate-fade-in transition-all hover:bg-accent/70"
                              >
                                <span>{meal.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteMeal(meal.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm p-3 bg-muted/50 rounded-md">
                              {t("mealplanner.no-meals")}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">{t("mealplanner.lunch")}</h3>
                        <div className="space-y-2">
                          {getMealsForDay(selectedDate, "lunch").length > 0 ? (
                            getMealsForDay(selectedDate, "lunch").map((meal) => (
                              <div 
                                key={meal.id} 
                                className="flex items-center justify-between p-3 bg-accent/50 rounded-md animate-fade-in transition-all hover:bg-accent/70"
                              >
                                <span>{meal.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteMeal(meal.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm p-3 bg-muted/50 rounded-md">
                              {t("mealplanner.no-meals")}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">{t("mealplanner.dinner")}</h3>
                        <div className="space-y-2">
                          {getMealsForDay(selectedDate, "dinner").length > 0 ? (
                            getMealsForDay(selectedDate, "dinner").map((meal) => (
                              <div 
                                key={meal.id} 
                                className="flex items-center justify-between p-3 bg-accent/50 rounded-md animate-fade-in transition-all hover:bg-accent/70"
                              >
                                <span>{meal.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => deleteMeal(meal.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm p-3 bg-muted/50 rounded-md">
                              {t("mealplanner.no-meals")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="week" className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {weekDays.map((day) => (
                        <div 
                          key={day.toString()} 
                          className={`p-3 rounded-md border transition-all duration-300 hover:shadow-md ${
                            format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") 
                              ? "border-primary bg-primary/5" 
                              : "border-border"
                          }`}
                          onClick={() => handleDateSelect(day)}
                          role="button"
                          tabIndex={0}
                          aria-label={format(day, "EEEE, MMMM d")}
                        >
                          <h3 className="font-medium text-center mb-2">
                            {format(day, "E")}
                            <div className="text-xs text-muted-foreground">
                              {format(day, "MMM d")}
                            </div>
                          </h3>
                          
                          <div className="space-y-2 mt-3">
                            {getMealsForDay(day, "breakfast").length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="text-xs bg-secondary/50 p-2 rounded cursor-pointer hover:bg-secondary/70 transition-colors">
                                    <span className="font-medium">B:</span> {getMealsForDay(day, "breakfast")[0]?.name}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="space-y-2">
                                    {getMealsForDay(day, "breakfast").map((meal) => (
                                      <div key={meal.id} className="flex items-center justify-between">
                                        <span>{meal.name}</span>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMeal(meal.id);
                                          }}
                                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                            
                            {getMealsForDay(day, "lunch").length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="text-xs bg-secondary/50 p-2 rounded cursor-pointer hover:bg-secondary/70 transition-colors">
                                    <span className="font-medium">L:</span> {getMealsForDay(day, "lunch")[0]?.name}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="space-y-2">
                                    {getMealsForDay(day, "lunch").map((meal) => (
                                      <div key={meal.id} className="flex items-center justify-between">
                                        <span>{meal.name}</span>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMeal(meal.id);
                                          }}
                                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                            
                            {getMealsForDay(day, "dinner").length > 0 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="text-xs bg-secondary/50 p-2 rounded cursor-pointer hover:bg-secondary/70 transition-colors">
                                    <span className="font-medium">D:</span> {getMealsForDay(day, "dinner")[0]?.name}
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2">
                                  <div className="space-y-2">
                                    {getMealsForDay(day, "dinner").map((meal) => (
                                      <div key={meal.id} className="flex items-center justify-between">
                                        <span>{meal.name}</span>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMeal(meal.id);
                                          }}
                                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {isAddingMeal && (
          <MealPlannerForm
            selectedDate={selectedDate}
            onAddMeal={addMeal}
            onCancel={() => setIsAddingMeal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default MealPlannerPage;
