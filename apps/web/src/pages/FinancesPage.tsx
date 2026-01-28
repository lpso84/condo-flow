import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Plus,
    RefreshCcw,
    FileText,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { FinanceSummaryCards } from '@/components/finance/FinanceSummaryCards';
import { FinanceFilterBar } from '@/components/finance/FinanceFilterBar';
import { FinanceTable } from '@/components/finance/FinanceTable';
import { TransactionDrawer } from '@/components/finance/TransactionDrawer';
import { TransactionModal } from '@/components/finance/TransactionModal';
import type { Transaction, Condominium, PaginatedResponse, TransactionInput } from '@condoflow/shared';

export default function FinancesPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<any>({ page: 1, pageSize: 25 });

    // State for modals/drawers
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'RECEITA' | 'DESPESA'>('RECEITA');

    // Data Fetching
    const { data, isLoading, refetch } = useQuery<PaginatedResponse<Transaction>>({
        queryKey: ['transactions-global', filters],
        queryFn: () => apiClient.get('/transactions', filters),
    });

    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ['transactions-summary', filters],
        queryFn: () => apiClient.get('/transactions/summary', {
            condominiumId: filters.condominiumId,
            from: filters.from,
            to: filters.to
        }),
    }) as { data: { totalRevenue: number; totalExpenses: number; balance: number; count: number; } | undefined, isLoading: boolean };

    const { data: condosData } = useQuery<PaginatedResponse<Condominium>>({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get('/condominiums', { pageSize: 100 }),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: TransactionInput) => apiClient.post('/transactions', data),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Movimento registado com sucesso.' });
            queryClient.invalidateQueries({ queryKey: ['transactions-global'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
            setIsCreateModalOpen(false);
        },
        onError: () => toast({ title: 'Erro', description: 'Erro ao registar movimento.', variant: 'destructive' })
    });

    const updateMutation = useMutation({
        mutationFn: (data: TransactionInput) => apiClient.put(`/ transactions / ${selectedTransaction?.id} `, data),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Movimento atualizado com sucesso.' });
            queryClient.invalidateQueries({ queryKey: ['transactions-global'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
            setIsEditModalOpen(false);
        },
        onError: () => toast({ title: 'Erro', description: 'Erro ao atualizar movimento.', variant: 'destructive' })
    });

    const cancelMutation = useMutation({
        mutationFn: (id: string) => apiClient.post(`/ transactions / ${id}/cancel`),
        onSuccess: () => {
            toast({ title: 'Movimento Anulado', description: 'O movimento foi anulado e o saldo revertido.' });
            queryClient.invalidateQueries({ queryKey: ['transactions-global'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
        },
        onError: () => toast({ title: 'Erro', description: 'Não foi possível anular o movimento.', variant: 'destructive' })
    });

    // Handlers
    const handleView = (t: Transaction) => {
        setSelectedTransaction(t);
        setIsDetailOpen(true);
    };

    const handleEdit = (t: Transaction) => {
        setSelectedTransaction(t);
        setIsEditModalOpen(true);
    };

    const handleCancel = (t: Transaction) => {
        if (confirm('Tem a certeza que pretende anular este movimento? Esta ação irá reverter o saldo do condomínio.')) {
            cancelMutation.mutate(t.id);
        }
    };

    const handleExport = () => {
        const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        window.open(`${baseUrl}/transactions/export?token=${token}`, '_blank');
    };

    const openCreateModal = (type: 'RECEITA' | 'DESPESA') => {
        setTransactionType(type);
        setIsCreateModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">Gestão Financeira Global</h1>
                    <p className="text-muted-foreground text-lg">
                        Controlo transversal de receitas, despesas e fluxos de caixa de toda a carteira.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <FileText className="h-4 w-4" /> Exportar CSV
                    </Button>
                    <Button variant="outline" className="gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => openCreateModal('RECEITA')}>
                        <Plus className="h-4 w-4" /> Registar Receita
                    </Button>
                    <Button className="gap-2 bg-slate-900 dark:bg-slate-50 dark:text-slate-900" onClick={() => openCreateModal('DESPESA')}>
                        <Plus className="h-4 w-4" /> Registar Despesa
                    </Button>
                </div>
            </div>

            {/* Insights Cards */}
            <FinanceSummaryCards summary={summary} isLoading={isLoadingSummary} />

            {/* Filters */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FinanceFilterBar
                    filters={filters}
                    setFilters={setFilters}
                    condominiums={condosData?.data || []}
                />
            </div>

            {/* Table section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Movimentos Recentes
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => refetch()}>
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </h2>
                    <div className="text-sm text-muted-foreground">
                        Mostrando {data?.data?.length || 0} de {data?.total || 0} movimentos
                    </div>
                </div>

                <FinanceTable
                    transactions={data?.data || []}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                />

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            disabled={filters.page === 1}
                            onClick={() => setFilters((f: any) => ({ ...f, page: f.page - 1 }))}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm font-medium">Página {filters.page} de {data.totalPages}</span>
                        <Button
                            variant="outline"
                            disabled={filters.page === data.totalPages}
                            onClick={() => setFilters((f: any) => ({ ...f, page: f.page + 1 }))}
                        >
                            Próxima
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals & Drawers */}
            <TransactionDrawer
                transaction={selectedTransaction}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            <TransactionModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSubmit={(data) => createMutation.mutate(data)}
                isSubmitting={createMutation.isPending}
                type={transactionType}
            />

            <TransactionModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                initialData={selectedTransaction}
                onSubmit={(data) => updateMutation.mutate(data)}
                isSubmitting={updateMutation.isPending}
            />
        </div>
    );
}
