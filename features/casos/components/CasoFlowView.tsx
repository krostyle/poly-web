"use client";

import { useMemo } from "react";
import {
  FileText,
  Scale,
  Banknote,
  Gavel,
  Users,
  BookOpen,
  RotateCcw,
  BookOpenCheck,
  CircleDollarSign,
  CheckCircle2,
  Archive,
  Clock,
  Check,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCaso } from "@/features/casos/hooks/useCaso";
import { usePlazosCaso } from "@/features/plazos/hooks/usePlazosCaso";
import { useHistorialCaso } from "@/features/casos/hooks/useHistorialCaso";
import type { Estado, Plazo, TipoPlazo, Semaforo, ResultadoJPL } from "@/lib/api/types";

// ── Static definitions ────────────────────────────────────────────────────────

const TIPO_PLAZO_LABELS: Record<TipoPlazo, string> = {
  ANALISIS_INTERNO:    "Análisis interno",
  RESTITUCION:         "Restitución",
  ASIGNACION:          "Asignación",
  PRECAUTELAR:         "Medida precautelar",
  RESOLUCION_JPL:      "Resolución JPL",
  DEMANDA:             "Demanda banco",
  RESTITUCION_RECHAZO: "Rechazo restitución",
  RESPUESTA_DENUNCIA:  "Respuesta denuncia",
};

const RESULTADO_JPL_LABELS: Record<ResultadoJPL, string> = {
  ACEPTA_SUSPENSION:  "JPL acepta suspensión — proceso continúa vía judicial",
  RECHAZA_SUSPENSION: "JPL rechaza suspensión — banco debe devolver el monto",
};

interface FlowNodeDef {
  state: Estado;
  label: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: React.ComponentType<any>;
  plazoTypes: TipoPlazo[];
  onlyIfVisited?: boolean;
}

const FLOW_NODES: FlowNodeDef[] = [
  {
    state: "INGRESO",
    label: "Ingreso",
    description: "Registro inicial — DJ recibida del banco",
    Icon: FileText,
    plazoTypes: ["ANALISIS_INTERNO", "ASIGNACION", "RESTITUCION", "RESPUESTA_DENUNCIA"],
  },
  {
    state: "PREJUDICIAL",
    label: "Prejudicial",
    description: "Medida precautoria presentada ante el JPL — obligatoria al ingresar el caso",
    Icon: Scale,
    plazoTypes: ["PRECAUTELAR", "RESOLUCION_JPL"],
    onlyIfVisited: true,
  },
  {
    state: "PAGO_NORMATIVO",
    label: "Pago normativo",
    description: "El banco debe restituir por vía normativa",
    Icon: Banknote,
    plazoTypes: ["RESTITUCION_RECHAZO", "DEMANDA"],
    onlyIfVisited: true,
  },
  {
    state: "JUDICIAL",
    label: "Judicial",
    description: "Demanda presentada ante el JPL",
    Icon: Gavel,
    plazoTypes: ["DEMANDA"],
  },
  {
    state: "AUDIENCIA",
    label: "Audiencia",
    description: "Debate oral ante el juez",
    Icon: Users,
    plazoTypes: [],
  },
  {
    state: "SENTENCIA",
    label: "Sentencia",
    description: "Resolución definitiva del JPL",
    Icon: BookOpen,
    plazoTypes: [],
  },
  {
    state: "APELACION",
    label: "Apelación",
    description: "Recurso ante tribunal de alzada",
    Icon: RotateCcw,
    plazoTypes: [],
    onlyIfVisited: true,
  },
  {
    state: "SENTENCIA_SEGUNDA",
    label: "2ª instancia",
    description: "Fallo del tribunal de apelación",
    Icon: BookOpenCheck,
    plazoTypes: [],
    onlyIfVisited: true,
  },
  {
    state: "CUMPLIMIENTO",
    label: "Cumplimiento",
    description: "Ejecución del fallo — cobro efectivo",
    Icon: CircleDollarSign,
    plazoTypes: [],
  },
  {
    state: "TERMINADO",
    label: "Terminado",
    description: "Caso finalizado",
    Icon: CheckCircle2,
    plazoTypes: [],
  },
  {
    state: "CIERRE",
    label: "Cierre",
    description: "Expediente cerrado",
    Icon: Archive,
    plazoTypes: [],
    onlyIfVisited: true,
  },
];

// ── State ordering for "past/present/future" logic ───────────────────────────
const STATE_ORDER: Estado[] = [
  "INGRESO", "PREJUDICIAL", "PAGO_NORMATIVO", "JUDICIAL",
  "AUDIENCIA", "SENTENCIA", "APELACION", "SENTENCIA_SEGUNDA",
  "CUMPLIMIENTO", "TERMINADO", "CIERRE",
];

function stateRank(s: Estado): number {
  const i = STATE_ORDER.indexOf(s);
  return i === -1 ? 99 : i;
}

// ── Plazo chip ────────────────────────────────────────────────────────────────

const SEMAFORO_CHIP: Record<Semaforo | "PENDING", string> = {
  VERDE:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  AMARILLO: "bg-amber-50 text-amber-700 border-amber-200",
  ROJO:     "bg-red-50 text-red-700 border-red-200",
  VENCIDO:  "bg-red-100 text-red-800 border-red-300",
  PENDING:  "bg-(--slate-100) text-(--ink-600) border-border/60",
};

function PlazoChip({ plazo }: { plazo: Plazo }) {
  const label = TIPO_PLAZO_LABELS[plazo.tipo] ?? plazo.tipo;

  if (plazo.cumplido) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <Check className="size-3" />
        {label}
      </span>
    );
  }

  const key = (plazo.semaforo ?? "PENDING") as Semaforo | "PENDING";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", SEMAFORO_CHIP[key])}>
      <Clock className="size-3" />
      {label}
      {plazo.diasRestantes !== undefined && (
        <span className="font-semibold">{plazo.diasRestantes}d</span>
      )}
    </span>
  );
}

// ── Branch indicator (shown after PREJUDICIAL) ────────────────────────────────

function BranchIndicator({ resultadoJpl }: { resultadoJpl?: ResultadoJPL }) {
  return (
    <div className="ml-4 my-1">
      <div className="rounded-xl border border-border bg-(--slate-100)/50 p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <GitBranch className="size-3.5 text-(--ink-600)" />
          <span className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">Resolución sobre suspensión del monto</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={cn(
            "rounded-lg border p-2.5 transition-colors",
            resultadoJpl === "ACEPTA_SUSPENSION"
              ? "border-(--navy-700)/40 bg-(--navy-900)/8 ring-1 ring-(--navy-700)/20"
              : resultadoJpl
                ? "border-border/40 opacity-40"
                : "border-border/60 bg-white"
          )}>
            <p className="text-xs font-semibold text-(--navy-900)">JPL acepta la suspensión</p>
            <p className="mt-0.5 text-[11px] text-(--ink-600)">El banco mantiene el monto suspendido</p>
            <p className="mt-0.5 text-[11px] text-(--ink-600)">→ Debe demandar formalmente en 10 días</p>
          </div>
          <div className={cn(
            "rounded-lg border p-2.5 transition-colors",
            resultadoJpl === "RECHAZA_SUSPENSION"
              ? "border-amber-500/40 bg-amber-50/60 ring-1 ring-amber-400/20"
              : resultadoJpl
                ? "border-border/40 opacity-40"
                : "border-border/60 bg-white"
          )}>
            <p className="text-xs font-semibold text-(--navy-900)">JPL rechaza la suspensión</p>
            <p className="mt-0.5 text-[11px] text-(--ink-600)">El banco debe devolver el monto al cliente</p>
            <p className="mt-0.5 text-[11px] text-(--ink-600)">→ Pago normativo</p>
          </div>
        </div>
        {resultadoJpl && (
          <p className="mt-2 text-xs font-medium text-(--navy-700)">
            ✓ {RESULTADO_JPL_LABELS[resultadoJpl]}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Flow node ─────────────────────────────────────────────────────────────────

type NodeStatus = "completed" | "current" | "future" | "skipped";

function FlowNode({
  def,
  status,
  enteredAt,
  plazos,
  isLast,
}: {
  def: FlowNodeDef;
  status: NodeStatus;
  enteredAt?: string;
  plazos: Plazo[];
  isLast: boolean;
}) {
  const { Icon } = def;

  const nodeStyle = {
    completed: "bg-(--verde) border-(--verde) text-white shadow-sm",
    current:   "bg-(--navy-700) border-(--navy-700) text-white shadow-md ring-4 ring-(--navy-700)/15",
    future:    "bg-white border-border/60 text-(--ink-600)",
    skipped:   "bg-(--slate-100) border-border/40 text-(--ink-600)/60",
  }[status];

  const labelStyle = {
    completed: "text-(--navy-900) font-semibold",
    current:   "text-(--navy-900) font-bold",
    future:    "text-(--ink-600)",
    skipped:   "text-(--ink-600)/50",
  }[status];

  const lineStyle = status === "completed"
    ? "bg-(--verde)/60"
    : "bg-border/40";

  const relevantPlazos = plazos.filter((p) => def.plazoTypes.includes(p.tipo));

  return (
    <div className="flex gap-3">
      {/* Timeline axis */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 32 }}>
        <div className={cn("size-8 rounded-full border-2 flex items-center justify-center transition-all", nodeStyle)}>
          <Icon className="size-3.5" strokeWidth={2} />
        </div>
        {!isLast && (
          <div className={cn("w-0.5 flex-1 min-h-6 mt-1 rounded-full", lineStyle)} />
        )}
      </div>

      {/* Content */}
      <div className={cn("pb-5 min-w-0 flex-1", isLast && "pb-0")}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-0.5">
          <span className={cn("text-sm leading-tight", labelStyle)}>{def.label}</span>
          {status === "current" && (
            <span className="inline-flex items-center rounded-full bg-(--navy-700)/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--navy-700)">
              Actual
            </span>
          )}
          {enteredAt && (
            <span className="text-xs text-(--ink-600)">
              {new Date(enteredAt).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          )}
        </div>
        {(status === "current" || status === "completed") && (
          <p className="mt-0.5 text-xs text-(--ink-600)">{def.description}</p>
        )}
        {relevantPlazos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {relevantPlazos.map((p) => (
              <PlazoChip key={p.id} plazo={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CasoFlowView({ casoId }: { casoId: string }) {
  const { data: casoData } = useCaso(casoId);
  const { data: plazos = [] } = usePlazosCaso(casoId);
  const { data: historial = [] } = useHistorialCaso(casoId);

  const caso = casoData?.caso;

  // Build map: estado → date it was entered (from audit log)
  const stateEntryDates = useMemo(() => {
    const map = new Map<Estado, string>();
    if (!caso) return map;
    map.set("INGRESO", caso.createdAt);
    for (const entry of historial) {
      if (entry.accion === "ESTADO_CAMBIADO") {
        const d = entry.detalle as { nuevo?: string };
        if (d.nuevo) map.set(d.nuevo as Estado, entry.createdAt);
      }
    }
    return map;
  }, [historial, caso]);

  const visitedStates = useMemo(() => new Set(stateEntryDates.keys()), [stateEntryDates]);

  const visibleNodes = useMemo(() => {
    if (!caso) return [];
    const currentRank = stateRank(caso.estado);

    return FLOW_NODES.filter((n) => {
      if (n.onlyIfVisited) return visitedStates.has(n.state) || n.state === caso.estado;
      return true;
    }).map((n) => {
      const rank = stateRank(n.state);
      let status: NodeStatus;
      if (n.state === caso.estado) {
        status = "current";
      } else if (visitedStates.has(n.state) && rank < currentRank) {
        status = "completed";
      } else {
        status = "future";
      }
      return { def: n, status, enteredAt: stateEntryDates.get(n.state) };
    });
  }, [caso, visitedStates, stateEntryDates]);

  if (!caso) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-none">
      <div className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-(--ink-600)">
          Flujo del caso
        </h3>
        <p className="mt-0.5 text-xs text-(--ink-600)">
          Etapas recorridas y pendientes bajo Ley 20.009
        </p>
      </div>

      <div>
        {visibleNodes.map(({ def, status, enteredAt }, idx) => {
          const isLast = idx === visibleNodes.length - 1;
          const showBranch = def.state === "PREJUDICIAL" && (status === "current" || status === "completed");

          return (
            <div key={def.state}>
              <FlowNode
                def={def}
                status={status}
                enteredAt={enteredAt}
                plazos={plazos}
                isLast={isLast && !showBranch}
              />
              {showBranch && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0" style={{ width: 32 }}>
                    {!isLast && (
                      <div className={cn(
                        "w-0.5 flex-1 rounded-full",
                        status === "completed" ? "bg-(--verde)/60" : "bg-border/40"
                      )} />
                    )}
                  </div>
                  <div className="flex-1 pb-5">
                    <BranchIndicator resultadoJpl={caso.resultadoJpl} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
