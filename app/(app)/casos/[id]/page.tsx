import { BackLink } from "@/components/ui/back-link";
import { CasoDetalleView } from "@/features/casos/components/CasoDetalleView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CasoDetallePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <BackLink href="/casos">Volver a casos</BackLink>
      <CasoDetalleView id={id} />
    </div>
  );
}
