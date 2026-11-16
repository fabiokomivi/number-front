import { z } from "zod";
export const createRoomSchema = z.object({
  name: z.string().trim().max(40, "40 caractères maximum").optional(),
  max_players: z.coerce.number().int().min(2, "2 joueurs minimum").max(20, "20 joueurs maximum"),
});
export const joinRoomSchema = z.object({
  code: z.string().trim().min(4, "Code trop court").max(12, "Code trop long").transform((s) => s.toUpperCase()),
});
