import { useState, useEffect } from 'react';
import { Processo, Cliente } from '@/types/comex';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';

interface ProcessoModalProps {
  processo: Processo | null;
  cliente: Cliente | null;
  clientes?: Cliente[];
  open: boolean;
  onClose: () => void;
  onSave: (processo: Processo) => void;
  onEmailPreview: (processo: Processo) => void;
}

export function ProcessoModal({
  processo,
  cliente: _cliente,
  clientes = [],
  open,
  onClose,
  onSave,
  onEmailPreview,
}: ProcessoModalProps) {
  const isNew = processo === null;
  const [formData, setFormData] = useState<Processo | null>(() => {
    if (processo) return processo;
    // Dados padrão para nova carga
    return {
      id: '',
      referencia: '',
      clienteId: '',
      tipo: 'importacao',
      status: 'pendente',
      dataPrevisao: new Date().toISOString().split('T')[0],
      temDocumentos: false,
      origem: '',
      destino: '',
      transportador: '',
    } as Processo;
  });

  // Atualizar formData quando processo mudar
  useEffect(() => {
    if (processo) {
      setFormData(processo);
    } else {
      setFormData({
        id: '',
        referencia: '',
        clienteId: clientes.length > 0 ? clientes[0].id : '',
        tipo: 'importacao',
        status: 'pendente',
        dataPrevisao: new Date().toISOString().split('T')[0],
        temDocumentos: false,
        origem: '',
        destino: '',
        transportador: '',
      } as Processo);
    }
  }, [processo, open]);

  if (!formData) return null;

  const handleChange = (
    field: keyof Processo,
    value: string | boolean | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (formData) {
      if (isNew) {
        // Validar campos obrigatórios para nova carga
        if (!formData.referencia || !formData.clienteId) {
          return;
        }
        // Gerar ID se não existir
        if (!formData.id) {
          const tipoPrefix = formData.tipo === 'importacao' ? 'IMP' : 'EXP';
          const ano = new Date().getFullYear();
          const numero = Date.now().toString().slice(-4);
          formData.id = `PROC-${tipoPrefix}-${ano}-${numero}`;
        }
      }
      onSave(formData);
      onClose();
    }
  };

  const handleEmailPreview = () => {
    if (formData) {
      onEmailPreview(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Nova Carga' : `Editar Processo ${processo.id}`}</DialogTitle>
          <DialogDescription>
            {isNew 
              ? 'Preencha os dados da nova carga de importação ou exportação'
              : `Atualize as informações do processo de ${formData.tipo === 'importacao' ? 'importação' : 'exportação'}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="referencia">Referência</Label>
            <Input
              id="referencia"
              value={formData.referencia || ''}
              onChange={(e) => handleChange('referencia', e.target.value)}
              placeholder="Ex: EXP-2026-0095"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente</Label>
            <Select
              value={formData.clienteId}
              onValueChange={(value) => handleChange('clienteId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="importacao">Importação</SelectItem>
                  <SelectItem value="exportacao">Exportação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="alfandega">Alfândega</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataPrevisao">Data de Previsão (ETA)</Label>
              <Input
                id="dataPrevisao"
                type="date"
                value={formData.dataPrevisao}
                onChange={(e) => handleChange('dataPrevisao', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroNotaFiscal">Nota Fiscal</Label>
              <Input
                id="numeroNotaFiscal"
                value={formData.numeroNotaFiscal || ''}
                onChange={(e) =>
                  handleChange('numeroNotaFiscal', e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                value={formData.origem || ''}
                onChange={(e) => handleChange('origem', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                value={formData.destino || ''}
                onChange={(e) => handleChange('destino', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transportador">Transportador</Label>
            <Input
              id="transportador"
              value={formData.transportador || ''}
              onChange={(e) => handleChange('transportador', e.target.value)}
              placeholder="Ex: COSCO, MSC, Maersk..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              type="number"
              value={formData.valor || ''}
              onChange={(e) =>
                handleChange('valor', parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ''}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="temDocumentos"
              checked={formData.temDocumentos}
              onChange={(e) => handleChange('temDocumentos', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <Label htmlFor="temDocumentos" className="cursor-pointer">
              Possui documentos anexados
            </Label>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {!isNew && (
            <Button
              variant="outline"
              onClick={handleEmailPreview}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Preparar E-mail de Atualização
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {isNew ? 'Criar Carga' : 'Salvar Alterações'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

