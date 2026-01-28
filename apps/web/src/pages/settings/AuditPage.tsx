import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
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
import { Loader2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function AuditPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => apiClient.get('/settings/audit-logs').then(res => res.data)
    });

    const filteredLogs = logs?.filter((log: any) =>
        JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Auditoria & Logs</h2>
                <p className="text-sm text-gray-500">Histórico de alterações e eventos críticos do sistema.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Pesquisar logs..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[180px]">Data & Hora</TableHead>
                            <TableHead>Utilizador</TableHead>
                            <TableHead>Ação</TableHead>
                            <TableHead>Entidade</TableHead>
                            <TableHead>Detalhes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" />
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    Nenhum registo encontrado.
                                </TableCell>
                            </TableRow>
                        ) : filteredLogs?.map((log: any) => (
                            <TableRow key={log.id} className="hover:bg-gray-50">
                                <TableCell className="text-gray-500 text-sm font-mono">
                                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: pt })}
                                </TableCell>
                                <TableCell className="font-medium text-gray-900">
                                    {log.performedBy === 'system' ? 'Sistema' : log.performedBy}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        log.action === 'CREATE' ? 'text-green-600 border-green-200 bg-green-50' :
                                            log.action === 'UPDATE' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                                log.action === 'DELETE' ? 'text-red-600 border-red-200 bg-red-50' :
                                                    'text-gray-600'
                                    }>
                                        {log.action}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-700 font-medium">
                                    {log.entity}
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm truncate max-w-xs" title={log.details}>
                                    {log.details ? log.details.substring(0, 50) + (log.details.length > 50 ? '...' : '') : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
