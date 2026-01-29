/**
 * Exporta dados para CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { id: string; label: string }[],
  filename: string = 'export.csv',
  getCellValue?: (row: T, columnId: string) => any
) {
  if (data.length === 0) {
    alert('Nenhum dado para exportar');
    return;
  }

  // Cabeçalho
  const headers = columns.map((col) => col.label).join(',');
  
  // Linhas de dados
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = getCellValue
          ? getCellValue(row, col.id)
          : row[col.id];
        // Escapa vírgulas e aspas
        const stringValue = String(value || '').replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(',');
  });

  // Conteúdo completo
  const csvContent = [headers, ...rows].join('\n');

  // Cria blob e faz download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exporta dados para Excel (formato CSV com extensão .xlsx)
 * Nota: Para exportação real de Excel, seria necessário uma biblioteca como xlsx
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { id: string; label: string }[],
  filename: string = 'export.xlsx',
  getCellValue?: (row: T, columnId: string) => any
) {
  // Por enquanto, exporta como CSV mas com extensão .xlsx
  // Para exportação real de Excel, instale: npm install xlsx
  exportToCSV(data, columns, filename.replace('.xlsx', '.csv'), getCellValue);
}


