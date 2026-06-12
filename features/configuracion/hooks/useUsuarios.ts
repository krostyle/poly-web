import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getUsuarios, invitarUsuario, actualizarRolUsuario, completarOnboarding } from "@/lib/api/usuarios";
import type { Rol } from "@/lib/api/types";

export function useUsuarios() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      const token = await getToken();
      return getUsuarios(token ?? "");
    },
    staleTime: 30_000,
  });
}

export function useInvitarUsuario() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, rol }: { email: string; rol: Rol }) => {
      const token = await getToken();
      return invitarUsuario(token ?? "", email, rol);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
    },
  });
}

export function useCompletarOnboarding() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rol: "ABOGADO" | "TRAMITADOR") => {
      const token = await getToken();
      return completarOnboarding(token ?? "", rol);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useActualizarRol() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rol }: { id: string; rol: Rol }) => {
      const token = await getToken();
      return actualizarRolUsuario(token ?? "", id, rol);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["usuarios"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
