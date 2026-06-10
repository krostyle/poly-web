"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// base-ui DialogTrigger uses render prop, not asChild
import { CrearCasoForm } from "./CrearCasoForm";

export function NuevoCasoDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess(casoId: string) {
    setOpen(false);
    router.push(`/casos/${casoId}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        Nuevo caso
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-(--navy-900)">
            Nuevo caso
          </DialogTitle>
        </DialogHeader>
        <CrearCasoForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
