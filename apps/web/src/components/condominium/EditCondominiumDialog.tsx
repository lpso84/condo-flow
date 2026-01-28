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
import { useToast } from '@/components/ui/use-toast';
import { condominiumSchema, type CondominiumInput } from '@condoflow/shared';
import { Building2, MapPin, CreditCard, Hash } from 'lucide-react';

interface EditCondominiumDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    condominium: any;
}

export function EditCondominiumDialog({ open, onOpenChange, condominium }: EditCondominiumDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CondominiumInput>({
        resolver: zodResolver(condominiumSchema),
        defaultValues: {
            name: condominium.name,
            address: condominium.address,
            postalCode: condominium.postalCode,
            city: condominium.city,
            nif: condominium.nif,
            bankAccount: condominium.bankAccount,
        },
    });

    const updateCondominium = useMutation({
        mutationFn: (data: CondominiumInput) => apiClient.put(`/condominiums/${condominium.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['condominium', condominium.id] });
            queryClient.invalidateQueries({ queryKey: ['condominiums'] });
            toast({
                title: 'Condomínio atualizado',
                description: 'As informações foram guardadas com sucesso.',
            });
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro ao atualizar',
                description: error.message || 'Ocorreu um erro inesperado.',
            });
        },
    });

    const onSubmit = (data: CondominiumInput) => {
        updateCondominium.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gray-900 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest">Editar Condomínio</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 font-medium">
                        Atualize os dados cadastrais e financeiros do edifício.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome do Condomínio</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.name && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Morada Completa</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="address"
                                    {...register('address')}
                                    className="h-11 pl-10 font-bold border-gray-200"
                                />
                            </div>
                            {errors.address && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="postalCode" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Código Postal</Label>
                            <Input
                                id="postalCode"
                                {...register('postalCode')}
                                placeholder="0000-000"
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.postalCode && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.postalCode.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cidade</Label>
                            <Input
                                id="city"
                                {...register('city')}
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.city && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.city.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="nif" className="text-[10px] font-black uppercase tracking-widest text-gray-500">NIF (Contribuinte)</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="nif"
                                    {...register('nif')}
                                    className="h-11 pl-10 font-bold border-gray-200"
                                />
                            </div>
                            {errors.nif && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.nif.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bankAccount" className="text-[10px] font-black uppercase tracking-widest text-gray-500">IBAN / Conta Bancária</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="bankAccount"
                                    {...register('bankAccount')}
                                    className="h-11 pl-10 font-bold border-gray-200"
                                />
                            </div>
                            {errors.bankAccount && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.bankAccount.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase tracking-widest text-[10px]">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-11 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg">
                            {isSubmitting ? 'A Guardar...' : 'Guardar Alterações'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
