import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b border-border bg-(--paper) px-4 py-3 md:px-6">
      <button
        className="p-1 text-(--ink-600) hover:text-(--navy-900) transition-colors md:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>
      <div className="flex-1" />
      <UserButton />
    </header>
  );
}
