import { getSidebarData } from '@/server/queries/navigation';
import { requireAuth } from '@/lib/auth';
import { DashboardWrapper } from '@/components/layout/DashboardWrapper';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
  // 1. Verificación de Seguridad en Servidor
    await requireAuth();
    
    // 2. Obtener datos de navegación (Optimizado con cache de React por defecto)
    const modules = await getSidebarData();

    // 3. Renderizar el Wrapper Cliente
    return (
        <DashboardWrapper modules={modules}>
            {children}
        </DashboardWrapper>
    );
}