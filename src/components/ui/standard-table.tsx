import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, Download, Star, MessageCircle, Pencil, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

export interface TagOption {
  label: string;
  valor: string;
  cor: 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'slate';
}

export interface StandardTableColumn<T = any> {
  id: string;
  label: string;
  width?: string;
  minWidth?: string;
  editable?: boolean;
  useTags?: boolean; // Se true, usa sistema de etiquetas
  tagOptions?: TagOption[]; // Opções de etiquetas para este campo
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
}

interface StandardTableProps<T = any> {
  columns: StandardTableColumn<T>[];
  data: T[];
  onCellChange?: (rowIndex: number, columnId: string, value: any) => void;
  onRowClick?: (row: T, rowIndex: number) => void;
  className?: string;
  firstColumnFixed?: boolean;
  defaultFirstColumnFixed?: boolean;
  getCellValue?: (row: T, columnId: string) => any;
  firstColumnWidth?: string;
  enableSelection?: boolean;
  selectedRows?: Set<number>;
  onSelectionChange?: (selectedRows: Set<number>) => void;
  onExport?: (selectedData: T[]) => void;
  getRowId?: (row: T) => string | number;
  // Sistema de favoritos e comentários
  favorites?: Set<string>;
  onToggleFavorite?: (rowId: string) => void;
  comments?: Record<string, string[]>;
  onOpenCommentDialog?: (rowId: string) => void;
  // Sistema de etiquetas
  tagsByField?: Record<string, TagOption[]>;
  onTagsChange?: (fieldId: string, tags: TagOption[]) => void;
  // Edição de cabeçalhos
  onHeaderChange?: (columnId: string, newLabel: string) => void;
  editableHeaders?: boolean;
  // Toggle de etiquetas por coluna
  onColumnTagsToggle?: (columnId: string, useTags: boolean) => void;
}

const getTagClassByColor = (cor: string): string => {
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

export function StandardTable<T = any>({
  columns,
  data,
  onCellChange,
  onRowClick,
  className,
  firstColumnFixed: controlledFirstColumnFixed,
  defaultFirstColumnFixed = true,
  getCellValue,
  firstColumnWidth = '120px',
  enableSelection = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  onExport,
  getRowId,
  favorites = new Set(),
  onToggleFavorite,
  comments = {},
  onOpenCommentDialog,
  tagsByField = {},
  onTagsChange,
  onHeaderChange,
  editableHeaders = true,
  onColumnTagsToggle,
}: StandardTableProps<T>) {
  const [firstColumnFixed, setFirstColumnFixed] = useState(
    controlledFirstColumnFixed !== undefined
      ? controlledFirstColumnFixed
      : defaultFirstColumnFixed
  );
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [internalSelectedRows, setInternalSelectedRows] = useState<Set<number>>(new Set());
  const [editingTagField, setEditingTagField] = useState<string | null>(null);
  const [tempTags, setTempTags] = useState<TagOption[]>([]);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagValue, setNewTagValue] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagOption['cor']>('green');
  const [editingHeader, setEditingHeader] = useState<string | null>(null);
  const [headerEditValue, setHeaderEditValue] = useState('');

  // Sincronizar tempTags quando editingTagField mudar ou tagsByField for atualizado
  useEffect(() => {
    if (editingTagField) {
      const currentTags = tagsByField[editingTagField] || [];
      // Sempre atualiza quando o campo de edição muda ou quando as tags são atualizadas
      setTempTags([...currentTags]);
    }
  }, [editingTagField, tagsByField]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fixedColumnRef = useRef<HTMLDivElement>(null);
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const fixedTableBodyRef = useRef<HTMLTableSectionElement>(null);
  const scrollableTableBodyRef = useRef<HTMLTableSectionElement>(null);

  const selectedRows = controlledSelectedRows !== undefined 
    ? controlledSelectedRows 
    : internalSelectedRows;

  const handleSelectionChange = (newSelection: Set<number>) => {
    if (controlledSelectedRows === undefined) {
      setInternalSelectedRows(newSelection);
    }
    onSelectionChange?.(newSelection);
  };

  const actualFirstColumnFixed =
    controlledFirstColumnFixed !== undefined
      ? controlledFirstColumnFixed
      : firstColumnFixed;

  // Sincronizar scroll vertical e alturas das linhas
  useEffect(() => {
    const fixedCol = fixedColumnRef.current;
    const scrollableContent = scrollableContentRef.current;
    const fixedBody = fixedTableBodyRef.current;
    const scrollableBody = scrollableTableBodyRef.current;

    if (!fixedCol || !scrollableContent || !actualFirstColumnFixed) return;

    // Sincronizar alturas das linhas
    const syncRowHeights = () => {
      if (!fixedBody || !scrollableBody) return;
      
      const fixedRows = fixedBody.querySelectorAll('tr');
      const scrollableRows = scrollableBody.querySelectorAll('tr');
      
      if (fixedRows.length !== scrollableRows.length) return;
      
      fixedRows.forEach((fixedRow, index) => {
        const scrollableRow = scrollableRows[index];
        if (scrollableRow) {
          const scrollableHeight = scrollableRow.getBoundingClientRect().height;
          const fixedHeight = fixedRow.getBoundingClientRect().height;
          
          if (Math.abs(scrollableHeight - fixedHeight) > 1) {
            (fixedRow as HTMLElement).style.height = `${scrollableHeight}px`;
          }
        }
      });
    };

    let isScrolling = false;

    const handleScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      requestAnimationFrame(() => {
        if (fixedCol.scrollTop !== scrollableContent.scrollTop) {
          fixedCol.scrollTop = scrollableContent.scrollTop;
        }
        isScrolling = false;
      });
    };

    const handleFixedScroll = () => {
      if (isScrolling) return;
      isScrolling = true;
      requestAnimationFrame(() => {
        if (scrollableContent.scrollTop !== fixedCol.scrollTop) {
          scrollableContent.scrollTop = fixedCol.scrollTop;
        }
        isScrolling = false;
      });
    };

    scrollableContent.addEventListener('scroll', handleScroll, { passive: true });
    fixedCol.addEventListener('scroll', handleFixedScroll, { passive: true });
    
    // Sincronizar alturas após renderização
    const timeoutId = setTimeout(syncRowHeights, 0);
    const resizeObserver = new ResizeObserver(syncRowHeights);
    
    if (scrollableBody) {
      resizeObserver.observe(scrollableBody);
    }
    
    return () => {
      scrollableContent.removeEventListener('scroll', handleScroll);
      fixedCol.removeEventListener('scroll', handleFixedScroll);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [actualFirstColumnFixed, data.length]);

  const toggleRowSelection = (rowIndex: number) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowIndex)) {
      newSelection.delete(rowIndex);
    } else {
      newSelection.add(rowIndex);
    }
    handleSelectionChange(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === data.length) {
      handleSelectionChange(new Set());
    } else {
      handleSelectionChange(new Set(data.map((_, index) => index)));
    }
  };

  const handleExport = () => {
    if (!onExport) return;
    const selectedData = data.filter((_, index) => selectedRows.has(index));
    onExport(selectedData);
  };

  const handleCellClick = (rowIndex: number, columnId: string) => {
    const row = data[rowIndex];
    const value = getCellValue
      ? getCellValue(row, columnId)
      : (row as any)[columnId];
    setEditingCell({ rowIndex, columnId });
    setEditValue(value?.toString() || '');
  };

  const handleCellBlur = () => {
    if (editingCell && onCellChange) {
      onCellChange(editingCell.rowIndex, editingCell.columnId, editValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const getValue = (row: T, columnId: string): any => {
    if (getCellValue) {
      return getCellValue(row, columnId);
    }
    return (row as any)[columnId];
  };

  const getRowIdString = (row: T, index: number): string => {
    if (getRowId) {
      return String(getRowId(row));
    }
    return String(index);
  };

  const handleToggleFavorite = (row: T, index: number) => {
    if (onToggleFavorite) {
      onToggleFavorite(getRowIdString(row, index));
    }
  };

  const handleOpenComment = (row: T, index: number) => {
    if (onOpenCommentDialog) {
      onOpenCommentDialog(getRowIdString(row, index));
    }
  };

  const renderTagCell = (
    row: T,
    rowIndex: number,
    column: StandardTableColumn<T>
  ) => {
    const value = getValue(row, column.id);
    // SEMPRE usar tagsByField como fonte principal - é a fonte de verdade atualizada
    // column.tagOptions é apenas um fallback para compatibilidade
    // Verificar se a propriedade existe em tagsByField, mesmo que seja um array vazio
    let tagOptions: TagOption[] = [];
    if (tagsByField && typeof tagsByField === 'object') {
      // Se tagsByField existe e tem a propriedade (mesmo que seja array vazio), usar ela
      if (column.id in tagsByField) {
        tagOptions = Array.isArray(tagsByField[column.id]) ? tagsByField[column.id] : [];
      } else if (column.tagOptions) {
        // Se não existe em tagsByField, usar column.tagOptions como fallback
        tagOptions = column.tagOptions;
      }
    } else if (column.tagOptions) {
      // Se tagsByField não existe, usar column.tagOptions
      tagOptions = column.tagOptions;
    }
    const currentTag = tagOptions.find(t => t.valor === value) || tagOptions.find(t => t.valor.toLowerCase() === value?.toLowerCase());

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'px-2 py-1 rounded text-xs font-medium border w-full text-left min-h-[32px] flex items-center overflow-hidden',
              currentTag ? getTagClassByColor(currentTag.cor) : 'bg-slate-100 text-slate-800 border-slate-200'
            )}
            style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate block w-full">{value || 'Sem registro'}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {tagOptions.map((tag) => (
            <DropdownMenuItem
              key={tag.valor}
              onClick={(e) => {
                e.stopPropagation();
                if (onCellChange) {
                  onCellChange(rowIndex, column.id, tag.valor);
                }
              }}
              className="p-0"
            >
              <div className={cn('w-full px-3 py-2 rounded', getTagClassByColor(tag.cor))}>
                {tag.label}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Sempre usar tagsByField como fonte principal ao abrir o diálogo
              // Verificar se a propriedade existe em tagsByField, mesmo que seja um array vazio
              const currentTags = (tagsByField && column.id in tagsByField) 
                ? tagsByField[column.id] 
                : tagOptions;
              setEditingTagField(column.id);
              setTempTags([...currentTags]);
              setNewTagLabel('');
              setNewTagValue('');
              setNewTagColor('green');
            }}
          >
            <div className="flex items-center gap-2 text-xs">
              <Pencil className="h-3.5 w-3.5 text-slate-600" />
              <span>Editar etiquetas</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderCellContent = (
    row: T,
    rowIndex: number,
    column: StandardTableColumn<T>
  ) => {
    const value = getValue(row, column.id);
    const isEditing =
      editingCell?.rowIndex === rowIndex &&
      editingCell?.columnId === column.id;

    if (isEditing) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCellBlur}
          onKeyDown={handleCellKeyDown}
          className="h-8 text-xs border-blue-500 focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      );
    }

    // Se usa sistema de etiquetas
    if (column.useTags) {
      return renderTagCell(row, rowIndex, column);
    }

    // Se tem render customizado
    if (column.render) {
      const isEditable = column.editable !== false;
      return (
        <div
          className={cn(
            'min-h-[32px] flex items-center whitespace-nowrap overflow-hidden max-w-full',
            isEditable && 'cursor-text hover:bg-slate-50 rounded px-1'
          )}
          style={{ maxWidth: '100%', overflow: 'hidden' }}
          onClick={() => isEditable && handleCellClick(rowIndex, column.id)}
          title={isEditable ? 'Clique para editar' : undefined}
        >
          <div className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
            {column.render(value, row, rowIndex)}
          </div>
        </div>
      );
    }

    // Render padrão editável
    const isEditable = column.editable !== false;
    return (
      <div
        className={cn(
          'min-h-[32px] flex items-center text-sm whitespace-nowrap overflow-hidden max-w-full',
          isEditable && 'cursor-text hover:bg-slate-50 rounded px-1'
        )}
        style={{ maxWidth: '100%', overflow: 'hidden' }}
        onClick={() => isEditable && handleCellClick(rowIndex, column.id)}
        title={isEditable ? 'Clique para editar' : undefined}
      >
        <span className="truncate block max-w-full">{value?.toString() || '-'}</span>
      </div>
    );
  };

  const getRowBgColor = (index: number) => {
    return index % 2 === 0 ? 'white' : '#f8fafc';
  };

  const handleAddTag = () => {
    if (!newTagLabel.trim() || !newTagValue.trim() || !editingTagField) return;
    setTempTags((prev) => [
      ...prev,
      { label: newTagLabel.trim(), valor: newTagValue.trim(), cor: newTagColor },
    ]);
    setNewTagLabel('');
    setNewTagValue('');
    setNewTagColor('green');
  };

  const handleSaveTags = () => {
    if (!editingTagField || !onTagsChange) return;
    onTagsChange(editingTagField, tempTags);
    setEditingTagField(null);
    setTempTags([]);
    setNewTagLabel('');
    setNewTagValue('');
    setNewTagColor('green');
  };

  const handleRemoveTag = (index: number) => {
    setTempTags((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className={cn('relative border border-slate-200 rounded-lg bg-white overflow-hidden', className)}>
        {/* Botões de controle */}
        {enableSelection && onExport && selectedRows.size > 0 && (
          <div className="absolute top-2 right-2 z-20 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 px-2 text-xs"
              title={`Exportar ${selectedRows.size} item(ns) selecionado(s)`}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar ({selectedRows.size})
            </Button>
          </div>
        )}

        <div className="relative flex">
          {/* Primeira coluna fixa - sempre com favorito e comentário */}
          {actualFirstColumnFixed && (
            <div
              ref={fixedColumnRef}
              className="flex-shrink-0 border-r border-slate-200 bg-white"
              style={{ 
                width: firstColumnWidth,
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'sticky',
                left: 0,
                zIndex: 5
              }}
            >
              <table className="w-full border-collapse" style={{ tableLayout: 'fixed', borderSpacing: 0 }}>
                <colgroup>
                  <col style={{ width: firstColumnWidth }} />
                </colgroup>
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      className="h-10 px-4 text-left align-middle font-medium text-slate-700 border-r border-b border-slate-200 bg-slate-50"
                      style={{ height: '40px', padding: '0 16px', lineHeight: '40px', borderSpacing: 0 }}
                    >
                      {enableSelection ? (
                        <div className="flex items-center h-full">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 flex-shrink-0"
                            checked={data.length > 0 && selectedRows.size === data.length}
                            onChange={toggleAllRows}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : (
                        'Ações'
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody ref={fixedTableBodyRef}>
                  {data.map((row, index) => {
                    const rowId = getRowIdString(row, index);
                    const isFavorite = favorites.has(rowId);
                    const commentCount = comments[rowId]?.length || 0;
                    
                    return (
                      <tr
                        key={rowId}
                        className={cn(
                          'hover:bg-slate-50 transition-colors',
                          onRowClick && 'cursor-pointer'
                        )}
                        style={{
                          backgroundColor: getRowBgColor(index),
                          height: 'auto',
                        }}
                        onClick={() => onRowClick?.(row, index)}
                      >
                        <td
                          className="border-r border-b border-slate-200 align-middle"
                          style={{
                            backgroundColor: getRowBgColor(index),
                            padding: '12px 16px',
                            verticalAlign: 'middle',
                            height: 'auto',
                            minHeight: '48px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div className="flex items-center gap-2" style={{ minHeight: '24px' }}>
                            {enableSelection && (
                              <input
                                type="checkbox"
                                className="rounded border-slate-300 flex-shrink-0"
                                checked={selectedRows.has(index)}
                                onChange={() => toggleRowSelection(index)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-yellow-100 transition-colors"
                              title="Favoritar"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(row, index);
                              }}
                            >
                              <Star
                                className={cn(
                                  'h-4 w-4',
                                  isFavorite
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300'
                                )}
                              />
                            </button>
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-slate-100 transition-colors"
                              title="Adicionar comentário"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenComment(row, index);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 text-slate-400" />
                            </button>
                            {commentCount > 0 && (
                              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] w-4 h-4">
                                {commentCount}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Conteúdo rolável */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto overflow-y-auto bg-white"
          >
            <div ref={scrollableContentRef} style={{ overflow: 'hidden' }}>
              <table 
                className="w-full border-collapse" 
                style={{ tableLayout: 'fixed', width: '100%', borderSpacing: 0 }}
              >
                <colgroup>
                  {actualFirstColumnFixed
                    ? columns.map((column) => (
                        <col key={column.id} style={{ width: column.width || '150px', minWidth: column.width || '150px', maxWidth: column.width || '150px' }} />
                      ))
                    : columns.map((column) => (
                        <col key={column.id} style={{ width: column.width || '150px', minWidth: column.width || '150px', maxWidth: column.width || '150px' }} />
                      ))}
                </colgroup>
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((column) => {
                      const isEditing = editingHeader === column.id;
                      return (
                        <th
                          key={column.id}
                          className={cn(
                            "h-10 px-4 text-left align-middle font-medium text-slate-700 border-r border-b border-slate-200 whitespace-nowrap bg-slate-50",
                            editableHeaders && onHeaderChange && "cursor-text hover:bg-slate-100"
                          )}
                          style={{ 
                            height: '40px', 
                            padding: '0 16px',
                            lineHeight: '40px',
                            width: column.width,
                            minWidth: column.minWidth || column.width,
                            maxWidth: column.width,
                            borderSpacing: 0,
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                          }}
                          onClick={() => {
                            if (editableHeaders && onHeaderChange) {
                              setEditingHeader(column.id);
                              setHeaderEditValue(column.label);
                            }
                          }}
                          title={editableHeaders && onHeaderChange ? 'Clique para editar' : undefined}
                        >
                          {isEditing ? (
                            <Input
                              value={headerEditValue}
                              onChange={(e) => setHeaderEditValue(e.target.value)}
                              onBlur={() => {
                                if (onHeaderChange && headerEditValue.trim()) {
                                  onHeaderChange(column.id, headerEditValue.trim());
                                }
                                setEditingHeader(null);
                                setHeaderEditValue('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (onHeaderChange && headerEditValue.trim()) {
                                    onHeaderChange(column.id, headerEditValue.trim());
                                  }
                                  setEditingHeader(null);
                                  setHeaderEditValue('');
                                } else if (e.key === 'Escape') {
                                  setEditingHeader(null);
                                  setHeaderEditValue('');
                                }
                              }}
                              className="h-8 text-xs border-blue-500 focus:ring-2 focus:ring-blue-500"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <div className="flex items-center justify-between gap-2 overflow-hidden max-w-full">
                              <span className="truncate flex-1 min-w-0">{column.label}</span>
                              {onColumnTagsToggle && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onColumnTagsToggle(column.id, !column.useTags);
                                  }}
                                  className={cn(
                                    "p-1 rounded hover:bg-slate-200 transition-colors flex-shrink-0",
                                    column.useTags && "bg-blue-100 text-blue-700"
                                  )}
                                  title={column.useTags ? 'Desativar etiquetas' : 'Ativar etiquetas'}
                                >
                                  <Tag className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody ref={scrollableTableBodyRef}>
                  {data.map((row, index) => (
                    <tr
                      key={getRowIdString(row, index)}
                      className={cn(
                        'hover:bg-slate-50 transition-colors',
                        onRowClick && 'cursor-pointer'
                      )}
                      style={{
                        backgroundColor: getRowBgColor(index),
                        height: 'auto',
                      }}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className="border-r border-b border-slate-200 align-middle"
                          style={{
                            backgroundColor: getRowBgColor(index),
                            padding: '12px 16px',
                            verticalAlign: 'middle',
                            width: column.width,
                            minWidth: column.minWidth || column.width,
                            maxWidth: column.width,
                            height: 'auto',
                            minHeight: '48px',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          <div 
                            className="overflow-hidden max-w-full"
                            style={{ 
                              minHeight: '24px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%',
                              boxSizing: 'border-box',
                              width: '100%',
                            }}
                          >
                            {renderCellContent(row, index, column)}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de edição de etiquetas */}
      <Dialog
        open={!!editingTagField}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTagField(null);
            setTempTags([]);
            setNewTagLabel('');
            setNewTagValue('');
            setNewTagColor('green');
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-slate-600" />
              Editar Etiquetas - {editingTagField && columns.find(c => c.id === editingTagField)?.label}
            </DialogTitle>
            <DialogDescription>
              Gerencie as etiquetas disponíveis para este campo. Você pode adicionar, editar ou remover etiquetas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Etiquetas existentes</label>
              {tempTags.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhuma etiqueta cadastrada</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                  {tempTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200"
                    >
                      <div className={cn('flex-1 px-2 py-1 rounded text-xs font-medium border', getTagClassByColor(tag.cor))}>
                        <div className="font-semibold">{tag.label}</div>
                        <div className="text-[10px] opacity-75">{tag.valor}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Remover etiqueta"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t pt-4">
              <label className="text-sm font-medium text-slate-700">Adicionar nova etiqueta</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">Label (exibição)</label>
                  <Input
                    type="text"
                    placeholder="Ex: Done"
                    value={newTagLabel}
                    onChange={(e) => setNewTagLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagLabel.trim() && newTagValue.trim()) {
                        handleAddTag();
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">Valor (armazenado)</label>
                  <Input
                    type="text"
                    placeholder="Ex: Feito"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagLabel.trim() && newTagValue.trim()) {
                        handleAddTag();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-600">Cor:</label>
                <select
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value as TagOption['cor'])}
                  className="text-xs border border-slate-300 rounded px-2 py-1"
                >
                  <option value="green">Verde</option>
                  <option value="yellow">Amarelo</option>
                  <option value="red">Vermelho</option>
                  <option value="blue">Azul</option>
                  <option value="gray">Cinza</option>
                  <option value="slate">Cinza Escuro</option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTagLabel.trim() || !newTagValue.trim()}
                  className="ml-auto"
                >
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingTagField(null);
                setTempTags([]);
                setNewTagLabel('');
                setNewTagValue('');
                setNewTagColor('green');
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveTags}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

