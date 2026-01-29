import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pin, PinOff, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditableTableColumn<T = any> {
  id: string;
  label: string;
  width?: string;
  minWidth?: string;
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;
  editable?: boolean;
}

interface EditableTableProps<T = any> {
  columns: EditableTableColumn<T>[];
  data: T[];
  onCellChange?: (rowIndex: number, columnId: string, value: any) => void;
  onRowClick?: (row: T, rowIndex: number) => void;
  className?: string;
  firstColumnFixed?: boolean;
  defaultFirstColumnFixed?: boolean;
  getCellValue?: (row: T, columnId: string) => any;
  renderFirstColumn?: (row: T, rowIndex: number) => React.ReactNode;
  firstColumnWidth?: string;
  enableSelection?: boolean;
  selectedRows?: Set<number>;
  onSelectionChange?: (selectedRows: Set<number>) => void;
  onExport?: (selectedData: T[]) => void;
  getRowId?: (row: T) => string | number;
}

export function EditableTable<T = any>({
  columns,
  data,
  onCellChange,
  onRowClick,
  className,
  firstColumnFixed: controlledFirstColumnFixed,
  defaultFirstColumnFixed = true,
  getCellValue,
  renderFirstColumn,
  firstColumnWidth = '200px',
  enableSelection = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  onExport,
  getRowId,
}: EditableTableProps<T>) {
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fixedColumnRef = useRef<HTMLDivElement>(null);
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

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

  // Sincronizar scroll vertical entre coluna fixa e conteúdo rolável
  useEffect(() => {
    const fixedCol = fixedColumnRef.current;
    const scrollableContent = scrollableContentRef.current;

    if (!fixedCol || !scrollableContent || !actualFirstColumnFixed) return;

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
    
    return () => {
      scrollableContent.removeEventListener('scroll', handleScroll);
      fixedCol.removeEventListener('scroll', handleFixedScroll);
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

  const renderCellContent = (
    row: T,
    rowIndex: number,
    column: EditableTableColumn<T>
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

    if (column.render) {
      const isEditable = column.editable !== false;
      return (
        <div
          className={cn(
            'min-h-[32px] flex items-center',
            isEditable && 'cursor-text hover:bg-slate-50 rounded px-1'
          )}
          onClick={() => isEditable && handleCellClick(rowIndex, column.id)}
          title={isEditable ? 'Clique para editar' : undefined}
        >
          {column.render(value, row, rowIndex)}
        </div>
      );
    }

    const isEditable = column.editable !== false;
    return (
      <div
        className={cn(
          'min-h-[32px] flex items-center text-sm',
          isEditable && 'cursor-text hover:bg-slate-50 rounded px-1'
        )}
        onClick={() => isEditable && handleCellClick(rowIndex, column.id)}
        title={isEditable ? 'Clique para editar' : undefined}
      >
        {value?.toString() || '-'}
      </div>
    );
  };

  const renderFirstColumnContent = (row: T, index: number) => {
    if (enableSelection) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-slate-300 flex-shrink-0"
            checked={selectedRows.has(index)}
            onChange={() => toggleRowSelection(index)}
            onClick={(e) => e.stopPropagation()}
          />
          {renderFirstColumn && renderFirstColumn(row, index)}
        </div>
      );
    }
    return renderFirstColumn ? renderFirstColumn(row, index) : null;
  };

  const getRowBgColor = (index: number) => {
    return index % 2 === 0 ? 'white' : '#f8fafc';
  };

  return (
    <div className={cn('relative border border-slate-200 rounded-lg bg-white overflow-hidden', className)}>
      {/* Botões de controle */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {enableSelection && onExport && selectedRows.size > 0 && (
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
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (controlledFirstColumnFixed === undefined) {
              setFirstColumnFixed(!firstColumnFixed);
            }
          }}
          className="h-8 w-8 p-0"
          title={actualFirstColumnFixed ? 'Desfixar primeira coluna' : 'Fixar primeira coluna'}
        >
          {actualFirstColumnFixed ? (
            <Pin className="h-4 w-4" />
          ) : (
            <PinOff className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="relative flex">
        {/* Primeira coluna fixa */}
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
            <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: firstColumnWidth }} />
              </colgroup>
              <thead className="bg-slate-50">
                <tr>
                  <th
                    className="h-10 px-4 text-left align-middle font-medium text-slate-700 border-r border-b border-slate-200 bg-slate-50"
                    style={{ height: '40px', padding: '0 16px' }}
                  >
                    {enableSelection ? (
                      <div className="flex items-center gap-2 h-full">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 flex-shrink-0"
                          checked={data.length > 0 && selectedRows.size === data.length}
                          onChange={toggleAllRows}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : renderFirstColumn ? (
                      'Ações'
                    ) : (
                      columns[0]?.label || 'Coluna 1'
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={getRowId ? getRowId(row) : index}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    style={{
                      backgroundColor: getRowBgColor(index),
                      height: 'auto'
                    }}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    <td
                      className="p-3 border-r border-b border-slate-200 align-middle"
                      style={{
                        backgroundColor: getRowBgColor(index),
                        padding: '12px',
                        height: 'auto',
                        verticalAlign: 'middle'
                      }}
                    >
                      {renderFirstColumnContent(row, index)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Conteúdo rolável */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto bg-white"
        >
          <div ref={scrollableContentRef}>
            <table 
              ref={tableRef}
              className="w-full border-collapse" 
              style={{ tableLayout: 'fixed', minWidth: '100%' }}
            >
              <colgroup>
                {actualFirstColumnFixed
                  ? columns.slice(1).map((column) => (
                      <col key={column.id} style={{ width: column.width || '150px' }} />
                    ))
                  : columns.map((column) => (
                      <col key={column.id} style={{ width: column.width || '150px' }} />
                    ))}
              </colgroup>
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  {actualFirstColumnFixed
                    ? columns.slice(1).map((column) => (
                        <th
                          key={column.id}
                          className="h-10 px-4 text-left align-middle font-medium text-slate-700 border-r border-b border-slate-200 whitespace-nowrap bg-slate-50"
                          style={{ 
                            height: '40px', 
                            padding: '0 16px',
                            width: column.width,
                            minWidth: column.minWidth || column.width,
                          }}
                        >
                          {column.label}
                        </th>
                      ))
                    : columns.map((column) => (
                        <th
                          key={column.id}
                          className="h-10 px-4 text-left align-middle font-medium text-slate-700 border-r border-b border-slate-200 whitespace-nowrap bg-slate-50"
                          style={{ 
                            height: '40px', 
                            padding: '0 16px',
                            width: column.width,
                            minWidth: column.minWidth || column.width,
                          }}
                        >
                          {column.label}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={getRowId ? getRowId(row) : index}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    style={{
                      backgroundColor: getRowBgColor(index),
                      height: 'auto'
                    }}
                    onClick={() => onRowClick?.(row, index)}
                  >
                    {actualFirstColumnFixed
                      ? columns.slice(1).map((column) => (
                          <td
                            key={column.id}
                            className="p-3 border-r border-b border-slate-200 align-middle"
                            style={{
                              backgroundColor: getRowBgColor(index),
                              padding: '12px',
                              height: 'auto',
                              verticalAlign: 'middle',
                              width: column.width,
                              minWidth: column.minWidth || column.width,
                            }}
                          >
                            {renderCellContent(row, index, column)}
                          </td>
                        ))
                      : columns.map((column) => (
                          <td
                            key={column.id}
                            className="p-3 border-r border-b border-slate-200 align-middle"
                            style={{
                              backgroundColor: getRowBgColor(index),
                              padding: '12px',
                              height: 'auto',
                              verticalAlign: 'middle',
                              width: column.width,
                              minWidth: column.minWidth || column.width,
                            }}
                          >
                            {renderCellContent(row, index, column)}
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
  );
}
