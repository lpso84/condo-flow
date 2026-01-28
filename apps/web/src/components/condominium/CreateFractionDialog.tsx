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
import { fractionSchema, type FractionInput } from '@condoflow/shared';
import { Home, User, Percent, Euro } from 'lucide-react';

interface CreateFractionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    condominiumId: string;
}

export function CreateFractionDialog({ open, onOpenChange, condominiumId }: CreateFractionDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FractionInput>({
        resolver: zodResolver(fractionSchema),
        defaultValues: {
            condominiumId,
            number: '',
            floor: '',
            typology: 'T2',
            permillage: 0,
            monthlyQuota: 0,
            ownerName: '',
            occupation: 'PROPRIETARIO',
            isActive: true,
        },
    });

    const createFraction = useMutation({
        mutationFn: (data: FractionInput) => apiClient.post('/fractions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['condominium-fractions', condominiumId] });
            queryClient.invalidateQueries({ queryKey: ['condominium', condominiumId] });
            toast({
                title: 'Fração criada',
                description: 'A unidade foi adicionada com sucesso.',
            });
            onOpenChange(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro ao criar fração',
                description: error.message || 'Ocorreu um erro inesperado.',
            });
        },
    });

    const onSubmit = (data: FractionInput) => {
        createFraction.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gray-900 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Home className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest">Nova Fração</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 font-medium">
                        Adicione uma nova unidade habitacional ou comercial ao condomínio.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="number" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Número / Letra</Label>
                            <Input
                                id="number"
                                {...register('number')}
                                placeholder="Ex: 1º Dto, Loja A"
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.number && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.number.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="floor" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Piso / Andar</Label>
                            <Input
                                id="floor"
                                {...register('floor')}
                                placeholder="Ex: 1, Cave, R/C"
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.floor && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.floor.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="typology" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tipologia</Label>
                            <Select onValueChange={(val) => setValue('typology', val as any)} defaultValue="T2">
                                <SelectTrigger className="h-11 font-bold border-gray-200">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="T0">T0</SelectItem>
                                    <SelectItem value="T1">T1</SelectItem>
                                    <SelectItem value="T2">T2</SelectItem>
                                    <SelectItem value="T3">T3</SelectItem>
                                    <SelectItem value="T4">T4</SelectItem>
                                    <SelectItem value="OUTRO">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="permillage" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Permilagem (‰)</Label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="permillage"
                                    type="number"
                                    step="0.01"
                                    {...register('permillage', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="h-11 pl-10 font-bold border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2 col-span-2">
                            <Label htmlFor="ownerName" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome do Proprietário</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="ownerName"
                                    {...register('ownerName')}
                                    placeholder="Nome completo"
                                    className="h-11 pl-10 font-bold border-gray-200"
                                />
                            </div>
                            {errors.ownerName && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.ownerName.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="monthlyQuota" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quota Mensal (€)</Label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    id="monthlyQuota"
                                    type="number"
                                    step="0.01"
                                    {...register('monthlyQuota', { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="h-11 pl-10 font-black text-lg border-gray-200"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="occupation" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ocupação</Label>
                            <Select onValueChange={(val) => setValue('occupation', val as any)} defaultValue="PROPRIETARIO">
                                <SelectTrigger className="h-11 font-bold border-gray-200">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PROPRIETARIO">Proprietário</SelectItem>
                                    <SelectItem value="ARRENDADA">Arrendada</SelectItem>
                                    <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase tracking-widest text-[10px]">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-11 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg">
                            {isSubmitting ? 'A Criar...' : 'Criar Unidade'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
