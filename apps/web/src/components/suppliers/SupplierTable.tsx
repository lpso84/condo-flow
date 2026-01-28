import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MoreHorizontal,
    Phone,
    Mail,
    Star,
    ExternalLink,
    Edit2,
    Trash2,
    Ban,
    CheckCircle2,
    Copy,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Supplier } from '@condoflow/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

interface SupplierTableProps {
    suppliers: Supplier[];
    isLoading: boolean;
    onView: (supplier: Supplier) => void;
    onEdit: (supplier: Supplier) => void;
    onDelete: (supplier: Supplier) => void;
    onToggleStatus: (supplier: Supplier) => void;
}

export function SupplierTable({
    suppliers,
    isLoading,
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
}: SupplierTableProps) {
    const { toast } = useToast();

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: 'Copiado!',
            description: `${label} copiado para a área de transferência.`,
        });
    };

    if (isLoading) {
        return (
            <div className="rounded-md border bg-white dark:bg-slate-950">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Fornecedor</TableHead>
                            <TableHead>Categorias</TableHead>
                            <TableHead>Contactos</TableHead>
                            <TableHead>NIF</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (suppliers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-slate-50/50">
                <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Trash2 className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold">Nenhum fornecedor encontrado</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-1">
                    Não existem fornecedores que correspondam aos seus filtros atuais. Tente ajustar a sua pesquisa.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Limpar filtros
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                    <TableRow>
                        <TableHead className="w-[300px] font-bold">Fornecedor</TableHead>
                        <TableHead className="font-bold">Categorias</TableHead>
                        <TableHead className="font-bold">Contactos</TableHead>
                        <TableHead className="font-bold">NIF</TableHead>
                        <TableHead className="font-bold">Estado</TableHead>
                        <TableHead className="w-[80px] text-right pr-6"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suppliers.map((supplier) => (
                        <TableRow
                            key={supplier.id}
                            className="group cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => onView(supplier)}
                        >
                            <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${supplier.favorite ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-400'}`}>
                                        <Star className={`h-4 w-4 ${supplier.favorite ? 'fill-current' : ''}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                                            {supplier.name}
                                        </span>
                                        {supplier.contactPerson && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                {supplier.contactPerson}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {supplier.categories.split(',').map((cat) => (
                                        <Badge key={cat} variant="secondary" className="text-[10px] uppercase font-bold px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                            {cat.replace('_', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1">
                                    {supplier.email && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors group/link" onClick={(e) => { e.stopPropagation(); copyToClipboard(supplier.email!, 'Email'); }}>
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate">{supplier.email}</span>
                                            <Copy className="h-3 w-3 opacity-0 group-hover/link:opacity-100" />
                                        </div>
                                    )}
                                    {supplier.phone && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors group/link" onClick={(e) => { e.stopPropagation(); copyToClipboard(supplier.phone!, 'Telefone'); }}>
                                            <Phone className="h-3 w-3" />
                                            <span>{supplier.phone}</span>
                                            <Copy className="h-3 w-3 opacity-0 group-hover/link:opacity-100" />
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-mono text-slate-500">{supplier.nif}</span>
                            </TableCell>
                            <TableCell>
                                {supplier.active ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[10px]">
                                        Ativo
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none px-2 py-0.5 text-[10px]">
                                        Inativo
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onView(supplier)}>
                                            <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalhes
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(supplier)}>
                                            <Edit2 className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onToggleStatus(supplier)}>
                                            {supplier.active ? (
                                                <><Ban className="mr-2 h-4 w-4 text-amber-500" /> Desativar</>
                                            ) : (
                                                <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Ativar</>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={() => onDelete(supplier)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Apagar Fornecedor
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
