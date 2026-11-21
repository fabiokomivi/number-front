import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AppShell";
import { Button, ErrorMessage, Input } from "@/components/kit";
import { registerSchema } from "@/features/auth/schemas";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/lib/axios";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Inscription — The Number Game" }, { name: "description", content: "Créez votre compte joueur." }, { property: "og:title", content: "Inscription — The Number Game" }, { property: "og:description", content: "Créez votre compte joueur." }] }),
  component: Register,
});

function Register() {
  const { register: signUp, login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) });
  const onSubmit = async (values) => {
    setServerError("");
    try {
      const {password2, ...data} = values
      await signUp(data);
      await login({ username: values.username, password: values.password });
      toast.success("Compte créé !");
      navigate({ to: "/rooms" });
    } catch (e) {
      const { message, fields } = parseApiError(e);
      Object.entries(fields).forEach(([k, v]) => setError(k, { message: v }));
      if (!Object.keys(fields).length) setServerError(message);
    }
  };
  return (
    <AuthLayout title="Inscription" subtitle="Rejoignez l'arène en 30 secondes.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <ErrorMessage>{serverError}</ErrorMessage>}
        <Input label="Nom d'utilisateur" autoComplete="username" {...register("username")} error={errors.username?.message} />
        <Input label="E-mail" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <Input label="Mot de passe" type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Créer mon compte</Button>
        <p className="text-center text-sm text-muted-foreground">Déjà inscrit ? <Link to="/login" className="font-semibold text-primary">Se connecter</Link></p>
      </form>
    </AuthLayout>
  );
}
