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
import { Button } from '@/components/ui/button';
import {
    Pencil,
    Trash2,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Eye,
    User,
    Home
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { CreateFractionDialog } from './CreateFractionDialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Fraction, PaginatedResponse } from '@condoflow/shared';

interface FractionsTabProps {
    condominiumId: string;
}

export function FractionsTab({ condominiumId }: FractionsTabProps) {
    const [search, setSearch] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, isLoading } = useQuery<PaginatedResponse<Fraction>>({
        queryKey: ['condominium-fractions', condominiumId, search],
        queryFn: () => apiClient.get('/fractions', { condominiumId, search: search || undefined, pageSize: 100 }),
    });

    const fractions = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por número ou proprietário..."
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
                        <Plus className="mr-2 h-4 w-4" /> Nova Fração
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest">Fração</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Piso / Bloco</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Proprietário</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest">Estado</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Quota</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Dívida</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell colSpan={7} className="h-16 bg-gray-50/30" />
                                </TableRow>
                            ))
                        ) : fractions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Home className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm font-medium">Nenhuma fração encontrada.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            fractions.map((fraction) => (
                                <TableRow key={fraction.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <span className="font-black text-gray-900">{fraction.number}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">{fraction.floor}</span>
                                            {fraction.block && <span className="text-[10px] font-bold text-muted-foreground uppercase">Bloco {fraction.block}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="h-3.5 w-3.5 text-gray-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{fraction.ownerName || '---'}</span>
                                                <span className="text-[10px] text-muted-foreground">{fraction.ownerEmail || 'Sem email'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={fraction.paymentStatus === 'EM_DIA' ? 'success' : 'destructive'} className="text-[9px] font-black uppercase tracking-tighter">
                                            {fraction.paymentStatus === 'EM_DIA' ? 'Regularizada' : 'Em Dívida'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-sm text-gray-700">
                                        {formatCurrency(fraction.monthlyQuota)}
                                    </TableCell>
                                    <TableCell className={cn(
                                        "text-right font-black tabular-nums",
                                        fraction.debtAmount > 0 ? "text-red-600" : "text-green-600"
                                    )}>
                                        {formatCurrency(fraction.debtAmount)}
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
                                                    <Pencil className="mr-2 h-3.5 w-3.5" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="font-bold text-xs text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar
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

            <CreateFractionDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                condominiumId={condominiumId}
            />
        </div>
    );
}
