'use server';

import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';
import { getModulePermissions } from '@/server/queries/permissions'; // Helper de seguridad
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Helper de subida de imagen
async function uploadToCloudinary(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'empresa/perfiles' }, (error, result) => {
            if (error || !result) reject(error);
            else resolve(result.secure_url);
        }).end(buffer);
    });
}

// Schema de Validación (Zod)
const personaSchema = z.object({
    nomina: z.string().min(1, "Nómina requerida"),
    nombres: z.string().min(2, "Nombre requerido"),
    apellido_paterno: z.string().min(2, "Apellido requerido"),
    email_user: z.string().email("Correo inválido"),
    puesto: z.string().min(2, "Puesto requerido"),
    rolid: z.coerce.number().min(1, "Rol requerido"), // coerce para convertir string del select
});

// 1. CREAR PERSONA
export async function createPersonaAction(formData: FormData) {
    await requireAuth();
    
    // Seguridad RBAC
    const perms = await getModulePermissions('personas');
    if (!perms.canWrite) return { error: "No tienes permiso para crear personal." };

    const rawData = Object.fromEntries(formData);
    const validation = personaSchema.safeParse(rawData);

    if (!validation.success) return { error: validation.error.issues[0].message };

    // Validar password solo al crear
    if (!rawData.password || (rawData.password as string).length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    const imgFile = formData.get('img') as File;
    let imgUrl = null;

    if (imgFile && imgFile.size > 0) {
        try {
            imgUrl = await uploadToCloudinary(imgFile);
        } catch (e) {
            return { error: 'Error subiendo imagen' };
        }
    }

    const hashedPassword = await bcrypt.hash(rawData.password as string, 10);

    try {
        await prisma.persona.create({
            data: {
                ...validation.data, // datos validados
                apellido_materno: rawData.apellido_materno as string,
                telefono: rawData.telefono as string,
                direccion: rawData.direccion as string,
                password: hashedPassword,
                img: imgUrl,
                estatus: true,
            },
        });
        
        revalidatePath('/dashboard/personas');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { error: "El correo o nómina ya existen." };
        return { error: 'Error al crear persona en BD' };
    }
}

// 2. ACTUALIZAR PERSONA
export async function updatePersonaAction(id: number, formData: FormData) {
    await requireAuth();

    const perms = await getModulePermissions('personas');
    if (!perms.canUpdate) return { error: "No tienes permiso para editar personal." };

    const rawData = Object.fromEntries(formData);
    const validation = personaSchema.safeParse(rawData);

    if (!validation.success) return { error: validation.error.issues[0].message };

    const imgFile = formData.get('img') as File;
    let imgUrl = undefined; // undefined hace que Prisma ignore el campo si no hay nueva imagen

    if (imgFile && imgFile.size > 0) {
        try {
            imgUrl = await uploadToCloudinary(imgFile);
        } catch (e) {
            return { error: 'Error subiendo nueva imagen' };
        }
    }

    // Manejo de contraseña (opcional en edición)
    let passwordUpdate = {};
    if (rawData.password && (rawData.password as string).trim() !== '') {
        if ((rawData.password as string).length < 6) return { error: "La nueva contraseña es muy corta" };
        passwordUpdate = { password: await bcrypt.hash(rawData.password as string, 10) };
    }

    try {
        await prisma.persona.update({
            where: { idpersona: id },
            data: {
                ...validation.data,
                apellido_materno: rawData.apellido_materno as string,
                telefono: rawData.telefono as string,
                direccion: rawData.direccion as string,
                img: imgUrl, // Si es undefined, no se actualiza
                ...passwordUpdate
            },
        });

        revalidatePath('/personas');
        return { success: true };
    } catch (error) {
        return { error: 'Error al actualizar registro' };
    }
}

// 3. ELIMINAR PERSONA (Soft Delete)
export async function deletePersonaAction(id: number) {
    const session = await requireAuth(); // Obtenemos sesión para validar que no se borre a sí mismo
    
    const perms = await getModulePermissions('personas');
    if (!perms.canDelete) return { error: "No tienes permiso para eliminar personal." };

    if (parseInt(session.sub) === id) {
        return { error: "No puedes eliminar tu propia cuenta." };
    }

    try {
        await prisma.persona.update({
            where: { idpersona: id },
            data: { estatus: false, date_delete: new Date() }
        });
        
        revalidatePath('/personas');
        return { success: true };
    } catch (error) {
        return { error: 'Error al eliminar el registro' };
    }
}