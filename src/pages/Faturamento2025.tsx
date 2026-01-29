import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Check, X, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { StandardTable, StandardTableColumn, TagOption } from '@/components/ui/standard-table';
import { exportToCSV } from '@/lib/export-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface ProjetoFaturamento {
  id: string;
  nome: string;
  cliente: string;
  nRef: string;
  exportador: string;
  agenteCarga: string;
  eta: string;
  canal: string;
  fatura: string;
  rebate: string;
  rsCom: string;
  cambio: string;
  [key: string]: any; // Para permitir colunas dinâmicas
}

interface ColunaDinamica {
  id: string;
  label: string;
  width: string;
  useTags?: boolean;
}

interface CategoriaFaturamento {
  id: string;
  nome: string;
  projetos: ProjetoFaturamento[];
}

const projetosMock: ProjetoFaturamento[] = [
  {
    id: 'fat-1',
    nome: 'MAPASEG IMPORTS (copy)',
    cliente: 'MAPASEG IM...',
    nRef: 'IM-1046-25',
    exportador: 'BAODING DIVERSOS',
    agenteCarga: 'Dare Shipping',
    eta: 'out 12, 2025',
    canal: 'verde',
    fatura: 'FATURAR',
    rebate: '',
    rsCom: '✓',
    cambio: 'Em and...',
  },
  {
    id: 'fat-2',
    nome: 'TURIN - COMPRE SEGURO 10',
    cliente: 'COMPRE SEG...',
    nRef: 'IM-1049-25',
    exportador: 'TRAMPOLIM 11',
    agenteCarga: 'PLUS CARGO',
    eta: 'out 28, 2025',
    canal: 'verde',
    fatura: 'FATURAR',
    rebate: '✓',
    rsCom: '✓',
    cambio: 'Fei',
  },
  {
    id: 'fat-3',
    nome: 'ILKASEG 5',
    cliente: 'ILKASEG',
    nRef: 'IM-1056-25',
    exportador: 'LIMITADORES',
    agenteCarga: 'CRAFT',
    eta: 'nov 9, 2025',
    canal: 'verde',
    fatura: 'FATURAR',
    rebate: '',
    rsCom: '✓',
    cambio: 'Em and...',
  },
];

const categoriasIniciais: CategoriaFaturamento[] = [
  {
    id: 'ha-faturar',
    nome: 'HÁ FATURAR - 2025',
    projetos: projetosMock,
  },
];

// Colunas base iniciais da tabela
const colunasBaseIniciais: StandardTableColumn<ProjetoFaturamento>[] = [
  { id: 'projeto', label: 'Projeto', width: '200px', editable: true },
  { id: 'cliente', label: 'CLIENTES', width: '150px', editable: true },
  { id: 'nRef', label: 'N/REF', width: '120px', editable: true },
  { id: 'exportador', label: 'Exportador', width: '180px', editable: true },
  { id: 'agenteCarga', label: 'Agente de carga', width: '150px', editable: true },
  { id: 'eta', label: 'ETA', width: '120px', editable: true },
  { id: 'canal', label: 'CANAL', width: '120px', editable: true, useTags: true },
  { id: 'fatura', label: 'FATURA', width: '120px', editable: true, useTags: true },
  { id: 'rebate', label: 'REBATE', width: '100px', editable: true },
  { id: 'rsCom', label: 'R$ CON...', width: '100px', editable: true },
  { id: 'cambio', label: 'Cambio', width: '120px', editable: true, useTags: true },
];

export function Faturamento2025() {
  const [colunasBase, setColunasBase] = useState<StandardTableColumn<ProjetoFaturamento>[]>(colunasBaseIniciais);
  const [categorias, setCategorias] = useState<CategoriaFaturamento[]>(categoriasIniciais);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set(['ha-faturar']));
  const [projetosSelecionadosPorCategoria, setProjetosSelecionadosPorCategoria] = useState<Record<string, Set<number>>>({});
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState<Record<string, string[]>>({});
  const [projetoComentarioAberto, setProjetoComentarioAberto] = useState<string | null>(null);
  const [comentarioAtual, setComentarioAtual] = useState('');
  const [comentariosTemp, setComentariosTemp] = useState<string[]>([]);
  const [mostrarDialogNovaCategoria, setMostrarDialogNovaCategoria] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [colunasDinamicas, setColunasDinamicas] = useState<ColunaDinamica[]>([]);
  const [mostrarDialogNovaColuna, setMostrarDialogNovaColuna] = useState(false);
  const [novaColunaLabel, setNovaColunaLabel] = useState('');
  const [mostrarDialogOcultar, setMostrarDialogOcultar] = useState(false);
  const [colunasOcultas, setColunasOcultas] = useState<Set<string>>(new Set());
  const [tagsByField, setTagsByField] = useState<Record<string, TagOption[]>>({
    canal: [
      { label: 'verde', valor: 'verde', cor: 'green' },
      { label: 'amarelo', valor: 'amarelo', cor: 'yellow' },
      { label: 'vermelho', valor: 'vermelho', cor: 'red' },
      { label: 'Sem registro', valor: 'Sem registro', cor: 'blue' },
    ],
    fatura: [
      { label: 'FATURAR', valor: 'FATURAR', cor: 'purple' },
      { label: 'Sem registro', valor: 'Sem registro', cor: 'blue' },
    ],
    cambio: [
      { label: 'Feito', valor: 'Feito', cor: 'green' },
      { label: 'Em andamento', valor: 'Em and...', cor: 'yellow' },
      { label: 'Sem registro', valor: 'Sem registro', cor: 'blue' },
    ],
  });

  const projetosFiltrados = (projetos: ProjetoFaturamento[]) => {
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
    const novaCategoria: CategoriaFaturamento = {
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
    if (valorLower === 'verde' || valorLower === 'feito' || valorLower === 'fei') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (valorLower === 'faturar') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (valorLower === 'em and...' || valorLower === 'em andamento') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (valorLower === 'dare shipping') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    if (valorLower === 'plus cargo') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (valorLower === 'craft') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (valorLower === 'fca') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (valorLower === 'handline') {
      return 'bg-pink-100 text-pink-800 border-pink-200';
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


  const handleAbrirComentario = (projetoId: string) => {
    setProjetoComentarioAberto(projetoId);
    setComentariosTemp(comentarios[projetoId] || []);
    setComentarioAtual('');
  };

  const handleToggleFavorite = (projetoId: string) => {
    setFavoritos((prev) => {
      const novo = new Set(prev);
      if (novo.has(projetoId)) {
        novo.delete(projetoId);
      } else {
        novo.add(projetoId);
      }
      return novo;
    });
  };

  const handleTagsChange = (fieldId: string, tags: TagOption[]) => {
    setTagsByField((prev) => ({
      ...prev,
      [fieldId]: tags,
    }));
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

  const handleHeaderChange = (columnId: string, newLabel: string) => {
    setColunasBase((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, label: newLabel } : col))
    );
    // Atualizar também nas colunas dinâmicas se for o caso
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

  const colunasCompletas = useMemo(() => {
    const colunas = [...colunasBase];
    // Adicionar tagOptions para colunas que usam tags
    colunas.forEach((col) => {
      if (col.useTags) {
        col.tagOptions = tagsByField[col.id] || [];
      }
    });
    // Adicionar render para colunas especiais
    colunas.forEach((col) => {
      if (col.id === 'agenteCarga') {
        col.render = (value: any) => renderBadge(value);
      } else if (col.id === 'rebate' || col.id === 'rsCom') {
        col.render = (value: any) => value && <Check className="h-4 w-4 text-green-600" />;
      }
    });
    // Adicionar colunas dinâmicas
    colunasDinamicas.forEach((colDin) => {
      const coluna: StandardTableColumn<ProjetoFaturamento> = {
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
  }, [colunasDinamicas, tagsByField, colunasOcultas]);

  const handleExportProjetos = (_categoriaId: string, selectedData: ProjetoFaturamento[]) => {
    const colunasExport = [
      { id: 'projeto', label: 'Projeto' },
      { id: 'cliente', label: 'CLIENTES' },
      { id: 'nRef', label: 'N/REF' },
      { id: 'exportador', label: 'Exportador' },
      { id: 'agenteCarga', label: 'Agente de carga' },
      { id: 'eta', label: 'ETA' },
      { id: 'canal', label: 'CANAL' },
      { id: 'fatura', label: 'FATURA' },
      { id: 'rebate', label: 'REBATE' },
      { id: 'rsCom', label: 'R$ CON...' },
      { id: 'cambio', label: 'Cambio' },
    ];
    
      exportToCSV(
      selectedData,
      colunasExport,
      `faturamento-2025-${new Date().toISOString().split('T')[0]}.csv`,
      (row: ProjetoFaturamento, columnId: string) => {
        switch (columnId) {
          case 'projeto':
            return row.nome;
          case 'cliente':
            return row.cliente;
          case 'nRef':
            return row.nRef;
          case 'exportador':
            return row.exportador;
          case 'agenteCarga':
            return row.agenteCarga;
          case 'eta':
            return row.eta;
          case 'canal':
            return row.canal;
          case 'fatura':
            return row.fatura;
          case 'rebate':
            return row.rebate ? 'Sim' : 'Não';
          case 'rsCom':
            return row.rsCom ? 'Sim' : 'Não';
          case 'cambio':
            return row.cambio;
          default:
            return '';
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Faturamento 2025</h1>

      <div className="flex items-center gap-3 flex-wrap">
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
                      getCellValue={(row: ProjetoFaturamento, columnId: string) => {
                        // Verificar se é uma coluna dinâmica
                        if (colunasDinamicas.some((col) => col.id === columnId)) {
                          return row[columnId] || '';
                        }
                        switch (columnId) {
                          case 'projeto':
                            return row.nome;
                          case 'cliente':
                            return row.cliente;
                          case 'nRef':
                            return row.nRef;
                          case 'exportador':
                            return row.exportador;
                          case 'agenteCarga':
                            return row.agenteCarga;
                          case 'eta':
                            return row.eta;
                          case 'canal':
                            return row.canal;
                          case 'fatura':
                            return row.fatura;
                          case 'rebate':
                            return row.rebate;
                          case 'rsCom':
                            return row.rsCom;
                          case 'cambio':
                            return row.cambio;
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
                      onExport={(selectedData: ProjetoFaturamento[]) => handleExportProjetos(categoria.id, selectedData)}
                      getRowId={(row: ProjetoFaturamento) => row.id}
                      favorites={favoritos}
                      onToggleFavorite={handleToggleFavorite}
                      comments={comentarios}
                      onOpenCommentDialog={handleAbrirComentario}
                      tagsByField={tagsByField}
                      onTagsChange={handleTagsChange}
                      onHeaderChange={handleHeaderChange}
                      editableHeaders={true}
                      onColumnTagsToggle={handleColumnTagsToggle}
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

      {/* Dialog de comentários por linha */}
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
              Adicione observações específicas para este projeto. Elas ficarão associadas a esta linha.
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
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                        }}
                        onKeyDown={() => {
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
                placeholder="Ex: HÁ FATURAR - 2025, PENDENTES, etc."
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
            {[...colunasBase, ...colunasDinamicas].map((col) => (
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

