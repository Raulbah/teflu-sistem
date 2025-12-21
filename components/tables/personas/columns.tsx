'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Edit, Trash2, Shield } from 'lucide-react';
import Image from 'next/image';
import { deletePersonaAction } from '@/server/actions/persona-actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { PermissionsModal } from './permissions-modal';
import { UserPermissions } from '@/server/queries/permissions'; // Importar tipo

export type PersonaCol = {
    idpersona: number;
    nomina: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    telefono: string | null;
    email_user: string;
    puesto: string;
    direccion: string | null;
    estatus: boolean;
    date_create: Date;
    img: string | null;
    rolid: number;
    role: { id: number; nombre: string };
};

// Función para generar columnas basadas en permisos y handlers
export const getColumns = (
    permissions: UserPermissions, 
    onEdit: (persona: PersonaCol) => void
): ColumnDef<PersonaCol>[] => [
    
    // ... Columnas de datos (Igual que antes) ...
    {
        accessorKey: "nomina",
        header: "Nómina",
    },
    {
        accessorKey: "nombres",
        header: "Nombre",
        cell: ({ row }) => {
            const p = row.original;
            return (
                <div className="flex items-center gap-3">
                    {p.img ? (
                        <Image src={p.img} alt={p.nombres} width={32} height={32} className="rounded-full object-cover h-8 w-8" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                            {p.nombres.charAt(0)}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-medium">{p.nombres} {p.apellido_paterno}</span>
                        <span className="text-xs text-slate-500">{p.email_user}</span>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "puesto",
        header: "Puesto",
    },
    {
        accessorKey: "role.nombre", // Accessor plano para filtro
        header: "Rol",
        cell: ({ row }) => <Badge variant="outline">{row.original.role.nombre}</Badge>
    },
    {
        accessorKey: "estatus",
        header: "Estatus",
        cell: ({ row }) => (
            <Badge className={row.original.estatus ? "bg-green-600" : "bg-red-600"}>
            {row.original.estatus ? "Activo" : "Inactivo"}
            </Badge>
        ),
    },
    
    // Columna ACCIONES DINÁMICA
    {
        id: "actions",
        cell: ({ row }) => {
        const persona = row.original;
        const [openPermissions, setOpenPermissions] = useState(false);
        const [loadingDelete, setLoadingDelete] = useState(false);

        const handleDelete = async () => {
            if(!confirm(`¿Eliminar a ${persona.nombres}?`)) return;
            setLoadingDelete(true);
            const res = await deletePersonaAction(persona.idpersona);
            setLoadingDelete(false);
            if(res.error) toast.error(res.error);
            else toast.success('Eliminado correctamente');
        };

        return (
            <>
                <PermissionsModal 
                    open={openPermissions}
                    onOpenChange={setOpenPermissions}
                    personaId={persona.idpersona}
                    currentRolId={persona.role.id}
                    personaName={`${persona.nombres} ${persona.apellido_paterno}`}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    
                    {/* MODAL VER DETALLES (Siempre visible si Read) */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Eye className="mr-2 h-4 w-4" /> Ver detalles
                            </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ficha del Empleado</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {/* ... (Contenido del detalle igual que antes) ... */}
                                <div className="flex items-center gap-4">
                                    {persona.img ? <Image src={persona.img} alt="foto" width={80} height={80} className="rounded-full" /> : <div className="h-20 w-20 bg-slate-200 rounded-full" />}
                                    <div>
                                        <h3 className="font-bold">{persona.nombres} {persona.apellido_paterno}</h3>
                                        <p className="text-sm text-slate-500">{persona.puesto}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p><strong>Nómina:</strong> {persona.nomina}</p>
                                    <p><strong>Email:</strong> {persona.email_user}</p>
                                    <p><strong>Teléfono:</strong> {persona.telefono || '-'}</p>
                                    <p><strong>Dirección:</strong> {persona.direccion || '-'}</p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* EDITAR (Condicional) */}
                    {permissions.canUpdate && (
                        <DropdownMenuItem onClick={() => onEdit(persona)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar Información
                        </DropdownMenuItem>
                    )}

                    {/* EDITAR ROL (Condicional - asumiendo que Update permite cambiar rol) */}
                    {permissions.canUpdate && (
                        <DropdownMenuItem onClick={() => setOpenPermissions(true)}>
                            <Shield className="mr-2 h-4 w-4" /> Permisos / Rol
                        </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    
                    {/* BORRAR (Condicional) */}
                    {permissions.canDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> 
                            {loadingDelete ? 'Borrando...' : 'Borrar'}
                        </DropdownMenuItem>
                    )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        );
        },
    },
];