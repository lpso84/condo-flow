import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Phone,
    Mail,
    MapPin,
    User,
    Calendar,
    FileText,
    History,
    Edit2,
    Star,
    Wrench,
    Coins,
    Upload,
    MoreVertical,
    Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Supplier } from '@condoflow/shared';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface SupplierDetailDrawerProps {
    supplierId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (supplier: Supplier) => void;
}

export function SupplierDetailDrawer({ supplierId, open, onOpenChange, onEdit }: SupplierDetailDrawerProps) {
    const { data: supplier, isLoading } = useQuery<Supplier>({
        queryKey: ['supplier-detail', supplierId],
        queryFn: () => apiClient.get(`/suppliers/${supplierId}`),
        enabled: !!supplierId && open,
    });

    if (isLoading) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-2xl">
                    <div className="space-y-6 pt-8">
                        <Skeleton className="h-10 w-2/3" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-[300px] w-full" />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    if (!supplier) return null;

    const lastInteraction = supplier.occurrences?.length
        ? new Date(supplier.occurrences[0].reportedAt)
        : null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-3xl overflow-y-auto">
                <SheetHeader className="pb-6 border-b relative">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                {supplier.favorite && <Star className="h-5 w-5 text-amber-500 fill-current" />}
                                <SheetTitle className="text-2xl font-bold">{supplier.name}</SheetTitle>
                                {supplier.active ? (
                                    <Badge className="bg-emerald-100 text-emerald-700">Ativo</Badge>
                                ) : (
                                    <Badge variant="secondary">Inativo</Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {supplier.categories.split(',').map(cat => (
                                    <Badge key={cat} variant="outline" className="text-[10px] uppercase font-bold">
                                        {cat.replace('_', ' ')}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => onEdit(supplier)}>
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <Tabs defaultValue="overview" className="mt-6">
                    <TabsList className="grid w-full grid-cols-5 h-12">
                        <TabsTrigger value="overview">Geral</TabsTrigger>
                        <TabsTrigger value="occurrences">Ocorrências</TabsTrigger>
                        <TabsTrigger value="projects">Obras</TabsTrigger>
                        <TabsTrigger value="finance">Financeiro</TabsTrigger>
                        <TabsTrigger value="docs">Documentos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-8">
                        {/* KPIs */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Ocorrências</p>
                                <p className="text-xl font-bold">{supplier.occurrences?.length || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Projetos</p>
                                <p className="text-xl font-bold">{supplier.projects?.length || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Documentos</p>
                                <p className="text-xl font-bold">{supplier.documents?.length || 0}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border text-center">
                                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Faturação</p>
                                <p className="text-xl font-bold text-emerald-600">
                                    {formatCurrency(supplier.transactions?.reduce((acc, t) => acc + t.amount, 0) || 0)}
                                </p>
                            </div>
                        </div>

                        {/* Contact info card */}
                        <div className="p-6 rounded-2xl border bg-white dark:bg-slate-950 shadow-sm space-y-6">
                            <h3 className="font-bold text-lg border-b pb-2">Informação de Contacto</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Mail className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-sm font-medium">Email Principal</p>
                                            <p className="text-sm text-muted-foreground">{supplier.email || 'Não definido'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Phone className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-sm font-medium">Telefone / Telemóvel</p>
                                            <p className="text-sm text-muted-foreground">{supplier.phone || 'Não definido'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><MapPin className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-sm font-medium">Morada</p>
                                            <p className="text-sm text-muted-foreground">{supplier.address || 'Não definido'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><User className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-sm font-medium">Pessoa de Contacto</p>
                                            <p className="text-sm text-muted-foreground">{supplier.contactPerson || 'Não definido'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold">NIF</div>
                                        <div>
                                            <p className="text-sm font-medium">Contribuinte</p>
                                            <p className="text-sm text-muted-foreground font-mono">{supplier.nif}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-slate-100 text-slate-600"><Calendar className="h-4 w-4" /></div>
                                        <div>
                                            <p className="text-sm font-medium">Última Interação</p>
                                            <p className="text-sm text-muted-foreground">
                                                {lastInteraction ? format(lastInteraction, "dd/MM/yyyy", { locale: pt }) : 'Nunca'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes and Tags */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                    <FileText className="h-4 w-4" /> Notas Internas
                                </h3>
                                <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 min-h-[100px] text-sm text-slate-600 italic">
                                    {supplier.notes || 'Sem observações registadas.'}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                                    <History className="h-4 w-4" /> Tags e Palavras-Chave
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {supplier.tags ? supplier.tags.split(',').map(tag => (
                                        <Badge key={tag} className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none rounded-full px-3">
                                            {tag.trim()}
                                        </Badge>
                                    )) : <p className="text-sm text-muted-foreground">Sem tags.</p>}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="occurrences" className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <Wrench className="h-4 w-4" /> Histórico de Assistências
                            </h3>
                            <Button size="sm" variant="outline" className="gap-2">
                                <PlusCircle className="h-4 w-4" /> Nova Ocorrência
                            </Button>
                        </div>
                        {supplier.occurrences && supplier.occurrences.length > 0 ? (
                            <div className="grid gap-3">
                                {supplier.occurrences.map(occ => (
                                    <div key={occ.id} className="p-4 rounded-xl border hover:border-blue-300 transition-colors group cursor-pointer">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant={occ.priority === 'URGENTE' ? 'destructive' : 'secondary'}>
                                                {occ.priority}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{format(new Date(occ.reportedAt), "dd/MM/yyyy")}</span>
                                        </div>
                                        <h4 className="font-bold group-hover:text-blue-600 transition-colors">{occ.title}</h4>
                                        <p className="text-sm text-muted-foreground">{occ.condominium?.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center border rounded-xl border-dashed">
                                <p className="text-muted-foreground">Nenhuma ocorrência atribuída a este fornecedor.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="finance" className="mt-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Coins className="h-4 w-4" /> Movimentos Financeiros
                        </h3>
                        {supplier.transactions && supplier.transactions.length > 0 ? (
                            <div className="rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Data</th>
                                            <th className="text-left p-3 font-medium">Condomínio</th>
                                            <th className="text-left p-3 font-medium">Descrição</th>
                                            <th className="text-right p-3 font-medium">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {supplier.transactions.map(t => (
                                            <tr key={t.id} className="hover:bg-slate-50/50">
                                                <td className="p-3">{format(new Date(t.date), "dd/MM/yyyy")}</td>
                                                <td className="p-3">{t.condominium?.name}</td>
                                                <td className="p-3">{t.description}</td>
                                                <td className="p-3 text-right font-bold text-rose-600">{formatCurrency(t.amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center border rounded-xl border-dashed">
                                <p className="text-muted-foreground">Sem pagamentos registados.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="docs" className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Arquivo de Documentos
                            </h3>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Upload className="h-4 w-4" /> Carregar
                            </Button>
                        </div>
                        {supplier.documents && supplier.documents.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {supplier.documents.map(doc => (
                                    <div key={doc.id} className="p-3 rounded-lg border flex items-center justify-between group hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium truncate">{doc.title}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase">{doc.category}</p>
                                            </div>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center border rounded-xl border-dashed">
                                <p className="text-muted-foreground">Sem documentos anexados.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}

function PlusCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
        </svg>
    )
}
