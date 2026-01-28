import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';
import { AssemblyStatus, AssemblyType } from '@condoflow/shared';

interface AssemblyFilterBarProps {
    filters: {
        search: string;
        status: string;
        type: string;
        year: string;
        condominiumId: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onReset: () => void;
    condominiums: { id: string; name: string }[];
}

export function AssemblyFilterBar({ filters, onFilterChange, onReset, condominiums }: AssemblyFilterBarProps) {
    const years = [2024, 2025, 2026]; // Generic, ideally fetched from DB max/min year

    return (
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-1/3">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar..."
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

                <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v === 'ALL' ? '' : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Estados</SelectItem>
                        {Object.values(AssemblyStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                                {s.replace('_', ' ')}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.type} onValueChange={(v) => onFilterChange('type', v === 'ALL' ? '' : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Tipos</SelectItem>
                        {Object.values(AssemblyType).map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.year} onValueChange={(v) => onFilterChange('year', v === 'ALL' ? '' : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Anos</SelectItem>
                        {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
