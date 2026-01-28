import { useQuery } from '@tanstack/react-query';
import {
    Building2,
    Euro,
    AlertTriangle,
    FileText,
    Calendar,
    LogOut,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { formatCurrency } from '../lib/utils';
import type { DashboardStats, PriorityItem, CondominiumRisk } from '@condoflow/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const { data: stats } = useQuery<DashboardStats>({
        queryKey: ['dashboard', 'stats'],
        queryFn: () => apiClient.get<DashboardStats>('/dashboard/stats').then(res => res.data),
    });

    const { data: priorities = [] } = useQuery<PriorityItem[]>({
        queryKey: ['dashboard', 'priorities'],
        queryFn: () => apiClient.get<PriorityItem[]>('/dashboard/priorities').then(res => res.data),
    });

    const { data: atRisk = [] } = useQuery<CondominiumRisk[]>({
        queryKey: ['dashboard', 'at-risk'],
        queryFn: () => apiClient.get<CondominiumRisk[]>('/dashboard/at-risk').then(res => res.data),
    });

    const handleLogout = () => {
        apiClient.logout();
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">CondoFlow</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.role}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                                <LogOut className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Visão geral e indicadores de performance.</p>
                    </div>
                    <div className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm">
                        {new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Primary KPIs - Financial */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Saldo Global</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                        {stats ? formatCurrency(stats.globalBalance) : '—'}
                                    </h3>
                                    <div className="flex items-center mt-2 text-sm text-green-600 font-medium bg-green-50 w-fit px-2 py-1 rounded-full">
                                        <TrendingUp className="w-4 h-4 mr-1" />
                                        <span>Saudável</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Euro className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Dívidas Totais</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                        {stats ? formatCurrency(stats.totalDebt) : '—'}
                                    </h3>
                                    <div className="flex items-center mt-2 text-sm text-red-600 font-medium bg-red-50 w-fit px-2 py-1 rounded-full">
                                        <TrendingDown className="w-4 h-4 mr-1" />
                                        <span>A recuperar</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <Euro className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary KPIs - Operational */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm hover:border-blue-200 transition-colors cursor-pointer" onClick={() => navigate('/occurrences')}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Ocorrências Abertas</p>
                                <p className="text-2xl font-bold">{stats?.openOccurrences || 0}</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:border-orange-200 transition-colors cursor-pointer" onClick={() => navigate('/occurrences')}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Urgências</p>
                                <p className="text-2xl font-bold text-orange-600">{stats?.urgentOccurrences || 0}</p>
                            </div>
                            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:border-purple-200 transition-colors cursor-pointer" onClick={() => navigate('/assemblies')}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Assembleias Pendentes</p>
                                <p className="text-2xl font-bold">{stats?.pendingAssemblies || 0}</p>
                            </div>
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Operational Blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Foco do Dia (2/3) */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                Foco do Dia
                            </CardTitle>
                            <CardDescription>Tarefas prioritárias que requerem sua atenção hoje.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {priorities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-gray-50/50 rounded-lg border border-dashed">
                                    <CheckCircle2 className="h-10 w-10 mb-3 opacity-20" />
                                    <p>Tudo em dia! Sem prioridades urgentes.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {priorities.slice(0, 5).map((priority) => (
                                        <div
                                            key={priority.id}
                                            className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-accent transition-all"
                                        >
                                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${priority.urgency === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                priority.urgency === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                                                }`} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                        {priority.title}
                                                    </h4>
                                                    {priority.dueDate && (
                                                        <Badge variant="outline" className="text-xs font-normal text-muted-foreground whitespace-nowrap">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            {new Date(priority.dueDate).toLocaleDateString('pt-PT')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                    {priority.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Badge variant="secondary" className="text-[10px] px-2 h-5">
                                                        {priority.condominiumName}
                                                    </Badge>
                                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary ml-auto">
                                                        Ver detalhes <ArrowRight className="w-3 h-3 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Monitorização de Risco (1/3) */}
                    <Card className="shadow-sm border-orange-200 bg-orange-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900 text-xl">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                Risco Elevado
                            </CardTitle>
                            <CardDescription className="text-orange-700/80">Condomínios com indicadores críticos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {atRisk.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <p>Nenhum condomínio em risco.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {atRisk.slice(0, 5).map((condo) => (
                                        <div
                                            key={condo.id}
                                            className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h5 className="font-medium text-sm text-gray-900 line-clamp-1" title={condo.name}>
                                                    {condo.name}
                                                </h5>
                                                <Badge variant={condo.riskLevel === 'CRITICAL' ? 'destructive' : 'warning'} className="text-[10px] px-1.5 h-5">
                                                    {condo.riskLevel}
                                                </Badge>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Dívida Total</span>
                                                    <span className="font-medium text-red-600">{formatCurrency(condo.debtTotal)}</span>
                                                </div>
                                                {condo.urgentOccurrences > 0 && (
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-muted-foreground">Urgências</span>
                                                        <span className="font-medium text-orange-600 flex items-center">
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            {condo.urgentOccurrences}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <Button variant="ghost" size="sm" className="w-full mt-3 h-7 text-xs" onClick={() => navigate(`/condominiums/${condo.id}`)}>
                                                Gerir Condomínio
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* System Status - Subtle Footer */}
                <div className="mt-8 border-t pt-6">
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                        <div className="bg-blue-100 p-1.5 rounded-full shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-blue-900">Status do Sistema</h4>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                Backend operacional. Dashboard em modo de pré-visualização.
                                Próximas atualizações incluirão relatórios detalhados e automação de cobranças.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
