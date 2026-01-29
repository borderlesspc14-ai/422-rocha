import { useState } from 'react';
import { Processo, Cliente, EmailPreview as EmailPreviewType } from '@/types/comex';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ProcessoModal } from '@/components/ProcessoModal';
import { EmailPreview } from '@/components/EmailPreview';
import { gerarEmailPreview } from '@/lib/email-generator';

interface ProcessosProps {
  processos: Processo[];
  clientes: Cliente[];
  onProcessosChange: (processos: Processo[]) => void;
}

export function Processos({
  processos,
  clientes,
  onProcessosChange,
}: ProcessosProps) {
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [emailPreview, setEmailPreview] = useState<EmailPreviewType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleProcessoClick = (processo: Processo) => {
    setSelectedProcesso(processo);
    setModalOpen(true);
  };

  const handleProcessoUpdate = (processo: Processo) => {
    const updated = processos.map((p) =>
      p.id === processo.id ? processo : p
    );
    onProcessosChange(updated);
    setSelectedProcesso(processo);
  };

  const handleEmailPreview = (processo: Processo) => {
    const cliente = clientes.find((c) => c.id === processo.clienteId);
    if (cliente) {
      const email = gerarEmailPreview(processo, cliente);
      setEmailPreview(email);
      setModalOpen(false);
    }
  };

  const selectedCliente = selectedProcesso
    ? clientes.find((c) => c.id === selectedProcesso.clienteId)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Processos</h1>
        <p className="mt-2 text-slate-600">
          Gerencie os processos de importação e exportação
        </p>
      </div>

      <KanbanBoard
        processos={processos}
        clientes={clientes}
        onProcessoUpdate={handleProcessoUpdate}
        onProcessoClick={handleProcessoClick}
      />

      <ProcessoModal
        processo={selectedProcesso}
        cliente={selectedCliente || null}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProcesso(null);
        }}
        onSave={handleProcessoUpdate}
        onEmailPreview={handleEmailPreview}
      />

      {emailPreview && (
        <EmailPreview
          email={emailPreview}
          onClose={() => setEmailPreview(null)}
        />
      )}
    </div>
  );
}

