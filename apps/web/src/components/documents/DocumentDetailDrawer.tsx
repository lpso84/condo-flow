import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document } from '@condoflow/shared';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Download, History, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DocumentDetailDrawerProps {
    documentId: string | null;
    onClose: () => void;
    onUpdate: () => void;
}

export function DocumentDetailDrawer({ documentId, onClose, onUpdate }: DocumentDetailDrawerProps) {
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(false);
    const [showUploadVersion, setShowUploadVersion] = useState(false);
    const [newVersionFile, setNewVersionFile] = useState<File | null>(null);

    useEffect(() => {
        if (documentId) {
            setLoading(true);
            apiClient.get<Document>(`/documents/${documentId}`)
                .then(setDocument)
                .catch(() => toast.error('Erro ao carregar detalhes'))
                .finally(() => setLoading(false));
        } else {
            setDocument(null);
        }
    }, [documentId]);

    const handleUploadVersion = async () => {
        if (!newVersionFile || !document) return;
        try {
            await apiClient.post(`/documents/${document.id}/versions`, { fileName: newVersionFile.name });
            toast.success('Nova versão carregada');
            setShowUploadVersion(false);
            setNewVersionFile(null);
            // Refresh detailed view
            apiClient.get<Document>(`/documents/${document.id}`).then(setDocument);
            onUpdate();
        } catch {
            toast.error('Erro ao carregar versão');
        }
    };

    if (!documentId) return null;

    return (
        <Sheet open={!!documentId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[800px] sm:w-[90%] sm:max-w-[800px] flex flex-col p-0 gap-0">
                <SheetHeader className="p-6 border-b bg-muted/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <Badge className="mb-2" variant="outline">{document?.category}</Badge>
                            <SheetTitle className="text-2xl font-bold">{document?.title}</SheetTitle>
                            <SheetDescription className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                                {document?.fileName} • v{document?.version} • {document?.fileSize ? (document.fileSize / 1024).toFixed(1) + ' KB' : '0 KB'}
                            </SheetDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(document?.filePath, '_blank')}>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? <div className="text-center">Carregando...</div> : (
                        <div className="space-y-8">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Condomínio:</span>
                                    <p className="font-medium">{document?.condominium?.name}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Data Upload:</span>
                                    <p className="font-medium">{document?.createdAt && format(new Date(document.createdAt), "dd MMM yyyy HH:mm", { locale: pt })}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Upload por:</span>
                                    <p className="font-medium">{document?.uploadedBy}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tags:</span>
                                    <p className="font-medium">{document?.tags || '-'}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            {!showUploadVersion ? (
                                <Button variant="secondary" onClick={() => setShowUploadVersion(true)}>
                                    <Upload className="mr-2 h-4 w-4" /> Carregar Nova Versão
                                </Button>
                            ) : (
                                <div className="p-4 border rounded bg-muted/20 space-y-4">
                                    <Label>Selecione o ficheiro para a v{document ? document.version + 1 : ''}</Label>
                                    <Input type="file" onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)} />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleUploadVersion} disabled={!newVersionFile}>Confirmar Upload</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowUploadVersion(false)}>Cancelar</Button>
                                    </div>
                                </div>
                            )}

                            {/* Versions History */}
                            <div>
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <History className="h-4 w-4" /> Histórico de Versões
                                </h3>
                                <div className="space-y-3">
                                    {document?.versions?.map((v: any) => (
                                        <div key={v.id} className="flex justify-between items-center p-3 border rounded bg-card text-sm">
                                            <div>
                                                <p className="font-medium">Versão {v.version}</p>
                                                <p className="text-muted-foreground text-xs">{format(new Date(v.createdAt), "dd MMM yyyy HH:mm", { locale: pt })} • {v.uploadedBy}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => window.open(v.filePath, '_blank')}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!document?.versions || document.versions.length === 0) && (
                                        <p className="text-muted-foreground text-sm">Sem histórico de versões anteriores.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
