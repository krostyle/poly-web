"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CrearCasoForm } from "./CrearCasoForm";

export function NuevoCasoDialog() {
  const [open, setOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleSuccess(casoId: string) {
    setNavigating(true);
    startTransition(() => {
      router.push(`/casos/${casoId}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!navigating) setOpen(next); }}>
      <DialogTrigger render={<Button size="sm" />}>
        Nuevo caso
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-semibold text-(--navy-900)">
            Nuevo caso
          </DialogTitle>
        </DialogHeader>
        <CrearCasoForm
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
          navigating={navigating}
        />
      </DialogContent>
    </Dialog>
  );
}
