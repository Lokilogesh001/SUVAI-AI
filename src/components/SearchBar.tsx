
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // In a real app, this would trigger a search
  };

  return (
    <div className="flex items-center gap-2">
      <form 
        onSubmit={handleSearch} 
        className={`relative rounded-full overflow-hidden transition-all duration-300 ${
          isFocused ? "ring-2 ring-primary/20" : ""
        }`}
      >
        <div className="flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-9 pr-4 py-2 w-full md:w-[200px] lg:w-[300px] h-9 bg-secondary/50 border-0 focus-visible:ring-0 rounded-full transition-all duration-300"
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
