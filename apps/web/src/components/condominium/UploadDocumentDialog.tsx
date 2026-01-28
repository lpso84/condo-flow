import { useState } from 'react';
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
import { documentSchema, type DocumentInput, DocumentCategory } from '@condoflow/shared';
import { Upload, File, X, CheckCircle2 } from 'lucide-react';

interface UploadDocumentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    condominiumId: string;
}

export function UploadDocumentDialog({ open, onOpenChange, condominiumId }: UploadDocumentDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DocumentInput>({
        resolver: zodResolver(documentSchema),
        defaultValues: {
            condominiumId,
            category: DocumentCategory.OUTROS,
            title: '',
            fileName: '',
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (data: DocumentInput) => {
            // In a real app, we would use FormData to upload the actual file.
            // For this demo, we'll simulate it by sending the metadata.
            return apiClient.post('/documents', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['condominium-documents', condominiumId] });
            toast({
                title: 'Documento carregado',
                description: 'O ficheiro foi guardado com sucesso.',
            });
            onOpenChange(false);
            reset();
            setFile(null);
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro no upload',
                description: error.message || 'Ocorreu um erro inesperado.',
            });
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setValue('fileName', selectedFile.name);
            if (!getValues('title')) {
                setValue('title', selectedFile.name.split('.')[0]);
            }
        }
    };

    const onSubmit = (data: DocumentInput) => {
        if (!file) {
            toast({
                variant: 'destructive',
                title: 'Ficheiro em falta',
                description: 'Por favor selecione um ficheiro para carregar.',
            });
            return;
        }
        uploadMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-8 bg-gray-900 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Upload className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-black uppercase tracking-widest">Upload de Documento</DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-400 font-medium">
                        Adicione atas, contratos, faturas ou outros documentos importantes.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 bg-white">
                    <div className="space-y-4">
                        {!file ? (
                            <div className="relative group">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                                />
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                                    <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-black text-gray-700 uppercase tracking-widest">Clique para selecionar</p>
                                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">PDF, DOC, Imagens ou ZIP (Máx. 10MB)</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <File className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-green-900 truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-[10px] font-black text-green-600 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:bg-green-100"
                                    onClick={() => setFile(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Título do Documento</Label>
                            <Input
                                id="title"
                                {...register('title')}
                                placeholder="Ex: Ata de Assembleia Geral 2023"
                                className="h-11 font-bold border-gray-200"
                            />
                            {errors.title && (
                                <p className="text-[10px] font-bold text-red-500 uppercase">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Categoria</Label>
                            <Select onValueChange={(val) => setValue('category', val as any)} defaultValue={DocumentCategory.OUTROS}>
                                <SelectTrigger className="h-11 font-bold border-gray-200">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DocumentCategory.ATA}>Atas</SelectItem>
                                    <SelectItem value={DocumentCategory.CONTRATO}>Contratos</SelectItem>
                                    <SelectItem value={DocumentCategory.FATURA}>Faturas</SelectItem>
                                    <SelectItem value={DocumentCategory.SEGURO}>Seguros</SelectItem>
                                    <SelectItem value={DocumentCategory.OUTROS}>Outros</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tags" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tags (Opcional)</Label>
                            <Input
                                id="tags"
                                {...register('tags')}
                                placeholder="Ex: 2023, Manutenção, Elevadores"
                                className="h-11 font-bold border-gray-200"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-black uppercase tracking-widest text-[10px]">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !file} className="h-11 px-8 font-black uppercase tracking-widest text-[11px] shadow-lg">
                            {isSubmitting ? 'A Carregar...' : (
                                <span className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Finalizar Upload
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
