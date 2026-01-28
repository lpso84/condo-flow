import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Hammer,
    Plus,
    ArrowRight,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Project, PaginatedResponse } from '@condoflow/shared';

interface ProjectsTabProps {
    condominiumId: string;
}

export function ProjectsTab({ condominiumId }: ProjectsTabProps) {
    const { data, isLoading } = useQuery<PaginatedResponse<Project>>({
        queryKey: ['condominium-projects', condominiumId],
        queryFn: () => apiClient.get('/projects', { condominiumId }),
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PLANEAMENTO': return <Badge variant="secondary" className="font-black text-[10px] uppercase">Planeamento</Badge>;
            case 'EM_EXECUCAO': return <Badge variant="warning" className="font-black text-[10px] uppercase">Em Execução</Badge>;
            case 'CONCLUIDO': return <Badge variant="success" className="font-black text-[10px] uppercase">Concluído</Badge>;
            case 'CANCELADO': return <Badge variant="destructive" className="font-black text-[10px] uppercase">Cancelado</Badge>;
            default: return <Badge variant="outline" className="font-black text-[10px] uppercase">{status}</Badge>;
        }
    };

    const projects = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-gray-900">Obras e Projetos</h3>
                    <p className="text-sm text-muted-foreground">Gestão de intervenções estruturais e melhorias.</p>
                </div>
                <Button size="sm" className="font-bold shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Nova Obra
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 rounded-xl bg-gray-50 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow border-gray-200 group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Hammer className="h-5 w-5" />
                                    </div>
                                    {getStatusBadge(project.status)}
                                </div>
                                <CardTitle className="text-base font-black mt-4 line-clamp-1">{project.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
                                    {project.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orçamento</p>
                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(project.budgetEstimate)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Início</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {project.startDate ? format(new Date(project.startDate), "MMM yyyy", { locale: pt }) : 'TBD'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Building2 className="h-3 w-3 text-gray-500" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">
                                            {project.supplier?.name || 'Sem fornecedor'}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                                        Detalhes <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                        <Hammer className="h-8 w-8 text-gray-300" />
                    </div>
                    <h4 className="text-base font-black text-gray-700">Nenhuma obra registada</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
                        Registe intervenções estruturais, pinturas ou reparações de grande escala aqui.
                    </p>
                    <Button variant="outline" size="sm" className="mt-6 font-bold border-gray-200">
                        <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Projeto
                    </Button>
                </div>
            )}
        </div>
    );
}
