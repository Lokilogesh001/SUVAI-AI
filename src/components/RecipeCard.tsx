import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Flame, Heart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecommendationReason } from "@/types/recipe";
import { useAuth } from "@/contexts/AuthContext";
import { userDataService } from "@/services/userDataService";
import { toast } from "sonner";

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  calories: number;
  cuisine?: string;
  diet?: string;
  tags?: string[];
  reasons?: RecommendationReason[];
  isFeatured?: boolean;
}

const RecipeCard = ({
  id,
  title,
  description,
  image,
  cookTime,
  calories,
  cuisine = "Global",
  diet = "all",
  tags = [],
  reasons = [],
  isFeatured = false,
}: RecipeCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (user) {
      userDataService.getSavedRecipeIds(user.id).then((ids) => {
        if (mounted) setIsSaved(ids.includes(id));
      });
    }
    return () => {
      mounted = false;
    };
  }, [user, id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Sign in to save recipes to your collection", {
        action: {
          label: "Sign In",
          onClick: () => navigate(`/auth?redirect=/recipe/${id}`),
        },
      });
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        await userDataService.unsaveRecipe(user.id, id);
        setIsSaved(false);
        toast.success("Removed from saved recipes");
      } else {
        await userDataService.saveRecipe(user.id, id);
        setIsSaved(true);
        toast.success("Saved to your collection");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const primaryReason = reasons && reasons.length > 0 ? reasons[0] : null;

  return (
    <div className={`group relative rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden ${
      isFeatured ? "md:col-span-2 md:flex-row" : ""
    }`}>
      {/* Recipe Image with Bookmark Button */}
      <div className={`relative overflow-hidden ${
        isFeatured ? "md:w-1/2 aspect-[4/3] md:aspect-auto" : "aspect-[16/10] w-full"
      }`}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Favorite Save Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm ${
            isSaved
              ? "bg-rose-500 text-white"
              : "bg-white/80 dark:bg-black/60 text-stone-700 dark:text-stone-300 hover:text-rose-500 hover:bg-white"
          }`}
          aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
        </button>

        {/* Diet / Cuisine Badge */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-black/80 text-foreground backdrop-blur-sm shadow-sm">
            {cuisine}
          </span>
          {diet && diet !== "all" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm capitalize">
              {diet}
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Recommendation Reason Pill */}
          {primaryReason && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[11px] font-medium mb-1.5">
              <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
              <span className="truncate">{primaryReason.text}</span>
            </div>
          )}

          <Link to={`/recipe/${id}`}>
            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>

        {/* Footer Metadata */}
        <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              {cookTime} mins
            </span>
            {calories > 0 && (
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-stone-400" />
                {calories} kcal
              </span>
            )}
          </div>

          <Link
            to={`/recipe/${id}`}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Cook &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
