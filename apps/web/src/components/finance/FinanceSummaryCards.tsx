import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Hash } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface FinanceSummaryCardsProps {
    summary?: {
        totalRevenue: number;
        totalExpenses: number;
        balance: number;
        count: number;
    };
    isLoading: boolean;
}

export function FinanceSummaryCards({ summary, isLoading }: FinanceSummaryCardsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Receitas',
            value: formatCurrency(summary?.totalRevenue || 0),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
            trendIcon: ArrowUpRight,
        },
        {
            title: 'Total Despesas',
            value: formatCurrency(summary?.totalExpenses || 0),
            icon: TrendingDown,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50 dark:bg-rose-950/30',
            trendIcon: ArrowDownRight,
        },
        {
            title: 'Saldo do Período',
            value: formatCurrency(summary?.balance || 0),
            icon: Wallet,
            color: (summary?.balance || 0) >= 0 ? 'text-blue-600' : 'text-amber-600',
            bgColor: (summary?.balance || 0) >= 0 ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-amber-50 dark:bg-amber-950/30',
        },
        {
            title: 'Nº Movimentos',
            value: summary?.count || 0,
            icon: Hash,
            color: 'text-slate-600',
            bgColor: 'bg-slate-50 dark:bg-slate-900',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="overflow-hidden border-none shadow-md ring-1 ring-slate-200 dark:ring-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                            <card.icon className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-bold">{card.value}</div>
                            {card.trendIcon && (
                                <card.trendIcon className={`h-4 w-4 ${card.color}`} />
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

