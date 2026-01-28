import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Assembly, Condominium, PaginatedResponse } from '@condoflow/shared';
import { apiClient } from '@/lib/api';
import { AssemblyFilterBar } from '@/components/assemblies/AssemblyFilterBar';
import { AssemblyList } from '@/components/assemblies/AssemblyList';
import { AssemblyFormModal } from '@/components/assemblies/AssemblyFormModal';
import { AssemblyDetailDrawer } from '@/components/assemblies/AssemblyDetailDrawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AssembliesPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [assemblies, setAssemblies] = useState<Assembly[]>([]);
    const [condominiums, setCondominiums] = useState<Condominium[]>([]); // simplified for select
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedAssemblyId, setSelectedAssemblyId] = useState<string | null>(null);
    const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null);

    // Filters state
    const filters = {
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || '',
        type: searchParams.get('type') || '',
        year: searchParams.get('year') || '',
        condominiumId: searchParams.get('condominiumId') || '',
    };

    const fetchAssemblies = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize: 20,
                ...filters
            };
            const response = await apiClient.get<PaginatedResponse<Assembly>>('/assemblies', params);
            setAssemblies(response.data.data);
        } catch (error) {
            toast.error('Erro ao carregar assembleias');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCondominiums = async () => {
        try {
            const response = await apiClient.get<PaginatedResponse<Condominium>>('/condominiums', { pageSize: 100 });
            setCondominiums(response.data.data);
        } catch (e) {
            console.error('Failed to load condos');
        }
    };

    useEffect(() => {
        fetchCondominiums();
    }, []);

    useEffect(() => {
        fetchAssemblies();
    }, [page, searchParams]);

    const handleFilterChange = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setPage(1); // Reset to page 1
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleResetFilters = () => {
        setSearchParams(new URLSearchParams());
        setPage(1);
    };

    const handleCreate = async (data: any) => {
        try {
            await apiClient.post('/assemblies', data);
            toast.success('Assembleia criada com sucesso');
            fetchAssemblies();
        } catch (error) {
            toast.error('Erro ao criar assembleia');
            throw error;
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            if (!editingAssembly) return;
            await apiClient.put(`/assemblies/${editingAssembly.id}`, data);
            toast.success('Assembleia atualizada com sucesso');
            setIsCreateOpen(false);
            setEditingAssembly(null);
            fetchAssemblies();
            // Refresh detail if open
            if (selectedAssemblyId === editingAssembly.id) {
                // Currently DetailDrawer fetches on mount/id change, so force update is manual via prop
            }
        } catch (error) {
            toast.error('Erro ao atualizar assembleia');
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem a certeza que deseja eliminar esta assembleia?')) return;
        try {
            await apiClient.delete(`/assemblies/${id}`);
            toast.success('Assembleia eliminada');
            fetchAssemblies();
        } catch (error) {
            toast.error('Erro ao eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Assembleias</h1>
                    <p className="text-muted-foreground">Gestão de assembleias gerais e convocatórias.</p>
                </div>
                <Button onClick={() => { setEditingAssembly(null); setIsCreateOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Nova Assembleia
                </Button>
            </div>

            {/* Stats Cards could go here */}

            <AssemblyFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                condominiums={condominiums}
            />

            <AssemblyList
                assemblies={assemblies}
                isLoading={loading}
                onView={(a) => setSelectedAssemblyId(a.id)}
                onDelete={handleDelete}
            />

            {/* Pagination Controls could go here */}

            <AssemblyFormModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={editingAssembly ? handleUpdate : handleCreate}
                condominiums={condominiums}
                initialData={editingAssembly}
            />

            <AssemblyDetailDrawer
                assemblyId={selectedAssemblyId}
                onClose={() => setSelectedAssemblyId(null)}
                onEdit={(a) => {
                    setEditingAssembly(a);
                    setIsCreateOpen(true);
                }}
                onUpdate={fetchAssemblies}
            />
        </div>
    );
}
