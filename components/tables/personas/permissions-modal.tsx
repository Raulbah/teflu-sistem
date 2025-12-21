'use client';

import { useState, useEffect, useTransition } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldAlert, Loader2, Save } from 'lucide-react';
// Importamos las acciones necesarias (asegúrate de agregar la que falta en el Paso 2)
import { getRoles, getRolePermissionsMatrix, updatePersonaRole } from '@/server/actions/role-actions'; 
import { toast } from 'sonner';
import { PermisoMatrix } from '@/types';

interface PermissionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    personaId: number;
    currentRolId: number;
    personaName: string;
}

export function PermissionsModal({ 
    open, 
    onOpenChange, 
    personaId, 
    currentRolId,
    personaName 
}: PermissionsModalProps) {
    const [roles, setRoles] = useState<{id: number, nombre: string}[]>([]);
    const [selectedRol, setSelectedRol] = useState<string>(currentRolId.toString());
    const [permissions, setPermissions] = useState<PermisoMatrix[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isPending, startTransition] = useTransition();

  // 1. Cargar Roles y Permisos al abrir
    useEffect(() => {
        if (open) {
        setLoadingData(true);
        // Cargar roles disponibles
        getRoles().then((rolesData) => {
            setRoles(rolesData);
            // Sincronizar selección con el rol actual
            setSelectedRol(currentRolId.toString());
            // Cargar la matriz de permisos del rol actual
            fetchPermissions(currentRolId);
        });
        }
    }, [open, currentRolId]);

    // 2. Función para cargar permisos cuando cambia el select
    const fetchPermissions = async (rolId: number) => {
        setLoadingData(true);
        try {
        // Reutilizamos la función que ya creamos para el módulo de Roles
        const perms = await getRolePermissionsMatrix(rolId);
        
        // Enriquecemos los datos (opcional, si getRolePermissionsMatrix no trae el nombre del módulo, 
        // pero para visualización rápida basta con saber si tiene permisos)
        // Nota: Si getRolePermissionsMatrix devuelve solo IDs, aquí idealmente necesitaríamos 
        // hacer un join con los módulos, pero para simplificar asumiremos que trae lo necesario
        // o ajustamos la visualización.
        
        // *Mejora:* Para esta vista rápida, llamaremos a una función que traiga el nombre del módulo.
        // Si tu getRolePermissionsMatrix no trae 'modulo', usaremos una lógica simple o 
        // asumiremos que el usuario solo ve los checks.
        
        setPermissions(perms);
        } catch (error) {
        console.error(error);
        } finally {
        setLoadingData(false);
        }
    };

    const handleRoleChange = (value: string) => {
        setSelectedRol(value);
        fetchPermissions(parseInt(value));
    };

    const handleSave = () => {
        startTransition(async () => {
        // Llamamos a la Server Action específica
        const res = await updatePersonaRole(personaId, parseInt(selectedRol));
        
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Rol de ${personaName} actualizado.`);
            onOpenChange(false);
        }
        });
    };

    const StatusBadge = ({ active }: { active: boolean }) => (
        active 
        ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="w-3 h-3" /></Badge> 
        : <Badge variant="outline" className="bg-slate-50 text-slate-300 border-slate-200"><X className="w-3 h-3" /></Badge>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
            <DialogTitle>Cambiar Rol / Permisos</DialogTitle>
            <DialogDescription>
                Usuario: <strong>{personaName}</strong>
            </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
            
            {/* Selector de Rol */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Rol Asignado</label>
                <Select value={selectedRol} onValueChange={handleRoleChange} disabled={isPending}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                    {roles.map((rol) => (
                    <SelectItem key={rol.id} value={rol.id.toString()}>
                        {rol.nombre}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            {/* Vista Previa de Permisos */}
            <div className="border rounded-md overflow-hidden">
                <div className="bg-slate-50 p-2 border-b flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldAlert className="h-3 w-3" />
                Vista previa de acceso
                </div>
                
                <div className="max-h-50 overflow-y-auto">
                    {loadingData ? (
                        <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                            <TableRow className="h-8">
                                <TableHead className="h-8 text-xs">Módulo (ID)</TableHead>
                                <TableHead className="h-8 text-xs text-center">Ver</TableHead>
                                <TableHead className="h-8 text-xs text-center">Crear</TableHead>
                                <TableHead className="h-8 text-xs text-center">Editar</TableHead>
                                <TableHead className="h-8 text-xs text-center">Borrar</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {permissions.map((perm) => (
                                <TableRow key={perm.moduloId}>
                                    <TableCell className="py-1 text-xs font-medium text-slate-600">
                                        {/* Si tu query incluye el nombre del módulo úsalo, si no, usa el ID */}
                                        {perm.modulo?.nombre}
                                    </TableCell>
                                    <TableCell className="py-1 text-center"><StatusBadge active={perm.canRead} /></TableCell>
                                    <TableCell className="py-1 text-center"><StatusBadge active={perm.canWrite} /></TableCell>
                                    <TableCell className="py-1 text-center"><StatusBadge active={perm.canUpdate} /></TableCell>
                                    <TableCell className="py-1 text-center"><StatusBadge active={perm.canDelete} /></TableCell>
                                </TableRow>
                            ))}
                            {permissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-xs py-4 text-slate-400">
                                        Sin permisos definidos.
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
            </div>

            <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending || loadingData}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Actualizar Rol
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}