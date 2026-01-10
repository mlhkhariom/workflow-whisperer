import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useProducts } from '@/hooks/useN8nData';

export function StockBarChart() {
  const { data: products = [] } = useProducts();

  const stockData = [
    { 
      name: 'In Stock', 
      count: products.filter(p => p.status === 'active').length,
      color: 'hsl(var(--success))'
    },
    { 
      name: 'Low Stock', 
      count: products.filter(p => p.status === 'low_stock').length,
      color: 'hsl(var(--warning))'
    },
    { 
      name: 'Out of Stock', 
      count: products.filter(p => p.status === 'out_of_stock').length,
      color: 'hsl(var(--destructive))'
    },
  ];

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No stock data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={stockData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={80}
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          formatter={(value: number) => [`${value} products`, 'Count']}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
          {stockData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
