'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export type UserPermissions = {
    canRead: boolean;
    canWrite: boolean; // Crear
    canUpdate: boolean; // Editar
    canDelete: boolean; // Borrar
};

export async function getModulePermissions(moduleSlug: string): Promise<UserPermissions> {
    const session = await getSession();
    if (!session) return { canRead: false, canWrite: false, canUpdate: false, canDelete: false };

    const user = await prisma.persona.findUnique({
        where: { idpersona: parseInt(session.sub) },
        select: { rolid: true }
    });

    if (!user) return { canRead: false, canWrite: false, canUpdate: false, canDelete: false };

    // Buscar permisos específicos para este rol y módulo
    const permiso = await prisma.permiso.findFirst({
        where: {
        rolId: user.rolid,
        modulo: { slug: moduleSlug }
        }
    });

    if (!permiso) return { canRead: false, canWrite: false, canUpdate: false, canDelete: false };

    return {
        canRead: permiso.canRead,
        canWrite: permiso.canWrite,
        canUpdate: permiso.canUpdate,
        canDelete: permiso.canDelete
    };
}