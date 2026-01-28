import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Condominium } from '@condoflow/shared';

interface FinanceFilterBarProps {
    filters: any;
    setFilters: (filters: any) => void;
    condominiums: Condominium[];
}

export function FinanceFilterBar({ filters, setFilters, condominiums }: FinanceFilterBarProps) {
    const [search, setSearch] = useState(filters.search || '');

    const updateFilter = (key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ page: 1, pageSize: 20 });
        setSearch('');
    };

    const hasFilters = Object.keys(filters).length > 2 || search !== '';

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por descrição, referência, entidade..."
                        className="pl-9 bg-white dark:bg-slate-950"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onBlur={() => updateFilter('search', search)}
                        onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', search)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Select value={filters.type || 'all'} onValueChange={(v) => updateFilter('type', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[140px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Tipos</SelectItem>
                            <SelectItem value="RECEITA">Receitas</SelectItem>
                            <SelectItem value="DESPESA">Despesas</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.condominiumId || 'all'} onValueChange={(v) => updateFilter('condominiumId', v === 'all' ? undefined : v)}>
                        <SelectTrigger className="w-[200px] bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Condomínio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Condomínios</SelectItem>
                            {condominiums.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white dark:bg-slate-950 gap-2">
                                <Filter className="h-4 w-4" />
                                Mais Filtros
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuItem onClick={() => updateFilter('status', 'NORMAL')}>Estado: Normal</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFilter('status', 'ANULADO')}>Estado: Anulado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFilter('status', 'PENDENTE')}>Estado: Pendente</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {hasFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="h-10 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                            <X className="mr-2 h-4 w-4" />
                            Limpar
                        </Button>
                    )}
                </div>
            </div>

            {hasFilters && (
                <div className="flex flex-wrap gap-2 items-center text-sm">
                    <span className="text-muted-foreground font-medium">Filtros ativos:</span>
                    {filters.type && (
                        <Badge variant="secondary" className="gap-1 px-2 py-1">
                            Tipo: {filters.type === 'RECEITA' ? 'Receitas' : 'Despesas'}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('type', undefined)} />
                        </Badge>
                    )}
                    {filters.condominiumId && (
                        <Badge variant="secondary" className="gap-1 px-2 py-1">
                            Condomínio: {condominiums.find(c => c.id === filters.condominiumId)?.name}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('condominiumId', undefined)} />
                        </Badge>
                    )}
                    {filters.status && (
                        <Badge variant="secondary" className="gap-1 px-2 py-1">
                            Estado: {filters.status}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('status', undefined)} />
                        </Badge>
                    )}
                    {filters.search && (
                        <Badge variant="secondary" className="gap-1 px-2 py-1">
                            Pesquisa: {filters.search}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => { setSearch(''); updateFilter('search', ''); }} />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}
