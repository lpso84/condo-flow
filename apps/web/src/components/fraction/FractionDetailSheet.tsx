import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    User,
    Phone,
    Mail,
    Building2,
    CreditCard,
    FileText,
    AlertCircle,
    Plus,
    ArrowUpRight,
    Clock,
    Download
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import type { Fraction, Transaction, Occurrence } from '@condoflow/shared';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface FractionDetailSheetProps {
    fractionId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FractionDetailSheet({ fractionId, open, onOpenChange }: FractionDetailSheetProps) {
    const { data: fraction, isLoading } = useQuery<Fraction & { transactions: Transaction[], occurrences: Occurrence[] }>({
        queryKey: ['fraction-detail', fractionId],
        queryFn: () => apiClient.get<Fraction & { transactions: Transaction[], occurrences: Occurrence[] }>(`/fractions/${fractionId}`).then(res => res.data),
        enabled: !!fractionId && open,
    });

    if (!fraction && !isLoading) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">A carregar detalhes da fração...</p>
                    </div>
                ) : fraction ? (
                    <>
                        <SheetHeader className="pb-6 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-xl font-black text-primary border border-primary/20">
                                        {fraction.number}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-2xl font-black tracking-tight">Fração {fraction.number}</SheetTitle>
                                        <SheetDescription className="flex items-center gap-2 mt-1">
                                            <Building2 className="w-3.5 h-3.5" /> {fraction.condominium?.name}
                                        </SheetDescription>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={cn(
                                        "text-xl font-black tabular-nums",
                                        fraction.debtAmount > 0 ? "text-red-600" : "text-green-600"
                                    )}>
                                        {formatCurrency(fraction.debtAmount)}
                                    </div>
                                    <Badge variant={fraction.debtAmount > 0 ? "destructive" : "success"} className="mt-1">
                                        {fraction.debtAmount > 0 ? "EM DÍVIDA" : "REGULARIZADO"}
                                    </Badge>
                                </div>
                            </div>
                        </SheetHeader>

                        <Tabs defaultValue="overview" className="mt-6">
                            <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100/50 p-1">
                                <TabsTrigger value="overview" className="font-bold text-xs uppercase tracking-widest">Geral</TabsTrigger>
                                <TabsTrigger value="finance" className="font-bold text-xs uppercase tracking-widest">Financeiro</TabsTrigger>
                                <TabsTrigger value="occurrences" className="font-bold text-xs uppercase tracking-widest">Ocorrências</TabsTrigger>
                                <TabsTrigger value="docs" className="font-bold text-xs uppercase tracking-widest">Documentos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6 mt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Informação da Unidade</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Andar/Piso</span>
                                                <span className="font-bold">{fraction.floor}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Tipologia</span>
                                                <span className="font-bold">{fraction.typology || 'T2'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Permilagem</span>
                                                <span className="font-bold">{fraction.permillage}‰</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Quota Mensal</span>
                                                <span className="font-bold">{formatCurrency(fraction.monthlyQuota)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Estado de Ocupação</p>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge variant="outline" className="bg-white font-bold">
                                                {fraction.occupation === 'PROPRIETARIO' ? 'Proprietário' :
                                                    fraction.occupation === 'ARRENDADA' ? 'Arrendada' : 'Desconhecido'}
                                            </Badge>
                                            {fraction.isActive ? (
                                                <Badge className="bg-green-500 font-bold">ATIVA</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="font-bold">INATIVA</Badge>
                                            )}
                                        </div>
                                        {fraction.isFollowUp && (
                                            <div className="flex items-center gap-2 text-xs text-orange-600 font-bold bg-orange-50 p-2 rounded border border-orange-100">
                                                <AlertCircle className="w-3.5 h-3.5" /> EM ACOMPANHAMENTO
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-4 h-4 text-primary" /> Contactos Principais
                                    </h3>
                                    <div className="bg-white border rounded-xl p-4 space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Proprietário</p>
                                            <p className="font-bold text-gray-900">{fraction.ownerName}</p>
                                            <div className="flex gap-4 mt-2">
                                                {fraction.ownerEmail && (
                                                    <a href={`mailto:${fraction.ownerEmail}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {fraction.ownerEmail}
                                                    </a>
                                                )}
                                                {fraction.ownerPhone && (
                                                    <a href={`tel:${fraction.ownerPhone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                        <Phone className="w-3 h-3" /> {fraction.ownerPhone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                        {fraction.tenantName && (
                                            <div className="pt-4 border-t">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Inquilino</p>
                                                <p className="font-bold text-gray-900">{fraction.tenantName}</p>
                                                <div className="flex gap-4 mt-2">
                                                    {fraction.tenantEmail && (
                                                        <a href={`mailto:${fraction.tenantEmail}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {fraction.tenantEmail}
                                                        </a>
                                                    )}
                                                    {fraction.tenantPhone && (
                                                        <a href={`tel:${fraction.tenantPhone}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {fraction.tenantPhone}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 font-bold h-11 shadow-sm">
                                        <CreditCard className="w-4 h-4 mr-2" /> Registar Pagamento
                                    </Button>
                                    <Button variant="outline" className="flex-1 font-bold h-11 border-gray-200">
                                        <AlertCircle className="w-4 h-4 mr-2" /> Nova Ocorrência
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="finance" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-widest">Histórico de Movimentos</h3>
                                        <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Ver Extrato Completo</Button>
                                    </div>
                                    <div className="bg-white border rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="text-left p-3 font-bold text-[10px] uppercase tracking-tighter text-gray-500">Data</th>
                                                    <th className="text-left p-3 font-bold text-[10px] uppercase tracking-tighter text-gray-500">Descrição</th>
                                                    <th className="text-right p-3 font-bold text-[10px] uppercase tracking-tighter text-gray-500">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {fraction.transactions?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="p-8 text-center text-muted-foreground italic">Sem movimentos registados.</td>
                                                    </tr>
                                                ) : (
                                                    fraction.transactions?.map((t: Transaction) => (
                                                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-3 text-xs text-gray-500">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                                                            <td className="p-3 font-medium text-gray-700">{t.description}</td>
                                                            <td className={cn(
                                                                "p-3 text-right font-bold tabular-nums",
                                                                t.type === 'RECEITA' ? "text-green-600" : "text-red-600"
                                                            )}>
                                                                {t.type === 'RECEITA' ? '+' : '-'}{formatCurrency(t.amount)}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="occurrences" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-widest">Ocorrências Associadas</h3>
                                        <Button size="sm" className="h-8 font-bold text-xs"><Plus className="w-3 h-3 mr-1" /> Nova</Button>
                                    </div>
                                    <div className="space-y-3">
                                        {fraction.occurrences?.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                                <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground opacity-20 mb-2" />
                                                <p className="text-sm text-muted-foreground">Sem ocorrências ativas nesta fração.</p>
                                            </div>
                                        ) : (
                                            fraction.occurrences?.map((o: Occurrence) => (
                                                <div key={o.id} className="bg-white border rounded-xl p-4 hover:border-primary/30 transition-all group cursor-pointer">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant={o.priority === 'URGENTE' ? 'destructive' : 'secondary'} className="text-[9px] font-black h-4 px-1.5">
                                                                    {o.priority}
                                                                </Badge>
                                                                <span className="text-xs font-bold text-gray-900">{o.title}</span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{o.description}</p>
                                                        </div>
                                                        <Badge variant="outline" className="text-[9px] font-bold">
                                                            {o.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {format(new Date(o.createdAt), "d 'de' MMMM", { locale: pt })}
                                                        </span>
                                                        <ArrowUpRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="docs" className="mt-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-widest">Documentação</h3>
                                        <Button variant="outline" size="sm" className="h-8 font-bold text-xs border-gray-200">
                                            <Plus className="w-3 h-3 mr-1" /> Upload
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { name: 'Contrato de Arrendamento.pdf', size: '1.2 MB', date: '12/10/2025' },
                                            { name: 'Comprovativo_Pagamento_Set.pdf', size: '450 KB', date: '05/09/2025' },
                                            { name: 'Planta_Fracao_A.dwg', size: '5.8 MB', date: '20/01/2024' }
                                        ].map((doc, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">{doc.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{doc.size} • {doc.date}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <Download className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}
