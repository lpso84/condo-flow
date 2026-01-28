import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Euro } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Project, Condominium, PaginatedResponse } from '@condoflow/shared';

const projectSchema = z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
    condominiumId: z.string().min(1, 'Condomínio é obrigatório'),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']), // This might need mapping to ProjectStatus enum
    budgetEstimate: z.coerce.number().min(0),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<PaginatedResponse<Project>>({
        queryKey: ['projects', search],
        queryFn: () => apiClient.get('/projects', { search, pageSize: 50 }),
    });

    const { data: condominiumsData } = useQuery<PaginatedResponse<Condominium>>({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get('/condominiums', { pageSize: 100 }),
    });

    const projects = data?.data || [];
    const condominiums = condominiumsData?.data || [];

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            status: 'PLANNED',
            budgetEstimate: 0,
        },
    });

    const createProject = useMutation({
        mutationFn: (data: ProjectFormData) => apiClient.post('/projects', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                title: 'Obra criada',
                description: 'O projeto foi adicionado com sucesso.',
            });
            setIsCreateOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast({
                variant: 'destructive',
                title: 'Erro ao criar obra',
                description: error.message || 'Ocorreu um erro inesperado.',
            });
        },
    });

    const onSubmit = (data: ProjectFormData) => {
        createProject.mutate(data);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PLANEAMENTO': return <Badge variant="outline">Planeamento</Badge>;
            case 'EM_EXECUCAO': return <Badge className="bg-blue-500 hover:bg-blue-600">Em Execução</Badge>;
            case 'CONCLUIDO': return <Badge variant="success">Concluído</Badge>;
            case 'CANCELADO': return <Badge variant="destructive">Cancelado</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Obras e Projetos</h1>
                    <p className="text-muted-foreground">
                        Gestão de obras, reparações e melhorias.
                    </p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Projeto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Registar Novo Projeto</DialogTitle>
                            <DialogDescription>
                                Crie um novo projeto de obra ou manutenção.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Título</Label>
                                <div className="col-span-3">
                                    <Input id="title" {...register('title')} placeholder="Ex: Pintura Fachada" />
                                    {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="condominiumId" className="text-right">Condomínio</Label>
                                <div className="col-span-3">
                                    <Select onValueChange={(val) => setValue('condominiumId', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o condomínio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {condominiums.map((condo) => (
                                                <SelectItem key={condo.id} value={condo.id}>{condo.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.condominiumId && <p className="text-xs text-destructive mt-1">{errors.condominiumId.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">Estado</Label>
                                <div className="col-span-3">
                                    <Select onValueChange={(val) => setValue('status', val as any)} defaultValue="PLANNED">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PLANNED">Planeamento</SelectItem>
                                            <SelectItem value="IN_PROGRESS">Em Execução</SelectItem>
                                            <SelectItem value="COMPLETED">Concluído</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="budgetEstimate" className="text-right">Orçamento</Label>
                                <div className="col-span-3">
                                    <Input id="budgetEstimate" type="number" step="0.01" {...register('budgetEstimate')} />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right pt-2">Descrição</Label>
                                <div className="col-span-3">
                                    <textarea
                                        id="description"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...register('description')}
                                    />
                                    {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'A criar...' : 'Criar Projeto'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar projetos..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Condomínio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Orçamento</TableHead>
                            <TableHead>Datas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Carregando...</TableCell>
                            </TableRow>
                        ) : projects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">Nenhum projeto encontrado.</TableCell>
                            </TableRow>
                        ) : (
                            projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        {project.title}
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                            {project.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {condominiums.find(c => c.id === project.condominiumId)?.name || 'Condomínio desconhecido'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Euro className="h-3 w-3 text-muted-foreground" />
                                            {formatCurrency(project.budgetEstimate)}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs text-muted-foreground">
                                            {project.startDate && (
                                                <span className="flex items-center gap-1">
                                                    Início: {format(new Date(project.startDate), "dd/MM/yyyy", { locale: pt })}
                                                </span>
                                            )}
                                            {project.endDate && (
                                                <span className="flex items-center gap-1">
                                                    Fim: {format(new Date(project.endDate), "dd/MM/yyyy", { locale: pt })}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
