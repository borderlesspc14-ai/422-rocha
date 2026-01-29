import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, Eye, Grid } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Mapaseg() {
  const [pesquisa, setPesquisa] = useState('');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">MAPASEG</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Criar projeto
        </Button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Pesquisar..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">Pessoa</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtro
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Filtro por Status</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordenar
        </Button>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Ocultar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Grid className="h-4 w-4 mr-2" />
              Agrupar por
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Categoria</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border border-slate-200 rounded-lg bg-white p-8 text-center text-slate-500">
        Nenhum projeto cadastrado
      </div>
    </div>
  );
}

