import 'dotenv/config';
import prisma from '@/lib/prisma';

async function main() {
    console.log('🔧 Corrigiendo secuencias de IDs...');

    // Corregir secuencia de PERMISOS
    try {
        await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Permiso"', 'id'), COALESCE(MAX(id) + 1, 1), false) FROM "Permiso";
        `);
        console.log('✅ Secuencia de Permisos corregida.');
    } catch (e) {
        console.error('Error en Permiso:', e);
    }

    // Corregir secuencia de ROLES
    try {
        await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Role"', 'id'), COALESCE(MAX(id) + 1, 1), false) FROM "Role";
        `);
        console.log('✅ Secuencia de Roles corregida.');
    } catch (e) {
        console.error('Error en Role:', e);
    }

    // Corregir secuencia de MODULOS
    try {
        await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Modulo"', 'id'), COALESCE(MAX(id) + 1, 1), false) FROM "Modulo";
        `);
        console.log('✅ Secuencia de Módulos corregida.');
    } catch (e) {
        console.error('Error en Modulo:', e);
    }
    
    // Corregir secuencia de PERSONAS
    try {
        await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Persona"', 'idpersona'), COALESCE(MAX(idpersona) + 1, 1), false) FROM "Persona";
        `);
        console.log('✅ Secuencia de Personas corregida.');
    } catch (e) {
        console.error('Error en Persona:', e);
    }

        // Corregir secuencia de HERRAMENTALES (si ya insertaste manuales)
    try {
        await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"Herramental"', 'id'), COALESCE(MAX(id) + 1, 1), false) FROM "Herramental";
        `);
        console.log('✅ Secuencia de Herramentales corregida.');
    } catch (e) {
        // Ignorar si la tabla está vacía
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log('✨ Listo. Intenta asignar permisos ahora.');
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });