import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, Plus, Eye, Grid, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { StandardTable, StandardTableColumn } from '@/components/ui/standard-table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  responsavel?: string;
  status: 'pendente' | 'em-andamento' | 'concluida';
  prioridade: 'baixa' | 'media' | 'alta';
  prazo?: string;
  categoria?: string;
}

const tarefasIniciais: Tarefa[] = [];

export function TarefasPendencias() {
  const [pesquisa, setPesquisa] = useState('');
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasIniciais);
  const [mostrarDialogNovaTarefa, setMostrarDialogNovaTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState<Partial<Tarefa>>({
    titulo: '',
    descricao: '',
    responsavel: '',
    status: 'pendente',
    prioridade: 'media',
    prazo: '',
    categoria: '',
  });
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState<Record<string, string[]>>({});
  const [tarefaComentarioAberto, setTarefaComentarioAberto] = useState<string | null>(null);
  const [comentarioAtual, setComentarioAtual] = useState('');
  const [, setComentariosTemp] = useState<string[]>([]);

  const tarefasFiltradas = useMemo(() => {
    let lista = tarefas;
    
    if (pesquisa) {
      lista = tarefas.filter(
        (t) =>
          t.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
          t.descricao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
          t.responsavel?.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }

    // Favoritos vão para o topo
    return [...lista].sort((a, b) => {
      const fa = favoritos.has(a.id);
      const fb = favoritos.has(b.id);
      if (fa === fb) return 0;
      return fa ? -1 : 1;
    });
  }, [tarefas, pesquisa, favoritos]);

  const handleCriarTarefa = () => {
    if (!novaTarefa.titulo?.trim()) {
      alert('Por favor, preencha o título da tarefa');
      return;
    }

    const novaTarefaCompleta: Tarefa = {
      id: `tarefa-${Date.now()}`,
      titulo: novaTarefa.titulo,
      descricao: novaTarefa.descricao || '',
      responsavel: novaTarefa.responsavel || '',
      status: novaTarefa.status || 'pendente',
      prioridade: novaTarefa.prioridade || 'media',
      prazo: novaTarefa.prazo || '',
      categoria: novaTarefa.categoria || '',
    };

    setTarefas((prev) => [...prev, novaTarefaCompleta]);
    setMostrarDialogNovaTarefa(false);
    setNovaTarefa({
      titulo: '',
      descricao: '',
      responsavel: '',
      status: 'pendente',
      prioridade: 'media',
      prazo: '',
      categoria: '',
    });
  };

  const toggleFavorito = (tarefaId: string) => {
    setFavoritos((prev) => {
      const novo = new Set(prev);
      if (novo.has(tarefaId)) {
        novo.delete(tarefaId);
      } else {
        novo.add(tarefaId);
      }
      return novo;
    });
  };

  const handleAdicionarComentario = (tarefaId: string) => {
    if (!comentarioAtual.trim()) return;

    setComentarios((prev) => {
      const comentariosExistentes = prev[tarefaId] || [];
      return {
        ...prev,
        [tarefaId]: [...comentariosExistentes, comentarioAtual],
      };
    });

    setComentariosTemp((prev) => [...prev, comentarioAtual]);
    setComentarioAtual('');
  };

  const handleRemoverComentario = (tarefaId: string, index: number) => {
    setComentarios((prev) => {
      const comentariosExistentes = prev[tarefaId] || [];
      const novosComentarios = comentariosExistentes.filter((_, i) => i !== index);
      return {
        ...prev,
        [tarefaId]: novosComentarios,
      };
    });
  };

  const colunas: StandardTableColumn<Tarefa>[] = [
    { id: 'titulo', label: 'Título', width: '250px', editable: true },
    { id: 'descricao', label: 'Descrição', width: '300px', editable: true },
    { id: 'responsavel', label: 'Responsável', width: '150px', editable: true },
    { id: 'status', label: 'Status', width: '150px', editable: true },
    { id: 'prioridade', label: 'Prioridade', width: '120px', editable: true },
    { id: 'prazo', label: 'Prazo', width: '120px', editable: true },
    { id: 'categoria', label: 'Categoria', width: '150px', editable: true },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em-andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pendente':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPrioridadeBadgeClass = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Tarefas - Pendencias</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setMostrarDialogNovaTarefa(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar tarefa
        </Button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={pesquisa}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPesquisa(e.target.value)}
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
            <DropdownMenuItem>Prioridade</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {tarefasFiltradas.length === 0 ? (
      <div className="border border-slate-200 rounded-lg bg-white p-8 text-center text-slate-500">
          {pesquisa ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa pendente'}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <StandardTable
            columns={colunas.map((col) => {
              const column: StandardTableColumn<Tarefa> = {
                ...col,
                render: (value: any) => {
                  if (col.id === 'status') {
                    return (
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(value || 'pendente')}`}>
                        {value === 'concluida' ? 'Concluída' : value === 'em-andamento' ? 'Em Andamento' : 'Pendente'}
                      </span>
                    );
                  }
                  if (col.id === 'prioridade') {
                    return (
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPrioridadeBadgeClass(value || 'media')}`}>
                        {value === 'alta' ? 'Alta' : value === 'media' ? 'Média' : 'Baixa'}
                      </span>
                    );
                  }
                  return value || '-';
                },
              };
              return column;
            })}
            data={tarefasFiltradas}
            getRowId={(row: Tarefa) => row.id}
            onCellChange={(rowIndex: number, columnId: string, value: any) => {
              const tarefa = tarefasFiltradas[rowIndex];
              setTarefas((prev) =>
                prev.map((t) =>
                  t.id === tarefa.id ? { ...t, [columnId]: value } : t
                )
              );
            }}
            getCellValue={(row: Tarefa, columnId: string) => {
              return row[columnId as keyof Tarefa] || '';
            }}
            enableSelection={true}
            selectedRows={new Set()}
            onSelectionChange={() => {}}
            favorites={favoritos}
            onToggleFavorite={toggleFavorito}
            comments={comentarios}
            onOpenCommentDialog={(rowId: string) => {
              setTarefaComentarioAberto(rowId);
              setComentariosTemp(comentarios[rowId] || []);
            }}
            editableHeaders={true}
            onHeaderChange={(_columnId: string, _newLabel: string) => {
              // Opcional: permitir editar cabeçalhos
            }}
          />
        </div>
      )}

      {/* Dialog de criar nova tarefa */}
      <Dialog open={mostrarDialogNovaTarefa} onOpenChange={setMostrarDialogNovaTarefa}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Tarefa</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova tarefa
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={novaTarefa.titulo || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
                placeholder="Título da tarefa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={novaTarefa.descricao || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                placeholder="Descrição da tarefa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={novaTarefa.responsavel || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaTarefa({ ...novaTarefa, responsavel: e.target.value })}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={novaTarefa.status || 'pendente'}
                  onValueChange={(value: string) => setNovaTarefa({ ...novaTarefa, status: value as Tarefa['status'] })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em-andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={novaTarefa.prioridade || 'media'}
                  onValueChange={(value: string) => setNovaTarefa({ ...novaTarefa, prioridade: value as Tarefa['prioridade'] })}
                >
                  <SelectTrigger id="prioridade">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={novaTarefa.prazo || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaTarefa({ ...novaTarefa, prazo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input
                id="categoria"
                value={novaTarefa.categoria || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaTarefa({ ...novaTarefa, categoria: e.target.value })}
                placeholder="Categoria da tarefa"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarDialogNovaTarefa(false);
                setNovaTarefa({
                  titulo: '',
                  descricao: '',
                  responsavel: '',
                  status: 'pendente',
                  prioridade: 'media',
                  prazo: '',
                  categoria: '',
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCriarTarefa}>
              Criar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de comentários */}
      <Dialog
        open={!!tarefaComentarioAberto}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setTarefaComentarioAberto(null);
            setComentarioAtual('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentários</DialogTitle>
            <DialogDescription>
              Adicione comentários sobre esta tarefa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Digite um comentário..."
                value={comentarioAtual}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComentarioAtual(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && comentarioAtual.trim() && tarefaComentarioAberto) {
                    handleAdicionarComentario(tarefaComentarioAberto);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (tarefaComentarioAberto) {
                    handleAdicionarComentario(tarefaComentarioAberto);
                  }
                }}
                disabled={!comentarioAtual.trim()}
              >
                Adicionar Comentário
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tarefaComentarioAberto && comentarios[tarefaComentarioAberto]?.map((comentario, index) => (
                <div key={index} className="flex items-start justify-between p-2 bg-slate-50 rounded">
                  <p className="text-sm text-slate-700 flex-1">{comentario}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (tarefaComentarioAberto) {
                        handleRemoverComentario(tarefaComentarioAberto, index);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {tarefaComentarioAberto && (!comentarios[tarefaComentarioAberto] || comentarios[tarefaComentarioAberto].length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">Nenhum comentário ainda</p>
              )}
            </div>
      </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTarefaComentarioAberto(null);
                setComentarioAtual('');
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

