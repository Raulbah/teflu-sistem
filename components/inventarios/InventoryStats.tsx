import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
    data: { total: number; registrados: number; faltantes: number; turnoActual: string };
}

export function InventoryStats({ data }: Props) {
    const progress = data.total > 0 ? (data.registrados / data.total) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progreso Turno {data.turnoActual}</CardTitle>
                    <ClipboardList className="h-4 w-4 text-slate-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">{data.registrados} de {data.total} escaneadas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Herramientas Faltantes</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{data.faltantes}</div>
                    <p className="text-xs text-muted-foreground">Pendientes de escanear hoy</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Inventario Total</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.total}</div>
                    <p className="text-xs text-muted-foreground">Items activos en catálogo</p>
                </CardContent>
            </Card>
        </div>
    );
}