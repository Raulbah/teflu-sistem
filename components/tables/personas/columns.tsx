'use client';

import { ColumnDef, Row } from '@tanstack/react-table'; // Importamos Row para el tipado
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Edit, Trash2, Shield, User, Calendar, MapPin, Phone, Mail, Hash, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { deletePersonaAction } from '@/server/actions/persona-actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { PermissionsModal } from './permissions-modal';
import { UserPermissions } from '@/server/queries/permissions';

// 1. Definición estricta del tipo de dato (debe coincidir con tu Prisma select)
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
    date_create: Date | string; // Puede venir como string desde el servidor al serializarse
    img: string | null;
    rolid: number;
    role: { id: number; nombre: string };
};

// 2. Interface para las props del componente ActionsCell (Cero 'any')
interface ActionsCellProps {
    row: Row<PersonaCol>; // <--- Tipado estricto de TanStack Table
    permissions: UserPermissions;
    onEdit: (p: PersonaCol) => void;
}

// 3. Componente de Acciones extraído
const ActionsCell = ({ row, permissions, onEdit }: ActionsCellProps) => {
    const persona = row.original; // TypeScript infiere que esto es PersonaCol
    const [openPermissions, setOpenPermissions] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`¿Eliminar a ${persona.nombres}?`)) return;
        setLoadingDelete(true);
        const res = await deletePersonaAction(persona.idpersona);
        setLoadingDelete(false);
        if (res.error) toast.error(res.error);
        else toast.success('Eliminado correctamente');
    };

    const handleSelect = (e: Event) => e.preventDefault();

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

            {/* --- MODAL DE DETALLES (EXPEDIENTE) --- */}
            <Dialog>
                <DialogTrigger asChild>
                <DropdownMenuItem onSelect={handleSelect}>
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-150">
                <DialogHeader>
                    <DialogTitle>Detalles del Personal</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                    {/* Cabecera del Perfil */}
                    <div className="flex items-start gap-5 pb-4 border-b border-slate-100">
                    {persona.img ? (
                        <Image 
                            src={persona.img} 
                            alt="foto" 
                            width={96} 
                            height={96} 
                            className="rounded-full object-cover border-4 border-slate-50 h-24 w-24" 
                        />
                    ) : (
                        <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center border-4 border-slate-50">
                            <User className="h-10 w-10 text-slate-300" />
                        </div>
                    )}
                    <div className="space-y-1.5 flex-1">
                        <div>
                            <h3 className="font-bold text-xl text-slate-900 leading-tight">
                                {persona.nombres} {persona.apellido_paterno} {persona.apellido_materno || ''}
                            </h3>
                            <p className="text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                                <Briefcase className="h-4 w-4" />
                                {persona.puesto}
                            </p>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100">
                                {persona.role.nombre}
                            </Badge>
                            <Badge className={persona.estatus ? "bg-green-600" : "bg-red-600"}>
                                {persona.estatus ? "Activo" : "Inactivo"}
                            </Badge>
                        </div>
                    </div>
                    </div>

                    {/* Datos Detallados */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                        
                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                                <Hash className="h-3 w-3" /> Nómina
                            </span>
                            <p className="font-medium text-slate-900">{persona.nomina}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Correo Corporativo
                            </span>
                            <p className="font-medium text-slate-900 break-all">{persona.email_user}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Teléfono
                            </span>
                            <p className="font-medium text-slate-900">
                            {persona.telefono || <span className="text-slate-400 italic">No registrado</span>}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Fecha de Ingreso
                            </span>
                            <p className="font-medium text-slate-900">
                                {new Date(persona.date_create).toLocaleDateString('es-MX', { 
                                    year: 'numeric', month: 'long', day: 'numeric' 
                                })}
                            </p>
                        </div>

                        <div className="col-span-2 space-y-1">
                            <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Dirección
                            </span>
                            <p className="font-medium text-slate-900">
                                {persona.direccion || <span className="text-slate-400 italic">Sin dirección registrada</span>}
                            </p>
                        </div>
                    </div>
                </div>
                </DialogContent>
            </Dialog>

            {permissions.canUpdate && (
                <DropdownMenuItem onClick={() => onEdit(persona)}>
                <Edit className="mr-2 h-4 w-4" /> Editar Información
                </DropdownMenuItem>
            )}

            {permissions.canUpdate && (
                <DropdownMenuItem onClick={() => setOpenPermissions(true)}>
                <Shield className="mr-2 h-4 w-4" /> Permisos / Rol
                </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

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
};

// 4. Definición de Columnas
export const getColumns = (
    permissions: UserPermissions,
    onEdit: (persona: PersonaCol) => void
): ColumnDef<PersonaCol>[] => [
    {
        accessorKey: "nomina",
        header: "Nómina",
    },
    {
        accessorKey: "nombres",
        header: "Nombre",
        cell: ({ row }) => (
        <div className="flex items-center gap-3">
            {row.original.img ? (
                <Image src={row.original.img} alt="Avatar" width={32} height={32} className="rounded-full object-cover h-8 w-8" />
            ) : (
                <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {row.original.nombres.charAt(0)}
                </div>
            )}
            <div className="font-medium">
                {row.original.nombres} {row.original.apellido_paterno}
            </div>
        </div>
        )
    },
    {
        accessorKey: "role.nombre",
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
    {
        id: "actions",
        cell: ({ row }) => <ActionsCell row={row} permissions={permissions} onEdit={onEdit} />,
    },
];