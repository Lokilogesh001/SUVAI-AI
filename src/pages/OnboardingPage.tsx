import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  Flame, 
  ShieldAlert, 
  Sparkles,
  UtensilsCrossed 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DietType, 
  CookingSkill, 
  CookingTimePreference, 
  SpicePreference,
  UserPreferences 
} from "@/types/database";

const CUISINE_OPTIONS = [
  { id: "Indian", name: "Indian", flag: "🇮🇳" },
  { id: "Italian", name: "Italian", flag: "🇮🇹" },
  { id: "Mexican", name: "Mexican", flag: "🇲🇽" },
  { id: "Thai", name: "Thai", flag: "🇹🇭" },
  { id: "Japanese", name: "Japanese", flag: "🇯🇵" },
  { id: "Mediterranean", name: "Mediterranean", flag: "🇬🇷" },
  { id: "Chinese", name: "Chinese", flag: "🇨🇳" },
  { id: "French", name: "French", flag: "🇫🇷" },
  { id: "American", name: "American", flag: "🇺🇸" },
  { id: "Korean", name: "Korean", flag: "🇰🇷" },
  { id: "Middle Eastern", name: "Middle Eastern", flag: "🇱🇧" },
  { id: "Spanish", name: "Spanish", flag: "🇪🇸" },
];

const ALLERGY_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Dairy",
  "Gluten / Wheat",
  "Shellfish",
  "Fish",
  "Eggs",
  "Soy",
  "Sesame",
];

const DISLIKED_INGREDIENTS = [
  "Cilantro",
  "Mushrooms",
  "Olives",
  "Eggplant",
  "Bell Peppers",
  "Onions",
  "Garlic",
  "Pork",
  "Beef",
  "Tofu",
];

const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "IT", name: "Italy" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "TH", name: "Thailand" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user, profile, preferences, updatePreferences, updateProfile } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // State collected
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || user?.country || "IN");
  const [diet, setDiet] = useState<DietType>(preferences?.diet || "all");
  const [cuisines, setCuisines] = useState<string[]>(preferences?.favorite_cuisines || ["Indian", "Italian"]);
  const [allergies, setAllergies] = useState<string[]>(preferences?.allergies || []);
  const [dislikes, setDislikes] = useState<string[]>(preferences?.disliked_ingredients || []);
  const [cookingTime, setCookingTime] = useState<CookingTimePreference>(preferences?.preferred_cooking_time || "30-60");
  const [skill, setSkill] = useState<CookingSkill>(preferences?.cooking_skill || "intermediate");
  const [spice, setSpice] = useState<SpicePreference>(preferences?.spice_preference || "medium");
  const [isSaving, setIsSaving] = useState(false);

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await updateProfile({ country: selectedCountry });
        const newPrefs: Partial<UserPreferences> = {
          diet,
          favorite_cuisines: cuisines,
          allergies,
          disliked_ingredients: dislikes,
          preferred_cooking_time: cookingTime,
          cooking_skill: skill,
          spice_preference: spice,
          calorie_preference: "moderate",
        };
        await updatePreferences(newPrefs);
      }
      navigate("/");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col justify-between p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">suvAI Taste Profile</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleFinish}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Skip for now
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl w-full mx-auto space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground font-medium">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}% completed</span>
        </div>
        <Progress value={(step / totalSteps) * 100} className="h-1.5" />
      </div>

      {/* Main Interactive Step Card */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm transition-all duration-300">
          
          {/* STEP 1: Country Context */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Catering to your location</span>
                <h2 className="text-2xl font-bold mt-1">What country are you cooking in?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We use your country context to prioritize local ingredient availability, seasonal produce, and familiar measurements.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setSelectedCountry(c.code)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      selectedCountry === c.code 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium" 
                        : "hover:bg-muted/50 border-input"
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedCountry === c.code && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Dietary Restrictions */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Hard Constraint</span>
                <h2 className="text-2xl font-bold mt-1">What is your primary diet?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We will strictly exclude recipes that conflict with your dietary choice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "all", title: "No Restrictions", desc: "Omnivore; all meats, seafood, and vegetables." },
                  { id: "vegetarian", title: "Vegetarian", desc: "Plant foods and dairy; no meat or poultry." },
                  { id: "vegan", title: "Vegan", desc: "100% plant-based; no meat, dairy, eggs, or animal products." },
                  { id: "eggetarian", title: "Eggetarian", desc: "Vegetarian diet including eggs." },
                  { id: "pescatarian", title: "Pescatarian", desc: "Vegetarian plus fish and seafood." },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDiet(item.id as DietType)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      diet === item.id 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                        : "hover:bg-muted/50 border-input"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{item.title}</span>
                      {diet === item.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Favorite Cuisines */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Taste Exploration</span>
                <h2 className="text-2xl font-bold mt-1">Which cuisines do you love?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select your favorites. You can change these anytime in your profile.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CUISINE_OPTIONS.map((c) => {
                  const selected = cuisines.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleItem(cuisines, setCuisines, c.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selected 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium" 
                          : "hover:bg-muted/50 border-input"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Allergies & Dislikes */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Safety Restrictions</span>
                </div>
                <h2 className="text-2xl font-bold mt-1">Any allergies or disliked ingredients?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Allergies are enforced as strict zero-tolerance exclusions.
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground block mb-2.5">Allergies (Hard Exclusions)</span>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => {
                    const selected = allergies.includes(allergy);
                    return (
                      <Badge
                        key={allergy}
                        variant={selected ? "destructive" : "outline"}
                        className="cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all"
                        onClick={() => toggleItem(allergies, setAllergies, allergy)}
                      >
                        {selected && <Check className="h-3 w-3 mr-1" />}
                        {allergy}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-foreground block mb-2.5">Disliked Ingredients (Soft Penalty)</span>
                <div className="flex flex-wrap gap-2">
                  {DISLIKED_INGREDIENTS.map((item) => {
                    const selected = dislikes.includes(item);
                    return (
                      <Badge
                        key={item}
                        variant={selected ? "secondary" : "outline"}
                        className={`cursor-pointer py-1.5 px-3 text-xs rounded-lg transition-all ${
                          selected ? "bg-stone-300 dark:bg-stone-700" : ""
                        }`}
                        onClick={() => toggleItem(dislikes, setDislikes, item)}
                      >
                        {selected && <Check className="h-3 w-3 mr-1" />}
                        {item}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Cooking Time & Skill */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Kitchen Rhythm</span>
                <h2 className="text-2xl font-bold mt-1">How much time do you usually have?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We will prioritize recipes that fit your typical dinner schedule.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "<15", label: "< 15 mins", sub: "Quick bites" },
                  { id: "15-30", label: "15–30 mins", sub: "Fast meals" },
                  { id: "30-60", label: "30–60 mins", sub: "Standard dinner" },
                  { id: "60+", label: "60+ mins", sub: "Leisurely / weekend" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCookingTime(t.id as CookingTimePreference)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      cookingTime === t.id 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium" 
                        : "hover:bg-muted/50 border-input"
                    }`}
                  >
                    <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <span className="block text-sm font-semibold">{t.label}</span>
                    <span className="text-[11px] text-muted-foreground">{t.sub}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground block mb-2">Cooking Experience</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "beginner", label: "Beginner", sub: "Simple steps" },
                    { id: "intermediate", label: "Intermediate", sub: "Comfortable" },
                    { id: "advanced", label: "Advanced", sub: "Loves a challenge" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSkill(s.id as CookingSkill)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        skill === s.id 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium" 
                          : "hover:bg-muted/50 border-input"
                      }`}
                    >
                      <UtensilsCrossed className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <span className="block text-xs font-semibold">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Spice & Summary */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Flavor Calibration</span>
                <h2 className="text-2xl font-bold mt-1">What spice level do you prefer?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Controls recommendation weighting for heat intensity and chili usage.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "mild", label: "Mild", icon: "🌱", sub: "Gentle seasoning" },
                  { id: "medium", label: "Medium", icon: "🌶️", sub: "Balanced kick" },
                  { id: "spicy", label: "Spicy", icon: "🔥", sub: "Bold & hot" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpice(s.id as SpicePreference)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      spice === s.id 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 font-medium" 
                        : "hover:bg-muted/50 border-input"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{s.icon}</span>
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className="text-[11px] text-muted-foreground">{s.sub}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">Your Personalized Engine is Ready</span>
                  We will now tune candidate recipes across your {selectedCountry} context, {diet} restrictions, {cuisines.length} preferred cuisines, and {cookingTime} cooking window.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8 border-t mt-8">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="gap-2 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="gap-2 rounded-xl"
              >
                Next Step
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={isSaving}
                className="gap-2 rounded-xl shadow-md"
              >
                Complete & Explore
                <Sparkles className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-muted-foreground py-2">
        suvAI &bull; Personalized Recipe Discovery
      </div>
    </div>
  );
};

export default OnboardingPage;
