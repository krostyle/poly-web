export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] shrink-0 flex-col justify-between p-12 bg-(--navy-900)">
        <span className="font-display text-2xl font-semibold text-white tracking-tight">
          Poly
        </span>

        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="size-3.5 rounded-full bg-(--verde)" />
            <span className="size-3.5 rounded-full bg-(--amarillo)" />
            <span className="size-3.5 rounded-full bg-(--rojo)" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            Gestión de casos<br />Ley 20.009
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xs">
            Plataforma para estudios jurídicos especializados en fraude bancario.
          </p>
        </div>

        <p className="text-sm text-white/30">© 2025 Poly</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 bg-(--paper)">
        {children}
      </div>
    </div>
  );
}
