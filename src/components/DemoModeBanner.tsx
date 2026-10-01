import { useState } from "react";
import { AlertCircle, X, ExternalLink } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

const DemoModeBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  // If Supabase is properly configured with real credentials, hide the demo notice
  if (isSupabaseConfigured || dismissed) {
    return null;
  }

  return (
    <aside 
      aria-label="Demo mode warning" 
      className="bg-amber-500/90 text-amber-950 dark:bg-amber-500/20 dark:text-amber-200 border-b border-amber-500/30 px-4 py-2 text-xs font-medium sticky top-0 z-[60] backdrop-blur-sm"
    >
      <div className="content-grid flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-900 dark:text-amber-300" />
          <span>
            <strong>Demo mode</strong> — connect Supabase to enable account persistence. Data entered now is saved locally on this device only.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground flex items-center gap-1 text-[11px]"
          >
            Setup Guide <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="hover:opacity-75 p-0.5 rounded"
            aria-label="Dismiss demo mode banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DemoModeBanner;
