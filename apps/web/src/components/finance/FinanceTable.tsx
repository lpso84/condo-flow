import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MoreHorizontal,
    Eye,
    Edit,
    RotateCcw,
    ExternalLink,
    FileText
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Transaction } from '@condoflow/shared';

interface FinanceTableProps {
    transactions: Transaction[];
    isLoading: boolean;
    onView: (transaction: Transaction) => void;
    onEdit: (transaction: Transaction) => void;
    onCancel: (transaction: Transaction) => void;
}

export function FinanceTable({
    transactions,
    isLoading,
    onView,
    onEdit,
    onCancel
}: FinanceTableProps) {
    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Carregando movimentos...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Nenhum movimento encontrado</p>
                <p className="text-sm text-muted-foreground">Tente ajustar os filtros ou registar um novo movimento.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow>
                        <TableHead className="w-[110px]">Data</TableHead>
                        <TableHead className="w-[80px]">Tipo</TableHead>
                        <TableHead className="min-w-[150px]">Condomínio</TableHead>
                        <TableHead className="min-w-[200px]">Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="w-[100px] text-center">Estado</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((t) => (
                        <TableRow
                            key={t.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer group"
                            onClick={() => onView(t)}
                        >
                            <TableCell className="text-sm font-medium">
                                {format(new Date(t.date), "dd MMM yyyy", { locale: pt })}
                            </TableCell>
                            <TableCell>
                                <div className={`h-2 w-2 rounded-full ${t.type === 'RECEITA' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{t.condominium?.name}</span>
                                    {t.fraction && (
                                        <span className="text-xs text-muted-foreground">Fração {t.fraction.number}</span>
                                    )}
                                    {t.supplier && (
                                        <span className="text-xs text-muted-foreground">{t.supplier.name}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[250px]">
                                        {t.description}
                                    </span>
                                    {t.reference && (
                                        <span className="text-xs text-muted-foreground font-mono">{t.reference}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-normal capitalize bg-slate-100/50 dark:bg-slate-800/50">
                                    {t.category.toLowerCase().replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-bold ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {t.type === 'RECEITA' ? '+' : '-'} {formatCurrency(t.amount)}
                            </TableCell>
                            <TableCell className="text-center">
                                {t.status === 'ANULADO' ? (
                                    <Badge variant="destructive" className="text-[10px] uppercase px-1">Anulado</Badge>
                                ) : t.status === 'PENDENTE' ? (
                                    <Badge variant="secondary" className="text-[10px] uppercase px-1">Pendente</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] uppercase px-1 border-emerald-200 text-emerald-700 bg-emerald-50">Pago</Badge>
                                )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onView(t)}>
                                            <Eye className="mr-2 h-4 w-4" /> Ver Detalhe
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(t)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        {t.status !== 'ANULADO' && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-rose-600 focus:text-rose-600"
                                                    onClick={() => onCancel(t)}
                                                >
                                                    <RotateCcw className="mr-2 h-4 w-4" /> Anular Movimento
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <ExternalLink className="mr-2 h-4 w-4" /> Ir para Condomínio
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
