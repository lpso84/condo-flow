import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OccurrencesPage from '../pages/OccurrencesPage';
import { OccurrenceCategory, OccurrencePriority, OccurrenceStatus } from '@condoflow/shared';
import type { PaginatedResponse, Occurrence } from '@condoflow/shared';

vi.mock('@/lib/api', () => {
    return {
        apiClient: {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
        },
    };
});

const { apiClient } = await import('@/lib/api');

const queryClient = new QueryClient();

const sampleOccurrence: Occurrence = {
    id: 'occ-1',
    condominiumId: 'condo-1',
    fractionId: null,
    title: 'Infiltração na garagem',
    description: 'Água a entrar pela parede norte da garagem.',
    category: OccurrenceCategory.INFILTRACAO,
    priority: OccurrencePriority.NORMAL,
    status: OccurrenceStatus.ABERTA,
    location: 'Garagem piso -1',
    reportedBy: 'João Silva',
    reportedAt: new Date(),
    slaDeadline: null,
    assignedSupplierId: null,
    resolvedAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('OccurrencesPage', () => {
    beforeEach(() => {
        vi.resetAllMocks();

        (apiClient.get as any).mockImplementation((endpoint: string) => {
            if (endpoint.startsWith('/occurrences/stats')) {
                return Promise.resolve({
                    open: 1,
                    urgent: 0,
                    execution: 0,
                    resolvedRecent: 0,
                    overdue: 0,
                });
            }
            if (endpoint.startsWith('/occurrences')) {
                const response: PaginatedResponse<Occurrence> = {
                    data: [sampleOccurrence],
                    total: 1,
                    page: 1,
                    pageSize: 25,
                    totalPages: 1,
                };
                return Promise.resolve(response);
            }
            if (endpoint.startsWith('/condominiums')) {
                return Promise.resolve({ data: [], total: 0, page: 1, pageSize: 100, totalPages: 1 });
            }
            if (endpoint.startsWith('/suppliers')) {
                return Promise.resolve({ data: [], total: 0, page: 1, pageSize: 100, totalPages: 1 });
            }
            return Promise.resolve({});
        });

        (apiClient.post as any).mockResolvedValue({});
    });

    const renderPage = () =>
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <OccurrencesPage />
                </QueryClientProvider>
            </BrowserRouter>
        );

    it('opens detail drawer when clicking a row and allows changing status', async () => {
        renderPage();

        // Aguarda a ocorrência aparecer na tabela
        await waitFor(() =>
            expect(screen.getByText('Infiltração na garagem')).toBeInTheDocument()
        );

        // Clicar na linha para abrir o drawer
        await userEvent.click(screen.getByText('Infiltração na garagem'));

        // Título no drawer
        await waitFor(() =>
            expect(screen.getByText('Infiltração na garagem')).toBeInTheDocument()
        );

        // Abrir menu de ações rápidas e marcar como resolvida
        const actionButtons = screen.getAllByRole('button', { name: '' });
        const menuButton = actionButtons.find((btn) => btn.className.includes('h-8')) as HTMLElement;
        await userEvent.click(menuButton);

        await userEvent.click(
            await screen.findByText(/Marcar como Resolvida/i)
        );

        await waitFor(() => {
            expect(apiClient.post).toHaveBeenCalledWith(
                expect.stringContaining('/occurrences/'),
                expect.objectContaining({ status: OccurrenceStatus.RESOLVIDA })
            );
        });
    });
});

