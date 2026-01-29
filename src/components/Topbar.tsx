import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  pageTitle?: string;
  showSearch?: boolean;
  showNewButton?: boolean;
  onNewClick?: () => void;
  sidebarCollapsed?: boolean;
}

export function Topbar({ pageTitle, showSearch = true, showNewButton = false, onNewClick, sidebarCollapsed = false }: TopbarProps) {
  return (
    <header className={`fixed top-0 right-0 h-16 border-b border-slate-200 bg-white transition-all duration-300 z-10 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex h-full items-center justify-between gap-4 px-6">
        {pageTitle && (
          <h2 className="text-lg font-semibold text-slate-900">{pageTitle}</h2>
        )}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {showSearch && (
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="search"
                placeholder="Buscar por referência, cliente..."
                className="pl-10"
              />
            </div>
          )}
          {showNewButton && (
            <Button onClick={onNewClick} className="bg-blue-600 hover:bg-blue-700">
              + Nova Carga
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

