import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Occurrence, PaginatedResponse, OccurrenceQuery, OccurrenceStatus } from '@condoflow/shared';

import { OccurrencesFilters } from '@/components/occurrences/OccurrencesFilters';
import { OccurrencesTable } from '@/components/occurrences/OccurrencesTable';
import { OccurrenceStats } from '@/components/occurrences/OccurrenceStats';
import { OccurrenceFormModal } from '@/components/occurrences/OccurrenceFormModal';
import { OccurrenceDrawer } from '@/components/occurrences/OccurrenceDrawer';
import { toast } from 'sonner';

export default function OccurrencesPage() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<Partial<OccurrenceQuery>>({
        page: 1,
        pageSize: 50,
    });
    const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [occurrenceToEdit, setOccurrenceToEdit] = useState<Occurrence | null>(null);

    const { data, isLoading } = useQuery<PaginatedResponse<Occurrence>>({
        queryKey: ['occurrences-global', filters],
        queryFn: () => apiClient.get<PaginatedResponse<Occurrence>>('/occurrences', filters).then(res => res.data),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: OccurrenceStatus }) =>
            apiClient.post(`/occurrences/${id}/status`, { status }).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occurrences-global'] });
            queryClient.invalidateQueries({ queryKey: ['occurrence-stats'] });
            toast.success('Estado atualizado com sucesso');
        },
        onError: () => toast.error('Erro ao atualizar estado'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/occurrences/${id}`).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occurrences-global'] });
            queryClient.invalidateQueries({ queryKey: ['occurrence-stats'] });
            toast.success('Ocorrência eliminada');
        },
        onError: () => toast.error('Erro ao eliminar ocorrência'),
    });

    const handleCreateClick = () => {
        setOccurrenceToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleViewOccurrence = (occurrence: Occurrence) => {
        setSelectedOccurrence(occurrence);
        setIsDrawerOpen(true);
    };

    const handleStatusChange = (occurrence: Occurrence, status: OccurrenceStatus) => {
        statusMutation.mutate({ id: occurrence.id, status });
    };

    const handleDelete = (occurrence: Occurrence) => {
        if (confirm('Tem a certeza que deseja eliminar esta ocorrência?')) {
            deleteMutation.mutate(occurrence.id);
        }
    };

    const handleFilterClickFromStats = (key: string, isOverdue = false) => {
        if (isOverdue) {
            setFilters((prev) => ({ ...prev, overdue: true, status: undefined, priority: undefined, page: 1 }));
        } else if (key === 'URGENTE') {
            setFilters((prev) => ({ ...prev, priority: 'URGENTE', status: undefined, overdue: undefined, page: 1 }));
        } else {
            setFilters((prev) => ({ ...prev, status: key, priority: undefined, overdue: undefined, page: 1 }));
        }
    };

    const occurrences = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ocorrências</h1>
                    <p className="text-muted-foreground">
                        Gestão centralizada de pedidos, avarias e manutenções.
                    </p>
                </div>
                <Button onClick={handleCreateClick} className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <Plus className="h-4 w-4" />
                    Nova Ocorrência
                </Button>
            </div>

            <OccurrenceStats onFilterClick={handleFilterClickFromStats} />

            <div className="space-y-4">
                <OccurrencesFilters
                    filters={filters}
                    onFiltersChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
                />

                <OccurrencesTable
                    occurrences={occurrences}
                    isLoading={isLoading}
                    onView={handleViewOccurrence}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                />
            </div>

            <OccurrenceFormModal
                opened={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                occurrence={occurrenceToEdit}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['occurrences-global'] });
                    queryClient.invalidateQueries({ queryKey: ['occurrence-stats'] });
                }}
            />

            <OccurrenceDrawer
                opened={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedOccurrence(null);
                }}
                occurrenceId={selectedOccurrence?.id || null}
            />
        </div>
    );
}
