import { Processo, Cliente, EmailPreview } from '@/types/comex';

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  em_transito: 'Em Trânsito',
  alfandega: 'Na Alfândega',
  atrasado: 'Atrasado',
  entregue: 'Entregue',
};

const tipoLabels: Record<string, string> = {
  importacao: 'Importação',
  exportacao: 'Exportação',
};

export function gerarEmailPreview(processo: Processo, cliente: Cliente): EmailPreview {
  const tipoLabel = tipoLabels[processo.tipo];
  const statusLabel = statusLabels[processo.status];
  
  const assunto = `Atualização - Processo ${processo.id} - ${tipoLabel}`;
  
  let corpo = `Prezado(a) ${cliente.nome},\n\n`;
  corpo += `Informamos que o processo ${processo.id} (${tipoLabel}) encontra-se atualmente no status: **${statusLabel}**.\n\n`;
  
  if (processo.dataPrevisao) {
    const dataFormatada = new Date(processo.dataPrevisao).toLocaleDateString('pt-BR');
    corpo += `**Data de Previsão (ETA):** ${dataFormatada}\n`;
  }
  
  if (processo.numeroNotaFiscal) {
    corpo += `**Nota Fiscal:** ${processo.numeroNotaFiscal}\n`;
  }
  
  if (processo.valor) {
    corpo += `**Valor:** R$ ${processo.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  }
  
  if (processo.origem && processo.destino) {
    corpo += `**Rota:** ${processo.origem} → ${processo.destino}\n`;
  }
  
  if (processo.observacoes) {
    corpo += `\n**Observações:**\n${processo.observacoes}\n`;
  }
  
  corpo += `\nMantemos você informado sobre todas as atualizações.\n\n`;
  corpo += `Atenciosamente,\nEquipe ComexFlow`;
  
  return {
    assunto,
    destinatario: cliente.email,
    corpo,
  };
}

