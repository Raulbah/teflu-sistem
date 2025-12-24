'use client';

import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';

// Definimos el tipo aquí o lo importamos de types/index.ts
type Herramental = {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    marca: string | null;
    img: string | null;
};

interface Props {
    data: Herramental;
    onEdit: (h: Herramental) => void;
    onDelete: (id: number) => void;
}

export function HerramentalCard({ data, onEdit, onDelete }: Props) {
    return (
        <div className="group relative border rounded-lg p-4 bg-white hover:shadow-md transition-all flex flex-col items-center text-center space-y-3">
            
            {/* Menú de Acciones (Flotante a la derecha) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/80 backdrop-blur-sm">
                            <MoreVertical className="h-4 w-4 text-slate-600" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(data)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onDelete(data.id)} 
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Imagen */}
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden shadow-inner relative">
                {data.img ? (
                    <Image 
                        src={data.img} 
                        alt={data.nombre} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <span className="text-xs font-bold text-slate-400">{data.codigo}</span>
                )}
            </div>

            {/* Info */}
            <div className="w-full">
                <p className="font-bold text-sm truncate px-2" title={data.nombre}>{data.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{data.marca || 'Sin marca'}</p>
            </div>

            <Badge variant="outline" className="text-xs w-full justify-center bg-slate-50">
                {data.codigo}
            </Badge>
        </div>
    );
}