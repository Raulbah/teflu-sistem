'use client';

import { useState, useTransition, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createRoleAction, updateRoleInfoAction } from '@/server/actions/role-actions';
import { toast } from 'sonner';

interface RoleFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roleToEdit?: { id: number; nombre: string; descripcion: string | null } | null; // Si viene, es edición
}

export function RoleForm({ open, onOpenChange, roleToEdit }: RoleFormProps) {
    const [isPending, startTransition] = useTransition();
    
    // Estado local del formulario
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // Rellenar datos si es edición
    useEffect(() => {
        if (open) {
            if (roleToEdit) {
                setNombre(roleToEdit.nombre);
                setDescripcion(roleToEdit.descripcion || '');
            } else {
                setNombre('');
                setDescripcion('');
            }
        }
    }, [open, roleToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);

        startTransition(async () => {
            let res;
            if (roleToEdit) {
                // Modo Edición
                res = await updateRoleInfoAction(roleToEdit.id, formData);
            } else {
                // Modo Creación
                res = await createRoleAction(formData);
            }

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(roleToEdit ? "Rol actualizado" : "Rol creado exitosamente");
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>{roleToEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Rol</Label>
                        <Input 
                            id="name" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            placeholder="Ej: Supervisor de Almacén" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="desc">Descripción</Label>
                        <Textarea 
                            id="desc" 
                            value={descripcion} 
                            onChange={(e) => setDescripcion(e.target.value)} 
                            placeholder="Breve descripción de las responsabilidades..." 
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {roleToEdit ? 'Guardar Cambios' : 'Crear Rol'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}