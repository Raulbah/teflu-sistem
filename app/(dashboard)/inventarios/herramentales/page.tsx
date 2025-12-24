// app/(dashboard)/inventarios/herramentales/page.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { getDashboardData } from '@/server/actions/herramental-actions';
import { ScannerInput } from '@/components/inventarios/ScannerInput';
import { InventoryStats } from '@/components/inventarios/InventoryStats';
import { HerramentalesManager } from '@/components/inventarios/HerramentalesManager'; // Usamos el nuevo Manager
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// ... imports

async function HistorialHoy() {
    const registros = await prisma.registroInventario.findMany({
        take: 20,
        orderBy: { fechaRegistro: 'desc' },
        include: {
            herramental: true,
            usuario: true
        }
    });

    return (
        <div className="border rounded-md bg-white">
            {/* AGREGAMOS ESTE DIV WRAPPER CON overflow-x-auto */}
            <div className="w-full overflow-x-auto max-w-[85vw] md:max-w-full">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* whitespace-nowrap evita que el texto se rompa feo en móvil */}
                            <TableHead className="whitespace-nowrap">Hora</TableHead>
                            <TableHead className="whitespace-nowrap">Herramienta</TableHead>
                            <TableHead className="whitespace-nowrap">Usuario</TableHead>
                            <TableHead className="whitespace-nowrap">Turno</TableHead>
                            <TableHead className="whitespace-nowrap">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {registros.map((reg) => (
                            <TableRow key={reg.id}>
                                <TableCell className="whitespace-nowrap">
                                    {reg.fechaRegistro.toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})}
                                </TableCell>
                                <TableCell className="font-medium whitespace-nowrap">{reg.herramental.nombre}</TableCell>
                                <TableCell className="whitespace-nowrap">{reg.usuario.nombres} {reg.usuario.apellido_paterno}</TableCell>
                                <TableCell><Badge variant="outline">{reg.turno}</Badge></TableCell>
                                <TableCell>
                                    <Badge className={reg.estado === 'OK' ? 'bg-green-600' : 'bg-red-600'}>
                                        {reg.estado}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {registros.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-8">Sin registros recientes</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default async function InventarioPage() {
    await requireAuth();
    const stats = await getDashboardData();

    // Obtenemos las herramientas para pasarlas al Manager (Client Component)
    const herramientas = await prisma.herramental.findMany({
        where: { estatus: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Control de Herramentales</h1>
                    <p className="text-slate-500">Gestión de inventario operativo por turnos.</p>
                </div>
            </div>

            <InventoryStats data={stats} />

            <Tabs defaultValue="operacion" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="operacion">Operación Diaria</TabsTrigger>
                    <TabsTrigger value="catalogo">Catálogo de Herramientas</TabsTrigger>
                </TabsList>

                {/* TAB 1: OPERACIÓN */}
                <TabsContent value="operacion" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <ScannerInput />
                        </div>
                        <div className="md:col-span-2 space-y-2 min-w-0"> 
                            <h3 className="font-semibold text-slate-800">Registros Recientes</h3>
                            <HistorialHoy />
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: CATÁLOGO CRUD COMPLETO */}
                <TabsContent value="catalogo">
                    {/* Pasamos los datos iniciales al componente Cliente */}
                    <HerramentalesManager initialData={herramientas} />
                </TabsContent>
            </Tabs>
        </div>
    );
}