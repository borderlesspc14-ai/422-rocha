import { ChevronRight, ChevronDown, ChevronLeft, Plus, Search, MoreVertical, Package, X, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface Workspace {
  id: string;
  label: string;
  path: string;
}

const workspacesIniciais: Workspace[] = [
  { id: 'tarefas-pendencias', label: 'Tarefas - Pendencias', path: '/tarefas-pendencias' },
  { id: 'rocha-2025', label: 'Rocha 2025', path: '/rocha-2025' },
  { id: 'faturamento-2025', label: 'Faturamento 2025', path: '/faturamento-2025' },
  { id: 'finalizados', label: 'Finalizados', path: '/finalizados' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [workspaceSelecionado, setWorkspaceSelecionado] = useState('Área de traba...');
  const [workspaces, setWorkspaces] = useState<Workspace[]>(workspacesIniciais);
  const [buscaAtiva, setBuscaAtiva] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarDialogAdicionar, setMostrarDialogAdicionar] = useState(false);
  const [nomeNovaTabela, setNomeNovaTabela] = useState('');
  const [modoExclusao, setModoExclusao] = useState(false);
  const [selecionadosExclusao, setSelecionadosExclusao] = useState<Set<string>>(new Set());

  const isWorkspaceActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const alternarSelecaoExclusao = (id: string) => {
    // nunca permite selecionar a principal
    if (id === 'rocha-2025') return;
    setSelecionadosExclusao((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  };

  const executarExclusaoSelecionados = () => {
    if (selecionadosExclusao.size === 0) return;

    const idsParaRemover = Array.from(selecionadosExclusao).filter(
      (id) => id !== 'rocha-2025'
    );
    if (idsParaRemover.length === 0) {
      setModoExclusao(false);
      setSelecionadosExclusao(new Set());
      return;
    }

    if (
      !window.confirm(
        `Excluir ${idsParaRemover.length} tabela(s) selecionada(s)?`
      )
    ) {
      return;
    }

    const caminhosRemovidos = workspaces
      .filter((w) => idsParaRemover.includes(w.id))
      .map((w) => w.path);

    setWorkspaces((prev) => prev.filter((w) => !idsParaRemover.includes(w.id)));

    if (caminhosRemovidos.some((p) => isWorkspaceActive(p))) {
      navigate('/rocha-2025');
    }

    setModoExclusao(false);
    setSelecionadosExclusao(new Set());
  };

  const handleToggleModoExclusao = () => {
    setModoExclusao((prev) => {
      const novo = !prev;
      if (!novo) {
        setSelecionadosExclusao(new Set());
      }
      return novo;
    });
  };

  const workspacesFiltrados = useMemo(() => {
    if (!termoBusca.trim()) return workspaces;
    return workspaces.filter((w) =>
      w.label.toLowerCase().includes(termoBusca.toLowerCase())
    );
  }, [workspaces, termoBusca]);

  const handleAdicionarTabela = () => {
    if (nomeNovaTabela.trim()) {
      const novoId = `tabela-${Date.now()}`;
      const novoPath = `/${novoId.toLowerCase().replace(/\s+/g, '-')}`;
      const novoWorkspace: Workspace = {
        id: novoId,
        label: nomeNovaTabela.trim(),
        path: novoPath,
      };
      setWorkspaces((prev) => [...prev, novoWorkspace]);
      setNomeNovaTabela('');
      setMostrarDialogAdicionar(false);
      navigate(novoPath);
    }
  };

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-blue-900 text-blue-50 border-r border-slate-900/40 transition-all duration-300 z-50',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-slate-900/40 transition-all duration-300',
            collapsed ? 'px-3 justify-center bg-blue-900' : 'px-0 bg-transparent'
          )}
        >
          {collapsed ? (
            <button
              onClick={onToggle}
              className="h-8 w-8 rounded flex items-center justify-center hover:bg-blue-800/80 transition-colors"
              title="Expandir sidebar"
            >
              <div className="h-6 w-6 bg-white rounded flex items-center justify-center shadow-sm">
                <Package className="h-4 w-4 text-blue-900" />
              </div>
            </button>
          ) : (
            <div className="flex items-center h-full px-5 bg-gradient-to-r from-blue-900 via-blue-900 to-blue-800 flex-1 shadow-sm">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-800 shadow-sm">
                  <Package className="h-5 w-5 text-blue-900" />
                </div>
                <span className="text-white text-lg font-bold tracking-tight">Rocha</span>
              </div>
              <button
                onClick={onToggle}
                className="px-3 py-2 hover:bg-white/10 transition-colors flex items-center justify-center h-full"
                title="Recolher sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </div>

        <nav className={cn("p-4 flex flex-col h-[calc(100vh-4rem)]", collapsed ? "overflow-hidden" : "overflow-y-auto")}>
          {/* Áreas de trabalho */}
          {!collapsed && (
            <div className="flex-1">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-sm font-medium text-blue-50">Áreas de trabalho</span>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-white/10"
                        title="Opções das tabelas"
                      >
                        <MoreVertical className="h-4 w-4 text-blue-100" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          handleToggleModoExclusao();
                        }}
                      >
                        Apagar tabelas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setMostrarDialogAdicionar(true)}
                      >
                        Criar nova tabela
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button
                    type="button"
                    onClick={() => {
                      setBuscaAtiva(!buscaAtiva);
                      if (buscaAtiva) {
                        setTermoBusca('');
                      }
                    }}
                    className="p-1 rounded hover:bg-white/10"
                    title="Buscar tabelas"
                  >
                    <Search className="h-4 w-4 text-blue-100" />
                  </button>
                </div>
              </div>

              {/* Campo de busca */}
              {buscaAtiva && (
                <div className="mb-2 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100" />
                  <Input
                    type="text"
                    placeholder="Buscar tabelas..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10 pr-8 text-sm bg-blue-800 border-blue-700 text-blue-50 placeholder:text-blue-200"
                    autoFocus
                  />
                  {termoBusca && (
                    <button
                      onClick={() => setTermoBusca('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
                    >
                      <X className="h-3 w-3 text-blue-100" />
                    </button>
                  )}
                </div>
              )}

              {/* Lista de Workspaces */}
              <ul className="space-y-1">
                {workspacesFiltrados.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-500 text-center">
                    Nenhuma tabela encontrada
                  </li>
                ) : (
                  workspacesFiltrados.map((workspace) => {
                    const isActive = isWorkspaceActive(workspace.path);
                    const selecionado = selecionadosExclusao.has(workspace.id);
                    const podeExcluir = workspace.id !== 'rocha-2025';
                    return (
                      <li key={workspace.id}>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                            selecionado
                              ? 'bg-blue-800/80 border border-red-400'
                              : 'hover:bg-blue-800/70'
                          )}
                        >
                          {modoExclusao && podeExcluir && (
                            <input
                              type="checkbox"
                              className="h-3 w-3 rounded border-slate-300 accent-red-500"
                              checked={selecionado}
                              onChange={() => alternarSelecaoExclusao(workspace.id)}
                            />
                          )}
                          {modoExclusao && !podeExcluir && (
                            <div className="w-3" />
                          )}
                          <Link
                            to={workspace.path}
                            className={cn(
                              'flex-1 text-sm transition-colors rounded px-2 py-1',
                              isActive
                                ? 'bg-white text-blue-700 font-medium shadow-sm'
                                : 'text-blue-50'
                            )}
                          >
                            {workspace.label}
                          </Link>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>

              {modoExclusao && (
                <div className="mt-3 px-3 py-2.5 bg-blue-800/60 border border-blue-700 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-50">
                      <span className="font-semibold">{selecionadosExclusao.size}</span>{' '}
                      {selecionadosExclusao.size === 1 ? 'tabela selecionada' : 'tabelas selecionadas'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-xs rounded border border-blue-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          setModoExclusao(false);
                          setSelecionadosExclusao(new Set());
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'w-7 h-7 rounded flex items-center justify-center transition-colors',
                          selecionadosExclusao.size === 0
                            ? 'bg-blue-700/60 text-blue-200 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        )}
                        onClick={executarExclusaoSelecionados}
                        disabled={selecionadosExclusao.size === 0}
                        title="Excluir tabelas selecionadas"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão de recolher quando não está colapsado */}
          {!collapsed && (
            <div className="mt-auto pt-4 border-t border-blue-800">
              <button
                onClick={onToggle}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
                title="Recolher sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Recolher</span>
              </button>
            </div>
          )}

          {/* Botão de expandir quando está colapsado */}
          {collapsed && (
            <div className="mt-auto pt-4 border-t border-blue-800">
              <button
                onClick={onToggle}
                className="flex items-center justify-center px-3 py-2.5 w-full text-blue-100 hover:bg-blue-800 rounded-lg transition-colors"
                title="Expandir sidebar"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* Dialog para adicionar nova tabela */}
      <Dialog open={mostrarDialogAdicionar} onOpenChange={setMostrarDialogAdicionar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Tabela</DialogTitle>
            <DialogDescription>
              Digite o nome da nova tabela que deseja criar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeTabela">Nome da Tabela</Label>
              <Input
                id="nomeTabela"
                placeholder="Ex: Nova Tabela 2025"
                value={nomeNovaTabela}
                onChange={(e) => setNomeNovaTabela(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nomeNovaTabela.trim()) {
                    handleAdicionarTabela();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setMostrarDialogAdicionar(false);
              setNomeNovaTabela('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarTabela} disabled={!nomeNovaTabela.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
