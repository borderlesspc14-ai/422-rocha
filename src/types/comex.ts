export type TipoProcesso = 'importacao' | 'exportacao';

export type StatusProcesso = 
  | 'documentacao' 
  | 'em_transito' 
  | 'desembaraco' 
  | 'liberado'
  | 'pendente'
  | 'alfandega'
  | 'atrasado'
  | 'entregue';

export interface Cliente {
  id: string;
  nome: string;
  email: string;
}

export interface Processo {
  id: string;
  referencia: string;
  clienteId: string;
  tipo: TipoProcesso;
  status: StatusProcesso;
  dataPrevisao: string;
  temDocumentos: boolean;
  origem: string;
  destino: string;
  transportador: string;
  numeroNotaFiscal?: string;
  valor?: number;
  observacoes?: string;
}

export interface EmailPreview {
  assunto: string;
  destinatario: string;
  corpo: string;
}

export type TipoCarga = 'FCL' | 'LCL' | 'Aereo';

export interface Projeto {
  id: string;
  nome: string;
  categoriaId: string;
  tipoCarga?: string;
  refAgCarga?: string;
  eta?: string;
  namo?: string;
  obs?: string;
  cambioPag?: string;
  draftBlAwb?: string;
  ctnTerm?: string;
  canal?: string;
  fatura?: string;
  rsCom?: string;
  status?: string;
  status2?: string;
  prioridade?: number;
  concluido?: boolean;
}

export interface CategoriaCarga {
  id: string;
  nome: string;
  tipo: TipoCarga;
  projetos: Projeto[];
}
