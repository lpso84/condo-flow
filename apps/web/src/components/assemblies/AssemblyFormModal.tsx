import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AssemblyType, AssemblyStatus } from '@condoflow/shared';
import { Plus, Trash } from 'lucide-react';

const agendaItemSchema = z.object({
    title: z.string().min(3, 'O título é obrigatório'),
    description: z.string().optional(),
});

const formSchema = z.object({
    condominiumId: z.string().min(1, 'Condomínio é obrigatório'),
    year: z.coerce.number().min(2000, 'Ano inválido'),
    type: z.nativeEnum(AssemblyType),
    status: z.nativeEnum(AssemblyStatus),
    date: z.string().optional(), // ISO datetime
    location: z.string().optional(),
    agendaItems: z.array(agendaItemSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssemblyFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: FormValues) => Promise<void>;
    condominiums: { id: string; name: string }[];
    initialData?: any;
}

export function AssemblyFormModal({ open, onOpenChange, onSubmit, condominiums, initialData }: AssemblyFormModalProps) {
    const [submitting, setSubmitting] = useState(false);

    const { register, control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            year: new Date().getFullYear(),
            type: AssemblyType.AGO,
            status: AssemblyStatus.NAO_MARCADA,
            agendaItems: [{ title: 'Aprovação de contas', description: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'agendaItems',
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    condominiumId: initialData.condominiumId,
                    year: initialData.year,
                    type: initialData.type,
                    status: initialData.status,
                    date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
                    location: initialData.location || '',
                    agendaItems: initialData.agendaItems?.map((i: any) => ({ title: i.title, description: i.description })) || [],
                });
            } else {
                reset({
                    year: new Date().getFullYear(),
                    type: AssemblyType.AGO,
                    status: AssemblyStatus.NAO_MARCADA,
                    agendaItems: [{ title: 'Aprovação de contas', description: '' }],
                    condominiumId: '',
                    date: '',
                    location: '',
                });
            }
        }
    }, [open, initialData, reset]);

    const submitHandler = async (data: FormValues) => {
        setSubmitting(true);
        try {
            await onSubmit(data);
            onOpenChange(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Assembleia' : 'Nova Assembleia'}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados da assembleia abaixo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Condomínio</Label>
                            <Select
                                onValueChange={(v) => setValue('condominiumId', v)}
                                defaultValue={watch('condominiumId')}
                                disabled={!!initialData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {condominiums.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Error display omitted for brevity but should be here */}
                        </div>

                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <Input type="number" {...register('year')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select onValueChange={(v: any) => setValue('type', v)} defaultValue={watch('type')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={AssemblyType.AGO}>Ordinária (AGO)</SelectItem>
                                    <SelectItem value={AssemblyType.AGE}>Extraordinária (AGE)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select onValueChange={(v: any) => setValue('status', v)} defaultValue={watch('status')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(AssemblyStatus).map(s => (
                                        <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Data / Hora</Label>
                            <Input type="datetime-local" {...register('date')} />
                        </div>

                        <div className="space-y-2">
                            <Label>Local</Label>
                            <Input placeholder="Ex: Salão de Festas" {...register('location')} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Ordem de Trabalhos</Label>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ title: '', description: '' })}>
                                <Plus className="h-4 w-4 mr-2" /> Adicionar Ponto
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-start border p-2 rounded">
                                    <div className="flex-1 space-y-2">
                                        <Input placeholder={`Ponto ${index + 1}`} {...register(`agendaItems.${index}.title` as const)} />
                                        <Textarea placeholder="Descrição (opcional)" className="h-16" {...register(`agendaItems.${index}.description` as const)} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <Trash className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
