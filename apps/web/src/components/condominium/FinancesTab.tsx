import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CreateTransactionDialog } from './CreateTransactionDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Euro,
    TrendingUp,
    TrendingDown,
    Wallet
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Transaction, PaginatedResponse } from '@condoflow/shared';

interface FinancesTabProps {
    condominiumId: string;
}

export function FinancesTab({ condominiumId }: FinancesTabProps) {
    const [search, setSearch] = useState('');
    const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
    const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);

    const { data, isLoading } = useQuery<PaginatedResponse<Transaction>>({
        queryKey: ['condominium-transactions', condominiumId, search],
        queryFn: () => apiClient.get<PaginatedResponse<Transaction>>('/transactions', { condominiumId, search: search || undefined, pageSize: 50 }).then(res => res.data),
    });

    const transactions = data?.data || [];

    const stats = useMemo(() => {
        const income = transactions.filter(t => t.type === 'RECEITA').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'DESPESA').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, balance: income - expense };
    }, [transactions]);

    return (
        <div className="space-y-8">
            {/* Financial Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-green-50/50 border-green-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-700">Total Receitas</p>
                            <p className="text-xl font-black text-green-900">{formatCurrency(stats.income)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/50 border-red-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Total Despesas</p>
                            <p className="text-xl font-black text-red-900">{formatCurrency(stats.expense)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50/50 border-blue-100 shadow-none">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Saldo Período</p>
                            <p className="text-xl font-black text-blue-900">{formatCurrency(stats.balance)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar movimentos..."
                            className="pl-9 h-10 font-medium border-gray-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-bold h-10 border-gray-200">
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                    <Button size="sm" variant="outline" className="font-bold h-10 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setIsExpenseDialogOpen(true)}>
                        <ArrowUpRight className="mr-2 h-4 w-4" /> Registar Despesa
                    </Button>
                    <Button size="sm" className="font-bold h-10 bg-green-600 hover:bg-green-700" onClick={() => setIsIncomeDialogOpen(true)}>
                        <ArrowDownLeft className="mr-2 h-4 w-4" /> Registar Receita
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest">Data</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Descrição</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Categoria</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={4} className="h-16 bg-gray-50/30" />
                                </TableRow>
                            ))
                        ) : transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Euro className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">Nenhum movimento financeiro encontrado.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="text-sm font-medium text-gray-500">
                                        {format(new Date(transaction.date), "dd/MM/yyyy", { locale: pt })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-900">{transaction.description}</span>
                                            {transaction.fraction && (
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Fração {transaction.fraction.number}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter border-gray-200">
                                            {transaction.category.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-black tabular-nums",
                                        transaction.type === 'DESPESA' ? 'text-red-600' : 'text-green-600'
                                    )}>
                                        {transaction.type === 'DESPESA' ? '-' : '+'}
                                        {formatCurrency(transaction.amount)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateTransactionDialog
                open={isExpenseDialogOpen}
                onOpenChange={setIsExpenseDialogOpen}
                condominiumId={condominiumId}
                type="DESPESA"
            />
            <CreateTransactionDialog
                open={isIncomeDialogOpen}
                onOpenChange={setIsIncomeDialogOpen}
                condominiumId={condominiumId}
                type="RECEITA"
            />
        </div>
    );
}
