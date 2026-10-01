
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChefHat, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchBar";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => {
    return location.pathname === path ? "text-primary font-semibold" : "text-foreground/80 hover:text-foreground";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? "bg-white/80 dark:bg-black/80 backdrop-blur shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="content-grid">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-semibold transition-opacity hover:opacity-90"
          >
            <ChefHat className="h-8 w-8" />
            <span className="text-gradient">{t("app.name")}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <nav className="flex space-x-6">
              <Link
                to="/"
                className={`${isActive("/")} transition-colors duration-200 font-medium`}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/recipes"
                className={`${isActive("/recipes")} transition-colors duration-200 font-medium`}
              >
                {t("nav.recipes")}
              </Link>
              <Link
                to="/meal-planner"
                className={`${isActive("/meal-planner")} transition-colors duration-200 font-medium`}
              >
                {t("nav.meal-planner")}
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchBar />
              </div>
              <LanguageSelector variant="minimal" />
              {user && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full"
                  asChild
                >
                  <Link to="/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              {user ? (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="font-medium"
                  onClick={() => signOut()}
                >
                  {t("nav.signout")}
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="font-medium"
                  asChild
                >
                  <Link to="/auth">
                    {t("nav.signin")}
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu with improved animation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-background animate-fade-in shadow-lg z-50">
          <div className="p-4 space-y-4 h-full overflow-auto">
            <SearchBar />
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                className={`${isActive("/")} py-2 transition-colors duration-200 font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/recipes"
                className={`${isActive("/recipes")} py-2 transition-colors duration-200 font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.recipes")}
              </Link>
              <Link
                to="/meal-planner"
                className={`${isActive("/meal-planner")} py-2 transition-colors duration-200 font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("nav.meal-planner")}
              </Link>
              {user && (
                <Link
                  to="/profile"
                  className={`${isActive("/profile")} py-2 transition-colors duration-200 font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("nav.profile")}
                </Link>
              )}
            </nav>
            <div className="flex items-center justify-between mt-auto pt-4">
              {user ? (
                <Button 
                  className="w-3/4 mr-2" 
                  size="sm"
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {t("nav.signout")}
                </Button>
              ) : (
                <Button 
                  className="w-3/4 mr-2" 
                  size="sm"
                  asChild
                >
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    {t("nav.signin")}
                  </Link>
                </Button>
              )}
              <LanguageSelector variant="minimal" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
