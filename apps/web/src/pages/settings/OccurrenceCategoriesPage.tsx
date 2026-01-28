import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OccurrenceCategoriesPage() {
    const queryClient = useQueryClient();
    const [newCategory, setNewCategory] = useState<{ name: string, slaHours: number, priority: string } | null>(null);

    const { data: categories, isLoading } = useQuery<any[]>({
        queryKey: ['settings-occurrence-categories'],
        queryFn: () => apiClient.get<any[]>('/settings/categories/occurrences').then(res => res.data)
    });



    const createMutation = useMutation({
        mutationFn: (data: any) => apiClient.post('/settings/categories/occurrences', data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings-occurrence-categories'] });
            setNewCategory(null);
            toast.success('Categoria criada');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiClient.delete(`/settings/categories/occurrences/${id}`).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings-occurrence-categories'] });
            toast.success('Categoria removida');
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Categorias de Ocorrências</h2>
                    <p className="text-sm text-gray-500">SLA padrão e níveis de urgência por tipo.</p>
                </div>
                <Button onClick={() => setNewCategory({ name: '', slaHours: 24, priority: 'NORMAL' })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome da Categoria</TableHead>
                            <TableHead>SLA (Horas)</TableHead>
                            <TableHead>Prioridade Padrão</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* New Category Input Row */}
                        {newCategory && (
                            <TableRow className="bg-primary-50/50">
                                <TableCell>
                                    <Input
                                        value={newCategory.name}
                                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="Nome..."
                                        autoFocus
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={newCategory.slaHours}
                                        onChange={e => setNewCategory({ ...newCategory, slaHours: parseInt(e.target.value) || 0 })}
                                        className="w-24"
                                    />
                                </TableCell>
                                <TableCell>
                                    <select
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={newCategory.priority}
                                        onChange={e => setNewCategory({ ...newCategory, priority: e.target.value })}
                                    >
                                        <option value="NORMAL">Normal</option>
                                        <option value="URGENTE">Urgente</option>
                                    </select>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" onClick={() => createMutation.mutate(newCategory)}>Salvar</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setNewCategory(null)}>Cancelar</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}

                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" />
                                </TableCell>
                            </TableRow>
                        ) : categories?.map((cat: any) => (
                            <TableRow key={cat.id}>
                                <TableCell className="font-medium text-gray-900">{cat.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        {cat.slaHours}h
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={cat.priority === 'URGENTE' ? 'destructive' : 'secondary'}>
                                        {cat.priority}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteMutation.mutate(cat.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
