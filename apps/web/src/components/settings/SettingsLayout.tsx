import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
    Wrench
} from 'lucide-react';

const menuItems = [
    { icon: Users, label: 'Utilizadores & Perfis', path: '/settings/users' },
    { icon: Wrench, label: 'Categorias Ocorrências', path: '/settings/occurrence-categories' },
    { icon: GitBranch, label: 'Estados & Workflows', path: '/settings/workflows' },
    { icon: CreditCard, label: 'Parâmetros Financeiros', path: '/settings/financial' },
    { icon: Layout, label: 'Regras de Assembleias', path: '/settings/assemblies' },
    { icon: FileText, label: 'Tipos de Documento', path: '/settings/documents' },
    { icon: Shield, label: 'Categorias Fornecedores', path: '/settings/supplier-categories' },
    { icon: Bell, label: 'Notificações', path: '/settings/notifications' },
    { icon: Database, label: 'Auditoria & Logs', path: '/settings/audit' },
    { icon: Settings, label: 'Geral & Branding', path: '/settings/general' },
];

export function SettingsLayout() {
    return (
        <div className="flex h-full min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary-600" />
                        Configurações
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Administração do sistema</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
              `}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
