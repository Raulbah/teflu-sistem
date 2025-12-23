'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Importante para Mobile
import { 
    LayoutDashboard, 
    Package, 
    Settings, 
    ChevronRight, 
    PanelLeftClose, 
    LogOut, 
    Hexagon,
    ChevronDown,
    Circle,
    ShieldCheck,
    Users,
    Menu,
    LucideIcon,
    LayoutList,
    HardHat
} from 'lucide-react';
import { useState } from 'react';
import { logoutAction } from '@/server/actions/auth-actions';
import { ModuloItem } from '@/types';

// Mapeo de Iconos
const iconMap: Record<string, LucideIcon> = {
    'layout-dashboard': LayoutDashboard,
    'package': Package,
    'settings': Settings,
    'shield-check': ShieldCheck,
    'users': Users,
    'layout-list': LayoutList,
    'hard-hat': HardHat
};

// --- SUBCOMPONENTES DE NAVEGACIÓN ---

// 1. Item con Submenús (Padre)
function NavGroup({ item, isCollapsed, pathname }: { item: ModuloItem; isCollapsed: boolean; pathname: string }) {
    const Icon = iconMap[item.icono || 'package'] || Package;
    const isActiveGroup = pathname.startsWith(`/${item.slug}`); 
    const [isOpen, setIsOpen] = useState(isActiveGroup);

    if (isCollapsed) {
        return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
            <TooltipTrigger asChild>
                <Link 
                href={`/${item.slug}`} 
                className={cn(
                    "flex justify-center p-2 rounded-md transition-colors",
                    isActiveGroup ? "bg-red-50 text-red-700" : "text-slate-500 hover:bg-slate-100"
                )}
                >
                <Icon className="h-5 w-5" />
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.nombre}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        );
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "w-full justify-between font-normal hover:bg-slate-100",
                        isActiveGroup ? "text-slate-900 font-medium" : "text-slate-500"
                    )}
                >
                <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", isActiveGroup ? "text-red-600" : "text-slate-400")} />
                    <span>{item.nombre}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-4 space-y-1 py-1">
                {item.children?.map((child) => { 
                    const href = `/${child.slug}`; 
                    const isChildActive = pathname === href;

                    return (
                        <Link
                            key={child.id}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors",
                                isChildActive 
                                    ? "bg-red-50 text-red-700 font-medium" 
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                        <Circle className="h-2 w-2 opacity-50" /> 
                            {child.nombre}
                        </Link>
                    );
                })}
            </CollapsibleContent>
        </Collapsible>
    );
}

// 2. Item Simple (Sin hijos)
function NavItem({ item, isCollapsed, pathname }: { item: ModuloItem; isCollapsed: boolean; pathname: string }) {
    const Icon = iconMap[item.icono || 'package'] || Package;
    const href = item.slug === 'dashboard' ? '/dashboard' : `/${item.slug}`;
    const isActive = pathname === href;

    if (isCollapsed) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link 
                            href={href} 
                            className={cn(
                                "flex justify-center p-2 rounded-md transition-colors",
                                isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-100"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.nombre}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <Link
        href={href}
        className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
            isActive 
            ? "bg-red-50 text-red-700 font-medium" 
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        )}
        >
        <Icon className={cn("h-5 w-5", isActive ? "text-red-600" : "text-slate-400")} />
        <span>{item.nombre}</span>
        </Link>
    );
}
interface SidebarProps {
    modules: ModuloItem[]; // No any[]
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

// --- COMPONENTE PRINCIPAL SIDEBAR ---
export function Sidebar({ modules, isCollapsed, toggleSidebar }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className={cn(
            "relative flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out",
            isCollapsed ? "w-17.5" : "w-72"
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center h-16 border-b border-slate-100",
                isCollapsed ? "justify-center" : "justify-between px-4"
            )}>
                <div className={cn(
                    "items-center gap-2 overflow-hidden",
                    "hidden md:flex" 
                )}>
                    <div className="bg-red-600 p-1.5 rounded-lg shrink-0">
                        <Hexagon className="h-5 w-5 text-white fill-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-red-600 font-bold text-lg tracking-tight truncate">
                            AB<span className="text-slate-500">TEFLU</span>
                        </span>
                    )}
                </div>
                
                {!isCollapsed && (
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex h-8 w-8 text-slate-400 hover:text-slate-600">
                    <PanelLeftClose className="h-4 w-4" />
                </Button>
                )}
            </div>

            <ScrollArea className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {modules.map((mod) => {
                        if (mod.children && mod.children.length > 0) {
                        return <NavGroup key={mod.id} item={mod} isCollapsed={isCollapsed} pathname={pathname} />;
                    }
                    return <NavItem key={mod.id} item={mod} isCollapsed={isCollapsed} pathname={pathname} />;
                })}
                </nav>
            </ScrollArea>

            <div className="p-2 border-t border-slate-100">
                <form action={logoutAction}>
                    <Button variant="ghost" className={cn("w-full text-red-500", isCollapsed ? "justify-center" : "justify-start gap-3")}>
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Salir</span>}
                    </Button>
                </form>
            </div>
            
            {/* Botón flotante para expandir si está colapsado */}
            {isCollapsed && (
                <div className="absolute -right-3 top-20 hidden md:block">
                <Button 
                    onClick={toggleSidebar}
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6 rounded-full shadow-md bg-white border-slate-200 text-slate-500 hover:text-blue-600"
                >
                    <ChevronRight className="h-3 w-3" />
                </Button>
                </div>
            )}
        </div>
    );
}

// --- COMPONENTE MOBILE SIDEBAR (EL QUE FALTABA) ---
export function MobileSidebar({ modules }: { modules: ModuloItem[] }) {
    const [open, setOpen] = useState(false);
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6 text-slate-600" />
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="px-4 py-4 border-b text-left">
                <SheetTitle>Menú Principal</SheetTitle>
            </SheetHeader>
            {/* Reutilizamos el Sidebar pero forzamos isCollapsed={false} */}
            <Sidebar 
                modules={modules} 
                isCollapsed={false} 
                toggleSidebar={() => setOpen(false)} 
            />
            </SheetContent>
        </Sheet>
    );
}