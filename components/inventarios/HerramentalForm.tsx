'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Save, Image as ImageIcon } from 'lucide-react';
import { createHerramentalAction, updateHerramentalAction } from '@/server/actions/herramental-actions';
import { toast } from 'sonner';
import Image from 'next/image';

// Definimos el tipo de dato que esperamos
type HerramentalData = {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    marca: string | null;
    img: string | null;
};

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    herramentalToEdit?: HerramentalData | null;
}

export function HerramentalForm({ open, onOpenChange, herramentalToEdit }: Props) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            let res;
            if (herramentalToEdit) {
                // Modo Edición
                res = await updateHerramentalAction(herramentalToEdit.id, formData);
            } else {
                // Modo Creación
                res = await createHerramentalAction(formData);
            }

            if (res?.error) {
                toast.error(res.error);
            } else {
                toast.success(herramentalToEdit ? "Herramienta actualizada" : "Herramienta agregada");
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <DialogTitle>{herramentalToEdit ? 'Editar Herramienta' : 'Agregar Nueva Herramienta'}</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* Imagen Preview (Solo si existe en edición) */}
                    {herramentalToEdit?.img && (
                        <div className="flex justify-center mb-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                                <Image src={herramentalToEdit.img} alt="Preview" fill className="object-cover" />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código</Label>
                            <Input 
                                id="codigo" name="codigo" 
                                defaultValue={herramentalToEdit?.codigo} 
                                placeholder="H-001" required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="marca">Marca</Label>
                            <Input 
                                id="marca" name="marca" 
                                defaultValue={herramentalToEdit?.marca || ''} 
                                placeholder="Stanley" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input 
                            id="nombre" name="nombre" 
                            defaultValue={herramentalToEdit?.nombre} 
                            placeholder="Taladro Percutor" required 
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <Textarea 
                            id="descripcion" name="descripcion" 
                            defaultValue={herramentalToEdit?.descripcion || ''} 
                            placeholder="Detalles..." 
                        />
                    </div>

                    {/* Input de Imagen */}
                    <div className="space-y-2">
                        <Label htmlFor="img" className="flex items-center gap-2 cursor-pointer">
                            <ImageIcon className="w-4 h-4" /> Imagen {herramentalToEdit && '(Dejar vacío para mantener)'}
                        </Label>
                        <Input id="img" name="img" type="file" accept="image/*" />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            {herramentalToEdit ? 'Guardar Cambios' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
