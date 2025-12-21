import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getModulePermissions } from '@/server/queries/permissions';
import { PersonasTableWrapper } from '@/components/tables/personas/PersonasTableWrapper';

export default async function PersonasPage() {
    await requireAuth();

    // 1. Obtener Permisos
    const permissions = await getModulePermissions('personas');
    
    if (!permissions.canRead) {
        return <div className="p-8 text-center text-slate-500">No tienes acceso a este módulo.</div>;
    }

    // 2. Fetch Datos en paralelo (Personas y Roles disponibles para el form)
    const [personas, roles] = await Promise.all([
        prisma.persona.findMany({
            where: { estatus: true },
            select: {
                idpersona: true,
                nomina: true,
                nombres: true,
                apellido_paterno: true,
                apellido_materno: true,
                telefono: true,
                email_user: true,
                puesto: true,
                direccion: true,
                estatus: true,
                date_create: true,
                img: true,
                rolid: true, // Necesario para el form
                role: {
                    select: { id: true, nombre: true }
                }
            },
            orderBy: { date_create: 'desc' },
        }),
        prisma.role.findMany({
            where: { estatus: true },
            select: { id: true, nombre: true }
        })
    ]);

    return (
        <PersonasTableWrapper 
            data={personas} 
            permissions={permissions} 
            roles={roles}
        />
    );
}