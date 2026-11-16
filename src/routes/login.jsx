import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AppShell";
import { Button, ErrorMessage, Input } from "@/components/kit";
import { loginSchema } from "@/features/auth/schemas";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/lib/axios";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — The Number Game" }, { name: "description", content: "Connectez-vous pour rejoindre une partie." }, { property: "og:title", content: "Connexion — The Number Game" }, { property: "og:description", content: "Connectez-vous pour rejoindre une partie." }] }),
  component: Login,
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema) });
  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      toast.success("Bienvenue !");
      navigate({ to: "/rooms" });
    } catch (e) {
      const { message, fields } = parseApiError(e);
      Object.entries(fields).forEach(([k, v]) => setError(k, { message: v }));
      setServerError(e?.response?.status === 401 ? "Identifiants incorrects." : message);
    }
  };
  return (
    <AuthLayout title="Connexion" subtitle="Heureux de vous revoir.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && <ErrorMessage>{serverError}</ErrorMessage>}
        <Input label="Nom d'utilisateur" autoComplete="username" {...register("username")} error={errors.username?.message} />
        <Input label="Mot de passe" type="password" autoComplete="current-password" {...register("password")} error={errors.password?.message} />
        <Button type="submit" className="w-full" loading={isSubmitting}>Se connecter</Button>
        <p className="text-center text-sm text-muted-foreground">Pas de compte ? <Link to="/register" className="font-semibold text-primary">S'inscrire</Link></p>
      </form>
    </AuthLayout>
  );
}
