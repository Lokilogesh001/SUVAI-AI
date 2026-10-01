import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeDetail from "@/components/RecipeDetail";
import { recipeService } from "@/services/recipes/recipeService";
import { Recipe } from "@/types/recipe";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const RecipePage = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (id) {
      setLoading(true);
      recipeService.getRecipeById(id).then((result) => {
        if (mounted) {
          setRecipe(result);
          setLoading(false);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="content-grid pt-24 pb-16">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Link to="/recipes">
              <ArrowLeft className="h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="aspect-[21/9] bg-muted rounded-3xl animate-pulse" />
            <div className="h-14 bg-muted rounded-2xl animate-pulse" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded-2xl animate-pulse" />
              <div className="h-96 bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        ) : recipe ? (
          <RecipeDetail recipe={recipe} />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Recipe not found</h2>
            <p className="text-sm text-muted-foreground mb-4">We couldn't locate this recipe.</p>
            <Button asChild>
              <Link to="/recipes">Discover other recipes</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipePage;
