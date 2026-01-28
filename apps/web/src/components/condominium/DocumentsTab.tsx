import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    FileText,
    Search,
    Download,
    Trash2,
    Plus,
    Filter,
    MoreVertical,
    File,
    FileArchive,
    FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { UploadDocumentDialog } from './UploadDocumentDialog';
import type { Document, PaginatedResponse } from '@condoflow/shared';

interface DocumentsTabProps {
    condominiumId: string;
}

export function DocumentsTab({ condominiumId }: DocumentsTabProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [categoryFilter] = useState('all');
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    const { data, isLoading } = useQuery<PaginatedResponse<Document>>({
        queryKey: ['condominium-documents', condominiumId, search, categoryFilter],
        queryFn: () => apiClient.get<PaginatedResponse<Document>>('/documents', {
            condominiumId,
            search: search || undefined,
            category: categoryFilter === 'all' ? undefined : categoryFilter
        }).then(res => res.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/documents/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['condominium-documents'] });
            toast({ title: "Documento eliminado", description: "O documento foi removido com sucesso." });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível eliminar o documento." });
        }
    });

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
        if (mimeType.includes('image')) return <FileImage className="h-4 w-4 text-blue-500" />;
        if (mimeType.includes('zip')) return <FileArchive className="h-4 w-4 text-orange-500" />;
        return <File className="h-4 w-4 text-gray-500" />;
    };

    const documents = data?.data || [];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar documentos..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-bold">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                    <Button size="sm" className="font-bold" onClick={() => setIsUploadDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Upload
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[400px] font-black text-[10px] uppercase tracking-widest">Documento</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Categoria</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Data</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Tamanho</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={5} className="h-16 bg-gray-50/30" />
                                </TableRow>
                            ))
                        ) : documents.length > 0 ? (
                            documents.map((doc) => (
                                <TableRow key={doc.id} className="group">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                                {getFileIcon(doc.mimeType)}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-sm truncate">{doc.title}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{doc.fileName}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-tighter">
                                            {doc.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">
                                        {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: pt })}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest">Ações</DropdownMenuLabel>
                                                <DropdownMenuItem className="font-bold text-xs">
                                                    <Download className="mr-2 h-3.5 w-3.5" /> Download
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="font-bold text-xs text-red-600 focus:text-red-600"
                                                    onClick={() => {
                                                        if (confirm('Tem a certeza que deseja eliminar este documento?')) {
                                                            deleteMutation.mutate(doc.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <FileText className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">Nenhum documento encontrado.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <UploadDocumentDialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
                condominiumId={condominiumId}
            />
        </div>
    );
}
