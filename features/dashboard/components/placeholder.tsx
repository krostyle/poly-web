export function DashboardPlaceholder() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-(--paper) p-12 text-center">
      <p className="text-sm text-(--ink-600)">
        Las secciones <strong>Por vencer</strong>, <strong>Nuevos</strong> y{" "}
        <strong>Estancados</strong> se construirán en la siguiente fase.
      </p>
    </div>
  );
}
