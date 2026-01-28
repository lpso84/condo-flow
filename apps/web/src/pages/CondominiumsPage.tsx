import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import {
    Building2,
    Search,
    Plus,
    MapPin,
    Euro,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Condominium, PaginatedResponse } from '@condoflow/shared';

export default function CondominiumsPage() {
    const [search, setSearch] = useState('');
    const [page] = useState(1);

    const { data, isLoading, isError } = useQuery<PaginatedResponse<Condominium>>({
        queryKey: ['condominiums', page, search],
        queryFn: () => apiClient.get<PaginatedResponse<Condominium>>('/condominiums', { page, search, pageSize: 12 }).then(res => res.data),
        staleTime: 60000, // 1 minute
    });

    const condominiums = data?.data || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Condomínios</h1>
                    <p className="text-muted-foreground">
                        Gerencie todos os seus condomínios em um só lugar.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Condomínio
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Pesquisar por nome, cidade ou NIF..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50" />
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
                    Erro ao carregar condomínios. Por favor, tente novamente.
                </div>
            ) : condominiums.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhum condomínio encontrado</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Comece criando seu primeiro condomínio ou ajuste sua pesquisa.
                    </p>
                    <Button className="mt-4" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Condomínio
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {condominiums.map((condo) => (
                        <Link key={condo.id} to={`/condominiums/${condo.id}`}>
                            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
                                                {condo.name}
                                            </CardTitle>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="mr-1 h-3.5 w-3.5" />
                                                <span className="line-clamp-1">
                                                    {condo.city}, {condo.postalCode}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                condo.riskLevel === 'CRITICAL'
                                                    ? 'destructive'
                                                    : condo.riskLevel === 'HIGH'
                                                        ? 'warning'
                                                        : condo.riskLevel === 'MEDIUM'
                                                            ? 'secondary'
                                                            : 'success' // Using success variant we added
                                            }
                                            className="shrink-0"
                                        >
                                            {condo.riskLevel === 'LOW' ? 'Estável' : condo.riskLevel}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs">Saldo Atual</p>
                                            <div className="flex items-center font-medium">
                                                <Euro className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                <span className={condo.balance < 0 ? 'text-destructive' : 'text-green-600'}>
                                                    {formatCurrency(condo.balance)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs">Dívida Total</p>
                                            <div className="flex items-center font-medium">
                                                <Euro className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                                                <span className={condo.debtTotal > 0 ? 'text-orange-600' : 'text-muted-foreground'}>
                                                    {formatCurrency(condo.debtTotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-muted-foreground">Frações</span>
                                                <span className="font-semibold">{condo.fractionsCount}</span>
                                            </div>
                                            <div className="h-8 w-px bg-border" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-muted-foreground">Ocorrências</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-semibold">{condo.openOccurrences}</span>
                                                    {condo.urgentOccurrences > 0 && (
                                                        <AlertTriangle className="h-3 w-3 text-destructive" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination would go here */}
        </div>
    );
}
