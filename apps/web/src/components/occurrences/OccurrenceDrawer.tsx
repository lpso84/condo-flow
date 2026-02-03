import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_HOST } from '@/lib/api';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    User,
    Building2,
    Home,
    Wrench,
    Clock,
    History,
    Paperclip,
    AlertCircle,
    MoreVertical,
    Send,
    Download,
    FileText,
    ExternalLink,
    Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Occurrence, OccurrenceStatus } from '@condoflow/shared';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface OccurrenceDrawerProps {
    opened: boolean;
    onClose: () => void;
    occurrenceId: string | null;
}

export function OccurrenceDrawer({ opened, onClose, occurrenceId }: OccurrenceDrawerProps) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [commentText, setCommentText] = useState('');
    const [uploading, setUploading] = useState(false);

    const { data: occurrence, isLoading } = useQuery<Occurrence & {
        comments?: any[];
        auditLogs?: any[];
        documents?: any[];
        supplier?: any;
        condominium?: any;
        fraction?: any;
    }>({
        queryKey: ['occurrence-detail', occurrenceId],
        queryFn: () => apiClient.get<Occurrence & {
            comments?: any[];
            auditLogs?: any[];
            documents?: any[];
            supplier?: any;
            condominium?: any;
            fraction?: any;
        }>(`/occurrences/${occurrenceId}`).then(res => res.data),
        enabled: !!occurrenceId && opened,
    });

    const addCommentMutation = useMutation({
        mutationFn: (text: string) => apiClient.post(`/occurrences/${occurrenceId}/comments`, { text }).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occurrence-detail', occurrenceId] });
            setCommentText('');
            toast({
                title: 'Comentário adicionado',
                description: 'O comentário foi registado com sucesso.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erro ao adicionar comentário',
                description: error?.message || 'Tente novamente mais tarde.',
                variant: 'destructive',
            });
        },
    });

    const changeStatusMutation = useMutation({
        mutationFn: ({ status, notes }: { status: OccurrenceStatus; notes?: string }) =>
            apiClient.post(`/occurrences/${occurrenceId}/status`, { status, notes }).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['occurrence-detail', occurrenceId] });
            queryClient.invalidateQueries({ queryKey: ['occurrences-global'] });
            toast({
                title: 'Estado atualizado',
                description: 'O estado da ocorrência foi atualizado.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erro ao atualizar estado',
                description: error?.message || 'Tente novamente mais tarde.',
                variant: 'destructive',
            });
        },
    });

    const uploadDocumentMutation = useMutation({
        mutationFn: async (file: File) => {
            if (!occurrenceId || !occurrence) return;
            return apiClient.post('/documents', {
                condominiumId: occurrence.condominiumId,
                occurrenceId,
                category: 'OUTRO',
                title: file.name,
                fileName: file.name,
            }).then(res => res.data);
        },
        onMutate: () => {
            setUploading(true);
        },
        onSuccess: () => {
            if (occurrenceId) {
                queryClient.invalidateQueries({ queryKey: ['occurrence-detail', occurrenceId] });
            }
            toast({
                title: 'Anexo carregado',
                description: 'O documento foi associado à ocorrência.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erro ao carregar anexo',
                description: error?.message || 'Tente novamente mais tarde.',
                variant: 'destructive',
            });
        },
        onSettled: () => {
            setUploading(false);
        },
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/documents/${id}`).then(res => res.data),
        onSuccess: () => {
            if (occurrenceId) {
                queryClient.invalidateQueries({ queryKey: ['occurrence-detail', occurrenceId] });
            }
            toast({
                title: 'Anexo removido',
                description: 'O documento foi removido da ocorrência.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erro ao remover anexo',
                description: error?.message || 'Tente novamente mais tarde.',
                variant: 'destructive',
            });
        },
    });

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        addCommentMutation.mutate(commentText);
    };

    const handleUploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        uploadDocumentMutation.mutate(file);
        event.target.value = '';
    };

    if (!occurrenceId) return null;

    return (
        <Sheet open={opened} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[700px] p-0 flex flex-col">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-muted-foreground">A carregar detalhes...</span>
                    </div>
                ) : occurrence ? (
                    <>
                        <div className="p-6 border-b bg-muted/20">
                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] h-5">
                                            #{occurrence.id.split('-')[0].toUpperCase()}
                                        </Badge>
                                        <PriorityBadge priority={occurrence.priority} />
                                    </div>
                                    <SheetTitle className="text-2xl font-bold">{occurrence.title}</SheetTitle>
                                    <SheetDescription asChild>
                                        <div className="flex items-center gap-4 text-sm mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(occurrence.createdAt), 'dd MMMM yyyy HH:mm', { locale: pt })}
                                            </span>
                                            <span className="flex items-center gap-1 capitalize">
                                                <AlertCircle className="h-3 w-3" />
                                                {occurrence.category.toLowerCase().replace('_', ' ')}
                                            </span>
                                        </div>
                                    </SheetDescription>
                                </div>
                                <div className="flex gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                Alterar Estado <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => changeStatusMutation.mutate({ status: 'EM_ANALISE' as OccurrenceStatus })}>
                                                Em Análise
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => changeStatusMutation.mutate({ status: 'EM_EXECUCAO' as OccurrenceStatus })}>
                                                Em Execução
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => changeStatusMutation.mutate({ status: 'RESOLVIDA' as OccurrenceStatus })}>
                                                Marcar como Resolvida
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => changeStatusMutation.mutate({ status: 'ARQUIVADA' as OccurrenceStatus })}>
                                                Arquivar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <StatusBadge status={occurrence.status} />
                                {occurrence.slaDeadline && (
                                    <Badge variant={new Date(occurrence.slaDeadline) < new Date() ? "destructive" : "outline"} className="gap-1">
                                        <Clock className="h-3 w-3" />
                                        Prazo: {format(new Date(occurrence.slaDeadline), 'dd MMM', { locale: pt })}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 border-b bg-card">
                                <TabsList className="w-full justify-start h-12 bg-transparent gap-6 p-0">
                                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12">
                                        Visão Geral
                                    </TabsTrigger>
                                    <TabsTrigger value="activity" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12">
                                        Atividade ({occurrence.comments?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="attachments" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12">
                                        Anexos ({occurrence.documents?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="relations" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 h-12">
                                        Relações
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6">
                                    <TabsContent value="overview" className="mt-0 space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Descrição</h3>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/20 p-4 rounded-lg border">
                                                {occurrence.description}
                                            </p>
                                        </div>

                                        <div className="h-px w-full bg-border my-4" />

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Localização</h3>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Building2 className="h-4 w-4 text-primary" />
                                                        <span className="font-medium text-primary cursor-pointer hover:underline">
                                                            {occurrence.condominium?.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Home className="h-4 w-4 text-muted-foreground" />
                                                        <span>{occurrence.fraction ? `Fração ${occurrence.fraction.number}` : 'Partes Comuns'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm italic text-muted-foreground pl-6">
                                                        <span>{occurrence.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Responsável</h3>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <span>Reportado por: <strong>{occurrence.reportedBy}</strong></span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Wrench className="h-4 w-4 text-muted-foreground" />
                                                        {occurrence.supplier ? (
                                                            <span>Atribuído a: <strong className="text-primary">{occurrence.supplier.name}</strong></span>
                                                        ) : (
                                                            <span className="text-yellow-600 font-medium">Fornecedor não atribuído</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {occurrence.notes && (
                                            <>
                                                <div className="h-px w-full bg-border my-4" />
                                                <div className="space-y-2">
                                                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notas Internas</h3>
                                                    <div className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
                                                        {occurrence.notes}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="activity" className="mt-0 space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex gap-3 items-start">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>AD</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-2">
                                                    <Textarea
                                                        placeholder="Adicionar um comentário ou nota..."
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        className="min-h-[80px]"
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            className="gap-2"
                                                            disabled={!commentText.trim() || addCommentMutation.isPending}
                                                            onClick={handleAddComment}
                                                        >
                                                            <Send className="h-3 w-3" />
                                                            Comentar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted">
                                                {occurrence.comments?.map((comment: any) => (
                                                    <div key={comment.id} className="relative">
                                                        <div className="absolute -left-[24px] top-1 h-3 w-3 rounded-full bg-primary border-4 border-background" />
                                                        <div className="bg-muted/10 p-3 rounded-lg border">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-semibold">{comment.authorName}</span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {format(new Date(comment.createdAt), 'dd MMM HH:mm', { locale: pt })}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {occurrence.auditLogs?.map((log: any) => (
                                                    <div key={log.id} className="relative">
                                                        <div className="absolute -left-[24px] top-1 h-3 w-3 rounded-full bg-muted-foreground/30 border-4 border-background" />
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <History className="h-3 w-3" />
                                                            <span>
                                                                <strong>{log.authorName}</strong> {log.action === 'STATUS_CHANGE' ? 'alterou o estado' : log.action === 'ASSIGNMENT' ? 'atribuiu fornecedor' : 'atualizou a ocorrência'} em {format(new Date(log.createdAt), 'dd MMM HH:mm', { locale: pt })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="attachments" className="mt-0">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold">Ficheiros e Fotos</h3>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        id="occ-attachment-input"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleUploadFile}
                                                        disabled={uploading}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        onClick={() => document.getElementById('occ-attachment-input')?.click()}
                                                        disabled={uploading}
                                                    >
                                                        <Paperclip className="h-3 w-3" /> {uploading ? 'A carregar...' : 'Fazer Upload'}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {occurrence.documents && occurrence.documents.length > 0 ? (
                                                    occurrence.documents.map((doc: any) => (
                                                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium">{doc.title}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase">
                                                                        {doc.fileName.split('.').pop()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                        const baseUrl = API_HOST;
                                                                        window.open(`${baseUrl}${doc.filePath}`, '_blank');
                                                                    }}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-8 w-8 text-destructive"
                                                                    onClick={() => {
                                                                        if (confirm('Remover este anexo da ocorrência?')) {
                                                                            deleteDocumentMutation.mutate(doc.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                                        <Paperclip className="h-8 w-8 mb-2 opacity-20" />
                                                        <p className="text-sm">Sem anexos associados</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="relations" className="mt-0 space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                                <Wrench className="h-4 w-4" /> Fornecedor Atribuído
                                            </h3>
                                            {occurrence.supplier ? (
                                                <div className="p-4 rounded-lg border bg-card flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                {occurrence.supplier.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-bold">{occurrence.supplier.name}</p>
                                                            <p className="text-xs text-muted-foreground">{occurrence.supplier.email || 'Sem email'}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="gap-2">
                                                        Ver Perfil <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-lg border border-dashed text-center">
                                                    <p className="text-sm text-muted-foreground mb-3">Nenhum fornecedor atribuído para resolver esta ocorrência.</p>
                                                    <Button size="sm" variant="outline">Escolher Fornecedor</Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                                <Building2 className="h-4 w-4" /> Custos Associados
                                            </h3>
                                            <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                                                <p className="text-sm italic">Não existem movimentos financeiros registados para esta ocorrência.</p>
                                                <Button size="sm" variant="link" className="mt-2 text-primary">Registar Despesa</Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </div>
                        </Tabs>

                        <div className="p-4 border-t bg-card flex justify-end items-center">
                            <Button variant="secondary" size="sm" onClick={onClose}>
                                Fechar
                            </Button>
                        </div>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}

// legacy icon alias no longer used
