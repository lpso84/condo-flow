import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, CheckCircle2, History, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OccurrenceStatsProps {
    condominiumId?: string;
    onFilterClick: (status: string, overdue?: boolean) => void;
}

interface OccurrenceStatsData {
    open: number;
    urgent: number;
    execution: number;
    resolvedRecent: number;
    overdue: number;
}

export function OccurrenceStats({ condominiumId, onFilterClick }: OccurrenceStatsProps) {
    const { data: stats, isLoading } = useQuery<OccurrenceStatsData>({
        queryKey: ['occurrence-stats', condominiumId],
        queryFn: () => apiClient.get<OccurrenceStatsData>('/occurrences/stats', { condominiumId }).then(res => res.data),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <Skeleton className="h-4 w-[100px]" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[60px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const { open, urgent, execution, resolvedRecent, overdue } = stats || {
        open: 0,
        urgent: 0,
        execution: 0,
        resolvedRecent: 0,
        overdue: 0,
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-blue-500"
                onClick={() => onFilterClick('ABERTA')}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Abertas</CardTitle>
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{open}</div>
                    <p className="text-xs text-muted-foreground">Novas ocorrências</p>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-red-500"
                onClick={() => onFilterClick('URGENTE')} // Should map to priority filter not status
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-destructive">Urgentes</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">{urgent}</div>
                    <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-orange-500"
                onClick={() => onFilterClick('EM_EXECUCAO')}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-600">Em Execução</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{execution}</div>
                    <p className="text-xs text-muted-foreground">Sendo resolvidas</p>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-amber-500"
                onClick={() => onFilterClick('OVERDUE', true)}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-600">Atrasadas</CardTitle>
                    <History className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{overdue}</div>
                    <p className="text-xs text-muted-foreground">Fora do prazo SLA</p>
                </CardContent>
            </Card>

            <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-green-500"
                onClick={() => onFilterClick('RESOLVIDA')}
            >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-600">Resolvidas</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{resolvedRecent}</div>
                    <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
                </CardContent>
            </Card>
        </div>
    );
}
