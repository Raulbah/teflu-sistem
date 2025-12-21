import prisma from '@/lib/prisma';
import { RolesTable } from '@/components/roles/RolesTable';
import { requireAuth } from '@/lib/auth';
import { getModulePermissions } from '@/server/queries/permissions'; // Helper
import { RoleFormWrapper } from '@/components/roles/RoleFormWrapper'; // Opcional, o usar un wrapper simple

export default async function RolesPage() {
    await requireAuth();

    // 1. Obtener Permisos del Usuario para ESTE módulo
    const permissions = await getModulePermissions('roles');

    // 2. Obtener datos
    if (!permissions.canRead) {
        return <div>Acceso denegado. No tienes permisos para ver este módulo.</div>;
    }

    const roles = await prisma.role.findMany({
        orderBy: { id: 'asc' },
        include: {
        _count: { select: { personas: true } }
        }
    });

    return (
        <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Roles y Permisos</h1>
                <p className="text-slate-500">Administra los niveles de acceso al sistema.</p>
            </div>
            
            {/* Renderizado condicional del botón CREAR */}
            {permissions.canWrite && (
                <RoleFormWrapper />
            )}
        </div>

        <RolesTable roles={roles} permissions={permissions} />
        </div>
    );
}