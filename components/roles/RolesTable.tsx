'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings2, ShieldCheck, Users, MoreVertical, Pencil, Trash2, Key } from 'lucide-react';
import { RolePermissionSheet } from './RolePermissionSheet';
import { RoleForm } from '@/components/forms/RoleForm';
import { UserPermissions } from '@/server/queries/permissions'; // Importamos el tipo
import { deleteRoleAction } from '@/server/actions/role-actions';
import { toast } from 'sonner';

interface RolesTableProps {
    roles: any[];
    permissions: UserPermissions; // Recibimos permisos
}

export function RolesTable({ roles, permissions }: RolesTableProps) {
    // Estado para Sheets y Modales
    const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<{id: number, nombre: string} | null>(null);
    const [roleToEdit, setRoleToEdit] = useState<{id: number, nombre: string, descripcion: string | null} | null>(null);
    
    const [openPermsSheet, setOpenPermsSheet] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    // Handlers
    const handleOpenPerms = (rol: any) => {
        setSelectedRoleForPerms({ id: rol.id, nombre: rol.nombre });
        setOpenPermsSheet(true);
    };

    const handleEdit = (rol: any) => {
        setRoleToEdit(rol);
        setOpenEditModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este rol? Esta acción no se puede deshacer.')) return;
        
        const res = await deleteRoleAction(id);
        if (res.error) toast.error(res.error);
        else toast.success('Rol eliminado');
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
                                <TableCell className="text-slate-500 max-w-xs truncate">{rol.descripcion || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
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
                                        {/* Botón Permisos (Siempre visible si tienes canRead, o condicionarlo a canUpdate) */}
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
                                        {/* Menú de Acciones (Editar/Borrar) */}
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
                                                            onClick={() => handleDelete(rol.id)}
                                                            className="text-red-600 focus:text-red-600"
                                                            disabled={rol.nombre === 'Administrador' || rol._count.personas > 0}
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

            {/* Sheet de Permisos (Matriz) */}
            <RolePermissionSheet 
                open={openPermsSheet} 
                onOpenChange={setOpenPermsSheet}
                roleId={selectedRoleForPerms?.id || null}
                roleName={selectedRoleForPerms?.nombre || ''}
            />
            {/* Modal de Edición (Reutilizado) */}
            <RoleForm 
                open={openEditModal} 
                onOpenChange={setOpenEditModal}
                roleToEdit={roleToEdit}
            />
        </>
    );
}