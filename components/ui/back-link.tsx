import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackLinkProps {
  href: string;
  children: React.ReactNode;
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 -ml-1 rounded-md px-1 py-0.5 text-sm text-(--ink-600) transition-colors hover:text-(--navy-900)"
    >
      <ArrowLeft
        className="size-4 transition-transform duration-150 group-hover:-translate-x-0.5"
        strokeWidth={1.75}
      />
      {children}
    </Link>
  );
}
