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
import { occurrenceSchema, type OccurrenceInput } from '@condoflow/shared';
import { Textarea } from '@/components/ui/textarea';

interface CreateOccurrenceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    condominiumId: string;
}

export function CreateOccurrenceDialog({ open, onOpenChange, condominiumId }: CreateOccurrenceDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<OccurrenceInput>({
        resolver: zodResolver(occurrenceSchema),
        defaultValues: {
            condominiumId,
            category: 'OUTRO',
            priority: 'NORMAL',
            location: '',
            reportedBy: 'Administração',
        },
    });

    const createOccurrence = useMutation({
        mutationFn: (data: OccurrenceInput) => apiClient.post('/occurrences', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['condominium-occurrences', condominiumId] });
            queryClient.invalidateQueries({ queryKey: ['condominium-activity', condominiumId] });
            queryClient.invalidateQueries({ queryKey: ['condominium', condominiumId] });
            toast({
                title: 'Ocorrência registada',
                description: 'A ocorrência foi criada com sucesso.',
            });
            onOpenChange(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro ao criar ocorrência',
                description: error.message || 'Ocorreu um erro inesperado.',
            });
        },
    });

    const onSubmit = (data: OccurrenceInput) => {
        createOccurrence.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gray-900 text-white">
                    <DialogTitle className="text-2xl font-black uppercase tracking-widest">Nova Ocorrência</DialogTitle>
                    <DialogDescription className="text-gray-400 font-medium">
                        Reporte um problema ou pedido de manutenção para este condomínio.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Título do Incidente</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Ex: Infiltração no teto da garagem"
                                className="h-11 font-bold border-gray-200 focus:ring-primary"
                            />
                            {errors.title && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Categoria</Label>
                                <Select onValueChange={(val) => setValue('category', val as any)} defaultValue="OUTRO">
                                    <SelectTrigger className="h-11 font-bold border-gray-200">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INFILTRACAO">Infiltração</SelectItem>
                                        <SelectItem value="ELEVADOR">Elevador</SelectItem>
                                        <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                        <SelectItem value="ELETRICIDADE">Eletricidade</SelectItem>
                                        <SelectItem value="CANALIZACAO">Canalização</SelectItem>
                                        <SelectItem value="OUTRO">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Prioridade</Label>
                                <Select onValueChange={(val) => setValue('priority', val as any)} defaultValue="NORMAL">
                                    <SelectTrigger className="h-11 font-bold border-gray-200">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NORMAL">Normal</SelectItem>
                                        <SelectItem value="URGENTE">Urgente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Localização Exata</Label>
                            <Input
                                id="location"
                                {...register('location')}
                                placeholder="Ex: Piso -1, junto ao lugar 24"
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.location && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.location.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Descrição Detalhada</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Descreva o problema com o máximo de detalhe possível..."
                                className="min-h-[120px] font-medium border-gray-200"
                            />
                            {errors.description && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.description.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase tracking-widest text-[10px]">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="h-11 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg">
                            {isSubmitting ? 'A Registar...' : 'Registar Ocorrência'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
