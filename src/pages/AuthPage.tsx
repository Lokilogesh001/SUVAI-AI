import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ChefHat, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck, 
  Heart, 
  Compass, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

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
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "AE", name: "United Arab Emirates" },
];

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  country: z.string().min(1, "Please select your country"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const AuthPage = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [authAction, setAuthAction] = useState<"idle" | "login" | "signup" | "google">("idle");

  const { signIn, signUp, signInWithGoogle, resetPassword, isLoading } = useAuth();
  const isBusy = authAction !== "idle" || isLoading;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      country: "IN",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSwitchMode = (newMode: "login" | "signup") => {
    setMode(newMode);
    loginForm.clearErrors();
    signupForm.clearErrors();
  };

  const onLoginSubmit = async (values: LoginFormValues) => {
    setAuthAction("login");
    try {
      await signIn(values.email.trim(), values.password, redirectUrl);
    } finally {
      setAuthAction("idle");
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setAuthAction("signup");
    try {
      await signUp({
        name: values.name.trim(),
        email: values.email.trim(),
        country: values.country,
        password: values.password,
      });
    } finally {
      setAuthAction("idle");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthAction("google");
    try {
      await signInWithGoogle(redirectUrl);
    } finally {
      setAuthAction("idle");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = forgotPasswordEmail.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return;
    }
    setIsResetting(true);
    const ok = await resetPassword(cleanEmail);
    setIsResetting(false);
    if (ok) {
      setIsResetDialogOpen(false);
      setForgotPasswordEmail("");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* LEFT: Premium Food Brand Showcase (Desktop only) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-stone-900 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background Food Photography with Dark Neutral Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1543353071-873f17a7a088?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=85')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/20 backdrop-blur border border-amber-400/30 flex items-center justify-center text-amber-400">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              suv<span className="text-amber-400">AI</span>
            </span>
            <p className="text-xs text-stone-300 font-medium tracking-wide">Intelligent Food Discovery</p>
          </div>
        </div>

        {/* Narrative & Value Props */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs text-amber-300 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized Recipe Intelligence
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
            Cook meals that fit your taste, ingredients, and lifestyle.
          </h1>

          <p className="text-stone-300 text-base leading-relaxed">
            suvAI combines cultural culinary context, your pantry ingredients, dietary requirements, and cooking time into intelligent, personalized recommendations.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-300">
                <span className="font-semibold text-white block">Hard Allergen Filtering</span>
                Never recommends foods with your allergen restrictions
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-stone-300">
                <span className="font-semibold text-white block">Pantry Optimization</span>
                Cook immediately with what you already have
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-stone-400 flex justify-between items-center pt-8 border-t border-white/10">
          <span>&copy; {new Date().getFullYear()} suvAI Platform</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-stone-200 transition-colors">Explore Recipes</Link>
            <span>&bull;</span>
            <span>Multilingual Support</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Authentication Form Surface */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 xl:px-24">
        {/* Mobile Header Branding */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight">
              suv<span className="text-primary">AI</span>
            </span>
          </Link>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Explore as Guest &rarr;
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Header Switcher */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {mode === "login" ? "Account Access" : "Join suvAI"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {mode === "login" ? "Welcome back to your kitchen" : "Create your food profile"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "login" 
                ? "Sign in to access your saved recipes, meal plans, and personalized feed." 
                : "Personalize recommendations based on your country, diet, and taste."}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex p-1 bg-muted rounded-xl">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleSwitchMode("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleSwitchMode("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick OAuth (Google) */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl flex items-center justify-center gap-3 font-medium transition-all hover:bg-secondary/80 border-input"
            onClick={handleGoogleSignIn}
            disabled={isBusy}
          >
            {authAction === "google" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center">
            <Separator className="w-full" />
            <span className="absolute bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
              Or continue with email
            </span>
          </div>

          {/* LOGIN FORM */}
          {mode === "login" ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="chef@example.com"
                          type="email"
                          autoComplete="email"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-semibold">Password</FormLabel>
                        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                          <DialogTrigger asChild>
                            <button
                              type="button"
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              Forgot password?
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Reset your password</DialogTitle>
                              <DialogDescription>
                                Enter your account email address and we'll send you instructions to reset your password.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword} className="space-y-4 pt-2">
                              <Input
                                type="email"
                                placeholder="chef@example.com"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                required
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsResetDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isResetting || !forgotPasswordEmail}>
                                  {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                                </Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="h-11 rounded-xl pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0 pt-1">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          id="remember-session"
                        />
                      </FormControl>
                      <label
                        htmlFor="remember-session"
                        className="text-xs font-medium text-muted-foreground cursor-pointer"
                      >
                        Remember my session on this device
                      </label>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-medium mt-2 shadow-sm"
                  disabled={isBusy}
                >
                  {authAction === "login" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            /* SIGNUP FORM */
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3.5">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Priya Sharma"
                          autoComplete="name"
                          className="h-11 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="chef@example.com"
                            type="email"
                            autoComplete="email"
                            className="h-11 rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Country Context</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="h-11 rounded-xl pr-9"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="h-11 rounded-xl pr-9"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-medium mt-3 shadow-sm"
                  disabled={isBusy}
                >
                  {authAction === "signup" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create Account & Personalize
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          {/* Guest discovery escape hatch */}
          <div className="text-center pt-2">
            <Link
              to={redirectUrl || "/"}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue browsing recipes without an account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
