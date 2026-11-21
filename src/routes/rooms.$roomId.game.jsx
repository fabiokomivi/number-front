import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Hourglass, Send } from "lucide-react";
import { toast } from "sonner";
import { ProtectedPage } from "@/components/layout/AppShell";
import { Badge, Button, Card, ErrorMessage, Input, LoadingSpinner } from "@/components/kit";
import { BackToRooms, Countdown, Leaderboard, RoundProgress } from "@/components/game";
import { gameService } from "@/features/game/gameService";
import { submitNumberSchema } from "@/features/game/schemas";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useCountdown } from "@/hooks/useCountdown";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/lib/axios";
import { TOTAL_ROUNDS } from "@/lib/config";

export const Route = createFileRoute("/rooms/$roomId/game")({
  head: () => ({ meta: [{ title: "Partie en cours — The Number Game" }, { name: "description", content: "Soumettez votre nombre avant la fin du compte à rebours." }, { property: "og:title", content: "Partie en cours — The Number Game" }, { property: "og:description", content: "Soumettez votre nombre avant la fin du compte à rebours." }] }),
  component: () => <ProtectedPage><Game /></ProtectedPage>,
});

function Game() {
  const { roomId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setGame(await gameService.state(roomId)); setError(""); } catch (e) { setError(parseApiError(e).message); }
  }, [roomId]);
  useEffect(() => { load(); }, [load]);

  const merge = (p) => setGame((g) => ({ ...g, ...p }));
  useRoomSocket(roomId, {
    ROUND_STARTED: (p) => { toast(`Manche ${p.round ?? ""} — à vous de jouer !`); merge({ ...p, round_status: "open", has_submitted: false, my_number: null }); load(); },
    COUNTDOWN_UPDATED: (p) => merge({ ends_at: p.ends_at }),
    NUMBER_SUBMITTED: (p) => setGame((g) => g && ({ ...g, players: g.players?.map((pl) => pl.id === (p.player_id ?? p.player?.id) ? { ...pl, has_submitted: true } : pl) })),
    SUBMISSION_CLOSED: () => { merge({ round_status: "closed" }); },
    ROUND_FINISHED: (p) => {
      const w = p.winner?.username ?? p.winners?.map((x) => x.username).join(", ");
      if ((p.winner?.id ?? null) === user?.id || p.winners?.some((x) => x.id === user?.id)) toast.success("Vous remportez la manche ! 🏆");
      else if (w) toast(`Manche gagnée par ${w}`);
      merge({ round_status: "finished", last_round: p });
      load();
    },
    SCORE_UPDATED: (p) => (p.players ? merge({ players: p.players }) : load()),
    GAME_FINISHED: () => navigate({ to: "/rooms/$roomId/result", params: { roomId } }),
    PLAYER_DISCONNECTED: (p) => toast(`${p.username ?? "Un joueur"} s'est déconnecté`),
  });

  useEffect(() => { if (game?.status === "finished") navigate({ to: "/rooms/$roomId/result", params: { roomId } }); }, [game?.status]);

  if (error && !game) return <><BackToRooms /><ErrorMessage onRetry={load}>{error}</ErrorMessage></>;
  if (!game) return <LoadingSpinner />;
  const total = game.total_rounds ?? TOTAL_ROUNDS;

  return (
    <>
      <div className="flex items-center justify-between"><BackToRooms /><span className="font-mono text-sm">Manche <b className="text-primary">{game.round ?? 0}</b>/{total}</span></div>
      <RoundProgress current={game.round ?? 0} total={total} />
      <Card key={game.round} className="animate-rise space-y-5">
        <Countdown endsAt={game.round_status === "open" ? game.ends_at : null} total={game.duration} label="Clôture des soumissions" />
        <SubmitPanel roomId={roomId} game={game} onSubmitted={(n) => merge({ has_submitted: true, my_number: n })} />
      </Card>
      {game.last_round?.target != null && (
        <Card className="animate-rise text-center text-sm">
          <p className="text-muted-foreground">Manche précédente — cible</p>
          <p className="font-mono text-3xl font-bold text-secondary">{Number(game.last_round.target).toFixed(2)}</p>
          {game.last_round.winner && <p className="mt-1">Gagnant : <b>{game.last_round.winner.username}</b></p>}
        </Card>
      )}
      <Card><h2 className="mb-3 font-semibold">Classement</h2><Leaderboard players={game.players ?? []} meId={user?.id} /></Card>
    </>
  );
}

function SubmitPanel({ roomId, game, onSubmitted }) {
  console.log("game.round_status", game)
  const left = useCountdown(game.round_status === "open" ? game.ends_at : null);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(submitNumberSchema) });
  useEffect(() => reset(), [game.round]);
  const timeUp = game.round_status === "open" && left === 0;

  if (game.has_submitted) return <State icon={CheckCircle2} tone="success" title="Proposition enregistrée">{game.my_number != null && <>Votre nombre : <b className="font-mono">{game.my_number}</b>. </>}En attente des autres joueurs…</State>;
  if (game.round_status === "finished") return <State icon={Hourglass} title="Manche terminée">La prochaine manche va commencer.</State>;
  if (game.round_status === "closed" || timeUp) return <State icon={Hourglass} tone="danger" title="Temps écoulé">Les soumissions sont closes.</State>;
  if (game.round_status !== "open") return <State icon={Hourglass} title="En attente">La manche n'a pas encore commencé.</State>;

  const onSubmit = async ({ number }) => {
    try { await gameService.submit(roomId, number); onSubmitted(number); toast.success("Nombre envoyé"); }
    catch (e) { const { message, fields } = parseApiError(e); setError("number", { message: fields.number || message }); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <span>{left}</span>
      <Input type="number" inputMode="decimal" min={0} max={100} step="any" placeholder="0 – 100" autoFocus className="h-16 text-center font-mono text-3xl" {...register("number")} error={errors.number?.message} />
      <Button type="submit" className="w-full py-4" loading={isSubmitting}><Send className="size-4" />Soumettre</Button>
    </form>
  );
}

const State = ({ icon: I, tone, title, children }) => (
  <div className="flex flex-col items-center gap-2 py-4 text-center">
    <I className={tone === "success" ? "size-10 text-success" : tone === "danger" ? "size-10 text-destructive" : "size-10 text-muted-foreground"} />
    <Badge tone={tone ?? "finished"}>{title}</Badge><p className="text-sm text-muted-foreground">{children}</p>
  </div>
);
