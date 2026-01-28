import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Document, Condominium, PaginatedResponse } from '@condoflow/shared';
import { apiClient } from '@/lib/api';
import { DocumentFilterBar } from '@/components/documents/DocumentFilterBar';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DocumentDetailDrawer } from '@/components/documents/DocumentDetailDrawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [condominiums, setCondominiums] = useState<Condominium[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

    const filters = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        condominiumId: searchParams.get('condominiumId') || '',
    };

    // ... fetchDocuments, fetchCondominiums, effects ...
    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                pageSize: 20,
                ...filters
            };
            const response = await apiClient.get<PaginatedResponse<Document>>('/documents', params);
            setDocuments(response.data.data);
        } catch (error) {
            toast.error('Erro ao carregar documentos');
        } finally {
            setLoading(false);
        }
    };

    const fetchCondominiums = async () => {
        try {
            const response = await apiClient.get<PaginatedResponse<Condominium>>('/condominiums', { pageSize: 100 });
            setCondominiums(response.data.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchCondominiums();
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [page, searchParams]);

    const handleFilterChange = (key: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setPage(1);
        setSearchParams(newParams);
    };

    const handleResetFilters = () => {
        setSearchParams(new URLSearchParams());
        setPage(1);
    };

    const handleUpload = async (data: any) => {
        try {
            await apiClient.post('/documents', data);
            toast.success('Documento carregado com sucesso');
            fetchDocuments();
        } catch (error) {
            toast.error('Erro ao carregar documento');
            throw error;
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Eliminar documento?')) return;
        try {
            await apiClient.delete(`/documents/${id}`);
            toast.success('Documento eliminado');
            fetchDocuments();
        } catch (error) {
            toast.error('Erro ao eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
                    <p className="text-muted-foreground">Arquivo digital de todos os documentos.</p>
                </div>
                <Button onClick={() => setIsUploadOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Upload Documento
                </Button>
            </div>

            <DocumentFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                condominiums={condominiums}
            />

            <DocumentList
                documents={documents}
                isLoading={loading}
                onView={(doc) => setSelectedDocumentId(doc.id)}
                onDelete={handleDelete}
            />

            <DocumentUploadModal
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                onSubmit={handleUpload}
                condominiums={condominiums}
            />

            <DocumentDetailDrawer
                documentId={selectedDocumentId}
                onClose={() => setSelectedDocumentId(null)}
                onUpdate={fetchDocuments}
            />
        </div>
    );
}
