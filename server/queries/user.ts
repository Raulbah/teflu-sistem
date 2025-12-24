import 'server-only';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getUserProfile() {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.persona.findUnique({
        where: { idpersona: parseInt(session.sub) },
        select: {
            nombres: true,
            apellido_paterno: true,
            email_user: true,
            img: true,
            puesto: true
        }
    });

    return user;
}