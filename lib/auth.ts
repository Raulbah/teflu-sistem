import 'server-only'; // Asegura que esto nunca llegue al cliente
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'session_token';

export async function createSession(payload: { sub: string; role: string }) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload as { sub: string; role: string };
    } catch { // Quitar la variable (error) si no se usa
        return null;
    }
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

// Helper para proteger rutas/acciones
export async function requireAuth() {
    const session = await getSession();
    if (!session) redirect('/login');
    return session;
}