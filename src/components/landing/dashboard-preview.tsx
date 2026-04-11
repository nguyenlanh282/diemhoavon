'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const data = [
  { month: 'T1', revenue: 120, costs: 280 },
  { month: 'T2', revenue: 180, costs: 285 },
  { month: 'T3', revenue: 240, costs: 290 },
  { month: 'T4', revenue: 290, costs: 295 },
  { month: 'T5', revenue: 318, costs: 300 },
  { month: 'T6', revenue: 380, costs: 305 },
  { month: 'T7', revenue: 430, costs: 310 },
  { month: 'T8', revenue: 495, costs: 315 },
]

type TooltipEntry = { name: string; value: number; color: string }
type TooltipProps = { active?: boolean; payload?: TooltipEntry[]; label?: string }

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-xs shadow-xl">
        <p className="mb-1 font-medium text-slate-400">{label}</p>
        {payload.map((entry: TooltipEntry) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
            {entry.name === 'revenue' ? 'Doanh thu' : 'Chi phí'}:{' '}
            {(entry.value * 1000000).toLocaleString('vi-VN')}₫
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/50">
      {/* Window bar */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 bg-slate-800/50 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-amber-500/70" />
        <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 font-mono text-xs text-slate-500">diemhoavon.vn — Dashboard</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        {[
          {
            label: 'Tổng định phí',
            value: '42.5M ₫',
            delta: null,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/8',
            iconPath:
              'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 0-2 2h-2a2 2 0 0 0-2-2z',
          },
          {
            label: 'Điểm hòa vốn',
            value: '127 đơn',
            delta: '/tháng',
            color: 'text-blue-400',
            bg: 'bg-blue-500/8',
            iconPath: 'M3 3v18h18m-5-15v15M8 12v6m10-10v10',
          },
          {
            label: 'Doanh thu HV',
            value: '318M ₫',
            delta: null,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/8',
            iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
          },
          {
            label: 'Biên lợi nhuận',
            value: '+23.5%',
            delta: '↑ 4.2%',
            color: 'text-amber-400',
            bg: 'bg-amber-500/8',
            iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`${card.bg} rounded-xl border border-slate-700/30 p-3.5`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">{card.label}</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={card.color}
              >
                <path d={card.iconPath} />
              </svg>
            </div>
            <div className={`text-sm font-bold ${card.color}`}>{card.value}</div>
            {card.delta && <div className="mt-0.5 text-[10px] text-slate-500">{card.delta}</div>}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Doanh thu vs Chi phí (triệu ₫)
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Doanh thu
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-400/70" /> Chi phí
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={300}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'HV', fill: '#10b981', fontSize: 9 }}
              />
              <Area
                type="monotone"
                dataKey="costs"
                stroke="#f87171"
                strokeWidth={1.5}
                fill="url(#colorCosts)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorRevenue)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
