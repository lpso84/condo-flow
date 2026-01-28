import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    MoreVertical,
    Download,
    Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import type { Assembly, PaginatedResponse } from '@condoflow/shared';

interface AssembliesTabProps {
    condominiumId: string;
}

export function AssembliesTab({ condominiumId }: AssembliesTabProps) {
    const { data, isLoading } = useQuery<PaginatedResponse<Assembly>>({
        queryKey: ['condominium-assemblies', condominiumId],
        queryFn: () => apiClient.get<PaginatedResponse<Assembly>>('/assemblies', { condominiumId }).then(res => res.data),
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AGENDADA': return <Badge variant="warning" className="font-black text-[10px] uppercase">Agendada</Badge>;
            case 'REALIZADA': return <Badge variant="success" className="font-black text-[10px] uppercase">Realizada</Badge>;
            case 'NAO_AGENDADA': return <Badge variant="secondary" className="font-black text-[10px] uppercase">Não Agendada</Badge>;
            default: return <Badge variant="outline" className="font-black text-[10px] uppercase">{status}</Badge>;
        }
    };

    const assemblies = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-gray-900">Assembleias de Condóminos</h3>
                    <p className="text-sm text-muted-foreground">Histórico e agendamento de reuniões gerais.</p>
                </div>
                <Button size="sm" className="font-bold shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Agendar Assembleia
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-32 rounded-xl bg-gray-50 animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : assemblies.length > 0 ? (
                <div className="space-y-4">
                    {assemblies.map((assembly) => (
                        <Card key={assembly.id} className="shadow-sm border-gray-200 group hover:border-primary/30 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl min-w-[100px] border border-gray-100">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            {assembly.date ? format(new Date(assembly.date), "MMM", { locale: pt }) : '---'}
                                        </span>
                                        <span className="text-2xl font-black text-gray-900">
                                            {assembly.date ? format(new Date(assembly.date), "dd") : '--'}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-500">
                                            {assembly.date ? format(new Date(assembly.date), "yyyy") : '----'}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(assembly.status)}
                                            <span className="text-sm font-black text-gray-900">
                                                {assembly.status === 'REALIZADA' ? 'Assembleia Geral Ordinária' : 'Convocatória de Assembleia'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                {assembly.date ? format(new Date(assembly.date), "HH:mm") : 'Hora a definir'}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-600">
                                                <MapPin className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                {assembly.location || 'Local a definir'}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-600">
                                                <Users className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                Quórum: --%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {assembly.status === 'REALIZADA' && (
                                            <Button variant="outline" size="sm" className="font-bold border-gray-200">
                                                <Download className="mr-2 h-3.5 w-3.5" /> Ata
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                        <Calendar className="h-8 w-8 text-gray-300" />
                    </div>
                    <h4 className="text-base font-black text-gray-700">Sem assembleias agendadas</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
                        Mantenha o condomínio organizado agendando as reuniões obrigatórias.
                    </p>
                    <Button variant="outline" size="sm" className="mt-6 font-bold border-gray-200">
                        <Plus className="mr-2 h-4 w-4" /> Agendar Primeira Reunião
                    </Button>
                </div>
            )}
        </div>
    );
}
