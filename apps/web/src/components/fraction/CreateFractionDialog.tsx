import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Building2, User, Home, Hash, Percent, Euro, Mail, Phone, Plus, Layers } from 'lucide-react';
import type { Condominium, PaginatedResponse } from '@condoflow/shared';

interface CreateFractionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateFractionDialog({ open, onOpenChange }: CreateFractionDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Form State
    const [condominiumId, setCondominiumId] = useState('');
    const [number, setNumber] = useState('');
    const [floor, setFloor] = useState('');
    const [typology, setTypology] = useState('T2');
    const [permillage, setPermillage] = useState('');
    const [monthlyQuota, setMonthlyQuota] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');
    const [occupation, setOccupation] = useState('PROPRIETARIO');

    // Fetch condominiums for selection
    const { data: condosData } = useQuery<PaginatedResponse<Condominium>>({
        queryKey: ['condominiums-list'],
        queryFn: () => apiClient.get<PaginatedResponse<Condominium>>('/condominiums', { pageSize: 100 }).then(res => res.data),
        enabled: open,
    });

    const condominiums = condosData?.data || [];

    const mutation = useMutation({
        mutationFn: (data: any) => apiClient.post('/fractions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fractions-global'] });
            toast({
                title: "Fração criada",
                description: `A fração ${number} foi criada com sucesso.`,
            });
            onOpenChange(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Erro ao criar fração",
                description: error.message || "Ocorreu um erro ao criar a fração.",
            });
        }
    });

    const resetForm = () => {
        setCondominiumId('');
        setNumber('');
        setFloor('');
        setTypology('T2');
        setPermillage('');
        setMonthlyQuota('');
        setOwnerName('');
        setOwnerEmail('');
        setOwnerPhone('');
        setOccupation('PROPRIETARIO');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!condominiumId || !number || !ownerName) {
            toast({
                variant: "destructive",
                title: "Campos obrigatórios",
                description: "Por favor preencha todos os campos obrigatórios.",
            });
            return;
        }

        mutation.mutate({
            condominiumId,
            number,
            floor,
            typology,
            permillage: Number(permillage) || 0,
            monthlyQuota: Number(monthlyQuota) || 0,
            ownerName,
            ownerEmail: ownerEmail || null,
            ownerPhone: ownerPhone || null,
            occupation,
            isActive: true,
            isFollowUp: false,
            paymentStatus: 'EM_DIA',
            debtAmount: 0
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />
                        Criar Nova Fração
                    </DialogTitle>
                    <DialogDescription className="font-medium">
                        Preencha os dados abaixo para registar uma nova unidade no sistema.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Condominium Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="condo" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Condomínio *</Label>
                        <Select value={condominiumId} onValueChange={setCondominiumId}>
                            <SelectTrigger className="h-11">
                                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Selecione o condomínio" />
                            </SelectTrigger>
                            <SelectContent>
                                {condominiums.map((condo: Condominium) => (
                                    <SelectItem key={condo.id} value={condo.id}>{condo.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="number" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Identificação (Nº/Letra) *</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="number"
                                    placeholder="Ex: 1A, Esq, 12"
                                    className="pl-9 h-11 font-bold"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="floor" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Piso / Andar</Label>
                            <div className="relative">
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="floor"
                                    placeholder="Ex: 1, R/C, -1"
                                    className="pl-9 h-11"
                                    value={floor}
                                    onChange={(e) => setFloor(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="typology" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipologia</Label>
                            <Select value={typology} onValueChange={setTypology}>
                                <SelectTrigger className="h-11">
                                    <Home className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="T0">T0</SelectItem>
                                    <SelectItem value="T1">T1</SelectItem>
                                    <SelectItem value="T2">T2</SelectItem>
                                    <SelectItem value="T3">T3</SelectItem>
                                    <SelectItem value="T4">T4</SelectItem>
                                    <SelectItem value="T5">T5+</SelectItem>
                                    <SelectItem value="LOJA">Loja</SelectItem>
                                    <SelectItem value="GARAGEM">Garagem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="occupation" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ocupação</Label>
                            <Select value={occupation} onValueChange={setOccupation}>
                                <SelectTrigger className="h-11">
                                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PROPRIETARIO">Proprietário</SelectItem>
                                    <SelectItem value="ARRENDADA">Arrendada</SelectItem>
                                    <SelectItem value="DESCONHECIDO">Desconhecido</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="permillage" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Permilagem (‰)</Label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="permillage"
                                    type="number"
                                    placeholder="0"
                                    className="pl-9 h-11"
                                    value={permillage}
                                    onChange={(e) => setPermillage(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quota" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quota Mensal (€)</Label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="quota"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-9 h-11 font-bold"
                                    value={monthlyQuota}
                                    onChange={(e) => setMonthlyQuota(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Dados do Proprietário
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="ownerName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome Completo *</Label>
                                <Input
                                    id="ownerName"
                                    placeholder="Nome do proprietário"
                                    className="h-11 font-bold"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ownerEmail" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="ownerEmail"
                                            type="email"
                                            placeholder="email@exemplo.pt"
                                            className="pl-9 h-11"
                                            value={ownerEmail}
                                            onChange={(e) => setOwnerEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ownerPhone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Telefone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="ownerPhone"
                                            placeholder="912 345 678"
                                            className="pl-9 h-11"
                                            value={ownerPhone}
                                            onChange={(e) => setOwnerPhone(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-6">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="font-bold">Cancelar</Button>
                        <Button type="submit" className="font-bold px-8 shadow-md" disabled={mutation.isPending}>
                            {mutation.isPending ? "A criar..." : "Criar Fração"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
