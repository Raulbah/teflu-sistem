import 'server-only';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function getSidebarData() {
  const session = await getSession();
  if (!session) return [];

  const userId = parseInt(session.sub);

  const user = await prisma.persona.findUnique({
    where: { idpersona: userId },
    select: { rolid: true },
  });

  if (!user) return [];

  // Traemos permisos del usuario
  const permisos = await prisma.permiso.findMany({
    where: {
      rolId: user.rolid,
      canRead: true,
      modulo: {
        // CORRECCIÓN: Debes envolver las condiciones del módulo en "is"
        is: {
          estatus: true,
          parentId: null, // Solo traemos los padres
        },
      },
    },
    include: {
      modulo: {
        include: {
          // Para la relación "children" (uno a muchos), el filtrado directo sí funciona dentro de include
          children: {
            where: { estatus: true },
            orderBy: { orden: 'asc' },
          },
        },
      },
    },
    orderBy: {
      modulo: { orden: 'asc' },
    },
  });

  return permisos.map((p) => p.modulo);
}