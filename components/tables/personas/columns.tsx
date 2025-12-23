'use client';

import { ColumnDef, Row } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Edit, Trash2, Shield } from 'lucide-react';
import Image from 'next/image';
import { deletePersonaAction } from '@/server/actions/persona-actions';
import { toast } from 'sonner';
import { useState } from 'react';
import { PermissionsModal } from './permissions-modal';
import { UserPermissions } from '@/server/queries/permissions';

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

interface ActionsCellProps {
    row: Row<PersonaCol>; // <--- Tipado estricto
    permissions: UserPermissions;
    onEdit: (p: PersonaCol) => void;
}


// --- COMPONENTE EXTRAÍDO (SOLUCIONA EL ERROR DE HOOKS) ---
const ActionsCell = ({ row, permissions, onEdit }: ActionsCellProps) => {
    const persona = row.original; 
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

    // Prevenir cierre del dropdown al hacer click en items interactivos
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

            <Dialog>
                <DialogTrigger asChild>
                <DropdownMenuItem onSelect={handleSelect}>
                    <Eye className="mr-2 h-4 w-4" /> Ver detalles
                </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ficha del Empleado</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                    {persona.img ? (
                        <Image src={persona.img} alt="foto" width={80} height={80} className="rounded-full" />
                    ) : (
                        <div className="h-20 w-20 bg-slate-200 rounded-full" />
                    )}
                    <div>
                        <h3 className="font-bold">{persona.nombres} {persona.apellido_paterno}</h3>
                        <p className="text-sm text-slate-500">{persona.puesto}</p>
                    </div>
                    </div>
                    {/* Resto de detalles... */}
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

// --- DEFINICIÓN DE COLUMNAS ACTUALIZADA ---
export const getColumns = (
    permissions: UserPermissions,
    onEdit: (persona: PersonaCol) => void
): ColumnDef<PersonaCol>[] => [
    // ... (Tus otras columnas igual que antes) ...
    {
        accessorKey: "nomina",
        header: "Nómina",
    },
    {
        accessorKey: "nombres",
        header: "Nombre",
        cell: ({ row }) => (
        <div className="font-medium">{row.original.nombres} {row.original.apellido_paterno}</div>
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
        // Aquí llamamos al componente extraído
        cell: ({ row }) => <ActionsCell row={row} permissions={permissions} onEdit={onEdit} />,
    },
];