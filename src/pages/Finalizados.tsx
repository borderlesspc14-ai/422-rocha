import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, X, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { StandardTable, StandardTableColumn, TagOption } from '@/components/ui/standard-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { exportToCSV } from '@/lib/export-utils';

interface ProjetoFinalizado {
  id: string;
  nome: string;
  nRef: string;
  cambio: string;
  exportador: string;
  agenteCarga: string;
  refAgCarga: string;
  eta: string;
  rebate: string;
  obs: string;
  draftBlAwb: string;
  [key: string]: any; // Para permitir colunas dinâmicas
}

interface ColunaDinamica {
  id: string;
  label: string;
  width: string;
  useTags?: boolean;
}

interface CategoriaFinalizado {
  id: string;
  nome: string;
  projetos: ProjetoFinalizado[];
}

const projetosMock: ProjetoFinalizado[] = [
  {
    id: 'fin-1',
    nome: 'ILKASEG',
    nRef: 'IM-0761/23',
    cambio: 'Feito',
    exportador: 'LIMITADOR',
    agenteCarga: 'Dare Shipping',
    refAgCarga: 'QT355-11',
    eta: 'jan 17, 2024',
    rebate: 'Sem registro',
    obs: 'AGUARD CHEGADA DA...',
    draftBlAwb: 'FEITO',
  },
  {
    id: 'fin-2',
    nome: 'GLOBALMAR',
    nRef: 'IM-0778/23',
    cambio: 'Feito',
    exportador: 'IONIZADOR',
    agenteCarga: 'FCA',
    refAgCarga: 'M6018-12/23',
    eta: 'jan 19, 2024',
    rebate: 'Sem registro',
    obs: 'AGUARD CHEGADA DA...',
    draftBlAwb: 'FEITO',
  },
  {
    id: 'fin-3',
    nome: 'Clica Mundo',
    nRef: 'IM-0790/23',
    cambio: 'Feito',
    exportador: 'CAMERAS',
    agenteCarga: 'FCA',
    refAgCarga: 'QT373-12',
    eta: 'jan 25, 2024',
    rebate: 'Sem registro',
    obs: 'AGUARD CHEGADA DA...',
    draftBlAwb: 'FEITO',
  },
];

const categoriasIniciais: CategoriaFinalizado[] = [
  {
    id: 'finalizados-2024',
    nome: 'Finalizados - 2024',
    projetos: projetosMock,
  },
];

export function Finalizados() {
  const [categorias, setCategorias] = useState<CategoriaFinalizado[]>(categoriasIniciais);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set(['finalizados-2024']));
  const [projetosSelecionadosPorCategoria, setProjetosSelecionadosPorCategoria] = useState<Record<string, Set<number>>>({});
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState<Record<string, string[]>>({});
  const [projetoComentarioAberto, setProjetoComentarioAberto] = useState<string | null>(null);
  const [comentarioAtual, setComentarioAtual] = useState('');
  const [comentariosTemp, setComentariosTemp] = useState<string[]>([]);
  const [mostrarDialogNovoProjeto, setMostrarDialogNovoProjeto] = useState(false);
  const [mostrarDialogNovaCategoria, setMostrarDialogNovaCategoria] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [colunasDinamicas, setColunasDinamicas] = useState<ColunaDinamica[]>([]);
  const [mostrarDialogNovaColuna, setMostrarDialogNovaColuna] = useState(false);
  const [novaColunaLabel, setNovaColunaLabel] = useState('');
  const [mostrarDialogOcultar, setMostrarDialogOcultar] = useState(false);
  const [colunasOcultas, setColunasOcultas] = useState<Set<string>>(new Set());
  const [tagsByField, setTagsByField] = useState<Record<string, TagOption[]>>({});
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('finalizados-2024');
  const [novoProjeto, setNovoProjeto] = useState<Partial<ProjetoFinalizado>>({
    nome: '',
    nRef: '',
    cambio: '',
    exportador: '',
    agenteCarga: '',
    refAgCarga: '',
    eta: '',
    rebate: '',
    obs: '',
    draftBlAwb: '',
  });

  const projetosFiltrados = (projetos: ProjetoFinalizado[]) => {
    return projetos;
  };

  const toggleCategoria = (categoriaId: string) => {
    setCategoriasExpandidas((prev) => {
      const novo = new Set(prev);
      if (novo.has(categoriaId)) {
        novo.delete(categoriaId);
      } else {
        novo.add(categoriaId);
      }
      return novo;
    });
  };

  const handleAdicionarCategoria = () => {
    if (!novaCategoriaNome.trim()) {
      alert('Por favor, digite um nome para a categoria');
      return;
    }
    const novaCategoria: CategoriaFinalizado = {
      id: `cat-${Date.now()}`,
      nome: novaCategoriaNome.trim(),
      projetos: [],
    };
    setCategorias((prev) => [...prev, novaCategoria]);
    setCategoriasExpandidas((prev) => new Set([...prev, novaCategoria.id]));
    setNovaCategoriaNome('');
    setMostrarDialogNovaCategoria(false);
  };

  const getBadgeClass = (valor: string) => {
    const valorLower = valor?.toLowerCase() || '';
    if (valorLower === 'feito' || valorLower === 'feito') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (valorLower === 'sem registro') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (valorLower === 'dare shipping') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (valorLower === 'fca' || valorLower === 'bless') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const renderBadge = (valor: string) => {
    if (!valor || valor === '-') return '-';
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${getBadgeClass(valor)}`}>
        {valor}
      </span>
    );
  };

  const handleAdicionarColuna = () => {
    if (!novaColunaLabel.trim()) {
      alert('Por favor, digite um nome para a coluna');
      return;
    }
    const novoId = `col-${Date.now()}`;
    const novaColuna: ColunaDinamica = {
      id: novoId,
      label: novaColunaLabel.trim(),
      width: '150px',
    };
    setColunasDinamicas((prev) => [...prev, novaColuna]);
    // Adicionar campo vazio em todos os projetos de todas as categorias
    setCategorias((prev) =>
      prev.map((cat) => ({
        ...cat,
        projetos: cat.projetos.map((p) => ({ ...p, [novoId]: '' })),
      }))
    );
    setNovaColunaLabel('');
    setMostrarDialogNovaColuna(false);
  };

  const [colunasBase, setColunasBase] = useState<StandardTableColumn<ProjetoFinalizado>[]>([
    { id: 'projeto', label: 'Projeto', width: '150px', editable: true },
    { id: 'nRef', label: 'N/REF', width: '120px', editable: true },
    { id: 'cambio', label: 'Cambio', width: '120px', editable: true, render: (value: any) => renderBadge(value) },
    { id: 'exportador', label: 'Exportador', width: '150px', editable: true },
    { id: 'agenteCarga', label: 'Agente de car...', width: '150px', editable: true, render: (value: any) => renderBadge(value) },
    { id: 'refAgCarga', label: 'REF. Ag Carga', width: '150px', editable: true },
    { id: 'eta', label: 'ETA', width: '120px', editable: true },
    { id: 'rebate', label: 'REBATE', width: '120px', editable: true, render: (value: any) => renderBadge(value) },
    { id: 'obs', label: 'OBS:', width: '200px', editable: true },
    { id: 'draftBlAwb', label: 'Draft BL/AWB', width: '140px', editable: true, render: (value: any) => renderBadge(value) },
  ]);

  const handleHeaderChange = (columnId: string, newLabel: string) => {
    setColunasBase((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, label: newLabel } : col))
    );
    setColunasDinamicas((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, label: newLabel } : col))
    );
  };

  const handleColumnTagsToggle = (columnId: string, useTags: boolean) => {
    // Atualizar colunas base
    setColunasBase((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, useTags } : col))
    );
    // Atualizar colunas dinâmicas
    setColunasDinamicas((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, useTags } : col))
    );
    // Se ativando etiquetas e não existir no tagsByField, criar vazio
    if (useTags && !tagsByField[columnId]) {
      setTagsByField((prev) => ({
        ...prev,
        [columnId]: [],
      }));
    }
  };

  const handleTagsChange = (fieldId: string, tags: TagOption[]) => {
    setTagsByField((prev) => ({
      ...prev,
      [fieldId]: tags,
    }));
  };

  const colunasCompletas = useMemo(() => {
    const colunas = [...colunasBase];
    // Adicionar tagOptions para colunas que usam tags
    colunas.forEach((col) => {
      if (col.useTags) {
        col.tagOptions = tagsByField[col.id] || [];
      }
    });
    // Adicionar colunas dinâmicas
    colunasDinamicas.forEach((colDin) => {
      const coluna: StandardTableColumn<ProjetoFinalizado> = {
        id: colDin.id,
        label: colDin.label,
        width: colDin.width,
        editable: true,
        useTags: colDin.useTags || false,
      };
      // Adicionar tagOptions se usar tags
      if (coluna.useTags) {
        coluna.tagOptions = tagsByField[colDin.id] || [];
      }
      colunas.push(coluna);
    });
    // Filtrar colunas ocultas
    return colunas.filter((col) => !colunasOcultas.has(col.id));
  }, [colunasBase, colunasDinamicas, colunasOcultas, tagsByField]);

  const handleExportProjetos = (_categoriaId: string, selectedData: ProjetoFinalizado[]) => {
    const colunasExport = [
      { id: 'projeto', label: 'Projeto' },
      { id: 'nRef', label: 'N/REF' },
      { id: 'cambio', label: 'Cambio' },
      { id: 'exportador', label: 'Exportador' },
      { id: 'agenteCarga', label: 'Agente de carga' },
      { id: 'refAgCarga', label: 'REF. Ag Carga' },
      { id: 'eta', label: 'ETA' },
      { id: 'rebate', label: 'REBATE' },
      { id: 'obs', label: 'OBS:' },
      { id: 'draftBlAwb', label: 'Draft BL/AWB' },
    ];
    
    exportToCSV(
      selectedData,
      colunasExport,
      `finalizados-${new Date().toISOString().split('T')[0]}.csv`,
      (row: ProjetoFinalizado, columnId: string) => {
        switch (columnId) {
          case 'projeto':
            return row.nome;
          case 'nRef':
            return row.nRef;
          case 'cambio':
            return row.cambio;
          case 'exportador':
            return row.exportador;
          case 'agenteCarga':
            return row.agenteCarga;
          case 'refAgCarga':
            return row.refAgCarga;
          case 'eta':
            return row.eta;
          case 'rebate':
            return row.rebate;
          case 'obs':
            return row.obs;
          case 'draftBlAwb':
            return row.draftBlAwb;
          default:
            return '';
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Finalizados</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setMostrarDialogNovoProjeto(true)}
        >
          Criar projeto
        </Button>
        <Button 
          variant="outline"
          onClick={() => setMostrarDialogNovaCategoria(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar categoria
            </Button>
        <Button 
          variant="outline"
          onClick={() => setMostrarDialogNovaColuna(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar coluna
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setMostrarDialogOcultar(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ocultar
        </Button>
      </div>

      {/* Categorias expansíveis */}
      <div className="space-y-2">
        {categorias.map((categoria) => {
          const projetos = projetosFiltrados(categoria.projetos);
          const isExpandida = categoriasExpandidas.has(categoria.id);
          const totalProjetos = categoria.projetos.length;

          return (
            <div key={categoria.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              {/* Cabeçalho da categoria */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleCategoria(categoria.id)}
              >
                <div className="flex items-center gap-2">
                  {isExpandida ? (
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  )}
                  <span className="font-semibold text-slate-900">{categoria.nome}</span>
                </div>
                <span className="text-sm text-slate-600">{totalProjetos} Projeto(s)</span>
              </div>

              {/* Tabela de projetos (quando expandida) */}
              {isExpandida && (
                <div className="border-t border-slate-200">
                  {projetos.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 bg-white">
                      Nenhum projeto cadastrado
                    </div>
                  ) : (
                    <StandardTable
                      columns={colunasCompletas}
                      data={projetos}
                      onCellChange={(rowIndex: number, columnId: string, value: any) => {
                        const projeto = projetos[rowIndex];
                        setCategorias((prev) =>
                          prev.map((cat) => ({
                            ...cat,
                            projetos: cat.projetos.map((p) => {
                              if (p.id !== projeto.id) return p;
                              // Mapear columnId para o campo correto no objeto
                              const update: any = {};
                              if (columnId === 'projeto') {
                                update.nome = value;
                              } else if (colunasDinamicas.some((col) => col.id === columnId)) {
                                // Colunas dinâmicas são salvas diretamente
                                update[columnId] = value;
                              } else {
                                // Outras colunas são salvas diretamente
                                update[columnId] = value;
                              }
                              return { ...p, ...update };
                            }),
                          }))
                        );
                      }}
                      getCellValue={(row: ProjetoFinalizado, columnId: string) => {
                        // Verificar se é uma coluna dinâmica
                        if (colunasDinamicas.some((col) => col.id === columnId)) {
                          return row[columnId] || '';
                        }
                        switch (columnId) {
                          case 'projeto':
                            return row.nome;
                          case 'nRef':
                            return row.nRef;
                          case 'cambio':
                            return row.cambio;
                          case 'exportador':
                            return row.exportador;
                          case 'agenteCarga':
                            return row.agenteCarga;
                          case 'refAgCarga':
                            return row.refAgCarga;
                          case 'eta':
                            return row.eta;
                          case 'rebate':
                            return row.rebate;
                          case 'obs':
                            return row.obs;
                          case 'draftBlAwb':
                            return row.draftBlAwb;
                          default:
                            return row[columnId] || '';
                        }
                      }}
                      enableSelection={true}
                      selectedRows={projetosSelecionadosPorCategoria[categoria.id] || new Set()}
                      onSelectionChange={(selected: Set<number>) => {
                        setProjetosSelecionadosPorCategoria((prev) => ({
                          ...prev,
                          [categoria.id]: selected,
                        }));
                      }}
                      onExport={(selectedData: ProjetoFinalizado[]) => handleExportProjetos(categoria.id, selectedData)}
                      getRowId={(row: ProjetoFinalizado) => row.id}
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
                        setProjetoComentarioAberto(rowId);
                        setComentariosTemp(comentarios[rowId] || []);
                        setComentarioAtual('');
                      }}
                      onHeaderChange={handleHeaderChange}
                      editableHeaders={true}
                      onColumnTagsToggle={handleColumnTagsToggle}
                      tagsByField={tagsByField}
                      onTagsChange={handleTagsChange}
                      defaultFirstColumnFixed={true}
                      firstColumnWidth="120px"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog de comentários */}
      <Dialog
        open={!!projetoComentarioAberto}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setProjetoComentarioAberto(null);
            setComentarioAtual('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comentário da linha</DialogTitle>
            <DialogDescription>
              Adicione observações específicas para este projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {projetoComentarioAberto &&
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
                setProjetoComentarioAberto(null);
                setComentariosTemp([]);
                setComentarioAtual('');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!projetoComentarioAberto) return;

                const texto = comentarioAtual.trim();
                const listaBase = comentariosTemp || [];
                const listaFinal = texto ? [...listaBase, texto] : [...listaBase];

                setComentarios((prev) => ({
                  ...prev,
                  [projetoComentarioAberto]: listaFinal,
                }));

                setComentarioAtual('');
                setComentariosTemp([]);
                setProjetoComentarioAberto(null);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de criar nova categoria */}
      <Dialog open={mostrarDialogNovaCategoria} onOpenChange={setMostrarDialogNovaCategoria}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Categoria</DialogTitle>
            <DialogDescription>
              Digite o nome da nova categoria
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Categoria *</label>
              <Input
                value={novaCategoriaNome}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaCategoriaNome(e.target.value)}
                placeholder="Ex: Finalizados - 2024, Pendentes, etc."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && novaCategoriaNome.trim()) {
                    handleAdicionarCategoria();
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
                setMostrarDialogNovaCategoria(false);
                setNovaCategoriaNome('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarCategoria}
              disabled={!novaCategoriaNome.trim()}
            >
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de criar novo projeto */}
      <Dialog open={mostrarDialogNovoProjeto} onOpenChange={setMostrarDialogNovoProjeto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Projeto</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo projeto
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria *</label>
              <select
                value={categoriaSelecionada}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoriaSelecionada(e.target.value)}
                className="w-full h-10 px-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Projeto *</label>
                <Input
                  value={novoProjeto.nome || ''}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, nome: e.target.value })}
                  placeholder="Nome do projeto"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">N/REF</label>
                <Input
                  value={novoProjeto.nRef || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, nRef: e.target.value })}
                  placeholder="N/REF"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cambio</label>
                <Input
                  value={novoProjeto.cambio || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, cambio: e.target.value })}
                  placeholder="Cambio"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exportador</label>
                <Input
                  value={novoProjeto.exportador || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, exportador: e.target.value })}
                  placeholder="Exportador"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agente de carga</label>
                <Input
                  value={novoProjeto.agenteCarga || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, agenteCarga: e.target.value })}
                  placeholder="Agente de carga"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">REF. Ag Carga</label>
                <Input
                  value={novoProjeto.refAgCarga || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, refAgCarga: e.target.value })}
                  placeholder="REF. Ag Carga"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ETA</label>
                <Input
                  value={novoProjeto.eta || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, eta: e.target.value })}
                  placeholder="ETA"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">REBATE</label>
                <Input
                  value={novoProjeto.rebate || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, rebate: e.target.value })}
                  placeholder="REBATE"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">OBS:</label>
                <Input
                  value={novoProjeto.obs || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, obs: e.target.value })}
                  placeholder="Observações"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Draft BL/AWB</label>
                <Input
                  value={novoProjeto.draftBlAwb || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovoProjeto({ ...novoProjeto, draftBlAwb: e.target.value })}
                  placeholder="Draft BL/AWB"
                />
              </div>
            </div>
            {/* Colunas dinâmicas */}
            {colunasDinamicas.length > 0 && (
              <>
                <div className="border-t pt-4 mt-2">
                  <h3 className="text-sm font-semibold mb-3">Colunas Adicionais</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {colunasDinamicas.map((col) => (
                      <div key={col.id} className="space-y-2">
                        <label className="text-sm font-medium">{col.label}</label>
                        <Input
                          value={novoProjeto[col.id] || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNovoProjeto({ ...novoProjeto, [col.id]: e.target.value })
                          }
                          placeholder={col.label}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
      </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarDialogNovoProjeto(false);
                const novoProjetoReset: any = {
                  nome: '',
                  nRef: '',
                  cambio: '',
                  exportador: '',
                  agenteCarga: '',
                  refAgCarga: '',
                  eta: '',
                  rebate: '',
                  obs: '',
                  draftBlAwb: '',
                };
                colunasDinamicas.forEach((col) => {
                  novoProjetoReset[col.id] = '';
                });
                setNovoProjeto(novoProjetoReset);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!novoProjeto.nome?.trim()) {
                  alert('Por favor, preencha o nome do projeto');
                  return;
                }
                const novoId = `fin-${Date.now()}`;
                const projetoCompleto: ProjetoFinalizado = {
                  id: novoId,
                  nome: novoProjeto.nome,
                  nRef: novoProjeto.nRef || '',
                  cambio: novoProjeto.cambio || '',
                  exportador: novoProjeto.exportador || '',
                  agenteCarga: novoProjeto.agenteCarga || '',
                  refAgCarga: novoProjeto.refAgCarga || '',
                  eta: novoProjeto.eta || '',
                  rebate: novoProjeto.rebate || '',
                  obs: novoProjeto.obs || '',
                  draftBlAwb: novoProjeto.draftBlAwb || '',
                };
                // Adicionar valores das colunas dinâmicas
                colunasDinamicas.forEach((col) => {
                  (projetoCompleto as any)[col.id] = novoProjeto[col.id] || '';
                });
                // Adicionar projeto à categoria selecionada
                setCategorias((prev) =>
                  prev.map((cat) =>
                    cat.id === categoriaSelecionada
                      ? { ...cat, projetos: [...cat.projetos, projetoCompleto] }
                      : cat
                  )
                );
                setMostrarDialogNovoProjeto(false);
                const novoProjetoReset: any = {
                  nome: '',
                  nRef: '',
                  cambio: '',
                  exportador: '',
                  agenteCarga: '',
                  refAgCarga: '',
                  eta: '',
                  rebate: '',
                  obs: '',
                  draftBlAwb: '',
                };
                colunasDinamicas.forEach((col) => {
                  novoProjetoReset[col.id] = '';
                });
                setNovoProjeto(novoProjetoReset);
              }}
            >
              Criar Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de ocultar colunas */}
      <Dialog open={mostrarDialogOcultar} onOpenChange={setMostrarDialogOcultar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ocultar Colunas</DialogTitle>
            <DialogDescription>
              Selecione as colunas que deseja ocultar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            {[
              { id: 'projeto', label: 'Projeto' },
              { id: 'nRef', label: 'N/REF' },
              { id: 'cambio', label: 'Cambio' },
              { id: 'exportador', label: 'Exportador' },
              { id: 'agenteCarga', label: 'Agente de car...' },
              { id: 'refAgCarga', label: 'REF. Ag Carga' },
              { id: 'eta', label: 'ETA' },
              { id: 'rebate', label: 'REBATE' },
              { id: 'obs', label: 'OBS:' },
              { id: 'draftBlAwb', label: 'Draft BL/AWB' },
              ...colunasDinamicas,
            ].map((col) => (
              <div key={col.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`ocultar-${col.id}`}
                  checked={colunasOcultas.has(col.id)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setColunasOcultas((prev) => {
                      const novo = new Set(prev);
                      if (e.target.checked) {
                        novo.add(col.id);
                      } else {
                        novo.delete(col.id);
                      }
                      return novo;
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor={`ocultar-${col.id}`} className="text-sm font-medium cursor-pointer">
                  {col.label}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarDialogOcultar(false);
              }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de adicionar nova coluna */}
      <Dialog open={mostrarDialogNovaColuna} onOpenChange={setMostrarDialogNovaColuna}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Coluna</DialogTitle>
            <DialogDescription>
              Digite o nome da nova coluna que deseja adicionar à tabela
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Coluna *</label>
              <Input
                value={novaColunaLabel}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNovaColunaLabel(e.target.value)}
                placeholder="Ex: Observações, Status, etc."
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && novaColunaLabel.trim()) {
                    handleAdicionarColuna();
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
                setMostrarDialogNovaColuna(false);
                setNovaColunaLabel('');
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAdicionarColuna}
              disabled={!novaColunaLabel.trim()}
            >
              Adicionar Coluna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

