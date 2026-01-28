import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { DocumentCategory } from '@condoflow/shared';

interface DocumentFilterBarProps {
    filters: {
        search: string;
        category: string;
        condominiumId: string;
        // Add more filters if needed
    };
    onFilterChange: (key: string, value: string) => void;
    onReset: () => void;
    condominiums: { id: string; name: string }[];
}

export function DocumentFilterBar({ filters, onFilterChange, onReset, condominiums }: DocumentFilterBarProps) {
    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar documentos..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={onReset} className="ml-auto">
                        <X className="mr-2 h-4 w-4" />
                        Limpar Filtros
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={filters.condominiumId} onValueChange={(v) => onFilterChange('condominiumId', v === 'ALL' ? '' : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Condomínio" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Condomínios</SelectItem>
                        {condominiums.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.category} onValueChange={(v) => onFilterChange('category', v === 'ALL' ? '' : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todas as Categorias</SelectItem>
                        {Object.values(DocumentCategory).map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
