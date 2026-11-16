import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Copy, Play } from "lucide-react";
import { toast } from "sonner";
import { ProtectedPage } from "@/components/layout/AppShell";
import { Button, Card, ErrorMessage, LoadingSpinner } from "@/components/kit";
import { BackToRooms, Countdown, PlayerList, StatusBadge } from "@/components/game";
import { roomService } from "@/features/rooms/roomService";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/lib/axios";

export const Route = createFileRoute("/rooms/$roomId/")({
  head: () => ({ meta: [{ title: "Salle d'attente — The Number Game" }, { name: "description", content: "Attendez les joueurs avant le début de la partie." }, { property: "og:title", content: "Salle d'attente — The Number Game" }, { property: "og:description", content: "Attendez les joueurs avant le début de la partie." }] }),
  component: () => <ProtectedPage><Lobby /></ProtectedPage>,
});

function Lobby() {
  const { roomId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    try { setRoom(await roomService.get(roomId)); setError(""); } catch (e) { setError(parseApiError(e).message); }
  }, [roomId]);
  useEffect(() => { load(); }, [load]);

  const goGame = () => navigate({ to: "/rooms/$roomId/game", params: { roomId } });
  const ws = useRoomSocket(roomId, {
    PLAYER_JOINED: (p) => { toast(`${p.username ?? p.player?.username ?? "Un joueur"} a rejoint`); load(); },
    PLAYER_LEFT: () => load(),
    PLAYER_DISCONNECTED: () => load(),
    ROOM_UPDATED: (p) => (p?.room ? setRoom(p.room) : load()),
    GAME_STARTED: (p) => { if (p?.starts_at) setRoom((r) => ({ ...r, status: "playing", starts_at: p.starts_at })); else { toast.success("La partie commence !"); goGame(); } },
    ROUND_STARTED: () => goGame(),
  });

  useEffect(() => { if (room?.status === "finished") navigate({ to: "/rooms/$roomId/result", params: { roomId } }); }, [room?.status]);

  if (error && !room) return <><BackToRooms /><ErrorMessage onRetry={load}>{error}</ErrorMessage></>;
  if (!room) return <LoadingSpinner />;
  const ownerId = room.owner?.id ?? room.owner_id;
  const isOwner = ownerId === user?.id;
  const players = room.players ?? [];

  const start = async () => {
    setStarting(true);
    try { await roomService.start(roomId); } catch (e) { toast.error(parseApiError(e).message); } finally { setStarting(false); }
  };
  const leave = async () => { try { await roomService.leave(roomId); } catch { /* ignore */ } navigate({ to: "/rooms" }); };

  return (
    <>
      <div className="flex items-center justify-between"><BackToRooms /><span className="text-xs text-muted-foreground">{ws === "open" ? "● Temps réel" : "○ Reconnexion…"}</span></div>
      <Card className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Code de la chambre</p>
        <button onClick={() => { navigator.clipboard?.writeText(room.code); toast.success("Code copié"); }} className="mt-1 inline-flex items-center gap-2 font-mono text-4xl font-bold tracking-[0.25em] text-primary">{room.code}<Copy className="size-4 text-muted-foreground" /></button>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground"><StatusBadge status={room.status} /> Créée par <b className="text-foreground">{room.owner?.username ?? "—"}</b></div>
        {room.starts_at && <div className="mt-5"><Countdown endsAt={room.starts_at} label="Première manche dans" /></div>}
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Joueurs <span className="text-muted-foreground">({players.length}{room.max_players ? `/${room.max_players}` : ""})</span></h2>
        <PlayerList players={players} ownerId={ownerId} meId={user?.id} />
      </Card>
      {isOwner && room.status === "waiting" && (
        <Button className="w-full py-4" onClick={start} loading={starting} disabled={room.can_start === false}><Play className="size-4" />Démarrer la partie</Button>
      )}
      {isOwner && room.can_start === false && <p className="text-center text-xs text-muted-foreground">{room.can_start_reason ?? "Il faut plus de joueurs pour démarrer."}</p>}
      {!isOwner && room.status === "waiting" && <p className="text-center text-sm text-muted-foreground">En attente du créateur…</p>}
      {room.status !== "waiting" && <Button variant="secondary" className="w-full" onClick={goGame}>Aller au jeu</Button>}
      <Button variant="ghost" className="w-full" onClick={leave}>Quitter la chambre</Button>
    </>
  );
}
