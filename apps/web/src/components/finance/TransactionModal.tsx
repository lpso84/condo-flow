import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionInput, type Condominium, type Fraction, type Supplier, type PaginatedResponse } from '@condoflow/shared';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface TransactionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TransactionInput) => void;
    initialData?: any;
    isSubmitting?: boolean;
    type?: 'RECEITA' | 'DESPESA';
}

export function TransactionModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
    type: defaultType
}: TransactionModalProps) {
    const form = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: initialData || {
            type: defaultType || 'RECEITA',
            date: new Date().toISOString(),
            status: 'NORMAL',
            amount: 0,
            description: '',
            category: 'OUTRO',
        },
    });

    const selectedCondoId = form.watch('condominiumId');

    const { data: condosData } = useQuery<PaginatedResponse<Condominium>>({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get<PaginatedResponse<Condominium>>('/condominiums', { pageSize: 100 }).then(res => res.data),
    });

    const { data: fractionsData } = useQuery<PaginatedResponse<Fraction>>({
        queryKey: ['fractions-list', selectedCondoId],
        queryFn: () => apiClient.get<PaginatedResponse<Fraction>>(`/fractions`, { condominiumId: selectedCondoId, pageSize: 200 }).then(res => res.data),
        enabled: !!selectedCondoId,
    });

    const { data: suppliersData } = useQuery<PaginatedResponse<Supplier>>({
        queryKey: ['suppliers-list'],
        queryFn: () => apiClient.get<PaginatedResponse<Supplier>>('/suppliers', { pageSize: 100 }).then(res => res.data),
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset(initialData);
        } else if (open && !initialData) {
            form.reset({
                type: defaultType || 'RECEITA',
                date: new Date().toISOString(),
                status: 'NORMAL',
                amount: 0,
                description: '',
                category: 'OUTRO',
            });
        }
    }, [open, initialData, defaultType, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Movimento' : `Registar ${form.watch('type') === 'RECEITA' ? 'Receita' : 'Despesa'}`}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="condominiumId"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Condomínio *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {condosData?.data?.map((c: Condominium) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Data *</FormLabel>
                                        <FormControl>
                                            <Input type="date" value={field.value?.split('T')[0]} onChange={(e) => field.onChange(new Date(e.target.value).toISOString())} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Categoria *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="QUOTA">Quota</SelectItem>
                                                <SelectItem value="FUNDO_RESERVA">Fundo de Reserva</SelectItem>
                                                <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                                                <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                                <SelectItem value="SEGURO">Seguro</SelectItem>
                                                <SelectItem value="AGUA">Água</SelectItem>
                                                <SelectItem value="ELETRICIDADE">Eletricidade</SelectItem>
                                                <SelectItem value="GAS">Gás</SelectItem>
                                                <SelectItem value="ELEVADOR">Elevador</SelectItem>
                                                <SelectItem value="OBRA">Obra</SelectItem>
                                                <SelectItem value="OUTRO">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Valor (€) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Descrição *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Pagamento quota Janeiro Fração A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.watch('type') === 'RECEITA' ? (
                            <FormField
                                control={form.control}
                                name="fractionId"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Associar Fração (opcional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a fração..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fractionsData?.data?.map((f: Fraction) => (
                                                    <SelectItem key={f.id} value={f.id}>Fração {f.number} - {f.ownerName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <FormField
                                control={form.control}
                                name="supplierId"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Associar Fornecedor (opcional)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o fornecedor..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {suppliersData?.data?.map((s: Supplier) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Método de Pagamento</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                                                <SelectItem value="MULTIBANCO">Multibanco</SelectItem>
                                                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                                                <SelectItem value="DEBITO_DIRETO">Débito Direto</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reference"
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Referência / Doc #</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: REF12345" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Guardar Alterações' : 'Registar Movimento'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
