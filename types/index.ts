export interface Role {
    id: number;
    nombre: string;
    descripcion?: string | null;
    estatus?: boolean;
    _count?: { personas: number };
}

export interface ModuloItem {
    id: number;
    nombre: string;
    slug: string;
    icono: string | null;
    orden?: number;
    children?: ModuloItem[];
    parentId?: number | null;
}

export interface PermisoMatrix {
    id?: number;
    moduloId: number;
    modulo?: { nombre: string; slug: string };
    canRead: boolean;
    canWrite: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}