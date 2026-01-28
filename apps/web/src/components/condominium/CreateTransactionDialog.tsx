import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { transactionSchema, type TransactionInput } from '@condoflow/shared';
import { Euro, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    condominiumId: string;
    type: 'RECEITA' | 'DESPESA';
}

export function CreateTransactionDialog({ open, onOpenChange, condominiumId, type }: CreateTransactionDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TransactionInput>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            condominiumId,
            type,
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: type === 'RECEITA' ? 'QUOTA' : 'MANUTENCAO',
            paymentMethod: 'TRANSFERENCIA',
        },
    });

    const createTransaction = useMutation({
        mutationFn: (data: TransactionInput) => apiClient.post('/transactions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['condominium-transactions', condominiumId] });
            queryClient.invalidateQueries({ queryKey: ['condominium-activity', condominiumId] });
            queryClient.invalidateQueries({ queryKey: ['condominium', condominiumId] });
            toast({
                title: type === 'RECEITA' ? 'Receita registada' : 'Despesa registada',
                description: 'O movimento financeiro foi criado com sucesso.',
            });
            onOpenChange(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro ao registar movimento',
                description: error.message || 'Ocorreu um erro inesperado.',
            });
        },
    });

    const onSubmit = (data: TransactionInput) => {
        createTransaction.mutate(data);
    };

    const isExpense = type === 'DESPESA';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className={cn(
                    "p-8 text-white",
                    isExpense ? "bg-red-600" : "bg-green-600"
                )}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            {isExpense ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest">
                            Registar {isExpense ? 'Despesa' : 'Receita'}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-white/80 font-medium">
                        {isExpense ? 'Registe um pagamento efetuado pelo condomínio.' : 'Registe uma entrada de fundos ou pagamento de quotas.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Descrição do Movimento</Label>
                            <Input
                                id="description"
                                {...register('description')}
                                placeholder="Ex: Pagamento EDP - Escadas"
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.description && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.description.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Montante (€)</Label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    {...register('amount', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="h-11 pl-10 font-black text-lg border-gray-200"
                                />
                            </div>
                            {errors.amount && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.amount.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data do Movimento</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="date"
                                    type="date"
                                    {...register('date')}
                                    className="h-11 pl-10 font-bold border-gray-200"
                                />
                            </div>
                            {errors.date && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.date.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Categoria</Label>
                            <Select onValueChange={(val) => setValue('category', val as any)} defaultValue={isExpense ? 'MANUTENCAO' : 'QUOTA'}>
                                <SelectTrigger className="h-11 font-bold border-gray-200">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isExpense ? (
                                        <>
                                            <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                                            <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                            <SelectItem value="AGUA">Água</SelectItem>
                                            <SelectItem value="ELETRICIDADE">Eletricidade</SelectItem>
                                            <SelectItem value="SEGURO">Seguro</SelectItem>
                                            <SelectItem value="OBRA">Obra</SelectItem>
                                            <SelectItem value="OUTRO">Outro</SelectItem>
                                        </>
                                    ) : (
                                        <>
                                            <SelectItem value="QUOTA">Quota Mensal</SelectItem>
                                            <SelectItem value="FUNDO_RESERVA">Fundo de Reserva</SelectItem>
                                            <SelectItem value="OUTRO">Outro</SelectItem>
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="paymentMethod" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Método de Pagamento</Label>
                            <Select onValueChange={(val) => setValue('paymentMethod', val as any)} defaultValue="TRANSFERENCIA">
                                <SelectTrigger className="h-11 font-bold border-gray-200">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                                    <SelectItem value="MULTIBANCO">Multibanco</SelectItem>
                                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                                    <SelectItem value="DEBITO_DIRETO">Débito Direto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase tracking-widest text-[10px]">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "h-11 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg",
                                isExpense ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            )}
                        >
                            {isSubmitting ? 'A Registar...' : `Confirmar ${isExpense ? 'Despesa' : 'Receita'}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
