import prisma from "@/lib/prisma";

async function main() {
    console.log('🌱 Iniciando seed de Roles...');

    // 1. PRIMERO: Aseguramos que existe el módulo PADRE (Configuración)
    const configModule = await prisma.modulo.upsert({
        where: { slug: 'configuracion' },
        update: {},
        create: {
            nombre: 'Configuración',
            slug: 'configuracion',
            icono: 'settings',
            orden: 99,
            estatus: true,
            parentId: null // Es raíz
        },
    });

    console.log(`✅ Módulo Padre asegurado: ${configModule.nombre} (ID: ${configModule.id})`);

    // 2. SEGUNDO: Ahora sí podemos crear el módulo HIJO usando configModule.id
    const rolesModule = await prisma.modulo.upsert({
        where: { slug: 'roles' },
        update: {},
        create: {
            nombre: 'Roles y Accesos',
            slug: 'roles',
            icono: 'shield-check', 
            orden: 1, // Orden dentro del submenú
            estatus: true,
            parentId: configModule.id // <--- AHORA SÍ EXISTE LA VARIABLE
        },
    });

    console.log(`✅ Módulo creado: ${rolesModule.nombre}`);

    // 3. TERCERO: Darle permisos al ADMIN para que pueda ver este nuevo módulo
    // Buscamos el rol Admin
    const adminRole = await prisma.role.findUnique({ where: { nombre: 'Administrador' } });

    if (adminRole) {
        await prisma.permiso.upsert({
            where: {
                rolId_moduloId: {
                    rolId: adminRole.id,
                    moduloId: rolesModule.id,
                },
            },
            update: {}, // Si ya existe, no hacemos nada
            create: {
                rolId: adminRole.id,
                moduloId: rolesModule.id,
                canRead: true,
                canWrite: true,
                canUpdate: true,
                canDelete: true,
            },
        });
        console.log('✅ Permisos asignados al Administrador');
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });