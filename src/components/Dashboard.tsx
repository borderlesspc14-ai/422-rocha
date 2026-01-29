import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { useMemo } from 'react';
import { Processo } from '@/types/comex';

interface DashboardProps {
  processos: Processo[];
}

export function Dashboard({ processos }: DashboardProps) {
  const metrics = useMemo(() => {
    const emTransito = processos.filter((p) => p.status === 'em_transito').length;
    const alfandega = processos.filter((p) => p.status === 'alfandega').length;
    
    const hoje = new Date();
    const proximaSemana = new Date(hoje);
    proximaSemana.setDate(hoje.getDate() + 7);
    
    const entregasSemana = processos.filter((p) => {
      const dataPrevisao = new Date(p.dataPrevisao);
      return dataPrevisao >= hoje && dataPrevisao <= proximaSemana;
    }).length;

    const totalProcessos = processos.length;

    return {
      totalProcessos,
      emTransito,
      alfandega,
      entregasSemana,
    };
  }, [processos]);

  const widgets = [
    {
      title: 'Total de Processos',
      value: metrics.totalProcessos,
      icon: Package,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Em Trânsito',
      value: metrics.emTransito,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Na Alfândega',
      value: metrics.alfandega,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Entregas na Semana',
      value: metrics.entregasSemana,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Visão geral dos processos de importação e exportação</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {widgets.map((widget) => {
          const Icon = widget.icon;
          return (
            <Card key={widget.title} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {widget.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${widget.bgColor}`}>
                  <Icon className={`h-5 w-5 ${widget.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{widget.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

