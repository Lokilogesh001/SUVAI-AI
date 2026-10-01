import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // Navigate to recipes page with search query parameter
    navigate(`/recipes?q=${encodeURIComponent(query)}`);
    setIsFocused(false);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative rounded-full transition-all duration-300 w-full sm:w-[220px] lg:w-[280px] ${
        isFocused ? "ring-2 ring-primary/20 scale-[1.01]" : ""
      }`}
    >
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Search recipes, ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="pl-9 pr-8 h-9 text-xs bg-muted/60 hover:bg-muted/80 border-0 focus-visible:ring-0 rounded-full transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
