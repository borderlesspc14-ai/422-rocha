import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paperclip } from 'lucide-react';
import { Processo, Cliente } from '@/types/comex';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  processo: Processo;
  cliente?: Cliente;
  isDragging?: boolean;
  onClick?: () => void;
}

export function KanbanCard({
  processo,
  cliente,
  isDragging = false,
  onClick,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: processo.id,
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const tipoLabel = processo.tipo === 'importacao' ? 'Importação' : 'Exportação';
  const tipoColor =
    processo.tipo === 'importacao'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-green-100 text-green-700 border-green-200';

  const dataFormatada = new Date(processo.dataPrevisao).toLocaleDateString(
    'pt-BR',
    { day: '2-digit', month: 'short' }
  );

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'cursor-pointer border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        (isDragging || isSortableDragging) && 'opacity-50'
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {processo.id}
            </p>
            <p className="text-xs text-slate-500">{processo.numeroNotaFiscal}</p>
          </div>
          {processo.temDocumentos && (
            <Paperclip className="h-4 w-4 text-slate-400" />
          )}
        </div>

        <div>
          <Badge
            variant="outline"
            className={cn('text-xs', tipoColor)}
          >
            {tipoLabel}
          </Badge>
        </div>

        <div className="space-y-1 text-xs text-slate-600">
          <p className="font-medium">Cliente: {cliente?.nome || processo.clienteId}</p>
          <p>ETA: {dataFormatada}</p>
        </div>
      </div>
    </Card>
  );
}

