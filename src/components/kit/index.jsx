import { forwardRef } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground shadow-glow hover:brightness-110",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
  outline: "border border-border text-foreground hover:bg-muted",
  success: "bg-success text-success-foreground hover:brightness-110",
};
export function Button({ variant = "primary", loading, className, children, disabled, ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
export const Input = forwardRef(function Input({ label, error, className, ...props }, ref) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      <input ref={ref} className={cn("h-12 w-full rounded-xl border border-input bg-input/30 px-4 text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/40", error && "border-destructive", className)} {...props} />
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
});
export const Card = ({ className, ...p }) => <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)} {...p} />;
const badgeTones = { waiting: "bg-secondary/15 text-secondary", playing: "bg-primary/20 text-primary", finished: "bg-muted text-muted-foreground", success: "bg-success/15 text-success", danger: "bg-destructive/15 text-destructive" };
export const Badge = ({ tone = "finished", className, ...p }) => <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeTones[tone], className)} {...p} />;
export const LoadingSpinner = ({ label = "Chargement…" }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><Loader2 className="size-7 animate-spin text-primary" /><span className="text-sm">{label}</span></div>
);
export const EmptyState = ({ icon: Icon, title, children }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
    {Icon && <Icon className="size-8 text-muted-foreground" />}<p className="font-semibold">{title}</p><div className="text-sm text-muted-foreground">{children}</div>
  </div>
);
export const ErrorMessage = ({ children, onRetry }) => (
  <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
    <AlertTriangle className="mt-0.5 size-4 shrink-0" /><div className="flex-1">{children}</div>
    {onRetry && <button onClick={onRetry} className="font-semibold underline">Réessayer</button>}
  </div>
);
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <Card className="w-full max-w-md animate-rise" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-lg font-bold">{title}</h2>{children}
      </Card>
    </div>
  );
}
