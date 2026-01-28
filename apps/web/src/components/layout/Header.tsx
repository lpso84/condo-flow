import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        apiClient.logout();
        logout();
        navigate('/login');
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex items-center">
                <h2 className="text-lg font-semibold text-foreground">
                    {/* Breadcrumb placeholder or dynamic title could go here */}
                    Bem-vindo, {user?.name}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                <div className="flex items-center gap-3 border-l pl-4">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">{user?.role}</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
