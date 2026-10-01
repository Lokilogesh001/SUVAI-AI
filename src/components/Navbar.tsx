import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChefHat, 
  Search, 
  Menu, 
  X, 
  User, 
  Compass, 
  BookOpen, 
  Calendar, 
  ShoppingCart, 
  Sparkles,
  LogOut 
} from "lucide-react";
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
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { to: "/", label: "Discover", icon: Compass },
    { to: "/recipes", label: "Recipes", icon: BookOpen },
    { to: "/meal-planner", label: "Meal Planner", icon: Calendar },
    { to: "/grocery", label: "Grocery", icon: ShoppingCart },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/90 backdrop-blur-md border-b shadow-sm"
            : "bg-background/70 backdrop-blur-sm"
        }`}
      >
        <div className="content-grid">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            
            {/* Brand Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90 shrink-0"
            >
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <ChefHat className="h-5 w-5" />
              </div>
              <span className="font-extrabold tracking-tight">
                suv<span className="text-primary font-black">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "text-primary bg-primary/10 font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Tools (Search, Language, User Profile) */}
            <div className="hidden md:flex items-center gap-2.5 shrink-0">
              <SearchBar />
              <LanguageSelector variant="minimal" />

              {user ? (
                <div className="flex items-center gap-2 pl-1 border-l">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full gap-2 pl-2 pr-3 h-9"
                    asChild
                  >
                    <Link to="/profile">
                      <div className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center font-bold">
                        {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                      </div>
                      <span className="text-xs font-semibold max-w-[100px] truncate">
                        {profile?.name || user.email?.split("@")[0]}
                      </span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="rounded-xl font-medium px-4 h-9 shadow-sm"
                    asChild
                  >
                    <Link to="/auth">
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSelector variant="minimal" />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-muted text-foreground"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slideout Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-background/98 backdrop-blur-lg border-t animate-fade-in z-50 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <SearchBar />

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        active
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t space-y-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-card text-foreground font-medium"
                  >
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm">{profile?.name || user.email}</div>
                      <div className="text-xs text-muted-foreground">Manage profile & preferences</div>
                    </div>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/20 gap-2"
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full h-11 rounded-xl font-medium"
                  asChild
                >
                  <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In / Register
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t px-2 py-1 flex items-center justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition-all ${
                active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 mb-0.5 ${active ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Navbar;
