import React from 'react';
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
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowsPage() {
    const queryClient = useQueryClient();

    // Fetch states
    const { data: states, isLoading } = useQuery({
        queryKey: ['settings-workflow-states'],
        queryFn: () => apiClient.get('/settings/workflow/states').then(res => res.data)
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Estados & Workflows</h2>
                    <p className="text-sm text-gray-500">Configurar ciclo de vida das ocorrências.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ordem</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Ativo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" />
                                </TableCell>
                            </TableRow>
                        ) : states?.map((state: any) => (
                            <TableRow key={state.id}>
                                <TableCell className="font-mono text-gray-500">{state.order}</TableCell>
                                <TableCell className="font-medium text-gray-900">{state.code}</TableCell>
                                <TableCell>{state.label}</TableCell>
                                <TableCell>
                                    {state.isInitial && <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Inicial</Badge>}
                                    {state.isFinal && <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 ml-2">Final</Badge>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end">
                                        <Switch checked={state.active} disabled />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Como funciona?</h4>
                <p className="text-xs text-blue-600">
                    A ordem define a sequência lógica. Ocorrências começam no estado "Inicial" e só podem ser fechadas em estados "Finais".
                    Para alterar a ordem ou criar novos estados, contacte o suporte técnico.
                </p>
            </div>
        </div>
    );
}
