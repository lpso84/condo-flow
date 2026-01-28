import { useState } from 'react';
import { Search, Filter, X, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { OccurrenceQuery } from '@condoflow/shared';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface OccurrencesFiltersProps {
    filters: Partial<OccurrenceQuery>;
    onFiltersChange: (filters: Partial<OccurrenceQuery>) => void;
}

export function OccurrencesFilters({ filters, onFiltersChange }: OccurrencesFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: condosData } = useQuery({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get('/condominiums', { pageSize: 100 }),
    });

    const selectedCondominiumId = filters.condominiumId;

    const { data: fractionsData } = useQuery({
        queryKey: ['fractions-list-filters', selectedCondominiumId],
        queryFn: () => apiClient.get(`/condominiums/${selectedCondominiumId}/fractions`),
        enabled: !!selectedCondominiumId,
    });

    const { data: suppliersData } = useQuery({
        queryKey: ['suppliers-list-filters'],
        queryFn: () => apiClient.get('/suppliers', { pageSize: 100 }),
    });

    const condominiums = condosData?.data || [];
    const fractions = fractionsData?.data || [];
    const suppliers = suppliersData?.data || [];

    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, search: value || undefined, page: 1 });
    };

    const handleSelectChange = (key: keyof OccurrenceQuery, value: string) => {
        onFiltersChange({
            ...filters,
            [key]: value === 'ALL' ? undefined : value,
            page: 1,
        });
    };

    const clearFilters = () => {
        onFiltersChange({ page: 1, pageSize: filters.pageSize });
    };

    const activeFiltersCount = Object.keys(filters).filter(
        (key) => key !== 'page' && key !== 'pageSize' && !!filters[key as keyof OccurrenceQuery]
    ).length;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por título, descrição..."
                        className="pl-10"
                        value={filters.search || ''}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select
                        value={filters.status || 'ALL'}
                        onValueChange={(val) => handleSelectChange('status', val)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos Estados</SelectItem>
                            <SelectItem value="ABERTA">Aberta</SelectItem>
                            <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                            <SelectItem value="EM_EXECUCAO">Em Execução</SelectItem>
                            <SelectItem value="RESOLVIDA">Resolvida</SelectItem>
                            <SelectItem value="ARQUIVADA">Arquivada</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.priority || 'ALL'}
                        onValueChange={(val) => handleSelectChange('priority', val)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todas Prioridades</SelectItem>
                            <SelectItem value="URGENTE">Urgente</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>

                    {activeFiltersCount > 0 && (
                        <Button variant="ghost" className="gap-2" onClick={clearFilters}>
                            <X className="h-4 w-4" />
                            Limpar
                        </Button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/30 p-4 border md:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Condomínio</label>
                        <Select
                            value={filters.condominiumId || 'ALL'}
                            onValueChange={(val) => handleSelectChange('condominiumId', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecionar condomínio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos os condomínios</SelectItem>
                                {condominiums.map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Categoria</label>
                        <Select
                            value={filters.category || 'ALL'}
                            onValueChange={(val) => handleSelectChange('category', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todas categorias" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas categorias</SelectItem>
                                <SelectItem value="INFILTRACAO">Infiltração</SelectItem>
                                <SelectItem value="ELEVADOR">Elevador</SelectItem>
                                <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                                <SelectItem value="ELETRICIDADE">Eletricidade</SelectItem>
                                <SelectItem value="CANALIZACAO">Canalização</SelectItem>
                                <SelectItem value="SEGURANCA">Segurança</SelectItem>
                                <SelectItem value="OUTRO">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fração</label>
                        <Select
                            value={filters.fractionId || 'ALL'}
                            onValueChange={(val) => handleSelectChange('fractionId', val)}
                            disabled={!selectedCondominiumId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={selectedCondominiumId ? 'Todas as frações' : 'Selecione um condomínio primeiro'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todas as frações</SelectItem>
                                {fractions.map((f: any) => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.number} - {f.ownerName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fornecedor atribuído</label>
                        <Select
                            value={
                                typeof filters.hasSupplier === 'boolean'
                                    ? filters.hasSupplier
                                        ? 'TRUE'
                                        : 'FALSE'
                                    : 'ALL'
                            }
                            onValueChange={(val) => {
                                onFiltersChange({
                                    ...filters,
                                    hasSupplier: val === 'ALL' ? undefined : val === 'TRUE',
                                    page: 1,
                                });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos</SelectItem>
                                <SelectItem value="TRUE">Com fornecedor</SelectItem>
                                <SelectItem value="FALSE">Sem fornecedor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" /> Data de abertura
                        </label>
                        <Select
                            value={
                                !filters.from && !filters.to
                                    ? 'ALL'
                                    : filters.from && !filters.to
                                    ? 'CUSTOM'
                                    : 'CUSTOM'
                            }
                            onValueChange={(val) => {
                                const now = new Date();
                                if (val === 'ALL') {
                                    onFiltersChange({
                                        ...filters,
                                        from: undefined,
                                        to: undefined,
                                        page: 1,
                                    });
                                } else if (val === 'TODAY') {
                                    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                    onFiltersChange({
                                        ...filters,
                                        from: start.toISOString(),
                                        to: now.toISOString(),
                                        page: 1,
                                    });
                                } else if (val === '7') {
                                    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                    onFiltersChange({
                                        ...filters,
                                        from: start.toISOString(),
                                        to: now.toISOString(),
                                        page: 1,
                                    });
                                } else if (val === '30') {
                                    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                    onFiltersChange({
                                        ...filters,
                                        from: start.toISOString(),
                                        to: now.toISOString(),
                                        page: 1,
                                    });
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Intervalo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Sem filtro</SelectItem>
                                <SelectItem value="TODAY">Hoje</SelectItem>
                                <SelectItem value="7">Últimos 7 dias</SelectItem>
                                <SelectItem value="30">Últimos 30 dias</SelectItem>
                                <SelectItem value="CUSTOM" disabled>
                                    Intervalo personalizado (usar filtros avançados futuros)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button variant="outline" className="w-full" onClick={() => setIsExpanded(false)}>
                            Fechar Filtros
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
