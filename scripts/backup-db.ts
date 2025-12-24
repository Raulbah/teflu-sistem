import 'dotenv/config'; // Carga las variables del .env
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
// Usamos el cliente directo. Al cargar dotenv arriba, Prisma detectará DATABASE_URL automáticamente.

async function main() {
    console.log('📦 Iniciando respaldo de datos...');

    // 1. Extraer datos
    const roles = await prisma.role.findMany();
    const modulos = await prisma.modulo.findMany();
    const permisos = await prisma.permiso.findMany();
    const personas = await prisma.persona.findMany();
    
    // Si ya tuvieras herramentales y quisieras guardarlos (opcional para el futuro)
    // const herramentales = await prisma.herramental.findMany(); 

    // 2. Estructurar el objeto
    const backupData = {
        roles,
        modulos,
        permisos,
        personas,
        // herramentales 
    };

    // 3. Escribir el archivo JSON
    const dirPath = path.join(process.cwd(), 'prisma');
    
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath);
    }

    const outputPath = path.join(dirPath, 'seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));

    console.log(`✅ Respaldo guardado exitosamente en: ${outputPath}`);
}

main()
    .catch((e) => {
        console.error("❌ Error en el respaldo:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });