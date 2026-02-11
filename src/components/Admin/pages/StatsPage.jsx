import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatsPage = () => {
  const [data, setData] = useState({
    summary: null,
    topProducts: [],
    monthlySales: [],
    categoryPerf: [],
    orderStatus: [],
    weekdaySales: [],
    payments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const API_URL = process.env.VITE_API_URL;
        const baseUrl = `${API_URL}/analytics`; 
        const [summary, products, monthly, categories, status, weekday, payments] = await Promise.all([
          fetch(`${baseUrl}/sales-summary`).then(res => res.json()),
          fetch(`${baseUrl}/top-products`).then(res => res.json()),
          fetch(`${baseUrl}/monthly-sales`).then(res => res.json()),
          fetch(`${baseUrl}/category-performance`).then(res => res.json()),
          fetch(`${baseUrl}/order-status`).then(res => res.json()),
          fetch(`${baseUrl}/sales-by-weekday`).then(res => res.json()),
          fetch(`${baseUrl}/payment-methods`).then(res => res.json()),
        ]);

        setData({
          summary,
          topProducts: products,
          monthlySales: monthly,
          categoryPerf: categories,
          orderStatus: status,
          weekdaySales: weekday,
          payments
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando estadísticas...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>Panel de Analíticas - Repostería</h2>

      {/* Renglón 1: Resumen General (Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <StatCard title="Ventas Mes Actual" value={`$${data.summary?.currentMonth.totalRevenue}`} growth={`${data.summary?.growthRate}%`} />
        <StatCard title="Órdenes del Mes" value={data.summary?.currentMonth.orderCount} />
        <StatCard title="Total Productos" value={data.summary?.totalProducts} />
        <StatCard title="Clientes Activos" value={data.summary?.totalCustomers} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Gráfico 1: Ventas Mensuales (Ingresos) */}
        <ChartContainer title="Ingresos Mensuales ($)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="totalRevenue" stroke="#8884d8" fill="#8884d8" name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico 2: Top Productos por Cantidad Vendida */}
        <ChartContainer title="Productos Más Vendidos (Cant.)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topProducts}>
              <XAxis dataKey="productName" hide />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSold" fill="#82ca9d" name="Unidades Vendidas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico 3: Ventas por Día de la Semana */}
        <ChartContainer title="Actividad por Día">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.weekdaySales}>
              <XAxis dataKey="dayName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orderCount" fill="#FF8042" name="Nro. Pedidos" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico 5: Desempeño por Categoría (Ingresos) */}
        <ChartContainer title="Ingresos por Categoría">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryPerf} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="categoryName" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="totalRevenue" fill="#0088FE" name="Ingresos Totales" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Gráfico 6: Estado de las Órdenes */}
        <ChartContainer title="Estado de Órdenes (%)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.orderStatus} dataKey="percentage" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                {data.orderStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

      </div>
    </div>
  );
};

// Componentes Auxiliares de Estilo
const StatCard = ({ title, value, growth }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{title}</p>
    <h3 style={{ margin: '10px 0 0 0', fontSize: '24px' }}>{value}</h3>
    {growth && <span style={{ color: growth.startsWith('-') ? 'red' : 'green', fontSize: '12px' }}>{growth} vs mes anterior</span>}
  </div>
);

const ChartContainer = ({ title, children }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
    <h4 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>{title}</h4>
    {children}
  </div>
);

export default StatsPage