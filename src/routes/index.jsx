import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Timer, Trophy } from "lucide-react";
import { Brand } from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "The Number Game — Devinez le nombre gagnant" },
    { name: "description", content: "Créez une chambre, invitez vos amis et trouvez le nombre le plus proche de la cible en 5 manches." },
    { property: "og:title", content: "The Number Game" },
    { property: "og:description", content: "Le jeu multijoueur où la stratégie bat le hasard." },
  ] }),
  component: Home,
});

const steps = [
  { icon: Target, t: "Choisissez 0 à 100", d: "Chaque manche, proposez un nombre." },
  { icon: Timer, t: "Avant la fin du chrono", d: "Le serveur calcule moyenne × coefficient secret." },
  { icon: Trophy, t: "Le plus proche gagne", d: "5 manches, un seul champion." },
];

function Home() {
  const { status } = useAuth();
  const authed = status === "authenticated";
  return (
    <div className="min-h-screen bg-gradient-page px-4">
      <header className="mx-auto flex h-16 max-w-4xl items-center"><Brand /></header>
      <main className="mx-auto max-w-4xl py-14 text-center sm:py-24">
        <p className="font-mono text-sm tracking-[0.3em] text-secondary">MOYENNE × ?</p>
        <h1 className="mt-4 font-display text-5xl font-bold leading-tight sm:text-7xl">Lisez dans <span className="text-gradient-brand">l'esprit</span> des autres.</h1>
        <p className="mx-auto mt-5 max-w-md text-muted-foreground">Un jeu multijoueur de stratégie pure. Anticipez la foule, visez la cible.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={authed ? "/rooms" : "/register"} className="rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-glow">{authed ? "Voir les chambres" : "Créer un compte"}</Link>
          {!authed && <Link to="/login" className="rounded-xl border border-border px-6 py-3.5 font-semibold">Se connecter</Link>}
        </div>
        <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
          {steps.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5"><I className="size-6 text-secondary" /><p className="mt-3 font-semibold">{t}</p><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </main>
    </div>
  );
}
