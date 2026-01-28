import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Calendar, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Assembly, AssemblyStatus } from '@condoflow/shared';

interface AssemblyListProps {
    assemblies: Assembly[];
    isLoading: boolean;
    onView: (assembly: Assembly) => void;
    onDelete: (id: string) => void;
}

export function AssemblyList({ assemblies, isLoading, onView, onDelete }: AssemblyListProps) {
    if (isLoading) {
        return <div className="p-8 text-center">Carregando assembleias...</div>;
    }

    if (assemblies.length === 0) {
        return (
            <div className="p-8 text-center border rounded-lg bg-muted/20">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhuma assembleia encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros ou crie uma nova assembleia.</p>
            </div>
        );
    }

    const getStatusColor = (status: AssemblyStatus) => {
        switch (status) {
            case AssemblyStatus.REALIZADA: return 'bg-green-500 hover:bg-green-600';
            case AssemblyStatus.AGENDADA: return 'bg-blue-500 hover:bg-blue-600';
            case AssemblyStatus.CANCELADA: return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-600';
        }
    };

    return (
        <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Condomínio</TableHead>
                        <TableHead>Ano / Tipo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead>Docs</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {assemblies.map((assembly) => (
                        <TableRow key={assembly.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(assembly)}>
                            <TableCell className="font-medium">{assembly.condominium?.name}</TableCell>
                            <TableCell>
                                <span className="font-semibold">{assembly.year}</span> <span className="text-muted-foreground text-sm">({assembly.type})</span>
                            </TableCell>
                            <TableCell>
                                {assembly.date ? format(new Date(assembly.date), 'dd ' + 'MMM' + ' yyyy', { locale: pt }) : '-'}
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(assembly.status)}>
                                    {assembly.status.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell className="truncate max-w-[200px]" title={assembly.location || ''}>
                                {assembly.location || '-'}
                            </TableCell>
                            <TableCell>
                                {assembly._count?.documents || 0}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(assembly); }}>
                                    <Edit className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(assembly.id); }}>
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
