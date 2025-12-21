import { LoginForm } from '@/components/forms/LoginForm';
import Image from 'next/image';
import logo from "@/public/logo-sm.png";

export default function LoginPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Columna Izquierda: Formulario */}
            <div className="flex flex-col justify-center items-center p-8 bg-white">
                <div className="mb-8 flex items-center gap-2 text-slate-900">
                    <Image
                        src={logo}
                        alt="Logo"
                        priority
                    />
                </div>
                <LoginForm />
            </div>

            {/* Columna Derecha: Imagen decorativa / Branding (Oculta en móvil) */}
            <div className="hidden lg:flex flex-col justify-center bg-slate-900 text-white p-12">
                <div className="max-w-md mx-auto space-y-4">
                    <blockquote className="text-lg font-medium italic">
                        "Plataforma integral para la gestión eficiente de recursos humanos y operaciones internas."
                    </blockquote>
                    <div className="flex items-center gap-4 mt-8">
                        <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                        <p className="text-sm text-slate-400">by Raul Baranda</p>
                    </div>
                </div>
            </div>
        </div>
    );
}