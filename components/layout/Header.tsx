'use client';

// components/layout/Header.tsx

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { UserProfile } from '@/types';

interface HeaderProps {
    user: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="hidden md:flex h-16 items-center justify-end gap-4 border-b border-slate-200 bg-white px-8 shadow-sm">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
            </Button>

            <UserNav user={user} />
        </header>
    );
}