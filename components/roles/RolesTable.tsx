'use client';

import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShieldCheck, Users, MoreVertical, Pencil, Trash2, Key } from 'lucide-react';
import { RolePermissionSheet } from './RolePermissionSheet';
// Asegúrate de que la ruta de importación sea correcta según tu estructura
import { RoleForm } from '../forms/RoleForm'; 
import { UserPermissions } from '@/server/queries/permissions'; 
import { deleteRoleAction } from '@/server/actions/role-actions';
import { toast } from 'sonner';
import { Role } from '@/types'; 

interface RolesTableProps {
    roles: Role[];
    permissions: UserPermissions;
}

export function RolesTable({ roles, permissions }: RolesTableProps) {
    // CORRECCIÓN 1: Usar el tipo Role para el estado (o un objeto parcial si solo guardas id/nombre)
    // Aquí cambiamos a guardar todo el rol para evitar conflictos
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(null);
    // NUEVOS ESTADOS PARA BORRADO
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // CORRECCIÓN 2: Usar el tipo Role directamente. Esto soluciona tu error de 'assignable'.
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    
    const [openPermsSheet, setOpenPermsSheet] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    // Handlers
    const handleOpenPerms = (rol: Role) => {
        // CORRECCIÓN 3: Pasar el objeto completo 'rol' en lugar de construir uno nuevo incompleto.
        // Si construyes { id, nombre }, TypeScript se quejará de que faltan propiedades de 'Role'.
        setSelectedRoleForPerms(rol);
        setOpenPermsSheet(true);
    };

    const handleEdit = (rol: Role) => {
        setRoleToEdit(rol); // Ahora esto funciona porque ambos son tipo Role
        setOpenEditModal(true);
    };

    const confirmDelete = (id: number) => {
        setRoleToDelete(id);
    };

    const executeDelete = async () => {
        if (!roleToDelete) return;
        
        setIsDeleting(true);
        const res = await deleteRoleAction(roleToDelete);
        setIsDeleting(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Rol eliminado correctamente');
            setRoleToDelete(null); // Cerrar modal
        }
    };

    return (
        <>
            <div className="bg-white rounded-md border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Nombre del Rol</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Usuarios</TableHead>
                            <TableHead>Estatus</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((rol) => (
                            <TableRow key={rol.id}>
                                <TableCell className="font-bold flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                                    {rol.nombre}
                                </TableCell>
                                <TableCell className="text-slate-500 max-w-xs truncate">
                                    {rol.descripcion || '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        {/* _count es opcional en el tipo Role, usamos ? y || 0 */}
                                        <span className="font-medium">{rol._count?.personas || 0}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={rol.estatus ? "default" : "secondary"}>
                                        {rol.estatus ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {permissions.canUpdate && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleOpenPerms(rol)}
                                                className="text-slate-500 hover:text-blue-600"
                                                title="Configurar Permisos"
                                            >
                                                <Key className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {(permissions.canUpdate || permissions.canDelete) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {permissions.canUpdate && (
                                                        <DropdownMenuItem onClick={() => handleEdit(rol)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar info
                                                        </DropdownMenuItem>
                                                    )}
                                                    {permissions.canDelete && (
                                                        <DropdownMenuItem 
                                                            onClick={() => confirmDelete(rol.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                            disabled={rol.nombre === 'Administrador' || (rol._count?.personas ?? 0) > 0}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <RolePermissionSheet 
                open={openPermsSheet} 
                onOpenChange={setOpenPermsSheet}
                roleId={selectedRoleForPerms?.id || null}
                roleName={selectedRoleForPerms?.nombre || ''}
            />

            <RoleForm 
                open={openEditModal} 
                onOpenChange={setOpenEditModal}
                roleToEdit={roleToEdit}
            />
            <DeleteConfirmation 
                open={!!roleToDelete} 
                onOpenChange={(open) => !open && setRoleToDelete(null)}
                onConfirm={executeDelete}
                isDeleting={isDeleting}
                title="¿Eliminar este Rol?"
                description="Si eliminas este rol, la acción será irreversible. Asegúrate de que no haya usuarios activos dependiendo de él."
            />
        </>
    );
}