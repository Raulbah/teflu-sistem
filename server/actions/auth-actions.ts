'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
        email: z.string().email({ message: "Formato de correo inválido" }),
        password: z.string().min(1, { message: "La contraseña es obligatoria" }),
    });

    export async function loginAction(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            error: result.error.flatten().fieldErrors,
            message: "Datos inválidos" 
        };
    }

    const { email, password } = result.data;

    try {
        const user = await prisma.persona.findUnique({
            where: { email_user: email, estatus: true },
            include: { role: true },
        });

        if (!user || !user.role) {
            return { message: 'Credenciales incorrectas o acceso denegado' };
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return { message: 'Credenciales incorrectas o acceso denegado' };
        }

        await createSession({
            sub: user.idpersona.toString(),
            role: user.role.nombre,
        });

    } catch (error) {
        console.error("Login error:", error);
        return { message: 'Error interno del servidor.' };
    }
    redirect('/dashboard');
    }

    // --- ESTA ES LA FUNCIÓN QUE FALTABA ---
    export async function logoutAction() {
    await deleteSession();
    redirect('/login');
}