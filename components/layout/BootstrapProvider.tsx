"use client";

import { useEffect, useRef } from "react";
import { useAuth, useOrganization, useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { bootstrap } from "@/lib/api/auth";

export function BootstrapProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const { user } = useUser();
  const qc = useQueryClient();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !organization || !user) return;

    // Force a fresh token so it includes the active org claims (org_id, org_role).
    // A cached token may predate the org activation and lack these claims.
    getToken({ skipCache: true }).then((token) => {
      if (!token) {
        console.warn("[bootstrap] no token");
        return;
      }
      done.current = true;
      bootstrap(token, {
        org_name: organization.name,
        user_name: user.fullName ?? user.firstName ?? "Usuario",
        user_email: user.primaryEmailAddress?.emailAddress ?? "",
      })
        .then(() => {
          qc.invalidateQueries({ queryKey: ["me"] });
        })
        .catch((err) => {
          console.error("[bootstrap] failed:", err);
          // Reset so the next render can retry
          done.current = false;
        });
    });
  }, [organization, user, getToken, qc]);

  return <>{children}</>;
}
