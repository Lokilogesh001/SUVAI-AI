import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ArrowLeft, 
  Package, 
  CalendarCheck 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService } from "@/services/userDataService";
import { GroceryItemRow, GroceryCategory } from "@/types/database";
import { toast } from "sonner";

const CATEGORIES: GroceryCategory[] = [
  "Produce", "Dairy", "Meat", "Seafood", "Pantry", "Bakery", "Frozen", "Other"
];

const GroceryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<GroceryItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New item form
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<GroceryCategory>("Produce");

  useEffect(() => {
    let isMounted = true;
    const loadItems = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const data = await userDataService.getGroceryItems(user.id);
        if (isMounted) setItems(data);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadItems();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    const numQty = parseFloat(quantity) || 1;
    const created = await userDataService.addGroceryItem(user.id, name.trim(), numQty, unit.trim(), category);

    // Refresh list
    const updated = await userDataService.getGroceryItems(user.id);
    setItems(updated);
    setName("");
    setQuantity("1");
    setUnit("");
    toast.success(`Added ${created.name} to grocery list`);
  };

  const handleToggleCheck = async (item: GroceryItemRow) => {
    if (!user) return;
    const newChecked = !item.checked;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i)));
    await userDataService.toggleGroceryItem(user.id, item.id, newChecked);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await userDataService.deleteGroceryItem(user.id, itemId);
    toast.success("Item removed");
  };

  const handleClearCompleted = async () => {
    if (!user) return;
    const completedCount = items.filter((i) => i.checked).length;
    if (completedCount === 0) return;

    setItems((prev) => prev.filter((i) => !i.checked));
    await userDataService.clearCheckedGroceryItems(user.id);
    toast.success(`Cleared ${completedCount} completed items`);
  };

  // Group items by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<GroceryCategory, GroceryItemRow[]>);

  const completedCount = items.filter((i) => i.checked).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="content-grid pt-24 md:pt-28 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart className="h-6 w-6 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Smart Grocery List</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Consolidated ingredients from your recipe discovery and weekly meal plans.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCompleted}
                disabled={completedCount === 0}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Checked ({completedCount})
              </Button>
              <Button asChild size="sm" variant="default" className="gap-1.5">
                <Link to="/meal-planner">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  View Meal Plan
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Add Form */}
          <form 
            onSubmit={handleAddItem}
            className="p-4 md:p-6 rounded-2xl border bg-card shadow-sm space-y-3"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Add New Ingredient
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <Input
                  placeholder="e.g. Cherry tomatoes, Olive oil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  placeholder="Qty"
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  placeholder="Unit (g, tbsp)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              <div className="sm:col-span-3">
                <Select value={category} onValueChange={(v) => setCategory(v as GroceryCategory)}>
                  <SelectTrigger className="rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" className="gap-1.5 rounded-xl">
                <Plus className="h-4 w-4" />
                Add to List
              </Button>
            </div>
          </form>

          {/* Grocery Categories Display */}
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : Object.keys(grouped).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(grouped).map(([catName, catItems]) => (
                <div key={catName} className="border rounded-2xl p-5 bg-card shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      <h2 className="font-semibold text-base">{catName}</h2>
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {catItems.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="divide-y divide-border/60">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className={`py-3 flex items-center justify-between transition-colors ${
                          item.checked ? "opacity-50" : ""
                        }`}
                      >
                        <div 
                          className="flex items-center gap-3 cursor-pointer select-none flex-1"
                          onClick={() => handleToggleCheck(item)}
                        >
                          <div 
                            className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                              item.checked 
                                ? "bg-primary border-primary text-primary-foreground" 
                                : "border-input hover:border-primary/60"
                            }`}
                          >
                            {item.checked && <Check className="h-3.5 w-3.5" />}
                          </div>

                          <span className={`text-sm font-medium ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-3xl space-y-4">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Your grocery list is empty</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Add items manually above, or open any recipe and tap "Add to grocery list" to automatically populate ingredients.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/recipes">Discover Recipes</Link>
              </Button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default GroceryPage;
