'use client';

import { useState } from 'react';
import { DataTable } from './data-table';
import { getColumns, PersonaCol } from './columns';
import { PersonaForm } from '@/components/forms/PersonaForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserPermissions } from '@/server/queries/permissions';

interface Props {
    data: PersonaCol[];
    permissions: UserPermissions;
    roles: { id: number; nombre: string }[];
}

export function PersonasTableWrapper({ data, permissions, roles }: Props) {
    const [openForm, setOpenForm] = useState(false);
    const [personaToEdit, setPersonaToEdit] = useState<PersonaCol | null>(null);

    // Handlers
    const handleCreate = () => {
        setPersonaToEdit(null);
        setOpenForm(true);
    };

    const handleEdit = (persona: PersonaCol) => {
        setPersonaToEdit(persona);
        setOpenForm(true);
    };

    // Generar columnas inyectando permisos y handler
    const columns = getColumns(permissions, handleEdit);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Personal</h1>
                {/* Botón Crear Protegido */}
                {permissions.canWrite && (
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Ingreso
                    </Button>
                )}
            </div>

            <DataTable columns={columns} data={data} />
            {/* Formulario Unificado */}
            <PersonaForm 
                open={openForm} 
                onOpenChange={setOpenForm}
                personaToEdit={personaToEdit}
                roles={roles}
            />
        </>
    );
}