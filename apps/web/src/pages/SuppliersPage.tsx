import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_BASE } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    PlusCircle,
    FileDown,
    RefreshCcw,
    Users,
    Activity,
    Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { SupplierFilterBar } from '@/components/suppliers/SupplierFilterBar';
import { SupplierFormModal } from '@/components/suppliers/SupplierFormModal';
import { SupplierDetailDrawer } from '@/components/suppliers/SupplierDetailDrawer';
import type { Supplier, PaginatedResponse, SupplierInput } from '@condoflow/shared';

export default function SuppliersPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Filters State
    const [filters, setFilters] = useState<any>({
        page: 1,
        pageSize: 25,
        active: true
    });

    // Modals/Drawers State
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    // Data Fetching
    const { data, isLoading, refetch } = useQuery<PaginatedResponse<Supplier>>({
        queryKey: ['suppliers', filters],
        queryFn: () => apiClient.get<PaginatedResponse<Supplier>>('/suppliers', filters).then(res => res.data),
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: (variables: { id?: string, data: SupplierInput }) => {
            if (variables.id) {
                return apiClient.put(`/suppliers/${variables.id}`, variables.data).then(res => res.data);
            }
            return apiClient.post('/suppliers', variables.data).then(res => res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            queryClient.invalidateQueries({ queryKey: ['supplier-detail'] });
            toast({
                title: 'Sucesso',
                description: `Fornecedor ${formMode === 'create' ? 'registado' : 'atualizado'} com sucesso.`
            });
            setIsFormOpen(false);
        },
        onError: (error: any) => {
            toast({
                title: 'Erro',
                description: error.message || 'Ocorreu um erro ao processar o pedido.',
                variant: 'destructive'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/suppliers/${id}`).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast({ title: 'Sucesso', description: 'Fornecedor eliminado com sucesso.' });
        },
        onError: () => {
            toast({ title: 'Erro', description: 'Não foi possível eliminar o fornecedor.', variant: 'destructive' });
        }
    });

    const statusMutation = useMutation({
        mutationFn: (supplier: Supplier) => apiClient.put(`/suppliers/${supplier.id}`, { active: !supplier.active }).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast({ title: 'Estado Atualizado', description: 'O estado do fornecedor foi alterado.' });
        }
    });

    // Handlers
    const handleView = (s: Supplier) => {
        setSelectedSupplier(s);
        setIsDetailOpen(true);
    };

    const handleEdit = (s: Supplier) => {
        setSelectedSupplier(s);
        setFormMode('edit');
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedSupplier(null);
        setFormMode('create');
        setIsFormOpen(true);
    };

    const handleDelete = (s: Supplier) => {
        if (confirm(`Tem a certeza que pretende eliminar o fornecedor "${s.name}"? Esta ação não pode ser revertida.`)) {
            deleteMutation.mutate(s.id);
        }
    };

    const handleExport = () => {
        const token = localStorage.getItem('token');
        window.open(`${API_BASE}/suppliers/export?token=${token}`, '_blank');
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-3">
                        <Users className="h-8 w-8 text-blue-600" />
                        Diretório de Fornecedores
                    </h1>
                    <p className="text-muted-foreground text-lg mt-1">
                        Gestão centralizada de prestadores de serviços, contactos e histórico de intervenções.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2 h-11" onClick={handleExport}>
                        <FileDown className="h-4 w-4" /> Exportar CSV
                    </Button>
                    <Button className="gap-2 h-11 bg-slate-900 dark:bg-slate-50 dark:text-slate-900" onClick={handleCreate}>
                        <PlusCircle className="h-4 w-4" /> Novo Fornecedor
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Total Fornecedores</p>
                        <p className="text-xl font-extrabold">{data?.total || 0}</p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Ativos</p>
                        <p className="text-xl font-extrabold text-emerald-600">
                            {data?.data?.filter(s => s.active).length || 0}
                        </p>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                        <Star className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Favoritos / VIP</p>
                        <p className="text-xl font-extrabold text-amber-600">
                            {data?.data?.filter(s => s.favorite).length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <SupplierFilterBar
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>

            {/* Table Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Listagem Geral</h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => refetch()}>
                            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                        Mostrando {data?.data?.length || 0} de {data?.total || 0} resultados
                    </div>
                </div>

                <SupplierTable
                    suppliers={data?.data || []}
                    isLoading={isLoading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={statusMutation.mutate}
                />

                {/* Pagination */}
                {data && data.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-6">
                        <Button
                            variant="outline"
                            className="h-10 px-4"
                            disabled={filters.page === 1}
                            onClick={() => setFilters((f: any) => ({ ...f, page: f.page - 1 }))}
                        >
                            Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                            {[...Array(data.totalPages)].map((_, i) => (
                                <Button
                                    key={i + 1}
                                    variant={filters.page === i + 1 ? 'default' : 'ghost'}
                                    className="h-10 w-10 p-0"
                                    onClick={() => setFilters((f: any) => ({ ...f, page: i + 1 }))}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="h-10 px-4"
                            disabled={filters.page === data.totalPages}
                            onClick={() => setFilters((f: any) => ({ ...f, page: f.page + 1 }))}
                        >
                            Próxima
                        </Button>
                    </div>
                )}
            </div>

            {/* Modals & Drawers */}
            <SupplierDetailDrawer
                supplierId={selectedSupplier?.id || null}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                onEdit={handleEdit}
            />

            <SupplierFormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedSupplier}
                isSubmitting={mutation.isPending}
                onSubmit={(data) => mutation.mutate({ id: selectedSupplier?.id, data })}
            />
        </div>
    );
}
