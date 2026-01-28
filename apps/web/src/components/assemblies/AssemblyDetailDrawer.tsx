import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Assembly, AssemblyStatus } from '@condoflow/shared';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { FileText, CheckCircle, Clock, AlertTriangle, Printer, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface AssemblyDetailDrawerProps {
    assemblyId: string | null;
    onClose: () => void;
    onEdit: (assembly: Assembly) => void;
    onUpdate: () => void; // Trigger refresh
}

export function AssemblyDetailDrawer({ assemblyId, onClose, onEdit, onUpdate }: AssemblyDetailDrawerProps) {
    const [assembly, setAssembly] = useState<Assembly | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (assemblyId) {
            setLoading(true);
            apiClient.get<Assembly>(`/assemblies/${assemblyId}`)
                .then(setAssembly)
                .catch(() => toast.error('Erro ao carregar detalhes'))
                .finally(() => setLoading(false));
        } else {
            setAssembly(null);
        }
    }, [assemblyId]);

    const handleGenerateConvocation = async () => {
        if (!assembly) return;
        toast.info('Gerando convocatória...');
        try {
            // Mock generation
            await apiClient.post(`/assemblies/${assembly.id}/documents`, {
                type: 'CONVOCATORIA',
                content: '...'
            });
            toast.success('Convocatória gerada e guardada nos documentos.');
            onUpdate();
        } catch {
            toast.error('Erro ao gerar convocatória');
        }
    };

    if (!assemblyId) return null;

    return (
        <Sheet open={!!assemblyId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[800px] sm:w-[90%] sm:max-w-[800px] flex flex-col p-0 gap-0">
                {/* Header */}
                <SheetHeader className="p-6 border-b bg-muted/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <Badge className="mb-2" variant="outline">{assembly?.type}</Badge>
                            <SheetTitle className="text-2xl font-bold">{assembly?.condominium?.name} - {assembly?.year}</SheetTitle>
                            <SheetDescription className="text-muted-foreground flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4" />
                                {assembly?.date ? format(new Date(assembly.date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: pt }) : 'Data não definida'}
                            </SheetDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => assembly && onEdit(assembly)}>Editar</Button>
                        </div>
                    </div>
                </SheetHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-8 text-center">Carregando...</div> : (
                        <Tabs defaultValue="overview" className="p-6">
                            <TabsList className="grid w-full grid-cols-5 mb-6">
                                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                                <TabsTrigger value="agenda">Ordem Trab.</TabsTrigger>
                                <TabsTrigger value="documents">Documentos</TabsTrigger>
                                <TabsTrigger value="minutes">Ata</TabsTrigger>
                                <TabsTrigger value="decisions">Deliberações</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 border rounded bg-card">
                                        <h3 className="font-semibold mb-2">Estado Atual</h3>
                                        <Badge className="text-lg">{assembly?.status}</Badge>
                                    </div>
                                    <div className="p-4 border rounded bg-card">
                                        <h3 className="font-semibold mb-2">Local</h3>
                                        <p>{assembly?.location || 'Não definido'}</p>
                                    </div>
                                </div>

                                <div className="p-4 border rounded bg-card flex flex-col gap-2">
                                    <h3 className="font-semibold">Ações Rápidas</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button size="sm" variant="secondary" onClick={handleGenerateConvocation}>
                                            <Printer className="mr-2 h-4 w-4" /> Gerar Convocatória
                                        </Button>
                                        <Button size="sm" variant="secondary">
                                            <FileText className="mr-2 h-4 w-4" /> Ver Minuta da Ata
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="agenda">
                                <div className="space-y-4">
                                    {assembly?.agendaItems && assembly.agendaItems.length > 0 ? (
                                        assembly.agendaItems.map((item: any) => (
                                            <div key={item.id} className="p-4 border rounded flex gap-4">
                                                <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {item.order}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{item.title}</h4>
                                                    <p className="text-muted-foreground text-sm">{item.description}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-center py-8">Nenhum ponto definido.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="documents">
                                <ul className="space-y-2">
                                    {assembly?.documents?.map((doc: any) => (
                                        <li key={doc.id} className="p-3 border rounded flex justify-between items-center bg-card">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium">{doc.title}</p>
                                                    <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">Download</Button>
                                        </li>
                                    ))}
                                    {(!assembly?.documents || assembly.documents.length === 0) && (
                                        <p className="text-muted-foreground text-center py-8">Sem documentos associados.</p>
                                    )}
                                </ul>
                            </TabsContent>

                            <TabsContent value="minutes">
                                <div className="bg-muted p-4 rounded text-center">
                                    <p className="text-muted-foreground mb-4">A ata ainda não foi registada.</p>
                                    <Button>Registar Ata</Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="decisions">
                                <div className="bg-muted p-4 rounded text-center">
                                    <p className="text-muted-foreground">Deliberações serão registadas após a realização.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
