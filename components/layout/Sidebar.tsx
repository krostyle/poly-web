import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/casos", label: "Casos" },
  { href: "/plazos", label: "Plazos" },
];

export function Sidebar() {
  return (
    <aside
      className="flex w-60 flex-col bg-(--navy-900) text-white"
      style={{ minHeight: "100vh" }}
    >
      <div className="px-6 py-5 border-b border-white/10">
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Poly
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-white/80 hover:bg-(--navy-700) hover:text-white transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
