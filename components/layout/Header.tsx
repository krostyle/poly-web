import { UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex items-center justify-end gap-4 border-b border-gray-200 bg-(--paper) px-6 py-3">
      <UserButton />
    </header>
  );
}
