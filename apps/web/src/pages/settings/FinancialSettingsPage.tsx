import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Loader2, Save, Euro, Percent } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancialSettingsPage() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['global-settings'],
        queryFn: () => apiClient.get('/settings/global').then(res => res.data)
    });

    const mutation = useMutation({
        mutationFn: (data: any) => apiClient.put('/settings/global', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['global-settings'] });
            toast.success('Parâmetros financeiros atualizados com sucesso');
        },
        onError: () => {
            toast.error('Erro ao salvar as alterações');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const updates = {
            ...settings,
            defaultReserveFundPercentage: Number(formData.get('reserveFund')),
            defaultIvaPercentage: Number(formData.get('iva')),
            currency: formData.get('currency'),
        };
        mutation.mutate(updates);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Parâmetros Financeiros</h2>
                <p className="text-sm text-gray-500">Regras de cálculo e configurações monetárias.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Valores por Defeito</CardTitle>
                        <CardDescription>
                            Estes valores serão aplicados automaticamente a novos condomínios e orçamentos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Moeda do Sistema</label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    name="currency"
                                    defaultValue={settings?.currency || 'EUR'}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">IVA Padrão (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        name="iva"
                                        type="number"
                                        step="0.01"
                                        defaultValue={settings?.defaultIvaPercentage || 23}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Fundo Reserva (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        name="reserveFund"
                                        type="number"
                                        step="0.01"
                                        defaultValue={settings?.defaultReserveFundPercentage || 10}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Alterações
                    </Button>
                </div>
            </form>
        </div>
    );
}
