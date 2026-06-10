import Link from "next/link";
import { CasoDetalleView } from "@/features/casos/components/CasoDetalleView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CasoDetallePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link
        href="/casos"
        className="text-sm text-(--ink-600) hover:text-(--navy-900) transition-colors"
      >
        ← Volver a casos
      </Link>
      <CasoDetalleView id={id} />
    </div>
  );
}
