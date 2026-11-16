import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Hash } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/kit";

export function Brand() {
  return <Link to="/rooms" className="flex items-center gap-2 font-display text-lg font-bold"><span className="grid size-8 place-items-center rounded-lg bg-gradient-brand text-primary-foreground"><Hash className="size-4" /></span>THE NUMBER GAME</Link>;
}
// Protected layout: redirects anonymous users to /login.
export function ProtectedPage({ children }) {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (status === "anonymous") navigate({ to: "/login" }); }, [status, navigate]);
  if (status !== "authenticated") return <div className="min-h-screen bg-gradient-page"><LoadingSpinner /></div>;
  return (
    <div className="min-h-screen bg-gradient-page">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Brand />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{user?.username}</span>
            <button onClick={logout} className="grid size-10 place-items-center rounded-lg hover:bg-muted" aria-label="Se déconnecter"><LogOut className="size-4" /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">{children}</main>
    </div>
  );
}
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-page px-4 py-10">
      <div className="mb-8"><Brand /></div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-card">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
