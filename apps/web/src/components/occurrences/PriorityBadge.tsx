import { Badge } from '@/components/ui/badge';
import { OccurrencePriority } from '@condoflow/shared';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
    priority: OccurrencePriority;
    showIcon?: boolean;
}

export function PriorityBadge({ priority, showIcon = true }: PriorityBadgeProps) {
    switch (priority) {
        case 'URGENTE':
            return (
                <Badge variant="destructive" className="flex items-center gap-1">
                    {showIcon && <AlertCircle className="h-3 w-3" />}
                    Urgente
                </Badge>
            );
        case 'NORMAL':
            return (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 flex items-center gap-1">
                    {showIcon && <ArrowRight className="h-3 w-3" />}
                    Normal
                </Badge>
            );
        default:
            return <Badge variant="outline">{priority}</Badge>;
    }
}

export function PriorityIcon({ priority, className }: { priority: string; className?: string }) {
    switch (priority) {
        case 'URGENTE':
            return <AlertCircle className={`text-destructive ${className}`} />;
        case 'ALTA':
            return <ArrowUp className={`text-orange-500 ${className}`} />;
        case 'NORMAL':
            return <ArrowRight className={`text-blue-500 ${className}`} />;
        case 'BAIXA':
            return <ArrowDown className={`text-slate-400 ${className}`} />;
        default:
            return null;
    }
}
