import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Document } from '@condoflow/shared';

interface DocumentListProps {
    documents: Document[];
    isLoading: boolean;
    onView: (document: Document) => void;
    onDelete: (id: string) => void;
}

export function DocumentList({ documents, isLoading, onView, onDelete }: DocumentListProps) {
    if (isLoading) {
        return <div className="p-8 text-center">Carregando documentos...</div>;
    }

    if (documents.length === 0) {
        return (
            <div className="p-8 text-center border rounded-lg bg-muted/20">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhum documento encontrado</h3>
                <p className="text-muted-foreground">Faça upload de documentos para começar.</p>
            </div>
        );
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Condomínio</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Versão</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.map((doc) => (
                        <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(doc)}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{doc.title}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">{doc.fileName}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">{doc.category}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{doc.condominium?.name}</TableCell>
                            <TableCell>
                                {format(new Date(doc.createdAt), 'dd MMM yyyy', { locale: pt })}
                            </TableCell>
                            <TableCell>{formatSize(doc.fileSize)}</TableCell>
                            <TableCell>v{doc.version}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); /* Download logic */ }}>
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
