'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, AlertTriangle } from "lucide-react"; // Agregamos AlertTriangle

interface DeleteConfirmationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title?: string;
    description?: string;
    confirmText?: string; // NUEVO: Para personalizar el botón
    variant?: "destructive" | "default"; // NUEVO: Para cambiar el color si no es borrado
}

export function DeleteConfirmation({
    open,
    onOpenChange,
    onConfirm,
    isDeleting,
    title = "¿Estás absolutamente seguro?",
    description = "Esta acción no se puede deshacer.",
    confirmText = "Sí, eliminar", // Valor por defecto
    variant = "destructive"
}: DeleteConfirmationProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className={`flex items-center gap-2 ${variant === 'destructive' ? 'text-red-600' : 'text-slate-900'}`}>
                        {variant === 'destructive' ? <Trash2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }} 
                        className={`${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'} text-white`}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isDeleting ? "Procesando..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}