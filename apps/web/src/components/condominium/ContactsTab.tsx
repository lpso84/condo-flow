import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Phone,
    Mail,
    Copy,
    Check,
    Search,
    User,
    Info
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import type { Contact, PaginatedResponse } from '@condoflow/shared';

interface ContactsTabProps {
    condominiumId: string;
}

export function ContactsTab({ condominiumId }: ContactsTabProps) {
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const { toast } = useToast();

    const { data, isLoading } = useQuery<PaginatedResponse<Contact>>({
        queryKey: ['condominium-contacts', condominiumId, search],
        queryFn: () => apiClient.get<PaginatedResponse<Contact>>('/contacts', { condominiumId, search: search || undefined, pageSize: 50 }).then(res => res.data),
    });

    const contacts = data?.data || [];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'GESTOR':
                return <Badge className="bg-blue-500 font-black text-[9px] uppercase">Gestor</Badge>;
            case 'ADMINISTRADOR':
                return <Badge className="bg-purple-500 font-black text-[9px] uppercase">Administrador</Badge>;
            case 'FORNECEDOR_CHAVE':
                return <Badge className="bg-orange-500 font-black text-[9px] uppercase">Fornecedor Chave</Badge>;
            default:
                return <Badge variant="secondary" className="font-black text-[9px] uppercase">{role}</Badge>;
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        toast({
            title: "Copiado!",
            description: "Informação copiada para a área de transferência.",
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar contactos..."
                            className="pl-9 h-10 font-medium border-gray-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="animate-pulse border-gray-100">
                            <CardContent className="h-40 bg-gray-50/50" />
                        </Card>
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    <User className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm font-bold uppercase tracking-widest">Nenhum contacto encontrado</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contacts.map((contact) => (
                        <Card key={contact.id} className="group hover:shadow-md transition-all border-gray-100 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <User className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 leading-tight">{contact.name}</h3>
                                            <div className="mt-1">{getRoleBadge(contact.role)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group/item">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-bold text-gray-600 truncate">{contact.email}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            onClick={() => copyToClipboard(contact.email || '', `${contact.id}-email`)}
                                        >
                                            {copiedId === `${contact.id}-email` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group/item">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs font-bold text-gray-600">{contact.phone}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0"
                                            onClick={() => copyToClipboard(contact.phone || '', `${contact.id}-phone`)}
                                        >
                                            {copiedId === `${contact.id}-phone` ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>

                                {contact.description && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                                        <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed italic">
                                            {contact.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
