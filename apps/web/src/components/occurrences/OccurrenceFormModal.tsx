import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { occurrenceSchema, OccurrenceInput, Occurrence } from '@condoflow/shared';
import { apiClient } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

interface OccurrenceFormModalProps {
    opened: boolean;
    onClose: () => void;
    occurrence?: Occurrence | null;
    onSuccess: () => void;
}

export function OccurrenceFormModal({
    opened,
    onClose,
    occurrence,
    onSuccess,
}: OccurrenceFormModalProps) {
    const { toast } = useToast();
    const isEditing = !!occurrence;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<OccurrenceInput>({
        resolver: zodResolver(occurrenceSchema),
        defaultValues: {
            condominiumId: occurrence?.condominiumId || '',
            fractionId: occurrence?.fractionId || null,
            title: occurrence?.title || '',
            description: occurrence?.description || '',
            category: occurrence?.category || 'OUTRO',
            priority: occurrence?.priority || 'NORMAL',
            location: occurrence?.location || '',
            reportedBy: occurrence?.reportedBy || 'Administração',
            slaDeadline: occurrence?.slaDeadline ? new Date(occurrence.slaDeadline).toISOString() : undefined,
            assignedSupplierId: occurrence?.assignedSupplierId || null,
            notes: occurrence?.notes || '',
        },
    });

    const selectedCondoId = form.watch('condominiumId');

    const { data: condosData } = useQuery({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get('/condominiums', { pageSize: 100 }),
    });

    const { data: fractionsData } = useQuery({
        queryKey: ['fractions-list', selectedCondoId],
        queryFn: () => apiClient.get(`/condominiums/${selectedCondoId}/fractions`),
        enabled: !!selectedCondoId,
    });

    const { data: suppliersData } = useQuery({
        queryKey: ['suppliers-list'],
        queryFn: () => apiClient.get('/suppliers', { pageSize: 100 }),
    });

    const condominiums = condosData?.data || [];
    const fractions = fractionsData?.data || [];
    const suppliers = suppliersData?.data || [];

    useEffect(() => {
        if (opened) {
            if (occurrence) {
                form.reset({
                    condominiumId: occurrence.condominiumId,
                    fractionId: occurrence.fractionId,
                    title: occurrence.title,
                    description: occurrence.description,
                    category: occurrence.category,
                    priority: occurrence.priority,
                    location: occurrence.location,
                    reportedBy: occurrence.reportedBy,
                    slaDeadline: occurrence.slaDeadline ? new Date(occurrence.slaDeadline).toISOString() : undefined,
                    assignedSupplierId: occurrence.assignedSupplierId,
                    notes: occurrence.notes || '',
                });
            } else {
                form.reset({
                    condominiumId: '',
                    fractionId: null,
                    title: '',
                    description: '',
                    category: 'OUTRO',
                    priority: 'NORMAL',
                    location: '',
                    reportedBy: 'Administração',
                    slaDeadline: undefined,
                    assignedSupplierId: null,
                    notes: '',
                });
            }
        }
    }, [opened, occurrence, form]);

    const onSubmit = async (data: OccurrenceInput) => {
        try {
            setIsSubmitting(true);
            if (isEditing) {
                await apiClient.put(`/occurrences/${occurrence!.id}`, data);
                toast({
                    title: 'Ocorrência atualizada',
                    description: 'A ocorrência foi atualizada com sucesso.',
                });
            } else {
                await apiClient.post('/occurrences', data);
                toast({
                    title: 'Ocorrência criada',
                    description: 'A ocorrência foi criada com sucesso.',
                });
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro ao guardar ocorrência',
                description: error?.message || 'Tente novamente mais tarde.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={opened} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Ocorrência' : 'Nova Ocorrência'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="condominiumId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Condomínio *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isEditing}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {condominiums.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fractionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fração (Opcional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value || 'Geral'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Geral / Selecionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Geral">Geral (Partes Comuns)</SelectItem>
                                                {fractions.map((f: any) => (
                                                    <SelectItem key={f.id} value={f.id}>
                                                        {f.number} - {f.ownerName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoria *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="INFILTRACAO">Infiltração</SelectItem>
                                                <SelectItem value="ELEVADOR">Elevador</SelectItem>
                                                <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                                <SelectItem value="ELETRICIDADE">Eletricidade</SelectItem>
                                                <SelectItem value="CANALIZACAO">Canalização</SelectItem>
                                                <SelectItem value="SEGURANCA">Segurança</SelectItem>
                                                <SelectItem value="OUTRO">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridade *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="URGENTE">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Infiltração na garagem" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreve detalhadamente o problema..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localização exata *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Piso -1, junto ao lugar 12" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="assignedSupplierId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Atribuir Fornecedor</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === 'NONE' ? null : val)}
                                            value={field.value || 'NONE'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sem fornecedor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">Sem fornecedor</SelectItem>
                                                {suppliers.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slaDeadline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prazo / SLA</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'A guardar...' : isEditing ? 'Atualizar' : 'Criar Ocorrência'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
