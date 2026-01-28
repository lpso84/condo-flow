import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Loader2, Search } from 'lucide-react';

export default function UsersSettingsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: users, isLoading } = useQuery<any[]>({
        queryKey: ['settings-users'],
        queryFn: () => apiClient.get<any[]>('/settings/users').then(res => res.data)
    });

    const filteredUsers = users?.filter((u: any) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Utilizadores & Perfis</h2>
                    <p className="text-sm text-gray-500">Gerir acessos e permissões da equipa.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Pesquisar por nome ou email..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Utilizador</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Data Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" />
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers?.map((user: any) => (
                            <TableRow key={user.id} className="group hover:bg-gray-50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="capitalize">
                                        {user.role.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                    {new Date(user.createdAt).toLocaleDateString('pt-PT')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Editar
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
