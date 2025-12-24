// prisma/seed.ts

// 1. Cargar variables de entorno al inicio
import 'dotenv/config';
import prisma from '@/lib/prisma';
// 2. Importar PrismaClient directamente (NO desde @/lib/prisma)
// Ajustamos la ruta para que apunte a tu cliente generado en src/generated
import fs from 'fs';
import path from 'path';

// 3. Instancia directa sin el adaptador Neon (evita el error de conexión en scripts locales)

async function main() {
    console.log('🌱 Iniciando restauración de datos...');

    const dataPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
    
    if (!fs.existsSync(dataPath)) {
        console.error('❌ Error: No se encontró el archivo prisma/seed-data.json');
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // --- 1. RESTAURAR ROLES ---
    if (data.roles) {
        console.log(`... Restaurando ${data.roles.length} Roles`);
        for (const role of data.roles) {
            await prisma.role.upsert({
                where: { id: role.id },
                update: {
                    nombre: role.nombre,
                    descripcion: role.descripcion,
                    estatus: role.estatus
                },
                create: {
                    id: role.id,
                    nombre: role.nombre,
                    descripcion: role.descripcion,
                    estatus: role.estatus
                },
            });
        }
    }

    // --- 2. RESTAURAR MODULOS ---
    if (data.modulos) {
        console.log(`... Restaurando ${data.modulos.length} Módulos`);
        // Ordenar por ID para crear padres antes que hijos
        const sortedModulos = data.modulos.sort((a: any, b: any) => a.id - b.id);
        
        for (const mod of sortedModulos) {
            await prisma.modulo.upsert({
                where: { id: mod.id },
                update: {
                    nombre: mod.nombre,
                    slug: mod.slug,
                    icono: mod.icono,
                    orden: mod.orden,
                    estatus: mod.estatus,
                    parentId: mod.parentId
                },
                create: {
                    id: mod.id,
                    nombre: mod.nombre,
                    slug: mod.slug,
                    icono: mod.icono,
                    orden: mod.orden,
                    estatus: mod.estatus,
                    parentId: mod.parentId
                },
            });
        }
    }

    // --- 3. RESTAURAR PERMISOS ---
    if (data.permisos) {
        console.log(`... Restaurando ${data.permisos.length} Permisos`);
        for (const perm of data.permisos) {
            const exists = await prisma.permiso.findUnique({
                where: { id: perm.id } 
            });

            if (!exists) {
                await prisma.permiso.create({
                    data: {
                        id: perm.id,
                        rolId: perm.rolId,
                        moduloId: perm.moduloId,
                        canRead: perm.canRead,
                        canWrite: perm.canWrite,
                        canUpdate: perm.canUpdate,
                        canDelete: perm.canDelete
                    }
                });
            }
        }
    }

    // --- 4. RESTAURAR PERSONAS ---
    if (data.personas) {
        console.log(`... Restaurando ${data.personas.length} Personas`);
        for (const p of data.personas) {
            await prisma.persona.upsert({
                where: { idpersona: p.idpersona },
                update: {
                    nomina: p.nomina,
                    nombres: p.nombres,
                    rolid: p.rolid
                },
                create: {
                    idpersona: p.idpersona,
                    nomina: p.nomina,
                    nombres: p.nombres,
                    apellido_paterno: p.apellido_paterno,
                    apellido_materno: p.apellido_materno,
                    puesto: p.puesto,
                    telefono: p.telefono,
                    email_user: p.email_user,
                    password: p.password,
                    direccion: p.direccion,
                    img: p.img,
                    rolid: p.rolid,
                    estatus: p.estatus,
                    date_create: new Date(p.date_create),
                    date_delete: p.date_delete ? new Date(p.date_delete) : null
                },
            });
        }
    }

    console.log('✅ Restauración completada exitosamente.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Error en el seed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });