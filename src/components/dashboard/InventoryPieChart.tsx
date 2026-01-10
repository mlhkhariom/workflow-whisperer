import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useProducts } from '@/hooks/useN8nData';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'];

export function InventoryPieChart() {
  const { data: products = [] } = useProducts();

  const categoryData = [
    { name: 'Laptops', value: products.filter(p => p.category === 'laptops').length },
    { name: 'Desktops', value: products.filter(p => p.category === 'desktops').length },
    { name: 'Accessories', value: products.filter(p => p.category === 'accessories').length },
  ].filter(d => d.value > 0);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No products to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {categoryData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
