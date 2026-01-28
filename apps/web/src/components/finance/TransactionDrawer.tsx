import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    CreditCard,
    User,
    Building2,
    Tag,
    Download,
    FileText,
    History,
    CheckCircle2,
    XCircle,
    Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Transaction } from '@condoflow/shared';

interface TransactionDrawerProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TransactionDrawer({ transaction, open, onOpenChange }: TransactionDrawerProps) {
    if (!transaction) return null;

    const isRevenue = transaction.type === 'RECEITA';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="pb-6 border-b">
                    <div className="flex items-center gap-2 mb-2">
                        {transaction.status === 'ANULADO' ? (
                            <Badge variant="destructive">Anulado</Badge>
                        ) : (
                            <Badge className={isRevenue ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}>
                                {isRevenue ? 'Receita' : 'Despesa'}
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground font-mono ml-auto">#{transaction.id.slice(0, 8)}</span>
                    </div>
                    <SheetTitle className="text-2xl font-bold">
                        {formatCurrency(transaction.amount)}
                    </SheetTitle>
                    <SheetDescription className="text-base font-medium text-slate-900 dark:text-slate-100">
                        {transaction.description}
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-8">
                    {/* Informações Principais */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Data do Movimento</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Condomínio</p>
                                <p className="text-sm text-muted-foreground font-semibold">{transaction.condominium?.name}</p>
                            </div>
                        </div>

                        {transaction.fraction && (
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Fração Associada</p>
                                    <p className="text-sm text-muted-foreground">
                                        Fração {transaction.fraction.number} - {transaction.fraction.ownerName}
                                    </p>
                                </div>
                            </div>
                        )}

                        {transaction.supplier && (
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Fornecedor</p>
                                    <p className="text-sm text-muted-foreground">{transaction.supplier.name}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-start gap-3">
                            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Categoria</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {transaction.category.toLowerCase().replace('_', ' ')}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Método de Pagamento</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    {transaction.paymentMethod?.toLowerCase().replace('_', ' ') || 'Não especificado'}
                                </p>
                                {transaction.reference && (
                                    <p className="text-xs font-mono mt-1 text-slate-500">Ref: {transaction.reference}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Documentos */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Comprovativos
                        </h3>
                        {transaction.documents && transaction.documents.length > 0 ? (
                            <div className="space-y-2">
                                {transaction.documents.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900 group">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm truncate">{doc.title}</span>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground p-4 text-center border border-dashed rounded-lg">
                                Nenhum documento anexado
                            </div>
                        )}
                    </div>

                    {/* Histórico/Timeline */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <History className="h-4 w-4" /> Histórico do Movimento
                        </h3>
                        <div className="relative pl-4 border-l space-y-4">
                            <div className="relative">
                                <CheckCircle2 className="absolute -left-[22px] h-4 w-4 bg-white dark:bg-slate-950 text-emerald-500 rounded-full" />
                                <div className="text-xs">
                                    <p className="font-semibold">Movimento Criado</p>
                                    <p className="text-muted-foreground">{format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm")}</p>
                                </div>
                            </div>
                            {transaction.status === 'ANULADO' && (
                                <div className="relative">
                                    <XCircle className="absolute -left-[22px] h-4 w-4 bg-white dark:bg-slate-950 text-rose-500 rounded-full" />
                                    <div className="text-xs">
                                        <p className="font-semibold text-rose-600">Movimento Anulado</p>
                                        <p className="text-muted-foreground">{format(new Date(transaction.updatedAt), "dd/MM/yyyy HH:mm")}</p>
                                    </div>
                                </div>
                            )}
                            {transaction.status === 'PENDENTE' && (
                                <div className="relative">
                                    <Clock className="absolute -left-[22px] h-4 w-4 bg-white dark:bg-slate-950 text-amber-500 rounded-full" />
                                    <div className="text-xs">
                                        <p className="font-semibold text-amber-600">Marcado como Pendente</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
