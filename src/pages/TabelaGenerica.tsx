import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, X, Trash2, MoreVertical, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useParams } from 'react-router-dom';
import { StandardTable, StandardTableColumn, TagOption } from '@/components/ui/standard-table';

interface Coluna {
  id: string;
  label: string;
}

interface LinhaDados {
  id: string;
  [key: string]: any;
}

interface CategoriaGenerica {
  id: string;
  nome: string;
  linhas: LinhaDados[];
}

const colunasIniciais: Coluna[] = [
  { id: 'col-tarefa', label: 'Tarefa' },
  { id: 'col-resp', label: 'Responsável' },
  { id: 'col-status', label: 'Status' },
  { id: 'col-prazo', label: 'Prazo' },
];

const linhasIniciais = ['Linha 1', 'Linha 2', 'Linha 3'];

const categoriasIniciais: CategoriaGenerica[] = [
  {
    id: 'categoria-1',
    nome: 'Categoria 1',
    linhas: linhasIniciais.map((linha, index) => ({
      id: `linha-${index}`,
      'col-tarefa': linha,
      'col-resp': '',
      'col-status': '',
      'col-prazo': '',
    })),
  },
];

export function TabelaGenerica() {
  const { tabelaId } = useParams<{ tabelaId: string }>();
  const [pesquisa, setPesquisa] = useState('');
  const [categorias, setCategorias] = useState<CategoriaGenerica[]>(categoriasIniciais);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState<Set<string>>(new Set(['categoria-1']));
  const [colunas, setColunas] = useState<Coluna[]>(colunasIniciais);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [comentarios, setComentarios] = useState<Record<string, string[]>>({});
  const [projetoComentarioAberto, setProjetoComentarioAberto] = useState<string | null>(null);
  const [comentarioAtual, setComentarioAtual] = useState('');
  const [comentariosTemp, setComentariosTemp] = useState<string[]>([]);
  const [mostrarDialogNovaCategoria, setMostrarDialogNovaCategoria] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
  const [categoriaSelecionada] = useState<string>('categoria-1');
  const [tagsByField, setTagsByField] = useState<Record<string, TagOption[]>>({});

  const nomeTabela =
    tabelaId
      ?.split('-')
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ') || 'Nova Tabela';

  const handleAdicionarColuna = () => {
    const novoId = `col-${Date.now()}`;
    setColunas((prev) => [
      ...prev,
      { id: novoId, label: `Nova coluna ${prev.length + 1}` },
    ]);
    // Adicionar campo vazio em todas as linhas de todas as categorias
    setCategorias((prev) =>
      prev.map((cat) => ({
        ...cat,
        linhas: cat.linhas.map((linha) => ({ ...linha, [novoId]: '' })),
      }))
    );
  };

  const handleRemoverColuna = (id: string) => {
    if (colunas.length === 1) return;
    if (confirm('Tem certeza que deseja remover esta coluna?')) {
      setColunas((prev) => prev.filter((c) => c.id !== id));
      // Remover campo de todas as linhas
      // Remover campo de todas as linhas de todas as categorias
      setCategorias((prev) =>
        prev.map((cat) => ({
          ...cat,
          linhas: cat.linhas.map((linha) => {
            const { [id]: _, ...rest } = linha;
            return { ...rest, id: linha.id } as LinhaDados;
          }),
        }))
      );
    }
  };

  const handleRemoverLinha = (categoriaId: string, linhaId: string) => {
    if (confirm('Tem certeza que deseja remover esta linha?')) {
      setCategorias((prev) =>
        prev.map((cat) =>
          cat.id === categoriaId
            ? { ...cat, linhas: cat.linhas.filter((linha) => linha.id !== linhaId) }
            : cat
        )
      );
    }
  };

  const handleAdicionarLinha = () => {
    const novoId = `linha-${Date.now()}`;
    const novaLinha: LinhaDados = {
      id: novoId,
    };
    colunas.forEach((col) => {
      novaLinha[col.id] = '';
    });
    setCategorias((prev) =>
      prev.map((cat) =>
        cat.id === categoriaSelecionada
          ? { ...cat, linhas: [...cat.linhas, novaLinha] }
          : cat
      )
    );
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
    const novaCategoria: CategoriaGenerica = {
      id: `cat-${Date.now()}`,
      nome: novaCategoriaNome.trim(),
      linhas: [],
    };
    setCategorias((prev) => [...prev, novaCategoria]);
    setCategoriasExpandidas((prev) => new Set([...prev, novaCategoria.id]));
    setNovaCategoriaNome('');
    setMostrarDialogNovaCategoria(false);
  };

  const dadosFiltrados = (linhas: LinhaDados[]) => {
    if (!pesquisa) return linhas;
    return linhas.filter((linha) =>
      Object.values(linha).some((valor) =>
        valor?.toString().toLowerCase().includes(pesquisa.toLowerCase())
      )
    );
  };

  const handleHeaderChange = (columnId: string, newLabel: string) => {
    setColunas((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, label: newLabel } : col))
    );
  };

  const handleColumnTagsToggle = (columnId: string, useTags: boolean) => {
    // Atualizar colunas
    setColunas((prev) =>
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

  const colunasTabela: StandardTableColumn<LinhaDados>[] = colunas.map((col) => ({
    id: col.id,
    label: col.label,
    width: '150px',
    minWidth: '140px',
    editable: true,
    useTags: (col as any).useTags || false,
    tagOptions: tagsByField[col.id] || [],
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">{nomeTabela}</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAdicionarColuna}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar coluna
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMostrarDialogNovaCategoria(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar categoria
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAdicionarLinha}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar linha
        </Button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Pesquisar linhas..."
            value={pesquisa}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPesquisa(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4 mr-2" />
              Opções
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const colunaId = colunas[colunas.length - 1]?.id;
                if (colunaId) handleRemoverColuna(colunaId);
              }}
              disabled={colunas.length <= 1}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover última coluna
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const categoriaAtual = categorias.find((cat) => cat.id === categoriaSelecionada);
                if (categoriaAtual && categoriaAtual.linhas.length > 0) {
                  const ultimaLinha = categoriaAtual.linhas[categoriaAtual.linhas.length - 1];
                  if (ultimaLinha) handleRemoverLinha(categoriaSelecionada, ultimaLinha.id);
                }
              }}
              disabled={!categorias.find((cat) => cat.id === categoriaSelecionada)?.linhas.length}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover última linha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Categorias expansíveis */}
      <div className="space-y-2">
        {categorias.map((categoria) => {
          const linhas = dadosFiltrados(categoria.linhas);
          const isExpandida = categoriasExpandidas.has(categoria.id);
          const totalLinhas = categoria.linhas.length;

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
                <span className="text-sm text-slate-600">{totalLinhas} Linha(s)</span>
              </div>

              {/* Tabela de linhas (quando expandida) */}
              {isExpandida && (
                <div className="border-t border-slate-200">
                  {linhas.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 bg-white">
                      {pesquisa ? 'Nenhuma linha encontrada' : 'Nenhuma linha cadastrada'}
                    </div>
                  ) : (
                    <StandardTable
                      columns={colunasTabela}
                      data={linhas}
                      onCellChange={(rowIndex: number, columnId: string, value: any) => {
                        const linha = linhas[rowIndex];
                        setCategorias((prev) =>
                          prev.map((cat) => ({
                            ...cat,
                            linhas: cat.linhas.map((l) =>
                              l.id === linha.id ? { ...l, [columnId]: value } : l
                            ),
                          }))
                        );
                      }}
                      getCellValue={(row: LinhaDados, columnId: string) => row[columnId] || ''}
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
                      getRowId={(row: LinhaDados) => row.id}
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
                placeholder="Ex: Categoria 1, Grupo A, etc."
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
              Adicione observações específicas para esta linha.
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
    </div>
  );
}

