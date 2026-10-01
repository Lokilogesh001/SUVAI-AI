
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealPlannerFormProps {
  selectedDate: Date;
  onAddMeal: (meal: {
    name: string;
    type: "breakfast" | "lunch" | "dinner";
    date: Date;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const MealPlannerForm = ({
  selectedDate,
  onAddMeal,
  onCancel,
}: MealPlannerFormProps) => {
  const { t } = useLanguage();
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner">("breakfast");
  const [notes, setNotes] = useState("");
  
  // Focus the meal name input when the form opens
  useEffect(() => {
    const timer = setTimeout(() => {
      const nameInput = document.getElementById("meal-name");
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealName.trim()) return;
    
    onAddMeal({
      name: mealName,
      type: mealType,
      date: selectedDate,
      notes: notes.trim() || undefined,
    });
    
    // Reset form
    setMealName("");
    setMealType("breakfast");
    setNotes("");
  };

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] animate-scale-in">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>{t("mealplanner.add-meal")}</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCancel}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">{t("mealplanner.date")}</Label>
            <Input
              id="date"
              value={format(selectedDate, "EEEE, MMMM d, yyyy")}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="meal-type">{t("mealplanner.meal-type")}</Label>
            <Select
              value={mealType}
              onValueChange={(value) => setMealType(value as "breakfast" | "lunch" | "dinner")}
            >
              <SelectTrigger id="meal-type">
                <SelectValue placeholder={t("mealplanner.select-type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">{t("mealplanner.breakfast")}</SelectItem>
                <SelectItem value="lunch">{t("mealplanner.lunch")}</SelectItem>
                <SelectItem value="dinner">{t("mealplanner.dinner")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="meal-name">{t("mealplanner.meal-name")}</Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              required
              placeholder={t("mealplanner.meal-name-placeholder")}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              autoComplete="off"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="notes">{t("mealplanner.notes")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("mealplanner.notes-placeholder")}
              className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="transition-all duration-200"
            >
              {t("common.cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={!mealName.trim()}
              className="transition-all duration-200"
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlannerForm;
