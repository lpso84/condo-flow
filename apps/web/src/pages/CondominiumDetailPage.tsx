import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    MapPin,
    Euro,
    AlertTriangle,
    Users,
    Edit,
    Plus,
    Activity,
    Phone,
    Building2,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { FractionsTab } from '@/components/condominium/FractionsTab';
import { OccurrencesTab } from '@/components/condominium/OccurrencesTab';
import { FinancesTab } from '@/components/condominium/FinancesTab';
import { OverviewTab } from '@/components/condominium/OverviewTab';
import { DocumentsTab } from '@/components/condominium/DocumentsTab';
import { ProjectsTab } from '@/components/condominium/ProjectsTab';
import { AssembliesTab } from '@/components/condominium/AssembliesTab';
import { ContactsTab } from '@/components/condominium/ContactsTab';
import { CreateOccurrenceDialog } from '@/components/condominium/CreateOccurrenceDialog';
import { EditCondominiumDialog } from '@/components/condominium/EditCondominiumDialog';
import type { Condominium } from '@condoflow/shared';

export default function CondominiumDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [activeTab, setActiveTab] = useState('overview');
    const [isOccurrenceDialogOpen, setIsOccurrenceDialogOpen] = useState(false);
    const [isEditCondoOpen, setIsEditCondoOpen] = useState(false);

    const { data: condo, isLoading, isError, refetch } = useQuery<Condominium>({
        queryKey: ['condominium', id],
        queryFn: () => apiClient.get<Condominium>(`/condominiums/${id}`).then(res => res.data),
        enabled: !!id,
    });

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'CRITICAL': return <Badge variant="destructive" className="font-black text-[10px] uppercase tracking-widest px-2 py-0.5">Crítico</Badge>;
            case 'HIGH': return <Badge className="bg-orange-500 hover:bg-orange-600 font-black text-[10px] uppercase tracking-widest px-2 py-0.5">Alto Risco</Badge>;
            case 'MEDIUM': return <Badge className="bg-blue-500 hover:bg-blue-600 font-black text-[10px] uppercase tracking-widest px-2 py-0.5">Médio</Badge>;
            default: return <Badge className="bg-green-500 hover:bg-green-600 font-black text-[10px] uppercase tracking-widest px-2 py-0.5">Baixo Risco</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Carregando Detalhes...</p>
            </div>
        );
    }

    if (isError || !condo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900">Erro ao carregar condomínio</h2>
                <p className="text-sm text-muted-foreground">Não foi possível encontrar as informações solicitadas.</p>
                <Button onClick={() => refetch()} variant="outline" className="font-bold">Tentar Novamente</Button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
            {/* Breadcrumbs / Context */}
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>Condomínios</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900">{condo.name}</span>
            </div>

            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-black tracking-tight text-gray-900">{condo.name}</h1>
                        {getRiskBadge(condo.riskLevel)}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{condo.address}, {condo.postalCode} {condo.city}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <span className="font-black text-[10px] text-primary uppercase">NIF</span>
                            <span className="text-gray-900">{condo.nif}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Phone className="h-4 w-4 text-primary" />
                            <span>+351 210 000 000</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-6 font-black uppercase tracking-widest text-[11px] border-gray-200 shadow-sm" onClick={() => setIsEditCondoOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button className="h-11 px-6 font-black uppercase tracking-widest text-[11px] shadow-md" onClick={() => setIsOccurrenceDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="shadow-sm border-gray-100 hover:border-primary/50 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setActiveTab('finances')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Saldo Atual</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <Euro className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "text-3xl font-black tabular-nums",
                            condo.balance < 0 ? "text-red-600" : "text-green-600"
                        )}>
                            {formatCurrency(condo.balance)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Fundo Reserva</span>
                            <span className="text-xs font-black text-gray-700">{formatCurrency(condo.reserveFund)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className="shadow-sm border-gray-100 hover:border-orange-500/50 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setActiveTab('fractions')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dívida Total</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-orange-600 tabular-nums">
                            {formatCurrency(condo.debtTotal)}
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">
                            {condo.debtTotal > 0 ? "Requer cobrança ativa" : "Sem dívidas pendentes"}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="shadow-sm border-gray-100 hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setActiveTab('occurrences')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ocorrências</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-black text-gray-900">{condo.openOccurrences}</div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase">Abertas</span>
                        </div>
                        {condo.urgentOccurrences > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase mt-2 bg-red-50 px-2 py-1 rounded w-fit">
                                <AlertTriangle className="h-3 w-3" />
                                {condo.urgentOccurrences} Urgentes
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card
                    className="shadow-sm border-gray-100 hover:border-purple-500/50 transition-all cursor-pointer group overflow-hidden"
                    onClick={() => setActiveTab('fractions')}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Frações</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <Users className="h-4 w-4 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-gray-900">{condo.fractionsCount}</div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-2">
                            Unidades Registadas
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
                    <TabsList className="bg-transparent h-10 gap-1">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Visão Geral</TabsTrigger>
                        <TabsTrigger value="fractions" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Frações</TabsTrigger>
                        <TabsTrigger value="occurrences" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Ocorrências</TabsTrigger>
                        <TabsTrigger value="finances" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Finanças</TabsTrigger>
                        <TabsTrigger value="documents" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Documentos</TabsTrigger>
                        <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Obras</TabsTrigger>
                        <TabsTrigger value="assemblies" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Assembleias</TabsTrigger>
                        <TabsTrigger value="contacts" className="data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-lg transition-all">Contactos</TabsTrigger>
                    </TabsList>
                </div>

                <div className="min-h-[600px]">
                    <TabsContent value="overview" className="mt-0 animate-in fade-in-50 duration-300">
                        <OverviewTab condo={condo} onTabChange={setActiveTab} />
                    </TabsContent>

                    <TabsContent value="fractions" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <FractionsTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="occurrences" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <OccurrencesTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="finances" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <FinancesTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <DocumentsTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="projects" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <ProjectsTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assemblies" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <AssembliesTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contacts" className="mt-0 animate-in fade-in-50 duration-300">
                        <Card className="shadow-sm border-gray-100">
                            <CardContent className="p-8">
                                <ContactsTab condominiumId={condo.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>

            {/* Dialogs */}
            <CreateOccurrenceDialog
                open={isOccurrenceDialogOpen}
                onOpenChange={setIsOccurrenceDialogOpen}
                condominiumId={condo.id}
            />

            <EditCondominiumDialog
                open={isEditCondoOpen}
                onOpenChange={setIsEditCondoOpen}
                condominium={condo}
            />
        </div>
    );
}
