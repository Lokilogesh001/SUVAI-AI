import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabaseConfigError } from "@/lib/supabase";

export const SupabaseConnectionError: React.FC = () => {
  if (isSupabaseConfigured) {
    return null;
  }

  const handleRetry = () => {
    console.warn("Retrying database connection...", supabaseConfigError);
    window.location.reload();
  };

  return (
    <aside 
      className="bg-destructive/10 border-b border-destructive/20 text-destructive text-xs py-2.5 px-4 sticky top-0 z-50 transition-all backdrop-blur-sm"
      role="alert"
      aria-label="Database Connection Error" 
    >
      <div className="content-grid flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span>
            <strong>Database Connection Failed:</strong> Supabase credentials are missing or unreachable. Set <code className="bg-destructive/15 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code className="bg-destructive/15 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> to connect.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRetry}
            className="h-7 text-xs border-destructive/30 hover:bg-destructive/10 text-destructive gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Retry Connection
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default SupabaseConnectionError;
