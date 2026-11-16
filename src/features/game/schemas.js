import { z } from "zod";
export const submitNumberSchema = z.object({
  number: z.coerce.number({ invalid_type_error: "Entrez un nombre" })
    .min(0, "Minimum 0").max(100, "Maximum 100"),
});
