'use client';

import { useState, useEffect, useTransition } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import { getAllModules, getRolePermissionsMatrix, updateRolePermissions } from '@/server/actions/role-actions';
import { toast } from 'sonner';

interface RolePermissionSheetProps {
    roleId: number | null;
    roleName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type MatrixRow = {
    moduloId: number;
    moduloName: string;
    canRead: boolean;
    canWrite: boolean;
    canUpdate: boolean;
    canDelete: boolean;
};

export function RolePermissionSheet({ roleId, roleName, open, onOpenChange }: RolePermissionSheetProps) {
    const [matrix, setMatrix] = useState<MatrixRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSaving, startTransition] = useTransition();

    // Cargar datos al abrir el panel
    useEffect(() => {
        if (open && roleId) {
            loadData(roleId);
        }
    }, [open, roleId]);

    const loadData = async (id: number) => {
        setLoading(true);
        try {
            // 1. Traer todos los módulos y los permisos actuales en paralelo
            const [modules, currentPerms] = await Promise.all([
                getAllModules(),
                getRolePermissionsMatrix(id)
            ]);

            // 2. Fusionar datos para crear la matriz visual
            const initialMatrix: MatrixRow[] = modules.map(mod => {
                const perm = currentPerms.find(p => p.moduloId === mod.id);
                return {
                    moduloId: mod.id,
                    moduloName: mod.nombre,
                    canRead: perm?.canRead || false,
                    canWrite: perm?.canWrite || false,
                    canUpdate: perm?.canUpdate || false,
                    canDelete: perm?.canDelete || false,
                };
            });

            setMatrix(initialMatrix);
        } catch {
            toast.error("Error cargando permisos");
        } finally {
            setLoading(false);
        }   
    };

    // Manejar cambios en los checkboxes
    const handleCheck = (index: number, field: keyof MatrixRow, checked: boolean) => {
        setMatrix(prev => {
            const newMatrix = [...prev];
            // Creamos una copia de la fila modificando solo el campo field
            newMatrix[index] = { 
                ...newMatrix[index], 
                [field]: checked 
            };
            return newMatrix;
        });
    };

    // Guardar cambios
    const handleSave = () => {
        if (!roleId) return;

        startTransition(async () => {
            const res = await updateRolePermissions(roleId, matrix);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Permisos actualizados correctamente");
                onOpenChange(false);
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl w-full flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>Configurar Permisos: {roleName}</SheetTitle>
                    <SheetDescription>
                        Define qué puede hacer este rol en cada módulo del sistema.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="w-[40%]">Módulo</TableHead>
                                        <TableHead className="text-center">Ver</TableHead>
                                        <TableHead className="text-center">Crear</TableHead>
                                        <TableHead className="text-center">Editar</TableHead>
                                        <TableHead className="text-center">Borrar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {matrix.map((row, i) => (
                                        <TableRow key={row.moduloId} className="hover:bg-slate-50">
                                            <TableCell className="font-medium text-slate-700">
                                                {row.moduloName}
                                            </TableCell>
                                            
                                            {/* Checkbox Lectura */}
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={row.canRead} 
                                                    onCheckedChange={(c) => handleCheck(i, 'canRead', c as boolean)} 
                                                />
                                            </TableCell>
                                            
                                            {/* Checkbox Escritura */}
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={row.canWrite} 
                                                    onCheckedChange={(c) => handleCheck(i, 'canWrite', c as boolean)} 
                                                />
                                            </TableCell>
                                            
                                            {/* Checkbox Edición */}
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={row.canUpdate} 
                                                    onCheckedChange={(c) => handleCheck(i, 'canUpdate', c as boolean)} 
                                                />
                                            </TableCell>

                                            {/* Checkbox Borrado */}
                                            <TableCell className="text-center">
                                                <Checkbox 
                                                    checked={row.canDelete} 
                                                    onCheckedChange={(c) => handleCheck(i, 'canDelete', c as boolean)} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <SheetFooter className="mt-auto border-t pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || loading}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Configuración
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}