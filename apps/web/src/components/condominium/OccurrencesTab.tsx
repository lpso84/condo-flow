import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    CheckCircle2,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Eye,
    Clock,
    User,
    MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CreateOccurrenceDialog } from './CreateOccurrenceDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Occurrence, PaginatedResponse } from '@condoflow/shared';

interface OccurrencesTabProps {
    condominiumId: string;
}

export function OccurrencesTab({ condominiumId }: OccurrencesTabProps) {
    const [search, setSearch] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, isLoading } = useQuery<PaginatedResponse<Occurrence>>({
        queryKey: ['condominium-occurrences', condominiumId, search],
        queryFn: () => apiClient.get('/occurrences', { condominiumId, search: search || undefined, pageSize: 50 }),
    });

    const occurrences = data?.data || [];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ABERTA':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-black text-[9px] uppercase">Aberta</Badge>;
            case 'EM_ANALISE':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-black text-[9px] uppercase">Em Análise</Badge>;
            case 'EM_EXECUCAO':
                return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-black text-[9px] uppercase">Em Execução</Badge>;
            case 'RESOLVIDA':
                return <Badge variant="success" className="font-black text-[9px] uppercase">Resolvida</Badge>;
            case 'ARQUIVADA':
                return <Badge variant="secondary" className="font-black text-[9px] uppercase">Arquivada</Badge>;
            default:
                return <Badge variant="outline" className="font-black text-[9px] uppercase">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        if (priority === 'URGENTE') {
            return (
                <Badge variant="destructive" className="font-black text-[9px] uppercase tracking-tighter animate-pulse">
                    <AlertCircle className="mr-1 h-3 w-3" /> Urgente
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-tighter text-gray-500 bg-gray-100">
                Normal
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por título ou descrição..."
                            className="pl-9 h-10 font-medium border-gray-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-bold h-10 border-gray-200">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                    <Button size="sm" className="font-bold h-10 shadow-sm" onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest">Prioridade</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Ocorrência</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Estado</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Data / SLA</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Reportado Por</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={6} className="h-16 bg-gray-50/30" />
                                </TableRow>
                            ))
                        ) : occurrences.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">Nenhuma ocorrência encontrada.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            occurrences.map((occurrence) => (
                                <TableRow key={occurrence.id} className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                                    <TableCell>
                                        {getPriorityBadge(occurrence.priority)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col max-w-[400px]">
                                            <span className="font-bold text-sm text-gray-900 line-clamp-1">{occurrence.title}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-gray-100 text-gray-400">
                                                    {occurrence.category.replace('_', ' ')}
                                                </Badge>
                                                {occurrence.fraction && (
                                                    <span className="text-[10px] font-bold text-primary uppercase">Fração {occurrence.fraction.number}</span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(occurrence.status)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center text-xs font-bold text-gray-600">
                                                <Clock className="mr-1.5 h-3 w-3 text-gray-400" />
                                                {format(new Date(occurrence.createdAt), "dd MMM yyyy", { locale: pt })}
                                            </div>
                                            {occurrence.slaDeadline && (
                                                <span className="text-[9px] font-black text-red-500 uppercase mt-0.5">
                                                    SLA: {format(new Date(occurrence.slaDeadline), "dd/MM", { locale: pt })}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{occurrence.reportedBy || 'Anónimo'}</span>
                                        </div>
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
                                                    <Eye className="mr-2 h-3.5 w-3.5" /> Ver Detalhe
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="font-bold text-xs">
                                                    <MessageSquare className="mr-2 h-3.5 w-3.5" /> Comentários
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="font-bold text-xs text-blue-600 focus:text-blue-600">
                                                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Marcar Resolvida
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateOccurrenceDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                condominiumId={condominiumId}
            />
        </div>
    );
}
