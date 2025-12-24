'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { HerramentalForm } from './HerramentalForm';
import { HerramentalCard } from './HerramentalCard';
import { DeleteConfirmation } from '@/components/ui/delete-confirmation'; // Reutilizamos tu componente
import { deleteHerramentalAction } from '@/server/actions/herramental-actions';
import { toast } from 'sonner';

type Herramental = {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    marca: string | null;
    img: string | null;
};

interface Props {
    initialData?: Herramental[]; // Recibimos los datos puros
}

export function HerramentalesManager({ initialData = [] }: Props) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTool, setEditingTool] = useState<Herramental | null>(null);
    const [filter, setFilter] = useState('');
    
    // Estados para borrado
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filtrado en cliente (rápido para catálogos pequeños/medianos)
    const filteredData = initialData.filter(h => 
        h.nombre.toLowerCase().includes(filter.toLowerCase()) ||
        h.codigo.toLowerCase().includes(filter.toLowerCase()) ||
        (h.marca && h.marca.toLowerCase().includes(filter.toLowerCase()))
    );

    // Handlers
    const handleCreate = () => {
        setEditingTool(null);
        setIsFormOpen(true);
    };

    const handleEdit = (tool: Herramental) => {
        setEditingTool(tool);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        const res = await deleteHerramentalAction(deletingId);
        setIsDeleting(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Herramienta eliminada");
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Barra de Herramientas */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                        placeholder="Buscar por nombre, código o marca..." 
                        className="pl-8" 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} className="shrink-0 bg-slate-900 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Herramienta
                </Button>
            </div>

            {/* Grid de Tarjetas */}
            {filteredData.length === 0 ? (
                <div className="text-center py-10 text-slate-500 border rounded-lg bg-slate-50 border-dashed">
                    No se encontraron herramientas.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredData.map(tool => (
                        <HerramentalCard 
                            key={tool.id} 
                            data={tool} 
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            )}

            {/* Modal de Creación / Edición */}
            <HerramentalForm 
                open={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                herramentalToEdit={editingTool}
            />

            {/* Modal de Confirmación de Borrado */}
            <DeleteConfirmation 
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                title="¿Eliminar Herramienta?"
                description="Esta acción moverá la herramienta a inactiva y no aparecerá en los reportes futuros."
            />
        </div>
    );
}
