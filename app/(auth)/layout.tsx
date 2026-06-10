export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div
        className="hidden lg:flex lg:w-130 xl:w-145 shrink-0 flex-col justify-between p-14"
        style={{
          background: "linear-gradient(150deg, var(--navy-900) 60%, var(--navy-700) 100%)",
        }}
      >
        <span className="text-sm font-semibold tracking-widest text-white/60 uppercase">
          Poly
        </span>

        <div className="space-y-10">
          <div
            className="w-10 h-0.5 rounded-full"
            style={{ backgroundColor: "var(--amber-500)" }}
          />
          <div className="space-y-0.5">
            <p className="font-display text-6xl font-bold tracking-tight text-white leading-none">
              Casos.
            </p>
            <p
              className="font-display text-6xl font-bold tracking-tight leading-none"
              style={{ color: "var(--amber-500)" }}
            >
              Plazos.
            </p>
            <p className="font-display text-6xl font-bold tracking-tight text-white/25 leading-none">
              Control.
            </p>
          </div>
          <p className="text-sm text-white/40 leading-relaxed max-w-65">
            Para estudios jurídicos especializados en fraude bancario.
          </p>
        </div>

        <p className="text-xs tracking-widest text-white/20 uppercase">© 2025 Poly</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 bg-(--paper)">
        {children}
      </div>
    </div>
  );
}
