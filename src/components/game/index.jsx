import { Link } from "@tanstack/react-router";
import { Crown, Users, Wifi, WifiOff, Check, Clock, Trophy } from "lucide-react";
import { Badge, Button, Card } from "@/components/kit";
import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

export const STATUS = {
  waiting: { label: "En attente", tone: "waiting" },
  playing: { label: "En cours", tone: "playing" },
  in_progress: { label: "En cours", tone: "playing" },
  finished: { label: "Terminée", tone: "finished" },
};
export const StatusBadge = ({ status }) => { const s = STATUS[status] ?? { label: status, tone: "finished" }; return <Badge tone={s.tone}>{s.label}</Badge>; };

export function Countdown({ endsAt, label = "Temps restant", total }) {
  const left = useCountdown(endsAt);
  if (left == null) return null;
  const pct = total ? Math.min(100, (left / total) * 100) : null;
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={cn("font-mono text-6xl font-bold tabular-nums", left <= 5 ? "text-destructive animate-pulse" : "text-secondary")}>{left}s</p>
      {pct != null && <div className="mx-auto mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-muted"><div className="h-full bg-secondary transition-all" style={{ width: `${pct}%` }} /></div>}
    </div>
  );
}

export function RoomCard({ room, onJoin, joining }) {
  const full = room.max_players && room.players_count >= room.max_players;
  const available = room.status === "waiting" && !full;
  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><span className="font-mono text-lg font-bold tracking-widest text-primary">{room.code}</span><StatusBadge status={room.status} /></div>
        <p className="mt-1 truncate text-sm text-muted-foreground">{room.name || `Chambre de ${room.owner?.username ?? room.owner_username ?? "—"}`}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3.5" /> {room.players_count ?? room.players?.length ?? 0}{room.max_players ? ` / ${room.max_players}` : ""}</p>
      </div>
      {available ? <Button className="px-4" loading={joining} onClick={() => onJoin(room)}>Rejoindre</Button>
        : <span className="text-xs text-muted-foreground">{full ? "Pleine" : "Indisponible"}</span>}
    </Card>
  );
}

export function PlayerCard({ player, isOwner, isMe }) {
  const online = player.is_connected ?? player.connected ?? true;
  return (
    <li className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
      <span className="grid size-9 place-items-center rounded-full bg-primary/20 font-bold text-primary">{player.username?.[0]?.toUpperCase()}</span>
      <span className="flex-1 truncate font-medium">{player.username}{isMe && <span className="text-muted-foreground"> (vous)</span>}</span>
      {isOwner && <Crown className="size-4 text-warning" aria-label="Créateur" />}
      {online ? <Wifi className="size-4 text-success" aria-label="Connecté" /> : <WifiOff className="size-4 text-muted-foreground" aria-label="Déconnecté" />}
    </li>
  );
}
export const PlayerList = ({ players, ownerId, meId }) => (
  <ul className="space-y-2">{players.map((p) => <PlayerCard key={p.id} player={p} isOwner={p.id === ownerId} isMe={p.id === meId} />)}</ul>
);

export function Leaderboard({ players, meId, showRoundStatus = true }) {
  const sorted = [...players].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0));
  return (
    <ol className="space-y-2">
      {sorted.map((p, i) => (
        <li key={p.id} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 transition-all", p.id === meId ? "bg-primary/15 ring-1 ring-primary/40" : "bg-muted/40")}>
          <span className={cn("w-6 text-center font-mono font-bold", i === 0 ? "text-warning" : "text-muted-foreground")}>{i + 1}</span>
          <span className="flex-1 truncate font-medium">{p.username}</span>
          {showRoundStatus && (p.has_submitted ? <Check className="size-4 text-success" aria-label="A soumis" /> : <Clock className="size-4 text-muted-foreground" aria-label="En attente" />)}
          <span className="flex items-center gap-1 font-mono text-sm font-bold"><Trophy className="size-3.5 text-warning" />{p.wins ?? 0}</span>
        </li>
      ))}
    </ol>
  );
}

export const RoundProgress = ({ current, total }) => (
  <div className="flex gap-1.5">{Array.from({ length: total }, (_, i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < current ? "bg-primary" : "bg-muted")} />)}</div>
);
export const BackToRooms = () => <Link to="/rooms" className="text-sm text-muted-foreground hover:text-foreground">← Chambres</Link>;
