import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Cargas } from '@/pages/Cargas';
import { Rocha2025 } from '@/pages/Rocha2025';
import { Faturamento2025 } from '@/pages/Faturamento2025';
import { Finalizados } from '@/pages/Finalizados';
import { TarefasPendencias } from '@/pages/TarefasPendencias';
import { Inicio } from '@/pages/Inicio';
import { MeuTrabalho } from '@/pages/MeuTrabalho';
import { AnotadorIA } from '@/pages/AnotadorIA';
import { Mais } from '@/pages/Mais';
import { TabelaGenerica } from '@/pages/TabelaGenerica';
import { Toaster } from '@/components/ui/toaster';
import { Processo, Cliente } from '@/types/comex';
import { processosMock, clientesMock } from '@/lib/mock-data';

function AppContent() {
  const location = useLocation();
  const [processos, setProcessos] = useState<Processo[]>(processosMock);
  const [clientes] = useState<Cliente[]>(clientesMock);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const getPageTitle = () => {
    if (location.pathname === '/rocha-2025' || location.pathname === '/cargas' || location.pathname === '/') return 'Cargas';
    if (location.pathname === '/faturamento-2025') return 'Faturamento 2025';
    if (location.pathname === '/finalizados') return 'Finalizados';
    if (location.pathname === '/tarefas-pendencias') return 'Tarefas - Pendencias';
    if (location.pathname === '/inicio') return 'Página inicial';
    if (location.pathname === '/meu-trabalho') return 'Meu trabalho';
    if (location.pathname === '/anotador-ia') return 'Anotador de IA';
    if (location.pathname === '/mais') return 'Mais';
    return undefined;
  };

  const showNewButton = location.pathname === '/rocha-2025' || location.pathname === '/cargas' || location.pathname === '/';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      {/* Overlay para fechar sidebar quando clicado fora (opcional) */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      {/* Área clicável na borda esquerda para expandir sidebar quando colapsada */}
      {sidebarCollapsed && (
        <div 
          className="fixed left-0 top-0 bottom-0 w-2 z-30 hover:bg-blue-500/20 cursor-pointer transition-colors group"
          onClick={toggleSidebar}
          title="Clique para expandir sidebar"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </div>
        </div>
      )}
      <div className={sidebarCollapsed ? 'ml-20 flex-1 transition-all duration-300' : 'ml-64 flex-1 transition-all duration-300'}>
        <Topbar 
          pageTitle={getPageTitle()}
          showSearch={location.pathname === '/rocha-2025' || location.pathname === '/cargas' || location.pathname === '/'}
          showNewButton={showNewButton}
          sidebarCollapsed={sidebarCollapsed}
          onNewClick={() => {
            if ((window as any).openNewCargaModal) {
              (window as any).openNewCargaModal();
            }
          }}
        />
        <main className="mt-16 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/rocha-2025" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/meu-trabalho" element={<MeuTrabalho />} />
            <Route path="/anotador-ia" element={<AnotadorIA />} />
            <Route path="/mais" element={<Mais />} />
            <Route
              path="/rocha-2025"
              element={
                <Rocha2025
                  processos={processos}
                  clientes={clientes}
                  onProcessosChange={setProcessos}
                />
              }
            />
            <Route
              path="/cargas"
              element={
                <Cargas
                  processos={processos}
                  clientes={clientes}
                  onProcessosChange={setProcessos}
                />
              }
            />
            <Route path="/faturamento-2025" element={<Faturamento2025 />} />
            <Route path="/finalizados" element={<Finalizados />} />
            <Route path="/tarefas-pendencias" element={<TarefasPendencias />} />
            <Route path="/:tabelaId" element={<TabelaGenerica />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
