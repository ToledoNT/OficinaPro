'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Car, Bike, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardChartsProps {
  carsCount: number;
  motosCount: number;
  budgetsStatusData: {
    status: string;
    label: string;
    count: number;
    amount: number;
    color: string;
  }[];
}

export default function DashboardCharts({
  carsCount,
  motosCount,
  budgetsStatusData,
}: DashboardChartsProps) {
  const vehicleData = [
    { name: 'Carros', value: carsCount, color: '#3b82f6' },
    { name: 'Motos', value: motosCount, color: '#10b981' },
  ];

  const totalFleet = carsCount + motosCount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Veículos: Carros vs Motos */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Frota Atendida</h3>
              <p className="text-xs text-slate-400">Distribuição entre Carros e Motos</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/50">
            Total: {totalFleet} veículos
          </span>
        </div>

        <div className="h-64 w-full flex items-center justify-center my-2">
          {totalFleet === 0 ? (
            <div className="text-xs text-slate-500">Nenhum veículo cadastrado</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => {
                    const numVal = typeof value === 'number' ? value : 0;
                    return [`${numVal} veículos (${totalFleet > 0 ? ((numVal / totalFleet) * 100).toFixed(0) : 0}%)`, 'Quantidade'];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <Car className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-slate-300">Carros</span>
            </div>
            <span className="text-sm font-bold text-white">{carsCount}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <Bike className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Motos</span>
            </div>
            <span className="text-sm font-bold text-white">{motosCount}</span>
          </div>
        </div>
      </div>

      {/* Orçamentos por Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Status dos Orçamentos</h3>
              <p className="text-xs text-slate-400">Volume e fluxo de orçamentos gerados</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetsStatusData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(value: unknown, _name: unknown, props: { payload?: { amount?: number } }) => [
                  `${value} orçamento(s) • Total: ${formatCurrency(props?.payload?.amount || 0)}`,
                  'Volume',
                ]}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {budgetsStatusData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status mini summary */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
          {budgetsStatusData.slice(0, 3).map((item) => (
            <div key={item.status} className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/50">
              <div className="text-[11px] text-slate-400 truncate">{item.label}</div>
              <div className="text-xs font-semibold text-white mt-0.5">{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
