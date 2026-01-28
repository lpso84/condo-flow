import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Settings,
    FileText,
    CreditCard,
    Bell,
    Shield,
    Database,
    Layout,
    GitBranch,
    Wrench,
    ChevronRight
} from 'lucide-react';

const settingsSections = [
    {
        title: 'Utilizadores & Perfis',
        description: 'Gerir contas de acesso, perfis e permissões dos administradores e gestores.',
        icon: Users,
        path: '/settings/users',
        color: 'bg-blue-50 text-blue-600'
    },
    {
        title: 'Categorias de Ocorrências',
        description: 'Definir tipos de problemas, SLAs por defeito e priodidades automáticas.',
        icon: Wrench,
        path: '/settings/occurrence-categories',
        color: 'bg-amber-50 text-amber-600'
    },
    {
        title: 'Estados & Workflows',
        description: 'Configurar o ciclo de vida de ocorrências e obras.',
        icon: GitBranch,
        path: '/settings/workflows',
        color: 'bg-purple-50 text-purple-600'
    },
    {
        title: 'Parâmetros Financeiros',
        description: 'Taxas de IVA, fundo de reserva, categorias de despesa e contas bancárias.',
        icon: CreditCard,
        path: '/settings/financial',
        color: 'bg-emerald-50 text-emerald-600'
    },
    {
        title: 'Regras de Assembleias',
        description: 'Prazos legais, templates de convocatória e tipos de reunião.',
        icon: Layout,
        path: '/settings/assemblies',
        color: 'bg-indigo-50 text-indigo-600'
    },
    {
        title: 'Tipos de Documento',
        description: 'Organização de arquivo digital e tags automáticas.',
        icon: FileText,
        path: '/settings/documents',
        color: 'bg-rose-50 text-rose-600'
    },
    {
        title: 'Categorias de Fornecedores',
        description: 'Especialidades e áreas de atuação para classificação de parceiros.',
        icon: Shield,
        path: '/settings/supplier-categories',
        color: 'bg-cyan-50 text-cyan-600'
    },
    {
        title: 'Notificações',
        description: 'Alertas automáticos, templates de email e preferências de envio.',
        icon: Bell,
        path: '/settings/notifications',
        color: 'bg-orange-50 text-orange-600'
    },
    {
        title: 'Geral & Branding',
        description: 'Logotipo, dados da empresa e personalização visual.',
        icon: Settings,
        path: '/settings/general',
        color: 'bg-gray-100 text-gray-600'
    },
    {
        title: 'Auditoria & Logs',
        description: 'Registo de segurança e histórico de alterações sensíveis.',
        icon: Database,
        path: '/settings/audit',
        color: 'bg-slate-100 text-slate-600'
    },
];

export default function SettingsPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
                <p className="text-gray-500 mt-1">Configure todos os parâmetros da plataforma CondoFlow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsSections.map((section) => (
                    <button
                        key={section.path}
                        onClick={() => navigate(section.path)}
                        className="group flex flex-col text-left bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200"
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${section.color} group-hover:scale-110 transition-transform`}>
                            <section.icon className="w-6 h-6" />
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-between w-full">
                            {section.title}
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </h3>

                        <p className="text-sm text-gray-500 leading-relaxed">
                            {section.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
