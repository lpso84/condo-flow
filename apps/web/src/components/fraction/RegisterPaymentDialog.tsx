import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { CreditCard, Calendar, FileText, Wallet } from 'lucide-react';
import type { Fraction } from '@condoflow/shared';

interface RegisterPaymentDialogProps {
    fraction: Fraction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RegisterPaymentDialog({ fraction, open, onOpenChange }: RegisterPaymentDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('TRANSFERENCIA');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [reference, setReference] = useState('');

    const mutation = useMutation({
        mutationFn: (data: any) => apiClient.post(`/fractions/${fraction?.id}/payments`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fractions-global'] });
            queryClient.invalidateQueries({ queryKey: ['fraction-detail', fraction?.id] });
            toast({
                title: "Pagamento registado",
                description: `O pagamento de ${amount}€ foi registado com sucesso.`,
            });
            onOpenChange(false);
            resetForm();
        },
        onError: () => {
            toast({
                variant: "destructive",
                title: "Erro ao registar pagamento",
                description: "Ocorreu um erro ao processar o pagamento.",
            });
        }
    });

    const resetForm = () => {
        setAmount('');
        setMethod('TRANSFERENCIA');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setReference('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;

        mutation.mutate({
            amount: Number(amount),
            date,
            method,
            description,
            reference
        });
    };

    if (!fraction) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Registar Pagamento
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        Registar entrada de fundos para a fração <span className="font-black text-gray-900">{fraction.number}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Montante (€)</Label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-9 font-bold text-lg h-12"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Dívida atual: <span className="font-bold text-red-600">{fraction.debtAmount}€</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="date"
                                    type="date"
                                    className="pl-9 h-10 text-xs font-medium"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="method" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Método</Label>
                            <Select value={method} onValueChange={setMethod}>
                                <SelectTrigger className="h-10 text-xs font-medium">
                                    <SelectValue />
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

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descrição (Opcional)</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="description"
                                placeholder={`Pagamento quota - Fração ${fraction.number}`}
                                className="pl-9 h-10 text-xs"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Referência / Comprovativo</Label>
                        <Input
                            id="reference"
                            placeholder="Ex: TRF123456789"
                            className="h-10 text-xs font-mono"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-bold">Cancelar</Button>
                        <Button type="submit" className="font-bold px-8 shadow-md" disabled={mutation.isPending}>
                            {mutation.isPending ? "A processar..." : "Confirmar Pagamento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
