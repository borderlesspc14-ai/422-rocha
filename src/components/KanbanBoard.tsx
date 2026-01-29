import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Processo, StatusProcesso, Cliente } from '@/types/comex';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

interface KanbanBoardProps {
  processos: Processo[];
  clientes: Cliente[];
  onProcessoUpdate: (processo: Processo) => void;
  onProcessoClick: (processo: Processo) => void;
}

const columns: { id: StatusProcesso; title: string }[] = [
  { id: 'documentacao', title: 'Documentação' },
  { id: 'em_transito', title: 'Em Trânsito' },
  { id: 'desembaraco', title: 'Desembaraço' },
  { id: 'liberado', title: 'Liberado' },
];

export function KanbanBoard({
  processos,
  clientes,
  onProcessoUpdate,
  onProcessoClick,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const processosPorStatus = (status: StatusProcesso) =>
    processos.filter((p) => p.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const processoId = active.id as string;
    const novoStatus = over.id as StatusProcesso;

    const processo = processos.find((p) => p.id === processoId);
    if (processo && processo.status !== novoStatus) {
      onProcessoUpdate({ ...processo, status: novoStatus });
    }

    setActiveId(null);
  };

  const activeProcesso = activeId
    ? processos.find((p) => p.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const processosColuna = processosPorStatus(column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              processos={processosColuna}
              clientes={clientes}
              onProcessoClick={onProcessoClick}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeProcesso ? (() => {
          const cliente = clientes.find((c) => c.id === activeProcesso.clienteId);
          return (
            <KanbanCard processo={activeProcesso} cliente={cliente} isDragging />
          );
        })() : null}
      </DragOverlay>
    </DndContext>
  );
}

