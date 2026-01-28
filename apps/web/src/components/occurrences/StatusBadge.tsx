import { Badge } from '@/components/ui/badge';
import { OccurrenceStatus } from '@condoflow/shared';

interface StatusBadgeProps {
    status: OccurrenceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case 'ABERTA':
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Aberta
                </Badge>
            );
        case 'EM_ANALISE':
            return (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Em Análise
                </Badge>
            );
        case 'EM_EXECUCAO':
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    Em Execução
                </Badge>
            );
        case 'RESOLVIDA':
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Resolvida
                </Badge>
            );
        case 'ARQUIVADA':
            return (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                    Arquivada
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
