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
    done.current = true;

    getToken().then((token) => {
      if (!token) return;
      bootstrap(token, {
        org_name: organization.name,
        user_name: user.fullName ?? user.firstName ?? "Usuario",
        user_email: user.primaryEmailAddress?.emailAddress ?? "",
      })
        .then(() => {
          // Invalidate me cache so sidebar and pages pick up the fresh role from DB
          qc.invalidateQueries({ queryKey: ["me"] });
        })
        .catch(() => {
          // Non-blocking
        });
    });
  }, [organization, user, getToken, qc]);

  return <>{children}</>;
}
