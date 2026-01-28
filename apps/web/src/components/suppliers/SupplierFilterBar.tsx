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
    Search,
    Filter,
    X,
    Star,
    Mail,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SupplierFilterBarProps {
    filters: any;
    setFilters: (filters: any) => void;
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

export function SupplierFilterBar({ filters, setFilters }: SupplierFilterBarProps) {
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const toggleFilter = (key: string, value: any) => {
        const currentVal = filters[key];
        if (currentVal === value) {
            const newFilters = { ...filters };
            delete newFilters[key];
            setFilters({ ...newFilters, page: 1 });
        } else {
            setFilters({ ...filters, [key]: value, page: 1 });
        }
    };

    const hasFilters = Object.keys(filters).length > 2; // page, pageSize are always there

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por nome, NIF, email, tags..."
                        className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        value={filters.search || ''}
                        onChange={handleSearch}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={filters.categories || 'all'}
                        onValueChange={(val) => setFilters({ ...filters, categories: val === 'all' ? undefined : val, page: 1 })}
                    >
                        <SelectTrigger className="w-[180px] h-11">
                            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Categorias" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {CATEGORIES.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.active === undefined ? 'all' : filters.active.toString()}
                        onValueChange={(val) => setFilters({ ...filters, active: val === 'all' ? undefined : val === 'true', page: 1 })}
                    >
                        <SelectTrigger className="w-[140px] h-11">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Estados</SelectItem>
                            <SelectItem value="true">Ativos</SelectItem>
                            <SelectItem value="false">Inativos</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            className="h-11 text-muted-foreground hover:text-slate-900"
                            onClick={() => setFilters({ page: 1, pageSize: filters.pageSize })}
                        >
                            <X className="h-4 w-4 mr-2" /> Limpar
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filters.favorite ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full gap-2 ${filters.favorite ? 'bg-amber-500 hover:bg-amber-600 border-none' : ''}`}
                    onClick={() => toggleFilter('favorite', true)}
                >
                    <Star className={`h-3.5 w-3.5 ${filters.favorite ? 'fill-current' : ''}`} />
                    Favoritos
                </Button>

                <Button
                    variant={filters.hasEmail === true ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() => toggleFilter('hasEmail', true)}
                >
                    <Mail className="h-3.5 w-3.5" />
                    Com Email
                </Button>

                <Button
                    variant={filters.hasEmail === false ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() => toggleFilter('hasEmail', false)}
                >
                    <X className="h-3.5 w-3.5" />
                    Sem Email
                </Button>

                {filters.categories && (
                    <Badge variant="secondary" className="pl-3 pr-1 py-1 gap-1 rounded-full bg-slate-100 text-slate-700">
                        {CATEGORIES.find(c => c.value === filters.categories)?.label}
                        <X
                            className="h-3 w-3 cursor-pointer hover:text-slate-900"
                            onClick={() => {
                                const newFilters = { ...filters };
                                delete newFilters.categories;
                                setFilters(newFilters);
                            }}
                        />
                    </Badge>
                )}
            </div>
        </div>
    );
}
