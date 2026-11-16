import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RefreshCw, DoorOpen } from "lucide-react";
import { toast } from "sonner";
import { ProtectedPage } from "@/components/layout/AppShell";
import { Button, Card, EmptyState, ErrorMessage, Input, LoadingSpinner, Modal } from "@/components/kit";
import { RoomCard } from "@/components/game";
import { roomService } from "@/features/rooms/roomService";
import { createRoomSchema, joinRoomSchema } from "@/features/rooms/schemas";
import { parseApiError } from "@/lib/axios";

export const Route = createFileRoute("/rooms/")({
  head: () => ({ meta: [{ title: "Chambres — The Number Game" }, { name: "description", content: "Rejoignez ou créez une chambre de jeu." }, { property: "og:title", content: "Chambres — The Number Game" }, { property: "og:description", content: "Rejoignez ou créez une chambre de jeu." }] }),
  component: () => <ProtectedPage><Rooms /></ProtectedPage>,
});

function Rooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    setState("loading");
    try { setRooms(await roomService.list()); setState("ready"); }
    catch (e) { setError(parseApiError(e).message); setState("error"); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const join = async (room) => {
    setJoiningId(room.id);
    try { await roomService.join(room.id); navigate({ to: "/rooms/$roomId", params: { roomId: String(room.id) } }); }
    catch (e) { toast.error(parseApiError(e).message); setJoiningId(null); }
  };

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div><h1 className="font-display text-2xl font-bold">Chambres</h1><p className="text-sm text-muted-foreground">Choisissez votre arène.</p></div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />Créer</Button>
      </div>
      <JoinByCode />
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Disponibles</h2>
        <button onClick={load} className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Actualiser"><RefreshCw className="size-4" /></button>
      </div>
      {state === "loading" && <LoadingSpinner />}
      {state === "error" && <ErrorMessage onRetry={load}>{error}</ErrorMessage>}
      {state === "ready" && (rooms.length === 0
        ? <EmptyState icon={DoorOpen} title="Aucune chambre">Créez la première et invitez vos amis.</EmptyState>
        : <div className="space-y-3">{rooms.map((r) => <RoomCard key={r.id} room={r} onJoin={join} joining={joiningId === r.id} />)}</div>)}
      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function JoinByCode() {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(joinRoomSchema) });
  const onSubmit = async ({ code }) => {
    try { const room = await roomService.joinByCode(code); navigate({ to: "/rooms/$roomId", params: { roomId: String(room.id) } }); }
    catch (e) { setError("code", { message: parseApiError(e).fields.code || parseApiError(e).message }); }
  };
  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-2" noValidate>
        <div className="flex-1"><Input placeholder="Code de la chambre" className="font-mono uppercase tracking-widest" {...register("code")} error={errors.code?.message} /></div>
        <Button type="submit" variant="secondary" className="h-12" loading={isSubmitting}>Rejoindre</Button>
      </form>
    </Card>
  );
}

function CreateRoomModal({ open, onClose }) {
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(createRoomSchema), defaultValues: { max_players: 8 } });
  const onSubmit = async (values) => {
    try { const room = await roomService.create(values); toast.success(`Chambre ${room.code} créée`); navigate({ to: "/rooms/$roomId", params: { roomId: String(room.id) } }); }
    catch (e) { const { message, fields } = parseApiError(e); Object.entries(fields).forEach(([k, v]) => setError(k, { message: v })); if (!Object.keys(fields).length) toast.error(message); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Nouvelle chambre">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Nom (optionnel)" {...register("name")} error={errors.name?.message} />
        <Input label="Joueurs maximum" type="number" inputMode="numeric" {...register("max_players")} error={errors.max_players?.message} />
        <div className="flex gap-2"><Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button><Button type="submit" className="flex-1" loading={isSubmitting}>Créer</Button></div>
      </form>
    </Modal>
  );
}
