
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RevenueByRoute } from '@/types/models';

interface PopularRoutesChartProps {
  data: RevenueByRoute[];
  className?: string;
}

const PopularRoutesChart: React.FC<PopularRoutesChartProps> = ({ data, className }) => {
  // Colors for the bars
  const colors = ['#0066bb', '#0088cc', '#00aadd'];

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revenue by Route</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={formatYAxis}
              />
              <YAxis 
                dataKey="routeName" 
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={150}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={formatTooltip}
                contentStyle={{ 
                  borderRadius: '8px', 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="revenue" name="Revenue">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularRoutesChart;
