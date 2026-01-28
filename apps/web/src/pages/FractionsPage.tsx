import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Building2,
    AlertCircle,
    Home,
    Filter,
    Download,
    Plus,
    MoreVertical,
    User,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Layers,
    Eye,
    Edit,
    Bell,
    Power,
    Flag
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { formatCurrency, cn } from '@/lib/utils';
import type { Fraction, Condominium, PaginatedResponse } from '@condoflow/shared';
import { useToast } from '@/components/ui/use-toast';
import { FractionDetailSheet } from '@/components/fraction/FractionDetailSheet';
import { RegisterPaymentDialog } from '@/components/fraction/RegisterPaymentDialog';
import { CreateFractionDialog } from '@/components/fraction/CreateFractionDialog';

export default function FractionsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [search, setSearch] = useState('');
    const [selectedCondo, setSelectedCondo] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [occupationFilter, setOccupationFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('number');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Detail Sheet State
    const [selectedFractionId, setSelectedFractionId] = useState<string | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Payment Dialog State
    const [paymentFraction, setPaymentFraction] = useState<Fraction | null>(null);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // Create Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Fetch fractions with server-side filtering and pagination
    const { data, isLoading, isError } = useQuery<PaginatedResponse<Fraction>>({
        queryKey: ['fractions-global', page, pageSize, search, selectedCondo, statusFilter, occupationFilter, sortBy, sortOrder],
        queryFn: () => apiClient.get('/fractions', {
            page,
            pageSize,
            search,
            condominiumId: selectedCondo === 'all' ? undefined : selectedCondo,
            paymentStatus: statusFilter === 'all' ? undefined : statusFilter,
            occupation: occupationFilter === 'all' ? undefined : occupationFilter,
            sortBy,
            sortOrder
        }),
    });

    // Fetch condominiums for filter
    const { data: condosData } = useQuery<PaginatedResponse<Condominium>>({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get('/condominiums', { pageSize: 100 }),
    });

    const fractions = data?.data || [];
    const totalItems = data?.total || 0;
    const totalPages = data?.totalPages || 1;
    const condominiums = condosData?.data || [];

    const handleExport = async () => {
        try {
            const response = await apiClient.get('/fractions/export', {
                search,
                condominiumId: selectedCondo === 'all' ? undefined : selectedCondo,
                paymentStatus: statusFilter === 'all' ? undefined : statusFilter,
                occupation: occupationFilter === 'all' ? undefined : occupationFilter
            });

            const blob = new Blob([response as any], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fracoes_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast({
                title: "Exportação Concluída",
                description: "O ficheiro CSV foi gerado com sucesso.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro na Exportação",
                description: "Não foi possível gerar o ficheiro CSV.",
            });
        }
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getStatusBadge = (status: string, debt: number) => {
        if (debt > 1000 || status === 'CRITICO') {
            return <Badge variant="destructive" className="font-bold">CRÍTICO</Badge>;
        }
        if (debt > 0 || status === 'ATRASO') {
            return <Badge variant="warning" className="font-bold">DÍVIDA</Badge>;
        }
        return <Badge variant="success" className="font-bold">OK</Badge>;
    };

    const handleRowClick = (fraction: Fraction) => {
        setSelectedFractionId(fraction.id);
        setIsDetailOpen(true);
    };

    const handleRegisterPayment = (fraction: Fraction) => {
        setPaymentFraction(fraction);
        setIsPaymentOpen(true);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50/30">
            {/* Top Bar / Context */}
            <div className="bg-white border-b px-8 py-4 shrink-0 shadow-sm z-30">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-[1600px] mx-auto">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-primary" />
                            Frações
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <Home className="w-3 h-3" /> {totalItems} Total
                            </span>
                            <span className="text-xs font-medium text-red-600 uppercase tracking-widest flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {fractions.filter(f => f.debtAmount > 0).length} Com Dívida
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport} className="h-9 font-bold border-gray-200">
                            <Download className="w-4 h-4 mr-2" /> Exportar CSV
                        </Button>
                        <Button size="sm" className="h-9 font-bold shadow-sm" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Criar Fração
                        </Button>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white border-b px-8 py-3 sticky top-0 z-20 shrink-0">
                <div className="flex flex-wrap gap-3 items-center max-w-[1600px] mx-auto">
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar fração, proprietário..."
                            className="pl-9 bg-gray-50/50 border-gray-200 focus:bg-white transition-all h-9 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={selectedCondo} onValueChange={setSelectedCondo}>
                        <SelectTrigger className="w-[200px] h-9 bg-gray-50/50 border-gray-200 text-sm">
                            <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Condomínio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Condomínios</SelectItem>
                            {condominiums.map((condo) => (
                                <SelectItem key={condo.id} value={condo.id}>{condo.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px] h-9 bg-gray-50/50 border-gray-200 text-sm">
                            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Estados</SelectItem>
                            <SelectItem value="EM_DIA">Regularizado</SelectItem>
                            <SelectItem value="ATRASO">Com Dívida</SelectItem>
                            <SelectItem value="CRITICO">Estado Crítico</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={occupationFilter} onValueChange={setOccupationFilter}>
                        <SelectTrigger className="w-[160px] h-9 bg-gray-50/50 border-gray-200 text-sm">
                            <User className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Ocupação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Ocupações</SelectItem>
                            <SelectItem value="PROPRIETARIO">Proprietário</SelectItem>
                            <SelectItem value="ARRENDADA">Arrendada</SelectItem>
                            <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="max-w-[1600px] mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="w-[80px] font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 cursor-pointer" onClick={() => toggleSort('number')}>
                                    Fração {sortBy === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">Condomínio</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-gray-500 py-4">Proprietário</TableHead>
                                <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 text-center">Piso</TableHead>
                                <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 text-right cursor-pointer" onClick={() => toggleSort('debtAmount')}>
                                    Dívida {sortBy === 'debtAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead className="w-[120px] font-black text-[10px] uppercase tracking-widest text-gray-500 py-4 text-center">Estado</TableHead>
                                <TableHead className="w-[60px] py-4"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="animate-pulse">
                                        <TableCell colSpan={7} className="h-16 bg-gray-50/30 mb-2 rounded-lg" />
                                    </TableRow>
                                ))
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <AlertCircle className="w-8 h-8 text-red-500" />
                                            <p className="font-bold">Erro ao carregar frações</p>
                                            <Button variant="link" onClick={() => queryClient.invalidateQueries({ queryKey: ['fractions-global'] })}>Tentar novamente</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : fractions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="font-medium">Nenhuma fração encontrada com estes filtros.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fractions.map((fraction) => (
                                    <TableRow
                                        key={fraction.id}
                                        className="group hover:bg-primary/[0.02] cursor-pointer transition-colors border-b border-gray-100"
                                        onClick={() => handleRowClick(fraction)}
                                    >
                                        <TableCell className="py-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-black text-gray-700 group-hover:bg-primary group-hover:text-white transition-all">
                                                {fraction.number}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{fraction.condominium?.name}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">{fraction.condominium?.city}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100">
                                                    {fraction.ownerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700">{fraction.ownerName}</span>
                                                    <span className="text-[10px] text-muted-foreground">{fraction.ownerEmail}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <Badge variant="outline" className="bg-gray-50/50 font-bold text-[10px]">{fraction.floor}º Andar</Badge>
                                        </TableCell>
                                        <TableCell className="py-4 text-right">
                                            <div className={cn(
                                                "font-black tabular-nums",
                                                fraction.debtAmount > 0 ? "text-red-600" : "text-green-600"
                                            )}>
                                                {formatCurrency(fraction.debtAmount)}
                                            </div>
                                            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                Quota: {formatCurrency(fraction.monthlyQuota)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            {getStatusBadge(fraction.paymentStatus, fraction.debtAmount)}
                                        </TableCell>
                                        <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 rounded-full">
                                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 p-2">
                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">Ações da Fração</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleRowClick(fraction)} className="rounded-md font-bold text-xs py-2">
                                                        <Eye className="w-3.5 h-3.5 mr-2 text-primary" /> Ver Detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-md font-bold text-xs py-2">
                                                        <Edit className="w-3.5 h-3.5 mr-2 text-gray-500" /> Editar Fração
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-1" />
                                                    <DropdownMenuItem onClick={() => handleRegisterPayment(fraction)} className="rounded-md font-bold text-xs py-2 text-green-600 focus:text-green-600">
                                                        <CreditCard className="w-3.5 h-3.5 mr-2" /> Registar Pagamento
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-md font-bold text-xs py-2">
                                                        <Bell className="w-3.5 h-3.5 mr-2 text-orange-500" /> Enviar Aviso
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="my-1" />
                                                    <DropdownMenuItem className="rounded-md font-bold text-xs py-2">
                                                        <Flag className="w-3.5 h-3.5 mr-2 text-blue-500" /> Marcar Acompanhamento
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-md font-bold text-xs py-2 text-red-600 focus:text-red-600">
                                                        <Power className="w-3.5 h-3.5 mr-2" /> Desativar Fração
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {!isLoading && totalItems > 0 && (
                        <div className="bg-gray-50/50 border-t px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-muted-foreground font-medium">
                                    A mostrar <span className="font-bold text-gray-900">{(page - 1) * pageSize + 1}</span> a <span className="font-bold text-gray-900">{Math.min(page * pageSize, totalItems)}</span> de <span className="font-bold text-gray-900">{totalItems}</span> frações
                                </span>
                                <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                                    <SelectTrigger className="w-[70px] h-8 text-[10px] font-bold bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                        <SelectItem value="100">100</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-gray-200"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center px-4 h-8 bg-white border border-gray-200 rounded-lg text-xs font-black tabular-nums">
                                    {page} / {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-gray-200"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Sheet */}
            <FractionDetailSheet
                fractionId={selectedFractionId}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            {/* Payment Dialog */}
            {paymentFraction && (
                <RegisterPaymentDialog
                    fraction={paymentFraction}
                    open={isPaymentOpen}
                    onOpenChange={setIsPaymentOpen}
                />
            )}
            {/* Create Dialog */}
            <CreateFractionDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
            />
        </div>
    );
}
