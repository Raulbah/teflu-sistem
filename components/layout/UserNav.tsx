'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { logoutAction } from '@/server/actions/auth-actions';
import { UserProfile } from '@/types';

interface UserNavProps {
    user: UserProfile | null; // Tipado estricto
}

export function UserNav({ user }: UserNavProps) {
    if (!user) return <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />;

    const initials = `${user.nombres.charAt(0)}${user.apellido_paterno.charAt(0)}`.toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={user.img || ''} alt={user.nombres} className="object-cover"/>
                        <AvatarFallback className="bg-slate-900 text-white">{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.nombres} {user.apellido_paterno}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email_user}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => logoutAction()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}