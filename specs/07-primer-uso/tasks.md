# SPEC-07 Primer uso — Tasks (poly-web)

## Estado: 🔲 Pendiente

## Tareas

### Componentes

- [ ] `features/dashboard/components/OnboardingBanner.tsx` — banner con dos variantes (ADMIN / no-admin) basado en `me.usuario.rol` y `me.bancos.length`
- [ ] `app/(app)/dashboard/page.tsx` — agregar `<OnboardingBanner />` condicionalmente (convertir a Client Component o extraer wrapper)

### Lista de casos

- [ ] `app/(app)/casos/page.tsx` — pasar `noBancos={me?.bancos.length === 0}` o equivalente al componente de tabla
- [ ] `features/casos/components/CasosTable.tsx` (o similar) — diferenciar estado vacío: sin bancos vs. sin casos

### Verificación

- [ ] Usuario admin sin bancos: dashboard muestra banner con CTA a configuración
- [ ] Usuario abogado sin bancos: dashboard muestra banner informativo sin CTA
- [ ] Usuario sin bancos en `/casos`: mensaje explicativo, no tabla vacía genérica
- [ ] Después de que admin crea banco y asigna usuario, el banner desaparece en la próxima carga
- [ ] `npx tsc --noEmit` sin errores
