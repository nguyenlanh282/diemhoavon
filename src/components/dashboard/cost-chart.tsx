'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CostChartProps {
  fixedCosts: number
  variableCosts: number
  investmentCosts: number
  locale?: string
}

export function CostChart({
  fixedCosts,
  variableCosts,
  investmentCosts,
  locale = 'vi',
}: CostChartProps) {
  const isVi = locale === 'vi'

  const data = [
    {
      name: isVi ? 'Định phí' : 'Fixed Costs',
      value: fixedCosts,
      color: '#3b82f6',
    },
    {
      name: isVi ? 'Biến phí' : 'Variable Costs',
      value: variableCosts,
      color: '#f97316',
    },
    {
      name: isVi ? 'Khấu hao' : 'Investment',
      value: investmentCosts,
      color: '#8b5cf6',
    },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        {isVi ? 'Chưa có dữ liệu chi phí' : 'No cost data available'}
      </div>
    )
  }

  const formatValue = (value: number) => {
    if (isVi) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value)
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatValue(Number(value || 0))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
