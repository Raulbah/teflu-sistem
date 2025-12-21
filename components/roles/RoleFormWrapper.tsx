'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { RoleForm } from '@/components/forms/RoleForm';

export function RoleFormWrapper() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Crear Rol
            </Button>
            <RoleForm open={open} onOpenChange={setOpen} roleToEdit={null} />
        </>
    );
}