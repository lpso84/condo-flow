import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { MoreHorizontal, Eye, Trash2, CheckCircle, Clock, AlertTriangle, UserCog, Archive } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { PriorityIcon } from './PriorityBadge';
import { Occurrence, OccurrenceStatus } from '@condoflow/shared';
import { Skeleton } from '@/components/ui/skeleton';

interface OccurrencesTableProps {
    occurrences: Occurrence[];
    isLoading: boolean;
    onView: (occurrence: Occurrence) => void;
    onStatusChange: (occurrence: Occurrence, status: OccurrenceStatus) => void;
    onDelete: (occurrence: Occurrence) => void;
    onToggleUrgent?: (occurrence: Occurrence) => void;
    onAssignSupplier?: (occurrence: Occurrence) => void;
}

export function OccurrencesTable({
    occurrences,
    isLoading,
    onView,
    onStatusChange,
    onDelete,
    onToggleUrgent,
    onAssignSupplier,
}: OccurrencesTableProps) {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Condomínio</TableHead>
                            <TableHead>Fração</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Atribuído a</TableHead>
                            <TableHead>Abertura</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 9 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[50px] text-center">Prio</TableHead>
                        <TableHead>Condomínio</TableHead>
                        <TableHead>Fração</TableHead>
                        <TableHead className="min-w-[200px]">Título</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Atribuído</TableHead>
                        <TableHead>Abertura</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {occurrences.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                Nenhuma ocorrência encontrada para os filtros selecionados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        occurrences.map((occurrence) => (
                            <TableRow
                                key={occurrence.id}
                                className="group cursor-pointer hover:bg-muted/50"
                                onClick={() => onView(occurrence)}
                            >
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                    <PriorityIcon priority={occurrence.priority} className="h-5 w-5 mx-auto" />
                                </TableCell>
                                <TableCell className="font-medium">
                                    {occurrence.condominium?.name || '---'}
                                </TableCell>
                                <TableCell>
                                    {occurrence.fraction?.number || 'Geral'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{occurrence.title}</span>
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {occurrence.description}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize text-sm">
                                    {occurrence.category.toLowerCase().replace('_', ' ')}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={occurrence.status} />
                                </TableCell>
                                <TableCell className="text-sm">
                                    {occurrence.supplier?.name || (
                                        <span className="text-muted-foreground italic text-xs">Pendente</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                    {format(new Date(occurrence.createdAt), 'dd/MM/yyyy', { locale: pt })}
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onView(occurrence)}>
                                                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Mudar Estado</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => onStatusChange(occurrence, 'EM_EXECUCAO')}>
                                                <Clock className="mr-2 h-4 w-4 text-orange-500" /> Em Execução
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStatusChange(occurrence, 'RESOLVIDA')}>
                                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Marcar como Resolvida
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onStatusChange(occurrence, 'ARQUIVADA')}>
                                                <Archive className="mr-2 h-4 w-4 text-slate-500" /> Arquivar
                                            </DropdownMenuItem>

                                            {onToggleUrgent && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Prioridade</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onToggleUrgent(occurrence)}>
                                                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" /> {occurrence.priority === 'URGENTE' ? 'Marcar como Normal' : 'Marcar como Urgente'}
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            {onAssignSupplier && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onAssignSupplier(occurrence)}>
                                                        <UserCog className="mr-2 h-4 w-4" /> Atribuir fornecedor
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => onDelete(occurrence)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
