import { z } from "zod";
export const loginSchema = z.object({
  username: z.string().trim().min(1, "Nom d'utilisateur requis"),
  password: z.string().min(1, "Mot de passe requis"),
});
export const registerSchema = z
  .object({
    username: z.string().trim().min(3, "3 caractères minimum").max(30, "30 caractères maximum")
      .regex(/^[\w.@+-]+$/, "Lettres, chiffres et @ . + - _ uniquement"),
    email: z.string().trim().email("Adresse e-mail invalide"),
    password: z.string().min(4, "4 caractères minimum"),
  })
//  .refine((d) => d.password === d.password2, { message: "Les mots de passe ne correspondent pas", path: ["password2"] });
