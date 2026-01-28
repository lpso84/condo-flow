import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    Euro,
    Wrench,
    Calendar,
    File,
    Settings,
    Briefcase,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Condomínios', href: '/condominiums', icon: Building2 },
    { name: 'Frações', href: '/fractions', icon: Users },
    { name: 'Ocorrências', href: '/occurrences', icon: FileText },
    { name: 'Finanças', href: '/finances', icon: Euro },
    { name: 'Fornecedores', href: '/suppliers', icon: Briefcase },
    { name: 'Obras', href: '/projects', icon: Wrench },
    { name: 'Assembleias', href: '/assemblies', icon: Calendar },
    { name: 'Documentos', href: '/documents', icon: File },
    { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full w-64 flex-col border-r bg-card">
            <div className="flex h-16 items-center border-b px-6">
                <Building2 className="mr-2 h-6 w-6 text-primary" />
                <span className="text-lg font-bold">CondoFlow</span>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href ||
                            (item.href !== '/' && location.pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 h-5 w-5 flex-shrink-0',
                                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center">
                    <div className="ml-3">
                        <p className="text-xs font-medium text-muted-foreground">Versão 1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
