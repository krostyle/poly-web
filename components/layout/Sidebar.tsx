"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import { useMe } from "@/features/auth/hooks/useMe";
import { Skeleton } from "@/components/ui/skeleton";

const mainNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/casos", label: "Casos" },
  { href: "/plazos", label: "Plazos" },
];

const adminNav = [
  { href: "/configuracion/bancos", label: "Bancos" },
  { href: "/configuracion/usuarios", label: "Usuarios" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { organization } = useOrganization();
  const { data: me, isLoading: loadingMe } = useMe();
  const showAdmin = !loadingMe && me?.usuario.rol === "ADMIN";

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-(--navy-900) text-white",
        "transition-transform duration-200 ease-in-out",
        "md:relative md:w-60 md:z-auto md:min-h-screen md:shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      <button
        className="absolute top-4 right-4 p-1 text-white/50 hover:text-white md:hidden"
        onClick={onClose}
        aria-label="Cerrar menú"
      >
        <X className="size-5" />
      </button>

      <div className="px-6 py-5 border-b border-white/10 space-y-0.5">
        <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">
          Poly
        </p>
        {organization?.name ? (
          <p className="font-display text-base font-semibold text-white truncate pr-8">
            {organization.name}
          </p>
        ) : (
          <Skeleton className="h-5 w-32 bg-white/10" />
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {mainNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-(--navy-700) text-white font-medium"
                  : "text-white/70 hover:bg-(--navy-700) hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        {showAdmin && (
          <>
            <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-white/30 uppercase">
              Configuración
            </p>
            {adminNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-(--navy-700) text-white font-medium"
                      : "text-white/70 hover:bg-(--navy-700) hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
}
