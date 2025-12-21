'use client';

import { useState, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPersonaAction, updatePersonaAction } from '@/server/actions/persona-actions';
import { Loader2, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

// Tipos para props
interface RoleOption {
    id: number;
    nombre: string;
}

interface PersonaFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    personaToEdit?: any | null; // Objeto persona completo si es edición
    roles: RoleOption[]; // Pasamos los roles disponibles como prop
}

export function PersonaForm({ open, onOpenChange, personaToEdit, roles }: PersonaFormProps) {
    const [isPending, startTransition] = useTransition();

    // Función de envío
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        startTransition(async () => {
        let result;
        
        if (personaToEdit) {
            // Modo Edición
            result = await updatePersonaAction(personaToEdit.idpersona, formData);
        } else {
            // Modo Creación
            result = await createPersonaAction(formData);
        }
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(personaToEdit ? "Personal actualizado" : "Personal creado correctamente");
            onOpenChange(false);
        }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{personaToEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nómina</Label>
                            <Input name="nomina" placeholder="Ej: A-001" defaultValue={personaToEdit?.nomina} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Puesto</Label>
                            <Input name="puesto" placeholder="Ej: Gerente" defaultValue={personaToEdit?.puesto} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombres</Label>
                            <Input name="nombres" defaultValue={personaToEdit?.nombres} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Apellido Paterno</Label>
                            <Input name="apellido_paterno" defaultValue={personaToEdit?.apellido_paterno} required />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Apellido Materno (Opcional)</Label>
                        <Input name="apellido_materno" defaultValue={personaToEdit?.apellido_materno || ''} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Correo Corporativo</Label>
                            <Input name="email_user" type="email" defaultValue={personaToEdit?.email_user} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input name="telefono" defaultValue={personaToEdit?.telefono || ''} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Dirección</Label>
                        <Input name="direccion" defaultValue={personaToEdit?.direccion || ''} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rol de Sistema</Label>
                            <Select name="rolid" defaultValue={personaToEdit?.rolid?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => (
                                        <SelectItem key={r.id} value={r.id.toString()}>{r.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Contraseña {personaToEdit && '(Dejar vacío para mantener)'}</Label>
                            <Input 
                                name="password" 
                                type="password" 
                                placeholder={personaToEdit ? "••••••" : "Contraseña Temporal"} 
                                required={!personaToEdit} 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="block">Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            <Input type="file" name="img" accept="image/*" className="cursor-pointer" />
                        </div>
                        {personaToEdit?.img && (
                            <p className="text-xs text-slate-500">Actualmente tiene una foto cargada. Subir otra la reemplazará.</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {personaToEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}