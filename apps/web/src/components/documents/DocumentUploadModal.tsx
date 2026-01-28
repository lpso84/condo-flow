import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DocumentCategory } from '@condoflow/shared';
import { toast } from 'sonner';

const formSchema = z.object({
    condominiumId: z.string().min(1, 'Condomínio é obrigatório'),
    category: z.nativeEnum(DocumentCategory),
    title: z.string().min(3, 'Título é obrigatório'),
    fileName: z.string().min(1, 'Selecione um ficheiro'),
    tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
    condominiums: { id: string; name: string }[];
}

export function DocumentUploadModal({ open, onOpenChange, onSubmit, condominiums }: DocumentUploadModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: DocumentCategory.OUTROS,
            title: '',
            fileName: '',
            tags: '',
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setValue('fileName', selectedFile.name);
            if (!watch('title')) {
                setValue('title', selectedFile.name);
            }
        }
    };

    const submitHandler = async (data: FormValues) => {
        if (!file) {
            toast.error('Selecione um ficheiro');
            return;
        }
        setSubmitting(true);
        try {
            // Here we would upload the file first or send FormData
            // For now pass data + file object mock
            await onSubmit({ ...data, file });
            onOpenChange(false);
            reset();
            setFile(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Documento</DialogTitle>
                    <DialogDescription>
                        Carregue um novo documento para o sistema.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Ficheiro</Label>
                        <Input type="file" onChange={handleFileChange} />
                        {errors.fileName && <p className="text-red-500 text-xs">{errors.fileName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Condomínio</Label>
                        <Select onValueChange={(v) => setValue('condominiumId', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {condominiums.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.condominiumId && <p className="text-red-500 text-xs">{errors.condominiumId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select
                            onValueChange={(v: any) => setValue('category', v)}
                            defaultValue={watch('category')}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(DocumentCategory).map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Título</Label>
                        <Input {...register('title')} />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Tags (separadas por vírgula)</Label>
                        <Input {...register('tags')} placeholder="importante, minuta, 2024" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'A carregar...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
