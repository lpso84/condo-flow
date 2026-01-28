import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertTriangle,
    Euro,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    ArrowRight,
    Plus,
    Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Condominium } from '@condoflow/shared';

interface OverviewTabProps {
    condo: Condominium;
    onTabChange: (tab: string) => void;
}

export function OverviewTab({ condo, onTabChange }: OverviewTabProps) {
    const { data: activity, isLoading } = useQuery<any[]>({
        queryKey: ['condominium-activity', condo.id],
        queryFn: () => apiClient.get(`/condominiums/${condo.id}/activity`),
    });

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'OCCURRENCE': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'TRANSACTION': return <Euro className="h-4 w-4 text-green-500" />;
            case 'DOCUMENT': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'ASSEMBLY': return <Calendar className="h-4 w-4 text-purple-500" />;
            default: return <Activity className="h-4 w-4 text-gray-500" />;
        }
    };

    const getActivityText = (item: any) => {
        const data = item.data;
        switch (item.type) {
            case 'OCCURRENCE':
                return (
                    <span>
                        Nova ocorrência: <span className="font-bold">{data.title}</span>
                        {data.fraction && ` na fração ${data.fraction.number}`}
                    </span>
                );
            case 'TRANSACTION':
                return (
                    <span>
                        {data.type === 'RECEITA' ? 'Receita' : 'Despesa'} registada:
                        <span className="font-bold"> {formatCurrency(data.amount)}</span> - {data.description}
                    </span>
                );
            case 'DOCUMENT':
                return (
                    <span>
                        Documento adicionado: <span className="font-bold">{data.title}</span>
                    </span>
                );
            case 'ASSEMBLY':
                return (
                    <span>
                        Assembleia {data.status === 'AGENDADA' ? 'agendada' : 'atualizada'} para
                        <span className="font-bold"> {data.scheduledDate ? format(new Date(data.scheduledDate), "d 'de' MMMM", { locale: pt }) : 'TBD'}</span>
                    </span>
                );
            default:
                return 'Atividade desconhecida';
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Activity Feed */}
            <Card className="col-span-4 shadow-sm border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-black uppercase tracking-widest text-gray-700 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Atividade Recente
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:text-primary/80">
                        Ver Tudo <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                                        <div className="h-3 bg-gray-50 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activity && activity.length > 0 ? (
                        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                            {activity.map((item) => (
                                <div key={item.id} className="relative flex items-start gap-4 group">
                                    <div className="absolute left-0 mt-1.5 h-8 w-8 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform z-10">
                                        {getActivityIcon(item.type)}
                                    </div>
                                    <div className="flex-1 ml-10">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {getActivityText(item)}
                                            </p>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                                {item.date ? format(new Date(item.date), "d MMM, HH:mm", { locale: pt }) : '---'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                <Activity className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Nenhuma atividade registada recentemente.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alerts & Actions */}
            <div className="col-span-3 space-y-6">
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b pb-3">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-600 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Alertas & Pendentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {condo.urgentOccurrences > 0 && (
                                <div className="p-4 flex items-start gap-3 hover:bg-red-50/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-red-900">Ocorrências Urgentes</p>
                                        <p className="text-xs text-red-700 mt-0.5">Existem {condo.urgentOccurrences} situações críticas que requerem atenção.</p>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-xs font-black text-red-600 uppercase tracking-widest mt-2"
                                            onClick={() => onTabChange('occurrences')}
                                        >
                                            Resolver Agora <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {condo.debtTotal > 1000 && (
                                <div className="p-4 flex items-start gap-3 hover:bg-orange-50/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                        <Euro className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-orange-900">Dívida Elevada</p>
                                        <p className="text-xs text-orange-700 mt-0.5">O valor total em dívida ({formatCurrency(condo.debtTotal)}) está acima do limite.</p>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-xs font-black text-orange-600 uppercase tracking-widest mt-2"
                                            onClick={() => onTabChange('fractions')}
                                        >
                                            Ver Devedores <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!condo.nextAssemblyDate && (
                                <div className="p-4 flex items-start gap-3 hover:bg-blue-50/30 transition-colors">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-blue-900">Agendar Assembleia</p>
                                        <p className="text-xs text-blue-700 mt-0.5">A assembleia anual ainda não foi agendada.</p>
                                        <Button
                                            variant="link"
                                            className="p-0 h-auto text-xs font-black text-blue-600 uppercase tracking-widest mt-2"
                                            onClick={() => onTabChange('assemblies')}
                                        >
                                            Agendar <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {condo.urgentOccurrences === 0 && condo.debtTotal <= 1000 && condo.nextAssemblyDate && (
                                <div className="p-8 text-center">
                                    <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">Tudo em dia!</p>
                                    <p className="text-xs text-muted-foreground mt-1">Não existem alertas pendentes para este condomínio.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Próximos Passos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start text-xs font-bold h-11 border-gray-200 hover:bg-gray-50" onClick={() => onTabChange('finances')}>
                            <Euro className="mr-2 h-4 w-4 text-green-600" /> Registar Receitas do Mês
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-xs font-bold h-11 border-gray-200 hover:bg-gray-50" onClick={() => onTabChange('documents')}>
                            <FileText className="mr-2 h-4 w-4 text-blue-600" /> Carregar Ata da Última Assembleia
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-xs font-bold h-11 border-gray-200 hover:bg-gray-50" onClick={() => onTabChange('occurrences')}>
                            <Plus className="mr-2 h-4 w-4 text-orange-600" /> Reportar Nova Manutenção
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
