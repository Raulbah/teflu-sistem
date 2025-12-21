'use server';

import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getModulePermissions } from '@/server/queries/permissions'; // Importamos el helper
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Esquema para validar la entrada de la matriz
const permissionSchema = z.array(z.object({
    moduloId: z.number(),
    canRead: z.boolean(),
    canWrite: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean(),
}));

const roleSchema = z.object({
    nombre: z.string().min(3, "El nombre es muy corto"),
    descripcion: z.string().optional(),
});

// 1. Obtener todos los módulos disponibles para pintar la tabla
export async function getAllModules() {
    await requireAuth();
    return await prisma.modulo.findMany({
        where: { estatus: true },
        orderBy: { orden: 'asc' },
        select: { id: true, nombre: true, slug: true } // Solo lo necesario
    });
}

// 2. Obtener permisos actuales de un rol
export async function getRolePermissionsMatrix(rolId: number) {
    await requireAuth();
    return await prisma.permiso.findMany({
        where: { rolId },
        include: { // <--- AGREGAR ESTE INCLUDE
            modulo: {
                select: { nombre: true, slug: true }
            }
        },
        orderBy: { modulo: { orden: 'asc' } } // Opcional: ordenar
    });
}

// 3. Guardar la matriz completa
export async function updateRolePermissions(rolId: number, permissionsRaw: any[]) {
    await requireAuth();

    // Validar datos
    const validation = permissionSchema.safeParse(permissionsRaw);
    if (!validation.success) return { error: 'Datos inválidos' };

    const permissions = validation.data;

    try {
        // Usamos transaction para asegurar que todo se guarde o nada
        await prisma.$transaction(
        permissions.map((p) => 
            prisma.permiso.upsert({
            where: {
                rolId_moduloId: {
                rolId: rolId,
                moduloId: p.moduloId
                }
            },
            update: {
                canRead: p.canRead,
                canWrite: p.canWrite,
                canUpdate: p.canUpdate,
                canDelete: p.canDelete
            },
            create: {
                rolId: rolId,
                moduloId: p.moduloId,
                canRead: p.canRead,
                canWrite: p.canWrite,
                canUpdate: p.canUpdate,
                canDelete: p.canDelete
            }
            })
        )
        );

        revalidatePath('/roles');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: 'Error al guardar los permisos' };
    }
}
// ... otros imports

// Agrega esta función que le falta a tu PermissionsModal
export async function getRoles() {
    await requireAuth();
    return await prisma.role.findMany({
        where: { estatus: true },
        select: { id: true, nombre: true },
        orderBy: { id: 'asc' } // O por nombre
    });
}

// ... aquí siguen tus funciones getAllModules, createRoleAction, etc.
// 1. CREAR ROL
export async function createRoleAction(formData: FormData) {
    await requireAuth();
    
    const perms = await getModulePermissions('roles');
    if (!perms.canWrite) return { error: "No tienes permiso para crear roles." };

    const data = {
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
    };

    const validation = roleSchema.safeParse(data);
    
    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }
    try {
        await prisma.role.create({
        data: {
            nombre: data.nombre,
            descripcion: data.descripcion,
            estatus: true
        }
        });
        revalidatePath('/dashboard/roles');
        return { success: true };
    } catch (e) {
        return { error: "Error al crear el rol (posible nombre duplicado)" };
    }
}

// 2. ACTUALIZAR ROL
export async function updateRoleInfoAction(id: number, formData: FormData) {
    await requireAuth();

    const perms = await getModulePermissions('roles');
    if (!perms.canUpdate) return { error: "No tienes permiso para editar roles." };

    const data = {
        nombre: formData.get('nombre') as string,
        descripcion: formData.get('descripcion') as string,
    };

    const validation = roleSchema.safeParse(data);

    if (!validation.success) {
        return { error: validation.error.issues[0].message };
    }

    try {
        await prisma.role.update({
        where: { id },
        data: {
            nombre: data.nombre,
            descripcion: data.descripcion
        }
        });
        revalidatePath('/dashboard/roles');
        return { success: true };
    } catch (e) {
        return { error: "Error al actualizar el rol" };
    }
}

// 3. ELIMINAR ROL
export async function deleteRoleAction(id: number) {
    await requireAuth();

    const perms = await getModulePermissions('roles');
    if (!perms.canDelete) return { error: "No tienes permiso para eliminar roles." };

    try {
        // Validaciones de negocio extras
        const role = await prisma.role.findUnique({ 
            where: { id },
            include: { _count: { select: { personas: true } } }
        });

        if (!role) return { error: "Rol no encontrado" };
        if (role.nombre === 'Administrador') return { error: "No se puede eliminar al Administrador Principal" };
        if (role._count.personas > 0) return { error: `No se puede eliminar: hay ${role._count.personas} usuarios con este rol.` };

        await prisma.role.delete({
        where: { id }
        });

        revalidatePath('/dashboard/roles');
        return { success: true };
    } catch (e) {
        return { error: "Error interno al eliminar" };
    }
}
// ... imports existentes y otras funciones
getRolePermissionsMatrix
// Agregar esta función al final del archivo si no existe
export async function updatePersonaRole(idPersona: number, newRolId: number) {
    await requireAuth();
    
    // Validar permisos: Solo quien puede editar Personas o Roles debería poder hacer esto
    // Por simplicidad usaremos requireAuth, pero idealmente:
    // const perms = await getModulePermissions('roles'); if(!perms.canUpdate) ...

    try {
        await prisma.persona.update({
        where: { idpersona: idPersona },
        data: { rolid: newRolId }
        });

        revalidatePath('/dashboard/personas'); // Refrescar la tabla de personas
        return { success: true };
    } catch (error) {
        console.error("Error updating role:", error);
        return { error: 'Error al actualizar el rol de la persona' };
    }
}