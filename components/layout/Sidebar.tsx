"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/casos", label: "Casos" },
  { href: "/plazos", label: "Plazos" },
];

interface SidebarProps {
  orgName: string;
}

export function Sidebar({ orgName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-(--navy-900) text-white min-h-screen">
      <div className="px-6 py-5 border-b border-white/10">
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Poly
        </span>
        <p className="mt-0.5 text-xs text-white/40 truncate">{orgName}</p>
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
