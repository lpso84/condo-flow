import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, type SupplierInput, type Supplier } from '@condoflow/shared';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SupplierFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SupplierInput) => void;
    initialData?: Supplier | null;
    isSubmitting?: boolean;
}

const CATEGORIES = [
    { value: 'MANUTENCAO', label: 'Manutenção' },
    { value: 'LIMPEZA', label: 'Limpeza' },
    { value: 'SEGURANCA', label: 'Segurança' },
    { value: 'ELETRICIDADE', label: 'Eletricidade' },
    { value: 'CANALIZACAO', label: 'Canalização' },
    { value: 'ELEVADOR', label: 'Elevadores' },
    { value: 'JARDINAGEM', label: 'Jardinagem' },
    { value: 'SEGURO', label: 'Seguros' },
    { value: 'OBRA', label: 'Obras/Construção' },
    { value: 'OUTRO', label: 'Outros' },
];

export function SupplierFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isSubmitting,
}: SupplierFormModalProps) {
    const form = useForm<SupplierInput>({
        resolver: zodResolver(supplierSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            nif: initialData.nif,
            email: initialData.email || '',
            phone: initialData.phone || '',
            address: initialData.address || '',
            contactPerson: initialData.contactPerson || '',
            categories: initialData.categories,
            notes: initialData.notes || '',
            tags: initialData.tags || '',
            favorite: initialData.favorite,
            active: initialData.active,
        } : {
            name: '',
            nif: '',
            email: '',
            phone: '',
            address: '',
            contactPerson: '',
            categories: '',
            notes: '',
            tags: '',
            favorite: false,
            active: true,
        },
    });

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                ...initialData,
                email: initialData.email || '',
                phone: initialData.phone || '',
                address: initialData.address || '',
                contactPerson: initialData.contactPerson || '',
                notes: initialData.notes || '',
                tags: initialData.tags || '',
            });
        } else if (open && !initialData) {
            form.reset({
                name: '',
                nif: '',
                email: '',
                phone: '',
                address: '',
                contactPerson: '',
                categories: '',
                notes: '',
                tags: '',
                favorite: false,
                active: true,
            });
        }
    }, [open, initialData, form]);

    const selectedCategories = form.watch('categories') ? form.watch('categories').split(',').filter(Boolean) : [];

    const toggleCategory = (cat: string) => {
        const current = form.getValues('categories') || '';
        const list = current.split(',').filter(Boolean);
        if (list.includes(cat)) {
            form.setValue('categories', list.filter(c => c !== cat).join(','));
        } else {
            form.setValue('categories', [...list, cat].join(','));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar Fornecedor' : 'Adicionar Novo Fornecedor'}</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do prestador de serviços. O NIF será validado automaticamente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Empresa *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Manutenções Lda" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nif"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NIF *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="500000000" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-[10px]">9 dígitos com validação de checksum.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-3">
                            <FormLabel className={form.formState.errors.categories ? 'text-destructive' : ''}>Categorias de Serviço *</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                                {CATEGORIES.map(cat => (
                                    <div
                                        key={cat.value}
                                        className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${selectedCategories.includes(cat.value) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                                        onClick={() => toggleCategory(cat.value)}
                                    >
                                        <Checkbox
                                            id={`cat-${cat.value}`}
                                            checked={selectedCategories.includes(cat.value)}
                                            onCheckedChange={() => toggleCategory(cat.value)}
                                        />
                                        <label htmlFor={`cat-${cat.value}`} className="text-sm font-medium cursor-pointer flex-1">
                                            {cat.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {form.formState.errors.categories && <p className="text-sm font-medium text-destructive">{form.formState.errors.categories.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="fornecedor@email.com" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Telefone / Telemóvel</FormLabel>
                                        <FormControl>
                                            <Input placeholder="910000000" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="contactPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pessoa de Contacto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nome do interlocutor" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags (separadas por vírgula)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex: urgente, profissional, barato" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Morada Completa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Rua, Número, Localidade, Código Postal" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Internas</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Observações importantes sobre este fornecedor..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 gap-8">
                            <div className="flex flex-col gap-1">
                                <FormLabel className="flex items-center gap-2">
                                    Favorito <Badge className="bg-amber-100 text-amber-700 border-none text-[10px]">Destaque</Badge>
                                </FormLabel>
                                <p className="text-xs text-muted-foreground">Aparecerá no topo e com destaque visual.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="favorite"
                                render={({ field }) => (
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'Guardar Alterações' : 'Criar Fornecedor'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
