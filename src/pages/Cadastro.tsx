import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, Plus, Eye, Grid, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StandardTable, StandardTableColumn } from '@/components/ui/standard-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { exportToCSV } from '@/lib/export-utils';

interface ElementoCadastro {
  id: string;
  grupoId: string;
  elemento: string;
  contato: string;
  clientes: string;
  status: string;
  telefone: string;
  email: string;
  procuracao: string;
  vencProcuracao: string;
  status1: string;
  [key: string]: any;
}

interface Grupo {
  id: string;
  nome: string;
  elementos: ElementoCadastro[];
}

const gruposIniciais: Grupo[] = [
  {
    id: 'grupo-tws',
    nome: 'Grupo TWS',
    elementos: [
      {
        id: 'cad-1',
        grupoId: 'grupo-tws',
        elemento: 'TWS',
        contato: 'WATSON',
        clientes: 'TWS',
        status: 'TWS',
        telefone: '+55 15 97401 9365',
        email: 'compras@aquece...',
        procuracao: '',
        vencProcuracao: 'nov 6, 2024',
        status1: 'Feito',
      },
      {
        id: 'cad-2',
        grupoId: 'grupo-tws',
        elemento: 'WATTS',
        contato: 'WATSON',
        clientes: 'WATTS',
        status: 'WATTS',
        telefone: '+55 15 97401 9365',
        email: 'compras@aquece...',
        procuracao: '',
        vencProcuracao: 'nov 1, 2024',
        status1: 'Feito',
      },
      {
        id: 'cad-3',
        grupoId: 'grupo-tws',
        elemento: 'WTS',
        contato: 'WATSON',
        clientes: 'WTS',
        status: 'WTS',
        telefone: '+55 15 97401 9365',
        email: 'compras@aquece...',
        procuracao: '',
        vencProcuracao: 'out 31, 2024',
        status1: '',
      },
    ],
  },
];

export function Cadastro() {
  const [grupos, setGrupos] = useState<Grupo[]>(gruposIniciais);
  const [pesquisa, setPesquisa] = useState('');
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set(['grupo-tws']));
  const [elementosSelecionadosPorGrupo, setElementosSelecionadosPorGrupo] = useState<Record<string, Set<number>>>({});
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState<Record<string, string[]>>({});
  const [elementoComentarioAberto, setElementoComentarioAberto] = useState<string | null>(null);
  const [comentarioAtual, setComentarioAtual] = useState('');
  const [comentariosTemp, setComentariosTemp] = useState<string[]>([]);
  const [mostrarDialogNovoGrupo, setMostrarDialogNovoGrupo] = useState(false);
  const [nomeNovoGrupo, setNomeNovoGrupo] = useState('');
  const [mostrarDialogNovoElemento, setMostrarDialogNovoElemento] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>('grupo-tws');
  const [novoElemento, setNovoElemento] = useState<Partial<ElementoCadastro>>({
    elemento: '',
    contato: '',
    clientes: '',
    status: '',
    telefone: '',
    email: '',
    procuracao: '',
    vencProcuracao: '',
    status1: '',
  });

  const elementosFiltradosPorGrupo = (grupoId: string) => {
    const grupo = grupos.find((g) => g.id === grupoId);
    if (!grupo) return [];
    let elementos = grupo.elementos;
    if (pesquisa) {
      elementos = elementos.filter(
        (e) =>
          e.elemento.toLowerCase().includes(pesquisa.toLowerCase()) ||
          e.contato.toLowerCase().includes(pesquisa.toLowerCase()) ||
          e.clientes.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }
    return elementos;
  };

  const getStatusClass = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'tws') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (statusLower === 'watts') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (statusLower === 'wts') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (statusLower === 'az135') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (statusLower === 'chaleur') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (statusLower === 'racer x') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (statusLower === 'aws') {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (statusLower === 'feito') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const renderBadge = (valor: string) => {
    if (!valor || valor === '-') return '-';
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusClass(valor)}`}>
        {valor}
      </span>
    );
  };


  const handleAdicionarGrupo = () => {
    if (!nomeNovoGrupo.trim()) {
      alert('Por favor, digite um nome para o grupo');
      return;
    }
    const novoId = `grupo-${Date.now()}`;
    const novoGrupo: Grupo = {
      id: novoId,
      nome: nomeNovoGrupo.trim(),
      elementos: [],
    };
    setGrupos((prev) => [...prev, novoGrupo]);
    setGruposExpandidos((prev) => new Set([...prev, novoId]));
    setNomeNovoGrupo('');
    setMostrarDialogNovoGrupo(false);
  };

  const handleAdicionarElemento = () => {
    if (!novoElemento.elemento?.trim()) {
      alert('Por favor, preencha o nome do elemento');
      return;
    }
    const novoId = `cad-${Date.now()}`;
    const elementoCompleto: ElementoCadastro = {
      id: novoId,
      grupoId: grupoSelecionado,
      elemento: novoElemento.elemento,
      contato: novoElemento.contato || '',
      clientes: novoElemento.clientes || '',
      status: novoElemento.status || '',
      telefone: novoElemento.telefone || '',
      email: novoElemento.email || '',
      procuracao: novoElemento.procuracao || '',
      vencProcuracao: novoElemento.vencProcuracao || '',
      status1: novoElemento.status1 || '',
    };
    setGrupos((prev) =>
      prev.map((g) =>
        g.id === grupoSelecionado
          ? { ...g, elementos: [...g.elementos, elementoCompleto] }
          : g
      )
    );
    setMostrarDialogNovoElemento(false);
    setNovoElemento({
      elemento: '',
      contato: '',
      clientes: '',
      status: '',
      telefone: '',
      email: '',
      procuracao: '',
      vencProcuracao: '',
      status1: '',
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setMostrarDialogNovoElemento(true)}
        >
          Criar elemento
        </Button>
        <Button 
          variant="outline"
          onClick={() => setMostrarDialogNovoGrupo(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar grupo
        </Button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">Pessoa</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtro
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Filtro por Grupo</DropdownMenuItem>
            <DropdownMenuItem>Filtro por Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordenar
        </Button>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Ocultar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Grid className="h-4 w-4 mr-2" />
              Agrupar por
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Grupo</DropdownMenuItem>
            <DropdownMenuItem>Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grupos */}
      {grupos.map((grupo) => {
        const elementosFiltrados = elementosFiltradosPorGrupo(grupo.id);
        const isExpandido = gruposExpandidos.has(grupo.id);
        
        return (
          <div key={grupo.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
            <div 
              className="p-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 flex items-center justify-between" 
              onClick={() => {
                setGruposExpandidos((prev) => {
                  const novo = new Set(prev);
                  if (novo.has(grupo.id)) {
                    novo.delete(grupo.id);
                  } else {
                    novo.add(grupo.id);
                  }
                  return novo;
                });
              }}
            >
              <h2 className="font-semibold text-slate-900">{grupo.nome}</h2>
              <span className="text-sm text-slate-600">{grupo.elementos.length} elemento(s)</span>
            </div>
            {isExpandido && elementosFiltrados.length > 0 && (
              <StandardTable
                columns={[
                  { id: 'elemento', label: 'Elemento', width: '120px', minWidth: '120px', editable: true },
                  { id: 'contato', label: 'CONTATO', width: '120px', minWidth: '120px', editable: true },
                  { id: 'clientes', label: 'CLIENTES', width: '120px', minWidth: '120px', editable: true },
                  { id: 'status', label: 'Status', width: '100px', minWidth: '100px', editable: true, render: (value: any) => renderBadge(value) },
                  { id: 'telefone', label: 'Telefone', width: '160px', minWidth: '160px', editable: true, render: (value: any) => (
                    <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden">
                      <span className="flex-shrink-0">🇧🇷</span>
                      <span className="truncate">{value}</span>
                    </div>
                  )},
                  { id: 'email', label: 'E-MAIL', width: '200px', minWidth: '200px', editable: true },
                  { id: 'procuracao', label: 'PROCURAÇÃO', width: '130px', minWidth: '130px', editable: true },
                  { id: 'vencProcuracao', label: 'VENC. PROCURAÇÃO', width: '160px', minWidth: '160px', editable: true },
                  { id: 'status1', label: 'Status 1', width: '100px', minWidth: '100px', editable: true, render: (value: any) => renderBadge(value) },
                  { id: 'pessoas', label: 'Pessoas', width: '100px', minWidth: '100px', editable: false, render: () => '-' },
                ] as StandardTableColumn<ElementoCadastro>[]}
                data={elementosFiltrados}
                onCellChange={(rowIndex: number, columnId: string, value: any) => {
                  const elemento = elementosFiltrados[rowIndex];
                  setGrupos((prev) =>
                    prev.map((g) =>
                      g.id === grupo.id
                        ? {
                            ...g,
                            elementos: g.elementos.map((e) =>
                              e.id === elemento.id ? { ...e, [columnId]: value } : e
                            ),
                          }
                        : g
                    )
                  );
                }}
                getCellValue={(row: ElementoCadastro, columnId: string) => {
                  switch (columnId) {
                    case 'elemento':
                      return row.elemento;
                    case 'contato':
                      return row.contato;
                    case 'clientes':
                      return row.clientes;
                    case 'status':
                      return row.status;
                    case 'telefone':
                      return row.telefone;
                    case 'email':
                      return row.email;
                    case 'procuracao':
                      return row.procuracao || '';
                    case 'vencProcuracao':
                      return row.vencProcuracao;
                    case 'status1':
                      return row.status1;
                    default:
                      return '';
                  }
                }}
                enableSelection={true}
                selectedRows={elementosSelecionadosPorGrupo[grupo.id] || new Set()}
                onSelectionChange={(selected) => {
                  setElementosSelecionadosPorGrupo((prev) => ({
                    ...prev,
                    [grupo.id]: selected,
                  }));
                }}
                onExport={(selectedData) => {
                  const colunasExport = [
                    { id: 'elemento', label: 'Elemento' },
                    { id: 'contato', label: 'CONTATO' },
                    { id: 'clientes', label: 'CLIENTES' },
                    { id: 'status', label: 'Status' },
                    { id: 'telefone', label: 'Telefone' },
                    { id: 'email', label: 'E-MAIL' },
                    { id: 'procuracao', label: 'PROCURAÇÃO' },
                    { id: 'vencProcuracao', label: 'VENC. PROCURAÇÃO' },
                    { id: 'status1', label: 'Status 1' },
                  ];
                  
                  exportToCSV(
                    selectedData,
                    colunasExport,
                    `clientes-${grupo.id}-${new Date().toISOString().split('T')[0]}.csv`,
                    (row: ElementoCadastro, columnId: string) => {
                      switch (columnId) {
                        case 'elemento':
                          return row.elemento;
                        case 'contato':
                          return row.contato;
                        case 'clientes':
                          return row.clientes;
                        case 'status':
                          return row.status;
                        case 'telefone':
                          return row.telefone;
                        case 'email':
                          return row.email;
                        case 'procuracao':
                          return row.procuracao || '';
                        case 'vencProcuracao':
                          return row.vencProcuracao;
                        case 'status1':
                          return row.status1;
                        default:
                          return '';
                      }
                    }
                  );
                }}
                getRowId={(row: ElementoCadastro) => row.id}
                favorites={favoritos}
                onToggleFavorite={(rowId: string) => {
                  setFavoritos((prev) => {
                    const novo = new Set(prev);
                    if (novo.has(rowId)) {
                      novo.delete(rowId);
                    } else {
                      novo.add(rowId);
                    }
                    return novo;
                  });
                }}
                comments={comentarios}
                onOpenCommentDialog={(rowId: string) => {
                  setElementoComentarioAberto(rowId);
                  setComentariosTemp(comentarios[rowId] || []);
                  setComentarioAtual('');
                }}
                defaultFirstColumnFixed={true}
                firstColumnWidth="120px"
              />
            )}
            {isExpandido && elementosFiltrados.length === 0 && (
              <div className="text-center text-slate-500 py-8 bg-white">
                {pesquisa ? 'Nenhum elemento encontrado' : 'Nenhum elemento cadastrado'}
              </div>
            )}
          </div>
        );
      })}

      {/* Dialog de comentários */}
      <Dialog
        open={!!elementoComentarioAberto}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setElementoComentarioAberto(null);
            setComentarioAtual('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentário da linha</DialogTitle>
            <DialogDescription>
              Adicione observações específicas para este elemento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {elementoComentarioAberto &&
              comentariosTemp &&
              comentariosTemp.length > 0 && (
                <div className="space-y-1 mb-2">
                  {comentariosTemp.map((texto, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                    >
                      <span className="flex-1 break-words">{texto}</span>
                      <button
                        type="button"
                        className="text-[10px] text-slate-400 hover:text-red-500"
                        title="Excluir comentário"
                        onClick={() => {
                          setComentariosTemp((lista) =>
                            lista.filter((_, i) => i !== idx)
                          );
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            <label className="text-xs font-medium text-slate-700">
              Comentário
            </label>
            <textarea
              className="w-full min-h-[80px] rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={comentarioAtual}
              onChange={(e) => setComentarioAtual(e.target.value)}
              placeholder="Escreva um comentário para esta linha..."
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setElementoComentarioAberto(null);
                setComentariosTemp([]);
                setComentarioAtual('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!elementoComentarioAberto) return;

                const texto = comentarioAtual.trim();
                const listaBase = comentariosTemp || [];
                const listaFinal = texto ? [...listaBase, texto] : [...listaBase];

                setComentarios((prev) => ({
                  ...prev,
                  [elementoComentarioAberto]: listaFinal,
                }));

                setComentarioAtual('');
                setComentariosTemp([]);
                setElementoComentarioAberto(null);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de criar novo grupo */}
      <Dialog open={mostrarDialogNovoGrupo} onOpenChange={setMostrarDialogNovoGrupo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
            <DialogDescription>
              Digite o nome do novo grupo de clientes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Grupo *</label>
              <Input
                value={nomeNovoGrupo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNomeNovoGrupo(e.target.value)}
                placeholder="Ex: Grupo ABC, Clientes VIP, etc."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && nomeNovoGrupo.trim()) {
                    handleAdicionarGrupo();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarDialogNovoGrupo(false);
                setNomeNovoGrupo('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarGrupo}
              disabled={!nomeNovoGrupo.trim()}
            >
              Criar Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de criar novo elemento */}
      <Dialog open={mostrarDialogNovoElemento} onOpenChange={setMostrarDialogNovoElemento}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Elemento</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo elemento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Grupo *</label>
                <select
                  value={grupoSelecionado}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGrupoSelecionado(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Elemento *</label>
                <Input
                  value={novoElemento.elemento || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, elemento: e.target.value })}
                  placeholder="Nome do elemento"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">CONTATO</label>
                <Input
                  value={novoElemento.contato || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, contato: e.target.value })}
                  placeholder="Contato"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CLIENTES</label>
                <Input
                  value={novoElemento.clientes || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, clientes: e.target.value })}
                  placeholder="Clientes"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Input
                  value={novoElemento.status || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, status: e.target.value })}
                  placeholder="Status"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  value={novoElemento.telefone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, telefone: e.target.value })}
                  placeholder="Telefone"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">E-MAIL</label>
                <Input
                  value={novoElemento.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, email: e.target.value })}
                  placeholder="E-mail"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PROCURAÇÃO</label>
                <Input
                  value={novoElemento.procuracao || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, procuracao: e.target.value })}
                  placeholder="Procuração"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">VENC. PROCURAÇÃO</label>
                <Input
                  value={novoElemento.vencProcuracao || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, vencProcuracao: e.target.value })}
                  placeholder="Venc. Procuração"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status 1</label>
                <Input
                  value={novoElemento.status1 || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoElemento({ ...novoElemento, status1: e.target.value })}
                  placeholder="Status 1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarDialogNovoElemento(false);
                setNovoElemento({
                  elemento: '',
                  contato: '',
                  clientes: '',
                  status: '',
                  telefone: '',
                  email: '',
                  procuracao: '',
                  vencProcuracao: '',
                  status1: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarElemento}
            >
              Criar Elemento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

