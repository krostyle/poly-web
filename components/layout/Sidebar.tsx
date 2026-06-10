"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/casos", label: "Casos" },
  { href: "/plazos", label: "Plazos" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organization } = useOrganization();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-(--navy-900) text-white min-h-screen">
      <div className="px-6 py-5 border-b border-white/10 space-y-0.5">
        <p className="text-[10px] font-semibold tracking-widest text-white/30 uppercase">
          Poly
        </p>
        <p className="font-display text-base font-semibold text-white truncate">
          {organization?.name ?? "Cargando…"}
        </p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>
    </aside>
  );
}
