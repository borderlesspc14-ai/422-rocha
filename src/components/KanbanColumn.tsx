import { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Processo, StatusProcesso, Cliente } from '@/types/comex';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: StatusProcesso;
  title: string;
  processos: Processo[];
  clientes: Cliente[];
  onProcessoClick: (processo: Processo) => void;
}

export function KanbanColumn({
  id: _id,
  title,
  processos,
  clientes,
  onProcessoClick,
}: KanbanColumnProps) {
  const processoIds = useMemo(
    () => processos.map((p) => p.id),
    [processos]
  );

  return (
    <div className="flex min-w-[280px] flex-col rounded-lg bg-slate-50/50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="text-xs text-slate-500">
          {processos.length} {processos.length === 1 ? 'processo' : 'processos'}
        </span>
      </div>
      <SortableContext items={processoIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {processos.map((processo) => {
            const cliente = clientes.find((c) => c.id === processo.clienteId);
            return (
              <KanbanCard
                key={processo.id}
                processo={processo}
                cliente={cliente}
                onClick={() => onProcessoClick(processo)}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}

