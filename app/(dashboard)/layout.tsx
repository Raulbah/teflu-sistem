import { getSidebarData } from '@/server/queries/navigation';
import { getUserProfile } from '@/server/queries/user'; // <--- IMPORTAR
import { requireAuth } from '@/lib/auth';
import { DashboardWrapper } from '@/components/layout/DashboardWrapper';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAuth();
    
    // Ejecutamos las consultas en paralelo para no perder performance
    const [modules, user] = await Promise.all([
        getSidebarData(),
        getUserProfile() // <--- OBTENER USUARIO
    ]);

    return (
        <DashboardWrapper modules={modules} user={user}>
            {children}
        </DashboardWrapper>
    );
}