import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, ClipboardList, Heart, ShoppingCart, User, Check, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const SAVED_RECIPES = [
  {
    id: "1",
    title: "Pan-Seared Salmon with Lemon Butter",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    tags: ["Seafood", "Keto", "High Protein"],
  },
  {
    id: "3",
    title: "Classic Tiramisu",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    tags: ["Dessert", "Italian", "No-Bake"],
  },
  {
    id: "8",
    title: "Mushroom Risotto",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    tags: ["Italian", "Vegetarian", "Comfort Food"],
  },
];

interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  checked: boolean;
  category: string;
}

const INITIAL_GROCERY_ITEMS: GroceryItem[] = [
  { id: "1", name: "Salmon fillet", quantity: "2 pieces", checked: false, category: "Seafood" },
  { id: "2", name: "Lemons", quantity: "3", checked: false, category: "Produce" },
  { id: "3", name: "Unsalted butter", quantity: "100g", checked: true, category: "Dairy" },
  { id: "4", name: "Fresh dill", quantity: "1 bunch", checked: false, category: "Produce" },
  { id: "5", name: "Garlic", quantity: "4 cloves", checked: false, category: "Produce" },
  { id: "6", name: "Olive oil", quantity: "2 tbsp", checked: true, category: "Pantry" },
  { id: "7", name: "Salt", quantity: "to taste", checked: true, category: "Pantry" },
  { id: "8", name: "Black pepper", quantity: "to taste", checked: true, category: "Pantry" },
];

const ProfilePage = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("saved");
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(INITIAL_GROCERY_ITEMS);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Produce");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || "1",
      checked: false,
      category: newItemCategory,
    };
    
    setGroceryItems([...groceryItems, newItem]);
    setNewItemName("");
    setNewItemQuantity("");
    toast.success("Item added to grocery list");
  };

  const handleToggleCheck = (id: string) => {
    setGroceryItems(
      groceryItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setGroceryItems(groceryItems.filter((item) => item.id !== id));
    toast.success("Item removed from grocery list");
  };

  const clearCheckedItems = () => {
    setGroceryItems(groceryItems.filter((item) => !item.checked));
    toast.success("Checked items cleared");
  };

  const groupedItems = groceryItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GroceryItem[]>);

  return (
    <div className="pt-16 min-h-screen">
      <div className="content-grid section-padding">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-24">
              <div className="flex flex-col items-center p-6 bg-muted/30 rounded-lg mb-4">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{user?.email || "Guest User"}</h2>
                <p className="text-muted-foreground mb-4">{user?.email || "guest@example.com"}</p>
                <Button className="w-full" variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-medium mb-3">{t("profile.title")}</h3>
                <nav className="space-y-1">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("saved")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {t("profile.saved")}
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("grocery")}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {t("profile.grocery")}
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <ClipboardList className="mr-2 h-4 w-4" />
                    {t("nav.meal-planner")}
                  </Button>

                  <Button 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("profile.logout")}
                  </Button>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="saved" className="flex gap-2 items-center">
                  <Heart className="h-4 w-4" />
                  {t("profile.saved")}
                </TabsTrigger>
                <TabsTrigger value="grocery" className="flex gap-2 items-center">
                  <ShoppingCart className="h-4 w-4" />
                  {t("profile.grocery")}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="saved" className="animate-fade-in">
                <div className="bg-card rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-6">{t("profile.saved")}</h2>
                  
                  {SAVED_RECIPES.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SAVED_RECIPES.map((recipe) => (
                        <div 
                          key={recipe.id}
                          className="flex gap-4 p-3 bg-background rounded-lg hover:shadow-md transition-default"
                        >
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <Link to={`/recipe/${recipe.id}`} className="hover:text-primary transition-colors">
                              <h3 className="font-medium">{recipe.title}</h3>
                            </Link>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {recipe.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-xl font-medium mb-2">{t("profile.empty.saved")}</h3>
                      <p className="text-muted-foreground mb-4">
                        Start exploring and saving recipes you love
                      </p>
                      <Button asChild>
                        <Link to="/recipes">{t("nav.recipes")}</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="grocery" className="animate-fade-in">
                <div className="bg-card rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">{t("profile.grocery")}</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCheckedItems}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear Checked
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add item..."
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="text"
                        value={newItemQuantity}
                        onChange={(e) => setNewItemQuantity(e.target.value)}
                        placeholder="Qty"
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      />
                    </div>
                    <div className="w-32">
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                      >
                        <option value="Produce">Produce</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Meat">Meat</option>
                        <option value="Seafood">Seafood</option>
                        <option value="Pantry">Pantry</option>
                        <option value="Frozen">Frozen</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <Button onClick={handleAddItem} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {Object.keys(groupedItems).length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                      {Object.entries(groupedItems).map(([category, items]) => (
                        <div key={category} className="mb-6">
                          <h3 className="font-medium text-lg mb-2 flex items-center">
                            <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                            {category}
                          </h3>
                          <ul className="space-y-2">
                            {items.map((item) => (
                              <li 
                                key={item.id} 
                                className={`flex items-center justify-between p-3 rounded-md ${
                                  item.checked ? "bg-muted/50 text-muted-foreground" : "bg-background"
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    onClick={() => handleToggleCheck(item.id)}
                                    className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                                      item.checked 
                                        ? "bg-primary border-primary text-primary-foreground" 
                                        : "border-input"
                                    }`}
                                  >
                                    {item.checked && <Check className="h-3 w-3" />}
                                  </button>
                                  <span className={item.checked ? "line-through" : ""}>
                                    {item.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-xl font-medium mb-2">{t("profile.empty.grocery")}</h3>
                      <p className="text-muted-foreground mb-4">
                        Add items to your grocery list
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
