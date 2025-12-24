'use server';

import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';
import { getTurnoActual } from '@/lib/turnos';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- VALIDACIONES ---
const herramentalSchema = z.object({
    codigo: z.string().min(1, "El código es obligatorio"),
    nombre: z.string().min(1, "El nombre es obligatorio"),
    descripcion: z.string().optional(),
    marca: z.string().optional(),
});

// --- HELPER SUBIDA IMAGEN ---
async function uploadToCloudinary(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'teflu/herramentales' }, (error, result) => {
            if (error || !result) reject(error);
            else resolve(result.secure_url);
        }).end(buffer);
    });
}

// --- ACCIONES DE ESCANEO ---

export async function registrarEscaneoAction(codigo: string) {
    const session = await requireAuth();
    const userId = parseInt(session.sub);
    
    // 1. Obtener datos de tiempo
    const { turno, fechaTurno } = getTurnoActual();

    // 2. Buscar herramienta
    const herramienta = await prisma.herramental.findUnique({
        where: { codigo, estatus: true }
    });

    if (!herramienta) {
        return { error: "Herramienta no encontrada o inactiva." };
    }

    // 3. Validar si ya fue escaneada en este turno/fecha
    const registroExistente = await prisma.registroInventario.findFirst({
        where: {
        herramentalId: herramienta.id,
        turno: turno,
        fechaTurno: fechaTurno,
        },
        include: { usuario: true } // Para decir quién la escaneó si ya existe
    });

    if (registroExistente) {
        return { 
        error: `Ya registrada en turno ${turno} por ${registroExistente.usuario.nombres}.` 
        };
    }

    // 4. Crear registro
    try {
        await prisma.registroInventario.create({
        data: {
            herramentalId: herramienta.id,
            usuarioId: userId,
            turno,
            fechaTurno,
            estado: 'OK', // Por defecto al escanear
        }
        });
        
        revalidatePath('/dashboard/inventarios/herramentales');
        return { success: true, toolName: herramienta.nombre, turno };
    } catch (error) {
        console.error(error);
        return { error: "Error al guardar el registro." };
    }
}

// --- CRUD HERRAMIENTAS ---

export async function createHerramentalAction(formData: FormData) {
    await requireAuth();
    const raw = Object.fromEntries(formData);
    const valid = herramentalSchema.safeParse(raw);

    if (!valid.success) return { error: "Datos inválidos" };

    // 1. Manejo de Imagen
    const imgFile = formData.get('img') as File;
    let imgUrl = null;
    if (imgFile && imgFile.size > 0) {
        try {
            imgUrl = await uploadToCloudinary(imgFile);
        } catch (e) {
            return { error: 'Error subiendo imagen' };
        }
    }

    try {
        await prisma.herramental.create({
        data: {
            codigo: valid.data.codigo,
            nombre: valid.data.nombre,
            descripcion: valid.data.descripcion || "",
            marca: valid.data.marca || "",
            img: imgUrl, // Guardamos URL
            estatus: true
        }
        });
        revalidatePath('/dashboard/inventarios/herramentales');
        return { success: true };
    } catch (e) {
        return { error: "El código ya existe." };
    }
}

// --- NUEVA: ACTUALIZAR ---
export async function updateHerramentalAction(id: number, formData: FormData) {
    await requireAuth();
    const raw = Object.fromEntries(formData);
    const valid = herramentalSchema.safeParse(raw);

    if (!valid.success) return { error: "Datos inválidos" };

    // 1. Manejo de Imagen (Solo actualizamos si viene una nueva)
    const imgFile = formData.get('img') as File;
    let imgUrl = undefined; // undefined hace que Prisma ignore el campo
    
    if (imgFile && imgFile.size > 0) {
        try {
            imgUrl = await uploadToCloudinary(imgFile);
        } catch (e) {
            return { error: 'Error subiendo nueva imagen' };
        }
    }

    try {
        await prisma.herramental.update({
            where: { id },
            data: {
                codigo: valid.data.codigo,
                nombre: valid.data.nombre,
                descripcion: valid.data.descripcion || "",
                marca: valid.data.marca || "",
                ...(imgUrl ? { img: imgUrl } : {}), // Solo si hay imagen nueva
            }
        });
        revalidatePath('/dashboard/inventarios/herramentales');
        return { success: true };
    } catch (e) {
        return { error: "Error al actualizar (posible código duplicado)" };
    }
}

export async function deleteHerramentalAction(id: number) {
    await requireAuth();
    try {
        await prisma.herramental.update({
            where: { id },
            data: { estatus: false } // Soft Delete
        });
        revalidatePath('/dashboard/inventarios/herramentales');
        return { success: true };
    } catch (e) {
        return { error: "Error al eliminar." };
    }
}


// --- DASHBOARD DATA ---
export async function getDashboardData() {
    const { turno, fechaTurno } = getTurnoActual();
    
    // Total de herramientas activas
    const totalHerramientas = await prisma.herramental.count({ where: { estatus: true } });
    
    // Registros del turno actual
    const registrosTurno = await prisma.registroInventario.count({
        where: { turno, fechaTurno }
    });

    return {
        total: totalHerramientas,
        registrados: registrosTurno,
        faltantes: totalHerramientas - registrosTurno,
        turnoActual: turno
    };
}