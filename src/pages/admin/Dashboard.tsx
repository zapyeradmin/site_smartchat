import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, CheckSquare, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalClients: number;
  activeDeals: number;
  pendingTasks: number;
  monthlyRevenue: number;
}

const Dashboard = () => {
  const [salesData, setSalesData] = useState([
    { month: 'Jan', positivos: 4000, negativos: -1200 },
    { month: 'Fev', positivos: 3000, negativos: -800 },
    { month: 'Mar', positivos: 5000, negativos: -1500 },
    { month: 'Abr', positivos: 2780, negativos: -900 },
    { month: 'Mai', positivos: 4200, negativos: -1100 },
    { month: 'Jun', positivos: 3800, negativos: -700 },
  ]);

  const [dealStages, setDealStages] = useState([
    { name: 'Leads', value: 0, color: '#3b82f6' },
    { name: 'Propostas', value: 0, color: '#eab308' },
    { name: 'Negociação', value: 0, color: '#f97316' },
    { name: 'Fechados', value: 0, color: '#22c55e' },
  ]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalClients: 0,
    activeDeals: 0,
    pendingTasks: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients count
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch active deals count
      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .in('stage', ['lead', 'proposal', 'negotiation']);

      // Fetch pending tasks count
      const { count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate monthly revenue
      const { data: closedDeals } = await supabase
        .from('deals')
        .select('value')
        .eq('stage', 'closed_won')
        .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const monthlyRevenue = closedDeals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;

      // Fetch real deal stages data
      const { data: dealStagesData } = await supabase
        .from('deals')
        .select('stage')
        .neq('stage', 'closed_lost');

      const stagesCounts = dealStagesData?.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setDealStages([
        { name: 'Leads', value: stagesCounts.lead || 0, color: '#3b82f6' },
        { name: 'Propostas', value: stagesCounts.proposal || 0, color: '#eab308' },
        { name: 'Negociação', value: stagesCounts.negotiation || 0, color: '#f97316' },
        { name: 'Fechados', value: stagesCounts.closed_won || 0, color: '#22c55e' },
      ]);

      // Fetch recent activity (real data)
      const { data: recentClients } = await supabase
        .from('clients')
        .select('name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentDeals } = await supabase
        .from('deals')
        .select('title, stage, updated_at')
        .order('updated_at', { ascending: false })
        .limit(3);

      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('title, status, due_date')
        .order('created_at', { ascending: false })
        .limit(3);

      // Combine and format recent activity
      const activities = [
        ...(recentClients?.map(client => ({
          type: 'client',
          title: `Novo cliente: ${client.name}`,
          time: new Date(client.created_at).toLocaleString('pt-BR'),
          color: 'green'
        })) || []),
        ...(recentDeals?.map(deal => ({
          type: 'deal',
          title: `Negócio atualizado: ${deal.title}`,
          time: new Date(deal.updated_at).toLocaleString('pt-BR'),
          color: 'blue'
        })) || []),
        ...(recentTasks?.map(task => ({
          type: 'task',
          title: `Tarefa: ${task.title}`,
          time: task.due_date ? new Date(task.due_date).toLocaleString('pt-BR') : 'Sem prazo',
          color: 'orange'
        })) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setRecentActivity(activities);

      setMetrics({
        totalClients: clientsCount || 0,
        activeDeals: dealsCount || 0,
        pendingTasks: tasksCount || 0,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, description, icon: Icon, trend }: any) => (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {loading ? '...' : value}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
          {trend && (
            <Badge 
              variant={trend > 0 ? "default" : "secondary"} 
              className={`text-xs ${trend > 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
            >
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl -z-10"></div>
        <div className="p-6 rounded-xl">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Visão geral do seu negócio e métricas importantes
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Clientes"
          value={metrics.totalClients}
          description="clientes ativos"
          icon={Users}
          trend={12}
        />
        <MetricCard
          title="Negócios Ativos"
          value={metrics.activeDeals}
          description="em andamento"
          icon={Briefcase}
          trend={5}
        />
        <MetricCard
          title="Tarefas Pendentes"
          value={metrics.pendingTasks}
          description="para hoje"
          icon={CheckSquare}
          trend={-2}
        />
        <MetricCard
          title="Receita Mensal"
          value={`R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR')}`}
          description="este mês"
          icon={DollarSign}
          trend={18}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Chart */}
        <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Resultados Mensais
            </CardTitle>
            <CardDescription>
              Evolução de resultados positivos e negativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="positivos" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Resultados Positivos"
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="negativos" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Resultados Negativos"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Chart */}
        <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              Pipeline de Negócios
            </CardTitle>
            <CardDescription>
              Distribuição dos negócios por estágio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dealStages}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dealStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 border border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg border border-primary/10 hover:border-primary/20 transition-colors">
                  <div className={`h-3 w-3 rounded-full ${
                    activity.color === 'green' ? 'bg-green-500' : 
                    activity.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
                  } animate-pulse`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;