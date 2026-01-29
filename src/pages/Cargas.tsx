import { useState, useEffect, useMemo } from 'react';
import { CategoriaCarga, Projeto, TipoCarga } from '@/types/comex';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StandardTable, StandardTableColumn, TagOption } from '@/components/ui/standard-table';
import { exportToCSV } from '@/lib/export-utils';
import {
  Plus,
  Eye,
  X,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface CargasProps {
  processos: any[];
  clientes: any[];
  onProcessosChange: (processos: any[]) => void;
}

// Dados mock organizados por categoria
const categoriasMock: CategoriaCarga[] = [
  {
    id: 'fcl',
    nome: 'FCL - Container',
    tipo: 'FCL',
    projetos: [
      {
        id: 'fcl-1',
        nome: 'Nightech 5',
        categoriaId: 'fcl',
        tipoCarga: 'CARGO',
        refAgCarga: 'MR0398',
        eta: 'dez 17, 2025',
        namo: 'HMM IVY',
        obs: 'AGUARD CHEGADA DA...',
        cambioPag: 'Feito',
        draftBlAwb: 'FEITO',
        ctnTerm: 'Done',
        canal: 'verde',
        fatura: 'Sem registro',
        rsCom: '',
        prioridade: 1,
        concluido: false,
      },
      {
        id: 'fcl-2',
        nome: 'M.A.E. 5',
        categoriaId: 'fcl',
        tipoCarga: 'CARGO',
        refAgCarga: 'IM-1075-25',
        eta: 'jan 23',
        namo: 'HMM CLOVER',
        obs: 'AGUARD CHEGADA DA...',
        cambioPag: 'Em andamen...',
        draftBlAwb: 'FEITO',
        ctnTerm: 'Done',
        canal: 'verde',
        fatura: 'Sem registro',
        rsCom: '',
        prioridade: 2,
        concluido: false,
      },
    ],
  },
  {
    id: 'lcl',
    nome: 'LCL - Carga Solta',
    tipo: 'LCL',
    projetos: [
      {
        id: 'lcl-1',
        nome: 'AWS 25',
        categoriaId: 'lcl',
        tipoCarga: 'CA',
        refAgCarga: 'M5833-11/25',
        eta: 'jan 13',
        namo: 'ONE SYNERGY',
        obs: 'AGUARD CHEGADA DA...',
        cambioPag: 'Feito',
        draftBlAwb: 'FEITO',
        ctnTerm: 'Done',
        canal: 'verde',
        fatura: 'Sem registro',
        rsCom: '',
        prioridade: 1,
        concluido: false,
      },
      {
        id: 'lcl-2',
        nome: 'WATTS 84 5',
        categoriaId: 'lcl',
        tipoCarga: 'CA',
        refAgCarga: 'M5854-11/25',
        eta: 'jan 15',
        namo: 'HMM HYUNDAI FAITH',
        obs: 'AGUARD CHEGADA DA...',
        cambioPag: 'Feito',
        draftBlAwb: 'FEITO',
        ctnTerm: 'Done',
        canal: 'verde',
        fatura: 'Sem registro',
        rsCom: '',
        prioridade: 1,
        concluido: true,
      },
      {
        id: 'lcl-3',
        nome: 'TWS 149',
        categoriaId: 'lcl',
        tipoCarga: 'CARGO',
        refAgCarga: '25-31508',
        eta: 'fev 3',
        namo: 'MOL EARNEST',
        obs: 'AGUARD CHEGADA DA...',
        cambioPag: 'Feito',
        draftBlAwb: 'FEITO',
        ctnTerm: 'sem registro',
        canal: 'Sem registro',
        fatura: 'Sem registro',
        rsCom: '',
        prioridade: 2,
        concluido: false,
      },
    ],
  },
  {
    id: 'aereo',
    nome: 'Aereo',
    tipo: 'Aereo',
    projetos: [
      {
        id: 'aereo-1',
        nome: 'AEREO PROJ 1',
        categoriaId: 'aereo',
        tipoCarga: 'CARGO',
        refAgCarga: 'AER-001-01/06',
        eta: 'fev 15',
        namo: 'LATAM',
        obs: 'Em trânsito',
        cambioPag: 'Pendente',
        draftBlAwb: 'FEITO',
        ctnTerm: 'Done',
        canal: 'amarelo',
        fatura: 'FAT-123',
        rsCom: 'RS001',
        prioridade: 2,
        concluido: false,
      },
    ],
  },
];

// Colunas base da tabela
const colunasBaseIniciais: StandardTableColumn<Projeto>[] = [
  { id: 'projeto', label: 'Projeto', width: '200px', editable: true },
  { id: 'tipoCarga', label: 'de carga', width: '120px', editable: true },
  { id: 'refAgCarga', label: 'REF. Ag Carga', width: '150px', editable: true },
  { id: 'eta', label: 'ETA', width: '120px', editable: true },
  { id: 'navio', label: 'NAVIO', width: '180px', editable: true },
  { id: 'obs', label: 'OBS:', width: '200px', editable: true },
  { id: 'cambioPag', label: 'Cambio / Pag', width: '140px', editable: true, useTags: true },
  { id: 'draftBlAwb', label: 'Draft BL/AWB', width: '140px', editable: true, useTags: true },
  { id: 'ctnTerm', label: 'CTN Term', width: '120px', editable: true, useTags: true },
  { id: 'canal', label: 'CANAL', width: '120px', editable: true, useTags: true },
  { id: 'fatura', label: 'FATURA', width: '150px', editable: true },
  { id: 'rsCom', label: 'R$ COM', width: '120px', editable: true },
];

interface ColunaDinamica {
  id: string;
  label: string;
  width: string;
  useTags?: boolean;
}

export function Cargas({
  processos: _processos,
  clientes: _clientes,
  onProcessosChange: _onProcessosChange,
}: CargasProps) {
  const [colunasBase, setColunasBase] = useState(colunasBaseIniciais);
  const [categorias, setCategorias] = useState<CategoriaCarga[]>(categoriasMock);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set(['fcl', 'lcl']));
  const [projetosSelecionadosPorCategoria, setProjetosSelecionadosPorCategoria] = useState<Record<string, Set<number>>>({});
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState<Record<string, string[]>>({});
  const [projetoComentarioAberto, setProjetoComentarioAberto] = useState<string | null>(null);
  const [comentarioAtual, setComentarioAtual] = useState('');
  const [comentariosTemp, setComentariosTemp] = useState<string[]>([]);
  // categoriaSelecionada removido - não utilizado
  const [colunasDinamicas, setColunasDinamicas] = useState<ColunaDinamica[]>([]);
  const [mostrarDialogNovaColuna, setMostrarDialogNovaColuna] = useState(false);
  const [novaColunaLabel, setNovaColunaLabel] = useState('');
  const [mostrarDialogNovaCategoria, setMostrarDialogNovaCategoria] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [mostrarDialogOcultar, setMostrarDialogOcultar] = useState(false);
  const [colunasOcultas, setColunasOcultas] = useState<Set<string>>(new Set());
  
  // Estado para gerenciar etiquetas editáveis por campo
  const [etiquetasPorCampo, setEtiquetasPorCampo] = useState<Record<string, TagOption[]>>({
    cambioPag: [
      { label: 'Working on it', valor: 'Em andamen...', cor: 'yellow' },
      { label: 'Done', valor: 'Feito', cor: 'green' },
      { label: 'Stuck', valor: 'Stuck', cor: 'red' },
      { label: 'sem registro', valor: 'Sem registro', cor: 'blue' },
    ],
    draftBlAwb: [
      { label: 'Done', valor: 'FEITO', cor: 'green' },
      { label: 'sem registro', valor: 'Sem registro', cor: 'blue' },
    ],
    ctnTerm: [
      { label: 'Working on it', valor: 'Em andamen...', cor: 'yellow' },
      { label: 'Done', valor: 'Done', cor: 'green' },
      { label: 'sem registro', valor: 'Sem registro', cor: 'blue' },
    ],
    canal: [
      { label: 'amarelo', valor: 'amarelo', cor: 'yellow' },
      { label: 'verde', valor: 'verde', cor: 'green' },
      { label: 'vermelho', valor: 'vermelho', cor: 'red' },
      { label: 'Sem registro', valor: 'Sem registro', cor: 'blue' },
      { label: 'cinza', valor: 'cinza', cor: 'gray' },
    ],
  });
  

  useEffect(() => {
    (window as any).openNewCargaModal = () => {
      console.log('Abrir modal de nova carga');
    };
    return () => {
      delete (window as any).openNewCargaModal;
    };
  }, []);

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
    const novaCategoria: CategoriaCarga = {
      id: `cat-${Date.now()}`,
      nome: novaCategoriaNome.trim(),
      tipo: 'FCL' as TipoCarga,
      projetos: [],
    };
    setCategorias((prev) => [...prev, novaCategoria]);
    setCategoriasExpandidas((prev) => new Set([...prev, novaCategoria.id]));
    setNovaCategoriaNome('');
    setMostrarDialogNovaCategoria(false);
  };

  const handleExportProjetos = (categoriaId: string, selectedData: Projeto[]) => {
    const colunasCompletas = [...colunasBase, ...colunasDinamicas].filter((col) => !colunasOcultas.has(col.id));
    const colunasExport = colunasCompletas.map((col: StandardTableColumn<Projeto>) => ({
      id: col.id,
      label: col.label,
    }));
    
    exportToCSV(
      selectedData,
      colunasExport,
      `cargas-${categoriaId}-${new Date().toISOString().split('T')[0]}.csv`,
      (row: Projeto, columnId: string) => {
        switch (columnId) {
          case 'projeto':
            return row.nome;
          case 'tipoCarga':
            return row.tipoCarga || '';
          case 'refAgCarga':
            return row.refAgCarga || '';
          case 'eta':
            return row.eta || '';
          case 'navio':
            return row.namo || '';
          case 'obs':
            return row.obs || '';
          case 'cambioPag':
            return row.cambioPag || '';
          case 'draftBlAwb':
            return row.draftBlAwb || '';
          case 'ctnTerm':
            return row.ctnTerm || '';
          case 'canal':
            return row.canal || '';
          case 'fatura':
            return row.fatura || '';
          case 'rsCom':
            return row.rsCom || '';
          default:
            return '';
        }
      }
    );
  };

  const getCorEtiqueta = (valor: string, campo?: 'cambioPag' | 'draftBlAwb' | 'ctnTerm' | 'canal'): string => {
    if (campo && valor) {
      const etiquetas = etiquetasPorCampo[campo] || [];
      // Busca exata primeiro
      let etiqueta = etiquetas.find(e => e.valor === valor);
      // Se não encontrar, busca case-insensitive
      if (!etiqueta) {
        etiqueta = etiquetas.find(e => e.valor.toLowerCase() === valor.toLowerCase());
      }
      // Se ainda não encontrar, busca por trim
      if (!etiqueta) {
        etiqueta = etiquetas.find(e => e.valor.trim() === valor.trim());
      }
      if (etiqueta && etiqueta.cor) {
        return etiqueta.cor;
      }
    }
    
    // Fallback para valores conhecidos
    const valorLower = valor?.toLowerCase().trim() || '';
    if (valorLower === 'feito' || valorLower === 'done' || valorLower === 'verde') {
      return 'green';
    }
    if (valorLower === 'em andamen...' || valorLower === 'em andamento' || valorLower === 'pendente' || valorLower === 'amarelo') {
      return 'yellow';
    }
    if (valorLower === 'sem registro' || valorLower === 'sem regist') {
      return 'blue';
    }
    if (valorLower === 'vermelho') {
      return 'red';
    }
    if (valorLower === 'cinza') {
      return 'gray';
    }
    return 'slate';
  };

  const getBadgeClassByCor = (cor: string): string => {
    switch (cor) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getBadgeClass = (valor: string, campo?: 'cambioPag' | 'draftBlAwb' | 'ctnTerm' | 'canal') => {
    const cor = getCorEtiqueta(valor, campo);
    return getBadgeClassByCor(cor);
  };

  const projetosFiltrados = (projetos: Projeto[]) => {
    let lista = projetos;

    // favoritos vão para o topo
    let ordenada = [...lista].sort((a, b) => {
      const fa = favoritos.has(a.id);
      const fb = favoritos.has(b.id);
      if (fa === fb) return 0;
      return fa ? -1 : 1;
    });

    return ordenada;
  };

  const renderBadge = (valor: string) => {
    if (!valor || valor === '-') return '-';
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${getBadgeClass(valor)}`}>
        {valor}
      </span>
    );
  };



  const toggleFavorito = (projetoId: string) => {
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

  const handleAbrirComentario = (projetoId: string) => {
    setProjetoComentarioAberto(projetoId);
    setComentariosTemp(comentarios[projetoId] || []);
    setComentarioAtual('');
  };

  const handleTagsChange = (fieldId: string, tags: TagOption[]) => {
    setEtiquetasPorCampo((prev) => ({
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
        projetos: cat.projetos.map((p: Projeto) => ({ ...p, [novoId]: '' })),
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
    // Se ativando etiquetas e não existir no etiquetasPorCampo, criar vazio
    if (useTags && !etiquetasPorCampo[columnId]) {
      setEtiquetasPorCampo((prev) => ({
        ...prev,
        [columnId]: [],
      }));
    }
  };

  const colunasCompletas = useMemo(() => {
    const colunas = [...colunasBase].map((col) => ({
      ...col,
      width: col.width || '150px',
      minWidth: col.width || '150px',
    }));
    // Adicionar tagOptions para colunas que usam tags
    // IMPORTANTE: Sempre definir tagOptions para colunas com useTags, mesmo que vazio
    colunas.forEach((col) => {
      if (col.useTags) {
        // Garantir que tagOptions está definido, usando etiquetasPorCampo como fonte
        col.tagOptions = (col.id in etiquetasPorCampo) 
          ? etiquetasPorCampo[col.id] 
          : (col.tagOptions || []);
      }
    });
    // Adicionar colunas dinâmicas
    colunasDinamicas.forEach((colDin) => {
      const coluna: StandardTableColumn<Projeto> = {
        id: colDin.id,
        label: colDin.label,
        width: colDin.width || '150px',
        minWidth: colDin.width || '150px',
        editable: true,
        useTags: colDin.useTags || false,
      };
      // Adicionar tagOptions se usar tags
      if (coluna.useTags) {
        coluna.tagOptions = etiquetasPorCampo[colDin.id] || [];
      }
      colunas.push({
        ...coluna,
        width: coluna.width || '150px',
        minWidth: coluna.minWidth || coluna.width || '150px',
      });
    });
    // Filtrar colunas ocultas
    return colunas.filter((col) => !colunasOcultas.has(col.id));
  }, [colunasBase, colunasDinamicas, colunasOcultas, etiquetasPorCampo]);


  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Rocha 2025</h1>

      {/* Barra de ações */}
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
                <span className="text-sm text-slate-600">{totalProjetos} Projetos</span>
              </div>

              {/* Tabela de projetos (quando expandida) */}
              {isExpandida && (
                <div className="border-t border-slate-200">
                  {projetos.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 bg-white">
                      Nenhum projeto cadastrado
                    </div>
                  ) : (
                    <>
                      <StandardTable
                        columns={colunasCompletas.map((col) => {
                          const column: StandardTableColumn<Projeto> = {
                            id: col.id,
                            label: col.label,
                            width: col.width || '150px',
                            minWidth: col.width || '150px',
                            editable: col.editable !== false,
                            useTags: col.useTags,
                            // tagOptions será usado apenas como fallback - tagsByField é a fonte principal
                            tagOptions: col.tagOptions,
                          };

                          // Campo tipoCarga e fatura usam badge simples
                          if (col.id === 'tipoCarga' || col.id === 'fatura') {
                            column.render = (value: any) => renderBadge(value || '-');
                          }

                          // Campo rsCom usa check
                          if (col.id === 'rsCom') {
                            column.render = (value: any) => value ? <Check className="h-4 w-4 text-green-600" /> : '-';
                          }

                          return column;
                        })}
                        data={projetos}
                        onCellChange={(rowIndex: number, columnId: string, value: any) => {
                          const projeto = projetos[rowIndex];
                          setCategorias((prev) =>
                            prev.map((cat) => ({
                              ...cat,
                              projetos: cat.projetos.map((p: Projeto) => {
                                if (p.id !== projeto.id) return p;
                                // Mapear columnId para o campo correto no objeto
                                const update: any = {};
                                if (columnId === 'projeto') {
                                  update.nome = value;
                                } else if (columnId === 'navio') {
                                  update.namo = value;
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
                        getCellValue={(row: Projeto, columnId: string) => {
                          const projeto = row as Projeto & Record<string, any>;
                          // Verificar se é uma coluna dinâmica
                          if (colunasDinamicas.some((col) => col.id === columnId)) {
                            return projeto[columnId] || '';
                          }
                          switch (columnId) {
                            case 'projeto':
                              return projeto.nome;
                            case 'tipoCarga':
                              return projeto.tipoCarga || '';
                            case 'refAgCarga':
                              return projeto.refAgCarga || '';
                            case 'eta':
                              return projeto.eta || '';
                            case 'navio':
                              return projeto.namo || '';
                            case 'obs':
                              return projeto.obs || '';
                            case 'cambioPag':
                              return projeto.cambioPag || '';
                            case 'draftBlAwb':
                              return projeto.draftBlAwb || '';
                            case 'ctnTerm':
                              return projeto.ctnTerm || '';
                            case 'canal':
                              return projeto.canal || '';
                            case 'fatura':
                              return projeto.fatura || '';
                            case 'rsCom':
                              return projeto.rsCom || '';
                            default:
                              return projeto[columnId] || '';
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
                        onExport={(selectedData: Projeto[]) => handleExportProjetos(categoria.id, selectedData)}
                        getRowId={(row: Projeto) => row.id}
                        favorites={favoritos}
                        onToggleFavorite={toggleFavorito}
                        comments={comentarios}
                        onOpenCommentDialog={handleAbrirComentario}
                        tagsByField={etiquetasPorCampo}
                        onTagsChange={handleTagsChange}
                        onHeaderChange={handleHeaderChange}
                        editableHeaders={true}
                        onColumnTagsToggle={handleColumnTagsToggle}
                        defaultFirstColumnFixed={true}
                        firstColumnWidth="120px"
                      />
                      <div className="flex items-center justify-end p-4 border-t border-slate-200 bg-white">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-32 bg-green-500 rounded"></div>
                          <span className="text-sm text-slate-600">
                            {projetos.length}/{totalProjetos}
                          </span>
                          <Button variant="outline" size="sm" disabled>
                            Anterior
                          </Button>
                          <Button variant="outline" size="sm" disabled>
                            Próxima
                          </Button>
                        </div>
                      </div>
                    </>
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
              Adicione observações específicas para esta carga. Elas ficarão associadas a esta linha.
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
                placeholder="Ex: FCL - Container, LCL - Carga Solta, etc."
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
