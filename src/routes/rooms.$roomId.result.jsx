import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Crown, Trophy } from "lucide-react";
import { ProtectedPage } from "@/components/layout/AppShell";
import { Card, ErrorMessage, LoadingSpinner } from "@/components/kit";
import { Leaderboard } from "@/components/game";
import { gameService } from "@/features/game/gameService";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/lib/axios";

export const Route = createFileRoute("/rooms/$roomId/result")({
  head: () => ({ meta: [{ title: "Résultat final — The Number Game" }, { name: "description", content: "Classement final et résultats des cinq manches." }, { property: "og:title", content: "Résultat final — The Number Game" }, { property: "og:description", content: "Classement final et résultats des cinq manches." }] }),
  component: () => <ProtectedPage><Result /></ProtectedPage>,
});

function Result() {
  const { roomId } = Route.useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setData(await gameService.result(roomId)); } catch (e) { setError(parseApiError(e).message); }
  }, [roomId]);
  useEffect(() => { load(); }, [load]);

  if (error) return <ErrorMessage onRetry={load}>{error}</ErrorMessage>;
  if (!data) return <LoadingSpinner />;
  const winners = data.winners ?? (data.winner ? [data.winner] : []);
  const tie = winners.length > 1;
  const iWon = winners.some((w) => w.id === user?.id);

  return (
    <>
      <Card className="animate-rise overflow-hidden text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-gradient-brand shadow-glow"><Crown className="size-8 text-primary-foreground" /></div>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{tie ? "Égalité !" : "Vainqueur"}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-gradient-brand">{winners.map((w) => w.username).join(" & ") || "—"}</h1>
        {iWon && <p className="mt-2 text-sm text-success">{tie ? "Vous partagez la victoire !" : "Félicitations, vous avez gagné !"}</p>}
      </Card>
      <Card><h2 className="mb-3 font-semibold">Classement général</h2><Leaderboard players={data.ranking ?? data.players ?? []} meId={user?.id} showRoundStatus={false} /></Card>
      {data.rounds?.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Les 5 manches</h2>
          <ul className="divide-y divide-border text-sm">
            { console.log("voici le data",data)}
            {data.rounds.map((r) => (
              <li key={r.round} className="flex items-center gap-3 py-3">
                { console.log("voici le r",r)}
                <span className="grid size-8 place-items-center rounded-lg bg-muted font-mono font-bold">{r.number}</span>
                <div className="flex-1">
                  <p className="flex items-center gap-1 font-medium"><Trophy className="size-3.5 text-warning" />{r.winners?.map((w) => w.username).join(", ") ?? r.winner?.username ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">Moyenne {fmt(r.round)} × {fmt(r.coefficient)}</p>
                </div>
                <span className="font-mono font-bold text-secondary">{fmt(r.target)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <Link to="/rooms" className="rounded-xl bg-primary py-3.5 text-center font-semibold text-primary-foreground">Nouvelle partie</Link>
        <Link to="/rooms" className="rounded-xl border border-border py-3.5 text-center font-semibold">Retour aux chambres</Link>
      </div>
    </>
  );
}
const fmt = (n) => (n == null ? "—" : Number(n).toFixed(2));
