'use client';

import { useState, useEffect } from 'react';
import { Sidebar, MobileSidebar } from './Sidebar';
import { ModuloItem } from '@/types';

interface DashboardWrapperProps {
    children: React.ReactNode;
    modules: ModuloItem[]; // Cambio de any[]
}

export function DashboardWrapper({ children, modules }: DashboardWrapperProps) {
    // Estado local para persistir preferencia (opcionalmente podrías usar cookies)
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Evitar hidratación incorrecta
    useEffect(() => {
        setIsMounted(true);
        // Leer preferencia de localStorage si deseas
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) setIsCollapsed(JSON.parse(saved));
    }, []);

    const toggleSidebar = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    };

    if (!isMounted) return null; // O un skeleton loader simple

    return (
        <div className="flex h-screen bg-slate-50/50 overflow-hidden">
            
            {/* Sidebar Desktop (Oculto en móvil) */}
            <div className="hidden md:block h-full shadow-sm z-20">
                <Sidebar 
                    modules={modules} 
                    isCollapsed={isCollapsed} 
                    toggleSidebar={toggleSidebar} 
                />
            </div>

            {/* Área de Contenido Principal */}
            <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
                
                {/* Header Móvil (Solo visible en pantallas chicas) */}
                <header className="md:hidden h-16 bg-white border-b flex items-center px-4 justify-between shrink-0">
                    <span className="text-red-600 font-bold text-lg tracking-tight truncate">
                        AB <span className="text-slate-500">TEFLU</span>
                    </span>
                    <MobileSidebar modules={modules} />
                </header>

                {/* Header Desktop (Opcional, para breadcrumbs o perfil) */}
                {/* Puedes poner aquí un header superior si lo deseas */}

                {/* Contenido Scrollable */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}